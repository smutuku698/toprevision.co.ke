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

// KICD Grade 5 Creative Arts, Strand 2.0 Performing and Displaying, sub-strand 2.1
// "Athletics" (16 lessons).
//
// Mined verbatim: Baton change (upsweep, downsweep); Relays; Plaiting technique. Learning
// experiences: improvise a baton from plastic/wood/bamboo/aluminium; collect and prepare
// rope materials (sisal, leather, old fabric) by cutting to size and dyeing/painting; plait
// a 3-strand rope for use as a finishing tape; perform visual and non-visual baton change;
// appraise self and peers. Key inquiry: why is observance of the visual and non-visual baton
// change skill important in a relay race? How are plaiting materials prepared? Core
// competencies: Creativity and Imagination; Learning to learn. Link to other learning area:
// Mathematics (measuring to make an improvised baton).
//
// Visual coverage: no relay-changeover or plaiting VisualSpec exists in the shared set;
// building one is out of scope for this pass. Recorded so the omission is deliberate.

const TERMS = [
  { id: "upsweep", label: "Upsweep", meaning: "The incoming runner pushes the baton upward into the receiver's hand, which is held back with the palm facing down and back" },
  { id: "downsweep", label: "Downsweep", meaning: "The incoming runner brings the baton downward into the receiver's hand, which is held back with the palm facing up" },
  { id: "visual-change", label: "Visual baton change", meaning: "The receiving runner looks back to watch the baton placed into their hand — slower but safer" },
  { id: "non-visual-change", label: "Non-visual baton change", meaning: "The receiving runner does not look back but runs at full speed with the hand out, responding to a called signal — faster but needs much practice" },
  { id: "incoming-runner", label: "Incoming runner", meaning: "The runner arriving with the baton, who passes it on" },
  { id: "outgoing-runner", label: "Outgoing runner", meaning: "The runner waiting to receive the baton and carry it on" },
  { id: "changeover-zone", label: "Changeover zone", meaning: "The marked stretch of track within which the baton must be exchanged" },
] as const;

const SWEEP_FACTS = [
  { text: "The incoming runner drives the baton upward into the hand", id: "upsweep" },
  { text: "The receiver's palm faces down and back, fingers pointing down, to catch the baton from below", id: "upsweep" },
  { text: "The baton lands in the V between the thumb and first finger, pushed up from underneath", id: "upsweep" },
  { text: "The incoming runner places the baton down into the hand with a downward action", id: "downsweep" },
  { text: "The receiver's palm faces up (and back), ready for the baton to be laid into it from above", id: "downsweep" },
  { text: "The baton is brought down onto the open palm rather than pushed up into it", id: "downsweep" },
] as const;

const VISUAL_FACTS = [
  { text: "The receiver turns their head to watch the baton coming into the hand", id: "visual" },
  { text: "Safer and easier to learn, but the receiver loses a little speed by looking back", id: "visual" },
  { text: "Often used by younger runners and in longer relay legs", id: "visual" },
  { text: "The receiver keeps their eyes forward and does not look at the baton at all", id: "non-visual" },
  { text: "Relies on a shouted signal such as 'hand!' from the incoming runner", id: "non-visual" },
  { text: "Keeps the receiver at full sprint speed, but needs a lot of practice and trust", id: "non-visual" },
  { text: "Used in the fast sprint relay so no speed is lost in the changeover", id: "non-visual" },
] as const;

const RELAY_TF = [
  { text: "A clean baton change lets the team keep its speed through the exchange", isTrue: true },
  { text: "Dropping the baton or exchanging it outside the changeover zone can get the team disqualified", isTrue: true },
  { text: "In a non-visual change, the incoming runner calls a signal so the receiver knows when to close the hand", isTrue: true },
  { text: "Practising the baton change many times builds the timing and trust the team needs on race day", isTrue: true },
  { text: "The visual change is safer because the receiver can see the baton being placed in the hand", isTrue: true },
  { text: "It does not matter where on the track the baton is passed", isTrue: false },
  { text: "A non-visual change works fine with no practice at all", isTrue: false },
  { text: "The receiving runner should stop and stand still to take the baton", isTrue: false },
  { text: "Whether the baton is passed cleanly has no effect on the team's finishing time", isTrue: false },
  { text: "Both runners must keep to their own lane during the changeover to avoid collisions", isTrue: true },
  { text: "The receiver holds the hand steady and firm so the incoming runner has a clear target", isTrue: true },
  { text: "It is best for the receiver to grab at the baton with a snatching motion while looking away and hoping", isTrue: false },
] as const;

