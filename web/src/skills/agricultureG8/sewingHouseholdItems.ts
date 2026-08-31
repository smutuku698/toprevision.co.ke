import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const SEAMS = [
  { id: "plain", label: "Plain seam", detail: "Two pieces of fabric joined with a single line of stitching, then the edges are pressed open or to one side — the simplest, most common seam" },
  { id: "french", label: "French seam", detail: "A seam sewn twice, enclosing the raw edges inside a neat fold — strong and neat, ideal for lightweight or sheer fabric" },
  { id: "flat-fell", label: "Flat-fell seam", detail: "A very strong, flat, enclosed seam with two visible rows of stitching — commonly used on jeans and workwear" },
  { id: "run-and-fell", label: "Run-and-fell seam", detail: "Similar to a flat-fell seam but sewn by hand or with simpler stitching, giving a strong, durable, enclosed seam" },
] as const;

const USE_ITEMS = [
  { text: "Joining the main panels of a cushion cover quickly", bucket: "plain" },
  { text: "A seam on a sheer curtain that should not show raw edges", bucket: "french" },
  { text: "The inside leg seam of a pair of trousers that needs to be very strong", bucket: "flat-fell" },
  { text: "A simple apron seam where speed matters more than extra strength", bucket: "plain" },
  { text: "A durable seam for a canvas bag that will be pulled and stressed often", bucket: "flat-fell" },
] as const;

const CONSTRUCT_STEPS = [
  { id: "measure", label: "Measure and mark the fabric to the required dimensions" },
  { id: "cut", label: "Cut the fabric pieces along the marked lines" },
  { id: "pin", label: "Pin the pieces together, right sides facing" },
  { id: "sew", label: "Sew the chosen seam along the pinned edge" },
  { id: "press", label: "Press the seam flat or open with an iron" },
  { id: "finish", label: "Finish the item — hem the edges and add any closures" },
];

const SEAM_MATCH_PROMPTS = [
  "Match each type of seam to how it is made.",
  "Pair each seam below with the description of how it's constructed.",
  "Connect each seam type to how it is actually sewn.",
  "Match each seam to the correct description of its construction.",
  "Link each type of seam to how it is put together.",
  "Match each seam type to the statement explaining it.",
];

const USE_CHOICE_PROMPTS = [
  (use: string) => `Which seam type best suits this use: "${use}"?`,
  (use: string) => `"${use}" — which type of seam would work best here?`,
  (use: string) => `For this use: "${use}," which seam type is the best choice?`,
  (use: string) => `Given this situation: "${use}," which seam is most suitable?`,
  (use: string) => `Which seam should be used for: "${use}"?`,
];

const FABRIC_CALC_PROMPTS = [
  (length: number, width: number, seamAllowanceCm: number) =>
    `A household item's finished panel needs to be ${length} cm by ${width} cm (shown below). Adding a ${seamAllowanceCm} cm seam allowance on every edge, what is the total fabric area needed, in cm² (length × width after adding the allowance to both sides of each dimension)?`,
  (length: number, width: number, seamAllowanceCm: number) =>
    `A tailor needs a finished panel ${length} cm by ${width} cm (shown below), with a ${seamAllowanceCm} cm seam allowance on every edge. What total fabric area, in cm², is needed?`,
  (length: number, width: number, seamAllowanceCm: number) =>
    `Given a finished panel size of ${length} cm by ${width} cm (shown below) and a ${seamAllowanceCm} cm seam allowance all round, find the fabric area required in cm².`,
  (length: number, width: number, seamAllowanceCm: number) =>
    `A panel measuring ${length} cm by ${width} cm (shown below) once finished requires a ${seamAllowanceCm} cm allowance on each edge. What total area of fabric, in cm², is needed to cut it?`,
  (length: number, width: number, seamAllowanceCm: number) =>
    `Working out fabric needs: a finished panel of ${length} cm by ${width} cm (shown below) needs ${seamAllowanceCm} cm added on every edge for seams. What's the total cutting area, in cm²?`,
];

const REVERSE_FABRIC_PROMPTS = [
  (requiredLength: number, seamAllowanceCm: number) =>
    `A tailor cuts a strip of fabric ${requiredLength} cm long, using a ${seamAllowanceCm} cm seam allowance on each end. What is the finished length of the item after sewing, in cm?`,
  (requiredLength: number, seamAllowanceCm: number) =>
    `A ${requiredLength} cm strip of fabric is cut, allowing ${seamAllowanceCm} cm for a seam at each end. What length will the finished item be, in cm?`,
  (requiredLength: number, seamAllowanceCm: number) =>
    `Starting with a ${requiredLength} cm fabric strip and a ${seamAllowanceCm} cm seam allowance at each end, find the finished length in cm.`,
  (requiredLength: number, seamAllowanceCm: number) =>
    `After cutting fabric ${requiredLength} cm long with ${seamAllowanceCm} cm reserved for seams at each end, what length remains once it's sewn, in cm?`,
  (requiredLength: number, seamAllowanceCm: number) =>
    `A fabric strip ${requiredLength} cm long has a ${seamAllowanceCm} cm seam allowance at both ends. What is the item's finished length, in cm?`,
];

