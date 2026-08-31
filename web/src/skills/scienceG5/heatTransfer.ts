import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, identifyPrompt, orderPrompt, fillBlankPrompt } from "./g5SciShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Science & Technology, sub-strand 3.3 Heat Transfer — the 3 named modes (conduction, convection,
// radiation), classifying good/poor conductors, 5 named applications of heat transfer, and safety precautions
// including fire-emergency response. See curriculum-reference/grade-5/science-and-technology.json.

const MODES = [
  { id: "conduction" as const, label: "Conduction", def: "Heat passing directly through a solid material, from particle to particle" },
  { id: "convection" as const, label: "Convection", def: "Heat moving through a liquid or gas as warmer, less dense parts rise and cooler, denser parts sink" },
  { id: "radiation" as const, label: "Radiation", def: "Heat travelling as rays through empty space or air, without needing to touch anything" },
];

const GOOD_CONDUCTORS = ["steel", "aluminium", "copper"] as const;
const POOR_CONDUCTORS = ["wood", "plastic", "glass", "rubber", "stone", "ceramic", "cement", "paper"] as const;

const HEAT_APPLICATIONS = [
  { id: "cooking", label: "Cooking", desc: "Heat transferred to food, such as from a hot pan, cooks it" },
  { id: "melting", label: "Melting", desc: "Heat applied to a solid, such as ice or wax, turns it into a liquid" },
  { id: "freezing", label: "Freezing", desc: "Removing heat from a liquid, such as water, turns it into a solid" },
  { id: "body-temp", label: "Maintaining body temperature", desc: "The body produces and manages heat to stay at a healthy, steady temperature" },
  { id: "insulation", label: "Insulation", desc: "A poor conductor material is used to slow down unwanted heat transfer, such as in a flask or oven glove" },
] as const;

const SAFETY_SCENARIOS = [
  { desc: "A learner picks a hot cooking pot off the fire using bare hands instead of oven gloves.", isSafe: false, why: "Bare hands can be burned by direct contact with a hot pot — oven gloves (poor conductors) should always be used." },
  { desc: "A cook keeps flammable materials, such as paper and cloth, well away from an open cooking fire.", isSafe: true, why: "Keeping flammable materials away from an open flame reduces the risk of an accidental fire." },
  { desc: "A learner leaves a lit candle burning unattended in a room and walks away.", isSafe: false, why: "An open flame should never be left unattended, since it could accidentally start a fire." },
  { desc: "A learner uses a dry cloth pot-holder to lift a hot metal pot handle off the stove.", isSafe: true, why: "A dry cloth pot-holder is a poor conductor, protecting the hand from the hot metal handle." },
  { desc: "Someone pours water directly onto a pan of hot burning cooking oil to try to put it out.", isSafe: false, why: "Water poured onto burning oil can cause the fire to splash and spread violently — oil fires should be smothered, not doused with water." },
  { desc: "A family keeps a working fire extinguisher and a clear escape route in their kitchen.", isSafe: true, why: "Having a fire extinguisher and a clear escape route ready is good fire-safety preparation." },
  { desc: "A learner's clothing catches fire, and they immediately stop, drop to the ground and roll to smother the flames.", isSafe: true, why: "Stop, drop and roll is the correct emergency response for clothing that has caught fire." },
  { desc: "A learner touches a metal spoon left standing in a pot of hot soup, without checking first.", isSafe: false, why: "Metal is a good conductor, so a metal spoon left in hot soup quickly becomes hot enough to burn skin." },
] as const;

const SAFETY_CLOSERS = [
  "Is this safe practice when handling heat?",
  "Is this a safe way to handle heat?",
  "Would you say this is safe heat-handling practice?",
  "Is this the correct, safe way to handle heat?",
  "Does this show safe or unsafe practice around heat?",
  "Is this a good safety habit around heat, or not?",
  "Would this be considered safe when working with heat?",
  "Is this a wise precaution to take around heat, or a risky one?",
  "Should this be considered safe practice around heat?",
  "Is this how heat should safely be handled?",
  "Does this action keep a person safe around heat?",
  "Is this a sensible safety practice when heat is involved?",
] as const;

