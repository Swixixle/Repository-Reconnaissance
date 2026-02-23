import { git } from "./git";
import { shouldIncludePath } from "./filter";

export async function extractChurn(repoPath: string, since: string, includeGlobs?: string[], excludeGlobs?: string[]): Promise<Map<string, { added: number; deleted: number; binary: boolean }>> {
  const { stdout } = await git(repoPath, [
    "log",
    `--since=${since}`,
    "--numstat",
    "--pretty=format:%H",
  ]);
  const lines = stdout.split(/\r?\n/);
  let currentCommit: string | null = null;
  const seenInCommit = new Set<string>();
  const churnByFile = new Map<string, { added: number; deleted: number; binary: boolean }>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^[0-9a-f]{40}$/.test(trimmed)) {
      currentCommit = trimmed;
      seenInCommit.clear();
      continue;
    }
    const parts = trimmed.split("\t");
    if (parts.length === 3) {
      let [added, deleted, file] = parts;
      let norm = file.replace(/\\/g, "/").replace(/^\.\//, "").trim();
      if (!shouldIncludePath(norm, includeGlobs, excludeGlobs)) continue;
      if (seenInCommit.has(norm)) continue;
      seenInCommit.add(norm);
      let entry = churnByFile.get(norm) || { added: 0, deleted: 0, binary: false };
      if (added === "-" && deleted === "-") {
        entry.binary = true;
      } else {
        entry.added += parseInt(added, 10) || 0;
        entry.deleted += parseInt(deleted, 10) || 0;
      }
      churnByFile.set(norm, entry);
    }
  }
  return churnByFile;
}

export async function extractAuthors(repoPath: string, since: string, includeGlobs?: string[], excludeGlobs?: string[]): Promise<Map<string, Set<string>>> {
  const { stdout } = await git(repoPath, [
    "log",
    `--since=${since}`,
    "--name-only",
    "--pretty=format:%ae",
  ]);
  const lines = stdout.split(/\r?\n/);
  let currentAuthor: string | null = null;
  const seenInCommit = new Set<string>();
  const authorsByFile = new Map<string, Set<string>>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      currentAuthor = null;
      continue;
    }
    if (/^[^@\s]+@[^@\s]+$/.test(trimmed) || trimmed.includes("@")) {
      currentAuthor = trimmed.toLowerCase().trim();
      seenInCommit.clear();
      continue;
    }
    if (currentAuthor) {
      let norm = trimmed.replace(/\\/g, "/").replace(/^\.\//, "").trim();
      if (!shouldIncludePath(norm, includeGlobs, excludeGlobs)) continue;
      if (seenInCommit.has(norm)) continue;
      seenInCommit.add(norm);
      if (!authorsByFile.has(norm)) authorsByFile.set(norm, new Set());
      authorsByFile.get(norm)!.add(currentAuthor);
    }
  }
  return authorsByFile;
}
