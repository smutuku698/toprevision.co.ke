import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Wie ", after: " ich zum Bahnhof?", answer: "komme" },
  { before: "", after: " Sie geradeaus!", answer: "Gehen" },
  { before: "", after: " Sie rechts ab!", answer: "Biegen" },
  { before: "", after: " Sie die zweite Straße links!", answer: "Nehmen" },
  { before: "", after: " Sie an der Ampel!", answer: "Halten" },
  { before: "Wo ist die ", after: "?", answer: "Bibliothek" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Gehen Sie", "geradeaus", "!"], sentence: "Gehen Sie geradeaus!" },
  { chunks: ["Biegen Sie", "rechts", "ab", "!"], sentence: "Biegen Sie rechts ab!" },
  { chunks: ["Nehmen Sie", "die zweite Straße", "links", "!"], sentence: "Nehmen Sie die zweite Straße links!" },
  { chunks: ["Halten Sie", "an der Ampel", "!"], sentence: "Halten Sie an der Ampel!" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct formal imperative for 'Turn right!'",
    correct: "Biegen Sie rechts ab!",
    distractors: ["Abbiegen Sie rechts!", "Biegen Sie ab rechts!", "Biegt rechts ab!"],
    explanation: "'Abbiegen' is a separable verb — in the imperative, the prefix 'ab' detaches and moves to the end: 'Biegen Sie rechts ab!'.",
  },
  {
    prompt: "Choose the correct formal question for 'How do I get to the train station?'",
    correct: "Wie komme ich zum Bahnhof?",
    distractors: ["Wie komme ich zur Bahnhof?", "Wo komme ich zum Bahnhof?", "Wie kommen ich zum Bahnhof?"],
    explanation: "'Der Bahnhof' is masculine, so 'zu + dem' contracts to 'zum'; the verb form for 'ich' is 'komme', not 'kommen'.",
  },
  {
    prompt: "Choose the correct formal imperative for 'Take the second street on the left!'",
    correct: "Nehmen Sie die zweite Straße links!",
    distractors: ["Nimm die zweite Straße links!", "Nehmen Sie die zweiten Straße links!", "Sie nehmen die zweite Straße links!"],
    explanation: "The formal imperative is 'Nehmen Sie ...', not the 'du'-form 'Nimm'; 'zweite' agrees with feminine 'Straße' and doesn't take an extra 'n'.",
  },
  {
    prompt: "Which word correctly completes: 'Wo ist die ___?' (library)",
    correct: "Bibliothek",
    distractors: ["Bibliotek", "Biblothek", "Bibliothec"],
    explanation: "The correct spelling is 'Bibliothek' — note the 'th' combination and the single 'h'.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "nach rechts", meaning: "to the right" },
  { term: "nach links", meaning: "to the left" },
  { term: "geradeaus", meaning: "straight ahead" },
  { term: "an der Ecke", meaning: "at the corner" },
  { term: "die Ampel", meaning: "traffic light" },
  { term: "die Kreuzung", meaning: "intersection" },
  { term: "die Straße", meaning: "street" },
  { term: "der Bahnhof", meaning: "train station" },
];

export const transportWriting: Skill = {
  id: "g8-de-w-transport",
  code: "W.9",
  subjectId: "german",
  strandId: "g8-de-writing",
  grade: 8,
  title: "Writing directions and getting around",
  description: "Write formal imperative directions and ask formal questions about getting around town.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct formal direction.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Formal direction commands start with the imperative verb, then 'Sie'; separable prefixes go to the end.",
        explanation: `The correct sentence is: "${set.sentence}"`,
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
        hint: "Check for separable-verb prefixes moving to the end, and the 'zum'/'zur' contraction.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each German direction word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'nach rechts' and 'nach links' are opposite directions.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the formal German direction sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Picture the direction being given and think of the formal imperative verb.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
