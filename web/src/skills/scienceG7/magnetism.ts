import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const MATERIALS = [
  { name: "Iron nail", type: "magnetic" },
  { name: "Steel spoon", type: "magnetic" },
  { name: "Cobalt", type: "magnetic" },
  { name: "Nickel", type: "magnetic" },
  { name: "Plastic ruler", type: "non-magnetic" },
  { name: "Wooden pencil", type: "non-magnetic" },
  { name: "Aluminium foil", type: "non-magnetic" },
  { name: "Copper wire", type: "non-magnetic" },
  { name: "Rubber band", type: "non-magnetic" },
  { name: "Glass bottle", type: "non-magnetic" },
] as const;

// 10 distinct everyday uses of magnets (pool-size floor: click-match fact pools need 10+).
const USES = [
  { use: "Magnetic compass", application: "Points north-south, helping travellers and hikers find direction." },
  { use: "Refrigerator door seal", application: "Contains a magnetic strip that keeps the door closed tightly." },
  { use: "Loudspeaker", application: "Uses a magnet to help convert electrical signals into sound." },
  { use: "Scrap metal separator at a recycling yard", application: "Uses a powerful magnet to pull magnetic metals out of mixed waste." },
  { use: "Magnetic toy crane game", application: "Uses a small magnet to pick up and drop light metal objects." },
  { use: "Electric bell", application: "Uses an electromagnet to pull a metal striker and ring the bell repeatedly." },
  { use: "Electric motor", application: "Uses magnets together with a current-carrying coil to make a shaft spin, powering fans and other machines." },
  { use: "Magnetic screwdriver", application: "Its tip is magnetised so it can hold small metal screws in place while working." },
  { use: "ATM/bank card magnetic strip", application: "Stores account information magnetically so a card reader can read it." },
  { use: "Cattle magnet used by farmers", application: "Given to cattle to collect swallowed metal objects like nails or wire, protecting the animal's stomach." },
] as const;

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma",
  "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru",
] as const;

const KENYAN_PLACES = [
  "Kisumu", "Eldoret", "Nakuru", "Kitengela", "Thika", "Nyeri",
  "Kitale", "Machakos", "Mombasa", "Meru", "Kericho", "Kakamega",
] as const;

function name(rng: RNG) {
  return randChoice(rng, KENYAN_NAMES);
}
function place(rng: RNG) {
  return randChoice(rng, KENYAN_PLACES);
}

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

