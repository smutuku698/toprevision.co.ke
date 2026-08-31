import { randChoice, randInt, sampleDistinctInts, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

export const coordinatesAndGraphs: Skill = {
  id: "g8-math-ge-coordinates-graphs",
  code: "GE.2",
  subjectId: "math",
  strandId: "g8-math-geometry",
  grade: 8,
  title: "Coordinates and linear graphs",
  description: "Identify and plot points on a Cartesian plane, generate a table of values, choose a scale, and check whether points lie on a line.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-point", "table-of-values", "slope-two-points", "scale-choice", "match-line", "on-line-sort", "plot-point"] as const);

    if (branch === "plot-point") {
      const x = randInt(rng, -6, 6);
      const y = randInt(rng, -6, 6);
      return {
        kind: "coordinate-plot",
        range: 8,
        targetPoint: { x, y },
        prompt: `Plot the point $(${x}, ${y})$ on the Cartesian plane.`,
        hint: "Move right/left for the x-coordinate, then up/down for the y-coordinate.",
        explanation: `The point (${x}, ${y}) is ${Math.abs(x)} unit${Math.abs(x) === 1 ? "" : "s"} ${x >= 0 ? "right" : "left"} and ${Math.abs(y)} unit${Math.abs(y) === 1 ? "" : "s"} ${y >= 0 ? "up" : "down"} from the origin.`,
      };
    }

    if (branch === "slope-two-points") {
      // A genuinely different, harder skill: computing slope from two given
      // points, not just reading it off a given equation.
      // Ranges are kept tight enough that both plotted points always land
      // within the visual's visible ±10 grid — a point drawn off-grid would
      // be invisible (or worse, look "wrong") even though the math is correct.
      const m = randInt(rng, -3, 3) || 2;
      const x1 = randInt(rng, -6, 6);
      const y1 = randInt(rng, -3, 3);
      const d = randChoice(rng, [1, 2] as const);
      const x2 = x1 + d;
      const y2 = y1 + m * d;
      return {
        kind: "fill-blank",
        prompt: `Find the slope of the line passing through $(${x1}, ${y1})$ and $(${x2}, ${y2})$.`,
        visual: { type: "coordinate-line", slope: 0, intercept: 0, showLine: false, points: [[x1, y1], [x2, y2]] },
        before: "Slope =",
        after: "",
        correctAnswer: String(m),
        inputMode: "numeric",
        hint: "Slope $= \\dfrac{y_2 - y_1}{x_2 - x_1}$.",
        explanation: `Slope $= \\dfrac{${y2} - ${y1}}{${x2} - ${x1}} = \\dfrac{${y2 - y1}}{${x2 - x1}} = ${m}$.`,
      };
    }

    if (branch === "identify-point") {
      const px = randInt(rng, -8, 8);
      const py = randInt(rng, -8, 8);
      const askX = rng() < 0.5;
      return {
        kind: "fill-blank",
        prompt: `A point is plotted on the Cartesian plane. What is its ${askX ? "x" : "y"}-coordinate?`,
        visual: { type: "coordinate-line", slope: 0, intercept: 0, showLine: false, points: [[px, py]] },
        before: `${askX ? "x" : "y"} =`,
        after: "",
        correctAnswer: String(askX ? px : py),
        inputMode: "numeric",
        hint: "The x-coordinate is how far left/right of the origin the point is; the y-coordinate is how far up/down.",
        explanation: `The point is at (${px}, ${py}), so its ${askX ? "x" : "y"}-coordinate is ${askX ? px : py}.`,
      };
    }

    if (branch === "table-of-values") {
      const slope = randInt(rng, -4, 4) || 1;
      const intercept = randInt(rng, -6, 6);
      const x = randInt(rng, -6, 6);
      const y = slope * x + intercept;
      return {
        kind: "fill-blank",
        prompt: `For the linear equation $y = ${slope}x ${intercept >= 0 ? "+" : "-"} ${Math.abs(intercept)}$, find the value of y when $x = ${x}$.`,
        before: "y =",
        after: "",
        correctAnswer: String(y),
        inputMode: "numeric",
        hint: "Substitute the x-value into the equation.",
        explanation: `$y = ${slope}(${x}) ${intercept >= 0 ? "+" : "-"} ${Math.abs(intercept)} = ${slope * x} ${intercept >= 0 ? "+" : "-"} ${Math.abs(intercept)} = ${y}$.`,
      };
    }

    if (branch === "scale-choice") {
      const maxValue = randChoice(rng, [24, 36, 48, 60, 84, 96] as const);
      const gridlines = 12;
      const niceScales = [1, 2, 3, 5, 10];
      const bestScale = niceScales.find((s) => maxValue / s <= gridlines) ?? 10;
      const otherScales = niceScales.filter((s) => s !== bestScale);
      const choices = shuffle(rng, [bestScale, ...otherScales.slice(0, 3)]).map((s) => `${s} unit${s > 1 ? "s" : ""} per square`);
      const correctText = `${bestScale} unit${bestScale > 1 ? "s" : ""} per square`;
      return {
        kind: "multiple-choice",
        prompt: `A graph's axis needs to show values from 0 to ${maxValue}, and the grid has ${gridlines} squares along that axis. Which scale fits best?`,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: `Divide the maximum value by the number of squares available (${gridlines}), then round up to a sensible scale.`,
        explanation: `${maxValue} ÷ ${gridlines} ≈ ${(maxValue / gridlines).toFixed(1)}, so a scale of ${bestScale} unit${bestScale > 1 ? "s" : ""} per square fits all the values within ${gridlines} squares.`,
      };
    }

    if (branch === "match-line") {
      const count = randChoice(rng, [3, 4] as const);
      const slopes = sampleDistinctInts(rng, -5, 5, count, [0]);
      const tokens = slopes.map((m) => {
        const c = randInt(rng, -6, 6);
        return { m, c };
      });
      const eqTokens = tokens.map((t) => ({
        id: `eq${t.m}-${t.c}`,
        label: `y = ${t.m}x ${t.c >= 0 ? "+" : "-"} ${Math.abs(t.c)}`,
      }));
      const descTargets = shuffle(
        rng,
        tokens.map((t) => ({
          id: `desc${t.m}-${t.c}`,
          label: `slope ${t.m}, y-intercept ${t.c}`,
        }))
      );
      const correctMap: Record<string, string> = {};
      for (const t of tokens) correctMap[`desc${t.m}-${t.c}`] = `eq${t.m}-${t.c}`;
      return {
        kind: "click-match",
        prompt: "Match each linear equation to its slope and y-intercept.",
        tokens: shuffle(rng, eqTokens),
        targets: descTargets,
        correctMap,
        hint: "In $y = mx + c$, m is the slope and c is the y-intercept.",
        explanation: tokens.map((t) => `y = ${t.m}x ${t.c >= 0 ? "+" : "-"} ${Math.abs(t.c)} → slope ${t.m}, y-intercept ${t.c}`).join("; ") + ".",
      };
    }

    // on-line-sort: categorize points as on the line or not
    const slope = randInt(rng, -3, 3) || 1;
    const intercept = randInt(rng, -5, 5);
    const onLineXs = sampleDistinctInts(rng, -6, 6, 3);
    const onLinePoints = onLineXs.map((x) => [x, slope * x + intercept] as [number, number]);
    const offLinePoints: [number, number][] = [];
    while (offLinePoints.length < 3) {
      const x = randInt(rng, -6, 6);
      const y = randInt(rng, -10, 10);
      if (y !== slope * x + intercept) offLinePoints.push([x, y]);
    }
    const items = shuffle(rng, [...onLinePoints, ...offLinePoints]).map(([x, y]) => ({ id: `p${x}-${y}`, label: `(${x}, ${y})` }));
    const buckets = [
      { id: "on", label: "On the line" },
      { id: "off", label: "Not on the line" },
    ];
    const correctBucket: Record<string, string> = {};
    for (const [x, y] of onLinePoints) correctBucket[`p${x}-${y}`] = "on";
    for (const [x, y] of offLinePoints) correctBucket[`p${x}-${y}`] = "off";
    return {
      kind: "categorize",
      prompt: `Sort each point by whether it lies on the line $y = ${slope}x ${intercept >= 0 ? "+" : "-"} ${Math.abs(intercept)}$.`,
      items,
      buckets,
      correctBucket,
      hint: "Substitute the point's x-value into the equation and check if you get its y-value.",
      explanation: `For $y = ${slope}x ${intercept >= 0 ? "+" : "-"} ${Math.abs(intercept)}$: on the line: ${onLinePoints.map(([x, y]) => `(${x},${y})`).join(", ")}. Not on the line: ${offLinePoints.map(([x, y]) => `(${x},${y})`).join(", ")}.`,
    };
  },
};
