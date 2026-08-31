import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ANIMALS: { term: string; meaning: string }[] = [
  { term: "le lion", meaning: "a large wild cat, part of Kenya's Big Five" },
  { term: "l'éléphant", meaning: "the largest land animal, known for its long trunk" },
  { term: "la vache", meaning: "a domestic animal kept for milk" },
  { term: "le chien", meaning: "a domestic animal often kept as a pet or guard" },
  { term: "la girafe", meaning: "a wild animal with a very long neck" },
  { term: "la poule", meaning: "a domestic bird kept for eggs" },
  { term: "le zèbre", meaning: "a wild animal that looks like a striped horse" },
  { term: "la chèvre", meaning: "a domestic animal kept for milk and meat" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each animal as Domestic (domestique) or Wild (sauvage).",
  "Decide whether each animal is domestic or wild, then sort it.",
  "Group these animals into Domestic and Wild.",
  "Which of these animals are domestic and which are wild? Sort them.",
  "Place each animal under Domestic or Wild.",
  "Sort each creature by whether it is domestic or wild.",
];

const MATCH_PROMPTS = [
  "Match each French animal word to its description.",
  "Pair each French animal term with the description that fits it.",
  "Connect each animal word to what it describes.",
  "Match each term below to its correct description.",
  "Link each French animal word to the description that fits it.",
  "Match each animal term to the description that describes it.",
];

const SORT_ITEMS: { label: string; bucket: "domestic" | "wild" }[] = [
  { label: "le chien", bucket: "domestic" },
  { label: "le chat", bucket: "domestic" },
  { label: "la vache", bucket: "domestic" },
  { label: "la chèvre", bucket: "domestic" },
  { label: "la poule", bucket: "domestic" },
  { label: "le lion", bucket: "wild" },
  { label: "l'éléphant", bucket: "wild" },
  { label: "la girafe", bucket: "wild" },
  { label: "le zèbre", bucket: "wild" },
  { label: "le buffle", bucket: "wild" },
];

export const countrysideSpeaking: Skill = {
  id: "fr-ls-countryside",
  code: "LS.3",
  subjectId: "french",
  strandId: "fr-listening-speaking",
  grade: 9,
  title: "Animals of the countryside",
  description: "Match animal vocabulary to its description, and sort animals as domestic or wild.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const domestic = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "domestic")).slice(0, 4);
      const wild = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "wild")).slice(0, 4);
      const items = shuffle(rng, [...domestic, ...wild]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "domestic", label: "Domestic" },
          { id: "wild", label: "Wild" },
        ],
        correctBucket,
        hint: "Domestic animals live with or are raised by people; wild animals live freely, often in a reserve or the savannah.",
        explanation: `Domestic: ${domestic.map((m) => m.label).join(" / ")}. Wild: ${wild.map((m) => m.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, ANIMALS).slice(0, 4);
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
      hint: "Think about which animals you'd find on a farm versus in a game reserve.",
      explanation: chosen.map((t) => `"${t.term}" is ${t.meaning}.`).join(" "),
    };
  },
};
