import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames } from "./sharedG10";

// KICD Grade 10 Music and Dance, sub-strand 1.7 "Dance Production". The design names 5 elements of
// dance (Body, Action, Space, Time, Energy — a hard content floor, per the JSON), functions of
// costumes/props/set design, multimedia, choice of music/lighting/sound effects, and a named,
// repeated PCI shared with sub-strand 2.5: a dance theme built around road safety / risk awareness
// on road use (risky behaviours: over-speeding, racing, running on the road, jay-walking, looting
// from crashed vehicles such as tankers/beverage transporters, or from crash victims). The
// scopeNotes flag this sub-strand's printed Core-Competencies block as a likely copy/paste
// artifact (it reads as 2.5's recording/digital-audio content) — no branch here is built off that
// block; only the road-safety PCI line, which the JSON confirms is genuinely specific to 1.7, is
// used for scenario content below.
//
// No VisualSpec represents dance elements, costumes, or set design, so this skill is entirely
// text/scenario based — a deliberate, documented skip, not an oversight.

interface Element {
  id: string;
  label: string;
  def: string;
}

const ELEMENTS: Element[] = [
  { id: "body", label: "Body", def: "The body is the instrument of dance — which body parts move, and how they are used, to create movement" },
  { id: "action", label: "Action", def: "Action is what the body does — travelling steps, jumps, turns, gestures, and stillness" },
  { id: "space", label: "Space", def: "Space is where the movement happens — level, direction, pathway, and how much space a dancer uses" },
  { id: "time", label: "Time", def: "Time is how movement relates to rhythm, tempo, and duration — fast, slow, sudden, or sustained" },
  { id: "energy", label: "Energy", def: "Energy is the quality or force of a movement — sharp, smooth, strong, or light" },
];

interface ElementScenario {
  desc: string;
  element: string;
}

const ELEMENT_SCENARIOS: ElementScenario[] = [
  { desc: "A choreographer instructs dancers to tell the whole story using only their arms and hands, keeping their legs and torso still", element: "body" },
  { desc: "A routine is built almost entirely from a sequence of jumps, turns, and travelling steps across the floor", element: "action" },
  { desc: "A soloist moves from a low crouch near the floor to a high reach overhead, while travelling in a wide circular pathway", element: "space" },
  { desc: "A group performs the same movement phrase twice — once at a fast, urgent tempo, then again slow and sustained", element: "time" },
  { desc: "A dancer contrasts a sharp, forceful punching gesture with a smooth, light, floating gesture in the very next phrase", element: "energy" },
];

function elementOf(id: string) {
  return ELEMENTS.find((e) => e.id === id)!;
}

type ProdCategory = "costumes" | "props" | "set-design" | "multimedia" | "music-lighting-sound";

const PROD_LABEL: Record<ProdCategory, string> = {
  costumes: "Costumes",
  props: "Props",
  "set-design": "Set design",
  multimedia: "Multimedia",
  "music-lighting-sound": "Music, lighting and sound",
};

interface ProdFact {
  text: string;
  category: ProdCategory;
}

const PRODUCTION_FACTS: ProdFact[] = [
  { text: "Communicates the dance's theme, culture, or character to the audience at a glance", category: "costumes" },
  { text: "Should allow the dancer freedom of movement while still fitting the theme", category: "costumes" },
  { text: "Can indicate a character's role, status, or identity within the dance story", category: "costumes" },
  { text: "Extends or supports the story or action being told through the dance", category: "props" },
  { text: "Can be improvised from locally available or recycled materials", category: "props" },
  { text: "Should be safe to handle and light enough not to hinder the choreography", category: "props" },
  { text: "Creates the physical environment or backdrop the dance takes place in", category: "set-design" },
  { text: "Helps establish the location or setting of the dance's story", category: "set-design" },
  { text: "Should not obstruct the dancers' movement or block the audience's view", category: "set-design" },
  { text: "Can add visual or recorded elements, such as video projection, that enhance the storytelling", category: "multimedia" },
  { text: "Should support, not distract from, the live dance performance", category: "multimedia" },
  { text: "Requires technical planning of equipment and timing ahead of the performance", category: "multimedia" },
  { text: "Music sets the tempo, mood, and rhythm the dancers move to", category: "music-lighting-sound" },
  { text: "Lighting can highlight a dancer, create atmosphere, or signal a scene change", category: "music-lighting-sound" },
  { text: "Sound effects can emphasize a dramatic moment or reinforce the dance's story", category: "music-lighting-sound" },
];

