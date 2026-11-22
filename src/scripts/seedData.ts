import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { ALL_PERMISSIONS } from "../permissions";
import { Role } from "../models/Role";
import { User } from "../models/User";
import { PageContent } from "../models/PageContent";
import { PAGE_DEFAULTS } from "../content/pages";

/** Idempotent first-run setup. Never overwrites existing data. */
export async function seed() {
  // 1. Super Admin role (system, all permissions)
  const superRole =
    (await Role.findOne({ isSystem: true })) ??
    (await Role.create({ name: "Super Admin", description: "Full access to everything", permissions: ["*"], isSystem: true }));

  // 2. A couple of starter roles the admin can edit
  const starters = [
    { name: "Content Editor", description: "Can edit website pages", permissions: ["dashboard:view", "pages:view", "pages:update"] },
    {
      name: "Admissions Officer", description: "Manages students, fees and inquiries",
      permissions: ALL_PERMISSIONS.filter((p) => /^(dashboard|students|fees|inquiries):/.test(p)),
    },
  ];
  for (const r of starters) if (!(await Role.exists({ name: r.name }))) await Role.create(r);

  // 3. First Super Admin user
  if (!(await User.exists({ role: superRole._id }))) {
    await User.create({
      name: env.seed.name, email: env.seed.email, role: superRole._id,
      passwordHash: await bcrypt.hash(env.seed.password, env.saltRounds),
    });
    console.log(`Seeded Super Admin: ${env.seed.email}`);
  }

  // 4. Default page content (only pages that don't exist yet)
  for (const [key, content] of Object.entries(PAGE_DEFAULTS)) {
    if (!(await PageContent.exists({ key }))) await PageContent.create({ key, content });
  }
}
