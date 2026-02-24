import { hashClaimExcerpt } from '../../src/claims/hash';
import * as fs from 'fs';
import * as path from 'path';

describe('Canonicalization v1', () => {
  const fixtures = [
    { file: 'crlf.txt', start: 1, end: 3, goldenHash: 'TODO', goldenExcerpt: 'TODO' },
    { file: 'lf.txt', start: 1, end: 3, goldenHash: 'TODO', goldenExcerpt: 'TODO' },
    { file: 'cr.txt', start: 1, end: 3, goldenHash: 'TODO', goldenExcerpt: 'TODO' },
    { file: 'trailing.txt', start: 1, end: 3, goldenHash: 'TODO', goldenExcerpt: 'TODO' },
    { file: 'bom.txt', start: 1, end: 3, goldenHash: 'TODO', goldenExcerpt: 'TODO' },
    { file: 'invalid_utf8.txt', start: 1, end: 3, goldenHash: null, goldenExcerpt: null },
  ];

  fixtures.forEach(f => {
    it(`canonicalizes and hashes ${f.file}`, () => {
      const filePath = path.join(__dirname, 'fixtures', f.file);
      const result = hashClaimExcerpt(filePath, f.start, f.end);
      if (f.goldenHash) {
        expect(result.excerptHash).toBe(f.goldenHash);
        expect(result.canonicalExcerpt).toBe(f.goldenExcerpt);
      } else {
        expect(result.error).toBe('ENCODING_ERROR');
      }
    });
  });
});
