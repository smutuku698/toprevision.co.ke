import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ICON_TOOLS = [
  { id: "tape-measure", label: "Tape measure", category: "measuring", use: "Measuring long lengths, such as a room or a plank of wood" },
  { id: "steel-rule", label: "Steel rule", category: "measuring", use: "Measuring and drawing short, straight lines accurately" },
  { id: "callipers", label: "Callipers", category: "measuring", use: "Measuring the diameter or thickness of small objects precisely" },
  { id: "weighing-balance", label: "Weighing balance", category: "measuring", use: "Measuring the mass of an object" },
  { id: "divider", label: "Divider", category: "marking", use: "Marking out circles and arcs, or stepping off equal distances" },
  { id: "try-square", label: "Try-square", category: "marking", use: "Checking and marking a right angle (90°)" },
  { id: "marking-gauge", label: "Marking gauge", category: "marking", use: "Marking a line parallel to the edge of a workpiece" },
  { id: "dot-punch", label: "Dot punch", category: "marking", use: "Marking a point on metal before drilling a hole" },
  { id: "scriber", label: "Scriber", category: "marking", use: "Scratching fine lines onto a metal surface for marking out" },
] as const;

const OTHER_TOOLS = [
  { label: "Stop watch", category: "measuring", use: "Measuring the time taken to complete a task" },
  { label: "Ammeter", category: "measuring", use: "Measuring the electric current in a circuit" },
  { label: "Voltmeter", category: "measuring", use: "Measuring the voltage (potential difference) in a circuit" },
  { label: "Pencil", category: "marking", use: "Marking light guide lines on a workpiece" },
  { label: "Marking knife", category: "marking", use: "Cutting a sharp, accurate marking line, especially in wood" },
] as const;

const ALL_TOOLS = [...ICON_TOOLS.map((t) => ({ label: t.label, category: t.category, use: t.use })), ...OTHER_TOOLS];

const SELECT_SCENARIOS = [
  { text: "A carpenter needs to check that the corner of a wooden frame is exactly 90°.", tool: "try-square" },
  { text: "A fundi needs to measure the length of a 5-metre plank of timber.", tool: "tape-measure" },
  { text: "A technician needs to mark the exact centre point of a hole before drilling it.", tool: "dot-punch" },
  { text: "A worker needs to measure the precise diameter of a small metal rod.", tool: "callipers" },
  { text: "A carpenter needs to mark a line running parallel to the edge of a plank.", tool: "marking-gauge" },
  { text: "A metalworker needs to scratch a fine, accurate marking line onto a steel sheet.", tool: "scriber" },
  { text: "A worker needs to step off several equal distances along a metal sheet before cutting.", tool: "divider" },
  { text: "A trader needs to check the exact mass of a sack of maize before selling it.", tool: "weighing-balance" },
  { text: "A fundi needs to draw a short, straight line accurately across a small piece of wood.", tool: "steel-rule" },
  { text: "A worker needs to mark out an accurate circle on a metal plate before cutting it out.", tool: "divider" },
] as const;

const CARE_QUESTIONS = [
  {
    prompt: "Which of these is the correct way to care for measuring and marking out tools?",
    correct: "Clean them after use and store them in a dry place",
    wrong: ["Leave them lying outside exposed to rain", "Throw them into a box with sharp offcuts of metal", "Never check them for damage before use"],
    explanation: "Cleaning tools after use and storing them in a dry place prevents rust and damage, keeping them accurate for longer.",
  },
  {
    prompt: "Why is it important to select the correct tool for a given measuring or marking task?",
    correct: "The correct tool gives an accurate result and reduces the risk of damaging the workpiece",
    wrong: ["Any tool works equally well for every task", "It is only about following instructions, not accuracy", "Choosing a tool has no effect on the finished work"],
    explanation: "Using the correct tool for a task gives a more accurate result and reduces the risk of damaging the workpiece or the tool itself.",
  },
  {
    prompt: "A worker notices their steel rule has a slightly bent edge. What should they do before using it again?",
    correct: "Stop using it for accurate work and replace or repair it, since a bent edge gives inaccurate measurements",
    wrong: ["Keep using it as normal, since a small bend makes no difference", "Use it only for marking, never for measuring", "Sharpen the bent edge with a file"],
    explanation: "A bent measuring tool no longer gives a true, straight reference, so it should be checked, repaired or replaced before being trusted for accurate work.",
  },
  {
    prompt: "Why should sharp marking tools such as a scriber or dot punch be stored with a cap or in a dedicated slot, not loose in a drawer?",
    correct: "To prevent injury to whoever reaches into the drawer, and to protect the sharp point from damage",
    wrong: ["It has no real safety or care purpose", "It is only to make the drawer look tidy", "It makes the tool heavier and more stable"],
    explanation: "Storing sharp tools safely protects both people (from cuts) and the tool's point (from becoming blunt or bent by knocking against other tools).",
  },
  {
    prompt: "Why should a weighing balance be checked and zeroed before each use?",
    correct: "To ensure it gives an accurate reading, since a balance can drift out of calibration over time",
    wrong: ["Zeroing has no effect on the accuracy of the reading", "It is only necessary the very first time the balance is used", "Zeroing makes the object being weighed lighter"],
    explanation: "A balance can drift slightly over time or after being moved, so checking and zeroing it before use ensures the reading is actually accurate.",
  },
  {
    prompt: "A fundi finishes using a set of callipers on a dusty workshop floor. What is the correct care step before putting them away?",
    correct: "Wipe off dust and debris, then store them in their case or a dry place",
    wrong: ["Leave them exactly where they were used on the floor", "Store them wet, straight after washing, with no drying", "Bend the jaws closed as far as possible for storage"],
    explanation: "Wiping off dust and storing tools dry prevents grit from scratching precision surfaces and prevents rust from moisture.",
  },
] as const;

