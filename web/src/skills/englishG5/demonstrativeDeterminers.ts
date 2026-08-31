import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster, cap } from "./g5EngShared";

// KICD Grade 5 English, Theme 1.0 Child Rights and Responsibilities, sub-strand 1.3 Word Class:
// Demonstrative Determiners — this, these, that, those. The 2x2 system: near/far x singular/plural.
// See curriculum-reference/grade-5/english.json.

type Dem = "this" | "these" | "that" | "those";
const NUMBER: Record<Dem, "one" | "more than one"> = { this: "one", that: "one", these: "more than one", those: "more than one" };
const DISTANCE: Record<Dem, "near" | "far"> = { this: "near", these: "near", that: "far", those: "far" };

type Tpl = { answer: Dem; before: string; after: string };
const TEMPLATES: Tpl[] = [
  { answer: "this", before: "", after: " pen in my hand has run out of ink." },
  { answer: "these", before: "", after: " shoes I am wearing are too tight." },
  { answer: "that", before: "", after: " poster on the far wall shows children's rights." },
  { answer: "those", before: "", after: " children across the road are walking to school." },
  { answer: "this", before: "Read ", after: " sentence I am pointing at right now." },
  { answer: "these", before: "", after: " notes here in my file are about our responsibilities at home." },
  { answer: "that", before: "Can you see ", after: " bird on the roof over there?" },
  { answer: "those", before: "", after: " desks at the back of the class are empty." },
  { answer: "this", before: "", after: " cup next to me still has tea in it." },
  { answer: "these", before: "", after: " oranges in my basket are ripe." },
  { answer: "that", before: "", after: " house at the end of the street belongs to my aunt." },
  { answer: "those", before: "", after: " clouds far away in the sky look like rain." },
  { answer: "this", before: "I wrote ", after: " letter that you are holding." },
  { answer: "these", before: "", after: " books beside me need to be covered." },
  { answer: "that", before: "Hand me ", after: " ruler on the far table, please." },
  { answer: "those", before: "", after: " mangoes on the top branch are not ripe yet." },
];

function clusterFor(answer: Dem): Dem[] {
  const all: Dem[] = ["this", "these", "that", "those"];
  return all.filter((d) => d !== answer);
}

