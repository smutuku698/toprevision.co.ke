import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "member" | "profession";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "le père", meaning: "father", tag: "member" },
  { word: "la mère", meaning: "mother", tag: "member" },
  { word: "le frère", meaning: "brother", tag: "member" },
  { word: "la sœur", meaning: "sister", tag: "member" },
  { word: "les parents", meaning: "parents", tag: "member" },
  { word: "le fils", meaning: "son", tag: "member" },
  { word: "la fille", meaning: "daughter", tag: "member" },
  { word: "professeur", meaning: "teacher", tag: "profession" },
  { word: "médecin", meaning: "doctor", tag: "profession" },
  { word: "agriculteur", meaning: "farmer", tag: "profession" },
  { word: "ingénieur", meaning: "engineer", tag: "profession" },
  { word: "infirmière", meaning: "nurse", tag: "profession" },
  { word: "chauffeur", meaning: "driver", tag: "profession" },
  { word: "cuisinier", meaning: "cook", tag: "profession" },
  { word: "commerçant", meaning: "shopkeeper/trader", tag: "profession" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Mon ", after: " est professeur.", answer: "père", gloss: "Mon père est professeur. — My father is a teacher." },
  { before: "Ma ", after: " est médecin.", answer: "mère", gloss: "Ma mère est médecin. — My mother is a doctor." },
  { before: "J'ai un ", after: ".", answer: "frère", gloss: "J'ai un frère. — I have a brother." },
  { before: "J'ai une ", after: ".", answer: "sœur", gloss: "J'ai une sœur. — I have a sister." },
  { before: "Mon frère est ", after: ".", answer: "ingénieur", gloss: "Mon frère est ingénieur. — My brother is an engineer." },
  { before: "Ma sœur est ", after: ".", answer: "infirmière", gloss: "Ma sœur est infirmière. — My sister is a nurse." },
  { before: "Mes ", after: " habitent à Nairobi.", answer: "parents", gloss: "Mes parents habitent à Nairobi. — My parents live in Nairobi." },
  { before: "Mon père est ", after: ".", answer: "agriculteur", gloss: "Mon père est agriculteur. — My father is a farmer." },
  { before: "Ma mère est ", after: ".", answer: "cuisinière", gloss: "Ma mère est cuisinière. — My mother is a cook." },
  { before: "Il a douze ", after: ".", answer: "ans", gloss: "Il a douze ans. — He is twelve years old." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Mon", "père", "est", "professeur", "."], sentence: "Mon père est professeur." },
  { chunks: ["Ma", "mère", "est", "médecin", "."], sentence: "Ma mère est médecin." },
  { chunks: ["J'ai", "un", "frère", "et", "une", "sœur", "."], sentence: "J'ai un frère et une sœur." },
  { chunks: ["Mes", "parents", "habitent", "à", "Nairobi", "."], sentence: "Mes parents habitent à Nairobi." },
];

const NAMES = ["Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno", "Wanjiru", "Kiptoo", "Achieng", "Mumbi", "Kamau", "Wafula"];

const SCENARIOS: { situation: (name: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} asks about your father's job, and he teaches at a school.`,
    correct: "Mon père est professeur.",
    distractors: ["Mon père est médecin.", "Ma mère est professeure.", "Mon frère est professeur."],
    explanation: "'Mon père est professeur' says specifically that your father is a teacher — the other options describe a different family member or a different job.",
  },
  {
    situation: (n) => `${n} asks about your mother's job, and she treats patients at a hospital.`,
    correct: "Ma mère est médecin.",
    distractors: ["Ma mère est cuisinière.", "Mon père est médecin.", "Ma sœur est médecin."],
    explanation: "'Ma mère est médecin' correctly identifies your mother as a doctor — the others name a wrong job or a wrong family member.",
  },
  {
    situation: (n) => `${n} asks if you have siblings, and you have exactly one boy sibling.`,
    correct: "J'ai un frère.",
    distractors: ["J'ai une sœur.", "J'ai un fils.", "J'ai des parents."],
    explanation: "'J'ai un frère' means 'I have a brother' — 'sœur' is a sister and 'fils' is a son, not a sibling term.",
  },
  {
    situation: (n) => `${n} asks if you have siblings, and you have exactly one girl sibling.`,
    correct: "J'ai une sœur.",
    distractors: ["J'ai un frère.", "J'ai une fille.", "J'ai des parents."],
    explanation: "'J'ai une sœur' means 'I have a sister' — 'fille' means 'daughter', which is a different family relationship.",
  },
  {
    situation: (n) => `${n} asks what your brother does, and he designs bridges and buildings.`,
    correct: "Mon frère est ingénieur.",
    distractors: ["Mon frère est agriculteur.", "Ma sœur est ingénieure.", "Mon père est ingénieur."],
    explanation: "'Mon frère est ingénieur' says your brother is an engineer — the others name a different job or a different family member.",
  },
  {
    situation: (n) => `${n} asks what your sister does, and she cares for patients at a clinic.`,
    correct: "Ma sœur est infirmière.",
    distractors: ["Ma sœur est médecin.", "Mon frère est infirmier.", "Ma mère est infirmière."],
    explanation: "'Ma sœur est infirmière' says your sister is a nurse — 'médecin' is a doctor, a related but different profession.",
  },
  {
    situation: (n) => `${n} asks what your father does, and he grows crops on a farm.`,
    correct: "Mon père est agriculteur.",
    distractors: ["Mon père est chauffeur.", "Ma mère est agricultrice.", "Mon frère est agriculteur."],
    explanation: "'Mon père est agriculteur' names your father as a farmer — the others name a different job or a different family member.",
  },
  {
    situation: (n) => `${n} asks where your parents live, and they live in Nairobi.`,
    correct: "Mes parents habitent à Nairobi.",
    distractors: ["Mon père habite à Nairobi.", "Mes parents sont médecins.", "J'habite à Nairobi."],
    explanation: "'Mes parents habitent à Nairobi' correctly uses the plural 'parents' with the matching plural verb form 'habitent'.",
  },
  {
    situation: (n) => `${n} asks who sells goods in a shop in your family, and your mother owns a small shop.`,
    correct: "Ma mère est commerçante.",
    distractors: ["Ma mère est cuisinière.", "Mon père est commerçant.", "Ma sœur est commerçante."],
    explanation: "'Ma mère est commerçante' identifies your mother as a shopkeeper/trader — the others name a different job or family member.",
  },
  {
    situation: (n) => `${n} asks who drives the family car for work, and it is your father.`,
    correct: "Mon père est chauffeur.",
    distractors: ["Ma mère est chauffeuse.", "Mon frère est chauffeur.", "Mon père est ingénieur."],
    explanation: "'Mon père est chauffeur' identifies your father as a driver — the others name a different family member or a different job.",
  },
];

