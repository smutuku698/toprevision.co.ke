import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What are the three phases of the triple jump, in order?",
    correct: "Hop, step, and jump",
    distractors: ["Run, hop, and land", "Step, hop, and sprint", "Jump, hop, and step"],
  },
  {
    q: "Why is it important to follow the correct phases in a triple jump?",
    correct: "It allows the athlete to transfer momentum smoothly and achieve greater distance",
    distractors: ["It is only for looking neat to judges", "It shortens the total distance jumped", "It is not important as long as the athlete lands safely"],
  },
  {
    q: "Which of these is a long-distance race in athletics?",
    correct: "The 10,000 metres",
    distractors: ["The 100 metres sprint", "The long jump", "The 4x100m relay"],
  },
  {
    q: "Which of these is also classified as a long-distance race?",
    correct: "The marathon",
    distractors: ["The 200 metres", "The high jump", "The shot put"],
  },
  {
    q: "How has long-distance running benefited Kenya?",
    correct: "It has brought international fame, medals, and economic opportunities through athletics",
    distractors: ["It has had no real impact on the country", "It has only affected one small region", "It is not practised competitively in Kenya"],
  },
  {
    q: "What is mosaic art made from?",
    correct: "Small pieces of material, such as tile, glass, or stone, arranged together to form an image",
    distractors: ["A single sheet of painted canvas", "Photographs printed and pasted together", "Charcoal sketches only"],
  },
  {
    q: "Which characteristic best describes a mosaic composition?",
    correct: "An image built up from many small, distinct pieces fitted closely together",
    distractors: ["A smooth, blended painting with no visible pieces", "A drawing made using only pencil", "A sculpture carved from a single block"],
  },
  {
    q: "How can a mosaic pictorial composition inspired by an athletic event help the environment?",
    correct: "It can reuse waste materials, such as broken tile or bottle tops, as art pieces",
    distractors: ["It requires cutting down more trees for canvas", "It has no connection to environmental use", "It always uses newly manufactured plastic only"],
  },
];

const TRIPLE_JUMP_PHASES: { id: string; label: string }[] = [
  { id: "hop", label: "Hop — take off and land on the same foot" },
  { id: "step", label: "Step — land on the opposite foot" },
  { id: "jump", label: "Jump — push off and land in the sand pit with both feet" },
];

const ORDER_PROMPTS = [
  "Arrange the three phases of the triple jump in the order they happen.",
  "Put the three triple jump phases in the order they occur.",
  "Order these triple jump phases, from first to last.",
  "Sort these triple jump phases into the correct sequence.",
  "Place these triple jump phases in the order an athlete performs them.",
] as const;

export const athleticsMosaic: Skill = {
  id: "cas-athletics-mosaic",
  code: "C.3",
  subjectId: "creative-arts-sports",
  strandId: "cas-creating-performing",
  grade: 9,
  title: "Athletics and Mosaic",
  description: "Phases of the triple jump, long-distance races, and mosaic composition characteristics.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "order"] as const);

    if (branch === "order") {
      const correctOrder = TRIPLE_JUMP_PHASES.map((p) => p.id);

      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the phases in order, from first to last.",
        items: shuffle(rng, TRIPLE_JUMP_PHASES),
        correctOrder,
        hint: "The triple jump follows hop, step, then jump — each phase transfers momentum into the next.",
        explanation: `The order is: ${TRIPLE_JUMP_PHASES.map((p) => p.label).join(" → ")}. Following the correct phases lets the athlete transfer momentum smoothly and achieve greater distance.`,
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
      hint: "Triple jump follows hop, step, jump; mosaics are built from many small pieces.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
