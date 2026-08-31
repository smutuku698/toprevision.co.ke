import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 1.3 Human circulatory system — the structure/function half
// (heart, blood vessels, blood components), split from circulatoryHealth.ts for depth. The design explicitly
// excludes "details of different blood vessels and parts of the body" beyond auricles, ventricles and vessels
// in general, so hotspot targets stay at that level rather than naming the aorta/vena cava specifically.

const HEART_PARTS = [
  { id: "right-atrium", label: "Right auricle (atrium)", xPercent: 35, yPercent: 40, fact: "Receives blood arriving into the heart on the right side" },
  { id: "left-atrium", label: "Left auricle (atrium)", xPercent: 65, yPercent: 40, fact: "Receives blood arriving into the heart on the left side" },
  { id: "right-ventricle", label: "Right ventricle", xPercent: 34, yPercent: 69, fact: "Pumps blood out of the heart from the right side" },
  { id: "left-ventricle", label: "Left ventricle", xPercent: 66, yPercent: 69, fact: "Pumps blood out of the heart from the left side, with the thickest, strongest muscular wall of all four chambers" },
] as const;

const BLOOD_VESSELS = [
  { id: "artery", label: "Artery", function: "Carries blood away from the heart, under high pressure, through a thick muscular wall" },
  { id: "vein", label: "Vein", function: "Carries blood back towards the heart, under lower pressure, through a thinner wall" },
  { id: "capillary", label: "Capillary", function: "The tiniest blood vessel, with an extremely thin wall that lets oxygen and nutrients pass into body cells" },
] as const;

const BLOOD_COMPONENTS = [
  { id: "red-cells", label: "Red blood cells", function: "Carry oxygen around the body" },
  { id: "white-cells", label: "White blood cells", function: "Fight germs and infections in the body" },
  { id: "platelets", label: "Platelets", function: "Help the blood clot to stop bleeding at a wound" },
  { id: "plasma", label: "Plasma", function: "The pale yellow liquid part of blood that carries blood cells and dissolved substances around the body" },
] as const;

const MODEL_STEPS = [
  { id: "m1", label: "Gather locally available materials, such as clay, balloons, straws or coloured tubing" },
  { id: "m2", label: "Shape or select a part to represent the heart" },
  { id: "m3", label: "Attach tubes or straws to represent blood vessels leading in and out" },
  { id: "m4", label: "Label each part of the model clearly" },
  { id: "m5", label: "Present and explain the finished model to peers" },
] as const;

