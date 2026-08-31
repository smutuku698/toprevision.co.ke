import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FREQUENCY_ORDER: { id: string; label: string; percent: number }[] = [
  { id: "always", label: "always", percent: 100 },
  { id: "usually", label: "usually", percent: 90 },
  { id: "often", label: "often", percent: 70 },
  { id: "sometimes", label: "sometimes", percent: 50 },
  { id: "rarely", label: "rarely", percent: 10 },
  { id: "never", label: "never", percent: 0 },
];

const DEGREE: { adv: string; meaning: string }[] = [
  { adv: "very", meaning: "a high degree — strengthens the adjective or adverb that follows" },
  { adv: "extremely", meaning: "an even higher degree than 'very' — an intense amount" },
  { adv: "quite", meaning: "a fairly high but moderate degree" },
  { adv: "too", meaning: "a degree that is more than what is wanted or needed" },
  { adv: "enough", meaning: "a sufficient degree — placed after the word it modifies" },
  { adv: "almost", meaning: "very close to, but not quite, a complete degree" },
  { adv: "completely", meaning: "a full, total degree — nothing is missing" },
  { adv: "hardly", meaning: "a very low degree — barely at all" },
] as const;

const CATEGORIZE_POOL: { adv: string; type: "frequency" | "degree" }[] = [
  { adv: "always", type: "frequency" },
  { adv: "usually", type: "frequency" },
  { adv: "sometimes", type: "frequency" },
  { adv: "rarely", type: "frequency" },
  { adv: "never", type: "frequency" },
  { adv: "often", type: "frequency" },
  { adv: "very", type: "degree" },
  { adv: "extremely", type: "degree" },
  { adv: "quite", type: "degree" },
  { adv: "almost", type: "degree" },
  { adv: "completely", type: "degree" },
  { adv: "hardly", type: "degree" },
];

const FREQ_FILL: { before: string; adv: string; after: string; clue: string }[] = [
  { before: "The counsellor ", adv: "always", after: " listens carefully to the residents' concerns.", clue: "on every occasion, without exception" },
  { before: "The rehabilitation programme is ", adv: "usually", after: " successful for those who complete it.", clue: "most of the time, though not every single time" },
  { before: "He ", adv: "often", after: " attends the support group meetings on Fridays.", clue: "frequently, many times" },
  { before: "She is ", adv: "rarely", after: " late for her therapy sessions.", clue: "very infrequently, almost never" },
  { before: "They ", adv: "never", after: " miss a chance to encourage a fellow resident.", clue: "not on a single occasion" },
];

const PLACEMENT_ERRORS: { correct: string; wrong: string[]; note: string }[] = [
  {
    correct: "He is usually calm during difficult conversations.",
    wrong: ["He usually is calm during difficult conversations.", "He is calm usually during difficult conversations.", "Usually is he calm during difficult conversations."],
    note: "With the verb 'be', the adverb of frequency goes after 'be' and before the rest of the sentence: 'is usually calm', not 'usually is' or 'calm usually'.",
  },
  {
    correct: "The residents rarely complain about the new schedule.",
    wrong: ["The residents complain rarely about the new schedule.", "Rarely the residents complain about the new schedule.", "The rarely residents complain about the new schedule."],
    note: "With a main verb (not 'be'), the adverb of frequency goes before the main verb: 'rarely complain', not after the verb or between the subject and its noun.",
  },
  {
    correct: "The staff never ignore a resident in distress.",
    wrong: ["The staff ignore never a resident in distress.", "Never the staff ignore a resident in distress.", "The staff ignore a never resident in distress."],
    note: "'Never' goes before the main verb it modifies ('never ignore'), not after the verb or inserted between an article and a noun.",
  },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why should one use adverbs of frequency and degree correctly?",
    correct: "They show precisely how often something happens or to what extent a quality is true, avoiding confusion",
    distractors: [
      "They are optional and change nothing about a sentence's meaning",
      "They only matter in written English, never in speech",
      "They replace the need for a main verb in a sentence",
    ],
  },
  {
    q: "Where does an adverb of frequency like 'always' or 'never' usually go with a main verb (not 'be')?",
    correct: "Before the main verb",
    distractors: ["After the main verb", "At the very end of the sentence only", "Before the subject of the sentence"],
  },
  {
    q: "Where does an adverb of frequency usually go when the sentence uses the verb 'be'?",
    correct: "After the verb 'be'",
    distractors: ["Before the verb 'be'", "At the start of the sentence only", "They cannot be used with 'be'"],
  },
];

export const adverbsFrequencyDegree: Skill = {
  id: "g8-eng-g-adverbs-frequency-degree",
  code: "G.6",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Word Classes: Adverbs of Frequency and Degree",
  description: "Identify and correctly use adverbs of frequency and degree in sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "match", "fill", "categorize", "concept"] as const);

    if (branch === "order") {
      const items = shuffle(rng, FREQUENCY_ORDER);
      return {
        kind: "ordering",
        prompt: "Arrange these adverbs of frequency from most often (always) to least often (never).",
        instruction: "Click them in order.",
        items,
        correctOrder: FREQUENCY_ORDER.map((f) => f.id),
        hint: "Think about how large a percentage of the time each word describes.",
        explanation: FREQUENCY_ORDER.map((f) => `${f.id} (about ${f.percent}% of the time)`).join(" → "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, DEGREE).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((d) => ({ id: d.adv, label: d.adv })));
      const targets = shuffle(rng, chosen.map((d) => ({ id: d.adv, label: d.meaning })));
      const correctMap: Record<string, string> = {};
      for (const d of chosen) correctMap[d.adv] = d.adv;
      return {
        kind: "click-match",
        prompt: "Match each adverb of degree to what it shows about the word it modifies.",
        tokens,
        targets,
        correctMap,
        hint: "Adverbs of degree show how strong, how much, or how close to complete a quality is.",
        explanation: chosen.map((d) => `"${d.adv}" shows ${d.meaning}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FREQ_FILL);
      return {
        kind: "fill-blank",
        prompt: `Fill in the adverb of frequency meaning "${entry.clue}" to complete the sentence.`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.adv,
        inputMode: "text",
        hint: "Place the adverb before the main verb, or after the verb 'be' if the sentence uses it.",
        explanation: `"${entry.adv}" means "${entry.clue}": "${entry.before}${entry.adv}${entry.after}"`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORIZE_POOL).slice(0, 6);
      const buckets = [
        { id: "frequency", label: "Adverb of frequency (how often)" },
        { id: "degree", label: "Adverb of degree (how much/how strongly)" },
      ];
      const items = chosen.map((c, i) => ({ id: `a${i}`, label: c.adv }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`a${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each adverb by whether it shows frequency (how often) or degree (how much).",
        items,
        buckets,
        correctBucket,
        hint: "Frequency adverbs answer 'how often?'. Degree adverbs answer 'to what extent?' or 'how much?'.",
        explanation: chosen.map((c) => `"${c.adv}" is an adverb of ${c.type}.`).join(" "),
      };
    }

    if (rng() < 0.5) {
      const entry = randChoice(rng, PLACEMENT_ERRORS);
      const choices = shuffle(rng, [entry.correct, ...entry.wrong]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence places the adverb of frequency correctly?",
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Adverbs of frequency go before the main verb, but after the verb 'be'.",
        explanation: entry.note,
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Think about where these adverbs sit relative to the main verb or the verb 'be'.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
