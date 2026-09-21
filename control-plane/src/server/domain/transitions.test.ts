import { describe, expect, it } from 'vitest';
import { assertSpecTransition } from './transitions.js';

describe('assertSpecTransition', () => {
  it('accepts the intended happy path', () => {
    const path = ['draft', 'clarified', 'planned', 'implementing', 'verifying', 'accepted', 'shipped'] as const;
    for (let index = 0; index < path.length - 1; index += 1) {
      expect(() => assertSpecTransition(path[index]!, path[index + 1]!)).not.toThrow();
    }
  });

  it('rejects skipping directly from draft to shipped', () => {
    expect(() => assertSpecTransition('draft', 'shipped')).toThrow('Invalid spec transition');
  });

  it('allows a blocked spec to resume at an explicit lifecycle state', () => {
    expect(() => assertSpecTransition('blocked', 'implementing')).not.toThrow();
  });
});
