import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { SCHOOL_VOCAB, SCHOOL_FACILITY_FUNCTIONS } from "./shared";

// Sub-strand W.3 Guided Writing/Vocabulary — Theme: My Surroundings (My School).
// Content: correct word spacing and German noun capitalization when listing school facility
// names, matching activities to the facility where they happen, and vocabulary recall for
// writing about die Schule, die Bibliothek, der Sportplatz, die Kantine, and similar facilities.

const SPACING_ITEMS: { correct: string; squished: string; brokenUp: string; meaning: string }[] = [
  { correct: "Das ist die Schule", squished: "Dasistdie Schule", brokenUp: "Da s ist di e Schu le", meaning: "this is the school" },
  { correct: "Ich lese in der Bibliothek", squished: "Ichlesein der Bibliothek", brokenUp: "Ich le se in de r Bib li o thek", meaning: "I read in the library" },
  { correct: "Wir essen in der Kantine", squished: "Wiressenin der Kantine", brokenUp: "Wi r es se n in de r Kan ti ne", meaning: "we eat in the canteen" },
  { correct: "Das Klassenzimmer ist groß", squished: "DasKlassenzimmer ist groß", brokenUp: "Da s Klas sen zim mer is t groß", meaning: "the classroom is big" },
  { correct: "Der Sportplatz ist neben der Schule", squished: "DerSportplatz ist neben der Schule", brokenUp: "De r Sport platz is t ne ben de r Schu le", meaning: "the sports field is next to the school" },
  { correct: "Wo ist das Lehrerzimmer", squished: "Woistdas Lehrerzimmer", brokenUp: "Wo is t da s Leh rer zim mer", meaning: "where is the staffroom" },
  { correct: "Das Labor ist modern", squished: "DasLabor ist modern", brokenUp: "Da s La bo r is t mo dern", meaning: "the laboratory is modern" },
  { correct: "Der Spielplatz ist voll", squished: "DerSpielplatz ist voll", brokenUp: "De r Spiel platz is t voll", meaning: "the playground is full" },
  { correct: "Die Halle ist ruhig", squished: "DieHalle ist ruhig", brokenUp: "Di e Hal le is t ru hig", meaning: "the hall is quiet" },
  { correct: "Der Computerraum ist klein", squished: "DerComputerraum ist klein", brokenUp: "De r Com pu ter raum is t klein", meaning: "the computer room is small" },
];

