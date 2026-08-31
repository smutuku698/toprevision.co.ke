import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 4.1 Repairing Garments — 2 named stitches (back stitch, running
// stitch), both used to repair a gaping seam. See curriculum-reference/grade-5/agriculture.json.

const STITCHES = [
  { id: "back", label: "Back stitch", def: "A strong stitch made by stitching backward over each previous stitch, giving a solid, durable seam" },
  { id: "running", label: "Running stitch", def: "A simple, quick in-and-out stitch, useful for a fast temporary repair" },
] as const;

const STITCH_TRAITS = [
  { text: "Gives a strong, durable seam suited to a garment that will be worn hard", stitch: "back" },
  { text: "Is quicker to sew but produces a weaker, more temporary repair", stitch: "running" },
  { text: "Overlaps each stitch backward over the one before it", stitch: "back" },
  { text: "Moves the needle simply in and out along the fabric in one direction", stitch: "running" },
  { text: "Best chosen when a repair needs to hold up to regular strain", stitch: "back" },
  { text: "A reasonable quick fix when there is little time before wearing the garment again", stitch: "running" },
] as const;

const REPAIR_PRACTICES = [
  { text: "Matching the thread colour closely to the garment before stitching", good: true },
  { text: "Knotting the thread securely at the start and end of the repair", good: true },
  { text: "Stitching close enough to the torn edge to hold it firmly", good: true },
  { text: "Checking the repaired seam for strength before wearing the garment again", good: true },
  { text: "Using a very long, loose thread that tangles easily while sewing", good: false },
  { text: "Leaving the thread completely unknotted so stitches can unravel", good: false },
  { text: "Stitching far away from the torn edge, leaving the gap unrepaired", good: false },
] as const;

const REPAIR_STEPS = [
  { id: "r1", label: "Thread a needle and knot the end of the thread" },
  { id: "r2", label: "Start stitching from the inside of the garment, near one end of the gaping seam" },
  { id: "r3", label: "Work the chosen stitch (back stitch or running stitch) along the length of the seam" },
  { id: "r4", label: "Stitch to the other end of the gap, keeping the stitches even" },
  { id: "r5", label: "Secure the thread with a knot at the end and trim off the excess" },
  { id: "r6", label: "Check the repaired seam is firm before wearing the garment" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} has a school trouser seam that gapes open at the knee, an area under a lot of strain from daily movement. Which stitch would give the strongest, most durable repair?`,
      correct: "Back stitch",
      wrong: ["Running stitch", "Neither stitch is strong enough for this repair", "Both stitches are equally weak here"],
      explanation: "Back stitch produces a stronger, more durable seam than running stitch, making it better suited to a high-strain area like a trouser knee.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} needs to quickly close a small gap in a seam just before rushing to a game, with only a minute to spare. Which stitch would be the practical quick choice?`,
    correct: "Running stitch",
    wrong: ["Back stitch", "Neither stitch can be sewn quickly", "The garment cannot be repaired quickly at all"],
    explanation: "Running stitch is simpler and quicker to sew, making it a practical (if more temporary) choice when time is short.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} uses back stitch to repair a gaping seam, sewing backward over each stitch as they go. What does this backward overlap achieve?`,
      correct: "It makes the seam stronger and more durable than a simple in-and-out stitch",
      wrong: ["It makes the seam weaker than running stitch", "It has no effect on the seam's strength at all", "It only affects appearance, not strength"],
      explanation: "Back stitch's overlapping backward motion is what gives it more strength and durability compared to running stitch.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} finishes repairing a gaping seam but forgets to knot the thread securely at the end. What is likely to happen?`,
    correct: "The stitches are likely to unravel over time since nothing is holding the thread in place",
    wrong: ["The repair will always stay perfectly intact regardless of knotting", "Knotting the thread has no effect on the repair's durability", "Unknotted thread always makes a repair stronger"],
    explanation: "Securing the thread with a knot at the start and end is essential — without it, the stitches can easily unravel.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} carefully matches the thread colour to the garment's fabric before repairing a gaping seam. Why does this matter?`,
      correct: "It makes the repair less noticeable and neater in appearance",
      wrong: ["Thread colour has no effect on how the repair looks", "Mismatched thread always looks better than matched thread", "This choice affects the seam's strength, not its appearance"],
      explanation: "Matching thread colour to the fabric is a finishing detail that makes a repair look neater, even though it doesn't change the seam's strength.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} stitches a repair far away from the actual torn edge of a gaping seam, leaving the original gap still open. What is wrong with this repair?`,
    correct: "It fails to actually close the gap, so the garment is still torn where it matters",
    wrong: ["Nothing is wrong; stitching anywhere on the garment fixes the tear", "This is the correct technique for repairing a gaping seam", "The distance from the tear has no effect on the repair's usefulness"],
    explanation: "A repair must be stitched close enough to the torn edge to actually close the gap — stitching elsewhere leaves the original problem unfixed.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} saves money by repairing a favourite shirt's gaping seam instead of buying a new one. Which value from this sub-strand does this best show?`,
      correct: "Financial literacy — saving costs by repairing rather than replacing clothing",
      wrong: ["Creativity and imagination only, with no financial connection", "This choice has no connection to any value in the sub-strand", "Responsibility only, unrelated to money at all"],
      explanation: "This sub-strand's own pertinent issue is financial literacy — repairing clothes instead of replacing them saves money.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} practises both back stitch and running stitch on a scrap of fabric before repairing their actual garment. Why is this a sensible approach?`,
    correct: "Practising first helps build the skill and confidence needed before repairing a real garment",
    wrong: ["Practising has no benefit and wastes fabric", "Skipping practice always produces a better repair", "The two stitches are identical, so practice is pointless"],
    explanation: "Making samples of stitches, as the sub-strand's own learning experiences suggest, builds skill before applying a stitch to an actual repair.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} checks the strength of a newly repaired seam by gently tugging at it before wearing the garment again. Why is this a good final step?`,
      correct: "It confirms the repair is firm and will hold up before the garment is actually worn and put under strain",
      wrong: ["Checking the repair has no real value once stitching is finished", "This step always damages a properly repaired seam", "A finished repair never needs to be checked"],
      explanation: "Checking a repair's strength before wearing the garment again confirms it will hold up, an important final step in the repair process.",
    };
  },
  (rng) => ({
    prompt: `A tailor in ${place(rng)} teaches learners that a garment's daily-wear areas, like knees and elbows, usually need a stronger repair stitch than a delicate, rarely-strained seam. What guidance does this give for choosing a stitch?`,
    correct: "Choose back stitch for high-strain areas and running stitch may suit lower-strain, quicker repairs",
    wrong: ["Always use running stitch everywhere, regardless of strain", "The choice of stitch never depends on where the repair is", "Always use back stitch everywhere, even for the quickest temporary fix"],
    explanation: "Matching the stitch to how much strain the repaired area will face is sensible judgement — back stitch for durability, running stitch for speed.",
  }),
];

