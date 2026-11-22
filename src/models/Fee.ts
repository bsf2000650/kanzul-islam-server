import { Schema, model } from "mongoose";

/** One fee payment (installment) made by a student. */
const feeSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    paidOn: { type: Date, default: Date.now },
    method: { type: String, enum: ["cash", "bank", "online", "cheque", "other"], default: "cash" },
    receiptNo: { type: String, trim: true, default: "" },
    note: { type: String, default: "" },
    receivedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Fee = model("Fee", feeSchema);
