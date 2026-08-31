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
    "each fact about the early Church into the bucket it belongs in.",
    "these facts from Acts 2:42-47 by what kind of activity they describe.",
    "each statement below by whether it is a worship activity or a sharing activity.",
    "each fact into the bucket for worship/teaching or sharing/caring.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term about the early Church to its meaning.",
    "each term below with what it means in Acts 2:42-47.",
    "each idea about Church unity to the explanation that fits it.",
    "each term to the explanation of why it mattered to the early Church.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the early Church.",
    "the correct missing word.",
  ],
);

const ORDER_PROMPTS = [
  "Arrange these events from Acts 2:42-47 in their correct order.",
  "Put these events about the early Church into their correct order.",
  "Sequence these events from the early Church's story correctly.",
  "Arrange these parts of the Acts 2:42-47 account in order.",
  "Order these events as Acts 2:42-47 describes them.",
  "Sort these events into the order Acts 2:42-47 places them.",
];

// Acts 2:42-47's own sequence of the early Church's shared life, condensed to 6 steps.
const EARLY_CHURCH_ORDER = [
  { id: "e1", label: "The believers devoted themselves to the apostles' teaching and to fellowship" },
  { id: "e2", label: "They devoted themselves to the breaking of bread and to prayer" },
  { id: "e3", label: "They sold their possessions and goods, giving to anyone who had need" },
  { id: "e4", label: "They met together every day in the temple courts" },
  { id: "e5", label: "They broke bread in their homes and ate together with glad and sincere hearts" },
  { id: "e6", label: "The Lord added to their number daily those who were being saved" },
] as const;

interface ChurchFact {
  text: string;
  kind: "worship" | "sharing";
}

// Facts drawn directly from Acts 2:42-47's description of the early Church's shared life, split into
// worship/teaching activities and practical sharing/caring activities — the two natural groupings the
// passage itself supports, not an invented taxonomy.
const CHURCH_FACTS: ChurchFact[] = [
  { text: "The believers devoted themselves to the apostles' teaching", kind: "worship" },
  { text: "The believers devoted themselves to fellowship with one another", kind: "worship" },
  { text: "The believers devoted themselves to the breaking of bread", kind: "worship" },
  { text: "The believers devoted themselves to prayer", kind: "worship" },
  { text: "The believers met together every day in the temple courts", kind: "worship" },
  { text: "The believers praised God with glad and sincere hearts", kind: "worship" },
  { text: "Many wonders and signs were performed by the apostles, and everyone was filled with awe", kind: "worship" },
  { text: "The believers sold their possessions and goods", kind: "sharing" },
  { text: "The believers gave to anyone who had need", kind: "sharing" },
  { text: "The believers had everything in common", kind: "sharing" },
  { text: "The believers broke bread in their homes and shared meals together", kind: "sharing" },
  { text: "The believers enjoyed the favour of all the people around them", kind: "sharing" },
];

