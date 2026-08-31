import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const HARDWOOD = ["Mahogany", "Oak", "Mvule", "Mahogany-teak", "Mninga", "Camphor"];
const SOFTWOOD = ["Pine", "Cedar", "Cypress", "Podo", "Spruce", "Fir"];

export const woodClassification: Skill = {
  id: "pt-m-wood-classification",
  code: "M.1",
  subjectId: "pre-technical",
  strandId: "pt-materials",
  grade: 9,
  title: "Hardwood and softwood",
  description: "Sort types of wood into hardwood and softwood.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify"] as const);

    if (branch === "identify") {
      const askHardwood = rng() < 0.5;
      const pool = askHardwood ? HARDWOOD : SOFTWOOD;
      const otherPool = askHardwood ? SOFTWOOD : HARDWOOD;
      const correct = randChoice(rng, pool);
      const distractors = shuffle(rng, otherPool).slice(0, 3);
      const choices = shuffle(rng, [correct, ...distractors]);

      return {
        kind: "multiple-choice",
        prompt: `Which of these is a ${askHardwood ? "hardwood" : "softwood"}?`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "Hardwoods generally come from slow-growing broadleaf trees; softwoods generally come from faster-growing coniferous trees.",
        explanation: `${correct} is a ${askHardwood ? "hardwood" : "softwood"}.`,
      };
    }

    const hardwood = shuffle(rng, HARDWOOD).slice(0, 3);
    const softwood = shuffle(rng, SOFTWOOD).slice(0, 3);
    const items = shuffle(rng, [
      ...hardwood.map((label) => ({ id: label, label, bucket: "hardwood" })),
      ...softwood.map((label) => ({ id: label, label, bucket: "softwood" })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each type of wood into Hardwood or Softwood.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "hardwood", label: "Hardwood" },
        { id: "softwood", label: "Softwood" },
      ],
      correctBucket,
      hint: "Hardwoods generally come from slow-growing broadleaf trees; softwoods generally come from faster-growing coniferous trees.",
      explanation: `Hardwood: ${hardwood.join(" / ")}. Softwood: ${softwood.join(" / ")}.`,
    };
  },
};
