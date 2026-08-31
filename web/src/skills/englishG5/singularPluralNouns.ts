import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster, cap } from "./g5EngShared";

// KICD Grade 5 English, Theme 12.0 Environmental Pollution, sub-strand 12.3 Word Class: Nouns —
// nouns that are the same in singular and plural, nouns that occur only in the singular, and nouns
// that occur only in the plural. See curriculum-reference/grade-5/english.json.

type Cat = "same" | "singular-only" | "plural-only";
const NOUNS: { word: string; cat: Cat; verb: "singular" | "plural" }[] = [
  { word: "sheep", cat: "same", verb: "plural" },
  { word: "deer", cat: "same", verb: "plural" },
  { word: "fish", cat: "same", verb: "plural" },
  { word: "aircraft", cat: "same", verb: "plural" },
  { word: "species", cat: "same", verb: "plural" },
  { word: "series", cat: "same", verb: "singular" },
  { word: "news", cat: "singular-only", verb: "singular" },
  { word: "dirt", cat: "singular-only", verb: "singular" },
  { word: "waste", cat: "singular-only", verb: "singular" },
  { word: "rubbish", cat: "singular-only", verb: "singular" },
  { word: "information", cat: "singular-only", verb: "singular" },
  { word: "advice", cat: "singular-only", verb: "singular" },
  { word: "litter", cat: "singular-only", verb: "singular" },
  { word: "sewage", cat: "singular-only", verb: "singular" },
  { word: "pollution", cat: "singular-only", verb: "singular" },
  { word: "scissors", cat: "plural-only", verb: "plural" },
  { word: "trousers", cat: "plural-only", verb: "plural" },
  { word: "glasses", cat: "plural-only", verb: "plural" },
  { word: "pliers", cat: "plural-only", verb: "plural" },
  { word: "tongs", cat: "plural-only", verb: "plural" },
  { word: "clothes", cat: "plural-only", verb: "plural" },
  { word: "surroundings", cat: "plural-only", verb: "plural" },
  { word: "belongings", cat: "plural-only", verb: "plural" },
];

// verb-agreement sentences (blank = is/are or was/were)
const AGREE_TPL: { subj: string; verb: "is" | "are" | "was" | "were"; after: string }[] = [
  { subj: "The news about the river clean-up", verb: "is", after: " encouraging." },
  { subj: "The dirt on the classroom floor", verb: "was", after: " swept up before break." },
  { subj: "The plastic waste along the road", verb: "is", after: " a serious problem." },
  { subj: "My scissors for cutting the poster", verb: "are", after: " on the desk." },
  { subj: "These trousers", verb: "are", after: " stained with mud from the dump." },
  { subj: "The rubbish behind the market", verb: "was", after: " burning again yesterday." },
  { subj: "The information on the recycling chart", verb: "is", after: " easy to follow." },
  { subj: "The pliers in the tool box", verb: "were", after: " rusty." },
  { subj: "Three sheep near the polluted stream", verb: "were", after: " grazing quietly." },
  { subj: "Litter from the picnic", verb: "was", after: " scattered everywhere." },
  { subj: "The sewage from the broken pipe", verb: "is", after: " flowing into the drain." },
  { subj: "Her glasses", verb: "were", after: " covered in smog dust." },
];

