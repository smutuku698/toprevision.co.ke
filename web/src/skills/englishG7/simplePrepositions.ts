import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PREP_PHRASES: { phrase: string; type: "agent" | "instrument" | "direction" }[] = [
  { phrase: "inspected by the traffic officer", type: "agent" },
  { phrase: "written by the conductor", type: "agent" },
  { phrase: "driven by a licensed driver", type: "agent" },
  { phrase: "tightened with a spanner", type: "instrument" },
  { phrase: "cleaned with a wet cloth", type: "instrument" },
  { phrase: "fastened with a seatbelt", type: "instrument" },
  { phrase: "travelling to Kisumu", type: "direction" },
  { phrase: "coming from Eldoret", type: "direction" },
  { phrase: "driving through the tunnel", type: "direction" },
  { phrase: "walking across the road", type: "direction" },
  { phrase: "heading towards the terminus", type: "direction" },
  { phrase: "moving along the highway", type: "direction" },
] as const;

const PREP_TYPE_LABELS: Record<string, string> = {
  agent: "Preposition of agent (shows who did the action)",
  instrument: "Preposition of instrument (shows what tool was used)",
  direction: "Preposition of direction (shows movement to/from a place)",
};

const IDENTIFY_MC: { sentence: string; target: string; correct: string; distractors: string[] }[] = [
  { sentence: "The matatu was inspected by the traffic police before the trip.", target: "by", correct: "Preposition of agent", distractors: ["Preposition of instrument", "Preposition of direction", "Preposition of place"] },
  { sentence: "The mechanic tightened the loose bolt with a spanner.", target: "with", correct: "Preposition of instrument", distractors: ["Preposition of agent", "Preposition of direction", "Preposition of place"] },
  { sentence: "The bus travelled from Nakuru to Nairobi in three hours.", target: "from", correct: "Preposition of direction", distractors: ["Preposition of agent", "Preposition of instrument", "Preposition of place"] },
  { sentence: "The speed governor was fitted by a certified garage.", target: "by", correct: "Preposition of agent", distractors: ["Preposition of instrument", "Preposition of direction", "Preposition of place"] },
  { sentence: "The conductor wiped the windscreen with a soft cloth.", target: "with", correct: "Preposition of instrument", distractors: ["Preposition of agent", "Preposition of direction", "Preposition of place"] },
  { sentence: "The bus drove carefully through the busy town centre.", target: "through", correct: "Preposition of direction", distractors: ["Preposition of agent", "Preposition of instrument", "Preposition of place"] },
];

const SAFETY_MC: { before: string; after: string; correct: string; distractors: string[] }[] = [
  { before: "A roadworthy vehicle must be fitted ", after: " a working speed governor.", correct: "with", distractors: ["by", "from", "to"] },
  { before: "Every matatu must be licensed ", after: " the National Transport and Safety Authority.", correct: "by", distractors: ["with", "from", "into"] },
  { before: "Seatbelts protect passengers ", after: " serious injury during an accident.", correct: "from", distractors: ["with", "by", "into"] },
  { before: "The vehicle must be driven ", after: " a qualified, licensed driver.", correct: "by", distractors: ["with", "from", "through"] },
  { before: "The mechanic tightened every bolt ", after: " a torque wrench before the inspection.", correct: "with", distractors: ["by", "from", "to"] },
  { before: "The route certificate was issued ", after: " the county transport office.", correct: "by", distractors: ["with", "into", "through"] },
];

