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
  { word: "professeur", meaning: "teacher", tag: "profession" },
  { word: "médecin", meaning: "doctor", tag: "profession" },
  { word: "agriculteur", meaning: "farmer", tag: "profession" },
  { word: "ingénieur", meaning: "engineer", tag: "profession" },
  { word: "infirmière", meaning: "nurse", tag: "profession" },
  { word: "chauffeur", meaning: "driver", tag: "profession" },
  { word: "commerçant", meaning: "shopkeeper/trader", tag: "profession" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Mon ", after: " s'appelle Kamau.", answer: "père", gloss: "Mon père s'appelle Kamau. — My father is called Kamau." },
  { before: "Ma ", after: " s'appelle Faith.", answer: "mère", gloss: "Ma mère s'appelle Faith. — My mother is called Faith." },
  { before: "Il est ", after: ".", answer: "agriculteur", gloss: "Il est agriculteur. — He is a farmer." },
  { before: "Elle est ", after: ".", answer: "médecin", gloss: "Elle est médecin. — She is a doctor." },
  { before: "J'ai un frère et une ", after: ".", answer: "sœur", gloss: "J'ai un frère et une sœur. — I have a brother and a sister." },
  { before: "Mes ", after: " habitent à Nakuru.", answer: "parents", gloss: "Mes parents habitent à Nakuru. — My parents live in Nakuru." },
  { before: "Il a quinze ", after: ".", answer: "ans", gloss: "Il a quinze ans. — He is fifteen years old." },
  { before: "Ma sœur est ", after: ".", answer: "infirmière", gloss: "Ma sœur est infirmière. — My sister is a nurse." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Mon", "père", "s'appelle", "Kamau", "."], sentence: "Mon père s'appelle Kamau." },
  { chunks: ["Ma", "mère", "est", "médecin", "."], sentence: "Ma mère est médecin." },
  { chunks: ["J'ai", "un", "frère", "et", "une", "sœur", "."], sentence: "J'ai un frère et une sœur." },
  { chunks: ["Mes", "parents", "habitent", "à", "Nakuru", "."], sentence: "Mes parents habitent à Nakuru." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are filling in a school form that asks for your father's job, and he farms crops.",
    correct: "Mon père est agriculteur.",
    distractors: ["Ma mère est agricultrice.", "Mon père est médecin.", "Mon frère est agriculteur."],
    explanation: "'Mon père est agriculteur' correctly names the father as the farmer — the other options change the family member or the job.",
  },
  {
    note: "You are writing an email to a friend describing your mother's job as a doctor.",
    correct: "Ma mère est médecin.",
    distractors: ["Mon père est médecin.", "Ma mère est infirmière.", "Ma sœur est médecin."],
    explanation: "'Ma mère est médecin' names your mother as the doctor — swapping the family member or the job changes the meaning.",
  },
  {
    note: "You are writing a short paragraph and want to say you have exactly one sister.",
    correct: "J'ai une sœur.",
    distractors: ["J'ai un frère.", "J'ai une fille.", "J'ai des parents."],
    explanation: "'J'ai une sœur' means 'I have a sister' — the other options name a different family member.",
  },
  {
    note: "You are filling in a form field for your parents' town of residence, which is Nakuru.",
    correct: "Mes parents habitent à Nakuru.",
    distractors: ["Mon père habite à Nakuru.", "J'habite à Nakuru.", "Mes parents sont médecins."],
    explanation: "'Mes parents habitent à Nakuru' uses the plural subject 'parents' with the correctly matching plural verb 'habitent'.",
  },
  {
    note: "You are writing about your brother's age, which is fifteen.",
    correct: "Il a quinze ans.",
    distractors: ["Il a dix ans.", "Elle a quinze ans.", "Il est quinze ans."],
    explanation: "'Il a quinze ans' correctly uses 'a' (has) with age in French, and 'il' for a male sibling.",
  },
  {
    note: "You are describing your sister's job, which is caring for patients at a clinic.",
    correct: "Ma sœur est infirmière.",
    distractors: ["Ma sœur est médecin.", "Mon frère est infirmier.", "Ma sœur est professeure."],
    explanation: "'Ma sœur est infirmière' names your sister as a nurse — the others name a different job or a different family member.",
  },
  {
    note: "You are writing a caption for a family photo stating your father's name is Kamau.",
    correct: "Mon père s'appelle Kamau.",
    distractors: ["Ma mère s'appelle Kamau.", "Il s'appelle Kamau et il a treize ans.", "Mon père est Kamau, agriculteur."],
    explanation: "'Mon père s'appelle Kamau' is the simplest, correctly-structured way to state the father's name.",
  },
  {
    note: "You want to write that you love your family very much.",
    correct: "J'aime beaucoup ma famille.",
    distractors: ["J'aime beaucoup mon frère.", "Ma famille m'aime beaucoup.", "J'aime ma famille beaucoup bien."],
    explanation: "'J'aime beaucoup ma famille' correctly places 'beaucoup' after the verb, describing the whole family, not just one member.",
  },
];

export const familyWriting: Skill = {
  id: "g7-fr-w-family",
  code: "W.2",
  subjectId: "french",
  strandId: "g7-fr-writing",
  grade: 7,
  title: "Nuclear family and professions",
  description: "Guided writing about nuclear family members and their professions, ages, and hometowns.",
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
        prompt: "Match each written French word to its English meaning.",
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
        prompt: "Sort each written word as a Family Member or a Profession.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "member", label: "Family Member" },
          { id: "profession", label: "Profession" },
        ],
        correctBucket,
        hint: "Family words name a relationship; profession words name a job.",
        explanation: [...members, ...professions]
          .map((p) => `"${p.word}" is a ${p.tag === "member" ? "family member" : "profession"}.`)
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
        hint: "Think about the family word or profession that fits this written sentence.",
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
      hint: "Check both the family member and the detail described match the situation.",
      explanation: s.explanation,
    };
  },
};
