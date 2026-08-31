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
    "the events of Jacob wrestling with the angel in the order Genesis 32:22-30 describes them.",
    "these events from Jacob's story in their correct order.",
    "the events of this story from beginning to end.",
    "these events into the order they happened in Genesis 32:22-30.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement into the bucket for Jacob's story or an everyday example of persistence in prayer.",
    "these statements under the correct heading.",
    "each statement below by whether it is from Genesis 32:22-30 or a modern example of persistent prayer.",
    "each statement into the bucket for the Bible story or a today example.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each idea below to the evidence for it in Jacob's story.",
    "each lesson from this story to what the story shows about it.",
    "each idea about persistence in prayer to the evidence that supports it.",
    "each term to the explanation of why it matters in this story.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Jacob.",
    "the correct missing word.",
  ],
);

// The explicit sequence of events in Genesis 32:22-30 — curriculum-endorsed sequential content, not an
// invented order.
const JACOB_EVENTS = [
  { id: "e1", label: "Jacob sends his family and everything he owns across the Jabbok river at night" },
  { id: "e2", label: "Left alone, Jacob wrestles all night with a man until daybreak" },
  { id: "e3", label: "Seeing he cannot overpower Jacob, the man touches and wrenches Jacob's hip" },
  { id: "e4", label: "The man asks to be let go, but Jacob refuses, saying 'I will not let you go unless you bless me'" },
  { id: "e5", label: "The man renames Jacob 'Israel,' saying he has struggled with God and with humans and has overcome" },
  { id: "e6", label: "Jacob names the place Peniel, saying 'I saw God face to face, and yet my life was spared'" },
];

// Story events (Genesis 32:22-30) vs. modern everyday examples of persistence in prayer — grounded in
// the outcome "emulate Jacob by being persistent in prayer," not invented content.
const JACOB_FACTS: { text: string; group: "story" | "today" }[] = [
  { text: "Jacob sends his family and possessions across the Jabbok river before being left alone", group: "story" },
  { text: "Jacob wrestles with a man all through the night until daybreak", group: "story" },
  { text: "The man wrenches Jacob's hip when he cannot overpower him", group: "story" },
  { text: "Jacob refuses to let go, insisting on receiving a blessing first", group: "story" },
  { text: "The man changes Jacob's name to Israel after the struggle", group: "story" },
  { text: "Jacob names the place Peniel to remember seeing God face to face", group: "story" },
  { text: "A learner keeps praying about a difficult family situation even when an answer does not come quickly", group: "today" },
  { text: "A pupil continues praying for good exam results while also studying hard, without giving up", group: "today" },
  { text: "Someone facing a long illness in the family keeps bringing it to God in prayer week after week", group: "today" },
  { text: "A young person praying for the courage to change a bad habit keeps praying even after setbacks", group: "today" },
  { text: "A learner going through a hard season chooses to keep praying instead of giving up on faith", group: "today" },
  { text: "A family facing financial hardship keeps praying together persistently for provision", group: "today" },
];

