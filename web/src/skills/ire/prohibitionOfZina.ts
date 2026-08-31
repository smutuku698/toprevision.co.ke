import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CATEGORIZE_PROMPTS = [
  "Sort each statement into 'An effect of Zina' or 'An Islamic measure to curb Zina'.",
  "Group each statement under 'An effect of Zina' or 'An Islamic measure to curb it'.",
  "Decide whether each statement describes an effect of Zina or a measure to curb it, and sort it there.",
  "Sort each statement into the correct category: effect of Zina, or measure to curb it.",
  "Place each statement into the right bucket — an effect, or a measure to prevent it.",
  "Categorise each statement as either an effect of Zina or a preventive measure.",
];

const EFFECTS = [
  { label: "Unwanted pregnancies", reason: "Unwanted pregnancies are a real effect of Zina named in Islamic teaching on the topic." },
  { label: "Spread of sexually transmitted diseases", reason: "The spread of disease is a serious effect of Zina." },
  { label: "Breakdown of family bonds and trust", reason: "Zina damages the trust and stability that hold families together." },
];

const MEASURES = [
  { label: "Encouraging modesty in dress and behaviour", reason: "Modesty is an Islamic measure for curbing Zina." },
  { label: "Avoiding inappropriate seclusion with a non-mahram", reason: "Avoiding seclusion is an Islamic measure that helps prevent Zina." },
  { label: "Strengthening family and community guidance for youth", reason: "Strong guidance from family and community is a measure that helps curb Zina." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Which of these is listed as an effect of Zina on the community?",
    correct: "Unwanted pregnancies and the spread of sexually transmitted diseases",
    distractors: ["Increased agricultural production", "Improved school attendance", "Stronger international trade"],
  },
  {
    q: "Why does Islam prohibit Zina?",
    correct: "To protect the moral fabric and stability of the family and society",
    distractors: ["To limit population growth only", "To discourage marriage entirely", "To reduce the number of religious holidays"],
  },
  {
    q: "Which of these is an Islamic measure for curbing Zina?",
    correct: "Encouraging modesty in dress and behaviour, and avoiding inappropriate seclusion",
    distractors: ["Banning all forms of education", "Prohibiting marriage between Muslims", "Removing family involvement in relationships"],
  },
  {
    q: "What social effect can result from Zina, according to Islamic teaching?",
    correct: "Breakdown of family bonds and trust within the community",
    distractors: ["Stronger family unity", "Increased respect between spouses", "Greater financial stability for families"],
  },
];

export const prohibitionOfZina: Skill = {
  id: "ire-ak-prohibitions",
  code: "AK.3",
  subjectId: "ire",
  strandId: "ire-akhlaq",
  grade: 9,
  title: "Prohibitions in Islam: Zina",
  description: "Answer questions about the effects of Zina and why it is prohibited in Islam.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "categorize"] as const);

    if (branch === "categorize") {
      const effects = shuffle(rng, EFFECTS).slice(0, 2);
      const measures = shuffle(rng, MEASURES).slice(0, 2);
      const items = shuffle(rng, [
        ...effects.map((s) => ({ id: s.label, label: s.label, bucket: "effects", reason: s.reason })),
        ...measures.map((s) => ({ id: s.label, label: s.label, bucket: "measures", reason: s.reason })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "effects", label: "An effect of Zina" },
          { id: "measures", label: "An Islamic measure to curb it" },
        ],
        correctBucket,
        hint: "Effects are the harm Zina causes; measures are what Islam proposes to prevent it.",
        explanation: items.map((item) => item.reason).join(" "),
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
      hint: "Islam prohibits Zina (fornication and adultery) because of the real harm it causes to individuals, families, and the health of the community.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
