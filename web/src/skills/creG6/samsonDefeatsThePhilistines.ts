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
    "the events of Samson defeating the Philistines in the order Judges 15:14-17 describes them.",
    "these events from Samson's story in their correct order.",
    "the events of this story from beginning to end.",
    "these events into the order they happened in Judges 15:14-17.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement into the bucket for the Samson story or an everyday example of depending on God.",
    "these statements under the correct heading.",
    "each statement below by whether it is from Judges 15:14-17 or a modern example of trusting God.",
    "each statement into the bucket for the Bible story or a today example.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each idea below to the evidence for it in Samson's story.",
    "each lesson from Samson's story to what the story shows about it.",
    "each idea about depending on God to the evidence that supports it.",
    "each term to the explanation of why it matters in this story.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Samson.",
    "the correct missing word.",
  ],
);

// The explicit sequence of events in Judges 15:14-17 — curriculum-endorsed sequential content, not an
// invented order.
const SAMSON_EVENTS = [
  { id: "e1", label: "The Philistines come shouting to meet Samson at Lehi, where he is bound with two new ropes" },
  { id: "e2", label: "As the Philistines approach, the Spirit of the Lord comes powerfully upon Samson" },
  { id: "e3", label: "The ropes on Samson's arms become like burnt flax, and they simply drop from his hands" },
  { id: "e4", label: "Samson finds a fresh jawbone of a donkey lying nearby and reaches out to grab it" },
  { id: "e5", label: "Using only the jawbone, Samson strikes down a thousand Philistine men" },
  { id: "e6", label: "Samson names the place Ramath Lehi to remember how God gave him victory" },
];

// Story events (Judges 15:14-17) vs. modern examples of Christians depending on God in everyday
// challenges — grounded in the outcome "outline ways Christians depend on God to overcome challenges,"
// not invented content.
const SAMSON_FACTS: { text: string; group: "story" | "today" }[] = [
  { text: "Samson was bound with two new ropes as the Philistines shouted and rushed toward him", group: "story" },
  { text: "The Spirit of the Lord came powerfully upon Samson right as the Philistines approached", group: "story" },
  { text: "The ropes binding Samson became like burnt flax and dropped off his hands", group: "story" },
  { text: "Samson found and grabbed a fresh jawbone of a donkey lying nearby", group: "story" },
  { text: "Samson defeated a thousand Philistine men using only the donkey's jawbone", group: "story" },
  { text: "Samson named the place Ramath Lehi to remember God's help in the victory", group: "story" },
  { text: "A learner facing a difficult exam prays for calm and strength instead of panicking alone", group: "today" },
  { text: "A learner being bullied asks God and a trusted adult for the courage to stand firm", group: "today" },
  { text: "A young person resisting pressure to do wrong prays for the strength to say no", group: "today" },
  { text: "Someone facing fear before a competition trusts God for confidence rather than relying only on self", group: "today" },
  { text: "A person going through a hard family situation depends on God's help instead of despairing alone", group: "today" },
  { text: "A learner trying to overcome a bad habit prays for God's strength to change", group: "today" },
];

