import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill, VisualSpec } from "@/lib/types";
import {
  place,
  name,
  buildScenarioChoices,
  pickPrompt,
  SORT_PROMPTS,
  MATCH_PROMPTS,
  ORDER_PROMPTS,
  FILL_BLANK_PROMPTS,
} from "./g5CasShared";
import type { ScenarioMC } from "./g5CasShared";

// KICD Grade 5 Creative Arts, Strand 1.0 Creating and Executing, sub-strand 1.5 "Melody"
// (15 lessons).
//
// Mined verbatim: Sol-fa syllables d r m f s; Kodaly hand signs d r m f s; Composition
// techniques — stepwise motion, narrow leaps, repetition of pitches, variation of pitches,
// ending on a long note; Qualities of a card (layout, colour, lettering); Card design.
// Key inquiry: why is it necessary to apply composition techniques in composing a melody?
// Core competencies: Self-efficacy; Digital literacy; Creativity and imagination. Link to
// other learning area: English (articulating vowels and syllables when singing the sol-fa
// scale).
//
// Visual coverage: uses the registered { type: "sol-fa-ladder" } VisualSpec for pitch
// recognition. No Kodaly-hand-sign or card-layout VisualSpec exists; that omission is a
// deliberate scope call for this pass.

const SOLFA = [
  { id: "d", short: "d", name: "doh", degree: 1, sign: "a closed fist" },
  { id: "r", short: "r", name: "re", degree: 2, sign: "a flat hand tilted so the fingers point up and forward" },
  { id: "m", short: "m", name: "me", degree: 3, sign: "a flat hand held level, palm facing down" },
  { id: "f", short: "f", name: "fah", degree: 4, sign: "a fist with the thumb pointing down" },
  { id: "s", short: "s", name: "soh", degree: 5, sign: "a flat hand held upright, palm facing away from you" },
] as const;

const LADDER_HIGHLIGHT: Record<string, "doh" | "re" | "me" | "fah" | "soh"> = {
  d: "doh",
  r: "re",
  m: "me",
  f: "fah",
  s: "soh",
};

const TECH_FACTS = [
  { text: "The tune moves to the very next pitch up or down, like d–r–m, with no skips", tech: "stepwise" },
  { text: "Singing along the sol-fa ladder one rung at a time", tech: "stepwise" },
  { text: "The tune skips over a pitch, like d–m or m–s, in a small jump", tech: "narrow-leap" },
  { text: "A short jump from soh down to me, missing out fah", tech: "narrow-leap" },
  { text: "The same pitch is sung two or more times in a row, like s–s–s", tech: "repetition" },
  { text: "Repeating doh three times before the tune moves on", tech: "repetition" },
  { text: "The pitches keep changing so the tune does not stay on one note", tech: "variation" },
  { text: "Mixing higher and lower pitches so the melody has shape and interest", tech: "variation" },
  { text: "The melody finishes on a note held for a long value, giving a feeling of rest", tech: "long-ending" },
  { text: "Ending the phrase on a minim (taa-aa) so it sounds complete", tech: "long-ending" },
] as const;

const CARD_QUALITY_FACTS = [
  { text: "The title, the melody and the decoration are arranged and spaced neatly on the card, not crowded", quality: "layout" },
  { text: "There is a clear margin around the edge and the melody sits in a balanced position", quality: "layout" },
  { text: "The colours chosen are pleasing and the lettering colour contrasts with the background so it can be read", quality: "colour" },
  { text: "Bright decorative papers are chosen to suit the mood of the melody", quality: "colour" },
  { text: "The words and note names are written neatly, evenly sized and clear, perhaps in calligraphy", quality: "lettering" },
  { text: "Every letter is the same height and leans at the same slant", quality: "lettering" },
  { text: "How the parts of the card are positioned and balanced on the page", quality: "layout" },
  { text: "Whether the writing is tidy and easy to read", quality: "lettering" },
  { text: "Which hues are used for the background, the border and the text", quality: "colour" },
] as const;

