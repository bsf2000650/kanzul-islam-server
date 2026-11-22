const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/**
 * Fill in any field that is missing from `stored` with the default value, recursively
 * through plain objects. Arrays and scalars that exist in `stored` are kept as-is, so
 * edits (including empty lists) are never overwritten. This lets us add new editable
 * fields later without a data migration.
 */
export function mergeDefaults(defaults: unknown, stored: unknown): unknown {
  if (stored === undefined || stored === null) return defaults;
  if (isObj(defaults) && isObj(stored)) {
    const out: Record<string, unknown> = { ...stored };
    for (const k of Object.keys(defaults)) out[k] = mergeDefaults(defaults[k], stored[k]);
    return out;
  }
  return stored;
}
