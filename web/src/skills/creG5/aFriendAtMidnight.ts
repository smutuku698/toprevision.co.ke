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
    "the events of the parable of a friend at midnight in the correct order.",
    "these events from Luke 11:5-10 into the order they happened.",
    "these moments from the parable of the persistent friend in order.",
    "these events the way Jesus told the parable.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the request at midnight or about persistent prayer.",
    "these facts about the parable of a friend at midnight under the correct bucket.",
    "each fact below by which part of the parable it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about a friend at midnight with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about a friend at midnight.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "A man's friend arrives unexpectedly on a journey, and the man has no food to offer him" },
  { id: "n2", label: "The man goes to his friend's house at midnight to ask for three loaves of bread" },
  { id: "n3", label: "The friend inside answers that the door is locked and his family is already in bed" },
  { id: "n4", label: "The friend at first says he cannot get up to help" },
  { id: "n5", label: "Jesus explains that because of the man's bold persistence, the friend will get up and give him what he needs" },
  { id: "n6", label: "Jesus then teaches, \"Ask and it will be given to you; seek and you will find; knock and the door will be opened to you\"" },
  { id: "n7", label: "Jesus assures that everyone who asks receives, seeks finds, and knocks finds the door opened" },
];

interface EventFact { text: string; group: "request" | "persistence" }
const EVENT_FACTS: EventFact[] = [
  { text: "A friend arrived unexpectedly on a journey with no food available for him", group: "request" },
  { text: "The man went to a friend's house at midnight to ask for bread", group: "request" },
  { text: "The friend inside said the door was already locked and his children were in bed", group: "request" },
  { text: "The friend at first refused, saying he could not get up", group: "request" },
  { text: "The man kept asking boldly despite the initial refusal", group: "persistence" },
  { text: "The friend eventually got up because of the man's persistent asking", group: "persistence" },
  { text: "Jesus taught, \"Ask and it will be given to you\"", group: "persistence" },
  { text: "Jesus taught, \"Seek and you will find\"", group: "persistence" },
  { text: "Jesus taught, \"Knock and the door will be opened to you\"", group: "persistence" },
  { text: "Jesus assured that everyone who asks receives what they need", group: "persistence" },
  { text: "The parable teaches persistence in prayer, not giving up after one attempt", group: "persistence" },
  { text: "The friend's initial reluctance made the man's continued asking necessary", group: "request" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Luke 11:5-10", meaning: "The Bible passage recording the parable of a friend at midnight" },
  { term: "Midnight", meaning: "The inconvenient time the man went to his friend's house to ask for bread" },
  { term: "Three loaves of bread", meaning: "What the man needed to feed his unexpected guest" },
  { term: "Bold persistence", meaning: "The quality that eventually got the sleeping friend to help, according to Jesus' teaching" },
  { term: "\"Ask and it will be given to you\"", meaning: "Part of Jesus' teaching on the importance of asking God persistently" },
  { term: "\"Seek and you will find\"", meaning: "Part of Jesus' teaching encouraging persistent seeking" },
  { term: "\"Knock and the door will be opened\"", meaning: "Part of Jesus' teaching encouraging persistent knocking, or asking" },
  { term: "Persistent prayer", meaning: "Continuing to pray without giving up, the main lesson of this parable" },
  { term: "Unexpected guest", meaning: "The traveller who arrived at the man's house, prompting his urgent need for bread" },
  { term: "Parable", meaning: "A simple story Jesus used to teach a deeper spiritual lesson, such as this one about persistence" },
  { term: "Not giving up", meaning: "The attitude this parable encourages when praying to God" },
  { term: "Reluctant friend", meaning: "The character in the parable who at first refused to help but eventually did" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Kiprop", "Adhiambo", "Otiende", "Wangeci", "Bosire", "Chepngeno", "Mutinda", "Njoki", "Kiptum", "Achieng", "Barongo", "Wafula"] as const;
const KENYAN_PLACES = ["Nanyuki", "Bondo", "Kapsabet", "Wundanyi", "Sotik", "Chuka", "Migori", "Loitokitok", "Kilgoris", "Mwingi", "Rongo", "Ol Kalou"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} prays for help with a difficult family situation but stops praying after a few days when nothing seems to change. What does the parable of a friend at midnight teach about this?`,
    correct: "Keep praying persistently, following the parable's teaching that continued, bold asking is often part of receiving an answer",
    wrong: [
      "Stop praying immediately if an answer does not come right away",
      "The parable teaches that only one prayer attempt is ever needed",
      "This parable has no lesson about how to approach prayer",
    ],
    explanation: "The parable's central lesson, reinforced by 'ask, seek, knock,' is about persistence in prayer rather than giving up after one attempt.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices the friend in the parable only helped after being asked persistently, at an inconvenient hour. What does this detail suggest about the value of persistence?`,
      correct: "Persistence can lead to a positive outcome, even when the timing or circumstances initially seem unfavourable",
      wrong: [
        "The detail shows that asking for help is always pointless and unwelcome",
        "It suggests requests should only ever be made at convenient times",
        "The friend's help had nothing to do with how persistently he was asked",
      ],
      explanation: "Jesus specifically says it was 'because of the man's boldness' that the friend got up to help, showing persistence can overcome an unfavourable situation.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads "ask and it will be given to you; seek and you will find; knock and the door will be opened to you" and wonders what these three actions have in common. What connects them?`,
    correct: "All three describe an active, ongoing effort to reach out to God rather than a single, passive request",
    wrong: [
      "The three phrases describe completely unrelated, separate ideas",
      "They all describe giving up quickly if an answer is not immediate",
      "Asking, seeking, and knocking are all discouraged by this teaching",
    ],
    explanation: "Asking, seeking, and knocking are three related images of active, continued effort in prayer, reinforcing the parable's lesson of persistence.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes that if God does not answer a prayer right away, it means God does not care. How does this parable respond to that belief?`,
      correct: "The parable encourages continued, persistent prayer, suggesting a delay is not the same as God not caring",
      wrong: [
        "The parable agrees that any delay in answered prayer proves God does not care",
        "The parable teaches that God never actually answers any prayer",
        "This parable has no connection to how a person should feel about delayed answers",
      ],
      explanation: "By teaching persistence — keep asking, seeking, knocking — the parable encourages trust that continued prayer matters, rather than assuming a delay means God does not care.",
    };
  },
  (rng) => ({
    prompt: `A prayer group in ${place(rng)}, led by ${name(rng)}, discusses how to encourage members who feel discouraged when prayers are not answered quickly. Which idea from this parable helps most?`,
    correct: "Encourage continued, persistent prayer, since the parable teaches that persistence is part of how prayer works",
    wrong: [
      "Encourage members to stop praying about the same request after one attempt",
      "This parable offers no encouragement relevant to discouraged prayer group members",
      "Suggest that God only listens to prayers made at midnight",
    ],
    explanation: "The parable's core encouragement — keep asking, seeking, knocking — is directly useful for encouraging persistence among discouraged prayer group members.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} asks why Jesus chose an inconvenient, midnight scenario for this parable rather than a daytime, easy request. What effect does this choice create?`,
      correct: "It makes the man's persistence even more striking, since he asked despite very inconvenient circumstances",
      wrong: [
        "The midnight setting was chosen randomly with no particular purpose",
        "Midnight was chosen to teach that prayer should only happen at night",
        "The setting makes the story less relevant to persistence in prayer",
      ],
      explanation: "The inconvenient, midnight setting emphasises just how persistent and bold the man had to be, strengthening the parable's lesson about persistence.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the friend inside the house was simply being unkind by initially refusing to help. Is unkindness the main point Jesus was making about the friend's response?`,
    correct: "No — the friend's initial refusal sets up the lesson about persistence, showing that even a reluctant response can eventually lead to help through continued asking",
    wrong: [
      "Yes — the parable's main point is to criticise unkind neighbours",
      "Yes — Jesus wanted listeners to conclude that friends should never be trusted",
      "No — but the friend's response actually has no role in the parable's lesson",
    ],
    explanation: "The friend's initial reluctance is a setup for the parable's real lesson about the value of bold persistence, not primarily a comment on unkindness.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know how this parable connects to the sub-strand's key inquiry question about how it relates to Christians today. What is the connecting idea?`,
    correct: "The parable's lesson on persistent prayer remains directly relevant, since Christians today are still encouraged to keep asking, seeking and knocking in prayer",
    wrong: [
      "The parable is only about ancient hospitality customs, with no relevance today",
      "The parable's lesson only applied to people living during Jesus' own lifetime",
      "There is no meaningful connection between the parable and modern prayer",
    ],
    explanation: "The lesson's key inquiry question directly asks how this parable relates to Christians today — the answer is its ongoing lesson about persistence in prayer.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to sing a relevant song about this parable, as this lesson suggests. Which theme would best fit the song's message?`,
      correct: "The importance of not giving up in prayer, and trusting that persistent asking is heard",
      wrong: [
        "A song celebrating giving up quickly when facing any difficulty",
        "A song focused entirely on hospitality customs with no mention of prayer",
        "A song discouraging anyone from ever asking God for anything",
      ],
      explanation: "This lesson's own suggested activity is singing a relevant song about a friend at midnight — the parable's central theme of persistent prayer fits best.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} points out that the man in the parable needed the bread urgently for an unexpected guest, not for himself. What does this detail add to the lesson?`,
    correct: "It shows the man's persistence was partly motivated by caring for someone else's need, not only his own convenience",
    wrong: [
      "The detail about the guest has no meaningful connection to the lesson",
      "It shows the man was being selfish by asking for bread at all",
      "It suggests persistent prayer should only be for one's own personal needs",
    ],
    explanation: "The man's persistence was driven by hospitality and care for his unexpected guest, adding a layer of selfless motivation to the lesson on persistence.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wonders whether "knocking" in this parable refers only to literally knocking on a door. What does the phrase mean in the wider context of the teaching?`,
      correct: "It is used as an image for persistently approaching God in prayer, not only a literal action at someone's door",
      wrong: [
        "It refers only to a literal door, with no broader spiritual meaning at all",
        "Knocking in this context means giving up after a single attempt",
        "The phrase has no connection to prayer or approaching God at all",
      ],
      explanation: "Jesus uses knocking, alongside asking and seeking, as an image of persistently approaching God in prayer, not only describing a literal door.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} concludes that this parable teaches persistence is the only requirement for having any prayer answered exactly as requested. Is this a complete summary of the lesson?`,
    correct: "The parable emphasises persistence strongly, and its core encouragement is to keep asking, seeking and knocking rather than giving up",
    wrong: [
      "The parable teaches that persistence guarantees an instant, dramatic answer every time",
      "The parable actually discourages any form of persistent prayer",
      "The parable has nothing at all to do with the idea of persistence",
    ],
    explanation: "The parable's central emphasis is persistence in prayer — encouraging continued asking, seeking and knocking rather than giving up too soon.",
  }),
];

