import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { authenticate, requirePermission } from "../middleware/auth";
import { Fee } from "../models/Fee";
import { Student } from "../models/Student";
import { ApiError } from "../utils/ApiError";
import { deleteHandler, pageParams } from "../utils/crud";
import { feePositionStages } from "../utils/fees";

const router = Router();
router.use(authenticate);

const payment = z.object({
  student: z.string().min(1, "Select a student"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paidOn: z.coerce.date().optional(),
  method: z.enum(["cash", "bank", "online", "cheque", "other"]).optional().default("cash"),
  receiptNo: z.string().trim().optional().default(""),
  note: z.string().optional().default(""),
});

/**
 * Per-student fee position: total, paid, remaining and status (paid | partial | unpaid).
 * Dropped students are excluded.
 */
router.get("/summary", requirePermission("fees:view"), async (req, res) => {
  const { page, limit, skip } = pageParams(req);
  const q = req.query;
  const s = (k: string) => (typeof q[k] === "string" ? (q[k] as string).trim() : "");

  const match: Record<string, unknown> = { status: { $ne: "dropped" } };
  if (s("id") && mongoose.isValidObjectId(s("id"))) match._id = new mongoose.Types.ObjectId(s("id"));
  if (s("course")) match.course = s("course");
  if (s("search")) {
    const rx = new RegExp(s("search").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    match.$or = [{ name: rx }, { rollNo: rx }, { phone: rx }, { course: rx }];
  }

  // Filters on computed columns run after the fee position has been calculated.
  const post: Record<string, unknown> = {};
  const status = s("status");
  if (["paid", "partial", "unpaid"].includes(status)) post.feeStatus = status;
  for (const f of ["totalFee", "paid", "remaining"]) {
    const range: Record<string, number> = {};
    if (s(`${f}Min`) !== "" && Number.isFinite(Number(s(`${f}Min`)))) range.$gte = Number(s(`${f}Min`));
    if (s(`${f}Max`) !== "" && Number.isFinite(Number(s(`${f}Max`)))) range.$lte = Number(s(`${f}Max`));
    if (Object.keys(range).length) post[f] = range;
  }
  const from = s("lastPaidOnFrom");
  const to = s("lastPaidOnTo");
  const dr: Record<string, Date> = {};
  if (from && !Number.isNaN(Date.parse(from))) dr.$gte = new Date(`${from.slice(0, 10)}T00:00:00.000`);
  if (to && !Number.isNaN(Date.parse(to))) dr.$lte = new Date(`${to.slice(0, 10)}T23:59:59.999`);
  if (Object.keys(dr).length) post.lastPaidOn = dr;

  const [out] = await Student.aggregate([
    { $match: match },
    ...feePositionStages(),
    ...(Object.keys(post).length ? [{ $match: post }] : []),
    { $sort: { createdAt: -1, _id: -1 } },
    { $facet: { items: [{ $skip: skip }, { $limit: limit }], total: [{ $count: "n" }] } },
  ]);
  const total = out.total[0]?.n ?? 0;
  res.json({ items: out.items, total, page, limit, skip, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.get("/options", requirePermission("fees:view"), async (_req, res) => {
  const courses = ((await Student.distinct("course", { status: { $ne: "dropped" } })) as string[]).filter((c) => c?.trim()).sort((a, b) => a.localeCompare(b));
  res.json({ courses });
});

router.get("/", requirePermission("fees:view"), async (req, res) => {
  const { page, limit, skip } = pageParams(req);
  const filter: Record<string, unknown> = {};
  if (typeof req.query.student === "string" && mongoose.isValidObjectId(req.query.student)) filter.student = req.query.student;
  const [items, total] = await Promise.all([
    Fee.find(filter).populate("student", "name rollNo course").sort({ paidOn: -1, _id: -1 }).skip(skip).limit(limit).lean(),
    Fee.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit, skip, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.post("/", requirePermission("fees:create"), async (req, res) => {
  const d = payment.parse(req.body);
  if (!(await Student.exists({ _id: d.student }))) throw ApiError.badRequest("Student not found");
  res.status(201).json(await Fee.create({ ...d, receivedBy: req.auth!.id }));
});

router.put("/:id", requirePermission("fees:update"), async (req, res) => {
  const d = payment.omit({ student: true }).partial().parse(req.body);
  const fee = await Fee.findByIdAndUpdate(req.params.id, d, { new: true });
  if (!fee) throw ApiError.notFound();
  res.json(fee);
});

router.delete("/:id", requirePermission("fees:delete"), deleteHandler(Fee));

export default router;
