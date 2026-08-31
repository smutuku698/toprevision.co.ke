import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the events of the fall of man in Genesis 3 in the correct order.",
  "Put these events from the fall of man into their correct order.",
  "Sequence these events of Genesis 3 correctly.",
  "Arrange these moments from the fall of man in order.",
  "Order these events the way they happened in Genesis 3.",
  "Sort these events into the order they happened in the fall of man.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as 'A consequence of the fall of man' or 'A cause of sin today'.",
  "Decide whether each statement is a consequence of the fall or a cause of sin today, and sort it there.",
  "Group these statements under consequence of the fall or cause of sin today.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for consequence or cause.",
  "Read each statement and sort it under consequence of the fall or cause today.",
];

const MATCH_PROMPTS = [
  "Match each value or life skill to how it helps overcome temptation.",
  "Pair each value below with how it helps resist temptation.",
  "Connect each value or skill to the way it helps overcome sin.",
  "Match each value to the statement that explains how it helps.",
  "Link each value or life skill to its role in resisting temptation.",
  "Match each value to the description of how it helps overcome sin.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const FALL_SEQUENCE = [
  { id: "s1", label: "The serpent questions Eve about what God really said" },
  { id: "s2", label: "Eve is deceived and eats the forbidden fruit" },
  { id: "s3", label: "Eve gives some of the fruit to Adam, and he eats it too" },
  { id: "s4", label: "Their eyes are opened and they realise they are naked" },
  { id: "s5", label: "They hide themselves among the trees of the garden" },
  { id: "s6", label: "God calls out and asks Adam where he is" },
  { id: "s7", label: "Adam blames Eve, and Eve blames the serpent" },
];

const CONSEQUENCES = [
  "The serpent is cursed to crawl on its belly (Genesis 3:14)",
  "Eve is told she will have pain in childbearing (Genesis 3:16)",
  "Adam must toil the cursed ground for food (Genesis 3:17-19)",
  "Adam and Eve are banished from the Garden of Eden (Genesis 3:23)",
  "Cain becomes a restless wanderer after killing Abel (Genesis 4:11-12)",
  "Human language is confused at the Tower of Babel (Genesis 11:1-9)",
];

const CAUSES_TODAY = [
  "Peer pressure from bad company",
  "Greed and love of material things",
  "Disobedience to parents, teachers, and God's word",
  "Poor upbringing and lack of moral guidance",
  "Curiosity and the desire to satisfy selfish desires",
];

const OVERCOME_VALUES: { term: string; meaning: string }[] = [
  { term: "Self-control", meaning: "Resisting the urge to give in to a tempting desire" },
  { term: "Assertiveness", meaning: "Saying no firmly to a wrong suggestion from others" },
  { term: "Decision-making", meaning: "Thinking through the consequences of an action before doing it" },
  { term: "Prayer", meaning: "Asking God for strength to resist temptation" },
  { term: "Wise choice of friends", meaning: "Avoiding company that leads one into sin" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "Who tempted Eve in the Garden of Eden?", a: "The serpent", explanation: "Genesis 3:1 records that the serpent, the craftiest of the wild animals, tempted Eve." },
  { q: "What did Adam and Eve realise immediately after eating the forbidden fruit?", a: "That they were naked", explanation: "Genesis 3:7 says their eyes were opened and they realised they were naked, so they made coverings." },
  { q: "According to 1 John 1:9, what should a Christian do after sinning?", a: "Confess their sins to God", explanation: "1 John 1:9 promises that if we confess our sins, God is faithful and just to forgive us." },
  { q: "What happened to human language at the Tower of Babel?", a: "God confused it and scattered the people", explanation: "Genesis 11:1-9 shows sin's consequences reaching beyond individuals to whole communities." },
  { q: "What happened to Cain after he killed his brother Abel?", a: "He became a cursed, restless wanderer", explanation: "Genesis 4:11-12 records Cain's punishment for murdering Abel out of jealousy." },
];

const FILL_BLANKS = [
  { before: "1 John 1:9 says: if we", after: "our sins, God is faithful and just to forgive us and cleanse us from all unrighteousness.", answer: "confess", accepted: ["confess", "confess our sins"] },
  { before: "Genesis 3:23 records that God banished Adam and Eve from the Garden of", after: ".", answer: "Eden", accepted: ["eden"] },
];

export const originAndConsequencesOfSin: Skill = {
  id: "g8-cre-cn-origin-and-consequences-of-sin",
  code: "CN.1",
  subjectId: "cre",
  strandId: "g8-cre-cn",
  grade: 8,
  title: "Origin and Consequences of Sin",
  description: "The origin of sin from the fall of man, its consequences, causes of sin today, and values needed to overcome temptation.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "recall", "blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, FALL_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: FALL_SEQUENCE.map((s) => s.id),
        hint: "Start with the serpent's temptation and end with Adam and Eve blaming each other before God.",
        explanation: FALL_SEQUENCE.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const consequences = shuffle(rng, CONSEQUENCES).slice(0, 3);
      const causes = shuffle(rng, CAUSES_TODAY).slice(0, 3);
      const items = shuffle(rng, [
        ...consequences.map((c, i) => ({ id: `c${i}`, label: c, bucket: "consequence" })),
        ...causes.map((c, i) => ({ id: `t${i}`, label: c, bucket: "today" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "consequence", label: "A consequence of the fall of man" },
          { id: "today", label: "A cause of sin today" },
        ],
        correctBucket,
        hint: "Consequences happened to Adam, Eve, and their descendants after the fall. Causes today are why people still sin now.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "consequence" ? "a consequence of the fall of man" : "a cause of sin today"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, OVERCOME_VALUES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.term] = v.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "These are moral values and life skills that help a Christian resist giving in to sin.",
        explanation: chosen.map((v) => `${v.term} — ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "recall") {
      const target = randChoice(rng, FACTS);
      const distractors = shuffle(rng, FACTS.filter((f) => f.a !== target.a)).slice(0, 3).map((f) => f.a);
      const choices = shuffle(rng, [target.a, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: target.q,
        choices,
        correctIndex: choices.indexOf(target.a),
        layout: "list",
        hint: "Recall what happened in Genesis 3 and its aftermath.",
        explanation: target.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS)(fb.before, fb.after),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: fb.accepted,
      inputMode: "text",
      hint: "Think about the exact wording of the scripture.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
