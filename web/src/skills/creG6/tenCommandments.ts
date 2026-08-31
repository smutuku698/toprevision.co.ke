import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

// Compose a larger prompt pool from a small set of openers x closers (per RIGOR-STANDARDS.md's
// "affordable way to reach 20+" technique) instead of hand-authoring every sentence separately.
function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "the Ten Commandments in the order Exodus 20:3-17 gives them.",
    "these commandments in their correct numbered order from Exodus 20.",
    "the Ten Commandments from the first to the tenth.",
    "these commandments into the order they appear in Exodus 20:3-17.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each commandment into the bucket for whether it is about our relationship with God or with others.",
    "these commandments under the correct heading.",
    "each commandment below by whether it guides how we treat God or how we treat people.",
    "each commandment into the bucket for God-focused or people-focused.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each commandment to the value or life skill it teaches.",
    "each commandment below with the value it is best known for.",
    "each commandment to the lesson it teaches about living well.",
    "each commandment to the value that best explains why it matters.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the Ten Commandments.",
    "the correct missing word.",
  ],
);

// The Ten Commandments in their explicit numbered order from Exodus 20:3-17 — curriculum-endorsed
// sequential content, not an invented order (matching the precedent set by CN.1's CREATION_DAYS).
const COMMANDMENTS = [
  { id: "c1", label: "1st: You shall have no other gods before God" },
  { id: "c2", label: "2nd: You shall not make for yourself an idol" },
  { id: "c3", label: "3rd: You shall not misuse the name of the Lord your God" },
  { id: "c4", label: "4th: Remember the Sabbath day, to keep it holy" },
  { id: "c5", label: "5th: Honour your father and your mother" },
  { id: "c6", label: "6th: You shall not murder" },
  { id: "c7", label: "7th: You shall not commit adultery" },
  { id: "c8", label: "8th: You shall not steal" },
  { id: "c9", label: "9th: You shall not give false testimony against your neighbour" },
  { id: "c10", label: "10th: You shall not covet what belongs to your neighbour" },
];

// God-focused commandments (1st-4th, about our relationship with God) vs. people-focused (5th-10th, about
// our relationship with others) — a grouping named directly in the sub-strand's own content on the Ten
// Commandments' importance, not an invented split.
const COMMANDMENT_FACTS: { text: string; group: "god" | "people" }[] = [
  { text: "You shall have no other gods before God", group: "god" },
  { text: "You shall not make or worship an idol", group: "god" },
  { text: "You shall not misuse the name of the Lord your God", group: "god" },
  { text: "Remember the Sabbath day, to keep it holy", group: "god" },
  { text: "Honour your father and your mother", group: "people" },
  { text: "You shall not murder", group: "people" },
  { text: "You shall not commit adultery", group: "people" },
  { text: "You shall not steal", group: "people" },
  { text: "You shall not give false testimony against your neighbour", group: "people" },
  { text: "You shall not covet what belongs to your neighbour", group: "people" },
];

