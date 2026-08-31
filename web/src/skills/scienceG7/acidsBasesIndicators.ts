import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// 12 household substances, 6 acid + 6 base (pool-size floor: categorize fact pools need 10+).
const HOUSEHOLD_SUBSTANCES = [
  { name: "Lemon juice", type: "acid" },
  { name: "Vinegar", type: "acid" },
  { name: "Fresh milk (slightly sour)", type: "acid" },
  { name: "Tomato juice", type: "acid" },
  { name: "Yoghurt", type: "acid" },
  { name: "Ripe orange juice", type: "acid" },
  { name: "Bar soap solution", type: "base" },
  { name: "Baking soda solution", type: "base" },
  { name: "Toothpaste", type: "base" },
  { name: "Wood ash solution", type: "base" },
  { name: "Ammonia-based cleaning solution", type: "base" },
  { name: "Milk of magnesia (antacid)", type: "base" },
] as const;

// 10 distinct acid/base properties, 5 each (pool-size floor: click-match fact pools need 10+).
const PROPERTIES = [
  { statement: "Turns blue litmus paper red", type: "acid" },
  { statement: "Tastes sour", type: "acid" },
  { statement: "Reacts with some metals to release hydrogen gas", type: "acid" },
  { statement: "Reacts with limestone (calcium carbonate) to release carbon dioxide gas", type: "acid" },
  { statement: "Has a pH value below 7", type: "acid" },
  { statement: "Turns red litmus paper blue", type: "base" },
  { statement: "Feels slippery or soapy to the touch", type: "base" },
  { statement: "Neutralises an acid when mixed with it", type: "base" },
  { statement: "Tastes bitter", type: "base" },
  { statement: "Turns phenolphthalein indicator pink", type: "base" },
] as const;

