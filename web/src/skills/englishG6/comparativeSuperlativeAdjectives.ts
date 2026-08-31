import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, cap } from "./grammarSharedA";

type AdjForm = { simple: string; comparative: string; superlative: string; regular: boolean };
// 16 adjectives — regular (-er/-est) and irregular forms, matching the theme's own "regular and
// irregular adjectives" learning experience.
const ADJECTIVES: AdjForm[] = [
  { simple: "tall", comparative: "taller", superlative: "tallest", regular: true },
  { simple: "short", comparative: "shorter", superlative: "shortest", regular: true },
  { simple: "fast", comparative: "faster", superlative: "fastest", regular: true },
  { simple: "big", comparative: "bigger", superlative: "biggest", regular: true },
  { simple: "small", comparative: "smaller", superlative: "smallest", regular: true },
  { simple: "hot", comparative: "hotter", superlative: "hottest", regular: true },
  { simple: "cold", comparative: "colder", superlative: "coldest", regular: true },
  { simple: "beautiful", comparative: "more beautiful", superlative: "most beautiful", regular: true },
  { simple: "interesting", comparative: "more interesting", superlative: "most interesting", regular: true },
  { simple: "expensive", comparative: "more expensive", superlative: "most expensive", regular: true },
  { simple: "crowded", comparative: "more crowded", superlative: "most crowded", regular: true },
  { simple: "good", comparative: "better", superlative: "best", regular: false },
  { simple: "bad", comparative: "worse", superlative: "worst", regular: false },
  { simple: "far", comparative: "farther", superlative: "farthest", regular: false },
  { simple: "little", comparative: "less", superlative: "least", regular: false },
  { simple: "many", comparative: "more", superlative: "most", regular: false },
];

// Kenyan-context comparison scenarios — three places/animals/things compared, matching the theme's
// tourist-attractions framing.
const COMPARE_SCENARIOS: { adj: AdjForm; sentence: (a: string, b: string, c: string) => string; degree: "comparative" | "superlative" }[] = [
  { adj: ADJECTIVES[0], sentence: (a, b) => `Mount Kenya is ___ than the hill near ${b}.`, degree: "comparative" },
  { adj: ADJECTIVES[0], sentence: (a, b, c) => `Of the three mountains near ${a}, ${b} and ${c}, Mount Kenya is the ___.`, degree: "superlative" },
  { adj: ADJECTIVES[2], sentence: (a) => `The cheetah runs ___ than the zebra at the national park near ${a}.`, degree: "comparative" },
  { adj: ADJECTIVES[2], sentence: () => `Of all the animals in the park, the cheetah is the ___.`, degree: "superlative" },
  { adj: ADJECTIVES[3], sentence: () => `The elephant is ___ than the buffalo.`, degree: "comparative" },
  { adj: ADJECTIVES[3], sentence: () => `The elephant is the ___ animal in the game reserve.`, degree: "superlative" },
  { adj: ADJECTIVES[7], sentence: (a, b) => `The beach at ${a} is ___ than the one at ${b}.`, degree: "comparative" },
  { adj: ADJECTIVES[7], sentence: () => `Tourists say this waterfall is the ___ sight in the whole park.`, degree: "superlative" },
  { adj: ADJECTIVES[9], sentence: (a, b) => `A safari to the game reserve is ___ than a trip to the museum near ${b}.`, degree: "comparative" },
  { adj: ADJECTIVES[9], sentence: () => `The luxury lodge is the ___ hotel at the tourist attraction.`, degree: "superlative" },
  { adj: ADJECTIVES[11], sentence: (a, b) => `The tour guide near ${a} gave ___ directions than the one near ${b}.`, degree: "comparative" },
  { adj: ADJECTIVES[11], sentence: () => `This is the ___ tour I have ever taken.`, degree: "superlative" },
  { adj: ADJECTIVES[13], sentence: (a, b) => `The snake park is ___ from the entrance than the museum near ${b}.`, degree: "comparative" },
  { adj: ADJECTIVES[13], sentence: () => `The mountain climbing trail is the ___ point from the gate.`, degree: "superlative" },
];