export const repairingGarments: Skill = {
  id: "g5-ag-production-techniques-repairing-garments",
  code: "PT.1",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-production-techniques",
  grade: 5,
  title: "Repairing garments",
  description: "Identifying and using back stitch and running stitch to repair a gaping seam in a garment.",
  generate(rng) {
    const branch = randChoice(rng, ["stitch-match", "trait-categorize", "practice-categorize", "repair-order", "reasoning", "fill-blank"] as const);

    if (branch === "stitch-match") {
      const tokens = shuffle(rng, STITCHES.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, STITCHES.map((s) => ({ id: s.id, label: s.def })));
      const correctMap: Record<string, string> = {};
      for (const s of STITCHES) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "stitch to its description"),
        tokens,
        targets,
        correctMap,
        hint: "Think about which stitch overlaps backward, and which is a simple in-and-out stitch.",
        explanation: STITCHES.map((s) => `${s.label} — ${s.def}.`).join(" "),
      };
    }

    if (branch === "trait-categorize") {
      const chosen = shuffle(rng, STITCH_TRAITS).slice(0, 6);
      const items = chosen.map((t, i) => ({ id: `t${i}`, label: t.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((t, i) => (correctBucket[`t${i}`] = t.stitch));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it describes back stitch or running stitch"),
        items,
        buckets: [
          { id: "back", label: "Back stitch" },
          { id: "running", label: "Running stitch" },
        ],
        correctBucket,
        hint: "Think about strength versus speed, and how each stitch is formed.",
        explanation: chosen.map((t) => `"${t.text}" describes ${t.stitch === "back" ? "back stitch" : "running stitch"}.`).join(" "),
      };
    }

    if (branch === "practice-categorize") {
      const chosen = shuffle(rng, REPAIR_PRACTICES).slice(0, 6);
      const items = chosen.map((p, i) => ({ id: `p${i}`, label: p.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`p${i}`] = p.good ? "good" : "poor"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is good repair practice or poor repair practice"),
        items,
        buckets: [
          { id: "good", label: "Good repair practice" },
          { id: "poor", label: "Poor repair practice" },
        ],
        correctBucket,
        hint: "Think about thread choice, securing the thread, stitching close to the tear, and checking the finished repair.",
        explanation: chosen.map((p) => `"${p.text}" is ${p.good ? "good" : "poor"} repair practice.`).join(" "),
      };
    }

    if (branch === "repair-order") {
      const shuffled = shuffle(rng, REPAIR_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of repairing a gaping seam"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: REPAIR_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Thread and knot first, then stitch along the gap, then secure and check the repair.",
        explanation: "Correct order: " + REPAIR_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "A strong stitch made by sewing backward over each previous stitch is called ", after: ".", correctAnswer: "back stitch" },
      { before: "A simple, quick in-and-out stitch is called ", after: ".", correctAnswer: "running stitch" },
      { before: "Both back stitch and running stitch are used to repair a ", after: ".", correctAnswer: "gaping seam" },
      { before: "The thread should be ", after: " securely at the start and end of a repair.", correctAnswer: "knotted" },
      { before: "Back stitch is generally chosen for areas under a lot of ", after: ".", correctAnswer: "strain" },
      { before: "Repairing a garment instead of buying a new one saves ", after: ", a financial literacy benefit.", correctAnswer: "money", alsoAccept: ["costs"] },
      { before: "Matching thread colour to the fabric makes a repair look ", after: ".", correctAnswer: "neater", alsoAccept: ["neat"] },
      { before: "A repair should be checked for ", after: " before the garment is worn again.", correctAnswer: "strength" },
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
      hint: "Think about back stitch, running stitch, and repairing a gaping seam.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
