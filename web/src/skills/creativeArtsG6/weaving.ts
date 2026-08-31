import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, sub-strand 1.5 "Weaving" (kept as one skill — a single technique).
// Source content: identify a plain weave (1/1 or 2/2 interlacing); prepare recyclable materials
// (yarns, fibres); make a serrated card loom (stiff material + shuttle); weave a mat/scarf on the
// loom emphasizing colour variation; finish by cutting/tying tassels; critique own/peers' woven
// items. Core competencies name "Critical thinking and problem solving" — at least one
// Analyze/Evaluate branch is required, not just recall.

const TERMS: { id: string; label: string; meaning: string; blank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] } }[] = [
  {
    id: "plain-weave",
    label: "Plain weave",
    meaning: "A simple over-under interlacing of yarns, in a 1/1 or 2/2 pattern",
    blank: { before: "A simple over-under interlacing of yarns, in a 1/1 or 2/2 pattern, is called a ", after: ".", correctAnswer: "plain weave" },
  },
  {
    id: "serrated-card-loom",
    label: "Serrated card loom",
    meaning: "A stiff card with small notches cut along the edges, used to hold the warp yarns for weaving",
    blank: { before: "A stiff card with small notches cut along the edges, used to hold the warp yarns for weaving, is called a ", after: " loom.", correctAnswer: "serrated card" },
  },
  {
    id: "shuttle",
    label: "Shuttle",
    meaning: "The tool used to carry the weaving yarn back and forth across the loom",
    blank: { before: "The tool used to carry the weaving yarn back and forth across the loom is called a ", after: ".", correctAnswer: "shuttle" },
  },
  {
    id: "tassel",
    label: "Tassel",
    meaning: "A bundle of yarn ends, cut and tied together, used to finish the edge of a woven mat or scarf",
    blank: { before: "A bundle of yarn ends, cut and tied together to finish a woven edge, is called a ", after: ".", correctAnswer: "tassel" },
  },
  {
    id: "colour-variation",
    label: "Colour variation",
    meaning: "Changing yarn colours across a weave to create a visible pattern or design",
    blank: { before: "Changing yarn colours across a weave to create a visible pattern is called colour ", after: ".", correctAnswer: "variation" },
  },
  {
    id: "recyclable-yarn",
    label: "Recyclable materials",
    meaning: "Yarns and fibres reused from other sources, chosen for weaving instead of buying new materials",
    blank: { before: "Yarns and fibres reused from other sources instead of buying new ones are called ", after: " materials.", correctAnswer: "recyclable" },
  },
];

const WEAVE_DESCRIPTIONS = [
  { text: "Each weft thread passes over exactly one warp thread, then under exactly one, all the way across", kind: "1/1" },
  { text: "Each weft thread passes over two warp threads, then under two, all the way across", kind: "2/2" },
  { text: "The interlacing alternates one-over, one-under in the tightest, simplest possible pattern", kind: "1/1" },
  { text: "Groups of two threads cross over and under together, creating a slightly bolder, more open texture", kind: "2/2" },
  { text: "This pattern uses the smallest possible repeat unit — just one thread over, one thread under", kind: "1/1" },
  { text: "This pattern uses a repeat unit twice the size of the simplest plain weave, with pairs of threads interlacing", kind: "2/2" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is weaving a small, tightly woven coaster and wants the closest, most compact interlacing possible. Which plain weave should ${who} choose?`,
      correct: "1/1 — the tightest, simplest interlacing, with each thread crossing over and under one at a time",
      wrong: [
        "2/2 — this creates a bolder, more open texture, not the tightest possible weave",
        "Neither — plain weave cannot be made tight or loose, it is always the same",
        "It does not matter which is chosen, since both look identical once finished",
      ],
      explanation: "A 1/1 plain weave gives the tightest, most compact interlacing, since each thread crosses over and under just one thread at a time — a 2/2 weave is bolder and more open.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} weaves a mat using only one colour of yarn throughout. What characteristic named in the design has been left out?`,
    correct: "Colour variation — changing yarn colours across the weave to create a visible pattern",
    wrong: [
      "Plain weave — a single-colour mat can still use a correct 1/1 or 2/2 plain weave",
      "Tassels — colour choice does not affect whether tassels are added at the end",
      "The serrated card loom — using one colour does not change what loom is needed",
    ],
    explanation: "Colour variation specifically refers to changing yarn colours to create a visible pattern — using only one colour throughout leaves this characteristic out, even though the weave technique itself may still be correct.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} collects new, unused yarn from a shop rather than yarn recycled from an old garment, for a class weaving project. Judged against the values the source names for this activity, is this the better choice?`,
      correct: "No — the source specifically values recyclable materials for weaving, to reduce waste and cost",
      wrong: [
        "Yes — new yarn is always required for a correct plain weave",
        "Yes — recycled yarn cannot be woven into a mat or scarf at all",
        "It makes no difference either way, since the source does not mention material choice",
      ],
      explanation: "The source specifically calls for collecting and preparing recyclable materials such as yarns and fibres for weaving — buying new yarn instead misses this environmentally responsible practice that the design values.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} finishes weaving a mat but leaves the loose yarn ends hanging untidily, without cutting or tying them. What finishing step has been skipped?`,
    correct: "Finishing the mat by cutting and tying the tassels",
    wrong: [
      "Making the serrated card loom — this step happens before weaving begins, not after",
      "Choosing recyclable materials — this also happens before weaving begins",
      "Nothing has been skipped — loose yarn ends are the correct final appearance of a woven mat",
    ],
    explanation: "The finishing step of a woven mat involves cutting and tying the loose ends into tassels — leaving them untidy skips this step, which comes after weaving is complete.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} weaves a scarf with a bold, slightly looser texture than a classmate's tightly woven coaster. What is the most likely explanation, given only plain weave was used by both?`,
      correct: `${who} likely used a 2/2 interlacing, while the classmate likely used a 1/1 interlacing`,
      wrong: [
        "Only one of the two projects can be a genuine plain weave — the other must be a mistake",
        "The difference must be due to the colour of yarn chosen, not the weave pattern",
        "Plain weave always produces an identical texture, so this difference is not possible",
      ],
      explanation: "Both 1/1 and 2/2 are valid plain weave patterns, but 2/2 produces a bolder, more open texture while 1/1 produces a tighter, more compact one — the texture difference reflects the interlacing pattern chosen, not a mistake or the yarn colour.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} displays a finished woven mat and a classmate points out that a few rows of colour do not line up evenly. What is the most constructive feedback to give, following the source's emphasis on positive, reflective critique?`,
    correct: "Point out specifically which rows are uneven and suggest how to keep tension more consistent next time",
    wrong: [
      "Say nothing at all, since feedback on woven work is discouraged",
      "Say only that the whole mat looks bad, without any specific detail",
      "Redo the classmate's mat without asking or explaining anything",
    ],
    explanation: "The source calls for positively critiquing woven items for reflective feedback — specific, constructive comments help the maker improve, unlike vague criticism, silence, or redoing the work for them.",
  }),
];

