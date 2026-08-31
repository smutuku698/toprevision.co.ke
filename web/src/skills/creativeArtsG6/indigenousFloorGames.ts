import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, Strand 2.0 Performing and Displaying, sub-strand 2.5 "Indigenous
// Kenyan Games — Floor games" (optional — the other alternative to Swimming, per the design's
// "the learner MUST cover ONE" note; this app builds both, matching the Grade 8 Creative Arts and
// Sports precedent of shipping both alternatives). Scope note per curriculum-reference/grade-6/
// creative-arts.json: the source design does NOT enumerate specific named floor games in its
// Suggested Learning Experiences text — a genuine thin spot in the source. This skill uses
// commonly-documented, real Kenyan/East African floor games only: bao/ajua (a mancala-family
// seed-sowing board game played widely across East Africa, including coastal Kenya), plus
// generically-framed hopscotch-style, hand-clapping/counting, skipping-rhyme, and marble/stonetarget floor games that are broadly documented as common Kenyan playground games, rather than
// asserting precise unfamiliar names.

const GAMES = [
  { id: "bao", label: "Bao/Ajua", desc: "A mancala-family board game where players sow small seeds or counters around a row of pits, played widely across East Africa including coastal Kenya", skill: "counting and strategic planning" },
  { id: "hopscotch", label: "A hopscotch-style jumping game", desc: "Numbered squares drawn on the ground, hopped through in sequence on one or two feet", skill: "balance, agility, and following a numbered sequence" },
  { id: "clapping", label: "A hand-clapping counting game", desc: "A synchronised clapping pattern performed with a partner to a rhyming or counting chant", skill: "rhythm, coordination, and memory" },
  { id: "skipping", label: "A skipping-rhyme game", desc: "Jumping over a turning rope in time with a counting or rhyming chant", skill: "timing, rhythm, and physical fitness" },
  { id: "marbles", label: "A marble/stone-target game", desc: "Flicking or rolling small stones or marbles toward a drawn target on the ground, counting successful hits", skill: "aim, fine motor control, and counting" },
] as const;

const TERMS: { id: string; label: string; meaning: string; blank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] } }[] = [
  {
    id: "bao-term",
    label: "Bao/Ajua",
    meaning: "A mancala-family board game where seeds are sown around pits, requiring counting and planning",
    blank: { before: "A mancala-family board game where seeds are sown around pits is called ", after: ".", correctAnswer: "bao", acceptedAnswers: ["bao", "ajua", "bao/ajua"] },
  },
  {
    id: "floor-game",
    label: "Floor game",
    meaning: "A traditional game played on the ground, often needing little or no equipment",
    blank: { before: "A traditional game played on the ground, often needing little or no equipment, is called a ", after: ".", correctAnswer: "floor game" },
  },
  {
    id: "musical-rhythm",
    label: "Musical rhythm combination",
    meaning: "Performing a floor game's movements in time with a musical beat, for enjoyment",
    blank: { before: "Performing a floor game's movements in time with a musical beat is called combining it with a musical ", after: ".", correctAnswer: "rhythm" },
  },
  {
    id: "fitness",
    label: "Physical fitness",
    meaning: "Good bodily health and condition, which regularly playing active floor games helps build",
    blank: { before: "Good bodily health and condition, built up by regularly playing active games, is called physical ", after: ".", correctAnswer: "fitness" },
  },
];

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} plays a skipping-rhyme floor game every break time for a whole term. What is the most likely benefit named in the source for playing floor games regularly?`,
      correct: "Improved physical fitness and health from the regular activity",
      wrong: [
        "Floor games have no real effect on fitness at all",
        "Only board games like bao improve fitness, never active games",
        "Playing the same game repeatedly always becomes unsafe over time",
      ],
      explanation: "The source names fitness and health as a benefit of practising indigenous floor games — active games like skipping-rhyme games contribute to this, unlike the claim that floor games have no fitness effect.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s class in ${place(rng)} performs a hopscotch-style game while a drum keeps a steady beat, timing their hops to the rhythm. What is this class demonstrating?`,
    correct: "Executing an indigenous floor game to a musical rhythm, for enjoyment",
    wrong: [
      "This combination is not part of what the source describes for floor games",
      "Musical rhythm can only be combined with bao/ajua, not physical games",
      "Adding a drum beat always makes a hopscotch-style game unsafe",
    ],
    explanation: "The source specifically describes practising different types of indigenous floor games while combining them with a musical rhythm, for enjoyment — exactly what this class is doing.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why floor games such as bao/ajua and hopscotch-style games are considered "indigenous" rather than simply "old". What is the best explanation?`,
      correct: "They are rooted in and passed down through local communities and traditions over generations",
      wrong: [
        "Indigenous simply means the game was invented within the last ten years",
        "Indigenous games are only ones played exclusively by adults, never children",
        "The word \"indigenous\" has no real meaning when describing a game",
      ],
      explanation: "Indigenous games are rooted in and passed down through local communities over generations — this is different from simply being old, being adults-only, or being a meaningless label.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} plays bao/ajua with a friend, carefully planning several moves ahead before sowing the next seed. Which skill is this game mainly developing?`,
    correct: "Counting and strategic planning",
    wrong: [
      "Balance and physical agility, the same skills a hopscotch-style game develops",
      "Musical rhythm and timing, the same skills a skipping-rhyme game develops",
      "Bao/ajua develops no particular skill at all",
    ],
    explanation: "Bao/ajua is a counting- and strategy-based board game, developing planning and counting skills — this is different from the physical agility or musical timing skills other floor games develop.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s group in ${place(rng)} watches a live demonstration of a floor game and identifies the skills involved before attempting it themselves. Why does the source suggest watching a demonstration first?`,
      correct: "So learners can identify what the game requires before practising it themselves, observing safety",
      wrong: [
        "Watching first has no real purpose and could be skipped entirely",
        "Demonstrations are only needed for board games like bao, never physical games",
        "The purpose is purely for entertainment, not learning",
      ],
      explanation: "Watching a demonstration first lets learners identify the skills a game requires before practising it themselves, observing safety — this is a real learning purpose, not just entertainment, and applies to both physical and board games.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} joins a group hand-clapping game where every player must keep the same rhythm and timing to avoid mistakes. Which core competency does playing this game together mainly develop?`,
    correct: "Communication and Collaboration — working with others in performing the game",
    wrong: [
      "Digital literacy — no digital devices are used in a hand-clapping game",
      "Citizenship — this game is not specifically about civic participation",
      "It develops no core competency at all",
    ],
    explanation: "The source names Communication and Collaboration — working with others — as a core competency developed by performing indigenous floor games together, such as a hand-clapping game requiring shared timing.",
  }),
];

