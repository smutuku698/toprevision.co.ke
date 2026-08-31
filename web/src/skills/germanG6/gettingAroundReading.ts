import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { CLASSROOM_ITEMS, POSITION_VOCAB, name, umlautAccepted } from "./shared";

// Reading strand, Theme 9: Getting Around (in the school) — guided reading/vocabulary of position
// and location phrases about school items and rooms, drawn from POSITION_VOCAB, CLASSROOM_ITEMS,
// and SCHOOL_VOCAB.

function twoNames(rng: RNG): [string, string] {
  const a = name(rng);
  let b = name(rng);
  while (b === a) b = name(rng);
  return [a, b];
}

const DIALOGUE_SKELETONS: ((a: string, b: string, item: { word: string; meaning: string }, pos: { word: string; meaning: string }, furniture: { word: string; meaning: string }) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (a, b, item, pos, furniture) => ({
    lines: [`${a}: Wo liegt ${item.word}?`, `${b}: ${item.word} liegt ${pos.word} ${furniture.word}.`, `${a}: Danke! Und wo ist das Klo?`, `${b}: Das Klo ist hinter dem Lehrerzimmer.`, `${a}: Alles klar, danke für die Hilfe!`, `${b}: Bitte, gern geschehen!`],
    qa: [
      { q: `Where does ${b} say ${item.word} is?`, correct: `${pos.word} ${furniture.word} (${pos.meaning} ${furniture.meaning})`, distractors: ["neben der Tür (next to the door)", "in der Tasche (in the bag)", "The passage does not say"], explanation: `${b} says "${item.word} liegt ${pos.word} ${furniture.word}."` },
      { q: "Where is the toilet, according to the passage?", correct: "Behind the staffroom", distractors: ["In front of the school", "Next to the classroom", "The passage does not say"], explanation: `${b} says "Das Klo ist hinter dem Lehrerzimmer."` },
      { q: `Who thanks ${b} for the help?`, correct: a, distractors: [b, "Neither", "Both at the same time"], explanation: `${a} says "danke für die Hilfe!"` },
    ],
  }),
  (a, b, item, pos, furniture) => ({
    lines: [`${a}: Ich finde ${item.word} nicht.`, `${b}: Schau mal, es ist ${pos.word} ${furniture.word}.`, `${a}: Oh, ich sehe es jetzt! Danke.`, `${b}: Kein Problem. Wo ist deine Tasche?`, `${a}: Meine Tasche ist neben der Tür.`, `${b}: Gut, dann können wir gehen.`],
    qa: [
      { q: `What is ${a} looking for at the start of the passage?`, correct: item.word, distractors: ["die Tafel", "das Heft", "The passage does not say"], explanation: `${a} says "Ich finde ${item.word} nicht."` },
      { q: `Where does ${b} say it is?`, correct: `${pos.word} ${furniture.word}`, distractors: ["auf dem Boden (on the floor)", "in der Schule (in the school)", "The passage does not say"], explanation: `${b} says "es ist ${pos.word} ${furniture.word}."` },
      { q: `Where is ${a}'s bag, according to the passage?`, correct: "Next to the door", distractors: ["Under the table", "Behind the cupboard", "The passage does not say"], explanation: `${a} says "Meine Tasche ist neben der Tür."` },
    ],
  }),
  (a, b, item, pos, furniture) => ({
    lines: [`${a}: Wo ist der Computerraum?`, `${b}: Er ist neben dem Klassenzimmer.`, `${a}: Und wo liegt ${item.word}?`, `${b}: ${item.word} liegt ${pos.word} ${furniture.word}, im Klassenzimmer.`, `${a}: Perfekt, ich gehe jetzt dorthin.`, `${b}: Viel Erfolg!`],
    qa: [
      { q: "Where is the computer room, according to the passage?", correct: "Next to the classroom", distractors: ["Behind the office", "Next to the library", "The passage does not say"], explanation: `${b} says "Er ist neben dem Klassenzimmer."` },
      { q: `Where is ${item.word}, according to ${b}?`, correct: `${pos.word} ${furniture.word}, in the classroom`, distractors: ["in der Bibliothek (in the library)", "auf dem Sportplatz (on the sports field)", "The passage does not say"], explanation: `${b} says "${item.word} liegt ${pos.word} ${furniture.word}, im Klassenzimmer."` },
      { q: `Where does ${a} go at the end of the passage?`, correct: "To the classroom", distractors: ["To the canteen", "To the sports field", "The passage does not say"], explanation: `${a} says "ich gehe jetzt dorthin" right after learning where the classroom is.` },
    ],
  }),
  (a, b, item, pos, furniture) => ({
    lines: [`${a}: Kannst du mir helfen? Ich suche ${item.word}.`, `${b}: Klar, es liegt ${pos.word} ${furniture.word}.`, `${a}: Und der Sportplatz, wo ist der?`, `${b}: Der Sportplatz ist hinter der Schule.`, `${a}: Super, jetzt weiß ich alles!`, `${b}: Gern geschehen!`],
    qa: [
      { q: `What does ${a} ask ${b} for help with?`, correct: `Finding ${item.word}`, distractors: ["Finding the library", "Finding the office", "The passage does not say"], explanation: `${a} says "Ich suche ${item.word}."` },
      { q: `Where does ${b} say ${item.word} is?`, correct: `${pos.word} ${furniture.word}`, distractors: ["auf dem Stuhl (on the chair) only", "in der Kantine (in the canteen)", "The passage does not say"], explanation: `${b} says "es liegt ${pos.word} ${furniture.word}."` },
      { q: "Where is the sports field, according to the passage?", correct: "Behind the school", distractors: ["In front of the school", "Next to the office", "The passage does not say"], explanation: `${b} says "Der Sportplatz ist hinter der Schule."` },
    ],
  }),
  (a, b, item, pos, furniture) => ({
    lines: [`${a}: Wo ist die Bibliothek?`, `${b}: Sie ist neben dem Büro.`, `${a}: Und wo liegt ${item.word} in der Bibliothek?`, `${b}: ${item.word} liegt ${pos.word} ${furniture.word}.`, `${a}: Vielen Dank für die genaue Beschreibung!`, `${b}: Kein Problem, viel Spaß beim Lesen!`],
    qa: [
      { q: "Where is the library, according to the passage?", correct: "Next to the office", distractors: ["Behind the school", "Next to the classroom", "The passage does not say"], explanation: `${b} says "Sie ist neben dem Büro."` },
      { q: `Where is ${item.word} inside the library?`, correct: `${pos.word} ${furniture.word}`, distractors: ["auf dem Sportplatz (on the sports field)", "im Lehrerzimmer (in the staffroom)", "The passage does not say"], explanation: `${b} says "${item.word} liegt ${pos.word} ${furniture.word}."` },
      { q: `What does ${a} thank ${b} for?`, correct: "The precise/accurate description", distractors: ["A gift", "A book", "The passage does not say"], explanation: `${a} says "Vielen Dank für die genaue Beschreibung!"` },
    ],
  }),
];

