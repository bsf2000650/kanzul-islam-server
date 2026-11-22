import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { PageContent } from "../models/PageContent";
import { Inquiry } from "../models/Inquiry";
import { ApiError } from "../utils/ApiError";
import { PAGE_DEFAULTS, getPageDef } from "../content/pages";
import { mergeDefaults } from "../utils/merge";

/** Unauthenticated endpoints consumed by the public website. */
const router = Router();

async function loadPage(key: string) {
  const doc = await PageContent.findOne({ key }).lean();
  return mergeDefaults(PAGE_DEFAULTS[key], doc?.content);
}

// All pages in one request — lets the site load common content + page content together.
router.get("/site", async (_req, res) => {
  const docs = await PageContent.find().lean();
  const m = new Map(docs.map((d) => [d.key, d.content]));
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(PAGE_DEFAULTS)) out[key] = mergeDefaults(PAGE_DEFAULTS[key], m.get(key));
  res.set("Cache-Control", "no-cache");
  res.json(out);
});

router.get("/pages/:key", async (req, res) => {
  const key = String(req.params.key);
  if (!getPageDef(key)) throw ApiError.notFound("Unknown page");
  res.set("Cache-Control", "no-cache");
  res.json(await loadPage(key));
});

const inquiryLimiter = rateLimit({
  windowMs: env.rateWindowMs,
  limit: env.inquiryRateMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many inquiries from this connection. Please try again later." },
});

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().toLowerCase().max(200).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  course: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().max(3000).optional().default(""),
  source: z.string().trim().max(40).optional().default("website"),
  website: z.string().optional(), // honeypot: real users leave this empty
});

router.post("/inquiries", inquiryLimiter, async (req, res) => {
  const { website, ...d } = inquirySchema.parse(req.body);
  if (!d.email && !d.phone) throw ApiError.badRequest("Please provide an email or phone number");
  if (d.email && !z.email().safeParse(d.email).success) throw ApiError.badRequest("Please enter a valid email");
  // Bots fill hidden fields: pretend success but store nothing.
  if (website) return res.status(201).json({ message: "Received" });
  await Inquiry.create({ ...d, ip: req.ip ?? "" });
  res.status(201).json({ message: "Thank you! Your inquiry has been received." });
});

export default router;
