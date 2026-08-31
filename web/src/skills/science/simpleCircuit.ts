import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CONCEPT_QUESTIONS = [
  {
    prompt: "What is the purpose of a switch in an electrical circuit?",
    correct: "To open or close the circuit, controlling whether current can flow.",
    distractors: [
      "To increase the voltage produced by the cell.",
      "To store electrical energy for later use.",
      "To convert electrical energy directly into light.",
    ],
    explanation:
      "A switch is a component that opens (breaks) or closes (completes) a circuit. When it is open, there is a gap and current cannot flow; when it is closed, the circuit is complete and current can flow.",
  },
  {
    prompt: "What is the purpose of a cell (battery) in a circuit?",
    correct: "To provide the electrical energy that pushes current around the circuit.",
    distractors: [
      "To resist the flow of current and produce heat.",
      "To open and close the circuit.",
      "To measure how much current is flowing.",
    ],
    explanation:
      "The cell is the energy source in a circuit — its voltage pushes electric charge around the complete circuit, which is what makes components like bulbs work.",
  },
  {
    prompt: "Why does a bulb light up when it is part of a closed circuit?",
    correct: "Current flows through its filament, heating it until it glows.",
    distractors: [
      "The switch produces light directly.",
      "The wires themselves turn into light.",
      "The bulb releases charge it stored earlier, at random times.",
    ],
    explanation:
      "In a closed circuit, current flows continuously through the bulb's thin filament. The filament resists the flow of current, which heats it up until it glows and gives off light.",
  },
] as const;

const COMPONENT_FUNCTIONS: { name: string; component: "cell" | "switch" | "bulb" | "resistor"; category: "source" | "control" | "output" }[] = [
  { name: "Cell (battery)", component: "cell", category: "source" },
  { name: "Switch", component: "switch", category: "control" },
  { name: "Resistor", component: "resistor", category: "control" },
  { name: "Bulb", component: "bulb", category: "output" },
];
const CATEGORY_LABEL: Record<string, string> = {
  source: "Provides electrical energy",
  control: "Controls the current flowing",
  output: "Converts electrical energy into another form (e.g. light)",
};

