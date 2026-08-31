import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const COMMON_PROPER: { word: string; type: "common" | "proper" }[] = [
  { word: "teacher", type: "common" },
  { word: "school", type: "common" },
  { word: "market", type: "common" },
  { word: "farmer", type: "common" },
  { word: "student", type: "common" },
  { word: "monitor", type: "common" },
  { word: "Wanjiru", type: "proper" },
  { word: "Kenya", type: "proper" },
  { word: "Nairobi", type: "proper" },
  { word: "Mombasa", type: "proper" },
  { word: "Kimani", type: "proper" },
  { word: "Lake Victoria", type: "proper" },
] as const;

const CONCRETE_ABSTRACT: { word: string; type: "concrete" | "abstract" }[] = [
  { word: "broom", type: "concrete" },
  { word: "uniform", type: "concrete" },
  { word: "timetable", type: "concrete" },
  { word: "classroom", type: "concrete" },
  { word: "bell", type: "concrete" },
  { word: "chalk", type: "concrete" },
  { word: "honesty", type: "abstract" },
  { word: "responsibility", type: "abstract" },
  { word: "punctuality", type: "abstract" },
  { word: "discipline", type: "abstract" },
  { word: "courage", type: "abstract" },
  { word: "duty", type: "abstract" },
] as const;

const MATCH_POOL: { word: string; label: string }[] = [
  { word: "Kimani", label: "Proper noun (names a specific, particular person)" },
  { word: "Nairobi", label: "Proper noun (names a specific, particular place)" },
  { word: "farmer", label: "Common noun (names a general kind of person)" },
  { word: "classroom", label: "Common noun (names a general kind of place)" },
  { word: "honesty", label: "Abstract noun (names a quality you cannot see or touch)" },
  { word: "responsibility", label: "Abstract noun (names an idea you cannot see or touch)" },
  { word: "broom", label: "Concrete noun (names something you can see and touch)" },
  { word: "bell", label: "Concrete noun (names something you can see and touch)" },
];

const IDENTIFY_MC: { sentence: string; target: string; correct: string; distractors: string[] }[] = [
  {
    sentence: "Every morning, Achieng sweeps the compound before leaving for school.",
    target: "Achieng",
    correct: "Proper noun",
    distractors: ["Common noun", "Abstract noun", "Collective noun"],
  },
  {
    sentence: "The head teacher praised the student who returned the lost wallet.",
    target: "student",
    correct: "Common noun",
    distractors: ["Proper noun", "Abstract noun", "Collective noun"],
  },
  {
    sentence: "Otieno's honesty earned him the trust of the whole class.",
    target: "honesty",
    correct: "Abstract noun",
    distractors: ["Proper noun", "Collective noun", "Compound noun"],
  },
  {
    sentence: "Wanjiku folded her blue uniform neatly before hanging it up.",
    target: "uniform",
    correct: "Concrete noun",
    distractors: ["Abstract noun", "Proper noun", "Collective noun"],
  },
  {
    sentence: "The pupils of Moi Primary School in Eldoret raised funds for their sick classmate.",
    target: "Eldoret",
    correct: "Proper noun",
    distractors: ["Common noun", "Abstract noun", "Collective noun"],
  },
  {
    sentence: "Good discipline helps a learner to complete assignments on time.",
    target: "discipline",
    correct: "Abstract noun",
    distractors: ["Concrete noun", "Proper noun", "Collective noun"],
  },
  {
    sentence: "Every class needs a reliable timetable pinned near the door.",
    target: "timetable",
    correct: "Concrete noun",
    distractors: ["Abstract noun", "Proper noun", "Collective noun"],
  },
];

const PROPER_CAPITALIZATION_MC: { correct: string; wrong: string[]; note: string }[] = [
  {
    correct: "Every year, learners across Kenya celebrate Mashujaa Day with pride.",
    wrong: [
      "Every year, learners across kenya celebrate mashujaa day with pride.",
      "Every year, learners across Kenya celebrate mashujaa day with pride.",
      "Every year, learners across kenya celebrate Mashujaa Day with pride.",
    ],
    note: "Proper nouns name specific people, places, or events and must always begin with a capital letter — 'Kenya' and 'Mashujaa Day' both need capitals.",
  },
  {
    correct: "Amina Hassan was elected class prefect at Nakuru Township Primary School.",
    wrong: [
      "amina hassan was elected class prefect at nakuru township primary school.",
      "Amina hassan was elected class prefect at nakuru Township primary school.",
      "Amina Hassan was elected class prefect at nakuru township Primary School.",
    ],
    note: "Every part of a proper noun — a person's full name and the full name of a specific school — must be capitalized.",
  },
  {
    correct: "Juma promised his mother he would visit Kisumu next December.",
    wrong: [
      "juma promised his mother he would visit kisumu next december.",
      "Juma promised his mother he would visit kisumu next December.",
      "Juma promised his mother he would visit Kisumu next december.",
    ],
    note: "Proper nouns — a person's name, a city's name, and the name of a month — all require a capital letter, while common nouns like 'mother' do not.",
  },
];

