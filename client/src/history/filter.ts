import micromatch from "micromatch";

export function shouldIncludePath(
  p: string,
  includeGlobs?: string[],
  excludeGlobs?: string[]
): boolean {
  const norm = p.replace(/\\/g, "/").replace(/^\.\//, "").trim();
  const sortedInclude = includeGlobs ? [...includeGlobs].sort() : [];
  const sortedExclude = excludeGlobs ? [...excludeGlobs].sort() : [];
  if (sortedExclude.length && micromatch.isMatch(norm, sortedExclude)) return false;
  if (sortedInclude.length) return micromatch.isMatch(norm, sortedInclude);
  return true;
}
