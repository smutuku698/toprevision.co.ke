import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "National Government" — 3 named arms
// (The Executive, The Legislature, The Judiciary). See curriculum-reference/grade-5/social-studies.json.

type Arm = "EXECUTIVE" | "LEGISLATURE" | "JUDICIARY";

const ARMS: { id: Arm; name: string; role: string }[] = [
  { id: "EXECUTIVE", name: "The Executive", role: "implements and enforces laws, running the day-to-day government, headed by the President" },
  { id: "LEGISLATURE", name: "The Legislature", role: "makes laws, through Parliament (the National Assembly and the Senate)" },
  { id: "JUDICIARY", name: "The Judiciary", role: "interprets laws and delivers justice through the courts" },
];

const FUNCTIONS: { id: string; label: string; arm: Arm }[] = [
  { id: "f1", label: "The President leads the day-to-day running of the government", arm: "EXECUTIVE" },
  { id: "f2", label: "Government ministries carry out and enforce laws", arm: "EXECUTIVE" },
  { id: "f3", label: "Members of Parliament debate and pass a new law", arm: "LEGISLATURE" },
  { id: "f4", label: "The Senate represents counties in making national decisions", arm: "LEGISLATURE" },
  { id: "f5", label: "A court decides whether someone broke the law", arm: "JUDICIARY" },
  { id: "f6", label: "A judge settles a dispute between two people", arm: "JUDICIARY" },
];

export const nationalGovernment: Skill = {
  id: "g5-ss-gov-national-government",
  code: "G.4",
  subjectId: "social-studies",
  strandId: "g5-ss-governance",
  grade: 5,
  title: "National Government",
  description: "Identifying the three arms of Kenya's National Government — the Executive, the Legislature, and the Judiciary — and their roles.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const f = randChoice(rng, FUNCTIONS);
      const armName = ARMS.find((a) => a.id === f.arm)!.name;
      const choices = shuffle(rng, ARMS.map((a) => a.name));
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "arm of government responsible for this function")} Function: "${f.label}."`,
        choices,
        correctIndex: choices.indexOf(armName),
        hint: "The Executive implements laws, the Legislature makes laws, the Judiciary interprets laws.",
        explanation: `"${f.label}" is a function of ${armName}.`,
      };
    }

    if (branch === "click-match") {
      const tokens = ARMS.map((a) => ({ id: a.id, label: a.name }));
      const targets = shuffle(rng, ARMS).map((a) => ({ id: a.id, label: a.role.charAt(0).toUpperCase() + a.role.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const a of ARMS) correctMap[a.id] = a.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "arm of government to its role"),
        tokens,
        targets,
        correctMap,
        hint: "Recall which arm makes, enforces, and interprets laws.",
        explanation: ARMS.map((a) => `${a.name}: ${a.role}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const shuffled = shuffle(rng, FUNCTIONS);
      const correctBucket: Record<string, string> = {};
      for (const f of shuffled) correctBucket[f.id] = f.arm;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which arm of government the action belongs to"),
        items: shuffled.map((f) => ({ id: f.id, label: f.label })),
        buckets: ARMS.map((a) => ({ id: a.id, label: a.name })),
        correctBucket,
        hint: "The Executive enforces laws, the Legislature makes laws, the Judiciary interprets and rules on laws.",
        explanation: shuffled.map((f) => `"${f.label}" belongs to ${ARMS.find((a) => a.id === f.arm)!.name}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const templates = [
        () => ({ before: "The arm of government headed by the President is called the", after: ".", correct: "Executive" }),
        () => ({ before: "Parliament, which makes laws, is part of the", after: ".", correct: "Legislature" }),
        () => ({ before: "Courts that interpret laws and deliver justice belong to the", after: ".", correct: "Judiciary" }),
        () => ({ before: "The three arms of Kenya's National Government check each other so that no single arm has too much", after: ".", correct: "power" }),
        () => ({ before: "The Senate and National Assembly together make up the", after: ".", correct: "Legislature" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the Executive, the Legislature, and the Judiciary.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "debate", label: "The Legislature debates and passes a bill" },
      { id: "law", label: "The bill becomes law" },
      { id: "enforce", label: "The Executive implements and enforces the law" },
      { id: "resolve", label: "The Judiciary resolves any disputes about the law" },
    ]);
    const correctOrder = ["debate", "law", "enforce", "resolve"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps showing how the three arms of government interact when a law is made"),
      instruction: "Arrange the steps in the correct order.",
      items: steps,
      correctOrder,
      hint: "A bill starts in the Legislature, is enforced by the Executive, and disputes go to the Judiciary.",
      explanation: "The Legislature debates and passes a bill, it becomes law, the Executive enforces it, and the Judiciary resolves disputes about it.",
    };
  },
};
