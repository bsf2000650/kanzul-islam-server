import { type PageModule, P, U, t, rt, img, url, list, opt } from "../schema";

const def = {
  key: "about",
  title: "About Us",
  description: "About page: intro, story, impact numbers and strengths.",
  sections: [
    {
      key: "hero", title: "Intro (text left, image right)",
      fields: [
        t("eyebrow", "Small heading"), t("title", "Title"), rt("text", "Text"), img("image", "Image"),
        t("primaryLabel", "Primary button text"), url("primaryUrl", "Primary button link"),
        opt(t("secondaryLabel", "Secondary button text")), opt(url("secondaryUrl", "Secondary button link")),
      ],
    },
    { key: "story", title: "Story (image left, text right)", fields: [img("image", "Image"), t("title", "Title"), rt("text", "Text")] },
    {
      key: "impact", title: "Our Impact (number cards)",
      fields: [t("eyebrow", "Small heading"), t("title", "Title"), list("stats", "Cards", "Card", [t("value", "Number (e.g. 70,400+)"), t("label", "Label")], "label")],
    },
    {
      key: "strengths", title: "Why Trainees Choose Us (check list)",
      fields: [t("eyebrow", "Small heading"), t("title", "Title"), list("items", "Points", "Point", [t("text", "Text")], "text")],
    },
  ],
};

const defaults = {
  hero: {
    eyebrow: "About Kanzul Islam", title: "Why Chose Kanzul Islam ?",
    text: P("For the last 16 years, Kanzul Islam has commanded veneration not only in Pakistan as a perfectionist in Computer Network Education, but also throughout the subcontinent. We provide an encouraging environment with special emphasis on hands-on training. Our aim is to highlight the inner potential of students in order to develop their competitive character needed to face the professional world."),
    image: `${U}/about-hero.jpg`, primaryLabel: "Explore our courses", primaryUrl: "/courses", secondaryLabel: "Talk to our team", secondaryUrl: "/contact",
  },
  story: {
    image: `${U}/director.jpg`, title: "From first steps to advanced expertise.",
    text:
      P("Kanzul Islam is renowned nationwide for the high quality of its training courses. Many of our clients took their first computer training courses with us at introductory and beginner levels and have progressed with us to the advanced and expert levels.") +
      P("Our impressive customer base and high customer satisfaction ratings are the result of our total commitment to quality and value. For students who don’t have much time and prefer to work on their own schedule, we offer customized, personalized, and individual-attention computer training programmes to suit all levels.") +
      P("Being the trend setter in technical skill training, Kanzul Islam has great training packages and instruction methodology for individuals, foreign students, corporate firms, and universities.") +
      P("To support busy learners who prefer studying at their own pace, we also provide flexible, one-on-one training programs tailored to individual schedules and skill levels. Setting the benchmark in IT and technical skill development, Kanzul Islam delivers comprehensive training packages and proven teaching methodologies designed for students and learners."),
  },
  impact: {
    eyebrow: "Our impact", title: "Kanzul Islam has produced the following professionals",
    stats: [
      ["70,400+", "CCNA’s (Cisco Certified Network Associate)"], ["24,500+", "CCNP’s (Cisco Certified Network Professional)"],
      ["2,203+", "CCIE’s (Cisco Certified Internetwork Expert)"], ["3,000+", "CCSP’s / CCNP’s Security (Cisco Certified Security Professional)"],
      ["2,000+", "CCVP’s / CCNP’s Voice (Cisco Certified Voice Professional)"], ["28,060+", "MCSE’s (Microsoft Certified System Engineer)"],
      ["2,750+", "MCITP’s (Microsoft Certified IT Professional)"], ["9,561+", "Linux Systems Engineer (RHCSA & RHCE)"],
      ["350+", "Juniper Certified"], ["76+", "Huawei Certified"], ["7,000+", "Corporate trainings"],
    ].map(([value, label]) => ({ value, label })),
  },
  strengths: {
    eyebrow: "Why trainees choose us", title: "The salient features that set our training apart",
    items: [
      "Only IT trainings institute having eight CCIE instructors including quad / triple and Dual CCIEs",
      "Only IT trainings institute having two MCT instructors",
      "Only IT trainings institute having three HCIE instructors",
      "Only IT trainings institute having three HCNP instructors",
      "Only IT trainings institute having instructors with certifications like ITIL, CISA, PMP, CISSP, DCS, SCP etc",
      "Well equipped state of the Art computer labs", "Availability of labs for 24 hours", "Fully equipped CCIE racks",
      "Real Hands-On training experience", "Vendors Certified Instructors", "Careful Career Counseling",
      "Strict quality policy managed by comprehensive evaluation system",
      "Market driving courses offered on emerging technologies on latest equipment in class rooms",
      "Job placement for students", "Conducive environment for training", "Industrial internships arranged for students",
      "Nationwide education chain", "Vast experience of national and international corporate trainings",
    ].map((text) => ({ text })),
  },
};

export default { def, defaults } satisfies PageModule;
