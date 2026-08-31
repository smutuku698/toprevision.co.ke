import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CATEGORIZE_ITEMS: { label: string; bucket: string; reason: string }[] = [
  { label: "Red", bucket: "warm", reason: "Red is a warm colour — it visually advances, making things look closer." },
  { label: "Orange", bucket: "warm", reason: "Orange is a warm colour — it visually advances, making things look closer." },
  { label: "Yellow", bucket: "warm", reason: "Yellow is a warm colour — it visually advances, making things look closer." },
  { label: "Blue", bucket: "cool", reason: "Blue is a cool colour — it visually recedes, making things look farther away." },
  { label: "Green", bucket: "cool", reason: "Green is a cool colour — it visually recedes, making things look farther away." },
  { label: "Purple", bucket: "cool", reason: "Purple is a cool colour — it visually recedes, making things look farther away." },
  { label: "Trapping with the foot", bucket: "trap", reason: "The foot is one of the 3 surfaces used to trap a football." },
  { label: "Trapping with the thigh", bucket: "trap", reason: "The thigh is one of the 3 surfaces used to trap a football." },
  { label: "Trapping with the chest", bucket: "trap", reason: "The chest is one of the 3 surfaces used to trap a football." },
  { label: "Dribbling with the inside of the foot", bucket: "dribble", reason: "The inside of the foot is one of the 2 dribbling variants in football." },
  { label: "Dribbling with the outside of the foot", bucket: "dribble", reason: "The outside of the foot is one of the 2 dribbling variants in football." },
];

const BUCKET_LABEL: Record<string, string> = {
  warm: "Warm colour (appears closer — progression)",
  cool: "Cool colour (appears farther — recession)",
  trap: "Football trapping surface",
  dribble: "Football dribbling variant",
};

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "A learner paints a football field and wants the far end of the pitch to look distant. Which type of colour should dominate that area?", correct: "Cool colours, such as blue or green — they recede and appear farther away", distractors: ["Warm colours, such as red or orange — they always recede", "Black and white only — colour has no effect on distance", "Any colour — colour choice does not affect how far away something looks"] },
  { q: "A learner wants the players in the foreground of a painted football scene to feel close to the viewer. Which type of colour helps achieve this?", correct: "Warm colours, such as red or orange — they advance and appear closer", distractors: ["Cool colours, such as blue or green — they always advance", "Only grey tones — warm and cool colours have no effect", "It does not matter which colours are used"] },
  { q: "A high ball is dropping toward a player's upper body, too high to control with the foot. Which trapping surface would naturally be used?", correct: "The chest", distractors: ["The thigh", "The foot", "The outside of the foot"] },
  { q: "A ball rolls along the ground directly at a player's feet. Which trapping surface is most natural to use?", correct: "The foot", distractors: ["The chest", "The thigh", "Inside of the foot dribbling"] },
  { q: "A ball drops at knee height, too low for the chest and too high to comfortably use the foot. Which trapping surface fits best?", correct: "The thigh", distractors: ["The chest", "The foot", "Outside of the foot dribbling"] },
  { q: "A player keeps the ball close while cutting sharply across their own body toward the centre of the pitch. Which dribbling variant is this?", correct: "Dribbling with the inside of the foot", distractors: ["Dribbling with the outside of the foot", "Trapping with the thigh", "Trapping with the chest"] },
  { q: "A player pushes the ball away from their body to the side while running at speed down the wing. Which dribbling variant is this?", correct: "Dribbling with the outside of the foot", distractors: ["Dribbling with the inside of the foot", "Trapping with the chest", "Trapping with the foot"] },
  { q: "In atmospheric perspective, what effect does using warm colours for the front of a painted scene create?", correct: "Progression — the front of the scene appears to advance toward the viewer", distractors: ["Recession — the front of the scene appears to move away", "No effect — atmospheric perspective only applies to black and white images", "It makes the scene look smaller overall"] },
  { q: "In atmospheric perspective, what effect does using cool colours for the background of a painted scene create?", correct: "Recession — the background appears to recede into the distance", distractors: ["Progression — the background appears to come forward", "It has no visual effect at all", "It makes the background look brighter than the foreground"] },
  { q: "Why is ball control important in a football match?", correct: "It allows a player to keep possession, trap, and dribble effectively under pressure", distractors: ["Ball control only matters for goalkeepers", "Ball control has no connection to trapping or dribbling", "Ball control is only tested in painting, not in the game itself"] },
];

const TRAP_HEIGHT_ORDER: { id: string; label: string }[] = [
  { id: "chest", label: "Trapping with the chest (highest ball)" },
  { id: "thigh", label: "Trapping with the thigh (medium-height ball)" },
  { id: "foot", label: "Trapping with the foot (ground-level ball)" },
];

