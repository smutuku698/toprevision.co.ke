import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the coil technique in pottery?",
    correct: "Rolling clay into long ropes and stacking or winding them to build up the walls of a vessel",
    distractors: ["Pouring liquid clay into a mould", "Carving a vessel from a solid block of clay", "Spinning clay on a wheel without adding coils"],
  },
  {
    q: "Why is clay the preferred material for pottery?",
    correct: "It is plastic (easy to shape) when wet and becomes hard and durable once fired",
    distractors: ["It is the cheapest material available everywhere", "It cannot hold water once fired", "It never needs to be dried or fired"],
  },
  {
    q: "What is a frame loom used for?",
    correct: "Holding the warp threads in place so a weaver can interlace them into fabric",
    distractors: ["Firing pottery vessels", "Mixing paint colours", "Cutting wooden sculptures"],
  },
  {
    q: "In 2/1 twill weaving, what does the pattern involve?",
    correct: "The weft thread passes over two warp threads, then under one, creating a diagonal pattern",
    distractors: ["Every thread is knotted individually by hand", "The weft passes over one and under one thread only", "No warp threads are used at all"],
  },
  {
    q: "How is a fabric woven on a frame loom?",
    correct: "By interlacing weft threads over and under the fixed warp threads held on the frame",
    distractors: ["By melting fibres together with heat", "By painting threads onto a canvas", "By gluing pre-made strips of cloth together"],
  },
  {
    q: "What should be considered when critiquing a woven article?",
    correct: "The evenness of the weave, pattern accuracy, and overall finish",
    distractors: ["Only the price of the materials used", "Whether it was made quickly", "The weaver's height"],
  },
  {
    q: "Which best describes making pottery using the coil method?",
    correct: "Building a vessel gradually by adding and smoothing coils of clay on top of each other",
    distractors: ["Casting the vessel in a single pour", "3D printing the vessel from a digital design", "Weaving clay fibres together"],
  },
];

const TOPICS: { label: string; bucket: "Pottery" | "Weaving" }[] = [
  { label: "Rolling clay into long ropes and stacking them to build a vessel", bucket: "Pottery" },
  { label: "Clay is plastic when wet and hardens once fired", bucket: "Pottery" },
  { label: "Building a vessel gradually by smoothing coils on top of each other", bucket: "Pottery" },
  { label: "A frame loom holds the warp threads in place", bucket: "Weaving" },
  { label: "The weft passes over two warp threads, then under one, in 2/1 twill", bucket: "Weaving" },
  { label: "Interlacing weft threads over and under the fixed warp threads", bucket: "Weaving" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each description into Pottery or Weaving.",
  "Which craft does each description below belong to? Sort them.",
  "Classify each description as Pottery or Weaving.",
  "Decide whether each statement is about pottery or weaving, and sort it.",
  "Sort these statements by the craft they describe.",
] as const;

export const indigenousCrafts: Skill = {
  id: "cas-indigenous-crafts",
  code: "C.10",
  subjectId: "creative-arts-sports",
  strandId: "cas-creating-performing",
  grade: 9,
  title: "Indigenous Kenyan Crafts",
  description: "Pottery coil technique and frame-loom weaving, including 2/1 twill technique.",
  generate(rng) {
    const hint = "Coil pottery is built up from rolled clay ropes; twill weaving is defined by how the weft crosses the warp.";

    if (rng() < 0.5) {
      const chosen = shuffle(rng, TOPICS);
      const items = chosen.map((t, i) => ({ id: `t${i}`, label: t.label, bucket: t.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Pottery", label: "Pottery" },
          { id: "Weaving", label: "Weaving" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((t) => `"${t.label}" belongs to ${t.bucket}.`).join(" "),
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
