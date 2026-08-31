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
    "each fact about Peter's rescue into the bucket it belongs in.",
    "these facts from Acts 12:3-17 by whether they are about Peter's escape or the believers' prayer.",
    "each statement below by whether it describes the rescue itself or the believers' response.",
    "each fact into the bucket for Peter's escape or the praying believers.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term about Peter's rescue to its meaning.",
    "each term below with what it means in Acts 12:3-17.",
    "each idea about Peter's rescue to the explanation that fits it.",
    "each term to the explanation of why it matters in the story.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Peter's rescue.",
    "the correct missing word.",
  ],
);

const ORDER_PROMPTS = [
  "Arrange these events from Acts 12:3-17 in their correct order.",
  "Put these events from Peter's miraculous rescue into their correct order.",
  "Sequence these events from the story of Peter's rescue correctly.",
  "Arrange these parts of the Acts 12:3-17 account in order.",
  "Order these events as Acts 12:3-17 describes them.",
  "Sort these events into the order Acts 12:3-17 places them.",
];

// Acts 12:3-17's own narrative sequence, condensed to 6 steps.
const RESCUE_ORDER = [
  { id: "r1", label: "Herod arrested Peter and had him guarded by four squads of soldiers" },
  { id: "r2", label: "The church prayed earnestly to God for Peter" },
  { id: "r3", label: "An angel appeared in the cell, and the chains fell off Peter's wrists" },
  { id: "r4", label: "Peter followed the angel past the guards through the iron gate, which opened by itself" },
  { id: "r5", label: "Peter went to Mary's house, where believers were praying, and Rhoda answered the door" },
  { id: "r6", label: "Peter explained how the Lord rescued him and told them to report it to James and the brothers" },
] as const;

interface RescueFact {
  text: string;
  kind: "rescue" | "believers";
}

// Facts drawn directly from Acts 12:3-17, split into what happened to Peter in his escape and how the
// praying believers responded — the two natural halves of the narrative.
const RESCUE_FACTS: RescueFact[] = [
  { text: "Herod arrested Peter and kept him under guard by four squads of soldiers", kind: "rescue" },
  { text: "Peter slept bound with chains between two soldiers the night before his trial", kind: "rescue" },
  { text: "An angel of the Lord appeared and a light shone in the prison cell", kind: "rescue" },
  { text: "The angel struck Peter on the side and woke him, saying \"Quick, get up!\"", kind: "rescue" },
  { text: "The chains fell off Peter's wrists", kind: "rescue" },
  { text: "Peter followed the angel past the guards, and the iron gate to the city opened by itself", kind: "rescue" },
  { text: "Peter realised the Lord had truly sent His angel to rescue him from Herod's hand", kind: "rescue" },
  { text: "The church prayed earnestly to God for Peter while he was in prison", kind: "believers" },
  { text: "Many believers had gathered at Mary's house to pray", kind: "believers" },
  { text: "Rhoda recognised Peter's voice at the door but was too overjoyed to open it", kind: "believers" },
  { text: "The believers did not believe Rhoda at first, saying it must be his angel", kind: "believers" },
  { text: "When they finally opened the door and saw Peter, the believers were astonished", kind: "believers" },
];

