import type { Evidence, EvidenceKind, Finding, GateResult, RiskTier } from './types.js';

const requiredByRisk: Record<RiskTier, readonly EvidenceKind[]> = {
  low: ['typecheck', 'unit'],
  standard: ['lint', 'typecheck', 'unit', 'integration', 'security-secrets'],
  high: [
    'lint',
    'typecheck',
    'unit',
    'integration',
    'contract',
    'e2e',
    'security-sast',
    'security-dependency',
    'security-secrets',
    'sbom',
  ],
  critical: [
    'lint',
    'typecheck',
    'unit',
    'integration',
    'contract',
    'e2e',
    'mutation',
    'security-sast',
    'security-dependency',
    'security-secrets',
    'sbom',
    'provenance',
    'performance',
    'manual-review',
    'deploy-smoke',
  ],
};

const blockingSeverities: Record<RiskTier, ReadonlySet<Finding['severity']>> = {
  low: new Set(['critical']),
  standard: new Set(['critical', 'high']),
  high: new Set(['critical', 'high']),
  critical: new Set(['critical', 'high', 'medium']),
};

const evidenceGuidance: Record<EvidenceKind, { why: string; suggestedCommands: string[] }> = {
  lint: {
    why: 'Prevents known style, correctness, and maintainability violations from entering the change.',
    suggestedCommands: ['Use the repository lint script, for example: npm run lint', 'Fix every error; do not suppress rules without a recorded decision.'],
  },
  typecheck: {
    why: 'Proves that static contracts remain internally consistent.',
    suggestedCommands: ['Use the strict repository typecheck, for example: npm run typecheck', 'Record the real exit code and summary.'],
  },
  unit: {
    why: 'Verifies isolated behavior and protects the smallest regression surface.',
    suggestedCommands: ['Run the complete unit suite, for example: npm test', 'Add a regression test for every fixed defect.'],
  },
  integration: {
    why: 'Verifies boundaries such as databases, queues, files, and service adapters.',
    suggestedCommands: ['Start required dependencies and run the repository integration suite.', 'Do not replace integration evidence with mocked unit tests.'],
  },
  contract: {
    why: 'Protects public APIs, schemas, events, and protocol compatibility.',
    suggestedCommands: ['Run API/schema/consumer contract checks.', 'For MCP, initialize a real client and call tools/list plus the affected tools.'],
  },
  e2e: {
    why: 'Proves the user-visible workflow across the deployed system.',
    suggestedCommands: ['Run the critical end-to-end journeys against a production-like environment.', 'Capture the failing step and artifact URI when a journey fails.'],
  },
  mutation: {
    why: 'Measures whether tests detect meaningful behavioral defects rather than merely execute lines.',
    suggestedCommands: ['Run the project mutation-test command on changed critical modules.', 'Improve tests until the configured mutation threshold passes.'],
  },
  'security-sast': {
    why: 'Detects vulnerable code patterns and unsafe data flows.',
    suggestedCommands: ['Run the repository SAST policy, for example CodeQL or Semgrep.', 'Resolve or explicitly record every accepted risk.'],
  },
  'security-dependency': {
    why: 'Detects vulnerable direct and transitive dependencies.',
    suggestedCommands: ['Run the ecosystem dependency audit with the project severity threshold.', 'Upgrade, remove, or record an accepted risk for vulnerable packages.'],
  },
  'security-secrets': {
    why: 'Prevents credentials and private material from entering source or artifacts.',
    suggestedCommands: ['Run a full-history secret scan, for example Gitleaks.', 'Rotate any exposed credential; deleting it from the latest file is insufficient.'],
  },
  sbom: {
    why: 'Produces a machine-readable inventory for incident response and supply-chain review.',
    suggestedCommands: ['Generate a CycloneDX or SPDX SBOM from the locked build.', 'Store the artifact URI and digest with the evidence.'],
  },
  provenance: {
    why: 'Binds the released artifact to its source, workflow, and builder identity.',
    suggestedCommands: ['Generate and verify signed build provenance for the immutable artifact digest.', 'Record the attestation URI and verification result.'],
  },
  performance: {
    why: 'Protects explicit latency, throughput, memory, and resource budgets.',
    suggestedCommands: ['Run the project performance scenario with fixed inputs and thresholds.', 'Record numerical metrics, not only a prose conclusion.'],
  },
  accessibility: {
    why: 'Protects keyboard, semantic, contrast, and assistive-technology behavior.',
    suggestedCommands: ['Run automated accessibility checks and the project manual keyboard/screen-reader review.'],
  },
  'manual-review': {
    why: 'Provides accountable human review for risks that automated evidence cannot settle.',
    suggestedCommands: ['Obtain an identified reviewer decision against the spec and threat model.', 'Record unresolved concerns as findings.'],
  },
  'deploy-smoke': {
    why: 'Confirms that the immutable artifact starts and its critical production path is reachable.',
    suggestedCommands: ['Deploy the exact candidate artifact and run health plus critical smoke checks.', 'Rollback and record a failed result if any required check fails.'],
  },
};

