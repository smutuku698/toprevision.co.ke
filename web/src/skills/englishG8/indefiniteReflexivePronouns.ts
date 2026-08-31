import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const REFLEXIVE: { subject: string; reflexive: string }[] = [
  { subject: "I", reflexive: "myself" },
  { subject: "you (one person)", reflexive: "yourself" },
  { subject: "he", reflexive: "himself" },
  { subject: "she", reflexive: "herself" },
  { subject: "it", reflexive: "itself" },
  { subject: "we", reflexive: "ourselves" },
  { subject: "you (more than one person)", reflexive: "yourselves" },
  { subject: "they", reflexive: "themselves" },
] as const;

const CATEGORIZE_POOL: { word: string; type: "indefinite" | "reflexive" }[] = [
  { word: "someone", type: "indefinite" },
  { word: "anything", type: "indefinite" },
  { word: "nobody", type: "indefinite" },
  { word: "everything", type: "indefinite" },
  { word: "somebody", type: "indefinite" },
  { word: "anyone", type: "indefinite" },
  { word: "no one", type: "indefinite" },
  { word: "everybody", type: "indefinite" },
  { word: "myself", type: "reflexive" },
  { word: "ourselves", type: "reflexive" },
  { word: "itself", type: "reflexive" },
  { word: "themselves", type: "reflexive" },
  { word: "herself", type: "reflexive" },
  { word: "yourselves", type: "reflexive" },
];

const FILL_REFLEXIVE: { before: string; subject: string; after: string; answer: string }[] = [
  { before: "The chameleon can camouflage ", subject: "it", after: " among the leaves to avoid predators.", answer: "itself" },
  { before: "We protected ", subject: "we", after: " from the charging buffalo by climbing a tree.", answer: "ourselves" },
  { before: "The lioness groomed ", subject: "she", after: " after the long hunt.", answer: "herself" },
  { before: "The elephants used mud to cool ", subject: "they", after: " down in the afternoon heat.", answer: "themselves" },
  { before: "I found ", subject: "I", after: " standing just metres from a grazing giraffe.", answer: "myself" },
  { before: "Rangers, you must always be able to defend ", subject: "you (more than one person)", after: " against dangerous wildlife.", answer: "yourselves" },
  { before: "The porcupine can defend ", subject: "it", after: " with its sharp quills.", answer: "itself" },
];

const INDEF_CONTEXT: { before: string; after: string; correct: string; distractors: string[]; note: string }[] = [
  {
    before: "Did you see ",
    after: " unusual on the game drive this morning?",
    correct: "anything",
    distractors: ["something", "nothing", "everything"],
    note: "In questions, we typically use the 'any-' form rather than the 'some-', 'no-', or 'every-' form.",
  },
  {
    before: "",
    after: " reported spotting a rare pangolin near the riverbank last night.",
    correct: "Someone",
    distractors: ["Anyone", "No one", "Nobody"],
    note: "In a positive statement, we typically use the 'some-' form to mean an unspecified person.",
  },
  {
    before: "",
    after: " was left of the herd's tracks after the heavy rain washed them away.",
    correct: "Nothing",
    distractors: ["Something", "Anything", "Everything"],
    note: "'Nothing' gives the sentence a negative meaning — not a single thing remained.",
  },
  {
    before: "",
    after: " in the group spotted the leopard hiding in the tree.",
    correct: "Everyone",
    distractors: ["Someone", "Anyone", "No one"],
    note: "'Everyone' means all the people in the group, without exception.",
  },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What are indefinite pronouns used for?",
    correct: "To refer to people or things without saying exactly who or what they are",
    distractors: [
      "To refer only to a specific, named person",
      "To show that an action is performed on the subject itself",
      "To replace all nouns in a sentence",
    ],
  },
  {
    q: "What are reflexive pronouns used for?",
    correct: "To show that the subject of a sentence performs an action on itself",
    distractors: [
      "To refer to an unspecified person or thing",
      "To join two independent clauses together",
      "To ask a question about the subject",
    ],
  },
  {
    q: "Why do we use indefinite pronouns?",
    correct: "To talk about people or things in a general way when their exact identity is unknown or unimportant",
    distractors: [
      "To make sentences longer without adding meaning",
      "Because proper nouns cannot be used in speech",
      "To avoid using any pronouns in a sentence",
    ],
  },
  {
    q: "Which reflexive pronoun correctly matches the subject 'they'?",
    correct: "themselves",
    distractors: ["ourselves", "yourselves", "itself"],
  },
];

export const indefiniteReflexivePronouns: Skill = {
  id: "g8-eng-g-indefinite-reflexive-pronouns",
  code: "G.7",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Word Classes: Indefinite and Reflexive Pronouns",
  description: "Identify and correctly use indefinite pronouns and reflexive pronouns in sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "fill", "indef-mc", "concept"] as const);

    if (branch === "categorize") {
      const indefinitePick = shuffle(rng, CATEGORIZE_POOL.filter((c) => c.type === "indefinite")).slice(0, 3);
      const reflexivePick = shuffle(rng, CATEGORIZE_POOL.filter((c) => c.type === "reflexive")).slice(0, 3);
      const chosen = shuffle(rng, [...indefinitePick, ...reflexivePick]);
      const buckets = [
        { id: "indefinite", label: "Indefinite pronoun" },
        { id: "reflexive", label: "Reflexive pronoun" },
      ];
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each pronoun as indefinite or reflexive.",
        items,
        buckets,
        correctBucket,
        hint: "Indefinite pronouns name an unspecified person or thing. Reflexive pronouns end in '-self' or '-selves' and refer back to the subject.",
        explanation: chosen.map((c) => `"${c.word}" is ${c.type === "indefinite" ? "an" : "a"} ${c.type} pronoun.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, REFLEXIVE).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.subject, label: r.subject })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.subject, label: r.reflexive })));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.subject] = r.subject;
      return {
        kind: "click-match",
        prompt: "Match each subject to the reflexive pronoun that agrees with it.",
        tokens,
        targets,
        correctMap,
        hint: "A reflexive pronoun must match the person and number of the subject it refers back to.",
        explanation: chosen.map((r) => `The subject "${r.subject}" takes the reflexive pronoun "${r.reflexive}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_REFLEXIVE);
      return {
        kind: "fill-blank",
        prompt: "Fill in the reflexive pronoun that correctly matches the subject of the sentence.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        inputMode: "text",
        hint: `The subject here is "${entry.subject}" — the reflexive pronoun must agree with it in person and number.`,
        explanation: `Since the subject is "${entry.subject}", the matching reflexive pronoun is "${entry.answer}": "${entry.before}${entry.answer}${entry.after}"`,
      };
    }

    if (branch === "indef-mc") {
      const entry = randChoice(rng, INDEF_CONTEXT);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which indefinite pronoun correctly completes this sentence? "${entry.before}___${entry.after}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Consider whether the sentence is a positive statement, a question, or a negative statement — this affects which form fits.",
        explanation: entry.note,
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Indefinite pronouns refer to unspecified people or things; reflexive pronouns refer back to the subject and match its person and number.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
