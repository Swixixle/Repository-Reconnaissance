export type HotspotsReport = {
  generated_at: string;
  repo: { name: string; path: string; git_hash?: string; branch?: string };
  window: { since: string; until: string };
  totals: { files_touched: number; commits_scanned: number };
  hotspots: Array<{
    path: string;
    commits: number;
    churn: { added: number | null; deleted: number | null; binary: boolean };
    authors: number;
    score: number;
    flags: string[];
  }>;
};

// For embedding in dossier JSON
export type DossierChangeHotspots = {
  window: { since: string; until: string };
  totals: { files_touched: number; commits_scanned: number };
  top: Array<{
    path: string;
    commits: number;
    churn: { added: number | null; deleted: number | null; binary: boolean };
    authors: number;
    score: number;
    flags: string[];
  }>;
};