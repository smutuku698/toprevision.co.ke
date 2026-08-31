import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedB";

// Theme 10 vocabulary, verbatim from curriculum-reference/grade-6/english.json (Proper Use of Leisure Time).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "holiday", meaning: "a period of rest or travel away from routine" },
  { word: "enjoy", meaning: "to take pleasure in something" },
  { word: "drugs", meaning: "substances, often harmful, that affect the body or mind" },
  { word: "recreation", meaning: "activity done for enjoyment during free time" },
  { word: "leisure", meaning: "free time" },
  { word: "pastime", meaning: "an activity done for pleasure in spare time" },
  { word: "vacation", meaning: "a period of leisure time away from work or school" },
  { word: "relax", meaning: "to rest and become less tense" },
  { word: "loiter", meaning: "to stand around without a clear purpose" },
  { word: "waste", meaning: "to use something carelessly or without benefit" },
  { word: "squander", meaning: "to waste something carelessly, especially time or money" },
  { word: "idle", meaning: "not active or in use" },
  { word: "pleasure", meaning: "a feeling of happiness or satisfaction" },
  { word: "hobbies", meaning: "activities done regularly for enjoyment" },
  { word: "bully", meaning: "to intimidate or hurt someone weaker" },
  { word: "misconduct", meaning: "unacceptable or improper behaviour" },
  { word: "stroll", meaning: "to walk in a slow, relaxed way" },
  { word: "insult", meaning: "a disrespectful remark" },
  { word: "blackmail", meaning: "to force someone to do something by threatening them" },
  { word: "exercise", meaning: "physical activity done to stay healthy" },
  { word: "sports", meaning: "physical activities involving skill and competition" },
  { word: "games", meaning: "activities played for enjoyment, often with rules" },
  { word: "picnic", meaning: "an outdoor meal eaten as a leisure activity" },
];

type Expression = { text: string; type: "fixed phrase" | "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "kill time", type: "idiom", meaning: "to do something to pass time while waiting" },
  { text: "sleep like a log", type: "simile", meaning: "to sleep very deeply" },
  { text: "My mother is hawk eyed. She sees everything", type: "metaphor", meaning: "calling someone hawk-eyed to show they notice everything" },
  { text: "there is no time like the present", type: "proverb", meaning: "the best time to act is now" },
  { text: "day dream", type: "idiom", meaning: "to have pleasant thoughts unrelated to the present situation" },
  { text: "good at", type: "fixed phrase", meaning: "skilled in doing something" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.10");

// The theme's core outcome — polite interruption/turn-taking — given 4 distinct scenario framings.
const TURN_TAKING_PAIRS: { scenario: (n: string) => string; polite: string; rude: string }[] = [
  {
    scenario: (n) => `${n} wants to add a point during a group discussion about hobbies. Which way of joining in is more polite?`,
    polite: "Excuse me, may I add something to that?",
    rude: "Stop talking, it's my turn now.",
  },
  {
    scenario: (n) => `${n} disagrees with a friend's opinion about how to spend free time. Which response shows better turn-taking manners?`,
    polite: "That's interesting — could I share a different view once you finish?",
    rude: "That's wrong, let me talk now.",
  },
  {
    scenario: (n) => `During a debate about screen time, ${n} wants to interrupt with an urgent point. Which is the more courteous way to do it?`,
    polite: "Sorry to interrupt, but I have something important to add.",
    rude: "*talks over the speaker without saying anything*",
  },
  {
    scenario: (n) => `${n} has been waiting patiently to speak during story time. Which shows good turn-taking?`,
    polite: "May I go next, please?",
    rude: "Me! Me! I want to go now!",
  },
];

const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "kill time", type: "idiom", meaning: "to do something to pass time while waiting", before: "While waiting for the bus, the children played a game to ", after: "." },
  { text: "sleep like a log", type: "simile", meaning: "to sleep very deeply", before: "After a full day of sports and games, he was so tired he began to ", after: "." },
  { text: "there is no time like the present", type: "proverb", meaning: "the best time to act is now", before: "Instead of squandering the holiday, she decided \"", after: "\" was true and started her hobby right away." },
  { text: "day dream", type: "idiom", meaning: "to have pleasant thoughts unrelated to the present situation", before: "During the long lesson, the tired pupil began to ", after: " about the coming vacation." },
  { text: "good at", type: "fixed phrase", meaning: "skilled in doing something", before: "During leisure time, she discovered she was really ", after: " chess." },
];

export const leisureTimeTurnTaking: Skill = {
  id: "g6-eng-ls-leisure-time",
  code: "LS.10",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Proper Use of Leisure Time — Turn-Taking",
  description: "Identify words with the sounds /h/, /j/ and /eə/, judge polite turn-taking and interruption, use leisure-time vocabulary correctly, and use an idiom, simile, metaphor and proverb in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "turn-taking-mc", "vocab-click-match", "vocab-categorize", "fill-blank"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words has the same sound as in "${target.sound === "/h/" ? "holiday" : target.sound === "/j/" ? "yam" : "air"}" (${target.sound})?`,
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
        hint: "Think about free time, hobbies and good vs. bad ways to spend it.",
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
        prompt: `${name} explains to a friend: "${item.meaning}." Which word matches this?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "Match the description to the exact vocabulary word.",
        explanation: `The word is "${item.word}" — it means ${item.meaning}.`,
      };
    }

    if (branch === "turn-taking-mc") {
      const pair = randChoice(rng, TURN_TAKING_PAIRS);
      const name = randChoice(rng, KENYAN_NAMES);
      const choices = shuffle(rng, [pair.polite, pair.rude]);
      return {
        kind: "multiple-choice",
        prompt: pair.scenario(name),
        choices,
        correctIndex: choices.indexOf(pair.polite),
        layout: "list",
        hint: "Polite turn-taking waits for a pause and uses respectful words before speaking.",
        explanation: `"${pair.polite}" is polite turn-taking, while the other option interrupts rudely without asking.`,
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
        prompt: "Match each leisure-time vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words describe good ways to relax, others describe negative behaviour.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const goodWords = ["recreation", "leisure", "pastime", "relax", "pleasure", "hobbies", "exercise", "sports", "games", "picnic"];
      const badWords = ["drugs", "loiter", "waste", "squander", "idle", "bully", "misconduct", "insult", "blackmail"];
      const pool = shuffle(rng, [
        ...goodWords.map((w) => ({ id: w, label: w, bucket: "good" })),
        ...badWords.map((w) => ({ id: w, label: w, bucket: "bad" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these words: is it a GOOD way to use leisure time, or a HARMFUL behaviour?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "good", label: "Good Use of Leisure Time" },
          { id: "bad", label: "Harmful Behaviour" },
        ],
        correctBucket,
        hint: "A good word describes healthy relaxation; a harmful word describes wasted or damaging behaviour.",
        explanation: "Good words: recreation, leisure, pastime, relax, pleasure, hobbies, exercise, sports, games, picnic. Harmful words: drugs, loiter, waste, squander, idle, bully, misconduct, insult, blackmail.",
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
