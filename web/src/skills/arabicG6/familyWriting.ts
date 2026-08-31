import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { FAMILY_VOCAB } from "./shared";

// Sub-strand 3.2 Guided Writing: Writing Styles — Theme: Family.
// Content: outlining family member's names, writing short paragraphs using appropriate signs
// (harakat), placing correct signs in words related to family members.

const HARAKAT_FAMILY_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "You are writing 'ab' (father) — which sign, and where, shows its short 'a' sound?", correct: "fatha, above the first letter", distractors: ["kasra, below the first letter", "damma, above the first letter", "sukun, above the first letter"], explanation: "The short 'a' in 'ab' uses fatha, written above the letter." },
  { question: "You are writing 'umm' (mother) — which sign, and where, shows its short 'u' sound?", correct: "damma, above the first letter", distractors: ["fatha, above the first letter", "kasra, below the first letter", "sukun, above the first letter"], explanation: "The short 'u' in 'umm' uses damma, written above the letter." },
  { question: "You are writing 'ibn' (son) — which sign, and where, shows its short 'i' sound?", correct: "kasra, below the first letter", distractors: ["fatha, above the first letter", "damma, above the first letter", "sukun, above the first letter"], explanation: "The short 'i' in 'ibn' uses kasra, written below the letter." },
  { question: "You are writing 'bint' (daughter) — which sign, and where, shows its short 'i' sound?", correct: "kasra, below the first letter", distractors: ["fatha, above the first letter", "damma, above the first letter", "sukun, above the first letter"], explanation: "The short 'i' in 'bint' uses kasra, written below the letter." },
  { question: "You are writing 'jadd' (grandfather) — which sign, and where, shows its short 'a' sound?", correct: "fatha, above the first letter", distractors: ["kasra, below the first letter", "damma, above the first letter", "sukun, above the first letter"], explanation: "The short 'a' in 'jadd' uses fatha, written above the letter." },
  { question: "You are writing 'amm' (paternal uncle) — which sign, and where, shows its short 'a' sound?", correct: "fatha, above the first letter", distractors: ["kasra, below the first letter", "damma, above the first letter", "sukun, above the first letter"], explanation: "The short 'a' in 'amm' uses fatha, written above the letter." },
  { question: "In 'ab', which letter would carry a sukun (no-vowel sign) if you wrote the final consonant with no vowel after it?", correct: "the letter b, at the end of the word", distractors: ["the letter a, at the start", "no letter needs sukun in this word", "every letter needs sukun"], explanation: "A word-final consonant with no vowel sound after it is marked with sukun." },
  { question: "Which two of the four basic signs are BOTH written above the letter?", correct: "fatha and damma", distractors: ["kasra and sukun", "fatha and kasra", "damma and kasra"], explanation: "fatha and damma both sit above the letter; kasra sits below the letter." },
  { question: "When writing family words neatly, why must a sign be placed in the correct spot (above or below)?", correct: "placing it in the wrong spot changes or removes the correct vowel sound", distractors: ["it only affects how pretty the writing looks", "signs can be placed anywhere without changing meaning", "signs are optional and never checked"], explanation: "The position of a sign (above vs below the letter) is what tells the reader which vowel sound to use." },
  { question: "You are writing 'khaal' (maternal uncle) — the long 'aa' sound in the middle is shown using which kind of mark?", correct: "a long-vowel mark (madda), not a short-vowel sign", distractors: ["fatha", "kasra", "damma"], explanation: "A long vowel sound uses an elongation mark (madda), different from the short-vowel signs fatha/kasra/damma." },
];

