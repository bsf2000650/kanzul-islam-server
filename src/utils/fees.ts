import type { PipelineStage } from "mongoose";
import type { Types } from "mongoose";
import { Fee } from "../models/Fee";

/** Sum of payments per student id (as string). */
export async function paidTotals(studentIds: Types.ObjectId[]) {
  const rows = await Fee.aggregate([
    { $match: { student: { $in: studentIds } } },
    { $group: { _id: "$student", paid: { $sum: "$amount" } } },
  ]);
  return new Map<string, number>(rows.map((r) => [String(r._id), r.paid as number]));
}

/** Aggregation stages that add paid / lastPaidOn / remaining / feeStatus (paid | partial | unpaid) to each student. */
export const feePositionStages = (): PipelineStage[] => [
  { $lookup: { from: "fees", localField: "_id", foreignField: "student", as: "payments" } },
  { $addFields: { paid: { $sum: "$payments.amount" }, lastPaidOn: { $max: "$payments.paidOn" } } },
  {
    $addFields: {
      remaining: { $max: [0, { $subtract: ["$totalFee", "$paid"] }] },
      feeStatus: {
        $switch: {
          branches: [
            { case: { $and: [{ $gt: ["$totalFee", 0] }, { $gte: ["$paid", "$totalFee"] }] }, then: "paid" },
            { case: { $gt: ["$paid", 0] }, then: "partial" },
          ],
          default: "unpaid",
        },
      },
    },
  },
  { $project: { payments: 0 } },
];
