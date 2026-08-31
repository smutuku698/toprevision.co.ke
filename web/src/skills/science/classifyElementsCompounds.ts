import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ELEMENTS = [
  { name: "Oxygen", reason: "Oxygen is an element — a pure substance made of only one type of atom." },
  { name: "Iron", reason: "Iron is an element — a pure substance made of only one type of atom." },
  { name: "Copper", reason: "Copper is an element — a pure substance made of only one type of atom." },
  { name: "Sodium", reason: "Sodium is an element — a pure substance made of only one type of atom." },
  { name: "Carbon", reason: "Carbon is an element — a pure substance made of only one type of atom." },
  { name: "Zinc", reason: "Zinc is an element — a pure substance made of only one type of atom." },
  { name: "Nitrogen", reason: "Nitrogen is an element — a pure substance made of only one type of atom." },
];

const COMPOUNDS = [
  { name: "Water", reason: "Water (H₂O) is a compound — hydrogen and oxygen chemically joined." },
  { name: "Carbon dioxide", reason: "Carbon dioxide (CO₂) is a compound — carbon and oxygen chemically joined." },
  { name: "Salt (sodium chloride)", reason: "Salt (NaCl) is a compound — sodium and chlorine chemically joined." },
  { name: "Sugar", reason: "Sugar is a compound — carbon, hydrogen and oxygen chemically joined." },
  { name: "Ammonia", reason: "Ammonia (NH₃) is a compound — nitrogen and hydrogen chemically joined." },
  { name: "Calcium carbonate", reason: "Calcium carbonate (CaCO₃) is a compound — calcium, carbon and oxygen chemically joined." },
];

const MIXTURES = [
  { name: "Air", reason: "Air is a mixture — its gases are not chemically bonded together." },
  { name: "Salt water", reason: "Salt water is a mixture — salt is dissolved in water but not chemically bonded to it." },
  { name: "Brass", reason: "Brass is a mixture (an alloy) — copper and zinc mixed together, not chemically bonded." },
  { name: "Soil", reason: "Soil is a mixture — minerals, organic matter, water and air all mixed together." },
  { name: "Sea water", reason: "Sea water is a mixture — dissolved salts and water are not chemically bonded." },
];

const FORMULAS: { name: string; formula: string }[] = [
  { name: "Water", formula: "H2O" },
  { name: "Carbon dioxide", formula: "CO2" },
  { name: "Salt (sodium chloride)", formula: "NaCl" },
  { name: "Ammonia", formula: "NH3" },
  { name: "Calcium carbonate", formula: "CaCO3" },
];

const COMPOSITION_ORDER = [
  { id: "element", label: "A pure element — only one type of atom" },
  { id: "compound", label: "A pure compound — two or more types of atom chemically joined in a fixed ratio" },
  { id: "mixture", label: "A mixture — different substances physically combined, in no fixed ratio" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A pure substance made of only one type of atom is called an ", after: ".", correctAnswer: "element", accepted: ["element"], explanation: "An element is a pure substance made of only one type of atom." },
  { before: "Two or more elements chemically joined in a fixed ratio form a ", after: ".", correctAnswer: "compound", accepted: ["compound"], explanation: "A compound is formed when two or more elements are chemically joined together in a fixed ratio." },
  { before: "Two or more substances physically combined, without any chemical bond, form a ", after: ".", correctAnswer: "mixture", accepted: ["mixture"], explanation: "A mixture is formed when substances are physically combined without any chemical bond between them." },
  { before: "The link that holds atoms together in a compound is called a chemical ", after: ".", correctAnswer: "bond", accepted: ["bond"], explanation: "A chemical bond is the link that holds atoms together within a compound." },
  { before: "A mixture of two or more metals, such as brass, is called an ", after: ".", correctAnswer: "alloy", accepted: ["alloy"], explanation: "An alloy is a mixture of two or more metals, such as brass (copper and zinc)." },
] as const;

export const classifyElementsCompounds: Skill = {
  id: "sci-mfm-classify-elements-compounds",
  code: "MFM.2",
  subjectId: "science",
  strandId: "sci-extra-practice",
  grade: 9,
  title: "Elements and compounds",
  description: "Sort substances into elements, compounds, and mixtures.",
  generate(rng) {
    const hint = "An element has one type of atom, a compound has different atoms chemically joined, and a mixture combines substances without any chemical bond.";
    const branch = randChoice(rng, ["mc", "categorize", "match", "fill-blank", "order"] as const);

    if (branch === "match") {
      const pool = [...ELEMENTS, ...COMPOUNDS, ...MIXTURES];
      const chosen = shuffle(rng, pool).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.name, label: c.reason })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.name] = c.name;
      return {
        kind: "click-match",
        prompt: "Match each substance to why it is classified that way.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((c) => c.reason).join(" "),
      };
    }

    if (branch === "fill-blank") {
      if (rng() < 0.5) {
        const f = randChoice(rng, FORMULAS);
        return {
          kind: "fill-blank",
          prompt: `Complete the sentence: the chemical formula for ${f.name.toLowerCase()} is ___.`,
          before: "",
          after: "",
          correctAnswer: f.formula,
          acceptedAnswers: [f.formula.toLowerCase()],
          inputMode: "text",
          hint: "Think about which elements make up this compound, and how many atoms of each.",
          explanation: `${f.name} has the chemical formula ${f.formula}.`,
        };
      }
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about elements, compounds, and mixtures.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint,
        explanation: fb.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, COMPOSITION_ORDER.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange these types of substance from the simplest, most fixed composition to the most variable composition.",
        instruction: "Drag to reorder from simplest to most variable composition.",
        items,
        correctOrder: COMPOSITION_ORDER.map((s) => s.id),
        hint: "An element has just one type of atom; a compound has a fixed ratio of atoms; a mixture can vary in its proportions.",
        explanation: COMPOSITION_ORDER.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const pool = [
        ...ELEMENTS.map((e) => ({ name: e.name, reason: e.reason, bucket: "Element" })),
        ...COMPOUNDS.map((c) => ({ name: c.name, reason: c.reason, bucket: "Compound" })),
        ...MIXTURES.map((m) => ({ name: m.name, reason: m.reason, bucket: "Mixture" })),
      ];
      const target = randChoice(rng, pool);
      const otherBuckets = ["Element", "Compound", "Mixture"].filter((b) => b !== target.bucket);
      const choices = shuffle(rng, [target.bucket, ...otherBuckets]);

      return {
        kind: "multiple-choice",
        prompt: `Is ${target.name} an element, a compound, or a mixture?`,
        choices,
        correctIndex: choices.indexOf(target.bucket),
        layout: "grid",
        hint,
        explanation: target.reason,
      };
    }

    const elements = shuffle(rng, ELEMENTS).slice(0, 2);
    const compounds = shuffle(rng, COMPOUNDS).slice(0, 2);
    const mixtures = shuffle(rng, MIXTURES).slice(0, 2);
    const items = shuffle(rng, [
      ...elements.map((e) => ({ id: e.name, label: e.name, bucket: "element", reason: e.reason })),
      ...compounds.map((c) => ({ id: c.name, label: c.name, bucket: "compound", reason: c.reason })),
      ...mixtures.map((m) => ({ id: m.name, label: m.name, bucket: "mixture", reason: m.reason })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each substance into the correct group.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "element", label: "Element" },
        { id: "compound", label: "Compound" },
        { id: "mixture", label: "Mixture" },
      ],
      correctBucket,
      hint,
      explanation: items.map((item) => item.reason).join(" "),
    };
  },
};
