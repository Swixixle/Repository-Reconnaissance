import { diffDossier } from '../../src/claims/diffDossier';
import * as path from 'path';

describe('diffDossier', () => {
  const oldPath = path.join(__dirname, '../fixtures/old_dossier.json');
  const newPath = path.join(__dirname, '../fixtures/new_dossier.json');
  const outPath = path.join(__dirname, '../fixtures/diff_dossier.json');

  it('should classify UNKNOWNs and commit delta correctly', () => {
    const delta = diffDossier(oldPath, newPath, outPath);
    expect(delta).toHaveProperty('unknowns');
    expect(delta.unknowns).toHaveProperty('persisted_unknowns');
    expect(delta.unknowns).toHaveProperty('resolved_unknowns');
    expect(delta.unknowns).toHaveProperty('new_unknowns');
    expect(typeof delta.time_delta_seconds).toBe('number');
    expect(delta.commit_changed).toBe(true);
    expect(delta.commit_from).not.toBe(delta.commit_to);
    expect(delta.scores_delta).toHaveProperty('confidence_overall_delta');
    expect(delta.scores_delta).toHaveProperty('critical_unknowns_delta');
  });
});
