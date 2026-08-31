import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, sub-strand 1.4 "Rhythm and Pattern Making" — the rhythm-notation
// half. The block-print pattern-making half of this same sub-strand ships separately as
// blockPrintPatternMaking.ts (C.7), per curriculum-reference/grade-6/creative-arts.json's split
// note. Source content: interpret rhythmic patterns; compose a rhythm using a combination of
// musical notes and their rests; improvise a rhythm in a three-beat pattern on a percussion
// instrument. Named note values: crotchet, (pair of) quaver(s), minim, dotted minim, semibreve,
// and their rests. Named French rhythm names: taa, ta-te, taa-aa, taa-aa-aa, taa-aa-aa-aa — the
// source lists these in the same order as the note values they relate to, so that ordering is
// used here as the mapping: taa=crotchet, ta-te=pair of quavers, taa-aa=minim,
// taa-aa-aa=dotted minim, taa-aa-aa-aa=semibreve.

const NOTES = [
  { id: "crotchet", label: "Crotchet", frenchName: "taa", beats: 1 },
  { id: "quaver-pair", label: "Pair of quavers", frenchName: "ta-te", beats: 1 },
  { id: "minim", label: "Minim", frenchName: "taa-aa", beats: 2 },
  { id: "dotted-minim", label: "Dotted minim", frenchName: "taa-aa-aa", beats: 3 },
  { id: "semibreve", label: "Semibreve", frenchName: "taa-aa-aa-aa", beats: 4 },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} improvises a short rhythm on a percussion instrument in ${place(rng)} and wants it to fit a three-beat pattern. Which combination of notes correctly fills exactly three beats?`,
      correct: "A minim followed by a crotchet (2 beats + 1 beat = 3 beats)",
      wrong: [
        "Two crotchets (1 beat + 1 beat = 2 beats, not three)",
        "A semibreve alone (4 beats, one beat too many)",
        "A dotted minim followed by a minim (3 beats + 2 beats = 5 beats, too many)",
      ],
      explanation: "A minim (2 beats) followed by a crotchet (1 beat) adds up to exactly 3 beats, matching a three-beat pattern — the other combinations add up to too few or too many beats.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} claps a rhythm in ${place(rng)}'s class using the French rhythm name "taa-aa-aa". Which note value does this represent?`,
    correct: "Dotted minim — worth 3 beats",
    wrong: ["Crotchet — worth 1 beat", "Minim — worth 2 beats", "Semibreve — worth 4 beats"],
    explanation: "\"Taa-aa-aa\" has three syllables, matching the dotted minim, which is worth 3 beats.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} composes a rhythmic pattern in ${place(rng)} using a crotchet followed by a rest and wants the total to add up to two beats. Which rest is needed after the crotchet?`,
      correct: "A crotchet rest — 1 beat of silence, so 1 beat of sound plus 1 beat of silence makes 2 beats total",
      wrong: [
        "A minim rest — this alone is already 2 beats of silence, making the total 3 beats, not 2",
        "A semibreve rest — this alone is 4 beats of silence, far too many",
        "No rest is needed — a crotchet by itself is already worth 2 beats",
      ],
      explanation: "A crotchet is worth 1 beat, so adding a 1-beat crotchet rest brings the total to exactly 2 beats — a minim rest or semibreve rest would add too much silence, and a crotchet alone is only 1 beat.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} is asked why rhythms are composed in different beat patterns (such as three-beat or four-beat patterns) rather than always the same pattern, in ${place(rng)}'s music class. What is the best reason?`,
    correct: "Different beat patterns create different feels and moods in music, giving composers more expressive choices",
    wrong: [
      "Only one beat pattern is actually allowed in Grade 6 composition, so this never really happens",
      "Beat patterns are chosen at random and have no effect on how a rhythm feels",
      "Changing the beat pattern always makes a rhythm louder",
    ],
    explanation: "Different beat patterns create genuinely different feels in music, which is why composers vary them — beat pattern does not control volume, and Grade 6 composition allows more than one pattern.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} taps a rhythm using the French names "taa, ta-te, taa-aa" in sequence in ${place(rng)}. How many total beats has ${who} tapped?`,
      correct: "4 beats — crotchet (1) + pair of quavers (1) + minim (2) = 4",
      wrong: [
        "3 beats — this misses one of the note values entirely",
        "5 beats — this over-counts one of the note values",
        "6 beats — this treats every syllable group as worth 2 beats, which is incorrect",
      ],
      explanation: "\"Taa\" (crotchet, 1 beat) + \"ta-te\" (pair of quavers, 1 beat) + \"taa-aa\" (minim, 2 beats) adds up to exactly 4 beats.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} wants to represent the longest silence possible with a single rest symbol while composing in ${place(rng)}. Which rest should be chosen?`,
    correct: "The semibreve rest — worth 4 beats of silence, the longest of the named rests",
    wrong: ["The crotchet rest — only 1 beat of silence", "The minim rest — only 2 beats of silence", "There is no rest longer than 1 beat available"],
    explanation: "The semibreve rest represents 4 beats of silence, the longest of the named rest values — crotchet and minim rests are shorter.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is unsure whether "taa-aa-aa-aa" is longer or shorter than "taa-aa". Which is actually true?`,
      correct: "\"Taa-aa-aa-aa\" (semibreve, 4 beats) is longer than \"taa-aa\" (minim, 2 beats)",
      wrong: [
        "\"Taa-aa\" is longer, because it has fewer syllables",
        "They are exactly the same length",
        "Neither has a fixed length — French rhythm names do not represent beat length at all",
      ],
      explanation: "More syllables in a French rhythm name correspond to a longer note value — \"taa-aa-aa-aa\" (semibreve, 4 beats) is longer than \"taa-aa\" (minim, 2 beats).",
    };
  },
];

