import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_PROMPTS = [
  "Fill in the missing name.",
  "Which Enlightened Being or teaching is being described?",
  "Name the Enlightened Being or teaching described below.",
  "Work out which name completes the statement.",
  "Identify the missing name from the description.",
  "Which name belongs in the blank?",
];

const MATCH_PROMPTS = [
  "Match each Enlightened Being or teaching to its contribution to humanity.",
  "Pair each Enlightened Being or teaching with its contribution.",
  "Connect each figure or teaching to what it contributes to humanity.",
  "Link each Enlightened Being or teaching to the correct contribution.",
  "Match each name below to its contribution to humanity.",
  "Choose the correct contribution for each Enlightened Being or teaching.",
];

const BEINGS: { name: string; contribution: string }[] = [
  { name: "Tridev", contribution: "The three-fold form of Brahma, Vishnu, and Shiva, representing the creation, preservation, and transformation of the universe" },
  { name: "The Tirthankars", contribution: "Jain spiritual teachers whose way of Ahimsa (non-violence) teaches compassion towards all living beings" },
  { name: "Buddha", contribution: "Taught the Four Noble Truths and the Eightfold Path as a gift showing humanity the way to end suffering" },
  { name: "The Guru's Khalsa Panth", contribution: "The Sikh way of life, forming a community initiated to live with discipline, service, and equality for all" },
];

export const enlightenedBeings: Skill = {
  id: "hre-p-enlightened-beings",
  code: "P.1",
  subjectId: "hre",
  strandId: "hre-paramatma",
  grade: 9,
  title: "Enlightened Beings",
  description: "Match each Enlightened Being or teaching to its contribution to humanity.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "match", "fill"] as const);

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "",
        after: "taught the Four Noble Truths and the Eightfold Path as a gift to humanity.",
        correctAnswer: "Buddha",
        inputMode: "text",
        hint: "This teacher's path shows the way to end suffering.",
        explanation: "Buddha taught the Four Noble Truths and the Eightfold Path as a gift showing humanity the way to end suffering.",
      };
    }

    const chosen = shuffle(rng, BEINGS);
    const tokens = shuffle(rng, chosen.map((b) => ({ id: b.name, label: b.name })));
    const targets = shuffle(rng, chosen.map((b) => ({ id: b.name, label: b.contribution })));
    const correctMap: Record<string, string> = {};
    for (const b of chosen) correctMap[b.name] = b.name;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "Each of these figures or teachings comes from a different faith tradition, but all guide people toward harmonious living.",
      explanation: chosen.map((b) => `${b.name} — ${b.contribution.toLowerCase()}.`).join(" "),
    };
  },
};
