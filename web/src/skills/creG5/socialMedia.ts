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
    "each statement by whether it is a benefit or a safety risk of social media.",
    "these facts about social media under the correct bucket.",
    "each fact below by which idea it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about social media with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about social media.",
    "the correct missing word.",
  ],
);

interface MediaFact { text: string; group: "benefit" | "risk" }
const MEDIA_FACTS: MediaFact[] = [
  { text: "Social media can help learners stay connected with distant family and friends", group: "benefit" },
  { text: "Social media can be used to watch educative documentaries, such as Bible stories", group: "benefit" },
  { text: "Social media can help spread positive, encouraging messages quickly", group: "benefit" },
  { text: "Social media can support learning by sharing helpful educational content", group: "benefit" },
  { text: "Visiting inappropriate sites while using social media is a safety risk to avoid", group: "risk" },
  { text: "Spending too much time on social media can lead to unhealthy addiction", group: "risk" },
  { text: "Believing everything seen online without checking facts can spread false information", group: "risk" },
  { text: "Talking to strangers online without caution can put a young person's safety at risk", group: "risk" },
  { text: "Peer pressure online can lead someone to make choices they later regret", group: "risk" },
  { text: "Sharing personal information carelessly online is a cybersecurity risk", group: "risk" },
  { text: "Using social media responsibly reflects the value of integrity", group: "benefit" },
  { text: "Excessive use of social media can distract from schoolwork and sleep", group: "risk" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Social media", meaning: "Online platforms people use to connect, share, and communicate with others" },
  { term: "Safety precautions", meaning: "Steps taken to protect oneself, such as avoiding inappropriate sites, when using social media" },
  { term: "Integrity", meaning: "The value of using social media ethically and honestly" },
  { term: "Cyber security", meaning: "Protecting personal information and staying safe while using digital devices and the internet" },
  { term: "Responsible use", meaning: "Using social media in a God-fearing, careful and thoughtful way" },
  { term: "Peer pressure resistance", meaning: "The ability to avoid negative influence from others while using social media" },
  { term: "Addiction", meaning: "Becoming unhealthily dependent on spending time on social media" },
  { term: "Inappropriate sites", meaning: "Online content that is unsuitable or harmful, which this lesson teaches learners to avoid" },
  { term: "Educative documentaries", meaning: "Helpful, informative videos, such as Bible stories, that can be watched using digital devices" },
  { term: "Debate", meaning: "A structured discussion, such as on the motion 'social media is ruining children and the youth'" },
  { term: "God-fearing use", meaning: "Using social media in a way that honours Christian values" },
  { term: "Advantages and disadvantages", meaning: "The positive and negative sides of social media that this lesson asks learners to weigh" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Kiplagat", "Nyokabi", "Otiende", "Wanjiru", "Barongo", "Chelangat", "Mutugi", "Achola", "Kiplimo", "Njeru", "Sila", "Wekesa"] as const;
const KENYAN_PLACES = ["Timboroa", "Suna", "Kapsowar", "Tharaka", "Kabras", "Ngong", "Muhoroni", "Marakwet", "Kilgoris", "Ndhiwa", "Sabatia", "Ortum"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} receives a message from an unfamiliar online account asking for personal details like their home address. Based on this lesson, what is the safest response?`,
    correct: "Do not share personal information and tell a trusted adult about the message, following safety precautions taught in this lesson",
    wrong: [
      "Share the details immediately, since the account seemed friendly",
      "This lesson has no guidance relevant to messages from strangers online",
      "Share only some details, but not all of them, without telling anyone",
    ],
    explanation: "This lesson teaches discussing safety measures to observe when using social media — never sharing personal information with strangers online is a key precaution.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices they have been spending several hours daily on social media, missing sleep and schoolwork. What does this lesson suggest about this pattern?`,
      correct: "It reflects unhealthy overuse or addiction, which this lesson teaches learners to be aware of and avoid",
      wrong: [
        "This pattern is completely healthy and has no downsides at all",
        "The lesson has no teaching relevant to how much time is spent on social media",
        "Only adults, never young learners, need to worry about time spent online",
      ],
      explanation: "This lesson's outcomes include discussing the advantages and disadvantages of social media — excessive use leading to lost sleep or missed schoolwork reflects a disadvantage to be aware of.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads a shocking claim shared by a friend on social media and is about to share it further without checking if it is true. What does responsible social media use suggest instead?`,
    correct: "Verify the information before sharing it, to avoid spreading false or misleading content",
    wrong: [
      "Share it immediately, since friends only ever share accurate information",
      "This lesson provides no guidance about checking information before sharing",
      "Delete the account instead of ever checking whether the claim is true",
    ],
    explanation: "This lesson's emphasis on responsible, God-fearing use of social media includes being careful not to spread false information without checking its accuracy first.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is invited by classmates to join a group chat that regularly shares inappropriate content. What value from this lesson should guide ${who}'s decision?`,
      correct: "Integrity — choosing to avoid the inappropriate content even if it means leaving or not joining the group chat",
      wrong: [
        "Popularity — joining any group chat regardless of its content",
        "This lesson provides no relevant value for this kind of decision",
        "Curiosity — joining just to see what the content is like",
      ],
      explanation: "This lesson highlights integrity as a value for using social media ethically and responsibly, including avoiding groups that share inappropriate content.",
    };
  },
  (rng) => ({
    prompt: `A class debate in ${place(rng)}, led by ${name(rng)}, discusses the motion "Social media is ruining children and the youth." What balanced view does this lesson encourage?`,
    correct: "Recognising both real advantages and real disadvantages of social media, rather than viewing it as entirely good or entirely bad",
    wrong: [
      "Concluding immediately that social media has no advantages at all",
      "Concluding immediately that social media has no disadvantages at all",
      "Avoiding the debate entirely since this lesson discourages discussing social media",
    ],
    explanation: "This lesson's own suggested activity is debating this exact motion, encouraging learners to weigh both advantages and disadvantages of social media thoughtfully.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wants to use social media to watch a Bible-related documentary, as this lesson suggests. What does this example show about social media's potential?`,
      correct: "Social media can be used positively for learning and spiritual growth, not only for entertainment or risk",
      wrong: [
        "Social media should never be used for anything related to faith or learning",
        "This example has no connection to responsible social media use",
        "Watching documentaries online is discouraged entirely by this lesson",
      ],
      explanation: "This lesson explicitly suggests using digital devices to watch educative documentaries, such as Bible stories, showing social media's positive potential.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} believes that using social media responsibly only means avoiding illegal activity, with nothing more to consider. Is this the complete picture this lesson teaches?`,
    correct: "No — responsible use also includes safety precautions, integrity, avoiding addiction, and using it in a God-fearing way",
    wrong: [
      "Yes — avoiding illegal activity is the only consideration this lesson raises",
      "Yes — this lesson has no teaching beyond legal concerns",
      "No — but the lesson actually discourages any concern about safety or values",
    ],
    explanation: "This lesson's outcomes cover safety measures, integrity, avoiding inappropriate sites, and God-fearing responsible use — a much fuller picture than legality alone.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says social media addiction only affects a person's free time, with no wider impact on their life. Does this lesson support this narrow view?`,
    correct: "No — the lesson connects excessive or careless social media use to wider risks, including safety, schoolwork, and healthy relationships",
    wrong: [
      "Yes — the lesson teaches that social media addiction has no wider effects",
      "Yes — schoolwork and safety are unrelated to how social media is used",
      "No — but the lesson actually discourages any concern about social media use",
    ],
    explanation: "This lesson connects social media habits to wider concerns, including safety precautions and responsible, values-based use, not just isolated free time.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices a classmate being pressured by an online group to post something they are uncomfortable with. Which lesson theme applies most directly here?`,
      correct: "Peer pressure resistance, encouraging the classmate to resist and use social media responsibly despite the pressure",
      wrong: [
        "This lesson has no theme relevant to peer pressure experienced online",
        "The classmate should give in to the pressure to avoid any conflict",
        "Only pressure experienced in person, never online, is addressed by this lesson",
      ],
      explanation: "This lesson explicitly identifies peer pressure resistance as relevant to social media use, encouraging learners to resist negative online pressure.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why this lesson connects social media use to Christian values like being "God-fearing," rather than only discussing internet safety rules. What is the reasoning?`,
    correct: "Christian values, like integrity and self-control, guide not just what is safe but also what is right and honouring to God when using social media",
    wrong: [
      "There is no meaningful connection between Christian values and social media use",
      "Safety rules and Christian values are treated as exactly the same thing in this lesson",
      "This lesson discourages connecting faith to everyday technology use",
    ],
    explanation: "This lesson's outcome is using social media responsibly 'as God-fearing Christians,' connecting Christian values directly to everyday technology choices.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to list both advantages and disadvantages of social media, as this lesson requires. Which pairing best reflects a balanced answer?`,
      correct: "Advantage: staying connected with family; Disadvantage: risk of spending too much time online and neglecting responsibilities",
      wrong: [
        "Listing only advantages, since disadvantages are not part of this lesson",
        "Listing only disadvantages, since advantages are not part of this lesson",
        "Refusing to list anything, since the topic is considered too difficult",
      ],
      explanation: "This lesson's outcome explicitly asks learners to debate the advantages and disadvantages of social media — a balanced pairing best reflects this requirement.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} concludes that avoiding all social media entirely is the only truly responsible choice this lesson teaches. Is this the lesson's actual conclusion?`,
    correct: "No — the lesson teaches using social media responsibly, safely, and with integrity, not necessarily avoiding it altogether",
    wrong: [
      "Yes — the lesson insists that all social media use should be avoided completely",
      "Yes — there is no responsible way to use social media, according to this lesson",
      "No — but the lesson actually encourages unlimited, unrestricted use instead",
    ],
    explanation: "This lesson's outcome is to 'use social media responsibly as God-fearing Christians,' teaching thoughtful, safe use rather than complete avoidance.",
  }),
];

