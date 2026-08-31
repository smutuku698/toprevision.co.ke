import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { NumberLineQuestion, Skill } from "@/lib/types";

const OPS = [
  { op: ">", mode: "inequality-gt" as const, word: "more than" },
  { op: "\\geq", mode: "inequality-gte" as const, word: "at least" },
  { op: "<", mode: "inequality-lt" as const, word: "less than" },
  { op: "\\leq", mode: "inequality-lte" as const, word: "at most" },
];

export const linearInequalities: Skill = {
  id: "g7-math-a-linear-inequalities",
  code: "A.3",
  subjectId: "math",
  strandId: "g7-math-algebra",
  grade: 7,
  title: "Linear inequalities",
  description: "Use inequality symbols, form and solve simple and compound linear inequalities in one unknown, and illustrate them on a number line.",
  generate(rng: RNG) {
    const branch = randChoice(rng, ["simple-plot", "solve-inequality", "symbol-meaning", "compound-check", "compound-form", "test-value"] as const);

    if (branch === "simple-plot") {
      const boundary = randInt(rng, -6, 6);
      const chosen = randChoice(rng, OPS);
      return {
        kind: "number-line",
        prompt: `Illustrate the inequality $x ${chosen.op} ${boundary}$ on the number line by clicking a point that satisfies it.`,
        hint: chosen.mode.includes("gt") ? "Click any point to the right of (or at) the boundary." : "Click any point to the left of (or at) the boundary.",
        min: -10,
        max: 10,
        step: 1,
        correctValue: boundary,
        mode: chosen.mode as NumberLineQuestion["mode"],
        explanation: `$x ${chosen.op} ${boundary}$ means x can be any value ${chosen.word} ${boundary}.`,
      };
    }

    if (branch === "solve-inequality") {
      const x = randInt(rng, -6, 6);
      const a = randInt(rng, 2, 6);
      const chosen = randChoice(rng, OPS);
      const rhs = a * x;
      return {
        kind: "fill-blank",
        prompt: `Solve for x: $${a}x ${chosen.op} ${rhs}$ (give the boundary value only)`,
        before: "x is bounded by",
        after: "",
        correctAnswer: String(x),
        inputMode: "numeric",
        hint: `Divide both sides by ${a} (a positive number, so the inequality direction stays the same).`,
        explanation: `Dividing both sides by ${a}: $x ${chosen.op} ${x}$.`,
      };
    }

    if (branch === "symbol-meaning") {
      const pairs = [
        { symbol: "$>$", meaning: "strictly greater than" },
        { symbol: "$<$", meaning: "strictly less than" },
        { symbol: "$\\geq$", meaning: "greater than or equal to (at least)" },
        { symbol: "$\\leq$", meaning: "less than or equal to (at most)" },
      ];
      const chosen = shuffle(rng, pairs).slice(0, 4);
      const tokens = chosen.map((p, i) => ({ id: `s${i}`, label: p.symbol }));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`m${i}`] = `s${i}`));
      return {
        kind: "click-match",
        prompt: "Match each inequality symbol to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "The symbols with a line underneath (≥, ≤) include \"or equal to\".",
        explanation: chosen.map((p) => `${p.symbol} means ${p.meaning}`).join("; ") + ".",
      };
    }

    if (branch === "compound-check") {
      const low = randInt(rng, -8, 2);
      const high = low + randInt(rng, 3, 8);
      const testValues = new Set<number>();
      while (testValues.size < 6) testValues.add(randInt(rng, low - 5, high + 5));
      const values = [...testValues];
      const items = values.map((v) => ({ id: String(v), label: String(v) }));
      const buckets = [
        { id: "in", label: `Satisfies ${low} < x < ${high}` },
        { id: "out", label: "Does not satisfy it" },
      ];
      const correctBucket: Record<string, string> = {};
      for (const v of values) correctBucket[String(v)] = v > low && v < high ? "in" : "out";
      return {
        kind: "categorize",
        prompt: `Sort each value by whether it satisfies the compound inequality $${low} < x < ${high}$.`,
        items,
        buckets,
        correctBucket,
        hint: "The value must be strictly greater than the lower bound AND strictly less than the upper bound.",
        explanation: values.map((v) => `${v} ${v > low && v < high ? "satisfies" : "does not satisfy"} ${low} < x < ${high}`).join("; ") + ".",
      };
    }

    if (branch === "compound-form") {
      // Real-life compound inequality, e.g. an age or weight bracket.
      const low = randInt(rng, 5, 40);
      const high = low + randInt(rng, 5, 25);
      const contexts = [
        { subject: "age (in years) to join a school football team", unit: "years" },
        { subject: "weight (in kg) of parcels this courier accepts", unit: "kg" },
        { subject: "temperature (in °C) at which this crop grows well", unit: "°C" },
        { subject: "height (in cm) to ride this amusement park attraction", unit: "cm" },
        { subject: "speed (in km/h) allowed on this stretch of road", unit: "km/h" },
        { subject: "number of learners allowed in this school bus", unit: "learners" },
        { subject: "amount of rainfall (in mm) considered normal for this month", unit: "mm" },
        { subject: "price (in KES) of items in this shop's discount bin", unit: "KES" },
        { subject: "distance (in km) this delivery service covers for a flat fee", unit: "km" },
        { subject: "mass (in kg) of luggage allowed on this flight", unit: "kg" },
      ];
      const ctx = randChoice(rng, contexts);
      const correctExpr = `${low} < x < ${high}`;
      const wrong = [`${low} \\leq x \\leq ${high}`, `x < ${low}`, `x > ${high}`, `${high} < x < ${low}`];
      const choices = shuffle(rng, [correctExpr, ...wrong]).map((c) => `$${c}$`);
      return {
        kind: "multiple-choice",
        prompt: `A rule says the ${ctx.subject} must be strictly more than ${low} ${ctx.unit} and strictly less than ${high} ${ctx.unit}. Which compound inequality represents this?`,
        choices,
        correctIndex: choices.indexOf(`$${correctExpr}$`),
        layout: "list",
        hint: "\"Strictly more than\" and \"strictly less than\" use the strict symbols < and >, with x in the middle.",
        explanation: `The rule is $${correctExpr}$ — x is bounded strictly between ${low} and ${high}.`,
      };
    }

    // test-value: click the smallest whole-number value that satisfies a compound inequality
    const low = randInt(rng, -7, 0);
    const high = low + randInt(rng, 4, 9);
    return {
      kind: "number-line",
      prompt: `For the compound inequality $${low} \\leq x \\leq ${high}$, click the SMALLEST whole number that satisfies it.`,
      hint: "The smallest value that satisfies it is the lower bound itself, since ≤ includes the boundary.",
      min: -10,
      max: 10,
      step: 1,
      correctValue: low,
      mode: "point",
      explanation: `The smallest value satisfying $${low} \\leq x \\leq ${high}$ is ${low} itself, since $\\leq$ includes the boundary.`,
    };
  },
};
