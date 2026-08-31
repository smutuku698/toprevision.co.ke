import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "assalamu alaykum", meaning: "Peace be upon you (formal greeting)" },
  { phrase: "sabahal khayr", meaning: "Good morning" },
  { phrase: "masaa al khayr", meaning: "Good evening" },
  { phrase: "maa ismuka?", meaning: "What is your name?" },
  { phrase: "keyfa haaluka?", meaning: "How are you?" },
  { phrase: "anaa masruurun biliqaika", meaning: "I am pleased to meet you" },
  { phrase: "shukran", meaning: "Thank you" },
];

const MATCH_PROMPTS = [
  "Match each Arabic greeting expression to its English meaning.",
  "Pair each Arabic greeting with what it means in English.",
  "Connect each greeting expression to its correct English meaning.",
  "Match each greeting phrase below to its English translation.",
  "Which English meaning goes with each Arabic greeting? Match them up.",
  "Link each Arabic greeting expression to what it means in English.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each expression as a Greeting or a Polite courtesy word.",
  "Decide whether each expression is a Greeting or a Polite courtesy word, then sort it.",
  "Group these expressions under Greeting or Polite courtesy word.",
  "Is each phrase below a Greeting or a Polite courtesy word? Sort it into the right group.",
  "Place each expression into the Greeting or Polite courtesy word category.",
  "Sort these Arabic expressions into Greetings and Polite courtesy words.",
];

const SORT_ITEMS: { label: string; bucket: "greeting" | "polite" }[] = [
  { label: "assalamu alaykum", bucket: "greeting" },
  { label: "sabahal khayr", bucket: "greeting" },
  { label: "masaa al khayr", bucket: "greeting" },
  { label: "keyfa haaluka?", bucket: "greeting" },
  { label: "shukran", bucket: "polite" },
  { label: "min fadlik (please)", bucket: "polite" },
  { label: "aasif (sorry)", bucket: "polite" },
  { label: "afwan (excuse me)", bucket: "polite" },
];

export const greetingsSpeaking: Skill = {
  id: "ar-ls-greetings",
  code: "LS.1",
  subjectId: "arabic",
  strandId: "ar-listening-speaking",
  grade: 9,
  title: "Formal greetings and introductions",
  description: "Match Arabic greeting expressions to their meaning, and sort greetings from polite courtesy words.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const greetings = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "greeting")).slice(0, 3);
      const polite = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "polite")).slice(0, 3);
      const items = shuffle(rng, [...greetings, ...polite]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "greeting", label: "Greeting" },
          { id: "polite", label: "Polite courtesy word" },
        ],
        correctBucket,
        hint: "Greetings are said on meeting someone; courtesy words like 'thank you' or 'please' are used throughout a conversation.",
        explanation: `Greetings: ${greetings.map((f) => f.label).join(" / ")}. Polite words: ${polite.map((f) => f.label).join(" / ")}.`,
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
      hint: "'sabahal khayr' and 'masaa al khayr' both mean a time-specific greeting — pay attention to morning vs evening.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