const FIRE_RESPONSE_STEPS = [
  { id: "r1", label: "Stay calm and alert others nearby to the fire" },
  { id: "r2", label: "If safe to do so, use an appropriate method (extinguisher, sand, or a fire blanket) to try to put out a small fire" },
  { id: "r3", label: "If the fire is too big to control, evacuate the area immediately using the nearest safe exit" },
  { id: "r4", label: "Move to a safe assembly point away from the building" },
  { id: "r5", label: "Alert an adult or the emergency services about the fire" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} holds one end of a metal spoon in ${place(rng)} while the other end sits in a pot of hot soup, and soon feels the held end getting warm too. How did the heat reach ${who}'s hand?`,
      correct: "By conduction, as heat passed directly through the metal spoon from particle to particle",
      wrong: ["By convection, since the spoon is a liquid", "By radiation, since the spoon must be glowing hot", "The heat did not actually travel through the spoon at all"],
      explanation: "Heat passing through a solid material, like a metal spoon, from one end to the other is conduction.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} boils a pot of water in ${place(rng)} and notices the water at the bottom rises while cooler water from the top sinks down to take its place, creating a circular motion. What mode of heat transfer is this?`,
    correct: "Convection",
    wrong: ["Conduction", "Radiation", "None — this motion has nothing to do with heat transfer"],
    explanation: "Warmer, less dense water rising while cooler, denser water sinks — creating a circulating current — is convection, which happens in liquids and gases.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} stands a short distance from a bonfire in ${place(rng)} and feels warmth on the skin, even without touching the fire or the air moving directly toward them. How is this heat reaching ${who}?`,
      correct: "By radiation, as heat travels as rays through the air without needing direct contact",
      wrong: ["By conduction, since the skin is touching the fire directly", "By convection only, since no air movement is involved", "Heat cannot travel without physical contact"],
      explanation: "Feeling warmth from a distance, without touching the heat source, is radiation — heat travelling as rays through space or air.",
    };
  },
  (rng) => ({
    prompt: `A cook in ${place(rng)} chooses a wooden spoon rather than a metal one for stirring hot stew on the fire. Why is the wooden spoon a safer choice for the handle?`,
    correct: "Wood is a poor conductor of heat, so it stays cooler to hold than metal would",
    wrong: ["Wood is actually a better conductor of heat than metal", "The choice of spoon material has no effect on heat reaching the hand", "Wooden spoons cannot be used near heat at all"],
    explanation: "Wood is a poor conductor, meaning heat passes through it slowly — this keeps the handle cooler and safer to hold than a metal spoon would be.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} places an ice cube in direct sunlight and watches it slowly turn into a puddle of water. What is happening?`,
      correct: "Melting — heat from the sun is being absorbed by the ice, turning it from a solid into a liquid",
      wrong: ["Freezing — the ice is turning into an even colder solid", "Convection — the ice itself is circulating", "Nothing related to heat transfer is happening"],
      explanation: "Heat absorbed by the ice raises its temperature until it changes from solid to liquid — melting, one of the named applications of heat transfer.",
    };
  },
  (rng) => ({
    prompt: `A flask designed to keep tea hot for hours in ${place(rng)} has a double-walled design with poor-conductor materials and trapped air between the walls. What application of heat transfer does this design rely on?`,
    correct: "Insulation, which slows down unwanted heat transfer out of the flask",
    wrong: ["Conduction, which is being maximised by the flask's design", "Freezing, since the flask is meant to cool the tea", "Radiation, since the flask blocks all radiation completely"],
    explanation: "A flask uses poor-conductor materials to insulate its contents, slowing heat loss — the insulation application of heat transfer.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} runs a short distance on a cold morning in ${place(rng)} and notices their body starts to feel warmer even though the air outside hasn't changed. What is the body doing?`,
      correct: "Maintaining body temperature by producing extra heat through physical activity",
      wrong: ["The body has no way of managing its own temperature", "The outside air temperature must have actually increased", "This shows convection happening entirely outside the body"],
      explanation: "The human body manages and produces heat to maintain a steady internal temperature — the maintaining-body-temperature application of heat transfer.",
    };
  },
  (rng) => ({
    prompt: `A metal pot handle in ${place(rng)} becomes too hot to touch after cooking, while the pot's wooden handle stays cool enough to hold safely. What does this comparison best demonstrate?`,
    correct: "Metal is a good conductor of heat, while wood is a poor conductor",
    wrong: ["Metal and wood conduct heat exactly the same amount", "Wood is actually a better conductor of heat than metal", "Neither material conducts heat at all"],
    explanation: "Metal conducts heat well (quickly becoming hot), while wood conducts heat poorly (staying cooler) — the good conductor/poor conductor distinction.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s clothing accidentally catches fire near a cooking fire in ${place(rng)}. What is the correct immediate response?`,
      correct: "Stop, drop to the ground, and roll to smother the flames",
      wrong: ["Run as fast as possible to find help", "Pour cooking oil on the flames to put them out", "Wave the burning clothing in the air to cool it down"],
      explanation: "Stop, drop and roll is the standard, correct emergency response for clothing that has caught fire, since running fans the flames.",
    };
  },
  (rng) => ({
    prompt: `A kitchen fire caused by hot cooking oil breaks out in ${place(rng)}, and someone nearby reaches for a bucket of water to throw on it. What should actually be done instead, and why?`,
    correct: "Smother the fire (with a lid, fire blanket, or sand) instead of using water, because water can make an oil fire splash and spread",
    wrong: ["Water is always the safest way to extinguish any fire", "Nothing should be done — oil fires always go out on their own", "Fanning the fire with a cloth would be the safest response"],
    explanation: "Water should never be poured on a hot oil fire, since it can cause dangerous splashing and spreading — smothering the fire is the correct response.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} touches a ceramic mug and then a metal spoon, both of which have been sitting in the same hot drink for the same amount of time, in ${place(rng)}. Which is more likely to feel hotter to the touch, and why?`,
      correct: "The metal spoon, because metal is a good conductor and transfers heat to the hand much faster than ceramic",
      wrong: ["The ceramic mug, because ceramic always conducts heat faster than metal", "Both would feel exactly the same, since heat transfer doesn't depend on material", "Neither would ever feel hot, regardless of the drink's temperature"],
      explanation: "Metal is a good conductor of heat, so it transfers heat to the hand faster than ceramic (a poor conductor) does, making it feel hotter.",
    };
  },
  (rng) => ({
    prompt: `A school in ${place(rng)} practises a fire drill where learners immediately stop what they're doing and calmly walk to an assembly point outside when the fire alarm sounds. Why is walking calmly, rather than running or pushing, important?`,
    correct: "Walking calmly to an exit reduces the risk of falls and injuries during an evacuation",
    wrong: ["Running quickly is always safer during any fire emergency", "Calm walking has no real safety benefit during an emergency", "Fire drills serve no real safety purpose"],
    explanation: "Evacuating calmly and in an orderly way reduces the risk of injury from falls or crowding — an important part of safe fire-emergency response.",
  }),
];

