import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth";
import { Student } from "../models/Student";
import { Faculty } from "../models/Faculty";
import { Fee } from "../models/Fee";
import { Inquiry } from "../models/Inquiry";

const router = Router();
router.use(authenticate);

const MONTHS = 6;
const monthStart = (back: number) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - back, 1);
};
/** Last N months as ["2026-06", ...] oldest first. */
const monthKeys = () =>
  Array.from({ length: MONTHS }, (_, i) => {
    const d = monthStart(MONTHS - 1 - i);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("en", { month: "short" }) };
  });
const fill = (rows: { _id: string; n: number }[]) => {
  const m = new Map(rows.map((r) => [r._id, r.n]));
  return monthKeys().map(({ key, label }) => ({ month: label, value: m.get(key) ?? 0 }));
};
const byMonth = (field: string, sum?: string) => [
  { $match: { [field]: { $gte: monthStart(MONTHS - 1) } } },
  { $group: { _id: { $dateToString: { format: "%Y-%m", date: `$${field}` } }, n: sum ? { $sum: `$${sum}` } : { $sum: 1 } } },
];

router.get("/", requirePermission("dashboard:view"), async (_req, res) => {
  const [students, faculty, feeStatus, collectedAgg, admissions, collections, inquiriesMonthly, inquiryStatus, byCourse] = await Promise.all([
    Student.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    Faculty.aggregate([{ $group: { _id: "$isActive", n: { $sum: 1 } } }]),
    Student.aggregate([
      { $match: { status: { $ne: "dropped" } } },
      { $lookup: { from: "fees", localField: "_id", foreignField: "student", as: "p" } },
      { $addFields: { paid: { $sum: "$p.amount" } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          submitted: { $sum: { $cond: [{ $and: [{ $gt: ["$totalFee", 0] }, { $gte: ["$paid", "$totalFee"] }] }, 1, 0] } },
          partial: { $sum: { $cond: [{ $and: [{ $gt: ["$paid", 0] }, { $lt: ["$paid", "$totalFee"] }] }, 1, 0] } },
          expected: { $sum: "$totalFee" },
          collected: { $sum: "$paid" },
        },
      },
    ]),
    Fee.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    Student.aggregate(byMonth("admissionDate")),
    Fee.aggregate(byMonth("paidOn", "amount")),
    Inquiry.aggregate(byMonth("createdAt")),
    Inquiry.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    Student.aggregate([
      { $match: { course: { $ne: "" }, status: { $ne: "dropped" } } },
      { $group: { _id: "$course", n: { $sum: 1 } } },
      { $sort: { n: -1 } },
      { $limit: 8 },
    ]),
  ]);

  const sCount = (s: string) => students.find((x) => x._id === s)?.n ?? 0;
  const fStat = feeStatus[0] ?? { total: 0, submitted: 0, partial: 0, expected: 0, collected: 0 };
  const iCount = (s: string) => inquiryStatus.find((x) => x._id === s)?.n ?? 0;
  const fac = (a: boolean) => faculty.find((x) => x._id === a)?.n ?? 0;

  res.json({
    cards: {
      students: { total: sCount("active") + sCount("completed") + sCount("dropped"), active: sCount("active"), completed: sCount("completed"), dropped: sCount("dropped") },
      faculty: { total: fac(true) + fac(false), active: fac(true), inactive: fac(false) },
      fees: {
        submitted: fStat.submitted, // fully paid
        partial: fStat.partial,
        remaining: fStat.total - fStat.submitted, // not fully paid (includes partial)
        totalStudents: fStat.total,
        expectedAmount: fStat.expected,
        collectedAmount: fStat.collected,
        outstandingAmount: Math.max(0, fStat.expected - fStat.collected),
        allTimeCollected: collectedAgg[0]?.total ?? 0,
      },
      inquiries: { new: iCount("new"), total: inquiryStatus.reduce((a, b) => a + b.n, 0) },
    },
    charts: {
      admissionsVsCollections: monthKeys().map(({ key, label }, i) => ({
        month: label,
        admissions: fill(admissions)[i].value,
        collections: fill(collections)[i].value,
        key,
      })),
      inquiriesMonthly: fill(inquiriesMonthly),
      studentsByCourse: byCourse.map((c) => ({ course: c._id, students: c.n })),
      feeStatus: [
        { name: "Fully paid", value: fStat.submitted },
        { name: "Partially paid", value: fStat.partial },
        { name: "Unpaid", value: Math.max(0, fStat.total - fStat.submitted - fStat.partial) },
      ],
      inquiryStatus: [
        { name: "New", value: iCount("new") },
        { name: "In progress", value: iCount("in_progress") },
        { name: "Resolved", value: iCount("resolved") },
        { name: "Closed", value: iCount("closed") },
      ],
    },
  });
});

export default router;
