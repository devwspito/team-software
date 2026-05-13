# Memory Protocol

This directory is the **project's persistent memory**. It survives across Claude Code sessions and is the handoff mechanism between specialist agents.

> Managed by [team-software](https://github.com/devwspito/team-software). Safe to commit to your repo.

## Structure

```
.claude/memory/
├── INDEX.md            # One-line index of all artifacts (always read first)
├── PROTOCOL.md         # This file
├── dossiers/           # Output of requirements-analyst (one per feature)
├── plans/              # Output of tech-lead (blueprints, one per feature)
├── decisions/          # Architectural decisions (ADR-lite, one per decision)
├── threat-models/      # Output of security-engineer STRIDE sessions
└── artifacts/          # Any other reusable output (contracts, schemas, etc)
```

## Filenames

`YYYY-MM-DD-<kebab-slug>.md` — date prefix makes chronological order trivial and prevents collisions.

Examples:
- `dossiers/2026-05-13-stripe-connect.md`
- `plans/2026-05-13-stripe-connect.md`
- `decisions/2026-05-13-postgres-vs-mongo.md`
- `threat-models/2026-05-13-admin-users-endpoint.md`

When a feature has multiple agents producing artifacts, they share the slug across categories so the relationship is visible.

## INDEX.md format

One line per artifact, newest at top. Each line:

```
- [<category>] YYYY-MM-DD <slug> — <one-line summary> — <status?>
```

Statuses: `active`, `superseded by <slug>`, `archived`.

Example:
```
- [plan] 2026-05-14 stripe-connect — Blueprint para Stripe Connect marketplace, 8 tareas — active
- [dossier] 2026-05-14 stripe-connect — Feature de pagos a vendedores con split — active
- [decision] 2026-05-13 postgres-vs-mongo — Elegir Postgres por consistencia transaccional — active
- [dossier] 2026-04-22 magic-link-auth — Login passwordless — superseded by 2026-05-01 magic-link-auth-v2
```

## Read rules (when to check memory)

**At the start of every slash command pipeline:**
1. Read `INDEX.md`.
2. If there's an artifact matching the current task (by slug or topic), **mention it to the user and ask whether to reuse or start fresh**.
3. If nothing relevant, proceed normally.

**Before invoking a specialist agent:**
- If a relevant artifact exists, include its contents in the agent's input. The agent has no filesystem awareness of memory — the parent thread is the router.

## Write rules (when to save to memory)

**Save an artifact when:**
- An agent produces output that another agent (or a future session) might consume.
- A decision is made that affects future work (architectural, security, data, infra).
- A threat model is completed (always save).
- A pipeline phase completes with a reusable output.

**Do NOT save:**
- Intermediate thoughts or scratch work.
- Failed attempts (unless the failure itself is the lesson — save as a `decision` with status).
- Anything sensitive (secrets, real PII, credentials). Use `<REDACTED>` placeholders if the artifact references them.

**Writing protocol:**
1. Create the file in the appropriate subdir with `YYYY-MM-DD-<slug>.md` filename.
2. Frontmatter with: `slug`, `category`, `feature`, `agent`, `date`, `status`.
3. Append a line to `INDEX.md` (newest at top).
4. Confirm to the user: `📝 Guardado en memory: <path>`.

## Artifact frontmatter format

```yaml
---
slug: stripe-connect
category: plan
feature: stripe-connect
agent: tech-lead
date: 2026-05-14
status: active
supersedes: null
links:
  dossier: 2026-05-13-stripe-connect.md
  decisions: [2026-05-13-postgres-vs-mongo.md]
---
```

## Resume detection

When a slash command starts and finds a matching artifact, the pattern is:

```
📚 Encontré trabajo previo sobre esto en memory:

  • [dossier] 2026-05-13 stripe-connect — extracto de requirements analyst
  • [plan]    2026-05-13 stripe-connect — blueprint con 6/8 tareas completadas

¿Continuamos donde lo dejamos, o empezamos limpio?
  (a) Continúa — leo los artefactos y retomo
  (b) Empieza limpio — los archivo y empiezo nuevo dossier
  (c) Muéstrame el contenido primero
```

## Privacy & git

- This directory **is meant to be committed** to your repo. Decisions and plans benefit the whole team.
- Threat models that contain sensitive infrastructure detail should be redacted before commit, or excluded via `.gitignore`.
- Never write real credentials, tokens, or PII to memory. Use placeholders.