export const aFriendAtMidnight: Skill = {
  id: "g5-cre-jc-friend-at-midnight",
  code: "JC.9",
  subjectId: "cre",
  strandId: "g5-cre-jesus",
  grade: 5,
  title: "A Friend at Midnight",
  description: "The parable of a friend at midnight (Luke 11:5-10), where bold persistence eventually gets a sleeping friend to help, teaching learners to be persistent in prayer through asking, seeking and knocking.",
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
        hint: "Start with the unexpected guest arriving, and end with Jesus' teaching about ask, seek, and knock.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const request = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "request")).slice(0, 4);
      const persistence = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "persistence")).slice(0, 4);
      const chosen = shuffle(rng, [...request, ...persistence]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "request", label: "The midnight request" },
          { id: "persistence", label: "The lesson on persistence" },
        ],
        correctBucket,
        hint: "The request bucket is about what happened at the door; the persistence bucket is about Jesus' teaching that follows.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "request" ? "the midnight request" : "the lesson on persistence"}.`).join(" "),
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
        hint: "Think about how the man's persistence at midnight relates to Jesus' teaching on prayer.",
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
        hint: "Think about how the man's bold persistence at midnight relates to Jesus' teaching on prayer.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The man's friend arrived unexpectedly while on a", after: ".", answer: "journey", accepted: ["journey"] },
      { before: "The man went to his friend's house at", after: "to ask for bread.", answer: "midnight", accepted: ["midnight"] },
      { before: "The man asked to borrow three loaves of", after: ".", answer: "bread", accepted: ["bread"] },
      { before: "The friend said the door was already", after: ".", answer: "locked", accepted: ["locked"] },
      { before: "Because of the man's bold", after: ", the friend eventually got up to help.", answer: "persistence", accepted: ["persistence"] },
      { before: "Jesus taught, \"Ask and it will be", after: "to you.\"", answer: "given", accepted: ["given"] },
      { before: "Jesus taught, \"Seek and you will", after: ".\"", answer: "find", accepted: ["find"] },
      { before: "Jesus taught, \"Knock and the door will be", after: "to you.\"", answer: "opened", accepted: ["opened"] },
      { before: "This parable teaches Christians to be persistent in", after: ".", answer: "prayer", accepted: ["prayer"] },
      { before: "The parable of a friend at midnight is recorded in Luke", after: ".", answer: "11", accepted: ["11", "eleven"] },
      { before: "This lesson's key inquiry question asks how the parable relates to Christians", after: ".", answer: "today", accepted: ["today"] },
      { before: "The friend's initial response was that he could not get", after: ".", answer: "up", accepted: ["up"] },
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
      hint: "Think about Luke 11:5-10 and the lesson on persistence in prayer.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
