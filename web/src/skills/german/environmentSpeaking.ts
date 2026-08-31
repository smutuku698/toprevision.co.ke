import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "Die Sonne scheint.", meaning: "The sun is shining." },
  { phrase: "Es regnet.", meaning: "It is raining." },
  { phrase: "Es ist kalt.", meaning: "It is cold." },
  { phrase: "Ich gehe schwimmen.", meaning: "I am going swimming." },
  { phrase: "Ich pflanze Blumen.", meaning: "I am planting flowers." },
];

const SORT_ITEMS: { label: string; bucket: "weather" | "activity" }[] = [
  { label: "Die Sonne scheint.", bucket: "weather" },
  { label: "Es regnet.", bucket: "weather" },
  { label: "Es ist kalt.", bucket: "weather" },
  { label: "Ich gehe schwimmen.", bucket: "activity" },
  { label: "Ich pflanze Blumen.", bucket: "activity" },
];

export const environmentSpeaking: Skill = {
  id: "de-ls-environment",
  code: "LS.8",
  subjectId: "german",
  strandId: "de-listening-speaking",
  grade: 9,
  title: "Weather and environment: my environment",
  description: "Match German weather expressions to their meaning, and sort weather descriptions from activities.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const weather = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "weather"));
      const activity = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "activity"));
      const items = shuffle(rng, [...weather, ...activity]);
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.label] = it.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each phrase as Weather (Wetter) or an Activity (Aktivität).",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "weather", label: "Weather" },
          { id: "activity", label: "Activity" },
        ],
        correctBucket,
        hint: "Weather phrases describe the sky or temperature; activities describe what someone does.",
        explanation: `Weather: ${weather.map((f) => f.label).join(" / ")}. Activity: ${activity.map((f) => f.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: "Match each German weather expression to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'scheint' (shines) and 'regnet' (rains) describe the sky; the rest describe what people do.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
