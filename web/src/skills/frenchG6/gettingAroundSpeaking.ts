import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

// Note (per curriculum-reference/grade-6/french.json, sub-strand 1.9 + linked Reading 2.9/Writing 3.9 scope
// notes): named school facilities (bibliothèque, cantine, toilettes, salle de professeurs, infirmerie, salle
// de classe) and named location prepositions (à côté de, en face de, derrière, près de, entre) are hard
// inclusions, combined here into one vocabulary pool with a few generic supporting facilities.

type Tag = "place" | "preposition";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "la bibliothèque", meaning: "the library", tag: "place" },
  { word: "la cantine", meaning: "the canteen", tag: "place" },
  { word: "les toilettes", meaning: "the toilets", tag: "place" },
  { word: "la salle de professeurs", meaning: "the staff room", tag: "place" },
  { word: "l'infirmerie", meaning: "the infirmary", tag: "place" },
  { word: "la salle de classe", meaning: "the classroom", tag: "place" },
  { word: "la cour de récréation", meaning: "the playground", tag: "place" },
  { word: "le terrain de sport", meaning: "the sports field", tag: "place" },
  { word: "le bureau du directeur", meaning: "the headteacher's office", tag: "place" },
  { word: "la salle informatique", meaning: "the computer room", tag: "place" },
  { word: "à côté de", meaning: "next to", tag: "preposition" },
  { word: "en face de", meaning: "opposite", tag: "preposition" },
  { word: "derrière", meaning: "behind", tag: "preposition" },
  { word: "près de", meaning: "near", tag: "preposition" },
  { word: "entre", meaning: "between", tag: "preposition" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "La bibliothèque est à ", after: " de la cantine.", answer: "côté", gloss: "La bibliothèque est à côté de la cantine. — The library is next to the canteen." },
  { before: "Les toilettes sont ", after: " de la salle de classe.", answer: "près", gloss: "Les toilettes sont près de la salle de classe. — The toilets are near the classroom." },
  { before: "La salle de professeurs est en ", after: " de la bibliothèque.", answer: "face", gloss: "La salle de professeurs est en face de la bibliothèque. — The staff room is opposite the library." },
  { before: "L'infirmerie est ", after: " le terrain de sport.", answer: "derrière", gloss: "L'infirmerie est derrière le terrain de sport. — The infirmary is behind the sports field." },
  { before: "La cantine est ", after: " la bibliothèque et la salle de classe.", answer: "entre", gloss: "La cantine est entre la bibliothèque et la salle de classe. — The canteen is between the library and the classroom." },
  { before: "Où est la ", after: " ?", answer: "cantine", gloss: "Où est la cantine ? — Where is the canteen?" },
  { before: "Où sont les ", after: " ?", answer: "toilettes", gloss: "Où sont les toilettes ? — Where are the toilets?" },
  { before: "Le bureau du directeur est à côté de la salle des ", after: ".", answer: "professeurs", gloss: "Le bureau du directeur est à côté de la salle des professeurs. — The headteacher's office is next to the staff room." },
  { before: "La cour de récréation est près du terrain de ", after: ".", answer: "sport", gloss: "La cour de récréation est près du terrain de sport. — The playground is near the sports field." },
  { before: "La salle ", after: " a beaucoup d'ordinateurs.", answer: "informatique", gloss: "La salle informatique a beaucoup d'ordinateurs. — The computer room has a lot of computers." },
  { before: "La bibliothèque est à côté de l'", after: ".", answer: "infirmerie", gloss: "La bibliothèque est à côté de l'infirmerie. — The library is next to the infirmary." },
  { before: "La salle de classe est ", after: " la bibliothèque.", answer: "derrière", gloss: "La salle de classe est derrière la bibliothèque. — The classroom is behind the library." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["La", "bibliothèque", "est", "à", "côté", "de", "la", "cantine", "."], sentence: "La bibliothèque est à côté de la cantine." },
  { chunks: ["Où", "est", "la", "cantine", "?"], sentence: "Où est la cantine ?" },
  { chunks: ["L'infirmerie", "est", "derrière", "le", "terrain", "de", "sport", "."], sentence: "L'infirmerie est derrière le terrain de sport." },
  { chunks: ["La", "salle", "de", "professeurs", "est", "en", "face", "de", "la", "bibliothèque", "."], sentence: "La salle de professeurs est en face de la bibliothèque." },
  { chunks: ["La", "cantine", "est", "entre", "la", "bibliothèque", "et", "la", "salle", "de", "classe", "."], sentence: "La cantine est entre la bibliothèque et la salle de classe." },
  { chunks: ["Les", "toilettes", "sont", "près", "de", "la", "salle", "de", "classe", "."], sentence: "Les toilettes sont près de la salle de classe." },
];

