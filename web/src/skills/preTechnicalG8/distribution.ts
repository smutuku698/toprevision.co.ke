import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const INTERMEDIARIES = [
  { id: "wholesaler", label: "Wholesaler", role: "Buys goods in bulk from producers and sells smaller quantities on to retailers" },
  { id: "retailer", label: "Retailer", role: "Sells goods directly to the final consumer, usually in small quantities" },
  { id: "agent", label: "Agent/broker", role: "Connects buyers and sellers without owning the goods, and earns a commission" },
  { id: "transporter", label: "Transporter", role: "Moves goods physically from producers to markets or storage points" },
] as const;

const CHANNELS = [
  { id: "direct", label: "Direct channel", chain: ["Producer", "Consumer"] },
  { id: "one-level", label: "One-level (indirect) channel", chain: ["Producer", "Retailer", "Consumer"] },
  { id: "two-level", label: "Two-level (indirect) channel", chain: ["Producer", "Wholesaler", "Retailer", "Consumer"] },
] as const;

const ETHICS_ITEMS = [
  { text: "Charging a fair, consistent price across all outlets", bucket: "ethical" },
  { text: "Labelling goods honestly with their true origin and quality", bucket: "ethical" },
  { text: "Delivering goods to all outlets on time as agreed", bucket: "ethical" },
  { text: "Deliberately withholding stock from the market to force prices up later", bucket: "unethical" },
  { text: "Bribing an official to bypass distribution regulations", bucket: "unethical" },
  { text: "Favouring one retailer with extra stock while starving others unfairly", bucket: "unethical" },
] as const;

const ETHICS_LABEL: Record<string, string> = { ethical: "Ethical distribution practice", unethical: "Unethical distribution practice" };

export const distribution: Skill = {
  id: "g8-pt-e-distribution",
  code: "E.4",
  subjectId: "pre-technical",
  strandId: "g8-pt-entrepreneurship",
  grade: 8,
  title: "Distribution of Goods and Services",
  description: "The role of intermediaries in distribution, the channels used to distribute goods and services, and ethics in distribution.",
  generate(rng) {
    const branch = randChoice(rng, ["role-match", "channel-order", "ethics-sort", "hoarding-scenario", "recall"] as const);

    if (branch === "role-match") {
      const tokens = shuffle(rng, INTERMEDIARIES.map((i) => ({ id: i.id, label: i.label })));
      const targets = shuffle(rng, INTERMEDIARIES.map((i) => ({ id: i.id, label: i.role })));
      const correctMap: Record<string, string> = {};
      for (const i of INTERMEDIARIES) correctMap[i.id] = i.id;
      return {
        kind: "click-match",
        prompt: "Match each intermediary to their role in distributing goods and services.",
        tokens,
        targets,
        correctMap,
        hint: "Some intermediaries buy and sell, one connects others for a fee, and one just moves the goods.",
        explanation: INTERMEDIARIES.map((i) => `${i.label}: ${i.role}.`).join(" "),
      };
    }

    if (branch === "channel-order") {
      const c = randChoice(rng, CHANNELS);
      const chain: string[] = [...c.chain];
      const orderedIds = chain.map((_, i) => `n${i}`);
      const items = shuffle(rng, chain.map((label, i) => ({ id: `n${i}`, label })));
      return {
        kind: "ordering",
        prompt: `Arrange the ${c.label.toLowerCase()} in the correct order goods travel through, from producer to final consumer.`,
        instruction: "Click them in order.",
        items,
        correctOrder: orderedIds,
        hint: `A ${c.label.toLowerCase()} moves goods through ${chain.length} stage${chain.length > 1 ? "s" : ""}.`,
        explanation: `${c.label}: ${chain.join(" → ")}.`,
      };
    }

    if (branch === "ethics-sort") {
      const chosen = shuffle(rng, ETHICS_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: ETHICS_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `e${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`e${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each distribution practice into ethical or unethical.",
        items,
        buckets,
        correctBucket,
        hint: "Ethical distribution is fair, honest, and reliable; unethical distribution manipulates supply or deceives others.",
        explanation: chosen.map((c) => `"${c.text}" — ${ETHICS_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "hoarding-scenario") {
      const correct = "Hoarding — deliberately withholding stock to create an artificial shortage and force prices up";
      const others = [
        "Branding — giving a product a recognisable name and image",
        "Bulk-breaking — dividing large quantities into smaller ones for resale",
        "Warehousing — storing goods safely until they are needed",
      ];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "During a shortage, a trader deliberately withholds stock from the market, planning to sell it later at a much higher price. What is this unethical practice called?",
        choices,
        correctIndex,
        hint: "The trader is creating a shortage on purpose, not by accident.",
        explanation: `This is called ${correct.split(" — ")[0].toLowerCase()}: ${correct.split(" — ")[1]}. It is unethical because it artificially harms consumers to increase profit.`,
      };
    }

    // recall
    const i = randChoice(rng, INTERMEDIARIES);
    return {
      kind: "fill-blank",
      prompt: `An intermediary's role is described as: "${i.role.toLowerCase()}."`,
      before: "This intermediary is called a",
      after: ".",
      correctAnswer: i.label,
      acceptedAnswers: [i.id],
      inputMode: "text",
      hint: "Think about whether they own the goods, or just connect other people.",
      explanation: `${i.label}: ${i.role}.`,
    };
  },
};