const CONSTRUCT_FILL: { before: string; after: string; correctAnswer: string; clue: "agent" | "instrument" | "direction" }[] = [
  { before: "The safety of every vehicle is checked ", after: " the traffic police before it is allowed on the road.", correctAnswer: "by", clue: "agent" },
  { before: "The conductor tightened the loose seat ", after: " a screwdriver.", correctAnswer: "with", clue: "instrument" },
  { before: "The bus travelled all the way ", after: " Mombasa to Nairobi without stopping.", correctAnswer: "from", clue: "direction" },
  { before: "The driver steered carefully ", after: " the busy roundabout.", correctAnswer: "around", clue: "direction" },
  { before: "Pedestrians should walk ", after: " the designated zebra crossing, not across the open road.", correctAnswer: "along", clue: "direction" },
  { before: "The matatu is heading ", after: " the terminus for its final stop.", correctAnswer: "towards", clue: "direction" },
  { before: "The vehicle's logbook was signed ", after: " the registered owner.", correctAnswer: "by", clue: "agent" },
  { before: "The driver checked the tyre pressure ", after: " a gauge before the journey.", correctAnswer: "with", clue: "instrument" },
];

const MATCH_POOL: { word: string; label: string }[] = [
  { word: "by", label: "Shows who performed the action — e.g. 'inspected by the officer'" },
  { word: "with", label: "Shows the tool used — e.g. 'tightened with a spanner'" },
  { word: "to", label: "Shows the destination — e.g. 'travelling to Kisumu'" },
  { word: "from", label: "Shows the starting point — e.g. 'coming from Eldoret'" },
  { word: "through", label: "Shows movement inside something — e.g. 'driving through the tunnel'" },
  { word: "across", label: "Shows movement from one side to another — e.g. 'walking across the road'" },
];

export const simplePrepositions: Skill = {
  id: "g7-eng-g-simple-prepositions",
  code: "G.8",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Simple Prepositions",
  description: "Identify and use prepositions of agent, instrument, and direction in sentences about travel and vehicle safety.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify-mc", "safety-mc", "fill", "match"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, PREP_PHRASES).slice(0, 6);
      const buckets = [
        { id: "agent", label: "Agent (who did it)" },
        { id: "instrument", label: "Instrument (what tool was used)" },
        { id: "direction", label: "Direction (movement to/from somewhere)" },
      ];
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.phrase }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each phrase by the type of preposition it uses: agent, instrument, or direction.",
        items,
        buckets,
        correctBucket,
        hint: "Agent prepositions name who did something (by). Instrument prepositions name a tool (with). Direction prepositions show movement (to, from, through, across, towards, along).",
        explanation: chosen.map((c) => `"${c.phrase}" uses a ${PREP_TYPE_LABELS[c.type].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "identify-mc") {
      const entry = randChoice(rng, IDENTIFY_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `What type of preposition is "${entry.target}" in this sentence? "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Ask: does this word show who did it, what tool was used, or a direction of movement?",
        explanation: `"${entry.target}" is a ${entry.correct.toLowerCase()} in this sentence: "${entry.sentence}"`,
      };
    }

    if (branch === "safety-mc") {
      const entry = randChoice(rng, SAFETY_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which preposition correctly completes this sentence about vehicle safety? "${entry.before}___${entry.after}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Only one preposition correctly matches the meaning — agent, instrument, and direction prepositions are not interchangeable.",
        explanation: `"${entry.correct}" is correct: "${entry.before}${entry.correct}${entry.after}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_POOL).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((c, i) => ({ id: `w${i}`, label: c.word })));
      const targets = shuffle(rng, chosen.map((c, i) => ({ id: `w${i}`, label: c.label })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((c, i) => (correctMap[`w${i}`] = `w${i}`));
      return {
        kind: "click-match",
        prompt: "Match each preposition to how it is used in a sentence about travel.",
        tokens,
        targets,
        correctMap,
        hint: "Think of a travel sentence using each preposition, then decide what job it does in that sentence.",
        explanation: chosen.map((c) => `"${c.word}" — ${c.label}.`).join(" "),
      };
    }

    const entry = randChoice(rng, CONSTRUCT_FILL);
    const clueText = entry.clue === "agent" ? "who performed the action" : entry.clue === "instrument" ? "what tool or thing was used" : "the direction of movement";
    return {
      kind: "fill-blank",
      prompt: `Fill in the preposition that shows ${clueText}.`,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: `This blank needs a preposition of ${entry.clue}.`,
      explanation: `"${entry.correctAnswer}" fits here, showing ${clueText}: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
