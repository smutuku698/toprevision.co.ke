import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { GREETING_VOCAB, HARAKAT } from "./shared";

// Sub-strand 3.1 Guided Writing: Handwriting — Theme: Greetings and Introduction.
// Content: re-writing sentences with correct word spacing, writing paragraphs neatly and legibly,
// and writing words with the correct signs (harakat) — the writing-mechanics angle on the same
// harakat concept introduced (recognition) at 1.1/2.1.

const SPACING_ITEMS: { correct: string; squished: string; brokenUp: string; meaning: string }[] = [
  { correct: "sabah al-khair", squished: "sabahal-khair", brokenUp: "sa bah al kha ir", meaning: "good morning" },
  { correct: "kayfa haaluk", squished: "kayfahaaluk", brokenUp: "kay fa haa luk", meaning: "how are you" },
  { correct: "min fadlik", squished: "minfadlik", brokenUp: "mi n fad lik", meaning: "please" },
  { correct: "maa as-salama", squished: "maaas-salama", brokenUp: "ma a as sal ama", meaning: "goodbye" },
  { correct: "ahlan wa sahlan", squished: "ahlanwasahlan", brokenUp: "ah lan wa sah lan", meaning: "welcome" },
  { correct: "ismi Amina", squished: "ismiamina", brokenUp: "is mi Am ina", meaning: "my name is Amina" },
  { correct: "masaa al-khair", squished: "masaaal-khair", brokenUp: "ma saa al kha ir", meaning: "good evening" },
  { correct: "bikhair shukran", squished: "bikhairshukran", brokenUp: "bi khair shuk ran", meaning: "I am fine, thank you" },
  { correct: "tasharrafna jiddan", squished: "tasharrafnajiddan", brokenUp: "tashar rafna jid dan", meaning: "very nice to meet you" },
  { correct: "afwan jazeelan", squished: "afwanjazeelan", brokenUp: "af wan ja zee lan", meaning: "you're very welcome" },
];

const HARAKAT_WRITE_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "When writing a short 'a' sound, where do you place the fatha sign?", correct: "above the letter", distractors: ["below the letter", "after the word", "inside the letter"], explanation: "fatha is written as a small diagonal stroke above the letter." },
  { question: "When writing a short 'i' sound, where do you place the kasra sign?", correct: "below the letter", distractors: ["above the letter", "after the word", "inside the letter"], explanation: "kasra is written as a small diagonal stroke below the letter." },
  { question: "When writing a short 'u' sound, where do you place the damma sign?", correct: "above the letter", distractors: ["below the letter", "after the word", "inside the letter"], explanation: "damma is written as a small curl above the letter." },
  { question: "When a letter has no vowel sound, which sign do you write above it?", correct: "sukun", distractors: ["fatha", "kasra", "damma"], explanation: "sukun (a small circle above the letter) shows there is no vowel sound." },
  { question: "Which sign would you write above a letter to show it has NO vowel?", correct: "sukun", distractors: ["fatha", "kasra", "damma"], explanation: "sukun marks the absence of a vowel." },
  { question: "You are writing the sound 'mu' — which sign goes above the letter?", correct: "damma", distractors: ["fatha", "kasra", "sukun"], explanation: "The short 'u' sound uses damma, written above the letter." },
  { question: "You are writing the sound 'mi' — which sign goes below the letter?", correct: "kasra", distractors: ["fatha", "damma", "sukun"], explanation: "The short 'i' sound uses kasra, written below the letter." },
  { question: "You are writing the sound 'ma' — which sign goes above the letter?", correct: "fatha", distractors: ["kasra", "damma", "sukun"], explanation: "The short 'a' sound uses fatha, written above the letter." },
  { question: "Which two signs are BOTH written above a letter (not below)?", correct: "fatha and damma", distractors: ["kasra and sukun", "fatha and kasra", "damma and kasra"], explanation: "fatha and damma both sit above the letter; kasra sits below." },
  { question: "Which sign is written BELOW a letter, unlike the other three signs?", correct: "kasra", distractors: ["fatha", "damma", "sukun"], explanation: "kasra is the only one of the four basic signs written below the letter." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["sabah al-khair,", "kayfa", "haaluk?"], sentence: "sabah al-khair, kayfa haaluk? (Good morning, how are you?)" },
  { chunks: ["ismi", "Amina,", "tasharrafna."], sentence: "ismi Amina, tasharrafna. (My name is Amina, nice to meet you.)" },
  { chunks: ["min fadlik,", "maa", "ismuk?"], sentence: "min fadlik, maa ismuk? (Please, what is your name?)" },
  { chunks: ["bikhair,", "shukran.", "wa anta?"], sentence: "bikhair, shukran. wa anta? (I am fine, thank you. And you?)" },
  { chunks: ["ahlan", "wa sahlan,", "maa as-salama."], sentence: "ahlan wa sahlan, maa as-salama. (Welcome, goodbye.)" },
  { chunks: ["masaa al-khair,", "afwan,", "shukran."], sentence: "masaa al-khair, afwan, shukran. (Good evening, you're welcome, thank you.)" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "The sign written above a letter for a short 'a' sound is called ", after: ".", correct: "fatha" },
  { before: "The sign written below a letter for a short 'i' sound is called ", after: ".", correct: "kasra" },
  { before: "The sign written above a letter for a short 'u' sound is called ", after: ".", correct: "damma" },
  { before: "The small circle written above a letter with no vowel is called ", after: ".", correct: "sukun" },
  { before: "When re-writing 'sabahalkhair' with correct spacing, it becomes 'sabah al-", after: "'.", correct: "khair" },
  { before: "When re-writing 'minfadlik' with correct spacing, it becomes 'min ", after: "'.", correct: "fadlik" },
  { before: "When re-writing 'kayfahaaluk' with correct spacing, it becomes 'kayfa ", after: "'.", correct: "haaluk" },
  { before: "When re-writing 'maaassalama' with correct spacing, it becomes 'maa as-", after: "'.", correct: "salama" },
];

