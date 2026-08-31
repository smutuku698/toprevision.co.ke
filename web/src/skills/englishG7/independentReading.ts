import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PURPOSE_TEXT_TYPES: { purpose: string; textType: string }[] = [
  { purpose: "Wanting to relax and enjoy a story after finishing homework", textType: "A story book (novel)" },
  { purpose: "Needing to find out the boiling point of water for a science project", textType: "An encyclopedia or reference book" },
  { purpose: "Wanting to learn the steps for repairing a bicycle puncture", textType: "An instruction manual or how-to guide" },
  { purpose: "Wanting to keep up with the latest football scores", textType: "A newspaper sports page" },
  { purpose: "Wanting to learn interesting facts about Kenyan history for fun", textType: "A non-fiction book on Kenyan history" },
];

const HABITS: { text: string; bucket: "good" | "poor" }[] = [
  { text: "Keeping a personal record of the books you have read and finished", bucket: "good" },
  { text: "Setting a personal goal to read a few pages every single day", bucket: "good" },
  { text: "Returning borrowed library books on time and in good condition", bucket: "good" },
  { text: "Choosing a book that genuinely matches your own reading level and interests", bucket: "good" },
  { text: "Giving up on every book after reading only its first page", bucket: "poor" },
  { text: "Choosing a book only because a friend is reading it, without checking if it interests you", bucket: "poor" },
  { text: "Damaging or losing a borrowed book without telling anyone", bucket: "poor" },
];

const SCENARIO_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Wanjiru enjoys stories about wildlife and can comfortably read books written for her grade level. She wants something to read purely for enjoyment over the weekend. Which book should she choose?",
    correct: "A Grade 7-level story about a girl who rescues an injured cheetah",
    distractors: [
      "A university-level scientific journal about cheetah anatomy",
      "A car repair manual with no stories in it at all",
      "A picture book written for toddlers about farm animals",
    ],
    explanation: "This book matches all three factors: it fits her interest in wildlife, her own reading level, and her purpose of reading for enjoyment.",
  },
  {
    q: "Otieno needs to write a school project on how mobile money works in Kenya. Which resource is most appropriate for his purpose?",
    correct: "A newspaper article explaining how mobile money services work",
    distractors: ["A collection of romantic poems", "A comic book about superheroes", "A novel set in ancient Egypt"],
    explanation: "Otieno's purpose is research on a specific topic, so the newspaper article giving practical information about mobile money is the appropriate choice.",
  },
  {
    q: "Amina picks up a novel written far above her own reading level, full of words she does not understand, even though the topic interests her. What should a responsible independent reader do?",
    correct: "Choose a book on the same topic that is closer to her own reading level",
    distractors: [
      "Force herself through it without understanding most sentences",
      "Give up on independent reading altogether",
      "Ask someone to read the whole book aloud to her instead",
    ],
    explanation: "A book's difficulty level matters as much as interest — choosing a similar-topic book she can actually read builds the habit of independent reading.",
  },
  {
    q: "Baraka wants practical steps for planting tomatoes in his family's kitchen garden. Which text best fits his purpose?",
    correct: "A simple gardening guide with numbered planting instructions",
    distractors: ["A storybook about a boy who moves to the city", "A book of riddles and jokes", "A biography of a musician"],
    explanation: "Baraka's purpose is practical information, so a gardening guide with clear instructions suits his need far better than fiction or entertainment texts.",
  },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Which three factors should guide a responsible reader's choice of an independent reading text?",
    correct: "Their own interest in the topic, the text's difficulty level, and their purpose for reading",
    distractors: [
      "The colour of the book's cover only",
      "How many pages the book has, regardless of its content",
      "Whichever book happens to be the most expensive in the shop",
    ],
  },
  {
    q: "Why is independent reading valuable for lifelong learning?",
    correct: "It builds a habit of reading for information and enjoyment that continues well beyond school",
    distractors: [
      "It is only useful during examination weeks",
      "It replaces the need to ever read a textbook again",
      "It is a habit that is only required until a learner turns twelve",
    ],
  },
  {
    q: "What does it mean to take personal responsibility for your own independent reading?",
    correct: "Choosing your own reading materials wisely and keeping to a regular reading routine without being reminded",
    distractors: [
      "Reading only when a teacher is standing over you",
      "Letting someone else choose every book you read",
      "Reading a book once and never reading again",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "A responsible reader checks that a book's difficulty", after: "matches their own reading ability before choosing it.", correctAnswer: "level" },
  { before: "Before choosing an independent reading book, a responsible learner first decides their reading", after: "— is it for research, enjoyment, or practical information?", correctAnswer: "purpose" },
  { before: "Keeping a personal reading", after: "helps a learner track which books they have already read and enjoyed.", correctAnswer: "record" },
];

const ORDER_STEPS = [
  { id: "purpose", label: "Decide your purpose for reading — research, enjoyment, or practical information" },
  { id: "level", label: "Check the book's difficulty level against your own reading ability" },
  { id: "skim", label: "Skim the blurb or the first page to see if the topic genuinely interests you" },
  { id: "choose", label: "Choose the book and note it in your personal reading record" },
  { id: "finish", label: "Read a little each day and return the book on time when you are finished" },
];

export const independentReading: Skill = {
  id: "g7-eng-r-independent-reading",
  code: "R.1",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Extensive Reading: Independent Reading",
  description: "Identify a variety of texts for independent reading, match reading purpose to text type, and build responsible independent-reading habits.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "scenario", "concept", "fill", "order"] as const);
    const hint = "A good independent reading choice fits your interest, matches your reading level, and suits your purpose for reading.";

    if (branch === "match") {
      const chosen = shuffle(rng, PURPOSE_TEXT_TYPES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.purpose, label: v.purpose })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.purpose, label: v.textType })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.purpose] = v.purpose;
      return {
        kind: "click-match",
        prompt: "Match each reading purpose to the text type that would best serve it.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((v) => `"${v.purpose}" → ${v.textType}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosenGood = shuffle(rng, HABITS.filter((h) => h.bucket === "good")).slice(0, 3);
      const chosenPoor = shuffle(rng, HABITS.filter((h) => h.bucket === "poor")).slice(0, 2);
      const chosen = shuffle(rng, [...chosenGood, ...chosenPoor]);
      const items = chosen.map((h, i) => ({ id: `h${i}`, label: h.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((h, i) => (correctBucket[`h${i}`] = h.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each behaviour into Responsible reading habit or Irresponsible reading habit.",
        items,
        buckets: [
          { id: "good", label: "Responsible reading habit" },
          { id: "poor", label: "Irresponsible reading habit" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((h) => `"${h.text}" is a${h.bucket === "good" ? " responsible" : "n irresponsible"} habit.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const entry = randChoice(rng, SCENARIO_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "concept") {
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
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about independent reading.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    const items = shuffle(rng, ORDER_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the steps a responsible learner follows when choosing an independent reading book, in the correct order.",
      instruction: "Click them in order.",
      items,
      correctOrder: ORDER_STEPS.map((s) => s.id),
      hint: "Start with your purpose, then check difficulty and interest, then read responsibly to the end.",
      explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
