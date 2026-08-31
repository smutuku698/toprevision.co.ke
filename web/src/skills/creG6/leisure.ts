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

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each activity into the bucket for good use of leisure time or misuse of leisure time.",
    "these activities under the correct heading for how leisure time is being used.",
    "each activity below by whether it is a responsible or an irresponsible use of free time.",
    "each activity into the bucket for whether it reflects good or poor use of leisure time.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each value below to why it helps someone use leisure time responsibly.",
    "each idea about leisure to the evidence that supports it.",
    "each term to the explanation of why it matters for using free time well.",
    "each value to the reason it protects a young person from misusing leisure time.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about leisure.",
    "the correct missing word.",
  ],
);

// Activities grouped by good use vs. misuse of leisure time — drawn from the outcomes ("describe how youths
// misuse leisure time today," "biblical teaching on good use of leisure") plus 1 Timothy 5:13's warning
// against idleness/being a busybody, not invented categories.
const LEISURE_FACTS: { text: string; group: "good" | "misuse" }[] = [
  { text: "Playing a sport or exercising with friends after school", group: "good" },
  { text: "Reading an interesting storybook during free time", group: "good" },
  { text: "Practising a musical instrument or a creative art like drawing", group: "good" },
  { text: "Spending quality time talking and playing with family members", group: "good" },
  { text: "Resting quietly to recover energy after a busy week", group: "good" },
  { text: "Joining a church youth group or community service activity", group: "good" },
  { text: "Spending many hours scrolling on a phone with no clear purpose", group: "misuse" },
  { text: "Going about from house to house spreading gossip about neighbours", group: "misuse" },
  { text: "Keeping bad company that leads to harmful or risky behaviour", group: "misuse" },
  { text: "Watching inappropriate content instead of doing anything productive", group: "misuse" },
  { text: "Being idle all day with no plan, then complaining of boredom", group: "misuse" },
  { text: "Wandering around causing mischief instead of resting or being productive", group: "misuse" },
];

