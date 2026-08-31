import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, name, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Citizenship in Kenya".
// See curriculum-reference/grade-5/social-studies.json.

const WAYS: { id: string; way: string; description: string }[] = [
  { id: "birth", way: "By birth", description: "a person becomes a Kenyan citizen automatically if born to a Kenyan citizen parent" },
  { id: "registration", way: "By registration", description: "a person can become a Kenyan citizen by applying for registration, if they meet the legal requirements" },
  { id: "naturalisation", way: "By naturalisation", description: "a long-term resident who meets the legal requirements can apply to become a Kenyan citizen through naturalisation" },
];

const GOOD_CITIZEN_BEHAVIOURS = [
  "obeying rules and laws",
  "respecting other people's rights",
  "participating in community activities",
  "caring for public property",
  "being honest and responsible",
  "helping a neighbour in need",
  "keeping the environment clean",
  "reporting wrongdoing to the right authority",
  "voting or participating in class elections",
  "paying attention to civic duties",
] as const;

const POOR_CITIZEN_BEHAVIOURS = [
  "littering in a public place",
  "damaging school or public property",
  "ignoring the rights of others",
  "refusing to follow class or community rules",
  "being dishonest with others",
  "avoiding all community responsibilities",
] as const;

const SENTENCES: { id: string; label: string; way: string }[] = [
  { id: "b1", label: "A baby born to a Kenyan mother automatically becomes a Kenyan citizen", way: "birth" },
  { id: "b2", label: "A child is Kenyan simply because their parent is a Kenyan citizen", way: "birth" },
  { id: "r1", label: "A person applies to the government to formally become a citizen", way: "registration" },
  { id: "r2", label: "Someone fills in the required forms and is granted citizenship by registration", way: "registration" },
  { id: "n1", label: "A person who has lived in Kenya for many years applies to become a citizen through naturalisation", way: "naturalisation" },
  { id: "n2", label: "A long-term resident meets the legal requirements and becomes a citizen by naturalisation", way: "naturalisation" },
];

export const citizenshipInKenya: Skill = {
  id: "g5-ss-pol-citizenship-in-kenya",
  code: "PS.3",
  subjectId: "social-studies",
  strandId: "g5-ss-political",
  grade: 5,
  title: "Citizenship in Kenya",
  description: "Ways of becoming a Kenyan citizen, dual citizenship, and demonstrating good citizenship.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const s = randChoice(rng, SENTENCES);
      const correctWay = WAYS.find((w) => w.id === s.way)!;
      const choices = shuffle(rng, WAYS.map((w) => w.way));
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "way of becoming a Kenyan citizen")} Scenario: "${s.label}."`,
        choices,
        correctIndex: choices.indexOf(correctWay.way),
        hint: "Think about whether it's about being born a citizen, applying to register, or living in Kenya long-term.",
        explanation: `This describes becoming a citizen ${correctWay.way.toLowerCase()}: ${correctWay.description}.`,
      };
    }

    if (branch === "click-match") {
      const tokens = WAYS.map((w) => ({ id: w.id, label: w.way }));
      const targets = shuffle(rng, WAYS).map((w) => ({ id: w.id, label: w.description.charAt(0).toUpperCase() + w.description.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const w of WAYS) correctMap[w.id] = w.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "way of becoming a Kenyan citizen to its description"),
        tokens,
        targets,
        correctMap,
        hint: "Match each term to how it actually happens.",
        explanation: WAYS.map((w) => `${w.way}: ${w.description}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const good = shuffle(rng, [...GOOD_CITIZEN_BEHAVIOURS]).slice(0, 4).map((b, i) => ({ id: `g${i}`, label: b, bucket: "GOOD" }));
      const poor = shuffle(rng, [...POOR_CITIZEN_BEHAVIOURS]).slice(0, 4).map((b, i) => ({ id: `p${i}`, label: b, bucket: "POOR" }));
      const items = shuffle(rng, [...good, ...poor]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is good citizenship or not"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "GOOD", label: "Good Citizenship" },
          { id: "POOR", label: "Not Good Citizenship" },
        ],
        correctBucket,
        hint: "Good citizens respect rules, others, and public property.",
        explanation: "Behaviours that respect rules, others and public property show good citizenship; behaviours that harm or ignore them do not.",
      };
    }

    if (branch === "fill-blank") {
      const n = name(rng);
      const templates = [
        () => ({ before: `${n} was born to a Kenyan parent, so ${n} became a Kenyan citizen`, after: ".", correct: "by birth" }),
        () => ({ before: "Kenya allows a citizen to also hold citizenship of another country — this is called", after: ".", correct: "dual citizenship" }),
        () => ({ before: "Someone who has lived in Kenya for a long time and meets the requirements can become a citizen through", after: ".", correct: "naturalisation" }),
        () => ({ before: "A good citizen shows respect for the rights of", after: ".", correct: "others" }),
        () => ({ before: "Caring for public property is an example of good", after: ".", correct: "citizenship" }),
        () => ({ before: "A person can apply to formally become a Kenyan citizen through", after: ".", correct: "registration" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the three ways of becoming a citizen, and what good citizenship looks like.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "notice", label: "A learner notices a problem in the classroom" },
      { id: "follow", label: "The learner follows the classroom rules" },
      { id: "help", label: "The learner helps or reports the problem responsibly" },
      { id: "encourage", label: "The learner encourages classmates to do the same" },
    ]);
    const correctOrder = ["notice", "follow", "help", "encourage"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps of demonstrating good citizenship in a school scenario"),
      instruction: "Arrange the steps in a sensible order.",
      items: steps,
      correctOrder,
      hint: "Start by noticing the problem, end by encouraging others.",
      explanation: "Good citizenship starts with noticing a problem, following the rules, helping/reporting responsibly, then encouraging others.",
    };
  },
};
