import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, type ScenarioMC } from "./g6AgShared";

// KICD Grade 6 Agriculture C.1 "Controlling Soil Erosion" names exactly four erosion types
// (gulley, rill, splash and sheet erosion) as its enumerated content pool — all four are
// implemented below. The source text says only "demonstrate how to control various types of
// soil erosion" without naming specific control techniques, so the control methods used here
// (terracing, contour farming, mulching, cover crops, gabions/check dams, grassed waterways,
// diversion channels, afforestation) are standard, real KICD-aligned soil-conservation methods,
// not invented ones — flagged per the task brief for spot-checking.

type ErosionId = "splash" | "sheet" | "rill" | "gulley";

const EROSION_TYPES: {
  id: ErosionId;
  label: string;
  visualKind: "gulley" | "rill" | "splash" | "sheet";
  definition: string;
  severityRank: number; // 1 = mildest/first stage, 4 = most severe/advanced stage
}[] = [
  {
    id: "splash",
    label: "Splash erosion",
    visualKind: "splash",
    definition: "the direct impact of falling raindrops dislodging and scattering loose soil particles on bare ground — the first, mildest stage that starts the erosion process",
    severityRank: 1,
  },
  {
    id: "sheet",
    label: "Sheet erosion",
    visualKind: "sheet",
    definition: "the uniform removal of a thin layer of topsoil evenly across a whole sloping field, often unnoticed until the soil looks paler and less fertile",
    severityRank: 2,
  },
  {
    id: "rill",
    label: "Rill erosion",
    visualKind: "rill",
    definition: "water cutting several small, narrow, finger-like channels into a slope — still shallow enough to be smoothed out by normal ploughing if caught early",
    severityRank: 3,
  },
  {
    id: "gulley",
    label: "Gulley erosion",
    visualKind: "gulley",
    definition: "one or more large, deep channels or trenches cut into the land, too big to plough over — the most severe and advanced stage, formed when rills are left uncontrolled",
    severityRank: 4,
  },
];

function erosionOf(id: ErosionId) {
  return EROSION_TYPES.find((e) => e.id === id)!;
}

// ---- Fact bank: 40 facts (10 per erosion type) — feeds the categorize branch and the
// fill-blank branch, both well above the Grade-6 30-item pool floor. ----
const CONTROL_FACTS: { text: string; type: ErosionId }[] = [
  // splash
  { text: "Caused directly by the impact of falling raindrops hitting bare soil", type: "splash" },
  { text: "The first and mildest stage in the soil erosion process", type: "splash" },
  { text: "Dislodges and scatters loose soil particles into the air", type: "splash" },
  { text: "Controlled by mulching the soil surface with crop residue or dry grass", type: "splash" },
  { text: "Controlled by maintaining a leafy cover crop that intercepts raindrops before they hit the ground", type: "splash" },
  { text: "Reduced by agroforestry trees whose canopy breaks the fall of raindrops", type: "splash" },
  { text: "Worsened when land is left completely bare at the start of the rainy season", type: "splash" },
  { text: "Barely visible on its own, but it is what starts the whole erosion process", type: "splash" },
  { text: "Prevented by keeping crop residue on the field after harvest instead of burning it", type: "splash" },
  { text: "Reduced by planting low, spreading cover crops such as sweet potato vines", type: "splash" },
  // sheet
  { text: "Removes a thin, even layer of topsoil across a whole sloping field", type: "sheet" },
  { text: "Often goes unnoticed until the topsoil becomes pale and less fertile", type: "sheet" },
  { text: "Controlled by contour ploughing — ploughing across the slope, not up and down it", type: "sheet" },
  { text: "Controlled by strip cropping — alternating strips of different crops along the contour", type: "sheet" },
  { text: "Reduced by maintaining continuous vegetation cover on sloping land", type: "sheet" },
  { text: "Controlled by terracing a gently sloping field", type: "sheet" },
  { text: "Worsened on fields that are ploughed straight up and down the slope", type: "sheet" },
  { text: "Reduced by mulching with crop residue to slow the flow of surface water", type: "sheet" },
  { text: "Controlled by planting grass strips along the contour to trap moving soil", type: "sheet" },
  { text: "Causes the uniform loss of the most fertile topsoil layer over a whole field", type: "sheet" },
  // rill
  { text: "Cuts several small, narrow, finger-like channels into a sloping field", type: "rill" },
  { text: "Can still be smoothed out and repaired by normal ploughing if caught early", type: "rill" },
  { text: "Controlled by constructing contour bunds or low ridges across the slope", type: "rill" },
  { text: "Controlled by digging grassed waterways to safely channel running water", type: "rill" },
  { text: "Worsened when water is allowed to flow down the same path repeatedly", type: "rill" },
  { text: "Controlled by cut-off drains that divert water away from the cultivated slope", type: "rill" },
  { text: "A middle stage between mild sheet erosion and severe gulley erosion", type: "rill" },
  { text: "Reduced by terracing the slope into smaller, gentler sections", type: "rill" },
  { text: "Controlled by timely tillage that breaks up the small channels before they deepen", type: "rill" },
  { text: "Forms narrow channels usually only a few centimetres deep", type: "rill" },
  // gulley
  { text: "Forms one or more large, deep channels or trenches cut into the land", type: "gulley" },
  { text: "The most severe and advanced stage of soil erosion", type: "gulley" },
  { text: "Too deep and wide to be repaired by ordinary ploughing", type: "gulley" },
  { text: "Controlled by building check dams or gabions across the channel", type: "gulley" },
  { text: "Controlled by planting grass and trees on the gulley walls and floor to stabilise them", type: "gulley" },
  { text: "Controlled by constructing diversion channels to redirect water away from the gulley head", type: "gulley" },
  { text: "Reduced by terracing the surrounding slope to slow water reaching the gulley", type: "gulley" },
  { text: "Can swallow up large areas of productive farmland if left unchecked", type: "gulley" },
  { text: "Controlled by afforestation of the wider catchment area feeding the gulley", type: "gulley" },
  { text: "Forms when rill channels are left uncontrolled and continue to deepen and widen", type: "gulley" },
];

