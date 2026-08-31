import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

// Compose a larger prompt pool from a small set of openers x closers (per RIGOR-STANDARDS.md's
// "affordable way to reach 20+" technique) instead of hand-authoring every sentence separately.
function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "the events of the call of Moses in the correct order.",
    "these events from Exodus 3:1-10 into the order they happened.",
    "these moments from the burning bush story in order.",
    "these events the way they happened at Mount Horeb.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the burning bush or about God's instruction to Moses.",
    "these facts about the call of Moses under the correct bucket.",
    "each fact below by which part of the story it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the call of Moses with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the call of Moses.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Moses is tending his father-in-law Jethro's flock near Horeb, the mountain of God" },
  { id: "n2", label: "The angel of the Lord appears to Moses in flames of fire from within a bush" },
  { id: "n3", label: "Moses sees that the bush is on fire but is not burned up" },
  { id: "n4", label: "Moses decides to go over and look closely at this strange sight" },
  { id: "n5", label: "God calls out to Moses from within the bush, \"Moses! Moses!\", and Moses answers, \"Here I am\"" },
  { id: "n6", label: "God tells Moses to take off his sandals, for the ground he is standing on is holy" },
  { id: "n7", label: "God identifies himself as the God of Abraham, Isaac and Jacob, and Moses hides his face, afraid to look at God" },
  { id: "n8", label: "God says He has seen the misery of His people in Egypt and heard their cry" },
  { id: "n9", label: "God says He has come down to rescue His people and bring them to a good and spacious land" },
  { id: "n10", label: "God sends Moses to Pharaoh to bring the Israelites out of Egypt" },
];

