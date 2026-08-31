import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TASK_ITEMS: { text: string; bucket: "information" | "meaning" }[] = [
  { text: "Reading a fire-safety poster to find the location of the nearest emergency exit", bucket: "information" },
  { text: "Reading a short poem about courage to understand the feeling it is expressing", bucket: "meaning" },
  { text: "Reading the label on a bottle of hand sanitiser to find the correct dosage", bucket: "information" },
  { text: "Reading a story about a security guard to understand its theme of trust", bucket: "meaning" },
  { text: "Reading a notice board to find the school's handwashing schedule", bucket: "information" },
  { text: "Reading a short reflection to understand how the writer feels about staying safe", bucket: "meaning" },
  { text: "Reading a first-aid chart to find the steps for treating a small cut", bucket: "information" },
  { text: "Reading a folktale about a watchman to work out its underlying message", bucket: "meaning" },
];

const INFER_PASSAGES: { passage: string; word: string; correct: string; distractors: string[] }[] = [
  {
    passage: "The night watchman was vigilant, checking every gate and fence around the compound before allowing the gates to close for the night.",
    word: "vigilant",
    correct: "watchful and alert",
    distractors: ["careless and distracted", "tired and sleepy", "loud and talkative"],
  },
  {
    passage: "After the disease outbreak, the clinic staff enforced stringent measures, insisting that every visitor wash their hands and wear a mask before entering.",
    word: "stringent",
    correct: "strict and firmly enforced",
    distractors: ["relaxed and optional", "confusing and unclear", "expensive and costly"],
  },
  {
    passage: "The security guard grew suspicious of the unattended bag left near the school gate and immediately alerted the head teacher.",
    word: "suspicious",
    correct: "having doubts or distrust about something",
    distractors: ["completely certain and confident", "happy and excited", "bored and uninterested"],
  },
  {
    passage: "Members of the neighbourhood watch patrol the estate at night to deter thieves from breaking into homes.",
    word: "deter",
    correct: "to discourage or prevent someone from doing something",
    distractors: ["to invite or encourage someone to do something", "to reward someone generously", "to ignore something completely"],
  },
  {
    passage: "The hospital's hygiene officer was meticulous, checking every surface twice to be sure no germs remained.",
    word: "meticulous",
    correct: "very careful and precise about small details",
    distractors: ["quick and careless", "loud and forceful", "unsure and hesitant"],
  },
  {
    passage: "Residents were urged to report any suspicious activity promptly to the local chief so that the estate would stay secure.",
    word: "promptly",
    correct: "without any delay; immediately",
    distractors: ["very quietly, without speaking", "only during the daytime", "after a very long wait"],
  },
];

const TEXT_FEATURES: { name: string; description: string }[] = [
  { name: "Title", description: "Tells the reader the overall topic of the whole text at a glance" },
  { name: "Subtitle", description: "Gives extra detail about the title, narrowing down exactly what the text covers" },
  { name: "Heading", description: "Introduces the topic of one smaller section within a longer text" },
  { name: "Caption", description: "Explains what a picture or diagram next to the text is showing" },
  { name: "Bullet list", description: "Breaks a list of separate points or steps apart so they are easy to scan quickly" },
  { name: "Bold text", description: "Draws the reader's eye to a particularly important word or warning" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it important to read for information, such as checking a safety notice?",
    correct: "It helps a reader quickly find facts they need, such as rules that keep them safe and secure",
    distractors: [
      "It is only useful for passing examinations",
      "It teaches a reader how a writer feels about a topic",
      "It is less important than reading for enjoyment",
    ],
  },
  {
    q: "Why is it important to read for meaning, such as understanding a story's message?",
    correct: "It helps a reader understand deeper ideas, feelings, and lessons that facts alone do not explain",
    distractors: [
      "It helps a reader find a phone number quickly",
      "It is only needed when reading instructions",
      "It replaces the need to ever read for information",
    ],
  },
  {
    q: "What is the main difference between reading for information and reading for meaning?",
    correct: "Reading for information locates specific facts, while reading for meaning explores ideas, feelings, and messages",
    distractors: [
      "There is no real difference between the two",
      "Reading for information is always slower than reading for meaning",
      "Reading for meaning only applies to advertisements",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "A security guard who checks every gate carefully before locking up for the night is being ", after: ".", correctAnswer: "vigilant" },
  { before: "After the outbreak, the clinic enforced ", after: " hygiene rules that every visitor had to follow.", correctAnswer: "stringent" },
  { before: "The neighbourhood watch patrols at night to ", after: " thieves from breaking into homes.", correctAnswer: "deter" },
];

export const informationAndMeaning: Skill = {
  id: "g7-eng-r-information-and-meaning",
  code: "R.3",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Reading: Information and Meaning",
  description: "Distinguish reading for information from reading for meaning, infer word meanings from context, and use text features to locate information about hygiene, safety, and security.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "features", "infer", "fill", "concept"] as const);

    if (branch === "classify") {
      const infoItems = shuffle(rng, TASK_ITEMS.filter((t) => t.bucket === "information")).slice(0, 3);
      const meaningItems = shuffle(rng, TASK_ITEMS.filter((t) => t.bucket === "meaning")).slice(0, 3);
      const chosen = shuffle(rng, [...infoItems, ...meaningItems]);
      const items = chosen.map((c, i) => ({ id: `t${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`t${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each reading task into Reading for information or Reading for meaning.",
        items,
        buckets: [
          { id: "information", label: "Reading for information" },
          { id: "meaning", label: "Reading for meaning" },
        ],
        correctBucket,
        hint: "Reading for information is about locating specific facts. Reading for meaning is about understanding ideas, feelings, or messages.",
        explanation: chosen.map((c) => `"${c.text}" is ${c.bucket === "information" ? "reading for information" : "reading for meaning"}.`).join(" "),
      };
    }

    if (branch === "features") {
      const chosen = shuffle(rng, TEXT_FEATURES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.name, label: f.name })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.name, label: f.description })));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.name] = f.name;
      return {
        kind: "click-match",
        prompt: "Match each text feature to what it helps a reader do.",
        tokens,
        targets,
        correctMap,
        hint: "Text features like titles and headings help a reader locate the information they need without reading every word.",
        explanation: chosen.map((f) => `${f.name} — ${f.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "infer") {
      const entry = randChoice(rng, INFER_PASSAGES);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        passage: entry.passage,
        prompt: `As used in the passage, what does the word "${entry.word}" most likely mean?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Look at the words and situation around the unfamiliar word for clues about its meaning.",
        explanation: `In this passage, "${entry.word}" means: ${entry.correct}.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Think about hygiene, safety, and security — what word fits the meaning of the sentence?",
        explanation: `The sentence reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Think about what each type of reading helps a reader achieve.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
