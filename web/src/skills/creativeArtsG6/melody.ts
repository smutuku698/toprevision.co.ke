import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, sub-strand 1.7 "Melody" (kept as one skill). Source content: sing
// sol-fa syllables doh to doh1 ascending/descending; perform the sol-fa ladder using Kodaly hand
// signs; aurally recognise sol-fa sounds in familiar melodies; compose short melodies within
// doh-doh1 using named composition techniques — narrow leaps (thirds), stepwise motion,
// repetition, variation, and appropriate ending; write sol-fa syllables using calligraphy
// lettering. Full sol-fa range: doh, re, me, fah, soh, lah, te, doh1 (d r m f s l t d1). Core
// competencies name "Critical thinking and Problem solving" — at least one Analyze/Evaluate
// branch is required, not just recall.

const STEPS = [
  { id: "doh", label: "doh", index: 1 },
  { id: "re", label: "re", index: 2 },
  { id: "me", label: "me", index: 3 },
  { id: "fah", label: "fah", index: 4 },
  { id: "soh", label: "soh", index: 5 },
  { id: "lah", label: "lah", index: 6 },
  { id: "te", label: "te", index: 7 },
  { id: "doh1", label: "doh¹", index: 8 },
] as const;

const TECHNIQUES: { id: string; label: string; meaning: string; blank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] } }[] = [
  {
    id: "stepwise-motion",
    label: "Stepwise motion",
    meaning: "Moving from one sol-fa syllable to the very next one, with no notes skipped",
    blank: { before: "Moving from one sol-fa syllable to the very next one, with no notes skipped, is called ", after: " motion.", correctAnswer: "stepwise" },
  },
  {
    id: "narrow-leaps",
    label: "Narrow leaps (thirds)",
    meaning: "Skipping over one sol-fa syllable to reach the next, such as doh to me",
    blank: { before: "Skipping over one sol-fa syllable to reach the next, such as doh to me, is called a narrow ", after: " (a third).", correctAnswer: "leap" },
  },
  {
    id: "repetition",
    label: "Repetition",
    meaning: "Repeating the same short musical phrase again, unchanged",
    blank: { before: "Repeating the same short musical phrase again, unchanged, is called ", after: ".", correctAnswer: "repetition" },
  },
  {
    id: "variation",
    label: "Variation",
    meaning: "Repeating a phrase with a small, deliberate change rather than exactly the same",
    blank: { before: "Repeating a phrase with a small, deliberate change is called ", after: ".", correctAnswer: "variation" },
  },
  {
    id: "appropriate-ending",
    label: "Appropriate ending",
    meaning: "Finishing a melody in a way that feels complete, often by returning to doh",
    blank: { before: "Finishing a melody in a way that feels complete, often by returning to doh, is called an ", after: " ending.", correctAnswer: "appropriate" },
  },
];

