import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, Strand 2.0 Performing and Displaying, sub-strand 2.1 "Athletics"
// (kept as one skill — two field events sharing a "jumping technique" theme). Source content:
// describe/perform Long jump using the sail technique; describe/perform High jump using the
// scissors technique (scissor style).

const TERMS: { id: string; label: string; meaning: string; blank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] } }[] = [
  {
    id: "sail-technique",
    label: "Sail technique",
    meaning: "A Long jump technique where the body extends fully in the air, arms and legs stretched, before landing",
    blank: { before: "A Long jump technique where the body extends fully in the air before landing is called the ", after: " technique.", correctAnswer: "sail" },
  },
  {
    id: "scissors-technique",
    label: "Scissors technique",
    meaning: "A High jump technique where the legs kick over the bar one after the other, like scissor blades",
    blank: { before: "A High jump technique where the legs kick over the bar one after the other is called the ", after: " technique.", correctAnswer: "scissors" },
  },
  {
    id: "run-up",
    label: "Run-up",
    meaning: "The fast approach run before take-off, building speed for the jump",
    blank: { before: "The fast approach run before take-off, building speed for the jump, is called the ", after: ".", correctAnswer: "run-up" },
  },
  {
    id: "take-off",
    label: "Take-off",
    meaning: "The moment the jumper pushes off the ground to leave it and go airborne",
    blank: { before: "The moment a jumper pushes off the ground to become airborne is called the ", after: ".", correctAnswer: "take-off" },
  },
  {
    id: "landing",
    label: "Landing",
    meaning: "How the jumper returns to the ground safely at the end of the jump",
    blank: { before: "How a jumper returns to the ground safely at the end of a jump is called the ", after: ".", correctAnswer: "landing" },
  },
];

const ACTIONS = [
  { label: "Sprinting down a runway before pushing off a board", event: "long-jump" },
  { label: "Extending the whole body in the air, arms and legs stretched out", event: "long-jump" },
  { label: "Bringing both legs forward together just before landing in a sand pit", event: "long-jump" },
  { label: "Approaching the bar at an angle rather than straight on", event: "high-jump" },
  { label: "Kicking the leading leg up and over the bar first", event: "high-jump" },
  { label: "Bringing the trailing leg over the bar in a scissoring motion", event: "high-jump" },
  { label: "Taking off from the foot nearer the bar", event: "high-jump" },
  { label: "Landing beyond the board in a sand pit after a horizontal jump", event: "long-jump" },
  { label: "Clearing a raised bar rather than jumping for distance", event: "high-jump" },
  { label: "Measuring the distance jumped with a tape measure", event: "long-jump" },
  { label: "Practising a short run-up before each jumping attempt", event: "either" },
  { label: "Observing safety around the landing area before jumping", event: "either" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} practises the sail technique in Long jump and stretches the whole body out fully while airborne. Why does this technique help increase jump distance?`,
      correct: "It delays the legs dropping for landing, keeping the body extended in the air for longer",
      wrong: [
        "It makes the jumper run faster during the run-up",
        "It changes the shape of the take-off board",
        "It has no effect on distance and is only for style",
      ],
      explanation: "Extending the body fully in the air delays the legs dropping down for landing, which helps the jumper travel further horizontally before touching down — it does not affect run-up speed or the take-off board.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} uses the scissors technique to clear a High jump bar, kicking one leg over first and the other after. Why is this technique named "scissors"?`,
    correct: "The legs kick over the bar one after the other, resembling the opening and closing motion of scissor blades",
    wrong: [
      "It is named after scissors because a real pair of scissors is used to mark the bar height",
      "It is named after scissors because the jumper's arms move like scissors, not the legs",
      "The name has no connection to how the technique looks",
    ],
    explanation: "The scissors technique gets its name from how the legs kick over the bar one after another, resembling scissor blades opening and closing — it describes the legs' motion, not any tool or arm movement.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is deciding whether to approach a High jump bar straight on or at an angle, using the scissors technique. Which approach is correct for this technique?`,
      correct: "Approaching at an angle, which allows the legs to kick over the bar one after the other",
      wrong: [
        "Approaching straight on, facing the bar directly",
        "Approaching from behind the bar, running toward the landing area first",
        "The direction of approach makes no difference to the scissors technique",
      ],
      explanation: "The scissors technique requires an angled approach, which allows each leg to kick over the bar in turn — approaching straight on would not allow this scissoring leg motion.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} maintains a fast, controlled run-up before both a Long jump and a High jump attempt. Why is a strong run-up important for both events?`,
    correct: "It builds the speed and momentum needed for a powerful take-off",
    wrong: [
      "It only matters for Long jump, not High jump",
      "It is purely for the audience's entertainment and has no effect on the jump",
      "A faster run-up always makes a jumper land more safely, regardless of technique",
    ],
    explanation: "A strong run-up builds the speed and momentum a jumper needs for a powerful take-off in both events — it is not purely for show, and does not by itself guarantee a safe landing.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} performs a Long jump using the sail technique but brings the legs down too early, well before landing. What is the likely effect on the jump distance?`,
      correct: "The jump will likely be shorter, since the body stops travelling forward once the legs drop early",
      wrong: [
        "The jump distance will be unaffected either way",
        "The jump will automatically be measured as longer for style points",
        "Bringing the legs down early always improves landing safety and distance together",
      ],
      explanation: "Dropping the legs too early cuts the forward extension of the sail technique short, which tends to reduce jump distance — it does not automatically improve safety or distance.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} measures and records their Long jump distance after each attempt, using a tape measure. Which subject's skills does this measuring step draw on?`,
    correct: "Mathematics — measuring and appraising performance",
    wrong: [
      "Music — measuring a jump distance has no connection to musical skills",
      "It draws on no other subject's skills at all",
      "Kiswahili — measuring distance is unrelated to language skills",
    ],
    explanation: "Measuring and appraising jump performance is explicitly linked to Mathematics — this is a Mathematics skill applied here for an Athletics purpose.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} watches a virtual video of both techniques before practising them safely. Which core competency does using digital devices to watch these performances develop?`,
      correct: "Digital literacy — operating digital devices to watch performances",
      wrong: [
        "Citizenship — watching a video does not itself involve civic participation",
        "Self-efficacy — this competency is not the one named for watching performances here",
        "It develops no core competency at all",
      ],
      explanation: "The source names digital literacy — operating digital devices to watch performances — as a core competency developed through this activity, not citizenship or self-efficacy.",
    };
  },
];

