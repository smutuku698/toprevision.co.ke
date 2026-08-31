import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 7.0 Learning Through Technology, sub-strand 7.2 Extensive Reading:
// Fiction and Non-Fiction Texts and Poems. Focus: select relevant reading materials, read for
// information and pleasure, judge materials by interest, complexity and subject; keep a reading record.
// See curriculum-reference/grade-5/english.json.

const FACTORS: { name: string; question: string }[] = [
  { name: "interest", question: "Do I actually want to read about this topic?" },
  { name: "language level", question: "Can I read most of the words without getting stuck?" },
  { name: "purpose", question: "Am I reading to learn something, or for pleasure — and does this book match?" },
  { name: "length", question: "Can I finish this in the time I have?" },
  { name: "subject", question: "Is this book really about what I need?" },
];

const GOOD_REASONS = [
  "I enjoy stories about space, and this novel is set on a spaceship.",
  "I can read a whole page of this book without stopping at hard words.",
  "I need facts about computers for my project, and this is an ICT book.",
  "It is a short poetry book, so I can finish it before the weekend.",
];
const POOR_REASONS = [
  "It has the shiniest cover on the shelf.",
  "It is the thickest book, so it must be the best.",
  "My friend is reading it, even though I find the words too hard.",
  "It was the first book I touched, so I took it.",
];

const NEEDS: { need: string; correct: string; wrong: string[] }[] = [
  {
    need: "You want a book for pleasure, you love adventure, and you have only two evenings free.",
    correct: "A short adventure story at your reading level.",
    wrong: ["A long, difficult history textbook.", "A poetry book about farming tools.", "An encyclopaedia volume about insects."],
  },
  {
    need: "You need information about how the internet works for a class talk next week.",
    correct: "A junior non-fiction book about computers and the internet.",
    wrong: ["A funny novel about a talking cat.", "A book of traditional folktales.", "A collection of love poems."],
  },
  {
    need: "You want to relax before bed and you find long books tiring.",
    correct: "A short book of poems you can dip into.",
    wrong: ["A 300-page science textbook.", "A dictionary.", "A very hard novel with tiny print."],
  },
];

export const choosingReadingMaterials: Skill = {
  id: "g5-eng-reading-choosing-materials",
  code: "R.7",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Choosing Reading Materials",
  description: "Choose a book that fits your interest, reading level, purpose and time, preview it before deciding, and keep a record of what you read.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-choose", "fill-factor", "sort-reason", "match", "order-preview", "reason"] as const);

    if (branch === "mc-choose") {
      const n = randChoice(rng, NEEDS);
      const { choices, correctIndex } = mcFromCluster(rng, n.correct, n.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, n.need, "Which book should you choose?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "Check interest, reading level, purpose and length all at once.",
        explanation: `"${n.correct}" fits the reader's interest, level, purpose and the time they have.`,
      };
    }

    if (branch === "fill-factor") {
      const f = randChoice(rng, FACTORS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the thing to check, in one or two words"),
        before: `Asking yourself "${f.question}" is checking a book's `,
        after: ".",
        correctAnswer: f.name,
        acceptedAnswers: [f.name, f.name.split(" ")[0]],
        inputMode: "text",
        hint: "The things to check are: interest, language level, purpose, length, subject.",
        explanation: `That question checks the book's ${f.name}.`,
      };
    }

    if (branch === "sort-reason") {
      const good = shuffle(rng, GOOD_REASONS).slice(0, 3).map((r, i) => ({ id: `g${i}`, label: r, kind: "good" }));
      const poor = shuffle(rng, POOR_REASONS).slice(0, 3).map((r, i) => ({ id: `p${i}`, label: r, kind: "poor" }));
      const items = shuffle(rng, [...good, ...poor]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each is a good reason or a poor reason for choosing a book"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "good", label: "Good reason to choose it" },
          { id: "poor", label: "Poor reason to choose it" },
        ],
        correctBucket,
        hint: "Good reasons are about interest, level, purpose and time. Poor reasons are about the cover, the thickness, or copying others.",
        explanation: "Choose a book because it interests you, you can read it, it suits your purpose, and you have time — not because of how it looks.",
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, FACTORS).slice(0, 5);
      const tokens = shuffle(rng, pool.map((f) => ({ id: f.name, label: f.name })));
      const targets = shuffle(rng, pool.map((f) => ({ id: f.name, label: f.question })));
      const correctMap: Record<string, string> = {};
      pool.forEach((f) => (correctMap[f.name] = f.name));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "thing to check to the question you ask yourself"),
        tokens,
        targets,
        correctMap,
        hint: "Each factor has its own question.",
        explanation: pool.map((f) => `${f.name}: "${f.question}"`).join("  "),
      };
    }

    if (branch === "order-preview") {
      const steps = [
        { id: "cover", label: "Look at the title and cover to see the topic" },
        { id: "blurb", label: "Read the back-cover blurb for the general idea" },
        { id: "contents", label: "Check the contents page or index for the subject you want" },
        { id: "sample", label: "Read a page to test the language level" },
        { id: "record", label: "Borrow it and write the title in your reading record" },
      ];
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps for previewing and choosing a book"),
        instruction: "Click the steps in the correct order.",
        items: shuffle(rng, steps),
        correctOrder: ["cover", "blurb", "contents", "sample", "record"],
        hint: "Overview first, then details, then keep a record.",
        explanation: "Title/cover → blurb → contents/index → sample a page → borrow and record it.",
      };
    }

    // reason — Evaluate a described choice.
    const scenarios = [
      { s: "A pupil picks the thickest book on the shelf because 'a big book means I will learn more', but the words are far too hard.", correct: "Choose an easier book on the same topic that you can actually read.", wrong: ["Keep the hard book; struggling is good.", "Only read the pictures.", "Pick an even thicker book."] },
      { s: "A pupil wants a fun read for the weekend but chooses a 400-page reference book.", correct: "Choose a short story or poetry book that fits the weekend.", wrong: ["Read the whole reference book by Monday.", "Give up reading for the weekend.", "Pick two more long books as well."] },
    ];
    const sc = randChoice(rng, scenarios);
    const { choices, correctIndex } = mcFromCluster(rng, sc.correct, sc.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, "What is the best advice?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "A book you cannot read, or cannot finish in time, is not a good choice — however impressive it looks.",
      explanation: sc.correct,
    };
  },
};
