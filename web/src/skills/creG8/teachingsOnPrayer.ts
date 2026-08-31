import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each of Jesus's teachings on prayer to what it means.",
  "Pair each teaching on prayer below with its correct meaning.",
  "Connect each teaching to the meaning it fits.",
  "Match each teaching to the statement that explains it.",
  "Link each of Jesus's teachings on prayer to its correct definition.",
  "Match each teaching on prayer to the description that fits it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as 'A right way to pray' or 'A wrong way to pray, as Jesus warned'.",
  "Decide whether each statement is a right or wrong way to pray, and sort it there.",
  "Group these statements under a right way to pray or a wrong way to pray.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for right or wrong way to pray.",
  "Read each statement and sort it under right or wrong way to pray.",
];

const ORDER_PROMPTS = [
  "Arrange these steps for applying Jesus's teaching on prayer in daily life.",
  "Put these steps for applying Jesus's prayer teaching into order.",
  "Sequence these steps for praying as Jesus taught.",
  "Arrange these steps of applying prayer teaching in order.",
  "Order the steps for putting Jesus's teaching on prayer into practice.",
  "Sort these steps into the order they build toward faithful prayer.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const TEACHINGS: { teaching: string; meaning: string }[] = [
  { teaching: "Pray with faith (Mark 11:22-24)", meaning: "Believe that God hears and will answer your prayer" },
  { teaching: "Pray in secret (Matthew 6:5-6)", meaning: "Avoid praying to show off; pray sincerely, even privately" },
  { teaching: "Pray for your enemies (Matthew 5:44-45)", meaning: "Show God's love by praying even for those who wrong you" },
  { teaching: "Avoid vain repetition (Matthew 6:7-8)", meaning: "Do not babble many meaningless, repeated words as pagans do" },
  { teaching: "Pray persistently", meaning: "Continue praying without giving up, trusting God's timing" },
];

const RIGHT_WAYS = [
  "Praying privately and sincerely to God",
  "Praying with faith, believing God hears you",
  "Praying for all people, including enemies",
  "Praying persistently without giving up",
];
const WRONG_WAYS = [
  "Praying loudly in public just to be seen and praised by others",
  "Babbling many meaningless, repeated words",
  "Praying only for people who are kind to you",
];

const STEPS = [
  { id: "s1", label: "Go to a private place to pray (Matthew 6:6)" },
  { id: "s2", label: "Pray sincerely from the heart, not to be seen by others" },
  { id: "s3", label: "Believe that God hears your prayer and has faith it will be answered (Mark 11:24)" },
  { id: "s4", label: "Include even your enemies in your prayers (Matthew 5:44-45)" },
  { id: "s5", label: "Continue praying persistently, trusting God's timing" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "According to Mark 11:24, what should you believe when you pray?", a: "That you have received what you asked for", explanation: "Mark 11:24 teaches that faith-filled prayer trusts God has heard and will answer." },
  { q: "According to Matthew 6:5-8, how should Christians not pray?", a: "Like hypocrites who pray publicly to be seen by others", explanation: "Jesus warned against praying to impress people rather than to genuinely reach God." },
  { q: "What does Matthew 6:8 say about what God already knows?", a: "God knows what we need before we even ask him", explanation: "This shows prayer is not about informing God, but about relationship and trust." },
  { q: "According to Matthew 5:44-45, who should Christians pray for?", a: "Even their enemies and those who persecute them", explanation: "Jesus taught that love and prayer should extend even to those who oppose us." },
];

const FILL_BLANKS = [
  { before: "Mark 11:24 teaches that when you pray, believe you have received it, and it will be", after: ".", answer: "yours", accepted: ["yours"] },
  { before: "Matthew 6:6 teaches that when you pray, go into your room, close the door, and pray to your Father, who is", after: ".", answer: "unseen", accepted: ["unseen", "in secret"] },
];

export const teachingsOnPrayer: Skill = {
  id: "g8-cre-te-teachings-on-prayer",
  code: "TE.1",
  subjectId: "cre",
  strandId: "g8-cre-te",
  grade: 8,
  title: "Teachings of Jesus on Prayer",
  description: "Jesus's teachings on prayer, including faith, sincerity, love for all people, and persistence.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "recall", "blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TEACHINGS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.teaching, label: t.teaching })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.teaching, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.teaching] = t.teaching;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Jesus taught about the attitude, sincerity, and scope of true prayer.",
        explanation: chosen.map((t) => `${t.teaching} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const right = shuffle(rng, RIGHT_WAYS).slice(0, 3);
      const wrong = shuffle(rng, WRONG_WAYS).slice(0, 3);
      const items = shuffle(rng, [
        ...right.map((r, i) => ({ id: `r${i}`, label: r, bucket: "right" })),
        ...wrong.map((w, i) => ({ id: `w${i}`, label: w, bucket: "wrong" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "right", label: "A right way to pray" },
          { id: "wrong", label: "A wrong way to pray, as Jesus warned" },
        ],
        correctBucket,
        hint: "Right prayer is sincere and faith-filled; wrong prayer seeks attention or repeats empty words.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "right" ? "a right way to pray" : "a wrong way to pray"}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from private prayer to persistent faith.",
        items,
        correctOrder: STEPS.map((s) => s.id),
        hint: "Start with where and how you pray, then move to faith, love for others, and persistence.",
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
        hint: "Recall Jesus's teachings on prayer in Mark 11 and Matthew 5-6.",
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
