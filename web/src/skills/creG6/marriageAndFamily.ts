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
    "each statement into the bucket for what it best describes about marriage and family.",
    "these facts about marriage and early marriage under the correct heading.",
    "each statement below by whether it describes Genesis 2:21-24 or a result of early marriage.",
    "each fact into the bucket for God's design for marriage or a harm of early marriage.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each value below to why it helps a young person avoid early marriage.",
    "each idea about marriage and family to the evidence that supports it.",
    "each term to the explanation of why it matters for a strong family.",
    "each value to the reason it protects a young person's future.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about marriage and family.",
    "the correct missing word.",
  ],
);

// Statements grouped by whether they describe Genesis 2:21-24's teaching on marriage/family, or the
// negative results of early marriage the outcomes ask learners to discuss — both drawn directly from the
// named source content, not invented.
const MARRIAGE_FACTS: { text: string; group: "design" | "harm" }[] = [
  { text: "God formed the woman from a rib taken from the man's side", group: "design" },
  { text: "The man says the woman is 'bone of my bones and flesh of my flesh'", group: "design" },
  { text: "Genesis 2:24 says a man leaves his father and mother to be united to his wife", group: "design" },
  { text: "Marriage brings a husband and wife together to become 'one flesh'", group: "design" },
  { text: "God Himself brings the woman to the man in the garden", group: "design" },
  { text: "Family life is meant to be built on unity between husband and wife", group: "design" },
  { text: "A girl who marries early is often forced to leave school before finishing her education", group: "harm" },
  { text: "Early marriage carries serious health risks for a young mother's body", group: "harm" },
  { text: "A child who marries early loses the chance to grow, play, and develop like other children", group: "harm" },
  { text: "Early marriage often traps a young family in poverty due to lost education and opportunity", group: "harm" },
  { text: "Young people who marry early are often not ready for the responsibilities of running a home", group: "harm" },
  { text: "Early marriage can lead to family instability because the couple is not yet mature enough", group: "harm" },
];

