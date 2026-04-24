import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

/**
 * Build the CORS allowlist from environment variables.
 */
function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>();

  // Honour the explicit allowlist from the environment.
  const envList = process.env.CORS_ALLOWED_ORIGINS ?? "";
  for (const raw of envList.split(",")) {
    const origin = raw.trim();
    if (origin) origins.add(origin);
  }

  // Also allow the Vercel URL if provided.
  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }

  return origins;
}

const allowedOrigins = buildAllowedOrigins();

// CORS middleware for Vercel
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

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
  res.json({ ok: true, timestamp: Date.now(), env: "vercel" });
});

// Handle M-Pesa callback separately
app.post("/api/mpesa/callback", async (req, res) => {
  try {
    // Create a proper context for the caller
    const ctx = await createContext({ req, res });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.mpesa.callback(req.body);
    res.json(result);
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    res.status(500).json({ ResultCode: 1, ResultDesc: "Internal Error" });
  }
});

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

export default app;
