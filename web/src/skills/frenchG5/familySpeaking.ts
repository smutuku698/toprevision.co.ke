import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { name, matchPrompt, sortPrompt, orderPrompt, fillPrompt, speakingScenarioCloser } from "./g5FrShared";

type Tag = "immediate" | "extended";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "le père", meaning: "father", tag: "immediate" },
  { word: "la mère", meaning: "mother", tag: "immediate" },
  { word: "le frère", meaning: "brother", tag: "immediate" },
  { word: "la sœur", meaning: "sister", tag: "immediate" },
  { word: "les parents", meaning: "parents", tag: "immediate" },
  { word: "le fils", meaning: "son", tag: "immediate" },
  { word: "la fille", meaning: "daughter", tag: "immediate" },
  { word: "la famille", meaning: "family", tag: "immediate" },
  { word: "le bébé", meaning: "baby", tag: "immediate" },
  { word: "le grand-père", meaning: "grandfather", tag: "extended" },
  { word: "la grand-mère", meaning: "grandmother", tag: "extended" },
  { word: "les grands-parents", meaning: "grandparents", tag: "extended" },
  { word: "l'oncle", meaning: "uncle", tag: "extended" },
  { word: "la tante", meaning: "aunt", tag: "extended" },
  { word: "le cousin", meaning: "cousin (male)", tag: "extended" },
  { word: "la cousine", meaning: "cousin (female)", tag: "extended" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Mon ", after: " s'appelle Otieno.", answer: "père", gloss: "Mon père s'appelle Otieno. — My father is called Otieno." },
  { before: "Ma ", after: " s'appelle Wanjiru.", answer: "mère", gloss: "Ma mère s'appelle Wanjiru. — My mother is called Wanjiru." },
  { before: "J'ai un ", after: ".", answer: "frère", gloss: "J'ai un frère. — I have a brother." },
  { before: "J'ai une ", after: ".", answer: "sœur", gloss: "J'ai une sœur. — I have a sister." },
  { before: "Mes ", after: " habitent à Kisumu.", answer: "parents", gloss: "Mes parents habitent à Kisumu. — My parents live in Kisumu." },
  { before: "Mon ", after: " a soixante ans.", answer: "grand-père", gloss: "Mon grand-père a soixante ans. — My grandfather is sixty years old." },
  { before: "Ma ", after: " fait du pain.", answer: "grand-mère", gloss: "Ma grand-mère fait du pain. — My grandmother makes bread." },
  { before: "J'habite avec mes ", after: ".", answer: "grands-parents", gloss: "J'habite avec mes grands-parents. — I live with my grandparents." },
  { before: "Mon ", after: " s'appelle Kevin.", answer: "oncle", gloss: "Mon oncle s'appelle Kevin. — My uncle is called Kevin." },
  { before: "Ma ", after: " habite à Mombasa.", answer: "tante", gloss: "Ma tante habite à Mombasa. — My aunt lives in Mombasa." },
  { before: "C'est ma nouvelle ", after: ".", answer: "famille", gloss: "C'est ma nouvelle famille. — This is my new family." },
  { before: "Le ", after: " dort.", answer: "bébé", gloss: "Le bébé dort. — The baby is sleeping." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Mon", "père", "s'appelle", "Otieno", "."], sentence: "Mon père s'appelle Otieno." },
  { chunks: ["Ma", "mère", "est", "à", "la", "maison", "."], sentence: "Ma mère est à la maison." },
  { chunks: ["J'ai", "un", "frère", "et", "une", "sœur", "."], sentence: "J'ai un frère et une sœur." },
  { chunks: ["Mes", "parents", "habitent", "à", "Kisumu", "."], sentence: "Mes parents habitent à Kisumu." },
  { chunks: ["Mes", "grands-parents", "habitent", "au", "village", "."], sentence: "Mes grands-parents habitent au village." },
  { chunks: ["Ma", "tante", "s'appelle", "Faith", "."], sentence: "Ma tante s'appelle Faith." },
];

const SCENARIOS: { situation: (n: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} asks you to name your father.`,
    correct: "Mon père s'appelle Otieno.",
    distractors: ["Ma mère s'appelle Wanjiru.", "Mon frère s'appelle Otieno.", "Mon grand-père s'appelle Otieno."],
    explanation: "'Mon père s'appelle Otieno' names your father specifically — the other options name a different family member instead.",
  },
  {
    situation: (n) => `${n} asks if you have a brother, and you have exactly one.`,
    correct: "J'ai un frère.",
    distractors: ["J'ai une sœur.", "J'ai un fils.", "J'ai un oncle."],
    explanation: "'J'ai un frère' means 'I have a brother' — 'sœur' is a sister, 'fils' is your own son, and 'oncle' is a different generation entirely.",
  },
  {
    situation: (n) => `${n} asks if you have a sister, and you have exactly one.`,
    correct: "J'ai une sœur.",
    distractors: ["J'ai un frère.", "J'ai une fille.", "J'ai une tante."],
    explanation: "'J'ai une sœur' means 'I have a sister' — 'fille' means 'daughter', a different relationship, and 'tante' is an aunt.",
  },
  {
    situation: (n) => `${n} asks where your parents live, and they live in Kisumu.`,
    correct: "Mes parents habitent à Kisumu.",
    distractors: ["Mon père habite à Kisumu.", "Mes grands-parents habitent à Kisumu.", "J'habite à Kisumu."],
    explanation: "'Mes parents habitent à Kisumu' correctly uses the plural 'parents' — the others name a different person living there.",
  },
  {
    situation: (n) => `${n} asks about your grandfather's age; he is sixty.`,
    correct: "Mon grand-père a soixante ans.",
    distractors: ["Ma grand-mère a soixante ans.", "Mon père a soixante ans.", "J'ai soixante ans."],
    explanation: "'Mon grand-père a soixante ans' says your grandfather is sixty — the others name a different family member's age.",
  },
  {
    situation: (n) => `${n} asks who bakes bread at your house — it's your grandmother.`,
    correct: "Ma grand-mère fait du pain.",
    distractors: ["Ma mère fait du pain.", "Mon grand-père fait du pain.", "Ma tante fait du pain."],
    explanation: "'Ma grand-mère fait du pain' names your grandmother specifically — the others name a different woman or a man instead.",
  },
  {
    situation: (n) => `${n} asks who you live with, since you stay with your grandparents.`,
    correct: "J'habite avec mes grands-parents.",
    distractors: ["Mes parents habitent à Kisumu.", "J'ai des cousins.", "J'habite avec mon oncle."],
    explanation: "'J'habite avec mes grands-parents' directly says who you live with — the others describe a different fact or person.",
  },
  {
    situation: (n) => `${n} asks the name of your uncle, and his name is Kevin.`,
    correct: "Mon oncle s'appelle Kevin.",
    distractors: ["Mon père s'appelle Kevin.", "Mon cousin s'appelle Kevin.", "Ma tante s'appelle Kevin."],
    explanation: "'Mon oncle s'appelle Kevin' names your uncle specifically — the others name a father, cousin, or aunt instead.",
  },
  {
    situation: (n) => `${n} asks where your aunt lives, and she lives in Mombasa.`,
    correct: "Ma tante habite à Mombasa.",
    distractors: ["Mon oncle habite à Mombasa.", "Mes parents habitent à Mombasa.", "Ma grand-mère habite à Mombasa."],
    explanation: "'Ma tante habite à Mombasa' names your aunt specifically — the others name a different relative.",
  },
  {
    situation: (n) => `${n} asks what your baby brother or sister is doing right now, and they are asleep.`,
    correct: "Le bébé dort.",
    distractors: ["Mon frère dort.", "Ma sœur dort.", "Mon grand-père dort."],
    explanation: "'Le bébé dort' names the baby specifically — the others name an older sibling or grandparent instead.",
  },
  {
    situation: (n) => `${n} asks your male cousin's name; he is called Brian.`,
    correct: "Mon cousin s'appelle Brian.",
    distractors: ["Ma cousine s'appelle Brian.", "Mon frère s'appelle Brian.", "Mon oncle s'appelle Brian."],
    explanation: "'Mon cousin' (no e) names a male cousin — 'ma cousine' (with e) would name a female cousin instead.",
  },
  {
    situation: (n) => `${n} asks about your female cousin; her name is Faith.`,
    correct: "Ma cousine s'appelle Faith.",
    distractors: ["Mon cousin s'appelle Faith.", "Ma sœur s'appelle Faith.", "Ma tante s'appelle Faith."],
    explanation: "'Ma cousine' (with e) names a female cousin — 'mon cousin' (no e) would name a male cousin instead.",
  },
  {
    situation: (n) => `${n} wants to know what your whole household is called, and you introduce it as your family.`,
    correct: "C'est ma famille.",
    distractors: ["C'est mon frère.", "Ce sont mes parents.", "C'est ma tante."],
    explanation: "'C'est ma famille' names the whole household — the other options name only one member of it.",
  },
];

