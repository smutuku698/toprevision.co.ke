import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "In oblique projection, which face of the object is drawn true to its actual shape and size?",
    correct: "The front face",
    distractors: ["The top face", "The side face", "All faces equally"],
  },
  {
    q: "What is the main difference between cavalier and cabinet oblique projection?",
    correct: "Cabinet projection draws depth lines at half their true length; cavalier draws them full length",
    distractors: [
      "Cavalier projection has no depth lines at all",
      "Cabinet projection is only used for round objects",
      "Cavalier projection draws the front face at half size",
    ],
  },
  {
    q: "What angle is commonly used for the depth lines in oblique projection?",
    correct: "45°",
    distractors: ["15°", "60°", "90°"],
  },
  {
    q: "Why might cabinet projection be preferred over cavalier projection?",
    correct: "It gives a more realistic, less stretched-looking appearance of depth",
    distractors: [
      "It is faster to draw with no instruments needed",
      "It removes the need to draw a front face",
      "It only works for technical drawings of circles",
    ],
  },
  {
    q: "Which instruments are typically used to accurately draw shaped blocks in oblique projection?",
    correct: "Geometrical set drawing instruments (e.g. set squares, ruler, protractor)",
    distractors: ["A paintbrush and canvas", "A compass only, without a ruler", "No instruments — it must be done freehand only"],
  },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Front face", meaning: "drawn true to its actual shape and size" },
  { term: "Cavalier projection", meaning: "draws depth lines at their full true length" },
  { term: "Cabinet projection", meaning: "draws depth lines at half their true length" },
  { term: "Depth line angle", meaning: "commonly drawn at 45° to the horizontal" },
];

export const obliqueProjection: Skill = {
  id: "pt-c-oblique-projection",
  code: "C.1",
  subjectId: "pre-technical",
  strandId: "pt-communication",
  grade: 9,
  title: "Oblique projection",
  description: "Answer questions about the characteristics of oblique drawing.",
  generate(rng) {
    const branch = randChoice(rng, ["questions", "match"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of TERMS) correctMap[t.term] = t.term;

      return {
        kind: "click-match",
        prompt: "Match each oblique projection term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Oblique projection is a pictorial way of showing a 3D object, keeping one face undistorted.",
        explanation: TERMS.map((t) => `${t.term} — ${t.meaning}.`).join(" "),
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Oblique projection is a pictorial way of showing a 3D object, keeping one face undistorted.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