const CHURCH_TERMS: { term: string; meaning: string }[] = [
  { term: "Acts 2:42-47", meaning: "The passage that describes the activities which promoted unity in the early Church" },
  { term: "Fellowship", meaning: "Believers sharing their lives closely together as one community" },
  { term: "Breaking of bread", meaning: "Sharing meals together, including the practice that later grew into the Lord's Supper" },
  { term: "The apostles' teaching", meaning: "The instruction from the apostles that believers devoted themselves to learning" },
  { term: "Having everything in common", meaning: "Sharing possessions so that no believer among them was left in need" },
  { term: "Church unity", meaning: "Believers living, worshipping, and sharing together in harmony as one body" },
  { term: "Social justice", meaning: "The value named for this sub-strand — making sure resources are shared fairly so no one lacks" },
  { term: "The Lord added to their number daily", meaning: "The result of the early Church's unity — more people joined the faith every day" },
  { term: "Favour of all the people", meaning: "The good reputation the early Church earned among people outside it" },
  { term: "Glad and sincere hearts", meaning: "The genuine, joyful attitude the believers had while sharing meals together" },
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
      prompt: `${who}'s Sunday school class in ${place(rng)} is planning a food drive so that no family in their church goes hungry. Which activity of the early Church in Acts 2:42-47 does this best reflect?`,
      correct: "Selling possessions and sharing with anyone who had need",
      wrong: [
        "Meeting daily in the temple courts, which has nothing to do with sharing food",
        "Devoting themselves to the apostles' teaching, which is only about listening",
        "Praising God with glad hearts, which does not involve helping anyone",
      ],
      explanation: "Acts 2:42-47 says the believers sold their possessions and goods and gave to anyone who had need — a food drive today reflects that same practical sharing.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why the early Church is described as devoting themselves to four things together: the apostles' teaching, fellowship, breaking of bread, and prayer. What does devoting themselves to all four show?`,
    correct: "A balanced Christian life includes learning, community, sharing meals, and prayer together, not just one of these alone",
    wrong: [
      "Only prayer actually mattered; the other three were unnecessary extras",
      "The four activities were meant to be done separately, never together",
      "Fellowship was the only activity that built any real unity",
    ],
    explanation: "Acts 2:42 lists all four practices together as what the believers devoted themselves to — showing unity in the early Church came from combining teaching, fellowship, shared meals, and prayer.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} notices that after the early Church shared everything and prayed together, "the Lord added to their number daily those who were being saved." What does this outcome suggest about Church unity?`,
      correct: "Genuine unity and generosity in the Church can attract others to the faith",
      wrong: [
        "New people joined only because they were forced to by the apostles",
        "Growth happened even though the believers were divided and quarrelling",
        "The growth mentioned had nothing to do with how the believers lived together",
      ],
      explanation: "Acts 2:47 links the believers' favour with all the people directly to the Lord adding to their number daily — their unity and generosity was part of why others were drawn in.",
    };
  },
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, led by ${name(rng)}, argues that Church unity today only means singing the same songs together. Based on Acts 2:42-47, is this a complete description of Church unity?`,
    correct: "No — Church unity in Acts 2:42-47 includes teaching, fellowship, sharing meals, prayer, and caring for those in need, not singing alone",
    wrong: [
      "Yes — Acts 2:42-47 focuses only on singing the same songs together",
      "Yes — the passage never mentions any activity besides music",
      "No — but the passage only lists prayer as the one true sign of unity",
    ],
    explanation: "Acts 2:42-47 names several activities that promoted unity — apostles' teaching, fellowship, breaking of bread, prayer, and sharing possessions — singing is not even mentioned in this passage.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} has plenty of food at home but ignores a classmate whose family is struggling, saying "that's not my problem." How does the early Church's example in Acts 2:42-47 challenge this attitude?`,
      correct: "The early Church shared what they had so that no believer among them was in need, showing that caring for others is part of Christian unity",
      wrong: [
        "The early Church only shared with people who could repay them later",
        "The early Church kept all their possessions private and never gave anything away",
        "Acts 2:42-47 teaches that helping others is optional and not connected to unity",
      ],
      explanation: "Acts 2:44-45 says the believers had everything in common and sold possessions to give to anyone who had need — a direct challenge to ignoring a classmate's need.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says the early Church met "in the temple courts" and also "in their homes." Why might both settings matter for building unity?`,
    correct: "Meeting publicly in the temple courts and privately in homes let the believers combine wider worship with close, personal fellowship",
    wrong: [
      "Meeting in two different places actually shows the Church was divided",
      "Only the temple courts mattered; meeting in homes was unimportant to unity",
      "Meeting in homes replaced the need for any public worship at all",
    ],
    explanation: "Acts 2:46 describes both settings — the temple courts for larger gathering and homes for breaking bread together — as part of the same unified community life, not a division.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wants to know which value from this lesson would most help a church avoid unfair treatment of poorer members. Which value fits best?`,
      correct: "Social justice — making sure resources are shared fairly so no one is left in need",
      wrong: [
        "Curiosity — curiosity is about asking questions, not about fair sharing",
        "Competition — competition would encourage members to outdo each other, not share fairly",
        "Silence — staying silent does nothing to correct unfair treatment",
      ],
      explanation: "This sub-strand's named value, social justice, is exactly what the early Church practised by selling possessions and giving to anyone who had need, so no believer was left out.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} claims that "everything in common" in Acts 2:44 means the early believers had no personal belongings at all, ever again. Is this the best reading of the verse?`,
    correct: "Not necessarily — the verse emphasises generous, willing sharing so that no one had unmet need, not a strict rule erasing all personal property",
    wrong: [
      "Yes — the verse is a strict law banning any personal ownership forever",
      "Yes — every believer was required to give away literally everything they owned by force",
      "No — the verse says nothing at all about sharing possessions",
    ],
    explanation: "Acts 2:44-45 describes voluntary, generous sharing that met real needs — the emphasis is on care for one another, not a legal ban on all personal property.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that a church cannot be unified unless every member has exactly the same opinion about everything. Does Acts 2:42-47 support this idea of unity?`,
      correct: "No — the passage describes unity through shared devotion to teaching, fellowship, prayer, and caring for each other, not through everyone agreeing on every detail",
      wrong: [
        "Yes — the passage explicitly states that all believers must think identically",
        "Yes — Acts 2:42-47 lists identical opinions as the very first sign of unity",
        "No — but the passage says unity is impossible for any real church to achieve",
      ],
      explanation: "Acts 2:42-47 describes unity through shared practices — devotion, fellowship, prayer, and generosity — rather than through everyone holding identical personal opinions.",
    };
  },
  (rng) => ({
    prompt: `In ${place(rng)}, ${name(rng)}'s church starts a small group where members eat together, pray, and study the Bible weekly. Which early-Church activities does this modern small group most closely reflect?`,
    correct: "The apostles' teaching, fellowship, breaking of bread, and prayer, all devoted to together as in Acts 2:42",
    wrong: [
      "Only the selling of possessions, since eating together always means selling property",
      "None of the early Church's activities, since small groups did not exist in Acts",
      "Only public worship in the temple courts, since small groups only ever meet privately",
    ],
    explanation: "A small group combining eating, prayer, and Bible study mirrors exactly the four practices Acts 2:42 names together: teaching, fellowship, breaking of bread, and prayer.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} says the early Church's growth ("the Lord added to their number daily") happened by accident, unrelated to how the believers lived. Based on Acts 2:42-47, how should ${who} be corrected?`,
      correct: "The growth followed directly from the believers' unity, generosity, and genuine devotion, which earned the favour of the wider community",
      wrong: [
        "The growth was completely random and had no connection to the believers' way of life",
        "The growth only happened because the apostles forced people to join",
        "The passage does not mention any growth in the early Church at all",
      ],
      explanation: "Acts 2:47 places the daily growth right after describing the believers' favour with all the people — their unified, generous way of life is presented as connected to that growth.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that Church unity today is impossible because the early Church only existed for a short time long ago. How does this sub-strand's key inquiry question — "Why is Church unity important?" — respond to this view?`,
    correct: "Church unity remains important today for the same reasons Acts 2:42-47 shows it mattered then — shared worship, fellowship, and caring for one another still build a healthy community",
    wrong: [
      "Church unity was only ever relevant to the very first believers and has no modern value",
      "The question assumes unity is unimportant and should be ignored today",
      "Church unity is only about historical facts and has no practical lesson for today",
    ],
    explanation: "The lesson's key inquiry question treats Church unity as a present, ongoing concern — the same values shown in Acts 2:42-47 (teaching, fellowship, sharing, prayer) are meant to guide the Church today, not only in the first century.",
  }),
];

