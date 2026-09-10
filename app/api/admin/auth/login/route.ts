import { NextRequest, NextResponse } from 'next/server';
import { getAdminPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    const expectedPassword = getAdminPassword();

    if (!password || typeof password !== 'string' || password.trim() !== expectedPassword.trim()) {
      return NextResponse.json(
        { error: 'Incorrect password. Please verify the admin credentials.' },
        { status: 401 }
      );
    }

    const { token, maxAge, expiresAt } = await createSessionToken();

    const response = NextResponse.json({
      success: true,
      message: 'Authenticated successfully. Session valid for 96 hours.',
      expiresAt,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      maxAge,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
