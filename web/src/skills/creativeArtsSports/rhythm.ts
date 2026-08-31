import { randChoice, shuffle } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

const NOTE_VALUES = [
  { label: "Dotted minim", beats: "3 beats", bucket: "note" },
  { label: "Dotted crotchet", beats: "1.5 beats", bucket: "note" },
  { label: "Quaver", beats: "0.5 beats", bucket: "note" },
  { label: "Dotted minim rest", beats: "3 beats", bucket: "rest" },
  { label: "Dotted crotchet rest", beats: "1.5 beats", bucket: "rest" },
  { label: "Quaver rest", beats: "0.5 beats", bucket: "rest" },
];

const THEORY_QUESTIONS: { q: string; correct: string; distractors: string[]; visual?: VisualSpec }[] = [
  {
    q: "How many beats does a dotted minim receive in 4/4 time?",
    correct: "3 beats",
    distractors: ["2 beats", "4 beats", "1.5 beats"],
    visual: { type: "music-note", note: "dotted-minim" },
  },
  {
    q: "How many beats does a dotted crotchet receive?",
    correct: "1.5 beats",
    distractors: ["1 beat", "2 beats", "0.5 beats"],
  },
  {
    q: "How many beats does a quaver receive?",
    correct: "Half a beat (0.5 beats)",
    distractors: ["1 beat", "2 beats", "1.5 beats"],
  },
  {
    q: "What effect does a dot have when placed after a note?",
    correct: "It extends the note's value by half of its original length",
    distractors: ["It shortens the note by half its value", "It repeats the note twice", "It silences the note"],
    visual: { type: "music-note", note: "dotted-minim" },
  },
  {
    q: "What is the purpose of a tie between two notes of the same pitch?",
    correct: "It joins the notes so they are held for their combined value without being replayed",
    distractors: ["It separates the two notes with a rest", "It changes the pitch of the second note", "It doubles the tempo of the piece"],
  },
  {
    q: "Why is note extension important in music notation?",
    correct: "It allows rhythms to be written accurately for durations that don't divide evenly into simple note lengths",
    distractors: ["It makes the music louder", "It is only used to correct mistakes", "It has no real musical purpose"],
  },
  {
    q: "A four-bar rhythmic pattern in 4/4 time has how many beats in total?",
    correct: "16 beats",
    distractors: ["8 beats", "12 beats", "4 beats"],
  },
];

const CLASSIFY_PROMPTS = [
  "Sort each item into Note (sound) or Rest (silence).",
  "Decide whether each item below is a note or a rest, and sort it.",
  "Classify each of these as a note or a rest.",
  "Which of these are notes, and which are rests? Sort them.",
  "Sort each notation symbol into Note or Rest.",
] as const;

export const rhythm: Skill = {
  id: "cas-rhythm",
  code: "C.2",
  subjectId: "creative-arts-sports",
  strandId: "cas-creating-performing",
  grade: 9,
  title: "Rhythm",
  description: "Note values, rests, and the effect of note extension on rhythmic patterns.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "theory"] as const);

    if (branch === "classify") {
      const ordered = shuffle(rng, NOTE_VALUES);
      const items = ordered.map((n) => ({ id: n.label, label: n.label }));
      const correctBucket: Record<string, string> = {};
      for (const n of ordered) correctBucket[n.label] = n.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CLASSIFY_PROMPTS),
        items,
        buckets: [
          { id: "note", label: "Note (sound)" },
          { id: "rest", label: "Rest (silence)" },
        ],
        correctBucket,
        hint: "A rest is the silent equivalent of a note, lasting the same number of beats.",
        explanation: NOTE_VALUES.map((n) => `${n.label} is worth ${n.beats}, and is ${n.bucket === "note" ? "a note (sound)" : "a rest (silence)"}.`).join(" "),
      };
    }

    const q = randChoice(rng, THEORY_QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      ...(q.visual ? { visual: q.visual } : {}),
      hint: "A dot adds half of the note's own value; a tie joins two notes into one longer sound.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
