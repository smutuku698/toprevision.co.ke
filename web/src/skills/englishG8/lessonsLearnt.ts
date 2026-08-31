import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Everyone in Mutinda's family expected him to become a doctor, since both his parents worked at the district hospital and had saved for years toward his medical training. Mutinda studied hard and passed his exams, but every free hour he spent repairing broken radios, bicycles, and eventually small engines for neighbours who could not afford a proper mechanic. In his final year of secondary school, he confessed to his father that he dreaded the thought of years in a lecture hall, and that fixing machines was the only work that made him lose track of time. His father, disappointed at first, arranged for Mutinda to spend one week shadowing a doctor and one week shadowing a mechanic before making any final decision. After the two weeks, Mutinda knew for certain which path felt right. His father, seeing his son's genuine excitement working with engines compared to his quiet endurance in the hospital ward, agreed to support a technical training course instead. Two years later, Mutinda opened a small repair workshop that was never short of customers, and his father admitted that a happy mechanic served the community better than a reluctant doctor ever could.";

const EVENTS = [
  { id: "expect", label: "Mutinda's family expects him to become a doctor" },
  { id: "study", label: "He studies hard, but spends free hours repairing radios, bicycles, and engines" },
  { id: "confess", label: "He confesses to his father that he dreads years in a lecture hall" },
  { id: "shadow", label: "His father arranges a week shadowing a doctor and a week shadowing a mechanic" },
  { id: "decide", label: "After the two weeks, Mutinda knows for certain which path feels right" },
  { id: "workshop", label: "Two years later, Mutinda opens a repair workshop that is never short of customers" },
];

const FILL_ITEMS = [
  { before: "Mutinda studied hard and passed his exams, but every free hour he spent repairing broken radios, bicycles, and eventually small", after: "for neighbours who could not afford a proper mechanic.", correctAnswer: "engines" },
  { before: "His father, disappointed at first, arranged for Mutinda to spend one week shadowing a doctor and one week shadowing a", after: "before making any final decision.", correctAnswer: "mechanic" },
  { before: "Two years later, Mutinda opened a small repair workshop that was never short of", after: ".", correctAnswer: "customers" },
];

const LESSON_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What lesson does this story teach?",
    correct: "A person is more likely to succeed and be happy following a career that genuinely interests them, not just one others expect",
    distractors: ["Children should always do exactly what their parents want, regardless of their own interests", "Becoming a doctor is more valuable than becoming a mechanic", "It is wrong to ever try more than one type of work"],
    explanation: "Mutinda's father learns that 'a happy mechanic served the community better than a reluctant doctor ever could,' showing that genuine interest, not just family expectation, leads to a better outcome.",
  },
  {
    q: "Why did Mutinda's father agree to let him try both shadowing experiences before deciding?",
    correct: "He wanted Mutinda to make an informed choice based on real experience, not pressure alone",
    distractors: ["He wanted to prove that medicine was clearly the better choice", "He had no interest in his son's opinion at all", "He wanted to delay the decision indefinitely"],
    explanation: "Arranging one week in each field shows the father's willingness to let Mutinda gather real evidence for himself rather than deciding purely on family expectation — an inference from his actions rather than a stated reason.",
  },
];

const REAL_LIFE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which real-life situation best reflects the lesson learnt in this story?",
    correct: "A student pressured to join a prestigious course instead pursues a trade they excel at, and later thrives in that career",
    distractors: ["A student ignores every subject at school to avoid all responsibility", "A student picks a career at random without thinking about it", "A student follows family pressure and later regrets the decision but never speaks up"],
    explanation: "Like Mutinda, who found success following his genuine passion for mechanics rather than the expected path of medicine, this student thrives after choosing a path based on real strength and interest.",
  },
];

const SOCIETAL_ISSUE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What societal issue does this story address?",
    correct: "The pressure young people face to choose prestigious careers over paths that truly suit them",
    distractors: ["The shortage of hospitals in rural areas", "The high cost of school fees", "The lack of qualified teachers in technical colleges"],
    explanation: "The story centres on Mutinda's struggle against family and social expectation to become a doctor, addressing the wider pressure many young people feel to pursue 'prestigious' careers rather than their true strengths.",
  },
];

const LESSON_ITEMS: { title: string; lesson: string }[] = [
  { title: "Mutinda's initial silence about his true feelings", lesson: "Fear of disappointing family can keep a person from voicing what they really want" },
  { title: "The two weeks of shadowing", lesson: "Real experience helps reveal where a person's genuine strengths and interests lie" },
  { title: "The father's final admission", lesson: "Supporting someone's genuine passion can lead to greater success than insisting on a 'safer' choice" },
];

export const lessonsLearnt: Skill = {
  id: "g8-eng-r-lessons-learnt",
  code: "R.22",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Lessons Learnt (Class Reader)",
  description: "Identify the lessons learnt in a short story, relate them to real life, and appreciate how stories address societal issues.",
  generate(rng) {
    const branch = randChoice(rng, ["lesson", "reallife", "issue", "match", "order", "fill"] as const);
    const hint = "Think about what changes in the characters' understanding by the end of the story, and why.";

    if (branch === "lesson") {
      const entry = randChoice(rng, LESSON_QUESTIONS);
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

    if (branch === "reallife") {
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
    }

    if (branch === "issue") {
      const entry = randChoice(rng, SOCIETAL_ISSUE_QUESTIONS);
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

    if (branch === "order") {
      const items = shuffle(rng, EVENTS);
      return {
        kind: "ordering",
        prompt: "Arrange the events of the story in the order they happened.",
        instruction: "Click them in order.",
        passage: STORY,
        items,
        correctOrder: EVENTS.map((e) => e.id),
        hint: "The story moves from family expectation, through Mutinda's confession, to the shadowing experience and his final decision.",
        explanation: EVENTS.map((e) => e.label).join(" → "),
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

    const tokens = shuffle(rng, LESSON_ITEMS.map((l, i) => ({ id: `l${i}`, label: l.title })));
    const targets = shuffle(rng, LESSON_ITEMS.map((l, i) => ({ id: `l${i}`, label: l.lesson })));
    const correctMap: Record<string, string> = {};
    LESSON_ITEMS.forEach((_, i) => (correctMap[`l${i}`] = `l${i}`));
    return {
      kind: "click-match",
      prompt: "Match each moment in the story to the lesson it teaches.",
      passage: STORY,
      tokens,
      targets,
      correctMap,
      hint,
      explanation: LESSON_ITEMS.map((l) => `${l.title} — ${l.lesson.toLowerCase()}.`).join(" "),
    };
  },
};
