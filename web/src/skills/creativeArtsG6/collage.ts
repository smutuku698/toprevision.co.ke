import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, sub-strand 1.2 "Painting and Collage" — the collage half.
// The painting half of this same sub-strand ships separately as paintingTechniques.ts (C.3), per
// curriculum-reference/grade-6/creative-arts.json's split note. Source content: explore collage
// characteristics (multi/mixed media, texture); collect/prepare materials focusing on texture and
// type of materials, adhesives, and support; collaboratively make a collage with theme "football"
// applying those characteristics. No new dedicated VisualSpec was built for mixed-media collage
// (it does not reduce well to a clean parametric SVG) — this skill goes visual-free and leans on
// content variety across multiple-choice/fill-blank/ordering/categorize/click-match instead.

const MATERIALS = [
  { label: "Torn strips of coloured newspaper", quality: "rough/textured paper" },
  { label: "Smooth foil sweet wrappers", quality: "smooth/shiny material" },
  { label: "Dried leaves", quality: "rough/textured natural material" },
  { label: "Cut fabric scraps with a woven weave", quality: "rough/textured fabric" },
  { label: "Flattened bottle tops", quality: "smooth/shiny material" },
  { label: "Cotton wool tufts", quality: "soft/fluffy material" },
  { label: "Sandpaper offcuts", quality: "rough/gritty material" },
  { label: "Glossy magazine cut-outs", quality: "smooth/shiny material" },
  { label: "Corrugated cardboard strips", quality: "rough/ridged material" },
  { label: "Woolen yarn pieces", quality: "soft/fluffy material" },
  { label: "String or twine offcuts", quality: "rough/textured fibre" },
  { label: "Crushed eggshell fragments", quality: "rough/gritty material" },
] as const;

