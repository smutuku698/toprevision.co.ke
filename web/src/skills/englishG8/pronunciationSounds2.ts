import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SOUND_WORDS: { sound: string; symbol: string; word: string }[] = [
  { sound: "ɑː", symbol: "/ɑː/ (as in \"car\")", word: "car" },
  { sound: "ɑː", symbol: "/ɑː/ (as in \"car\")", word: "father" },
  { sound: "ɑː", symbol: "/ɑː/ (as in \"car\")", word: "garden" },
  { sound: "ɑː", symbol: "/ɑː/ (as in \"car\")", word: "heart" },
  { sound: "ɜː", symbol: "/ɜː/ (as in \"bird\")", word: "bird" },
  { sound: "ɜː", symbol: "/ɜː/ (as in \"bird\")", word: "nurse" },
  { sound: "ɜː", symbol: "/ɜː/ (as in \"bird\")", word: "learn" },
  { sound: "ɜː", symbol: "/ɜː/ (as in \"bird\")", word: "first" },
  { sound: "tʃ", symbol: "/tʃ/ (as in \"chair\")", word: "chair" },
  { sound: "tʃ", symbol: "/tʃ/ (as in \"chair\")", word: "church" },
  { sound: "tʃ", symbol: "/tʃ/ (as in \"chair\")", word: "kitchen" },
  { sound: "tʃ", symbol: "/tʃ/ (as in \"chair\")", word: "champion" },
  { sound: "dʒ", symbol: "/dʒ/ (as in \"judge\")", word: "judge" },
  { sound: "dʒ", symbol: "/dʒ/ (as in \"judge\")", word: "journey" },
  { sound: "dʒ", symbol: "/dʒ/ (as in \"judge\")", word: "courage" },
  { sound: "dʒ", symbol: "/dʒ/ (as in \"judge\")", word: "village" },
];

const SOUND_GROUPS = ["ɑː", "ɜː", "tʃ", "dʒ"] as const;
const SOUND_LABELS: Record<string, string> = { "ɑː": "/ɑː/ (car)", "ɜː": "/ɜː/ (bird)", "tʃ": "/tʃ/ (chair)", "dʒ": "/dʒ/ (judge)" };

const CONTEXT_FILL: { before: string; after: string; correctAnswer: string; sound: string }[] = [
  { before: "A person who treats sick people in a hospital, especially at night, is a", after: ".", correctAnswer: "nurse", sound: "ɜː" },
  { before: "The building where people go to worship on Sunday is called a", after: ".", correctAnswer: "church", sound: "tʃ" },
  { before: "A long trip from one place to another is called a", after: ".", correctAnswer: "journey", sound: "dʒ" },
  { before: "The area outside a house where flowers and vegetables grow is called the", after: ".", correctAnswer: "garden", sound: "ɑː" },
  { before: "The organ that pumps blood around your body is your", after: ".", correctAnswer: "heart", sound: "ɑː" },
  { before: "The room where food is cooked is called the", after: ".", correctAnswer: "kitchen", sound: "tʃ" },
];

const SENTENCE_STRESS_EXAMPLES = [
  { sentence: "The brave hero fought bravely for freedom in his village.", words: ["The", "brave", "hero", "fought", "bravely", "for", "freedom", "in", "his", "village"], content: ["brave", "hero", "fought", "bravely", "freedom", "village"], function: ["The", "for", "in", "his"] },
  { sentence: "She showed great courage during her long journey home.", words: ["She", "showed", "great", "courage", "during", "her", "long", "journey", "home"], content: ["showed", "great", "courage", "long", "journey", "home"], function: ["She", "during", "her"] },
  { sentence: "The champion always trains hard before every match.", words: ["The", "champion", "always", "trains", "hard", "before", "every", "match"], content: ["champion", "always", "trains", "hard", "every", "match"], function: ["The", "before"] },
];

const STRESS_MC: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why are some words said with greater force (stressed) than others in a sentence?",
    correct: "Because content words that carry the main meaning are usually stressed, while function words are usually unstressed",
    distractors: ["Because longer words are always stressed no matter their role", "Because every word in a sentence should be stressed equally", "Because only the first word of a sentence is ever stressed"],
  },
  {
    q: "Why do we pronounce some words differently from others in a sentence?",
    correct: "Because stress falls on the words that carry the most important meaning, changing how strongly they are pronounced",
    distractors: ["Because it depends only on how many letters the word has", "Because words at the end of a sentence are never pronounced clearly", "Because pronunciation never changes within a sentence"],
  },
  {
    q: "Which type of word usually receives stress in a sentence?",
    correct: "Content words, such as main nouns, verbs, adjectives and adverbs",
    distractors: ["Function words, such as articles and prepositions", "Only words with more than one syllable", "Only the very last word in the sentence"],
  },
];

export const pronunciationSounds2: Skill = {
  id: "g8-eng-ls-pronunciation-sounds-2",
  code: "LS.9",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Pronunciation: Vowels, Consonants and Stress",
  description: "Identify and pronounce the sounds /ɑː/, /ɜː/, /tʃ/ and /dʒ/, and apply stress correctly to content and function words.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "stress-cat", "mc"] as const);
    const hint = "Content words (nouns, main verbs, adjectives, adverbs) carry the main meaning and are stressed; function words (articles, prepositions, pronouns) are usually left unstressed.";

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
        hint: "Say each word aloud and listen for its vowel or consonant sound.",
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
        hint: "Say each word aloud and listen for its vowel or consonant sound.",
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

    if (branch === "stress-cat") {
      const ex = randChoice(rng, SENTENCE_STRESS_EXAMPLES);
      const content = shuffle(rng, ex.content).slice(0, 3);
      const func = shuffle(rng, ex.function).slice(0, Math.min(3, ex.function.length));
      const items = shuffle(rng, [
        ...content.map((label, i) => ({ id: `c${i}`, label, bucket: "content" })),
        ...func.map((label, i) => ({ id: `f${i}`, label, bucket: "function" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each word from the sentence into Content word (stressed) or Function word (unstressed).",
        passage: `"${ex.sentence}"`,
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "content", label: "Content word (stressed)" },
          { id: "function", label: "Function word (unstressed)" },
        ],
        correctBucket,
        hint,
        explanation: `Content words (stressed): ${content.join(", ")}. Function words (unstressed): ${func.join(", ")}.`,
      };
    }

    const entry = randChoice(rng, STRESS_MC);
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
