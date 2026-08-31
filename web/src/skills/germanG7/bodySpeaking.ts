import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

type Tag = "personality" | "physical";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "nett", meaning: "nice", tag: "personality" },
  { word: "freundlich", meaning: "friendly", tag: "personality" },
  { word: "lustig", meaning: "funny", tag: "personality" },
  { word: "klug", meaning: "smart", tag: "personality" },
  { word: "groß", meaning: "tall", tag: "physical" },
  { word: "klein", meaning: "short/small", tag: "physical" },
  { word: "lang", meaning: "long (hair)", tag: "physical" },
  { word: "kurz", meaning: "short (hair)", tag: "physical" },
  { word: "stark", meaning: "strong", tag: "physical" },
  { word: "sportlich", meaning: "athletic", tag: "physical" },
  { word: "lockig", meaning: "curly (hair)", tag: "physical" },
  { word: "glatt", meaning: "straight (hair)", tag: "physical" },
  { word: "dunkel", meaning: "dark", tag: "physical" },
  { word: "hell", meaning: "light-coloured", tag: "physical" },
  { word: "schön", meaning: "beautiful", tag: "physical" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Meine Schwester ist sehr ", after: ".", answer: "nett", gloss: "Meine Schwester ist sehr nett. — My sister is very nice." },
  { before: "Mein Bruder ist sehr ", after: ".", answer: "freundlich", gloss: "Mein Bruder ist sehr freundlich. — My brother is very friendly." },
  { before: "Sie ist ", after: " und lustig.", answer: "klug", gloss: "Sie ist klug und lustig. — She is smart and funny." },
  { before: "Meine Haare sind ", after: ".", answer: "lang", gloss: "Meine Haare sind lang. — My hair is long." },
  { before: "Seine Haare sind ", after: ".", answer: "kurz", gloss: "Seine Haare sind kurz. — His hair is short." },
  { before: "Ihre Haare sind ", after: ".", answer: "lockig", gloss: "Ihre Haare sind lockig. — Her hair is curly." },
  { before: "Meine Haare sind ", after: ".", answer: "glatt", gloss: "Meine Haare sind glatt. — My hair is straight." },
  { before: "Er ist sehr ", after: ".", answer: "groß", gloss: "Er ist sehr groß. — He is very tall." },
  { before: "Sie ist ", after: ".", answer: "klein", gloss: "Sie ist klein. — She is short." },
  { before: "Mein Vater ist sehr ", after: ".", answer: "stark", gloss: "Mein Vater ist sehr stark. — My father is very strong." },
  { before: "Meine Schwester ist sehr ", after: ".", answer: "sportlich", gloss: "Meine Schwester ist sehr sportlich. — My sister is very athletic." },
  { before: "Ihre Augen sind ", after: ".", answer: "dunkel", gloss: "Ihre Augen sind dunkel. — Her eyes are dark." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie", "sieht dein Freund", "aus", "?"], sentence: "Wie sieht dein Freund aus?" },
  { chunks: ["Er ist", "groß", "und freundlich", "."], sentence: "Er ist groß und freundlich." },
  { chunks: ["Meine Haare", "sind", "lang und lockig", "."], sentence: "Meine Haare sind lang und lockig." },
  { chunks: ["Sie ist", "klein", "und sehr nett", "."], sentence: "Sie ist klein und sehr nett." },
  { chunks: ["Mein Vater", "ist", "stark und sportlich", "."], sentence: "Mein Vater ist stark und sportlich." },
];

const SCENARIOS: { situation: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: "You want to compliment a friend's hairstyle.",
    correct: "Deine Haare sehen toll aus!",
    distractors: ["Deine Haare sehen komisch aus.", "Ich mag deine Haare nicht.", "Deine Haare sind hässlich."],
    explanation: "'Deine Haare sehen toll aus!' is a genuine, kind compliment — the other options are unkind or negative, which don't fit describing someone politely.",
  },
  {
    situation: "You are describing your friend's height neutrally in a class presentation.",
    correct: "Mein Freund ist groß.",
    distractors: ["Mein Freund ist viel zu groß.", "Mein Freund ist komisch groß.", "Mein Freund sieht komisch aus."],
    explanation: "'Mein Freund ist groß' is a plain, respectful fact — 'viel zu groß' and 'komisch' add a mocking or judgmental tone that isn't appropriate.",
  },
  {
    situation: "A new student joins your class, and you want to describe them kindly to a friend.",
    correct: "Der neue Schüler ist nett und freundlich.",
    distractors: ["Der neue Schüler sieht komisch aus.", "Der neue Schüler ist zu klein.", "Ich mag den neuen Schüler nicht."],
    explanation: "Describing someone's kind personality is a positive, welcoming choice — the other options are judgmental or unkind.",
  },
  {
    situation: "You want to describe your best friend's personality positively.",
    correct: "Meine beste Freundin ist klug und lustig.",
    distractors: ["Meine beste Freundin ist komisch.", "Meine beste Freundin ist zu ernst.", "Ich beschreibe sie nicht."],
    explanation: "Naming specific positive traits (smart, funny) is a genuine, respectful description — vague or negative comments are not.",
  },
  {
    situation: "Someone asks how your brother looks; he is tall and athletic.",
    correct: "Mein Bruder ist groß und sportlich.",
    distractors: ["Mein Bruder ist zu dünn.", "Mein Bruder sieht seltsam aus.", "Mein Bruder ist hässlich."],
    explanation: "'Groß und sportlich' states neutral, positive facts — the other choices are unkind or judgmental about appearance.",
  },
  {
    situation: "You want to describe your teacher politely.",
    correct: "Unsere Lehrerin ist sehr freundlich.",
    distractors: ["Unsere Lehrerin ist streng und unfreundlich.", "Unsere Lehrerin sieht komisch aus.", "Ich mag unsere Lehrerin nicht."],
    explanation: "A polite description names a genuine positive trait — the other options are negative or dismissive.",
  },
  {
    situation: "A classmate has short hair, and you want to state that fact politely.",
    correct: "Er hat kurze Haare.",
    distractors: ["Seine Haare sehen dumm aus.", "Er sollte längere Haare haben.", "Seine Frisur ist hässlich."],
    explanation: "'Er hat kurze Haare' is a neutral fact — the other options judge or criticise the classmate's appearance.",
  },
  {
    situation: "You describe your grandmother's kindness to a new friend.",
    correct: "Meine Großmutter ist sehr nett.",
    distractors: ["Meine Großmutter ist alt und langsam.", "Meine Großmutter sieht komisch aus.", "Ich beschreibe meine Großmutter nicht gern."],
    explanation: "Naming a kind personality trait is a warm, respectful description — the other choices focus on unkind or dismissive remarks.",
  },
  {
    situation: "You want to describe a friend's curly hair in a neutral, factual way.",
    correct: "Ihre Haare sind lockig.",
    distractors: ["Ihre Haare sehen chaotisch aus.", "Ihre Haare sind hässlich.", "Sie sollte glatte Haare haben."],
    explanation: "'Ihre Haare sind lockig' simply states a fact — the other options judge the hairstyle negatively.",
  },
  {
    situation: "You are asked to describe yourself positively for a class icebreaker.",
    correct: "Ich bin freundlich und sportlich.",
    distractors: ["Ich bin nicht besonders interessant.", "Ich habe nichts Besonderes.", "Ich beschreibe mich nicht gern."],
    explanation: "Naming genuine positive traits about yourself fits an icebreaker — the other options are self-dismissive rather than descriptive.",
  },
];

