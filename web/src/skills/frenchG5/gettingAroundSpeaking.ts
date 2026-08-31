import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { name, matchPrompt, sortPrompt, orderPrompt, fillPrompt, speakingScenarioCloser } from "./g5FrShared";

type Tag = "item" | "preposition";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "le tableau", meaning: "the board", tag: "item" },
  { word: "les chaises", meaning: "the chairs", tag: "item" },
  { word: "la poubelle", meaning: "the bin", tag: "item" },
  { word: "le pupitre", meaning: "the desk", tag: "item" },
  { word: "la porte", meaning: "the door", tag: "item" },
  { word: "le chiffon", meaning: "the cloth/rag", tag: "item" },
  { word: "la règle", meaning: "the ruler", tag: "item" },
  { word: "le cahier", meaning: "the notebook", tag: "item" },
  { word: "le stylo", meaning: "the pen", tag: "item" },
  { word: "dans", meaning: "in", tag: "preposition" },
  { word: "derrière", meaning: "behind", tag: "preposition" },
  { word: "à côté de", meaning: "next to", tag: "preposition" },
  { word: "sur", meaning: "on", tag: "preposition" },
  { word: "sous", meaning: "under", tag: "preposition" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Mets les cahiers ", after: " le pupitre.", answer: "dans", gloss: "Mets les cahiers dans le pupitre. — Put the notebooks in the desk." },
  { before: "Range les livres dans les ", after: ".", answer: "étagères", gloss: "Range les livres dans les étagères. — Put the books away on the shelves." },
  { before: "Le stylo est ", after: " la table.", answer: "sur", gloss: "Le stylo est sur la table. — The pen is on the table." },
  { before: "Le sac est ", after: " la chaise.", answer: "sous", gloss: "Le sac est sous la chaise. — The bag is under the chair." },
  { before: "La poubelle est ", after: " de la porte.", answer: "à côté", gloss: "La poubelle est à côté de la porte. — The bin is next to the door." },
  { before: "Le chiffon est ", after: " le tableau.", answer: "derrière", gloss: "Le chiffon est derrière le tableau. — The cloth is behind the board." },
  { before: "La règle est ", after: " le cahier.", answer: "dans", gloss: "La règle est dans le cahier. — The ruler is in the notebook." },
  { before: "Les chaises sont ", after: " le pupitre.", answer: "sous", gloss: "Les chaises sont sous le pupitre. — The chairs are under the desk." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Mets", "les", "cahiers", "dans", "le", "pupitre", "."], sentence: "Mets les cahiers dans le pupitre." },
  { chunks: ["Range", "les", "livres", "dans", "les", "étagères", "."], sentence: "Range les livres dans les étagères." },
  { chunks: ["Le", "stylo", "est", "sur", "la", "table", "."], sentence: "Le stylo est sur la table." },
  { chunks: ["Le", "sac", "est", "sous", "la", "chaise", "."], sentence: "Le sac est sous la chaise." },
  { chunks: ["La", "poubelle", "est", "à", "côté", "de", "la", "porte", "."], sentence: "La poubelle est à côté de la porte." },
];

const SCENARIOS: { situation: (n: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} sees a pen resting flat on top of the table.`,
    correct: "Le stylo est sur la table.",
    distractors: ["Le stylo est sous la table.", "Le stylo est dans la table.", "Le stylo est derrière la table."],
    explanation: "'sur' means 'on' — the pen resting on top of the table needs 'sur', not 'sous' (under), 'dans' (in), or 'derrière' (behind).",
  },
  {
    situation: (n) => `${n} looks and finds the schoolbag tucked underneath the chair.`,
    correct: "Le sac est sous la chaise.",
    distractors: ["Le sac est sur la chaise.", "Le sac est à côté de la chaise.", "Le sac est dans la chaise."],
    explanation: "'sous' means 'under' — the bag underneath the chair needs 'sous', not 'sur' (on top of) or 'à côté de' (next to).",
  },
  {
    situation: (n) => `${n} notices the bin standing right beside the classroom door.`,
    correct: "La poubelle est à côté de la porte.",
    distractors: ["La poubelle est sur la porte.", "La poubelle est dans la porte.", "La poubelle est derrière la porte."],
    explanation: "'à côté de' means 'next to' — a bin standing beside the door needs 'à côté de', not 'sur' (on) or 'dans' (in).",
  },
  {
    situation: (n) => `${n} looks and the cleaning cloth is hidden out of sight, behind the board.`,
    correct: "Le chiffon est derrière le tableau.",
    distractors: ["Le chiffon est sur le tableau.", "Le chiffon est sous le tableau.", "Le chiffon est dans le tableau."],
    explanation: "'derrière' means 'behind' — a cloth hidden out of sight behind the board needs 'derrière', not 'sur' (on) or 'sous' (under).",
  },
  {
    situation: (n) => `${n} finds the ruler tucked inside the pages of the notebook.`,
    correct: "La règle est dans le cahier.",
    distractors: ["La règle est sur le cahier.", "La règle est sous le cahier.", "La règle est derrière le cahier."],
    explanation: "'dans' means 'in' — a ruler tucked inside the notebook needs 'dans', not 'sur' (on top of) or 'sous' (underneath).",
  },
  {
    situation: (n) => `${n} asks you to instruct a classmate to place their notebooks inside the desk.`,
    correct: "Mets les cahiers dans le pupitre.",
    distractors: ["Range les livres dans les étagères.", "Le cahier est sur le pupitre.", "Mets les cahiers sur le pupitre."],
    explanation: "'Mets les cahiers dans le pupitre' is the correct imperative instruction to put notebooks INSIDE the desk — the other options describe books/shelves or put items ON the desk instead.",
  },
  {
    situation: (n) => `${n} asks you to instruct a classmate to put the books away on the shelves.`,
    correct: "Range les livres dans les étagères.",
    distractors: ["Mets les cahiers dans le pupitre.", "Les livres sont sur les étagères.", "Range les cahiers dans le pupitre."],
    explanation: "'Range les livres dans les étagères' is the correct imperative for putting books on the shelves — the other options describe notebooks/desks instead.",
  },
  {
    situation: (n) => `${n} points out that the chairs are stacked underneath the desk.`,
    correct: "Les chaises sont sous le pupitre.",
    distractors: ["Les chaises sont sur le pupitre.", "Les chaises sont dans le pupitre.", "Les chaises sont derrière le pupitre."],
    explanation: "'sous' means 'under' — chairs stacked underneath the desk need 'sous', not 'sur' (on) or 'derrière' (behind).",
  },
];

export const gettingAroundSpeaking: Skill = {
  id: "g5-fr-ls-getting-around",
  code: "LS.9",
  subjectId: "french",
  strandId: "g5-fr-listening-speaking",
  grade: 5,
  title: "Locating classroom items",
  description: "Naming classroom items and locating prepositions (dans, derrière, à côté de, sur, sous), and following simple imperative instructions — practiced through matching, sorting, and speaking scenarios.",
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
        prompt: matchPrompt(rng, "French classroom word or location preposition to its English meaning"),
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
        prompt: sortPrompt(rng, "each word as a Classroom Item or a Location Word"),
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
        hint: "Think about which item, location, or imperative word fits here.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to form a correct French sentence about locating or placing an item"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "An imperative starts with the verb; a location sentence names the item, then 'est', then the preposition.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const n = name(rng);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(n)} ${speakingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check exactly where the item is placed, or exactly what the instruction asks for.",
      explanation: s.explanation,
    };
  },
};
