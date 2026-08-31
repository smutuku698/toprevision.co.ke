import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, cap } from "./grammarSharedA";

type ConjKey = "since" | "so" | "nor" | "yet" | "for" | "unless" | "although" | "though";
const MEANINGS: Record<ConjKey, string> = {
  since: "because, or from a point in time until now",
  so: "as a result, therefore",
  nor: "and not (used after 'neither' or another negative)",
  yet: "but, or up until now",
  for: "because (formal, joins two clauses)",
  unless: "except if, if not",
  although: "despite the fact that",
  though: "despite the fact that (less formal than although)",
};

// 32 leisure-time-themed sentences, each keyed to a specific conjunction.
type Item = { word: ConjKey; sentence: (n: string) => string };
const ITEMS: Item[] = [
  { word: "since", sentence: (n) => `${n} has enjoyed chess ___ childhood.` },
  { word: "since", sentence: () => `___ it was raining, the picnic was moved indoors.` },
  { word: "since", sentence: (n) => `${n} joined the football club ___ last year.` },
  { word: "since", sentence: () => `We have played cards together ___ we were young.` },
  { word: "so", sentence: (n) => `${n} finished the chores early, ___ there was time to relax.` },
  { word: "so", sentence: () => `The team practised hard, ___ they won the match.` },
  { word: "so", sentence: (n) => `${n} was tired, ___ he went to bed early after the game.` },
  { word: "so", sentence: () => `It was raining, ___ the outdoor game was cancelled.` },
  { word: "nor", sentence: (n) => `${n} does not enjoy loitering, ___ does he waste his free time.` },
  { word: "nor", sentence: () => `She has never squandered her holiday, ___ has she been idle.` },
  { word: "nor", sentence: (n) => `${n} did not finish the puzzle, ___ did he give up trying.` },
  { word: "yet", sentence: () => `The holiday was short, ___ it was very enjoyable.` },
  { word: "yet", sentence: (n) => `${n} is tired, ___ still eager to play another game.` },
  { word: "yet", sentence: () => `He has not ___ decided how to spend his leisure time.` },
  { word: "for", sentence: (n) => `${n} chose the pastime carefully, ___ it would fill many afternoons.` },
  { word: "for", sentence: () => `The children stayed indoors, ___ it was too hot to play outside.` },
  { word: "unless", sentence: (n) => `${n} will not go swimming ___ the weather improves.` },
  { word: "unless", sentence: () => `The picnic will be cancelled ___ it stops raining.` },
  { word: "unless", sentence: (n) => `${n} cannot join the chess club ___ he finishes his homework.` },
  { word: "although", sentence: () => `___ it was late, the children kept playing games.` },
  { word: "although", sentence: (n) => `${n} enjoyed the hobby, ___ it was quite expensive.` },
  { word: "although", sentence: () => `___ the holiday was busy, everyone found time to relax.` },
  { word: "though", sentence: (n) => `${n} loved the sport, ___ he rarely had time to practise.` },
  { word: "though", sentence: () => `The game was difficult, ___ enjoyable.` },
  { word: "though", sentence: (n) => `${n} was busy, ___ he still made time for his favourite hobby.` },
];

export const conjunctionsSinceSoNorYet: Skill = {
  id: "g6-eng-grammar-conjunctions",
  code: "G.10",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Conjunctions: since, so, nor, yet, for, unless, although, though",
  description: "Identify and use the conjunctions since, so, nor, yet, for, unless, although and though correctly in sentences about leisure time.",
  generate(rng) {
    const branch = randChoice(rng, ["fill-blank", "mc-choose", "categorize-meaning", "click-match-meaning", "ordering"] as const);

    if (branch === "fill-blank") {
      const item = randChoice(rng, ITEMS);
      const name = randChoice(rng, KENYAN_NAMES);
      const full = item.sentence(name);
      const [before, after] = full.split("___");
      return {
        kind: "fill-blank",
        prompt: "Fill in the conjunction that correctly joins these two ideas.",
        before,
        after,
        correctAnswer: item.word,
        inputMode: "text",
        hint: `This conjunction means: ${MEANINGS[item.word]}.`,
        explanation: `"${item.word}" is correct — it means ${MEANINGS[item.word]}.`,
      };
    }

    if (branch === "mc-choose") {
      const item = randChoice(rng, ITEMS);
      const name = randChoice(rng, KENYAN_NAMES);
      const full = item.sentence(name);
      const wrongPool = (Object.keys(MEANINGS) as ConjKey[]).filter((k) => k !== item.word);
      const distractors = shuffle(rng, wrongPool).slice(0, 3);
      const choices = shuffle(rng, [item.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which conjunction correctly completes this sentence?\n"${full.replace("___", "____")}"`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: `Think about the relationship between the two ideas — is one a reason, a contrast, a condition, or a result?`,
        explanation: `"${item.word}" is correct — it means ${MEANINGS[item.word]}.`,
      };
    }

    if (branch === "categorize-meaning") {
      const contrast: ConjKey[] = ["although", "though", "yet"];
      const condition: ConjKey[] = ["unless"];
      const reasonResult: ConjKey[] = ["since", "so", "for"];
      const negative: ConjKey[] = ["nor"];
      const pool = shuffle(rng, [
        ...contrast.map((w) => ({ id: w, label: w, bucket: "contrast" })),
        ...condition.map((w) => ({ id: w, label: w, bucket: "condition" })),
        ...reasonResult.map((w) => ({ id: w, label: w, bucket: "reason-result" })),
        ...negative.map((w) => ({ id: w, label: w, bucket: "negative" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these conjunctions by what kind of relationship they show.",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "contrast", label: "Shows Contrast" },
          { id: "condition", label: "Shows a Condition" },
          { id: "reason-result", label: "Shows Reason/Result" },
          { id: "negative", label: "Joins Two Negatives" },
        ],
        correctBucket,
        hint: "Contrast = despite; condition = unless something happens; reason/result = because/therefore; negative = and not.",
        explanation: "Contrast: although, though, yet. Condition: unless. Reason/result: since, so, for. Negative-joining: nor.",
      };
    }

    if (branch === "click-match-meaning") {
      const pool = shuffle(rng, Object.keys(MEANINGS) as ConjKey[]).slice(0, 6);
      const tokens = shuffle(rng, pool.map((w) => ({ id: w, label: w })));
      const targets = shuffle(rng, pool.map((w) => ({ id: w, label: MEANINGS[w] })));
      const correctMap: Record<string, string> = {};
      for (const w of pool) correctMap[w] = w;
      return {
        kind: "click-match",
        prompt: "Match each conjunction to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Several of these have similar meanings — read carefully.",
        explanation: pool.map((w) => `"${w}" means ${MEANINGS[w]}.`).join(" "),
      };
    }

    const item = randChoice(rng, ITEMS);
    const name = randChoice(rng, KENYAN_NAMES);
    const full = item.sentence(name).replace("___", item.word).replace(".", "");
    const words = full.trim().split(" ");
    const orderItems = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Arrange these words to form a correct sentence using the conjunction.",
      instruction: "Click the words in the correct order.",
      items: shuffle(rng, orderItems),
      correctOrder: orderItems.map((i) => i.id),
      hint: `"${item.word}" joins the two parts of this sentence.`,
      explanation: `The correct sentence is: "${cap(full.trim())}."`,
    };
  },
};
