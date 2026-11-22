import { Router } from "express";
import { z } from "zod";
import { authenticate, requirePermission } from "../middleware/auth";
import { Student } from "../models/Student";
import { Fee } from "../models/Fee";
import { ApiError } from "../utils/ApiError";
import { buildFilter, createHandler, deleteHandler, getHandler, optionsHandler, pageParams, updateHandler } from "../utils/crud";
import { optionalEmail, phoneSchema } from "../utils/validators";
import { feePositionStages, paidTotals } from "../utils/fees";

const router = Router();
router.use(authenticate);

const schema = z.object({
  rollNo: z.string().trim().optional().default(""),
  name: z.string().trim().min(2, "Name is required").max(120),
  fatherName: z.string().trim().optional().default(""),
  email: optionalEmail,
  phone: phoneSchema,
  cnic: z.string().trim().optional().default(""),
  address: z.string().trim().optional().default(""),
  course: z.string().trim().min(1, "Course is required"),
  batch: z.string().trim().optional().default(""),
  admissionDate: z.coerce.date().optional(),
  totalFee: z.coerce.number().min(0).optional().default(0),
  status: z.enum(["active", "completed", "dropped"]).optional().default("active"),
  notes: z.string().optional().default(""),
});
const parse = (b: unknown) => schema.parse(b);
const parsePartial = (b: unknown) => schema.partial().parse(b);

const listOpts = {
  searchFields: ["name", "email", "phone", "rollNo", "fatherName", "course"],
  filterFields: ["status", "course", "batch"],
  dateFields: ["admissionDate"],
  numberFields: ["totalFee"],
  containsFields: { rollNo: ["rollNo"], phone: ["phone"] },
};

router.get("/options", requirePermission("students:view"), optionsHandler(Student, { courses: "course", batches: "batch" }));

router.get("/", requirePermission("students:view"), async (req, res) => {
  const { page, limit, skip } = pageParams(req);
  const filter = buildFilter(req, listOpts);
  const feeStatus = typeof req.query.feeStatus === "string" ? req.query.feeStatus : "";
  if (["paid", "partial", "unpaid"].includes(feeStatus)) {
    const ids = await Student.aggregate([...feePositionStages(), { $match: { feeStatus } }, { $project: { _id: 1 } }]);
    const wanted = ids.map((r) => r._id);
    // keep an explicit ?id= filter working together with the fee status filter
    filter._id = filter._id ? { $in: wanted.filter((w) => String(w) === String(filter._id)) } : { $in: wanted };
  }
  const [rows, total] = await Promise.all([
    Student.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
    Student.countDocuments(filter),
  ]);
  const paid = await paidTotals(rows.map((r) => r._id));
  const items = rows.map((s) => {
    const p = paid.get(String(s._id)) ?? 0;
    return { ...s, paid: p, remaining: Math.max(0, s.totalFee - p), feeCleared: s.totalFee > 0 && p >= s.totalFee };
  });
  res.json({ items, total, page, limit, skip, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.get("/:id", requirePermission("students:view"), getHandler(Student));

router.get("/:id/fees", requirePermission("students:view", "fees:view"), async (req, res) => {
  const student = await Student.findById(req.params.id).lean();
  if (!student) throw ApiError.notFound("Student not found");
  const payments = await Fee.find({ student: student._id }).sort({ paidOn: -1 }).lean();
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  res.json({ student, payments, paid, remaining: Math.max(0, student.totalFee - paid) });
});

router.post("/", requirePermission("students:create"), createHandler(Student, parse));
router.put("/:id", requirePermission("students:update"), updateHandler(Student, parsePartial));
router.delete("/:id", requirePermission("students:delete"), deleteHandler(Student, (id) => Fee.deleteMany({ student: id })));

export default router;
