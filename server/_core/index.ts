import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

/**
 * Build the CORS allowlist from environment variables.
 *
 * CORS_ALLOWED_ORIGINS should be a comma-separated list of fully-qualified
 * origins that are permitted to send credentialed requests, e.g.:
 *   CORS_ALLOWED_ORIGINS=https://app.example.com,https://www.example.com
 *
 * In development the Expo web preview (localhost:8081) and the API server
 * itself (localhost:3000) are added automatically so the dev workflow works
 * without any extra configuration.
 */
function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>();

  // Always allow the Expo web dev server and the API server in development.
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:8081");
    origins.add("http://localhost:3000");
  }

  // Honour the explicit allowlist from the environment (works in all envs).
  const envList = process.env.CORS_ALLOWED_ORIGINS ?? "";
  for (const raw of envList.split(",")) {
    const origin = raw.trim();
    if (origin) origins.add(origin);
  }

  // Also allow the Expo preview URL if the platform provides one.
  const expoPreview = process.env.EXPO_WEB_PREVIEW_URL ?? "";
  if (expoPreview) {
    try {
      origins.add(new URL(expoPreview).origin);
    } catch {
      // ignore malformed URLs
    }
  }

  return origins;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  const allowedOrigins = buildAllowedOrigins();

  // Strict CORS: only origins in the allowlist receive the ACAO header.
  // Credentials (cookies / Authorization) are only forwarded for those origins.
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
    }
    // If the origin is not in the allowlist we deliberately omit the header so
    // the browser will block the cross-origin request.

    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
    if (process.env.NODE_ENV !== "production") {
      console.log(`[api] CORS allowed origins: ${[...allowedOrigins].join(", ")}`);
    }
  });
}

startServer().catch(console.error);
