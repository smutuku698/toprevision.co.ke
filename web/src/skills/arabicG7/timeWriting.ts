import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 3.4 Guided Writing: Sequencing Ideas — listing festivals/holidays (Eid) and
// organising ideas into a coherent paragraph.

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "The Arabic word for \"early\" is ", after: ".", answer: "mubakkiran" },
  { before: "The Arabic word for \"on time\" is ", after: ".", answer: "fi al-waqt" },
  { before: "The Arabic word for \"holiday\" is ", after: ".", answer: "'utla" },
  { before: "The major Islamic festival celebrated with family is called ", after: ".", answer: "Eid" },
  { before: "The Arabic phrase for \"I wake up\" is ", after: ".", answer: "astayqidh" },
  { before: "The Arabic phrase for \"I study\" is ", after: ".", answer: "adrus" },
];

const PARAGRAPH_SETS: { sentences: string[] }[] = [
  {
    sentences: [
      "Every year, my family looks forward to Eid.",
      "First, we wake up (astayqidh) mubakkiran and get dressed.",
      "Then, we visit the masjid for prayers.",
      "Afterwards, we share a big meal with relatives.",
      "Finally, we spend the rest of the 'utla visiting friends.",
    ],
  },
  {
    sentences: [
      "On a normal school day, I astayqidh mubakkiran.",
      "Then I aakul breakfast quickly.",
      "After that, I adhhab ilaa al-madrasa fi al-waqt.",
      "In the evening, I adrus before I anaam.",
    ],
  },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which word means \"holiday\"?",
    correct: "'utla",
    distractors: ["madrasa", "mubakkiran", "fi al-waqt"],
    explanation: "\"'utla\" means holiday; \"madrasa\" is school, \"mubakkiran\" is early, and \"fi al-waqt\" is on time.",
  },
  {
    prompt: "You are writing a paragraph about your Eid celebration. Which sentence best belongs at the end?",
    correct: "Finally, we spend the rest of the 'utla visiting friends.",
    distractors: ["Every year, my family looks forward to Eid.", "First, we wake up mubakkiran and get dressed.", "Then, we visit the masjid for prayers."],
    explanation: "A closing sentence should come last in a coherent paragraph — a \"Finally...\" sentence signals the paragraph's end, not its start.",
  },
  {
    prompt: "Which word means \"I go to school\"?",
    correct: "adhhab ilaa al-madrasa",
    distractors: ["astayqidh", "anaam", "adrus"],
    explanation: "\"adhhab ilaa al-madrasa\" means I go to school; \"astayqidh\" is I wake up, \"anaam\" is I sleep, and \"adrus\" is I study.",
  },
  {
    prompt: "Which sequencing word signals the very first step in a paragraph?",
    correct: "First",
    distractors: ["Finally", "Afterwards", "Then"],
    explanation: "\"First\" signals the opening step of a sequence; the others signal steps in the middle or the end.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "astayqidh", meaning: "I wake up" },
  { term: "aakul", meaning: "I eat" },
  { term: "adhhab ilaa al-madrasa", meaning: "I go to school" },
  { term: "adrus", meaning: "I study" },
  { term: "anaam", meaning: "I sleep" },
  { term: "mubakkiran", meaning: "early" },
  { term: "fi al-waqt", meaning: "on time" },
  { term: "'utla", meaning: "holiday" },
];

const CATEGORY_BUCKETS: { id: string; label: string; items: string[] }[] = [
  { id: "routine", label: "Daily routine word", items: ["astayqidh", "aakul", "adhhab ilaa al-madrasa", "adrus", "anaam"] },
  { id: "festival", label: "Festival / holiday word", items: ["'utla", "Eid", "mubakkiran"] },
];

export const timeWriting: Skill = {
  id: "g7-ar-w-time",
  code: "W.4",
  subjectId: "arabic",
  strandId: "g7-ar-writing",
  grade: 7,
  title: "Guided writing: sequencing ideas (festivals and holidays)",
  description: "Practise organising ideas about time, daily routine and festivals into a coherent Arabic-themed paragraph.",
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
        prompt: "Match each romanized Arabic word or phrase to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'mubakkiran' (early) and 'fi al-waqt' (on time) are related but different ideas.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const picks: { id: string; label: string; bucket: string }[] = [];
      CATEGORY_BUCKETS.forEach((b) => {
        const n = Math.min(b.items.length, randInt(rng, 2, 3));
        shuffle(rng, b.items).slice(0, n).forEach((item, i) => picks.push({ id: `${b.id}-${i}-${item}`, label: item, bucket: b.id }));
      });
      const items = shuffle(rng, picks.map((p) => ({ id: p.id, label: p.label })));
      const buckets = CATEGORY_BUCKETS.map((b) => ({ id: b.id, label: b.label }));
      const correctBucket: Record<string, string> = {};
      picks.forEach((p) => (correctBucket[p.id] = p.bucket));

      return {
        kind: "categorize",
        prompt: "Sort each word: is it about a Daily routine, or about a Festival/holiday?",
        items,
        buckets,
        correctBucket,
        hint: "Routine words describe things you do every day; festival words describe special, less-frequent occasions.",
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
        prompt: "Arrange the sentences to form a coherent paragraph in correct sequence.",
        instruction: "Click the sentences in the correct order.",
        items,
        correctOrder,
        hint: "Look for sequencing words like 'First', 'Then', 'Afterwards', and 'Finally'.",
        explanation: `The correctly ordered paragraph is: "${set.sentences.join(" ")}"`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);

      return {
        kind: "fill-blank",
        prompt: "Fill in the missing Arabic word or phrase to complete the sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        inputMode: "text",
        hint: "Think about the time and festival vocabulary you've learned.",
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
      hint: "Think carefully about the meaning of each word and how a coherent paragraph flows.",
      explanation: q.explanation,
    };
  },
};
