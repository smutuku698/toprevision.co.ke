import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const CATEGORY_ITEMS = [
  { text: "An operating system such as Windows or Android", bucket: "system" },
  { text: "Antivirus software that protects the computer from malware", bucket: "system" },
  { text: "A word processor used to write a business letter", bucket: "application" },
  { text: "A spreadsheet program used to record sales figures", bucket: "application" },
  { text: "A presentation program used to build a slideshow", bucket: "application" },
] as const;

const CATEGORY_LABEL: Record<string, string> = { system: "System software", application: "Application software" };

const APP_TYPES = [
  { id: "word-processing", label: "Word processing software", func: "Creating and editing text documents such as letters and reports", scenario: "You need to type and format a report describing your business plan" },
  { id: "presentation", label: "Presentation software", func: "Building slideshows that combine text and images to present information", scenario: "You need to prepare a slideshow to pitch your product idea to investors" },
  { id: "spreadsheet", label: "Spreadsheet software", func: "Organising data in rows and columns and performing calculations with formulas", scenario: "You need to record and calculate your daily sales totals automatically" },
] as const;

export const computerSoftware: Skill = {
  id: "g8-pt-t-computer-software",
  code: "T.2",
  subjectId: "pre-technical",
  strandId: "g8-pt-tools",
  grade: 8,
  title: "Computer Software",
  description: "Categories of computer software used in a workplace, the functions of different application software, and their use in day-to-day tasks.",
  generate(rng) {
    const branch = randChoice(rng, ["category-sort", "type-match", "chart-scenario", "scenario", "recall"] as const);

    if (branch === "category-sort") {
      const chosen = shuffle(rng, CATEGORY_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: CATEGORY_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each example into system software or application software.",
        items,
        buckets,
        correctBucket,
        hint: "System software manages the computer itself; application software helps a user complete a specific task.",
        explanation: chosen.map((c) => `"${c.text}" — ${CATEGORY_LABEL[c.bucket]}.`).join(" "),
      };
    }

    if (branch === "type-match") {
      const tokens = shuffle(rng, APP_TYPES.map((a) => ({ id: a.id, label: a.label })));
      const targets = shuffle(rng, APP_TYPES.map((a) => ({ id: a.id, label: a.func })));
      const correctMap: Record<string, string> = {};
      for (const a of APP_TYPES) correctMap[a.id] = a.id;
      return {
        kind: "click-match",
        prompt: "Match each type of application software to what it is used for.",
        tokens,
        targets,
        correctMap,
        hint: "Each application software type is built for a specific kind of work.",
        explanation: APP_TYPES.map((a) => `${a.label}: ${a.func}.`).join(" "),
      };
    }

    if (branch === "chart-scenario") {
      const categories = ["Word docs", "Spreadsheets", "Slides", "PDFs"];
      const data = categories.map((label) => ({ label, value: randInt(rng, 3, 20) }));
      const others = APP_TYPES.filter((a) => a.id !== "spreadsheet").map((a) => a.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "Spreadsheet software", others, 2);
      return {
        kind: "multiple-choice",
        prompt: "This chart was generated directly from a table of numbers, with totals automatically calculated using formulas. Which application software category was most likely used to create this chart?",
        visual: { type: "bar-chart", data },
        choices,
        correctIndex,
        hint: "Think about which software organises numeric data in rows and columns and can turn it into a chart.",
        explanation: "Spreadsheet software organises data in rows and columns, performs calculations with formulas, and can generate charts directly from that data.",
      };
    }

    if (branch === "scenario") {
      const a = randChoice(rng, APP_TYPES);
      const others = APP_TYPES.filter((x) => x.id !== a.id).map((x) => x.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, a.label, others, 2);
      return {
        kind: "multiple-choice",
        prompt: `${a.scenario}. Which application software type should you use?`,
        choices,
        correctIndex,
        hint: "Match the task described to the software built for that kind of work.",
        explanation: `${a.label}: ${a.func}.`,
      };
    }

    // recall
    const a = randChoice(rng, APP_TYPES);
    return {
      kind: "fill-blank",
      prompt: `A type of application software is used for: "${a.func.toLowerCase()}."`,
      before: "This is called",
      after: ".",
      correctAnswer: a.label,
      acceptedAnswers: [a.id.replace("-", " "), a.label.replace(" software", "")],
      inputMode: "text",
      hint: "Think about which kind of application software matches this specific job.",
      explanation: `${a.label}: ${a.func}.`,
    };
  },
};
