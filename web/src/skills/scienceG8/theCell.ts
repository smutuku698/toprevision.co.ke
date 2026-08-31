import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

interface CellSpot {
  id: string;
  label: string;
  xPercent: number;
  yPercent: number;
}

const PLANT_SPOTS: CellSpot[] = [
  { id: "wall", label: "Cell wall", xPercent: 50, yPercent: 7.5 },
  { id: "membrane", label: "Cell membrane", xPercent: 50, yPercent: 13.75 },
  { id: "nucleus", label: "Nucleus", xPercent: 40.9, yPercent: 50 },
  { id: "chloroplast", label: "Chloroplast", xPercent: 68.2, yPercent: 31.25 },
  { id: "cytoplasm", label: "Cytoplasm", xPercent: 77.3, yPercent: 81.25 },
];

const ANIMAL_SPOTS: CellSpot[] = [
  { id: "membrane", label: "Cell membrane", xPercent: 50, yPercent: 6.25 },
  { id: "nucleus", label: "Nucleus", xPercent: 43.2, yPercent: 50 },
  { id: "cytoplasm", label: "Cytoplasm", xPercent: 22.7, yPercent: 81.25 },
];

const FUNCTIONS: Record<string, string> = {
  wall: "Provides a rigid outer layer that supports and protects the plant cell",
  membrane: "Controls the movement of substances into and out of the cell",
  nucleus: "Controls the cell's activities and contains the genetic material",
  cytoplasm: "A jelly-like substance where many of the cell's chemical reactions take place",
  chloroplast: "Contains chlorophyll and traps light energy for photosynthesis",
  vacuole: "Stores cell sap (water, salts and sugars) and helps keep the cell firm",
};

const PLANT_ONLY_DECOYS = ["Chloroplast", "Vacuole"];
const ANIMAL_DECOYS = ["Cell wall", "Chloroplast", "Vacuole"];

const STRUCTURE_ITEMS = [
  { label: "Cell wall", bucket: "plant" },
  { label: "Chloroplast", bucket: "plant" },
  { label: "Large permanent vacuole (stores cell sap)", bucket: "plant" },
  { label: "Nucleus", bucket: "both" },
  { label: "Cytoplasm", bucket: "both" },
  { label: "Cell membrane", bucket: "both" },
] as const;

// {actualUm, magnification, drawnMm} — constructed so drawnMm = actualUm*magnification/1000 is always a whole number.
const MAGNIFICATION_RECORDS = [
  { actual: 20, mag: 50, drawn: 1 },
  { actual: 25, mag: 40, drawn: 1 },
  { actual: 20, mag: 100, drawn: 2 },
  { actual: 30, mag: 100, drawn: 3 },
  { actual: 40, mag: 100, drawn: 4 },
  { actual: 60, mag: 100, drawn: 6 },
  { actual: 80, mag: 100, drawn: 8 },
  { actual: 15, mag: 200, drawn: 3 },
  { actual: 20, mag: 200, drawn: 4 },
  { actual: 25, mag: 200, drawn: 5 },
  { actual: 30, mag: 200, drawn: 6 },
  { actual: 40, mag: 200, drawn: 8 },
  { actual: 15, mag: 400, drawn: 6 },
  { actual: 20, mag: 400, drawn: 8 },
  { actual: 25, mag: 400, drawn: 10 },
  { actual: 30, mag: 400, drawn: 12 },
  { actual: 50, mag: 400, drawn: 20 },
  { actual: 20, mag: 1000, drawn: 20 },
  { actual: 40, mag: 1000, drawn: 40 },
] as const;

