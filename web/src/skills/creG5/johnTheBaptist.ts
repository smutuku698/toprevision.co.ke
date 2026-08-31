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
    "the events of John the Baptist's preaching in the correct order.",
    "these events from Luke 3:3, 9-14 into the order they happened.",
    "these moments from John the Baptist's ministry in order.",
    "these events the way they happened in the wilderness of Judea.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about repentance or about social justice.",
    "these facts about John the Baptist's teaching under the correct bucket.",
    "each fact below by which part of John's message it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about John the Baptist's teaching with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about John the Baptist.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "John the Baptist preaches in the wilderness of Judea, calling people to repent" },
  { id: "n2", label: "Crowds go out to hear him and are baptized, confessing their sins (Luke 3:3)" },
  { id: "n3", label: "John warns that the axe is already at the root of the trees, so every tree that does not produce good fruit will be cut down (Luke 3:9)" },
  { id: "n4", label: "The crowds ask John, \"What then should we do?\"" },
  { id: "n5", label: "John tells them that whoever has two shirts should share with the one who has none, and whoever has food should do likewise" },
  { id: "n6", label: "Tax collectors come to be baptized and ask John, \"Teacher, what should we do?\"" },
  { id: "n7", label: "John tells the tax collectors not to collect more money than they are required to" },
  { id: "n8", label: "Soldiers also ask John, \"And what should we do?\"" },
  { id: "n9", label: "John tells the soldiers not to extort money, not to accuse people falsely, and to be content with their pay" },
];

