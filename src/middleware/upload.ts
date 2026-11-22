import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

// The deployed bundle is read-only on serverless hosts, so never crash if the folder can't be created.
try { fs.mkdirSync(env.uploadDir, { recursive: true }); } catch { /* read-only file system */ }

export const upload = multer({
  storage: multer.diskStorage({
    destination: env.uploadDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "");
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`);
    },
  }),
  limits: { fileSize: env.maxFileMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!env.allowedImageTypes.includes(file.mimetype)) return cb(ApiError.badRequest("Only JPG, PNG or WEBP images are allowed"));
    cb(null, true);
  },
});