const CONSTRUCT_ORDER_PROMPTS = [
  "Arrange the correct order for constructing a household item using seams.",
  "Put these steps for constructing a household item into the right order.",
  "Sequence the process of sewing a household item correctly.",
  "Arrange these steps in the order a sewer should follow to construct an item.",
  "Order these actions the way someone would carry them out when sewing an item.",
  "Sort these steps into the order they should happen when constructing a sewn item.",
];

export const sewingHouseholdItems: Skill = {
  id: "g8-ag-p-sewing-household-items",
  code: "P.1",
  subjectId: "agriculture-nutrition",
  strandId: "g8-ag-production-techniques",
  grade: 8,
  title: "Sewing Skills: Constructing Household Items",
  description: "Types of seams used in making household items, choosing a seam for a given use, the construction process, and calculating fabric needed for an item.",
  generate(rng) {
    const branch = randChoice(rng, ["seam-match", "use-choice", "fabric-calc", "reverse-fabric", "construct-order"] as const);

    if (branch === "seam-match") {
      const tokens = shuffle(rng, SEAMS.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, SEAMS.map((s) => ({ id: s.id, label: s.detail })));
      const correctMap: Record<string, string> = {};
      for (const s of SEAMS) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, SEAM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Some seams enclose the raw edges for strength and neatness; the plain seam is the simplest and leaves edges exposed.",
        explanation: SEAMS.map((s) => `${s.label}: ${s.detail}.`).join(" "),
      };
    }

    if (branch === "use-choice") {
      const u = randChoice(rng, USE_ITEMS);
      const correct = SEAMS.find((s) => s.id === u.bucket)!;
      const others = SEAMS.filter((s) => s.id !== u.bucket).map((s) => s.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, USE_CHOICE_PROMPTS)(u.text),
        choices,
        correctIndex,
        hint: "Match the strength, neatness, or fabric type needed to the seam designed for it.",
        explanation: `${correct.label} is the best fit: ${correct.detail}.`,
      };
    }

    if (branch === "fabric-calc") {
      const length = randInt(rng, 30, 80);
      const width = randInt(rng, 20, 50);
      const seamAllowanceCm = randChoice(rng, [1, 1.5, 2] as const);
      const requiredLength = length + 2 * seamAllowanceCm;
      const requiredWidth = width + 2 * seamAllowanceCm;
      const area = requiredLength * requiredWidth;
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FABRIC_CALC_PROMPTS)(length, width, seamAllowanceCm),
        before: "Fabric area needed =",
        after: "cm²",
        correctAnswer: String(area),
        inputMode: "numeric",
        visual: { type: "rectangle", width: length, height: width, labelWidth: `${length} cm`, labelHeight: `${width} cm` },
        hint: `Add the seam allowance to both sides of each dimension: length + 2×allowance, and width + 2×allowance. Then multiply.`,
        explanation: `Fabric length needed $= ${length} + 2 \\times ${seamAllowanceCm} = ${requiredLength}$ cm. Fabric width needed $= ${width} + 2 \\times ${seamAllowanceCm} = ${requiredWidth}$ cm. Area $= ${requiredLength} \\times ${requiredWidth} = ${area}$ cm².`,
      };
    }

    if (branch === "reverse-fabric") {
      const seamAllowanceCm = randChoice(rng, [1, 1.5, 2] as const);
      const finishedLength = randInt(rng, 30, 70);
      const requiredLength = finishedLength + 2 * seamAllowanceCm;
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, REVERSE_FABRIC_PROMPTS)(requiredLength, seamAllowanceCm),
        before: "Finished length =",
        after: "cm",
        correctAnswer: String(finishedLength),
        inputMode: "numeric",
        hint: "Subtract the seam allowance from both ends of the fabric strip.",
        explanation: `Finished length $= ${requiredLength} - 2 \\times ${seamAllowanceCm} = ${finishedLength}$ cm.`,
      };
    }

    // construct-order
    const items = shuffle(rng, CONSTRUCT_STEPS);
    return {
      kind: "ordering",
      prompt: randChoice(rng, CONSTRUCT_ORDER_PROMPTS),
      instruction: "Click them in order.",
      items,
      correctOrder: CONSTRUCT_STEPS.map((s) => s.id),
      hint: "Measure and cut before sewing, and press and finish come last.",
      explanation: CONSTRUCT_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
