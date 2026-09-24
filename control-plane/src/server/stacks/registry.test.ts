import { describe, expect, it } from 'vitest';
import { evaluateGate } from '../domain/gates.js';
import { evidenceKinds } from '../domain/types.js';
import { getStack, listStacks, stackRequiredEvidence, stacksForTags } from './registry.js';

describe('stack registry', () => {
  it('publishes the medusa-commerce stack with every part filled in', () => {
    const pack = getStack('medusa-commerce');
    expect(pack.tag).toBe('stack:medusa-commerce');
    expect(pack.technology.length).toBeGreaterThan(5);
    expect(pack.team.length).toBeGreaterThan(3);
    expect(pack.bootstrap.map((step) => step.order)).toEqual(pack.bootstrap.map((_, index) => index + 1));
    for (const section of pack.sections) {
      expect(section.rules.length, section.id).toBeGreaterThan(0);
      for (const rule of section.rules) {
        expect(rule.rule && rule.why && rule.howToApply, `${section.id}/${rule.id}`).toBeTruthy();
      }
    }
  });

  it('starts from the template repository instead of writing the stack from scratch', () => {
    const pack = getStack('medusa-commerce');
    expect(pack.starter.repository).toBe('github.com/devwspito/commerce-starter');
    expect(pack.starter.clone).toContain('--template devwspito/commerce-starter');
    expect(pack.starter.configure).toContain('pnpm nueva-tienda');
    expect(pack.starter.ownerOnly.length).toBeGreaterThan(0);
    expect(pack.bootstrap[1]?.step).toContain('starter.clone');
    expect(listStacks()[0]?.starter).toBe(pack.starter.repository);
  });

  it('keeps section and rule ids unique so runtimes can address them', () => {
    const pack = getStack('medusa-commerce');
    const sectionIds = pack.sections.map((section) => section.id);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
    const ruleIds = pack.sections.flatMap((section) => section.rules.map((rule) => rule.id));
    expect(new Set(ruleIds).size).toBe(ruleIds.length);
  });

  it('only maps checks and requirements to evidence kinds the gate understands', () => {
    const pack = getStack('medusa-commerce');
    const known = new Set<string>(evidenceKinds);
    for (const check of pack.checks) expect(known.has(check.evidenceKind), check.id).toBe(true);
    for (const kind of pack.requiredEvidence) expect(known.has(kind), kind).toBe(true);
    const covered = new Set(pack.checks.map((check) => check.evidenceKind));
    for (const kind of pack.requiredEvidence) expect(covered.has(kind), `no check produces ${kind}`).toBe(true);
  });

  it('rejects unknown stacks with the list of valid ones', () => {
    expect(() => getStack('nope')).toThrow(/Known stacks: medusa-commerce/);
  });

  it('summaries expose sections without the full rules', () => {
    const [summary] = listStacks();
    expect(summary?.sections.every((section) => !('rules' in section))).toBe(true);
  });

  it('resolves stacks from project tags and ignores unknown tags', () => {
    expect(stacksForTags(['stack:medusa-commerce', 'stack:otra', 'web']).map((pack) => pack.id)).toEqual(['medusa-commerce']);
    expect(stackRequiredEvidence(['web'])).toEqual([]);
  });

  it('makes the gate demand the stack evidence on top of the risk tier', () => {
    const extra = stackRequiredEvidence(['stack:medusa-commerce']);
    const gate = evaluateGate('low', [], [], extra);
    expect(gate.requiredEvidence).toEqual(expect.arrayContaining(['typecheck', 'unit', 'e2e', 'deploy-smoke', 'accessibility']));
    expect(new Set(gate.requiredEvidence).size).toBe(gate.requiredEvidence.length);
    expect(gate.decision).toBe('insufficient-evidence');
  });
});
