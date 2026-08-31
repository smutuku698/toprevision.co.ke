import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TAXES: { term: string; meaning: string }[] = [
  { term: "Income tax", meaning: "a tax charged on the money a person earns from employment or business" },
  { term: "VAT (Value Added Tax)", meaning: "a tax added to the price of most goods and services when they are sold" },
  { term: "Corporate tax", meaning: "a tax charged on the profits made by a registered company" },
  { term: "Fuel levy", meaning: "a tax added to the price of petrol and diesel to fund road maintenance" },
  { term: "Excise duty", meaning: "a tax charged on specific goods, such as alcohol, tobacco, or airtime" },
];

export const kenyanTaxes: Skill = {
  id: "pt-e-kenyan-taxes",
  code: "E.1",
  subjectId: "pre-technical",
  strandId: "pt-entrepreneurship",
  grade: 9,
  title: "Types of taxes in Kenya",
  description: "Match each type of tax in Kenya to what it is charged on.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "identify"] as const);

    if (branch === "identify") {
      const pool = shuffle(rng, TAXES);
      const correct = pool[0];
      const choices = shuffle(rng, pool.slice(0, 4).map((t) => t.term));

      return {
        kind: "multiple-choice",
        prompt: `Which tax is charged on ${correct.meaning.replace(/^a tax (charged on|added to)\s*/i, "")}?`,
        choices,
        correctIndex: choices.indexOf(correct.term),
        layout: "list",
        hint: "Think about what is being taxed — earnings, profits, sales, or specific goods.",
        explanation: `${correct.term} — ${correct.meaning}.`,
      };
    }

    const chosen = shuffle(rng, TAXES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
    const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
    const correctMap: Record<string, string> = {};
    for (const t of chosen) correctMap[t.term] = t.term;

    return {
      kind: "click-match",
      prompt: "Match each type of tax to what it is charged on.",
      tokens,
      targets,
      correctMap,
      hint: "Think about what is being taxed — earnings, profits, sales, or specific goods.",
      explanation: chosen.map((t) => `${t.term} — ${t.meaning}.`).join(" "),
    };
  },
};
