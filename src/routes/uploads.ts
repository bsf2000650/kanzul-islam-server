import { Router } from "express";
import fs from "fs";
import path from "path";
import { env } from "../config/env";
import { authenticate, requirePermission } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { Media } from "../models/Media";
import { ApiError } from "../utils/ApiError";

const router = Router();
router.use(authenticate);

// Anyone who can edit pages or faculty may upload images.
const canUpload = requirePermission("pages:update", "faculty:create", "faculty:update");

router.post("/", canUpload, upload.single("file"), async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");
  const media = await Media.create({
    filename: req.file.filename, originalName: req.file.originalname, mimeType: req.file.mimetype,
    size: req.file.size, url: `/uploads/${req.file.filename}`, uploadedBy: req.auth!.id,
  });
  res.status(201).json(media);
});

router.get("/", requirePermission("pages:view", "faculty:view"), async (_req, res) => {
  res.json(await Media.find().sort({ createdAt: -1 }).limit(200).lean());
});

router.delete("/:id", requirePermission("pages:update"), async (req, res) => {
  const m = await Media.findByIdAndDelete(req.params.id);
  if (!m) throw ApiError.notFound();
  fs.promises.unlink(path.join(env.uploadDir, path.basename(m.filename))).catch(() => undefined);
  res.json({ message: "Deleted" });
});

export default router;
