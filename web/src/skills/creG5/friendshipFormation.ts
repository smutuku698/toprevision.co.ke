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
    "each statement about friends into wise choice or warning sign.",
    "these facts about friendship into wise choice or warning sign.",
    "each statement below by whether it is a wise choice or a warning sign of a bad friendship.",
    "each fact into the bucket for wise choice or warning sign.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term about friendship to its meaning.",
    "each idea below with what it means for choosing good friends.",
    "each term to the explanation that fits it.",
    "each term to the explanation of why it matters for friendship formation.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about friendship.",
    "the correct missing word.",
  ],
);

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "these steps for how this CRE lesson on choosing good friends unfolds, in order.",
    "the steps of this lesson on friendship formation into their correct order.",
    "these classroom activities on choosing good friends into the order they happen.",
    "these steps for learning how to choose good friends, in order.",
  ],
);

// The design's own "Suggested Learning Experiences" bullet order for 5.1 Friendship Formation is itself a
// suggested teaching sequence — condensed here per SKILL-QUALITY-STANDARDS.md's "ordering" technique, not an
// invented order.
const LESSON_ORDER = [
  { id: "s1", label: "List the qualities to look for in a good friend" },
  { id: "s2", label: "Check whether your own friends have those qualities" },
  { id: "s3", label: "Brainstorm ways to avoid negative peer influence" },
  { id: "s4", label: "Read Proverbs 22:24-25 to learn which kind of friend to avoid" },
  { id: "s5", label: "Read Proverbs 12:26 to learn the kind of friend to choose" },
  { id: "s6", label: "Write a reflection journal on how to choose good friends" },
] as const;

interface FriendFact {
  text: string;
  kind: "wise" | "warning";
}

