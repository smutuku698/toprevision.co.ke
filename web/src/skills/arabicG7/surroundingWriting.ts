import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 3.3 Guided Writing: Paragraph Writing — identifying places where things are
// bought (the market) and constructing a simple paragraph using acquired vocabulary.

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Near my house there is a ", after: " where I borrow books.", answer: "maktaba" },
  { before: "Every Friday, my family prays at the ", after: ".", answer: "masjid" },
  { before: "My mother buys vegetables at the ", after: ".", answer: "suuq" },
  { before: "I study every day at my ", after: ".", answer: "madrasa" },
  { before: "In the evening, children play in the ", after: ".", answer: "hadiqa" },
  { before: "Our ", after: " is next to a big river.", answer: "bayt" },
  { before: "A big ", after: " flows behind the market.", answer: "nahr" },
];

const PARAGRAPH_SETS: { sentences: string[] }[] = [
  {
    sentences: [
      "My house (bayt) is on a small road (tareeq).",
      "Near my house there is a big market (suuq).",
      "At the market, my mother buys bread (khubz) and rice (aruz).",
      "After the market, we walk to the mosque (masjid) to pray.",
    ],
  },
  {
    sentences: [
      "Every day I walk to my school (madrasa).",
      "Next to my school there is a library (maktaba).",
      "On Saturday, my family goes to the market (suuq) to buy food.",
      "In the evening, we relax in the garden (hadiqa) near the river (nahr).",
    ],
  },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which word means 'mosque'?",
    correct: "masjid",
    distractors: ["madrasa", "maktaba", "hadiqa"],
    explanation: "'masjid' means mosque; 'madrasa' is school, 'maktaba' is library, and 'hadiqa' is garden/park.",
  },
  {
    prompt: "Which word means 'river'?",
    correct: "nahr",
    distractors: ["tareeq", "bayt", "suuq"],
    explanation: "'nahr' means river; 'tareeq' is road/street, 'bayt' is house/home, and 'suuq' is market.",
  },
  {
    prompt: "You need to buy bread and vegetables for your family. Where should you go in your paragraph?",
    correct: "suuq",
    distractors: ["madrasa", "masjid", "hadiqa"],
    explanation: "'suuq' means market — the place where food and goods are bought; the other places are for study, prayer, and play.",
  },
  {
    prompt: "Which word means 'road' or 'street'?",
    correct: "tareeq",
    distractors: ["nahr", "hadiqa", "maktaba"],
    explanation: "'tareeq' means road/street; 'nahr' is river, 'hadiqa' is garden/park, and 'maktaba' is library.",
  },
  {
    prompt: "Which sentence best opens a paragraph describing your surrounding?",
    correct: "My house (bayt) is on a small road (tareeq).",
    distractors: ["At the market, my mother buys bread.", "We relax in the garden near the river.", "After the market, we walk to the mosque."],
    explanation: "A good paragraph opening sets the scene by describing your home first, before moving on to other nearby places.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "madrasa", meaning: "school" },
  { term: "bayt", meaning: "house / home" },
  { term: "suuq", meaning: "market" },
  { term: "masjid", meaning: "mosque" },
  { term: "maktaba", meaning: "library" },
  { term: "hadiqa", meaning: "garden / park" },
  { term: "tareeq", meaning: "road / street" },
  { term: "nahr", meaning: "river" },
];

const CATEGORY_BUCKETS: { id: string; label: string; items: string[] }[] = [
  { id: "buy", label: "Place for buying things", items: ["suuq"] },
  { id: "learn", label: "Place for learning", items: ["madrasa", "maktaba"] },
  { id: "pray", label: "Place for prayer", items: ["masjid"] },
  { id: "leisure", label: "Place for rest or play", items: ["hadiqa", "nahr"] },
];

export const surroundingWriting: Skill = {
  id: "g7-ar-w-surrounding",
  code: "W.3",
  subjectId: "arabic",
  strandId: "g7-ar-writing",
  grade: 7,
  title: "Guided writing: paragraph writing (my surrounding)",
  description: "Practise romanized Arabic words for places in your surrounding, especially the market: fill in words, sort places by purpose, build a simple paragraph, and match meanings.",
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
        prompt: "Match each romanized Arabic place word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'masjid' and 'madrasa' both start with 'ma-' but mean different places.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const picks: { id: string; label: string; bucket: string }[] = [];
      CATEGORY_BUCKETS.forEach((b) => {
        const n = Math.min(b.items.length, randInt(rng, 1, 2));
        shuffle(rng, b.items).slice(0, n).forEach((item, i) => picks.push({ id: `${b.id}-${i}-${item}`, label: item, bucket: b.id }));
      });
      const items = shuffle(rng, picks.map((p) => ({ id: p.id, label: p.label })));
      const buckets = CATEGORY_BUCKETS.map((b) => ({ id: b.id, label: b.label }));
      const correctBucket: Record<string, string> = {};
      picks.forEach((p) => (correctBucket[p.id] = p.bucket));

      return {
        kind: "categorize",
        prompt: "Sort each place word by what it is mainly used for.",
        items,
        buckets,
        correctBucket,
        hint: "Only one of these places is where you buy things — think about what the other places are used for.",
        explanation: picks
          .map((p) => `"${p.label}" is a ${CATEGORY_BUCKETS.find((b) => b.id === p.bucket)!.label.toLowerCase()}.`)
          .join(" "),
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, PARAGRAPH_SETS);
      const items = shuffle(rng, set.sentences.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.sentences.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the sentences to form a simple, coherent paragraph about your surrounding.",
        instruction: "Click the sentences in the correct order.",
        items,
        correctOrder,
        hint: "A good paragraph starts by describing home, then moves outward to nearby places.",
        explanation: `The correctly ordered paragraph is: "${set.sentences.join(" ")}"`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);

      return {
        kind: "fill-blank",
        prompt: "Fill in the missing Arabic word to complete the sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        inputMode: "text",
        hint: "Think about the place words you've learned.",
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
      hint: "Think carefully about the meaning of each place word.",
      explanation: q.explanation,
    };
  },
};
