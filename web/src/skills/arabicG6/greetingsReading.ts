import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { GREETING_VOCAB, name } from "./shared";

// Sub-strand 2.1 Guided Reading: Fluency — Theme: Greetings and Introduction.
// Content: recognising signs (harakat) in words/phrases on familiar topics, reading simple sentences
// on introductions with appropriate intonation, reading a variety of short texts.

function twoNames(rng: import("@/lib/rng").RNG): [string, string] {
  const a = name(rng);
  let b = name(rng);
  while (b === a) b = name(rng);
  return [a, b];
}

const DIALOGUE_SKELETONS: ((a: string, b: string) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (a, b) => ({
    lines: [`${a}: sabah al-khair!`, `${b}: sabah al-khair! kayfa haaluk?`, `${a}: bikhair, shukran. ismi ${a}.`, `${b}: tasharrafna, ${a}! ismi ${b}.`, `${a}: maa as-salama!`, `${b}: maa as-salama!`],
    qa: [
      { q: "Who speaks first in this passage?", correct: a, distractors: [b, "The teacher", "Nobody speaks first"], explanation: `${a} opens the passage with "sabah al-khair!"` },
      { q: `What does ${b} ask right after being greeted?`, correct: "kayfa haaluk (how are you)", distractors: ["ismi... (my name is)", "shukran (thank you)", "maa as-salama (goodbye)"], explanation: `${b} says "kayfa haaluk?" — asking how ${a} is doing.` },
      { q: `How does ${a} answer "kayfa haaluk?"`, correct: "bikhair, shukran (I am fine, thank you)", distractors: ["maa as-salama (goodbye)", "tasharrafna (nice to meet you)", "sabah al-khair (good morning)"], explanation: `${a} replies "bikhair, shukran" — I am fine, thank you.` },
    ],
  }),
  (a, b) => ({
    lines: [`${a}: ahlan!`, `${b}: ahlan wa sahlan! ismi ${b}.`, `${a}: tasharrafna. ismi ${a}. kayfa haaluk?`, `${b}: bikhair, wa anta?`, `${a}: bikhair aydan, shukran!`, `${b}: maa as-salama!`],
    qa: [
      { q: `What does ${b} say back when ${a} says "ahlan"?`, correct: "ahlan wa sahlan (welcome)", distractors: ["maa as-salama (goodbye)", "shukran (thank you)", "kayfa haaluk (how are you)"], explanation: `${b} replies "ahlan wa sahlan" — welcome.` },
      { q: `What does ${a} say right after learning ${b}'s name?`, correct: "tasharrafna (nice to meet you)", distractors: ["maa as-salama (goodbye)", "sabah al-khair (good morning)", "min fadlik (please)"], explanation: `${a} says "tasharrafna" — nice to meet you.` },
      { q: "How does the passage end?", correct: `${b} says "maa as-salama" (goodbye)`, distractors: [`${a} asks a question`, "They start a new topic", `${b} introduces someone else`], explanation: `${b} closes the passage with "maa as-salama".` },
    ],
  }),
  (a, b) => ({
    lines: [`${a}: masaa al-khair!`, `${b}: masaa al-khair! kayfa haaluk?`, `${a}: bikhair, shukran. wa anta?`, `${b}: bikhair aydan.`, `${a}: min fadlik, maa ismuk?`, `${b}: ismi ${b}. maa as-salama!`],
    qa: [
      { q: "What time of day does this greeting suggest?", correct: "evening", distractors: ["morning", "midnight", "the passage does not say"], explanation: `"masaa al-khair" means "good evening".` },
      { q: `What does ${a} say before asking ${b}'s name?`, correct: "min fadlik (please)", distractors: ["shukran (thank you)", "afwan (excuse me / you're welcome)", "maa as-salama (goodbye)"], explanation: `${a} politely says "min fadlik" before asking the name.` },
      { q: `What is ${b}'s final line?`, correct: `"ismi ${b}. maa as-salama!"`, distractors: [`"masaa al-khair!"`, `"kayfa haaluk?"`, `"bikhair aydan."`], explanation: `${b} gives their name and says goodbye to end the passage.` },
    ],
  }),
  (a, b) => ({
    lines: [`${a}: ahlan, ${b}!`, `${b}: ahlan! tasharrafna.`, `${a}: kayfa haaluk?`, `${b}: bikhair, shukran. wa anta?`, `${a}: bikhair, alhamdulillah.`, `${b}: afwan — maa as-salama!`],
    qa: [
      { q: `What does ${b} reply right after ${a}'s first greeting?`, correct: "ahlan! tasharrafna. (hello! nice to meet you.)", distractors: ["maa as-salama! (goodbye!)", "kayfa haaluk? (how are you?)", "shukran! (thank you!)"], explanation: `${b} answers with "ahlan! tasharrafna."` },
      { q: `Who asks "kayfa haaluk?" in this passage?`, correct: a, distractors: [b, "Neither", "Both at the same time"], explanation: `${a} is the one who asks "kayfa haaluk?"` },
      { q: "What word does the passage use for 'you're welcome / excuse me'?", correct: "afwan", distractors: ["shukran", "bikhair", "tasharrafna"], explanation: `${b} says "afwan" before the farewell.` },
    ],
  }),
  (a, b) => ({
    lines: [`${a}: sabah al-khair!`, `${b}: sabah al-khair! maa ismuk?`, `${a}: ismi ${a}. wa anta?`, `${b}: ismi ${b}. tasharrafna!`, `${a}: tasharrafna aydan! shukran.`, `${b}: afwan. maa as-salama!`],
    qa: [
      { q: `What does ${b} ask right after greeting ${a}?`, correct: "maa ismuk (what is your name)", distractors: ["kayfa haaluk (how are you)", "min fadlik (please)", "maa as-salama (goodbye)"], explanation: `${b} asks "maa ismuk?" — what is your name?` },
      { q: `What does ${a} say to thank ${b}?`, correct: "shukran", distractors: ["afwan", "ismi", "tasharrafna"], explanation: `${a} says "shukran" — thank you.` },
      { q: "Which two phrases both mean roughly 'nice to meet you' feelings here?", correct: "tasharrafna and tasharrafna aydan", distractors: ["sabah al-khair and maa ismuk", "shukran and afwan", "ismi and wa anta"], explanation: `Both speakers say a form of "tasharrafna" (nice to meet you).` },
    ],
  }),
];

