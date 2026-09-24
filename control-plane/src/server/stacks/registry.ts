import type { EvidenceKind } from '../domain/types.js';
import { medusaCommerceStack } from './medusa-commerce.js';
import type { StackPack, StackSummary } from './types.js';

const packs: readonly StackPack[] = [medusaCommerceStack];

export const stackIds = packs.map((pack) => pack.id);

export function listStacks(): StackSummary[] {
  return packs.map(({ id, version, title, tag, useWhen, starter, sections }) => ({
    id,
    version,
    title,
    tag,
    useWhen,
    starter: starter.repository,
    sections: sections.map(({ id: sectionId, title: sectionTitle, summary }) => ({ id: sectionId, title: sectionTitle, summary })),
  }));
}

export function getStack(id: string): StackPack {
  const pack = packs.find((candidate) => candidate.id === id);
  if (!pack) throw new Error(`Unknown stack: ${id}. Known stacks: ${stackIds.join(', ')}`);
  return pack;
}

/** The stacks a project opted into through its `stack:<id>` tags. Unknown tags are ignored. */
export function stacksForTags(tags: readonly string[]): StackPack[] {
  return packs.filter((pack) => tags.includes(pack.tag));
}

/** Evidence that every stack the project uses cannot ship without, on top of its risk tier. */
export function stackRequiredEvidence(tags: readonly string[]): EvidenceKind[] {
  return [...new Set(stacksForTags(tags).flatMap((pack) => pack.requiredEvidence))];
}