interface EventFact { text: string; group: "repentance" | "justice" }
const EVENT_FACTS: EventFact[] = [
  { text: "John preached a baptism of repentance for the forgiveness of sins", group: "repentance" },
  { text: "Crowds confessed their sins and were baptized by John", group: "repentance" },
  { text: "John warned that the axe was already at the root of the trees", group: "repentance" },
  { text: "John said every tree that does not produce good fruit will be cut down", group: "repentance" },
  { text: "John's message called people to turn away from sin and turn back to God", group: "repentance" },
  { text: "The crowds asked John, \"What then should we do?\" after hearing his warning", group: "repentance" },
  { text: "John told the crowds that whoever has two shirts should share with the one who has none", group: "justice" },
  { text: "John taught that whoever has food should share with those who have none", group: "justice" },
  { text: "John told tax collectors not to collect more money than they were required to", group: "justice" },
  { text: "John told soldiers not to extort money from anyone", group: "justice" },
  { text: "John told soldiers not to falsely accuse anyone", group: "justice" },
  { text: "John told soldiers to be content with their pay", group: "justice" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Repentance", meaning: "Turning away from sin and turning back to God, the call at the heart of John's preaching" },
  { term: "Wilderness of Judea", meaning: "The area where John the Baptist preached and baptized people" },
  { term: "Baptism", meaning: "A sign of repentance and the forgiveness of sins that John called crowds to receive" },
  { term: "\"Axe at the root\"", meaning: "John's warning image showing that judgment for unrepented sin was near" },
  { term: "Good fruit", meaning: "The changed, right actions that John said should follow real repentance" },
  { term: "Tax collectors", meaning: "Officials who came to John and were told not to overcharge people" },
  { term: "Soldiers", meaning: "Those John told not to extort money or falsely accuse anyone, and to be content with their pay" },
  { term: "Social injustice", meaning: "Unfair treatment, such as overcharging or bullying, that John's teaching directly challenged" },
  { term: "Sharing", meaning: "John's instruction that a person with extra shirts or food should give to someone who has none" },
  { term: "Contentment", meaning: "The value John told soldiers to have about the pay they already received" },
  { term: "Honesty", meaning: "The value shown by not overcharging others or falsely accusing them" },
  { term: "\"What then should we do?\"", meaning: "The question the crowds, tax collectors and soldiers each asked John after hearing his warning" },
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
    prompt: `A shopkeeper in ${place(rng)} named ${name(rng)} has been charging customers more than the marked price and pocketing the difference. Based on John the Baptist's teaching to tax collectors, what should the shopkeeper do?`,
    correct: "Stop overcharging and only take the fair, agreed price, since John told tax collectors not to collect more than required",
    wrong: [
      "Keep overcharging as long as no customer complains directly",
      "Only tax collectors were addressed by John, so shopkeepers are free to overcharge",
      "Give the extra money to church instead of returning it to customers",
    ],
    explanation: "John told tax collectors in Luke 3:13 to collect no more than they were required to — the same honesty applies to anyone in a position to overcharge others.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} owns two school jerseys while a classmate has none. Based on Luke 3:11, what should ${who} do?`,
      correct: "Share one jersey with the classmate who has none",
      wrong: [
        "Keep both jerseys since they were bought with the family's own money",
        "Only adults are required to share what they own, not children",
        "Sharing only applies to food, never to clothing",
      ],
      explanation: "John told the crowds in Luke 3:11 that whoever has two shirts should share with the one who has none, and whoever has food should do the same.",
    };
  },
  (rng) => ({
    prompt: `A security guard in ${place(rng)} named ${name(rng)} is offered a bribe to let goods pass without paying the required fee. Based on John's teaching to soldiers, what should ${name(rng)} do?`,
    correct: "Refuse the bribe and be content with the salary already earned, since John told soldiers not to extort money and to be content with their pay",
    wrong: [
      "Accept the bribe since John's teaching to soldiers does not apply to modern security guards",
      "Accept the bribe only if the amount offered is small",
      "Report the bribe offer, but still keep half of the money as a reward",
    ],
    explanation: "John told soldiers in Luke 3:14 not to extort money from anyone and to be content with their pay — a direct warning against taking bribes.",
  }),
  () => ({
    prompt: `When the crowds heard John's warning about the axe at the root of the trees, they immediately asked, "What then should we do?" What does their reaction show about true repentance?`,
    correct: "True repentance leads to practical, changed actions, not just feeling sorry or being baptized without any change",
    wrong: [
      "Repentance only requires being baptized, with no change in behaviour needed afterward",
      "Only religious leaders needed to ask John what they should do",
      "Asking questions after a sermon shows the crowds doubted John's message",
    ],
    explanation: "The crowds' question shows they understood repentance must produce 'good fruit' — real changes in how they lived, such as sharing and honesty.",
  }),
  (rng) => ({
    prompt: `A matatu tout in ${place(rng)} named ${name(rng)} collects extra 'fare' from passengers above the official price and keeps it. How does John's teaching to tax collectors relate to this?`,
    correct: "It condemns collecting more than what is officially required, whether by a tax collector or anyone handling other people's money",
    wrong: [
      "It does not apply, since matatu touts did not exist in John's time",
      "It only forbids overcharging on Sabbath days",
      "It only applies if the extra money is reported to the government",
    ],
    explanation: "John's instruction to tax collectors — not to collect more than required (Luke 3:13) — is a timeless principle against overcharging people entrusted to your honesty.",
  }),
  (rng) => ({
    prompt: `In a shamba near ${place(rng)}, a farmer literally cuts down a fruit tree because it produces no fruit. How does this relate to John the Baptist's warning about the axe at the root of the trees?`,
    correct: "John used the image of a fruitless tree being cut down as a warning that people who do not show real repentance through their actions face judgment",
    wrong: [
      "John's warning was literal farming advice about cutting down unproductive trees",
      "The image has nothing to do with repentance and is only about good farming practice",
      "John meant that only trees, not people, needed to change their behaviour",
    ],
    explanation: "Luke 3:9 uses 'the axe is already at the root of the trees' as a symbol — 'good fruit' represents the changed actions that should follow genuine repentance.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is baptized during a church crusade in ${place(rng)} after confessing wrongdoing. What does John's baptism of repentance, as described in Luke 3:3, show that this baptism is meant to represent?`,
      correct: "Turning away from sin and seeking God's forgiveness, not just performing a ritual",
      wrong: [
        "A guarantee that the person will never face any hardship again",
        "A ritual with no real meaning beyond the ceremony itself",
        "A sign that the person is now wealthier than before",
      ],
      explanation: "Luke 3:3 describes John preaching 'a baptism of repentance for the forgiveness of sins' — the act is meant to show a real turning away from sin, not an empty ceremony.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, starting a first job in ${place(rng)}, is tempted to demand extra 'facilitation' money from clients on top of the agreed salary. Which value from John's teaching to soldiers should guide ${who} instead?`,
      correct: "Contentment — being satisfied with the pay already agreed, without extorting more",
      wrong: [
        "Ambition — always seeking more money regardless of how it is obtained",
        "John's teaching to soldiers only applied to people in the army",
        "Competition — comparing pay with coworkers to justify demanding more",
      ],
      explanation: "John told soldiers to be content with their pay (Luke 3:14) — a value about honest satisfaction with fair earnings, relevant to any job today.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} has extra food at home and notices a hungry classmate at school. Which specific instruction from John the Baptist does sharing that food follow?`,
    correct: "Whoever has food should share with the one who has none, just as John told the crowds in Luke 3:11",
    wrong: [
      "John only spoke about sharing shirts, never about sharing food",
      "Sharing food is only required during religious festivals",
      "John's teaching on sharing only applied to wealthy people",
    ],
    explanation: "Luke 3:11 records John telling the crowds that whoever has two shirts should share, and whoever has food should do likewise.",
  }),
  (rng) => ({
    prompt: `${name(rng)} believes John the Baptist's call to repent was only meant for very sinful people, not for ordinary, well-behaved crowds. Is this a correct understanding of Luke 3:3?`,
    correct: "No — John's call to repentance was addressed to the whole crowd that came out to him, not only to extreme sinners",
    wrong: [
      "Yes — repentance was only required of tax collectors and soldiers, not ordinary people",
      "Yes — children were exempt from John's call to repent",
      "No — but only people who had already been baptized needed to repent further",
    ],
    explanation: "Luke 3:3 describes John preaching repentance to the whole region, and Luke 3:10 shows ordinary crowds, not only obvious sinners, responding by asking what they should do.",
  }),
  (rng) => ({
    prompt: `A county official in ${place(rng)} is accused of demanding bribes but says, "Everyone in this office does it, so it is normal." How does John's teaching, still relevant today, respond to this excuse?`,
    correct: "John's teaching on honesty and fairness — not overcharging, not extorting, being content with pay — directly challenges this kind of excuse for corruption",
    wrong: [
      "John's teaching only applied to first-century Roman soldiers, not modern officials",
      "The excuse is valid, since John never addressed officials in positions of power",
      "John's teaching only condemns bribery if it is reported publicly",
    ],
    explanation: "John's instructions to tax collectors and soldiers show his teaching directly addresses abuse of position for personal gain — a lesson that remains relevant to corruption today.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} thinks that once someone is baptized, repentance is finished and no further change in behaviour is needed. What does John's teaching about 'good fruit' suggest instead?`,
      correct: "Repentance should show lasting fruit — ongoing changed actions like sharing, honesty and fairness, not a one-time event",
      wrong: [
        "Baptism alone completes repentance, and no future actions matter",
        "Good fruit only refers to literal farming, unrelated to a person's behaviour",
        "Repentance is only proven by how loudly someone confesses in public",
      ],
      explanation: "John's warning that trees not producing good fruit will be cut down (Luke 3:9) teaches that real repentance is shown through continuing right actions, not a single event.",
    };
  },
];

