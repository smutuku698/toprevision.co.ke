import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, cap } from "./readingShared";

// Theme 8 (The Farm - Animal Safety and Care) "Fluency" sub-strand. This engine cannot literally time
// or listen to a learner's read-aloud, so this skill tests knowledge OF fluent reading (why speed,
// accuracy and expression matter, and how punctuation shapes expression) rather than the oral skill
// itself — the same honest-ceiling approach the project takes for other unassessable oral skills.

type PunctExpression = { sentence: string; mark: string; effect: string; wrong: string[] };
const PUNCT_EXPRESSION: PunctExpression[] = [
  { sentence: "The injured goat is safe!", mark: "exclamation mark", effect: "shows relief or strong emotion when reading aloud", wrong: ["a pause with rising pitch", "a long silent pause", "a flat, unchanging tone"] },
  { sentence: "Is the vet coming today?", mark: "question mark", effect: "signals a rising tone at the end when reading aloud", wrong: ["a falling, final tone", "a shout", "no change in tone at all"] },
  { sentence: "The cage was cleaned, the animals were fed, and the gate was locked.", mark: "commas", effect: "signal brief pauses between listed items when reading aloud", wrong: ["signal the reader should stop completely", "signal a question is being asked", "have no effect on how it is read"] },
  { sentence: "Be careful — the fence is broken.", mark: "dash", effect: "signals a brief dramatic pause before important extra information", wrong: ["signals the sentence has ended", "signals a question", "has no effect on reading"] },
];

// Reading-speed and accuracy scenarios — the theme's "read at a reasonable speed, accurately, with
// expression" outcome, given as Kenyan-context reasoning questions since we can't measure actual speed.
const FLUENCY_SCENARIOS: { scenario: (n: string) => string; correct: string; wrong: string[] }[] = [
  {
    scenario: (n) => `${n} reads a story about animal safety so fast that classmates can't follow the words clearly. What advice would best help ${n} become a more fluent reader?`,
    correct: "Slow down slightly and pronounce each word clearly, without losing natural rhythm.",
    wrong: ["Read even faster to finish quickly.", "Skip difficult words entirely.", "Read in a whisper so mistakes aren't noticed."],
  },
  {
    scenario: (n) => `${n} reads a text about animal care in a flat, monotone voice with no change in expression. What is ${n} missing for fluent reading?`,
    correct: "Expression — varying tone and emphasis to match the meaning of the text.",
    wrong: ["Speed — reading as fast as possible.", "Volume — reading as loudly as possible.", "Length — reading longer passages only."],
  },
  {
    scenario: (n) => `${n} stumbles over several words while reading a passage about animal welfare aloud. What would most help improve reading accuracy?`,
    correct: "Practising the passage beforehand and reading unfamiliar words slowly and carefully.",
    wrong: ["Avoiding difficult passages altogether.", "Reading only very short sentences forever.", "Memorising a different passage instead."],
  },
  {
    scenario: (n) => `${n} chooses a very difficult veterinary textbook to build reading fluency, but constantly gets stuck on hard words. What would be a better choice?`,
    correct: "A text at an appropriate reading level, so fluency can be practised without constant interruption.",
    wrong: ["An even harder text to challenge the reader.", "A text in a completely different language.", "No text at all, only silent thinking."],
  },
];

export const readingFluency: Skill = {
  id: "g6-eng-reading-fluency",
  code: "R.5",
  subjectId: "english",
  strandId: "g6-eng-reading",
  grade: 6,
  title: "Reading Fluency",
  description: "Understand what reading at a reasonable speed, with accuracy and expression means, how punctuation shapes expression, and how to select suitable materials for fluency practice.",
  generate(rng) {
    const branch = randChoice(rng, ["punctuation-mc", "fluency-scenario-mc", "punctuation-categorize", "importance-mc"] as const);

    if (branch === "punctuation-mc") {
      const item = randChoice(rng, PUNCT_EXPRESSION);
      const choices = shuffle(rng, [item.effect, ...item.wrong]);
      return {
        kind: "multiple-choice",
        prompt: `When reading this sentence aloud, what should the ${item.mark} signal?\n"${item.sentence}"`,
        choices,
        correctIndex: choices.indexOf(item.effect),
        layout: "list",
        hint: "Punctuation marks guide how a fluent reader changes their voice.",
        explanation: `The ${item.mark} ${item.effect}.`,
      };
    }

    if (branch === "fluency-scenario-mc") {
      const scenario = randChoice(rng, FLUENCY_SCENARIOS);
      const name = randChoice(rng, KENYAN_NAMES);
      const choices = shuffle(rng, [scenario.correct, ...scenario.wrong]);
      return {
        kind: "multiple-choice",
        prompt: scenario.scenario(name),
        choices,
        correctIndex: choices.indexOf(scenario.correct),
        layout: "list",
        hint: "Fluent reading balances speed, accuracy and expression — think about which is missing.",
        explanation: scenario.correct,
      };
    }

    if (branch === "punctuation-categorize") {
      const items = [
        { id: "period", label: "Full stop (.)", bucket: "pause" },
        { id: "comma", label: "Comma (,)", bucket: "pause" },
        { id: "question", label: "Question mark (?)", bucket: "tone" },
        { id: "exclamation", label: "Exclamation mark (!)", bucket: "tone" },
        { id: "colon", label: "Colon (:)", bucket: "pause" },
        { id: "dash", label: "Dash (—)", bucket: "pause" },
      ];
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these punctuation marks: does it mainly signal a PAUSE, or a change in TONE/PITCH?",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "pause", label: "Signals a Pause" },
          { id: "tone", label: "Signals a Tone Change" },
        ],
        correctBucket,
        hint: "Some marks tell you to stop briefly; others tell you to raise or lower your voice.",
        explanation: "Full stops, commas, colons and dashes signal pauses of different lengths. Question marks and exclamation marks signal a change in tone or pitch.",
      };
    }

    const correctOption = "It helps a reader understand and enjoy a text, and communicate it clearly to others";
    const choices = shuffle(rng, [
      correctOption,
      "It only matters for reading competitions, not everyday life",
      "It replaces the need to understand what a text means",
      "It is only useful for reading animal-safety texts specifically",
    ]);
    return {
      kind: "multiple-choice",
      prompt: "Why is reading fluency (speed, accuracy and expression together) important for lifelong learning?",
      choices,
      correctIndex: choices.indexOf(correctOption),
      layout: "list",
      hint: "Think about how fluent reading connects to comprehension and communication in general.",
      explanation: "Reading fluency supports comprehension and clear communication — a fluent reader can focus on meaning instead of struggling with individual words, which matters far beyond any one topic.",
    };
  },
};
