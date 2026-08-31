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
  FILL_BLANK_PROMPTS,
  IDENTIFY_PROMPTS,
} from "./g5CasShared";
import type { ScenarioMC } from "./g5CasShared";

// KICD Grade 5 Creative Arts, Strand 1.0 Creating and Executing, sub-strand 1.6 "Rounders"
// (16 lessons).
//
// Mined verbatim: Rounders bat; Carving a bat; Batting; Fielding. Sub-strand outcomes name
// the bat features (knob, handle, grip, head, length and thickness), identifying materials
// and tools used in carving (focus on wood-cutting tools), carving a bat, and executing
// batting and fielding skills; value the safety of self and others. Key inquiry: how do
// fielding skills help players in a Rounders game? Core competencies: Communication and
// Collaboration; Creativity and Imagination. Link to other learning area: Mathematics
// (order and counting while fielding and batting).
//
// Visual coverage: no rounders-bat or carving-tool VisualSpec exists in the shared set;
// building one is out of scope for this pass. Recorded so the omission is deliberate.

const BAT_FEATURES = [
  { id: "knob", label: "Knob", role: "The rounded end at the bottom of the handle that stops the bat sliding out of the batter's hands" },
  { id: "handle", label: "Handle", role: "The thin part of the bat that the batter holds" },
  { id: "grip", label: "Grip", role: "The covering wrapped around the handle to give a firm, non-slip hold" },
  { id: "head", label: "Head", role: "The thicker end of the bat that actually strikes the ball" },
  { id: "length", label: "Length", role: "How long the whole bat is — it must suit the player and stay within the rules" },
  { id: "thickness", label: "Thickness", role: "How thick or slim the bat is across its width — a rounders bat is quite slim" },
] as const;

const BAT_FACTS = [
  { text: "It is the rounded end that keeps the bat from flying out of your hands on a swing", id: "knob" },
  { text: "It is the narrow section your fingers wrap around", id: "handle" },
  { text: "It is the wrapped or textured covering that stops your hand slipping", id: "grip" },
  { text: "It is the fat striking end where you aim to meet the ball", id: "head" },
  { text: "It is measured from the knob to the tip of the head", id: "length" },
  { text: "It describes how wide the bat is across, and a rounders bat is fairly slim", id: "thickness" },
  { text: "A worn one of these makes the bat spin in sweaty hands", id: "grip" },
  { text: "Without this rounded end the bat could slip and fly dangerously when swung", id: "knob" },
] as const;

const TOOL_FACTS = [
  { text: "A saw, for cutting the rough piece of wood to length", ok: true },
  { text: "A chisel and mallet, for carving away wood to shape the bat", ok: true },
  { text: "A whittling knife, for shaping the handle and grip area", ok: true },
  { text: "A gouge, for hollowing curved cuts into the wood", ok: true },
  { text: "A rasp or file, for smoothing the carved shape", ok: true },
  { text: "Sandpaper, for the final smoothing before polishing", ok: true },
  { text: "A paintbrush loaded with wash paint", ok: false },
  { text: "A dye bath for tie and dye", ok: false },
  { text: "A calligraphy pen and ink", ok: false },
  { text: "A football", ok: false },
] as const;

const CARVE_STEPS = [
  { id: "v1", label: "Choose a straight, dry (seasoned) piece of hardwood free of cracks" },
  { id: "v2", label: "Mark the outline of the bat on the wood, including its length and thickness" },
  { id: "v3", label: "Saw or chop away the large waste pieces to get roughly to the bat shape" },
  { id: "v4", label: "Carve the head, handle and grip area to shape with a chisel and knife, observing safety" },
  { id: "v5", label: "Shape the rounded knob at the end of the handle" },
  { id: "v6", label: "Smooth the whole bat with a rasp and then sandpaper" },
  { id: "v7", label: "Rub in oil or polish, then test the bat's balance and grip" },
] as const;

