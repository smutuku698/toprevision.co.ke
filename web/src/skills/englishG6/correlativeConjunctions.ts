import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, cap } from "./grammarSharedA";

// The theme covers two patterns: either...or / neither...nor, AND show...nominal...how/where/who.
type EitherItem = { a: string; b: string; sentence: (n: string) => string; type: "either-or" | "neither-nor" };
const EITHER_NEITHER: EitherItem[] = [
  { a: "Wanjiru", b: "Otieno", sentence: () => `___ Wanjiru ___ Otieno will represent the class in the debate.`, type: "either-or" },
  { a: "tea", b: "porridge", sentence: () => `You may have ___ tea ___ porridge for breakfast.`, type: "either-or" },
  { a: "read", b: "write", sentence: (n) => `${n} plans to ___ read ___ write during the free lesson.`, type: "either-or" },
  { a: "Kisumu", b: "Nakuru", sentence: () => `The family will visit ___ Kisumu ___ Nakuru this holiday.`, type: "either-or" },
  { a: "football", b: "netball", sentence: () => `Students can choose to play ___ football ___ netball.`, type: "either-or" },
  { a: "the market", b: "the shop", sentence: (n) => `${n} will buy vegetables from ___ the market ___ the shop.`, type: "either-or" },
  { a: "morning", b: "evening", sentence: () => `The clinic is open ___ in the morning ___ in the evening.`, type: "either-or" },
  { a: "singing", b: "dancing", sentence: () => `For the talent show, pick ___ singing ___ dancing.`, type: "either-or" },
  { a: "Amina", b: "Chebet", sentence: () => `___ Amina ___ Chebet has finished the assignment yet.`, type: "neither-nor" },
  { a: "hot", b: "cold", sentence: () => `The porridge was ___ too hot ___ too cold — it was just right.`, type: "neither-nor" },
  { a: "rain", b: "sun", sentence: () => `___ rain ___ sun could stop the determined athletes.`, type: "neither-nor" },
  { a: "money", b: "time", sentence: (n) => `${n} had ___ money ___ time to travel that week.`, type: "neither-nor" },
  { a: "the teacher", b: "the pupils", sentence: () => `___ the teacher ___ the pupils knew about the surprise visit.`, type: "neither-nor" },
  { a: "tired", b: "hungry", sentence: (n) => `${n} was ___ tired ___ hungry after the short walk.`, type: "neither-nor" },
  { a: "fast", b: "slow", sentence: () => `The tortoise moved ___ too fast ___ too slow, just steadily.`, type: "neither-nor" },
];

// The show...nominal...how/where/who pattern — 12 sentence templates as the theme requires.
type ShowItem = { word: "how" | "where" | "who"; sentence: (n: string, p: string) => string };
const SHOW_PATTERN: ShowItem[] = [
  { word: "how", sentence: (n) => `The chart will show ${n} ___ to solve the problem.` },
  { word: "how", sentence: () => `This diagram shows ___ the telephone works.` },
  { word: "how", sentence: (n) => `The teacher demonstrated ___ ${n} should hold the pencil.` },
  { word: "where", sentence: (n, p) => `The map shows ${n} ___ ${p} is located.` },
  { word: "where", sentence: () => `The sign shows visitors ___ to find the exit.` },
  { word: "where", sentence: (n) => `The guide showed ${n} ___ the nearest water point was.` },
  { word: "who", sentence: () => `The register shows ___ was absent yesterday.` },
  { word: "who", sentence: (n) => `The photo album shows ${n} ___ attended the reunion.` },
  { word: "who", sentence: () => `The list shows ___ won the spelling contest.` },
  { word: "how", sentence: (n) => `${n} explained ___ the machine should be used safely.` },
  { word: "where", sentence: () => `The notice shows ___ the meeting will be held.` },
  { word: "who", sentence: (n) => `The record shows ${n} ___ delivered the package.` },
];

