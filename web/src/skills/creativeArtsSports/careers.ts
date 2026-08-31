import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Which of these is a career directly related to Creative Arts and Sports?",
    correct: "Sports commentator",
    distractors: ["Bank teller", "Civil engineer", "Pharmacist"],
  },
  {
    q: "A person who earns income by weaving and selling traditional Kenyan fabrics is engaging in which kind of opportunity?",
    correct: "An entrepreneurial opportunity in indigenous crafts",
    distractors: ["A government-only career path", "An opportunity unrelated to Creative Arts and Sports", "A purely academic research career"],
  },
  {
    q: "Which career involves helping athletes improve their performance and prepare for competition?",
    correct: "Sports coach",
    distractors: ["Art gallery curator", "Music producer", "Costume designer"],
  },
  {
    q: "Which of these is an example of an entrepreneurial opportunity in photography?",
    correct: "Opening a photography studio to take and sell photographs for clients",
    distractors: ["Working only as an unpaid volunteer", "Refusing to ever sell any photographs", "Only taking photos for personal use"],
  },
  {
    q: "What is the main role of an art gallery curator?",
    correct: "To select, organise, and present artworks for exhibition",
    distractors: ["To referee sports matches", "To repair sports equipment", "To compose music for films"],
  },
  {
    q: "Which career would suit someone skilled in composing and recording music?",
    correct: "Music producer",
    distractors: ["Referee", "Potter", "Sports physiotherapist"],
  },
  {
    q: "Designing and selling logos for sports teams and businesses is an example of what?",
    correct: "An entrepreneurial opportunity that combines art and business skills",
    distractors: ["A purely physical sport", "A career with no link to Creative Arts and Sports", "A hobby that can never earn income"],
  },
  {
    q: "Which of the following is a career on the sports side of Creative Arts and Sports?",
    correct: "Referee or umpire",
    distractors: ["Pottery instructor", "Music composer", "Portrait painter"],
  },
  {
    q: "Why is it useful for a learner to identify career opportunities in Creative Arts and Sports early?",
    correct: "It helps them plan a future pathway that matches their talents and interests",
    distractors: ["It guarantees a job without any further training", "It removes the need to ever practise a skill", "It only matters for people who dislike sports and art"],
  },
];

const CAREER_PAIRS: { role: string; meaning: string }[] = [
  { role: "Sports coach", meaning: "Helps athletes improve their performance and prepare for competition" },
  { role: "Art gallery curator", meaning: "Selects, organises, and presents artworks for exhibition" },
  { role: "Music producer", meaning: "Composes and records music" },
  { role: "Referee or umpire", meaning: "Officiates sports matches on the sports side of Creative Arts and Sports" },
  { role: "Photography studio owner", meaning: "Opens a studio to take and sell photographs for clients" },
  { role: "Indigenous crafts entrepreneur", meaning: "Weaves and sells traditional Kenyan fabrics for income" },
  { role: "Logo designer", meaning: "Designs and sells logos for sports teams and businesses, combining art and business skills" },
];

const MATCH_PROMPTS = [
  "Match each career or opportunity in Creative Arts and Sports to what it involves.",
  "Pair each career below with what it actually involves.",
  "Connect each career or opportunity to its correct description.",
  "Match each role to the work it involves.",
  "For each career below, choose its matching description.",
] as const;

export const careers: Skill = {
  id: "cas-careers",
  code: "F.1",
  subjectId: "creative-arts-sports",
  strandId: "cas-foundations",
  grade: 9,
  title: "Careers in Creative Arts and Sports",
  description: "Identify careers and entrepreneurial opportunities in Creative Arts and Sports.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, CAREER_PAIRS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.role, label: c.role })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.role, label: c.meaning })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.role] = c.role;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about jobs that use art, music, drama, photography, crafts, or sports skills — as employment or as a business.",
        explanation: chosen.map((c) => `${c.role} — ${c.meaning.toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Think about jobs that use art, music, drama, photography, crafts, or sports skills — as employment or as a business.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
