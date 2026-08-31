import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";

const DIASPORA_COUNTRIES = [
  {
    country: "USA",
    description: "Millions of Africans were forcibly taken here through the transatlantic slave trade, and their descendants formed a large African-American community",
  },
  {
    country: "Brazil",
    description: "This country received more enslaved Africans than any other in the Americas, and today has one of the largest populations of African descent outside Africa",
  },
  {
    country: "France",
    description: "Many Africans from French colonies moved here for work, education, and military service, forming diaspora communities especially in Paris",
  },
] as const;

const ROLE_STATEMENTS = [
  "Sending remittances, investing in African economies, and advocating internationally for Africa's independence and rights",
  "Governing African countries directly from abroad instead of local leaders",
  "Replacing African governments with new colonial administrations",
  "Preventing African countries from trading with the rest of the world",
] as const;
const ROLE_CORRECT = ROLE_STATEMENTS[0];

const FACTOR_OR_ROLE = [
  { text: "The transatlantic slave trade forcibly took millions of Africans to the Americas.", type: "factor" },
  { text: "Colonial-era labour migration took Africans to Europe for work and study.", type: "factor" },
  { text: "Some Africans migrated abroad in search of better economic opportunities.", type: "factor" },
  { text: "Wars and conflicts in parts of Africa pushed some people to migrate abroad.", type: "factor" },
  { text: "Diaspora communities send remittances that support families and local economies in Africa.", type: "role" },
  { text: "Diaspora professionals share skills and knowledge with communities back in Africa.", type: "role" },
  { text: "Diaspora groups advocate internationally for African causes and human rights.", type: "role" },
  { text: "Diaspora investors fund businesses and development projects in African countries.", type: "role" },
  { text: "Some Africans migrated abroad seeking better education opportunities.", type: "factor" },
  { text: "Diaspora communities advocated internationally for African countries' independence movements.", type: "role" },
] as const;

const TYPE_LABEL: Record<string, string> = {
  factor: "Factor behind the presence of African diasporas",
  role: "Role diasporas play in Africa today",
};

const FILL_TEMPLATES = [
  {
    before: "Millions of Africans were forcibly taken to the",
    after: "through the transatlantic slave trade, forming a large African-American community.",
    answer: "USA",
    accepted: ["USA", "United States", "the USA", "US", "United States of America"],
  },
  {
    before: "This South American country, named",
    after: ", received more enslaved Africans during the transatlantic slave trade than any other country in the Americas, giving it one of the largest populations of African descent today.",
    answer: "Brazil",
    accepted: ["Brazil"],
  },
  {
    before: "Many Africans from French colonies settled in",
    after: ", especially in the city of Paris, for work, education, and military service.",
    answer: "France",
    accepted: ["France"],
  },
] as const;

export const africanDiasporas: Skill = {
  id: "g7-ss-pdg-african-diasporas",
  code: "PDG.4",
  subjectId: "social-studies",
  strandId: "g7-ss-pdg",
  grade: 7,
  title: "African diasporas",
  description: "Countries inhabited by African diasporas by 1960, the role of the diaspora in Africa's political development, and promoting African unity today.",
  generate(rng) {
    const branch = randChoice(rng, ["country-match", "role-mc", "factor-role-classify", "country-fill"] as const);

    if (branch === "country-match") {
      const tokens = shuffle(rng, DIASPORA_COUNTRIES.map((c) => ({ id: c.country, label: c.country })));
      const targets = shuffle(rng, DIASPORA_COUNTRIES.map((c) => ({ id: c.country, label: c.description })));
      const correctMap: Record<string, string> = {};
      for (const c of DIASPORA_COUNTRIES) correctMap[c.country] = c.country;
      return {
        kind: "click-match",
        prompt: "Match each country to a description of its African diaspora presence by 1960.",
        tokens,
        targets,
        correctMap,
        hint: "One of these countries is in Europe, and two are in the Americas.",
        explanation: DIASPORA_COUNTRIES.map((c) => `${c.country}: ${c.description}.`).join(" "),
      };
    }

    if (branch === "role-mc") {
      const { choices, correctIndex } = buildChoicesFromStrings(rng, ROLE_CORRECT, ROLE_STATEMENTS, 3);
      return {
        kind: "multiple-choice",
        prompt: "What role has the African diaspora played in Africa's political and economic development?",
        choices,
        correctIndex,
        hint: "Think about money, skills, and international support flowing from the diaspora back to Africa.",
        explanation: `The African diaspora has contributed to Africa's development mainly by ${ROLE_CORRECT.toLowerCase()}.`,
      };
    }

    if (branch === "factor-role-classify") {
      const factors = shuffle(rng, FACTOR_OR_ROLE.filter((f) => f.type === "factor")).slice(0, 3);
      const roles = shuffle(rng, FACTOR_OR_ROLE.filter((f) => f.type === "role")).slice(0, 3);
      const chosen = shuffle(rng, [...factors, ...roles]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.type));
      return {
        kind: "categorize",
        prompt: "Sort each statement into a factor behind the presence of African diasporas, or a role diasporas play in Africa today.",
        items,
        buckets: [
          { id: "factor", label: TYPE_LABEL.factor },
          { id: "role", label: TYPE_LABEL.role },
        ],
        correctBucket,
        hint: "A factor explains how diasporas came to exist; a role describes what diasporas do for Africa now.",
        explanation: chosen.map((f) => `"${f.text}" — ${TYPE_LABEL[f.type]}.`).join(" "),
      };
    }

    // country-fill
    const t = randChoice(rng, FILL_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: "Complete the fact about African diasporas by 1960.",
      before: t.before,
      after: t.after,
      correctAnswer: t.answer,
      acceptedAnswers: [...t.accepted],
      inputMode: "text",
      hint: "This country was one of the three named as home to a major African diaspora community by 1960.",
      explanation: `${t.before} ${t.answer} ${t.after}`.trim().replace(/\s+/g, " "),
    };
  },
};
