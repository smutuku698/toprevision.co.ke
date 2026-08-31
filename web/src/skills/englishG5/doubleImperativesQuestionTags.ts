import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 8.0 The Farm-Cash Crops, sub-strand 8.3 Sentences:
// Double Imperatives; Question Tags on the 'verb to be' (is/are/was/were).
// See curriculum-reference/grade-5/english.json.

// Double imperatives: two commands joined by "and".
const DOUBLE_IMP: string[] = [
  "Water the seedlings and cover them with mulch.",
  "Pick the ripe coffee berries and put them in the basket.",
  "Weed the maize plot and pile the weeds at the edge.",
  "Wash the farm tools and hang them to dry.",
  "Feed the calves and lock the gate.",
  "Dig the trench and line it with stones.",
  "Sort the tea leaves and weigh each sack.",
  "Plant the seeds and water them well.",
  "Sharpen the panga and return it to the store.",
  "Check the scarecrow and tighten its ropes.",
  "Collect the eggs and label the tray.",
  "Load the sisal onto the cart and cover it.",
];

// Question tags on 'to be': positive statement -> negative tag; negative statement -> positive tag.
const TAG_TPL: { statement: string; tag: string }[] = [
  { statement: "The coffee berries are ripe", tag: "aren't they?" },
  { statement: "The maize is not tall enough yet", tag: "is it?" },
  { statement: "The tractor was in the shed", tag: "wasn't it?" },
  { statement: "The workers were not late", tag: "were they?" },
  { statement: "This is the tea plantation", tag: "isn't it?" },
  { statement: "The granary is full", tag: "isn't it?" },
  { statement: "The seedlings were dry", tag: "weren't they?" },
  { statement: "The cotton is not ready for picking", tag: "is it?" },
  { statement: "The cooperative meeting was on Friday", tag: "wasn't it?" },
  { statement: "The scarecrows are in the rice paddy", tag: "aren't they?" },
  { statement: "The irrigation pump was not working", tag: "was it?" },
  { statement: "I am on the harvest team", tag: "aren't I?" },
];

function tagCluster(correct: string): string[] {
  const pool = ["isn't it?", "is it?", "aren't they?", "are they?", "wasn't it?", "was it?", "weren't they?", "were they?", "aren't I?", "doesn't it?", "don't they?"];
  return pool.filter((t) => t !== correct);
}

export const doubleImperativesQuestionTags: Skill = {
  id: "g5-eng-grammar-double-imperatives-question-tags",
  code: "LU.8",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Double Imperatives and Question Tags",
  description: "Give instructions using double imperatives (two commands joined by 'and'), and add correct question tags to statements with 'is/are/was/were'.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-tag", "fill-tag", "sort", "match", "order-imp", "reason"] as const);

    if (branch === "mc-tag") {
      const t = randChoice(rng, TAG_TPL);
      const { choices, correctIndex } = mcFromCluster(rng, t.tag, tagCluster(t.tag));
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the correct question tag")}\n"${t.statement}, ____"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Use the same 'be' verb (is/are/was/were) in the tag. Positive statement → negative tag; negative statement → positive tag.",
        explanation: `"${t.tag}" is correct. The statement "${t.statement}" ${t.statement.includes(" not") ? "is negative, so the tag is positive" : "is positive, so the tag is negative"}, and it keeps the same 'be' verb and matching pronoun.`,
      };
    }

    if (branch === "fill-tag") {
      const t = randChoice(rng, TAG_TPL);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the question tag"),
        before: `${t.statement}, `,
        after: "",
        correctAnswer: t.tag,
        acceptedAnswers: [t.tag, t.tag.replace("?", "")],
        inputMode: "text",
        hint: "Two words plus a question mark: the 'be' verb (with n't if needed) and the pronoun.",
        explanation: `"${t.tag}" — same 'be' verb as the statement, opposite polarity, matching pronoun. Full sentence: "${t.statement}, ${t.tag}"`,
      };
    }

    if (branch === "sort") {
      const imps = shuffle(rng, DOUBLE_IMP).slice(0, 3).map((s, i) => ({ id: `i${i}`, label: s, kind: "imp" }));
      const tags = shuffle(rng, TAG_TPL).slice(0, 3).map((t, i) => ({ id: `t${i}`, label: `${t.statement}, ${t.tag}`, kind: "tag" }));
      const items = shuffle(rng, [...imps, ...tags]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each sentence is a double imperative or a statement with a question tag"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "imp", label: "Double imperative (two commands with 'and')" },
          { id: "tag", label: "Statement + question tag" },
        ],
        correctBucket,
        hint: "A double imperative gives orders and starts with a verb. A tag question ends with a short question like 'isn't it?'.",
        explanation: "Double imperative: 'Water the seedlings and cover them.' Question tag: 'The maize is ripe, isn't it?'",
      };
    }

    if (branch === "match") {
      const seenTags = new Set<string>();
      const pool = shuffle(rng, TAG_TPL).filter((t) => (seenTags.has(t.tag) ? false : (seenTags.add(t.tag), true))).slice(0, 5);
      const tokens = shuffle(rng, pool.map((t, i) => ({ id: `p${i}`, label: t.statement })));
      const targets = shuffle(rng, pool.map((t, i) => ({ id: `p${i}`, label: t.tag })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_t, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "statement to its question tag"),
        tokens,
        targets,
        correctMap,
        hint: "Check the 'be' verb (is/are/was/were), whether the statement is positive or negative, and the pronoun.",
        explanation: pool.map((t) => `"${t.statement}, ${t.tag}"`).join("  "),
      };
    }

    if (branch === "order-imp") {
      const s = randChoice(rng, DOUBLE_IMP);
      const words = s.replace(/\.$/, "").split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a double imperative (an instruction with two commands)"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: "Start with a command verb, then 'and', then the second command.",
        explanation: `Correct instruction: "${s}"`,
      };
    }

    // reason — Evaluate: pick the correctly-tagged sentence.
    const scen: { s: string; correct: string; wrong: string[]; why: string }[] = [
      {
        s: "A farmer looks at the ripe coffee and turns to a helper for agreement.",
        correct: "The coffee is ripe, isn't it?",
        wrong: ["The coffee is ripe, is it?", "The coffee is ripe, doesn't it?", "The coffee is ripe, isn't they?"],
        why: "positive statement with 'is' → negative tag 'isn't', pronoun 'it'.",
      },
      {
        s: "A worker notices the maize is still short and checks with a neighbour.",
        correct: "The maize is not tall yet, is it?",
        wrong: ["The maize is not tall yet, isn't it?", "The maize is not tall yet, is they?", "The maize is not tall yet, was it?"],
        why: "negative statement with 'is' → positive tag 'is it?'.",
      },
      {
        s: "The team recalls the tractor being in the shed last night.",
        correct: "The tractor was in the shed, wasn't it?",
        wrong: ["The tractor was in the shed, was it?", "The tractor was in the shed, weren't it?", "The tractor was in the shed, isn't it?"],
        why: "positive past statement with 'was' → negative past tag 'wasn't it?'.",
      },
      {
        s: "A pupil wants to confirm she is on the harvest team.",
        correct: "I am on the harvest team, aren't I?",
        wrong: ["I am on the harvest team, amn't I?", "I am on the harvest team, isn't I?", "I am on the harvest team, am I not it?"],
        why: "'I am' takes the special tag 'aren't I?'.",
      },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.correct, sc.wrong);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, "Which tag question is correct?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Same 'be' verb, opposite sign (positive ↔ negative), matching pronoun.",
      explanation: `"${sc.correct}" is correct — ${sc.why}`,
    };
  },
};