const ORTHO_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "Which is the correctly capitalized way to write 'library' in a sentence?", correct: "die Bibliothek", distractors: ["die bibliothek", "Die bibliothek", "die Biblothek"], explanation: "'Bibliothek' is a noun, so its first letter is always capitalized, and 'die' stays lowercase mid-sentence." },
  { question: "Which is the correctly capitalized way to write 'staffroom' in a sentence?", correct: "das Lehrerzimmer", distractors: ["das lehrerzimmer", "Das lehrerzimmer", "das LehrerZimmer"], explanation: "'Lehrerzimmer' is one capitalized noun, not two separately capitalized words." },
  { question: "A learner writes 'ich lese in der bibliothek.' What capitalization mistake did they make?", correct: "'bibliothek' (a noun) should be capitalized: 'Bibliothek'", distractors: ["'ich' should stay lowercase", "'lese' should be capitalized", "'der' should be capitalized"], explanation: "'Bibliothek' is a noun, so German capitalizes it: 'Ich lese in der Bibliothek.'" },
  { question: "Which rule explains why 'Schule' is capitalized in the middle of 'Das ist die Schule'?", correct: "German nouns are always capitalized, wherever they appear in the sentence", distractors: ["only sentence-starting words are capitalized in German", "'Schule' is a proper name", "it is a spelling mistake — it should be lowercase"], explanation: "Unlike English, every German noun keeps its capital letter regardless of position." },
  { question: "Which is the correct German spelling of 'sports field'?", correct: "Sportplatz", distractors: ["Sportplaz", "sportplatz", "Sportplats"], explanation: "'Sportplatz' is a single capitalized compound noun spelled with 'tz'." },
  { question: "Which is the correct German spelling of 'toilet'?", correct: "Klo", distractors: ["Kloh", "Cloh", "Klho"], explanation: "'Klo' is short and simple — a common mistake is adding an unnecessary letter." },
  { question: "Which sentence uses correct capitalization?", correct: "Der Computerraum ist neben dem Büro.", distractors: ["der Computerraum ist neben dem büro.", "Der computerraum ist neben dem Büro.", "Der Computerraum ist neben dem büro."], explanation: "'Computerraum' and 'Büro' are both nouns and stay capitalized throughout the sentence." },
  { question: "Which sentence uses correct capitalization?", correct: "Die Kantine ist neben dem Klassenzimmer.", distractors: ["die Kantine ist neben dem klassenzimmer.", "Die kantine ist neben dem Klassenzimmer.", "Die Kantine ist neben dem klassenzimmer."], explanation: "'Kantine' and 'Klassenzimmer' are nouns, so both keep their capital letters." },
  { question: "A friend writes 'wo ist das büro?' at the start of a message. What is missing?", correct: "the sentence-initial 'Wo' needs a capital letter, and 'Büro' (a noun) also needs one", distractors: ["nothing is missing", "'ist' should be capitalized", "'das' should be capitalized"], explanation: "The corrected sentence is 'Wo ist das Büro?' — one capital for the sentence start, one for the noun." },
  { question: "Which word correctly uses the ü umlaut?", correct: "Büro", distractors: ["Buro", "Buero", "Büroh"], explanation: "'Büro' (office) is spelled with ü, not a plain 'u' or a dropped umlaut." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Das ist", "meine Schule,", "sie ist groß."], sentence: "Das ist meine Schule, sie ist groß. (This is my school, it is big.)" },
  { chunks: ["Ich lese", "gern", "in der Bibliothek."], sentence: "Ich lese gern in der Bibliothek. (I like reading in the library.)" },
  { chunks: ["Wir essen", "jeden Tag", "in der Kantine."], sentence: "Wir essen jeden Tag in der Kantine. (We eat in the canteen every day.)" },
  { chunks: ["Der Sportplatz", "ist", "neben der Schule."], sentence: "Der Sportplatz ist neben der Schule. (The sports field is next to the school.)" },
  { chunks: ["Wo", "ist", "das Lehrerzimmer?"], sentence: "Wo ist das Lehrerzimmer? (Where is the staffroom?)" },
  { chunks: ["Das Labor", "ist", "sehr modern."], sentence: "Das Labor ist sehr modern. (The laboratory is very modern.)" },
  { chunks: ["Die Kinder", "spielen", "auf dem Spielplatz."], sentence: "Die Kinder spielen auf dem Spielplatz. (The children play on the playground.)" },
  { chunks: ["Der Computerraum", "ist", "neben dem Büro."], sentence: "Der Computerraum ist neben dem Büro. (The computer room is next to the office.)" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "The German word for \"school\" is die ", after: ".", correct: "Schule" },
  { before: "The German word for \"library\" is die ", after: ".", correct: "Bibliothek" },
  { before: "The German word for \"classroom\" is das ", after: ".", correct: "Klassenzimmer" },
  { before: "The German word for \"sports field\" is der ", after: ".", correct: "Sportplatz" },
  { before: "The German word for \"canteen\" is die ", after: ".", correct: "Kantine" },
  { before: "The German word for \"office\" is das ", after: ".", correct: "Büro" },
  { before: "The German word for \"playground\" is der ", after: ".", correct: "Spielplatz" },
  { before: "The German word for \"laboratory\" is das ", after: ".", correct: "Labor" },
  { before: "The German word for \"corridor\" is der ", after: ".", correct: "Flur" },
  { before: "The German word for \"gate\" is das ", after: ".", correct: "Tor" },
];

