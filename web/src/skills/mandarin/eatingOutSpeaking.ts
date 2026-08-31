import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "菜单 (càidān)", meaning: "Menu" },
  { phrase: "点菜 (diǎncài)", meaning: "Order food" },
  { phrase: "买单 (mǎidān)", meaning: "Pay the bill" },
  { phrase: "筷子 (kuàizi)", meaning: "Chopsticks" },
  { phrase: "碗 (wǎn)", meaning: "Bowl" },
  { phrase: "服务员 (fúwùyuán)", meaning: "Waiter/waitress" },
  { phrase: "多少钱？(duōshao qián?)", meaning: "How much money?" },
  { phrase: "我想要...... (wǒ xiǎng yào...)", meaning: "I would like..." },
];

const SORT_ITEMS: { label: string; bucket: "tableware" | "phrase" }[] = [
  { label: "筷子 (kuàizi)", bucket: "tableware" },
  { label: "碗 (wǎn)", bucket: "tableware" },
  { label: "盘子 (pánzi)", bucket: "tableware" },
  { label: "杯子 (bēizi)", bucket: "tableware" },
  { label: "点菜 (diǎncài)", bucket: "phrase" },
  { label: "买单 (mǎidān)", bucket: "phrase" },
  { label: "多少钱？(duōshao qián?)", bucket: "phrase" },
  { label: "我想要...... (wǒ xiǎng yào...)", bucket: "phrase" },
];

export const eatingOutSpeaking: Skill = {
  id: "ma-ls-eating-out",
  code: "LS.6",
  subjectId: "mandarin",
  strandId: "ma-listening-speaking",
  grade: 9,
  title: "Ordering food at a restaurant",
  description: "Match Mandarin restaurant words to their meaning, and sort tableware from ordering phrases.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const tableware = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "tableware")).slice(0, 3);
      const phrases = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "phrase")).slice(0, 3);
      const items = shuffle(rng, [...tableware, ...phrases]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each word as Tableware or a Restaurant Phrase.",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "tableware", label: "Tableware" },
          { id: "phrase", label: "Restaurant Phrase" },
        ],
        correctBucket,
        hint: "Tableware are physical objects on the table; phrases are things you say.",
        explanation: `Tableware: ${tableware.map((f) => f.label).join(" / ")}. Phrases: ${phrases.map((f) => f.label).join(" / ")}.`,
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
      hint: "点菜 (diǎncài) is 'to order food'; 买单 (mǎidān) is 'to pay the bill' — very different steps of a meal.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
