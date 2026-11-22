import { Router } from "express";
import { z } from "zod";
import { authenticate, requirePermission } from "../middleware/auth";
import { Faculty } from "../models/Faculty";
import { createHandler, deleteHandler, getHandler, listHandler, optionsHandler, updateHandler } from "../utils/crud";
import { optionalEmail, phoneSchema } from "../utils/validators";

const router = Router();
router.use(authenticate);

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: optionalEmail,
  phone: phoneSchema,
  designation: z.string().trim().optional().default(""),
  department: z.string().trim().optional().default(""),
  qualification: z.string().trim().optional().default(""),
  experience: z.string().trim().optional().default(""),
  courses: z.array(z.string().trim()).optional().default([]),
  photo: z.string().optional().default(""),
  joiningDate: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  notes: z.string().optional().default(""),
});
const parse = (b: unknown) => schema.parse(b);
const parsePartial = (b: unknown) => schema.partial().parse(b);

router.get(
  "/",
  requirePermission("faculty:view"),
  listHandler(Faculty, {
    searchFields: ["name", "email", "phone", "designation", "department", "qualification"],
    filterFields: ["designation", "qualification", "courses"],
    containsFields: { contact: ["phone", "email"] },
    dateFields: ["joiningDate"],
    extra: (req) => (req.query.status === "active" ? { isActive: true } : req.query.status === "inactive" ? { isActive: false } : {}),
  }),
);
router.get("/options", requirePermission("faculty:view"), optionsHandler(Faculty, { designations: "designation", qualifications: "qualification", courses: "courses" }));
router.get("/:id", requirePermission("faculty:view"), getHandler(Faculty));
router.post("/", requirePermission("faculty:create"), createHandler(Faculty, parse));
router.put("/:id", requirePermission("faculty:update"), updateHandler(Faculty, parsePartial));
router.delete("/:id", requirePermission("faculty:delete"), deleteHandler(Faculty));

export default router;
