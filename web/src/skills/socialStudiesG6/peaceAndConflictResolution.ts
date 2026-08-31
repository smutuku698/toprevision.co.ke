import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

const CAUSE_METHODS = [
  { cause: "Two neighbouring communities dispute over scarce grazing land", method: "mediation or negotiation over the disputed land", wrongMethod: "involving elders in a family counselling session" },
  { cause: "Tension rises between two ethnic communities living near each other", method: "dialogue and community reconciliation forums", wrongMethod: "taking the dispute straight to court" },
  { cause: "Two political leaders disagree over how a county should be governed", method: "arbitration, following legal and constitutional dispute channels", wrongMethod: "organising a community reconciliation forum" },
  { cause: "A disagreement breaks out between two family members", method: "counselling, often involving respected elders", wrongMethod: "mediation over disputed grazing land" },
] as const;

const PEACE_ACTIONS = [
  { label: "A school starts a peace club where learners discuss ways to resolve disagreements", promotesPeace: true },
  { label: "Community leaders from different groups hold regular dialogue meetings", promotesPeace: true },
  { label: "Teachers include peace education lessons in the school timetable", promotesPeace: true },
  { label: "The government runs a national cohesion initiative to bring communities together", promotesPeace: true },
  { label: "Two groups refuse to speak to each other and spread rumours about one another", promotesPeace: false },
  { label: "A leader encourages followers to blame another community for every problem", promotesPeace: false },
] as const;

function causeMethodMc(rng: () => number): ScenarioMC {
  const cm = randChoice(rng, CAUSE_METHODS);
  const correct = cm.method.charAt(0).toUpperCase() + cm.method.slice(1);
  // Dedupe wrong-answer candidates by text — cm.wrongMethod deliberately echoes another entry's real
  // method, which can otherwise collide with an independently-sampled "other" wrong answer.
  const candidates = Array.from(new Set([cm.wrongMethod, ...CAUSE_METHODS.filter((o) => o.method !== cm.method).map((o) => o.method)]));
  const wrong = shuffle(rng, candidates)
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  const place = g6SsPlace(rng);
  return {
    prompt: `Near ${place}, this conflict has arisen: "${cm.cause}." Which peaceful method would best resolve it?`,
    correct,
    wrong,
    explanation: `"${cm.cause}" is best resolved through ${cm.method}.`,
  };
}

export const peaceAndConflictResolution: Skill = {
  id: "g6-ss-gov-peace-and-conflict-resolution",
  code: "G.1",
  subjectId: "social-studies",
  strandId: "g6-ss-governance",
  grade: 6,
  title: "Peace and conflict resolution",
  description: "Causes of conflict in society, peaceful methods of resolving them, and ways of promoting peace.",
  generate(rng) {
    const branch = randChoice(rng, ["cause-method-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "cause-method-mc") {
      const q = causeMethodMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Match the type of conflict — land, ethnic, political, or family — to the method designed for it.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "A dispute over scarce grazing land between two communities can be resolved through", after: ".", correct: "mediation" }),
        () => ({ before: "Tension between ethnic communities can be eased through dialogue and community reconciliation", after: ".", correct: "forums" }),
        () => ({ before: `${name} learns that political disagreements are meant to follow legal and constitutional dispute`, after: ".", correct: "channels" }),
        () => ({ before: "Family disagreements are often resolved through counselling, sometimes involving respected", after: ".", correct: "elders" }),
        () => ({ before: "A school club where learners discuss peaceful ways to resolve disagreements is called a peace", after: ".", correct: "club" }),
        () => ({ before: "Lessons that teach learners about peaceful coexistence are called peace", after: ".", correct: "education" }),
        () => ({ before: "A government programme that brings different communities together is called a national cohesion", after: ".", correct: "initiative" }),
        () => ({ before: "Settling a disagreement without violence, through discussion and compromise, is called peaceful conflict", after: ".", correct: "resolution" }),
        () => ({ before: "Regular meetings between leaders of different communities are called inter-community", after: ".", correct: "dialogue" }),
        () => ({ before: "A common cause of conflict is competition for scarce", after: "such as land and water.", correct: "resources" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about peace and conflict resolution.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the causes of conflict and the peaceful methods used to resolve them.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...CAUSE_METHODS]);
      const tokens = chosen.map((c, i) => ({ id: `c${i}`, label: c.cause }));
      const targets = shuffle(rng, chosen).map((c) => ({ id: `c${chosen.indexOf(c)}`, label: c.method.charAt(0).toUpperCase() + c.method.slice(1) }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`c${i}`] = `c${i}`));
      return {
        kind: "click-match",
        prompt: "Match each cause of conflict to the peaceful method best suited to resolve it.",
        tokens,
        targets,
        correctMap,
        hint: "Different types of conflict call for different peaceful methods.",
        explanation: chosen.map((c) => `"${c.cause}" is resolved through ${c.method}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...PEACE_ACTIONS]).slice(0, 6);
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.label }));
      const buckets = [
        { id: "promotes", label: "Promotes peace" },
        { id: "harms", label: "Damages peace" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.promotesPeace ? "promotes" : "harms"));
      return {
        kind: "categorize",
        prompt: "Judge each action: does it promote peace or damage it?",
        items,
        buckets,
        correctBucket,
        hint: "Peace-promoting actions build dialogue and understanding; harmful actions spread division and blame.",
        explanation: chosen.map((a) => `"${a.label}" ${a.promotesPeace ? "promotes peace" : "damages peace"}.`).join(" "),
      };
    }

    // ordering — a genuine, generic mediation process sequence.
    const steps = [
      { id: "s1", label: "Both sides agree to sit down and talk" },
      { id: "s2", label: "A neutral mediator listens to both sides" },
      { id: "s3", label: "Possible compromises are discussed" },
      { id: "s4", label: "Both sides agree on a solution and follow it" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these steps of a peaceful mediation process in the correct order.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      instruction: "First step first.",
      hint: "Both sides must first agree to talk before a mediator can listen and compromises can be discussed.",
      explanation: `A mediation process follows: ${steps.map((s) => s.label).join(" → ")}.`,
    };
  },
};
