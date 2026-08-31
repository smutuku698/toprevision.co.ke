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
    text: "Peter wants to write a project about renewable energy in Kenya. He starts at the school library, checking the catalogue for books about solar and wind power. When he cannot find enough print sources, he searches a trusted educational website recommended by his teacher and notes down the web address for his reference list. Before opening any link, he checks that the website looks safe and does not ask for his personal details.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A pupil tracing information from both print and safe online sources for his project",
          "A pupil refusing to use the library",
          "A pupil sharing his personal details online",
          "A pupil copying a project without checking sources",
        ],
        correctIndex: 0,
        explanation: "Peter uses the library catalogue first, then a trusted website, carefully tracing sources for his project.",
      },
      {
        prompt: "Why does Peter check that a website looks safe before opening any link?",
        choices: [
          "To protect himself from harmful or untrustworthy sites while researching online",
          "Because his teacher forced him to close the website",
          "Because the website was too colourful",
          "Because he wanted to slow down his research",
        ],
        correctIndex: 0,
        explanation: "The passage shows Peter being cautious about safety, which is an inference about why he checks websites before opening links.",
      },
    ],
    trueFalse: [
      { text: "Peter starts his research at the school library.", isTrue: true },
      { text: "Peter checks that a website looks safe before opening a link.", isTrue: true },
      { text: "Peter shares his personal details with the website.", isTrue: false },
      { text: "Peter only uses print sources and no online sources at all.", isTrue: false },
    ],
  },
  {
    text: "Every Friday, Miss Achieng's class updates a reading log pinned on the classroom wall. Each pupil writes the title of the book they finished that week, the author's name, and one sentence about what they learned. Wanjiku has read twelve books this term and plans to read four more before the term ends. She says the log helps her see how far she has come and choose harder books next.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A class tracking their reading progress using a shared reading log",
          "A class banned from reading books",
          "A teacher reading all the books for the pupils",
          "A pupil who has never finished a book",
        ],
        correctIndex: 0,
        explanation: "The passage centres on the weekly reading log the class uses to record and track their reading.",
      },
      {
        prompt: "What can you infer about why Wanjiku values the reading log?",
        choices: [
          "It helps her track her progress and challenge herself with harder books",
          "It punishes her for reading too much",
          "It replaces the need to read entirely",
          "It only records the teacher's reading, not hers",
        ],
        correctIndex: 0,
        explanation: "Wanjiku says the log helps her see her progress and choose harder books, which is an inference about her motivation.",
      },
    ],
    trueFalse: [
      { text: "The class updates the reading log every Friday.", isTrue: true },
      { text: "Wanjiku has read twelve books this term.", isTrue: true },
      { text: "The reading log is updated once a year.", isTrue: false },
      { text: "Wanjiku plans to stop reading before the term ends.", isTrue: false },
    ],
  },
];

const VOCAB: { word: string; meaning: string }[] = [
  { word: "catalogue", meaning: "A list of items, such as books, organised so they can be searched" },
  { word: "reference", meaning: "A source of information mentioned to support facts in a piece of writing" },
  { word: "netiquette", meaning: "Polite and responsible behaviour when using the internet" },
  { word: "reading log", meaning: "A written record that tracks the books someone has read" },
  { word: "trustworthy", meaning: "Reliable and safe to depend on" },
  { word: "browse", meaning: "To look through resources such as books or websites without a fixed plan" },
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
    before: "Next week, Peter",
    after: "the library catalogue to trace two more books for his project.",
    correctAnswer: "will search",
    hint: "'Next week' points to an action that has not happened yet — the future tense uses 'will' plus the base verb.",
    explanation: "'Next week' signals the future tense, formed with 'will' plus the base verb: will search.",
  },
  {
    before: "Wanjiku",
    after: "four more books before the term ends.",
    correctAnswer: "will read",
    hint: "'Before the term ends' describes something that has not happened yet, so use the future tense with 'will'.",
    explanation: "The sentence describes a plan for later, so it uses the future tense: will read.",
  },
  {
    before: "Tomorrow, the class",
    after: "their reading log on the classroom wall.",
    correctAnswer: "will update",
    hint: "'Tomorrow' signals a future action, formed with 'will' plus the base verb.",
    explanation: "'Tomorrow' points to the future, so the verb is 'will update'.",
  },
  {
    before: "By next term, Peter",
    after: "his project using both print and online sources.",
    correctAnswer: "will finish",
    hint: "'By next term' describes something expected to happen later, so use 'will' plus the base verb.",
    explanation: "'By next term' signals the future tense: will finish.",
  },
];

const RESEARCH_STEPS: { id: string; label: string }[] = [
  { id: "topic", label: "Decide on a clear topic or question to research." },
  { id: "library", label: "Check the library catalogue or shelves for relevant books." },
  { id: "online", label: "Search a trusted website if print sources are not enough." },
  { id: "note", label: "Note down the source, such as the book title or web address, for reference." },
  { id: "log", label: "Record what was read or found in a reading log." },
];

export const ictLibrarySkillsReading: Skill = {
  id: "g8-il-r-ict",
  code: "R.2",
  subjectId: "indigenous-language",
  strandId: "g8-il-reading",
  grade: 8,
  title: "ICT and netiquette: extensive reading and library skills",
  description: "Trace print and online resources, track reading progress in a log, and practise the future tense.",
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
        hint: "Reread the passage — look for what is stated directly and what must be worked out from clues.",
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
        hint: "Match each statement carefully against exactly what the passage says.",
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
        prompt: "Match each ICT and library-skills word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about tracing information sources and behaving safely online.",
        explanation: chosen.map((v) => `${v.word} — ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing verb in the correct tense.",
        before: item.before,
        after: item.after,
        correctAnswer: item.correctAnswer,
        acceptedAnswers: item.acceptedAnswers,
        inputMode: "text",
        hint: item.hint,
        explanation: item.explanation,
      };
    }

    const items = shuffle(rng, RESEARCH_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the steps for tracing information for a project in the correct order.",
      instruction: "Click them in order.",
      items,
      correctOrder: RESEARCH_STEPS.map((s) => s.id),
      hint: "Start with deciding what to research, and finish with recording what was found.",
      explanation: RESEARCH_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
