import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { SCHOOL_VOCAB } from "./shared";

// Sub-strand 3.3 Guided Writing: Spelling — Theme: My Surrounding.
// Content: outlining school-facility vocabulary with correct spelling, forming words from jumbled
// letters, writing simple sentences describing school property (source examples: "the office is
// closed today", "the library is big"), and commonly misspelt words.

const SPELLING_ITEMS: { correct: string; wrong: string[]; meaning: string }[] = [
  { correct: "maktaba", wrong: ["maktabah", "maktaaba", "makteba"], meaning: "library" },
  { correct: "madrasa", wrong: ["madarasa", "madrassah", "madrasaa"], meaning: "school" },
  { correct: "mal'ab", wrong: ["mal'ub", "maalab", "mala'ab"], meaning: "playground" },
  { correct: "hadiqa", wrong: ["hadeeqa", "hadiqaa", "hadeeq"], meaning: "garden" },
  { correct: "bawwaba", wrong: ["bawaba", "bawwabaa", "bowaba"], meaning: "gate" },
  { correct: "hammam", wrong: ["hamam", "hammaam", "hamaam"], meaning: "washroom" },
  { correct: "sabbura", wrong: ["sabura", "sabburaa", "saboora"], meaning: "blackboard" },
  { correct: "mamarr", wrong: ["mamar", "mamarr'", "mammar"], meaning: "corridor" },
];

const JUMBLE_ITEMS: { scrambled: string; correct: string; meaning: string }[] = [
  { scrambled: "L-F-S-A", correct: "fasl", meaning: "classroom" },
  { scrambled: "T-K-B-A-M", correct: "maktab", meaning: "office" },
  { scrambled: "A-M-T-A", correct: "mat'a", meaning: "part of 'mat'am' (dining hall)" },
  { scrambled: "B-A-B-W-A", correct: "bawwab", meaning: "part of 'bawwaba' (gate)" },
  { scrambled: "D-I-Q-A-H", correct: "hadiq", meaning: "part of 'hadiqa' (garden)" },
  { scrambled: "M-A-H-M-A", correct: "hammam", meaning: "washroom" },
];

const SENTENCE_ITEMS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Al-maktab", "mughlaq", "al-yawm."], sentence: "Al-maktab mughlaq al-yawm. (The office is closed today.)" },
  { chunks: ["Al-maktaba", "kabeera."], sentence: "Al-maktaba kabeera. (The library is big.)" },
  { chunks: ["Al-mal'ab", "nadheef", "wa kabeer."], sentence: "Al-mal'ab nadheef wa kabeer. (The playground is clean and big.)" },
  { chunks: ["Al-bawwaba", "maftuha", "fi al-sabah."], sentence: "Al-bawwaba maftuha fi al-sabah. (The gate is open in the morning.)" },
  { chunks: ["Al-hammam", "qareeb", "min al-fasl."], sentence: "Al-hammam qareeb min al-fasl. (The washroom is near the classroom.)" },
  { chunks: ["Al-hadiqa", "jameela", "wa hadiqa."], sentence: "Al-hadiqa jameela wa hadiqa. (The garden is beautiful and quiet.)" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "The correct spelling for 'library' is ", after: ".", correct: "maktaba" },
  { before: "The correct spelling for 'playground' is ", after: ".", correct: "mal'ab" },
  { before: "The correct spelling for 'garden' is ", after: ".", correct: "hadiqa" },
  { before: "The correct spelling for 'gate' is ", after: ".", correct: "bawwaba" },
  { before: "The correct spelling for 'washroom' is ", after: ".", correct: "hammam" },
  { before: "The correct spelling for 'blackboard' is ", after: ".", correct: "sabbura" },
  { before: "The correct spelling for 'corridor' is ", after: ".", correct: "mamarr" },
  { before: "In 'the office is closed today', 'closed' is written as ", after: ".", correct: "mughlaq" },
];