const CARD_STEPS = [
  { id: "k1", label: "Compose a short melody using the sol-fa syllables d r m f s and the note values learnt" },
  { id: "k2", label: "Measure, cut and fold a piece of hard coloured paper to make the card layout" },
  { id: "k3", label: "Write your own melody neatly on the card, using French rhythm names or note symbols" },
  { id: "k4", label: "Cut out and paste assorted coloured papers to decorate the card, observing safety" },
  { id: "k5", label: "Show the finished card to peers and talk about your own and others' work" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sings a melody that goes d–r–m–r–d. Which composition technique is this mainly using?`,
      correct: "Stepwise motion — the tune moves to the next pitch up or down each time, with no skips",
      wrong: [
        "Narrow leaps — but there are no skipped pitches here; every move is to the neighbour",
        "Repetition of pitches — but no pitch is sung twice in a row",
        "Ending on a long note — but this describes how a tune ends, not how d–r–m–r–d moves",
      ],
      explanation: "d–r–m–r–d moves one rung of the sol-fa ladder at a time, which is stepwise motion. A leap would skip a pitch (like d–m), and repetition would sing a pitch twice in a row.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sings d–m–s–m–d. Which technique does this melody use?`,
    correct: "Narrow leaps — the tune skips over a pitch each time (d to m, m to s), making small jumps",
    wrong: [
      "Stepwise motion — but stepwise means moving to the neighbour pitch, and this skips one each time",
      "Repetition of pitches — but no pitch is repeated back to back",
      "Variation of pitches only — the specific feature here is the skipping, which is a leap",
    ],
    explanation: "d–m–s skips a pitch on each move (d skips r to reach m; m skips f to reach s), which is a narrow leap. Stepwise motion would be d–r–m.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sings s–s–s–m–d. Which technique appears at the start of this melody?`,
      correct: "Repetition of pitches — soh is sung three times in a row before the tune moves",
      wrong: [
        "Stepwise motion — but the tune stays on one pitch at the start rather than stepping",
        "Narrow leaps — but a repeated pitch is not a jump at all",
        "Ending on a long note — but this is about the start of the melody, not its ending",
      ],
      explanation: "Singing s–s–s repeats the same pitch two or more times in a row, which is repetition of pitches. The leap comes later (s to m to d).",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s class in ${place(rng)} is asked why a composer bothers to apply techniques like stepwise motion and repetition instead of choosing pitches at random. What is the best answer?`,
    correct: "The techniques give the melody shape, balance and a sense of direction, so it sounds musical rather than jumbled",
    wrong: [
      "The techniques make the melody longer without any change to how it sounds",
      "The techniques are only rules for exams and have no effect on the music",
      "Random pitches always sound better than a planned melody",
    ],
    explanation: "Composition techniques shape how a melody moves and rests, giving it structure and singability; a melody of random pitches has no shape or sense of completion.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} finishes a melody on a minim (a two-beat note) rather than a short one. Which technique is this, and what does it do?`,
      correct: "Ending on a long note — it gives the melody a feeling of rest and completeness",
      wrong: [
        "Stepwise motion — but that is about how the tune moves, not how it ends",
        "Repetition of pitches — a single long note is not a repeat",
        "Variation of pitches — a held final note does not vary the pitch",
      ],
      explanation: "Holding the final note for a long value (like a minim) is the 'ending on a long note' technique; it signals that the phrase is finished and lets it settle.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} shows the Kodaly hand sign for doh: a closed fist held low. What is the purpose of using hand signs while singing sol-fa?`,
    correct: "They show each pitch's height with the hand, helping singers feel and remember how high or low each syllable is",
    wrong: [
      "They tell the singer how loudly to sing each note",
      "They are a secret code and have nothing to do with pitch",
      "They replace the need to sing, so the class only signs silently",
    ],
    explanation: "Kodaly hand signs give each sol-fa syllable a shape and a height in the air, so singers can see and feel the rising and falling of pitch as they sing.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} designs a melody card and picks a pale yellow background with pale cream lettering. What is the problem, and which quality of the card does it concern?`,
      correct: "The lettering will be hard to read because it barely contrasts with the background — this is a colour problem",
      wrong: [
        "There is no problem; pale-on-pale always looks best on a card",
        "It is a layout problem — the words are in the wrong position",
        "It is a lettering problem — the letters are the wrong shape",
      ],
      explanation: "Colour, as a quality of a card, includes choosing text and background colours that contrast so the writing is readable. Pale lettering on a pale background fails that.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} crams the title, the whole melody and the decoration into the top corner of the card, leaving the rest blank. Which quality of the card needs work?`,
    correct: "Layout — the parts of the card should be arranged and spaced in a balanced way across the page",
    wrong: [
      "Colour — the hues chosen are the issue",
      "Lettering — the shape of the letters is the issue",
      "Nothing — where things sit on a card does not matter",
    ],
    explanation: "Layout is how the elements are positioned and balanced on the card. Crowding everything into one corner is a layout fault, not a colour or lettering one.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s group in ${place(rng)} sings the sol-fa syllables clearly, shaping each vowel and syllable. Which subject does the design link this to?`,
      correct: "English — articulating vowels and syllables clearly, which reinforces language skills",
      wrong: [
        "Mathematics — because the syllables are counted",
        "It links to no other subject",
        "Agriculture — because doh sounds like 'dough'",
      ],
      explanation: "The design links the melody sub-strand to English: singing the sol-fa scale gives practice in articulating vowels and syllables clearly.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sings d–d–m–m–s–s and calls it "stepwise motion". Is that correct?`,
    correct: "No — it repeats each pitch (repetition), and the moves between them (d to m, m to s) are leaps, not steps",
    wrong: [
      "Yes — any melody that rises is stepwise motion",
      "Yes — repeating a pitch is a kind of step",
      "No — it is actually 'ending on a long note'",
    ],
    explanation: "Stepwise motion means moving to the neighbouring pitch (d–r–m). d–d–m–m–s–s repeats pitches and then leaps over one each time, so it uses repetition and narrow leaps, not stepwise motion.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} composes a melody but sings the same pitch (doh) from start to finish with no change. Which technique is missing that would give the tune interest?`,
    correct: "Variation of pitches — changing the pitches so the melody moves and has shape",
    wrong: [
      "Repetition of pitches — but the tune already does nothing but repeat one pitch",
      "Ending on a long note — a held final note would not fix a tune stuck on one pitch",
      "Nothing is missing; a one-pitch tune is a complete melody",
    ],
    explanation: "A melody stuck on one pitch has no shape. Variation of pitches — moving between higher and lower pitches — is what gives a tune direction and interest.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} steps from doh up to soh on the sol-fa ladder. How many pitches higher is soh than doh?`,
      correct: "Four — the ladder goes doh(1), re(2), me(3), fah(4), soh(5), so soh is four rungs above doh",
      wrong: [
        "Five — counting doh itself as one of the steps taken",
        "Three — forgetting fah in the middle",
        "Two — counting only the ends",
      ],
      explanation: "Sol-fa order is d(1) r(2) m(3) f(4) s(5). From doh to soh you climb re, me, fah, soh — four steps up.",
    };
  },
];

