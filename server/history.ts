import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { runHistory } from "../client/src/history/runHistory";
import { renderHotspotsMarkdown } from "../client/src/history/renderHotspotsMarkdown";

export async function reconHistory({
  repo,
  since = "90d",
  output,
  format = "both",
  top = 30,
  include,
  exclude,
}: {
  repo: string;
  since?: string;
  output?: string;
  format?: "json" | "md" | "both";
  top?: number;
  include?: string[];
  exclude?: string[];
}) {
  const repoName = path.basename(repo);
  const outputDir = output || path.join("out", repoName, "history");
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  const report = await runHistory({
    repoPath: repo,
    since,
    top,
    includeGlobs: include,
    excludeGlobs: exclude,
  });

  if (format === "json" || format === "both") {
    await fs.writeFile(
      path.join(outputDir, "hotspots.json"),
      JSON.stringify(report, null, 2),
      "utf-8"
    );
  }
  if (format === "md" || format === "both") {
    await fs.writeFile(
      path.join(outputDir, "hotspots.md"),
      renderHotspotsMarkdown(report),
      "utf-8"
    );
  }
  return outputDir;
}
