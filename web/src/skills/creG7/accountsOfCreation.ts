import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the events of the first creation account (Genesis 1) in the correct order.",
  "Put the days of the first creation account in the correct order.",
  "Sequence the six days of creation from Genesis 1 correctly.",
  "Arrange these stages of creation in the order Genesis 1 describes them.",
  "Order the events of the first creation account from Day 1 to Day 6.",
  "Sort these creation events into the order they happened in Genesis 1.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as belonging to the first creation account (Genesis 1) or the second (Genesis 2).",
  "Decide whether each statement belongs to the first or second creation account, and sort it there.",
  "Group these statements under the first account (Genesis 1) or the second (Genesis 2).",
  "Sort each fact below into the creation account it describes.",
  "Place each statement into the bucket for the account it belongs to.",
  "Read each statement and sort it under the correct creation account.",
];

const MATCH_PROMPTS = [
  "Match each attribute of God to the evidence for it in the creation accounts.",
  "Pair each attribute of God with the evidence that shows it.",
  "Connect each attribute below to the evidence supporting it in Genesis.",
  "Match each attribute of God to the statement that demonstrates it.",
  "Link each attribute of God to what the creation accounts show about it.",
  "Match each attribute to the evidence from the creation story.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact about creation.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about the creation accounts with the right word.",
];

// The first creation account's day-by-day order (Genesis 1:1-2:4a) is explicit, curriculumendorsed sequential content — not an invented order.
const CREATION_DAYS = [
  { id: "d1", label: "Day 1: God creates light and separates it from darkness" },
  { id: "d2", label: "Day 2: God creates the sky, separating the waters above from the waters below" },
  { id: "d3", label: "Day 3: God gathers the seas, forms dry land, and creates vegetation" },
  { id: "d4", label: "Day 4: God creates the sun, moon, and stars" },
  { id: "d5", label: "Day 5: God creates sea creatures and birds" },
  { id: "d6", label: "Day 6: God creates land animals and human beings, male and female" },
];

// First account = Genesis 1:1-2:4a; second account = Genesis 2:4b-25.
const ACCOUNT_FACTS: { text: string; account: "first" | "second" }[] = [
  { text: "Creation happens over six days, with God resting on the seventh", account: "first" },
  { text: "Human beings are created last, after all the animals", account: "first" },
  { text: "Man and woman are created together as male and female", account: "first" },
  { text: "God speaks each part of creation into existence with His word", account: "first" },
  { text: "God calls His creation good after each stage", account: "first" },
  { text: "Human beings are given dominion over the fish, birds, and every living creature", account: "first" },
  { text: "God forms the man first, from the dust of the ground", account: "second" },
  { text: "God breathes the breath of life into the man's nostrils", account: "second" },
  { text: "God plants a garden in Eden and places the man there to till and keep it", account: "second" },
  { text: "God forms the animals and birds and brings them to the man to be named", account: "second" },
  { text: "The woman is formed from a rib taken out of the man's side", account: "second" },
  { text: "The focus is on the man's relationship with the garden, the animals, and the woman", account: "second" },
];

