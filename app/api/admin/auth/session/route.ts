import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(COOKIE_NAME)?.value;
    const isValid = await verifySessionToken(sessionCookie);

    if (!isValid) {
      return NextResponse.json({ authenticated: false });
    }

    const expiresAtStr = sessionCookie?.split('.')[0];
    const expiresAt = expiresAtStr ? Number(expiresAtStr) : null;

    return NextResponse.json({
      authenticated: true,
      expiresAt,
      remainingHours: expiresAt ? Math.max(0, Math.round((expiresAt - Date.now()) / (3600 * 1000))) : 96,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg, authenticated: false }, { status: 500 });
  }
}
