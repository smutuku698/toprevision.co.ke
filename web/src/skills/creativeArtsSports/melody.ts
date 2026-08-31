import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is a 'rhythmic variation' in a melody?",
    correct: "Changing the rhythm or note lengths of a musical idea while keeping it recognisable",
    distractors: ["Changing the key signature only", "Playing the melody exactly the same way every time", "Removing the melody entirely"],
  },
  {
    q: "What is a 'melodic variation'?",
    correct: "Changing the pitches or contour of a musical idea while keeping some original features",
    distractors: ["Changing the volume only", "Playing at a different speed with the same notes", "Adding new instruments only"],
  },
  {
    q: "What is a 'dynamic variation'?",
    correct: "Changing the loudness or softness of a musical idea",
    distractors: ["Changing the pitch of the notes", "Changing the key signature", "Changing the time signature"],
  },
  {
    q: "How can variation make a melody more interesting?",
    correct: "By introducing changes in rhythm, pitch, or dynamics so the melody doesn't feel repetitive",
    distractors: ["By repeating the exact same phrase throughout", "By removing all note values except one", "By playing only in silence"],
  },
  {
    q: "A four-bar melody in 4/4 time has how many beats in total?",
    correct: "16 beats",
    distractors: ["8 beats", "12 beats", "20 beats"],
  },
  {
    q: "Which note values could add rhythmic interest to a melody built mostly of crotchets?",
    correct: "A dotted crotchet and a quaver",
    distractors: ["Only whole notes", "Only rests", "Removing all note values"],
  },
  {
    q: "Why is variation valued when composing music for Creative Arts and Sports?",
    correct: "It keeps the audience engaged and adds artistic interest to a performance",
    distractors: ["It makes the music harder to perform for no benefit", "It is only used in visual art, not music", "It replaces the need for a melody"],
  },
];

const VARIATION_TYPES: { term: string; meaning: string }[] = [
  { term: "Rhythmic variation", meaning: "Changing the rhythm or note lengths of a musical idea while keeping it recognisable" },
  { term: "Melodic variation", meaning: "Changing the pitches or contour of a musical idea while keeping some original features" },
  { term: "Dynamic variation", meaning: "Changing the loudness or softness of a musical idea" },
];

const MATCH_PROMPTS = [
  "Match each type of melodic variation to what it means.",
  "Pair each type of variation with its correct meaning.",
  "Match each variation term to what it describes.",
  "Connect each type of variation to its correct meaning.",
  "For each variation type below, choose its matching meaning.",
] as const;

export const melody: Skill = {
  id: "cas-melody",
  code: "C.4",
  subjectId: "creative-arts-sports",
  strandId: "cas-creating-performing",
  grade: 9,
  title: "Melody",
  description: "Rhythmic, melodic, and dynamic variation, and note values used in melody writing.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, VARIATION_TYPES.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, VARIATION_TYPES.map((v) => ({ id: v.term, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of VARIATION_TYPES) correctMap[v.term] = v.term;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Rhythmic variation changes note lengths, melodic variation changes pitch, dynamic variation changes loudness.",
        explanation: VARIATION_TYPES.map((v) => `${v.term} — ${v.meaning.toLowerCase()}.`).join(" "),
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
      hint: "Rhythmic variation changes note lengths, melodic variation changes pitch, dynamic variation changes loudness.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
