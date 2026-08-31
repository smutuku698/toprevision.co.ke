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
    "each statement by whether it is about causes/effects or about avoiding substance abuse.",
    "these facts about alcohol, drugs and substance abuse under the correct bucket.",
    "each fact below by which idea it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about substance abuse with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
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

interface AbuseFact { text: string; group: "causes" | "avoiding" }
const ABUSE_FACTS: AbuseFact[] = [
  { text: "Proverbs 20:1 warns that wine is a mocker and strong drink leads to brawling", group: "causes" },
  { text: "Proverbs 31:6 mentions strong drink for someone in deep distress", group: "causes" },
  { text: "Ephesians 5:18 warns against being drunk with wine, which leads to reckless living", group: "causes" },
  { text: "Peer pressure is a common reason young people try alcohol or drugs", group: "causes" },
  { text: "Curiosity about how a substance feels can lead someone to first try it", group: "causes" },
  { text: "Alcohol and drugs can seriously harm a young person's physical and mental health", group: "causes" },
  { text: "Being clear about personal values helps a young person resist pressure to try drugs", group: "avoiding" },
  { text: "Choosing friends who do not use alcohol or drugs supports a healthy lifestyle", group: "avoiding" },
  { text: "Talking to a trusted adult about pressure to use substances is a wise, protective step", group: "avoiding" },
  { text: "Writing sensitisation messages helps spread awareness about avoiding substance abuse", group: "avoiding" },
  { text: "Understanding Ephesians 5:18's warning helps a Christian choose self-control instead", group: "avoiding" },
  { text: "Practising the value of integrity helps someone avoid substances even under pressure", group: "avoiding" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Proverbs 20:1", meaning: "The verse warning that wine is a mocker and strong drink leads to brawling" },
  { term: "Proverbs 31:6", meaning: "The verse mentioning strong drink given to someone in deep distress" },
  { term: "Ephesians 5:18", meaning: "The verse warning against being drunk with wine, which leads to reckless living" },
  { term: "Substance abuse", meaning: "The harmful use of alcohol, drugs, or other substances" },
  { term: "Peer pressure", meaning: "The influence from friends or classmates that can lead a young person to try alcohol or drugs" },
  { term: "Self-control", meaning: "The value of managing one's own choices wisely, which helps resist substance abuse" },
  { term: "Sensitisation messages", meaning: "Written messages that raise awareness, such as saying no to alcohol, drugs and substance abuse" },
  { term: "Integrity", meaning: "The value of doing what is right, even without being watched, which helps a person avoid substance abuse" },
  { term: "Effects of substance abuse", meaning: "Harm to physical and mental health, family relationships, and school performance" },
  { term: "Trusted adult", meaning: "A parent, teacher, or guardian a young person can talk to about pressure to use substances" },
  { term: "Health education", meaning: "Learning about the causes, effects, and prevention of alcohol, drugs and substance abuse" },
  { term: "Reckless living", meaning: "The kind of behaviour Ephesians 5:18 warns can result from being drunk" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Kimutai", "Adhiambo", "Wanjala", "Cherotich", "Odera", "Njeri", "Bosire", "Nafula", "Mutiso", "Wangari", "Kiplangat", "Achieng"] as const;
const KENYAN_PLACES = ["Kericho", "Bungoma", "Nakuru", "Wajir", "Machakos", "Lodwar", "Kisii", "Thika", "Mumias", "Kajiado", "Kwale", "Nyeri"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is offered alcohol at a family celebration by an older cousin who says "just try a little, it's fine." Based on this lesson, what is the wisest response?`,
    correct: "Politely refuse, remembering the biblical warnings and health risks of alcohol for a young person",
    wrong: [
      "Accept it quietly since it is only offered once at a celebration",
      "This lesson has no guidance relevant to a family setting",
      "Accept it, but only if no other classmates find out",
    ],
    explanation: "This lesson teaches identifying values needed to avoid alcohol, drugs and substance abuse — politely refusing, even at a family event, reflects that value.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices a classmate is being pressured by peers to try drugs to "fit in." What value from this lesson could help the classmate resist?`,
      correct: "Self-control and integrity — sticking to what is right even when a group is pressuring otherwise",
      wrong: [
        "Trying the drugs once is fine as long as the classmate stops afterward",
        "This lesson provides no values relevant to resisting peer pressure",
        "Only isolating oneself from all friends can resist this kind of pressure",
      ],
      explanation: "This lesson identifies self-control and integrity among the values needed to avoid alcohol, drugs and substance abuse, especially under peer pressure.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads Ephesians 5:18's warning against being drunk with wine, which leads to "reckless living." What does this phrase suggest about the effects of alcohol abuse?`,
    correct: "Alcohol abuse can lead to poor decisions and dangerous, careless behaviour",
    wrong: [
      "The phrase suggests alcohol has no real effect on a person's decisions",
      "\"Reckless living\" refers only to financial carelessness, unrelated to alcohol",
      "The verse teaches that reckless living is unrelated to substance use",
    ],
    explanation: "Ephesians 5:18 directly connects being drunk with 'reckless living,' warning that alcohol abuse can lead to poor, careless decisions.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to help design a sensitisation poster for the school notice board, as this lesson suggests. Which message best fits the lesson's teaching?`,
      correct: "A clear, encouraging \"Say No!\" message about alcohol, drugs and substance abuse, along with a positive value like self-control",
      wrong: [
        "A poster suggesting substance use is acceptable in small amounts",
        "A poster with no connection to the topic of substance abuse at all",
        "A poster mocking learners who might struggle with peer pressure",
      ],
      explanation: "This lesson's own suggested activity is writing sensitisation messages saying 'No!' to alcohol, drugs and substance abuse, displayed on the school notice board.",
    };
  },
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, guided by ${name(rng)}, discusses reasons why young people might start using drugs. Which reason does this lesson specifically identify?`,
    correct: "Peer pressure and curiosity are common reasons young people engage in alcohol, drugs and substance abuse",
    wrong: [
      "This lesson teaches that no real reasons exist for substance abuse among young people",
      "Only financial wealth is ever a cause of substance abuse, according to this lesson",
      "This lesson focuses only on adults, never on reasons affecting young people",
    ],
    explanation: "This lesson's outcome is stating why young people engage in alcohol, drugs and substance abuse today — peer pressure and curiosity are commonly identified causes.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes that giving a brief talk at school assembly about the dangers of substance abuse, as this lesson suggests, would have no real impact. Is this a fair conclusion?`,
      correct: "No — sharing accurate information and encouragement with peers can meaningfully raise awareness and support healthy choices",
      wrong: [
        "Yes — talks and awareness campaigns never have any positive effect",
        "Yes — only laws, never peer conversations, can prevent substance abuse",
        "No — but only teachers, never learners, should ever give such talks",
      ],
      explanation: "This lesson's own suggested activity is giving a brief talk at assembly on the effects of substance abuse, showing peer-to-peer awareness is considered valuable.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} points out that Proverbs 20:1 and Proverbs 31:6 both mention drinking, but in different contexts. What do these two verses have in common in this lesson's teaching?`,
    correct: "Both are used as biblical warnings about the dangers and negative effects connected to alcohol misuse",
    wrong: [
      "The two verses actually encourage drinking as a positive practice",
      "The verses have no real connection to each other or to this lesson's topic",
      "Only one of the two verses has any connection to alcohol at all",
    ],
    explanation: "Both Proverbs 20:1 and Proverbs 31:6 are used in this lesson as biblical texts warning about the dangers connected to alcohol misuse.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says that once someone tries alcohol or drugs once out of curiosity, there is no way to make a better choice going forward. Does this lesson support that belief?`,
    correct: "No — the lesson emphasises identifying values and choices that help a person avoid or move away from alcohol, drugs and substance abuse at any point",
    wrong: [
      "Yes — the lesson teaches that one mistake makes future healthy choices impossible",
      "Yes — trying a substance once removes any ability to choose differently later",
      "No — but this lesson only applies to people who have never tried any substance",
    ],
    explanation: "This lesson's outcome is about identifying values needed to avoid alcohol, drugs and substance abuse — supporting the idea that a person can always choose a healthier path.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is deciding whether to report to a teacher that classmates are being pressured into trying drugs behind the school. What does this lesson suggest about taking this step?`,
      correct: "Reporting to a trusted adult is a responsible, protective action that can help prevent harm from substance abuse",
      wrong: [
        "Reporting the situation would be against the values this lesson teaches",
        "This lesson discourages ever involving a trusted adult in such situations",
        "Only ignoring the situation entirely reflects good values, according to this lesson",
      ],
      explanation: "This lesson connects healthy, protective choices with trusted adults — reporting concerning pressure to a teacher reflects the responsibility this lesson encourages.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why this lesson pairs biblical texts about alcohol with a broader discussion of values like integrity and responsibility. What is the connection?`,
    correct: "The biblical warnings provide the reasoning, while the values give practical strength for actually making the choice to avoid substance abuse",
    wrong: [
      "The biblical texts and the values discussion are entirely unrelated topics",
      "Only the biblical texts matter, and the values discussion is unnecessary",
      "Only the values discussion matters, and the biblical texts add nothing",
    ],
    explanation: "This lesson connects biblical warnings about alcohol with practical values like integrity and self-control, giving both the reasoning and the strength to avoid substance abuse.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wonders whether this lesson's focus on alcohol and drugs applies only to adults who can legally buy alcohol. What does the lesson's framing suggest?`,
      correct: "This lesson is specifically framed for young people, addressing the reasons they might engage in substance abuse and how to avoid it",
      wrong: [
        "The lesson only concerns adults and has no relevance to young learners",
        "This lesson only discusses substances that are entirely legal for anyone to buy",
        "There is no age-specific framing in this lesson at all",
      ],
      explanation: "This lesson's outcomes specifically address why young people engage in substance abuse and how they can avoid it, making it directly relevant to learners.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} concludes that avoiding alcohol, drugs and substance abuse is only about following rules, with no connection to personal wellbeing. Is this the full picture this lesson teaches?`,
    correct: "No — the lesson connects avoiding substance abuse to protecting one's own physical and mental health and wellbeing, not just following external rules",
    wrong: [
      "Yes — the lesson is only concerned with following rules, not personal wellbeing",
      "Yes — physical and mental health have no connection to this lesson's topic",
      "No — but the lesson actually discourages any concern for personal wellbeing",
    ],
    explanation: "This lesson's outcomes include outlining the effects of substance abuse, connecting the topic directly to protecting a person's physical and mental wellbeing.",
  }),
];

