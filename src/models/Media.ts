import { Schema, model } from "mongoose";

const mediaSchema = new Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, default: "" },
    url: { type: String, required: true },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Media = model("Media", mediaSchema);
