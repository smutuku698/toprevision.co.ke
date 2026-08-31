import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const CHILDRENS_RIGHTS = [
  { right: "Right to education", meaning: "Every child has the right to free and compulsory basic education" },
  { right: "Right to health care", meaning: "Every child has the right to basic nutrition, shelter, and health care" },
  { right: "Right to protection", meaning: "Every child has the right to be protected from abuse, neglect, and harmful cultural practices" },
  { right: "Right to a name and nationality", meaning: "Every child has the right to a name and to be registered as a citizen at birth" },
  { right: "Right to parental care", meaning: "Every child has the right to parental care and protection from both parents, whether married or not" },
] as const;

const RIGHTS_SCENARIOS = [
  { situation: "A 13-year-old girl is forced into early marriage instead of continuing her education.", bucket: "violation" },
  { situation: "A family takes their sick child to a public health clinic for free treatment.", bucket: "respected" },
  { situation: "A child is made to work long hours at a market instead of attending school.", bucket: "violation" },
  { situation: "A school ensures every child, including those with disabilities, can access classrooms and learning materials.", bucket: "respected" },
  { situation: "A community reports a case of a child being denied food and shelter by a guardian.", bucket: "respected" },
  { situation: "A child is subjected to female genital mutilation despite it being outlawed.", bucket: "violation" },
] as const;

const BUCKET_LABEL: Record<string, string> = { violation: "A violation of children's rights", respected: "An example of children's rights being respected" };

const REPORTING_ACTIONS = [
  "Calling Childline Kenya on the toll-free number 116 to report the case",
  "Reporting the case to the local Chief or the Area Children's Officer",
  "Telling a trusted teacher or school counsellor about what is happening",
  "Ignoring the situation because it is a private family matter",
] as const;

const COMMUNICATION_STEPS = [
  { id: "listen", label: "Listen carefully and calmly to understand the human rights issue being raised" },
  { id: "gather", label: "Gather accurate facts about what happened before responding" },
  { id: "report", label: "Report the issue to the correct authority, such as a chief, school, or Childline" },
  { id: "follow-up", label: "Follow up to ensure the issue is being addressed and the person is safe" },
];

export const humanRights: Skill = {
  id: "g8-ss-pdg-human-rights",
  code: "PDG.2",
  subjectId: "social-studies",
  strandId: "g8-ss-pdg",
  grade: 8,
  title: "Human rights",
  description: "How human rights can be respected and protected in the community, effective communication on human rights issues, Children's Rights in Kenya, and society's responsibility to protect them.",
  generate(rng) {
    const branch = randChoice(rng, ["rights-match", "scenario-classify", "reporting", "communication-order"] as const);

    if (branch === "rights-match") {
      const chosen = shuffle(rng, [...CHILDRENS_RIGHTS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.right, label: r.right })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.right, label: r.meaning })));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.right] = r.right;
      return {
        kind: "click-match",
        prompt: "Match each Children's Right in Kenya to what it means.",
        tokens,
        targets,
        correctMap,
        hint: "Each right protects a specific need every child has, regardless of their background.",
        explanation: chosen.map((r) => `${r.right}: ${r.meaning}.`).join(" "),
      };
    }

    if (branch === "scenario-classify") {
      const chosen = shuffle(rng, RIGHTS_SCENARIOS).slice(0, 5);
      const buckets = Array.from(new Set(chosen.map((s) => s.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.situation }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each situation into whether it shows a violation of children's rights, or children's rights being respected.",
        items,
        buckets,
        correctBucket,
        hint: "Ask whether the child's education, health, protection, or care is being upheld or denied.",
        explanation: chosen.map((s) => `"${s.situation}" — ${BUCKET_LABEL[s.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "reporting") {
      const goodActions = REPORTING_ACTIONS.slice(0, 3);
      const correct = randChoice(rng, goodActions);
      const others = REPORTING_ACTIONS.filter((a) => a !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "A classmate confides in you that they are being abused at home. Which of these is the best way to help protect them?",
        choices,
        correctIndex,
        hint: "The right response reports the issue to someone with the authority and duty to help, rather than staying silent.",
        explanation: `${correct} — reporting to a responsible authority is how children are protected against violations of their rights in Kenya.`,
      };
    }

    // communication-order
    const items = shuffle(rng, COMMUNICATION_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange these steps for effective communication when addressing a human rights issue in the correct order.",
      instruction: "Drag to reorder from first step to last step.",
      items,
      correctOrder: COMMUNICATION_STEPS.map((s) => s.id),
      hint: "You must understand the issue and confirm the facts before reporting it, and check afterward that it was resolved.",
      explanation: COMMUNICATION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
    };
  },
};