export const surroundingWriting: Skill = {
  id: "g6-ar-w-surrounding",
  code: "W.3",
  subjectId: "arabic",
  strandId: "g6-ar-writing",
  grade: 6,
  title: "Guided writing: spelling (my surrounding)",
  description: "Practise the correct spelling of school-facility words, unscramble jumbled letters to form words, and write simple sentences describing school property.",
  generate(rng) {
    const branch = randChoice(rng, ["spelling", "jumble", "ordering", "fill", "categorize"] as const);

    if (branch === "spelling") {
      const item = randChoice(rng, SPELLING_ITEMS);
      const wrongPick = shuffle(rng, item.wrong).slice(0, 3);
      const choices = shuffle(rng, [item.correct, ...wrongPick]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, [
          `Which is the correctly spelled word for "${item.meaning}"?`,
          `Pick the correct spelling of "${item.meaning}".`,
          `Which spelling is correct for "${item.meaning}"?`,
          `Choose the accurately spelled word meaning "${item.meaning}".`,
        ]),
        choices,
        correctIndex: choices.indexOf(item.correct),
        layout: "row",
        hint: "Watch out for extra or missing letters — commonly misspelt words often have a doubled or dropped letter.",
        explanation: `The correct spelling is "${item.correct}" (${item.meaning}).`,
      };
    }

    if (branch === "jumble") {
      const item = randChoice(rng, JUMBLE_ITEMS);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, [
          `Unscramble these letters to form a school word: ${item.scrambled}`,
          `Rearrange these letters into a school-facility word: ${item.scrambled}`,
          `These letters are jumbled — form the correct word: ${item.scrambled}`,
          `Put these letters in order to spell a school word: ${item.scrambled}`,
        ]),
        before: "",
        after: "",
        correctAnswer: item.correct,
        inputMode: "text",
        hint: `This word is ${item.meaning}.`,
        explanation: `The unscrambled word is "${item.correct}" (${item.meaning}).`,
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, SENTENCE_ITEMS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Arrange the word groups to write this sentence correctly.",
          "Put these word groups in the correct order.",
          "Order the pieces to describe this school property correctly.",
          "Click the word groups in the order they belong.",
          "Rebuild this sentence about school property.",
        ]),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder: set.chunks.map((c, i) => `${i}-${c}`),
        hint: "The place word usually comes first, followed by its description.",
        explanation: `The correctly written sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, [
          "Fill in the missing word.",
          "Complete the sentence with correct spelling.",
          "What word completes this spelling fact?",
          "Fill the gap with the correctly spelled word.",
          "Complete this writing fact.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think carefully about the correct spelling of each school word.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    const CATEGORY_LOCATION: { word: string; where: "Indoor" | "Outdoor" }[] = [
      { word: "fasl", where: "Indoor" }, { word: "maktab", where: "Indoor" }, { word: "maktaba", where: "Indoor" },
      { word: "mat'am", where: "Indoor" }, { word: "hammam", where: "Indoor" }, { word: "mamarr", where: "Indoor" },
      { word: "ghurfat al-mu'allimeen", where: "Indoor" }, { word: "mal'ab", where: "Outdoor" },
      { word: "hadiqa", where: "Outdoor" }, { word: "bawwaba", where: "Outdoor" },
    ];
    const chosen = shuffle(rng, CATEGORY_LOCATION).slice(0, 7);
    const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.where));
    return {
      kind: "categorize",
      prompt: randChoice(rng, [
        "Before writing, sort each word you might describe: Indoor, or Outdoor?",
        "Group these school-property words by indoor vs outdoor.",
        "Which location type does each word belong to?",
        "Sort each word into the correct category before writing about it.",
        "Classify each school-property word below.",
      ]),
      items: shuffle(rng, items),
      buckets: [
        { id: "Indoor", label: "Indoor facility" },
        { id: "Outdoor", label: "Outdoor facility" },
      ],
      correctBucket,
      hint: "Classrooms, offices, and the library are indoor; playgrounds and gardens are outdoor.",
      explanation: chosen.map((c) => `"${c.word}" is ${c.where === "Indoor" ? "an indoor" : "an outdoor"} facility.`).join(" "),
    };
  },
};
