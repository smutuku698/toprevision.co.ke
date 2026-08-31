import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { categorizePrompts, matchCluePrompts } from "./germanPromptPools";

const CATEGORIZE_PROMPTS = categorizePrompts("animal", "Domestic (Haustier) or Wild (Wildtier)");
const MATCH_PROMPTS = matchCluePrompts("animal");

const CLUES: { clue: string; animal: string }[] = [
  { clue: "miaut", animal: "die Katze" },
  { clue: "hat eine lange Nase", animal: "der Elefant" },
  { clue: "legt Eier", animal: "das Huhn" },
  { clue: "gibt Milch", animal: "die Kuh" },
  { clue: "ist braun, stark und hat viele Haare", animal: "der Löwe" },
  { clue: "ist klein und grau", animal: "die Maus" },
];

const SORT_ITEMS: { label: string; bucket: "domestic" | "wild" }[] = [
  { label: "die Katze", bucket: "domestic" },
  { label: "die Kuh", bucket: "domestic" },
  { label: "das Huhn", bucket: "domestic" },
  { label: "der Elefant", bucket: "wild" },
  { label: "der Löwe", bucket: "wild" },
  { label: "das Zebra", bucket: "wild" },
];

export const countrysideSpeaking: Skill = {
  id: "de-ls-countryside",
  code: "LS.3",
  subjectId: "german",
  strandId: "de-listening-speaking",
  grade: 9,
  title: "My surroundings: animals in the countryside",
  description: "Match animal clues to the correct German animal name, and sort domestic from wild animals.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const domestic = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "domestic")).slice(0, 3);
      const wild = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "wild")).slice(0, 3);
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
        hint: "Domestic animals live on the farm or at home; wild animals live in the countryside/forest.",
        explanation: `Domestic: ${domestic.map((f) => f.label).join(" / ")}. Wild: ${wild.map((f) => f.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, CLUES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.clue, label: p.clue })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.clue, label: p.animal })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.clue] = p.clue;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "Think about the sound, body part, or product each animal is known for.",
      explanation: chosen.map((p) => `"${p.clue}" describes ${p.animal}.`).join(" "),
    };
  },
};
