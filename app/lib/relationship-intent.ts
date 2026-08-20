export type RelationshipIntent = 'SUGAR' | 'TRADITIONAL' | 'BOTH';
export type RelationshipMode = 'COMPATIBLE' | 'SUGAR' | 'TRADITIONAL';

export const relationshipIntentOptions: Array<{
  value: RelationshipIntent;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    value: 'SUGAR',
    label: 'Relacionamento Sugar',
    shortLabel: 'Sugar',
    description: 'Quero uma conexão com dinâmica e expectativas Sugar.',
  },
  {
    value: 'TRADITIONAL',
    label: 'Relacionamento tradicional',
    shortLabel: 'Tradicional',
    description: 'Quero uma conexão romântica sem expectativas financeiras.',
  },
  {
    value: 'BOTH',
    label: 'Aberto aos dois',
    shortLabel: 'Sugar e tradicional',
    description: 'Estou aberto a conhecer pessoas nos dois contextos.',
  },
];

export function normalizeRelationshipIntent(
  value?: string | null,
): RelationshipIntent {
  return value === 'TRADITIONAL' || value === 'BOTH' ? value : 'SUGAR';
}

export function getRelationshipIntentLabel(value?: string | null) {
  const normalized = normalizeRelationshipIntent(value);
  return (
    relationshipIntentOptions.find((option) => option.value === normalized)
      ?.shortLabel ?? 'Sugar'
  );
}

export function getDefaultRelationshipMode(
  value?: string | null,
): RelationshipMode {
  const intent = normalizeRelationshipIntent(value);
  return intent === 'BOTH' ? 'COMPATIBLE' : intent;
}
