import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type TokenPayload = { sub: string };

export const signAccess = (userId: string) =>
  jwt.sign({ sub: userId }, env.accessSecret, { expiresIn: env.accessExpires } as SignOptions);

export const signRefresh = (userId: string) =>
  jwt.sign({ sub: userId }, env.refreshSecret, { expiresIn: env.refreshExpires } as SignOptions);

export const verifyAccess = (t: string) => jwt.verify(t, env.accessSecret) as TokenPayload;
export const verifyRefresh = (t: string) => jwt.verify(t, env.refreshSecret) as TokenPayload;
