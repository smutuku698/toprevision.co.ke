import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster, cap } from "./g5EngShared";

// KICD Grade 5 English, Theme 4.0 Road Accidents - Prevention, sub-strand 4.3 Word Class:
// Possessive Pronouns (mine, yours, his, hers, its, ours, theirs) vs possessive adjectives
// (my, your, his, her, its, our, their); also "belong(s) to". See curriculum-reference/grade-5/english.json.

const PAIRS: { adj: string; pron: string; person: string }[] = [
  { adj: "my", pron: "mine", person: "me" },
  { adj: "your", pron: "yours", person: "you" },
  { adj: "his", pron: "his", person: "him" },
  { adj: "her", pron: "hers", person: "her" },
  { adj: "its", pron: "its", person: "it" },
  { adj: "our", pron: "ours", person: "us" },
  { adj: "their", pron: "theirs", person: "them" },
];

const FILL_TPL: { before: string; after: string; pron: string }[] = [
  { before: "This reflective jacket is ", after: "; I bought it last term.", pron: "mine" },
  { before: "The blue helmet on the rack is ", after: " — you left it there.", pron: "yours" },
  { before: "That first-aid box is ", after: "; the nurse brought it.", pron: "hers" },
  { before: "The whistle the road prefect blew is ", after: ".", pron: "his" },
  { before: "These road-safety posters are ", after: "; our class made them.", pron: "ours" },
  { before: "The bicycles chained outside are ", after: "; the Grade 6 pupils ride them.", pron: "theirs" },
  { before: "This seat belt is ", after: ", not yours.", pron: "mine" },
  { before: "Whose torch is this? It is ", after: ".", pron: "his" },
  { before: "The green school bus is ", after: "; our school owns it.", pron: "ours" },
  { before: "Those new crossing signs are ", after: ", said the county workers.", pron: "theirs" },
  { before: "This safety badge is ", after: "; she earned it.", pron: "hers" },
  { before: "The broken brake light was ", after: ", the driver admitted.", pron: "his" },
];

function pronCluster(correct: string): string[] {
  const others = PAIRS.map((p) => p.pron).filter((p) => p !== correct);
  // add the matching possessive ADJECTIVE as a nameable error (using 'your' where 'yours' is needed)
  const adj = PAIRS.find((p) => p.pron === correct)?.adj;
  return Array.from(new Set([...(adj && adj !== correct ? [adj] : []), ...others]));
}

