import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CHARACTERISTICS: { text: string; country: "kenya" | "germany" }[] = [
  { text: "A broad base on the population pyramid, showing a high birth rate", country: "kenya" },
  { text: "A young population, with a large share of people under 15", country: "kenya" },
  { text: "A narrower base and a bulge in the middle-aged groups on the pyramid", country: "germany" },
  { text: "A high life expectancy with a large elderly population", country: "germany" },
  { text: "A fast-growing population due to high fertility rates", country: "kenya" },
  { text: "A slow-growing or near-stationary population", country: "germany" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Population pyramid", meaning: "A graph showing the age and sex structure of a population using horizontal bars" },
  { term: "Census", meaning: "An official count and survey of a country's entire population" },
  { term: "Birth rate", meaning: "The number of live births per 1,000 people in a population per year" },
  { term: "Death rate", meaning: "The number of deaths per 1,000 people in a population per year" },
  { term: "Life expectancy", meaning: "The average number of years a person is expected to live" },
  { term: "Dependency ratio", meaning: "The ratio of dependents (children and the elderly) to the working-age population" },
  { term: "Fertility rate", meaning: "The average number of children born to a woman in her lifetime" },
] as const;

const PYRAMID_STEPS = [
  { id: "collect", label: "Collect age-sex population data, usually from a census" },
  { id: "group", label: "Group the population into age bands, such as 0-4, 5-9, 10-14" },
  { id: "calculate", label: "Calculate the number or percentage of males and females in each age band" },
  { id: "draw", label: "Draw horizontal bars for males (left) and females (right) for each age band" },
  { id: "analyse", label: "Analyse the pyramid's shape to describe the population's structure" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A graph showing the age and sex structure of a population using horizontal bars is called a population ", after: ".", correctAnswer: "pyramid", accepted: ["pyramid"], explanation: "A population pyramid is a graph showing a population's age and sex structure using horizontal bars." },
  { before: "An official count and survey of a country's entire population is called a ", after: ".", correctAnswer: "census", accepted: ["census"], explanation: "A census is an official count and survey of a country's entire population." },
  { before: "The number of live births per 1,000 people in a population per year is called the ", after: " rate.", correctAnswer: "birth", accepted: ["birth"], explanation: "The birth rate is the number of live births per 1,000 people in a population per year." },
  { before: "The average number of years a person is expected to live is called life ", after: ".", correctAnswer: "expectancy", accepted: ["expectancy"], explanation: "Life expectancy is the average number of years a person is expected to live." },
  { before: "The ratio of dependents (children and the elderly) to the working-age population is called the ", after: " ratio.", correctAnswer: "dependency", accepted: ["dependency"], explanation: "The dependency ratio compares dependents (children and elderly) to the working-age population." },
] as const;

const QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "What are the main sources of population data used to determine a country's population structure?",
    choices: ["Census reports, birth and death registrations", "Newspaper opinion polls only", "School attendance records only", "Tax records from businesses"],
    correctIndex: 0,
    explanation: "Population structure is built mainly from official data sources like national censuses and civil registration of births and deaths.",
  },
  {
    prompt: "Why is a country's population structure important for distributing national resources?",
    choices: ["It shows planners how many schools, hospitals, and jobs are needed for each age group", "It has no real use beyond record-keeping", "It only matters for choosing a national flag", "It determines the country's currency exchange rate"],
    correctIndex: 0,
    explanation: "Knowing how many people are in each age group helps a government plan services like schools, healthcare, and job creation where they're most needed.",
  },
  {
    prompt: "Which factor does NOT directly determine a country's population structure?",
    choices: ["The average rainfall in the country", "The birth rate", "The death rate", "Migration (people moving in or out)"],
    correctIndex: 0,
    explanation: "Population structure is shaped by birth rate, death rate, and migration — rainfall affects agriculture, not population age-sex structure directly.",
  },
];

export const populationStructure: Skill = {
  id: "ss-pr-population-structure",
  code: "PR.4",
  subjectId: "social-studies",
  strandId: "ss-pr",
  grade: 9,
  title: "Population structure",
  description: "Compare the population structures of a developing country (Kenya) and a developed country (Germany).",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "why", "match", "fill-blank", "pyramid-order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each population term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "These terms describe how population data is collected and shown on a population pyramid.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about population structure.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe population data and pyramids.",
        explanation: fb.explanation,
      };
    }

    if (branch === "pyramid-order") {
      const items = shuffle(rng, PYRAMID_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for constructing a population pyramid from census data, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: PYRAMID_STEPS.map((s) => s.id),
        hint: "Data must be collected before it can be grouped, calculated, drawn, and finally analysed.",
        explanation: PYRAMID_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CHARACTERISTICS).slice(0, 5);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.country));

      return {
        kind: "categorize",
        prompt: "Sort each characteristic: does it describe Kenya's population pyramid or Germany's?",
        items,
        buckets: [
          { id: "kenya", label: "Kenya (developing)" },
          { id: "germany", label: "Germany (developed)" },
        ],
        correctBucket,
        hint: "A developing country like Kenya has a young, fast-growing population; a developed country like Germany has an older, slow-growing one.",
        explanation: chosen.map((c) => `"${c.text}" describes ${c.country === "kenya" ? "Kenya" : "Germany"}.`).join(" "),
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about where population data comes from and why age-sex structure matters for planning.",
      explanation: q.explanation,
    };
  },
};
