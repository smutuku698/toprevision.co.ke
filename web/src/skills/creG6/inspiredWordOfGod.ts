import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

// Compose a larger prompt pool from a small set of openers x closers (per RIGOR-STANDARDS.md's
// "affordable way to reach 20+" technique) instead of hand-authoring 20 fully bespoke sentences.
function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement about a Bible author into the Old Testament or New Testament bucket.",
    "these facts about who wrote the Bible under the correct testament.",
    "each fact below by which testament its author belongs to.",
    "each statement into the bucket for the testament its author wrote in.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each reason or advantage of Bible translation to its explanation.",
    "each translation term below with what it means for believers.",
    "each idea about translating the Bible to the evidence that supports it.",
    "each term to the explanation of why it matters for Bible translation.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the Bible.",
    "the correct missing word.",
  ],
);

// Authors "traditionally credited with writing" books of the Bible — the design says only "name three
// authors" without specifying names, so a curriculum-safe, well-known set is used: Moses, David, Isaiah
// (Old Testament) and Paul, Luke, John (New Testament).
const AUTHOR_FACTS: { text: string; testament: "old" | "new" }[] = [
  { text: "Moses is traditionally credited with writing the first five books of the Bible, including Genesis and Exodus", testament: "old" },
  { text: "Moses wrote during the time of the Exodus, generations before Jesus was born", testament: "old" },
  { text: "David is remembered as the author of many of the Psalms, songs of worship and prayer", testament: "old" },
  { text: "David's psalms were written centuries before the birth of Jesus Christ", testament: "old" },
  { text: "Isaiah is credited with writing a book of prophecy about God's promises to His people", testament: "old" },
  { text: "Isaiah's prophecies were written long before the events of the New Testament", testament: "old" },
  { text: "Paul wrote many letters, called epistles, to churches and individual Christians", testament: "new" },
  { text: "Paul's letters were written after the resurrection of Jesus Christ", testament: "new" },
  { text: "Luke wrote an orderly account of the life of Jesus Christ in his Gospel", testament: "new" },
  { text: "Luke also wrote the Book of Acts, describing the growth of the early church", testament: "new" },
  { text: "John wrote a Gospel that focuses on Jesus Christ as the Son of God", testament: "new" },
  { text: "John is also credited with writing the Book of Revelation", testament: "new" },
];

