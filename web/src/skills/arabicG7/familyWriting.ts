import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 3.2 Guided Writing: Spelling — listing professions using correct spelling, and
// using family/profession vocabulary to make sentences.

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "In Arabic, 'father' is written as ", after: ".", answer: "ab" },
  { before: "In Arabic, 'mother' is written as ", after: ".", answer: "umm" },
  { before: "In Arabic, 'brother' is written as ", after: ".", answer: "akh" },
  { before: "In Arabic, 'sister' is written as ", after: ".", answer: "ukht" },
  { before: "In Arabic, 'teacher' (male) is written as ", after: ".", answer: "muallim" },
  { before: "In Arabic, 'doctor' (male) is written as ", after: ".", answer: "tabib" },
  { before: "In Arabic, 'engineer' is written as ", after: ".", answer: "muhandis" },
  { before: "In Arabic, 'farmer' is written as ", after: ".", answer: "fallah" },
  { before: "In Arabic, 'cook' is written as ", after: ".", answer: "tabbakh" },
  { before: "In Arabic, 'nurse' is written as ", after: ".", answer: "mumarrida" },
  { before: "In Arabic, 'police officer' is written as ", after: ".", answer: "shurti" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["My father", "(abi)", "is a", "teacher", "(muallim)."], sentence: "My father (abi) is a teacher (muallim)." },
  { chunks: ["My mother", "(ummi)", "is a", "doctor", "(tabiba)."], sentence: "My mother (ummi) is a doctor (tabiba)." },
  { chunks: ["My brother", "(akhi)", "is an", "engineer", "(muhandis)."], sentence: "My brother (akhi) is an engineer (muhandis)." },
  { chunks: ["My uncle", "(khaali)", "is a", "farmer", "(fallah)."], sentence: "My uncle (khaali) is a farmer (fallah)." },
  { chunks: ["My sister", "(ukhti)", "is a", "nurse", "(mumarrida)."], sentence: "My sister (ukhti) is a nurse (mumarrida)." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which word means 'grandmother'?",
    correct: "jadda",
    distractors: ["jadd", "umm", "khaala"],
    explanation: "'jadda' means grandmother; 'jadd' is grandfather, 'umm' is mother, and 'khaala' is maternal aunt.",
  },
  {
    prompt: "Which word means 'maternal uncle'?",
    correct: "khaal",
    distractors: ["khaala", "akh", "ibn"],
    explanation: "'khaal' means maternal uncle; 'khaala' is maternal aunt, 'akh' is brother, and 'ibn' is son.",
  },
  {
    prompt: "Which word correctly spells the profession meaning 'engineer'?",
    correct: "muhandis",
    distractors: ["muhandiz", "muhandes", "muhandiss"],
    explanation: "The correct spelling is 'muhandis' — note the single final 's', not 'z' or a doubled letter.",
  },
  {
    prompt: "Which word means 'driver'?",
    correct: "sae'q",
    distractors: ["fallah", "shurti", "tabbakh"],
    explanation: "'sae'q' means driver; 'fallah' is farmer, 'shurti' is police officer, and 'tabbakh' is cook.",
  },
  {
    prompt: "Which profession word matches 'a person who cooks food for a living'?",
    correct: "tabbakh",
    distractors: ["tabib", "muallim", "muhandis"],
    explanation: "'tabbakh' means cook; 'tabib' means doctor, 'muallim' means teacher, and 'muhandis' means engineer.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "ab", meaning: "father" },
  { term: "umm", meaning: "mother" },
  { term: "akh", meaning: "brother" },
  { term: "ukht", meaning: "sister" },
  { term: "jadd", meaning: "grandfather" },
  { term: "jadda", meaning: "grandmother" },
  { term: "khaal", meaning: "maternal uncle" },
  { term: "khaala", meaning: "maternal aunt" },
  { term: "ibn", meaning: "son" },
  { term: "bint", meaning: "daughter" },
  { term: "muallim", meaning: "teacher (male)" },
  { term: "tabib", meaning: "doctor (male)" },
  { term: "muhandis", meaning: "engineer" },
  { term: "fallah", meaning: "farmer" },
  { term: "tabbakh", meaning: "cook" },
  { term: "sae'q", meaning: "driver" },
  { term: "mumarrida", meaning: "nurse" },
  { term: "shurti", meaning: "police officer" },
];

const CATEGORY_BUCKETS: { id: string; label: string; items: string[] }[] = [
  { id: "family", label: "Family member", items: ["ab", "umm", "akh", "ukht", "jadd", "jadda", "khaal", "khaala", "ibn", "bint"] },
  { id: "profession", label: "Profession", items: ["muallim", "tabib", "muhandis", "fallah", "tabbakh", "sae'q", "mumarrida", "shurti"] },
];

export const familyWriting: Skill = {
  id: "g7-ar-w-family",
  code: "W.2",
  subjectId: "arabic",
  strandId: "g7-ar-writing",
  grade: 7,
  title: "Guided writing: spelling (family and professions)",
  description: "Practise the correct spelling of romanized Arabic family and profession words: fill in words, sort family terms from professions, order sentences, and match meanings.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each romanized Arabic word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'khaal'/'khaala' are maternal uncle/aunt — different from 'akh'/'ukht' (brother/sister).",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const picks: { id: string; label: string; bucket: string }[] = [];
      CATEGORY_BUCKETS.forEach((b) => {
        const n = randInt(rng, 3, 4);
        shuffle(rng, b.items).slice(0, n).forEach((item, i) => picks.push({ id: `${b.id}-${i}-${item}`, label: item, bucket: b.id }));
      });
      const items = shuffle(rng, picks.map((p) => ({ id: p.id, label: p.label })));
      const buckets = CATEGORY_BUCKETS.map((b) => ({ id: b.id, label: b.label }));
      const correctBucket: Record<string, string> = {};
      picks.forEach((p) => (correctBucket[p.id] = p.bucket));

      return {
        kind: "categorize",
        prompt: "Sort each romanized Arabic word: is it a family member, or a profession?",
        items,
        buckets,
        correctBucket,
        hint: "A profession is a job someone does; a family member is a relative.",
        explanation: picks
          .map((p) => `"${p.label}" is a ${CATEGORY_BUCKETS.find((b) => b.id === p.bucket)!.label.toLowerCase()}.`)
          .join(" "),
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the pieces to form a correct sentence about a family member's profession.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The family word comes first, then 'is a', then the profession.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);

      return {
        kind: "fill-blank",
        prompt: "Fill in the missing Arabic word, spelled correctly, to complete the sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        inputMode: "text",
        hint: "Think about the family and profession words you've learned.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    const q = randChoice(rng, MC_ITEMS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Think carefully about the meaning and exact spelling of each word.",
      explanation: q.explanation,
    };
  },
};
