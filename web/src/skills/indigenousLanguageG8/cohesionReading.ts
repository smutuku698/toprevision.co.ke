import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface ComprehensionQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface Passage {
  text: string;
  questions: ComprehensionQuestion[];
  trueFalse: { text: string; isTrue: boolean }[];
}

const PASSAGES: Passage[] = [
  {
    text: "During the annual cultural week at Moi Girls, pupils from different ethnic backgrounds share their languages, dances, and foods with the whole school. Last year, a Kalenjin pupil taught her classmates a traditional song, while a Luo pupil demonstrated a folk dance during the closing ceremony. The head teacher said the week reminds pupils that Kenya's many communities share the same country and the same future.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A school celebrating cultural diversity to build unity among pupils",
          "A school banning pupils from sharing their culture",
          "A school with pupils from only one ethnic community",
          "A school cancelling its cultural week",
        ],
        correctIndex: 0,
        explanation: "The passage describes cultural week, where pupils from different communities share their languages, dances, and foods to build unity.",
      },
      {
        prompt: "What does the head teacher's statement suggest about the purpose of cultural week?",
        choices: [
          "It is meant to remind pupils that different communities share a common future",
          "It is meant to separate pupils by ethnicity",
          "It is meant to rank cultures against each other",
          "It has no real purpose beyond entertainment",
        ],
        correctIndex: 0,
        explanation: "The head teacher's statement about a shared country and future implies the week's purpose is to build unity — an inference beyond the literal words.",
      },
    ],
    trueFalse: [
      { text: "Pupils from different ethnic backgrounds share their cultures during cultural week.", isTrue: true },
      { text: "A Luo pupil demonstrated a folk dance.", isTrue: true },
      { text: "The head teacher discourages pupils from sharing their cultures.", isTrue: false },
      { text: "Only one ethnic community attends the school.", isTrue: false },
    ],
  },
  {
    text: "After clashes over land disputes years ago, elders from the Pokot and Turkana communities began holding joint peace meetings twice a year. Young people from both communities now attend football tournaments organised specifically to bring them together. A youth leader from Turkana said the matches have created friendships that would have been unthinkable a decade ago.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "Two communities using peace meetings and football to build friendship after past conflict",
          "Two communities that refuse to communicate",
          "A land dispute that has never been addressed",
          "A football match that caused a new conflict",
        ],
        correctIndex: 0,
        explanation: "The passage describes how the Pokot and Turkana communities rebuilt relations through peace meetings and football tournaments.",
      },
      {
        prompt: "What can you infer about the impact of the joint football tournaments?",
        choices: [
          "They have helped build unlikely friendships between the two communities",
          "They have made relations between the communities worse",
          "They have been cancelled due to low interest",
          "They have no effect on relations between the communities",
        ],
        correctIndex: 0,
        explanation: "The youth leader's comment about friendships that would have been \"unthinkable a decade ago\" implies the tournaments have had a positive impact — an inference from his statement.",
      },
    ],
    trueFalse: [
      { text: "Elders from Pokot and Turkana hold joint peace meetings twice a year.", isTrue: true },
      { text: "Football tournaments bring young people from both communities together.", isTrue: true },
      { text: "The two communities have never had any conflict.", isTrue: false },
      { text: "The youth leader says the matches created no friendships.", isTrue: false },
    ],
  },
];

const VOCAB: { word: string; meaning: string }[] = [
  { word: "cohesion", meaning: "The state of people or groups sticking together in unity" },
  { word: "diversity", meaning: "The presence of many different kinds of people or cultures" },
  { word: "reconciliation", meaning: "The restoring of friendly relations after a disagreement or conflict" },
  { word: "tolerance", meaning: "The willingness to accept beliefs or practices different from one's own" },
  { word: "unity", meaning: "The state of being joined together as one" },
  { word: "coexist", meaning: "To live together peacefully despite differences" },
];

interface FillItem {
  before: string;
  after: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  hint: string;
  explanation: string;
}

const FILL_ITEMS: FillItem[] = [
  {
    before: "Kenya's many communities sticking together in unity despite their differences is an example of national",
    after: ".",
    correctAnswer: "cohesion",
    hint: "This word names the state of people sticking together in unity.",
    explanation: "'Cohesion' is the state of people or groups sticking together in unity.",
  },
  {
    before: "After the land dispute, the Pokot and Turkana elders worked toward",
    after: ", restoring friendly relations between their communities.",
    correctAnswer: "reconciliation",
    hint: "This word names the restoring of friendly relations after conflict.",
    explanation: "'Reconciliation' is the restoring of friendly relations after a disagreement or conflict.",
  },
  {
    before: "Accepting beliefs and practices different from your own shows",
    after: ".",
    correctAnswer: "tolerance",
    hint: "This word names the willingness to accept differences.",
    explanation: "'Tolerance' is the willingness to accept beliefs or practices different from one's own.",
  },
  {
    before: "When communities that differ in language and culture still manage to live together peacefully, we say they",
    after: "successfully.",
    correctAnswer: "coexist",
    hint: "This word means to live together peacefully despite differences.",
    explanation: "To 'coexist' means to live together peacefully despite differences.",
  },
];

const PEACE_STEPS: { id: string; label: string }[] = [
  { id: "dialogue", label: "Elders from both communities meet for dialogue after the conflict." },
  { id: "trust", label: "Joint activities, like football tournaments, slowly build trust." },
  { id: "friendship", label: "Young people from both communities form new friendships." },
  { id: "peace", label: "The communities coexist peacefully, sharing the same future." },
];

export const cohesionReading: Skill = {
  id: "g8-il-r-cohesion",
  code: "R.9",
  subjectId: "indigenous-language",
  strandId: "g8-il-reading",
  grade: 8,
  title: "Inter-ethnic cohesion: reading for information",
  description: "Build vocabulary about inter-ethnic cohesion and respond to texts about co-existing across cultures.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "categorize", "match", "fill", "order"] as const);

    if (branch === "mc") {
      const passage = randChoice(rng, PASSAGES);
      const q = randChoice(rng, passage.questions);
      const correctText = q.choices[q.correctIndex];
      const choices = shuffle(rng, q.choices);
      return {
        kind: "multiple-choice",
        passage: passage.text,
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: "Reread the passage — some answers are stated directly, others must be worked out from clues.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const passage = randChoice(rng, PASSAGES);
      const items = passage.trueFalse.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        passage: passage.text,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Check each statement against exactly what the passage says.",
        explanation: passage.trueFalse.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"} according to the passage.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each inter-ethnic cohesion word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the words used to describe communities living together peacefully.",
        explanation: chosen.map((v) => `${v.word} — ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: item.before,
        after: item.after,
        correctAnswer: item.correctAnswer,
        acceptedAnswers: item.acceptedAnswers,
        inputMode: "text",
        hint: item.hint,
        explanation: item.explanation,
      };
    }

    const items = shuffle(rng, PEACE_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the stages of building inter-ethnic cohesion after conflict, in the correct order.",
      instruction: "Click them in order.",
      items,
      correctOrder: PEACE_STEPS.map((s) => s.id),
      hint: "Dialogue between elders comes first, and peaceful coexistence is the final result.",
      explanation: PEACE_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
