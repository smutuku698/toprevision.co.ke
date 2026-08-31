import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { GREETING_VOCAB, umlautAccepted } from "./shared";

// Sub-strand W.1 Functional Writing — Theme: Greetings and Introduction.
// Content: correct word spacing when writing greeting/introduction phrases, German noun
// capitalization and umlaut/ß spelling, sentence construction, and vocabulary recall for
// "Wie heißt du? / Ich heiße... / Wie alt bist du? / Ich bin ... Jahre alt" style writing.

const SPACING_ITEMS: { correct: string; squished: string; brokenUp: string; meaning: string }[] = [
  { correct: "Guten Morgen", squished: "GutenMorgen", brokenUp: "Gu ten Mor gen", meaning: "good morning" },
  { correct: "Guten Tag", squished: "GutenTag", brokenUp: "Gu ten Ta g", meaning: "good day" },
  { correct: "Guten Abend", squished: "GutenAbend", brokenUp: "Gu ten A bend", meaning: "good evening" },
  { correct: "Wie heißt du", squished: "Wieheißtdu", brokenUp: "Wi e heißt d u", meaning: "what is your name" },
  { correct: "Wie alt bist du", squished: "Wiealtbistdu", brokenUp: "Wi e alt bi st du", meaning: "how old are you" },
  { correct: "Wie geht es dir", squished: "Wiegehtesdir", brokenUp: "Wi e geh t es dir", meaning: "how are you" },
  { correct: "Mir geht es gut", squished: "Mirgehtesgut", brokenUp: "Mi r geh t es gut", meaning: "I am doing well" },
  { correct: "Ich heiße Amina", squished: "IchheißeAmina", brokenUp: "Ich hei ße A mina", meaning: "my name is Amina" },
  { correct: "Freut mich sehr", squished: "Freutmichsehr", brokenUp: "Freu t mi ch sehr", meaning: "very nice to meet you" },
  { correct: "Bis bald dann", squished: "Bisbalddann", brokenUp: "Bi s bal d dann", meaning: "see you soon then" },
];

