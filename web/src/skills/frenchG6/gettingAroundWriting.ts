import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "place" | "preposition";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "la bibliothèque", meaning: "the library", tag: "place" },
  { word: "la cantine", meaning: "the canteen", tag: "place" },
  { word: "l'infirmerie", meaning: "the infirmary", tag: "place" },
  { word: "la salle de classe", meaning: "the classroom", tag: "place" },
  { word: "les toilettes", meaning: "the toilets", tag: "place" },
  { word: "la salle des professeurs", meaning: "the staff room", tag: "place" },
  { word: "le terrain de jeux", meaning: "the playground", tag: "place" },
  { word: "la cour", meaning: "the schoolyard", tag: "place" },
  { word: "le bureau du directeur", meaning: "the headteacher's office", tag: "place" },
  { word: "la salle informatique", meaning: "the computer room", tag: "place" },
  { word: "à côté de", meaning: "next to", tag: "preposition" },
  { word: "derrière", meaning: "behind", tag: "preposition" },
  { word: "en face de", meaning: "opposite", tag: "preposition" },
  { word: "entre", meaning: "between", tag: "preposition" },
  { word: "près de", meaning: "near", tag: "preposition" },
  { word: "loin de", meaning: "far from", tag: "preposition" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "La bibliothèque est à ", after: " de la salle de classe.", answer: "côté", gloss: "La bibliothèque est à côté de la salle de classe. — The library is next to the classroom." },
  { before: "L'infirmerie est ", after: " le bureau du directeur.", answer: "derrière", gloss: "L'infirmerie est derrière le bureau du directeur. — The infirmary is behind the headteacher's office." },
  { before: "La cantine est en ", after: " de la bibliothèque.", answer: "face", gloss: "La cantine est en face de la bibliothèque. — The canteen is opposite the library." },
  { before: "La salle de classe est ", after: " la cantine et l'infirmerie.", answer: "entre", gloss: "La salle de classe est entre la cantine et l'infirmerie. — The classroom is between the canteen and the infirmary." },
  { before: "Les toilettes sont ", after: " de la cour.", answer: "près", gloss: "Les toilettes sont près de la cour. — The toilets are near the schoolyard." },
  { before: "La salle des professeurs est ", after: " de la salle informatique.", answer: "loin", gloss: "La salle des professeurs est loin de la salle informatique. — The staff room is far from the computer room." },
  { before: "Où est la ", after: " ?", answer: "bibliothèque", gloss: "Où est la bibliothèque ? — Where is the library?" },
  { before: "Où est l'", after: " ?", answer: "infirmerie", gloss: "Où est l'infirmerie ? — Where is the infirmary?" },
  { before: "La salle de ", after: " est à côté de la cour.", answer: "classe", gloss: "La salle de classe est à côté de la cour. — The classroom is next to the schoolyard." },
  { before: "Le terrain de jeux est à ", after: " de la cantine.", answer: "côté", gloss: "Le terrain de jeux est à côté de la cantine. — The playground is next to the canteen." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["La", "bibliothèque", "est", "à", "côté", "de", "la", "salle", "de", "classe", "."], sentence: "La bibliothèque est à côté de la salle de classe." },
  { chunks: ["L'infirmerie", "est", "derrière", "le", "bureau", "du", "directeur", "."], sentence: "L'infirmerie est derrière le bureau du directeur." },
  { chunks: ["La", "cantine", "est", "en", "face", "de", "la", "bibliothèque", "."], sentence: "La cantine est en face de la bibliothèque." },
  { chunks: ["Où", "est", "la", "bibliothèque", "?"], sentence: "Où est la bibliothèque ?" },
  { chunks: ["La", "salle", "de", "classe", "est", "entre", "la", "cantine", "et", "l'infirmerie", "."], sentence: "La salle de classe est entre la cantine et l'infirmerie." },
  { chunks: ["Les", "toilettes", "sont", "près", "de", "la", "cour", "."], sentence: "Les toilettes sont près de la cour." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing directions telling a new student the library is next to the classroom.",
    correct: "La bibliothèque est à côté de la salle de classe.",
    distractors: ["La bibliothèque est derrière la salle de classe.", "La bibliothèque est en face de la salle de classe.", "La cantine est à côté de la salle de classe."],
    explanation: "'À côté de' means 'next to' — the other options describe behind or opposite, or swap in the wrong building.",
  },
  {
    note: "You are writing that the infirmary is located behind the headteacher's office.",
    correct: "L'infirmerie est derrière le bureau du directeur.",
    distractors: ["L'infirmerie est en face du bureau du directeur.", "L'infirmerie est à côté du bureau du directeur.", "La cantine est derrière le bureau du directeur."],
    explanation: "'Derrière' means 'behind' — the other options describe facing or being next to, or name the wrong place.",
  },
  {
    note: "You are writing a school-map note that the canteen is directly opposite the library.",
    correct: "La cantine est en face de la bibliothèque.",
    distractors: ["La cantine est derrière la bibliothèque.", "La cantine est loin de la bibliothèque.", "L'infirmerie est en face de la bibliothèque."],
    explanation: "'En face de' means directly opposite — the other options describe behind or far, or swap in the wrong place.",
  },
  {
    note: "You are writing that the classroom sits between the canteen and the infirmary.",
    correct: "La salle de classe est entre la cantine et l'infirmerie.",
    distractors: ["La salle de classe est à côté de la cantine et l'infirmerie.", "La salle de classe est loin de la cantine et de l'infirmerie.", "La bibliothèque est entre la cantine et l'infirmerie."],
    explanation: "'Entre' means 'between' two places — the other options describe next-to or far, or swap in the wrong room.",
  },
  {
    note: "You are writing a note asking a friend where the library is.",
    correct: "Où est la bibliothèque ?",
    distractors: ["La bibliothèque est fermée.", "J'aime la bibliothèque.", "La bibliothèque est grande."],
    explanation: "'Où est... ?' is the written form for asking a location — the other options are statements, not questions.",
  },
  {
    note: "You are writing that the toilets are near the schoolyard.",
    correct: "Les toilettes sont près de la cour.",
    distractors: ["Les toilettes sont loin de la cour.", "Les toilettes sont entre la cour et la cantine.", "Le terrain de jeux est près de la cour."],
    explanation: "'Près de' means 'near' — the other options describe far or between, or name the wrong place.",
  },
  {
    note: "You are writing that the computer room is far from the staff room.",
    correct: "La salle informatique est loin de la salle des professeurs.",
    distractors: ["La salle informatique est près de la salle des professeurs.", "La salle informatique est à côté de la salle des professeurs.", "La bibliothèque est loin de la salle des professeurs."],
    explanation: "'Loin de' means 'far from' — the other options describe near or next to, or swap in the wrong room.",
  },
  {
    note: "You are labelling a school map, showing the playground next to the classroom.",
    correct: "Le terrain de jeux est à côté de la salle de classe.",
    distractors: ["Le terrain de jeux est derrière la salle de classe.", "Le terrain de jeux est en face de la salle de classe.", "La cour est à côté de la salle de classe."],
    explanation: "'À côté de' names the playground as next to the classroom — the other options describe behind or opposite, or swap in the wrong place.",
  },
  {
    note: "You are writing a note asking where the infirmary is for an injured classmate.",
    correct: "Où est l'infirmerie ?",
    distractors: ["L'infirmerie est fermée.", "Où est la bibliothèque ?", "L'infirmerie est petite."],
    explanation: "'Où est l'infirmerie ?' asks for the infirmary's location — the other options ask about a different place or make a statement instead of a question.",
  },
  {
    note: "You are writing that the headteacher's office is directly opposite the staff room.",
    correct: "Le bureau du directeur est en face de la salle des professeurs.",
    distractors: ["Le bureau du directeur est derrière la salle des professeurs.", "Le bureau du directeur est à côté de la salle des professeurs.", "L'infirmerie est en face de la salle des professeurs."],
    explanation: "'En face de' means directly opposite — the other options describe behind or next to, or swap in the wrong place.",
  },
];

