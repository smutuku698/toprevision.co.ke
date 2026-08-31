import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 3.1 Guided Writing: Handwriting — neatness/legibility (expressed here as correct
// spelling and well-formed sentences, since this app has no handwriting-tracing UI) and using
// greeting vocabulary to make sentences introducing friends.

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "In Arabic, 'Good morning' is written as ", after: ".", answer: "Sabahal khayr" },
  { before: "In Arabic, 'Good evening' is written as ", after: ".", answer: "Masaa al khayr" },
  { before: "In Arabic, 'How are you?' (to a boy) is written as ", after: ".", answer: "Keyfa haaluka" },
  { before: "In Arabic, 'What is your name?' (to a boy) is written as ", after: ".", answer: "Maa ismuka" },
  { before: "In Arabic, 'I am well, thank you' is written as ", after: ".", answer: "Bikhayr shukran" },
  { before: "In Arabic, 'Peace be upon you' is written as ", after: ".", answer: "Assalamu alaykum" },
  { before: "In Arabic, 'Thank you' is written as ", after: ".", answer: "Shukran" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; description: string }[] = [
  { chunks: ["Assalamu alaykum.", "Maa ismuka?", "Ismi Ahmad."], sentence: "Assalamu alaykum. Maa ismuka? Ismi Ahmad.", description: "a greeting, then a question, then a reply introducing yourself" },
  { chunks: ["Sabahal khayr.", "Keyfa haaluka?", "Bikhayr shukran."], sentence: "Sabahal khayr. Keyfa haaluka? Bikhayr shukran.", description: "a greeting, then a question, then a reply about how you are" },
  { chunks: ["Masaa al khayr.", "Maa ismuka?", "Ismi Fatima."], sentence: "Masaa al khayr. Maa ismuka? Ismi Fatima.", description: "a greeting, then a question, then a reply introducing yourself" },
  { chunks: ["Assalamu alaykum.", "Keyfa haaluka?", "Bikhayr shukran."], sentence: "Assalamu alaykum. Keyfa haaluka? Bikhayr shukran.", description: "a greeting, then a question, then a reply about how you are" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which Arabic phrase means 'Good morning'?",
    correct: "Sabahal khayr",
    distractors: ["Masaa al khayr", "Keyfa haaluka", "Assalamu alaykum"],
    explanation: "'Sabahal khayr' means 'Good morning'; 'Masaa al khayr' is 'Good evening', 'Keyfa haaluka' asks 'How are you?', and 'Assalamu alaykum' means 'Peace be upon you'.",
  },
  {
    prompt: "You are introducing yourself to a new friend. Which phrase correctly asks a boy 'What is your name?'",
    correct: "Maa ismuka",
    distractors: ["Ismi", "Keyfa haaluka", "Shukran"],
    explanation: "'Maa ismuka' asks 'What is your name?'; 'Ismi' means 'My name is', 'Keyfa haaluka' asks 'How are you?', and 'Shukran' means 'Thank you'.",
  },
  {
    prompt: "Which is the correctly and neatly spelled version of the greeting meaning 'Peace be upon you'?",
    correct: "Assalamu alaykum",
    distractors: ["Asalamu alaykum", "Assalamu alaykom", "Assalamu alaykun"],
    explanation: "The correct spelling is 'Assalamu alaykum' — note the double 's' and the ending '-um'.",
  },
  {
    prompt: "Which phrase correctly answers 'Keyfa haaluka?' (How are you?)",
    correct: "Bikhayr shukran",
    distractors: ["Sabahal khayr", "Maa ismuka", "Ismi"],
    explanation: "'Bikhayr shukran' means 'I am well, thank you' — the natural answer to 'How are you?'.",
  },
  {
    prompt: "A friend says goodbye to you at the end of the day. Which phrase is the correct reply?",
    correct: "Ma'a as-salama",
    distractors: ["Sabahal khayr", "Maa ismuka?", "Keyfa haaluka?"],
    explanation: "'Ma'a as-salama' means 'goodbye' — the right phrase to close a conversation, not to open or question one.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "assalamu alaykum", meaning: "Peace be upon you" },
  { term: "sabahal khayr", meaning: "Good morning" },
  { term: "masaa al khayr", meaning: "Good evening" },
  { term: "maa ismuka?", meaning: "What is your name? (to a boy)" },
  { term: "ismi", meaning: "My name is" },
  { term: "keyfa haaluka?", meaning: "How are you? (to a boy)" },
  { term: "bikhayr shukran", meaning: "I am well, thank you" },
  { term: "shukran", meaning: "Thank you" },
  { term: "ma'a as-salama", meaning: "Goodbye" },
];

const CATEGORY_BUCKETS: { id: string; label: string; items: string[] }[] = [
  { id: "greeting", label: "Greeting", items: ["assalamu alaykum", "sabahal khayr", "masaa al khayr"] },
  { id: "question", label: "Question", items: ["maa ismuka?", "keyfa haaluka?"] },
  { id: "answer", label: "Answer / response", items: ["ismi", "bikhayr shukran", "shukran"] },
  { id: "farewell", label: "Farewell", items: ["ma'a as-salama"] },
];

export const greetingsWriting: Skill = {
  id: "g7-ar-w-greetings",
  code: "W.1",
  subjectId: "arabic",
  strandId: "g7-ar-writing",
  grade: 7,
  title: "Guided writing: handwriting (greetings)",
  description: "Practise writing romanized Arabic greetings neatly and correctly: fill in missing phrases, sort them by role in a conversation, order a short exchange, and match expressions to their meaning.",
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
        prompt: "Match each romanized Arabic greeting to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'Maa ismuka?' and 'Keyfa haaluka?' both start with a question word but ask very different things.",
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
        prompt: "Sort each romanized Arabic phrase by its role in a conversation.",
        items,
        buckets,
        correctBucket,
        hint: "A greeting opens a conversation, a question asks something, an answer replies, and a farewell closes it.",
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
        prompt: `Arrange the lines to form a logical greeting exchange: ${set.description}.`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Think about the natural order of a greeting: hello, then a question, then an answer.",
        explanation: `The correct order is: "${set.sentence}"`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);

      return {
        kind: "fill-blank",
        prompt: "Fill in the missing Arabic word or phrase to complete the sentence neatly and correctly.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        inputMode: "text",
        hint: "Think about the greeting expressions you've learned.",
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
      hint: "Think carefully about the meaning and exact spelling of each greeting expression.",
      explanation: q.explanation,
    };
  },
};
