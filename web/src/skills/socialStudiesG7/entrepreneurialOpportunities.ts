import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const TRAIT_OPPORTUNITY = [
  { trait: "Enjoys talking to strangers and knows a lot about local history and wildlife", opportunity: "Tour guiding" },
  { trait: "Is skilled at weaving, beadwork, or carving traditional items", opportunity: "Cultural heritage crafts" },
  { trait: "Is organised and enjoys planning parties or community events", opportunity: "Event planning" },
  { trait: "Grows surplus vegetables and enjoys negotiating fair prices", opportunity: "Local produce trading" },
  { trait: "Is patient and good at explaining ideas clearly to others", opportunity: "Tutoring younger learners" },
  { trait: "Is creative with a camera and enjoys documenting community events", opportunity: "Photography services" },
  { trait: "Enjoys baking and experimenting with new recipes", opportunity: "Small-scale baking and confectionery" },
  { trait: "Is skilled at repairing bicycles, radios, or small gadgets", opportunity: "Small appliance repair services" },
  { trait: "Enjoys designing and sewing clothes for friends and family", opportunity: "Tailoring and fashion design" },
  { trait: "Is confident online and enjoys creating short videos", opportunity: "Digital content creation and social media services" },
  { trait: "Keeps a well-organised kitchen garden with good yields", opportunity: "Urban kitchen-garden produce sales" },
  { trait: "Is good with numbers and enjoys helping neighbours plan their spending", opportunity: "Basic bookkeeping services for small traders" },
] as const;

const REQUIREMENTS = [
  { text: "Being able to speak confidently and clearly to visitors", bucket: "skill" },
  { text: "Knowing how to keep simple records of income and expenses", bucket: "skill" },
  { text: "Being able to negotiate a fair price with a supplier or customer", bucket: "skill" },
  { text: "Knowing how to plan and organise the steps of a small project", bucket: "skill" },
  { text: "Being patient and persistent even when business is slow", bucket: "attitude" },
  { text: "Being honest and reliable when dealing with customers", bucket: "attitude" },
  { text: "Being willing to take a calculated risk instead of giving up early", bucket: "attitude" },
  { text: "Staying open to learning from mistakes instead of quitting after one", bucket: "attitude" },
  { text: "Having a small amount of starting capital or savings", bucket: "resource" },
  { text: "Having access to raw materials such as beads, wood, or land", bucket: "resource" },
  { text: "Having tools or equipment needed to make or deliver the product", bucket: "resource" },
  { text: "Having a network of people who can be early customers or supporters", bucket: "resource" },
] as const;

const BUCKET_LABEL: Record<string, string> = {
  skill: "A skill needed",
  attitude: "An attitude needed",
  resource: "A resource needed",
};

const KENYAN_PLACES = [
  "Kisumu",
  "Kilifi",
  "Nyeri",
  "Kericho",
  "Machakos",
  "Eldoret",
  "Nakuru",
  "Bungoma",
  "Kitale",
  "Meru",
  "Kajiado",
  "Garissa",
] as const;

const KENYAN_NAMES = [
  "Akinyi",
  "Otieno",
  "Njeri",
  "Kiptoo",
  "Wanjiku",
  "Chebet",
  "Mutua",
  "Fatuma",
  "Barasa",
  "Naliaka",
  "Wekesa",
  "Achieng",
] as const;

function place(rng: RNG) {
  return randChoice(rng, KENYAN_PLACES);
}
function name(rng: RNG) {
  return randChoice(rng, KENYAN_NAMES);
}

