import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, sortPrompt, orderPrompt, fillPrompt, writingScenarioCloser } from "./g5FrShared";

type Tag = "item" | "preposition";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "la table", meaning: "the table", tag: "item" },
  { word: "la chaise", meaning: "the chair", tag: "item" },
  { word: "la poubelle", meaning: "the bin", tag: "item" },
  { word: "le tableau", meaning: "the board", tag: "item" },
  { word: "la porte", meaning: "the door", tag: "item" },
  { word: "le cahier", meaning: "the notebook", tag: "item" },
  { word: "le stylo", meaning: "the pen", tag: "item" },
  { word: "dans", meaning: "in", tag: "preposition" },
  { word: "derrière", meaning: "behind", tag: "preposition" },
  { word: "entre", meaning: "between", tag: "preposition" },
  { word: "sur", meaning: "on", tag: "preposition" },
  { word: "sous", meaning: "under", tag: "preposition" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Le stylo est ", after: " la table.", answer: "sur", gloss: "Le stylo est sur la table. — The pen is on the table." },
  { before: "Le sac est ", after: " la chaise.", answer: "sous", gloss: "Le sac est sous la chaise. — The bag is under the chair." },
  { before: "La table est ", after: " la porte et le tableau.", answer: "entre", gloss: "La table est entre la porte et le tableau. — The table is between the door and the board." },
  { before: "La poubelle est ", after: " la porte.", answer: "derrière", gloss: "La poubelle est derrière la porte. — The bin is behind the door." },
  { before: "Le cahier est ", after: " le sac.", answer: "dans", gloss: "Le cahier est dans le sac. — The notebook is in the bag." },
  { before: "Mets le cahier ", after: " le pupitre.", answer: "dans", gloss: "Mets le cahier dans le pupitre. — Put the notebook in the desk." },
  { before: "La chaise est ", after: " la table et la porte.", answer: "entre", gloss: "La chaise est entre la table et la porte. — The chair is between the table and the door." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Le", "stylo", "est", "sur", "la", "table", "."], sentence: "Le stylo est sur la table." },
  { chunks: ["Le", "sac", "est", "sous", "la", "chaise", "."], sentence: "Le sac est sous la chaise." },
  { chunks: ["La", "table", "est", "entre", "la", "porte", "et", "le", "tableau", "."], sentence: "La table est entre la porte et le tableau." },
  { chunks: ["La", "poubelle", "est", "derrière", "la", "porte", "."], sentence: "La poubelle est derrière la porte." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a note describing a pen resting flat on top of the table.",
    correct: "Le stylo est sur la table.",
    distractors: ["Le stylo est sous la table.", "Le stylo est dans la table.", "Le stylo est derrière la table."],
    explanation: "'sur' means 'on' — a pen resting on the table needs 'sur', not 'sous' (under), 'dans' (in), or 'derrière' (behind).",
  },
  {
    note: "You are writing where you found your bag — tucked underneath the chair.",
    correct: "Le sac est sous la chaise.",
    distractors: ["Le sac est sur la chaise.", "Le sac est à côté de la chaise.", "Le sac est dans la chaise."],
    explanation: "'sous' means 'under' — the bag underneath the chair needs 'sous', not 'sur' (on top of) or 'à côté de' (next to).",
  },
  {
    note: "You are writing that the table sits with the door on one side and the board on the other.",
    correct: "La table est entre la porte et le tableau.",
    distractors: ["La table est sur la porte et le tableau.", "La table est sous la porte et le tableau.", "La table est derrière la porte et le tableau."],
    explanation: "'entre' means 'between' — a table positioned between two things needs 'entre', not 'sur' (on), 'sous' (under), or 'derrière' (behind).",
  },
  {
    note: "You are writing where the bin is — hidden out of sight, behind the door.",
    correct: "La poubelle est derrière la porte.",
    distractors: ["La poubelle est sur la porte.", "La poubelle est dans la porte.", "La poubelle est entre la porte."],
    explanation: "'derrière' means 'behind' — a bin hidden behind the door needs 'derrière', not 'sur' (on) or 'dans' (in).",
  },
  {
    note: "You are writing where your notebook is — zipped inside your bag.",
    correct: "Le cahier est dans le sac.",
    distractors: ["Le cahier est sur le sac.", "Le cahier est sous le sac.", "Le cahier est derrière le sac."],
    explanation: "'dans' means 'in' — a notebook zipped inside the bag needs 'dans', not 'sur' (on top of) or 'sous' (underneath).",
  },
  {
    note: "You are writing an instruction telling a classmate to put their notebook inside the desk.",
    correct: "Mets le cahier dans le pupitre.",
    distractors: ["Mets le cahier sur le pupitre.", "Mets le cahier sous le pupitre.", "Range le cahier dans les étagères."],
    explanation: "'Mets le cahier dans le pupitre' is the correct imperative for putting the notebook INSIDE the desk — the others put it on top of, under the desk, or refer to shelves instead.",
  },
  {
    note: "You are writing that the chair is positioned between the table and the door.",
    correct: "La chaise est entre la table et la porte.",
    distractors: ["La chaise est sur la table et la porte.", "La chaise est sous la table et la porte.", "La chaise est derrière la table et la porte."],
    explanation: "'entre' means 'between' — a chair positioned between two things needs 'entre', not 'sur' (on), 'sous' (under), or 'derrière' (behind).",
  },
];

export const gettingAroundWriting: Skill = {
  id: "g5-fr-w-getting-around",
  code: "W.9",
  subjectId: "french",
  strandId: "g5-fr-writing",
  grade: 5,
  title: "Locating classroom objects",
  description: "Guided writing — spelling classroom items and location prepositions (dans, derrière, entre, sur, sous), and writing simple instructions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "written French classroom word or location preposition to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Items name a classroom object; prepositions describe where something is.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = shuffle(rng, WORDS.filter((p) => p.tag === "item")).slice(0, 4);
      const prepositions = shuffle(rng, WORDS.filter((p) => p.tag === "preposition"));
      const chosen = shuffle(rng, [...items, ...prepositions]);
      const correctBucket: Record<string, string> = {};
      for (const p of chosen) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "each written word as a Classroom Item or a Location Word"),
        items: chosen.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "item", label: "Classroom Item" },
          { id: "preposition", label: "Location Word" },
        ],
        correctBucket,
        hint: "Items are things you can point to; location words describe where something is placed.",
        explanation: chosen.map((p) => `"${p.word}" is a ${p.tag === "item" ? "classroom item" : "location word"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which location word or item name fits here.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to write a correct French sentence about locating or placing an item"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "An imperative starts with the verb; a location sentence names the item, then 'est', then the preposition.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} ${writingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check exactly where the item is placed, or exactly what the instruction asks for.",
      explanation: s.explanation,
    };
  },
};
