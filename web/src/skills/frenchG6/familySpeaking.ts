import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "member" | "composition";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "le père", meaning: "father", tag: "member" },
  { word: "la mère", meaning: "mother", tag: "member" },
  { word: "le frère", meaning: "brother", tag: "member" },
  { word: "la sœur", meaning: "sister", tag: "member" },
  { word: "les parents", meaning: "parents", tag: "member" },
  { word: "le fils", meaning: "son", tag: "member" },
  { word: "la fille", meaning: "daughter", tag: "member" },
  { word: "le grand-père", meaning: "grandfather", tag: "member" },
  { word: "la grand-mère", meaning: "grandmother", tag: "member" },
  { word: "les grands-parents", meaning: "grandparents", tag: "member" },
  { word: "une famille nombreuse", meaning: "a large family", tag: "composition" },
  { word: "une famille monoparentale", meaning: "a single-parent family", tag: "composition" },
  { word: "une famille recomposée", meaning: "a blended family", tag: "composition" },
  { word: "un enfant unique", meaning: "an only child", tag: "composition" },
  { word: "des jumeaux", meaning: "twins", tag: "composition" },
  { word: "une petite famille", meaning: "a small family", tag: "composition" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Mon ", after: " s'appelle Otieno.", answer: "père", gloss: "Mon père s'appelle Otieno. — My father is called Otieno." },
  { before: "Ma ", after: " s'appelle Wanjiru.", answer: "mère", gloss: "Ma mère s'appelle Wanjiru. — My mother is called Wanjiru." },
  { before: "J'ai un ", after: ".", answer: "frère", gloss: "J'ai un frère. — I have a brother." },
  { before: "J'ai une ", after: ".", answer: "sœur", gloss: "J'ai une sœur. — I have a sister." },
  { before: "Mes ", after: " habitent à Kisumu.", answer: "parents", gloss: "Mes parents habitent à Kisumu. — My parents live in Kisumu." },
  { before: "Mon ", after: " a soixante ans.", answer: "grand-père", gloss: "Mon grand-père a soixante ans. — My grandfather is sixty years old." },
  { before: "Ma ", after: " fait du pain.", answer: "grand-mère", gloss: "Ma grand-mère fait du pain. — My grandmother makes bread." },
  { before: "Nous sommes une famille ", after: ".", answer: "nombreuse", gloss: "Nous sommes une famille nombreuse. — We are a large family." },
  { before: "Chez moi, c'est une famille ", after: ".", answer: "monoparentale", gloss: "Chez moi, c'est une famille monoparentale. — At my house, it's a single-parent family." },
  { before: "Je suis enfant ", after: ".", answer: "unique", gloss: "Je suis enfant unique. — I am an only child." },
  { before: "J'habite avec mes ", after: ".", answer: "grands-parents", gloss: "J'habite avec mes grands-parents. — I live with my grandparents." },
  { before: "C'est une famille ", after: ", avec un beau-père.", answer: "recomposée", gloss: "C'est une famille recomposée, avec un beau-père. — It's a blended family, with a stepfather." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Mon", "père", "s'appelle", "Otieno", "."], sentence: "Mon père s'appelle Otieno." },
  { chunks: ["Ma", "mère", "est", "à", "la", "maison", "."], sentence: "Ma mère est à la maison." },
  { chunks: ["J'ai", "un", "frère", "et", "une", "sœur", "."], sentence: "J'ai un frère et une sœur." },
  { chunks: ["Mes", "parents", "habitent", "à", "Kisumu", "."], sentence: "Mes parents habitent à Kisumu." },
  { chunks: ["Nous", "sommes", "une", "famille", "nombreuse", "."], sentence: "Nous sommes une famille nombreuse." },
  { chunks: ["Mes", "grands-parents", "habitent", "au", "village", "."], sentence: "Mes grands-parents habitent au village." },
];

const NAMES = ["Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno", "Wanjiru", "Kiptoo", "Achieng", "Mumbi", "Kamau", "Wafula"];

const SCENARIOS: { situation: (name: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} asks you to name your father.`,
    correct: "Mon père s'appelle Otieno.",
    distractors: ["Ma mère s'appelle Wanjiru.", "Mon frère s'appelle Otieno.", "Mon grand-père s'appelle Otieno."],
    explanation: "'Mon père s'appelle Otieno' names your father specifically — the other options name a different family member instead.",
  },
  {
    situation: (n) => `${n} asks if you have a brother, and you have exactly one.`,
    correct: "J'ai un frère.",
    distractors: ["J'ai une sœur.", "J'ai un fils.", "J'ai des jumeaux."],
    explanation: "'J'ai un frère' means 'I have a brother' — 'sœur' is a sister and 'fils' is a son, not a sibling term.",
  },
  {
    situation: (n) => `${n} asks if you have a sister, and you have exactly one.`,
    correct: "J'ai une sœur.",
    distractors: ["J'ai un frère.", "J'ai une fille.", "Je suis enfant unique."],
    explanation: "'J'ai une sœur' means 'I have a sister' — 'fille' means 'daughter', a different family relationship, and 'enfant unique' means you have no siblings at all.",
  },
  {
    situation: (n) => `${n} asks where your parents live, and they live in Kisumu.`,
    correct: "Mes parents habitent à Kisumu.",
    distractors: ["Mon père habite à Kisumu.", "Mes grands-parents habitent à Kisumu.", "J'habite à Kisumu."],
    explanation: "'Mes parents habitent à Kisumu' correctly uses the plural 'parents' with the matching plural verb 'habitent' — the others name a different person living there.",
  },
  {
    situation: (n) => `${n} asks about your grandfather's age; he is sixty.`,
    correct: "Mon grand-père a soixante ans.",
    distractors: ["Ma grand-mère a soixante ans.", "Mon père a soixante ans.", "J'ai soixante ans."],
    explanation: "'Mon grand-père a soixante ans' says your grandfather is sixty — the others name a different family member's age.",
  },
  {
    situation: (n) => `${n} notices you have several brothers and sisters and asks about your family.`,
    correct: "Nous sommes une famille nombreuse.",
    distractors: ["Nous sommes une petite famille.", "C'est une famille monoparentale.", "Je suis enfant unique."],
    explanation: "'Une famille nombreuse' means 'a large family' — the opposite composition ('petite famille') and having no siblings ('enfant unique') don't fit having several siblings.",
  },
  {
    situation: (n) => `${n} asks about your home, where you live with only your mother.`,
    correct: "Chez moi, c'est une famille monoparentale.",
    distractors: ["Nous sommes une famille nombreuse.", "C'est une famille recomposée.", "J'habite avec mes grands-parents."],
    explanation: "'Une famille monoparentale' means 'a single-parent family' — a blended family ('recomposée') implies a step-parent, which isn't the case here.",
  },
  {
    situation: (n) => `${n} asks if you have any brothers or sisters, and you don't have any.`,
    correct: "Je suis enfant unique.",
    distractors: ["J'ai un frère.", "Nous sommes une famille nombreuse.", "J'ai une sœur."],
    explanation: "'Je suis enfant unique' means 'I am an only child' — the others all claim you have a sibling, which contradicts having none.",
  },
  {
    situation: (n) => `${n} asks about your family, where your mother remarried and you now have a stepfather.`,
    correct: "C'est une famille recomposée.",
    distractors: ["C'est une famille monoparentale.", "Nous sommes une famille nombreuse.", "Je suis enfant unique."],
    explanation: "'Une famille recomposée' means 'a blended family', which fits a household with a step-parent — 'monoparentale' means only one parent, not a step-parent added.",
  },
  {
    situation: (n) => `You and your sibling were born on the very same day, and ${n} asks about it.`,
    correct: "Mon frère et moi, nous sommes jumeaux.",
    distractors: ["Je suis enfant unique.", "Nous sommes une famille nombreuse.", "J'ai une sœur."],
    explanation: "'Nous sommes jumeaux' means 'we are twins', which specifically fits being born the same day — 'enfant unique' means having no siblings at all, the opposite situation.",
  },
  {
    situation: (n) => `${n} asks who you live with, since your parents work far away and you stay with your grandparents.`,
    correct: "J'habite avec mes grands-parents.",
    distractors: ["Mes parents habitent à Kisumu.", "J'ai des jumeaux.", "Nous sommes une petite famille."],
    explanation: "'J'habite avec mes grands-parents' directly says who you live with — the others describe where your parents live or a different family fact.",
  },
  {
    situation: (n) => `${n} asks about your household, where it's just you and your two parents — no siblings.`,
    correct: "Nous sommes une petite famille.",
    distractors: ["Nous sommes une famille nombreuse.", "C'est une famille monoparentale.", "J'ai des jumeaux."],
    explanation: "'Une petite famille' means 'a small family' — 'nombreuse' means large, the opposite, and 'monoparentale' would mean only one parent, not two.",
  },
];