export const gettingAroundWriting: Skill = {
  id: "g6-fr-w-gettingAround",
  code: "W.9",
  subjectId: "french",
  strandId: "g6-fr-writing",
  grade: 6,
  title: "Finding your way around school",
  description: "Guided writing about school areas and location prepositions for giving directions in French.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each written French school-area or location word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Place words name a building or area; preposition words describe where it is relative to something else.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const places = shuffle(rng, WORDS.filter((p) => p.tag === "place")).slice(0, 6);
      const prepositions = shuffle(rng, WORDS.filter((p) => p.tag === "preposition")).slice(0, 5);
      const chosen = shuffle(rng, [...places, ...prepositions]);
      const correctBucket: Record<string, string> = {};
      for (const p of places) correctBucket[p.word] = "place";
      for (const p of prepositions) correctBucket[p.word] = "preposition";

      return {
        kind: "categorize",
        prompt: "Sort each written word as a School Area or a Location Preposition.",
        items: chosen.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "place", label: "School Area" },
          { id: "preposition", label: "Location Preposition" },
        ],
        correctBucket,
        hint: "Place words name a building or area; preposition words describe where it is relative to something else.",
        explanation: [...places, ...prepositions]
          .map((p) => `"${p.word}" is a ${p.tag === "place" ? "school area" : "location preposition"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written sentence about finding your way around school.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which school area or location preposition fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct French sentence about a school location.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The place comes first, then 'est', then the preposition, then the reference point.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} Which French sentence should you write?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check which preposition and which school area actually match the situation described.",
      explanation: s.explanation,
    };
  },
};
