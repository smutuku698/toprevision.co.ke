import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const METHODS = [
  { id: "filtration", label: "Filtration", desc: "Passing a mixture through a filter to separate an insoluble solid from a liquid" },
  { id: "simple-distillation", label: "Simple distillation", desc: "Heating a solution so the liquid evaporates and is then cooled and collected, leaving the dissolved solid behind" },
  { id: "evaporation", label: "Evaporation", desc: "Heating a solution until the liquid escapes as vapour, leaving the dissolved solid behind" },
  { id: "chromatography", label: "Chromatography", desc: "Letting a solvent carry dissolved substances different distances up a strip of paper, separating them by colour" },
  { id: "sublimation", label: "Sublimation", desc: "Heating a solid that turns directly into a gas, which is then cooled to form a solid again, separating it from other solids" },
] as const;

// 11 distinct mixture examples spanning all 5 methods (pool-size floor: click-match fact pools need 10+).
const MIXTURE_EXAMPLES = [
  { mixture: "Muddy water (sand and water)", method: "filtration" },
  { mixture: "Chalk powder stirred into water", method: "filtration" },
  { mixture: "Brewed tea poured through a wire strainer to remove the leaves", method: "filtration" },
  { mixture: "Salty water, to recover the salt at Lake Magadi", method: "evaporation" },
  { mixture: "Seawater evaporated in shallow coastal salt pans near Malindi", method: "evaporation" },
  { mixture: "Salty water, to recover clean drinking water", method: "simple-distillation" },
  { mixture: "Ethanol dissolved in water", method: "simple-distillation" },
  { mixture: "Different dyes in a black ink sample", method: "chromatography" },
  { mixture: "Green and yellow pigments in a crushed-leaf (chlorophyll) extract", method: "chromatography" },
  { mixture: "A mixture of iodine crystals and sand", method: "sublimation" },
  { mixture: "A mixture of ammonium chloride and sand", method: "sublimation" },
] as const;

// 12 distinct homogeneous/heterogeneous facts (pool-size floor: categorize fact pools need 10+).
const MIXTURE_TYPE_ITEMS = [
  { text: "Sugar completely dissolved in tea", bucket: "homogeneous" },
  { text: "Salt completely dissolved in water", bucket: "homogeneous" },
  { text: "Air (a mixture of gases)", bucket: "homogeneous" },
  { text: "Brass (a mixture of copper and zinc metal)", bucket: "homogeneous" },
  { text: "Glucose completely dissolved in water", bucket: "homogeneous" },
  { text: "Vinegar (acetic acid dissolved in water)", bucket: "homogeneous" },
  { text: "Sand mixed with small stones", bucket: "heterogeneous" },
  { text: "Oil floating on top of water", bucket: "heterogeneous" },
  { text: "Rice mixed with husks before winnowing", bucket: "heterogeneous" },
  { text: "Soil containing visible stones, roots and sand", bucket: "heterogeneous" },
  { text: "Chopped mango, banana and pawpaw pieces in a fruit salad", bucket: "heterogeneous" },
  { text: "Steel (a mixture of iron and carbon)", bucket: "homogeneous" },
] as const;

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma",
  "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru",
] as const;

