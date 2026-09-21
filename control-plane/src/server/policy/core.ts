export const policyPack = Object.freeze({
  id: 'developer-core-2026-09',
  version: '1.0.0',
  title: 'Developer Engineering Constitution — September 2026',
  operatingModel: 'spec-anchored',
  principles: [
    {
      id: 'intent-before-code',
      title: 'Intent and acceptance evidence before implementation',
      rule: 'Every non-trivial change has a bounded spec with independently testable acceptance criteria and explicit out-of-scope behavior.',
    },
    {
      id: 'evidence-not-claims',
      title: 'Evidence over agent claims',
      rule: 'A model may propose outcomes but may not mark a gate passed without recorded command, status, timestamp, and reproducible artifact or summary.',
    },
    {
      id: 'contracts-own-boundaries',
      title: 'Contracts own system boundaries',
      rule: 'Public APIs, events, schemas, permissions, migrations, and failure semantics are versioned contracts validated before implementation.',
    },
    {
      id: 'security-by-risk',
      title: 'Security depth follows risk, never convenience',
      rule: 'Threat modeling, least privilege, input validation, secret isolation, dependency integrity, SBOM, and provenance scale with the project risk tier.',
    },
    {
      id: 'small-verifiable-slices',
      title: 'Small, reversible, independently verifiable slices',
      rule: 'Tasks have explicit dependencies, files, owner role, rollback path, and verification. Parallelism is allowed only for independent boundaries.',
    },
    {
      id: 'architecture-is-enforced',
      title: 'Architecture is executable policy',
      rule: 'Module boundaries, dependency direction, data ownership, and forbidden coupling are checked by tooling where possible and reviewed where not.',
    },
    {
      id: 'tests-by-risk',
      title: 'Tests target behavior and risk',
      rule: 'Use the cheapest test that proves the behavior, contract tests at boundaries, regression tests for every defect, and mutation testing for critical domain logic.',
    },
    {
      id: 'production-is-a-feature',
      title: 'Production behavior is part of the spec',
      rule: 'Observability, accessibility, performance budgets, migration safety, rollback, data lifecycle, and operational ownership are designed before shipping.',
    },
    {
      id: 'local-model-discipline',
      title: 'Local models receive bounded, structured context',
      rule: 'Context bundles include only active contracts, decisions, relevant code summaries, open findings, and the next bounded task; outputs must conform to schemas.',
    },
    {
      id: 'human-authority',
      title: 'Irreversible authority remains explicit',
      rule: 'Agents may make reversible internal changes. Public contracts, destructive data operations, security posture, spend, production release, and accepted risk require named human authority.',
    },
  ],
  workflow: [
    'assess',
    'specify',
    'clarify',
    'plan',
    'threat-model',
    'task',
    'implement',
    'verify',
    'review',
    'converge',
    'ship',
    'observe',
  ],
  references: [
    'MCP 2026-07-28',
    'GitHub Spec Kit 2026',
    'NIST SSDF 1.1 and SP 800-218A',
    'OWASP ASI and LLM Top 10',
    'SLSA supply-chain levels',
    'WCAG 2.2 AA',
  ],
});

export type PolicyPack = typeof policyPack;