export const greetingsWriting: Skill = {
  id: "g6-ar-w-greetings",
  code: "W.1",
  subjectId: "arabic",
  strandId: "g6-ar-writing",
  grade: 6,
  title: "Guided writing: handwriting (greetings and introduction)",
  description: "Practise correct word spacing and neat, legible writing of greeting and introduction phrases, and where to place Arabic signs (harakat) when writing.",
  generate(rng) {
    const branch = randChoice(rng, ["spacing", "harakat", "ordering", "fill", "categorize"] as const);

    if (branch === "spacing") {
      const item = randChoice(rng, SPACING_ITEMS);
      const wrongKind = randChoice(rng, ["squished", "brokenUp"] as const);
      const wrong = wrongKind === "squished" ? item.squished : item.brokenUp;
      const otherWrong = wrongKind === "squished" ? item.brokenUp : item.squished;
      const choices = shuffle(rng, [item.correct, wrong, otherWrong]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, [
          `Which version shows correct word spacing for "${item.meaning}"?`,
          `Pick the correctly spaced re-write of "${item.meaning}".`,
          `Which of these is written neatly, with correct word spacing, for "${item.meaning}"?`,
          `Choose the properly spaced version meaning "${item.meaning}".`,
          `A classmate re-wrote "${item.meaning}" three ways. Which has correct spacing?`,
        ]),
        choices,
        correctIndex: choices.indexOf(item.correct),
        layout: "list",
        hint: "Correct spacing keeps each whole word together, with one space between words — not squished together or broken into fragments.",
        explanation: `The correctly spaced version is "${item.correct}" — squishing words together or breaking them into fragments makes text hard to read.`,
      };
    }

    if (branch === "harakat") {
      const q = randChoice(rng, HARAKAT_WRITE_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.question,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "row",
        hint: "fatha and damma are written above the letter; kasra is written below; sukun (a circle) sits above and marks no vowel.",
        explanation: q.explanation,
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Arrange the word groups to re-write this sentence with correct spacing and order.",
          "Put these word groups in the correct order to form a neat sentence.",
          "Order the pieces to write a correctly spaced sentence.",
          "Click the word groups in the order they belong.",
          "Rebuild the sentence in the correct order.",
        ]),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder: set.chunks.map((c, i) => `${i}-${c}`),
        hint: "Read the meaning aloud in your head to work out the natural word order.",
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
          "Complete this handwriting fact.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about correct spelling, spacing, and the sign names you have practised writing.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    const chosen = shuffle(rng, GREETING_VOCAB).slice(0, 6);
    const bucketOf = (w: string) =>
      ["sabah al-khair", "masaa al-khair", "ahlan", "ahlan wa sahlan", "maa as-salama"].includes(w)
        ? "Greeting"
        : ["ismi...", "tasharrafna", "kayfa haaluk"].includes(w)
        ? "Introduction"
        : "Politeness";
    const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
    return {
      kind: "categorize",
      prompt: randChoice(rng, [
        "Before writing a paragraph, sort each phrase: Greeting, Introduction, or Politeness?",
        "Group these phrases the way you would plan a written greeting paragraph.",
        "Sort each phrase into the correct writing category.",
        "Classify each phrase you might write in a greetings paragraph.",
        "Which category would you write each phrase under?",
      ]),
      items: shuffle(rng, items),
      buckets: [
        { id: "Greeting", label: "Greeting" },
        { id: "Introduction", label: "Introduction" },
        { id: "Politeness", label: "Politeness" },
      ],
      correctBucket,
      hint: "Plan your paragraph: open with a greeting, add an introduction, and use polite words throughout.",
      explanation: chosen.map((c) => `"${c.word}" is ${bucketOf(c.word) === "Introduction" ? "an" : "a"} ${bucketOf(c.word).toLowerCase()} phrase.`).join(" "),
    };
  },
};
