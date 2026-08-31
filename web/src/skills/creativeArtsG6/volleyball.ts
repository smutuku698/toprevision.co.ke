import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC, FillBlankTemplate } from "./g6CasShared";

// KICD Grade 6 Creative Arts, sub-strand 1.3 "Volleyball" (C.5) — kept as ONE skill per the
// curriculum-reference notes: a single cohesive game unit naming exactly two skills — under-arm
// service and single-hand dig pass (scopeNotes: "not double-hand/forearm dig" — that skill is
// deliberately never the target/correct answer below, only mentioned contextually as a contrast
// in one reasoning template, matching the source's exclusion).

const SKILLS = [
  { id: "underarm-serve", label: "Under-arm service", visualSkill: "underarm-serve" as const },
  { id: "dig-pass", label: "Single-hand dig pass", visualSkill: "dig-pass" as const },
] as const;

// Real other volleyball skills (not covered at this grade) — plausible, nameable distractors for
// the identify-skill branch per RIGOR-STANDARDS.md: a learner really could confuse these actions
// with the two named skills, unlike an unrelated random draw.
const OTHER_VOLLEYBALL_SKILLS = [
  "Overhead (float) serve",
  "Two-hand set",
  "Forearm (bump) pass",
  "Spike (attack hit)",
  "Block",
] as const;

const PURPOSE_FACTS: { text: string; skill: "underarm-serve" | "dig-pass" }[] = [
  { text: "Starts the rally by sending the ball over the net first", skill: "underarm-serve" },
  { text: "The ball begins resting in the player's non-hitting hand before the swing", skill: "underarm-serve" },
  { text: "Struck below the ball's centre using the heel of the open hand", skill: "underarm-serve" },
  { text: "The hitting arm swings back before the player steps forward", skill: "underarm-serve" },
  { text: "Aimed at gaps in the opponent's court to make it harder to return", skill: "underarm-serve" },
  { text: "Followed through in the direction the ball should travel", skill: "underarm-serve" },
  { text: "A defensive skill used after the opponent attacks the ball", skill: "dig-pass" },
  { text: "Keeps a hard-driven ball from touching the ground", skill: "dig-pass" },
  { text: "Played with the body low and the knees bent", skill: "dig-pass" },
  { text: "Contact is made with the back of the hand or forearm, close to the floor", skill: "dig-pass" },
  { text: "Directs the ball upward so a teammate can play it next", skill: "dig-pass" },
  { text: "Used with a single hand when the ball is out of reach for a two-hand pass", skill: "dig-pass" },
];

const UNDERARM_SERVE_STEPS = [
  { id: "s1", label: "Stand facing the net with one foot slightly forward, holding the ball in the non-hitting hand" },
  { id: "s2", label: "Swing the hitting arm back" },
  { id: "s3", label: "Step forward, shifting your weight onto the front foot" },
  { id: "s4", label: "Strike the ball below its centre with the heel of the open hand" },
  { id: "s5", label: "Follow through in the direction you want the ball to travel" },
  { id: "s6", label: "Move quickly into position, ready for the return" },
] as const;

const DIG_PASS_STEPS = [
  { id: "d1", label: "Watch the opponent's attack closely to judge where the ball will land" },
  { id: "d2", label: "Move quickly to get your body behind the ball's path" },
  { id: "d3", label: "Bend your knees and lower your body" },
  { id: "d4", label: "Extend one arm toward the ball" },
  { id: "d5", label: "Contact the ball below its centre with the back of the hand or forearm" },
  { id: "d6", label: "Direct the ball upward toward a teammate to keep the rally going" },
] as const;

