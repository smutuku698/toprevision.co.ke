import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames, cap } from "./sharedG10";

// KICD Grade 10 Music and Dance, Strand 3.0 Critical Appreciation, sub-strand 3.3 "Music and Dance
// in Socio-cultural Context" (curriculum-reference/grade-10/music-and-dance.json,
// strands[2].subStrands[2]). 5 named functions — religious, social, educational, economic,
// cultural (hard floor, all 5) — and 10 named "changing musical practices" dimensions — timing,
// language, costume and make-up, age of performers, audience, packaging of messages,
// collaborations, instrumentation, handling of props, dance movements (hard floor, all 10).
// This is the ONE sub-strand across the whole Grade 10 Music and Dance design naming "Critical
// thinking and Problem solving" as a Core Competency — per RIGOR-STANDARDS.md that mandates at
// least one Analyze-or-Evaluate-tier branch. Two are built here: "function-evaluate" (Evaluate —
// judging which named function a described scenario PRIMARILY serves, when more than one function
// is superficially plausible) and "change-analyze" (Analyze — extracting which named "changing
// practice" dimension a described change-over-time scenario illustrates). The source's
// learningExperiences for this sub-strand are genuinely thin (2 discussion-based bullets, recorded
// verbatim in the JSON) — that is a real, source-confirmed limitation, not a mining gap — so branch
// variety here is built from the SLOs' analytical verbs and the two enumerated content pools
// (functions, changing-practice dimensions) rather than from richer learning-experience bullets the
// source simply does not provide.
// No dedicated VisualSpec exists for socio-cultural functions or changing performance practices, so
// no branch uses a visual — a deliberate, documented skip per the precedent in
// agricultureG6/rearingSmallDomesticAnimals.ts, not an oversight.

interface ScenarioFact {
  situation: string;
  correct: string;
  wrong: string[];
}

const FUNCTIONS = [
  { id: "religious", label: "Religious", definition: "Music and dance used in worship, prayer, or to mark religious and spiritual rites and ceremonies" },
  { id: "social", label: "Social", definition: "Music and dance used to bring people together, mark social occasions, and strengthen relationships within a community" },
  { id: "educational", label: "Educational", definition: "Music and dance used to teach values, history, skills or knowledge to listeners, especially the young" },
  { id: "economic", label: "Economic", definition: "Music and dance used as a source of income or livelihood for performers and those involved in producing it" },
  { id: "cultural", label: "Cultural", definition: "Music and dance used to express, preserve and pass on a community's identity, customs and heritage" },
] as const;

const FUNCTION_MATCH_PROMPTS = [
  "Match each function of Music and Dance to its definition.",
  "Pair each function with the description that explains it.",
  "Connect each function to its correct meaning.",
  "Match each function below to the explanation that fits it.",
  "Link each function to the description that describes it.",
  "Match each function to the statement that defines it.",
  "Work out which definition belongs to which function, then match them up.",
  "Pair each function with its correct meaning.",
  "For each function below, find the definition that explains it.",
  "Match each function to the explanation of what it involves.",
  "Which definition goes with which function? Match them correctly.",
  "Line up each function with what it actually means.",
  "Connect each named function to its correct definition.",
  "Match these functions to their definitions below.",
  "Figure out what each function means, then match it to its definition.",
  "Pair up every function with the statement that correctly describes it.",
  "Match each item on the left to the function it describes on the right.",
  "Sort out which definition belongs to which function, by matching them.",
  "Correctly match every function to the definition that fits it.",
  "Match each function of Music and Dance to what it accomplishes in society.",
];

