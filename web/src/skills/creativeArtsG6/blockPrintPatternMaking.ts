import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, sub-strand 1.4 "Rhythm and Pattern Making" — the block-print
// pattern-making half. The rhythm-notation half of this same sub-strand ships separately as
// rhythmNotation.ts (C.6), per curriculum-reference/grade-6/creative-arts.json's split note.
// Source content: prepare a printing block from available resources (rubber/old slippers, wood)
// using a geometric shape motif; improvise dye/printing paste, observing safety; block print a
// full repeat pattern on a small fabric using contrasting colours; neaten by trimming/stitching
// and ironing into a small decorated table mat.

const MOTIFS = ["triangle", "circle", "diamond", "square"] as const;

const MATERIALS = [
  { label: "An old rubber slipper, carved with a shape", bucket: "block" },
  { label: "A block of wood, carved with a shape", bucket: "block" },
  { label: "A sheet of thick rubber, carved with a shape", bucket: "block" },
  { label: "Natural dye improvised from crushed leaves or plant material", bucket: "colour" },
  { label: "Artificial printing paste mixed for the fabric", bucket: "colour" },
  { label: "A contrasting-coloured fabric dye ready for printing", bucket: "colour" },
  { label: "A needle and thread", bucket: "finish" },
  { label: "A pair of scissors for trimming edges", bucket: "finish" },
  { label: "An iron for pressing the finished mat", bucket: "finish" },
  { label: "A small square of stiff cardboard, carved with a geometric motif", bucket: "block" },
  { label: "A pot for mixing printing paste safely", bucket: "colour" },
  { label: "Thread for stitching the mat's trimmed edges", bucket: "finish" },
] as const;

