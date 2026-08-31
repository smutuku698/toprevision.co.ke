import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "早上 (zǎoshang)", meaning: "Morning" },
  { phrase: "下午 (xiàwǔ)", meaning: "Afternoon" },
  { phrase: "晚上 (wǎnshang)", meaning: "Evening" },
  { phrase: "起床 (qǐchuáng)", meaning: "Get up" },
  { phrase: "睡觉 (shuìjiào)", meaning: "Sleep" },
  { phrase: "做饭 (zuòfàn)", meaning: "Cook" },
  { phrase: "做作业 (zuò zuòyè)", meaning: "Do homework" },
  { phrase: "洗澡 (xǐzǎo)", meaning: "Bathe" },
];

const SORT_ITEMS: { label: string; bucket: "time" | "activity" }[] = [
  { label: "早上 (zǎoshang)", bucket: "time" },
  { label: "上午 (shàngwǔ)", bucket: "time" },
  { label: "下午 (xiàwǔ)", bucket: "time" },
  { label: "晚上 (wǎnshang)", bucket: "time" },
  { label: "起床 (qǐchuáng)", bucket: "activity" },
  { label: "睡觉 (shuìjiào)", bucket: "activity" },
  { label: "做饭 (zuòfàn)", bucket: "activity" },
  { label: "做作业 (zuò zuòyè)", bucket: "activity" },
  { label: "洗澡 (xǐzǎo)", bucket: "activity" },
  { label: "打扫 (dǎsǎo)", bucket: "activity" },
];

export const routineSpeaking: Skill = {
  id: "ma-ls-routine",
  code: "LS.4",
  subjectId: "mandarin",
  strandId: "ma-listening-speaking",
  grade: 9,
  title: "Time and daily routine",
  description: "Match Mandarin time-of-day and routine words to their meaning, and sort times from activities.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const times = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "time")).slice(0, 3);
      const activities = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "activity")).slice(0, 3);
      const items = shuffle(rng, [...times, ...activities]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Time of Day or a Daily Activity.",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "time", label: "Time of Day" },
          { id: "activity", label: "Daily Activity" },
        ],
        correctBucket,
        hint: "Times of day tell you when; activities are verbs telling you what you do.",
        explanation: `Times of day: ${times.map((f) => f.label).join(" / ")}. Activities: ${activities.map((f) => f.label).join(" / ")}.`,
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
      hint: "起床 (qǐchuáng) is 'get up' — the opposite of 睡觉 (shuìjiào), 'sleep'.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