interface EventFact { text: string; group: "encounter" | "mission" }
const EVENT_FACTS: EventFact[] = [
  { text: "Moses noticed a bush that was on fire but not being burned up", group: "encounter" },
  { text: "Moses went closer to look at this strange sight", group: "encounter" },
  { text: "God called out to Moses by name from within the bush", group: "encounter" },
  { text: "God told Moses to remove his sandals because the ground was holy", group: "encounter" },
  { text: "Moses hid his face because he was afraid to look at God", group: "encounter" },
  { text: "God identified himself as the God of Abraham, Isaac and Jacob", group: "encounter" },
  { text: "God said He had seen the misery of the Israelites in Egypt", group: "mission" },
  { text: "God said He had heard the cries of His people", group: "mission" },
  { text: "God said He had come down to rescue the Israelites", group: "mission" },
  { text: "God promised to bring the Israelites to a good and spacious land", group: "mission" },
  { text: "God sent Moses to Pharaoh to lead the Israelites out of Egypt", group: "mission" },
  { text: "God's compassion for His suffering people led directly to Moses's call", group: "mission" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Exodus 3:1-10", meaning: "The Bible passage recording the call of Moses at the burning bush" },
  { term: "Burning bush", meaning: "The bush that was on fire but not consumed, where God appeared to Moses" },
  { term: "Holy ground", meaning: "What God called the place where Moses was standing, requiring him to remove his sandals" },
  { term: "Horeb", meaning: "The mountain of God, near where Moses was tending Jethro's flock" },
  { term: "Jethro", meaning: "Moses's father-in-law, whose flock Moses was tending when he was called" },
  { term: "\"Here I am\"", meaning: "Moses's response when God called out his name from the bush" },
  { term: "\"I have seen the misery of my people\"", meaning: "God's statement showing His awareness of the Israelites' suffering in Egypt" },
  { term: "Rescue mission", meaning: "God's plan to bring the Israelites out of slavery in Egypt to a good land" },
  { term: "Obedience", meaning: "The value shown by Moses in ultimately accepting the task God gave him" },
  { term: "God of Abraham, Isaac and Jacob", meaning: "How God identified himself to Moses at the burning bush" },
  { term: "Pharaoh", meaning: "The ruler of Egypt that God sent Moses to confront to free the Israelites" },
  { term: "The Israelites", meaning: "God's people, whose suffering in Egypt God said He had seen and heard" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Kiplagat", "Nyokabi", "Otiende", "Wanjiru", "Barongo", "Chelangat", "Mutugi", "Achola", "Kiplimo", "Njeru", "Sila", "Wekesa"] as const;
const KENYAN_PLACES = ["Timboroa", "Suna", "Kapsowar", "Tharaka", "Kabras", "Ngong", "Muhoroni", "Marakwet", "Kilgoris", "Ndhiwa", "Sabatia", "Ortum"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} feels unworthy or unprepared when asked to lead a class project. What does Moses's call at the burning bush suggest about being called to an important task?`,
    correct: "God can call ordinary people, doing ordinary work like tending a flock, to important tasks — feeling unprepared does not disqualify someone",
    wrong: [
      "Only naturally confident people are ever chosen for important tasks",
      "Moses's story shows that people should always refuse difficult tasks",
      "God only calls people who already consider themselves great leaders",
    ],
    explanation: "Moses was called while doing the ordinary work of tending a flock, showing that God can call and use an ordinary, humble person for an important task.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why Moses removed his sandals before approaching the bush. What does this action teach about approaching something sacred?`,
      correct: "It shows reverence and respect for the holiness of the moment and the place, following God's own instruction",
      wrong: [
        "Removing sandals was simply a practical safety measure",
        "The detail is unimportant and adds nothing to the story",
        "It shows Moses was in a hurry and forgot to dress properly",
      ],
      explanation: "God explicitly told Moses to remove his sandals because the ground was holy — an act of reverence and respect for a sacred encounter with God.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads that God said He had "seen the misery" and "heard the cry" of His people before calling Moses. What does this show about God's awareness of suffering?`,
    correct: "God is attentive to the suffering of His people, even before sending help, showing His concern is real and personal",
    wrong: [
      "God only became aware of the suffering once Moses reported it",
      "This detail shows God was indifferent to the Israelites' suffering",
      "God's awareness of suffering has no connection to why He called Moses",
    ],
    explanation: "God's statement that He had seen and heard His people's suffering shows His attentive concern, which directly motivated His plan to rescue them through Moses.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices that Moses hid his face out of fear when God spoke to him, yet still listened and eventually accepted the mission. What does this combination teach about courage?`,
      correct: "Courage does not mean feeling no fear at all — it can mean listening and responding faithfully even while afraid",
      wrong: [
        "Real courage means never feeling afraid in any situation",
        "Moses's fear proves he was unfit to be chosen for the mission",
        "Hiding his face shows Moses refused to listen to God at all",
      ],
      explanation: "Moses's fear and his willingness to listen and eventually respond both appear in the story — showing courage can coexist with genuine fear.",
    };
  },
  (rng) => ({
    prompt: `A church youth leader in ${place(rng)} named ${name(rng)} explains that Moses's call shows how believers today can obey God's instructions. Which modern example best reflects this lesson?`,
    correct: "A young Christian responding faithfully to a difficult task or responsibility they feel called to do, even if it seems overwhelming",
    wrong: [
      "Only someone standing near a literal burning bush can be truly called by God",
      "The lesson teaches that obedience to God is impossible for anyone today",
      "This lesson has no modern application at all",
    ],
    explanation: "The lesson's outcome is explaining ways Christian leaders and believers obey God's instructions today — responding faithfully to a difficult calling reflects Moses's example.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says the burning bush not being consumed by fire was simply a natural coincidence in dry desert conditions. Does the story support this explanation?`,
      correct: "No — the story presents the unusual bush as a specific, deliberate sign used by God to get Moses's attention for an important calling",
      wrong: [
        "Yes — the story explicitly explains it as an ordinary desert phenomenon",
        "Yes — Moses himself doubted anything unusual was happening",
        "No — but the sign had no connection to Moses's calling at all",
      ],
      explanation: "The story presents the unconsumed burning bush as a deliberate, attention-getting sign from God, not a natural coincidence, leading directly into Moses's call.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wonders why God specifically identified himself as "the God of Abraham, Isaac and Jacob" rather than using a new, unfamiliar name. What did this identification do?`,
    correct: "It connected God's call to Moses with God's earlier promises to Israel's ancestors, showing continuity in His faithfulness",
    wrong: [
      "It confused Moses, since he had never heard those names before",
      "It showed God was a completely different god from the one his ancestors worshipped",
      "The identification had no particular purpose in the passage",
    ],
    explanation: "By identifying himself through Abraham, Isaac and Jacob, God connected His call to Moses with His long-standing promises and faithfulness to Israel's ancestors.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says that once God called Moses at the burning bush, Moses immediately felt fully ready and confident for the mission. Does the passage suggest this was the case?`,
    correct: "No — Moses's fear and hesitation, shown by hiding his face, suggest the mission still required trust in God rather than personal confidence alone",
    wrong: [
      "Yes — Moses felt completely confident from the very first moment",
      "Yes — Moses required no encouragement or reassurance from God at all",
      "No — but Moses's fear meant he ultimately refused the mission entirely",
    ],
    explanation: "Moses's fear at the burning bush shows the mission required ongoing trust in God, not instant personal confidence, even as he eventually accepted the call.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to participate in church activities but feels it is unimportant compared to schoolwork. How does Moses's story of being called while doing ordinary work respond to this attitude?`,
      correct: "Moses was called by God while doing an ordinary task, showing that everyday responsibilities and readiness to respond to God can go together",
      wrong: [
        "The story teaches that only religious activities, never ordinary work, matter to God",
        "Moses's story has nothing to do with balancing responsibilities",
        "Being called by God always requires abandoning all other daily tasks first",
      ],
      explanation: "Moses was tending Jethro's flock — an ordinary responsibility — when God called him, showing everyday faithfulness and readiness to respond to God can coexist.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices that God's plan involved rescuing an entire nation, but began with calling just one person, Moses. What does this detail suggest about how God can work?`,
    correct: "God can bring about a large, important change in many people's lives by first calling and working through just one faithful person",
    wrong: [
      "God's plans always require calling large groups of people simultaneously",
      "The detail shows that one person's obedience makes no real difference",
      "Moses's individual call had no real connection to the wider rescue of Israel",
    ],
    explanation: "God's rescue plan for the whole nation of Israel began with the call of one person, Moses — showing how one person's obedience can be part of a much larger purpose.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} asks what practical instruction God gave Moses immediately after identifying himself and before explaining the rescue plan. What was it?`,
      correct: "To take off his sandals, because the ground he was standing on was holy",
      wrong: [
        "To immediately travel straight to Pharaoh without any explanation",
        "To gather the Israelite elders before hearing anything further",
        "To build an altar on the spot before continuing the conversation",
      ],
      explanation: "God's first instruction to Moses was practical and immediate — remove his sandals because the ground was holy — before explaining the larger rescue mission.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} concludes that the call of Moses is only a story about a special historical leader with no personal lesson for today's learners. What does this lesson actually intend to teach?`,
    correct: "It intends to teach learners about obeying God's instructions and depending on God, applicable to any believer's life, not only historical leaders",
    wrong: [
      "It intends to teach only the geography of Mount Horeb",
      "It intends to teach that God no longer calls anyone to any task today",
      "It has no intended lesson beyond retelling ancient history",
    ],
    explanation: "The lesson's outcomes focus on learners desiring to obey God in day-to-day life and understanding how believers obey God's instructions today — a personal, present-day application.",
  }),
];

