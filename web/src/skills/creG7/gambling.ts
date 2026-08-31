import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// CL.4 "Gambling" has no natural sequence, spatial layout, or numeric quantity in its
// source content (unordered lists of causes, effects, and Bible teachings) — so this skill
// genuinely supports only 4 QuestionKinds (multiple-choice, categorize, click-match,
// fill-blank), following the same documented-cap pattern as
// creativeArtsSportsG7/introduction.ts.

const CATEGORIZE_PROMPTS = [
  "Sort each statement as a cause of gambling, or an effect of gambling.",
  "Decide whether each statement is a cause or an effect, and sort it there.",
  "Group these statements under cause of gambling or effect of gambling.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for cause or effect.",
  "Read each statement and sort it under cause or effect of gambling.",
];

const MATCH_PROMPTS = [
  "Match each term or Bible reference to its meaning.",
  "Pair each term or reference below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each Bible reference or term to what it means.",
  "Link each term below to its correct definition.",
  "Match each term or reference to the statement that explains it.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about gambling with the right word.",
];

const CAUSES = [
  "Peer pressure from friends who gamble",
  "A get-rich-quick mentality, hoping for quick, easy money",
  "Unemployment or financial desperation",
  "Constant advertising for betting apps and games",
  "Boredom and idle time with nothing productive to do",
] as const;

const EFFECTS = [
  "Loss of money meant for essential family needs",
  "Growing addiction to the excitement of gambling",
  "Rising debt from repeated gambling losses",
  "Strained or broken family relationships due to gambling losses",
  "Neglect of school or work responsibilities because of time spent gambling",
] as const;

const TERMS: { term: string; meaning: string }[] = [
  { term: "1 Timothy 6:10", meaning: "Teaches that the love of money is a root of all kinds of evil" },
  { term: "Proverbs 13:11", meaning: "Says wealth gained hastily dwindles, but wealth gathered gradually grows" },
  { term: "Proverbs 28:20-22", meaning: "Warns that one eager to get rich quickly will not go unpunished" },
  { term: "Ephesians 4:28", meaning: "Instructs a person to work and do something useful with their hands instead of stealing" },
  { term: "Matthew 6:19-21", meaning: "Teaches not to store up treasures on earth, but in heaven" },
  { term: "Hebrews 13:5", meaning: "Calls believers to keep their lives free from the love of money and be content" },
  { term: "1 Timothy 6:17-19", meaning: "Instructs the rich to put their hope in God, not in wealth, and to be generous" },
  { term: "Gambling", meaning: "Risking money on an uncertain, chance-based outcome hoping to win more" },
  { term: "Get-rich-quick mentality", meaning: "The belief that one can gain wealth quickly and easily without steady effort" },
  { term: "Contentment", meaning: "Being satisfied with what one has, rather than always chasing more" },
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
      prompt: `${who} in ${place(rng)} starts betting because friends keep insisting "everyone is doing it and winning big." What cause of gambling does this best show?`,
      correct: "Peer pressure from friends who gamble",
      wrong: ["Neglect of school responsibilities", "Rising debt from repeated losses", "Growing addiction to the excitement of gambling"],
      explanation: "Being pushed into gambling because friends insist everyone is doing it is a clear example of peer pressure, one of the main causes of gambling among young people.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} keeps betting money meant for school fees, hoping for a big win to solve financial struggles quickly. What underlying belief is driving this decision?`,
    correct: "A get-rich-quick mentality, hoping for fast, easy money",
    wrong: ["Contentment with what one already has", "A commitment to steady, honest work", "A desire to store up treasures in heaven"],
    explanation: "Betting essential money hoping for a quick win reflects a get-rich-quick mentality — exactly the impulsive shortcut Proverbs 28:20-22 warns against.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} struggles because a family member repeatedly loses money meant for food and rent through gambling. What effect of gambling does this best show?`,
      correct: "Loss of money meant for essential family needs",
      wrong: ["Peer pressure from friends who gamble", "Constant advertising for betting apps", "Boredom and idle time"],
      explanation: "Repeatedly losing money meant for essential needs like food and rent is a direct effect of gambling on a family, distinct from the causes that lead someone to start.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads Proverbs 13:11 and is asked what it teaches about wealth. What is the correct teaching?`,
    correct: "Wealth gained hastily dwindles away, but wealth gathered gradually grows",
    wrong: ["All wealth, however it is gained, always grows steadily", "Wealth gained quickly always lasts the longest", "The verse teaches nothing about how wealth is gained"],
    explanation: "Proverbs 13:11 specifically contrasts wealth gained hastily, which dwindles away, with wealth gathered gradually through steady effort, which grows.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} decides to save small amounts consistently each month instead of gambling for a quick windfall. Which Bible teaching does this reflect?`,
    correct: "Proverbs 13:11's teaching that wealth gathered gradually grows",
    wrong: ["1 Timothy 6:10's warning about the love of money", "Ephesians 4:28's instruction against stealing", "Hebrews 13:5's call to contentment"],
    explanation: "Saving small amounts steadily, rather than seeking a quick windfall, directly reflects Proverbs 13:11's teaching that gradually gathered wealth grows, unlike hastily gained wealth.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Ephesians 4:28 instructs a person to do instead of stealing or seeking dishonest gain. What is the correct answer?`,
    correct: "Work and do something useful with their own hands",
    wrong: ["Gamble responsibly instead of stealing", "Borrow money from as many people as possible", "Avoid all forms of work entirely"],
    explanation: "Ephesians 4:28 specifically instructs a person to work, doing something useful with their own hands, as the honest alternative to stealing or dishonest gain.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} keeps chasing bigger bets even after repeated losses, unable to stop despite mounting debt. What effect of gambling does this best show?`,
    correct: "Growing addiction to the excitement of gambling",
    wrong: ["Constant advertising for betting apps", "Peer pressure from friends who gamble", "Boredom and idle time"],
    explanation: "Being unable to stop despite mounting losses is a sign of growing addiction to gambling's excitement — a serious effect, not merely a cause.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Matthew 6:19-21 teaches about where a person's treasure should be stored. What is the correct teaching?`,
    correct: "Treasures should be stored in heaven, not on earth, because that is where one's heart will be",
    wrong: ["Treasures should only ever be stored in a bank account", "The passage says nothing about storing treasure at all", "Treasures on earth are described as completely safe and permanent"],
    explanation: "Matthew 6:19-21 teaches that earthly treasures are vulnerable to loss, so believers should store up treasure in heaven, since one's heart follows one's treasure.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees constant betting advertisements online and on television, encouraging quick bets. What cause of gambling does this represent?`,
    correct: "Constant advertising for betting apps and games",
    wrong: ["Rising debt from repeated gambling losses", "Neglect of school or work responsibilities", "Strained family relationships due to gambling"],
    explanation: "Frequent, persuasive advertising for betting apps is a cause that pulls people toward gambling, distinct from the debt or relationship strain that comes afterward as an effect.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} chooses to be satisfied with a modest but honest income rather than constantly chasing more through betting. Which value does this reflect?`,
    correct: "Contentment — being satisfied with what one has",
    wrong: ["A get-rich-quick mentality", "Peer pressure to gamble", "Boredom leading to gambling"],
    explanation: "Choosing satisfaction with an honest, modest income rather than chasing quick gains through gambling reflects the value of contentment, echoed in Hebrews 13:5.",
  }),
];

