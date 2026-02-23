import fs from 'fs';
import path from 'path';
import { diffDossiers } from './diff/dossierDiff';

function resolveDossierInput(input: string): any {
  let dossierPath = input;
  if (fs.existsSync(input) && fs.lstatSync(input).isDirectory()) {
    dossierPath = path.join(input, 'dossier.json');
  }
  if (!fs.existsSync(dossierPath)) throw new Error(`Dossier not found: ${dossierPath}`);
  const raw = fs.readFileSync(dossierPath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse dossier: ${dossierPath}`);
  }
}

export async function reconDiff({ before, after, outputDir }: { before: string, after: string, outputDir: string }) {
  const beforeDossier = resolveDossierInput(before);
  const afterDossier = resolveDossierInput(after);
  const diff = diffDossiers(beforeDossier, afterDossier);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'diff.json'), JSON.stringify(diff, null, 2));
  // TODO: Render Markdown
}