// The design's own Suggested Learning Experiences bullet order for 1.7, condensed into an
// ordering task (per SKILL-QUALITY-STANDARDS.md's sanctioned technique).
const PROCESS_STEPS = [
  { id: "watch", label: "Watch a variety of dances and discuss the elements of dance used" },
  { id: "source", label: "Source or use available materials to improvise props for the performance" },
  { id: "theme", label: "Choose a dance based on a theme of risk awareness and management on road use" },
  { id: "costume", label: "Design an appropriate costume for the dance" },
  { id: "watchdemo", label: "Watch demonstrations on the use of music, lighting, and sound effects" },
  { id: "apply", label: "Apply multimedia effects in a dance performance during a school event" },
];

interface RoadFact {
  situation: string;
  correct: string;
  wrong: string[];
}

const ROAD_SAFETY_FACTS: RoadFact[] = [
  {
    situation: "is choosing a dance theme to raise awareness about dangerous road behaviours in their community",
    correct: "Base the dance on real road-safety risks such as over-speeding, racing, jay-walking, or looting from crashed vehicles, since the named PCI calls for a theme built on risk awareness and management on road use",
    wrong: [
      "Choose any unrelated theme, since a dance's topic does not need to connect to the assigned PCI",
      "Base the dance only on traffic lights, leaving out the specific risky behaviours the PCI names",
      "Avoid road safety altogether, since it is too serious a topic to dance about",
    ],
  },
  {
    situation: "is choreographing a scene showing two drivers competing dangerously to reach a stage first",
    correct: "This choreography should depict racing as a risky road behaviour, showing its danger rather than glorifying it",
    wrong: [
      "This choreography should show racing as an exciting, admirable skill",
      "Racing is not one of the risky behaviours named in the road-safety PCI",
      "This scene has nothing to do with road safety",
    ],
  },
  {
    situation: "is depicting a character crossing a busy road away from the designated crossing point",
    correct: "This portrays jay-walking, a named risky road behaviour that a road-safety dance should highlight as dangerous",
    wrong: [
      "This portrays speeding, not jay-walking",
      "This portrays looting, since the character is near vehicles",
      "Crossing anywhere is not considered risky under this PCI",
    ],
  },
  {
    situation: "wants to include a scene where bystanders grab goods from an overturned beverage-transport truck after a crash",
    correct: "This depicts looting from a crashed vehicle, a specific risky behaviour the PCI names and asks learners to raise awareness against",
    wrong: [
      "This depicts over-speeding, since it involves a vehicle",
      "This scene should be left out because looting is not part of the road-safety PCI",
      "This depicts jay-walking, since bystanders are near the road",
    ],
  },
  {
    situation: "is choosing props for a scene where a driver ignores the speed limit on a highway",
    correct: "This depicts over-speeding, and the props and choreography should make the danger of ignoring speed limits clear to the audience",
    wrong: [
      "This depicts jay-walking, since it happens on the road",
      "Speed limits are not part of the named road-safety theme",
      "This scene should show speeding positively, to entertain the audience",
    ],
  },
  {
    situation: "must decide what to show for a group of children running alongside a busy road in the dance story",
    correct: "This depicts running on the road, one of the specific risky behaviours the PCI names — the choreography should show its danger",
    wrong: [
      "Running on the road is not one of the risky behaviours named in the PCI",
      "This should be shown as a fun, safe game with no danger implied",
      "This depicts jay-walking, not running on the road",
    ],
  },
  {
    situation: "designs a costume for a character representing a road-safety officer in the dance",
    correct: "The costume should clearly signal the officer's role, using distinctive colours or a uniform-like design the audience can immediately recognise",
    wrong: [
      "The costume does not need to relate to the character's role at all",
      "Any costume works as long as it looks colourful",
      "Only props, never costumes, should reflect a character's role",
    ],
  },
  {
    situation: "is planning lighting and sound effects for the climactic crash scene in the road-safety dance",
    correct: "Use dramatic lighting and sound effects, such as a sudden light change or a screeching sound, to emphasize the danger and impact of the crash moment",
    wrong: [
      "Lighting and sound effects should stay exactly the same throughout the whole dance",
      "Only music matters for a crash scene — lighting and sound effects are not relevant",
      "Bright, cheerful lighting best emphasizes danger in a crash scene",
    ],
  },
  {
    situation: "plans to perform the road-safety dance at a school assembly to warn students about looting from crash victims",
    correct: "This performance directly matches the named PCI's aim: using dance to raise awareness against looting from crashed vehicles and crash victims",
    wrong: [
      "Looting from crash victims has nothing to do with this PCI",
      "The PCI only covers speeding, not looting",
      "School assemblies are not a suitable place for a road-safety dance theme",
    ],
  },
  {
    situation: "is selecting set design elements to represent a highway scene for the road-safety dance",
    correct: "The set design should help establish the highway setting without obstructing the dancers' movement or blocking the audience's view",
    wrong: [
      "Set design should always be as elaborate and large as possible, regardless of the dancers' movement",
      "Set design is optional and never needed for a road-safety theme",
      "The set should replace the dancers as the main focus of the scene",
    ],
  },
];

