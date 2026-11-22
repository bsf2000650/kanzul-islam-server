import { env } from "./config/env";
import { connectDB } from "./config/db";
import { app } from "./app";
import { seed } from "./scripts/seedData";

async function main() {
  await connectDB();
  await seed(); // idempotent: creates roles, super admin and default page content when missing
  app.listen(env.port, () => console.log(`API running on http://localhost:${env.port}${env.apiPrefix}`));
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
