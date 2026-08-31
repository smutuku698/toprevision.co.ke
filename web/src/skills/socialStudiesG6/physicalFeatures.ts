import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

type FeatureType = "volcanic mountain" | "block mountain" | "rift valley" | "lake" | "plain";

interface Feature {
  name: string;
  type: FeatureType;
  formation: string;
}

const FEATURES: readonly Feature[] = [
  { name: "Mount Kenya", type: "volcanic mountain", formation: "built up by repeated eruptions of magma that cooled and hardened into layers" },
  { name: "Mount Kilimanjaro", type: "volcanic mountain", formation: "built up by repeated eruptions of magma that cooled and hardened into layers" },
  { name: "Mount Elgon", type: "volcanic mountain", formation: "built up by repeated eruptions of magma that cooled and hardened into layers" },
  { name: "the Ruwenzori Mountains", type: "block mountain", formation: "formed when a large block of the earth's crust was pushed upward between two faults" },
  { name: "the Great Rift Valley", type: "rift valley", formation: "formed when the earth's crust stretched and cracked, causing a strip of land to sink between two parallel faults" },
  { name: "Lake Victoria", type: "lake", formation: "formed in a shallow basin between the eastern and western branches of the rift valley, not inside the rift floor itself" },
  { name: "Lake Turkana", type: "lake", formation: "formed on the floor of the rift valley, where sunken land filled with water" },
  { name: "Lake Tanganyika", type: "lake", formation: "formed on the floor of the rift valley and is one of the deepest lakes in the world" },
  { name: "the Athi-Kapiti plains", type: "plain", formation: "formed from flat, gently sloping land with very little relief" },
  { name: "the coastal plains", type: "plain", formation: "formed from flat, low-lying land near the Indian Ocean coastline" },
] as const;

const TYPES: readonly FeatureType[] = ["volcanic mountain", "block mountain", "rift valley", "lake", "plain"];
const BUCKET_LABEL: Record<FeatureType, string> = {
  "volcanic mountain": "Volcanic mountain",
  "block mountain": "Block (bloc) mountain",
  "rift valley": "Rift valley",
  lake: "Lake",
  plain: "Plain",
};

function formationMc(rng: () => number): ScenarioMC {
  const target = randChoice(rng, FEATURES);
  // Distractors must come from distinct formation stories, not distinct feature names — several FEATURES
  // entries share identical formation text (e.g. three volcanic mountains), so dedupe by formation text.
  const otherFormations = Array.from(new Set(FEATURES.filter((f) => f.formation !== target.formation).map((f) => f.formation)));
  const others = shuffle(rng, otherFormations).slice(0, 3);
  const place = g6SsPlace(rng);
  const prompts = [
    `A learner in ${place} is asked how ${target.name} formed. Which explanation is correct?`,
    `How was ${target.name} formed?`,
    `Which statement correctly describes the formation of ${target.name}?`,
  ];
  return {
    prompt: randChoice(rng, prompts),
    correct: target.formation.charAt(0).toUpperCase() + target.formation.slice(1),
    wrong: others.map((f) => f.charAt(0).toUpperCase() + f.slice(1)),
    explanation: `${target.name} is ${target.type === "lake" ? "a lake" : `a ${target.type}`} — it ${target.formation}.`,
  };
}

function typeMc(rng: () => number): ScenarioMC {
  const target = randChoice(rng, FEATURES);
  const wrongTypes = shuffle(rng, TYPES.filter((t) => t !== target.type)).slice(0, 3);
  return {
    prompt: `What type of physical feature is ${target.name}?`,
    correct: BUCKET_LABEL[target.type],
    wrong: wrongTypes.map((t) => BUCKET_LABEL[t]),
    explanation: `${target.name} is classified as ${target.type === "rift valley" ? "a" : target.type === "lake" || target.type === "plain" ? "a" : "a"} ${target.type}.`,
  };
}

