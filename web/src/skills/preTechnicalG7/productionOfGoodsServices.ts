import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const GOODS_SERVICES_ITEMS = [
  { text: "A finished school uniform for sale", bucket: "goods" },
  { text: "A loaf of bread", bucket: "goods" },
  { text: "A chair made by a carpenter", bucket: "goods" },
  { text: "A bag of maize flour", bucket: "goods" },
  { text: "A pair of shoes on a shop shelf", bucket: "goods" },
  { text: "A mobile phone charger", bucket: "goods" },
  { text: "A tailor sewing a school uniform for a customer", bucket: "services" },
  { text: "A matatu ride from town to home", bucket: "services" },
  { text: "A haircut at a barber shop", bucket: "services" },
  { text: "Sending money through a mobile money agent", bucket: "services" },
  { text: "A doctor examining a patient at a clinic", bucket: "services" },
  { text: "A mechanic repairing a car engine", bucket: "services" },
] as const;

const FACTORS = [
  { id: "land", label: "Land", example: "A farm, quarry, or forest used to produce raw materials", reward: "Rent" },
  { id: "labour", label: "Labour", example: "Workers and skilled artisans who do the work", reward: "Wages/Salary" },
  { id: "capital", label: "Capital", example: "Machines, tools and money invested in the business", reward: "Interest" },
  { id: "entrepreneurship", label: "Entrepreneurship", example: "The person who organises the other factors and takes the risk", reward: "Profit" },
] as const;

const ETHICAL_ITEMS = [
  { text: "Paying workers a fair, agreed wage on time", bucket: "ethical" },
  { text: "Using correctly calibrated weighing scales when selling goods", bucket: "ethical" },
  { text: "Following safety regulations to protect workers", bucket: "ethical" },
  { text: "Giving customers accurate information about a product", bucket: "ethical" },
  { text: "Properly treating factory waste before releasing it", bucket: "ethical" },
  { text: "Dumping factory waste into a river", bucket: "unethical" },
  { text: "Advertising false information about a product", bucket: "unethical" },
  { text: "Employing children instead of adults to cut costs", bucket: "unethical" },
  { text: "Using rigged weighing scales to overcharge customers", bucket: "unethical" },
  { text: "Ignoring safety regulations to save money on equipment", bucket: "unethical" },
] as const;

const BENEFIT_QUESTIONS = [
  {
    prompt: "Which of these is a benefit of production to the community?",
    correct: "It creates employment opportunities for community members",
    wrong: ["It always makes goods more expensive for everyone", "It removes the need for any raw materials", "It only benefits the entrepreneur, never the workers"],
    explanation: "Production creates jobs, provides goods and services people need, and generates income that raises living standards in the community.",
  },
  {
    prompt: "How does production contribute to a community's economic development?",
    correct: "It generates income and provides goods and services the community needs",
    wrong: ["It has no real effect on the local economy", "It only matters for large multinational companies", "It reduces the total number of goods available"],
    explanation: "Production generates income for workers and entrepreneurs and supplies the goods and services a community needs, supporting economic development.",
  },
  {
    prompt: "A new furniture workshop opens in a village and starts buying timber from local sawmills. What benefit does this bring to the sawmills?",
    correct: "It creates a reliable market for the sawmills' timber, generating income for them too",
    wrong: ["It forces the sawmills to close down", "It has no effect on the sawmills at all", "It only benefits the furniture workshop, not its suppliers"],
    explanation: "Production activities often create demand for other local businesses' raw materials, spreading economic benefit beyond just the one business.",
  },
  {
    prompt: "Why might a local government encourage new production businesses to set up in its area?",
    correct: "They create jobs and generate tax revenue that can fund local services",
    wrong: ["They always increase pollution with no benefit", "They have no effect on local government revenue", "They reduce the number of goods available to residents"],
    explanation: "New production businesses employ local people and generate tax revenue, which can help fund roads, schools and other local services.",
  },
  {
    prompt: "How does production help reduce a community's dependence on goods brought in from elsewhere?",
    correct: "Local production can supply goods the community needs without relying entirely on imports from other areas",
    wrong: ["It has no effect on where goods come from", "It always increases the need to import goods", "It only affects services, never physical goods"],
    explanation: "When a community produces its own goods locally, it relies less on goods transported from elsewhere, which can also reduce costs and delays.",
  },
] as const;

const PRODUCTION_JOBS = [
  { label: "Furniture workshop", value: 14 },
  { label: "Bakery", value: 9 },
  { label: "Tailoring business", value: 11 },
  { label: "Welding workshop", value: 7 },
] as const;

const PRODUCTION_STAGES = [
  { id: "raw-material", label: "Obtain the raw material (land)" },
  { id: "make", label: "Use labour and tools (capital) to make the product" },
  { id: "organise", label: "The entrepreneur organises the process and takes it to market" },
  { id: "sell", label: "The finished good or service is sold to a customer" },
] as const;