const TERMS: { id: string; label: string; meaning: string; blank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] } }[] = [
  {
    id: "motif",
    label: "Motif",
    meaning: "The geometric shape carved into a printing block, repeated across the pattern",
    blank: { before: "The geometric shape carved into a printing block, repeated across the pattern, is called the ", after: ".", correctAnswer: "motif" },
  },
  {
    id: "repeat-pattern",
    label: "Full repeat pattern",
    meaning: "The same motif printed over and over in a regular arrangement across the fabric",
    blank: { before: "The same motif printed over and over in a regular arrangement is called a full ", after: " pattern.", correctAnswer: "repeat" },
  },
  {
    id: "contrasting-colours",
    label: "Contrasting colours",
    meaning: "Colours that stand out clearly against each other, making a printed motif easy to see",
    blank: { before: "Colours that stand out clearly against each other, making a motif easy to see, are called ", after: " colours.", correctAnswer: "contrasting" },
  },
  {
    id: "printing-block",
    label: "Printing block",
    meaning: "A carved surface, made from materials such as rubber, old slippers, or wood, used to stamp a motif repeatedly",
    blank: { before: "A carved surface used to stamp a motif repeatedly, made from rubber, old slippers, or wood, is called a printing ", after: ".", correctAnswer: "block" },
  },
  {
    id: "neatening",
    label: "Neatening",
    meaning: "Finishing a printed piece by trimming, stitching, and ironing it",
    blank: { before: "Finishing a printed piece by trimming, stitching, and ironing it is called ", after: ".", correctAnswer: "neatening" },
  },
];

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is mixing an artificial printing paste for a block-print table mat. Why does the source specifically say to observe safety while improvising this paste?`,
      correct: "Improvised dyes and pastes can involve materials that irritate skin or eyes if handled carelessly",
      wrong: [
        "Because printing paste is always more dangerous than any other art material used in class",
        "Because only a teacher is legally allowed to touch printing paste",
        "Safety has no real reason here — it is just a general instruction with no specific risk",
      ],
      explanation: "Improvising a dye or printing paste can involve materials that irritate skin or eyes, so the source specifically flags safety for this step — not because printing paste is uniquely dangerous compared to all other materials, or restricted only to teachers.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s printing block in ${place(rng)} is carved with a diamond motif, but when stamped repeatedly across the fabric, some diamonds are spaced irregularly and others overlap. What has gone wrong with the full repeat pattern?`,
    correct: "The block was not stamped in a regular, evenly spaced arrangement, so the pattern is not a true full repeat",
    wrong: [
      "Nothing went wrong — a repeat pattern can have irregular spacing and still count as full",
      "The motif itself (a diamond) is not allowed to be used in a repeat pattern",
      "The problem is only with the colour of dye used, not the spacing",
    ],
    explanation: "A full repeat pattern requires the motif to be printed in a regular, evenly spaced arrangement — irregular spacing or overlapping stamps breaks that regularity, regardless of which motif shape or colour was chosen.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} prints a red motif onto pale yellow fabric in ${place(rng)}, while a classmate prints a pale yellow motif onto pale cream fabric. Whose choice better shows contrasting colours?`,
      correct: `${who}'s choice — red on pale yellow stands out much more clearly than pale yellow on pale cream`,
      wrong: [
        "The classmate's choice — pale colours always contrast better than bold ones",
        "Neither choice matters, because contrast has no effect on how a block print looks",
        "Both choices are equally contrasting, since any two different colours count as contrasting",
      ],
      explanation: `Contrasting colours stand out clearly against each other — red on pale yellow (${who}'s choice) is far more visible than two very similar pale colours, which barely stand out from one another.`,
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} finishes block printing a table mat but skips trimming, stitching, and ironing it before calling it done. What step of the process has been left out?`,
    correct: "Neatening — finishing the piece by trimming, stitching, and ironing it",
    wrong: [
      "Preparing the printing block — this step happens before printing, not after",
      "Choosing the motif — this also happens before printing begins",
      "Mixing the dye or paste — this also happens before printing begins",
    ],
    explanation: "Trimming, stitching, and ironing are the neatening steps that come after printing to finish the mat — the other named steps (choosing a motif, preparing the block, mixing dye) all happen earlier in the process.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} chooses to carve a circular motif into an old rubber slipper rather than buying a new printing tool. What value does reusing the old slipper show?`,
      correct: "Resourcefulness in recycling available materials, using what is at hand rather than buying new",
      wrong: [
        "It shows the print will automatically look neater than one made with a new tool",
        "It shows the motif must always be circular when using recycled rubber",
        "It has no connection to any value — it is simply the only option available",
      ],
      explanation: "Using an available material like an old slipper to carve a printing block, rather than buying something new, reflects resourcefulness and recycling — it does not determine the motif shape or the neatness of the finished print.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} carves a triangle motif into a block, but presses it onto the fabric at random angles and spacing rather than in a planned grid. What will the resulting print most likely look like?`,
    correct: "A messy, uneven arrangement rather than a clean full repeat pattern",
    wrong: [
      "Exactly the same as a carefully planned full repeat pattern, since the motif is identical either way",
      "A pattern that automatically corrects itself once dry",
      "A pattern that can only be fixed by choosing a different motif shape",
    ],
    explanation: "Pressing a block at random angles and spacing produces a messy, uneven result — a true full repeat pattern requires a planned, regular arrangement, not just repeated use of the same motif shape.",
  }),
];

const MOTIF_PROMPTS = ["Which motif is shown in this repeat pattern?", "Identify the motif used in this print.", "Look at the pattern — which shape is the motif?", "Name the motif repeated in this pattern.", "Which geometric shape is this pattern's motif?"] as const;
const MATERIALS_PROMPTS = ["Sort each item by what stage of block printing it belongs to.", "Which stage does each item belong to? Sort them.", "Sort these block-printing materials by their use.", "Classify each item as a block, colouring, or finishing material.", "Match each item to its stage in the process by sorting."] as const;
const TERM_MATCH_PROMPTS = ["Match each term to its meaning.", "Pair each block-printing term with its definition.", "Match each word to what it means in block printing.", "Connect each term to its correct meaning.", "For each term below, choose its matching meaning."] as const;
const STEPS_PROMPTS = ["Put these block-printing steps in the correct order.", "Arrange the steps for making a block-print table mat.", "Order these steps, from first to last.", "Sort these printing steps into the correct sequence.", "Place these steps in the order you would follow them."] as const;
const FILL_BLANK_PROMPTS = ["Complete the sentence.", "Fill in the missing word.", "Complete this sentence about block printing.", "Fill in the blank below.", "Complete the sentence with the correct word."] as const;

