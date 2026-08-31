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

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "the events of King Solomon's judgement in the correct order.",
    "these events from 1 Kings 3:16-28 into the order they happened.",
    "these moments from the story of the two women in order.",
    "these events the way they happened before King Solomon.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the dispute or about Solomon's wise judgement.",
    "these facts about King Solomon's story under the correct bucket.",
    "each fact below by which part of the story it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about King Solomon's story with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about King Solomon.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Two women who live in the same house each give birth to a son, days apart" },
  { id: "n2", label: "One woman's baby dies during the night" },
  { id: "n3", label: "That woman secretly swaps the dead baby for the other woman's living baby while she sleeps" },
  { id: "n4", label: "In the morning, the other woman realises the dead baby is not the son she bore" },
  { id: "n5", label: "The two women dispute before King Solomon, each claiming the living baby is her own" },
  { id: "n6", label: "Solomon orders that a sword be brought to cut the living baby in two, giving half to each woman" },
  { id: "n7", label: "The real mother, filled with compassion, begs Solomon to give the baby to the other woman rather than kill it" },
  { id: "n8", label: "The other woman says to go ahead and divide the baby" },
  { id: "n9", label: "Solomon gives the baby to the woman who showed compassion, recognising her as the true mother" },
  { id: "n10", label: "All Israel hears of the judgement and holds Solomon in awe for the wisdom God gave him" },
];