const VALUE_REASON: { term: string; evidence: string }[] = [
  { term: "Self-discipline", evidence: "Helps a young person choose a productive activity instead of drifting into idleness" },
  { term: "Moderation", evidence: "Keeps an enjoyable leisure activity, like games or screen time, from taking over all of one's free time" },
  { term: "Wise choices", evidence: "Helps a young person pick leisure activities that build them up rather than cause harm" },
  { term: "Integrity", evidence: "Keeps a person from using free time to gossip or spread rumours about others, as 1 Timothy 5:13 warns against" },
  { term: "Balance", evidence: "Mirrors God's own example in Genesis 2:1-3 of resting after a period of purposeful work" },
  { term: "Patriotism", evidence: "Encourages using free time for activities like sports or community service that build up one's community" },
  { term: "Good company", evidence: "Choosing to spend leisure time with responsible friends reduces the chance of being led into misuse of time" },
  { term: "Purposefulness", evidence: "Planning what to do with free time in advance prevents drifting into idleness or mischief" },
  { term: "Respect for rest", evidence: "Recognising that rest itself is valuable, as God rested on the seventh day, instead of feeling guilty for resting" },
  { term: "Accountability", evidence: "Being willing to let a parent or mentor know how free time is spent helps keep leisure choices responsible" },
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
    prompt: `${name(rng)} in ${place(rng)} reads Genesis 2:1-3, where God rests on the seventh day after finishing the work of creation. What does God's example teach about leisure?`,
    correct: "Rest is a good and God-modelled part of life, meant to follow purposeful work",
    wrong: [
      "Rest is a weakness that only unproductive people need",
      "God's rest shows leisure time should never be planned or balanced with work",
      "Genesis 2:1-3 has nothing to do with how people should use their time",
    ],
    explanation: "Genesis 2:1-3 shows God Himself resting after His work of creation — a model that rest and leisure are a good, purposeful part of a balanced life.",
  }),
  (rng) => ({
    prompt: `In CRE class in ${place(rng)}, ${name(rng)} is asked what 1 Timothy 5:13 warns about when it describes idle people going about as 'busybodies,' saying things they should not say. What is being warned against?`,
    correct: "Idleness that leads to gossiping and meddling in other people's affairs",
    wrong: [
      "Idleness is warned against only when a person is physically unwell",
      "The verse warns against ever resting at all, even briefly",
      "The verse only applies to people who have paid jobs",
    ],
    explanation: "1 Timothy 5:13 warns that idle time, if not used well, can lead to gossip and meddling — a specific misuse of leisure time, not rest itself.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} spends every afternoon after school scrolling on a phone for hours with no clear purpose, then feels tired and unfocused. Which biblical warning about leisure does this best illustrate?`,
      correct: "1 Timothy 5:13's warning against idle, purposeless use of free time",
      wrong: [
        "Genesis 2:1-3's example of God resting with a clear purpose after work",
        "This scenario has no connection to any biblical teaching on leisure",
        "1 Timothy 5:13 actually encourages this kind of unstructured screen time",
      ],
      explanation: "Endless, purposeless scrolling reflects the kind of unproductive idleness 1 Timothy 5:13 warns against, unlike God's purposeful, restorative rest in Genesis 2:1-3.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} spends free time each week going house to house in ${place(rng)} spreading rumours about classmates and neighbours. Which specific misuse of leisure time from 1 Timothy 5:13 does this describe?`,
    correct: "Being a busybody and gossiping, exactly what 1 Timothy 5:13 warns against",
    wrong: [
      "Reading and studying, which the verse actually encourages",
      "Playing organised sports, which the verse discourages",
      "Resting quietly at home, which the verse warns against",
    ],
    explanation: "Going about spreading rumours is precisely the 'busybody' behaviour 1 Timothy 5:13 names as a misuse of free time.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} plans to spend Saturday afternoon playing football, then resting, then helping at home. Which value from the CRE lesson on leisure does this balanced plan best show?`,
    correct: "Wise choices and balance, using leisure time productively rather than letting it drift",
    wrong: [
      "Idleness, since resting is included in the plan",
      "This plan shows misuse of leisure because it includes more than one activity",
      "This plan has no connection to any value taught in the lesson",
    ],
    explanation: "Balancing sport, rest, and helping at home reflects wise, moderate use of leisure time — exactly the value CRE teaching on leisure encourages.",
  }),
  (rng) => ({
    prompt: `A group of youths in ${place(rng)}, led by ${name(rng)}, decide to spend their free time volunteering to clean up their local church compound instead of being idle. What value does this choice best demonstrate?`,
    correct: "Purposefulness and patriotism, using free time for an activity that builds up the community",
    wrong: [
      "Idleness, since volunteering does not require a paid job",
      "Misuse of leisure, since it is not classified as pure rest",
      "This scenario has no connection to any value taught in the lesson",
    ],
    explanation: "Choosing a productive, community-building activity over idleness reflects exactly the responsible use of leisure time the lesson encourages.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims that Genesis 2:1-3 teaches that resting is lazy and should be avoided completely. Based on the passage, is this an accurate claim?`,
    correct: "No — Genesis 2:1-3 shows God Himself resting on the seventh day, modelling rest as a good and necessary part of life",
    wrong: [
      "Yes — Genesis 2:1-3 says rest should never happen under any circumstances",
      "Yes — the passage teaches that only weak people need to rest",
      "No — but the passage only allows God, not people, to rest",
    ],
    explanation: "Genesis 2:1-3 presents God's own rest after creation as the model for a balanced life, not as something to avoid.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that since 1 Timothy 5:13 warns against being idle, all free time and leisure activities must be avoided completely. Is this the correct lesson from the verse?`,
    correct: "No — the verse warns against purposeless idleness that leads to gossip, not against leisure and rest in general",
    wrong: [
      "Yes — the verse teaches that no leisure activity is ever acceptable",
      "Yes — 1 Timothy 5:13 and Genesis 2:1-3 contradict each other completely",
      "No — but the verse only allows leisure for adults, never for youths",
    ],
    explanation: "1 Timothy 5:13 targets purposeless idleness that leads to gossip and mischief, while Genesis 2:1-3 shows God modelling good, purposeful rest — the two teachings work together, not against each other.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} keeps company with friends in ${place(rng)} who spend all their free time getting into risky mischief. Which value would most help ${who} avoid being drawn into misusing leisure time this way?`,
      correct: "Choosing good company and self-discipline, so free time is spent on activities that build up rather than harm",
      wrong: [
        "Copying whatever the friend group decides to do without question",
        "Avoiding all forms of leisure activity entirely, including sports and rest",
        "Believing that misuse of leisure time has no real consequences",
      ],
      explanation: "The lesson's values around choosing good company and self-discipline are exactly what protect a young person from being pulled into misusing their free time.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}, a Grade 6 learner in ${place(rng)}, is asked why the key inquiry question for this lesson is 'How can youths avoid misuse of leisure time?' rather than simply 'What is leisure time?' What does this suggest about the lesson's focus?`,
    correct: "The lesson wants learners to identify practical ways to use free time responsibly, not just define leisure",
    wrong: [
      "The lesson wants learners to memorise a dictionary definition of leisure only",
      "The lesson has no real focus and the inquiry question does not matter",
      "The lesson is only concerned with school timetables, not free time",
    ],
    explanation: "'How can youths avoid misuse of leisure time?' pushes learners toward practical values and choices, matching the outcomes about describing misuse and identifying values for responsible use.",
  }),
];

