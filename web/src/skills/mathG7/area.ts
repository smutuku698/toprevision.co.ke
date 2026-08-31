import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

export const area: Skill = {
  id: "g7-math-m-area",
  code: "M.3",
  subjectId: "math",
  strandId: "g7-math-measurements",
  grade: 7,
  title: "Area",
  description: "Identify m², acres, and hectares as units of area, find the area of rectangles, parallelograms, rhombuses, trapeziums, and circles, and the area of borders and combined shapes.",
  generate(rng) {
    const branch = randChoice(rng, ["rectangle-area", "parallelogram-trapezium", "circle-area", "border-area", "unit-convert", "match-formula", "derive-circle-steps"] as const);

    if (branch === "rectangle-area") {
      const w = randInt(rng, 6, 45);
      const h = randInt(rng, 6, 45);
      const area = w * h;
      return {
        kind: "fill-blank",
        prompt: `A rectangular maize garden measures ${w} m by ${h} m. Find its area.`,
        visual: { type: "rectangle", width: w, height: h, labelWidth: `${w} m`, labelHeight: `${h} m` },
        before: "Area =",
        after: "m²",
        correctAnswer: String(area),
        inputMode: "numeric",
        hint: "Area of a rectangle = length × width.",
        explanation: `Area $= ${w} \\times ${h} = ${area}$ m².`,
      };
    }

    if (branch === "parallelogram-trapezium") {
      const shapeType = randChoice(rng, ["parallelogram", "rhombus", "trapezium"] as const);
      if (shapeType === "trapezium") {
        const a = randInt(rng, 6, 25);
        const b = randInt(rng, 6, 25);
        const height = randInt(rng, 4, 20);
        const area = ((a + b) * height) / 2;
        return {
          kind: "fill-blank",
          prompt: `A trapezium-shaped plot has parallel sides of ${a} m and ${b} m, and a perpendicular height of ${height} m between them. Find its area.`,
          before: "Area =",
          after: "m²",
          correctAnswer: String(area),
          inputMode: "numeric",
          hint: "Area of a trapezium = ½ × (sum of parallel sides) × height.",
          explanation: `Area $= \\frac{1}{2} \\times (${a} + ${b}) \\times ${height} = \\frac{1}{2} \\times ${a + b} \\times ${height} = ${area}$ m².`,
        };
      }
      const base = randInt(rng, 6, 30);
      const height = randInt(rng, 4, 25);
      const area = base * height;
      const shapeName = shapeType === "parallelogram" ? "parallelogram-shaped" : "rhombus-shaped";
      return {
        kind: "fill-blank",
        prompt: `A ${shapeName} plot has a base of ${base} m and a perpendicular height of ${height} m. Find its area.`,
        before: "Area =",
        after: "m²",
        correctAnswer: String(area),
        inputMode: "numeric",
        hint: `Area of a ${shapeType} = base × perpendicular height.`,
        explanation: `Area $= ${base} \\times ${height} = ${area}$ m².`,
      };
    }

    if (branch === "circle-area") {
      const radius = randChoice(rng, [7, 14, 21, 28, 35] as const);
      const area = Math.round((22 / 7) * radius * radius * 100) / 100;
      const askReverse = rng() < 0.4;
      if (!askReverse) {
        return {
          kind: "fill-blank",
          prompt: `A circular flower bed has a radius of ${radius} m. Find its area. (Use π ≈ 22/7)`,
          visual: { type: "circle-shape", radius, label: `${radius} m` },
          before: "Area =",
          after: "m²",
          correctAnswer: String(area),
          inputMode: "numeric",
          hint: "Area of a circle = π × radius².",
          explanation: `Area $= \\frac{22}{7} \\times ${radius}^2 = \\frac{22}{7} \\times ${radius * radius} = ${area}$ m².`,
        };
      }
      const wrong = [String(radius - 2), String(radius * 2), String(Math.round(area / (22 / 7)))];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(radius), wrong);
      return {
        kind: "multiple-choice",
        prompt: `A circular flower bed has an area of ${area} m². Find its radius. (Use π ≈ 22/7)`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Rearrange: radius² = area ÷ π, then take the square root.",
        explanation: `radius² $= ${area} \\div \\frac{22}{7} = ${radius * radius}$, so radius $= \\sqrt{${radius * radius}} = ${radius}$ m.`,
      };
    }

    if (branch === "border-area") {
      const outerW = randInt(rng, 15, 40);
      const outerH = randInt(rng, 15, 40);
      const borderWidth = randInt(rng, 1, 4);
      const innerW = outerW - 2 * borderWidth;
      const innerH = outerH - 2 * borderWidth;
      const borderArea = outerW * outerH - innerW * innerH;
      return {
        kind: "fill-blank",
        prompt: `A rectangular photo of ${innerW} m by ${innerH} m is placed inside a frame, making the outer rectangle ${outerW} m by ${outerH} m (a border ${borderWidth} m wide all around). Find the area of the border alone.`,
        visual: { type: "rectangle", width: outerW, height: outerH, labelWidth: `${outerW} m`, labelHeight: `${outerH} m` },
        before: "Border area =",
        after: "m²",
        correctAnswer: String(borderArea),
        inputMode: "numeric",
        hint: "Border area = outer area − inner area.",
        explanation: `Outer area $= ${outerW} \\times ${outerH} = ${outerW * outerH}$ m². Inner area $= ${innerW} \\times ${innerH} = ${innerW * innerH}$ m². Border area $= ${outerW * outerH} - ${innerW * innerH} = ${borderArea}$ m².`,
      };
    }

    if (branch === "unit-convert") {
      // 1 hectare = 10,000 m², 1 acre = 4,047 m² (approx, but curriculum keeps 1 acre ≈ 4047 m² or 0.4047 ha)
      const direction = randChoice(rng, ["ha-to-m2", "m2-to-ha"] as const);
      if (direction === "ha-to-m2") {
        const ha = randInt(rng, 2, 15);
        const m2 = ha * 10000;
        return {
          kind: "fill-blank",
          prompt: `A farm covers ${ha} hectares. Convert this to square metres (1 hectare = 10,000 m²).`,
          before: "Area =",
          after: "m²",
          correctAnswer: String(m2),
          inputMode: "numeric",
          hint: "Multiply the number of hectares by 10,000.",
          explanation: `${ha} ha × 10,000 = ${m2.toLocaleString()} m².`,
        };
      }
      const haWhole = randInt(rng, 2, 12);
      const m2 = haWhole * 10000;
      const wrong = [String(m2 / 10), String(m2 * 10), String(m2 + 1000)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(haWhole), wrong);
      return {
        kind: "multiple-choice",
        prompt: `A plot has an area of ${m2.toLocaleString()} m². How many hectares is this? (1 hectare = 10,000 m²)`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Divide the area in m² by 10,000.",
        explanation: `${m2.toLocaleString()} m² ÷ 10,000 = ${haWhole} hectares.`,
      };
    }

    if (branch === "match-formula") {
      // Every formula here is textually distinct — rhombus is deliberately excluded since it
      // shares the exact same "base × perpendicular height" formula text as parallelogram,
      // which would produce duplicate target labels if both were included.
      const pairs = [
        { shape: "Rectangle", formula: "length × width" },
        { shape: "Parallelogram", formula: "base × perpendicular height" },
        { shape: "Trapezium", formula: "½ × (sum of parallel sides) × height" },
        { shape: "Circle", formula: "π × radius²" },
      ];
      const tokens = pairs.map((p, i) => ({ id: `s${i}`, label: p.shape }));
      const targets = shuffle(rng, pairs.map((p, i) => ({ id: `f${i}`, label: p.formula })));
      const correctMap: Record<string, string> = {};
      pairs.forEach((p, i) => (correctMap[`f${i}`] = `s${i}`));
      return {
        kind: "click-match",
        prompt: "Match each shape to the formula used to find its area.",
        tokens,
        targets,
        correctMap,
        hint: "Rectangles and parallelograms use a base/length × height style formula; trapeziums average the two parallel sides first; circles use π.",
        explanation: pairs.map((p) => `${p.shape}: area = ${p.formula}`).join("; ") + ".",
      };
    }

    // derive-circle-steps: order the steps for deriving the area-of-a-circle formula by cutting sectors
    const steps = [
      { id: "s1", label: "Cut the circle into many equal, thin sectors" },
      { id: "s2", label: "Rearrange the sectors alternately to form a shape that looks like a rectangle" },
      { id: "s3", label: "Notice the rectangle's length is half the circle's circumference, and its width is the radius" },
      { id: "s4", label: "Multiply length × width to get area = πr²" },
    ];
    return {
      kind: "ordering",
      prompt: "Put these steps for deriving the area-of-a-circle formula (by cutting the circle into sectors) in the correct order.",
      instruction: "Click the steps in order.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      hint: "You cut first, then rearrange, then identify the rectangle's dimensions, then multiply.",
      explanation: "Steps: (1) cut into thin sectors, (2) rearrange into a near-rectangle, (3) its length ≈ half the circumference and width = radius, (4) length × width gives area = πr².",
    };
  },
};
