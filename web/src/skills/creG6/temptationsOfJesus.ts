import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "the events of Jesus' temptation in the wilderness in the correct order.",
    "these events from Luke 4:1-13 into the order they happened.",
    "these moments of Jesus' temptation in the wilderness in order.",
    "these events the way they happened in the wilderness.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by which of the three temptations it describes.",
    "these facts about Jesus' temptation under the correct temptation.",
    "each fact below by which temptation in the wilderness it belongs to.",
    "each statement into the bucket for the temptation it describes.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about Jesus' temptation with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Jesus' temptation.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Led by the Spirit into the wilderness, Jesus fasts for forty days and forty nights" },
  { id: "n2", label: "The devil tempts Jesus to turn a stone into bread, since he is hungry" },
  { id: "n3", label: "Jesus replies, \"Man shall not live on bread alone\"" },
  { id: "n4", label: "The devil shows Jesus all the kingdoms of the world, offering their authority if Jesus will worship him" },
  { id: "n5", label: "Jesus replies, \"Worship the Lord your God and serve him only\"" },
  { id: "n6", label: "The devil takes Jesus to the highest point of the temple and dares him to throw himself down" },
  { id: "n7", label: "Jesus replies, \"Do not put the Lord your God to the test\"" },
  { id: "n8", label: "Having failed in every attempt, the devil leaves Jesus until an opportune time" },
];