const LESSON_EVIDENCE: { term: string; evidence: string }[] = [
  { term: "Divine power", evidence: "Samson's strength to break the ropes and defeat the Philistines came from the Spirit of the Lord, not his own body alone" },
  { term: "Timing", evidence: "God's power came upon Samson at the exact moment he needed it, just as the Philistines approached" },
  { term: "Unlikely tools", evidence: "God used a simple donkey's jawbone, not a sword or weapon, to bring about the victory" },
  { term: "Deliverance", evidence: "Samson was rescued from being handed over to his enemies through God's power working in him" },
  { term: "Dependence on God", evidence: "The story teaches Christians to rely on God's power to overcome their own challenges" },
  { term: "Courage", evidence: "Facing a thousand armed men required courage that came from trusting in God's power at work" },
  { term: "Remembrance", evidence: "Samson named the place Ramath Lehi so the victory and God's help would not be forgotten" },
  { term: "Humility", evidence: "The victory reminds believers that success comes from God's power, not from human boasting" },
  { term: "Confidence in God", evidence: "Knowing the Spirit of the Lord was at work gave Samson confidence to face his enemies" },
  { term: "Everyday faith", evidence: "Just as Samson depended on God in a dramatic moment, Christians can depend on God in ordinary daily challenges" },
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
    prompt: `${name(rng)} in ${place(rng)} reads Judges 15:14-17 and notices that Samson's ropes became like burnt flax right as the Philistines approached. Where did Samson's sudden strength actually come from?`,
    correct: "The Spirit of the Lord came powerfully upon him — it was God's power, not just his own natural strength",
    wrong: [
      "Samson had secretly been training his muscles for years before this moment",
      "The ropes were weak and would have broken on their own regardless of Samson",
      "The Philistines deliberately used ropes that could not hold anyone",
    ],
    explanation: "Judges 15:14 explicitly says the Spirit of the Lord came powerfully upon Samson — the story credits God's power, not Samson's own physical strength alone, for the ropes breaking.",
  }),
  (rng) => ({
    prompt: `In CRE class in ${place(rng)}, ${name(rng)} is asked what Samson used to defeat a thousand Philistine men in Judges 15:15-17. What was it?`,
    correct: "A fresh jawbone of a donkey that he found and grabbed",
    wrong: [
      "A sword he had been carrying since birth",
      "A spear given to him by a Philistine soldier",
      "A rock he found near the road to Lehi",
    ],
    explanation: "Judges 15:15 says Samson found a fresh jawbone of a donkey and used it to strike down the thousand men — an ordinary object, not a weapon of war.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} points out that God chose to use a donkey's jawbone rather than a sword to bring Samson's victory. What does this detail teach about how God works?`,
      correct: "God can use simple, ordinary things to accomplish great victories — power comes from Him, not from having the 'right' tools",
      wrong: [
        "God only ever works through expensive or impressive weapons",
        "The jawbone detail shows the story cannot be historically accurate",
        "It shows Samson had no real need for God's help at all",
      ],
      explanation: "Using a simple jawbone instead of a weapon of war reinforces that the victory came from God's power at work in Samson, not from having advanced equipment.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is nervous before a big exam in ${place(rng)} and remembers the lesson on Samson depending on God. What is the best way ${who} can apply this lesson today?`,
      correct: "Pray for calm and strength from God while still preparing well, trusting God to help in the moment of need",
      wrong: [
        "Refuse to study at all, since God will handle everything without any effort",
        "Believe that only dramatic, physical battles count as depending on God",
        "Assume prayer has nothing to do with facing everyday challenges like exams",
      ],
      explanation: "The lesson teaches that just as Samson depended on God's power in a dramatic moment, Christians can depend on God's help in ordinary daily challenges like exams, not only in crises.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is being pressured by classmates to cheat during a test. Based on the lesson from Samson's story, what value should guide ${who}'s response?`,
      correct: "Depending on God for the courage and strength to resist doing wrong, just as Samson depended on God for strength in his own moment of danger",
      wrong: [
        "Giving in to the pressure since resisting alone is too hard without any help",
        "Believing this lesson only applies to physical fights, not moral pressure",
        "Assuming God only helps people who are already very strong on their own",
      ],
      explanation: "The lesson's core application is that Christians depend on God's power to overcome their own challenges — including everyday pressures like being pushed to cheat, not just physical danger.",
    };
  },
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, led by ${name(rng)}, debates why Samson's story is still taught today when it describes an ancient battle. What is the best reason?`,
    correct: "The story's real lesson — depending on God's power to overcome challenges — still applies to everyday struggles people face now",
    wrong: [
      "The story is taught only so learners can memorise ancient Philistine history",
      "The story has no lesson for today and is included only as entertainment",
      "The story teaches that physical strength alone always wins every battle",
    ],
    explanation: "Judges 15:14-17's lasting lesson for CRE is dependence on God's power, which applies just as much to a learner's exams, fears, or temptations today as it did to Samson's battle.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims that Samson defeated the thousand Philistine men entirely through his own natural muscle power, with no help from God at all. Based on Judges 15:14-17, is this claim accurate?`,
    correct: "No — the passage specifically says the Spirit of the Lord came powerfully upon Samson before he broke free and won the battle",
    wrong: [
      "Yes — the passage never mentions God's Spirit being involved at all",
      "Yes — Samson's own training alone is credited for the victory",
      "No — but the passage credits the Philistines' own weakness, not God",
    ],
    explanation: "Judges 15:14 credits the Spirit of the Lord coming powerfully upon Samson for his sudden strength, not Samson's natural ability working alone.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} names the place where a personal difficulty was overcome with God's help, similar to how Samson named the place Ramath Lehi. Why might someone do this?`,
    correct: "To remember and honour how God helped them get through a difficult moment",
    wrong: [
      "To make sure no one else ever hears about what happened",
      "Naming a place has no connection to remembering God's help",
      "To claim the victory came entirely from personal effort, not God",
    ],
    explanation: "Samson naming the place Ramath Lehi was a way of remembering and honouring God's role in the victory — a pattern believers can apply by remembering how God has helped them too.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says the lesson from Samson's story only applies to people facing a life-or-death physical danger, not ordinary daily struggles. Is this the correct understanding of the lesson's application?`,
    correct: "No — the lesson teaches that Christians can depend on God for everyday challenges too, such as exams, bullying, or temptation, not only dramatic crises",
    wrong: [
      "Yes — depending on God only makes sense during a physical battle",
      "Yes — ordinary daily struggles are too small to bring to God",
      "No — but the lesson only applies to adults, never to young learners",
    ],
    explanation: "The outcome for this lesson is to 'depend on God in day-to-day life,' meaning the lesson from Samson's dramatic rescue is meant to be applied to ordinary, everyday challenges too.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked which event happened immediately before the Spirit of the Lord came upon Samson in Judges 15:14-17. What was it?`,
    correct: "The Philistines came shouting to meet him at Lehi, where he had been bound with two new ropes",
    wrong: [
      "Samson had already defeated the thousand men before this happened",
      "Samson had already named the place Ramath Lehi",
      "Samson was already holding the donkey's jawbone before this happened",
    ],
    explanation: "Judges 15:14 places the Philistines' approach and Samson being bound with ropes just before the Spirit of the Lord comes powerfully upon him.",
  }),
];

