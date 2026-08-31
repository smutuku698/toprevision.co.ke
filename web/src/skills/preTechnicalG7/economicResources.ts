import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const RESOURCE_EXAMPLES = [
  { text: "Gold deposits mined in Migori", bucket: "natural" },
  { text: "Soda ash extracted at Lake Magadi", bucket: "natural" },
  { text: "Forests in the Mau", bucket: "natural" },
  { text: "Fresh water from Lake Victoria", bucket: "natural" },
  { text: "Titanium deposits mined in Kwale", bucket: "natural" },
  { text: "Skilled carpenters working in a workshop", bucket: "human" },
  { text: "Trained fishermen on Lake Turkana", bucket: "human" },
  { text: "Experienced tea pickers on a Kericho estate", bucket: "human" },
  { text: "Money invested to start a small business", bucket: "capital" },
  { text: "Machinery used in a factory", bucket: "capital" },
  { text: "A delivery truck owned by a business", bucket: "capital" },
] as const;

const RESOURCE_LABELS: Record<string, string> = {
  natural: "Natural resource",
  human: "Human resource",
  capital: "Capital resource",
};

const SUSTAINABLE_MATCH = [
  { resource: "Forests", practice: "Afforestation and controlled logging" },
  { resource: "Water", practice: "Rainwater harvesting and avoiding pollution of rivers and lakes" },
  { resource: "Minerals", practice: "Controlled, licensed mining to avoid depleting the resource" },
  { resource: "Soil", practice: "Terracing and crop rotation to prevent erosion" },
] as const;

// Only 5 templates, not 10+: Kenya's economic-resources sub-strand names a small, fixed
// set of real named mineral resources (iron ore, copper, gold, limestone, gypsum, titanium)
// — every genuine metallic/non-metallic fact this content actually supports is used below,
// rather than padding with invented or non-Kenyan resources (RIGOR-STANDARDS.md pool-size
// floor: "drop/limit the branch rather than ship an artificially padded one").
const METALLIC_QUESTIONS = [
  {
    prompt: "Which of these Kenyan economic resources is a metallic material?",
    correct: "Iron ore deposits",
    wrong: ["Limestone used for making cement", "Timber harvested from a forest", "Clay used for making bricks"],
    material: "aluminium" as const,
    explanation: "Iron ore is a metallic material, while limestone, timber and clay are non-metallic economic resources.",
  },
  {
    prompt: "Which of these Kenyan economic resources is a non-metallic material?",
    correct: "Limestone quarried for making cement",
    wrong: ["Copper deposits", "Iron ore deposits", "Gold deposits"],
    material: "stone" as const,
    explanation: "Limestone is a non-metallic material, while copper, iron ore and gold are metallic economic resources.",
  },
  {
    prompt: "Which of these Kenyan economic resources is a metallic material?",
    correct: "Titanium deposits mined in Kwale",
    wrong: ["Gypsum used for making plaster", "Diatomite mined near Lake Naivasha", "Soda ash from Lake Magadi"],
    material: "steel" as const,
    explanation: "Titanium is a metallic material, while gypsum, diatomite and soda ash are non-metallic economic resources.",
  },
  {
    prompt: "Which of these Kenyan economic resources is a metallic material?",
    correct: "Copper deposits",
    wrong: ["Gold jewellery-grade sand", "Building sand from a river bed", "Clay used for making bricks"],
    material: "copper" as const,
    explanation: "Copper is a metallic material. Sand and clay, though also mined resources, are non-metallic materials.",
  },
  {
    prompt: "Which of these Kenyan economic resources is a non-metallic material?",
    correct: "Gypsum mined near Kajiado",
    wrong: ["Iron ore deposits", "Titanium deposits", "Copper deposits"],
    material: "stone" as const,
    explanation: "Gypsum is a non-metallic material, while iron ore, titanium and copper are metallic economic resources.",
  },
] as const;

