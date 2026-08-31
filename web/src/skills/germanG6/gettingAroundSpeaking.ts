import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { CLASSROOM_ITEMS, POSITION_VOCAB, name, place, umlautAccepted } from "./shared";

// LS.9 Getting Around (in the school) — oral position/location vocabulary and classroom items
// practised through matching, sorting, fill-in, an ordered locating dialogue, situational reasoning,
// and a dedicated "Wo liegt/ist ...?" drill matching the design's "Das Deutschbuch liegt auf dem
// Stuhl" and "Das Klo ist hinter dem Lehrerzimmer" position sentences.

const MATCH_OPENERS = ["Match each German word", "Pair every classroom word", "Connect each vocabulary item", "Link each word below", "Match the German term", "Join each classroom word"];
const MATCH_CLOSERS = ["to its correct English meaning.", "with what it means in English.", "to its English translation.", "to the right meaning.", "to what it means."];

const CATEGORIZE_OPENERS = ["Sort each item", "Group these German words", "Classify each classroom item", "Decide where each item belongs", "Organise the items below", "Put each item"];
const CATEGORIZE_CLOSERS = ["into the correct category.", "by which group it belongs to.", "into the right group.", "according to its category.", "the way it should be grouped."];

const FILL_OPENERS = ["Fill in the missing German word", "Complete the sentence with the right German word", "Work out the missing German word", "Type the correct German word", "Supply the missing German word", "Complete this phrase correctly"];
const FILL_CLOSERS = ["to finish the sentence.", "so the sentence is correct.", "that fits the meaning.", "based on the meaning given."];

const ORDER_OPENERS = ["Put these lines", "Arrange the locating chat", "Order the sentences", "Sequence this exchange", "Rearrange the pieces", "Organise the lines"];
const ORDER_CLOSERS = ["in the correct order.", "so they make sense.", "the way they would naturally be said.", "into a sensible sequence.", "in a logical order."];

const SCENARIO_PROMPT_POOL = [
  "What is happening in this situation?",
  "Read the situation and choose what fits.",
  "Work out what is being expressed here.",
  "Choose the phrase that matches the situation.",
  "What is this person doing?",
  "Pick the correct description of this moment.",
  "Decide what fits this scene.",
  "What is being said here?",
  "Which description matches what was said?",
  "Choose what best explains this exchange.",
  "What is really going on in this exchange?",
  "Work out the purpose of what was said.",
];

const LOCATION_PROMPT_POOL = [
  "Which sentence correctly says where this is?",
  "Choose the sentence with the correct position word.",
  "Pick the sentence that correctly locates this.",
  "Which option uses the right preposition?",
  "Select the sentence with the correct location.",
  "What is the correct way to say where this is?",
  "Which sentence matches where this actually is?",
  "Choose the correctly located sentence.",
  "Which sentence has the right position word for this?",
  "Pick the option that is positioned correctly.",
  "Which sentence would a German speaker actually say?",
  "Select the sentence without a position mistake.",
];

type Bucket = "Furniture" | "Stationery or supplies" | "Fixture";

