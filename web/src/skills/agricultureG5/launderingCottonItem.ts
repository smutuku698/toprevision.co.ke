import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 3.3 Laundering Cotton Item — laundering white cotton vs fast-coloured
// cotton items, each needing genuinely different handling, for personal hygiene. Cross-linked to communicable
// disease prevention. See curriculum-reference/grade-5/agriculture.json.

const LAUNDRY_STEPS = [
  { id: "l1", label: "Sort items by colour (white items separate from fast-coloured items)" },
  { id: "l2", label: "Check for stains and treat them before washing" },
  { id: "l3", label: "Soak the item in water with soap or detergent" },
  { id: "l4", label: "Wash the item, scrubbing gently to remove dirt" },
  { id: "l5", label: "Rinse the item thoroughly until the water runs clear of soap" },
  { id: "l6", label: "Wring out excess water and hang the item to dry" },
] as const;

const PRACTICE_FACTS = [
  { text: "Washing white cotton items separately from coloured items", forWhite: true, forColoured: false },
  { text: "Using a mild wash and cooler water to protect the fabric's colour", forWhite: false, forColoured: true },
  { text: "Using a stronger wash or a whitening agent to keep the item bright", forWhite: true, forColoured: false },
  { text: "Washing similar fast colours together to reduce the risk of dye transfer", forWhite: false, forColoured: true },
  { text: "Drying in direct strong sunlight, which can help whiten the item further", forWhite: true, forColoured: false },
  { text: "Drying in gentler or shaded conditions to reduce colour fading", forWhite: false, forColoured: true },
] as const;

const STEP_REASONS = [
  { id: "sort", step: "Sorting items by colour before washing", reason: "Prevents dye from a coloured item staining a white item" },
  { id: "stain", step: "Checking for and treating stains before washing", reason: "Makes the stain easier to remove before it sets into the fabric" },
  { id: "soak", step: "Soaking the item in soapy water before scrubbing", reason: "Loosens dirt so it comes off more easily during washing" },
  { id: "wash", step: "Washing and scrubbing the item", reason: "Removes dirt and germs from the fabric" },
  { id: "rinse", step: "Rinsing the item until the water runs clear", reason: "Removes leftover soap so it doesn't irritate the skin" },
  { id: "dry", step: "Wringing out and hanging the item to dry", reason: "Removes excess water and lets the item dry fully before wearing" },
] as const;