// ---- Illustrative function scenarios: 15 facts (3 per function) feeding a categorize branch that
// samples a strictly-smaller subset per draw. ----
const FUNCTION_FACTS: { text: string; fn: string }[] = [
  { text: "A choir sings hymns during a church service to lead the congregation in worship", fn: "religious" },
  { text: "Drummers perform a rhythm believed to accompany prayers during a traditional rite-of-passage ceremony", fn: "religious" },
  { text: "A community gathers to sing sacred songs marking a religious festival", fn: "religious" },
  { text: "Guests dance together at a wedding reception to celebrate the couple and enjoy each other's company", fn: "social" },
  { text: "Neighbours gather for an evening of communal singing and dancing after the harvest is complete", fn: "social" },
  { text: "A birthday celebration includes music that brings extended family and friends together", fn: "social" },
  { text: "Elders teach the community's history to children through the words of a traditional song", fn: "educational" },
  { text: "A school uses a call-and-response song to help pupils memorise multiplication facts", fn: "educational" },
  { text: "A folk dance's movements are used to teach young performers about traditional farming tasks", fn: "educational" },
  { text: "A musician earns a living performing at weddings and corporate events across the county", fn: "economic" },
  { text: "A dance troupe charges an entrance fee for a themed performance to fund their group's activities", fn: "economic" },
  { text: "A recording artist earns royalties whenever their song is streamed online", fn: "economic" },
  { text: "A community performs a traditional dance at a national cultural festival to showcase their heritage", fn: "cultural" },
  { text: "A specific rhythm and costume style is preserved and passed down through generations as part of a community's identity", fn: "cultural" },
  { text: "A dance group performs traditional movements from their community during a heritage day celebration", fn: "cultural" },
];

const FUNCTION_CATEGORIZE_PROMPTS = [
  "Sort each scenario by the function of Music and Dance it illustrates.",
  "Classify each statement below by function: religious, social, educational, economic, or cultural.",
  "Decide which function each scenario fits, and sort it there.",
  "Sort each fact into the correct function of Music and Dance.",
  "Place each scenario into the bucket for the function it illustrates.",
  "Read each statement and sort it under the matching function.",
  "Work out which function each scenario is about, then sort it there.",
  "Group each scenario by the function it belongs to.",
  "Organize these scenarios into the correct function.",
  "Which function does each scenario illustrate? Sort it accordingly.",
  "Sort each statement below into religious, social, educational, economic, or cultural.",
  "Drop each scenario into the function it's really describing.",
  "Group each statement with the function it correctly illustrates.",
  "Decide where each scenario fits among the five functions.",
  "Sort these scenarios into their correct function groups.",
  "For each scenario, work out the function it illustrates and sort it in.",
  "Place these statements under the function each one matches.",
  "Sort each scenario correctly among the five functions.",
  "Read each statement and file it under the right function.",
  "Assign each scenario to the function it best illustrates.",
];

// ---- Changing musical practices: the 10 named dimensions (hard floor, all 10). ----
const PRACTICES = [
  { id: "timing", label: "Timing", example: "A ceremony traditionally held only at dawn is now performed in the evening to fit modern schedules" },
  { id: "language", label: "Language", example: "Lyrics once sung only in the community's mother tongue are now blended with Swahili or English" },
  { id: "costume-makeup", label: "Costume and make-up", example: "Traditional beadwork and body paint are now combined with modern stage costumes" },
  { id: "age-of-performers", label: "Age of performers", example: "A dance once performed only by elders is now taught to and performed by youth groups" },
  { id: "audience", label: "Audience", example: "A performance once meant only for community members is now staged for tourists and online viewers" },
  { id: "packaging-of-messages", label: "Packaging of messages", example: "A song's message once spread only by live performance is now shared as a recorded video online" },
  { id: "collaborations", label: "Collaborations", example: "A traditional troupe now collaborates with a modern hip-hop dance crew for a joint performance" },
  { id: "instrumentation", label: "Instrumentation", example: "A performance once accompanied only by traditional drums now adds an electric guitar or keyboard" },
  { id: "handling-of-props", label: "Handling of props", example: "Props once carved from natural materials are now sometimes replaced with manufactured or synthetic versions" },
  { id: "dance-movements", label: "Dance movements", example: "Traditional footwork is now blended with contemporary dance styles seen in music videos" },
] as const;

const PRACTICE_MATCH_PROMPTS = [
  "Match each changing practice to an example of it.",
  "Pair each changing practice with the example that illustrates it.",
  "Connect each changing practice to its example below.",
  "Match each practice below to the example that fits it.",
  "Link each changing practice to the description that illustrates it.",
  "Match each practice to the statement that shows it changing.",
  "Work out which example belongs to which practice, then match them up.",
  "Pair each changing practice with an illustration of it.",
  "For each practice below, find the example that fits it.",
  "Match each practice to an example of how it has changed.",
  "Which example goes with which changing practice? Match them correctly.",
  "Line up each changing practice with an example of it.",
  "Connect each named practice to its correct example.",
  "Match these changing practices to their examples below.",
  "Figure out which example fits each practice, then match it up.",
  "Pair up every changing practice with an example that fits it.",
  "Match each item on the left to the changing practice it illustrates on the right.",
  "Sort out which example belongs to which changing practice, by matching them.",
  "Correctly match every changing practice to an example that fits it.",
  "Match each changing practice to what has actually shifted over time.",
];

