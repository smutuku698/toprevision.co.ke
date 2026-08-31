import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SPORTS_VOCABULARY: { term: string; definition: string }[] = [
  { term: "Referee", definition: "The official who ensures players follow the rules of the game" },
  { term: "Sportsmanship", definition: "Fair and respectful behaviour towards opponents, win or lose" },
  { term: "Stamina", definition: "The physical or mental endurance to keep performing for a long time" },
  { term: "Tournament", definition: "A series of matches held to determine an overall winner" },
  { term: "Spectators", definition: "People who watch a sports event without taking part in it" },
];

const SPORTS_BENEFIT_ITEMS: { text: string; bucket: string }[] = [
  { text: "Improves physical fitness and health", bucket: "Benefit of participating in sports" },
  { text: "Builds teamwork and discipline", bucket: "Benefit of participating in sports" },
  { text: "Helps relieve stress", bucket: "Benefit of participating in sports" },
  { text: "Promotes unity through events like inter-school tournaments", bucket: "Benefit of participating in sports" },
  { text: "Guarantees that a player will never get injured", bucket: "Not a benefit / myth" },
  { text: "Means schoolwork is no longer necessary", bucket: "Not a benefit / myth" },
  { text: "Guarantees every player a professional career", bucket: "Not a benefit / myth" },
];

const DEBATE_STEPS: { id: string; label: string }[] = [
  { id: "intro", label: "State your position clearly in the introduction" },
  { id: "point1", label: "Present your first point with supporting evidence" },
  { id: "point2", label: "Present your second point with supporting evidence" },
  { id: "counter", label: "Respond to a likely counter-argument" },
  { id: "conclude", label: "Summarise your points in a strong conclusion" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  {
    before: "The official who ensures players follow the rules during a match is called the",
    after: ".",
    answer: "referee",
  },
  {
    before: "Organising your debate points in a clear, logical",
    after: "helps the audience follow your argument easily.",
    answer: "order",
    accepted: ["sequence", "structure"],
  },
  {
    before: "Regular participation in sports and games improves physical fitness and builds",
    after: "among teammates.",
    answer: "teamwork",
  },
  {
    before: "A series of matches held to determine an overall winner is called a",
    after: ".",
    answer: "tournament",
  },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What does 'sportsmanship' mean?",
    correct: "Behaving fairly and respectfully towards opponents, whether you win or lose",
    distractors: [
      "Arguing with the referee after every decision",
      "Refusing to shake hands with the losing team",
      "Celebrating a win by insulting the opponents",
    ],
  },
  {
    q: "Why are sports and games important in modern living?",
    correct: "They improve fitness, build teamwork, and relieve stress",
    distractors: [
      "They replace the need for formal education entirely",
      "They guarantee a professional career for every participant",
      "They are only meant for entertainment and have no other value",
    ],
  },
  {
    q: "How can a speaker help the audience follow a debate presentation?",
    correct: "By organising ideas logically, from introduction to conclusion",
    distractors: [
      "By jumping randomly between unrelated points",
      "By speaking as quickly as possible",
      "By avoiding any structure at all",
    ],
  },
  {
    q: "What is the role of a referee in a sports match?",
    correct: "To ensure that players follow the rules of the game",
    distractors: [
      "To cheer loudly for one of the teams",
      "To sell tickets to spectators",
      "To coach the players during the match",
    ],
  },
  {
    q: "What does 'audience awareness' mean during a debate?",
    correct: "Adjusting your language and delivery so your listeners understand your argument clearly",
    distractors: [
      "Speaking only to the judges and ignoring everyone else",
      "Using the most complicated words possible",
      "Ignoring how the audience reacts to your points",
    ],
  },
];

export const sportsDebate: Skill = {
  id: "g8-il-ls-sports",
  code: "LS.7",
  subjectId: "indigenous-language",
  strandId: "g8-il-listening-speaking",
  grade: 8,
  title: "Sports and games: presentation skills in debate",
  description: "Identify sports vocabulary, organise ideas logically, and apply audience awareness skills during a debate.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A strong debate speaker uses clear sports vocabulary, organises ideas logically, and keeps the audience in mind.";

    if (branch === "match") {
      const chosen = shuffle(rng, SPORTS_VOCABULARY).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.definition })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.term] = v.term;
      return {
        kind: "click-match",
        prompt: "Match each sports term to its definition.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((v) => `${v.term} — ${v.definition.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SPORTS_BENEFIT_ITEMS);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement into the correct group.",
        items,
        buckets,
        correctBucket,
        hint: "A true benefit is something sports realistically provide; a myth promises something sports cannot guarantee.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, DEBATE_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the logical structure of a debate speech in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: DEBATE_STEPS.map((s) => s.id),
        hint: "Start with a clear position, give supporting points, address a counter-argument, and end with a strong conclusion.",
        explanation: DEBATE_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        acceptedAnswers: entry.accepted,
        inputMode: "text",
        hint,
        explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim(),
      };
    }

    const entry = randChoice(rng, MC_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