const MATCH_POOL = POSITION_VOCAB;

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "In a reading text, 'on' is written as ", after: ".", correct: "auf" },
  { before: "'Under' appears in reading texts as ", after: ".", correct: "unter" },
  { before: "The word for 'behind' when reading aloud is ", after: ".", correct: "hinter" },
  { before: "'In front of' reads as ", after: " in a location passage.", correct: "vor" },
  { before: "'Next to' is written as ", after: " in the passage.", correct: "neben" },
  { before: "'Between' reads as ", after: " in a location text.", correct: "zwischen" },
  { before: "'Above' appears as ", after: " in the passage.", correct: "über" },
  { before: "In a reading text, 'the German book' is written as ", after: ".", correct: "das Deutschbuch" },
  { before: "'The chair' appears in reading texts as ", after: ".", correct: "der Stuhl" },
  { before: "'The exercise book' reads as ", after: " in a location passage.", correct: "das Heft" },
  { before: "'The cupboard' is written as ", after: " in the passage.", correct: "der Schrank" },
];

const MATCH_OPENERS = [
  "Match each position word from the passage to its meaning.",
  "Which meaning goes with which German position word?",
  "Pair each location term with its correct English meaning.",
  "Match the German word to what it means.",
  "Connect each position word from the reading to its meaning.",
];
const MATCH_CLOSERS = [
  "",
  " Use the passage above as your guide.",
  " Think about where each word places something.",
  " Reread the passage carefully before you answer.",
];

