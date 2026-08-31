import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames, cap } from "./sharedG10";

// KICD Grade 10 Music and Dance, sub-strand 1.5 "Two-Part Harmony". The design names exactly
// 7 consonant intervals (major 3rd, minor 3rd, perfect 4th, perfect 5th, major 6th, minor 6th,
// octave) as a hard content floor (per the JSON's assessmentSignal note — the strand rubric grades
// naming ALL 7, not a subset), plus beginning guidelines (unison/5th/8ve), ending guidelines
// (unison/8ve), and two named motion concepts (step, leap, note-to-note). The learning-experience
// bullet "Distinguish harmonic intervals as consonant or dissonant" requires learners to also
// recognise some dissonant intervals for contrast — the design names the *consonant* 7 explicitly
// but does not enumerate the dissonant side, so the categorize branch below supplements with the
// standard, non-controversial dissonant intervals (2nds, 7ths, the tritone) that any consonant/
// dissonant classification task requires; this is standard interval theory, not invented content,
// and nothing in the design excludes it.
//
// No VisualSpec exists for a staff/interval diagram (nothing in types.ts represents a musical
// interval or a two-part stave), so this skill is entirely text/audio-description based — a
// deliberate, documented skip per the mandatory-reading instructions, not an oversight.

interface Interval {
  id: string;
  label: string;
  semitones: number;
  desc: string;
  wrong: string[]; // curated confusable cluster: always other real consonant intervals, never unrelated terms
}

const INTERVALS: Interval[] = [
  {
    id: "maj3",
    label: "Major 3rd",
    semitones: 4,
    desc: "a bright, cheerful-sounding gap of 4 semitones between the two notes",
    wrong: ["Minor 3rd", "Perfect 4th", "Major 6th"],
  },
  {
    id: "min3",
    label: "Minor 3rd",
    semitones: 3,
    desc: "a softer, slightly darker-sounding gap of 3 semitones between the two notes",
    wrong: ["Major 3rd", "Perfect 4th", "Minor 6th"],
  },
  {
    id: "p4",
    label: "Perfect 4th",
    semitones: 5,
    desc: "a plain, hollow-sounding gap of 5 semitones between the two notes",
    wrong: ["Major 3rd", "Perfect 5th", "Minor 3rd"],
  },
  {
    id: "p5",
    label: "Perfect 5th",
    semitones: 7,
    desc: "an open, stable-sounding gap of 7 semitones between the two notes — one of the approved intervals to begin a two-part harmony on",
    wrong: ["Perfect 4th", "Octave", "Major 6th"],
  },
  {
    id: "maj6",
    label: "Major 6th",
    semitones: 9,
    desc: "a full, sweet-sounding gap of 9 semitones between the two notes",
    wrong: ["Minor 6th", "Perfect 5th", "Octave"],
  },
  {
    id: "min6",
    label: "Minor 6th",
    semitones: 8,
    desc: "a warm, gently dark-sounding gap of 8 semitones between the two notes",
    wrong: ["Major 6th", "Perfect 5th", "Major 3rd"],
  },
  {
    id: "8ve",
    label: "Octave",
    semitones: 12,
    desc: "the same note name repeated at a higher or lower pitch — a 12-semitone gap, and the most fused-sounding of all seven consonant intervals",
    wrong: ["Perfect 5th", "Major 6th", "Minor 6th"],
  },
];

interface DissonanceFact {
  text: string;
  type: "consonant" | "dissonant";
}

const CONSONANCE_FACTS: DissonanceFact[] = [
  { text: "Major 3rd — 4 semitones apart, bright and stable", type: "consonant" },
  { text: "Minor 3rd — 3 semitones apart, softer but still stable", type: "consonant" },
  { text: "Perfect 4th — 5 semitones apart, plain and stable", type: "consonant" },
  { text: "Perfect 5th — 7 semitones apart, open and stable", type: "consonant" },
  { text: "Major 6th — 9 semitones apart, full and stable", type: "consonant" },
  { text: "Minor 6th — 8 semitones apart, warm and stable", type: "consonant" },
  { text: "Octave — 12 semitones apart, the most fused and stable interval of all", type: "consonant" },
  { text: "Minor 2nd — 1 semitone apart, a sharp clash between the two notes", type: "dissonant" },
  { text: "Major 2nd — 2 semitones apart, a mild but noticeable clash", type: "dissonant" },
  { text: "Tritone (augmented 4th) — 6 semitones apart, restless and unresolved-sounding", type: "dissonant" },
  { text: "Minor 7th — 10 semitones apart, unstable and pulling toward resolution", type: "dissonant" },
  { text: "Major 7th — 11 semitones apart, a sharp clash just below the octave", type: "dissonant" },
];

