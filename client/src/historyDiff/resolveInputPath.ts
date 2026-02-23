import * as fs from "fs";
import * as path from "path";

export function resolveInputPath(p: string): string {
  if (fs.statSync(p).isDirectory()) {
    const dossier = path.join(p, "dossier.json");
    const hotspots = path.join(p, "hotspots.json");
    if (fs.existsSync(dossier)) return dossier;
    if (fs.existsSync(hotspots)) return hotspots;
    throw new Error(`Directory ${p} does not contain dossier.json or hotspots.json`);
  }
  if (fs.statSync(p).isFile()) return p;
  throw new Error(`Path ${p} is neither a file nor a directory`);
}
