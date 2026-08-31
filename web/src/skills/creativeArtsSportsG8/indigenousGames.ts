import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const GAME_TYPES = [
  { id: "chaser", label: "Chaser tag", meaning: "One player is 'it' and tries to touch (tag) the other players to pass on that role" },
  { id: "safe-zone", label: "Safe-zone tag", meaning: "Players become temporarily safe from being tagged by reaching a marked base or zone" },
  { id: "partner", label: "Partner tag", meaning: "Two or more players work together as taggers, coordinating to corner and catch the others" },
  { id: "rhythm", label: "Rhythm tag", meaning: "Tagging movements are performed to the beat of music or clapping, adding coordination to the chase" },
];

const STATEMENTS: { label: string; bucket: "about" | "benefit" }[] = [
  { label: "Passed down through generations within local communities", bucket: "about" },
  { label: "Usually played in an open space or field with agreed boundaries", bucket: "about" },
  { label: "One player is chosen to be 'it' and chases the others", bucket: "about" },
  { label: "Builds physical fitness through running, agility, and quick reaction time", bucket: "benefit" },
  { label: "Improves coordination, especially when tagging is performed to a rhythm", bucket: "benefit" },
  { label: "Provides enjoyment and encourages teamwork among players", bucket: "benefit" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "How do indigenous tagging games enhance physical fitness?", correct: "They require running, quick changes of direction, and fast reaction time", distractors: ["They require no movement at all", "They only involve sitting and watching others play", "They only build upper-body strength"] },
  { q: "Why is tagging considered an indigenous game in Kenya?", correct: "It has been played and passed down within local communities for generations", distractors: ["It was invented very recently by a toy company", "It is only played outside Kenya", "It requires expensive imported equipment"] },
  { q: "What is the purpose of a 'safe zone' in some tagging games?", correct: "It gives players a marked base where they cannot be tagged", distractors: ["It marks where the game must end", "It is where the player who is 'it' must always stand", "It has no effect on how the game is played"] },
  { q: "How can performing tagging games with musical rhythm improve a player's skill?", correct: "It adds a coordination challenge, timing movement to the beat while still reacting to the chase", distractors: ["It has no effect on the game at all", "It makes the game slower and less active", "It removes the need to run"] },
  { q: "What is one recognised benefit of playing indigenous tagging games regularly?", correct: "They support enjoyment, teamwork, and physical fitness at the same time", distractors: ["They have been shown to have no benefits at all", "They only benefit players who are already very fast", "They are only suitable for very young children"] },
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement into About Tagging Games or Benefits of Tagging Games.",
  "Which category does each statement below belong to? Sort them.",
  "Classify each statement as About Tagging Games or Benefits of Tagging Games.",
  "Decide which category each statement fits, and sort it.",
  "Sort these statements by the category they belong to.",
] as const;

const MATCH_PROMPTS = [
  "Match each type of tagging game to its correct description.",
  "Pair each game type below with its correct description.",
  "Match each game type to what it describes.",
  "Connect each type of tagging game to its correct description.",
  "For each game type below, choose its matching description.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about how a tagging game works.",
  "Fill in the missing word about how a tagging game works.",
  "Complete this sentence about tagging games.",
  "Fill in the blank about how a tagging game works.",
  "Complete the sentence with the correct word.",
] as const;

export const indigenousGames: Skill = {
  id: "g8-cas-indigenous-games",
  code: "C.13",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Kenyan Indigenous Games",
  description: "Types of Kenyan indigenous tagging games, and their value for fitness, coordination, and enjoyment.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "terms-match", "fill-blank", "theory-mc"] as const);

    if (branch === "categorize") {
      const aboutPicks = shuffle(rng, STATEMENTS.filter((s) => s.bucket === "about")).slice(0, 2);
      const benefitPicks = shuffle(rng, STATEMENTS.filter((s) => s.bucket === "benefit")).slice(0, 2);
      const items = shuffle(rng, [...aboutPicks, ...benefitPicks]);
      const correctBucket: Record<string, string> = {};
      for (const s of items) correctBucket[s.label] = s.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((s) => ({ id: s.label, label: s.label })),
        buckets: [
          { id: "about", label: "About Tagging Games" },
          { id: "benefit", label: "Benefits of Tagging Games" },
        ],
        correctBucket,
        hint: "'About' statements describe how the games are played; 'benefits' statements describe what playing them achieves.",
        explanation: items.map((s) => `"${s.label}" is ${s.bucket === "about" ? "about how tagging games are played" : "a benefit of tagging games"}.`).join(" "),
      };
    }

    if (branch === "terms-match") {
      const chosen = shuffle(rng, GAME_TYPES);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Safe-zone tag uses a base; partner tag has cooperating taggers; rhythm tag adds a musical beat.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: "In tagging games, the player who is 'it' must",
        after: "another player to pass on that role.",
        correctAnswer: "tag",
        acceptedAnswers: ["touch"],
        inputMode: "text",
        hint: "This is the action that gives the game its name.",
        explanation: "In tagging games, the player who is 'it' must touch (tag) another player to pass on that role.",
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Tagging games build fitness and coordination while being an enjoyable, community-rooted tradition.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
