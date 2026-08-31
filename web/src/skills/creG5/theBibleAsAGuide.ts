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
    "each statement by whether it is about daily guidance or about spiritual growth.",
    "these facts about the Bible under the correct bucket.",
    "each fact below by which benefit of reading the Bible it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the Bible as a guide with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the Bible as a guide.",
    "the correct missing word.",
  ],
);

interface BibleFact { text: string; group: "guidance" | "growth" }
const BIBLE_FACTS: BibleFact[] = [
  { text: "Joshua 1:8 says meditating on the Book of the Law helps a person be careful to do what it says", group: "guidance" },
  { text: "Reading the Bible helps a learner make wise choices when facing a difficult decision", group: "guidance" },
  { text: "The Bible gives moral guidance on how to treat other people fairly and kindly", group: "guidance" },
  { text: "Family members can turn to the Bible together when settling a disagreement at home", group: "guidance" },
  { text: "The Bible helps believers resolve conflicts by teaching forgiveness and honesty", group: "guidance" },
  { text: "A church leader uses Bible teaching to counsel someone facing a hard choice", group: "guidance" },
  { text: "Psalms 1:1-3 compares a person who delights in God's law to a tree planted by streams of water", group: "growth" },
  { text: "Joshua 1:8 promises that the one who obeys the Book of the Law will be prosperous and successful", group: "growth" },
  { text: "Reading the Bible regularly is described in Psalms 1 as bearing fruit in season", group: "growth" },
  { text: "The Bible offers comfort and hope to someone going through a hard season of life", group: "growth" },
  { text: "Reading the Bible helps a Christian grow closer to God over time", group: "growth" },
  { text: "The Bible strengthens a believer's faith when they face fear or doubt", group: "growth" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Joshua 1:8", meaning: "The verse that instructs meditating on the Book of the Law day and night in order to do what it says" },
  { term: "Psalms 1:1-3", meaning: "The passage comparing an obedient believer to a fruitful tree planted by streams of water" },
  { term: "Meditate", meaning: "To think deeply and carefully about God's word, as Joshua 1:8 instructs" },
  { term: "Guide", meaning: "Something that shows the right way to go, which the Bible is for daily Christian living" },
  { term: "Prosperous", meaning: "The result Joshua 1:8 promises for a person who carefully obeys the Book of the Law" },
  { term: "Fruit in season", meaning: "The image Psalms 1:3 uses to describe the good results in the life of a person who follows God's word" },
  { term: "Moral guidance", meaning: "Direction the Bible gives on how to live rightly and treat others well" },
  { term: "Spiritual growth", meaning: "Becoming closer to God and more Christ-like over time, which regular Bible reading nurtures" },
  { term: "Comfort", meaning: "The peace and hope the Bible can bring to someone facing hardship" },
  { term: "Decision-making", meaning: "Choosing what to do in a difficult situation, which Bible teaching can help guide" },
  { term: "Family devotion", meaning: "A time when family members read and discuss the Bible together" },
  { term: "Encouragement", meaning: "Words of strength and hope the Bible offers to someone who is discouraged" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Achieng", "Baraka", "Chege", "Debora", "Edwin", "Fatuma", "Gideon", "Halima", "Irungu", "Joska", "Kemunto", "Lemayian"] as const;
const KENYAN_PLACES = ["Kericho", "Bungoma", "Nakuru", "Wajir", "Machakos", "Lodwar", "Kisii", "Thika", "Mumias", "Kajiado", "Kwale", "Nyeri"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is confused about whether to join classmates who are planning to cheat in an exam. Based on how the Bible can guide daily decisions, what is the best next step?`,
    correct: "Think about what the Bible teaches about honesty and choose not to join the cheating",
    wrong: [
      "Follow the classmates since most of them are already doing it",
      "The Bible only guides adults, not decisions children make at school",
      "Wait until after the exam to think about what is right",
    ],
    explanation: "The Bible's teaching on honesty gives daily guidance for real decisions, such as choosing not to cheat even when others are doing it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} feels afraid before moving to a new school. Which teaching from this lesson could bring ${who} comfort?`,
      correct: "The Bible offers comfort and hope to someone facing a hard or uncertain season of life",
      wrong: [
        "The Bible only addresses adult problems, never a child's fears",
        "Fear should be hidden and never discussed with anyone",
        "Comfort can only come from avoiding the Bible until the fear passes",
      ],
      explanation: "One of the Bible's benefits highlighted in this lesson is offering comfort and hope during hard or uncertain times, which fits a fear like starting a new school.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads Joshua 1:8 and notices it says to meditate on the Book of the Law "day and night." What does this verse teach about how often someone should engage with God's word?`,
    correct: "Regularly and continually, not just occasionally, so that a person is careful to do what it says",
    wrong: [
      "Only once a year, during a special church service",
      "Only when facing a major crisis, and never otherwise",
      "Joshua 1:8 does not specify how often at all",
    ],
    explanation: "Joshua 1:8's phrase 'day and night' teaches ongoing, regular engagement with God's word, not a one-time or rare event.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says the Bible is just an old book with no relevance to problems today, like arguments with friends. How does this lesson respond to that claim?`,
      correct: "The Bible offers guidance still relevant today, including teaching on forgiveness and honesty that helps resolve conflicts",
      wrong: [
        "The claim is correct — the Bible only discusses ancient history",
        "The Bible is relevant only to adults, never to children's friendships",
        "The Bible can only be used inside a church building",
      ],
      explanation: "This lesson teaches that the Bible guides believers in resolving conflicts through forgiveness and honesty — a very present-day application.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads Psalms 1:3 and sees a person who delights in God's law compared to "a tree planted by streams of water" that "yields its fruit in season." What is this image meant to show?`,
    correct: "A person who follows God's word grows steadily and produces good results in their life over time",
    wrong: [
      "The verse is only literal farming advice about where to plant trees",
      "The comparison means only farmers benefit from reading the Bible",
      "The image warns that trees are more valuable than people",
    ],
    explanation: "Psalms 1:3 uses a fruitful, well-watered tree as a picture of steady growth and good results in the life of someone who follows God's word.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} is disagreeing over how to share household chores fairly. Based on this lesson, how could the Bible help the family?`,
      correct: "The family could turn to the Bible together for guidance on fairness and settling the disagreement peacefully",
      wrong: [
        "The Bible cannot help with everyday matters like chores",
        "Only the parents are allowed to use the Bible for guidance",
        "The disagreement should simply be ignored instead of addressed",
      ],
      explanation: "The lesson teaches that family members can turn to the Bible together when settling disagreements, including everyday matters like sharing responsibilities fairly.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} believes that reading the Bible only benefits a person's spiritual life and has nothing to do with everyday choices like exam honesty or fair play in sports. Is this a complete understanding of this lesson?`,
    correct: "No — the Bible guides both spiritual growth and practical, day-to-day decisions like honesty and fairness",
    wrong: [
      "Yes — the Bible is only meant for prayer time, never daily choices",
      "Yes — practical decisions should always be separated from faith",
      "No — but only decisions made inside a church count",
    ],
    explanation: "This lesson teaches the Bible as a guide for both spiritual growth (Psalms 1) and practical daily decisions (Joshua 1:8's promise tied to obedience in action).",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know what Joshua 1:8 promises will happen to someone who is careful to obey everything written in the Book of the Law. What does the verse say?`,
    correct: "That person will be prosperous and successful",
    wrong: [
      "That person will never face any hardship again",
      "That person will automatically become a religious leader",
      "The verse makes no promise at all about the outcome",
    ],
    explanation: "Joshua 1:8 explicitly promises that careful obedience to God's word leads to being prosperous and successful.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} finds a Bible verse that seems to disagree with a rumor a friend spread about someone in class. What does this lesson suggest ${who} should do with that discovery?`,
      correct: "Let the Bible's teaching, such as honesty and not gossiping, guide how to respond to the situation",
      wrong: [
        "Ignore the Bible verse since rumors are not a serious enough matter",
        "Spread the rumor further since a friend started it",
        "Keep the discovery secret and take no guidance from it at all",
      ],
      explanation: "This lesson's core idea is that the Bible offers real guidance for everyday situations, including how to respond to gossip and rumors with honesty.",
    };
  },
  (rng) => ({
    prompt: `A youth group leader in ${place(rng)} uses Bible teaching to help a struggling learner choose between two paths of action. What role is the leader demonstrating from this lesson?`,
    correct: "Using the Bible as a source for counsel and guidance in decision-making",
    wrong: [
      "Replacing the learner's own decision entirely without listening",
      "This role has no connection to any use of the Bible discussed in this lesson",
      "Only ordained pastors, never youth leaders, may counsel using the Bible",
    ],
    explanation: "The lesson lists counseling and guiding decisions as real uses of the Bible in society today, which this youth leader is demonstrating.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} skips reading the Bible for weeks and then wonders why they feel discouraged and unsure what is right. What does this lesson suggest is missing?`,
      correct: "Regular engagement with the Bible, which provides guidance, comfort and spiritual growth over time",
      wrong: [
        "Nothing is missing — Bible reading has no real effect on daily feelings",
        `${who} should stop reading the Bible completely to feel better`,
        "Only feeling discouraged during exams counts as a real problem",
      ],
      explanation: "The lesson's core idea, from Joshua 1:8's 'day and night' and Psalms 1's fruitful tree, is that regular, ongoing engagement with the Bible brings guidance, comfort and growth.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} asks why Christians describe the Bible as being like water for a tree planted by a stream (Psalms 1:3), rather than describing it as a rulebook only. What does this comparison add?`,
    correct: "It shows the Bible nourishes and grows a person's life continually, not just gives a list of rules to follow",
    wrong: [
      "It shows the Bible is only useful during the rainy season",
      "It shows the Bible replaces the need for water in daily life",
      "It shows Christians should worship trees instead of God",
    ],
    explanation: "Psalms 1:3's water-and-tree image emphasizes ongoing nourishment and growth from God's word, a fuller picture than a bare list of rules.",
  }),
];

export const theBibleAsAGuide: Skill = {
  id: "g5-cre-bi-bible-as-a-guide",
  code: "BI.1",
  subjectId: "cre",
  strandId: "g5-cre-bible",
  grade: 5,
  title: "The Bible as a Guide",
  description: "The Bible's role as a guide for daily life and spiritual growth, drawing on Joshua 1:8 and Psalms 1:1-3, and its uses and benefits in society, home, church and community today.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (benefits/uses of the Bible and the
    // two named Bible texts), so "ordering" is deliberately skipped — 4 kinds is the honest cap here.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const guidance = shuffle(rng, BIBLE_FACTS.filter((f) => f.group === "guidance")).slice(0, 4);
      const growth = shuffle(rng, BIBLE_FACTS.filter((f) => f.group === "growth")).slice(0, 4);
      const chosen = shuffle(rng, [...guidance, ...growth]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "guidance", label: "Guidance for daily decisions" },
          { id: "growth", label: "Spiritual growth and comfort" },
        ],
        correctBucket,
        hint: "Guidance facts are about deciding what to do; growth facts are about becoming closer to God or being comforted.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "guidance" ? "guidance for daily decisions" : "spiritual growth and comfort"}.`).join(" "),
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
        hint: "Think about what Joshua 1:8 and Psalms 1:1-3 each teach about the Bible.",
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
        hint: "Think about how Joshua 1:8 and Psalms 1:1-3 describe the benefits of engaging with God's word.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Joshua 1:8 instructs meditating on the Book of the Law day and", after: ".", answer: "night", accepted: ["night"] },
      { before: "Joshua 1:8 promises that a person who carefully obeys the Book of the Law will be prosperous and", after: ".", answer: "successful", accepted: ["successful"] },
      { before: "Psalms 1:3 compares an obedient believer to a tree planted by streams of", after: ".", answer: "water", accepted: ["water"] },
      { before: "According to Psalms 1:3, this tree yields its", after: "in season.", answer: "fruit", accepted: ["fruit"] },
      { before: "The Bible can offer", after: "and hope to someone facing a hard season of life.", answer: "comfort", accepted: ["comfort"] },
      { before: "Reading the Bible regularly helps a learner grow closer to", after: ".", answer: "God", accepted: ["god"] },
      { before: "Family members can turn to the Bible together when settling a", after: "at home.", answer: "disagreement", accepted: ["disagreement", "disagreements"] },
      { before: "The Bible gives moral", after: "on how to treat other people fairly.", answer: "guidance", accepted: ["guidance"] },
      { before: "A church leader can use Bible teaching to", after: "someone facing a hard choice.", answer: "counsel", accepted: ["counsel"] },
      { before: "The Bible teaches forgiveness and honesty, which helps resolve", after: ".", answer: "conflicts", accepted: ["conflicts", "conflict"] },
      { before: "This lesson's key inquiry question asks why the Bible should", after: "us in daily life.", answer: "guide", accepted: ["guide"] },
      { before: "Meditating on God's word, according to Joshua 1:8, helps a person be careful to do what it", after: ".", answer: "says", accepted: ["says"] },
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
      hint: "Think about Joshua 1:8, Psalms 1:1-3, and the benefits of using the Bible as a daily guide.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
