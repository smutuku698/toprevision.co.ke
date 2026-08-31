import { numericDistractors, randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

export const lineEquationGraph: Skill = {
  id: "math-a-line-equation-graph",
  code: "A.2",
  subjectId: "math",
  strandId: "math-algebra",
  grade: 9,
  title: "Equations of straight lines",
  description: "Read the slope or y-intercept of a straight line from its graph, or identify a point on it.",
  generate(rng) {
    const slope = randChoice(rng, [-3, -2, -1, 1, 2, 3]);
    const intercept = randInt(rng, -6, 6);
    const sign = intercept >= 0 ? "+" : "-";
    const lineDesc = `$y = ${slope}x ${sign} ${Math.abs(intercept)}$`;
    const mode = randChoice(rng, ["slope", "intercept", "point"] as const);

    if (mode === "point") {
      const x0 = randInt(rng, -5, 5);
      const y0 = slope * x0 + intercept;
      const correctPoint = `$(${x0}, ${y0})$`;

      // Every one of these is guaranteed off the line: shifting y at a fixed x,
      // or shifting x at a fixed y, can only reproduce the true point when the
      // shift is 0 (since the line has a unique y for every x, and slope != 0).
      const candidatePool: [number, number][] = [];
      for (const d of [-3, -2, -1, 1, 2, 3]) {
        candidatePool.push([x0, y0 + d]);
        candidatePool.push([x0 + d, y0]);
      }
      const distractorStrs = Array.from(
        new Set(candidatePool.map(([px, py]) => `$(${px}, ${py})$`))
      ).filter((s) => s !== correctPoint);
      const distractors = shuffle(rng, distractorStrs).slice(0, 3);
      const choices = shuffle(rng, [correctPoint, ...distractors]);
      const correctIndex = choices.indexOf(correctPoint);

      return {
        kind: "multiple-choice",
        prompt: `Which point lies on the line ${lineDesc}?`,
        visual: { type: "coordinate-line", slope, intercept },
        choices,
        correctIndex,
        layout: "grid",
        hint: `Substitute the x-value into ${lineDesc} and check whether you get the matching y-value.`,
        explanation: `For $x = ${x0}$: $y = (${slope})(${x0}) ${sign} ${Math.abs(intercept)} = ${slope * x0} ${sign} ${Math.abs(
          intercept
        )} = ${y0}$. So the point $(${x0}, ${y0})$ lies on the line.`,
      };
    }

    const askSlope = mode === "slope";
    const correct = askSlope ? slope : intercept;
    const hint = askSlope
      ? "In $y = mx + c$, the slope is the coefficient $m$ in front of $x$."
      : "In $y = mx + c$, the y-intercept is the constant term $c$.";
    const explanation = askSlope
      ? `The equation ${lineDesc} is in the form $y = mx + c$, where $m$ is the slope. Here $m = ${slope}$, so the slope is ${slope}.`
      : `The equation ${lineDesc} is in the form $y = mx + c$, where $c$ is the y-intercept. Here $c = ${intercept}$, so the y-intercept is ${intercept}.`;
    const questionText = askSlope ? `What is the slope of the line ${lineDesc}?` : `What is the y-intercept of the line ${lineDesc}?`;

    if (rng() < 0.5) {
      return {
        kind: "fill-blank",
        prompt: questionText,
        visual: { type: "coordinate-line", slope, intercept },
        before: askSlope ? "Slope =" : "y-intercept =",
        after: "",
        correctAnswer: String(correct),
        inputMode: "numeric",
        hint,
        explanation,
      };
    }

    const distractors = numericDistractors(
      rng,
      correct,
      [correct + 1, correct - 1, correct + 2, -correct, correct * -1 + 1],
      3
    );
    const choices = shuffle(rng, [correct, ...distractors]).map(String);
    const correctIndex = choices.indexOf(String(correct));

    return {
      kind: "multiple-choice",
      prompt: questionText,
      visual: { type: "coordinate-line", slope, intercept },
      choices,
      correctIndex,
      layout: "row",
      hint,
      explanation,
    };
  },
};
