import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { GROOMING_VOCAB, name, umlautAccepted } from "./shared";

// Reading strand, Theme 7: My Body (grooming/personal-hygiene routine, not anatomy) — guided
// reading/comprehension of short daily-routine texts, drawn from GROOMING_VOCAB.

function twoNames(rng: RNG): [string, string] {
  const a = name(rng);
  let b = name(rng);
  while (b === a) b = name(rng);
  return [a, b];
}

const HOURS = [6, 7, 8];

const DIALOGUE_SKELETONS: ((a: string, b: string, hour: number, r1: { word: string; meaning: string }, r2: { word: string; meaning: string }) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (a, b, hour, r1, r2) => ({
    lines: [`${a}: Was machst du um ${hour} Uhr?`, `${b}: Um ${hour} Uhr ${r1.word}.`, `${a}: Und danach?`, `${b}: Danach ${r2.word}.`, `${a}: Das ist eine gute Routine!`, `${b}: Ja, jeden Morgen mache ich das gleiche.`],
    qa: [
      { q: `What does ${b} do at ${hour} o'clock, according to the passage?`, correct: `${r1.word} (${r1.meaning})`, distractors: [`${r2.word} (${r2.meaning})`, "frühstücken (to eat breakfast)", "The passage does not say"], explanation: `${b} says "Um ${hour} Uhr ${r1.word}."` },
      { q: `What does ${b} do right after that?`, correct: `${r2.word} (${r2.meaning})`, distractors: [`${r1.word} (${r1.meaning})`, "schlafen gehen (to go to sleep)", "The passage does not say"], explanation: `${b} says "Danach ${r2.word}."` },
      { q: `How often does ${b} follow this routine, according to the passage?`, correct: "Every morning (jeden Morgen)", distractors: ["Once a week", "Only on weekends", "The passage does not say"], explanation: `${b} says "jeden Morgen mache ich das gleiche."` },
    ],
  }),
  (a, b, hour, r1, r2) => ({
    lines: [`${a}: Wann stehst du auf?`, `${b}: Ich stehe um ${hour} Uhr auf.`, `${a}: Was machst du dann zuerst?`, `${b}: Zuerst ${r1.word}.`, `${a}: Und dann?`, `${b}: Dann ${r2.word} und gehe zur Schule.`],
    qa: [
      { q: `What time does ${b} get up, according to the passage?`, correct: `${hour} Uhr`, distractors: ["Fünf Uhr", "Neun Uhr", "The passage does not say"], explanation: `${b} says "Ich stehe um ${hour} Uhr auf."` },
      { q: `What is the first thing ${b} does after getting up?`, correct: `${r1.word} (${r1.meaning})`, distractors: [`${r2.word} (${r2.meaning})`, "frühstücken (to eat breakfast)", "The passage does not say"], explanation: `${b} says "Zuerst ${r1.word}."` },
      { q: `What does ${b} do before going to school?`, correct: `${r2.word} (${r2.meaning})`, distractors: [`${r1.word} (${r1.meaning})`, "schlafen gehen (to go to sleep)", "The passage does not say"], explanation: `${b} says "Dann ${r2.word} und gehe zur Schule."` },
    ],
  }),
  (a, b, hour, r1, r2) => ({
    lines: [`${a}: Ich ${r1.word} jeden Tag vor der Schule.`, `${b}: Ich auch! Und ich ${r2.word} auch.`, `${a}: Um wie viel Uhr machst du das?`, `${b}: Um ${hour} Uhr, jeden Morgen.`, `${a}: Sehr gut! Saubere Gewohnheiten sind wichtig.`, `${b}: Genau!`],
    qa: [
      { q: `What does ${a} do every day before school?`, correct: `${r1.word} (${r1.meaning})`, distractors: [`${r2.word} (${r2.meaning})`, "frühstücken (to eat breakfast)", "The passage does not say"], explanation: `${a} says "Ich ${r1.word} jeden Tag vor der Schule."` },
      { q: `At what time does ${b} do their morning routine?`, correct: `${hour} Uhr`, distractors: ["Fünf Uhr", "Zehn Uhr", "The passage does not say"], explanation: `${b} says "Um ${hour} Uhr, jeden Morgen."` },
      { q: "What do the speakers agree is important?", correct: "Clean habits (saubere Gewohnheiten)", distractors: ["Sleeping late", "Eating fast", "The passage does not say"], explanation: `${a} says "Saubere Gewohnheiten sind wichtig."` },
    ],
  }),
  (a, b, hour, r1, r2) => ({
    lines: [`${a}: Was machst du, bevor du frühstückst?`, `${b}: Bevor ich frühstücke, ${r1.word}.`, `${a}: Und nach dem Frühstück?`, `${b}: Nach dem Frühstück ${r2.word}.`, `${a}: Deine Routine ist sehr ordentlich.`, `${b}: Danke, das mag ich auch an mir.`],
    qa: [
      { q: `What does ${b} do before breakfast, according to the passage?`, correct: `${r1.word} (${r1.meaning})`, distractors: [`${r2.word} (${r2.meaning})`, "aufstehen (to get up)", "The passage does not say"], explanation: `${b} says "Bevor ich frühstücke, ${r1.word}."` },
      { q: `What does ${b} do after breakfast?`, correct: `${r2.word} (${r2.meaning})`, distractors: [`${r1.word} (${r1.meaning})`, "schlafen gehen (to go to sleep)", "The passage does not say"], explanation: `${b} says "Nach dem Frühstück ${r2.word}."` },
      { q: `How does ${a} describe ${b}'s routine?`, correct: "Very orderly/neat (sehr ordentlich)", distractors: ["Very messy", "Too slow", "The passage does not say"], explanation: `${a} says "Deine Routine ist sehr ordentlich."` },
    ],
  }),
  (a, b, hour, r1, r2) => ({
    lines: [`${a}: Um ${hour} Uhr ${r1.word} ich.`, `${b}: Warum so früh?`, `${a}: Ich möchte pünktlich zur Schule kommen.`, `${b}: Verstehe. Was machst du danach?`, `${a}: Danach ${r2.word} ich schnell.`, `${b}: Klingt nach einem guten Plan!`],
    qa: [
      { q: `What does ${a} do at ${hour} o'clock?`, correct: `${r1.word} (${r1.meaning})`, distractors: [`${r2.word} (${r2.meaning})`, "frühstücken (to eat breakfast)", "The passage does not say"], explanation: `${a} says "Um ${hour} Uhr ${r1.word} ich."` },
      { q: `Why does ${a} do it so early?`, correct: "To arrive at school on time (pünktlich)", distractors: ["Because they wake up early anyway", "Because their family asks them to", "The passage does not say"], explanation: `${a} says "Ich möchte pünktlich zur Schule kommen."` },
      { q: `What does ${a} do quickly right after?`, correct: `${r2.word} (${r2.meaning})`, distractors: [`${r1.word} (${r1.meaning})`, "aufstehen (to get up)", "The passage does not say"], explanation: `${a} says "Danach ${r2.word} ich schnell."` },
    ],
  }),
];

