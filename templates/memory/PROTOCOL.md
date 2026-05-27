# Memory Protocol

This directory is the **cross-feature persistent memory**. It survives across sessions and complements the per-feature artifacts that live at `specs/NNN-feature-name/`.

> Managed by [team-software](https://github.com/devwspito/team-software). Safe to commit to your repo.

## Two homes for artifacts

team-software runs **Spec-Driven Development**. There are two persistence locations and they don't overlap:

### 1. `specs/NNN-feature-name/` (project root) — per-feature, the source of truth

Lives at the project root, committed to the repo. Owned by the feature. Contains:

```
specs/NNN-feature-name/
├── spec.md          ← WHAT/WHY (requirements-analyst)
├── plan.md          ← HOW + Constitution Check gate (software-architect + tech-lead)
├── research.md      ← Phase 0 decisions (software-architect)
├── data-model.md    ← entities + invariants (database-engineer + software-architect)
├── contracts/       ← API/event/SDK contracts (software-architect)
├── quickstart.md    ← end-to-end smoke (qa-engineer)
├── tasks.md         ← ordered, story-grouped (tech-lead + qa-engineer)
├── threat-model.md  ← STRIDE (security-engineer, if surface is sensitive)
└── checklists/      ← cross-artifact consistency, /team-review outputs
```

The slash commands (`/team-feature`, `/team-create`, etc.) produce and consume these. Each command writes to the relevant artifact, not to memory.

### 2. `.claude/memory/` — cross-feature, this directory

Everything that **doesn't belong to a single feature**:

```
.claude/memory/
├── INDEX.md            ← One-line index of all cross-cutting artifacts
├── PROTOCOL.md         ← This file
├── decisions/          ← Cross-cutting ADRs not tied to a single spec
├── threat-models/      ← Cross-cutting threat models (org-wide, infra-wide)
├── artifacts/          ← Audits, bug hunts, seed plans, ux-audit findings, refactor logs
├── dossiers/           ← LEGACY — pre-SDD requirements dossiers. Kept for back-compat. New work writes spec.md instead.
└── plans/              ← LEGACY — pre-SDD blueprints. Kept for back-compat. New work writes plan.md instead.
```

## Filenames

`YYYY-MM-DD-<kebab-slug>.md` — date prefix makes chronological order trivial and prevents collisions.

Examples (cross-cutting, here):
- `decisions/2026-05-13-postgres-vs-mongo.md` — repo-wide DB choice (not feature-specific)
- `threat-models/2026-05-13-cross-tenant-isolation.md` — org-wide model
- `artifacts/2026-05-13-security-audit-q2.md` — quarterly audit output
- `artifacts/2026-05-13-bug-hunt-payments.md` — proactive sweep result
- `artifacts/2026-05-13-seed-demo-cliente.md` — reusable seed plan

Examples (per-feature — these live at `specs/NNN-feature/`, NOT here):
- `specs/003-stripe-connect/spec.md`
- `specs/003-stripe-connect/plan.md`
- `specs/003-stripe-connect/threat-model.md`

## INDEX.md format

One line per artifact, newest at top. Each line:

```
- [<category>] YYYY-MM-DD <slug> — <one-line summary> — <status>
```

Statuses: `active`, `superseded by <slug>`, `archived`.

Example:
```
- [artifact]     2026-05-14 security-audit-q2 — 3 Critical fixed, 7 Highs open — active
- [decision]     2026-05-13 postgres-vs-mongo — Postgres por transacciones — active
- [threat-model] 2026-05-12 cross-tenant-isolation — controles RLS y namespace cache — active
- [dossier]      2026-04-22 magic-link-auth — LEGACY pre-SDD — superseded by specs/007-magic-link/spec.md
```

## Read rules

**At the start of every slash command pipeline:**
1. Read `INDEX.md` for cross-cutting context (audits, decisions, threat models that touch the area).
2. Also `ls specs/` to detect whether the feature already has an active spec directory.
3. If a relevant cross-cutting artifact exists OR an active spec is found, **mention it to the user before the first question** and ask whether to reuse/continue or start fresh.

**Before invoking a specialist agent:**
- If a relevant artifact exists in either location, include its contents in the agent's input. The agent has no filesystem awareness — the parent thread is the router.

## Write rules

**Write to `specs/NNN-feature/`** when the output belongs to one feature (spec, plan, tasks, research, data-model, contracts, quickstart, threat-model, checklists). Default for `/team-feature`, `/team-create`, `/team-refactor`, `/team-ux-audit`, and per-feature `/team-threat-model`.

**Write to `.claude/memory/`** when the output is cross-feature or organizational (security audits of the whole project, bug-hunt sweeps, repo-wide ADRs, cross-cutting threat models, seed plans reusable across features). Default for `/team-security-audit`, `/team-inspect`, `/team-seed`, repo-wide decisions.

**Do NOT save:**
- Intermediate thoughts or scratch work.
- Failed attempts (unless the failure itself is the lesson — save as a `decision` with status).
- Anything sensitive (secrets, real PII, credentials). Use `<REDACTED>` placeholders if the artifact references them.

**Writing protocol (memory):**
1. Create the file in the appropriate subdir with `YYYY-MM-DD-<slug>.md` filename.
2. Frontmatter with: `slug`, `category`, `feature` (if related to one — else `null`), `agent`, `date`, `status`.
3. Append a line to `INDEX.md` (newest at top).
4. Confirm to the user: `📝 Guardado en memory: <path>`.

**Writing protocol (specs):**
1. Allocate the next number `NNN` by scanning existing `specs/` directories (highest + 1, three-digit padded).
2. Create `specs/NNN-feature-name/` and the relevant `*.md` from the matching template under `.specify/templates/` (or fallback to `~/.claude/specify/templates/`).
3. Fill placeholders. Confirm to the user: `📝 Spec creada: specs/NNN-feature-name/spec.md`.

## Artifact frontmatter format (memory)

```yaml
---
slug: postgres-vs-mongo
category: decision
feature: null              # null when cross-cutting; or slug of related spec dir (e.g. "003-stripe-connect")
agent: software-architect
date: 2026-05-14
status: active
supersedes: null
links:
  spec: specs/003-stripe-connect/spec.md
  threat-model: 2026-05-12-cross-tenant-isolation.md
---
```

## Resume detection

At pipeline start, scan both:
- `ls specs/` for active feature directories whose slug matches the user's request.
- `.claude/memory/INDEX.md` for related cross-cutting context.

Pattern:

```
📚 Encontré trabajo previo:

  • specs/003-stripe-connect/ — spec + plan + tasks (6/8 completadas)
  • [decision]     2026-05-13 postgres-vs-mongo — DB choice — active
  • [threat-model] 2026-05-12 cross-tenant-isolation — controles RLS

¿Continuamos donde lo dejamos, o empezamos limpio?
  (a) Continúa — leo los artefactos y retomo
  (b) Empieza limpio — archivo y empiezo nueva spec
  (c) Muéstrame el contenido primero
```

## Privacy & git

- Both `specs/` and `.claude/memory/` **are meant to be committed**. Decisions and plans benefit the whole team.
- Threat models that contain sensitive infrastructure detail should be redacted before commit, or excluded via `.gitignore`.
- Never write real credentials, tokens, or PII. Use `<REDACTED>` placeholders.

## Constitution

`.specify/memory/constitution.md` holds project-specific non-negotiable principles, sitting on top of the team-software globals (security-first, SOLID, DDD, SRP, clean code, modularity, orchestration). The `Constitution Check` is a gate in every `plan.md` — pre-Phase 0 and post-Phase 1. Violations must be justified in `plan.md → Complexity Tracking` with the simpler alternative explicitly rejected.

It is bootstrapped by `/team-create` on greenfield projects, or on first run of `/team-feature` in an existing project without one.

## Legacy (`dossiers/`, `plans/`)

Pre-SDD work lived in `.claude/memory/dossiers/` (requirements) and `.claude/memory/plans/` (blueprints). These directories remain readable — but new work writes to `specs/NNN-feature-name/spec.md` and `specs/NNN-feature-name/plan.md`. When a legacy dossier is still active, link from INDEX as `superseded by specs/NNN-…/spec.md` once migrated.
