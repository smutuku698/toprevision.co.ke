import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const MATERIALS = [
  { id: "pottery", label: "Pottery", use: "Making storage containers such as pots, jars, and vases" },
  { id: "utensils", label: "Ceramic utensils", use: "Cooking and serving food, such as clay cooking pots and ceramic plates" },
  { id: "glass", label: "Glass", use: "Making windows, bottles, and laboratory equipment" },
  { id: "shells", label: "Shells", use: "Making buttons, decorative items, and lime for building" },
] as const;

const PROPERTIES = [
  { id: "brittleness", label: "Brittleness", definition: "The tendency to crack or shatter under a sudden stress or impact, rather than bend" },
  { id: "fire-resistance", label: "Fire resistance", definition: "The ability to withstand direct flame or extreme heat without burning or melting" },
  { id: "heat-resistance", label: "Heat resistance", definition: "The ability to withstand high temperatures without losing shape or strength" },
  { id: "water-resistance", label: "Water resistance", definition: "The ability to resist absorbing or being damaged by water" },
  { id: "corrosion-resistance", label: "Corrosion resistance", definition: "The ability to resist being chemically worn away, e.g. by acids or weather" },
] as const;

const COMPARISON_ITEMS = [
  { text: "Shatters into pieces when dropped on a hard floor, rather than bending", bucket: "ceramic" },
  { text: "Can be melted and cast into a completely new shape, then cooled hard again", bucket: "ceramic" },
  { text: "Does not rust or corrode when left out in the rain", bucket: "ceramic" },
  { text: "Bends or dents under a hammer blow instead of shattering", bucket: "metal" },
  { text: "Can be drawn out into a long, thin wire without breaking", bucket: "metal" },
  { text: "Conducts electricity well, unlike most ceramic materials", bucket: "metal" },
] as const;

const COMPARISON_LABEL: Record<string, string> = { ceramic: "Typical of ceramic materials", metal: "Typical of metals, not ceramics" };

export const ceramicMaterials: Skill = {
  id: "g8-pt-m-ceramic-materials",
  code: "M.2",
  subjectId: "pre-technical",
  strandId: "g8-pt-materials",
  grade: 8,
  title: "Ceramic Materials",
  description: "Common ceramic materials in the locality, their physical properties, and how they are used in a work environment.",
  generate(rng) {
    const branch = randChoice(rng, ["use-match", "property-recall", "furnace-scenario", "identify", "comparison-sort"] as const);

    if (branch === "use-match") {
      const tokens = shuffle(rng, MATERIALS.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, MATERIALS.map((m) => ({ id: m.id, label: m.use })));
      const correctMap: Record<string, string> = {};
      for (const m of MATERIALS) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: "Match each ceramic material to how it is used in a work environment.",
        tokens,
        targets,
        correctMap,
        hint: "Each material's shape and hardness suit it to a particular job.",
        explanation: MATERIALS.map((m) => `${m.label}: ${m.use}.`).join(" "),
      };
    }

    if (branch === "property-recall") {
      const p = randChoice(rng, PROPERTIES);
      return {
        kind: "fill-blank",
        prompt: `A physical property is defined as: "${p.definition}."`,
        before: "This property is called",
        after: ".",
        correctAnswer: p.label,
        acceptedAnswers: [p.id.replace("-", " ")],
        inputMode: "text",
        hint: "Think about what specifically the material is resisting, or how it breaks.",
        explanation: `${p.label}: ${p.definition}.`,
      };
    }

    if (branch === "furnace-scenario") {
      const others = PROPERTIES.filter((p) => p.id !== "fire-resistance" && p.id !== "heat-resistance").map((p) => p.label);
      const correct = randChoice(rng, ["Fire resistance", "Heat resistance"] as const);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "Which property makes ceramic materials suitable for lining the inside of a furnace or kiln?",
        choices,
        correctIndex,
        hint: "Furnaces and kilns reach extremely high temperatures.",
        explanation: `${correct} allows ceramic materials to withstand the extreme heat inside a furnace or kiln without being damaged.`,
      };
    }

    if (branch === "identify") {
      const m = randChoice(rng, MATERIALS);
      const others = MATERIALS.filter((x) => x.id !== m.id).map((x) => x.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, m.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which ceramic material is commonly used for: "${m.use.toLowerCase()}"?`,
        choices,
        correctIndex,
        hint: "Think about which ceramic material best fits this particular use.",
        explanation: `${m.label} is used for ${m.use.toLowerCase()}.`,
      };
    }

    // comparison-sort
    const chosen = shuffle(rng, COMPARISON_ITEMS).slice(0, randInt(rng, 5, 6));
    const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: COMPARISON_LABEL[b] }));
    const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
    return {
      kind: "categorize",
      prompt: "Sort each behaviour into whether it is typical of ceramic materials, or typical of metals instead.",
      items,
      buckets,
      correctBucket,
      hint: "Ceramics are hard but brittle and don't conduct electricity; metals bend, stretch, and conduct well.",
      explanation: chosen.map((c) => `"${c.text}" — ${COMPARISON_LABEL[c.bucket].toLowerCase()}.`).join(" "),
    };
  },
};
