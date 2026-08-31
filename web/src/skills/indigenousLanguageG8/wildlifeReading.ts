import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface ComprehensionQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface Passage {
  text: string;
  questions: ComprehensionQuestion[];
  trueFalse: { text: string; isTrue: boolean }[];
}

const PASSAGES: Passage[] = [
  {
    text: "Rangers at Amboseli National Park track a herd of elephants using radio collars to study their movement patterns. The data helps rangers predict when elephants might wander close to farms and warn nearby communities in time. Since the tracking programme began, cases of elephants destroying crops have dropped by half, and no elephant has been killed in retaliation this year.",
    questions: [
      {
        prompt: "Which sentence best paraphrases the main idea of this passage?",
        choices: [
          "Tracking elephants helps rangers protect both wildlife and nearby farms",
          "Elephants are being moved permanently out of the park",
          "Farmers have stopped growing crops near the park",
          "Rangers have given up on protecting elephants",
        ],
        correctIndex: 0,
        explanation: "The passage's main idea — restated in different words — is that tracking elephants protects farms while keeping elephants safe from retaliation.",
      },
      {
        prompt: "According to the passage, what has happened since the tracking programme began?",
        choices: [
          "Crop destruction by elephants has dropped by half and no elephant has been killed in retaliation",
          "All elephants have left the park",
          "Farmers have started hunting elephants",
          "The tracking programme was cancelled",
        ],
        correctIndex: 0,
        explanation: "The passage directly states both outcomes: crop destruction dropped by half, and no elephant has been killed in retaliation this year.",
      },
    ],
    trueFalse: [
      { text: "Rangers use radio collars to track elephants.", isTrue: true },
      { text: "Crop destruction by elephants has dropped by half.", isTrue: true },
      { text: "An elephant was killed in retaliation this year.", isTrue: false },
      { text: "The tracking programme has made no difference at all.", isTrue: false },
    ],
  },
  {
    text: "A stretch of highway near Tsavo is well known for wildlife crossing the road at dusk, especially zebras and giraffes. After several accidents involving vehicles and animals, the county government installed speed bumps and bright warning signs along that stretch. Drivers are now required to slow down between 6 p.m. and 7 p.m., when animals are most likely to cross.",
    questions: [
      {
        prompt: "Which sentence best paraphrases the main idea of this passage?",
        choices: [
          "New safety measures were introduced to reduce accidents between vehicles and crossing wildlife",
          "The highway was permanently closed to all traffic",
          "Wildlife has stopped crossing the highway completely",
          "Drivers are now banned from that stretch of road entirely",
        ],
        correctIndex: 0,
        explanation: "Restated in different words, the passage's main idea is that speed bumps, signs, and a slow-down rule were added to prevent accidents.",
      },
      {
        prompt: "According to the passage, when are animals most likely to cross the highway?",
        choices: ["Between 6 p.m. and 7 p.m.", "Between 12 noon and 1 p.m.", "Only on weekends", "Only during the rainy season"],
        correctIndex: 0,
        explanation: "The passage directly states that drivers must slow down between 6 p.m. and 7 p.m., when animals are most likely to cross.",
      },
    ],
    trueFalse: [
      { text: "Speed bumps and warning signs were installed near Tsavo.", isTrue: true },
      { text: "Drivers must slow down between 6 p.m. and 7 p.m.", isTrue: true },
      { text: "Zebras and giraffes never cross that stretch of highway.", isTrue: false },
      { text: "No accidents ever happened on that stretch of road before the new measures.", isTrue: false },
    ],
  },
];

const VOCAB: { word: string; meaning: string }[] = [
  { word: "conservation", meaning: "The protection and careful management of wildlife and natural resources" },
  { word: "habitat", meaning: "The natural home or environment of an animal or plant" },
  { word: "poaching", meaning: "The illegal hunting or capturing of wild animals" },
  { word: "migration", meaning: "The regular, often seasonal, movement of animals from one area to another" },
  { word: "retaliation", meaning: "Harming something in response to being harmed by it" },
  { word: "paraphrase", meaning: "To restate a text's meaning in different words" },
];

interface FillItem {
  before: string;
  after: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  hint: string;
  explanation: string;
}

const FILL_ITEMS: FillItem[] = [
  {
    before: "Hunters who capture endangered animals illegally are engaging in",
    after: "which conservation laws aim to stop.",
    correctAnswer: "poaching",
    hint: "This word names the illegal hunting or capturing of wild animals.",
    explanation: "'Poaching' is the illegal hunting or capturing of wild animals, which conservation laws are designed to prevent.",
  },
  {
    before: "The natural home where an animal normally lives is called its",
    after: ".",
    correctAnswer: "habitat",
    hint: "Think of the word for an animal's natural home or environment.",
    explanation: "A 'habitat' is the natural home or environment of an animal or plant.",
  },
  {
    before: "When wildebeest move in huge herds from the Serengeti to the Maasai Mara each year, this seasonal movement is called",
    after: ".",
    correctAnswer: "migration",
    hint: "This word describes the regular, often seasonal, movement of animals.",
    explanation: "'Migration' is the regular movement of animals from one area to another, often seasonal.",
  },
  {
    before: "Restating the main idea of a passage in your own words, without changing its meaning, is called",
    after: "the passage.",
    correctAnswer: "paraphrasing",
    acceptedAnswers: ["paraphrase"],
    hint: "This is the reading skill of retelling a text's meaning in different words.",
    explanation: "'Paraphrasing' means restating a text's meaning in different words while keeping the same meaning.",
  },
];

const ROAD_SAFETY_STEPS: { id: string; label: string }[] = [
  { id: "spot", label: "A driver spots wild animals near the road ahead." },
  { id: "slow", label: "The driver slows down well before reaching the animals." },
  { id: "wait", label: "The driver waits for the animals to safely cross." },
  { id: "report", label: "The driver reports the sighting to rangers if required." },
];

export const wildlifeReading: Skill = {
  id: "g8-il-r-wildlife",
  code: "R.3",
  subjectId: "indigenous-language",
  strandId: "g8-il-reading",
  grade: 8,
  title: "Wildlife: extensive reading",
  description: "Build vocabulary about wildlife and practise paraphrasing the main idea from grade-appropriate texts.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "categorize", "match", "fill", "order"] as const);

    if (branch === "mc") {
      const passage = randChoice(rng, PASSAGES);
      const q = randChoice(rng, passage.questions);
      const correctText = q.choices[q.correctIndex];
      const choices = shuffle(rng, q.choices);
      return {
        kind: "multiple-choice",
        passage: passage.text,
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: "For a paraphrase question, look for the choice that restates the passage's overall point without changing its meaning.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const passage = randChoice(rng, PASSAGES);
      const items = passage.trueFalse.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        passage: passage.text,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Check each statement against exactly what the passage says.",
        explanation: passage.trueFalse.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"} according to the passage.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each wildlife vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about protecting animals, their homes, and how they move.",
        explanation: chosen.map((v) => `${v.word} — ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: item.before,
        after: item.after,
        correctAnswer: item.correctAnswer,
        acceptedAnswers: item.acceptedAnswers,
        inputMode: "text",
        hint: item.hint,
        explanation: item.explanation,
      };
    }

    const items = shuffle(rng, ROAD_SAFETY_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange what a careful driver does when wild animals are near the road, in the correct order.",
      instruction: "Click them in order.",
      items,
      correctOrder: ROAD_SAFETY_STEPS.map((s) => s.id),
      hint: "A driver notices the animals first, then reacts safely, and reports the sighting only after passing safely.",
      explanation: ROAD_SAFETY_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
