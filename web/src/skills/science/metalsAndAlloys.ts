import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ALLOYS: { name: string; composition: string }[] = [
  { name: "Steel", composition: "Iron and carbon" },
  { name: "Stainless steel", composition: "Iron, chromium, and nickel" },
  { name: "Bronze", composition: "Copper and tin" },
  { name: "Brass", composition: "Copper and zinc" },
  { name: "Duralumin", composition: "Aluminium, copper, magnesium, and manganese" },
];

const USES: { name: string; use: string; reason: "lightweight" | "conductivity" | "strength" | "corrosion-resistant" | "other" }[] = [
  { name: "Aluminium", use: "aircraft bodies and kitchen utensils", reason: "lightweight" },
  { name: "Magnesium", use: "lightweight alloys and flash photography/fireworks", reason: "lightweight" },
  { name: "Duralumin", use: "aircraft bodies and bicycle frames", reason: "lightweight" },
  { name: "Copper", use: "electrical wiring and water pipes", reason: "conductivity" },
  { name: "Silver", use: "electrical contacts and fine jewellery", reason: "conductivity" },
  { name: "Iron", use: "construction beams and machinery", reason: "strength" },
  { name: "Steel", use: "construction, vehicle bodies, and tools", reason: "strength" },
  { name: "Gold", use: "jewellery and electronic connectors", reason: "corrosion-resistant" },
  { name: "Bronze", use: "statues, medals, and ship propellers", reason: "corrosion-resistant" },
  { name: "Stainless steel", use: "kitchen sinks, cutlery, and surgical instruments", reason: "corrosion-resistant" },
  { name: "Brass", use: "musical instruments and door fittings", reason: "corrosion-resistant" },
  { name: "Sodium", use: "street lighting (sodium vapour lamps) and soap-making", reason: "other" },
];

const REASON_LABEL: Record<string, string> = {
  lightweight: "Chosen mainly for being lightweight",
  conductivity: "Chosen mainly for good electrical conductivity",
  strength: "Chosen mainly for strength and hardness",
  "corrosion-resistant": "Chosen mainly for resisting corrosion or tarnishing",
};

const FILL_BLANK_TEMPLATES = [
  { before: "A mixture of a metal with one or more other elements is called an ", after: ".", correctAnswer: "alloy", accepted: ["alloy"], explanation: "An alloy is a mixture of a metal with one or more other elements, giving it improved properties." },
  { before: "The ability of a metal to be hammered or pressed into thin sheets is called ", after: ".", correctAnswer: "malleability", accepted: ["malleability"], explanation: "Malleability is the ability of a metal to be hammered or pressed into thin sheets without breaking." },
  { before: "The ability of a metal to be drawn out into thin wires is called ", after: ".", correctAnswer: "ductility", accepted: ["ductility"], explanation: "Ductility is the ability of a metal to be drawn out into thin wires without breaking." },
  { before: "The reddish-brown coating that forms on iron when exposed to moisture and oxygen is called ", after: ".", correctAnswer: "rust", accepted: ["rust"], explanation: "Rust is the reddish-brown coating (hydrated iron oxide) that forms on iron exposed to moisture and oxygen." },
  { before: "Coating iron with a layer of zinc to prevent rusting is called ", after: ".", correctAnswer: "galvanising", accepted: ["galvanising", "galvanizing"], explanation: "Galvanising coats iron with a protective layer of zinc, which prevents rusting." },
  { before: "A material that allows electricity to flow through it easily is called a good ", after: ".", correctAnswer: "conductor", accepted: ["conductor"], explanation: "A conductor is a material, such as copper or silver, that allows electricity to flow through it easily." },
] as const;

const RUSTING_STEPS = [
  { id: "expose", label: "Iron's surface is exposed to both moisture and oxygen" },
  { id: "react", label: "Iron reacts with the water and oxygen to form hydrated iron oxide (rust)" },
  { id: "flake", label: "The rust flakes off, exposing fresh iron underneath" },
  { id: "repeat", label: "The reaction repeats on the newly exposed iron, gradually weakening the metal" },
] as const;

const QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Which pair of conditions causes iron to rust fastest?",
    choices: ["Moisture and oxygen", "Heat and dryness", "Sunlight only", "Cold and darkness"],
    correctIndex: 0,
    explanation: "Rusting is a reaction between iron, water (moisture), and oxygen in the air — both must be present.",
  },
  {
    prompt: "Which of these is NOT an effective way to prevent rusting?",
    choices: ["Painting the metal surface", "Galvanising with zinc", "Oiling or greasing the surface", "Leaving the metal wet outdoors"],
    correctIndex: 3,
    explanation: "Leaving metal wet and exposed speeds up rusting — painting, galvanising, and oiling all keep moisture and oxygen away from the metal.",
  },
  {
    prompt: "Stainless steel resists rusting mainly because of which added metal?",
    choices: ["Chromium", "Zinc", "Tin", "Lead"],
    correctIndex: 0,
    explanation: "Chromium in stainless steel forms a thin protective oxide layer on the surface, which stops rust from forming.",
  },
  {
    prompt: "Which physical property lets a metal be hammered into thin sheets?",
    choices: ["Malleability", "Ductility", "Density", "Brittleness"],
    correctIndex: 0,
    explanation: "Malleability is the ability of a metal to be hammered or pressed into sheets without breaking.",
  },
  {
    prompt: "Which physical property lets a metal be drawn into thin wires?",
    choices: ["Ductility", "Malleability", "Conductivity", "Hardness"],
    correctIndex: 0,
    explanation: "Ductility is the ability of a metal to be drawn out into thin wires without breaking.",
  },
];

export const metalsAndAlloys: Skill = {
  id: "sci-mec-metals-alloys",
  code: "MEC.2",
  subjectId: "science",
  strandId: "sci-mec",
  grade: 9,
  title: "Metals and alloys",
  description: "Alloy composition, physical properties of metals, and rusting.",
  generate(rng) {
    const branch = randChoice(rng, ["composition", "properties", "uses-match", "uses-categorize", "rust-order", "fill-blank"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about metals and alloys.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe metal properties, alloys, and rusting.",
        explanation: fb.explanation,
      };
    }

    if (branch === "uses-match") {
      const chosen = shuffle(rng, USES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((u) => ({ id: u.name, label: u.name })));
      const targets = shuffle(rng, chosen.map((u) => ({ id: u.name, label: `Used for ${u.use}` })));
      const correctMap: Record<string, string> = {};
      for (const u of chosen) correctMap[u.name] = u.name;
      return {
        kind: "click-match",
        prompt: "Match each metal or alloy to its everyday use.",
        tokens,
        targets,
        correctMap,
        hint: "Think about which physical property (strength, conductivity, lightness, or resistance to corrosion) makes each metal suited to that use.",
        explanation: chosen.map((u) => `${u.name} is used for ${u.use}.`).join(" "),
      };
    }

    if (branch === "uses-categorize") {
      const pool = USES.filter((u) => u.reason !== "other");
      const chosen = shuffle(rng, pool).slice(0, 6);
      const items = chosen.map((u, i) => ({ id: `u${i}`, label: `${u.name} (used for ${u.use})` }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((u, i) => (correctBucket[`u${i}`] = u.reason));
      const buckets = Array.from(new Set(chosen.map((u) => u.reason))).map((r) => ({ id: r, label: REASON_LABEL[r] }));
      return {
        kind: "categorize",
        prompt: "Sort each metal or alloy by the main physical property that makes it suited to its use.",
        items,
        buckets,
        correctBucket,
        hint: "Match the use to the property: wiring needs conductivity, aircraft parts need to be lightweight, tools need strength, and cutlery/sinks need corrosion resistance.",
        explanation: chosen.map((u) => `${u.name} — ${REASON_LABEL[u.reason].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "rust-order") {
      const items = shuffle(rng, RUSTING_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the stages of how iron rusts, in a sensible order.",
        instruction: "Drag to reorder from the first stage to the last stage.",
        items,
        correctOrder: RUSTING_STEPS.map((s) => s.id),
        hint: "Rusting needs both moisture and oxygen present before it can begin, and it repeats on newly exposed iron.",
        explanation: RUSTING_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "composition") {
      const chosen = shuffle(rng, ALLOYS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.name, label: a.name })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.name, label: a.composition })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.name] = a.name;

      return {
        kind: "click-match",
        prompt: "Match each alloy to what it is made from.",
        tokens,
        targets,
        correctMap,
        hint: "An alloy is a mixture of a metal with one or more other elements.",
        explanation: chosen.map((a) => `${a.name} is made from ${a.composition.toLowerCase()}.`).join(" "),
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about what causes rusting, what prevents it, and the difference between malleability and ductility.",
      explanation: q.explanation,
    };
  },
};
