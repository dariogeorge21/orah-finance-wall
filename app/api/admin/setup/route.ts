import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isServerSupabaseConfigured } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    const authHeader = req.headers.get('x-admin-password') || req.headers.get('authorization')?.replace('Bearer ', '');

    if (!adminPassword || authHeader !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isServerSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase server client not configured' }, { status: 500 });
    }

    // Check if settings row exists
    const { data: existingSettings, error: selectErr } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (!existingSettings) {
      // Insert default settings
      await supabaseAdmin.from('settings').upsert({
        id: 1,
        event_name: process.env.NEXT_PUBLIC_DEFAULT_EVENT_NAME || 'ORAH 2026',
        target_amount: Number(process.env.NEXT_PUBLIC_DEFAULT_TARGET_AMOUNT) || 100000,
        upi_vpa: process.env.NEXT_PUBLIC_DEFAULT_UPI_VPA || '7838403506@rapl',
        upi_payee_name: process.env.NEXT_PUBLIC_DEFAULT_UPI_PAYEE || 'Dario George',
        banner_image_url: '/jesusAndChildren.jpg',
        grid_cols: 40,
        grid_rows: 24,
        is_completed: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase tables verified and ready.',
      configured: true,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

