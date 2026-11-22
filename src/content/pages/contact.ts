import courses from "../courses.default.json";
import { type PageModule, P, U, t, ta, rt, img, url, tags, list, fmt, atLeast } from "../schema";

const def = {
  key: "contact",
  title: "Contact",
  description: "Contact page: intro, contact details and inquiry form text.",
  sections: [
    {
      key: "hero", title: "Intro (text left, image right)",
      fields: [t("eyebrow", "Small heading"), t("title", "Title"), rt("text", "Text"), img("image", "Image"),
        t("primaryLabel", "Primary button text"), url("primaryUrl", "Primary button link")],
    },
    {
      key: "info", title: "Contact Details",
      fields: [t("eyebrow", "Small heading"), t("title", "Title"), ta("address", "Address"), fmt(t("email", "Email"), "email"),
        list("phones", "Phone numbers", "Phone", [fmt(t("number", "Number"), "phone")], "number"),
        fmt(t("whatsappNumber", "WhatsApp number (international, no +)"), "digits"), t("mapQuery", "Map search text")],
    },
    {
      key: "form", title: "Inquiry Form",
      fields: [t("eyebrow", "Small heading"), t("title", "Title"), ta("description", "Description"), t("buttonText", "Button text"),
        ta("successMessage", "Message shown after sending"), atLeast(tags("courseOptions", "Course dropdown options", "Press Enter after each course"), 1)],
    },
  ],
};

const defaults = {
  hero: {
    eyebrow: "Contact Kanzul Islam", title: "Let's plan your next move!",
    text: P("Whether you are starting your journey in IT or looking to advance your technical expertise, our admissions team at Kanzul Islam is ready to guide you. Reach out today to explore our hands-on courses, flexible class schedules, and personalized career pathways. Connect with us via phone, email, or visit our campus to take the first confident step toward your professional future."),
    image: `${U}/contact-hero.png`, primaryLabel: "View courses", primaryUrl: "/courses",
  },
  info: {
    eyebrow: "Get in touch", title: "We’re here to help.",
    address: "Building no 58-A, Street 6 Rizwan Park Near Shezan Factory Bund Road Lahore.",
    email: "waqar.rehmat1993@gmail.com", phones: [{ number: "0315-4831393" }, { number: "0315-4752910" }],
    whatsappNumber: "923154752910", mapQuery: "Building no 58-A, Street 6 Rizwan Park Near Shezan Factory Bund Road Lahore, Pakistan",
  },
  form: {
    eyebrow: "Quick inquiry", title: "Tell us what you’re looking for.",
    description: "Complete the form and our admissions team will contact you.",
    buttonText: "Send inquiry", successMessage: "Thank you! Your inquiry has been received. We will contact you soon.",
    courseOptions: courses.map((c) => c.title),
  },
};

export default { def, defaults } satisfies PageModule;
