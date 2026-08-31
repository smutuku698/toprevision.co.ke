import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { g6Name, g6Place, expandScenarios, buildScenarioChoices, type ScenarioMC } from "./sharedG6Ag";

// KICD Grade 6 Agriculture H.3 "Laundry: Stain Removal — Removing Stains" (the second half of
// source sub-strand "3.2 Laundry: Stain Removal", split per the Grade-6 "split into deeper
// skills" rule; see identifyingStains.ts for the identify half). The source names only blood and
// grass as the enumerated stain pool for removal too. The "Link to other learning area" box
// connects stain removal to knowledge of solvents in Science and Technology — blood (a
// protein-based stain) and grass (a pigment-based stain) genuinely need different treatment,
// which is real domestic-science content, not an invented distinction.

const REMOVAL_STEPS_BLOOD = [
  { id: "b-act", label: "Act quickly", detail: "Treat a blood stain as soon as possible, before it dries and sets into the fabric" },
  { id: "b-cold-rinse", label: "Rinse with cold water", detail: "Rinse the stained area under cold, running water from the back of the fabric" },
  { id: "b-soak", label: "Soak in cold water", detail: "Soak the item in cold water, adding a little salt or mild detergent, for a while" },
  { id: "b-gentle-rub", label: "Gently rub the fabric", detail: "Gently rub the stained area between the fingers to loosen the remaining mark" },
  { id: "b-wash", label: "Wash as normal", detail: "Wash the item as normal once the stain has faded, checking it is gone before drying" },
  { id: "b-check-dry", label: "Check before drying with heat", detail: "Check the stain is fully gone before ironing or drying with heat, since heat can set any remaining mark permanently" },
] as const;

const REMOVAL_STEPS_GRASS = [
  { id: "g-scrape", label: "Scrape off loose material", detail: "Gently scrape off any loose grass or soil clinging to the fabric first" },
  { id: "g-pretreat", label: "Pretreat the stain", detail: "Apply a little detergent or a suitable stain remover directly onto the green mark" },
  { id: "g-work-in", label: "Work it into the fabric", detail: "Gently work the detergent into the stained fibres with the fingers or a soft brush" },
  { id: "g-wait", label: "Let it sit briefly", detail: "Leave the detergent to sit on the stain for a short while so it can loosen the pigment" },
  { id: "g-rinse", label: "Rinse thoroughly", detail: "Rinse the area thoroughly under water to wash out the loosened pigment" },
  { id: "g-wash-check", label: "Wash and check", detail: "Wash the item as normal, checking that the green mark is gone before drying" },
] as const;

const SAFE_PRACTICES = [
  "Treating a blood stain with cold water as soon as possible, before it dries",
  "Rinsing a fresh stain from the back of the fabric so the mark is pushed out, not further in",
  "Testing a stain remover on a hidden part of the fabric first, to check it does not damage the colour",
  "Checking a blood stain is fully gone before ironing or heat-drying the item",
  "Gently working a grass-stain treatment into the fibres rather than scrubbing harshly",
  "Reading and following the instructions on a stain-removal product before using it",
  "Wearing gloves when using a stronger chemical stain remover",
  "Keeping stain-removal products stored safely, away from young children",
  "Washing hands after handling a soiled or stained item",
  "Rinsing an item thoroughly after treating it, so no soap or remover residue is left behind",
  "Air-drying a treated item first to double-check the stain has not returned before ironing it",
  "Treating a stain promptly rather than leaving a stained item in a laundry basket for days",
] as const;

const UNSAFE_PRACTICES = [
  "Using hot water first on a fresh blood stain, which sets the protein into the fabric permanently",
  "Ironing an item while a blood stain is still faintly visible, baking it permanently into the fibres",
  "Scrubbing a grass stain harshly enough to damage or thin the fabric",
  "Mixing different stain-removal chemicals together without knowing if it is safe",
  "Leaving a stained item to sit unwashed for weeks before attempting to treat it",
  "Using a strong chemical stain remover with no ventilation in a closed room",
  "Rubbing a stain in a rough circular motion that spreads it over a wider area",
  "Skipping a hidden-patch test before using a new stain remover on a favourite item",
  "Leaving stain-removal chemicals within reach of a young child",
  "Drying a stained item on high heat before checking whether the stain is actually gone",
  "Using the same cloth to treat a stain and then to wipe food-preparation surfaces",
  "Guessing at a treatment instead of matching it to the type of stain being removed",
] as const;