const FEASIBILITY_TEMPLATES: ((rng: RNG) => { prompt: string; feasible: boolean })[] = [
  (rng) => {
    const who = name(rng);
    const where = place(rng);
    return {
      prompt: `${who}, who grew up near ${where} and already knows the local history and the fishing community well, is planning a heritage tourism venture taking visitors to cultural sites and Lake Victoria fishing villages nearby. How should this idea be judged?`,
      feasible: true,
    };
  },
  (rng) => {
    const who = name(rng);
    const where = place(rng);
    return {
      prompt: `${who}, who learned carving from an uncle and lives near an area tourists regularly visit close to ${where}, is opening a stall selling handmade souvenirs such as kikoi cloth and carved dhows. How should this idea be judged?`,
      feasible: true,
    };
  },
  (rng) => {
    const who = name(rng);
    const where = place(rng);
    return {
      prompt: `${who} is enthusiastic about starting a tour-guiding business for a mountain near ${where} but has never visited it, and knows nothing about its routes or safety requirements. How should this idea be judged?`,
      feasible: false,
    };
  },
  (rng) => {
    const who = name(rng);
    const where = place(rng);
    return {
      prompt: `${who} is confident about opening an event-planning business in ${where} but has no savings, no written plan, and no experience organising even a small event. How should this idea be judged?`,
      feasible: false,
    };
  },
  (rng) => {
    const who = name(rng);
    const where = place(rng);
    return {
      prompt: `${who}, who keeps a productive kitchen garden and has already sold surplus vegetables informally to neighbours in ${where}, wants to start a small regular produce stall at the local market. How should this idea be judged?`,
      feasible: true,
    };
  },
  (rng) => {
    const who = name(rng);
    const where = place(rng);
    return {
      prompt: `${who} wants to start a large bakery in ${where} immediately, has never baked professionally, has no capital saved, and has not tested whether anyone nearby would buy the products. How should this idea be judged?`,
      feasible: false,
    };
  },
  (rng) => {
    const who = name(rng);
    const where = place(rng);
    return {
      prompt: `${who}, who is skilled at repairing radios and small gadgets and already fixes items informally for neighbours in ${where}, wants to open a small, low-cost repair stall using tools already owned. How should this idea be judged?`,
      feasible: true,
    };
  },
  (rng) => {
    const who = name(rng);
    const where = place(rng);
    return {
      prompt: `${who} wants to start a tailoring business in ${where} but has never sewn a garment, has no sewing machine, and has not asked anyone in the area whether they would need tailoring services. How should this idea be judged?`,
      feasible: false,
    };
  },
  (rng) => {
    const who = name(rng);
    const where = place(rng);
    return {
      prompt: `${who}, who already helps several small traders in ${where} track their income and expenses informally, plans to offer basic bookkeeping services for a small fee. How should this idea be judged?`,
      feasible: true,
    };
  },
  (rng) => {
    const who = name(rng);
    const where = place(rng);
    return {
      prompt: `${who} wants to start a photography business covering weddings in ${where} but owns no camera, has never photographed an event, and has no plan for how to buy equipment. How should this idea be judged?`,
      feasible: false,
    };
  },
  (rng) => {
    const who = name(rng);
    const where = place(rng);
    return {
      prompt: `${who}, who is confident on camera and already posts short videos about local life in ${where} that neighbours enjoy, plans to start offering paid video services for small local businesses. How should this idea be judged?`,
      feasible: true,
    };
  },
  (rng) => {
    const who = name(rng);
    const where = place(rng);
    return {
      prompt: `${who} wants to start a large tour company covering the whole of ${where} county immediately, with no savings, no staff, no vehicle, and no research into who the customers would be. How should this idea be judged?`,
      feasible: false,
    };
  },
];

const FEASIBLE_LABEL = "A feasible entrepreneurial opportunity, matched to the person's real knowledge, skills, and resources";
const NOT_FEASIBLE_LABEL = "A poorly planned entrepreneurial idea that needs more preparation, skills, or resources first";

