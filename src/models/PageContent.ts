import { Schema, model } from "mongoose";

/** Content of one site page (common, home, about, ...). Shape is defined by content/pages.ts. */
const pageSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    content: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, minimize: false },
);

export const PageContent = model("PageContent", pageSchema);