// 5 openers x 4 closers = 20 distinct prompt skeletons from 9 authored pieces, per the
// combineFrames technique documented in sharedG10.ts.
const REASONING_OPENERS: ((rng: RNG, fact: RoadFact) => string)[] = [
  (rng, fact) => `${name(rng)}, choreographing a school dance near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `In a dance production club near ${place(rng)}, ${name(rng)} ${fact.situation}`,
  (rng, fact) => `${name(rng)} ${fact.situation}`,
  (rng, fact) => `While rehearsing for a school event in ${place(rng)}, ${name(rng)} ${fact.situation}`,
  (rng, fact) => `Preparing a road-safety themed dance, ${name(rng)} ${fact.situation}`,
];

const REASONING_CLOSERS = [
  "What is the correct approach?",
  "Which choice best fits the road-safety theme?",
  "What should this tell the choreographer?",
  "What is the right way to handle this?",
];

const REASONING_FRAMES = combineFrames(REASONING_OPENERS, REASONING_CLOSERS);
const REASONING_TEMPLATES = expandScenarios(ROAD_SAFETY_FACTS, REASONING_FRAMES);

const CLICK_MATCH_PROMPTS = [
  "Match each element of dance to its description.",
  "Pair each element with the description that fits it.",
  "Connect each element of dance to what it actually means.",
  "Line up each element with its correct description.",
  "Work out which description belongs to which element, then match them.",
  "Match each of the five elements of dance to its description below.",
  "Which description goes with which element? Match them correctly.",
  "Pair up every element with the statement that correctly describes it.",
  "Match each element on the left to its description on the right.",
  "Sort out which description belongs to which element, by matching them.",
  "Correctly match every element to the description that fits it.",
  "Match each element to what it controls in a dance performance.",
  "For each element below, find the description that explains it.",
  "Match each element of dance to what it means in practice.",
  "Figure out what each element describes, then match it to its name.",
  "Connect each element name to its correct description.",
  "Match each of the five elements to the description that fits.",
  "Pair each element with its correct explanation.",
  "Work out which element matches which description, then link them.",
  "Match every element below to the description that correctly explains it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each fact by the production area it describes.",
  "Group these facts under the correct dance-production area.",
  "Decide which production area each fact below belongs to, and sort it there.",
  "Sort each statement into the area it best fits.",
  "Place each fact into the bucket for the production area it is describing.",
  "Read each fact and sort it under the matching area.",
  "Work out which area each fact is about, then sort it there.",
  "Classify each fact by the dance-production area it belongs to.",
  "Organize these facts into the correct production area.",
  "Which area does each fact describe? Sort it accordingly.",
  "Sort each statement below into costumes, props, set design, multimedia, or music/lighting/sound.",
  "Drop each fact into the production area it's really about.",
  "Group each statement with the area it correctly belongs to.",
  "Decide where each fact fits among the five production areas.",
  "Sort these facts into their correct production-area groups.",
  "For each fact, work out the area it belongs to and sort it in.",
  "Place these statements under the production area each one matches.",
  "Sort each fact correctly among the five production areas.",
  "Read each statement and file it under the right production area.",
  "Assign each fact to the production area it best describes.",
];

const ORDERING_PROMPTS = [
  "Arrange the steps of putting together a dance production in the correct order.",
  "Put these dance-production steps into a sensible order.",
  "Sequence the process of preparing a themed dance correctly.",
  "Arrange these actions into the order a careful choreographer would follow them.",
  "Order these steps the way a group should carry them out while producing a dance.",
  "Sort these steps into the order they should happen when producing a dance.",
  "Put these production steps in the order a dance group would follow them.",
  "Work out the sensible order for these dance-production steps.",
  "Arrange these steps into a logical production process.",
  "Which order should these steps happen in? Arrange them correctly.",
  "Build a sensible production process by ordering these steps correctly.",
  "Sequence a choreographer's steps in the order they should be carried out.",
  "Order these actions the way they would happen in a well-run dance production.",
  "Arrange the steps of producing a themed dance, in the right order.",
  "Put these tasks into the order a careful group would complete them.",
  "Sequence these steps to build a dance production from start to finish.",
  "Work out the correct order for producing and performing a themed dance.",
  "Arrange these steps as a group would carry them out while preparing for a show.",
  "Order the tasks below the way a sensible production process would run.",
  "Sequence these production steps correctly, from first to last.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the fact about dance production.",
  "Fill in the missing term.",
  "Work out the missing word in this dance-production fact.",
  "Complete this statement about dance production.",
  "Fill in the blank to finish the fact.",
  "Which term completes this sentence correctly?",
  "Name the missing term in this fact about dance production.",
  "Complete the sentence with the correct production term.",
  "Work out and fill in the missing term below.",
  "Which word or phrase finishes this fact correctly?",
  "Fill in the term that correctly completes this statement.",
  "Complete this dance-production fact accurately.",
  "What term belongs in the blank below?",
  "Finish the sentence with the correct term.",
  "Fill in the correct element or production-area name.",
  "Complete the missing term in this dance-production fact.",
  "Which term fits correctly in the blank?",
  "Work out the correct word to complete this fact.",
  "Fill in the blank with the correct term.",
  "Complete this fact about dance production areas.",
];

const ELEMENT_IDENTIFY_PROMPTS = [
  "Which element of dance is this describing?",
  "Identify the element of dance described here:",
  "Name the element of dance being described:",
  "Work out which element of dance this is:",
  "Which of the five elements of dance fits this description?",
  "Identify this element from its description:",
  "What element of dance is being described below?",
  "Which element matches this?",
  "Name this element correctly:",
  "Work out the element from the description given:",
  "Identify the correct element of dance:",
  "Which element does this description match?",
  "From the description, name the element:",
  "What is this element called?",
  "Identify which of the five elements this is:",
  "Match this description to its correct element name:",
  "Which element of dance is this?",
  "Work out and name the element described:",
  "Name the element of dance that fits this description:",
  "Identify the element from the movement described:",
];

const ELEMENT_WRONG: Record<string, string[]> = {
  body: ["Action", "Space", "Energy"],
  action: ["Body", "Time", "Energy"],
  space: ["Body", "Action", "Time"],
  time: ["Space", "Energy", "Action"],
  energy: ["Time", "Body", "Space"],
};

export const danceProduction: Skill = {
  id: "g10-mad-dance-production",
  code: "1.7",
  subjectId: "music-and-dance",
  strandId: "g10-mad-foundations",
  grade: 10,
  title: "Dance Production",
  description: "The five elements of dance (Body, Action, Space, Time, Energy), the functions of costumes, props, set design and multimedia, choosing music/lighting/sound effects, and building a dance theme around road-safety risk awareness.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["element-match", "production-categorize", "process-order", "road-safety-reasoning", "element-identify", "fill-blank"] as const
    );
    const hint = "The five elements of dance are Body, Action, Space, Time and Energy — and this sub-strand's named dance theme is risk awareness on road use (speeding, racing, running on the road, jay-walking, and looting from crashed vehicles).";

    if (branch === "element-match") {
      const tokens = shuffle(rng, ELEMENTS.map((e) => ({ id: e.id, label: e.label })));
      const targets = shuffle(rng, ELEMENTS.map((e) => ({ id: e.id, label: e.def })));
      const correctMap: Record<string, string> = {};
      for (const e of ELEMENTS) correctMap[e.id] = e.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, CLICK_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: ELEMENTS.map((e) => `${e.label}: ${e.def}.`).join(" "),
      };
    }

    if (branch === "production-categorize") {
      const chosen = shuffle(rng, PRODUCTION_FACTS).slice(0, 10);
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (Object.keys(PROD_LABEL) as ProdCategory[]).map((c) => ({ id: c, label: PROD_LABEL[c] })),
        correctBucket,
        hint: "Costumes and props are handled by performers; set design and multimedia shape the environment; music/lighting/sound set the mood.",
        explanation: chosen.map((c) => `"${c.text}" is about ${PROD_LABEL[c.category].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "process-order") {
      const shuffled = shuffle(rng, PROCESS_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDERING_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PROCESS_STEPS.map((s) => s.id),
        hint: "Discuss elements first, then improvise props, choose the theme, design costumes, watch multimedia demos, and finally apply multimedia effects in performance.",
        explanation: PROCESS_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "road-safety-reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "The named risky road behaviours are over-speeding, racing, running on the road, jay-walking, and looting from crashed vehicles or crash victims.",
        explanation: q.explanation,
      };
    }

    if (branch === "element-identify") {
      const es = randChoice(rng, ELEMENT_SCENARIOS);
      const el = elementOf(es.element);
      const q = {
        prompt: `${randChoice(rng, ELEMENT_IDENTIFY_PROMPTS)} ${es.desc}.`,
        correct: el.label,
        wrong: ELEMENT_WRONG[es.element],
        explanation: `This is mainly about ${el.label} — ${el.def}.`,
      };
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint,
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.acceptedAnswers],
      inputMode: "text",
      hint,
      explanation: fb.explanation,
    };
  },
};

