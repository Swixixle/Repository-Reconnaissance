/**
 * Strict hostname checks for HTTPS URLs — avoids substring / endsWith("foo.com") bypasses
 * (e.g. evilgithub.com, replit.com.evil.com).
 */

export function canonicalHost(hostname: string): string {
  return hostname.replace(/^www\./i, "").toLowerCase();
}

/** True if `host` is exactly `root` or a DNS subdomain of `root` (e.g. gist.github.com under github.com). */
export function isHostnameUnderRoot(host: string, root: string): boolean {
  const h = canonicalHost(host);
  const r = root.toLowerCase();
  return h === r || h.endsWith(`.${r}`);
}

/**
 * Parse URL (add https if missing), require https:, and check hostname against allowed registrable roots.
 */
export function isAllowedHttpsUrlHost(rawUrl: string, allowedRoots: string[]): boolean {
  try {
    const t = rawUrl.trim();
    const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
    const u = new URL(withScheme);
    if (u.protocol !== "https:") return false;
    const host = canonicalHost(u.hostname);
    return allowedRoots.some((root) => isHostnameUnderRoot(host, root));
  } catch {
    return false;
  }
}
