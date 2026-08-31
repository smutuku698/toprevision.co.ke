import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

interface ExcretoryPart {
  id: string;
  label: string;
  xPercent: number;
  yPercent: number;
  fn: string;
}

const URINARY_PARTS: ExcretoryPart[] = [
  { id: "kidney-left", label: "Kidney", xPercent: 14, yPercent: 33.3, fn: "Filters waste products, excess salts and water out of the blood, forming urine." },
  { id: "kidney-right", label: "Kidney", xPercent: 85, yPercent: 28.3, fn: "Filters waste products, excess salts and water out of the blood, forming urine." },
  { id: "ureter-left", label: "Ureter", xPercent: 27.5, yPercent: 58.3, fn: "A tube that carries urine from a kidney down to the bladder." },
  { id: "ureter-right", label: "Ureter", xPercent: 70, yPercent: 56.7, fn: "A tube that carries urine from a kidney down to the bladder." },
  { id: "bladder", label: "Bladder", xPercent: 50, yPercent: 76.7, fn: "A muscular sac that stores urine until it is released from the body." },
  { id: "urethra", label: "Urethra", xPercent: 50, yPercent: 91.7, fn: "The tube through which urine leaves the bladder and exits the body." },
];

const SKIN_PARTS: ExcretoryPart[] = [
  { id: "epidermis", label: "Epidermis", xPercent: 15, yPercent: 13.3, fn: "The outer, protective layer of the skin." },
  { id: "dermis", label: "Dermis", xPercent: 15, yPercent: 53.3, fn: "The thicker layer beneath the epidermis, containing sweat glands and hair follicles." },
  { id: "hair", label: "Hair", xPercent: 32, yPercent: 6.7, fn: "Grows from a follicle in the dermis and extends above the skin's surface." },
  { id: "sweat-gland", label: "Sweat gland", xPercent: 56.5, yPercent: 63.3, fn: "A coiled structure in the dermis that produces sweat." },
  { id: "sweat-duct", label: "Sweat duct", xPercent: 60, yPercent: 33.3, fn: "The tube that carries sweat from the sweat gland up to the skin's surface." },
  { id: "sweat-pore", label: "Sweat pore", xPercent: 60, yPercent: 17.3, fn: "The tiny opening on the skin's surface where sweat is released." },
];

const WASTE_ITEMS = [
  { text: "Excess salts and water, released as sweat", organ: "skin" },
  { text: "A small amount of urea, released as sweat", organ: "skin" },
  { text: "Carbon dioxide, breathed out", organ: "lungs" },
  { text: "Water vapour, breathed out", organ: "lungs" },
  { text: "Urea (from broken-down proteins), removed in urine", organ: "kidneys" },
  { text: "Excess salts and water, removed in urine", organ: "kidneys" },
  { text: "Excess water-soluble vitamins, removed in urine", organ: "kidneys" },
  { text: "Excess hormones broken down by the body, removed in urine", organ: "kidneys" },
  { text: "Warm, moist air containing water vapour, exhaled after every breath", organ: "lungs" },
  { text: "Body heat released along with sweat during exercise", organ: "skin" },
] as const;

const KNOWLEDGE_QUESTIONS = [
  {
    prompt: "Which daily habit helps keep the kidneys healthy?",
    correct: "Drinking enough clean water every day.",
    wrong: ["Holding in urine for as long as possible.", "Eating very large amounts of salt every day.", "Avoiding all physical exercise."],
    explanation: "Drinking enough water helps the kidneys flush out waste products efficiently and reduces the risk of problems such as kidney stones.",
  },
  {
    prompt: "A common cause of kidney stones is:",
    correct: "Not drinking enough water, which allows minerals in the urine to crystallise.",
    wrong: ["Drinking too much clean water.", "Washing your hands regularly.", "Getting enough sleep at night."],
    explanation: "When a person doesn't drink enough water, urine becomes concentrated and minerals in it can crystallise, forming kidney stones.",
  },
  {
    prompt: "Why does the skin need to be kept clean through regular washing?",
    correct: "It removes sweat, dirt and bacteria, keeping sweat pores clear and reducing the risk of skin infections.",
    wrong: ["It has no effect on skin health.", "It makes the epidermis grow thicker.", "It stops the kidneys from working."],
    explanation: "Regular washing removes sweat, dirt and bacteria from the skin's surface, keeping sweat pores clear and lowering the risk of skin infections.",
  },
  {
    prompt: "A learner notices they produce very little, dark-coloured urine on a hot day despite feeling thirsty. What does this suggest?",
    correct: "The body is short of water, so the kidneys are conserving it by producing less, more concentrated urine.",
    wrong: ["The kidneys have stopped working entirely.", "It means too much water was drunk that day.", "It has no connection to how much water was drunk."],
    explanation: "When the body is short of water, the kidneys conserve it by producing less, more concentrated (darker) urine — a normal warning sign to drink more water, not organ failure.",
  },
  {
    prompt: "Why does a person sweat more on a hot day or during exercise?",
    correct: "Sweating increases to release more excess heat and help cool the body down.",
    wrong: ["The kidneys stop working, so the skin takes over completely.", "It happens randomly and has no link to body temperature.", "It means the person is unwell."],
    explanation: "The skin releases more sweat when the body needs to lose more heat, such as on a hot day or during exercise — evaporating sweat cools the skin's surface.",
  },
  {
    prompt: "Why is holding in urine for a very long time, repeatedly, not a healthy habit?",
    correct: "It can stretch the bladder and increase the risk of urinary tract infections over time.",
    wrong: ["It has no effect on the body at all.", "It makes the kidneys filter blood faster.", "It helps prevent kidney stones."],
    explanation: "Regularly holding urine for long periods can stretch the bladder and allow bacteria more time to multiply, increasing the risk of urinary tract infections.",
  },
  {
    prompt: "Why do the lungs count as an excretory organ, even though their main job is breathing?",
    correct: "They remove carbon dioxide and water vapour, both of which are waste products of the body's cell activity.",
    wrong: ["They only bring oxygen in and never remove anything.", "They remove urea, the same way the kidneys do.", "They are not really an excretory organ at all."],
    explanation: "Excretion is the removal of waste products made inside the body — since the lungs remove carbon dioxide and water vapour produced by cell activity, they count as an excretory organ, alongside the kidneys and skin.",
  },
] as const;

