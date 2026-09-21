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

export function evaluateGate(
  riskTier: RiskTier,
  evidence: readonly Evidence[],
  findings: readonly Finding[],
): GateResult {
  const requiredEvidence = [...requiredByRisk[riskTier]];
  const latestByKind = latestEvidenceByKind(evidence);
  const satisfiedEvidence = requiredEvidence.filter((kind) => latestByKind.get(kind)?.status === 'passed');
  const failedEvidence = requiredEvidence.filter((kind) => latestByKind.get(kind)?.status === 'failed');
  const missingEvidence = requiredEvidence.filter((kind) => !latestByKind.has(kind));
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

  return {
    decision,
    riskTier,
    requiredEvidence,
    satisfiedEvidence,
    missingEvidence,
    failedEvidence,
    blockingFindings,
    reasons,
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
