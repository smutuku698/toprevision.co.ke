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
    "the events of the birth of Moses in the correct order.",
    "these events from Exodus 2:1-10 into the order they happened.",
    "these moments from the story of baby Moses in order.",
    "these events the way they happened at the River Nile.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about Moses's family or about Pharaoh's household.",
    "these facts about the birth of Moses under the correct bucket.",
    "each fact below by which part of the story it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the birth of Moses with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the birth of Moses.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "A Levite man and woman marry, and the woman gives birth to a son" },
  { id: "n2", label: "Seeing the baby was a fine child, the mother hides him for three months" },
  { id: "n3", label: "When she can hide him no longer, she places him in a papyrus basket coated with tar and pitch" },
  { id: "n4", label: "She puts the basket among the reeds along the bank of the River Nile" },
  { id: "n5", label: "The baby's sister stands at a distance to see what would happen to him" },
  { id: "n6", label: "Pharaoh's daughter comes to bathe in the Nile and notices the basket among the reeds" },
  { id: "n7", label: "She opens the basket, sees the crying baby, and feels sorry for him" },
  { id: "n8", label: "The baby's sister offers to find a Hebrew woman to nurse the baby" },
  { id: "n9", label: "The baby's own mother is brought and is paid by Pharaoh's daughter to nurse her son" },
  { id: "n10", label: "When the child grows older, Pharaoh's daughter adopts him as her own son and names him Moses" },
];

