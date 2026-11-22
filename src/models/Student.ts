import { Schema, model } from "mongoose";

const studentSchema = new Schema(
  {
    rollNo: { type: String, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    cnic: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    course: { type: String, trim: true, default: "" },
    batch: { type: String, trim: true, default: "" },
    admissionDate: { type: Date, default: Date.now },
    totalFee: { type: Number, default: 0, min: 0 }, // total course fee payable
    status: { type: String, enum: ["active", "completed", "dropped"], default: "active" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

studentSchema.index({ name: "text", email: "text", phone: "text", rollNo: "text" });
export const Student = model("Student", studentSchema);
