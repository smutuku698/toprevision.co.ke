import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ARMS: { name: string; role: string; branch: "legislature" | "executive" | "judiciary" | "county" }[] = [
  { name: "The National Assembly", role: "represents the people and passes laws on national matters", branch: "legislature" },
  { name: "The Senate", role: "represents and protects the interests of counties", branch: "legislature" },
  { name: "The Cabinet", role: "helps the President formulate and implement government policy", branch: "executive" },
  { name: "The Office of the President", role: "leads the Executive and oversees implementation of national policy", branch: "executive" },
  { name: "The Attorney-General", role: "is the principal legal adviser to the national government", branch: "executive" },
  { name: "The Supreme Court", role: "is the highest court and the final court of appeal in Kenya", branch: "judiciary" },
  { name: "The Court of Appeal", role: "hears appeals from the High Court and subordinate courts", branch: "judiciary" },
  { name: "The High Court", role: "has unlimited original jurisdiction in civil and criminal matters", branch: "judiciary" },
  { name: "Magistrates' Courts", role: "handle most day-to-day civil and criminal cases at the local level", branch: "judiciary" },
  { name: "The Independent Electoral and Boundaries Commission (IEBC)", role: "conducts and supervises elections and referenda", branch: "executive" },
  { name: "The Judicial Service Commission", role: "appoints judges and oversees the judiciary's administration", branch: "judiciary" },
  { name: "The County Assembly", role: "makes laws (county legislation) for a county government", branch: "county" },
  { name: "The County Executive Committee", role: "implements county legislation and policy, led by the Governor", branch: "county" },
];

const ARM_LABEL: Record<string, string> = {
  legislature: "Part of the Legislature (makes national laws)",
  executive: "Part of the Executive (implements and enforces laws/policy)",
  judiciary: "Part of the Judiciary (interprets law and settles disputes)",
  county: "Part of a devolved county government",
};

const COURT_HIERARCHY = [
  { id: "magistrate", label: "Magistrates' Courts" },
  { id: "high", label: "The High Court" },
  { id: "appeal", label: "The Court of Appeal" },
  { id: "supreme", label: "The Supreme Court" },
] as const;

const FILL_BLANK_TEMPLATES = [
  {
    before: "The three arms of the Kenyan government are the Legislature, the Executive, and the ",
    after: ".",
    correctAnswer: "Judiciary",
    accepted: ["judiciary"],
    explanation: "Kenya's government is divided into three arms: the Legislature, the Executive, and the Judiciary.",
  },
  {
    before: "The arm of government that makes laws is called the ",
    after: ".",
    correctAnswer: "Legislature",
    accepted: ["legislature", "parliament"],
    explanation: "The Legislature (Parliament, made up of the National Assembly and the Senate) makes laws.",
  },
  {
    before: "The arm of government that implements and enforces laws is called the ",
    after: ".",
    correctAnswer: "Executive",
    accepted: ["executive"],
    explanation: "The Executive, led by the President and the Cabinet, implements and enforces the laws Parliament passes.",
  },
  {
    before: "Parliament in Kenya is made up of the National Assembly and the ",
    after: ".",
    correctAnswer: "Senate",
    accepted: ["senate"],
    explanation: "Kenya's Parliament is bicameral: it has the National Assembly and the Senate.",
  },
  {
    before: "The house of Parliament that represents and protects the interests of counties is the ",
    after: ".",
    correctAnswer: "Senate",
    accepted: ["senate"],
    explanation: "The Senate represents counties and protects their interests, including in matters of county revenue allocation.",
  },
  {
    before: "The highest court and final court of appeal in Kenya is the ",
    after: ".",
    correctAnswer: "Supreme Court",
    accepted: ["supreme court"],
    explanation: "The Supreme Court sits at the top of the judicial hierarchy and is the final court of appeal.",
  },
  {
    before: "The commission responsible for conducting and supervising elections in Kenya is the ",
    after: ".",
    correctAnswer: "IEBC",
    accepted: ["iebc", "independent electoral and boundaries commission"],
    explanation: "The Independent Electoral and Boundaries Commission (IEBC) conducts and supervises elections and referenda.",
  },
  {
    before: "The principle where power is shared between the Legislature, Executive, and Judiciary so none becomes too powerful is called separation of ",
    after: ".",
    correctAnswer: "powers",
    accepted: ["powers", "power"],
    explanation: "Separation of powers spreads state authority across the three arms so each can check the others, preventing any single arm from dominating.",
  },
  {
    before: "A county government's legislative organ, which makes county laws, is called the county ",
    after: ".",
    correctAnswer: "assembly",
    accepted: ["assembly", "county assembly"],
    explanation: "The County Assembly is the legislative organ of a county government, while the County Executive Committee (led by the Governor) implements county policy.",
  },
  {
    before: "The official who is the principal legal adviser to the national government is the ",
    after: ".",
    correctAnswer: "Attorney-General",
    accepted: ["attorney-general", "attorney general"],
    explanation: "The Attorney-General is the principal legal adviser to the national government and represents it in legal proceedings.",
  },
] as const;

