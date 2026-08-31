import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CONJ_SENTENCES: { text: string; conj: "and" | "but" | "or"; function: "addition" | "contrast" | "choice" }[] = [
  { text: "Dedan Kimathi led the Mau Mau fighters and inspired many Kenyans.", conj: "and", function: "addition" },
  { text: "Wangari Maathai was a scientist but she is best remembered as an environmentalist.", conj: "but", function: "contrast" },
  { text: "You can read about Tom Mboya or watch a documentary about his life.", conj: "or", function: "choice" },
  { text: "Mekatilili wa Menza resisted colonial rule and mobilized the Giriama people.", conj: "and", function: "addition" },
  { text: "Jaramogi Oginga Odinga was jailed but he never abandoned his principles.", conj: "but", function: "contrast" },
  { text: "Was Ronald Ngala a teacher or a politician before independence?", conj: "or", function: "choice" },
  { text: "Field Marshal Muthoni was young but she fought bravely in the forest.", conj: "but", function: "contrast" },
  { text: "Harry Thuku organized rallies and demanded better treatment for workers.", conj: "and", function: "addition" },
  { text: "You could visit the Kimathi statue or read his letters at the museum.", conj: "or", function: "choice" },
  { text: "Me Katilili was elderly but she still led her people with courage.", conj: "but", function: "contrast" },
  { text: "Pio Gama Pinto wrote articles and organized freedom fighters.", conj: "and", function: "addition" },
  { text: "Should we remember heroes on Mashujaa Day or celebrate them all year round?", conj: "or", function: "choice" },
];

const FUNCTION_LABELS: Record<string, string> = {
  addition: "Addition (joins two similar ideas)",
  contrast: "Contrast (joins two opposite/differing ideas)",
  choice: "Choice (offers an alternative)",
};

const IDENTIFY_MC: { sentence: string; target: string; correct: string; distractors: string[] }[] = [
  { sentence: "Wangari Maathai planted trees and educated communities about the environment.", target: "and", correct: "Addition", distractors: ["Contrast", "Choice", "Cause"] },
  { sentence: "Tom Mboya was young but he was already a powerful trade unionist.", target: "but", correct: "Contrast", distractors: ["Addition", "Choice", "Cause"] },
  { sentence: "You can learn about Kimathi's life from a book or from a museum tour.", target: "or", correct: "Choice", distractors: ["Addition", "Contrast", "Cause"] },
  { sentence: "Mekatilili was captured but she continued to inspire her people.", target: "but", correct: "Contrast", distractors: ["Addition", "Choice", "Cause"] },
  { sentence: "Harry Thuku spoke against injustice and organized peaceful protests.", target: "and", correct: "Addition", distractors: ["Contrast", "Choice", "Cause"] },
  { sentence: "Should the museum honour Field Marshal Muthoni or celebrate all Mau Mau fighters together?", target: "or", correct: "Choice", distractors: ["Addition", "Contrast", "Cause"] },
];

const CONSTRUCT_FILL: { before: string; after: string; correctAnswer: "and" | "but" | "or"; clue: string }[] = [
  { before: "Dedan Kimathi was captured ", after: " he was later executed by the colonial government.", correctAnswer: "and", clue: "The two ideas continue the same story — join them with an addition word." },
  { before: "Wangari Maathai faced great opposition ", after: " she never gave up her mission.", correctAnswer: "but", clue: "The second idea contrasts with the first — join them with a contrast word." },
  { before: "You can write a short essay about a Kenyan hero ", after: " prepare a short oral presentation.", correctAnswer: "or", clue: "This offers two alternatives to choose from — join them with a choice word." },
  { before: "Mekatilili wa Menza was elderly ", after: " she led her people with remarkable courage.", correctAnswer: "but", clue: "The second idea contrasts with the first — join them with a contrast word." },
  { before: "Pio Gama Pinto wrote powerful articles ", after: " organized freedom fighters across the country.", correctAnswer: "and", clue: "The two ideas continue the same story — join them with an addition word." },
  { before: "Should we celebrate Mashujaa Day with a school parade ", after: " with a storytelling session about our heroes?", correctAnswer: "or", clue: "This offers two alternatives to choose from — join them with a choice word." },
];

