import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const CATEGORIZE_PROMPTS = [
  "Sort each statement as a cause of substance use, or an effect of substance use.",
  "Decide whether each statement is a cause or an effect, and sort it there.",
  "Group these statements under cause of substance use or effect of substance use.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for cause or effect.",
  "Read each statement and sort it under cause or effect of substance use.",
];

const MATCH_PROMPTS = [
  "Match each term or Bible reference to its meaning.",
  "Pair each term or reference below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each Bible reference or term to what it means.",
  "Link each term below to its correct definition.",
  "Match each term or reference to the statement that explains it.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for resisting pressure to use alcohol or drugs in the correct order.",
  "Put these steps for resisting substance-use pressure into order.",
  "Sequence these steps for resisting pressure correctly.",
  "Arrange these steps of resisting substance use in order.",
  "Order the steps for staying substance-free under pressure.",
  "Sort these steps into the order they should be followed when facing pressure.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about alcohol, drugs, and substance use with the right word.",
];

const CAUSES = [
  "Peer pressure to fit in with a group",
  "Curiosity about how a substance might feel",
  "Easy availability of alcohol or drugs in the community",
  "Using substances to escape stress or difficult emotions",
  "Growing up in a home with little parental guidance or supervision",
] as const;

const EFFECTS = [
  "Serious, lasting damage to a person's physical health",
  "Poor performance and concentration in school",
  "Increased risk of accidents or injuries while under the influence",
  "Strained or broken relationships within the family",
  "Financial strain on the family from money spent on substances",
] as const;

const TERMS: { term: string; meaning: string }[] = [
  { term: "1 Corinthians 3:17", meaning: "Warns against destroying God's temple, which believers' bodies are" },
  { term: "1 Corinthians 6:10", meaning: "Warns that drunkards will not inherit the kingdom of God" },
  { term: "Ephesians 5:18", meaning: "Instructs believers not to get drunk on wine but to be filled with the Spirit" },
  { term: "Proverbs 20:1", meaning: "Describes wine as a mocker and strong drink as a brawler" },
  { term: "Proverbs 23:29-35", meaning: "Describes the sorrow and danger of lingering over wine" },
  { term: "Isaiah 5:11", meaning: "Pronounces woe on those who rise early to run after intoxicating drinks" },
  { term: "Addiction", meaning: "A strong, often uncontrollable dependence on a substance" },
  { term: "Substance abuse", meaning: "The harmful or excessive use of alcohol, drugs, or other substances" },
  { term: "Peer pressure", meaning: "The influence of friends or a group encouraging a certain behaviour" },
  { term: "Sobriety", meaning: "The state of being free from the influence of alcohol or drugs" },
];

const RESIST_STEPS = [
  { id: "s1", label: "Recognise the situation or group pressuring you to use a substance" },
  { id: "s2", label: "Say no firmly and confidently" },
  { id: "s3", label: "Leave the tempting environment if the pressure continues" },
  { id: "s4", label: "Talk to a trusted parent, guardian, or mentor about the pressure faced" },
  { id: "s5", label: "Choose friends and activities that support a substance-free life" },
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

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is offered alcohol at a party by classmates who say "everyone is drinking." What is the most likely cause of substance use being illustrated here?`,
      correct: "Peer pressure to fit in with a group",
      wrong: ["Financial strain from an already-formed addiction", "Poor school performance caused by drug use", "Family strain from an existing substance problem"],
      explanation: "Being pressured by classmates to drink because 'everyone is doing it' is a clear example of peer pressure, one of the most common causes of substance use among youth.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} starts missing school assignments and falling asleep in class after beginning to use a substance regularly. What effect of substance use does this best illustrate?`,
    correct: "Poor performance and concentration in school",
    wrong: ["Easy availability of the substance in the community", "Curiosity about how the substance feels", "Peer pressure from a group of friends"],
    explanation: "Missing assignments and falling asleep in class are effects of substance use on schoolwork — distinct from the causes, like curiosity or availability, that lead someone to start using it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} reads Ephesians 5:18 and is asked what it instructs believers to do instead of getting drunk. What is the correct answer?`,
      correct: "Be filled with the Holy Spirit",
      wrong: ["Avoid attending any social gatherings at all", "Focus only on physical fitness instead", "Nothing — the verse gives no alternative"],
      explanation: "Ephesians 5:18 contrasts getting drunk on wine with being filled with the Holy Spirit, offering a positive alternative rather than only a prohibition.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads Proverbs 20:1 and is asked what it says about wine and strong drink. What is the correct teaching?`,
    correct: "Wine is described as a mocker, and strong drink as a brawler",
    wrong: ["Wine and strong drink are described as harmless in any amount", "The verse encourages drinking wine to celebrate every occasion", "The verse says nothing specific about wine or strong drink"],
    explanation: "Proverbs 20:1 specifically describes wine as a mocker and strong drink as a brawler, warning that whoever is led astray by them is not wise.",
  }),
  (rng) => ({
    prompt: `${name(rng)}'s family in ${place(rng)} struggles financially because a family member spends most of their income on alcohol. What effect of substance use is this?`,
    correct: "Financial strain on the family from money spent on substances",
    wrong: ["Peer pressure affecting the family member's choices", "Curiosity about how the substance feels", "Easy availability of the substance in the neighbourhood"],
    explanation: "Money being consistently diverted to alcohol, straining the household budget, is a direct effect of substance use on the family — not a cause of it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is pressured at a social gathering to try a drug but firmly says no and later tells a trusted mentor about the pressure faced. According to CRE's guidance on resisting substance use, what should ${who} do first when facing such pressure in the future?`,
      correct: "Recognise the situation or group applying the pressure early",
      wrong: ["Wait until after using the substance to think about it", "Assume nothing can be done to avoid the pressure", "Immediately tell a mentor before recognising any pressure exists"],
      explanation: "Recognising the pressuring situation early is the first step, allowing a person to then say no, leave if needed, and seek support — in that order.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what 1 Corinthians 3:17 warns against, in relation to substance use. What is the correct teaching?`,
    correct: "Destroying God's temple, which believers' own bodies are",
    wrong: ["Destroying property belonging to someone else", "A warning that applies only to church buildings", "A teaching unrelated to how a person treats their own body"],
    explanation: "1 Corinthians 3:17 warns against destroying God's temple — understood in context as a warning about how believers treat their own bodies, which substance abuse can seriously harm.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} explains why growing up with little parental guidance can be a cause of substance use among youth. What is the best explanation?`,
    correct: "Without guidance, young people may lack the support and boundaries that help them make wise choices",
    wrong: ["Parental guidance has no real effect on a young person's choices", "Substance use only ever happens in homes with strong parental guidance", "Parental guidance is only relevant to very young children, not teenagers"],
    explanation: "A lack of parental guidance can leave young people without the support and boundaries that help them resist pressure and make wise choices, making it a genuine risk factor.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what 1 Corinthians 6:10 warns about regarding drunkenness. What is the correct teaching?`,
    correct: "That drunkards will not inherit the kingdom of God",
    wrong: ["That drunkenness has no spiritual consequence at all", "That only certain professions are affected by this warning", "That the verse only applies to alcohol, never to other substances"],
    explanation: "1 Corinthians 6:10 lists drunkards among those who will not inherit the kingdom of God, underlining the seriousness of the warning against substance abuse.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} decides to spend free time in sports and church youth activities instead of idle time that could lead to substance use. Which step in resisting substance use does this best reflect?`,
    correct: "Choosing friends and activities that support a substance-free life",
    wrong: ["Recognising a specific pressuring situation as it happens", "Leaving a tempting environment already in progress", "Talking to a mentor about pressure already experienced"],
    explanation: "Proactively choosing activities and friends that support a substance-free life is a preventive step, distinct from reacting to pressure once it is already happening.",
  }),
];

