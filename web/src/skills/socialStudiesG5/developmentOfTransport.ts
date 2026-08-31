import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Development of Transport" — 4 named early
// means (human porterage, pack animals, logging/log and boats, rafts). See
// curriculum-reference/grade-5/social-studies.json.

const EARLY_MEANS = [
  "human porterage", "pack animals", "logging/log and boats", "rafts",
] as const;

const MODERN_MEANS: { id: string; means: string; category: "ROAD" | "RAIL" | "AIR" | "WATER" }[] = [
  { id: "car", means: "cars and buses", category: "ROAD" },
  { id: "motorcycle", means: "motorcycles", category: "ROAD" },
  { id: "train", means: "trains (e.g. the Standard Gauge Railway)", category: "RAIL" },
  { id: "aeroplane", means: "aeroplanes", category: "AIR" },
  { id: "ship", means: "ships", category: "WATER" },
  { id: "ferry", means: "ferries (e.g. the Likoni ferry)", category: "WATER" },
];

const SAFE_PRACTICES = [
  "walking instead of running when crossing a road",
  "walking on a line or single file near traffic",
  "using a pedestrian crossing",
  "looking both ways before crossing",
  "obeying traffic signs and lights",
  "wearing a seatbelt in a vehicle",
] as const;

const UNSAFE_PRACTICES = [
  "running across a busy road",
  "crossing without looking both ways",
  "ignoring traffic lights",
  "playing near a busy road",
  "crossing where there is no pedestrian crossing",
  "hanging out of a moving vehicle",
] as const;

export const developmentOfTransport: Skill = {
  id: "g5-ss-res-development-of-transport",
  code: "R.5",
  subjectId: "social-studies",
  strandId: "g5-ss-resources",
  grade: 5,
  title: "Development of Transport",
  description: "Comparing early and modern means of transport, and applying road safety precautions.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const wantEarly = randChoice(rng, [true, false]);
      const label = wantEarly ? randChoice(rng, EARLY_MEANS) : randChoice(rng, MODERN_MEANS).means;
      const choices = shuffle(rng, ["An early means of transport", "A modern means of transport"]);
      const correct = wantEarly ? "An early means of transport" : "A modern means of transport";
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "kind of transport this is")} "${label}".`,
        choices,
        correctIndex: choices.indexOf(correct),
        hint: "Early means relied on people, animals, or simple boats/rafts; modern means use engines/technology.",
        explanation: `"${label}" is ${correct.toLowerCase()}.`,
      };
    }

    if (branch === "click-match") {
      // One item per category, so the (category-based) target labels are always unique.
      const categories: Array<"ROAD" | "RAIL" | "AIR" | "WATER"> = ["ROAD", "RAIL", "AIR", "WATER"];
      const chosen = categories.map((cat) => randChoice(rng, MODERN_MEANS.filter((m) => m.category === cat)));
      const tokens = chosen.map((m) => ({ id: m.id, label: m.means }));
      const categoryLabel: Record<string, string> = { ROAD: "Travels by road", RAIL: "Travels by rail", AIR: "Travels by air", WATER: "Travels by water" };
      const targets = shuffle(rng, chosen).map((m) => ({ id: m.id, label: categoryLabel[m.category] }));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "modern means of transport to how it travels"),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether it travels by road, rail, air or water.",
        explanation: chosen.map((m) => `${m.means} ${categoryLabel[m.category].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const safe = shuffle(rng, [...SAFE_PRACTICES]).slice(0, 4).map((p, i) => ({ id: `s${i}`, label: p, bucket: "SAFE" }));
      const unsafe = shuffle(rng, [...UNSAFE_PRACTICES]).slice(0, 4).map((p, i) => ({ id: `u${i}`, label: p, bucket: "UNSAFE" }));
      const items = shuffle(rng, [...safe, ...unsafe]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether the road behaviour is safe or unsafe"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "SAFE", label: "Safe Practice" },
          { id: "UNSAFE", label: "Unsafe Practice" },
        ],
        correctBucket,
        hint: "Safe practices follow traffic rules and pay attention; unsafe practices ignore them.",
        explanation: "Practices that follow traffic rules and stay alert are safe; ignoring rules or being careless is unsafe.",
      };
    }

    if (branch === "fill-blank") {
      const templates = [
        () => ({ before: "Before mechanised transport, goods were often carried by people, a method called human", after: ".", correct: "porterage" }),
        () => ({ before: "Animals used to carry loads in early transport were called", after: ".", correct: "pack animals" }),
        () => ({ before: "When crossing a road, you should walk instead of", after: ".", correct: "running" }),
        () => ({ before: "Before crossing a road, you should look both", after: ".", correct: "ways" }),
        () => ({ before: "A modern train service in Kenya is the Standard Gauge", after: ".", correct: "Railway" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall early means of transport and road safety practices.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "stop", label: "Stop at the edge of the road" },
      { id: "look", label: "Look both ways" },
      { id: "listen", label: "Listen for approaching traffic" },
      { id: "cross", label: "Cross when it is safe, walking not running" },
    ]);
    const correctOrder = ["stop", "look", "listen", "cross"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps of safely crossing a road"),
      instruction: "Arrange the steps in the correct order.",
      items: steps,
      correctOrder,
      hint: "Start by stopping at the edge and finish by crossing safely.",
      explanation: "To cross safely: stop at the edge, look both ways, listen for traffic, then cross when safe, walking not running.",
    };
  },
};
