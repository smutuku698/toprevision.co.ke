import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 2.1 Growing Vegetables — nursery bed gardening practices (container or
// ground nursery), caring for seedlings before and after transplanting, and the importance of vegetables for
// healthy meals. See curriculum-reference/grade-5/agriculture.json.

const NURSERY_TYPES = [
  { id: "container", label: "Container nursery", def: "Growing seedlings in a container such as a box, tray or old tin filled with soil" },
  { id: "ground", label: "Ground nursery", def: "Growing seedlings in a specially prepared bed of soil directly in the ground" },
] as const;

const CARE_PRACTICES = [
  { text: "Watering the nursery bed gently and regularly so the soil stays moist", good: true },
  { text: "Placing the nursery bed where it gets appropriate sunlight", good: true },
  { text: "Weeding the nursery bed regularly to remove competing plants", good: true },
  { text: "Handling seedlings gently by the leaves, not the delicate stem, when transplanting", good: true },
  { text: "Watering transplanted seedlings soon after transplanting to help them settle", good: true },
  { text: "Leaving the nursery bed completely unwatered for many days", good: false },
  { text: "Transplanting seedlings by yanking them roughly out of the soil", good: false },
  { text: "Letting weeds grow thickly over the young seedlings", good: false },
  { text: "Transplanting seedlings in the hottest part of a very sunny afternoon", good: false },
] as const;

const TRANSPLANT_STEPS = [
  { id: "t1", label: "Water the nursery bed well before removing seedlings, so soil clings to the roots" },
  { id: "t2", label: "Carefully lift each seedling out, keeping as much soil around the roots as possible" },
  { id: "t3", label: "Dig a planting hole in the new bed for each seedling" },
  { id: "t4", label: "Place the seedling in the hole and firm the soil gently around it" },
  { id: "t5", label: "Water the transplanted seedling immediately" },
  { id: "t6", label: "Continue to care for the seedling by watering and weeding regularly" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sows kale seeds into an old wooden box filled with soil, kept on the veranda. What kind of nursery is this?`,
      correct: "Container nursery",
      wrong: ["Ground nursery", "Neither — boxes cannot be used as a nursery at all", "Both types at once"],
      explanation: "Sowing seeds into a container such as a box, tray or tin is a container nursery, as opposed to a bed prepared directly in the ground.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} prepares a small bed of soil directly on the ground, sows spinach seeds into it, and cares for the seedlings there before transplanting. What kind of nursery is this?`,
    correct: "Ground nursery",
    wrong: ["Container nursery", "Neither — this is not a nursery at all", "A transplanting bed, not a nursery"],
    explanation: "A specially prepared bed of soil in the ground is a ground nursery, as distinct from growing seedlings in a container.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} waters a nursery bed thoroughly the evening before transplanting seedlings the next morning. Why does this help?`,
      correct: "Moist soil clings to the roots better, making it easier to lift seedlings with less root damage",
      wrong: ["Watering the evening before has no effect on transplanting", "Dry soil always transplants more successfully than moist soil", "Watering the night before makes the seedlings weaker"],
      explanation: "Watering before transplanting keeps soil moist so it holds together around the roots, reducing root damage during lifting.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} transplants tomato seedlings at midday under strong, hot sun instead of waiting for a cooler time. What is the likely result?`,
    correct: "The seedlings are more likely to wilt or suffer stress from the heat right after being disturbed",
    wrong: ["The seedlings will always grow better when transplanted at midday", "Time of day has no effect on how well a seedling survives transplanting", "Midday transplanting prevents any possibility of wilting"],
    explanation: "Transplanting during the hottest, sunniest part of the day adds extra stress to already-disturbed young seedlings, making wilting more likely.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices thick weeds growing over young vegetable seedlings in a nursery bed and leaves them, thinking it doesn't matter. What is the likely consequence?`,
      correct: "The weeds compete with the seedlings for water, nutrients and light, weakening their growth",
      wrong: ["Weeds have no effect on nearby seedlings at all", "Weeds always help seedlings grow faster", "Weeds only affect fully grown plants, never seedlings"],
      explanation: "Weeds compete directly with young seedlings for water, nutrients and sunlight, so regular weeding is part of proper seedling care.",
    };
  },
  (rng) => ({
    prompt: `A school garden club in ${place(rng)} grows its own vegetables instead of buying them from the market every week. What benefit does the club's presentation highlight, based on this sub-strand's own outcomes?`,
    correct: "Vegetables grown at school provide a source of food for both people and animals, supporting healthy meals",
    wrong: ["Growing vegetables has no connection to healthy meals at all", "Vegetables are only ever used as animal feed, never human food", "Growing vegetables only matters for decoration, not nutrition"],
    explanation: "This sub-strand's own outcome is appreciating vegetables' importance in providing healthy meals — a benefit of growing your own.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} pulls seedlings roughly out of the nursery bed by grabbing and yanking their thin stems. What is wrong with this approach?`,
      correct: "Rough handling can damage or break the delicate stems and roots, harming the seedling's chance of survival",
      wrong: ["Nothing is wrong — seedlings are not damaged by rough handling", "Yanking seedlings out always improves their survival rate", "Stems cannot be damaged during transplanting at all"],
      explanation: "Seedlings should be lifted gently, keeping soil around the roots, since rough handling can damage delicate stems and roots.",
    };
  },
  (rng) => ({
    prompt: `A gardener in ${place(rng)} waters newly transplanted seedlings immediately after placing them in their new bed. What is the purpose of this immediate watering?`,
    correct: "It helps settle the soil around the roots and reduces the shock of transplanting",
    wrong: ["Immediate watering has no benefit and could be done days later just as well", "Watering immediately after transplanting always harms the seedling", "This step is purely optional with no real purpose"],
    explanation: "Watering right after transplanting helps settle soil around the roots and reduces transplant shock, helping the seedling establish.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sets up a nursery bed in ${place(rng)} in a shaded corner that gets almost no sunlight all day. What problem might this cause for the seedlings?`,
      correct: "Without appropriate sunlight, the seedlings may grow weak, thin and pale",
      wrong: ["Sunlight has no effect on how seedlings grow", "Seedlings always grow best with zero sunlight", "A shaded location always guarantees the strongest seedlings"],
      explanation: "Seedlings need appropriate sunlight to grow strong and healthy — placing a nursery bed where it gets none is likely to weaken the seedlings.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} decides to grow their own kale and spinach at home instead of relying only on bought vegetables. Besides food, what other benefit could this bring, based on general food-security reasoning in this strand?`,
    correct: "It can reduce household spending on vegetables while providing a reliable source of fresh food",
    wrong: ["It has no financial benefit of any kind", "Growing vegetables always costs more than buying them", "It removes the household's need for any other food source"],
    explanation: "Growing vegetables at home supports both food security and household finances, an appreciation this sub-strand aims to build.",
  }),
];