const CONSTRUCT_FILL: { before: string; after: string; correctAnswer: string; clue: string }[] = [
  { before: "The plane carrying the athletes landed safely in ", after: " after their long journey.", correctAnswer: "Nairobi", clue: "Fill in the proper noun that names Kenya's capital city." },
  { before: "Being truthful even when no one is watching is a sign of true ", after: ".", correctAnswer: "honesty", clue: "Fill in the abstract noun that means being truthful." },
  { before: "Before the exam, every student cleaned the ", after: " they had used all term.", correctAnswer: "classroom", clue: "Fill in a common, concrete noun for the room where lessons take place." },
  { before: "Arriving for class on time every day shows good ", after: ".", correctAnswer: "punctuality", clue: "Fill in the abstract noun that describes being on time." },
  { before: "The prefects swept the ", after: " with a stiff broom every morning.", correctAnswer: "compound", clue: "Fill in a common, concrete noun naming the school grounds." },
  { before: "Njoroge always finishes his chores, showing great ", after: " at home.", correctAnswer: "responsibility", clue: "Fill in the abstract noun that describes being dependable and dutiful." },
];

export const nounsCommonProperConcreteAbstract: Skill = {
  id: "g7-eng-g-nouns-common-proper-concrete-abstract",
  code: "G.1",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Word Classes: Nouns (Common, Proper, Concrete, Abstract)",
  description: "Identify common, proper, concrete, and abstract nouns and use them correctly in sentences about personal responsibility.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize-cp", "categorize-ca", "match", "identify-mc", "capital-mc", "fill"] as const);

    if (branch === "categorize-cp") {
      const chosen = shuffle(rng, COMMON_PROPER).slice(0, 6);
      const buckets = [
        { id: "common", label: "Common noun (a general name)" },
        { id: "proper", label: "Proper noun (a specific name, capitalized)" },
      ];
      const items = chosen.map((c, i) => ({ id: `n${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`n${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each noun as common or proper.",
        items,
        buckets,
        correctBucket,
        hint: "A proper noun names one specific person, place, or thing and starts with a capital letter. A common noun names a general kind of person, place, or thing.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.type} noun.`).join(" "),
      };
    }

    if (branch === "categorize-ca") {
      const chosen = shuffle(rng, CONCRETE_ABSTRACT).slice(0, 6);
      const buckets = [
        { id: "concrete", label: "Concrete noun (you can see or touch it)" },
        { id: "abstract", label: "Abstract noun (an idea, quality, or feeling)" },
      ];
      const items = chosen.map((c, i) => ({ id: `n${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`n${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each noun as concrete or abstract.",
        items,
        buckets,
        correctBucket,
        hint: "A concrete noun names something you can experience with your senses. An abstract noun names a quality, idea, or feeling you cannot touch.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.type} noun.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_POOL).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((c, i) => ({ id: `w${i}`, label: c.word })));
      const targets = shuffle(rng, chosen.map((c, i) => ({ id: `w${i}`, label: c.label })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((c, i) => (correctMap[`w${i}`] = `w${i}`));
      return {
        kind: "click-match",
        prompt: "Match each noun to the noun type it belongs to here.",
        tokens,
        targets,
        correctMap,
        hint: "Ask: is this a specific name, a general name, something you can touch, or an idea/quality?",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.label.split(" (")[0].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "identify-mc") {
      const entry = randChoice(rng, IDENTIFY_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `What type of noun is "${entry.target}" in this sentence? "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Decide whether the word names something specific and capitalized, something general, something you can touch, or an idea/quality.",
        explanation: `"${entry.target}" is a ${entry.correct.toLowerCase()} in this sentence: "${entry.sentence}"`,
      };
    }

    if (branch === "capital-mc") {
      const entry = randChoice(rng, PROPER_CAPITALIZATION_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.wrong]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence correctly capitalizes all of its proper nouns?",
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Check every specific name of a person, place, month, or event — each one needs a capital letter.",
        explanation: entry.note,
      };
    }

    const entry = randChoice(rng, CONSTRUCT_FILL);
    return {
      kind: "fill-blank",
      prompt: entry.clue,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Reread the clue carefully — it tells you exactly which type of noun to use.",
      explanation: `"${entry.correctAnswer}" fits here: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
