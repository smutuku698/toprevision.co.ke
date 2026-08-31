import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import {
  place,
  name,
  buildScenarioChoices,
  pickPrompt,
  SORT_PROMPTS,
  MATCH_PROMPTS,
  ORDER_PROMPTS,
  TRUE_FALSE_PROMPTS,
  FILL_BLANK_PROMPTS,
  IDENTIFY_PROMPTS,
} from "./g5CasShared";
import type { ScenarioMC } from "./g5CasShared";

// KICD Grade 5 Creative Arts, Strand 2.0 Performing and Displaying, sub-strand 2.6
// "Indigenous Kenyan Games" (OPTIONAL — chosen instead of Swimming) (15 lessons) — counting
// games.
//
// Mined verbatim: identify types of indigenous counting games played in Kenya; perform
// different indigenous counting games for skill acquisition; perform them to a musical
// rhythm; appreciate the role of counting games for fitness and health. Key inquiry: how do
// indigenous counting games enhance physical fitness? Core competencies: Communication and
// Collaboration; Learning to learn. Link to other learning area: Mathematics (knowledge of
// counting). Suggested resources: counter, ropes, bean bags.
//
// The games named are well-known active Kenyan playground games in which players count
// aloud (often to a chant or rhythm) while doing a physical action.
//
// Visual coverage: no counting-game VisualSpec exists in the shared set; building one is
// out of scope for this pass. Recorded so the omission is deliberate.

const GAMES = [
  { id: "skipping", label: "Skipping-rope counting game", desc: "Players jump a turning rope and count each jump aloud, often to a chant, until someone misses" },
  { id: "hopscotch", label: "Hopscotch", desc: "Players hop through a grid of numbered squares, counting the squares, sometimes on one foot" },
  { id: "beanbag", label: "Bean-bag toss and count", desc: "Players toss and catch a bean bag, adding one more catch each round and counting the total" },
  { id: "ball-catch", label: "Ball-catch counting game", desc: "Players count successful catches of a ball; the more catches, the more turns or lives a player earns" },
  { id: "clapping", label: "Clapping-and-counting circle game", desc: "Players keep a clapping rhythm while counting round the circle in turn; a wrong count or missed clap is out" },
] as const;

const GAME_FACTS = [
  { text: "Count every jump of the turning rope aloud until you trip", id: "skipping" },
  { text: "Hop from square to square, saying each number as you land", id: "hopscotch" },
  { text: "Balance on one foot in the single squares and on two in the double squares", id: "hopscotch" },
  { text: "Add one extra catch to the target each round and count up to it", id: "beanbag" },
  { text: "Toss the small filled bag up, clap, and catch it before it lands", id: "beanbag" },
  { text: "Count how many times the group catches the ball without dropping it", id: "ball-catch" },
  { text: "Earn more turns by reaching a higher catch count", id: "ball-catch" },
  { text: "Keep a steady clap going while each player says the next number in turn", id: "clapping" },
  { text: "If you break the rhythm or say the wrong number, you leave the circle", id: "clapping" },
  { text: "The turning rope sets the pace you must keep counting and jumping to", id: "skipping" },
] as const;

const FITNESS = [
  { id: "endurance", label: "Endurance (stamina)", desc: "Keeping moving for a long time without tiring — built by continuous skipping and running games" },
  { id: "agility", label: "Agility", desc: "Changing direction and position quickly and lightly — built by dodging and fast hopping" },
  { id: "balance", label: "Balance", desc: "Staying steady, especially on one foot — built by hopscotch and one-legged games" },
  { id: "coordination", label: "Coordination", desc: "Making the eyes, hands and feet work together in time — built by bean-bag and ball games" },
  { id: "strength", label: "Leg strength", desc: "Powerful pushing muscles — built by repeated jumping and hopping" },
] as const;

const FITNESS_TF = [
  { text: "Counting aloud keeps the game moving at a steady pace, so players keep being active", isTrue: true },
  { text: "Adding a musical rhythm sets a tempo that keeps the effort continuous", isTrue: true },
  { text: "Different counting games build different parts of fitness — stamina, agility, balance, coordination", isTrue: true },
  { text: "Playing in a group keeps everyone motivated to stay active for longer", isTrue: true },
  { text: "Counting games are active play, so they help keep a healthy body weight", isTrue: true },
  { text: "Counting games make you unfit because you stand still and only talk", isTrue: false },
  { text: "The rhythm and chant have no effect on how long children keep playing", isTrue: false },
  { text: "Every counting game trains exactly the same one fitness component", isTrue: false },
  { text: "Warming up first and playing on a clear, safe surface prevent injuries", isTrue: true },
  { text: "It is fine to play a running counting game on a slippery or littered floor", isTrue: false },
  { text: "Taking turns and cheering others on builds teamwork as well as fitness", isTrue: true },
  { text: "Counting games only help you count better and do nothing for the body", isTrue: false },
] as const;

