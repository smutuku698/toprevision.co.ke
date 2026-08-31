import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PRINT_TEXTS = ["A printed novel", "A daily newspaper", "A magazine", "A printed textbook", "A printed encyclopedia volume"];
const NON_PRINT_TEXTS = ["An audiobook", "A website article", "An e-book on a tablet", "A podcast episode", "A video documentary"];

const CRITERIA: { name: string; description: string }[] = [
  { name: "Interest", description: "Choosing a topic or story you genuinely want to read about" },
  { name: "Purpose", description: "Choosing a text that matches why you are reading — for facts, for fun, or for a task" },
  { name: "Reading level", description: "Choosing a text with language you can understand without too much difficulty" },
  { name: "Reliability", description: "Choosing a text from a trustworthy, accurate source" },
];

const SELECTION_STEPS = [
  { id: "purpose", label: "Decide your purpose for reading — information, enjoyment, or a school task" },
  { id: "skim", label: "Skim the title, cover, or introduction to judge if the topic interests you" },
  { id: "level", label: "Check that the language level suits how well you can read it" },
  { id: "reliable", label: "Consider whether the source is reliable and accurate" },
  { id: "begin", label: "Begin reading, and switch texts if it does not hold your interest" },
];

const FILL_ITEMS = [
  {
    before: "A podcast is listened to rather than read on a page, which makes it an example of a",
    after: "text.",
    correctAnswer: "non-print",
    acceptedAnswers: ["non print", "nonprint"],
  },
  {
    before: "Unlike an e-book, which is read on a screen, a printed newspaper made of paper and ink is an example of a",
    after: "text.",
    correctAnswer: "print",
  },
  {
    before: "Reading widely means reading a wide",
    after: "of texts, not just the same kind of book over and over.",
    correctAnswer: "range",
    acceptedAnswers: ["variety"],
  },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why should one read widely?",
    correct: "It exposes you to different ideas, information, and ways of using language",
    distractors: ["It guarantees you will never need to read again", "It only helps you pass exams and has no other benefit", "It matters only for people who want to become writers"],
  },
  {
    q: "What should one consider when selecting a reading text?",
    correct: "Whether the topic interests you, matches your purpose, suits your reading level, and comes from a reliable source",
    distractors: ["Only how long the book is", "Only the colour of the book cover", "Only whether a friend owns a copy"],
  },
  {
    q: "A student wants a text mainly for entertainment during the school holidays. What should they prioritise when choosing it?",
    correct: "Whether the story or topic genuinely interests them",
    distractors: ["Whether it is the longest book in the library", "Whether it was published very recently", "Whether it has the smallest font size"],
  },
  {
    q: "Why is it important to check that a source is reliable before reading it for information?",
    correct: "So you can trust that the facts you read are accurate and not misleading",
    distractors: ["Because reliable sources are always shorter", "Because unreliable sources are always non-print", "Because it makes the text more entertaining"],
  },
  {
    q: "Which of these is an example of reading for information rather than for enjoyment?",
    correct: "Reading a magazine article to learn how solar panels work",
    distractors: ["Reading a folktale to relax before bed", "Reading a poem written by a friend for fun", "Reading a comic strip during a break"],
  },
];

export const independentReading: Skill = {
  id: "g8-eng-r-independent-reading",
  code: "R.1",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Extensive Reading: Independent Reading",
  description: "Distinguish print from non-print texts, choose texts wisely, and appreciate the value of reading widely and for enjoyment.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "order", "fill", "mc"] as const);
    const hint = "Think about whether a text is read on paper or through a screen/audio device, and what makes a text worth choosing.";

    if (branch === "categorize") {
      const chosen = shuffle(rng, [
        ...PRINT_TEXTS.map((t) => ({ text: t, bucket: "Print" })),
        ...NON_PRINT_TEXTS.map((t) => ({ text: t, bucket: "Non-print" })),
      ]).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `t${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`t${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each text into Print or Non-print.",
        items,
        buckets: [
          { id: "Print", label: "Print" },
          { id: "Non-print", label: "Non-print" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is ${c.bucket === "Print" ? "a print text" : "a non-print text"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, CRITERIA.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, CRITERIA.map((c) => ({ id: c.name, label: c.description })));
      const correctMap: Record<string, string> = {};
      for (const c of CRITERIA) correctMap[c.name] = c.name;
      return {
        kind: "click-match",
        prompt: "Match each criterion for choosing a reading text to what it means.",
        tokens,
        targets,
        correctMap,
        hint: "A good text to choose usually matches your interest, your purpose, your reading level, and a reliable source.",
        explanation: CRITERIA.map((c) => `${c.name} — ${c.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, SELECTION_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for selecting a good reading text in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: SELECTION_STEPS.map((s) => s.id),
        hint: "Start by deciding why you are reading, then judge the text's interest and level, then check the source, then start reading.",
        explanation: SELECTION_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
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
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