// Apply-tier Scenario+Hook reasoning templates covering force, trajectory, and court positioning
// per the brief — 12 templates, clears the 10+ pool-size floor.
const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a Grade 6 volleyball player in ${place(rng)}, is serving from the back line and the ball must travel the full length of the court to reach the other side. Why does ${who} need to apply enough force with the swinging arm?`,
      correct: "Enough force is needed so the ball has the energy to travel the full length of the court and clear the net with room to spare",
      wrong: [
        "Extra force makes the ball curve sideways instead of forward",
        "Applying force only matters for the dig pass, not the serve",
        "The ball needs less force the farther it must travel",
      ],
      explanation:
        "Serving from the back line means the ball must travel a long distance, so the server needs to apply enough force through the swing to send it the full length of the court and over the net. This links to Integrated Science's idea of applying force to move an object.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} is serving under-arm in a match in ${place(rng)} and aims the ball toward the back corner of the court instead of straight at the nearest opponent. Why is this a smart choice?`,
    correct: "Aiming at open space away from defenders makes the serve harder to return",
    wrong: [
      "Aiming at a corner always travels faster than aiming straight ahead",
      "Court positioning only matters for the dig pass, not the serve",
      "The rules require every serve to go to a back corner",
    ],
    explanation:
      "A serve aimed at open space, away from where opponents are standing, is harder to reach and return — using court positioning strategically is part of winning a rally, matching this sub-strand's key inquiry question about using service skills to win a game.",
  }),
  (rng) => ({
    prompt: `${name(rng)} sees a hard-driven ball coming in a match in ${place(rng)} and quickly bends the knees and lowers the body before digging it. Why does getting low help?`,
    correct: "Getting low brings the body and hand closer to the ball's low path so it can be contacted properly below its centre",
    wrong: [
      "Getting low makes the ball travel slower automatically",
      "Bending the knees is only useful for the under-arm serve",
      "Staying upright always gives better control of a low ball",
    ],
    explanation:
      "A hard-driven ball often travels low and fast, so lowering the body positions the digger's hand or forearm to make proper contact below the ball's centre and direct it upward.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} stretches out with one arm to reach a ball that has landed just out of normal reach during a game in ${place(rng)}, rather than trying a two-hand dig. Why choose the single-hand dig pass here?`,
      correct: "A single hand can extend farther than two hands together, reaching a ball that a two-hand dig could not",
      wrong: [
        "A single-hand dig always sends the ball higher than a two-hand dig",
        "The single-hand dig is only used when serving, not digging",
        "Two hands are never used in volleyball defence",
      ],
      explanation:
        "The single-hand dig pass extends a player's reach beyond what a two-hand dig allows, which is exactly why it is used for balls just out of normal reach.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} steps forward with the front foot while striking the ball during an under-arm serve in ${place(rng)}. What does this stepping motion help achieve?`,
    correct: "Stepping forward transfers the player's body weight into the hit, adding to the force behind the serve",
    wrong: [
      "Stepping forward is only done to stay balanced, with no effect on force",
      "Stepping forward changes the direction of the ball randomly",
      "Stepping forward is a rule requirement with no effect on the serve",
    ],
    explanation: "Transferring body weight forward while striking adds extra force to the serve, beyond what the arm swing alone would produce.",
  }),
  (rng) => ({
    prompt: `${name(rng)} strikes the ball below its centre with the heel of the open hand during an under-arm serve in ${place(rng)}. Why is striking below the centre important?`,
    correct: "Striking below the ball's centre lifts it upward and forward over the net rather than driving it flat into the net",
    wrong: [
      "Where the ball is struck has no effect on its flight path",
      "Striking above the centre always produces a higher serve",
      "Striking below the centre is only relevant for the dig pass",
    ],
    explanation:
      "Contacting the ball below its centre lifts it into an arc that carries it up and over the net, instead of driving it flat forward where it would likely hit the net.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} digs a hard-driven ball in ${place(rng)} and directs it upward rather than straight back across the net. Why is directing the ball upward the better choice?`,
      correct: "Sending the ball upward gives a teammate time and height to set or attack it next, keeping the rally alive",
      wrong: [
        "Sending the ball upward is against the rules for a dig pass",
        "Directing the ball upward always wins the point immediately",
        "It makes no difference which direction the ball is dug",
      ],
      explanation:
        "A dig pass is a defensive skill meant to keep the ball under control for a teammate — directing it upward gives the team the height and time needed to continue the rally.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s team is losing rallies in a match in ${place(rng)} and notices one opponent struggles to return low, fast serves. How can this observation improve ${who}'s team's serving strategy to win more points?`,
      correct: "Aim under-arm serves toward that weaker player's position so the team is more likely to win the rally",
      wrong: [
        "Serving strategy makes no difference to who wins a rally",
        "Always serve to the strongest player to be fair",
        "Serve location has nothing to do with winning points",
      ],
      explanation:
        "Directing serves toward a weaker returner increases the chance the receiving team makes a poor return — exactly how service skills help a team win a game, this sub-strand's own key inquiry question.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} continues moving the hitting arm forward after striking the ball during an under-arm serve in ${place(rng)}, instead of stopping the arm at contact. Why does this follow-through matter?`,
    correct: "Following through keeps the swing smooth and helps control the ball's direction and accuracy",
    wrong: [
      "Stopping the arm at contact always makes the serve more accurate",
      "Follow-through only matters for the dig pass",
      "Follow-through has no effect on the serve at all",
    ],
    explanation: "A smooth follow-through, rather than stopping the arm abruptly at contact, helps keep the swing controlled, which improves the serve's direction and accuracy.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} watches the opponent's arm swing carefully in ${place(rng)} just before they attack the ball, in order to react quickly with a dig. Why is this observation useful?`,
      correct: "Reading the attacker's swing early gives the digger more time to move into position before the ball arrives",
      wrong: [
        "Watching the opponent's swing has no effect on digging",
        "This observation is only useful for serving, not digging",
        "It is against the rules to watch an opponent before they hit the ball",
      ],
      explanation: "Anticipating where a hard-driven ball will go by reading the attacker's swing gives a defender crucial extra time to move into position for a successful dig.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} calls out clearly to a teammate before diving to dig a low ball during a game in ${place(rng)}, so they don't collide with each other. Why is this kind of communication and safety awareness important?`,
    correct: "Clear communication prevents players from colliding while both try to play the same ball, keeping the game safe",
    wrong: [
      "Communication during play is against the rules of volleyball",
      "Colliding with a teammate has no real risk during a game",
      "Only the server needs to worry about safety, not other players",
    ],
    explanation:
      "Volleyball is a team game where two players can go for the same ball — calling out and observing safety, as this sub-strand's own learning experiences describe, helps prevent collisions and injuries.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Before practising, ${who} watches a virtual recording of a Volleyball match in ${place(rng)} to study how skilled players perform the under-arm serve and dig pass. What is the main benefit of doing this first?`,
      correct: "Watching skilled performers first helps a learner understand exactly what correct technique looks like before attempting it",
      wrong: [
        "Watching a video replaces the need to ever practise the skill physically",
        "Video only shows the rules of the game, not the actual skills",
        "There is no benefit to watching video before practising",
      ],
      explanation:
        "Observing a real or virtual volleyball game to identify serving and digging skills, as this sub-strand's own learning experiences describe, builds a clear mental model of correct technique before physical practice — a good use of digital literacy.",
    };
  },
];

