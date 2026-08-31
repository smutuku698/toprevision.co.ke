import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const QUALITIES = [
  { text: "Listening patiently to someone before judging their actions", bucket: "helps" },
  { text: "Being tolerant of people who hold different opinions or beliefs", bucket: "helps" },
  { text: "Forgiving others and being willing to reconcile after a disagreement", bucket: "helps" },
  { text: "Respecting the rights and property of neighbours", bucket: "helps" },
  { text: "Being honest and keeping promises made to neighbours", bucket: "helps" },
  { text: "Spreading rumours that provoke anger between neighbours", bucket: "harms" },
  { text: "Refusing to compromise and insisting on always being right", bucket: "harms" },
  { text: "Responding to small disagreements with threats or violence", bucket: "harms" },
  { text: "Holding grudges and refusing to forgive minor mistakes", bucket: "harms" },
  { text: "Favouring people from your own community over others in unfair ways", bucket: "harms" },
] as const;

const BUCKET_LABEL: Record<string, string> = { helps: "Helps peaceful coexistence", harms: "Harms peaceful coexistence" };

const PROMOTING_FACTORS = [
  "Fair and equal treatment of all members of a community regardless of background",
  "Open dialogue and honest communication when disagreements arise",
  "Respect for the rule of law and for the rights of others",
  "Tolerance and appreciation of the community's cultural and religious diversity",
  "Shared community projects that bring different groups together for a common goal",
  "Fair and impartial leadership that does not favour one group over another",
  "Access to accurate information, which reduces the spread of rumours that provoke conflict",
  "Strong local institutions, such as elders' councils, that can resolve disputes fairly",
] as const;

const RESOLUTION_STEPS = [
  { id: "calm", label: "Stay calm and avoid reacting with anger" },
  { id: "listen", label: "Listen carefully to the other side's concerns" },
  { id: "identify", label: "Identify the real underlying issue causing the conflict" },
  { id: "propose", label: "Propose a fair solution that considers both sides" },
  { id: "follow", label: "Agree on the solution and follow through on it" },
];

const NEIGHBOUR_SCENARIOS = [
  {
    situation: "Kamau and Wekesa, neighbours in Nyeri, disagree over exactly where the boundary between their two farms lies.",
    best: "They calmly involve a local elder or land officer to help measure and agree on the correct boundary",
    poor: "Kamau moves the boundary marker at night without telling Wekesa",
  },
  {
    situation: "In Garissa, two families disagree over which one has the right to graze animals near a shared water point.",
    best: "The families meet with community elders to agree on a fair grazing and water-sharing schedule",
    poor: "One family blocks the water point to keep the other family's animals away",
  },
  {
    situation: "In Kajiado, Naisula and her neighbour disagree about noise from a late-night event affecting the whole street.",
    best: "Naisula speaks respectfully to her neighbour about the noise and proposes a reasonable agreement",
    poor: "Naisula calls the police immediately without ever raising the issue with her neighbour first",
  },
  {
    situation: "In Kitale, two neighbouring farmers disagree over whose cow damaged a fence and destroyed part of a maize crop.",
    best: "They inspect the damage together and agree on fair compensation, involving an elder if needed",
    poor: "One farmer retaliates by damaging the other farmer's crop in return",
  },
  {
    situation: "In Malindi, a dispute arises between two households sharing a footpath, after one household starts blocking it with building materials.",
    best: "The households discuss the issue calmly and agree on a way to keep the path clear for both",
    poor: "The other household forcibly removes the materials without any discussion",
  },
  {
    situation: "In Nyahururu, a rumour spreads that a shopkeeper from one community is cheating customers from another community.",
    best: "Concerned residents verify the facts calmly before confronting the shopkeeper respectfully",
    poor: "Residents boycott and confront the shopkeeper based on the rumour alone",
  },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "Living together peacefully with people of different backgrounds and beliefs is called peaceful ", after: ".", correctAnswer: "coexistence", accepted: ["coexistence"], explanation: "Peaceful coexistence is living together peacefully with people of different backgrounds and beliefs." },
  { before: "Accepting and respecting opinions or beliefs different from your own is called ", after: ".", correctAnswer: "tolerance", accepted: ["tolerance"], explanation: "Tolerance is accepting and respecting opinions or beliefs different from your own." },
  { before: "Restoring a friendly relationship after a disagreement is called ", after: ".", correctAnswer: "reconciliation", accepted: ["reconciliation"], explanation: "Reconciliation is restoring a friendly relationship after a disagreement." },
  { before: "Open, honest communication between people trying to resolve a disagreement is called ", after: ".", correctAnswer: "dialogue", accepted: ["dialogue"], explanation: "Dialogue is open, honest communication between people, essential for resolving disagreements peacefully." },
  { before: "A neutral third party who helps two sides reach an agreement is called a ", after: ".", correctAnswer: "mediator", accepted: ["mediator"], explanation: "A mediator is a neutral third party who helps two sides in a dispute reach a fair agreement." },
  { before: "Treating all sides fairly, without favouring one over the other, is called being ", after: ".", correctAnswer: "impartial", accepted: ["impartial"], explanation: "Being impartial means treating all sides fairly, without favouring one over the other." },
  { before: "The variety of cultures, religions, and backgrounds found within a community is called ", after: ".", correctAnswer: "diversity", accepted: ["diversity"], explanation: "Diversity is the variety of cultures, religions, and backgrounds found within a community." },
] as const;

