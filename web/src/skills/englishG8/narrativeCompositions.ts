import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STAGES: { id: string; label: string; description: string }[] = [
  { id: "recall", label: "Recall", description: "Think of a real event, person, or emotion that affected you deeply" },
  { id: "brainstorm", label: "Brainstorm", description: "Jot down details — who, what, where, when, and why it mattered" },
  { id: "map", label: "Story-map", description: "Plan the beginning, middle, and end, and the emotional turning point" },
  { id: "draft", label: "Draft", description: "Write the narrative, using vivid, revealing details" },
  { id: "revise", label: "Revise and edit", description: "Check the story flows and makes sense, then correct errors" },
];

const ORDINALS = ["first", "second", "third", "fourth", "fifth and last"];

const DETAIL_PAIRS: { flat: string; vivid: string }[] = [
  { flat: "She was scared before the race.", vivid: "Her hands trembled and her heart pounded as she lined up for the race." },
  { flat: "He was a brave leader.", vivid: "He stood at the front of the march, unflinching, even as soldiers blocked the road." },
  { flat: "She was proud of her country.", vivid: "Tears of pride welled in her eyes as she watched the flag rise while the anthem played." },
  { flat: "He was tired after the long journey.", vivid: "His legs ached and his feet were blistered by the time he reached the village at dusk." },
  { flat: "The community celebrated the hero's return.", vivid: "Drums thundered and children ran alongside the car, waving branches and singing songs of welcome." },
];

export const narrativeCompositions: Skill = {
  id: "g8-eng-w-narrative-compositions",
  code: "W.9",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Creative Writing: Narrative Compositions",
  description: "Plan a narrative composition about an inspiring event or person using prewriting techniques, and recognise vivid, revealing detail.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "mc-order", "match", "categorize", "mc-vivid"] as const);
    const hint = "Good narrative writing is planned in stages, from recalling the event to revising the draft, and uses vivid, specific detail that shows rather than tells.";

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the stages of planning and writing a narrative composition about an African hero or heroine, in the correct order.",
        instruction: "Click the stages in order, from first to last.",
        items: shuffle(rng, STAGES.map((s) => ({ id: s.id, label: s.label }))),
        correctOrder: STAGES.map((s) => s.id),
        hint,
        explanation: STAGES.map((s) => `${s.label} — ${s.description.toLowerCase()}`).join(" → "),
      };
    }

    if (branch === "mc-order") {
      const index = Math.floor(rng() * STAGES.length);
      const target = STAGES[index];
      const choices = shuffle(rng, STAGES.map((s) => s.label));
      return {
        kind: "multiple-choice",
        prompt: `When planning and writing a narrative composition, which stage comes ${ORDINALS[index]}?`,
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation: `The stages go: ${STAGES.map((s) => s.label).join(" → ")}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, STAGES.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, STAGES.map((s) => ({ id: s.id, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of STAGES) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: "Match each prewriting or writing stage to what it involves.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: STAGES.map((s) => `${s.label}: ${s.description}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, DETAIL_PAIRS).slice(0, 3);
      const items = shuffle(
        rng,
        chosen.flatMap((p, i) => [
          { id: `v${i}`, label: p.vivid, bucket: "vivid" },
          { id: `f${i}`, label: p.flat, bucket: "flat" },
        ])
      );
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each sentence into Vivid, revealing detail or Flat, generic statement.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "vivid", label: "Vivid, revealing detail" },
          { id: "flat", label: "Flat, generic statement" },
        ],
        correctBucket,
        hint: "Vivid details show specific sights, sounds, or physical feelings. Flat statements simply name an emotion or quality without showing it.",
        explanation: chosen.map((p) => `"${p.vivid}" shows the feeling vividly, while "${p.flat}" just states it plainly.`).join(" "),
      };
    }

    const entry = randChoice(rng, DETAIL_PAIRS);
    const choices = shuffle(rng, [entry.vivid, entry.flat]);
    return {
      kind: "multiple-choice",
      prompt: "Which sentence uses more vivid, revealing detail — 'showing' rather than just 'telling'?",
      choices,
      correctIndex: choices.indexOf(entry.vivid),
      layout: "list",
      hint: "A revealing detail shows the reader specific sights, sounds, or physical sensations instead of simply naming the feeling.",
      explanation: `"${entry.vivid}" is more vivid — it shows the feeling through specific, physical detail, rather than just stating it like "${entry.flat}"`,
    };
  },
};
