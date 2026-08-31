import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const HAZARDS = [
  { id: "flammable", label: "Flammable", meaning: "This substance can easily catch fire — keep it away from flames and heat." },
  { id: "corrosive", label: "Corrosive", meaning: "This substance can burn or eat away skin, metal or other materials on contact." },
  { id: "toxic", label: "Toxic", meaning: "This substance is poisonous and can cause serious harm if swallowed, inhaled or touched." },
  { id: "carcinogenic", label: "Carcinogenic", meaning: "This substance may cause cancer with repeated or long-term exposure." },
  { id: "radioactive", label: "Radioactive", meaning: "This substance gives off radiation that can damage living cells." },
] as const;

// 10 distinct accident/first-aid pairs (pool-size floor: click-match fact pools need 10+ facts combined).
const ACCIDENT_FIRST_AID = [
  { accident: "Burns and scalds", firstAid: "Cool the area under clean, running water for several minutes, then cover loosely with a clean cloth." },
  { accident: "Cuts from broken glass or sharp apparatus", firstAid: "Rinse the wound, apply gentle pressure with a clean cloth to stop bleeding, and cover with a plaster or bandage." },
  { accident: "Ingestion of a harmful or unknown substance", firstAid: "Do not induce vomiting — rinse the mouth with water and get the person to a health worker immediately." },
  { accident: "Chemical splash in the eye", firstAid: "Flush the eye with clean running water for several minutes and seek medical help." },
  { accident: "Chemical splash on the skin", firstAid: "Remove any contaminated clothing and rinse the affected skin with plenty of clean water for several minutes." },
  { accident: "Inhaling irritating or toxic fumes", firstAid: "Move the person to fresh air immediately, loosen tight clothing, and seek medical help if breathing difficulty continues." },
  { accident: "Electric shock from a faulty electrical apparatus", firstAid: "Switch off the power at the source before touching the person, then check their breathing and get help." },
  { accident: "Clothing catching fire", firstAid: "Stop, drop and roll to smother the flames, or use a fire blanket if one is available." },
  { accident: "Feeling faint or dizzy during an experiment", firstAid: "Help the person sit or lie down, loosen tight clothing, and ensure they get fresh air." },
  { accident: "A broken mercury thermometer spilling its contents", firstAid: "Do not touch it with bare hands — keep others away, ventilate the room, and inform the teacher for safe cleanup." },
] as const;

// 12 distinct safety/cause facts (pool-size floor: categorize fact pools need 10+ facts combined).
const SORT_ITEMS = [
  { text: "Tying back loose hair and rolling up sleeves before an experiment", bucket: "safety" },
  { text: "Wearing safety goggles when heating a liquid", bucket: "safety" },
  { text: "Reading hazard labels before handling a chemical", bucket: "safety" },
  { text: "Reaching across a lit Bunsen burner to grab equipment", bucket: "cause" },
  { text: "Pointing a test tube being heated towards a classmate", bucket: "cause" },
  { text: "Tasting a chemical to identify it", bucket: "cause" },
  { text: "Leaving broken glass on the floor instead of reporting it", bucket: "cause" },
  { text: "Disposing of laboratory waste in the correct labelled container", bucket: "safety" },
  { text: "Wearing closed shoes instead of open sandals in the laboratory", bucket: "safety" },
  { text: "Running around inside the laboratory", bucket: "cause" },
  { text: "Checking that the gas tap is off before leaving the laboratory", bucket: "safety" },
  { text: "Sniffing a chemical directly from the container's mouth instead of wafting its vapour towards you", bucket: "cause" },
] as const;

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma",
  "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru",
] as const;

const SCHOOL_PLACES = [
  "Kericho", "Kakamega", "Machakos", "Nyeri", "Kisii", "Garissa",
  "Meru", "Voi", "Naivasha", "Kitui", "Nanyuki", "Bungoma",
] as const;

function name(rng: RNG) {
  return randChoice(rng, KENYAN_NAMES);
}
function place(rng: RNG) {
  return randChoice(rng, SCHOOL_PLACES);
}

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