const RECOGNITION_PROMPTS = ["Which floor game is being described?", "Identify the floor game.", "Which game does this describe?", "Read the description and name the game.", "What is this floor game called?"] as const;
const SKILL_CATEGORIZE_PROMPTS = ["Sort each game by the main skill it develops.", "Which skill does each game mainly develop? Sort them.", "Sort these floor games by main skill.", "Classify each game by the skill it builds most.", "Match each game to its main skill by sorting."] as const;
const TERM_MATCH_PROMPTS = ["Match each term to its meaning.", "Pair each term with its definition.", "Match each word to what it means.", "Connect each term to its correct meaning.", "For each term below, choose its matching meaning."] as const;
const SESSION_ORDER_PROMPTS = ["Put these steps of a floor-game lesson in the correct order.", "Arrange the steps of a floor-game lesson in order.", "Order these floor-game lesson steps, from first to last.", "Sort these lesson steps into the correct sequence.", "Place these steps in the order a class would follow them."] as const;
const FILL_BLANK_PROMPTS = ["Complete the sentence.", "Fill in the missing word.", "Complete this sentence about indigenous floor games.", "Fill in the blank below.", "Complete the sentence with the correct word."] as const;

const SESSION_STEPS = [
  { id: "s1", label: "Watch a virtual or live demonstration of an indigenous floor game and identify the skills observed" },
  { id: "s2", label: "Demonstrate the floor game, observing safety" },
  { id: "s3", label: "Practise the floor game, observing safety" },
  { id: "s4", label: "Practise the game while combining it with a musical rhythm" },
  { id: "s5", label: "Talk about the game's role in enhancing fitness with peers" },
] as const;

export const indigenousFloorGames: Skill = {
  id: "g6-cas-indigenous-floor-games",
  code: "P.6",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-performing-displaying",
  grade: 6,
  title: "Indigenous floor games",
  description: "Identifying and performing indigenous Kenyan floor games such as bao/ajua, hopscotch-style, hand-clapping, skipping-rhyme, and marble/stone-target games, combining them with musical rhythm, and appreciating their role in fitness and health.",
  generate(rng) {
    const branch = randChoice(rng, ["game-recognition", "skill-categorize", "term-match", "reasoning", "session-order", "fill-blank"] as const);

    if (branch === "game-recognition") {
      const target = randChoice(rng, GAMES);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.label, GAMES.filter((g) => g.id !== target.id).map((g) => g.label), 3);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, RECOGNITION_PROMPTS)} ${target.desc}.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about whether the game uses a board, jumping, clapping, rope, or aiming.",
        explanation: `This describes ${target.label.toLowerCase()} — ${target.desc}.`,
      };
    }

    if (branch === "skill-categorize") {
      const buckets = [
        { id: "counting-strategy", label: "Counting/strategy" },
        { id: "coordination-rhythm", label: "Coordination/rhythm" },
        { id: "agility", label: "Agility/physical fitness" },
      ] as const;
      const mapping: Record<string, string> = { bao: "counting-strategy", hopscotch: "agility", clapping: "coordination-rhythm", skipping: "agility", marbles: "counting-strategy" };
      const items = GAMES.map((g) => ({ id: g.id, label: g.label }));
      const correctBucket: Record<string, string> = {};
      GAMES.forEach((g) => (correctBucket[g.id] = mapping[g.id]));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SKILL_CATEGORIZE_PROMPTS),
        items,
        buckets: [...buckets],
        correctBucket,
        hint: `${GAMES.map((g) => g.label).join(", ")} — think about whether each game mainly needs planning, timing/rhythm, or movement.`,
        explanation: GAMES.map((g) => `${g.label} mainly develops ${g.skill}.`).join(" "),
      };
    }

    if (branch === "term-match") {
      const chosen = TERMS;
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t) => (correctMap[t.id] = t.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, TERM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about bao/ajua, floor games generally, musical rhythm, and fitness.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about fitness, musical rhythm, community tradition, and working together.", explanation: q.explanation };
    }

    if (branch === "session-order") {
      const shuffled = shuffle(rng, SESSION_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, SESSION_ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: SESSION_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Watch first, then demonstrate, practise, combine with rhythm, and finally discuss.",
        explanation: "Correct order: " + SESSION_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    const t = randChoice(rng, TERMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: t.blank.before,
      after: t.blank.after,
      correctAnswer: t.blank.correctAnswer,
      acceptedAnswers: t.blank.acceptedAnswers ?? [t.blank.correctAnswer],
      inputMode: "text",
      hint: "Think about bao/ajua, floor games, musical rhythm, and fitness.",
      explanation: `${t.label}: ${t.meaning}.`,
    };
  },
};
