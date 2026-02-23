
import { HotspotsReport } from "./types";
import path from "path";
import { git, isGitRepo, getHeadHash, getBranch } from "./git";
import { shouldIncludePath } from "./filter";
import { extractChurn, extractAuthors } from "./metrics";


export async function runHistory(opts: {
  repoPath: string;
  since: string;
  top: number;
  includeGlobs?: string[];
  excludeGlobs?: string[];
  now?: string;
}): Promise<HotspotsReport> {
  const repoName = path.basename(opts.repoPath);
  if (!(await isGitRepo(opts.repoPath))) {
    throw new Error(`Not a git repository: ${opts.repoPath}`);
  }

  // Frequency map (commits per file)
  // Use same logic as before
  const { stdout: freqStdout } = await git(opts.repoPath, [
    "log",
    `--since=${opts.since}`,
    "--name-only",
    "--pretty=format:%H",
  ]);
  const freqLines = freqStdout.split(/\r?\n/);
  let currentCommit: string | null = null;
  let commits_scanned = 0;
  const freqByFile = new Map<string, number>();
  const commitHashes = new Set<string>();
  const seenInCommit = new Set<string>();
  for (const line of freqLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^[0-9a-f]{40}$/.test(trimmed)) {
      currentCommit = trimmed;
      seenInCommit.clear();
      commitHashes.add(trimmed);
      commits_scanned++;
      continue;
    }
    if (currentCommit) {
      let norm = trimmed.replace(/\\/g, "/").replace(/^\.\//, "").trim();
      if (!shouldIncludePath(norm, opts.includeGlobs, opts.excludeGlobs)) continue;
      if (seenInCommit.has(norm)) continue;
      seenInCommit.add(norm);
      freqByFile.set(norm, (freqByFile.get(norm) || 0) + 1);
    }
  }

  // Churn
  const churnByFile = await extractChurn(
    opts.repoPath,
    opts.since,
    opts.includeGlobs,
    opts.excludeGlobs
  );

  // Authors
  const authorsByFile = await extractAuthors(
    opts.repoPath,
    opts.since,
    opts.includeGlobs,
    opts.excludeGlobs
  );

  // Union of all files
  const fileSet = new Set([
    ...freqByFile.keys(),
    ...churnByFile.keys(),
    ...authorsByFile.keys(),
  ]);
  const files = Array.from(fileSet).filter((p) =>
    shouldIncludePath(p, opts.includeGlobs, opts.excludeGlobs)
  );

  // Compute metrics for each file
  const hotspots = files.map((file) => {
    const commits = freqByFile.get(file) || 0;
    const churn = churnByFile.get(file) || { added: 0, deleted: 0, binary: false };
    const authors = (authorsByFile.get(file)?.size) || 0;
    const churnTotal = churn.binary ? 0 : churn.added + churn.deleted;
    const score = commits === 0 ? 0 : commits * Math.log(1 + churnTotal);
    return {
      path: file,
      commits,
      churn,
      authors,
      score,
      flags: [], // filled below
    };
  });

  // Percentile helpers
  function percentile(values: number[], p: number): number {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const rank = Math.ceil(p * sorted.length);
    const idx = Math.max(rank - 1, 0);
    return sorted[idx];
  }

  // Compute p90s
  let p90Commits = 0, p90Churn = 0, p90Authors = 0;
  if (hotspots.length >= 10) {
    p90Commits = percentile(hotspots.map(h => h.commits), 0.9);
    p90Churn = percentile(hotspots.map(h => h.churn.binary ? 0 : h.churn.added + h.churn.deleted), 0.9);
    p90Authors = percentile(hotspots.map(h => h.authors), 0.9);
  }

  // Add flags
  for (const h of hotspots) {
    const churnTotal = h.churn.binary ? 0 : h.churn.added + h.churn.deleted;
    const flags: string[] = [];
    if (hotspots.length >= 10 && h.commits >= p90Commits) flags.push("high_frequency");
    if (hotspots.length >= 10 && churnTotal >= p90Churn) flags.push("high_churn");
    if (hotspots.length >= 10 && h.authors >= p90Authors && h.authors >= 3) flags.push("high_authors");
    if (h.churn.binary) flags.push("binary");
    h.flags = flags.sort();
  }

  // Sorting
  hotspots.sort((a, b) =>
    b.score - a.score ||
    b.commits - a.commits ||
    ((b.churn.binary ? 0 : b.churn.added + b.churn.deleted) - (a.churn.binary ? 0 : a.churn.added + a.churn.deleted)) ||
    a.path.localeCompare(b.path)
  );

  // Truncate
  const topHotspots = hotspots.slice(0, opts.top);

  return {
    generated_at: opts.now || new Date().toISOString(),
    repo: {
      name: repoName,
      path: opts.repoPath,
      git_hash: await getHeadHash(opts.repoPath),
      branch: await getBranch(opts.repoPath),
    },
    window: {
      since: opts.since,
      until: opts.now || "now",
    },
    totals: {
      files_touched: files.length,
      commits_scanned,
    },
    hotspots: topHotspots,
  };
}
