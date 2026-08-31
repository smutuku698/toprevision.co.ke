import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CATEGORIZE_PROMPTS = [
  "Sort each statement about child custody as True or False.",
  "Decide whether each statement about child custody is True or False.",
  "Sort these statements about child custody into True or False.",
  "Read each statement about child custody and sort it as True or False.",
  "Place each statement into the True or False bucket.",
  "Categorise each statement about child custody as True or False.",
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the main principle guiding Islamic rules on child custody?",
    correct: "The best interests and welfare of the child come first",
    distractors: ["Whichever parent is wealthier automatically gets custody", "The child's rights do not need to be considered", "Custody is decided by a coin toss"],
  },
  {
    q: "What responsibility do both parents continue to hold under Islamic teaching on custody?",
    correct: "A duty to care for and provide for their child's wellbeing",
    distractors: ["No responsibility once a divorce occurs", "Responsibility only until the child turns one", "Responsibility that ends if either parent remarries"],
  },
  {
    q: "Why does Islam provide specific rules on child custody?",
    correct: "To safeguard the child's rights and foster stable family bonds",
    distractors: ["To make custody arrangements as difficult as possible", "To remove children from both parents", "To discourage divorce by punishing children"],
  },
];

const STATEMENTS: { text: string; isTrue: boolean }[] = [
  { text: "In Islamic teaching on child custody, the best interests and welfare of the child come first.", isTrue: true },
  { text: "Both parents continue to hold a duty to care for their child's wellbeing after divorce.", isTrue: true },
  { text: "Islam provides rules on child custody to safeguard the child's rights and stable family bonds.", isTrue: true },
  { text: "Whichever parent is wealthier automatically gets custody in Islamic teaching.", isTrue: false },
  { text: "A parent's responsibility for their child ends once a divorce occurs.", isTrue: false },
  { text: "Islamic child custody rules exist to make arrangements as difficult as possible.", isTrue: false },
];

export const childCustody: Skill = {
  id: "ire-mu-child-custody",
  code: "MU.3",
  subjectId: "ire",
  strandId: "ire-muamalat",
  grade: 9,
  title: "Child custody",
  description: "Answer questions about Islamic rules on child custody.",
  generate(rng) {
    const hint = "Islamic rules on child custody are built around safeguarding the child's rights and wellbeing.";

    if (rng() < 0.4) {
      const chosen = shuffle(rng, STATEMENTS).slice(0, 5);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
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
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
