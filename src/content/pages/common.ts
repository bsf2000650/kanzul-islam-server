import { type PageModule, ICONS, P, U, t, ta, rt, img, col, url, bool, num, sel, list, opt, fmt, reqd } from "../schema";

const def = {
  key: "common",
  title: "Common",
  description: "Items shown on every page of the website: theme colors, discount line, header, navigation and footer.",
  sections: [
    {
      key: "theme", title: "Theme Colors", description: "Change the website colors. Changes apply across all pages.",
      fields: [
        col("primary", "Primary color"), col("secondary", "Secondary / accent color"),
        col("background", "Page background"), col("foreground", "Main text color"),
        col("announcementBg", "Discount line background"), col("announcementText", "Discount line text"),
        col("cardBg", "Card background"), col("cardText", "Card text"),
        col("footerBg", "Footer background"), col("footerText", "Footer text"),
      ],
    },
    {
      key: "announcement", title: "Discount Line (rolling banner)", description: "The scrolling offer line shown at the very top.",
      fields: [
        bool("enabled", "Show the discount line"),
        num("speed", "Scroll speed (1 slow – 10 fast)", 1, 10),
        opt(list("items", "Messages", "Message", [rt("text", "Message"), t("linkLabel", "Link text (optional)"), url("linkUrl", "Link URL (optional)")], "linkLabel")),
      ],
    },
    {
      key: "header", title: "College Name Line", description: "Logo, college name and the 'Project of' line under the discount line.",
      fields: [img("logo", "Logo"), t("collegeName", "College name"), t("projectOf", "Project of line"), { ...t("badge", "Badge letter (circle on the right)"), maxLength: 3 }],
    },
    {
      key: "navbar", title: "Navigation Bar", description: "Add, remove, reorder or rename menu items.",
      fields: [
        list("items", "Menu items", "Menu item", [
          t("label", "Label"), t("url", "Link (e.g. /about)"), sel("icon", "Mobile icon", ICONS), bool("visible", "Visible"),
        ], "label"),
      ],
    },
    {
      key: "footer", title: "Footer", description: "Footer brand, contact details, map and social links.",
      fields: [
        img("logo", "Footer logo"), t("brandName", "Brand name"), t("brandSub", "Brand sub-title"),
        rt("about", "About text"),
        opt(list("socials", "Social links", "Social link", [
          reqd(sel("platform", "Platform", ["facebook", "instagram", "youtube", "tiktok", "linkedin", "twitter", "whatsapp"].map((v) => ({ value: v, label: v })))),
          url("url", "URL"),
        ], "platform")),
        t("contactTitle", "Contact column heading"), t("addressTitle", "Address label"), ta("address", "Address"),
        t("locationTitle", "Map column heading"), t("mapQuery", "Map search text (address shown on the map)"),
        t("touchTitle", "Get in touch heading"), fmt(t("email", "Email"), "email"),
        list("phones", "Phone numbers", "Phone", [fmt(t("number", "Number"), "phone")], "number"),
        fmt(t("whatsappNumber", "WhatsApp number (international, no +)"), "digits"), t("whatsappLabel", "WhatsApp button text"),
        t("copyright", "Copyright text"),
      ],
    },
  ],
};

const defaults = {
  theme: {
    primary: "#4169E1", secondary: "#4169E1", background: "#FFFFFF", foreground: "#2C2C2C",
    announcementBg: "#4169E1", announcementText: "#FFFFFF", cardBg: "#4169E1", cardText: "#FFFFFF",
    footerBg: "#4169E1", footerText: "#FFFFFF",
  },
  announcement: {
    enabled: true, speed: 5,
    items: [
      { text: "<p><strong>Get 60% off today.</strong> Get registered.</p>", linkLabel: "Explore courses", linkUrl: "/courses" },
      { text: "<p><strong>Get 60% off today.</strong> Get registered ASAP.</p>", linkLabel: "", linkUrl: "" },
    ],
  },
  header: { logo: `${U}/logo.png`, collegeName: "Kanzul Islam Computer College", projectOf: "Project of K Group", badge: "K" },
  navbar: {
    items: [
      { label: "Home", url: "/", icon: "home", visible: true },
      { label: "About Us", url: "/about", icon: "info", visible: true },
      { label: "Courses", url: "/courses", icon: "book-open", visible: true },
      { label: "Contact", url: "/contact", icon: "phone", visible: true },
      { label: "Class Schedule", url: "/class-schedule", icon: "calendar-days", visible: true },
      { label: "Meet our Experts", url: "/meet-out-experts", icon: "users", visible: true },
    ],
  },
  footer: {
    logo: `${U}/logo.png`, brandName: "Kanzul Islam", brandSub: "Computer College",
    about: P("We focus on technologies like Routing &amp; Switching, Cyber Security, Cloud Computing, DevOps, Ethical Hacking, Web Development, Graphic Designing, SEO, Digital Marketing, and Operating Systems."),
    socials: [
      { platform: "facebook", url: "https://www.facebook.com/profile.php?id=61596479728017" },
      { platform: "instagram", url: "https://www.instagram.com/kanzul_islam_computer_college/" },
      { platform: "youtube", url: "https://www.youtube.com/@arstudio540" },
      { platform: "tiktok", url: "https://www.tiktok.com/@waqar_rehmat_ali?lang=en" },
    ],
    contactTitle: "Contact Us", addressTitle: "Find Us",
    address: "Building no 58-A, Street 6 Rizwan Park\nNear Shezan Factory Bund Road Lahore.",
    locationTitle: "Our Location", mapQuery: "Building no 58-A, Street 6 Rizwan Park Near Shezan Factory Bund Road Lahore.",
    touchTitle: "Get in touch", email: "waqar.rehmat1993@gmail.com",
    phones: [{ number: "0315-4831393" }, { number: "0315-4752910" }],
    whatsappNumber: "923154752910", whatsappLabel: "Free consultation on WhatsApp",
    copyright: "Kanzul Islam. All rights reserved.",
  },
};

export default { def, defaults } satisfies PageModule;
