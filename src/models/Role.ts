import { Schema, model, type InferSchemaType } from "mongoose";

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "", trim: true },
    permissions: { type: [String], default: [] }, // "resource:action" or "*"
    isSystem: { type: Boolean, default: false }, // system roles cannot be edited/deleted
  },
  { timestamps: true },
);

export type RoleDoc = InferSchemaType<typeof roleSchema>;
export const Role = model("Role", roleSchema);
