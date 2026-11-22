import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/error";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import rolesRoutes from "./routes/roles";
import studentsRoutes from "./routes/students";
import facultyRoutes from "./routes/faculty";
import feesRoutes from "./routes/fees";
import inquiriesRoutes from "./routes/inquiries";
import pagesRoutes from "./routes/pages";
import uploadsRoutes from "./routes/uploads";
import dashboardRoutes from "./routes/dashboard";
import publicRoutes from "./routes/public";

export const app = express();

app.set("trust proxy", 1);
// Images are loaded by the admin portal and the public website, which live on other origins.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
// CORS_ORIGINS is a comma-separated list. Exact origins, or a wildcard host such as https://*.vercel.app.
const originAllowed = (origin: string) =>
  env.corsOrigins.some((o) => {
    if (o === origin) return true;
    if (!o.includes("*")) return false;
    // "https://*.vercel.app": the part before and after the * must match, and the * stands for one host label.
    const [head, tail] = o.split("*");
    const middle = origin.slice(head.length, origin.length - tail.length);
    return origin.startsWith(head) && origin.endsWith(tail) && middle.length > 0 && !/[./:]/.test(middle);
  });
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || originAllowed(origin)), // no Origin header = curl / server-to-server
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
}));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(env.uploadDir, { maxAge: "7d" }));
if (env.bundledUploadDir !== env.uploadDir) app.use("/uploads", express.static(env.bundledUploadDir, { maxAge: "7d" }));

const api = express.Router();
// Throttle anonymous traffic (the public site, login attempts). Signed-in portal requests carry a Bearer token and are
// validated by `authenticate`; counting them here would lock admins out after a few lists/filters. Login keeps its own stricter limiter.
api.use(rateLimit({
  windowMs: env.rateWindowMs, limit: env.rateMax, standardHeaders: true, legacyHeaders: false,
  skip: (req) => !!req.headers.authorization?.startsWith("Bearer "),
}));
api.get("/health", (_req, res) => res.json({ ok: true }));
api.use("/auth", authRoutes);
api.use("/users", usersRoutes);
api.use("/roles", rolesRoutes);
api.use("/students", studentsRoutes);
api.use("/faculty", facultyRoutes);
api.use("/fees", feesRoutes);
api.use("/inquiries", inquiriesRoutes);
api.use("/pages", pagesRoutes);
api.use("/uploads", uploadsRoutes);
api.use("/dashboard", dashboardRoutes);
api.use("/public", publicRoutes);

app.use(env.apiPrefix, api);
app.use(notFound);
app.use(errorHandler);
