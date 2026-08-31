import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FORMS = [
  { id: "liquid", label: "Liquid soap", detail: "A pourable soap kept in a bottle, often used for handwashing or dishwashing" },
  { id: "cake", label: "Cake/bar soap", detail: "A solid, moulded block of soap used for bathing or laundry" },
  { id: "paste", label: "Paste soap", detail: "A thick, semi-solid soap, often used for scrubbing or heavy-duty cleaning" },
  { id: "powder", label: "Powder soap", detail: "A dry, granulated soap, commonly dissolved in water for laundry" },
] as const;

const INGREDIENT_ITEMS = [
  { text: "Animal fat or plant oil", bucket: "fat" },
  { text: "Ash mixed with water (a source of alkali)", bucket: "alkali" },
  { text: "Salt", bucket: "hardener" },
  { text: "Water", bucket: "solvent" },
] as const;
const INGREDIENT_LABEL: Record<string, string> = {
  fat: "Provides the fat or oil",
  alkali: "Provides the alkali needed to react with fat",
  hardener: "Helps harden or firm up the soap",
  solvent: "Dissolves and helps combine the ingredients",
};

const SCENARIOS = [
  {
    q: "A family wants to make homemade soap using ashes, salt, water, and animal fat, mainly to reduce household spending. What core benefit are they gaining?",
    correct: "Financial literacy — saving money by making soap from resources already available at home",
    distractors: [
      "They are gaining no real benefit compared to buying soap",
      "Homemade soap is always more expensive than shop-bought soap",
      "Making soap at home requires no ingredients at all",
    ],
  },
  {
    q: "Why must a person handle the ash-and-water mixture used in soap making with care?",
    correct: "The mixture forms a strong alkali that can irritate or burn the skin if handled carelessly",
    distractors: [
      "The mixture is completely harmless and needs no special care",
      "Ash and water mixtures are only dangerous when cold",
      "Only the finished soap requires careful handling, never the ingredients",
    ],
  },
];

const SOAP_STEPS = [
  { id: "gather", label: "Gather natural ingredients — ashes, salt, water, and animal fat or plant oil" },
  { id: "lye", label: "Mix ashes with water to obtain the alkali (lye) solution" },
  { id: "combine", label: "Combine the alkali solution with the fat or oil" },
  { id: "stir", label: "Stir the mixture thoroughly as it reacts and thickens" },
  { id: "mould", label: "Pour the mixture into a mould and let it set and cure" },
];

const FILL_ITEMS = [
  { before: "A strong alkali solution obtained from mixing ash with water is called ", after: ".", correctAnswer: "lye" },
  { before: "The skill of saving money by using locally available resources, such as making your own soap, is called financial ", after: ".", correctAnswer: "literacy" },
];

const MATCH_PROMPTS = [
  "Match each form of soap used at household level to its description.",
  "Pair each soap form with the description that explains it.",
  "Connect each form of soap to what it actually is.",
  "Match each form below to the statement that describes it.",
  "Link each household soap form to its correct description.",
  "Match each soap form to its explanation.",
];

const SORT_PROMPTS = [
  "Sort each natural ingredient used in homemade soap by the role it plays.",
  "Decide which role each ingredient below plays, and sort it there.",
  "Group these soap-making ingredients under the role they perform.",
  "Sort each ingredient into the correct role it plays in soap making.",
  "Read each ingredient and place it under the role it performs in the reaction.",
  "Classify each ingredient by its role in making soap.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for making homemade soap using natural ingredients, in the correct order.",
  "Put these soap-making steps into a sensible order.",
  "Sequence the steps for making homemade soap correctly.",
  "Arrange these actions into the order a careful soap-maker would follow them.",
  "Order these soap-making tasks the way they should actually happen.",
  "Sort these steps into the order needed to make homemade soap.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Which word correctly completes this sentence?",
  "Supply the missing word to finish the sentence.",
  "Work out the missing word in this sentence.",
  "Type the word that correctly fills the gap.",
];

export const makingHomemadeSoap: Skill = {
  id: "g7-ag-p-making-homemade-soap",
  code: "P.4",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-production-techniques",
  grade: 7,
  title: "Making Homemade Soap",
  description: "Forms of soap used at household level, making homemade soap from natural ingredients such as ashes, salt, water, and fats or oils, and the financial benefit of doing so.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "sort", "scenario", "order", "fill"] as const);
    const hint = "Soap forms from a reaction between a fat or oil and an alkali (from ash and water), with salt often added to help it harden.";

    if (branch === "match") {
      const tokens = shuffle(rng, FORMS.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FORMS.map((f) => ({ id: f.id, label: f.detail })));
      const correctMap: Record<string, string> = {};
      for (const f of FORMS) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: FORMS.map((f) => `${f.label}: ${f.detail}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, INGREDIENT_ITEMS);
      const items = chosen.map((c, i) => ({ id: `i${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`i${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: INGREDIENT_LABEL[b] })),
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" — ${INGREDIENT_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const entry = randChoice(rng, SCENARIOS);
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
    }

    if (branch === "order") {
      const items = shuffle(rng, SOAP_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: SOAP_STEPS.map((s) => s.id),
        hint: "The alkali must be obtained from ash and water before it can be combined with fat, and moulding happens only after the mixture thickens.",
        explanation: SOAP_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint,
      explanation: `The sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