export const bodySpeaking: Skill = {
  id: "g7-de-ls-body",
  code: "LS.7",
  subjectId: "german",
  strandId: "g7-de-listening-speaking",
  grade: 7,
  title: "My body: describing physical appearances",
  description: "Adjectives for describing people's physical appearance and personality in German, with a focus on respectful, positive descriptions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.word] = w.word;

      return {
        kind: "click-match",
        prompt: "Match each German descriptive word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words describe personality, others describe physical appearance.",
        explanation: chosen.map((w) => `"${w.word}" means "${w.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const personality = shuffle(rng, WORDS.filter((w) => w.tag === "personality"));
      const physical = shuffle(rng, WORDS.filter((w) => w.tag === "physical")).slice(0, 4);
      const items = shuffle(rng, [...personality, ...physical]);
      const correctBucket: Record<string, string> = {};
      for (const w of items) correctBucket[w.word] = w.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as describing Personality or Physical appearance.",
        items: items.map((w) => ({ id: w.word, label: w.word })),
        buckets: [
          { id: "personality", label: "Personality" },
          { id: "physical", label: "Physical appearance" },
        ],
        correctBucket,
        hint: "Personality words describe how someone acts; physical words describe how someone looks.",
        explanation: [...personality, ...physical]
          .map((w) => `"${w.word}" describes ${w.tag === "personality" ? "personality" : "physical appearance"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the German sentence describing someone.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which personality or physical-appearance word fits here.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence describing someone.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Adjectives describing someone usually follow the verb 'ist' or 'sind'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation} Which German sentence should you say?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Choose the option that is a genuine, respectful description, not a mocking or dismissive one.",
      explanation: s.explanation,
    };
  },
};