export const socialMedia: Skill = {
  id: "g5-cre-cl-social-media",
  code: "CL.5",
  subjectId: "cre",
  strandId: "g5-cre-living",
  grade: 5,
  title: "Social Media",
  description: "The advantages and disadvantages of social media, safety precautions to observe when using it, and using social media responsibly as a God-fearing Christian.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (advantages/risks and safety values,
    // not a story with events), so "ordering" is deliberately skipped — 4 kinds is the honest cap here.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const benefit = shuffle(rng, MEDIA_FACTS.filter((f) => f.group === "benefit")).slice(0, 4);
      const risk = shuffle(rng, MEDIA_FACTS.filter((f) => f.group === "risk")).slice(0, 4);
      const chosen = shuffle(rng, [...benefit, ...risk]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "benefit", label: "A benefit of social media" },
          { id: "risk", label: "A safety risk of social media" },
        ],
        correctBucket,
        hint: "The benefit bucket is about positive uses; the risk bucket is about dangers to be careful of.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "benefit" ? "a benefit of social media" : "a safety risk of social media"}.`).join(" "),
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
        hint: "Think about the safety precautions and values needed to use social media responsibly.",
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
        hint: "Think about the safety precautions and Christian values needed to use social media responsibly.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Social media can help learners stay connected with distant family and", after: ".", answer: "friends", accepted: ["friends"] },
      { before: "This lesson teaches avoiding", after: "sites while using social media.", answer: "inappropriate", accepted: ["inappropriate"] },
      { before: "Spending too much time on social media can lead to unhealthy", after: ".", answer: "addiction", accepted: ["addiction"] },
      { before: "Sharing personal information carelessly online is a", after: "risk.", answer: "cybersecurity", accepted: ["cybersecurity", "security"] },
      { before: "This lesson teaches the value of", after: "when using social media ethically.", answer: "integrity", accepted: ["integrity"] },
      { before: "This lesson suggests using digital devices to watch educative", after: ".", answer: "documentaries", accepted: ["documentaries"] },
      { before: "Learners are asked to debate the motion that social media is", after: "children and the youth.", answer: "ruining", accepted: ["ruining"] },
      { before: "This lesson teaches learners to use social media responsibly as God-fearing", after: ".", answer: "Christians", accepted: ["christians"] },
      { before: "This lesson's key inquiry question asks why you should use social media", after: ".", answer: "responsibly", accepted: ["responsibly"] },
      { before: "Talking to strangers online without caution can put a young person's", after: "at risk.", answer: "safety", accepted: ["safety"] },
      { before: "This lesson asks learners to list the advantages and", after: "of social media.", answer: "disadvantages", accepted: ["disadvantages"] },
      { before: "Peer pressure", after: "helps a learner avoid negative influence online.", answer: "resistance", accepted: ["resistance"] },
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
      hint: "Think about the safety precautions and values needed to use social media responsibly.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