const FILL_BLANKS: FillBlankTemplate[] = [
  {
    before: "The volleyball skill used to start a rally by striking the ball over the net is called the ",
    after: ".",
    correctAnswer: "under-arm service",
    acceptedAnswers: ["under-arm service", "underarm service", "under arm serve", "underarm serve"],
    hint: "Think about which skill begins a rally.",
    explanation: "The under-arm service is the skill used to start a rally by striking the ball over the net.",
  },
  {
    before: "The volleyball skill used to keep a hard-driven ball from hitting the ground is called the ",
    after: ".",
    correctAnswer: "dig pass",
    acceptedAnswers: ["dig pass", "single-hand dig pass", "digging"],
    hint: "Think about the defensive skill.",
    explanation: "The single-hand dig pass is the defensive skill used to keep a hard-driven ball from touching the ground.",
  },
  {
    before: "During an under-arm serve, the ball is struck with the ",
    after: " of the open hand.",
    correctAnswer: "heel",
    acceptedAnswers: ["heel"],
    hint: "It's the base of the palm.",
    explanation: "The ball is struck below its centre using the heel of the open hand.",
  },
  {
    before: "Before striking the ball in an under-arm serve, a player holds it steady in the ",
    after: " hand.",
    correctAnswer: "non-hitting",
    acceptedAnswers: ["non-hitting", "other", "non hitting"],
    hint: "Not the arm that swings.",
    explanation: "The ball rests in the non-hitting hand before the hitting arm swings.",
  },
  {
    before: "A player performing a dig pass should keep the knees ",
    after: " and the body low.",
    correctAnswer: "bent",
    acceptedAnswers: ["bent"],
    hint: "Think about lowering your centre of gravity.",
    explanation: "Bending the knees and lowering the body helps the digger reach a low, fast-moving ball.",
  },
  {
    before: "Applying enough force to the under-arm serve helps send the ball the full length of the ",
    after: ".",
    correctAnswer: "court",
    acceptedAnswers: ["court"],
    hint: "Where the game is played.",
    explanation: "Enough force is needed so the ball can travel the full length of the court and clear the net.",
  },
  {
    before: "A dig pass directs the ball ",
    after: " so that a teammate can play it next.",
    correctAnswer: "upward",
    acceptedAnswers: ["upward", "up"],
    hint: "Think about giving a teammate time and height.",
    explanation: "Directing the ball upward gives a teammate the time and height needed to keep the rally going.",
  },
  {
    before: "Stepping forward while serving under-arm helps transfer the player's ",
    after: " into the hit.",
    correctAnswer: "weight",
    acceptedAnswers: ["weight", "body weight"],
    hint: "Think about what moving your body forward adds to the swing.",
    explanation: "Stepping forward transfers body weight into the hit, adding extra force to the serve.",
  },
  {
    before: 'The core competency "Digital literacy" in this sub-strand involves using technology to watch a virtual ',
    after: " game to identify skills.",
    correctAnswer: "volleyball",
    acceptedAnswers: ["volleyball"],
    hint: "Which sport is this sub-strand about?",
    explanation: "This sub-strand names digital literacy as using digital technology to source a virtual volleyball game to identify skills.",
  },
  {
    before: "Following through after striking the ball helps control the serve's ",
    after: ".",
    correctAnswer: "direction",
    acceptedAnswers: ["direction", "accuracy", "trajectory"],
    hint: "Think about where the ball ends up.",
    explanation: "A smooth follow-through keeps the swing controlled, which improves the serve's direction and accuracy.",
  },
];

