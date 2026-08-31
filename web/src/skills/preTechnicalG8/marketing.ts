import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const TOOLS = [
  { id: "advertising", label: "Advertising", does: "Creates broad public awareness of a product through radio, TV, posters, or social media" },
  { id: "branding", label: "Branding and packaging", does: "Gives a product a recognisable name, look, and image that customers learn to trust" },
  { id: "promotion", label: "Sales promotion", does: "Offers a temporary incentive, such as a discount, to boost short-term sales" },
  { id: "personal-selling", label: "Personal selling", does: "Persuades a customer directly, one-on-one, face to face" },
] as const;

const INFO_SOURCES = [
  { text: "Asking existing customers to fill in a feedback survey", bucket: "source" },
  { text: "Observing what competitors are selling and at what price", bucket: "source" },
  { text: "Reading a published market research report", bucket: "source" },
  { text: "Watching trending topics and comments on social media", bucket: "source" },
  { text: "Guessing what customers want without checking anything", bucket: "not-source" },
  { text: "Copying a rival's prices without finding out why they set them", bucket: "not-source" },
] as const;

const INFO_LABEL: Record<string, string> = { source: "A genuine source of market information", "not-source": "Not a reliable source of market information" };

const MARKET_SCENARIOS = [
  { text: "A trader wants to sell goods in a village that is 40 km away, reached only by a poorly maintained dirt road", factor: "The type and quality of roads" },
  { text: "A trader is choosing between two towns, and one has far more reliable phone and internet coverage for taking orders", factor: "Communication networks" },
  { text: "A trader's delivery truck frequently breaks down on the way to a distant market", factor: "The quality of vehicles available" },
] as const;

const IMPORTANCE_REASONS = [
  "Helps a business identify what its customers actually need and want",
  "Creates awareness so potential customers know a product or service exists",
  "Helps a business set a price that customers are willing to pay",
  "Builds long-term customer loyalty and repeat business",
];

export const marketing: Skill = {
  id: "g8-pt-e-marketing",
  code: "E.3",
  subjectId: "pre-technical",
  strandId: "g8-pt-entrepreneurship",
  grade: 8,
  title: "Marketing of Goods and Services",
  description: "The importance of marketing, sources of market information, factors for selecting a suitable market, and tools used to market goods and services.",
  generate(rng) {
    const branch = randChoice(rng, ["tool-match", "source-sort", "market-factor", "recall", "importance"] as const);

    if (branch === "tool-match") {
      const tokens = shuffle(rng, TOOLS.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, TOOLS.map((t) => ({ id: t.id, label: t.does })));
      const correctMap: Record<string, string> = {};
      for (const t of TOOLS) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: "Match each marketing tool to what it does for a business.",
        tokens,
        targets,
        correctMap,
        hint: "Some tools build awareness broadly, others persuade or reward a customer directly.",
        explanation: TOOLS.map((t) => `${t.label}: ${t.does}.`).join(" "),
      };
    }

    if (branch === "source-sort") {
      const chosen = shuffle(rng, INFO_SOURCES);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: INFO_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each action into whether it is a genuine source of market information, or not.",
        items,
        buckets,
        correctBucket,
        hint: "A genuine source gathers real information about customers or competitors, rather than guessing or blindly copying.",
        explanation: chosen.map((c) => `"${c.text}" — ${INFO_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "market-factor") {
      const s = randChoice(rng, MARKET_SCENARIOS);
      const others = MARKET_SCENARIOS.filter((x) => x.factor !== s.factor).map((x) => x.factor);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, s.factor, others, 2);
      return {
        kind: "multiple-choice",
        prompt: `${s.text}. Which factor for selecting a suitable market is being described here?`,
        choices,
        correctIndex,
        hint: "Think about what specific condition is making this market easier or harder to reach.",
        explanation: `${s.factor} is a key factor when choosing a suitable market for goods and services.`,
      };
    }

    if (branch === "recall") {
      const t = randChoice(rng, TOOLS);
      return {
        kind: "fill-blank",
        prompt: `A marketing tool is described as: "${t.does.toLowerCase()}."`,
        before: "This marketing tool is",
        after: ".",
        correctAnswer: t.label,
        acceptedAnswers: [t.id.replace("-", " ")],
        inputMode: "text",
        hint: "Think about whether this reaches many people at once, or persuades one person directly.",
        explanation: `${t.label}: ${t.does}.`,
      };
    }

    // importance
    const correct = randChoice(rng, IMPORTANCE_REASONS);
    const others = IMPORTANCE_REASONS.filter((r) => r !== correct);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
    return {
      kind: "multiple-choice",
      prompt: "Which of these is a genuine reason why marketing is important to a business?",
      choices,
      correctIndex,
      hint: "Marketing connects a business to its customers, from awareness through to loyalty.",
      explanation: `${correct} — this is one of the key reasons marketing matters to a business.`,
    };
  },
};
