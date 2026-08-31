import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STITCHES = [
  { id: "knit", label: "Knit stitch", detail: "A basic stitch made by pulling a new loop through a loop from the front, forming a smooth 'V' pattern" },
  { id: "purl", label: "Purl stitch", detail: "The reverse of a knit stitch, made from the back of the loop, forming a bumpy horizontal pattern" },
] as const;

const ARTICLE_ITEMS = [
  { text: "Tool bag", bucket: "household" },
  { text: "Scarf", bucket: "household" },
  { text: "Gloves", bucket: "household" },
  { text: "Table wiper", bucket: "household" },
  { text: "Car engine", bucket: "not-knitted" },
  { text: "Wooden chair", bucket: "not-knitted" },
] as const;
const ARTICLE_LABEL: Record<string, string> = { household: "A household article that can be knitted", "not-knitted": "Not something made by knitting" };

const SCENARIOS = [
  {
    q: "A learner wants to knit a table wiper using leftover wool at home. What is the most important reason to plan the article before starting?",
    correct: "Planning helps decide the size, pattern, and amount of wool needed before knitting begins",
    distractors: [
      "Planning has no real effect on how a knitted article turns out",
      "Wool amount never matters once knitting has started",
      "Planning is only necessary for very large articles, never small ones",
    ],
  },
  {
    q: "Why is knitting considered a useful production technique for making household articles at home?",
    correct: "It lets a household make useful items like scarves or mats using low-cost materials and simple tools",
    distractors: [
      "Knitting can only ever be done in a specialised factory",
      "Knitted items are never useful for everyday household needs",
      "Knitting requires no planning or skill of any kind",
    ],
  },
];

const KNIT_STEPS = [
  { id: "choose", label: "Choose the article to knit and the wool or yarn needed" },
  { id: "cast-on", label: "Cast on the starting stitches" },
  { id: "knit-rows", label: "Knit rows using knit and purl stitches to build up the fabric" },
  { id: "cast-off", label: "Cast off to secure the final row of stitches" },
  { id: "finish", label: "Finish the article by weaving in loose ends" },
];

const FILL_ITEMS = [
  { before: "The basic stitch that forms a smooth 'V' pattern in knitting is called the ", after: " stitch.", correctAnswer: "knit" },
  { before: "Securing the final row of stitches so knitted work does not unravel is called casting ", after: ".", correctAnswer: "off" },
];

const MATCH_PROMPTS = [
  "Match each basic knitting stitch to its description.",
  "Pair each stitch with the description that explains it.",
  "Connect each knitting stitch to what it actually looks like.",
  "Match each stitch below to the statement that describes it.",
  "Link each basic stitch to its correct description.",
  "Match each stitch to its explanation.",
];

const SORT_PROMPTS = [
  "Sort each item by whether it is a household article that can be knitted.",
  "Decide whether each item below can be knitted, and sort it there.",
  "Group these items under can-be-knitted or not-knitted.",
  "Sort each item into the correct knitting-possibility bucket.",
  "Read each item and place it under whether knitting could produce it.",
  "Classify each item as a knittable household article, or not.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for knitting a simple household article, in the correct order.",
  "Put these knitting steps into a sensible order.",
  "Sequence the steps for knitting a household article correctly.",
  "Arrange these actions into the order a careful knitter would follow them.",
  "Order these knitting tasks the way they should actually happen.",
  "Sort these steps into the order needed to knit an article.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Which word correctly completes this sentence?",
  "Supply the missing word to finish the sentence.",
  "Work out the missing word in this sentence.",
  "Type the word that correctly fills the gap.",
];

export const sewingSkillsKnitting: Skill = {
  id: "g7-ag-p-sewing-skills-knitting",
  code: "P.1",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-production-techniques",
  grade: 7,
  title: "Sewing Skills: Knitting",
  description: "Basic knitting stitches (knit and purl) used to make household articles such as a tool bag, scarf, gloves, mat, or table wiper, using materials prudently and tools safely.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "sort", "scenario", "order", "fill"] as const);
    const hint = "Knitting builds fabric row by row from knit and purl stitches, used to make simple household articles.";

    if (branch === "match") {
      const tokens = shuffle(rng, STITCHES.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, STITCHES.map((s) => ({ id: s.id, label: s.detail })));
      const correctMap: Record<string, string> = {};
      for (const s of STITCHES) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: STITCHES.map((s) => `${s.label}: ${s.detail}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, ARTICLE_ITEMS);
      const items = chosen.map((c, i) => ({ id: `a${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`a${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "household", label: ARTICLE_LABEL.household },
          { id: "not-knitted", label: ARTICLE_LABEL["not-knitted"] },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" — ${ARTICLE_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const entry = randChoice(rng, SCENARIOS);
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
    }

    if (branch === "order") {
      const items = shuffle(rng, KNIT_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: KNIT_STEPS.map((s) => s.id),
        hint: "Stitches must be cast on before rows can be knitted, and casting off comes only at the very end.",
        explanation: KNIT_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint,
      explanation: `The sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
