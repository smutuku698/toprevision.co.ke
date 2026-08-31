import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, sub-strand 2.5 "Swimming" (one of two optional alternatives to
// 2.5 "Indigenous Kenyan Games" — this app builds both, see indigenousFloorGames.ts).
// Content: describe body position in breaststroke; perform breaststroke; apply it in a
// swimming game. Core competencies: Self-efficacy (water confidence), Learning to learn (new
// skill). Linked area: Integrated Science (floatation). Key inquiry: "Why are swimming skills
// considered as survival skills?"
//
// VISUAL DECISION: no dedicated VisualSpec type exists for breaststroke body position/technique
// (checked types.ts's Grade 6 Creative Arts visuals list and Assests-svg/) and none of the
// existing generic types (grid-shape, pie-chart, etc.) map cleanly onto a swimming stroke, so
// this skill is deliberately visual-light — content variety carries the depth instead, across
// multiple-choice, fill-blank, click-match, categorize, and ordering.

type Component = "position" | "legs" | "arms" | "breathing" | "timing";

const COMPONENT_LABEL: Record<Component, string> = {
  position: "Body position",
  legs: "Leg action (whip kick)",
  arms: "Arm action",
  breathing: "Breathing",
  timing: "Timing and glide",
};

// 13 distinct facts spanning all 5 named technique components — well past the 10-fact pool
// floor for a categorize/click-match branch (RIGOR-STANDARDS.md).
const BREASTSTROKE_FACTS: { text: string; component: Component }[] = [
  { text: "The body stays horizontal and face-down (prone), close to the surface of the water.", component: "position" },
  { text: "Keeping the body streamlined in this position reduces resistance (drag) from the water, helping the swimmer glide further with each stroke.", component: "position" },
  { text: "The hips stay near the surface rather than sinking low in the water.", component: "position" },
  { text: "Before kicking, the heels are drawn up towards the buttocks with the feet turned outward.", component: "legs" },
  { text: "The whip kick (frog kick) sweeps the legs backward and together in a circular motion to push the swimmer forward.", component: "legs" },
  { text: "After the kick, the legs finish straight and pressed together, ready for the glide.", component: "legs" },
  { text: "The arm stroke begins with both hands together, stretched forward in front of the head.", component: "arms" },
  { text: "The hands sweep outward and downward in a heart-shaped (keyhole) pattern to pull water backward.", component: "arms" },
  { text: "After pulling, the hands recover by sweeping back together close to or under the surface, not lifted high above the water.", component: "arms" },
  { text: "The head and shoulders lift to inhale as the arms complete their pulling sweep.", component: "breathing" },
  { text: "The swimmer exhales underwater as the head lowers again during the kick and glide.", component: "breathing" },
  { text: "After each stroke cycle, the swimmer holds a brief streamlined glide before starting the next cycle.", component: "timing" },
  { text: "The correct order of one stroke cycle is: pull and breathe, then kick, then glide.", component: "timing" },
];

const TERM_DEFS: { term: string; def: string }[] = [
  { term: "Prone body position", def: "Lying horizontal and face-down, streamlined close to the water's surface" },
  { term: "Whip kick (frog kick)", def: "Heels drawn to the buttocks, then the legs sweep back and together in a circular motion" },
  { term: "Keyhole arm pull", def: "Hands sweep outward and downward in a heart-shaped path to pull water backward" },
  { term: "Timed breathing", def: "Inhaling as the arms finish pulling, then exhaling underwater during the kick and glide" },
  { term: "Glide phase", def: "A brief streamlined pause after each stroke cycle, travelling with the least resistance" },
];

// 12 statements (6 correct, 6 common mistakes) — an Evaluate-flavoured categorize branch on
// top of the plain component-sort, per the Knowledge-dimension "Error-analysis" angle.
const MISTAKE_FACTS: { text: string; isCorrect: boolean }[] = [
  { text: "The arms and legs move at exactly the same instant throughout the whole stroke, with no pause between them.", isCorrect: false },
  { text: "The legs finish the whip kick fully straight and pressed together, ready for the glide.", isCorrect: true },
  { text: "The hands recover by lifting high above the water and swinging forward through the air.", isCorrect: false },
  { text: "The head lifts to breathe in as the arms complete their outward-and-down pulling sweep.", isCorrect: true },
  { text: "The body stays upright and vertical, with the swimmer treading water throughout the stroke.", isCorrect: false },
  { text: "After each stroke cycle, the swimmer briefly holds a streamlined glide before starting the next cycle.", isCorrect: true },
  { text: "The feet stay pointed, not turned outward, throughout the whip kick.", isCorrect: false },
  { text: "Breathing out (exhaling) happens underwater during the kick and glide, and breathing in happens above the water during the arm pull.", isCorrect: true },
  { text: "The arm pull traces a heart-shaped (keyhole) path, sweeping the hands outward and downward before pulling them in.", isCorrect: true },
  { text: "Breaststroke needs no streamlining at all, since the whip kick alone provides all the propulsion.", isCorrect: false },
  { text: "Holding the breath completely for the entire stroke cycle, without ever exhaling underwater, is the correct breathing method.", isCorrect: false },
  { text: "A streamlined, close body position during the glide reduces drag and helps the swimmer travel further with less effort.", isCorrect: true },
];

// Remember/Understand tier — every wrong answer is a specific, plausible technique
// misconception (confused with another stroke or another phase of the same stroke), never an
// unrelated random draw.
const MC_TEMPLATES: { q: string; correct: string; wrong: string[] }[] = [
  {
    q: "In breaststroke, when do swimmers usually breathe in (inhale)?",
    correct: "As the arms finish their outward-and-down pulling sweep, lifting the head and shoulders",
    wrong: ["While performing the whip kick", "Only once, at the very end of a length", "While fully submerged during the glide phase"],
  },
  {
    q: "What shape do the hands trace during the arm pull in breaststroke?",
    correct: "A heart-shaped (keyhole) outward-and-down sweep",
    wrong: ["A continuous circular windmill motion", "An alternating over-the-water arm recovery", "A simultaneous overhead recovery, both arms lifted out of the water together"],
  },
  {
    q: "What is the correct body position for breaststroke?",
    correct: "Horizontal and face-down (prone), close to the surface",
    wrong: ["On the back, face-up (supine)", "Vertical, treading water in place", "On the side, rotating with every stroke"],
  },
  {
    q: "Which kick is used in breaststroke?",
    correct: "The whip kick (frog kick), where the heels draw to the buttocks and the legs sweep back together",
    wrong: ["A flutter kick, with small alternating up-down leg movements", "A dolphin kick, with both legs kicking together up and down", "A scissor kick, with the legs opening front-to-back"],
  },
  {
    q: "What happens during the glide phase of breaststroke?",
    correct: "The swimmer holds a brief streamlined position, travelling with the least resistance before the next stroke cycle",
    wrong: ["The swimmer treads water in place to rest", "The swimmer performs the whip kick", "The swimmer takes a breath"],
  },
  {
    q: "Where do the hands recover to after completing the pulling sweep in breaststroke?",
    correct: "Back together in front of the chest, close to or under the surface",
    wrong: ["Lifted high above the water and swung forward", "Behind the head, near the shoulders", "Out to the sides, remaining extended"],
  },
  {
    q: "Why does a swimmer finish the whip kick with the legs straight and together?",
    correct: "To end the kick in a streamlined line that reduces drag for the glide",
    wrong: ["To signal that the swimming session is over", "Because the legs cannot bend any further at that point", "To prepare the arms for the next breath"],
  },
  {
    q: "What is the correct order of actions in one breaststroke cycle?",
    correct: "Pull and breathe, then kick, then glide",
    wrong: ["Kick, then pull and breathe, then glide", "Glide, then kick, then pull and breathe", "Breathe, then glide, then pull, then kick"],
  },
  {
    q: "Should the body be streamlined or relaxed and loose during the glide phase?",
    correct: "Streamlined — arms and legs extended and close together to reduce drag",
    wrong: ["Relaxed and loose, since no forward motion happens during the glide", "Curled into a tight ball", "Arched with the head lifted high out of the water"],
  },
  {
    q: "Just before the whip kick's propulsive sweep, what position are the legs in?",
    correct: "Heels drawn up towards the buttocks with the feet turned outward",
    wrong: ["Legs fully straight and pressed together", "Legs kicking alternately up and down", "One leg extended forward, one leg back"],
  },
];

// Apply-tier, Scenario+Hook structured — the "survival skill" key inquiry question tied to a
// real Kenyan water-safety context each time. Self-test: none of these are answerable from bare
// "what is breaststroke" recall — each needs the specific mechanism (glide = energy saving,
// timed breathing = forward visibility, whip kick = efficiency) reasoned onto the scenario.
const SCENARIO_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `After heavy rains, floodwater rises quickly near ${who}'s home in ${p}, and ${who} must swim a short distance through calm floodwater to reach higher ground. Why is breaststroke's glide phase especially useful here?`,
      correct: "It lets the swimmer travel forward using less energy, helping delay tiredness during a stressful swim",
      wrong: [
        "It lets the swimmer swim faster than any other stroke over any distance",
        "It allows the swimmer to stop moving completely and rest motionless in the water",
        "It removes the need to ever kick during the stroke",
      ],
      explanation:
        "The glide phase is an efficient, low-effort part of the stroke — it doesn't make breaststroke the fastest stroke, and the swimmer is still moving and using the whip kick, just resting between active pulls.",
    };
  },
  (rng) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `During a water-safety lesson at a community pool in ${p}, ${who}'s instructor explains that breaststroke lets a swimmer see clearly ahead while swimming — useful for spotting obstacles or people needing help. Which part of the technique makes this possible?`,
      correct: "The timed breathing, where the head lifts during each arm pull, giving a clear forward view",
      wrong: [
        "The whip kick, which lifts the swimmer's whole body out of the water",
        "The glide phase, during which the swimmer closes their eyes to conserve energy",
        "The streamlined arm position, which points the swimmer's eyes downward",
      ],
      explanation: "Because breaststroke's breathing lifts the head forward (not to the side), the swimmer gets a regular, forward-facing view of what's ahead — useful in an emergency.",
    };
  },
  (rng) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who} is helping teach younger children water safety at a dam near ${p}, and stresses that breaststroke can be sustained for longer than frantic splashing if someone falls into deep water. Why?`,
      correct: "Breaststroke's steady pull-kick-glide rhythm uses energy efficiently, so it tires the swimmer out much more slowly than thrashing about",
      wrong: [
        "Breaststroke uses no energy at all once learned",
        "Breaststroke does not require the swimmer to move their arms",
        "Breaststroke can only be swum for a few seconds at a time",
      ],
      explanation: "A steady, rhythmic stroke with a resting glide phase conserves energy far better than panicked splashing, which tires a person out quickly.",
    };
  },
  (rng) => {
    const p = place(rng);
    return {
      prompt: `During floods near ${p}, rescue volunteers are trained in breaststroke because it lets a swimmer keep their head above water often. Why does this matter in a rescue situation?`,
      correct: "It lets the swimmer breathe regularly and watch the person or hazard ahead of them while swimming",
      wrong: [
        "It means the swimmer never needs to put their face in the water at all",
        "It stops the swimmer from getting tired, no matter how far they swim",
        "It is the only stroke that allows a swimmer to talk while swimming",
      ],
      explanation:
        "Breaststroke's timed breathing gives regular forward visibility without keeping the head up constantly — the face still goes in the water briefly during the glide/kick — and that balance of visibility and efficiency is why it suits rescue and safety situations.",
    };
  },
  (rng) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who} crosses a flooded, slow-moving section of a road near ${p} after a storm, using breaststroke to stay steady in the water. Why is keeping a streamlined, prone body position important here, not just for speed?`,
      correct: "A streamlined position reduces drag, helping the swimmer stay stable and conserve energy while moving through the water",
      wrong: [
        "A streamlined position stops the swimmer from breathing at all",
        "Body position has no effect on how tiring a swim feels",
        "A streamlined position is only useful for racing in a pool, not floodwater",
      ],
      explanation: "Reducing drag through good body position isn't just about racing speed — it also reduces how much energy the swim costs, which matters in any real water-safety situation.",
    };
  },
  (rng) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `At the coast near ${p}, ${who} is practising breaststroke during a supervised swimming lesson and is told breaststroke is often described as a "survival stroke". What makes it well suited to that description?`,
      correct: "It combines regular forward-facing breathing with an energy-saving glide phase, letting a swimmer travel a distance calmly without exhausting themselves",
      wrong: [
        "It is the only stroke that keeps a swimmer completely dry",
        "It cannot be used in open water, only in swimming pools",
        "It requires no practice to perform correctly",
      ],
      explanation: "The combination of forward visibility (from timed breathing) and low-effort travel (from the glide) is exactly why breaststroke is often taught as a foundational safety/survival stroke.",
    };
  },
  (rng) => {
    const p = place(rng);
    return {
      prompt: `During a swimming gala safety briefing in ${p}, the coach reminds swimmers that if they ever feel tired mid-race, breaststroke's glide phase can help. How?`,
      correct: "Extending the glide phase briefly lets a tired swimmer travel forward while resting the arms and legs before the next stroke cycle",
      wrong: [
        "The glide phase lets the swimmer exit the pool immediately",
        "Extending the glide phase makes the swimmer sink to the bottom",
        "The glide phase only works if the swimmer stops breathing entirely",
      ],
      explanation: "Because the glide is already a low-effort, streamlined part of the stroke, holding it a little longer gives a tired swimmer a brief, genuine rest without stopping completely.",
    };
  },
  (rng) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `A Red Cross water-safety volunteer near ${p} explains to ${who} that breaststroke's whip kick is more sustainable over a long swim than thrashing the legs quickly up and down. Why?`,
      correct: "The whip kick uses one deliberate, powerful sweep per cycle rather than many rapid, tiring kicks, so it uses energy more efficiently over a distance",
      wrong: [
        "The whip kick does not use the legs at all, only the arms",
        "Thrashing the legs quickly is always more efficient for any swimmer",
        "The whip kick is only used for very short distances, never long ones",
      ],
      explanation: "One controlled, powerful kick per stroke cycle is far less tiring over a distance than many rapid kicks, which is part of why breaststroke suits longer or more stressful swims.",
    };
  },
  (rng) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `After practising breaststroke in a pool near ${p}, ${who} is asked why learning to swim at all is considered an important survival skill, beyond just a sport. What is the best answer, based on what breaststroke's technique demonstrates?`,
      correct: "Swimming skills like breaststroke let a person move through water calmly and efficiently, which can be lifesaving if they unexpectedly end up in deep or moving water",
      wrong: [
        "Swimming skills are only useful for winning swimming competitions",
        "Swimming skills have no connection to safety, only to fitness",
        "Learning to swim removes all risk of drowning permanently",
      ],
      explanation:
        "Breaststroke's efficient, calm technique is a real example of why swimming is taught as a survival skill — it gives a person a reliable way to move through water safely, though it doesn't remove all risk.",
    };
  },
  (rng) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who} notices a friend panic and thrash wildly after falling into a swimming pool near ${p}, quickly becoming exhausted. Using what you know about breaststroke technique, what would have helped the friend most?`,
      correct: "Using a calm, controlled stroke like breaststroke, with its resting glide phase, instead of frantic uncontrolled movements",
      wrong: [
        "Holding the breath completely and not breathing at all until reaching the edge",
        "Removing all clothing before attempting to swim",
        "Swimming as fast as possible with no regard for technique",
      ],
      explanation: "Panicked thrashing wastes energy fast; a controlled stroke with a resting glide phase like breaststroke conserves energy and helps someone stay afloat and moving calmly.",
    };
  },
];

const LESSON_STAGES = [
  { id: "watch", label: "Watch a virtual or actual performance to observe breaststroke technique" },
  { id: "demonstrate", label: "Demonstrate the breaststroke skill" },
  { id: "practise", label: "Practise breaststroke while observing safety" },
  { id: "apply", label: "Apply the breaststroke skill in a swimming game" },
  { id: "feedback", label: "Observe others swim using breaststroke and give feedback" },
] as const;

const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[]; explanation: string }[] = [
  { before: "In breaststroke, the correct body position is horizontal and face-down, also called the ", after: " position.", correctAnswer: "prone", explanation: "Prone means lying face-down — the correct body position for breaststroke." },
  { before: "The kick used in breaststroke, where the heels draw to the buttocks before sweeping back, is called the ", after: " kick (or frog kick).", correctAnswer: "whip", explanation: "The whip kick (frog kick) is breaststroke's leg action." },
  { before: "During the arm pull, the hands trace a heart-shaped path often called a ", after: " pull.", correctAnswer: "keyhole", explanation: "The keyhole pull describes the heart-shaped path the hands trace." },
  { before: "The brief streamlined pause after each stroke cycle, when the swimmer travels with least resistance, is called the ", after: " phase.", correctAnswer: "glide", explanation: "The glide phase is the streamlined pause after each stroke cycle." },
  { before: "In breaststroke, a swimmer breathes in as the arms finish their pulling sweep, then breathes out ", after: " during the kick and glide.", correctAnswer: "underwater", explanation: "Breaststroke swimmers exhale underwater during the kick and glide." },
  { before: "Keeping the body streamlined reduces ", after: " (resistance) from the water, helping the swimmer glide further.", correctAnswer: "drag", acceptedAnswers: ["drag", "resistance"], explanation: "A streamlined body reduces drag (resistance) from the water." },
  { before: "The correct order of one breaststroke cycle is: pull and breathe, then kick, then ", after: ".", correctAnswer: "glide", explanation: "The cycle order is pull and breathe, then kick, then glide." },
  { before: "Before the propulsive sweep of the whip kick, the heels are drawn up towards the ", after: ".", correctAnswer: "buttocks", explanation: "The heels draw up towards the buttocks before the whip kick's sweep." },
  { before: "Breaststroke is often called a ", after: " stroke because its efficient technique helps a swimmer travel safely and calmly through water.", correctAnswer: "survival", explanation: "Breaststroke is often taught as a survival stroke for exactly this reason." },
  { before: "The science link for breaststroke comes from ", after: ", which explains why a streamlined body position helps a swimmer move through water with less resistance.", correctAnswer: "floatation", acceptedAnswers: ["floatation", "buoyancy"], explanation: "Floatation (buoyancy) explains why streamlining reduces resistance in water." },
  { before: "During the arm recovery, the hands sweep back together close to or under the surface, rather than lifting high ", after: " the water.", correctAnswer: "above", explanation: "Breaststroke's arm recovery stays close to or under the surface, not lifted above the water." },
];

const TERM_MATCH_PROMPTS = [
  "Match each breaststroke technique term to its correct description.",
  "Pair each breaststroke term below with what it actually means.",
  "Connect each named part of breaststroke technique to its description.",
  "Match each term to the part of the breaststroke stroke it names.",
  "For each breaststroke term below, choose its matching description.",
] as const;

const COMPONENT_CATEGORIZE_PROMPTS = [
  "Sort each fact about breaststroke technique into the part of the stroke it describes.",
  "Which part of breaststroke technique does each fact below describe — position, legs, arms, breathing, or timing?",
  "Read each fact about breaststroke, then sort it into the correct technique component.",
  "Match each breaststroke fact to the stage of the stroke it belongs to.",
  "Sort these breaststroke facts by which part of the technique they describe.",
] as const;

const MISTAKE_CATEGORIZE_PROMPTS = [
  "Sort each statement about breaststroke technique as correct or a common mistake.",
  "Decide whether each statement about breaststroke below is correct or a common mistake.",
  "Read each claim about breaststroke technique, then sort it as correct or a mistake.",
  "Which of these breaststroke statements are technically correct, and which describe common mistakes?",
  "Sort these breaststroke technique statements into Correct and Common Mistake.",
] as const;

const ORDER_PROMPTS = [
  "Arrange these stages of a breaststroke lesson in the order they typically happen.",
  "Put the stages of learning breaststroke in the correct order, from first to last.",
  "Order these breaststroke lesson stages from start to finish.",
  "Sort these breaststroke lesson stages into the sequence a learner would follow.",
  "Place these stages of a breaststroke lesson in the order a class would follow them.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence about breaststroke.",
  "Fill in the blank below.",
  "Complete the sentence with the correct word.",
] as const;

export const swimming: Skill = {
  id: "g6-cas-swimming",
  code: "P.5",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-performing-displaying",
  grade: 6,
  title: "Swimming (Optional)",
  description: "Breaststroke body position, whip kick, arm action and timed breathing; applying breaststroke in a swimming game; and why swimming skills are considered survival skills.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["recall-mc", "scenario-mc", "term-match", "component-categorize", "mistake-categorize", "fill-blank", "ordering"] as const
    );

    if (branch === "recall-mc") {
      const q = randChoice(rng, MC_TEMPLATES);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex,
        layout: "list",
        hint: "Picture each stage of the breaststroke cycle — body position, kick, arm pull, breathing, then glide.",
        explanation: `The correct answer is "${q.correct}".`,
      };
    }

    if (branch === "scenario-mc") {
      const q = randChoice(rng, SCENARIO_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about which specific part of breaststroke technique — the glide, the breathing, or the kick — actually explains what's being asked.",
        explanation: q.explanation,
      };
    }

    if (branch === "term-match") {
      const tokens = shuffle(rng, TERM_DEFS.map((t, i) => ({ id: `t${i}`, label: t.term })));
      const targets = shuffle(rng, TERM_DEFS.map((t, i) => ({ id: `t${i}`, label: t.def })));
      const correctMap: Record<string, string> = {};
      TERM_DEFS.forEach((_, i) => (correctMap[`t${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: randChoice(rng, TERM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Each term names one specific part of the breaststroke cycle.",
        explanation: TERM_DEFS.map((t) => `${t.term} — ${t.def}.`).join(" "),
      };
    }

    if (branch === "component-categorize") {
      const chosen = shuffle(rng, BREASTSTROKE_FACTS).slice(0, 8);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.component));
      const components: Component[] = ["position", "legs", "arms", "breathing", "timing"];
      return {
        kind: "categorize",
        prompt: randChoice(rng, COMPONENT_CATEGORIZE_PROMPTS),
        items,
        buckets: components.map((c) => ({ id: c, label: COMPONENT_LABEL[c] })),
        correctBucket,
        hint: "Body position is about how the whole body is held; legs and arms are the propulsion; breathing and timing tie the cycle together.",
        explanation: chosen.map((f) => `"${f.text}" describes ${COMPONENT_LABEL[f.component].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "mistake-categorize") {
      const chosen = shuffle(rng, MISTAKE_FACTS).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `m${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`m${i}`] = f.isCorrect ? "correct" : "mistake"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, MISTAKE_CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "correct", label: "Correct technique" },
          { id: "mistake", label: "Common mistake" },
        ],
        correctBucket,
        hint: "Compare each statement against the true prone position, whip kick, keyhole pull, timed breathing, and glide.",
        explanation: chosen.map((f) => `"${f.text}" is ${f.isCorrect ? "correct" : "a common mistake"}.`).join(" "),
      };
    }

    if (branch === "ordering") {
      const shuffled = shuffle(rng, LESSON_STAGES);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: LESSON_STAGES.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "A skill is watched and demonstrated before it is practised, applied in a game, and then reviewed.",
        explanation: "Correct order: " + LESSON_STAGES.map((s) => s.label).join(" → ") + ".",
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: fb.acceptedAnswers ?? [fb.correctAnswer],
      inputMode: "text",
      hint: "Think about which part of the breaststroke cycle the sentence is describing.",
      explanation: fb.explanation,
    };
  },
};