export const gambling: Skill = {
  id: "g7-cre-cl-gambling",
  code: "CL.4",
  subjectId: "cre",
  strandId: "g7-cre-living",
  grade: 7,
  title: "Gambling",
  description: "Causes and effects of gambling among youth in Kenya, biblical teachings on money and true riches, and values and life skills needed to live a gambling-free life.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

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
          { id: "cause", label: "A cause of gambling" },
          { id: "effect", label: "An effect of gambling" },
        ],
        correctBucket,
        hint: "Causes are reasons a person starts gambling; effects are the results of that gambling.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.kind === "cause" ? "a cause of gambling" : "an effect of gambling"}.`).join(" "),
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
        hint: "Think about the Bible's teachings on money, wealth, and true riches.",
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
        hint: "Think about the causes and effects of gambling, and the Bible's teaching on money and wealth.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "1 Timothy 6:10 says the love of money is a root of all kinds of", after: ".", answer: "evil", accepted: ["evil"] },
      { before: "Proverbs 13:11 says wealth gained hastily", after: "away, but wealth gathered gradually grows.", answer: "dwindles", accepted: ["dwindles"] },
      { before: "Ephesians 4:28 instructs a person to do something useful with their own", after: "instead of stealing.", answer: "hands", accepted: ["hands"] },
      { before: "Matthew 6:19-21 teaches believers to store up treasures in", after: ", not on earth.", answer: "heaven", accepted: ["heaven"] },
      { before: "Hebrews 13:5 calls believers to keep their lives free from the love of money and be", after: ".", answer: "content", accepted: ["content"] },
      { before: "1 Timothy 6:17 instructs the rich to put their hope in God, not in", after: ".", answer: "wealth", accepted: ["wealth"] },
      { before: "Risking money on an uncertain, chance-based outcome hoping to win more is called", after: ".", answer: "gambling", accepted: ["gambling"] },
      { before: "The belief that one can gain wealth quickly and easily is called a get-rich-", after: "mentality.", answer: "quick", accepted: ["quick"] },
      { before: "Being satisfied with what one has, rather than always chasing more, is called", after: ".", answer: "contentment", accepted: ["contentment"] },
      { before: "Proverbs 28:20-22 warns that one eager to get rich quickly will not go", after: ".", answer: "unpunished", accepted: ["unpunished"] },
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
      hint: "Think about the causes and effects of gambling, and the Bible's teaching on money and true riches.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