// ---- Analyze-tier: reading a described change-over-time scenario and identifying which named
// changing-practice dimension it illustrates. 10 curated facts x 20 frames (5 openers x 4 closers)
// = 200 templates. ----
const CHANGE_FACTS: ScenarioFact[] = [
  {
    situation: "a traditional rite-of-passage ceremony that was once always performed at dawn is now commonly held in the evening, after work and school hours, to accommodate participants' modern schedules",
    correct: "Timing — when the performance takes place has changed",
    wrong: ["Audience — who the performance is meant for", "Packaging of messages — how the performance's message is shared", "Age of performers — who is old enough to perform"],
  },
  {
    situation: "a community's traditional song, once sung entirely in the local mother tongue, now blends in Swahili and English phrases to reach a wider audience",
    correct: "Language — the words used in performance have changed",
    wrong: ["Packaging of messages — how the message is shared or distributed", "Audience — who is watching or listening", "Collaborations — who is performing together"],
  },
  {
    situation: "performers who once wore only traditional beadwork and natural body paint now combine these with sequinned modern stage costumes",
    correct: "Costume and make-up — what performers wear and how they are adorned has changed",
    wrong: ["Handling of props — how objects used in the performance are managed", "Dance movements — how performers move their bodies", "Instrumentation — which instruments are used"],
  },
  {
    situation: "a dance traditionally performed only by respected elders in the community is now being taught to, and performed by, groups of young people",
    correct: "Age of performers — who is old enough, or expected, to perform has changed",
    wrong: ["Audience — who the performance is aimed at", "Collaborations — who performs together", "Timing — when the performance happens"],
  },
  {
    situation: "a ceremony once meant only for community members is now staged for paying tourists and shared with viewers online",
    correct: "Audience — who the performance is meant to reach has changed",
    wrong: ["Packaging of messages — how the performance is recorded or shared", "Collaborations — who performs together", "Instrumentation — which instruments accompany it"],
  },
  {
    situation: "a folk song's message, once shared only through live performance, is now recorded, edited and shared as a video on social media",
    correct: "Packaging of messages — how the performance's message is produced and shared has changed",
    wrong: ["Language — the words used in the song", "Audience — who is watching or listening", "Timing — when the performance takes place"],
  },
  {
    situation: "a traditional dance troupe that once performed alone now regularly partners with a modern hip-hop dance crew for joint shows",
    correct: "Collaborations — who performs together has changed",
    wrong: ["Age of performers — how old the performers are", "Audience — who the performance reaches", "Dance movements — how performers move"],
  },
  {
    situation: "a performance once accompanied only by traditional drums and a lyre now also features an electric guitar and keyboard",
    correct: "Instrumentation — which instruments accompany the performance has changed",
    wrong: ["Costume and make-up — what performers wear", "Handling of props — how objects are used in performance", "Timing — when the performance happens"],
  },
  {
    situation: "props once hand-carved from natural materials for a performance are now sometimes replaced with manufactured plastic versions handled differently on stage",
    correct: "Handling of props — how objects used in the performance are made and managed has changed",
    wrong: ["Costume and make-up — what performers wear", "Instrumentation — which instruments are used", "Dance movements — how performers move"],
  },
  {
    situation: "traditional footwork passed down for generations is now blended with contemporary dance moves borrowed from popular music videos",
    correct: "Dance movements — how performers move their bodies has changed",
    wrong: ["Costume and make-up — what performers wear", "Handling of props — how objects are used", "Collaborations — who performs together"],
  },
];

