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

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the sacredness of life or about protecting the right to life.",
    "these facts about sanctity of life under the correct bucket.",
    "each fact below by which idea it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the sanctity of life with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the sanctity of life.",
    "the correct missing word.",
  ],
);

interface LifeFact { text: string; group: "sacred" | "protect" }
const LIFE_FACTS: LifeFact[] = [
  { text: "Genesis 1:27 says God created human beings in his own image", group: "sacred" },
  { text: "Genesis 9:6 teaches that human life is sacred because people are made in God's image", group: "sacred" },
  { text: "Psalms 49:7-8 shows that no amount of money can buy back a human life", group: "sacred" },
  { text: "Life is described as a gift from God, not something a person creates for themselves", group: "sacred" },
  { text: "Every human life has value and dignity because God created it", group: "sacred" },
  { text: "Exodus 20:13 commands \"You shall not murder\"", group: "protect" },
  { text: "Coping with difficult emotions in healthy ways helps prevent harm to oneself or others", group: "protect" },
  { text: "Talking to a trusted adult about strong negative emotions is a way to protect life", group: "protect" },
  { text: "Encouraging classmates to respect each other's right to life builds a safer community", group: "protect" },
  { text: "Bullying and violence are examples of actions that threaten the right to life", group: "protect" },
  { text: "Understanding the causes of violence helps a community prevent it", group: "protect" },
  { text: "Respecting the sanctity of life means valuing every person's safety and wellbeing", group: "protect" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Sanctity of life", meaning: "The belief that human life is sacred and precious because it comes from God" },
  { term: "Genesis 1:27", meaning: "The verse teaching that God created human beings in his own image" },
  { term: "Genesis 9:6", meaning: "The verse connecting the sacredness of human life to being made in God's image" },
  { term: "Psalms 49:7-8", meaning: "The passage teaching that no amount of money can redeem a human life" },
  { term: "Exodus 20:13", meaning: "The commandment that says \"You shall not murder\"" },
  { term: "Right to life", meaning: "Every person's basic right to live safely, which this lesson teaches learners to respect" },
  { term: "Difficult emotions", meaning: "Strong feelings, such as anger or despair, that this lesson teaches healthy ways to cope with" },
  { term: "Violation of the right to life", meaning: "Actions, such as violence, that threaten or take away someone's safety or life" },
  { term: "Gift from God", meaning: "How this lesson describes human life, emphasising it is not created by a person alone" },
  { term: "Human dignity", meaning: "The value and worth every person has because they are made in God's image" },
  { term: "Coping strategies", meaning: "Healthy ways of managing difficult emotions to avoid violation of the right to life" },
  { term: "Respect for life", meaning: "The value this lesson encourages learners to practise and encourage among classmates" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Otieno", "Wanjiru", "Kiplangat", "Nafula", "Barasa", "Chebet", "Mutuku", "Njoroge", "Amondi", "Kiplagat", "Achieng", "Simiyu"] as const;
const KENYAN_PLACES = ["Kitui", "Mumias", "Litein", "Kajiado", "Homa Bay", "Nyeri", "Isiolo", "Kilifi", "Kabarnet", "Rongo", "Turkana", "Vihiga"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} feels overwhelmed by strong anger after a serious disagreement with a friend. Based on this lesson, what is a healthy response to this difficult emotion?`,
    correct: "Talk to a trusted adult about the feelings and find a safe way to cope, rather than letting the anger lead to harmful actions",
    wrong: [
      "Bottle up the anger completely and never mention it to anyone",
      "Act on the anger immediately without thinking about the consequences",
      "This lesson has no guidance about handling strong emotions like anger",
    ],
    explanation: "This lesson teaches ways to cope with difficult emotions in order to avoid violating the right to life — talking to a trusted adult is a healthy coping strategy.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} witnesses a classmate being physically bullied by others. Based on the sanctity of life, why is this behaviour especially serious?`,
      correct: "Bullying threatens another person's safety and dignity, both of which the sanctity of life teaches must be respected because every person is made in God's image",
      wrong: [
        "Bullying is not connected to the value of a person's life at all",
        "Only very extreme violence, not everyday bullying, has any connection to sanctity of life",
        "The sanctity of life only concerns unborn or very young children",
      ],
      explanation: "Because life is sacred and every person is made in God's image, actions like bullying that threaten someone's safety and dignity are especially serious.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads Psalms 49:7-8, which says no one can redeem another's life or give God a ransom for it. What does this passage teach about the value of a human life?`,
    correct: "A human life has a value beyond any amount of money, showing how precious life truly is",
    wrong: [
      "The passage teaches that human life can always be bought back with enough money",
      "The passage has no real connection to the value of human life",
      "It teaches that only wealthy people's lives have real value",
    ],
    explanation: "Psalms 49:7-8 teaches that no amount of money can redeem a life, emphasising that human life has a value beyond any price.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why Genesis 1:27 is important to this lesson's teaching on sanctity of life. What connection does the verse provide?`,
      correct: "It shows that human beings are made in God's image, which is the basis for why human life is considered sacred",
      wrong: [
        "Genesis 1:27 is about the creation of animals, not human beings",
        "The verse has no connection to the value of human life at all",
        "It teaches that only some human beings are made in God's image",
      ],
      explanation: "Genesis 1:27's teaching that human beings are made in God's image is the foundational reason this lesson gives for why human life is sacred.",
    };
  },
  (rng) => ({
    prompt: `A class discussion in ${place(rng)}, led by ${name(rng)}, is planning ways to encourage classmates to respect the right to life. Which idea best reflects this lesson's teaching?`,
    correct: "Teach and model kindness, non-violence, and healthy ways of handling conflict and strong emotions",
    wrong: [
      "Encourage classmates to solve every disagreement using physical force",
      "This lesson provides no practical ideas for encouraging respect for life",
      "Focus only on punishing wrongdoing, without teaching healthy coping skills",
    ],
    explanation: "The lesson's outcome is encouraging classmates to respect the right to life — kindness, non-violence, and healthy emotional coping directly reflect this teaching.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes that Exodus 20:13's command not to murder only applies to extreme criminal situations, with no relevance to everyday school life. Is this the full picture this lesson teaches?`,
      correct: "No — the lesson connects the underlying value, respecting others' safety and life, to everyday choices like avoiding violence and bullying",
      wrong: [
        "Yes — the commandment has no connection to everyday behaviour at all",
        "Yes — only adults, never learners, need to consider this commandment",
        "No — but the commandment is actually unrelated to respecting others' safety",
      ],
      explanation: "While Exodus 20:13 addresses the extreme case, this lesson connects its underlying value — respecting others' life and safety — to everyday choices like avoiding violence and bullying.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wonders why this lesson pairs teaching about the sanctity of life with teaching about coping with difficult emotions. What is the connection?`,
    correct: "Difficult emotions, if not handled well, can sometimes lead to actions that violate the right to life, so healthy coping helps protect life",
    wrong: [
      "There is no real connection between emotions and respecting the right to life",
      "The lesson pairs these topics randomly with no underlying reason",
      "Coping with emotions is only relevant to adults, not to protecting anyone's life",
    ],
    explanation: "This lesson connects healthy coping with difficult emotions directly to protecting the right to life, since unmanaged strong emotions can sometimes lead to harmful actions.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says that because life is described as a "gift from God," a person has no responsibility to protect their own safety, since God will handle everything. Is this the lesson's intended teaching?`,
    correct: "No — recognising life as a gift from God is meant to inspire valuing and protecting life, both one's own and others', not avoiding personal responsibility",
    wrong: [
      "Yes — the lesson teaches that personal safety choices do not matter at all",
      "Yes — the idea of life as a gift removes any need for coping skills or care",
      "No — but the lesson actually discourages valuing life as a gift from God",
    ],
    explanation: "Recognising life as a sacred gift from God is meant to inspire valuing and actively protecting life — both one's own and others' — not to remove personal responsibility.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is composing a poem on the sacredness of life, as this lesson suggests. Which idea would best fit the poem's theme?`,
      correct: "Every person's life has great value and dignity because it comes from God, and deserves to be respected and protected",
      wrong: [
        "A poem suggesting some lives matter more than others based on wealth",
        "A poem discouraging any care for other people's safety",
        "This lesson gives no guidance on themes for such a poem",
      ],
      explanation: "This lesson's own suggested activity is composing a poem on the sacredness of life — valuing every person's God-given life and dignity best fits this theme.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks how encouraging classmates to respect the right to life, as this lesson's key inquiry question suggests, could look in daily school life. What is a fitting example?`,
    correct: "Speaking up against bullying and encouraging peaceful, respectful ways of resolving disagreements among classmates",
    wrong: [
      "Avoiding any involvement whenever a classmate is being treated unfairly",
      "This lesson provides no example relevant to daily school situations",
      "Only teachers, never fellow learners, can encourage respect for life",
    ],
    explanation: "The lesson's key inquiry question asks how to encourage classmates to respect the right to life — speaking up against bullying is a direct, practical example.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} debates whether discussing the causes of violation of the right to life is too serious a topic for their age group. How does this lesson's own content address that concern?`,
      correct: "The lesson is specifically designed for this age group to understand causes of violence and to learn healthy, age-appropriate ways to respond and cope",
      wrong: [
        "This lesson avoids the topic of violence entirely, focusing only on unrelated ideas",
        "The lesson teaches that young learners should never discuss safety topics",
        "The topic is presented without any guidance on healthy coping",
      ],
      explanation: "This lesson's own outcomes include identifying causes of violation of the right to life and explaining how to cope with difficult emotions, designed specifically for this age group.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} concludes that sanctity of life only concerns dramatic events, never everyday attitudes or choices. Is this a complete understanding of the lesson?`,
    correct: "No — the lesson connects sanctity of life to everyday attitudes like kindness, respect, and healthy emotional coping, not only dramatic events",
    wrong: [
      "Yes — the lesson focuses entirely on rare, dramatic events only",
      "Yes — everyday attitudes have no bearing on the sanctity of life",
      "No — but the lesson actually discourages connecting sanctity of life to daily choices",
    ],
    explanation: "This lesson connects the sanctity of life to everyday attitudes and choices — kindness, respect, and healthy coping — not only to rare, dramatic events.",
  }),
];

