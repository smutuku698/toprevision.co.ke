import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface ComprehensionQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface PoemLine {
  id: string;
  label: string;
}

interface Poem {
  text: string;
  lines: PoemLine[]; // in correct order, matches the poem's text
  questions: ComprehensionQuestion[];
  trueFalse: { text: string; isTrue: boolean }[];
}

const POEMS: Poem[] = [
  {
    text: "Lock the gate when strangers pass,\nWear your badge upon your chest,\nWalk, don't run, along the class,\nFire drills teach us to do our best,\nListen well to the guard's advice,\nKeep the exits clear and wide.",
    lines: [
      { id: "l1", label: "Lock the gate when strangers pass," },
      { id: "l2", label: "Wear your badge upon your chest," },
      { id: "l3", label: "Walk, don't run, along the class," },
      { id: "l4", label: "Fire drills teach us to do our best," },
      { id: "l5", label: "Listen well to the guard's advice," },
      { id: "l6", label: "Keep the exits clear and wide." },
    ],
    questions: [
      {
        prompt: "According to the poem, what should pupils do instead of running along the class?",
        choices: ["Walk", "Shout", "Hide", "Climb"],
        correctIndex: 0,
        explanation: "The poem's third line directly says, \"Walk, don't run, along the class.\"",
      },
      {
        prompt: "What is the poem mainly encouraging pupils to do?",
        choices: [
          "Follow safety rules and practices at school",
          "Avoid attending fire drills",
          "Ignore the school guard's instructions",
          "Leave the school gate open for anyone",
        ],
        correctIndex: 0,
        explanation: "Every line of the poem lists a different safety practice, so its overall message is to follow school safety rules.",
      },
    ],
    trueFalse: [
      { text: "The poem tells pupils to lock the gate when strangers pass.", isTrue: true },
      { text: "The poem tells pupils to run along the class.", isTrue: false },
      { text: "The poem mentions fire drills.", isTrue: true },
      { text: "The poem tells pupils to block the exits.", isTrue: false },
    ],
  },
  {
    text: "When the whistle blows at break,\nLine up calmly, no mistake,\nDon't push your friend upon the stair,\nA careless step can cause a scare,\nReport a stranger at the fence,\nSafety starts with common sense.",
    lines: [
      { id: "l1", label: "When the whistle blows at break," },
      { id: "l2", label: "Line up calmly, no mistake," },
      { id: "l3", label: "Don't push your friend upon the stair," },
      { id: "l4", label: "A careless step can cause a scare," },
      { id: "l5", label: "Report a stranger at the fence," },
      { id: "l6", label: "Safety starts with common sense." },
    ],
    questions: [
      {
        prompt: "According to the poem, what should pupils do when the whistle blows at break?",
        choices: ["Line up calmly", "Push their friends", "Climb the fence", "Ignore the whistle"],
        correctIndex: 0,
        explanation: "The poem's second line directly says, \"Line up calmly, no mistake.\"",
      },
      {
        prompt: "What is the poem's main message?",
        choices: [
          "Simple, sensible actions keep pupils safe at school",
          "Whistles should never be used at school",
          "Pupils should avoid all school breaks",
          "Fences are unnecessary at school",
        ],
        correctIndex: 0,
        explanation: "The poem lists several small, sensible actions and closes with \"Safety starts with common sense,\" summing up its main message.",
      },
    ],
    trueFalse: [
      { text: "The poem tells pupils to line up calmly at break.", isTrue: true },
      { text: "The poem tells pupils to report a stranger at the fence.", isTrue: true },
      { text: "The poem tells pupils to push their friends on the stairs.", isTrue: false },
      { text: "The poem says safety has nothing to do with common sense.", isTrue: false },
    ],
  },
];

const VOCAB: { word: string; meaning: string }[] = [
  { word: "vigilant", meaning: "Keeping careful watch for possible danger" },
  { word: "precaution", meaning: "An action taken in advance to prevent harm" },
  { word: "evacuate", meaning: "To leave a place quickly and safely, especially during an emergency" },
  { word: "hazard", meaning: "A source of danger or risk" },
  { word: "guard", meaning: "A person who watches over a place to keep it safe" },
  { word: "drill", meaning: "A practice exercise for responding to an emergency" },
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
    before: "During the fire",
    after: ", every pupil must leave the classroom calmly and quickly.",
    correctAnswer: "drill",
    hint: "This word names a practice exercise for responding to an emergency.",
    explanation: "A 'drill' is a practice exercise, such as a fire drill, for responding to an emergency.",
  },
  {
    before: "A loose electric wire on the school field is a",
    after: "that pupils must report immediately.",
    correctAnswer: "hazard",
    hint: "This word names a source of danger or risk.",
    explanation: "A 'hazard' is a source of danger or risk, such as a loose wire.",
  },
  {
    before: "When the alarm rings, pupils must",
    after: "the building through the nearest exit.",
    correctAnswer: "evacuate",
    hint: "This word means to leave a place quickly and safely during an emergency.",
    explanation: "To 'evacuate' means to leave a place quickly and safely, especially during an emergency.",
  },
  {
    before: "Locking the gate before strangers arrive is a sensible",
    after: "that keeps the school safe.",
    correctAnswer: "precaution",
    hint: "This word names an action taken in advance to prevent harm.",
    explanation: "A 'precaution' is an action taken in advance to prevent harm.",
  },
];

export const safetyPoetryReading: Skill = {
  id: "g8-il-r-safety",
  code: "R.4",
  subjectId: "indigenous-language",
  strandId: "g8-il-reading",
  grade: 8,
  title: "Safety at school: reading for information — poetry",
  description: "Read short poems about school safety, build a safety glossary, and construct sentences using new vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "categorize", "match", "fill", "order"] as const);

    if (branch === "mc") {
      const poem = randChoice(rng, POEMS);
      const q = randChoice(rng, poem.questions);
      const correctText = q.choices[q.correctIndex];
      const choices = shuffle(rng, q.choices);
      return {
        kind: "multiple-choice",
        passage: poem.text,
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: "Reread the poem's lines closely — the answer to a direct question is stated plainly in one of them.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const poem = randChoice(rng, POEMS);
      const items = poem.trueFalse.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        passage: poem.text,
        prompt: "Sort each statement as True or False, based on the poem.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Check each statement against exactly what the poem's lines say.",
        explanation: poem.trueFalse.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"} according to the poem.`).join(" "),
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
        prompt: "Match each school-safety glossary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the words used to describe staying alert and preventing accidents at school.",
        explanation: chosen.map((v) => `${v.word} — ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing safety word.",
        before: item.before,
        after: item.after,
        correctAnswer: item.correctAnswer,
        acceptedAnswers: item.acceptedAnswers,
        inputMode: "text",
        hint: item.hint,
        explanation: item.explanation,
      };
    }

    const poem = randChoice(rng, POEMS);
    const items = shuffle(rng, poem.lines);
    return {
      kind: "ordering",
      prompt: "Arrange the lines of the poem in the correct order.",
      instruction: "Click them in order.",
      items,
      correctOrder: poem.lines.map((l) => l.id),
      hint: "Read each line and think about which idea would naturally come first, and which would close the poem.",
      explanation: poem.lines.map((l) => l.label).join(" / "),
    };
  },
};