export const familySpeaking: Skill = {
  id: "g7-fr-ls-family",
  code: "LS.2",
  subjectId: "french",
  strandId: "g7-fr-listening-speaking",
  grade: 7,
  title: "Nuclear family and professions",
  description: "Vocabulary for nuclear family members and professions, and describing a family's names, ages, and jobs.",
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
        prompt: "Match each French word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Family words describe a relationship; profession words describe a job.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const members = shuffle(rng, WORDS.filter((p) => p.tag === "member")).slice(0, 3);
      const professions = shuffle(rng, WORDS.filter((p) => p.tag === "profession")).slice(0, 3);
      const items = shuffle(rng, [...members, ...professions]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Family Member or a Profession.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "member", label: "Family Member" },
          { id: "profession", label: "Profession" },
        ],
        correctBucket,
        hint: "Family words name a relationship (father, sister); profession words name a job.",
        explanation: [...members, ...professions]
          .map((p) => `"${p.word}" is a ${p.tag === "member" ? "family member" : "profession"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about family.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the family word or profession that fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
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
        hint: "The subject comes first, then the verb 'est'/'habitent', then the description.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const name = randChoice(rng, NAMES);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(name)} What do you say?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check both which family member and which detail actually match the situation.",
      explanation: s.explanation,
    };
  },
};
