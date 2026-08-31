import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { name, matchPrompt, sortPrompt, orderPrompt, fillPrompt, speakingScenarioCloser } from "./g5FrShared";

// Grade 5's "My Body" theme is body-part naming PLUS function ("Ma bouche est pour manger, mes
// oreilles sont pour écouter" — Parties du corps + est/sont + verbe infinitif), per the design's
// sub-strand 1.7 — NOT the grooming/hygiene vocabulary used for Grade 6/7's same-titled theme.

type Number_ = "singular" | "plural";

const BODY_PARTS: { part: string; meaning: string; number: Number_; verb: string; is: string; funcMeaning: string }[] = [
  { part: "la bouche", meaning: "the mouth", number: "singular", verb: "manger", is: "est", funcMeaning: "to eat" },
  { part: "le nez", meaning: "the nose", number: "singular", verb: "sentir", is: "est", funcMeaning: "to smell" },
  { part: "la tête", meaning: "the head", number: "singular", verb: "penser", is: "est", funcMeaning: "to think" },
  { part: "le ventre", meaning: "the belly", number: "singular", verb: "digérer", is: "est", funcMeaning: "to digest" },
  { part: "le cœur", meaning: "the heart", number: "singular", verb: "pomper le sang", is: "est", funcMeaning: "to pump blood" },
  { part: "les oreilles", meaning: "the ears", number: "plural", verb: "écouter", is: "sont", funcMeaning: "to listen" },
  { part: "les yeux", meaning: "the eyes", number: "plural", verb: "voir", is: "sont", funcMeaning: "to see" },
  { part: "les mains", meaning: "the hands", number: "plural", verb: "toucher", is: "sont", funcMeaning: "to touch" },
  { part: "les pieds", meaning: "the feet", number: "plural", verb: "marcher", is: "sont", funcMeaning: "to walk" },
  { part: "les bras", meaning: "the arms", number: "plural", verb: "porter", is: "sont", funcMeaning: "to carry" },
  { part: "les jambes", meaning: "the legs", number: "plural", verb: "courir", is: "sont", funcMeaning: "to run" },
  { part: "les dents", meaning: "the teeth", number: "plural", verb: "mâcher", is: "sont", funcMeaning: "to chew" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "La bouche ", after: " pour manger.", answer: "est", gloss: "La bouche est pour manger. — The mouth is for eating." },
  { before: "Les oreilles ", after: " pour écouter.", answer: "sont", gloss: "Les oreilles sont pour écouter. — The ears are for listening." },
  { before: "Les yeux sont pour ", after: ".", answer: "voir", gloss: "Les yeux sont pour voir. — The eyes are for seeing." },
  { before: "Le nez est pour ", after: ".", answer: "sentir", gloss: "Le nez est pour sentir. — The nose is for smelling." },
  { before: "Les ", after: " sont pour toucher.", answer: "mains", gloss: "Les mains sont pour toucher. — The hands are for touching." },
  { before: "Les pieds sont pour ", after: ".", answer: "marcher", gloss: "Les pieds sont pour marcher. — The feet are for walking." },
  { before: "Les bras sont pour ", after: ".", answer: "porter", gloss: "Les bras sont pour porter. — The arms are for carrying." },
  { before: "Les jambes sont pour ", after: ".", answer: "courir", gloss: "Les jambes sont pour courir. — The legs are for running." },
  { before: "Les dents sont pour ", after: ".", answer: "mâcher", gloss: "Les dents sont pour mâcher. — The teeth are for chewing." },
  { before: "La ", after: " est pour penser.", answer: "tête", gloss: "La tête est pour penser. — The head is for thinking." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["La", "bouche", "est", "pour", "manger", "."], sentence: "La bouche est pour manger." },
  { chunks: ["Les", "oreilles", "sont", "pour", "écouter", "."], sentence: "Les oreilles sont pour écouter." },
  { chunks: ["Les", "yeux", "sont", "pour", "voir", "."], sentence: "Les yeux sont pour voir." },
  { chunks: ["Les", "pieds", "sont", "pour", "marcher", "."], sentence: "Les pieds sont pour marcher." },
  { chunks: ["Le", "nez", "est", "pour", "sentir", "."], sentence: "Le nez est pour sentir." },
];

