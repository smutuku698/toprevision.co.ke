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
    "the events of the rich young ruler in the correct order.",
    "these events from Matthew 19:16-22 into the order they happened.",
    "these moments from the story of the rich young man in order.",
    "these events the way the conversation with Jesus happened.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the young man's question or Jesus' instruction.",
    "these facts about the rich young ruler under the correct bucket.",
    "each fact below by which part of the conversation it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the rich young ruler with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the rich young ruler.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "A young man comes to Jesus and asks what good thing he must do to get eternal life" },
  { id: "n2", label: "Jesus tells him that if he wants to enter life, he should keep the commandments" },
  { id: "n3", label: "The young man asks Jesus which commandments he means" },
  { id: "n4", label: "Jesus lists commandments, including not murdering, not stealing, and loving your neighbour as yourself" },
  { id: "n5", label: "The young man says he has kept all these commandments and asks what he still lacks" },
  { id: "n6", label: "Jesus tells him to sell his possessions, give to the poor, and follow him" },
  { id: "n7", label: "When the young man hears this, he goes away sad, because he has great wealth" },
];

interface EventFact { text: string; group: "question" | "instruction" }
const EVENT_FACTS: EventFact[] = [
  { text: "The young man asked Jesus what good thing he must do to get eternal life", group: "question" },
  { text: "The young man asked Jesus which commandments he meant", group: "question" },
  { text: "The young man claimed he had already kept all the listed commandments", group: "question" },
  { text: "The young man asked what he still lacked despite keeping the commandments", group: "question" },
  { text: "Jesus told him to keep the commandments if he wanted to enter life", group: "instruction" },
  { text: "Jesus listed commandments such as not murdering, not stealing, and loving your neighbour", group: "instruction" },
  { text: "Jesus told the young man to sell his possessions and give to the poor", group: "instruction" },
  { text: "Jesus told the young man he would have treasure in heaven if he obeyed", group: "instruction" },
  { text: "Jesus invited the young man to follow him after giving away his wealth", group: "instruction" },
  { text: "The young man went away sad because he had great wealth", group: "question" },
  { text: "The young man's wealth became the obstacle preventing him from fully following Jesus", group: "question" },
  { text: "Jesus' instruction tested what the young man valued most", group: "instruction" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Matthew 19:16-22", meaning: "The Bible passage recording the story of the rich young man" },
  { term: "Eternal life", meaning: "What the young man wanted to know how to obtain when he approached Jesus" },
  { term: "The commandments", meaning: "What Jesus first told the young man to keep in order to enter life" },
  { term: "\"Sell your possessions\"", meaning: "Jesus' specific instruction for the young man to become complete or perfect in following him" },
  { term: "\"Give to the poor\"", meaning: "What Jesus told the young man to do with the proceeds from selling his possessions" },
  { term: "Treasure in heaven", meaning: "What Jesus promised the young man if he obeyed and gave away his wealth" },
  { term: "\"Went away sad\"", meaning: "The young man's reaction to Jesus' instruction, because he had great wealth" },
  { term: "Great wealth", meaning: "What made it hard for the young man to fully follow Jesus' instruction" },
  { term: "Sharing resources", meaning: "The value this story teaches, guided by Jesus' instruction to the rich young man" },
  { term: "\"Love your neighbour as yourself\"", meaning: "One of the commandments Jesus listed to the young man" },
  { term: "Attachment to possessions", meaning: "The obstacle the story shows can prevent someone from fully following Jesus" },
  { term: "Following Jesus", meaning: "What Jesus invited the young man to do after giving up his wealth" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Mutuku", "Chepkoech", "Otieno", "Waititu", "Njoroge", "Adhiambo", "Kiplangat", "Wanjiku", "Barasa", "Nekesa", "Simiyu", "Mueni"] as const;
const KENYAN_PLACES = ["Eldoret", "Kilifi", "Machakos", "Migori", "Vihiga", "Turkana", "Nyando", "Kibwezi", "Tetu", "Baringo", "Siaya", "Meru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} has extra school supplies but hesitates to share them with a classmate who has none, worrying about having less for themselves. What does the story of the rich young ruler warn about this hesitation?`,
    correct: "Holding too tightly to possessions can prevent someone from fully following Jesus' teaching to share generously with others",
    wrong: [
      "Sharing extra supplies has nothing to do with this Bible story",
      "The story teaches that keeping everything for yourself is always correct",
      "Only wealthy adults, not learners with school supplies, are addressed by this story",
    ],
    explanation: "The rich young ruler's attachment to his wealth kept him from following Jesus fully — a caution against letting attachment to possessions block generosity.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes that keeping rules, like not lying or not stealing, is all that is required to please God. How does the rich young ruler's story challenge this belief?`,
      correct: "Jesus showed the young man that beyond keeping rules, real obedience also required letting go of what he valued most — his wealth",
      wrong: [
        "The story confirms that keeping rules alone is always sufficient",
        "Jesus never asked the young man to do anything beyond the commandments",
        "This story has no connection to what pleasing God fully requires",
      ],
      explanation: "Even though the young man had kept the commandments, Jesus revealed a deeper test — his attachment to wealth — showing obedience involves more than rule-keeping alone.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads that the young man "went away sad" after hearing Jesus' instruction. What does his sadness reveal about his true priorities?`,
    correct: "His wealth mattered to him more than fully following Jesus, even though he had asked how to gain eternal life",
    wrong: [
      "His sadness shows he had no wealth at all to give away",
      "His sadness proves that Jesus' instruction was unfair or unreasonable",
      "His reaction has no connection to his attachment to his possessions",
    ],
    explanation: "The young man's sadness upon hearing he should give up his wealth reveals that his possessions, not fully following Jesus, were his true priority.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that this story teaches everyone must give away all their belongings to be a good Christian. Is this the main lesson of the passage?`,
      correct: "No — the main lesson is about examining what a person values most and being willing to put following Jesus above any possession or attachment",
      wrong: [
        "Yes — every single Christian is required to give away all possessions",
        "Yes — the story teaches that wealth itself is always sinful",
        "No — the story actually has no lesson about priorities or attachment at all",
      ],
      explanation: "The story's deeper lesson is about examining personal priorities and being willing to place following Jesus above any attachment, not a universal command to give away everything.",
    };
  },
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, led by ${name(rng)}, discusses why the young man asked Jesus "what do I still lack?" after listing his good behaviour. What does this question reveal?`,
    correct: "He sensed, even with good behaviour, that something deeper was still missing in his relationship with God",
    wrong: [
      "The question shows he believed he had already achieved perfect obedience",
      "He was only asking out of idle curiosity with no real self-reflection",
      "The question had no real significance in the conversation",
    ],
    explanation: "By asking what he still lacked, the young man showed self-awareness that good behaviour alone had not fully satisfied his search for eternal life.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why Jesus specifically listed commandments involving how to treat other people, like not stealing and loving your neighbour. What connects these particular commandments?`,
      correct: "They focus on how a person treats others fairly and lovingly, connecting directly to the story's later challenge about sharing wealth",
      wrong: [
        "The commandments Jesus listed were chosen completely at random",
        "These commandments have nothing to do with treating others well",
        "Jesus listed these commandments to avoid talking about wealth at all",
      ],
      explanation: "The commandments Jesus listed focus on treating others fairly and lovingly, setting up the later challenge about generously sharing wealth with the poor.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that the rich young ruler was a bad person because he walked away sad instead of obeying immediately. Is this a fair judgement of him?`,
    correct: "Not necessarily — his sadness shows genuine internal struggle, and the story is better understood as a lesson on the difficulty of letting go of what we value, not simply a judgement of his character",
    wrong: [
      "Yes — the story clearly states he was condemned as evil for hesitating",
      "Yes — walking away sad automatically proves someone is a bad person",
      "No — but the story shows he immediately changed his mind and obeyed anyway",
    ],
    explanation: "The story presents his struggle with genuine difficulty rather than simple condemnation — a lesson on how hard it can be to let go of what we value most.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wonders what Jesus meant by promising "treasure in heaven" in exchange for giving up earthly wealth. What does this phrase suggest?`,
    correct: "That lasting spiritual reward and eternal value matter more than temporary earthly possessions",
    wrong: [
      "That Jesus was simply promising a larger amount of physical money later",
      "The phrase has no real meaning and was only a figure of speech with no significance",
      "It suggests earthly wealth and heavenly treasure are exactly the same thing",
    ],
    explanation: "'Treasure in heaven' points to lasting spiritual and eternal value, contrasted with the temporary nature of the young man's earthly wealth.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to compose a poem on how to inherit eternal life, as this lesson suggests. Which idea would best reflect the story's teaching?`,
      correct: "True obedience to God involves examining what we hold onto most tightly and being willing to follow Jesus fully",
      wrong: [
        "Eternal life can be earned only by accumulating as much wealth as possible",
        "The poem should avoid any mention of sharing or generosity",
        "The story teaches that good behaviour alone guarantees eternal life automatically",
      ],
      explanation: "This lesson's own suggested activity is composing a poem on how to inherit eternal life — the story's teaching centers on full obedience, including letting go of attachments.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} points out that the young man had followed many commandments already, yet still lacked something important. What general lesson can be drawn from this?`,
    correct: "A person can do many good things outwardly and still need to examine deeper attachments that may be holding them back",
    wrong: [
      "The lesson teaches that keeping commandments is pointless and unnecessary",
      "The general lesson is that no one can ever do enough good to matter",
      "There is no general lesson that can be drawn beyond this one specific case",
    ],
    explanation: "The story teaches a broader principle: outward good behaviour does not automatically address deeper attachments a person may need to examine and release.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} debates whether the story shows Jesus being too demanding of the young man. How might this concern be addressed?`,
      correct: "Jesus' instruction directly addressed what he saw as the young man's specific obstacle — his attachment to wealth — rather than being an arbitrary demand",
      wrong: [
        "Jesus' instruction had nothing to do with the young man's specific situation",
        "The demand was random and unrelated to anything the young man said or did",
        "Jesus made this same demand of every single person he ever spoke to",
      ],
      explanation: "Jesus' instruction was specific to the young man's situation, directly addressing what stood between him and fully following Jesus — his attachment to wealth.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} asks how sharing what one has, as this lesson encourages, connects to the rich young ruler's story. What is the connection?`,
    correct: "The young man's unwillingness to share his wealth with the poor is exactly what kept him from fully following Jesus, making sharing a central lesson of the story",
    wrong: [
      "Sharing resources has no connection to this particular Bible story",
      "The young man in the story was already known for sharing generously",
      "This lesson's focus on sharing comes from a completely different source than this story",
    ],
    explanation: "Jesus' specific instruction to sell possessions and give to the poor makes sharing resources a central, direct lesson connected to this story.",
  }),
];