const VALUE_LESSON: { term: string; evidence: string }[] = [
  { term: "Worship of God alone", evidence: "The 1st commandment teaches loyalty to God above every other god or idol" },
  { term: "Reverence", evidence: "The 3rd commandment teaches respect for God's name, not using it carelessly or falsely" },
  { term: "Rest and worship", evidence: "The 4th commandment teaches setting aside regular time to rest and honour God" },
  { term: "Respect for parents", evidence: "The 5th commandment teaches honouring one's father and mother" },
  { term: "Respect for life", evidence: "The 6th commandment, against murder, teaches that every human life is valuable" },
  { term: "Faithfulness", evidence: "The 7th commandment, against adultery, teaches loyalty within marriage and family" },
  { term: "Honesty about property", evidence: "The 8th commandment, against stealing, teaches respecting what belongs to others" },
  { term: "Truthfulness", evidence: "The 9th commandment, against false testimony, teaches telling the truth about others" },
  { term: "Contentment", evidence: "The 10th commandment, against coveting, teaches being satisfied instead of envying others" },
  { term: "Peace with neighbours", evidence: "Together, the commandments about people teach living peacefully and fairly with others" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} finds a classmate's pencil case and decides to keep it instead of returning it. Which of the Ten Commandments from Exodus 20:3-17 does this break?`,
    correct: "You shall not steal",
    wrong: [
      "You shall not covet what belongs to your neighbour",
      "You shall not give false testimony against your neighbour",
      "Remember the Sabbath day, to keep it holy",
    ],
    explanation: "Keeping something that belongs to someone else without permission directly breaks the 8th commandment, 'You shall not steal.'",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} tells the teacher a false story blaming a classmate for something ${who} did. Which commandment does this break?`,
      correct: "You shall not give false testimony against your neighbour",
      wrong: [
        "You shall not steal",
        "You shall not covet what belongs to your neighbour",
        "Honour your father and your mother",
      ],
      explanation: "Telling a false story that blames someone else directly breaks the 9th commandment, against giving false testimony.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} constantly wishes they had a classmate's new bicycle and feels bitter and jealous whenever they see it. Which commandment addresses this attitude?`,
      correct: "You shall not covet what belongs to your neighbour",
      wrong: [
        "You shall not steal",
        "You shall not murder",
        "You shall not commit adultery",
      ],
      explanation: "Envying and wishing you had what belongs to someone else, even without taking it, is exactly what the 10th commandment against coveting addresses.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} refuses to listen to or respect their parents' instructions at home. Which commandment does this go against?`,
    correct: "Honour your father and your mother",
    wrong: [
      "Remember the Sabbath day, to keep it holy",
      "You shall not make for yourself an idol",
      "You shall not misuse the name of the Lord your God",
    ],
    explanation: "Refusing to respect and listen to one's parents goes directly against the 5th commandment, to honour father and mother.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked to sort the commandments into two groups: those about our relationship with God, and those about our relationship with others. Which group does 'Remember the Sabbath day, to keep it holy' belong to?`,
    correct: "Our relationship with God, since it is about setting aside time to worship Him",
    wrong: [
      "Our relationship with others, since resting affects neighbours directly",
      "It belongs to neither group, since it is not really a commandment",
      "It belongs equally to both groups with no clearer classification",
    ],
    explanation: "The first four commandments, including the Sabbath commandment, focus on our relationship with God — the last six focus on our relationship with others.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that only the commandments about God, not the ones about people, are actually important to obey. Based on Exodus 20:3-17, is this a fair understanding?`,
    correct: "No — the Ten Commandments include both how we relate to God and how we relate to others, and both groups matter",
    wrong: [
      "Yes — the commandments about people are only suggestions, not requirements",
      "Yes — Exodus 20:3-17 only lists commandments about God",
      "No — but only the commandments about people actually matter",
    ],
    explanation: "Exodus 20:3-17 gives ten commandments in total — four about our relationship with God and six about our relationship with others — and all ten matter.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A shopkeeper in ${place(rng)} gives ${who} extra change by mistake, and ${who} quietly walks away without returning it. Which commandment does this situation raise?`,
      correct: "You shall not steal",
      wrong: [
        "You shall not covet what belongs to your neighbour",
        "You shall not give false testimony against your neighbour",
        "You shall not commit adultery",
      ],
      explanation: "Deliberately keeping money that is not yours, even if it was given by mistake, is a form of taking what belongs to someone else — breaking the 8th commandment.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says using God's name carelessly in everyday jokes or curses is not a big deal. Which commandment does this attitude go against?`,
    correct: "You shall not misuse the name of the Lord your God",
    wrong: [
      "You shall not make for yourself an idol",
      "Honour your father and your mother",
      "You shall not murder",
    ],
    explanation: "The 3rd commandment specifically warns against misusing God's name — treating it carelessly is exactly what it addresses.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} gets into a fight and seriously injures a classmate on purpose. Which commandment does this most seriously break?`,
    correct: "You shall not murder",
    wrong: [
      "You shall not steal",
      "You shall not covet what belongs to your neighbour",
      "Remember the Sabbath day, to keep it holy",
    ],
    explanation: "The 6th commandment against murder is about respecting human life and protecting others from serious harm.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims that obeying the Ten Commandments has nothing to do with peace and respect between people. Based on what CRE teaches, is this claim accurate?`,
    correct: "No — the commandments about people (honouring parents, not stealing, not lying, not coveting) teach exactly how to live peacefully and respectfully with others",
    wrong: [
      "Yes — the commandments only concern how we worship God, never people",
      "Yes — the Ten Commandments have no connection to values or life skills",
      "No — but only the commandment about murder relates to peace",
    ],
    explanation: "Six of the Ten Commandments directly address how we treat other people — honesty, respect, faithfulness, and contentment all support living peacefully together.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why Grade 6 learners should still care about the Ten Commandments today. What is the best answer, based on the lesson's key inquiry question?`,
    correct: "Because obeying them helps us live well with God and with the people around us",
    wrong: [
      "Because they were only meant for people living in ancient times",
      "Because breaking them has no real consequences for how we treat others",
      "Because they are simply old rules with no connection to daily life",
    ],
    explanation: "The lesson's key inquiry question, 'Why should you obey the Ten Commandments?', is answered by seeing how they guide healthy relationships with both God and other people.",
  }),
];

