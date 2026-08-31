import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each teaching method the Prophet (S.A.W.) used to its description.",
  "Pair each teaching method with its description.",
  "Connect each method below to its description.",
  "Match each teaching method to what it involves.",
  "Link each method the Prophet (S.A.W.) used to its description.",
  "Choose the correct description for each teaching method.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each example by the teaching method the Prophet (S.A.W.) used.",
  "Group each example under the teaching method the Prophet (S.A.W.) used.",
  "Decide which teaching method each example shows, and sort it there.",
  "Sort each example into the correct teaching method.",
  "Place each example under the method it illustrates.",
  "Read each example and sort it under the matching teaching method.",
];

const ORDER_PROMPTS = [
  "Arrange the stages in the historical development of Hadith in the correct order.",
  "Put the stages in the historical development of Hadith into the correct order.",
  "Sequence these stages of Hadith's historical development correctly.",
  "Order these stages of Hadith's development as they actually happened.",
  "Sort these stages of Hadith's history into their correct order.",
  "Arrange these stages of Hadith's historical development from first to last.",
];

const FILL_PROMPTS = [
  "Fill in the missing number.",
  "Which number completes this fact?",
  "Work out the missing number below.",
  "Complete the sentence with the correct number.",
  "Fill in the blank with the correct number.",
  "Which number belongs in the blank?",
];

const METHODS: { method: string; description: string }[] = [
  { method: "Repetition", description: "The Prophet (S.A.W.) repeated an important teaching, often three times, so his companions would remember it well" },
  { method: "Storytelling", description: "The Prophet (S.A.W.) narrated stories of earlier prophets and nations to draw out lessons for his companions" },
  { method: "Practical demonstration", description: "The Prophet (S.A.W.) physically showed his companions how to perform acts such as prayer and ablution" },
  { method: "Question-and-answer", description: "The Prophet (S.A.W.) encouraged his companions to ask questions and gave them clear answers" },
];

const SCENARIO_ITEMS = [
  { text: "\"Pray as you have seen me praying,\" the Prophet said, showing his companions the movements", method: "Practical demonstration" },
  { text: "The Prophet said an important instruction three times so it would not be forgotten", method: "Repetition" },
  { text: "A companion asked the Prophet what deed was most beloved to Allah, and he answered directly", method: "Question-and-answer" },
  { text: "The Prophet told his companions about the patience of earlier prophets to teach them a lesson", method: "Storytelling" },
] as const;

const HISTORY_STEPS = [
  { id: "prophet", label: "The Prophet (S.A.W.) teaches through his speech, actions, and approvals" },
  { id: "companions", label: "Companions memorise and carefully narrate what they witnessed" },
  { id: "tabiun", label: "The Tabi'un (the generation after the companions) collect narrations from the companions" },
  { id: "compilation", label: "Scholars compile and authenticate the narrations into written Hadith collections" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is Hadith?",
    correct: "The sayings, actions, and approvals of Prophet Muhammad (S.A.W.)",
    distractors: ["A chapter of the Qur'an", "A prayer said only on Fridays", "A book written entirely by the companions with no link to the Prophet"],
  },
  {
    q: "Why did the Prophet (S.A.W.) often use storytelling to teach?",
    correct: "To draw out lessons from the experiences of earlier prophets and nations",
    distractors: ["To entertain his companions with no teaching purpose", "Because writing was not allowed at all", "To avoid answering direct questions"],
  },
  {
    q: "What did the companions do to help develop and preserve Hadith?",
    correct: "They carefully memorised and narrated what the Prophet (S.A.W.) said and did",
    distractors: ["They ignored the Prophet's teachings", "They only recorded his teachings after his death with no memorisation", "They changed his words to suit their own opinions"],
  },
  {
    q: "Why is it important for a Muslim today to learn Ulum al-Hadith (the science of Hadith)?",
    correct: "To understand how Hadith were transmitted and authenticated, so they can be relied on as a source of guidance",
    distractors: ["Because it replaces the need to read the Qur'an", "Because Hadith are less important than local traditions", "Because it is only useful for scholars, not ordinary Muslims"],
  },
];

export const ulumAlHadith: Skill = {
  id: "g8-ire-ha-ulum-al-hadith",
  code: "HA.1",
  subjectId: "ire",
  strandId: "g8-ire-ha",
  grade: 8,
  title: "Ulum al-Hadith",
  description: "How Hadith developed during the Prophet's time and the methods he used to teach it.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, METHODS.map((m) => ({ id: m.method, label: m.method })));
      const targets = shuffle(rng, METHODS.map((m) => ({ id: m.method, label: m.description })));
      const correctMap: Record<string, string> = {};
      for (const m of METHODS) correctMap[m.method] = m.method;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The Prophet taught through repeating key points, telling stories, demonstrating actions, and answering questions.",
        explanation: METHODS.map((m) => `${m.method} — ${m.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SCENARIO_ITEMS);
      const buckets = METHODS.map((m) => ({ id: m.method, label: m.method }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.method));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Look for whether the example shows repeating, storytelling, demonstrating, or answering a question.",
        explanation: chosen.map((c) => `"${c.text}" — an example of ${c.method.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, HISTORY_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: HISTORY_STEPS.map((s) => s.id),
        hint: "Hadith began with the Prophet's own teaching, then passed through the companions and the next generation, before being compiled by scholars.",
        explanation: HISTORY_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "The Prophet (S.A.W.) often repeated an important teaching",
        after: "times so his companions would remember it well.",
        correctAnswer: "3",
        acceptedAnswers: ["three"],
        inputMode: "text",
        hint: "This is the same number of times he is reported to have repeated key statements for emphasis.",
        explanation: "The Prophet (S.A.W.) is reported to have often repeated important statements three times so his companions would remember them.",
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "The Prophet (S.A.W.) taught Hadith through repetition, storytelling, demonstration, and question-and-answer, and his companions carefully preserved it.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