const SPELLING_ITEMS: { correct: string; wrong: string[]; meaning: string }[] = [
  { correct: "ummi", wrong: ["ummy", "aumi", "ummii"], meaning: "my mother" },
  { correct: "jaddati", wrong: ["jadatii", "jaddaty", "jadati"], meaning: "my grandmother" },
  { correct: "khaali", wrong: ["khaaly", "khaali'", "khali"], meaning: "my maternal uncle" },
  { correct: "ukhti", wrong: ["ukhtii", "ukhty", "uktih"], meaning: "my sister" },
  { correct: "binti", wrong: ["bintii", "binty", "bintee"], meaning: "my daughter" },
  { correct: "ammati", wrong: ["ammaty", "amaty", "ammatii"], meaning: "my paternal aunt" },
  { correct: "akhi", wrong: ["akhy", "akhee", "aakhi"], meaning: "my brother" },
  { correct: "ibni", wrong: ["ibny", "ibnii", "ebni"], meaning: "my son" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Abi", "muhandis,", "wa ummi", "mu'allima."], sentence: "Abi muhandis, wa ummi mu'allima. (My father is an engineer, and my mother is a teacher.)" },
  { chunks: ["Jaddi", "fallah,", "wa jaddati", "tatbakhu jayyidan."], sentence: "Jaddi fallah, wa jaddati tatbakhu jayyidan. (My grandfather is a farmer, and my grandmother cooks well.)" },
  { chunks: ["Akhi", "yal'abu", "kurat al-qadam", "kulla yawm."], sentence: "Akhi yal'abu kurat al-qadam kulla yawm. (My brother plays football every day.)" },
  { chunks: ["Khaali", "yaskunu", "ba'eedan", "'anna."], sentence: "Khaali yaskunu ba'eedan 'anna. (My maternal uncle lives far from us.)" },
  { chunks: ["Ukhti", "tuhibbu", "al-qiraa'a", "kathiran."], sentence: "Ukhti tuhibbu al-qiraa'a kathiran. (My sister loves reading a lot.)" },
  { chunks: ["Ammati", "tadrusu", "al-tibb", "fi al-jami'a."], sentence: "Ammati tadrusu al-tibb fi al-jami'a. (My paternal aunt studies medicine at university.)" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "The short 'a' sign in 'ab' is called ", after: ", written above the letter.", correct: "fatha" },
  { before: "The short 'u' sign in 'umm' is called ", after: ", written above the letter.", correct: "damma" },
  { before: "The short 'i' sign in 'ibn' is called ", after: ", written below the letter.", correct: "kasra" },
  { before: "A no-vowel sign, written above a letter, is called ", after: ".", correct: "sukun" },
  { before: "To write 'my grandmother' you write ", after: ".", correct: "jaddati" },
  { before: "To write 'my brother' you write ", after: ".", correct: "akhi" },
  { before: "To write 'my sister' you write ", after: ".", correct: "ukhti" },
  { before: "To write 'my maternal uncle' you write ", after: ".", correct: "khaali" },
];

export const familyWriting: Skill = {
  id: "g6-ar-w-family",
  code: "W.2",
  subjectId: "arabic",
  strandId: "g6-ar-writing",
  grade: 6,
  title: "Guided writing: writing styles (family)",
  description: "Practise placing Arabic signs (harakat) correctly in family words, spell 'my ___' family words accurately, and write short sentences about family members.",
  generate(rng) {
    const branch = randChoice(rng, ["harakat", "spelling", "ordering", "fill", "categorize"] as const);

    if (branch === "harakat") {
      const q = randChoice(rng, HARAKAT_FAMILY_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.question,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "fatha/damma sit above the letter; kasra sits below; sukun (a circle) marks no vowel.",
        explanation: q.explanation,
      };
    }

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
        hint: "Look carefully at the ending letters — the 'my ___' form always ends in a single 'i'.",
        explanation: `The correct spelling is "${item.correct}" (${item.meaning}).`,
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Arrange the word groups to write this sentence correctly.",
          "Put these word groups in the correct order.",
          "Order the pieces to form a correct sentence about a family member.",
          "Click the word groups in the order they belong.",
          "Rebuild this family sentence in the correct order.",
        ]),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder: set.chunks.map((c, i) => `${i}-${c}`),
        hint: "The family word comes first, followed by the description.",
        explanation: `The correctly written sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, [
          "Fill in the missing word.",
          "Complete the sentence correctly.",
          "What word completes this writing fact?",
          "Fill the gap with the correct word.",
          "Complete this fact about writing family words.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about sign names and the family words you've practised writing.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    const nuclear = new Set(["ab", "umm", "akh", "ukht", "ibn", "bint"]);
    const chosen = shuffle(rng, FAMILY_VOCAB).slice(0, 8);
    const items = chosen.map((p, i) => ({ id: `${i}-${p.word}`, label: p.word }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((p, i) => (correctBucket[`${i}-${p.word}`] = nuclear.has(p.word) ? "Nuclear" : "Extended"));
    return {
      kind: "categorize",
      prompt: randChoice(rng, [
        "Before writing a family paragraph, outline each word: Nuclear or Extended family?",
        "Group these family words the way you would plan a written paragraph.",
        "Sort each word into the correct family category.",
        "Classify each family word before writing about it.",
        "Which category would you write each word under?",
      ]),
      items: shuffle(rng, items),
      buckets: [
        { id: "Nuclear", label: "Nuclear family" },
        { id: "Extended", label: "Extended family" },
      ],
      correctBucket,
      hint: "Nuclear family = parents, siblings, children. Extended family = grandparents, uncles, aunts.",
      explanation: chosen.map((p) => `"${p.word}" (${p.meaning}) is ${nuclear.has(p.word) ? "nuclear" : "extended"} family.`).join(" "),
    };
  },
};
