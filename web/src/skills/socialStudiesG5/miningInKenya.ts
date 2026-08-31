import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Mining in Kenya" — 5 named minerals
// (Soda ash, Diatomite, Limestone, Salt, Petroleum). See curriculum-reference/grade-5/social-studies.json.

const MINERALS: { id: string; mineral: string; location: string; use: string; category: "CONSTRUCTION" | "INDUSTRY_ENERGY" }[] = [
  { id: "sodaash", mineral: "Soda ash", location: "mined at Lake Magadi", use: "used in glass-making and detergents", category: "INDUSTRY_ENERGY" },
  { id: "diatomite", mineral: "Diatomite", location: "mined near the Kariandusi area close to Lake Naivasha", use: "used as a filter material and in insulation", category: "INDUSTRY_ENERGY" },
  { id: "limestone", mineral: "Limestone", location: "mined in various parts of Kenya", use: "used to make cement", category: "CONSTRUCTION" },
  { id: "salt", mineral: "Salt", location: "harvested at places like Kilifi and Magadi", use: "used in food and industry", category: "INDUSTRY_ENERGY" },
  { id: "petroleum", mineral: "Petroleum", location: "found in Turkana County", use: "used as fuel and energy", category: "INDUSTRY_ENERGY" },
];

const IMPORTANCE = [
  "creates jobs for many Kenyans",
  "earns income through exports",
  "supplies raw materials for industry",
  "contributes to government revenue through taxes",
  "supports the growth of local towns near mining sites",
  "provides materials used in everyday life",
] as const;

export const miningInKenya: Skill = {
  id: "g5-ss-res-mining-in-kenya",
  code: "R.2",
  subjectId: "social-studies",
  strandId: "g5-ss-resources",
  grade: 5,
  title: "Mining in Kenya",
  description: "Identifying Kenya's major minerals (soda ash, diatomite, limestone, salt, petroleum), where they are found, and their importance.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const m = randChoice(rng, MINERALS);
      const useFact = randChoice(rng, [true, false]);
      const fact = useFact ? m.use : m.location;
      const choices = shuffle(rng, MINERALS.map((x) => x.mineral));
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "mineral")} It is ${fact}.`,
        choices,
        correctIndex: choices.indexOf(m.mineral),
        hint: `Recall where each mineral is mined and what it is used for.`,
        explanation: `${m.mineral} is ${m.location} and ${m.use}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MINERALS).slice(0, 4);
      const tokens = chosen.map((m) => ({ id: m.id, label: m.mineral }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: m.id, label: m.use.charAt(0).toUpperCase() + m.use.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "mineral to its main use"),
        tokens,
        targets,
        correctMap,
        hint: "Recall what each mineral is used for.",
        explanation: chosen.map((m) => `${m.mineral} is ${m.use}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const construction = MINERALS.filter((m) => m.category === "CONSTRUCTION").map((m) => ({ id: m.id, label: m.mineral, bucket: m.category }));
      const industryEnergy = MINERALS.filter((m) => m.category === "INDUSTRY_ENERGY").map((m) => ({ id: m.id, label: m.mineral, bucket: m.category }));
      const items = shuffle(rng, [...construction, ...industryEnergy]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether the mineral is mainly used in construction or in industry/energy"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "CONSTRUCTION", label: "Used in Construction" },
          { id: "INDUSTRY_ENERGY", label: "Used in Industry/Energy" },
        ],
        correctBucket,
        hint: "Limestone makes cement for construction; the others support industry, food or energy.",
        explanation: MINERALS.map((m) => `${m.mineral} is mainly ${m.category === "CONSTRUCTION" ? "used in construction" : "used in industry/energy"}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const m = randChoice(rng, MINERALS);
      const imp = randChoice(rng, IMPORTANCE);
      const templates = [
        () => ({ before: `${m.mineral} is`, after: `.`, correct: m.location }),
        () => ({ before: "Limestone is mined in Kenya mainly to make", after: ".", correct: "cement" }),
        () => ({ before: "Petroleum found in Turkana County is used as", after: ".", correct: "fuel" }),
        () => ({ before: "Soda ash mined at Lake Magadi is used in glass-making and", after: ".", correct: "detergents" }),
        () => ({ before: `One way mining benefits Kenya is that it`, after: ".", correct: imp }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the 5 minerals: soda ash, diatomite, limestone, salt, petroleum.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "locate", label: "Locate the mineral deposit" },
      { id: "extract", label: "Extract/mine the mineral" },
      { id: "process", label: "Process the mineral" },
      { id: "transport", label: "Transport it for sale or use" },
    ]);
    const correctOrder = ["locate", "extract", "process", "transport"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these general steps of mining a mineral"),
      instruction: "Arrange the steps in the order they would happen.",
      items: steps,
      correctOrder,
      hint: "Mining starts with locating the deposit and ends with transporting the processed mineral.",
      explanation: "Mining a mineral: locate the deposit, extract it, process it, then transport it for sale or use.",
    };
  },
};
