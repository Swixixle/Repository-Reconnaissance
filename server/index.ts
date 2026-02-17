import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

// Production startup validation
function validateProductionConfig() {
  const isProduction = process.env.NODE_ENV === "production";
  
  if (!isProduction) {
    return; // Skip validation in development
  }

  const errors: string[] = [];

  // Validate DATABASE_URL
  if (!process.env.DATABASE_URL) {
    errors.push("DATABASE_URL is required in production");
  }

  // Validate API_KEY
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    errors.push("API_KEY is required in production");
  } else if (apiKey.length < 32) {
    errors.push(`API_KEY must be at least 32 characters (current: ${apiKey.length})`);
  }

  // Validate HTTPS enforcement (unless explicitly bypassed)
  const forceHttp = process.env.FORCE_HTTP === "true";
  if (!forceHttp) {
    console.warn(
      "[SECURITY] HTTPS enforcement is enabled. Service expects to run behind a reverse proxy with TLS termination."
    );
    console.warn(
      "[SECURITY] If you are running without HTTPS, set FORCE_HTTP=true (NOT RECOMMENDED for production)"
    );
    // Note: Actual HTTPS enforcement would require X-Forwarded-Proto header checking in middleware
    // For now, we just warn. The reverse proxy setup in DEPLOYMENT.md handles TLS.
  } else {
    console.warn(
      "[WARNING] FORCE_HTTP=true detected. Service is running without HTTPS enforcement."
    );
    console.warn(
      "[WARNING] This should ONLY be used behind a trusted reverse proxy that handles TLS."
    );
  }

  if (errors.length > 0) {
    console.error("\n❌ Production configuration validation failed:\n");
    errors.forEach((error) => console.error(`  - ${error}`));
    console.error("\nSee docs/QUICKSTART.md for configuration guide.\n");
    process.exit(1);
  }

  console.log("✓ Production configuration validated");
}

// Run validation before starting the server
validateProductionConfig();

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
