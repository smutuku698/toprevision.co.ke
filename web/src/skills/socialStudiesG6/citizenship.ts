import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

const RIGHTS_RESPONSIBILITIES = [
  { text: "The right to vote in national and county elections", bucket: "right" },
  { text: "The right to free basic education", bucket: "right" },
  { text: "The right to freedom of expression", bucket: "right" },
  { text: "The right to own property", bucket: "right" },
  { text: "Obeying the laws of the country", bucket: "responsibility" },
  { text: "Paying taxes owed to the government", bucket: "responsibility" },
  { text: "Respecting the rights of other citizens", bucket: "responsibility" },
  { text: "Participating in national development, such as community projects", bucket: "responsibility" },
  { text: "Protecting and conserving the environment", bucket: "responsibility" },
] as const;

const QUALITIES = ["honesty", "patriotism", "respect for the law", "tolerance of other people's views", "hard work", "willingness to serve the community"] as const;

function rightsMc(rng: () => number): ScenarioMC {
  const wantRight = rng() > 0.5;
  const pool = RIGHTS_RESPONSIBILITIES.filter((r) => r.bucket === (wantRight ? "right" : "responsibility"));
  const target = randChoice(rng, pool);
  const wrongPool = RIGHTS_RESPONSIBILITIES.filter((r) => r.bucket !== target.bucket);
  return {
    prompt: wantRight ? "Which of these is a right of a Kenyan citizen?" : "Which of these is a responsibility of a Kenyan citizen?",
    correct: target.text,
    wrong: shuffle(rng, wrongPool.map((r) => r.text)).slice(0, 3),
    explanation: `"${target.text}" is a ${target.bucket} — a ${target.bucket === "right" ? "citizen is entitled to it" : "citizen is expected to do it"}.`,
  };
}

function qualityMc(rng: () => number): ScenarioMC {
  const correct = randChoice(rng, QUALITIES);
  const wrong = ["dishonesty in dealing with others", "disregard for the country's laws", "refusing to ever help the community"];
  const name = g6SsName(rng);
  const place = g6SsPlace(rng);
  return {
    prompt: `${name}, who lives near ${place}, wants to be a good Kenyan citizen. Which quality should ${name} practise?`,
    correct,
    wrong,
    explanation: `${correct.charAt(0).toUpperCase() + correct.slice(1)} is a quality of a good Kenyan citizen.`,
  };
}

export const citizenship: Skill = {
  id: "g6-ss-pol-citizenship",
  code: "PS.3",
  subjectId: "social-studies",
  strandId: "g6-ss-political",
  grade: 6,
  title: "Citizenship",
  description: "The rights and responsibilities of a Kenyan citizen, and the qualities of good citizenship.",
  generate(rng) {
    const branch = randChoice(rng, ["rights-mc", "quality-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "rights-mc" || branch === "quality-mc") {
      const q = branch === "rights-mc" ? rightsMc(rng) : qualityMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "A right is something a citizen is entitled to; a responsibility is something a citizen must do.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "The right to vote in elections is an example of a citizen's", after: ".", correct: "right" }),
        () => ({ before: "Paying taxes owed to the government is an example of a citizen's", after: ".", correct: "responsibility" }),
        () => ({ before: `${name} learns that a citizen is entitled to freedom of`, after: ", the right to share opinions freely.", correct: "expression" }),
        () => ({ before: "Obeying the laws of the country is a basic citizen", after: ".", correct: "responsibility" }),
        () => ({ before: "A citizen who loves and takes pride in their country shows", after: ".", correct: "patriotism" }),
        () => ({ before: "Respecting the rights of other citizens is a responsibility that promotes", after: "in society.", correct: "harmony" }),
        () => ({ before: "The right to attend free basic school is the right to", after: ".", correct: "education" }),
        () => ({ before: "Taking part in community projects shows participation in national", after: ".", correct: "development" }),
        () => ({ before: "A good citizen protects and", after: "the environment.", correct: "conserves" }),
        () => ({ before: "The right to legally own land or belongings is the right to own", after: ".", correct: "property" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about citizenship in Kenya.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Distinguish a right (entitlement) from a responsibility (duty).",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const rows = [
        { id: "vote", label: "Right to vote", value: "Choosing leaders through elections" },
        { id: "expression", label: "Right to freedom of expression", value: "Sharing opinions and ideas openly" },
        { id: "taxes", label: "Responsibility to pay taxes", value: "Contributing money the government uses for public services" },
        { id: "laws", label: "Responsibility to obey the law", value: "Following the country's legal rules" },
        { id: "property", label: "Right to own property", value: "Legally owning land or belongings" },
        { id: "community", label: "Responsibility to serve the community", value: "Taking part in community projects and development" },
      ] as const;
      const chosen = shuffle(rng, rows).slice(0, 5);
      const tokens = chosen.map((r) => ({ id: r.id, label: r.label }));
      const targets = shuffle(rng, chosen).map((r) => ({ id: r.id, label: r.value }));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.id] = r.id;
      return {
        kind: "click-match",
        prompt: "Match each right or responsibility to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Read what each right or responsibility actually involves doing or receiving.",
        explanation: chosen.map((r) => `${r.label}: ${r.value}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...RIGHTS_RESPONSIBILITIES]).slice(0, 6);
      const items = chosen.map((r, i) => ({ id: `rr${i}`, label: r.text }));
      const buckets = [
        { id: "right", label: "A right of a citizen" },
        { id: "responsibility", label: "A responsibility of a citizen" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((r, i) => (correctBucket[`rr${i}`] = r.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement as a right or a responsibility of a Kenyan citizen.",
        items,
        buckets,
        correctBucket,
        hint: "A right is something you are entitled to; a responsibility is something you must do.",
        explanation: chosen.map((r) => `"${r.text}" is a ${r.bucket}.`).join(" "),
      };
    }

    // ordering — a genuine, sensible sequence for a citizen exercising their voting right.
    const steps = [
      { id: "s1", label: "Register as a voter with the electoral commission" },
      { id: "s2", label: "Learn about the candidates and their plans" },
      { id: "s3", label: "Go to the polling station on election day" },
      { id: "s4", label: "Cast a vote for the preferred candidate" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these steps in the order a Kenyan citizen would follow to exercise their right to vote.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      instruction: "First step first.",
      hint: "A citizen must be registered and informed before they can vote at a polling station.",
      explanation: `Exercising the right to vote follows: ${steps.map((s) => s.label).join(" → ")}.`,
    };
  },
};
