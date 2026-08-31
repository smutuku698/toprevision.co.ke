import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, fillBlankPrompt } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 2.4 Food Nutrients — 4 named nutrients (carbohydrates, vitamins,
// proteins, fats) and their functions, 3 named food categories, and 4 named nutritional
// diseases/disorders (kwashiorkor, marasmus, goiter, anaemia). See curriculum-reference/grade-5/agriculture.json.
//
// Kind-variety note: this sub-strand is entirely recall/categorisation content (nutrient functions, food
// categories, disorder names) with no genuine sequence, spatial layout, or numeric-quantity angle, so it caps
// at 4 QuestionKinds (categorize, click-match, multiple-choice, fill-blank) — see SKILL-QUALITY-STANDARDS.md's
// guidance against inventing an ordering/hotspot the curriculum doesn't support.

const NUTRIENTS = [
  { id: "carbs", label: "Carbohydrates", func: "Give the body energy for daily activities" },
  { id: "vitamins", label: "Vitamins", func: "Protect the body from disease and keep it functioning properly" },
  { id: "proteins", label: "Proteins", func: "Build and repair body tissues, supporting growth" },
  { id: "fats", label: "Fats", func: "Provide a concentrated source of energy and help protect body organs" },
] as const;

const FOODS = [
  { food: "Ugali (maize meal)", category: "carbs" },
  { food: "Rice", category: "carbs" },
  { food: "Bread", category: "carbs" },
  { food: "Sweet potatoes", category: "carbs" },
  { food: "Beans", category: "protein" },
  { food: "Meat", category: "protein" },
  { food: "Fish", category: "protein" },
  { food: "Eggs", category: "protein" },
  { food: "Milk", category: "protein" },
  { food: "Sukuma wiki (collard greens)", category: "vitamins" },
  { food: "Spinach", category: "vitamins" },
  { food: "Carrots", category: "vitamins" },
  { food: "Oranges", category: "vitamins" },
  { food: "Mangoes", category: "vitamins" },
] as const;

const DISORDERS = [
  { id: "kwashiorkor", label: "Kwashiorkor", cause: "Not eating enough protein-rich foods, especially in young children" },
  { id: "marasmus", label: "Marasmus", cause: "Severe lack of overall food and energy (calories) over a long time" },
  { id: "goiter", label: "Goiter", cause: "Not getting enough iodine, a mineral needed by the thyroid gland" },
  { id: "anaemia", label: "Anaemia", cause: "Not getting enough iron, a mineral needed to make healthy blood" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} eats ugali with sukuma wiki and a boiled egg for lunch. Which nutrient group is best represented by the egg?`,
      correct: "Protein",
      wrong: ["Carbohydrates", "Vitamins", "Fats only, with no protein at all"],
      explanation: "Eggs are a protein-rich food, one of the three named food categories, providing material for building and repairing body tissues.",
    };
  },
  (rng) => ({
    prompt: `A clinic in ${place(rng)} reports several cases of goiter, a swelling of the neck, in a community whose diet lacks iodised salt. What is the most likely cause?`,
    correct: "Not getting enough iodine in the diet",
    wrong: ["Eating too many carbohydrates", "Not getting enough vitamins", "Eating too much protein"],
    explanation: "Goiter is caused by a lack of iodine, a mineral the thyroid gland needs — a nutritional disorder linked to what's missing from the diet, not what's eaten too much of.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} notices that ${name(rng)}'s young sibling in ${place(rng)} is unusually thin, tired, and the family reports the child has had far too little food for weeks, not just too little of one nutrient. What condition does this describe?`,
      correct: "Marasmus",
      wrong: ["Kwashiorkor", "Goiter", "Anaemia"],
      explanation: "Marasmus results from a severe overall lack of food and energy over time, distinct from kwashiorkor (which is specifically a protein deficiency).",
    };
  },
  (rng) => ({
    prompt: `A community health worker in ${place(rng)} recommends eating more beans, meat and fish to a family whose child shows swelling and a protruding belly, common signs of a specific deficiency. What deficiency is being addressed?`,
    correct: "Protein deficiency, associated with kwashiorkor",
    wrong: ["Carbohydrate deficiency", "Vitamin deficiency only", "Fat deficiency only"],
    explanation: "Kwashiorkor is linked to insufficient protein, so protein-rich foods like beans, meat and fish are recommended to address it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} feels tired and weak, and a doctor explains this could be linked to a lack of iron in the diet, affecting the blood. What condition might this be?`,
      correct: "Anaemia",
      wrong: ["Goiter", "Marasmus", "Kwashiorkor"],
      explanation: "Anaemia is linked to insufficient iron, a mineral needed to make healthy blood — a lack of iron can cause tiredness and weakness.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} eats rice, sweet potatoes and bread as the main part of most meals. Which nutrient is this diet mostly providing?`,
    correct: "Carbohydrates",
    wrong: ["Protein", "Vitamins", "Minerals only, with no energy value"],
    explanation: "Rice, sweet potatoes and bread are all carbohydrate-rich foods, providing the body with energy for daily activities.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} eats oranges, carrots and spinach regularly as part of meals. Which nutrient group do these foods mainly provide?`,
      correct: "Vitamins (and minerals)",
      wrong: ["Carbohydrates only", "Protein only", "Fats only"],
      explanation: "Oranges, carrots and spinach are vitamin (and mineral) rich foods, which protect the body from disease and support proper functioning.",
    };
  },
  (rng) => ({
    prompt: `A parent in ${place(rng)} is told their child needs more energy-dense foods, and adds a small amount of cooking oil to the child's meals. Which nutrient is being added?`,
    correct: "Fats",
    wrong: ["Vitamins", "Proteins", "Carbohydrates only, since oil has no fat"],
    explanation: "Cooking oil is a source of fats, which provide a concentrated source of energy — useful for a child needing more energy-dense food.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} explains in class in ${place(rng)} that a balanced meal should include foods from more than one nutrient category. Why does this matter for health?`,
      correct: "Each nutrient plays a different role in the body, so relying on only one type of food leaves other important functions unsupported",
      wrong: ["All nutrients do exactly the same job, so variety makes no difference", "Eating only carbohydrates provides everything the body needs", "Nutrient variety only matters for taste, not health"],
      explanation: "Since carbohydrates, proteins, vitamins and fats each serve different functions, a balanced diet needs a variety of nutrient categories, not just one.",
    };
  },
  (rng) => ({
    prompt: `A doctor in ${place(rng)} explains that a child's swollen belly and thin limbs are a well-known sign of severe protein shortage, distinct from a general shortage of all food. Which disorder is this describing?`,
    correct: "Kwashiorkor",
    wrong: ["Marasmus", "Anaemia", "Goiter"],
    explanation: "Kwashiorkor specifically involves a protein deficiency (often with a swollen belly), while marasmus involves an overall lack of food and energy.",
  }),
];

