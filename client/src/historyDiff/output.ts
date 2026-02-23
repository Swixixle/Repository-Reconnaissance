import { HistoryDiff } from "./diff";

export function writeHistoryDiffJson(diff: HistoryDiff, outPath: string) {
  const fs = require("fs");
  fs.writeFileSync(outPath, JSON.stringify(diff, null, 2));
}

export function writeHistoryDiffMarkdown(diff: HistoryDiff, outPath: string, verbose = false) {
  const fs = require("fs");
  let lines = [];
  lines.push(`# History Diff Report`);
  lines.push(`Metric: ${diff.metric}`);
  lines.push(`Focus top: ${diff.focus_top}`);
  lines.push(`Threshold: ${diff.threshold}`);
  lines.push("");
  lines.push(`Regressions: ${diff.totals.regressions}`);
  lines.push(`Improvements: ${diff.totals.improvements}`);
  lines.push("");
  if (diff.regressions.length) {
    lines.push("## Regressions");
    lines.push("| Path | Before | After | Delta | Severity | Reason |");
    lines.push("| ---- | ------ | ----- | ----- | -------- | ------ |");
    for (const r of diff.regressions) {
      lines.push(`| ${r.path} | ${formatVal(diff.metric, r.before)} | ${formatVal(diff.metric, r.after)} | ${formatVal(diff.metric, r.delta)} | ${r.severity} | ${r.reason} |`);
    }
    lines.push("");
  }
  if (diff.improvements.length) {
    lines.push("## Improvements");
    lines.push("| Path | Before | After | Delta | Severity | Reason |");
    lines.push("| ---- | ------ | ----- | ----- | -------- | ------ |");
    for (const r of diff.improvements) {
      lines.push(`| ${r.path} | ${formatVal(diff.metric, r.before)} | ${formatVal(diff.metric, r.after)} | ${formatVal(diff.metric, r.delta)} | ${r.severity} | ${r.reason} |`);
    }
    lines.push("");
  }
  if (verbose) {
    lines.push("## Tracked set");
    lines.push(diff.regressions.concat(diff.improvements).map(r => r.path).join(", "));
    lines.push("");
  }
  fs.writeFileSync(outPath, lines.join("\n"));
}

function formatVal(metric: string, val: number): string {
  if (metric === "score") return val.toFixed(3);
  return String(Math.round(val));
}
