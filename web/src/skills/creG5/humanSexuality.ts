import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

// NOTE ON SCOPE: Grade 5 (~10-11 years old). Kept strictly within the KICD design's own framing for this
// sub-strand — physical/emotional changes of adolescence, "body as temple of the Holy Spirit" (1 Corinthians
// 6:18-19), and healthy vs unhealthy boy-girl relationships. Deliberately values-and-self-respect framed, not
// biology or clinical content, matching the house style already established in creG6/humanSexuality.ts.

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement as a sign of a healthy boy-girl relationship or an unhealthy one.",
    "these statements into healthy relationship or unhealthy relationship.",
    "each statement below by whether it describes a healthy or unhealthy boy-girl relationship.",
    "each fact into the bucket for healthy or unhealthy relationship.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each idea below with what it means for respecting your body as God's temple.",
    "each term to the explanation that fits it.",
    "each term to the explanation of why it matters for responsible behaviour.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact.",
    "the correct missing word.",
  ],
);

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "these steps for how this CRE lesson on adolescence and relationships unfolds, in order.",
    "the steps of this lesson on human sexuality into their correct order.",
    "these classroom activities on adolescence and relationships into the order they happen.",
    "these steps for learning to cope with adolescence responsibly, in order.",
  ],
);

// Condensed from this sub-strand's own "Suggested Learning Experiences" bullet order (per
// SKILL-QUALITY-STANDARDS.md's "ordering" technique) — a genuine, source-given teaching sequence, not invented.
const LESSON_ORDER = [
  { id: "s1", label: "List the changes that happen in your body during adolescence" },
  { id: "s2", label: "Brainstorm ways to cope with these changes" },
  { id: "s3", label: "Read 1 Corinthians 6:18-19 and explain its lesson" },
  { id: "s4", label: "Discuss what makes a boy-girl relationship healthy or unhealthy" },
  { id: "s5", label: "Discuss how to avoid unhealthy boy-girl relationships" },
  { id: "s6", label: "Compose a poem on leading a holy life" },
] as const;

interface Fact {
  text: string;
  kind: "healthy" | "unhealthy";
}