// ---- Reasoning (Apply/Analyze) pool: 16 symptom facts x 2 frames = 32 templates ----
const SYMPTOM_FACTS: { text: string; type: ErosionId }[] = [
  { text: "small soil particles have been knocked loose and scattered around the base of young maize plants after a heavy downpour", type: "splash" },
  { text: "the surface of a newly ploughed, completely bare plot shows tiny craters where raindrops have struck directly", type: "splash" },
  { text: "soil crumbs have splattered onto the leaves of low-growing vegetables during a storm", type: "splash" },
  { text: "a bare seedbed shows scattered soil particles thrown a few centimetres from where raindrops fell", type: "splash" },
  { text: "the whole sloping field looks slightly paler than last season, as if a thin layer of topsoil has simply vanished", type: "sheet" },
  { text: "fertility is declining evenly across a whole slope, with no channels or gulleys visible anywhere", type: "sheet" },
  { text: "after several seasons of straight up-and-down ploughing, the whole slope's topsoil looks thinner but still fairly even", type: "sheet" },
  { text: "muddy water flows evenly off the whole surface of a sloping, bare field during rain, without forming any channels", type: "sheet" },
  { text: "several narrow, finger-like channels a few centimetres deep have appeared across a sloping field, though they could still be ploughed over", type: "rill" },
  { text: "small trickling channels have formed where water repeatedly follows the same path down a slope after each rainstorm", type: "rill" },
  { text: "a field ploughed up and down the slope, rather than across it, has developed a series of small parallel channels", type: "rill" },
  { text: "shallow grooves have cut into the topsoil in several places on a slope, easily smoothed with the next round of tillage", type: "rill" },
  { text: "a deep trench, too wide and deep to plough over, has cut through the middle of a sloping shamba", type: "gulley" },
  { text: "a channel that started as small rills has widened and deepened over several seasons into a large ditch swallowing farmland", type: "gulley" },
  { text: "a large, permanent channel has formed at the base of a slope, exposing bare rock and subsoil", type: "gulley" },
  { text: "heavy rains have carved a deep, wide trench into an unprotected hillside, and it keeps growing wider each season", type: "gulley" },
];

