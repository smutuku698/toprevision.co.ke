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
    "the events of the fall of man in the order they happened.",
    "these events from Genesis 3:1-11 into the order they happened.",
    "these moments from the fall of Adam and Eve in order.",
    "these events the way they happened in the garden of Eden.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is part of the temptation or a consequence of disobedience.",
    "these facts about the fall of man under the correct heading.",
    "each fact below by whether it happened before or after Adam and Eve disobeyed.",
    "each statement into the bucket for temptation or consequence.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term below with its correct meaning.",
    "each idea about the fall of man with its explanation.",
    "each term to the description that fits it.",
    "each term or idea to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the fall of man.",
    "the correct missing word.",
  ],
);

// Genesis 3:1-11 has a clear narrative sequence — the serpent's questioning, Eve and Adam eating the fruit,
// their eyes being opened, hiding from God, and God's confrontation — a genuine story order, not invented.
const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "The serpent, more crafty than any wild animal, asks the woman whether God really said not to eat from any tree in the garden (Genesis 3:1)" },
  { id: "n2", label: "The woman explains that God forbade eating or even touching the fruit of the tree in the middle of the garden, or they would die (Genesis 3:2-3)" },
  { id: "n3", label: "The serpent tells the woman she will not certainly die, but that her eyes will be opened and she will be like God, knowing good and evil (Genesis 3:4-5)" },
  { id: "n4", label: "Seeing the fruit is good for food, pleasing to the eye, and desirable for gaining wisdom, the woman takes and eats it (Genesis 3:6)" },
  { id: "n5", label: "She also gives some to her husband, who was with her, and he eats it too (Genesis 3:6)" },
  { id: "n6", label: "The eyes of both of them are opened, and realising they are naked, they sew fig leaves together to cover themselves (Genesis 3:7)" },
  { id: "n7", label: "They hear the sound of the LORD God walking in the garden and hide themselves among the trees (Genesis 3:8)" },
  { id: "n8", label: "The LORD God calls out, \"Where are you?\" and Adam explains he hid because he was afraid and naked (Genesis 3:9-10)" },
  { id: "n9", label: "God asks who told Adam he was naked, and whether he had eaten from the tree He had commanded him not to eat from (Genesis 3:11)" },
];