// Approximate, commonly-cited pH values (rounded to the nearest whole number for a 0-14 number-line).
const PH_VALUES = [
  { name: "Lemon juice", ph: 2 },
  { name: "Vinegar", ph: 3 },
  { name: "Tomato juice", ph: 4 },
  { name: "Fresh milk", ph: 7 },
  { name: "Pure water", ph: 7 },
  { name: "Baking soda solution", ph: 9 },
  { name: "Toothpaste", ph: 9 },
  { name: "Soap solution", ph: 10 },
  { name: "Ammonia-based cleaning solution", ph: 11 },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A substance used to show whether another substance is an acid or a base, by changing colour, is called an ", after: ".", correctAnswer: "indicator", accepted: ["indicator"], explanation: "An indicator is a substance, like litmus, that changes colour to show whether another substance is an acid or a base." },
  { before: "A dye extracted from lichen, used as an acid-base indicator turning red in acid and blue in base, is called ", after: ".", correctAnswer: "litmus", accepted: ["litmus"], explanation: "Litmus is a dye used as an acid-base indicator, turning red in acids and blue in bases." },
  { before: "A substance that is neither an acid nor a base is called ", after: ".", correctAnswer: "neutral", accepted: ["neutral"], explanation: "A neutral substance is neither an acid nor a base, and has a pH of 7." },
  { before: "The numbered scale from 0 to 14 used to measure how acidic or basic a substance is, is called the ", after: " scale.", correctAnswer: "pH", accepted: ["ph"], explanation: "The pH scale runs from 0 to 14 and measures how acidic (below 7) or basic (above 7) a substance is." },
  { before: "The reaction where an acid and a base cancel out each other's properties is called ", after: ".", correctAnswer: "neutralisation", accepted: ["neutralisation", "neutralization"], explanation: "Neutralisation is the reaction where an acid and a base cancel out each other's properties, often forming a salt and water." },
  { before: "A soluble base, such as sodium hydroxide, is sometimes called an ", after: ".", correctAnswer: "alkali", accepted: ["alkali"], explanation: "An alkali is a soluble base, such as sodium hydroxide, that dissolves in water to form a basic solution." },
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
const USE_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  () => ({
    prompt: "A person with a stomach ache takes an antacid tablet, which is a mild base. What does the antacid do?",
    correct: "It neutralises excess acid in the stomach, easing the pain.",
    wrong: ["It adds more acid to help digestion.", "It turns the stomach contents into a gas.", "It has no chemical effect at all."],
    explanation: "Antacids are mild bases that neutralise excess stomach acid, which relieves the discomfort of acid indigestion.",
  }),
  (rng) => ({
    prompt: `A farmer near ${place(rng)} adds lime (a base) to acidic soil before planting maize. Why?`,
    correct: "To neutralise the acidity so the soil pH suits the crop being planted.",
    wrong: ["To make the soil more acidic for better growth.", "To add colour to the soil.", "To kill all the crops growing there."],
    explanation: "Lime is a base that reacts with and neutralises excess acidity in soil, adjusting the pH to a level that suits most crops.",
  }),
  () => ({
    prompt: "Why is vinegar (an acid) sometimes used to remove hard water stains (a base) from a kettle?",
    correct: "The acid reacts with and dissolves the basic mineral deposits, removing the stains.",
    wrong: ["Vinegar makes the stains more basic.", "Vinegar has no reaction with mineral deposits.", "Vinegar only changes the colour of the kettle."],
    explanation: "Hard water deposits are basic; the acid in vinegar reacts with and dissolves them, which is why it is used to descale kettles and other containers.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, sharpening tools on a farm near ${place(rng)}, rubs lemon juice onto a rusty panga blade before scrubbing it. Why might this help loosen the rust?`,
      correct: "Lemon juice is a mild acid, and acids can react with and help loosen rust (iron oxide) on metal.",
      wrong: [
        "Lemon juice is a base that coats the rust to protect it.",
        "Lemon juice has no chemical effect on rust at all.",
        "Lemon juice works only by making the panga slippery, not through any reaction.",
      ],
      explanation: "Lemon juice contains citric acid, a mild acid that can react with rust (iron oxide) and help loosen it — this is a chemical reaction, not just a slippery, physical effect.",
    };
  },
  (rng) => ({
    prompt: `A dairy farmer near ${place(rng)} leaves a jug of fresh milk out too long, and it turns sour. Blue litmus paper dipped into the sour milk turns red. What has happened chemically?`,
    correct: "Bacteria in the milk have produced acids as it spoils, lowering its pH and turning the litmus paper red.",
    wrong: [
      "The milk has become more of a base as it spoiled.",
      "The litmus paper reacted with the milk's fat content, not its acidity.",
      "Spoiled milk has no effect on litmus paper at all.",
    ],
    explanation: "As milk spoils, bacteria break down lactose into lactic acid, making the milk more acidic — this is why blue litmus paper turns red in soured milk.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} treats a bee sting with a paste of baking soda and water. Why can this help ease the sting?`,
      correct: "Baking soda is a mild base, and it can help neutralise the mildly acidic irritant in the sting, easing the discomfort.",
      wrong: [
        "Baking soda is a strong acid that numbs the skin.",
        "Baking soda works only by cooling the skin, not through any chemical reaction.",
        "Baking soda has no effect on a bee sting.",
      ],
      explanation: "Baking soda (sodium bicarbonate) is a mild base. Mixed into a paste and applied to a sting, it can help neutralise the mildly acidic irritant, easing discomfort.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} adds both vinegar (an acid) and baking soda (a base) to a batter and notices it bubble and rise. What is happening?`,
      correct: "The acid and base react together and release carbon dioxide gas, and the trapped bubbles make the batter rise.",
      wrong: [
        "The vinegar evaporates instantly, creating the bubbles.",
        "The baking soda alone produces the bubbles, with no reaction needed.",
        "The mixture is simply boiling from the kitchen heat.",
      ],
      explanation: "When an acid (vinegar) and a base (baking soda) react, they release carbon dioxide gas. The gas bubbles get trapped in the batter, making it rise — this is a genuine acid-base reaction, not evaporation or boiling.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a farmer near ${place(rng)}, tests the soil and finds it is quite acidic. A neighbour advises adding lime (a base) before planting maize, but says not to add lime to the tea section of the farm. Why the difference?`,
      correct: "Maize grows best in soil closer to neutral, so lime reduces the acidity for it — but tea plants actually grow well in acidic soil, so it should be left alone.",
      wrong: [
        "Lime should be added everywhere, since more lime always helps every crop.",
        "Acidity has no effect on which crops grow well.",
        "Tea plants need extra lime added on top of what maize needs.",
      ],
      explanation: "Different crops prefer different soil pH — maize does best in near-neutral soil, so acidic soil is limed for it, while tea thrives in acidic soil, so liming it would work against it.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} wants to remove a greasy stain and a limescale (hard water) stain from the kitchen. Should ${who} use soap (a base) or vinegar (an acid) for each, and why?`,
      correct: "Soap (a base) works best on the greasy stain, while vinegar (an acid) works best dissolving the basic limescale deposit.",
      wrong: [
        "Vinegar should be used for both stains, since acids clean everything.",
        "Soap should be used for both stains, since bases clean everything.",
        "Neither substance has any effect on either type of stain.",
      ],
      explanation: "Soap is effective at breaking down grease, while vinegar's acidity specifically reacts with and dissolves basic mineral (limescale) deposits — matching the cleaner's chemistry to the type of stain matters.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} dips red litmus paper into an unknown clear liquid and it stays red. A classmate claims this proves the liquid is neutral. Is the classmate correct?`,
      correct: "No — red litmus paper staying red only shows the liquid is not a base; it could be an acid or a truly neutral liquid, so more testing (such as blue litmus paper) is needed.",
      wrong: [
        "Yes, red litmus staying red always proves the liquid is neutral.",
        "Yes, because litmus paper can only detect bases, never acids.",
        "No, because red litmus paper never changes colour under any circumstances.",
      ],
      explanation: "Red litmus paper only changes colour (to blue) in the presence of a base — staying red is consistent with either an acid or a neutral substance, so testing with blue litmus paper too is needed to tell them apart.",
    };
  },
];

