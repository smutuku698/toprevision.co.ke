import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, name, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Early Forms of Government in Kenya" — a closed
// pair of named communities (Maasai, Ameru). See curriculum-reference/grade-5/social-studies.json.

interface Community {
  id: "maasai" | "ameru";
  name: string;
  council: string;
  description: string;
}

const COMMUNITIES: readonly Community[] = [
  {
    id: "maasai",
    name: "the Maasai",
    council: "a council of elders (organised through an age-set system)",
    description: "the Maasai were traditionally governed through an age-set system, where councils of elders (Ilaiguenani) made decisions for the community",
  },
  {
    id: "ameru",
    name: "the Ameru",
    council: "the Njuri Ncheke",
    description: "the Ameru were traditionally governed by the Njuri Ncheke, a council of respected elders who made laws and settled disputes",
  },
] as const;

const SHARED_TRAITS = [
  "used a council of elders rather than a single ruler",
  "valued the wisdom and experience of older members",
  "made decisions collectively, not by one person alone",
  "settled disputes within the community",
] as const;

export const earlyFormsOfGovernmentInKenya: Skill = {
  id: "g5-ss-pol-early-forms-of-government-in-kenya",
  code: "PS.2",
  subjectId: "social-studies",
  strandId: "g5-ss-political",
  grade: 5,
  title: "Early Forms of Government in Kenya",
  description: "Comparing early forms of government among the Maasai (age-set system) and the Ameru (Njuri Ncheke council of elders).",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const c = randChoice(rng, COMMUNITIES);
      const other = COMMUNITIES.find((o) => o.id !== c.id)!;
      const choices = shuffle(rng, [c.council, other.council, "a single all-powerful king", "an elected parliament"]);
      return {
        kind: "multiple-choice",
        prompt: identifyPrompt(rng, `governing body used by ${c.name} in early Kenyan history`),
        choices,
        correctIndex: choices.indexOf(c.council),
        hint: "The Maasai used an age-set system; the Ameru used the Njuri Ncheke.",
        explanation: `Traditionally, ${c.description}.`,
      };
    }

    if (branch === "click-match") {
      const rows = COMMUNITIES.map((c) => ({ id: c.id, label: c.name, value: c.council }));
      const chosen = shuffle(rng, rows);
      const tokens = chosen.map((r) => ({ id: r.id, label: r.label }));
      const targets = shuffle(rng, chosen).map((r) => ({ id: r.id, label: r.value }));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.id] = r.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "community to its traditional governing council"),
        tokens,
        targets,
        correctMap,
        hint: "One council is named after an age-set system, the other is called the Njuri Ncheke.",
        explanation: chosen.map((r) => `${r.label} were governed by ${r.value}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const statements: { id: string; label: string; bucket: "shared" | "maasai-only" | "ameru-only" }[] = [
        { id: "s1", label: "Used a council of elders rather than a single ruler", bucket: "shared" },
        { id: "s2", label: "Valued the wisdom of older community members", bucket: "shared" },
        { id: "s3", label: "Made decisions through a council called the Njuri Ncheke", bucket: "ameru-only" },
        { id: "s4", label: "Organised leadership through an age-set system", bucket: "maasai-only" },
        { id: "s5", label: "Settled disputes within the community", bucket: "shared" },
        { id: "s6", label: "Council elders were known as Ilaiguenani", bucket: "maasai-only" },
      ];
      const chosen = shuffle(rng, statements);
      const items = chosen.map((s) => ({ id: s.id, label: s.label }));
      const buckets = [
        { id: "shared", label: "True of both communities" },
        { id: "maasai-only", label: "True of the Maasai only" },
      ];
      const filtered = chosen.filter((s) => s.bucket !== "ameru-only");
      const correctBucket: Record<string, string> = {};
      filtered.forEach((s) => (correctBucket[s.id] = s.bucket));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it describes both communities or only the Maasai"),
        items: filtered.map((s) => ({ id: s.id, label: s.label })),
        buckets,
        correctBucket,
        hint: "Statements about elders and collective decisions are shared; the age-set/Ilaiguenani details are Maasai-specific.",
        explanation: filtered.map((s) => `"${s.label}" is ${s.bucket === "shared" ? "true of both" : "specific to the Maasai"}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const n = name(rng);
      const templates = [
        () => ({ before: "The Ameru were traditionally governed by a council of elders called the", after: ".", correct: "Njuri Ncheke" }),
        () => ({ before: "The Maasai traditionally organised leadership through an", after: "system.", correct: "age-set" }),
        () => ({ before: `${n} learns that both the Maasai and Ameru used a council of`, after: "to make decisions.", correct: "elders" }),
        () => ({ before: "Among the Maasai, councils of elders were known as", after: ".", correct: "Ilaiguenani" }),
        () => ({ before: "The Njuri Ncheke made laws and settled", after: "for the Ameru community.", correct: "disputes" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the Maasai age-set system and the Ameru Njuri Ncheke.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "gather", label: "The elders gather to discuss the matter" },
      { id: "hear", label: "They listen to both sides involved" },
      { id: "discuss", label: "They discuss and weigh the evidence" },
      { id: "decide", label: "They reach a collective decision" },
      { id: "announce", label: "The decision is announced to the community" },
    ]);
    const correctOrder = ["gather", "hear", "discuss", "decide", "announce"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps an elders' council would follow to settle a community matter"),
      instruction: "Arrange the steps in the order the elders would follow.",
      items: steps,
      correctOrder,
      hint: "Start with gathering, end with announcing the decision.",
      explanation: "A council of elders would gather, hear both sides, discuss, decide, then announce the decision.",
    };
  },
};
