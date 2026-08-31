import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FEATURES: { term: string; definition: string }[] = [
  { term: "Headline/Slogan", definition: "a short, bold statement that grabs attention immediately" },
  { term: "Supporting text", definition: "a small amount of extra detail explaining the headline, kept brief" },
  { term: "Call to action", definition: "a clear instruction telling the reader what to do next" },
  { term: "Layout appeal", definition: "an eye-catching arrangement of words and space that is easy to read at a glance" },
];

// Poster components in a sensible top-to-bottom order.
const POSTER_PARTS: { id: string; label: string }[] = [
  { id: "headline", label: "Headline — a short, bold slogan promoting unity, e.g. 'ONE KENYA, MANY VOICES'" },
  { id: "text", label: "Supporting text — a brief line explaining the message, e.g. 'Every community has a place at the table'" },
  { id: "action", label: "Call to action — tells the reader what to do, e.g. 'Join the Unity Walk this Saturday'" },
  { id: "layout", label: "Layout — bold letters and clear spacing so it is readable from a distance" },
];

// Example poster lines sorted by which component they represent.
const EXAMPLES: { text: string; category: string }[] = [
  { text: "UNITED WE STAND, DIVIDED WE FALL", category: "headline" },
  { text: "Peace grows when neighbours from every community share and listen.", category: "text" },
  { text: "Attend the Inter-Ethnic Cohesion Forum this Friday at the community hall.", category: "action" },
  { text: "MANY TRIBES, ONE NATION", category: "headline" },
  { text: "Cohesion begins with small acts of kindness between neighbours.", category: "text" },
  { text: "Sign the unity pledge at your local chief's office today.", category: "action" },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the main purpose of a poster's headline?",
    correct: "To grab attention immediately with a short, bold statement",
    distractors: ["To give a long, detailed explanation of the topic", "To list every supporter's name", "To replace the need for any other text"],
  },
  {
    q: "What is a call to action on a poster?",
    correct: "A clear instruction telling the reader what to do next",
    distractors: ["A summary of the poster's colours", "A quote with no clear instruction", "The name of the poster's designer"],
  },
  {
    q: "Why should the supporting text on a poster be kept brief?",
    correct: "So the poster stays easy to read at a glance",
    distractors: ["Because posters are not allowed to have any text", "Long text always looks better on a poster", "Brief text is required only for headlines, not supporting text"],
  },
  {
    q: "How can posters help foster inter-ethnic cohesion?",
    correct: "They spread a clear, memorable message about unity to a wide audience quickly",
    distractors: ["Posters have no effect on public awareness", "Posters can only be understood by one ethnic group", "Posters work only when they contain no message at all"],
  },
];

export const cohesionPosterWriting: Skill = {
  id: "g8-il-w-cohesion",
  code: "W.9",
  subjectId: "indigenous-language",
  strandId: "g8-il-writing",
  grade: 8,
  title: "Inter-Ethnic Cohesion: Functional Writing - Posters",
  description: "Identify the features of a poster and design one to promote awareness of inter-ethnic cohesion.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order", "categorize", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, FEATURES.map((f) => ({ id: f.term, label: f.term })));
      const targets = shuffle(rng, FEATURES.map((f) => ({ id: f.term, label: f.definition })));
      const correctMap: Record<string, string> = {};
      for (const f of FEATURES) correctMap[f.term] = f.term;
      return {
        kind: "click-match",
        prompt: "Match each feature of a poster to its definition.",
        tokens,
        targets,
        correctMap,
        hint: "A poster needs a bold headline, brief supporting text, a clear instruction, and an eye-catching layout.",
        explanation: FEATURES.map((f) => `${f.term} — ${f.definition}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, POSTER_PARTS);
      return {
        kind: "ordering",
        prompt: "Arrange the parts of a poster promoting inter-ethnic cohesion from top to bottom.",
        instruction: "Click them in order.",
        items,
        correctOrder: POSTER_PARTS.map((p) => p.id),
        hint: "A poster usually leads with a bold headline, adds a short explanation, then a clear call to action — all in a readable layout.",
        explanation: POSTER_PARTS.map((p) => p.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, EXAMPLES);
      const buckets = [
        { id: "headline", label: "Headline/Slogan" },
        { id: "text", label: "Supporting text" },
        { id: "action", label: "Call to action" },
      ];
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each line by which part of a cohesion poster it belongs to.",
        items,
        buckets,
        correctBucket,
        hint: "A headline is short and bold, supporting text explains briefly, and a call to action tells the reader what to do.",
        explanation: chosen.map((c) => {
          const label = c.category === "headline" ? "the bold headline/slogan" : c.category === "text" ? "brief supporting text" : "the call to action";
          return `"${c.text}" — ${label}.`;
        }).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing words.",
        before: "A clear instruction on a poster telling the reader what to do next, such as 'Join the Unity Walk this Saturday', is called a call to",
        after: ".",
        correctAnswer: "action",
        acceptedAnswers: [],
        inputMode: "text",
        hint: "This phrase describes text that tells the reader what step to take.",
        explanation: "A call to action is a clear instruction on a poster telling the reader exactly what to do next.",
      };
    }

    const entry = randChoice(rng, MC_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "A good poster has a bold headline, brief supporting text, a call to action, and an appealing layout.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
