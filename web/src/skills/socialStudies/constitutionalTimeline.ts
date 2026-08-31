import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Era = "colonial" | "independence" | "reform" | "new-constitution";

const MILESTONES: { id: string; year: number; event: string; why: string; era: Era }[] = [
  { id: "m1895", year: 1895, event: "The British East Africa Protectorate is declared", why: "it marks the start of formal British colonial administration over the territory that became Kenya", era: "colonial" },
  { id: "m1920", year: 1920, event: "Kenya becomes a British Crown Colony", why: "it shifted Kenya from a protectorate to a colony under direct British rule", era: "colonial" },
  { id: "m1944", year: 1944, event: "Eliud Mathu becomes the first African member nominated to the Legislative Council", why: "it was the first formal African political representation in Kenya's colonial government", era: "colonial" },
  { id: "m1952", year: 1952, event: "A State of Emergency is declared during the Mau Mau uprising", why: "it marked a major armed struggle against colonial rule that shaped the push for independence", era: "colonial" },
  { id: "m1960", year: 1960, event: "The first Lancaster House Conference begins independence talks in London", why: "it began the negotiations between Kenyan leaders and Britain that led to independence", era: "colonial" },
  { id: "m1963", year: 1963, event: "Kenya gains independence from Britain", why: "it ended colonial rule and made Kenya a self-governing nation", era: "independence" },
  { id: "m1964", year: 1964, event: "Kenya becomes a republic", why: "it replaced the British monarch with a Kenyan President as head of state", era: "independence" },
  { id: "m1982", year: 1982, event: "Section 2A makes Kenya a one-party state", why: "it legally banned all political parties except one, ending multi-party competition", era: "independence" },
  { id: "m1991", year: 1991, event: "Section 2A is repealed, restoring multi-party politics", why: "it reopened Kenya to competitive, multi-party elections after nine years of one-party rule", era: "reform" },
  { id: "m1997", year: 1997, event: "IPPG constitutional reforms expand political freedoms ahead of elections", why: "cross-party talks (the Inter-Parties Parliamentary Group) won reforms that widened political freedoms before that year's elections", era: "reform" },
  { id: "m2008", year: 2008, event: "The National Accord ends post-election violence and creates a coalition government", why: "it restored peace and stability after the disputed 2007 election through a power-sharing agreement", era: "reform" },
  { id: "m2010", year: 2010, event: "The current Constitution of Kenya is promulgated", why: "it replaced the independence-era constitution with a new one introducing devolution and an expanded Bill of Rights", era: "new-constitution" },
  { id: "m2013", year: 2013, event: "First devolved elections held; county governments established", why: "it put the 2010 Constitution's devolution chapter into practice, creating 47 county governments", era: "new-constitution" },
];

const ERA_LABEL: Record<Era, string> = {
  colonial: "Colonial period",
  independence: "Early independence & one-party era",
  reform: "Return to multi-party politics & reform",
  "new-constitution": "New Constitution & devolution",
};

const labelOf = (m: (typeof MILESTONES)[number]) => `${m.year} — ${m.event}`;

export const constitutionalTimeline: Skill = {
  id: "ss-h-constitutional-timeline",
  code: "H.3",
  subjectId: "social-studies",
  strandId: "ss-extra-practice",
  grade: 9,
  title: "Kenya's constitutional history timeline",
  description: "Arrange key milestones in Kenya's constitutional history in chronological order.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "year", "what-happened", "match", "era"] as const);

    if (branch === "year") {
      const m = randChoice(rng, MILESTONES);
      return {
        kind: "fill-blank",
        prompt: `In what year did this happen: "${m.event}"?`,
        before: "Year:",
        after: "",
        correctAnswer: String(m.year),
        inputMode: "numeric",
        hint: "Think about where this event sits among Kenya's constitutional milestones.",
        explanation: `${labelOf(m)}.`,
      };
    }

    if (branch === "what-happened") {
      const target = randChoice(rng, MILESTONES);
      const distractors = shuffle(rng, MILESTONES.filter((m) => m.id !== target.id)).slice(0, 3);
      const choices = shuffle(rng, [target, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `What happened in ${target.year}?`,
        choices: choices.map((c) => c.event),
        correctIndex: choices.findIndex((c) => c.id === target.id),
        hint: "Think about which milestone in Kenya's constitutional history falls in that year.",
        explanation: `${labelOf(target)} — ${target.why}.`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MILESTONES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.id, label: labelOf(m) })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.why.charAt(0).toUpperCase() + m.why.slice(1) })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: "Match each constitutional milestone to why it matters.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what changed in Kenya's system of government because of each event.",
        explanation: chosen.map((m) => `${labelOf(m)} — ${m.why}.`).join(" "),
      };
    }

    if (branch === "era") {
      const chosen = shuffle(rng, MILESTONES).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((m) => m.era))).map((e) => ({ id: e, label: ERA_LABEL[e] }));
      const items = chosen.map((m) => ({ id: m.id, label: labelOf(m) }));
      const correctBucket: Record<string, string> = {};
      for (const m of chosen) correctBucket[m.id] = m.era;
      return {
        kind: "categorize",
        prompt: "Sort each event by the era of Kenya's constitutional history it belongs to.",
        items,
        buckets,
        correctBucket,
        hint: "Look at the year: before 1963 is colonial, 1963-1990 is early independence/one-party, 1991-2009 is reform, 2010 onward is the new Constitution era.",
        explanation: chosen.map((m) => `${labelOf(m)} — ${ERA_LABEL[m.era].toLowerCase()}.`).join(" "),
      };
    }

    const count = randChoice(rng, [4, 5] as const);
    const selected = shuffle(rng, MILESTONES).slice(0, count);
    const correctOrder = [...selected].sort((a, b) => a.year - b.year).map((m) => m.id);

    return {
      kind: "ordering",
      prompt: "Arrange these events in Kenya's constitutional history from earliest to most recent.",
      instruction: "Click the events in order, earliest first.",
      items: shuffle(rng, selected.map((m) => ({ id: m.id, label: labelOf(m) }))),
      correctOrder,
      hint: "Look at the year at the start of each event.",
      explanation: `In chronological order: ${correctOrder.map((id) => labelOf(MILESTONES.find((m) => m.id === id)!)).join(" → ")}.`,
    };
  },
};