const REASON_ADVANTAGE: { term: string; evidence: string }[] = [
  { term: "Understanding", evidence: "Reading the Bible in the language you grew up speaking makes its meaning far clearer than reading it in a second or third language" },
  { term: "Wider reach", evidence: "Translating the Bible into local languages lets many more communities read God's word for themselves" },
  { term: "Family reading", evidence: "Parents and children can read and discuss the Bible together at home in the language they share" },
  { term: "Better worship", evidence: "Christians can pray and worship using words that come naturally to them in their mother tongue" },
  { term: "Effective teaching", evidence: "Bible lessons in Sunday School and CRE class are easier to grasp when taught in a familiar language" },
  { term: "Cultural relevance", evidence: "A translated Bible can use local idioms and examples that make its stories easier to relate to" },
  { term: "Preserving language", evidence: "Translating the Bible into a community's own language helps keep that language alive and valued" },
  { term: "Personal faith", evidence: "Understanding scripture clearly in one's own language helps a believer's faith grow stronger" },
  { term: "Accurate interpretation", evidence: "A direct translation into the reader's own language reduces the chance of misunderstanding the message" },
  { term: "Inclusion", evidence: "People who never learned English or Kiswahili well can still access the Bible fully in the language they know best" },
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
    prompt: `${name(rng)} in ${place(rng)} reads 2 Timothy 3:16-17, which says all Scripture is "God-breathed." What does calling Scripture "God-breathed" mean?`,
    correct: "God inspired the human writers, so what they wrote carries God's own message",
    wrong: [
      "The words fell from the sky and were never written by any person",
      "Only the New Testament counts as God-breathed, not the Old",
      "The Bible was written entirely by one single author",
    ],
    explanation: "\"God-breathed\" (inspired) means God worked through human writers so that what they recorded carries His message — it does not mean the Bible had no human authors.",
  }),
  (rng) => ({
    prompt: `In CRE class in ${place(rng)}, ${name(rng)} is asked why 2 Timothy 3:16-17 says Scripture is useful for teaching, rebuking, correcting and training in righteousness. What is this list meant to show?`,
    correct: "That Scripture equips a believer for every good work, not just one narrow purpose",
    wrong: [
      "That Scripture only matters for church leaders, not ordinary believers",
      "That each Christian should only read one of the four uses",
      "That Scripture stops being useful once a believer already knows right from wrong",
    ],
    explanation: "2 Timothy 3:17 ends this list by saying it equips \"the servant of God\" thoroughly for every good work — the purposes work together, not separately.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is told that a certain New Testament book was written by the apostle Paul. Which testament of the Bible does that book belong to?`,
    correct: "The New Testament",
    wrong: [
      "The Old Testament",
      "It belongs to neither testament, since Paul lived after both were written",
      "It belongs to both testaments equally",
    ],
    explanation: "Paul's letters (epistles) were written after the resurrection of Jesus Christ, so they belong to the New Testament.",
  }),
  (rng) => ({
    prompt: `In a Bible-authorship quiz in ${place(rng)}, ${name(rng)} must name the author traditionally credited with writing the first five books of the Bible. Who is it?`,
    correct: "Moses",
    wrong: ["David", "Paul", "Isaiah"],
    explanation: "Moses is traditionally credited with writing the first five books of the Bible, including Genesis and Exodus, during the time of the Exodus.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked which author is remembered for writing many of the Psalms, the songs of worship and prayer. Who is it?`,
    correct: "David",
    wrong: ["Moses", "Paul", "John"],
    explanation: "David is remembered as the author of many of the Psalms, written centuries before the birth of Jesus Christ.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} needs to name the author credited with writing both a Gospel and the Book of Acts. Who is ${who} looking for?`,
      correct: "Luke",
      wrong: ["John", "Paul", "Isaiah"],
      explanation: "Luke wrote an orderly account of the life of Jesus Christ in his Gospel, and also wrote the Book of Acts about the early church.",
    };
  },
  (rng) => ({
    prompt: `A church group in ${place(rng)} has elderly members who never learned Kiswahili or English well, so they struggle to follow Bible readings at church. Which reason for translating the Bible into their local language does this best illustrate?`,
    correct: "So believers can understand and access Scripture in the language they know best",
    wrong: [
      "So the original Hebrew and Greek texts can be discarded entirely",
      "So each community can rewrite the message of the Bible however it likes",
      "So only young people who study foreign languages can read the Bible",
    ],
    explanation: "One key reason for local-language translation is that believers understand Scripture far better in the language they know best, especially those who never mastered a second language.",
  }),
  (rng) => ({
    prompt: `After the Bible was translated into ${name(rng)}'s home community's language, members found they memorised verses faster and discussed them confidently at home. Which advantage of translation does this best show?`,
    correct: "Reading Scripture in one's own language deepens understanding and strengthens personal faith",
    wrong: [
      "Translation makes the Bible shorter and easier to finish quickly",
      "Translation removes the need for any teacher to explain the Bible",
      "Translation guarantees every reader will interpret the Bible identically",
    ],
    explanation: "A translated Bible in a community's own language helps people grasp its meaning more deeply, which is exactly why memorisation and confident discussion improve.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims the whole Bible was written by only one person during one lifetime. Based on what CRE teaches about Bible authorship, why is this claim wrong?`,
    correct: "Because it was written by many different inspired authors across different periods of history",
    wrong: [
      "Because it was written entirely within a single year by a committee",
      "Because there is no evidence anyone ever wrote the Bible down",
      "Because only non-believers were involved in writing any part of it",
    ],
    explanation: "Authors such as Moses, David and Isaiah (Old Testament) and Paul, Luke and John (New Testament) wrote at very different times — the Bible has many human writers, not one.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} describes Isaiah's book as a "letter written to a New Testament church." Is this an accurate description, and why?`,
    correct: "No — Isaiah's book is a book of prophecy in the Old Testament, not a New Testament letter",
    wrong: [
      "Yes — Isaiah wrote directly to the church at Corinth",
      "Yes — Isaiah's book is part of the Gospels",
      "No — Isaiah's book is actually a New Testament book of Acts-style history",
    ],
    explanation: "Isaiah is an Old Testament prophet; his book contains prophecy written long before the New Testament church existed, so it cannot be a letter to a church.",
  }),
  (rng) => ({
    prompt: `A CRE club in ${place(rng)}, led by ${name(rng)}, translates a short Bible verse into their local language so younger learners can understand it during assembly. Why is this project genuinely valuable?`,
    correct: "Because understanding Scripture in a familiar language helps the message reach and stay with the learners",
    wrong: [
      "Because it replaces the need for anyone to ever read the original Bible again",
      "Because translated verses are considered more important than the original Scripture",
      "Because it is only a language exercise with no spiritual value",
    ],
    explanation: "Just like translating the Bible into local languages nationally, translating a verse for young learners makes God's word clearer and more memorable for them.",
  }),
];