// Expanded from 1 to 5 distinct definitional questions (rule 1: no branch may return a single
// hardcoded template with zero rng-driven variation) — one per resource class plus sustainability.
const CHARACTERISTIC_QUESTIONS = [
  {
    prompt: "Which of these best describes an 'economic resource'?",
    correct: "Anything with economic value that can be used to produce goods or services",
    wrong: ["Only money kept in a bank account", "Only items that can be eaten", "Only resources found outside Kenya"],
    explanation: "An economic resource is anything with economic value — natural, human or capital — that can be used to produce goods or services.",
  },
  {
    prompt: "Which of these best describes a 'natural resource'?",
    correct: "A resource that occurs in nature, such as forests, water or minerals",
    wrong: ["A resource that is only found inside a factory", "A resource that is always a sum of money", "A resource that only skilled workers can create"],
    explanation: "A natural resource occurs in nature itself — such as forests, water and minerals — without people having to create it.",
  },
  {
    prompt: "Which of these best describes a 'human resource'?",
    correct: "People's skills, knowledge and labour used to produce goods or services",
    wrong: ["Money invested in a business", "Machinery used in a factory", "Minerals mined from the ground"],
    explanation: "A human resource is the skills, knowledge and labour that people contribute to producing goods or services — not money or machinery.",
  },
  {
    prompt: "Which of these best describes a 'capital resource'?",
    correct: "Money, machinery and tools used to produce goods or services",
    wrong: ["A person's skills and labour", "A forest or a river", "A finished product ready for sale"],
    explanation: "A capital resource is money, machinery and tools invested to help produce goods or services — not the workers themselves or the finished product.",
  },
  {
    prompt: "Which of these best explains why economic resources should be used sustainably?",
    correct: "So that they remain available for future generations, not only used up now",
    wrong: ["So that they can be sold at a higher price today", "Because sustainable use is required only for capital resources", "Because natural resources never run out on their own"],
    explanation: "Using economic resources sustainably means using them today without destroying or exhausting them for future generations.",
  },
  {
    prompt: "A gold mine, a team of trained miners, and the trucks used to transport the ore are all present at one mining site. Which resource class does the team of trained miners belong to?",
    correct: "Human resource",
    wrong: ["Natural resource", "Capital resource", "None of the three classes — people are not an economic resource"],
    explanation: "The miners' skills and labour are a human resource. The gold itself is a natural resource, and the trucks are a capital resource.",
  },
  {
    prompt: "A gold mine, a team of trained miners, and the trucks used to transport the ore are all present at one mining site. Which resource class do the transport trucks belong to?",
    correct: "Capital resource",
    wrong: ["Natural resource", "Human resource", "None of the three classes — machinery is not an economic resource"],
    explanation: "The trucks are tools used to help produce and transport goods, making them a capital resource — not the natural gold deposit or the miners' own labour.",
  },
  {
    prompt: "Which of these correctly explains the difference between a natural resource and a capital resource?",
    correct: "A natural resource occurs in nature on its own; a capital resource is man-made and invested to help production",
    wrong: ["Both are exactly the same thing, just with different names", "A natural resource is always more valuable than a capital resource", "A capital resource always occurs in nature, just like a natural resource"],
    explanation: "Natural resources exist in nature without people creating them, while capital resources — money, machinery, tools — are made and invested by people to help produce goods or services.",
  },
  {
    prompt: "Which of these correctly explains the difference between a human resource and a capital resource?",
    correct: "A human resource is people's own skills and labour; a capital resource is money, machinery or tools they use",
    wrong: ["Both are exactly the same thing, just with different names", "A human resource is always machinery operated by people", "A capital resource always refers to a person's own physical strength"],
    explanation: "A human resource is what people themselves contribute — skills, knowledge, labour — while a capital resource is the money, machinery and tools they use to work.",
  },
] as const;

const FILL_BLANK_TEMPLATES = [
  {
    before: "A resource that occurs naturally, such as forests, water and minerals, is classified as a ",
    after: " resource.",
    correctAnswer: "natural",
    hint: "Think about resources that exist in nature, without people creating them.",
    explanation: "Forests, water and minerals occur naturally, so they are classified as natural resources.",
  },
  {
    before: "People's skills, knowledge and labour used to produce goods or services are called a ",
    after: " resource.",
    correctAnswer: "human",
    hint: "Think about what a worker themselves contributes, not the tools they use.",
    explanation: "Skills, knowledge and labour are what people themselves contribute, making this a human resource.",
  },
  {
    before: "Money, machinery and tools invested to produce goods or services are called a ",
    after: " resource.",
    correctAnswer: "capital",
    hint: "Think about what a business invests in, rather than what it finds in nature.",
    explanation: "Money, machinery and tools are man-made and invested to help production, making this a capital resource.",
  },
  {
    before: "Gold, soda ash and fresh water are all Kenyan examples of ",
    after: " resources.",
    correctAnswer: "natural",
    hint: "None of these three are made by people — they occur in nature.",
    explanation: "Gold, soda ash and fresh water all occur in nature, so they are natural resources.",
  },
  {
    before: "Skilled carpenters and trained fishermen are examples of a ",
    after: " resource.",
    correctAnswer: "human",
    hint: "Think about the workers' own skills, not what they use to work.",
    explanation: "Carpenters and fishermen contribute their own skills and labour, making them a human resource.",
  },
  {
    before: "A delivery truck and factory machinery are examples of a ",
    after: " resource.",
    correctAnswer: "capital",
    hint: "Think about tools and equipment a business owns, not the workers or raw materials.",
    explanation: "A delivery truck and factory machinery are tools invested to help production, making them a capital resource.",
  },
  {
    before: "Using a resource today without destroying or exhausting it for future generations is called ",
    after: " use.",
    correctAnswer: "sustainable",
    hint: "Think about the word used to describe conserving a resource for the future.",
    explanation: "Sustainable use means meeting today's needs without exhausting a resource for future generations.",
  },
  {
    before: "Iron ore, copper and titanium deposits are examples of ",
    after: " materials.",
    correctAnswer: "metallic",
    hint: "Think about which of these materials come from metal ores.",
    explanation: "Iron ore, copper and titanium are all metallic materials, unlike stone-based resources such as limestone or gypsum.",
  },
  {
    before: "Limestone, gypsum and clay are examples of ",
    after: " materials.",
    correctAnswer: "non-metallic",
    acceptedAnswers: ["non-metallic", "nonmetallic", "non metallic"],
    hint: "Think about which of these materials do not come from metal ores.",
    explanation: "Limestone, gypsum and clay are non-metallic materials, unlike ore-based resources such as iron or copper.",
  },
  {
    before: "Planting new trees to replace those that have been cut down is called ",
    after: ".",
    correctAnswer: "afforestation",
    hint: "Think about the term for planting trees to restore a forest.",
    explanation: "Afforestation — planting new trees — is a sustainable practice that helps forests recover after logging.",
  },
] as const;

