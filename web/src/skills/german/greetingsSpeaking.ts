import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { categorizePrompts, matchMeaningPrompts } from "./germanPromptPools";

const CATEGORIZE_PROMPTS = categorizePrompts("greeting", "Formal (Sie) or Informal (du)");
const MATCH_PROMPTS = matchMeaningPrompts("greeting expression");

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "Ich heiße Amina.", meaning: "My name is Amina." },
  { phrase: "Wie heißt du?", meaning: "What is your name?" },
  { phrase: "Ich bin vierzehn Jahre alt.", meaning: "I am fourteen years old." },
  { phrase: "Ich komme aus Kenia.", meaning: "I come from Kenya." },
  { phrase: "Ich wohne in Nairobi.", meaning: "I live in Nairobi." },
  { phrase: "Wie geht es dir?", meaning: "How are you? (informal)" },
  { phrase: "Mir geht es gut, danke.", meaning: "I am doing well, thank you." },
  { phrase: "Auf Wiedersehen!", meaning: "Goodbye!" },
];

const SORT_ITEMS: { label: string; bucket: "formal" | "informal" }[] = [
  { label: "Wie geht es Ihnen?", bucket: "formal" },
  { label: "Wie heißen Sie?", bucket: "formal" },
  { label: "Guten Tag, mein Name ist Kamau.", bucket: "formal" },
  { label: "Auf Wiedersehen, bis bald!", bucket: "formal" },
  { label: "Wie geht's?", bucket: "informal" },
  { label: "Wie heißt du?", bucket: "informal" },
  { label: "Hallo, ich heiße Amina!", bucket: "informal" },
  { label: "Tschüss, bis dann!", bucket: "informal" },
];

export const greetingsSpeaking: Skill = {
  id: "de-ls-greetings",
  code: "LS.1",
  subjectId: "german",
  strandId: "de-listening-speaking",
  grade: 9,
  title: "Formal and informal greetings and introductions",
  description: "Match German greeting expressions to their meaning, and sort formal (Sie) from informal (du) greetings.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const formal = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "formal")).slice(0, 3);
      const informal = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "informal")).slice(0, 3);
      const items = shuffle(rng, [...formal, ...informal]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "formal", label: "Formal" },
          { id: "informal", label: "Informal" },
        ],
        correctBucket,
        hint: "Formal German greetings use 'Sie' and full titles; informal ones use 'du' and short, casual expressions.",
        explanation: `Formal: ${formal.map((f) => f.label).join(" / ")}. Informal: ${informal.map((f) => f.label).join(" / ")}.`,
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
      hint: "'Wie heißt du?' and 'Wie geht es dir?' both start with 'Wie' but ask very different things.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
