# Implementation Plan

## Constitution check — pre-design

Pass. The product makes evidence, explicit state, bounded context, contract-first design, and human authority first-class. The UI is observational, not an agent command surface.

## Architecture

The system is a modular monolith with four boundaries:

1. **Protocol boundary** — official MCP TypeScript SDK v2, modern stateless requests plus legacy stateless compatibility.
2. **Application/domain boundary** — lifecycle transitions, risk policy, gate evaluation, and use cases independent of HTTP and PostgreSQL.
3. **Persistence boundary** — PostgreSQL repositories and append-only audit events.
4. **Presentation boundary** — authenticated REST read API and React dashboard.

No runtime identity is inferred from a transport session. Every durable relationship uses project, spec, run, finding, or evidence identifiers.

## Technology

- Node.js 24 LTS in a pinned container family.
- TypeScript strict mode with unchecked-index and exact-optional checks.
- MCP TypeScript SDK 2.0 implementing protocol 2026-07-28.
- Hono for a small Web Standards HTTP surface.
- PostgreSQL 18 for durable relational and JSONB state.
- React 19 + Vite 8 for the dashboard.
- Zod 4 at every external input boundary.
- Vitest 5 and ESLint 10 in the mandatory build gate.

## Deployment

- `database` and `control-plane` containers under Docker Compose.
- App port bound to `127.0.0.1:8787` only.
- Tailscale Serve/Funnel terminates public TLS and routes `/developer` or a dedicated hostname.
- MCP requests use bearer authentication; dashboard login exchanges the same secret for a short HttpOnly session.
- Application container is read-only, non-root, capability-free, and uses `no-new-privileges`.

## Constitution check — post-design

Pass with one documented compromise: v1 uses a shared API key instead of OIDC. The key is acceptable for a single-owner Tailscale deployment, is never persisted in the database, and is replaceable without schema changes. Multi-user deployment must introduce OIDC and scoped authorization before use.