const KENYAN_PLACES = ["Nairobi", "Mombasa", "Nakuru", "Eldoret", "Thika", "Nyeri", "Kisumu", "Machakos", "Kericho", "Meru", "Nanyuki", "Kakamega"] as const;
const KENYAN_NAMES = ["Kevo", "Naomi", "Bramwel", "Faith", "Collins", "Rehema", "Victor", "Anne", "Stephen", "Grace", "Peter", "Sharon"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A nurse at a clinic in ${place(rng)} presses two fingers on ${who}'s wrist to feel a regular pulse. What is the nurse actually feeling?`,
      correct: "Blood being pushed through an artery each time the heart beats",
      wrong: ["Blood flowing back into the heart through a vein", "Oxygen moving directly through the skin", "Air passing through blood vessels"],
      explanation: "A pulse is felt where an artery lies close to the skin, and each beat is the artery briefly stretching as blood is pumped through it by the heart.",
    };
  },
  (rng) => ({
    prompt: `A lab technician in ${place(rng)} looks at a blood sample under a microscope and counts far more of one type of cell than any other. Which type of blood cell is normally the most numerous?`,
    correct: "Red blood cells",
    wrong: ["White blood cells", "Platelets", "Plasma cells"],
    explanation: "Red blood cells, which carry oxygen, are by far the most numerous cells in blood — far more common than white blood cells or platelets.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} gets a small cut on their finger in ${place(rng)}, and after a few minutes the bleeding slows and a scab starts to form. Which blood component made this possible?`,
      correct: "Platelets, which help the blood clot",
      wrong: ["Red blood cells, which carry oxygen", "White blood cells, which fight infection", "Plasma, which only carries dissolved substances"],
      explanation: "Platelets are the blood component responsible for clotting, which stops bleeding and allows a wound to begin healing.",
    };
  },
  (rng) => ({
    prompt: `A doctor in ${place(rng)} explains to a patient that when white blood cells increase sharply in a blood test, it often means the body is doing what?`,
    correct: "Fighting off an infection",
    wrong: ["Carrying more oxygen than usual", "Forming a blood clot", "Pumping blood faster than normal"],
    explanation: "White blood cells are the body's defence cells — a sharp rise in their number is a sign the body is actively fighting germs or infection.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is building a model of the circulatory system in class in ${place(rng)} and needs to choose a part to represent the vessel with the thinnest walls, where oxygen actually passes into body cells. Which vessel should ${who} model?`,
      correct: "Capillary",
      wrong: ["Artery", "Vein", "Auricle (atrium)"],
      explanation: "Capillaries have extremely thin walls, which is exactly what allows oxygen and nutrients to pass from the blood into surrounding body cells.",
    };
  },
  (rng) => ({
    prompt: `A vet examining a cow near ${place(rng)} notices that pressing on a vein in its leg makes the blood flow more slowly return, unlike pressing near an artery. Why do veins carry blood under lower pressure than arteries?`,
    correct: "Because veins carry blood back towards the heart after most of the heart's pumping force has already been used",
    wrong: ["Because veins are thicker and stronger than arteries", "Because veins carry no blood at all, only air", "Because veins pump blood using their own muscular walls, like a second heart"],
    explanation: "By the time blood reaches the veins, most of the pressure from the heart's pump has already been used, so veins carry blood at lower pressure with thinner walls than arteries.",
  }),
  (rng) => ({
    prompt: `${name(rng)} learns in class in ${place(rng)} that the left ventricle has the thickest, strongest muscular wall of all four heart chambers. Why does it need to be so strong?`,
    correct: "Because it must pump blood with enough force to reach the whole body, not just a nearby part",
    wrong: ["Because it only needs to hold blood without pumping it anywhere", "Because it is the smallest chamber and needs extra support", "Because it receives blood rather than pumping it out"],
    explanation: "The left ventricle pumps blood out to the entire body, which needs much more force than pumping blood only a short distance — hence its thick, powerful muscular wall.",
  }),
  (rng) => ({
    prompt: `A science teacher in ${place(rng)} asks the class to name the two chambers of the heart that receive blood arriving into it, rather than pump blood out. Which two chambers is she asking about?`,
    correct: "The two auricles (atria) — right and left",
    wrong: ["The two ventricles — right and left", "The right auricle and the left ventricle", "The left auricle and the right ventricle"],
    explanation: "The two auricles (atria) are the receiving chambers of the heart; the two ventricles are the pumping chambers that send blood back out.",
  }),
];

