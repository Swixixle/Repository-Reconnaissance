import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Projects API
  app.get(api.projects.list.path, async (_req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.post(api.projects.create.path, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({
                message: err.errors[0].message,
                field: err.errors[0].path.join('.'),
            });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.projects.get.path, async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  });

  app.get(api.projects.getAnalysis.path, async (req, res) => {
    const analysis = await storage.getAnalysisByProjectId(Number(req.params.id));
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    res.json(analysis);
  });

  app.post(api.projects.analyze.path, async (req, res) => {
    const projectId = Number(req.params.id);
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Trigger analysis in background
    runAnalysis(project.id, project.url);

    res.status(202).json({ message: "Analysis started" });
  });

  return httpServer;
}

async function runAnalysis(projectId: number, repoUrl: string) {
    console.log(`Starting analysis for project ${projectId} url: ${repoUrl}`);
    await storage.updateProjectStatus(projectId, "analyzing");
    
    // Create output directory
    const outputDir = path.resolve(process.cwd(), "out", String(projectId));
    await fs.mkdir(outputDir, { recursive: true });

    // Assuming python dependencies are installed and analyzer code is in server/analyzer
    const analyzerPath = path.resolve(process.cwd(), "server/analyzer/analyzer_cli.py");
    
    // We need to pass the OPENAI API Key to the python script if it uses it.
    // The integration sets AI_INTEGRATIONS_OPENAI_API_KEY env var.
    
    const pythonProcess = spawn("python3", [analyzerPath, "analyze", repoUrl, "--output-dir", outputDir], {
        env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
        console.log(`[Analyzer ${projectId}]: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
        console.error(`[Analyzer ${projectId} ERR]: ${data}`);
    });

    pythonProcess.on("close", async (code) => {
        console.log(`Analyzer process exited with code ${code}`);
        
        if (code === 0) {
            try {
                // Read the output files
                const dossierPath = path.join(outputDir, "DOSSIER.md");
                const claimsPath = path.join(outputDir, "claims.json");
                const howtoPath = path.join(outputDir, "target_howto.json");
                const coveragePath = path.join(outputDir, "coverage.json");
                // const indexPath = path.join(outputDir, "index.json");

                const dossier = await fs.readFile(dossierPath, "utf-8").catch(() => "");
                const claims = JSON.parse(await fs.readFile(claimsPath, "utf-8").catch(() => "{}"));
                const howto = JSON.parse(await fs.readFile(howtoPath, "utf-8").catch(() => "{}"));
                const coverage = JSON.parse(await fs.readFile(coveragePath, "utf-8").catch(() => "{}"));
                // const index = JSON.parse(await fs.readFile(indexPath, "utf-8").catch(() => "{}"));

                await storage.createAnalysis({
                    projectId,
                    dossier,
                    claims,
                    howto,
                    coverage,
                    unknowns: howto.unknowns || [],
                });

                await storage.updateProjectStatus(projectId, "completed");
            } catch (err) {
                console.error("Error saving analysis results:", err);
                await storage.updateProjectStatus(projectId, "failed");
            }
        } else {
            await storage.updateProjectStatus(projectId, "failed");
        }
    });
}