const FACTS: Fact[] = [
  { text: "Being friends in a group, with teachers or parents aware of the friendship, is a sign of a healthy relationship", kind: "healthy" },
  { text: "Respecting each other's boundaries and never pressuring the other person is a sign of a healthy relationship", kind: "healthy" },
  { text: "Encouraging each other to focus on schoolwork and good behaviour is a sign of a healthy relationship", kind: "healthy" },
  { text: "Being open with parents or guardians about the friendship is a sign of a healthy relationship", kind: "healthy" },
  { text: "Supporting each other honestly, without secrecy or shame, is a sign of a healthy relationship", kind: "healthy" },
  { text: "Treating each other with the same respect due to a temple of the Holy Spirit is a sign of a healthy relationship", kind: "healthy" },
  { text: "Keeping the relationship a total secret from parents or guardians is a sign of an unhealthy relationship", kind: "unhealthy" },
  { text: "One person pressuring the other into physical closeness they are not comfortable with is a sign of an unhealthy relationship", kind: "unhealthy" },
  { text: "The relationship causing a drop in schoolwork or a loss of interest in other friends is a sign of an unhealthy relationship", kind: "unhealthy" },
  { text: "One person controlling who the other is allowed to talk to is a sign of an unhealthy relationship", kind: "unhealthy" },
  { text: "Feeling afraid or ashamed because of the relationship is a sign of an unhealthy relationship", kind: "unhealthy" },
  { text: "Being encouraged toward behaviour that goes against Christian teaching is a sign of an unhealthy relationship", kind: "unhealthy" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "1 Corinthians 6:18-19", meaning: "Teaches believers to flee sexual immorality because their bodies are temples of the Holy Spirit" },
  { term: "Adolescence", meaning: "The stage of life with physical and emotional changes as a young person grows toward adulthood" },
  { term: "Temple of the Holy Spirit", meaning: "The Bible's description of the body, meant to be honoured and respected, not misused" },
  { term: "Healthy boy-girl relationship", meaning: "A friendship marked by respect, openness with parents, and encouragement toward good behaviour" },
  { term: "Unhealthy boy-girl relationship", meaning: "A friendship marked by secrecy, pressure, or behaviour that leads away from Christian values" },
  { term: "Fleeing temptation", meaning: "1 Corinthians 6:18's advice to actively avoid situations that could lead to wrong choices" },
  { term: "Self-respect", meaning: "Valuing your own body and choices as belonging to God, worth protecting" },
  { term: "Trusted adult", meaning: "A parent, guardian, or mentor a young person can turn to for guidance during confusing moments" },
  { term: "Right information", meaning: "Accurate, godly guidance about the body and relationships, as opposed to misleading sources" },
  { term: "Misleading sources", meaning: "Ungodly places young people might turn to for information about growing up, which this lesson warns against" },
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
      prompt: `${who} in ${place(rng)} notices new physical and emotional changes happening as they grow older and feels confused about whether this is normal. What does CRE teach about these changes?`,
      correct: "They are a normal part of growing through adolescence, and it is healthy to talk about them with a trusted adult",
      wrong: [
        "They are a sign something is wrong that should never be discussed with anyone",
        "They only happen to some young people, not as a normal stage of growth",
        "They should be ignored completely rather than understood",
      ],
      explanation: "This sub-strand's own learning experiences include discussing the physical and emotional changes of adolescence openly — these changes are a normal part of growing up, not something to fear or hide.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what 1 Corinthians 6:18-19 calls the human body. What is the correct answer?`,
    correct: "The temple of the Holy Spirit",
    wrong: ["A temporary shell with no real value", "A source of shame that should be hidden away", "An object with no connection to one's faith"],
    explanation: "1 Corinthians 6:19 calls the body the temple of the Holy Spirit, meant to be honoured and respected as belonging to God.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is close friends with a classmate of the opposite sex, and both openly tell their parents about the friendship, encourage each other's schoolwork, and never pressure one another. What kind of relationship does this describe?`,
      correct: "A healthy boy-girl relationship, since it is respectful, open, and encourages good behaviour",
      wrong: [
        "An unhealthy relationship, since any boy-girl friendship at this age is automatically unhealthy",
        "A relationship with no connection to CRE's teaching at all",
        "An unhealthy relationship, since parents are involved",
      ],
      explanation: "Openness with parents, mutual respect, and encouraging one another toward good behaviour are exactly the marks of a healthy boy-girl relationship this sub-strand teaches.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is in a friendship that is kept a total secret from parents, and the other person controls who ${name(rng)} is allowed to talk to. What should ${name(rng)} recognise about this relationship?`,
    correct: "It shows signs of an unhealthy relationship, since secrecy and control are warning signs",
    wrong: [
      "It is a perfectly healthy relationship, since secrecy just means privacy",
      "Controlling who a friend talks to is a sign of a healthy relationship",
      "Neither secrecy nor control matter for judging a relationship's health",
    ],
    explanation: "Secrecy from parents and controlling behaviour are two of the named signs of an unhealthy boy-girl relationship — this sub-strand teaches learners to recognise and avoid such patterns.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is confused about growing up and is tempted to trust information from an unreliable online source rather than a parent or teacher. What does this sub-strand teach about such sources?`,
      correct: "Some sources of information about this age are ungodly and misleading, so it is important to seek the right information",
      wrong: [
        "Any source of information is equally trustworthy, regardless of where it comes from",
        "Only online sources can be trusted about growing up",
        "There is no need to be careful about where information comes from",
      ],
      explanation: "This sub-strand's own learning experiences include discussing why some sources of information about this age are ungodly and misleading — seeking the right information matters.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} explains that they respect their body as belonging to God and choose not to be pressured into anything uncomfortable by a friend. Which value does this best reflect?`,
    correct: "Self-respect, grounded in 1 Corinthians 6:18-19's teaching that the body is the temple of the Holy Spirit",
    wrong: [
      "Curiosity, since exploring pressure without limits is a form of curiosity",
      "Peer pressure, since resisting pressure is the same thing as peer pressure",
      "Secrecy, since keeping choices private always shows self-respect",
    ],
    explanation: "Valuing one's body as belonging to God and refusing uncomfortable pressure is self-respect — directly grounded in 1 Corinthians 6:18-19's teaching.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that once a boy-girl friendship starts causing a drop in schoolwork and pulling a person away from other friends, it does not matter as long as the two people are happy. Is this the wisest view?`,
    correct: "No — a drop in schoolwork and a loss of other friendships are named signs of an unhealthy relationship worth addressing",
    wrong: [
      "Yes — schoolwork and other friendships never matter once two people are happy",
      "Yes — CRE teaches that unhealthy relationships have no real consequences",
      "No — but only adults are ever affected by an unhealthy relationship",
    ],
    explanation: "This sub-strand names a drop in schoolwork and losing interest in other friendships as signs of an unhealthy relationship, worth noticing and addressing rather than dismissing.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} composes a poem on the need to lead a holy life as a class assignment. What idea should this poem express, based on 1 Corinthians 6:18-19?`,
    correct: "That the body deserves respect and care because it belongs to God and houses His Spirit",
    wrong: [
      "That the body has no real spiritual significance at all",
      "That leading a holy life has nothing to do with everyday choices",
      "That only adults, never young people, are called to lead a holy life",
    ],
    explanation: "1 Corinthians 6:19 teaches that the body is the temple of the Holy Spirit and should be honoured — a poem on holy living should express respect and care for the body as God-given.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} feels overwhelmed by new feelings and physical changes and worries no one else experiences this. What is the wisest, most CRE-aligned response?`,
    correct: "Recognise these changes as a normal part of adolescence and talk about them with a trusted adult",
    wrong: [
      "Keep everything hidden and never discuss it with anyone",
      "Assume something is uniquely wrong, since no one else goes through this",
      "Ignore the feelings completely and hope they disappear",
    ],
    explanation: "This sub-strand's learning experiences specifically include discussing physical and emotional changes of adolescence and how to cope with them — normalising the experience and seeking guidance is the wise response.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why this sub-strand teaches the difference between healthy and unhealthy boy-girl relationships rather than simply telling learners to avoid all friendships. What is the best reason?`,
      correct: "Because friendships themselves are normal, but recognising respectful versus harmful patterns helps a person behave responsibly",
      wrong: [
        "Because CRE actually teaches that all boy-girl friendships should be avoided completely",
        "Because the difference between healthy and unhealthy relationships does not matter",
        "Because only unhealthy relationships are worth studying in CRE",
      ],
      explanation: "This sub-strand's outcomes are about distinguishing healthy from unhealthy relationships and behaving responsibly, not about avoiding all friendship — recognising the difference is the actual goal.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what practical strategy 1 Corinthians 6:18 recommends for dealing with tempting situations. What is the verse's advice?`,
    correct: "To actively flee, or avoid, situations likely to lead toward wrong choices",
    wrong: [
      "To stay in the tempting situation and rely only on willpower",
      "To argue with anyone involved until they change their mind",
      "To ignore the situation completely without making any decision",
    ],
    explanation: "1 Corinthians 6:18 begins with the instruction to 'flee' sexual immorality — a proactive strategy of avoiding a tempting situation, not simply enduring it through willpower.",
  }),
];

