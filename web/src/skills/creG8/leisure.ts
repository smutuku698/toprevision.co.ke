import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each Bible reference to what it teaches about leisure.",
  "Pair each reference below with the teaching on leisure it gives.",
  "Connect each Bible reference to what it teaches about leisure.",
  "Match each reference to the statement that explains it.",
  "Link each Bible reference to its teaching on leisure.",
  "Match each reference to the description that fits it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each activity as 'A constructive use of leisure' or 'A misuse of leisure'.",
  "Decide whether each activity is a constructive use or a misuse of leisure, and sort it there.",
  "Group these activities under constructive use of leisure or misuse of leisure.",
  "Sort each activity below into the correct category.",
  "Place each activity into the bucket for constructive use or misuse.",
  "Read each activity and sort it under constructive use or misuse of leisure.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for planning a constructive use of your leisure time.",
  "Put these steps for planning leisure time into their correct order.",
  "Sequence these steps for using leisure time constructively.",
  "Arrange these steps for planning free time in order.",
  "Order the steps for making the most of your leisure time.",
  "Sort these steps into the order they should be followed to plan leisure time well.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const REFERENCES: { ref: string; teaching: string }[] = [
  { ref: "Exodus 20:11", teaching: "God himself rested on the seventh day, showing the value of rest" },
  { ref: "1 Corinthians 10:23", teaching: "Not everything we are free to do is good or builds others up" },
  { ref: "1 Corinthians 10:31", teaching: "Whatever you do, even in leisure, do it for the glory of God" },
  { ref: "Philippians 4:8", teaching: "Fill your mind with what is true, noble, pure, and praiseworthy" },
];

const CONSTRUCTIVE = [
  "Playing sport or developing a talent",
  "Reading books or engaging in a hobby",
  "Spending time in worship, prayer, or fellowship",
  "Resting and spending quality time with family",
];
const MISUSE = [
  "Spending all free time idle with no productive activity",
  "Watching or engaging with harmful, immoral content",
  "Using free time to pressure others into risky behaviour",
  "Wasting leisure time on activities that harm one's body or mind",
];

const STEPS = [
  { id: "s1", label: "Identify how much free time you actually have" },
  { id: "s2", label: "Reflect on activities that build you up (Philippians 4:8)" },
  { id: "s3", label: "Choose a constructive activity such as a hobby, sport, or fellowship" },
  { id: "s4", label: "Set aside time to rest and be with family as well" },
  { id: "s5", label: "Evaluate regularly whether your leisure time glorifies God (1 Corinthians 10:31)" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "According to Exodus 20:11, why did God rest on the seventh day?", a: "After creating the world in six days, showing the value of rest", explanation: "Exodus 20:11 grounds the pattern of rest in God's own example at creation." },
  { q: "According to 1 Corinthians 10:23, what does the Bible say about things being 'permissible'?", a: "Not everything permissible is beneficial or constructive", explanation: "1 Corinthians 10:23 warns that freedom does not mean every activity is good for you." },
  { q: "According to 1 Corinthians 10:31, how should Christians do everything, including leisure?", a: "For the glory of God", explanation: "1 Corinthians 10:31 calls believers to do all things, even leisure, for God's glory." },
  { q: "What is one reason youths misuse their leisure time today?", a: "Idleness, boredom, or peer pressure", explanation: "Common reasons for misusing leisure include idleness, lack of guidance, and peer pressure." },
  { q: "What is one constructive way to use leisure time?", a: "Developing a hobby or talent", explanation: "Constructive leisure includes sport, hobbies, reading, and worship or fellowship." },
];

const FILL_BLANKS = [
  { before: "1 Corinthians 10:31 teaches that whatever you do, you should do it for the", after: "of God.", answer: "glory", accepted: ["glory"] },
  { before: "Philippians 4:8 tells Christians to think about whatever is true, noble, right, pure, lovely, and", after: ".", answer: "praiseworthy", accepted: ["praiseworthy", "admirable"] },
];

export const leisure: Skill = {
  id: "g8-cre-cl-leisure",
  code: "CL.6",
  subjectId: "cre",
  strandId: "g8-cre-cl",
  grade: 8,
  title: "Leisure",
  description: "How to spend leisure time constructively, avoiding its misuse, guided by scripture.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "recall", "blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, REFERENCES);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.ref, label: r.ref })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.ref, label: r.teaching })));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.ref] = r.ref;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "These references show that rest has value, but leisure should still glorify God.",
        explanation: chosen.map((r) => `${r.ref} — ${r.teaching.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const constructive = shuffle(rng, CONSTRUCTIVE).slice(0, 3);
      const misuse = shuffle(rng, MISUSE).slice(0, 3);
      const items = shuffle(rng, [
        ...constructive.map((c, i) => ({ id: `c${i}`, label: c, bucket: "constructive" })),
        ...misuse.map((m, i) => ({ id: `m${i}`, label: m, bucket: "misuse" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "constructive", label: "A constructive use of leisure" },
          { id: "misuse", label: "A misuse of leisure" },
        ],
        correctBucket,
        hint: "Constructive leisure builds you up; misused leisure wastes time or causes harm.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "constructive" ? "a constructive use of leisure" : "a misuse of leisure"}.`).join(" "),
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
        hint: "Start by identifying your free time and end by evaluating whether it glorifies God.",
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
        hint: "Recall Exodus 20:11, 1 Corinthians 10:23-31, and Philippians 4:8.",
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
