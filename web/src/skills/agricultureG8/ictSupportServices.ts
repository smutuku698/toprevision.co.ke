import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const SERVICES = [
  { id: "extension", label: "Online agricultural extension advice", detail: "Farmers reach an agricultural officer or expert remotely for advice, instead of waiting for an in-person visit" },
  { id: "market-info", label: "Market price information apps", detail: "Apps or SMS services show current crop and livestock prices at different markets, helping farmers decide where and when to sell" },
  { id: "weather-forecast", label: "Weather forecast apps", detail: "Farmers check upcoming rainfall and temperature to plan planting, spraying, or harvesting" },
  { id: "e-commerce", label: "Online selling platforms", detail: "Farmers list and sell produce directly to buyers online, reaching customers beyond the local market" },
  { id: "mobile-money", label: "Mobile money for farm inputs", detail: "Farmers pay for seeds, fertiliser, or hired labour using a mobile money service instead of carrying cash" },
  { id: "e-vet", label: "Online veterinary advice", detail: "A farmer with a sick animal gets guidance from a veterinary officer remotely, by call, SMS, or app" },
] as const;

const SCENARIOS = [
  { text: "A farmer's cow suddenly stops eating and looks unwell, but the nearest vet is far away", best: "e-vet" },
  { text: "A farmer wants to know which nearby market is currently paying the best price for tomatoes", best: "market-info" },
  { text: "A farmer is planning when to plant maize and needs to know if rain is expected this week", best: "weather-forecast" },
  { text: "A farmer has extra vegetables to sell but wants to reach buyers beyond the local market", best: "e-commerce" },
  { text: "A farmer needs to pay a supplier for fertiliser quickly without travelling with cash", best: "mobile-money" },
  { text: "A farmer has a pest problem and wants advice from an agricultural officer without travelling to the office", best: "extension" },
] as const;

const RISK_ITEMS = [
  { text: "Checking that market price information comes from a trusted, verified source before acting on it", bucket: "responsible" },
  { text: "Keeping mobile money PINs and passwords private and not sharing them with strangers", bucket: "responsible" },
  { text: "Verifying an online buyer's identity before sending produce or receiving payment", bucket: "responsible" },
  { text: "Acting on farming advice from an unverified social media post without checking it", bucket: "risky" },
  { text: "Sharing a mobile money PIN with someone claiming to be a helpline agent", bucket: "risky" },
] as const;
const RISK_LABEL: Record<string, string> = { responsible: "Responsible use of ICT support services", risky: "Risky use of ICT support services" };

const ACCESS_STEPS = [
  { id: "identify-need", label: "Identify what support or information is needed" },
  { id: "choose-service", label: "Choose a trusted app, platform, or service that provides it" },
  { id: "register", label: "Register or sign in, providing only necessary information" },
  { id: "verify", label: "Verify the information or advice received before acting on it" },
  { id: "act", label: "Use the information to make a farming decision" },
];

const SERVICE_MATCH_PROMPTS = [
  "Match each ICT support service to what it provides for a farmer.",
  "Pair each ICT service below with what it actually offers a farmer.",
  "Connect each ICT support service to its correct description.",
  "Match each service to the explanation of what it does for farming.",
  "Link each ICT service to the benefit it gives a farmer.",
  "Match each ICT support service to the statement that describes it.",
];

const SCENARIO_BEST_PROMPTS = [
  (scenario: string) => `${scenario}. Which ICT support service would help most?`,
  (scenario: string) => `Consider this situation: ${scenario}. Which ICT service fits it best?`,
  (scenario: string) => `${scenario}. Which service would be the most useful response here?`,
  (scenario: string) => `Here's the situation: ${scenario}. Which ICT support service is most suitable?`,
  (scenario: string) => `${scenario}. Given this, which service makes the most sense to use?`,
];

const RISK_SORT_PROMPTS = [
  "Sort each behaviour as responsible or risky use of ICT support services.",
  "Decide whether each behaviour below is responsible or risky, and sort it.",
  "Group these behaviours under responsible use or risky use of ICT.",
  "Read each behaviour and sort it as responsible or risky use of ICT services.",
  "Sort these behaviours into responsible or risky use of ICT support services.",
  "Place each behaviour into the correct bucket — responsible, or risky, ICT use.",
];

