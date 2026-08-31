import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 3.0 Etiquette-Table Manners, sub-strand 3.4 Mechanics of Writing:
// Handwriting — joined (cursive) script; legibility and neatness.
// Content here is narrow (no numeric/spatial angle), so this skill branches 5 QuestionKinds
// (mc / fill-blank / categorize / click-match / ordering) — hotspot/number-line do not fit.
// See curriculum-reference/grade-5/english.json.

const FACTORS: { name: string; desc: string; good: string; bad: string }[] = [
  { name: "Consistent letter size", desc: "all small letters the same height, all capitals the same height", good: "keeps every 'a', 'e' and 'o' the same size", bad: "makes some letters tiny and others huge in the same word" },
  { name: "Even spacing", desc: "equal gaps between letters, and a clear finger-width gap between words", good: "leaves one finger space between each word", bad: "squashes some words together and leaves big gaps elsewhere" },
  { name: "Uniform slant", desc: "every letter leaning the same way (upright, or all slightly to the right)", good: "slants every letter the same amount", bad: "leans some letters left and some right" },
  { name: "Letters on the line", desc: "each letter sitting neatly on the base line", good: "keeps every letter sitting on the line", bad: "lets letters float above or drop below the line" },
  { name: "Correct joins", desc: "joining strokes that link one cursive letter smoothly to the next", good: "joins each letter to the next with a smooth stroke", bad: "leaves gaps between joined letters or crosses strokes wrongly" },
  { name: "Neat ascenders and descenders", desc: "the tall parts (b, d, h, l) and the tails (g, j, p, y) the right length", good: "makes the tail of every 'g' and 'y' the same length", bad: "makes some tails long and looping and others barely there" },
  { name: "Steady pressure", desc: "pressing evenly so the ink is the same darkness throughout", good: "presses evenly so every line is the same darkness", bad: "presses so hard the paper tears in places and so lightly elsewhere the words fade" },
];

export const cursiveHandwriting: Skill = {
  id: "g5-eng-writing-cursive-handwriting",
  code: "W.3",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Handwriting: Joined (Cursive) Script and Legibility",
  description: "Recognise joined/cursive writing and know the habits that make handwriting legible and neat — consistent size, even spacing, uniform slant, sitting on the line, and correct joins.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-factor", "fill-factor", "sort-neat", "match", "order-steps", "reason"] as const);

    if (branch === "mc-factor") {
      const f = randChoice(rng, FACTORS);
      const { choices, correctIndex } = mcFromCluster(rng, `It ${f.good}.`, shuffle(rng, FACTORS.filter((x) => x.name !== f.name)).slice(0, 3).map((x) => `It ${x.good}.`), 3);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the habit that shows good " + f.name.toLowerCase())}\nWhich habit belongs to "${f.name}"?`,
        choices,
        correctIndex,
        layout: "list",
        hint: `"${f.name}" is about ${f.desc}.`,
        explanation: `Good ${f.name.toLowerCase()}: it ${f.good}.`,
      };
    }

    if (branch === "fill-factor") {
      const f = randChoice(rng, FACTORS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the missing key word for this legibility habit"),
        before: `Leaving a clear finger-width gap between every word shows even `,
        after: ` — actually, name the habit shown by: "${f.desc}".`,
        correctAnswer: f.name.split(" ")[f.name.split(" ").length - 1].toLowerCase(),
        acceptedAnswers: [f.name.toLowerCase(), f.name.split(" ").pop()!.toLowerCase()],
        inputMode: "text",
        hint: "The habits are: consistent size, even spacing, uniform slant, letters on the line, correct joins, neat ascenders and descenders, steady pressure.",
        explanation: `This describes "${f.name}".`,
      };
    }

    if (branch === "sort-neat") {
      const pool = shuffle(rng, FACTORS).slice(0, 4);
      const items = shuffle(rng, pool.flatMap((f, i) => [
        { id: `g${i}`, label: `A pupil ${f.good}.`, kind: "neat" },
        { id: `b${i}`, label: `A pupil ${f.bad}.`, kind: "messy" },
      ])).slice(0, 6);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each handwriting habit makes writing legible or hard to read"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "neat", label: "Makes writing legible and neat" },
          { id: "messy", label: "Makes writing hard to read" },
        ],
        correctBucket,
        hint: "Legible writing is even and regular. Messy writing is uneven — different sizes, slants, spaces or pressure.",
        explanation: "Legible handwriting keeps letters the same size, evenly spaced, on the line, joined smoothly, with the same slant and steady pressure.",
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, FACTORS).slice(0, 5);
      const tokens = shuffle(rng, pool.map((f) => ({ id: f.name, label: f.name })));
      const targets = shuffle(rng, pool.map((f) => ({ id: f.name, label: f.desc })));
      const correctMap: Record<string, string> = {};
      pool.forEach((f) => (correctMap[f.name] = f.name));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "handwriting habit to what it means"),
        tokens,
        targets,
        correctMap,
        hint: "Read each description and name the habit it is about.",
        explanation: pool.map((f) => `${f.name}: ${f.desc}`).join("  "),
      };
    }

    if (branch === "order-steps") {
      const steps = [
        { id: "posture", label: "Sit up straight and hold the pencil correctly" },
        { id: "line", label: "Start each letter on the base line" },
        { id: "form", label: "Form each letter with the correct shape and the right size" },
        { id: "join", label: "Join each letter to the next with a smooth stroke" },
        { id: "check", label: "Check the finished line for even spacing and slant, and re-write anything unclear" },
      ];
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps for writing a neat line of joined script"),
        instruction: "Click the steps in the correct order.",
        items: shuffle(rng, steps),
        correctOrder: ["posture", "line", "form", "join", "check"],
        hint: "Get ready first, write carefully, then check.",
        explanation: "Sit and hold correctly → start on the line → form each letter well → join smoothly → check spacing and slant, and fix anything unclear.",
      };
    }

    // reason — Evaluate: a pupil's writing is hard to read for one reason. Which fix helps?
    const f = randChoice(rng, FACTORS);
    const { choices, correctIndex } = mcFromCluster(rng, `Work on ${f.name.toLowerCase()}.`, shuffle(rng, FACTORS.filter((x) => x.name !== f.name)).slice(0, 3).map((x) => `Work on ${x.name.toLowerCase()}.`), 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, `The teacher writes on ${name(rng)}'s book: "Your writing is hard to read because you ${f.bad}."`, "What should the pupil work on?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Match the problem the teacher described to the handwriting habit that would fix it.",
      explanation: `The pupil should work on ${f.name.toLowerCase()} — good ${f.name.toLowerCase()} means the writer ${f.good}.`,
    };
  },
};
