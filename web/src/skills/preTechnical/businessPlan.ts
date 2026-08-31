import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const COMPONENTS: { term: string; meaning: string }[] = [
  { term: "Executive summary", meaning: "a brief overview of the whole business plan, highlighting the key points" },
  { term: "Business description", meaning: "an explanation of what the business does and the problem it solves" },
  { term: "Market/competitor analysis", meaning: "research into customers and rival businesses in the same market" },
  { term: "Product and services", meaning: "a description of what the business will actually sell or offer" },
  { term: "Marketing plan", meaning: "the strategy for how the business will attract and reach customers" },
  { term: "Financial projection", meaning: "an estimate of the business's expected costs, income, and profit" },
];

export const businessPlan: Skill = {
  id: "pt-e-business-plan",
  code: "E.2",
  subjectId: "pre-technical",
  strandId: "pt-entrepreneurship",
  grade: 9,
  title: "Components of a business plan",
  description: "Match each component of a business plan to what it covers.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order"] as const);

    if (branch === "order") {
      const items = COMPONENTS.map((c) => ({ id: c.term, label: c.term }));
      const correctOrder = items.map((i) => i.id);

      return {
        kind: "ordering",
        prompt: "Arrange these business plan components in the order they typically appear, from first to last.",
        instruction: "Click the components in order, from first to last.",
        items: shuffle(rng, items),
        correctOrder,
        hint: "A business plan usually opens with a summary, then describes the business and its market, before moving to the offering, marketing, and finances.",
        explanation: `A business plan typically follows this order: ${COMPONENTS.map((c) => c.term).join(" → ")}.`,
      };
    }

    const chosen = shuffle(rng, COMPONENTS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((c) => ({ id: c.term, label: c.term })));
    const targets = shuffle(rng, chosen.map((c) => ({ id: c.term, label: c.meaning })));
    const correctMap: Record<string, string> = {};
    for (const c of chosen) correctMap[c.term] = c.term;

    return {
      kind: "click-match",
      prompt: "Match each business plan component to what it covers.",
      tokens,
      targets,
      correctMap,
      hint: "A business plan explains the idea, the market, the offering, how it will be promoted, and the finances.",
      explanation: chosen.map((c) => `${c.term} — ${c.meaning}.`).join(" "),
    };
  },
};
