export type HotspotEntry = {
  path: string;
  commits: number;
  churn: { added: number | null; deleted: number | null; binary: boolean };
  authors: number;
  score: number;
  flags: string[];
};

export function parseHotspotsFromFile(filePath: string): {
  source: "hotspots" | "dossier";
  entries: HotspotEntry[];
} {
  const fs = require("fs");
  const path = require("path");
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let entries: HotspotEntry[] = [];
  let source: "hotspots" | "dossier";

  if (Array.isArray(raw.hotspots)) {
    source = "hotspots";
    entries = raw.hotspots.map(normalizeEntry);
  } else if (raw.change_hotspots && Array.isArray(raw.change_hotspots.top)) {
    source = "dossier";
    entries = raw.change_hotspots.top.map(normalizeEntry);
  } else {
    throw new Error("Input is neither hotspots.json nor dossier.json (missing hotspots/change_hotspots)." );
  }
  return { source, entries };
}

function normalizeEntry(entry: any): HotspotEntry {
  return {
    path: normalizePath(entry.path),
    commits: Number(entry.commits) || 0,
    churn: {
      added: entry.churn?.added ?? 0,
      deleted: entry.churn?.deleted ?? 0,
      binary: !!entry.churn?.binary,
    },
    authors: Number(entry.authors) || 0,
    score: typeof entry.score === "number" ? entry.score : 0,
    flags: Array.isArray(entry.flags) ? entry.flags : [],
  };
}

function normalizePath(p: string): string {
  if (!p) return "";
  return p.replace(/\\/g, "/").replace(/^\.{1,2}\//, "").trim();
}
