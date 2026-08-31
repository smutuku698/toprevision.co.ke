import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "nuclear" | "other";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "le père", meaning: "father", tag: "nuclear" },
  { word: "la mère", meaning: "mother", tag: "nuclear" },
  { word: "le frère", meaning: "brother", tag: "nuclear" },
  { word: "la sœur", meaning: "sister", tag: "nuclear" },
  { word: "les parents", meaning: "parents", tag: "nuclear" },
  { word: "le fils", meaning: "son", tag: "nuclear" },
  { word: "la fille", meaning: "daughter", tag: "nuclear" },
  { word: "le grand-père", meaning: "grandfather", tag: "other" },
  { word: "la grand-mère", meaning: "grandmother", tag: "other" },
  { word: "l'oncle", meaning: "uncle", tag: "other" },
  { word: "la tante", meaning: "aunt", tag: "other" },
  { word: "le cousin", meaning: "cousin (male)", tag: "other" },
  { word: "la cousine", meaning: "cousin (female)", tag: "other" },
  { word: "le tuteur", meaning: "guardian (male)", tag: "other" },
  { word: "la tutrice", meaning: "guardian (female)", tag: "other" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Mon ", after: " s'appelle Otieno.", answer: "père", gloss: "Mon père s'appelle Otieno. — My father is called Otieno." },
  { before: "Ma ", after: " s'appelle Achieng.", answer: "mère", gloss: "Ma mère s'appelle Achieng. — My mother is called Achieng." },
  { before: "J'ai un frère et une ", after: ".", answer: "sœur", gloss: "J'ai un frère et une sœur. — I have a brother and a sister." },
  { before: "Mes ", after: " habitent à Eldoret.", answer: "parents", gloss: "Mes parents habitent à Eldoret. — My parents live in Eldoret." },
  { before: "Mon ", after: " a soixante ans.", answer: "grand-père", gloss: "Mon grand-père a soixante ans. — My grandfather is sixty years old." },
  { before: "Ma ", after: " prépare le repas.", answer: "tante", gloss: "Ma tante prépare le repas. — My aunt is preparing the meal." },
  { before: "Mon ", after: " habite avec nous.", answer: "tuteur", gloss: "Mon tuteur habite avec nous. — My guardian lives with us." },
  { before: "J'ai deux ", after: ".", answer: "cousines", gloss: "J'ai deux cousines. — I have two (female) cousins." },
  { before: "Mon ", after: " joue au football.", answer: "frère", gloss: "Mon frère joue au football. — My brother plays football." },
  { before: "Ma ", after: " est très gentille.", answer: "grand-mère", gloss: "Ma grand-mère est très gentille. — My grandmother is very kind." },
  { before: "J'ai un ", after: " et une fille.", answer: "fils", gloss: "J'ai un fils et une fille. — I have a son and a daughter." },
  { before: "Mon ", after: " s'appelle Kiptoo.", answer: "oncle", gloss: "Mon oncle s'appelle Kiptoo. — My uncle is called Kiptoo." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Mon", "père", "s'appelle", "Otieno", "."], sentence: "Mon père s'appelle Otieno." },
  { chunks: ["Ma", "mère", "s'appelle", "Achieng", "."], sentence: "Ma mère s'appelle Achieng." },
  { chunks: ["J'ai", "un", "frère", "et", "une", "sœur", "."], sentence: "J'ai un frère et une sœur." },
  { chunks: ["Mes", "parents", "habitent", "à", "Eldoret", "."], sentence: "Mes parents habitent à Eldoret." },
  { chunks: ["Mon", "tuteur", "habite", "avec", "nous", "."], sentence: "Mon tuteur habite avec nous." },
  { chunks: ["Ma", "grand-mère", "est", "très", "gentille", "."], sentence: "Ma grand-mère est très gentille." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are filling in a school form asking for your father's name, and he is called Otieno.",
    correct: "Mon père s'appelle Otieno.",
    distractors: ["Ma mère s'appelle Otieno.", "Mon frère s'appelle Otieno.", "Mon oncle s'appelle Otieno."],
    explanation: "'Mon père s'appelle Otieno' correctly names the father — the other options name a different family member instead.",
  },
  {
    note: "You are writing a caption for a family photo naming your mother, Achieng.",
    correct: "Ma mère s'appelle Achieng.",
    distractors: ["Mon père s'appelle Achieng.", "Ma sœur s'appelle Achieng.", "Ma tante s'appelle Achieng."],
    explanation: "'Ma mère s'appelle Achieng' names your mother specifically — swapping the family member changes who is being named.",
  },
  {
    note: "You are writing a short paragraph and want to say you have exactly one brother and one sister.",
    correct: "J'ai un frère et une sœur.",
    distractors: ["J'ai une sœur et une tante.", "J'ai un frère et un cousin.", "J'ai des parents."],
    explanation: "'J'ai un frère et une sœur' names one brother and one sister — the other options swap in a different relative.",
  },
  {
    note: "You are filling in a form field for your parents' town of residence, which is Eldoret.",
    correct: "Mes parents habitent à Eldoret.",
    distractors: ["Mon oncle habite à Eldoret.", "J'habite à Eldoret.", "Mes parents sont à l'école."],
    explanation: "'Mes parents habitent à Eldoret' uses the plural subject 'parents' with the matching plural verb 'habitent' and names the right people.",
  },
  {
    note: "You live with your guardian rather than your parents, and you want to write that he lives with you.",
    correct: "Mon tuteur habite avec nous.",
    distractors: ["Mon père habite avec nous.", "Ma tutrice habite avec nous.", "Mon grand-père habite loin."],
    explanation: "'Mon tuteur' is the correct masculine word for a male guardian — 'Ma tutrice' wrongly uses the feminine form for 'he'.",
  },
  {
    note: "You are describing your grandmother in a family album, and she is very kind.",
    correct: "Ma grand-mère est très gentille.",
    distractors: ["Mon grand-père est très gentille.", "Ma tante est très gentille.", "Ma grand-mère est très grande."],
    explanation: "'Ma grand-mère est très gentille' correctly matches the feminine adjective 'gentille' to 'grand-mère' — using it with 'grand-père' (masculine) is a gender-agreement mistake.",
  },
  {
    note: "You want to write that your uncle is named Kiptoo.",
    correct: "Mon oncle s'appelle Kiptoo.",
    distractors: ["Ma tante s'appelle Kiptoo.", "Mon cousin s'appelle Kiptoo.", "Mon oncle a Kiptoo ans."],
    explanation: "'Mon oncle s'appelle Kiptoo' correctly names the uncle — the last distractor wrongly mixes the naming pattern with the age pattern ('a ... ans').",
  },
  {
    note: "You are writing about your two female cousins in a paragraph about family gatherings.",
    correct: "J'ai deux cousines.",
    distractors: ["J'ai deux cousins.", "J'ai deux tantes.", "J'ai deux frères."],
    explanation: "'cousines' is the feminine plural form — 'cousins' (masculine) or a different relative word would name the wrong people.",
  },
  {
    note: "You are describing your brother's hobby, that he plays football.",
    correct: "Mon frère joue au football.",
    distractors: ["Ma sœur joue au football.", "Mon frère joue à football.", "Mon frère jouer au football."],
    explanation: "'Mon frère joue au football' correctly uses 'au' (à + le) and the conjugated verb 'joue' — dropping the contraction or using the infinitive 'jouer' are common mistakes.",
  },
  {
    note: "You want to note your grandfather's age, that he is sixty.",
    correct: "Mon grand-père a soixante ans.",
    distractors: ["Mon grand-père est soixante ans.", "Ma grand-mère a soixante ans.", "Mon grand-père a dix-huit ans."],
    explanation: "French uses 'avoir' (a) for age, not 'être' (est) — and the sentence must name the right person and the right number.",
  },
  {
    note: "You are writing that you have a son and a daughter, describing your own family as an adult.",
    correct: "J'ai un fils et une fille.",
    distractors: ["J'ai un fils et une sœur.", "J'ai deux fils.", "J'ai une fille et un cousin."],
    explanation: "'J'ai un fils et une fille' names one son and one daughter — the other options swap in the wrong relative or the wrong count.",
  },
  {
    note: "You are writing a school project celebrating that families look different — yours includes your guardian, a woman, rather than two parents — and you want to name her role.",
    correct: "Ma tutrice habite avec nous.",
    distractors: ["Mon tuteur habite avec nous.", "Ma tante habite avec nous.", "Ma mère habite avec nous."],
    explanation: "'Ma tutrice' is the correct feminine word for a female guardian — 'Mon tuteur' wrongly uses the masculine form, and the other two name a different relative.",
  },
];

export const familyWriting: Skill = {
  id: "g6-fr-w-family",
  code: "W.2",
  subjectId: "french",
  strandId: "g6-fr-writing",
  grade: 6,
  title: "Nuclear family and guardians",
  description: "Guided writing about members of a nuclear family, extended family, and guardians, reflecting different family compositions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each written French family word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words name your closest (nuclear) family; others name wider family or guardians.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const nuclear = shuffle(rng, WORDS.filter((p) => p.tag === "nuclear")).slice(0, 3);
      const other = shuffle(rng, WORDS.filter((p) => p.tag === "other")).slice(0, 3);
      const items = shuffle(rng, [...nuclear, ...other]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each written word as a Nuclear Family Member or Extended Family/Guardian.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "nuclear", label: "Nuclear Family Member" },
          { id: "other", label: "Extended Family/Guardian" },
        ],
        correctBucket,
        hint: "Nuclear family means parents, siblings, and children; extended family/guardians are everyone else who cares for you.",
        explanation: [...nuclear, ...other]
          .map((p) => `"${p.word}" is ${p.tag === "nuclear" ? "a nuclear family member" : "extended family or a guardian"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written sentence about family.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the family or guardian word that fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct French sentence about family.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject comes first, then the verb, then the description.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} Which French sentence should you write?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check the family member, the gender of the word, and the detail described all match the situation.",
      explanation: s.explanation,
    };
  },
};
