import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TERMS = [
  { label: "C major (no sharps or flats)", bucket: "key", reason: "C major is a key signature — it has no sharps or flats." },
  { label: "G major (one sharp)", bucket: "key", reason: "G major is a key signature — it has one sharp (F sharp)." },
  { label: "F major (one flat)", bucket: "key", reason: "F major is a key signature — it has one flat (B flat)." },
  { label: "2/4", bucket: "time", reason: "2/4 is a time signature — two crotchet beats per bar." },
  { label: "3/4", bucket: "time", reason: "3/4 is a time signature — three crotchet beats per bar." },
  { label: "4/4", bucket: "time", reason: "4/4 is a time signature — four crotchet beats per bar." },
  { label: "Name of the gallery", bucket: "catalogue", reason: "The gallery name is an art catalogue element." },
  { label: "Artist's name", bucket: "catalogue", reason: "The artist's name is an art catalogue element." },
  { label: "Medium used", bucket: "catalogue", reason: "The medium (material/technique used) is an art catalogue element." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is anti-doping in sports?",
    correct: "Rules and testing that prevent athletes from using banned performance-enhancing substances",
    distractors: ["A method of increasing an athlete's strength quickly", "A type of sports uniform", "A scoring system used in athletics"],
  },
  {
    q: "Why should athletes avoid performance-enhancing substances?",
    correct: "They are unethical, can seriously harm health, and give an unfair advantage",
    distractors: ["They are illegal only in some countries and fine elsewhere", "They have no health risks at all", "They are required for all professional competitions"],
  },
  {
    q: "In music notation, what does a repeat sign instruct the performer to do?",
    correct: "Go back and play a marked section of music again",
    distractors: ["Stop playing immediately", "Play the section one octave higher", "Skip to the very end of the piece"],
  },
  {
    q: "Which of these is a 'dynamics' performance direction in music?",
    correct: "Crescendo (getting gradually louder)",
    distractors: ["Time signature", "Key signature", "A tempo marking alone"],
  },
  {
    q: "When analysing a solo vocal piece, which of these would you examine?",
    correct: "Its key, time signature, dynamics, and how well the performer controlled these elements",
    distractors: ["Only the singer's clothing", "Only the length of the piece in minutes", "Only the venue where it was performed"],
  },
  {
    q: "What information does an art catalogue typically record about an exhibited artwork?",
    correct: "The gallery name, artist's name, type of artwork, medium, subject matter, and function",
    distractors: ["Only the artwork's selling price", "Only the visitor's opinion of the artwork", "Only the date the gallery opened"],
  },
  {
    q: "Why is analysis considered an important skill in Creative Arts and Sports?",
    correct: "It helps performers and artists understand strengths, weaknesses, and how to improve or find inspiration",
    distractors: ["It replaces the need for any creative skill", "It is only useful for judges, never learners", "It has no value once a performance or artwork is finished"],
  },
  {
    q: "What is the 'medium' of an artwork, as recorded in an art catalogue?",
    correct: "The material or technique used to create it, such as oil paint, clay, or charcoal",
    distractors: ["The size of the gallery room", "The artist's date of birth", "The price of the artwork"],
  },
];

const CLASSIFY_PROMPTS = [
  "Sort each item into the correct analysis category.",
  "Which analysis category does each item below belong to? Sort them.",
  "Classify each item into its correct analysis category.",
  "Decide which category each item belongs to, and sort it.",
  "Sort these items by the analysis category they fit under.",
] as const;

export const analysis: Skill = {
  id: "cas-analysis",
  code: "A.1",
  subjectId: "creative-arts-sports",
  strandId: "cas-appreciation",
  grade: 9,
  title: "Analysis of Creative Arts and Sports",
  description: "Key and time signatures, anti-doping ethics, performance directions, and art catalogue conventions.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "questions"] as const);

    if (branch === "classify") {
      const keyPicks = shuffle(rng, TERMS.filter((t) => t.bucket === "key")).slice(0, 2);
      const timePicks = shuffle(rng, TERMS.filter((t) => t.bucket === "time")).slice(0, 2);
      const cataloguePicks = shuffle(rng, TERMS.filter((t) => t.bucket === "catalogue")).slice(0, 2);
      const items = shuffle(rng, [...keyPicks, ...timePicks, ...cataloguePicks]);
      const correctBucket: Record<string, string> = {};
      for (const t of items) correctBucket[t.label] = t.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CLASSIFY_PROMPTS),
        items: items.map((t) => ({ id: t.label, label: t.label })),
        buckets: [
          { id: "key", label: "Key signature" },
          { id: "time", label: "Time signature" },
          { id: "catalogue", label: "Art catalogue element" },
        ],
        correctBucket,
        hint: "Key signatures describe pitch, time signatures describe beats per bar, and catalogue elements describe an artwork's record.",
        explanation: items.map((t) => t.reason).join(" "),
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
      hint: "Analysis looks closely at music, sport, and art to explain why something works or is significant.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
