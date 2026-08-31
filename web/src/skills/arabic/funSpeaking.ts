import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "hal anta mutafarrigh?", meaning: "Are you free?" },
  { phrase: "hal anta mutafarrigh al-usbu' al-qadim?", meaning: "Are you available next week?" },
  { phrase: "ana aasif, laa astatee'", meaning: "I'm sorry, I can't" },
  { phrase: "hal yumkinuka an tahjiza lee ghadan?", meaning: "Can you book me for tomorrow?" },
  { phrase: "maw'id", meaning: "appointment" },
  { phrase: "ghadan", meaning: "tomorrow" },
];

const MATCH_PROMPTS = [
  "Match each Arabic expression about plans and appointments to its English meaning.",
  "Pair each Arabic plans-and-appointments expression with what it means in English.",
  "Connect each expression about plans below to its correct English meaning.",
  "Match each Arabic phrase for making plans to its English translation.",
  "Which English meaning goes with each Arabic plans-and-appointments phrase? Match them up.",
  "Link each Arabic expression about appointments to what it means in English.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each expression as Asking about availability or Responding about availability.",
  "Decide whether each expression is Asking about availability or Responding about availability, then sort it.",
  "Group these expressions under Asking or Responding about availability.",
  "Is each phrase below Asking about availability or Responding about availability? Sort it into the right group.",
  "Place each expression into the Asking or Responding category.",
  "Sort these expressions into Asking about availability and Responding about availability.",
];

const SORT_ITEMS: { label: string; bucket: "asking" | "responding" }[] = [
  { label: "hal anta mutafarrigh? (Are you free?)", bucket: "asking" },
  { label: "hal anta mutafarrigh al-usbu' al-qadim? (Are you available next week?)", bucket: "asking" },
  { label: "hal yumkinuka an tahjiza lee ghadan? (Can you book me for tomorrow?)", bucket: "asking" },
  { label: "ana aasif, laa astatee' (I'm sorry, I can't)", bucket: "responding" },
  { label: "na'am, ana mutafarrigh (Yes, I am free)", bucket: "responding" },
  { label: "bikulli suroor (with pleasure)", bucket: "responding" },
];

export const funSpeaking: Skill = {
  id: "ar-ls-fun",
  code: "LS.5",
  subjectId: "arabic",
  strandId: "ar-listening-speaking",
  grade: 9,
  title: "Making plans and appointments",
  description: "Match Arabic expressions for making plans to their meaning, and sort asking from responding phrases.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const asking = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "asking"));
      const responding = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "responding"));
      const items = shuffle(rng, [...asking, ...responding]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "asking", label: "Asking" },
          { id: "responding", label: "Responding" },
        ],
        correctBucket,
        hint: "Questions ask something ('hal...?'); responses answer with yes, no, or an apology.",
        explanation: [...asking, ...responding].map((f) => `"${f.label}" is ${f.bucket === "asking" ? "asking about" : "a response about"} availability.`).join(" "),
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
      hint: "'hal' at the start of a phrase signals a yes/no question.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