export const singularPluralNouns: Skill = {
  id: "g5-eng-grammar-singular-plural-nouns",
  code: "LU.12",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Nouns: Singular-only, Plural-only, and Same in Both",
  description: "Recognise nouns that stay the same in singular and plural (sheep, fish), nouns used only in the singular (news, rubbish), and nouns used only in the plural (scissors, trousers), and make the verb agree.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-agree", "fill-agree", "sort-cat", "match", "order", "reason"] as const);

    if (branch === "mc-agree") {
      const t = randChoice(rng, AGREE_TPL);
      const wrong = t.verb === "is" ? ["are", "were", "am"] : t.verb === "are" ? ["is", "was", "be"] : t.verb === "was" ? ["were", "is", "been"] : ["was", "are", "be"];
      const { choices, correctIndex } = mcFromCluster(rng, t.verb, wrong);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the verb that agrees with the subject")}\n"${t.subj} ____${t.after}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Some nouns end in -s but take a singular verb (news, series). Others have no singular form and take a plural verb (scissors, trousers).",
        explanation: `"${t.verb}" is correct. Even though "${t.subj.split(" ").pop()}" ${["news", "series"].some((w) => t.subj.toLowerCase().includes(w)) ? "ends in -s, it is treated as singular" : t.subj.toLowerCase().includes("scissors") || t.subj.toLowerCase().includes("trousers") || t.subj.toLowerCase().includes("pliers") || t.subj.toLowerCase().includes("glasses") ? "has no singular form, so it takes a plural verb" : "the subject decides whether the verb is singular or plural"}.`,
      };
    }

    if (branch === "fill-agree") {
      const t = randChoice(rng, AGREE_TPL);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "'is', 'are', 'was' or 'were'"),
        before: `${t.subj} `,
        after: t.after,
        correctAnswer: t.verb,
        acceptedAnswers: [t.verb],
        inputMode: "text",
        hint: "Decide whether the subject noun is treated as one thing or more than one.",
        explanation: `"${t.verb}" is correct. Full sentence: "${t.subj} ${t.verb}${t.after}"`,
      };
    }

    if (branch === "sort-cat") {
      const pool = shuffle(rng, NOUNS).slice(0, 8);
      const items = pool.map((n, i) => ({ id: `n${i}`, label: n.word }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((n, i) => (correctBucket[`n${i}`] = n.cat));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "how each noun behaves"),
        items,
        buckets: [
          { id: "same", label: "Same in singular and plural (sheep, fish)" },
          { id: "singular-only", label: "Singular only (news, rubbish)" },
          { id: "plural-only", label: "Plural only (scissors, trousers)" },
        ],
        correctBucket,
        hint: "Try saying 'one ___' and 'two ___'. If neither changes, it is 'same'. If 'one' sounds wrong, it is plural-only. If 'two' sounds wrong, it is singular-only.",
        explanation: "Same: sheep, deer, fish, aircraft, species. Singular-only: news, dirt, waste, rubbish, information, advice, litter, sewage, pollution. Plural-only: scissors, trousers, glasses, pliers, tongs, clothes, belongings, surroundings.",
      };
    }

    if (branch === "match") {
      // Match noun subject to its full example sentence (unique per entry) rather than to the bare
      // "singular/plural verb" category label, which only has 2 possible values and would collide once
      // more than 2 items are sampled — see RIGOR-STANDARDS.md's target-label-collision guidance.
      const pool = shuffle(rng, AGREE_TPL).slice(0, 5);
      const tokens = shuffle(rng, pool.map((t, i) => ({ id: `p${i}`, label: t.subj })));
      const targets = shuffle(rng, pool.map((t, i) => ({ id: `p${i}`, label: `${t.subj} ${t.verb}${t.after}` })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_t, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "noun subject to the sentence with the correct verb"),
        tokens,
        targets,
        correctMap,
        hint: "'news' and 'rubbish' feel like one lump → singular verb. 'scissors' and 'trousers' feel like a pair → plural verb.",
        explanation: pool.map((t) => `"${t.subj} ${t.verb}${t.after}"`).join("  "),
      };
    }

    if (branch === "order") {
      const t = randChoice(rng, AGREE_TPL);
      const sentence = `${t.subj} ${t.verb}${t.after}`.trim().replace(/\.$/, "");
      const words = sentence.split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a correct sentence"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: `The verb "${t.verb}" must agree with the subject noun.`,
        explanation: `Correct sentence: "${cap(sentence)}."`,
      };
    }

    // reason — Analyze: spot and fix the agreement error.
    const scen: { s: string; correct: string; wrong: string[]; why: string }[] = [
      { s: "A pupil writes about the river report.", correct: "The news about the pollution is worrying.", wrong: ["The news about the pollution are worrying.", "The news about the pollution were worrying.", "The news about the pollution be worrying."], why: `"news" ends in -s but is always singular, so it takes "is".` },
      { s: "A pupil describes the tools left out after the clean-up.", correct: "The pliers are on the bench.", wrong: ["The pliers is on the bench.", "The pliers was on the bench.", "A pliers is on the bench."], why: `"pliers" has no singular form and always takes a plural verb.` },
      { s: "A pupil counts animals near the stream.", correct: "Five sheep are drinking from the stream.", wrong: ["Five sheeps are drinking from the stream.", "Five sheep is drinking from the stream.", "Five sheep was drinking from the stream."], why: `"sheep" is the same in singular and plural — no "-s" — but "five sheep" takes a plural verb.` },
      { s: "A pupil writes about facts on a recycling poster.", correct: "The information on the poster is helpful.", wrong: ["The information on the poster are helpful.", "The informations on the poster are helpful.", "The information on the poster were helpful."], why: `"information" is uncountable and singular; there is no "informations".` },
      { s: "A pupil writes about clothes soaked in the flood.", correct: "My clothes were ruined by the dirty water.", wrong: ["My clothes was ruined by the dirty water.", "My clothe was ruined by the dirty water.", "My clothes is ruined by the dirty water."], why: `"clothes" is plural-only and takes a plural verb ("were").` },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.correct, sc.wrong);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, "Which sentence is written correctly?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Check two things: is there a wrong '-s' on the noun, and does the verb match?",
      explanation: `"${sc.correct}" is correct — ${sc.why}`,
    };
  },
};
