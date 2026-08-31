import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CATEGORIZE_PROMPTS = [
  "Sort each statement into 'Reflects true Jihad' or 'Terrorism/extremism (condemned by Islam)'.",
  "Group each statement under 'Reflects true Jihad' or 'Terrorism/extremism (condemned by Islam)'.",
  "Decide whether each statement reflects true Jihad or terrorism/extremism, and sort it there.",
  "Sort each statement into the correct category: true Jihad, or terrorism/extremism.",
  "Place each statement into the right bucket — true Jihad, or condemned terrorism/extremism.",
  "Categorise each statement as either true Jihad or terrorism/extremism.",
];

const TRUE_JIHAD = [
  { label: "Striving to improve one's own character and self-discipline", reason: "This inner struggle for self-improvement is the primary meaning of Jihad." },
  { label: "Working hard against one's own bad habits", reason: "Overcoming personal weaknesses is a core part of true Jihad." },
  { label: "Standing up peacefully for justice and what is right", reason: "Peaceful struggle for justice reflects the true meaning of Jihad." },
];

const TERRORISM_EXTREMISM = [
  { label: "Attacking innocent civilians to spread fear", reason: "This is terrorism, which Islam explicitly condemns — it is not Jihad." },
  { label: "Using violence to force personal beliefs on others", reason: "Forcing belief through violence is extremism, condemned in Islamic teaching." },
  { label: "Radicalising others through misinterpreted teachings", reason: "Radicalisation through misinterpretation is a cause of extremism, not true Jihad." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the primary meaning of Jihad in Islam?",
    correct: "A sincere inner struggle to do good and improve oneself in the way of Allah",
    distractors: ["Violence against people of other faiths", "A political movement against governments", "An act of terrorism"],
  },
  {
    q: "How does correct Islamic teaching distinguish Jihad from terrorism?",
    correct: "True Jihad seeks self-betterment and justice, while terrorism is explicitly condemned in Islam for harming innocent people",
    distractors: ["They mean exactly the same thing", "Terrorism is a form of Jihad encouraged in the Qur'an", "There is no difference according to Islamic teaching"],
  },
  {
    q: "Which of these is a common cause of terrorism and extremism identified in society?",
    correct: "Poverty, lack of education, and radicalisation through misinterpreted teachings",
    distractors: ["Regular attendance at school", "Strong family and community support", "Access to balanced religious education"],
  },
  {
    q: "What is an effect of terrorism and extremism on society?",
    correct: "Loss of life, fear, and damage to peaceful co-existence between communities",
    distractors: ["Increased trust between communities", "Economic growth and stability", "Stronger international cooperation"],
  },
  {
    q: "Which of these is a measure to curb terrorism and extremism?",
    correct: "Community education, dialogue, and countering radical narratives",
    distractors: ["Isolating entire communities from society", "Removing all religious education", "Ignoring the causes of radicalisation"],
  },
  {
    q: "Why is understanding the correct interpretation of Jihad important for peaceful co-existence?",
    correct: "It helps prevent the term from being misused to justify violence",
    distractors: ["It has no importance in modern society", "It only matters for religious scholars", "It encourages conflict between faiths"],
  },
];

export const contemporaryIssues: Skill = {
  id: "ire-mu-contemporary-issues",
  code: "MU.6",
  subjectId: "ire",
  strandId: "ire-muamalat",
  grade: 9,
  title: "Contemporary issues: Jihad, terrorism, and extremism",
  description: "Answer questions about the correct interpretation of Jihad, and the causes, effects, and measures to curb terrorism and extremism.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "categorize"] as const);

    if (branch === "categorize") {
      const trueJihad = shuffle(rng, TRUE_JIHAD).slice(0, 2);
      const terrorism = shuffle(rng, TERRORISM_EXTREMISM).slice(0, 2);
      const items = shuffle(rng, [
        ...trueJihad.map((s) => ({ id: s.label, label: s.label, bucket: "jihad", reason: s.reason })),
        ...terrorism.map((s) => ({ id: s.label, label: s.label, bucket: "terrorism", reason: s.reason })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "jihad", label: "Reflects true Jihad" },
          { id: "terrorism", label: "Terrorism/extremism (condemned by Islam)" },
        ],
        correctBucket,
        hint: "True Jihad is a personal struggle for good; terrorism and extremism harm others and are explicitly condemned in Islam.",
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
      hint: "Islamic teaching distinguishes true Jihad — a personal struggle for good — from terrorism and extremism, which it explicitly condemns.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
