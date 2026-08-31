import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC, FillBlankTemplate } from "./g6CasShared";

// KICD Grade 6 Creative Arts, Strand 1.0 Creating and Executing, sub-strand 1.6 Gymnastics
// (Skill C.9). Content is genuinely narrow — a single named skill (cartwheel) building into
// one named, fixed-order 3-action sequence (cartwheel -> forward roll -> swan balance) — so
// depth here comes from varied facts/scenarios about that one sequence, not from a wider pool
// of poses. Core competencies named include "Critical thinking and problem solving" (practises
// and creates the 3-action sequence), so per RIGOR-STANDARDS.md this skill must carry at least
// one genuine Analyze-or-Evaluate branch — implemented as two: REASONING_TEMPLATES (Analyze —
// judging what's wrong when the fixed order is broken) and EVALUATE_TEMPLATES (Evaluate —
// judging a described performance against safety/technique criteria).

const POSES = [
  {
    id: "cartwheel",
    label: "Cartwheel",
    description:
      "The body rotates sideways, with hands and feet touching the ground one after another, passing briefly through a handstand-like shape.",
  },
  {
    id: "forward-roll",
    label: "Forward roll",
    description:
      "The gymnast tucks the chin to the chest and rolls forward over the shoulders and back in a curled, rounded shape.",
  },
  {
    id: "swan-balance",
    label: "Swan balance",
    description:
      "The gymnast stands still on one leg while stretching the other leg and both arms out and back, like the wings of a swan.",
  },
] as const;

const SEQUENCE_ORDER = ["cartwheel", "forward-roll", "swan-balance"] as const;

const TRUE_FALSE_FACTS = [
  { text: "The 3-action sequence must be performed in this exact order: cartwheel, forward roll, then swan balance.", isTrue: true },
  { text: "Performing forward roll before cartwheel would still count as the correct sequence, since the order doesn't matter.", isTrue: false },
  { text: "Tucking the chin to the chest during a forward roll helps protect the neck.", isTrue: true },
  { text: "A cartwheel is performed by rotating the body sideways, passing briefly through a handstand-like shape.", isTrue: true },
  { text: "A swan balance is performed while lying flat on the ground.", isTrue: false },
  { text: "Good balance and a straight back are needed to hold a swan balance steadily.", isTrue: true },
  { text: "It is safe to skip checking for a soft mat and clear space before attempting a cartwheel.", isTrue: false },
  { text: "Combining separate skills into one flowing sequence is harder than performing each skill alone.", isTrue: true },
  { text: "In a cartwheel, it does not matter in what order the hands and feet touch the ground.", isTrue: false },
  { text: "Practising a new gymnastics skill slowly, one part at a time, helps build accuracy before linking it into a sequence.", isTrue: true },
  { text: "A soft mat and a clear space should be ready before attempting a cartwheel or forward roll.", isTrue: true },
  { text: "Safety precautions can be ignored as long as a gymnast is only practising a short sequence.", isTrue: false },
] as const;

