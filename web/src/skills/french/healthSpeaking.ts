import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const EXPRESSIONS: { term: string; meaning: string }[] = [
  { term: "J'ai mal à la tête", meaning: "I have a headache" },
  { term: "J'ai mal au ventre", meaning: "I have a stomachache" },
  { term: "J'ai de la fièvre", meaning: "I have a fever" },
  { term: "Je suis malade", meaning: "I am sick" },
  { term: "Je vais bien", meaning: "I am well" },
  { term: "la gorge", meaning: "the throat" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each word as a Body part (partie du corps) or a Health expression (expression de santé).",
  "Decide whether each word is a body part or a health expression, then sort it.",
  "Group these words into Body part and Health expression.",
  "Which of these are body parts and which are health expressions? Sort them.",
  "Place each word under Body part or Health expression.",
  "Sort each word by whether it names a body part or expresses how someone feels.",
];

const MATCH_PROMPTS = [
  "Match each French health expression to its English meaning.",
  "Pair each French health phrase with its correct English meaning.",
  "Connect each health expression to what it means in English.",
  "Match each phrase below to its English translation.",
  "Link each French health expression to the meaning that fits it.",
  "Match each expression to its English equivalent.",
];

const SORT_ITEMS: { label: string; bucket: "body" | "health" }[] = [
  { label: "la tête", bucket: "body" },
  { label: "le ventre", bucket: "body" },
  { label: "la gorge", bucket: "body" },
  { label: "les dents", bucket: "body" },
  { label: "Je suis malade", bucket: "health" },
  { label: "J'ai de la fièvre", bucket: "health" },
  { label: "Je vais bien", bucket: "health" },
  { label: "J'ai mal à la tête", bucket: "health" },
];

export const healthSpeaking: Skill = {
  id: "fr-ls-health",
  code: "LS.7",
  subjectId: "french",
  strandId: "fr-listening-speaking",
  grade: 9,
  title: "Talking about your state of health",
  description: "Match health expressions to their meaning, and sort words as body parts or health expressions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const body = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "body")).slice(0, 3);
      const health = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "health")).slice(0, 3);
      const items = shuffle(rng, [...body, ...health]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "body", label: "Body part" },
          { id: "health", label: "Health expression" },
        ],
        correctBucket,
        hint: "Body parts are single nouns; health expressions are full statements about how someone feels.",
        explanation: `Body parts: ${body.map((m) => m.label).join(" / ")}. Health expressions: ${health.map((m) => m.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, EXPRESSIONS).slice(0, 4);
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
      hint: "'Avoir mal à + partie du corps' means 'to have a pain in...'.",
      explanation: chosen.map((t) => `"${t.term}" means "${t.meaning}".`).join(" "),
    };
  },
};