// Term <-> meaning pool feeding the click-match branch (5th distinct QuestionKind).
const TERMS = [
  { id: "underarm-serve", label: "Under-arm service", meaning: "Starts the rally, striking the ball over the net with the heel of the open hand" },
  { id: "dig-pass", label: "Single-hand dig pass", meaning: "A defensive skill that keeps a hard-driven ball from touching the ground" },
  { id: "follow-through", label: "Follow-through", meaning: "Continuing the arm's swing smoothly after contact, to control direction and accuracy" },
  { id: "court-positioning", label: "Court positioning", meaning: "Aiming or moving toward where the opponent is weaker or the space is open" },
  { id: "weight-transfer", label: "Weight transfer", meaning: "Stepping forward during a serve to add force behind the hit" },
] as const;

const TERM_MATCH_PROMPTS = ["Match each volleyball term to its meaning.", "Pair each term with its definition.", "Match each word to what it means in volleyball.", "Connect each term to its correct meaning.", "For each term below, choose its matching meaning."] as const;
const IDENTIFY_SKILL_PROMPTS = ["Which volleyball skill is shown here?", "Identify the volleyball skill shown in the diagram.", "Look at the diagram — which skill is this?", "Name the volleyball skill being performed.", "Which of the two named skills does this diagram show?"] as const;
const PURPOSE_SORT_PROMPTS = ["Sort each description by the volleyball skill it describes.", "Which volleyball skill does each description match? Sort them.", "Sort these descriptions into under-arm service or dig pass.", "Classify each description by the skill it belongs to.", "Match each description to its volleyball skill by sorting."] as const;
const TECHNIQUE_ORDER_PROMPTS = ["Put these steps for performing the {skill} in the correct order.", "Arrange the steps for performing the {skill}, in order.", "Order these {skill} steps, from first to last.", "Sort these steps for the {skill} into the correct sequence.", "Place these {skill} steps in the order you would perform them."] as const;
const FILL_BLANK_PROMPTS = ["Complete the sentence.", "Fill in the missing word.", "Complete this sentence about volleyball.", "Fill in the blank below.", "Complete the sentence with the correct word."] as const;

