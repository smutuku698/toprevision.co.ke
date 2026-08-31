import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "facility" | "location";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "la salle de classe", meaning: "the classroom", tag: "facility" },
  { word: "la bibliothèque", meaning: "the library", tag: "facility" },
  { word: "la cantine", meaning: "the canteen/dining hall", tag: "facility" },
  { word: "la cour", meaning: "the schoolyard", tag: "facility" },
  { word: "le terrain de sport", meaning: "the sports field", tag: "facility" },
  { word: "le bureau du directeur", meaning: "the headteacher's office", tag: "facility" },
  { word: "les toilettes", meaning: "the toilets", tag: "facility" },
  { word: "le laboratoire", meaning: "the laboratory", tag: "facility" },
  { word: "le jardin", meaning: "the garden", tag: "facility" },
  { word: "la salle de professeurs", meaning: "the staff room", tag: "facility" },
  { word: "dans", meaning: "in", tag: "location" },
  { word: "sur", meaning: "on", tag: "location" },
  { word: "sous", meaning: "under", tag: "location" },
  { word: "devant", meaning: "in front of", tag: "location" },
  { word: "derrière", meaning: "behind", tag: "location" },
  { word: "à côté de", meaning: "next to", tag: "location" },
  { word: "loin de", meaning: "far from", tag: "location" },
  { word: "près de", meaning: "near", tag: "location" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Où ", after: "-tu ?", answer: "vas", gloss: "Où vas-tu ? — Where are you going?" },
  { before: "Je vais à la ", after: ".", answer: "bibliothèque", gloss: "Je vais à la bibliothèque. — I am going to the library." },
  { before: "La cantine est à ", after: " de la cour.", answer: "côté", gloss: "La cantine est à côté de la cour. — The canteen is next to the schoolyard." },
  { before: "Les livres sont ", after: " la bibliothèque.", answer: "dans", gloss: "Les livres sont dans la bibliothèque. — The books are in the library." },
  { before: "Le ballon est ", after: " la table.", answer: "sous", gloss: "Le ballon est sous la table. — The ball is under the table." },
  { before: "Le bureau du ", after: " est fermé.", answer: "directeur", gloss: "Le bureau du directeur est fermé. — The headteacher's office is closed." },
  { before: "Nous jouons sur le ", after: " de sport.", answer: "terrain", gloss: "Nous jouons sur le terrain de sport. — We play on the sports field." },
  { before: "La salle de ", after: " est grande.", answer: "classe", gloss: "La salle de classe est grande. — The classroom is big." },
  { before: "Le jardin est ", after: " de l'école.", answer: "loin", gloss: "Le jardin est loin de l'école. — The garden is far from the school." },
  { before: "Les élèves mangent à la ", after: ".", answer: "cantine", gloss: "Les élèves mangent à la cantine. — The students eat at the canteen." },
  { before: "Le sac est ", after: " la chaise.", answer: "devant", gloss: "Le sac est devant la chaise. — The bag is in front of the chair." },
  { before: "Le laboratoire est ", after: " de la salle de classe.", answer: "près", gloss: "Le laboratoire est près de la salle de classe. — The laboratory is near the classroom." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Où", "vas-tu", "?"], sentence: "Où vas-tu ?" },
  { chunks: ["Je", "vais", "à", "la", "bibliothèque", "."], sentence: "Je vais à la bibliothèque." },
  { chunks: ["La", "cantine", "est", "à", "côté", "de", "la", "cour", "."], sentence: "La cantine est à côté de la cour." },
  { chunks: ["Les", "livres", "sont", "dans", "la", "bibliothèque", "."], sentence: "Les livres sont dans la bibliothèque." },
  { chunks: ["Le", "terrain", "de", "sport", "est", "grand", "."], sentence: "Le terrain de sport est grand." },
  { chunks: ["La", "salle", "de", "classe", "est", "propre", "."], sentence: "La salle de classe est propre." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing directions for a new student asking where you are going, and you are headed to the library.",
    correct: "Je vais à la bibliothèque.",
    distractors: ["Je vais à la cantine.", "Je vais aux toilettes.", "Tu vas à la bibliothèque."],
    explanation: "'Je vais à la bibliothèque' names the library and uses 'je' (I) — the other options name a different place or the wrong subject.",
  },
  {
    note: "You are writing a note describing where the canteen is located, right next to the schoolyard.",
    correct: "La cantine est à côté de la cour.",
    distractors: ["La cantine est loin de la cour.", "La bibliothèque est à côté de la cour.", "La cantine est dans la cour."],
    explanation: "'à côté de' means next to — 'loin de' means far from, and swapping the facility name changes what's being located.",
  },
  {
    note: "You are labeling a school map and want to write that the books are inside the library.",
    correct: "Les livres sont dans la bibliothèque.",
    distractors: ["Les livres sont sur la bibliothèque.", "Les livres sont sous la bibliothèque.", "Les livres sont à côté de la bibliothèque."],
    explanation: "'dans' means inside — 'sur' (on top of), 'sous' (underneath), and 'à côté de' (next to) all describe a different position.",
  },
  {
    note: "You are writing a short note explaining that the headteacher's office is closed today.",
    correct: "Le bureau du directeur est fermé.",
    distractors: ["La salle de classe est fermée.", "Le bureau du directeur est grand.", "La cantine est fermée."],
    explanation: "'Le bureau du directeur est fermé' names the headteacher's office specifically — the other options name a different facility or a different detail.",
  },
  {
    note: "You are writing a caption describing students playing on the sports field.",
    correct: "Nous jouons sur le terrain de sport.",
    distractors: ["Nous jouons dans la bibliothèque.", "Nous jouons sous le terrain de sport.", "Nous mangeons sur le terrain de sport."],
    explanation: "'sur le terrain de sport' places the action on top of the field, matching where students actually play — the other options change the place, position, or activity.",
  },
  {
    note: "You are writing a description of your classroom for a school project, noting that it is big.",
    correct: "La salle de classe est grande.",
    distractors: ["La salle de classe est grand.", "Le laboratoire est grande.", "La cour est grande."],
    explanation: "'grande' (feminine) correctly agrees with 'la salle de classe' — 'grand' (masculine) is a gender-agreement mistake, and the other options name a different facility.",
  },
  {
    note: "You are writing about where students eat lunch at your school.",
    correct: "Les élèves mangent à la cantine.",
    distractors: ["Les élèves mangent à la bibliothèque.", "Les élèves mangent dans le jardin.", "Les élève mange à la cantine."],
    explanation: "'Les élèves mangent' correctly pluralizes both the subject and verb — 'élève... mange' drops the plural -s, a common agreement mistake.",
  },
  {
    note: "You are writing a note telling a classmate to put their bag in front of the chair.",
    correct: "Le sac est devant la chaise.",
    distractors: ["Le sac est derrière la chaise.", "Le sac est sous la table.", "La chaise est devant le sac."],
    explanation: "'devant' means in front of — 'derrière' means behind, and swapping the subject and object reverses who is in front of whom.",
  },
  {
    note: "You are describing the laboratory's location, which is near the classroom.",
    correct: "Le laboratoire est près de la salle de classe.",
    distractors: ["Le laboratoire est loin de la salle de classe.", "Le laboratoire est dans la salle de classe.", "La cantine est près de la salle de classe."],
    explanation: "'près de' means near — 'loin de' means far from, the opposite meaning, and the other options name the wrong facility.",
  },
  {
    note: "In a poster about caring for school facilities, you want to write that the garden is far from the school gate.",
    correct: "Le jardin est loin de l'école.",
    distractors: ["Le jardin est près de l'école.", "Le jardin est dans l'école.", "La cour est loin de l'école."],
    explanation: "'loin de' means far from — 'près de' (near) is the opposite, and the last option names the wrong facility.",
  },
  {
    note: "You are filling in a form asking where you are going during break, and your answer is the toilets.",
    correct: "Je vais aux toilettes.",
    distractors: ["Je vais à la bibliothèque.", "Je vais au terrain de sport.", "Tu vas aux toilettes."],
    explanation: "'aux' is the correct contraction of 'à' + 'les' for the plural 'toilettes' — the other options name a different place or the wrong subject.",
  },
  {
    note: "You are writing a note asking a friend where they are going, using the correct informal word order.",
    correct: "Où vas-tu ?",
    distractors: ["Vas où tu ?", "Tu où vas ?", "Où tu vas ?"],
    explanation: "'Où vas-tu ?' inverts the verb and subject after the question word — the other orderings are not correct written French.",
  },
];

export const surroundingsWriting: Skill = {
  id: "g6-fr-w-surroundings",
  code: "W.3",
  subjectId: "french",
  strandId: "g6-fr-writing",
  grade: 6,
  title: "School facilities and locating items",
  description: "Guided writing about places and facilities in school, and locating them using prepositions of place.",
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
        prompt: "Match each written French word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words name a school facility; others describe where something is located.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const facilities = shuffle(rng, WORDS.filter((p) => p.tag === "facility")).slice(0, 4);
      const locations = shuffle(rng, WORDS.filter((p) => p.tag === "location")).slice(0, 4);
      const items = shuffle(rng, [...facilities, ...locations]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each written word as a School Facility or a Locating Word.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "facility", label: "School Facility" },
          { id: "location", label: "Locating Word" },
        ],
        correctBucket,
        hint: "Facility words name a place; locating words describe where something sits relative to a place.",
        explanation: [...facilities, ...locations]
          .map((p) => `"${p.word}" is ${p.tag === "facility" ? "a school facility" : "a locating word"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written sentence about school surroundings.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the facility name or locating word that fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct French sentence about school surroundings.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Questions with 'où' invert the verb and subject; statements name the place then describe its location.",
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
      hint: "Check the facility named and the locating word both match the situation described.",
      explanation: s.explanation,
    };
  },
};