export const acidsBasesIndicators: Skill = {
  id: "g7-sci-mec-acids-bases",
  code: "MEC.2",
  subjectId: "science",
  strandId: "g7-sci-mec",
  grade: 7,
  title: "Acids, bases and indicators",
  description: "Identifying acids and bases with litmus paper and plant-extract indicators, their physical properties, and their uses in daily life.",
  generate(rng) {
    const branch = randChoice(rng, ["litmus-read", "household-sort", "property-match", "use-knowledge", "fill-blank", "ph-plot"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about acids, bases, and indicators.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe acids, bases, and the pH scale.",
        explanation: fb.explanation,
      };
    }

    if (branch === "ph-plot") {
      const p = randChoice(rng, PH_VALUES);
      return {
        kind: "number-line",
        prompt: `${p.name} has an approximate pH of ${p.ph}. Plot this value on the pH scale.`,
        min: 0,
        max: 14,
        step: 1,
        correctValue: p.ph,
        mode: "point",
        hint: "Below 7 is acidic, 7 is neutral, and above 7 is basic (alkaline).",
        explanation: `${p.name} has an approximate pH of ${p.ph}, which is ${p.ph < 7 ? "acidic" : p.ph > 7 ? "basic (alkaline)" : "neutral"}.`,
      };
    }

    if (branch === "litmus-read") {
      const result = randChoice(rng, ["acid", "base"] as const);
      const changeText = result === "acid" ? "turns red" : "turns blue";
      const choices = shuffle(rng, ["An acid", "A base", "Pure water (neutral)"]);
      const correctIndex = choices.indexOf(result === "acid" ? "An acid" : "A base");
      return {
        kind: "multiple-choice",
        prompt: `Blue litmus paper is dipped into a substance and ${changeText}. What is the substance?`,
        visual: { type: "litmus-test", result },
        choices,
        correctIndex,
        layout: "list",
        hint: "Blue litmus paper stays blue in a base, and turns red in an acid.",
        explanation:
          result === "acid"
            ? "Blue litmus paper turning red shows the substance is an acid."
            : "Blue litmus paper staying blue (or red litmus turning blue) shows the substance is a base.",
      };
    }

    if (branch === "household-sort") {
      const chosen = shuffle(rng, HOUSEHOLD_SUBSTANCES).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `h${i}`, label: c.name }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`h${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each household substance as an acid or a base.",
        items,
        buckets: [
          { id: "acid", label: "Acid" },
          { id: "base", label: "Base" },
        ],
        correctBucket,
        hint: "Sour-tasting substances tend to be acids; soapy or bitter substances tend to be bases.",
        explanation: chosen.map((c) => `${c.name} is a${c.type === "acid" ? "n" : ""} ${c.type}.`).join(" "),
      };
    }

    if (branch === "property-match") {
      const chosen = shuffle(rng, PROPERTIES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p, i) => ({ id: `p${i}`, label: p.statement })));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `p${i}`, label: p.type === "acid" ? "Property of an acid" : "Property of a base" })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: "Match each property to whether it describes an acid or a base.",
        tokens,
        targets,
        correctMap,
        hint: "Acids turn blue litmus red and taste sour; bases turn red litmus blue and feel soapy.",
        explanation: chosen.map((p) => `"${p.statement}" is a property of a${p.type === "acid" ? "n" : ""} ${p.type}.`).join(" "),
      };
    }

    const q = randChoice(rng, USE_TEMPLATES)(rng);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      layout: "list",
      hint: "Think about whether the substance involved is an acid or a base, and what that means chemically.",
      explanation: q.explanation,
    };
  },
};