export const peacefulCoexistence: Skill = {
  id: "g7-ss-pr-peaceful-coexistence",
  code: "PR.6",
  subjectId: "social-studies",
  strandId: "g7-ss-pr",
  grade: 7,
  title: "Peaceful coexistence",
  description: "Qualities of a peaceful person, factors that promote peaceful coexistence, the peaceful conflict resolution process, and the value of peaceful coexistence in day-to-day life.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "factor", "resolution-order", "scenario", "match", "fill-blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, [...NEIGHBOUR_SCENARIOS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((s, i) => ({ id: `n${i}`, label: s.situation })));
      const targets = shuffle(rng, chosen.map((s, i) => ({ id: `n${i}`, label: s.best })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((s, i) => (correctMap[`n${i}`] = `n${i}`));
      return {
        kind: "click-match",
        prompt: "Match each neighbour dispute to its best peaceful response.",
        tokens,
        targets,
        correctMap,
        hint: "The best response always uses calm dialogue and a fair, agreed solution.",
        explanation: chosen.map((s) => `${s.situation} — ${s.best}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about peaceful coexistence.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe peaceful coexistence and resolving disputes.",
        explanation: fb.explanation,
      };
    }

    if (branch === "classify") {
      const chosen = shuffle(rng, QUALITIES).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((q) => q.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((q, i) => ({ id: `q${i}`, label: q.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((q, i) => (correctBucket[`q${i}`] = q.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each quality or action as helping or harming peaceful coexistence in a community.",
        items,
        buckets,
        correctBucket,
        hint: "Peaceful qualities build trust and calm; others provoke conflict.",
        explanation: chosen.map((q) => `"${q.text}" — ${BUCKET_LABEL[q.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "factor") {
      const correct = randChoice(rng, PROMOTING_FACTORS);
      const others = PROMOTING_FACTORS.filter((f) => f !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "Which of these is a factor that promotes peaceful coexistence in a community?",
        choices,
        correctIndex,
        hint: "Think about fairness, dialogue, respect for law, and tolerance of diversity.",
        explanation: `${correct} — this is a factor that promotes peaceful coexistence.`,
      };
    }

    if (branch === "resolution-order") {
      const items = shuffle(rng, RESOLUTION_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of the peaceful conflict resolution process in the correct order.",
        instruction: "Drag to reorder from first step to last step.",
        items,
        correctOrder: RESOLUTION_STEPS.map((s) => s.id),
        hint: "You must first calm down and listen before you can identify the real issue, propose a solution, and follow through.",
        explanation: RESOLUTION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    // scenario
    const s = randChoice(rng, NEIGHBOUR_SCENARIOS);
    const choices = shuffle(rng, [s.best, s.poor]);
    return {
      kind: "multiple-choice",
      prompt: `${s.situation} What is the best peaceful response?`,
      choices,
      correctIndex: choices.indexOf(s.best),
      hint: "The best response uses calm dialogue and fair, agreed solutions rather than unilateral or aggressive action.",
      explanation: `${s.best} — this approach resolves the disagreement peacefully and fairly.`,
    };
  },
};
