import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement as a trick/cause that traps youth into substance abuse, or a strategy/value that helps avoid it.",
    "these statements into cause or prevention strategy.",
    "each statement below by whether it is a cause of substance abuse or a strategy/value that helps avoid it.",
    "each fact into the bucket for cause or prevention strategy/value.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each idea below with what it means for avoiding alcohol and drug abuse.",
    "each term about substance abuse to the explanation that fits it.",
    "each term to the explanation of why it matters for avoiding substance abuse.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about alcohol, drugs and substance abuse.",
    "the correct missing word.",
  ],
);

interface Fact {
  text: string;
  kind: "cause" | "strategy";
}

// Ephesians 5:18 (do not get drunk, instead be filled with the Spirit) and Hosea 4:11 (wine takes away
// understanding) are the two key texts named in this sub-strand.
const FACTS: Fact[] = [
  { text: "Peer pressure from friends who already use alcohol or drugs is a common trap for young people", kind: "cause" },
  { text: "Curiosity about trying something new, without understanding the danger, can lead youth into substance abuse", kind: "cause" },
  { text: "Some young people turn to alcohol or drugs to escape stress, sadness, or difficult circumstances", kind: "cause" },
  { text: "Easy availability of alcohol or drugs within a community makes abuse more likely", kind: "cause" },
  { text: "Advertising and media that glamorise drinking or drug use can trap young people", kind: "cause" },
  { text: "Idle time with no positive activities can lead a young person toward substance abuse", kind: "cause" },
  { text: "Government agencies work to fight drug trafficking and abuse in communities", kind: "strategy" },
  { text: "Christian youth groups organise activities that keep young people engaged in positive pursuits", kind: "strategy" },
  { text: "Self-efficacy means believing in one's own ability to make wise, healthy choices", kind: "strategy" },
  { text: "Assertiveness means saying no firmly to offers of alcohol or drugs", kind: "strategy" },
  { text: "Seeking help from a trusted adult or counsellor is a wise response when struggling with pressure", kind: "strategy" },
  { text: "Engaging in positive, meaningful activities instead of idle time helps prevent substance abuse", kind: "strategy" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Ephesians 5:18", meaning: "Teaches, 'Do not get drunk on wine... instead, be filled with the Spirit'" },
  { term: "Hosea 4:11", meaning: "Teaches that wine and new wine take away understanding" },
  { term: "Government agencies", meaning: "Bodies that work to fight drug trafficking and abuse in communities" },
  { term: "Self-efficacy", meaning: "Confidence in one's own ability to make wise, healthy choices" },
  { term: "Assertiveness", meaning: "Saying no firmly and clearly to offers of alcohol or drugs" },
  { term: "Substance abuse", meaning: "The harmful or excessive use of alcohol, drugs, or other substances" },
  { term: "Escapism", meaning: "Using substances to avoid dealing with stress or problems instead of facing them" },
  { term: "Drug trafficking", meaning: "The illegal trade and distribution of drugs, which government agencies work to stop" },
  { term: "Being filled with the Spirit", meaning: "Ephesians 5:18's alternative to drunkenness — being guided by God rather than controlled by substances" },
  { term: "Taking away understanding", meaning: "Hosea 4:11's warning about how alcohol can cloud a person's judgement" },
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
      prompt: `${who} in ${place(rng)} is offered alcohol at a social gathering by older classmates who insist "it's just this once." What does Ephesians 5:18 teach that is relevant here?`,
      correct: "Do not get drunk on wine, but instead be filled with the Spirit",
      wrong: [
        "Alcohol is acceptable as long as it only happens occasionally",
        "Ephesians 5:18 only applies to adults, not young people",
        "The verse says nothing about how much alcohol is acceptable",
      ],
      explanation: "Ephesians 5:18 directly instructs against drunkenness and points instead toward being filled with the Spirit — a clear, relevant teaching for resisting this kind of pressure.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Hosea 4:11 warns happens to a person who drinks wine excessively. What is the correct answer?`,
    correct: "It takes away their understanding",
    wrong: ["It always improves their decision-making", "It has no effect on how a person thinks", "It only affects a person's physical health, never their judgement"],
    explanation: "Hosea 4:11 specifically warns that wine and new wine take away understanding — clouding a person's judgement, not improving it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} feels sad and stressed after a difficult week and is tempted to use alcohol to feel better. Which cause of substance abuse does this situation illustrate?`,
      correct: "Escapism — using substances to avoid dealing with stress or difficult emotions",
      wrong: ["Easy availability, since the issue here is emotional, not access", "Peer pressure, since no other person is involved in this scenario", "Advertising, since no media influence is described here"],
      explanation: "Turning to alcohol to escape stress or sadness is a specific, named cause of substance abuse — escapism — distinct from peer pressure or advertising influence.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} firmly declines when classmates repeatedly pressure them to try drugs, walking away from the situation. Which value or life skill does this best demonstrate?`,
    correct: "Assertiveness — saying no firmly and clearly to the pressure",
    wrong: [
      "Escapism, which is a cause of substance abuse, not a value that resists it",
      "Curiosity, which can actually contribute to substance abuse",
      "Idle time, which is a risk factor rather than a helpful response",
    ],
    explanation: "Firmly and clearly declining pressure is a direct example of assertiveness — the value most needed to resist offers of alcohol or drugs.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} learns that a national government agency works to stop illegal drugs from being smuggled into and sold within communities. What is this agency's work an example of?`,
    correct: "A government measure to fight drug trafficking and abuse",
    wrong: [
      "A Christian strategy to prevent substance abuse specifically through churches",
      "An example of a cause that traps young people into substance abuse",
      "A value or life skill an individual practises personally",
    ],
    explanation: "This sub-strand's outcomes specifically call for analysing measures government agencies take against drug trafficking and abuse — this is exactly that kind of measure.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} joins a church youth group that organises sports and music activities every weekend instead of spending idle time with a group known for drinking. What strategy does this reflect?`,
      correct: "Christians using positive, engaging activities to prevent substance abuse",
      wrong: ["Escapism, since the activities are about avoiding a group", "Peer pressure, since no pressure to abuse substances is involved", "Drug trafficking, which is unrelated to this scenario"],
      explanation: "Organising positive activities to keep young people engaged is one of the strategies Christians use to prevent alcohol, drug, and substance abuse, directly named in this sub-strand.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that Ephesians 5:18's warning against drunkenness has nothing to do with drug abuse, only alcohol. Is this the best understanding of the verse's underlying principle?`,
    correct: "No — the underlying principle, being controlled by a substance instead of by God's Spirit, applies to drug abuse as well as alcohol",
    wrong: [
      "Yes — the verse only ever applies narrowly to alcohol and nothing else",
      "Yes — CRE teaches that drug abuse is a completely separate moral issue",
      "No — but the verse actually endorses moderate drug use as acceptable",
    ],
    explanation: "Ephesians 5:18's underlying principle — not being controlled by a substance, but by God's Spirit — is the reasoning CRE extends to substance abuse generally, not narrowly to alcohol alone.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that once someone starts struggling with substance pressure, there is nothing left to do but give in. What does this sub-strand's teaching on life skills say instead?`,
    correct: "Seeking help from a trusted adult or counsellor is a wise, available response, not giving in",
    wrong: [
      "CRE agrees that giving in is the only realistic option once pressure begins",
      "Seeking help is only appropriate after substance abuse has already happened",
      "Life skills only apply to preventing the very first temptation, never afterward",
    ],
    explanation: "Seeking guidance from a trusted adult or counsellor is one of the named life skills for avoiding alcohol, drugs, and substance abuse — struggling with pressure is exactly when this skill matters most.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why advertisements that make drinking look exciting and glamorous can be dangerous for young people. What is the best explanation?`,
    correct: "Because such advertising can make risky behaviour look appealing and normal, becoming a cause of substance abuse",
    wrong: [
      "Because advertisements always contain false information about products",
      "Because advertising has no real influence on how young people think or act",
      "Because such advertisements are illegal in every context",
    ],
    explanation: "Advertising and media that glamorise drinking or drug use is a named cause of substance abuse — it shapes perception, making risky behaviour seem appealing.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} believes strongly in their own ability to make wise choices, even when friends around them are pressuring them otherwise. Which value does this confidence reflect?`,
    correct: "Self-efficacy — believing in one's own ability to make wise, healthy choices",
    wrong: ["Escapism, which describes avoiding problems rather than confidence", "Drug trafficking, which is unrelated to personal confidence", "Easy availability, which describes access to substances, not personal belief"],
    explanation: "Self-efficacy is the specific value or life skill describing confidence in one's own ability to make wise choices, especially under peer pressure.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says Hosea 4:11's warning about wine "taking away understanding" is really about physical illness only, not about decision-making. Is this accurate?`,
    correct: "No — the verse specifically links wine to a loss of understanding, meaning clouded judgement, not just physical illness",
    wrong: [
      "Yes — Hosea 4:11 only discusses physical symptoms of drinking",
      "Yes — the verse never mentions understanding at all",
      "No — but the verse actually praises wine for improving judgement",
    ],
    explanation: "Hosea 4:11 says wine and new wine 'take away understanding' — a direct statement about clouded judgement and decision-making, not merely physical effects.",
  }),
];