// 10 distinct Apply/Analyze/Evaluate-tier scenario templates (pool-size floor for reasoning multiple-choice branches).
const LAW_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  () => ({
    prompt: "According to the basic law of magnetism, what happens when the north pole of one magnet is brought near the north pole of another?",
    correct: "They repel (push apart), because like poles repel.",
    wrong: ["They attract strongly.", "Nothing happens at all.", "They both lose their magnetism."],
    explanation: "The basic law of magnetism states that like poles repel and unlike poles attract — two north poles brought together will push apart.",
  }),
  () => ({
    prompt: "A bar magnet is broken exactly in half. What happens to the two pieces?",
    correct: "Each piece becomes a new, complete magnet with its own north and south pole.",
    wrong: ["One piece keeps both poles and the other has none.", "Both pieces lose all magnetism.", "The pieces can no longer attract any metal."],
    explanation: "A magnet cannot have just one pole — breaking it in half creates two smaller magnets, each with its own north and south pole.",
  }),
  () => ({
    prompt: "Where on a bar magnet is the magnetic force strongest?",
    correct: "At the two poles (ends) of the magnet.",
    wrong: ["Exactly in the middle of the magnet.", "It is the same strength everywhere.", "Magnetic force cannot be compared along a magnet."],
    explanation: "A magnet's pulling force is strongest at its two poles (ends) and weakest around its middle.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, in ${place(rng)}, brings two bar magnets close together and a certain pair of ends snaps together strongly. What can ${who} conclude about those two ends?`,
      correct: "The two ends are unlike poles (one north, one south), since unlike poles attract.",
      wrong: [
        "The two ends must be exactly the same pole.",
        "Magnets never actually touch when the attraction is strong.",
        "The strong snap shows that one of the magnets is broken.",
      ],
      explanation: "A strong attraction between two magnet ends means the poles facing each other are unlike (one N, one S) — like poles would push apart instead.",
    };
  },
  (rng) => ({
    prompt: `A compass needle in ${place(rng)}, kept away from other magnets, always settles pointing in the same direction. What does this tell us about the compass needle?`,
    correct: "It behaves like a tiny magnet whose north pole is attracted toward Earth's magnetic north, which is why it consistently points that way.",
    wrong: [
      "It means the needle is not actually magnetic.",
      "It means the needle only works correctly during the day.",
      "It means the needle is always pointing directly toward the sun.",
    ],
    explanation: "A compass needle is a small magnet, free to rotate — it lines up with Earth's own magnetic field, so its north-seeking end consistently points toward magnetic north.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} strokes an iron nail repeatedly in one direction with the pole of a bar magnet, then finds the nail can now pick up small pins. What has happened?`,
      correct: "The nail has been magnetised — the repeated stroking lined up its internal magnetic domains in one direction, turning it into a temporary magnet.",
      wrong: [
        "The nail became hot from the rubbing, and that is what made it magnetic.",
        "The nail gained extra mass from the magnet during stroking.",
        "Rubbing a magnet against iron has no real effect on its magnetism.",
      ],
      explanation: "Stroking a magnetic material with a magnet's pole, always in the same direction, aligns its tiny magnetic domains and can turn it into a (usually temporary) magnet.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} heats a magnetised iron nail strongly over a flame in ${place(rng)}. What is likely to happen to its magnetism?`,
      correct: "The nail is likely to lose most or all of its magnetism, because strong heating disturbs the alignment of its magnetic domains.",
      wrong: [
        "The nail's magnetism will become stronger from the heat.",
        "Heating a magnet has no effect on its magnetism at all.",
        "The nail will become a permanent magnet that can never be demagnetised again.",
      ],
      explanation: "Strong heat gives the iron's atoms enough energy to fall out of their aligned pattern, which weakens or destroys a material's magnetism — this is a genuine way to demagnetise something.",
    };
  },
  (rng) => ({
    prompt: `In a classroom demonstration in ${place(rng)}, two bar magnets are placed with their south poles facing each other. What will ${name(rng)} observe?`,
    correct: "The two magnets will repel (push apart), because like poles repel each other.",
    wrong: ["They will attract strongly.", "Nothing will happen between them.", "One of the magnets will lose its magnetism."],
    explanation: "South and south are like poles, and like poles always repel — the magnets will push apart, the same as two north poles would.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} wants to store two bar magnets safely in ${place(rng)} so they don't weaken over time. Why is it recommended to store them with unlike poles adjacent, rather than loose in a drawer?`,
      correct: "Keeping unlike poles together helps maintain the alignment of the magnets' internal domains, preserving their strength over time.",
      wrong: [
        "It makes the magnets physically heavier.",
        "It has no real effect on the magnets' strength at all.",
        "It permanently joins the two magnets into one.",
      ],
      explanation: "Storing bar magnets with unlike poles together (or with a keeper across the poles) helps keep their internal magnetic domains aligned, which slows the gradual weakening that can happen over time.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} claims that if you keep cutting a bar magnet into smaller and smaller pieces, you will eventually get a piece with only a north pole and no south pole. Is ${who} correct?`,
      correct: "No — every piece, however small, will always have both a north pole and a south pole; a single magnetic pole cannot exist alone.",
      wrong: [
        "Yes, small enough pieces eventually lose their south pole.",
        "Yes, but only if the magnet is cut along one specific line.",
        "It depends on which magnetic metal the magnet is made from.",
      ],
      explanation: "No matter how many times a magnet is cut, each new piece always forms its own complete magnet with both a north and a south pole — an isolated single pole does not exist.",
    };
  },
];

