import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// {areaM2, lengthCm, widthCm} — lengthCm*widthCm/10000 always equals areaM2 exactly.
const AREA_RECORDS = [
  { area: 0.05, length: 20, width: 25 },
  { area: 0.1, length: 25, width: 40 },
  { area: 0.2, length: 40, width: 50 },
  { area: 0.25, length: 50, width: 50 },
  { area: 0.5, length: 50, width: 100 },
  { area: 1, length: 100, width: 100 },
] as const;

// Multiples of 100 keep forceN = pressurePa * areaM2 an exact whole number for every area above.
const PRESSURE_OPTIONS = [200, 300, 400, 500, 600, 800, 900, 1000, 1200, 1500, 2000];

function fmtArea(a: number): string {
  return a % 1 === 0 ? String(a) : a.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

const APPLICATIONS = [
  { thing: "A sharp knife blade", reason: "Its small surface area concentrates the same force into very high pressure, allowing it to cut easily" },
  { thing: "A tractor's wide tyres", reason: "Their large surface area spreads the tractor's weight out, lowering the pressure so it does not sink into soft ground" },
  { thing: "A dam wall built thicker at the bottom than at the top", reason: "Water pressure increases with depth, so the base must withstand much greater pressure than the top" },
  { thing: "A hydraulic car jack", reason: "Pressure applied to a liquid is transmitted equally throughout it, so a small force on a narrow piston can lift a heavy car on a wider piston" },
  { thing: "A drawing pin (thumb tack) with a sharp point", reason: "Its tiny point area creates very high pressure from a small push, letting it pierce a surface easily" },
  { thing: "Wide skis on snow", reason: "Their large surface area spreads a skier's weight out, lowering the pressure so they do not sink into the snow" },
] as const;

const LIQUID_FACTS = [
  { text: "Pressure in a liquid increases the deeper you go", bucket: "liquid" },
  { text: "Liquid pressure acts equally in all directions at a given depth", bucket: "liquid" },
  { text: "Pressure applied to a liquid in a closed system is transmitted equally throughout it", bucket: "liquid" },
  { text: "Pressure is the force applied per unit area", bucket: "both" },
  { text: "Reducing the area a force acts on increases the pressure produced", bucket: "both" },
  { text: "A solid only exerts pressure on the surface it is directly resting on", bucket: "solid" },
] as const;

export const pressure: Skill = {
  id: "g8-sci-fe-pressure",
  code: "FE.2",
  subjectId: "science",
  strandId: "g8-sci-fe",
  grade: 8,
  title: "Pressure in solids and liquids",
  description: "Calculating pressure from force and area, comparing pressure in different situations, applications, and facts about liquid pressure.",
  generate(rng) {
    const branch = randChoice(rng, ["calculate", "compare", "applications", "liquid-facts"] as const);

    if (branch === "calculate") {
      const rec = randChoice(rng, AREA_RECORDS);
      const pressurePa = randChoice(rng, PRESSURE_OPTIONS);
      const forceN = pressurePa * rec.area;
      const unknown = randChoice(rng, ["pressure", "force", "area"] as const);

      if (unknown === "pressure") {
        return {
          kind: "fill-blank",
          prompt: `A crate exerts a force of ${forceN}N on the ground through a rectangular base measuring ${rec.length}cm by ${rec.width}cm. What pressure does it exert, in pascals (Pa)?`,
          visual: { type: "rectangle", width: rec.length, height: rec.width, labelWidth: `${rec.length} cm`, labelHeight: `${rec.width} cm` },
          before: "Pressure =",
          after: "Pa",
          correctAnswer: String(pressurePa),
          inputMode: "numeric",
          hint: `Pressure = Force ÷ Area. First find the area in m² (1m² = 10,000cm²): ${rec.length} × ${rec.width} = ${rec.length * rec.width}cm² = ${fmtArea(rec.area)}m².`,
          explanation: `Area = ${rec.length}cm × ${rec.width}cm = ${rec.length * rec.width}cm² = ${fmtArea(rec.area)}m². Pressure = Force ÷ Area = ${forceN}N ÷ ${fmtArea(rec.area)}m² = ${pressurePa}Pa.`,
        };
      }

      if (unknown === "force") {
        return {
          kind: "fill-blank",
          prompt: `A liquid exerts a pressure of ${pressurePa}Pa on a surface of area ${fmtArea(rec.area)}m². What force does it exert, in newtons (N)?`,
          before: "Force =",
          after: "N",
          correctAnswer: String(forceN),
          inputMode: "numeric",
          hint: "Pressure = Force ÷ Area, so Force = Pressure × Area.",
          explanation: `Force = Pressure × Area = ${pressurePa}Pa × ${fmtArea(rec.area)}m² = ${forceN}N.`,
        };
      }

      return {
        kind: "fill-blank",
        prompt: `A force of ${forceN}N acting on a flat surface produces a pressure of ${pressurePa}Pa. What is the area of the surface, in m²?`,
        before: "Area =",
        after: "m²",
        correctAnswer: fmtArea(rec.area),
        acceptedAnswers: [String(rec.area)],
        inputMode: "numeric",
        hint: "Pressure = Force ÷ Area, so Area = Force ÷ Pressure.",
        explanation: `Area = Force ÷ Pressure = ${forceN}N ÷ ${pressurePa}Pa = ${fmtArea(rec.area)}m².`,
      };
    }

    if (branch === "compare") {
      const pairs = [
        { lowArea: "a woman wearing narrow stiletto heels", highArea: "a woman wearing flat, wide-soled shoes", sameForce: "the same body weight" },
        { lowArea: "a sharpened pencil point", highArea: "a blunt, flat-ended stick", sameForce: "the same pushing force" },
        { lowArea: "a thin wire", highArea: "a wide, flat rope", sameForce: "the same pulling force" },
        { lowArea: "a narrow-bladed axe", highArea: "a wide, flat mallet", sameForce: "the same swinging force" },
      ] as const;
      const p = randChoice(rng, pairs);
      const askWhich = randChoice(rng, ["more", "less"] as const);
      const correct = askWhich === "more" ? p.lowArea : p.highArea;
      const choices = shuffle(rng, [p.lowArea, p.highArea]);
      return {
        kind: "multiple-choice",
        prompt: `Given ${p.sameForce}, applied through a much smaller contact area for one and a much larger contact area for the other, which of these exerts ${askWhich} pressure: ${p.lowArea}, or ${p.highArea}?`,
        choices,
        correctIndex: choices.indexOf(correct),
        hint: "For the same force, a smaller contact area always produces greater pressure — pressure and area are inversely related.",
        explanation: `For the same force, a smaller area produces higher pressure. Since ${p.lowArea} has the smaller contact area, it exerts the ${askWhich === "more" ? "greater" : "lesser"} pressure.`,
      };
    }

    if (branch === "applications") {
      const chosen = shuffle(rng, [...APPLICATIONS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.thing, label: a.thing })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.thing, label: a.reason })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.thing] = a.thing;
      return {
        kind: "click-match",
        prompt: "Match each application to the reason it works, based on pressure.",
        tokens,
        targets,
        correctMap,
        hint: "Think about whether each example is increasing pressure (small area) or decreasing pressure (large area), or using how liquid pressure behaves.",
        explanation: chosen.map((a) => `${a.thing}: ${a.reason}.`).join(" "),
      };
    }

    // liquid-facts
    const chosen = shuffle(rng, LIQUID_FACTS).slice(0, 5);
    const buckets = Array.from(new Set(chosen.map((f) => f.bucket))).map((b) => ({
      id: b,
      label: b === "liquid" ? "True only for liquids" : b === "solid" ? "True only for solids" : "True for both solids and liquids",
    }));
    const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.bucket));
    return {
      kind: "categorize",
      prompt: "Sort each statement about pressure into the correct group.",
      items,
      buckets,
      correctBucket,
      hint: "Liquids exert pressure that increases with depth and acts in all directions; solids only push on the surface they rest on.",
      explanation: chosen.map((f) => `"${f.text}" applies to: ${buckets.find((b) => b.id === f.bucket)!.label.toLowerCase()}.`).join(" "),
    };
  },
};
