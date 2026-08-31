import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const CONSEQUENCE_PROMPTS = [
  "Which of these is a genuine consequence of engaging in sex before marriage, as discussed in CRE?",
  "According to CRE's teaching, which option is a real consequence of sex before marriage?",
  "Which of these is a genuine risk of engaging in sex before marriage?",
  "Identify the genuine consequence of sex before marriage from these options.",
  "Which answer reflects a real consequence CRE teaches about sex before marriage?",
  "Choose the option that is a genuine consequence of sex before marriage.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each trait as belonging to a healthy relationship or an unhealthy relationship.",
  "Decide whether each trait belongs to a healthy or unhealthy relationship, and sort it there.",
  "Group these traits under healthy relationship or unhealthy relationship.",
  "Sort each trait below into the correct category.",
  "Place each trait into the bucket for healthy or unhealthy relationship.",
  "Read each trait and sort it under healthy or unhealthy relationship.",
];

const MATCH_PROMPTS = [
  "Match each value or Bible reference to its meaning.",
  "Pair each value or reference below with its correct meaning.",
  "Connect each value to the meaning it fits.",
  "Match each Bible reference or value to what it means.",
  "Link each value below to its correct definition.",
  "Match each value or reference to the statement that explains it.",
];

const ORDER_PROMPTS = [
  "Arrange the steps a young person should take when facing pressure or an unhealthy situation.",
  "Put these steps for facing pressure or an unhealthy situation into order.",
  "Sequence these steps for responding to pressure correctly.",
  "Arrange these steps for handling an unhealthy situation in order.",
  "Order the steps a young person should follow when facing pressure.",
  "Sort these steps into the order they should be followed when facing pressure.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about human sexuality with the right word.",
];

const HEALTHY_TRAITS = [
  "Mutual respect between both people",
  "Honesty and openness with each other",
  "Trust that is built and kept over time",
  "Encouraging each other's goals, such as doing well in school",
  "Clear, respected personal boundaries",
  "Open communication when something is wrong",
  "Shared values and mutual accountability to trusted adults",
  "Patience, without pressure to rush into anything",
] as const;

const UNHEALTHY_TRAITS = [
  "One person controlling or manipulating the other's choices",
  "Pressure to do something one is not comfortable with",
  "Extreme jealousy or possessiveness",
  "Frequent dishonesty or hidden secrets",
  "Isolating someone from their family and friends",
  "Disrespecting a clearly stated boundary",
  "A relationship kept secret out of shame or fear",
  "One person holding far more power or control than the other",
] as const;

const CONSEQUENCES = [
  "An unwanted, unplanned teenage pregnancy",
  "Exposure to sexually transmitted infections, including HIV",
  "Emotional trauma, regret, or lasting shame",
  "Disruption of education and future opportunities",
  "Strained or broken relationships with family",
  "Social stigma within the school or community",
  "Financial burden of early, unplanned parenthood",
  "Loss of trust between the young person and their guardians",
] as const;

const VALUES: { term: string; meaning: string }[] = [
  { term: "Self-control", meaning: "Mastering one's desires instead of acting on every impulse" },
  { term: "Assertiveness", meaning: "Saying no firmly and clearly to pressure from others" },
  { term: "Wise choice of friends", meaning: "Choosing companions who encourage responsible, moral behaviour" },
  { term: "Seeking guidance", meaning: "Talking openly to a trusted parent, guardian, or mentor about challenges" },
  { term: "Self-respect", meaning: "Valuing oneself enough to set and keep healthy boundaries" },
  { term: "Delayed gratification", meaning: "Choosing a wise long-term outcome over an immediate short-term desire" },
  { term: "1 Thessalonians 4:3", meaning: "Teaches that it is God's will for believers to avoid sexual immorality" },
  { term: "Philippians 4:8-9", meaning: "Encourages believers to focus their minds on what is true, noble, and pure" },
  { term: "Galatians 5:23", meaning: "Lists self-control among the fruit of the Holy Spirit" },
  { term: "Accountability", meaning: "Being answerable to trusted people for one's choices and behaviour" },
];

