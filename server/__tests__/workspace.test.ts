import { describe, it, expect } from 'vitest';
import { reconWorkspace } from '../reconWorkspace';
import fs from 'fs';
import path from 'path';

describe('Workspace Mode', () => {
  it('should detect repos and emit graph.json', async () => {
    const fixtureGlob = path.join(__dirname, 'fixtures', 'workspace', '*');
    const outDir = path.join(__dirname, 'out');
    await reconWorkspace(fixtureGlob, outDir);
    const graphPath = path.join(outDir, 'workspace', 'graph.json');
    expect(fs.existsSync(graphPath)).toBe(true);
    const graph = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));
    expect(Array.isArray(graph.repos)).toBe(true);
    expect(Array.isArray(graph.edges)).toBe(true);
  });
  // TODO: Add tests for edge detection, evidence, and risk rating
});
