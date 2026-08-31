import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "place" | "direction";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "la bibliothèque", meaning: "the library", tag: "place" },
  { word: "la cantine", meaning: "the canteen", tag: "place" },
  { word: "les toilettes", meaning: "the toilets", tag: "place" },
  { word: "la salle de professeurs", meaning: "the staff room", tag: "place" },
  { word: "l'infirmerie", meaning: "the infirmary", tag: "place" },
  { word: "la salle de classe", meaning: "the classroom", tag: "place" },
  { word: "le terrain de sport", meaning: "the sports field", tag: "place" },
  { word: "le laboratoire", meaning: "the laboratory", tag: "place" },
  { word: "la cour de récréation", meaning: "the playground", tag: "place" },
  { word: "le bureau du directeur", meaning: "the headteacher's office", tag: "place" },
  { word: "à côté de", meaning: "next to", tag: "direction" },
  { word: "en face de", meaning: "opposite/facing", tag: "direction" },
  { word: "derrière", meaning: "behind", tag: "direction" },
  { word: "près de", meaning: "near", tag: "direction" },
  { word: "entre", meaning: "between", tag: "direction" },
  { word: "Où vas-tu ?", meaning: "Where are you going?", tag: "direction" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Je vais à la ", after: ".", answer: "bibliothèque", gloss: "Je vais à la bibliothèque. — I'm going to the library." },
  { before: "Nous mangeons à la ", after: ".", answer: "cantine", gloss: "Nous mangeons à la cantine. — We eat at the canteen." },
  { before: "Les toilettes sont ", after: " la salle de classe.", answer: "derrière", gloss: "Les toilettes sont derrière la salle de classe. — The toilets are behind the classroom." },
  { before: "L'infirmerie est ", after: " du bureau du directeur.", answer: "près", gloss: "L'infirmerie est près du bureau du directeur. — The infirmary is near the headteacher's office." },
  { before: "Où ", after: "-tu ?", answer: "vas", gloss: "Où vas-tu ? — Where are you going?" },
  { before: "La bibliothèque est ", after: " de la cantine.", answer: "à côté", gloss: "La bibliothèque est à côté de la cantine. — The library is next to the canteen." },
  { before: "Le terrain de sport est ", after: " de l'école.", answer: "en face", gloss: "Le terrain de sport est en face de l'école. — The sports field is opposite the school." },
  { before: "La salle de classe est ", after: " la bibliothèque et l'infirmerie.", answer: "entre", gloss: "La salle de classe est entre la bibliothèque et l'infirmerie. — The classroom is between the library and the infirmary." },
  { before: "Les professeurs travaillent dans la salle des ", after: ".", answer: "professeurs", gloss: "Les professeurs travaillent dans la salle des professeurs. — The teachers work in the staff room." },
  { before: "On fait des expériences dans le ", after: ".", answer: "laboratoire", gloss: "On fait des expériences dans le laboratoire. — We do experiments in the laboratory." },
  { before: "Les élèves jouent dans la cour de ", after: ".", answer: "récréation", gloss: "Les élèves jouent dans la cour de récréation. — The students play in the playground." },
  { before: "Je vais voir le directeur dans son ", after: ".", answer: "bureau", gloss: "Je vais voir le directeur dans son bureau. — I'm going to see the headteacher in his office." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Où", "vas-tu", "?"], sentence: "Où vas-tu ?" },
  { chunks: ["Je", "vais", "à", "la", "bibliothèque", "."], sentence: "Je vais à la bibliothèque." },
  { chunks: ["La", "cantine", "est", "à", "côté", "de", "la", "salle", "de", "classe", "."], sentence: "La cantine est à côté de la salle de classe." },
  { chunks: ["L'infirmerie", "est", "en", "face", "du", "laboratoire", "."], sentence: "L'infirmerie est en face du laboratoire." },
  { chunks: ["Les", "toilettes", "sont", "derrière", "la", "cantine", "."], sentence: "Les toilettes sont derrière la cantine." },
  { chunks: ["Le", "terrain", "de", "sport", "est", "près", "de", "l'école", "."], sentence: "Le terrain de sport est près de l'école." },
];

const NAMES = ["Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno", "Wanjiru", "Kiptoo", "Achieng", "Mumbi", "Kamau", "Wafula"];

const SCENARIOS: { situation: (name: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `You're carrying a stack of books and ${n} asks where you're heading.`,
    correct: "Je vais à la bibliothèque.",
    distractors: ["Je vais à la cantine.", "Je vais à l'infirmerie.", "Je vais au terrain de sport."],
    explanation: "'Je vais à la bibliothèque' fits carrying books — a library is where books are — the others name unrelated destinations.",
  },
  {
    situation: (n) => `It's lunchtime, you're hungry, and ${n} asks where you're heading.`,
    correct: "Je vais à la cantine.",
    distractors: ["Je vais à la bibliothèque.", "Je vais au laboratoire.", "Je vais au bureau du directeur."],
    explanation: "'Je vais à la cantine' fits being hungry at lunchtime — the canteen is where you eat — the others don't relate to food.",
  },
  {
    situation: (n) => `You feel sick and ${n} asks where you're heading.`,
    correct: "Je vais à l'infirmerie.",
    distractors: ["Je vais à la cantine.", "Je vais à la bibliothèque.", "Je vais au terrain de sport."],
    explanation: "'Je vais à l'infirmerie' fits feeling sick — the infirmary is where a sick learner goes — the others don't relate to health.",
  },
  {
    situation: (n) => `It's time for a PE lesson and ${n} asks where you're heading.`,
    correct: "Je vais au terrain de sport.",
    distractors: ["Je vais au laboratoire.", "Je vais à la bibliothèque.", "Je vais à l'infirmerie."],
    explanation: "'Je vais au terrain de sport' fits a PE lesson — note 'le terrain' is masculine, so 'à le' contracts to 'au'.",
  },
  {
    situation: (n) => `It's a science lesson and ${n} asks where you're heading.`,
    correct: "Je vais au laboratoire.",
    distractors: ["Je vais à la cantine.", "Je vais au terrain de sport.", "Je vais à la bibliothèque."],
    explanation: "'Je vais au laboratoire' fits a science lesson — note 'le laboratoire' is masculine, so 'à le' contracts to 'au'.",
  },
  {
    situation: (n) => `You've been called to see the headteacher and ${n} asks where you're heading.`,
    correct: "Je vais au bureau du directeur.",
    distractors: ["Je vais à la salle de professeurs.", "Je vais à l'infirmerie.", "Je vais à la cantine."],
    explanation: "'Je vais au bureau du directeur' names the headteacher's office specifically — the staff room is where teachers, not the headteacher, are usually found.",
  },
  {
    situation: (n) => `${n} is new at school, looks lost, and is clearly heading somewhere — you want to ask where.`,
    correct: "Où vas-tu ?",
    distractors: ["Tu habites où ?", "Ça va ?", "Tu t'appelles comment ?"],
    explanation: "'Où vas-tu ?' asks specifically where someone is going right now — 'Tu habites où ?' asks about their home instead.",
  },
  {
    situation: (n) => `${n} wants to know where the toilets are relative to the classroom, and they sit directly behind it.`,
    correct: "Les toilettes sont derrière la salle de classe.",
    distractors: ["Les toilettes sont en face de la salle de classe.", "Les toilettes sont à côté de la salle de classe.", "Les toilettes sont entre la salle de classe et la cantine."],
    explanation: "'Derrière' means 'behind' — 'en face de' means 'opposite', which is a different, front-facing position.",
  },
  {
    situation: (n) => `${n} wants to know where the library is relative to the canteen, and it's right beside it.`,
    correct: "La bibliothèque est à côté de la cantine.",
    distractors: ["La bibliothèque est derrière la cantine.", "La bibliothèque est en face de la cantine.", "La bibliothèque est près du laboratoire."],
    explanation: "'À côté de' means 'next to' — 'derrière' means 'behind', a different relative position.",
  },
  {
    situation: (n) => `${n} wants to know where the infirmary is relative to the laboratory, and it's directly across from it.`,
    correct: "L'infirmerie est en face du laboratoire.",
    distractors: ["L'infirmerie est derrière le laboratoire.", "L'infirmerie est à côté du laboratoire.", "L'infirmerie est entre le laboratoire et la cantine."],
    explanation: "'En face de' means 'opposite/facing' — 'à côté de' means adjacent to the side, not directly across from something.",
  },
  {
    situation: (n) => `${n} wants to know where the classroom is, and it sits directly between the library and the infirmary.`,
    correct: "La salle de classe est entre la bibliothèque et l'infirmerie.",
    distractors: ["La salle de classe est à côté de la bibliothèque.", "La salle de classe est derrière l'infirmerie.", "La salle de classe est en face de la cantine."],
    explanation: "'Entre' means 'between', naming two surrounding places — the other options only reference one place, which doesn't capture 'between'.",
  },
  {
    situation: (n) => `${n} wants to know where the sports field is, and it's not far from the main school building.`,
    correct: "Le terrain de sport est près de l'école.",
    distractors: ["Le terrain de sport est loin de l'école.", "Le terrain de sport est derrière la bibliothèque.", "Le terrain de sport est entre la cantine et l'infirmerie."],
    explanation: "'Près de' means 'near' — 'loin de' means 'far from', the opposite meaning, which doesn't fit 'not far'.",
  },
  {
    situation: (n) => `${n} needs help with a form and asks where the teachers can usually be found.`,
    correct: "Les professeurs sont dans la salle de professeurs.",
    distractors: ["Les professeurs sont à la cantine.", "Les professeurs sont au terrain de sport.", "Les professeurs sont à la bibliothèque."],
    explanation: "'La salle de professeurs' is the staff room, where teachers gather outside of lessons — the other places aren't the teachers' usual base.",
  },
];

export const surroundingsSpeaking: Skill = {
  id: "g6-fr-ls-surroundings",
  code: "LS.3",
  subjectId: "french",
  strandId: "g6-fr-listening-speaking",
  grade: 6,
  title: "School places and giving directions",
  description: "Vocabulary for school facilities, asking 'Où vas-tu ?', and locating places with à côté de, en face de, derrière, près de, and entre.",
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
        prompt: "Match each French word or phrase to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Place words name a location; direction words describe where one place sits relative to another.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const places = shuffle(rng, WORDS.filter((p) => p.tag === "place")).slice(0, 4);
      const directions = shuffle(rng, WORDS.filter((p) => p.tag === "direction")).slice(0, 4);
      const items = shuffle(rng, [...places, ...directions]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word/phrase as a School Place or a Direction Word.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "place", label: "School Place" },
          { id: "direction", label: "Direction Word" },
        ],
        correctBucket,
        hint: "Place words name a room or area; direction words describe a position or ask where.",
        explanation: [...places, ...directions]
          .map((p) => `"${p.word}" is a ${p.tag === "place" ? "school place" : "direction word"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about your surroundings.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which place or direction word fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about school places.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Question words like 'Où' usually come first; the place named usually comes last.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const name = randChoice(rng, NAMES);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(name)} What do you say?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check both which place and which direction word actually fit this specific situation.",
      explanation: s.explanation,
    };
  },
};
