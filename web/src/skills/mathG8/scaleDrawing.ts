import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

const K_VALUES = [1, 2, 4, 5] as const; // scale denominator = 100000 * k, so actual_km = map_cm * k

export const scaleDrawing: Skill = {
  id: "g8-math-ge-scale-drawing",
  code: "GE.3",
  subjectId: "math",
  strandId: "g8-math-geometry",
  grade: 8,
  title: "Scale drawing and map scales",
  description: "Convert between actual and scale length, and between statement-form and ratio-form scales, in real-life map and drawing situations.",
  generate(rng) {
    const branch = randChoice(rng, ["actual-to-scale", "scale-to-actual", "statement-to-ratio", "ratio-to-statement", "area-scale", "consistency", "detail-order"] as const);

    if (branch === "area-scale") {
      // Advanced extension: area scales by the SQUARE of the linear scale
      // factor — a common misconception is to scale area the same as length.
      const n = randChoice(rng, [10, 20, 25, 50] as const);
      const drawingArea = randInt(rng, 4, 40);
      const actualArea = drawingArea * n * n;
      return {
        kind: "fill-blank",
        prompt: `A plot of land is drawn to a scale of 1:${n}. On the scale drawing, the plot has an area of ${drawingArea} cm². What is the actual area of the plot, in cm²?`,
        before: "Actual area =",
        after: "cm²",
        correctAnswer: String(actualArea),
        inputMode: "numeric",
        hint: `Area scales by the square of the linear scale factor: multiply by ${n}², not just ${n}.`,
        explanation: `Linear scale factor $= ${n}$, so the area scale factor $= ${n}^2 = ${n * n}$. Actual area $= ${drawingArea} \\times ${n * n} = ${actualArea}$ cm².`,
      };
    }

    if (branch === "actual-to-scale") {
      const k = randChoice(rng, K_VALUES);
      const scaleDenom = 100000 * k;
      const mapCm = randInt(rng, 2, 10);
      const actualKm = mapCm * k;
      return {
        kind: "fill-blank",
        prompt: `A map has a scale of 1 : ${scaleDenom.toLocaleString()}. The actual distance between two towns is ${actualKm} km. What is the distance on the map?`,
        visual: { type: "rectangle", width: mapCm, height: mapCm / 2 || 1, labelWidth: "map plot", labelHeight: "" },
        before: "Map distance =",
        after: "cm",
        correctAnswer: String(mapCm),
        inputMode: "numeric",
        hint: "Convert the actual distance to cm, then divide by the scale's second number.",
        explanation: `Actual distance $= ${actualKm}$ km $= ${(actualKm * 100000).toLocaleString()}$ cm. Map distance $= ${(actualKm * 100000).toLocaleString()} \\div ${scaleDenom.toLocaleString()} = ${mapCm}$ cm.`,
      };
    }

    if (branch === "scale-to-actual") {
      const k = randChoice(rng, K_VALUES);
      const scaleDenom = 100000 * k;
      const mapCm = randInt(rng, 2, 10);
      const actualKm = mapCm * k;
      return {
        kind: "fill-blank",
        prompt: `A map has a scale of 1 : ${scaleDenom.toLocaleString()}. Two schools are ${mapCm} cm apart on the map. What is the actual distance between them?`,
        before: "Actual distance =",
        after: "km",
        correctAnswer: String(actualKm),
        inputMode: "numeric",
        hint: "Multiply the map distance by the scale's second number, then convert cm to km.",
        explanation: `Actual distance $= ${mapCm} \\times ${scaleDenom.toLocaleString()} = ${(mapCm * scaleDenom).toLocaleString()}$ cm $= ${actualKm}$ km.`,
      };
    }

    if (branch === "statement-to-ratio") {
      const kmPerCm = randChoice(rng, [1, 2, 3, 4, 5, 10] as const);
      const ratioDenom = kmPerCm * 100000;
      const correctText = `1 : ${ratioDenom.toLocaleString()}`;
      const wrongCandidates = [`1 : ${(ratioDenom / 10).toLocaleString()}`, `1 : ${(ratioDenom * 10).toLocaleString()}`, `${kmPerCm} : 100000`];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctText, wrongCandidates);
      return {
        kind: "multiple-choice",
        prompt: `A map's scale is stated as "1 cm represents ${kmPerCm} km". Write this in ratio form.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Convert the km to cm (1 km = 100,000 cm) to get the ratio's second number.",
        explanation: `${kmPerCm} km $= ${ratioDenom.toLocaleString()}$ cm, so the ratio form is $1 : ${ratioDenom.toLocaleString()}$.`,
      };
    }

    if (branch === "ratio-to-statement") {
      const kmPerCm = randChoice(rng, [1, 2, 3, 4, 5, 10] as const);
      const ratioDenom = kmPerCm * 100000;
      const correctText = `1 cm represents ${kmPerCm} km`;
      const wrongCandidates = [`1 cm represents ${kmPerCm * 10} km`, `1 cm represents ${Math.max(1, kmPerCm - 1)} km`, `${kmPerCm} cm represents 1 km`];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctText, wrongCandidates);
      return {
        kind: "multiple-choice",
        prompt: `A map's scale is $1 : ${ratioDenom.toLocaleString()}$. Write this in statement form.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Convert the ratio's second number from cm back into km (divide by 100,000).",
        explanation: `${ratioDenom.toLocaleString()}$ cm $= ${kmPerCm}$ km, so the statement form is "1 cm represents ${kmPerCm} km".`,
      };
    }

    if (branch === "consistency") {
      const scenarios = Array.from({ length: 5 }, () => {
        const k = randChoice(rng, K_VALUES);
        const scaleDenom = 100000 * k;
        const mapCm = randInt(rng, 2, 10);
        const trueActualKm = mapCm * k;
        const isConsistent = rng() < 0.5;
        const statedActualKm = isConsistent ? trueActualKm : trueActualKm + randChoice(rng, [-2, -1, 1, 2, 3]);
        return { scaleDenom, mapCm, statedActualKm, isConsistent: statedActualKm === trueActualKm };
      });
      const items = scenarios.map((s, i) => ({
        id: `sc${i}`,
        label: `Scale 1:${s.scaleDenom.toLocaleString()}, map length ${s.mapCm} cm, stated actual ${s.statedActualKm} km`,
      }));
      const buckets = [
        { id: "consistent", label: "Consistent with the scale" },
        { id: "inconsistent", label: "Not consistent" },
      ];
      const correctBucket: Record<string, string> = {};
      scenarios.forEach((s, i) => (correctBucket[`sc${i}`] = s.isConsistent ? "consistent" : "inconsistent"));
      return {
        kind: "categorize",
        prompt: "For each map, check whether the stated actual distance matches what the scale and map length predict.",
        items: shuffle(rng, items),
        buckets,
        correctBucket,
        hint: "Work out the true actual distance from the scale and map length, then compare it to what is stated.",
        explanation: scenarios.map((s) => `1:${s.scaleDenom.toLocaleString()}, ${s.mapCm} cm → true actual = ${(s.mapCm * s.scaleDenom) / 100000} km, stated = ${s.statedActualKm} km (${s.isConsistent ? "matches" : "does not match"})`).join("; ") + ".",
      };
    }

    // detail-order: order scales from most detailed (zoomed in) to least detailed
    const denoms = new Set<number>();
    while (denoms.size < 4) denoms.add(randChoice(rng, [1000, 5000, 25000, 50000, 100000, 250000, 500000, 1000000] as const));
    const values = Array.from(denoms);
    const items = values.map((d) => ({ id: `d${d}`, label: `1 : ${d.toLocaleString()}` }));
    const sorted = [...values].sort((a, b) => a - b);
    return {
      kind: "ordering",
      prompt: "Order these map scales from most detailed (most zoomed-in) to least detailed.",
      instruction: "Click them in order, most detailed first.",
      items: shuffle(rng, items),
      correctOrder: sorted.map((d) => `d${d}`),
      hint: "A smaller ratio denominator (like 1:1,000) means the map is more zoomed-in and detailed than a larger one (like 1:1,000,000).",
      explanation: `From most to least detailed: ${sorted.map((d) => `1:${d.toLocaleString()}`).join(", ")}.`,
    };
  },
};
