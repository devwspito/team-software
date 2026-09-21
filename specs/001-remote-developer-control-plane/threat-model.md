# Threat Model

## Assets

- Engineering project metadata and unpublished plans.
- Findings that may disclose vulnerabilities.
- API/session credentials.
- Audit integrity and release-readiness decisions.

## Trust boundaries

1. MCP client → public TLS endpoint → application.
2. Browser → dashboard authentication → read API.
3. Application → PostgreSQL.
4. Container image and dependency supply chain.

## Principal threats and controls

| Threat | Impact | Controls |
|---|---|---|
| Stolen API key | Full single-owner control | TLS, client secret store, no logs/DB persistence, rotation, constant-time compare |
| DNS rebinding / hostile browser origin | Unauthorized calls from browser | Strict Origin and Host validation, SameSite cookie, CSP |
| Prompt or tool injection | Corrupted control-plane state | Narrow schemas, server-side state machine, deterministic gate, explicit project IDs |
| Fabricated test evidence | False release readiness | Evidence provenance fields, immutable records, audit trail; future CI signatures |
| Cross-project confusion | State written to wrong project | Stable slug lookup, foreign keys, tool arguments repeat project identity |
| SQL injection | Data compromise | Tagged parameterized SQL only; unsafe SQL limited to static migration text |
| Supply-chain compromise | Server takeover | Lockfile, audit gate, non-root read-only container, SBOM/provenance required for critical tier |
| UI data exfiltration | Vulnerability disclosure | Authentication on all API routes, CSP, no third-party assets or analytics |
| Brute-force login | Credential guessing | High-entropy key; rate limiting is required before internet exposure beyond Tailscale |

## Residual risks before broader exposure

- Shared-key authorization lacks per-runtime revocation and least-privilege scopes.
- Evidence is self-reported by runtimes and not yet cryptographically bound to CI provenance.
- The UI is read-only, reducing CSRF impact; future mutation endpoints require CSRF tokens or bearer-only calls.
