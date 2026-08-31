import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 3.2 Home Hygiene — 5 named surface materials (glass, wooden, earthen
// floor, cemented, tiled) and the appropriate way to clean each, cross-linked to preventing contamination and
// spread of communicable disease. See curriculum-reference/grade-5/agriculture.json.

const SURFACES = [
  { id: "glass", label: "Glass surfaces (windows, mirrors)", method: "Wipe with a soft cloth and a glass cleaner or soapy water, then dry to avoid streaks" },
  { id: "wooden", label: "Wooden surfaces (furniture, floors)", method: "Sweep or dust, then wipe with a barely damp cloth — avoid soaking wood, which can warp or rot it" },
  { id: "earthen", label: "Earthen floors", method: "Sweep regularly and smear with a traditional dung-and-ash or mud mixture to maintain and harden the surface" },
  { id: "cemented", label: "Cemented floors", method: "Sweep first, then scrub or mop with water and soap or detergent" },
  { id: "tiled", label: "Tiled surfaces", method: "Sweep or dust first, then mop with water and a suitable cleaning detergent" },
] as const;

const CLEANING_PRACTICES = [
  { text: "Sweeping a room before mopping or wiping any surface", good: true },
  { text: "Using a barely damp cloth on wooden furniture instead of soaking it", good: true },
  { text: "Wearing gloves when using strong cleaning chemicals", good: true },
  { text: "Wiping glass with a soft cloth to avoid scratching it", good: true },
  { text: "Rinsing away soap or detergent residue after scrubbing a floor", good: true },
  { text: "Soaking wooden furniture with buckets of water regularly", good: false },
  { text: "Leaving spilled food or dirt on a floor for many days without cleaning it", good: false },
  { text: "Scrubbing glass with a rough, abrasive scouring pad", good: false },
  { text: "Mixing cleaning chemicals together without knowing if it is safe", good: false },
] as const;

const CLEANING_ROUTINE_STEPS = [
  { id: "c1", label: "Remove loose dirt, dust or debris by sweeping or dusting the surface" },
  { id: "c2", label: "Choose the cleaning method and materials suited to that surface type" },
  { id: "c3", label: "Wipe, scrub or mop the surface using the chosen method" },
  { id: "c4", label: "Rinse or wipe away any soap, detergent or cleaning residue" },
  { id: "c5", label: "Dry the surface or let it air-dry to prevent damage or slipping hazards" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} pours several buckets of water over a wooden dining table to clean it thoroughly. What problem could this cause?`,
      correct: "Soaking wood with too much water can cause it to warp, swell or eventually rot",
      wrong: ["Wood is completely unaffected by any amount of water", "This is actually the recommended way to clean wooden furniture", "Water always makes wood stronger and more durable"],
      explanation: "Wooden surfaces should be wiped with a barely damp cloth, not soaked, since excess water can warp or damage wood over time.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} living in a home with an earthen floor regularly sweeps it and smears it with a traditional dung-and-ash mixture. What is the purpose of this practice?`,
    correct: "It helps harden and maintain the earthen floor surface, keeping it cleaner and more durable",
    wrong: ["It has no real purpose and is purely decorative", "This practice always damages an earthen floor", "It is done purely for smell, with no cleaning benefit"],
    explanation: "Smearing an earthen floor with a dung-and-ash or mud mixture is a traditional way to harden and maintain the surface as part of home hygiene.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sweeps a tiled kitchen floor first, then mops it with water and detergent. Why sweep before mopping?`,
      correct: "Sweeping removes loose dirt and debris first, so mopping cleans more effectively instead of just pushing dirt around",
      wrong: ["Sweeping first has no effect on how clean the floor ends up", "Mopping should always happen before sweeping for best results", "Sweeping and mopping order makes no difference at all"],
      explanation: "Removing loose dirt by sweeping before mopping is proper cleaning order — mopping straight over loose dirt just smears it around instead of removing it.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} scrubs a glass window with a rough scouring pad meant for metal pots. What is the likely result?`,
    correct: "The rough pad is likely to scratch the glass surface",
    wrong: ["The glass will always come out perfectly clean with no damage", "Rough pads are the recommended tool for cleaning glass", "Glass cannot be scratched by any cleaning tool"],
    explanation: "Glass should be cleaned with a soft cloth to avoid scratching — an abrasive scouring pad meant for tougher materials can damage it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} leaves spilled food on a cemented kitchen floor for several days without cleaning it. What risk does this create, based on this sub-strand's cross-link to Science and Technology?`,
      correct: "It can attract germs and pests, increasing the risk of contamination and spreading communicable disease",
      wrong: ["There is no risk at all in leaving spilled food uncleaned", "Old spilled food always becomes safer over time", "This has no connection to health or disease at all"],
      explanation: "Home hygiene is explicitly linked to preventing contamination and the spread of communicable disease — leaving spilled food uncleaned works against this.",
    };
  },
  (rng) => ({
    prompt: `A household in ${place(rng)} rinses away all soap residue after scrubbing a cemented floor, rather than leaving suds behind. Why does this matter?`,
    correct: "Leftover soap residue can make the floor slippery and unsafe, and can attract more dirt over time",
    wrong: ["Leftover soap residue always makes a floor safer to walk on", "Rinsing away soap has no benefit at all", "Soap residue prevents any dirt from ever sticking to the floor"],
    explanation: "Rinsing away cleaning residue is part of a proper cleaning routine — leftover soap can create a slip hazard and attract dirt.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wears gloves while mixing strong cleaning chemicals to clean a tiled bathroom floor. Why is this a sensible precaution?`,
      correct: "Gloves protect the skin from potentially irritating or harmful cleaning chemicals",
      wrong: ["Gloves have no protective purpose when cleaning", "Cleaning chemicals are always completely harmless to skin", "This precaution only matters for appearance, not safety"],
      explanation: "Wearing gloves when handling strong cleaning chemicals protects the skin — a sensible home hygiene safety practice.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} compares cleaning a tiled floor and a wooden floor, and notices the wooden floor needs far less water. What explains this difference?`,
    correct: "Wood absorbs and is damaged by excess water, while tiled surfaces can tolerate mopping with more water",
    wrong: ["Wood and tile both need exactly the same amount of water", "Tiled floors are actually more easily damaged by water than wood", "The amount of water used makes no real difference for either surface"],
    explanation: "Different surface materials need different cleaning approaches — wood is water-sensitive, while tile tolerates mopping with water well.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} maintains cleanliness of classroom surfaces at school every day, not just occasionally. What benefit does the sub-strand say this brings?`,
      correct: "It helps everyone appreciate living in a clean environment, promoting healthy living",
      wrong: ["Daily cleaning has no real benefit over occasional cleaning", "This practice is purely about appearance, with no health benefit", "Cleaning classroom surfaces has no connection to healthy living"],
      explanation: "This sub-strand's own outcome is appreciating a clean home/school environment for healthy living — regular maintenance directly supports that.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} mixes two different cleaning chemicals together without checking whether it is safe to do so. What should they have done instead?`,
    correct: "Checked whether the chemicals are safe to mix, since combining some cleaning chemicals can be dangerous",
    wrong: ["Mixed even more chemicals together for a stronger effect", "Nothing — mixing any cleaning chemicals together is always completely safe", "Used the mixed chemicals directly on their skin without gloves"],
    explanation: "Mixing cleaning chemicals without knowing if it's safe is a real hazard — some combinations can produce harmful reactions.",
  }),
];

