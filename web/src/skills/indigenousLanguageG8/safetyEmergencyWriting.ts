import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CONNECTORS: { term: string; use: string }[] = [
  { term: "First / Firstly", use: "introduces the very first step in the process" },
  { term: "Then", use: "shows a step that follows soon after the previous one" },
  { term: "Next", use: "shows the step that comes right after the one before it" },
  { term: "After that", use: "shows a step that follows once the earlier action is complete" },
  { term: "Finally / Lastly", use: "introduces the last step in the process" },
];

// A realistic classroom-fire response sequence, using the connectors in order.
const EMERGENCY_STEPS: { id: string; label: string }[] = [
  { id: "alert", label: "First, alert the teacher and shout 'Fire!' so everyone nearby hears" },
  { id: "stop", label: "Then, stop all work and leave books and bags behind" },
  { id: "line", label: "Next, form a line and walk quickly to the nearest exit" },
  { id: "assembly", label: "After that, move calmly to the school's assembly point" },
  { id: "register", label: "Finally, wait for the teacher to call the register and confirm everyone is safe" },
];

// Each item explicitly labels its position (Step X of 5) so the blank has exactly one correct
// connector, with no ambiguity against other sequence connectors.
const CONNECTOR_SENTENCES: { before: string; connector: string; after: string; distractors: string[] }[] = [
  { before: "Step 1 of 5 —", connector: "First", after: ", sound the alarm so the whole school hears it.", distractors: ["Finally", "After that", "Then"] },
  { before: "Step 2 of 5 —", connector: "Then", after: ", gather your classmates and move towards the door.", distractors: ["First", "Lastly", "Finally"] },
  { before: "Step 3 of 5 —", connector: "Next", after: ", walk in a line to the assembly point without pushing.", distractors: ["First", "Lastly", "Firstly"] },
  { before: "Step 4 of 5 —", connector: "After that", after: ", stand quietly in your class group.", distractors: ["First", "Firstly", "Next"] },
  { before: "Step 5 of 5 —", connector: "Finally", after: ", wait for the teacher to confirm everyone is present.", distractors: ["First", "Then", "Next"] },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What are connectors of sequence used for in writing?",
    correct: "To show the order in which steps happen in a process",
    distractors: ["To make sentences longer with no real purpose", "To join two unrelated topics together", "To replace punctuation marks in a sentence"],
  },
  {
    q: "Which connector would you use to introduce the very last step of an emergency response?",
    correct: "Finally",
    distractors: ["First", "Next", "Then"],
  },
  {
    q: "Why is process writing useful for explaining how to respond to an emergency in school?",
    correct: "It passes on clear information about each step in the correct order",
    distractors: ["It focuses only on entertaining the reader", "It avoids giving any real instructions", "It works only for events that already happened"],
  },
  {
    q: "In a well-written emergency composition, where should connectors of sequence appear?",
    correct: "At the start of steps, to guide the reader through the order of actions",
    distractors: ["Only in the title of the composition", "Nowhere — they should be avoided completely", "Only at the very end of the composition"],
  },
];

export const safetyEmergencyWriting: Skill = {
  id: "g8-il-w-safety",
  code: "W.4",
  subjectId: "indigenous-language",
  strandId: "g8-il-writing",
  grade: 8,
  title: "Safety at School: Writing to give information",
  description: "Order the steps of responding to a school emergency and use connectors of sequence correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "fill", "match", "mc-connector", "mc"] as const);

    if (branch === "order") {
      const items = shuffle(rng, EMERGENCY_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of responding to a fire emergency at school in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: EMERGENCY_STEPS.map((s) => s.id),
        hint: "Look at the connectors of sequence in each step — first, then, next, after that, finally.",
        explanation: EMERGENCY_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, CONNECTOR_SENTENCES);
      const beforeText = entry.before ? `${entry.before} ` : "";
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing connector of sequence.",
        before: beforeText,
        after: entry.after,
        correctAnswer: entry.connector,
        acceptedAnswers: [entry.connector.toLowerCase()],
        inputMode: "text",
        hint: "Look at what step this is in the sequence — the very first, a middle step, or the last one.",
        explanation: `"${entry.connector}" fits here because ${CONNECTORS.find((c) => c.term.split(" / ")[0] === entry.connector || c.term === entry.connector)?.use ?? "it shows this step's place in the sequence"}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, CONNECTORS.map((c) => ({ id: c.term, label: c.term })));
      const targets = shuffle(rng, CONNECTORS.map((c) => ({ id: c.term, label: c.use })));
      const correctMap: Record<string, string> = {};
      for (const c of CONNECTORS) correctMap[c.term] = c.term;
      return {
        kind: "click-match",
        prompt: "Match each connector of sequence to how it is used.",
        tokens,
        targets,
        correctMap,
        hint: "Connectors of sequence show whether a step is first, in the middle, or last.",
        explanation: CONNECTORS.map((c) => `${c.term} — ${c.use}.`).join(" "),
      };
    }

    if (branch === "mc-connector") {
      const entry = randChoice(rng, CONNECTOR_SENTENCES);
      const choices = shuffle(rng, [entry.connector, ...entry.distractors]);
      const beforeText = entry.before ? `${entry.before} ` : "";
      return {
        kind: "multiple-choice",
        prompt: `Which connector of sequence best completes this sentence? "${beforeText}___${entry.after}"`,
        choices,
        correctIndex: choices.indexOf(entry.connector),
        layout: "list",
        hint: "Decide whether this action happens first, in the middle, or last in the emergency process.",
        explanation: `"${entry.connector}" fits best here, since it correctly signals this step's place in the sequence.`,
      };
    }

    const entry = randChoice(rng, MC_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Connectors of sequence — first, then, next, after that, finally — order the steps of a process.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
