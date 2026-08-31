import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ELEMENTS = [
  { name: "Oxygen", symbol: "O" },
  { name: "Carbon", symbol: "C" },
  { name: "Hydrogen", symbol: "H" },
  { name: "Nitrogen", symbol: "N" },
  { name: "Iron", symbol: "Fe" },
  { name: "Aluminium", symbol: "Al" },
  { name: "Copper", symbol: "Cu" },
  { name: "Silver", symbol: "Ag" },
  { name: "Gold", symbol: "Au" },
  { name: "Chlorine", symbol: "Cl" },
  { name: "Sodium", symbol: "Na" },
  { name: "Mercury", symbol: "Hg" },
  { name: "Lead", symbol: "Pb" },
] as const;

const EQUATIONS = [
  { reactants: ["Sodium", "Chlorine"], product: "Sodium chloride" },
  { reactants: ["Hydrogen", "Oxygen"], product: "Water" },
  { reactants: ["Carbon", "Oxygen"], product: "Carbon dioxide" },
  { reactants: ["Copper", "Oxygen"], product: "Copper oxide" },
  { reactants: ["Aluminium", "Oxygen"], product: "Aluminium oxide" },
] as const;

const USES = [
  { element: "Gold", use: "making jewellery and medals, since it does not corrode and has an attractive shine" },
  { element: "Iron", use: "constructing buildings and bridges, since it is strong and can be shaped" },
  { element: "Copper", use: "making electrical wires, since it conducts electricity very well" },
  { element: "Aluminium", use: "making aircraft bodies and cooking utensils, since it is light but strong" },
  { element: "Silver", use: "making jewellery and coins, since it has an attractive shine" },
  { element: "Carbon", use: "forming carbohydrates, an important nutrient found in food" },
] as const;

const CLASSIFY_ITEMS = [
  { text: "The smallest particle of an element that can take part in a chemical reaction", bucket: "atom" },
  { text: "A pure substance made up of only one type of atom, such as iron or oxygen", bucket: "element" },
  { text: "Two or more atoms of the same or different elements chemically joined together", bucket: "molecule" },
  { text: "Two or more different elements chemically combined in a fixed proportion", bucket: "compound" },
  { text: "Oxygen gas (O2), made of two oxygen atoms bonded together", bucket: "molecule" },
  { text: "Water (H2O), formed when hydrogen and oxygen atoms combine chemically", bucket: "compound" },
  { text: "Iron (Fe), made up entirely of iron atoms", bucket: "element" },
  { text: "Table salt (NaCl), formed from sodium and chlorine atoms combined in a fixed ratio", bucket: "compound" },
  { text: "A single carbon atom before it joins with anything else", bucket: "atom" },
] as const;

const BUCKET_LABEL: Record<string, string> = {
  atom: "Atom",
  element: "Element",
  molecule: "Molecule",
  compound: "Compound",
};

export const elementsAndCompounds: Skill = {
  id: "g8-sci-mec-elements-compounds",
  code: "MEC.1",
  subjectId: "science",
  strandId: "g8-sci-mec",
  grade: 8,
  title: "Elements and compounds",
  description: "Atoms, elements, molecules and compounds, element symbols, word equations for reactions, and everyday uses of common elements.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "symbols", "equation", "uses"] as const);

    if (branch === "classify") {
      const chosen = shuffle(rng, CLASSIFY_ITEMS).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each description into atom, element, molecule, or compound.",
        items,
        buckets,
        correctBucket,
        hint: "An atom is the smallest particle; an element has only one type of atom; a molecule is atoms joined together; a compound is two or more different elements chemically combined.",
        explanation: chosen.map((c) => `"${c.text}" describes ${BUCKET_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "symbols") {
      const chosen = shuffle(rng, [...ELEMENTS]).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((e) => ({ id: e.name, label: e.name })));
      const targets = shuffle(rng, chosen.map((e) => ({ id: e.name, label: e.symbol })));
      const correctMap: Record<string, string> = {};
      for (const e of chosen) correctMap[e.name] = e.name;
      return {
        kind: "click-match",
        prompt: "Match each element to its chemical symbol.",
        tokens,
        targets,
        correctMap,
        hint: "Symbols usually come from the element's English or Latin name — e.g. Fe for iron (from ferrum), Na for sodium (from natrium).",
        explanation: chosen.map((e) => `${e.name} is written as ${e.symbol}.`).join(" "),
      };
    }

    if (branch === "equation") {
      const direction = randChoice(rng, ["forward", "reverse"] as const);
      const eq = randChoice(rng, EQUATIONS);
      if (direction === "forward") {
        return {
          kind: "fill-blank",
          prompt: `Complete the word equation: ${eq.reactants[0]} + ${eq.reactants[1]} → ___`,
          before: "",
          after: "",
          correctAnswer: eq.product,
          inputMode: "text",
          hint: "Name the compound that forms when these two elements react.",
          explanation: `${eq.reactants[0]} and ${eq.reactants[1]} combine to form ${eq.product.toLowerCase()}: ${eq.reactants[0]} + ${eq.reactants[1]} → ${eq.product}.`,
        };
      }
      const others = EQUATIONS.filter((e) => e.product !== eq.product);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        `${eq.reactants[0]} and ${eq.reactants[1]}`,
        others.map((e) => `${e.reactants[0]} and ${e.reactants[1]}`),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `Which two elements combine to form ${eq.product.toLowerCase()}?`,
        choices,
        correctIndex,
        hint: "Think about which two elements' word equation gives this product.",
        explanation: `${eq.reactants[0]} + ${eq.reactants[1]} → ${eq.product}.`,
      };
    }

    // uses
    const direction = randChoice(rng, ["forward", "reverse"] as const);
    const u = randChoice(rng, USES);
    if (direction === "forward") {
      const others = USES.filter((x) => x.element !== u.element);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        u.use,
        others.map((x) => x.use),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `What is ${u.element} commonly used for in society?`,
        choices,
        correctIndex,
        hint: "Think about the element's physical properties — strength, shine, conductivity, or nutritional role.",
        explanation: `${u.element} is used for ${u.use}.`,
      };
    }
    const others = USES.filter((x) => x.element !== u.element);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, u.element, others.map((x) => x.element), 3);
    return {
      kind: "multiple-choice",
      prompt: `Which element is used for ${u.use}?`,
      choices,
      correctIndex,
      hint: "Match the property described back to the element known for it.",
      explanation: `${u.element} is used for ${u.use}.`,
    };
  },
};