const BAT_FIELD_ACTIONS = [
  { text: "Watching the ball all the way onto the bat", role: "batting" },
  { text: "Swinging the bat level to meet the ball", role: "batting" },
  { text: "Hitting the ball into a gap where no fielder is standing", role: "batting" },
  { text: "Placing the bat down safely before running, not throwing it", role: "batting" },
  { text: "Running hard to the first post after making contact", role: "batting" },
  { text: "Catching a ball hit high in the air to get the batter out", role: "fielding" },
  { text: "Stopping a fast ground ball with two hands", role: "fielding" },
  { text: "Throwing the ball quickly and accurately to a post", role: "fielding" },
  { text: "Calling 'mine!' so two fielders do not collide", role: "fielding" },
  { text: "Backing up a team-mate in case they miss the ball", role: "fielding" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked how good fielding skills help a rounders team. Which answer is best?`,
      correct: "Fielding gets batters out (by catching) and stops or slows runs, so the batting side scores fewer rounders",
      wrong: [
        "Fielding decides which team bats first",
        "Fielding only matters for how the game looks, not the score",
        "Fielding is the job of the batting side, not the fielding side",
      ],
      explanation: "Fielders catch to dismiss batters and field the ball quickly to limit runs, both of which keep the batting side's score down — that is why fielding skills matter.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} needs to carve the fat striking end of a bat down to shape from a rough block. Which tool fits the job?`,
    correct: "A chisel and mallet — to carve away wood in controlled cuts",
    wrong: [
      "A paintbrush — this is for applying colour, not removing wood",
      "A dye bath — this is for colouring fabric, not shaping wood",
      "Sandpaper alone — this only smooths a surface, it cannot remove large amounts of wood",
    ],
    explanation: "Shaping a bat from a rough block needs a wood-cutting tool such as a chisel and mallet. Sandpaper is for the final smoothing, and paint and dye are not carving tools.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s bat in ${place(rng)} keeps twisting in sweaty hands during a swing. Which feature of the bat needs attention?`,
      correct: "The grip — the covering on the handle should be replaced or re-wrapped so the hold does not slip",
      wrong: [
        "The head — but the striking end does not affect how the bat is held",
        "The length — a bat does not slip because it is too long",
        "The thickness of the head — the width of the striking end is not the cause of a slipping hold",
      ],
      explanation: "The grip is the covering on the handle that gives a firm, non-slip hold. A worn grip lets the bat twist in the hands; the head, length and head-thickness are separate features.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} finishes a hit and drops the bat gently on the ground before running. Why place the bat down instead of throwing it aside?`,
    correct: "A thrown bat can hit and injure the backstop or a fielder; placing it down keeps everyone safe",
    wrong: [
      "A thrown bat counts as an extra rounder for the batting side",
      "Throwing the bat is against the rules only in football, not rounders",
      "It makes no difference; a bat cannot hurt anyone",
    ],
    explanation: "Safety of self and others is part of this sub-strand. A carelessly thrown bat can strike a nearby player, so batters must set it down before running.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} carves a bat and shapes a rounded lump at the very end of the handle. What is this part called, and what does it do?`,
      correct: "The knob — it stops the bat sliding out of the hands during a hard swing",
      wrong: [
        "The head — but the head is the striking end, not the end of the handle",
        "The grip — but the grip is the wrapping along the handle, not a shaped lump",
        "The thickness — but that describes how wide the bat is, not a part of it",
      ],
      explanation: "The knob is the rounded end below the handle; it keeps the bat from flying out of the batter's grip on a powerful swing.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} fields a ground ball cleanly and then throws it to the post the runner is heading for. Which subject's skills does this quick decision and throw draw on, per the design?`,
    correct: "Mathematics — using order and counting (which runner, which post, how far) while fielding",
    wrong: [
      "English — because the fielder shouts a word",
      "It draws on no other subject",
      "Music — because the throw has rhythm",
    ],
    explanation: "The design links rounders to Mathematics through order and counting — judging batting order, which post a runner is between, and how many rounders are scored.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `While carving in ${place(rng)}, ${who} steadies the wood in a clamp and cuts away from the body with a sharp chisel. Why is cutting away from the body important?`,
      correct: "If the tool slips, it moves away from the hands and body instead of towards them, avoiding a cut",
      wrong: [
        "Cutting away from the body makes the wood shape faster",
        "It keeps the chisel from getting blunt",
        "It has no safety purpose; the direction of cutting is only about comfort",
      ],
      explanation: "Wood-carving safety means always cutting away from the body and keeping the wood clamped, so a slipping blade travels into empty space rather than into a hand.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees two fielders both running for the same catch. What should they do to field safely and successfully?`,
    correct: "One fielder calls loudly for the catch and the other backs off and moves to back them up",
    wrong: [
      "Both keep running at full speed and hope one of them catches it",
      "Both stop completely and let the ball land between them",
      "They swap the ball hand to hand while running",
    ],
    explanation: "Calling for the ball ('mine!') and having the other player back up prevents a collision and still covers the catch — this is a communication and fielding skill.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is choosing wood to carve a bat and picks a green (freshly cut, wet) branch with a split running down it. Why is this a poor choice?`,
      correct: "Wet wood warps and the split will widen as it dries, so the finished bat could bend or break",
      wrong: [
        "Green wood is too heavy to lift and carve at all",
        "A split branch is perfect because it is already half the shape of a bat",
        "It makes no difference; any piece of wood carves into a sound bat",
      ],
      explanation: "A bat needs seasoned (dried) wood free of cracks. A wet, split branch warps and splits further as it dries, weakening the bat.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} hits the ball high and a fielder catches it before it bounces. What happens to ${name(rng)}?`,
    correct: "The batter is out — a clean catch before the ball bounces dismisses the batter",
    wrong: [
      "The batter scores a rounder for hitting it so high",
      "Nothing happens; catches do not count in rounders",
      "The batter bats again immediately",
    ],
    explanation: "A fielder catching the ball before it touches the ground gets the batter out — one of the main reasons fielding skills matter in rounders.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} carves the bat's outline and marks its overall length and its thickness before cutting. Why mark both measurements first?`,
    correct: "So the finished bat is the right size to swing and stays within the rules, with no wood wasted by guesswork",
    wrong: [
      "So the wood becomes lighter before carving starts",
      "Marking is only decorative and does not affect the bat",
      "So the bat will not need smoothing afterwards",
    ],
    explanation: "Marking the length and thickness first guides the carving so the bat comes out a usable, legal size, rather than being carved by guesswork and ending up wrong.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  { before: "The rounded end at the bottom of a rounders bat's handle, which stops it slipping from the hands, is the ", after: ".", correctAnswer: "knob" },
  { before: "The thin part of the bat that the batter holds is the ", after: ".", correctAnswer: "handle" },
  { before: "The covering wrapped around the handle to give a firm, non-slip hold is the ", after: ".", correctAnswer: "grip" },
  { before: "The thicker striking end of the bat, where you aim to meet the ball, is the ", after: ".", correctAnswer: "head" },
  { before: "How long the whole bat is, measured from knob to head, is its ", after: ".", correctAnswer: "length" },
  { before: "How wide the bat is across — and a rounders bat is quite slim — is its ", after: ".", correctAnswer: "thickness" },
  { before: "A saw, a chisel, a gouge and a whittling knife are all examples of wood-", after: " tools used in carving.", correctAnswer: "cutting" },
  { before: "Carving safely means always cutting ", after: " from your body, so a slip does not cut you.", correctAnswer: "away" },
  { before: "Catching a batted ball before it bounces gets the batter ", after: ".", correctAnswer: "out" },
  { before: "Before running after a hit, a batter should place the bat down safely rather than ", after: " it.", correctAnswer: "throwing", acceptedAnswers: ["throwing", "throw"] },
  { before: "Bat wood should be seasoned, meaning it has been ", after: ", so the finished bat does not warp.", correctAnswer: "dried", acceptedAnswers: ["dried", "seasoned"] },
  { before: "Two fielders going for the same ball should ", after: " for it so they do not collide.", correctAnswer: "call", acceptedAnswers: ["call", "shout", "communicate"] },
] as const;

const IDENTIFY_FEATURE_PROMPTS = [
  ...IDENTIFY_PROMPTS,
  "Which part of the rounders bat is described here?",
  "Name the bat feature described.",
  "Which feature of the bat fits this description?",
] as const;

export const rounders: Skill = {
  id: "g5-cas-rounders",
  code: "C.6",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-creating-executing",
  grade: 5,
  title: "Rounders",
  description:
    "The features of a rounders bat (knob, handle, grip, head, length, thickness); the materials and wood-cutting tools used to carve a bat and the carving process; and batting and fielding skills, with safety of self and others.",
  generate(rng) {
    const branch = randChoice(rng, [
      "identify-feature",
      "bat-fact-sort",
      "feature-role-match",
      "tool-sort",
      "carve-order",
      "bat-field-sort",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "identify-feature") {
      const target = randChoice(rng, BAT_FEATURES);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        BAT_FEATURES.filter((f) => f.id !== target.id).map((f) => f.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `${pickPrompt(rng, IDENTIFY_FEATURE_PROMPTS)} ${target.role}.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about which end of the bat, and whether it is a part you hold, a part that hits, or a measurement.",
        explanation: `This is the ${target.label.toLowerCase()}: ${target.role.toLowerCase()}.`,
      };
    }

    if (branch === "bat-fact-sort") {
      const chosen = shuffle(rng, BAT_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `bf${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`bf${i}`] = f.id));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: BAT_FEATURES.map((f) => ({ id: f.id, label: f.label })),
        correctBucket,
        hint: "Knob = the safety end; handle = what you hold; grip = the wrapping; head = the striking end; length and thickness are measurements.",
        explanation: chosen
          .map((f) => `"${f.text}" — the ${BAT_FEATURES.find((b) => b.id === f.id)!.label.toLowerCase()}.`)
          .join(" "),
      };
    }

    if (branch === "feature-role-match") {
      const chosen = shuffle(rng, BAT_FEATURES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.id, label: f.role })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((f) => (correctMap[f.id] = f.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Match each bat part or measurement to what it is or does.",
        explanation: chosen.map((f) => `${f.label} — ${f.role}.`).join(" "),
      };
    }

    if (branch === "tool-sort") {
      const chosen = shuffle(rng, TOOL_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `tl${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`tl${i}`] = f.ok ? "yes" : "no"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "yes", label: "Used to carve a bat" },
          { id: "no", label: "Not a carving tool" },
        ],
        correctBucket,
        hint: "Carving needs wood-cutting and smoothing tools — saw, chisel, gouge, knife, rasp, sandpaper. Paint, dye, pens and balls are not carving tools.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.ok ? "used in carving" : "not a carving tool"}.`).join(" "),
      };
    }

    if (branch === "carve-order") {
      const shuffled = shuffle(rng, CARVE_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (carving a rounders bat from wood)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: CARVE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Pick the wood, mark the shape, saw off waste, carve the parts, shape the knob, smooth, then oil and test.",
        explanation: "Correct order: " + CARVE_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "bat-field-sort") {
      const chosen = shuffle(rng, BAT_FIELD_ACTIONS).slice(0, 6);
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.role));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "batting", label: "Batting skill" },
          { id: "fielding", label: "Fielding skill" },
        ],
        correctBucket,
        hint: "Batting is what the player with the bat does; fielding is what the players without the bat do to get batters out and stop runs.",
        explanation: chosen.map((a) => `"${a.text}" — ${a.role}.`).join(" "),
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
        hint: "Think about how fielding limits the score, which tool suits which carving job, and how to keep self and others safe.",
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
      hint: "Think about the bat features (knob, handle, grip, head, length, thickness), the carving tools, and batting and fielding.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