// Analyze-tier: judging what is wrong when the fixed cartwheel -> forward roll -> swan balance
// order is broken, or why the order itself matters, not just recall of the poses.
const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} performs swan balance, then cartwheel, then forward roll during a gymnastics display in ${place(rng)}. What is wrong with this performance order?`,
      correct: "The order is wrong — the 3-action sequence must be cartwheel, then forward roll, then swan balance, not this order",
      wrong: [
        "Nothing is wrong — the order of a gymnastics sequence never matters",
        "The performance should have included a fourth pose to be correct",
        "The mistake is that swan balance was included at all, since it isn't part of the sequence",
      ],
      explanation:
        "The 3-action sequence has one fixed order: cartwheel, then forward roll, then swan balance. Performing the same three poses in a different order does not count as the correct sequence, even though all three poses are genuinely part of it.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} performs forward roll, then swan balance, then cartwheel while practising in ${place(rng)}. What should ${who} correct?`,
      correct: "The order should be changed to cartwheel first, then forward roll, then swan balance",
      wrong: [
        "Nothing — any order that includes all three poses is acceptable",
        "The forward roll should be removed from the sequence entirely",
        "The order should be changed to swan balance, cartwheel, forward roll instead",
      ],
      explanation:
        "The 3-action sequence must be cartwheel, then forward roll, then swan balance — every other ordering of the same three poses is incorrect, even if each pose is performed well individually.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} performs cartwheel, then swan balance, then forward roll at a school event in ${place(rng)}. Is this the correct 3-action sequence?`,
      correct: "No — forward roll and swan balance are swapped; the correct order is cartwheel, forward roll, then swan balance",
      wrong: [
        "Yes — starting with cartwheel is the only requirement",
        "Yes — as long as forward roll and swan balance both appear somewhere, the order between them doesn't matter",
        "No — cartwheel should not be performed first",
      ],
      explanation:
        "Starting with cartwheel is correct, but forward roll must come before swan balance, not after — the full fixed order is cartwheel, forward roll, then swan balance.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} insists it is fine to start the sequence with swan balance in ${place(rng)}, because it is ${who}'s favourite pose. Evaluate this claim.`,
      correct: "This is incorrect — the sequence's starting pose is fixed as cartwheel, regardless of which pose a gymnast personally prefers",
      wrong: [
        "This is correct — a gymnast may start the sequence with any pose they prefer",
        "This is correct — swan balance should always be performed first since it needs the most concentration",
        "This is incorrect — the sequence should actually start with forward roll instead",
      ],
      explanation:
        "The 3-action sequence's order — cartwheel, forward roll, then swan balance — is fixed by the skill being taught, not a matter of personal preference for which pose to start with.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Why must ${who} practise cartwheel, forward roll and swan balance in that exact fixed order, rather than just being able to perform each pose individually in ${place(rng)}?`,
      correct: "Performing them in the fixed order shows the gymnast can link separate skills together smoothly, not only perform each pose alone",
      wrong: [
        "The order has no real purpose — it is only followed out of tradition",
        "The order only matters for how long the whole performance takes",
        "The order is only important for entertainment value, not for demonstrating skill",
      ],
      explanation:
        "Gymnastic sequences are performed in a fixed order because the real skill being tested is smoothly combining separate movements, not just performing each one in isolation — this is exactly why sequences are performed in gymnastics.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} has practised cartwheel and forward roll separately with great control, but has never practised them one after another. What is ${who} likely to struggle with first when attempting the full sequence?`,
      correct: "Transitioning smoothly from the end of one skill into the start of the next, since practising skills separately does not automatically prepare a gymnast to link them",
      wrong: [
        "Performing the cartwheel itself, even though it has already been mastered alone",
        "Performing the swan balance itself, even though it has already been mastered alone",
        "Nothing — practising the poses separately fully prepares a gymnast for the sequence",
      ],
      explanation:
        "Mastering each pose alone is necessary but not enough — linking them smoothly, one straight into the next, is a separate skill that needs its own practice.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, being timed during a class activity in ${place(rng)}, rushes straight to swan balance to save time, skipping cartwheel and forward roll. Does this count as completing the 3-action sequence?`,
      correct: "No — skipping steps means the required cartwheel, forward roll, swan balance sequence was not actually performed, even though swan balance itself was executed correctly",
      wrong: [
        "Yes — swan balance is the hardest pose, so completing it counts for the whole sequence",
        "Yes — speed matters more than how many poses were performed",
        "No — because swan balance should not be included in gymnastics at all",
      ],
      explanation:
        "The 3-action sequence requires all three poses performed in order — completing only the final pose, however well, is not the same as performing the sequence.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} watches a video in ${place(rng)} showing forward roll, then cartwheel, then swan balance. Does this match the required 3-action sequence order?`,
      correct: "No — forward roll and cartwheel are swapped; cartwheel must come first, then forward roll, then swan balance",
      wrong: [
        "Yes, this matches exactly",
        "Yes, as long as swan balance is performed last, the first two poses can be in either order",
        "No, because swan balance should actually be performed first",
      ],
      explanation:
        "Cartwheel must always be the first pose in the sequence, followed by forward roll, then swan balance — swapping the first two poses is still an incorrect order.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} claims the correct order is forward roll, cartwheel, swan balance, because forward roll is the easiest pose to warm up with, while training in ${place(rng)}. Evaluate this claim.`,
      correct: "Incorrect — the defined 3-action sequence order is specifically cartwheel first, then forward roll, then swan balance, regardless of which pose feels easiest to warm up with",
      wrong: [
        "Correct — a sequence should always start with whichever pose feels easiest",
        "Correct — any order that ends in swan balance is acceptable",
        "Incorrect — because swan balance should actually be performed first as a warm-up",
      ],
      explanation:
        "The 3-action sequence's order is fixed as cartwheel, forward roll, then swan balance — it is not chosen based on which pose is easiest to warm up with.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} performs swan balance, then forward roll, then cartwheel during peer feedback time in ${place(rng)}. A classmate says the order doesn't matter as long as all three poses are shown. Is the classmate right?`,
      correct: "No — the classmate is wrong; the sequence has one fixed correct order (cartwheel, forward roll, swan balance), and performing the same poses in a different order is not the correct sequence",
      wrong: [
        "Yes — the classmate is right, since including all three poses is all that matters",
        "Yes — the classmate is right, but only for the forward roll and swan balance, not the cartwheel",
        "No — the classmate is wrong, because only two of the three poses actually need to be shown",
      ],
      explanation:
        "Including all three poses is necessary but not sufficient — the sequence is specifically defined by both the poses and their fixed order: cartwheel, forward roll, then swan balance.",
    };
  },
];

