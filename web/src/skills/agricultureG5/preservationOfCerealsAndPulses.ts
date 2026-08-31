import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 2.3 Preservation of Cereals and Pulses — 3 named household-level
// methods (sun drying, use of ash, airtight containers) for preserving grain and pulses, and their importance
// for food security. See curriculum-reference/grade-5/agriculture.json.

const METHODS = [
  { id: "sun-drying", label: "Sun drying", def: "Spreading grain out in the sun until it is thoroughly dry, so it resists mould and pests better" },
  { id: "ash", label: "Use of ash", def: "Mixing dry wood ash into stored grain, which helps deter insects and pests" },
  { id: "airtight", label: "Airtight containers", def: "Storing dried grain in sealed, airtight containers to keep out moisture, air and pests" },
] as const;

const SPOILAGE_SIGNS = [
  { text: "Grain feels damp and smells musty when stored", isRisk: true },
  { text: "Small weevils or insects are found crawling among the stored grain", isRisk: true },
  { text: "Grain is stored loose in an open sack in a damp room", isRisk: true },
  { text: "Grain shows patches of mould or discolouration", isRisk: true },
  { text: "Grain is thoroughly sun-dried before being stored", isRisk: false },
  { text: "Grain is stored in a sealed, airtight container", isRisk: false },
  { text: "Grain is mixed with a little dry ash before storage", isRisk: false },
  { text: "Grain is checked regularly and any spoiled portion removed promptly", isRisk: false },
] as const;

const SUN_DRYING_STEPS = [
  { id: "d1", label: "Clean the harvested grain, removing stones, husks and debris" },
  { id: "d2", label: "Spread the grain out thinly on a clean surface in direct sunlight" },
  { id: "d3", label: "Turn the grain regularly so it dries evenly on all sides" },
  { id: "d4", label: "Check the grain until it feels thoroughly dry and hard" },
  { id: "d5", label: "Store the fully dried grain in a clean, suitable container" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} spreads freshly harvested maize out on a mat in strong sunlight for several days before storing it. What is this preservation method, and why does it help?`,
      correct: "Sun drying — removing moisture makes the grain far less likely to grow mould or attract pests",
      wrong: ["Airtight storage — the sun creates an airtight seal around the grain", "Use of ash — sunlight works the same way ash does", "This has no real preservation benefit"],
      explanation: "Sun drying removes moisture from grain, which is the key factor that prevents mould growth and reduces pest attraction during storage.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} mixes a handful of dry wood ash into a sack of stored beans. What does this help prevent?`,
    correct: "Insect and pest damage to the stored beans",
    wrong: ["It has no real effect on the stored beans", "It makes the beans dry out faster than sun drying would", "It prevents the beans from ever needing to be cooked"],
    explanation: "Ash mixed into stored grain or pulses helps deter insects and pests, one of the three named household preservation methods.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} stores dried sorghum in a sealed plastic container with a tight-fitting lid, rather than in an open sack. Why is this a good preservation choice?`,
      correct: "An airtight container keeps out moisture, air and pests that would otherwise cause spoilage",
      wrong: ["A sealed container always makes grain spoil faster", "Sealing grain has no effect on how well it is preserved", "Open sacks always preserve grain better than sealed containers"],
      explanation: "Airtight containers protect stored grain from moisture, air and pests — all of which contribute to spoilage if left in an open sack.",
    };
  },
  (rng) => ({
    prompt: `A household in ${place(rng)} stores maize that was not properly dried first, in a slightly damp room. What is the likely result over the following weeks?`,
    correct: "The grain is likely to develop mould or attract pests due to the moisture",
    wrong: ["The grain will preserve perfectly regardless of moisture", "Moisture always improves how well grain is preserved", "Nothing will happen to the grain no matter how it is stored"],
    explanation: "Storing undried grain in a damp environment is a spoilage risk — moisture encourages mould growth and attracts pests.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} checks stored beans every few weeks and immediately removes any portion that looks discoloured or has weevils. Why is this a good habit?`,
      correct: "Catching and removing spoiled grain early prevents the spoilage from spreading to the rest of the stock",
      wrong: ["Checking stored grain has no real benefit", "Spoilage never spreads between grains in storage", "This habit actually causes more spoilage than it prevents"],
      explanation: "Regular checking and prompt removal of spoiled grain is good practice, since spoilage (mould, pests) can spread through stored grain if left unchecked.",
    };
  },
  (rng) => ({
    prompt: `A community in ${place(rng)} faces a poor harvest one season and relies heavily on properly preserved grain from the previous season. What does this show about the importance of preservation?`,
    correct: "Preserving cereals and pulses well supports food security during lean seasons or poor harvests",
    wrong: ["Preservation has no real connection to food security", "Preserved grain is always less useful than fresh grain", "Poor harvests make preservation completely pointless"],
    explanation: "Well-preserved grain and pulses provide a reserve of food that supports a community through lean periods — directly demonstrating food security.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} compares two sacks of beans in ${place(rng)}: one sun-dried and stored airtight, the other stored damp and loose in an open sack. After two months, which sack is more likely to still be in good condition?`,
      correct: "The sun-dried, airtight-stored sack",
      wrong: ["The damp, loosely stored sack", "Both sacks would be equally spoiled", "Neither sack could ever spoil, regardless of storage"],
      explanation: "Combining sun drying with airtight storage protects grain far better than damp, loose, open storage, which invites mould and pests.",
    };
  },
  (rng) => ({
    prompt: `A trader in ${place(rng)} sells sun-dried, well-preserved maize at a higher price than poorly stored, spoiling maize. Why might buyers pay more for the well-preserved maize?`,
    correct: "Well-preserved grain lasts longer and is safer to eat, making it more valuable",
    wrong: ["Buyers have no reason to prefer well-preserved grain", "Spoiled grain is always considered more valuable", "Preservation quality has no effect on grain value"],
    explanation: "Properly preserved grain lasts longer and is safer, which is why it is valued more highly than poorly preserved, spoiling grain.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is preparing to sun-dry a batch of harvested millet before storage. What should ${who} do while the grain is drying in the sun, to make sure it dries evenly?`,
      correct: "Turn the grain regularly so all sides are exposed to the sun",
      wrong: ["Leave the grain completely undisturbed the whole time", "Cover the grain tightly to trap in heat", "Wet the grain periodically while it dries"],
      explanation: "Regularly turning grain while sun drying ensures it dries evenly on all sides, which is part of doing this method correctly.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} combines sun drying, ash and an airtight container when preserving their pulses for the season. Why might combining all three methods work better than using just one?`,
    correct: "Each method protects against a different risk (moisture, pests, air/re-contamination), so combining them gives stronger overall protection",
    wrong: ["Combining methods actually spoils the grain faster", "Only one of the three methods has any real effect", "The three methods cancel each other out"],
    explanation: "Sun drying removes moisture, ash deters pests, and airtight storage blocks air and re-entry of moisture or pests — combining all three compounds the protection.",
  }),
];

