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
    "the events of healing the paralysed man in the correct order.",
    "these events from Mark 2:1-5 into the order they happened.",
    "these moments from the healing at Capernaum in order.",
    "these events the way they happened at the crowded house.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the obstacle or about the friends' faith.",
    "these facts about healing the paralysed man under the correct bucket.",
    "each fact below by which part of the story it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about healing the paralysed man with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about healing the paralysed man.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Jesus returns to Capernaum, and word spreads that he is home" },
  { id: "n2", label: "So many people gather that there is no room left, not even outside the door" },
  { id: "n3", label: "Jesus preaches the word to the crowd that has gathered" },
  { id: "n4", label: "Four men arrive, carrying a paralysed man on a mat" },
  { id: "n5", label: "The four friends cannot get near Jesus because of the crowd" },
  { id: "n6", label: "The friends climb onto the roof and dig through it, right above where Jesus is" },
  { id: "n7", label: "They lower the mat with the paralysed man down through the opening, right in front of Jesus" },
  { id: "n8", label: "Jesus sees the faith of the four friends" },
  { id: "n9", label: "Jesus tells the paralysed man, \"Son, your sins are forgiven\"" },
];

interface EventFact { text: string; group: "obstacle" | "faith" }
const EVENT_FACTS: EventFact[] = [
  { text: "So many people gathered that there was no room, even outside the door", group: "obstacle" },
  { text: "The four friends could not get near Jesus because of the crowd", group: "obstacle" },
  { text: "The crowded house made it seem impossible to reach Jesus for help", group: "obstacle" },
  { text: "The paralysed man could not walk on his own to reach Jesus", group: "obstacle" },
  { text: "The four friends climbed onto the roof of the house", group: "faith" },
  { text: "The friends dug through the roof right above where Jesus was", group: "faith" },
  { text: "The friends lowered the mat down through the opening in front of Jesus", group: "faith" },
  { text: "Jesus saw the faith of the four friends before speaking to the paralysed man", group: "faith" },
  { text: "Jesus told the paralysed man that his sins were forgiven", group: "faith" },
  { text: "The friends refused to give up even when the obvious path was blocked", group: "faith" },
  { text: "The friends' creative solution showed determination to help someone in need", group: "faith" },
  { text: "The crowded, blocked house did not stop the friends from finding another way", group: "obstacle" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Mark 2:1-5", meaning: "The Bible passage recording the healing of the paralysed man in Capernaum" },
  { term: "Capernaum", meaning: "The town where Jesus was staying when the paralysed man was brought to him" },
  { term: "Paralysed", meaning: "Unable to move or use part of one's body, describing the man's condition" },
  { term: "Four friends", meaning: "Those who carried the paralysed man and dug through the roof to reach Jesus" },
  { term: "Digging through the roof", meaning: "The determined, creative action the friends took when the crowd blocked their way" },
  { term: "\"Son, your sins are forgiven\"", meaning: "What Jesus said to the paralysed man after seeing the friends' faith" },
  { term: "Faith", meaning: "The trust and determination Jesus recognised in the four friends' actions" },
  { term: "Depending on God", meaning: "Trusting God for help when faced with sickness or another hard challenge in life" },
  { term: "Persistence", meaning: "Continuing to try despite an obstacle, shown by the friends refusing to give up" },
  { term: "Compassion", meaning: "The care Jesus showed the paralysed man and his determined friends" },
  { term: "Overcrowded house", meaning: "The obstacle that stood between the paralysed man and Jesus" },
  { term: "Healing power of God", meaning: "The theme this story teaches learners to compose and sing songs about" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Muthomi", "Achieng", "Kiptoo", "Nafula", "Odera", "Wairimu", "Barasa", "Chebet", "Mutuku", "Njoroge", "Amondi", "Kiplagat"] as const;
const KENYAN_PLACES = ["Kitui", "Mumias", "Litein", "Kajiado", "Homa Bay", "Nyeri", "Isiolo", "Kilifi", "Kabarnet", "Rongo", "Turkana", "Vihiga"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to help a classmate who is going through a hard family situation, but doesn't know how because the classmate's family avoids visitors. What does the four friends' example in Mark 2 suggest?`,
    correct: "Look for a creative, determined way to reach out and help, the way the friends found a way through the roof when the door was blocked",
    wrong: [
      "Give up trying to help since the direct approach seems impossible",
      "The story of the four friends has no lesson about persistence in helping others",
      "Wait until the family situation improves on its own before doing anything",
    ],
    explanation: "The friends' determination to dig through the roof rather than give up shows the value of finding a creative way to help someone, even when the direct path is blocked.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices Jesus "saw the faith" of the friends before healing the paralysed man. What does this detail suggest about how faith can be shown?`,
      correct: "Faith can be shown through determined action, like the friends' persistence, not only through spoken words",
      wrong: [
        "Faith in this story was only shown by the paralysed man himself, not his friends",
        "The detail about faith has no real importance in the story",
        "Jesus healed the man only because of the man's own spoken request",
      ],
      explanation: "Mark 2:5 specifically says Jesus saw 'their faith,' referring to the friends' determined actions, showing faith can be expressed through persistent effort.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads that the friends dug through the roof because the crowded house blocked the door. What quality does this creative solution best demonstrate?`,
    correct: "Persistence and determination to overcome an obstacle rather than give up",
    wrong: [
      "Carelessness about the house they were damaging",
      "A desire to disrupt Jesus' preaching for attention",
      "Indifference toward their friend's need for healing",
    ],
    explanation: "Rather than giving up when the crowd blocked the door, the friends showed persistence by finding another way — through the roof — to reach Jesus.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes that only the person who is sick or struggling needs to have faith for God to help. How does this story challenge that belief?`,
      correct: "The faith of the friends, not only the paralysed man himself, played a role in bringing about the healing",
      wrong: [
        "The story agrees completely — only the paralysed man's own faith mattered",
        "The friends' actions actually had no connection to the healing at all",
        "This story teaches that faith should always be shown alone, without help from others",
      ],
      explanation: "Mark 2:5 shows Jesus responding to the faith of the friends as a group, teaching that the faith and support of others can matter alongside a person's own trust.",
    };
  },
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, led by ${name(rng)}, is trying to raise funds for a sick classmate's hospital bill, but face many obstacles collecting the money. What encouragement from Mark 2 applies here?`,
    correct: "Persistence and creative effort, even when obstacles seem to block the direct path, can still lead to helping someone in need",
    wrong: [
      "The story teaches that fundraising should be abandoned at the first obstacle",
      "This story has no relevance to modern efforts to help someone who is sick",
      "Only wealthy people are able to help someone facing a health challenge",
    ],
    explanation: "The four friends' persistence in overcoming the obstacle of the crowded house is a model for continuing determined effort to help someone facing hardship.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} asks why Jesus first said, "your sins are forgiven," to the paralysed man rather than immediately addressing his paralysis. What might this suggest about Jesus' priorities in the account?`,
      correct: "Jesus was concerned with the man's deeper spiritual need for forgiveness, not only his visible physical condition",
      wrong: [
        "It shows Jesus was confused about what the man actually needed",
        "The statement about forgiveness had nothing to do with the healing account",
        "Jesus said this only to delay actually helping the man",
      ],
      explanation: "By addressing forgiveness first, the account shows Jesus' concern for more than the man's visible condition — his words point to a deeper spiritual need as well.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} believes the crowded house in this story was simply an unimportant detail. What role did the crowd actually play in the story?`,
    correct: "It created the obstacle that tested and revealed the friends' persistence and creative faith",
    wrong: [
      "The crowd made the story easier, since more people were available to help lower the mat",
      "The crowd had no effect on the events of the story at all",
      "The crowd prevented the healing from happening at all",
    ],
    explanation: "The crowded house, blocking the door, created the very obstacle that the friends' faith and persistence had to overcome, making it a central part of the story.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wonders why this story is significant to Christians today, even though most people no longer literally dig through rooftops for healing. What is the lasting lesson?`,
    correct: "The lasting lesson is depending on God and persisting in faith, especially with the support of others, when facing life's challenges",
    wrong: [
      "The lesson is only about ancient building techniques and roof repair",
      "There is no lasting lesson beyond the specific physical detail of the roof",
      "The story only teaches that people should avoid crowded places",
    ],
    explanation: "The lesson's outcome is a desire to pray to God and depend on Him when facing challenges — the friends' persistent faith models this in a timeless way.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is discouraged after trying and failing several times to help a friend through a hard situation. What could ${who} learn from the four friends' persistence?`,
      correct: "Continue looking for another way to help, even after an initial attempt fails, rather than giving up entirely",
      wrong: [
        "One failed attempt means it is time to stop trying to help completely",
        "The story teaches that helping others should only be attempted once",
        "Persistence in helping someone is discouraged by this Bible story",
      ],
      explanation: "The four friends did not give up when the crowd blocked the door — they tried another way, modeling persistence even after an initial obstacle.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that helping someone in need always requires acting completely alone. How does the story of the four friends respond to this idea?`,
    correct: "The story shows the power of working together — four friends combined their effort to help one person reach Jesus",
    wrong: [
      "The story agrees that helping someone should always be a solo effort",
      "Only one of the four friends actually contributed to the effort",
      "Teamwork had no role at all in how the paralysed man was helped",
    ],
    explanation: "This story highlights teamwork — four friends working together, carrying, climbing, and lowering the mat — to help one person in need.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} faces a health challenge and wonders whether prayer and depending on God still matters when doctors are also helping. What does this lesson suggest?`,
      correct: "Depending on God through prayer and trusting His care can go alongside receiving other help, as this lesson encourages",
      wrong: [
        "Depending on God means refusing all other forms of help entirely",
        "This lesson teaches that prayer has no real value during illness",
        "Only people with no other help available should ever pray for healing",
      ],
      explanation: "The lesson's outcome is desiring to pray to God when faced with challenges such as sickness — a trust in God that can accompany other forms of care.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} asks what made the friends' solution — digging through the roof — such a bold choice at the time. What does their boldness reveal about their determination?`,
    correct: "They were willing to take an unusual, even disruptive, action because they were fully committed to getting their friend help",
    wrong: [
      "Their boldness shows they did not actually care much about their friend",
      "Digging through the roof was a common, ordinary action with no real boldness involved",
      "The action reveals nothing about the friends' level of commitment",
    ],
    explanation: "Choosing such an unusual and disruptive method shows just how committed and determined the friends were to getting their friend in front of Jesus.",
  }),
];

