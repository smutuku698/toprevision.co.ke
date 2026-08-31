import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const QUALITY_QUESTIONS = [
  {
    prompt: "Which of these is a quality of a successful entrepreneur?",
    correct: "Being willing to take calculated risks",
    wrong: ["Avoiding every kind of risk", "Giving up as soon as a plan fails once", "Refusing to listen to customer feedback"],
    explanation: "Successful entrepreneurs are willing to take calculated risks, rather than avoiding all risk or giving up easily.",
  },
  {
    prompt: "Which of these best describes a persistent entrepreneur?",
    correct: "Someone who keeps working towards their goal even after early setbacks",
    wrong: ["Someone who stops as soon as things get difficult", "Someone who never plans ahead", "Someone who copies every decision a competitor makes"],
    explanation: "Persistence means continuing to work towards a goal even after facing setbacks, an important quality for entrepreneurs.",
  },
  {
    prompt: "Which of these best describes creativity in an entrepreneur?",
    correct: "Finding new or better ways to solve a problem or meet a customer need",
    wrong: ["Always copying what a competitor already does", "Refusing to ever try anything new", "Only following instructions given by someone else"],
    explanation: "Creativity means finding new or improved ways to solve problems or meet customer needs, rather than only copying or following instructions.",
  },
  {
    prompt: "Which of these shows good leadership as an entrepreneur?",
    correct: "Guiding and motivating workers while making clear, timely decisions",
    wrong: ["Refusing to make any decisions without a committee vote", "Ignoring workers' concerns entirely", "Blaming workers for every problem that arises"],
    explanation: "Good leadership means guiding and motivating a team while making clear decisions — not avoiding decisions or ignoring the people you work with.",
  },
  {
    prompt: "Why is self-confidence an important quality for an entrepreneur?",
    correct: "It helps them make decisions and push through challenges without giving up too easily",
    wrong: ["It guarantees the business will never fail", "It means they never need advice from anyone", "It has no real connection to running a business"],
    explanation: "Self-confidence helps an entrepreneur make decisions and keep going through challenges, though it does not guarantee success or remove the value of seeking advice.",
  },
  {
    prompt: "Which of these best describes a hardworking entrepreneur's approach to their business?",
    correct: "Putting in consistent time and effort, especially during the difficult early stages",
    wrong: ["Working only when they feel like it", "Expecting the business to succeed without much personal effort", "Delegating every task immediately without doing any work themselves"],
    explanation: "Hard work, especially consistent effort during a business's difficult early stages, is a key quality that helps entrepreneurs succeed.",
  },
] as const;

const QUALITY_VS_SOURCE = [
  { text: "Being willing to take calculated risks", bucket: "quality" },
  { text: "Being creative and innovative", bucket: "quality" },
  { text: "Being persistent even after early setbacks", bucket: "quality" },
  { text: "Having good decision-making and leadership skills", bucket: "quality" },
  { text: "Being self-confident", bucket: "quality" },
  { text: "Being hardworking", bucket: "quality" },
  { text: "A gap you notice in the local market", bucket: "source" },
  { text: "A hobby you are skilled at, such as tailoring", bucket: "source" },
  { text: "A problem faced by people in your community", bucket: "source" },
  { text: "A new trend you notice while researching a market", bucket: "source" },
  { text: "A skill you learned from a family member's business", bucket: "source" },
  { text: "An idea inspired by a successful business in another town", bucket: "source" },
] as const;

const SUCCESS_FACTORS = [
  { id: "customer-service", label: "Good customer service", explanation: "Keeps customers returning and builds a good reputation" },
  { id: "planning", label: "Proper planning", explanation: "Helps avoid wasting resources and reduces the risk of failure" },
  { id: "capital", label: "Adequate capital", explanation: "Ensures the business can buy stock and equipment and survive the early months" },
  { id: "market-research", label: "Market research", explanation: "Helps the entrepreneur understand what customers actually want" },
] as const;