const OVERCOMING_STEPS = [
  { id: "s1", label: "Recognise the warning signs of pressure or an unhealthy situation early" },
  { id: "s2", label: "Say no firmly and clearly" },
  { id: "s3", label: "Remove yourself from the risky situation if possible" },
  { id: "s4", label: "Tell a trusted parent, guardian, or mentor what happened" },
  { id: "s5", label: "Seek God's strength through prayer and continue to make wise choices" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kisumu", "Eldoret", "Nakuru", "Mombasa", "Kitengela", "Thika", "Nyeri", "Kitale", "Machakos", "Meru", "Bungoma", "Kericho"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const NON_CONSEQUENCES = [
  "A guaranteed increase in the family's overall wealth",
  "Automatic improvement in school performance",
  "No effect at all on any personal relationships",
  "A guaranteed boost to future career opportunities",
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const c = randChoice(rng, CONSEQUENCES);
    return {
      prompt: randChoice(rng, CONSEQUENCE_PROMPTS),
      correct: c,
      wrong: shuffle(rng, [...NON_CONSEQUENCES]).slice(0, 3),
      explanation: `"${c}" is one of the real consequences CRE highlights — the other options describe outcomes that engaging in sex before marriage does not actually guarantee.`,
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices that a classmate's new friend keeps pressuring them to keep secrets from their parents and to spend less time with old friends. What warning sign of an unhealthy relationship does this show?`,
      correct: "Isolating someone from their family and friends",
      wrong: ["Mutual respect between both people", "Open communication when something is wrong", "Encouraging each other's goals"],
      explanation: "Pressuring someone to keep secrets from parents and cut off old friends is a classic sign of an unhealthy, controlling relationship — the opposite of healthy openness and trust.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} feels pressured by a peer group to do something they are not comfortable with, just to feel accepted. Which value would help ${name(rng)} respond wisely?`,
    correct: "Assertiveness — saying no firmly and clearly to the pressure",
    wrong: ["Delayed gratification — this is about long-term versus short-term choices, not saying no", "Accountability — accountability is about being answerable, not resisting pressure in the moment", "Self-respect — self-respect matters, but assertiveness is the value that helps say no directly"],
    explanation: "Assertiveness is the value most directly needed to firmly and clearly say no to peer pressure in the moment.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} chooses friends who encourage staying focused on schoolwork and respecting personal boundaries, rather than friends who mock those choices. Which value does this reflect?`,
      correct: "Wise choice of friends — choosing companions who encourage responsible behaviour",
      wrong: ["Self-control alone, unrelated to who one spends time with", "Delayed gratification, which is about immediate versus long-term desires", "Seeking guidance, which is about talking to trusted adults specifically"],
      explanation: "Deliberately choosing friends who encourage responsible behaviour, rather than mocking good choices, is the value of wise choice of friends.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what a healthy relationship should include, according to CRE's teaching. Which of these is correct?`,
    correct: "Mutual respect, honesty, and clear, respected boundaries",
    wrong: ["One person having complete control over the other's decisions", "Constant secrecy from parents and guardians", "Pressure to rush into physical intimacy quickly"],
    explanation: "A healthy relationship is marked by mutual respect, honesty, and boundaries that are set and genuinely respected — not control, secrecy, or pressure.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads 1 Thessalonians 4:3 and is asked what it teaches about sexual behaviour. What is the correct teaching?`,
    correct: "It is God's will for believers to avoid sexual immorality",
    wrong: ["It teaches that sexual behaviour is not a moral concern at all", "It teaches that only adults need to consider this teaching", "It teaches that avoiding sexual immorality is impossible for anyone"],
    explanation: "1 Thessalonians 4:3 directly states that it is God's will for believers to abstain from sexual immorality — a foundational teaching for CRE's guidance on this topic.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} explains that giving in to sexual pressure as a teenager can lead to serious, long-lasting consequences. Which of these is a genuine consequence discussed in CRE?`,
      correct: "Disruption of education and future opportunities",
      wrong: ["Guaranteed improvement in school performance", "Automatic strengthening of family relationships", "No effect on a young person's future plans at all"],
      explanation: "Early, unplanned pregnancy or related consequences often disrupt a young person's education and future opportunities — one of the serious consequences CRE highlights.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Philippians 4:8-9 encourages believers to focus their minds on. What is the correct answer?`,
    correct: "What is true, noble, right, pure, lovely, and admirable",
    wrong: ["Whatever feels most exciting in the moment, regardless of consequences", "Only what other people are already doing around them", "Nothing in particular, since the mind cannot be controlled"],
    explanation: "Philippians 4:8-9 calls believers to deliberately focus their thoughts on what is true, noble, right, pure, lovely, and admirable — a discipline that supports resisting harmful pressure.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} feels overwhelmed by a difficult, pressuring situation and doesn't know what to do first. According to CRE's guidance on overcoming temptation, what is the very first step?`,
    correct: "Recognising the warning signs of pressure or an unhealthy situation early",
    wrong: ["Telling a trusted adult, which comes after removing oneself from danger", "Praying for strength, which comes after the immediate danger has passed", "Saying no firmly, which comes after first recognising the danger"],
    explanation: "Recognising the warning signs early is the first step — it is what allows a young person to then say no, remove themselves from danger, and seek support.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} explains that Galatians 5:23 lists self-control as part of something specific. What is it?`,
    correct: "The fruit of the Holy Spirit",
    wrong: ["A list of Old Testament laws", "A list of consequences of sin", "A list of unhealthy relationship traits"],
    explanation: "Galatians 5:23 lists self-control as one of the fruit of the Holy Spirit — a quality that grows in a believer's life through God's Spirit, supporting responsible behaviour.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices a friend's partner becomes extremely jealous and possessive whenever the friend spends time with anyone else. What should ${name(rng)} recognise this as?`,
    correct: "A warning sign of an unhealthy relationship",
    wrong: ["A normal, healthy sign of deep affection", "A sign that has no bearing on relationship health", "A trait that always improves a relationship over time"],
    explanation: "Extreme jealousy and possessiveness are recognised warning signs of an unhealthy, controlling relationship, not signs of healthy affection.",
  }),
];

