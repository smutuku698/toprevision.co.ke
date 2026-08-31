import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { SPORT_VOCAB } from "./shared";

// Sub-strand W.5 Guided Writing/Sentence Construction — Theme: Fun and Enjoyment (Sports and
// Games). Content: correct word spacing and German noun capitalization when writing likes/dislikes
// with gern/nicht gern (Ich spiele gern Fußball. / Ich schwimme nicht gern.), and sentence
// construction for sports and games vocabulary.

const SPACING_ITEMS: { correct: string; squished: string; brokenUp: string; meaning: string }[] = [
  { correct: "Ich spiele gern Fußball", squished: "Ichspielegern Fußball", brokenUp: "Ich spie le ge rn Fuß ball", meaning: "I like playing football" },
  { correct: "Ich schwimme nicht gern", squished: "Ichschwimmenicht gern", brokenUp: "Ich schwim me nich t gern", meaning: "I do not like swimming" },
  { correct: "Sie tanzt sehr gern", squished: "Sietanztsehr gern", brokenUp: "Si e tanz t seh r gern", meaning: "she likes dancing very much" },
  { correct: "Er spielt gern Schach", squished: "Erspieltgern Schach", brokenUp: "Er spiel t ge rn Scha ch", meaning: "he likes playing chess" },
  { correct: "Wir laufen jeden Tag", squished: "Wirlaufenjeden Tag", brokenUp: "Wi r lau fen je den Ta g", meaning: "we run every day" },
  { correct: "Ich höre gern Musik", squished: "Ichhöregern Musik", brokenUp: "Ich hö re ge rn Mu sik", meaning: "I like listening to music" },
  { correct: "Sie spielt nicht gern Volleyball", squished: "Sie spieltnicht gern Volleyball", brokenUp: "Si e spiel t nich t ge rn Vol ley ball", meaning: "she does not like playing volleyball" },
  { correct: "Was spielst du gern", squished: "Wasspielstdu gern", brokenUp: "Wa s spiel st du gern", meaning: "what do you like playing" },
  { correct: "Ich klettere sehr gern", squished: "Ichkletteresehr gern", brokenUp: "Ich klet te re seh r gern", meaning: "I like climbing very much" },
  { correct: "Wir spielen gern Karten", squished: "Wirspielengern Karten", brokenUp: "Wi r spie len ge rn Kar ten", meaning: "we like playing cards" },
];

const ORTHO_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "Which is the correctly capitalized way to write 'football' in a sentence?", correct: "Ich spiele gern Fußball.", distractors: ["Ich spiele gern fußball.", "ich spiele gern Fußball.", "Ich spiele gern Fussball."], explanation: "'Fußball' is a noun and keeps its capital letter mid-sentence, spelled with ß, not 'ss'." },
  { question: "Which is the correctly capitalized way to write 'chess' in a sentence?", correct: "Er spielt gern Schach.", distractors: ["Er spielt gern schach.", "er spielt gern Schach.", "Er Spielt gern schach."], explanation: "'Schach' is a noun and always keeps its capital letter; only nouns and sentence-starts are capitalized, not verbs like 'spielt'." },
  { question: "A learner writes 'ich höre gern musik.' What capitalization mistake did they make?", correct: "'ich' (sentence start) and 'musik' (a noun) should both be capitalized", distractors: ["'höre' should be capitalized", "'gern' should be capitalized", "nothing is wrong"], explanation: "The corrected sentence is 'Ich höre gern Musik.' — sentence-start and noun both need capitals." },
  { question: "Which rule explains why 'Fußball', 'Schach', and 'Musik' are always capitalized?", correct: "they are nouns, and German nouns are always capitalized", distractors: ["they are only capitalized when liked, not disliked", "they are proper names", "capitalization is optional for sport and game words"], explanation: "German capitalizes every noun regardless of what verb or feeling word surrounds it." },
  { question: "Which is the correct German spelling of 'football'?", correct: "Fußball", distractors: ["Fussball", "Fusball", "Füssball"], explanation: "'Fußball' uses ß; replacing it with 'ss' or dropping a letter is a common spelling mistake." },
  { question: "Which is the correct German spelling of 'to swim'?", correct: "schwimmen", distractors: ["schwimen", "schwiemmen", "schwiммen"], explanation: "'schwimmen' has a doubled 'm' — a common mistake is writing only one." },
  { question: "Which sentence uses correct capitalization?", correct: "Sie spielt gern Volleyball.", distractors: ["sie spielt gern volleyball.", "Sie spielt gern volleyball.", "Sie Spielt gern Volleyball."], explanation: "'Volleyball' is a noun and stays capitalized; 'spielt' is a verb and stays lowercase." },
  { question: "Which sentence uses correct capitalization?", correct: "Was spielst du gern?", distractors: ["was spielst du gern?", "Was Spielst du gern?", "Was spielst Du gern?"], explanation: "Only the sentence-initial word 'Was' is capitalized here; 'spielst' and 'du' are not nouns, so they stay lowercase." },
  { question: "A friend writes 'ich spiele gern karten.' at the end of a message. What is missing?", correct: "the noun 'karten' should be capitalized: 'Karten'", distractors: ["nothing is missing", "'spiele' should be capitalized", "'gern' should be capitalized"], explanation: "The corrected sentence is 'Ich spiele gern Karten.'" },
  { question: "Which word keeps its capital letter because it is a noun, not because it starts a sentence?", correct: "Musik (in 'Ich höre gern Musik.')", distractors: ["Ich (in 'Ich höre gern Musik.')", "gern (in 'Ich höre gern Musik.')", "höre (in 'Ich höre gern Musik.')"], explanation: "'Musik' is capitalized because it is a noun, even though it is not the first word of the sentence." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Ich spiele", "gern", "Fußball."], sentence: "Ich spiele gern Fußball. (I like playing football.)" },
  { chunks: ["Ich schwimme", "nicht", "gern."], sentence: "Ich schwimme nicht gern. (I do not like swimming.)" },
  { chunks: ["Er spielt", "gern", "Schach."], sentence: "Er spielt gern Schach. (He likes playing chess.)" },
  { chunks: ["Sie tanzt", "und", "singt gern."], sentence: "Sie tanzt und singt gern. (She likes dancing and singing.)" },
  { chunks: ["Wir spielen", "nicht", "gern Fußball."], sentence: "Wir spielen nicht gern Fußball. (We do not like playing football.)" },
  { chunks: ["Ich klettere", "und", "laufe gern."], sentence: "Ich klettere und laufe gern. (I like climbing and running.)" },
  { chunks: ["Was", "spielst du", "gern?"], sentence: "Was spielst du gern? (What do you like playing?)" },
  { chunks: ["Sie spielt", "gern", "Basketball."], sentence: "Sie spielt gern Basketball. (She likes playing basketball.)" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "To say you like doing something, you add the word ", after: " after the verb.", correct: "gern" },
  { before: "To say you do NOT like doing something, you write ", after: " gern.", correct: "nicht" },
  { before: "The German word for \"football\" is ", after: ".", correct: "Fußball" },
  { before: "The German word for \"chess\" is ", after: ".", correct: "Schach" },
  { before: "The German verb for \"to swim\" is ", after: ".", correct: "schwimmen" },
  { before: "The German verb for \"to dance\" is ", after: ".", correct: "tanzen" },
  { before: "The German verb for \"to sing\" is ", after: ".", correct: "singen" },
  { before: "The German verb for \"to climb\" is ", after: ".", correct: "klettern" },
  { before: "The German word for \"music\" is die ", after: ".", correct: "Musik" },
  { before: "The German word for \"cards\" (as in playing cards) is die ", after: ".", correct: "Karten" },
];

