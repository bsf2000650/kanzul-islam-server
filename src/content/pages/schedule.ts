import { type PageModule, t, ta, table } from "../schema";

const def = {
  key: "schedule",
  title: "Class Schedule",
  description: "Timetable of course batches. Add or remove rows and columns freely.",
  sections: [
    { key: "header", title: "Page Header", fields: [t("eyebrow", "Small heading"), t("title", "Title"), ta("description", "Description"), t("summaryLabel", "Text after the class count (e.g. 'classes listed')")] },
    { key: "timetable", title: "Timetable", description: "Use + Row / + Column; edit headers and cells directly.", fields: [table("table", "Schedule table")] },
  ],
};

const cols: [string, string][] = [["course", "Course"], ["mode", "Training mode"], ["trainer", "Trainer"], ["days", "Days"], ["startDate", "Starting date"], ["time", "Time (GMT+5)"]];
const rows: string[][] = [
  ["CCNA 86 with FREE LINUX (Morning)", "In Campus", "Mr. Tahir Ali", "Daily", "10th Nov, 2026", "11:30am to 12:30pm"],
  ["CCNA 87 with FREE LINUX", "In Campus", "Mr. Haroon Malik", "Monday, Wednesday, Friday", "18th Nov, 2026", "6:30pm to 7:30pm"],
  ["CCNP Enterprise (Morning)", "In Campus", "Mr. Tahir Ali", "Monday to Thursday", "3rd Nov, 2026", "12:30pm to 1:30pm"],
  ["CCIE Security", "In Campus", "Mr. Haroon Malik / Mr. Moiz Aftab", "Saturday / Sunday", "31st Oct, 2026", "1:00pm to 3:00pm"],
  ["CEH (Certified Ethical Hacking)", "In Campus", "Mr. Ahsan Malik", "Daily", "20th Oct, 2026", "6:15pm to 7:30pm"],
  ["DevOps & Modern Deployment", "In Campus", "Mr. Subhan Malik", "Saturday / Sunday", "5th Dec, 2026", "6:00pm to 7:30pm"],
  ["AWS Solution Architect Associate", "In Campus", "Mr. Subhan Malik", "Saturday / Sunday", "12th Dec, 2026", "7:30pm to 9:00pm"],
  ["AWS Cloud Security", "In Campus", "Mr. Subhan Malik", "Saturday / Sunday", "21st Nov, 2026", "4:30pm to 6:30pm"],
  ["Agentic AI", "In Campus", "Mr. M. Kamran Khan", "Saturday / Sunday", "14th Nov, 2026", "4:00pm to 6:00pm"],
  ["Graphic Designing AND Video Editing", "In Campus", "", "Monday, Wednesday, Friday", "4th Nov, 2026", "6:30pm to 7:30pm"],
  ["MCSE 2025 with FREE Azure Cloud", "In Campus", "Mr Asif Shafiq", "Tuesday, Thursday, Saturday", "20th Oct, 2026", "6:30pm to 7:30pm"],
  ["Exchange Server 2025", "In Campus", "Mr Asif Shafiq", "Tuesday / Thursday", "27th Oct, 2026", "7:30pm to 9:00pm"],
];

const defaults = {
  header: {
    eyebrow: "Course timetable · Pakistan", title: "Class Schedule for Kanzul Islam Lahore",
    description: "Browse course batches, class days, and timings. All times are listed in Pakistan Standard Time (GMT+5).",
    summaryLabel: "classes listed",
  },
  timetable: {
    table: {
      columns: cols.map(([key, label]) => ({ key, label })),
      rows: rows.map((r) => Object.fromEntries(cols.map(([k], i) => [k, r[i]]))),
    },
  },
};

export default { def, defaults } satisfies PageModule;
