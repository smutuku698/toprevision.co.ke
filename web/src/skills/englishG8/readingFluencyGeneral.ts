import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FLUENCY_ASPECTS: { name: string; meaning: string }[] = [
  { name: "Accuracy", meaning: "Reading every word correctly as printed, without adding, skipping, or misreading words" },
  { name: "Rate", meaning: "Reading at a pace that is neither rushed nor too slow, matching natural speech" },
  { name: "Expression", meaning: "Using your voice's tone, volume, and emotion to match what the text describes" },
  { name: "Phrasing", meaning: "Grouping words into sensible chunks that follow the meaning, not just pausing at random" },
];

interface Snippet {
  id: string;
  text: string;
  site: string;
  tone: string;
}

const SNIPPETS: Snippet[] = [
  {
    id: "mara",
    text: "Every July, wildebeest thunder across the Mara River in their thousands, crocodiles waiting beneath the surface — the Great Migration is one of nature's most dramatic events.",
    site: "Maasai Mara",
    tone: "Excited / dramatic",
  },
  {
    id: "falls",
    text: "Visitors are reminded to stay behind the safety barrier at all times; the mist from Victoria Falls can make the viewing platform extremely slippery.",
    site: "Victoria Falls",
    tone: "Urgent / cautionary",
  },
  {
    id: "table",
    text: "From the summit of Table Mountain, the city of Cape Town spreads quietly below, framed by a calm, endless ocean.",
    site: "Table Mountain",
    tone: "Calm / peaceful",
  },
  {
    id: "pyramids",
    text: "Rising from the desert sand, the Pyramids of Giza have stood for more than four thousand years, drawing travellers from every corner of the globe.",
    site: "Pyramids of Giza",
    tone: "Awe / wonder",
  },
];

const PREP_STEPS = [
  { id: "silent", label: "Read the text silently first to understand its meaning" },
  { id: "emphasis", label: "Identify words or phrases that need emphasis" },
  { id: "tone", label: "Decide which tone fits the content — excited, calm, or urgent" },
  { id: "practice", label: "Practise reading at a steady, clear pace" },
  { id: "read", label: "Read aloud, adjusting expression as needed" },
];

const FILL_ITEMS = [
  { before: "Grouping words into sensible chunks instead of pausing at random is called", after: ".", correctAnswer: "phrasing" },
  { before: "Reading every word correctly as printed, without adding or skipping words, is called", after: ".", correctAnswer: "accuracy" },
  { before: "Using your voice's tone and emotion to match what a text describes is called", after: ".", correctAnswer: "expression" },
];

const KIQ_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What emotions or feelings can we display when reading a text?",
    correct: "Feelings that match the text's content, such as excitement, calm, urgency, or wonder",
    distractors: ["Only anger, no matter what the text describes", "No feelings at all, since reading aloud should be flat", "Only feelings unrelated to what the text says"],
  },
  {
    q: "Why should we read a text at the right speed?",
    correct: "So the listener can follow and understand the meaning without the reading feeling rushed or dragging",
    distractors: ["Because reading fast always sounds more intelligent", "Because speed has no effect on a listener's understanding", "Because slow reading is always better than fast reading"],
  },
];

export const readingFluencyGeneral: Skill = {
  id: "g8-eng-r-reading-fluency-general",
  code: "R.29",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Reading Fluency",
  description: "Match tone and expression to descriptive texts about African tourist attractions, and apply general fluency aspects when reading aloud.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Fluent reading is accurate, at a natural pace, grouped into sensible phrases, and expressive in a way that matches the text's tone.";

    if (branch === "match") {
      const tokens = shuffle(rng, FLUENCY_ASPECTS.map((a) => ({ id: a.name, label: a.name })));
      const targets = shuffle(rng, FLUENCY_ASPECTS.map((a) => ({ id: a.name, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of FLUENCY_ASPECTS) correctMap[a.name] = a.name;
      return {
        kind: "click-match",
        prompt: "Match each fluency aspect to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: FLUENCY_ASPECTS.map((a) => `${a.name} — ${a.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SNIPPETS);
      const tones = Array.from(new Set(chosen.map((s) => s.tone)));
      const buckets = tones.map((t) => ({ id: t, label: t }));
      const items = chosen.map((s) => ({ id: s.id, label: `"${s.text}" (${s.site})` }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s) => (correctBucket[s.id] = s.tone));
      return {
        kind: "categorize",
        prompt: "Sort each description by the tone of voice that would best suit reading it aloud.",
        items,
        buckets,
        correctBucket,
        hint: "Think about what feeling the content of each description is meant to create in a listener.",
        explanation: chosen.map((s) => `"${s.text}" suits a ${s.tone.toLowerCase()} tone.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, PREP_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for preparing to read a descriptive text aloud with fluency in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: PREP_STEPS.map((s) => s.id),
        hint: "First understand the meaning silently, then plan emphasis and tone, then practise the pace, then read aloud.",
        explanation: PREP_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing fluency term.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (rng() < 0.6) {
      const s = randChoice(rng, SNIPPETS);
      const otherTones = Array.from(new Set(SNIPPETS.map((x) => x.tone))).filter((t) => t !== s.tone);
      const choices = shuffle(rng, [s.tone, ...shuffle(rng, otherTones).slice(0, 3)]);
      return {
        kind: "multiple-choice",
        passage: `"${s.text}" — a note about ${s.site}.`,
        prompt: "Which tone of voice would best suit reading this description aloud?",
        choices,
        correctIndex: choices.indexOf(s.tone),
        layout: "list",
        hint,
        explanation: `A ${s.tone.toLowerCase()} tone best matches the feeling of this description about ${s.site}.`,
      };
    }

    const entry = randChoice(rng, KIQ_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
