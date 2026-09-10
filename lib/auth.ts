export const SESSION_DURATION_SECONDS = 96 * 60 * 60; // 96 hours (345,600 seconds)
export const COOKIE_NAME = 'orah_admin_session';

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'dario@jesusyouthpala';
}

/**
 * Standard HMAC-SHA256 using universal Web Crypto API (native in Edge Runtime & Node 18+)
 */
async function hmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Creates a signed session token that remains valid for up to 96 hours.
 */
export async function createSessionToken(): Promise<{ token: string; maxAge: number; expiresAt: number }> {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const secret = getAdminPassword();
  const signature = await hmacSha256(`orah-session-${expiresAt}`, secret);
  const token = `${expiresAt}.${signature}`;
  return { token, maxAge: SESSION_DURATION_SECONDS, expiresAt };
}

/**
 * Verifies if the session token is untampered and within its 96-hour window.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [expiresAtStr, providedSignature] = parts;
  const expiresAt = Number(expiresAtStr);
  if (isNaN(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  const secret = getAdminPassword();
  const expectedSignature = await hmacSha256(`orah-session-${expiresAt}`, secret);
  return expectedSignature === providedSignature;
}