const GENERAL_HYGIENE_FACTS = [
  { text: "Rinsing an item until no soap remains", helps: true },
  { text: "Hanging washed items to dry fully before wearing them again", helps: true },
  { text: "Washing clothes regularly rather than wearing them unwashed repeatedly", helps: true },
  { text: "Treating stains promptly rather than letting them set in", helps: true },
  { text: "Wearing a damp, not-fully-dried item straight after washing it", helps: false },
  { text: "Leaving washed clothes in a damp pile instead of hanging them to dry", helps: false },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} washes a bright red fast-coloured shirt together with a white school shirt in the same basin. What is the risk of this?`,
      correct: "The dye from the red shirt could run and stain the white shirt",
      wrong: ["There is no risk at all in washing them together", "White items always protect coloured items from fading", "This is the recommended way to wash any laundry"],
      explanation: "White and fast-coloured cotton items should be washed separately, since dye from coloured items can run and stain white fabric.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} dries a fast-coloured cotton dress in gentle shade rather than direct harsh sunlight. Why might they choose this?`,
    correct: "Direct strong sunlight can fade the colour of fast-coloured fabric over time",
    wrong: ["Sunlight has no effect on fabric colour at all", "Shade always damages fabric more than sunlight", "This choice has nothing to do with colour"],
    explanation: "Fast-coloured items are often dried in gentler conditions to reduce fading, unlike white items, which can tolerate stronger sunlight (which can even help whiten them).",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices a white school shirt looking dull and slightly grey after many washes, so uses a stronger wash to brighten it. Is this consistent with proper laundering of white cotton?`,
      correct: "Yes, a stronger wash or whitening approach is appropriate specifically for white items",
      wrong: ["No, white items should never be washed with a stronger approach", "No, white items should always be washed exactly like coloured items", "No, strength of wash makes no difference to whiteness"],
      explanation: "White cotton items can tolerate a stronger wash or whitening approach to stay bright, unlike fast-coloured items, which need gentler care.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} rinses a washed cotton shirt only briefly, leaving a little soap in the fabric. What problem could this cause?`,
    correct: "Leftover soap can irritate the skin or leave the fabric feeling stiff and not fully clean",
    wrong: ["Leftover soap always makes clothing softer and cleaner", "There is no downside to leaving some soap in the fabric", "Rinsing thoroughly is unnecessary for any fabric"],
    explanation: "Thorough rinsing removes all soap, since leftover soap residue can irritate skin and leave clothing feeling unclean.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wears a shirt for many days without washing it, even though it has visible dirt. What health risk does this relate to, per this sub-strand's cross-link to Science and Technology?`,
      correct: "It increases the risk of germs building up, linked to spreading communicable disease",
      wrong: ["There is no health risk connected to unwashed clothing", "Unwashed clothing always becomes cleaner the longer it is worn", "This has no connection to any subject's content"],
      explanation: "Personal hygiene through regular laundering is explicitly linked to preventing the spread of communicable disease.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} treats a grass stain on a white cotton shirt promptly, rather than waiting several days to wash it. Why does treating it promptly matter?`,
    correct: "A fresh stain is generally easier to remove than one that has set into the fabric over time",
    wrong: ["Stains become easier to remove the longer they are left", "The timing of stain treatment makes no difference at all", "Stains always disappear on their own without any treatment"],
    explanation: "Treating a stain promptly, before it sets into the fabric, generally makes it easier to remove than waiting.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sorts laundry into two piles before washing: one for white items, one for fast-coloured items. What is the main reason for sorting first?`,
      correct: "It allows each type of cotton item to be washed with the care it specifically needs, without risking colour transfer",
      wrong: ["Sorting has no real purpose and is just an extra step", "All cotton items need identical washing regardless of colour", "Sorting is done only to save water, with no other benefit"],
      explanation: "Sorting by colour before washing lets white and fast-coloured items each get appropriate treatment and avoids dye transfer between them.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} hangs washed cotton clothes to dry fully in the open air rather than wearing them while still damp. Why is this important?`,
    correct: "Fully drying clothes before wearing them helps maintain hygiene and comfort",
    wrong: ["Wearing damp clothes is always more hygienic than dry clothes", "Drying fully has no benefit over wearing clothes damp", "This step is purely optional with no real purpose"],
    explanation: "Allowing washed items to dry fully before wearing supports good hygiene, part of the overall laundering process for personal cleanliness.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} washes several similar dark-blue fast-coloured items together, rather than mixing them with lighter fast colours. What is the benefit of this?`,
      correct: "Washing similar colours together reduces the risk of one item's dye affecting a very different colour",
      wrong: ["There is no benefit; colour similarity makes no difference when washing", "Mixing all colours together is always the safest approach", "This practice only matters for white items, never coloured ones"],
      explanation: "Grouping similar fast colours together when washing reduces the risk of dye transfer changing the appearance of very different-coloured items.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} demonstrates laundering both a white cotton item and a fast-coloured cotton item for a class activity, using different care for each. What does this demonstrate about laundering cotton items?`,
    correct: "Different cotton items need different care depending on whether they are white or fast-coloured",
    wrong: ["All cotton items should always be laundered in exactly the same way", "Colour has no effect on how an item should be laundered", "Only white items ever need any special care"],
    explanation: "This sub-strand explicitly distinguishes white and fast-coloured cotton laundering, since each needs genuinely different handling.",
  }),
];