const PROCESS_STEPS = [
  { id: "p1", label: "Prepare a printing block from available resources (rubber, old slippers, or wood) using a geometric motif" },
  { id: "p2", label: "Improvise a natural dye paste or artificial printing paste, observing safety" },
  { id: "p3", label: "Block print a full repeat pattern on a small fabric using contrasting colours" },
  { id: "p4", label: "Let the printed fabric dry" },
  { id: "p5", label: "Neaten the mat by trimming and stitching the edges" },
  { id: "p6", label: "Iron the finished table mat" },
] as const;

export const blockPrintPatternMaking: Skill = {
  id: "g6-cas-block-print-pattern-making",
  code: "C.7",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-creating-executing",
  grade: 6,
  title: "Block-print pattern making",
  description: "Preparing a printing block with a geometric motif, block printing a full repeat pattern using contrasting colours, and neatening a small decorated table mat.",
  generate(rng) {
    const branch = randChoice(rng, ["motif-recognition", "materials-categorize", "term-match", "reasoning", "steps-order", "fill-blank"] as const);

    if (branch === "motif-recognition") {
      const motif = randChoice(rng, MOTIFS);
      const others = MOTIFS.filter((m) => m !== motif);
      const choices = shuffle(rng, [motif, ...others]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, MOTIF_PROMPTS),
        choices: choices.map((m) => m.charAt(0).toUpperCase() + m.slice(1)),
        correctIndex: choices.indexOf(motif),
        layout: "list",
        visual: { type: "block-print-pattern", motif },
        hint: "Look closely at the shape repeated in the grid.",
        explanation: `The motif shown is a ${motif}.`,
      };
    }

    if (branch === "materials-categorize") {
      const chosen = shuffle(rng, MATERIALS).slice(0, 8);
      const items = chosen.map((m, i) => ({ id: `mat${i}`, label: m.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((m, i) => (correctBucket[`mat${i}`] = m.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, MATERIALS_PROMPTS),
        items,
        buckets: [
          { id: "block", label: "Making the block" },
          { id: "colour", label: "Colouring/dyeing" },
          { id: "finish", label: "Finishing/neatening" },
        ],
        correctBucket,
        hint: "Block materials are carved; colouring materials go onto the fabric; finishing tools come after printing.",
        explanation: chosen.map((m) => `"${m.label}" belongs to ${m.bucket === "block" ? "making the block" : m.bucket === "colour" ? "colouring/dyeing" : "finishing/neatening"}.`).join(" "),
      };
    }

    if (branch === "term-match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t) => (correctMap[t.id] = t.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, TERM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about the shape, the arrangement, the colours, the tool, and the finishing step.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about safety, spacing, contrast, and the order of steps.", explanation: q.explanation };
    }

    if (branch === "steps-order") {
      const shuffled = shuffle(rng, PROCESS_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PROCESS_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Make the block and paste first, then print, dry, and neaten last.",
        explanation: "Correct order: " + PROCESS_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    const t = randChoice(rng, TERMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: t.blank.before,
      after: t.blank.after,
      correctAnswer: t.blank.correctAnswer,
      acceptedAnswers: t.blank.acceptedAnswers ?? [t.blank.correctAnswer],
      inputMode: "text",
      hint: "Think about motif, repeat pattern, contrasting colours, block, and neatening.",
      explanation: `${t.label}: ${t.meaning}.`,
    };
  },
};