export const heartAndBloodVessels: Skill = {
  id: "g6-sci-lte-heart-vessels",
  code: "LTE.3a",
  subjectId: "science",
  strandId: "g6-sci-lte",
  grade: 6,
  title: "Heart, blood vessels and blood",
  description: "The main parts of the human circulatory system (heart, blood vessels, blood) and their functions — auricles/ventricles, arteries/veins/capillaries, and the components of blood.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["heart-hotspot", "vessel-match", "blood-component-categorize", "model-order", "reasoning", "fill-blank"] as const
    );

    if (branch === "heart-hotspot") {
      const ask = randChoice(rng, HEART_PARTS);
      const wrongLabels = shuffle(rng, HEART_PARTS.filter((p) => p.id !== ask.id).map((p) => p.label)).slice(0, 3);
      const choices = shuffle(rng, [ask.label, ...wrongLabels]);
      const HEART_HOTSPOT_PROMPTS = [
        "Click the labelled part on the diagram of the heart, then confirm your answer below.",
        "Find and click the correct part of the heart on the diagram, then confirm below.",
        "Click where this part of the heart is on the diagram, then confirm your answer.",
        "Locate this part on the heart diagram by clicking it, then confirm below.",
        "Click the correct spot on the heart diagram, then confirm your choice.",
      ] as const;
      return {
        kind: "hotspot",
        prompt: randChoice(rng, HEART_HOTSPOT_PROMPTS),
        diagram: { type: "circulatory-system", view: "heart" },
        spots: HEART_PARTS.map((p) => ({ id: p.id, xPercent: p.xPercent, yPercent: p.yPercent, label: p.label })),
        askId: ask.id,
        choices,
        correctLabel: ask.label,
        hint: "The two chambers at the top receive blood; the two chambers at the bottom pump blood out.",
        explanation: `${ask.label}: ${ask.fact}.`,
      };
    }

    if (branch === "vessel-match") {
      const tokens = shuffle(rng, BLOOD_VESSELS.map((v) => ({ id: v.id, label: v.label })));
      const targets = shuffle(rng, BLOOD_VESSELS.map((v) => ({ id: v.id, label: v.function })));
      const correctMap: Record<string, string> = {};
      for (const v of BLOOD_VESSELS) correctMap[v.id] = v.id;
      const VESSEL_MATCH_PROMPTS = [
        "Match each blood vessel to its function.",
        "Which function belongs to each blood vessel below? Match them up.",
        "Pair each blood vessel with what it actually does.",
        "Match each blood vessel to its correct job in the body.",
        "Connect each blood vessel with its function.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, VESSEL_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about direction of blood flow, pressure, and wall thickness.",
        explanation: BLOOD_VESSELS.map((v) => `${v.label} — ${v.function}.`).join(" "),
        visual: { type: "circulatory-system", view: "vessels" },
      };
    }

    if (branch === "blood-component-categorize") {
      const items = BLOOD_COMPONENTS.map((c) => ({ id: c.id, label: c.function }));
      const correctBucket: Record<string, string> = {};
      for (const c of BLOOD_COMPONENTS) correctBucket[c.id] = c.id;
      const BLOOD_CATEGORIZE_PROMPTS = [
        "Sort each function under the correct component of blood.",
        "Which component of blood does each function below belong to? Sort them.",
        "Decide which blood component each function describes, then sort it.",
        "Group these functions under the blood component they describe.",
        "For each function, work out which blood component it belongs to.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, BLOOD_CATEGORIZE_PROMPTS),
        items: shuffle(rng, items),
        buckets: BLOOD_COMPONENTS.map((c) => ({ id: c.id, label: c.label })),
        correctBucket,
        hint: "Think about oxygen, fighting germs, clotting, and the liquid that carries everything else.",
        explanation: BLOOD_COMPONENTS.map((c) => `${c.label} — ${c.function}.`).join(" "),
        visual: { type: "circulatory-system", view: "blood" },
      };
    }

    if (branch === "model-order") {
      const shuffled = shuffle(rng, MODEL_STEPS);
      const MODEL_ORDER_PROMPTS = [
        "Put the steps of building a simple model of the human circulatory system in the correct order.",
        "Arrange these steps for building a circulatory system model in the right order.",
        "Place these model-building steps in the order you would actually carry them out.",
        "Order these steps for making a circulatory system model, from first to last.",
        "Sort these circulatory system model steps into the correct sequence.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, MODEL_ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: MODEL_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Start with gathering materials and finish with presenting the model.",
        explanation: "Correct order: " + MODEL_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "The heart chamber that receives blood arriving into the heart is called the ", after: " (atrium).", correctAnswer: "auricle" },
      { before: "The heart chamber that pumps blood out of the heart is called the ", after: ".", correctAnswer: "ventricle" },
      { before: "The blood vessel that carries blood away from the heart under high pressure is the ", after: ".", correctAnswer: "artery" },
      { before: "The blood vessel that carries blood back towards the heart is the ", after: ".", correctAnswer: "vein" },
      { before: "The tiniest blood vessel, where oxygen passes into body cells, is the ", after: ".", correctAnswer: "capillary" },
      { before: "The blood cells that carry oxygen around the body are ", after: ".", correctAnswer: "red blood cells" },
      { before: "The blood cells that fight germs and infection are ", after: ".", correctAnswer: "white blood cells" },
      { before: "The blood component that helps blood clot at a wound is called ", after: ".", correctAnswer: "platelets" },
      { before: "The pale yellow liquid part of blood that carries cells and dissolved substances is ", after: ".", correctAnswer: "plasma" },
      { before: "Of the four heart chambers, the one with the thickest, strongest wall is the ", after: " ventricle.", correctAnswer: "left" },
      { before: "The human circulatory system is made up of the heart, blood vessels and ", after: ".", correctAnswer: "blood" },
      { before: "Fine details of individual named blood vessels beyond arteries, veins and capillaries are ", after: " at this level.", correctAnswer: "not needed" },
      { before: "A pulse felt at the wrist is caused by blood being pushed through an ", after: ".", correctAnswer: "artery" },
      { before: "Building a model of the circulatory system links to modelling skills learned in ", after: ".", correctAnswer: "creative arts" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer],
      inputMode: "text",
      hint: "Think about the parts of the heart, blood vessels and blood.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