const FILL_BLANK_TEMPLATES = [
  { before: "The five sol-fa syllables learnt in Grade 5, in order from lowest to highest, are d r m f ", after: ".", correctAnswer: "s", acceptedAnswers: ["s", "soh", "so"] },
  { before: "The full name of the sol-fa syllable written 'd' is ", after: ".", correctAnswer: "doh", acceptedAnswers: ["doh", "do"] },
  { before: "The full name of the sol-fa syllable written 's' is ", after: ".", correctAnswer: "soh", acceptedAnswers: ["soh", "so"] },
  { before: "Hand shapes that show the height of each sol-fa pitch as you sing are called ", after: " hand signs.", correctAnswer: "Kodaly", acceptedAnswers: ["Kodaly", "kodaly", "kodály"] },
  { before: "A melody that moves to the very next pitch up or down, with no skips, is using ", after: " motion.", correctAnswer: "stepwise" },
  { before: "A melody that skips over a pitch in a small jump, like d to m, is using narrow ", after: ".", correctAnswer: "leaps", acceptedAnswers: ["leaps", "leap"] },
  { before: "Singing the same pitch two or more times in a row is called ", after: " of pitches.", correctAnswer: "repetition" },
  { before: "Finishing a melody on a note held for a long value, to give a sense of rest, is called ending on a ", after: " note.", correctAnswer: "long" },
  { before: "How the title, melody and decoration are arranged and spaced on a card is called the card's ", after: ".", correctAnswer: "layout" },
  { before: "Neat, clear, evenly sized writing on a card is a good quality of its ", after: ".", correctAnswer: "lettering" },
  { before: "Choosing background and text hues that contrast so the writing can be read is part of a card's ", after: " quality.", correctAnswer: "colour" },
  { before: "On the sol-fa ladder, the pitch me is written with the single letter ", after: ".", correctAnswer: "m" },
] as const;

