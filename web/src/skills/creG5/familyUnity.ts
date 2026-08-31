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
    "each statement by whether it promotes family unity or is a challenge families face.",
    "these facts about family life under the correct heading.",
    "each fact below by whether it helps or harms family unity.",
    "each statement into the bucket for factor that promotes unity or family challenge.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term below with its correct meaning.",
    "each idea about family unity with its explanation.",
    "each term to the description that fits it.",
    "each term or verse to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about family unity.",
    "the correct missing word.",
  ],
);

// No genuine narrative sequence exists in this sub-strand's content (factors promoting unity, challenges
// families face, and the single named Bible text, Colossians 3:13-14, is a short teaching passage rather
// than a story with events to order) — `ordering` is deliberately skipped here, matching the honest-cap
// precedent already used in web/src/skills/creG6/myPurpose.ts. 4 kinds is the honest cap for this skill.

interface EventFact { text: string; kind: "promotesUnity" | "challenge" }
const EVENT_FACTS: EventFact[] = [
  { text: "Family members forgiving each other quickly when conflicts arise, as taught in Colossians 3:13", kind: "promotesUnity" },
  { text: "Family members showing love that binds everyone together, as taught in Colossians 3:14", kind: "promotesUnity" },
  { text: "Eating meals together and talking about the day's events", kind: "promotesUnity" },
  { text: "Praying together as a family", kind: "promotesUnity" },
  { text: "Sharing household chores fairly among family members", kind: "promotesUnity" },
  { text: "Listening to each other and respecting each person's opinion", kind: "promotesUnity" },
  { text: "Frequent quarrels or misunderstandings between family members", kind: "challenge" },
  { text: "Financial difficulties causing stress and tension at home", kind: "challenge" },
  { text: "Parents being away from home for long periods due to work", kind: "challenge" },
  { text: "Not spending enough time together as a family", kind: "challenge" },
  { text: "Peer pressure pulling a young person away from family activities", kind: "challenge" },
  { text: "Poor communication that lets small issues grow into bigger conflicts", kind: "challenge" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Colossians 3:13", meaning: "The verse that teaches family members to bear with each other and forgive as the Lord forgave them" },
  { term: "Colossians 3:14", meaning: "The verse that teaches love binds everything together in perfect unity" },
  { term: "Family unity", meaning: "Family members living together in love, peace, and cooperation" },
  { term: "Forgiveness at home", meaning: "Letting go of anger toward a family member instead of holding a grudge" },
  { term: "A shared family meal", meaning: "A simple daily activity that helps a family bond and communicate" },
  { term: "Doing chores without being asked", meaning: "A way a young person can contribute to a happy, unified family" },
  { term: "Respectful communication", meaning: "Listening and speaking kindly to family members, even during disagreements" },
  { term: "A family devotion or prayer time", meaning: "A shared spiritual activity that can strengthen family unity" },
  { term: "Financial hardship", meaning: "A common challenge that can create stress and tension within a family" },
  { term: "A busy work schedule", meaning: "A family challenge that can reduce the time parents and children spend together" },
  { term: "Peer pressure", meaning: "An outside influence that can pull a young person's attention and loyalty away from the family" },
  { term: "Settling a sibling quarrel quickly", meaning: "A practical way family members apply Colossians 3:13's teaching on forgiveness" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Muthoni", "Onyango", "Jebet", "Karanja", "Akinyi", "Kirui", "Wafula", "Naliaka", "Mbugua", "Chepngeno", "Odhiambo", "Wairimu"] as const;
const KENYAN_PLACES = ["Ol Kalou", "Butere", "Kangema", "Ruiru", "Sotik", "Ol Kejuado", "Tala", "Emali", "Kimilili", "Kilgoris", "Molo", "Mwatate"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads Colossians 3:13, "Bear with each other and forgive one another." A younger sibling accidentally breaks ${name(rng)}'s toy. What does this verse teach as the best response?`,
    correct: "To forgive the sibling and bear with them patiently, rather than holding a grudge",
    wrong: [
      "To refuse to speak to the sibling until they buy an identical replacement",
      "To tell every relative about the mistake to make sure the sibling feels ashamed",
      "To secretly damage something belonging to the sibling in return",
    ],
    explanation: "Colossians 3:13 directly instructs believers to bear with one another and forgive — patient forgiveness within a family, not retaliation, is the response the verse calls for.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Colossians 3:14 means by saying love "binds everything together in perfect unity." How does this apply to family life?`,
    correct: "Love is what holds a family together and makes all the other good qualities work well as a whole",
    wrong: [
      "Love is only one minor quality among many, with no real effect on unity",
      "The verse means unity is possible only without any love being shown at all",
      "\"Binds together\" means family members should never disagree about anything",
    ],
    explanation: "Colossians 3:14 pictures love as the bond that holds every other quality (patience, kindness, forgiveness) together into real unity — without love, the other qualities do not hold a family together.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s parents in ${place(rng)} both work long hours and rarely see each other or the children during the week. Which challenge to family unity does this situation best illustrate?`,
      correct: "Parents being away from home for long periods due to work, reducing time spent together as a family",
      wrong: [
        "A challenge caused entirely by the children misbehaving at home",
        "A challenge that has nothing to do with family unity at all",
        "A challenge that only affects families who never eat any meals together",
      ],
      explanation: "Long working hours that keep parents away from home is a named challenge to family unity — it reduces the shared time that helps a family bond and communicate.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices that their family has started eating dinner together every evening and talking about their day, instead of everyone eating separately in different rooms. What effect is this change likely to have on family unity?`,
    correct: "It is likely to strengthen family unity by creating regular time for the family to communicate",
    wrong: [
      "It is likely to weaken family unity, since mealtimes should always be silent",
      "It will have no effect at all on how the family relates to each other",
      "It is only helpful if the family also stops doing any chores together",
    ],
    explanation: "Sharing meals and conversation regularly is one of the concrete factors that promotes family unity — it builds the habit of communicating and being present with one another.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wants to contribute to a happier family but is unsure how, being the youngest in the household. Based on the lesson on family unity, what is one realistic way ${who} could contribute?`,
      correct: "Doing simple chores at home without being asked and helping to resolve small disagreements peacefully",
      wrong: [
        "Waiting until becoming an adult before contributing anything at all to the family",
        "Avoiding every family activity until being specifically told to join in",
        "Contributing is only possible for the oldest child in a household",
      ],
      explanation: "The lesson's outcome of taking part in simple chores and contributing to a happy family applies to every family member, including the youngest, not only older children or adults.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says financial hardship a family faces has nothing to do with family unity, since money and relationships are "completely separate things." Is this claim accurate?`,
    correct: "No — financial difficulties are a named challenge that can create real stress and tension within a family",
    wrong: [
      "Yes — money problems never affect how family members relate to each other",
      "Yes — only wealthy families ever experience challenges to their unity",
      "No — but only if the financial hardship lasts for more than a year",
    ],
    explanation: "Financial difficulties are explicitly named as a challenge families face today — money-related stress often does affect communication and relationships within a household.",
  }),
  (rng) => ({
    prompt: `Two siblings in ${place(rng)}, guided by ${name(rng)}'s example, quarrel over sharing a chore but sit down and agree on a fair rota within the same day instead of staying angry. What value from Colossians 3:13-14 does this best model?`,
    correct: "Forgiveness and love, resolving the disagreement quickly instead of letting it grow into a lasting conflict",
    wrong: [
      "Competition, since resolving an argument quickly is really about winning",
      "Indifference, since the siblings should have simply ignored each other instead",
      "Silence, since Colossians 3:13-14 teaches family members to avoid speaking about problems",
    ],
    explanation: "Colossians 3:13-14 teaches bearing with one another and forgiving, bound together by love — resolving a quarrel quickly and fairly is a direct, practical application of that teaching.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes peer pressure from friends outside the home cannot possibly be a challenge to family unity, since it "happens away from the family." Based on the lesson, is this reasoning correct?`,
      correct: "No — peer pressure is a named challenge, since it can pull a young person's attention and loyalty away from the family even though it originates outside the home",
      wrong: [
        "Yes — anything that happens outside the home can never affect family relationships",
        "Yes — peer pressure is only relevant to a person's schoolwork, not their family",
        "No — but only if the peer pressure involves something illegal",
      ],
      explanation: "The lesson names peer pressure as a real challenge to family unity, since it can draw a young person's time, attention and loyalty away from the family, even though the pressure itself comes from outside the home.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked to explain, using Colossians 3:13, why holding a grudge against a family member for a small mistake damages family unity. What is the best explanation?`,
    correct: "Colossians 3:13 calls family members to forgive, so refusing to forgive works directly against the unity the verse describes",
    wrong: [
      "Colossians 3:13 actually encourages holding grudges until a formal apology is given",
      "Holding a grudge has no connection at all to what Colossians 3:13 teaches",
      "Colossians 3:13 only applies to disagreements between people outside the family",
    ],
    explanation: "Colossians 3:13's call to \"bear with each other and forgive\" is directly undermined when a family member holds a grudge instead — forgiveness is central to the unity the verse teaches.",
  }),
  (rng) => ({
    prompt: `${name(rng)}'s family in ${place(rng)} sets aside ten minutes every evening for family prayer, even on busy days. Based on the lesson on family unity, what is the likely benefit of this habit?`,
    correct: "It strengthens family unity by giving the family a regular, shared spiritual activity",
    wrong: [
      "It has no real effect on family unity, since prayer is a private matter only",
      "It weakens family unity by taking time away from more important activities",
      "It only benefits the parents in the household, never the children",
    ],
    explanation: "A shared family devotion or prayer time is one of the concrete factors that promotes family unity, giving the whole family a regular moment of togetherness and shared purpose.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says a family with occasional disagreements can never really be described as unified. Based on the lesson, is this a fair way to think about family unity?`,
      correct: "No — the lesson teaches that unity is maintained by how a family handles disagreements, such as through forgiveness, not by having no disagreements at all",
      wrong: [
        "Yes — any family with even one disagreement has permanently lost its unity",
        "Yes — Colossians 3:13-14 promises families that never disagree about anything",
        "No — but only families with no financial challenges can ever be unified",
      ],
      explanation: "Colossians 3:13's call to \"bear with each other\" assumes disagreements will happen — real unity is shown in how a family resolves them through forgiveness and love, not in avoiding conflict entirely.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} decides to start listening more carefully to a parent's opinion during disagreements instead of talking over them. Which factor that promotes family unity does this change best reflect?`,
    correct: "Listening to each other and respecting each person's opinion",
    wrong: [
      "Avoiding every conversation with parents until the disagreement is forgotten",
      "Only listening to opinions that already match one's own view",
      "Waiting for a sibling to resolve every disagreement instead",
    ],
    explanation: "Listening and respecting each family member's opinion, even during a disagreement, is a concrete factor named in the lesson that helps promote family unity.",
  }),
];

export const familyUnity: Skill = {
  id: "g5-cre-cn-family-unity",
  code: "CN.4",
  subjectId: "cre",
  strandId: "g5-cre-creation",
  grade: 5,
  title: "Family Unity",
  description: "Factors that promote family unity, Colossians 3:13-14's teaching on forgiveness and love, common challenges families face today, and practical ways a young person can contribute to a happy family.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const promotes = shuffle(rng, EVENT_FACTS.filter((f) => f.kind === "promotesUnity")).slice(0, 4);
      const challenges = shuffle(rng, EVENT_FACTS.filter((f) => f.kind === "challenge")).slice(0, 4);
      const chosen = shuffle(rng, [...promotes, ...challenges]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "promotesUnity", label: "Promotes family unity" },
          { id: "challenge", label: "Challenge families face" },
        ],
        correctBucket,
        hint: "A factor that promotes unity builds a family up; a challenge is something that puts strain on family relationships.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "promotesUnity" ? "promotes family unity" : "a challenge families face"}.`).join(" "),
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
        hint: "Think about Colossians 3:13-14, factors that build family unity, and challenges families face.",
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
        hint: "Think about Colossians 3:13-14's teaching on forgiveness and love, and how it applies to real family situations.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Colossians 3:13 teaches family members to bear with each other and", after: "one another.", answer: "forgive", accepted: ["forgive"] },
      { before: "Colossians 3:14 teaches that love binds everything together in perfect", after: ".", answer: "unity", accepted: ["unity"] },
      { before: "Sharing meals together helps a family bond and", after: ".", answer: "communicate", accepted: ["communicate"] },
      { before: "Doing chores without being asked is one way a young person can contribute to a happy", after: ".", answer: "family", accepted: ["family"] },
      { before: "One challenge many families face today is financial", after: ", which can cause stress and tension.", answer: "hardship", accepted: ["hardship", "difficulties"] },
      { before: "Parents being away from home for long periods due to work can reduce the time a family spends", after: ".", answer: "together", accepted: ["together"] },
      { before: "Peer pressure can pull a young person's attention and loyalty away from the", after: ".", answer: "family", accepted: ["family"] },
      { before: "Poor communication can let small issues grow into bigger", after: ".", answer: "conflicts", accepted: ["conflicts", "problems"] },
      { before: "Listening to each other and respecting each person's opinion promotes family", after: ".", answer: "unity", accepted: ["unity"] },
      { before: "A family that prays together regularly is practising a shared spiritual", after: "that strengthens unity.", answer: "activity", accepted: ["activity"] },
      { before: "According to Colossians 3:13-14, the quality that binds every other good quality together is", after: ".", answer: "love", accepted: ["love"] },
      { before: "Resolving a sibling quarrel quickly, instead of holding a grudge, is a practical way to apply Colossians 3:", after: ".", answer: "13", accepted: ["13", "thirteen"] },
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
      hint: "Think about Colossians 3:13-14 and what promotes or challenges family unity.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