export const funWriting: Skill = {
  id: "g6-de-w-fun",
  code: "W.5",
  subjectId: "german",
  strandId: "g6-de-writing",
  grade: 6,
  title: "Guided writing: fun and enjoyment (sports and games)",
  description: "Practise sentence construction for likes and dislikes with gern/nicht gern, correct word spacing, and German noun capitalization when writing about sports and games such as Fußball, Schach, and schwimmen.",
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
        hint: "Sport and game nouns like Fußball/Schach/Musik always keep their capital letter, even after gern or nicht gern.",
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
        "Work out the correct word order for this German sentence about likes and dislikes.",
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
        hint: "Think about where gern/nicht gern goes and correct spelling for sport and game words.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SPORT_VOCAB).slice(0, 6);
      const bucketOf = (w: string) =>
        ["Fußball spielen", "Basketball spielen", "Volleyball spielen", "Schach spielen", "Karten spielen"].includes(w)
          ? "A game you play"
          : "An activity you do";
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      const prompts = [
        "Sort each word into the correct category before you write about it.",
        "Group these German activity words the way you would plan a paragraph.",
        "Sort each word into the correct writing category.",
        "Classify each activity word you might write about.",
        "Which category would you write each word under?",
        "Before writing, sort each activity word into its correct group.",
        "Organise these activity words into the right categories.",
        "Plan your writing: sort each word into the category it belongs to.",
        "Which group does each German activity word belong to?",
        "Sort these words the way you would before drafting a paragraph.",
        "Group each activity word correctly before using it in your writing.",
        "Match each activity word to the category it fits.",
      ];
      return {
        kind: "categorize",
        prompt: randChoice(rng, prompts),
        items: shuffle(rng, items),
        buckets: [
          { id: "A game you play", label: "A game you play" },
          { id: "An activity you do", label: "An activity you do" },
        ],
        correctBucket,
        hint: "Games use 'spielen' (to play); other activities use their own verb, like schwimmen or tanzen.",
        explanation: chosen.map((c) => `"${c.word}" is ${bucketOf(c.word).toLowerCase()}.`).join(" "),
      };
    }

    const pool = shuffle(rng, SPORT_VOCAB).slice(0, 5);
    const tokens = pool.map((c, i) => ({ id: `t${i}`, label: c.word }));
    const targets = shuffle(rng, pool.map((c, i) => ({ id: `g${i}`, label: c.meaning })));
    const correctMap: Record<string, string> = {};
    pool.forEach((_, i) => (correctMap[`g${i}`] = `t${i}`));
    const prompts = [
      "Match each German activity word to its English meaning.",
      "Click to match each activity with the correct meaning.",
      "Pair each German activity word with what it means in English.",
      "Match the German words to their correct English meanings.",
      "Which English meaning matches each German word? Match them.",
      "Connect each German word to its English translation.",
      "Match each word you would write in German to its meaning.",
      "Pair up the German words with their English meanings.",
      "Match each activity word to its correct meaning before you write it.",
      "Click the matching pairs of German words and English meanings.",
      "Match these German activity words to what they mean.",
      "Link each German activity word to its English meaning.",
    ];
    return {
      kind: "click-match",
      prompt: randChoice(rng, prompts),
      tokens,
      targets,
      correctMap,
      hint: "Recall the German activity word for each meaning before matching.",
      explanation: pool.map((c) => `"${c.word}" means "${c.meaning}".`).join(" "),
    };
  },
};
