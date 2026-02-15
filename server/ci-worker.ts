import { storage } from "./storage";
import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync, statfsSync } from "fs";

const CI_OUT_BASE = path.resolve(process.cwd(), "out", "ci");

function sanitizeGitUrl(url: string): string {
  return url.replace(/\/\/[^@]+@/, "//***@");
}

function checkDiskSpace(dir: string): { freeBytes: number; lowDisk: boolean } {
  try {
    const stats = statfsSync(dir);
    const freeBytes = stats.bfree * stats.bsize;
    const totalBytes = stats.blocks * stats.bsize;
    const freePercent = totalBytes > 0 ? (freeBytes / totalBytes) * 100 : 100;
    const LOW_DISK_BYTES = 1024 * 1024 * 1024;
    const LOW_DISK_PERCENT = 5;
    return {
      freeBytes,
      lowDisk: freeBytes < LOW_DISK_BYTES || freePercent < LOW_DISK_PERCENT,
    };
  } catch {
    return { freeBytes: -1, lowDisk: false };
  }
}

export function getCiTmpDir(): string {
  return path.resolve(process.env.CI_TMP_DIR || "/tmp/ci");
}

export function getDiskStatus(): { ciTmpDir: string; ciTmpDirFreeBytes: number; ciTmpDirLowDisk: boolean } {
  const tmpDir = getCiTmpDir();
  mkdirSync(tmpDir, { recursive: true });
  const { freeBytes, lowDisk } = checkDiskSpace(tmpDir);
  return {
    ciTmpDir: tmpDir,
    ciTmpDirFreeBytes: freeBytes,
    ciTmpDirLowDisk: lowDisk,
  };
}

export async function processOneJob(): Promise<{ processed: boolean; runId?: string; status?: string }> {
  const leased = await storage.leaseNextJob();
  if (!leased) return { processed: false };

  const { job, run } = leased;
  console.log(`[CI Worker] Leased job=${job.id} run=${run.id} repo=${run.repoOwner}/${run.repoName} sha=${run.commitSha}`);

  const outDir = path.join(CI_OUT_BASE, run.id);
  mkdirSync(outDir, { recursive: true });

  const tmpBase = getCiTmpDir();
  mkdirSync(tmpBase, { recursive: true });

  const { lowDisk } = checkDiskSpace(tmpBase);
  if (lowDisk) {
    const errMsg = "ci_tmp_dir_low_disk";
    console.error(`[CI Worker] Low disk space in ${tmpBase}, failing job`);
    await storage.updateCiRun(run.id, {
      status: "FAILED",
      finishedAt: new Date(),
      error: errMsg,
    });
    await storage.completeJob(job.id, "DEAD", errMsg);
    return { processed: true, runId: run.id, status: "FAILED" };
  }

  const runWorkDir = path.join(tmpBase, `run-${run.id}`);
  let tmpDir: string | null = null;
  try {
    await fs.mkdir(runWorkDir, { recursive: true });
    tmpDir = await fetchRepo(run.repoOwner, run.repoName, run.commitSha, runWorkDir);
    const result = await runAnalyzerOnDir(tmpDir, outDir, run.id);

    if (result.success) {
      await storage.updateCiRun(run.id, {
        status: "SUCCEEDED",
        finishedAt: new Date(),
        outDir: `out/ci/${run.id}`,
        summaryJson: result.summary || null,
      });
      await storage.completeJob(job.id, "DONE");
      console.log(`[CI Worker] Run ${run.id} SUCCEEDED`);
      return { processed: true, runId: run.id, status: "SUCCEEDED" };
    } else {
      await storage.updateCiRun(run.id, {
        status: "FAILED",
        finishedAt: new Date(),
        error: result.error || "unknown_error",
        outDir: `out/ci/${run.id}`,
      });
      await storage.completeJob(job.id, "DONE", result.error);
      console.log(`[CI Worker] Run ${run.id} FAILED: ${result.error}`);
      return { processed: true, runId: run.id, status: "FAILED" };
    }
  } catch (err: any) {
    const errMsg = sanitizeGitUrl(String(err?.message || err));
    console.error(`[CI Worker] Job ${job.id} exception:`, errMsg);

    if (job.attempts >= 3) {
      await storage.updateCiRun(run.id, {
        status: "FAILED",
        finishedAt: new Date(),
        error: `max_attempts: ${errMsg}`,
      });
      await storage.completeJob(job.id, "DEAD", errMsg);
    } else {
      await storage.completeJob(job.id, "DEAD", errMsg);
    }
    return { processed: true, runId: run.id, status: "FAILED" };
  } finally {
    const preserve = process.env.CI_PRESERVE_WORKDIR === "true";
    if (!preserve && runWorkDir) {
      await fs.rm(runWorkDir, { recursive: true, force: true }).catch(() => {});
    } else if (preserve) {
      console.log(`[CI Worker] Preserving workspace: ${runWorkDir}`);
    }
  }
}

