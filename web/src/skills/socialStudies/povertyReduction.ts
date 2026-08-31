import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ITEMS: { text: string; bucket: "cause" | "strategy"; why: string }[] = [
  { text: "Over-reliance on rain-fed agriculture", bucket: "cause", why: "a single failed rainy season can destroy a family's entire income for the year" },
  { text: "High unemployment", bucket: "cause", why: "without jobs, households have no reliable income to meet basic needs" },
  { text: "Overexploitation of natural resources", bucket: "cause", why: "depleting resources today leaves less income potential for the future" },
  { text: "Poor infrastructure limiting access to markets", bucket: "cause", why: "producers cannot sell goods profitably if roads and transport are unreliable" },
  { text: "Corruption diverting public resources", bucket: "cause", why: "funds meant for public services never reach the people who need them" },
  { text: "Investing in education and skills training", bucket: "strategy", why: "it builds skills that open up better job and income opportunities" },
  { text: "Supporting entrepreneurship and small businesses", bucket: "strategy", why: "it helps people create their own income instead of depending only on formal jobs" },
  { text: "Diversifying farming methods and crops", bucket: "strategy", why: "it reduces the risk of losing all income if one crop or method fails" },
  { text: "Government cash-transfer programmes for vulnerable groups", bucket: "strategy", why: "it gives vulnerable households a direct, reliable source of income" },
  { text: "Improving roads and infrastructure to connect markets", bucket: "strategy", why: "it lets producers reach buyers and sell their goods at fair prices" },
];

const REDUCTION_STEPS = [
  { id: "identify", label: "Identify the specific local cause of poverty in the community" },
  { id: "design", label: "Design an intervention suited to that specific cause" },
  { id: "mobilise", label: "Mobilise resources, partners, and community support" },
  { id: "implement", label: "Implement the poverty-reduction strategy" },
  { id: "evaluate", label: "Monitor and evaluate the strategy's impact over time" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The state of lacking enough income or resources to meet basic needs is called ", after: ".", correctAnswer: "poverty", accepted: ["poverty"], explanation: "Poverty is the state of lacking enough income or resources to meet basic needs." },
  { before: "Starting and running your own small business or venture is called ", after: ".", correctAnswer: "entrepreneurship", accepted: ["entrepreneurship"], explanation: "Entrepreneurship is starting and running your own business or venture, a key strategy for reducing poverty." },
  { before: "Growing a variety of crops or income sources, instead of relying on just one, is called ", after: ".", correctAnswer: "diversification", accepted: ["diversification"], explanation: "Diversification means relying on a variety of crops or income sources, reducing the risk of losing everything if one fails." },
  { before: "Money given directly by the government to vulnerable households is called a cash ", after: ".", correctAnswer: "transfer", accepted: ["transfer"], explanation: "A cash transfer is money given directly by the government to vulnerable households to support their income." },
  { before: "Roads, water, and power systems that support economic activity are called ", after: ".", correctAnswer: "infrastructure", accepted: ["infrastructure"], explanation: "Infrastructure (roads, water, power) supports economic activity and helps connect producers to markets." },
] as const;

const QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "How does overexploitation of natural resources contribute to poverty in Africa?",
    choices: ["It depletes resources future generations could have relied on for income", "It always increases short-term wealth with no downside", "It has no link to poverty at all", "It only affects wildlife, not people"],
    correctIndex: 0,
    explanation: "Overexploiting resources like forests, fish stocks, or soil can bring short-term gain but leaves less for the future, deepening long-term poverty.",
  },
  {
    prompt: "Why is education considered an important strategy for reducing poverty?",
    choices: ["It builds skills that open up better job and income opportunities", "It guarantees instant wealth for every learner", "It replaces the need for any government support", "It only benefits people living in cities"],
    correctIndex: 0,
    explanation: "Education equips people with knowledge and skills that improve their chances of getting better-paying work or starting a business.",
  },
];

export const povertyReduction: Skill = {
  id: "ss-pr-poverty-reduction",
  code: "PR.3",
  subjectId: "social-studies",
  strandId: "ss-pr",
  grade: 9,
  title: "Poverty reduction",
  description: "Causes of poverty in Africa and strategies used to reduce it.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "why", "match", "fill-blank", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, ITEMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((it, i) => ({ id: `w${i}`, label: it.text })));
      const targets = shuffle(rng, chosen.map((it, i) => ({ id: `w${i}`, label: it.why.charAt(0).toUpperCase() + it.why.slice(1) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((it, i) => (correctMap[`w${i}`] = `w${i}`));
      return {
        kind: "click-match",
        prompt: "Match each cause or strategy to why it affects poverty the way it does.",
        tokens,
        targets,
        correctMap,
        hint: "Think about how each factor affects a household's income and ability to meet its needs.",
        explanation: chosen.map((it) => `"${it.text}" — ${it.why}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about poverty reduction.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe poverty and strategies to reduce it.",
        explanation: fb.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, REDUCTION_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps of a community poverty-reduction initiative, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: REDUCTION_STEPS.map((s) => s.id),
        hint: "You must understand the specific cause before designing, mobilising, implementing, and finally evaluating a response.",
        explanation: REDUCTION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, ITEMS).slice(0, 6);
      const items = chosen.map((it, i) => ({ id: `i${i}`, label: it.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((it, i) => (correctBucket[`i${i}`] = it.bucket));

      return {
        kind: "categorize",
        prompt: "Sort each statement: is it a cause of poverty, or a strategy to reduce it?",
        items,
        buckets: [
          { id: "cause", label: "Cause of poverty" },
          { id: "strategy", label: "Poverty reduction strategy" },
        ],
        correctBucket,
        hint: "Causes make poverty worse; strategies are deliberate actions taken to fight it.",
        explanation: chosen.map((it) => `"${it.text}" is a ${it.bucket === "cause" ? "cause of poverty" : "poverty reduction strategy"}.`).join(" "),
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about how each factor affects household income and long-term opportunity.",
      explanation: q.explanation,
    };
  },
};
