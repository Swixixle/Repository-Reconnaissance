import { HotspotsReport } from "./types";

export function renderHotspotsMarkdown(report: HotspotsReport): string {
  let md = `# Hotspots Report\n`;
  md += `Generated at: ${report.generated_at}\n`;
  md += `Repo: ${report.repo.name} (${report.repo.path})\n`;
  md += `Window: ${report.window.since} → ${report.window.until}\n`;
  if (!report.hotspots.length) {
    md += `\nNo hotspots found in the selected window.\n`;
  } else {
    md += `\n| Path | Score | Commits | Churn | Authors | Flags |\n`;
    md += `| ---- | ----- | ------- | ----- | ------- | ----- |\n`;
    for (const h of report.hotspots) {
      const churnTotal = h.churn.binary ? 0 : h.churn.added + h.churn.deleted;
      const churnStr = h.churn.binary
        ? "binary"
        : `+${h.churn.added}/-${h.churn.deleted} (${churnTotal})`;
      md += `| ${h.path} | ${h.score.toFixed(3)} | ${h.commits} | ${churnStr} | ${h.authors} | ${h.flags.join(", ")} |\n`;
    }
  }
  return md;
}
