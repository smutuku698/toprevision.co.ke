import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MEANING_MC_PROMPTS = (meaningWord: string) => [
  `Which Principle of Dharma means "${meaningWord}"?`,
  `Which of these principles is defined as "${meaningWord}"?`,
  `"${meaningWord}" — which Principle of Dharma is this?`,
  `Identify the Principle of Dharma that means "${meaningWord}".`,
  `Which principle below carries the meaning "${meaningWord}"?`,
  `Choose the Principle of Dharma described as "${meaningWord}".`,
];

const MATCH_PROMPTS = [
  "Match each Principle of Dharma to what it means.",
  "Pair each principle with its correct meaning.",
  "Connect each Principle of Dharma to its meaning.",
  "Link each principle below to what it means.",
  "Match each term to the meaning that fits it.",
  "Choose the correct meaning for each Principle of Dharma.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each Principle of Dharma into the faith tradition it belongs to.",
  "Group each Principle of Dharma under the faith tradition it comes from.",
  "Sort these principles by their faith tradition.",
  "Place each Principle of Dharma into the correct faith tradition.",
  "Decide which faith tradition each principle belongs to, and sort it there.",
  "Categorise each Principle of Dharma by faith tradition.",
];

const FILL_PROMPTS = (meaning: string) => [
  `Fill in the missing Principle of Dharma: it means "${meaning}".`,
  `Which Principle of Dharma means "${meaning}"?`,
  `Name the Principle of Dharma that means "${meaning}".`,
  `Work out the Principle of Dharma described as "${meaning}".`,
  `Identify the missing principle: it means "${meaning}".`,
  `Which principle belongs in the blank? It means "${meaning}".`,
];

const PRINCIPLES = [
  { name: "Punarjanam", tradition: "Sanatan/Vedic", meaning: "Reincarnation — the belief that the soul is reborn into a new body after death" },
  { name: "Aparigraha", tradition: "Jain", meaning: "Non-attachment — limiting one's possessions and desires so the soul is not weighed down" },
  { name: "Bhramacharya", tradition: "Jain", meaning: "Celibacy/self-restraint — controlling one's senses and desires to focus the mind on spiritual growth" },
  { name: "Santokh", tradition: "Sikh", meaning: "Satisfaction — being content with what one has instead of always wanting more" },
  { name: "Sat", tradition: "Sikh", meaning: "Truth — being honest in thought, word, and action" },
] as const;

const HINT = "These five Principles of Dharma come from three faith traditions — Sanatan/Vedic, Jain, and Sikh.";

export const fundamentalPrinciples: Skill = {
  id: "g8-hre-pd-fundamental-principles",
  code: "PD.1",
  subjectId: "hre",
  strandId: "g8-hre-pd",
  grade: 8,
  title: "Fundamental Principles of Dharma",
  description: "Five selected fundamental Principles of Dharma across the Sanatan/Vedic, Jain, and Sikh traditions.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match", "categorize", "fill"] as const);

    if (branch === "mc") {
      const target = randChoice(rng, PRINCIPLES);
      const distractors = shuffle(rng, PRINCIPLES.filter((p) => p.name !== target.name)).map((p) => p.name);
      const choices = shuffle(rng, [target.name, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, MEANING_MC_PROMPTS(target.meaning.split(" — ")[0])),
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "grid",
        hint: HINT,
        explanation: `${target.name} (${target.tradition}) — ${target.meaning.toLowerCase()}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, PRINCIPLES.map((p) => ({ id: p.name, label: p.name })));
      const targets = shuffle(rng, PRINCIPLES.map((p) => ({ id: p.name, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of PRINCIPLES) correctMap[p.name] = p.name;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: HINT,
        explanation: PRINCIPLES.map((p) => `${p.name} — ${p.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = shuffle(rng, PRINCIPLES.map((p) => ({ id: p.name, label: p.name })));
      const buckets = Array.from(new Set(PRINCIPLES.map((p) => p.tradition))).map((t) => ({ id: t, label: t }));
      const correctBucket: Record<string, string> = {};
      for (const p of PRINCIPLES) correctBucket[p.name] = p.tradition;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Two of these principles are Jain, two are Sikh, and one is Sanatan/Vedic.",
        explanation: PRINCIPLES.map((p) => `${p.name} — ${p.tradition}.`).join(" "),
      };
    }

    // fill
    const target = randChoice(rng, PRINCIPLES);
    const meaningWord = target.meaning.split(" — ")[0];
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS(target.meaning)),
      before: "",
      after: `is the ${target.tradition} principle of ${meaningWord.toLowerCase()}.`,
      correctAnswer: target.name,
      inputMode: "text",
      hint: `This principle is practised in the ${target.tradition} tradition.`,
      explanation: `${target.name} (${target.tradition}) — ${target.meaning.toLowerCase()}.`,
    };
  },
};