export const launderingCottonItem: Skill = {
  id: "g5-ag-hygiene-laundering-cotton-item",
  code: "HP.3",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-hygiene",
  grade: 5,
  title: "Laundering cotton item",
  description: "Laundering white and fast-coloured cotton items with the appropriate care for each, for personal hygiene.",
  generate(rng) {
    const branch = randChoice(rng, ["practice-categorize", "step-reason-match", "hygiene-categorize", "laundry-order", "reasoning", "fill-blank"] as const);

    if (branch === "practice-categorize") {
      const chosen = shuffle(rng, PRACTICE_FACTS).slice(0, 6);
      const items = chosen.map((p, i) => ({ id: `p${i}`, label: p.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`p${i}`] = p.forWhite ? "white" : "coloured"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it best suits laundering white cotton or fast-coloured cotton"),
        items,
        buckets: [
          { id: "white", label: "White cotton items" },
          { id: "coloured", label: "Fast-coloured cotton items" },
        ],
        correctBucket,
        hint: "White items can tolerate a stronger wash and strong sunlight; coloured items need gentler care to protect the dye.",
        explanation: chosen.map((p) => `"${p.text}" best suits ${p.forWhite ? "white" : "fast-coloured"} cotton items.`).join(" "),
      };
    }

    if (branch === "step-reason-match") {
      const chosen = shuffle(rng, STEP_REASONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.id, label: s.step })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.id, label: s.reason })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "laundering step to why it matters"),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each step actually prevents or achieves.",
        explanation: chosen.map((s) => `${s.step} — ${s.reason}.`).join(" "),
      };
    }

    if (branch === "hygiene-categorize") {
      const chosen = shuffle(rng, GENERAL_HYGIENE_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `h${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`h${i}`] = f.helps ? "helps" : "harms"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it supports good laundry hygiene or works against it"),
        items,
        buckets: [
          { id: "helps", label: "Supports good hygiene" },
          { id: "harms", label: "Works against good hygiene" },
        ],
        correctBucket,
        hint: "Think about thorough rinsing, full drying, and treating stains promptly, versus leaving things damp or dirty.",
        explanation: chosen.map((f) => `"${f.text}" ${f.helps ? "supports" : "works against"} good laundry hygiene.`).join(" "),
      };
    }

    if (branch === "laundry-order") {
      const shuffled = shuffle(rng, LAUNDRY_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of laundering a cotton item"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: LAUNDRY_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Sort by colour first, then treat stains, then wash, rinse, and dry.",
        explanation: "Correct order: " + LAUNDRY_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "White and fast-coloured cotton items should be sorted and washed ", after: " to avoid dye transfer.", correctAnswer: "separately" },
      { before: "Fast-coloured items are best washed with cooler water and a ", after: " wash to protect the colour.", correctAnswer: "mild", alsoAccept: ["gentle"] },
      { before: "White cotton items can tolerate a stronger wash and drying in strong ", after: ".", correctAnswer: "sunlight" },
      { before: "A stain should be treated ", after: " rather than left to set into the fabric.", correctAnswer: "promptly" },
      { before: "An item should be rinsed until the water runs clear of ", after: ".", correctAnswer: "soap" },
      { before: "Washed cotton items should be hung to ", after: " fully before being worn again.", correctAnswer: "dry" },
      { before: "Regular laundering supports personal hygiene and helps prevent the spread of communicable ", after: ".", correctAnswer: "disease", alsoAccept: ["diseases"] },
      { before: "Washing similar fast colours together reduces the risk of ", after: " between very different colours.", correctAnswer: "dye transfer", alsoAccept: ["colour running", "colour transfer"] },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    const alsoAccept: readonly string[] = "alsoAccept" in fb ? fb.alsoAccept : [];
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer, ...alsoAccept],
      inputMode: "text",
      hint: "Think about the difference between laundering white and fast-coloured cotton items.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
