import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster, cap } from "./g5EngShared";

// KICD Grade 5 English, Theme 5.0 Traditional Foods, sub-strand 5.3 Word Class: Adjectives —
// comparative & superlative forms (regular and irregular); order of adjectives (size, shape, age).
// See curriculum-reference/grade-5/english.json.

type Rule = "er-est" | "more-most" | "irregular";
type Adj = { base: string; comp: string; sup: string; rule: Rule };
const ADJ: Adj[] = [
  { base: "sweet", comp: "sweeter", sup: "sweetest", rule: "er-est" },
  { base: "tasty", comp: "tastier", sup: "tastiest", rule: "er-est" },
  { base: "big", comp: "bigger", sup: "biggest", rule: "er-est" },
  { base: "soft", comp: "softer", sup: "softest", rule: "er-est" },
  { base: "warm", comp: "warmer", sup: "warmest", rule: "er-est" },
  { base: "fresh", comp: "fresher", sup: "freshest", rule: "er-est" },
  { base: "ripe", comp: "riper", sup: "ripest", rule: "er-est" },
  { base: "healthy", comp: "healthier", sup: "healthiest", rule: "er-est" },
  { base: "dry", comp: "drier", sup: "driest", rule: "er-est" },
  { base: "delicious", comp: "more delicious", sup: "most delicious", rule: "more-most" },
  { base: "nutritious", comp: "more nutritious", sup: "most nutritious", rule: "more-most" },
  { base: "expensive", comp: "more expensive", sup: "most expensive", rule: "more-most" },
  { base: "popular", comp: "more popular", sup: "most popular", rule: "more-most" },
  { base: "colourful", comp: "more colourful", sup: "most colourful", rule: "more-most" },
  { base: "good", comp: "better", sup: "best", rule: "irregular" },
  { base: "bad", comp: "worse", sup: "worst", rule: "irregular" },
  { base: "far", comp: "farther", sup: "farthest", rule: "irregular" },
  { base: "little", comp: "less", sup: "least", rule: "irregular" },
  { base: "many", comp: "more", sup: "most", rule: "irregular" },
];

const FILL_TPL: { before: string; after: string; adj: Adj; form: "comp" | "sup" }[] = [
  { before: "Millet porridge is ", after: " than soda for a growing child.", adj: ADJ.find((a) => a.base === "healthy")!, form: "comp" },
  { before: "Of all the fruits on the table, the mango is the ", after: ".", adj: ADJ.find((a) => a.base === "sweet")!, form: "sup" },
  { before: "Home-made githeri tastes ", after: " than tinned beans.", adj: ADJ.find((a) => a.base === "good")!, form: "comp" },
  { before: "This is the ", after: " ugali I have ever eaten — it is nearly burnt.", adj: ADJ.find((a) => a.base === "bad")!, form: "sup" },
  { before: "A ripe pawpaw is ", after: " than a green one.", adj: ADJ.find((a) => a.base === "soft")!, form: "comp" },
  { before: "Pilau is the ", after: " dish at the wedding — everyone chooses it.", adj: ADJ.find((a) => a.base === "popular")!, form: "sup" },
  { before: "Muthokoi is ", after: " than plain maize because of the beans in it.", adj: ADJ.find((a) => a.base === "nutritious")!, form: "comp" },
  { before: "The bread from the morning batch is ", after: " than yesterday's loaf.", adj: ADJ.find((a) => a.base === "fresh")!, form: "comp" },
  { before: "The market on Saturday has the ", after: " vegetables of the whole week.", adj: ADJ.find((a) => a.base === "fresh")!, form: "sup" },
  { before: "There is ", after: " sugar in this jar than in that one.", adj: ADJ.find((a) => a.base === "little")!, form: "comp" },
  { before: "Sweet potatoes are ", after: " than arrow roots in most shops.", adj: ADJ.find((a) => a.base === "expensive")!, form: "comp" },
  { before: "This bunch of bananas is the ", after: " on the whole stall.", adj: ADJ.find((a) => a.base === "big")!, form: "sup" },
];

