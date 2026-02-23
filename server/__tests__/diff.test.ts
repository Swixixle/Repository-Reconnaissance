import { describe, it, expect } from 'vitest';
import { diffDossiers, normalizeKey } from '../diff/dossierDiff';
import fs from 'fs';
import path from 'path';

describe('Dossier Diff', () => {
  it('should diff capabilities, unknowns, risks, and dependencies', () => {
    const before = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'diff', 'before.dossier.json'), 'utf-8'));
    const after = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'diff', 'after.dossier.json'), 'utf-8'));
    const diff = diffDossiers(before, after);
    expect(diff.changes).toBeInstanceOf(Array);
    // TODO: Add assertions for counts, keys, regression summary, and stable ordering
  });
  it('should normalize keys deterministically', () => {
    expect(normalizeKey('  "Hello–World"  ')).toBe('hello-world');
    expect(normalizeKey('“Risk: 123”')).toBe('risk: 123');
  });
});
