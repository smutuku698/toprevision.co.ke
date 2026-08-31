import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { SCHOOL_FACILITY_FUNCTIONS, SCHOOL_VOCAB, name, umlautAccepted } from "./shared";

// Reading strand, Theme 3: My Surroundings (My School) — reading aloud for articulation of school
// facilities and what happens there, drawn from SCHOOL_VOCAB and SCHOOL_FACILITY_FUNCTIONS.

function twoNames(rng: RNG): [string, string] {
  const a = name(rng);
  let b = name(rng);
  while (b === a) b = name(rng);
  return [a, b];
}

const DIALOGUE_SKELETONS: ((a: string, b: string) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (a, b) => ({
    lines: [`${a}: Wo ist die Bibliothek?`, `${b}: Die Bibliothek ist neben dem Klassenzimmer.`, `${a}: Was machst du in der Bibliothek?`, `${b}: Ich lese Bücher dort.`, `${a}: Und wo ist der Sportplatz?`, `${b}: Der Sportplatz ist hinter der Schule.`],
    qa: [
      { q: `Where is the library, according to ${b}?`, correct: "Next to the classroom", distractors: ["Behind the school", "Next to the office", "The passage does not say"], explanation: `${b} says "Die Bibliothek ist neben dem Klassenzimmer."` },
      { q: `What does ${b} do in the library?`, correct: "Reads books (liest Bücher)", distractors: ["Plays football", "Eats lunch", "Does experiments"], explanation: `${b} says "Ich lese Bücher dort."` },
      { q: "Where is the sports field?", correct: "Behind the school", distractors: ["Next to the classroom", "In front of the office", "The passage does not say"], explanation: `${b} says "Der Sportplatz ist hinter der Schule."` },
    ],
  }),
  (a, b) => ({
    lines: [`${a}: Ich gehe zur Kantine.`, `${b}: Was machst du in der Kantine?`, `${a}: Ich esse dort mein Mittagessen.`, `${b}: Wo ist das Lehrerzimmer?`, `${a}: Das Lehrerzimmer ist neben dem Büro.`, `${b}: Danke!`],
    qa: [
      { q: `Why does ${a} go to the canteen?`, correct: "To eat lunch (isst dort Mittagessen)", distractors: ["To play football", "To borrow a book", "To do an experiment"], explanation: `${a} says "Ich esse dort mein Mittagessen."` },
      { q: "Where is the staffroom, according to the passage?", correct: "Next to the office", distractors: ["Behind the sports field", "Next to the canteen", "The passage does not say"], explanation: `${a} says "Das Lehrerzimmer ist neben dem Büro."` },
      { q: `Who asks about the location of the staffroom?`, correct: b, distractors: [a, "Neither", "Both at the same time"], explanation: `${b} asks "Wo ist das Lehrerzimmer?"` },
    ],
  }),
  (a, b) => ({
    lines: [`${a}: Wo lernst du Deutsch?`, `${b}: Ich lerne im Klassenzimmer.`, `${a}: Und wo spielst du Fußball?`, `${b}: Ich spiele auf dem Sportplatz.`, `${a}: Gibt es ein Labor an der Schule?`, `${b}: Ja, das Labor ist neben der Bibliothek.`],
    qa: [
      { q: `Where does ${b} learn German?`, correct: "In the classroom", distractors: ["In the library", "In the laboratory", "The passage does not say"], explanation: `${b} says "Ich lerne im Klassenzimmer."` },
      { q: `Where does ${b} play football?`, correct: "On the sports field", distractors: ["In the classroom", "In the hall", "The passage does not say"], explanation: `${b} says "Ich spiele auf dem Sportplatz."` },
      { q: "Where is the laboratory, according to the passage?", correct: "Next to the library", distractors: ["Next to the office", "Behind the canteen", "The passage does not say"], explanation: `${b} says "das Labor ist neben der Bibliothek."` },
    ],
  }),
  (a, b) => ({
    lines: [`${a}: Wo ist das Klo?`, `${b}: Das Klo ist hinter dem Lehrerzimmer.`, `${a}: Und der Spielplatz?`, `${b}: Der Spielplatz ist vor der Schule.`, `${a}: Gibt es einen Computerraum?`, `${b}: Ja, er ist neben dem Klassenzimmer.`],
    qa: [
      { q: "Where is the toilet, according to the passage?", correct: "Behind the staffroom", distractors: ["In front of the school", "Next to the classroom", "The passage does not say"], explanation: `${b} says "Das Klo ist hinter dem Lehrerzimmer."` },
      { q: "Where is the playground?", correct: "In front of the school", distractors: ["Behind the staffroom", "Next to the library", "The passage does not say"], explanation: `${b} says "Der Spielplatz ist vor der Schule."` },
      { q: "Where is the computer room?", correct: "Next to the classroom", distractors: ["Next to the office", "Behind the sports field", "The passage does not say"], explanation: `${b} says "er ist neben dem Klassenzimmer."` },
    ],
  }),
  (a, b) => ({
    lines: [`${a}: Was machst du auf dem Spielplatz?`, `${b}: Ich spiele mit meinen Freunden.`, `${a}: Und in der Halle?`, `${b}: Wir singen und tanzen in der Halle.`, `${a}: Ist der Garten schön?`, `${b}: Ja, der Garten ist sehr schön.`],
    qa: [
      { q: `What does ${b} do on the playground?`, correct: "Plays with friends (spielt mit Freunden)", distractors: ["Reads books", "Eats lunch", "Does experiments"], explanation: `${b} says "Ich spiele mit meinen Freunden."` },
      { q: `What happens in the hall, according to ${b}?`, correct: "Singing and dancing", distractors: ["Reading and writing", "Eating lunch", "Football practice"], explanation: `${b} says "Wir singen und tanzen in der Halle."` },
      { q: "What does the passage say about the garden?", correct: "It is very beautiful", distractors: ["It is very small", "It is closed today", "The passage does not describe it"], explanation: `${b} says "der Garten ist sehr schön."` },
    ],
  }),
];

