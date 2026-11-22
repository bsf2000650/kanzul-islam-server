import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Values in .env may carry inline "# comments" — strip them.
const clean = (v: string | undefined, fallback = "") =>
  (v ?? fallback).split(/\s+#/)[0].trim();

const required = (name: string): string => {
  const v = clean(process.env[name]);
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
};

export const env = {
  nodeEnv: clean(process.env.NODE_ENV, "development"),
  port: Number(clean(process.env.PORT, "5000")),
  apiPrefix: clean(process.env.API_PREFIX, "/api/v1"),
  mongoUri: required("MONGO_URI"),
  dbName: clean(process.env.DB_NAME) || undefined,
  accessSecret: required("JWT_ACCESS_SECRET"),
  accessExpires: clean(process.env.JWT_ACCESS_EXPIRES_IN, "15m"),
  refreshSecret: required("JWT_REFRESH_SECRET"),
  refreshExpires: clean(process.env.JWT_REFRESH_EXPIRES_IN, "7d"),
  saltRounds: Number(clean(process.env.BCRYPT_SALT_ROUNDS, "10")),
  corsOrigins: clean(process.env.CORS_ORIGINS, "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  cookieSecure: clean(process.env.COOKIE_SECURE, "false") === "true",
  cookieSameSite: clean(process.env.COOKIE_SAMESITE, "lax") as "lax" | "strict" | "none",
  rateWindowMs: Number(clean(process.env.RATE_LIMIT_WINDOW_MS, "900000")),
  rateMax: Number(clean(process.env.RATE_LIMIT_MAX, "300")),
  authRateMax: Number(clean(process.env.AUTH_RATE_LIMIT_MAX, "20")),
  inquiryRateMax: Number(clean(process.env.INQUIRY_RATE_LIMIT_MAX, "10")),
  uploadDir: path.resolve(process.cwd(), clean(process.env.UPLOAD_DIR, "uploads")),
  maxFileMb: Number(clean(process.env.MAX_FILE_SIZE_MB, "5")),
  allowedImageTypes: clean(
    process.env.ALLOWED_IMAGE_TYPES,
    "image/jpeg,image/png,image/webp",
  ).split(",").map((s) => s.trim()),
  seed: {
    name: clean(process.env.SEED_ADMIN_NAME, "Super Admin"),
    email: clean(process.env.SEED_ADMIN_EMAIL, "admin@example.com").toLowerCase(),
    password: clean(process.env.SEED_ADMIN_PASSWORD, "ChangeMe123!"),
  },
};
