import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the correct body position for a standing dive?",
    correct: "Body bent forward at the hips, arms extended overhead, knees slightly bent, ready to spring into the water",
    distractors: ["Sitting on the edge with legs dangling", "Standing straight upright with arms at the sides", "Lying flat on the back before jumping"],
  },
  {
    q: "In the butterfly stroke, what is a key feature of the body position?",
    correct: "An undulating, wave-like motion of the body and hips, with both arms moving together",
    distractors: ["The arms move in a strict alternating pattern like front crawl", "The body remains completely rigid and straight throughout", "The swimmer floats on their back the entire time"],
  },
  {
    q: "Why is synchrony important in the butterfly stroke?",
    correct: "Coordinated arm, leg, and body movement makes the stroke efficient and prevents wasted energy",
    distractors: ["It has no effect on swimming speed or effort", "It is only important for judges, not the swimmer", "It only matters for backstroke, not butterfly"],
  },
  {
    q: "Which of these is an important water safety principle?",
    correct: "Never swim alone; swim where a lifeguard or trained supervisor is present",
    distractors: ["Always swim immediately after eating a large meal", "Dive into unfamiliar water without checking its depth first", "Ignore weather conditions before swimming"],
  },
  {
    q: "How can swimming skills be performed safely?",
    correct: "By warming up first, knowing one's swimming ability, and following pool or water safety rules",
    distractors: ["By swimming as far as possible without resting", "By avoiding all supervision", "By diving in headfirst regardless of water depth"],
  },
  {
    q: "Why is a standing dive normally only performed into water of a checked, safe depth?",
    correct: "Diving into shallow or unknown-depth water risks serious head or neck injury",
    distractors: ["It has no safety risk at any depth", "Depth only matters for the butterfly stroke, not diving", "Standing dives are never performed into pools"],
  },
  {
    q: "What does it mean to appreciate swimming as a life skill?",
    correct: "Recognising that swimming can help keep a person safe in and around water throughout life",
    distractors: ["Believing swimming is only useful for competition", "Thinking swimming has no real-world use", "Believing only professional athletes need to swim"],
  },
];

const TOPICS: { label: string; bucket: "Standing Dive" | "Butterfly Stroke" | "Water Safety" }[] = [
  { label: "Body bent forward at the hips, arms extended overhead", bucket: "Standing Dive" },
  { label: "Only performed into water of a checked, safe depth", bucket: "Standing Dive" },
  { label: "An undulating, wave-like motion of the body and hips", bucket: "Butterfly Stroke" },
  { label: "Both arms move together, not in an alternating pattern", bucket: "Butterfly Stroke" },
  { label: "Never swim alone; swim where a supervisor is present", bucket: "Water Safety" },
  { label: "Warm up first and know your own swimming ability", bucket: "Water Safety" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each description into Standing Dive, Butterfly Stroke, or Water Safety.",
  "Which topic does each description below belong to? Sort them.",
  "Classify each description as Standing Dive, Butterfly Stroke, or Water Safety.",
  "Decide which topic each statement fits, and sort it.",
  "Sort these statements by the swimming topic they describe.",
] as const;

export const swimming: Skill = {
  id: "cas-swimming",
  code: "C.11",
  subjectId: "creative-arts-sports",
  strandId: "cas-creating-performing",
  grade: 9,
  title: "Swimming",
  description: "Body position for the standing dive and butterfly stroke, and swimming safety.",
  generate(rng) {
    const hint = "Good body position and safety awareness matter for both the standing dive and the butterfly stroke.";

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
          { id: "Standing Dive", label: "Standing Dive" },
          { id: "Butterfly Stroke", label: "Butterfly Stroke" },
          { id: "Water Safety", label: "Water Safety" },
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