const CHANGE_OPENERS: ((rng: RNG, fact: ScenarioFact) => string)[] = [
  (rng, fact) => `A researcher examining changing music and dance practices near ${place(rng)} observes that ${fact.situation}`,
  (rng, fact) => `${name(rng)} is studying how a local performance tradition has changed and notices that ${fact.situation}`,
  (rng, fact) => `Over the years, near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `${name(rng)} points out that in their community, ${fact.situation}`,
];

const CHANGE_CLOSERS = [
  "Which changing practice does this best illustrate?",
  "Which of the named changing practices is this an example of?",
  "Which aspect of the performance has changed here?",
  "Which changing practice is being described?",
];

const CHANGE_FRAMES = combineFrames(CHANGE_OPENERS, CHANGE_CLOSERS);
const CHANGE_TEMPLATES = expandScenarios(CHANGE_FACTS, CHANGE_FRAMES);

// ---- Evaluate-tier (the branch this sub-strand's Core Competency requires): given a scenario
// where more than one function is superficially plausible, judge which function it PRIMARILY
// serves, based on the details actually stated. 8 curated facts x 20 frames (5 openers x 4
// closers) = 160 templates. ----
const FUNCTION_EVALUATE_FACTS: ScenarioFact[] = [
  {
    situation: "a well-known Kenyan musician is booked to perform at three weddings this month, and negotiates a performance fee for each show",
    correct: "Economic — the primary purpose described is that the musician earns a livelihood from performing",
    wrong: ["Social — weddings are usually social gatherings, but that is not what this scenario is emphasising", "Cultural — Kenyan music can carry cultural identity, but that is not the point being described here", "Religious — weddings can carry religious elements, but none are mentioned here"],
  },
  {
    situation: "a community group is invited to perform a set of traditional dances at the county's annual heritage festival, specifically to showcase and preserve their community's identity for the audience",
    correct: "Cultural — the stated purpose is preserving and showcasing community identity and heritage",
    wrong: ["Social — festivals do bring people together, but that is not the reason given for this performance", "Economic — no mention of payment or livelihood is made in this scenario", "Educational — no teaching of specific skills or history is described here"],
  },
  {
    situation: "elders lead the children of the village in a song whose verses recount, step by step, the community's oral history so the children can learn and remember it",
    correct: "Educational — the described purpose is explicitly teaching history and knowledge to the young",
    wrong: ["Cultural — heritage is involved, but the scenario specifically emphasises teaching and remembering, not general identity display", "Social — the elders and children gathering is present, but the described purpose is teaching, not simply bringing people together", "Religious — no worship or spiritual rite is mentioned"],
  },
  {
    situation: "a congregation sings a set of songs together during a Sunday church service, as part of the order of worship",
    correct: "Religious — the songs are explicitly part of a worship service",
    wrong: ["Social — church does bring people together, but the scenario specifically frames this as part of worship", "Cultural — no community heritage or identity purpose is described here", "Educational — no teaching purpose is described here"],
  },
  {
    situation: "friends and family gather to sing and dance together at a birthday party purely to enjoy each other's company and celebrate the occasion",
    correct: "Social — the described purpose is bringing people together to celebrate and enjoy each other's company",
    wrong: ["Cultural — no community heritage or identity purpose is described here", "Economic — no payment or livelihood is mentioned", "Educational — no teaching purpose is described here"],
  },
  {
    situation: "a dance troupe sells tickets to a themed show, using the proceeds to fund the group's costumes and equipment for the coming year",
    correct: "Economic — the described purpose is generating income to fund the group's activities",
    wrong: ["Social — an audience does gather, but the scenario specifically frames this around ticket sales and funding", "Cultural — no heritage-preservation purpose is described here", "Educational — no teaching purpose is described here"],
  },
  {
    situation: "a song is performed specifically to pass down a community's traditional beliefs and customs to the next generation, so their identity is not lost over time",
    correct: "Cultural — the explicit purpose is preserving and passing down community identity",
    wrong: ["Educational — teaching is involved, but the scenario specifically frames the purpose as preserving identity, not general knowledge", "Religious — no worship or spiritual rite is described here", "Social — no gathering-for-enjoyment purpose is described here"],
  },
  {
    situation: "a traditional rhythm is performed as an accompaniment to a rite-of-passage ceremony believed to invoke blessings from ancestors",
    correct: "Religious — the described purpose involves invoking blessings, a spiritual purpose",
    wrong: ["Cultural — heritage is involved, but the scenario specifically frames the purpose as spiritual, not general identity", "Social — a ceremony does gather people, but the described purpose is specifically spiritual", "Educational — no teaching purpose is described here"],
  },
];

const FUNCTION_EVAL_OPENERS: ((rng: RNG, fact: ScenarioFact) => string)[] = [
  (rng, fact) => `Consider this scenario from a community near ${place(rng)}: ${fact.situation}`,
  (rng, fact) => `${name(rng)} is evaluating a music and dance performance and considers that ${fact.situation}`,
  (rng, fact) => `In a village near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `A critic assessing the function of a performance near ${place(rng)} notes that ${fact.situation}`,
];