const CATEGORY_ITEMS: { word: string; bucket: Bucket }[] = [
  { word: "der Stuhl", bucket: "Furniture" },
  { word: "der Tisch", bucket: "Furniture" },
  { word: "der Schrank", bucket: "Furniture" },
  { word: "das Deutschbuch", bucket: "Stationery or supplies" },
  { word: "die Tasche", bucket: "Stationery or supplies" },
  { word: "der Stift", bucket: "Stationery or supplies" },
  { word: "das Heft", bucket: "Stationery or supplies" },
  { word: "die Tafel", bucket: "Fixture" },
  { word: "die Tür", bucket: "Fixture" },
  { word: "das Fenster", bucket: "Fixture" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'The German book' in German is ", after: ".", correct: "das Deutschbuch" },
  { before: "'The chair' in German is ", after: ".", correct: "der Stuhl" },
  { before: "'The table' in German is ", after: ".", correct: "der Tisch" },
  { before: "'The blackboard' in German is ", after: ".", correct: "die Tafel" },
  { before: "'The bag' in German is ", after: ".", correct: "die Tasche" },
  { before: "'The pen' in German is ", after: ".", correct: "der Stift" },
  { before: "'The exercise book' in German is ", after: ".", correct: "das Heft" },
  { before: "'The door' in German is ", after: ".", correct: "die Tür" },
  { before: "'The window' in German is ", after: ".", correct: "das Fenster" },
  { before: "'On' in German is ", after: ".", correct: "auf" },
  { before: "'Under' in German is ", after: ".", correct: "unter" },
  { before: "'Behind' in German is ", after: ".", correct: "hinter" },
  { before: "'In front of' in German is ", after: ".", correct: "vor" },
  { before: "'Next to' in German is ", after: ".", correct: "neben" },
];

const ORDER_SETS: { lines: string[] }[] = [
  { lines: ["Wo liegt das Deutschbuch? (where is the German book?)", "Es liegt auf dem Stuhl. (it is on the chair)", "Wo liegt das Heft? (where is the exercise book?)", "Es liegt im Schrank. (it is in the cupboard)"] },
  { lines: ["Wo ist das Klo? (where is the toilet?)", "Es ist hinter dem Lehrerzimmer. (it is behind the staffroom)", "Wo ist die Bibliothek? (where is the library?)", "Sie ist neben dem Klassenzimmer. (it is next to the classroom)"] },
  { lines: ["Wo ist meine Tasche? (where is my bag?)", "Sie liegt unter dem Tisch. (it is under the table)", "Und mein Stift? (and my pen?)", "Er liegt neben dem Heft. (it is next to the exercise book)"] },
  { lines: ["Wo ist der Sportplatz? (where is the sports field?)", "Er ist hinter der Schule. (it is behind the school)", "Wo ist das Büro? (where is the office?)", "Es ist vor dem Klassenzimmer. (it is in front of the classroom)"] },
  { lines: ["Ich suche die Tafel. (I'm looking for the blackboard)", "Sie ist vor den Schülern. (it is in front of the students)", "Und das Fenster? (and the window?)", "Es ist über dem Schrank. (it is above the cupboard)"] },
];

const SCENARIO_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} at school in ${p} asks "Wo liegt mein Stift?" What is ${n} doing?`,
    correct: "asking where their pen is",
    distractors: ["asking where their bag is", "asking what time it is", "asking who has the pen"],
    explanation: `"Wo liegt mein Stift?" specifically asks the location of "der Stift" (the pen), not the bag or the time.`,
  }),
  (n, p) => ({
    prompt: `A classmate in ${p} tells ${n}, "Deine Tasche liegt unter dem Tisch." What is the classmate telling ${n}?`,
    correct: "where the bag is located",
    distractors: ["what the bag looks like", "who owns the bag", "when to pick up the bag"],
    explanation: `"liegt unter dem Tisch" (lies under the table) states a location, not an appearance or an owner.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Das Klo ist hinter dem Lehrerzimmer." What is ${n} describing?`,
    correct: "where the toilet is relative to the staffroom",
    distractors: ["where the staffroom is relative to the library", "what the toilet looks like", "how far the toilet is"],
    explanation: `"hinter dem Lehrerzimmer" (behind the staffroom) locates the toilet relative to the staffroom.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Die Bibliothek ist neben dem Klassenzimmer, nicht zwischen den Büros." What mix-up is ${n} correcting?`,
    correct: "a mix-up between 'neben' (next to) and 'zwischen' (between)",
    distractors: ["a mix-up between 'auf' and 'unter'", "a mix-up between 'vor' and 'hinter'", "a mix-up between the library and the classroom"],
    explanation: `"neben" (next to) and "zwischen" (between) both describe closeness but mean different spatial relationships.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} looks for a book and says "Es liegt auf dem Tisch, nicht unter dem Tisch." What mistake is being ruled out?`,
    correct: "confusing 'auf' (on) with 'unter' (under)",
    distractors: ["confusing 'vor' with 'hinter'", "confusing the table with the chair", "confusing the book with the bag"],
    explanation: `"auf" (on top of) and "unter" (underneath) describe opposite vertical positions.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} explains "Der Sportplatz ist hinter der Schule, nicht vor der Schule." What is being corrected?`,
    correct: "confusing 'hinter' (behind) with 'vor' (in front of)",
    distractors: ["confusing 'auf' with 'in'", "confusing 'neben' with 'über'", "confusing the sports field with the garden"],
    explanation: `"hinter" (behind) and "vor" (in front of) are opposite positions relative to the school.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Mein Heft ist in der Tasche." What is ${n} describing?`,
    correct: "the notebook being inside the bag",
    distractors: ["the notebook being on top of the bag", "the notebook being next to the bag", "the bag being inside the notebook"],
    explanation: `"in der Tasche" means "in the bag" — the notebook is inside, not on top of or beside it.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Das Fenster ist über dem Schrank." What is being described?`,
    correct: "the window's position above the cupboard",
    distractors: ["the window's position below the cupboard", "the window's position next to the door", "the cupboard's position above the window"],
    explanation: `"über dem Schrank" means "above the cupboard" — the window is higher up, not lower or beside.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} tells a new student "Das Büro ist zwischen der Kantine und dem Sportplatz." What is being described?`,
    correct: "the office's position between two other places",
    distractors: ["the office's position behind the canteen", "the canteen's position inside the office", "the sports field's position under the office"],
    explanation: `"zwischen ... und ..." means "between ... and ..." — describing a position flanked by two landmarks.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Der Stuhl steht vor dem Tisch." What position is being described?`,
    correct: "the chair being in front of the table",
    distractors: ["the chair being behind the table", "the chair being on top of the table", "the chair being under the table"],
    explanation: `"vor dem Tisch" means "in front of the table" — not behind, on top of, or underneath it.`,
  }),
];

