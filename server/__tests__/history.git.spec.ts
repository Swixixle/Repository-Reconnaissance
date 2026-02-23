import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { runHistory } from "../../client/src/history/runHistory";

describe("runHistory with real git repo", () => {
  let repoDir: string;
  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: "Test User",
    GIT_AUTHOR_EMAIL: "test@example.com",
    GIT_COMMITTER_NAME: "Test User",
    GIT_COMMITTER_EMAIL: "test@example.com",
  };

  beforeEach(() => {
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), "history-git-test-"));
    execSync("git init", { cwd: repoDir, env });
    fs.writeFileSync(path.join(repoDir, "a.ts"), "a1\n");
    execSync("git add a.ts", { cwd: repoDir, env });
    execSync("git commit -m 'add a.ts 1'", { cwd: repoDir, env });
    fs.writeFileSync(path.join(repoDir, "a.ts"), "a2\n");
    execSync("git add a.ts", { cwd: repoDir, env });
    execSync("git commit -m 'add a.ts 2'", { cwd: repoDir, env });
    fs.writeFileSync(path.join(repoDir, "a.ts"), "a3\n");
    execSync("git add a.ts", { cwd: repoDir, env });
    execSync("git commit -m 'add a.ts 3'", { cwd: repoDir, env });
    fs.writeFileSync(path.join(repoDir, "b.ts"), "b1\n");
    execSync("git add b.ts", { cwd: repoDir, env });
    execSync("git commit -m 'add b.ts'", { cwd: repoDir, env });
  });

  afterEach(() => {
    fs.rmSync(repoDir, { recursive: true, force: true });
  });


  it("counts commit frequency per file and sorts", async () => {
    const report = await runHistory({ repoPath: repoDir, since: "365d", top: 10, now: "2026-02-22T00:00:00.000Z" });
    expect(report.totals.commits_scanned).toBeGreaterThanOrEqual(4);
    expect(report.hotspots.length).toBeGreaterThanOrEqual(2);
    expect(report.hotspots[0].path).toBe("a.ts");
    expect(report.hotspots[0].commits).toBe(3);
    expect(report.hotspots[1].path).toBe("b.ts");
    expect(report.hotspots[1].commits).toBe(1);
  });

  it("computes churn and score", async () => {
    // Add churn to a.ts
    fs.writeFileSync(path.join(repoDir, "a.ts"), "a4\na5\na6\n");
    execSync("git add a.ts", { cwd: repoDir, env });
    execSync("git commit -m 'add lines to a.ts'", { cwd: repoDir, env });
    fs.writeFileSync(path.join(repoDir, "a.ts"), "a7\n");
    execSync("git add a.ts", { cwd: repoDir, env });
    execSync("git commit -m 'add 1 line to a.ts'", { cwd: repoDir, env });
    const report = await runHistory({ repoPath: repoDir, since: "365d", top: 10, now: "2026-02-22T00:00:00.000Z" });
    const a = report.hotspots.find(h => h.path === "a.ts");
    expect(a).toBeTruthy();
    expect(a!.churn.added).toBeGreaterThanOrEqual(4); // at least 4 lines added
    expect(a!.score).toBeGreaterThan(a!.commits); // score > commits if churn > 0
  });

  it("counts unique authors per file", async () => {
    // Commit as another author
    fs.writeFileSync(path.join(repoDir, "a.ts"), "a8\n");
    execSync("git add a.ts", { cwd: repoDir, env: { ...env, GIT_AUTHOR_NAME: "Other", GIT_AUTHOR_EMAIL: "other@example.com", GIT_COMMITTER_NAME: "Other", GIT_COMMITTER_EMAIL: "other@example.com" } });
    execSync("git commit -m 'other author'", { cwd: repoDir, env: { ...env, GIT_AUTHOR_NAME: "Other", GIT_AUTHOR_EMAIL: "other@example.com", GIT_COMMITTER_NAME: "Other", GIT_COMMITTER_EMAIL: "other@example.com" } });
    const report = await runHistory({ repoPath: repoDir, since: "365d", top: 10, now: "2026-02-22T00:00:00.000Z" });
    const a = report.hotspots.find(h => h.path === "a.ts");
    expect(a).toBeTruthy();
    expect(a!.authors).toBeGreaterThanOrEqual(2);
  });

  it("handles binary files and flags", async () => {
    // Create a binary file
    const binPath = path.join(repoDir, "bin.dat");
    fs.writeFileSync(binPath, Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
    execSync("git add bin.dat", { cwd: repoDir, env });
    execSync("git commit -m 'add binary file'", { cwd: repoDir, env });
    const report = await runHistory({ repoPath: repoDir, since: "365d", top: 10, now: "2026-02-22T00:00:00.000Z" });
    const bin = report.hotspots.find(h => h.path === "bin.dat");
    expect(bin).toBeTruthy();
    expect(bin!.churn.binary).toBe(true);
    expect(bin!.flags.includes("binary")).toBe(true);
    expect(bin!.churn.added).toBe(0);
    expect(bin!.churn.deleted).toBe(0);
  });

  it("is deterministic (except generated_at)", async () => {
    const report1 = await runHistory({ repoPath: repoDir, since: "365d", top: 10, now: "2026-02-22T00:00:00.000Z" });
    const report2 = await runHistory({ repoPath: repoDir, since: "365d", top: 10, now: "2026-02-22T00:00:00.000Z" });
    // Overwrite generated_at for comparison
    report1.generated_at = report2.generated_at = "fixed";
    expect(report1).toEqual(report2);
  });

  it("filters by include globs", async () => {
    const report = await runHistory({ repoPath: repoDir, since: "365d", top: 10, includeGlobs: ["**/a.ts"] });
    expect(report.hotspots.length).toBe(1);
    expect(report.hotspots[0].path).toBe("a.ts");
  });

  it("deterministic sorting when commits equal", async () => {
    fs.writeFileSync(path.join(repoDir, "c.ts"), "c1\n");
    execSync("git add c.ts", { cwd: repoDir, env });
    execSync("git commit -m 'add c.ts'", { cwd: repoDir, env });
    const report = await runHistory({ repoPath: repoDir, since: "365d", top: 10 });
    const oneCommitFiles = report.hotspots.filter(h => h.commits === 1).map(h => h.path);
    expect(oneCommitFiles).toEqual(["b.ts", "c.ts"]);
    // Sorted by path asc
    expect(report.hotspots.map(h => h.path)).toEqual(["a.ts", "b.ts", "c.ts"]);
  });
});