const STEWARDSHIP_STEPS = [
  { id: "identify", label: "Identify a resource that is being overused" },
  { id: "plan", label: "Plan a conservation measure to protect it" },
  { id: "implement", label: "Implement the measure, such as planting trees" },
  { id: "monitor", label: "Monitor the results and adjust the plan if needed" },
] as const;

export const economicResources: Skill = {
  id: "g7-pt-mat-economic-resources",
  code: "MAT.1",
  subjectId: "pre-technical",
  strandId: "g7-pt-materials",
  grade: 7,
  title: "Economic resources",
  description: "Classifying economic resources in Kenya as natural, human, or capital resources; distinguishing metallic from non-metallic materials as economic resources; and sustainable ways of using economic resources.",
  generate(rng) {
    const branch = randChoice(rng, ["resource-sort", "sustainable-match", "metallic-check", "characteristic", "fill-natural", "stewardship-order"] as const);

    if (branch === "resource-sort") {
      const chosen = shuffle(rng, RESOURCE_EXAMPLES).slice(0, 6);
      const items = chosen.map((r, i) => ({ id: `r${i}`, label: r.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((r, i) => (correctBucket[`r${i}`] = r.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each example into the class of economic resource it belongs to.",
        items,
        buckets: [
          { id: "natural", label: "Natural resource" },
          { id: "human", label: "Human resource" },
          { id: "capital", label: "Capital resource" },
        ],
        correctBucket,
        hint: "Natural resources occur in nature, human resources are people's skills and labour, capital resources are money, machines and tools.",
        explanation: chosen.map((r) => `"${r.text}" is a ${RESOURCE_LABELS[r.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "sustainable-match") {
      const tokens = shuffle(rng, SUSTAINABLE_MATCH.map((s) => ({ id: s.resource, label: s.resource })));
      const targets = shuffle(rng, SUSTAINABLE_MATCH.map((s) => ({ id: s.resource, label: s.practice })));
      const correctMap: Record<string, string> = {};
      for (const s of SUSTAINABLE_MATCH) correctMap[s.resource] = s.resource;
      return {
        kind: "click-match",
        prompt: "Match each economic resource to a sustainable way of using it.",
        tokens,
        targets,
        correctMap,
        hint: "Sustainable use means using a resource today without destroying it for future generations.",
        explanation: SUSTAINABLE_MATCH.map((s) => `${s.resource} — ${s.practice}.`).join(" "),
      };
    }

    if (branch === "metallic-check") {
      const q = randChoice(rng, METALLIC_QUESTIONS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        visual: { type: "material-swatch", material: q.material },
        choices,
        correctIndex,
        layout: "list",
        explanation: q.explanation,
      };
    }

    if (branch === "characteristic") {
      const q = randChoice(rng, CHARACTERISTIC_QUESTIONS);
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

    if (branch === "fill-natural") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: "acceptedAnswers" in fb ? [...fb.acceptedAnswers] : [fb.correctAnswer],
        inputMode: "text",
        hint: fb.hint,
        explanation: fb.explanation,
      };
    }

    const shuffled = shuffle(rng, STEWARDSHIP_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the steps of managing an economic resource sustainably, from first to last.",
      items: shuffled.map((s) => ({ id: s.id, label: s.label })),
      correctOrder: STEWARDSHIP_STEPS.map((s) => s.id),
      instruction: "Drag to arrange from first to last.",
      hint: "Spot the problem first, then plan, then act, then check the results.",
      explanation: `The correct order is: ${STEWARDSHIP_STEPS.map((s) => s.label).join("; ")}.`,
    };
  },
};