const OBSERVATION_FACTS: { situation: string; correct: string; wrong: string[] }[] = [
  {
    situation: "a fresh blood stain rinsed in cold water comes out easily, while the same stain rinsed in hot water sets in and becomes much harder to remove",
    correct: "Heat causes the protein in blood to bind permanently to fabric fibres, while cold water rinses the protein away before it can set",
    wrong: [
      "Hot water always removes stains faster than cold water",
      "The temperature of the water makes no difference to a blood stain",
      "Blood stains cannot be removed by water at all, only by chemicals",
    ],
  },
  {
    situation: "a grass stain treated with detergent worked gently into the fabric comes out more completely than one only rinsed with plain water",
    correct: "Detergent helps break down and lift the grass's chlorophyll pigment out of the fabric fibres, which plain water alone struggles to do",
    wrong: [
      "Plain water always removes pigment-based stains better than detergent",
      "Detergent has no effect on a grass stain, only on dirt",
      "Grass stains cannot be removed once they have touched fabric",
    ],
  },
  {
    situation: "a blood stain treated the same day it happens comes out completely, while the same stain left untreated for a week is much harder to remove",
    correct: "The longer a stain is left, the more firmly it binds to the fabric fibres, so acting quickly makes removal far easier",
    wrong: [
      "How long a stain is left has no effect on how easy it is to remove",
      "Stains left for longer always become easier to remove",
      "Only the type of fabric affects how easy a stain is to remove, never the timing",
    ],
  },
  {
    situation: "rinsing a fresh stain from the back of the fabric pushes the mark out more effectively than rinsing from the front",
    correct: "Rinsing from the back pushes the stain out of the fabric in the direction it originally entered, rather than driving it further in",
    wrong: [
      "Which side is rinsed makes no difference to stain removal",
      "Rinsing from the front always removes a stain faster",
      "The direction of rinsing only matters for coloured fabrics",
    ],
  },
  {
    situation: "a stain-removal product tested on a hidden part of the fabric first avoids ruining a favourite shirt, while skipping that test sometimes damages the fabric's colour",
    correct: "Testing on a hidden patch first shows whether the product is safe for that particular fabric and colour before it is used on a visible area",
    wrong: [
      "Testing on a hidden patch has no real purpose",
      "All stain removers are equally safe on every type of fabric",
      "Skipping the test only matters for white fabric, never coloured fabric",
    ],
  },
  {
    situation: "a blood stain that is not fully gone before ironing becomes a permanent mark, while the same stain checked carefully before ironing is removed completely",
    correct: "Heat from an iron sets any remaining protein stain permanently into the fabric, the same way hot water does",
    wrong: [
      "Ironing always removes any remaining stain completely",
      "Heat has no effect on a blood stain that is nearly gone",
      "Checking a stain before ironing makes no real difference to the outcome",
    ],
  },
  {
    situation: "a grass stain scraped of loose material first and then treated comes out more easily than one treated without scraping first",
    correct: "Removing loose grass or soil first means the detergent can reach and work directly on the pigment already absorbed into the fibres",
    wrong: [
      "Scraping loose material first has no effect on the final result",
      "Detergent works better when applied over loose debris",
      "Scraping is only a cosmetic step with no effect on stain removal",
    ],
  },
  {
    situation: "an item rinsed thoroughly after stain treatment feels clean and residue-free, while one rinsed only briefly still feels slightly stiff or soapy",
    correct: "A thorough rinse washes out the loosened stain and any leftover soap or remover, while a brief rinse leaves residue behind in the fibres",
    wrong: [
      "Rinsing time has no effect on how a fabric feels afterward",
      "A brief rinse always removes more residue than a thorough one",
      "Residue left in fabric only affects its smell, never its feel",
    ],
  },
  {
    situation: "a blood stain and a grass stain on the same shirt need different treatments to come out fully",
    correct: "Blood is a protein-based stain best treated with cold water, while grass is a pigment-based stain best treated by working in detergent, so one single method does not suit both",
    wrong: [
      "Blood and grass stains are chemically identical, so the same method always works for both",
      "Only the colour of a stain determines how it should be treated, never what caused it",
      "Neither type of stain can actually be removed once it has dried",
    ],
  },
  {
    situation: "a person using a strong stain-removal chemical in a closed room with no open window starts to feel unwell, while using it with a window open causes no problem",
    correct: "Some stain-removal chemicals give off fumes that can be uncomfortable or harmful to breathe in a poorly ventilated space, so fresh air matters when using them",
    wrong: [
      "Stain-removal chemicals never affect anyone breathing nearby",
      "Ventilation only matters for chemicals used outdoors",
      "Feeling unwell in this situation has nothing to do with the chemical used",
    ],
  },
];

