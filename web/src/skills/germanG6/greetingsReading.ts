import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { GREETING_VOCAB, name, umlautAccepted } from "./shared";

// Reading strand, Theme 1: Greetings and Introduction — reading aloud/decoding a short dialogue,
// comprehension questions, and vocabulary practice drawn from GREETING_VOCAB.

function twoNames(rng: RNG): [string, string] {
  const a = name(rng);
  let b = name(rng);
  while (b === a) b = name(rng);
  return [a, b];
}

const DIALOGUE_SKELETONS: ((a: string, b: string) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (a, b) => ({
    lines: [`${a}: Guten Morgen!`, `${b}: Guten Morgen! Wie heißt du?`, `${a}: Ich heiße ${a}. Und du?`, `${b}: Ich heiße ${b}. Freut mich!`, `${a}: Freut mich auch! Bis bald!`, `${b}: Bis bald!`],
    qa: [
      { q: "Who speaks first in this passage?", correct: a, distractors: [b, "The teacher", "Nobody speaks first"], explanation: `${a} opens the passage with "Guten Morgen!"` },
      { q: `What does ${b} ask right after being greeted?`, correct: "Wie heißt du? (what is your name?)", distractors: ["Wie geht es dir? (how are you?)", "Wie alt bist du? (how old are you?)", "Bis bald (see you soon)"], explanation: `${b} asks "Wie heißt du?" — what is your name?` },
      { q: "How does the passage end?", correct: `Both say "Bis bald" (see you soon)`, distractors: [`${a} asks a new question`, "They introduce a third person", `${b} says "Guten Abend"`], explanation: `The passage closes with both speakers saying "Bis bald".` },
    ],
  }),
  (a, b) => ({
    lines: [`${a}: Hallo, ${b}!`, `${b}: Hallo! Wie geht es dir?`, `${a}: Mir geht es gut, danke. Und dir?`, `${b}: Mir geht es auch gut. Wie alt bist du?`, `${a}: Ich bin zwölf Jahre alt.`, `${b}: Tschüss!`],
    qa: [
      { q: `What does ${b} ask right after ${a}'s greeting?`, correct: "Wie geht es dir? (how are you?)", distractors: ["Wie heißt du? (what is your name?)", "Wie alt bist du? (how old are you?)", "Danke (thank you)"], explanation: `${b} says "Wie geht es dir?" — how are you?` },
      { q: `How does ${a} answer "Wie geht es dir?"`, correct: "Mir geht es gut, danke (I am doing well, thank you)", distractors: ["Bis bald (see you soon)", "Freut mich (nice to meet you)", "Tschüss (bye)"], explanation: `${a} replies "Mir geht es gut, danke".` },
      { q: `How old is ${a}?`, correct: "Zwölf Jahre alt (twelve years old)", distractors: ["Elf Jahre alt (eleven years old)", "Zehn Jahre alt (ten years old)", "Dreizehn Jahre alt (thirteen years old)"], explanation: `${a} says "Ich bin zwölf Jahre alt".` },
    ],
  }),
  (a, b) => ({
    lines: [`${a}: Guten Tag!`, `${b}: Guten Tag! Ich heiße ${b}. Wie heißt du?`, `${a}: Ich heiße ${a}. Wie alt bist du?`, `${b}: Ich bin elf Jahre alt. Und du?`, `${a}: Ich bin auch elf Jahre alt.`, `${b}: Auf Wiedersehen!`],
    qa: [
      { q: "What time of day does this greeting suggest?", correct: "Daytime (Guten Tag means good day)", distractors: ["Morning only", "Late night", "The passage does not say"], explanation: `"Guten Tag" means "good day".` },
      { q: `Who introduces themselves with a name first?`, correct: b, distractors: [a, "Neither", "Both at the same time"], explanation: `${b} says "Ich heiße ${b}" before ${a} does.` },
      { q: "What do both speakers have in common?", correct: "They are both eleven years old", distractors: ["They are both twelve years old", "Only one of them gives an age", "They disagree about their ages"], explanation: `Both ${a} and ${b} say "Ich bin ... elf Jahre alt".` },
    ],
  }),
  (a, b) => ({
    lines: [`${a}: Guten Abend, ${b}!`, `${b}: Guten Abend! Wie geht es dir?`, `${a}: Mir geht es gut. Danke schön.`, `${b}: Bitte! Freut mich, dich kennenzulernen.`, `${a}: Freut mich auch!`, `${b}: Bis bald!`],
    qa: [
      { q: "What time of day does this greeting suggest?", correct: "Evening (Guten Abend means good evening)", distractors: ["Morning", "Midday", "The passage does not say"], explanation: `"Guten Abend" means "good evening".` },
      { q: `What does ${a} say to thank ${b}?`, correct: "Danke schön (thank you very much)", distractors: ["Bitte (please/you're welcome)", "Freut mich (nice to meet you)", "Bis bald (see you soon)"], explanation: `${a} says "Danke schön".` },
      { q: `How does ${b} respond to the thanks?`, correct: "Bitte (you're welcome)", distractors: ["Tschüss (bye)", "Guten Tag (good day)", "Wie heißt du (what is your name)"], explanation: `${b} replies "Bitte!" — you're welcome.` },
    ],
  }),
  (a, b) => ({
    lines: [`${a}: Hallo! Ich heiße ${a}.`, `${b}: Hallo, ${a}! Ich heiße ${b}. Freut mich!`, `${a}: Freut mich auch. Wie alt bist du?`, `${b}: Ich bin zehn Jahre alt. Und du?`, `${a}: Ich bin auch zehn Jahre alt.`, `${b}: Tschüss, ${a}!`],
    qa: [
      { q: `Who says "Ich heiße" first in this passage?`, correct: a, distractors: [b, "Neither", "Both at the same time"], explanation: `${a} opens with "Ich heiße ${a}."` },
      { q: "How old are the two speakers?", correct: "Both are ten years old", distractors: ["Both are eleven years old", "Only one gives an age", "They are different ages"], explanation: `Both say "Ich bin ... zehn Jahre alt".` },
      { q: "Who says goodbye at the end?", correct: b, distractors: [a, "Neither", "A third person"], explanation: `${b} closes with "Tschüss, ${a}!"` },
    ],
  }),
];