export const excretorySystem: Skill = {
  id: "g7-sci-lte-excretory",
  code: "LTE.2",
  subjectId: "science",
  strandId: "g7-sci-lte",
  grade: 7,
  title: "The human excretory system",
  description: "Parts and functions of the skin and urinary system, which organs excrete which waste products, and habits that promote kidney and skin health.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-part", "function-match", "waste-sort", "knowledge"] as const);

    if (branch === "identify-part") {
      const view = randChoice(rng, ["urinary", "skin"] as const);
      const parts = view === "urinary" ? URINARY_PARTS : SKIN_PARTS;
      const target = randChoice(rng, parts);
      const otherLabels = Array.from(new Set(parts.filter((p) => p.id !== target.id).map((p) => p.label)));
      const decoyPool = (view === "urinary" ? SKIN_PARTS : URINARY_PARTS).map((p) => p.label);
      const choices = shuffle(rng, [target.label, ...shuffle(rng, [...otherLabels, ...decoyPool]).slice(0, 3)]);
      return {
        kind: "hotspot",
        prompt: view === "urinary" ? "Click the pin, then name the labelled part of the urinary system." : "Click the pin, then name the labelled structure in this skin cross-section.",
        diagram: { type: "excretory-system", view },
        spots: parts.map(({ id, xPercent, yPercent, label }) => ({ id, xPercent, yPercent, label })),
        askId: target.id,
        choices,
        correctLabel: target.label,
        hint: "Think about what each structure does in removing waste from the body.",
        explanation: `${target.label} — ${target.fn}`,
      };
    }

    if (branch === "function-match") {
      const view = randChoice(rng, ["urinary", "skin"] as const);
      const uniqueParts =
        view === "urinary"
          ? [URINARY_PARTS[0], URINARY_PARTS[2], URINARY_PARTS[4], URINARY_PARTS[5]]
          : shuffle(rng, [...SKIN_PARTS]).slice(0, 4);
      const tokens = shuffle(rng, uniqueParts.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, uniqueParts.map((p) => ({ id: p.id, label: p.fn })));
      const correctMap: Record<string, string> = {};
      for (const p of uniqueParts) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: view === "urinary" ? "Match each part of the urinary system to its function." : "Match each part of the skin to its function.",
        tokens,
        targets,
        correctMap,
        hint: "Think about filtering blood, storing or carrying urine, or producing and releasing sweat.",
        explanation: uniqueParts.map((p) => `${p.label} — ${p.fn}`).join(" "),
      };
    }

    if (branch === "waste-sort") {
      const chosen = shuffle(rng, WASTE_ITEMS);
      const items = chosen.map((c, i) => ({ id: `w${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`w${i}`] = c.organ));
      return {
        kind: "categorize",
        prompt: "Sort each waste product by the organ that removes it from the body.",
        items,
        buckets: [
          { id: "skin", label: "Skin" },
          { id: "lungs", label: "Lungs" },
          { id: "kidneys", label: "Kidneys" },
        ],
        correctBucket,
        hint: "The skin releases sweat, the lungs release gases you breathe out, and the kidneys form urine.",
        explanation: chosen.map((c) => `"${c.text}" is removed by the ${c.organ}.`).join(" "),
      };
    }

    const q = randChoice(rng, KNOWLEDGE_QUESTIONS);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      layout: "list",
      explanation: q.explanation,
    };
  },
};