export const alcoholDrugsSubstanceAbuse: Skill = {
  id: "g6-cre-cl-substance-abuse",
  code: "CL.4",
  subjectId: "cre",
  strandId: "g6-cre-living",
  grade: 6,
  title: "Alcohol, Drugs and Substance Abuse",
  description: "Christian teachings on the dangers of alcohol, drugs and substance abuse from Ephesians 5:18 and Hosea 4:11, causes among youth, government and Christian prevention strategies, and values to avoid it.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (Bible warnings, causes, and
    // prevention strategies, not a step-by-step process), so `ordering` is deliberately skipped — 4 kinds
    // is the honest cap here, matching the precedent in inspiredWordOfGod.ts.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const causes = shuffle(rng, FACTS.filter((f) => f.kind === "cause")).slice(0, 4);
      const strategies = shuffle(rng, FACTS.filter((f) => f.kind === "strategy")).slice(0, 4);
      const chosen = shuffle(rng, [...causes, ...strategies]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "cause", label: "Cause / trick that traps youth" },
          { id: "strategy", label: "Prevention strategy / value" },
        ],
        correctBucket,
        hint: "Peer pressure, escapism, and easy availability are causes; self-efficacy, assertiveness, and government action are prevention strategies.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "cause" ? "a cause/trick" : "a prevention strategy/value"}.`).join(" "),
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
        hint: "Think about what each term or Bible reference means for avoiding alcohol and drug abuse.",
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
        hint: "Think about Ephesians 5:18, Hosea 4:11, causes of substance abuse, and strategies/values to avoid it.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Ephesians 5:18 says, 'Do not get drunk on wine... instead be filled with the", after: ".'", answer: "Spirit", accepted: ["spirit"] },
      { before: "Hosea 4:11 warns that wine and new wine take away", after: ".", answer: "understanding", accepted: ["understanding"] },
      { before: "Peer pressure from friends who already use alcohol or drugs is a common", after: "into substance abuse.", answer: "trap", accepted: ["trap"] },
      { before: "Some young people turn to substances to escape stress, a cause known as", after: ".", answer: "escapism", accepted: ["escapism"] },
      { before: "Government agencies work to fight drug", after: "and abuse.", answer: "trafficking", accepted: ["trafficking"] },
      { before: "Believing in one's own ability to make wise, healthy choices is called self-", after: ".", answer: "efficacy", accepted: ["efficacy"] },
      { before: "Saying no firmly and clearly to offers of alcohol or drugs is called", after: ".", answer: "assertiveness", accepted: ["assertiveness"] },
      { before: "Christian youth groups organise activities to keep young people engaged in", after: "pursuits.", answer: "positive", accepted: ["positive"] },
      { before: "The harmful or excessive use of alcohol, drugs, or other substances is called substance", after: ".", answer: "abuse", accepted: ["abuse"] },
      { before: "This sub-strand's key values are responsibility, integrity, and", after: ".", answer: "respect", accepted: ["respect"] },
      { before: "Seeking help from a trusted adult or", after: "is a wise response to pressure.", answer: "counsellor", accepted: ["counsellor", "counselor"] },
      { before: "Advertising that makes drinking look exciting can", after: "young people into substance abuse.", answer: "trap", accepted: ["trap"] },
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
      hint: "Think about Ephesians 5:18, Hosea 4:11, and causes/strategies related to substance abuse.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