const FILL_BLANK_TEMPLATES = [
  {
    before: "The element of dance concerned with which body parts move and how they are used is called ",
    after: ".",
    correctAnswer: "body",
    acceptedAnswers: ["body"],
    explanation: "Body is the element of dance concerned with which body parts move and how they are used to create movement.",
  },
  {
    before: "The element of dance concerned with travelling steps, jumps, turns, gestures and stillness is called ",
    after: ".",
    correctAnswer: "action",
    acceptedAnswers: ["action"],
    explanation: "Action is the element of dance describing what the body actually does.",
  },
  {
    before: "The element of dance concerned with level, direction, pathway and how much room a dancer uses is called ",
    after: ".",
    correctAnswer: "space",
    acceptedAnswers: ["space"],
    explanation: "Space is the element of dance describing where the movement happens.",
  },
  {
    before: "The element of dance concerned with rhythm, tempo, and duration — fast, slow, sudden or sustained — is called ",
    after: ".",
    correctAnswer: "time",
    acceptedAnswers: ["time"],
    explanation: "Time is the element of dance describing how movement relates to rhythm and tempo.",
  },
  {
    before: "The element of dance concerned with the quality or force of a movement — sharp, smooth, strong, or light — is called ",
    after: ".",
    correctAnswer: "energy",
    acceptedAnswers: ["energy"],
    explanation: "Energy is the element of dance describing the quality or force of a movement.",
  },
  {
    before: "A part of a dance production that communicates the theme, culture, or character to the audience at a glance is the ",
    after: ".",
    correctAnswer: "costume",
    acceptedAnswers: ["costume", "costumes"],
    explanation: "Costumes communicate the theme, culture, or character of a dance to the audience at a glance.",
  },
  {
    before: "Items that extend or support the story of a dance and can be improvised from local or recycled materials are called ",
    after: ".",
    correctAnswer: "props",
    acceptedAnswers: ["props", "prop"],
    explanation: "Props extend or support a dance's story and can be improvised from locally available materials.",
  },
  {
    before: "The physical environment or backdrop that establishes the location of a dance's story is created through ",
    after: ".",
    correctAnswer: "set design",
    acceptedAnswers: ["set design", "set-design"],
    explanation: "Set design creates the physical environment or backdrop the dance takes place in.",
  },
  {
    before: "Visual or recorded elements, such as video projection, added to enhance a dance's storytelling are called ",
    after: ".",
    correctAnswer: "multimedia",
    acceptedAnswers: ["multimedia"],
    explanation: "Multimedia adds visual or recorded elements, like video projection, that enhance the dance's storytelling.",
  },
  {
    before: "A risky road behaviour where a driver ignores the speed limit is called ",
    after: ".",
    correctAnswer: "over-speeding",
    acceptedAnswers: ["over-speeding", "speeding", "over speeding"],
    explanation: "Over-speeding — ignoring the speed limit — is one of the named risky road behaviours in this sub-strand's dance theme.",
  },
  {
    before: "Grabbing goods from an overturned vehicle or a crash victim after a road accident is called ",
    after: ".",
    correctAnswer: "looting",
    acceptedAnswers: ["looting"],
    explanation: "Looting from crashed vehicles or crash victims is one of the named risky behaviours the road-safety dance theme raises awareness against.",
  },
  {
    before: "Crossing a road away from the designated crossing point is called ",
    after: ".",
    correctAnswer: "jay-walking",
    acceptedAnswers: ["jay-walking", "jaywalking", "jay walking"],
    explanation: "Jay-walking — crossing away from designated crossing points — is one of the named risky road behaviours in this sub-strand's dance theme.",
  },
] as const;