const CHART_ADOPTION_PROMPTS = [
  "This chart shows the percentage of farmers in a survey who reported using each ICT support service. Which service was used by the most farmers?",
  "The bar chart shows what percentage of surveyed farmers use each ICT support service. Which one is most widely used?",
  "Look at the chart of ICT service usage among surveyed farmers. Which service had the highest adoption?",
  "This chart compares the percentage of farmers using different ICT services. Which service leads?",
  "Based on the survey results shown in the chart, which ICT support service is used by the largest share of farmers?",
  "The chart shows ICT service adoption rates among farmers surveyed. Which service was most popular?",
];

const ACCESS_ORDER_PROMPTS = [
  "Arrange the correct order for responsibly accessing an ICT support service as a farmer.",
  "Put these steps for responsibly accessing an ICT service into the right order.",
  "Sequence the process of accessing an ICT support service responsibly.",
  "Arrange these steps in the order a farmer should follow to use an ICT service safely.",
  "Order these actions the way a farmer would carry them out when accessing an ICT service.",
  "Sort these steps into the order they should happen when responsibly using an ICT support service.",
];

export const ictSupportServices: Skill = {
  id: "g8-ag-p-ict-support-services",
  code: "P.3",
  subjectId: "agriculture-nutrition",
  strandId: "g8-ag-production-techniques",
  grade: 8,
  title: "ICT Support Services",
  description: "Support services accessible through ICT in agriculture, choosing the right service for a farming situation, and using them responsibly.",
  generate(rng) {
    const branch = randChoice(rng, ["service-match", "scenario-best", "risk-sort", "chart-adoption", "access-order"] as const);

    if (branch === "service-match") {
      const chosen = shuffle(rng, SERVICES);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.id, label: s.detail })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, SERVICE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Each service replaces a specific in-person task — a visit, a phone call, a trip to the market — with something done remotely.",
        explanation: chosen.map((s) => `${s.label}: ${s.detail}.`).join(" "),
      };
    }

    if (branch === "scenario-best") {
      const s = randChoice(rng, SCENARIOS);
      const correct = SERVICES.find((sv) => sv.id === s.best)!;
      const others = SERVICES.filter((sv) => sv.id !== s.best).map((sv) => sv.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, SCENARIO_BEST_PROMPTS)(s.text),
        choices,
        correctIndex,
        hint: "Match the specific problem described to the service designed for that exact need.",
        explanation: `${correct.label}: ${correct.detail}.`,
      };
    }

    if (branch === "risk-sort") {
      const chosen = shuffle(rng, RISK_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: RISK_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `r${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`r${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, RISK_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Responsible use protects personal information and verifies sources; risky use shares private details or trusts unverified information.",
        explanation: chosen.map((c) => `"${c.text}" — ${RISK_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "chart-adoption") {
      const services = ["Market price apps", "Weather apps", "Mobile money", "Online vet advice"];
      const data = services.map((label) => ({ label, value: randInt(rng, 20, 90) }));
      const sorted = [...data].sort((a, b) => b.value - a.value);
      const most = sorted[0];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, CHART_ADOPTION_PROMPTS),
        visual: { type: "bar-chart", data },
        choices: services,
        correctIndex: services.indexOf(most.label),
        hint: "Find the tallest bar on the chart.",
        explanation: `${most.label} was used by the most farmers in the survey (${most.value}%), the tallest bar on the chart.`,
      };
    }

    // access-order
    const items = shuffle(rng, ACCESS_STEPS);
    return {
      kind: "ordering",
      prompt: randChoice(rng, ACCESS_ORDER_PROMPTS),
      instruction: "Click them in order.",
      items,
      correctOrder: ACCESS_STEPS.map((s) => s.id),
      hint: "Know what you need before choosing a service, and verify information before acting on it.",
      explanation: ACCESS_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