const LADDER_PROMPTS = [
  "Which sol-fa syllable is highlighted on the ladder?",
  "Look at the sol-fa ladder — which pitch is marked?",
  "Name the highlighted sol-fa syllable.",
  "Which pitch on the ladder is shown?",
  "Read the ladder: which sol-fa syllable is picked out?",
  "Which of these is the highlighted rung of the ladder?",
  "Identify the marked sol-fa pitch.",
  "Which sol-fa syllable does the ladder highlight?",
  "The ladder marks one pitch — which is it?",
  "Choose the highlighted sol-fa syllable.",
] as const;

const DEGREE_PROMPTS = [
  "On the sol-fa ladder, doh is step 1. Which step number is this syllable?",
  "Counting doh as 1, which rung of the ladder is this syllable?",
  "Which numbered step of the sol-fa ladder is this syllable?",
  "If doh is 1 and soh is 5, which number is this syllable?",
  "Mark the step number of this sol-fa syllable (doh = 1).",
  "Place the marker at this syllable's rung number (doh = 1, soh = 5).",
  "Which position on the five-rung ladder does this syllable hold?",
  "Give the step number for this sol-fa syllable, with doh as 1.",
  "How far up the ladder is this syllable? Mark its step number.",
  "Show this syllable's rung number on the line (doh = 1).",
] as const;