const MATCH_POOL = GREETING_VOCAB;

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "When reading a text, 'good morning' is written as ", after: ".", correct: "sabah al-khair" },
  { before: "'How are you' appears in reading texts as ", after: ".", correct: "kayfa haaluk" },
  { before: "The reading response meaning 'I am fine' is ", after: ".", correct: "bikhair" },
  { before: "In a farewell line, 'goodbye' reads as ", after: ".", correct: "maa as-salama" },
  { before: "A polite reading phrase for 'please' is ", after: ".", correct: "min fadlik" },
  { before: "The phrase for 'thank you' when reading aloud is ", after: ".", correct: "shukran" },
  { before: "'Welcome' reads as ", after: " in an Arabic greeting text.", correct: "ahlan wa sahlan" },
  { before: "'Nice to meet you' reads as ", after: " when two people introduce themselves.", correct: "tasharrafna" },
  { before: "'You're welcome' or 'excuse me' reads as ", after: ".", correct: "afwan" },
  { before: "To introduce yourself in a passage, you read ", after: " followed by your name.", correct: "ismi" },
];

export const greetingsReading: Skill = {
  id: "g6-ar-r-greetings",
  code: "R.1",
  subjectId: "arabic",
  strandId: "g6-ar-reading",
  grade: 6,
  title: "Guided reading: fluency (greetings and introduction)",
  description: "Read short Arabic greeting exchanges fluently, recognise greeting and introduction vocabulary, and answer comprehension questions.",
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
        prompt: randChoice(rng, [
          "Match each phrase from the passage's theme to its English meaning.",
          "Match the romanized Arabic phrase to its meaning.",
          "Which meaning goes with which phrase?",
          "Match each greeting expression to what it means.",
          "Pair each phrase with its correct English meaning.",
        ]),
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
        prompt: randChoice(rng, [
          "Fill in the missing phrase.",
          "Complete the sentence with the correct Arabic phrase.",
          "What word or phrase completes this sentence?",
          "Fill the gap correctly.",
          "Complete this reading fact about greetings.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
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
        prompt: randChoice(rng, [
          "Put these lines from the passage in the order they were read.",
          "Arrange the passage's lines in the correct reading order.",
          "Sequence this exchange correctly.",
          "Order the lines as they appear in the passage.",
          "Which order makes this reading passage make sense?",
        ]),
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
        ["sabah al-khair", "masaa al-khair", "ahlan", "ahlan wa sahlan", "maa as-salama"].includes(w)
          ? "Greeting"
          : ["ismi...", "tasharrafna", "kayfa haaluk"].includes(w)
          ? "Introduction"
          : "Politeness";
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "As you read, sort each phrase: Greeting, Introduction, or Politeness?",
          "Group these reading-passage phrases by their purpose.",
          "Sort each phrase into the category it belongs to.",
          "Classify each phrase from the reading text.",
          "Which category best fits each phrase?",
        ]),
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
    const choices = shuffle(rng, [qa.correct, ...qa.distractors]);
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
