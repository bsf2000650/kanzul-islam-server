import { Router } from "express";
import { z } from "zod";
import { authenticate, requirePermission } from "../middleware/auth";
import { Role } from "../models/Role";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { ALL_PERMISSIONS, PERMISSION_CATALOG } from "../permissions";
import { MAX_LIMIT, pageParams } from "../utils/crud";

const router = Router();
router.use(authenticate);

const body = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(300).optional().default(""),
  permissions: z.array(z.string()).refine((p) => p.every((x) => ALL_PERMISSIONS.includes(x)), "Unknown permission"),
});

// The catalog and role list are needed by anyone who can open the Users or Roles screens.
router.get("/permissions", requirePermission("roles:view", "users:view"), (_req, res) => {
  res.json(PERMISSION_CATALOG);
});

router.get("/", requirePermission("roles:view", "users:view"), async (req, res) => {
  const roles = await Role.find().sort({ createdAt: -1, _id: -1 }).lean();
  const counts = await User.aggregate([{ $group: { _id: "$role", n: { $sum: 1 } } }]);
  const map = new Map(counts.map((c) => [String(c._id), c.n as number]));
  const all = roles.map((r) => ({ ...r, userCount: map.get(String(r._id)) ?? 0 }));

  // Without paging params: a plain (capped) array, used to fill role dropdowns.
  if (req.query.limit === undefined && req.query.page === undefined && req.query.offset === undefined) return res.json(all.slice(0, MAX_LIMIT));

  // Paged + filtered list for the Roles screen. userCount/permission count are computed, so filter here.
  const s = (k: string) => (typeof req.query[k] === "string" ? (req.query[k] as string).trim() : "");
  const n = (k: string) => (s(k) !== "" && Number.isFinite(Number(s(k))) ? Number(s(k)) : undefined);
  const permCount = (p: string[]) => (p.includes("*") ? ALL_PERMISSIONS.length : p.length);
  const [pMin, pMax, uMin, uMax] = [n("permissionsMin"), n("permissionsMax"), n("usersMin"), n("usersMax")];
  const filtered = all.filter((r) => {
    if (s("search") && !`${r.name} ${r.description}`.toLowerCase().includes(s("search").toLowerCase())) return false;
    if (s("id") && String(r._id) !== s("id")) return false;
    if (s("description") && !(r.description ?? "").toLowerCase().includes(s("description").toLowerCase())) return false;
    if (s("type") === "system" && !r.isSystem) return false;
    if (s("type") === "custom" && r.isSystem) return false;
    const pc = permCount(r.permissions);
    if ((pMin !== undefined && pc < pMin) || (pMax !== undefined && pc > pMax)) return false;
    if ((uMin !== undefined && r.userCount < uMin) || (uMax !== undefined && r.userCount > uMax)) return false;
    return true;
  });
  const { page, limit, skip } = pageParams(req);
  res.json({ items: filtered.slice(skip, skip + limit), total: filtered.length, page, limit, skip, pages: Math.max(1, Math.ceil(filtered.length / limit)) });
});

router.post("/", requirePermission("roles:create"), async (req, res) => {
  res.status(201).json(await Role.create(body.parse(req.body)));
});

router.put("/:id", requirePermission("roles:update"), async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw ApiError.notFound("Role not found");
  if (role.isSystem) throw ApiError.badRequest("The Super Admin role cannot be modified");
  Object.assign(role, body.parse(req.body));
  await role.save();
  res.json(role);
});

router.delete("/:id", requirePermission("roles:delete"), async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw ApiError.notFound("Role not found");
  if (role.isSystem) throw ApiError.badRequest("The Super Admin role cannot be deleted");
  if (await User.exists({ role: role._id })) throw ApiError.conflict("This role is assigned to users. Reassign them first.");
  await role.deleteOne();
  res.json({ message: "Deleted" });
});

export default router;
