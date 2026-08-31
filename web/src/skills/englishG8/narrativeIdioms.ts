import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const IDIOMS: {
  idiom: string;
  meaning: string;
  example: string;
  fillBefore: string;
  fillAfter: string;
  category: "money" | "caution";
}[] = [
  {
    idiom: "Money doesn't grow on trees",
    meaning: "Money is limited and must be earned and spent carefully",
    example: "Mother reminded us that money doesn't grow on trees, so we should compare prices before buying.",
    fillBefore: "Mother reminded us that",
    fillAfter: ", so we should compare prices before buying.",
    category: "money",
  },
  {
    idiom: "A penny saved is a penny earned",
    meaning: "Saving money is just as valuable as earning it",
    example: "He always says a penny saved is a penny earned, so he never buys anything without checking for a discount.",
    fillBefore: "He always says",
    fillAfter: ", so he never buys anything without checking for a discount.",
    category: "money",
  },
  {
    idiom: "Get your money's worth",
    meaning: "To receive good value for the money spent",
    example: "Always compare prices and quality to make sure you get your money's worth.",
    fillBefore: "Always compare prices and quality to make sure you",
    fillAfter: ".",
    category: "money",
  },
  {
    idiom: "Cost an arm and a leg",
    meaning: "To be very expensive",
    example: "The imported shoes cost an arm and a leg, so she chose a locally made pair instead.",
    fillBefore: "The imported shoes",
    fillAfter: ", so she chose a locally made pair instead.",
    category: "money",
  },
  {
    idiom: "Buyer beware",
    meaning: "A warning that buyers should check goods carefully before purchasing",
    example: "The old trader had no return policy, so it was truly a case of buyer beware.",
    fillBefore: "The old trader had no return policy, so it was truly a case of",
    fillAfter: ".",
    category: "caution",
  },
  {
    idiom: "Don't judge a book by its cover",
    meaning: "Don't judge something's true value only by its outward appearance",
    example: "The packaging looked cheap, but don't judge a book by its cover — the product worked perfectly.",
    fillBefore: "The packaging looked cheap, but",
    fillAfter: "— the product worked perfectly.",
    category: "caution",
  },
  {
    idiom: "The ball is in your court",
    meaning: "It is now someone else's turn to act or decide",
    example: "After the shop agrees to a refund or a replacement, the ball is in your court to decide which one you want.",
    fillBefore: "After the shop agrees to a refund or a replacement,",
    fillAfter: "to decide which one you want.",
    category: "caution",
  },
  {
    idiom: "Bite the bullet",
    meaning: "To face a difficult or unpleasant situation bravely",
    example: "She had to bite the bullet and report the faulty trader to the consumer protection office.",
    fillBefore: "She had to",
    fillAfter: "and report the faulty trader to the consumer protection office.",
    category: "caution",
  },
  {
    idiom: "Cut corners",
    meaning: "To do something in the easiest or cheapest way, often sacrificing quality",
    example: "The company cut corners on safety testing, which led to a faulty product being sold.",
    fillBefore: "The company",
    fillAfter: "on safety testing, which led to a faulty product being sold.",
    category: "caution",
  },
  {
    idiom: "Break the ice",
    meaning: "To ease tension or start a conversation in an awkward situation",
    example: "A friendly greeting can break the ice before discussing a complaint with customer service.",
    fillBefore: "A friendly greeting can",
    fillAfter: "before discussing a complaint with customer service.",
    category: "caution",
  },
];

export const narrativeIdioms: Skill = {
  id: "g8-eng-w-narrative-idioms",
  code: "W.13",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Creative Narrative Composition: Idioms",
  description: "Explain the meaning of common idioms and use them correctly in a consumer-themed narrative sentence.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match", "fill", "categorize"] as const);
    const hint = "An idiom's meaning is figurative, not literal — think about the message the whole phrase is used to express.";

    if (branch === "mc") {
      const entry = randChoice(rng, IDIOMS);
      const distractors = shuffle(rng, IDIOMS.filter((i) => i.idiom !== entry.idiom))
        .slice(0, 3)
        .map((i) => i.meaning);
      const choices = shuffle(rng, [entry.meaning, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `What does the idiom "${entry.idiom}" mean?`,
        choices,
        correctIndex: choices.indexOf(entry.meaning),
        layout: "list",
        hint,
        explanation: `"${entry.idiom}" means: ${entry.meaning}. For example: "${entry.example}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, IDIOMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((i) => ({ id: i.idiom, label: i.idiom })));
      const targets = shuffle(rng, chosen.map((i) => ({ id: i.idiom, label: i.meaning })));
      const correctMap: Record<string, string> = {};
      for (const i of chosen) correctMap[i.idiom] = i.idiom;
      return {
        kind: "click-match",
        prompt: "Match each idiom to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((i) => `"${i.idiom}" means: ${i.meaning}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, IDIOMS);
      const idiomLower = entry.idiom.charAt(0).toLowerCase() + entry.idiom.slice(1);
      return {
        kind: "fill-blank",
        prompt: "Fill in the idiom that correctly completes this narrative sentence.",
        before: entry.fillBefore,
        after: entry.fillAfter,
        correctAnswer: idiomLower,
        acceptedAnswers: [idiomLower, entry.idiom],
        inputMode: "text",
        hint: `This idiom means: ${entry.meaning}`,
        explanation: `The complete sentence is: "${entry.example}" — "${entry.idiom}" means: ${entry.meaning}`,
      };
    }

    const money = shuffle(rng, IDIOMS.filter((i) => i.category === "money")).slice(0, 3);
    const caution = shuffle(rng, IDIOMS.filter((i) => i.category === "caution")).slice(0, 3);
    const items = shuffle(rng, [...money, ...caution]).map((i, idx) => ({ id: `i${idx}`, label: i.idiom, category: i.category }));
    const correctBucket: Record<string, string> = {};
    for (const it of items) correctBucket[it.id] = it.category;
    return {
      kind: "categorize",
      prompt: "Sort each idiom into Money & value or Caution & effort.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "money", label: "Money & value" },
        { id: "caution", label: "Caution & effort" },
      ],
      correctBucket,
      hint: "Money & value idioms are about earning, saving, or spending wisely. Caution & effort idioms are about being careful, brave, or making a decision.",
      explanation: `Money & value: ${money.map((m) => m.idiom).join(" / ")}. Caution & effort: ${caution.map((c) => c.idiom).join(" / ")}.`,
    };
  },
};