export const alcoholDrugsSubstanceUse: Skill = {
  id: "g7-cre-cl-alcohol-drugs-substance-use",
  code: "CL.3",
  subjectId: "cre",
  strandId: "g7-cre-living",
  grade: 7,
  title: "Alcohol, Drugs and Substance Use",
  description: "Causes and effects of alcohol, drug, and substance use among youth in Kenya, biblical teachings on the subject, and values and life skills needed to stay free from it.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "order", "fill-blank"] as const);

    if (branch === "categorize") {
      const causes = shuffle(rng, CAUSES).slice(0, 4);
      const effects = shuffle(rng, EFFECTS).slice(0, 4);
      const chosen = shuffle(rng, [...causes.map((t) => ({ text: t, kind: "cause" })), ...effects.map((t) => ({ text: t, kind: "effect" }))]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "cause", label: "A cause of substance use" },
          { id: "effect", label: "An effect of substance use" },
        ],
        correctBucket,
        hint: "Causes are reasons a person starts using a substance; effects are the results of that use.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.kind === "cause" ? "a cause of substance use" : "an effect of substance use"}.`).join(" "),
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
        hint: "Think about the Bible's teachings on alcohol and drunkenness, and the terms used to describe substance use.",
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
        hint: "Think about the causes and effects of substance use, and the Bible's teaching on it.",
        explanation: q.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, RESIST_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: RESIST_STEPS.map((s) => s.id),
        hint: "Start by recognising the pressure and end by choosing substance-free friends and activities going forward.",
        explanation: RESIST_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const facts = [
      { before: "Ephesians 5:18 says believers should not get drunk on wine, but should be filled with the", after: ".", answer: "Spirit", accepted: ["spirit"] },
      { before: "Proverbs 20:1 describes wine as a", after: "and strong drink as a brawler.", answer: "mocker", accepted: ["mocker"] },
      { before: "1 Corinthians 6:10 warns that drunkards will not inherit the kingdom of", after: ".", answer: "God", accepted: ["god"] },
      { before: "1 Corinthians 3:17 warns against destroying God's", after: ", which believers' bodies are.", answer: "temple", accepted: ["temple"] },
      { before: "Isaiah 5:11 pronounces woe on those who rise early to run after intoxicating", after: ".", answer: "drinks", accepted: ["drinks"] },
      { before: "A strong, often uncontrollable dependence on a substance is called", after: ".", answer: "addiction", accepted: ["addiction"] },
      { before: "The harmful or excessive use of alcohol, drugs, or other substances is called substance", after: ".", answer: "abuse", accepted: ["abuse"] },
      { before: "The influence of friends or a group encouraging a certain behaviour is called peer", after: ".", answer: "pressure", accepted: ["pressure"] },
      { before: "The state of being free from the influence of alcohol or drugs is called", after: ".", answer: "sobriety", accepted: ["sobriety"] },
      { before: "One common effect of substance use on a young person's education is poor school", after: ".", answer: "performance", accepted: ["performance"] },
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
      hint: "Think about the causes, effects, and Bible teachings on alcohol, drugs, and substance use.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
