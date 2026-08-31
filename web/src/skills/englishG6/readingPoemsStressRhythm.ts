import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Theme 12 (Environment Conservation) "Intensive Reading — Poems/Songs Stress and Rhythm" sub-strand.
// Includes the theme's own vocabulary/expression lists per the mining guide (words/phrases/proverbs used
// in a song or poem), plus reading-aloud knowledge questions (honest ceiling — no audio in this engine).

const POEM = {
  title: "Save Our Trees",
  text: "Plant a seedling, watch it grow,\nRoots run deep where the clean rivers flow.\nCut not the forest, save the land,\nFuture children need it close at hand.\nAs long as we care, the earth stays green,\nThe best things in life are the ones unseen.",
};

const SONG_WORDS = [
  { word: "seedling", meaning: "a young plant grown from a seed" },
  { word: "roots", meaning: "the underground parts of a plant that absorb water" },
  { word: "forest", meaning: "a large area covered with trees" },
  { word: "conserve", meaning: "to protect from harm or destruction" },
  { word: "reforestation", meaning: "planting trees to replace a lost forest" },
  { word: "gullies", meaning: "deep channels cut into land by running water" },
  { word: "sustain", meaning: "to keep something going over time" },
  { word: "recycle", meaning: "to process waste for reuse" },
  { word: "drought", meaning: "a long period without rain" },
  { word: "wildlife", meaning: "animals living in their natural habitat" },
];

const PROVERBS_IN_POEMS = [
  "the best things in life are free",
  "prevention is better than cure",
  "if you want to be happy for life, plant a tree",
];

// Stress-pattern awareness — words with stress on different syllables, matching "use stress and rhythm
// correctly while reading lines and words in a poem or song."
const STRESS_WORDS: { word: string; stressedSyllable: string; syllables: string[] }[] = [
  { word: "conserve", stressedSyllable: "SERVE", syllables: ["con", "SERVE"] },
  { word: "forest", stressedSyllable: "FOR", syllables: ["FOR", "est"] },
  { word: "reforestation", stressedSyllable: "TA", syllables: ["re", "for", "es", "TA", "tion"] },
  { word: "safeguard", stressedSyllable: "SAFE", syllables: ["SAFE", "guard"] },
  { word: "recycle", stressedSyllable: "CY", syllables: ["re", "CY", "cle"] },
];

export const readingPoemsStressRhythm: Skill = {
  id: "g6-eng-reading-poems-rhythm",
  code: "R.6",
  subjectId: "english",
  strandId: "g6-eng-reading",
  grade: 6,
  title: "Reading Poems and Songs — Stress and Rhythm",
  description: "Identify words, phrases and proverbs used in an environmental-conservation poem, understand how stress and rhythm affect reading aloud, and answer comprehension questions about the poem.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension-mc", "vocab-click-match", "stress-mc", "proverb-mc", "rhythm-importance-mc"] as const);

    if (branch === "comprehension-mc") {
      const questions: { q: string; correct: string; wrong: string[] }[] = [
        { q: "What does the poem ask the reader to plant?", correct: "a seedling", wrong: ["a flag", "a fence", "a signboard"] },
        { q: "According to the poem, why should the forest not be cut?", correct: "because future children need it", wrong: ["because it is illegal everywhere", "because trees are expensive", "because animals dislike it"] },
        { q: "What happens to the earth 'as long as we care', according to the poem?", correct: "it stays green", wrong: ["it turns to desert", "it floods every year", "it becomes rocky"] },
      ];
      const item = randChoice(rng, questions);
      const choices = shuffle(rng, [item.correct, ...item.wrong]);
      return {
        kind: "multiple-choice",
        prompt: item.q,
        passage: POEM.text,
        choices,
        correctIndex: choices.indexOf(item.correct),
        layout: "list",
        hint: "Reread the relevant line of the poem carefully.",
        explanation: `The poem states this directly: "${item.correct}".`,
      };
    }

    if (branch === "vocab-click-match") {
      const pool = shuffle(rng, SONG_WORDS).slice(0, 6);
      const tokens = shuffle(rng, pool.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, pool.map((w) => ({ id: w.word, label: w.meaning })));
      const correctMap: Record<string, string> = {};
      for (const w of pool) correctMap[w.word] = w.word;
      return {
        kind: "click-match",
        prompt: "Match each word that might appear in a conservation poem or song to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "These are conservation-theme words that often appear in poems or songs about protecting the environment.",
        explanation: pool.map((w) => `"${w.word}" means ${w.meaning}.`).join(" "),
      };
    }

    if (branch === "stress-mc") {
      const item = randChoice(rng, STRESS_WORDS);
      const choices = shuffle(rng, item.syllables.map((s) => s.toUpperCase() === s ? s : s));
      const correctDisplay = item.stressedSyllable;
      const wrongDisplay = item.syllables.filter((s) => s.toUpperCase() !== s || s !== item.stressedSyllable).map((s) => s.toLowerCase());
      const distractors = Array.from(new Set(wrongDisplay)).filter((s) => s.toUpperCase() !== correctDisplay).slice(0, 3);
      const mcChoices = shuffle(rng, [correctDisplay.toLowerCase(), ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `In the word "${item.word}", which syllable receives the main stress when read aloud?`,
        choices: mcChoices,
        correctIndex: mcChoices.indexOf(correctDisplay.toLowerCase()),
        layout: "row",
        hint: `Say "${item.word}" aloud slowly and notice which part sounds strongest.`,
        explanation: `In "${item.word}", the syllable "${correctDisplay.toLowerCase()}" is stressed the most when read aloud.`,
      };
    }

    if (branch === "proverb-mc") {
      const proverb = randChoice(rng, PROVERBS_IN_POEMS);
      const meanings: Record<string, string> = {
        "the best things in life are free": "the most valuable things don't cost money",
        "prevention is better than cure": "it is better to stop a problem before it happens",
        "if you want to be happy for life, plant a tree": "long-lasting happiness comes from lasting positive actions",
      };
      const distractors = shuffle(rng, Object.values(meanings).filter((m) => m !== meanings[proverb])).slice(0, 3);
      const choices = shuffle(rng, [meanings[proverb], ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `The poem uses the proverb "${proverb}". What does this proverb mean?`,
        choices,
        correctIndex: choices.indexOf(meanings[proverb]),
        layout: "list",
        hint: "Think about the wisdom behind this traditional saying.",
        explanation: `"${proverb}" means: ${meanings[proverb]}.`,
      };
    }

    return {
      kind: "multiple-choice",
      prompt: "Why is it important to read a poem or song with the correct stress and rhythm, rather than reading every word flatly?",
      choices: (() => {
        const correctOption = "It brings out the poem's rhythm, meaning and emotion, making it more enjoyable and easier to understand";
        return shuffle(rng, [
          correctOption,
          "It makes the poem take much longer to read",
          "It has no real effect on how the poem sounds or is understood",
          "It is only useful for songs, never for poems",
        ]);
      })(),
      correctIndex: (() => 0)(),
      layout: "list",
      hint: "Think about how rhythm and stress affect the sound and feeling of a poem when read aloud.",
      explanation: "Correct stress and rhythm bring out a poem's musical quality and emotional meaning, making it more engaging and easier for a listener to follow — this is why the theme emphasises correct stress and rhythm in reading poems and songs aloud.",
    };
  },
};