export const possessivePronouns: Skill = {
  id: "g5-eng-grammar-possessive-pronouns",
  code: "LU.4",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Possessive Pronouns",
  description: "Use possessive pronouns (mine, yours, his, hers, ours, theirs) correctly, and tell them apart from possessive adjectives (my, your, our, their).",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "sort", "match", "order", "reason"] as const);

    if (branch === "mc") {
      const t = randChoice(rng, FILL_TPL);
      const { choices, correctIndex } = mcFromCluster(rng, t.pron, pronCluster(t.pron));
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the correct possessive pronoun")}\n"${t.before}____${t.after}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "A possessive pronoun stands alone, with no noun after it. A possessive adjective (my, your, our, their) must have a noun after it.",
        explanation: `"${t.pron}" is correct — it stands alone in place of "the ... that belongs to that person". A common error is writing the possessive adjective (like "your") where the stand-alone pronoun ("yours") is needed.`,
      };
    }

    if (branch === "fill") {
      const t = randChoice(rng, FILL_TPL);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the possessive pronoun that fits"),
        before: t.before,
        after: t.after,
        correctAnswer: t.pron,
        acceptedAnswers: [t.pron],
        inputMode: "text",
        hint: "The word replaces a noun and shows who owns it. It ends the phrase — nothing comes right after it.",
        explanation: `"${t.pron}" is correct. Full sentence: "${cap((t.before + t.pron + t.after).trim())}"`,
      };
    }

    if (branch === "sort") {
      const prons = shuffle(rng, PAIRS.filter((p) => p.pron !== p.adj)).slice(0, 4).map((p) => p.pron);
      const adjs = ["my", "your", "our", "their"];
      const items = shuffle(rng, [
        ...prons.map((w, i) => ({ id: `p${i}`, label: w, kind: "pron" })),
        ...adjs.map((w, i) => ({ id: `a${i}`, label: w, kind: "adj" })),
      ]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each word stands alone (possessive pronoun) or needs a noun after it (possessive adjective)"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "pron", label: "Possessive pronoun (stands alone)" },
          { id: "adj", label: "Possessive adjective (comes before a noun)" },
        ],
        correctBucket,
        hint: "Try each word in 'That helmet is ___.' — if it sounds complete, it is a possessive pronoun.",
        explanation: "Possessive pronouns: mine, yours, his, hers, ours, theirs. Possessive adjectives: my, your, his, her, its, our, their (always followed by a noun).",
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, PAIRS.filter((p) => p.adj !== p.pron)).slice(0, 5);
      const tokens = shuffle(rng, pool.map((p) => ({ id: p.adj, label: p.adj + " (helmet)" })));
      const targets = shuffle(rng, pool.map((p) => ({ id: p.adj, label: `The helmet is ${p.pron}.` })));
      const correctMap: Record<string, string> = {};
      pool.forEach((p) => (correctMap[p.adj] = p.adj));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "possessive adjective to its possessive pronoun"),
        tokens,
        targets,
        correctMap,
        hint: "Change 'my helmet' to 'The helmet is mine.' — the pronoun replaces both the adjective and the noun.",
        explanation: pool.map((p) => `${p.adj} → ${p.pron}`).join("; "),
      };
    }

    if (branch === "order") {
      const t = randChoice(rng, FILL_TPL.filter((x) => x.after.trim() === "." || x.after.includes(".")));
      const clean = `${t.before}${t.pron}`.trim().replace(/\s+/g, " ");
      const words = clean.split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a correct sentence ending in a possessive pronoun"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: `The sentence ends with the possessive pronoun "${t.pron}".`,
        explanation: `Correct sentence: "${cap(clean)}."`,
      };
    }

    // reason — Apply: whose item is it? Rewrite "belongs to X" as a possessive pronoun.
    const scen: { s: string; person: string }[] = [
      { s: `After the road-safety drill, one reflective jacket is left on the bench. It belongs to ${name(rng)}, who is a girl.`, person: "her" },
      { s: `A first-aid kit was carried to the scene by the two Grade 6 monitors. It belongs to them.`, person: "them" },
      { s: `${name(rng)} points to the helmet in his own hands.`, person: "him" },
      { s: `Our class painted the "STOP, LOOK, LISTEN" poster on the wall. It belongs to us.`, person: "us" },
      { s: `You forgot your whistle on the crossing yesterday. It belongs to you.`, person: "you" },
      { s: `${name(rng)}, a boy, left his water bottle near the pedestrian crossing.`, person: "him" },
      { s: `The county workers installed the new road signs. The signs belong to them.`, person: "them" },
      { s: `${name(rng)}, a girl, earned the road-safety badge on her shirt.`, person: "her" },
      { s: `I brought this torch from home for the evening walk.`, person: "me" },
      { s: `The school owns the green bus that carries pupils to ${name(rng)}'s home.`, person: "us" },
    ];
    const sc = randChoice(rng, scen);
    const answer = PAIRS.find((p) => p.person === sc.person)!.pron;
    const { choices, correctIndex } = mcFromCluster(rng, answer, pronCluster(answer));
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, `Complete: "The item is ___." Which possessive pronoun is correct?`),
      choices,
      correctIndex,
      layout: "row",
      hint: "Work out who the owner is, then use the stand-alone possessive pronoun for that person.",
      explanation: `"${answer}" is correct — the item belongs to ${sc.person}. Remember: 'belongs to me' → mine, 'belongs to him' → his, 'belongs to us' → ours, and so on.`,
    };
  },
};