const VALUE_REASON: { term: string; evidence: string }[] = [
  { term: "Self-control", evidence: "Helps a young person resist pressure to rush into marriage before they are ready" },
  { term: "Respect", evidence: "Respecting oneself and others helps a young person value their body and their future" },
  { term: "Focus on education", evidence: "Staying committed to school keeps a young person's future opportunities open" },
  { term: "Guidance from parents", evidence: "Listening to parents and mentors helps a young person make wiser, safer choices about the future" },
  { term: "Patience", evidence: "Waiting for the right time protects a young person from decisions made too early in life" },
  { term: "Courage", evidence: "Standing firm against pressure from peers or relatives who push for early marriage takes real courage" },
  { term: "Wisdom", evidence: "Understanding the long-term harm of early marriage helps a young person choose differently" },
  { term: "Unity with family", evidence: "A supportive family that discusses these decisions together helps protect a young person from early marriage" },
  { term: "Honesty", evidence: "Being honest with a trusted adult about pressure to marry early allows for help before it is too late" },
  { term: "Responsibility", evidence: "Understanding that marriage carries big responsibilities helps a young person see why waiting matters" },
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
    prompt: `${name(rng)} in ${place(rng)} reads Genesis 2:21-24, where God forms the woman from the man's rib and the man says she is 'bone of my bones and flesh of my flesh.' What does this passage teach about marriage?`,
    correct: "Marriage was designed by God to unite a husband and wife closely, as one flesh",
    wrong: [
      "Marriage is simply a legal arrangement with no deeper meaning",
      "God had no involvement in bringing the first husband and wife together",
      "The passage only describes an ordinary friendship, not marriage",
    ],
    explanation: "Genesis 2:21-24 shows marriage as God's own idea, uniting a man and his wife so closely that scripture calls them 'one flesh.'",
  }),
  (rng) => ({
    prompt: `In CRE class in ${place(rng)}, ${name(rng)} is asked what Genesis 2:24 means by 'a man shall leave his father and mother and be united to his wife.' What is being taught here?`,
    correct: "Marriage creates a new family unit, with the husband and wife committed to each other",
    wrong: [
      "Children should leave their parents' home as soon as they are born",
      "A married couple should never speak to their parents again",
      "Marriage means a person no longer belongs to any family at all",
    ],
    explanation: "Genesis 2:24 describes marriage forming a new, committed family unit — 'leaving' means a shift in primary commitment to one's spouse, not abandoning one's parents.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s cousin in ${place(rng)} was married off at age fourteen and had to stop attending school immediately afterward. Which negative result of early marriage does this best illustrate?`,
      correct: "Early marriage often interrupts or ends a young person's education",
      wrong: [
        "Early marriage always improves a young person's grades in school",
        "Early marriage has no effect on a young person's schooling at all",
        "Early marriage only affects boys, never girls, in their education",
      ],
      explanation: "One of the most common harms of early marriage is that it forces a young person, especially a girl, to leave school before completing their education.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} learns that a girl who married very young in ${place(rng)} faced serious health complications during childbirth because her body was not yet fully developed. Which negative result of early marriage does this show?`,
    correct: "Early marriage carries serious health risks for a young mother, since her body may not be ready",
    wrong: [
      "Health risks from early marriage only ever affect the husband, not the wife",
      "A young mother's body is always fully ready for childbirth regardless of age",
      "This shows early marriage has no health consequences at all",
    ],
    explanation: "CRE teaching on the negative results of early marriage includes the real health dangers young mothers can face when their bodies are not yet mature.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is being pressured by relatives to get married while still in upper primary school. Which value would most help ${who} resist this pressure and stay in school?`,
      correct: "Self-control and a focus on education, supported by guidance from a trusted parent or mentor",
      wrong: [
        "Simply ignoring the family and running away without telling anyone",
        "Agreeing immediately to avoid conflict with relatives",
        "Believing that education no longer matters once a marriage is proposed",
      ],
      explanation: "The lesson's values — self-control, focus on education, and seeking guidance from parents or mentors — are exactly what help a young person resist early marriage.",
    };
  },
  (rng) => ({
    prompt: `A newly married young couple in ${place(rng)}, both under sixteen, struggle to manage their home, finances, and responsibilities and often argue. What does this scenario best illustrate about early marriage?`,
    correct: "Young people who marry early are often not yet mature enough for the responsibilities marriage requires",
    wrong: [
      "This shows early marriage always leads to instant success in managing a home",
      "This proves age has no connection to a couple's readiness for marriage",
      "This shows the couple's struggles are unrelated to how young they are",
    ],
    explanation: "CRE teaching on the results of early marriage highlights family instability, since very young couples often lack the maturity needed for marriage's responsibilities.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims that Genesis 2:21-24 has nothing to do with why marriage matters today. Based on what the passage actually teaches, is this claim accurate?`,
    correct: "No — the passage is the foundational biblical teaching on why marriage is a God-ordained, important institution",
    wrong: [
      "Yes — the passage is only a historical note with no lesson for today",
      "Yes — Genesis 2:21-24 talks about a completely different topic",
      "No — but the passage only applies to people living in ancient times",
    ],
    explanation: "Genesis 2:21-24 is CRE's key text for understanding marriage as an institution designed by God, which remains the foundation for why marriage matters today.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that avoiding early marriage is only about waiting for an older age, and has nothing to do with personal values. Is this a complete understanding of the lesson?`,
    correct: "No — values like self-control, respect, and guidance from parents are what actually help someone avoid early marriage, not age alone",
    wrong: [
      "Yes — age is the only factor that matters in avoiding early marriage",
      "Yes — values have no real connection to marriage decisions",
      "No — but only wealth, not values, protects someone from early marriage",
    ],
    explanation: "The lesson specifically identifies values needed to avoid early marriage — waiting alone is not the point; building good character and seeking guidance is.",
  }),
  (rng) => ({
    prompt: `${name(rng)} hears a friend in ${place(rng)} say that once someone is married, whether young or old, their family relationships end completely. How does Genesis 2:24 correct this idea?`,
    correct: "Marriage forms a new family commitment between spouses, but it is described within the context of families, not as erasing all family ties",
    wrong: [
      "Genesis 2:24 agrees that marriage erases every family relationship instantly",
      "Genesis 2:24 says a married person should never mention their parents again",
      "Genesis 2:24 has nothing at all to say about family relationships",
    ],
    explanation: "Genesis 2:24 uses the language of a man leaving his parents' household to form a new family unit with his wife — it describes a shift in commitment, not the end of family bonds.",
  }),
  (rng) => ({
    prompt: `${name(rng)}, a Grade 6 learner in ${place(rng)}, is asked why the key inquiry question for this lesson is 'Why is marriage an important institution?' rather than simply 'What is marriage?' What does this suggest about the lesson's focus?`,
    correct: "The lesson wants learners to explain the value and purpose of marriage, not just define the word",
    wrong: [
      "The lesson wants learners to memorise a legal definition of marriage only",
      "The lesson has no real focus and the question does not matter",
      "The lesson is only about the wedding ceremony itself",
    ],
    explanation: "'Why is marriage an important institution?' pushes learners toward explaining marriage's purpose and value (from Genesis 2:21-24), which is exactly what the outcomes ask for.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that early marriage is not really a serious problem because 'people used to marry young a long time ago.' How would CRE teaching respond to this argument?`,
    correct: "Early marriage still causes real harm today — interrupted education, health risks, and family instability — regardless of past practice",
    wrong: [
      "CRE teaching agrees that past practice makes early marriage acceptable today",
      "CRE teaching says early marriage was never a problem in any era",
      "CRE teaching has no position on early marriage at all",
    ],
    explanation: "The lesson's outcomes specifically ask learners to discuss the negative results of early marriage today, regardless of what was practised historically.",
  }),
];