const MATCH_POOL = GREETING_VOCAB;

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "In a reading text, 'good morning' is written as ", after: ".", correct: "Guten Morgen" },
  { before: "'Good day' appears in reading texts as ", after: ".", correct: "Guten Tag" },
  { before: "The greeting used for the evening reads as ", after: ".", correct: "Guten Abend" },
  { before: "'What is your name?' appears in the passage as ", after: "", correct: "Wie heißt du?" },
  { before: "The reading response meaning 'my name is...' is ", after: "", correct: "Ich heiße..." },
  { before: "In a farewell line, 'bye' reads as ", after: ".", correct: "Tschüss" },
  { before: "A more formal farewell in the passage reads ", after: ".", correct: "Auf Wiedersehen" },
  { before: "'How are you?' reads as ", after: "", correct: "Wie geht es dir?" },
  { before: "'I am doing well' reads as ", after: " in a reply.", correct: "Mir geht es gut" },
  { before: "The phrase for 'thank you' when reading aloud is ", after: ".", correct: "Danke" },
  { before: "'You're welcome' or 'please' reads as ", after: ".", correct: "Bitte" },
  { before: "'Nice to meet you' reads as ", after: " when two people introduce themselves.", correct: "Freut mich" },
  { before: "'See you soon' reads as ", after: " at the end of a conversation.", correct: "Bis bald" },
];

const MATCH_OPENERS = [
  "Match each phrase from the passage to its meaning.",
  "Which meaning goes with which German phrase?",
  "Pair each greeting phrase with its correct English meaning.",
  "Match the German phrase to what it means.",
  "Connect each phrase from the reading to its meaning.",
];
const MATCH_CLOSERS = [
  "",
  " Use the passage above as your guide.",
  " Think about how each phrase was used in the dialogue.",
  " Reread the passage carefully before you answer.",
];

const FILL_OPENERS = [
  "Fill in the missing phrase.",
  "Complete the sentence with the correct German phrase.",
  "What word or phrase completes this sentence?",
  "Fill the gap correctly.",
  "Complete this reading fact about greetings.",
];
const FILL_CLOSERS = [
  "",
  " Read it aloud once you finish.",
  " Think about the greetings dialogue above.",
  " Check your spelling carefully.",
];

const ORDER_OPENERS = [
  "Put these lines from the passage in the order they were read.",
  "Arrange the passage's lines in the correct reading order.",
  "Sequence this exchange correctly.",
  "Order the lines as they appear in the passage.",
  "Which order makes this reading passage make sense?",
];
const ORDER_CLOSERS = [
  "",
  " Read each line carefully first.",
  " Think about how a greeting exchange normally flows.",
  " A greeting opens the passage and a farewell closes it.",
];

const CATEGORIZE_OPENERS = [
  "As you read, sort each phrase: Greeting, Introduction, or Politeness?",
  "Group these reading-passage phrases by their purpose.",
  "Sort each phrase into the category it belongs to.",
  "Classify each phrase from the reading text.",
  "Which category best fits each phrase?",
];
const CATEGORIZE_CLOSERS = [
  "",
  " Think about when each phrase is used in a conversation.",
  " Reread the dialogue above if you need a reminder.",
  " Consider whether the phrase greets, introduces, or is polite.",
];

export const greetingsReading: Skill = {
  id: "g6-de-r-greetings",
  code: "R.1",
  subjectId: "german",
  strandId: "g6-de-reading",
  grade: 6,
  title: "Guided reading: greetings and introductions",
  description: "Read short German greeting-and-introduction exchanges fluently, recognise greeting vocabulary, and answer comprehension questions about the passage.",
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
        hint: "Reread the passage above — each phrase appears in context there.",
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
        hint: "Use the passage above as a reminder of how each phrase is used.",
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
        hint: "The passage opens with a greeting and closes with a farewell.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, GREETING_VOCAB).slice(0, 6);
      const bucketOf = (w: string) =>
        ["Hallo", "Guten Morgen", "Guten Tag", "Guten Abend", "Tschüss", "Auf Wiedersehen", "Bis bald"].includes(w)
          ? "Greeting"
          : ["Wie heißt du?", "Ich heiße...", "Wie alt bist du?", "Ich bin ... Jahre alt", "Freut mich"].includes(w)
          ? "Introduction"
          : "Politeness";
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)}${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Greeting", label: "Greeting" },
          { id: "Introduction", label: "Introduction" },
          { id: "Politeness", label: "Politeness" },
        ],
        correctBucket,
        hint: "Greetings open/close a passage; introductions share or ask a name; politeness phrases are courteous words.",
        explanation: chosen.map((c) => `"${c.word}" is ${bucketOf(c.word) === "Introduction" ? "an" : "a"} ${bucketOf(c.word).toLowerCase()} phrase.`).join(" "),
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
