import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isServerSupabaseConfigured } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contributorName, amount, upiTransactionId, prayerNote, referenceId } = body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Valid contribution amount is required' }, { status: 400 });
    }

    const cleanRefId = referenceId || `ORAH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newRecord = {
      contributor_name: (contributorName && contributorName.trim()) ? contributorName.trim() : 'Anonymous Supporter',
      amount: parsedAmount,
      reference_id: cleanRefId,
      upi_transaction_id: (typeof upiTransactionId === 'string' && upiTransactionId.trim()) 
        ? upiTransactionId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') 
        : null,
      prayer_note: (prayerNote && prayerNote.trim()) ? prayerNote.trim() : null,
      status: 'pending',
      revealed_tile_ids: [],
    };

    if (!isServerSupabaseConfigured || !supabaseAdmin) {
      // Return the record for local mock mode
      return NextResponse.json({
        success: true,
        contribution: { ...newRecord, id: `local-${Date.now()}`, created_at: new Date().toISOString() },
        source: 'local_fallback',
      });
    }

    // 1. Check for existing contribution with this reference_id (idempotency guard)
    if (cleanRefId) {
      const { data: existingRef } = await supabaseAdmin
        .from('fw_contributions')
        .select('*')
        .eq('reference_id', cleanRefId)
        .maybeSingle();

      if (existingRef) {
        return NextResponse.json({
          success: true,
          contribution: existingRef,
          source: 'deduplicated_reference',
        });
      }
    }

    // 2. Short time-window deduplication (within last 4 seconds) for identical name + amount
    const fourSecondsAgo = new Date(Date.now() - 4000).toISOString();
    const { data: recentDup } = await supabaseAdmin
      .from('fw_contributions')
      .select('*')
      .eq('contributor_name', newRecord.contributor_name)
      .eq('amount', newRecord.amount)
      .eq('status', 'pending')
      .gte('created_at', fourSecondsAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentDup) {
      return NextResponse.json({
        success: true,
        contribution: recentDup,
        source: 'deduplicated_time_window',
      });
    }

    // Insert into fw_contributions table using service role key
    const { data, error } = await supabaseAdmin
      .from('fw_contributions')
      .insert([newRecord])
      .select()
      .single();

    if (error) {
      console.error('Supabase fw_contributions insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      contribution: data,
      source: 'supabase',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('Submit API error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

