import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Ich gehe ", after: " Supermarkt.", answer: "zum" },
  { before: "Ich gehe ", after: " Bibliothek.", answer: "zur" },
  { before: "Ich gehe ", after: " Krankenhaus.", answer: "zum" },
  { before: "Ich gehe ", after: " Kirche.", answer: "zur" },
  { before: "Ich gehe ", after: " Rathaus.", answer: "zum" },
  { before: "Wohin ", after: " Sie?", answer: "gehen" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wohin gehen Sie", "heute", "?"], sentence: "Wohin gehen Sie heute?" },
  { chunks: ["Ich gehe", "zum Supermarkt", "."], sentence: "Ich gehe zum Supermarkt." },
  { chunks: ["Ich gehe", "zur Bibliothek", "."], sentence: "Ich gehe zur Bibliothek." },
  { chunks: ["Ich gehe", "zur Post", "und", "zur Bank", "."], sentence: "Ich gehe zur Post und zur Bank." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct contraction to complete: 'Ich gehe ___ Supermarkt.' (der Supermarkt, masculine)",
    correct: "zum",
    distractors: ["zur", "zu der", "zu dem der"],
    explanation: "'zu + dem' contracts to 'zum' before masculine/neuter nouns like 'der Supermarkt'.",
  },
  {
    prompt: "Choose the correct contraction to complete: 'Ich gehe ___ Bibliothek.' (die Bibliothek, feminine)",
    correct: "zur",
    distractors: ["zum", "zu die", "zu dem"],
    explanation: "'zu + der' contracts to 'zur' before feminine nouns like 'die Bibliothek'.",
  },
  {
    prompt: "Which contraction correctly completes: 'Ich gehe ___ Rathaus.' (das Rathaus, neuter)",
    correct: "zum",
    distractors: ["zur", "zu das", "zus"],
    explanation: "Neuter nouns like 'das Rathaus' also take 'zum' (zu + dem), just like masculine nouns.",
  },
  {
    prompt: "Choose the correct formal question for 'Where are you going?'",
    correct: "Wohin gehen Sie?",
    distractors: ["Wohin geht Sie?", "Wo gehen Sie?", "Wohin gehst du?"],
    explanation: "'Wohin' asks about direction and pairs with 'Sie gehen'; 'Wo' asks about static location, and 'gehst' is the 'du'-form.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "der Supermarkt", meaning: "supermarket" },
  { term: "der Markt", meaning: "market" },
  { term: "die Bibliothek", meaning: "library" },
  { term: "die Schule", meaning: "school" },
  { term: "das Krankenhaus", meaning: "hospital" },
  { term: "die Kirche", meaning: "church" },
  { term: "das Rathaus", meaning: "town hall" },
  { term: "der Park", meaning: "park" },
  { term: "die Bank", meaning: "bank" },
  { term: "die Post", meaning: "post office" },
];

export const townWriting: Skill = {
  id: "g8-de-w-town",
  code: "W.3",
  subjectId: "german",
  strandId: "g8-de-writing",
  grade: 8,
  title: "Writing about places in town",
  description: "Practise the 'zum'/'zur' contraction rule and write formal sentences about going places around town.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence about going to a place.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'zum' pairs with masculine/neuter places, 'zur' pairs with feminine places.",
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
        hint: "Check the gender of the place noun before picking 'zum' or 'zur'.",
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
        prompt: "Match each German place word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'die Kirche' and 'das Rathaus' are both important town buildings, but only one has a different gender.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the formal German sentence about going somewhere.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Decide whether the place is masculine/neuter ('zum') or feminine ('zur').",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
