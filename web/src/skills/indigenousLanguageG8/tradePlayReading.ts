import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface ComprehensionQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface PlayExcerpt {
  text: string;
  questions: ComprehensionQuestion[];
  trueFalse: { text: string; isTrue: boolean }[];
}

const PLAYS: PlayExcerpt[] = [
  {
    text: "NAFULA: I have brought three baskets of millet. I need salt and a length of cloth in exchange.\nOMONDI: Three baskets of millet is generous. I can give you two blocks of salt and enough cloth for a wrap.\nNAFULA: That is a fair exchange. Let us trade before the sun sets.",
    questions: [
      {
        prompt: "What does Nafula bring to trade?",
        choices: ["Three baskets of millet", "Two blocks of salt", "A length of cloth", "A herd of goats"],
        correctIndex: 0,
        explanation: "Nafula's opening line states directly, \"I have brought three baskets of millet.\"",
      },
      {
        prompt: "Which sentence best summarises this excerpt?",
        choices: [
          "Nafula and Omondi barter millet for salt and cloth",
          "Nafula refuses to trade with Omondi",
          "Omondi steals Nafula's millet",
          "Nafula and Omondi argue without reaching an agreement",
        ],
        correctIndex: 0,
        explanation: "The whole excerpt, condensed into one idea, is that Nafula and Omondi agree to barter millet for salt and cloth.",
      },
    ],
    trueFalse: [
      { text: "Nafula brings three baskets of millet to trade.", isTrue: true },
      { text: "Omondi offers salt and cloth in exchange.", isTrue: true },
      { text: "Nafula and Omondi fail to agree on a trade.", isTrue: false },
      { text: "Omondi refuses to give Nafula anything.", isTrue: false },
    ],
  },
  {
    text: "KIPCHOGE: My cattle need a new bell. Do you have one made of iron?\nWANJALA: I have two, forged by my own hands. I would trade one for a sack of your finest sorghum.\nKIPCHOGE: Agreed. My sorghum for your iron bell, a fair bargain for us both.",
    questions: [
      {
        prompt: "What does Kipchoge want from Wanjala?",
        choices: ["An iron bell for his cattle", "A sack of sorghum", "A basket of millet", "A length of cloth"],
        correctIndex: 0,
        explanation: "Kipchoge's opening line asks, \"Do you have one made of iron?\", referring to a bell for his cattle.",
      },
      {
        prompt: "Which sentence best summarises this excerpt?",
        choices: [
          "Kipchoge trades sorghum for one of Wanjala's iron bells",
          "Wanjala refuses to sell any bells",
          "Kipchoge steals a bell from Wanjala",
          "Kipchoge and Wanjala fail to strike a bargain",
        ],
        correctIndex: 0,
        explanation: "The whole excerpt, condensed into one idea, is that Kipchoge trades a sack of sorghum for one of Wanjala's iron bells.",
      },
    ],
    trueFalse: [
      { text: "Wanjala forged the iron bells himself.", isTrue: true },
      { text: "Kipchoge offers sorghum in exchange for a bell.", isTrue: true },
      { text: "Wanjala has no iron bells to trade.", isTrue: false },
      { text: "Kipchoge and Wanjala do not reach an agreement.", isTrue: false },
    ],
  },
];

const VOCAB: { word: string; meaning: string }[] = [
  { word: "barter", meaning: "To exchange goods or services directly without using money" },
  { word: "bargain", meaning: "An agreement reached after negotiating a price or exchange" },
  { word: "exchange", meaning: "To give one thing and receive another in return" },
  { word: "forge", meaning: "To shape metal by heating and hammering it" },
  { word: "commodity", meaning: "A good that can be bought, sold, or traded" },
  { word: "negotiate", meaning: "To discuss something in order to reach an agreement" },
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
    before: "Trading millet directly for salt, without using any money, is an example of",
    after: ".",
    correctAnswer: "barter",
    hint: "This word names exchanging goods directly without money.",
    explanation: "'Barter' means to exchange goods or services directly without using money.",
  },
  {
    before: "Wanjala heats and hammers iron into bells; in other words, he",
    after: "the metal.",
    correctAnswer: "forges",
    acceptedAnswers: ["forge"],
    hint: "This word names the action of shaping metal by heating and hammering it.",
    explanation: "To 'forge' metal means to shape it by heating and hammering it.",
  },
  {
    before: "When Nafula and Omondi discuss and agree on a fair trade, they",
    after: ".",
    correctAnswer: "negotiate",
    hint: "This word means to discuss something in order to reach an agreement.",
    explanation: "To 'negotiate' means to discuss something in order to reach an agreement, as Nafula and Omondi do.",
  },
  {
    before: "An agreement reached after both traders are satisfied with the exchange is called a",
    after: ".",
    correctAnswer: "bargain",
    hint: "This word names an agreement reached after negotiating.",
    explanation: "A 'bargain' is an agreement reached after negotiating a price or exchange.",
  },
];

const TRADE_STEPS: { id: string; label: string }[] = [
  { id: "offer", label: "A trader states what goods they have brought." },
  { id: "request", label: "The trader states what they want in exchange." },
  { id: "negotiate", label: "Both traders discuss until they agree on fair terms." },
  { id: "exchange", label: "The traders hand over their goods to complete the deal." },
];

export const tradePlayReading: Skill = {
  id: "g8-il-r-trade",
  code: "R.6",
  subjectId: "indigenous-language",
  strandId: "g8-il-reading",
  grade: 8,
  title: "Indigenous trade: reading for comprehension — play",
  description: "Read short play excerpts about indigenous trade, build vocabulary, and summarise and respond to questions.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "categorize", "match", "fill", "order"] as const);

    if (branch === "mc") {
      const play = randChoice(rng, PLAYS);
      const q = randChoice(rng, play.questions);
      const correctText = q.choices[q.correctIndex];
      const choices = shuffle(rng, q.choices);
      return {
        kind: "multiple-choice",
        passage: play.text,
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: "Reread the dialogue closely — each character's lines reveal what they bring and what they want.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const play = randChoice(rng, PLAYS);
      const items = play.trueFalse.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        passage: play.text,
        prompt: "Sort each statement as True or False, based on the play excerpt.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Check each statement against exactly what the characters say.",
        explanation: play.trueFalse.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"} according to the excerpt.`).join(" "),
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
        prompt: "Match each indigenous-trade word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about how traders in the play exchange goods without using money.",
        explanation: chosen.map((v) => `${v.word} — ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing trade word.",
        before: item.before,
        after: item.after,
        correctAnswer: item.correctAnswer,
        acceptedAnswers: item.acceptedAnswers,
        inputMode: "text",
        hint: item.hint,
        explanation: item.explanation,
      };
    }

    const items = shuffle(rng, TRADE_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the stages of a barter trade in the correct order.",
      instruction: "Click them in order.",
      items,
      correctOrder: TRADE_STEPS.map((s) => s.id),
      hint: "A trader states what they have before saying what they want, and the goods only change hands once both sides agree.",
      explanation: TRADE_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