export const melody: Skill = {
  id: "g5-cas-melody",
  code: "C.5",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-creating-executing",
  grade: 5,
  title: "Melody",
  description:
    "Singing and reading the sol-fa syllables d r m f s and their Kodaly hand signs; the composition techniques stepwise motion, narrow leaps, repetition of pitches, variation of pitches and ending on a long note; and designing a melody card with good layout, colour and lettering.",
  generate(rng) {
    const branch = randChoice(rng, [
      "ladder-recognition",
      "solfa-order",
      "solfa-name-match",
      "solfa-degree-line",
      "technique-sort",
      "card-quality-sort",
      "card-order",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "ladder-recognition") {
      const target = randChoice(rng, SOLFA);
      const visual: VisualSpec = { type: "sol-fa-ladder", highlight: LADDER_HIGHLIGHT[target.id] };
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.name,
        SOLFA.filter((s) => s.id !== target.id).map((s) => s.name),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: pickPrompt(rng, LADDER_PROMPTS),
        choices,
        correctIndex,
        layout: "row",
        visual,
        hint: "The ladder rises doh, re, me, fah, soh from bottom to top.",
        explanation: `The highlighted pitch is ${target.name} (written '${target.short}').`,
      };
    }

    if (branch === "solfa-order") {
      const dir = randChoice(rng, ["up", "down"] as const);
      const ordered = dir === "up" ? SOLFA.map((s) => s.name) : [...SOLFA].reverse().map((s) => s.name);
      const items = shuffle(rng, SOLFA.map((s) => ({ id: s.id, label: s.name })));
      const correctOrder = dir === "up" ? SOLFA.map((s) => s.id) : [...SOLFA].reverse().map((s) => s.id);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (sol-fa syllables, ${dir === "up" ? "lowest pitch first" : "highest pitch first"})`,
        items,
        correctOrder,
        instruction: "Drag to arrange the pitches in order.",
        hint: "Sol-fa rises doh, re, me, fah, soh.",
        explanation: `Correct order: ${ordered.join(" → ")}.`,
      };
    }

    if (branch === "solfa-name-match") {
      const tokens = shuffle(rng, SOLFA.map((s) => ({ id: s.id, label: s.name })));
      const targets = shuffle(rng, SOLFA.map((s) => ({ id: s.id, label: `Kodaly sign: ${s.sign}` })));
      const correctMap: Record<string, string> = {};
      SOLFA.forEach((s) => (correctMap[s.id] = s.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "doh is a fist; soh is a flat upright hand, palm out; me is a level flat hand palm down.",
        explanation: SOLFA.map((s) => `${s.name}: ${s.sign}.`).join(" "),
      };
    }

    if (branch === "solfa-degree-line") {
      const target = randChoice(rng, SOLFA);
      return {
        kind: "number-line",
        prompt: `${pickPrompt(rng, DEGREE_PROMPTS)}  Syllable: ${target.name}`,
        min: 1,
        max: 5,
        step: 1,
        correctValue: target.degree,
        mode: "point",
        hint: "doh = 1, re = 2, me = 3, fah = 4, soh = 5.",
        explanation: `${target.name} is step ${target.degree} of the sol-fa ladder (d=1, r=2, m=3, f=4, s=5).`,
      };
    }

    if (branch === "technique-sort") {
      const chosen = shuffle(rng, TECH_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `tf${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`tf${i}`] = f.tech));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "stepwise", label: "Stepwise motion" },
          { id: "narrow-leap", label: "Narrow leaps" },
          { id: "repetition", label: "Repetition of pitches" },
          { id: "variation", label: "Variation of pitches" },
          { id: "long-ending", label: "Ending on a long note" },
        ],
        correctBucket,
        hint: "Step = to the neighbour pitch; leap = skip a pitch; repetition = same pitch twice; variation = pitches keep changing; long ending = held final note.",
        explanation: chosen
          .map((f) => {
            const labels: Record<string, string> = {
              stepwise: "stepwise motion",
              "narrow-leap": "a narrow leap",
              repetition: "repetition of pitches",
              variation: "variation of pitches",
              "long-ending": "ending on a long note",
            };
            return `"${f.text}" — ${labels[f.tech]}.`;
          })
          .join(" "),
      };
    }

    if (branch === "card-quality-sort") {
      const chosen = shuffle(rng, CARD_QUALITY_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `cq${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`cq${i}`] = f.quality));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "layout", label: "Layout" },
          { id: "colour", label: "Colour" },
          { id: "lettering", label: "Lettering" },
        ],
        correctBucket,
        hint: "Layout = where things sit and how they are spaced; colour = the hues chosen; lettering = how the writing looks.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.quality}.`).join(" "),
      };
    }

    if (branch === "card-order") {
      const shuffled = shuffle(rng, CARD_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (designing a decorated melody card)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: CARD_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Compose the melody first, then make the card layout, write the melody on it, decorate it, and share it last.",
        explanation: "Correct order: " + CARD_STEPS.map((s) => s.label).join(" → ") + ".",
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
        hint: "Work out how the tune moves (step, leap, repeat), how it ends, what hand signs do, and which card quality a fault belongs to.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    const accepted = "acceptedAnswers" in fb && fb.acceptedAnswers ? fb.acceptedAnswers : [fb.correctAnswer];
    return {
      kind: "fill-blank",
      prompt: pickPrompt(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...accepted],
      inputMode: "text",
      hint: "Think about the sol-fa syllables d r m f s, the five composition techniques, and the card qualities layout, colour and lettering.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