interface EventFact { text: string; group: "dispute" | "wisdom" }
const EVENT_FACTS: EventFact[] = [
  { text: "Two women living in the same house each gave birth to a son", group: "dispute" },
  { text: "One woman's baby died during the night", group: "dispute" },
  { text: "The grieving woman secretly swapped the dead baby for the living one", group: "dispute" },
  { text: "The other woman realised in the morning that the dead baby was not hers", group: "dispute" },
  { text: "Both women brought their dispute over the living baby before King Solomon", group: "dispute" },
  { text: "Solomon ordered a sword to be brought to divide the living baby in two", group: "wisdom" },
  { text: "The real mother begged Solomon to give the baby to the other woman rather than kill it", group: "wisdom" },
  { text: "The other woman said to go ahead and divide the baby", group: "wisdom" },
  { text: "Solomon recognised the true mother by her compassion for the child's life", group: "wisdom" },
  { text: "Solomon gave the living baby to the woman who showed compassion", group: "wisdom" },
  { text: "All Israel heard of the judgement and held Solomon in awe", group: "wisdom" },
  { text: "The people saw that the wisdom of God was in Solomon to administer justice", group: "wisdom" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "1 Kings 3:16-28", meaning: "The Bible passage recording King Solomon's judgement between the two women" },
  { term: "Compassion", meaning: "The quality the real mother showed that revealed her true identity to Solomon" },
  { term: "Dispute", meaning: "A disagreement between two or more people, like the argument between the two women over the baby" },
  { term: "Proverbs 9:10", meaning: "The verse teaching that the fear of the Lord is the beginning of wisdom" },
  { term: "Wise judgement", meaning: "A fair, well-reasoned decision, like the one Solomon made about the living baby" },
  { term: "Divide the baby", meaning: "Solomon's test, ordering a sword, that revealed which woman was the true mother" },
  { term: "True mother", meaning: "The woman identified by her willingness to give up the baby rather than see it harmed" },
  { term: "Held in awe", meaning: "How all Israel reacted upon hearing of Solomon's wise judgement" },
  { term: "Fairness", meaning: "Treating people justly, the value Solomon's judgement is remembered for" },
  { term: "Wisdom from God", meaning: "The source of Solomon's ability to judge rightly, according to the people's reaction" },
  { term: "Solving disputes", meaning: "The skill Solomon's story models for handling disagreements today" },
  { term: "King Solomon", meaning: "The ruler asked to judge which woman was the true mother of the living child" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Wanjiku", "Otieno", "Chelagat", "Barasa", "Njoroge", "Zawadi", "Kiplangat", "Mueni", "Odhiambo", "Waititu", "Nekesa", "Simiyu"] as const;
const KENYAN_PLACES = ["Eldoret", "Meru", "Kilifi", "Machakos", "Migori", "Vihiga", "Turkana", "Nyando", "Kibwezi", "Tetu", "Baringo", "Siaya"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `Two learners in ${place(rng)}, ${name(rng)} and a classmate, both claim ownership of a lost pencil case found in the classroom. Based on how Solomon solved the dispute over the baby, what could a teacher do to find out the truth?`,
    correct: "Look for a test or clue, like Solomon did, that reveals who genuinely cares about the item's owner rather than just claiming it",
    wrong: [
      "Give the item to whichever learner argues the loudest",
      "Refuse to solve the dispute and let the learners fight it out",
      "Automatically believe whichever learner spoke first",
    ],
    explanation: "Solomon's test — offering to divide the baby — worked because it revealed genuine care rather than just relying on a loud claim; the same principle can guide solving smaller disputes.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to settle an argument between two younger siblings over a toy. Which lesson from King Solomon's story is most useful here?`,
      correct: "Look past the loudest claim and pay attention to who truly cares about the other person's wellbeing, not just winning the argument",
      wrong: [
        "Simply give the toy to the older sibling regardless of the facts",
        "King Solomon's story only applies to matters involving babies",
        "Ignore both siblings until they stop arguing on their own",
      ],
      explanation: "Solomon's judgement revealed the true mother through her compassion for the child, not through who argued most forcefully — a principle useful in any dispute.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads that Solomon ordered a sword to divide the baby and wonders if Solomon actually intended to harm the child. What was Solomon's real purpose in giving that order?`,
    correct: "To test the two women's reactions and reveal who truly loved the child enough to give it up rather than see it harmed",
    wrong: [
      "Solomon genuinely intended to divide the baby in half",
      "Solomon wanted to punish both women equally for arguing",
      "The order had no real purpose and was simply a mistake",
    ],
    explanation: "Solomon's order was a wise test, not a literal intention — the real mother's compassionate reaction revealed the truth he needed to judge fairly.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} notices that the woman who was willing to give up her claim to save the baby's life turned out to be the true mother. What lesson does this teach about identifying what is genuine?`,
      correct: "Genuine love or ownership often shows itself through sacrifice and care for someone else's wellbeing, not through loud insistence",
      wrong: [
        "Whoever gives up a claim first is always automatically wrong",
        "This detail is unimportant to understanding the story",
        "Only the woman who fought hardest to keep the baby could be the real mother",
      ],
      explanation: "The real mother's willingness to sacrifice her claim to protect the baby's life is exactly what revealed her true identity to Solomon.",
    };
  },
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, led by ${name(rng)}, is asked to elect a class representative and are unsure how to judge who is truly caring and fair. Based on 1 Kings 3, what should they look for?`,
    correct: "Evidence of genuine care for others' wellbeing, shown through actions, not just confident claims or promises",
    wrong: [
      "Whoever promises the most rewards should automatically be chosen",
      "King Solomon's story has nothing to teach about choosing leaders",
      "The loudest or most popular candidate should always be trusted",
    ],
    explanation: "Solomon's wisdom was in looking past claims to genuine evidence of care — a principle that applies to judging character in leadership too.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that Solomon's fame for wisdom came only from being naturally clever. What does Proverbs 9:10 suggest about the true source of his wisdom?`,
      correct: "True wisdom begins with the fear of the Lord, meaning Solomon's wisdom is credited to God, not only to natural cleverness",
      wrong: [
        "Proverbs 9:10 says wisdom comes only from years of schooling",
        "Proverbs 9:10 has no connection to Solomon's story at all",
        "Solomon's wisdom came entirely from studying other kings' methods",
      ],
      explanation: "Proverbs 9:10 teaches that the fear of the Lord is the beginning of wisdom, connecting Solomon's famous judgement to wisdom that comes from God.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} believes that the two women in the story were equally telling the truth and Solomon simply guessed correctly by luck. Does the account in 1 Kings 3 support this belief?`,
    correct: "No — Solomon's test was a deliberate, wise strategy, not a lucky guess, and it clearly revealed the true mother's compassion",
    wrong: [
      "Yes — the outcome was pure chance with no real strategy involved",
      "Yes — both women were telling the truth, and Solomon simply split the reward",
      "No — but the story never actually reveals who the true mother was",
    ],
    explanation: "1 Kings 3:16-28 makes clear that Solomon's test was a deliberate, wise method for revealing the truth, not a random guess.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know why "all Israel" reacted with awe after hearing about Solomon's judgement. What did the people conclude from the story?`,
    correct: "That the wisdom of God was in Solomon to administer justice",
    wrong: [
      "That Solomon should be feared because he almost harmed a baby",
      "That the two women should be punished for arguing before the king",
      "That the story was only meant to entertain, not to teach anything",
    ],
    explanation: "1 Kings 3:28 records that all Israel held Solomon in awe because they saw that the wisdom of God was in him to administer justice.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is put in charge of resolving an argument between two friends over who should keep a shared drawing. What could ${who} learn from Solomon's approach to a hard decision?`,
      correct: "Think carefully and look for a way to see each person's true intentions before deciding, rather than rushing to judge based on who argues loudest",
      wrong: [
        "Avoid making any decision at all and let the argument continue",
        "Flip a coin instead of thinking through the situation",
        "Automatically side with whichever friend is older",
      ],
      explanation: "Solomon modeled thoughtful, wise decision-making that revealed the truth rather than a rushed or random judgement — useful for resolving everyday disputes fairly.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} asks whether Solomon's wise decision benefited only the two women in the story. Based on the story's outcome, who else benefited from Solomon's wisdom?`,
    correct: "The whole nation of Israel benefited, since the people gained confidence in Solomon's God-given wisdom to rule and judge fairly",
    wrong: [
      "No one else benefited — the judgement only mattered to the two women",
      "Only Solomon himself benefited, by gaining more personal wealth",
      "Only future kings benefited, but not the ordinary people of Israel",
    ],
    explanation: "The story ends by noting all Israel heard of the judgement and held Solomon in awe, showing the whole nation gained confidence in his God-given wisdom.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that showing compassion, like the true mother did, is a sign of weakness in an argument. How does Solomon's story respond to this idea?`,
      correct: "Compassion is shown to be a sign of genuine love and truth, not weakness — it is exactly what proved who the real mother was",
      wrong: [
        "The story agrees that compassion is a weakness to avoid",
        "Compassion had no role at all in how the case was decided",
        "Only the woman who refused to show compassion was rewarded",
      ],
      explanation: "The true mother's compassion — being willing to give up her claim rather than see the baby harmed — is precisely what revealed her identity and led to a fair outcome.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} wonders whether Solomon's story is only about babies and mothers, or whether it teaches something broader for any disagreement today. What is the broader lesson?`,
    correct: "Wise, thoughtful judgement that looks for the truth behind people's claims can fairly resolve many kinds of disagreements, not just this one",
    wrong: [
      "The story teaches nothing beyond the specific case of the two mothers",
      "It teaches that all disputes should be solved by threatening harm",
      "It teaches that whoever speaks to the king first always wins",
    ],
    explanation: "While the story's details are specific, its underlying lesson — seeking wisdom and truth rather than a hasty judgement — applies broadly to solving any dispute fairly.",
  }),
];

