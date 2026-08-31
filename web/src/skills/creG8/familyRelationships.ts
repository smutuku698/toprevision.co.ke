import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each value needed for a harmonious family to why it matters.",
  "Pair each value below with the reason it matters for family harmony.",
  "Connect each value to why it helps a family live harmoniously.",
  "Match each value to the statement that explains its importance.",
  "Link each value below to why it matters for a healthy family.",
  "Match each value to the description of why it matters.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as 'A healthy family practice' or 'A cause of family conflict'.",
  "Decide whether each statement is a healthy practice or a cause of conflict, and sort it there.",
  "Group these statements under healthy family practice or cause of family conflict.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for healthy practice or cause of conflict.",
  "Read each statement and sort it under healthy practice or cause of conflict.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for resolving a conflict facing a family today.",
  "Put these steps for resolving family conflict into their correct order.",
  "Sequence these steps for resolving a family conflict correctly.",
  "Arrange these steps for handling family disagreements in order.",
  "Order the steps for resolving a conflict at home.",
  "Sort these steps into the order they should be followed to resolve family conflict.",
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
  { value: "Respect", reason: "Honouring each family member regardless of age or role" },
  { value: "Love", reason: "Caring genuinely for one another's wellbeing" },
  { value: "Obedience", reason: "Children following their parents' godly instructions" },
  { value: "Communication", reason: "Talking openly to resolve misunderstandings early" },
  { value: "Forgiveness", reason: "Letting go of family conflicts instead of holding grudges" },
];

const HEALTHY = [
  "Family members talking openly about problems",
  "Parents guiding children with patience and love",
  "Children respecting and obeying their parents",
  "Sharing responsibilities and supporting one another at home",
];
const CONFLICT_CAUSES = [
  "Poor communication between family members",
  "Favouritism shown among children",
  "Lack of respect for parents or elders",
  "Financial pressure and unmet needs at home",
];

const STEPS = [
  { id: "s1", label: "Recognise there is a disagreement or misunderstanding at home" },
  { id: "s2", label: "Calmly talk to the family member involved instead of reacting in anger" },
  { id: "s3", label: "Listen to each other's side with respect" },
  { id: "s4", label: "Seek forgiveness and agree on a way forward" },
  { id: "s5", label: "Involve a trusted elder or church leader if the conflict cannot be resolved alone" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "According to Ephesians 6:1, what should children do?", a: "Obey their parents in the Lord, for this is right", explanation: "Ephesians 6:1 teaches that children's obedience to parents pleases God." },
  { q: "According to Exodus 20:12, what does the fifth commandment concern?", a: "Honouring one's father and mother", explanation: "Exodus 20:12 is the commandment to honour your father and your mother." },
  { q: "According to Ephesians 6:4, what should fathers avoid doing to their children?", a: "Provoking them to anger", explanation: "Ephesians 6:4 instructs fathers to bring up children in the training and instruction of the Lord, not exasperate them." },
  { q: "According to Colossians 3:20, why should children obey their parents?", a: "Because this pleases the Lord", explanation: "Colossians 3:20 gives the reason for children's obedience — it pleases God." },
  { q: "What is one common cause of conflict in families today?", a: "Poor communication between family members", explanation: "Many family conflicts arise from misunderstandings that better communication could prevent." },
];

const FILL_BLANKS = [
  { before: "Exodus 20:12 commands: 'Honour your father and your", after: ".'", answer: "mother", accepted: ["mother"] },
  { before: "Ephesians 6:1 teaches that children should", after: "their parents in the Lord.", answer: "obey", accepted: ["obey"] },
];

export const familyRelationships: Skill = {
  id: "g8-cre-cl-family-relationships",
  code: "CL.1",
  subjectId: "cre",
  strandId: "g8-cre-cl",
  grade: 8,
  title: "Family Relationships",
  description: "Roles of family members, healthy family practices, causes of family conflict, and values for living harmoniously at home.",
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
        hint: "These are the values the Bible calls families to practise with one another.",
        explanation: chosen.map((v) => `${v.value} — ${v.reason.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const healthy = shuffle(rng, HEALTHY).slice(0, 3);
      const causes = shuffle(rng, CONFLICT_CAUSES).slice(0, 3);
      const items = shuffle(rng, [
        ...healthy.map((h, i) => ({ id: `h${i}`, label: h, bucket: "healthy" })),
        ...causes.map((c, i) => ({ id: `c${i}`, label: c, bucket: "conflict" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "healthy", label: "A healthy family practice" },
          { id: "conflict", label: "A cause of family conflict" },
        ],
        correctBucket,
        hint: "Healthy practices build trust; conflict causes usually involve poor communication or unmet needs.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "healthy" ? "a healthy family practice" : "a cause of family conflict"}.`).join(" "),
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
        hint: "Start by recognising the problem and end by involving someone trusted if needed.",
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
        hint: "Recall the biblical teaching on family relationships in Ephesians 6, Exodus 20, and Colossians 3.",
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
