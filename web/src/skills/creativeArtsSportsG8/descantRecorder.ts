import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TECHNIQUES = [
  { id: "fingering", label: "Fingering", meaning: "Covering and uncovering the finger holes in the correct combination to sound each note" },
  { id: "pinching", label: "Pinching", meaning: "Slightly narrowing the thumb hole to help sound the higher, second-octave notes" },
  { id: "slurring", label: "Slurring", meaning: "Playing two or more notes smoothly in one breath, without re-tonguing each note" },
  { id: "embouchure", label: "Embouchure", meaning: "The position and shape of the mouth and lips around the mouthpiece" },
  { id: "tonguing", label: "Tonguing", meaning: "Using the tongue to start and separate each note clearly, often by saying 'tu' or 'du'" },
  { id: "blowing", label: "Blowing", meaning: "Controlling the speed and steadiness of breath to keep the tone even and in tune" },
];

const DIRECTIONS = [
  { label: "'Da capo al fine' means go back to the beginning of the piece and play until the word 'fine'.", bucket: "direction" },
  { label: "'Dal segno al fine' means go back to the sign (%) and play until the word 'fine'.", bucket: "direction" },
];

const TECHNIQUE_STATEMENTS = TECHNIQUES.map((t) => ({ label: `${t.label}: ${t.meaning}`, bucket: "technique" }));

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "What is embouchure when playing a descant recorder?", correct: "The position and shape of the mouth and lips around the mouthpiece", distractors: ["The way the fingers are placed on the finger holes", "The speed at which the piece is played", "The material the recorder is made from"] },
  { q: "What does tonguing achieve when playing the recorder?", correct: "It starts and separates each note clearly using the tongue", distractors: ["It changes which note is being played", "It only affects how loudly a note sounds", "It has no effect on the sound produced"] },
  { q: "What is the purpose of pinching on a descant recorder?", correct: "It helps sound the higher, second-octave notes by slightly narrowing the thumb hole", distractors: ["It lowers every note by one octave", "It is used only to clean the recorder", "It has no musical effect at all"] },
  { q: "What does 'da capo al fine' instruct a performer to do?", correct: "Go back to the beginning of the piece and play until the word 'fine'", distractors: ["Skip immediately to the very last note", "Play the piece twice as fast", "Repeat only the final bar"] },
  { q: "What does 'dal segno al fine' instruct a performer to do?", correct: "Go back to the sign (%) marked earlier in the piece and play until the word 'fine'", distractors: ["Go back all the way to the beginning of the piece", "Stop playing immediately", "Play the piece one octave higher"] },
  { q: "Why is applying the correct technique important when playing a descant recorder?", correct: "It produces a clear, in-tune, well-controlled sound and allows correct interpretation of the music", distractors: ["Technique has no real effect on the sound produced", "It only matters for performing in G major", "It is only relevant for reading performance directions, not for the sound itself"] },
];

const MATCH_PROMPTS = [
  "Match each descant recorder technique to its correct meaning.",
  "Pair each technique below with its correct meaning.",
  "Match each technique to what it describes.",
  "Connect each recorder technique to its correct meaning.",
  "For each technique below, choose its matching meaning.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into Playing technique or Performance direction.",
  "Which category does each item below belong to? Sort them.",
  "Classify each item as Playing technique or Performance direction.",
  "Decide whether each item is a technique or direction, and sort it.",
  "Sort these items by the category they belong to.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Complete the meaning of this performance direction.",
  "Fill in the missing word for this performance direction.",
  "Complete this sentence about the performance direction.",
  "Fill in the blank about this performance direction.",
  "Complete the sentence with the correct word.",
] as const;

export const descantRecorder: Skill = {
  id: "g8-cas-descant-recorder",
  code: "C.7",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Descant Recorder",
  description: "Playing techniques (fingering, pinching, slurring, embouchure, tonguing, blowing) and performance directions such as da capo al fine.",
  generate(rng) {
    const branch = randChoice(rng, ["terms-match", "categorize", "fill-blank", "theory-mc"] as const);

    if (branch === "terms-match") {
      const chosen = shuffle(rng, TECHNIQUES);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Fingering and pinching involve the hands; embouchure, tonguing, and blowing involve the mouth and breath.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const techPicks = shuffle(rng, TECHNIQUE_STATEMENTS).slice(0, 3);
      const items = shuffle(rng, [...techPicks, ...DIRECTIONS]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((item) => ({ id: item.label, label: item.label })),
        buckets: [
          { id: "technique", label: "Playing technique" },
          { id: "direction", label: "Performance direction" },
        ],
        correctBucket,
        hint: "A technique controls how a note is physically produced; a performance direction tells you where to play next.",
        explanation: items.map((item) => `"${item.label}" is a ${item.bucket === "technique" ? "playing technique" : "performance direction"}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const isDaCapo = rng() < 0.5;
      const term = isDaCapo ? "Da capo al fine" : "Dal segno al fine";
      const where = isDaCapo ? "beginning" : "sign (%)";
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: `"${term}" means go back to the`,
        after: `and play until the word "fine".`,
        correctAnswer: where,
        acceptedAnswers: isDaCapo ? ["start", "the beginning"] : ["sign", "the sign"],
        inputMode: "text",
        hint: `${isDaCapo ? "'Capo' refers to the head/start of the piece." : "The sign (%) marks a specific point earlier in the piece."}`,
        explanation: `"${term}" instructs the performer to return to the ${where} and play until reaching the word "fine".`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Technique terms describe physical control; performance directions describe where to play next.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