async function fetchRepo(owner: string, repo: string, sha: string, workDir: string): Promise<string> {
  const repoDir = path.join(workDir, "repo");
  await fs.mkdir(repoDir, { recursive: true });

  const token = process.env.GITHUB_TOKEN;
  const publicUrl = `https://github.com/${owner}/${repo}.git`;
  let cloneUrl = publicUrl;
  if (token) {
    cloneUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;
  }

  console.log(`[CI Worker] Cloning ${owner}/${repo}@${sha}`);

  await execCommand("git", ["clone", "--depth", "1", cloneUrl, repoDir]);
  await execCommand("git", ["-C", repoDir, "fetch", "--depth", "1", "origin", sha]);
  await execCommand("git", ["-C", repoDir, "checkout", sha]);

  return repoDir;
}

function execCommand(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const safeArgs = args.map((a) => sanitizeGitUrl(a));
    const proc = spawn(cmd, args, { cwd: process.cwd() });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => { stdout += d.toString(); });
    proc.stderr.on("data", (d) => { stderr += d.toString(); });
    proc.on("error", (err) => {
      reject(new Error(`${cmd} ${safeArgs.join(" ")} error: ${sanitizeGitUrl(String(err))}`));
    });
    proc.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${cmd} ${safeArgs.join(" ")} exited with code ${code}: ${sanitizeGitUrl(stderr.slice(-500))}`));
    });
  });
}

async function runAnalyzerOnDir(
  repoDir: string,
  outDir: string,
  runId: string
): Promise<{ success: boolean; error?: string; summary?: any }> {
  const pythonBin = path.join(process.cwd(), ".pythonlibs/bin/python3");
  if (!existsSync(pythonBin)) {
    return { success: false, error: "python_not_found" };
  }

  const args = ["-m", "server.analyzer.analyzer_cli", "analyze", repoDir, "--output-dir", outDir];
  console.log(`[CI Worker] Running analyzer for run=${runId}`);

  return new Promise((resolve) => {
    let stderr = "";
    const proc = spawn(pythonBin, args, {
      cwd: process.cwd(),
      env: { ...process.env },
    });

    const timeout = setTimeout(() => {
      proc.kill("SIGKILL");
      resolve({ success: false, error: "timeout_10m" });
    }, Number(process.env.ANALYZER_TIMEOUT_MS) || 10 * 60 * 1000);

    proc.stdout.on("data", (d) => {
      console.log(`[CI Analyzer ${runId}]: ${d}`);
    });
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
      console.error(`[CI Analyzer ${runId} ERR]: ${d}`);
    });
    proc.on("error", (err) => {
      clearTimeout(timeout);
      resolve({ success: false, error: `spawn_error: ${err}` });
    });
    proc.on("close", async (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        resolve({ success: false, error: `exit_code_${code}: ${stderr.slice(-300)}` });
        return;
      }

      try {
        let summary: any = null;
        const operatePath = path.join(outDir, "operate.json");
        if (existsSync(operatePath)) {
          const raw = await fs.readFile(operatePath, "utf-8");
          const op = JSON.parse(raw);
          summary = {
            readiness: op.readiness_scores || null,
            boot_commands: (op.boot_commands || []).length,
            endpoints: (op.integration_points?.endpoints || []).length,
            env_vars: (op.integration_points?.env_vars || []).length,
            gaps: (op.operational_gaps || []).length,
          };
        }
        resolve({ success: true, summary });
      } catch {
        resolve({ success: true, summary: null });
      }
    });
  });
}

let workerInterval: ReturnType<typeof setInterval> | null = null;

export function startWorkerLoop(intervalMs: number = 5000) {
  if (workerInterval) return;
  console.log(`[CI Worker] Starting background loop (every ${intervalMs}ms)`);
  workerInterval = setInterval(async () => {
    try {
      await processOneJob();
    } catch (err) {
      console.error("[CI Worker] Loop error:", err);
    }
  }, intervalMs);
}

export function stopWorkerLoop() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log("[CI Worker] Stopped background loop");
  }
}