const ORTHO_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "In German, when do you write a noun with a capital first letter?", correct: "always, no matter where it is in the sentence", distractors: ["only at the start of a sentence", "only for people's names", "never — German nouns stay lowercase"], explanation: "Unlike English, every German noun is always capitalized, wherever it falls in the sentence." },
  { question: "Which rule is true for German nouns?", correct: "every noun starts with a capital letter, even mid-sentence", distractors: ["only the first word of a sentence is capitalized", "only proper names are capitalized", "nouns are capitalized only at the end of a sentence"], explanation: "German capitalizes all nouns, not just sentence-starters or names." },
  { question: "A learner writes 'ich heiße amina.' What capitalization mistake did they make?", correct: "'Ich' (sentence start) and 'Amina' (a name) should both be capitalized", distractors: ["nothing is wrong with this sentence", "'heiße' should be capitalized", "only 'amina' needs fixing, 'ich' is fine lowercase"], explanation: "Sentence-initial words and names are always capitalized: 'Ich heiße Amina.'" },
  { question: "Which is the correctly capitalized greeting?", correct: "Guten Morgen", distractors: ["guten Morgen", "Guten morgen", "guten morgen"], explanation: "'Morgen' is a noun, so it keeps its capital letter, and the sentence-initial 'Guten' is also capitalized." },
  { question: "Which is the correctly capitalized greeting?", correct: "Guten Abend", distractors: ["guten Abend", "Guten abend", "guten abend"], explanation: "'Abend' is a noun and must be capitalized, along with the sentence-initial word." },
  { question: "Which is the correct German spelling for 'what is your name?'", correct: "Wie heißt du?", distractors: ["Wie heist du?", "Wie heisst du?", "Wie heißt Du?"], explanation: "'heißt' uses ß, not 'ss' or 'st' — and 'du' is not capitalized mid-sentence unless it is a noun." },
  { question: "Which spelling correctly uses the ß (Eszett) letter?", correct: "heißen", distractors: ["heisen", "heissen", "heißsen"], explanation: "The infinitive 'heißen' (to be called) is spelled with ß, not a doubled 's'." },
  { question: "A friend writes 'wie geht es dir?' at the start of a message. What is wrong?", correct: "the first word of the sentence, 'Wie', needs a capital letter", distractors: ["nothing is wrong", "'geht' should be capitalized", "'dir' should be capitalized"], explanation: "Every German sentence, like an English one, starts with a capital letter: 'Wie geht es dir?'" },
  { question: "Which word keeps its capital letter only because it is a name, not because of a general noun rule?", correct: "Amina", distractors: ["Morgen", "Tag", "Abend"], explanation: "Amina is a proper name; Morgen/Tag/Abend are capitalized because they are ordinary nouns — German capitalizes both kinds." },
  { question: "Which pair shows the SAME word spelled both correctly and incorrectly?", correct: "'heißt' (correct) vs 'heist' (incorrect)", distractors: ["'Morgen' (correct) vs 'Morgen' (incorrect)", "'Tag' (correct) vs 'Tag' (incorrect)", "'Amina' (correct) vs 'Amina' (incorrect)"], explanation: "'heißt' needs the ß; dropping it to 'heist' is a common spelling mistake." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Guten Morgen,", "wie", "geht", "es dir?"], sentence: "Guten Morgen, wie geht es dir? (Good morning, how are you?)" },
  { chunks: ["Ich heiße Amina,", "und", "wie", "heißt du?"], sentence: "Ich heiße Amina, und wie heißt du? (My name is Amina, and what is your name?)" },
  { chunks: ["Mir geht es gut,", "danke,", "und dir?"], sentence: "Mir geht es gut, danke, und dir? (I am doing well, thanks, and you?)" },
  { chunks: ["Ich bin", "zwölf", "Jahre alt."], sentence: "Ich bin zwölf Jahre alt. (I am twelve years old.)" },
  { chunks: ["Das ist mein Freund,", "er", "heißt Brian."], sentence: "Das ist mein Freund, er heißt Brian. (This is my friend, his name is Brian.)" },
  { chunks: ["Freut mich sehr,", "auf", "Wiedersehen!"], sentence: "Freut mich sehr, auf Wiedersehen! (Nice to meet you, goodbye!)" },
  { chunks: ["Wie alt", "bist du,", "Amina?"], sentence: "Wie alt bist du, Amina? (How old are you, Amina?)" },
  { chunks: ["Guten Tag,", "bitte,", "wie heißt du?"], sentence: "Guten Tag, bitte, wie heißt du? (Good day, please, what is your name?)" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string; accepted?: string[] }[] = [
  { before: "The German for \"good morning\" is ", after: ".", correct: "Guten Morgen" },
  { before: "The German for \"good evening\" is ", after: ".", correct: "Guten Abend" },
  { before: "The German for \"thank you\" is ", after: ".", correct: "Danke" },
  { before: "To ask someone's name in German, you write: Wie ", after: " du?", correct: "heißt", accepted: umlautAccepted("heißt") },
  { before: "To say your own name in German, you write: Ich ", after: " Amina.", correct: "heiße", accepted: umlautAccepted("heiße") },
  { before: "To say you are twelve years old, you write: Ich bin zwölf Jahre ", after: ".", correct: "alt" },
  { before: "To ask how old someone is, you write: Wie alt ", after: " du?", correct: "bist" },
  { before: "To say \"nice to meet you\", you write: Freut ", after: " sehr.", correct: "mich" },
  { before: "The polite word for \"please\" in German is ", after: ".", correct: "Bitte" },
  { before: "To say \"see you soon\", you write: Bis ", after: ".", correct: "bald" },
];

export const greetingsWriting: Skill = {
  id: "g6-de-w-greetings",
  code: "W.1",
  subjectId: "german",
  strandId: "g6-de-writing",
  grade: 6,
  title: "Functional writing: greetings and introduction",
  description: "Practise correct word spacing, German noun capitalization and umlaut/ß spelling, and sentence construction for writing greetings and introductions such as Wie heißt du? and Ich bin ... Jahre alt.",
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
        "A classmate re-wrote a German phrase three ways — which has correct spacing for",
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
        hint: "German nouns always keep their capital letter, and ß/umlauts (ä, ö, ü) must be spelled exactly, not dropped or replaced.",
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
        "Work out the correct word order for this German sentence.",
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
        acceptedAnswers: f.accepted,
        inputMode: "text",
        hint: "Think about correct spelling, capitalization, and any umlaut or ß you have practised writing.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, GREETING_VOCAB).slice(0, 6);
      const bucketOf = (w: string) =>
        ["Guten Morgen", "Guten Tag", "Guten Abend", "Hallo", "Tschüss", "Auf Wiedersehen", "Bis bald"].includes(w)
          ? "Greeting"
          : ["Wie heißt du?", "Ich heiße...", "Wie alt bist du?", "Ich bin ... Jahre alt", "Freut mich"].includes(w)
          ? "Introduction"
          : "Politeness";
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      const prompts = [
        "Sort each word into the correct category before you write it in a sentence.",
        "Group these German words the way you would plan a written paragraph.",
        "Sort each word or phrase into the correct writing category.",
        "Classify each word you might use when writing about this topic.",
        "Which category would you write each word under?",
        "Before writing, sort each word into its correct group.",
        "Organise these words into the right categories for your writing.",
        "Plan your writing: sort each word into the category it belongs to.",
        "Which group does each German word belong to?",
        "Sort these words the way you would before drafting a paragraph.",
        "Group each word correctly before using it in your writing.",
        "Match each word to the category it fits in your writing plan.",
      ];
      return {
        kind: "categorize",
        prompt: randChoice(rng, prompts),
        items: shuffle(rng, items),
        buckets: [
          { id: "Greeting", label: "Greeting" },
          { id: "Introduction", label: "Introduction" },
          { id: "Politeness", label: "Politeness" },
        ],
        correctBucket,
        hint: "Plan your paragraph: open with a greeting, add an introduction, and use polite words throughout.",
        explanation: chosen.map((c) => `"${c.word}" is ${bucketOf(c.word) === "Introduction" ? "an" : "a"} ${bucketOf(c.word).toLowerCase()} word.`).join(" "),
      };
    }

    const pool = shuffle(rng, GREETING_VOCAB).slice(0, 5);
    const tokens = pool.map((c, i) => ({ id: `t${i}`, label: c.word }));
    const targets = shuffle(rng, pool.map((c, i) => ({ id: `g${i}`, label: c.meaning })));
    const correctMap: Record<string, string> = {};
    pool.forEach((_, i) => (correctMap[`g${i}`] = `t${i}`));
    const prompts = [
      "Match each German word to its English meaning.",
      "Click to match each word with the correct meaning.",
      "Pair each German phrase with what it means in English.",
      "Match the German words to their correct English meanings.",
      "Which English meaning matches each German word? Match them.",
      "Connect each German word to its English translation.",
      "Match each word you would write in German to its meaning.",
      "Pair up the German words with their English meanings.",
      "Match each phrase to its correct meaning before you write it.",
      "Click the matching pairs of German words and English meanings.",
      "Match these German writing words to what they mean.",
      "Link each German word to its English meaning.",
    ];
    return {
      kind: "click-match",
      prompt: randChoice(rng, prompts),
      tokens,
      targets,
      correctMap,
      hint: "Recall the greeting/introduction phrase for each meaning before matching.",
      explanation: pool.map((c) => `"${c.word}" means "${c.meaning}".`).join(" "),
    };
  },
};