const MATCH_POOL: { word: string; label: string }[] = [
  { word: "and", label: "Joins two similar or related ideas (addition)" },
  { word: "but", label: "Joins two opposite or differing ideas (contrast)" },
  { word: "or", label: "Offers a choice between alternatives" },
];

const ORDER_SENTENCES: { words: string[] }[] = [
  { words: ["Wangari", "Maathai", "studied", "biology", "but", "she", "became", "an", "environmentalist."] },
  { words: ["Kimathi", "led", "the", "fighters", "and", "inspired", "many", "Kenyans."] },
  { words: ["You", "can", "read", "about", "Mboya", "or", "watch", "a", "documentary."] },
  { words: ["Mekatilili", "was", "captured", "but", "she", "never", "stopped", "inspiring", "her", "people."] },
  { words: ["Harry", "Thuku", "organized", "rallies", "and", "demanded", "fair", "treatment."] },
  { words: ["Should", "we", "visit", "the", "museum", "or", "read", "about", "the", "heroes", "at", "school?"] },
];

export const conjunctions: Skill = {
  id: "g7-eng-g-conjunctions",
  code: "G.9",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Conjunctions: And, But, Or",
  description: "Identify and use the conjunctions and, but, and or accurately in sentences about Kenyan heroes and heroines.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify-mc", "fill", "match", "ordering"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, CONJ_SENTENCES).slice(0, 6);
      const buckets = [
        { id: "addition", label: "Addition (and)" },
        { id: "contrast", label: "Contrast (but)" },
        { id: "choice", label: "Choice (or)" },
      ];
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.function));
      return {
        kind: "categorize",
        prompt: "Sort each sentence by what its conjunction (and/but/or) is doing: addition, contrast, or choice.",
        items,
        buckets,
        correctBucket,
        hint: "'And' adds similar ideas, 'but' shows a difference or contrast, and 'or' offers a choice.",
        explanation: chosen.map((s) => `"${s.text}" uses "${s.conj}" to show ${FUNCTION_LABELS[s.function].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "identify-mc") {
      const entry = randChoice(rng, IDENTIFY_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `What is the conjunction "${entry.target}" doing in this sentence? "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Read both parts of the sentence — are they similar, opposite, or alternatives to choose between?",
        explanation: `"${entry.target}" shows ${entry.correct.toLowerCase()} in this sentence: "${entry.sentence}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_POOL);
      const tokens = shuffle(rng, chosen.map((c, i) => ({ id: `w${i}`, label: c.word })));
      const targets = shuffle(rng, chosen.map((c, i) => ({ id: `w${i}`, label: c.label })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((c, i) => (correctMap[`w${i}`] = `w${i}`));
      return {
        kind: "click-match",
        prompt: "Match each conjunction to what it does in a sentence.",
        tokens,
        targets,
        correctMap,
        hint: "Think about whether the conjunction adds, contrasts, or gives a choice.",
        explanation: chosen.map((c) => `"${c.word}" — ${c.label}.`).join(" "),
      };
    }

    if (branch === "ordering") {
      const entry = randChoice(rng, ORDER_SENTENCES);
      const shuffled = shuffle(
        rng,
        entry.words.map((w, i) => ({ id: `w${i}`, label: w }))
      );
      const correctOrder = entry.words.map((_, i) => `w${i}`);
      return {
        kind: "ordering",
        prompt: "Arrange the words to form a correctly ordered sentence using a conjunction (and, but, or).",
        items: shuffled,
        correctOrder,
        instruction: "Tap the words in order to build the sentence.",
        hint: "Find the conjunction first — it usually joins two complete ideas together in the middle of the sentence.",
        explanation: `The correct sentence is: "${entry.words.join(" ")}"`,
      };
    }

    const entry = randChoice(rng, CONSTRUCT_FILL);
    return {
      kind: "fill-blank",
      prompt: entry.clue,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Decide whether the two ideas are similar, opposite, or alternatives, then choose and/but/or.",
      explanation: `"${entry.correctAnswer}" fits here: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
