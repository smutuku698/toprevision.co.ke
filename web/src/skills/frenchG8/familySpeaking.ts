import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const WORDS: { word: string; meaning: string; gender: "masculine" | "feminine" }[] = [
  { word: "le grand-père", meaning: "grandfather", gender: "masculine" },
  { word: "la grand-mère", meaning: "grandmother", gender: "feminine" },
  { word: "l'oncle", meaning: "uncle", gender: "masculine" },
  { word: "la tante", meaning: "aunt", gender: "feminine" },
  { word: "le cousin", meaning: "cousin (male)", gender: "masculine" },
  { word: "la cousine", meaning: "cousin (female)", gender: "feminine" },
  { word: "le neveu", meaning: "nephew", gender: "masculine" },
  { word: "la nièce", meaning: "niece", gender: "feminine" },
  { word: "le mari", meaning: "husband", gender: "masculine" },
  { word: "la femme", meaning: "wife", gender: "feminine" },
];

const SENTENCES: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Qui est-ce ? — C'est mon oncle.",
    correct: "It's my uncle.",
    distractors: ["It's my aunt.", "It's my nephew.", "It's my grandfather."],
    explanation: "'Mon oncle' means 'my uncle' — the brother of one of your parents.",
  },
  {
    q: "Comment dit-on 'grandchildren' en français ?",
    correct: "les petits-enfants",
    distractors: ["les grands-parents", "les petits-fils", "les enfants"],
    explanation: "'Les petits-enfants' is the French word for grandchildren.",
  },
  {
    q: "\"J'ai deux frères et une sœur\" veut dire :",
    correct: "I have two brothers and one sister.",
    distractors: ["I have two sisters and one brother.", "I have one brother and two sisters.", "I have no brothers or sisters."],
    explanation: "'Deux frères' = two brothers, 'une sœur' = one sister.",
  },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "J'ai deux frères et une ", after: ".", answer: "sœur" },
  { before: "Ma famille est ", after: ".", answer: "grande" },
  { before: "Qui est-ce ? — C'est mon ", after: ".", answer: "oncle" },
  { before: "Les enfants de mes enfants sont mes petits-", after: ".", answer: "enfants" },
  { before: "Le fils de mon frère est mon ", after: ".", answer: "neveu" },
  { before: "La fille de ma sœur est ma ", after: ".", answer: "nièce" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["J'ai", "deux frères", "et une sœur", "."], sentence: "J'ai deux frères et une sœur." },
  { chunks: ["Ma grand-mère", "habite", "avec ma tante", "."], sentence: "Ma grand-mère habite avec ma tante." },
  { chunks: ["Qui est-ce ?", "—", "C'est mon oncle", "."], sentence: "Qui est-ce ? — C'est mon oncle." },
];

export const familySpeaking: Skill = {
  id: "g8-fr-ls-family",
  code: "LS.2",
  subjectId: "french",
  strandId: "g8-fr-listening-speaking",
  grade: 8,
  title: "Extended family",
  description: "Learn and use vocabulary for extended family members in French.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "categorize") {
      const masculine = shuffle(rng, WORDS.filter((w) => w.gender === "masculine")).slice(0, 4);
      const feminine = shuffle(rng, WORDS.filter((w) => w.gender === "feminine")).slice(0, 4);
      const items = shuffle(rng, [...masculine, ...feminine]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.word] = item.gender;

      return {
        kind: "categorize",
        prompt: "Sort each family word as Masculine (le/l') or Feminine (la/l').",
        items: items.map((it) => ({ id: it.word, label: it.word })),
        buckets: [
          { id: "masculine", label: "Masculine" },
          { id: "feminine", label: "Feminine" },
        ],
        correctBucket,
        hint: "Look at the article in front of the word: 'le' or 'l'' (masculine) versus 'la' or 'l'' (feminine).",
        explanation: `Masculine: ${masculine.map((w) => w.word).join(" / ")}. Feminine: ${feminine.map((w) => w.word).join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the French sentence about family.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the family vocabulary and the relationship being described.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about family.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Read the pieces aloud in different orders until the sentence sounds right.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const q = randChoice(rng, SENTENCES);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Think carefully about which family member or number is being described.",
        explanation: q.explanation,
      };
    }

    const chosen = shuffle(rng, WORDS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
    const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
    const correctMap: Record<string, string> = {};
    for (const w of chosen) correctMap[w.word] = w.word;

    return {
      kind: "click-match",
      prompt: "Match each French family word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "Notice the difference between 'le neveu' (nephew) and 'la nièce' (niece).",
      explanation: chosen.map((w) => `"${w.word}" means "${w.meaning}".`).join(" "),
    };
  },
};
