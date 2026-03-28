import path from "node:path";

/**
 * Sanitize a user-supplied identifier for use in filesystem paths.
 * Only allows alphanumeric characters, hyphens, underscores, and dots.
 * Prevents path traversal attacks (when used for path segments, not full paths).
 */
export function sanitizePathSegment(input: string): string {
  const sanitized = input
    .replace(/\.\./g, "")
    .replace(/[/\\]/g, "")
    .replace(/[^a-zA-Z0-9\-_.]/g, "");

  if (!sanitized) {
    throw new Error("Invalid path segment after sanitization");
  }

  return sanitized;
}

/**
 * Safely join a base directory with a user-supplied segment.
 * Verifies the result stays within the base directory.
 */
export function safeJoin(baseDir: string, userSegment: string): string {
  const sanitized = sanitizePathSegment(userSegment);
  const resolved = path.resolve(baseDir, sanitized);
  const base = path.resolve(baseDir);
  const rel = path.relative(base, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}

/**
 * Ensure a concrete file path (e.g. multer output) resolves inside an expected directory.
 */
export function assertResolvedPathUnderBase(candidatePath: string, baseDir: string): void {
  const base = path.resolve(baseDir);
  const resolved = path.resolve(candidatePath);
  const rel = path.relative(base, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("Path not under allowed directory");
  }
}
