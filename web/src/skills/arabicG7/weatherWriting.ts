import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 3.8 Guided Writing: Paragraph Writing — outlining vocabulary for clothes worn in
// different seasons, and using it to write a simple paragraph.

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "The Arabic word for \"hot\" is ", after: ".", answer: "haar" },
  { before: "The Arabic word for \"cold\" is ", after: ".", answer: "baarid" },
  { before: "The Arabic word for \"light shirt\" is ", after: ".", answer: "qamees khafeef" },
  { before: "The Arabic word for \"sweater\" is ", after: ".", answer: "kanza soofiyya" },
  { before: "The Arabic word for \"umbrella\" is ", after: ".", answer: "mizalla" },
  { before: "The Arabic word for \"rain\" is ", after: ".", answer: "matar" },
];

const PARAGRAPH_SETS: { sentences: string[] }[] = [
  {
    sentences: [
      "In our region, the weather changes with the seasons.",
      "When it is haar, I wear a qamees khafeef.",
      "When matar comes, I carry a mizalla and wear a mi'taf.",
      "When it is baarid, I wear a kanza soofiyya to stay warm.",
    ],
  },
  {
    sentences: [
      "Yesterday the shams was strong all afternoon.",
      "So I wore a qubba'a to protect my head.",
      "Today the riyah picked up and it grew baarid.",
      "So I put on my kanza soofiyya before going outside.",
    ],
  },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which word means \"cold\"?",
    correct: "baarid",
    distractors: ["haar", "shams", "matar"],
    explanation: "\"baarid\" means cold; \"haar\" is hot, \"shams\" is sun, and \"matar\" is rain.",
  },
  {
    prompt: "You are writing a paragraph about a rainy day. Which clothing word fits best?",
    correct: "mizalla (umbrella)",
    distractors: ["qamees khafeef (light shirt)", "qubba'a (hat)", "None of these fit a rainy day"],
    explanation: "\"mizalla\" (umbrella) is the item most directly useful in matar (rain).",
  },
  {
    prompt: "Which word means \"wind\"?",
    correct: "riyah",
    distractors: ["jabal", "bahr", "ghaaba"],
    explanation: "\"riyah\" means wind; \"jabal\" is mountain, \"bahr\" is sea, and \"ghaaba\" is forest.",
  },
  {
    prompt: "Which sentence correctly connects weather to clothing, ready for a paragraph?",
    correct: "When it is haar, I wear a qamees khafeef.",
    distractors: ["When it is haar, I wear a kanza soofiyya.", "When it is baarid, I wear a qamees khafeef only.", "The weather has nothing to do with clothing choice."],
    explanation: "A light shirt (qamees khafeef) suits hot (haar) weather — the other pairings mismatch clothing to the wrong season.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "matar", meaning: "rain" },
  { term: "shams", meaning: "sun" },
  { term: "haar", meaning: "hot" },
  { term: "baarid", meaning: "cold" },
  { term: "riyah", meaning: "wind" },
  { term: "qamees khafeef", meaning: "light shirt" },
  { term: "kanza soofiyya", meaning: "sweater" },
  { term: "mizalla", meaning: "umbrella" },
];

const CATEGORY_BUCKETS: { id: string; label: string; items: string[] }[] = [
  { id: "weather", label: "Weather word", items: ["matar", "shams", "haar", "baarid", "riyah"] },
  { id: "clothing", label: "Clothing word", items: ["qamees khafeef", "kanza soofiyya", "mizalla", "mi'taf", "qubba'a"] },
];

export const weatherWriting: Skill = {
  id: "g7-ar-w-weather",
  code: "W.8",
  subjectId: "arabic",
  strandId: "g7-ar-writing",
  grade: 7,
  title: "Guided writing: paragraph writing (weather and environment)",
  description: "Practise weather and season-appropriate clothing vocabulary, and use it to build a simple, coherent Arabic-themed paragraph.",
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
        hint: "'haar' and 'baarid' are opposites — hot and cold.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const picks: { id: string; label: string; bucket: string }[] = [];
      CATEGORY_BUCKETS.forEach((b) => {
        const n = randInt(rng, 3, Math.min(4, b.items.length));
        shuffle(rng, b.items).slice(0, n).forEach((item, i) => picks.push({ id: `${b.id}-${i}-${item}`, label: item, bucket: b.id }));
      });
      const items = shuffle(rng, picks.map((p) => ({ id: p.id, label: p.label })));
      const buckets = CATEGORY_BUCKETS.map((b) => ({ id: b.id, label: b.label }));
      const correctBucket: Record<string, string> = {};
      picks.forEach((p) => (correctBucket[p.id] = p.bucket));

      return {
        kind: "categorize",
        prompt: "Sort each word: is it a weather word, or a clothing word?",
        items,
        buckets,
        correctBucket,
        hint: "A weather word describes the sky/temperature; a clothing word names something you wear.",
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
        prompt: "Arrange the sentences to form a coherent paragraph about weather and clothing.",
        instruction: "Click the sentences in the correct order.",
        items,
        correctOrder,
        hint: "The paragraph introduces the topic first, then gives examples in a logical order.",
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
        hint: "Think about the weather and clothing words you've learned.",
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
      hint: "Think carefully about which clothing genuinely matches which weather.",
      explanation: q.explanation,
    };
  },
};
