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
    "the events of Noah and his sons in the correct order.",
    "these events from Genesis 9:18-23 into the order they happened.",
    "these moments from the story of Noah's sons in order.",
    "these events the way they happened in Noah's household.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it describes Ham's action or Shem and Japheth's action.",
    "these facts about Noah's sons under the correct bucket.",
    "each fact below by which son's response it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about Noah and his sons with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Noah and his sons.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Noah's three sons — Shem, Ham and Japheth — leave the ark with him after the flood" },
  { id: "n2", label: "Noah becomes a farmer and plants a vineyard" },
  { id: "n3", label: "Noah drinks wine and falls into a deep sleep, lying uncovered inside his tent" },
  { id: "n4", label: "Ham sees his father in this vulnerable state and goes outside to tell his two brothers instead of protecting his father's dignity" },
  { id: "n5", label: "Shem and Japheth take a garment, lay it across their shoulders, and walk in backward so as not to see their father's condition" },
  { id: "n6", label: "Shem and Japheth cover their father respectfully, keeping their faces turned away" },
  { id: "n7", label: "When Noah wakes and learns what Ham had done, he speaks a curse concerning Ham's son, Canaan" },
  { id: "n8", label: "Noah blesses Shem and Japheth for the honour and respect they showed him" },
];

interface EventFact { text: string; group: "disrespect" | "respect" }
const EVENT_FACTS: EventFact[] = [
  { text: "Ham saw his father in a vulnerable state inside the tent", group: "disrespect" },
  { text: "Ham went outside and told his two brothers about their father instead of quietly helping him", group: "disrespect" },
  { text: "Ham's response exposed his father rather than protecting his dignity", group: "disrespect" },
  { text: "Noah later spoke a curse concerning Ham's son, Canaan, because of Ham's disrespect", group: "disrespect" },
  { text: "Shem and Japheth took a garment to cover their father", group: "respect" },
  { text: "Shem and Japheth walked in backward so as not to see their father", group: "respect" },
  { text: "Shem and Japheth covered their father while keeping their faces turned away", group: "respect" },
  { text: "Shem and Japheth protected their father's dignity instead of exposing him", group: "respect" },
  { text: "Noah blessed Shem and Japheth for the honour they showed him", group: "respect" },
  { text: "Shem and Japheth's actions modeled how to treat an elder with care", group: "respect" },
  { text: "Respecting the elderly means protecting their dignity, not exposing their weaknesses", group: "respect" },
  { text: "Speaking carelessly about an elder's private struggles, like Ham did, is a form of disrespect", group: "disrespect" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Genesis 9:18-23", meaning: "The Bible passage recording the story of Noah and his three sons" },
  { term: "Shem", meaning: "One of the two sons who respectfully covered their father without looking" },
  { term: "Japheth", meaning: "The other son who, with Shem, walked in backward to cover their father" },
  { term: "Ham", meaning: "The son who saw his father's vulnerable state and told his brothers instead of protecting him" },
  { term: "Canaan", meaning: "Ham's son, who Noah's words concerned because of Ham's disrespectful action" },
  { term: "Dignity", meaning: "A person's sense of honour and respect, which Shem and Japheth protected for their father" },
  { term: "Respect for elders", meaning: "Treating older people, like parents and grandparents, with honour and care" },
  { term: "Walking in backward", meaning: "The careful action Shem and Japheth took so as not to see their father's condition" },
  { term: "Blessing", meaning: "What Noah gave to Shem and Japheth for how they honoured him" },
  { term: "Vineyard", meaning: "What Noah planted as a farmer after leaving the ark" },
  { term: "Honour", meaning: "The value Shem and Japheth showed their father by covering him with care" },
  { term: "Public places", meaning: "Locations, along with the home, where the lesson teaches respect for the elderly should be shown" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Wafula", "Achieng", "Otieno", "Nyambura", "Kiprotich", "Adhiambo", "Mutiso", "Chepkoech", "Onyango", "Njeri", "Barasa", "Muthoni"] as const;
const KENYAN_PLACES = ["Kitale", "Meru", "Nyamira", "Kilifi", "Kajiado", "Bomet", "Vihiga", "Kwale", "Kericho", "Homa Bay", "Kiambu", "Isiolo"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices an elderly grandparent struggling to remember something and is tempted to laugh and tell friends about it. What does the example of Shem and Japheth teach ${name(rng)} to do instead?`,
    correct: "Protect the elder's dignity quietly and respectfully, the way Shem and Japheth covered their father instead of exposing him",
    wrong: [
      "Share the story widely for entertainment, as Ham did",
      "Ignore the elder completely instead of helping at all",
      "Only help the elder if a reward is offered",
    ],
    explanation: "Shem and Japheth modeled protecting their father's dignity rather than exposing his weakness — a pattern for how to treat an elder's struggles with care.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sees a classmate mocking an elderly neighbour who tripped on the road. Based on this lesson, what should ${who} do?`,
      correct: "Help the elderly neighbour with respect and discourage the mocking, following the example of Shem and Japheth",
      wrong: [
        "Join in the mocking since the classmate started it first",
        "Walk away without helping or saying anything",
        "Record the moment to share with more people later",
      ],
      explanation: "The lesson teaches that respect for the elderly means protecting their dignity, not exposing or mocking their struggles — the opposite of Ham's careless response.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads that Shem and Japheth walked in backward and kept their faces turned away while covering their father. What does this careful action reveal about their attitude?`,
    correct: "They deliberately avoided adding to their father's shame, showing deep respect and care for his dignity",
    wrong: [
      "They were simply being careless and were not paying attention",
      "Walking backward was only a cultural habit unrelated to respect",
      "They were trying to avoid doing any work to help their father",
    ],
    explanation: "The deliberate care Shem and Japheth took — walking backward, faces turned away — shows their intentional respect for protecting their father's dignity.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why Noah blessed Shem and Japheth but not Ham. Based on the story, what is the reason?`,
      correct: "Shem and Japheth acted with honour and respect toward their father, while Ham's action exposed and disrespected him",
      wrong: [
        "Noah simply preferred Shem and Japheth for no particular reason",
        "The blessing had nothing to do with how each son behaved",
        "Ham was blessed the most for telling his brothers what he saw",
      ],
      explanation: "Noah's blessing followed directly from each son's behaviour — honouring the sons who protected his dignity, and addressing the son whose response had not.",
    };
  },
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, guided by ${name(rng)}, is asked to list ways to show respect to elderly relatives at a family gathering. Which idea best reflects this lesson?`,
    correct: "Listening patiently, helping without being asked, and never mocking or exposing an elder's mistakes to others",
    wrong: [
      "Only greeting elders if they greet you first",
      "Pointing out an elder's mistakes loudly so others can laugh too",
      "Avoiding elderly relatives altogether to prevent awkward moments",
    ],
    explanation: "The lesson's outcome is explaining and practising ways of showing respect to the elderly — patience, quiet help, and protecting dignity all reflect Shem and Japheth's example.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes respecting the elderly only matters at home, not in public places like a market or bus stop. How does this lesson's teaching challenge that idea?`,
      correct: "Respect for the elderly should be shown everywhere, including in public places, not only inside the home",
      wrong: [
        "The idea is correct — public respect for elders is not expected",
        "This lesson only discusses respect shown inside Noah's tent",
        "Respect for elders is only required during religious ceremonies",
      ],
      explanation: "The lesson explicitly calls for role-playing how to show respect to the elderly at home and in public places, showing the value applies broadly, not just at home.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says that Ham's mistake was simply being curious about what happened to his father. Is curiosity the real issue the story highlights?`,
    correct: "No — the real issue was how Ham responded afterward, by telling his brothers instead of protecting his father's dignity",
    wrong: [
      "Yes — the story teaches that curiosity itself is always sinful",
      "Yes — Ham should have been punished only for entering the tent",
      "No — the story has nothing to do with how anyone responded",
    ],
    explanation: "The story's focus is on Ham's response — spreading word of his father's condition rather than quietly protecting him — not on curiosity itself.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wonders why this story from Genesis, about an ancient farming family, is still relevant to how young people treat elders today. What is the lasting lesson?`,
    correct: "The underlying value — protecting an elder's dignity instead of exposing their weaknesses — remains a timeless standard for respect",
    wrong: [
      "The story is only about farming and vineyards, with no lasting lesson",
      "The story is relevant only to families that grow grapes",
      "The lesson only applied to people living immediately after the flood",
    ],
    explanation: "While the setting is ancient, the underlying principle — showing honour and protecting an elder's dignity — is the lasting, still-relevant lesson.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s grandmother in ${place(rng)} makes a small mistake while cooking, and a younger cousin starts teasing her about it. What would Shem and Japheth's example suggest ${who} should do?`,
      correct: "Gently stop the teasing and help the grandmother, showing the same respect Shem and Japheth showed their father",
      wrong: [
        "Join the teasing since it seems like harmless fun",
        "Say nothing and let the teasing continue",
        "Tell more relatives about the mistake for a laugh",
      ],
      explanation: "Shem and Japheth's example teaches responding to an elder's mistake with quiet respect and protection, not teasing or spreading the story further.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} thinks that showing respect to the elderly only means saying polite greetings. Based on this lesson, is that the full picture?`,
    correct: "No — respect also includes protecting an elder's dignity in difficult moments, as Shem and Japheth's actions show",
    wrong: [
      "Yes — polite greetings are the only requirement this lesson teaches",
      "No — but only physical help counts, never emotional care",
      "Yes — the story of Noah's sons has nothing to add to simple greetings",
    ],
    explanation: "This lesson's outcome about explaining ways of showing respect goes beyond greetings — it includes protecting an elder's dignity in a hard moment, as Shem and Japheth did.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is deciding whether to tell classmates about an embarrassing moment an elderly teacher had, or to keep it private out of respect. What does this lesson recommend?`,
      correct: "Keep it private and show respect, following Shem and Japheth's example rather than Ham's",
      wrong: [
        "Share it, since embarrassing stories about teachers are harmless",
        "This lesson gives no guidance on how to treat a teacher's dignity",
        "Only share it with a few close friends instead of the whole class",
      ],
      explanation: "The lesson's example teaches protecting an elder's dignity by keeping such moments private, not exposing them for others to hear about.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} asks whether Noah's blessing on Shem and Japheth means only they, and no one else, can show respect to elders today. What is the correct understanding?`,
    correct: "No — their example is a model every learner can follow when treating any elder with honour and care",
    wrong: [
      "Yes — only descendants of Shem and Japheth are able to show this kind of respect",
      "Yes — the blessing was a one-time reward with no lesson for others",
      "No — but only adults, never children, can practise this kind of respect",
    ],
    explanation: "Shem and Japheth's respectful response is meant as a model for anyone, at any age, to follow when showing honour to an elder.",
  }),
];

