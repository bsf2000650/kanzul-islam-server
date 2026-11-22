import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound("Route not found"));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) return res.status(err.status).json({ message: err.message, details: err.details });
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: err.issues[0] ? `${err.issues[0].path.join(".") || "Input"}: ${err.issues[0].message}` : "Validation failed",
      details: err.issues,
    });
  }
  if (err instanceof mongoose.Error.CastError) return res.status(400).json({ message: "Invalid id" });
  if (err instanceof mongoose.Error.ValidationError) return res.status(400).json({ message: err.message });
  const e = err as { code?: number; keyValue?: object; name?: string; message?: string };
  if (e?.code === 11000) return res.status(409).json({ message: `Duplicate value: ${Object.keys(e.keyValue ?? {}).join(", ")} already exists` });
  if (e?.name === "MulterError") return res.status(400).json({ message: e.message });
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
}