const LESSON_EVIDENCE: { term: string; evidence: string }[] = [
  { term: "Persistence", evidence: "Jacob wrestled and held on all night, refusing to give up until he received a blessing" },
  { term: "Determination in prayer", evidence: "Jacob's insistence, 'I will not let you go unless you bless me,' shows determined, persistent prayer" },
  { term: "Transformation", evidence: "Jacob's name was changed to Israel, showing the struggle changed who he was" },
  { term: "A lasting reminder", evidence: "Jacob's wrenched hip was a permanent physical reminder of his encounter with God" },
  { term: "Remembering God's presence", evidence: "Jacob named the place Peniel specifically to remember that he had met God there" },
  { term: "Costliness of persistence", evidence: "Jacob's persistence came at a real cost — a hip injury — showing persistence is not always easy" },
  { term: "Reward for perseverance", evidence: "Jacob's refusal to give up was rewarded with a blessing and a new name" },
  { term: "Encounter with God", evidence: "Jacob himself said he had seen God face to face, showing the seriousness of this encounter" },
  { term: "Overcoming struggle", evidence: "Jacob's new name, Israel, specifically means he struggled with God and with humans and overcame" },
  { term: "Faith through the night", evidence: "Jacob kept wrestling through the entire night, not giving up even when it seemed to take too long" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads Genesis 32:26, where Jacob says, "I will not let you go unless you bless me." What does this statement show about Jacob?`,
    correct: "Jacob was persistent and determined, refusing to give up even when the struggle was costly",
    wrong: [
      "Jacob wanted to end the struggle as quickly as possible with no real determination",
      "Jacob was actually trying to escape from the man, not seeking a blessing",
      "Jacob had no interest in receiving any blessing at all",
    ],
    explanation: "Jacob's refusal to let go without a blessing, even after being injured, is the clearest evidence in the story of his persistence and determination.",
  }),
  (rng) => ({
    prompt: `In CRE class in ${place(rng)}, ${name(rng)} is asked why the man renamed Jacob 'Israel' after the wrestling match. What was the stated reason?`,
    correct: "Because Jacob had struggled with God and with humans and had overcome",
    wrong: [
      "Because Jacob had lost the wrestling match completely",
      "Because Jacob asked to be renamed after his father instead",
      "Because 'Israel' was simply Jacob's family nickname since childhood",
    ],
    explanation: "Genesis 32:28 gives the specific reason for the new name: Jacob had struggled with God and with humans and had overcome — the name marks that victory through persistence.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices that Jacob's hip was wrenched during the struggle, yet Jacob still refused to let go. What does this detail add to the lesson about persistence?`,
      correct: "It shows persistence in prayer can come at a real cost, but is still worth continuing",
      wrong: [
        "It shows Jacob should have given up immediately once injured",
        "It proves the whole story is only about physical wrestling, not prayer",
        "It shows Jacob's hip injury made him stop trying to receive a blessing",
      ],
      explanation: "Jacob held on and kept seeking the blessing even after being injured, showing that persistence in prayer is not always easy or costless, but is still worth pursuing.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} has been praying for weeks about a difficult situation at home without seeing an answer yet, and is tempted to stop. Based on Jacob's example, what should ${who} do?`,
      correct: "Keep praying persistently, following Jacob's example of not giving up until receiving an answer",
      wrong: [
        "Stop praying immediately since God only answers prayers instantly",
        "Believe that persistence in prayer has no real value or reward",
        "Assume Jacob's story has nothing to do with ordinary daily prayer",
      ],
      explanation: "The lesson's application is to emulate Jacob's persistence — continuing to pray and trust God even when an answer does not come right away.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} claims that Jacob's wrestling match was simply an ordinary physical fight with no spiritual meaning. Based on Genesis 32:22-30, is this an accurate view?`,
    correct: "No — Jacob himself said he saw God face to face at that place, showing the struggle was a real spiritual encounter",
    wrong: [
      "Yes — Jacob never described the man in the story as anything more than an ordinary stranger",
      "Yes — the passage explicitly denies any connection to God at all",
      "No — but only the renaming detail has any spiritual meaning, not the struggle itself",
    ],
    explanation: "Genesis 32:30 records Jacob naming the place Peniel and saying he saw God face to face — clear evidence the encounter had real spiritual significance, not just physical wrestling.",
  }),
  (rng) => ({
    prompt: `A learner in ${place(rng)} named ${name(rng)} says persistent prayer means repeating the exact same words many times without any real determination behind them. Does Jacob's example support this idea?`,
    correct: "No — Jacob's persistence was shown through genuine determination and refusal to give up, not empty repetition",
    wrong: [
      "Yes — Jacob only repeated the same phrase without any real effort",
      "Yes — the story teaches that the exact wording used in prayer matters most",
      "No — but Jacob's story has nothing to do with the meaning of persistence",
    ],
    explanation: "Jacob's persistence is shown through genuine, determined effort — holding on through the night despite injury — not through mechanically repeating words.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why Jacob named the place Peniel after the encounter. What was his stated reason?`,
    correct: "Because he said he saw God face to face, and yet his life was spared",
    wrong: [
      "Because Peniel was the name of Jacob's home village",
      "Because Jacob wanted to forget the encounter had ever happened",
      "Because Peniel means 'place of defeat' in Jacob's language",
    ],
    explanation: "Genesis 32:30 records Jacob naming the place Peniel specifically because he said he had seen God face to face and his life had been spared.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says that once Jacob was renamed Israel, the earlier struggle no longer mattered and should be forgotten. Is this consistent with the meaning behind the new name?`,
    correct: "No — the name Israel itself was meant to commemorate and remember the struggle and the overcoming, not erase it",
    wrong: [
      "Yes — new names in the Bible are meant to erase all memory of what came before",
      "Yes — Jacob asked for the earlier events to be left out of any retelling",
      "No — but only the hip injury, not the name, was meant to be remembered",
    ],
    explanation: "The name Israel was given specifically to mark that Jacob had struggled and overcome — the struggle is part of what the name commemorates, not something to be forgotten.",
  }),
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, guided by ${name(rng)}, debates why this story is used to teach about prayer specifically. What is the best connection?`,
    correct: "Jacob's determined refusal to let go until he was blessed mirrors the persistence believers are called to show in prayer",
    wrong: [
      "The story is really about physical fitness, not prayer at all",
      "There is no meaningful connection between wrestling and prayer",
      "The story teaches that prayer should be given up quickly if no answer comes",
    ],
    explanation: "Jacob's persistent, determined struggle for a blessing is the reason CRE uses this story to teach the value of persistence in prayer.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Jacob did with his family and possessions before the wrestling encounter began. What was it?`,
    correct: "He sent them ahead across the Jabbok river, leaving himself alone",
    wrong: [
      "He left them behind in his home village entirely",
      "He brought them all with him to watch the wrestling match",
      "He gave away all his possessions before the encounter began",
    ],
    explanation: "Genesis 32:22-23 records that Jacob sent his family and everything he had across the Jabbok, leaving himself alone just before the encounter.",
  }),
];

