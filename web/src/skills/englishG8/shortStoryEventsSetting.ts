import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "In a small studio behind Nakuru's main market, twelve-year-old Imani spent every Saturday mixing paint from crushed charcoal, clay, and berry juice, since store-bought paint cost more than her family could spare. Her latest project was a mural on the studio's outer wall, depicting the market's traders in bright, bold colours. Halfway through, a sudden downpour soaked her half-finished mural, washing color down the wall in muddy streaks. Imani nearly cried, but her mentor, an old sign-painter named Bwana Kimani, told her that even ruined paintings could teach a lesson if she looked closely. Studying the streaked colors, Imani noticed the accidental blending had created a striking sunset effect she never could have planned. She reworked her design around the happy accident, and when the mural was finished, the swirling colors became the town's favourite feature of the market. Local newspapers wrote about the young artist whose disaster had become her masterpiece.";

const EVENTS = [
  { id: "mixing", label: "Imani mixes her own paint from charcoal, clay, and berry juice" },
  { id: "mural", label: "She begins a mural depicting the market's traders on the studio wall" },
  { id: "rain", label: "A sudden downpour soaks her half-finished mural" },
  { id: "kimani", label: "Bwana Kimani tells her that even ruined paintings can teach a lesson" },
  { id: "notice", label: "Imani notices the accidental blending created a striking sunset effect" },
  { id: "rework", label: "She reworks her design around the happy accident" },
  { id: "finish", label: "The finished mural becomes the market's favourite feature" },
];

const FILL_ITEMS = [
  { before: "Halfway through, a sudden downpour soaked her half-finished mural, washing color down the wall in muddy", after: ".", correctAnswer: "streaks" },
  { before: "Studying the streaked colors, Imani noticed the accidental blending had created a striking", after: "effect she never could have planned.", correctAnswer: "sunset" },
  { before: "Local newspapers wrote about the young artist whose disaster had become her", after: ".", correctAnswer: "masterpiece" },
];

const SETTING_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Where does this story take place?",
    correct: "A small studio behind Nakuru's main market",
    distractors: ["A large art gallery in the capital city", "Imani's classroom at school", "A newspaper office"],
    explanation: "The story opens with 'In a small studio behind Nakuru's main market, twelve-year-old Imani spent every Saturday mixing paint.'",
  },
  {
    q: "What detail about the setting explains why Imani mixed her own paint instead of buying it?",
    correct: "Store-bought paint cost more than her family could afford",
    distractors: ["There were no paint shops anywhere near the market", "She preferred the smell of homemade paint", "Her mentor forbade her from buying paint"],
    explanation: "The passage states she mixed her own paint 'since store-bought paint cost more than her family could spare,' explaining the setting's economic detail.",
  },
];

const REAL_LIFE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which real-life situation best reflects what happens to Imani's mural in this story?",
    correct: "A baker's cake collapses in the oven, but the cracked shape gives them an idea for a new, popular design",
    distractors: ["A student copies a classmate's homework and gets caught", "A shopkeeper raises prices during a shortage", "A farmer plants the same crop every single season"],
    explanation: "Like Imani, who turned a ruined mural into something better through a fresh, creative response to an accident, the baker turns a mistake into an unexpected success.",
  },
  {
    q: "What can you infer about Bwana Kimani's role in this story, beyond simply being present?",
    correct: "He helps Imani change how she sees failure, encouraging her to find opportunity in a setback",
    distractors: ["He forces Imani to give up painting completely", "He paints the entire mural for her himself", "He criticises Imani for making the mistake"],
    explanation: "Kimani's advice — that ruined paintings can still teach something — directly shapes Imani's shift from despair to noticing the sunset effect, showing his role as a guide rather than a painter or critic, which the story implies through the sequence of events rather than stating outright.",
  },
];

export const shortStoryEventsSetting: Skill = {
  id: "g8-eng-r-short-story-events-setting",
  code: "R.20",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Short Story - Events and Setting (Class Reader)",
  description: "Highlight the main events in a short story, identify its setting, and relate the events to real life.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "setting", "reallife", "categorize", "fill"] as const);
    const hint = "Notice how the setting shapes what happens, and how the sequence of events leads to the story's outcome.";

    if (branch === "order") {
      const items = shuffle(rng, EVENTS);
      return {
        kind: "ordering",
        prompt: "Arrange the main events of the story in the order they happened.",
        instruction: "Click them in order.",
        passage: STORY,
        items,
        correctOrder: EVENTS.map((e) => e.id),
        hint: "The story moves from Imani mixing paint and starting her mural, through the rain damaging it, to her reworking it into something better.",
        explanation: EVENTS.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "setting") {
      const entry = randChoice(rng, SETTING_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Look for where the events happen and any details that shape what the characters can do.",
        explanation: entry.explanation,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, EVENTS).slice(0, 4);
      const rainIndex = EVENTS.findIndex((e) => e.id === "rain");
      const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => {
        const originalIndex = EVENTS.findIndex((orig) => orig.id === e.id);
        correctBucket[`e${i}`] = originalIndex <= rainIndex ? "before" : "after";
      });
      return {
        kind: "categorize",
        prompt: "Sort each event as happening Before or After the sudden downpour damaged the mural.",
        passage: STORY,
        items,
        buckets: [
          { id: "before", label: "Before the downpour" },
          { id: "after", label: "After the downpour" },
        ],
        correctBucket,
        hint: "The turning point of the story is when the sudden downpour soaks the half-finished mural.",
        explanation: chosen
          .map((e) => {
            const originalIndex = EVENTS.findIndex((orig) => orig.id === e.id);
            return `"${e.label}" happened ${originalIndex <= rainIndex ? "before or during" : "after"} the downpour.`;
          })
          .join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word from the story.",
        passage: STORY,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look for the exact word in the passage above.",
        explanation: `The passage reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    const entry = randChoice(rng, REAL_LIFE_QUESTIONS);
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
