import { NextResponse } from 'next/server';
import { supabaseAdmin, isServerSupabaseConfigured } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (!isServerSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({
        success: true,
        source: 'fallback',
        settings: {
          id: 1,
          event_name: 'ORAH 2026',
          target_amount: 150000,
          upi_vpa: '7838403506@rapl',
          upi_payee_name: 'Dario George',
          banner_image_url: '/jesusAndChildren.jpg',
          grid_cols: 40,
          grid_rows: 24,
          is_completed: false,
        },
      });
    }

    // Fetch live settings row from database
    const { data: settings, error } = await supabaseAdmin
      .from('fw_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error('Failed to query fw_settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (settings) {
      if (settings.banner_image_url === '/orah-banner.svg' || settings.banner_image_url === '/orah-banner.jpg') {
        settings.banner_image_url = '/jesusAndChildren.jpg';
      }
      return NextResponse.json({
        success: true,
        source: 'database',
        settings,
      });
    }
    // If row 1 does not exist yet, seed initial row
    const initialRow = {
      id: 1,
      event_name: 'ORAH 2026',
      target_amount: 150000,
      upi_vpa: '7838403506@rapl',
      upi_payee_name: 'Dario George',
      banner_image_url: '/jesusAndChildren.jpg',
      grid_cols: 40,
      grid_rows: 24,
      is_completed: false,
      updated_at: new Date().toISOString(),
    };

    const { data: seeded, error: seedError } = await supabaseAdmin
      .from('fw_settings')
      .insert([initialRow])
      .select()
      .single();

    if (seedError) {
      return NextResponse.json({ error: seedError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      source: 'database_seeded',
      settings: seeded,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

