import handler from "./handler";

// Vercel imports this file and calls the default export for every request (it must NOT call listen()).
export default handler;

// Everywhere else (local dev, a VPS, Docker) run a normal HTTP server.
if (!process.env.VERCEL) {
  (async () => {
    const { env } = await import("./config/env");
    const { connectDB } = await import("./config/db");
    const { app } = await import("./app");
    const { seed } = await import("./scripts/seedData");
    await connectDB();
    await seed(); // idempotent: creates roles, super admin and default page content when missing
    app.listen(env.port, () => console.log(`API running on http://localhost:${env.port}${env.apiPrefix}`));
  })().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
