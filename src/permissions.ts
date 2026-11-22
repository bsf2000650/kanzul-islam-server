/**
 * Permission catalog. A permission is "<resource>:<action>".
 * Roles store a list of these strings; "*" grants everything (super admin).
 */
export const PERMISSION_CATALOG = [
  { resource: "dashboard", label: "Dashboard", actions: ["view"] },
  { resource: "pages", label: "Pages (site content)", actions: ["view", "update"] },
  { resource: "students", label: "Students", actions: ["view", "create", "update", "delete"] },
  { resource: "faculty", label: "Faculty", actions: ["view", "create", "update", "delete"] },
  { resource: "fees", label: "Fees Submission", actions: ["view", "create", "update", "delete"] },
  { resource: "users", label: "Users", actions: ["view", "create", "update", "delete"] },
  { resource: "roles", label: "Roles", actions: ["view", "create", "update", "delete"] },
  { resource: "inquiries", label: "Student Inquiries", actions: ["view", "update", "delete"] },
] as const;

export const ALL_PERMISSIONS: string[] = PERMISSION_CATALOG.flatMap((p) =>
  p.actions.map((a) => `${p.resource}:${a}`),
);

export const hasPermission = (granted: string[], needed: string) =>
  granted.includes("*") || granted.includes(needed);