const KENYAN_PLACES = [
  "Kisumu", "Eldoret", "Nakuru", "Kitengela", "Thika", "Nyeri",
  "Kitale", "Machakos", "Mombasa", "Malindi", "Nyahururu", "Homa Bay",
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
const APPLICATION_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  () => ({
    prompt: "At Lake Magadi, workers collect brine (salty water) in shallow pans under the sun. Which separation method are they relying on?",
    correct: "Evaporation",
    wrong: ["Filtration", "Chromatography", "Sublimation"],
    explanation: "The sun's heat evaporates the water from the brine over time, leaving solid soda ash/salt behind — this is evaporation.",
  }),
  () => ({
    prompt: "A forensic scientist wants to find out which coloured pens were used to write a ransom note. Which method would best separate the dye colours in each pen's ink?",
    correct: "Chromatography",
    wrong: ["Simple distillation", "Filtration", "Evaporation"],
    explanation: "Chromatography separates different dissolved dyes because they travel different distances up the paper, revealing the colours that make up each ink.",
  }),
  () => ({
    prompt: "Why is filtration not a suitable method for separating salt from salty water?",
    correct: "The salt is fully dissolved, so it passes through the filter paper along with the water.",
    wrong: ["Filtration only works on gases.", "Salt is too heavy to be poured through a funnel.", "Filtration removes colour, not solids."],
    explanation: "Filtration only separates an insoluble solid from a liquid. Once salt is dissolved, its particles are small enough to pass through filter paper with the water, so evaporation or distillation is needed instead.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, in ${place(rng)}, boils seawater in a covered pot and collects the water that drips from the cool lid into a cup to get fresh drinking water. Which method is ${who} using, and why does covering the pot matter?`,
      correct: "Simple distillation — covering the pot lets the evaporated water vapour condense on the lid and be collected as clean water.",
      wrong: [
        "Evaporation — the vapour is simply left to escape into the air.",
        "Filtration — the pot's shape traps the solid salt.",
        "Sublimation — the seawater turns directly into a gas without passing through a liquid stage.",
      ],
      explanation: "Boiling salty water and then cooling and collecting the vapour (rather than letting it escape) is what makes this simple distillation, not plain evaporation — the collected liquid is the useful product here.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, in ${place(rng)}, heats a mixture of iodine crystals and sand. The iodine turns straight into a purple vapour, which is then cooled on a cold surface back into solid iodine crystals, leaving the sand behind. What method is this?`,
      correct: "Sublimation",
      wrong: ["Evaporation", "Filtration", "Simple distillation"],
      explanation: "Iodine passes directly from solid to gas (and back to solid on cooling) without becoming a liquid in between — this direct solid-to-gas change is sublimation, and it is what separates it cleanly from the sand.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} makes a pot of tea in ${place(rng)} and pours it through a wire tea strainer before drinking, to remove the tea leaves. Which separation method is ${who} using?`,
      correct: "Filtration",
      wrong: ["Evaporation", "Chromatography", "Sublimation"],
      explanation: "The tea leaves are an insoluble solid suspended in the liquid tea — passing the mixture through a strainer (a simple filter) separates the leaves from the liquid, which is filtration.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} suggests using chromatography to separate sand from a sample of salty water in ${place(rng)}. Why won't this work?`,
      correct: "Chromatography separates dissolved substances that travel at different speeds up paper — it cannot separate an insoluble solid like sand from a liquid at all.",
      wrong: [
        "Chromatography only works on gases, not liquids.",
        "Chromatography would remove the colour from the water but leave the sand behind mixed in.",
        "Chromatography works, but only if the water is boiled first.",
      ],
      explanation: "Chromatography is designed for separating dissolved substances by how far they travel up a paper strip — sand is not dissolved at all, so filtration (not chromatography) is the correct method here.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} evaporates seawater in open, uncovered salt pans near ${place(rng)} to harvest salt for sale. A classmate asks why ${who} doesn't cover the pans the way you would for distillation. Why does leaving them uncovered make sense here?`,
      correct: "The goal is to collect the solid salt left behind, not the water vapour, so leaving the pans open to the sun and wind actually speeds up evaporation.",
      wrong: [
        "Covering the pans would help collect more salt.",
        "Covering or not covering makes no difference to the amount of salt produced.",
        "Covering the pans would turn the process into filtration instead.",
      ],
      explanation: "Evaporation for salt production wants the water to escape as vapour as fast as possible, leaving the salt behind — covering the pans (as distillation does) would trap the vapour instead of letting it escape, which is the opposite of what is needed here.",
    };
  },
  (rng) => {
    const who = name(rng);
    const friend = name(rng);
    return {
      prompt: `${who} tries to use filtration to separate the alcohol in a fermented drink from the water in it, in ${place(rng)}. ${friend} says this will not work. Who is right?`,
      correct: `${friend} is right — filtration only separates insoluble solids from liquids, and the alcohol is fully mixed (dissolved) with the water, so distillation is needed instead.`,
      wrong: [
        `${who} is right — filtration can separate any two liquids from each other.`,
        "Neither is right — no method can separate alcohol from water.",
        `${friend} is right, but only because alcohol is heavier than water.`,
      ],
      explanation: "Filtration only works when one component is an insoluble solid. Alcohol dissolved in water is a homogeneous liquid mixture, which needs simple distillation (using the two liquids' different boiling points) to separate, not filtration.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} crushes green leaves in ${place(rng)}, extracts the pigment in a solvent, and dips a strip of chromatography paper into it. After some time, several distinct colour bands appear on the strip. What does this result show?`,
      correct: "The leaf extract contains several different pigments, which travel different distances up the paper because they are not all the same substance.",
      wrong: [
        "The leaf extract contains only one pigment that simply changed colour as it moved.",
        "The chromatography paper itself added the extra colours.",
        "The extra colours are impurities that came from outside the leaf, not from the leaf itself.",
      ],
      explanation: "Each distinct colour band on a chromatography strip represents a different dissolved pigment in the original mixture — the leaf extract's several bands show it is a mixture of pigments (such as different forms of chlorophyll), not a single substance.",
    };
  },
];

