import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, EAC_MEMBER_STATES, EASTERN_AFRICA_COUNTRIES, g6SsName, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

const OBJECTIVES = [
  "promoting closer economic integration among member states",
  "allowing the free movement of people and goods across member states' borders",
  "encouraging political cooperation between member states",
  "strengthening peace and security cooperation across the region",
] as const;

const BENEFITS = [
  "a larger combined market for goods produced in member states",
  "easier and cheaper cross-border trade between member states",
  "shared infrastructure projects, such as roads and railways, across member states",
  "greater cultural exchange between the people of member states",
] as const;

const CHALLENGES = [
  "member states sometimes having differing national policies and priorities",
  "gaps in infrastructure connecting member states",
  "occasional political tension between member states",
] as const;

const NON_MEMBERS = EASTERN_AFRICA_COUNTRIES.filter((c) => !(EAC_MEMBER_STATES as readonly string[]).includes(c));

function objectiveBenefitMc(rng: () => number): ScenarioMC {
  const isObjective = rng() > 0.5;
  const pool = isObjective ? OBJECTIVES : BENEFITS;
  const correct = randChoice(rng, pool);
  const wrongPool = isObjective ? BENEFITS : OBJECTIVES;
  return {
    prompt: isObjective
      ? "Which of these is an objective (an aim) of the East African Community?"
      : "Which of these is a benefit member states actually gain from the East African Community?",
    correct: correct.charAt(0).toUpperCase() + correct.slice(1),
    wrong: shuffle(rng, wrongPool.map((w) => w.charAt(0).toUpperCase() + w.slice(1))).slice(0, 3),
    explanation: `"${correct}" is ${isObjective ? "an objective — something the EAC aims to achieve" : "a benefit — something member states actually gain as a result"}.`,
  };
}

function challengeMc(rng: () => number): ScenarioMC {
  const correct = randChoice(rng, CHALLENGES);
  const wrong = shuffle(rng, [...OBJECTIVES, ...BENEFITS]).slice(0, 3);
  return {
    prompt: "Which of these is a genuine challenge facing the East African Community, rather than one of its objectives or benefits?",
    correct: correct.charAt(0).toUpperCase() + correct.slice(1),
    wrong: wrong.map((w) => w.charAt(0).toUpperCase() + w.slice(1)),
    explanation: `"${correct}" is a challenge the EAC faces, not one of its stated aims or benefits.`,
  };
}

function memberMc(rng: () => number): ScenarioMC {
  const wantMember = rng() > 0.5;
  const pool = wantMember ? EAC_MEMBER_STATES : NON_MEMBERS;
  const correct = randChoice(rng, pool);
  const wrongPool = wantMember ? NON_MEMBERS : EAC_MEMBER_STATES;
  return {
    prompt: wantMember ? "Which of these countries is a member state of the East African Community?" : "Which of these Eastern African countries is NOT a member of the East African Community?",
    correct,
    wrong: shuffle(rng, [...wrongPool]).slice(0, Math.min(3, wrongPool.length)),
    explanation: `${correct} is ${wantMember ? "" : "not "}a member state of the East African Community.`,
  };
}

export const regionalCooperations: Skill = {
  id: "g6-ss-pol-regional-cooperations",
  code: "PS.2",
  subjectId: "social-studies",
  strandId: "g6-ss-political",
  grade: 6,
  title: "Regional co-operations",
  description: "The East African Community's member states, objectives, benefits, and challenges.",
  generate(rng) {
    const branch = randChoice(rng, ["objective-benefit-mc", "member-mc", "challenge-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "objective-benefit-mc" || branch === "member-mc" || branch === "challenge-mc") {
      const q = branch === "objective-benefit-mc" ? objectiveBenefitMc(rng) : branch === "member-mc" ? memberMc(rng) : challengeMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "An objective is what the EAC aims to do; a benefit is what member states actually gain.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "The East African Community currently has", after: "member states.", correct: String(EAC_MEMBER_STATES.length) }),
        () => ({ before: `${name} learns that the EAC aims to allow the free movement of people and`, after: "across borders.", correct: "goods" }),
        () => ({ before: "A benefit member states gain from the EAC is access to a larger combined", after: ".", correct: "market" }),
        () => ({ before: "The EAC promotes closer economic", after: "among its member states.", correct: "integration" }),
        () => ({ before: "One challenge facing the EAC is that member states sometimes have differing national", after: ".", correct: "policies" }),
        () => ({ before: "Harmonising policies between member states helps solve challenges facing the", after: ".", correct: "EAC" }),
        () => ({ before: "The EAC also aims to strengthen peace and security", after: "across the region.", correct: "cooperation" }),
        () => ({ before: "Kenya, Uganda, and Tanzania are three of the founding member states of the East African", after: ".", correct: "Community" }),
        () => ({ before: "Shared infrastructure projects, such as roads and railways, are a", after: "of belonging to the EAC.", correct: "benefit" }),
        () => ({ before: "Somalia and Ethiopia are Eastern African countries that are, at the time of this design,", after: "member states of the EAC.", correct: "not" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about the East African Community.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the EAC's member states, objectives, and benefits.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...OBJECTIVES]).slice(0, 4);
      const tokens = chosen.map((o, i) => ({ id: `o${i}`, label: `Objective ${i + 1}` }));
      const targets = shuffle(rng, chosen).map((o) => ({ id: `o${chosen.indexOf(o)}`, label: o.charAt(0).toUpperCase() + o.slice(1) }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`o${i}`] = `o${i}`));
      return {
        kind: "click-match",
        prompt: "Match each numbered objective to its correct description of what the EAC aims to achieve.",
        tokens,
        targets,
        correctMap,
        hint: "Read each description carefully — they are all genuine EAC objectives.",
        explanation: chosen.map((o, i) => `Objective ${i + 1}: ${o}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...EASTERN_AFRICA_COUNTRIES]).slice(0, 6);
      const items = chosen.map((c) => ({ id: c, label: c }));
      const buckets = [
        { id: "member", label: "EAC member state" },
        { id: "non-member", label: "Not an EAC member state" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c] = (EAC_MEMBER_STATES as readonly string[]).includes(c) ? "member" : "non-member"));
      return {
        kind: "categorize",
        prompt: "Sort each Eastern African country as an EAC member state or not.",
        items,
        buckets,
        correctBucket,
        hint: "The EAC member states are Kenya, Uganda, Tanzania, Rwanda, Burundi, and South Sudan.",
        explanation: chosen.map((c) => `${c} is ${(EAC_MEMBER_STATES as readonly string[]).includes(c) ? "an EAC member state" : "not an EAC member state"}.`).join(" "),
      };
    }

    // ordering — the EAC's real, published integration pillars in the order the treaty sets out to achieve them.
    const pillars = [
      { id: "p1", label: "Customs Union — removing trade barriers between member states" },
      { id: "p2", label: "Common Market — allowing free movement of goods, people, and capital" },
      { id: "p3", label: "Monetary Union — working toward a shared regional currency" },
      { id: "p4", label: "Political Federation — the long-term goal of closer political unity" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these stages of East African Community integration in the order they are meant to be achieved.",
      items: shuffle(rng, pillars),
      correctOrder: pillars.map((p) => p.id),
      instruction: "Earliest stage first.",
      hint: "Trade barriers are removed before movement is fully free, and a shared currency comes before full political unity.",
      explanation: `The EAC's integration pillars, in order: ${pillars.map((p) => p.label).join(" → ")}.`,
    };
  },
};
