import { Router } from "express";
import { z } from "zod";
import { authenticate, requirePermission } from "../middleware/auth";
import { PageContent } from "../models/PageContent";
import { ApiError } from "../utils/ApiError";
import { sanitizeContent } from "../utils/sanitize";
import { PAGES, PAGE_DEFAULTS, getPageDef } from "../content/pages";
import { collectRichKeys } from "../content/schema";
import { validateContent } from "../content/validate";
import { mergeDefaults } from "../utils/merge";

const router = Router();
router.use(authenticate);

router.get("/", requirePermission("pages:view"), async (_req, res) => {
  const docs = await PageContent.find().select("key updatedAt").lean();
  const m = new Map(docs.map((d) => [d.key, d.updatedAt]));
  res.json(PAGES.map((p) => ({ key: p.key, title: p.title, description: p.description, updatedAt: m.get(p.key) ?? null })));
});

router.get("/:key", requirePermission("pages:view"), async (req, res) => {
  const def = getPageDef(String(req.params.key));
  if (!def) throw ApiError.notFound("Unknown page");
  let doc = await PageContent.findOne({ key: def.key }).lean();
  if (!doc) doc = (await PageContent.create({ key: def.key, content: PAGE_DEFAULTS[def.key] })).toObject();
  res.json({ def, content: mergeDefaults(PAGE_DEFAULTS[def.key], doc.content), updatedAt: doc.updatedAt });
});

router.put("/:key", requirePermission("pages:update"), async (req, res) => {
  const def = getPageDef(String(req.params.key));
  if (!def) throw ApiError.notFound("Unknown page");
  const { content } = z.object({ content: z.record(z.string(), z.unknown()) }).parse(req.body);
  const rich = new Set<string>();
  def.sections.forEach((s) => collectRichKeys(s.fields, rich));
  const clean = sanitizeContent(content, rich) as Record<string, unknown>;
  const errors = validateContent(def.sections, clean);
  const n = Object.keys(errors).length;
  if (n) throw ApiError.badRequest(`Please fix ${n} highlighted field${n === 1 ? "" : "s"}: ${Object.values(errors)[0]}`, errors);
  const doc = await PageContent.findOneAndUpdate(
    { key: def.key },
    { content: clean, updatedBy: req.auth!.id },
    { new: true, upsert: true },
  );
  res.json({ content: doc.content, updatedAt: doc.updatedAt });
});

/** Restore one page to its original (factory) content. */
router.post("/:key/reset", requirePermission("pages:update"), async (req, res) => {
  const def = getPageDef(String(req.params.key));
  if (!def) throw ApiError.notFound("Unknown page");
  const doc = await PageContent.findOneAndUpdate(
    { key: def.key },
    { content: PAGE_DEFAULTS[def.key], updatedBy: req.auth!.id },
    { new: true, upsert: true },
  );
  res.json({ content: doc.content, updatedAt: doc.updatedAt });
});

export default router;