export const growingVegetables: Skill = {
  id: "g5-ag-food-production-growing-vegetables",
  code: "FPP.1",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-food-production",
  grade: 5,
  title: "Growing vegetables",
  description: "Gardening practices for growing vegetables, establishing a container or ground nursery bed, caring for seedlings after transplanting, and the importance of vegetables for healthy meals.",
  generate(rng) {
    const branch = randChoice(rng, ["nursery-match", "care-categorize", "transplant-order", "reasoning", "fill-blank"] as const);

    if (branch === "nursery-match") {
      const tokens = shuffle(rng, NURSERY_TYPES.map((n) => ({ id: n.id, label: n.label })));
      const targets = shuffle(rng, NURSERY_TYPES.map((n) => ({ id: n.id, label: n.def })));
      const correctMap: Record<string, string> = {};
      for (const n of NURSERY_TYPES) correctMap[n.id] = n.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "type of nursery bed to its description"),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether the seedlings are grown in a container or directly in a prepared ground bed.",
        explanation: NURSERY_TYPES.map((n) => `${n.label} — ${n.def}.`).join(" "),
      };
    }

    if (branch === "care-categorize") {
      const chosen = shuffle(rng, CARE_PRACTICES).slice(0, 7);
      const items = chosen.map((p, i) => ({ id: `c${i}`, label: p.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`c${i}`] = p.good ? "good" : "poor"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is good seedling care or poor seedling care"),
        items,
        buckets: [
          { id: "good", label: "Good seedling care" },
          { id: "poor", label: "Poor seedling care" },
        ],
        correctBucket,
        hint: "Think about watering, sunlight, weeding, and gentle handling.",
        explanation: chosen.map((p) => `"${p.text}" is ${p.good ? "good" : "poor"} seedling care.`).join(" "),
      };
    }

    if (branch === "transplant-order") {
      const shuffled = shuffle(rng, TRANSPLANT_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of transplanting a vegetable seedling"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: TRANSPLANT_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Water the nursery bed first, then lift and move each seedling, then water and continue caring for it.",
        explanation: "Correct order: " + TRANSPLANT_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "Growing seedlings in a box, tray or tin filled with soil is called a ", after: " nursery.", correctAnswer: "container" },
      { before: "Growing seedlings in a specially prepared bed directly in the soil is called a ", after: " nursery.", correctAnswer: "ground" },
      { before: "Watering the nursery bed before lifting seedlings helps soil cling to the ", after: ".", correctAnswer: "roots" },
      { before: "Seedlings should be watered ", after: " after being transplanted to help them settle.", correctAnswer: "immediately" },
      { before: "Weeds compete with young seedlings for water, light and ", after: ".", correctAnswer: "nutrients" },
      { before: "Vegetables are an important source of food for both humans and ", after: ".", correctAnswer: "animals" },
      { before: "Transplanting in the hottest part of a sunny day can cause seedlings to ", after: ".", correctAnswer: "wilt" },
      { before: "Handling seedlings gently rather than yanking them protects the delicate ", after: ".", correctAnswer: "stem", alsoAccept: ["roots"] },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    const alsoAccept: readonly string[] = "alsoAccept" in fb ? fb.alsoAccept : [];
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer, ...alsoAccept],
      inputMode: "text",
      hint: "Think about nursery beds, seedling care, and transplanting.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
