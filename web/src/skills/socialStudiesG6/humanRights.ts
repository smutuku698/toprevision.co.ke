import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

type Category = "political" | "social" | "economic";

const RIGHTS: { text: string; category: Category }[] = [
  { text: "The right to vote in elections", category: "political" },
  { text: "The right to freedom of assembly (meeting peacefully in groups)", category: "political" },
  { text: "The right to freedom of expression (sharing opinions)", category: "political" },
  { text: "The right to education", category: "social" },
  { text: "The right to healthcare", category: "social" },
  { text: "The right to a fair trial", category: "social" },
  { text: "The right to own property", category: "economic" },
  { text: "The right to work", category: "economic" },
  { text: "The right to fair wages for work done", category: "economic" },
];

const CATEGORY_LABEL: Record<Category, string> = { political: "Political rights", social: "Social rights", economic: "Economic rights" };

const UPHOLD_METHODS = [
  "protecting rights through the Constitution",
  "settling disputes about rights through the courts",
  "investigating complaints through a human rights commission",
  "raising awareness of rights through civic education",
  "pushing for change through community advocacy groups",
] as const;

function categoryMc(rng: () => number): ScenarioMC {
  const r = randChoice(rng, RIGHTS);
  const wrongCategories = shuffle(rng, (["political", "social", "economic"] as Category[]).filter((c) => c !== r.category));
  return {
    prompt: `"${r.text}" belongs to which classification of human rights?`,
    correct: CATEGORY_LABEL[r.category],
    wrong: wrongCategories.map((c) => CATEGORY_LABEL[c]),
    explanation: `"${r.text}" is classified as a ${r.category} right.`,
  };
}

function upholdMc(rng: () => number): ScenarioMC {
  const correct = randChoice(rng, UPHOLD_METHODS);
  const wrong = ["ignoring complaints about rights violations", "removing legal protection for citizens' rights", "keeping people uninformed about their rights"];
  const name = g6SsName(rng);
  const place = g6SsPlace(rng);
  return {
    prompt: `${name}, who lives near ${place}, asks how human rights are upheld in Kenya. Which of these is a genuine way rights are upheld?`,
    correct: correct.charAt(0).toUpperCase() + correct.slice(1),
    wrong,
    explanation: `Human rights are upheld by ${correct}.`,
  };
}

export const humanRights: Skill = {
  id: "g6-ss-pol-human-rights",
  code: "PS.4",
  subjectId: "social-studies",
  strandId: "g6-ss-political",
  grade: 6,
  title: "Human rights",
  description: "Classifying human rights into political, social, and economic categories, and ways rights are upheld in society.",
  generate(rng) {
    const branch = randChoice(rng, ["category-mc", "uphold-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "category-mc" || branch === "uphold-mc") {
      const q = branch === "category-mc" ? categoryMc(rng) : upholdMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Political rights are about participation in government; social rights are about wellbeing; economic rights are about work and property.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "Human rights are classified into political, social, and", after: "categories.", correct: "economic" }),
        () => ({ before: "The right to vote and the right to freedom of assembly are both", after: "rights.", correct: "political" }),
        () => ({ before: "The right to education and the right to healthcare are both", after: "rights.", correct: "social" }),
        () => ({ before: `${name} learns that the right to own property and the right to fair wages are`, after: "rights.", correct: "economic" }),
        () => ({ before: "The document that legally protects citizens' rights in Kenya is the", after: ".", correct: "Constitution" }),
        () => ({ before: "Disputes about rights violations can be settled through the", after: ".", correct: "courts" }),
        () => ({ before: "A body that investigates complaints about rights violations is a human rights", after: ".", correct: "commission" }),
        () => ({ before: "Teaching people about their rights and duties is called civic", after: ".", correct: "education" }),
        () => ({ before: "Groups that push for change to protect people's rights are called", after: "groups.", correct: "advocacy" }),
        () => ({ before: "Respecting human rights helps promote", after: "in society.", correct: "unity" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about human rights.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the three categories of rights and the ways they are upheld.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, RIGHTS).slice(0, 6);
      const tokens = chosen.map((r, i) => ({ id: `r${i}`, label: r.text }));
      const targets = shuffle(rng, chosen).map((r) => ({ id: `r${chosen.indexOf(r)}`, label: CATEGORY_LABEL[r.category] }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`r${i}`] = `r${i}`));
      return {
        kind: "click-match",
        prompt: "Match each right to its category.",
        tokens,
        targets,
        correctMap,
        hint: "Sort by whether the right concerns government participation, wellbeing, or work/property.",
        explanation: chosen.map((r) => `"${r.text}" is a ${r.category} right.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, RIGHTS).slice(0, 6);
      const items = chosen.map((r, i) => ({ id: `it${i}`, label: r.text }));
      const bucketCats = Array.from(new Set(chosen.map((r) => r.category)));
      const buckets = bucketCats.map((c) => ({ id: c, label: CATEGORY_LABEL[c] }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((r, i) => (correctBucket[`it${i}`] = r.category));
      return {
        kind: "categorize",
        prompt: "Sort each right into its correct classification: political, social, or economic.",
        items,
        buckets,
        correctBucket,
        hint: "Political = participation in government; social = wellbeing; economic = work and property.",
        explanation: chosen.map((r) => `"${r.text}" is classified as a ${r.category} right.`).join(" "),
      };
    }

    // ordering — a genuine, sensible sequence for seeking redress when a right is violated.
    const steps = [
      { id: "s1", label: "Recognise that a right has been violated" },
      { id: "s2", label: "Report the violation to the relevant authority, such as the police or a human rights commission" },
      { id: "s3", label: "Seek legal assistance if needed" },
      { id: "s4", label: "Pursue the case through the courts if it is not resolved" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these steps in a sensible order for seeking redress when a human right has been violated.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      instruction: "First step first.",
      hint: "A person must recognise and report a violation before pursuing legal help or the courts.",
      explanation: `A sensible order for seeking redress is: ${steps.map((s) => s.label).join(" → ")}.`,
    };
  },
};