const RECOGNITION_PROMPTS = ["Which jumping technique is shown here?", "Identify the athletics technique shown.", "Look at the diagram — which technique is this?", "Name the technique shown in this diagram.", "Which technique does this diagram illustrate?"] as const;
const TERM_MATCH_PROMPTS = ["Match each athletics term to its meaning.", "Pair each term with its definition.", "Match each word to what it means in athletics.", "Connect each term to its correct meaning.", "For each term below, choose its matching meaning."] as const;
const ACTIONS_CATEGORIZE_PROMPTS = ["Sort each action by the event it belongs to.", "Which event does each action belong to? Sort them.", "Sort these actions by Long jump or High jump.", "Classify each action as Long jump, High jump, or either.", "Match each action to its event by sorting."] as const;
const STEPS_PROMPTS = ["Put these steps in the correct order.", "Arrange these jumping steps in order.", "Order these steps, from first to last.", "Sort these steps into the correct sequence.", "Place these steps in the order you would perform them."] as const;
const FILL_BLANK_PROMPTS = ["Complete the sentence.", "Fill in the missing word.", "Complete this sentence about athletics.", "Fill in the blank below.", "Complete the sentence with the correct word."] as const;

const LONG_JUMP_STEPS = [
  { id: "l1", label: "Build speed during the run-up" },
  { id: "l2", label: "Push off powerfully at take-off" },
  { id: "l3", label: "Extend the whole body in the air, using the sail technique" },
  { id: "l4", label: "Bring the legs forward together, ready to land" },
  { id: "l5", label: "Land in the sand pit" },
] as const;

const HIGH_JUMP_STEPS = [
  { id: "h1", label: "Approach the bar at an angle" },
  { id: "h2", label: "Take off from the foot nearer the bar" },
  { id: "h3", label: "Kick the leading leg up and over the bar" },
  { id: "h4", label: "Scissor the trailing leg over the bar" },
  { id: "h5", label: "Land safely on the far side" },
] as const;

export const athletics: Skill = {
  id: "g6-cas-athletics",
  code: "P.1",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-performing-displaying",
  grade: 6,
  title: "Athletics",
  description: "Performing the sail technique in Long jump and the scissors technique in High jump.",
  generate(rng) {
    const branch = randChoice(rng, ["technique-recognition", "term-match", "actions-categorize", "reasoning", "steps-order", "fill-blank"] as const);

    if (branch === "technique-recognition") {
      const kind = randChoice(rng, ["long-jump-sail", "high-jump-scissors"] as const);
      const label = kind === "long-jump-sail" ? "Long jump — sail technique" : "High jump — scissors technique";
      const other = kind === "long-jump-sail" ? "High jump — scissors technique" : "Long jump — sail technique";
      const choices = shuffle(rng, [label, other]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, RECOGNITION_PROMPTS),
        choices,
        correctIndex: choices.indexOf(label),
        layout: "row",
        visual: { type: "jump-technique", kind },
        hint: "The high jump diagram shows a dashed bar to clear; the long jump diagram shows a flat ground path.",
        explanation: `This diagram shows ${label}.`,
      };
    }

    if (branch === "term-match") {
      const chosen = shuffle(rng, TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t) => (correctMap[t.id] = t.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, TERM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about the run, the push off the ground, the two named techniques, and how a jump ends.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "actions-categorize") {
      const chosen = shuffle(rng, ACTIONS).slice(0, 8);
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.event));
      return {
        kind: "categorize",
        prompt: randChoice(rng, ACTIONS_CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "long-jump", label: "Long jump" },
          { id: "high-jump", label: "High jump" },
          { id: "either", label: "Both events" },
        ],
        correctBucket,
        hint: "Long jump is measured for distance in a sand pit; High jump clears a raised bar.",
        explanation: chosen.map((a) => `"${a.label}" belongs to ${a.event === "either" ? "both events" : a.event.replace("-", " ")}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about the run-up, take-off, the technique's body shape, and how a jump is measured.", explanation: q.explanation };
    }

    if (branch === "steps-order") {
      const useLong = rng() < 0.5;
      const steps: readonly { id: string; label: string }[] = useLong ? LONG_JUMP_STEPS : HIGH_JUMP_STEPS;
      const eventLabel = useLong ? "Long jump (sail technique)" : "High jump (scissors technique)";
      const shuffled = shuffle(rng, steps);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, STEPS_PROMPTS)} (${eventLabel})`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: steps.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Every jump starts with the run-up and ends with the landing.",
        explanation: "Correct order: " + steps.map((s) => s.label).join(" → ") + ".",
      };
    }

    const t = randChoice(rng, TERMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: t.blank.before,
      after: t.blank.after,
      correctAnswer: t.blank.correctAnswer,
      acceptedAnswers: t.blank.acceptedAnswers ?? [t.blank.correctAnswer],
      inputMode: "text",
      hint: "Think about the sail technique, the scissors technique, run-up, take-off, and landing.",
      explanation: `${t.label}: ${t.meaning}.`,
    };
  },
};
