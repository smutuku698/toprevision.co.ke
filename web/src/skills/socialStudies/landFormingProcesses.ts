import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TERMS: { name: string; definition: string }[] = [
  { name: "Fault", definition: "A crack or fracture in the earth's rocks where movement has taken place" },
  { name: "Rift valley", definition: "A long, narrow valley formed when the block of land between two parallel faults sinks down" },
  { name: "Block mountain", definition: "A raised block of land left standing between two parallel faults" },
  { name: "Tension", definition: "A pulling-apart force in the earth's crust that causes faulting" },
  { name: "Compression", definition: "A squeezing force in the earth's crust that pushes rocks together, unlike tension which pulls them apart" },
  { name: "Escarpment", definition: "A steep slope or cliff marking the edge of a fault or rift valley" },
  { name: "Continental drift", definition: "The theory that continents have slowly moved across the earth's surface over millions of years" },
  { name: "Plate tectonics", definition: "The theory that the earth's crust is divided into moving plates whose interactions shape landforms" },
  { name: "Horst", definition: "A raised block of land between two faults — another name for a block mountain" },
  { name: "Graben", definition: "A sunken block of land between two faults — another name for a rift valley" },
];

const EFFECTS: { text: string; kind: "positive" | "negative" }[] = [
  { text: "Fertile volcanic soils that support productive farming", kind: "positive" },
  { text: "Geothermal energy potential for electricity generation", kind: "positive" },
  { text: "Scenic rift valley landscapes that attract tourism", kind: "positive" },
  { text: "Mineral deposits exposed and made accessible by faulting", kind: "positive" },
  { text: "Lakes forming on the rift valley floor, supporting fishing and irrigation", kind: "positive" },
  { text: "Increased risk of earthquakes along active fault lines", kind: "negative" },
  { text: "Increased risk of volcanic eruptions near rift valley features", kind: "negative" },
  { text: "Steep escarpments that make roads and railways difficult and costly to build", kind: "negative" },
  { text: "Risk of landslides on steep fault scarps during heavy rain", kind: "negative" },
];

const RIFT_STEPS = [
  { id: "tension", label: "Tension forces stretch and pull the earth's crust" },
  { id: "cracks", label: "Cracks (faults) form in the stretched crust" },
  { id: "sink", label: "The block of land between two parallel faults sinks down" },
  { id: "floor", label: "The sunken block forms the floor of the rift valley" },
  { id: "features", label: "Volcanic activity and lakes may develop on the valley floor over time" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A crack or fracture in the earth's rocks where movement has taken place is called a ", after: ".", correctAnswer: "fault", accepted: ["fault"], explanation: "A fault is a crack or fracture in the earth's rocks where movement has taken place." },
  { before: "A pulling-apart force in the earth's crust that causes faulting is called ", after: ".", correctAnswer: "tension", accepted: ["tension"], explanation: "Tension is a pulling-apart force in the earth's crust, the main force that causes faulting and rift valleys." },
  { before: "A squeezing force that pushes rocks together, the opposite of tension, is called ", after: ".", correctAnswer: "compression", accepted: ["compression"], explanation: "Compression is a squeezing force that pushes rocks together, opposite to the pulling force of tension." },
  { before: "A long, narrow valley formed when land between two parallel faults sinks is called a ", after: ".", correctAnswer: "rift valley", accepted: ["rift valley"], explanation: "A rift valley forms when the block of land between two parallel faults sinks down." },
  { before: "A raised block of land left standing between two parallel faults is called a ", after: " mountain.", correctAnswer: "block", accepted: ["block"], explanation: "A block mountain is a raised block of land left standing between two parallel faults." },
  { before: "The theory that the earth's crust is divided into moving plates is called ", after: ".", correctAnswer: "plate tectonics", accepted: ["plate tectonics"], explanation: "Plate tectonics is the theory that the earth's crust is divided into moving plates whose interactions shape landforms." },
  { before: "A steep slope or cliff marking the edge of a fault or rift valley is called an ", after: ".", correctAnswer: "escarpment", accepted: ["escarpment"], explanation: "An escarpment is a steep slope or cliff marking the edge of a fault or rift valley." },
] as const;

const QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "How does a rift valley form?",
    choices: ["Tension causes two parallel faults, and the block between them sinks", "Compression squeezes rock upward into a dome", "A river erodes a deep, narrow channel", "Volcanic ash builds up over centuries"],
    correctIndex: 0,
    explanation: "Tension forces in the earth's crust create two roughly parallel faults; the block of land between them then sinks, forming a rift valley.",
  },
  {
    prompt: "Which is a positive effect of faulting on human activities in East Africa?",
    choices: ["Fertile volcanic soils and geothermal energy for the surrounding areas", "Guaranteed protection from all earthquakes", "Permanently flat land with no farming challenges", "Complete absence of natural hazards"],
    correctIndex: 0,
    explanation: "Areas shaped by faulting, like Kenya's Rift Valley, often have fertile volcanic soils and geothermal energy potential, even though the same processes bring risks like earthquakes.",
  },
  {
    prompt: "Which theory explains how continents have moved apart over millions of years?",
    choices: ["Continental drift / plate tectonics", "The water cycle", "The rock cycle", "The greenhouse effect"],
    correctIndex: 0,
    explanation: "The theory of continental drift, explained further by plate tectonics, describes how the earth's continents have slowly moved apart from a single ancient landmass.",
  },
];

export const landFormingProcesses: Skill = {
  id: "ss-nhbe-land-forming",
  code: "NHBE.2",
  subjectId: "social-studies",
  strandId: "ss-nhbe",
  grade: 9,
  title: "Internal land forming processes",
  description: "Faulting, rift valleys, and block mountains, and their effects on human activities.",
  generate(rng) {
    const branch = randChoice(rng, ["terms", "why", "effects", "fill-blank", "rift-order"] as const);

    if (branch === "effects") {
      const chosen = shuffle(rng, EFFECTS).slice(0, 6);
      const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => (correctBucket[`e${i}`] = e.kind));
      return {
        kind: "categorize",
        prompt: "Sort each effect of faulting on human activities as positive or negative.",
        items,
        buckets: [
          { id: "positive", label: "Positive effect" },
          { id: "negative", label: "Negative effect" },
        ],
        correctBucket,
        hint: "Faulting creates fertile soils, energy, and scenery, but also brings earthquake, eruption, and terrain risks.",
        explanation: chosen.map((e) => `"${e.text}" is a ${e.kind} effect of faulting.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about internal land forming processes.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe faulting, rift valleys, and block mountains.",
        explanation: fb.explanation,
      };
    }

    if (branch === "rift-order") {
      const items = shuffle(rng, RIFT_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps in the formation of a rift valley, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: RIFT_STEPS.map((s) => s.id),
        hint: "Tension stretches the crust first, then faults crack it, then the block between the faults sinks to form the valley floor.",
        explanation: RIFT_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "terms") {
      const chosen = shuffle(rng, TERMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.definition })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.name] = t.name;

      return {
        kind: "click-match",
        prompt: "Match each term to its definition.",
        tokens,
        targets,
        correctMap,
        hint: "Faulting is caused by tension; the sinking block forms a rift valley, and the raised blocks either side can form block mountains.",
        explanation: chosen.map((t) => `${t.name} — ${t.definition.toLowerCase()}.`).join(" "),
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about tension, faulting, and how the resulting landforms affect farming, energy, and infrastructure.",
      explanation: q.explanation,
    };
  },
};
