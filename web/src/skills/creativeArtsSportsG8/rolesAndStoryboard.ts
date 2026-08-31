import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ROLES = [
  { label: "Identifying and nurturing talent in the young", bucket: "social", reason: "This is a social role — Creative Arts and Sports gives young people a structured way to discover and grow their talents." },
  { label: "Providing entertainment and recreation", bucket: "social", reason: "This is a social role — performances and games give communities enjoyment and a break from daily work." },
  { label: "Promoting national cohesion and unity", bucket: "social", reason: "This is a social role — shared music, sport, and art bring people from different communities together." },
  { label: "Offering therapy and emotional release", bucket: "social", reason: "This is a social role — creating or performing art and playing sport can relieve stress and support mental wellbeing." },
  { label: "Generating income and employment", bucket: "economic", reason: "This is an economic role — artists, athletes, coaches, and craftspeople earn a living from Creative Arts and Sports." },
  { label: "Attracting tourism and foreign exchange", bucket: "economic", reason: "This is an economic role — cultural performances, sporting events, and craft sales draw visitors and their spending." },
  { label: "Preserving cultural identity and heritage", bucket: "cultural", reason: "This is a cultural role — traditional dances, crafts, and songs keep a community's history and values alive." },
  { label: "Educating and socialising members of society", bucket: "cultural", reason: "This is a cultural/social role — stories, verse, and games pass on knowledge and expected behaviour to the next generation." },
] as const;

const BUCKET_LABEL: Record<string, string> = { social: "Social role", economic: "Economic role", cultural: "Cultural role" };

const STORYBOARD_TERMS = [
  { id: "storyboard", label: "Storyboard", meaning: "A sequence of panels that plans out the scenes of a visual story before it is created" },
  { id: "thumbnail", label: "Thumbnail sketch", meaning: "A small, quick, rough sketch used to plan a scene before drawing it in full" },
  { id: "panel", label: "Panel", meaning: "A single frame in a storyboard, showing one moment or scene" },
  { id: "splattering", label: "Splattering", meaning: "A background technique made by flicking or dripping paint to create a textured effect" },
  { id: "wash", label: "Wash", meaning: "A background technique made by applying diluted paint in a thin, even layer" },
];

const STORYBOARD_STEPS = [
  { id: "identify", label: "Identify the story or message to communicate" },
  { id: "thumbnails", label: "Sketch thumbnail panels showing the sequence of scenes" },
  { id: "arrange", label: "Arrange the panels in logical order" },
  { id: "background", label: "Paint each background using a technique such as wash or splattering" },
  { id: "captions", label: "Add captions or dialogue to each panel" },
  { id: "review", label: "Review and finalise the storyboard" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each role of Creative Arts and Sports in society into the correct category.",
  "Which category does each role below belong to? Sort them.",
  "Classify each role into its correct category.",
  "Decide which category each role fits, and sort it.",
  "Sort these roles by the category they belong to.",
] as const;

const ROLES_MC_PROMPTS = [
  '"{role}" is an example of which type of role played by Creative Arts and Sports in society?',
  'Which type of role does "{role}" represent in society?',
  'Classify "{role}" as which type of role played by Creative Arts and Sports?',
  'Which category best fits "{role}"?',
  'Identify which type of role "{role}" is an example of.',
] as const;

const MATCH_PROMPTS = [
  "Match each storyboard/painting term to its correct meaning.",
  "Pair each term below with its correct meaning.",
  "Match each term to what it describes.",
  "Connect each term to its correct meaning.",
  "For each term below, choose its matching meaning.",
] as const;

const ORDER_PROMPTS = [
  "Arrange the correct order for making a storyboard that highlights a role of Creative Arts and Sports in society.",
  "Put these storyboard-making steps in the order they occur.",
  "Order these storyboard steps, from first to last.",
  "Sort these steps into the correct sequence for making a storyboard.",
  "Place these storyboard steps in the order you would follow them.",
] as const;

export const rolesAndStoryboard: Skill = {
  id: "g8-cas-roles-storyboard",
  code: "F.1",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-foundations",
  grade: 8,
  title: "Roles of Creative Arts and Sports",
  description: "Social, economic, and cultural roles of Creative Arts and Sports, plus storyboard planning and background-painting techniques.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "roles-mc", "terms-match", "steps-order"] as const);

    if (branch === "categorize") {
      const socialPicks = shuffle(rng, ROLES.filter((r) => r.bucket === "social")).slice(0, 2);
      const economicPicks = shuffle(rng, ROLES.filter((r) => r.bucket === "economic")).slice(0, 2);
      const culturalPicks = shuffle(rng, ROLES.filter((r) => r.bucket === "cultural")).slice(0, 2);
      const items = shuffle(rng, [...socialPicks, ...economicPicks, ...culturalPicks]);
      const correctBucket: Record<string, string> = {};
      for (const r of items) correctBucket[r.label] = r.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((r) => ({ id: r.label, label: r.label })),
        buckets: [
          { id: "social", label: "Social role" },
          { id: "economic", label: "Economic role" },
          { id: "cultural", label: "Cultural role" },
        ],
        correctBucket,
        hint: "Social roles affect how people feel and relate; economic roles affect income; cultural roles preserve identity and heritage.",
        explanation: items.map((r) => r.reason).join(" "),
      };
    }

    if (branch === "roles-mc") {
      const entry = randChoice(rng, ROLES);
      const distractors = ROLES.filter((r) => r.bucket !== entry.bucket).map((r) => BUCKET_LABEL[r.bucket]);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, BUCKET_LABEL[entry.bucket], Array.from(new Set(distractors)), 2);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, ROLES_MC_PROMPTS).replace(/\{role\}/g, entry.label),
        choices,
        correctIndex,
        layout: "list",
        hint: "Ask whether it mainly affects people's feelings and relationships, their income, or their cultural identity.",
        explanation: entry.reason,
      };
    }

    if (branch === "terms-match") {
      const chosen = shuffle(rng, STORYBOARD_TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "A storyboard is made of panels; wash and splattering are two different ways to paint a background.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    // steps-order
    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDER_PROMPTS),
      instruction: "Click the steps in order, from first to last.",
      items: shuffle(rng, STORYBOARD_STEPS),
      correctOrder: STORYBOARD_STEPS.map((s) => s.id),
      hint: "Planning (the story and thumbnails) always comes before painting backgrounds and adding captions.",
      explanation: `The order is: ${STORYBOARD_STEPS.map((s) => s.label).join(" → ")}.`,
    };
  },
};
