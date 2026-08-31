import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

type Family = "Bantu" | "Nilotic" | "Cushitic";

interface FamilyInfo {
  family: Family;
  origin: string;
  livelihood: string;
}

const FAMILIES: readonly FamilyInfo[] = [
  { family: "Bantu", origin: "expanded into Eastern Africa from West and Central Africa, bringing farming and ironworking skills", livelihood: "mixed farming, growing crops and keeping some livestock" },
  { family: "Nilotic", origin: "migrated into Eastern Africa from the Nile valley area to the north", livelihood: "pastoralism, herding cattle, sheep, and goats over wide areas" },
  { family: "Cushitic", origin: "were among the earliest language groups to settle in Eastern Africa, mainly in the Horn of Africa region", livelihood: "pastoralism adapted to drier, semi-arid conditions" },
] as const;

const PUSH_PULL = [
  { statement: "A community moves because their home area suffers repeated, severe drought", bucket: "push" },
  { statement: "A community moves in search of pasture and water for their herds", bucket: "push" },
  { statement: "A community moves away from an area experiencing conflict or insecurity", bucket: "push" },
  { statement: "A community moves because population pressure has left too little farmland at home", bucket: "push" },
  { statement: "A community moves toward fertile, well-watered land that is currently unoccupied", bucket: "pull" },
  { statement: "A community moves toward an area offering better opportunities for trade", bucket: "pull" },
  { statement: "A community moves toward land known to be good for grazing large herds", bucket: "pull" },
  { statement: "A community moves toward a region with a milder, more favourable climate", bucket: "pull" },
] as const;

function originMc(rng: () => number): ScenarioMC {
  const f = randChoice(rng, FAMILIES);
  const others = shuffle(rng, FAMILIES.filter((o) => o.family !== f.family)).slice(0, 2);
  const place = g6SsPlace(rng);
  return {
    prompt: `A community near ${place} is classified as a ${f.family} language group. Which statement best describes how this group came to be in Eastern Africa?`,
    correct: f.origin.charAt(0).toUpperCase() + f.origin.slice(1),
    wrong: others.map((o) => o.origin.charAt(0).toUpperCase() + o.origin.slice(1)),
    explanation: `${f.family} language groups ${f.origin}.`,
  };
}

function livelihoodMc(rng: () => number): ScenarioMC {
  const f = randChoice(rng, FAMILIES);
  const others = shuffle(rng, FAMILIES.filter((o) => o.family !== f.family)).slice(0, 2);
  return {
    prompt: `Which livelihood is most closely associated with ${f.family} language groups in Eastern Africa?`,
    correct: f.livelihood.charAt(0).toUpperCase() + f.livelihood.slice(1),
    wrong: others.map((o) => o.livelihood.charAt(0).toUpperCase() + o.livelihood.slice(1)),
    explanation: `${f.family} language groups are traditionally associated with ${f.livelihood}.`,
  };
}