// 10 distinct Apply/Evaluate-tier scenario templates (pool-size floor for reasoning multiple-choice branches).
const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  () => ({
    prompt: "Why is it important to know the safety symbols found on chemical containers?",
    correct: "They warn you of a specific danger so you know how to handle, store or dispose of the substance safely.",
    wrong: [
      "They show which country the chemical was made in.",
      "They tell you the price of the chemical.",
      "They are only decorative and have no real meaning.",
    ],
    explanation: "Hazard symbols communicate a specific danger (such as flammable or toxic) at a glance, so you know how to handle, store and dispose of a substance safely — they carry no information about origin, price or decoration.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} spills a corrosive chemical on the laboratory bench at a school in ${place(rng)}. What is the safest first action?`,
      correct: `${who} should alert the teacher immediately and follow the class's spill procedure.`,
      wrong: [
        `${who} should wipe it up quickly with bare hands.`,
        `${who} should ignore it and continue with the experiment.`,
        `${who} should smell it to find out what it is.`,
      ],
      explanation: "Corrosive chemicals can burn skin on contact — the safest first action is always to alert the teacher and follow the agreed spill procedure, never to touch or smell an unknown spill.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} finds an unlabelled white powder left on the bench in a lab in ${place(rng)} and wants to know what it is. What is the safe way to check?`,
      correct: "Never taste or directly sniff it — report it to the teacher, who can identify it safely.",
      wrong: [
        "Taste a tiny bit to see what it is.",
        "Put your nose right up to it and inhale deeply.",
        "Mix it with water to see what colour it turns.",
      ],
      explanation: "An unlabelled substance could be corrosive, toxic or reactive — tasting, deep-sniffing or experimenting with it is never safe. Always report it to the teacher.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} notices a classmate heating a liquid in a test tube without safety goggles on, at a school in ${place(rng)}. What should ${who} do?`,
      correct: "Warn the classmate and alert the teacher immediately, since a heated liquid can spit or splash without warning.",
      wrong: [
        "Say nothing, since it is not their responsibility.",
        "Wait until the experiment is finished before mentioning it.",
        "Take the classmate's goggles away as a joke.",
      ],
      explanation: "A heated liquid can spit unexpectedly and cause an eye injury — noticing and immediately flagging a missing safety measure protects a classmate from real harm.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} is heating a test tube of liquid over a Bunsen burner and points the open end towards a classmate sitting beside them. Why is this dangerous?`,
    correct: "A heated liquid can suddenly spit or shoot out of the open end, which could burn whoever it is pointed at.",
    wrong: [
      "It is dangerous because it wastes the gas in the Bunsen burner.",
      "It is dangerous because the test tube could shatter from being pointed sideways.",
      "It is not actually dangerous as long as the flame is small.",
    ],
    explanation: "Heated liquids in a test tube can suddenly bump and spit out of the open end — always point a heating test tube away from yourself and everyone else, whatever the flame size.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A small fire starts in a waste bin near ${who}'s workstation in a lab in ${place(rng)}. What is the safest immediate response?`,
      correct: "Alert the teacher and use the fire blanket or extinguisher provided, rather than trying to put it out with water.",
      wrong: [
        "Pour water straight onto the fire immediately.",
        "Leave it to burn out on its own without telling anyone.",
        "Fan it to see how big it will get.",
      ],
      explanation: "Water can spread some laboratory fires — especially chemical or electrical ones — rather than putting them out. A fire blanket or extinguisher, and immediately alerting the teacher, is the safe response.",
    };
  },
  (rng) => ({
    prompt: `Before starting an experiment with a corrosive acid, a class in ${place(rng)} is asked to put on goggles and a lab coat. Why are both needed, not just one?`,
    correct: "Goggles protect the eyes from splashes and the lab coat protects skin and clothing — each guards a different part of the body.",
    wrong: [
      "Only the lab coat is actually necessary; goggles are optional.",
      "They are worn only to identify who is doing the experiment.",
      "Only the goggles are actually necessary; the lab coat is optional.",
    ],
    explanation: "Personal protective equipment covers different risks: goggles guard the eyes from splashes, while a lab coat guards skin and clothing from spills — one does not replace the other.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sees the corrosive hazard symbol on a bottle in the school lab in ${place(rng)} and needs to pour some of it into a beaker. What precaution matters most before doing this?`,
      correct: "Wearing goggles and gloves, and pouring carefully away from the body, since a corrosive substance can burn skin or eyes on contact.",
      wrong: [
        "Warming the bottle first so it pours more easily.",
        "Shaking the bottle well before opening it.",
        "Pouring it as quickly as possible to finish the task.",
      ],
      explanation: "A corrosive hazard symbol means the substance can burn skin, eyes or materials on contact, so protective equipment and careful, controlled pouring matter most — speed and shaking are irrelevant to safety here.",
    };
  },
  (rng) => ({
    prompt: `Two learners in ${place(rng)} disagree about how to clean up broken glass on the lab floor. One says to pick up the pieces with bare hands quickly; the other says to alert the teacher and use a dustpan and brush. Who is right, and why?`,
    correct: "The second learner — broken glass should be swept up with a dustpan and brush after alerting the teacher, never picked up with bare hands.",
    wrong: [
      "The first learner — picking it up quickly with bare hands prevents anyone stepping on it sooner.",
      "Neither — broken glass should simply be left on the floor until the end of the lesson.",
      "Both are equally safe methods.",
    ],
    explanation: "Bare hands risk a cut from broken glass; a dustpan and brush (after alerting the teacher, who may also check for larger shards) removes the hazard safely.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is about to leave the laboratory in ${place(rng)} after finishing an experiment. Why is it important for ${who} to check that the gas tap is turned off before leaving?`,
      correct: "A gas tap left on can leak gas into the room, creating a fire or explosion risk even after everyone has left.",
      wrong: [
        "It only matters because it saves money on the gas bill.",
        "It has no safety importance, only a tidiness one.",
        "It is important only if a flame is still lit somewhere.",
      ],
      explanation: "An open gas tap keeps releasing gas whether or not a flame is present, which can build up to a dangerous, flammable concentration in the room — checking it is a genuine safety step, not just tidiness.",
    };
  },
];

