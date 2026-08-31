import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SOUND_WORDS: { sound: string; symbol: string; word: string }[] = [
  { sound: "ɒ", symbol: "/ɒ/ (as in \"hot\")", word: "hot" },
  { sound: "ɒ", symbol: "/ɒ/ (as in \"hot\")", word: "dog" },
  { sound: "ɒ", symbol: "/ɒ/ (as in \"hot\")", word: "clock" },
  { sound: "ɒ", symbol: "/ɒ/ (as in \"hot\")", word: "shop" },
  { sound: "ɔː", symbol: "/ɔː/ (as in \"saw\")", word: "saw" },
  { sound: "ɔː", symbol: "/ɔː/ (as in \"saw\")", word: "door" },
  { sound: "ɔː", symbol: "/ɔː/ (as in \"saw\")", word: "walk" },
  { sound: "ɔː", symbol: "/ɔː/ (as in \"saw\")", word: "call" },
  { sound: "θ", symbol: "/θ/ (as in \"think\")", word: "think" },
  { sound: "θ", symbol: "/θ/ (as in \"think\")", word: "three" },
  { sound: "θ", symbol: "/θ/ (as in \"think\")", word: "tooth" },
  { sound: "θ", symbol: "/θ/ (as in \"think\")", word: "birthday" },
  { sound: "ð", symbol: "/ð/ (as in \"this\")", word: "this" },
  { sound: "ð", symbol: "/ð/ (as in \"this\")", word: "mother" },
  { sound: "ð", symbol: "/ð/ (as in \"this\")", word: "together" },
  { sound: "ð", symbol: "/ð/ (as in \"this\")", word: "weather" },
];

const SOUND_GROUPS = ["ɒ", "ɔː", "θ", "ð"] as const;
const SOUND_LABELS: Record<string, string> = { "ɒ": "/ɒ/ (hot)", "ɔː": "/ɔː/ (saw)", "θ": "/θ/ (think)", "ð": "/ð/ (this)" };

const CONTEXT_FILL: { before: string; after: string; correctAnswer: string; sound: string }[] = [
  { before: "The woman who gave birth to me is my", after: ".", correctAnswer: "mother", sound: "ð" },
  { before: "One more than two is", after: ".", correctAnswer: "three", sound: "θ" },
  { before: "I check the time by looking at the", after: "on the wall.", correctAnswer: "clock", sound: "ɒ" },
  { before: "Please close the", after: "when you leave the room.", correctAnswer: "door", sound: "ɔː" },
  { before: "Two friends who work well as a team are said to work well", after: ".", correctAnswer: "together", sound: "ð" },
  { before: "A place where you can buy goods is called a", after: ".", correctAnswer: "shop", sound: "ɒ" },
];

const EMPHATIC = [
  { sentence: "She IS my best friend.", stressed: "IS", context: "to strongly confirm the friendship after a peer had questioned it" },
  { sentence: "He NEVER apologised to his friend.", stressed: "NEVER", context: "to emphasise that an apology did not happen at all" },
  { sentence: "I told YOU the secret, not anyone else.", stressed: "YOU", context: "to emphasise exactly which person was told" },
  { sentence: "We WILL make up after this argument.", stressed: "WILL", context: "to show strong determination to reconcile with a friend" },
  { sentence: "It was HER idea, not mine.", stressed: "HER", context: "to make clear which peer the idea belonged to" },
];

export const pronunciationSounds1: Skill = {
  id: "g8-eng-ls-pronunciation-sounds-1",
  code: "LS.5",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Pronunciation: /ɒ/, /ɔː/, /θ/, /ð/ and Emphatic Stress",
  description: "Identify and pronounce words with the sounds /ɒ/, /ɔː/, /θ/ and /ð/, and apply emphatic stress in sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "mc"] as const);
    const hint = "Say the word aloud and feel where your tongue and lips go — /θ/ and /ð/ use the tongue between the teeth, while /ɒ/ and /ɔː/ differ in how long and rounded the vowel is.";

    if (branch === "match") {
      const bySound = SOUND_GROUPS.map((s) => randChoice(rng, SOUND_WORDS.filter((w) => w.sound === s)));
      const tokens = shuffle(rng, bySound.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, bySound.map((w) => ({ id: w.word, label: w.symbol })));
      const correctMap: Record<string, string> = {};
      for (const w of bySound) correctMap[w.word] = w.word;
      return {
        kind: "click-match",
        prompt: "Match each word to the sound it contains.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: bySound.map((w) => `"${w.word}" contains the sound ${w.symbol}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosenSounds = shuffle(rng, [...SOUND_GROUPS]).slice(0, 3);
      const items: { id: string; label: string; sound: string }[] = [];
      for (const s of chosenSounds) {
        const words = shuffle(rng, SOUND_WORDS.filter((w) => w.sound === s)).slice(0, 2);
        for (const w of words) items.push({ id: w.word, label: w.word, sound: s });
      }
      const shuffledItems = shuffle(rng, items);
      const correctBucket: Record<string, string> = {};
      for (const item of shuffledItems) correctBucket[item.id] = item.sound;
      return {
        kind: "categorize",
        prompt: "Sort each word by the sound it contains.",
        items: shuffledItems.map(({ id, label }) => ({ id, label })),
        buckets: chosenSounds.map((s) => ({ id: s, label: SOUND_LABELS[s] })),
        correctBucket,
        hint,
        explanation: shuffledItems.map((item) => `"${item.label}" — ${SOUND_LABELS[item.sound]}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, CONTEXT_FILL);
      return {
        kind: "fill-blank",
        prompt: `Fill in the missing word. It contains the sound ${SOUND_LABELS[entry.sound]}.`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Read the sentence for meaning first, then check that your answer contains the given sound.",
        explanation: `The missing word is "${entry.correctAnswer}", which contains the sound ${SOUND_LABELS[entry.sound]}.`,
      };
    }

    const entry = randChoice(rng, EMPHATIC);
    const distractorWords = entry.sentence
      .replace(/[.,]/g, "")
      .split(" ")
      .filter((w) => w !== entry.stressed && w.length > 1);
    const distractors = shuffle(rng, distractorWords).slice(0, 3);
    const choices = shuffle(rng, [entry.stressed, ...distractors]);
    return {
      kind: "multiple-choice",
      prompt: `In the sentence "${entry.sentence}", which word carries the emphatic stress, used ${entry.context}?`,
      choices,
      correctIndex: choices.indexOf(entry.stressed),
      layout: "row",
      hint: "Emphatic stress is placed on the word that carries the special meaning the speaker wants to highlight.",
      explanation: `The word "${entry.stressed}" is stressed ${entry.context}.`,
    };
  },
};
