import type { EvidenceKind } from '../domain/types.js';

/**
 * A stack pack is a reusable, versioned build recipe distilled from a project
 * that already went to production. It is data, not code: runtimes read it over
 * MCP and follow it; the gate reads `requiredEvidence` to demand the checks the
 * stack cannot ship without.
 */
export type StackRule = {
  id: string;
  rule: string;
  why: string;
  howToApply: string;
};

export type StackSection = {
  id: string;
  title: string;
  summary: string;
  rules: StackRule[];
};

export type StackTechnology = {
  layer: string;
  choice: string;
  version: string;
  notes: string;
};

export type StackRole = {
  id: string;
  title: string;
  owns: string[];
  mustNot: string[];
};

export type StackCheck = {
  id: string;
  evidenceKind: EvidenceKind;
  purpose: string;
  command: string;
  failsWhen: string;
};

export type StackBootstrapStep = {
  order: number;
  step: string;
  doneWhen: string;
};

/** Template repository a new project clones instead of writing the stack from scratch. */
export type StackStarter = {
  repository: string;
  clone: string;
  configure: string;
  briefTemplate: string;
  ownerOnly: string[];
};

export type StackPack = {
  id: string;
  version: string;
  title: string;
  tag: string;
  origin: string;
  starter: StackStarter;
  useWhen: string[];
  avoidWhen: string[];
  architecture: {
    layout: string;
    principles: string[];
  };
  technology: StackTechnology[];
  team: StackRole[];
  sections: StackSection[];
  checks: StackCheck[];
  requiredEvidence: EvidenceKind[];
  bootstrap: StackBootstrapStep[];
};

export type StackSummary = Pick<StackPack, 'id' | 'version' | 'title' | 'tag' | 'useWhen'> & {
  starter: string;
  sections: Array<Pick<StackSection, 'id' | 'title' | 'summary'>>;
};