const MATCH_POOL = SCHOOL_VOCAB;

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "In a school passage, 'library' is written as ", after: ".", correct: "die Bibliothek" },
  { before: "'Classroom' appears in reading texts as ", after: ".", correct: "das Klassenzimmer" },
  { before: "The word for 'sports field' when reading aloud is ", after: ".", correct: "der Sportplatz" },
  { before: "'Staffroom' reads as ", after: " in a school description.", correct: "das Lehrerzimmer" },
  { before: "'Toilet' is written as ", after: " in the passage.", correct: "das Klo" },
  { before: "'Canteen' reads as ", after: " in a school text.", correct: "die Kantine" },
  { before: "The reading word for 'office' is ", after: ".", correct: "das Büro" },
  { before: "'Playground' appears as ", after: " in the passage.", correct: "der Spielplatz" },
  { before: "'Laboratory' reads as ", after: " in a school passage.", correct: "das Labor" },
  { before: "'Computer room' is written as ", after: " in the reading text.", correct: "der Computerraum" },
  { before: "The place where you find facts about the library's function reads: reading happens in ", after: ".", correct: "die Bibliothek" },
];

const FUNCTION_FILL_TEMPLATES: { before: string; after: string; correct: string }[] = SCHOOL_FACILITY_FUNCTIONS.map((f) => ({
  before: `A reading text says the activity "${f.function}" usually happens at `,
  after: ".",
  correct: f.word,
}));

const ALL_FILL_TEMPLATES = [...FILL_TEMPLATES, ...FUNCTION_FILL_TEMPLATES];

const MATCH_OPENERS = [
  "Match each school word from the passage to its meaning.",
  "Which meaning goes with which German school word?",
  "Pair each school term with its correct English meaning.",
  "Match the German word to what it means.",
  "Connect each school word from the reading to its meaning.",
];
const MATCH_CLOSERS = [
  "",
  " Use the passage above as your guide.",
  " Think about which part of the school each word names.",
  " Reread the passage carefully before you answer.",
];

