import { describe, expect, it } from 'vitest';
import { apiKeyAuthorized, createSessionToken, verifySessionToken } from './auth.js';

describe('authentication primitives', () => {
  it('accepts only the exact bearer token', () => {
    expect(apiKeyAuthorized('Bearer correct-key', 'correct-key')).toBe(true);
    expect(apiKeyAuthorized('Bearer wrong-key', 'correct-key')).toBe(false);
    expect(apiKeyAuthorized(undefined, 'correct-key')).toBe(false);
  });

  it('round-trips an integrity-protected session', () => {
    const token = createSessionToken('a-secure-secret-that-is-long-enough');
    expect(verifySessionToken(token, 'a-secure-secret-that-is-long-enough')).toBe(true);
    expect(verifySessionToken(`${token}tampered`, 'a-secure-secret-that-is-long-enough')).toBe(false);
  });

  it('rejects an expired session', () => {
    const token = createSessionToken('a-secure-secret-that-is-long-enough', -1);
    expect(verifySessionToken(token, 'a-secure-secret-that-is-long-enough')).toBe(false);
  });
});