const NAMES = ["Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno", "Wanjiru", "Kiptoo", "Achieng", "Mumbi", "Kamau", "Wafula"];

const SCENARIOS: { situation: (name: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} needs to return a library book but doesn't know exactly where the library is relative to the canteen.`,
    correct: "La bibliothèque est à côté de la cantine.",
    distractors: ["La bibliothèque est loin de la cantine.", "La cantine est à côté du terrain de sport.", "La bibliothèque est en face de l'infirmerie."],
    explanation: "'À côté de' names the library's actual position next to the canteen — the distractors either wrongly claim it's far away or place the wrong two buildings together.",
  },
  {
    situation: (n) => `${n} feels sick during class, and a friend wants to know exactly where the school clinic is.`,
    correct: "L'infirmerie est derrière le terrain de sport.",
    distractors: ["L'infirmerie est à côté de la cantine.", "L'infirmerie est en face de la bibliothèque.", "Le terrain de sport est derrière l'infirmerie."],
    explanation: "The infirmary's actual location is behind the sports field — the last distractor even reverses which building is behind which.",
  },
  {
    situation: (n) => `${n} wants to know where teachers usually are found between lessons.`,
    correct: "La salle de professeurs est en face de la bibliothèque.",
    distractors: ["La salle de professeurs est derrière la cantine.", "La bibliothèque est en face du terrain de sport.", "La salle de professeurs est entre la cantine et la bibliothèque."],
    explanation: "'En face de' correctly places the staff room directly opposite the library — the distractors describe a different relationship or the wrong pair of buildings.",
  },
  {
    situation: (n) => `${n} is looking for lunch and needs to find the canteen, which sits directly between two other buildings.`,
    correct: "La cantine est entre la bibliothèque et la salle de classe.",
    distractors: ["La cantine est à côté de la bibliothèque.", "La cantine est derrière la salle de classe.", "La bibliothèque est entre la cantine et la salle de classe."],
    explanation: "'Entre' fits because the canteen is flanked by two buildings — 'à côté de' and 'derrière' describe only one relationship, not being sandwiched between two.",
  },
  {
    situation: (n) => `${n} urgently needs the toilets, and a classmate points to their location right next to the classroom.`,
    correct: "Les toilettes sont près de la salle de classe.",
    distractors: ["Les toilettes sont loin de la salle de classe.", "La salle de classe est près de la cantine.", "Les toilettes sont en face du terrain de sport."],
    explanation: "'Près de' correctly names the toilets as near the classroom — the distractors either contradict 'near' with 'far' or name the wrong pair of places.",
  },
  {
    situation: (n) => `${n} wants to use a computer for a school project and needs to ask where the right room is.`,
    correct: "Où est la salle informatique ?",
    distractors: ["Où est la cantine ?", "La salle informatique est fermée.", "J'aime la salle informatique."],
    explanation: "Asking for a location needs the question form 'Où est... ?' with the actual room named — a statement about liking or closure doesn't answer where it is, and the wrong room doesn't fit the need.",
  },
  {
    situation: (n) => `New learners ask ${n} where the headteacher's office is, since it's known to be right next to the staff room.`,
    correct: "Le bureau du directeur est à côté de la salle des professeurs.",
    distractors: ["Le bureau du directeur est derrière la cantine.", "La salle des professeurs est loin du bureau du directeur.", "Le bureau du directeur est en face de l'infirmerie."],
    explanation: "'À côté de' correctly places the headteacher's office next to the staff room — the distractors name the wrong building or contradict 'next to' with 'far'.",
  },
  {
    situation: (n) => `${n} wants to play football at break time and needs to know where the playground is relative to the sports field.`,
    correct: "La cour de récréation est près du terrain de sport.",
    distractors: ["La cour de récréation est loin du terrain de sport.", "Le terrain de sport est derrière la cour de récréation.", "La cour de récréation est entre la cantine et le terrain de sport."],
    explanation: "'Près de' correctly describes the playground as near the sports field — the distractors either contradict 'near' or describe a different spatial relationship.",
  },
  {
    situation: (n) => `${n} can't remember which building is the library, so a friend gestures toward the building beside the infirmary.`,
    correct: "La bibliothèque est à côté de l'infirmerie.",
    distractors: ["La bibliothèque est derrière l'infirmerie.", "L'infirmerie est en face de la bibliothèque.", "La cantine est à côté de l'infirmerie."],
    explanation: "'À côté de' names the library as beside the infirmary, matching the gesture — the distractors describe a different relationship (behind/opposite) or name the wrong building.",
  },
  {
    situation: (n) => `A substitute teacher is told ${n}'s classroom is directly behind the library.`,
    correct: "La salle de classe est derrière la bibliothèque.",
    distractors: ["La salle de classe est à côté de la bibliothèque.", "La bibliothèque est derrière la salle de classe.", "La salle de classe est en face de la cantine."],
    explanation: "'Derrière' correctly places the classroom behind the library — the second distractor even reverses which building is behind which.",
  },
  {
    situation: (n) => `${n} wants to politely ask a stranger where the canteen is, without already knowing the answer.`,
    correct: "Où est la cantine ?",
    distractors: ["La cantine est là-bas.", "J'aime la cantine.", "La cantine est fermée."],
    explanation: "'Où est... ?' is the question form used to ask for a location — the distractors are all statements, which don't ask anything, so they wouldn't fit someone who needs directions.",
  },
  {
    situation: (n) => `${n} is teaching a younger student to use a mimicry game — pointing and gesturing instead of speaking — to ask where the toilets are.`,
    correct: "Où sont les toilettes ?",
    distractors: ["Les toilettes sont propres.", "J'aime les toilettes.", "Les toilettes sont fermées."],
    explanation: "'Où sont... ?' (plural, for 'les toilettes') is the question form for asking a location — the distractors are statements describing a state, not a question seeking directions.",
  },
];