// Evaluate-tier: judging a described performance against a stated safety or technique
// criterion, not just recalling what each pose looks like.
const EVALUATE_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} performs a forward roll without tucking the chin to the chest, rolling straight over onto the top of the head, during PE class in ${place(rng)}. Evaluate this technique.`,
      correct: "This is unsafe technique — the chin should be tucked so the body's weight rolls across the rounded back, not the head, to protect the neck",
      wrong: [
        "This is fine — tucking the chin is only an optional style choice",
        "This is fine — the top of the head is actually the safest part of the body to roll on",
        "This is only a problem if the mat is missing, not because of the chin position",
      ],
      explanation:
        "Tucking the chin to the chest during a forward roll spreads the body's weight across the rounded back and protects the neck — rolling on the head instead is a real safety and technique fault.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} attempts a cartwheel on a hard concrete surface with no mat, in ${place(rng)}. Evaluate the safety of this.`,
      correct: "This is unsafe — a soft mat and clear space should be ready before attempting a cartwheel, to prevent injury from a fall",
      wrong: [
        "This is safe, as long as the cartwheel technique itself is correct",
        "Mats are only needed for the forward roll, not the cartwheel",
        "Safety equipment is not necessary for basic gymnastics moves like a cartwheel",
      ],
      explanation:
        "A soft mat and clear space matter for the cartwheel just as much as for the forward roll — correct technique alone does not remove the risk of an unpadded fall.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} wobbles and cannot hold a swan balance steady for more than a second during a class assessment in ${place(rng)}. What does this suggest, and what should ${who} work on?`,
      correct: `This suggests ${who} needs more practice with balance and keeping a straight back, since a controlled swan balance depends on steady balance and posture`,
      wrong: [
        "This suggests the swan balance was performed perfectly, since any attempt counts equally",
        `This suggests ${who} should skip the swan balance entirely and only perform cartwheel and forward roll next time`,
        "Wobbling has nothing to do with balance or posture",
      ],
      explanation:
        "Holding a swan balance steadily requires good balance and a straight back — a wobbly attempt is a sign that those two things specifically need more practice, not that the balance was performed correctly.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} performs a cartwheel where the hands and feet land all at once, instead of one after another, in ${place(rng)}. Evaluate this against correct cartwheel technique.`,
      correct: "This does not match correct cartwheel technique — the hands and feet should touch down one after another as the body rotates sideways, not all together",
      wrong: [
        "This is actually the correct technique, since landing together is faster",
        "The order the hands and feet land in does not matter for a cartwheel",
        "This only matters for the forward roll, not the cartwheel",
      ],
      explanation:
        "In a correct cartwheel, the hands and feet touch the ground one after another as the body rotates sideways through a handstand-like shape — landing them all together is a technique fault.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} rushes into performing the full 3-action sequence in ${place(rng)} without first practising cartwheel, forward roll and swan balance individually. Evaluate this approach.`,
      correct: "This is a risky approach — practising each skill individually first builds the control needed before safely linking them into a full sequence",
      wrong: [
        "This is the best approach, because practising individually wastes valuable time",
        "There is no real benefit to practising skills separately before combining them",
        "Skipping individual practice actually makes the full sequence easier to learn",
      ],
      explanation:
        "Practising each pose individually before combining them builds the control and confidence a gymnast needs to link the poses safely — rushing straight to the full sequence skips that foundation.",
    };
  },
  (rng) => {
    const a = name(rng);
    const b = name(rng);
    return {
      prompt: `Two gymnasts in ${place(rng)} perform the sequence — ${a} moves slowly with full control through cartwheel, forward roll and swan balance, while ${b} rushes through all three quickly but loses balance during the swan balance. Which performance better matches gymnastics' own safety and technique goals, and why?`,
      correct: `${a}'s performance, since maintaining safety and technique control matters more than speed in this sequence`,
      wrong: [
        `${b}'s performance, since speed is the main measure of success in a gymnastics sequence`,
        "Both are equally good, since they both included all three poses",
        `${b}'s performance, since losing balance briefly does not matter as long as the sequence is finished quickly`,
      ],
      explanation:
        "A gymnastics sequence is judged on control, technique and safety, not on speed — a slower, controlled performance meets those goals better than a fast one that loses balance.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} performs the swan balance by bending forward at the waist and touching the ground, instead of standing upright on one leg, in ${place(rng)}. Evaluate this against the described swan balance technique.`,
      correct: "This does not match the swan balance — it should be held standing upright on one leg, with the other leg and both arms stretched out and back, not bent forward touching the ground",
      wrong: [
        "This is close enough to count as a correct swan balance",
        "The swan balance is actually meant to be performed while bent forward touching the ground",
        "Posture does not matter for the swan balance, only which leg is used",
      ],
      explanation:
        "A swan balance is held standing still on one leg, with the other leg and arms extended out and back like a swan's wings — bending forward and touching the ground is a different pose altogether.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} performs a forward roll but stops halfway, sitting up before completing the roll onto the feet, during practice in ${place(rng)}. Evaluate this as part of an attempt at the 3-action sequence.`,
      correct: "This is not a complete forward roll, so the required 3-action sequence has not actually been performed, even if cartwheel and swan balance are done correctly around it",
      wrong: [
        "A partial forward roll still counts fully towards the sequence",
        "Stopping halfway through is actually the correct way to perform a forward roll",
        "Only the cartwheel and swan balance need to be complete, not the forward roll",
      ],
      explanation:
        "All three actions in the sequence — including a completed forward roll — must be finished for the sequence to count, not just the poses on either side of it.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A coach in ${place(rng)} gives ${who} feedback that the cartwheel was performed with bent arms and an uneven landing. Evaluate what this feedback suggests about ${who}'s technique.`,
      correct: `It suggests ${who}'s cartwheel needs more control — straight arms and an even, balanced landing are part of good cartwheel technique`,
      wrong: [
        "Bent arms and an uneven landing are signs of a perfectly performed cartwheel",
        `This feedback means ${who} should stop practising cartwheels altogether`,
        "Arm and landing position have no effect on cartwheel technique",
      ],
      explanation:
        "Straight arms and a controlled, even landing are part of correct cartwheel technique — feedback naming bent arms and an uneven landing is pointing to a real technique fault to work on.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} watches a classmate's 3-action sequence performed in the correct order, but with a shaky, uncontrolled swan balance at the end, in ${place(rng)}. What is the most useful feedback ${who} could give?`,
      correct: "Praise the correct sequence order, then suggest more practice on balance and keeping a straight back specifically for the swan balance",
      wrong: [
        "Say nothing, since the order was correct and that is all that matters",
        "Say the whole sequence must be redone from scratch because of the shaky ending",
        "Say the swan balance should be removed from the sequence since it was shaky",
      ],
      explanation:
        "Useful feedback names what worked (the correct order) and what specifically to improve (balance and posture for the swan balance) — not dismissing the whole attempt or the pose itself.",
    };
  },
];

