import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isServerSupabaseConfigured } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    const authHeader = req.headers.get('x-admin-password') || req.headers.get('authorization')?.replace('Bearer ', '');

    if (!adminPassword || authHeader !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isServerSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase server client not configured' }, { status: 500 });
    }

    // Fetch pending and all contributions
    const { data: contributions, error } = await supabaseAdmin
      .from('contributions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      contributions: contributions || [],
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