export const surroundingsWriting: Skill = {
  id: "g6-de-w-surroundings",
  code: "W.3",
  subjectId: "german",
  strandId: "g6-de-writing",
  grade: 6,
  title: "Guided writing: my surroundings (my school)",
  description: "Practise listing school facility names, matching activities to the correct facility, and correct word spacing and noun capitalization when writing about die Schule, die Bibliothek, der Sportplatz, and other places in the school.",
  generate(rng) {
    const branch = randChoice(rng, ["spacing", "ortho", "ordering", "fill", "categorize", "clickmatch"] as const);

    if (branch === "spacing") {
      const item = randChoice(rng, SPACING_ITEMS);
      const wrongKind = randChoice(rng, ["squished", "brokenUp"] as const);
      const wrong = wrongKind === "squished" ? item.squished : item.brokenUp;
      const otherWrong = wrongKind === "squished" ? item.brokenUp : item.squished;
      const choices = shuffle(rng, [item.correct, wrong, otherWrong]);
      const openers = [
        "Which version shows correct word spacing for",
        "Pick the correctly spaced re-write of",
        "Which of these is written neatly, with correct spacing, for",
        "Choose the properly spaced version meaning",
        "A classmate re-wrote a German sentence three ways — which has correct spacing for",
      ];
      const closers = ["?", ", written the German way?", " in correct German?", " — choose the neat version."];
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, openers)} "${item.meaning}"${randChoice(rng, closers)}`,
        choices,
        correctIndex: choices.indexOf(item.correct),
        layout: "list",
        hint: "Correct spacing keeps each whole word together with one space between words — not squished together or broken into fragments.",
        explanation: `The correctly spaced version is "${item.correct}" — squishing words together or breaking them into fragments makes text hard to read.`,
      };
    }

    if (branch === "ortho") {
      const q = randChoice(rng, ORTHO_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.question,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "School facility nouns always keep their capital letter, and words like Büro/Sportplatz are spelled precisely, umlaut included.",
        explanation: q.explanation,
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const prompts = [
        "Arrange the word groups to re-write this sentence with correct spacing and order.",
        "Put these word groups in the correct order to form a neat German sentence.",
        "Order the pieces to write a correctly spaced German sentence.",
        "Click the word groups in the order they belong.",
        "Rebuild the German sentence in the correct order.",
        "Sort the word groups into the order a German sentence would use them.",
        "Drag the pieces into the right order to complete the sentence correctly.",
        "These word groups are jumbled — put them back in the correct German order.",
        "Reconstruct the sentence by ordering the word groups correctly.",
        "Place the word groups in the order needed for a correctly written sentence.",
        "Put the pieces in order to write this German sentence neatly.",
        "Work out the correct word order for this German school sentence.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder: set.chunks.map((c, i) => `${i}-${c}`),
        hint: "Read the meaning aloud in your head to work out the natural word order.",
        explanation: `The correctly written sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      const prompts = [
        "Fill in the missing word.",
        "Complete the sentence correctly.",
        "What word completes this writing fact?",
        "Fill the gap with the correct word.",
        "Complete this writing fact.",
        "What is the missing word here?",
        "Fill in the blank to complete the fact.",
        "Complete the missing word in this sentence.",
        "What word belongs in the blank?",
        "Fill in the correct word to complete the fact.",
        "Complete this German writing fact with the correct word.",
        "What word correctly fills this gap?",
      ];
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, prompts),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about correct spelling and capitalization for school facility words.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SCHOOL_FACILITY_FUNCTIONS).slice(0, 5);
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const bucketLabels = SCHOOL_FACILITY_FUNCTIONS.map((f) => f.function);
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.function));
      const prompts = [
        "Match each facility to the activity that happens there, ready for writing.",
        "Sort each facility by what it is used for.",
        "Before writing, sort each place into the activity it is used for.",
        "Classify each school facility by its function.",
        "Which activity happens at each place? Sort them.",
        "Sort each facility into its correct activity group.",
        "Organise these facilities by what happens in each one.",
        "Plan your writing: sort each facility by its use.",
        "Which activity group does each facility belong to?",
        "Sort these places by the activity they are used for.",
        "Group each facility correctly by its purpose.",
        "Match each facility to the activity you would write about.",
      ];
      return {
        kind: "categorize",
        prompt: randChoice(rng, prompts),
        items: shuffle(rng, items),
        buckets: Array.from(new Set(bucketLabels)).map((b) => ({ id: b, label: b })),
        correctBucket,
        hint: "Think about what students actually do in each place before sorting it.",
        explanation: chosen.map((c) => `"${c.word}" is used for ${c.function}.`).join(" "),
      };
    }

    const pool = shuffle(rng, SCHOOL_VOCAB).slice(0, 5);
    const tokens = pool.map((c, i) => ({ id: `t${i}`, label: c.word }));
    const targets = shuffle(rng, pool.map((c, i) => ({ id: `g${i}`, label: c.meaning })));
    const correctMap: Record<string, string> = {};
    pool.forEach((_, i) => (correctMap[`g${i}`] = `t${i}`));
    const prompts = [
      "Match each German school word to its English meaning.",
      "Click to match each word with the correct meaning.",
      "Pair each German facility word with what it means in English.",
      "Match the German words to their correct English meanings.",
      "Which English meaning matches each German word? Match them.",
      "Connect each German word to its English translation.",
      "Match each word you would write in German to its meaning.",
      "Pair up the German words with their English meanings.",
      "Match each facility word to its correct meaning before you write it.",
      "Click the matching pairs of German words and English meanings.",
      "Match these German school words to what they mean.",
      "Link each German school word to its English meaning.",
    ];
    return {
      kind: "click-match",
      prompt: randChoice(rng, prompts),
      tokens,
      targets,
      correctMap,
      hint: "Recall the German school word for each meaning before matching.",
      explanation: pool.map((c) => `"${c.word}" means "${c.meaning}".`).join(" "),
    };
  },
};