const FILL_BLANK_TEMPLATES: FillBlankTemplate[] = [
  {
    before: "In a cartwheel, the body rotates sideways, passing briefly through a ",
    after: "-like position.",
    correctAnswer: "handstand",
    hint: "Think about what shape the body briefly makes at the top of a cartwheel.",
    explanation: "During a cartwheel, the body rotates sideways and passes briefly through a handstand-like shape before the feet land.",
  },
  {
    before: "During a cartwheel, the hands and feet touch the ground one after another, in this order: hand, hand, foot, ",
    after: ".",
    correctAnswer: "foot",
    hint: "The hands and feet don't land all at once — think about which lands last.",
    explanation: "In a correct cartwheel, the hands and feet land one after another: hand, hand, foot, foot.",
  },
  {
    before: "In a forward roll, the gymnast tucks the ",
    after: " to the chest before rolling forward.",
    correctAnswer: "chin",
    hint: "Think about what protects the neck during a forward roll.",
    explanation: "Tucking the chin to the chest during a forward roll protects the neck and lets the weight roll across the rounded back.",
  },
  {
    before: "Tucking the head down during a forward roll spreads the body's weight evenly across the rounded ",
    after: ", protecting the neck.",
    correctAnswer: "back",
    hint: "Think about which part of the body should take the roll, not the head.",
    explanation: "A tucked forward roll spreads weight across the rounded back, not the head, which is what keeps the neck safe.",
  },
  {
    before: "In a swan balance, the gymnast stands on ",
    after: " leg while stretching the other leg and both arms out and back.",
    correctAnswer: "one",
    hint: "Think about how many legs touch the ground during a swan balance.",
    explanation: "A swan balance is held standing on one leg, with the other leg and both arms stretched out and back like a swan's wings.",
  },
  {
    before: "Holding a swan balance steadily requires good balance and a straight ",
    after: ".",
    correctAnswer: "back",
    hint: "Think about posture — what should stay straight during the balance?",
    explanation: "A steady swan balance needs good balance and a straight back — slouching or bending makes it much harder to hold.",
  },
  {
    before: "The correct order for the 3-action sequence is cartwheel, forward roll, then swan ",
    after: ".",
    correctAnswer: "balance",
    hint: "Think about the third and final pose in the fixed sequence.",
    explanation: "The 3-action sequence's fixed order is cartwheel, forward roll, then swan balance.",
  },
  {
    before: "Combining cartwheel, forward roll and swan balance into one flowing sequence tests a gymnast's ability to ",
    after: " separate skills smoothly.",
    correctAnswer: "link",
    acceptedAnswers: ["link", "combine", "connect"],
    hint: "Think about what a sequence adds beyond performing each pose alone.",
    explanation: "A sequence tests whether a gymnast can link separate skills together smoothly, not just perform each one alone.",
  },
  {
    before: "Before attempting a cartwheel or forward roll, gymnasts should check that they have a soft ",
    after: " and clear space to prevent injury.",
    correctAnswer: "mat",
    hint: "Think about what softens a fall during gymnastics practice.",
    explanation: "A soft mat and clear space are needed before attempting a cartwheel or forward roll, to prevent injury from a fall.",
  },
  {
    before: "Gymnasts usually practise a new skill slowly, one part at a time, before linking it into a full ",
    after: ".",
    correctAnswer: "sequence",
    hint: "Think about what the individually-practised poses eventually combine into.",
    explanation: "Practising each skill slowly and separately first builds the control needed before linking the skills into a full sequence.",
  },
  {
    before: "Science and Technology links to gymnastics through understanding how the ",
    after: " works during a gymnastic performance.",
    correctAnswer: "body",
    hint: "Think about the official link to another learning area for this sub-strand.",
    explanation: "Grade 6 Creative Arts links Gymnastics to Science and Technology through understanding how the body works during the activity.",
  },
];

