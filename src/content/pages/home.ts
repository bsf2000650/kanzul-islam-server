import courses from "../courses.default.json";
import { type PageModule, ICONS, P, U, t, ta, rt, img, url, num, tags, sel, list, opt, atLeast } from "../schema";

const def = {
  key: "home",
  title: "Home",
  description: "Home page sections, from top to bottom (discount line, header, navbar and footer are under Common).",
  sections: [
    {
      key: "carousel", title: "Carousel", description: "Hero images at the top of the Home page.",
      fields: [
        num("autoplaySeconds", "Seconds between slides", 2, 60),
        list("slides", "Carousel images", "Slide", [
          img("image", "Image (wide / desktop)", "Recommended 21:9 (e.g. 2100×900)"),
          img("mobileImage", "Mobile image (optional)"), t("alt", "Image description (alt text)"), url("link", "Link when clicked (optional)"),
        ], "alt"),
      ],
    },
    {
      key: "learn", title: "Choose How You Learn", description: "Heading and the learning-mode cards.",
      fields: [
        t("eyebrow", "Small heading"), t("title", "Title"), ta("description", "Description"),
        list("cards", "Cards", "Card", [sel("icon", "Icon", ICONS), t("title", "Title"), ta("description", "Description")], "title"),
      ],
    },
    {
      key: "missionVision", title: "Mission and Vision", description: "Image on the left, Mission and Vision text on the right.",
      fields: [
        img("image", "Image (Directors)"),
        t("missionTitle", "Mission heading"), rt("mission", "Mission paragraph"),
        t("visionTitle", "Vision heading"), rt("vision", "Vision paragraph"),
      ],
    },
    {
      key: "provide", title: "What Does Kanzul Islam Provide?", description: "Program cards with images.",
      fields: [
        t("eyebrow", "Small heading"), t("title", "Title"), ta("description", "Description"),
        list("cards", "Program cards", "Program", [
          img("image", "Image"), t("label", "Badge label"), sel("icon", "Icon", ICONS),
          t("title", "Title"), ta("description", "Description"),
          t("applyLabel", "Apply button text"), url("applyUrl", "Apply button link"),
          t("moreLabel", "Learn-more button text"), url("moreUrl", "Learn-more button link"),
        ], "title"),
      ],
    },
    {
      key: "testimonials", title: "Testimonials", description: "Learner stories.",
      fields: [
        t("eyebrow", "Small heading"), t("title", "Title"), ta("description", "Description"),
        list("items", "Testimonials", "Testimonial", [rt("quote", "Quote"), t("name", "Name"), t("role", "Role / course")], "name"),
      ],
    },
    {
      key: "whoWeAre", title: "Who We Are", description: "Associates / partner logos.",
      fields: [
        t("eyebrow", "Small heading"), t("title", "Title"), rt("description", "Description"),
        list("partners", "Partners", "Partner", [t("name", "Name"), img("logo", "Logo"), url("url", "Website (optional)")], "name"),
      ],
    },
    {
      key: "quickInquiry", title: "Quick Inquiry", description: "Text of the inquiry form (submissions appear under Students Inquiries).",
      fields: [
        t("eyebrow", "Small heading"), t("title", "Title"), ta("description", "Description"), t("buttonText", "Button text"),
        img("image", "Side panel image"), t("panelEyebrow", "Side panel small heading"), t("panelTitle", "Side panel title"),
        opt(list("highlights", "Highlights", "Highlight", [sel("icon", "Icon", ICONS), t("text", "Text")], "text")),
        atLeast(tags("courseOptions", "Course dropdown options", "Press Enter after each course"), 1),
      ],
    },
  ],
};