const WEAVE_PROMPTS = ["Which plain weave pattern is shown here?", "Look at the weave — is it 1/1 or 2/2?", "Identify this weave pattern.", "Which interlacing pattern does this diagram show?", "Name this plain weave pattern."] as const;
const DESC_CATEGORIZE_PROMPTS = ["Sort each description as a 1/1 or 2/2 plain weave.", "Which weave pattern does each description match? Sort them.", "Sort these weave descriptions by pattern.", "Classify each description as 1/1 or 2/2.", "Match each description to its weave pattern by sorting."] as const;
const TERM_MATCH_PROMPTS = ["Match each term to its meaning.", "Pair each weaving term with its definition.", "Match each word to what it means in weaving.", "Connect each term to its correct meaning.", "For each term below, choose its matching meaning."] as const;
const STEPS_PROMPTS = ["Put these weaving steps in the correct order.", "Arrange the steps for weaving a mat or scarf.", "Order these steps, from first to last.", "Sort these weaving steps into the correct sequence.", "Place these steps in the order you would follow them."] as const;
const FILL_BLANK_PROMPTS = ["Complete the sentence.", "Fill in the missing word.", "Complete this sentence about weaving.", "Fill in the blank below.", "Complete the sentence with the correct word."] as const;

const WEAVING_STEPS = [
  { id: "w1", label: "Research virtual and actual sources to identify a plain weave" },
  { id: "w2", label: "Collect and prepare recyclable materials such as yarns and fibres" },
  { id: "w3", label: "Make a serrated card loom on a stiff material, with a shuttle" },
  { id: "w4", label: "Weave a mat/scarf on the loom, emphasizing colour variation" },
  { id: "w5", label: "Finish the mat/scarf by cutting and tying the tassels" },
  { id: "w6", label: "Display and positively critique own and peers' woven items" },
] as const;

export const weaving: Skill = {
  id: "g6-cas-weaving",
  code: "C.8",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-creating-executing",
  grade: 6,
  title: "Weaving",
  description: "Identifying 1/1 and 2/2 plain weave, preparing recyclable materials and a serrated card loom, weaving a mat/scarf with colour variation, and finishing with tassels.",
  generate(rng) {
    const branch = randChoice(rng, ["weave-recognition", "desc-categorize", "term-match", "reasoning", "steps-order", "fill-blank"] as const);

    if (branch === "weave-recognition") {
      const kind = randChoice(rng, ["1/1", "2/2"] as const);
      const other = kind === "1/1" ? "2/2" : "1/1";
      const choices = shuffle(rng, [kind, other]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, WEAVE_PROMPTS),
        choices,
        correctIndex: choices.indexOf(kind),
        layout: "row",
        visual: { type: "weave-pattern", kind },
        hint: "1/1 interlaces single threads; 2/2 interlaces threads in pairs, giving a bolder look.",
        explanation: `This diagram shows a ${kind} plain weave.`,
      };
    }

    if (branch === "desc-categorize") {
      const chosen = shuffle(rng, WEAVE_DESCRIPTIONS);
      const items = chosen.map((d, i) => ({ id: `d${i}`, label: d.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((d, i) => (correctBucket[`d${i}`] = d.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, DESC_CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "1/1", label: "1/1 weave" },
          { id: "2/2", label: "2/2 weave" },
        ],
        correctBucket,
        hint: "1/1 means single threads crossing one at a time; 2/2 means threads crossing in pairs.",
        explanation: chosen.map((d) => `"${d.text}" describes a ${d.kind} weave.`).join(" "),
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
        hint: "Think about the weave, the loom, the tool that carries yarn, the finished edge, and colour.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about tightness of weave, colour variation, recyclable materials, and finishing.", explanation: q.explanation };
    }

    if (branch === "steps-order") {
      const shuffled = shuffle(rng, WEAVING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: WEAVING_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Research the weave first, then prepare materials and the loom, then weave, finish, and display.",
        explanation: "Correct order: " + WEAVING_STEPS.map((s) => s.label).join(" → ") + ".",
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
      hint: "Think about plain weave, the loom, the shuttle, tassels, and colour variation.",
      explanation: `${t.label}: ${t.meaning}.`,
    };
  },
};