export const volleyball: Skill = {
  id: "g6-cas-volleyball",
  code: "C.5",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-creating-executing",
  grade: 6,
  title: "Volleyball — serving and digging skills",
  description:
    "Identifying the under-arm service and single-hand dig pass in Volleyball, performing each skill's technique sequence, and reasoning about how service skills help win a game.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-skill", "purpose-sort", "term-match", "reasoning", "technique-order", "fill-blank"] as const);

    if (branch === "identify-skill") {
      const target = randChoice(rng, SKILLS);
      const other = SKILLS.find((s) => s.id !== target.id)!;
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.label, [other.label, ...OTHER_VOLLEYBALL_SKILLS], 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_SKILL_PROMPTS),
        visual: { type: "volleyball-skill", skill: target.visualSkill },
        choices,
        correctIndex,
        layout: "list",
        hint: "Look at where the ball is and how the arm is moving.",
        explanation: `This shows the ${target.label.toLowerCase()}.`,
      };
    }

    if (branch === "purpose-sort") {
      const chosen = shuffle(rng, PURPOSE_FACTS).slice(0, 8);
      const items = chosen.map((f, i) => ({ id: `p${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`p${i}`] = f.skill));
      return {
        kind: "categorize",
        prompt: randChoice(rng, PURPOSE_SORT_PROMPTS),
        items,
        buckets: SKILLS.map((s) => ({ id: s.id, label: s.label })),
        correctBucket,
        hint: "The under-arm service starts a rally; the dig pass is a defensive skill.",
        explanation: chosen.map((f) => `"${f.text}" describes the ${SKILLS.find((s) => s.id === f.skill)!.label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "term-match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
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
        hint: "Think about the two named skills, plus what force, positioning, and technique add to them.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
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
        hint: "Think about force, trajectory, or court positioning.",
        explanation: q.explanation,
      };
    }

    if (branch === "technique-order") {
      const useServe = rng() < 0.5;
      const steps: readonly { id: string; label: string }[] = useServe ? UNDERARM_SERVE_STEPS : DIG_PASS_STEPS;
      const skillLabel = useServe ? "under-arm service" : "single-hand dig pass";
      const shuffled = shuffle(rng, steps);
      return {
        kind: "ordering",
        prompt: randChoice(rng, TECHNIQUE_ORDER_PROMPTS).replace("{skill}", skillLabel),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: steps.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Think about what has to happen before you can strike or contact the ball.",
        explanation: `Correct order: ${steps.map((s) => s.label).join(" → ")}.`,
      };
    }

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: fb.acceptedAnswers ?? [fb.correctAnswer],
      inputMode: "text",
      hint: fb.hint,
      explanation: fb.explanation,
    };
  },
};
