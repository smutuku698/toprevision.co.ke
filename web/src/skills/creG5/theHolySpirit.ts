import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

// Compose a larger prompt pool from a small set of openers x closers (per RIGOR-STANDARDS.md's
// "affordable way to reach 20+" technique) instead of hand-authoring 20+ sentences one by one.
function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each item below into the bucket for gift of the Holy Spirit or fruit of the Holy Spirit.",
    "these terms by whether they are a gift or a fruit of the Holy Spirit.",
    "each item into the bucket it belongs in — a gift (1 Corinthians 12) or a fruit (Galatians 5).",
    "each term below by whether Paul lists it among the gifts or the fruit of the Spirit.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each gift or fruit of the Holy Spirit to its meaning.",
    "each term below with what it means for the Holy Spirit's work.",
    "each idea about the Holy Spirit to the explanation that fits it.",
    "each term to the explanation of why it matters in the Christian life.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the Holy Spirit.",
    "the correct missing word.",
  ],
);

interface SpiritFact {
  term: string;
  elaboration: string;
  kind: "gift" | "fruit";
}

// The nine gifts of the Holy Spirit (1 Corinthians 12:1-11) and the nine fruit of the Holy Spirit
// (Galatians 5:22-23), exactly as named in the sub-strand's scopeNotes, each given a concrete
// elaboration grounded in the passage's own description of what that gift/fruit involves.
const SPIRIT_FACTS: SpiritFact[] = [
  { term: "Word of wisdom", elaboration: "the Spirit-given ability to offer wise, godly counsel in a difficult situation", kind: "gift" },
  { term: "Word of knowledge", elaboration: "a Spirit-given understanding of truth needed to help or guide others", kind: "gift" },
  { term: "Faith", elaboration: "a special measure of trust in God's power, given by the Spirit, beyond ordinary belief", kind: "gift" },
  { term: "Gifts of healing", elaboration: "the Spirit-given ability to be used by God to bring healing to the sick", kind: "gift" },
  { term: "Working of miracles", elaboration: "the Spirit-given ability to be used by God to perform extraordinary deeds", kind: "gift" },
  { term: "Prophecy", elaboration: "the Spirit-given ability to speak a message from God to encourage or guide believers", kind: "gift" },
  { term: "Discerning of spirits", elaboration: "the Spirit-given ability to recognise whether a spirit or teaching is truly from God", kind: "gift" },
  { term: "Speaking in different kinds of tongues", elaboration: "the Spirit-given ability to speak in languages not previously learned", kind: "gift" },
  { term: "Interpretation of tongues", elaboration: "the Spirit-given ability to explain the meaning of a message spoken in tongues", kind: "gift" },
  { term: "Love", elaboration: "caring for others selflessly, the first fruit Paul names in Galatians 5:22", kind: "fruit" },
  { term: "Joy", elaboration: "a deep gladness in God that does not depend only on circumstances", kind: "fruit" },
  { term: "Peace", elaboration: "inner calm and right relationships with both God and other people", kind: "fruit" },
  { term: "Patience (longsuffering)", elaboration: "enduring difficulty or delay without giving up or growing angry", kind: "fruit" },
  { term: "Kindness", elaboration: "treating other people with gentleness and generosity", kind: "fruit" },
  { term: "Goodness", elaboration: "moral uprightness shown in how a person treats others", kind: "fruit" },
  { term: "Faithfulness", elaboration: "being reliable and keeping one's commitments to both God and other people", kind: "fruit" },
  { term: "Humility (gentleness/meekness)", elaboration: "a quiet, humble strength that does not seek to dominate others", kind: "fruit" },
  { term: "Self-control", elaboration: "mastering one's own desires, words, and reactions instead of being ruled by them", kind: "fruit" },
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
      prompt: `${who} in ${place(rng)} is teased by classmates but responds calmly, without shouting back or losing their temper. Which fruit of the Holy Spirit from Galatians 5:22-23 is ${who} showing?`,
      correct: "Self-control — mastering one's own reactions instead of being ruled by them",
      wrong: [
        "Prophecy — prophecy is a gift of the Spirit, not one of the nine listed fruit",
        "Working of miracles — this scenario is not about performing an extraordinary deed",
        "Interpretation of tongues — that gift relates to explaining a message, not staying calm",
      ],
      explanation: "Galatians 5:22-23 names self-control as one of the nine fruit of the Spirit — staying calm under teasing instead of reacting in anger is self-control in action; the wrong options are gifts (1 Corinthians 12), not fruit.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks how many gifts of the Holy Spirit are listed in 1 Corinthians 12:1-11. What is the correct number?`,
    correct: "Nine gifts",
    wrong: ["Seven gifts", "Twelve gifts", "Three gifts"],
    explanation: "1 Corinthians 12:1-11 lists exactly nine gifts of the Holy Spirit: word of wisdom, word of knowledge, faith, healing, miracles, prophecy, discerning of spirits, tongues, and interpretation of tongues.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A church group in ${place(rng)}, led by ${who}, keeps its promises to help needy families every month, even when it becomes inconvenient. Which fruit of the Spirit does this best reflect?`,
      correct: "Faithfulness — being reliable and keeping one's commitments over time",
      wrong: [
        "Gifts of healing — keeping a promise has nothing to do with healing the sick",
        "Word of knowledge — this is a gift for understanding truth, not for keeping promises",
        "Discerning of spirits — that gift is for recognising true teaching, not for reliability",
      ],
      explanation: "Galatians 5:22-23 names faithfulness as a fruit of the Spirit — reliably keeping commitments to help others over time is faithfulness; the wrong options are gifts from the separate 1 Corinthians 12 list.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} claims that the fruit of the Holy Spirit and the gifts of the Holy Spirit are exactly the same thing, just with different names. Is this accurate?`,
    correct: "No — the gifts (1 Corinthians 12) are special abilities for serving others, while the fruit (Galatians 5) are qualities of Christian character",
    wrong: [
      "Yes — Paul uses the two terms interchangeably with no real difference",
      "Yes — both lists name exactly the same nine items in the same order",
      "No — but the fruit of the Spirit are actually abilities, and the gifts are character qualities",
    ],
    explanation: "1 Corinthians 12 lists gifts as Spirit-given abilities for serving the Church, while Galatians 5:22-23 lists fruit as character qualities the Spirit produces in a believer's life — related, but genuinely different lists.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to explain how the fruit of the Holy Spirit promotes harmony among Christians, one of this sub-strand's key learning outcomes. What is the best answer?`,
      correct: "Qualities like love, peace, patience, and kindness help believers treat one another well, reducing conflict and building good relationships",
      wrong: [
        "The fruit of the Spirit has no real connection to how Christians treat one another",
        "Harmony among Christians depends only on having the same gifts, not the same character",
        "The fruit of the Spirit matters only for private personal devotion, never for relationships",
      ],
      explanation: "Galatians 5:22-23's fruit — love, joy, peace, patience, kindness, goodness, faithfulness, humility, self-control — are relational qualities that directly promote peaceful, harmonious relationships among believers.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees a classmate confidently explain a difficult problem to the whole class in a way that helps everyone understand and make a wise choice. Which gift of the Holy Spirit might this reflect?`,
    correct: "Word of wisdom — a Spirit-given ability to give wise, godly counsel in a difficult situation",
    wrong: [
      "Self-control — self-control is a fruit of the Spirit, not a gift for giving counsel",
      "Kindness — kindness is a fruit of the Spirit, not a gift for explaining problems",
      "Peace — peace is a fruit of the Spirit, not one of the nine gifts",
    ],
    explanation: "1 Corinthians 12 lists word of wisdom as a gift for offering wise counsel — the other three options are fruit of the Spirit from the separate Galatians 5 list, not gifts.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is disappointed after losing a school competition, but still remains cheerful and thankful to God rather than bitter. Which fruit of the Spirit is ${who} demonstrating?`,
      correct: "Joy — a deep gladness in God that does not depend only on circumstances",
      wrong: [
        "Interpretation of tongues — that gift relates to explaining a spoken message, not to gladness",
        "Working of miracles — this scenario is about attitude, not performing an extraordinary deed",
        "Discerning of spirits — that gift is for recognising true teaching, not for staying cheerful",
      ],
      explanation: "Galatians 5:22 names joy as a fruit of the Spirit — staying cheerful and thankful despite a disappointing outcome reflects joy that is not dependent on circumstances.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says the gift of "discerning of spirits" from 1 Corinthians 12 means being able to see literal ghosts. What does this gift actually describe?`,
    correct: "The Spirit-given ability to recognise whether a spirit or teaching is truly from God",
    wrong: [
      "The ability to physically see ghosts or spirits with one's own eyes",
      "The ability to control what other people believe by force",
      "The ability to heal illnesses caused by evil spirits specifically",
    ],
    explanation: "1 Corinthians 12 describes discerning of spirits as the ability to recognise whether a teaching or spiritual influence is genuinely from God — not literal ghost-sight.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} apologises sincerely after losing their temper with a younger sibling, and works hard afterward to stay calm the next time. Which two fruit of the Spirit are most directly involved in this response?`,
      correct: "Humility (in apologising sincerely) and self-control (in working to stay calm afterward)",
      wrong: [
        "Working of miracles and interpretation of tongues, since these are the most well-known gifts",
        "Word of knowledge and discerning of spirits, which are unrelated to apologising or self-control",
        "Prophecy and healing, since these gifts have nothing to do with personal character",
      ],
      explanation: "Galatians 5:22-23 lists both humility (gentleness) and self-control as fruit of the Spirit — sincere apology reflects humility, and working to stay calm reflects self-control; the other options are gifts, not fruit.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that only pastors can ever receive a gift or show a fruit of the Holy Spirit, never ordinary Christians. How does 1 Corinthians 12:1-11 and Galatians 5:22-23 respond to this claim?`,
    correct: "The Holy Spirit distributes gifts and produces fruit in all believers, not only in church leaders",
    wrong: [
      "Both passages agree that only pastors may ever receive a gift or fruit of the Spirit",
      "The passages teach that gifts and fruit of the Spirit are reserved only for adults",
      "The passages say gifts and fruit only appear once a person becomes famous in ministry",
    ],
    explanation: "1 Corinthians 12:7 says the Spirit's gift is given to each person for the common good, and Galatians 5:22-23 describes fruit the Spirit produces in every believer's life — neither passage limits this to church leaders alone.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is told that a friend spoke in a language they had never learned while praying at a church retreat in ${place(rng)}. Which gift of the Holy Spirit does this describe?`,
      correct: "Speaking in different kinds of tongues",
      wrong: [
        "Peace — peace is a fruit of the Spirit, not the gift being described here",
        "Faithfulness — faithfulness is a fruit of the Spirit, unrelated to speaking a new language",
        "Goodness — goodness is a fruit of the Spirit, not a gift for speaking in tongues",
      ],
      explanation: "1 Corinthians 12 lists speaking in different kinds of tongues as a gift — the Spirit-given ability to speak in a language the speaker has not learned; the other options are fruit from the separate Galatians 5 list.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says patience only means "waiting quietly," with no connection to enduring hardship. Does Galatians 5:22's meaning of patience (longsuffering) fully match this?`,
    correct: "Not quite — patience/longsuffering also means enduring difficulty over time without giving up or growing angry, not just waiting quietly",
    wrong: [
      "Yes — Galatians 5:22 defines patience only as sitting quietly and doing nothing",
      "Yes — patience in Galatians 5:22 has no connection to enduring any hardship at all",
      "No — Galatians 5:22 says patience means avoiding people entirely until a problem passes",
    ],
    explanation: "Patience (longsuffering) in Galatians 5:22-23 involves enduring difficulty or delay without giving up or becoming angry — a fuller meaning than simply \"waiting quietly.\"",
  }),
];

