import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const COMPONENTS: { id: string; label: string; description: string }[] = [
  { id: "date", label: "Date", description: "When the entry was written or when the experience happened" },
  { id: "event", label: "Description of the experience", description: "What happened, where, and specific details of the visit" },
  { id: "feelings", label: "Feelings and reflection", description: "How the writer felt and what the experience meant to them" },
];

const SNIPPETS: { text: string; component: string }[] = [
  { text: "15 July, 2025", component: "date" },
  { text: "2 January, 2026", component: "date" },
  { text: "We walked through the ancient ruins of Great Zimbabwe, touching the stone walls built centuries ago.", component: "event" },
  { text: "The guide showed us the Pyramids of Giza rising out of the desert sand.", component: "event" },
  { text: "I felt a deep sense of wonder, imagining the people who lived there long ago.", component: "feelings" },
  { text: "I will always remember how tiny I felt standing beside something so ancient.", component: "feelings" },
];

const EVAL_SAMPLES: { text: string; verdict: "good" | "bad"; why: string }[] = [
  {
    text: "12 June. Today we visited Lake Nakuru National Park. Thousands of pink flamingos covered the shore, and I felt amazed watching them take flight all at once. I will never forget the sound of their wings.",
    verdict: "good",
    why: "It includes the date, specific descriptive details of the visit, and the writer's personal feelings and reflection.",
  },
  {
    text: "Kenya is a country in East Africa. It has many parks. Tourists like animals.",
    verdict: "bad",
    why: "It has no date, no specific personal experience or detail, and no feelings — it reads like a fact file, not a personal journal entry.",
  },
  {
    text: "3 August. We climbed to the viewpoint above Victoria Falls today. The roar of the water was so loud we had to shout to hear each other, and the mist soaked our clothes completely. I felt so small standing next to something so powerful.",
    verdict: "good",
    why: "It has a date, vivid specific detail of the experience, and a personal reflection on how it felt.",
  },
  {
    text: "Went somewhere. It was fine. Nothing much to say.",
    verdict: "bad",
    why: "It is missing the date, has no specific descriptive detail about the place or experience, and gives no real feelings or reflection.",
  },
];

export const personalJournals: Skill = {
  id: "g8-eng-w-personal-journals",
  code: "W.15",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Functional Writing: Personal Journals",
  description: "Outline the components of a personal journal entry and evaluate journal entries about African tourist attraction sites.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order", "categorize", "evaluate"] as const);
    const hint = "A good journal entry has a date, specific details of what happened, and the writer's own personal feelings and reflection.";

    if (branch === "match") {
      const tokens = shuffle(rng, COMPONENTS.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, COMPONENTS.map((c) => ({ id: c.id, label: c.description })));
      const correctMap: Record<string, string> = {};
      for (const c of COMPONENTS) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: "Match each component of a personal journal entry to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: COMPONENTS.map((c) => `${c.label}: ${c.description}.`).join(" "),
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the components of a personal journal entry about visiting an African tourist site, in the order they typically appear.",
        instruction: "Click the components in order, from first to last.",
        items: shuffle(rng, COMPONENTS.map((c) => ({ id: c.id, label: c.label }))),
        correctOrder: COMPONENTS.map((c) => c.id),
        hint,
        explanation: COMPONENTS.map((c) => `${c.label} — ${c.description.toLowerCase()}`).join(" → "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SNIPPETS).slice(0, 5);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.component));
      const usedComponents = Array.from(new Set(chosen.map((s) => s.component)));
      return {
        kind: "categorize",
        prompt: "Sort each snippet by which journal component it represents.",
        items,
        buckets: COMPONENTS.filter((c) => usedComponents.includes(c.id)).map((c) => ({ id: c.id, label: c.label })),
        correctBucket,
        hint,
        explanation: chosen.map((s) => `"${s.text}" is an example of ${COMPONENTS.find((c) => c.id === s.component)!.label.toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, EVAL_SAMPLES);
    const choices = shuffle(rng, [
      "Well-formed — it includes a date, specific detail, and personal reflection",
      "Poorly formed — it is missing key components like detail or personal feeling",
    ]);
    const correctText = entry.verdict === "good" ? "Well-formed — it includes a date, specific detail, and personal reflection" : "Poorly formed — it is missing key components like detail or personal feeling";
    return {
      kind: "multiple-choice",
      prompt: `Read this journal entry: "${entry.text}" Is it a well-formed, relevant personal journal entry, or is it missing key components?`,
      choices,
      correctIndex: choices.indexOf(correctText),
      layout: "list",
      hint,
      explanation: entry.why,
    };
  },
};