export const humanSexuality: Skill = {
  id: "g7-cre-cl-human-sexuality",
  code: "CL.1",
  subjectId: "cre",
  strandId: "g7-cre-living",
  grade: 7,
  title: "Human Sexuality",
  description: "The meaning of human sexuality for holistic development, healthy versus unhealthy relationships, consequences of sex before marriage, and values needed to avoid irresponsible sexual behaviour.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "order", "fill-blank"] as const);

    if (branch === "categorize") {
      const healthy = shuffle(rng, HEALTHY_TRAITS).slice(0, 4);
      const unhealthy = shuffle(rng, UNHEALTHY_TRAITS).slice(0, 4);
      const chosen = shuffle(rng, [...healthy.map((t) => ({ text: t, kind: "healthy" })), ...unhealthy.map((t) => ({ text: t, kind: "unhealthy" }))]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "healthy", label: "Healthy relationship" },
          { id: "unhealthy", label: "Unhealthy relationship" },
        ],
        correctBucket,
        hint: "Healthy relationships build trust and respect boundaries; unhealthy ones involve control, pressure, or secrecy.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.kind === "healthy" ? "healthy relationship" : "unhealthy relationship"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, VALUES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.term] = v.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "These values and Bible teachings help a young person make responsible, God-honouring choices.",
        explanation: chosen.map((v) => `${v.term} — ${v.meaning.toLowerCase()}.`).join(" "),
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
        hint: "Think about the difference between healthy and unhealthy relationships, and the values that support responsible choices.",
        explanation: q.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, OVERCOMING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: OVERCOMING_STEPS.map((s) => s.id),
        hint: "Start by recognising the danger and end by seeking God's strength to keep making wise choices.",
        explanation: OVERCOMING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const facts = [
      { before: "1 Thessalonians 4:3 says it is God's will for believers to avoid sexual", after: ".", answer: "immorality", accepted: ["immorality"] },
      { before: "Philippians 4:8 encourages believers to think about whatever is true, noble, right, and", after: ".", answer: "pure", accepted: ["pure"] },
      { before: "Galatians 5:23 lists self-control among the fruit of the Holy", after: ".", answer: "Spirit", accepted: ["spirit"] },
      { before: "Saying no firmly and clearly to pressure from others is the value of", after: ".", answer: "assertiveness", accepted: ["assertiveness"] },
      { before: "Mastering one's desires instead of acting on every impulse is called", after: ".", answer: "self-control", accepted: ["self-control", "self control"] },
      { before: "Choosing a wise long-term outcome over an immediate short-term desire is called delayed", after: ".", answer: "gratification", accepted: ["gratification"] },
      { before: "Talking openly to a trusted parent or guardian about challenges is called seeking", after: ".", answer: "guidance", accepted: ["guidance"] },
      { before: "One serious consequence of sex before marriage is an unwanted teenage", after: ".", answer: "pregnancy", accepted: ["pregnancy"] },
      { before: "A relationship with extreme jealousy or possessiveness is a sign of an", after: "relationship.", answer: "unhealthy", accepted: ["unhealthy"] },
      { before: "Being answerable to trusted people for one's choices and behaviour is called", after: ".", answer: "accountability", accepted: ["accountability"] },
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
      hint: "Think about healthy relationships, consequences of irresponsible behaviour, and the values that support wise choices.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
