import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "In Arabic, 'Good morning' is written as ", after: ".", answer: "Sabahal khayr" },
  { before: "In Arabic, 'Good evening' is written as ", after: ".", answer: "Masaa al khayr" },
  { before: "In Arabic, 'How are you?' (to a boy) is written as ", after: ".", answer: "Keyfa haaluka" },
  { before: "In Arabic, 'What is your name?' (to a boy) is written as ", after: ".", answer: "Maa ismuka" },
  { before: "In Arabic, 'I am well, thank you' is written as ", after: ".", answer: "Bikhayr shukran" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Sabahal khayr.", "Keyfa haaluka?", "Bikhayr shukran."], sentence: "Sabahal khayr. Keyfa haaluka? Bikhayr shukran." },
  { chunks: ["Masaa al khayr.", "Maa ismuka?", "Ismi."], sentence: "Masaa al khayr. Maa ismuka? Ismi." },
  { chunks: ["Assalamu alaykum.", "Keyfa haaluka?", "Shukran."], sentence: "Assalamu alaykum. Keyfa haaluka? Shukran." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which Arabic phrase means 'Good morning'?",
    correct: "Sabahal khayr",
    distractors: ["Masaa al khayr", "Keyfa haaluka", "Assalamu alaykum"],
    explanation: "'Sabahal khayr' means 'Good morning'; 'Masaa al khayr' is 'Good evening', 'Keyfa haaluka' asks 'How are you?', and 'Assalamu alaykum' means 'Peace be upon you'.",
  },
  {
    prompt: "Which phrase correctly asks a boy 'What is your name?'",
    correct: "Maa ismuka",
    distractors: ["Ismi", "Keyfa haaluka", "Shukran"],
    explanation: "'Maa ismuka' asks 'What is your name?'; 'Ismi' means 'My name is', 'Keyfa haaluka' asks 'How are you?', and 'Shukran' means 'Thank you'.",
  },
  {
    prompt: "Which is the correct spelling of the greeting meaning 'Peace be upon you'?",
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
];

export const greetingsWriting: Skill = {
  id: "g8-ar-w-greetings",
  code: "W.1",
  subjectId: "arabic",
  strandId: "g8-ar-writing",
  grade: 8,
  title: "Writing greetings and introductions",
  description: "Practise romanized Arabic greetings and introductions: fill in missing phrases, order a short exchange, and match expressions to their meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the lines to form a logical greeting exchange.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Think about the natural order of a greeting: hello, then a question, then an answer.",
        explanation: `The correct order is: "${set.sentence}"`,
      };
    }

    if (branch === "choice") {
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
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 4);
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

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing Arabic word or phrase to complete the sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      inputMode: "text",
      hint: "Think about the greeting expressions you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
