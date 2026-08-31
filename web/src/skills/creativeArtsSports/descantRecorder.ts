import { randChoice, shuffle } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

const QUESTIONS: { q: string; correct: string; distractors: string[]; visual?: VisualSpec }[] = [
  {
    q: "What is the key signature of F major?",
    correct: "One flat (B flat)",
    distractors: ["One sharp (F sharp)", "No sharps or flats", "Two flats"],
  },
  {
    q: "What does 'crescendo' mean in music?",
    correct: "Gradually getting louder",
    distractors: ["Gradually getting softer", "Suddenly stopping", "Playing faster"],
  },
  {
    q: "What does 'diminuendo' mean in music?",
    correct: "Gradually getting softer",
    distractors: ["Gradually getting louder", "Playing a higher pitch", "Repeating a phrase"],
  },
  {
    q: "On a descant recorder, what is the 'pinching' technique used for?",
    correct: "To produce notes in the higher octave by slightly opening the thumb hole",
    distractors: ["To clean the recorder after playing", "To hold the recorder more tightly with the fingers", "To change the recorder's key signature"],
    visual: { type: "recorder-fingering", note: "C1" },
  },
  {
    q: "Why is applying correct technique important when playing an instrument like the descant recorder?",
    correct: "It produces accurate pitch, tone quality, and control over dynamics",
    distractors: ["It has no effect on the sound produced", "It is only important for advanced players", "It only matters for how the player looks, not the sound"],
  },
  {
    q: "Which note names make up the ascending scale of F major?",
    correct: "F, G, A, B flat, C, D, E, F",
    distractors: ["F, G, A, B, C, D, E, F", "F, G sharp, A, B, C, D, E, F", "F, G, A flat, B flat, C, D flat, E, F"],
  },
  {
    q: "A solo recorder piece marked with both crescendo and diminuendo will do what?",
    correct: "Get gradually louder in one part and gradually softer in another",
    distractors: ["Stay at exactly the same volume throughout", "Only be played once, never twice", "Change key signature midway"],
  },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Crescendo", meaning: "Gradually getting louder" },
  { term: "Diminuendo", meaning: "Gradually getting softer" },
  { term: "Pinching", meaning: "A technique to produce notes in the higher octave by slightly opening the thumb hole" },
  { term: "Key signature of F major", meaning: "One flat (B flat)" },
];

const MATCH_PROMPTS = [
  "Match each descant recorder or music term to what it means.",
  "Pair each term below with its correct meaning.",
  "Match each term to what it describes.",
  "Connect each recorder/music term to its correct meaning.",
  "For each term below, choose its matching meaning.",
] as const;

export const descantRecorder: Skill = {
  id: "cas-descant-recorder",
  code: "C.7",
  subjectId: "creative-arts-sports",
  strandId: "cas-creating-performing",
  grade: 9,
  title: "Descant Recorder",
  description: "F major fingering, dynamics terminology, and the pinching technique on the descant recorder.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of TERMS) correctMap[t.term] = t.term;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "F major has one flat (B flat); crescendo grows louder, diminuendo grows softer.",
        explanation: TERMS.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      ...(entry.visual ? { visual: entry.visual } : {}),
      hint: "F major has one flat (B flat); crescendo grows louder, diminuendo grows softer.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