const FUNCTION_EVAL_CLOSERS = [
  "Which function of Music and Dance does this performance best serve?",
  "Which function is this performance primarily fulfilling?",
  "Judging from the details given, which function best fits this performance?",
  "Which named function does this scenario best illustrate?",
];

const FUNCTION_EVAL_FRAMES = combineFrames(FUNCTION_EVAL_OPENERS, FUNCTION_EVAL_CLOSERS);
const FUNCTION_EVAL_TEMPLATES = expandScenarios(FUNCTION_EVALUATE_FACTS, FUNCTION_EVAL_FRAMES);

// ---- Packaging-of-messages ordering — grounded directly in the named "packaging of messages"
// changing-practice dimension, sequenced by real media-technology history (live/local, then
// broadcast, then digital/global), not an invented curriculum fact. ----
const PACKAGING_STEPS = [
  { id: "word-of-mouth", label: "A performance shared only live, in person, spreading by word of mouth within the community" },
  { id: "radio", label: "A performance broadcast over local radio to reach a wider audience" },
  { id: "television", label: "A performance broadcast on television, adding visuals for the wider audience" },
  { id: "digital", label: "A performance shared instantly worldwide through social media and streaming platforms" },
];

const PACKAGING_PROMPTS = [
  "Arrange these ways of packaging and sharing a performance's message, oldest to newest.",
  "Put these ways of sharing a performance's message into the order they became available.",
  "Sequence these methods of sharing a performance's message, earliest to most recent.",
  "Arrange these methods into the order the technology for sharing a message actually developed.",
  "Order these ways of sharing a message the way media technology actually developed.",
  "Sort these methods into the order they became available for sharing a performance.",
  "Put these sharing methods in the order they came into common use.",
  "Work out the correct historical order of these ways of packaging a message.",
  "Arrange these methods into a logical order of media development.",
  "Which order did these ways of sharing a message appear in? Arrange them correctly.",
  "Build the correct historical sequence by ordering these sharing methods.",
  "Sequence these methods of packaging a message in the order they emerged.",
  "Order these sharing methods the way they developed over time.",
  "Arrange the methods below, earliest to newest.",
  "Put these ways of sharing a performance's message into the order they were first used.",
  "Sequence these methods to build the correct historical order.",
  "Work out the correct order for these sharing methods, earliest first.",
  "Arrange these methods as they historically became available.",
  "Order the methods below the way media history actually unfolded.",
  "Sequence these ways of packaging a message correctly, from earliest to latest.",
];

// ---- Fill-blank: 10 distinct function-identification templates. ----
const FILL_BLANK_TEMPLATES = [
  { before: "Music performed as part of a church service or spiritual rite is fulfilling the ", after: " function of Music and Dance.", correctAnswer: "religious", acceptedAnswers: ["religious"] },
  { before: "Music and dance performed at a wedding purely to bring family and friends together is fulfilling the ", after: " function.", correctAnswer: "social", acceptedAnswers: ["social"] },
  { before: "A song used to teach children a community's history or values is fulfilling the ", after: " function of Music and Dance.", correctAnswer: "educational", acceptedAnswers: ["educational"] },
  { before: "A musician who earns a living by performing at events is benefiting from the ", after: " function of Music and Dance.", correctAnswer: "economic", acceptedAnswers: ["economic"] },
  { before: "A traditional dance performed to preserve and showcase a community's identity is fulfilling the ", after: " function.", correctAnswer: "cultural", acceptedAnswers: ["cultural"] },
  { before: "Drumming performed to accompany a religious rite of passage is an example of the ", after: " function of Music and Dance.", correctAnswer: "religious", acceptedAnswers: ["religious"] },
  { before: "A dance troupe charging an entrance fee to fund its activities is an example of the ", after: " function.", correctAnswer: "economic", acceptedAnswers: ["economic"] },
  { before: "Elders passing down traditional customs through song to the next generation are fulfilling the ", after: " function.", correctAnswer: "cultural", acceptedAnswers: ["cultural"] },
  { before: "Neighbours singing and dancing together at a harvest celebration are fulfilling the ", after: " function of Music and Dance.", correctAnswer: "social", acceptedAnswers: ["social"] },
  { before: "A folk dance used to teach young performers a traditional farming task is fulfilling the ", after: " function.", correctAnswer: "educational", acceptedAnswers: ["educational"] },
] as const;

