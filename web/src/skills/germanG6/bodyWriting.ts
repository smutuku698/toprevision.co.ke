import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { GROOMING_VOCAB } from "./shared";

// Sub-strand W.7 Creative Writing — Theme: My Body (grooming/personal-hygiene routine, not
// anatomy). Content: correct word spacing and German noun capitalization when writing a daily
// routine (Ich putze mir die Zähne. Ich kämme mir die Haare. Ich wasche mir die Hände.), and
// sentence construction for "Was machst du um 7 Uhr?" style creative writing about routines.

const SPACING_ITEMS: { correct: string; squished: string; brokenUp: string; meaning: string }[] = [
  { correct: "Ich putze mir die Zähne", squished: "Ichputzemir die Zähne", brokenUp: "Ich put ze mi r di e Zäh ne", meaning: "I brush my teeth" },
  { correct: "Ich kämme mir die Haare", squished: "Ichkämmemir die Haare", brokenUp: "Ich käm me mi r di e Haa re", meaning: "I comb my hair" },
  { correct: "Ich wasche mir die Hände", squished: "Ichwaschemir die Hände", brokenUp: "Ich wa sche mi r di e Hän de", meaning: "I wash my hands" },
  { correct: "Was machst du um sieben Uhr", squished: "Wasmachstduum sieben Uhr", brokenUp: "Wa s mach st du um sie ben Uhr", meaning: "what do you do at seven o'clock" },
  { correct: "Ich stehe früh auf", squished: "Ichstehefrüh auf", brokenUp: "Ich ste he frü h auf", meaning: "I get up early" },
  { correct: "Ich dusche jeden Morgen", squished: "Ichduschejeden Morgen", brokenUp: "Ich du sche je den Mor gen", meaning: "I shower every morning" },
  { correct: "Ich ziehe mich schnell an", squished: "Ichziehemichschnell an", brokenUp: "Ich zie he mi ch schnell an", meaning: "I get dressed quickly" },
  { correct: "Ich schneide mir die Nägel", squished: "Ichschneidemir die Nägel", brokenUp: "Ich schnei de mi r di e Nä gel", meaning: "I cut my nails" },
  { correct: "Ich wasche mir das Gesicht", squished: "Ichwaschemir das Gesicht", brokenUp: "Ich wa sche mi r da s Ge sicht", meaning: "I wash my face" },
  { correct: "Ich gehe früh schlafen", squished: "Ichgehefrüh schlafen", brokenUp: "Ich ge he frü h schla fen", meaning: "I go to sleep early" },
];