const ENTREPRENEURSHIP_STATEMENTS = [
  { text: "Identifying a need in society and organising resources, skills, and effort to meet that need for a return", tier: "meaning" },
  { text: "Taking the initiative to start and manage a venture, while accepting the risks and rewards involved", tier: "meaning" },
  { text: "Using creativity and local knowledge to turn an opportunity in the community into a viable enterprise", tier: "meaning" },
  { text: "Waiting for a government job to become available before doing any productive work", tier: "misconception" },
  { text: "Copying a business exactly, without checking whether the same idea fits the local community's needs", tier: "misconception" },
  { text: "Assuming that having a good idea alone, without any planning, guarantees business success", tier: "misconception" },
  { text: "Testing a small version of an idea first to learn what customers actually want before expanding it", tier: "meaning" },
  { text: "Continuing to run a business exactly the same way even after it is clearly losing money", tier: "misconception" },
  { text: "Reinvesting some of the profit back into the venture to help it grow steadily over time", tier: "meaning" },
  { text: "Believing that starting a business requires no risk at all if the idea feels exciting enough", tier: "misconception" },
] as const;
const ENTREPRENEURSHIP_MEANINGS = ENTREPRENEURSHIP_STATEMENTS.filter((s) => s.tier === "meaning").map((s) => s.text);
const ENTREPRENEURSHIP_MISCONCEPTIONS = ENTREPRENEURSHIP_STATEMENTS.filter((s) => s.tier === "misconception").map((s) => s.text);

const FEASIBILITY_STEPS = [
  { id: "need", label: "Identify a real need or gap in the local community" },
  { id: "assess", label: "Assess the skills, knowledge, and resources you actually have" },
  { id: "cost", label: "Estimate the costs involved and who would realistically be your customers" },
  { id: "start", label: "Start small, test the idea, and adjust it based on what you learn" },
] as const;

const FILL_BLANK_TEMPLATES = [
  {
    before: "A person who identifies a need and organises resources to start and manage a venture is called an ",
    after: ".",
    correctAnswer: "entrepreneur",
    accepted: ["entrepreneur"],
    explanation: "An entrepreneur identifies a need in society and organises resources, skills, and effort to meet it.",
  },
  {
    before: "The process of starting and managing a venture while accepting its risks and rewards is called ",
    after: ".",
    correctAnswer: "entrepreneurship",
    accepted: ["entrepreneurship"],
    explanation: "Entrepreneurship is the process of identifying an opportunity and organising resources to build a venture around it.",
  },
  {
    before: "Checking whether a business idea is realistic, given the skills, resources, and demand available, is called checking its ",
    after: ".",
    correctAnswer: "feasibility",
    accepted: ["feasibility"],
    explanation: "Feasibility is whether a business idea is realistically achievable, given the skills, resources, and demand that actually exist.",
  },
  {
    before: "Money set aside or borrowed to start a business is called starting ",
    after: ".",
    correctAnswer: "capital",
    accepted: ["capital"],
    explanation: "Capital is the money needed to start and run a venture, such as buying raw materials or tools.",
  },
  {
    before: "The group of people who might realistically buy a product or service is called the ",
    after: ".",
    correctAnswer: "market",
    accepted: ["market", "target market"],
    explanation: "The market is made up of the people who might realistically want and buy what a venture offers.",
  },
  {
    before: "The money left over after all business costs are subtracted from sales is called ",
    after: ".",
    correctAnswer: "profit",
    accepted: ["profit"],
    explanation: "Profit is what remains after subtracting all costs of running the business from the money earned through sales.",
  },
  {
    before: "The possibility of losing money or effort if a business venture does not succeed is called ",
    after: ".",
    correctAnswer: "risk",
    accepted: ["risk"],
    explanation: "Risk is the chance that a venture could fail or lose money, which every entrepreneur must weigh before starting.",
  },
  {
    before: "A gap or need in the community that could be turned into a business idea is called an entrepreneurial ",
    after: ".",
    correctAnswer: "opportunity",
    accepted: ["opportunity"],
    explanation: "An entrepreneurial opportunity is a need or gap in society that a person's skills and resources could realistically meet.",
  },
  {
    before: "A new business or project that a person starts and takes on the risk of running is called a ",
    after: ".",
    correctAnswer: "venture",
    accepted: ["venture", "business venture"],
    explanation: "A venture is a new business or project a person starts, accepting both its risks and its possible rewards.",
  },
  {
    before: "Starting a very small version of a business idea first, to learn from real customers before expanding, is called ",
    after: " small.",
    correctAnswer: "starting",
    accepted: ["starting", "testing"],
    explanation: "Starting small lets an entrepreneur test an idea with real customers and adjust it before investing more time and money.",
  },
] as const;