const LESSON_STEPS = [
  { id: "l1", label: "Watch a live or virtual demonstration of an indigenous counting game" },
  { id: "l2", label: "Identify the counting and movement skills the game uses" },
  { id: "l3", label: "Demonstrate the game slowly, checking the space is safe" },
  { id: "l4", label: "Practise the game together with the group, counting aloud" },
  { id: "l5", label: "Add a musical rhythm or chant and play the game to its beat" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked the key inquiry question: how do indigenous counting games enhance physical fitness? Which answer is best?`,
      correct: "The counting keeps the game going at a steady pace, so players keep moving and build stamina, agility, balance and coordination",
      wrong: [
        "They improve fitness only by teaching children to count faster",
        "They tire children out so they rest more",
        "They have no effect on fitness; they are only maths practice",
      ],
      explanation: "Counting (often to a rhythm) keeps the physical action continuous, so children get sustained active play that develops several fitness components at once.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s class in ${place(rng)} plays a skipping counting game and then adds a clapping chant to it. Why does adding a musical rhythm help?`,
    correct: "The rhythm sets a steady tempo, keeping the jumping and counting continuous so the exercise lasts longer",
    wrong: [
      "The rhythm lets players stop moving while they sing",
      "The rhythm makes the rope turn by itself",
      "The rhythm has no purpose; it is only for fun",
    ],
    explanation: "A musical rhythm gives the game a beat to keep to, so effort stays continuous and even — which is what makes it good exercise.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wants a counting game that mainly builds balance. Which is the best choice?`,
      correct: "Hopscotch — hopping and landing on one foot in the single squares trains balance",
      wrong: [
        "A seated clapping-and-counting game with no movement",
        "Counting marbles into a hole while kneeling",
        "Counting how many friends are present",
      ],
      explanation: "Hopscotch involves balancing on one foot to land and pause in the single squares, which develops balance. A seated game does little for physical fitness.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} plays a bean-bag toss-and-count game, catching more each round. Which fitness component does this mainly build?`,
    correct: "Coordination — making the eyes and hands work together in time",
    wrong: [
      "Endurance only — a bean-bag game builds nothing but stamina",
      "Balance only — the bean bag has nothing to do with the hands",
      "No fitness component at all",
    ],
    explanation: "Tossing, clapping and catching a bean bag on the beat trains hand-eye coordination; different counting games target different fitness components.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} plays a counting game and uses knowledge of numbers to keep the score. Which subject does the design link this to?`,
      correct: "Mathematics — using the knowledge of counting during the game",
      wrong: [
        "English — because the chant has words",
        "It links to no other subject",
        "Science — because the ball moves through the air",
      ],
      explanation: "The design links indigenous counting games to Mathematics: learners use their knowledge of counting to play and score the games.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s group in ${place(rng)} is about to play a running counting game on a floor with spilt water and loose stones. What should they do first?`,
    correct: "Clear and check the playing space, or move to a safe, clear surface, before starting",
    wrong: [
      "Start anyway; a slippery floor makes the game more exciting",
      "Play the game seated instead so the floor does not matter",
      "Play faster so nobody slips",
    ],
    explanation: "Safety is part of this sub-strand: an active counting game needs a clear, non-slippery space, so hazards must be cleared before play begins.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} claims a counting game does nothing for the body because "you are just saying numbers". Why is this wrong?`,
      correct: "In these games the counting goes with a physical action — jumping, hopping, dodging or tossing — so players are exercising the whole time",
      wrong: [
        "It is correct; counting games are only maths practice",
        "It is wrong only because counting tires the voice",
        "It is wrong because the games are always played sitting down",
      ],
      explanation: "Indigenous counting games pair the count with continuous movement, so the number chant is what keeps the physical activity going — the body is working throughout.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} identifies a game: players keep a steady clap going while each person in the circle says the next number, and anyone who breaks the rhythm is out. Which game is it?`,
    correct: "A clapping-and-counting circle game",
    wrong: ["Hopscotch", "A skipping-rope counting game", "Bean-bag toss and count"],
    explanation: "Keeping a group clapping rhythm while counting round a circle, with a fumble putting you out, is the clapping-and-counting circle game.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} plays a long skipping counting game every break for a month. Which fitness component is most improved?`,
      correct: "Endurance — continuous skipping over a long time builds stamina",
      wrong: [
        "Balance only — skipping has nothing to do with staying moving",
        "Coordination only — the legs are not involved in skipping",
        "None — repeating a game does not improve fitness",
      ],
      explanation: "Sustained skipping is continuous aerobic activity, so it mainly builds endurance (stamina), along with leg strength and rhythm.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s teacher in ${place(rng)} says counting games also build things beyond fitness. Which of these do they also build?`,
    correct: "Teamwork and turn-taking, because players count in turn, cheer each other on and follow shared rules",
    wrong: [
      "Nothing else; they only build fitness",
      "Only the ability to shout loudly",
      "Only the skill of standing still patiently",
    ],
    explanation: "Alongside fitness, counting games build communication and collaboration — taking turns, keeping a shared rhythm, following rules and encouraging others.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  { before: "A game in which players jump a turning rope and say each jump number aloud is a skipping ", after: " game.", correctAnswer: "counting" },
  { before: "The game in which players hop through a grid of numbered squares, counting them, is called ", after: ".", correctAnswer: "hopscotch" },
  { before: "Hopping and landing on one foot in hopscotch mainly builds a swimmer's or player's ", after: ".", correctAnswer: "balance" },
  { before: "Tossing, clapping and catching a bean bag on the beat mainly builds hand-eye ", after: ".", correctAnswer: "coordination" },
  { before: "Long, continuous skipping mainly builds stamina, also called ", after: ".", correctAnswer: "endurance" },
  { before: "Adding a chant or musical ", after: " sets a tempo that keeps the game's effort continuous.", correctAnswer: "rhythm" },
  { before: "The design links indigenous counting games to Mathematics through the knowledge of ", after: ".", correctAnswer: "counting" },
  { before: "Before an active counting game, the group should check the space is clear and not ", after: ".", correctAnswer: "slippery", acceptedAnswers: ["slippery", "wet"] },
  { before: "Counting in turn, keeping a shared rhythm and following rules together build ", after: " as well as fitness.", correctAnswer: "teamwork", acceptedAnswers: ["teamwork", "collaboration", "cooperation"] },
  { before: "In a clapping-and-counting circle game, a player who breaks the rhythm or says the wrong number is ", after: ".", correctAnswer: "out" },
  { before: "Because counting games are active play, they help children keep a healthy body ", after: ".", correctAnswer: "weight" },
  { before: "In these games the counting always goes together with a physical ", after: ", so the body keeps working.", correctAnswer: "action", acceptedAnswers: ["action", "movement"] },
] as const;

const IDENTIFY_GAME_PROMPTS = [
  ...IDENTIFY_PROMPTS,
  "Which indigenous counting game is described here?",
  "Name the counting game described.",
  "Which of these counting games fits the description?",
] as const;

export const indigenousKenyanGames: Skill = {
  id: "g5-cas-indigenous-kenyan-games",
  code: "P.7",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-performing-displaying",
  grade: 5,
  title: "Indigenous Kenyan games (counting games)",
  description:
    "Types of indigenous Kenyan counting games (skipping, hopscotch, bean-bag toss-and-count, ball-catch, clapping-and-counting circle games); performing them to a musical rhythm; and how counting games build physical fitness (endurance, agility, balance, coordination) and health. (Optional sub-strand, chosen instead of Swimming.)",
  generate(rng) {
    const branch = randChoice(rng, [
      "identify-game",
      "game-fact-sort",
      "fitness-match",
      "fitness-tf",
      "lesson-order",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "identify-game") {
      const target = randChoice(rng, GAMES);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        GAMES.filter((g) => g.id !== target.id).map((g) => g.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `${pickPrompt(rng, IDENTIFY_GAME_PROMPTS)} ${target.desc}.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Is the count tied to jumping a rope, hopping numbered squares, catching a bean bag or ball, or clapping round a circle?",
        explanation: `This is the ${target.label.toLowerCase()}: ${target.desc.toLowerCase()}.`,
      };
    }

    if (branch === "game-fact-sort") {
      const chosen = shuffle(rng, GAME_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `gf${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`gf${i}`] = f.id));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: GAMES.map((g) => ({ id: g.id, label: g.label })),
        correctBucket,
        hint: "Match each rule or action to the game it belongs to.",
        explanation: chosen
          .map((f) => `"${f.text}" — ${GAMES.find((g) => g.id === f.id)!.label}.`)
          .join(" "),
      };
    }

    if (branch === "fitness-match") {
      const chosen = shuffle(rng, FITNESS);
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.id, label: f.desc })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((f) => (correctMap[f.id] = f.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Endurance = keep going; agility = quick changes; balance = stay steady; coordination = eyes and hands together; strength = powerful legs.",
        explanation: chosen.map((f) => `${f.label} — ${f.desc}.`).join(" "),
      };
    }

    if (branch === "fitness-tf") {
      const chosen = shuffle(rng, FITNESS_TF).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `t${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`t${i}`] = f.isTrue ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, TRUE_FALSE_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "Counting keeps the movement going, rhythm keeps it steady, different games build different fitness, and a clear safe space prevents injury.",
        explanation: chosen.map((f) => `"${f.text}" is ${f.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "lesson-order") {
      const shuffled = shuffle(rng, LESSON_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (learning and playing an indigenous counting game)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: LESSON_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Watch a demonstration, spot the skills, try it slowly and safely, practise it together, then play it to a musical rhythm.",
        explanation: "Correct order: " + LESSON_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about how counting keeps movement going, why rhythm helps, which game builds which fitness component, and the safety of the space.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    const accepted = "acceptedAnswers" in fb && fb.acceptedAnswers ? fb.acceptedAnswers : [fb.correctAnswer];
    return {
      kind: "fill-blank",
      prompt: pickPrompt(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...accepted],
      inputMode: "text",
      hint: "Think about the counting games, the fitness components they build, the role of musical rhythm, and the link to counting in Mathematics.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
