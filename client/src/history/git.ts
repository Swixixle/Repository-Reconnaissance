import { execa } from "execa";
import { execFile } from "child_process";

export async function git(repoPath: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  try {
    if (typeof execa === "function") {
      const { stdout, stderr } = await execa("git", args, {
        cwd: repoPath,
        env: process.env,
      });
      return { stdout, stderr };
    }
  } catch (e) {
    // fallback to execFile
  }
  return new Promise((resolve, reject) => {
    execFile(
      "git",
      args,
      { cwd: repoPath, env: process.env },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              `git ${args.join(" ")} failed: ${error.message}\nstdout: ${stdout}\nstderr: ${stderr}`
            )
          );
        } else {
          resolve({ stdout, stderr });
        }
      }
    );
  });
}

export async function isGitRepo(repoPath: string): Promise<boolean> {
  try {
    const { stdout } = await git(repoPath, ["rev-parse", "--is-inside-work-tree"]);
    return stdout.trim() === "true";
  } catch {
    return false;
  }
}

export async function getHeadHash(repoPath: string): Promise<string | undefined> {
  try {
    const { stdout } = await git(repoPath, ["rev-parse", "HEAD"]);
    return stdout.trim();
  } catch {
    return undefined;
  }
}

export async function getBranch(repoPath: string): Promise<string | undefined> {
  try {
    const { stdout } = await git(repoPath, ["rev-parse", "--abbrev-ref", "HEAD"]);
    const branch = stdout.trim();
    if (branch === "HEAD") return undefined;
    return branch;
  } catch {
    return undefined;
  }
}