interface EventFact { text: string; which: "bread" | "kingdoms" | "temple" }
const EVENT_FACTS: EventFact[] = [
  { text: "The devil tempted Jesus to turn a stone into bread after Jesus had fasted for forty days", which: "bread" },
  { text: "This temptation targeted Jesus' physical hunger after such a long fast", which: "bread" },
  { text: "Jesus replied, \"Man shall not live on bread alone,\" quoting Deuteronomy 8:3", which: "bread" },
  { text: "This first temptation tried to get Jesus to use his power selfishly to meet his own need", which: "bread" },
  { text: "The devil showed Jesus all the kingdoms of the world in an instant", which: "kingdoms" },
  { text: "The devil offered Jesus authority and glory over all these kingdoms", which: "kingdoms" },
  { text: "In exchange, the devil demanded that Jesus worship him", which: "kingdoms" },
  { text: "Jesus replied, \"Worship the Lord your God and serve him only,\" quoting Deuteronomy 6:13", which: "kingdoms" },
  { text: "The devil took Jesus to the highest point of the temple in Jerusalem", which: "temple" },
  { text: "The devil challenged Jesus to throw himself down and let angels catch him", which: "temple" },
  { text: "This temptation twisted Scripture, quoting Psalm 91 about angels protecting God's people", which: "temple" },
  { text: "Jesus replied, \"Do not put the Lord your God to the test,\" quoting Deuteronomy 6:16", which: "temple" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Forty days", meaning: "The length of time Jesus fasted in the wilderness before being tempted" },
  { term: "Wilderness", meaning: "The place where the Holy Spirit led Jesus to be tempted by the devil" },
  { term: "\"Man shall not live on bread alone\"", meaning: "Jesus' reply to the temptation to turn a stone into bread" },
  { term: "\"Worship the Lord your God and serve him only\"", meaning: "Jesus' reply to the temptation to worship the devil" },
  { term: "\"Do not put the Lord your God to the test\"", meaning: "Jesus' reply to the temptation to jump from the temple" },
  { term: "Pinnacle of the temple", meaning: "The highest point of the temple where the devil took Jesus for the third temptation" },
  { term: "Deuteronomy", meaning: "The Old Testament book Jesus quoted from in all three of his replies" },
  { term: "Opportune time", meaning: "When the devil left Jesus after failing all three temptations, planning to return" },
  { term: "Fasting", meaning: "Going without food, which left Jesus physically weak and hungry for the first temptation" },
  { term: "Peer pressure", meaning: "A modern temptation young people can overcome using the same principle Jesus used: relying on God's word" },
  { term: "Dishonesty", meaning: "A modern temptation, such as cheating in an exam, resisted using Scripture and prayer" },
  { term: "Cutting corners", meaning: "A modern temptation to skip responsibilities or take shortcuts, resisted through Christian values" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amani", "Beatrice", "Chege", "Dorcas", "Elvis", "Fatma", "Gideon", "Hellen", "Ismail", "Josphat", "Karimi", "Lucy"] as const;
const KENYAN_PLACES = ["Bomet", "Webuye", "Gilgil", "Loitokitok", "Mwingi", "Rongo", "Vihiga", "Timau", "Kajiado", "Siaya", "Kilgoris", "Tala"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} skips a meal for a whole day and feels very hungry, and is then offered food gained by stealing. Which of Jesus' temptations in the wilderness is most similar to this situation?`,
    correct: "The temptation to turn a stone into bread when he was physically hungry after fasting",
    wrong: [
      "The temptation to worship the devil in exchange for authority",
      "The temptation to jump from the temple to test God",
      "The temptation to feed a large crowd with a few loaves",
    ],
    explanation: "Jesus' first temptation targeted his physical hunger after forty days of fasting, just as being very hungry can make a wrong shortcut feel tempting.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is offered a shortcut to fame and popularity by classmates, if only they will go along with something dishonest. Which of Jesus' three temptations does this most closely match?`,
    correct: "The temptation to gain authority over the kingdoms of the world by worshipping the devil",
    wrong: [
      "The temptation to turn a stone into bread",
      "The temptation to throw himself from the temple",
      "A temptation to doubt that God exists, which is not one of the three in Luke 4",
    ],
    explanation: "The second temptation offered Jesus worldly power and glory in exchange for worship — a match for being offered status in exchange for doing wrong.",
  }),
  (rng) => ({
    prompt: `${name(rng)}'s friends in ${place(rng)} tell them to try something risky, saying "God will protect you anyway, so it doesn't matter." Which of Jesus' temptations does this reasoning most resemble?`,
    correct: "The temptation to jump from the temple and test whether God would protect him",
    wrong: [
      "The temptation to turn stones into bread",
      "The temptation to gain the kingdoms of the world",
      "A temptation to lie about a broken promise, not one of the three in Luke 4",
    ],
    explanation: "The third temptation dared Jesus to presume on God's protection recklessly — the same flawed reasoning behind \"it's fine, God will protect me anyway.\"",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked how Jesus overcame each of the three temptations in the wilderness. What is the correct answer?`,
    correct: "By quoting Scripture in response to each temptation, not relying on his own strength alone",
    wrong: [
      "By ignoring the devil completely and never responding to him",
      "By performing a miracle to frighten the devil away",
      "By calling on angels to remove the devil immediately",
    ],
    explanation: "Luke 4 records Jesus answering each temptation with a quotation from Deuteronomy, showing that he overcame temptation by relying on God's word.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wonders why the first temptation, about bread, might have been especially hard for Jesus to resist. What is the best reason?`,
    correct: "Jesus was physically weak and hungry after forty days without food, making the temptation stronger",
    wrong: [
      "Jesus doubted whether he was really the Son of God",
      "Jesus had never eaten bread before that moment",
      "Bread was forbidden to Jesus by a special religious law",
    ],
    explanation: "After forty days of fasting, Jesus' genuine physical hunger made the temptation to turn a stone into bread especially strong.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is tempted to put success and wealth ahead of everything else, including their faith. Which of Jesus' replies to the devil best applies to this situation?`,
    correct: "\"Worship the Lord your God and serve him only\"",
    wrong: [
      "\"Man shall not live on bread alone\"",
      "\"Do not put the Lord your God to the test\"",
      "\"Ask and it will be given to you\", which is not one of Jesus' three replies in Luke 4",
    ],
    explanation: "The reply to the second temptation, about worshipping only God, directly applies to refusing to let wealth or success take God's place.",
  }),
  (rng) => ({
    prompt: `${name(rng)} decides to skip studying for an exam, believing God will simply "sort it out" without any effort on their part. Which of Jesus' temptations warns against this kind of thinking?`,
    correct: "The temptation to jump from the temple, testing God rather than trusting him responsibly",
    wrong: [
      "The temptation to turn stones into bread",
      "The temptation to gain the kingdoms of the world",
      "None of the three temptations relate to how a person prepares for a task",
    ],
    explanation: "Jesus' reply, \"Do not put the Lord your God to the test,\" warns against presuming on God's help while ignoring one's own responsibility.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked which temptation the devil tried first, in the wilderness. Which was it?`,
    correct: "Turning a stone into bread",
    wrong: [
      "Offering Jesus the kingdoms of the world",
      "Daring Jesus to jump from the temple",
      "The devil tried all three temptations at exactly the same time",
    ],
    explanation: "Luke 4:1-13 records the temptations in order, beginning with the temptation to turn a stone into bread.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked which temptation the devil tried last, right before he left Jesus. Which was it?`,
    correct: "Daring Jesus to throw himself down from the highest point of the temple",
    wrong: [
      "Tempting Jesus to turn a stone into bread",
      "Offering Jesus the kingdoms of the world",
      "The devil never actually left Jesus at all",
    ],
    explanation: "Luke 4:9-13 records the temple temptation as the third and final one, after which the devil left Jesus until an opportune time.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} faces strong peer pressure to join in something they know is wrong. Based on how Jesus overcame temptation, what is the best response?`,
    correct: "Relying on God's word and values to resist, just as Jesus quoted Scripture each time",
    wrong: [
      "Giving in, since resisting peer pressure is impossible",
      "Avoiding all friends and school activities completely",
      "Only resisting when a teacher is nearby watching",
    ],
    explanation: "Jesus' pattern of overcoming temptation by relying on God's word offers a model for resisting peer pressure through the same kind of firm, values-based response.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is tempted to copy a classmate's homework rather than doing the work themselves. A friend says, "It's fine, as long as no one finds out." Which idea from the temptations of Jesus best challenges this thinking?`,
    correct: "Right and wrong do not depend on being caught — Jesus resisted temptation on principle, using God's word, not fear of being seen",
    wrong: [
      "Copying homework is acceptable as long as it is never discovered",
      "It is fine to do wrong occasionally, since even Jesus was tempted",
      "Waiting to be caught is the only real reason to stop doing wrong",
    ],
    explanation: "Jesus resisted every temptation on the basis of God's word and truth, not because he feared being watched — a standard that applies regardless of whether wrongdoing is discovered.",
  }),
];

