import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import {
  place,
  name,
  buildScenarioChoices,
  pickPrompt,
  SORT_PROMPTS,
  MATCH_PROMPTS,
  ORDER_PROMPTS,
  TRUE_FALSE_PROMPTS,
  FILL_BLANK_PROMPTS,
  IDENTIFY_PROMPTS,
} from "./g5CasShared";
import type { ScenarioMC } from "./g5CasShared";

// KICD Grade 5 Creative Arts, Strand 1.0 Creating and Executing, sub-strand 1.2 "Football"
// (18 lessons).
//
// Mined verbatim: Kicking (instep, outside of the foot); Stopping (inside of the foot, step
// trap); Dribbling (straight dribble); Papier mâché (shredding, soaking, pounding, mixing
// with adhesive); Casting. Key inquiry: why the Football game is popular; what the advantages
// of casting with papier mâché are. Core competencies: Digital literacy; Creativity and
// imagination. Link to other learning area: Mathematics (ball trajectory).
//
// Visual coverage: no football-skill or papier-mâché VisualSpec exists in the shared set;
// building one is out of scope for this pass (consistent with the other Grade 5/6 Creative
// Arts skills). Recorded so the omission is deliberate.

const SKILLS_DATA = [
  {
    id: "instep-kick",
    label: "Instep kick",
    category: "kicking",
    desc: "Striking the ball with the hard, laced part on the top of the boot for a powerful, long kick",
  },
  {
    id: "outside-foot-kick",
    label: "Outside-of-the-foot kick",
    category: "kicking",
    desc: "Striking the ball with the outer edge of the boot to bend the ball or pass quickly without turning the body",
  },
  {
    id: "inside-foot-stop",
    label: "Inside-of-the-foot stop",
    category: "stopping",
    desc: "Meeting the ball with the broad inside surface of the foot and drawing the foot back slightly to cushion it",
  },
  {
    id: "step-trap",
    label: "Step trap",
    category: "stopping",
    desc: "Trapping the ball by placing the sole of the foot lightly on top of it as it arrives on the ground",
  },
  {
    id: "straight-dribble",
    label: "Straight dribble",
    category: "dribbling",
    desc: "Running forward in a straight line while pushing the ball ahead with small, controlled touches",
  },
] as const;

const ACTIONS = [
  { text: "Hitting the ball hard with the laces on top of the boot to shoot from far out", id: "instep-kick" },
  { text: "Using the outer edge of the boot to bend a pass around a defender", id: "outside-foot-kick" },
  { text: "Flicking the ball sideways with the outside of the foot without turning to face it", id: "outside-foot-kick" },
  { text: "Booting a long clearance downfield with the top of the foot", id: "instep-kick" },
  { text: "Turning the foot outwards so the broad inside meets the ball, then pulling back to soften it", id: "inside-foot-stop" },
  { text: "Cushioning an incoming pass with the inside of the foot so it stops dead close by", id: "inside-foot-stop" },
  { text: "Putting the sole of the boot gently on top of the ball to pin it to the ground", id: "step-trap" },
  { text: "Stopping a bouncing ball by trapping it under the sole as it lands", id: "step-trap" },
  { text: "Nudging the ball forward with the laces every couple of steps while sprinting straight ahead", id: "straight-dribble" },
  { text: "Keeping the ball just in front of the feet with small touches while running in a line", id: "straight-dribble" },
] as const;

const PAPIER_STEPS = [
  { id: "p1", label: "Shred old newspaper and waste paper into small strips" },
  { id: "p2", label: "Soak the shredded paper in water until it is soft" },
  { id: "p3", label: "Pound the soaked paper into a smooth, even pulp" },
  { id: "p4", label: "Mix the pulp with adhesive to make a firm modelling paste" },
  { id: "p5", label: "Press the paste into a cone-shaped mould to cast the cone" },
  { id: "p6", label: "Leave the cast cone to dry hard, then remove it from the mould" },
  { id: "p7", label: "Paint the dry cones in bright colours" },
  { id: "p8", label: "Use the finished cones to mark out the playing area" },
] as const;