const BUILD_STEPS = [
  { id: "gather", label: "Gather the components: a cell, a switch, wires, and a bulb" },
  { id: "cell-switch", label: "Connect a wire from the cell to the switch" },
  { id: "switch-bulb", label: "Connect a wire from the switch to the bulb" },
  { id: "close-loop", label: "Connect a wire from the bulb back to the cell, completing the loop" },
  { id: "test", label: "Close the switch to test whether the bulb lights up" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The flow of electric charge around a circuit is called electric ", after: ".", correctAnswer: "current", accepted: ["current"], explanation: "Electric current is the flow of electric charge around a circuit, measured in amperes." },
  { before: "The push, provided by a cell, that drives current around a circuit is called ", after: ".", correctAnswer: "voltage", accepted: ["voltage"], explanation: "Voltage is the push, provided by a cell or battery, that drives current around a circuit." },
  { before: "A property of a component that opposes the flow of current is called ", after: ".", correctAnswer: "resistance", accepted: ["resistance"], explanation: "Resistance is a property of a component, such as a resistor or a bulb's filament, that opposes the flow of current." },
  { before: "A circuit where all components are connected in a single loop, one after another, is called a ", after: " circuit.", correctAnswer: "series", accepted: ["series"], explanation: "A series circuit connects all components in a single loop, one after another." },
  { before: "A circuit where components are connected in separate branches is called a ", after: " circuit.", correctAnswer: "parallel", accepted: ["parallel"], explanation: "A parallel circuit connects components in separate branches, so current can take more than one path." },
  { before: "A material that allows electric current to pass through it easily is called a ", after: ".", correctAnswer: "conductor", accepted: ["conductor"], explanation: "A conductor is a material, like copper wire, that allows electric current to pass through it easily." },
  { before: "A material that does not allow electric current to pass through it is called an ", after: ".", correctAnswer: "insulator", accepted: ["insulator"], explanation: "An insulator is a material, like rubber or plastic, that does not allow electric current to pass through it." },
] as const;

export const simpleCircuit: Skill = {
  id: "sci-energy-simple-circuit",
  code: "E.1",
  subjectId: "science",
  strandId: "sci-extra-practice",
  grade: 9,
  title: "Simple electrical circuits",
  description: "Predict whether a bulb lights up, and explain the role of circuit components.",
  generate(rng) {
    if (rng() < 0.3) {
      const tokens = shuffle(rng, CONCEPT_QUESTIONS.map((q) => ({ id: q.prompt, label: q.prompt.replace("What is the purpose of ", "").replace("?", "") })));
      const targets = shuffle(rng, CONCEPT_QUESTIONS.map((q) => ({ id: q.prompt, label: q.correct })));
      const correctMap: Record<string, string> = {};
      for (const q of CONCEPT_QUESTIONS) correctMap[q.prompt] = q.prompt;

      return {
        kind: "click-match",
        prompt: "Match each circuit component to its purpose.",
        tokens,
        targets,
        correctMap,
        hint: "Current can only flow through a complete (closed) circuit.",
        explanation: CONCEPT_QUESTIONS.map((q) => q.explanation).join(" "),
      };
    }

    const mode = randChoice(rng, ["switch-state", "switch-state", "purpose", "broken-wire", "categorize", "fill-blank", "build-order"] as const);

    if (mode === "categorize") {
      const items = COMPONENT_FUNCTIONS.map((c) => ({ id: c.name, label: c.name }));
      const correctBucket: Record<string, string> = {};
      for (const c of COMPONENT_FUNCTIONS) correctBucket[c.name] = c.category;
      const buckets = Array.from(new Set(COMPONENT_FUNCTIONS.map((c) => c.category))).map((cat) => ({ id: cat, label: CATEGORY_LABEL[cat] }));
      return {
        kind: "categorize",
        prompt: "Sort each circuit component by its main function.",
        items,
        buckets,
        correctBucket,
        hint: "The cell supplies energy, the switch and resistor control the current, and the bulb converts electrical energy into light.",
        explanation: COMPONENT_FUNCTIONS.map((c) => `${c.name} — ${CATEGORY_LABEL[c.category].toLowerCase()}.`).join(" "),
      };
    }

    if (mode === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about electrical circuits.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe current, voltage, resistance, and circuit types.",
        explanation: fb.explanation,
      };
    }

    if (mode === "build-order") {
      const items = shuffle(rng, BUILD_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for building and testing a simple circuit, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: BUILD_STEPS.map((s) => s.id),
        hint: "Gather components first, then wire them one connection at a time until the loop is complete, then test it.",
        explanation: BUILD_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (mode === "switch-state") {
      const closed = randChoice(rng, [true, false]);
      const includeResistor = randChoice(rng, [true, false]);
      const components: ("cell" | "bulb" | "switch" | "resistor")[] = includeResistor
        ? ["cell", "switch", "resistor", "bulb"]
        : ["cell", "switch", "bulb"];
      const correct = closed ? "The bulb lights up." : "The bulb stays off.";
      const choices = shuffle(rng, ["The bulb lights up.", "The bulb stays off.", "The bulb flickers rapidly."]);
      const correctIndex = choices.indexOf(correct);

      return {
        kind: "multiple-choice",
        prompt: `In the circuit below, the switch is ${closed ? "closed" : "open"}. What happens to the bulb?`,
        visual: { type: "circuit", components, closed },
        choices,
        correctIndex,
        layout: "list",
        hint: "Current can only flow through a complete (closed) circuit.",
        explanation: closed
          ? "The switch is closed, so the circuit is complete and current can flow all the way around it, through the bulb's filament — the bulb lights up."
          : "The switch is open, which leaves a gap in the circuit. Current cannot jump across a gap, so no current reaches the bulb and it stays off.",
      };
    }

    if (mode === "purpose") {
      const q = randChoice(rng, CONCEPT_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      const correctIndex = choices.indexOf(q.correct);

      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about what each component does when current flows through the circuit.",
        explanation: q.explanation,
      };
    }

    // mode === "broken-wire"
    const includeResistor = randChoice(rng, [true, false]);
    const components: ("cell" | "bulb" | "switch" | "resistor")[] = includeResistor
      ? ["cell", "switch", "resistor", "bulb"]
      : ["cell", "switch", "bulb"];
    const correct = "The bulb stays off, because the circuit is no longer complete.";
    const choices = shuffle(rng, [
      correct,
      "The bulb lights up brighter than before.",
      "The bulb flickers on and off continuously.",
      "Nothing changes — the bulb keeps working normally.",
    ]);
    const correctIndex = choices.indexOf(correct);

    return {
      kind: "multiple-choice",
      prompt: "If a wire in this circuit breaks, leaving a gap, what happens to the bulb?",
      visual: { type: "circuit", components, closed: false },
      choices,
      correctIndex,
      layout: "list",
      hint: "A broken wire has the same effect on the circuit as an open switch.",
      explanation:
        "A broken wire creates a gap in the circuit, exactly like an open switch. Current cannot flow across a gap, so no current reaches the bulb — it stays off, even though nothing else in the circuit has changed.",
    };
  },
};
