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

// KICD Grade 5 Creative Arts, Strand 2.0 Performing and Displaying, sub-strand 2.4
// "Puppetry" (8 lessons) — glove puppet.
//
// Mined verbatim: identify a glove puppet; make a glove puppet using recyclable materials
// (found objects), with emphasis on functionality and exaggeration; decorate the puppet to
// bring out features for aesthetics; perform a puppet show incorporating topical songs with
// proper voice projection and clarity in pronunciation of words (diction). Key inquiry: why
// are features of a puppet exaggerated? Core competency: Creativity and imagination. Link to
// other learning area: Science and Technology (recycling and upcycling found objects).
//
// Visual coverage: no puppet VisualSpec exists in the shared set; building one is out of
// scope for this pass. Recorded so the omission is deliberate.

const PUPPET_TYPES = [
  { id: "glove", label: "Glove puppet", desc: "worn over the hand like a glove, with the fingers moving the head and arms" },
  { id: "string", label: "String puppet (marionette)", desc: "moved from above by strings attached to a control bar" },
  { id: "rod", label: "Rod puppet", desc: "held up and moved by rods from below" },
  { id: "shadow", label: "Shadow puppet", desc: "a flat cut-out held against a lit screen so only its shadow is seen" },
  { id: "finger", label: "Finger puppet", desc: "a tiny puppet that fits over a single finger" },
] as const;

const TERMS = [
  { id: "exaggeration", label: "Exaggeration", meaning: "Making features such as eyes, nose and mouth much bigger and bolder than life so they can be seen clearly from a distance" },
  { id: "functionality", label: "Functionality", meaning: "The puppet actually works — it fits the hand and its head and arms move" },
  { id: "aesthetics", label: "Aesthetics", meaning: "How attractive and pleasing the finished puppet looks, through colour and decoration" },
  { id: "diction", label: "Diction", meaning: "Speaking or singing the words clearly so the audience can understand every one" },
  { id: "projection", label: "Voice projection", meaning: "Making the voice loud and clear enough to reach the whole audience" },
  { id: "topical-song", label: "Topical song", meaning: "A song about a current or important issue in society" },
] as const;

const MATERIAL_FACTS = [
  { text: "An old sock or a worn-out glove for the body", ok: true },
  { text: "Scraps of cloth and felt for clothing", ok: true },
  { text: "Bottle tops or buttons for big exaggerated eyes", ok: true },
  { text: "Wool or sisal for the hair", ok: true },
  { text: "Cardboard from a used box for a stiff mouth or ears", ok: true },
  { text: "Old newspaper for stuffing the head", ok: true },
  { text: "A live chicken to sit on the hand", ok: false },
  { text: "A bucket of wet paint tipped over the hand", ok: false },
  { text: "A football to balance on a finger", ok: false },
  { text: "A brand-new expensive toy bought from a shop", ok: false },
] as const;

const SHOW_TF = [
  { text: "The puppeteer projects their voice so the whole audience can hear the puppet", isTrue: true },
  { text: "Words are pronounced clearly (good diction) so the story is understood", isTrue: true },
  { text: "The songs in the show are topical — about real issues in society", isTrue: true },
  { text: "The puppet's features are exaggerated so the audience can read its face from far away", isTrue: true },
  { text: "The puppet is checked for functionality — that it fits the hand and moves — before the show", isTrue: true },
  { text: "The puppeteer mumbles quietly so the audience leans in to listen", isTrue: false },
  { text: "A glove puppet is worked by pulling strings from above", isTrue: false },
  { text: "Tiny, faint features are best because they look realistic up close", isTrue: false },
  { text: "It does not matter whether the puppet's mouth or arms actually move", isTrue: false },
  { text: "Decorating the puppet with colour and pattern improves its aesthetics", isTrue: true },
  { text: "Using found objects and recyclable materials to make the puppet reduces waste", isTrue: true },
  { text: "A glove puppet must be made only from new materials bought for the purpose", isTrue: false },
] as const;

