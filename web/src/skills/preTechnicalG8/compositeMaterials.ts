import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const MATERIALS = [
  { id: "concrete", label: "Concrete", composition: "Cement, sand, aggregate (stones), and water mixed and left to set hard", use: "Building foundations, floors, and structural columns" },
  { id: "bricks", label: "Bricks", composition: "Clay moulded into blocks and fired in a kiln until hard", use: "Building walls for houses and other structures" },
  { id: "boards", label: "Manufactured boards (e.g. plywood)", composition: "Thin layers of wood veneer glued together under pressure", use: "Making furniture, cupboards, and formwork for construction" },
  { id: "stone", label: "Stone", composition: "Natural rock cut or dressed into blocks, sometimes combined with mortar", use: "Building walls, foundations, and paving" },
  { id: "papier-mache", label: "Paper-mache", composition: "Paper strips soaked in glue or paste, layered and moulded, then dried hard", use: "Making craft models, masks, and decorative items" },
  { id: "coated-paper", label: "Plastic-coated paper", composition: "A sheet of paper layered with a thin film of plastic", use: "Making waterproof packaging, labels, and food wrappers" },
] as const;

const CATEGORY_ITEMS = [
  { text: "Plywood used to build a cupboard door", bucket: "composite" },
  { text: "Concrete poured for a house foundation", bucket: "composite" },
  { text: "Paper-mache moulded into a craft mask", bucket: "composite" },
  { text: "A plain wooden plank cut straight from a log", bucket: "not-composite" },
  { text: "A single sheet of window glass", bucket: "not-composite" },
  { text: "Raw natural rubber before any processing", bucket: "not-composite" },
] as const;

const CATEGORY_LABEL: Record<string, string> = { composite: "A composite material (made of two or more combined materials)", "not-composite": "Not a composite material (a single, unprocessed material)" };

export const compositeMaterials: Skill = {
  id: "g8-pt-m-composite-materials",
  code: "M.1",
  subjectId: "pre-technical",
  strandId: "g8-pt-materials",
  grade: 8,
  title: "Composite Materials",
  description: "Identifying composite materials in the locality, their composition, and how they are used in a work environment.",
  generate(rng) {
    const branch = randChoice(rng, ["composition-match", "use-match", "identify", "composite-sort"] as const);

    if (branch === "composition-match") {
      const chosen = shuffle(rng, [...MATERIALS]).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.composition })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: "Match each composite material to what it is made from.",
        tokens,
        targets,
        correctMap,
        hint: "A composite material is formed by combining two or more different materials.",
        explanation: chosen.map((m) => `${m.label}: ${m.composition}.`).join(" "),
      };
    }

    if (branch === "use-match") {
      const m = randChoice(rng, MATERIALS);
      const others = MATERIALS.filter((x) => x.id !== m.id).map((x) => x.use);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, m.use, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `What is ${m.label.toLowerCase()} typically used for in a work environment?`,
        choices,
        correctIndex,
        hint: "Think about the properties this composite material has and where they would be most useful.",
        explanation: `${m.label} is used for ${m.use.toLowerCase()}.`,
      };
    }

    if (branch === "identify") {
      const m = randChoice(rng, MATERIALS);
      return {
        kind: "fill-blank",
        prompt: `A composite material is made from: "${m.composition.toLowerCase()}."`,
        before: "This material is called",
        after: ".",
        correctAnswer: m.label,
        acceptedAnswers: [m.id, m.label.split(" (")[0]],
        inputMode: "text",
        hint: "Think about which two or more materials are being combined in this description.",
        explanation: `${m.label}: ${m.composition}.`,
      };
    }

    // composite-sort
    const chosen = shuffle(rng, CATEGORY_ITEMS).slice(0, randInt(rng, 5, 6));
    const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: CATEGORY_LABEL[b] }));
    const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
    return {
      kind: "categorize",
      prompt: "Sort each item into whether it is a composite material, or not.",
      items,
      buckets,
      correctBucket,
      hint: "A composite material combines two or more materials; a plain, single, unprocessed material does not.",
      explanation: chosen.map((c) => `"${c.text}" — ${CATEGORY_LABEL[c.bucket].toLowerCase()}.`).join(" "),
    };
  },
};