const MAGNETISE_STEPS = [
  { id: "place", label: "Place the iron nail flat on a table" },
  { id: "position", label: "Hold the magnet and place one of its poles at one end of the nail" },
  { id: "stroke", label: "Stroke the magnet along the length of the nail in one direction only" },
  { id: "lift-repeat", label: "Lift the magnet away and repeat the stroke several times" },
  { id: "test", label: "Test the nail's magnetism by seeing if it picks up small pins" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The force of attraction or repulsion produced by a magnet is called ", after: ".", correctAnswer: "magnetism", accepted: ["magnetism"], explanation: "Magnetism is the force of attraction or repulsion produced by a magnet." },
  { before: "The region around a magnet where its magnetic force can be detected is called a magnetic ", after: ".", correctAnswer: "field", accepted: ["field"], explanation: "A magnetic field is the region around a magnet where its magnetic force can be detected." },
  { before: "The two ends of a magnet, where its force is strongest, are called its ", after: ".", correctAnswer: "poles", accepted: ["poles"], explanation: "A magnet's poles are its two ends, where its magnetic force is strongest." },
  { before: "A tiny region inside a magnetic material where atoms are aligned in the same direction is called a magnetic ", after: ".", correctAnswer: "domain", accepted: ["domain"], explanation: "A magnetic domain is a tiny region inside a magnetic material where atoms are aligned in the same direction." },
  { before: "Removing a material's magnetism, such as by heating or hammering it, is called ", after: " it.", correctAnswer: "demagnetising", accepted: ["demagnetising", "demagnetizing"], explanation: "Demagnetising removes a material's magnetism, which can happen through strong heating or hammering." },
  { before: "A temporary magnet created using an electric current flowing through a coiled wire is called an ", after: ".", correctAnswer: "electromagnet", accepted: ["electromagnet"], explanation: "An electromagnet is a temporary magnet created using an electric current flowing through a coiled wire." },
] as const;

export const magnetism: Skill = {
  id: "g7-sci-fe-magnetism",
  code: "FE.2",
  subjectId: "science",
  strandId: "g7-sci-fe",
  grade: 7,
  title: "Magnetism",
  description: "Properties of magnets, sorting materials as magnetic or non-magnetic, and everyday uses and applications of magnets.",
  generate(rng) {
    const branch = randChoice(rng, ["predict-interaction", "material-sort", "use-match", "law-knowledge", "fill-blank", "magnetise-order"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about magnetism.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe magnets, their fields, and how they work.",
        explanation: fb.explanation,
      };
    }

    if (branch === "magnetise-order") {
      const items = shuffle(rng, MAGNETISE_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for magnetising an iron nail by stroking it with a magnet, in order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: MAGNETISE_STEPS.map((s) => s.id),
        hint: "The nail must be positioned before stroking, and stroking must be repeated before testing the result.",
        explanation: MAGNETISE_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "predict-interaction") {
      const orientation = randChoice(rng, ["attract", "repel"] as const);
      const correct = orientation === "attract" ? "The magnets pull towards each other (attract)." : "The magnets push apart (repel).";
      const choices = shuffle(rng, ["The magnets pull towards each other (attract).", "The magnets push apart (repel).", "Nothing happens between them."]);
      const correctIndex = choices.indexOf(correct);
      return {
        kind: "multiple-choice",
        prompt: "Two bar magnets are brought close together as shown. What will happen?",
        visual: { type: "magnet", orientation },
        choices,
        correctIndex,
        layout: "list",
        hint: "Look at which poles are facing each other — are they the same or different?",
        explanation:
          orientation === "attract"
            ? "The facing poles are unlike (one N, one S). Unlike poles attract, so the magnets pull towards each other."
            : "The facing poles are alike (both N). Like poles repel, so the magnets push apart.",
      };
    }

    if (branch === "material-sort") {
      const chosen = shuffle(rng, MATERIALS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `m${i}`, label: c.name }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`m${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each material as magnetic or non-magnetic.",
        items,
        buckets: [
          { id: "magnetic", label: "Magnetic" },
          { id: "non-magnetic", label: "Non-magnetic" },
        ],
        correctBucket,
        hint: "Magnetic materials are attracted to a magnet — mainly iron, steel, cobalt and nickel.",
        explanation: chosen.map((c) => `${c.name} is ${c.type}.`).join(" "),
      };
    }

    if (branch === "use-match") {
      const chosen = shuffle(rng, USES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((u, i) => ({ id: `u${i}`, label: u.use })));
      const targets = shuffle(rng, chosen.map((u, i) => ({ id: `u${i}`, label: u.application })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((u, i) => (correctMap[`u${i}`] = `u${i}`));
      return {
        kind: "click-match",
        prompt: "Match each everyday use of a magnet to how it works.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what job a magnet is doing in each device.",
        explanation: chosen.map((u) => `${u.use}: ${u.application}`).join(" "),
      };
    }

    const q = randChoice(rng, LAW_TEMPLATES)(rng);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      layout: "list",
      hint: "Remember: like poles repel, unlike poles attract, and every magnet has both a north and a south pole.",
      explanation: q.explanation,
    };
  },
};