export const healingTheParalysedMan: Skill = {
  id: "g5-cre-jc-healing-paralysed-man",
  code: "JC.5",
  subjectId: "cre",
  strandId: "g5-cre-jesus",
  grade: 5,
  title: "Healing the Paralysed Man",
  description: "The story of the paralysed man's four friends who dug through a roof to lower him before Jesus (Mark 2:1-5), teaching persistence, faith, and depending on God when facing sickness or hardship.",
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
        hint: "Start with Jesus returning to Capernaum, and end with Jesus telling the man his sins are forgiven.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const obstacle = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "obstacle")).slice(0, 4);
      const faith = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "faith")).slice(0, 4);
      const chosen = shuffle(rng, [...obstacle, ...faith]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "obstacle", label: "The obstacle blocking the way" },
          { id: "faith", label: "The friends' persistent faith" },
        ],
        correctBucket,
        hint: "The obstacle bucket is about what blocked the friends; the faith bucket is about how they overcame it.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "obstacle" ? "the obstacle blocking the way" : "the friends' persistent faith"}.`).join(" "),
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
        hint: "Think about the obstacle the friends faced and how their persistence overcame it.",
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
        hint: "Think about how the four friends' persistence and faith led Jesus to respond.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Jesus had returned to the town of", after: ".", answer: "Capernaum", accepted: ["capernaum"] },
      { before: "So many people gathered that there was no room, not even outside the", after: ".", answer: "door", accepted: ["door"] },
      { before: "Four friends carried a", after: "man on a mat.", answer: "paralysed", accepted: ["paralysed", "paralyzed"] },
      { before: "The friends could not reach Jesus because of the", after: ".", answer: "crowd", accepted: ["crowd"] },
      { before: "The friends dug through the", after: "to lower their friend down.", answer: "roof", accepted: ["roof"] },
      { before: "Jesus saw the", after: "of the four friends.", answer: "faith", accepted: ["faith"] },
      { before: "Jesus said to the man, \"Son, your sins are", after: ".\"", answer: "forgiven", accepted: ["forgiven"] },
      { before: "This story teaches learners to depend on God when facing", after: ".", answer: "challenges", accepted: ["challenges"] },
      { before: "The healing of the paralysed man is recorded in", after: "2:1-5.", answer: "Mark", accepted: ["mark"] },
      { before: "The friends' determination is an example of", after: "in helping someone in need.", answer: "persistence", accepted: ["persistence"] },
      { before: "This lesson's key inquiry question asks why the healing is significant to", after: "today.", answer: "Christians", accepted: ["christians"] },
      { before: "The friends' faith was shown through their determined and creative", after: ".", answer: "action", accepted: ["action"] },
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
      hint: "Think about Mark 2:1-5 and how the four friends' faith and persistence helped the paralysed man reach Jesus.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
