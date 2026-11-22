import common from "./pages/common";
import home from "./pages/home";
import about from "./pages/about";
import courses from "./pages/courses";
import contact from "./pages/contact";
import schedule from "./pages/schedule";
import experts from "./pages/experts";
import type { PageDef, PageModule } from "./schema";

// Order here = order of the sub-tabs under "Pages" (Common first, so it opens by default).
const modules: PageModule[] = [common, home, about, courses, contact, schedule, experts];

export const PAGES: PageDef[] = modules.map((m) => m.def);
export const PAGE_DEFAULTS: Record<string, unknown> = Object.fromEntries(modules.map((m) => [m.def.key, m.defaults]));
export const getPageDef = (key: string) => PAGES.find((p) => p.key === key);
