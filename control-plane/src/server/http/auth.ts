import { createHmac, timingSafeEqual } from 'node:crypto';
import { getCookie } from 'hono/cookie';
import type { Context, Next } from 'hono';
import type { AppConfig } from '../config.js';

const SESSION_COOKIE = '__Host-developer_session';

export function apiKeyAuthorized(authorization: string | undefined, expected: string): boolean {
  if (!authorization?.startsWith('Bearer ')) return false;
  return safeEqual(authorization.slice('Bearer '.length), expected);
}

export function createSessionToken(secret: string, lifetimeSeconds = 43_200): string {
  const payload = Buffer.from(
    JSON.stringify({ version: 1, expiresAt: Math.floor(Date.now() / 1000) + lifetimeSeconds }),
  ).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra !== undefined || !safeEqual(signature, sign(payload, secret))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      version?: unknown;
      expiresAt?: unknown;
    };
    return data.version === 1 && typeof data.expiresAt === 'number' && data.expiresAt > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function requireDashboardAuth(config: AppConfig) {
  return async (context: Context, next: Next): Promise<Response | void> => {
    const bearer = apiKeyAuthorized(context.req.header('authorization'), config.apiKey);
    const session = verifySessionToken(getCookie(context, SESSION_COOKIE), config.sessionSecret);
    if (!bearer && !session) return context.json({ error: 'unauthorized' }, 401);
    await next();
  };
}

export function validateRequestBoundary(request: Request, config: AppConfig): string | null {
  const origin = request.headers.get('origin');
  if (origin && !config.allowedOrigins.has(origin)) return 'origin_not_allowed';
  const host = request.headers.get('host');
  if (host && !config.allowedHosts.has(host)) return 'host_not_allowed';
  return null;
}

export const sessionCookieName = SESSION_COOKIE;

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(left: string, right: string): boolean {
  const leftDigest = createHmac('sha256', 'developer-constant-time').update(left).digest();
  const rightDigest = createHmac('sha256', 'developer-constant-time').update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}
