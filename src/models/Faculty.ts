import { Schema, model } from "mongoose";

const facultySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    designation: { type: String, trim: true, default: "" },
    department: { type: String, trim: true, default: "" },
    qualification: { type: String, trim: true, default: "" },
    experience: { type: String, trim: true, default: "" },
    courses: { type: [String], default: [] },
    photo: { type: String, default: "" },
    joiningDate: { type: Date },
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

facultySchema.index({ name: "text", email: "text", designation: "text" });
export const Faculty = model("Faculty", facultySchema);