function formCluster(a: Adj, form: "comp" | "sup"): string[] {
  const correct = form === "comp" ? a.comp : a.sup;
  const out: string[] = [];
  // classic overgeneralisation errors
  if (a.rule === "irregular") {
    out.push(form === "comp" ? `${a.base}er` : `${a.base}est`);
    out.push(form === "comp" ? `more ${a.base}` : `most ${a.base}`);
    out.push(form === "comp" ? a.sup : a.comp);
  } else if (a.rule === "er-est") {
    out.push(form === "comp" ? `more ${a.base}` : `most ${a.base}`);
    out.push(form === "comp" ? a.sup : a.comp);
    out.push(a.base);
  } else {
    out.push(form === "comp" ? `${a.base}er` : `${a.base}est`);
    out.push(form === "comp" ? a.sup : a.comp);
    out.push(a.base);
  }
  return out.filter((x) => x !== correct);
}

export const adjectivesComparativeSuperlative: Skill = {
  id: "g5-eng-grammar-adjectives-comparative-superlative",
  code: "LU.5",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Adjectives: Comparatives, Superlatives and Order",
  description: "Form and use comparative and superlative adjectives (regular -er/-est, more/most, and irregular), and order adjectives of size, shape and age.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-form", "fill", "sort-rule", "match", "order-adj", "reason"] as const);

    if (branch === "mc-form") {
      const t = randChoice(rng, FILL_TPL);
      const correct = t.form === "comp" ? t.adj.comp : t.adj.sup;
      const { choices, correctIndex } = mcFromCluster(rng, correct, formCluster(t.adj, t.form));
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, `the correct ${t.form === "comp" ? "comparative" : "superlative"} form of "${t.adj.base}"`)}\n"${t.before}____${t.after}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: t.adj.rule === "irregular" ? `"${t.adj.base}" is irregular — its forms do not follow the -er/-est or more/most rules.` : t.adj.rule === "more-most" ? "Longer adjectives use 'more' (comparative) and 'most' (superlative)." : "Short adjectives add -er (comparative) and -est (superlative).",
        explanation: `"${correct}" is correct. "${t.adj.base}" → ${t.adj.comp} (comparative) → ${t.adj.sup} (superlative). A common mistake is adding -er/-est to an irregular or long adjective (e.g. "gooder", "more big").`,
      };
    }

    if (branch === "fill") {
      const t = randChoice(rng, FILL_TPL);
      const correct = t.form === "comp" ? t.adj.comp : t.adj.sup;
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `the ${t.form === "comp" ? "comparative" : "superlative"} form of "${t.adj.base}"`),
        before: t.before,
        after: t.after,
        correctAnswer: correct,
        acceptedAnswers: [correct],
        inputMode: "text",
        hint: t.form === "comp" ? "A comparison of two things — often has 'than' after it." : "The most of all — usually has 'the' before it.",
        explanation: `"${correct}" is correct. Full sentence: "${cap((t.before + correct + t.after).trim())}"`,
      };
    }

    if (branch === "sort-rule") {
      const pool = shuffle(rng, ADJ).slice(0, 6);
      const items = pool.map((a, i) => ({ id: `a${i}`, label: a.base }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((a, i) => (correctBucket[`a${i}`] = a.rule));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "how each adjective forms its comparative and superlative"),
        items,
        buckets: [
          { id: "er-est", label: "Add -er / -est" },
          { id: "more-most", label: "Use more / most" },
          { id: "irregular", label: "Irregular (changes completely)" },
        ],
        correctBucket,
        hint: "Short adjectives (1 syllable, or 2 ending in -y) add -er/-est. Longer ones use more/most. A few change completely.",
        explanation: "-er/-est: sweet, big, healthy, fresh. more/most: delicious, nutritious, popular. Irregular: good→better→best, bad→worse→worst, little→less→least, many→more→most.",
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, ADJ).slice(0, 5);
      const useSup = rng() < 0.5;
      const tokens = shuffle(rng, pool.map((a) => ({ id: a.base, label: a.base })));
      const targets = shuffle(rng, pool.map((a) => ({ id: a.base, label: useSup ? a.sup : a.comp })));
      const correctMap: Record<string, string> = {};
      pool.forEach((a) => (correctMap[a.base] = a.base));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, `adjective to its ${useSup ? "superlative" : "comparative"} form`),
        tokens,
        targets,
        correctMap,
        hint: useSup ? "Superlative = the most of all." : "Comparative = comparing two.",
        explanation: pool.map((a) => `${a.base} → ${useSup ? a.sup : a.comp}`).join("; "),
      };
    }

    if (branch === "order-adj") {
      // order of adjectives: size, shape, age
      const sets = [
        { adjs: ["big", "round", "old"], noun: "cooking pot" },
        { adjs: ["small", "flat", "new"], noun: "grinding stone" },
        { adjs: ["large", "oval", "old"], noun: "wooden bowl" },
        { adjs: ["tiny", "square", "new"], noun: "spice tin" },
        { adjs: ["long", "thin", "old"], noun: "stirring stick" },
        { adjs: ["wide", "round", "new"], noun: "serving tray" },
      ];
      const s = randChoice(rng, sets);
      const items = s.adjs.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, `the adjectives before "${s.noun}"`),
        instruction: "Click the adjectives in the correct order (size, then shape, then age).",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: "English orders adjectives: SIZE first, then SHAPE, then AGE.",
        explanation: `Correct order: "a ${s.adjs.join(" ")} ${s.noun}" — size (${s.adjs[0]}), shape (${s.adjs[1]}), age (${s.adjs[2]}).`,
      };
    }

    // reason — Apply: compare two foods, pick the correct sentence.
    const scen: { s: string; correct: string; wrong: string[]; why: string }[] = [
      { s: "A plate of millet porridge has more iron and fibre than a glass of soda.", correct: "Millet porridge is healthier than soda.", wrong: ["Millet porridge is more healthy than soda.", "Millet porridge is the healthiest than soda.", "Millet porridge is healthy than soda."], why: `"healthy" is a two-syllable -y adjective, so the comparative is "healthier", and "than" compares two things.` },
      { s: "Of the ugali, rice and chapati on the table, the chapati is nearly burnt.", correct: "The chapati is the worst of the three.", wrong: ["The chapati is the baddest of the three.", "The chapati is the worse of the three.", "The chapati is more worst of the three."], why: `"bad" is irregular: bad → worse → worst; the superlative is "the worst".` },
      { s: "Home-cooked githeri and tinned beans are compared at lunch; the fresh githeri wins.", correct: "The githeri tastes better than the tinned beans.", wrong: ["The githeri tastes gooder than the tinned beans.", "The githeri tastes more good than the tinned beans.", "The githeri tastes best than the tinned beans."], why: `"good" is irregular: good → better → best; the comparative is "better".` },
      { s: "At the wedding, pilau is chosen by more guests than any other dish.", correct: "Pilau is the most popular dish at the wedding.", wrong: ["Pilau is the popularest dish at the wedding.", "Pilau is the more popular dish at the wedding.", "Pilau is popularest dish at the wedding."], why: `"popular" is a longer adjective, so the superlative is "the most popular".` },
      { s: "Jar A holds two spoons of sugar; jar B holds five spoons.", correct: "Jar A has less sugar than jar B.", wrong: ["Jar A has littler sugar than jar B.", "Jar A has more little sugar than jar B.", "Jar A has least sugar than jar B."], why: `"little" is irregular: little → less → least; the comparative is "less".` },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.correct, sc.wrong);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, "Which sentence is correct?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Decide whether the adjective is short (-er/-est), long (more/most) or irregular before you choose.",
      explanation: `"${sc.correct}" is correct — ${sc.why}`,
    };
  },
};
