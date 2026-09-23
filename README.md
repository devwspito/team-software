# Developer Control Plane

A remote, vendor-neutral engineering control plane for AI coding runtimes.

It combines:

- an MCP 2026-07-28 server over stateless Streamable HTTP;
- a versioned engineering constitution and spec-driven workflows;
- durable project, specification, run, evidence, finding, and decision records;
- deterministic quality gates based on project risk;
- a secured visual dashboard;
- compatibility with current stateless 2025 MCP clients during migration.

The control plane does **not** control coding runtimes and does not assume access to their local workspaces. OpenCode, Codex, local models, and other MCP clients explicitly read context and report structured state. PostgreSQL is the system of record.

## Core invariant

An agent can propose work, but it cannot self-certify completion. A gate passes only from recorded evidence and resolved risk.

## Architecture

```text
OpenCode / Codex / local runtime
          │
          │ MCP Streamable HTTP + bearer auth
          ▼
┌─────────────────────────────────────────────┐
│ Developer Control Plane                     │
│                                             │
│ MCP resources · prompts · structured tools  │
│ Project/spec lifecycle · deterministic gate │
│ REST read API · authenticated React UI      │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
                 PostgreSQL 18
```

## Stack packs

Proven build recipes distilled from production projects. A project opts in with a
`stack:<id>` tag; the gate then also demands the stack's required evidence, and
`developer_compliance_explain` lists its concrete build gates.

| Stack | Origin | What it covers |
|---|---|---|
| `medusa-commerce` | certera-webs (baliri-supp, baliri-care) | Medusa v2 as source of truth, own Stripe checkout service, static Next.js storefronts on Firebase, packs as inventory kits, coupons/price lists, Stripe↔Medusa order and payment reconciliation, invoicing with per-store VAT, waiting room, storefront UI and photography rules, copy rules, build gates, deployment order |

MCP: `developer_stack_list`, `developer_stack_get`, resource `developer://stacks/<id>`,
prompt `developer-new-project-from-stack`. REST: `GET /api/stacks`, `GET /api/stacks/:id`.

## Development

Requires Node.js 24+ and Docker.

```bash
cd control-plane
npm ci
npm run check
```

`npm run check` is the local merge gate: strict typecheck, ESLint, unit tests, server build, and web build.

## Deployment

```bash
cd control-plane
cp .env.example .env
# Replace every placeholder with an independent random secret.
docker compose up --build -d
curl http://127.0.0.1:8787/health/ready
```

The Compose service binds only to loopback. Put Tailscale Serve/Funnel or another authenticated TLS gateway in front of it.

Current Google Cloud deployment on the Friendog VM:

- dashboard: `https://developer-34-22-126-68.sslip.io/`
- MCP: `https://developer-34-22-126-68.sslip.io/mcp`
- local health probe: `http://127.0.0.1:8787/health/ready`

The service is not hosted on either development machine. Caddy on `friendog-enterprise` is the only public ingress; the application and its PostgreSQL database remain isolated Docker services.

## OpenCode

```jsonc
{
  "mcp": {
    "developer": {
      "type": "remote",
      "url": "https://developer.example.com/mcp",
      "enabled": true,
      "oauth": false,
      "headers": {
        "Authorization": "Bearer {env:DEVELOPER_MCP_API_KEY}",
        "X-Developer-Runtime": "opencode"
      }
    }
  }
}
```

Keep the API key in the environment or client secret store, never in a committed config file.

## MCP surface

Resources:

- `developer://policy/core`
- `developer://workflow/spec-driven-development`

Prompts:

- `developer-feature`
- `developer-fix`
- `developer-review`

Tools cover projects, specs, runs, evidence, findings, decisions, snapshots, and gates. See [the contract](specs/001-remote-developer-control-plane/contracts/mcp.md).

`developer_compliance_explain` is the mandatory completion check for coding models. It returns every requirement, its current status, why it exists, suggested commands, blocking findings, and ordered remediation actions. A model must repeat it until `decision=pass` before claiming completion.

## Specification

This product dogfoods its own method. The canonical v1 artifacts live in [specs/001-remote-developer-control-plane](specs/001-remote-developer-control-plane), and the governing rules live in [.specify/memory/constitution.md](.specify/memory/constitution.md).

## Security posture

- bearer authentication on MCP;
- HttpOnly, Secure, SameSite dashboard session;
- Origin and Host validation;
- parameterized SQL and database constraints;
- non-root, read-only, capability-free application container;
- no external UI assets, telemetry, or analytics;
- append-only mutation audit trail.

The initial shared key is intended for a single-owner Tailscale deployment. Multi-user or public enterprise use requires OIDC, scoped authorization, rate limiting, and signed evidence provenance.

MIT licensed.