const FILL_OPENERS = [
  "Fill in the missing school word.",
  "Complete the sentence with the correct German word.",
  "What word completes this school sentence?",
  "Fill the gap correctly.",
  "Complete this reading fact about school facilities.",
];
const FILL_CLOSERS = [
  "",
  " Read it aloud once you finish.",
  " Think about the school passage above.",
  " Check your spelling carefully.",
];

const ORDER_OPENERS = [
  "Put these lines from the passage in the order they were read.",
  "Arrange the passage's lines in the correct reading order.",
  "Sequence this school conversation correctly.",
  "Order the lines as they appear in the passage.",
  "Which order makes this reading passage make sense?",
];
const ORDER_CLOSERS = [
  "",
  " Read each line carefully first.",
  " Think about how the conversation naturally flows.",
  " One location is asked about after another.",
];

const CATEGORIZE_OPENERS = [
  "As you read, sort each place: for Learning, for Play/sport, or Other facility?",
  "Group these school words by what usually happens there.",
  "Sort each word into the category it belongs to.",
  "Classify each school word from the reading text.",
  "Which category best fits each school place?",
];
const CATEGORIZE_CLOSERS = [
  "",
  " Think about the main activity at each place.",
  " Reread the passage above if you need a reminder.",
  " Some places are for lessons, some for play, some are other rooms.",
];

export const surroundingsReading: Skill = {
  id: "g6-de-r-surroundings",
  code: "R.3",
  subjectId: "german",
  strandId: "g6-de-reading",
  grade: 6,
  title: "Reading aloud: my surroundings (my school)",
  description: "Read short German passages about school facilities aloud for articulation, recognise school vocabulary, and answer comprehension questions about the passage.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const [a, b] = twoNames(rng);
    const skeleton = randChoice(rng, DIALOGUE_SKELETONS)(a, b);
    const passage = skeleton.lines.join("\n");

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_POOL).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;
      return {
        kind: "click-match",
        passage,
        prompt: `${randChoice(rng, MATCH_OPENERS)}${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "Reread the passage above — each word appears in context there.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, ALL_FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        passage,
        prompt: `${randChoice(rng, FILL_OPENERS)}${randChoice(rng, FILL_CLOSERS)}`,
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: umlautAccepted(f.correct),
        inputMode: "text",
        hint: "Use the passage above as a reminder of how each word is used.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "ordering") {
      const withIds = skeleton.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, ORDER_OPENERS)}${randChoice(rng, ORDER_CLOSERS)}`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "The passage moves from one question about the school to the next.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SCHOOL_VOCAB).slice(0, 6);
      const bucketOf = (w: string) =>
        ["das Klassenzimmer", "die Bibliothek", "das Labor", "der Computerraum"].includes(w)
          ? "Learning space"
          : ["der Sportplatz", "der Spielplatz", "die Halle", "der Garten"].includes(w)
          ? "Play/sport space"
          : "Other facility";
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)}${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Learning space", label: "Learning space" },
          { id: "Play/sport space", label: "Play/sport space" },
          { id: "Other facility", label: "Other facility" },
        ],
        correctBucket,
        hint: "Classrooms/libraries/labs are for learning; sports fields/playgrounds/halls/gardens are for play; the rest are other facilities.",
        explanation: chosen.map((c) => `"${c.word}" is a ${bucketOf(c.word).toLowerCase()}.`).join(" "),
      };
    }

    const qa = randChoice(rng, skeleton.qa);
    const choices = shuffle(rng, Array.from(new Set([qa.correct, ...qa.distractors])));
    return {
      kind: "multiple-choice",
      passage,
      prompt: qa.q,
      choices,
      correctIndex: choices.indexOf(qa.correct),
      layout: "list",
      hint: "Reread the passage above carefully before answering.",
      explanation: qa.explanation,
    };
  },
};
