# Global Engineering Standards

These standards apply to **every project, every commit, every line of code**. They are non-negotiable defaults — deviate only when the user explicitly authorizes it for a specific case.

## Core principles (in priority order)

1. **Security first** — Threat-model before coding. Validate all input at trust boundaries. Never trust client data, env vars in code, or third-party output. Apply least-privilege. Default-deny. Owasp Top 10 + CWE Top 25 are baseline knowledge, not advanced topics. Secrets never enter source control, logs, or error messages.

2. **SOLID** — Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion. If a class/module/function violates SRP, split it. Depend on abstractions, not concretions. Composition over inheritance.

3. **DDD (Domain-Driven Design)** — Model the business domain first, technology second. Use ubiquitous language. Separate domain / application / infrastructure / presentation layers. Aggregates own their invariants. Domain layer has zero framework dependencies. Bounded contexts have explicit contracts.

4. **Single Responsibility Principle** — One reason to change. One job per function, class, module, service. If you need "and" to describe what it does, split it.

5. **Clean Code** — Names reveal intent. Functions are small (target: <20 lines, max ~50). Cyclomatic complexity stays low. No magic numbers, no commented-out code, no dead code. DRY — but prefer 3 similar lines over a premature abstraction. Self-documenting code beats comments.

6. **Modularity** — High cohesion, low coupling. Each module has a clear public API and hidden internals. Cross-module dependencies flow in one direction (no cycles). Replace a module without touching its siblings.

7. **Orchestration** — Coordination is explicit, not implicit. Workflows are observable, retryable, idempotent. Distinguish business logic (pure) from coordination (effectful). Use the right boundary: in-process orchestrator, queue, saga, or workflow engine.

## How to use the specialist team

Every project ships with a global agent team. Invoke them via the Agent tool when their expertise applies — do NOT do their work yourself in the main thread when a specialist exists.

| Agent | When to invoke |
|---|---|
| `requirements-analyst` | **FIRST** for any new feature, vague idea, or change without clear acceptance criteria. Extracts goals, scope, AC, constraints, edge cases, ubiquitous language. Output feeds `tech-lead`. |
| `tech-lead` | Decompose a non-trivial feature into a delegation plan before implementation. Consumes the requirements dossier and produces tasks per specialist. |
| `software-architect` | Design new modules, define boundaries, choose patterns, model domains, review architecture decisions. |
| `security-engineer` | Before merging any code touching auth, input handling, secrets, crypto, network calls, file I/O, or PII. Also for threat models. |
| `backend-engineer` | Implement server-side logic, APIs, business rules, integrations. |
| `frontend-engineer` | Implement UI, accessibility, client-side state, performance. |
| `database-engineer` | Schema design, migrations, indexes, query performance, data integrity. |
| `qa-engineer` | Test strategy, TDD scaffolding, coverage gaps, regression risk. |
| `devops-engineer` | CI/CD, containerization, infra-as-code, observability, deployments. |
| `code-reviewer` | Before any commit/PR. Enforces SOLID, clean code, security, modularity. |
| `refactoring-specialist` | Code smell hunt, complexity reduction, modularity improvements without behavior change. |
| **UI/UX sub-team** | |
| `ux-researcher` | Diagnose UX problems on existing interfaces — heuristic evaluation (Nielsen), journey mapping. Invoke when something in the UI doesn't make sense. |
| `interaction-designer` | Prescribe behavior — flows, states (loading/empty/error/success), affordances, recovery paths. |
| `visual-designer` | Visual hierarchy, typography, color contrast, spacing, consistency. |
| `accessibility-specialist` | Deep WCAG audit beyond `frontend-engineer` smoke check — screen reader, keyboard, focus management, motion. |
| `content-designer` | Microcopy, error messages, labels, empty states, voice & tone, i18n-friendly content. |
| **Delivery sub-team** (hands-dirty, sin pipeline) | |
| `debug-engineer` | Pragmatic bug hunter. Reproduce, isolate, fix, regression test. No discovery phase. |
| `integration-engineer` | Wire up half-built features — button → handler → API → DB → state → UI feedback. |
| `polish-engineer` | Half-built → demo-ready: missing states, error messages, edge cases, microcopy smoke. |
| `seed-data-engineer` | Realistic seed data that passes validation (NIF, IBAN, IVA, etc). Idempotent, prod-safe. |
| **Inspection sub-team** (proactive bug discovery) | |
| `bug-hunter` | Finds bugs the user hasn't reported. Static analysis + tooling (tests, lint, typecheck, build) + cross-reference. |
| `exploratory-tester` | Simulates user journeys via code reading. Catalogs dead-ends, broken transitions, impossible states. |

## Spec-Driven Development (default workflow)

**Specs drive code.** The spec is the source of truth — code is its expression. Every non-trivial feature lives under `specs/NNN-feature-name/` in the project root and goes through four artifacts, each owned by a specialist:

```
specs/NNN-feature-name/
├── spec.md          ← WHAT/WHY — produced by requirements-analyst
├── plan.md          ← HOW + Constitution Check gate — produced by software-architect + tech-lead
├── research.md      ← Phase 0 decisions — software-architect
├── data-model.md    ← entities + invariants — database-engineer + software-architect
├── contracts/       ← API/event/SDK contracts — software-architect
├── quickstart.md    ← end-to-end smoke — qa-engineer
├── tasks.md         ← ordered, dependency-aware — tech-lead + qa-engineer
├── threat-model.md  ← STRIDE — security-engineer (if surface is sensitive)
└── checklists/      ← cross-artifact consistency — code-reviewer
```

