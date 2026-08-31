import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, sortPrompt, orderPrompt, fillPrompt, writingScenarioCloser } from "./g5FrShared";

// Grade 5's "My Body" theme is body-part naming PLUS function ("Ma bouche est pour manger, mes
// oreilles sont pour écouter" — Parties du corps + est/sont + verbe infinitif), NOT the grooming/
// hygiene vocabulary used for Grade 6/7's same-titled theme.

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
  { before: "Les jambes sont pour ", after: ".", answer: "courir", gloss: "Les jambes sont pour courir. — The legs are for running." },
  { before: "Les dents sont pour ", after: ".", answer: "mâcher", gloss: "Les dents sont pour mâcher. — The teeth are for chewing." },
  { before: "La ", after: " est pour penser.", answer: "tête", gloss: "La tête est pour penser. — The head is for thinking." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["La", "bouche", "est", "pour", "manger", "."], sentence: "La bouche est pour manger." },
  { chunks: ["Les", "oreilles", "sont", "pour", "écouter", "."], sentence: "Les oreilles sont pour écouter." },
  { chunks: ["Les", "yeux", "sont", "pour", "voir", "."], sentence: "Les yeux sont pour voir." },
  { chunks: ["Les", "mains", "sont", "pour", "toucher", "."], sentence: "Les mains sont pour toucher." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a fact-file sentence about what the mouth is used for.",
    correct: "La bouche est pour manger.",
    distractors: ["Le nez est pour manger.", "Les yeux sont pour manger.", "La bouche sont pour manger."],
    explanation: "'La bouche est pour manger' correctly names the mouth and uses the singular 'est' — the others name a different body part or use the wrong verb form.",
  },
  {
    note: "You are writing a fact-file sentence about what the ears are used for.",
    correct: "Les oreilles sont pour écouter.",
    distractors: ["Les oreilles est pour écouter.", "Les yeux sont pour écouter.", "Le nez est pour écouter."],
    explanation: "'Les oreilles sont pour écouter' correctly uses the plural 'sont' for the plural noun 'les oreilles' — the others use the wrong verb form or the wrong body part.",
  },
  {
    note: "You are writing a fact-file sentence about the function of the eyes.",
    correct: "Les yeux sont pour voir.",
    distractors: ["Les yeux est pour voir.", "Les oreilles sont pour voir.", "Les yeux sont pour écouter."],
    explanation: "'Les yeux sont pour voir' correctly pairs the plural 'sont' with 'les yeux' and names seeing — the others use the wrong verb form or the wrong function.",
  },
  {
    note: "You are writing a fact-file sentence explaining what the nose is for.",
    correct: "Le nez est pour sentir.",
    distractors: ["Le nez sont pour sentir.", "La bouche est pour sentir.", "Le nez est pour voir."],
    explanation: "'Le nez est pour sentir' correctly uses the singular 'est' for the singular noun 'le nez' — the others use the wrong verb form or the wrong function.",
  },
  {
    note: "You are writing a fact-file sentence about what the hands are for.",
    correct: "Les mains sont pour toucher.",
    distractors: ["Les mains est pour toucher.", "Les pieds sont pour toucher.", "Les mains sont pour marcher."],
    explanation: "'Les mains sont pour toucher' correctly pairs the plural 'sont' with 'les mains' — the others use the wrong verb form or the wrong function.",
  },
  {
    note: "You are writing a fact-file sentence about what the feet are for.",
    correct: "Les pieds sont pour marcher.",
    distractors: ["Les pieds est pour marcher.", "Les mains sont pour marcher.", "Les jambes sont pour marcher."],
    explanation: "'Les pieds sont pour marcher' correctly pairs the plural 'sont' with the correct body part — the others use the wrong verb form or a different body part.",
  },
  {
    note: "You are writing a fact-file sentence about what the legs are for.",
    correct: "Les jambes sont pour courir.",
    distractors: ["Les jambes est pour courir.", "Les bras sont pour courir.", "Les jambes sont pour marcher."],
    explanation: "'Les jambes sont pour courir' correctly pairs the plural 'sont' with running — the others use the wrong verb form or a different function.",
  },
  {
    note: "You are writing a fact-file sentence about what the teeth are for.",
    correct: "Les dents sont pour mâcher.",
    distractors: ["Les dents est pour mâcher.", "La bouche est pour mâcher.", "Les dents sont pour voir."],
    explanation: "'Les dents sont pour mâcher' correctly pairs the plural 'sont' with chewing — the others use the wrong verb form or the wrong function.",
  },
  {
    note: "You are writing a fact-file sentence about what the head is for.",
    correct: "La tête est pour penser.",
    distractors: ["La tête sont pour penser.", "Le cœur est pour penser.", "La tête est pour manger."],
    explanation: "'La tête est pour penser' correctly uses the singular 'est' for the singular noun 'la tête' — the others use the wrong verb form or the wrong function.",
  },
];

export const bodyWriting: Skill = {
  id: "g5-fr-w-body",
  code: "W.7",
  subjectId: "french",
  strandId: "g5-fr-writing",
  grade: 5,
  title: "Body parts and their functions",
  description: "Guided writing — spelling body-part words and constructing 'est/sont pour + verbe infinitif' sentences about what each body part is for.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, BODY_PARTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.part, label: p.part })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.part, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.part] = p.part;

      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "written French body-part word to its English meaning"),
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
        prompt: sortPrompt(rng, "each written body-part word by whether it takes 'est' or 'sont'"),
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
        prompt: orderPrompt(rng, "the words to write a correct French sentence about a body part's function"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The body part comes first, then 'est'/'sont', then 'pour' and the function.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} ${writingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check the body part named, whether it needs 'est' or 'sont', and its correct function.",
      explanation: s.explanation,
    };
  },
};