export const noahAndHisSons: Skill = {
  id: "g5-cre-bi-noah-and-his-sons",
  code: "BI.4",
  subjectId: "cre",
  strandId: "g5-cre-bible",
  grade: 5,
  title: "Noah and his Sons",
  description: "The story of Noah and his sons (Genesis 9:18-23) — how Shem and Japheth respectfully protected their father's dignity while Ham did not — and lessons on respecting the elderly at home, church and in the community.",
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
        hint: "Start with Noah's sons leaving the ark, and end with Noah's blessing on Shem and Japheth.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const disrespect = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "disrespect")).slice(0, 4);
      const respect = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "respect")).slice(0, 4);
      const chosen = shuffle(rng, [...disrespect, ...respect]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "disrespect", label: "Ham's disrespectful response" },
          { id: "respect", label: "Shem and Japheth's respectful response" },
        ],
        correctBucket,
        hint: "The disrespect bucket exposed their father; the respect bucket protected his dignity.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "disrespect" ? "Ham's disrespectful response" : "Shem and Japheth's respectful response"}.`).join(" "),
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
        hint: "Think about which son did what, and how each response affected their father's dignity.",
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
        hint: "Think about how Shem and Japheth protected their father's dignity, unlike Ham.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Noah's three sons were Shem, Ham and", after: ".", answer: "Japheth", accepted: ["japheth"] },
      { before: "Noah became a farmer and planted a", after: ".", answer: "vineyard", accepted: ["vineyard"] },
      { before: "Ham told his two brothers instead of protecting his father's", after: ".", answer: "dignity", accepted: ["dignity"] },
      { before: "Shem and Japheth walked in", after: "so as not to see their father.", answer: "backward", accepted: ["backward", "backwards"] },
      { before: "Shem and Japheth used a", after: "to cover their father.", answer: "garment", accepted: ["garment"] },
      { before: "Noah later blessed", after: "and Japheth for their honour.", answer: "Shem", accepted: ["shem"] },
      { before: "Noah's words concerned Ham's son, whose name was", after: ".", answer: "Canaan", accepted: ["canaan"] },
      { before: "This story teaches learners to show", after: "to the elderly.", answer: "respect", accepted: ["respect"] },
      { before: "Respecting the elderly means protecting their dignity, not exposing their", after: ".", answer: "weaknesses", accepted: ["weaknesses", "weakness"] },
      { before: "The story of Noah and his sons is found in Genesis", after: ":18-23.", answer: "9", accepted: ["9", "nine"] },
      { before: "This lesson's key inquiry question asks why the story of Noah is still", after: "today.", answer: "relevant", accepted: ["relevant"] },
      { before: "Shem and Japheth's care for their father shows the value of", after: ".", answer: "honour", accepted: ["honour", "honor"] },
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
      hint: "Think about Genesis 9:18-23 and how Shem and Japheth respectfully protected their father.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