const DISTILLATION_STEPS = [
  { id: "heat", label: "Heat the salty water solution in a flask" },
  { id: "evaporate", label: "The water evaporates into vapour while the salt stays behind" },
  { id: "condenser", label: "The vapour travels through a condenser and begins to cool" },
  { id: "condense", label: "The cooled vapour condenses back into liquid water" },
  { id: "collect", label: "The distilled water is collected in a separate container" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The liquid that has passed through a filter, leaving the solid behind, is called the ", after: ".", correctAnswer: "filtrate", accepted: ["filtrate"], explanation: "The filtrate is the liquid that has passed through a filter, once the insoluble solid has been removed." },
  { before: "The solid left behind on filter paper after filtration is called the ", after: ".", correctAnswer: "residue", accepted: ["residue"], explanation: "The residue is the solid left behind on filter paper after filtration." },
  { before: "The liquid in which a solid dissolves to form a solution is called the ", after: ".", correctAnswer: "solvent", accepted: ["solvent"], explanation: "The solvent is the liquid in which a solid (the solute) dissolves to form a solution." },
  { before: "The substance that dissolves in a solvent to form a solution is called the ", after: ".", correctAnswer: "solute", accepted: ["solute"], explanation: "The solute is the substance that dissolves in a solvent to form a solution." },
  { before: "A substance that is able to dissolve in a solvent is described as ", after: ".", correctAnswer: "soluble", accepted: ["soluble"], explanation: "A soluble substance is able to dissolve in a solvent, such as salt in water." },
  { before: "A substance that is not able to dissolve in a solvent is described as ", after: ".", correctAnswer: "insoluble", accepted: ["insoluble"], explanation: "An insoluble substance is not able to dissolve in a solvent, such as sand in water." },
  { before: "The liquid collected after distillation, once vapour has cooled and condensed, is called the ", after: ".", correctAnswer: "distillate", accepted: ["distillate"], explanation: "The distillate is the liquid collected after distillation, once the vapour has cooled and condensed." },
] as const;

export const mixtureSeparation: Skill = {
  id: "g7-sci-mec-mixtures",
  code: "MEC.1",
  subjectId: "science",
  strandId: "g7-sci-mec",
  grade: 7,
  title: "Mixtures and how to separate them",
  description: "Homogeneous vs heterogeneous mixtures, and methods used to separate them: filtration, evaporation, distillation, chromatography and sublimation.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-setup", "mixture-method-match", "mixture-type-sort", "application", "fill-blank", "distillation-order"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about mixtures and separation methods.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe solutions, filtration, and distillation.",
        explanation: fb.explanation,
      };
    }

    if (branch === "distillation-order") {
      const items = shuffle(rng, DISTILLATION_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps of simple distillation, used to separate salt from salty water, in order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: DISTILLATION_STEPS.map((s) => s.id),
        hint: "Heating comes first, then evaporation, then cooling in the condenser, then condensing, and finally collection.",
        explanation: DISTILLATION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "identify-setup") {
      const target = randChoice(rng, METHODS);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        METHODS.filter((m) => m.id !== target.id).map((m) => m.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: "Which separation method does this apparatus set-up show?",
        visual: { type: "separation-setup", method: target.id },
        choices,
        correctIndex,
        layout: "list",
        hint: "Look carefully at the apparatus shown — different methods use different set-ups (funnel and filter paper, heat source, condenser, or paper strip).",
        explanation: `This shows ${target.label}: ${target.desc}.`,
      };
    }

    if (branch === "mixture-method-match") {
      const chosen = shuffle(rng, MIXTURE_EXAMPLES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c, i) => ({ id: `m${i}`, label: c.mixture })));
      const targets = shuffle(rng, chosen.map((c, i) => ({ id: `m${i}`, label: METHODS.find((m) => m.id === c.method)!.label })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((c, i) => (correctMap[`m${i}`] = `m${i}`));
      return {
        kind: "click-match",
        prompt: "Match each mixture to the best method for separating it.",
        tokens,
        targets,
        correctMap,
        hint: "Ask: is the useful substance dissolved, a different-coloured dye, a solid that sublimes, or an insoluble solid in a liquid?",
        explanation: chosen.map((c) => `${c.mixture} is best separated by ${METHODS.find((m) => m.id === c.method)!.label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "mixture-type-sort") {
      const chosen = shuffle(rng, MIXTURE_TYPE_ITEMS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `t${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`t${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each mixture as homogeneous or heterogeneous.",
        items,
        buckets: [
          { id: "homogeneous", label: "Homogeneous" },
          { id: "heterogeneous", label: "Heterogeneous" },
        ],
        correctBucket,
        hint: "A homogeneous mixture looks uniform throughout — you cannot see its separate parts.",
        explanation: chosen.map((c) => `"${c.text}" is ${c.bucket}.`).join(" "),
      };
    }

    const q = randChoice(rng, APPLICATION_TEMPLATES)(rng);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      layout: "list",
      hint: "Ask whether the useful substance is dissolved, a coloured dye, a solid that sublimes, or an insoluble solid in a liquid.",
      explanation: q.explanation,
    };
  },
};