const FILL_BLANK_PROMPTS = [
  "Which function is being described?",
  "Identify the function of Music and Dance in this description.",
  "Which function fits this description?",
  "Work out the function being described here.",
  "Fill in the function this description matches.",
  "Name the function described here.",
  "This description matches which function?",
  "Complete the sentence with the correct function.",
  "Which function does this scenario illustrate?",
  "Determine the function described in this sentence.",
  "What function is this an example of?",
  "Read the description and name the function.",
  "This is an example of which function?",
  "Which of the five functions fits this description?",
  "Fill in the blank with the matching function.",
  "Work out and fill in the correct function.",
  "Which function does this description point to?",
  "Identify the function from what's described.",
  "Name the correct function for this description.",
  "Which function best matches what's described?",
];

export const musicDanceSocioCulturalContext: Skill = {
  id: "g10-mad-music-dance-socio-cultural-context",
  code: "3.3",
  subjectId: "music-and-dance",
  strandId: "g10-mad-appreciation",
  grade: 10,
  title: "Music and Dance in Socio-cultural Context",
  description: "Explaining and evaluating the functions of Music and Dance in society (religious, social, educational, economic, cultural), and examining the changing performance practices — timing, language, costume and make-up, age of performers, audience, packaging of messages, collaborations, instrumentation, handling of props, and dance movements.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["function-match", "function-categorize", "practice-match", "change-analyze", "function-evaluate", "packaging-order", "fill-blank"] as const
    );
    const generalHint = "Read for what the scenario actually states, not just the general topic — the specific details are what determine the answer.";

    if (branch === "function-match") {
      const tokens = shuffle(rng, FUNCTIONS.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FUNCTIONS.map((f) => ({ id: f.id, label: f.definition })));
      const correctMap: Record<string, string> = {};
      for (const f of FUNCTIONS) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, FUNCTION_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The five functions are religious, social, educational, economic and cultural — each serves a different purpose in society.",
        explanation: FUNCTIONS.map((f) => `${f.label}: ${f.definition}.`).join(" "),
      };
    }

    if (branch === "function-categorize") {
      const chosen = shuffle(rng, FUNCTION_FACTS).slice(0, 10);
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.fn));
      return {
        kind: "categorize",
        prompt: randChoice(rng, FUNCTION_CATEGORIZE_PROMPTS),
        items,
        buckets: FUNCTIONS.map((f) => ({ id: f.id, label: f.label })),
        correctBucket,
        hint: "Ask: is this mainly about worship, bringing people together, teaching, earning a living, or preserving identity?",
        explanation: chosen.map((c) => `"${c.text}" illustrates the ${FUNCTIONS.find((f) => f.id === c.fn)!.label.toLowerCase()} function.`).join(" "),
      };
    }

    if (branch === "practice-match") {
      const chosen = shuffle(rng, PRACTICES).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.example })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, PRACTICE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "A changing practice is something about HOW a performance is done that has shifted over time, not the underlying meaning of the performance itself.",
        explanation: chosen.map((p) => `${p.label}: ${p.example}.`).join(" "),
      };
    }

    if (branch === "change-analyze") {
      const q = randChoice(rng, CHANGE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: generalHint,
        explanation: q.explanation,
      };
    }

    if (branch === "function-evaluate") {
      const q = randChoice(rng, FUNCTION_EVAL_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "More than one function might seem to fit at first glance — judge which one the scenario is actually emphasising, not just which one is loosely connected.",
        explanation: q.explanation,
      };
    }

    if (branch === "packaging-order") {
      const shuffled = shuffle(rng, PACKAGING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, PACKAGING_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PACKAGING_STEPS.map((s) => s.id),
        hint: "Packaging of messages has changed over time as new media technology became available — live and local first, then broadcast, then digital and global.",
        explanation: PACKAGING_STEPS.map((s) => s.label).join(" → "),
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
      hint: generalHint,
      explanation: fb.before + fb.correctAnswer + fb.after,
    };
  },
};