export const preservationOfCerealsAndPulses: Skill = {
  id: "g5-ag-food-production-preservation-of-cereals-and-pulses",
  code: "FPP.3",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-food-production",
  grade: 5,
  title: "Preservation of cereals and pulses",
  description: "Household-level methods of preserving cereals and pulses (sun drying, use of ash, airtight containers) and their importance for food security.",
  generate(rng) {
    const branch = randChoice(rng, ["method-match", "spoilage-categorize", "drying-order", "reasoning", "fill-blank"] as const);

    if (branch === "method-match") {
      const tokens = shuffle(rng, METHODS.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, METHODS.map((m) => ({ id: m.id, label: m.def })));
      const correctMap: Record<string, string> = {};
      for (const m of METHODS) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "preservation method to how it actually protects grain"),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether the method removes moisture, deters pests, or blocks air and moisture from re-entering.",
        explanation: METHODS.map((m) => `${m.label} — ${m.def}.`).join(" "),
      };
    }

    if (branch === "spoilage-categorize") {
      const chosen = shuffle(rng, SPOILAGE_SIGNS).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.isRisk ? "risk" : "safe"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is a spoilage risk or a good preservation practice"),
        items,
        buckets: [
          { id: "risk", label: "Spoilage risk" },
          { id: "safe", label: "Good preservation practice" },
        ],
        correctBucket,
        hint: "Moisture, pests and neglect are risks; drying, ash, sealing and regular checking are good practice.",
        explanation: chosen.map((s) => `"${s.text}" is a ${s.isRisk ? "spoilage risk" : "good preservation practice"}.`).join(" "),
      };
    }

    if (branch === "drying-order") {
      const shuffled = shuffle(rng, SUN_DRYING_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of sun-drying and storing grain"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: SUN_DRYING_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Clean the grain first, then dry and turn it, then check it's dry, then store it.",
        explanation: "Correct order: " + SUN_DRYING_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "Spreading grain in the sun to remove moisture before storage is called ", after: ".", correctAnswer: "sun drying" },
      { before: "Mixing dry wood ash into stored grain helps deter ", after: ".", correctAnswer: "pests", alsoAccept: ["insects"] },
      { before: "Storing dried grain in a sealed container to keep out air and moisture uses an ", after: " container.", correctAnswer: "airtight" },
      { before: "Well-preserved cereals and pulses support ", after: " during lean seasons.", correctAnswer: "food security" },
      { before: "Grain that feels damp and smells musty is a sign of ", after: ".", correctAnswer: "spoilage" },
      { before: "While sun drying, grain should be ", after: " regularly so it dries evenly.", correctAnswer: "turned" },
      { before: "Removing a spoiled portion of stored grain promptly helps prevent spoilage from ", after: ".", correctAnswer: "spreading" },
      { before: "The three named household-level preservation methods are sun drying, use of ash and ", after: " containers.", correctAnswer: "airtight" },
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
      hint: "Think about the 3 named methods and what causes grain to spoil.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