export const demonstrativeDeterminers: Skill = {
  id: "g5-eng-grammar-demonstrative-determiners",
  code: "LU.1",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Demonstrative Determiners (this, these, that, those)",
  description: "Identify and use the demonstrative determiners this, these, that and those, showing whether an object is near or far and singular or plural.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "sort", "match", "order", "reason"] as const);

    if (branch === "mc") {
      const t = randChoice(rng, TEMPLATES);
      const { choices, correctIndex } = mcFromCluster(rng, t.answer, clusterFor(t.answer));
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the demonstrative determiner")}\n"${t.before}____${t.after}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "First ask: is the object near or far? Then ask: is it one thing or more than one?",
        explanation: `"${t.answer}" is correct — the object is ${DISTANCE[t.answer]} and ${NUMBER[t.answer] === "one" ? "singular (one)" : "plural (more than one)"}. "this/these" are for near things; "that/those" for far things; "this/that" are singular; "these/those" are plural.`,
      };
    }

    if (branch === "fill") {
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the demonstrative determiner (this, these, that, or those)"),
        before: t.before,
        after: t.after,
        correctAnswer: t.answer,
        acceptedAnswers: [t.answer],
        inputMode: "text",
        hint: `The object is ${DISTANCE[t.answer]} and there ${NUMBER[t.answer] === "one" ? "is one" : "are more than one"}.`,
        explanation: `The sentence needs "${t.answer}" — ${DISTANCE[t.answer]} + ${NUMBER[t.answer]}. Full sentence: "${cap((t.before + t.answer + t.after).trim())}"`,
      };
    }

    if (branch === "sort") {
      const by = randChoice(rng, ["distance", "number"] as const);
      const pool = shuffle(rng, TEMPLATES).slice(0, 6);
      const items = pool.map((t, i) => ({ id: `s${i}`, label: `${t.before}${t.answer.toUpperCase()}${t.after}` }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((t, i) => {
        correctBucket[`s${i}`] = by === "distance" ? DISTANCE[t.answer] : (NUMBER[t.answer] === "one" ? "singular" : "plural");
      });
      const buckets = by === "distance"
        ? [{ id: "near", label: "Near (this / these)" }, { id: "far", label: "Far (that / those)" }]
        : [{ id: "singular", label: "One thing (this / that)" }, { id: "plural", label: "More than one (these / those)" }];
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, by === "distance" ? "whether the highlighted word points to something near or far" : "whether the highlighted word points to one thing or more than one"),
        items,
        buckets,
        correctBucket,
        hint: by === "distance" ? "'this' and 'these' = close to the speaker; 'that' and 'those' = further away." : "'this' and 'that' point to one; 'these' and 'those' point to more than one.",
        explanation: by === "distance"
          ? "Near: this (one), these (more than one). Far: that (one), those (more than one)."
          : "Singular: this (near), that (far). Plural: these (near), those (far).",
      };
    }

    if (branch === "match") {
      const rows: { d: Dem; desc: string }[] = [
        { d: "this", desc: "near + one thing" },
        { d: "these", desc: "near + more than one" },
        { d: "that", desc: "far + one thing" },
        { d: "those", desc: "far + more than one" },
      ];
      const tokens = shuffle(rng, rows.map((r) => ({ id: r.d, label: r.d })));
      const targets = shuffle(rng, rows.map((r) => ({ id: r.d, label: r.desc })));
      const correctMap: Record<string, string> = {};
      rows.forEach((r) => (correctMap[r.d] = r.d));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "demonstrative determiner to its meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Break each word into two ideas: how far away, and how many.",
        explanation: "this = near + one; these = near + many; that = far + one; those = far + many.",
      };
    }

    if (branch === "order") {
      const t = randChoice(rng, TEMPLATES.filter((x) => x.before === "" && x.after.trim().endsWith(".")));
      const sentence = `${t.answer}${t.after}`.trim();
      const words = sentence.replace(/\.$/, "").split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a correct sentence"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: `The sentence begins with the demonstrative "${t.answer}".`,
        explanation: `Correct sentence: "${cap(sentence)}"`,
      };
    }

    // reason — Apply/Evaluate: a described real situation, pick the demonstrative that fits.
    const scenarios: { s: string; q: string; answer: Dem }[] = [
      { s: `${name(rng)} is holding one exercise book and pointing at a pile of books on a shelf across the room.`, q: `She says, "I need ___ books on the shelf." Which word fits?`, answer: "those" },
      { s: `${name(rng)} picks up a single ripe mango from the basket in front of him.`, q: `He says, "___ mango is the best one." Which word fits?`, answer: "this" },
      { s: `A teacher stands next to two charts on the wall right beside her.`, q: `She says, "___ charts explain your rights." Which word fits?`, answer: "these" },
      { s: `${name(rng)} sees one lost child standing far away near the ${place(rng)} bus stop.`, q: `He says, "___ child looks lost." Which word fits?`, answer: "that" },
      { s: `${name(rng)} is wearing a pair of new shoes and looking down at them.`, q: `She says, "___ shoes are comfortable." Which word fits?`, answer: "these" },
      { s: `${name(rng)} points at a single desk at the very back of the class.`, q: `He says, "___ desk is broken." Which word fits?`, answer: "that" },
      { s: `${name(rng)} holds up one letter in her hand for the class to see.`, q: `She says, "___ letter is from my pen friend." Which word fits?`, answer: "this" },
      { s: `${name(rng)} looks at a group of birds sitting far off on the ${place(rng)} rooftops.`, q: `He says, "___ birds are weaver birds." Which word fits?`, answer: "those" },
      { s: `${name(rng)} taps the one book lying open on the desk right in front of her.`, q: `She says, "Finish reading ___ page." Which word fits?`, answer: "this" },
      { s: `${name(rng)} points at several oranges spread out on the mat beside him.`, q: `He says, "___ oranges are for sharing." Which word fits?`, answer: "these" },
      { s: `${name(rng)} notices two clouds far away over the ${place(rng)} hills.`, q: `She says, "___ clouds might bring rain." Which word fits?`, answer: "those" },
      { s: `${name(rng)} holds one pencil close and points at a ruler on the far table.`, q: `He says, "Please pass me ___ ruler." Which word fits?`, answer: "that" },
    ];
    const sc = randChoice(rng, scenarios);
    const { choices, correctIndex } = mcFromCluster(rng, sc.answer, clusterFor(sc.answer));
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, sc.q),
      choices,
      correctIndex,
      layout: "row",
      hint: "Use two clues from the situation: how far the objects are, and how many there are.",
      explanation: `"${sc.answer}" is correct — the objects are ${DISTANCE[sc.answer]} and ${NUMBER[sc.answer] === "one" ? "singular" : "plural"}. A common mistake is matching the distance but forgetting the number (or the other way round).`,
    };
  },
};
