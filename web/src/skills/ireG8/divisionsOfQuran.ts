import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each term for a division of the Qur'an to its meaning.",
  "Pair each term for a division of the Qur'an with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term for a division of the Qur'an to the definition that fits it.",
  "Choose the correct meaning for each term below.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each description as describing a Makkan Surah or a Madinan Surah.",
  "Group each description under a Makkan Surah or a Madinan Surah.",
  "Decide whether each description is Makkan or Madinan, and sort it there.",
  "Sort each description into the correct category: Makkan Surah, or Madinan Surah.",
  "Place each description into the right bucket — Makkan, or Madinan.",
  "Categorise each description as a Makkan Surah or a Madinan Surah.",
];

const ORDER_PROMPTS = [
  "Arrange these divisions of the Qur'an from the smallest unit to the broadest grouping.",
  "Put these divisions of the Qur'an in order, from smallest to broadest.",
  "Sequence these divisions of the Qur'an correctly, smallest to largest.",
  "Order these divisions of the Qur'an from the smallest unit to the broadest.",
  "Sort these divisions of the Qur'an from smallest to broadest.",
  "Arrange these units of the Qur'an from smallest to largest.",
];

const FILL_PROMPTS = [
  "Fill in the missing term.",
  "Which term completes this sentence?",
  "Complete the sentence with the correct term.",
  "Work out the missing term below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which term belongs in the blank?",
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Ayat", meaning: "A single verse of the Qur'an" },
  { term: "Surah", meaning: "A chapter of the Qur'an, made up of a group of ayat" },
  { term: "Ruk'u", meaning: "A short paragraph or section within a surah, used to divide long chapters for reading" },
  { term: "Juzuu", meaning: "One of the 30 equal parts the whole Qur'an is divided into" },
  { term: "Manzil", meaning: "One of 7 sections of the Qur'an, allowing it to be completed in a week of reading" },
];

const SURAH_TYPE_ITEMS = [
  { text: "A shorter chapter mainly teaching about monotheism (Tawhid) and faith", bucket: "makkan" },
  { text: "A chapter revealed before the Hijrah to Madinah", bucket: "makkan" },
  { text: "A longer chapter dealing with laws and social matters", bucket: "madinan" },
  { text: "A chapter revealed after the Prophet (S.A.W.) migrated to Madinah", bucket: "madinan" },
  { text: "A chapter focused on warning against shirk and describing the Day of Judgement", bucket: "makkan" },
] as const;
const SURAH_TYPE_LABEL: Record<string, string> = { makkan: "A Makkan Surah", madinan: "A Madinan Surah" };

const SIZE_ORDER = [
  { id: "ayat", label: "Ayat (a single verse)" },
  { id: "rukuu", label: "Ruk'u (a section within a surah)" },
  { id: "surah", label: "Surah (a whole chapter)" },
  { id: "juzuu", label: "Juzuu (one of 30 equal parts)" },
  { id: "manzil", label: "Manzil (one of 7 weekly reading portions)" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is the Qur'an divided into ayat, surahs, juzuu, ruk'u, and manzil?",
    correct: "To make it easier to reference, read, memorise, and study",
    distractors: ["To make it harder for beginners to read", "Because each division was revealed to a different prophet", "To separate the Qur'an into unrelated books"],
  },
  {
    q: "What is a 'juzuu' of the Qur'an?",
    correct: "One of the 30 equal parts the whole Qur'an is divided into",
    distractors: ["A single verse", "A chapter revealed in Madinah only", "A prayer said during Ramadan only"],
  },
  {
    q: "A Muslim who wants to complete reading the whole Qur'an in one week would follow which division?",
    correct: "The 7 manzil (weekly reading portions)",
    distractors: ["The 30 juzuu", "A single surah", "A single ayat"],
  },
  {
    q: "Which of these best describes a Makkan Surah?",
    correct: "Generally shorter, revealed before the Hijrah, focused on faith and monotheism",
    distractors: ["Generally longer, revealed after the Hijrah, focused on law", "Revealed only to Prophet Musa (A.S.)", "A surah with no ayat"],
  },
];

export const divisionsOfQuran: Skill = {
  id: "g8-ire-qu-divisions-of-quran",
  code: "QU.2",
  subjectId: "ire",
  strandId: "g8-ire-qu",
  grade: 8,
  title: "Divisions of the Qur'an",
  description: "Learn the terms ayat, surah, ruk'u, juzuu, and manzil, and the difference between Makkan and Madinan surahs.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The Qur'an can be divided by chapter (surah), verse (ayat), or by equal reading portions (juzuu, manzil).",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SURAH_TYPE_ITEMS).slice(0, 4);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: SURAH_TYPE_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Makkan surahs came before the Hijrah and focus on faith; Madinan surahs came after and focus on law and social life.",
        explanation: chosen.map((c) => `"${c.text}" — ${SURAH_TYPE_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, SIZE_ORDER);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, smallest first.",
        items,
        correctOrder: SIZE_ORDER.map((s) => s.id),
        hint: "A verse is the smallest unit; several verses form a section, several sections form a chapter, and the whole Qur'an can also be split into 30 or 7 equal portions.",
        explanation: SIZE_ORDER.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "A single verse of the Qur'an is called an",
        after: ".",
        correctAnswer: "Ayat",
        acceptedAnswers: ["ayah", "aya"],
        inputMode: "text",
        hint: "The Qur'an is made up of thousands of these, grouped into surahs.",
        explanation: "A single verse of the Qur'an is called an ayat (plural: ayat/ayaat).",
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "The Qur'an's divisions — ayat, surah, ruk'u, juzuu, and manzil — all exist to make reading, referencing, and memorising it easier.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
