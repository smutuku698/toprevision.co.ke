import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const RIGHTS = [
  { text: "Freedom of speech", category: "civil-political" },
  { text: "Freedom of movement", category: "civil-political" },
  { text: "The right to a fair trial", category: "civil-political" },
  { text: "The right to vote in elections", category: "civil-political" },
  { text: "Freedom of religion", category: "civil-political" },
  { text: "Freedom of association", category: "civil-political" },
  { text: "The right to education", category: "economic-social-cultural" },
  { text: "The right to healthcare", category: "economic-social-cultural" },
  { text: "The right to adequate housing", category: "economic-social-cultural" },
  { text: "The right to work", category: "economic-social-cultural" },
  { text: "The right to food", category: "economic-social-cultural" },
  { text: "The right to take part in cultural life", category: "economic-social-cultural" },
] as const;

const CATEGORY_LABEL: Record<string, string> = {
  "civil-political": "Civil and political rights",
  "economic-social-cultural": "Economic, social and cultural rights",
};

const CHARACTERISTICS = [
  { id: "universal", label: "Universal", meaning: "Human rights belong to every person in the world, regardless of who they are or where they live" },
  { id: "inalienable", label: "Inalienable", meaning: "Human rights cannot be taken away or given up, even if a person breaks the law" },
  { id: "indivisible", label: "Indivisible", meaning: "All human rights carry equal importance — none can be fully enjoyed at the expense of another" },
  { id: "equal", label: "Equal", meaning: "Human rights apply to everyone in the same way, with no person's rights ranking above another's" },
] as const;

const EQUITY_SCENARIOS = [
  { situation: "A school in Kajiado denies admission to a pupil because of their disability.", upheld: false, principle: "non-discrimination on the basis of disability" },
  { situation: "A hospital in Kilifi attends to patients in the order they arrive, regardless of their ethnic community.", upheld: true, principle: "equitable, non-discriminatory treatment" },
  { situation: "An employer in Nairobi refuses to interview a qualified candidate because of her religion.", upheld: false, principle: "non-discrimination on the basis of religion" },
  { situation: "A Machakos county office builds ramps so that people using wheelchairs can access its services.", upheld: true, principle: "equity for people with disabilities" },
  { situation: "A teacher in Bungoma gives extra revision help only to boys, ignoring girls who ask for the same help.", upheld: false, principle: "non-discrimination on the basis of gender" },
  { situation: "A landlord in Nakuru rents houses to tenants without asking which ethnic community they belong to.", upheld: true, principle: "equity regardless of ethnic background" },
  { situation: "A Garissa market committee only allocates the best stalls to traders from one clan.", upheld: false, principle: "equity across all groups in the community" },
  { situation: "A Kisumu employer hires a person living with a disability because she was the best-qualified applicant.", upheld: true, principle: "equity for people with disabilities" },
  { situation: "A Kericho school allocates scholarship funds strictly based on need and merit, regardless of the applicant's ethnic community.", upheld: true, principle: "equity regardless of ethnic background" },
  { situation: "A Nyeri sports club refuses to let girls join the athletics team, saying it is only for boys.", upheld: false, principle: "non-discrimination on the basis of gender" },
] as const;

const PROMOTE_STEPS = [
  { id: "learn", label: "Learn about the human rights that everyone in the community is entitled to" },
  { id: "notice", label: "Notice and identify a situation where someone's rights are not being respected" },
  { id: "report", label: "Report the case to the relevant authority, such as a chief, elder, or human rights body" },
  { id: "educate", label: "Educate and encourage others in the community to also respect and defend human rights" },
];

export const humanRights: Skill = {
  id: "g7-ss-pdg-human-rights",
  code: "PDG.3",
  subjectId: "social-studies",
  strandId: "g7-ss-pdg",
  grade: 7,
  title: "Human rights",
  description: "Classifying human rights, the characteristics of human rights, and promoting equity and non-discrimination in the community.",
  generate(rng) {
    const branch = randChoice(rng, ["rights-classify", "characteristics-match", "equity-scenario", "promote-order"] as const);

    if (branch === "rights-classify") {
      const civil = shuffle(rng, RIGHTS.filter((r) => r.category === "civil-political")).slice(0, 3);
      const social = shuffle(rng, RIGHTS.filter((r) => r.category === "economic-social-cultural")).slice(0, 3);
      const chosen = shuffle(rng, [...civil, ...social]);
      const items = chosen.map((r, i) => ({ id: `r${i}`, label: r.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((r, i) => (correctBucket[`r${i}`] = r.category));
      return {
        kind: "categorize",
        prompt: "Sort each right into civil and political rights, or economic, social and cultural rights.",
        items,
        buckets: [
          { id: "civil-political", label: CATEGORY_LABEL["civil-political"] },
          { id: "economic-social-cultural", label: CATEGORY_LABEL["economic-social-cultural"] },
        ],
        correctBucket,
        hint: "Civil and political rights protect freedoms and participation; economic, social and cultural rights protect wellbeing and living standards.",
        explanation: chosen.map((r) => `"${r.text}" is a(n) ${CATEGORY_LABEL[r.category]} right.`).join(" "),
      };
    }

    if (branch === "characteristics-match") {
      const chosen = shuffle(rng, CHARACTERISTICS);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.id, label: c.meaning })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: "Match each characteristic of human rights to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what makes human rights different from ordinary privileges.",
        explanation: chosen.map((c) => `${c.label}: ${c.meaning}.`).join(" "),
      };
    }

    if (branch === "equity-scenario") {
      const s = randChoice(rng, EQUITY_SCENARIOS);
      const label = s.upheld ? "An example of equity and non-discrimination being upheld" : "A violation of equity and non-discrimination";
      const other = s.upheld ? "A violation of equity and non-discrimination" : "An example of equity and non-discrimination being upheld";
      const choices = shuffle(rng, [label, other]);
      return {
        kind: "multiple-choice",
        prompt: `${s.situation} What does this show?`,
        choices,
        correctIndex: choices.indexOf(label),
        hint: `Think about the principle of ${s.principle}.`,
        explanation: `${s.situation} This ${s.upheld ? "upholds" : "violates"} the principle of ${s.principle}.`,
      };
    }

    // promote-order
    const items = shuffle(rng, PROMOTE_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the steps for promoting respect for human rights in your community in a sensible order.",
      instruction: "Drag to reorder from the first step to the last step.",
      items,
      correctOrder: PROMOTE_STEPS.map((s) => s.id),
      hint: "You must first understand rights before you can notice a violation, report it, and then teach others.",
      explanation: PROMOTE_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
    };
  },
};
