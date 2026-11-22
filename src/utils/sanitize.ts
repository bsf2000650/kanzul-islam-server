import sanitizeHtml from "sanitize-html";

const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "span", "a", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "blockquote", "mark", "hr", "sub", "sup", "code", "pre",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    "*": ["style"],
  },
  allowedStyles: {
    "*": {
      color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
      "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
      "font-size": [/^\d+(\.\d+)?(px|rem|em|%)$/],
      "text-align": [/^(left|right|center|justify)$/],
      "font-family": [/^[\w\s,'"-]+$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

export const cleanHtml = (html: string) => sanitizeHtml(html, options);

/** Walks arbitrary content JSON and sanitizes every string flagged as rich text. */
export function sanitizeContent(value: unknown, richKeys: Set<string>, key = ""): unknown {
  if (Array.isArray(value)) return value.map((v) => sanitizeContent(v, richKeys, key));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitizeContent(v, richKeys, k)]),
    );
  }
  if (typeof value === "string" && richKeys.has(key)) return cleanHtml(value);
  return value;
}
