import { DiffCategory, ChangeType, Severity, DossierDiff } from './types';

// Normalize a key for stable diffing
export function normalizeKey(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^[^\w]+|[^\w]+$/g, '') // remove surrounding punctuation
    .replace(/–|—/g, '-') // normalize dashes
    .replace(/“|”|"/g, '') // remove quotes
    ;
}

// Main diff function (stub, to be implemented)
export function diffDossiers(before: any, after: any): DossierDiff {
  // TODO: Implement semantic diff logic for all categories
  return {
    generated_at: new Date().toISOString(),
    before: {
      repo: before.repo || 'unknown',
      git_hash: before.git_hash,
      generated_at: before.generated_at || 'unknown',
      source: before.source,
    },
    after: {
      repo: after.repo || 'unknown',
      git_hash: after.git_hash,
      generated_at: after.generated_at || 'unknown',
      source: after.source,
    },
    changes: [],
    totals: { added: 0, removed: 0, modified: 0 },
  };
}