const FILL_OPENERS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct German word.",
  "What word completes this sentence about location?",
  "Fill the gap correctly.",
  "Complete this reading fact about getting around the school.",
];
const FILL_CLOSERS = [
  "",
  " Read it aloud once you finish.",
  " Think about the passage above.",
  " Check your spelling carefully.",
];

const ORDER_OPENERS = [
  "Put these lines from the passage in the order they were read.",
  "Arrange the passage's lines in the correct reading order.",
  "Sequence this conversation about the school correctly.",
  "Order the lines as they appear in the passage.",
  "Which order makes this reading passage make sense?",
];
const ORDER_CLOSERS = [
  "",
  " Read each line carefully first.",
  " Think about how the conversation naturally flows.",
  " A question about location usually comes before the answer.",
];

const CATEGORIZE_OPENERS = [
  "As you read, sort each item: Furniture, Stationery, or Room fixture?",
  "Group these classroom words by what kind of item they are.",
  "Sort each word into the category it belongs to.",
  "Classify each classroom word from the reading text.",
  "Which category best fits each classroom item?",
];
const CATEGORIZE_CLOSERS = [
  "",
  " Think about whether you sit on it, write with it, or find it fixed in the room.",
  " Reread the passage above if you need a reminder.",
  " Chairs and cupboards are furniture; pens and books are stationery.",
];

const FURNITURE_WORDS = ["der Stuhl", "der Tisch", "der Schrank"];
const STATIONERY_WORDS = ["das Deutschbuch", "die Tasche", "der Stift", "das Heft"];

export const gettingAroundReading: Skill = {
  id: "g6-de-r-getting-around",
  code: "R.9",
  subjectId: "german",
  strandId: "g6-de-reading",
  grade: 6,
  title: "Guided reading: getting around (in the school)",
  description: "Read short German passages about where things and places are located in the school, recognise position and classroom vocabulary, and answer comprehension questions about the passage.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const [a, b] = twoNames(rng);
    const item = randChoice(rng, CLASSROOM_ITEMS);
    const pos = randChoice(rng, POSITION_VOCAB);
    let furniture = randChoice(rng, CLASSROOM_ITEMS);
    while (furniture.word === item.word) furniture = randChoice(rng, CLASSROOM_ITEMS);
    const skeleton = randChoice(rng, DIALOGUE_SKELETONS)(a, b, item, pos, furniture);
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
      const f = randChoice(rng, FILL_TEMPLATES);
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
        hint: "The passage asks about a location, then answers, then moves on.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CLASSROOM_ITEMS).slice(0, 6);
      const bucketOf = (w: string) =>
        FURNITURE_WORDS.includes(w) ? "Furniture" : STATIONERY_WORDS.includes(w) ? "Stationery" : "Room fixture";
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)}${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Furniture", label: "Furniture" },
          { id: "Stationery", label: "Stationery" },
          { id: "Room fixture", label: "Room fixture" },
        ],
        correctBucket,
        hint: "Chairs, tables, and cupboards are furniture; books, bags, pens, and exercise books are stationery; blackboards, doors, and windows are fixed room fixtures.",
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