export const armsOfGovernment: Skill = {
  id: "ss-h-arms-of-government",
  code: "H.1",
  subjectId: "social-studies",
  strandId: "ss-extra-practice",
  grade: 9,
  title: "Arms and organs of government",
  description: "Match each arm or organ of the Kenyan government to its role.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "recall", "fill-blank", "classify", "court-order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, ARMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.role })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.name] = t.name;

      return {
        kind: "click-match",
        prompt: "Match each arm or organ of government to its role.",
        tokens,
        targets,
        correctMap,
        hint: "Think about who makes laws, who carries them out, and who settles disputes about them.",
        explanation: chosen.map((t) => `${t.name} — ${t.role}.`).join(" "),
      };
    }

    if (branch === "recall") {
      const target = randChoice(rng, ARMS);
      const distractors = shuffle(rng, ARMS.filter((a) => a.name !== target.name)).slice(0, 3);
      const choices = shuffle(rng, [target, ...distractors]);

      return {
        kind: "multiple-choice",
        prompt: `Which arm or organ of government ${target.role}?`,
        choices: choices.map((c) => c.name),
        correctIndex: choices.findIndex((c) => c.name === target.name),
        hint: "Think about who makes laws, who carries them out, and who settles disputes about them.",
        explanation: `${target.name} — ${target.role}.`,
      };
    }

    if (branch === "classify") {
      const chosen = shuffle(rng, ARMS).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((a) => a.branch))).map((b) => ({ id: b, label: ARM_LABEL[b] }));
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.name }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.branch));
      return {
        kind: "categorize",
        prompt: "Sort each organ of government by which arm it belongs to.",
        items,
        buckets,
        correctBucket,
        hint: "National organs split into Legislature, Executive, and Judiciary; county organs are a separate, devolved level.",
        explanation: chosen.map((a) => `${a.name} — ${ARM_LABEL[a.branch].toLowerCase()}.`).join(" "),
        visual: { type: "hierarchy", levels: [["Government of Kenya"], buckets.map((b) => ARM_LABEL[b.id].replace(/^Part of (the |a )?/, "").replace(/\s*\(.*\)$/, ""))] },
      };
    }

    if (branch === "court-order") {
      const items = shuffle(rng, COURT_HIERARCHY.map((c) => ({ id: c.id, label: c.label })));
      return {
        kind: "ordering",
        prompt: "Arrange Kenya's courts from the lowest to the highest in the judicial hierarchy.",
        instruction: "Drag to reorder from lowest to highest.",
        items,
        correctOrder: COURT_HIERARCHY.map((c) => c.id),
        hint: "An appeal moves upward: from a Magistrate's Court, to the High Court, to the Court of Appeal, and finally the Supreme Court.",
        explanation: COURT_HIERARCHY.map((c, i) => `${i + 1}. ${c.label}.`).join(" "),
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence about arms and organs of government.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about which arm of government — Legislature, Executive, or Judiciary — is responsible for this.",
      explanation: fb.explanation,
    };
  },
};