const IDENTIFY_PROMPTS = [
  "Identify this gymnastics pose.",
  "Which gymnastics pose is shown in the diagram?",
  "Name the pose being performed in this diagram.",
  "Look at the diagram — which pose is this?",
  "What is this gymnastics pose called?",
] as const;

const MATCH_PROMPTS = [
  "Match each gymnastics pose to its description.",
  "Which description matches each pose?",
  "Pair each pose with how it is performed.",
  "Match each pose name to the correct description below.",
  "Connect each gymnastics pose to its correct description.",
] as const;

const ORDER_PROMPTS = [
  "Arrange these three poses in the correct order for the 3-action sequence.",
  "Put cartwheel, forward roll and swan balance into the correct sequence order.",
  "Place these poses in the order they are performed in the 3-action sequence.",
  "Sort these poses into the correct sequence, from first to last.",
  "Order these three poses the way they are performed in the gymnastics sequence.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each statement about gymnastics technique and safety as true or false.",
  "Decide whether each statement below is true or false.",
  "Read each claim about gymnastics, then sort it as true or false.",
  "Which of these statements about the gymnastics sequence are true, and which are false?",
  "Sort these ideas about gymnastics technique into True and False.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete the sentence about gymnastics.",
  "Which word completes this sentence?",
  "Fill in the blank to complete the fact.",
] as const;

