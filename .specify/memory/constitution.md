# Developer Control Plane Constitution

Version: 1.0.0  
Ratified: 2026-09-21

## I. Intent before implementation

Every non-trivial change begins with a bounded specification. A valid spec states the desired outcome, independently testable acceptance criteria, constraints, assumptions, edge cases, and explicit out-of-scope behavior. It does not prescribe implementation prematurely.

## II. Evidence over assertions

No agent, model, runtime, or human declaration can satisfy a quality gate by itself. Passing status requires recorded, reproducible evidence: check kind, actual result, timestamp, command or procedure, and a summary or artifact. Fabricated, planned, stale, or inferred evidence is invalid.

## III. Contracts own boundaries

Public APIs, events, schemas, permissions, data migrations, failure semantics, and cross-service dependencies are versioned contracts. Contract compatibility is validated before implementation and again before release.

## IV. Security depth follows risk

All trust boundaries validate inputs and enforce least privilege. High and critical risk projects additionally require threat modeling, SAST, dependency analysis, secret scanning, SBOM, and supply-chain provenance. Accepted risk requires an explicit durable decision by a named authority.

## V. Small, reversible slices

Tasks are bounded, dependency-aware, independently verifiable, and reversible. A task identifies the affected boundary, expected files or components, verification, and rollback. Parallel work is permitted only when dependencies and ownership do not overlap.

## VI. Architecture is executable policy

Module boundaries, dependency direction, data ownership, allowed communication, and forbidden coupling are enforced mechanically where possible. Domain logic remains independent of transport, persistence, frameworks, and model providers.

## VII. Tests follow behavior and risk

Use the cheapest test that proves the behavior. Require contract tests at boundaries, regression tests for every defect, integration tests for owned infrastructure, end-to-end tests for critical journeys, and mutation testing for critical domain invariants. Coverage percentages are signals, never substitutes for assertions.

## VIII. Production is part of the feature

Accessibility, performance budgets, observability, failure recovery, migration safety, rollback, data lifecycle, privacy, and operational ownership belong in the plan and acceptance evidence.

## IX. Local-model discipline

Local models receive bounded structured context: active contracts, relevant decisions, targeted code summaries, open findings, and one coherent next task. Tool inputs and model outputs use schemas. Uncertainty is explicit. A model never invents files, test results, incidents, metrics, or approvals.

## X. Human authority remains explicit

Agents may perform reversible internal work. Public contract changes, destructive data operations, production releases, security posture changes, monetary spend, and accepted risk require explicit named human authority.

## Governance

- The constitution is versioned. Amendments record rationale, migration impact, and approver.
- Projects select a risk tier; they may add stricter rules but cannot weaken the global minimum silently.
- Gate evaluation is deterministic and inspectable.
- Exceptions expire, identify an owner, and describe compensating controls.
- A shipped spec remains a durable historical contract. Corrections create linked follow-up specs or decisions; history is not rewritten.
