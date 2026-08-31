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
    "the events of the hand writing on the wall in the correct order.",
    "these events from Daniel 5:1-13, 25-28 into the order they happened.",
    "these moments from King Belshazzar's feast in order.",
    "these events the way they happened in the palace.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about Belshazzar's pride or about Daniel's humility.",
    "these facts about the story under the correct bucket.",
    "each fact below by which part of the story it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the writing on the wall with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Daniel and the writing on the wall.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "King Belshazzar holds a great feast for a thousand of his nobles" },
  { id: "n2", label: "He orders the gold and silver goblets taken from the temple in Jerusalem to be brought" },
  { id: "n3", label: "The king and his guests drink from the sacred goblets and praise gods of gold, silver, bronze, iron, wood and stone" },
  { id: "n4", label: "Suddenly, the fingers of a human hand appear and write on the wall of the palace" },
  { id: "n5", label: "The king watches, terrified, and calls for his enchanters and astrologers, but none can read the writing" },
  { id: "n6", label: "The queen mother reminds the king of Daniel, who once interpreted dreams for King Nebuchadnezzar" },
  { id: "n7", label: "Daniel is brought in and, though offered rich rewards, agrees only to read and interpret the writing" },
  { id: "n8", label: "Daniel tells the king he has not humbled himself, even knowing how God had humbled his father Nebuchadnezzar" },
  { id: "n9", label: "Daniel reads and interprets the words: God has numbered the king's days, weighed him and found him wanting, and divided his kingdom" },
  { id: "n10", label: "That same night, the kingdom passes from Belshazzar as the writing had declared" },
];

