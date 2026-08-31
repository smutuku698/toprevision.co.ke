import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VERBS: { term: string; meaning: string }[] = [
  { term: "se lever", meaning: "to get up" },
  { term: "se laver", meaning: "to wash oneself" },
  { term: "prendre le petit-déjeuner", meaning: "to have breakfast" },
  { term: "aller à l'école", meaning: "to go to school" },
  { term: "déjeuner", meaning: "to have lunch" },
  { term: "faire les devoirs", meaning: "to do homework" },
  { term: "dîner", meaning: "to have dinner" },
  { term: "se coucher", meaning: "to go to bed" },
];

const ORDER_PROMPTS = [
  "Arrange these daily routine activities in the order they typically happen.",
  "Put these daily routine activities into the order a typical day follows.",
  "Sequence these activities from first thing in the morning to last thing at night.",
  "Order these routine activities the way they normally happen during the day.",
  "Arrange these actions into the order a typical school day would follow.",
  "Sort these daily activities into the order they usually occur.",
];

const MATCH_PROMPTS = [
  "Match each French routine expression to its English meaning.",
  "Pair each French routine phrase with its correct English meaning.",
  "Connect each routine expression to what it means in English.",
  "Match each phrase below to its English translation.",
  "Link each French routine expression to the meaning that fits it.",
  "Match each expression to its English equivalent.",
];

const DAY_ORDER: { id: string; label: string }[] = [
  { id: "lever", label: "se lever (get up)" },
  { id: "laver", label: "se laver (wash)" },
  { id: "petit-dej", label: "prendre le petit-déjeuner (have breakfast)" },
  { id: "ecole", label: "aller à l'école (go to school)" },
  { id: "devoirs", label: "faire les devoirs (do homework)" },
  { id: "diner", label: "dîner (have dinner)" },
  { id: "coucher", label: "se coucher (go to bed)" },
];

export const routineSpeaking: Skill = {
  id: "fr-ls-routine",
  code: "LS.4",
  subjectId: "french",
  strandId: "fr-listening-speaking",
  grade: 9,
  title: "Talking about daily routine",
  description: "Match routine verbs to their meaning, and arrange the day's activities in order.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order"] as const);

    if (branch === "order") {
      const items = shuffle(rng, DAY_ORDER);
      const correctOrder = DAY_ORDER.map((d) => d.id);

      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the activities from first thing in the morning to last thing at night.",
        items,
        correctOrder,
        hint: "Think through a typical school day from waking up to going to bed.",
        explanation: `A typical order is: ${DAY_ORDER.map((d) => d.label).join(" → ")}.`,
      };
    }

    const chosen = shuffle(rng, VERBS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
    const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
    const correctMap: Record<string, string> = {};
    for (const t of chosen) correctMap[t.term] = t.term;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "'Se lever' and 'se coucher' are reflexive verbs — the action is done to oneself.",
      explanation: chosen.map((t) => `"${t.term}" means "${t.meaning}".`).join(" "),
    };
  },
};
