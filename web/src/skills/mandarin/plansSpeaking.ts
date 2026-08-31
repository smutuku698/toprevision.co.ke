import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "公园 (gōngyuán)", meaning: "Park" },
  { phrase: "动物园 (dòngwùyuán)", meaning: "Zoo" },
  { phrase: "商场 (shāngchǎng)", meaning: "Mall" },
  { phrase: "打算 (dǎsuàn)", meaning: "To plan to" },
  { phrase: "游泳 (yóuyǒng)", meaning: "Swim" },
  { phrase: "骑自行车 (qí zìxíngchē)", meaning: "Ride a bicycle" },
  { phrase: "爬山 (páshān)", meaning: "Climb a mountain" },
  { phrase: "看电影 (kàn diànyǐng)", meaning: "Watch a movie" },
];

const SORT_ITEMS: { label: string; bucket: "place" | "activity" }[] = [
  { label: "公园 (gōngyuán)", bucket: "place" },
  { label: "动物园 (dòngwùyuán)", bucket: "place" },
  { label: "商场 (shāngchǎng)", bucket: "place" },
  { label: "游泳 (yóuyǒng)", bucket: "activity" },
  { label: "骑自行车 (qí zìxíngchē)", bucket: "activity" },
  { label: "爬山 (páshān)", bucket: "activity" },
  { label: "看电影 (kàn diànyǐng)", bucket: "activity" },
  { label: "散步 (sànbù)", bucket: "activity" },
];

export const plansSpeaking: Skill = {
  id: "ma-ls-plans",
  code: "LS.5",
  subjectId: "mandarin",
  strandId: "ma-listening-speaking",
  grade: 9,
  title: "Fun activities and making plans",
  description: "Match Mandarin words for fun activities and places to their meaning, and sort places from activities.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const places = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "place"));
      const activities = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "activity")).slice(0, 3);
      const items = shuffle(rng, [...places, ...activities]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Place or an Activity.",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "place", label: "Place" },
          { id: "activity", label: "Activity" },
        ],
        correctBucket,
        hint: "Places are where you go; activities are what you do there.",
        explanation: `Places: ${places.map((f) => f.label).join(" / ")}. Activities: ${activities.map((f) => f.label).join(" / ")}.`,
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
      hint: "打算 (dǎsuàn) means 'to plan to' — it comes before the activity you intend to do.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