export const comparativeSuperlativeAdjectives: Skill = {
  id: "g6-eng-grammar-comparative-superlative",
  code: "G.5",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Comparative and Superlative Adjectives",
  description: "Identify and use simple, comparative and superlative forms of adjectives (regular and irregular) correctly in sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["form-fill", "scenario-mc", "categorize-regular", "click-match-forms", "ordering"] as const);

    if (branch === "form-fill") {
      const adj = randChoice(rng, ADJECTIVES);
      const degree = randChoice(rng, ["comparative", "superlative"] as const);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const correctForm = degree === "comparative" ? adj.comparative : adj.superlative;
      const before = degree === "comparative" ? `${name}'s bicycle is ` : `Of all the bicycles in ${place}, ${name}'s is the `;
      const after = degree === "comparative" ? ` than the old one.` : ` one.`;
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence using the ${degree} form of "${adj.simple}".`,
        before,
        after,
        correctAnswer: correctForm,
        inputMode: "text",
        hint: adj.regular ? `Regular adjectives add "-er"/"-est" (or "more"/"most" for longer words).` : `"${adj.simple}" is an irregular adjective — its forms don't follow the usual pattern.`,
        explanation: `The ${degree} form of "${adj.simple}" is "${correctForm}".`,
      };
    }

    if (branch === "scenario-mc") {
      const scenario = randChoice(rng, COMPARE_SCENARIOS);
      const places = shuffle(rng, KENYAN_PLACES).slice(0, 3);
      const full = scenario.sentence(places[0], places[1], places[2]);
      const correct = scenario.degree === "comparative" ? scenario.adj.comparative : scenario.adj.superlative;
      const wrongDegree = scenario.degree === "comparative" ? scenario.adj.superlative : scenario.adj.comparative;
      const distractors = shuffle(rng, [wrongDegree, scenario.adj.simple, `most ${scenario.adj.simple}er`]).slice(0, 3);
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which word correctly completes this sentence?\n"${full.replace("___", "____")}"`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "row",
        hint: scenario.degree === "comparative" ? "This sentence compares exactly two things." : "This sentence compares three or more things and picks the extreme.",
        explanation: `"${correct}" is correct — it is the ${scenario.degree} form of "${scenario.adj.simple}", used because ${scenario.degree === "comparative" ? "exactly two things are being compared" : "the sentence picks out one from three or more"}.`,
      };
    }

    if (branch === "categorize-regular") {
      const pool = shuffle(rng, ADJECTIVES).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const a of pool) correctBucket[a.simple] = a.regular ? "regular" : "irregular";
      return {
        kind: "categorize",
        prompt: "Sort these adjectives: is their comparative/superlative form REGULAR (-er/-est or more/most), or IRREGULAR (a special form)?",
        items: pool.map((a) => ({ id: a.simple, label: `${a.simple} → ${a.comparative} → ${a.superlative}` })),
        buckets: [
          { id: "regular", label: "Regular" },
          { id: "irregular", label: "Irregular" },
        ],
        correctBucket,
        hint: "Regular forms follow the -er/-est pattern (or more/most); irregular forms are special words to memorise.",
        explanation: "Irregular adjectives: good→better→best, bad→worse→worst, far→farther→farthest, little→less→least, many→more→most. All others shown are regular.",
      };
    }

    if (branch === "click-match-forms") {
      const pool = shuffle(rng, ADJECTIVES).slice(0, 6);
      const tokens = shuffle(rng, pool.map((a) => ({ id: a.simple, label: a.simple })));
      const targets = shuffle(rng, pool.map((a) => ({ id: a.simple, label: `${a.comparative} / ${a.superlative}` })));
      const correctMap: Record<string, string> = {};
      for (const a of pool) correctMap[a.simple] = a.simple;
      return {
        kind: "click-match",
        prompt: "Match each simple adjective to its comparative and superlative forms.",
        tokens,
        targets,
        correctMap,
        hint: "Some pairs are regular (-er/-est), others are irregular — memorise the irregular ones.",
        explanation: pool.map((a) => `"${a.simple}" → "${a.comparative}" → "${a.superlative}".`).join(" "),
      };
    }

    const scenario = randChoice(rng, COMPARE_SCENARIOS.filter((s) => s.degree === "comparative"));
    const places = shuffle(rng, KENYAN_PLACES).slice(0, 3);
    const full = scenario.sentence(places[0], places[1], places[2]).replace("___", scenario.adj.comparative).replace(".", "");
    const words = full.split(" ");
    const orderItems = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Arrange these words to form a correct comparative sentence.",
      instruction: "Click the words in the correct order.",
      items: shuffle(rng, orderItems),
      correctOrder: orderItems.map((i) => i.id),
      hint: `"${scenario.adj.comparative}" is used to compare exactly two things, usually followed by "than".`,
      explanation: `The correct sentence is: "${cap(full)}."`,
    };
  },
};