const PREP_STEPS = [
  { id: "read", label: "Read the experiment instructions fully before starting" },
  { id: "check-labels", label: "Check the hazard labels on all substances being used" },
  { id: "wear-ppe", label: "Put on the required protective equipment, such as goggles and a lab coat" },
  { id: "clear-area", label: "Ensure the work area is clear, tidy, and free of unnecessary items" },
  { id: "begin", label: "Begin the experiment, following the instructions carefully" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A symbol on a container that warns of a specific danger is called a ", after: " symbol.", correctAnswer: "hazard", accepted: ["hazard"], explanation: "A hazard symbol warns of a specific danger, such as flammable, corrosive, or toxic." },
  { before: "A substance that can burn or eat away skin, metal, or other materials on contact is called ", after: ".", correctAnswer: "corrosive", accepted: ["corrosive"], explanation: "A corrosive substance can burn or eat away skin, metal, or other materials on contact." },
  { before: "A substance that can easily catch fire is described as ", after: ".", correctAnswer: "flammable", accepted: ["flammable"], explanation: "A flammable substance can easily catch fire and must be kept away from flames and heat." },
  { before: "A substance that is poisonous and can cause serious harm if swallowed, inhaled, or touched is called ", after: ".", correctAnswer: "toxic", accepted: ["toxic"], explanation: "A toxic substance is poisonous and can cause serious harm if swallowed, inhaled, or touched." },
  { before: "Immediate treatment given to an injured person before professional medical help arrives is called ", after: ".", correctAnswer: "first aid", accepted: ["first aid"], explanation: "First aid is immediate treatment given to an injured person before professional medical help arrives." },
  { before: "Items like goggles, gloves, and a lab coat, worn to reduce injury risk, are called personal protective ", after: ".", correctAnswer: "equipment", accepted: ["equipment"], explanation: "Personal protective equipment (PPE), such as goggles, gloves, and a lab coat, reduces the risk of injury in the laboratory." },
] as const;

export const laboratorySafety: Skill = {
  id: "g7-sci-si-lab-safety",
  code: "SI.2",
  subjectId: "science",
  strandId: "g7-sci-si",
  grade: 7,
  title: "Laboratory safety",
  description: "Hazard symbols, causes of common laboratory accidents, first aid, and safety measures in the laboratory.",
  generate(rng) {
    const branch = randChoice(rng, ["hazard-symbol", "first-aid-match", "safety-sort", "knowledge", "fill-blank", "prep-order"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about laboratory safety.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe hazards, protective equipment, and first aid.",
        explanation: fb.explanation,
      };
    }

    if (branch === "prep-order") {
      const items = shuffle(rng, PREP_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for safely preparing to start a laboratory experiment, in order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: PREP_STEPS.map((s) => s.id),
        hint: "Understand the instructions and hazards before putting on protective equipment and beginning the experiment.",
        explanation: PREP_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "hazard-symbol") {
      const target = randChoice(rng, HAZARDS);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        HAZARDS.filter((h) => h.id !== target.id).map((h) => h.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: "What does this laboratory hazard symbol mean?",
        visual: { type: "hazard-symbol", hazard: target.id },
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about what kind of danger this substance poses.",
        explanation: `This is the ${target.label} symbol. ${target.meaning}`,
      };
    }

    if (branch === "first-aid-match") {
      const chosen = shuffle(rng, ACCIDENT_FIRST_AID).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.accident, label: a.accident })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.accident, label: a.firstAid })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.accident] = a.accident;
      return {
        kind: "click-match",
        prompt: "Match each laboratory accident to the correct first aid response.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what would reduce further harm immediately after each type of accident.",
        explanation: chosen.map((a) => `${a.accident}: ${a.firstAid}`).join(" "),
      };
    }

    if (branch === "safety-sort") {
      const chosen = shuffle(rng, SORT_ITEMS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each action as a safety measure or a cause of laboratory accidents.",
        items,
        buckets: [
          { id: "safety", label: "Safety measure" },
          { id: "cause", label: "Cause of an accident" },
        ],
        correctBucket,
        hint: "A safety measure reduces risk; a cause of an accident increases the chance of someone getting hurt.",
        explanation: chosen.map((c) => `"${c.text}" is ${c.bucket === "safety" ? "a safety measure" : "a cause of accidents"}.`).join(" "),
      };
    }

    const q = randChoice(rng, REASONING_TEMPLATES)(rng);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      layout: "list",
      hint: "Think about what genuinely reduces harm in this situation, not just what seems fastest.",
      explanation: q.explanation,
    };
  },
};