const MARKING_STEPS = [
  { id: "measure-mark", label: "Measure and mark the position using a steel rule and scriber" },
  { id: "check-square", label: "Use a try-square to check the lines are at right angles" },
  { id: "punch", label: "Mark the exact centre point with a dot punch" },
  { id: "drill", label: "Drill the hole at the punched mark" },
] as const;

export const measuringMarkingTools: Skill = {
  id: "g7-pt-tp-measuring-and-marking-tools",
  code: "TP.1",
  subjectId: "pre-technical",
  strandId: "g7-pt-tools",
  grade: 7,
  title: "Measuring and marking out tools",
  description: "Identifying measuring tools (tape measure, steel rule, callipers, weighing balance, stop watch, ammeter, voltmeter) and marking out tools (divider, try-square, marking gauge, dot punch, scriber, pencil, marking knife); selecting and using the correct tool for a task; and caring for tools.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-tool", "tool-sort", "use-match", "select-tool", "marking-order", "fill-ammeter", "care"] as const);

    if (branch === "identify-tool") {
      const target = randChoice(rng, ICON_TOOLS);
      // Distractors are drawn only from the same category (measuring vs marking out) so a
      // learner can't eliminate options on sight without knowing what the pictured tool does —
      // e.g. a try-square is never offered alongside a weighing balance as a "wrong" option.
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        ICON_TOOLS.filter((t) => t.id !== target.id && t.category === target.category).map((t) => t.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: "Identify this tool.",
        visual: { type: "hand-tool", item: target.id },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This is a ${target.label.toLowerCase()}. It is used for ${target.use.toLowerCase()}.`,
      };
    }

    if (branch === "tool-sort") {
      const chosen = shuffle(rng, ALL_TOOLS).slice(0, 7);
      const items = chosen.map((t, i) => ({ id: `t${i}`, label: t.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((t, i) => (correctBucket[`t${i}`] = t.category));
      return {
        kind: "categorize",
        prompt: "Sort each tool as a measuring tool or a marking out tool.",
        items,
        buckets: [
          { id: "measuring", label: "Measuring tool" },
          { id: "marking", label: "Marking out tool" },
        ],
        correctBucket,
        hint: "Measuring tools find a size, mass, time or electrical value; marking out tools draw or punch a line/point onto a workpiece.",
        explanation: chosen.map((t) => `${t.label} is a ${t.category === "measuring" ? "measuring" : "marking out"} tool.`).join(" "),
      };
    }

    if (branch === "use-match") {
      const chosen = shuffle(rng, ALL_TOOLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t, i) => ({ id: `${i}`, label: t.label })));
      const targets = shuffle(rng, chosen.map((t, i) => ({ id: `${i}`, label: t.use })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: "Match each tool to what it is used for.",
        tokens,
        targets,
        correctMap,
        hint: "Think about exactly what quantity or mark each tool produces.",
        explanation: chosen.map((t) => `${t.label} — ${t.use}.`).join(" "),
      };
    }

    if (branch === "select-tool") {
      const s = randChoice(rng, SELECT_SCENARIOS);
      const correctTool = ICON_TOOLS.find((t) => t.id === s.tool)!;
      // Same-category distractors only — a learner reasoning about a marking-out scenario should
      // never be able to eliminate a measuring instrument (e.g. weighing balance) on sight; the
      // wrong options must still plausibly belong to the task at hand.
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        correctTool.label,
        ICON_TOOLS.filter((t) => t.id !== s.tool && t.category === correctTool.category).map((t) => t.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `${s.text} Which tool should be used?`,
        choices,
        correctIndex,
        layout: "list",
        explanation: `${correctTool.label} should be used — it is designed for ${correctTool.use.toLowerCase()}.`,
      };
    }

    if (branch === "marking-order") {
      const shuffled = shuffle(rng, MARKING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the correct steps for marking out a hole position on a metal sheet, from first to last.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: MARKING_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Measure and mark first, check the angle, punch the exact point, then drill.",
        explanation: `The correct order is: ${MARKING_STEPS.map((s) => s.label).join("; ")}.`,
      };
    }

    if (branch === "fill-ammeter") {
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence.",
        before: "The tool used to measure electric current in a circuit is called an ",
        after: ".",
        correctAnswer: "ammeter",
        acceptedAnswers: ["ammeter"],
        inputMode: "text",
        hint: "This tool is different from a voltmeter, which measures voltage instead.",
        explanation: "An ammeter is used to measure electric current in a circuit.",
      };
    }

    const q = randChoice(rng, CARE_QUESTIONS);
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