export const gymnastics: Skill = {
  id: "g6-cas-gymnastics",
  code: "C.9",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-creating-executing",
  grade: 6,
  title: "Gymnastics",
  description: "Describing and performing the cartwheel; performing the fixed 3-action sequence of cartwheel, forward roll and swan balance; and judging technique and safety in gymnastics performances.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["identify-pose", "term-match", "sequence-order", "safety-categorize", "reasoning", "evaluate", "fill-blank"] as const
    );

    if (branch === "identify-pose") {
      const target = randChoice(rng, POSES);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        POSES.filter((p) => p.id !== target.id).map((p) => p.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS),
        visual: { type: "gymnastics-pose", pose: target.id },
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about the body shape and how the arms and legs are positioned.",
        explanation: `This is the ${target.label.toLowerCase()}. ${target.description}`,
      };
    }

    if (branch === "term-match") {
      const tokens = shuffle(rng, POSES.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, POSES.map((p) => ({ id: p.id, label: p.description })));
      const correctMap: Record<string, string> = {};
      for (const p of POSES) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about the body shape and which body parts move for each pose.",
        explanation: POSES.map((p) => `${p.label} — ${p.description}`).join(" "),
      };
    }

    if (branch === "sequence-order") {
      const shuffled = shuffle(rng, POSES);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        items: shuffled.map((p) => ({ id: p.id, label: p.label })),
        correctOrder: [...SEQUENCE_ORDER],
        instruction: "Drag to arrange in the correct sequence order.",
        hint: "The sequence always starts with the cartwheel.",
        explanation:
          "The correct order is: " +
          SEQUENCE_ORDER.map((id) => POSES.find((p) => p.id === id)!.label).join(" → ") +
          ".",
      };
    }

    if (branch === "safety-categorize") {
      const chosen = shuffle(rng, TRUE_FALSE_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.isTrue ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "Think about the fixed order of the sequence, safe practice, and correct technique for each pose.",
        explanation: chosen.map((f) => `"${f.text}" is ${f.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Remember the sequence's fixed order: cartwheel, forward roll, then swan balance.",
        explanation: q.explanation,
      };
    }

    if (branch === "evaluate") {
      const q = randChoice(rng, EVALUATE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Judge the described performance against correct technique and safe practice, not just whether an attempt was made.",
        explanation: q.explanation,
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
      hint: fb.hint,
      explanation: fb.explanation,
    };
  },
};
