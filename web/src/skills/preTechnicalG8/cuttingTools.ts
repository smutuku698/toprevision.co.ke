import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const TOOLS = [
  { id: "snips", label: "Snips", use: "Cutting thin sheet metal or wire" },
  { id: "chisel", label: "Chisel", use: "Paring away wood to shape or carve it" },
  { id: "handsaw", label: "Handsaw", use: "Cutting through timber along a marked line" },
  { id: "plane", label: "Plane", use: "Shaving thin layers off a wood surface to smooth and flatten it" },
  { id: "hacksaw", label: "Hacksaw", use: "Cutting metal rods, pipes, or bolts to length" },
  { id: "scraper", label: "Scraper", use: "Removing old paint, varnish, or adhesive from a surface" },
  { id: "knife", label: "Craft knife", use: "Cutting soft materials such as paper, cardboard, or leather" },
  { id: "stripper", label: "Wire stripper", use: "Removing the plastic insulation from an electrical wire" },
] as const;

const SCENARIOS = [
  { text: "Cutting a steel pipe to the correct length in the workshop", best: "hacksaw" },
  { text: "Removing old flaking paint from a wooden door before repainting", best: "scraper" },
  { text: "Trimming a piece of thin aluminium sheet to shape", best: "snips" },
  { text: "Smoothing a rough wooden plank down to a flat, even surface", best: "plane" },
  { text: "Preparing the end of an electrical cable to connect it to a switch", best: "stripper" },
  { text: "Carving a decorative groove into a block of wood", best: "chisel" },
] as const;

const CARE_ITEMS = [
  { text: "Wipe cutting tools clean and lightly oil them after use to prevent rust", bucket: "good" },
  { text: "Store cutting tools in a dry, designated rack or box", bucket: "good" },
  { text: "Sharpen blades regularly so they cut cleanly and safely", bucket: "good" },
  { text: "Leave cutting tools scattered on a damp workbench overnight", bucket: "poor" },
  { text: "Toss cutting tools loosely into a drawer with other hard tools, blades exposed", bucket: "poor" },
  { text: "Keep using a badly blunted blade without ever sharpening it", bucket: "poor" },
] as const;

const CARE_LABEL: Record<string, string> = { good: "Good tool care practice", poor: "Poor tool care practice" };

const MAINTENANCE_STEPS = [
  { id: "clean", label: "Clean off any debris, dust, or residue from the blade" },
  { id: "inspect", label: "Inspect the blade for damage, rust, or bluntness" },
  { id: "sharpen", label: "Sharpen the blade if it is blunt" },
  { id: "oil", label: "Apply a light coat of oil to protect against rust" },
  { id: "store", label: "Store the tool in a dry, designated place" },
];

export const cuttingTools: Skill = {
  id: "g8-pt-t-cutting-tools",
  code: "T.1",
  subjectId: "pre-technical",
  strandId: "g8-pt-tools",
  grade: 8,
  title: "Cutting Tools",
  description: "Identifying cutting tools used in a work environment, selecting the right one for a task, and caring for them properly.",
  generate(rng) {
    const branch = randChoice(rng, ["use-match", "select-scenario", "care-sort", "identify", "maintenance-order"] as const);

    if (branch === "use-match") {
      const chosen = shuffle(rng, [...TOOLS]).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.use })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: "Match each cutting tool to what it is used for.",
        tokens,
        targets,
        correctMap,
        hint: "Each cutting tool is shaped for a specific material and type of cut.",
        explanation: chosen.map((t) => `${t.label}: ${t.use}.`).join(" "),
      };
    }

    if (branch === "select-scenario") {
      const s = randChoice(rng, SCENARIOS);
      const tool = TOOLS.find((t) => t.id === s.best)!;
      const others = TOOLS.filter((t) => t.id !== s.best).map((t) => t.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, tool.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `${s.text}. Which cutting tool should you select for this task?`,
        choices,
        correctIndex,
        hint: "Think about the material being cut and the kind of cut needed.",
        explanation: `${tool.label} is the right choice: ${tool.use.toLowerCase()}.`,
      };
    }

    if (branch === "care-sort") {
      const chosen = shuffle(rng, CARE_ITEMS).slice(0, randInt(rng, 5, 6));
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: CARE_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each practice into good or poor cutting-tool care.",
        items,
        buckets,
        correctBucket,
        hint: "Good care prevents rust, keeps blades sharp, and stores tools safely.",
        explanation: chosen.map((c) => `"${c.text}" — ${CARE_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "identify") {
      const t = randChoice(rng, TOOLS);
      return {
        kind: "fill-blank",
        prompt: `A cutting tool is used for: "${t.use.toLowerCase()}."`,
        before: "This tool is called a",
        after: ".",
        correctAnswer: t.label,
        acceptedAnswers: [t.id],
        inputMode: "text",
        hint: "Think about which tool is specifically designed for this material and task.",
        explanation: `${t.label}: ${t.use}.`,
      };
    }

    // maintenance-order
    const items = shuffle(rng, MAINTENANCE_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the correct routine for maintaining a cutting tool after use.",
      instruction: "Click them in order.",
      items,
      correctOrder: MAINTENANCE_STEPS.map((s) => s.id),
      hint: "Clean first, check its condition, fix any problems, then protect and store it.",
      explanation: MAINTENANCE_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