export const languageGroups: Skill = {
  id: "g6-ss-ppl-language-groups",
  code: "P.1",
  subjectId: "social-studies",
  strandId: "g6-ss-people",
  grade: 6,
  title: "Language groups in Eastern Africa",
  description: "Classifying Eastern African communities by language group, reasons for migration, and the effects of settlement.",
  generate(rng) {
    const branch = randChoice(rng, ["origin-mc", "livelihood-mc", "fill-blank", "click-match", "categorize-pushpull", "categorize-effects", "ordering"] as const);

    if (branch === "origin-mc" || branch === "livelihood-mc") {
      const q = branch === "origin-mc" ? originMc(rng) : livelihoodMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Recall where each language family originally migrated from and what livelihood it is traditionally linked to.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "Communities in Eastern Africa are commonly classified by language into three families: Bantu, Nilotic, and", after: ".", correct: "Cushitic" }),
        () => ({ before: `${name} learns that farming and ironworking skills spread widely with the expansion of`, after: "language groups.", correct: "Bantu" }),
        () => ({ before: "Language groups that migrated into Eastern Africa from the Nile valley area, and are traditionally linked to cattle herding, are", after: ".", correct: "Nilotic" }),
        () => ({ before: "Among the earliest language groups to settle in the Horn of Africa region are the", after: "language groups.", correct: "Cushitic" }),
        () => ({ before: "A reason that pushes a community to leave home, such as drought or insecurity, is called a", after: "factor.", correct: "push" }),
        () => ({ before: "A reason that draws a community toward a new area, such as fertile land, is called a", after: "factor.", correct: "pull" }),
        () => ({ before: "When two migrating communities settle near each other, marriage between their members is called", after: ".", correct: "intermarriage" }),
        () => ({ before: "The sharing of customs, food, and words between neighbouring communities is called cultural", after: ".", correct: "exchange" }),
        () => ({ before: "Migration can sometimes lead to competition over land and water, which may cause", after: ".", correct: "conflict" }),
        () => ({ before: "Communities in Eastern Africa are classified into groups mainly based on the", after: "they speak.", correct: "language" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about language groups in Eastern Africa.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the three language families and how migration works.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...FAMILIES]);
      const tokens = chosen.map((f) => ({ id: f.family, label: f.family }));
      const targets = shuffle(rng, chosen).map((f) => ({ id: f.family, label: f.origin.charAt(0).toUpperCase() + f.origin.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.family] = f.family;
      return {
        kind: "click-match",
        prompt: "Match each language family to how it came to be in Eastern Africa.",
        tokens,
        targets,
        correctMap,
        hint: "Recall where each family migrated from.",
        explanation: chosen.map((f) => `${f.family}: ${f.origin}.`).join(" "),
      };
    }

    if (branch === "categorize-pushpull") {
      const chosen = shuffle(rng, [...PUSH_PULL]).slice(0, 6);
      const items = chosen.map((p, i) => ({ id: `pp${i}`, label: p.statement }));
      const buckets = [
        { id: "push", label: "Push factor (drives people away)" },
        { id: "pull", label: "Pull factor (draws people toward a new area)" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`pp${i}`] = p.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each reason for migration as a push factor or a pull factor.",
        items,
        buckets,
        correctBucket,
        hint: "A push factor is a problem at home; a pull factor is something attractive about the new place.",
        explanation: chosen.map((p) => `"${p.statement}" is a ${p.bucket} factor.`).join(" "),
      };
    }

    if (branch === "categorize-effects") {
      const scenarios = [
        { id: "e1", label: "Two neighbouring communities begin trading goods and learning each other's customs", bucket: "effect" },
        { id: "e2", label: "A young man from one settled community marries a woman from a neighbouring community", bucket: "effect" },
        { id: "e3", label: "A newly arrived group teaches its ironworking skills to a community already living in the area", bucket: "effect" },
        { id: "e4", label: "Two communities dispute over the same grazing land after one group settles nearby", bucket: "effect" },
        { id: "e5", label: "A community decides on its own, without any migration, to build a new well", bucket: "not an effect" },
        { id: "e6", label: "A school timetable is changed to add an extra music lesson", bucket: "not an effect" },
      ] as const;
      const chosen2 = shuffle(rng, scenarios).slice(0, 6);
      const items2 = chosen2.map((s) => ({ id: s.id, label: s.label }));
      const buckets2 = [
        { id: "effect", label: "An effect of migration and settlement" },
        { id: "not an effect", label: "Not related to migration" },
      ];
      const correctBucket2: Record<string, string> = {};
      chosen2.forEach((s) => (correctBucket2[s.id] = s.bucket));
      return {
        kind: "categorize",
        prompt: "Decide whether each described outcome is an effect of language-group migration and settlement.",
        items: items2,
        buckets: buckets2,
        correctBucket: correctBucket2,
        hint: "An effect of migration involves two communities interacting because one of them moved.",
        explanation: chosen2.map((s) => `"${s.label}" is ${s.bucket === "effect" ? "an effect of migration and settlement" : "not related to migration"}.`).join(" "),
      };
    }

    // ordering — a genuine, generic sequence of a community's migration and settlement.
    const steps = [
      { id: "s1", label: "A push factor, such as drought or insecurity, makes staying at home difficult" },
      { id: "s2", label: "The community decides to migrate toward a more promising area" },
      { id: "s3", label: "The community travels and arrives in the new area" },
      { id: "s4", label: "The community settles and begins interacting with any communities already living there" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these steps of migration and settlement in the correct order.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      instruction: "First step first.",
      hint: "A push factor comes before the decision to move, and settlement only happens after arrival.",
      explanation: `Migration and settlement typically follows: ${steps.map((s) => s.label).join(" → ")}.`,
    };
  },
};
