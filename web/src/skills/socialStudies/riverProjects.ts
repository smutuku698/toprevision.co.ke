import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PROJECTS: { name: string; fact: string }[] = [
  { name: "River Tana projects, Kenya", fact: "A series of hydroelectric dams (like Masinga and Kiambere) along Kenya's longest river, also supporting irrigation and fishing" },
  { name: "Aswan High Dam, Egypt", fact: "A dam on the River Nile that controls flooding, generates hydroelectric power, and irrigates farmland, while creating Lake Nasser" },
];

const BENEFITS_CHALLENGES: { text: string; kind: "benefit" | "challenge" }[] = [
  { text: "Hydroelectric power generation for homes and industry", kind: "benefit" },
  { text: "Irrigation water that supports large-scale farming", kind: "benefit" },
  { text: "Flood control that protects communities downstream", kind: "benefit" },
  { text: "A fishing industry supported by the new reservoir", kind: "benefit" },
  { text: "Improved water supply for domestic and industrial use", kind: "benefit" },
  { text: "Tourism opportunities around the reservoir or lake", kind: "benefit" },
  { text: "Silt gradually building up behind the dam, reducing storage capacity", kind: "challenge" },
  { text: "Displacement of communities living in the area that gets flooded", kind: "challenge" },
  { text: "Very high initial construction and maintenance costs", kind: "challenge" },
  { text: "Disruption to the river's natural ecosystem and fish migration", kind: "challenge" },
  { text: "Reduced water flow affecting communities further downstream", kind: "challenge" },
];

const PROJECT_STEPS = [
  { id: "identify", label: "Identify the need, such as flooding, water shortage, or energy demand" },
  { id: "feasibility", label: "Conduct engineering, environmental, and social feasibility studies" },
  { id: "fund-resettle", label: "Secure funding and fairly resettle any affected communities" },
  { id: "construct", label: "Construct the dam and its associated infrastructure" },
  { id: "operate", label: "Operate and maintain the project for its multiple purposes" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A large barrier built across a river to control its flow and store water is called a ", after: ".", correctAnswer: "dam", accepted: ["dam"], explanation: "A dam is a large barrier built across a river to control its flow and store water." },
  { before: "The large body of water that collects behind a dam is called a ", after: ".", correctAnswer: "reservoir", accepted: ["reservoir"], explanation: "A reservoir is the large body of water that collects behind a dam." },
  { before: "Electricity generated using the force of moving water is called ", after: " power.", correctAnswer: "hydroelectric", accepted: ["hydroelectric"], explanation: "Hydroelectric power is electricity generated using the force of moving water, often through a dam." },
  { before: "Supplying water to farmland through channels or pipes to support crop growth is called ", after: ".", correctAnswer: "irrigation", accepted: ["irrigation"], explanation: "Irrigation is supplying water to farmland to support crop growth, one purpose of multi-purpose river projects." },
  { before: "A project that serves several purposes at once, such as power, irrigation, and flood control, is called ", after: ".", correctAnswer: "multipurpose", accepted: ["multipurpose", "multi-purpose"], explanation: "A multipurpose project serves several purposes at once, such as power generation, irrigation, and flood control." },
  { before: "Sand and soil that build up over time behind a dam, reducing its storage capacity, is called ", after: ".", correctAnswer: "silt", accepted: ["silt", "siltation"], explanation: "Silt (sand and soil carried by the river) builds up behind a dam over time, gradually reducing its storage capacity." },
] as const;

const QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Which of these is an economic benefit shared by multi-purpose river projects like the Aswan High Dam and the River Tana projects?",
    choices: ["Hydroelectric power generation", "Guaranteed elimination of all droughts", "Free international shipping routes", "Automatic population growth nearby"],
    correctIndex: 0,
    explanation: "Both projects generate hydroelectric power, alongside benefits like irrigation, flood control, and fishing.",
  },
  {
    prompt: "Which is a common challenge facing multi-purpose river projects in Africa?",
    choices: ["Silt building up behind the dam over time, reducing its water storage capacity", "Having too little demand for the electricity they generate", "Needing no maintenance once built", "Being unaffected by drought"],
    correctIndex: 0,
    explanation: "Silt carried by the river settles behind the dam over the years, gradually reducing the reservoir's water storage capacity — a major long-term challenge.",
  },
  {
    prompt: "Building a large dam like the Aswan High Dam often requires which difficult trade-off?",
    choices: ["Displacing communities who lived in the area that gets flooded", "Reducing the country's electricity supply", "Removing the need for any irrigation", "Eliminating fishing in the area"],
    correctIndex: 0,
    explanation: "Creating a large reservoir like Lake Nasser floods a wide area, which can mean resettling the communities who used to live there.",
  },
];

export const riverProjects: Skill = {
  id: "ss-nhbe-river-projects",
  code: "NHBE.3",
  subjectId: "social-studies",
  strandId: "ss-nhbe",
  grade: 9,
  title: "Multipurpose river projects in Africa",
  description: "River Tana projects in Kenya and the Aswan High Dam in Egypt — their importance and challenges.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "why", "categorize", "fill-blank", "order"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, BENEFITS_CHALLENGES).slice(0, 6);
      const items = chosen.map((b, i) => ({ id: `b${i}`, label: b.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((b, i) => (correctBucket[`b${i}`] = b.kind));
      return {
        kind: "categorize",
        prompt: "Sort each statement: is it a benefit of a multi-purpose river project, or a challenge it faces?",
        items,
        buckets: [
          { id: "benefit", label: "Benefit" },
          { id: "challenge", label: "Challenge" },
        ],
        correctBucket,
        hint: "Benefits are what the project provides; challenges are problems the project causes or must manage.",
        explanation: chosen.map((b) => `"${b.text}" is a ${b.kind} of multi-purpose river projects.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about multi-purpose river projects.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe dams, reservoirs, and their purposes.",
        explanation: fb.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, PROJECT_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps in establishing a multi-purpose river project, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: PROJECT_STEPS.map((s) => s.id),
        hint: "The need must be identified before studies, funding, construction, and finally ongoing operation.",
        explanation: PROJECT_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, PROJECTS.map((p) => ({ id: p.name, label: p.name })));
      const targets = shuffle(rng, PROJECTS.map((p) => ({ id: p.name, label: p.fact })));
      const correctMap: Record<string, string> = {};
      for (const p of PROJECTS) correctMap[p.name] = p.name;

      return {
        kind: "click-match",
        prompt: "Match each multi-purpose river project to a fact about it.",
        tokens,
        targets,
        correctMap,
        hint: "Both projects sit on major African rivers and serve several purposes at once — power, irrigation, and more.",
        explanation: PROJECTS.map((p) => `${p.name} — ${p.fact.toLowerCase()}.`).join(" "),
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about what these dams actually provide, and the real trade-offs of building them.",
      explanation: q.explanation,
    };
  },
};
