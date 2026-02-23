import { HotspotEntry } from "./parse";

export type Metric = "score" | "commits" | "churn" | "authors";

export function metricValue(entry: HotspotEntry, metric: Metric): number {
  switch (metric) {
    case "score":
      return entry.score;
    case "commits":
      return entry.commits;
    case "authors":
      return entry.authors;
    case "churn":
      return (entry.churn.added || 0) + (entry.churn.deleted || 0);
    default:
      return 0;
  }
}

export function topNByMetric(entries: HotspotEntry[], metric: Metric, n: number): HotspotEntry[] {
  return entries
    .slice()
    .sort((a, b) => {
      const va = metricValue(a, metric);
      const vb = metricValue(b, metric);
      if (vb !== va) return vb - va;
      return a.path.localeCompare(b.path);
    })
    .slice(0, n);
}