export const johnTheBaptist: Skill = {
  id: "g5-cre-jc-john-the-baptist",
  code: "JC.1",
  subjectId: "cre",
  strandId: "g5-cre-jesus",
  grade: 5,
  title: "John the Baptist",
  description: "John the Baptist's call to repentance (Luke 3:3) and his teachings on sharing, honesty and fairness given to crowds, tax collectors and soldiers (Luke 3:9-14), including social injustice in society today.",
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
        hint: "Start with John preaching in the wilderness, and end with his instructions to the soldiers.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const repentance = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "repentance")).slice(0, 4);
      const justice = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "justice")).slice(0, 4);
      const chosen = shuffle(rng, [...repentance, ...justice]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "repentance", label: "Call to repentance" },
          { id: "justice", label: "Teaching on sharing and fairness" },
        ],
        correctBucket,
        hint: "The repentance bucket is about turning from sin and its warning; the fairness bucket is about specific instructions to share and be honest.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "repentance" ? "call to repentance" : "teaching on sharing and fairness"}.`).join(" "),
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
        hint: "Think about John's warning to the crowds and his separate instructions to tax collectors and soldiers.",
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
        hint: "Think about what John told the crowds, the tax collectors, and the soldiers to do differently.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "John the Baptist preached a baptism of", after: "for the forgiveness of sins.", answer: "repentance", accepted: ["repentance"] },
      { before: "John warned that the", after: "was already at the root of the trees.", answer: "axe", accepted: ["axe"] },
      { before: "John said every tree that does not produce good", after: "will be cut down.", answer: "fruit", accepted: ["fruit"] },
      { before: "When the crowds asked what to do, John said whoever has two shirts should", after: "with the one who has none.", answer: "share", accepted: ["share"] },
      { before: "John taught that whoever has", after: "should share with those who have none.", answer: "food", accepted: ["food"] },
      { before: "John told", after: "not to collect more money than they were required to.", answer: "tax collectors", accepted: ["tax collectors", "tax collector"] },
      { before: "John told soldiers not to", after: "money from anyone.", answer: "extort", accepted: ["extort"] },
      { before: "John told soldiers not to falsely", after: "anyone.", answer: "accuse", accepted: ["accuse"] },
      { before: "John told soldiers to be", after: "with their pay.", answer: "content", accepted: ["content"] },
      { before: "The crowds asked John, \"What then should we", after: "?\"", answer: "do", accepted: ["do"] },
      { before: "John's teaching addressed causes of social", after: "in society.", answer: "injustice", accepted: ["injustice", "injustices"] },
      { before: "Practising the values John taught helps a learner become a God-fearing", after: ".", answer: "Christian", accepted: ["christian"] },
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
      hint: "Think about John's warning to the crowds and his instructions to tax collectors and soldiers.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
