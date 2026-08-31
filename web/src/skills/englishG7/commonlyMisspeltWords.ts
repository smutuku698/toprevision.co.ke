import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PLURALS: { base: string; correct: string; wrongs: string[] }[] = [
  { base: "knife", correct: "knives", wrongs: ["knifes", "knive", "knifs"] },
  { base: "ox", correct: "oxen", wrongs: ["oxes", "oxens", "oxs"] },
  { base: "fox", correct: "foxes", wrongs: ["foxs", "foxies", "foxxes"] },
  { base: "child", correct: "children", wrongs: ["childs", "childrens", "childern"] },
  { base: "thief", correct: "thieves", wrongs: ["thiefs", "thiefes", "theives"] },
  { base: "lady", correct: "ladies", wrongs: ["ladys", "laddies", "ladies's"] },
  { base: "monkey", correct: "monkeys", wrongs: ["monkies", "monkeis", "monkeyes"] },
];

const ING_VERBS: { base: string; correct: string; wrongs: string[] }[] = [
  { base: "love", correct: "loving", wrongs: ["loveing", "lovving", "lovng"] },
  { base: "dine", correct: "dining", wrongs: ["dineing", "dinning", "dinng"] },
  { base: "hope", correct: "hoping", wrongs: ["hopeing", "hopping", "hopng"] },
  { base: "write", correct: "writing", wrongs: ["writeing", "writting", "writng"] },
  { base: "come", correct: "coming", wrongs: ["comeing", "commming", "comming"] },
  { base: "live", correct: "living", wrongs: ["liveing", "livving", "livng"] },
  { base: "make", correct: "making", wrongs: ["makeing", "makking", "makng"] },
  { base: "use", correct: "using", wrongs: ["useing", "ussing", "usng"] },
  { base: "believe", correct: "believing", wrongs: ["believeing", "believving", "beleiving"] },
  { base: "decide", correct: "deciding", wrongs: ["decideing", "decidding", "desciding"] },
];

const SENTENCES: { before: string; after: string; base: string; correctAnswer: string; type: "plural" | "ing" }[] = [
  { before: "The workshop warned that carrying", after: "to settle arguments only makes conflicts worse.", base: "knife", correctAnswer: "knives", type: "plural" },
  { before: "The reformed drug users started a project training", after: "to plough fields as a peaceful new livelihood.", base: "ox", correctAnswer: "oxen", type: "plural" },
  { before: "During the nature-therapy walk, recovering addicts watched troops of", after: "playing peacefully in the trees.", base: "monkey", correctAnswer: "monkeys", type: "plural" },
  { before: "The rehabilitation centre now supports the", after: "whose parents are recovering from addiction.", base: "child", correctAnswer: "children", type: "plural" },
  { before: "Before he joined the peace programme, he ran with a gang of", after: "stealing to fund drug habits.", base: "thief", correctAnswer: "thieves", type: "plural" },
  { before: "Several", after: "from the estate started a support group for families affected by substance abuse.", base: "lady", correctAnswer: "ladies", type: "plural" },
  { before: "More youths are", after: "forward to join the anti-drug support group each week.", base: "come", correctAnswer: "coming", type: "ing" },
  { before: "Former gang members are now", after: "together peacefully at the community reconciliation table.", base: "dine", correctAnswer: "dining", type: "ing" },
  { before: "The recovering addicts are", after: "for a fresh start free from drugs.", base: "hope", correctAnswer: "hoping", type: "ing" },
  { before: "The peace club is", after: "posters to warn students about the dangers of substance abuse.", base: "make", correctAnswer: "making", type: "ing" },
  { before: "He stopped", after: "drugs after joining the rehabilitation programme.", base: "use", correctAnswer: "using", type: "ing" },
  { before: "Everyone in the programme is", after: "that recovery and peace are possible.", base: "believe", correctAnswer: "believing", type: "ing" },
  { before: "She is", after: "to help other teenagers avoid the same mistakes she made.", base: "decide", correctAnswer: "deciding", type: "ing" },
  { before: "The counsellor spent the afternoon", after: "letters of encouragement to recovering addicts.", base: "write", correctAnswer: "writing", type: "ing" },
  { before: "The peace ambassadors are", after: "proof that young people can choose a drug-free path.", base: "live", correctAnswer: "living", type: "ing" },
];

export const commonlyMisspeltWords: Skill = {
  id: "g7-eng-w-commonly-misspelt-words",
  code: "W.6",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Commonly Misspelt Words",
  description: "Spell irregular plurals (knife-knives, ox-oxen, child-children) and -ing forms of silent-e verbs (love-loving, dine-dining) correctly, in a peace and anti-drug context.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-plural", "mc-ing", "fill", "match", "categorize"] as const);
    const hint = "Some plurals change irregularly (knife → knives, ox → oxen, child → children). When adding -ing to a verb ending in a silent 'e', drop the 'e' first (love → loving, dine → dining).";

    if (branch === "mc-plural") {
      const entry = randChoice(rng, PLURALS);
      const choices = shuffle(rng, [entry.correct, ...shuffle(rng, entry.wrongs).slice(0, 3)]);
      return {
        kind: "multiple-choice",
        prompt: `Which is the correct plural spelling of "${entry.base}"?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "row",
        hint,
        explanation: `The correct plural of "${entry.base}" is "${entry.correct}".`,
      };
    }

    if (branch === "mc-ing") {
      const entry = randChoice(rng, ING_VERBS);
      const choices = shuffle(rng, [entry.correct, ...shuffle(rng, entry.wrongs).slice(0, 3)]);
      return {
        kind: "multiple-choice",
        prompt: `Which is the correct -ing spelling of "${entry.base}"?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "row",
        hint,
        explanation: `The correct -ing form of "${entry.base}" is "${entry.correct}" — drop the silent 'e' before adding -ing.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, SENTENCES);
      return {
        kind: "fill-blank",
        prompt: `Fill in the correctly spelt ${entry.type === "plural" ? "plural" : "-ing"} form of "${entry.base}".`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    if (branch === "match") {
      const pluralsChosen = shuffle(rng, PLURALS).slice(0, 2);
      const ingChosen = shuffle(rng, ING_VERBS).slice(0, 2);
      const chosen = shuffle(rng, [...pluralsChosen, ...ingChosen]);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.base, label: c.base })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.base, label: c.correct })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.base] = c.base;
      return {
        kind: "click-match",
        prompt: "Match each base word to its correctly spelt derived form.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((c) => `"${c.base}" → "${c.correct}"`).join(" "),
      };
    }

    const pluralsChosen = shuffle(rng, PLURALS).slice(0, 3);
    const ingChosen = shuffle(rng, ING_VERBS).slice(0, 3);
    const items = shuffle(rng, [
      ...pluralsChosen.map((p) => ({ id: p.base, label: p.base, bucket: "plural" })),
      ...ingChosen.map((v) => ({ id: v.base, label: v.base, bucket: "ing" })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const it of items) correctBucket[it.id] = it.bucket;
    return {
      kind: "categorize",
      prompt: "Sort each base word by what happens when it changes form: it becomes an Irregular plural, or it becomes an -ing form by dropping a silent 'e'.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "plural", label: "Irregular plural" },
        { id: "ing", label: "-ing form (drop silent 'e')" },
      ],
      correctBucket,
      hint,
      explanation: `Irregular plurals: ${pluralsChosen.map((p) => `${p.base} → ${p.correct}`).join(", ")}. -ing forms: ${ingChosen.map((v) => `${v.base} → ${v.correct}`).join(", ")}.`,
    };
  },
};
