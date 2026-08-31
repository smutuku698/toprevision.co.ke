import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Democracy in Society" — 2 named types (Direct,
// Indirect). See curriculum-reference/grade-5/social-studies.json.

type Kind = "DIRECT" | "INDIRECT";

const SCENARIOS: { id: string; label: string; kind: Kind }[] = [
  { id: "s1", label: "A class votes directly on which game to play during break", kind: "DIRECT" },
  { id: "s2", label: "Citizens vote directly in a referendum on a national issue", kind: "DIRECT" },
  { id: "s3", label: "A school holds a show of hands to decide the class motto", kind: "DIRECT" },
  { id: "s4", label: "A class elects a prefect who then makes decisions for the class", kind: "INDIRECT" },
  { id: "s5", label: "Citizens elect a Member of Parliament to represent them", kind: "INDIRECT" },
  { id: "s6", label: "Voters choose a president who then governs on their behalf", kind: "INDIRECT" },
];

const TERMS: { id: string; term: string; meaning: string }[] = [
  { id: "voting", term: "Voting", meaning: "choosing an option or a person by casting a vote" },
  { id: "representative", term: "Representative", meaning: "a person elected to make decisions on behalf of others" },
  { id: "referendum", term: "Referendum", meaning: "a direct vote by citizens on a single important issue" },
  { id: "election", term: "Election", meaning: "the process of choosing a leader or representative by voting" },
];

const BENEFITS = [
  "everyone's voice can be heard",
  "leaders are held accountable",
  "decisions reflect what most people want",
  "it promotes fairness in society",
  "it helps keep peace in the community",
  "it gives citizens a say in governance",
] as const;

export const democracyInSociety: Skill = {
  id: "g5-ss-gov-democracy-in-society",
  code: "G.3",
  subjectId: "social-studies",
  strandId: "g5-ss-governance",
  grade: 5,
  title: "Democracy in Society",
  description: "Identifying direct and indirect democracy, and explaining the benefits of democracy in society.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const s = randChoice(rng, SCENARIOS);
      const choices = shuffle(rng, ["Direct democracy", "Indirect democracy"]);
      const correct = s.kind === "DIRECT" ? "Direct democracy" : "Indirect democracy";
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "type of democracy")} Scenario: "${s.label}."`,
        choices,
        correctIndex: choices.indexOf(correct),
        hint: "Direct democracy means people decide themselves; indirect means they elect a representative to decide.",
        explanation: `"${s.label}" is an example of ${correct.toLowerCase()}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, TERMS).slice(0, 4);
      const tokens = chosen.map((t) => ({ id: t.id, label: t.term }));
      const targets = shuffle(rng, chosen).map((t) => ({ id: t.id, label: t.meaning.charAt(0).toUpperCase() + t.meaning.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "democracy-related term to its meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Think about voting, elections, representatives and referendums.",
        explanation: chosen.map((t) => `${t.term}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SCENARIOS);
      const correctBucket: Record<string, string> = {};
      for (const s of chosen) correctBucket[s.id] = s.kind;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether the scenario shows direct or indirect democracy"),
        items: chosen.map((s) => ({ id: s.id, label: s.label })),
        buckets: [
          { id: "DIRECT", label: "Direct Democracy" },
          { id: "INDIRECT", label: "Indirect Democracy" },
        ],
        correctBucket,
        hint: "Direct democracy: people vote on the issue themselves. Indirect: people elect someone to decide for them.",
        explanation: chosen.map((s) => `"${s.label}" is ${s.kind === "DIRECT" ? "direct" : "indirect"} democracy.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const b = randChoice(rng, BENEFITS);
      const templates = [
        () => ({ before: "When citizens vote directly on an issue themselves, this is called", after: "democracy.", correct: "direct" }),
        () => ({ before: "When citizens elect a representative to make decisions for them, this is called", after: "democracy.", correct: "indirect" }),
        () => ({ before: "A direct vote by citizens on a single important issue is called a", after: ".", correct: "referendum" }),
        () => ({ before: `One benefit of democracy is that ${b}`, after: ".", correct: "democracy" }),
        () => ({ before: "A person elected to make decisions on behalf of others is called a", after: ".", correct: "representative" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall direct vs indirect democracy and key terms like referendum and representative.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "nominate", label: "Candidates are nominated" },
      { id: "campaign", label: "Candidates campaign and state their case" },
      { id: "vote", label: "Class members vote" },
      { id: "count", label: "The votes are counted" },
      { id: "announce", label: "The winner is announced" },
    ]);
    const correctOrder = ["nominate", "campaign", "vote", "count", "announce"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps of a class election for a representative"),
      instruction: "Arrange the steps in the order they would happen.",
      items: steps,
      correctOrder,
      hint: "It starts with nominating candidates and ends with announcing the winner.",
      explanation: "A class election: nominate candidates, they campaign, class members vote, votes are counted, and the winner is announced — an example of indirect democracy.",
    };
  },
};