const SCENARIOS: { situation: (n: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} asks which body part you use to eat your food.`,
    correct: "La bouche est pour manger.",
    distractors: ["Le nez est pour manger.", "Les yeux sont pour manger.", "Les mains sont pour manger."],
    explanation: "'La bouche est pour manger' correctly names the mouth for eating — the nose, eyes, and hands each have a different function.",
  },
  {
    situation: (n) => `${n} asks which body part lets you hear music.`,
    correct: "Les oreilles sont pour écouter.",
    distractors: ["Les yeux sont pour écouter.", "Le nez est pour écouter.", "La bouche est pour écouter."],
    explanation: "'Les oreilles sont pour écouter' correctly names the ears for listening — the eyes, nose, and mouth serve different functions.",
  },
  {
    situation: (n) => `${n} asks which body part lets you watch a film.`,
    correct: "Les yeux sont pour voir.",
    distractors: ["Les oreilles sont pour voir.", "Les mains sont pour voir.", "Le nez est pour voir."],
    explanation: "'Les yeux sont pour voir' correctly names the eyes for seeing — the ears, hands, and nose have different functions.",
  },
  {
    situation: (n) => `${n} asks which body part lets you smell fresh bread baking.`,
    correct: "Le nez est pour sentir.",
    distractors: ["La bouche est pour sentir.", "Les mains sont pour sentir.", "Les oreilles sont pour sentir."],
    explanation: "'Le nez est pour sentir' correctly names the nose for smelling — the mouth, hands, and ears have different functions.",
  },
  {
    situation: (n) => `${n} asks which body part you use to feel a soft blanket.`,
    correct: "Les mains sont pour toucher.",
    distractors: ["Les pieds sont pour toucher.", "Les yeux sont pour toucher.", "Le nez est pour toucher."],
    explanation: "'Les mains sont pour toucher' correctly names the hands for touching — the feet, eyes, and nose serve different functions.",
  },
  {
    situation: (n) => `${n} asks which body part you use to get to school on foot.`,
    correct: "Les pieds sont pour marcher.",
    distractors: ["Les mains sont pour marcher.", "Les bras sont pour marcher.", "La bouche est pour marcher."],
    explanation: "'Les pieds sont pour marcher' correctly names the feet for walking — the hands, arms, and mouth serve different functions.",
  },
  {
    situation: (n) => `${n} asks which body part you use to carry a heavy schoolbag.`,
    correct: "Les bras sont pour porter.",
    distractors: ["Les jambes sont pour porter.", "Les pieds sont pour porter.", "La tête est pour porter."],
    explanation: "'Les bras sont pour porter' correctly names the arms for carrying — the legs, feet, and head serve different functions.",
  },
  {
    situation: (n) => `${n} asks which body part lets you race your friends across the field.`,
    correct: "Les jambes sont pour courir.",
    distractors: ["Les bras sont pour courir.", "Les pieds seuls sont pour courir.", "Les mains sont pour courir."],
    explanation: "'Les jambes sont pour courir' correctly names the legs for running — the arms and hands serve different functions.",
  },
  {
    situation: (n) => `${n} asks which body part you use to chew your food before swallowing.`,
    correct: "Les dents sont pour mâcher.",
    distractors: ["La bouche est pour mâcher.", "La langue est pour mâcher.", "Les yeux sont pour mâcher."],
    explanation: "'Les dents sont pour mâcher' correctly names the teeth for chewing — the mouth as a whole and the eyes serve a broader or different function.",
  },
  {
    situation: (n) => `${n} asks which body part you use to solve a maths problem.`,
    correct: "La tête est pour penser.",
    distractors: ["Le cœur est pour penser.", "Les mains sont pour penser.", "Les yeux sont pour penser."],
    explanation: "'La tête est pour penser' correctly names the head for thinking — the heart, hands, and eyes serve different functions.",
  },
];

export const bodySpeaking: Skill = {
  id: "g5-fr-ls-body",
  code: "LS.7",
  subjectId: "french",
  strandId: "g5-fr-listening-speaking",
  grade: 5,
  title: "Body parts and their functions",
  description: "Naming body parts and what each is for, using the 'Partie du corps + est/sont + verbe infinitif' pattern — practiced through matching, sorting, and speaking scenarios.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, BODY_PARTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.part, label: p.part })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.part, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.part] = p.part;

      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "French body-part word to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "'la/le' names one part; 'les' names a part that comes in a pair or set.",
        explanation: chosen.map((p) => `"${p.part}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const singular = shuffle(rng, BODY_PARTS.filter((p) => p.number === "singular"));
      const plural = shuffle(rng, BODY_PARTS.filter((p) => p.number === "plural")).slice(0, 5);
      const items = shuffle(rng, [...singular, ...plural]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.part] = p.is;

      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "each body part by whether it takes 'est' or 'sont'"),
        items: items.map((p) => ({ id: p.part, label: p.part })),
        buckets: [
          { id: "est", label: "…est pour…" },
          { id: "sont", label: "…sont pour…" },
        ],
        correctBucket,
        hint: "A single body part (la/le) takes 'est'; a part named in the plural (les) takes 'sont'.",
        explanation: [...singular, ...plural].map((p) => `"${p.part}" takes "${p.is}" because it is ${p.number}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the 'Partie du corps + est/sont + verbe infinitif' pattern.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to form a correct French sentence about a body part's function"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The body part comes first, then 'est'/'sont', then 'pour' and the function.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const n = name(rng);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(n)} ${speakingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about which body part is actually responsible for that function.",
      explanation: s.explanation,
    };
  },
};