const ATTRIBUTES: { term: string; evidence: string }[] = [
  { term: "Creator", evidence: "God brings everything in the universe into existence out of nothing" },
  { term: "All-powerful", evidence: "God simply speaks and light, land, and living creatures come into being" },
  { term: "Orderly", evidence: "Creation unfolds in a clear, deliberate sequence over six days" },
  { term: "Good", evidence: "God repeatedly looks at what He has made and calls it good" },
  { term: "Wise", evidence: "Every part of creation is suited to support the next, from light to living creatures" },
  { term: "Loving", evidence: "God provides a garden, food, and companionship for the man He has formed" },
  { term: "Sovereign", evidence: "God alone decides what exists and gives human beings dominion over it" },
  { term: "Relational", evidence: "God forms the woman so that the man would not be alone" },
  { term: "Life-giving", evidence: "God breathes the breath of life into the man, making him a living being" },
  { term: "Provider", evidence: "God plants a garden with everything the man needs before placing him in it" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kisumu", "Eldoret", "Nakuru", "Mombasa", "Kitengela", "Thika", "Nyeri", "Kitale", "Machakos", "Meru", "Bungoma", "Kericho"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a CRE learner in ${place(rng)}, is asked which account of creation focuses on the six-day sequence culminating in male and female human beings created together. Which account is this?`,
    correct: "The first account (Genesis 1:1-2:4a)",
    wrong: ["The second account (Genesis 2:4b-25)", "Neither account mentions human beings", "Both accounts describe exactly the same sequence"],
    explanation: "Genesis 1:1-2:4a is the first account, structured around six days, with man and woman created together on day six.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is retelling the account where God forms the man from dust and breathes life into him before planting a garden. Which account is ${name(rng)} retelling?`,
    correct: "The second account (Genesis 2:4b-25)",
    wrong: ["The first account (Genesis 1:1-2:4a)", "A New Testament account", "Neither account mentions the man being formed"],
    explanation: "Genesis 2:4b-25, the second account, describes the man being formed from dust and the garden being planted for him.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices that in the first account, God speaks and things simply come into being. Which attribute of God does this best show?`,
      correct: "All-powerful — God's spoken word alone is enough to bring creation into existence",
      wrong: ["Orderly — this shows creation happening in a fixed sequence, not power", "Relational — speaking is about power, not relationships", "Provider — this describes God's power to create, not His provision"],
      explanation: "God simply speaking and creation coming into being demonstrates His all-powerful nature — no tools or effort are needed, only His word.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} points out that God forms a garden with everything the man in the second account needs before placing him there. Which attribute of God does this best show?`,
    correct: "Provider — God supplies what is needed before the man even asks for it",
    wrong: ["All-powerful — provision is about supplying needs, not raw power", "Orderly — this describes generosity, not sequence", "Sovereign — this shows care, not authority to decide"],
    explanation: "Planting a garden stocked with everything the man would need shows God's nature as a provider who anticipates and meets needs.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} explains that God forms the woman because it is not good for the man to be alone. Which attribute of God does this best show?`,
    correct: "Relational — God values companionship and provides for human relationships",
    wrong: ["All-powerful — this is about relationships, not power", "Orderly — a sequence is not the point of this event", "Life-giving — the woman's formation is about companionship, not the breath of life"],
    explanation: "Forming the woman so the man would not be alone shows that God cares about human relationships, not just human existence.",
  }),
  (rng) => ({
    prompt: `${name(rng)} notices that creation in the first account unfolds day by day, each stage building on the one before it. Which attribute of God does this best show?`,
    correct: "Orderly — creation follows a clear, deliberate sequence rather than happening all at once, randomly",
    wrong: ["Life-giving — sequence is not about breathing life into anything", "Relational — a sequence describes order, not relationships", "Provider — this shows structure, not supplying needs"],
    explanation: "The day-by-day structure of the first account shows that God's creative work is deliberate and orderly, not random or chaotic.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, comparing both creation accounts for a class presentation in ${place(rng)}, is asked for one genuine difference between them. Which of these is correct?`,
      correct: "The first account is structured around six days; the second account focuses on the man's relationship with the garden, animals, and woman",
      wrong: [
        "The first account never mentions God creating human beings at all",
        "The second account describes seven separate days of creation",
        "The two accounts contradict each other and cannot both be true",
      ],
      explanation: "The first account's structure is the six days culminating in humanity; the second zooms in on the man's relationships with his surroundings — a difference in focus, not a contradiction.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} is asked for one genuine similarity shared by both creation accounts. Which of these is correct?`,
    correct: "Both accounts present God as the one who deliberately creates human beings",
    wrong: [
      "Both accounts describe exactly seven days of creation in the same order",
      "Both accounts say the woman was created before the man",
      "Both accounts leave out any mention of a garden",
    ],
    explanation: "Both accounts agree that God is the deliberate creator of human beings, even though they differ in structure and focus.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked to identify what human beings are given in the first creation account after they are made. What is it?`,
    correct: "Dominion (responsibility) over the fish, birds, and every living creature",
    wrong: ["Ownership to misuse creation however they wish", "No responsibility at all over the rest of creation", "Authority only over plants, not animals"],
    explanation: "Genesis 1 records that human beings are given dominion over the rest of creation — a responsibility to steward it, not a licence to misuse it.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what the man's first task was after being placed in the garden, according to the second account. What was it?`,
    correct: "To till (work) and keep (care for) the garden",
    wrong: ["To immediately name the woman", "To build a shelter before doing anything else", "To rest for six days before starting any work"],
    explanation: "Genesis 2:15 records that the man was placed in the garden to till it and keep it — an early picture of responsible stewardship over creation.",
  }),
];