/**
 * `extraRequired` is the evidence demanded by the stack packs a project opted
 * into (`stack:<id>` tags). It only ever adds requirements: a stack can make a
 * low-risk project stricter, never a critical one laxer.
 */
export function evaluateGate(
  riskTier: RiskTier,
  evidence: readonly Evidence[],
  findings: readonly Finding[],
  extraRequired: readonly EvidenceKind[] = [],
): GateResult {
  const requiredEvidence = [...new Set([...requiredByRisk[riskTier], ...extraRequired])];
  const latestByKind = latestEvidenceByKind(evidence);
  const satisfiedEvidence = requiredEvidence.filter((kind) => latestByKind.get(kind)?.status === 'passed');
  const failedEvidence = requiredEvidence.filter((kind) => latestByKind.get(kind)?.status === 'failed');
  const missingEvidence = requiredEvidence.filter((kind) => {
    const status = latestByKind.get(kind)?.status;
    return status === undefined || status === 'warning' || status === 'skipped';
  });
  const blockingFindings = findings
    .filter((finding) => finding.status === 'open' && blockingSeverities[riskTier].has(finding.severity))
    .map(({ id, severity, title }) => ({ id, severity, title }));

  const reasons: string[] = [];
  if (missingEvidence.length > 0) reasons.push(`Missing evidence: ${missingEvidence.join(', ')}`);
  if (failedEvidence.length > 0) reasons.push(`Failed evidence: ${failedEvidence.join(', ')}`);
  if (blockingFindings.length > 0) reasons.push(`${blockingFindings.length} blocking finding(s) remain open`);

  let decision: GateResult['decision'] = 'pass';
  if (failedEvidence.length > 0 || blockingFindings.length > 0) decision = 'fail';
  else if (missingEvidence.length > 0) decision = 'insufficient-evidence';

  const requirements = requiredEvidence.map((kind) => ({
    kind,
    status: failedEvidence.includes(kind)
      ? ('failed' as const)
      : satisfiedEvidence.includes(kind)
        ? ('passed' as const)
        : ('missing' as const),
    ...evidenceGuidance[kind],
  }));
  const nextActions: GateResult['nextActions'] = [];
  for (const kind of failedEvidence) {
    nextActions.push({
      priority: 1,
      action: `Fix the failure for ${kind}, rerun the real check, then record the new result. ${evidenceGuidance[kind].suggestedCommands.join(' ')}`,
      tool: 'developer_evidence_record',
    });
  }
  for (const finding of blockingFindings) {
    nextActions.push({
      priority: 2,
      action: `Resolve blocking ${finding.severity} finding “${finding.title}” (${finding.id}) and attach verification evidence before changing its status.`,
      tool: 'developer_finding_upsert',
    });
  }
  for (const kind of missingEvidence) {
    nextActions.push({
      priority: 3,
      action: `Produce ${kind} evidence. ${evidenceGuidance[kind].suggestedCommands.join(' ')}`,
      tool: 'developer_evidence_record',
    });
  }
  nextActions.push({
    priority: decision === 'pass' ? 1 : 4,
    action: decision === 'pass'
      ? 'Compliance passes. Preserve the evidence and proceed only with the accepted spec/release workflow.'
      : 'Call developer_gate_evaluate again after recording every remediation. Do not claim completion while the decision is not pass.',
    tool: decision === 'pass' ? null : 'developer_gate_evaluate',
  });

  const llmInstruction = decision === 'pass'
    ? 'COMPLIANCE PASS. All required evidence is successful and no blocking finding remains. Preserve traceability when shipping.'
    : `COMPLIANCE ${decision.toUpperCase()}. You must not claim the task is complete, accepted, shippable, or tested. Execute nextActions in priority order using real commands and outputs, record the evidence, then reevaluate the gate.`;

  return {
    decision,
    riskTier,
    requiredEvidence,
    satisfiedEvidence,
    missingEvidence,
    failedEvidence,
    blockingFindings,
    reasons,
    requirements,
    nextActions,
    llmInstruction,
  };
}

function latestEvidenceByKind(evidence: readonly Evidence[]): Map<EvidenceKind, Evidence> {
  const latest = new Map<EvidenceKind, Evidence>();
  for (const item of evidence) {
    const current = latest.get(item.kind);
    if (!current || Date.parse(item.recordedAt) > Date.parse(current.recordedAt)) latest.set(item.kind, item);
  }
  return latest;
}
