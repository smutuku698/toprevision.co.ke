import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "\"You always copy my homework answers,\" Njeri snapped at her deskmate Faith, slamming her book shut. Faith looked down, embarrassed. \"I don't understand fractions,\" she admitted quietly. \"You could just ask me instead of copying,\" Njeri said, her voice softer now. That afternoon, Njeri sat beside Faith after class and explained each fraction step by step, patient with every mistake. \"Try again,\" Njeri said, pointing at the next problem. Faith tried, got it wrong, and sighed. \"Try again,\" Njeri repeated gently, and Faith tried once more. By the fifth attempt, Faith solved it correctly and grinned with relief. \"Try again\" became their little joke that whole term, said whenever either girl faced something hard, whether a tricky sum or a hard conversation with a teacher. By the end of the year, Faith was tutoring other classmates in fractions herself, and she always began the same way her friend had: \"Try again.\"";

const DIALOGUE_LINES = [
  "\"You always copy my homework answers,\"",
  "\"I don't understand fractions,\"",
  "\"You could just ask me instead of copying,\"",
  "\"Try again,\"",
];

const NARRATION_LINES = [
  "Njeri snapped at her deskmate Faith, slamming her book shut.",
  "Faith looked down, embarrassed.",
  "That afternoon, Njeri sat beside Faith after class and explained each fraction step by step.",
  "By the fifth attempt, Faith solved it correctly and grinned with relief.",
];

const TERMS: { term: string; definition: string }[] = [
  { term: "Dialogue", definition: "The words characters actually speak, shown in quotation marks" },
  { term: "Narration", definition: "The parts of the story describing actions and events, not spoken directly" },
  { term: "Repetition", definition: "Repeating a word or phrase on purpose for emphasis or effect" },
  { term: "Memorable phrase", definition: "A repeated line, like \"Try again,\" that becomes meaningful and ties the story together" },
];

const FILL_ITEMS = [
  { before: "\"Try again,\" Njeri repeated gently, and Faith tried", after: ".", correctAnswer: "once more" },
  { before: "\"Try again\" became their little joke that whole", after: ", said whenever either girl faced something hard.", correctAnswer: "term" },
  { before: "By the end of the year, Faith was tutoring other classmates in fractions herself, and she always began the same way her friend", after: ": \"Try again.\"", correctAnswer: "had" },
];

const IDENTIFY_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which phrase is repeated several times throughout the story?",
    correct: "\"Try again\"",
    distractors: ["\"You always copy my homework answers\"", "\"I don't understand fractions\"", "\"You could just ask me instead of copying\""],
    explanation: "The phrase \"Try again\" appears when Njeri first teaches Faith, becomes their term-long joke, and is the phrase Faith uses herself when tutoring others by the end.",
  },
];

const EFFECT_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What effect does repeating the phrase \"Try again\" have in this story?",
    correct: "It emphasises the theme of patience and persistence, and shows how Njeri's encouragement shaped Faith",
    distractors: ["It shows that Njeri and Faith could not understand each other", "It proves that fractions are impossible to learn", "It shows the girls disliked spending time together"],
    explanation: "The repeated phrase links Njeri's patient teaching to Faith's own growth into a tutor, reinforcing persistence as the story's central theme through emphasis and echo.",
  },
  {
    q: "Why does the story end with Faith saying \"Try again\" to other classmates?",
    correct: "It shows the phrase, and the patience it represents, was passed on from Njeri to Faith and now to others",
    distractors: ["It shows Faith forgot where the phrase came from", "It shows Faith disliked being reminded of the phrase", "It shows the phrase had lost all meaning by the end"],
    explanation: "By having Faith repeat Njeri's exact words when helping others, the story shows how a lesson and a habit of patience can be passed from person to person — an inference built from the repetition, not a stated fact.",
  },
];

const PURPOSE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why do authors include dialogue like Njeri and Faith's conversation in a short story?",
    correct: "Dialogue reveals character and feelings, and moves the story forward in a realistic way",
    distractors: ["Dialogue is only used to make a story longer", "Dialogue is used to confuse the reader", "Dialogue replaces the need for any setting"],
    explanation: "Through their exact words, we learn Njeri's initial frustration and later patience, and Faith's embarrassment and growth — dialogue reveals character more vividly than narration alone.",
  },
  {
    q: "What do we learn about Njeri specifically through her dialogue, that we might not learn from narration alone?",
    correct: "Her tone changes from sharp ('You always copy') to gentle ('Try again'), showing her growing patience",
    distractors: ["That she is the oldest student in her class", "That she wants to stop being friends with Faith", "That she dislikes school completely"],
    explanation: "The shift in Njeri's actual words — from an accusing snap to a gentle repeated encouragement — shows her changing attitude in a way a plain summary would not capture as vividly.",
  },
];

export const shortStoryDialogueRepetition: Skill = {
  id: "g8-eng-r-short-story-dialogue-repetition",
  code: "R.10",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Short Story - Dialogue and Repetition (Class Reader)",
  description: "Identify dialogue and repetition in a short story and explain their importance in fiction writing.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "fill", "identify", "effect", "purpose"] as const);
    const hint = "Dialogue is what characters actually say in quotation marks; narration describes actions and events around it.";

    if (branch === "categorize") {
      const chosen = shuffle(rng, [
        ...DIALOGUE_LINES.map((l) => ({ text: l, category: "dialogue" as const })),
        ...NARRATION_LINES.map((l) => ({ text: l, category: "narration" as const })),
      ]).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each line from the story as Dialogue (spoken words) or Narration (description of events/actions).",
        passage: STORY,
        items,
        buckets: [
          { id: "dialogue", label: "Dialogue" },
          { id: "narration", label: "Narration" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is ${c.category === "dialogue" ? "dialogue — spoken words in quotation marks" : "narration — describing what happened"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.definition })));
      const correctMap: Record<string, string> = {};
      for (const t of TERMS) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each term to its definition.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint,
        explanation: TERMS.map((t) => `${t.term} — ${t.definition.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word(s) from the story.",
        passage: STORY,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look for the exact words in the passage above.",
        explanation: `The passage reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

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
        hint: "Look for a short phrase in quotation marks that appears more than once in the passage.",
        explanation: entry.explanation,
      };
    }

    if (branch === "effect") {
      const entry = randChoice(rng, EFFECT_QUESTIONS);
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
  },
};
