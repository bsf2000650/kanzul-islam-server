import { Schema, model } from "mongoose";

const inquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    course: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "", maxlength: 3000 },
    source: { type: String, default: "website" }, // e.g. home, contact
    status: { type: String, enum: ["new", "in_progress", "resolved", "closed"], default: "new" },
    adminNote: { type: String, default: "" },
    ip: { type: String, default: "" },
  },
  { timestamps: true },
);

inquirySchema.index({ createdAt: -1 });
export const Inquiry = model("Inquiry", inquirySchema);