export const theCell: Skill = {
  id: "g8-sci-lte-the-cell",
  code: "LTE.1",
  subjectId: "science",
  strandId: "g8-sci-lte",
  grade: 8,
  title: "The cell",
  description: "Structure and functions of plant and animal cells under a light microscope, comparing the two, and calculating magnification.",
  generate(rng) {
    const branch = randChoice(rng, ["hotspot", "compare", "function", "magnification"] as const);

    if (branch === "hotspot") {
      const cellType = randChoice(rng, ["plant", "animal"] as const);
      const spots = cellType === "plant" ? PLANT_SPOTS : ANIMAL_SPOTS;
      const decoys = cellType === "plant" ? PLANT_ONLY_DECOYS : ANIMAL_DECOYS;
      const target = randChoice(rng, spots);
      const otherLabels = spots.filter((s) => s.id !== target.id).map((s) => s.label);
      const usableDecoys = decoys.filter((d) => !otherLabels.includes(d) && d !== target.label);
      const choices = shuffle(rng, [target.label, ...shuffle(rng, [...otherLabels, ...usableDecoys]).slice(0, 3)]);
      return {
        kind: "hotspot",
        prompt: `Click the pin, then select the name of the labelled part of this ${cellType} cell.`,
        diagram: { type: cellType === "plant" ? "plant-cell" : "animal-cell" },
        spots: spots.map(({ id, xPercent, yPercent, label }) => ({ id, xPercent, yPercent, label })),
        askId: target.id,
        choices,
        correctLabel: target.label,
        hint: cellType === "plant" ? "Plant cells have a rigid cell wall and chloroplasts that animal cells lack." : "Animal cells have no cell wall, no chloroplasts, and no large permanent vacuole.",
        explanation: `${target.label}: ${FUNCTIONS[target.id]}.`,
      };
    }

    if (branch === "compare") {
      const chosen = shuffle(rng, STRUCTURE_ITEMS).slice(0, 5);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each structure into 'found in plant cells only' or 'found in both plant and animal cells'.",
        items,
        buckets: [
          { id: "plant", label: "Plant cells only" },
          { id: "both", label: "Both plant and animal cells" },
        ],
        correctBucket,
        hint: "Animal cells lack a cell wall, chloroplasts, and a large permanent vacuole — but all cells have a nucleus, cytoplasm, and cell membrane.",
        explanation: chosen
          .map((c) => `${c.label} is found ${c.bucket === "plant" ? "only in plant cells" : "in both plant and animal cells"}.`)
          .join(" "),
      };
    }

    if (branch === "function") {
      const partIds = Object.keys(FUNCTIONS);
      const partId = randChoice(rng, partIds);
      const label = partId === "wall" ? "Cell wall" : partId === "membrane" ? "Cell membrane" : partId.charAt(0).toUpperCase() + partId.slice(1);
      const direction = randChoice(rng, ["forward", "reverse"] as const);
      if (direction === "forward") {
        const others = partIds.filter((p) => p !== partId).map((p) => FUNCTIONS[p]);
        const { choices, correctIndex } = buildChoicesFromStrings(rng, FUNCTIONS[partId], others, 3);
        return {
          kind: "multiple-choice",
          prompt: `What is the function of the ${label.toLowerCase()}?`,
          choices,
          correctIndex,
          hint: "Think about what this structure does for the cell.",
          explanation: `${label}: ${FUNCTIONS[partId]}.`,
        };
      }
      const otherLabels = partIds.filter((p) => p !== partId).map((p) => (p === "wall" ? "Cell wall" : p === "membrane" ? "Cell membrane" : p.charAt(0).toUpperCase() + p.slice(1)));
      const { choices, correctIndex } = buildChoicesFromStrings(rng, label, otherLabels, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which cell part "${FUNCTIONS[partId].toLowerCase()}"?`,
        choices,
        correctIndex,
        hint: "Match the description back to the structure responsible for it.",
        explanation: `${label}: ${FUNCTIONS[partId]}.`,
      };
    }

    // magnification: M = drawn size / actual size
    const rec = randChoice(rng, MAGNIFICATION_RECORDS);
    const unknown = randChoice(rng, ["drawn", "actual", "mag"] as const);
    if (unknown === "drawn") {
      return {
        kind: "fill-blank",
        prompt: `A student observes a cell under a microscope at a magnification of ×${rec.mag}. The actual width of the cell is ${rec.actual} micrometres (μm). What is the width of the drawn diagram, in millimetres (mm)?`,
        before: "Drawn width =",
        after: "mm",
        correctAnswer: String(rec.drawn),
        inputMode: "numeric",
        hint: "Magnification = drawn size ÷ actual size, so drawn size = magnification × actual size. Remember 1mm = 1000μm.",
        explanation: `Drawn size = magnification × actual size = ${rec.mag} × ${rec.actual}μm = ${rec.mag * rec.actual}μm = ${rec.drawn}mm (dividing by 1000 to convert μm to mm).`,
      };
    }
    if (unknown === "actual") {
      return {
        kind: "fill-blank",
        prompt: `A diagram of a cell is drawn ${rec.drawn}mm wide, at a magnification of ×${rec.mag}. What is the actual width of the cell, in micrometres (μm)?`,
        before: "Actual width =",
        after: "μm",
        correctAnswer: String(rec.actual),
        inputMode: "numeric",
        hint: "Actual size = drawn size ÷ magnification. Convert your answer from mm to μm by multiplying by 1000.",
        explanation: `Actual size = drawn size ÷ magnification = ${rec.drawn}mm ÷ ${rec.mag} = ${rec.drawn / rec.mag}mm = ${rec.actual}μm (multiplying by 1000 to convert mm to μm).`,
      };
    }
    return {
      kind: "fill-blank",
      prompt: `A cell diagram is drawn ${rec.drawn}mm wide. If the actual cell is ${rec.actual} micrometres (μm) wide, what magnification was used?`,
      before: "Magnification = ×",
      after: "",
      correctAnswer: String(rec.mag),
      inputMode: "numeric",
      hint: "Magnification = drawn size ÷ actual size. Both sizes must be in the same unit before dividing — convert the drawn size from mm to μm.",
      explanation: `Drawn size in μm = ${rec.drawn}mm × 1000 = ${rec.drawn * 1000}μm. Magnification = ${rec.drawn * 1000}μm ÷ ${rec.actual}μm = ×${rec.mag}.`,
    };
  },
};
