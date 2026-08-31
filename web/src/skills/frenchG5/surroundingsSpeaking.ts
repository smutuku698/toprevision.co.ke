import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { name, matchPrompt, sortPrompt, orderPrompt, fillPrompt, speakingScenarioCloser } from "./g5FrShared";

type Tag = "tool" | "furniture";

const ITEMS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "un cahier", meaning: "a notebook", tag: "tool" },
  { word: "un stylo", meaning: "a pen", tag: "tool" },
  { word: "un crayon", meaning: "a pencil", tag: "tool" },
  { word: "une règle", meaning: "a ruler", tag: "tool" },
  { word: "un livre", meaning: "a book", tag: "tool" },
  { word: "une gomme", meaning: "an eraser", tag: "tool" },
  { word: "une trousse", meaning: "a pencil case", tag: "tool" },
  { word: "un sac", meaning: "a bag", tag: "tool" },
  { word: "une table", meaning: "a table", tag: "furniture" },
  { word: "une chaise", meaning: "a chair", tag: "furniture" },
  { word: "un tableau", meaning: "a board", tag: "furniture" },
  { word: "une porte", meaning: "a door", tag: "furniture" },
  { word: "une fenêtre", meaning: "a window", tag: "furniture" },
  { word: "une armoire", meaning: "a cupboard", tag: "furniture" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Qu'est-ce que ", after: " ?", answer: "c'est", gloss: "Qu'est-ce que c'est ? — What is this?" },
  { before: "C'est un ", after: ".", answer: "cahier", gloss: "C'est un cahier. — This is a notebook." },
  { before: "C'est une ", after: ".", answer: "règle", gloss: "C'est une règle. — This is a ruler." },
  { before: "C'est un ", after: ".", answer: "stylo", gloss: "C'est un stylo. — This is a pen." },
  { before: "C'est une ", after: ".", answer: "gomme", gloss: "C'est une gomme. — This is an eraser." },
  { before: "C'est une ", after: ".", answer: "trousse", gloss: "C'est une trousse. — This is a pencil case." },
  { before: "C'est un ", after: ".", answer: "livre", gloss: "C'est un livre. — This is a book." },
  { before: "Oui, ", after: " un stylo.", answer: "c'est", gloss: "Oui, c'est un stylo. — Yes, it is a pen." },
  { before: "Non, ", after: " n'est pas un livre.", answer: "ce", gloss: "Non, ce n'est pas un livre. — No, it is not a book." },
  { before: "C'est une ", after: ".", answer: "chaise", gloss: "C'est une chaise. — This is a chair." },
  { before: "C'est un ", after: ".", answer: "tableau", gloss: "C'est un tableau. — This is a board." },
  { before: "C'est une ", after: ".", answer: "table", gloss: "C'est une table. — This is a table." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Qu'est-ce", "que", "c'est", "?"], sentence: "Qu'est-ce que c'est ?" },
  { chunks: ["C'est", "un", "cahier", "."], sentence: "C'est un cahier." },
  { chunks: ["C'est", "une", "règle", "."], sentence: "C'est une règle." },
  { chunks: ["Oui,", "c'est", "un", "stylo", "."], sentence: "Oui, c'est un stylo." },
  { chunks: ["Non,", "ce", "n'est", "pas", "un", "livre", "."], sentence: "Non, ce n'est pas un livre." },
  { chunks: ["C'est", "une", "trousse", "."], sentence: "C'est une trousse." },
];

const SCENARIOS: { situation: (n: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `You point at an unfamiliar object on ${n}'s desk and want to ask what it is.`,
    correct: "Qu'est-ce que c'est ?",
    distractors: ["C'est un cahier.", "Oui, c'est un stylo.", "C'est une chaise."],
    explanation: "'Qu'est-ce que c'est ?' asks 'What is this?' — the other options answer that question rather than asking it.",
  },
  {
    situation: (n) => `${n} asks what the object in your hand is, and it is a notebook.`,
    correct: "C'est un cahier.",
    distractors: ["C'est un livre.", "C'est une règle.", "Qu'est-ce que c'est ?"],
    explanation: "'C'est un cahier' answers with 'notebook' specifically — the other named objects are a book or a ruler instead.",
  },
  {
    situation: (n) => `${n} asks if the tool you're holding is a pen, and it really is a pen.`,
    correct: "Oui, c'est un stylo.",
    distractors: ["Non, ce n'est pas un livre.", "C'est une gomme.", "C'est un crayon."],
    explanation: "'Oui, c'est un stylo' confirms with 'yes' that it is indeed a pen — the others either deny a different guess or name a different object.",
  },
  {
    situation: (n) => `${n} guesses the item is a book, but it is actually a ruler.`,
    correct: "Non, ce n'est pas un livre.",
    distractors: ["Oui, c'est un stylo.", "C'est une règle.", "Qu'est-ce que c'est ?"],
    explanation: "'Non, ce n'est pas un livre' correctly denies the wrong guess — 'C'est une règle' would answer the guess but doesn't itself say no.",
  },
  {
    situation: (n) => `${n} asks what tool erases pencil marks, and you're holding one.`,
    correct: "C'est une gomme.",
    distractors: ["C'est un stylo.", "C'est un cahier.", "C'est une règle."],
    explanation: "'C'est une gomme' names the eraser — a pen, notebook, and ruler don't erase pencil marks.",
  },
  {
    situation: (n) => `${n} asks what you carry your pens and pencils in.`,
    correct: "C'est une trousse.",
    distractors: ["C'est un sac.", "C'est une gomme.", "C'est un livre."],
    explanation: "'C'est une trousse' names the pencil case specifically — 'un sac' is a larger bag, a different item.",
  },
  {
    situation: (n) => `${n} asks what large item carries all your school things to class.`,
    correct: "C'est un sac.",
    distractors: ["C'est une trousse.", "C'est un cahier.", "C'est une table."],
    explanation: "'C'est un sac' names the school bag — 'une trousse' only holds pens and pencils, a smaller item.",
  },
  {
    situation: (n) => `${n} asks what you write your homework notes into, and it's your notebook.`,
    correct: "C'est un cahier.",
    distractors: ["C'est un livre.", "C'est un stylo.", "C'est une trousse."],
    explanation: "'C'est un cahier' names a notebook for writing in — 'un livre' is a printed book you read, not write into.",
  },
  {
    situation: (n) => `${n} asks what the teacher writes on at the front of the classroom.`,
    correct: "C'est un tableau.",
    distractors: ["C'est une table.", "C'est une porte.", "C'est une chaise."],
    explanation: "'C'est un tableau' names the board — a table and chair are furniture the teacher doesn't write on.",
  },
  {
    situation: (n) => `${n} asks what you sit on during class.`,
    correct: "C'est une chaise.",
    distractors: ["C'est une table.", "C'est un tableau.", "C'est une fenêtre."],
    explanation: "'C'est une chaise' names the chair, which you sit on — a table is what you write on, not sit on.",
  },
  {
    situation: (n) => `${n} asks what you knock on before entering the classroom.`,
    correct: "C'est une porte.",
    distractors: ["C'est une fenêtre.", "C'est une armoire.", "C'est une chaise."],
    explanation: "'C'est une porte' names the door, which you knock on — a window and cupboard are different classroom features.",
  },
  {
    situation: (n) => `${n} asks where the exercise books are stored at the back of the room.`,
    correct: "C'est une armoire.",
    distractors: ["C'est une porte.", "C'est une fenêtre.", "C'est une table."],
    explanation: "'C'est une armoire' names the cupboard used for storage — a door, window, and table don't store books.",
  },
  {
    situation: (n) => `${n} asks what lets sunlight into the classroom.`,
    correct: "C'est une fenêtre.",
    distractors: ["C'est une porte.", "C'est un tableau.", "C'est une armoire."],
    explanation: "'C'est une fenêtre' names the window, which lets in light — a door is for walking through, not primarily for light.",
  },
];

export const surroundingsSpeaking: Skill = {
  id: "g5-fr-ls-surroundings",
  code: "LS.3",
  subjectId: "french",
  strandId: "g5-fr-listening-speaking",
  grade: 5,
  title: "Classroom objects and my surroundings",
  description: "Naming classroom tools and furniture in French, and asking/answering 'Qu'est-ce que c'est ?' — practiced through matching, sorting, and speaking scenarios.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "French classroom-item word to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Tools are things you write or work with; furniture is fixed in the room.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const tools = shuffle(rng, ITEMS.filter((p) => p.tag === "tool")).slice(0, 4);
      const furniture = shuffle(rng, ITEMS.filter((p) => p.tag === "furniture")).slice(0, 4);
      const items = shuffle(rng, [...tools, ...furniture]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "each classroom word as a School Tool or Furniture"),
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "tool", label: "School Tool" },
          { id: "furniture", label: "Furniture" },
        ],
        correctBucket,
        hint: "School tools go in your bag; furniture stays fixed in the classroom.",
        explanation: [...tools, ...furniture]
          .map((p) => `"${p.word}" is a ${p.tag === "tool" ? "school tool" : "piece of furniture"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the 'Qu'est-ce que c'est ? C'est un/une… Oui/Non c'est…' pattern.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to form a correct French sentence about classroom items"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'C'est un/une…' names an item; 'Qu'est-ce que c'est ?' asks what it is.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const n = name(rng);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(n)} ${speakingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about which specific classroom object the situation is describing.",
      explanation: s.explanation,
    };
  },
};
