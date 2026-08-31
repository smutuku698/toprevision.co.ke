import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, name, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Human Rights" — age-appropriate basic rights,
// simplified from Kenya's Constitution Bill of Rights, matching the design's PCI emphasis on children's
// rights. See curriculum-reference/grade-5/social-studies.json.

const RIGHTS: { id: string; right: string; reason: string }[] = [
  { id: "life", right: "the right to life", reason: "every person deserves protection and safety" },
  { id: "education", right: "the right to education", reason: "learning helps a person grow and reach their full potential" },
  { id: "health", right: "the right to health care", reason: "good health allows a person to live and grow well" },
  { id: "shelter", right: "the right to shelter", reason: "everyone needs a safe home to live in" },
  { id: "protection", right: "the right to protection from harm", reason: "children and adults deserve to be kept safe from abuse" },
  { id: "expression", right: "freedom of expression", reason: "everyone should be able to share their thoughts and opinions" },
  { id: "play", right: "the right to play and leisure", reason: "children need time to play and rest for healthy development" },
];

const SCENARIOS: { id: string; label: string; respected: boolean }[] = [
  { id: "s1", label: "A child is allowed to attend school every day", respected: true },
  { id: "s2", label: "A sick child is taken to a clinic for treatment", respected: true },
  { id: "s3", label: "A learner is given time to play during break", respected: true },
  { id: "s4", label: "A family is given a safe place to live", respected: true },
  { id: "s5", label: "A child is stopped from going to school without good reason", respected: false },
  { id: "s6", label: "A child is denied medical treatment when sick", respected: false },
  { id: "s7", label: "A learner is bullied and not protected from harm", respected: false },
  { id: "s8", label: "A child is never allowed to share their opinion", respected: false },
];

export const humanRights: Skill = {
  id: "g5-ss-gov-human-rights",
  code: "G.2",
  subjectId: "social-studies",
  strandId: "g5-ss-governance",
  grade: 5,
  title: "Human Rights",
  description: "Identifying basic human rights, their importance, and ways to protect and respect them.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const s = randChoice(rng, SCENARIOS.filter((x) => x.respected));
      const relatedRight = RIGHTS.find((r) => s.label.toLowerCase().includes(r.id === "education" ? "school" : r.id === "health" ? "clinic" : r.id === "play" ? "play" : r.id === "shelter" ? "live" : r.id));
      const target = relatedRight ?? randChoice(rng, RIGHTS);
      const choices = shuffle(rng, RIGHTS.map((r) => r.right));
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "human right being shown")} Scenario: "${s.label}."`,
        choices,
        correctIndex: choices.indexOf(target.right),
        hint: target.reason,
        explanation: `This scenario shows ${target.right}: ${target.reason}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, RIGHTS).slice(0, 4);
      const tokens = chosen.map((r) => ({ id: r.id, label: r.right.charAt(0).toUpperCase() + r.right.slice(1) }));
      const targets = shuffle(rng, chosen).map((r) => ({ id: r.id, label: r.reason.charAt(0).toUpperCase() + r.reason.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.id] = r.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "human right to why it matters"),
        tokens,
        targets,
        correctMap,
        hint: "Think about why each right is important for wellbeing.",
        explanation: chosen.map((r) => `${r.right}: ${r.reason}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SCENARIOS).slice(0, 6);
      const correctBucket: Record<string, string> = {};
      for (const s of chosen) correctBucket[s.id] = s.respected ? "RESPECTED" : "VIOLATED";
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether the right is being respected or violated"),
        items: chosen.map((s) => ({ id: s.id, label: s.label })),
        buckets: [
          { id: "RESPECTED", label: "Right Respected" },
          { id: "VIOLATED", label: "Right Violated" },
        ],
        correctBucket,
        hint: "A respected right is protected and allowed; a violated right is denied or ignored.",
        explanation: chosen.map((s) => `"${s.label}" shows a right being ${s.respected ? "respected" : "violated"}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const n = name(rng);
      const r = randChoice(rng, RIGHTS);
      const templates = [
        () => ({ before: `${n} learns that going to school every day is protected by ${n}'s right to`, after: ".", correct: "education" }),
        () => ({ before: "Rights protect a person's dignity and", after: ".", correct: "well-being" }),
        () => ({ before: "If a child witnesses a right being violated, they should tell a trusted", after: ".", correct: "adult" }),
        () => ({ before: `The right which means every child needs time to rest and have fun is the right to`, after: ".", correct: "play and leisure" }),
        () => ({ before: `${n} knows that respecting other people's rights helps build a fair and peaceful`, after: ".", correct: "society" }),
        () => ({ before: `Everyone needs a safe home, which is protected by the right to`, after: ".", correct: "shelter" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the basic human rights: life, education, health care, shelter, protection, expression, play.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "notice", label: "A child notices a right being violated" },
      { id: "tell", label: "The child tells a trusted adult" },
      { id: "help", label: "The trusted adult helps or reports the matter" },
      { id: "addressed", label: "The situation is addressed" },
    ]);
    const correctOrder = ["notice", "tell", "help", "addressed"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps a child should take if they witness a right being violated"),
      instruction: "Arrange the steps in the correct order.",
      items: steps,
      correctOrder,
      hint: "It starts with noticing the problem and ends with the situation being addressed.",
      explanation: "First notice the problem, tell a trusted adult, the adult helps or reports it, and the situation is addressed.",
    };
  },
};
