import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "晴天 (qíngtiān)", meaning: "Sunny day" },
  { phrase: "阴天 (yīntiān)", meaning: "Cloudy day" },
  { phrase: "下雨 (xiàyǔ)", meaning: "Rain" },
  { phrase: "下雪 (xiàxuě)", meaning: "Snow" },
  { phrase: "刮风 (guāfēng)", meaning: "Windy" },
  { phrase: "钓鱼 (diàoyú)", meaning: "Fish (verb)" },
  { phrase: "游泳 (yóuyǒng)", meaning: "Swim" },
  { phrase: "爬山 (páshān)", meaning: "Climb a mountain" },
];

const SORT_ITEMS: { label: string; bucket: "weather" | "activity" }[] = [
  { label: "晴天 (qíngtiān)", bucket: "weather" },
  { label: "阴天 (yīntiān)", bucket: "weather" },
  { label: "下雨 (xiàyǔ)", bucket: "weather" },
  { label: "下雪 (xiàxuě)", bucket: "weather" },
  { label: "刮风 (guāfēng)", bucket: "weather" },
  { label: "钓鱼 (diàoyú)", bucket: "activity" },
  { label: "游泳 (yóuyǒng)", bucket: "activity" },
  { label: "爬山 (páshān)", bucket: "activity" },
  { label: "滑雪 (huáxuě)", bucket: "activity" },
];

export const environmentSpeaking: Skill = {
  id: "ma-ls-environment",
  code: "LS.8",
  subjectId: "mandarin",
  strandId: "ma-listening-speaking",
  grade: 9,
  title: "Weather and environment",
  description: "Match Mandarin weather and outdoor-activity words to their meaning, and sort weather from activities.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const weather = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "weather")).slice(0, 3);
      const activities = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "activity")).slice(0, 3);
      const items = shuffle(rng, [...weather, ...activities]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each word as Weather or an Outdoor Activity.",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "weather", label: "Weather" },
          { id: "activity", label: "Outdoor Activity" },
        ],
        correctBucket,
        hint: "Weather describes the sky and air; activities are things you do outside.",
        explanation: `Weather: ${weather.map((f) => f.label).join(" / ")}. Activities: ${activities.map((f) => f.label).join(" / ")}.`,
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
      hint: "下 (xià) means 'to fall' — 下雨 is rain falling, 下雪 is snow falling.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
