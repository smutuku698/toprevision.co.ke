import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The events of the Conquest of Makkah and the Battle of Hunayn follow the standard,
// widely-taught chronological order of Islamic history, not an invented sequence.
const ORDER_PROMPTS = [
  "Arrange these events of the Conquest of Makkah and Hunayn in the order they happened.",
  "Put these events into the order they occurred.",
  "Sequence these events correctly, from first to last.",
  "Order these events as they happened around the Conquest of Makkah.",
  "Sort these events into the order they occurred.",
  "Arrange these moments from Fat-hul Makkah and Hunayn in the order they took place.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which part of this history it describes.",
  "Group each statement under the part of the story it describes.",
  "Decide which part of the story each statement describes, and sort it there.",
  "Sort each fact into the part of the story it belongs to.",
  "Place each statement under the part it describes.",
  "Read each statement and sort it under the matching part of the story.",
];

const MATCH_PROMPTS = [
  "Match each term about the Conquest of Makkah and Hunayn to its meaning.",
  "Pair each term with the meaning that fits it.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about these events.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const MAKKAH_SEQUENCE = [
  { id: "treaty-broken", label: "The Quraysh break the terms of the Hudaibiya treaty" },
  { id: "march", label: "The Prophet (S.A.W.) marches on Makkah with a large following" },
  { id: "taken", label: "The city is taken with almost no bloodshed" },
  { id: "amnesty", label: "The Prophet (S.A.W.) declares a general amnesty, forgiving those who had wronged him" },
  { id: "idols-removed", label: "The idols are removed from the Kaaba" },
  { id: "hunayn-begins", label: "Shortly after, the Muslims face the Hawazin and Thaqif tribes at Hunayn" },
  { id: "overconfidence", label: "Early overconfidence from their large numbers leads to a difficult start" },
  { id: "regroup-win", label: "The Muslims regroup and go on to win the battle" },
];