const RESCUE_TERMS: { term: string; meaning: string }[] = [
  { term: "Acts 12:3-17", meaning: "The passage describing Apostle Peter's miraculous rescue from prison" },
  { term: "King Herod", meaning: "The ruler who arrested Peter and had him closely guarded" },
  { term: "Four squads of soldiers", meaning: "The heavy guard placed over Peter while he was in prison" },
  { term: "An angel of the Lord", meaning: "Who appeared in Peter's cell and led him safely out of prison" },
  { term: "The iron gate", meaning: "The gate leading to the city that opened by itself for Peter and the angel" },
  { term: "Mary's house", meaning: "Where many believers had gathered to pray earnestly for Peter" },
  { term: "Rhoda", meaning: "The servant girl who recognised Peter's voice at the door but forgot to open it" },
  { term: "Persistent prayer", meaning: "What the church devoted itself to the whole time Peter was imprisoned" },
  { term: "James and the brothers", meaning: "Who Peter asked the believers to report his rescue to" },
  { term: "Faith", meaning: "The trust in God's power that Peter's rescue is meant to inspire in believers today" },
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
      prompt: `${who}'s family in ${place(rng)} is facing a difficult problem, and instead of giving up hope, they keep praying about it together every evening. Which lesson from Peter's rescue in Acts 12:3-17 does this reflect?`,
      correct: "The importance of persistent prayer, since the church kept praying earnestly for Peter the whole time he was imprisoned",
      wrong: [
        "The lesson that prayer should stop once a problem seems impossible to solve",
        "The lesson that only apostles are allowed to pray for difficult situations",
        "The lesson that praying briefly once is always more effective than praying repeatedly",
      ],
      explanation: "Acts 12:5 says the church was earnestly praying to God for Peter throughout his imprisonment — the story teaches the value of persistent, ongoing prayer, not giving up.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is surprised that when Peter arrived at Mary's house, the praying believers did not believe Rhoda at first. Why is this detail included in Acts 12:3-17?`,
    correct: "It shows that even the believers who were earnestly praying were still surprised by how God actually answered — a very human, honest detail",
    wrong: [
      "It shows that the believers never truly believed prayer could be answered at all",
      "It proves that Rhoda made up the entire story and Peter never actually arrived",
      "It shows that praying together was pointless since they doubted the answer",
    ],
    explanation: "The believers' disbelief when Rhoda announced Peter's arrival is a realistic detail — even faithful, praying believers were amazed at how directly and quickly God answered their prayer.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} asks why Peter, once freed, went to Mary's house instead of somewhere else. What does this choice show about the early believers?`,
      correct: "Believers regularly gathered together for prayer and fellowship, and Peter knew where to find the praying community",
      wrong: [
        "Peter went there by accident, with no connection to the believers gathering to pray",
        "Mary's house was the only building left standing in the city at that time",
        "Peter avoided all other believers and went there purely to hide alone",
      ],
      explanation: "Acts 12:12 says Peter went to the house of Mary, the mother of John Mark, where many people had gathered and were praying — a sign of the believers' habit of gathering together for prayer.",
    };
  },
  (rng) => ({
    prompt: `A church group in ${place(rng)}, led by ${name(rng)}, is discouraged because their prayers for a sick member have not yet been answered after several weeks. What encouragement does Peter's rescue offer them?`,
    correct: "God can answer prayer in His own timing, even when circumstances look impossible, as with Peter's guarded imprisonment",
    wrong: [
      "God only answers prayers that are made for exactly one night, never longer",
      "The story teaches that unanswered prayer after a few weeks means God has stopped listening",
      "The story teaches that prayer is only effective for people who are already free",
    ],
    explanation: "Peter was heavily guarded by four squads of soldiers, yet God rescued him — a reminder that God's power is not limited by how impossible a situation looks, even if the answer takes time.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} points out that Peter was sleeping, chained between two soldiers, the night before his rescue. What does this detail suggest about Peter's state of mind?`,
      correct: "Peter had peace and trust in God even while facing likely execution the next day",
      wrong: [
        "Peter was so terrified that he could not sleep at all that night",
        "Peter had already planned his own escape before the angel arrived",
        "Peter was unaware that he was in any danger at all",
      ],
      explanation: "Acts 12:6 notes Peter was asleep the night before his expected trial, bound between two soldiers — a striking sign of calm trust in God even facing the real threat of execution.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} claims that Peter escaped from prison entirely through his own clever planning, with no help from God. Does Acts 12:3-17 support this claim?`,
    correct: "No — the passage describes an angel of the Lord appearing, striking Peter awake, and leading him out; Peter himself thought he was only seeing a vision",
    wrong: [
      "Yes — the passage says Peter planned every detail of the escape himself in advance",
      "Yes — Peter bribed the guards to let him go free",
      "No — but the passage says Herod personally released Peter out of guilt",
    ],
    explanation: "Acts 12:7-11 is explicit that an angel of the Lord appeared, the chains fell off, and the gate opened by itself — Peter even thought he was seeing a vision, not carrying out his own plan.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked what Peter did immediately after realising the Lord had truly rescued him. What was Peter's next action?`,
      correct: "He went to the house where many believers had gathered and were praying",
      wrong: [
        "He immediately went into hiding alone and told no one what happened",
        "He returned straight back to the prison to free the other prisoners",
        "He went directly to confront King Herod in person",
      ],
      explanation: "Acts 12:12 says that once Peter realised what had happened, he went to Mary's house, where many people had gathered together praying.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the detail about "four squads of soldiers" guarding Peter is unimportant to the story. Why does this detail actually matter?`,
    correct: "It shows just how heavily guarded and seemingly impossible Peter's escape was, making the rescue clearly the work of God, not human luck",
    wrong: [
      "It only matters because it tells us the exact date of Peter's arrest",
      "It shows Herod was careless and used too few guards for the situation",
      "It has no connection at all to how difficult the escape was",
    ],
    explanation: "Four squads (likely sixteen soldiers total) guarding one prisoner shows an extremely tight security — emphasising that Peter's escape could only be explained by God's power, not human effort.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} feels that their own prayers are too small to matter, since they are just one ordinary person in the church. How does the example of the believers praying for Peter respond to this feeling?`,
      correct: "The whole church prayed together earnestly, and God answered — showing that praying together, including ordinary believers, truly matters to God",
      wrong: [
        "Only apostles' prayers actually matter, so ordinary believers' prayers are pointless",
        "The story shows that group prayer never actually changes what happens",
        "The story proves that a single individual's prayer is always more effective than group prayer",
      ],
      explanation: "Acts 12:5 highlights the whole church earnestly praying for Peter together — an example that collective, ordinary prayer from the community was part of how God worked in this story.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know what happened right after the angel led Peter past the first and second guards. What did they reach next?`,
    correct: "The iron gate leading to the city, which opened for them by itself",
    wrong: [
      "A second prison cell where more believers were being held",
      "King Herod's own private chamber inside the fortress",
      "The temple courts where the apostles' teaching normally took place",
    ],
    explanation: "Acts 12:10 describes Peter and the angel passing the first and second guards and coming to the iron gate leading to the city, which opened for them by itself.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} says the story of Peter's rescue has no relevance for Christians today because it only happened once, long ago. How would this sub-strand's teaching, built around having faith like Apostle Peter, respond?`,
      correct: "The story still encourages believers today to trust God's power and keep praying persistently, even when a situation looks impossible",
      wrong: [
        "The teaching agrees the story has no modern relevance at all",
        "The story is meant only as an interesting historical record, never as an example to follow",
        "The teaching says only apostles today can benefit from this example",
      ],
      explanation: "This sub-strand's outcome — to have faith in God as exemplified by Apostle Peter — treats the story as a living example for believers today, not just a historical record.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that Peter must have imagined the whole rescue, since he initially "thought he was seeing a vision." What does Acts 12:11 say once Peter came to his senses?`,
    correct: "Peter realised it was real — that the Lord had sent His angel to rescue him from Herod's hand",
    wrong: [
      "Peter concluded it really had been only a dream and went back to sleep",
      "Peter decided not to tell anyone in case he was mistaken",
      "Peter believed Herod himself had secretly released him out of mercy",
    ],
    explanation: "Acts 12:11 says Peter came to himself and said, \"Now I know without a doubt that the Lord sent his angel and rescued me\" — confirming the rescue was real, not imagined.",
  }),
];

