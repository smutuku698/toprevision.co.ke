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
    text: "The annual inter-schools athletics competition took place last month at Kasarani Stadium. Over two hundred schools sent athletes to compete in track and field events, from the 100-metre sprint to the javelin throw. Amina, a Form Two pupil, broke the regional record in the 400-metre race, finishing in under 55 seconds. Her coach said years of early-morning training on hilly terrain had built her stamina.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "An inter-schools athletics competition where a pupil broke a regional record",
          "A stadium that was closed for repairs",
          "A competition cancelled due to rain",
          "A coach who refused to train any athletes",
        ],
        correctIndex: 0,
        explanation: "The passage centres on the athletics competition and Amina's record-breaking run in the 400-metre race.",
      },
      {
        prompt: "Which sentence best summarises this passage?",
        choices: [
          "Amina's early-morning hill training helped her break a regional 400-metre record",
          "Amina lost the 400-metre race badly",
          "The competition had no track events",
          "Amina's coach discouraged her from training",
        ],
        correctIndex: 0,
        explanation: "Condensed into one idea, the passage says Amina's hill training paid off with a regional record in the 400-metre race.",
      },
    ],
    trueFalse: [
      { text: "The competition took place at Kasarani Stadium.", isTrue: true },
      { text: "Amina broke the regional record in the 400-metre race.", isTrue: true },
      { text: "Amina finished the race in over two minutes.", isTrue: false },
      { text: "The competition had fewer than ten schools competing.", isTrue: false },
    ],
  },
  {
    text: "At the village sports day, teams from four neighbouring estates competed in football, netball, and a traditional game called 'bao'. The football final ended in a dramatic penalty shootout, won by the Green Hills team after their goalkeeper saved three consecutive penalties. Organisers say the sports day helps unite the estates and gives young people a healthy way to spend their weekends.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A village sports day that united estates through football, netball, and bao",
          "A sports day cancelled due to lack of interest",
          "A football match with no clear winner",
          "A sports day with only one event",
        ],
        correctIndex: 0,
        explanation: "The passage describes a multi-event sports day meant to unite the four neighbouring estates.",
      },
      {
        prompt: "Which sentence best summarises this passage?",
        choices: [
          "The Green Hills team won a penalty shootout at a sports day meant to unite the estates",
          "The Green Hills team lost every match they played",
          "The sports day only featured traditional games",
          "Organisers cancelled the football final",
        ],
        correctIndex: 0,
        explanation: "Condensed into one idea, the passage says Green Hills won on penalties at a sports day meant to bring the estates together.",
      },
    ],
    trueFalse: [
      { text: "The Green Hills team won the football final on penalties.", isTrue: true },
      { text: "Teams competed in football, netball, and bao.", isTrue: true },
      { text: "The goalkeeper saved zero penalties.", isTrue: false },
      { text: "Only two estates took part in the sports day.", isTrue: false },
    ],
  },
];

const VOCAB: { word: string; meaning: string }[] = [
  { word: "stamina", meaning: "The physical or mental energy to sustain effort over a long period" },
  { word: "opponent", meaning: "A person or team that one competes against" },
  { word: "referee", meaning: "An official who enforces the rules during a game or match" },
  { word: "tournament", meaning: "A series of contests played to decide an overall winner" },
  { word: "teamwork", meaning: "The combined, coordinated effort of a group working together" },
  { word: "sportsmanship", meaning: "Fair and generous behaviour or conduct while competing" },
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
    before: "Years of early-morning training built Amina's ability to sustain effort over the long 400-metre race — in other words, her",
    after: ".",
    correctAnswer: "stamina",
    hint: "This word names the physical energy to sustain effort over time.",
    explanation: "'Stamina' is the physical or mental energy to sustain effort over a long period.",
  },
  {
    before: "The person a competitor plays against in a match is called their",
    after: ".",
    correctAnswer: "opponent",
    hint: "This word names the person or team someone competes against.",
    explanation: "An 'opponent' is a person or team that one competes against.",
  },
  {
    before: "The official who enforces the rules during the football final is the",
    after: ".",
    correctAnswer: "referee",
    hint: "This word names the official who enforces the rules of a game.",
    explanation: "A 'referee' is an official who enforces the rules during a game or match.",
  },
  {
    before: "Shaking hands with the opposing team after losing fairly is an example of good",
    after: ".",
    correctAnswer: "sportsmanship",
    hint: "This word names fair and generous behaviour while competing.",
    explanation: "'Sportsmanship' is fair and generous behaviour or conduct while competing.",
  },
];

const SPORTS_DAY_STEPS: { id: string; label: string }[] = [
  { id: "register", label: "Teams register and warm up before the events begin." },
  { id: "compete", label: "Athletes compete in their scheduled events." },
  { id: "officiate", label: "Referees and judges record the results of each event." },
  { id: "award", label: "Organisers award winners at the closing ceremony." },
];

export const sportsReading: Skill = {
  id: "g8-il-r-sports",
  code: "R.7",
  subjectId: "indigenous-language",
  strandId: "g8-il-reading",
  grade: 8,
  title: "Sports and games: reading for information",
  description: "Answer questions from sports texts, build a personal vocabulary collection, and summarise key ideas.",
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
        hint: "Reread the passage and look for the sentence that answers the question directly.",
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
        prompt: "Match each sports and games word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the words used to describe competitors, officials, and fair play.",
        explanation: chosen.map((v) => `${v.word} — ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing sports word.",
        before: item.before,
        after: item.after,
        correctAnswer: item.correctAnswer,
        acceptedAnswers: item.acceptedAnswers,
        inputMode: "text",
        hint: item.hint,
        explanation: item.explanation,
      };
    }

    const items = shuffle(rng, SPORTS_DAY_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the stages of a sports day in the correct order.",
      instruction: "Click them in order.",
      items,
      correctOrder: SPORTS_DAY_STEPS.map((s) => s.id),
      hint: "Teams must be ready before events start, and awards only come after every result is recorded.",
      explanation: SPORTS_DAY_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