const MATCH_POOL = GROOMING_VOCAB;

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "In a reading text, 'to brush one's teeth' is written as ", after: ".", correct: "die Zähne putzen" },
  { before: "'To comb one's hair' appears in reading texts as ", after: ".", correct: "die Haare kämmen" },
  { before: "The phrase for 'to wash one's hands' when reading aloud is ", after: ".", correct: "die Hände waschen" },
  { before: "'To shower' reads as ", after: " in a routine passage.", correct: "duschen" },
  { before: "'To get dressed' is written as ", after: " in the passage.", correct: "sich anziehen" },
  { before: "'To wash one's face' reads as ", after: " in a routine text.", correct: "das Gesicht waschen" },
  { before: "The reading phrase for 'to wash one's hair' is ", after: ".", correct: "die Haare waschen" },
  { before: "'To cut one's nails' appears as ", after: " in the passage.", correct: "die Nägel schneiden" },
  { before: "'To get up' reads as ", after: " in a routine passage.", correct: "aufstehen" },
  { before: "'To eat breakfast' is written as ", after: " in the reading text.", correct: "frühstücken" },
  { before: "'To go to sleep' reads as ", after: " at the end of a routine text.", correct: "schlafen gehen" },
];

const MATCH_OPENERS = [
  "Match each routine phrase from the passage to its meaning.",
  "Which meaning goes with which German routine phrase?",
  "Pair each grooming phrase with its correct English meaning.",
  "Match the German phrase to what it means.",
  "Connect each daily-routine phrase to its meaning.",
];
const MATCH_CLOSERS = [
  "",
  " Use the passage above as your guide.",
  " Think about the order of a morning routine.",
  " Reread the passage carefully before you answer.",
];