const MAKE_STEPS = [
  { id: "g1", label: "Gather recyclable materials and found objects — an old sock or glove, cloth scraps, bottle tops, wool" },
  { id: "g2", label: "Fit the glove body to the hand so the fingers can reach the head and arm positions" },
  { id: "g3", label: "Make the head, stuff it, and attach it where the index finger will sit" },
  { id: "g4", label: "Attach the two arms where the thumb and little finger will go" },
  { id: "g5", label: "Decorate the puppet, exaggerating the eyes, nose, mouth and hair for aesthetics" },
  { id: "g6", label: "Put the puppet on and check its functionality — that it fits and the head and arms move" },
  { id: "g7", label: "Rehearse the puppet show, adding topical songs, with clear diction and voice projection" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} makes a glove puppet with a tiny, faint mouth and small pale eyes. During the show the audience at the back cannot tell what the puppet is feeling. What should ${who} have done?`,
      correct: "Exaggerated the features — made the eyes and mouth much bigger and bolder so they read from a distance",
      wrong: [
        "Made the puppet smaller so it looks further away",
        "Used strings to move the face instead of fingers",
        "Left the face blank, since expression does not matter in puppetry",
      ],
      explanation: "Puppet features are exaggerated so the audience — including those far back — can read the puppet's expression. Faint, life-sized features disappear at a distance.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked the key inquiry question: why are the features of a puppet exaggerated? Which answer is best?`,
    correct: "So the audience, even those far from the stage, can clearly see the puppet's face and expression",
    wrong: [
      "So the puppet uses up more decorating material",
      "So the puppet weighs more and stays on the hand",
      "So the puppet looks exactly like a real person",
    ],
    explanation: "Exaggeration makes a puppet's features large and bold enough to be seen and understood from a distance — the opposite of looking exactly lifelike.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s glove puppet in ${place(rng)} looks beautiful but the head is glued so stiffly that it will not turn and the arms cannot move. Which quality is missing?`,
      correct: "Functionality — the puppet must actually work: fit the hand and let the head and arms move",
      wrong: [
        "Aesthetics — but the puppet already looks beautiful",
        "Exaggeration — but that is about the size of the features",
        "Diction — but that is about how the puppeteer speaks",
      ],
      explanation: "Functionality means the puppet works as a puppet — it fits the hand and its head and arms move. A puppet can look good (aesthetics) and still fail on functionality.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} performs a puppet show but speaks so quietly and quickly that the audience misses the story. Which two performance skills need work?`,
    correct: "Voice projection (being loud and clear enough to reach everyone) and diction (pronouncing each word clearly)",
    wrong: [
      "Exaggeration and aesthetics",
      "Functionality and stuffing",
      "Formations and patterns",
    ],
    explanation: "A puppet show needs proper voice projection so all can hear, and clear diction so every word is understood. The other terms are about how the puppet is made or moved.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} makes a glove puppet from an old sock, bottle tops and wool scraps. Which subject does the design link this reuse of found objects to?`,
      correct: "Science and Technology — conserving the environment by recycling and upcycling found objects",
      wrong: [
        "Mathematics — because the sock is measured",
        "It links to no other subject",
        "CRE — because the puppet could tell a moral story",
      ],
      explanation: "The design links this sub-strand to Science and Technology: making puppets from recyclable materials and found objects conserves the environment through recycling and upcycling.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s class in ${place(rng)} is told the puppet show should include topical songs. What makes a song 'topical'?`,
    correct: "It is about a current or important issue in society, such as keeping the environment clean or staying in school",
    wrong: [
      "It is a very old traditional song with no clear meaning",
      "It is any song, as long as it has a fast beat",
      "It is a song sung only by the soloist, never the chorus",
    ],
    explanation: "A topical song addresses a real, present-day issue in society; puppet shows use them so the performance carries a useful message.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} identifies a puppet type: it is worn over the hand and the fingers move its head and arms. Which puppet is it?`,
      correct: "A glove puppet",
      wrong: ["A string puppet (marionette)", "A shadow puppet", "A rod puppet"],
      explanation: "A glove puppet is worn like a glove and worked by the fingers. A marionette hangs on strings, a shadow puppet is a flat cut-out behind a screen, and a rod puppet is moved by rods.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to add hair to a glove puppet and has scrap wool, an old mop head, and sisal. A classmate says only shop-bought doll hair will do. Who is right?`,
    correct: "The classmate is wrong — the sub-strand asks for recyclable materials and found objects, so scrap wool, mop strands or sisal are exactly right",
    wrong: [
      "The classmate is right — a puppet must use new, shop-bought parts to look good",
      "Neither — a glove puppet should have no hair at all",
      "The classmate is right — found objects are not allowed in Creative Arts",
    ],
    explanation: "This sub-strand specifically calls for recyclable materials and found objects. Scrap wool, an old mop head or sisal are all valid puppet hair.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} finishes decorating a puppet with bright colours and bold patterns. Which quality of the puppet does this decorating mainly improve?`,
      correct: "Aesthetics — how attractive and pleasing the puppet looks",
      wrong: [
        "Functionality — whether the puppet fits and moves",
        "Diction — how clearly the puppeteer speaks",
        "Projection — how loud the puppeteer's voice is",
      ],
      explanation: "Decorating the puppet with colour and pattern is about aesthetics — its visual appeal. Functionality, diction and projection are separate concerns.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} checks the puppet on the hand before the show and finds the index finger cannot reach the head. What must be fixed, and why now rather than later?`,
    correct: "The fit — the glove body must sit so the fingers reach the head and arms; fixing it after the show has started is too late",
    wrong: [
      "The colour — a dull puppet will not move well",
      "The songs — the wrong song stops the head turning",
      "Nothing — a puppet that does not fit still performs fine",
    ],
    explanation: "Functionality is checked before performing: if the fingers cannot reach the head and arms, the puppet cannot act, and it is much harder to fix mid-show.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  { before: "A puppet worn over the hand, with the fingers moving its head and arms, is called a ", after: " puppet.", correctAnswer: "glove" },
  { before: "Making a puppet's eyes, nose and mouth much bigger and bolder than life so they can be seen from far away is called ", after: ".", correctAnswer: "exaggeration" },
  { before: "The main reason a puppet's features are exaggerated is so the ", after: " can see its face clearly from a distance.", correctAnswer: "audience" },
  { before: "A puppet that fits the hand and whose head and arms actually move has good ", after: ".", correctAnswer: "functionality" },
  { before: "How attractive and pleasing a decorated puppet looks is called its ", after: ".", correctAnswer: "aesthetics" },
  { before: "Speaking every word clearly so the audience understands the story is called ", after: ".", correctAnswer: "diction" },
  { before: "Making the voice loud and clear enough to reach the whole audience is called voice ", after: ".", correctAnswer: "projection" },
  { before: "A song about a current or important issue in society is called a ", after: " song.", correctAnswer: "topical" },
  { before: "Discarded items such as an old sock, bottle tops and cloth scraps used to make a puppet are called ", after: " objects.", correctAnswer: "found" },
  { before: "Making puppets from recyclable materials conserves the environment through recycling and ", after: ".", correctAnswer: "upcycling" },
  { before: "A puppet moved from above by strings attached to a control bar is a ", after: " puppet, not a glove puppet.", correctAnswer: "string", acceptedAnswers: ["string", "marionette"] },
  { before: "Before performing, the puppeteer checks the puppet's ", after: " — that it fits the hand and moves properly.", correctAnswer: "functionality" },
] as const;