export const gettingAroundSpeaking: Skill = {
  id: "g6-fr-ls-gettingAround",
  code: "LS.9",
  subjectId: "french",
  strandId: "g6-fr-listening-speaking",
  grade: 6,
  title: "Getting around: places and directions at school",
  description: "Informal (tu-form) French vocabulary for areas/facilities in a school and location prepositions for asking about and giving directions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each French school-location word or phrase to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Place words name a building or area; preposition words describe a location relationship.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const places = shuffle(rng, WORDS.filter((p) => p.tag === "place")).slice(0, 5);
      const prepositions = shuffle(rng, WORDS.filter((p) => p.tag === "preposition")).slice(0, 4);
      const items = shuffle(rng, [...places, ...prepositions]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word or phrase as a School Place or a Location Preposition.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "place", label: "School Place" },
          { id: "preposition", label: "Location Preposition" },
        ],
        correctBucket,
        hint: "Place words name a building or area; preposition words describe where it is relative to something else.",
        explanation: [...places, ...prepositions].map((p) => `"${p.word}" is a ${p.tag === "place" ? "school place" : "location preposition"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about a school location.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which place or preposition word fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about a school location.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The place comes first, then 'est'/'sont', then the preposition, then the reference point.",
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
      hint: "Check whether the situation needs a location statement or a question, and that the preposition matches.",
      explanation: s.explanation,
    };
  },
};
