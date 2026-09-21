import type { SpecState } from './types.js';

const transitions: Record<SpecState, ReadonlySet<SpecState>> = {
  draft: new Set(['clarified', 'blocked', 'cancelled']),
  clarified: new Set(['planned', 'draft', 'blocked', 'cancelled']),
  planned: new Set(['implementing', 'clarified', 'blocked', 'cancelled']),
  implementing: new Set(['verifying', 'planned', 'blocked', 'cancelled']),
  verifying: new Set(['accepted', 'implementing', 'blocked', 'cancelled']),
  accepted: new Set(['shipped', 'implementing', 'blocked']),
  shipped: new Set([]),
  blocked: new Set(['draft', 'clarified', 'planned', 'implementing', 'verifying', 'accepted', 'cancelled']),
  cancelled: new Set([]),
};

export function assertSpecTransition(from: SpecState, to: SpecState): void {
  if (from === to) return;
  if (!transitions[from].has(to)) throw new Error(`Invalid spec transition: ${from} -> ${to}`);
}
