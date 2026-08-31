import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const HOLDING_TOOLS = ["Pliers", "Clamp", "Tongs", "Clip", "Vice"];
const DRIVING_TOOLS = ["Hammer", "Screwdriver", "Spanner", "Punch", "Mallet"];

const TOOL_ICON: Record<string, "pliers" | "clamp" | "tongs" | "clip" | "vice" | "hammer" | "screwdriver" | "spanner" | "dot-punch" | "mallet"> = {
  Pliers: "pliers",
  Clamp: "clamp",
  Tongs: "tongs",
  Clip: "clip",
  Vice: "vice",
  Hammer: "hammer",
  Screwdriver: "screwdriver",
  Spanner: "spanner",
  Punch: "dot-punch",
  Mallet: "mallet",
};

export const holdingDrivingTools: Skill = {
  id: "pt-t-holding-driving-tools",
  code: "T.1",
  subjectId: "pre-technical",
  strandId: "pt-tools",
  grade: 9,
  title: "Holding tools and driving tools",
  description: "Sort tools into holding tools and driving tools.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify", "identify-visual"] as const);

    if (branch === "identify-visual") {
      const askHolding = rng() < 0.5;
      const pool = askHolding ? HOLDING_TOOLS : DRIVING_TOOLS;
      const target = randChoice(rng, pool);
      const prompts = [
        "Look at the tool shown. Is it a holding tool or a driving tool?",
        "Study the tool in the picture. Which category does it belong to?",
        "Classify the tool shown below.",
        "Is the tool pictured here used for holding a workpiece, or for driving/striking?",
        "Which type of tool is shown in the image?",
        "Look carefully at this tool's shape. Holding tool or driving tool?",
        "Identify the category of the tool illustrated below.",
        "This tool is used in the workshop. Sort it into its correct category.",
        "Based on its shape, decide: holding tool or driving tool?",
        "Which of the two tool categories does the pictured tool fall under?",
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        visual: { type: "hand-tool", item: TOOL_ICON[target] },
        choices: ["Holding tool", "Driving tool"],
        correctIndex: askHolding ? 0 : 1,
        hint: "Holding tools grip or secure a workpiece; driving tools apply force to strike, turn, or fasten something.",
        explanation: `${target} is a ${askHolding ? "holding" : "driving"} tool — it is used to ${askHolding ? "grip or secure a workpiece" : "apply force to strike, turn, or fasten something"}.`,
      };
    }

    if (branch === "identify") {
      const askHolding = rng() < 0.5;
      const pool = askHolding ? HOLDING_TOOLS : DRIVING_TOOLS;
      const otherPool = askHolding ? DRIVING_TOOLS : HOLDING_TOOLS;
      const correct = randChoice(rng, pool);
      const distractors = shuffle(rng, otherPool).slice(0, 3);
      const choices = shuffle(rng, [correct, ...distractors]);

      return {
        kind: "multiple-choice",
        prompt: `Which of these is a ${askHolding ? "holding" : "driving"} tool?`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "Holding tools grip or secure a workpiece; driving tools apply force to strike, turn, or fasten something.",
        explanation: `${correct} is a ${askHolding ? "holding" : "driving"} tool.`,
      };
    }

    const holding = shuffle(rng, HOLDING_TOOLS).slice(0, 3);
    const driving = shuffle(rng, DRIVING_TOOLS).slice(0, 3);
    const items = shuffle(rng, [
      ...holding.map((label) => ({ id: label, label, bucket: "holding" })),
      ...driving.map((label) => ({ id: label, label, bucket: "driving" })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each tool into Holding Tool or Driving Tool.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "holding", label: "Holding Tool" },
        { id: "driving", label: "Driving Tool" },
      ],
      correctBucket,
      hint: "Holding tools grip or secure a workpiece; driving tools apply force to strike, turn, or fasten something.",
      explanation: `Holding tools: ${holding.join(" / ")}. Driving tools: ${driving.join(" / ")}.`,
    };
  },
};