const MOTION_PAIRS: { a: (typeof STEPS)[number]; b: (typeof STEPS)[number]; kind: "step" | "leap" }[] = [];
for (let i = 0; i < STEPS.length - 1; i++) {
  MOTION_PAIRS.push({ a: STEPS[i], b: STEPS[i + 1], kind: "step" });
}
for (let i = 0; i < STEPS.length - 2; i++) {
  MOTION_PAIRS.push({ a: STEPS[i], b: STEPS[i + 2], kind: "leap" });
}

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} composes a melody in ${place(rng)} that sings doh-re-me-fah, moving to each very next syllable with no notes skipped. Which composition technique is this?`,
      correct: "Stepwise motion — moving to the next adjacent sol-fa syllable each time",
      wrong: [
        "Narrow leaps (thirds) — a leap specifically skips over a syllable, which does not happen here",
        "Repetition — no phrase is repeated here, the melody keeps moving forward",
        "Appropriate ending — this describes how a melody finishes, not how it moves through the middle",
      ],
      explanation: "Doh-re-me-fah moves to each very next syllable with nothing skipped, which is exactly what stepwise motion means — narrow leaps would skip a syllable, and no phrase is repeated here.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} composes a melody in ${place(rng)} that jumps from doh straight to me, skipping over re. Which composition technique is being used?`,
    correct: "A narrow leap (a third) — skipping over one syllable to reach the next",
    wrong: [
      "Stepwise motion — stepwise motion moves to the very next syllable, without skipping",
      "Variation — variation is about changing a repeated phrase, not the size of a single jump",
      "Repetition — repetition means repeating a phrase, not a single interval between two notes",
    ],
    explanation: "Jumping from doh to me skips over re, which is a narrow leap of a third — stepwise motion would move to re first, and repetition/variation describe how phrases relate to each other, not a single interval.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s melody in ${place(rng)} sings the phrase "doh-me-soh" and then sings the exact same "doh-me-soh" again, unchanged. Which technique is this?`,
      correct: "Repetition — repeating the same short phrase again, unchanged",
      wrong: [
        "Variation — variation involves a deliberate change, but here the phrase repeats exactly",
        "Stepwise motion — doh to me to soh moves in leaps, not adjacent steps",
        "Appropriate ending — this describes how a melody finishes overall, not a repeated phrase in the middle",
      ],
      explanation: "Singing the exact same phrase again with no change is repetition — if the second phrase had been altered slightly, that would be variation instead.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sings "doh-me-soh" the first time, then "doh-me-lah" the second time, changing only the last note. Which composition technique is this?`,
    correct: "Variation — repeating a phrase with a small, deliberate change",
    wrong: [
      "Repetition — repetition means repeating a phrase exactly unchanged, but the last note changed here",
      "Narrow leap — this describes a single interval, not how a whole phrase relates to an earlier one",
      "Stepwise motion — this melody moves in leaps (doh to me to soh/lah), not adjacent steps",
    ],
    explanation: "Changing the last note between two otherwise similar phrases is variation — a small, deliberate change, unlike repetition, which would keep the phrase exactly the same.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} composes a short melody in ${place(rng)} that wanders through several notes and finally returns to doh at the very end. Why does the source consider this an important composition choice?`,
      correct: "It gives the melody an appropriate ending, so it feels complete and resolved to the listener",
      wrong: [
        "It has no real effect on how the melody feels to a listener",
        "It is only important if the melody used narrow leaps earlier",
        "Returning to doh is required after every single phrase, not just the final one",
      ],
      explanation: "Ending a melody by returning to doh gives it a sense of completion — an appropriate ending — which is a distinct, valued composition choice, not something required after every phrase.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} composes a melody that ends abruptly on "te", the syllable just below doh, without resolving further. Compared to ending on doh, what is the likely effect?`,
    correct: "The melody will feel unfinished or unresolved, rather than complete",
    wrong: [
      "The melody will sound exactly as complete as one ending on doh",
      "Ending on te is not possible within the doh-doh1 range at all",
      "The melody will automatically be judged as using stepwise motion",
    ],
    explanation: "Ending on te instead of doh tends to leave a melody feeling unresolved, since doh is the note that gives a strong sense of completion — te is well within the doh-doh1 range, and the choice of ending note does not by itself determine whether stepwise motion was used.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} performs the sol-fa ladder using Kodaly hand signs while a classmate only sings the syllables aloud, with no hand signs at all. What extra support do Kodaly hand signs specifically add?`,
      correct: "A visual, physical cue for each pitch, helping the singer feel where each syllable sits in the scale",
      wrong: [
        "They change the actual pitch that is sung for each syllable",
        "They are only used for the doh and doh1 syllables, not the others",
        "They replace the need to sing the syllables aloud at all",
      ],
      explanation: "Kodaly hand signs give a visual, physical cue for each pitch, reinforcing where a syllable sits in the scale — they do not change the pitch itself, are used across all the syllables, and work alongside singing, not instead of it.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} aurally recognises "soh" within a familiar melody without seeing it written down. What skill is being demonstrated?`,
    correct: "Aural recognition — identifying a sol-fa sound by ear, from a familiar melody",
    wrong: [
      "Calligraphy lettering — this is a written skill, not a listening skill",
      "Composition — composing means creating a new melody, not identifying an existing one by ear",
      "Stepwise motion — this describes how a melody moves, not the skill of recognising it by ear",
    ],
    explanation: "Identifying a sol-fa sound by listening, without seeing it written down, is aural recognition — calligraphy, composition, and stepwise motion are all separate named skills or concepts.",
  }),
];