export const heatTransfer: Skill = {
  id: "g5-sci-fe-heat-transfer",
  code: "FE.3",
  subjectId: "science",
  strandId: "g5-sci-fe",
  grade: 5,
  title: "Heat transfer",
  description: "The three modes of heat transfer (conduction, convection, radiation), classifying good and poor conductors, five named applications of heat transfer, and safety precautions including fire-emergency response.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["mode-identify", "conductor-categorize", "application-match", "safety-evaluate", "fire-response-order", "reasoning", "fill-blank"] as const
    );

    if (branch === "mode-identify") {
      const target = randChoice(rng, MODES);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.label, MODES.filter((m) => m.id !== target.id).map((m) => m.label), 2);
      return {
        kind: "multiple-choice",
        prompt: identifyPrompt(rng, "mode of heat transfer"),
        visual: { type: "heat-transfer-mode", mode: target.id },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This shows ${target.label.toLowerCase()}. ${target.def}.`,
      };
    }

    if (branch === "conductor-categorize") {
      const good = shuffle(rng, [...GOOD_CONDUCTORS]).slice(0, 3);
      const poor = shuffle(rng, [...POOR_CONDUCTORS]).slice(0, 5);
      const items = shuffle(rng, [
        ...good.map((m) => ({ id: `g-${m}`, label: m.charAt(0).toUpperCase() + m.slice(1) })),
        ...poor.map((m) => ({ id: `p-${m}`, label: m.charAt(0).toUpperCase() + m.slice(1) })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.id.startsWith("g-") ? "good" : "poor";
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is a good or a poor conductor of heat"),
        items,
        buckets: [
          { id: "good", label: "Good conductor" },
          { id: "poor", label: "Poor conductor" },
        ],
        correctBucket,
        hint: "Metals conduct heat well; most non-metal materials such as wood, plastic and cloth are poor conductors.",
        explanation: items.map((it) => `${it.label} is a ${correctBucket[it.id] === "good" ? "good" : "poor"} conductor of heat.`).join(" "),
      };
    }

    if (branch === "application-match") {
      const tokens = shuffle(rng, HEAT_APPLICATIONS.map((a) => ({ id: a.id, label: a.label })));
      const targets = shuffle(rng, HEAT_APPLICATIONS.map((a) => ({ id: a.id, label: a.desc })));
      const correctMap: Record<string, string> = {};
      for (const a of HEAT_APPLICATIONS) correctMap[a.id] = a.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "application of heat transfer to its description"),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether heat is being added, removed, transferred to food, managed by the body, or blocked.",
        explanation: HEAT_APPLICATIONS.map((a) => `${a.label} — ${a.desc}.`).join(" "),
      };
    }

    if (branch === "safety-evaluate") {
      const s = randChoice(rng, SAFETY_SCENARIOS);
      const safeLabel = "Yes, this is safe practice";
      const unsafeLabel = "No, this is not safe practice";
      const choices = shuffle(rng, [safeLabel, unsafeLabel]);
      const correctLabel = s.isSafe ? safeLabel : unsafeLabel;
      return {
        kind: "multiple-choice",
        prompt: `${s.desc} ${randChoice(rng, SAFETY_CLOSERS)}`,
        choices,
        correctIndex: choices.indexOf(correctLabel),
        layout: "list",
        explanation: s.why,
      };
    }

    if (branch === "fire-response-order") {
      const shuffled = shuffle(rng, FIRE_RESPONSE_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of responding to a fire emergency"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: FIRE_RESPONSE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Alert others first, try to control a small fire if safe, otherwise evacuate, then reach safety and alert help.",
        explanation: "Correct order: " + FIRE_RESPONSE_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "Heat passing directly through a solid, from particle to particle, is called ", after: ".", correctAnswer: "conduction" },
      { before: "Heat moving through a liquid or gas as warm parts rise and cool parts sink is called ", after: ".", correctAnswer: "convection" },
      { before: "Heat travelling as rays through air or empty space, without touching anything, is called ", after: ".", correctAnswer: "radiation" },
      { before: "Metals such as steel, aluminium and copper are good ", after: " of heat.", correctAnswer: "conductors" },
      { before: "Materials such as wood, plastic and rubber are poor ", after: " of heat.", correctAnswer: "conductors" },
      { before: "Heat applied to ice or wax until it turns to liquid is an example of ", after: ".", correctAnswer: "melting" },
      { before: "Removing heat from water until it turns solid is an example of ", after: ".", correctAnswer: "freezing" },
      { before: "A poor-conductor material used to slow down unwanted heat transfer is used for ", after: ".", correctAnswer: "insulation" },
      { before: "Oven gloves should always be used to protect hands from a hot ", after: ".", correctAnswer: "pot", alsoAccept: ["pan"] },
      { before: "The correct response for clothing that has caught fire is to stop, drop and ", after: ".", correctAnswer: "roll" },
      { before: "Water should never be poured onto a burning pan of ", after: ", since it can cause dangerous splashing.", correctAnswer: "oil" },
      { before: "During a fire emergency, learners should evacuate calmly to a safe ", after: " point.", correctAnswer: "assembly" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    const alsoAccept: readonly string[] = "alsoAccept" in fb ? fb.alsoAccept : [];
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer, ...alsoAccept],
      inputMode: "text",
      hint: "Think about the 3 modes of heat transfer, conductors, applications, and fire safety.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
