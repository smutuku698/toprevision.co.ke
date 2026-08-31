import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, soundFillBranch } from "./g5LsShared";
import { name, choosePrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 9.0 Communicable Diseases, sub-strand 9.1 Speaking Fluency: Pronunciation.
// Focus: sound /h/, speak accurately at the right speed and with expression, use disease vocabulary,
// display appropriate emotions, make a one-minute speech. See curriculum-reference/grade-5/english.json.

const VOCAB: { word: string; meaning: string; wrong: string[] }[] = [
  { word: "hygiene", meaning: "keeping clean to stay healthy", wrong: ["a kind of medicine", "a doctor's tool", "a type of germ"] },
  { word: "symptoms", meaning: "signs that show you are ill, like a fever or a cough", wrong: ["cures for an illness", "clean water", "healthy habits"] },
  { word: "vaccine", meaning: "an injection that protects you from a disease", wrong: ["a bandage", "a thermometer", "a cough syrup"] },
  { word: "outbreak", meaning: "when many people suddenly catch the same disease", wrong: ["a single sick person", "a healthy village", "a recovery"] },
  { word: "immunity", meaning: "the body's ability to fight off a disease", wrong: ["the speed of an illness", "a hospital ward", "a type of germ"] },
  { word: "epidemic", meaning: "a disease that spreads quickly to very many people", wrong: ["a mild headache", "a clean clinic", "a single cough"] },
];

const SPEECH_STEPS = [
  { id: "s1", label: "Opening: state your topic — 'Today I will talk about how to stop cholera.'" },
  { id: "s2", label: "Point 1: what causes it (dirty water and poor hygiene)" },
  { id: "s3", label: "Point 2: how to prevent it (boil water, wash hands, use a latrine)" },
  { id: "s4", label: "Closing: a short call to action — 'Let us all keep our water clean.'" },
];

const DELIVERY: { desc: string; problem: string; wrong: string[] }[] = [
  { desc: "rushes through the whole speech in twenty seconds so no one can follow", problem: "speaking too fast — slow down and pause between points", wrong: ["speaking too quietly — speak up", "reading in a flat voice — add expression", "using the wrong words — check vocabulary"] },
  { desc: "reads every sentence in the same flat tone, even the warning at the end", problem: "no expression — change your tone for important parts", wrong: ["speaking too fast — slow down", "mispronouncing words — practise them", "speaking too quietly — speak up"] },
  { desc: "says 'hygiene' as 'hi-jeen' and 'epidemic' as 'ep-demic'", problem: "inaccurate pronunciation — practise the tricky words first", wrong: ["speaking too fast — slow down", "no expression — add tone", "speech too long — cut it down"] },
];

export const speakingFluencyPronunciation: Skill = {
  id: "g5-eng-ls-speaking-fluency-pronunciation",
  code: "LS.9",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Speaking Fluency: Sound /h/ and a One-Minute Speech",
  description: "Recognise the sound /h/, use vocabulary about communicable diseases, plan a short spoken presentation, and improve delivery (accuracy, speed and expression).",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-fill", "vocab-mc", "vocab-match", "speech-order", "delivery"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/h/"]);
    if (branch === "sound-fill") return soundFillBranch(rng, "/h/", "hygiene");

    if (branch === "vocab-mc") {
      const v = randChoice(rng, VOCAB);
      const { choices, correctIndex } = mcFromCluster(rng, v.meaning, v.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, `what "${v.word}" means`)}`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think how you would use the word in a sentence about staying healthy.",
        explanation: `"${v.word}" means ${v.meaning}.`,
      };
    }

    if (branch === "vocab-match") {
      const pool = shuffle(rng, VOCAB).slice(0, 5);
      const tokens = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      pool.forEach((v) => (correctMap[v.word] = v.word));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "disease word to its meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud (mind the /h/), then match it.",
        explanation: pool.map((v) => `${v.word}: ${v.meaning}`).join("  "),
      };
    }

    if (branch === "speech-order") {
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the parts of a one-minute speech about preventing a disease"),
        instruction: "Click the parts in the correct order.",
        items: shuffle(rng, SPEECH_STEPS.map((s) => ({ id: s.id, label: s.label }))),
        correctOrder: ["s1", "s2", "s3", "s4"],
        hint: "Open with the topic, give your points, then close with a call to action.",
        explanation: "Opening → cause → prevention → closing call to action.",
      };
    }

    // delivery / sort
    if (rng() < 0.5) {
      const d = randChoice(rng, DELIVERY);
      const { choices, correctIndex } = mcFromCluster(rng, d.problem, d.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `${name(rng)} ${d.desc}.`, "What should they fix?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "Fluent speaking means the right words, at the right speed, with expression.",
        explanation: d.problem,
      };
    }
    const items = shuffle(rng, [
      { id: "a", label: "Speak slowly enough to be understood", k: "good" },
      { id: "b", label: "Change your tone for the important parts", k: "good" },
      { id: "c", label: "Practise the hard words before you start", k: "good" },
      { id: "d", label: "Read every word at top speed in a flat voice", k: "bad" },
      { id: "e", label: "Mumble so no one hears the warning", k: "bad" },
      { id: "f", label: "Guess at words you cannot pronounce", k: "bad" },
    ]);
    const correctBucket: Record<string, string> = {};
    items.forEach((it) => (correctBucket[it.id] = it.k));
    return {
      kind: "categorize",
      prompt: sortPrompt(rng, "whether each habit helps you speak fluently"),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "good", label: "Helps fluent speaking" },
        { id: "bad", label: "Harms fluent speaking" },
      ],
      correctBucket,
      hint: "Right speed, right expression, right pronunciation = fluent.",
      explanation: "Fluent speakers pace themselves, use expression, and prepare tricky words.",
    };
  },
};