const REASONING_FRAMES: ((rng: RNG, fact: (typeof OBSERVATION_FACTS)[number]) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = g6Name(rng);
    const p = g6Place(rng);
    return {
      prompt: `${who}, doing the laundry at home in ${p}, notices that ${fact.situation}. Why?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = g6Place(rng);
    return {
      prompt: `In a household near ${p}, ${fact.situation}. What is the best explanation?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = g6Name(rng);
    return {
      prompt: `While removing a stain from clothing, ${who} observes that ${fact.situation}. Why does this happen?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = g6Name(rng);
    return {
      prompt: `${who} is puzzled to find that ${fact.situation}. What is the reason for this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = g6Place(rng);
    const situation = fact.situation.charAt(0).toUpperCase() + fact.situation.slice(1);
    return {
      prompt: `${situation}, in a household near ${p}. What causes this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = g6Name(rng);
    const p = g6Place(rng);
    return {
      prompt: `While comparing two treated garments near ${p}, ${who} works out that ${fact.situation}. What is going on here?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
];

const REASONING_TEMPLATES = expandScenarios(OBSERVATION_FACTS, REASONING_FRAMES);

const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "A fresh blood stain should be rinsed in ", after: " water, never hot.", correctAnswer: "cold", acceptedAnswers: ["cold"] },
  { before: "Hot water makes a blood stain worse because it causes the ", after: " in blood to bind permanently to the fabric.", correctAnswer: "protein", acceptedAnswers: ["protein"] },
  { before: "A grass stain is best treated by working ", after: " gently into the stained fibres.", correctAnswer: "detergent", acceptedAnswers: ["detergent"] },
  { before: "The green colour in a grass stain comes from a pigment called ", after: ".", correctAnswer: "chlorophyll", acceptedAnswers: ["chlorophyll"] },
  { before: "A stain should be treated as soon as possible, before it has time to ", after: " into the fabric.", correctAnswer: "set", acceptedAnswers: ["set"] },
  { before: "Rinsing a fresh stain from the ", after: " of the fabric pushes it out rather than further in.", correctAnswer: "back", acceptedAnswers: ["back"] },
  { before: "A stain remover should be tested on a hidden ", after: " of fabric first.", correctAnswer: "patch", acceptedAnswers: ["patch", "area"] },
  { before: "A blood stain should be fully removed before ", after: " or heat-drying the item.", correctAnswer: "ironing", acceptedAnswers: ["ironing"] },
  { before: "Loose grass or soil should be ", after: " off the fabric before treating the stain underneath.", correctAnswer: "scraped", acceptedAnswers: ["scraped"] },
  { before: "After treating a stain, an item should be rinsed ", after: " to remove all soap or remover residue.", correctAnswer: "thoroughly", acceptedAnswers: ["thoroughly"] },
  { before: "Removal of stains on cloth relates to knowledge of ", after: " learnt in Science and Technology.", correctAnswer: "solvents", acceptedAnswers: ["solvents"] },
  { before: "Blood is a protein-based stain, while grass is a ", after: "-based stain.", correctAnswer: "pigment", acceptedAnswers: ["pigment"] },
  { before: "Gloves should be worn when using a strong chemical ", after: " remover.", correctAnswer: "stain", acceptedAnswers: ["stain"] },
  { before: "A strong stain-removal chemical should be used in a well-", after: " room, not a closed one.", correctAnswer: "ventilated", acceptedAnswers: ["ventilated"] },
  { before: "Stain-removal products should be stored safely away from young ", after: ".", correctAnswer: "children", acceptedAnswers: ["children"] },
  { before: "A blood stain left untreated for many days becomes much ", after: " to remove than a fresh one.", correctAnswer: "harder", acceptedAnswers: ["harder"] },
  { before: "Working detergent gently into a stain avoids ", after: " the fabric with harsh scrubbing.", correctAnswer: "damaging", acceptedAnswers: ["damaging"] },
  { before: "A treated stain should be checked before the item is dried using ", after: ".", correctAnswer: "heat", acceptedAnswers: ["heat"] },
  { before: "Once a grass stain is loosened with detergent, the fabric should be ", after: " thoroughly.", correctAnswer: "rinsed", acceptedAnswers: ["rinsed"] },
  { before: "Practising good stain-removal habits supports personal ", after: ".", correctAnswer: "hygiene", acceptedAnswers: ["hygiene"] },
  { before: "A cloth used to treat a stain should not later be used to wipe food-", after: " surfaces.", correctAnswer: "preparation", acceptedAnswers: ["preparation"] },
  { before: "Cold water rinses blood's protein away before it has a chance to ", after: " into the fibres.", correctAnswer: "bind", acceptedAnswers: ["bind", "set"] },
  { before: "Reading the instructions on a stain-removal product before using it is a ", after: " habit.", correctAnswer: "safe", acceptedAnswers: ["safe"] },
  { before: "Air-drying a treated item first lets you check the stain has not ", after: " before ironing it.", correctAnswer: "returned", acceptedAnswers: ["returned"] },
  { before: "Different stains, such as blood and grass, often need different ", after: ".", correctAnswer: "treatments", acceptedAnswers: ["treatments", "methods"] },
  { before: "Gently rubbing a stain between the fingers helps loosen the remaining ", after: ".", correctAnswer: "mark", acceptedAnswers: ["mark", "stain"] },
  { before: "Rinsing an item after treatment prevents leftover soap from staying in the ", after: ".", correctAnswer: "fibres", acceptedAnswers: ["fibres", "fabric"] },
  { before: "A stiff, crusty blood stain that has not yet been treated should still be rinsed in ", after: " water first.", correctAnswer: "cold", acceptedAnswers: ["cold"] },
  { before: "Matching the treatment to the type of stain, rather than guessing, gives a more reliable ", after: ".", correctAnswer: "result", acceptedAnswers: ["result"] },
  { before: "Good stain-removal habits, alongside careful handling of chemicals, keep laundry both clean and ", after: ".", correctAnswer: "safe", acceptedAnswers: ["safe"] },
];

const IDENTIFY_VISUAL_PROMPT_TEMPLATES = [
  (stain: string) => `This is a ${stain} stain, before treatment. Which removal method suits it best?`,
  (stain: string) => `Here is an untreated ${stain} stain. Which removal method fits it best?`,
  (stain: string) => `A ${stain} stain, not yet treated, is shown here. Which method should be used to remove it?`,
  (stain: string) => `Look at this untreated ${stain} stain. Which of these methods would remove it best?`,
  (stain: string) => `Before any treatment, this ${stain} stain looks like this. Which removal method is correct for it?`,
];

const STEPS_MATCH_PROMPT_TEMPLATES = [
  (stain: string) => `Match each step for removing a ${stain} stain to what it involves.`,
  (stain: string) => `Pair each ${stain}-stain removal step with what it actually means to do.`,
  (stain: string) => `Connect each step of removing a ${stain} stain to its description.`,
  (stain: string) => `Match each stage of removing a ${stain} stain to what it involves.`,
  (stain: string) => `Link each ${stain}-stain removal step to the description that fits it.`,
  (stain: string) => `Match each step below to the correct explanation for removing a ${stain} stain.`,
];

const STEPS_ORDER_PROMPT_TEMPLATES = [
  (stain: string) => `Arrange the steps for removing a ${stain} stain in the correct order.`,
  (stain: string) => `Put these steps for removing a ${stain} stain into the right sequence.`,
  (stain: string) => `Sequence the steps for removing a ${stain} stain correctly.`,
  (stain: string) => `Arrange these steps in the order they should be carried out to remove a ${stain} stain.`,
  (stain: string) => `Order these ${stain}-stain removal steps from first to last.`,
  (stain: string) => `Sort these steps into the correct order for removing a ${stain} stain.`,
];

const SAFETY_SORT_PROMPTS = [
  "Sort each laundry practice as safe or unsafe when removing a stain.",
  "Decide whether each laundry practice is safe or unsafe when removing a stain, and sort it.",
  "Group these laundry practices under whether they are safe or unsafe.",
  "Read each practice and sort it as safe or unsafe while removing a stain.",
  "Place each practice into the correct bucket: safe or unsafe.",
  "Sort these stain-removal practices by whether they are safe or risky.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about removing stains.",
  "Fill in the missing word about removing stains.",
  "Complete this sentence about stain removal.",
  "Supply the missing word in this sentence about removing stains.",
  "Fill in the blank to complete the fact about removing stains.",
  "Complete the missing word in this statement about removing stains.",
];

export const removingStains: Skill = {
  id: "g6-ag-h-removing-stains",
  code: "H.3",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-hygiene",
  grade: 6,
  title: "Laundry: Stain Removal — Removing Stains",
  description: "Removing common blood and grass stains from clothing and household articles — the different treatment each needs, and safety and hygiene while doing laundry.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-visual", "steps-match", "steps-order", "safety-sort", "reasoning", "fill-blank"] as const);
    const hint = "Blood is a protein-based stain treated with cold water; grass is a pigment-based stain treated by working in detergent — heat sets a protein stain permanently.";

    if (branch === "identify-visual") {
      const stain = randChoice(rng, ["blood", "grass"] as const);
      const label = stain === "blood" ? "Cold water rinse, then soak and wash" : "Scrape, pretreat with detergent, then rinse";
      const otherLabel = stain === "blood" ? "Scrape, pretreat with detergent, then rinse" : "Cold water rinse, then soak and wash";
      const distractor1 = "Iron the stain immediately with a hot iron";
      const distractor2 = "Leave it untreated — it will fade on its own";
      const choices = shuffle(rng, [label, otherLabel, distractor1, distractor2]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_VISUAL_PROMPT_TEMPLATES)(stain),
        visual: { type: "fabric-stain", stain, treated: false },
        choices,
        correctIndex: choices.indexOf(label),
        layout: "list",
        hint,
        explanation:
          stain === "blood"
            ? "Blood is protein-based, so cold water (never hot) rinses it away before it can set — soaking and a normal wash finish the job."
            : "Grass is pigment-based, so scraping off loose material and working in detergent loosens the chlorophyll before rinsing it out.",
      };
    }

    if (branch === "steps-match") {
      const stain = randChoice(rng, ["blood", "grass"] as const);
      const steps: readonly { id: string; label: string; detail: string }[] = stain === "blood" ? REMOVAL_STEPS_BLOOD : REMOVAL_STEPS_GRASS;
      const tokens = shuffle(rng, steps.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, steps.map((s) => ({ id: s.id, label: s.detail })));
      const correctMap: Record<string, string> = {};
      for (const s of steps) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, STEPS_MATCH_PROMPT_TEMPLATES)(stain),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: steps.map((s) => `${s.label}: ${s.detail}.`).join(" "),
      };
    }

    if (branch === "steps-order") {
      const stain = randChoice(rng, ["blood", "grass"] as const);
      const steps: readonly { id: string; label: string; detail: string }[] = stain === "blood" ? REMOVAL_STEPS_BLOOD : REMOVAL_STEPS_GRASS;
      const shuffled = shuffle(rng, steps);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_ORDER_PROMPT_TEMPLATES)(stain),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: steps.map((s) => s.id),
        hint:
          stain === "blood"
            ? "Act quickly, rinse and soak in cold water, gently rub, then wash and check before any heat drying."
            : "Scrape off loose material, pretreat and work in detergent, let it sit, rinse, then wash and check.",
        explanation: steps.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "safety-sort") {
      const safe = shuffle(rng, SAFE_PRACTICES).slice(0, 5);
      const unsafe = shuffle(rng, UNSAFE_PRACTICES).slice(0, 5);
      const chosen = shuffle(rng, [
        ...safe.map((text) => ({ text, bucket: "safe" as const })),
        ...unsafe.map((text) => ({ text, bucket: "unsafe" as const })),
      ]);
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SAFETY_SORT_PROMPTS),
        items,
        buckets: [
          { id: "safe", label: "Safe practice" },
          { id: "unsafe", label: "Unsafe practice" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is ${c.bucket === "safe" ? "safe" : "unsafe"}.`).join(" "),
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
        hint,
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: fb.acceptedAnswers,
      inputMode: "text",
      hint,
      explanation: `The sentence reads: "${fb.before}${fb.correctAnswer}${fb.after}"`,
    };
  },
};