The slash commands (`/team-feature`, `/team-create`, `/team-refactor`, etc.) are the runners that produce/consume these artifacts. They are not optional — the artifacts ARE the work. Implementation without a spec is allowed only for trivial changes (typo, single-line fix) or hands-dirty modes (`/team-fix`, `/team-finish`, `/team-seed`, `/team-inspect`).

### Constitution

`.specify/memory/constitution.md` holds project-specific non-negotiable principles (on top of the globals listed above). It is checked as a **gate** in every `plan.md` (pre-design AND post-design). Violations must be justified in `plan.md → Complexity Tracking` with the simpler alternative explicitly rejected. The constitution is bootstrapped by `/team-create` on greenfield projects, or by `/team-feature` on first run in an existing project.

### Phase ownership

1. **Spec** (`spec.md`) — `requirements-analyst`. User stories priorized P1/P2/P3, each independently testable. Functional requirements (FR-N), measurable success criteria (SC-N), edge cases, assumptions, out-of-scope. **No tech, no how.**
2. **Plan** (`plan.md` + `research.md` + `data-model.md` + `contracts/` + `quickstart.md`) — `software-architect` leads, `tech-lead` consolidates, `database-engineer` owns data, `security-engineer` owns threat surface. Constitution Check gate must PASS before Phase 0 research and re-checked after Phase 1 design.
3. **Tasks** (`tasks.md`) — `tech-lead` + `qa-engineer`. Ordered by dependency, grouped by user story for independent delivery, parallel markers `[P]`, story labels `[US1]`. Each task names its owner specialist and exact file paths.
4. **Implement** — `backend-engineer` / `frontend-engineer` / `database-engineer` execute `tasks.md` in order. Mark `[x]` as they complete. Tests-first when the constitution demands.
5. **Review** — `code-reviewer` + `security-engineer` review against `spec.md`, `plan.md`, `tasks.md`, and the constitution. Verdict references spec sections.
6. **Ship** — `devops-engineer`. Gate: `tasks.md` fully `[x]`, Constitution Check PASS, threat-model addressed.

### Trivial changes

Typo, single-line fix, dependency bump that doesn't change contracts: act directly. Still apply the principles. No spec required.

## Autonomy framework (for all agents)

You operate autonomously within your scope. Use this decision framework:

**Decide and document** (don't ask) when:
- The decision is reversible (naming, internal structure, minor lib choice).
- Cost of changing later is low.
- A clear default exists in the codebase or framework conventions.
- The choice doesn't change external contracts.

In these cases, make the call and add to "Assumptions" in your output. Move on.

**Ask the parent (which may forward to the user)** when:
- The decision is irreversible or expensive to undo (DB schema, public API contract, major dependency).
- It changes the external contract observed by users or other services.
- It changes the security posture (new auth flow, new attack surface, new data category).
- It costs money (cloud resources, paid services, third-party APIs).

**Escalate to `tech-lead`** (not to the user) when:
- The current blueprint doesn't cover this branch of work.
- You discovered work that wasn't in the plan.
- Dependencies between specialists need re-ordering.

Do not ping-pong over trivial decisions. Do not ask permission for things you can document. The goal is productive movement, not theater.

## Pipeline discipline (TodoWrite + artifacts + memory)

For any multi-step task — especially the slash command pipelines — the main thread maintains:

1. **A TodoWrite list** at the start, with every phase enumerated. Mark `in_progress` when entering a phase, `completed` immediately on finish. Add new todos as work surfaces. Never leave the list stale.

2. **SDD artifacts at `specs/NNN-feature-name/`** (project root, committed to repo) — `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `tasks.md`, `threat-model.md`, `checklists/`. These are the feature's source of truth. Templates live at `.specify/templates/` (per-project) or `~/.claude/specify/templates/` (global, from team-software install).

3. **Memory artifacts at `.claude/memory/`** (project scope) or `~/.claude/memory/` (user scope) — for **cross-feature** material that doesn't belong to a single spec: global decisions/ADRs, cross-cutting threat models, security audits, bug-hunt inventories, seed plans, refactor logs. See `MEMORY-PROTOCOL.md` for the contract:
   - At the start of any pipeline: read `INDEX.md` and check for relevant prior artifacts.
   - When invoking a specialist that produces a reusable output not tied to a single spec: save to memory and append to `INDEX.md`.
   - When resuming a previous session on the same feature: detect (via `specs/` directory listing or memory INDEX) and offer to continue.

4. **Specialists do not write to disk directly** — they return their output to the parent thread, which writes it (to `specs/` for spec/plan/tasks artifacts, to `memory/` for cross-cutting). Specialists also do not read from disk autonomously — the parent passes in the relevant content as input. This keeps subagents stateless and the persistence layer explicit.

## Hard rules

- **Never** commit secrets, API keys, tokens, passwords, or PII to source control.
- **Never** use `--no-verify`, `--force` on shared branches, or bypass CI checks without explicit user authorization.
- **Never** introduce circular dependencies between modules.
- **Never** mix domain logic with infrastructure concerns (HTTP, DB, filesystem) in the same class.
- **Always** validate input at every trust boundary.
- **Always** prefer pure functions for business logic; isolate side effects.
- **Always** write tests for new logic and bug fixes (regression test for every fix).
- **Always** name things in the ubiquitous language of the domain.

## Output discipline

- Don't generate documentation files (`*.md`, READMEs) unless explicitly requested.
- Don't write comments that restate the code. Only comment WHY when non-obvious.
- Don't add backwards-compatibility shims or feature flags without explicit need.
- Don't add error handling for impossible cases. Trust internal invariants.
