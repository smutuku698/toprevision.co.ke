import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

type Era = "traditional" | "modern";

interface CommMode {
  name: string;
  era: Era;
  useCase: string;
}

const MODES: readonly CommMode[] = [
  { name: "Drums", era: "traditional", useCase: "sending coded sound signals over long distances before modern devices existed" },
  { name: "Town criers/messengers", era: "traditional", useCase: "carrying spoken announcements from place to place on foot" },
  { name: "Smoke signals", era: "traditional", useCase: "sending simple visual signals that could be seen from far away" },
  { name: "Postal mail", era: "traditional", useCase: "sending written letters carried between towns" },
  { name: "Radio", era: "modern", useCase: "broadcasting sound programmes and news to many listeners at once" },
  { name: "Television", era: "modern", useCase: "broadcasting sound and video programmes to many viewers at once" },
  { name: "Mobile phones", era: "modern", useCase: "making calls and sending instant text messages between individuals" },
  { name: "The internet", era: "modern", useCase: "sending emails, browsing information, and using social media" },
] as const;

const CHALLENGE_SOLUTIONS = [
  { challenge: "Poor network coverage in rural and remote areas", solution: "investing in more infrastructure, such as mobile network towers", wrongSolution: "training people in digital skills" },
  { challenge: "The high cost of data and devices puts communication out of reach for some", solution: "running subsidised access programmes to lower the cost", wrongSolution: "building more mobile network towers" },
  { challenge: "Some people lack the skills to use digital communication tools", solution: "running digital literacy training programmes", wrongSolution: "installing solar-powered charging stations" },
  { challenge: "Frequent power supply gaps make it hard to charge devices", solution: "installing solar-powered charging stations", wrongSolution: "running subsidised access programmes" },
] as const;

function eraMc(rng: () => number): ScenarioMC {
  const wantModern = rng() > 0.5;
  const pool = MODES.filter((m) => m.era === (wantModern ? "modern" : "traditional"));
  const target = randChoice(rng, pool);
  const wrongPool = MODES.filter((m) => m.era !== target.era);
  return {
    prompt: `Which of these is a ${wantModern ? "modern" : "traditional"} mode of communication in Eastern Africa?`,
    correct: target.name,
    wrong: shuffle(rng, wrongPool.map((m) => m.name)).slice(0, 3),
    explanation: `${target.name} is a ${target.era} mode of communication — it is used for ${target.useCase}.`,
  };
}

function challengeSolutionMc(rng: () => number): ScenarioMC {
  const cs = randChoice(rng, CHALLENGE_SOLUTIONS);
  const correct = cs.solution.charAt(0).toUpperCase() + cs.solution.slice(1);
  // Dedupe wrong-answer candidates by text — cs.wrongSolution deliberately echoes another entry's real
  // solution, which can otherwise collide with an independently-sampled "other" wrong answer.
  const candidates = Array.from(new Set([cs.wrongSolution, ...CHALLENGE_SOLUTIONS.filter((o) => o.solution !== cs.solution).map((o) => o.solution)]));
  const wrong = shuffle(rng, candidates)
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  const place = g6SsPlace(rng);
  return {
    prompt: `Residents near ${place} face this communication challenge: "${cs.challenge}." Which solution actually addresses it?`,
    correct,
    wrong,
    explanation: `"${cs.challenge}" is best addressed by ${cs.solution}.`,
  };
}

export const communicationInEasternAfrica: Skill = {
  id: "g6-ss-res-communication-in-eastern-africa",
  code: "R.5",
  subjectId: "social-studies",
  strandId: "g6-ss-resources",
  grade: 6,
  title: "Communication in Eastern Africa",
  description: "Traditional and modern modes of communication, and challenges facing communication networks.",
  generate(rng) {
    const branch = randChoice(rng, ["era-mc", "challenge-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "era-mc" || branch === "challenge-mc") {
      const q = branch === "era-mc" ? eraMc(rng) : challengeSolutionMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about whether the mode existed before modern devices, or which solution fixes the stated challenge.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "Sending coded sound signals over long distances using drums is a", after: "mode of communication.", correct: "traditional" }),
        () => ({ before: "Mobile phones and the internet are examples of", after: "modes of communication.", correct: "modern" }),
        () => ({ before: `${name} learns that a town crier carried spoken announcements from place to place, a`, after: "mode of communication.", correct: "traditional" }),
        () => ({ before: "Broadcasting news and programmes to many listeners at once is done using", after: ".", correct: "radio" }),
        () => ({ before: "Poor network coverage in remote areas is a challenge that can be solved by investing in mobile network", after: ".", correct: "towers" }),
        () => ({ before: "Making the cost of data and devices lower for more people is called running a subsidised access", after: ".", correct: "programme" }),
        () => ({ before: "Teaching people digital skills so they can use communication tools is called digital", after: "training.", correct: "literacy" }),
        () => ({ before: "Frequent power supply gaps can be solved by installing", after: "-powered charging stations.", correct: "solar" }),
        () => ({ before: "Sending written letters between towns is done through", after: "mail.", correct: "postal" }),
        () => ({ before: "Communication networks influence a country's development by connecting people to information and", after: ".", correct: "opportunities" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about communication in Eastern Africa.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the traditional and modern modes, and their challenges.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...MODES]).slice(0, 6);
      const tokens = chosen.map((m) => ({ id: m.name, label: m.name }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: m.name, label: m.useCase.charAt(0).toUpperCase() + m.useCase.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.name] = m.name;
      return {
        kind: "click-match",
        prompt: "Match each mode of communication to how it is used.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each mode actually does.",
        explanation: chosen.map((m) => `${m.name}: used for ${m.useCase}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...MODES]).slice(0, 6);
      const items = chosen.map((m) => ({ id: m.name, label: m.name }));
      const buckets = [
        { id: "traditional", label: "Traditional mode of communication" },
        { id: "modern", label: "Modern mode of communication" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((m) => (correctBucket[m.name] = m.era));
      return {
        kind: "categorize",
        prompt: "Sort each mode of communication as traditional or modern.",
        items,
        buckets,
        correctBucket,
        hint: "Traditional modes existed before electronic devices; modern modes rely on electronics or networks.",
        explanation: chosen.map((m) => `${m.name} is a ${m.era} mode of communication.`).join(" "),
      };
    }

    // ordering — the genuine historical development of communication modes, oldest to newest.
    const timeline = [
      { id: "t1", label: "Drums and smoke signals" },
      { id: "t2", label: "Postal mail" },
      { id: "t3", label: "Radio" },
      { id: "t4", label: "Television" },
      { id: "t5", label: "Mobile phones and the internet" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these modes of communication in the order they came into wide use, from oldest to newest.",
      items: shuffle(rng, timeline),
      correctOrder: timeline.map((t) => t.id),
      instruction: "Oldest first, newest last.",
      hint: "Traditional signalling methods came long before electronic broadcasting, which came before today's mobile and internet technology.",
      explanation: `From oldest to newest: ${timeline.map((t) => t.label).join(" → ")}.`,
    };
  },
};
