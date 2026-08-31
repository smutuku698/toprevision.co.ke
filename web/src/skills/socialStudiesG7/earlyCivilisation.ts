import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ACHIEVEMENTS = [
  { text: "Built the pyramids and the Sphinx as monuments to their rulers", kingdom: "Egypt" },
  { text: "Developed irrigation systems along the Nile River to support farming", kingdom: "Egypt" },
  { text: "Invented one of the world's earliest writing systems, hieroglyphics", kingdom: "Egypt" },
  { text: "Built a great stone-walled city entirely without mortar", kingdom: "Great Zimbabwe" },
  { text: "Grew wealthy from cattle-keeping and control of regional trade routes", kingdom: "Great Zimbabwe" },
  { text: "Linked its trade networks to Indian Ocean ports, exchanging gold for imported goods", kingdom: "Great Zimbabwe" },
  { text: "Developed a centralised kingship that governed a large, organised territory", kingdom: "Kongo" },
  { text: "Built extensive trade networks across Central Africa exchanging copper, cloth, and ivory", kingdom: "Kongo" },
  { text: "Established diplomatic relations with Portugal, including exchanging envoys", kingdom: "Kongo" },
  { text: "Developed a system of provinces governed by appointed officials answering to the king", kingdom: "Kongo" },
] as const;

const REGION_LABEL: Record<string, string> = {
  Egypt: "Ancient Egypt (Northeast Africa, along the Nile)",
  "Great Zimbabwe": "Great Zimbabwe (Southern Africa)",
  Kongo: "Kingdom of Kongo (Central/West Africa, Congo Basin)",
};

const LOCATION_OPTIONS = [
  { kingdom: "Egypt", name: "Ancient Egypt", location: "Northeast Africa, along the Nile River" },
  { kingdom: "Great Zimbabwe", name: "Great Zimbabwe", location: "Southern Africa" },
  { kingdom: "Kongo", name: "the Kingdom of Kongo", location: "Central/West Africa, in the Congo Basin" },
] as const;

const TERMS: { term: string; meaning: string }[] = [
  { term: "Hieroglyphics", meaning: "An early Egyptian writing system using pictures and symbols" },
  { term: "Dry-stone walling", meaning: "A building technique that stacks stones together without using mortar" },
  { term: "Centralised kingship", meaning: "A system where one ruler governs a large, organised territory" },
  { term: "Envoy", meaning: "A representative sent by a ruler to communicate with another power" },
  { term: "Irrigation", meaning: "Supplying water to farmland artificially to support crop growth" },
  { term: "Civilisation", meaning: "A society with organised cities, government, and shared culture" },
] as const;

const ZIMBABWE_GROWTH_STEPS = [
  { id: "cattle", label: "Cattle-keeping built up wealth and stability for the community" },
  { id: "trade-control", label: "Control of regional trade routes brought valuable goods through the kingdom" },
  { id: "indian-ocean", label: "Trade links extended to Indian Ocean ports, exchanging gold for imported goods" },
  { id: "build", label: "The accumulated wealth funded the construction of the great stone-walled city" },
] as const;

const CONTRIBUTIONS = [
  "Engineering and construction knowledge from monument-building still studied by architects today",
  "Early writing systems that influenced how humans record and pass down information",
  "Long-distance trade networks that show how regional economies connected to the wider world",
  "Examples of organised, centralised governance that influenced how large territories can be administered",
  "Evidence that advanced building techniques, such as dry-stone walling, developed independently across Africa",
  "Early diplomatic practices, such as exchanging envoys with distant powers, that pre-date many later examples",
  "Proof that sophisticated societies flourished across Africa well before European contact",
  "Irrigation and farming knowledge that supported some of the earliest large, organised populations",
] as const;

export const earlyCivilisation: Skill = {
  id: "g7-ss-pr-early-civilisation",
  code: "PR.2",
  subjectId: "social-studies",
  strandId: "g7-ss-pr",
  grade: 7,
  title: "Early civilisation",
  description: "Factors that led to the growth of ancient Egypt, Great Zimbabwe, and the Kingdom of Kongo, their locations, and their contribution to modern world civilisation.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "match", "locate", "contribution", "fill-blank", "zimbabwe-order"] as const);

    if (branch === "fill-blank") {
      const t = randChoice(rng, TERMS);
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence: "${t.meaning}" is the definition of ___.`,
        before: "",
        after: "",
        correctAnswer: t.term,
        acceptedAnswers: [t.term.toLowerCase()],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe early African civilisations.",
        explanation: `${t.term} — ${t.meaning.toLowerCase()}.`,
      };
    }

    if (branch === "zimbabwe-order") {
      const items = shuffle(rng, ZIMBABWE_GROWTH_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange these factors in the growth of Great Zimbabwe, in a sensible order.",
        instruction: "Drag to reorder from the earliest factor to the last.",
        items,
        correctOrder: ZIMBABWE_GROWTH_STEPS.map((s) => s.id),
        hint: "Wealth from cattle and trade came before the kingdom could fund its famous stone city.",
        explanation: ZIMBABWE_GROWTH_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "classify") {
      const chosen = shuffle(rng, ACHIEVEMENTS).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((a) => a.kingdom))).map((k) => ({ id: k, label: REGION_LABEL[k] }));
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.kingdom));
      return {
        kind: "categorize",
        prompt: "Sort each achievement into the early African kingdom it belongs to.",
        items,
        buckets,
        correctBucket,
        hint: "Think about which kingdom — Egypt, Great Zimbabwe, or Kongo — is linked to each achievement.",
        explanation: chosen.map((a) => `"${a.text}" — ${REGION_LABEL[a.kingdom]}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, [...ACHIEVEMENTS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `a${i}`, label: a.kingdom })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `a${i}`, label: a.text })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((a, i) => (correctMap[`a${i}`] = `a${i}`));
      return {
        kind: "click-match",
        prompt: "Match each kingdom to one of its real achievements.",
        tokens,
        targets,
        correctMap,
        hint: "Recall a specific achievement linked to each kingdom.",
        explanation: chosen.map((a) => `${a.kingdom}: ${a.text}.`).join(" "),
      };
    }

    if (branch === "locate") {
      const l = randChoice(rng, LOCATION_OPTIONS);
      const others = LOCATION_OPTIONS.filter((o) => o.kingdom !== l.kingdom).map((o) => o.location);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, l.location, others, 2);
      return {
        kind: "multiple-choice",
        prompt: `On a map of Africa, in which region would you locate ${l.name}?`,
        choices,
        correctIndex,
        hint: "Recall which broad region of the African continent each kingdom grew in.",
        explanation: `${l.name} is located in ${l.location}.`,
      };
    }

    // contribution
    const correct = randChoice(rng, CONTRIBUTIONS);
    const others = CONTRIBUTIONS.filter((c) => c !== correct);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
    return {
      kind: "multiple-choice",
      prompt: "Which of these best describes a contribution of early African kingdoms like Egypt, Great Zimbabwe, and Kongo to modern world civilisation?",
      choices,
      correctIndex,
      hint: "Think about systems and knowledge that people around the world still use or study today.",
      explanation: `${correct} — this is a lasting contribution of early African kingdoms to the modern world.`,
    };
  },
};
