import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "The old refrigerator in the corner of the shop hummed and groaned as if complaining about the afternoon heat, its door creaking open reluctantly whenever Mama Nduta reached for cold sodas. She remembered the day, five years earlier, when a customer named Peter had bought spoiled milk from her without checking the date, gotten violently ill, and returned furious, demanding a refund and threatening to report her to the consumer authority. Back then, Mama Nduta had panicked, refunded him immediately, and cried after closing the shop that night, certain her business was ruined. That memory was why she now checked every expiry date twice before selling anything. Today, a young mother approached with a carton of yoghurt, unsure if it was still fresh. Mama Nduta checked the date carefully, found it expired by one day, and calmly replaced it with a fresh carton before the woman even had to ask. The woman thanked her, remarking that she wished every shopkeeper in town was as careful. Mama Nduta smiled, knowing exactly why she never took chances anymore.";

const IDENTIFY_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which phrase in the story is an example of personification?",
    correct: "\"The old refrigerator... hummed and groaned as if complaining about the afternoon heat\"",
    distractors: ["\"a customer named Peter had bought spoiled milk\"", "\"The woman thanked her\"", "\"Mama Nduta checked the date carefully\""],
    explanation: "Giving the refrigerator human actions like 'complaining' is personification — describing a non-living object as if it had human feelings.",
  },
  {
    q: "Which part of the story is a flashback?",
    correct: "The memory of the customer Peter and the spoiled milk incident five years earlier",
    distractors: ["The young mother approaching with a carton of yoghurt", "Mama Nduta replacing the expired yoghurt", "The woman thanking Mama Nduta at the end"],
    explanation: "The passage jumps back in time with 'She remembered the day, five years earlier,' describing an event from the past before returning to the present story — this is a flashback.",
  },
];

const CATEGORIZE_ITEMS: { text: string; category: "personification" | "flashback" }[] = [
  { text: "The old refrigerator hummed and groaned as if complaining about the heat", category: "personification" },
  { text: "Its door creaking open reluctantly whenever Mama Nduta reached for cold sodas", category: "personification" },
  { text: "She remembered the day, five years earlier, when a customer named Peter had bought spoiled milk", category: "flashback" },
  { text: "Back then, Mama Nduta had panicked, refunded him immediately, and cried after closing the shop that night", category: "flashback" },
];

const CHRONOLOGICAL_EVENTS = [
  { id: "peter", label: "(5 years ago) Peter buys spoiled milk from Mama Nduta and returns furious after getting sick" },
  { id: "panic", label: "(5 years ago) Mama Nduta panics, refunds him, and cries after closing the shop that night" },
  { id: "habit", label: "(Since then) She begins checking every expiry date twice before selling anything" },
  { id: "today-approach", label: "(Today) A young mother approaches with a carton of yoghurt" },
  { id: "today-check", label: "(Today) Mama Nduta checks the date, finds it expired, and replaces it" },
  { id: "today-thanks", label: "(Today) The woman thanks her for being so careful" },
];

const PURPOSE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why does the writer use personification to describe the refrigerator?",
    correct: "It makes the shop setting feel more vivid and alive, adding character to an ordinary object",
    distractors: ["It proves that the refrigerator is actually alive", "It has no effect on the story at all", "It is meant to frighten the reader"],
    explanation: "By giving the refrigerator human-like complaints, the writer brings the ordinary shop setting to life, making the scene feel more vivid and memorable for the reader.",
  },
  {
    q: "Why does the writer use a flashback to the incident with Peter?",
    correct: "It explains why Mama Nduta is now so careful about checking expiry dates",
    distractors: ["It has nothing to do with the rest of the story", "It shows Mama Nduta has forgotten the incident completely", "It proves the young mother was lying about the yoghurt"],
    explanation: "The flashback gives readers the reason behind Mama Nduta's present-day carefulness — without it, her caution with the yoghurt would seem unexplained.",
  },
];

const INFERENCE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What can you infer about how the incident with Peter affected Mama Nduta, based on her actions today?",
    correct: "It left a lasting impact that changed her business habits permanently, making her more careful with every customer",
    distractors: ["It had no lasting effect on her at all", "It made her decide to stop selling dairy products entirely", "It made her afraid of all her customers"],
    explanation: "The story shows her checking 'every expiry date twice' since that day and calmly replacing the expired yoghurt before being asked — habits directly traceable to the flashback, showing a lasting change in behaviour.",
  },
];

export const personificationFlashback: Skill = {
  id: "g8-eng-r-personification-flashback",
  code: "R.26",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Short Story: Style - Personification and Flashback (Class Reader)",
  description: "Identify personification and flashback in a short story, and appreciate the creative use of language in fiction.",
  generate(rng) {
    const branch = randChoice(rng, ["identify", "categorize", "purpose", "inference", "fill", "order"] as const);
    const hint = "Personification gives a non-living thing human qualities. A flashback interrupts the present story to describe an earlier event.";

    if (branch === "identify") {
      const entry = randChoice(rng, IDENTIFY_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORIZE_ITEMS);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each line from the story as Personification or Flashback.",
        passage: STORY,
        items,
        buckets: [
          { id: "personification", label: "Personification" },
          { id: "flashback", label: "Flashback" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is ${c.category === "personification" ? "personification — giving a non-living thing human qualities" : "part of the flashback — a memory of an earlier event"}.`).join(" "),
      };
    }

    if (branch === "purpose") {
      const entry = randChoice(rng, PURPOSE_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word from the story.",
        passage: STORY,
        before: "The old refrigerator in the corner of the shop hummed and groaned as if complaining about the afternoon",
        after: ", its door creaking open reluctantly whenever Mama Nduta reached for cold sodas.",
        correctAnswer: "heat",
        inputMode: "text",
        hint: "Look for the exact word in the passage above.",
        explanation: "The passage reads: \"...hummed and groaned as if complaining about the afternoon heat, its door creaking open...\"",
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, CHRONOLOGICAL_EVENTS);
      return {
        kind: "ordering",
        prompt: "Arrange these events in the true chronological order they happened in time (not the order the story tells them in).",
        instruction: "Click them in order.",
        passage: STORY,
        items,
        correctOrder: CHRONOLOGICAL_EVENTS.map((e) => e.id),
        hint: "The flashback about Peter happened five years before the events with the young mother today, even though the story narrates the flashback in the middle.",
        explanation: CHRONOLOGICAL_EVENTS.map((e) => e.label).join(" → "),
      };
    }

    const entry = randChoice(rng, INFERENCE_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      passage: STORY,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: entry.explanation,
    };
  },
};