const LADDER_PROMPTS = ["Which sol-fa syllable is highlighted?", "Name the highlighted step on the sol-fa ladder.", "Identify the highlighted syllable.", "Which step is highlighted on the ladder?", "Read the ladder — which syllable is highlighted?"] as const;
const ORDER_PROMPTS = ["Put these sol-fa syllables in ascending order.", "Arrange these syllables from doh to doh¹.", "Order these sol-fa syllables, lowest to highest.", "Sort these syllables into ascending pitch order.", "Place these syllables in order from lowest to highest."] as const;
const TECH_MATCH_PROMPTS = ["Match each composition technique to its meaning.", "Pair each technique with its definition.", "Match each technique to what it means.", "Connect each technique to its correct meaning.", "For each technique below, choose its matching meaning."] as const;
const MOTION_CATEGORIZE_PROMPTS = ["Sort each pair of syllables as a step or a leap.", "Is each pair a stepwise move or a leap? Sort them.", "Sort these syllable pairs by stepwise motion or leap.", "Classify each pair as step or leap.", "Decide whether each pair moves by step or leap, and sort it."] as const;
const FILL_BLANK_PROMPTS = ["Complete the sentence.", "Fill in the missing word.", "Complete this sentence about melody.", "Fill in the blank below.", "Complete the sentence with the correct word."] as const;

export const melody: Skill = {
  id: "g6-cas-melody",
  code: "C.10",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-creating-executing",
  grade: 6,
  title: "Melody",
  description: "Singing the sol-fa ladder doh to doh¹, aural recognition, and composing melodies using stepwise motion, narrow leaps (thirds), repetition, variation, and an appropriate ending.",
  generate(rng) {
    const branch = randChoice(rng, ["ladder-highlight", "ladder-order", "technique-match", "motion-categorize", "reasoning", "fill-blank"] as const);

    if (branch === "ladder-highlight") {
      const step = randChoice(rng, STEPS);
      const others = shuffle(rng, STEPS.filter((s) => s.id !== step.id)).slice(0, 3);
      const choices = shuffle(rng, [step.label, ...others.map((s) => s.label)]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, LADDER_PROMPTS),
        choices,
        correctIndex: choices.indexOf(step.label),
        layout: "row",
        visual: { type: "sol-fa-ladder", highlight: step.id },
        hint: "The ladder runs from doh at the bottom to doh¹ at the top: doh, re, me, fah, soh, lah, te, doh¹.",
        explanation: `The highlighted step is ${step.label}.`,
      };
    }

    if (branch === "ladder-order") {
      const shuffled = shuffle(rng, STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: STEPS.map((s) => s.id),
        instruction: "Drag to arrange from lowest to highest.",
        hint: "The full ladder is doh, re, me, fah, soh, lah, te, doh¹.",
        explanation: "Correct order: " + STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "technique-match") {
      const chosen = shuffle(rng, TECHNIQUES);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t) => (correctMap[t.id] = t.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, TECH_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about how far a melody moves, whether a phrase repeats, and how a melody finishes.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "motion-categorize") {
      const chosen = shuffle(rng, MOTION_PAIRS).slice(0, 8);
      const items = chosen.map((p, i) => ({ id: `m${i}`, label: `${p.a.label} to ${p.b.label}` }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`m${i}`] = p.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, MOTION_CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "step", label: "Stepwise motion" },
          { id: "leap", label: "Narrow leap (third)" },
        ],
        correctBucket,
        hint: "A step moves to the very next syllable; a leap skips over one syllable to reach the next.",
        explanation: chosen.map((p) => `"${p.a.label} to ${p.b.label}" is a ${p.kind === "step" ? "step" : "leap"}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about how the melody moves, whether a phrase repeats or changes, and how it finishes.", explanation: q.explanation };
    }

    const t = randChoice(rng, TECHNIQUES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: t.blank.before,
      after: t.blank.after,
      correctAnswer: t.blank.correctAnswer,
      acceptedAnswers: t.blank.acceptedAnswers ?? [t.blank.correctAnswer],
      inputMode: "text",
      hint: "Think about stepwise motion, narrow leaps, repetition, variation, and appropriate endings.",
      explanation: `${t.label}: ${t.meaning}.`,
    };
  },
};
