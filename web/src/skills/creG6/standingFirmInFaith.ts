import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each word from 2 Corinthians 6:3-7 as a hardship Paul faced or a virtue he showed despite it.",
    "these words from Paul's list into hardship or virtue.",
    "each word below by whether it names a hardship or a virtue from Paul's list.",
    "each word into the bucket for hardship or virtue, as Paul describes them.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each word or value to its meaning.",
    "each term below with what it means for standing firm in faith.",
    "each idea about Apostle Paul's example to the explanation that fits it.",
    "each term to the explanation of why it matters in Paul's life.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Apostle Paul.",
    "the correct missing word.",
  ],
);

interface Pauline {
  text: string;
  kind: "hardship" | "virtue";
}

// 2 Corinthians 6:3-7: Paul commends himself as God's servant through great endurance — in troubles,
// hardships, distresses, beatings, imprisonments, riots, hard work, sleepless nights, hunger; yet also
// in purity, understanding, patience, kindness, the Holy Spirit, sincere love, truthful speech, and
// the power of God.
const PAULINE_FACTS: Pauline[] = [
  { text: "Paul endured great troubles as he served God", kind: "hardship" },
  { text: "Paul faced hardships and distresses in his ministry", kind: "hardship" },
  { text: "Paul suffered beatings for preaching the Gospel", kind: "hardship" },
  { text: "Paul was imprisoned more than once for his faith", kind: "hardship" },
  { text: "Paul faced riots stirred up against him in various towns", kind: "hardship" },
  { text: "Paul endured hard work and sleepless nights in his labour", kind: "hardship" },
  { text: "Paul went hungry at times while serving God's people", kind: "hardship" },
  { text: "Paul commended himself as God's servant through purity of life", kind: "virtue" },
  { text: "Paul showed understanding even while under great pressure", kind: "virtue" },
  { text: "Paul displayed patience and kindness despite his suffering", kind: "virtue" },
  { text: "Paul relied on the Holy Spirit to sustain him through hardship", kind: "virtue" },
  { text: "Paul showed sincere love for the people he served", kind: "virtue" },
  { text: "Paul spoke truthfully, even when it was costly to do so", kind: "virtue" },
  { text: "Paul relied on the power of God, not his own strength, to endure", kind: "virtue" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "2 Corinthians 6:3-7", meaning: "The passage where Paul lists the hardships he endured and the virtues he showed as God's servant" },
  { term: "Endurance", meaning: "Continuing faithfully in service to God despite suffering or opposition" },
  { term: "Purity", meaning: "Living a morally clean life, one of the virtues Paul names in his list" },
  { term: "Sincere love", meaning: "Genuine, unpretending love for others, shown even under pressure" },
  { term: "Truthful speech", meaning: "Speaking honestly, one of the virtues Paul commends himself by" },
  { term: "The power of God", meaning: "The strength Paul relied on to endure hardship, rather than his own ability" },
  { term: "Persecution", meaning: "Being mistreated or opposed specifically because of one's Christian faith" },
  { term: "Standing firm", meaning: "Remaining faithful to one's beliefs even when facing pressure or hardship" },
  { term: "Imprisonment", meaning: "One of the hardships Paul lists — being jailed for preaching the Gospel" },
  { term: "Peace education", meaning: "The pertinent issue linked to this sub-strand, about resolving conflict without giving up one's faith" },
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
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is mocked by classmates for going to church on Sunday instead of joining them elsewhere. Which lesson from Apostle Paul's life in 2 Corinthians 6:3-7 fits this situation best?`,
      correct: "Christians can stand firm in faith even when they face mockery or pressure",
      wrong: [
        "Christians should avoid church whenever it causes any social pressure",
        "Paul's example only applies to physical hardship, never to mockery",
        "Standing firm only matters if the persecution is extremely severe",
      ],
      explanation: "Paul endured troubles, hardships, and even beatings and imprisonment for his faith — his example teaches standing firm even under lighter pressures like mockery, not just extreme suffering.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked which of the following was one of the hardships Apostle Paul lists in 2 Corinthians 6:3-7. Which one is it?`,
    correct: "Sleepless nights",
    wrong: ["Wealth and comfort", "Public praise and honour", "An easy, relaxed schedule"],
    explanation: "2 Corinthians 6:3-7 lists troubles, hardships, distresses, beatings, imprisonments, riots, hard work, sleepless nights, and hunger — sleepless nights is one of these named hardships.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wonders how Paul managed to keep showing patience and kindness even while facing beatings and imprisonment. According to 2 Corinthians 6:3-7, what enabled this?`,
    correct: "He relied on the power of God and the Holy Spirit, not just his own strength",
    wrong: [
      "He avoided all hardship entirely by staying away from dangerous places",
      "He was never actually troubled by any of his hardships",
      "He relied only on his own natural personality to stay calm",
    ],
    explanation: "Paul's list pairs hardships with virtues like patience and kindness, sustained "
      + "\"in the Holy Spirit\" and \"in the power of God\" — his endurance came from God, not from ignoring the hardship or relying on himself alone.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is falsely accused of cheating on a test and is tempted to lie to get out of trouble. Which virtue from Paul's example in 2 Corinthians 6:3-7 should guide ${who}'s response?`,
      correct: "Truthful speech",
      wrong: ["Hard work", "Riots", "Imprisonment"],
      explanation: "Paul lists truthful speech among the virtues he showed despite hardship — a Christian facing pressure to lie should hold onto honesty, following Paul's example.",
    };
  },
  (rng) => ({
    prompt: `A church group in ${place(rng)} is planning how to support members who are being persecuted for their faith at work. Which value does 2 Corinthians 6:3-7 highlight as most connected to unity in facing persecution?`,
    correct: "Unity — standing together in faith gives strength to endure hardship",
    wrong: [
      "Isolation — facing persecution is always meant to be a private matter",
      "Competition — believers are meant to outdo each other in suffering",
      "Silence — believers should never discuss their hardships with others",
    ],
    explanation: "This sub-strand's core value is Unity — Christians standing firm together, supporting one another, mirrors how Paul's endurance served the wider community of believers.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says Paul's suffering proves that God does not care about His faithful servants. How does 2 Corinthians 6:3-7 actually respond to this claim?`,
    correct: "Paul's hardships were met with virtues sustained by the Holy Spirit and the power of God — showing God's presence with him, not absence",
    wrong: [
      "The passage agrees that God abandoned Paul during his hardships",
      "The passage says hardship only happens to people God has rejected",
      "The passage claims Paul never actually suffered at all",
    ],
    explanation: "Paul lists his hardships alongside virtues sustained \"in the Holy Spirit\" and \"in the power of God\" — the passage shows God present and active with him through suffering, not absent from it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} faces pressure from friends to abandon a Christian value they hold, and feels afraid to stand alone. What does the example of Paul in 2 Corinthians 6:3-7 encourage in this moment?`,
      correct: "To stand firm in faith despite pressure, trusting in God's strength to endure",
      wrong: [
        "To give in quietly, since standing firm is only for extreme situations",
        "To argue aggressively with friends rather than remain steady in faith",
        "To avoid the friends permanently rather than face any pressure at all",
      ],
      explanation: "Paul's example is precisely about enduring pressure and hardship while remaining faithful — the lesson calls for standing firm, not giving in or reacting with hostility.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads that Paul faced "riots" as one of his hardships. What does this hardship specifically describe?`,
    correct: "Violent public disturbances or unrest stirred up against Paul because of his preaching",
    wrong: [
      "Peaceful public gatherings that welcomed Paul's teaching",
      "A private disagreement between Paul and one other person",
      "A natural disaster unrelated to Paul's ministry",
    ],
    explanation: "Riots in 2 Corinthians 6:3-7 refers to violent public unrest that Paul faced because of opposition to his preaching of the Gospel.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked to explain why 2 Corinthians 6:3-7 lists both hardships and virtues together in the same passage. What is the best explanation?`,
    correct: "To show that Paul remained faithful and virtuous even while enduring real, serious hardship",
    wrong: [
      "To show that the hardships and virtues happened at completely unrelated times",
      "To prove that Paul never truly experienced any of the listed hardships",
      "To argue that virtue only matters once all hardship has ended",
    ],
    explanation: "Paul deliberately pairs hardships with virtues in the same list to show that his faithful character held firm precisely while the hardship was happening, not only afterward.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says standing firm in faith only matters for pastors and missionaries, not for ordinary learners. How would this sub-strand's teaching respond?`,
    correct: "Every Christian, including young learners, is called to stand firm in faith when facing pressure or persecution",
    wrong: [
      "The teaching agrees that only church leaders need to stand firm",
      "The teaching says standing firm is optional for everyone",
      "The teaching applies only to adults, never to young people",
    ],
    explanation: "The key inquiry question for this sub-strand — why Christians should stand firm in their faith — is addressed to all Christians, and its learning outcomes are written for learners to apply personally.",
  }),
];

