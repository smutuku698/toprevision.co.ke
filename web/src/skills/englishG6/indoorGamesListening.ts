import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedB";

// Theme 11 vocabulary, verbatim from curriculum-reference/grade-6/english.json (Sports - Indoor Games).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "sports", meaning: "physical activities involving skill and competition" },
  { word: "volleyball", meaning: "a game where two teams hit a ball over a net" },
  { word: "basketball", meaning: "a game where players score by shooting a ball through a hoop" },
  { word: "wrestling", meaning: "a sport where two people try to force each other to the ground" },
  { word: "gymnasium", meaning: "a room or building for physical exercise" },
  { word: "arena", meaning: "an enclosed area for sports events" },
  { word: "stadium", meaning: "a large structure for sports events with seating" },
  { word: "monopoly", meaning: "a board game about buying and trading property" },
  { word: "lane", meaning: "a marked strip of a track or pool for one competitor" },
  { word: "chess", meaning: "a board game of strategy for two players" },
  { word: "court", meaning: "a marked area for playing games like basketball or tennis" },
  { word: "card room", meaning: "a room set aside for playing card games" },
  { word: "host", meaning: "to organise and hold an event" },
  { word: "draw", meaning: "a game that ends with equal scores" },
  { word: "front runner", meaning: "the competitor most likely to win" },
  { word: "table tennis", meaning: "a game played on a table with small paddles and a ball" },
  { word: "badminton", meaning: "a game played with rackets and a shuttlecock" },
  { word: "netball", meaning: "a team game similar to basketball, played mostly by women" },
  { word: "boxing", meaning: "a sport where two people fight using their fists" },
  { word: "swimming", meaning: "the sport of moving through water using the body" },
  { word: "compete", meaning: "to take part in a contest" },
  { word: "hobby", meaning: "an activity done regularly for enjoyment" },
];

type Expression = { text: string; type: "fixed phrase" | "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "out of breath", type: "fixed phrase", meaning: "breathing hard after exercise" },
  { text: "as bright as day", type: "simile", meaning: "very clear or obvious" },
  { text: "Lodunga is a deer. He runs very fast", type: "metaphor", meaning: "calling someone a deer to show they run very fast" },
  { text: "get a head start", type: "idiom", meaning: "to begin before others, gaining an advantage" },
  { text: "look before you leap", type: "proverb", meaning: "think carefully before acting" },
  { text: "pass round", type: "phrasal verb", meaning: "to give something to each person in a group in turn" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.11");

const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "out of breath", type: "fixed phrase", meaning: "breathing hard after exercise", before: "After the long basketball match, the players were completely ", after: "." },
  { text: "get a head start", type: "idiom", meaning: "to begin before others, gaining an advantage", before: "The front runner in the swimming lane managed to ", after: " before the whistle." },
  { text: "look before you leap", type: "proverb", meaning: "think carefully before acting", before: "The coach warned the players, \"", after: "\" before attempting the risky move." },
  { text: "pass round", type: "phrasal verb", meaning: "to give something to each person in a group in turn", before: "During the chess club meeting, they decided to ", after: " the trophy for everyone to see." },
];

export const indoorGamesListening: Skill = {
  id: "g6-eng-ls-indoor-games",
  code: "LS.11",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Indoor Games — Listening",
  description: "Identify words with the sounds /ʊ/ and /uː/, interpret non-verbal cues, use sports and indoor-game vocabulary correctly, and use a simile, metaphor, idiom, proverb and phrasal verb in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "vocab-click-match", "vocab-categorize", "fill-blank", "expression-meaning-mc"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words has the same vowel sound as in "${target.sound === "/ʊ/" ? "book" : "moon"}" (${target.sound})?`,
        choices,
        correctIndex: choices.indexOf(target.word),
        layout: "row",
        hint: `Say each word aloud and listen for the ${target.sound} sound.`,
        explanation: `"${target.word}" contains the sound ${target.sound}.`,
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
        hint: "Think about indoor games, sports and competitions.",
        explanation: `"${item.word}" means: ${item.meaning}.`,
      };
    }

    if (branch === "vocab-scenario-mc") {
      const item = randChoice(rng, VOCAB);
      const name = randChoice(rng, KENYAN_NAMES);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.word, ...distractors.map((d) => d.word)]);
      return {
        kind: "multiple-choice",
        prompt: `${name}'s coach explains: "${item.meaning}." Which word matches this?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "Match the description to the exact vocabulary word.",
        explanation: `The word is "${item.word}" — it means ${item.meaning}.`,
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
        prompt: "Match each sports/indoor-games vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words name a specific game, others name a place or a competition term.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const gameNames = ["volleyball", "basketball", "wrestling", "monopoly", "chess", "table tennis", "badminton", "netball", "boxing", "swimming"];
      const placeWords = ["gymnasium", "arena", "stadium", "court", "card room"];
      const pool = shuffle(rng, [
        ...gameNames.map((w) => ({ id: w, label: w, bucket: "game" })),
        ...placeWords.map((w) => ({ id: w, label: w, bucket: "place" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these words: is it the NAME OF A GAME/SPORT, or a PLACE where sports happen?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "game", label: "Name of a Game/Sport" },
          { id: "place", label: "Place" },
        ],
        correctBucket,
        hint: "A game name is something you play; a place word names where it happens.",
        explanation: "Game names: volleyball, basketball, wrestling, monopoly, chess, table tennis, badminton, netball, boxing, swimming. Place words: gymnasium, arena, stadium, court, card room.",
      };
    }

    if (branch === "fill-blank") {
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
    }

    const item = randChoice(rng, EXPRESSIONS);
    const distractors = shuffle(rng, EXPRESSIONS.filter((e) => e.text !== item.text)).slice(0, 3);
    const choices = shuffle(rng, [item.meaning, ...distractors.map((d) => d.meaning)]);
    return {
      kind: "multiple-choice",
      prompt: `What does the expression "${item.text}" mean?`,
      choices,
      correctIndex: choices.indexOf(item.meaning),
      layout: "list",
      hint: `This is a${["a", "e", "i", "o", "u"].includes(item.type[0]) ? "n" : ""} ${item.type}.`,
      explanation: `"${item.text}" (${item.type}) means ${item.meaning}.`,
    };
  },
};