interface EventFact { text: string; group: "pride" | "humility" }
const EVENT_FACTS: EventFact[] = [
  { text: "Belshazzar ordered the sacred temple goblets to be used for ordinary feasting and drinking", group: "pride" },
  { text: "Belshazzar and his guests praised gods of gold, silver, bronze, iron, wood and stone", group: "pride" },
  { text: "Belshazzar had not humbled himself even though he knew what happened to his father Nebuchadnezzar", group: "pride" },
  { text: "Belshazzar's misuse of the sacred vessels showed disrespect for God", group: "pride" },
  { text: "Daniel refused the king's offer of rich gifts before agreeing to interpret the writing", group: "humility" },
  { text: "Daniel spoke honestly and boldly to the king, even though the truth was not flattering", group: "humility" },
  { text: "Daniel gave credit to God, not to himself, for the ability to interpret the writing", group: "humility" },
  { text: "Daniel remained faithful to God even while serving in a foreign king's palace", group: "humility" },
  { text: "Daniel's honesty and humility contrasted sharply with the king's pride", group: "humility" },
  { text: "The writing on the wall declared that God had numbered the king's days", group: "pride" },
  { text: "The writing declared the king had been weighed and found wanting", group: "pride" },
  { text: "The writing declared the kingdom would be divided because of the king's pride", group: "pride" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Daniel 5:1-13, 25-28", meaning: "The Bible passage recording King Belshazzar's feast and the writing on the wall" },
  { term: "Sacred vessels", meaning: "The gold and silver goblets taken from the temple in Jerusalem that Belshazzar misused" },
  { term: "Humility", meaning: "The quality Daniel showed by refusing rich rewards and giving credit to God" },
  { term: "Pride", meaning: "The attitude the writing on the wall condemned in King Belshazzar" },
  { term: "\"Weighed and found wanting\"", meaning: "Part of the writing's meaning, showing the king had failed to live up to what God required" },
  { term: "Queen mother", meaning: "Who reminded the king that Daniel had once interpreted dreams for Nebuchadnezzar" },
  { term: "Enchanters and astrologers", meaning: "The king's advisers who could not read or interpret the mysterious writing" },
  { term: "Excellence", meaning: "The quality of doing whatever one does well, honestly and faithfully, as Daniel modeled" },
  { term: "Nebuchadnezzar", meaning: "Belshazzar's father, whom God had earlier humbled for his own pride" },
  { term: "The fingers of a hand", meaning: "What suddenly appeared and wrote mysterious words on the palace wall" },
  { term: "Faithfulness to God", meaning: "What Daniel's example of humility and honesty encourages learners to practise" },
  { term: "The kingdom divided", meaning: "What the writing declared would happen to Belshazzar's rule because of his pride" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Mwangi", "Achola", "Kiplagat", "Nasimiyu", "Odera", "Wangeci", "Bosire", "Chepngeno", "Mutinda", "Njoki", "Kiptum", "Adhiambo"] as const;
const KENYAN_PLACES = ["Nanyuki", "Bondo", "Kapsabet", "Wundanyi", "Sotik", "Chuka", "Migori", "Loitokitok", "Kilgoris", "Mwingi", "Rongo", "Ol Kalou"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wins a class prize and is tempted to boast that it was entirely their own doing, forgetting to thank anyone who helped. How does Daniel's example correct this attitude?`,
    correct: "Daniel gave credit to God for his ability, showing humility instead of taking all the praise for himself",
    wrong: [
      "Daniel encouraged people to boast loudly about their own achievements",
      "Daniel's story has no connection to how someone handles success",
      "Daniel refused to acknowledge God at all when speaking to the king",
    ],
    explanation: "Daniel's humble response to King Belshazzar, giving credit to God rather than seeking praise for himself, models how to handle success or ability with humility.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is offered money to lie about a classmate's mistake to a teacher. What does Daniel's refusal of the king's rich gifts teach ${who} about handling such an offer?`,
      correct: "Refuse the offer and speak the truth honestly, as Daniel refused rewards and told the king the truth regardless of the consequences",
      wrong: [
        "Accept the money first, then decide whether to lie later",
        "Daniel's story only concerns kings, not situations with classmates",
        "Lying is acceptable as long as a reward is offered",
      ],
      explanation: "Daniel refused Belshazzar's rich rewards and spoke the truth honestly, even though it was not flattering — a model for resisting bribery to tell a lie.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads that Belshazzar used the sacred temple goblets for an ordinary drinking feast. What does this action reveal about the king's attitude toward God?`,
    correct: "It shows deep disrespect and pride, treating something sacred as ordinary and unimportant",
    wrong: [
      "It shows the king was simply being resourceful with available items",
      "It shows the king deeply respected and honoured God",
      "It has no connection to the king's attitude toward God at all",
    ],
    explanation: "Using sacred temple vessels for an ordinary feast, and praising false gods with them, showed Belshazzar's pride and disrespect toward God.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices that Belshazzar knew what had happened to his father Nebuchadnezzar, but still refused to humble himself. What lesson does this teach about learning from others' mistakes?`,
      correct: "Knowing about someone else's mistake is not enough — a person must actually choose to apply the lesson to avoid repeating it",
      wrong: [
        "Knowing about a mistake automatically prevents anyone from repeating it",
        "Belshazzar had never heard what happened to his father",
        "This detail has no lesson to teach about learning from others",
      ],
      explanation: "Daniel pointed out that Belshazzar knew about his father's humbling but still did not humble himself — showing that knowledge alone does not guarantee wisdom.",
    };
  },
  (rng) => ({
    prompt: `A church committee in ${place(rng)}, led by ${name(rng)}, is asked to care for special vessels and items used in worship. What value from this lesson should guide how they are handled?`,
    correct: "Treat sacred items with care and respect, unlike Belshazzar's careless and disrespectful use of the temple goblets",
    wrong: [
      "Use the items for any ordinary purpose, since their sacredness does not matter",
      "This lesson gives no guidance about how to treat items used in worship",
      "Only priests, never a lay committee, are allowed to think about this value",
    ],
    explanation: "Belshazzar's careless misuse of the sacred goblets is a warning example for treating anything set apart for worship with proper respect and care.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} debates with a friend about whether humility means never accepting any recognition at all. How does Daniel's story help clarify what humility really means?`,
      correct: "Humility means giving credit to God and staying honest, not seeking selfish reward — not necessarily refusing to be involved at all",
      wrong: [
        "Humility means refusing to help with anything, ever",
        "Daniel showed no humility at all in this story",
        "Humility means always disagreeing with people in authority",
      ],
      explanation: "Daniel did agree to interpret the writing and speak honestly — his humility was shown in refusing selfish reward and giving credit to God, not in refusing to act.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} believes the writing on the wall was simply a random, unexplainable event with no real meaning. What does the story of Daniel 5 show instead?`,
    correct: "The writing carried a specific, God-given message about the consequences of the king's pride, which Daniel was able to interpret clearly",
    wrong: [
      "The writing was random and Daniel simply invented a meaning for it",
      "The writing had no connection to Belshazzar's actions at the feast",
      "Only the king, and not Daniel, could understand the message's true meaning",
    ],
    explanation: "Daniel 5:25-28 shows Daniel accurately interpreting the writing as a specific message from God about the consequences of Belshazzar's pride and disrespect.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know why the king's face turned pale and he was terrified when the hand appeared. What does his reaction suggest?`,
    correct: "He recognised, on some level, that the message was serious and connected to his own wrongdoing",
    wrong: [
      "He was simply startled by an unfamiliar sight with no deeper meaning",
      "He was afraid only because the hand was physically threatening him",
      "His fear had nothing to do with his own actions at the feast",
    ],
    explanation: "The king's terror hints at an awareness that something serious and connected to his own pride and disrespect was unfolding before him.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to do a difficult task well, even though no one is watching or offering a reward. Which quality from Daniel's story applies here?`,
      correct: "Excellence — doing whatever one does with care and honesty, whether or not any reward is offered",
      wrong: [
        "Excellence has no connection to this story at all",
        "Only doing tasks for rewards counts as excellence",
        "Excellence means only doing the minimum required to get by",
      ],
      explanation: "Daniel's story is remembered for the excellence and integrity he showed in interpreting the writing honestly, without being motivated by the king's offered rewards.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says that since Belshazzar's kingdom was taken away that same night, the lesson only matters for kings and rulers. Is this the full lesson of the story?`,
    correct: "No — the deeper lesson about humility, respect for what is sacred, and honesty applies to anyone, not only rulers",
    wrong: [
      "Yes — the story has no lesson for ordinary people at all",
      "Yes — only people with great power need to learn humility",
      "No — but the lesson only applies to people living in ancient times",
    ],
    explanation: "While the setting involves a king, the underlying lessons about pride, humility and respect for what is sacred are meant for every learner, not only rulers.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is offered a leadership role and immediately starts imagining how much power and praise it will bring. What warning from Daniel's story is relevant here?`,
      correct: "Pride in power and position, like Belshazzar's, can lead to serious consequences — humility should guide how a leader uses their position",
      wrong: [
        "Leaders should always seek as much praise and power as possible",
        "Daniel's story discourages anyone from ever accepting leadership",
        "This warning applies only to kings ruling entire nations",
      ],
      explanation: "Belshazzar's downfall came from pride connected to his position and power — a warning relevant to anyone stepping into leadership or influence.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} asks why Daniel specifically mentioned Nebuchadnezzar's earlier humbling when speaking to Belshazzar. What point was Daniel making?`,
    correct: "That Belshazzar had a clear example and warning available to him, yet chose pride over humility anyway",
    wrong: [
      "Daniel was simply telling an unrelated story to pass the time",
      "Daniel was praising Belshazzar for being wiser than his father",
      "The mention of Nebuchadnezzar had no connection to Belshazzar's own choices",
    ],
    explanation: "Daniel pointed out that Belshazzar knew about his father's humbling but still refused to humble himself — making his pride even less excusable.",
  }),
];

export const aHandWritesOnTheWall: Skill = {
  id: "g5-cre-bi-hand-writes-on-wall",
  code: "BI.5",
  subjectId: "cre",
  strandId: "g5-cre-bible",
  grade: 5,
  title: "A Hand Writes on the Wall",
  description: "The story of King Belshazzar's feast, the mysterious hand that wrote on the palace wall, and Daniel's humble and excellent interpretation of the message (Daniel 5:1-13, 25-28), teaching humility and faithfulness to God.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, NARRATIVE_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: NARRATIVE_SEQUENCE.map((n) => n.id),
        hint: "Start with Belshazzar's feast, and end with the kingdom passing from him that same night.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const pride = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "pride")).slice(0, 4);
      const humility = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "humility")).slice(0, 4);
      const chosen = shuffle(rng, [...pride, ...humility]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "pride", label: "Belshazzar's pride" },
          { id: "humility", label: "Daniel's humility" },
        ],
        correctBucket,
        hint: "The pride bucket is about the king's disrespect; the humility bucket is about Daniel's honest, humble character.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "pride" ? "Belshazzar's pride" : "Daniel's humility"}.`).join(" "),
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
        hint: "Think about what Belshazzar did with the sacred vessels, and how Daniel responded to the king.",
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
        hint: "Think about Belshazzar's pride and Daniel's humble, honest response.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "King Belshazzar held a great feast for a thousand of his", after: ".", answer: "nobles", accepted: ["nobles"] },
      { before: "Belshazzar ordered the sacred goblets from the", after: "in Jerusalem to be brought.", answer: "temple", accepted: ["temple"] },
      { before: "Fingers of a human hand appeared and wrote on the", after: ".", answer: "wall", accepted: ["wall"] },
      { before: "None of the king's enchanters or astrologers could", after: "the writing.", answer: "read", accepted: ["read", "interpret"] },
      { before: "The queen mother reminded the king of", after: ", who had once interpreted dreams.", answer: "Daniel", accepted: ["daniel"] },
      { before: "Daniel refused the king's rich gifts before agreeing to", after: "the writing.", answer: "interpret", accepted: ["interpret"] },
      { before: "Daniel said the king had not", after: "himself, even knowing his father's story.", answer: "humbled", accepted: ["humbled"] },
      { before: "The writing declared the king had been weighed and found", after: ".", answer: "wanting", accepted: ["wanting"] },
      { before: "The writing declared the kingdom would be", after: ".", answer: "divided", accepted: ["divided"] },
      { before: "This story teaches learners the value of", after: ".", answer: "humility", accepted: ["humility"] },
      { before: "Belshazzar's father, who was earlier humbled by God, was", after: ".", answer: "Nebuchadnezzar", accepted: ["nebuchadnezzar"] },
      { before: "The story of the hand on the wall is found in Daniel", after: ".", answer: "5", accepted: ["5", "five"] },
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
      hint: "Think about Daniel 5:1-13, 25-28 and the contrast between Belshazzar's pride and Daniel's humility.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