export const samsonDefeatsThePhilistines: Skill = {
  id: "g6-cre-bi-samson",
  code: "BI.3",
  subjectId: "cre",
  strandId: "g6-cre-bible",
  grade: 6,
  title: "Samson Defeats the Philistines",
  description: "The events of Judges 15:14-17, where the Spirit of the Lord empowers Samson to defeat a thousand Philistines, and how Christians today depend on God to overcome their own challenges.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, SAMSON_EVENTS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the first event to the last.",
        items,
        correctOrder: SAMSON_EVENTS.map((e) => e.id),
        hint: "Samson is bound first, then the Spirit of the Lord comes upon him, then the ropes break, then he finds the jawbone and wins.",
        explanation: SAMSON_EVENTS.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const story = shuffle(rng, SAMSON_FACTS.filter((f) => f.group === "story")).slice(0, 4);
      const today = shuffle(rng, SAMSON_FACTS.filter((f) => f.group === "today")).slice(0, 4);
      const chosen = shuffle(rng, [...story, ...today]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "story", label: "Event from Samson's story" },
          { id: "today", label: "Example of depending on God today" },
        ],
        correctBucket,
        hint: "Story facts describe what happened at Lehi in Judges 15; today facts describe modern situations like exams, bullying, or temptation.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "story" ? "from Samson's story" : "an example of depending on God today"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, LESSON_EVIDENCE).slice(0, 5);
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
        hint: "Think about what each part of Samson's story actually shows or teaches.",
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
        hint: "Think about the specific events of Judges 15:14-17 and how the lesson applies to everyday life.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "In Judges 15:14, the Spirit of the", after: "came powerfully upon Samson.", answer: "Lord", accepted: ["lord"] },
      { before: "The Philistines met Samson shouting at a place called", after: ".", answer: "Lehi", accepted: ["lehi"] },
      { before: "The ropes binding Samson became like burnt", after: "and dropped from his hands.", answer: "flax", accepted: ["flax"] },
      { before: "Samson used a fresh jawbone of a", after: "to defeat the Philistines.", answer: "donkey", accepted: ["donkey"] },
      { before: "Samson struck down a", after: "Philistine men using the jawbone.", answer: "thousand", accepted: ["thousand", "1000"] },
      { before: "After the victory, Samson named the place Ramath", after: "to remember God's help.", answer: "Lehi", accepted: ["lehi"] },
      { before: "Samson's strength to break the ropes came from the Spirit of the Lord, not just his own natural", after: ".", answer: "strength", accepted: ["strength"] },
      { before: "The lesson from this story is that Christians should", after: "on God to overcome their own challenges.", answer: "depend", accepted: ["depend"] },
      { before: "The key inquiry question for this lesson asks why you should", after: "on God.", answer: "depend", accepted: ["depend"] },
      { before: "Depending on God can help with everyday challenges such as exams, bullying, or", after: ".", answer: "temptation", accepted: ["temptation"] },
      { before: "Before the Spirit of the Lord came upon him, Samson had been bound with two new", after: ".", answer: "ropes", accepted: ["ropes"] },
      { before: "Naming the battle site was Samson's way of remembering how God gave him the", after: ".", answer: "victory", accepted: ["victory"] },
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
      hint: "Think about the events of Judges 15:14-17 and how they connect to depending on God today.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