const TERMS: { id: string; label: string; meaning: string; blank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] } }[] = [
  {
    id: "collage",
    label: "Collage",
    meaning: "A picture made by gluing different materials, such as paper, fabric, or found objects, onto a support surface",
    blank: { before: "A picture made by gluing different materials onto a surface is called a ", after: ".", correctAnswer: "collage" },
  },
  {
    id: "mixed-media",
    label: "Multi/mixed media",
    meaning: "Combining more than one type of material — such as paper, fabric, and found objects — in one artwork",
    blank: { before: "Combining more than one type of material in one artwork is called using ", after: " media.", correctAnswer: "mixed", acceptedAnswers: ["mixed", "multi", "multi/mixed"] },
  },
  {
    id: "texture",
    label: "Texture",
    meaning: "The surface quality a material has or suggests, such as rough, smooth, or soft",
    blank: { before: "The surface quality a material has, such as rough or smooth, is called its ", after: ".", correctAnswer: "texture" },
  },
  {
    id: "adhesive",
    label: "Adhesive",
    meaning: "The substance, such as glue, used to stick collage materials onto the support",
    blank: { before: "The substance used to stick collage materials onto the support, such as glue, is called the ", after: ".", correctAnswer: "adhesive" },
  },
  {
    id: "support",
    label: "Support",
    meaning: "The base surface, such as cardboard or card, that collage materials are attached to",
    blank: { before: "The base surface that collage materials are glued onto, such as cardboard, is called the ", after: ".", correctAnswer: "support" },
  },
];

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s group in ${place(rng)} collects only glossy magazine paper for a football-themed collage. What characteristic of collage is missing from their material choice?`,
      correct: "Mixed media — using more than one type of material, not just one",
      wrong: [
        "Adhesive — one type of paper can still be glued down with adhesive",
        "Support — the support surface is unrelated to how many material types are collected",
        "Theme — glossy paper can still show a football theme",
      ],
      explanation: "A true collage combines more than one type of material — mixed media — so relying on a single material type (glossy paper only) misses this defining characteristic.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s group in ${place(rng)} wants their football-themed collage to feel rough where the pitch grass is shown, and smooth and shiny where a trophy is shown. Which characteristic are they focusing on?`,
    correct: "Texture — choosing materials with different surface qualities for different parts of the picture",
    wrong: [
      "Adhesive — the type of glue used does not create a rough or smooth appearance",
      "Support — the base surface underneath does not show through once materials are attached",
      "Colour wheel category — primary/secondary/tertiary colours are a painting concept, not a collage material choice",
    ],
    explanation: "Choosing materials for their different surface qualities — rough for grass, smooth and shiny for a trophy — is exactly what texture in a collage is about.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Before starting, ${who}'s group in ${place(rng)} prepares a stiff piece of cardboard to glue their football collage materials onto. What is this cardboard called?`,
      correct: "The support — the base surface collage materials are attached to",
      wrong: [
        "The adhesive — the adhesive is the glue, not the base surface",
        "The theme — the theme is the subject (football), not the physical base",
        "The texture — texture describes surface quality, not the base itself",
      ],
      explanation: "The stiff base surface materials are glued onto is called the support — the adhesive is the glue itself, and the theme and texture are separate concepts.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s group in ${place(rng)} makes their football collage together, each member contributing different materials and ideas. Why does the source specifically emphasise doing this collaboratively?`,
    correct: "It builds unity — collaboratively combining ideas and materials to complete a shared piece of work",
    wrong: [
      "Collaborating is required only because collage materials are expensive",
      "Working in a group is the only way to apply mixed media",
      "Collaboration has no stated purpose in the source and could be skipped",
    ],
    explanation: "The source names unity as a value developed by collaboratively making the collage — working together to combine ideas and materials, not because of cost or as the only path to mixed media.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `After finishing a football collage in ${place(rng)}, ${who}'s group sweeps up all the offcuts, torn paper, and unused scraps before leaving the classroom. What value does this show?`,
      correct: "Responsibility — cleaning up and managing waste after the art activity",
      wrong: [
        "Unity — cleaning up alone does not involve working together with others",
        "Texture — cleaning up is unrelated to a material's surface quality",
        "Mixed media — cleaning up does not involve combining material types",
      ],
      explanation: "Cleaning up materials and waste after the activity demonstrates responsibility and good waste management — not unity, texture, or mixed media, which are about the artwork itself.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s group in ${place(rng)} discusses actual and virtual sample collage pictures before starting their own football collage. What are they specifically looking for in these samples?`,
    correct: "The characteristics of collage — multi/mixed media and texture",
    wrong: [
      "The exact football score shown in each sample picture",
      "Which sample collage used the most expensive materials",
      "How many people are shown in each sample picture",
    ],
    explanation: "The purpose of exploring sample collage pictures is to discuss their characteristics — specifically multi/mixed media and texture — not scores, cost, or number of figures shown.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s group in ${place(rng)} glues down a piece of woven fabric using a weak, watery paste that peels off within an hour. What has gone wrong with their choice of adhesive?`,
      correct: "It was too weak to hold the material's weight and texture securely onto the support",
      wrong: [
        "Nothing went wrong — any adhesive works equally well on any material",
        "The problem is with the support, not the adhesive at all",
        "The problem is with the texture of the fabric, not the adhesive used",
      ],
      explanation: "Choosing adhesives is explicitly named as something to focus on when preparing collage materials — a weak adhesive that cannot hold a material's weight and texture will fail, as shown here.",
    };
  },
];

