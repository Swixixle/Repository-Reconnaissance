import { parseHotspotsFromFile } from "../client/src/historyDiff/parse";
import { resolveInputPath } from "../client/src/historyDiff/resolveInputPath";
import { metricValue, topNByMetric } from "../client/src/historyDiff/metrics";
import { computeHistoryDiff } from "../client/src/historyDiff/diff";
import { writeHistoryDiffJson, writeHistoryDiffMarkdown } from "../client/src/historyDiff/output";

export async function reconHistoryDiff({
  before,
  after,
  metric = "score",
  focus = 15,
  threshold = 0,
  failOn = "none",
  output = "./out/history-diff",
  format = "both",
  verbose = false,
}: {
  before: string;
  after: string;
  metric?: "score" | "commits" | "churn" | "authors";
  focus?: number;
  threshold?: number;
  failOn?: "none" | "regression" | "high" | "med" | "any";
  output?: string;
  format?: "json" | "md" | "both";
  verbose?: boolean;
}) {
  const fs = require("fs");
  const path = require("path");
  fs.mkdirSync(output, { recursive: true });
  const beforePath = resolveInputPath(before);
  const afterPath = resolveInputPath(after);
  const beforeParsed = parseHotspotsFromFile(beforePath);
  const afterParsed = parseHotspotsFromFile(afterPath);
  const diff = computeHistoryDiff(
    beforeParsed.entries,
    afterParsed.entries,
    metric,
    focus,
    threshold
  );
  if (format === "json" || format === "both") {
    writeHistoryDiffJson(diff, path.join(output, "history-diff.json"));
  }
  if (format === "md" || format === "both") {
    writeHistoryDiffMarkdown(diff, path.join(output, "history-diff.md"), verbose);
  }

  // Fail-on logic
  let exitCode = 0;
  if (failOn === "any" && (diff.regressions.length || diff.improvements.length)) exitCode = 2;
  else if (failOn === "regression" && diff.regressions.length) exitCode = 2;
  else if (failOn === "high" && diff.regressions.some(r => r.severity === "high")) exitCode = 2;
  else if (failOn === "med" && diff.regressions.some(r => r.severity === "high" || r.severity === "med")) exitCode = 2;
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}