export const homeHygiene: Skill = {
  id: "g5-ag-hygiene-home-hygiene",
  code: "HP.2",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-hygiene",
  grade: 5,
  title: "Home hygiene",
  description: "Cleaning surfaces made from different materials (glass, wooden, earthen floor, cemented, tiled) with the appropriate method for each, to promote healthy living.",
  generate(rng) {
    const branch = randChoice(rng, ["surface-method-match", "practice-categorize", "routine-order", "reasoning", "fill-blank"] as const);

    if (branch === "surface-method-match") {
      const chosen = shuffle(rng, SURFACES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.id, label: s.method })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "surface material to the correct way of cleaning it"),
        tokens,
        targets,
        correctMap,
        hint: "Think about how much water each material can safely tolerate, and what tool suits it.",
        explanation: chosen.map((s) => `${s.label} — ${s.method}.`).join(" "),
      };
    }

    if (branch === "practice-categorize") {
      const chosen = shuffle(rng, CLEANING_PRACTICES).slice(0, 7);
      const items = chosen.map((p, i) => ({ id: `p${i}`, label: p.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`p${i}`] = p.good ? "good" : "poor"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is good cleaning practice or poor cleaning practice"),
        items,
        buckets: [
          { id: "good", label: "Good cleaning practice" },
          { id: "poor", label: "Poor cleaning practice" },
        ],
        correctBucket,
        hint: "Think about matching the method to the surface, safety with chemicals, and thoroughness.",
        explanation: chosen.map((p) => `"${p.text}" is ${p.good ? "good" : "poor"} cleaning practice.`).join(" "),
      };
    }

    if (branch === "routine-order") {
      const shuffled = shuffle(rng, CLEANING_ROUTINE_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of properly cleaning a home surface"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: CLEANING_ROUTINE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Remove loose dirt first, then clean with the right method, then rinse and dry.",
        explanation: "Correct order: " + CLEANING_ROUTINE_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "Glass should be wiped with a soft cloth to avoid ", after: " the surface.", correctAnswer: "scratching" },
      { before: "Wooden surfaces should be cleaned with a barely damp cloth to avoid causing the wood to ", after: ".", correctAnswer: "warp", alsoAccept: ["rot"] },
      { before: "An earthen floor is traditionally maintained by sweeping and smearing it with a dung-and-ash or ", after: " mixture.", correctAnswer: "mud" },
      { before: "Cemented and tiled floors are typically cleaned by sweeping first, then ", after: " with water and detergent.", correctAnswer: "mopping", alsoAccept: ["scrubbing"] },
      { before: "Cleaning surfaces regularly helps prevent contamination and the spread of communicable ", after: ".", correctAnswer: "disease", alsoAccept: ["diseases"] },
      { before: "Loose dirt or dust should always be removed by sweeping before ", after: " a surface with water.", correctAnswer: "mopping", alsoAccept: ["wiping"] },
      { before: "Gloves should be worn when handling strong cleaning ", after: ".", correctAnswer: "chemicals" },
      { before: "Rinsing away soap or detergent after cleaning prevents a surface from becoming ", after: ".", correctAnswer: "slippery" },
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
      hint: "Think about the 5 named surface materials and how each should be cleaned.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