const MATERIAL_PROMPTS = ["Sort each material by the texture it has.", "Which texture does each material suggest? Sort them.", "Sort these collage materials by texture.", "Match each material to its texture category by sorting.", "Classify each collage material by texture."] as const;
const TERM_MATCH_PROMPTS = ["Match each term to its meaning.", "Pair each collage term with its definition.", "Match each word to what it means in collage-making.", "Connect each term to its correct meaning.", "For each term below, choose its matching meaning."] as const;
const STEPS_PROMPTS = ["Put these collage-making steps in the correct order.", "Arrange the steps for making a football-themed collage.", "Order these steps, from first to last.", "Sort these collage steps into the correct sequence.", "Place these steps in the order you would follow them."] as const;
const RECOGNITION_PROMPTS = ["Which term is being described?", "Identify the collage term.", "Which term does this describe?", "Read the description and name the term.", "What is this collage characteristic called?"] as const;
const FILL_BLANK_PROMPTS = ["Complete the sentence.", "Fill in the missing word.", "Complete this sentence about collage.", "Fill in the blank below.", "Complete the sentence with the correct word."] as const;

const COLLAGE_STEPS = [
  { id: "c1", label: "Explore sample collage pictures to discuss characteristics — multi/mixed media and texture" },
  { id: "c2", label: "Collect and prepare materials, focusing on texture and type of material, adhesives, and support" },
  { id: "c3", label: "Prepare the support surface (such as cardboard) to glue materials onto" },
  { id: "c4", label: "Collaboratively arrange the football-themed materials into a composition" },
  { id: "c5", label: "Glue the materials down using the chosen adhesive" },
  { id: "c6", label: "Talk about own and others' finished collage work" },
] as const;

export const collage: Skill = {
  id: "g6-cas-collage",
  code: "C.4",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-creating-executing",
  grade: 6,
  title: "Collage",
  description: "Exploring collage characteristics (multi/mixed media, texture), collecting and preparing materials, and collaboratively making a football-themed collage.",
  generate(rng) {
    const branch = randChoice(rng, ["material-categorize", "term-match", "reasoning", "steps-order", "recognition", "fill-blank"] as const);

    if (branch === "material-categorize") {
      const chosen = shuffle(rng, MATERIALS).slice(0, 8);
      const items = chosen.map((m, i) => ({ id: `mat${i}`, label: m.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((m, i) => {
        const q = m.quality;
        correctBucket[`mat${i}`] = q.startsWith("rough") ? "rough" : q.startsWith("smooth") ? "smooth" : "soft";
      });
      return {
        kind: "categorize",
        prompt: randChoice(rng, MATERIAL_PROMPTS),
        items,
        buckets: [
          { id: "rough", label: "Rough/gritty" },
          { id: "smooth", label: "Smooth/shiny" },
          { id: "soft", label: "Soft/fluffy" },
        ],
        correctBucket,
        hint: "Think about how each material would actually feel to touch.",
        explanation: chosen.map((m) => `"${m.label}" is a ${m.quality}.`).join(" "),
      };
    }

    if (branch === "term-match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t) => (correctMap[t.id] = t.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, TERM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about materials, media, texture, glue, and the base surface.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about mixed media, texture, adhesive, support, and working collaboratively.", explanation: q.explanation };
    }

    if (branch === "steps-order") {
      const shuffled = shuffle(rng, COLLAGE_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: COLLAGE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Explore samples first, then gather materials, prepare the support, arrange, glue, then discuss the finished work.",
        explanation: "Correct order: " + COLLAGE_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "recognition") {
      const t = randChoice(rng, TERMS);
      const others = TERMS.filter((x) => x.id !== t.id).map((x) => x.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, t.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, RECOGNITION_PROMPTS)} ${t.meaning}.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Match the description to the correct collage term.",
        explanation: `This describes ${t.label.toLowerCase()} — ${t.meaning}.`,
      };
    }

    const t = randChoice(rng, TERMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: t.blank.before,
      after: t.blank.after,
      correctAnswer: t.blank.correctAnswer,
      acceptedAnswers: t.blank.acceptedAnswers ?? [t.blank.correctAnswer],
      inputMode: "text",
      hint: "Think about collage, mixed media, texture, adhesive, and support.",
      explanation: `${t.label}: ${t.meaning}.`,
    };
  },
};
