import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

const MECHANISMS = [
  { id: "pta", label: "Parent-teacher meetings", benefit: "parents and teachers share information about learners' progress" },
  { id: "harambee", label: "Community fundraising (harambee) for school projects", benefit: "the school gets extra resources to build or repair facilities" },
  { id: "resource", label: "Inviting community members as resource persons for lessons", benefit: "learners gain knowledge directly from people with real experience" },
  { id: "openday", label: "School open days", benefit: "the community sees and appreciates what learners are achieving" },
  { id: "cleanup", label: "Joint school-community clean-up or tree-planting days", benefit: "both the school compound and the wider community benefit from a cleaner, greener environment" },
  { id: "facilities", label: "Community use of school facilities such as fields or halls", benefit: "the community gets access to spaces it may not otherwise have" },
] as const;

function benefitMc(rng: () => number): ScenarioMC {
  const m = randChoice(rng, MECHANISMS);
  const others = shuffle(rng, MECHANISMS.filter((o) => o.id !== m.id)).slice(0, 3);
  const place = g6SsPlace(rng);
  return {
    prompt: `A school near ${place} organises "${m.label.toLowerCase()}". What is a benefit of this activity?`,
    correct: m.benefit.charAt(0).toUpperCase() + m.benefit.slice(1),
    wrong: others.map((o) => o.benefit.charAt(0).toUpperCase() + o.benefit.slice(1)),
    explanation: `"${m.label}" benefits the school-community relationship because ${m.benefit}.`,
  };
}

export const schoolAndCommunity: Skill = {
  id: "g6-ss-ppl-school-and-community",
  code: "P.4",
  subjectId: "social-studies",
  strandId: "g6-ss-people",
  grade: 6,
  title: "School and community",
  description: "How schools collaborate with their communities, the benefits, and strategies for sustaining collaboration.",
  generate(rng) {
    const branch = randChoice(rng, ["benefit-mc", "fill-blank", "click-match", "categorize-sustain", "ordering"] as const);

    if (branch === "benefit-mc") {
      const q = benefitMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about what each side — school or community — gains from the activity.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "Meetings where parents and teachers discuss a learner's progress are called parent-teacher", after: ".", correct: "meetings" }),
        () => ({ before: "Community fundraising for a school project, common in Kenya, is called", after: ".", correct: "harambee" }),
        () => ({ before: `${name} invites a local farmer to teach a lesson at school, making the farmer a`, after: "for that lesson.", correct: "resource person" }),
        () => ({ before: "A day when a school opens its doors so the community can see learners' work is called an", after: ".", correct: "open day" }),
        () => ({ before: "When a school and its community jointly plant trees or clean up the compound, this is a", after: "activity.", correct: "collaboration" }),
        () => ({ before: "Allowing the community to use the school field or hall for events is an example of sharing school", after: ".", correct: "facilities" }),
        () => ({ before: "A benefit of school-community collaboration is that it builds greater", after: "between the two groups.", correct: "trust" }),
        () => ({ before: "Sharing responsibility for a school project between the school and the community is called shared", after: ".", correct: "responsibility" }),
        () => ({ before: "Holding regular meetings and keeping communication open helps", after: "school-community collaboration over time.", correct: "sustain" }),
        () => ({ before: "A written agreement between a school and a community partner helps make collaboration more", after: ".", correct: "formal" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about school and community collaboration.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the different ways a school and its community work together.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...MECHANISMS]).slice(0, 6);
      const tokens = chosen.map((m) => ({ id: m.id, label: m.label }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: m.id, label: m.benefit.charAt(0).toUpperCase() + m.benefit.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: "Match each school-community activity to its benefit.",
        tokens,
        targets,
        correctMap,
        hint: "Think about who gains what from each activity.",
        explanation: chosen.map((m) => `${m.label}: ${m.benefit}.`).join(" "),
      };
    }

    if (branch === "categorize-sustain") {
      // Evaluate branch — "design strategies for sustaining collaboration" is Apply/Evaluate-level, so this
      // requires judging which strategies genuinely sustain collaboration over time versus a one-off event.
      const strategies = [
        { id: "s1", label: "Holding parent-teacher meetings every term, not just once a year", bucket: "sustains" },
        { id: "s2", label: "Setting up a school-community committee that meets regularly to plan joint activities", bucket: "sustains" },
        { id: "s3", label: "Publicly thanking community members who volunteer their time or resources", bucket: "sustains" },
        { id: "s4", label: "Writing a formal agreement so both sides know their roles over several years", bucket: "sustains" },
        { id: "s5", label: "Holding one big harambee event and never following up with the community afterward", bucket: "one-off" },
        { id: "s6", label: "Inviting the community to a single open day and not communicating with them again", bucket: "one-off" },
      ] as const;
      const chosen = shuffle(rng, strategies).slice(0, 6);
      const items = chosen.map((s) => ({ id: s.id, label: s.label }));
      const buckets = [
        { id: "sustains", label: "Helps sustain long-term collaboration" },
        { id: "one-off", label: "A one-off action, unlikely to sustain collaboration" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s) => (correctBucket[s.id] = s.bucket));
      return {
        kind: "categorize",
        prompt: "Judge each strategy: is it likely to sustain school-community collaboration over the long term?",
        items,
        buckets,
        correctBucket,
        hint: "Sustained collaboration needs repeated contact and clear ongoing roles, not a single event.",
        explanation: chosen.map((s) => `"${s.label}" ${s.bucket === "sustains" ? "helps sustain long-term collaboration" : "is only a one-off action"}.`).join(" "),
      };
    }

    // ordering — a genuine, sensible sequence for organising a school-community project.
    const steps = [
      { id: "s1", label: "Identify a need the school and community can work on together" },
      { id: "s2", label: "Consult community members and agree on a plan" },
      { id: "s3", label: "Carry out the activity together" },
      { id: "s4", label: "Review how it went and thank everyone involved" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these steps in a sensible order for organising a school-community project.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      instruction: "First step first.",
      hint: "You must know the need and have a plan before carrying anything out, and you review only after the activity is done.",
      explanation: "A sensible order is: identify the need, consult and plan, carry out the activity, then review and thank everyone involved.",
    };
  },
};