const FILL_BLANKS: { before: string; after: string; answers: string[]; explanation: string }[] = [
  { before: "A colour that visually advances, making things look closer, is called a ___ colour.", after: "", answers: ["warm", "Warm"], explanation: "Warm colours advance and appear closer." },
  { before: "A colour that visually recedes, making things look farther away, is called a ___ colour.", after: "", answers: ["cool", "Cool"], explanation: "Cool colours recede and appear farther away." },
  { before: "In atmospheric perspective, warm colours create an effect called ___, making things appear to come forward.", after: "", answers: ["progression", "Progression"], explanation: "Progression is the effect of warm colours advancing." },
  { before: "In atmospheric perspective, cool colours create an effect called ___, making things appear to move into the distance.", after: "", answers: ["recession", "Recession"], explanation: "Recession is the effect of cool colours receding." },
  { before: "A high ball dropping toward a player's upper body is naturally trapped with the ___.", after: "", answers: ["chest", "Chest"], explanation: "The chest traps a high ball." },
  { before: "A ball rolling along the ground is naturally trapped with the ___.", after: "", answers: ["foot", "Foot"], explanation: "The foot traps a ground-level ball." },
  { before: "A ball at knee height, too low for the chest and too high for the foot, is naturally trapped with the ___.", after: "", answers: ["thigh", "Thigh"], explanation: "The thigh traps a knee-height ball." },
  { before: "Cutting the ball sharply across the body toward the centre of the pitch uses dribbling with the ___ of the foot.", after: "", answers: ["inside", "Inside"], explanation: "Dribbling with the inside of the foot cuts across the body." },
  { before: "Pushing the ball away from the body while running down the wing uses dribbling with the ___ of the foot.", after: "", answers: ["outside", "Outside"], explanation: "Dribbling with the outside of the foot pushes the ball away from the body." },
  { before: "Red, orange, and yellow are examples of ___ colours.", after: "", answers: ["warm", "Warm"], explanation: "Red, orange, and yellow are warm colours." },
];

const MATCH_PROMPTS = [
  "Match each item to its correct description.",
  "Pair each item below with its correct description.",
  "Match each item to what it describes.",
  "Connect each item to its correct description.",
  "For each item below, choose its matching description.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence about football.",
  "Fill in the blank with the correct word.",
] as const;

const ORDER_PROMPTS = [
  "Arrange these trapping surfaces from the one used for the highest ball to the one used for the lowest ball.",
  "Put these trapping surfaces in order, from highest ball to lowest.",
  "Order these trapping surfaces, highest ball first.",
  "Sort these trapping surfaces from highest to lowest ball height.",
  "Place these trapping surfaces in order, from the highest ball down to the lowest.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into the correct category.",
  "Which category does each item below belong to? Sort them.",
  "Classify each item into its correct category.",
  "Decide which category each item fits, and sort it.",
  "Sort these items by the category they belong to.",
] as const;

export const football: Skill = {
  id: "g7-cas-football",
  code: "C.6",
  subjectId: "creative-arts-sports",
  strandId: "g7-cas-creating-performing",
  grade: 7,
  title: "Football",
  description: "Atmospheric perspective (warm and cool colours) in a painted football composition, and trapping and dribbling skills in football.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc", "match", "fill-blank", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, CATEGORIZE_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.label, label: c.label })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.label, label: c.reason })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.label] = c.label;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Warm colours advance and cool colours recede; trapping surfaces stop the ball, dribbling variants move it.",
        explanation: chosen.map((c) => c.reason).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL_BLANKS);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: f.before,
        after: f.after,
        correctAnswer: f.answers[0],
        acceptedAnswers: f.answers,
        inputMode: "text",
        hint: "Think about colour theory or the height of the ball being controlled.",
        explanation: f.explanation,
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the trapping surfaces in order, from highest ball to lowest ball.",
        items: shuffle(rng, TRAP_HEIGHT_ORDER),
        correctOrder: TRAP_HEIGHT_ORDER.map((t) => t.id),
        hint: "A ball dropping from high up needs the chest; a ball at knee height needs the thigh; a ball on the ground needs the foot.",
        explanation: `From highest ball to lowest ball: ${TRAP_HEIGHT_ORDER.map((t) => t.label).join(" → ")}.`,
      };
    }

    if (branch === "categorize") {
      const warmPicks = shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === "warm")).slice(0, 2);
      const coolPicks = shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === "cool")).slice(0, 2);
      const trapPicks = shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === "trap")).slice(0, 3);
      const dribblePicks = CATEGORIZE_ITEMS.filter((c) => c.bucket === "dribble");
      const items = shuffle(rng, [...warmPicks, ...coolPicks, ...trapPicks, ...dribblePicks]);
      const correctBucket: Record<string, string> = {};
      for (const c of items) correctBucket[c.label] = c.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((c) => ({ id: c.label, label: c.label })),
        buckets: (["warm", "cool", "trap", "dribble"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Warm colours advance and cool colours recede in a painting; trapping surfaces stop the ball, dribbling variants move it.",
        explanation: items.map((c) => c.reason).join(" "),
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "For colour questions, think about whether warm or cool colours advance or recede; for skill questions, think about the height and situation of the ball.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