// Proverbs 22:24-25 and Proverbs 12:26 are the two key texts named in this sub-strand.
const FRIEND_FACTS: FriendFact[] = [
  { text: "Proverbs 12:26 says the righteous choose their friends carefully", kind: "wise" },
  { text: "A good friend is honest, even when the truth is hard to say", kind: "wise" },
  { text: "A good friend encourages you toward what is right, not what is wrong", kind: "wise" },
  { text: "A trustworthy friend keeps their word and can be relied on over time", kind: "wise" },
  { text: "A good friend celebrates your successes instead of feeling jealous", kind: "wise" },
  { text: "A friend with good moral character helps you build godly habits", kind: "wise" },
  { text: "Proverbs 22:24 warns not to make friends with a hot-tempered person", kind: "warning" },
  { text: "Proverbs 22:25 warns that associating with an easily angered person can lead you to learn their ways", kind: "warning" },
  { text: "Proverbs 22:25 warns that keeping such a friend can get you 'ensnared', or trapped, in their habits", kind: "warning" },
  { text: "Proverbs 12:26 warns that the way of the wicked leads people astray", kind: "warning" },
  { text: "A friend who constantly pressures you to break rules is showing negative peer influence", kind: "warning" },
  { text: "A friend who mocks you for doing the right thing is showing negative peer influence", kind: "warning" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Proverbs 22:24-25", meaning: "Warns against making friends with a hot-tempered, easily angered person" },
  { term: "Proverbs 12:26", meaning: "Teaches that the righteous choose their friends carefully, while the way of the wicked leads people astray" },
  { term: "Hot-tempered person", meaning: "Someone who gets angry easily, whose habits Proverbs 22:24-25 warns against copying" },
  { term: "Ensnared", meaning: "Proverbs 22:25's word for getting trapped in someone else's bad habits" },
  { term: "Negative peer influence", meaning: "Pressure from friends or classmates that pushes someone toward wrong choices" },
  { term: "Moral character", meaning: "A person's honesty and goodness, shown through their everyday choices and habits" },
  { term: "Loyalty", meaning: "A good friend's quality of staying committed and dependable over time" },
  { term: "Choosing friends carefully", meaning: "Proverbs 12:26's advice for avoiding being led astray by the wrong companions" },
  { term: "Trustworthiness", meaning: "A quality of a friend who keeps their word and can be relied upon" },
  { term: "Encouragement toward good", meaning: "A quality of a good friend who pushes you toward right choices, not wrong ones" },
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
      prompt: `${who} in ${place(rng)} has a classmate who loses their temper and shouts at others over small things almost every day. After spending a term sitting near this classmate, ${who} notices they too are quicker to shout when annoyed. Which Bible teaching best explains what happened?`,
      correct: "Proverbs 22:24-25 — associating with an easily angered person can lead you to learn their ways",
      wrong: [
        "Proverbs 12:26 — the righteous choose their friends carefully (this verse is about choosing, not about copied anger)",
        "This has nothing to do with any Bible teaching on friendship",
        "Bible teaching only applies to friendships between adults, not classmates",
      ],
      explanation: "Proverbs 22:24-25 warns directly that spending time with a hot-tempered, easily angered person can lead you to learn their ways — exactly what happened here.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads Proverbs 12:26 and is asked what it says the righteous do when picking companions. What is the correct answer?`,
    correct: "They choose their friends carefully",
    wrong: [
      "They avoid making any friends at all",
      "They befriend anyone without thinking about character",
      "They let their friends choose everything for them",
    ],
    explanation: "Proverbs 12:26 says the righteous choose their friends carefully, while the way of the wicked leads them astray — carefulness, not avoidance or carelessness, is the point.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to explain, in their own words, what it means to be "ensnared" as Proverbs 22:25 warns. What is the best explanation?`,
      correct: "Getting trapped into copying someone else's bad habits without realising it at first",
      wrong: [
        "Being physically tied up by another person",
        "Winning a prize for good behaviour",
        "Making a new friend for the very first time",
      ],
      explanation: "Proverbs 22:25's warning about being 'ensnared' pictures slowly getting trapped in a hot-tempered friend's habits — a gradual, easy-to-miss danger, not a physical trap.",
    };
  },
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, led by ${name(rng)}, keeps daring each other to break school rules, calling anyone who refuses "boring." What should a classmate who values good moral character do?`,
    correct: "Refuse the pressure and seek out friends who encourage doing what is right instead",
    wrong: [
      "Join in so as not to be called boring by the group",
      "Stay silent and go along with it just this once",
      "Report the whole class without considering their own choice first",
    ],
    explanation: "Choosing friends with good moral character, per this sub-strand's outcomes, means resisting pressure to break rules and instead seeking companions who encourage right behaviour.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} has two possible friends to spend more time with: one who is honest and encourages hard work, and one who is often dishonest and mocks classmates who try hard. Based on Proverbs 12:26, which is the wiser choice, and why?`,
      correct: "The honest, encouraging friend — because Proverbs 12:26 teaches that the righteous choose their friends carefully to avoid being led astray",
      wrong: [
        "The dishonest friend, since being entertaining matters more than honesty",
        "It does not matter which friend is chosen, since friendships never affect character",
        "Neither friend matters, because Proverbs 12:26 only discusses adults",
      ],
      explanation: "Proverbs 12:26's call to choose friends carefully directly favours a companion who is honest and encourages good behaviour over one who mocks it and models dishonesty.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that as long as a friend is fun to be around, their temper or honesty does not really matter. How would Proverbs 22:24-25 respond to this view?`,
    correct: "It disagrees — the passage specifically warns against befriending a hot-tempered, easily angered person regardless of how entertaining they are",
    wrong: [
      "Proverbs 22:24-25 agrees that only entertainment value matters in a friend",
      "Proverbs 22:24-25 only discusses friendships among adults, not classmates",
      "Proverbs 22:24-25 says temper never affects a friendship in any way",
    ],
    explanation: "Proverbs 22:24-25 names a specific character trait — a hot temper — as a real reason to be cautious about a friendship, regardless of how fun that person might seem.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} keeps a reflection journal after CRE class and writes: "I will look for friends who are honest and who encourage me to do right, and I will be careful about friends who lose their temper easily." Which two Bible texts most directly support this reflection?`,
      correct: "Proverbs 12:26 and Proverbs 22:24-25",
      wrong: ["Genesis 1:27 and Exodus 20:13", "1 Corinthians 6:18-19 and Ephesians 5:18", "Psalms 49:7-8 and Proverbs 20:1"],
      explanation: "Proverbs 12:26 (choosing friends carefully) and Proverbs 22:24-25 (avoiding a hot-tempered companion) are the two key texts this sub-strand is built on — the reflection matches both directly.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why CRE teaches learners to be careful when choosing friends, rather than simply becoming friends with anyone nearby. What is the best reason?`,
    correct: "Because a companion's character genuinely shapes a person's own habits and choices over time",
    wrong: [
      "Because it is impossible to make friends with more than one person at a time",
      "Because CRE teaches that friendships never influence a person's behaviour",
      "Because being careful about friends is only necessary for adults, not children",
    ],
    explanation: "Both Proverbs 22:24-25 and Proverbs 12:26 rest on the idea that a friend's character rubs off over time — that is exactly why choosing carefully matters.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices a friend often pressures classmates to copy homework and laughs at anyone who refuses. What kind of behaviour does this best illustrate?`,
    correct: "Negative peer influence — pressure from a friend pushing others toward wrong choices",
    wrong: [
      "Loyalty, since sticking with a friend group is always loyal behaviour",
      "Trustworthiness, since the friend is consistent in their behaviour",
      "Encouragement toward good, since the friend is confident and persuasive",
    ],
    explanation: "Pressuring others toward a wrong choice, like copying homework, and mocking those who refuse is a clear example of negative peer influence, not loyalty or trustworthiness.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is choosing between joining a study group known for encouraging each other's hard work, or a group known for skipping class together. Using this sub-strand's teaching, which choice reflects good moral character, and why?`,
      correct: "The study group — because it reflects choosing companions who encourage right behaviour, matching Proverbs 12:26's teaching",
      wrong: [
        "The group that skips class, since it is more exciting",
        "Either group is equally wise, since companions never affect behaviour",
        "Neither group matters, since only family, not friends, shapes character",
      ],
      explanation: "This sub-strand's outcome of choosing friends with good moral character, grounded in Proverbs 12:26, clearly favours companions who encourage responsible behaviour over those who model bad choices.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} believes that avoiding a hot-tempered friend, as Proverbs 22:24-25 warns, means never being kind to that person at all. Is this the best understanding of the verse?`,
    correct: "No — the verse warns against close, habit-shaping friendship with such a person, not against basic kindness or respect toward them",
    wrong: [
      "Yes — the verse teaches that unkindness toward hot-tempered people is required",
      "Yes — Proverbs 22:24-25 says such people should never be spoken to again",
      "No — but the verse actually encourages copying a hot temper to fit in",
    ],
    explanation: "Proverbs 22:24-25's caution is about not forming a close companionship that could shape your own habits — it is not a call to be unkind, which would go against other CRE teaching on treating everyone with respect.",
  }),
];