export const kingSolomonTheWiseRuler: Skill = {
  id: "g5-cre-bi-king-solomon",
  code: "BI.3",
  subjectId: "cre",
  strandId: "g5-cre-bible",
  grade: 5,
  title: "King Solomon the Wise Ruler",
  description: "King Solomon's wise judgement between two women disputing over a living baby (1 Kings 3:16-28), Proverbs 9:10 on the fear of the Lord as the beginning of wisdom, and using wisdom to solve disputes and make wise decisions.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, NARRATIVE_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: NARRATIVE_SEQUENCE.map((n) => n.id),
        hint: "Start with the two babies being born, and end with all Israel hearing of Solomon's judgement.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const dispute = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "dispute")).slice(0, 4);
      const wisdom = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "wisdom")).slice(0, 4);
      const chosen = shuffle(rng, [...dispute, ...wisdom]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "dispute", label: "The dispute over the baby" },
          { id: "wisdom", label: "Solomon's wise judgement" },
        ],
        correctBucket,
        hint: "The dispute bucket is about how the disagreement started; the wisdom bucket is about how Solomon resolved it.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "dispute" ? "the dispute over the baby" : "Solomon's wise judgement"}.`).join(" "),
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
        hint: "Think about how Solomon tested the two women and what revealed the true mother.",
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
        hint: "Think about how Solomon's test revealed which woman truly loved the child.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Two women who lived in the same house each gave birth to a", after: ".", answer: "son", accepted: ["son"] },
      { before: "One woman's baby died during the", after: ".", answer: "night", accepted: ["night"] },
      { before: "The two women brought their dispute before King", after: ".", answer: "Solomon", accepted: ["solomon"] },
      { before: "Solomon ordered a sword to be brought to divide the living baby in", after: ".", answer: "two", accepted: ["two"] },
      { before: "The real mother begged Solomon to give the baby to the other woman rather than", after: "it.", answer: "kill", accepted: ["kill"] },
      { before: "Solomon recognised the true mother by her", after: "for the child.", answer: "compassion", accepted: ["compassion"] },
      { before: "All Israel held Solomon in", after: "after hearing of his judgement.", answer: "awe", accepted: ["awe"] },
      { before: "The people saw that the wisdom of", after: "was in Solomon.", answer: "God", accepted: ["god"] },
      { before: "Proverbs 9:10 says the fear of the Lord is the beginning of", after: ".", answer: "wisdom", accepted: ["wisdom"] },
      { before: "This story shows Solomon demonstrating wisdom in his", after: ".", answer: "judgement", accepted: ["judgement", "judgment"] },
      { before: "The lesson teaches learners to make wise decisions in daily", after: ".", answer: "life", accepted: ["life"] },
      { before: "The story of King Solomon is found in 1", after: "3:16-28.", answer: "Kings", accepted: ["kings"] },
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
      hint: "Think about 1 Kings 3:16-28 and how Solomon's test revealed the true mother.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