export const petersMiraculousRescue: Skill = {
  id: "g5-cre-ch-peters-rescue",
  code: "CH.4",
  subjectId: "cre",
  strandId: "g5-cre-church",
  grade: 5,
  title: "Peter's Miraculous Rescue",
  description: "The story of Apostle Peter's miraculous rescue from prison in Acts 12:3-17, the church's persistent prayer for him, and the lesson of having faith in God as Peter did.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank", "order"] as const);

    if (branch === "categorize") {
      const rescue = shuffle(rng, RESCUE_FACTS.filter((f) => f.kind === "rescue")).slice(0, 4);
      const believers = shuffle(rng, RESCUE_FACTS.filter((f) => f.kind === "believers")).slice(0, 4);
      const chosen = shuffle(rng, [...rescue, ...believers]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "rescue", label: "Peter's escape from prison" },
          { id: "believers", label: "The praying believers" },
        ],
        correctBucket,
        hint: "Acts 12:3-17 alternates between what happened to Peter in prison and how the praying believers at Mary's house responded.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "rescue" ? "part of Peter's escape" : "part of the praying believers' story"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, RESCUE_TERMS).slice(0, 5);
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
        hint: "Think about who or what each term refers to in Acts 12:3-17's account of Peter's rescue.",
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
        hint: "Think about how Peter was rescued, how the church prayed for him, and what this teaches about faith.",
        explanation: q.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, RESCUE_ORDER);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: RESCUE_ORDER.map((r) => r.id),
        hint: "Acts 12:3-17 moves from Peter's arrest and the church's prayer, through the angel's rescue, to Peter arriving at Mary's house.",
        explanation: RESCUE_ORDER.map((r) => r.label).join(" → "),
      };
    }

    const facts = [
      { before: "King Herod had Peter guarded by four squads of", after: ".", answer: "soldiers", accepted: ["soldiers"] },
      { before: "The church prayed earnestly to God for Peter while he was in", after: ".", answer: "prison", accepted: ["prison"] },
      { before: "An angel of the Lord appeared and a light shone in Peter's", after: ".", answer: "cell", accepted: ["cell"] },
      { before: "The angel struck Peter on the side and told him, \"Quick, get", after: "!\"", answer: "up", accepted: ["up"] },
      { before: "The chains fell off Peter's", after: ".", answer: "wrists", accepted: ["wrists"] },
      { before: "Peter and the angel passed the guards and came to the iron", after: ", which opened by itself.", answer: "gate", accepted: ["gate"] },
      { before: "Peter realised the Lord had sent His", after: "to rescue him from Herod's hand.", answer: "angel", accepted: ["angel"] },
      { before: "Peter went to the house of Mary, the mother of John", after: ", where believers were praying.", answer: "Mark", accepted: ["mark"] },
      { before: "The servant girl who recognised Peter's voice at the door was named", after: ".", answer: "Rhoda", accepted: ["rhoda"] },
      { before: "When the believers finally opened the door and saw Peter, they were", after: ".", answer: "astonished", accepted: ["astonished"] },
      { before: "Peter told the believers to report what had happened to James and the", after: ".", answer: "brothers", accepted: ["brothers"] },
      { before: "This sub-strand teaches Christians to have", after: "in God, as exemplified by Apostle Peter.", answer: "faith", accepted: ["faith"] },
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
      hint: "Think about Acts 12:3-17's account of Peter's arrest, rescue, and arrival at Mary's house.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
