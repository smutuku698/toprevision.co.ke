import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Fishing in Kenya" — 5 named inland fishing
// grounds (Lake Victoria, Lake Turkana, Lake Naivasha, River Tana, River Athi).
// See curriculum-reference/grade-5/social-studies.json.

const GROUNDS: { id: string; ground: string; type: "LAKE" | "RIVER"; fact: string }[] = [
  { id: "victoria", ground: "Lake Victoria", type: "LAKE", fact: "Kenya's largest and most productive inland fishing ground, known for Nile perch, tilapia and omena/dagaa" },
  { id: "turkana", ground: "Lake Turkana", type: "LAKE", fact: "the world's largest permanent desert lake, an important fishing ground for Nile perch and tilapia" },
  { id: "naivasha", ground: "Lake Naivasha", type: "LAKE", fact: "a freshwater lake known especially for tilapia fishing" },
  { id: "tana", ground: "River Tana", type: "RIVER", fact: "Kenya's longest river, which supports smaller-scale inland fishing" },
  { id: "athi", ground: "River Athi", type: "RIVER", fact: "a river (also called the Galana further downstream) that supports smaller-scale inland fishing" },
];

const CONTRIBUTIONS = [
  "provides food and protein for many families",
  "creates jobs for fishermen and fish traders",
  "earns income through selling fish at markets",
  "supports Kenya's export income through fish sales",
  "supports communities living around lakes and rivers",
  "provides raw material for the fish-processing industry",
] as const;

export const fishingInKenya: Skill = {
  id: "g5-ss-res-fishing-in-kenya",
  code: "R.3",
  subjectId: "social-studies",
  strandId: "g5-ss-resources",
  grade: 5,
  title: "Fishing in Kenya",
  description: "Identifying Kenya's main inland fishing grounds and the contribution of fishing to the economy.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const g = randChoice(rng, GROUNDS);
      const choices = shuffle(rng, GROUNDS.map((x) => x.ground));
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "fishing ground")} It is ${g.fact}.`,
        choices,
        correctIndex: choices.indexOf(g.ground),
        hint: "Think about which lake or river matches this fact.",
        explanation: `${g.ground} is ${g.fact}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, GROUNDS).slice(0, 4);
      const tokens = chosen.map((g) => ({ id: g.id, label: g.ground }));
      const targets = shuffle(rng, chosen).map((g) => ({ id: g.id, label: g.fact.charAt(0).toUpperCase() + g.fact.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const g of chosen) correctMap[g.id] = g.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "fishing ground to a fact about it"),
        tokens,
        targets,
        correctMap,
        hint: "Recall a distinguishing fact about each fishing ground.",
        explanation: chosen.map((g) => `${g.ground}: ${g.fact}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = GROUNDS.map((g) => ({ id: g.id, label: g.ground }));
      const shuffled = shuffle(rng, items);
      const correctBucket: Record<string, string> = {};
      for (const g of GROUNDS) correctBucket[g.id] = g.type;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether the fishing ground is a lake or a river"),
        items: shuffled,
        buckets: [
          { id: "LAKE", label: "Lake" },
          { id: "RIVER", label: "River" },
        ],
        correctBucket,
        hint: "Lake Victoria, Lake Turkana and Lake Naivasha are lakes; River Tana and River Athi are rivers.",
        explanation: GROUNDS.map((g) => `${g.ground} is a ${g.type === "LAKE" ? "lake" : "river"}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const g = randChoice(rng, GROUNDS);
      const c = randChoice(rng, CONTRIBUTIONS);
      const templates = [
        () => ({ before: "Kenya's largest and most productive inland fishing ground is", after: ".", correct: "Lake Victoria" }),
        () => ({ before: "The world's largest permanent desert lake, also an important fishing ground, is", after: ".", correct: "Lake Turkana" }),
        () => ({ before: `${g.ground} is especially known for`, after: ".", correct: g.type === "LAKE" ? "fishing" : "smaller-scale fishing" }),
        () => ({ before: `One way fishing contributes to Kenya's economy is that it`, after: ".", correct: c }),
        () => ({ before: "Kenya's longest river, which also supports fishing, is", after: ".", correct: "River Tana" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the 5 fishing grounds: Lake Victoria, Lake Turkana, Lake Naivasha, River Tana, River Athi.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "catch", label: "Fishermen catch the fish" },
      { id: "sort", label: "The fish is sorted and cleaned" },
      { id: "transport", label: "The fish is transported to market" },
      { id: "sell", label: "The fish is sold to buyers" },
    ]);
    const correctOrder = ["catch", "sort", "transport", "sell"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps of the fishing-to-market process"),
      instruction: "Arrange the steps in the order they would happen.",
      items: steps,
      correctOrder,
      hint: "It starts with catching the fish and ends with selling it.",
      explanation: "Fishing to market: fishermen catch the fish, it is sorted and cleaned, transported, then sold.",
    };
  },
};