interface EventFact { text: string; group: "hiding" | "rescue" }
const EVENT_FACTS: EventFact[] = [
  { text: "The baby's mother hid him for three months because he was a fine child", group: "hiding" },
  { text: "The mother made a basket of papyrus and coated it with tar and pitch", group: "hiding" },
  { text: "The mother placed the basket among the reeds along the bank of the Nile", group: "hiding" },
  { text: "The baby's sister stood at a distance to watch over him", group: "hiding" },
  { text: "Pharaoh's daughter came to the Nile to bathe and noticed the basket", group: "rescue" },
  { text: "Pharaoh's daughter opened the basket and felt sorry for the crying baby", group: "rescue" },
  { text: "The baby's sister offered to find a Hebrew woman to nurse the child", group: "rescue" },
  { text: "The baby's own mother was hired and paid to nurse her own son", group: "rescue" },
  { text: "Pharaoh's daughter adopted the grown child as her own son", group: "rescue" },
  { text: "Pharaoh's daughter named the boy Moses, because she drew him out of the water", group: "rescue" },
  { text: "The family's careful planning kept the baby safe during a dangerous time", group: "hiding" },
  { text: "An Egyptian princess, though from a different nation, chose to protect an Israelite baby", group: "rescue" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Exodus 2:1-10", meaning: "The Bible passage recording the birth and rescue of baby Moses" },
  { term: "Levite", meaning: "The tribe that Moses's parents belonged to" },
  { term: "Papyrus basket", meaning: "The waterproofed basket the mother used to hide her baby among the reeds" },
  { term: "The River Nile", meaning: "The river where the basket carrying baby Moses was placed" },
  { term: "Moses's sister", meaning: "Who watched over the basket from a distance and later offered to find a nurse" },
  { term: "Pharaoh's daughter", meaning: "The Egyptian princess who found, rescued and later adopted baby Moses" },
  { term: "Moses", meaning: "The name given to the baby, meaning \"drawn out,\" because he was drawn out of the water" },
  { term: "Care taker/nurse", meaning: "A role Pharaoh's daughter hired to feed and look after the baby, which turned out to be his own mother" },
  { term: "God's protection", meaning: "The theme of this story, shown as Moses was kept safe through his family's care and Pharaoh's daughter's compassion" },
  { term: "Compassion", meaning: "The feeling Pharaoh's daughter had for the baby upon seeing him crying in the basket" },
  { term: "Children's rights", meaning: "A modern issue this story connects to, since Moses's protection reflects the importance of protecting every child" },
  { term: "Trust in God", meaning: "The value this story teaches learners to have, even in dangerous or uncertain situations" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Wambua", "Achieng", "Kiptanui", "Nafula", "Mburu", "Chelimo", "Odongo", "Wanjala", "Kerubo", "Simotwo", "Naliaka", "Ochieng"] as const;
const KENYAN_PLACES = ["Kitengela", "Butere", "Marigat", "Namanga", "Emali", "Mwatate", "Kabras", "Loitoktok", "Sigor", "Rachuonyo", "Athi River", "Endebess"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is going through a scary or uncertain situation at home and wonders if God still cares. What does the story of baby Moses teach about God's protection during hard times?`,
    correct: "God can protect and care for someone even in a dangerous or uncertain situation, as He did for baby Moses",
    wrong: [
      "God only protects people who are already famous or important",
      "The story of Moses shows that hard times always end badly",
      "God's protection only applied to people living in ancient Egypt",
    ],
    explanation: "Despite being placed in a basket on a dangerous river, baby Moses was protected and cared for through his family and Pharaoh's daughter — showing God's protection in hard circumstances.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sees someone from a different community or background helping a stranger in need. How does Pharaoh's daughter's action in this story relate?`,
      correct: "Pharaoh's daughter, though from a different nation, still chose compassion and helped rescue an Israelite baby — showing kindness can cross any boundary",
      wrong: [
        "The story teaches that people should only help others from their own community",
        "Pharaoh's daughter's action has no lesson about helping others",
        "Compassion in this story was limited only to people of the same background",
      ],
      explanation: "Pharaoh's daughter's compassion for baby Moses, despite him being from a different nation, models kindness and help that crosses any social or ethnic boundary.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads that Moses's mother carefully waterproofed the basket with tar and pitch before placing him in the river. What does this careful preparation show about the family's response to danger?`,
    correct: "They combined trust in God with careful, practical planning to protect the baby, rather than simply hoping for the best without any action",
    wrong: [
      "The family relied only on luck, with no real planning involved",
      "The waterproofing detail is unimportant to understanding the story",
      "Careful preparation shows the family did not trust God at all",
    ],
    explanation: "The family's careful, practical steps — hiding the baby, then waterproofing a basket — show trust in God working alongside wise, careful action.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices that Moses's sister quietly watched over the basket from a distance instead of leaving right away. What role did she play in the story's outcome?`,
      correct: "She stayed alert and, at the right moment, offered a solution that reunited baby Moses with his own mother as his nurse",
      wrong: [
        "She played no important role and simply happened to be nearby",
        "Her presence actually put the baby in more danger",
        "She was only present to look after Pharaoh's daughter, not the baby",
      ],
      explanation: "Moses's sister's watchfulness and quick thinking led directly to the baby's own mother being hired as his nurse, playing a key role in the story.",
    };
  },
  (rng) => ({
    prompt: `A group discussion in ${place(rng)}, led by ${name(rng)}, asks why Pharaoh's daughter named the baby Moses, meaning "drawn out." What does this name commemorate?`,
    correct: "The specific way she rescued him — drawing him out of the water where he had been placed in the basket",
    wrong: [
      "The name has no connection to any event in the story",
      "The name refers to Moses being drawn out of Egypt many years later",
      "The name was simply a common Egyptian name with no special meaning",
    ],
    explanation: "Exodus 2:10 explains that Pharaoh's daughter named him Moses because she said, 'I drew him out of the water,' directly commemorating his rescue.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} thinks that God's protection only happens in dramatic, miraculous ways, like a voice from heaven. What does this story suggest instead?`,
      correct: "God's protection can also work quietly through everyday people's choices and actions, like a sister watching, a mother's care, and a princess's compassion",
      wrong: [
        "God's protection in this story happened without any human involvement at all",
        "This story proves God's protection is always loud and dramatic",
        "Only priests can experience God's protection, according to this story",
      ],
      explanation: "God's protection of Moses worked through the ordinary, faithful actions of his mother, sister, and even Pharaoh's daughter — not through a dramatic miracle alone.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says that since Pharaoh's daughter was from the family that had ordered harm to Hebrew babies, it is surprising she would rescue one. What does her choice reveal?`,
    correct: "A person can choose compassion and do what is right, even when it goes against the actions or decisions of their own family or group",
    wrong: [
      "It proves the story is inaccurate, since a princess would never help",
      "It shows Pharaoh's daughter secretly agreed with harming Hebrew babies",
      "It has no significance beyond being an unusual coincidence",
    ],
    explanation: "Pharaoh's daughter's compassionate choice, despite her family's harsh decree, shows that individuals can choose kindness even against their group's actions.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wonders how being hired to nurse her own son turned out to be a special provision for Moses's mother. What made this outcome remarkable?`,
    correct: "She was able to raise and care for her own son safely, and was even paid to do so, despite the danger he had been born into",
    wrong: [
      "It was not remarkable — any hired nurse would have had the same experience",
      "She was tricked into caring for a baby that was not actually hers",
      "The arrangement made no real difference to Moses's early life",
    ],
    explanation: "It was a remarkable provision that Moses's own mother could safely nurse and care for her son, and even be paid for it, after such a dangerous beginning.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked how this story connects to protecting children's rights today. What connection can be drawn?`,
      correct: "The story shows the importance of protecting a vulnerable child's life and wellbeing, a value reflected in modern children's rights",
      wrong: [
        "The story has no connection to protecting children in any era",
        "Children's rights only became relevant after Moses grew up and became a leader",
        "The story teaches that only royal children deserve protection",
      ],
      explanation: "The care taken to protect baby Moses's life reflects the same value behind modern children's rights — that every child's life and wellbeing deserves protection.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} asks why this story is titled around "God's protection" even though much of the direct action was taken by human beings, like the mother, sister, and princess. How can both ideas be true?`,
    correct: "God's protection often works through the choices and care of people, not only through direct, visible intervention",
    wrong: [
      "The title is a mistake, since God played no role in the story at all",
      "Human action and God's protection can never work together",
      "Only Moses himself, not the people around him, mattered to his protection",
    ],
    explanation: "This story shows how God's protection can be worked out through the faithful, caring choices of ordinary people, not only through dramatic direct action.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says the story of Moses is only about ancient Egypt and has nothing to teach about depending on God today. Is this the lesson's intended takeaway?`,
      correct: "No — the lesson's outcome is for learners to desire to depend on God's guidance and protection in their own lives",
      wrong: [
        "Yes — the story is purely historical, with no application for today",
        "Yes — only descendants of Moses can apply this lesson personally",
        "No — but only adults facing major danger can apply this lesson",
      ],
      explanation: "The sub-strand's outcome explicitly states learners should desire to depend on God's guidance and protection, making the story's lesson personally relevant today.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} points out that the story shows both careful human planning and trust in God working together to protect Moses. Which best summarises the story's overall lesson?`,
    correct: "Trusting God and acting wisely and carefully are not opposites — both can work together for protection and good outcomes",
    wrong: [
      "Careful planning shows a lack of trust in God and should be avoided",
      "Trusting God means taking no practical action at all",
      "The story teaches that only luck, not planning or faith, determined the outcome",
    ],
    explanation: "The family's wise, careful planning combined with trust in God's protection worked together throughout the story to keep Moses safe.",
  }),
];

export const theBirthOfMoses: Skill = {
  id: "g5-cre-bi-birth-of-moses",
  code: "BI.7",
  subjectId: "cre",
  strandId: "g5-cre-bible",
  grade: 5,
  title: "The Birth of Moses",
  description: "The story of baby Moses hidden in a basket on the River Nile and rescued by Pharaoh's daughter (Exodus 2:1-10), teaching God's protection and dependence on God's guidance in dangerous or uncertain times.",
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
        hint: "Start with the baby's birth, and end with Pharaoh's daughter naming him Moses.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const hiding = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "hiding")).slice(0, 4);
      const rescue = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "rescue")).slice(0, 4);
      const chosen = shuffle(rng, [...hiding, ...rescue]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "hiding", label: "Moses's family hiding and protecting him" },
          { id: "rescue", label: "Pharaoh's daughter's rescue and adoption" },
        ],
        correctBucket,
        hint: "The hiding bucket is about his family's actions; the rescue bucket is about what Pharaoh's daughter did.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "hiding" ? "Moses's family hiding and protecting him" : "Pharaoh's daughter's rescue and adoption"}.`).join(" "),
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
        hint: "Think about who protected baby Moses, and how Pharaoh's daughter came to adopt him.",
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
        hint: "Think about how Moses's family and Pharaoh's daughter both played a part in protecting him.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Moses's mother hid him for three months because he was a fine", after: ".", answer: "child", accepted: ["child"] },
      { before: "The mother placed baby Moses in a basket made of", after: ".", answer: "papyrus", accepted: ["papyrus"] },
      { before: "The basket was coated with tar and", after: "to keep it waterproof.", answer: "pitch", accepted: ["pitch"] },
      { before: "The basket was placed among the reeds along the bank of the River", after: ".", answer: "Nile", accepted: ["nile"] },
      { before: "Moses's sister stood at a", after: "to watch over the basket.", answer: "distance", accepted: ["distance"] },
      { before: "Pharaoh's", after: "found the basket while bathing in the river.", answer: "daughter", accepted: ["daughter"] },
      { before: "Moses's sister offered to find a Hebrew woman to", after: "the baby.", answer: "nurse", accepted: ["nurse"] },
      { before: "Pharaoh's daughter paid Moses's own mother to", after: "him.", answer: "nurse", accepted: ["nurse"] },
      { before: "Pharaoh's daughter adopted the grown boy and named him", after: ".", answer: "Moses", accepted: ["moses"] },
      { before: "The name Moses means \"drawn out,\" because he was drawn out of the", after: ".", answer: "water", accepted: ["water"] },
      { before: "This story teaches learners to depend on God's guidance and", after: ".", answer: "protection", accepted: ["protection"] },
      { before: "The birth of Moses is recorded in Exodus", after: ":1-10.", answer: "2", accepted: ["2", "two"] },
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
      hint: "Think about Exodus 2:1-10 and how baby Moses was protected and rescued.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