export const friendshipFormation: Skill = {
  id: "g5-cre-cl-friendship",
  code: "CL.1",
  subjectId: "cre",
  strandId: "g5-cre-living",
  grade: 5,
  title: "Friendship Formation",
  description: "Qualities to look for when choosing good friends, drawn from Proverbs 22:24-25 and Proverbs 12:26, and how to avoid negative peer influence and choose friends with good moral character.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank", "order"] as const);

    if (branch === "categorize") {
      const wise = shuffle(rng, FRIEND_FACTS.filter((f) => f.kind === "wise")).slice(0, 4);
      const warning = shuffle(rng, FRIEND_FACTS.filter((f) => f.kind === "warning")).slice(0, 4);
      const chosen = shuffle(rng, [...wise, ...warning]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "wise", label: "Wise choice" },
          { id: "warning", label: "Warning sign" },
        ],
        correctBucket,
        hint: "Proverbs 12:26 praises careful, wise friend choices; Proverbs 22:24-25 warns about the dangers of a hot-tempered companion.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "wise" ? "a wise choice" : "a warning sign"}.`).join(" "),
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
        hint: "Think about what each term or Bible reference means for choosing good friends.",
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
        hint: "Think about Proverbs 22:24-25 and Proverbs 12:26, and what makes a friend wise or a warning sign.",
        explanation: q.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, LESSON_ORDER);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: LESSON_ORDER.map((s) => s.id),
        hint: "This lesson starts by listing good qualities and ends with a written reflection on choosing friends.",
        explanation: LESSON_ORDER.map((s) => s.label).join(" → "),
      };
    }

    const facts = [
      { before: "Proverbs 22:24 warns not to make friends with a", after: "person.", answer: "hot-tempered", accepted: ["hot-tempered", "hot tempered"] },
      { before: "Proverbs 22:25 warns you may learn a hot-tempered friend's", after: "and get yourself ensnared.", answer: "ways", accepted: ["ways"] },
      { before: "Proverbs 12:26 says the righteous choose their friends", after: ".", answer: "carefully", accepted: ["carefully"] },
      { before: "Proverbs 12:26 warns that the way of the wicked leads people", after: ".", answer: "astray", accepted: ["astray"] },
      { before: "Getting trapped into copying someone's bad habits is described as being", after: ".", answer: "ensnared", accepted: ["ensnared"] },
      { before: "Pressure from friends that pushes someone toward wrong choices is called negative peer", after: ".", answer: "influence", accepted: ["influence"] },
      { before: "A friend who keeps their word and can be relied on shows", after: ".", answer: "trustworthiness", accepted: ["trustworthiness", "trust"] },
      { before: "A person's honesty and goodness, shown through everyday choices, is called moral", after: ".", answer: "character", accepted: ["character"] },
      { before: "This sub-strand's values are respect and", after: ".", answer: "integrity", accepted: ["integrity"] },
      { before: "A good friend celebrates your successes instead of feeling", after: ".", answer: "jealous", accepted: ["jealous", "jealousy"] },
      { before: "A good friend encourages you toward what is", after: ", not what is wrong.", answer: "right", accepted: ["right"] },
      { before: "The key inquiry question for this lesson asks how you", after: "your friends.", answer: "choose", accepted: ["choose"] },
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
      hint: "Think about Proverbs 22:24-25 and Proverbs 12:26 on choosing good friends.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