export const theCallOfMoses: Skill = {
  id: "g5-cre-bi-call-of-moses",
  code: "BI.8",
  subjectId: "cre",
  strandId: "g5-cre-bible",
  grade: 5,
  title: "The Call of Moses",
  description: "God's call to Moses at the burning bush on Mount Horeb (Exodus 3:1-10), God's compassion for the suffering Israelites, and Moses's obedience in accepting the mission to lead God's people out of Egypt.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, NARRATIVE_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: NARRATIVE_SEQUENCE.map((n) => n.id),
        hint: "Start with Moses tending the flock, and end with God sending him to Pharaoh.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const encounter = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "encounter")).slice(0, 4);
      const mission = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "mission")).slice(0, 4);
      const chosen = shuffle(rng, [...encounter, ...mission]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "encounter", label: "The encounter at the burning bush" },
          { id: "mission", label: "God's mission for Moses" },
        ],
        correctBucket,
        hint: "The encounter bucket is about the bush and Moses's reaction; the mission bucket is about God's plan to rescue Israel.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "encounter" ? "the encounter at the burning bush" : "God's mission for Moses"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about how God appeared to Moses, and what mission He gave him.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about how Moses responded to God's call at the burning bush.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Moses was tending the flock of his father-in-law", after: "near Horeb.", answer: "Jethro", accepted: ["jethro"] },
      { before: "The angel of the Lord appeared to Moses in flames of fire from within a", after: ".", answer: "bush", accepted: ["bush"] },
      { before: "The bush was on fire but was not being", after: ".", answer: "burned", accepted: ["burned", "consumed"] },
      { before: "God told Moses to take off his", after: " because the ground was holy.", answer: "sandals", accepted: ["sandals"] },
      { before: "God identified himself as the God of Abraham, Isaac and", after: ".", answer: "Jacob", accepted: ["jacob"] },
      { before: "Moses hid his face because he was afraid to look at", after: ".", answer: "God", accepted: ["god"] },
      { before: "God said He had seen the misery of His people in", after: ".", answer: "Egypt", accepted: ["egypt"] },
      { before: "God said He had come down to rescue His people and bring them to a good and spacious", after: ".", answer: "land", accepted: ["land"] },
      { before: "God sent Moses to", after: "to bring the Israelites out of Egypt.", answer: "Pharaoh", accepted: ["pharaoh"] },
      { before: "This story teaches learners to", after: "God in day-to-day life.", answer: "obey", accepted: ["obey"] },
      { before: "The call of Moses is recorded in Exodus", after: ":1-10.", answer: "3", accepted: ["3", "three"] },
      { before: "When God called his name, Moses answered, \"Here I", after: ".\"", answer: "am", accepted: ["am"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about Exodus 3:1-10 and God's call to Moses at the burning bush.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