export const theHolySpirit: Skill = {
  id: "g5-cre-ch-holy-spirit",
  code: "CH.3",
  subjectId: "cre",
  strandId: "g5-cre-church",
  grade: 5,
  title: "The Holy Spirit",
  description: "The nine gifts of the Holy Spirit named in 1 Corinthians 12:1-11 and the nine fruit of the Holy Spirit named in Galatians 5:22-23, and how the fruit of the Spirit promotes harmony among Christians.",
  generate(rng) {
    // This sub-strand's content is two fixed lists (gifts, fruit), not a narrative with a real sequence of
    // events — no genuine `ordering` fits here, so it is deliberately skipped, matching the precedent in
    // myPurpose.ts and standingFirmInFaith.ts. 4 kinds is the honest cap for this sub-strand.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      // Always slice a strict subset of each 9-item list — never show all 9 gifts or all 9 fruit in one
      // question, per RIGOR-STANDARDS.md's explicit warning about this sub-strand's exactly-9-item lists.
      const gifts = shuffle(rng, SPIRIT_FACTS.filter((f) => f.kind === "gift")).slice(0, 5);
      const fruit = shuffle(rng, SPIRIT_FACTS.filter((f) => f.kind === "fruit")).slice(0, 5);
      const chosen = shuffle(rng, [...gifts, ...fruit]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.term }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "gift", label: "Gift of the Holy Spirit (1 Corinthians 12)" },
          { id: "fruit", label: "Fruit of the Holy Spirit (Galatians 5)" },
        ],
        correctBucket,
        hint: "The nine gifts are special abilities for serving others (1 Corinthians 12); the nine fruit are qualities of Christian character (Galatians 5:22-23).",
        explanation: chosen.map((f) => `"${f.term}" — a ${f.kind === "gift" ? "gift" : "fruit"} of the Holy Spirit (${f.elaboration}).`).join(" "),
      };
    }

    if (branch === "match") {
      // Draws from the combined 18-item pool but only ever shows 5 at once — always a strict subset of
      // either 9-item list, per the same "never show all 9" floor rule.
      const chosen = shuffle(rng, SPIRIT_FACTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.elaboration })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether each term names a special ability (a gift) or a character quality (a fruit) of the Holy Spirit.",
        explanation: chosen.map((t) => `${t.term} — ${t.elaboration}.`).join(" "),
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
        hint: "Remember: the nine gifts (1 Corinthians 12) are abilities for serving others; the nine fruit (Galatians 5:22-23) are qualities of character.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "1 Corinthians 12:1-11 lists the word of wisdom, the word of knowledge, and", after: "as gifts of the Holy Spirit.", answer: "faith", accepted: ["faith"] },
      { before: "Among the nine gifts of the Holy Spirit are gifts of healing and the working of", after: ".", answer: "miracles", accepted: ["miracles"] },
      { before: "The gift of discerning of", after: "helps a believer recognise whether a teaching is truly from God.", answer: "spirits", accepted: ["spirits"] },
      { before: "Speaking in different kinds of tongues and the interpretation of tongues are both gifts of the Holy", after: ".", answer: "Spirit", accepted: ["spirit"] },
      { before: "Galatians 5:22-23 names love, joy, peace, patience, kindness, goodness, faithfulness, humility, and self-", after: "as the fruit of the Spirit.", answer: "control", accepted: ["control"] },
      { before: "The first fruit of the Spirit named in Galatians 5:22 is", after: ".", answer: "love", accepted: ["love"] },
      { before: "Patience is also called long-", after: "in some translations of Galatians 5:22.", answer: "suffering", accepted: ["suffering", "longsuffering"] },
      { before: "The fruit of humility is also described as gentleness or", after: ".", answer: "meekness", accepted: ["meekness"] },
      { before: "The fruit of the Holy Spirit promotes harmony among", after: ", according to this sub-strand's learning outcome.", answer: "Christians", accepted: ["christians"] },
      { before: "There are nine gifts of the Holy Spirit named in 1 Corinthians", after: ":1-11.", answer: "12", accepted: ["12", "twelve"] },
      { before: "There are nine fruit of the Holy Spirit named in Galatians", after: ":22-23.", answer: "5", accepted: ["5", "five"] },
      { before: "The value named for this sub-strand, shown by the fruit of the Spirit, is", after: ".", answer: "unity", accepted: ["unity"] },
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
      hint: "Think about the nine gifts of the Holy Spirit (1 Corinthians 12) and the nine fruit of the Holy Spirit (Galatians 5:22-23).",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
