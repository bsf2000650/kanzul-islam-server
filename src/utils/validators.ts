import { z } from "zod";

/** Password policy shared by user creation, user editing and "change my password". */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be at most 64 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/\d/, "Password must contain a number")
  .regex(/[^A-Za-z0-9\s]/, "Password must contain a special character")
  .regex(/^\S+$/, "Password must not contain spaces");

/** Optional free-text phone: digits, spaces, + - ( ) and 7-20 characters. */
export const phoneSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || /^[+\d][\d\s\-()]{6,19}$/.test(v), "Enter a valid phone number")
  .optional()
  .default("");

/** Optional email (empty string allowed). */
export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address")
  .optional()
  .default("");
