import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ARMS = [
  { arm: "The Executive", role: "Implements and enforces laws — led by the President and the Cabinet" },
  { arm: "The Legislature", role: "Makes and amends laws — Parliament, made up of the National Assembly and the Senate" },
  { arm: "The Judiciary", role: "Interprets laws and settles disputes — the courts, from the Supreme Court downward" },
] as const;

const COMPONENTS = [
  { text: "The right to life, the right to education, and freedom of expression", bucket: "bill-of-rights" },
  { text: "Protection from discrimination and the right to a fair hearing in court", bucket: "bill-of-rights" },
  { text: "State officers must be selected based on integrity, competence, and suitability", bucket: "leadership" },
  { text: "State officers must avoid conflicts of interest and demeaning the dignity of their office", bucket: "leadership" },
  { text: "Kenya is divided into 47 counties, each with its own government", bucket: "devolution" },
  { text: "County governments manage functions such as county health services and local roads", bucket: "devolution" },
] as const;

const BUCKET_LABEL: Record<string, string> = {
  "bill-of-rights": "Bill of Rights",
  leadership: "Leadership and Integrity (Chapter Six)",
  devolution: "Devolved Government",
};

const CHAPTER_SIX_SCENARIOS = [
  { situation: "A county official awards a tender to a company owned by their own relative instead of the most qualified bidder.", violated: true, principle: "avoiding conflicts of interest" },
  { situation: "A Member of Parliament declares their business interests before voting on a bill related to that business.", violated: false, principle: "objectivity and avoiding conflicts of interest" },
  { situation: "A government officer accepts a bribe to speed up the processing of a citizen's identity card.", violated: true, principle: "selfless service based on public interest" },
  { situation: "A leader explains publicly how county funds were spent on a new school project.", violated: false, principle: "accountability to the public" },
] as const;

const LAW_STEPS = [
  { id: "first-reading", label: "The bill is introduced in Parliament (First Reading)" },
  { id: "second-reading", label: "Members debate the general purpose of the bill (Second Reading)" },
  { id: "committee", label: "A committee examines the bill clause by clause and may propose changes" },
  { id: "third-reading", label: "Parliament votes on the final version of the bill (Third Reading)" },
  { id: "assent", label: "The President signs the bill, and it becomes law (Presidential Assent)" },
];

export const constitutionOfKenya: Skill = {
  id: "g8-ss-pdg-constitution-of-kenya",
  code: "PDG.1",
  subjectId: "social-studies",
  strandId: "g8-ss-pdg",
  grade: 8,
  title: "The Constitution of Kenya",
  description: "Components of the Constitution of Kenya, roles of the three arms of government, guiding principles of leadership and integrity in Chapter Six, and how a bill becomes law.",
  generate(rng) {
    const branch = randChoice(rng, ["arms-match", "components-classify", "chapter-six", "law-process"] as const);

    if (branch === "arms-match") {
      const tokens = shuffle(rng, ARMS.map((a) => ({ id: a.arm, label: a.arm })));
      const targets = shuffle(rng, ARMS.map((a) => ({ id: a.arm, label: a.role })));
      const correctMap: Record<string, string> = {};
      for (const a of ARMS) correctMap[a.arm] = a.arm;
      return {
        kind: "click-match",
        prompt: "Match each arm of government to its role, as set out in the Constitution of Kenya.",
        tokens,
        targets,
        correctMap,
        hint: "One arm makes laws, one enforces them, and one interprets them when there is a dispute.",
        explanation: ARMS.map((a) => `${a.arm}: ${a.role}.`).join(" "),
      };
    }

    if (branch === "components-classify") {
      const chosen = shuffle(rng, COMPONENTS).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement into the component of the Constitution of Kenya it belongs to.",
        items,
        buckets,
        correctBucket,
        hint: "Ask: is this about a personal freedom, about how leaders must behave, or about county government?",
        explanation: chosen.map((c) => `"${c.text}" — ${BUCKET_LABEL[c.bucket]}.`).join(" "),
      };
    }

    if (branch === "chapter-six") {
      const s = randChoice(rng, CHAPTER_SIX_SCENARIOS);
      const label = s.violated ? "A violation of Chapter Six leadership and integrity principles" : "An example of upholding Chapter Six leadership and integrity principles";
      const other = s.violated ? "An example of upholding Chapter Six leadership and integrity principles" : "A violation of Chapter Six leadership and integrity principles";
      const choices = shuffle(rng, [label, other]);
      return {
        kind: "multiple-choice",
        prompt: `${s.situation} What does this show?`,
        choices,
        correctIndex: choices.indexOf(label),
        hint: `Think about the principle of ${s.principle}.`,
        explanation: `${s.situation} This ${s.violated ? "violates" : "upholds"} the Chapter Six principle of ${s.principle}.`,
      };
    }

    // law-process
    const items = shuffle(rng, LAW_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the steps for how a bill becomes law in Kenya's Parliament in the correct order.",
      instruction: "Drag to reorder from first step to last step.",
      items,
      correctOrder: LAW_STEPS.map((s) => s.id),
      hint: "A bill is introduced, debated, examined in detail, voted on, and finally signed into law.",
      explanation: LAW_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
    };
  },
};
