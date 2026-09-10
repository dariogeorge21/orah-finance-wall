import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isServerSupabaseConfigured } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    const authHeader = req.headers.get('x-admin-password') || req.headers.get('authorization')?.replace('Bearer ', '');

    if (!adminPassword || authHeader !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized. Invalid admin password.' }, { status: 401 });
    }

    if (!isServerSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: 'Running in local fallback mode. Local state reset.',
        source: 'local'
      });
    }

    // Delete all records from fw_contributions
    const { error: deleteError } = await supabaseAdmin
      .from('fw_contributions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('Failed to clear fw_contributions:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Reset is_completed in fw_settings
    await supabaseAdmin
      .from('fw_settings')
      .update({ is_completed: false, updated_at: new Date().toISOString() })
      .eq('id', 1);

    return NextResponse.json({
      success: true,
      message: 'All contributions cleared. Production wall successfully reset to ₹0.',
      source: 'supabase',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

