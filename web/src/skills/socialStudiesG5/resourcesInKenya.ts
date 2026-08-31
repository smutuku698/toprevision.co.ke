import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Resources in Kenya" — 5 named resources
// (land, minerals, water, wildlife, forests). See curriculum-reference/grade-5/social-studies.json.

const RESOURCES: { id: string; resource: string; use: string; sustainablePractice: string }[] = [
  { id: "land", resource: "land", use: "farming, settlement and grazing", sustainablePractice: "avoid overgrazing and rotate crops to keep the soil healthy" },
  { id: "minerals", resource: "minerals", use: "building materials, industry and export income", sustainablePractice: "regulate mining so it does not damage the environment" },
  { id: "water", resource: "water", use: "drinking, farming/irrigation, hydroelectric power and fishing", sustainablePractice: "avoid polluting rivers and lakes, and conserve water" },
  { id: "wildlife", resource: "wildlife", use: "tourism income and keeping ecological balance", sustainablePractice: "avoid poaching and protect animal habitats" },
  { id: "forests", resource: "forests", use: "timber, rainfall/water catchment, charcoal/firewood and biodiversity", sustainablePractice: "replant trees after harvesting and avoid unnecessary logging" },
];

const SUSTAINABLE_ACTIONS = [
  "planting new trees after cutting some down",
  "recycling and reducing waste",
  "using water carefully and avoiding waste",
  "reporting illegal poaching to authorities",
  "farming without exhausting the soil",
  "protecting water sources from pollution",
] as const;

const HARMFUL_ACTIONS = [
  "cutting down forests without replanting",
  "polluting rivers with waste",
  "poaching wild animals",
  "overgrazing land until it becomes bare",
  "mining without any regulation or care",
  "wasting water carelessly",
] as const;

export const resourcesInKenya: Skill = {
  id: "g5-ss-res-resources-in-kenya",
  code: "R.1",
  subjectId: "social-studies",
  strandId: "g5-ss-resources",
  grade: 5,
  title: "Resources in Kenya",
  description: "Identifying Kenya's resources (land, minerals, water, wildlife, forests) and using them prudently and sustainably.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const r = randChoice(rng, RESOURCES);
      const choices = shuffle(rng, RESOURCES.map((x) => x.resource));
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "resource")} It is used for ${r.use}.`,
        choices,
        correctIndex: choices.indexOf(r.resource),
        hint: `Think about what ${r.use} depends on.`,
        explanation: `${r.resource.charAt(0).toUpperCase() + r.resource.slice(1)} is used for ${r.use}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, RESOURCES).slice(0, 4);
      const tokens = chosen.map((r) => ({ id: r.id, label: r.resource.charAt(0).toUpperCase() + r.resource.slice(1) }));
      const targets = shuffle(rng, chosen).map((r) => ({ id: r.id, label: r.sustainablePractice.charAt(0).toUpperCase() + r.sustainablePractice.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.id] = r.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "resource to a way it should be used sustainably"),
        tokens,
        targets,
        correctMap,
        hint: "Think about how to protect and conserve each resource.",
        explanation: chosen.map((r) => `${r.resource}: ${r.sustainablePractice}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const good = shuffle(rng, [...SUSTAINABLE_ACTIONS]).slice(0, 4).map((a, i) => ({ id: `g${i}`, label: a, bucket: "SUSTAINABLE" }));
      const bad = shuffle(rng, [...HARMFUL_ACTIONS]).slice(0, 4).map((a, i) => ({ id: `b${i}`, label: a, bucket: "HARMFUL" }));
      const items = shuffle(rng, [...good, ...bad]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether the action is sustainable or harmful to resources"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "SUSTAINABLE", label: "Sustainable Use" },
          { id: "HARMFUL", label: "Harmful/Wasteful Use" },
        ],
        correctBucket,
        hint: "Sustainable actions protect resources for the future; harmful actions damage or waste them.",
        explanation: "Actions that protect and conserve resources are sustainable; actions that damage or waste resources are harmful.",
      };
    }

    if (branch === "fill-blank") {
      const r = randChoice(rng, RESOURCES);
      const templates = [
        () => ({ before: `${r.resource.charAt(0).toUpperCase() + r.resource.slice(1)} is a resource used for`, after: ".", correct: r.use }),
        () => ({ before: "Using resources carefully, without wasting them, is called using them", after: ".", correct: "prudently" }),
        () => ({ before: "Replanting trees after cutting some down helps make forest use", after: ".", correct: "sustainable" }),
        () => ({ before: "Kenya's 5 main resources include land, minerals, water, wildlife and", after: ".", correct: "forests" }),
        () => ({ before: "Avoiding pollution helps protect the resource of", after: ".", correct: "water" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the 5 resources and how to use each one sustainably.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "site", label: "Choose a suitable site for planting" },
      { id: "plant", label: "Plant the tree seedlings" },
      { id: "water", label: "Water and care for the seedlings" },
      { id: "protect", label: "Protect the young trees as they grow" },
    ]);
    const correctOrder = ["site", "plant", "water", "protect"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps of sustainably using the forest resource by planting trees"),
      instruction: "Arrange the steps in the order they would happen.",
      items: steps,
      correctOrder,
      hint: "It starts with choosing a site and ends with protecting the growing trees.",
      explanation: "To use forests sustainably: choose a site, plant seedlings, water and care for them, then protect them as they grow.",
    };
  },
};
