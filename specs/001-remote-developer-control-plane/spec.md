# Specification: Remote Developer Control Plane

Status: implementing  
Owner: Luis Correa  
Date: 2026-09-21

## Outcome

Provide one remote, vendor-neutral MCP server and visual engineering system of record that every coding runtime can use to follow the same spec-driven delivery method and report durable project state, failures, decisions, verification evidence, and release readiness.

## Users

- A developer moving between OpenCode, Codex, local model runtimes, and future MCP-compatible clients.
- A local coding model that needs small, explicit workflows and structured tools.
- A reviewer who needs an honest visual view of what is active, blocked, failing, or ready.

## User stories

### P1 — Shared engineering protocol

As a developer, I can connect any MCP-compatible runtime to one remote endpoint and obtain the same policies, prompts, project context, lifecycle, and recording tools.

Acceptance criteria:

1. The endpoint supports Streamable HTTP and MCP 2026-07-28.
2. Legacy 2025 stateless clients continue to connect during the compatibility window.
3. Every tool has a narrow schema and deterministic validation.
4. The service exposes versioned policy and workflow resources.
5. A bearer credential is required for every MCP operation.

### P1 — Durable project control plane

As a developer, I can register projects and track specs, executions, evidence, findings, and decisions independently of the runtime that produced them.

Acceptance criteria:

1. Projects have stable slugs, lifecycle state, risk tier, runtimes, repository metadata, and tags.
2. Specs use an enforced state machine and cannot skip required lifecycle boundaries.
3. Runs identify runtime, model, workflow, timestamps, outcome, and summary.
4. Verification evidence records actual check results and provenance fields.
5. Findings are idempotent by stable fingerprint.
6. Mutations produce an append-only audit event.

### P1 — Evidence-based gate

As a reviewer, I see a deterministic readiness decision based on project risk rather than an agent's confidence.

Acceptance criteria:

1. Required evidence increases monotonically from low to critical risk.
2. Only the newest evidence per check kind is authoritative.
3. Failed checks and severity thresholds block the gate.
4. Missing evidence produces `insufficient-evidence`, not pass.
5. Gate output explains missing, failed, and blocking inputs.

### P1 — Visual project management

As a developer, I can open a secured dashboard and understand the state of every project without controlling any connected runtime.

Acceptance criteria:

1. The dashboard shows all projects and highlights pass/fail/insufficient status.
2. Project detail shows active specs, risk, evidence completion, open findings, recent runs, and evidence.
3. The UI is responsive, keyboard accessible, and respects reduced motion.
4. The UI does not execute agents or access repository files.
5. Authentication uses a secure HttpOnly session established from the API key.

### P2 — Local-model efficiency

As a local model, I receive bounded context and clear instructions without loading the complete policy corpus on every request.

Acceptance criteria:

1. Read-heavy policies are MCP resources with caching hints.
2. Project snapshots are bounded to recent operational data.
3. Tools use stable names and descriptions that distinguish reads from writes.
4. Prompts define feature, fix, and review workflows without depending on one vendor.

## Constraints

- Remote MCP cannot assume access to a caller's local workspace.
- Repository content is supplied explicitly by clients when future tools require it.
- The first deployment is single-owner on a DGX Spark behind Tailscale.
- PostgreSQL is the durable store; application containers remain replaceable and read-only.
- The service must not call an LLM to compute policy or gate decisions.

## Out of scope for v1

- Starting, stopping, or steering coding runtimes from the UI.
- GitHub/GitLab synchronization.
- Multi-tenant RBAC and enterprise OIDC.
- Uploading complete repositories into the control plane.
- Automatic production deployment.

## Success measures

- OpenCode on both MacBook Air and DGX can list and call MCP tools.
- At least the `safent` and `opencode` projects are visible in the dashboard.
- A full project → spec → run → evidence → gate sequence passes an automated acceptance test.
- Unauthorized MCP and dashboard API requests return 401.
- The application passes typecheck, lint, unit tests, build, dependency audit, and container health checks.