export const theEarlyChurch: Skill = {
  id: "g5-cre-ch-early-church",
  code: "CH.1",
  subjectId: "cre",
  strandId: "g5-cre-church",
  grade: 5,
  title: "The Early Church",
  description: "The activities that promoted unity in the early Church according to Acts 2:42-47 — apostles' teaching, fellowship, breaking of bread, prayer, and generous sharing — and the values Christians need to promote Church unity today.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank", "order"] as const);

    if (branch === "categorize") {
      const worship = shuffle(rng, CHURCH_FACTS.filter((f) => f.kind === "worship")).slice(0, 4);
      const sharing = shuffle(rng, CHURCH_FACTS.filter((f) => f.kind === "sharing")).slice(0, 4);
      const chosen = shuffle(rng, [...worship, ...sharing]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "worship", label: "Worship / teaching activity" },
          { id: "sharing", label: "Sharing / caring activity" },
        ],
        correctBucket,
        hint: "Acts 2:42-47 describes both worship practices (teaching, prayer, breaking bread together) and practical sharing (selling goods, giving to those in need).",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "worship" ? "a worship/teaching activity" : "a sharing/caring activity"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, CHURCH_TERMS).slice(0, 5);
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
        hint: "Think about what each term describes in Acts 2:42-47's account of the early Church's shared life.",
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
        hint: "Think about the activities Acts 2:42-47 lists and the values, like social justice, that promote Church unity.",
        explanation: q.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, EARLY_CHURCH_ORDER);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: EARLY_CHURCH_ORDER.map((e) => e.id),
        hint: "Acts 2:42-47 moves from the believers' devotion to teaching and fellowship, through sharing possessions, to the Church's daily growth.",
        explanation: EARLY_CHURCH_ORDER.map((e) => e.label).join(" → "),
      };
    }

    const facts = [
      { before: "The believers devoted themselves to the apostles' teaching and to", after: ".", answer: "fellowship", accepted: ["fellowship"] },
      { before: "The believers devoted themselves to the breaking of bread and to", after: ".", answer: "prayer", accepted: ["prayer"] },
      { before: "The believers sold their possessions and goods, giving to anyone who had", after: ".", answer: "need", accepted: ["need"] },
      { before: "The believers had everything in", after: ".", answer: "common", accepted: ["common"] },
      { before: "The believers met together every day in the temple", after: ".", answer: "courts", accepted: ["courts", "court"] },
      { before: "The believers broke bread in their homes and ate together with glad and sincere", after: ".", answer: "hearts", accepted: ["hearts"] },
      { before: "The believers praised God and enjoyed the favour of all the", after: ".", answer: "people", accepted: ["people"] },
      { before: "The Lord added to their number daily those who were being", after: ".", answer: "saved", accepted: ["saved"] },
      { before: "Acts 2:42-47 describes the activities which promoted unity in the early", after: ".", answer: "Church", accepted: ["church"] },
      { before: "The value named for this sub-strand, needed to promote Church unity, is social", after: ".", answer: "justice", accepted: ["justice"] },
      { before: "Everyone was filled with awe as many wonders and signs were performed by the", after: ".", answer: "apostles", accepted: ["apostles"] },
      { before: "The key inquiry question for this lesson asks why Church", after: "is important.", answer: "unity", accepted: ["unity"] },
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
      hint: "Think about Acts 2:42-47's account of the early Church and the values that promote unity today.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