const CASTING_TF = [
  { text: "Papier mâché lets you make many identical marking cones cheaply from waste paper", isTrue: true },
  { text: "Casting in a mould means every cone comes out the same shape and size", isTrue: true },
  { text: "Papier mâché cones are light, so they are easy to carry and set out on the field", isTrue: true },
  { text: "Making cones from shredded waste paper reuses material that would otherwise be thrown away", isTrue: true },
  { text: "A broken papier mâché cone can be pulped and cast again", isTrue: true },
  { text: "Papier mâché cones must be made from brand-new, expensive paper to work at all", isTrue: false },
  { text: "Casting with papier mâché needs an electric machine that most schools do not have", isTrue: false },
  { text: "Papier mâché cones are so heavy that two people are needed to lift each one", isTrue: false },
  { text: "Every papier mâché cone comes out a completely different, random shape", isTrue: false },
  { text: "Painting the cones bright colours helps players see the edges of the marked area clearly", isTrue: true },
  { text: "The pulp should be mixed with adhesive so the dried cone holds together firmly", isTrue: true },
  { text: "Wet pulp can be shaped straight into a cone with no mould and no adhesive and it will still set hard and keep its shape", isTrue: false },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is far from goal with a clear sight of it and wants to shoot with as much power as possible. Which kick should ${who} use?`,
      correct: "The instep kick — striking with the hard, laced top of the boot gives the most power for a long shot",
      wrong: [
        "The outside-of-the-foot kick — this is for bending or flicking a quick pass, not for maximum power",
        "The inside-of-the-foot stop — this is a way of stopping the ball, not kicking it",
        "The step trap — this pins the ball under the sole and is not a kick at all",
      ],
      explanation: "The instep (laces) is the firmest striking surface and gives the most power, which is what a long-range shot needs. The outside-foot kick is for bending passes, and the other two are stopping skills.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} needs to slip a pass to a team-mate slightly to the side while still running forward, without stopping to turn and face them. Which skill fits best?`,
    correct: "The outside-of-the-foot kick — the outer edge of the boot flicks the ball sideways without the player turning",
    wrong: [
      "The instep kick — this needs the player to line up behind the ball and swing through it",
      "The step trap — this stops the ball dead and does not pass it anywhere",
      "The straight dribble — this keeps the ball at the player's own feet rather than passing it",
    ],
    explanation: "The outside-of-the-foot kick lets a running player redirect the ball sideways with the outer edge of the boot, no turn required. The instep needs a proper set-up, and the other two do not pass the ball.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A firm ground pass is coming straight at ${who} in ${place(rng)}, who wants it to stop dead right at their feet ready to play again. Which stopping skill is best?`,
      correct: "The inside-of-the-foot stop — the broad inside surface meets the ball and the foot draws back to cushion it",
      wrong: [
        "The step trap — better for a dropping or bouncing ball than a firm pass along the ground",
        "The instep kick — this strikes the ball away rather than stopping it",
        "The straight dribble — this moves the ball forward, it does not receive a pass",
      ],
      explanation: "For a firm ground pass, the inside of the foot gives the largest, safest surface and can be drawn back to cushion the ball dead. The step trap suits a dropping ball better.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees a high ball dropping just in front and wants to trap it the instant it lands. Which skill is designed for this?`,
    correct: "The step trap — the sole of the foot is placed lightly on top of the ball as it hits the ground",
    wrong: [
      "The inside-of-the-foot stop — this works best for a ball travelling along the ground, not one dropping from above",
      "The outside-of-the-foot kick — this passes the ball away rather than trapping it",
      "The instep kick — this is a striking skill, not a stopping one",
    ],
    explanation: "The step trap uses the sole on top of the ball at the moment it lands, which suits a dropping or bouncing ball. The inside-of-the-foot stop is better for a ground pass.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s class in ${place(rng)} is making marking cones and asks why papier mâché is a good choice rather than buying plastic cones. What is the best answer?`,
      correct: "It is cheap and reuses waste paper, and a mould lets the class cast many identical cones",
      wrong: [
        "It is the heaviest material available, so the cones will never blow away",
        "It is the only material that can be shaped into a cone at all",
        "It sets hard instantly with no drying time needed",
      ],
      explanation: "The advantage of casting with papier mâché is low cost, reuse of waste paper, and identical repeated cones from one mould. It is light (not heavy), and it needs drying time.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} pours water over shredded paper and leaves it. Why is this soaking step done before pounding the paper?`,
    correct: "Water softens the paper fibres so they break down into a smooth pulp when pounded",
    wrong: [
      "Water makes the paper waterproof so the finished cone never gets wet",
      "Soaking adds colour to the paper so the cones do not need painting",
      "The water glues the paper strips together on its own, with no adhesive needed",
    ],
    explanation: "Soaking softens the fibres so pounding turns them into an even pulp. Adhesive is still needed to bind the pulp, and the cones are still painted afterwards.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} watches a video of a professional taking a long shot and sees the ball rise, arc over, and drop. Which subject does the design link this curved flight of the ball to?`,
      correct: "Mathematics — the learner is exposed to ball trajectory (the curved path the ball follows)",
      wrong: [
        "Kiswahili — the curved path of a ball is a language topic",
        "It links to no other subject",
        "Music — because the crowd sings while the ball is in the air",
      ],
      explanation: "The design links football skills to Mathematics through ball trajectory — the shape of the curved path the ball travels as it is kicked, stopped and dribbled.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is dribbling straight down the wing in open space with no defender near. Which touch pattern keeps the ball best under control at speed?`,
    correct: "Small, frequent touches that push the ball just ahead of the feet while running in a straight line",
    wrong: [
      "One long kick far ahead, then a sprint to catch up to the ball",
      "Standing still and rolling the ball from foot to foot",
      "Trapping the ball under the sole after every single step",
    ],
    explanation: "A straight dribble in open space uses small, controlled touches that keep the ball within playing distance. One big kick ahead risks losing it, and the other options are not dribbling.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is casting cones and mixes the pounded pulp with adhesive before pressing it into the mould. What would most likely go wrong if the adhesive were left out?`,
      correct: "The dried cone would be weak and crumbly and would fall apart when handled",
      wrong: [
        "The cone would come out a different colour than expected",
        "The cone would set instantly and could not be removed from the mould",
        "Nothing would change; adhesive only makes the pulp smell nicer",
      ],
      explanation: "Adhesive binds the paper pulp so the cone dries into one firm piece. Without it the fibres barely hold together and the cone crumbles when moved.",
    };
  },
  (rng) => ({
    prompt: `In ${place(rng)}, ${name(rng)}'s class finishes casting a set of cones and lets them dry before painting. Why paint the cones bright colours rather than leaving them grey?`,
    correct: "Bright colours make the edges of the marked playing area easy for players to see during the game",
    wrong: [
      "Paint is what makes the papier mâché set hard",
      "Grey cones are against the rules of football",
      "Painting adds enough weight to stop the cones being kicked over",
    ],
    explanation: "The cones mark out the field, so bright paint makes the boundary clearly visible. The cones are already hard from drying, and colour is about visibility, not weight or rules.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} controls a firm pass with the inside of the foot but keeps the foot stiff, and the ball bounces away out of reach. What was the mistake?`,
      correct: "Not drawing the foot back on contact — the foot must give a little to cushion the ball, or it rebounds",
      wrong: [
        "Using the inside of the foot at all — the outside edge is the correct surface for stopping",
        "Watching the ball onto the foot — the player should look away at the moment of contact",
        "Standing still — the player must be sprinting for an inside-foot stop to work",
      ],
      explanation: "An inside-of-the-foot stop works only if the foot is drawn back slightly on contact to absorb the ball's speed; a rigid foot makes the ball rebound.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s group in ${place(rng)} has one cone mould and needs eight matching cones for the field. Why is casting in a mould better here than shaping each cone by hand?`,
    correct: "The mould makes every cone the same shape and size, so the eight cones match",
    wrong: [
      "Hand-shaping is not possible with papier mâché at all",
      "A mould makes the cones dry without needing any air",
      "Casting in a mould removes the need to mix in any adhesive",
    ],
    explanation: "A mould's advantage is identical repeated results — eight matching cones. Hand-shaping is possible but gives uneven cones, and a mould does not change drying or the need for adhesive.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  { before: "Striking the ball with the hard laced part on top of the boot for a powerful kick is called the ", after: " kick.", correctAnswer: "instep" },
  { before: "Striking the ball with the outer edge of the boot to bend or flick a quick pass is the ", after: " kick.", correctAnswer: "outside-of-the-foot", acceptedAnswers: ["outside-of-the-foot", "outside of the foot", "outside foot"] },
  { before: "Meeting a ground pass with the broad inside surface of the foot and drawing back to cushion it is the ", after: " stop.", correctAnswer: "inside-of-the-foot", acceptedAnswers: ["inside-of-the-foot", "inside of the foot", "inside foot"] },
  { before: "Trapping the ball by placing the sole of the foot on top of it as it lands is called the ", after: ".", correctAnswer: "step trap", acceptedAnswers: ["step trap", "sole trap"] },
  { before: "Running forward in a line while pushing the ball ahead with small touches is the ", after: " dribble.", correctAnswer: "straight" },
  { before: "In making papier mâché, old paper is first torn or cut into small strips; this step is called ", after: ".", correctAnswer: "shredding" },
  { before: "After shredding, the paper strips are ", after: " in water until they become soft.", correctAnswer: "soaked", acceptedAnswers: ["soaked", "soaking"] },
  { before: "The softened paper is then ", after: " into a smooth, even pulp.", correctAnswer: "pounded", acceptedAnswers: ["pounded", "pounding"] },
  { before: "The pulp is mixed with ", after: " so that the dried cone holds together firmly.", correctAnswer: "adhesive", acceptedAnswers: ["adhesive", "glue"] },
  { before: "Pressing the paper paste into a shaped mould to form a marking cone is called ", after: ".", correctAnswer: "casting" },
  { before: "One advantage of casting with papier mâché is that a mould lets you make many ", after: " cones from cheap waste paper.", correctAnswer: "identical", acceptedAnswers: ["identical", "matching", "same"] },
  { before: "The design links football skills to Mathematics through the curved path, or ", after: ", that the ball follows.", correctAnswer: "trajectory" },
] as const;

const IDENTIFY_SKILL_PROMPTS = [
  ...IDENTIFY_PROMPTS,
  "Which football skill is described here?",
  "Name the football technique described.",
  "Which of these football skills fits the description?",
] as const;

export const football: Skill = {
  id: "g5-cas-football",
  code: "C.2",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-creating-executing",
  grade: 5,
  title: "Football",
  description:
    "Kicking (instep, outside of the foot), stopping (inside of the foot, step trap) and straight dribbling in football; and preparing papier mâché (shredding, soaking, pounding, mixing with adhesive) to cast marking cones.",
  generate(rng) {
    const branch = randChoice(rng, [
      "identify-skill",
      "actions-sort",
      "skill-desc-match",
      "papier-order",
      "casting-tf",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "identify-skill") {
      const target = randChoice(rng, SKILLS_DATA);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        SKILLS_DATA.filter((s) => s.id !== target.id).map((s) => s.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `${pickPrompt(rng, IDENTIFY_SKILL_PROMPTS)} ${target.desc}.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Decide first whether it is a kicking, stopping or dribbling skill, then which one.",
        explanation: `This is the ${target.label}: ${target.desc.toLowerCase()}.`,
      };
    }

    if (branch === "actions-sort") {
      const chosen = shuffle(rng, ACTIONS).slice(0, 6);
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => {
        const s = SKILLS_DATA.find((x) => x.id === a.id)!;
        correctBucket[`a${i}`] = s.category;
      });
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "kicking", label: "Kicking" },
          { id: "stopping", label: "Stopping" },
          { id: "dribbling", label: "Dribbling" },
        ],
        correctBucket,
        hint: "Kicking sends the ball away; stopping brings it under control; dribbling keeps it at your own feet while moving.",
        explanation: chosen
          .map((a) => {
            const s = SKILLS_DATA.find((x) => x.id === a.id)!;
            return `"${a.text}" is ${s.category} (${s.label}).`;
          })
          .join(" "),
      };
    }

    if (branch === "skill-desc-match") {
      const chosen = shuffle(rng, SKILLS_DATA);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.id, label: s.desc })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((s) => (correctMap[s.id] = s.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about which part of the foot each skill uses and whether it sends, receives, or carries the ball.",
        explanation: chosen.map((s) => `${s.label} — ${s.desc}.`).join(" "),
      };
    }

    if (branch === "papier-order") {
      const shuffled = shuffle(rng, PAPIER_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (making papier mâché marking cones)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PAPIER_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Shred, soak, pound and mix to make the paste; then cast in a mould, dry, paint, and finally mark the field.",
        explanation: "Correct order: " + PAPIER_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "casting-tf") {
      const chosen = shuffle(rng, CASTING_TF).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `c${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`c${i}`] = f.isTrue ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, TRUE_FALSE_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "Papier mâché casting is cheap, reuses waste paper, is light, and repeats identical cones from a mould — but it does need adhesive and drying time.",
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
        hint: "Match the skill to the situation: power vs quick redirect, ground pass vs dropping ball, and why papier mâché casting is used.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    const accepted = "acceptedAnswers" in fb && fb.acceptedAnswers ? fb.acceptedAnswers : [fb.correctAnswer];
    return {
      kind: "fill-blank",
      prompt: pickPrompt(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...accepted],
      inputMode: "text",
      hint: "Think about the named kicking, stopping and dribbling skills and the four papier mâché steps.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