export const sanctityOfLife: Skill = {
  id: "g5-cre-cl-sanctity-of-life",
  code: "CL.3",
  subjectId: "cre",
  strandId: "g5-cre-living",
  grade: 5,
  title: "Sanctity of Life",
  description: "Christian teaching on God as the source of life and the sacredness of human life (Genesis 1:27, Genesis 9:6, Psalms 49:7-8, Exodus 20:13), causes of violation of the right to life, and healthy ways to cope with difficult emotions.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (Christian teachings and values, not a
    // story with events), so "ordering" is deliberately skipped — 4 kinds is the honest cap here.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const sacred = shuffle(rng, LIFE_FACTS.filter((f) => f.group === "sacred")).slice(0, 4);
      const protect = shuffle(rng, LIFE_FACTS.filter((f) => f.group === "protect")).slice(0, 4);
      const chosen = shuffle(rng, [...sacred, ...protect]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "sacred", label: "Life is sacred, given by God" },
          { id: "protect", label: "Protecting the right to life" },
        ],
        correctBucket,
        hint: "The sacred bucket is about why life has value; the protect bucket is about keeping people safe.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "sacred" ? "life is sacred, given by God" : "protecting the right to life"}.`).join(" "),
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
        hint: "Think about what the Bible teaches about life's value, and how to protect the right to life.",
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
        hint: "Think about why life is sacred and how difficult emotions should be handled safely.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Genesis 1:27 says God created human beings in his own", after: ".", answer: "image", accepted: ["image"] },
      { before: "Genesis 9:6 connects the sacredness of life to being made in God's", after: ".", answer: "image", accepted: ["image"] },
      { before: "Psalms 49:7-8 teaches that no amount of money can redeem a human", after: ".", answer: "life", accepted: ["life"] },
      { before: "Exodus 20:13 commands, \"You shall not", after: ".\"", answer: "murder", accepted: ["murder"] },
      { before: "Human life is described in this lesson as a", after: "from God.", answer: "gift", accepted: ["gift"] },
      { before: "Coping with difficult", after: "in healthy ways helps protect life.", answer: "emotions", accepted: ["emotions"] },
      { before: "Talking to a trusted adult is a healthy way to cope with", after: ".", answer: "anger", accepted: ["anger"] },
      { before: "This lesson teaches learners to encourage classmates to respect the right to", after: ".", answer: "life", accepted: ["life"] },
      { before: "Every human life has value and", after: "because God created it.", answer: "dignity", accepted: ["dignity"] },
      { before: "This lesson's key inquiry question asks why human life is", after: ".", answer: "sacred", accepted: ["sacred"] },
      { before: "Understanding causes of violence helps a community prevent", after: ".", answer: "harm", accepted: ["harm"] },
      { before: "Bullying is one example of an action that threatens someone's right to", after: ".", answer: "life", accepted: ["life"] },
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
      hint: "Think about Genesis 1:27, Genesis 9:6, Psalms 49:7-8 and Exodus 20:13, and why life is sacred.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
