import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ASCENDERS = ["b", "d", "f", "h", "k", "l", "t"];
const DESCENDERS = ["g", "j", "p", "q", "y"];
const XHEIGHT = ["a", "c", "e", "i", "m", "n", "o", "r", "s", "u", "v", "w", "x", "z"];

const GROUPS = [
  {
    id: "ascender",
    label: "Ascender letter",
    article: "an",
    description: "A letter whose stem rises above the x-height (the height of a lower-case 'x'), e.g. b, d, h, k, l, t",
  },
  {
    id: "descender",
    label: "Descender letter",
    article: "a",
    description: "A letter whose tail drops below the baseline, e.g. g, j, p, q, y",
  },
  {
    id: "xheight",
    label: "x-height letter",
    article: "an",
    description: "A letter that sits entirely between the baseline and the x-height line, with no tall stem or dropped tail, e.g. a, c, e, m, n, o, s, u, v, w, x, z",
  },
] as const;

const GROUP_OF: Record<string, (typeof GROUPS)[number]> = {};
for (const l of ASCENDERS) GROUP_OF[l] = GROUPS[0];
for (const l of DESCENDERS) GROUP_OF[l] = GROUPS[1];
for (const l of XHEIGHT) GROUP_OF[l] = GROUPS[2];

const QUALITIES: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Which of these is a quality of good handwriting?",
    correct: "Letters are a consistent size and sit evenly on the line",
    distractors: ["Letters are different sizes on every line", "Words are squeezed together with no spacing", "Some words slope up and others slope down"],
  },
  {
    q: "Why should you leave even spacing between words when writing?",
    correct: "So the reader can clearly tell where one word ends and the next begins",
    distractors: ["So the page looks emptier", "So the writing takes up less space", "Spacing between words does not matter"],
  },
  {
    q: "Why is it important to write legibly and neatly?",
    correct: "So that the reader can understand the message without difficulty or confusion",
    distractors: ["So that only the writer can read it", "Because untidy writing is faster to mark", "Because legibility only matters in examinations"],
  },
  {
    q: "What can happen when ascenders and descenders are not clearly formed?",
    correct: "Similar-looking letters, such as 'a' and 'd', or 'y' and 'g', can be confused, making the writing hard to read",
    distractors: ["Nothing changes about how readable the writing is", "The writing automatically becomes neater", "The reader will always guess the word correctly"],
  },
];

export const writingLegibly: Skill = {
  id: "g8-eng-w-writing-legibly",
  code: "W.1",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Writing Legibly and Neatly",
  description: "Classify letters by height (ascenders, descenders, x-height) and recognise the qualities of legible, neat handwriting.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "fill", "mc"] as const);
    const hint = "Ascenders rise above the x-height (b, d, h, k, l, t); descenders drop below the baseline (g, j, p, q, y); the rest sit within the x-height.";

    if (branch === "categorize") {
      const picks = shuffle(rng, [
        ...shuffle(rng, ASCENDERS).slice(0, 2).map((letter) => ({ letter, group: GROUPS[0] })),
        ...shuffle(rng, DESCENDERS).slice(0, 2).map((letter) => ({ letter, group: GROUPS[1] })),
        ...shuffle(rng, XHEIGHT).slice(0, 2).map((letter) => ({ letter, group: GROUPS[2] })),
      ]);
      const items = picks.map((p, i) => ({ id: `l${i}`, label: `the letter "${p.letter}"` }));
      const correctBucket: Record<string, string> = {};
      picks.forEach((p, i) => (correctBucket[`l${i}`] = p.group.id));
      return {
        kind: "categorize",
        prompt: "Sort each letter by its height classification.",
        items,
        buckets: GROUPS.map((g) => ({ id: g.id, label: g.label })),
        correctBucket,
        hint,
        explanation: picks.map((p) => `"${p.letter}" is ${p.group.article} ${p.group.label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, GROUPS.map((g) => ({ id: g.id, label: g.label })));
      const targets = shuffle(rng, GROUPS.map((g) => ({ id: g.id, label: g.description })));
      const correctMap: Record<string, string> = {};
      for (const g of GROUPS) correctMap[g.id] = g.id;
      return {
        kind: "click-match",
        prompt: "Match each letter-height classification to its correct description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: GROUPS.map((g) => `${g.label}: ${g.description}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const letter = randChoice(rng, [...ASCENDERS, ...DESCENDERS, ...XHEIGHT]);
      const group = GROUP_OF[letter];
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: `The letter "${letter}" is classified as ${group.article}`,
        after: "letter because of its height.",
        correctAnswer: group.label.split(" ")[0].toLowerCase(),
        inputMode: "text",
        hint,
        explanation: `"${letter}" is ${group.article} ${group.label.toLowerCase()} — ${group.description.toLowerCase()}.`,
      };
    }

    const entry = randChoice(rng, QUALITIES);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