export const productionOfGoodsServices: Skill = {
  id: "g7-pt-tp-production-of-goods-and-services",
  code: "TP.2",
  subjectId: "pre-technical",
  strandId: "g7-pt-tools",
  grade: 7,
  title: "Production of goods and services",
  description: "Distinguishing goods from services, the factors of production and their rewards, ethical and unethical practices in production, and the benefits of production to a community.",
  generate(rng) {
    const branch = randChoice(rng, ["goods-services-sort", "factor-reward", "factor-example", "ethical-sort", "benefit", "chart-read", "fill-reward", "stage-order"] as const);

    if (branch === "goods-services-sort") {
      const chosen = shuffle(rng, GOODS_SERVICES_ITEMS).slice(0, 6);
      const items = chosen.map((g, i) => ({ id: `g${i}`, label: g.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((g, i) => (correctBucket[`g${i}`] = g.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each example as a good or a service.",
        items,
        buckets: [
          { id: "goods", label: "Goods" },
          { id: "services", label: "Services" },
        ],
        correctBucket,
        hint: "A good is a physical, tangible product; a service is an action performed for someone.",
        explanation: chosen.map((g) => `"${g.text}" is an example of a ${g.bucket === "goods" ? "good" : "service"}.`).join(" "),
      };
    }

    if (branch === "factor-reward") {
      const tokens = shuffle(rng, FACTORS.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FACTORS.map((f) => ({ id: f.id, label: f.reward })));
      const correctMap: Record<string, string> = {};
      for (const f of FACTORS) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: "Match each factor of production to the reward paid for it.",
        tokens,
        targets,
        correctMap,
        hint: "Land earns rent, labour earns wages, capital earns interest, entrepreneurship earns profit.",
        explanation: FACTORS.map((f) => `${f.label} — ${f.reward}.`).join(" "),
      };
    }

    if (branch === "factor-example") {
      const tokens = shuffle(rng, FACTORS.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FACTORS.map((f) => ({ id: f.id, label: f.example })));
      const correctMap: Record<string, string> = {};
      for (const f of FACTORS) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: "Match each factor of production to an example of it.",
        tokens,
        targets,
        correctMap,
        hint: "Think about natural resources, workers, money/machines, and the organiser of the business.",
        explanation: FACTORS.map((f) => `${f.label} — ${f.example}.`).join(" "),
      };
    }

    if (branch === "ethical-sort") {
      const chosen = shuffle(rng, ETHICAL_ITEMS);
      const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => (correctBucket[`e${i}`] = e.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each practice as ethical or unethical in the production of goods and services.",
        items,
        buckets: [
          { id: "ethical", label: "Ethical" },
          { id: "unethical", label: "Unethical" },
        ],
        correctBucket,
        hint: "Ethical practices are fair and honest; unethical practices exploit people or harm the environment.",
        explanation: chosen.map((e) => `"${e.text}" is an ${e.bucket} practice.`).join(" "),
      };
    }

    if (branch === "benefit") {
      const q = randChoice(rng, BENEFIT_QUESTIONS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        explanation: q.explanation,
      };
    }

    if (branch === "chart-read") {
      const data = shuffle(rng, PRODUCTION_JOBS);
      const top = [...data].sort((a, b) => b.value - a.value)[0];
      const choices = shuffle(rng, data.map((d) => d.label));
      return {
        kind: "multiple-choice",
        prompt: "This chart shows the number of jobs created by four production activities in a community. Which activity created the most jobs?",
        visual: { type: "bar-chart", data },
        choices,
        correctIndex: choices.indexOf(top.label),
        layout: "list",
        explanation: `${top.label} created the most jobs (${top.value}), shown by the tallest bar — this is one of the benefits production brings to a community.`,
      };
    }

    if (branch === "fill-reward") {
      const f = randChoice(rng, FACTORS);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence.",
        before: `The reward paid to the factor of production called ${f.label.toLowerCase()} is `,
        after: ".",
        correctAnswer: f.reward.toLowerCase(),
        acceptedAnswers: [f.reward, f.reward.toLowerCase(), ...f.reward.toLowerCase().split("/")],
        inputMode: "text",
        hint: "Land, labour, capital and entrepreneurship each earn a different type of reward.",
        explanation: `${f.label} earns ${f.reward} as its reward.`,
      };
    }

    const shuffled = shuffle(rng, PRODUCTION_STAGES);
    return {
      kind: "ordering",
      prompt: "Arrange the stages of producing and selling a wooden stool, from first to last.",
      items: shuffled.map((s) => ({ id: s.id, label: s.label })),
      correctOrder: PRODUCTION_STAGES.map((s) => s.id),
      instruction: "Drag to arrange from first to last.",
      hint: "Start with the raw material, then the making process, then organising, then selling.",
      explanation: `The correct order is: ${PRODUCTION_STAGES.map((s) => s.label).join("; ")}.`,
    };
  },
};
