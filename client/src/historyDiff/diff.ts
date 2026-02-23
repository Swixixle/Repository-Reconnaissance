import { HotspotEntry } from "./parse";
import { Metric, metricValue, topNByMetric } from "./metrics";
import { severity, Severity } from "./severity";

export type HistoryDiff = {
  generated_at: string;
  metric: Metric;
  focus_top: number;
  threshold: number;
  regressions: Array<{
    path: string;
    before: number;
    after: number;
    delta: number;
    severity: Severity;
    reason: string;
  }>;
  improvements: Array<{
    path: string;
    before: number;
    after: number;
    delta: number;
    severity: Severity;
    reason: string;
  }>;
  totals: { regressions: number; improvements: number };
};

export function computeHistoryDiff(
  beforeEntries: HotspotEntry[],
  afterEntries: HotspotEntry[],
  metric: Metric,
  focus_top: number,
  threshold: number,
  now?: string
): HistoryDiff {
  const topBefore = topNByMetric(beforeEntries, metric, focus_top);
  const topAfter = topNByMetric(afterEntries, metric, focus_top);
  const trackedPaths = Array.from(
    new Set([...topBefore.map(e => e.path), ...topAfter.map(e => e.path)])
  ).sort();

  const beforeMap = Object.fromEntries(beforeEntries.map(e => [e.path, e]));
  const afterMap = Object.fromEntries(afterEntries.map(e => [e.path, e]));

  const regressions = [];
  const improvements = [];

  for (const path of trackedPaths) {
    const beforeVal = metricValue(beforeMap[path] || {}, metric);
    const afterVal = metricValue(afterMap[path] || {}, metric);
    const delta = afterVal - beforeVal;
    if (delta > threshold) {
      let reason = "";
      if (!beforeMap[path]) reason = "New hotspot in after top set";
      else reason = "Metric increased";
      const sev = severity(metric, beforeVal, afterVal, delta);
      regressions.push({ path, before: beforeVal, after: afterVal, delta, severity: sev, reason });
    } else if (delta < -threshold) {
      let reason = "";
      if (!afterMap[path]) reason = "Dropped from after top set";
      else reason = "Metric decreased";
      const sev = severity(metric, beforeVal, afterVal, delta);
      improvements.push({ path, before: beforeVal, after: afterVal, delta, severity: sev, reason });
    }
  }

  regressions.sort((a, b) => {
    const sevOrder = { high: 2, med: 1, low: 0 };
    if (sevOrder[b.severity] !== sevOrder[a.severity]) return sevOrder[b.severity] - sevOrder[a.severity];
    if (b.delta !== a.delta) return b.delta - a.delta;
    return a.path.localeCompare(b.path);
  });
  improvements.sort((a, b) => {
    if (a.delta !== b.delta) return a.delta - b.delta;
    return a.path.localeCompare(b.path);
  });

  return {
    generated_at: now || new Date().toISOString(),
    metric,
    focus_top,
    threshold,
    regressions,
    improvements,
    totals: { regressions: regressions.length, improvements: improvements.length },
  };
}