export const jacobWrestlesAnAngel: Skill = {
  id: "g6-cre-bi-jacob",
  code: "BI.5",
  subjectId: "cre",
  strandId: "g6-cre-bible",
  grade: 6,
  title: "Jacob Wrestles an Angel",
  description: "The events of Genesis 32:22-30, where Jacob wrestles all night and refuses to let go until blessed, and the lesson of being persistent in prayer.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, JACOB_EVENTS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the first event to the last.",
        items,
        correctOrder: JACOB_EVENTS.map((e) => e.id),
        hint: "Jacob is left alone first, then wrestles all night, then is injured, then refuses to let go, then is renamed, then names the place last.",
        explanation: JACOB_EVENTS.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const story = shuffle(rng, JACOB_FACTS.filter((f) => f.group === "story")).slice(0, 4);
      const today = shuffle(rng, JACOB_FACTS.filter((f) => f.group === "today")).slice(0, 4);
      const chosen = shuffle(rng, [...story, ...today]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "story", label: "Event from Jacob's story" },
          { id: "today", label: "Example of persistence in prayer today" },
        ],
        correctBucket,
        hint: "Story facts describe what happened at the Jabbok in Genesis 32; today facts describe modern situations of not giving up in prayer.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "story" ? "from Jacob's story" : "an example of persistence in prayer today"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, LESSON_EVIDENCE).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.term })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.evidence })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.term] = a.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each part of Jacob's story actually shows or teaches about persistence.",
        explanation: chosen.map((a) => `${a.term} — ${a.evidence.toLowerCase()}.`).join(" "),
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
        hint: "Think about the specific events of Genesis 32:22-30 and how the lesson applies to persistent prayer today.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Jacob sent his family and possessions across the", after: "river before being left alone.", answer: "Jabbok", accepted: ["jabbok"] },
      { before: "Jacob wrestled with a man all night until", after: ".", answer: "daybreak", accepted: ["daybreak"] },
      { before: "When the man could not overpower Jacob, he touched and wrenched Jacob's", after: ".", answer: "hip", accepted: ["hip"] },
      { before: "Jacob said, 'I will not let you go unless you", after: "me.'", answer: "bless", accepted: ["bless"] },
      { before: "The man renamed Jacob as", after: ", because he had struggled and overcome.", answer: "Israel", accepted: ["israel"] },
      { before: "Jacob named the place", after: ", saying he saw God face to face.", answer: "Peniel", accepted: ["peniel"] },
      { before: "Jacob said he saw God face to face, and yet his life was", after: ".", answer: "spared", accepted: ["spared"] },
      { before: "The name Israel means Jacob struggled with God and with", after: "and overcame.", answer: "humans", accepted: ["humans", "people", "men"] },
      { before: "The key inquiry question for this lesson asks why it is good to", after: "always.", answer: "pray", accepted: ["pray"] },
      { before: "This lesson encourages learners to emulate Jacob by being", after: "in prayer.", answer: "persistent", accepted: ["persistent"] },
      { before: "Jacob's determination to receive a blessing shows the value of not giving up, even when a struggle is", after: ".", answer: "costly", accepted: ["costly", "difficult"] },
      { before: "The story of Jacob wrestling is found in Genesis, chapter", after: ", verses 22 to 30.", answer: "32", accepted: ["32"] },
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
      hint: "Think about the events of Genesis 32:22-30 and what they teach about persistence in prayer.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