export const inspiredWordOfGod: Skill = {
  id: "g6-cre-bi-inspired-word-of-god",
  code: "BI.1",
  subjectId: "cre",
  strandId: "g6-cre-bible",
  grade: 6,
  title: "The Inspired Word of God",
  description: "Why the Bible is the inspired Word of God, its human authors, and the reasons for and advantages of translating it into local languages.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (2 Timothy 3:16-17, named authors,
    // translation reasons/advantages), so `ordering` is deliberately skipped — 4 kinds is the honest cap here.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const old = shuffle(rng, AUTHOR_FACTS.filter((f) => f.testament === "old")).slice(0, 4);
      const nu = shuffle(rng, AUTHOR_FACTS.filter((f) => f.testament === "new")).slice(0, 4);
      const chosen = shuffle(rng, [...old, ...nu]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.testament));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "old", label: "Old Testament author" },
          { id: "new", label: "New Testament author" },
        ],
        correctBucket,
        hint: "Moses, David and Isaiah wrote before Jesus was born; Paul, Luke and John wrote after His resurrection.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.testament === "old" ? "Old Testament" : "New Testament"} author.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, REASON_ADVANTAGE).slice(0, 5);
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
        hint: "Think about what each reason or advantage of Bible translation actually gives believers.",
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
        hint: "Think about what 2 Timothy 3:16-17 says, who traditionally wrote which books, and why local-language translation matters.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "2 Timothy 3:16-17 teaches that all Scripture is God-", after: ", meaning God inspired the human writers.", answer: "breathed", accepted: ["breathed", "god-breathed"] },
      { before: "According to 2 Timothy 3:16-17, Scripture equips a believer for every good", after: ".", answer: "work", accepted: ["work", "works"] },
      { before: "Moses is traditionally credited with writing the first five", after: "of the Bible.", answer: "books", accepted: ["books"] },
      { before: "David is remembered as the author of many of the", after: ", songs of worship and prayer.", answer: "Psalms", accepted: ["psalms"] },
      { before: "Paul wrote many letters, also called", after: ", to churches and individual Christians.", answer: "epistles", accepted: ["epistles", "letters"] },
      { before: "Luke wrote an orderly account of the life of Jesus in his", after: ", and also wrote the Book of Acts.", answer: "Gospel", accepted: ["gospel"] },
      { before: "John is credited with writing a Gospel and the Book of", after: ".", answer: "Revelation", accepted: ["revelation"] },
      { before: "Isaiah's book is a book of", after: "in the Old Testament.", answer: "prophecy", accepted: ["prophecy", "prophecies"] },
      { before: "Translating the Bible into local languages helps believers understand Scripture in the language they know", after: ".", answer: "best", accepted: ["best"] },
      { before: "One advantage of Bible translation is that it helps preserve a community's own", after: ".", answer: "language", accepted: ["language"] },
      { before: "Reading the Bible in one's mother tongue can help a believer's", after: "grow stronger.", answer: "faith", accepted: ["faith"] },
      { before: "2 Timothy 3:16-17 lists teaching, rebuking, correcting and training in", after: "as uses of Scripture.", answer: "righteousness", accepted: ["righteousness"] },
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
      hint: "Think about 2 Timothy 3:16-17, the traditional Bible authors, and the reasons for translating the Bible.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
