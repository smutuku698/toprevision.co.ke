import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedA";

// Theme 2 vocabulary, verbatim from curriculum-reference/grade-6/english.json (Cultural and Religious Celebrations).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "festival", meaning: "a day or period of celebration" },
  { word: "culture", meaning: "the customs and beliefs of a group of people" },
  { word: "annual", meaning: "happening once every year" },
  { word: "tradition", meaning: "a custom passed down through generations" },
  { word: "artist", meaning: "a person who creates art, music or performance" },
  { word: "ethnic", meaning: "relating to a particular community or people group" },
  { word: "folk dance", meaning: "a traditional dance belonging to a community" },
  { word: "folksong", meaning: "a traditional song belonging to a community" },
  { word: "anniversary", meaning: "the date on which an important past event is remembered" },
  { word: "reunion", meaning: "a gathering of people who have been apart" },
  { word: "homecoming", meaning: "a celebration marking someone's return home" },
  { word: "concert", meaning: "a live musical performance" },
  { word: "circumcision", meaning: "a traditional rite of passage ceremony" },
  { word: "guest", meaning: "a person invited to an event" },
  { word: "eulogy", meaning: "a speech praising someone, often at a funeral" },
  { word: "reception", meaning: "a formal social gathering to welcome guests" },
  { word: "hijab", meaning: "a headscarf worn by some Muslim women" },
  { word: "Sunday best", meaning: "one's smartest clothes, worn for special occasions" },
  { word: "Christmas", meaning: "the Christian festival celebrating the birth of Jesus" },
  { word: "Easter", meaning: "the Christian festival celebrating the resurrection of Jesus" },
  { word: "Good Friday", meaning: "the day Christians remember the crucifixion of Jesus" },
  { word: "Diwali", meaning: "the Hindu festival of lights" },
  { word: "Idd-al-Fitr", meaning: "the Muslim festival marking the end of Ramadan fasting" },
  { word: "entertain", meaning: "to provide enjoyment or amusement for guests" },
];

