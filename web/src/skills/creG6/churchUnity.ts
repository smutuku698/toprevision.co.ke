import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement about Church unity by which Bible text it comes from.",
    "these facts about Church unity under the correct Bible reference.",
    "each statement below by which Bible passage it teaches.",
    "each fact into the bucket for the Bible text it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term about Church unity to its meaning.",
    "each idea below with what it means for Church unity.",
    "each term about Church unity to the explanation that fits it.",
    "each term to the explanation of why it matters for Church unity.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Church unity.",
    "the correct missing word.",
  ],
);

interface UnityFact {
  text: string;
  source: "matthew" | "galatians" | "corinthians";
}

// Matthew 16:18, Galatians 3:28, 1 Corinthians 12:12 — the three key texts named in this sub-strand.
const UNITY_FACTS: UnityFact[] = [
  { text: "Matthew 16:18 records Jesus saying, 'on this rock I will build my church'", source: "matthew" },
  { text: "Matthew 16:18 says the gates of Hades will not overcome the church", source: "matthew" },
  { text: "Matthew 16:18 teaches that the church has a foundation strong enough to endure any attack", source: "matthew" },
  { text: "Matthew 16:18 shows that Jesus Himself is committed to building and protecting His church", source: "matthew" },
  { text: "Galatians 3:28 says there is neither Jew nor Gentile in Christ", source: "galatians" },
  { text: "Galatians 3:28 says there is neither slave nor free in Christ", source: "galatians" },
  { text: "Galatians 3:28 says there is no male and female division that separates believers in Christ", source: "galatians" },
  { text: "Galatians 3:28 teaches that all believers are one in Christ Jesus, regardless of background", source: "galatians" },
  { text: "1 Corinthians 12:12 compares the church to a human body with many different parts", source: "corinthians" },
  { text: "1 Corinthians 12:12 says the body is one even though it has many parts", source: "corinthians" },
  { text: "1 Corinthians 12:12 says all the parts of the body form one body, just as it is with Christ", source: "corinthians" },
  { text: "1 Corinthians 12:12 shows that different members of the church can work together in unity", source: "corinthians" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Church unity", meaning: "Christians from different backgrounds and denominations coming together as one body in Christ" },
  { term: "Matthew 16:18", meaning: "Teaches that Jesus builds His church on a firm foundation that cannot be overcome" },
  { term: "Galatians 3:28", meaning: "Teaches that believers are one in Christ, regardless of ethnicity, social status, or gender" },
  { term: "1 Corinthians 12:12", meaning: "Compares the church to one body with many different, cooperating parts" },
  { term: "Denomination", meaning: "A named branch or group within the wider Christian Church, such as Catholic, Anglican, or Presbyterian" },
  { term: "Harmonious living", meaning: "People from different backgrounds getting along peacefully and cooperating with each other" },
  { term: "Churches working together", meaning: "Different denominations cooperating on shared community projects or events" },
  { term: "Social justice", meaning: "The value linked to this sub-strand, about fairness and equal treatment for all people" },
  { term: "One body, many parts", meaning: "1 Corinthians 12:12's image describing how diverse church members still form a single, unified church" },
  { term: "Foundation of the church", meaning: "What Matthew 16:18 calls the 'rock' Jesus builds His church on, able to withstand any opposition" },
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
  (rng) => {
    const who = name(rng);
    return {
      prompt: `In ${place(rng)}, ${who} notices that a Catholic church, an Anglican church, and a Presbyterian church in the same neighbourhood are jointly organising a community clean-up day. Which Bible teaching does this cooperation best reflect?`,
      correct: "1 Corinthians 12:12's teaching that the church is one body made up of many cooperating parts",
      wrong: [
        "Matthew 16:18's teaching about the church's foundation being built on rock",
        "Galatians 3:28's teaching about believers being one regardless of gender",
        "None of the three texts relate to different denominations cooperating",
      ],
      explanation: "1 Corinthians 12:12 pictures the church as one body with many parts working together — different denominations cooperating on a shared project is a real-life example of this unity.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} points out that their CRE class includes learners from different ethnic communities who worship together without division. Which Bible verse most directly supports treating them as equally united in Christ?`,
    correct: "Galatians 3:28 — there is neither Jew nor Gentile, for all are one in Christ Jesus",
    wrong: [
      "Matthew 16:18 — on this rock I will build my church",
      "1 Corinthians 12:12 — the body is one but has many parts",
      "None of the texts address ethnic differences",
    ],
    explanation: "Galatians 3:28 specifically teaches that believers are one in Christ regardless of ethnic background (Jew or Gentile), social status (slave or free), or gender.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is discouraged when a local church faces strong opposition and false rumours, and wonders if the church will survive. What does Matthew 16:18 promise about the church in this situation?`,
    correct: "That the church is built on a foundation so firm that even the gates of Hades will not overcome it",
    wrong: [
      "That every individual local church is guaranteed to face no opposition at all",
      "That the church's survival depends only on the size of its congregation",
      "That Matthew 16:18 makes no promise about the church enduring opposition",
    ],
    explanation: "Matthew 16:18 records Jesus promising that His church, built on a firm foundation, will not be overcome even by the gates of Hades — a promise of endurance through opposition.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that because different church members have different roles — some teach, some sing, some help the needy — the church cannot really be considered "one." How would 1 Corinthians 12:12 respond to this claim?`,
      correct: "The body is one even though it has many different, cooperating parts — diversity of roles does not break unity",
      wrong: [
        "1 Corinthians 12:12 agrees that different roles make the church divided",
        "1 Corinthians 12:12 says only one role is ever needed in the church",
        "1 Corinthians 12:12 has nothing to say about different roles in the church",
      ],
      explanation: "1 Corinthians 12:12 directly addresses this: the body is one but has many parts, and all the parts form one body — different roles working together is exactly what unity looks like.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} claims that Church unity simply means every Christian must join the exact same denomination. Is this an accurate understanding of what the Bible teaches about Church unity?`,
    correct: "No — unity means believers from different backgrounds and denominations being one in Christ, not necessarily one identical denomination",
    wrong: [
      "Yes — Galatians 3:28 requires every believer to belong to one single denomination",
      "Yes — 1 Corinthians 12:12 says diversity within the church is not allowed",
      "No — Church unity actually means Christians should avoid worshipping together at all",
    ],
    explanation: "Galatians 3:28 and 1 Corinthians 12:12 both describe unity as oneness in Christ despite real differences (background, role) — not everyone joining one identical denomination.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees churches in the community organising a joint prayer event during a difficult time, like a drought or a local tragedy. Why does CRE teach that this kind of cooperation matters?`,
    correct: "Because it fosters harmonious living and reflects the unity Christ intends for His church",
    wrong: [
      "Because it proves that only one denomination is genuinely Christian",
      "Because it replaces the need for any individual church to function on its own",
      "Because it has no real spiritual meaning, just a social gathering",
    ],
    explanation: "Different churches working together, especially in difficult times, is a concrete way Church unity fosters harmonious living in a community — directly answering this sub-strand's key inquiry question.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} argues that because Galatians 3:28 was written centuries ago, it no longer matters for how Christians relate to each other today. How would CRE's teaching respond?`,
      correct: "The unity Galatians 3:28 describes — oneness across ethnic, social, and gender lines — remains a standing teaching for Christians today",
      wrong: [
        "CRE agrees that Galatians 3:28 is outdated and no longer relevant",
        "The verse only applied during Paul's own lifetime and nowhere else",
        "The verse was only ever meant for church leaders, not ordinary believers",
      ],
      explanation: "This sub-strand's own key inquiry question — why Church unity is important — assumes these biblical teachings, including Galatians 3:28, remain relevant for how Christians live together today.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked to summarise what all three texts — Matthew 16:18, Galatians 3:28, and 1 Corinthians 12:12 — have in common. What is the best summary?`,
    correct: "They each teach an aspect of how the church is meant to be unified and to endure together",
    wrong: [
      "They are unrelated passages with no shared theme about the church",
      "They each teach that individual churches should avoid cooperating with each other",
      "They focus only on rules for church leaders, not on unity itself",
    ],
    explanation: "Matthew 16:18 (the church's firm foundation), Galatians 3:28 (oneness across divisions), and 1 Corinthians 12:12 (one body, many parts) together build the biblical case for Church unity.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says social status, like being rich or poor, should determine how welcome someone is in a church. How does Galatians 3:28 address this specific claim?`,
    correct: "It teaches there is neither slave nor free — social status does not divide believers who are one in Christ",
    wrong: [
      "Galatians 3:28 agrees that social status should determine church welcome",
      "Galatians 3:28 only addresses gender, not social status at all",
      "Galatians 3:28 says social status matters more inside the church than outside it",
    ],
    explanation: "Galatians 3:28 explicitly names 'neither slave nor free' as a division that does not apply among believers united in Christ — social status should not determine welcome or standing in the church.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees two church youth groups from different denominations combine their choirs for a joint concert. Which value from this sub-strand does this best demonstrate?`,
    correct: "Social justice — treating believers from different denominations as equally valued and included",
    wrong: [
      "Isolation — keeping each denomination strictly separate at all times",
      "Competition — denominations should always compete rather than cooperate",
      "Indifference — church cooperation has no connection to any particular value",
    ],
    explanation: "Social justice, this sub-strand's named value, is reflected when believers from different denominations are treated as equally valued and choose to cooperate rather than stay divided.",
  }),
];

export const churchUnity: Skill = {
  id: "g6-cre-ch-church-unity",
  code: "CH.3",
  subjectId: "cre",
  strandId: "g6-cre-church",
  grade: 6,
  title: "Church Unity",
  description: "Biblical teachings on Church unity from Matthew 16:18, Galatians 3:28, and 1 Corinthians 12:12, and how different churches working together fosters harmonious living.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (three standalone Bible texts and
    // a key inquiry question, not a step-by-step process), so `ordering` is deliberately skipped — 4 kinds
    // is the honest cap here, matching the precedent in inspiredWordOfGod.ts.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const matt = shuffle(rng, UNITY_FACTS.filter((f) => f.source === "matthew")).slice(0, 3);
      const gal = shuffle(rng, UNITY_FACTS.filter((f) => f.source === "galatians")).slice(0, 3);
      const cor = shuffle(rng, UNITY_FACTS.filter((f) => f.source === "corinthians")).slice(0, 3);
      const chosen = shuffle(rng, [...matt, ...gal, ...cor]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.source));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "matthew", label: "Matthew 16:18" },
          { id: "galatians", label: "Galatians 3:28" },
          { id: "corinthians", label: "1 Corinthians 12:12" },
        ],
        correctBucket,
        hint: "Matthew 16:18 is about the church's foundation, Galatians 3:28 is about oneness across divisions, and 1 Corinthians 12:12 is about one body with many parts.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.source === "matthew" ? "Matthew 16:18" : f.source === "galatians" ? "Galatians 3:28" : "1 Corinthians 12:12"}.`).join(" "),
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
        hint: "Think about what each term or Bible reference means for Church unity.",
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
        hint: "Think about what Matthew 16:18, Galatians 3:28, and 1 Corinthians 12:12 each teach about Church unity.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "In Matthew 16:18, Jesus says 'on this rock I will build my", after: ".'", answer: "church", accepted: ["church"] },
      { before: "Matthew 16:18 says the gates of Hades will not", after: "the church.", answer: "overcome", accepted: ["overcome"] },
      { before: "Galatians 3:28 says there is neither Jew nor", after: "in Christ.", answer: "Gentile", accepted: ["gentile"] },
      { before: "Galatians 3:28 says there is neither slave nor", after: "in Christ.", answer: "free", accepted: ["free"] },
      { before: "Galatians 3:28 says there is no male and", after: "division in Christ.", answer: "female", accepted: ["female"] },
      { before: "1 Corinthians 12:12 says the body is one but has many", after: ".", answer: "parts", accepted: ["parts"] },
      { before: "1 Corinthians 12:12 says all the parts form one body, just as it is with", after: ".", answer: "Christ", accepted: ["christ"] },
      { before: "The value linked to this sub-strand on Church unity is social", after: ".", answer: "justice", accepted: ["justice"] },
      { before: "Church unity means believers from different backgrounds coming together as one", after: "in Christ.", answer: "body", accepted: ["body"] },
      { before: "Different churches working together fosters harmonious", after: "in communities.", answer: "living", accepted: ["living"] },
      { before: "A named branch of the wider Christian Church, such as Catholic or Anglican, is called a", after: ".", answer: "denomination", accepted: ["denomination"] },
      { before: "Matthew 16:18 teaches that the church's foundation is strong enough to", after: "any attack.", answer: "endure", accepted: ["endure", "withstand"] },
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
      hint: "Think about Matthew 16:18, Galatians 3:28, and 1 Corinthians 12:12, and what each teaches about Church unity.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
