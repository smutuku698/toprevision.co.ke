import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, name, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Traditional Leaders in Kenya" — a closed list of
// EXACTLY 2 named leaders (Kivoi wa Mwendwa and Mekatilili wa Menza), per the design. The fact pool is
// deliberately narrow (per RIGOR-STANDARDS.md's pool-size floor guidance: do not invent additional named
// leaders not in the source). Only 4 of the usual 5 QuestionKinds fit naturally here — a genuine "sequence
// of events" ordering branch would require specific dates outside this design's scope, so the ordering
// branch below instead orders the general steps of researching/presenting on a traditional leader, which is
// a defensible generic process rather than an invented historical timeline.

interface Leader {
  id: "kivoi" | "mekatilili";
  name: string;
  community: string;
  contribution: string;
  qualities: string[]; // leadership qualities associated with this leader
}

const LEADERS: readonly Leader[] = [
  {
    id: "kivoi",
    name: "Kivoi wa Mwendwa",
    community: "an Akamba (Kamba) trader and leader",
    contribution: "he opened up long-distance trade routes in the 19th century, connecting communities and boosting trade",
    qualities: ["courage in travelling long distances to trade", "wisdom in building trading relationships with different communities", "the ability to unite traders across a wide area"],
  },
  {
    id: "mekatilili",
    name: "Mekatilili wa Menza",
    community: "a Giriama (Mijikenda) leader",
    contribution: "she led resistance against British colonial rule in the early 20th century, especially opposing forced labour and colonial taxation",
    qualities: ["courage in standing up to colonial authorities", "the ability to unite the Giriama community in resistance", "standing up for her community's rights"],
  },
] as const;

export const traditionalLeadersInKenya: Skill = {
  id: "g5-ss-pol-traditional-leaders-in-kenya",
  code: "PS.1",
  subjectId: "social-studies",
  strandId: "g5-ss-political",
  grade: 5,
  title: "Traditional Leaders in Kenya",
  description: "Identifying Kivoi wa Mwendwa and Mekatilili wa Menza, their communities and their contributions as traditional leaders.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank"] as const);

    if (branch === "identify-mc") {
      const l = randChoice(rng, LEADERS);
      const other = LEADERS.find((o) => o.id !== l.id)!;
      const choices = shuffle(rng, [l.name, other.name, "Mzee Jomo Kenyatta", "Koitalel Arap Samoei"]);
      return {
        kind: "multiple-choice",
        prompt: identifyPrompt(rng, `traditional leader: ${l.contribution}`),
        choices,
        correctIndex: choices.indexOf(l.name),
        hint: "One leader is remembered for opening trade routes, the other for resisting colonial rule.",
        explanation: `${l.name}, ${l.community}, is remembered because ${l.contribution}.`,
      };
    }

    if (branch === "click-match") {
      // Match leader to a specific quality/contribution phrase — using per-item facts (not a shared
      // category name) so each target label is unique even though there are only 2 leaders.
      const rows: { id: string; label: string; value: string }[] = [
        { id: "kivoi-trade", label: "Kivoi wa Mwendwa", value: "Opened up long-distance trade routes in the 19th century" },
        { id: "mekatilili-resist", label: "Mekatilili wa Menza", value: "Led resistance against British colonial rule and forced labour" },
      ];
      const chosen = shuffle(rng, rows);
      const tokens = chosen.map((r) => ({ id: r.id, label: r.label }));
      const targets = shuffle(rng, chosen).map((r) => ({ id: r.id, label: r.value }));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.id] = r.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "traditional leader to their main contribution"),
        tokens,
        targets,
        correctMap,
        hint: "One is remembered for trade, the other for resisting colonial rule.",
        explanation: chosen.map((r) => `${r.label}: ${r.value}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const statements: { id: string; label: string; leader: "kivoi" | "mekatilili" }[] = [
        { id: "s1", label: "Opened up long-distance trade routes", leader: "kivoi" },
        { id: "s2", label: "Was an Akamba (Kamba) trader and leader", leader: "kivoi" },
        { id: "s3", label: "Connected different communities through trade in the 19th century", leader: "kivoi" },
        { id: "s4", label: "Led resistance against British colonial rule", leader: "mekatilili" },
        { id: "s5", label: "Was a Giriama (Mijikenda) leader", leader: "mekatilili" },
        { id: "s6", label: "Opposed forced labour and colonial taxation", leader: "mekatilili" },
      ];
      const chosen = shuffle(rng, statements);
      const items = chosen.map((s) => ({ id: s.id, label: s.label }));
      const buckets = [
        { id: "kivoi", label: "Kivoi wa Mwendwa" },
        { id: "mekatilili", label: "Mekatilili wa Menza" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s) => (correctBucket[s.id] = s.leader));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which traditional leader it describes"),
        items,
        buckets,
        correctBucket,
        hint: "Kivoi wa Mwendwa is linked to trade; Mekatilili wa Menza is linked to resisting colonial rule.",
        explanation: chosen.map((s) => `"${s.label}" describes ${s.leader === "kivoi" ? "Kivoi wa Mwendwa" : "Mekatilili wa Menza"}.`).join(" "),
      };
    }

    // fill-blank
    const n = name(rng);
    const templates = [
      () => ({ before: "The Akamba trader remembered for opening up long-distance trade routes was", after: ".", correct: "Kivoi wa Mwendwa" }),
      () => ({ before: "The Giriama leader remembered for resisting British colonial rule was", after: ".", correct: "Mekatilili wa Menza" }),
      () => ({ before: "Mekatilili wa Menza especially opposed forced labour and colonial", after: ".", correct: "taxation" }),
      () => ({ before: "Kivoi wa Mwendwa belonged to the", after: "community.", correct: "Akamba" }),
      () => ({ before: "Mekatilili wa Menza belonged to the", after: "community.", correct: "Giriama" }),
      () => ({ before: `${n} learns that opening up trade routes required great`, after: "and wisdom.", correct: "courage" }),
      () => ({ before: "A quality both Kivoi wa Mwendwa and Mekatilili wa Menza showed was the ability to", after: "their communities.", correct: "unite" }),
    ];
    const t = randChoice(rng, templates)();
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: t.before,
      after: t.after,
      correctAnswer: t.correct,
      inputMode: "text",
      hint: "Recall Kivoi wa Mwendwa's trade routes and Mekatilili wa Menza's resistance to colonial rule.",
      explanation: `${t.before} ${t.correct} ${t.after}`,
    };
  },
};
