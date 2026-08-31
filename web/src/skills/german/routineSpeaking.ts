import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { categorizePrompts, matchMeaningPrompts } from "./germanPromptPools";

const CATEGORIZE_PROMPTS = categorizePrompts("activity", "a Weekday (Schultag) or Weekend (Wochenende) routine");
const MATCH_PROMPTS = matchMeaningPrompts("routine expression");

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "Ich stehe um 7 Uhr auf.", meaning: "I get up at 7 o'clock." },
  { phrase: "Ich esse um 7.30 mein Frühstück.", meaning: "I eat my breakfast at 7:30." },
  { phrase: "Ich lerne um 9.20 Uhr Mathe.", meaning: "I study Math at 9:20." },
  { phrase: "Ich spiele am Nachmittag Fußball.", meaning: "I play football in the afternoon." },
  { phrase: "Ich will am Sonntag in die Kirche gehen.", meaning: "I want to go to church on Sunday." },
  { phrase: "Ich schlafe am Samstag lange.", meaning: "I sleep in late on Saturday." },
];

const SORT_ITEMS: { label: string; bucket: "weekday" | "weekend" }[] = [
  { label: "Ich stehe um 7 Uhr auf.", bucket: "weekday" },
  { label: "Ich lerne um 9.20 Uhr Mathe.", bucket: "weekday" },
  { label: "Ich esse um 7.30 mein Frühstück.", bucket: "weekday" },
  { label: "Ich spiele am Samstag Fußball.", bucket: "weekend" },
  { label: "Ich gehe am Sonntag in die Kirche.", bucket: "weekend" },
  { label: "Ich schlafe am Samstag lange.", bucket: "weekend" },
];

export const routineSpeaking: Skill = {
  id: "de-ls-routine",
  code: "LS.4",
  subjectId: "german",
  strandId: "de-listening-speaking",
  grade: 9,
  title: "Time: my daily routine",
  description: "Match German daily-routine expressions to their meaning, and sort weekday from weekend activities.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const weekday = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "weekday")).slice(0, 3);
      const weekend = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "weekend")).slice(0, 3);
      const items = shuffle(rng, [...weekday, ...weekend]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "weekday", label: "Weekday" },
          { id: "weekend", label: "Weekend" },
        ],
        correctBucket,
        hint: "School routines happen on weekdays; leisure and church happen on the weekend.",
        explanation: `Weekday: ${weekday.map((f) => f.label).join(" / ")}. Weekend: ${weekend.map((f) => f.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
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
      hint: "Look at the time word (um, am) and the verb to figure out the activity.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