interface EventFact { text: string; part: "temptation" | "consequence" }
const EVENT_FACTS: EventFact[] = [
  { text: "The serpent questioned whether God had really forbidden eating from any tree in the garden", part: "temptation" },
  { text: "The serpent twisted God's words, suggesting He was hiding something good from Adam and Eve", part: "temptation" },
  { text: "The serpent promised that their eyes would be opened and they would be like God", part: "temptation" },
  { text: "Eve saw that the fruit looked good for food and was pleasing to the eye", part: "temptation" },
  { text: "Eve desired the fruit because it seemed to offer wisdom", part: "temptation" },
  { text: "Adam ate the fruit simply because Eve gave it to him, without questioning her", part: "temptation" },
  { text: "Adam and Eve's eyes were opened, and they realised they were naked", part: "consequence" },
  { text: "They felt shame and sewed fig leaves together to cover themselves", part: "consequence" },
  { text: "They hid from God among the trees of the garden out of fear", part: "consequence" },
  { text: "Their close relationship with God was broken, and they were afraid to face Him", part: "consequence" },
  { text: "God asked, \"Where are you?\" showing that Adam and Eve had moved away from close fellowship with Him", part: "consequence" },
  { text: "Disobedience led to guilt, fear and separation instead of the wisdom the serpent had promised", part: "consequence" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "The serpent", meaning: "The crafty creature that tempted Eve by questioning and twisting God's command" },
  { term: "The forbidden tree", meaning: "The tree in the middle of the garden that God commanded Adam and Eve not to eat from" },
  { term: "Fig leaves", meaning: "What Adam and Eve sewed together to cover themselves after realising they were naked" },
  { term: "Hiding from God", meaning: "What Adam and Eve did among the trees after disobeying, out of fear and shame" },
  { term: "Genesis 3:1-11", meaning: "The Bible passage that records the fall of man" },
  { term: "Disobedience", meaning: "Going against a clear instruction, as Adam and Eve did by eating the forbidden fruit" },
  { term: "Obeying a parent", meaning: "A modern example of practising the obedience lesson learnt from the fall of man" },
  { term: "Obeying a teacher's instruction", meaning: "Another modern example of practising the obedience lesson from the fall of man" },
  { term: "Obeying God's word", meaning: "The most direct application of the lesson from Adam and Eve's disobedience" },
  { term: "Blaming another person", meaning: "What Adam did when confronted by God, instead of admitting his own disobedience" },
  { term: "Guilt and fear", meaning: "The emotions Adam and Eve felt immediately after disobeying God" },
  { term: "A broken relationship with God", meaning: "The lasting consequence of the fall of man on humanity's closeness with God" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Kemunto", "Ochieng", "Wangari", "Kiprotich", "Anyango", "Mutiso", "Chelangat", "Barongo", "Waithera", "Kiplangat", "Naliaka", "Ondieki"] as const;
const KENYAN_PLACES = ["Kapsabet", "Homa Bay", "Kangundo", "Mwingi", "Baringo", "Vihiga", "Ngong", "Migori", "Gilgil", "Wajir", "Kakuma", "Mai Mahiu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads how the serpent first approached Eve, asking, "Did God really say you must not eat from any tree in the garden?" (Genesis 3:1). What is this question actually doing?`,
    correct: "It is exaggerating and twisting God's actual instruction to make Eve doubt God's goodness",
    wrong: [
      "It is a fair and accurate summary of God's original instruction",
      "It is simply the serpent asking for information out of innocent curiosity",
      "It has nothing to do with God's actual command in the garden",
    ],
    explanation: "God had only forbidden one tree, not \"any tree\" — the serpent's question exaggerated God's command, a classic tactic to plant doubt about God's goodness.",
  }),
  (rng) => ({
    prompt: `${name(rng)} points out that the serpent told Eve, "You will not certainly die... you will be like God" (Genesis 3:4-5). What does comparing this promise to what actually happened teach about temptation?`,
    correct: "Temptation often promises a good result but actually leads to guilt, fear and separation from God",
    wrong: [
      "The serpent's promise turned out to be completely true and harmless",
      "Eating the fruit made Adam and Eve genuinely equal to God in every way",
      "Temptation always keeps every promise it makes, without exception",
    ],
    explanation: "The serpent promised wisdom and being \"like God,\" but the real result was shame, fear and hiding — a lesson that a tempting promise is often a lie about the true outcome.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why Eve decided to eat the fruit even after remembering God's warning. According to Genesis 3:6, what three things drew her to it?`,
      correct: "It looked good for food, was pleasing to the eye, and seemed desirable for gaining wisdom",
      wrong: [
        "She was starving and had no other food available in the garden",
        "The serpent physically forced her to eat the fruit against her will",
        "She wanted to test whether God's warning would come true immediately",
      ],
      explanation: "Genesis 3:6 names three specific reasons Eve was drawn to the fruit: it looked good for food, was pleasing to the eye, and seemed desirable for gaining wisdom.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices that as soon as Adam and Eve ate the fruit, "the eyes of both of them were opened, and they realised they were naked" (Genesis 3:7). What does this reaction reveal about the result of their disobedience?`,
    correct: "Instead of the promised wisdom and glory, disobedience brought immediate shame and self-consciousness",
    wrong: [
      "It reveals that the fruit gave them exactly the wisdom the serpent had promised",
      "It reveals that nothing at all changed for Adam and Eve after eating the fruit",
      "It reveals that only Eve was affected by eating the fruit, not Adam",
    ],
    explanation: "The immediate result of disobedience was shame, not the promised wisdom or glory — a clear gap between what temptation promises and what disobedience actually delivers.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked why Adam and Eve hid among the trees of the garden when they heard the LORD God walking (Genesis 3:8). What best explains this reaction?`,
      correct: "Guilt and fear, because they knew they had disobeyed God's clear instruction",
      wrong: [
        "They were simply playing a game of hide and seek with God",
        "They were hiding from wild animals that had entered the garden",
        "They had forgotten God usually walked in the garden at that time",
      ],
      explanation: "Adam and Eve hid out of guilt and fear after disobeying — a natural response to broken trust, shown clearly when God calls out, \"Where are you?\"",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} disobeys a clear instruction from a parent, gets caught, and immediately tries to blame a sibling instead of admitting the mistake. Which detail from the fall of man does this behaviour most closely resemble?`,
    correct: "Adam blaming Eve (and indirectly God) instead of admitting his own disobedience when confronted (Genesis 3:12)",
    wrong: [
      "The serpent tempting Eve with a twisted version of God's command",
      "Eve seeing that the fruit was pleasing to the eye",
      "God calling out, \"Where are you?\" in the garden",
    ],
    explanation: "When confronted, Adam shifted blame instead of taking responsibility — a pattern still seen today whenever someone caught disobeying tries to blame someone else first.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what lesson the fall of man teaches about the importance of obeying instructions, even ones that seem small. What is the best answer?`,
    correct: "Even one act of disobedience to a clear instruction can bring serious, lasting consequences",
    wrong: [
      "Small instructions never really matter as long as the intention is good",
      "Obedience only matters once a person becomes an adult",
      "The fall of man shows that disobedience always goes unnoticed and unpunished",
    ],
    explanation: "God had given only one clear instruction in the garden, yet disobeying it brought shame, fear and a broken relationship with God — showing that even one act of disobedience carries real consequences.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} always double-checks instructions from a teacher before acting, saying, "I'd rather obey than find out the hard way what happens if I don't." Which lesson from the fall of man does this attitude best reflect?`,
      correct: "The importance of obedience, since ignoring or twisting a clear instruction led to serious consequences for Adam and Eve",
      wrong: [
        "The importance of curiosity above every other value, even obedience",
        "The lesson that instructions from teachers never really matter",
        "The lesson that consequences from disobedience are always avoidable anyway",
      ],
      explanation: "One of the central lessons of the fall of man is the importance of obedience — ignoring a clear instruction, as Adam and Eve did, led to real and lasting consequences.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that Eve alone was responsible for the fall of man, since she ate the fruit first. What does Genesis 3:6 actually say about Adam's role?`,
    correct: "Adam was with Eve and also ate the fruit she gave him, so he shares responsibility for the disobedience too",
    wrong: [
      "Adam was not present in the garden at all when Eve ate the fruit",
      "Adam refused to eat the fruit, so he bears no responsibility at all",
      "Adam ate the fruit before Eve did, making him solely responsible",
    ],
    explanation: "Genesis 3:6 says the woman \"gave some to her husband, who was with her, and he ate it\" — Adam was present and also disobeyed, so responsibility is shared, not Eve's alone.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says obedience only matters when someone is watching, since Adam and Eve were alone in the garden when they disobeyed. What does the fall of man actually show about this idea?`,
    correct: "God still knew what Adam and Eve had done even though no other person was watching, showing obedience matters at all times",
    wrong: [
      "The fall of man proves that disobedience is only wrong if other people find out",
      "God was unaware of what happened in the garden until Adam confessed",
      "Obedience in the garden did not matter since God was not present at the time",
    ],
    explanation: "God confronted Adam and Eve even though no other person witnessed their disobedience — showing that obedience matters at all times, not only when someone else is watching.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} reasons that since Adam and Eve only ate one piece of fruit, disobedience "isn't really that serious." How does the outcome of Genesis 3:1-11 respond to this idea?`,
      correct: "Even a seemingly small act of disobedience broke Adam and Eve's close relationship with God and brought shame, fear and hiding",
      wrong: [
        "The outcome shows that eating the fruit had no real consequences at all",
        "The outcome proves that only large acts of disobedience carry any consequences",
        "The outcome shows God was more upset about the fruit than about the disobedience itself",
      ],
      explanation: "The seriousness of sin in Genesis 3 was not about the size of the act but about disobeying God's clear instruction — the consequences (shame, fear, hiding, a broken relationship) were real and lasting.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is comparing the serpent's promise with what God had actually said would happen. According to Genesis 2:17 and 3:4-5, what was the direct contradiction between them?`,
    correct: "God said they would surely die if they ate from the tree, but the serpent told Eve she would not certainly die",
    wrong: [
      "God and the serpent actually agreed completely on what would happen",
      "God never gave any warning at all about the forbidden tree",
      "The serpent only repeated exactly what God had already said",
    ],
    explanation: "God's warning and the serpent's promise directly contradicted each other — a key sign, even to a young learner, that the serpent's words could not be trusted.",
  }),
];

