/** Field definitions that drive the admin portal's generic page editor. */
export type Option = { label: string; value: string };

export type Format = "email" | "phone" | "digits" | "url" | "hex" | "slug";
/** Validation hints shared by every field. Anything not marked optional is required. */
type Rules = { required?: boolean; format?: Format; min?: number; max?: number; maxLength?: number };

export type Field =
  | ({ key: string; label: string; type: "text" | "textarea" | "richtext" | "image" | "color" | "url" | "number" | "boolean" | "tags"; help?: string; placeholder?: string; minItems?: number } & Rules)
  | ({ key: string; label: string; type: "select"; options: Option[]; help?: string } & Rules)
  | { key: string; label: string; type: "group"; fields: Field[]; help?: string }
  | { key: string; label: string; type: "list"; itemLabel: string; titleField?: string; fields: Field[]; help?: string; minItems?: number; uniqueKey?: string }
  | { key: string; label: string; type: "table"; help?: string; minColumns?: number };

export type Section = { key: string; title: string; description?: string; fields: Field[] };
export type PageDef = { key: string; title: string; description: string; sections: Section[] };
export type PageModule = { def: PageDef; defaults: unknown };

const req = (label: string) => !/optional/i.test(label);

export const t = (key: string, label: string): Field => ({ key, label, type: "text", required: req(label), maxLength: 200 });
export const ta = (key: string, label: string): Field => ({ key, label, type: "textarea", required: req(label), maxLength: 1000 });
export const rt = (key: string, label: string): Field => ({ key, label, type: "richtext", required: req(label) });
export const img = (key: string, label: string, help?: string): Field => ({ key, label, type: "image", help, required: req(label) });
export const col = (key: string, label: string): Field => ({ key, label, type: "color", required: true, format: "hex" });
export const url = (key: string, label: string): Field => ({ key, label, type: "url", required: req(label), format: "url" });
export const bool = (key: string, label: string): Field => ({ key, label, type: "boolean" });
export const num = (key: string, label: string, min?: number, max?: number): Field => ({ key, label, type: "number", required: true, min, max });
export const tags = (key: string, label: string, help?: string): Field => ({ key, label, type: "tags", help, minItems: 0 });
export const sel = (key: string, label: string, options: Option[]): Field => ({ key, label, type: "select", options, required: false });
export const list = (key: string, label: string, itemLabel: string, fields: Field[], titleField?: string, help?: string): Field => ({ key, label, type: "list", itemLabel, fields, titleField, help, minItems: 1 });
export const table = (key: string, label: string, help?: string): Field => ({ key, label, type: "table", help, minColumns: 1 });

/** Modifiers */
export const opt = (f: Field): Field => ({ ...f, required: false, ...("minItems" in f ? { minItems: 0 } : {}) }) as Field;
export const fmt = (f: Field, format: Format): Field => ({ ...f, format }) as Field;
export const atLeast = (f: Field, n: number): Field => ({ ...f, minItems: n }) as Field;
export const reqd = (f: Field): Field => ({ ...f, required: true }) as Field;
export const unique = (f: Field, uniqueKey: string): Field => ({ ...f, uniqueKey }) as Field;

export const ICONS: Option[] = [
  "home", "info", "book-open", "phone", "calendar-days", "users", "monitor", "user-round", "building-2",
  "code", "bot", "cloud", "layout-dashboard", "graduation-cap", "briefcase", "network", "brain-circuit",
  "monitor-play", "award", "shield", "globe", "star", "mail", "map-pin", "clock", "check",
].map((v) => ({ value: v, label: v }));

export const P = (s: string) => `<p>${s}</p>`;
export const U = "/uploads/defaults";

export function collectRichKeys(fields: Field[], out = new Set<string>()) {
  for (const f of fields) {
    if (f.type === "richtext") out.add(f.key);
    if (f.type === "group" || f.type === "list") collectRichKeys(f.fields, out);
  }
  return out;
}
