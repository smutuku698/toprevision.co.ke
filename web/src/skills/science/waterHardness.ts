import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STATEMENTS: { text: string; bucket: "hard" | "soft" }[] = [
  { text: "Contains dissolved calcium and magnesium salts", bucket: "hard" },
  { text: "Does not lather easily with soap", bucket: "hard" },
  { text: "Leaves scale (fur) inside kettles and pipes", bucket: "hard" },
  { text: "Rainwater collected before touching rock or soil", bucket: "soft" },
  { text: "Lathers easily with soap", bucket: "soft" },
  { text: "Has few or no dissolved mineral salts", bucket: "soft" },
];

const METHODS: { name: string; effect: string }[] = [
  { name: "Boiling", effect: "Drives off temporary hardness by turning dissolved calcium hydrogencarbonate into insoluble scale" },
  { name: "Adding washing soda", effect: "Reacts with the dissolved calcium and magnesium salts to remove both temporary and permanent hardness" },
  { name: "Distilling", effect: "Evaporates the water and condenses it, leaving all dissolved salts behind" },
];

const HARDENING_STEPS = [
  { id: "rain", label: "Rain falls as naturally soft water" },
  { id: "percolate", label: "The water percolates through rock and soil containing limestone (calcium carbonate)" },
  { id: "react", label: "Dissolved carbon dioxide in the water reacts with the calcium carbonate" },
  { id: "dissolve", label: "The calcium carbonate dissolves as soluble calcium hydrogencarbonate" },
  { id: "hard", label: "The water now carries dissolved calcium and magnesium salts, making it hard water" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "Water containing dissolved calcium and magnesium salts is called ", after: " water.", correctAnswer: "hard", accepted: ["hard"], explanation: "Hard water is water containing dissolved calcium and magnesium salts picked up from rock and soil." },
  { before: "Water with few or no dissolved mineral salts is called ", after: " water.", correctAnswer: "soft", accepted: ["soft"], explanation: "Soft water has few or no dissolved mineral salts, so it lathers easily with soap." },
  { before: "Hardness that can be removed simply by boiling the water is called ", after: " hardness.", correctAnswer: "temporary", accepted: ["temporary"], explanation: "Temporary hardness can be removed by boiling, which turns dissolved calcium hydrogencarbonate into insoluble scale." },
  { before: "Hardness that cannot be removed by boiling, and needs a chemical method instead, is called ", after: " hardness.", correctAnswer: "permanent", accepted: ["permanent"], explanation: "Permanent hardness cannot be removed by boiling and needs a chemical method, such as adding washing soda, instead." },
  { before: "The hard, chalky deposit left behind in kettles and pipes by hard water is called ", after: ".", correctAnswer: "scale", accepted: ["scale"], explanation: "Scale (or 'fur') is the hard, chalky deposit left behind in kettles and pipes by hard water." },
  { before: "The process of turning hard water into soft water is called water ", after: ".", correctAnswer: "softening", accepted: ["softening"], explanation: "Water softening is the process of removing dissolved calcium and magnesium salts to turn hard water into soft water." },
] as const;

const QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Which is an advantage of hard water?",
    choices: ["It supplies useful calcium and magnesium for bones and teeth", "It lathers easily with soap", "It never forms scale in pipes", "It is cheaper to soften than soft water"],
    correctIndex: 0,
    explanation: "Hard water's dissolved calcium and magnesium are actually useful for building strong bones and teeth, even though it wastes soap and forms scale.",
  },
  {
    prompt: "Which is a disadvantage of hard water?",
    choices: ["It forms scale that can block pipes and damage kettles", "It is the best water for drinking", "It always tastes sweeter", "It removes stains better than soft water"],
    correctIndex: 0,
    explanation: "Scale (fur) built up from hard water can block pipes, reduce the efficiency of kettles and boilers, and waste soap.",
  },
  {
    prompt: "Why is hard water often preferred for drinking over soft water?",
    choices: ["It supplies essential minerals like calcium and magnesium", "It is always clearer in colour", "It boils faster than soft water", "It contains no bacteria"],
    correctIndex: 0,
    explanation: "Hard water's dissolved minerals contribute to daily calcium and magnesium intake, which is why it is often considered healthier to drink than soft water.",
  },
];

export const waterHardness: Skill = {
  id: "sci-mec-water-hardness",
  code: "MEC.3",
  subjectId: "science",
  strandId: "sci-mec",
  grade: 9,
  title: "Water hardness",
  description: "Hard vs soft water, methods of softening, and their advantages and disadvantages.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "methods", "advantage", "fill-blank", "hardening-order"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about water hardness.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe hard water, soft water, and softening methods.",
        explanation: fb.explanation,
      };
    }

    if (branch === "hardening-order") {
      const items = shuffle(rng, HARDENING_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps in how rainwater becomes hard water, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: HARDENING_STEPS.map((s) => s.id),
        hint: "Rain starts soft, then picks up dissolved minerals as it passes through rock and soil.",
        explanation: HARDENING_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "classify") {
      const chosen = shuffle(rng, STATEMENTS).slice(0, 5);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.bucket));

      return {
        kind: "categorize",
        prompt: "Sort each statement into hard water or soft water.",
        items,
        buckets: [
          { id: "hard", label: "Hard water" },
          { id: "soft", label: "Soft water" },
        ],
        correctBucket,
        hint: "Hard water contains dissolved calcium and magnesium salts picked up from rock and soil.",
        explanation: chosen.map((s) => `"${s.text}" describes ${s.bucket} water.`).join(" "),
      };
    }

    if (branch === "methods") {
      const tokens = shuffle(rng, METHODS.map((m) => ({ id: m.name, label: m.name })));
      const targets = shuffle(rng, METHODS.map((m) => ({ id: m.name, label: m.effect })));
      const correctMap: Record<string, string> = {};
      for (const m of METHODS) correctMap[m.name] = m.name;

      return {
        kind: "click-match",
        prompt: "Match each method of softening water to what it does.",
        tokens,
        targets,
        correctMap,
        hint: "Softening methods either remove the dissolved salts or turn them into an insoluble solid.",
        explanation: METHODS.map((m) => `${m.name} — ${m.effect.toLowerCase()}.`).join(" "),
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Weigh the useful minerals hard water supplies against the practical problems, like scale, that it causes.",
      explanation: q.explanation,
    };
  },
};
