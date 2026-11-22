import { Router, type Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { passwordSchema } from "../utils/validators";
import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { signAccess, signRefresh, verifyRefresh } from "../utils/tokens";
import { authenticate } from "../middleware/auth";

const router = Router();
const COOKIE = "refresh_token";
const cookieOpts = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSameSite,
  path: `${env.apiPrefix}/auth`,
  maxAge: 7 * 24 * 3600 * 1000,
};

const limiter = rateLimit({
  windowMs: env.rateWindowMs,
  limit: env.authRateMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, try again later" },
});

async function session(res: Response, userId: string) {
  const user = await User.findById(userId).populate<{ role: { name: string; permissions: string[] } }>("role");
  if (!user || !user.isActive || !user.role) throw ApiError.unauthorized("Account not available");
  res.cookie(COOKIE, signRefresh(user.id), cookieOpts);
  return {
    accessToken: signAccess(user.id),
    user: { id: user.id, name: user.name, email: user.email, role: user.role.name, permissions: user.role.permissions },
  };
}

router.post("/login", limiter, async (req, res) => {
  const { email, password } = z.object({ email: z.string().trim().toLowerCase(), password: z.string().min(1) }).parse(req.body);
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw ApiError.unauthorized("Invalid email or password");
  if (!user.isActive) throw ApiError.forbidden("Your account has been deactivated");
  user.lastLoginAt = new Date();
  await user.save();
  res.json(await session(res, user.id));
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies?.[COOKIE];
  if (!token) throw ApiError.unauthorized("No session");
  let sub: string;
  try {
    sub = verifyRefresh(token).sub;
  } catch {
    throw ApiError.unauthorized("Session expired");
  }
  res.json(await session(res, sub));
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE, { ...cookieOpts, maxAge: undefined });
  res.json({ message: "Logged out" });
});

router.get("/me", authenticate, (req, res) => {
  const a = req.auth!;
  res.json({ id: a.id, name: a.name, email: a.email, role: a.roleName, permissions: a.permissions });
});

router.patch("/me/password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = z.object({ currentPassword: z.string(), newPassword: passwordSchema }).parse(req.body);
  const user = await User.findById(req.auth!.id).select("+passwordHash");
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) throw ApiError.badRequest("Current password is incorrect");
  user.passwordHash = await bcrypt.hash(newPassword, env.saltRounds);
  await user.save();
  res.json({ message: "Password updated" });
});

export default router;
