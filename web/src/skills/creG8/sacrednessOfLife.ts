import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each term to what it means.",
  "Pair each term below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each term to the statement that explains it.",
  "Link each term below to its correct definition.",
  "Match each term to the description that fits it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as 'Upholds the sacredness of life' or 'Violates the right to life'.",
  "Decide whether each statement upholds or violates the sacredness of life, and sort it there.",
  "Group these statements under upholds the sacredness of life or violates the right to life.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for upholds or violates.",
  "Read each statement and sort it under upholds or violates the sacredness of life.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for helping someone who is struggling and at risk of harming themselves.",
  "Put these steps for helping someone at risk into their correct order.",
  "Sequence these steps for supporting someone struggling correctly.",
  "Arrange these steps for helping someone in crisis in order.",
  "Order the steps for supporting someone who is struggling.",
  "Sort these steps into the order they should be followed to help someone at risk.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Sacredness of life", meaning: "Human life is precious and God-given, made in his image, and must be protected" },
  { term: "Sanctity of the womb", meaning: "The biblical teaching that God forms and knows a person even before birth" },
  { term: "The sixth commandment", meaning: "God's command that human beings must not murder one another" },
  { term: "Image of God", meaning: "The biblical truth that every human being reflects God's likeness and worth" },
  { term: "Right to life", meaning: "Every person's God-given right to live and be protected from harm" },
];

const UPHOLDS = [
  "Protecting and caring for the vulnerable",
  "Encouraging someone struggling with despair to seek help instead of giving up hope",
  "Respecting every person as made in God's image",
  "Standing against violence in the community",
];
const VIOLATES = [
  "Taking one's own life",
  "Ending a pregnancy through abortion",
  "The unlawful killing of another person",
  "Neglecting or abusing a vulnerable person",
];

const STEPS = [
  { id: "s1", label: "Notice warning signs that someone may be struggling deeply" },
  { id: "s2", label: "Listen to them without judgment and take their pain seriously" },
  { id: "s3", label: "Encourage them and remind them of their worth before God" },
  { id: "s4", label: "Involve a trusted adult, counsellor, or pastor for support" },
  { id: "s5", label: "Continue to check on them and pray for them" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "According to Exodus 20:13, what does the sixth commandment say?", a: "You shall not murder", explanation: "Exodus 20:13 is the commandment against taking another person's life unlawfully." },
  { q: "According to Psalm 139:13-14, how does the psalmist describe God's involvement in human life?", a: "God formed him in his mother's womb, fearfully and wonderfully made", explanation: "Psalm 139:13-14 celebrates God's personal, careful creation of every human life." },
  { q: "According to Jeremiah 1:5, when did God know the prophet Jeremiah?", a: "Before he was formed in the womb", explanation: "Jeremiah 1:5 shows that God's knowledge and purpose for a person begin before birth." },
  { q: "According to Genesis 9:6, why is human life considered sacred?", a: "Because human beings are made in the image of God", explanation: "Genesis 9:6 grounds the sacredness of life in humanity being made in God's own image." },
  { q: "According to Genesis 4:10-11, what happened after Cain killed Abel?", a: "Abel's blood cried out to God, and Cain was cursed", explanation: "Genesis 4:10-11 shows God's serious response to the violation of the sacredness of life." },
];

const FILL_BLANKS = [
  { before: "Exodus 20:13 states: 'You shall not", after: ".'", answer: "murder", accepted: ["murder", "kill"] },
  { before: "Psalm 139:14 says we are fearfully and", after: "made.", answer: "wonderfully", accepted: ["wonderfully"] },
];

export const sacrednessOfLife: Skill = {
  id: "g8-cre-cl-sacredness-of-life",
  code: "CL.3",
  subjectId: "cre",
  strandId: "g8-cre-cl",
  grade: 8,
  title: "Sacredness of Life",
  description: "The meaning of the sacredness of life, how the right to life is violated today, and values needed to uphold it.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "recall", "blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 4);
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
        hint: "These terms all relate to why the Bible teaches that human life is precious and must be protected.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const upholds = shuffle(rng, UPHOLDS).slice(0, 3);
      const violates = shuffle(rng, VIOLATES).slice(0, 3);
      const items = shuffle(rng, [
        ...upholds.map((u, i) => ({ id: `u${i}`, label: u, bucket: "upholds" })),
        ...violates.map((v, i) => ({ id: `v${i}`, label: v, bucket: "violates" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "upholds", label: "Upholds the sacredness of life" },
          { id: "violates", label: "Violates the right to life" },
        ],
        correctBucket,
        hint: "Upholding life means protecting and valuing it; violating it means harming or ending it wrongfully.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "upholds" ? "upholds the sacredness of life" : "violates the right to life"}.`).join(" "),
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
        hint: "Start by noticing the warning signs and end by continuing to support them.",
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
        hint: "Recall what the scriptures teach about the value of human life.",
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
