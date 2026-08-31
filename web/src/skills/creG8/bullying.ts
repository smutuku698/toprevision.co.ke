import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each value to how it helps people co-exist peacefully, according to the scriptures.",
  "Pair each value below with how it helps prevent bullying.",
  "Connect each value to the scriptural reason it helps peaceful co-existence.",
  "Match each value to the statement that explains how it helps.",
  "Link each value to its role in living peacefully with others.",
  "Match each value to the description of how it counters bullying.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as 'A cause of bullying' or 'An effect of bullying'.",
  "Decide whether each statement is a cause or an effect of bullying, and sort it there.",
  "Group these statements under cause of bullying or effect of bullying.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for cause or effect.",
  "Read each statement and sort it under cause or effect of bullying.",
];

const ORDER_PROMPTS = [
  "Arrange the steps a school should take to address bullying.",
  "Put these steps for addressing bullying into their correct order.",
  "Sequence these steps for handling bullying correctly.",
  "Arrange these steps for a school's response to bullying in order.",
  "Order the steps a school should follow to address bullying.",
  "Sort these steps into the order a school should follow to address bullying.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const VALUES: { value: string; reason: string }[] = [
  { value: "Love", reason: "Treating others with genuine care instead of contempt (1 John 3:15, 1 Peter 3:8)" },
  { value: "Compassion", reason: "Feeling for and helping someone rather than mocking them (1 Peter 3:8)" },
  { value: "Humility", reason: "Not considering yourself better or more powerful than others (1 Peter 3:8)" },
  { value: "Peacemaking", reason: "Actively pursuing peace and building others up (Romans 14:19)" },
  { value: "Respect", reason: "Honouring others' dignity instead of ridiculing them (Proverbs 22:10)" },
];

const CAUSES = [
  "Jealousy or envy of another student's abilities",
  "A desire to feel powerful or in control over others",
  "Having been bullied before and repeating the behaviour",
  "Peer pressure to join others in mistreating someone",
];
const EFFECTS = [
  "Low self-esteem and fear in the victim",
  "Poor performance and absenteeism at school",
  "Depression, anxiety, or isolation",
  "Strained relationships within the family",
];

const STEPS = [
  { id: "s1", label: "Recognise and acknowledge that bullying is happening" },
  { id: "s2", label: "The victim or a witness reports it to a trusted teacher or adult" },
  { id: "s3", label: "The school or family investigates and talks to those involved" },
  { id: "s4", label: "Appropriate correction and counselling is given to the person bullying" },
  { id: "s5", label: "Support and reassurance is given to the victim" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "According to 1 John 3:15, what does the Bible compare hatred of a fellow believer to?", a: "Murder", explanation: "1 John 3:15 says anyone who hates a brother or sister is a murderer, showing how seriously God views ill-treatment of others." },
  { q: "According to 1 Peter 3:8, how should Christians treat one another?", a: "Be sympathetic, loving, compassionate, and humble", explanation: "1 Peter 3:8 lists these qualities as how believers should relate to one another, the opposite of bullying." },
  { q: "According to Romans 14:19, what should Christians pursue?", a: "What leads to peace and mutual building up", explanation: "Romans 14:19 calls believers to actively pursue peace, not conflict or intimidation." },
  { q: "According to Proverbs 22:10, what happens when a mocker is driven out?", a: "Strife and quarrels leave with them", explanation: "Proverbs 22:10 shows that removing a mocker restores peace to a community." },
  { q: "What is one common cause of bullying at school?", a: "Jealousy or a desire to feel powerful over others", explanation: "Bullying often comes from insecurity, jealousy, or a need to dominate others." },
];

const FILL_BLANKS = [
  { before: "1 John 3:15 says that anyone who hates a fellow believer is a", after: ".", answer: "murderer", accepted: ["murderer"] },
  { before: "Romans 14:19 urges Christians to make every effort to do what leads to", after: "and to mutual edification.", answer: "peace", accepted: ["peace"] },
];

export const bullying: Skill = {
  id: "g8-cre-cl-bullying",
  code: "CL.4",
  subjectId: "cre",
  strandId: "g8-cre-cl",
  grade: 8,
  title: "Bullying",
  description: "Causes and effects of bullying, and biblical values needed to co-exist peacefully.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "recall", "blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, VALUES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.value, label: v.value })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.value, label: v.reason })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.value] = v.value;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "These values are the opposite of the attitudes that lead to bullying.",
        explanation: chosen.map((v) => `${v.value} — ${v.reason.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const causes = shuffle(rng, CAUSES).slice(0, 3);
      const effects = shuffle(rng, EFFECTS).slice(0, 3);
      const items = shuffle(rng, [
        ...causes.map((c, i) => ({ id: `c${i}`, label: c, bucket: "cause" })),
        ...effects.map((e, i) => ({ id: `e${i}`, label: e, bucket: "effect" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "cause", label: "A cause of bullying" },
          { id: "effect", label: "An effect of bullying" },
        ],
        correctBucket,
        hint: "Causes explain why bullying happens; effects describe the harm it does afterward.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "cause" ? "a cause of bullying" : "an effect of bullying"}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: STEPS.map((s) => s.id),
        hint: "Start by recognising bullying is happening and end by supporting the victim.",
        explanation: STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "recall") {
      const target = randChoice(rng, FACTS);
      const distractors = shuffle(rng, FACTS.filter((f) => f.a !== target.a)).slice(0, 3).map((f) => f.a);
      const choices = shuffle(rng, [target.a, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: target.q,
        choices,
        correctIndex: choices.indexOf(target.a),
        layout: "list",
        hint: "Recall what 1 John 3:15, 1 Peter 3:8, Romans 14:19, and Proverbs 22:10 teach.",
        explanation: target.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS)(fb.before, fb.after),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: fb.accepted,
      inputMode: "text",
      hint: "Think about the exact wording of the scripture.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