export const correlativeConjunctions: Skill = {
  id: "g6-eng-grammar-correlative-conjunctions",
  code: "G.3",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Correlative Conjunctions",
  description: "Use the correlative conjunctions either...or and neither...nor correctly, and use the pattern show...nominal...how/where/who in sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["either-neither-mc", "either-neither-fill", "show-pattern-fill", "categorize", "ordering"] as const);

    if (branch === "either-neither-mc") {
      const item = randChoice(rng, EITHER_NEITHER);
      const name = randChoice(rng, KENYAN_NAMES);
      const full = item.sentence(name);
      const correct = item.type === "either-or" ? "either...or" : "neither...nor";
      const wrong = item.type === "either-or" ? "neither...nor" : "either...or";
      const choices = shuffle(rng, [correct, wrong, "both...and", "not only...but also"]);
      return {
        kind: "multiple-choice",
        prompt: `Which correlative conjunction pair correctly completes this sentence?\n"${full.replace(/___/g, "____")}"`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "row",
        hint: item.type === "either-or" ? "This sentence offers a choice between two options." : "This sentence says that neither option is true.",
        explanation: `"${correct}" is correct — ${item.type === "either-or" ? "it expresses a choice between two things" : "it negates both options together"}.`,
      };
    }

    if (branch === "either-neither-fill") {
      const item = randChoice(rng, EITHER_NEITHER);
      const name = randChoice(rng, KENYAN_NAMES);
      const full = item.sentence(name);
      const correct = item.type === "either-or" ? ["either", "or"] : ["neither", "nor"];
      // The sentence has two blanks; fill the first one in directly and leave only the
      // second (the matching word of the pair) as the actual fill-blank question.
      const firstFilled = full.replace("___", correct[0]);
      const [before, after] = firstFilled.split("___");
      return {
        kind: "fill-blank",
        prompt: `The first part of the pair is "${correct[0]}". Complete the sentence with the matching second word.`,
        before,
        after,
        correctAnswer: correct[1],
        inputMode: "text",
        hint: `"${correct[0]}" always pairs with "${correct[1]}".`,
        explanation: `The complete sentence is: "${cap(firstFilled.replace("___", correct[1]))}" using ${correct[0]}...${correct[1]}.`,
      };
    }

    if (branch === "show-pattern-fill") {
      const item = randChoice(rng, SHOW_PATTERN);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const full = item.sentence(name, place);
      const [before, after] = full.split("___");
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence with the correct word: how, where, or who.",
        before,
        after,
        correctAnswer: item.word,
        inputMode: "text",
        hint: `Think about whether the sentence is about a method, a place, or a person.`,
        explanation: `"${item.word}" is correct — it fits the pattern show...nominal...${item.word}.`,
      };
    }

    if (branch === "categorize") {
      const pool = shuffle(rng, SHOW_PATTERN).slice(0, 6);
      const items = pool.map((s, i) => ({ id: `s-${i}`, label: s.sentence("the pupil", "Nakuru").replace("___", `[${s.word}]`) }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((s, i) => (correctBucket[`s-${i}`] = s.word));
      return {
        kind: "categorize",
        prompt: "Sort these sentences by which word they use: HOW, WHERE, or WHO.",
        items,
        buckets: [
          { id: "how", label: "how" },
          { id: "where", label: "where" },
          { id: "who", label: "who" },
        ],
        correctBucket,
        hint: "How relates to a method, where to a location, who to a person.",
        explanation: "Each sentence uses the word that fits whether it describes a method (how), a place (where), or a person (who).",
      };
    }

    const item = randChoice(rng, EITHER_NEITHER);
    const name = randChoice(rng, KENYAN_NAMES);
    const correct = item.type === "either-or" ? ["either", "or"] : ["neither", "nor"];
    const parts = item.sentence(name).split("___");
    const full = `${parts[0]}${correct[0]}${parts[1]}${correct[1]}${parts[2]}`.replace(".", "").trim();
    const words = full.split(" ");
    const orderItems = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Arrange these words to form a correct sentence with a correlative conjunction pair.",
      instruction: "Click the words in the correct order.",
      items: shuffle(rng, orderItems),
      correctOrder: orderItems.map((i) => i.id),
      hint: `Remember, "${correct[0]}" and "${correct[1]}" must go together, each right before the item it introduces.`,
      explanation: `The correct sentence is: "${cap(full)}."`,
    };
  },
};
