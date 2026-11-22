import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { env } from "../config/env";
import { authenticate, requirePermission } from "../middleware/auth";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { ApiError } from "../utils/ApiError";
import { listHandler } from "../utils/crud";
import { passwordSchema } from "../utils/validators";

const router = Router();
router.use(authenticate);

const create = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: passwordSchema,
  role: z.string().min(1, "Select a role"),
  isActive: z.boolean().optional().default(true),
});
const update = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().toLowerCase().pipe(z.email()).optional(),
  password: passwordSchema.optional().or(z.literal("")),
  role: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

async function assertRole(id: string) {
  if (!(await Role.exists({ _id: id }))) throw ApiError.badRequest("Selected role does not exist");
}

/** Never leave the system without an active Super Admin. */
async function lastSuperAdminGuard(userId: string) {
  const sa = await Role.findOne({ isSystem: true });
  const u = await User.findById(userId);
  if (sa && u && String(u.role) === String(sa._id) && (await User.countDocuments({ role: sa._id, isActive: true })) <= 1) {
    throw ApiError.badRequest("At least one active Super Admin must remain");
  }
}

router.get(
  "/",
  requirePermission("users:view"),
  listHandler(User, {
    searchFields: ["name", "email"],
    filterFields: ["role"],
    dateFields: ["lastLoginAt", "createdAt"],
    extra: (req) => (req.query.status === "active" ? { isActive: true } : req.query.status === "inactive" ? { isActive: false } : {}),
    populate: "role",
  }),
);

router.post("/", requirePermission("users:create"), async (req, res) => {
  const d = create.parse(req.body);
  await assertRole(d.role);
  const user = await User.create({
    name: d.name, email: d.email, role: d.role, isActive: d.isActive,
    passwordHash: await bcrypt.hash(d.password, env.saltRounds),
  });
  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

router.put("/:id", requirePermission("users:update"), async (req, res) => {
  const d = update.parse(req.body);
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  if (d.role) await assertRole(d.role);
  if ((d.role && String(user.role) !== d.role) || d.isActive === false) await lastSuperAdminGuard(user.id);
  if (d.isActive === false && user.id === req.auth!.id) throw ApiError.badRequest("You cannot deactivate your own account");
  if (d.name) user.name = d.name;
  if (d.email) user.email = d.email;
  if (d.role) user.role = d.role as never;
  if (d.isActive !== undefined) user.isActive = d.isActive;
  if (d.password) user.passwordHash = await bcrypt.hash(d.password, env.saltRounds);
  await user.save();
  res.json({ id: user.id, name: user.name, email: user.email });
});

router.delete("/:id", requirePermission("users:delete"), async (req, res) => {
  if (req.params.id === req.auth!.id) throw ApiError.badRequest("You cannot delete your own account");
  await lastSuperAdminGuard(String(req.params.id));
  const u = await User.findByIdAndDelete(req.params.id);
  if (!u) throw ApiError.notFound("User not found");
  res.json({ message: "Deleted" });
});

export default router;