const PLAIT_STEPS = [
  { id: "q1", label: "Collect the materials — sisal, strips of leather or old fabric" },
  { id: "q2", label: "Cut three strands to the same length" },
  { id: "q3", label: "Comb out or soften the strands so they bend easily" },
  { id: "q4", label: "Dye or paint the strands to decorate them, then let them dry" },
  { id: "q5", label: "Tie the three strands together at one end and fix that end so it cannot move" },
  { id: "q6", label: "Cross the right strand over the middle, then the left strand over the new middle" },
  { id: "q7", label: "Keep alternating right-over-middle and left-over-middle, pulling each cross snug" },
  { id: "q8", label: "Tie off the finishing end so the plait cannot unravel, and use it as the finishing tape" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s team in ${place(rng)} keeps losing time at the changeover because the receiver slows to look back for the baton every time. Which change would keep more speed, and what does it need?`,
      correct: "The non-visual change — the receiver keeps sprinting, eyes forward, and closes the hand on a called signal; it needs lots of practice",
      wrong: [
        "The visual change — but that is exactly the method that is costing them speed",
        "Stopping fully at the line to take the baton safely, then setting off again",
        "Passing the baton before the changeover zone to save time",
      ],
      explanation: "A non-visual change lets the receiver stay at full speed because they do not turn to look; it works only if the team has practised the timing and the call. Passing outside the zone is illegal.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is the receiver and holds the hand back with the palm facing down and back, ready for the baton to be pushed up from below. Which baton change is this?`,
    correct: "The upsweep — the baton is driven upward into the downward-facing hand",
    wrong: [
      "The downsweep — but that needs the palm facing up for the baton to be laid down into it",
      "The visual change — but that describes whether the receiver looks back, not the hand action",
      "The non-visual change — again, that is about looking, not about the hand position",
    ],
    explanation: "In the upsweep the receiver's palm faces down and back and the incoming runner pushes the baton up into the V of the hand. The downsweep uses an upward-facing palm.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} asks why the baton change matters so much when every runner is fast anyway. What is the best answer?`,
      correct: "A slow or dropped change loses time or gets the team disqualified, so a smooth change can decide the race even between equally fast teams",
      wrong: [
        "The baton change decides which lane the team runs in",
        "It only matters for how neat the team looks to spectators",
        "It has no effect; the race is decided only by how fast each runner is",
      ],
      explanation: "Relays are often won or lost at the changeovers: fumbling, slowing, or passing outside the zone costs time or the whole race, even if the individual runners are quick.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s team in ${place(rng)} is new to relays and nervous about the exchange. Which baton change should they learn first, and why?`,
    correct: "The visual change — the receiver watches the baton into the hand, which is safer and easier while they build confidence",
    wrong: [
      "The non-visual change — beginners should start with the hardest method",
      "Neither — beginners should just carry the baton and not pass it",
      "Whichever is faster, regardless of how hard it is to control",
    ],
    explanation: "The visual change is safer and easier to learn because the receiver can see the baton being placed; teams usually master it before moving to the faster non-visual change.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is improvising a relay baton from a piece of bamboo and measures it before cutting. Which subject does the design link this measuring to?`,
      correct: "Mathematics — using measuring concepts to make an improvised baton",
      wrong: [
        "English — because the baton could have writing on it",
        "It links to no other subject",
        "Science — because bamboo is a plant",
      ],
      explanation: "The design links this sub-strand to Mathematics: learners use measuring to make an improvised baton of a suitable length.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is preparing sisal to plait a finishing-tape rope. Which order of preparation makes sense?`,
    correct: "Cut the strands to equal length, comb them soft, then dye or paint them and let them dry — before plaiting",
    wrong: [
      "Plait the rough sisal first, then cut it to length and dye it afterwards",
      "Dye the whole bundle first, then cut, then never comb it",
      "Skip cutting to length so the plait comes out any size",
    ],
    explanation: "Plaiting materials are prepared by cutting to size, softening the fibres, and dyeing or painting to decorate, then drying — all before the strands are plaited.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `In a non-visual change in ${place(rng)}, ${who} (the incoming runner) says nothing and just tries to put the baton in the moving hand. Why does this usually fail?`,
      correct: "Without a called signal the receiver does not know the exact moment to hold the hand steady and close it, so the timing is missed",
      wrong: [
        "The baton is too heavy to pass without shouting",
        "Silence is against the rules of relay racing",
        "It would work fine; the call is only a tradition",
      ],
      explanation: "In a non-visual change the receiver cannot see the baton, so the incoming runner's call ('hand!' or 'stick!') tells them when to present and close the hand. No call means no shared timing.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} takes the baton but then drifts into the next lane during the exchange. What is the risk?`,
    correct: "Leaving the lane can cause a collision and can get the team disqualified",
    wrong: [
      "Nothing — runners may use any lane during a changeover",
      "It makes the baton lighter to carry",
      "It only matters in the visual change, not the non-visual one",
    ],
    explanation: "Both runners must stay in their own lane through the changeover; drifting out risks a collision and a disqualification, whichever change method is used.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is the receiver in a downsweep and holds the palm facing down. The incoming runner cannot place the baton. What is wrong?`,
      correct: "For a downsweep the palm should face up so the baton can be laid down into it; a downward palm is the upsweep position",
      wrong: [
        "The receiver should have both hands out for a downsweep",
        "The downsweep has no set hand position; any will do",
        "The receiver should be facing backwards for a downsweep",
      ],
      explanation: "The downsweep needs an upward-facing (and slightly back) palm so the baton can be brought down onto it. A downward palm is for the upsweep.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s team in ${place(rng)} practises the changeover again and again before sports day. Which core competency does this repeated practice mainly build, per the design?`,
    correct: "Learning to learn — acquiring the new skill of baton change (upsweep and downsweep) through practice",
    wrong: [
      "Citizenship — because relays are a national sport",
      "Digital literacy — because a phone times the runs",
      "It builds no core competency at all",
    ],
    explanation: "The design names Learning to learn as a core competency for this sub-strand: the learner acquires the new baton-change skills through repeated practice.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  { before: "The baton change in which the incoming runner pushes the baton upward into a downward-facing hand is the ", after: ".", correctAnswer: "upsweep" },
  { before: "The baton change in which the incoming runner brings the baton down into an upward-facing hand is the ", after: ".", correctAnswer: "downsweep" },
  { before: "A baton change in which the receiver looks back to watch the baton into the hand is called a ", after: " change.", correctAnswer: "visual" },
  { before: "A baton change in which the receiver keeps eyes forward and responds to a called signal is called a ", after: " change.", correctAnswer: "non-visual", acceptedAnswers: ["non-visual", "nonvisual", "non visual"] },
  { before: "The marked stretch of track within which the baton must be exchanged is the ", after: " zone.", correctAnswer: "changeover" },
  { before: "In a non-visual change, the incoming runner gives a spoken ", after: " so the receiver knows when to close the hand.", correctAnswer: "signal", acceptedAnswers: ["signal", "call", "command"] },
  { before: "A relay rope for the finishing tape is made by ", after: " three strands together.", correctAnswer: "plaiting", acceptedAnswers: ["plaiting", "braiding"] },
  { before: "Before plaiting, the strands are cut to the same ", after: ".", correctAnswer: "length" },
  { before: "Plaiting strands are decorated by ", after: " or painting them before they are plaited.", correctAnswer: "dyeing", acceptedAnswers: ["dyeing", "dying"] },
  { before: "During the changeover, each runner must stay in their own ", after: " to avoid a collision.", correctAnswer: "lane" },
  { before: "Passing the baton outside the changeover zone can get the team ", after: ".", correctAnswer: "disqualified" },
  { before: "The design links making an improvised baton to Mathematics through the concept of ", after: ".", correctAnswer: "measuring", acceptedAnswers: ["measuring", "measurement"] },
] as const;

const IDENTIFY_TERM_PROMPTS = [
  ...IDENTIFY_PROMPTS,
  "Which relay term is described here?",
  "Name the baton-change term described.",
  "Which of these relay terms fits the description?",
] as const;

export const athletics: Skill = {
  id: "g5-cas-athletics",
  code: "P.1",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-performing-displaying",
  grade: 5,
  title: "Athletics (relays)",
  description:
    "The upsweep and downsweep baton changes, and the visual and non-visual baton change in a relay race; why a clean exchange matters; improvising a baton; and plaiting a 3-strand rope for the finishing tape, including how plaiting materials are prepared.",
  generate(rng) {
    const branch = randChoice(rng, [
      "identify-term",
      "sweep-sort",
      "visual-sort",
      "term-meaning-match",
      "plait-order",
      "relay-tf",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "identify-term") {
      const target = randChoice(rng, TERMS);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        TERMS.filter((t) => t.id !== target.id).map((t) => t.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `${pickPrompt(rng, IDENTIFY_TERM_PROMPTS)} ${target.meaning}.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Upsweep vs downsweep is about the hand and baton direction; visual vs non-visual is about whether the receiver looks back.",
        explanation: `This is the ${target.label.toLowerCase()}: ${target.meaning.toLowerCase()}.`,
      };
    }

    if (branch === "sweep-sort") {
      const chosen = shuffle(rng, SWEEP_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `sw${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`sw${i}`] = f.id));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "upsweep", label: "Upsweep" },
          { id: "downsweep", label: "Downsweep" },
        ],
        correctBucket,
        hint: "Upsweep: palm faces down, baton pushed up. Downsweep: palm faces up, baton laid down.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.id}.`).join(" "),
      };
    }

    if (branch === "visual-sort") {
      const chosen = shuffle(rng, VISUAL_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `vs${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`vs${i}`] = f.id));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "visual", label: "Visual change" },
          { id: "non-visual", label: "Non-visual change" },
        ],
        correctBucket,
        hint: "Visual = the receiver looks back (safer, a little slower). Non-visual = eyes forward, works on a call (faster, needs practice).",
        explanation: chosen.map((f) => `"${f.text}" — ${f.id === "visual" ? "visual" : "non-visual"} change.`).join(" "),
      };
    }

    if (branch === "term-meaning-match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t) => (correctMap[t.id] = t.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about the hand action, whether the receiver looks back, who is passing and who is receiving, and where the pass happens.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "plait-order") {
      const shuffled = shuffle(rng, PLAIT_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (plaiting a 3-strand rope for the finishing tape)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PLAIT_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Prepare the strands first (collect, cut, soften, dye, dry), fix one end, then alternate right-over-middle and left-over-middle, and tie off.",
        explanation: "Correct order: " + PLAIT_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "relay-tf") {
      const chosen = shuffle(rng, RELAY_TF).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `r${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`r${i}`] = f.isTrue ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, TRUE_FALSE_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "A clean, practised change inside the zone, in-lane, with a steady hand keeps speed; dropping, drifting, stopping, or exchanging outside the zone loses the race.",
        explanation: chosen.map((f) => `"${f.text}" is ${f.isTrue ? "true" : "false"}.`).join(" "),
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
        hint: "Match the change to the situation, remember the hand positions, and think about why the exchange decides close relays.",
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
      hint: "Think about upsweep vs downsweep, visual vs non-visual change, the changeover zone, and preparing and plaiting rope strands.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
