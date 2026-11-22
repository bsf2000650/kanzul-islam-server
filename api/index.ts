import type { IncomingMessage, ServerResponse } from "http";
import { connectDB } from "../src/config/db";
import { app } from "../src/app";
import { seed } from "../src/scripts/seedData";

/**
 * Vercel serverless entry. The Express app is exported as a request handler instead of calling listen().
 * The database connection (and the idempotent first-run seed) is set up once per warm instance.
 */
let ready: Promise<void> | null = null;
const init = () =>
  (ready ??= (async () => {
    await connectDB();
    await seed();
  })().catch((err) => {
    ready = null; // let the next request retry
    throw err;
  }));

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await init();
  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