export const alcoholDrugsSubstanceAbuse: Skill = {
  id: "g5-cre-cl-substance-abuse",
  code: "CL.4",
  subjectId: "cre",
  strandId: "g5-cre-living",
  grade: 5,
  title: "Alcohol, Drugs and Substance Abuse",
  description: "Biblical teaching against substance abuse (Proverbs 20:1, Proverbs 31:6, Ephesians 5:18), causes and effects of alcohol, drugs and substance abuse among young people, and values needed to avoid it.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (causes, effects and values, not a
    // story with events), so "ordering" is deliberately skipped — 4 kinds is the honest cap here.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const causes = shuffle(rng, ABUSE_FACTS.filter((f) => f.group === "causes")).slice(0, 4);
      const avoiding = shuffle(rng, ABUSE_FACTS.filter((f) => f.group === "avoiding")).slice(0, 4);
      const chosen = shuffle(rng, [...causes, ...avoiding]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "causes", label: "Causes and warnings" },
          { id: "avoiding", label: "Values and ways to avoid abuse" },
        ],
        correctBucket,
        hint: "The causes bucket is about why abuse happens or its warnings; the avoiding bucket is about values that help resist it.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "causes" ? "causes and warnings" : "values and ways to avoid abuse"}.`).join(" "),
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
        hint: "Think about what the Bible warns about alcohol, and what values help avoid substance abuse.",
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
        hint: "Think about the biblical warnings against alcohol and the values that help resist peer pressure.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Proverbs 20:1 says wine is a mocker and strong drink leads to", after: ".", answer: "brawling", accepted: ["brawling"] },
      { before: "Ephesians 5:18 warns against being drunk with wine, which leads to reckless", after: ".", answer: "living", accepted: ["living"] },
      { before: "Peer", after: "is a common reason young people try alcohol or drugs.", answer: "pressure", accepted: ["pressure"] },
      { before: "Talking to a trusted adult is a wise step to avoid", after: ".", answer: "temptation", accepted: ["temptation", "pressure"] },
      { before: "The value of self-", after: "helps a person resist alcohol and drugs.", answer: "control", accepted: ["control"] },
      { before: "This lesson suggests writing sensitisation messages saying \"No!\" to alcohol, drugs and substance", after: ".", answer: "abuse", accepted: ["abuse"] },
      { before: "Alcohol and drugs can seriously harm a young person's physical and mental", after: ".", answer: "health", accepted: ["health"] },
      { before: "This lesson's key inquiry question asks how you can avoid alcohol, drugs and substance", after: ".", answer: "abuse", accepted: ["abuse"] },
      { before: "The value of", after: "helps a person do what is right even without being watched.", answer: "integrity", accepted: ["integrity"] },
      { before: "This lesson suggests giving a brief talk at school", after: "on the effects of substance abuse.", answer: "assembly", accepted: ["assembly"] },
      { before: "Proverbs 31:6 mentions strong drink for someone in deep", after: ".", answer: "distress", accepted: ["distress"] },
      { before: "This lesson identifies values needed to avoid alcohol, drugs and substance", after: ".", answer: "abuse", accepted: ["abuse"] },
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
      hint: "Think about Proverbs 20:1, Proverbs 31:6, Ephesians 5:18, and the values that help avoid substance abuse.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