export const humanSexuality: Skill = {
  id: "g5-cre-cl-human-sexuality",
  code: "CL.2",
  subjectId: "cre",
  strandId: "g5-cre-living",
  grade: 5,
  title: "Human Sexuality",
  description: "Physical and emotional changes of adolescence, the biblical teaching in 1 Corinthians 6:18-19 that the body is the temple of the Holy Spirit, and how to recognise healthy versus unhealthy boy-girl relationships.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank", "order"] as const);

    if (branch === "categorize") {
      const healthy = shuffle(rng, FACTS.filter((f) => f.kind === "healthy")).slice(0, 4);
      const unhealthy = shuffle(rng, FACTS.filter((f) => f.kind === "unhealthy")).slice(0, 4);
      const chosen = shuffle(rng, [...healthy, ...unhealthy]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "healthy", label: "Healthy relationship" },
          { id: "unhealthy", label: "Unhealthy relationship" },
        ],
        correctBucket,
        hint: "Respect, openness with parents, and encouragement toward good behaviour are healthy signs; secrecy, pressure, and control are unhealthy signs.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "healthy" ? "a healthy relationship" : "an unhealthy relationship"}.`).join(" "),
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
        hint: "Think about what each term or Bible reference means for respecting your body and making wise choices.",
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
        hint: "Think about 1 Corinthians 6:18-19 and what makes a boy-girl relationship healthy or unhealthy.",
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
        hint: "This lesson starts by listing body changes and ends with a poem on holy living.",
        explanation: LESSON_ORDER.map((s) => s.label).join(" → "),
      };
    }

    const facts = [
      { before: "1 Corinthians 6:19 calls the body the temple of the Holy", after: ".", answer: "Spirit", accepted: ["spirit"] },
      { before: "1 Corinthians 6:18 begins with the instruction to", after: "sexual immorality.", answer: "flee", accepted: ["flee"] },
      { before: "The stage of life with physical and emotional changes as a young person grows is called", after: ".", answer: "adolescence", accepted: ["adolescence"] },
      { before: "A relationship kept a total secret from parents can be a sign of an", after: "relationship.", answer: "unhealthy", accepted: ["unhealthy"] },
      { before: "A relationship marked by respect and openness with parents can be a sign of a", after: "relationship.", answer: "healthy", accepted: ["healthy"] },
      { before: "Valuing your own body as belonging to God is called self-", after: ".", answer: "respect", accepted: ["respect"] },
      { before: "Talking openly to a trusted parent or guardian about confusing changes is an example of seeking", after: ".", answer: "guidance", accepted: ["guidance"] },
      { before: "Some sources of information about growing up are ungodly and", after: ".", answer: "misleading", accepted: ["misleading"] },
      { before: "One person controlling who the other can talk to is a sign of an", after: "relationship.", answer: "unhealthy", accepted: ["unhealthy"] },
      { before: "This sub-strand's key value is", after: ".", answer: "respect", accepted: ["respect"] },
      { before: "Encouraging each other toward good behaviour and schoolwork is a sign of a", after: "relationship.", answer: "healthy", accepted: ["healthy"] },
      { before: "The key inquiry question for this lesson asks how you cope with changes in", after: ".", answer: "adolescence", accepted: ["adolescence"] },
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
      hint: "Think about 1 Corinthians 6:18-19 and healthy versus unhealthy boy-girl relationships.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