export const marriageAndFamily: Skill = {
  id: "g6-cre-cn-marriage-and-family",
  code: "CN.2",
  subjectId: "cre",
  strandId: "g6-cre-creation",
  grade: 6,
  title: "Marriage and Family",
  description: "Genesis 2:21-24's teaching on marriage as a God-ordained institution, the negative results of early marriage, and the values needed to avoid it.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (Genesis 2:21-24's teaching, harms of
    // early marriage, and protective values), so `ordering` is deliberately skipped — 4 kinds is the honest cap.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const design = shuffle(rng, MARRIAGE_FACTS.filter((f) => f.group === "design")).slice(0, 4);
      const harm = shuffle(rng, MARRIAGE_FACTS.filter((f) => f.group === "harm")).slice(0, 4);
      const chosen = shuffle(rng, [...design, ...harm]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "design", label: "God's design for marriage (Genesis 2:21-24)" },
          { id: "harm", label: "Negative result of early marriage" },
        ],
        correctBucket,
        hint: "Genesis 2:21-24 describes how marriage was designed; the other facts describe real harms caused by marrying too young.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "design" ? "God's design for marriage" : "a negative result of early marriage"}.`).join(" "),
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
        hint: "Think about how each value specifically protects a young person from marrying too early.",
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
        hint: "Think about what Genesis 2:21-24 teaches about marriage, and what CRE teaches about the harms of early marriage.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "In Genesis 2:21-24, God formed the woman from a", after: "taken from the man's side.", answer: "rib", accepted: ["rib"] },
      { before: "The man calls the woman 'bone of my bones and", after: "of my flesh.'", answer: "flesh", accepted: ["flesh"] },
      { before: "Genesis 2:24 says a man shall leave his father and mother and be united to his", after: ".", answer: "wife", accepted: ["wife"] },
      { before: "According to Genesis 2:24, a husband and wife become one", after: ".", answer: "flesh", accepted: ["flesh"] },
      { before: "Marriage is described in CRE as an important God-ordained", after: ".", answer: "institution", accepted: ["institution"] },
      { before: "One negative result of early marriage is that it often interrupts a young person's", after: ".", answer: "education", accepted: ["education"] },
      { before: "Early marriage carries serious", after: "risks for a young mother's body.", answer: "health", accepted: ["health"] },
      { before: "Very young married couples often lack the", after: "needed to manage a home well.", answer: "maturity", accepted: ["maturity"] },
      { before: "The value of self-", after: "helps a young person resist pressure to marry too early.", answer: "control", accepted: ["control"] },
      { before: "Seeking", after: "from parents or mentors helps a young person make wiser decisions about marriage.", answer: "guidance", accepted: ["guidance"] },
      { before: "Staying committed to school protects a young person's future", after: ".", answer: "opportunities", accepted: ["opportunities", "opportunity"] },
      { before: "The key inquiry question for this lesson asks why marriage is an important", after: ".", answer: "institution", accepted: ["institution"] },
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
      hint: "Think about Genesis 2:21-24 and the harms of early marriage discussed in this lesson.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
