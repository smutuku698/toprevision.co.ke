import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

// This sub-strand's source design names EXACTLY TWO traditional societies to compare — the Buganda and the
// Nyamwezi — so the underlying fact pool is deliberately narrow (per RIGOR-STANDARDS.md's pool-size floor
// guidance: do not invent additional named traditional kingdoms not in the source). Template count for
// fill-blank/scenario branches sits closer to the 5-8 range rather than 10+, compensated for by varying the
// scenario wrapper and by the categorize/compare branch, which draws real comparative depth from just these
// two societies rather than needing more named entities.

const SYSTEMS = [
  {
    society: "the Buganda",
    country: "present-day Uganda",
    structure: "centralised",
    ruler: "a hereditary king called the Kabaka",
    council: "a council called the Lukiiko, which advises the Kabaka and checks his power",
    chiefs: "chiefs who administer regions on the Kabaka's behalf",
  },
  {
    society: "the Nyamwezi",
    country: "present-day Tanzania",
    structure: "decentralised",
    ruler: "no single central ruler",
    council: "no single overarching royal council",
    chiefs: "several local chiefs who govern their own areas somewhat independently",
  },
] as const;

function structureMc(rng: () => number): ScenarioMC {
  const s = randChoice(rng, SYSTEMS);
  const other = SYSTEMS.find((o) => o.society !== s.society)!;
  return {
    prompt: `Traditional governance among ${s.society} in ${s.country} is best described as which type of system?`,
    correct: s.structure.charAt(0).toUpperCase() + s.structure.slice(1) + " — power held mainly by one ruler",
    wrong: [other.structure.charAt(0).toUpperCase() + other.structure.slice(1) + " — power spread across several local rulers", "Monarchical, but with no chiefs at all", "Governed entirely by outside colonial officials"],
    explanation: `${s.society} had a ${s.structure} system: ${s.ruler}, supported by ${s.chiefs}.`,
  };
}

function compareMc(rng: () => number): ScenarioMC {
  const name = g6SsName(rng);
  const correct = "The Buganda were centralised under one king (the Kabaka); the Nyamwezi were decentralised, governed by several local chiefs";
  const wrong = [
    "The Buganda were decentralised with several chiefs; the Nyamwezi were centralised under one king",
    "Both the Buganda and the Nyamwezi were ruled by a single king with no other leaders",
    "Neither the Buganda nor the Nyamwezi had any form of traditional leadership",
  ];
  return {
    prompt: `${name} is asked to compare the traditional governments of the Buganda and the Nyamwezi. Which comparison is correct?`,
    correct,
    wrong,
    explanation: `${correct} — this is the key difference between the two traditional systems.`,
  };
}

