import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import { RULE_CONTEXTS, place } from "./contexts";
import type { Skill } from "@/lib/types";

export const formingInequalities: Skill = {
  id: "g6-math-n-forming-inequalities",
  code: "N.15",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Forming inequalities",
  description: "Form simple inequalities in one unknown from real-life situations, using the symbols > and < only.",
  generate(rng) {
    const branch = randChoice(rng, ["form-greater", "form-less", "symbol-meaning", "sort-statements", "identify-unknown", "order-limits", "match-scenario-symbol"] as const);

    if (branch === "form-greater") {
      const ctx = randChoice(rng, RULE_CONTEXTS);
      const limit = randInt(rng, ctx.boundaryMin, ctx.boundaryMax);
      const subject = ctx.subject.replace("{place}", place(rng));
      const correctExpr = `x > ${limit}`;
      const wrong = [`x < ${limit}`, `x = ${limit}`, `x > ${limit + randInt(rng, 2, 8)}`];
      const { choices: rawChoices, correctIndex } = buildChoicesFromStrings(rng, correctExpr, wrong, 3);
      const choices = rawChoices.map((c) => `$${c}$`);
      return {
        kind: "multiple-choice",
        prompt: `A rule says the ${subject} must be MORE than ${limit}. Using x for this quantity, write the rule as an inequality.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "\"More than\" uses the strict symbol >.",
        explanation: `"More than ${limit}" is written $x > ${limit}$.`,
      };
    }

    if (branch === "form-less") {
      const ctx = randChoice(rng, RULE_CONTEXTS);
      const limit = randInt(rng, ctx.boundaryMin, ctx.boundaryMax);
      const subject = ctx.subject.replace("{place}", place(rng));
      const correctExpr = `x < ${limit}`;
      const wrong = [`x > ${limit}`, `x = ${limit}`, `x < ${limit + randInt(rng, 2, 8)}`];
      const { choices: rawChoices, correctIndex } = buildChoicesFromStrings(rng, correctExpr, wrong, 3);
      const choices = rawChoices.map((c) => `$${c}$`);
      return {
        kind: "multiple-choice",
        prompt: `A rule says the ${subject} must be FEWER/LESS than ${limit}. Using x for this quantity, write the rule as an inequality.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "\"Fewer than\"/\"less than\" uses the strict symbol <.",
        explanation: `"Fewer than ${limit}" is written $x < ${limit}$.`,
      };
    }

    if (branch === "symbol-meaning") {
      const pairs = [
        { symbol: "$>$", meaning: "Strictly greater than (more than)" },
        { symbol: "$<$", meaning: "Strictly less than (fewer than)" },
      ] as const;
      const tokens = pairs.map((p, i) => ({ id: `s${i}`, label: p.symbol }));
      const targets = shuffle(rng, pairs.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      pairs.forEach((p, i) => (correctMap[`m${i}`] = `s${i}`));
      return {
        kind: "click-match",
        prompt: "Match each inequality symbol to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "The symbol opens toward the larger value.",
        explanation: pairs.map((p) => `${p.symbol} means ${p.meaning}`).join("; ") + ".",
      };
    }

    if (branch === "sort-statements") {
      const chosen = shuffle(rng, [...RULE_CONTEXTS]).slice(0, 5);
      const items = chosen.map((ctx, i) => {
        const isGreater = rng() < 0.5;
        const limit = randInt(rng, ctx.boundaryMin, ctx.boundaryMax);
        const word = isGreater ? "more than" : "fewer/less than";
        return { id: `s${i}`, label: `${ctx.subject.replace("{place}", place(rng))} must be ${word} ${limit}`, isGreater };
      });
      const buckets = [
        { id: "greater", label: "Needs the symbol >" },
        { id: "less", label: "Needs the symbol <" },
      ];
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.isGreater ? "greater" : "less"));
      return {
        kind: "categorize",
        prompt: "Sort each real-life statement by which inequality symbol it needs.",
        items: items.map((it) => ({ id: it.id, label: it.label })),
        buckets,
        correctBucket,
        hint: "\"More than\" needs >. \"Fewer/less than\" needs <.",
        explanation: items.map((it) => `"${it.label}" uses ${it.isGreater ? ">" : "<"}`).join("; ") + ".",
      };
    }

    if (branch === "identify-unknown") {
      const ctx = randChoice(rng, RULE_CONTEXTS);
      const limit = randInt(rng, ctx.boundaryMin, ctx.boundaryMax);
      const subject = ctx.subject.replace("{place}", place(rng));
      return {
        kind: "fill-blank",
        prompt: `A rule says the ${subject} must be more than ${limit}. If x represents this rule's boundary, write just the number that x is being compared to.`,
        before: "x is compared to",
        after: "",
        correctAnswer: String(limit),
        inputMode: "numeric",
        hint: "Find the number mentioned as the limit in the rule.",
        explanation: `The rule compares x to ${limit}.`,
      };
    }

    if (branch === "order-limits") {
      const chosen = shuffle(rng, [...RULE_CONTEXTS]).slice(0, 5);
      const withLimit = chosen.map((ctx, i) => ({
        id: `r${i}`,
        label: `"${ctx.subject.replace("{place}", place(rng))}" (limit ${randInt(rng, ctx.boundaryMin, ctx.boundaryMax)})`,
        limit: 0,
      }));
      // extract the limit actually embedded in each label for a reliable sort key
      const withParsedLimit = withLimit.map((w) => ({ ...w, limit: Number(w.label.match(/limit (\d+)/)?.[1] ?? 0) }));
      const ascending = rng() < 0.5;
      const sorted = [...withParsedLimit].sort((a, b) => (ascending ? a.limit - b.limit : b.limit - a.limit));
      return {
        kind: "ordering",
        prompt: `Arrange these rules' boundary limits in ${ascending ? "ascending (smallest to largest)" : "descending (largest to smallest)"} order.`,
        instruction: "Drag to arrange in order.",
        items: shuffle(rng, withParsedLimit.map((w) => ({ id: w.id, label: w.label }))),
        correctOrder: sorted.map((w) => w.id),
        hint: "Compare the numeric limit stated in each rule.",
        explanation: `In ${ascending ? "ascending" : "descending"} order by limit: ${sorted.map((w) => w.label).join(", ")}.`,
      };
    }

    // match-scenario-symbol: match a short real-life phrase to the symbol it needs
    const phrasePool = [
      { phrase: "at least this many is not required, but MORE than this is", isGreater: true },
      { phrase: "a value that exceeds this amount", isGreater: true },
      { phrase: "a value that falls short of this amount", isGreater: false },
      { phrase: "a value below this amount", isGreater: false },
      { phrase: "a value above this amount", isGreater: true },
      { phrase: "a value under this amount", isGreater: false },
    ] as const;
    const chosen = shuffle(rng, [...phrasePool]).slice(0, 4);
    const tokens = chosen.map((p, i) => ({ id: `t${i}`, label: p.phrase }));
    const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.isGreater ? "Symbol: >" : "Symbol: <" })));
    const correctMap: Record<string, string> = {};
    chosen.forEach((p, i) => (correctMap[`m${i}`] = `t${i}`));
    return {
      kind: "click-match",
      prompt: "Match each phrase to the inequality symbol it needs.",
      tokens,
      targets,
      correctMap,
      hint: "Words like \"exceeds\"/\"above\" mean >. Words like \"below\"/\"under\"/\"falls short\" mean <.",
      explanation: chosen.map((p) => `"${p.phrase}" uses ${p.isGreater ? ">" : "<"}`).join("; ") + ".",
    };
  },
};