const LOCATION_FACTS: { subject: string; verb: string; position: string; reference: string }[] = [
  { subject: "Das Deutschbuch", verb: "liegt", position: "auf", reference: "dem Stuhl" },
  { subject: "Das Klo", verb: "ist", position: "hinter", reference: "dem Lehrerzimmer" },
  { subject: "Der Stift", verb: "liegt", position: "neben", reference: "dem Heft" },
  { subject: "Die Tasche", verb: "liegt", position: "unter", reference: "dem Tisch" },
  { subject: "Die Bibliothek", verb: "ist", position: "neben", reference: "dem Klassenzimmer" },
  { subject: "Der Schrank", verb: "ist", position: "vor", reference: "dem Fenster" },
  { subject: "Das Heft", verb: "liegt", position: "in", reference: "der Tasche" },
  { subject: "Die Tafel", verb: "ist", position: "vor", reference: "den Schülern" },
  { subject: "Der Sportplatz", verb: "ist", position: "hinter", reference: "der Schule" },
  { subject: "Das Fenster", verb: "ist", position: "über", reference: "dem Schrank" },
  { subject: "Die Tür", verb: "ist", position: "zwischen", reference: "zwei Fenstern" },
  { subject: "Der Tisch", verb: "steht", position: "vor", reference: "der Tafel" },
];

export const gettingAroundSpeaking: Skill = {
  id: "g6-de-ls-getting-around",
  code: "LS.9",
  subjectId: "german",
  strandId: "g6-de-listening-speaking",
  grade: 6,
  title: "Getting Around (In the School)",
  description: "Speak and recognise German position words and classroom vocabulary — matching, sorting, fill-in, an ordered locating dialogue, reasoning about position mix-ups, and a dedicated 'Wo liegt/ist ...?' drill for Das Deutschbuch liegt auf dem Stuhl / Das Klo ist hinter dem Lehrerzimmer.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario", "location"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, CLASSROOM_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.word })));
      const targets = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((v, i) => (correctMap[`${i}-${v.word}`] = `${i}-${v.word}`));
      return {
        kind: "click-match",
        prompt: `${randChoice(rng, MATCH_OPENERS)} ${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "These are all things you would find in or around a classroom.",
        explanation: chosen.map((v) => `"${v.word}" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORY_ITEMS).slice(0, 7);
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Furniture", label: "Furniture" },
          { id: "Stationery or supplies", label: "Stationery or supplies" },
          { id: "Fixture", label: "Fixture" },
        ],
        correctBucket,
        hint: "Furniture can be moved, stationery is carried in a bag, fixtures are built into the room.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, FILL_OPENERS)} ${randChoice(rng, FILL_CLOSERS)}`,
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: umlautAccepted(f.correct),
        inputMode: "text",
        hint: "This is either a classroom object with its article, or a position word.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const withIds = set.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, ORDER_OPENERS)} ${randChoice(rng, ORDER_CLOSERS)}`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "A question about where something is usually comes before the answer.",
        explanation: `A natural order is:\n${set.lines.join("\n")}`,
      };
    }

    if (branch === "scenario") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, SCENARIO_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, SCENARIO_PROMPT_POOL)} ${q.prompt}`,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Check which position word is used and what it is relative to.",
        explanation: q.explanation,
      };
    }

    const fact = randChoice(rng, LOCATION_FACTS);
    const correct = `${fact.subject} ${fact.verb} ${fact.position} ${fact.reference}.`;
    const wrongPositions = shuffle(rng, POSITION_VOCAB.filter((pos) => pos.word !== fact.position)).slice(0, 3);
    const distractors = wrongPositions.map((pos) => `${fact.subject} ${fact.verb} ${pos.word} ${fact.reference}.`);
    const choices = shuffle(rng, [correct, ...distractors]);
    return {
      kind: "multiple-choice",
      prompt: `${randChoice(rng, LOCATION_PROMPT_POOL)} Wo ${fact.verb === "liegt" ? "liegt" : "ist"} ${fact.subject.toLowerCase()}?`,
      choices,
      correctIndex: choices.indexOf(correct),
      layout: "list",
      hint: "Picture the actual scene described and pick the position word that truly matches it.",
      explanation: `"${correct}" is the correct sentence — the other options swap in a position word ("${wrongPositions.map((p) => p.word).join('", "')}") that does not match this real location.`,
    };
  },
};