export const entrepreneurialOpportunities: Skill = {
  id: "g7-ss-spd-entrepreneurial-opportunities",
  code: "SPD.2",
  subjectId: "social-studies",
  strandId: "g7-ss-spd",
  grade: 7,
  title: "Entrepreneurial opportunities in Social Studies",
  description: "Entrepreneurial opportunities that match a learner's personality, the skills, attitudes, and resources required for social entrepreneurial ventures, and evaluating local Kenyan business ideas for feasibility.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["trait-match", "requirements-classify", "feasibility", "meaning", "steps-order", "fill-blank"] as const
    );

    if (branch === "trait-match") {
      const chosen = shuffle(rng, [...TRAIT_OPPORTUNITY]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t, i) => ({ id: `t${i}`, label: t.trait })));
      const targets = shuffle(rng, chosen.map((t, i) => ({ id: `t${i}`, label: t.opportunity })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t, i) => (correctMap[`t${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each personality trait or talent to the entrepreneurial opportunity it best fits.",
        tokens,
        targets,
        correctMap,
        hint: "Think about which venture would naturally suit someone with that trait or talent.",
        explanation: chosen.map((t) => `${t.trait} → ${t.opportunity}.`).join(" "),
      };
    }

    if (branch === "requirements-classify") {
      const chosen = shuffle(rng, REQUIREMENTS).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((r) => r.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((r, i) => ({ id: `r${i}`, label: r.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((r, i) => (correctBucket[`r${i}`] = r.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each requirement for a social entrepreneurial venture as a skill, an attitude, or a resource.",
        items,
        buckets,
        correctBucket,
        hint: "A skill is something you can do, an attitude is a mindset, and a resource is something you have or own.",
        explanation: chosen.map((r) => `"${r.text}" — ${BUCKET_LABEL[r.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "feasibility") {
      const { prompt, feasible } = randChoice(rng, FEASIBILITY_TEMPLATES)(rng);
      const label = feasible ? FEASIBLE_LABEL : NOT_FEASIBLE_LABEL;
      const other = feasible ? NOT_FEASIBLE_LABEL : FEASIBLE_LABEL;
      const choices = shuffle(rng, [label, other]);
      return {
        kind: "multiple-choice",
        prompt: `${prompt}`,
        choices,
        correctIndex: choices.indexOf(label),
        hint: "Feasible ideas match the person's real knowledge, skills, and available resources — not just enthusiasm.",
        explanation: `This idea is ${feasible ? "feasible" : "not yet feasible"}: ${label.toLowerCase()}.`,
      };
    }

    if (branch === "meaning") {
      const correct = randChoice(rng, ENTREPRENEURSHIP_MEANINGS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, ENTREPRENEURSHIP_MISCONCEPTIONS, 3);
      return {
        kind: "multiple-choice",
        prompt: "Which statement best reflects how entrepreneurship actually works?",
        choices,
        correctIndex,
        hint: "Think about identifying a need, organising resources, and managing risk — not shortcuts or guesswork.",
        explanation: `${correct} — this best captures how entrepreneurship actually works. The other options describe common misconceptions that lead ventures to fail.`,
      };
    }

    if (branch === "steps-order") {
      const items = shuffle(rng, FEASIBILITY_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for evaluating whether an entrepreneurial idea is feasible, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: FEASIBILITY_STEPS.map((s) => s.id),
        hint: "You must identify the need before assessing what you have, estimating costs, and finally testing the idea.",
        explanation: FEASIBILITY_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    // fill-blank
    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence about entrepreneurship.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about the vocabulary used to describe starting and running a small venture.",
      explanation: fb.explanation,
    };
  },
};