export const theRichYoungRuler: Skill = {
  id: "g5-cre-jc-rich-young-ruler",
  code: "JC.8",
  subjectId: "cre",
  strandId: "g5-cre-jesus",
  grade: 5,
  title: "The Rich Young Ruler",
  description: "The story of the rich young man who asked Jesus how to gain eternal life, kept the commandments, yet went away sad when told to sell his possessions and give to the poor (Matthew 19:16-22), teaching sharing and eternal priorities.",
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
        hint: "Start with the young man's question, and end with him going away sad.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const question = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "question")).slice(0, 4);
      const instruction = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "instruction")).slice(0, 4);
      const chosen = shuffle(rng, [...question, ...instruction]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "question", label: "The young man's questions and reaction" },
          { id: "instruction", label: "Jesus' instructions" },
        ],
        correctBucket,
        hint: "The question bucket is about what the young man asked or felt; the instruction bucket is about what Jesus told him.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "question" ? "the young man's questions and reaction" : "Jesus' instructions"}.`).join(" "),
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
        hint: "Think about what the young man asked Jesus, and what Jesus told him to do.",
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
        hint: "Think about why the young man went away sad after hearing Jesus' instruction.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The young man asked Jesus what good thing he must do to get eternal", after: ".", answer: "life", accepted: ["life"] },
      { before: "Jesus told him that if he wanted to enter life, he should keep the", after: ".", answer: "commandments", accepted: ["commandments"] },
      { before: "Jesus listed loving your neighbour as", after: ".", answer: "yourself", accepted: ["yourself"] },
      { before: "The young man said he had kept all these and asked what he still", after: ".", answer: "lacked", accepted: ["lacked"] },
      { before: "Jesus told him to sell his possessions and give to the", after: ".", answer: "poor", accepted: ["poor"] },
      { before: "Jesus promised he would have treasure in", after: ".", answer: "heaven", accepted: ["heaven"] },
      { before: "The young man went away", after: "because he had great wealth.", answer: "sad", accepted: ["sad"] },
      { before: "This story teaches learners to share resources with", after: ".", answer: "others", accepted: ["others"] },
      { before: "The story of the rich young ruler is recorded in Matthew", after: ".", answer: "19", accepted: ["19", "nineteen"] },
      { before: "This lesson's key inquiry question asks why the young man was unable to share his", after: ".", answer: "wealth", accepted: ["wealth"] },
      { before: "Jesus invited the young man to follow him after giving up his", after: ".", answer: "wealth", accepted: ["wealth"] },
      { before: "The young man's attachment to his possessions was his greatest", after: ".", answer: "obstacle", accepted: ["obstacle"] },
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
      hint: "Think about Matthew 19:16-22 and why the rich young man went away sad.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
