import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isServerSupabaseConfigured } from '@/lib/supabase-server';
import { verifySessionToken, COOKIE_NAME, getAdminPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const adminPassword = getAdminPassword();
    const authHeader = req.headers.get('x-admin-password') || req.headers.get('authorization')?.replace('Bearer ', '');
    const sessionCookie = req.cookies.get(COOKIE_NAME)?.value;
    const isValidSession = await verifySessionToken(sessionCookie);
    const hasValidHeader = Boolean(authHeader && authHeader === adminPassword);

    if (!isValidSession && !hasValidHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isServerSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ error: 'Database client unconfigured' }, { status: 500 });
    }

    const { data: settings, error } = await supabaseAdmin
      .from('fw_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminPassword = getAdminPassword();
    const authHeader = req.headers.get('x-admin-password') || req.headers.get('authorization')?.replace('Bearer ', '');
    const sessionCookie = req.cookies.get(COOKIE_NAME)?.value;
    const isValidSession = await verifySessionToken(sessionCookie);
    const hasValidHeader = Boolean(authHeader && authHeader === adminPassword);

    if (!isValidSession && !hasValidHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { target_amount, upi_vpa, upi_payee_name, event_name, banner_image_url } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (target_amount !== undefined) {
      const parsedTarget = Number(target_amount);
      if (isNaN(parsedTarget) || parsedTarget <= 0) {
        return NextResponse.json({ error: 'Valid target amount is required' }, { status: 400 });
      }
      updates.target_amount = parsedTarget;
    }

    if (upi_vpa !== undefined) {
      if (typeof upi_vpa !== 'string' || !upi_vpa.trim().includes('@')) {
        return NextResponse.json({ error: 'Valid UPI VPA ID containing @ is required' }, { status: 400 });
      }
      updates.upi_vpa = upi_vpa.trim();
    }

    if (upi_payee_name !== undefined) {
      if (typeof upi_payee_name !== 'string' || upi_payee_name.trim().length === 0) {
        return NextResponse.json({ error: 'Payee name is required' }, { status: 400 });
      }
      updates.upi_payee_name = upi_payee_name.trim();
    }

    if (event_name !== undefined && typeof event_name === 'string') {
      updates.event_name = event_name.trim();
    }

    if (banner_image_url !== undefined && typeof banner_image_url === 'string') {
      updates.banner_image_url = banner_image_url.trim();
    }

    if (!isServerSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({
        success: true,
        source: 'local_mock',
        settings: { id: 1, ...updates },
      });
    }

    // Update in Supabase using service role key (bypassing anon RLS restriction)
    const { data: updated, error } = await supabaseAdmin
      .from('fw_settings')
      .update(updates)
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      console.error('Failed to update fw_settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully in database.',
      source: 'database',
      settings: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

