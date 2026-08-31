import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each special prayer to what it is performed for.",
  "Pair each special prayer with what it is performed for.",
  "Connect each prayer below to what it is performed for.",
  "Match each prayer to its correct purpose.",
  "Link each special prayer to what it is for.",
  "Choose the correct purpose for each special prayer.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each situation by which special prayer would be performed.",
  "Group each situation under the special prayer that would be performed.",
  "Decide which special prayer fits each situation, and sort it there.",
  "Sort each situation into the correct special prayer.",
  "Place each situation under the prayer it calls for.",
  "Read each situation and sort it under the matching special prayer.",
];

const ORDER_PROMPTS = [
  "Arrange the steps of performing Swalatul Istikhara in the correct order.",
  "Put the steps of performing Swalatul Istikhara into the correct order.",
  "Sequence these steps of Swalatul Istikhara correctly.",
  "Order these steps of Istikhara as they should actually be performed.",
  "Sort these steps of Swalatul Istikhara into their correct order.",
  "Arrange these steps of performing Istikhara from first to last.",
];

const FILL_PROMPTS = [
  "Fill in the missing term.",
  "Which term completes this sentence?",
  "Complete the sentence with the correct term.",
  "Work out the missing term below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which term belongs in the blank?",
];

const PRAYERS: { name: string; description: string }[] = [
  { name: "Swalatul Istisqaa", description: "A special prayer for rain, performed by the community during a drought" },
  { name: "Swalatul Istikhara", description: "A prayer for guidance, performed when a person is seeking Allah's counsel on a decision" },
];

const SCENARIO_ITEMS = [
  { text: "A community facing a prolonged drought comes together to pray for rain", prayer: "Swalatul Istisqaa" },
  { text: "Farmers whose crops are failing from lack of rain gather for a special prayer", prayer: "Swalatul Istisqaa" },
  { text: "A student unsure which of two schools to join prays for guidance before deciding", prayer: "Swalatul Istikhara" },
  { text: "A person about to accept a new job offer prays two rak'ahs asking Allah for guidance", prayer: "Swalatul Istikhara" },
] as const;

const ORDER_ITEMS = [
  { id: "intend", label: "Form the intention (niyyah) to seek Allah's guidance on the decision" },
  { id: "rakah", label: "Perform two rak'ahs of voluntary (nafl) prayer" },
  { id: "dua", label: "Recite the Istikhara supplication, asking Allah to guide you to what is best" },
  { id: "proceed", label: "Proceed with a sense of ease, or reconsider, based on how matters unfold afterward" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is Swalatul Istisqaa?",
    correct: "A special prayer asking Allah for rain, performed during a drought",
    distractors: ["A daily obligatory prayer", "A prayer performed only at weddings", "A prayer for the dead"],
  },
  {
    q: "When would a Muslim perform Swalatul Istikhara?",
    correct: "When they are seeking Allah's guidance before making an important decision",
    distractors: ["Only when it is raining", "Only during the month of Ramadan", "Only when travelling"],
  },
  {
    q: "Why do Muslims perform prayers on special occasions such as Istisqaa and Istikhara?",
    correct: "To seek Allah's blessings and guidance in specific circumstances of need",
    distractors: ["Because they are compulsory five times a day", "To replace the five daily prayers", "Because they are only cultural customs with no religious basis"],
  },
  {
    q: "What does a Muslim recite after the two rak'ahs in Istikhara?",
    correct: "A special supplication (dua) asking Allah to guide them to what is best",
    distractors: ["A chapter memorised only for funerals", "Nothing further is required", "A greeting exchanged with the congregation"],
  },
];

export const prayersOnSpecialOccasions: Skill = {
  id: "g8-ire-da-prayers-on-special-occasions",
  code: "DA.1",
  subjectId: "ire",
  strandId: "g8-ire-da",
  grade: 8,
  title: "Prayers on Special Occasions",
  description: "Swalatul Istisqaa (the prayer for rain) and Swalatul Istikhara (the prayer for guidance).",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, PRAYERS.map((p) => ({ id: p.name, label: p.name })));
      const targets = shuffle(rng, PRAYERS.map((p) => ({ id: p.name, label: p.description })));
      const correctMap: Record<string, string> = {};
      for (const p of PRAYERS) correctMap[p.name] = p.name;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "One is for seeking rain, the other for seeking guidance.",
        explanation: PRAYERS.map((p) => `${p.name} — ${p.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SCENARIO_ITEMS);
      const buckets = PRAYERS.map((p) => ({ id: p.name, label: p.name }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.prayer));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Istisqaa is about rain and drought; Istikhara is about seeking guidance for a decision.",
        explanation: chosen.map((c) => `"${c.text}" — calls for ${c.prayer}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_ITEMS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_ITEMS.map((s) => s.id),
        hint: "Form the intention first, then pray two rak'ahs, then recite the dua, then act on the outcome.",
        explanation: ORDER_ITEMS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "The prayer performed to seek Allah's guidance before making a decision is called Swalatul",
        after: ".",
        correctAnswer: "Istikhara",
        inputMode: "text",
        hint: "This word is related to the Arabic root for 'choosing what is good'.",
        explanation: "Swalatul Istikhara is the prayer performed to seek Allah's guidance before making a decision.",
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Istisqaa seeks rain during drought; Istikhara seeks guidance before a decision. Both express reliance on Allah.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
