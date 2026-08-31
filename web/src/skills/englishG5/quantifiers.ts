import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster, cap } from "./g5EngShared";

// KICD Grade 5 English, Theme 6.0 Jobs and Occupations, sub-strand 6.3 Word Class: Determiners —
// Quantifiers: few/a few, little/a little, a lot of/lots of, each, all, enough, most, least.
// See curriculum-reference/grade-5/english.json.

type NounType = "countable" | "uncountable" | "both";
const Q: { word: string; nounType: NounType; note: string }[] = [
  { word: "few", nounType: "countable", note: "countable nouns; means 'not many' (a small, disappointing number)" },
  { word: "a few", nounType: "countable", note: "countable nouns; means 'some' (a small but useful number)" },
  { word: "little", nounType: "uncountable", note: "uncountable nouns; means 'not much' (hardly any)" },
  { word: "a little", nounType: "uncountable", note: "uncountable nouns; means 'some' (a small but useful amount)" },
  { word: "a lot of", nounType: "both", note: "countable or uncountable nouns; means 'a large number or amount'" },
  { word: "lots of", nounType: "both", note: "countable or uncountable nouns; means 'a large number or amount'" },
  { word: "each", nounType: "countable", note: "countable nouns; means 'every one, taken one by one'" },
  { word: "all", nounType: "both", note: "countable or uncountable nouns; means 'the whole number or amount'" },
  { word: "enough", nounType: "both", note: "countable or uncountable nouns; means 'as much/many as is needed'" },
  { word: "most", nounType: "both", note: "countable or uncountable nouns; means 'the largest part'" },
  { word: "least", nounType: "both", note: "countable or uncountable nouns; means 'the smallest part'" },
];

const FILL_TPL: { before: string; after: string; word: string }[] = [
  { before: "The carpenter had ", after: " nails left, so she could not finish the chair.", word: "few" },
  { before: "The tailor still had ", after: " buttons in the tin, enough to finish the shirt.", word: "a few" },
  { before: "The painter had ", after: " paint left — barely a spoonful.", word: "little" },
  { before: "The nurse kept ", after: " cotton wool in the drawer, enough for one patient.", word: "a little" },
  { before: "The mechanic uses ", after: " oil when servicing a lorry.", word: "a lot of" },
  { before: "The baker sold ", after: " loaves before midday.", word: "lots of" },
  { before: "The teacher gave ", after: " pupil a new exercise book.", word: "each" },
  { before: "By evening, ", after: " the vegetables at the grocer's stall had been sold.", word: "all" },
  { before: "The plumber checked that there was ", after: " pipe to reach the tank.", word: "enough" },
  { before: "The farmer said ", after: " of his maize crop did well this season.", word: "most" },
  { before: "Of all the workers, the guard had the ", after: " time to rest.", word: "least" },
  { before: "The librarian said there were only ", after: " readers in the room, which was quieter than usual.", word: "few" },
];

function qCluster(correct: string): string[] {
  const map: Record<string, string[]> = {
    "few": ["a few", "little", "less"],
    "a few": ["few", "a little", "much"],
    "little": ["a little", "few", "many"],
    "a little": ["little", "a few", "many"],
    "a lot of": ["much", "many", "few"],
    "lots of": ["a lot", "much", "few"],
    "each": ["all", "every", "few"],
    "all": ["each", "most", "few"],
    "enough": ["a few", "a little", "most"],
    "most": ["all", "least", "much"],
    "least": ["little", "most", "few"],
  };
  return map[correct] ?? Q.map((x) => x.word).filter((w) => w !== correct);
}