const FILL_OPENERS = [
  "Fill in the missing routine phrase.",
  "Complete the sentence with the correct German phrase.",
  "What phrase completes this sentence about routines?",
  "Fill the gap correctly.",
  "Complete this reading fact about grooming routines.",
];
const FILL_CLOSERS = [
  "",
  " Read it aloud once you finish.",
  " Think about the routine passage above.",
  " Check your spelling carefully.",
];

const ORDER_OPENERS = [
  "Put these lines from the passage in the order they were read.",
  "Arrange the passage's lines in the correct reading order.",
  "Sequence this conversation about a daily routine correctly.",
  "Order the lines as they appear in the passage.",
  "Which order makes this reading passage make sense?",
];
const ORDER_CLOSERS = [
  "",
  " Read each line carefully first.",
  " Think about how a morning routine usually flows.",
  " Getting up usually comes before getting dressed.",
];

const CATEGORIZE_OPENERS = [
  "As you read, sort each routine step: Uses water, or No water needed?",
  "Group these routine phrases by whether water is used.",
  "Sort each phrase into the category it belongs to.",
  "Classify each routine phrase from the reading text.",
  "Which category best fits each grooming step?",
];
const CATEGORIZE_CLOSERS = [
  "",
  " Think about whether the step involves washing.",
  " Reread the passage above if you need a reminder.",
  " Brushing teeth and washing use water; combing hair does not.",
];

const WATER_WORDS = ["die Zähne putzen", "die Hände waschen", "duschen", "das Gesicht waschen", "die Haare waschen"];

export const bodyReading: Skill = {
  id: "g6-de-r-body",
  code: "R.7",
  subjectId: "german",
  strandId: "g6-de-reading",
  grade: 6,
  title: "Guided reading: my body (grooming routine)",
  description: "Read and comprehend short German passages about a daily grooming/personal-hygiene routine, recognise routine vocabulary, and answer comprehension questions about the passage.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const [a, b] = twoNames(rng);
    const hour = randChoice(rng, HOURS);
    const r1 = randChoice(rng, GROOMING_VOCAB);
    let r2 = randChoice(rng, GROOMING_VOCAB);
    while (r2.word === r1.word) r2 = randChoice(rng, GROOMING_VOCAB);
    const skeleton = randChoice(rng, DIALOGUE_SKELETONS)(a, b, hour, r1, r2);
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
        hint: "The passage describes one part of a routine after another.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, GROOMING_VOCAB).slice(0, 6);
      const bucketOf = (w: string) => (WATER_WORDS.includes(w) ? "Uses water" : "No water needed");
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)}${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Uses water", label: "Uses water" },
          { id: "No water needed", label: "No water needed" },
        ],
        correctBucket,
        hint: "Brushing teeth, washing hands/face/hair, and showering use water; combing, dressing, cutting nails, and getting up do not.",
        explanation: chosen.map((c) => `"${c.word}" ${bucketOf(c.word) === "Uses water" ? "uses water" : "does not need water"}.`).join(" "),
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