export const theFallOfMan: Skill = {
  id: "g5-cre-cn-fall-of-man",
  code: "CN.3",
  subjectId: "cre",
  strandId: "g5-cre-creation",
  grade: 5,
  title: "The Fall of Man",
  description: "The fall of man according to Genesis 3:1-11 — the serpent's temptation, Adam and Eve's disobedience, its consequences, the lessons learnt, and the importance of obedience to God, parents and teachers.",
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
        hint: "Start with the serpent's question to the woman, and end with God confronting Adam about the forbidden tree.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const temptation = shuffle(rng, EVENT_FACTS.filter((f) => f.part === "temptation")).slice(0, 4);
      const consequence = shuffle(rng, EVENT_FACTS.filter((f) => f.part === "consequence")).slice(0, 4);
      const chosen = shuffle(rng, [...temptation, ...consequence]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.part));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "temptation", label: "Part of the temptation" },
          { id: "consequence", label: "Consequence of disobedience" },
        ],
        correctBucket,
        hint: "The temptation happened before Adam and Eve ate the fruit; the consequences happened right after.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.part === "temptation" ? "part of the temptation" : "consequence of disobedience"}.`).join(" "),
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
        hint: "Think about the serpent's temptation, Adam and Eve's response, and the importance of obeying God, parents and teachers.",
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
        hint: "Think about Genesis 3:1-11, what the serpent promised, and what actually happened after Adam and Eve disobeyed.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "In Genesis 3, the serpent is described as more crafty than any wild", after: ".", answer: "animal", accepted: ["animal", "animals"] },
      { before: "God had commanded Adam and Eve not to eat from the tree in the middle of the", after: ".", answer: "garden", accepted: ["garden"] },
      { before: "The serpent told Eve that if she ate the fruit, her eyes would be", after: ".", answer: "opened", accepted: ["opened"] },
      { before: "Eve saw that the fruit was good for food and pleasing to the", after: ".", answer: "eye", accepted: ["eye", "eyes"] },
      { before: "After eating the fruit, Adam and Eve sewed", after: "together to cover themselves.", answer: "fig leaves", accepted: ["fig leaves", "leaves"] },
      { before: "Adam and Eve hid themselves among the trees because they heard God", after: "in the garden.", answer: "walking", accepted: ["walking"] },
      { before: "When God called out, \"Where are you?\" Adam said he was afraid because he was", after: ".", answer: "naked", accepted: ["naked"] },
      { before: "The fall of man teaches the importance of", after: "God, parents and teachers.", answer: "obedience", accepted: ["obedience", "obeying"] },
      { before: "The fall of man is recorded in Genesis chapter", after: ", verses one to eleven.", answer: "three", accepted: ["three", "3"] },
      { before: "Instead of gaining the wisdom the serpent promised, Adam and Eve felt shame and", after: ".", answer: "fear", accepted: ["fear"] },
      { before: "When confronted, Adam blamed Eve instead of admitting his own", after: ".", answer: "disobedience", accepted: ["disobedience"] },
      { before: "The fall of man shows that disobeying God's clear instruction has serious", after: ".", answer: "consequences", accepted: ["consequences"] },
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
      hint: "Think about Genesis 3:1-11 and the lessons it teaches about obedience.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