export const standingFirmInFaith: Skill = {
  id: "g6-cre-ch-standing-firm",
  code: "CH.2",
  subjectId: "cre",
  strandId: "g6-cre-church",
  grade: 6,
  title: "Standing Firm in Faith — Apostle Paul",
  description: "The hardships Apostle Paul endured and the virtues he showed according to 2 Corinthians 6:3-7, and why Christians should stand firm in faith today.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (a list of hardships/virtues and a
    // key inquiry question, not a step-by-step process), so `ordering` is deliberately skipped — 4 kinds is
    // the honest cap here, matching the precedent in inspiredWordOfGod.ts.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const hardships = shuffle(rng, PAULINE_FACTS.filter((f) => f.kind === "hardship")).slice(0, 4);
      const virtues = shuffle(rng, PAULINE_FACTS.filter((f) => f.kind === "virtue")).slice(0, 4);
      const chosen = shuffle(rng, [...hardships, ...virtues]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "hardship", label: "Hardship Paul faced" },
          { id: "virtue", label: "Virtue Paul showed" },
        ],
        correctBucket,
        hint: "2 Corinthians 6:3-7 lists hardships like beatings and hunger, alongside virtues like patience and sincere love.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "hardship" ? "a hardship" : "a virtue"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each term or value from Paul's example actually means.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
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
        hint: "Think about the hardships Paul endured, the virtues he showed, and why Christians should stand firm in faith.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "2 Corinthians 6:3-7 lists troubles, hardships, distresses,", after: ", imprisonments, and riots.", answer: "beatings", accepted: ["beatings"] },
      { before: "Among the hardships Paul lists are hard work and sleepless", after: ".", answer: "nights", accepted: ["nights"] },
      { before: "Paul faced hunger as one of the hardships listed in 2 Corinthians 6:3-", after: ".", answer: "7", accepted: ["7", "seven"] },
      { before: "Despite his hardships, Paul showed purity,", after: ", patience, and kindness.", answer: "understanding", accepted: ["understanding"] },
      { before: "Paul relied on the Holy Spirit and the power of", after: "to sustain him through hardship.", answer: "God", accepted: ["god"] },
      { before: "One virtue Paul showed despite suffering was sincere", after: ".", answer: "love", accepted: ["love"] },
      { before: "Even under pressure, Paul valued honesty, shown through his truthful", after: ".", answer: "speech", accepted: ["speech"] },
      { before: "The key value connected to this sub-strand about Paul's example is", after: ".", answer: "Unity", accepted: ["unity"] },
      { before: "The pertinent issue linked to this sub-strand is peace", after: ".", answer: "education", accepted: ["education"] },
      { before: "Standing firm in faith means remaining faithful even when facing pressure or", after: ".", answer: "persecution", accepted: ["persecution"] },
      { before: "Paul's list in 2 Corinthians 6:3-7 shows he commended himself as God's", after: ".", answer: "servant", accepted: ["servant"] },
      { before: "Paul endured great troubles and", after: "while serving as God's servant.", answer: "hardships", accepted: ["hardships"] },
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
      hint: "Think about 2 Corinthians 6:3-7's list of hardships and virtues, and why Christians stand firm in faith.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