const IDENTIFY_PUPPET_PROMPTS = [
  ...IDENTIFY_PROMPTS,
  "Which type of puppet is described here?",
  "Name the puppet type described.",
  "Which of these puppets fits the description?",
] as const;

export const puppetry: Skill = {
  id: "g5-cas-puppetry",
  code: "P.4",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-performing-displaying",
  grade: 5,
  title: "Puppetry",
  description:
    "Identifying a glove puppet; making a glove puppet from recyclable materials and found objects with emphasis on functionality and exaggeration; decorating it for aesthetics; and performing a puppet show with topical songs, clear diction and voice projection.",
  generate(rng) {
    const branch = randChoice(rng, [
      "identify-puppet",
      "term-match",
      "material-sort",
      "make-order",
      "show-tf",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "identify-puppet") {
      const target = randChoice(rng, PUPPET_TYPES);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        PUPPET_TYPES.filter((p) => p.id !== target.id).map((p) => p.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `${pickPrompt(rng, IDENTIFY_PUPPET_PROMPTS)} It is ${target.desc}.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "This sub-strand is about the glove puppet — worn on the hand and worked by the fingers.",
        explanation: `This is a ${target.label.toLowerCase()} — ${target.desc}.`,
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
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Some terms are about making the puppet (exaggeration, functionality, aesthetics); some are about performing (diction, projection, topical song).",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "material-sort") {
      const chosen = shuffle(rng, MATERIAL_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `m${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`m${i}`] = f.ok ? "yes" : "no"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "yes", label: "Good for a recyclable glove puppet" },
          { id: "no", label: "Not suitable" },
        ],
        correctBucket,
        hint: "A glove puppet is made from found and recyclable materials — old socks, cloth, bottle tops, wool, cardboard — not live animals, wet paint, balls, or new shop toys.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.ok ? "suitable" : "not suitable"}.`).join(" "),
      };
    }

    if (branch === "make-order") {
      const shuffled = shuffle(rng, MAKE_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (making and preparing a glove puppet for a show)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: MAKE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Gather materials, fit the glove body, add the head then the arms, decorate with exaggerated features, check functionality, then rehearse.",
        explanation: "Correct order: " + MAKE_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "show-tf") {
      const chosen = shuffle(rng, SHOW_TF).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `s${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`s${i}`] = f.isTrue ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, TRUE_FALSE_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "A good puppet show has a working, exaggerated puppet made from found materials, projected voice, clear diction, and topical songs.",
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
        hint: "Think about why features are exaggerated, what functionality vs aesthetics means, and why diction and projection matter in a show.",
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
      hint: "Think about the glove puppet, exaggeration and functionality when making it, and diction, projection and topical songs when performing.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
