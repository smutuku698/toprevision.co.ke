import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt, fmtDec } from "./mathUtils";
import { MASS_OBJECT_CONTEXTS, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

// 1 kg = 1000 g. No tonne at this grade — that's Grade 6 only.

export const grammesKilogrammesAndConversions: Skill = {
  id: "g5-math-m-mass-conversions",
  code: "M.7",
  subjectId: "math",
  strandId: "g5-math-measurement",
  grade: 5,
  title: "Grammes, kilogrammes and conversions",
  description: "Identify the gramme as a unit of mass, estimate/measure mass in grammes, and convert between kilogrammes and grammes.",
  generate(rng) {
    const branch = randChoice(rng, ["relationship-mc", "estimate-mc", "kg-to-g", "g-to-kg", "click-match", "ordering", "categorize"] as const);

    if (branch === "relationship-mc") {
      const prompts = [
        "How many grammes (g) make up 1 kilogramme (kg)?",
        "What is the number of grammes in 1 kilogramme?",
        "1 kilogramme is equal to how many grammes?",
        "Fill in the relationship: 1 kg = ___ g.",
        "How many grammes does it take to make 1 kg?",
        "A kilogramme is made up of how many grammes?",
        "To measure small masses, we use g. How many g equal 1 kg?",
        "How many grammes are there in a single kilogramme?",
        "1 kg equals how many grammes?",
        "What number of grammes is the same mass as 1 kg?",
        "Complete this fact: 1 kilogramme is the same mass as ___ grammes.",
        "How many grammes together weigh the same as 1 kilogramme?",
      ];
      const wrong = ["100", "10", "10,000"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "1,000", wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices,
        correctIndex,
        layout: "row",
        hint: "This is the basic relationship between kilogrammes and grammes.",
        explanation: "1 kg = 1,000 g. (100 confuses it with a different unit relationship, and 10,000 overshoots.)",
      };
    }

    if (branch === "estimate-mc") {
      const obj = randChoice(rng, MASS_OBJECT_CONTEXTS);
      const useCase = obj.useCase.replace("{place}", place(rng));
      const correctG = randChoice(rng, [50, 100, 250, 500, 750, 900] as const);
      const wrongScale = correctG * 10;
      const wrongTiny = Math.max(1, Math.round(correctG / 10));
      const wrongOffset = correctG + 400;
      const wrong = [`about ${wrongScale} g`, `about ${wrongTiny} g`, `about ${wrongOffset} g`];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, `about ${correctG} g`, wrong, 3);
      const prompts = [
        `Which is the most reasonable estimate for the mass of ${obj.object}, ${useCase}?`,
        `About how heavy is ${obj.object}, ${useCase}?`,
        `Estimate the mass of ${obj.object}, ${useCase}.`,
        `Which mass estimate best fits ${obj.object}, ${useCase}?`,
        `Which of these is closest to the real mass of ${obj.object}?`,
        `Choose the most sensible mass estimate for ${obj.object}, ${useCase}.`,
        `A learner estimates the mass of ${obj.object}. Which answer makes sense?`,
        `Pick the most likely mass, in grammes, for ${obj.object}.`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about how heavy this kind of object usually feels in your hand.",
        explanation: `${obj.object[0].toUpperCase()}${obj.object.slice(1)} is about ${correctG} g. Multiplying or dividing the real mass by 10, or adding an unrealistic offset, gives the wrong options.`,
      };
    }

    if (branch === "kg-to-g") {
      const obj = randChoice(rng, MASS_OBJECT_CONTEXTS);
      const useCase = obj.useCase.replace("{place}", place(rng));
      const kg = randInt(rng, 1, 60) + randChoice(rng, [0, 0, 0, 0.5] as const);
      const g = kg * 1000;
      const openers = [
        `${obj.object[0].toUpperCase()}${obj.object.slice(1)}, ${useCase}, has a mass of ${fmtDec(kg)} kg.`,
        `A mass of ${fmtDec(kg)} kg is recorded for ${obj.object}, ${useCase}.`,
        `${obj.object[0].toUpperCase()}${obj.object.slice(1)} (${useCase}) weighs ${fmtDec(kg)} kg.`,
      ];
      const closers = [" How many grammes is this?", " Express this mass in grammes.", " Convert this mass to grammes.", " What is this mass in g?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "",
        after: "g",
        correctAnswer: fmtDec(g),
        inputMode: "numeric",
        hint: "1 kg = 1000 g, so multiply the number of kg by 1000.",
        explanation: `${fmtDec(kg)} kg × 1000 = ${fmtDec(g)} g.`,
      };
    }

    if (branch === "g-to-kg") {
      const obj = randChoice(rng, MASS_OBJECT_CONTEXTS);
      const useCase = obj.useCase.replace("{place}", place(rng));
      const g = randInt(rng, 1, 60) * 100;
      const kg = g / 1000;
      const openers = [
        `${obj.object[0].toUpperCase()}${obj.object.slice(1)}, ${useCase}, has a mass of ${fmtDec(g)} g.`,
        `A mass of ${fmtDec(g)} g is recorded for ${obj.object}, ${useCase}.`,
        `${obj.object[0].toUpperCase()}${obj.object.slice(1)} (${useCase}) weighs ${fmtDec(g)} g.`,
      ];
      const closers = [" How many kilogrammes is this?", " Express this mass in kilogrammes.", " Convert this mass to kilogrammes.", " What is this mass in kg?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "",
        after: "kg",
        correctAnswer: fmtDec(kg),
        inputMode: "numeric",
        hint: "1000 g = 1 kg, so divide the number of g by 1000.",
        explanation: `${fmtDec(g)} g ÷ 1000 = ${fmtDec(kg)} kg.`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctKg(rng, 4);
      const tokens = shuffle(rng, chosen.map((kg, i) => ({ id: `k${i}`, label: `${fmtDec(kg)} kg` })));
      const targets = shuffle(rng, chosen.map((kg, i) => ({ id: `k${i}`, label: `${fmtDec(kg * 1000)} g` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`k${i}`] = `k${i}`));
      const prompts = [
        "Match each mass in kilogrammes to its equivalent in grammes.",
        "Pair each kg value with its equal mass in grammes.",
        "Match each kg amount to the same mass shown in g.",
        "Click to match each mass to its equivalent in grammes.",
        "Line up each kg value with the matching gramme value.",
        "Find the equivalent gramme value for each kilogramme mass.",
        "Match each mass card to its equal value in grammes.",
        "Pair up the equivalent masses — kilogrammes with grammes.",
        "Connect each kilogramme mass to the same mass in grammes.",
        "Match every kg measurement to its g equivalent.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Multiply the number of kg by 1000 to get grammes.",
        explanation: chosen.map((kg) => `${fmtDec(kg)} kg = ${fmtDec(kg * 1000)} g`).join("; ") + ".",
      };
    }

    if (branch === "ordering") {
      const raw = pickMixedMasses(rng, 4);
      const items = raw.map((r, i) => ({ id: `m${i}`, label: r.label }));
      const sortedIdx = raw.map((_, i) => i).sort((a, b) => raw[a].g - raw[b].g);
      const prompts = [
        "Arrange these masses from lightest to heaviest.",
        "Order these masses, starting with the lightest.",
        "Put these masses in order from lightest to heaviest.",
        "Rank these masses from lightest to heaviest.",
        "Sort these masses into order, lightest first.",
        "Sequence these masses from lightest to heaviest.",
        "Line up these masses from the lightest to the heaviest.",
        "Place these masses in order, beginning with the lightest.",
        "Which mass is lightest? Order them all from there.",
        "Arrange these weights from lightest to heaviest.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, lightest first.",
        items: shuffle(rng, items),
        correctOrder: sortedIdx.map((i) => `m${i}`),
        hint: "Convert every mass to g before comparing.",
        explanation: `In order: ${sortedIdx.map((i) => `${raw[i].label} (${fmtDec(raw[i].g)} g)`).join(", ")}.`,
      };
    }

    // categorize
    const threshold = randChoice(rng, [500, 1000, 2000, 5000] as const);
    const chosen = pickDistinctKg(rng, 6).map((kg) => kg * 1000);
    const items = chosen.map((g, i) => ({ id: `m${i}`, label: `${fmtDec(g)} g` }));
    const buckets = [
      { id: "under", label: `Less than ${fmtDec(threshold)} g` },
      { id: "over", label: `${fmtDec(threshold)} g or more` },
    ];
    const correctBucket: Record<string, string> = {};
    chosen.forEach((g, i) => (correctBucket[`m${i}`] = g < threshold ? "under" : "over"));
    const catPrompts = [
      `Sort each mass by whether it is less than ${fmtDec(threshold)} g.`,
      `Group each mass as under ${fmtDec(threshold)} g, or ${fmtDec(threshold)} g and above.`,
      `Classify each mass: below ${fmtDec(threshold)} g, or ${fmtDec(threshold)} g and up.`,
      `Sort these masses into two groups using ${fmtDec(threshold)} g as the cut-off.`,
      `Organise each mass by whether it is under ${fmtDec(threshold)} g.`,
      `Decide whether each mass is less than ${fmtDec(threshold)} g, or not.`,
      `Place each mass in the correct group based on the ${fmtDec(threshold)} g cut-off.`,
      `Sort these masses by size, using ${fmtDec(threshold)} g as the dividing line.`,
      `Which masses are under ${fmtDec(threshold)} g? Sort them all.`,
      `Categorise each mass as under ${fmtDec(threshold)} g, or ${fmtDec(threshold)} g or more.`,
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Compare each mass directly to the threshold in g.",
      explanation: chosen.map((g) => `${fmtDec(g)} g is ${g < threshold ? "less than" : "at least"} ${fmtDec(threshold)} g`).join("; ") + ".",
    };
  },
};

function pickDistinctKg(rng: RNG, count: number): number[] {
  const seen = new Set<number>();
  while (seen.size < count) seen.add(randInt(rng, 1, 15));
  return shuffle(rng, Array.from(seen));
}

function pickMixedMasses(rng: RNG, count: number): { label: string; g: number }[] {
  const options: { label: string; g: number }[] = [];
  const usedG = new Set<number>();
  while (options.length < count) {
    const unit = randChoice(rng, ["kg", "g"] as const);
    let g: number;
    let label: string;
    if (unit === "kg") {
      const v = randInt(rng, 1, 12);
      g = v * 1000;
      label = `${v} kg`;
    } else {
      const v = randInt(rng, 50, 9500);
      g = v;
      label = `${v} g`;
    }
    if (!usedG.has(g)) {
      usedG.add(g);
      options.push({ label, g });
    }
  }
  return options;
}
