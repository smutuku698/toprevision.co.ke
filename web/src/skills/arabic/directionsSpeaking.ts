import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WORDS: { phrase: string; meaning: string }[] = [
  { phrase: "yameen", meaning: "right" },
  { phrase: "yasaar", meaning: "left" },
  { phrase: "amaam", meaning: "ahead / in front" },
  { phrase: "qif", meaning: "stop" },
  { phrase: "idhhab mustaqeem", meaning: "go straight" },
  { phrase: "in'atif", meaning: "turn" },
];

const MATCH_PROMPTS = [
  "Match each Arabic direction word to its English meaning.",
  "Pair each Arabic direction word with what it means in English.",
  "Connect each direction word below to its correct English meaning.",
  "Match each Arabic word for a direction to its English translation.",
  "Which English meaning goes with each Arabic direction word? Match them up.",
  "Link each Arabic direction word to what it means in English.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each word as a Direction word or an Action command.",
  "Decide whether each word is a Direction word or an Action command, then sort it.",
  "Group these words under Direction word or Action command.",
  "Is each word below a Direction word or an Action command? Sort it into the right group.",
  "Place each word into the Direction word or Action command category.",
  "Sort these Arabic words into Direction words and Action commands.",
];

const SORT_ITEMS: { label: string; bucket: "direction" | "command" }[] = [
  { label: "yameen (right)", bucket: "direction" },
  { label: "yasaar (left)", bucket: "direction" },
  { label: "amaam (ahead/in front)", bucket: "direction" },
  { label: "qif (stop)", bucket: "command" },
  { label: "idhhab mustaqeem (go straight)", bucket: "command" },
  { label: "in'atif (turn)", bucket: "command" },
];

export const directionsSpeaking: Skill = {
  id: "ar-ls-directions",
  code: "LS.9",
  subjectId: "arabic",
  strandId: "ar-listening-speaking",
  grade: 9,
  title: "Giving and asking for directions",
  description: "Match Arabic direction words to their meaning, and sort direction words from action commands.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const direction = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "direction"));
      const command = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "command"));
      const items = shuffle(rng, [...direction, ...command]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "direction", label: "Direction word" },
          { id: "command", label: "Action command" },
        ],
        correctBucket,
        hint: "Direction words name a position (right, left, ahead); commands tell someone what to do.",
        explanation: [...direction, ...command].map((f) => `"${f.label}" is ${f.bucket === "direction" ? "a direction word" : "an action command"}.`).join(" "),
      };
    }

    const chosen = shuffle(rng, WORDS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "Picture yourself walking and being told which way to go.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