export const tenCommandments: Skill = {
  id: "g6-cre-bi-ten-commandments",
  code: "BI.2",
  subjectId: "cre",
  strandId: "g6-cre-bible",
  grade: 6,
  title: "The Ten Commandments",
  description: "The Ten Commandments from Exodus 20:3-17, grouped by our relationship with God and with others, and the values and life skills they teach.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, COMMANDMENTS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the 1st commandment to the 10th.",
        items,
        correctOrder: COMMANDMENTS.map((c) => c.id),
        hint: "The first four commandments are about our relationship with God; the last six are about our relationship with others.",
        explanation: COMMANDMENTS.map((c) => c.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      // Only 4 of the 10 commandments are God-directed (Exodus 20:3-11) so the "god" bucket's pool and
      // slice size are both 4 here — a genuine content limit (there is no 5th God-directed commandment to
      // draw from), not a missed subsampling opportunity. The "people" bucket (6 commandments) still
      // varies which 4 of its 6 appear each generation.
      const god = shuffle(rng, COMMANDMENT_FACTS.filter((f) => f.group === "god")).slice(0, 4);
      const people = shuffle(rng, COMMANDMENT_FACTS.filter((f) => f.group === "people")).slice(0, 4);
      const chosen = shuffle(rng, [...god, ...people]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "god", label: "About our relationship with God" },
          { id: "people", label: "About our relationship with others" },
        ],
        correctBucket,
        hint: "The 1st-4th commandments guide how we treat God; the 5th-10th guide how we treat other people.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "god" ? "about our relationship with God" : "about our relationship with others"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, VALUE_LESSON).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.term })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.evidence })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.term] = a.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about which specific commandment teaches each value or life skill.",
        explanation: chosen.map((a) => `${a.term} — ${a.evidence.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about which of the Ten Commandments (Exodus 20:3-17) is directly connected to the situation.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Ten Commandments are recorded in the book of Exodus, chapter", after: ".", answer: "20", accepted: ["20", "twenty"] },
      { before: "The 1st commandment says you shall have no other", after: "before God.", answer: "gods", accepted: ["gods"] },
      { before: "The 4th commandment says to remember the Sabbath day and keep it", after: ".", answer: "holy", accepted: ["holy"] },
      { before: "The 5th commandment says to honour your father and your", after: ".", answer: "mother", accepted: ["mother"] },
      { before: "The 6th commandment says you shall not", after: ".", answer: "murder", accepted: ["murder", "kill"] },
      { before: "The 8th commandment says you shall not", after: ".", answer: "steal", accepted: ["steal"] },
      { before: "The 9th commandment warns against giving false", after: "against your neighbour.", answer: "testimony", accepted: ["testimony"] },
      { before: "The 10th commandment says you shall not", after: "what belongs to your neighbour.", answer: "covet", accepted: ["covet"] },
      { before: "The first four commandments are mainly about our relationship with", after: ".", answer: "God", accepted: ["god"] },
      { before: "The last six commandments are mainly about our relationship with", after: ".", answer: "others", accepted: ["others", "people"] },
      { before: "The value of contentment is taught by the commandment against", after: ".", answer: "coveting", accepted: ["coveting"] },
      { before: "The key inquiry question for this lesson asks why you should", after: "the Ten Commandments.", answer: "obey", accepted: ["obey"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about the Ten Commandments in Exodus 20:3-17 and what each one teaches.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