interface TopicFact {
  text: string;
  topic: "conquest" | "forgiveness" | "hunayn";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  conquest: "The Conquest of Makkah itself",
  forgiveness: "The Prophet's (S.A.W.) forgiveness and clemency",
  hunayn: "The Battle of Hunayn",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "The Quraysh broke the terms of the Hudaibiya treaty, leading to the conquest", topic: "conquest" },
  { text: "This event took place in 630 CE (8 AH)", topic: "conquest" },
  { text: "The city of Makkah was taken with almost no bloodshed", topic: "conquest" },
  { text: "The idols that had filled the Kaaba were removed, restoring it to the worship of Allah alone", topic: "conquest" },
  { text: "The Prophet (S.A.W.) declared a general amnesty rather than taking revenge on those who had persecuted him", topic: "forgiveness" },
  { text: "He famously told the people of Makkah 'no blame will be upon you today'", topic: "forgiveness" },
  { text: "This response is presented as the ideal Islamic response to a moment of complete victory over past wrongdoers", topic: "forgiveness" },
  { text: "Islam is presented through these events as ultimately standing for peace, not aggression", topic: "forgiveness" },
  { text: "Shortly after the conquest, the Muslims faced the Hawazin and Thaqif tribes at the Battle of Hunayn", topic: "hunayn" },
  { text: "Overconfidence from the Muslims' large numbers led to a difficult early stage in the battle", topic: "hunayn" },
  { text: "The Qur'an references Hunayn as showing that numbers alone did not bring victory, only Allah's help does", topic: "hunayn" },
  { text: "The Muslims regrouped after the early setback and went on to win the battle", topic: "hunayn" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Fat-hul Makkah", meaning: "The Conquest of Makkah, taken with almost no bloodshed in 630 CE" },
  { term: "General amnesty", meaning: "The forgiveness the Prophet (S.A.W.) declared for the people of Makkah instead of revenge" },
  { term: "The idols removed", meaning: "What happened to the Kaaba's contents after the conquest, restoring it to the worship of Allah alone" },
  { term: "Hawazin and Thaqif", meaning: "The tribes the Muslims faced at the Battle of Hunayn" },
  { term: "Early overconfidence", meaning: "What led to a difficult start for the Muslims at Hunayn, despite their large numbers" },
  { term: "630 CE / 8 AH", meaning: "The year of both the Conquest of Makkah and the Battle of Hunayn" },
  { term: "Q9:25-26", meaning: "The Qur'an reference connected to the lesson of the Battle of Hunayn" },
  { term: "Clemency", meaning: "Mercy and forgiveness shown at a moment of victory, as demonstrated at the conquest of Makkah" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, finally has the chance to get back at a classmate who bullied them for a long time, now that ${who} is in a position of influence in class. Applying the lesson of the Conquest of Makkah, what should ${who} do?`,
      correct: "Choose forgiveness over revenge, following the Prophet's (S.A.W.) example of declaring amnesty at the moment of complete victory",
      wrong: [
        "Take revenge, since power should always be used to settle old scores",
        "Ignore the classmate forever without any resolution",
        "Wait until an even better opportunity for revenge appears",
      ],
      explanation: "The Prophet (S.A.W.) chose forgiveness over revenge at Makkah despite having full power to punish those who had wronged him — a model for handling one's own position of advantage.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s school team in ${place(rng)}, confident because of having far more players than the opposing team, becomes careless in the early part of a competition and falls behind. Which event from this sub-strand does this situation resemble?`,
      correct: "The Battle of Hunayn, where early overconfidence from large numbers led to a difficult start",
      wrong: [
        "The Conquest of Makkah, which was about forgiveness, not overconfidence",
        "The Treaty of Hudaibiya, which involved a completely different kind of agreement",
        "None of the events in this sub-strand relate to overconfidence",
      ],
      explanation: "The Battle of Hunayn's early setback, caused by overconfidence from having greater numbers, closely resembles becoming careless due to assumed advantage.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that the Muslims' near-bloodless taking of Makkah proves that military strength alone determined the outcome. Evaluate this reasoning.`,
    correct: "Flawed — the conquest's almost bloodless nature and the Prophet's (S.A.W.) subsequent forgiveness reflect restraint and mercy, not simply military dominance",
    wrong: [
      "Sound — military strength was the only factor in how the conquest unfolded",
      "Sound — the near-bloodless conquest happened purely by chance, unrelated to any choice made",
      "Flawed — but only because Makkah was actually taken through prolonged violent conflict",
    ],
    explanation: "The nearly bloodless nature of the conquest, followed by a deliberate declaration of amnesty, reflects restraint and mercy as much as it reflects any military factor.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why the Qur'an references the Battle of Hunayn as a lesson about where victory truly comes from. What is the best explanation?`,
      correct: "Because the Muslims' early setback despite their large numbers shows that true victory comes from Allah's help, not from numbers or resources alone",
      wrong: [
        "Because Hunayn shows that larger numbers always guarantee an easy victory",
        "Because the reference has no connection to the actual events of the battle",
        "Because the Qur'an's mention of Hunayn is unrelated to any lesson about victory",
      ],
      explanation: "Hunayn's early difficulty, despite the Muslims' greater numbers, is referenced in the Qur'an precisely to teach that victory ultimately comes from Allah's help, not numbers alone.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says removing the idols from the Kaaba after the Conquest of Makkah was simply a symbolic gesture with no deeper significance. Is this accurate?`,
    correct: "No — it restored the Kaaba specifically to the worship of Allah alone, a central, substantive outcome of the conquest, not merely symbolic",
    wrong: [
      "Yes — the removal of the idols had no religious meaning at all",
      "Yes — the Kaaba's purpose remained unchanged regardless of what was inside it",
      "No — but only because the idols were removed purely for storage reasons",
    ],
    explanation: "Removing the idols restored the Kaaba to monotheistic worship of Allah alone — a substantive, central outcome of the conquest, not just a symbolic act.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is in a group project where a rival group breaks a prior agreement, giving ${who}'s group a clear advantage. Applying the lesson of the Conquest of Makkah's aftermath, how should ${who}'s group respond?`,
      correct: "Handle the advantage fairly and without vindictiveness, following the example of restraint and forgiveness shown after the conquest",
      wrong: [
        "Use the advantage to punish the rival group as harshly as possible",
        "Refuse to work with the rival group ever again under any circumstance",
        "Report the rival group without first trying any fair resolution",
      ],
      explanation: "Even after the Quraysh broke the Hudaibiya treaty, the Prophet's (S.A.W.) response to gaining the advantage was restraint and forgiveness, not harsh punishment.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that the Battle of Hunayn proves having many resources or advantages is always a disadvantage. Evaluate this claim.`,
    correct: "Flawed — the lesson is about avoiding overconfidence, not that having advantages is inherently bad; the Muslims still won after regrouping",
    wrong: [
      "Sound — having more resources always guarantees failure",
      "Sound — the Muslims lost the Battle of Hunayn entirely because of their numbers",
      "Flawed — but only because numbers actually had no role in the battle at all",
    ],
    explanation: "Hunayn's lesson is about avoiding overconfidence from an advantage, not that advantages themselves are bad — the Muslims regrouped and ultimately won the battle.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the Conquest of Makkah and the Battle of Hunayn are unrelated events with nothing in common. Is this accurate?`,
    correct: "No — they occurred close together in time (630 CE) and both illustrate important lessons about how the early Muslim community handled victory and setbacks",
    wrong: [
      "Yes — the two events happened decades apart with no connection",
      "Yes — one event involved the Muslims and the other did not",
      "No — but only because they both took place inside the city of Makkah itself",
    ],
    explanation: "Both events happened in close succession in 630 CE and together illustrate lessons about forgiveness at a moment of victory (Makkah) and reliance on Allah rather than numbers (Hunayn).",
  }),
];

