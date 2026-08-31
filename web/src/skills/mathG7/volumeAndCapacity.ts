import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

export const volumeAndCapacity: Skill = {
  id: "g7-math-m-volume-capacity",
  code: "M.4",
  subjectId: "math",
  strandId: "g7-math-measurements",
  grade: 7,
  title: "Volume and capacity",
  description: "Identify the metre cube as a unit of volume, convert between m³ and cm³, find the volume of cubes, cuboids, and cylinders, relate cm³/m³ to litres, and find the capacity of containers.",
  generate(rng) {
    const branch = randChoice(rng, ["cuboid-volume", "cylinder-volume", "convert-units", "litres-capacity", "identify-base", "sort-by-volume"] as const);

    if (branch === "cuboid-volume") {
      const l = randInt(rng, 3, 20);
      const w = randInt(rng, 3, 20);
      const h = randInt(rng, 3, 20);
      const volume = l * w * h;
      const askReverse = rng() < 0.3;
      if (!askReverse) {
        return {
          kind: "fill-blank",
          prompt: `A water storage tank shaped like a cuboid has length ${l} m, width ${w} m, and height ${h} m. Find its volume.`,
          visual: { type: "solid", shape: "cuboid", length: l, width: w, height: h },
          before: "Volume =",
          after: "m³",
          correctAnswer: String(volume),
          inputMode: "numeric",
          hint: "Volume of a cuboid = length × width × height.",
          explanation: `Volume $= ${l} \\times ${w} \\times ${h} = ${volume}$ m³.`,
        };
      }
      const wrong = [String(h + 2), String(h - 1), String(Math.round(volume / (l * w) + 3))];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(h), wrong);
      return {
        kind: "multiple-choice",
        prompt: `A cuboid tank has length ${l} m, width ${w} m, and volume ${volume} m³. Find its height.`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Rearrange: height = volume ÷ (length × width).",
        explanation: `height $= ${volume} \\div (${l} \\times ${w}) = ${volume} \\div ${l * w} = ${h}$ m.`,
      };
    }

    if (branch === "cylinder-volume") {
      const radius = randChoice(rng, [7, 14, 21] as const);
      const height = randInt(rng, 10, 40);
      const volume = Math.round((22 / 7) * radius * radius * height);
      return {
        kind: "fill-blank",
        prompt: `A cylindrical grain silo has radius ${radius} m and height ${height} m. Find its volume. (Use π ≈ 22/7)`,
        visual: { type: "solid", shape: "cylinder", radius, height },
        before: "Volume =",
        after: "m³",
        correctAnswer: String(volume),
        inputMode: "numeric",
        hint: "Volume of a cylinder = π × radius² × height.",
        explanation: `Volume $= \\frac{22}{7} \\times ${radius}^2 \\times ${height} = ${volume}$ m³.`,
      };
    }

    if (branch === "convert-units") {
      const direction = randChoice(rng, ["m3-to-cm3", "cm3-to-m3"] as const);
      if (direction === "m3-to-cm3") {
        const m3 = randInt(rng, 2, 15);
        const cm3 = m3 * 1_000_000;
        return {
          kind: "fill-blank",
          prompt: `Convert ${m3} m³ to cm³ (1 m³ = 1,000,000 cm³).`,
          before: "",
          after: "cm³",
          correctAnswer: String(cm3),
          inputMode: "numeric",
          hint: "Multiply the number of m³ by 1,000,000.",
          explanation: `${m3} m³ × 1,000,000 = ${cm3.toLocaleString()} cm³.`,
        };
      }
      const m3Whole = randInt(rng, 2, 9);
      const cm3 = m3Whole * 1_000_000;
      return {
        kind: "fill-blank",
        prompt: `Convert ${cm3.toLocaleString()} cm³ to m³.`,
        before: "",
        after: "m³",
        correctAnswer: String(m3Whole),
        inputMode: "numeric",
        hint: "Divide the number of cm³ by 1,000,000.",
        explanation: `${cm3.toLocaleString()} cm³ ÷ 1,000,000 = ${m3Whole} m³.`,
      };
    }

    if (branch === "litres-capacity") {
      // 1 litre = 1000 cm³
      const direction = randChoice(rng, ["cm3-to-litres", "litres-to-cm3"] as const);
      if (direction === "cm3-to-litres") {
        const litres = randInt(rng, 2, 40);
        const cm3 = litres * 1000;
        return {
          kind: "fill-blank",
          prompt: `A jerrycan holds ${cm3.toLocaleString()} cm³ of water. What is its capacity in litres? (1 litre = 1000 cm³)`,
          before: "Capacity =",
          after: "litres",
          correctAnswer: String(litres),
          inputMode: "numeric",
          hint: "Divide the volume in cm³ by 1000.",
          explanation: `${cm3.toLocaleString()} cm³ ÷ 1000 = ${litres} litres.`,
        };
      }
      const litres = randInt(rng, 2, 40);
      const cm3 = litres * 1000;
      return {
        kind: "fill-blank",
        prompt: `A container holds ${litres} litres of milk. What is this in cm³? (1 litre = 1000 cm³)`,
        before: "",
        after: "cm³",
        correctAnswer: String(cm3),
        inputMode: "numeric",
        hint: "Multiply the number of litres by 1000.",
        explanation: `${litres} litres × 1000 = ${cm3.toLocaleString()} cm³.`,
      };
    }

    if (branch === "identify-base") {
      const l = randInt(rng, 4, 12);
      const w = randInt(rng, 4, 12);
      const h = randInt(rng, 4, 12);
      const faces = [
        { id: "front", label: `${w}×${h} m` },
        { id: "back", label: `${w}×${h} m` },
        { id: "left", label: `${l}×${h} m` },
        { id: "right", label: `${l}×${h} m` },
        { id: "top", label: `${w}×${l} m` },
        { id: "bottom", label: `${w}×${l} m` },
      ];
      return {
        kind: "solid-rotate",
        shape: "cuboid",
        length: l,
        width: w,
        height: h,
        faces,
        askId: "bottom",
        correctFaceId: "bottom",
        prompt: `This water tank is shaped like a cuboid with volume = base area × height. Rotate it and click the BASE face — the one you multiply by height to find the volume.`,
        hint: "The base is the bottom face — the one the shape stands on.",
        explanation: "The base of a cuboid is its bottom face. Volume = (base area) × height.",
      };
    }

    // sort-by-volume: categorize objects by whether their volume exceeds a benchmark
    const benchmark = randInt(rng, 40, 100);
    const objects = [
      { name: "a classroom water tank", volume: randInt(rng, 20, 60) },
      { name: "a school swimming pool", volume: randInt(rng, 90, 400) },
      { name: "a cattle trough", volume: randInt(rng, 5, 30) },
      { name: "a grain storage silo", volume: randInt(rng, 90, 300) },
      { name: "a rainwater drum", volume: randInt(rng, 5, 30) },
      { name: "an irrigation reservoir", volume: randInt(rng, 90, 400) },
    ];
    const chosen = shuffle(rng, objects).slice(0, 5);
    const items = chosen.map((o, i) => ({ id: `o${i}`, label: `${o.name} (${o.volume} m³)` }));
    const buckets = [
      { id: "over", label: `More than ${benchmark} m³` },
      { id: "under", label: `${benchmark} m³ or less` },
    ];
    const correctBucket: Record<string, string> = {};
    chosen.forEach((o, i) => (correctBucket[`o${i}`] = o.volume > benchmark ? "over" : "under"));
    return {
      kind: "categorize",
      prompt: `Sort each container by whether its volume is more than ${benchmark} m³.`,
      items,
      buckets,
      correctBucket,
      hint: "Compare each stated volume directly to the benchmark.",
      explanation: chosen.map((o) => `${o.name}: ${o.volume} m³ is ${o.volume > benchmark ? "more than" : "not more than"} ${benchmark} m³`).join("; ") + ".",
    };
  },
};
