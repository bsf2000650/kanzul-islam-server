import { type PageModule, ICONS, U, t, ta, img, url, tags, sel, list } from "../schema";

const def = {
  key: "experts",
  title: "Meet Our Experts",
  description: "Expert profiles and the 'industry strengths' cards.",
  sections: [
    { key: "header", title: "Page Header", fields: [t("eyebrow", "Small heading"), t("title", "Title"), ta("description", "Description")] },
    {
      key: "experts", title: "Experts",
      fields: [
        list("items", "Experts", "Expert", [
          img("photo", "Photo (optional)"), t("name", "Name"), t("role", "Role"), t("experience", "Experience (optional, e.g. 5+ years)"),
          ta("about", "About"), tags("skills", "Skills", "Press Enter after each skill"), url("linkedin", "LinkedIn URL (optional)"),
        ], "name"),
      ],
    },
    {
      key: "strengths", title: "Industry Strength Cards",
      fields: [list("items", "Cards", "Card", [sel("icon", "Icon", ICONS), t("title", "Title"), ta("description", "Description")], "title")],
    },
  ],
};

const E = (name: string, role: string, experience: string, about: string, skills: string[], linkedin: string, photo = "") =>
  ({ name, role, experience, about, skills, linkedin, photo });

const defaults = {
  header: { eyebrow: "Meet our experts", title: "The people behind Kanzul Islam", description: "Experienced professionals who guide our programs with practical, industry-focused knowledge." },
  experts: {
    items: [
      E("Waqar Rehmat Ali", "Director", "11+ years of experience", "Senior Software Project Manager and Product Manager who has delivered software products across diverse industries. Works closely with stakeholders and engineering teams to turn business needs into clear roadmaps and dependable delivery.", ["Product Management", "Agile / Scrum", "Stakeholder Management", "Risk Management", "SaaS"], "https://www.linkedin.com/in/waqar-rehmat-ali/", `${U}/expert-waqar.jpg`),
      E("Waleed Ejaz", "Senior Solution Architect", "5+ years of experience", "Full-stack engineer focused on building high-performance, scalable applications. Follows sound engineering principles and keeps pace with new languages, frameworks, and practices across the technology industry.", ["Full-Stack Development", "Solution Architecture", "Scalable Systems", "Software Design"], "https://www.linkedin.com/in/waleed-ejaz-07204236b/", `${U}/expert-waleed-ejaz.webp`),
      E("Waleed Arif", "AI / ML Engineer", "2+ years of experience", "AI engineer who builds practical, production-ready AI systems, from language-model applications to computer vision. Experienced in deploying models and serving them through reliable APIs.", ["Python", "PyTorch", "Hugging Face", "LLMs & RAG", "FastAPI", "Azure ML"], "https://www.linkedin.com/in/waleed1011/", `${U}/expert-waleed-arif.jpg`),
      E("Asad Ullah", "Full-Stack Web Developer", "2+ years of experience", "Full-stack web developer building production systems across the frontend, backend, and cloud. Owns features end to end, from the user interface and API design to deployment.", ["React", "Next.js", "TypeScript", "Node.js / NestJS", "PostgreSQL", "AWS"], "https://www.linkedin.com/in/asadullah-mehsud/", `${U}/expert-asad.jpg`),
      E("Muhammad Ahmad", "AI Engineer", "2+ years of experience", "AI engineer and Python developer specializing in agentic AI, retrieval-augmented generation, and autonomous workflows. Bridges LLM research and scalable software, from backend APIs to cloud deployment.", ["Python", "FastAPI", "LangChain", "LangGraph", "Docker"], "https://www.linkedin.com/in/mahmad5448/", `${U}/expert-ahmad.jpg`),
      E("Sania Salman Dar", "MERN Stack Developer", "1+ year of experience", "Full-stack developer working across the MERN stack to build responsive, dynamic web applications. Comfortable moving between the user interface, server logic, and database layer.", ["MongoDB", "Express.js", "React", "Node.js"], "https://www.linkedin.com/in/sania-salman-dar-428002354/"),
      E("Zainab Zahid", "Full-Stack Engineer", "1.5+ years of experience", "Full-stack engineer building web apps that ship to real users, from REST API architecture to responsive, accessible frontends. Works TypeScript-first with clean, maintainable code.", ["Next.js", "TypeScript", "Django REST", "PostgreSQL"], "https://www.linkedin.com/in/zainab-zahid-b18428240/"),
      E("Talha Rauf", "Senior Software Engineer", "4+ years of experience", "Senior engineer building backend and full-stack applications, with a focus on system design, complex workflows, and ownership of production systems. Leads engineers through code review and delivery.", ["Node.js", "NestJS", "TypeScript", "MongoDB", "AWS"], "https://www.linkedin.com/in/talha-rauf-lnkin/", `${U}/expert-talha-rauf.jpg`),
      E("Talha Luqman", "QA Engineer", "3+ years of experience", "Quality assurance engineer committed to growing his technical skills while contributing to the success of the teams and organizations he works with.", ["Quality Assurance", "Software Testing"], "https://www.linkedin.com/in/talha-luqman-583b20175/", `${U}/expert-talha-luqman.png`),
    ],
  },
  strengths: {
    items: [
      { icon: "briefcase", title: "Industry-focused learning", description: "Explore practical skills across networking, cybersecurity, cloud, software, and digital technologies." },
      { icon: "graduation-cap", title: "Guidance that supports growth", description: "Build your understanding step by step with structured training and support throughout your learning journey." },
      { icon: "network", title: "Practice with purpose", description: "Connect core concepts to hands-on exercises and the kinds of challenges learners encounter in IT roles." },
      { icon: "brain-circuit", title: "Skills for what’s next", description: "Develop technical confidence and keep pace with evolving tools, technologies, and professional needs." },
    ],
  },
};

export default { def, defaults } satisfies PageModule;
