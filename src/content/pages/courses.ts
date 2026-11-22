import courses from "../courses.default.json";
import { type PageModule, t, ta, rt, img, tags, list, fmt, atLeast, unique } from "../schema";

const def = {
  key: "courses",
  title: "Courses",
  description: "Courses listing and the detail page of each course.",
  sections: [
    { key: "header", title: "Page Header", fields: [t("eyebrow", "Small heading"), t("title", "Title"), ta("description", "Description")] },
    {
      key: "courses", title: "Courses", description: "Add, remove or edit courses. Each course has its own detail page.",
      fields: [
        unique(list("items", "Courses", "Course", [
          fmt(t("slug", "URL slug (e.g. full-stack-development)"), "slug"), t("category", "Category"), t("title", "Title"), ta("shortIntro", "Short intro (shown on the card)"),
          img("image", "Image"), t("imageAlt", "Image description"),
          rt("introduction", "Introduction"), t("whyTitle", "'Why study' heading"), rt("why", "'Why study' text"),
          atLeast(tags("topics", "Topics covered", "Press Enter after each topic"), 1),
        ], "title"), "slug"),
      ],
    },
  ],
};

const defaults = {
  header: { eyebrow: "Course catalog", title: "Practical training paths", description: "Choose a course to explore its full overview, learning areas, and training details." },
  courses: { items: courses },
};

export default { def, defaults } satisfies PageModule;
