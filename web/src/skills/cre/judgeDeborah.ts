import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_PROMPTS = [
  "Fill in the missing name.",
  "Complete the sentence with the correct name.",
  "Supply the missing name below.",
  "Which name completes this sentence?",
  "Fill in the blank with the right name.",
  "Read the sentence and fill in the name that completes it.",
];

const MATCH_PROMPTS = [
  "Match each name or term to what it refers to in the story of Judge Deborah.",
  "Pair each name from the story of Judge Deborah with what it refers to.",
  "Connect each term to who or what it identifies in this story.",
  "Match each name below to its correct description.",
  "Link each name or term to what it means in the story of Deborah.",
  "Match each figure or place to what it refers to in this account.",
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Deborah", meaning: "A prophetess and judge who led Israel with wisdom during a time of oppression" },
  { term: "Barak", meaning: "The military commander Deborah summoned to lead Israel's army into battle" },
  { term: "Sisera", meaning: "The commander of the enemy Canaanite army that oppressed Israel" },
  { term: "Jael", meaning: "The woman who killed Sisera in her tent, fulfilling Deborah's prophecy" },
  { term: "Mount Tabor", meaning: "The mountain where Barak gathered Israel's army before the battle" },
  { term: "Song of Deborah", meaning: "The victory song Deborah and Barak sang after Israel's triumph" },
];

export const judgeDeborah: Skill = {
  id: "cre-bi-judge-deborah",
  code: "BI.2",
  subjectId: "cre",
  strandId: "cre-bible",
  grade: 9,
  title: "Judge Deborah",
  description: "Match each name or term from the story of Judge Deborah to what it refers to.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "match", "fill"] as const);

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "",
        after: "was the prophetess and judge who led Israel to victory over Sisera's army.",
        correctAnswer: "Deborah",
        inputMode: "text",
        hint: "She is the central figure this sub-strand is named after.",
        explanation: "Deborah was the prophetess and judge who led Israel to victory over Sisera's army.",
      };
    }

    const chosen = shuffle(rng, TERMS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
    const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
    const correctMap: Record<string, string> = {};
    for (const t of chosen) correctMap[t.term] = t.term;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "Deborah portrayed wisdom as a judge and prophetess who led Israel to victory over its oppressors.",
      explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
    };
  },
};