export const leisure: Skill = {
  id: "g6-cre-cn-leisure",
  code: "CN.3",
  subjectId: "cre",
  strandId: "g6-cre-creation",
  grade: 6,
  title: "Leisure",
  description: "God's own rest in Genesis 2:1-3, 1 Timothy 5:13's warning against idleness, and the values needed to use leisure time responsibly rather than misuse it.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (good-use/misuse examples and the
    // two named Bible texts), so `ordering` is deliberately skipped — 4 kinds is the honest cap here.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const good = shuffle(rng, LEISURE_FACTS.filter((f) => f.group === "good")).slice(0, 4);
      const misuse = shuffle(rng, LEISURE_FACTS.filter((f) => f.group === "misuse")).slice(0, 4);
      const chosen = shuffle(rng, [...good, ...misuse]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "good", label: "Good use of leisure time" },
          { id: "misuse", label: "Misuse of leisure time" },
        ],
        correctBucket,
        hint: "Good use of leisure builds a person up (rest, sport, creativity, family); misuse wastes time or harms others (idleness, gossip, bad company).",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "good" ? "good use of leisure time" : "misuse of leisure time"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, VALUE_REASON).slice(0, 5);
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
        hint: "Think about how each value specifically helps someone choose a good, balanced use of free time.",
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
        hint: "Think about Genesis 2:1-3's picture of rest and 1 Timothy 5:13's warning against idleness.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "In Genesis 2:1-3, God rested on the", after: "day after finishing the work of creation.", answer: "seventh", accepted: ["seventh", "7th"] },
      { before: "God's example of rest in Genesis 2:1-3 followed a period of purposeful", after: ".", answer: "work", accepted: ["work"] },
      { before: "1 Timothy 5:13 warns against being idle and going about as", after: ".", answer: "busybodies", accepted: ["busybodies", "busybody"] },
      { before: "1 Timothy 5:13 warns that idle people may end up saying things they should not, which is a form of", after: ".", answer: "gossip", accepted: ["gossip", "gossiping"] },
      { before: "A good use of leisure time includes reading, sports, and creative", after: ".", answer: "arts", accepted: ["arts", "art"] },
      { before: "Spending hours scrolling on a phone with no clear purpose is an example of", after: "leisure time.", answer: "misusing", accepted: ["misusing", "misuse of"] },
      { before: "The value of self-", after: "helps a young person avoid drifting into idleness.", answer: "discipline", accepted: ["discipline"] },
      { before: "The value of", after: "keeps an enjoyable activity from taking over all of a person's free time.", answer: "moderation", accepted: ["moderation"] },
      { before: "Choosing good", after: "reduces the chance of being drawn into misusing leisure time.", answer: "company", accepted: ["company"] },
      { before: "The key inquiry question for this lesson asks how youths can avoid the", after: "of leisure time.", answer: "misuse", accepted: ["misuse"] },
      { before: "Rest is presented in CRE as a good and God-modelled part of a", after: "life.", answer: "balanced", accepted: ["balanced"] },
      { before: "1 Timothy 5:13's warning targets purposeless", after: ", not rest and leisure in general.", answer: "idleness", accepted: ["idleness"] },
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
      hint: "Think about Genesis 2:1-3's rest and 1 Timothy 5:13's warning against idleness.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