const defaults = {
  carousel: {
    autoplaySeconds: 6.5,
    slides: [
      { image: `${U}/hero-1.jpg`, mobileImage: "", alt: "Kanzul Islam IT training courses", link: "" },
      { image: `${U}/hero-2.png`, mobileImage: "", alt: "Full Stack Development course: physical classes", link: "" },
      { image: `${U}/hero-3.png`, mobileImage: "", alt: "Artificial Intelligence course", link: "" },
      { image: `${U}/hero-4.jpg`, mobileImage: "", alt: "IT Fundamentals course", link: "" },
    ],
  },
  learn: {
    eyebrow: "Flexible learning", title: "Choose how you learn",
    description: "Kanzul Islam provides practical IT education through learning formats designed for individuals, professionals, and organizations.",
    cards: [
      { icon: "monitor", title: "Classroom", description: "Learn together with instructor-led, in-person sessions." },
      { icon: "user-round", title: "One to One", description: "Get focused guidance tailored to your learning goals." },
      { icon: "building-2", title: "Customer Premise", description: "Build practical skills for teams and organizations." },
    ],
  },
  missionVision: {
    image: `${U}/director.jpg`,
    missionTitle: "Mission",
    mission: P("To empower individuals and organizations with the knowledge and skills needed to excel in the rapidly evolving field of Information Technology. We are committed to providing high-quality, comprehensive, and practical IT training programs that equip our students with the latest industry-relevant skills, tools, and technologies. Our mission is to enable our students to unlock their full potential, enhance their career prospects, and contribute to the growth of the IT industry in Pakistan and beyond. We strive to deliver exceptional training experiences through experienced instructors, state-of-the-art facilities, and hands-on learning approaches."),
    visionTitle: "Vision",
    vision: P("Kanzul Islam is renowned worldwide for the quality of its educational and training courses. We help learners progress from introductory computer skills to advanced professional expertise through flexible, practical learning. Our courses respond to current industry needs and combine supportive instruction with project-based, hands-on activities. We aim to be a trusted choice for IT training in Lahore and Pakistan, known for excellence, integrity, and a welcoming learning environment."),
  },
  provide: {
    eyebrow: "Explore your next skill", title: "What does Kanzul Islam provide?",
    description: "Explore practical training paths across technology and professional development.",
    cards: [
      { image: `${U}/program-fullstack.jpeg`, label: "Development", icon: "code", title: "Full Stack Development", description: "Create modern static websites and web-apps." },
      { image: `${U}/program-ai.jpeg`, label: "AI Development", icon: "bot", title: "AI Development", description: "Develop Artificial Intelligence softwares." },
      { image: `${U}/program-itfund.jpeg`, label: "Essentials Softwares", icon: "layout-dashboard", title: "Essential softwares.", description: "Get hands on experience on essentials daily life application softwares." },
      { image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80", label: "Cloud", icon: "cloud", title: "Cloud Computing", description: "Explore modern cloud platforms and infrastructure." },
    ].map((c) => ({ ...c, applyLabel: "Apply", applyUrl: "/contact", moreLabel: "Learn more", moreUrl: "/courses" })),
  },
  testimonials: {
    eyebrow: "Learner stories", title: "A little progress goes a long way",
    description: "Read about learners’ experiences with practical IT training at KanzulIslam.",
    items: [
      { quote: P("KanzulIslam offers a great environment for learning and developing technical skills. The training sessions help make complex IT concepts easier to understand, while practical exercises provide valuable hands-on experience. It is a good choice for anyone looking to improve their knowledge and grow in the IT field."), name: "Sheeraz", role: "Student" },
      { quote: P("My learning experience at KanzulIslam has been valuable and rewarding. The structured training and focus on practical skills help students understand industry concepts and build confidence. I would recommend KanzulIslam to individuals who want to strengthen their technical expertise and explore new career opportunities in IT."), name: "Usman", role: "Student" },
      { quote: P("My experience with KanzulIslam has been very positive. The training approach focuses on practical knowledge, clear explanations, and industry-relevant skills. The learning environment encourages students to ask questions, gain hands-on experience, and strengthen their technical abilities. I would recommend KanzulIslam to anyone looking to enhance their IT knowledge and take the next step in their professional journey."), name: "Anonymous student", role: "KanzulIslam learner" },
    ],
  },
  whoWeAre: {
    eyebrow: "Who we are", title: "Built through collaboration",
    description: P("We value the organizations and communities that help make learning and professional growth possible."),
    partners: [
      { name: "InfoComm Technology", logo: `${U}/partner-ict.png`, url: "https://infocommtech.com/" },
      { name: "TekkDev", logo: `${U}/partner-tekdev.jpg`, url: "https://www.tekkdev.com/" },
      { name: "GCS", logo: `${U}/partner-gcs.png`, url: "https://gcspvt.com/" },
      { name: "CMC", logo: `${U}/partner-cmc.jpeg`, url: "https://www.cmc.com.pk/" },
      { name: "Star Oil Filling Station", logo: `${U}/partner-staroil.jpeg`, url: "" },
    ],
  },
  quickInquiry: {
    eyebrow: "Quick inquiry", title: "Tell us what you’re looking for.",
    description: "Share your details and our admissions team will get back to you.",
    buttonText: "Send inquiry",
    image: `${U}/inquiry-panel.png`, panelEyebrow: "Admissions open", panelTitle: "Start your IT career with expert guidance.",
    highlights: [
      { icon: "clock", text: "Reply within 24 hours" },
      { icon: "monitor-play", text: "In-campus classes" },
      { icon: "map-pin", text: "Campus in Lahore, Pakistan" },
    ],
    courseOptions: courses.map((c) => c.title),
  },
};

export default { def, defaults } satisfies PageModule;
