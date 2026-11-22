import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyAccess } from "../utils/tokens";
import { User } from "../models/User";
import { hasPermission } from "../permissions";

export type AuthUser = { id: string; name: string; email: string; roleName: string; permissions: string[] };

declare global {
  namespace Express {
    interface Request { auth?: AuthUser }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw ApiError.unauthorized("Missing access token");
  let sub: string;
  try {
    sub = verifyAccess(header.slice(7)).sub;
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
  const user = await User.findById(sub).populate<{ role: { name: string; permissions: string[] } }>("role");
  if (!user || !user.isActive || !user.role) throw ApiError.unauthorized("Account not available");
  req.auth = {
    id: user.id, name: user.name, email: user.email,
    roleName: user.role.name, permissions: user.role.permissions,
  };
  next();
}

/** Require at least one of the given permissions. */
export const requirePermission = (...needed: string[]) => (req: Request, _res: Response, next: NextFunction) => {
  const granted = req.auth?.permissions ?? [];
  if (!needed.some((p) => hasPermission(granted, p))) throw ApiError.forbidden();
  next();
};