export const physicalFeatures: Skill = {
  id: "g6-ss-env-physical-features",
  code: "E.2",
  subjectId: "social-studies",
  strandId: "g6-ss-environments",
  grade: 6,
  title: "Main physical features in Eastern Africa",
  description: "Identifying and explaining the formation of mountains, rift valleys, lakes, and plains in Eastern Africa.",
  generate(rng) {
    const branch = randChoice(rng, ["formation-mc", "type-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "formation-mc" || branch === "type-mc") {
      const q = branch === "formation-mc" ? formationMc(rng) : typeMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about whether the feature was built up by lava, pushed up between faults, sunk between faults, or is naturally flat.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "Mount Kenya and Mount Kilimanjaro are both examples of", after: "mountains, built up from cooled lava.", correct: "volcanic" }),
        () => ({ before: "The Ruwenzori Mountains are an example of a", after: "mountain, pushed up between two faults.", correct: "block" }),
        () => ({ before: "The Great Rift Valley formed when the earth's crust stretched, cracked, and a strip of land", after: "between two parallel faults.", correct: "sank" }),
        () => ({ before: `${name} learns that Lake Tanganyika lies on the floor of the`, after: ", making it one of the deepest lakes in the world.", correct: "rift valley" }),
        () => ({ before: "Flat, gently sloping land with very little relief, such as the Athi-Kapiti area, is called a", after: ".", correct: "plain" }),
        () => ({ before: "Lake Victoria formed in a basin between the eastern and western branches of the", after: ", not on the rift floor itself.", correct: "rift valley" }),
        () => ({ before: "A mountain built up over time by repeated volcanic eruptions is called a", after: "mountain.", correct: "volcanic" }),
        () => ({ before: "Land that has been pushed upward as a single block between two parallel faults forms a", after: "mountain.", correct: "block" }),
        () => ({ before: "The coastal plains near the Indian Ocean are an example of a physical feature called a", after: ".", correct: "plain" }),
        () => ({ before: "A long, narrow depression formed by sinking land between two faults is called a", after: ".", correct: "rift valley" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about physical features in Eastern Africa.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall how each type of feature is built up or worn down.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...FEATURES]).slice(0, 6);
      const tokens = chosen.map((f, i) => ({ id: `f${i}`, label: f.name }));
      const targets = shuffle(rng, chosen).map((f) => ({ id: `f${chosen.indexOf(f)}`, label: BUCKET_LABEL[f.type] }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`f${i}`] = `f${i}`));
      return {
        kind: "click-match",
        prompt: "Match each named physical feature to its type.",
        tokens,
        targets,
        correctMap,
        hint: "Recall whether the feature is a mountain, valley, lake, or plain.",
        explanation: chosen.map((f) => `${f.name} is a ${f.type}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...FEATURES]).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `it${i}`, label: f.name }));
      const bucketTypes = Array.from(new Set(chosen.map((f) => f.type)));
      const buckets = bucketTypes.map((t) => ({ id: t, label: BUCKET_LABEL[t] }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`it${i}`] = f.type));
      return {
        kind: "categorize",
        prompt: "Sort each physical feature by its type.",
        items,
        buckets,
        correctBucket,
        hint: "Group mountains, valleys, lakes, and plains separately.",
        explanation: chosen.map((f) => `${f.name} is a ${f.type}.`).join(" "),
      };
    }

    // ordering — the genuine step sequence of rift-valley formation, condensed from the source's own
    // description of stretching -> cracking -> sinking -> valley floor.
    const steps = [
      { id: "s1", label: "The earth's crust is stretched by forces deep underground" },
      { id: "s2", label: "The stretched crust cracks, forming two parallel faults" },
      { id: "s3", label: "The strip of land between the faults sinks downward" },
      { id: "s4", label: "A long, flat-floored valley forms between the raised edges" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these steps in the correct order to show how a rift valley, such as the Great Rift Valley, forms.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      instruction: "Earliest step first.",
      hint: "Stretching happens before cracking, and cracking happens before the land sinks.",
      explanation: "A rift valley forms when the crust stretches, cracks into two parallel faults, and the land between the faults sinks to form a valley floor.",
    };
  },
};
