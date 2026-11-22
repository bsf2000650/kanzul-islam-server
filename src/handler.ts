import type { IncomingMessage, ServerResponse } from "http";

/**
 * Request handler used on serverless hosts (Vercel). Everything is loaded lazily so that a startup failure
 * (missing environment variable, MongoDB unreachable…) is returned as a readable JSON error WITH CORS headers.
 * Without this the browser only reports "blocked by CORS policy" and hides the real problem.
 */
type Handler = (req: IncomingMessage, res: ServerResponse) => void;
let ready: Promise<Handler> | null = null;

function boot(): Promise<Handler> {
  return (ready ??= (async () => {
    const { connectDB } = await import("./config/db");
    const { seed } = await import("./scripts/seedData");
    const { app } = await import("./app");
    await connectDB();
    await seed(); // idempotent
    return app as unknown as Handler;
  })().catch((err) => {
    ready = null; // let the next request retry
    throw err;
  }));
}

/** Error text without anything that looks like a connection string / credentials. */
const safe = (err: unknown) =>
  String(err instanceof Error ? err.message : err).replace(/mongodb(\+srv)?:\/\/\S+/gi, "mongodb://***").slice(0, 300);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await boot();
    return app(req, res);
  } catch (err) {
    console.error("Server failed to start:", err);
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      res.setHeader("Vary", "Origin");
    }
    if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Server failed to start", reason: safe(err) }));
  }
}
