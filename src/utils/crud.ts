import type { Request, Response } from "express";
import mongoose, { type Model } from "mongoose";
import { ApiError } from "./ApiError";

const num = (v: unknown, d: number) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);

type Opts = {
  searchFields: string[];
  filterFields?: string[]; // query params that map 1:1 to a field (exact match)
  dateFields?: string[]; // ?<field>From=YYYY-MM-DD&<field>To=YYYY-MM-DD (inclusive)
  numberFields?: string[]; // ?<field>Min=&<field>Max=
  containsFields?: Record<string, string[]>; // ?<param>=text -> case-insensitive match on any listed field
  extra?: (req: Request) => Record<string, unknown>; // anything custom (e.g. status -> isActive)
  sort?: Record<string, 1 | -1>;
  populate?: string;
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Builds a Mongo filter from ?search plus the filters declared in `o`. */
export function buildFilter(req: Request, o: Opts): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  const and: Record<string, unknown>[] = [];
  for (const f of o.filterFields ?? []) {
    const v = str(req.query[f]);
    if (v && v !== "all") filter[f] = v;
  }
  const id = str(req.query.id);
  if (id && mongoose.isValidObjectId(id)) filter._id = id;
  for (const f of o.dateFields ?? []) {
    const from = str(req.query[`${f}From`]);
    const to = str(req.query[`${f}To`]);
    const range: Record<string, Date> = {};
    if (from && !Number.isNaN(Date.parse(from))) range.$gte = new Date(`${from.slice(0, 10)}T00:00:00.000`);
    if (to && !Number.isNaN(Date.parse(to))) range.$lte = new Date(`${to.slice(0, 10)}T23:59:59.999`);
    if (Object.keys(range).length) filter[f] = range;
  }
  for (const f of o.numberFields ?? []) {
    const min = str(req.query[`${f}Min`]);
    const max = str(req.query[`${f}Max`]);
    const range: Record<string, number> = {};
    if (min !== "" && Number.isFinite(Number(min))) range.$gte = Number(min);
    if (max !== "" && Number.isFinite(Number(max))) range.$lte = Number(max);
    if (Object.keys(range).length) filter[f] = range;
  }
  for (const [param, fields] of Object.entries(o.containsFields ?? {})) {
    const v = str(req.query[param]);
    if (v) and.push({ $or: fields.map((f) => ({ [f]: new RegExp(esc(v), "i") })) });
  }
  Object.assign(filter, o.extra?.(req) ?? {});
  const search = str(req.query.search);
  if (search) {
    const rx = new RegExp(esc(search), "i");
    and.push({ $or: o.searchFields.map((f) => ({ [f]: rx })) });
  }
  if (and.length) filter.$and = and;
  return filter;
}

/** Largest page the API will ever return (matches the biggest page size offered in the portal). */
export const MAX_LIMIT = 100;

/**
 * Paging: `?limit=` (capped at MAX_LIMIT) plus either `?page=` or `?offset=`.
 * `offset` lets the portal fetch only the records it does not already have.
 */
export const pageParams = (req: Request) => {
  const limit = Math.min(num(req.query.limit, 10), MAX_LIMIT);
  const off = Number(req.query.offset);
  const skip = Number.isFinite(off) && off >= 0 && req.query.offset !== undefined ? Math.floor(off) : (num(req.query.page, 1) - 1) * limit;
  return { page: Math.floor(skip / limit) + 1, limit, skip };
};

/** Paginated list with ?page, ?limit, ?search and the filters declared in Opts. */
export function listHandler(model: Model<any>, o: Opts) {
  return async (req: Request, res: Response) => {
    const { page, limit, skip } = pageParams(req);
    const filter = buildFilter(req, o);
    let q = model.find(filter).sort(o.sort ?? { createdAt: -1, _id: -1 }).skip(skip).limit(limit);
    if (o.populate) q = q.populate(o.populate);
    const [items, total] = await Promise.all([q.lean(), model.countDocuments(filter)]);
    res.json({ items, total, page, limit, skip, pages: Math.max(1, Math.ceil(total / limit)) });
  };
}

/** GET /options -> distinct, non-empty values of the given fields (used to fill filter dropdowns). */
export const optionsHandler = (model: Model<any>, fields: Record<string, string>) => async (_req: Request, res: Response) => {
  const out: Record<string, string[]> = {};
  await Promise.all(
    Object.entries(fields).map(async ([name, field]) => {
      const vals = (await model.distinct(field)) as unknown[];
      out[name] = vals.filter((v): v is string => typeof v === "string" && v.trim() !== "").sort((a, b) => a.localeCompare(b));
    }),
  );
  res.json(out);
};

export const getHandler = (model: Model<any>) => async (req: Request, res: Response) => {
  const doc = await model.findById(req.params.id).lean();
  if (!doc) throw ApiError.notFound();
  res.json(doc);
};

export const createHandler = (model: Model<any>, parse: (b: unknown) => object) => async (req: Request, res: Response) => {
  res.status(201).json(await model.create(parse(req.body)));
};

export const updateHandler = (model: Model<any>, parse: (b: unknown) => object) => async (req: Request, res: Response) => {
  const doc = await model.findByIdAndUpdate(req.params.id, parse(req.body), { new: true, runValidators: true });
  if (!doc) throw ApiError.notFound();
  res.json(doc);
};

export const deleteHandler = (model: Model<any>, after?: (id: string) => Promise<unknown>) => async (req: Request, res: Response) => {
  const doc = await model.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound();
  if (after) await after(String(req.params.id));
  res.json({ message: "Deleted" });
};