export const conquestOfMakkah: Skill = {
  id: "g6-ire-hi-conquest-of-makkah",
  code: "HI.3",
  subjectId: "ire",
  strandId: "g6-ire-history",
  grade: 6,
  title: "The Conquest of Makkah (Fat-hul Makkah) and the Battle of Hunayn",
  description: "The Conquest of Makkah (630 CE): near-bloodless victory, the Prophet's (S.A.W.) general amnesty and removal of the idols; and the Battle of Hunayn: overconfidence, regrouping, and the lesson that true victory comes from Allah.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, MAKKAH_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the broken treaty to the Muslims' win at Hunayn.",
        items,
        correctOrder: MAKKAH_SEQUENCE.map((d) => d.id),
        hint: "It begins with the Quraysh breaking the treaty and ends with the Muslims regrouping to win at Hunayn.",
        explanation: MAKKAH_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const conquest = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "conquest")).slice(0, 3);
      const forgiveness = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "forgiveness")).slice(0, 3);
      const hunayn = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "hunayn")).slice(0, 3);
      const chosen = shuffle(rng, [...conquest, ...forgiveness, ...hunayn]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["conquest", "forgiveness", "hunayn"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about the conquest itself, some about the Prophet's (S.A.W.) forgiveness, and some about the Battle of Hunayn.",
        explanation: chosen.map((f) => `"${f.text}" — ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERM_MEANINGS).slice(0, 5);
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
        hint: "Think about what each term refers to in the story of the Conquest of Makkah and Hunayn.",
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
        hint: "Think about what the Conquest of Makkah and the Battle of Hunayn each teach about forgiveness and where true victory comes from.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Quraysh broke the terms of the", after: "treaty, leading to the conquest.", answer: "Hudaibiya", accepted: ["hudaibiya"] },
      { before: "The city of Makkah was taken with almost no", after: ".", answer: "bloodshed", accepted: ["bloodshed"] },
      { before: "The Prophet (S.A.W.) declared a general", after: "instead of taking revenge.", answer: "amnesty", accepted: ["amnesty"] },
      { before: "The idols were removed from the", after: ", restoring it to the worship of Allah alone.", answer: "Kaaba", accepted: ["kaaba"] },
      { before: "Shortly after the conquest, the Muslims faced the Hawazin and Thaqif tribes at the Battle of", after: ".", answer: "Hunayn", accepted: ["hunayn"] },
      { before: "Early", after: "from the Muslims' large numbers led to a difficult start at Hunayn.", answer: "overconfidence", accepted: ["overconfidence"] },
      { before: "The Muslims regrouped after the early setback and went on to", after: "the battle.", answer: "win", accepted: ["win"] },
      { before: "The Conquest of Makkah and the Battle of Hunayn both took place in the year", after: "CE.", answer: "630", accepted: ["630"] },
      { before: "The Qur'an references Hunayn to show that victory comes from", after: ", not numbers alone.", answer: "Allah", accepted: ["allah"] },
      { before: "Islam is presented through these events as ultimately standing for", after: ", not aggression.", answer: "peace", accepted: ["peace"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Recall the events of the Conquest of Makkah and the Battle of Hunayn.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