export const quantifiers: Skill = {
  id: "g5-eng-grammar-quantifiers",
  code: "LU.6",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Quantifiers (few, a few, little, a little, each, all, enough, most, least)",
  description: "Use quantifying determiners correctly with countable and uncountable nouns, including the 'few / a few' and 'little / a little' meaning contrast.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "sort-noun", "match", "order", "reason"] as const);

    if (branch === "mc") {
      const t = randChoice(rng, FILL_TPL);
      const { choices, correctIndex } = mcFromCluster(rng, t.word, qCluster(t.word));
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the quantifier that fits")}\n"${t.before}____${t.after}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Ask two things: is the noun countable or uncountable? And does the sentence mean 'hardly any' (few/little) or 'some, and that's fine' (a few/a little)?",
        explanation: `"${t.word}" is correct — used with ${Q.find((x) => x.word === t.word)?.note}.`,
      };
    }

    if (branch === "fill") {
      const t = randChoice(rng, FILL_TPL);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the quantifier (use one or two words)"),
        before: t.before,
        after: t.after,
        correctAnswer: t.word,
        acceptedAnswers: [t.word],
        inputMode: "text",
        hint: Q.find((x) => x.word === t.word)?.note,
        explanation: `"${t.word}" is correct. Full sentence: "${cap((t.before + t.word + t.after).trim())}"`,
      };
    }

    if (branch === "sort-noun") {
      const pool = shuffle(rng, Q).slice(0, 6);
      const items = pool.map((q, i) => ({ id: `q${i}`, label: q.word }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((q, i) => (correctBucket[`q${i}`] = q.nounType));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "what kind of noun each quantifier is used with"),
        items,
        buckets: [
          { id: "countable", label: "Countable nouns only (books, nails)" },
          { id: "uncountable", label: "Uncountable nouns only (water, sugar)" },
          { id: "both", label: "Both kinds" },
        ],
        correctBucket,
        hint: "Countable = you can count them (one nail, two nails). Uncountable = you measure them (some oil, a little sugar).",
        explanation: "Countable-only: few, a few, each. Uncountable-only: little, a little. Both: a lot of, lots of, all, enough, most, least.",
      };
    }

    if (branch === "match") {
      const seenMeanings = new Set<string>();
      const pool = shuffle(rng, Q).filter((q) => {
        const m = q.note.split(";")[1]?.trim() ?? q.note;
        if (seenMeanings.has(m)) return false;
        seenMeanings.add(m);
        return true;
      }).slice(0, 5);
      const tokens = shuffle(rng, pool.map((q) => ({ id: q.word, label: q.word })));
      const targets = shuffle(rng, pool.map((q) => ({ id: q.word, label: q.note.split(";")[1]?.trim() ?? q.note })));
      const correctMap: Record<string, string> = {};
      pool.forEach((q) => (correctMap[q.word] = q.word));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "quantifier to its meaning"),
        tokens,
        targets,
        correctMap,
        hint: "'few' and 'little' sound negative (hardly any). 'a few' and 'a little' sound positive (some, and enough).",
        explanation: pool.map((q) => `${q.word}: ${q.note}`).join("  "),
      };
    }

    if (branch === "order") {
      const t = randChoice(rng, FILL_TPL);
      const sentence = (t.before + t.word + t.after).trim().replace(/[.?]$/, "");
      const words = sentence.split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a correct sentence with a quantifier"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: `The quantifier "${t.word}" comes just before the noun it measures.`,
        explanation: `Correct sentence: "${cap(sentence)}."`,
      };
    }

    // reason — Analyze: the 'few / a few' (and 'little / a little') meaning contrast in a work context.
    const scen: { s: string; q: string; correct: string; wrong: string[]; why: string }[] = [
      {
        s: `${name(rng)} the carpenter checks her nail box and finds only three nails — not enough to finish the stool.`,
        q: `Which sentence matches?`,
        correct: "She has few nails left.",
        wrong: ["She has a few nails left.", "She has little nails left.", "She has a lot of nails left."],
        why: "'few' (no 'a') means 'not many — not enough', which matches the problem in the story.",
      },
      {
        s: `${name(rng)} the tailor opens the button tin and finds five buttons — just enough to finish the shirt.`,
        q: `Which sentence matches?`,
        correct: "He has a few buttons left.",
        wrong: ["He has few buttons left.", "He has a little buttons left.", "He has less buttons left."],
        why: "'a few' means 'some — and it is enough', which matches the story.",
      },
      {
        s: `${name(rng)} the painter tips the tin and only a drop of paint comes out.`,
        q: `Which sentence matches?`,
        correct: "There is little paint left.",
        wrong: ["There is a little paint left.", "There are few paint left.", "There is fewer paint left."],
        why: "paint is uncountable, and 'little' (no 'a') means 'hardly any', matching the story.",
      },
      {
        s: `${name(rng)} the nurse checks the cotton-wool drawer and finds a small amount — enough for one dressing.`,
        q: `Which sentence matches?`,
        correct: "There is a little cotton wool left.",
        wrong: ["There is little cotton wool left.", "There are a few cotton wool left.", "There is few cotton wool left."],
        why: "cotton wool is uncountable, and 'a little' means 'some — and it is enough', matching the story.",
      },
      {
        s: `${name(rng)} the plumber measures the pipe and it just reaches the tank with a bit to spare.`,
        q: `Which sentence matches?`,
        correct: "There is enough pipe to reach the tank.",
        wrong: ["There is few pipe to reach the tank.", "There is little pipe to reach the tank.", "There is least pipe to reach the tank."],
        why: "'enough' means 'as much as is needed', which is exactly the situation.",
      },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.correct, sc.wrong);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, sc.q),
      choices,
      correctIndex,
      layout: "list",
      hint: "If the amount is a problem (not enough), use 'few' or 'little'. If the amount is fine, use 'a few' or 'a little'.",
      explanation: `"${sc.correct}" is correct — ${sc.why}`,
    };
  },
};
