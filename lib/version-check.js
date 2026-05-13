'use strict';

/**
 * Best-effort check of the latest version on GitHub main.
 *
 * Fetches `raw.githubusercontent.com/.../main/package.json` directly (no API
 * rate limit). Bounded by a configurable timeout. Returns the remote version
 * string on success, `null` on any failure (offline, slow, parsing error,
 * Node without fetch). Callers must handle `null` silently — this is a hint,
 * not a contract.
 *
 * Used by `update` to warn when the running package version (from a stale
 * npx cache) is behind what's actually on GitHub.
 *
 * @param {object} [options]
 * @param {number} [options.timeoutMs=2000]
 * @returns {Promise<string|null>}
 */
async function checkRemoteVersion({ timeoutMs = 2000 } = {}) {
  if (typeof fetch === 'undefined') return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/devwspito/team-software/main/package.json',
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.version === 'string' ? data.version : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Compare two semver-ish strings. Returns:
 *   -1 if `a < b`
 *    0 if equal
 *    1 if `a > b`
 *
 * Lightweight — only handles MAJOR.MINOR.PATCH numeric segments. Pre-release
 * tags are ignored.
 */
function compareVersions(a, b) {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da < db) return -1;
    if (da > db) return 1;
  }
  return 0;
}

module.exports = { checkRemoteVersion, compareVersions };