type Expression = { text: string; type: "metaphor" | "idiom" | "proverb" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "Peter is a giraffe — he is so tall", type: "metaphor", meaning: "calling someone a giraffe to show they are very tall" },
  { text: "a red letter day", type: "idiom", meaning: "a very special and memorable day" },
  { text: "kill two birds with one stone", type: "idiom", meaning: "to achieve two things with a single action" },
  { text: "feel at home", type: "idiom", meaning: "to feel comfortable and relaxed somewhere" },
  { text: "charity begins at home", type: "proverb", meaning: "you should look after your own family before helping others" },
  { text: "pass by", type: "phrasal verb", meaning: "to go past something without stopping" },
  { text: "look forward to", type: "phrasal verb", meaning: "to feel excited about something that will happen" },
  { text: "look for", type: "phrasal verb", meaning: "to try to find something" },
  { text: "look at", type: "phrasal verb", meaning: "to direct your eyes towards something" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.2");

const SCENARIOS: { name: (n: string, p: string) => string; correct: string; wrong: string[] }[] = [
  {
    name: (n, p) => `${n}'s cousins from ${p} finally arrived for the big family gathering after two years apart. Which idiom best captures how special this day is for ${n}?`,
    correct: "a red letter day",
    wrong: ["look forward to", "look for", "look at"],
  },
  {
    name: (n) => `${n} sang in the church choir AND visited the sick at the same event during the reunion. Which idiom describes achieving two good things at once?`,
    correct: "kill two birds with one stone",
    wrong: ["feel at home", "pass by", "charity begins at home"],
  },
  {
    name: (n, p) => `Even though ${n} was visiting relatives far from ${p}, the warm welcome made ${n} relax completely. Which idiom fits how ${n} felt?`,
    correct: "feel at home",
    wrong: ["a red letter day", "look forward to", "pass by"],
  },
  {
    name: (n) => `${n} always helps neighbours with festival preparations before sending money to distant relatives. Which proverb explains ${n}'s order of priority?`,
    correct: "charity begins at home",
    wrong: ["kill two birds with one stone", "look at", "pass by"],
  },
];

export const culturalCelebrationsListening: Skill = {
  id: "g6-eng-ls-cultural-celebrations",
  code: "LS.2",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Cultural and Religious Celebrations — Listening",
  description: "Identify words with the sounds /l/ and /r/, use festival and celebration vocabulary correctly, and use a metaphor, idioms, a proverb and phrasal verbs in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "idiom-scenario-mc", "vocab-click-match", "vocab-categorize", "expression-fill-blank"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words starts with the same sound as "${target.sound === "/l/" ? "land" : "rain"}" (${target.sound})?`,
        choices,
        correctIndex: choices.indexOf(target.word),
        layout: "row",
        hint: `Say each word aloud and listen for the ${target.sound} sound at the start.`,
        explanation: `"${target.word}" begins with the sound ${target.sound}.`,
      };
    }

    if (branch === "vocab-meaning-mc") {
      const item = randChoice(rng, VOCAB);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.meaning, ...distractors.map((d) => d.meaning)]);
      return {
        kind: "multiple-choice",
        prompt: `What does the word "${item.word}" mean?`,
        choices,
        correctIndex: choices.indexOf(item.meaning),
        layout: "list",
        hint: "Think about celebrations, festivals and traditions.",
        explanation: `"${item.word}" means: ${item.meaning}.`,
      };
    }

    if (branch === "vocab-scenario-mc") {
      const item = randChoice(rng, VOCAB);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.word, ...distractors.map((d) => d.word)]);
      return {
        kind: "multiple-choice",
        prompt: `${name} in ${place} describes it as: "${item.meaning}." Which word matches?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "Match the description to the exact vocabulary word.",
        explanation: `The word is "${item.word}" — it means ${item.meaning}.`,
      };
    }

    if (branch === "idiom-scenario-mc") {
      const scenario = randChoice(rng, SCENARIOS);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const choices = shuffle(rng, [scenario.correct, ...scenario.wrong]);
      const matched = EXPRESSIONS.find((e) => e.text === scenario.correct)!;
      return {
        kind: "multiple-choice",
        prompt: scenario.name(name, place),
        choices,
        correctIndex: choices.indexOf(scenario.correct),
        layout: "list",
        hint: `Think about what "${scenario.correct}" really means: ${matched.meaning}.`,
        explanation: `"${scenario.correct}" means ${matched.meaning}.`,
      };
    }

    if (branch === "vocab-click-match") {
      const pool = shuffle(rng, VOCAB).slice(0, 6);
      const tokens = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of pool) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each celebration vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Read each meaning carefully — some words describe events, others describe people or clothing.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const religiousFestivals = ["Christmas", "Easter", "Good Friday", "Diwali", "Idd-al-Fitr"];
      const socialWords = ["festival", "annual", "tradition", "folk dance", "folksong", "anniversary", "reunion", "homecoming", "concert", "reception", "entertain", "ethnic"];
      const pool = shuffle(rng, [
        ...religiousFestivals.map((w) => ({ id: w, label: w, bucket: "festival-name" })),
        ...socialWords.map((w) => ({ id: w, label: w, bucket: "celebration-word" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these words: is it the NAME OF A SPECIFIC FESTIVAL, or a GENERAL WORD ABOUT CELEBRATIONS?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "festival-name", label: "Name of a Festival" },
          { id: "celebration-word", label: "General Celebration Word" },
        ],
        correctBucket,
        hint: "A festival name refers to one specific occasion; a general word could describe many celebrations.",
        explanation: "Festival names: Christmas, Easter, Good Friday, Diwali, Idd-al-Fitr. General celebration words: festival, annual, tradition, folk dance, folksong, anniversary, reunion, homecoming, concert, reception, entertain, ethnic.",
      };
    }

    const t = randChoice(rng, FILL_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: `Complete the sentence using the expression "${t.text}".`,
      before: t.before,
      after: t.after,
      correctAnswer: t.text,
      inputMode: "text",
      hint: `This ${t.type} means: ${t.meaning}.`,
      explanation: `"${t.text}" (${t.type}) means ${t.meaning}.`,
    };
  },
};

// Fill-blank pairs where the surrounding sentence genuinely fits the specific expression it names.
const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "a red letter day", type: "idiom", meaning: "a very special and memorable day", before: "The homecoming was ", after: " for the whole family." },
  { text: "kill two birds with one stone", type: "idiom", meaning: "to achieve two things with a single action", before: "By hosting the wedding and the reunion together, they managed to ", after: "." },
  { text: "feel at home", type: "idiom", meaning: "to feel comfortable and relaxed somewhere", before: "The warm welcome at the reception made every guest ", after: "." },
  { text: "charity begins at home", type: "proverb", meaning: "you should look after your own family before helping others", before: "As the saying goes, \"", after: "\" — so help your relatives first." },
  { text: "pass by", type: "phrasal verb", meaning: "to go past something without stopping", before: "The parade was so long that people just watched it ", after: "." },
  { text: "look forward to", type: "phrasal verb", meaning: "to feel excited about something that will happen", before: "Every year, the whole village would ", after: " the annual harvest festival." },
  { text: "look for", type: "phrasal verb", meaning: "to try to find something", before: "At the crowded reception, the guest had to ", after: " a familiar face." },
  { text: "look at", type: "phrasal verb", meaning: "to direct your eyes towards something", before: "The children loved to ", after: " the colourful decorations at the festival." },
];