// The design's own Suggested Learning Experiences bullet order for 1.5, condensed into a
// teaching-sequence ordering task (per SKILL-QUALITY-STANDARDS.md's sanctioned technique).
const PROCESS_STEPS = [
  { id: "listen", label: "Listen to two-part harmonic passages in major keys to identify the guidelines used" },
  { id: "discriminate", label: "Aurally discriminate the higher part from the lower part in the passage" },
  { id: "classify", label: "Distinguish harmonic intervals as consonant or dissonant" },
  { id: "add", label: "Add a second part above or below the melody using appropriate consonant intervals" },
  { id: "score", label: "Score the two-part harmonic passage on the treble stave with appropriate stemming" },
  { id: "record", label: "Record the finished two-part music using a digital device or a physical portfolio" },
  { id: "appraise", label: "Appraise each other's finished two-part harmony" },
];

interface HarmonyFact {
  situation: string;
  correct: string;
  wrong: string[];
}

const REASON_FACTS: HarmonyFact[] = [
  {
    situation: "is composing a second part below a 4-bar melody in a major key and must choose the very first interval between the two parts",
    correct: "Begin the two parts on a unison, a perfect 5th, or an octave — those are the approved starting intervals for two-part harmony",
    wrong: [
      "Begin the two parts on a major 2nd, since a slight clash makes the harmony sound more interesting",
      "Begin the two parts on any interval at all, since the starting interval does not matter",
      "Begin the two parts on a minor 7th, since sevenths always sound pleasant",
    ],
  },
  {
    situation: "has finished writing a second part and must decide what interval to end the two-part harmony on",
    correct: "End the two parts on a unison or an octave — those are the required closing intervals for two-part harmony",
    wrong: [
      "End the two parts on a perfect 5th, since fifths are always acceptable for both beginning and ending a harmony",
      "End the two parts on a major 6th, since sixths sound warm and satisfying",
      "End the two parts wherever sounds nicest, since there is no fixed rule for endings",
    ],
  },
  {
    situation: "writes the second part so both parts sing exactly one note for every note of the melody, moving together in the same rhythm",
    correct: "This is note-to-note motion — a straightforward way of pairing the two parts, one note against one note",
    wrong: [
      "This is motion by leap, since the two parts skip between notes",
      "This is motion by step, since the two parts always move to a neighbouring scale degree",
      "This is dissonant motion, since matching rhythms always create clashing intervals",
    ],
  },
  {
    situation: "moves the second part from one note to the very next, neighbouring note in the scale",
    correct: "This is motion by step — the part moves to an adjacent scale degree",
    wrong: [
      "This is motion by leap, since any change in pitch counts as a leap",
      "This is note-to-note motion, since it is described in terms of one note changing to another",
      "This is dissonant motion, since stepwise motion is always unstable",
    ],
  },
  {
    situation: "skips the second part from one note to a note several scale-degrees away, such as a jump from the tonic straight to the dominant",
    correct: "This is motion by leap — the part skips over notes rather than moving to a neighbouring one",
    wrong: [
      "This is motion by step, since the notes still belong to the same scale",
      "This is note-to-note motion, since only one note changed at a time",
      "This is unison motion, since both parts eventually reach a related pitch",
    ],
  },
  {
    situation: "plays a passage where the two parts sound a major 3rd apart",
    correct: "This interval is consonant — it is one of the seven named consonant intervals, so it can be used freely through the harmony",
    wrong: [
      "This interval is dissonant, since any interval other than a unison clashes",
      "This interval can only be judged once the rhythm is known",
      "This interval is only usable at the very start of a harmony, never elsewhere",
    ],
  },
  {
    situation: "plays a passage where the two parts sound a major 2nd apart",
    correct: "This interval is dissonant — it clashes and is not one of the seven approved consonant intervals for two-part harmony",
    wrong: [
      "This interval is consonant, since it is a small, comfortable gap between the notes",
      "This interval behaves exactly like a minor 3rd",
      "This interval is only dissonant if it is played loudly",
    ],
  },
  {
    situation: "has written a second part that begins correctly on a unison but ends the phrase on a major 3rd",
    correct: "The ending needs correcting — two-part harmony must end on a unison or an octave, not a third",
    wrong: [
      "This is correct, since any interval used at the beginning may also be used at the end",
      "This is correct, since a major third is one of the seven approved consonant intervals",
      "This cannot be judged without knowing the key of the melody",
    ],
  },
  {
    situation: "starts the second part exactly one octave below the melody's opening note",
    correct: "This is an approved beginning interval — the octave is one of the sanctioned intervals for opening a two-part harmony",
    wrong: [
      "This is not allowed, since only a unison may open a two-part harmony",
      "This is not allowed, since octaves are dissonant",
      "This is only acceptable for ending a harmony, never for beginning one",
    ],
  },
  {
    situation: "plays a passage where the two parts sound a minor 6th apart",
    correct: "This interval is consonant — the minor 6th is one of the seven approved consonant intervals in two-part harmony",
    wrong: [
      "This interval is dissonant, since minor-quality intervals are always unstable",
      "This interval sounds identical to a major 6th",
      "This interval can only be used if the harmony is written in a minor key",
    ],
  },
];