export const traditionalFormsOfGovernment: Skill = {
  id: "g6-ss-pol-traditional-forms-of-government",
  code: "PS.1",
  subjectId: "social-studies",
  strandId: "g6-ss-political",
  grade: 6,
  title: "Traditional forms of government",
  description: "Comparing the traditional governance systems of the Buganda and the Nyamwezi in Eastern Africa.",
  generate(rng) {
    const branch = randChoice(rng, ["structure-mc", "compare-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "structure-mc" || branch === "compare-mc") {
      const q = branch === "structure-mc" ? structureMc(rng) : compareMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "The Buganda had one central king; the Nyamwezi had several local chiefs instead.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const templates = [
        () => ({ before: "The traditional ruler of the Buganda kingdom was called the", after: ".", correct: "Kabaka" }),
        () => ({ before: "The Buganda's traditional council, which advised the Kabaka and checked his power, was called the", after: ".", correct: "Lukiiko" }),
        () => ({ before: "The Buganda kingdom was located in present-day", after: ".", correct: "Uganda" }),
        () => ({ before: "The Nyamwezi society was located in present-day", after: ".", correct: "Tanzania" }),
        () => ({ before: "Unlike the Buganda, the Nyamwezi did not have one central king — power was spread among several local", after: ".", correct: "chiefs" }),
        () => ({ before: "A governance system where power is held mainly by one central ruler, like the Buganda's, is called", after: ".", correct: "centralised" }),
        () => ({ before: "A governance system where power is spread across several local leaders, like the Nyamwezi's, is called", after: ".", correct: "decentralised" }),
        () => ({ before: "In Buganda, chiefs administered regions on behalf of the", after: ".", correct: "Kabaka" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about traditional forms of government.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the Buganda's centralised kingship and the Nyamwezi's decentralised chieftaincy.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const rows = [
        { id: "kabaka", label: "The Kabaka", value: "The hereditary king who ruled the Buganda kingdom" },
        { id: "lukiiko", label: "The Lukiiko", value: "The Buganda's traditional council that advised and checked the Kabaka's power" },
        { id: "nyamwezi-chiefs", label: "Nyamwezi local chiefs", value: "Leaders who governed their own areas independently, with no single central ruler" },
        { id: "buganda-chiefs", label: "Buganda regional chiefs", value: "Leaders who administered regions on behalf of the Kabaka" },
      ] as const;
      const chosen = shuffle(rng, rows);
      const tokens = chosen.map((r) => ({ id: r.id, label: r.label }));
      const targets = shuffle(rng, chosen).map((r) => ({ id: r.id, label: r.value }));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.id] = r.id;
      return {
        kind: "click-match",
        prompt: "Match each term to its role in traditional Buganda or Nyamwezi governance.",
        tokens,
        targets,
        correctMap,
        hint: "Think about who held power and who advised or administered on their behalf.",
        explanation: chosen.map((r) => `${r.label}: ${r.value}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      // The compare/contrast branch — the outcome explicitly says "compare," so this requires sorting
      // governance features between the two named systems, not treating them in isolation.
      const features = [
        { id: "f1", label: "Governed by a single hereditary king (the Kabaka)", society: "the Buganda" },
        { id: "f2", label: "Advised by a council called the Lukiiko", society: "the Buganda" },
        { id: "f3", label: "Chiefs administer regions on the ruler's behalf", society: "the Buganda" },
        { id: "f4", label: "No single central ruler over the whole society", society: "the Nyamwezi" },
        { id: "f5", label: "Several local chiefs govern their own areas independently", society: "the Nyamwezi" },
        { id: "f6", label: "Found in present-day Tanzania", society: "the Nyamwezi" },
      ] as const;
      const chosen = shuffle(rng, features).slice(0, 6);
      const items = chosen.map((f) => ({ id: f.id, label: f.label }));
      const buckets = [
        { id: "the Buganda", label: "The Buganda" },
        { id: "the Nyamwezi", label: "The Nyamwezi" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f) => (correctBucket[f.id] = f.society));
      return {
        kind: "categorize",
        prompt: "Sort each governance feature as belonging to the Buganda or the Nyamwezi traditional system.",
        items,
        buckets,
        correctBucket,
        hint: "The Buganda had one central king with a council; the Nyamwezi had several independent chiefs instead.",
        explanation: chosen.map((f) => `"${f.label}" describes ${f.society}.`).join(" "),
      };
    }

    // ordering — a defensible generic sequence of how a decision moved through Buganda's centralised system.
    const steps = [
      { id: "s1", label: "The Kabaka proposes a decision for the kingdom" },
      { id: "s2", label: "The Lukiiko discusses and advises on the decision" },
      { id: "s3", label: "Regional chiefs are informed of the final decision" },
      { id: "s4", label: "Chiefs implement the decision in their own regions" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these steps in the order a decision would move through the Buganda's centralised system of government.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      instruction: "First step first.",
      hint: "The Kabaka and the Lukiiko decide before chiefs are informed, and chiefs act only after being informed.",
      explanation: `In Buganda's centralised system: ${steps.map((s) => s.label).join(" → ")}.`,
    };
  },
};
