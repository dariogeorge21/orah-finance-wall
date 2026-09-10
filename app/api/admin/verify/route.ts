import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isServerSupabaseConfigured } from '@/lib/supabase-server';
import { pickWeightedTiles } from '@/lib/reveal-algorithm';

export async function POST(req: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    const authHeader = req.headers.get('x-admin-password') || req.headers.get('authorization')?.replace('Bearer ', '');

    if (!adminPassword || authHeader !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized. Invalid admin credentials.' }, { status: 401 });
    }

    const body = await req.json();
    const { contributionId, action } = body;

    if (!contributionId || !['verify', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Missing contributionId or valid action (verify|reject)' }, { status: 400 });
    }

    if (!isServerSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase server client not configured' }, { status: 500 });
    }

    if (action === 'reject') {
      const { error } = await supabaseAdmin
        .from('fw_contributions')
        .update({ status: 'rejected' })
        .eq('id', contributionId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'rejected', id: contributionId });
    }

    // Action === 'verify'
    // 1. Fetch contribution
    const { data: targetContrib, error: fetchErr } = await supabaseAdmin
      .from('fw_contributions')
      .select('*')
      .eq('id', contributionId)
      .single();

    if (fetchErr || !targetContrib) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    if (targetContrib.status === 'verified') {
      return NextResponse.json({ success: true, message: 'Already verified', contribution: targetContrib });
    }

    // 2. Fetch settings
    const { data: settings } = await supabaseAdmin
      .from('fw_settings')
      .select('*')
      .eq('id', 1)
      .single();

    const targetAmount = settings?.target_amount || 150000;
    const gridCols = settings?.grid_cols || 40;
    const gridRows = settings?.grid_rows || 24;
    const totalTiles = gridCols * gridRows;

    // 3. Fetch currently revealed tiles
    const { data: allVerified } = await supabaseAdmin
      .from('fw_contributions')
      .select('revealed_tile_ids')
      .eq('status', 'verified');

    const currentlyRevealed = new Set<number>();
    allVerified?.forEach((item: { revealed_tile_ids?: number[] }) => {
      if (Array.isArray(item.revealed_tile_ids)) {
        item.revealed_tile_ids.forEach((t) => currentlyRevealed.add(t));
      }
    });

    // 4. Calculate count to reveal and pick weighted organic tiles
    const countToReveal = Math.max(1, Math.round((Number(targetContrib.amount) / targetAmount) * totalTiles));
    const newTiles = pickWeightedTiles(currentlyRevealed, countToReveal, gridCols, gridRows);

    // 5. Update database row using service role
    const verifiedAt = new Date().toISOString();
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('fw_contributions')
      .update({
        status: 'verified',
        verified_at: verifiedAt,
        revealed_tile_ids: newTiles,
      })
      .eq('id', contributionId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      action: 'verified',
      contribution: updated,
      revealed_tiles_count: newTiles.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
