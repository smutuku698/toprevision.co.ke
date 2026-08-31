import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ACHIEVEMENTS = [
  { text: "Developed one of the earliest writing systems, cuneiform, on clay tablets", region: "Asia" },
  { text: "Built the Great Wall and invented paper, the compass, and gunpowder", region: "Asia" },
  { text: "Developed the Indus Valley cities with advanced drainage and sanitation systems", region: "Asia" },
  { text: "Developed democracy as a system of government in Athens", region: "Europe" },
  { text: "Built an empire with a road network, law codes, and aqueducts across the Mediterranean", region: "Europe" },
  { text: "Advanced philosophy, mathematics (geometry), and the Olympic Games tradition", region: "Europe" },
  { text: "Built stone towns such as Gedi and traded gold, ivory, and spices across the Indian Ocean", region: "Swahili coast" },
  { text: "Developed Kiswahili as a trading language blending Bantu and Arabic influences", region: "Swahili coast" },
  { text: "Built the coral-stone Great Mosque and palace ruins found at Kilwa and other coastal towns", region: "Swahili coast" },
] as const;

const BEST_PRACTICES = [
  "Written record-keeping systems, which modern governments and businesses still rely on",
  "Democratic systems of government, which many countries including Kenya use today",
  "Long-distance trade networks, which modern international trade has built upon",
  "Systems of law and justice, which influenced modern legal codes",
  "Architectural and engineering techniques, still studied and admired today",
] as const;

const REGION_LABEL: Record<string, string> = { Asia: "Asian civilisation", Europe: "European civilisation", "Swahili coast": "Swahili coast civilisation" };

export const earlyCivilisation: Skill = {
  id: "g8-ss-pr-early-civilisation",
  code: "PR.2",
  subjectId: "social-studies",
  strandId: "g8-ss-pr",
  grade: 8,
  title: "Early civilisation",
  description: "Achievements of early civilisations in Asia, Europe, and along the Swahili coast, and how their best practices contributed to the modern world.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "match", "best-practice", "cultural-heritage", "name-region"] as const);

    if (branch === "classify") {
      const chosen = shuffle(rng, ACHIEVEMENTS).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((a) => a.region))).map((r) => ({ id: r, label: REGION_LABEL[r] }));
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.region));
      return {
        kind: "categorize",
        prompt: "Sort each achievement into the early civilisation it belongs to.",
        items,
        buckets,
        correctBucket,
        hint: "Think about which region — Asia, Europe, or the East African Swahili coast — is linked to each achievement.",
        explanation: chosen.map((a) => `"${a.text}" — ${REGION_LABEL[a.region]}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, [...ACHIEVEMENTS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `a${i}`, label: REGION_LABEL[a.region] })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `a${i}`, label: a.text })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((a, i) => (correctMap[`a${i}`] = `a${i}`));
      return {
        kind: "click-match",
        prompt: "Match each civilisation to one of its real achievements.",
        tokens,
        targets,
        correctMap,
        hint: "Recall a specific achievement linked to each civilisation.",
        explanation: chosen.map((a) => `${REGION_LABEL[a.region]}: ${a.text}.`).join(" "),
      };
    }

    if (branch === "best-practice") {
      const correct = randChoice(rng, BEST_PRACTICES);
      const others = BEST_PRACTICES.filter((p) => p !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "Which of these best practices from early civilisations has contributed most directly to the modern world?",
        choices,
        correctIndex,
        hint: "Think about systems that governments, businesses, or societies today still rely on.",
        explanation: `${correct} — this is a direct contribution from early civilisations still used in the modern world.`,
      };
    }

    if (branch === "name-region") {
      const a = randChoice(rng, ACHIEVEMENTS);
      return {
        kind: "fill-blank",
        prompt: `"${a.text}" — this achievement is linked to which early civilisation: Asia, Europe, or the Swahili coast?`,
        before: "",
        after: "",
        correctAnswer: a.region,
        inputMode: "text",
        hint: "Recall which region this specific achievement is associated with.",
        explanation: `"${a.text}" is an achievement of the ${a.region} civilisation.`,
      };
    }

    // cultural-heritage
    const reasons = [
      "It helps a community understand its identity and history",
      "It attracts tourists, which creates jobs and income for local people",
      "It preserves knowledge and skills passed down from earlier generations",
      "It builds a sense of pride and unity among people who share it",
    ] as const;
    const correct = randChoice(rng, reasons);
    const others = reasons.filter((r) => r !== correct);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
    return {
      kind: "multiple-choice",
      prompt: "Why is cultural heritage from early civilisations important to a society today?",
      choices,
      correctIndex,
      hint: "Think about identity, income, knowledge, and unity.",
      explanation: `${correct} — this is one of the reasons cultural heritage is valued and protected.`,
    };
  },
};