export const temptationsOfJesus: Skill = {
  id: "g6-cre-jc-temptations-of-jesus-christ",
  code: "JC.2",
  subjectId: "cre",
  strandId: "g6-cre-jesus",
  grade: 6,
  title: "The Temptations of Jesus Christ",
  description: "The three temptations Jesus faced in the wilderness (Luke 4:1-13), how he overcame each using Scripture, and how young people can overcome temptations today.",
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
        hint: "The temptations go bread, then the kingdoms of the world, then the temple, in that order.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const bread = shuffle(rng, EVENT_FACTS.filter((f) => f.which === "bread")).slice(0, 3);
      const kingdoms = shuffle(rng, EVENT_FACTS.filter((f) => f.which === "kingdoms")).slice(0, 3);
      const temple = shuffle(rng, EVENT_FACTS.filter((f) => f.which === "temple")).slice(0, 3);
      const chosen = shuffle(rng, [...bread, ...kingdoms, ...temple]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.which));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "bread", label: "Turn a stone into bread" },
          { id: "kingdoms", label: "Worship the devil for the kingdoms" },
          { id: "temple", label: "Jump from the temple" },
        ],
        correctBucket,
        hint: "The bread temptation targets hunger; the kingdoms temptation offers authority; the temple temptation dares Jesus to test God.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.which === "bread" ? "the bread temptation" : f.which === "kingdoms" ? "the kingdoms temptation" : "the temple temptation"}.`).join(" "),
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
        hint: "Think about each temptation, Jesus' scriptural reply to it, and how the lesson applies today.",
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
        hint: "Think about the three temptations, Jesus' scriptural replies, and how young people can overcome temptation today.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Holy Spirit led Jesus into the wilderness where he was tempted for forty", after: ".", answer: "days", accepted: ["days"] },
      { before: "Jesus had gone without food for forty days and forty nights, so he was very", after: ".", answer: "hungry", accepted: ["hungry"] },
      { before: "The devil first tempted Jesus to turn a stone into", after: ".", answer: "bread", accepted: ["bread"] },
      { before: "Jesus replied that man does not live on bread", after: ", quoting Deuteronomy 8:3.", answer: "alone", accepted: ["alone"] },
      { before: "In the second temptation, the devil offered Jesus authority over all the", after: "of the world.", answer: "kingdoms", accepted: ["kingdoms"] },
      { before: "The devil demanded that Jesus", after: "him in exchange for the kingdoms' authority.", answer: "worship", accepted: ["worship"] },
      { before: "Jesus replied that we must worship the Lord our God and serve him", after: ".", answer: "only", accepted: ["only"] },
      { before: "In the third temptation, the devil took Jesus to the highest point of the", after: "in Jerusalem.", answer: "temple", accepted: ["temple"] },
      { before: "The devil dared Jesus to throw himself down and be caught by", after: ".", answer: "angels", accepted: ["angels"] },
      { before: "Jesus replied that we must not put the Lord our God to the", after: ".", answer: "test", accepted: ["test"] },
      { before: "Jesus overcame every temptation by quoting", after: "rather than relying on his own strength.", answer: "Scripture", accepted: ["scripture", "the bible", "god's word"] },
      { before: "After failing three times, the devil left Jesus until an", after: "time.", answer: "opportune", accepted: ["opportune"] },
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
      hint: "Think about the three temptations in the wilderness and how Jesus answered each one.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