const RECOGNITION_PROMPTS = ["How many beats is this note worth?", "Read the note on the staff — how many beats?", "What is the beat value of this note?", "Look at the note shown — how many beats does it last?", "Identify this note's beat value."] as const;
const FRENCH_MATCH_PROMPTS = ["Match each French rhythm name to its note value.", "Pair each French rhythm name with the correct note.", "Match each spoken rhythm name to its note symbol.", "Connect each French name to the note it represents.", "For each French rhythm name below, choose its matching note."] as const;
const ORDER_PROMPTS = ["Put these notes in order from shortest to longest.", "Arrange these notes by beat length, shortest first.", "Order these note values from fewest beats to most.", "Sort these notes from shortest to longest duration.", "Place these notes in order of increasing length."] as const;
const CATEGORIZE_PROMPTS = ["Sort each note by whether it is short (1 beat) or long (2+ beats).", "Which notes are short and which are long? Sort them.", "Sort these notes into short or long.", "Classify each note as short or long.", "Decide whether each note is short or long, and sort it."] as const;
const FILL_BLANK_PROMPTS = ["Complete the sentence.", "Fill in the missing word.", "Complete this sentence about rhythm notation.", "Fill in the blank below.", "Complete the sentence with the correct word."] as const;

export const rhythmNotation: Skill = {
  id: "g6-cas-rhythm-notation",
  code: "C.6",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-creating-executing",
  grade: 6,
  title: "Rhythm notation",
  description: "Interpreting note values (crotchet, pair of quavers, minim, dotted minim, semibreve) and their rests, relating them to French rhythm names, and composing/improvising rhythms in a three-beat pattern.",
  generate(rng) {
    const branch = randChoice(rng, ["beat-value", "french-match", "order-length", "short-long", "reasoning", "fill-blank"] as const);

    if (branch === "beat-value") {
      const n = randChoice(rng, NOTES);
      return {
        kind: "number-line",
        prompt: randChoice(rng, RECOGNITION_PROMPTS),
        min: 0,
        max: 4,
        step: 1,
        correctValue: n.beats,
        mode: "point",
        visual: { type: "music-note", note: n.id },
        hint: "Crotchet = 1, pair of quavers = 1, minim = 2, dotted minim = 3, semibreve = 4.",
        explanation: `A ${n.label.toLowerCase()} is worth ${n.beats} beat${n.beats === 1 ? "" : "s"}.`,
      };
    }

    if (branch === "french-match") {
      const chosen = shuffle(rng, NOTES);
      const tokens = shuffle(rng, chosen.map((n) => ({ id: n.id, label: n.frenchName })));
      const targets = shuffle(rng, chosen.map((n) => ({ id: n.id, label: n.label })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((n) => (correctMap[n.id] = n.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, FRENCH_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "More syllables in the French name mean a longer note.",
        explanation: chosen.map((n) => `"${n.frenchName}" is the ${n.label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order-length") {
      const orderable = NOTES.filter((n) => n.id !== "quaver-pair");
      const shuffled = shuffle(rng, orderable);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        items: shuffled.map((n) => ({ id: n.id, label: n.label })),
        correctOrder: [...orderable].sort((a, b) => a.beats - b.beats).map((n) => n.id),
        instruction: "Drag to arrange from shortest to longest.",
        hint: "Crotchet (1 beat) is shortest here; semibreve (4 beats) is longest.",
        explanation: "Correct order: " + [...orderable].sort((a, b) => a.beats - b.beats).map((n) => `${n.label} (${n.beats} beat${n.beats === 1 ? "" : "s"})`).join(" → ") + ".",
      };
    }

    if (branch === "short-long") {
      const items = NOTES.map((n) => ({ id: n.id, label: n.label }));
      const correctBucket: Record<string, string> = {};
      NOTES.forEach((n) => (correctBucket[n.id] = n.beats === 1 ? "short" : "long"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "short", label: "Short (1 beat)" },
          { id: "long", label: "Long (2+ beats)" },
        ],
        correctBucket,
        hint: "Crotchet and pair of quavers are worth 1 beat; minim, dotted minim, and semibreve are worth 2 or more.",
        explanation: NOTES.map((n) => `${n.label} (${n.beats} beat${n.beats === 1 ? "" : "s"}) is ${n.beats === 1 ? "short" : "long"}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Add up the beat values, or count syllables in the French rhythm name.", explanation: q.explanation };
    }

    const n = randChoice(rng, NOTES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: `A note worth ${n.beats} beat${n.beats === 1 ? "" : "s"}, spoken as "${n.frenchName}", is called a `,
      after: ".",
      correctAnswer: n.label.toLowerCase(),
      acceptedAnswers: [n.label.toLowerCase(), n.label],
      inputMode: "text",
      hint: "Think about crotchet, pair of quavers, minim, dotted minim, and semibreve.",
      explanation: `The ${n.label.toLowerCase()} is worth ${n.beats} beat${n.beats === 1 ? "" : "s"} and is spoken as "${n.frenchName}".`,
    };
  },
};