const ORTHO_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "Which is the correctly capitalized way to write 'teeth' in a sentence?", correct: "Ich putze mir die Zähne.", distractors: ["Ich putze mir die zähne.", "ich putze mir die Zähne.", "Ich Putze mir die Zähne."], explanation: "'Zähne' is a noun and keeps its capital letter, spelled with ä; 'putze' is a verb and stays lowercase." },
  { question: "Which is the correctly capitalized way to write 'hair' in a sentence?", correct: "Ich kämme mir die Haare.", distractors: ["Ich kämme mir die haare.", "ich kämme mir die Haare.", "Ich Kämme mir die Haare."], explanation: "'Haare' is a noun and always keeps its capital letter, even mid-sentence." },
  { question: "A learner writes 'ich wasche mir die hände.' What capitalization mistake did they make?", correct: "'ich' (sentence start) and 'hände' (a noun) should both be capitalized", distractors: ["'wasche' should be capitalized", "'mir' should be capitalized", "nothing is wrong"], explanation: "The corrected sentence is 'Ich wasche mir die Hände.'" },
  { question: "Which rule explains why 'Zähne', 'Haare', and 'Hände' are always capitalized?", correct: "they are nouns, and German nouns are always capitalized", distractors: ["they are only capitalized when writing about routines", "they are proper names", "capitalization of body-part nouns is optional"], explanation: "German capitalizes every noun, including body-part words used in routine sentences." },
  { question: "Which is the correct German spelling of 'hands'?", correct: "Hände", distractors: ["Hande", "Haende used casually", "Händer"], explanation: "'Hände' is spelled with ä; dropping the umlaut dots to write 'Hande' is a common mistake." },
  { question: "Which is the correct German spelling of 'teeth'?", correct: "Zähne", distractors: ["Zahne", "Zaehne", "Zähnne"], explanation: "'Zähne' is spelled with ä and a single 'n' — a common mistake is dropping the umlaut or doubling the 'n'." },
  { question: "Which sentence uses correct capitalization?", correct: "Ich dusche jeden Morgen.", distractors: ["ich dusche jeden Morgen.", "Ich dusche jeden morgen.", "Ich Dusche jeden Morgen."], explanation: "'Morgen' is a noun and stays capitalized; 'dusche' is a verb and stays lowercase." },
  { question: "Which sentence uses correct capitalization?", correct: "Ich schneide mir die Nägel.", distractors: ["ich schneide mir die Nägel.", "Ich schneide mir die nägel.", "Ich Schneide mir die Nägel."], explanation: "'Nägel' is a noun and keeps its capital letter with the ä umlaut, throughout the sentence." },
  { question: "A friend writes 'was machst du um sieben uhr?' but forgets a capital. What is missing?", correct: "the sentence-initial 'Was' and the noun 'Uhr' both need capitals", distractors: ["nothing is missing", "'machst' should be capitalized", "'du' should be capitalized"], explanation: "The corrected sentence is 'Was machst du um sieben Uhr?'" },
  { question: "Which word correctly uses the ä umlaut in a routine sentence?", correct: "Zähne", distractors: ["Zahne", "Zärhne", "Zähene"], explanation: "'Zähne' (teeth) is spelled with ä; writing 'Zahne' without the dots is a common spelling mistake." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Ich stehe", "um sechs Uhr", "auf."], sentence: "Ich stehe um sechs Uhr auf. (I get up at six o'clock.)" },
  { chunks: ["Ich putze", "mir", "die Zähne."], sentence: "Ich putze mir die Zähne. (I brush my teeth.)" },
  { chunks: ["Ich kämme", "mir", "die Haare."], sentence: "Ich kämme mir die Haare. (I comb my hair.)" },
  { chunks: ["Ich wasche", "mir", "die Hände."], sentence: "Ich wasche mir die Hände. (I wash my hands.)" },
  { chunks: ["Was", "machst du", "um sieben Uhr?"], sentence: "Was machst du um sieben Uhr? (What do you do at seven o'clock?)" },
  { chunks: ["Ich dusche", "und", "ziehe mich an."], sentence: "Ich dusche und ziehe mich an. (I shower and get dressed.)" },
  { chunks: ["Danach", "frühstücke ich", "schnell."], sentence: "Danach frühstücke ich schnell. (After that I eat breakfast quickly.)" },
  { chunks: ["Um neun Uhr", "gehe ich", "schlafen."], sentence: "Um neun Uhr gehe ich schlafen. (At nine o'clock I go to sleep.)" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "The German verb for \"to brush one's teeth\" is die Zähne ", after: ".", correct: "putzen" },
  { before: "The German verb for \"to comb one's hair\" is die Haare ", after: ".", correct: "kämmen" },
  { before: "The German verb for \"to wash one's hands\" is die Hände ", after: ".", correct: "waschen" },
  { before: "The German verb for \"to shower\" is ", after: ".", correct: "duschen" },
  { before: "The German phrase for \"to get dressed\" is sich ", after: ".", correct: "anziehen" },
  { before: "The German verb for \"to get up\" is ", after: ".", correct: "aufstehen" },
  { before: "The German verb for \"to eat breakfast\" is ", after: ".", correct: "frühstücken" },
  { before: "The German word for \"teeth\" is die ", after: ".", correct: "Zähne" },
  { before: "The German word for \"hair\" is die ", after: ".", correct: "Haare" },
  { before: "The German word for \"hands\" is die ", after: ".", correct: "Hände" },
];

export const bodyWriting: Skill = {
  id: "g6-de-w-body",
  code: "W.7",
  subjectId: "german",
  strandId: "g6-de-writing",
  grade: 6,
  title: "Creative writing: my body (daily grooming routine)",
  description: "Practise writing a daily personal-hygiene routine (Ich putze mir die Zähne. Ich kämme mir die Haare. Was machst du um 7 Uhr?), with correct word spacing and German noun capitalization.",
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
        hint: "Routine nouns like Zähne/Haare/Hände always keep their capital letter and their exact ä spelling.",
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
        "Work out the correct word order for this German routine sentence.",
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
        hint: "Think about correct spelling for routine verbs and body-part nouns, including any umlaut.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, GROOMING_VOCAB).slice(0, 6);
      const bucketOf = (w: string) =>
        ["aufstehen", "frühstücken", "schlafen gehen"].includes(w) ? "Time of day routine" : "Hygiene action";
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      const prompts = [
        "Sort each word into the correct category before you write your routine.",
        "Group these German routine words the way you would plan a paragraph.",
        "Sort each word into the correct writing category.",
        "Classify each routine word you might write about.",
        "Which category would you write each word under?",
        "Before writing, sort each routine word into its correct group.",
        "Organise these routine words into the right categories.",
        "Plan your writing: sort each word into the category it belongs to.",
        "Which group does each German routine word belong to?",
        "Sort these words the way you would before drafting a paragraph.",
        "Group each routine word correctly before using it in your writing.",
        "Match each routine word to the category it fits.",
      ];
      return {
        kind: "categorize",
        prompt: randChoice(rng, prompts),
        items: shuffle(rng, items),
        buckets: [
          { id: "Time of day routine", label: "Time of day routine" },
          { id: "Hygiene action", label: "Hygiene action" },
        ],
        correctBucket,
        hint: "Time-of-day routines mark when something happens; hygiene actions describe washing/grooming itself.",
        explanation: chosen.map((c) => `"${c.word}" is a ${bucketOf(c.word).toLowerCase()}.`).join(" "),
      };
    }

    const pool = shuffle(rng, GROOMING_VOCAB).slice(0, 5);
    const tokens = pool.map((c, i) => ({ id: `t${i}`, label: c.word }));
    const targets = shuffle(rng, pool.map((c, i) => ({ id: `g${i}`, label: c.meaning })));
    const correctMap: Record<string, string> = {};
    pool.forEach((_, i) => (correctMap[`g${i}`] = `t${i}`));
    const prompts = [
      "Match each German routine phrase to its English meaning.",
      "Click to match each phrase with the correct meaning.",
      "Pair each German routine phrase with what it means in English.",
      "Match the German phrases to their correct English meanings.",
      "Which English meaning matches each German phrase? Match them.",
      "Connect each German phrase to its English translation.",
      "Match each phrase you would write in German to its meaning.",
      "Pair up the German phrases with their English meanings.",
      "Match each routine phrase to its correct meaning before you write it.",
      "Click the matching pairs of German phrases and English meanings.",
      "Match these German routine phrases to what they mean.",
      "Link each German routine phrase to its English meaning.",
    ];
    return {
      kind: "click-match",
      prompt: randChoice(rng, prompts),
      tokens,
      targets,
      correctMap,
      hint: "Recall the German routine phrase for each meaning before matching.",
      explanation: pool.map((c) => `"${c.word}" means "${c.meaning}".`).join(" "),
    };
  },
};