export const accountsOfCreation: Skill = {
  id: "g7-cre-cn-accounts-of-creation",
  code: "CN.1",
  subjectId: "cre",
  strandId: "g7-cre-creation",
  grade: 7,
  title: "Accounts of Creation",
  description: "The two biblical accounts of creation (Genesis 1:1-2:4a and Genesis 2:4b-25), their similarities and differences, and the attributes of God shown through them.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, CREATION_DAYS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from Day 1 to Day 6.",
        items,
        correctOrder: CREATION_DAYS.map((d) => d.id),
        hint: "Light comes first; human beings, both male and female, are created last on Day 6.",
        explanation: CREATION_DAYS.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const first = shuffle(rng, ACCOUNT_FACTS.filter((f) => f.account === "first")).slice(0, 4);
      const second = shuffle(rng, ACCOUNT_FACTS.filter((f) => f.account === "second")).slice(0, 4);
      const chosen = shuffle(rng, [...first, ...second]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.account));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "first", label: "First account (Genesis 1:1-2:4a)" },
          { id: "second", label: "Second account (Genesis 2:4b-25)" },
        ],
        correctBucket,
        hint: "The first account is structured around six days; the second focuses on the man, the garden, the animals, and the woman.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.account === "first" ? "first account" : "second account"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, ATTRIBUTES).slice(0, 5);
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
        hint: "Look for what each part of the creation story reveals about God's character.",
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
        hint: "Think about which account or attribute of God the situation actually points to.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "In the first creation account, God rested on the", after: "day.", answer: "seventh", accepted: ["seventh", "7th"] },
      { before: "In the second creation account, God formed the man from the", after: "of the ground.", answer: "dust", accepted: ["dust"] },
      { before: "God breathed the breath of", after: "into the man's nostrils, and he became a living being.", answer: "life", accepted: ["life"] },
      { before: "The garden that God planted for the man was located in", after: ".", answer: "Eden", accepted: ["eden"] },
      { before: "In the second account, the woman was formed from a", after: "taken out of the man's side.", answer: "rib", accepted: ["rib"] },
      { before: "God's attribute of being all-powerful is shown because He simply", after: "and creation comes into being.", answer: "speaks", accepted: ["speaks", "speaks it"] },
      { before: "God's attribute of being a", after: "is shown by planting a garden stocked with everything the man would need.", answer: "provider", accepted: ["provider"] },
      { before: "On Day 6 of the first creation account, God created land animals and", after: ", male and female.", answer: "human beings", accepted: ["human beings", "humans", "man and woman"] },
      { before: "In the first account, human beings were given", after: "over the fish, birds, and every living creature.", answer: "dominion", accepted: ["dominion"] },
      { before: "God formed the woman because it was not good for the man to be", after: ".", answer: "alone", accepted: ["alone"] },
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
      hint: "Think about the details of the two creation accounts.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
