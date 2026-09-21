export const riskTiers = ['low', 'standard', 'high', 'critical'] as const;
export type RiskTier = (typeof riskTiers)[number];

export const projectStatuses = ['discovery', 'active', 'maintenance', 'blocked', 'archived'] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const specStates = [
  'draft',
  'clarified',
  'planned',
  'implementing',
  'verifying',
  'accepted',
  'shipped',
  'blocked',
  'cancelled',
] as const;
export type SpecState = (typeof specStates)[number];

export const runStatuses = ['running', 'passed', 'failed', 'blocked', 'cancelled'] as const;
export type RunStatus = (typeof runStatuses)[number];

export const evidenceKinds = [
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
  'accessibility',
  'manual-review',
  'deploy-smoke',
] as const;
export type EvidenceKind = (typeof evidenceKinds)[number];

export const evidenceStatuses = ['passed', 'failed', 'warning', 'skipped'] as const;
export type EvidenceStatus = (typeof evidenceStatuses)[number];

export const findingSeverities = ['critical', 'high', 'medium', 'low', 'info'] as const;
export type FindingSeverity = (typeof findingSeverities)[number];

export type Project = {
  id: string;
  slug: string;
  name: string;
  description: string;
  repositoryUrl: string | null;
  status: ProjectStatus;
  riskTier: RiskTier;
  runtimes: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Spec = {
  id: string;
  projectId: string;
  slug: string;
  title: string;
  state: SpecState;
  intent: string;
  acceptanceCriteria: string[];
  constraints: string[];
  outOfScope: string[];
  artifacts: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type Run = {
  id: string;
  projectId: string;
  specId: string | null;
  workflow: string;
  runtime: string;
  model: string;
  status: RunStatus;
  summary: string;
  startedAt: string;
  finishedAt: string | null;
};

export type Evidence = {
  id: string;
  projectId: string;
  specId: string | null;
  runId: string | null;
  kind: EvidenceKind;
  status: EvidenceStatus;
  command: string | null;
  summary: string;
  artifactUri: string | null;
  metrics: Record<string, number | string | boolean>;
  recordedAt: string;
};

export type Finding = {
  id: string;
  projectId: string;
  specId: string | null;
  runId: string | null;
  fingerprint: string;
  severity: FindingSeverity;
  category: string;
  title: string;
  detail: string;
  status: 'open' | 'accepted-risk' | 'resolved' | 'false-positive';
  createdAt: string;
  updatedAt: string;
};

export type GateResult = {
  decision: 'pass' | 'fail' | 'insufficient-evidence';
  riskTier: RiskTier;
  requiredEvidence: EvidenceKind[];
  satisfiedEvidence: EvidenceKind[];
  missingEvidence: EvidenceKind[];
  failedEvidence: EvidenceKind[];
  blockingFindings: Array<Pick<Finding, 'id' | 'severity' | 'title'>>;
  reasons: string[];
  requirements: Array<{
    kind: EvidenceKind;
    status: 'passed' | 'failed' | 'missing';
    why: string;
    suggestedCommands: string[];
  }>;
  nextActions: Array<{
    priority: number;
    action: string;
    tool: 'developer_evidence_record' | 'developer_finding_upsert' | 'developer_gate_evaluate' | null;
  }>;
  llmInstruction: string;
};

export type ProjectSnapshot = {
  project: Project;
  specs: Spec[];
  runs: Run[];
  evidence: Evidence[];
  findings: Finding[];
  gate: GateResult;
};
