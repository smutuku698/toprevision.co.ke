import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGES: {
  passage: string;
  mainIdea: string;
  details: string[];
  mainQ: { correct: string; distractors: string[] };
  detailQ: { q: string; correct: string; distractors: string[] };
  fillBlank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] };
}[] = [
  {
    passage:
      "Rangers at Amani Conservancy spotted a family of elephants near the watering hole this morning. The herd included two calves that were only a few weeks old. Wildlife officers say the elephants have been visiting the same watering hole every dry season for the past three years, likely because nearby rivers have dried up.",
    mainIdea: "A family of elephants, including two young calves, visited a watering hole at Amani Conservancy",
    details: ["The herd included two calves only a few weeks old.", "The elephants have visited the same watering hole every dry season for three years.", "Nearby rivers have dried up."],
    mainQ: {
      correct: "A family of elephants, including two young calves, visited a watering hole at Amani Conservancy",
      distractors: ["A herd of elephants has left the conservancy for good", "Rangers built a new watering hole for the elephants", "The elephants have never visited the conservancy before"],
    },
    detailQ: {
      q: "According to the passage, how old were the calves?",
      correct: "Only a few weeks old",
      distractors: ["About three years old", "Almost a year old", "Several months old"],
    },
    fillBlank: { before: "The elephants have been visiting the same watering hole every dry season for the past", after: "years.", correctAnswer: "three", acceptedAnswers: ["3"] },
  },
  {
    passage:
      "Conservationists tagged a young rhino this week to track its movements across the reserve. The rhino, believed to be about two years old, was fitted with a small radio collar. Rangers hope the data will help them protect the rhino from poachers who target the species for its horn.",
    mainIdea: "Conservationists tagged a young rhino with a radio collar to help protect it from poachers",
    details: ["The rhino is believed to be about two years old.", "It was fitted with a small radio collar.", "Poachers target rhinos for their horns."],
    mainQ: {
      correct: "Conservationists tagged a young rhino with a radio collar to help protect it from poachers",
      distractors: ["Rangers released a rhino that had been in captivity for years", "A rhino was found injured near the reserve gate", "The reserve has decided to stop tracking its rhinos"],
    },
    detailQ: {
      q: "According to the passage, why did rangers want to track the rhino's movements?",
      correct: "To help protect it from poachers who target the species for its horn",
      distractors: ["To count how many plants it eats each day", "To prepare it for a trip to another country", "To teach it to avoid other rhinos"],
    },
    fillBlank: { before: "The rhino, believed to be about", after: "years old, was fitted with a radio collar.", correctAnswer: "two", acceptedAnswers: ["2"] },
  },
  {
    passage:
      "A troop of colobus monkeys has moved closer to the tourist camp after a wildfire destroyed part of their usual forest habitat last month. Camp staff have been asked to secure food stores, since the monkeys have started raiding kitchens in search of meals.",
    mainIdea: "A wildfire pushed a troop of colobus monkeys closer to the tourist camp, and they have begun raiding kitchens",
    details: ["A wildfire destroyed part of the monkeys' forest habitat last month.", "Camp staff have been asked to secure food stores.", "The monkeys have started raiding kitchens."],
    mainQ: {
      correct: "A wildfire pushed a troop of colobus monkeys closer to the tourist camp, and they have begun raiding kitchens",
      distractors: ["The tourist camp has been closed because of the monkeys", "Colobus monkeys have disappeared from the area entirely", "Camp staff have started feeding the monkeys by hand"],
    },
    detailQ: {
      q: "According to the passage, what caused the monkeys to move closer to the camp?",
      correct: "A wildfire destroyed part of their forest habitat",
      distractors: ["A new road was built through their forest", "Camp staff invited them closer with food", "Another troop of monkeys chased them away"],
    },
    fillBlank: { before: "A wildfire destroyed part of the monkeys' usual forest habitat", after: "month.", correctAnswer: "last", acceptedAnswers: [] },
  },
];

const LISTENING_STEPS = [
  { id: "topic", label: "Listen to understand the general topic first" },
  { id: "note", label: "Note key facts as you hear them — who, what, when and where" },
  { id: "distinguish", label: "Distinguish the main idea from the supporting details" },
  { id: "answer", label: "Answer or respond using the specific details you noted" },
];

const KIQ_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How should one listen for detail?",
    correct: "By paying close attention to specific facts such as names, numbers and events as they are mentioned",
    distractors: ["By only listening to the first sentence of a text", "By waiting for a written copy instead of listening", "By focusing only on the speaker's tone and ignoring the words"],
  },
  {
    q: "Why is listening for detail important in life?",
    correct: "It helps you respond accurately and avoid missing important information, such as instructions or safety warnings",
    distractors: ["It has no real use outside the classroom", "It only matters when listening to music", "It is only useful for people who work as journalists"],
  },
];

export const listeningForDetail: Skill = {
  id: "g8-eng-ls-listening-for-detail",
  code: "LS.7",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Listening for Detail",
  description: "Identify main ideas and supporting details in wildlife reports and respond accurately to questions about them.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-passage", "categorize", "order", "fill", "mc-kiq"] as const);
    const hint = "First grasp the overall topic, then listen for the exact facts — who, what, when, where and why — that support it.";

    if (branch === "mc-passage") {
      const p = randChoice(rng, PASSAGES);
      const useMain = rng() < 0.5;
      const set = useMain ? p.mainQ : p.detailQ;
      const q = useMain ? "What is the main idea of this passage?" : p.detailQ.q;
      const choices = shuffle(rng, [set.correct, ...set.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q,
        passage: p.passage,
        choices,
        correctIndex: choices.indexOf(set.correct),
        layout: "list",
        hint,
        explanation: `The correct answer is "${set.correct}".`,
      };
    }

    if (branch === "categorize") {
      const p = randChoice(rng, PASSAGES);
      const details = shuffle(rng, p.details).slice(0, 2);
      const items = shuffle(rng, [
        { id: "main", label: p.mainIdea, bucket: "main" },
        ...details.map((label, i) => ({ id: `d${i}`, label, bucket: "detail" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each statement into Main idea or Supporting detail.",
        passage: p.passage,
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "main", label: "Main idea" },
          { id: "detail", label: "Supporting detail" },
        ],
        correctBucket,
        hint: "The main idea sums up the whole passage; supporting details are the specific facts that back it up.",
        explanation: `Main idea: "${p.mainIdea}". Supporting details: ${details.join(" / ")}`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, LISTENING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of listening for detail in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: LISTENING_STEPS.map((s) => s.id),
        hint: "Start broad with the topic, then narrow down to specific facts, then use them to respond.",
        explanation: LISTENING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const p = randChoice(rng, PASSAGES);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing detail from the passage.",
        passage: p.passage,
        before: p.fillBlank.before,
        after: p.fillBlank.after,
        correctAnswer: p.fillBlank.correctAnswer,
        acceptedAnswers: p.fillBlank.acceptedAnswers,
        inputMode: "text",
        hint: "The exact detail is stated directly in the passage above.",
        explanation: `The passage states the detail "${p.fillBlank.correctAnswer}".`,
      };
    }

    const entry = randChoice(rng, KIQ_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