const VIABILITY_SCENARIOS = [
  {
    text: "Amina wants to start a business selling ice cream in a village with no electricity for refrigeration and very few customers.",
    correct: "Lack of resources (no refrigeration) and low market demand",
    wrong: ["The colour of the ice cream packaging", "How far the village is from the equator", "The number of letters in the business name"],
  },
  {
    text: "Otieno wants to start a business repairing phones in a busy market where five other phone repair shops already operate.",
    correct: "The high level of competition in that market",
    wrong: ["The cost of a screwdriver set", "How many siblings Otieno has", "The colour of his workshop's walls"],
  },
  {
    text: "Chebet wants to start a poultry business but has only KES 2,000 saved, while chicks, feed and a proper coop would cost about KES 30,000 to start.",
    correct: "Not having enough capital to start the business properly",
    wrong: ["The number of eggs a hen lays per week", "The colour of the chicken coop", "How far the market is from her school"],
  },
  {
    text: "Baraka wants to start a car-washing business at a spot with heavy foot traffic but no reliable water source nearby.",
    correct: "Lack of a key resource (reliable water) needed to actually deliver the service",
    wrong: ["The number of cars that pass by daily", "The price of soap in the shops nearby", "The colour of the buckets he owns"],
  },
  {
    text: "Fatuma wants to sell umbrellas in a region that receives very little rainfall most of the year.",
    correct: "Low demand for the product in that particular market",
    wrong: ["The material the umbrellas are made from", "How many colours the umbrellas come in", "The distance from the supplier's warehouse"],
  },
  {
    text: "Juma wants to start a tailoring business but has no training in sewing and no access to anyone who could teach him.",
    correct: "Lack of the necessary skill to actually produce the goods or service",
    wrong: ["The price of a sewing machine", "The number of customers in the area", "The colour of the shop's signboard"],
  },
] as const;

const PROCESS_STAGES = [
  { id: "identify", label: "Identify a business idea" },
  { id: "evaluate", label: "Evaluate whether the opportunity is viable" },
  { id: "plan", label: "Plan and mobilise resources/capital" },
  { id: "start", label: "Start and run the business, applying good entrepreneurial qualities" },
] as const;

export const introToEntrepreneurship: Skill = {
  id: "g7-pt-ent-introduction-to-entrepreneurship",
  code: "ENT.1",
  subjectId: "pre-technical",
  strandId: "g7-pt-entrepreneurship",
  grade: 7,
  title: "Introduction to entrepreneurship",
  description: "Qualities of an entrepreneur, sources of business ideas, factors for evaluating the viability of a business opportunity, and factors that enhance business success.",
  generate(rng) {
    const branch = randChoice(rng, ["quality-check", "quality-source-sort", "success-match", "process-order", "viability", "fill-entrepreneur"] as const);

    if (branch === "quality-check") {
      const q = randChoice(rng, QUALITY_QUESTIONS);
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

    if (branch === "quality-source-sort") {
      const chosen = shuffle(rng, QUALITY_VS_SOURCE).slice(0, 6);
      const items = chosen.map((q, i) => ({ id: `q${i}`, label: q.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((q, i) => (correctBucket[`q${i}`] = q.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement as a quality of an entrepreneur or a source of a business idea.",
        items,
        buckets: [
          { id: "quality", label: "Quality of an entrepreneur" },
          { id: "source", label: "Source of a business idea" },
        ],
        correctBucket,
        hint: "A quality is a personal trait; a source of an idea is where the idea itself comes from.",
        explanation: chosen.map((q) => `"${q.text}" is a ${q.bucket === "quality" ? "quality of an entrepreneur" : "source of a business idea"}.`).join(" "),
      };
    }

    if (branch === "success-match") {
      const tokens = shuffle(rng, SUCCESS_FACTORS.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, SUCCESS_FACTORS.map((f) => ({ id: f.id, label: f.explanation })));
      const correctMap: Record<string, string> = {};
      for (const f of SUCCESS_FACTORS) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: "Match each factor that enhances business success to why it helps.",
        tokens,
        targets,
        correctMap,
        hint: "Think about customers, planning, money, and understanding the market.",
        explanation: SUCCESS_FACTORS.map((f) => `${f.label} — ${f.explanation}.`).join(" "),
      };
    }

    if (branch === "process-order") {
      const shuffled = shuffle(rng, PROCESS_STAGES);
      return {
        kind: "ordering",
        prompt: "Arrange the general process of starting a business, from first to last.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PROCESS_STAGES.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "You need an idea before you can check if it works, before you can plan, before you can start.",
        explanation: `The correct order is: ${PROCESS_STAGES.map((s) => s.label).join("; ")}.`,
      };
    }

    if (branch === "viability") {
      const s = randChoice(rng, VIABILITY_SCENARIOS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, s.correct, s.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `${s.text} What is the biggest concern about this business idea's viability?`,
        choices,
        correctIndex,
        layout: "list",
        explanation: `${s.correct} is the biggest concern here — a viable business needs both the resources to operate and enough demand or manageable competition.`,
      };
    }

    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: "A person who identifies a business opportunity, organises resources and takes the risk of starting a business is called an ",
      after: ".",
      correctAnswer: "entrepreneur",
      acceptedAnswers: ["entrepreneur"],
      inputMode: "text",
      hint: "This is also the word used to describe the fourth factor of production.",
      explanation: "An entrepreneur identifies an opportunity, organises resources and takes the risk of starting and running a business.",
    };
  },
};
