import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "When the head teacher announced that Mang'u Primary needed a new head girl, most pupils expected quiet, hardworking Kiptoo to be chosen — he never missed his duties and always arrived first to open the classroom. To everyone's surprise, the teachers picked loud, popular Wanjiru instead, known more for jokes than discipline. In her first week, Wanjiru struggled to organise the Monday assembly and often forgot simple instructions. Quietly, Kiptoo began helping her each morning, writing lists of duties and reminding her gently before problems arose. By the end of the term, Wanjiru's assemblies ran smoothly, and she publicly thanked Kiptoo in front of the whole school for teaching her what true leadership meant.";

const OPENING_ONLY =
  "When the head teacher announced that Mang'u Primary needed a new head girl, most pupils expected quiet, hardworking Kiptoo to be chosen. To everyone's surprise, the teachers picked loud, popular Wanjiru instead, known more for jokes than discipline.";

const CHARACTER_ROLES: { name: string; role: string }[] = [
  { name: "Wanjiru", role: "The newly chosen head girl who struggles at first but grows into her leadership role" },
  { name: "Kiptoo", role: "The hardworking pupil who quietly helps Wanjiru learn her duties" },
  { name: "The head teacher", role: "The adult who makes the surprising decision to choose Wanjiru" },
];

const PLOT_DETAILS: { text: string; category: "advances" | "background" }[] = [
  { text: "Kiptoo quietly helps Wanjiru with lists of duties each morning", category: "advances" },
  { text: "Wanjiru publicly thanks Kiptoo in front of the whole school", category: "advances" },
  { text: "Wanjiru was known more for jokes than discipline", category: "background" },
  { text: "Kiptoo always arrived first to open the classroom", category: "background" },
];

const IDENTIFY_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Who is the main character in this excerpt — the one whose growth the story centres on?",
    correct: "Wanjiru",
    distractors: ["Kiptoo", "The head teacher", "The whole school"],
    explanation: "The excerpt follows Wanjiru from her surprising selection, through her struggles, to her growth into a confident leader — she is the main character.",
  },
];

const TITLE_PREDICT_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Imagine a class reader chapter titled 'The Reluctant Leader'. Which is the most reasonable prediction for what it is about?",
    correct: "A character who does not expect or want to lead is eventually placed in a position of leadership",
    distractors: [
      "A character who has always dreamed of becoming a leader since childhood",
      "A story with no characters in a position of leadership at all",
      "A detailed history of a school building's construction",
    ],
    explanation: "The word 'reluctant' signals unwillingness, so a title like this most reasonably predicts a story about someone unexpectedly placed in a leadership role.",
  },
];

const OPENING_PREDICT_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Based only on this opening, what is a reasonable prediction for what happens next in the story?",
    correct: "Wanjiru will likely face some difficulty at first before learning to lead well",
    distractors: [
      "Wanjiru will immediately quit and Kiptoo will be made head girl instead",
      "The head teacher will change the decision the very next day",
      "The story will shift entirely to describe a different school",
    ],
    explanation: "Since Wanjiru was an unexpected, less disciplined choice, an opening like this sets up likely early struggles that a story would then resolve through her growth.",
  },
];

const APPRECIATE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why is it useful to notice who the main character is before reading further in a class reader?",
    correct: "It helps us follow whose choices and growth the plot is mainly built around",
    distractors: [
      "It tells us exactly how many pages the book has",
      "It lets us skip reading the rest of the story",
      "It has no real effect on how we understand the story",
    ],
    explanation: "Identifying the main character helps a reader track whose decisions and development drive most of the story's events.",
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Quietly, Kiptoo began helping her each morning, writing lists of duties and reminding her", after: "before problems arose.", correctAnswer: "gently" },
  { before: "By the end of the term, Wanjiru's assemblies ran", after: ", and she publicly thanked Kiptoo.", correctAnswer: "smoothly" },
  { before: "she publicly thanked Kiptoo in front of the whole school for teaching her what true", after: "meant.", correctAnswer: "leadership" },
];

export const classReaderMainCharacters: Skill = {
  id: "g7-eng-r-class-reader-main-characters",
  code: "R.19",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Class Reader — Main Characters",
  description: "Identify main characters, explain how they make the story flow, make predictions from titles and openings, and appreciate the role of characters.",
  generate(rng) {
    const branch = randChoice(rng, ["identify", "title-predict", "opening-predict", "categorize", "match", "fill", "appreciate"] as const);
    const hint = "The main character is the person whose choices and growth the story follows most closely from beginning to end.";

    if (branch === "identify") {
      const entry = randChoice(rng, IDENTIFY_MC);
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

    if (branch === "title-predict") {
      const entry = randChoice(rng, TITLE_PREDICT_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think carefully about what the words in the title suggest about the character or plot.",
        explanation: entry.explanation,
      };
    }

    if (branch === "opening-predict") {
      const entry = randChoice(rng, OPENING_PREDICT_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: OPENING_ONLY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Use only the details given in the opening — do not assume information you have not been told.",
        explanation: entry.explanation,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, PLOT_DETAILS);
      const items = chosen.map((c, i) => ({ id: `d${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`d${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each detail as either Advances the Plot or Background Detail Only.",
        passage: STORY,
        items,
        buckets: [
          { id: "advances", label: "Advances the Plot" },
          { id: "background", label: "Background Detail Only" },
        ],
        correctBucket,
        hint: "A detail that advances the plot changes what happens next; a background detail only describes a character.",
        explanation: chosen
          .map((c) => `"${c.text}" ${c.category === "advances" ? "advances the plot" : "is only a background detail"}.`)
          .join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, CHARACTER_ROLES.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, CHARACTER_ROLES.map((c) => ({ id: c.name, label: c.role })));
      const correctMap: Record<string, string> = {};
      for (const c of CHARACTER_ROLES) correctMap[c.name] = c.name;
      return {
        kind: "click-match",
        prompt: "Match each character to their role in the story.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint: "Look at what each character does across the story, not just what they are called.",
        explanation: CHARACTER_ROLES.map((c) => `${c.name} — ${c.role.toLowerCase()}.`).join(" "),
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
        explanation: `The passage reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, APPRECIATE_MC);
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
