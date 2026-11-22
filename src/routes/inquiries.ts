import { Router } from "express";
import { z } from "zod";
import { authenticate, requirePermission } from "../middleware/auth";
import { Inquiry } from "../models/Inquiry";
import { ApiError } from "../utils/ApiError";
import { deleteHandler, getHandler, listHandler, optionsHandler } from "../utils/crud";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  requirePermission("inquiries:view"),
  listHandler(Inquiry, {
    searchFields: ["name", "email", "phone", "course", "message"],
    filterFields: ["status", "course"],
    dateFields: ["createdAt"],
    containsFields: { contact: ["phone", "email"], message: ["message"] },
  }),
);
router.get("/options", requirePermission("inquiries:view"), optionsHandler(Inquiry, { courses: "course" }));

router.get("/stats", requirePermission("inquiries:view"), async (_req, res) => {
  const rows = await Inquiry.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]);
  const out: Record<string, number> = { new: 0, in_progress: 0, resolved: 0, closed: 0 };
  for (const r of rows) out[r._id] = r.n;
  res.json({ ...out, total: Object.values(out).reduce((a, b) => a + b, 0) });
});

router.get("/:id", requirePermission("inquiries:view"), getHandler(Inquiry));

router.patch("/:id", requirePermission("inquiries:update"), async (req, res) => {
  const d = z.object({
    status: z.enum(["new", "in_progress", "resolved", "closed"]).optional(),
    adminNote: z.string().max(2000).optional(),
  }).parse(req.body);
  const doc = await Inquiry.findByIdAndUpdate(req.params.id, d, { new: true });
  if (!doc) throw ApiError.notFound();
  res.json(doc);
});

router.delete("/:id", requirePermission("inquiries:delete"), deleteHandler(Inquiry));

export default router;
