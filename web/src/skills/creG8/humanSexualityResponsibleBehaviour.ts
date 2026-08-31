import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each value or life skill to how it helps avoid irresponsible sexual behaviour.",
  "Pair each value below with how it helps a young person act responsibly.",
  "Connect each value or skill to the way it helps avoid risky behaviour.",
  "Match each value to the statement that explains how it helps.",
  "Link each value or life skill to its role in responsible behaviour.",
  "Match each value to the description of how it helps stay responsible.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as 'A responsible choice' or 'A risk factor / irresponsible behaviour'.",
  "Decide whether each statement is a responsible choice or a risk factor, and sort it there.",
  "Group these statements under responsible choice or risk factor.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for responsible choice or risk factor.",
  "Read each statement and sort it under responsible choice or risk factor.",
];

const ORDER_PROMPTS = [
  "Arrange the steps a teenager should take when facing pressure or abuse.",
  "Put these steps for facing pressure or abuse into order.",
  "Sequence these steps for responding to pressure correctly.",
  "Arrange these steps for handling pressure or abuse in order.",
  "Order the steps a young person should follow when facing pressure or abuse.",
  "Sort these steps into the order they should be followed when facing pressure.",
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
  { value: "Self-control", reason: "Mastering one's desires instead of acting on every impulse" },
  { value: "Assertiveness", reason: "Saying no firmly to pressure from peers or predators" },
  { value: "Wise choice of friends", reason: "Avoiding company that encourages irresponsible behaviour" },
  { value: "Seeking guidance", reason: "Talking to trusted adults, parents, or mentors about challenges" },
  { value: "Respect for one's body", reason: "Treating the body as valuable and honouring God with it" },
];

const RESPONSIBLE = [
  "Practising self-control and abstinence as a teenager",
  "Seeking advice from a trusted parent or guardian",
  "Reporting any form of abuse to a trusted adult immediately",
  "Choosing friends who encourage moral uprightness",
];
const RISK = [
  "Giving in to peer pressure to prove maturity",
  "Keeping secrets about abuse instead of reporting it",
  "Spending unsupervised time in risky situations",
  "Believing false information about relationships from peers",
];

const STEPS = [
  { id: "s1", label: "Recognise the warning signs of pressure or abuse early" },
  { id: "s2", label: "Say no firmly and clearly" },
  { id: "s3", label: "Remove yourself from the risky situation if possible" },
  { id: "s4", label: "Tell a trusted adult, parent, or authority what happened" },
  { id: "s5", label: "Seek counselling or support to heal and move forward" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "According to 1 Corinthians 6:19-20, what does the Bible call the Christian's body?", a: "A temple of the Holy Spirit", explanation: "1 Corinthians 6:19-20 teaches that believers' bodies are a temple bought at a price, to be honoured." },
  { q: "According to 1 Thessalonians 4:3-6, what is God's will for Christians regarding sexual purity?", a: "To avoid sexual immorality and control one's body in a holy way", explanation: "1 Thessalonians 4:3-6 calls Christians to live in a way that is holy and honourable." },
  { q: "According to Romans 12:1-2, how should Christians offer themselves to God?", a: "As a living sacrifice, not conforming to worldly patterns", explanation: "Romans 12:1-2 calls believers to be transformed rather than conformed to the pattern of the world." },
  { q: "What is one common cause of teenage pregnancies today?", a: "Peer pressure and lack of guidance", explanation: "Teenage pregnancies are often linked to peer pressure, irresponsible relationships, and a lack of guidance." },
  { q: "What should a young person do if they experience or witness sexual abuse?", a: "Report it immediately to a trusted adult", explanation: "Reporting abuse quickly to a trusted adult or authority is the responsible and safe response." },
  { q: "According to 1 Peter 2:11, what does the Bible urge believers to abstain from?", a: "Sinful desires that war against the soul", explanation: "1 Peter 2:11 urges believers to abstain from fleshly desires that battle against the soul." },
];

const FILL_BLANKS = [
  { before: "1 Corinthians 6:19 teaches that a Christian's body is a temple of the", after: "Spirit.", answer: "Holy", accepted: ["holy"] },
  { before: "1 Thessalonians 4:3 says it is God's will that Christians avoid sexual", after: ".", answer: "immorality", accepted: ["immorality"] },
];

export const humanSexualityResponsibleBehaviour: Skill = {
  id: "g8-cre-cl-human-sexuality-responsible-sexual-behaviour",
  code: "CL.2",
  subjectId: "cre",
  strandId: "g8-cre-cl",
  grade: 8,
  title: "Human Sexuality: Responsible Sexual Behaviour",
  description: "Avoiding sexual abuse, the causes and consequences of irresponsible sexual behaviour, and values for living responsibly.",
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
        hint: "These values and life skills help a young person make responsible, God-honouring choices.",
        explanation: chosen.map((v) => `${v.value} — ${v.reason.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const responsible = shuffle(rng, RESPONSIBLE).slice(0, 3);
      const risk = shuffle(rng, RISK).slice(0, 3);
      const items = shuffle(rng, [
        ...responsible.map((r, i) => ({ id: `r${i}`, label: r, bucket: "responsible" })),
        ...risk.map((k, i) => ({ id: `k${i}`, label: k, bucket: "risk" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "responsible", label: "A responsible choice" },
          { id: "risk", label: "A risk factor / irresponsible behaviour" },
        ],
        correctBucket,
        hint: "Responsible choices protect a young person; risk factors expose them to harm.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "responsible" ? "a responsible choice" : "a risk factor"}.`).join(" "),
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
        hint: "Start by recognising the danger and end by seeking help to heal.",
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
        hint: "Recall the biblical teaching on sexual purity in 1 Thessalonians 4, Romans 12, and 1 Corinthians 6.",
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
