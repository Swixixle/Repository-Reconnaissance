import { HotspotsReport, DossierChangeHotspots } from "./types";

export function embedForDossier(report: HotspotsReport, topN: number): DossierChangeHotspots {
  return {
    window: report.window,
    totals: report.totals,
    top: report.hotspots.slice(0, topN).map(h => ({
      path: h.path,
      commits: h.commits,
      churn: h.churn,
      authors: h.authors,
      score: h.score,
      flags: h.flags,
    })),
  };
}