const REASONING_FRAMES: ((rng: RNG, fact: { text: string; type: ErosionId }) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    const e = erosionOf(fact.type);
    return {
      prompt: `${who}, a farmer near ${p}, notices that ${fact.text}. Which type of soil erosion is this?`,
      correct: e.label,
      wrong: EROSION_TYPES.filter((t) => t.id !== e.id).map((t) => t.label),
      explanation: `This is ${e.label.toLowerCase()} — ${e.definition}.`,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    const e = erosionOf(fact.type);
    return {
      prompt: `During a school field trip near ${p}, ${who} observes that ${fact.text} on a nearby farm. Which erosion type does this describe?`,
      correct: e.label,
      wrong: EROSION_TYPES.filter((t) => t.id !== e.id).map((t) => t.label),
      explanation: `This is ${e.label.toLowerCase()} — ${e.definition}.`,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    const e = erosionOf(fact.type);
    return {
      prompt: `On a sloping shamba near ${p}, ${fact.text}. What is happening to the soil here?`,
      correct: e.label,
      wrong: EROSION_TYPES.filter((t) => t.id !== e.id).map((t) => t.label),
      explanation: `This is ${e.label.toLowerCase()} — ${e.definition}.`,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const e = erosionOf(fact.type);
    return {
      prompt: `${who} is inspecting a field and finds that ${fact.text}. Which erosion process is at work here?`,
      correct: e.label,
      wrong: EROSION_TYPES.filter((t) => t.id !== e.id).map((t) => t.label),
      explanation: `This is ${e.label.toLowerCase()} — ${e.definition}.`,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    const e = erosionOf(fact.type);
    const text = fact.text.charAt(0).toUpperCase() + fact.text.slice(1);
    return {
      prompt: `${text}, on a farm near ${p}. What stage of soil loss does this show?`,
      correct: e.label,
      wrong: EROSION_TYPES.filter((t) => t.id !== e.id).map((t) => t.label),
      explanation: `This is ${e.label.toLowerCase()} — ${e.definition}.`,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    const e = erosionOf(fact.type);
    return {
      prompt: `While helping out on a relative's land near ${p}, ${who} sees that ${fact.text}. Name the erosion type being described.`,
      correct: e.label,
      wrong: EROSION_TYPES.filter((t) => t.id !== e.id).map((t) => t.label),
      explanation: `This is ${e.label.toLowerCase()} — ${e.definition}.`,
    };
  },
];

const REASONING_TEMPLATES = expandScenarios(SYMPTOM_FACTS, REASONING_FRAMES);

// ---- Evaluate pool (Critical thinking and problem solving is C.1's named core competency,
// so this Analyze/Evaluate branch is mandatory, not optional): 16 constraint scenarios x 2
// frames = 32 templates. ----
interface ConstraintFact {
  situation: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const CONSTRAINT_FACTS: ConstraintFact[] = [
  {
    situation: "a gulley has already grown several metres deep and cattle keep falling into it, needing urgent action",
    correct: "Build check dams or gabions across the gulley to slow the water and start stabilising it immediately",
    wrong: [
      "Ignore it, since gulleys cannot be fixed once formed",
      "Plant a cover crop on the gulley floor only, with no structure to slow the water",
      "Wait until the next dry season before doing anything",
    ],
    explanation: "Gulleys need urgent structural measures like check dams or gabions to stop the water carving deeper; vegetation alone cannot slow fast-flowing water in an active gulley, and gulleys do not repair themselves.",
  },
  {
    situation: "a farmer has very little money for construction materials, and a sloping field is showing early sheet erosion",
    correct: "Start contour ploughing and mulching with crop residue — both cost little beyond labour and reduce sheet erosion effectively",
    wrong: [
      "Build expensive gabions across the whole slope even though no gulley has formed yet",
      "Buy imported erosion-control netting, which is unnecessary for early sheet erosion",
      "Do nothing until the erosion becomes a gulley, since gulleys are easier to notice",
    ],
    explanation: "Contour ploughing and mulching are low-cost, effective measures for sheet erosion; gabions are built for gulleys, and waiting only lets the problem get worse and far costlier to fix.",
  },
  {
    situation: "newly cleared land is completely bare at the very start of the rains, at highest risk of splash erosion",
    correct: "Cover the soil quickly with mulch or a fast-growing cover crop before the heavy rains begin",
    wrong: [
      "Leave the soil bare so it can 'harden' naturally before planting",
      "Plough it repeatedly to loosen it further, since loose soil erodes less",
      "Wait until after the rainy season to protect the soil",
    ],
    explanation: "Splash erosion is caused directly by raindrops hitting bare soil, so covering it with mulch or a cover crop before the rains is the correct, timely response — loosening bare soil further makes splash erosion worse, not better.",
  },
  {
    situation: "rills have formed on a slope that is ploughed up and down instead of across",
    correct: "Change ploughing direction to follow the contour and build contour bunds to stop the channels deepening",
    wrong: [
      "Keep ploughing up and down since that is the traditional method",
      "Fill the rills with more loose soil without changing the ploughing direction",
      "Ignore the rills since they are barely visible",
    ],
    explanation: "Up-and-down ploughing is exactly what lets water concentrate into rill channels; switching to contour ploughing and adding contour bunds addresses the actual cause, not just the symptom.",
  },
  {
    situation: "a gulley's catchment area upstream is also bare and still contributing extra water into it",
    correct: "Combine gulley-floor stabilisation (grass or check dams) with afforestation of the wider catchment area feeding it",
    wrong: [
      "Only plant grass inside the gulley and ignore the land feeding water into it",
      "Only fix the catchment area and leave the gulley itself untouched",
      "Fence off the gulley and consider the problem solved",
    ],
    explanation: "A gulley kept fed by an unprotected catchment will keep growing even if its own floor is stabilised, so both the gulley and its catchment need attention together.",
  },
  {
    situation: "a farmer wants a long-term solution to sheet erosion on a large sloping farm, not just a quick fix",
    correct: "Construct terraces along the slope combined with contour farming for a lasting solution",
    wrong: [
      "Apply mulch once and expect it to protect the soil permanently without repeating it",
      "Rely only on a single planting of cover crop with no other measures",
      "Focus only on the steepest part of the slope and ignore the rest",
    ],
    explanation: "Terracing combined with contour farming provides a durable, whole-slope solution; a one-off mulching or a single cover crop planting will not last, and erosion can still occur on the untreated parts of the slope.",
  },
  {
    situation: "community grazing land is heavily used by livestock and is showing splash and early sheet erosion",
    correct: "Reduce overgrazing and reintroduce grass cover, since bare, trampled ground is most exposed to raindrop impact and sheet loss",
    wrong: [
      "Increase the number of livestock to trample the soil firm",
      "Plough the grazing land to loosen the compacted soil",
      "Ignore it since grazing land does not erode the same way as cropland",
    ],
    explanation: "Overgrazing strips away the grass cover that protects soil from raindrop impact and sheet loss, so reducing grazing pressure and restoring grass cover addresses the real cause.",
  },
  {
    situation: "a steep hillside near a river has had rill erosion ignored for several seasons and is close to becoming a gulley",
    correct: "Act now with contour bunds and grassed waterways before the rills deepen into a gulley that is far harder to fix",
    wrong: [
      "Wait since rills are not yet a serious problem",
      "Plant crops directly in the rill channels to fill them naturally",
      "Only address the problem once it becomes a full gulley",
    ],
    explanation: "Rills are the last stage that is still easy to control; acting now with contour bunds and grassed waterways is far cheaper and easier than waiting until a gulley forms.",
  },
  {
    situation: "a farmer with limited land wants an erosion-control method that does not reduce the cropping area much",
    correct: "Use strip cropping and contour farming, which control erosion while the land stays in production",
    wrong: [
      "Convert the entire sloping field to permanent grass, losing all cropping area",
      "Terrace the whole field immediately regardless of the cost or labour available",
      "Leave part of the field fallow with no crop or ground cover at all",
    ],
    explanation: "Strip cropping and contour farming control sheet and rill erosion while most of the field stays productive, unlike converting the whole field to grass or leaving it bare and unprotected.",
  },
  {
    situation: "a farmer near a seasonal river is worried a gulley's diversion channel could flood a neighbour's land",
    correct: "Design the diversion channel carefully with the neighbour's land in mind, directing water to a safe, agreed drainage point",
    wrong: [
      "Divert the water directly onto the neighbour's field without discussion",
      "Ignore the neighbour's land and only worry about the gulley itself",
      "Block the water completely with no outlet at all, causing flooding",
    ],
    explanation: "A responsibly designed diversion channel protects the gulley site without simply pushing the water problem onto someone else's land, which would just move the damage elsewhere.",
  },
  {
    situation: "a demonstration plot is comparing which single measure best controls splash erosion specifically, not sheet or rill",
    correct: "Mulching directly protects bare soil from raindrop impact, which is exactly what causes splash erosion",
    wrong: [
      "Terracing, which mainly addresses longer slopes rather than raindrop impact directly",
      "Building check dams, which are meant for gulleys, not raindrop splash",
      "Constructing contour bunds, which mainly slow water flow rather than cushion raindrop impact",
    ],
    explanation: "Splash erosion is caused by raindrop impact on bare soil, so mulching (which physically cushions that impact) targets the cause directly, unlike measures built for water flow or deep channels.",
  },
  {
    situation: "a school garden on a gentle slope wants the cheapest effective option against sheet erosion",
    correct: "Mulch the beds and plant along the contour — low-cost options that need no construction materials",
    wrong: [
      "Build formal terraces immediately, which need more labour and materials than a school garden needs",
      "Import erosion-control fabric from outside the country",
      "Leave the garden unprotected since it is only a small area",
    ],
    explanation: "Mulching and contour planting are low-cost, effective options for a small, gently sloping garden; terracing and imported materials are unnecessary expense for this scale of problem.",
  },
  {
    situation: "a farmer's field already has grassed waterways installed but still loses topsoil evenly across the whole slope",
    correct: "Add contour ploughing and mulching to address the sheet erosion that grassed waterways alone do not stop",
    wrong: [
      "Remove the grassed waterways since they are not working",
      "Assume nothing more can be done once one measure is in place",
      "Wait for the sheet erosion to develop into a gulley before acting further",
    ],
    explanation: "Grassed waterways mainly manage concentrated water flow (as in rills), not the even sheet loss across a whole slope, so an additional measure like contour ploughing or mulching is still needed.",
  },
  {
    situation: "community members want one measure that helps against both rill and gulley erosion on the same slope",
    correct: "Terracing the slope reduces the speed and volume of water that drives both rill deepening and gulley formation",
    wrong: [
      "Mulching alone, which mainly helps against splash and sheet erosion, not deep channels",
      "Ignoring rills since only gulleys are considered serious",
      "Only fencing off the area without any structural or vegetative measure",
    ],
    explanation: "Terracing slows and shortens the flow of water down a slope, which reduces the erosive force behind both rill deepening and gulley formation, unlike mulching which targets a different stage of erosion.",
  },
  {
    situation: "a farmer has already lost part of a field to a gulley and wants to stop it spreading into the remaining good land",
    correct: "Build a diversion channel above the gulley head to stop more water entering it, alongside stabilising the existing gulley",
    wrong: [
      "Plant crops right up to the edge of the gulley to 'use every inch' of remaining land",
      "Ignore the gulley head since the damage there is already done",
      "Fill the gulley completely with loose soil with no other control measure",
    ],
    explanation: "A gulley keeps growing at its head if water keeps flowing into it, so a diversion channel above the head, combined with stabilising the gulley itself, is needed to stop it spreading further.",
  },
  {
    situation: "a new extension officer is advising a village on which erosion types need urgent built (structural) measures versus planted (vegetative) ones",
    correct: "Gulleys generally need structural measures like check dams first, while splash and sheet erosion can often be controlled with vegetative measures like mulching and cover crops",
    wrong: [
      "All four erosion types need exactly the same structural measures",
      "Vegetative measures alone are always enough, even for deep gulleys",
      "Structural measures alone are always enough, even for simple splash erosion",
    ],
    explanation: "The right response depends on severity: deep gulleys need structural measures to stop fast water first, while milder splash and sheet erosion can often be controlled with cheaper vegetative measures like mulch and cover crops.",
  },
];

const EVALUATE_FRAMES: ((rng: RNG, fact: ConstraintFact) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who} farms near ${p}, where ${fact.situation}. What is the best course of action?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.explanation,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    return {
      prompt: `On a farm near ${p}, ${fact.situation}. Which response is the most appropriate?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.explanation,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who} has to make a decision: ${fact.situation}. What should ${who} do?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.explanation,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    const situation = fact.situation.charAt(0).toUpperCase() + fact.situation.slice(1);
    return {
      prompt: `${situation}, on land near ${p}. Which choice actually solves the problem?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.explanation,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `An extension officer visiting ${who}'s farm near ${p} finds that ${fact.situation}. What advice fits best?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.explanation,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `Given that ${fact.situation}, what should ${who} prioritise?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.explanation,
    };
  },
];

const EVALUATE_TEMPLATES = expandScenarios(CONSTRAINT_FACTS, EVALUATE_FRAMES);

const IDENTIFY_PROMPTS = [
  "Identify this type of soil erosion.",
  "Which type of soil erosion is shown here?",
  "Name the erosion type shown in this image.",
  "Look at the image and identify the erosion type.",
  "What type of soil erosion does this picture show?",
  "Study the picture and name this erosion type.",
];

const DEFINITION_MATCH_PROMPTS = [
  "Match each type of soil erosion to its description.",
  "Pair each erosion type with the description that explains it.",
  "Connect each erosion type to the statement that describes it.",
  "Match each soil erosion term to its correct meaning.",
  "Link each erosion type to the description that fits it.",
  "Match each erosion type below to its correct explanation.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each fact by the type of soil erosion it describes.",
  "Group these facts under the correct erosion type.",
  "Decide which erosion type each fact below relates to, and sort it there.",
  "Sort each statement into the erosion type it best fits.",
  "Place each fact into the bucket for the erosion type it describes.",
  "Read each fact and sort it under the matching erosion type.",
];

const SEVERITY_ORDER_PROMPTS = [
  "If left uncontrolled, erosion gets worse over time. Arrange these erosion types from least to most severe.",
  "Put these erosion types in order, from the mildest stage to the most severe.",
  "Sequence these erosion types from where the process starts to where it ends up if ignored.",
  "Arrange these erosion types in the order they develop, from least to most damaging.",
  "Order these erosion types from the earliest, mildest stage to the most advanced, severe stage.",
  "Sort these erosion types from least severe to most severe.",
];

const FILL_BLANK_PROMPTS = [
  "Which type of soil erosion does this fact describe?",
  "Name the type of soil erosion this fact is about.",
  "Identify which erosion type this fact fits.",
  "This fact describes which type of soil erosion?",
  "Work out which erosion type this fact belongs to.",
  "Which of the four erosion types does this fact describe?",
];

export const controllingSoilErosion: Skill = {
  id: "g6-ag-c-controlling-soil-erosion",
  code: "C.1",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-conservation",
  grade: 6,
  title: "Controlling Soil Erosion",
  description: "Describing gulley, rill, splash and sheet erosion; controlling each type with terracing, contour farming, mulching, cover crops, gabions/check dams and afforestation; and appreciating why conserving soil matters.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["identify", "definition-match", "categorize-facts", "severity-order", "reasoning", "evaluate", "fill-blank"] as const
    );
    const hint = "Splash starts it, sheet spreads it evenly, rills cut small channels, and gulleys are the deep, hard-to-fix channels that follow if nothing is done.";

    if (branch === "identify") {
      const target = randChoice(rng, EROSION_TYPES);
      const wrong = shuffle(rng, EROSION_TYPES.filter((t) => t.id !== target.id)).map((t) => t.label);
      const choices = shuffle(rng, [target.label, ...wrong]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS),
        visual: { type: "soil-erosion", kind: target.visualKind },
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation: `This is ${target.label.toLowerCase()} — ${target.definition}.`,
      };
    }

    if (branch === "definition-match") {
      const tokens = shuffle(rng, EROSION_TYPES.map((e) => ({ id: e.id, label: e.label })));
      const targets = shuffle(rng, EROSION_TYPES.map((e) => ({ id: e.id, label: e.definition })));
      const correctMap: Record<string, string> = {};
      for (const e of EROSION_TYPES) correctMap[e.id] = e.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, DEFINITION_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: EROSION_TYPES.map((e) => `${e.label}: ${e.definition}.`).join(" "),
      };
    }

    if (branch === "categorize-facts") {
      const chosen = shuffle(rng, CONTROL_FACTS).slice(0, 10);
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: EROSION_TYPES.map((e) => ({ id: e.id, label: e.label })),
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" describes ${erosionOf(c.type).label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "severity-order") {
      const shuffled = shuffle(rng, EROSION_TYPES);
      return {
        kind: "ordering",
        prompt: randChoice(rng, SEVERITY_ORDER_PROMPTS),
        instruction: "Drag to arrange from least severe to most severe.",
        items: shuffled.map((e) => ({ id: e.id, label: e.label })),
        correctOrder: [...EROSION_TYPES].sort((a, b) => a.severityRank - b.severityRank).map((e) => e.id),
        hint: "Splash erosion starts the process; gulley erosion is the worst, most advanced stage if nothing is done.",
        explanation: "From least to most severe: Splash erosion, Sheet erosion, Rill erosion, Gulley erosion — each stage develops from the one before it if left unchecked.",
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

    if (branch === "evaluate") {
      const q = randChoice(rng, EVALUATE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about which measure actually addresses the specific problem and constraint described — not just any general erosion-control method.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, CONTROL_FACTS);
    const e = erosionOf(fb.type);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: `"${fb.text}" — this describes `,
      after: " erosion.",
      correctAnswer: fb.type,
      acceptedAnswers: [fb.type, e.label.toLowerCase()],
      inputMode: "text",
      hint,
      explanation: `This fact describes ${e.label.toLowerCase()} — ${e.definition}.`,
    };
  },
};
