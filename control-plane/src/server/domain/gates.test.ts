import { describe, expect, it } from 'vitest';
import { evaluateGate } from './gates.js';
import type { Evidence, Finding } from './types.js';

const baseEvidence = {
  id: 'evidence-id',
  projectId: 'project-id',
  specId: null,
  runId: null,
  command: 'npm test',
  summary: 'verified',
  artifactUri: null,
  metrics: {},
  recordedAt: '2026-09-21T10:00:00.000Z',
} satisfies Omit<Evidence, 'kind' | 'status'>;

const baseFinding = {
  id: 'finding-id',
  projectId: 'project-id',
  specId: null,
  runId: null,
  fingerprint: 'SEC-001',
  category: 'security',
  title: 'Open vulnerability',
  detail: 'detail',
  status: 'open',
  createdAt: '2026-09-21T10:00:00.000Z',
  updatedAt: '2026-09-21T10:00:00.000Z',
} satisfies Omit<Finding, 'severity'>;

describe('evaluateGate', () => {
  it('passes a low-risk project when required evidence is current and successful', () => {
    const evidence: Evidence[] = [
      { ...baseEvidence, id: 'typecheck', kind: 'typecheck', status: 'passed' },
      { ...baseEvidence, id: 'unit', kind: 'unit', status: 'passed' },
    ];
    expect(evaluateGate('low', evidence, [])).toMatchObject({ decision: 'pass', missingEvidence: [] });
  });

  it('uses only the latest evidence for a check', () => {
    const evidence: Evidence[] = [
      { ...baseEvidence, id: 'old', kind: 'unit', status: 'failed', recordedAt: '2026-09-21T09:00:00.000Z' },
      { ...baseEvidence, id: 'new', kind: 'unit', status: 'passed', recordedAt: '2026-09-21T11:00:00.000Z' },
      { ...baseEvidence, id: 'typecheck', kind: 'typecheck', status: 'passed' },
    ];
    expect(evaluateGate('low', evidence, []).decision).toBe('pass');
  });

  it('fails standard risk when a high-severity finding remains open', () => {
    const finding: Finding = { ...baseFinding, severity: 'high' };
    const result = evaluateGate('standard', [], [finding]);
    expect(result.decision).toBe('fail');
    expect(result.blockingFindings).toHaveLength(1);
  });

  it('reports insufficient evidence when checks are absent but no blocker failed', () => {
    const result = evaluateGate('critical', [], []);
    expect(result.decision).toBe('insufficient-evidence');
    expect(result.missingEvidence).toContain('provenance');
    expect(result.missingEvidence).toContain('mutation');
    expect(result.nextActions.some((action) => action.tool === 'developer_evidence_record')).toBe(true);
    expect(result.llmInstruction).toContain('must not claim');
  });

  it('does not treat warning or skipped evidence as a passing requirement', () => {
    const evidence: Evidence[] = [
      { ...baseEvidence, id: 'typecheck', kind: 'typecheck', status: 'warning' },
      { ...baseEvidence, id: 'unit', kind: 'unit', status: 'skipped' },
    ];
    const result = evaluateGate('low', evidence, []);
    expect(result.decision).toBe('insufficient-evidence');
    expect(result.missingEvidence).toEqual(['typecheck', 'unit']);
  });
});