export const familySpeaking: Skill = {
  id: "g5-fr-ls-family",
  code: "LS.2",
  subjectId: "french",
  strandId: "g5-fr-listening-speaking",
  grade: 5,
  title: "Family members",
  description: "Vocabulary for naming nuclear and extended family members, practiced through matching, sorting, and speaking scenarios, in informal (tu-form) French.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "French family word to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Immediate-family words name a parent, sibling, or child; extended-family words go a generation or branch further.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const immediate = shuffle(rng, WORDS.filter((p) => p.tag === "immediate")).slice(0, 4);
      const extended = shuffle(rng, WORDS.filter((p) => p.tag === "extended")).slice(0, 4);
      const items = shuffle(rng, [...immediate, ...extended]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "each word as Immediate Family or Extended Family"),
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "immediate", label: "Immediate Family" },
          { id: "extended", label: "Extended Family" },
        ],
        correctBucket,
        hint: "Immediate family = parents, siblings, children. Extended family = grandparents, aunts, uncles, cousins.",
        explanation: [...immediate, ...extended]
          .map((p) => `"${p.word}" is ${p.tag === "immediate" ? "immediate" : "extended"} family.`)
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
        hint: "Think about which family word fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to form a correct French sentence about family"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject comes first, then the verb, then the rest of the sentence.",
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
      hint: "Check which family member or family fact actually matches the situation.",
      explanation: s.explanation,
    };
  },
};