export const familySpeaking: Skill = {
  id: "g6-fr-ls-family",
  code: "LS.2",
  subjectId: "french",
  strandId: "g6-fr-listening-speaking",
  grade: 6,
  title: "Family members and family types",
  description: "Vocabulary for nuclear family members and the different compositions a family can have, in informal (tu-form) French.",
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
        prompt: "Match each French word or phrase to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Family-member words name a relationship; composition words describe a whole family's shape.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const members = shuffle(rng, WORDS.filter((p) => p.tag === "member")).slice(0, 4);
      const compositions = shuffle(rng, WORDS.filter((p) => p.tag === "composition")).slice(0, 4);
      const items = shuffle(rng, [...members, ...compositions]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word/phrase as a Family Member or a Family Type.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "member", label: "Family Member" },
          { id: "composition", label: "Family Type" },
        ],
        correctBucket,
        hint: "Family-member words name a person (father, sister); family-type phrases describe the whole household.",
        explanation: [...members, ...compositions]
          .map((p) => `"${p.word}" is a ${p.tag === "member" ? "family member" : "family type"}.`)
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
        hint: "Think about the family-member word or family-type word that fits this sentence.",
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
        hint: "The subject comes first, then the verb 'est'/'sommes'/'habitent', then the description.",
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
      hint: "Check both which family member or family type actually matches the situation.",
      explanation: s.explanation,
    };
  },
};
