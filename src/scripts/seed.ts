import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { PageContent } from "../models/PageContent";
import { PAGE_DEFAULTS } from "../content/pages";
import { seed } from "./seedData";

/**
 * CLI for seeding / migrating the database.
 *   npm run seed                 -> create anything missing (safe, never overwrites)
 *   npm run seed:pages           -> reset ALL page content back to the defaults
 *   npm run seed:fresh -- --yes  -> DROP the whole database, then seed (destructive)
 */
async function main() {
  const cmd = process.argv[2] ?? "seed";
  const confirmed = process.argv.includes("--yes");
  await connectDB();

  switch (cmd) {
    case "seed":
      await seed();
      console.log("Seed complete (existing data left untouched).");
      break;
    case "pages":
      for (const [key, content] of Object.entries(PAGE_DEFAULTS)) {
        await PageContent.findOneAndUpdate({ key }, { content }, { upsert: true });
      }
      console.log(`Reset ${Object.keys(PAGE_DEFAULTS).length} pages to defaults.`);
      break;
    case "fresh":
      if (!confirmed) {
        console.error("This DROPS the entire database. Re-run with:  npm run seed:fresh -- --yes");
        process.exitCode = 1;
        break;
      }
      await mongoose.connection.dropDatabase();
      await seed();
      console.log("Database dropped and re-seeded.");
      break;
    default:
      console.error(`Unknown command "${cmd}". Use: seed | pages | fresh`);
      process.exitCode = 1;
  }
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seeding failed:", err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