export const foodNutrients: Skill = {
  id: "g5-ag-food-production-food-nutrients",
  code: "FPP.4",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-food-production",
  grade: 5,
  title: "Food nutrients",
  description: "Functions of 4 named food nutrients (carbohydrates, vitamins, proteins, fats), categorising foods by their major nutrient, and 4 named nutritional diseases/disorders (kwashiorkor, marasmus, goiter, anaemia).",
  generate(rng) {
    const branch = randChoice(rng, ["nutrient-function-match", "food-categorize", "disorder-categorize", "reasoning", "fill-blank"] as const);

    if (branch === "nutrient-function-match") {
      const tokens = shuffle(rng, NUTRIENTS.map((n) => ({ id: n.id, label: n.label })));
      const targets = shuffle(rng, NUTRIENTS.map((n) => ({ id: n.id, label: n.func })));
      const correctMap: Record<string, string> = {};
      for (const n of NUTRIENTS) correctMap[n.id] = n.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "nutrient to its function in the body"),
        tokens,
        targets,
        correctMap,
        hint: "Think about energy, growth/repair, disease protection, and concentrated energy storage.",
        explanation: NUTRIENTS.map((n) => `${n.label} — ${n.func}.`).join(" "),
      };
    }

    if (branch === "food-categorize") {
      const chosen = shuffle(rng, FOODS).slice(0, 8);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.food }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.category));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which nutrient category the food is mainly rich in"),
        items,
        buckets: [
          { id: "carbs", label: "Carbohydrate-rich" },
          { id: "protein", label: "Protein-rich" },
          { id: "vitamins", label: "Vitamin/mineral-rich" },
        ],
        correctBucket,
        hint: "Think about staple/starchy foods, meat/fish/beans/eggs, and fruits/vegetables.",
        explanation: chosen.map((f) => `${f.food} is mainly ${f.category === "carbs" ? "carbohydrate-rich" : f.category === "protein" ? "protein-rich" : "vitamin/mineral-rich"}.`).join(" "),
      };
    }

    if (branch === "disorder-categorize") {
      const items = DISORDERS.map((d) => ({ id: d.id, label: d.cause }));
      const correctBucket: Record<string, string> = {};
      for (const d of DISORDERS) correctBucket[d.id] = d.id;
      // Reuse as a categorize into disorder buckets by cause description — a different representation
      // from the click-match above, sorting causes into which named disorder they lead to.
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which nutritional disorder this cause is linked to"),
        items: shuffle(rng, items),
        buckets: DISORDERS.map((d) => ({ id: d.id, label: d.label })),
        correctBucket,
        hint: "Think about protein, overall food/energy, iodine, and iron.",
        explanation: DISORDERS.map((d) => `${d.cause} is linked to ${d.label}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "The nutrient that gives the body energy for daily activities is ", after: ".", correctAnswer: "carbohydrates" },
      { before: "The nutrient that builds and repairs body tissues is ", after: ".", correctAnswer: "protein", alsoAccept: ["proteins"] },
      { before: "The nutrient that protects the body from disease is ", after: ".", correctAnswer: "vitamins" },
      { before: "The nutrient that provides a concentrated source of energy is ", after: ".", correctAnswer: "fats" },
      { before: "A deficiency of protein, especially in young children, can cause ", after: ".", correctAnswer: "kwashiorkor" },
      { before: "A severe overall lack of food and energy over time can cause ", after: ".", correctAnswer: "marasmus" },
      { before: "A lack of iodine in the diet can cause ", after: ".", correctAnswer: "goiter" },
      { before: "A lack of iron in the diet, affecting the blood, can cause ", after: ".", correctAnswer: "anaemia" },
      { before: "Ugali, rice and bread are examples of ", after: "-rich foods.", correctAnswer: "carbohydrate" },
      { before: "Beans, meat, fish and eggs are examples of ", after: "-rich foods.", correctAnswer: "protein" },
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
      hint: "Think about the 4 nutrients, their functions, and the 4 named nutritional disorders.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
