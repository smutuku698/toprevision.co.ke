import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "左 (zuǒ)", meaning: "Left" },
  { phrase: "右 (yòu)", meaning: "Right" },
  { phrase: "一直走 (yìzhí zǒu)", meaning: "Go straight" },
  { phrase: "拐 (guǎi)", meaning: "Turn" },
  { phrase: "远 (yuǎn)", meaning: "Far" },
  { phrase: "近 (jìn)", meaning: "Near" },
  { phrase: "在哪儿？(zài nǎr?)", meaning: "Where is it?" },
  { phrase: "怎么走？(zěnme zǒu?)", meaning: "How do I get there?" },
];

const SORT_ITEMS: { label: string; bucket: "cardinal" | "local" }[] = [
  { label: "北方 (běifāng)", bucket: "cardinal" },
  { label: "南方 (nánfāng)", bucket: "cardinal" },
  { label: "东方 (dōngfāng)", bucket: "cardinal" },
  { label: "西方 (xīfāng)", bucket: "cardinal" },
  { label: "左 (zuǒ)", bucket: "local" },
  { label: "右 (yòu)", bucket: "local" },
  { label: "前 (qián)", bucket: "local" },
  { label: "后 (hòu)", bucket: "local" },
];

export const directionsSpeaking: Skill = {
  id: "ma-ls-directions",
  code: "LS.9",
  subjectId: "mandarin",
  strandId: "ma-listening-speaking",
  grade: 9,
  title: "Directions and location",
  description: "Match Mandarin direction words to their meaning, and sort cardinal points from local directions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const cardinal = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "cardinal")).slice(0, 3);
      const local = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "local")).slice(0, 3);
      const items = shuffle(rng, [...cardinal, ...local]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Cardinal Point or a Local Direction.",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "cardinal", label: "Cardinal Point" },
          { id: "local", label: "Local Direction" },
        ],
        correctBucket,
        hint: "Cardinal points (north/south/east/west) are fixed; local directions (left/right/front/back) depend on where you're facing.",
        explanation: `Cardinal points: ${cardinal.map((f) => f.label).join(" / ")}. Local directions: ${local.map((f) => f.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: "Match each Mandarin word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "远 (yuǎn, 'far') and 近 (jìn, 'near') are opposites — easy to mix up when reading quickly.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