// 5 openers x 4 closers = 20 distinct prompt skeletons from 9 authored pieces, per the
// combineFrames technique documented in sharedG10.ts. Anchor phrasing is deliberately varied so
// no single fixed phrase dominates every draw of this branch.
const REASONING_OPENERS: ((rng: RNG, fact: HarmonyFact) => string)[] = [
  (rng, fact) => `${name(rng)}, composing near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `In a school music club near ${place(rng)}, ${name(rng)} ${fact.situation}`,
  (rng, fact) => `${name(rng)} ${fact.situation}`,
  (rng, fact) => `During a two-part harmony lesson in ${place(rng)}, ${name(rng)} ${fact.situation}`,
  (rng, fact) => `While practising with a duet partner, ${name(rng)} ${fact.situation}`,
];

const REASONING_CLOSERS = [
  "What is the correct guideline here?",
  "Which conclusion is correct?",
  "What should this tell the learner?",
  "What is the right way to understand this?",
];

const REASONING_FRAMES = combineFrames(REASONING_OPENERS, REASONING_CLOSERS);
const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, REASONING_FRAMES);

const CLICK_MATCH_PROMPTS = [
  "Match each consonant interval to its description.",
  "Pair each interval with the description that fits it.",
  "Connect each named interval to what it actually sounds like.",
  "Line up each interval with its correct description.",
  "Work out which description belongs to which interval, then match them.",
  "Match each of the seven consonant intervals to its description below.",
  "Which description goes with which interval? Match them correctly.",
  "Pair up every interval with the statement that correctly describes it.",
  "Match each interval on the left to its description on the right.",
  "Sort out which description belongs to which interval, by matching them.",
  "Correctly match every interval to the description that fits it.",
  "Match each interval to the semitone gap and sound it describes.",
  "For each interval below, find the description that explains it.",
  "Match each consonant interval to what it sounds like when played.",
  "Figure out what each interval sounds like, then match it to its name.",
  "Connect each interval name to its correct sound description.",
  "Match each of the seven intervals to the description that fits.",
  "Pair each interval with its semitone description.",
  "Work out which interval matches which description, then link them.",
  "Match every interval below to the description that correctly explains it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each interval as consonant or dissonant.",
  "Group these intervals under consonant or dissonant.",
  "Decide whether each interval below is consonant or dissonant, and sort it there.",
  "Sort each interval into the correct category.",
  "Place each interval into the bucket it belongs to: consonant or dissonant.",
  "Read each interval and sort it as consonant or dissonant.",
  "Work out whether each interval clashes or blends, then sort it there.",
  "Classify each interval as consonant or dissonant.",
  "Organize these intervals into consonant and dissonant groups.",
  "Which category does each interval belong to? Sort it accordingly.",
  "Sort each interval below into consonant or dissonant.",
  "Drop each interval into the category it actually belongs to.",
  "Group each interval with the category it correctly fits.",
  "Decide where each interval fits: consonant or dissonant.",
  "Sort these intervals into their correct harmony categories.",
  "For each interval, work out whether it is stable or clashing, then sort it.",
  "Place these intervals under the label each one matches.",
  "Sort each interval correctly between consonant and dissonant.",
  "Read each interval and file it under the right category.",
  "Assign each interval to the category it best fits.",
];

const ORDERING_PROMPTS = [
  "Arrange the steps of building a two-part harmony in the correct order.",
  "Put these two-part harmony steps into a sensible order.",
  "Sequence the process of composing a second part correctly.",
  "Arrange these actions into the order a careful composer would follow them.",
  "Order these steps the way a learner should carry them out while writing two-part harmony.",
  "Sort these steps into the order they should happen when creating a two-part harmony.",
  "Put these composing steps in the order a music student would follow them.",
  "Work out the sensible order for these two-part harmony steps.",
  "Arrange these steps into a logical harmony-writing process.",
  "Which order should these steps happen in? Arrange them correctly.",
  "Build a sensible composing process by ordering these steps correctly.",
  "Sequence a composer's steps in the order they should be carried out.",
  "Order these actions the way they would happen in a well-run harmony lesson.",
  "Arrange the steps of writing a two-part harmony, in the right order.",
  "Put these tasks into the order a careful learner would complete them.",
  "Sequence these steps to build a two-part harmony from start to finish.",
  "Work out the correct order for composing and sharing a two-part harmony.",
  "Arrange these steps as a learner would carry them out during a lesson.",
  "Order the tasks below the way a sensible harmony-writing process would run.",
  "Sequence these composing steps correctly, from first to last.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the fact about two-part harmony.",
  "Fill in the missing term.",
  "Work out the missing word in this two-part harmony fact.",
  "Complete this statement about intervals or two-part harmony.",
  "Fill in the blank to finish the fact.",
  "Which term completes this sentence correctly?",
  "Name the missing term in this fact about harmony.",
  "Complete the sentence with the correct interval or motion term.",
  "Work out and fill in the missing term below.",
  "Which word or phrase finishes this fact correctly?",
  "Fill in the term that correctly completes this statement.",
  "Complete this two-part harmony fact accurately.",
  "What term belongs in the blank below?",
  "Finish the sentence with the correct musical term.",
  "Fill in the correct interval or motion name.",
  "Complete the missing term in this harmony fact.",
  "Which term fits correctly in the blank?",
  "Work out the correct word to complete this fact.",
  "Fill in the blank with the correct musical term.",
  "Complete this fact about two-part harmony guidelines.",
];

const INTERVAL_IDENTIFY_PROMPTS = [
  "Identify the interval described here:",
  "Which interval matches this description?",
  "Name the interval being described:",
  "Work out which consonant interval this is:",
  "Which of the seven consonant intervals fits this description?",
  "Identify this consonant interval from its description:",
  "What interval is being described below?",
  "Which interval sounds like this?",
  "Name this interval correctly:",
  "Work out the interval from the description given:",
  "Identify the correct interval:",
  "Which consonant interval does this description match?",
  "From the description, name the interval:",
  "What is this interval called?",
  "Identify which of the seven consonant intervals this is:",
  "Match this description to its correct interval name:",
  "Which interval is this?",
  "Work out and name the interval described:",
  "Name the consonant interval that fits this description:",
  "Identify the interval from the semitone gap described:",
];

export const twoPartHarmony: Skill = {
  id: "g10-mad-two-part-harmony",
  code: "1.5",
  subjectId: "music-and-dance",
  strandId: "g10-mad-foundations",
  grade: 10,
  title: "Two-Part Harmony",
  description: "Guidelines for beginning (unison, 5th or octave) and ending (unison or octave) two-part harmony, motion types (step, leap, note-to-note), the seven named consonant intervals, and distinguishing consonant from dissonant intervals.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["interval-match", "consonance-categorize", "process-order", "reasoning", "interval-identify", "fill-blank"] as const
    );
    const hint = "Two-part harmony begins on a unison, 5th or octave, and always ends on a unison or octave — the seven consonant intervals are major/minor 3rd, perfect 4th, perfect 5th, major/minor 6th and the octave.";

    if (branch === "interval-match") {
      const tokens = shuffle(rng, INTERVALS.map((iv) => ({ id: iv.id, label: iv.label })));
      const targets = shuffle(rng, INTERVALS.map((iv) => ({ id: iv.id, label: cap(iv.desc) })));
      const correctMap: Record<string, string> = {};
      for (const iv of INTERVALS) correctMap[iv.id] = iv.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, CLICK_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: INTERVALS.map((iv) => `${iv.label} — ${iv.desc}.`).join(" "),
      };
    }

    if (branch === "consonance-categorize") {
      const chosen = shuffle(rng, CONSONANCE_FACTS).slice(0, 9);
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "consonant", label: "Consonant" },
          { id: "dissonant", label: "Dissonant" },
        ],
        correctBucket,
        hint: "Consonant intervals sound stable and blend; dissonant intervals clash and pull toward resolution.",
        explanation: chosen.map((c) => `${c.text} is ${c.type}.`).join(" "),
      };
    }

    if (branch === "process-order") {
      const shuffled = shuffle(rng, PROCESS_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDERING_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PROCESS_STEPS.map((s) => s.id),
        hint: "Listen and classify intervals first, then compose, score, record, and finally appraise.",
        explanation: PROCESS_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint,
        explanation: q.explanation,
      };
    }

    if (branch === "interval-identify") {
      const iv = randChoice(rng, INTERVALS);
      const q = {
        prompt: `${randChoice(rng, INTERVAL_IDENTIFY_PROMPTS)} it is ${iv.desc}.`,
        correct: iv.label,
        wrong: iv.wrong,
        explanation: `This is the ${iv.label} — ${iv.desc}.`,
      };
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Semitone count is the giveaway: 3=minor 3rd, 4=major 3rd, 5=perfect 4th, 7=perfect 5th, 8=minor 6th, 9=major 6th, 12=octave.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.acceptedAnswers],
      inputMode: "text",
      hint,
      explanation: fb.explanation,
    };
  },
};

const FILL_BLANK_TEMPLATES = [
  {
    before: "In two-part harmony, an accepted interval to begin the two parts on is a unison, a perfect 5th, or a(n) ",
    after: ".",
    correctAnswer: "octave",
    acceptedAnswers: ["octave", "8ve"],
    explanation: "The three approved beginning intervals for two-part harmony are the unison, the perfect 5th, and the octave.",
  },
  {
    before: "In two-part harmony, the two parts should normally end on a unison or a(n) ",
    after: ".",
    correctAnswer: "octave",
    acceptedAnswers: ["octave", "8ve"],
    explanation: "Two-part harmony must end on a unison or an octave — the most fused, stable-sounding intervals.",
  },
  {
    before: "When both parts move together, one note against one note, in the same rhythm, this is called ",
    after: " motion.",
    correctAnswer: "note-to-note",
    acceptedAnswers: ["note-to-note", "note to note"],
    explanation: "Note-to-note motion means each note of one part is paired with one note of the other part, moving together.",
  },
  {
    before: "When a part moves to the very next, neighbouring note in the scale, this is motion by ",
    after: ".",
    correctAnswer: "step",
    acceptedAnswers: ["step"],
    explanation: "Motion by step means moving to an adjacent scale degree.",
  },
  {
    before: "When a part skips over notes to reach a non-adjacent pitch, this is motion by ",
    after: ".",
    correctAnswer: "leap",
    acceptedAnswers: ["leap"],
    explanation: "Motion by leap means skipping past neighbouring notes to a note further away.",
  },
  {
    before: "The consonant interval that spans 4 semitones and sounds bright and cheerful is the ",
    after: ".",
    correctAnswer: "major 3rd",
    acceptedAnswers: ["major 3rd", "major third"],
    explanation: "The major 3rd spans 4 semitones and has a bright, cheerful sound.",
  },
  {
    before: "The consonant interval that spans 3 semitones and sounds softer and slightly darker is the ",
    after: ".",
    correctAnswer: "minor 3rd",
    acceptedAnswers: ["minor 3rd", "minor third"],
    explanation: "The minor 3rd spans 3 semitones and has a softer, slightly darker sound.",
  },
  {
    before: "The consonant interval that spans 5 semitones and has a plain, hollow sound is the ",
    after: ".",
    correctAnswer: "perfect 4th",
    acceptedAnswers: ["perfect 4th", "perfect fourth"],
    explanation: "The perfect 4th spans 5 semitones and has a plain, hollow sound.",
  },
  {
    before: "The consonant interval that spans 7 semitones and sounds open and stable is the ",
    after: ".",
    correctAnswer: "perfect 5th",
    acceptedAnswers: ["perfect 5th", "perfect fifth"],
    explanation: "The perfect 5th spans 7 semitones and sounds open and stable — one of the approved intervals to begin a two-part harmony on.",
  },
  {
    before: "The consonant interval that spans 9 semitones and sounds full and sweet is the ",
    after: ".",
    correctAnswer: "major 6th",
    acceptedAnswers: ["major 6th", "major sixth"],
    explanation: "The major 6th spans 9 semitones and has a full, sweet sound.",
  },
  {
    before: "The consonant interval that spans 8 semitones and sounds warm and gently dark is the ",
    after: ".",
    correctAnswer: "minor 6th",
    acceptedAnswers: ["minor 6th", "minor sixth"],
    explanation: "The minor 6th spans 8 semitones and has a warm, gently dark sound.",
  },
  {
    before: "The consonant interval formed by the same note name repeated at a higher or lower pitch is the ",
    after: ".",
    correctAnswer: "octave",
    acceptedAnswers: ["octave", "8ve"],
    explanation: "The octave is the same note name repeated at a higher or lower pitch — the most fused of all seven consonant intervals.",
  },
] as const;
