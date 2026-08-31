import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

// Compose a larger prompt pool from a small set of openers x closers (per RIGOR-STANDARDS.md's
// "affordable way to reach 20+" technique) instead of hand-authoring 20 fully bespoke sentences.
function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each teaching of the Apostles' Creed under the correct Person of the Trinity it is about.",
    "these statements from the Creed by which Person of the Trinity they describe.",
    "each fact below by which Person of the Holy Trinity it belongs to.",
    "each statement into the bucket for the Person of the Trinity it teaches about.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term from the Apostles' Creed to its meaning.",
    "each Creed term below with what it means for believers.",
    "each idea from the Creed to the explanation that fits it.",
    "each term to the explanation of why it matters in the Creed.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the Apostles' Creed.",
    "the correct missing word.",
  ],
);

const ORDER_PROMPTS = [
  "Arrange these events from the Apostles' Creed's teaching about Jesus Christ in their correct order.",
  "Put these lines about Jesus Christ from the Creed into their correct order.",
  "Sequence these events from the Creed's teaching about Jesus Christ correctly.",
  "Arrange these parts of the Creed's account of Jesus Christ in order.",
  "Order these events as the Apostles' Creed states them.",
  "Sort these events into the order the Creed places them.",
];

// The Creed's own sequence for its section on Jesus Christ, from conception to final judgement.
const CREED_JESUS_ORDER = [
  { id: "j1", label: "Conceived by the Holy Spirit, born of the Virgin Mary" },
  { id: "j2", label: "Suffered under Pontius Pilate, was crucified, died, and was buried" },
  { id: "j3", label: "Descended to the dead" },
  { id: "j4", label: "Rose again on the third day" },
  { id: "j5", label: "Ascended into heaven, seated at the right hand of the Father" },
  { id: "j6", label: "Will come again to judge the living and the dead" },
] as const;

interface CreedFact {
  text: string;
  person: "father" | "son" | "spirit";
}

const CREED_FACTS: CreedFact[] = [
  { text: "The Creed calls God the Father Almighty and the Creator of heaven and earth", person: "father" },
  { text: "The Father is affirmed as the maker of everything that exists, seen and unseen", person: "father" },
  { text: "The Creed affirms belief in God the Father as the first Person named", person: "father" },
  { text: "The Creed says Jesus Christ is God's only Son", person: "son" },
  { text: "Jesus Christ was conceived by the Holy Spirit and born of the Virgin Mary", person: "son" },
  { text: "Jesus Christ suffered under Pontius Pilate, was crucified, died, and was buried", person: "son" },
  { text: "Jesus Christ rose again on the third day", person: "son" },
  { text: "Jesus Christ ascended into heaven and is seated at the right hand of the Father", person: "son" },
  { text: "Jesus Christ will come again to judge the living and the dead", person: "son" },
  { text: "The Creed affirms belief in the Holy Spirit as the third Person of the Trinity", person: "spirit" },
  { text: "The Creed links belief in the Holy Spirit to belief in the holy catholic (universal) Church", person: "spirit" },
  { text: "The Creed's section on the Holy Spirit also affirms the communion of saints and forgiveness of sins", person: "spirit" },
];

const CREED_TERMS: { term: string; meaning: string }[] = [
  { term: "God the Father Almighty", meaning: "The Creator of heaven and earth, the first Person of the Holy Trinity" },
  { term: "Jesus Christ, His only Son", meaning: "The second Person of the Trinity, conceived by the Holy Spirit and born of the Virgin Mary" },
  { term: "The Holy Spirit", meaning: "The third Person of the Trinity, affirmed in the Creed's final section" },
  { term: "The holy catholic Church", meaning: "The Creed's term for the universal Christian Church across the world" },
  { term: "The communion of saints", meaning: "The shared fellowship of all believers in Christ, living and departed" },
  { term: "Forgiveness of sins", meaning: "The Creed's affirmation that sins can be forgiven through faith in Christ" },
  { term: "The resurrection of the body", meaning: "The Creed's teaching that believers will one day be raised bodily, as Christ was" },
  { term: "Life everlasting", meaning: "The Creed's closing affirmation of eternal life with God" },
  { term: "The Holy Trinity", meaning: "The three Persons — Father, Son, and Holy Spirit — that the Creed's three sections are structured around" },
  { term: "Affirm their faith", meaning: "What reciting the Apostles' Creed together helps Christians do — declare what they believe" },
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
    prompt: `Every Sunday, ${name(rng)}'s congregation in ${place(rng)} stands together and recites the Apostles' Creed aloud. What is the main purpose of doing this?`,
    correct: "To affirm together what they believe as Christians",
    wrong: [
      "To replace the need for reading the Bible at all",
      "To perform a song rather than state a belief",
      "To list church rules rather than beliefs",
    ],
    explanation: "The Apostles' Creed is recited to affirm faith — it is a shared statement of core Christian belief, not a song or a rulebook.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked how many Persons of the Holy Trinity the Apostles' Creed names. What is the correct number?`,
      correct: "Three — the Father, the Son, and the Holy Spirit",
      wrong: ["Two — the Father and the Son only", "Four — including Mary as a fourth Person", "One — the Creed only names God as a single Person"],
      explanation: "The Apostles' Creed is structured around three Persons of the Holy Trinity: the Father, the Son (Jesus Christ), and the Holy Spirit.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} recites the line "conceived by the Holy Spirit, born of the Virgin Mary" from the Creed. Which Person of the Trinity does this line describe?`,
    correct: "Jesus Christ, the Son",
    wrong: ["God the Father", "The Holy Spirit acting alone", "None of the three Persons of the Trinity"],
    explanation: "This line comes from the Creed's section on Jesus Christ, the Son — describing how He was conceived and born.",
  }),
  (rng) => ({
    prompt: `A classmate in ${place(rng)} tells ${name(rng)} that the Apostles' Creed says Jesus "stayed dead" after His crucifixion and burial. Is this accurate?`,
    correct: "No — the Creed says He rose again on the third day",
    wrong: [
      "Yes — the Creed ends with His burial and says nothing more",
      "Yes — the Creed says He remained dead until the Second Coming",
      "No — the Creed says He never actually died",
    ],
    explanation: "The Creed's sequence continues past the burial: Jesus descended to the dead, then rose again on the third day, then ascended into heaven.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} explains that the Creed calls God "Creator of heaven and earth." Which Person of the Trinity does this describe?`,
    correct: "God the Father",
    wrong: ["Jesus Christ, the Son", "The Holy Spirit", "None — this line is not about a Person of the Trinity"],
    explanation: "The Creed's opening line, \"I believe in God the Father Almighty, Creator of heaven and earth,\" is specifically about the first Person of the Trinity, the Father.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says the Apostles' Creed teaches that Jesus "will come to judge the living and the dead." What does this line affirm?`,
    correct: "That Jesus Christ will return to judge everyone, both those alive and those who have died",
    wrong: [
      "That Jesus already finished judging everyone at His resurrection",
      "That only the Father, never Jesus, will ever judge anyone",
      "That this judgement already happened during His time in the wilderness",
    ],
    explanation: "The Creed's final line about Jesus affirms His future return to judge both the living and the dead — a belief still awaited, not already completed.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to name the three Persons of the Holy Trinity in the order the Apostles' Creed presents them. What is the correct order?`,
      correct: "Father, Son, Holy Spirit",
      wrong: ["Son, Father, Holy Spirit", "Holy Spirit, Father, Son", "Father, Holy Spirit, Son"],
      explanation: "The Apostles' Creed's three sections follow this order: belief in the Father, then the Son (Jesus Christ), then the Holy Spirit.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is confused about why the Creed's third section mentions the Church, the communion of saints, and forgiveness of sins together with the Holy Spirit. Why are these grouped together?`,
    correct: "Because they are all part of the Creed's section affirming belief in the work of the Holy Spirit",
    wrong: [
      "Because they replace the need to believe in the Holy Spirit at all",
      "Because they belong to the Creed's section on Jesus Christ instead",
      "Because the Creed lists them as unrelated, separate beliefs with no connection",
    ],
    explanation: "The Creed's final section, on the Holy Spirit, also affirms the holy catholic Church, the communion of saints, forgiveness of sins, resurrection of the body, and life everlasting — all grouped under this third section.",
  }),
  (rng) => ({
    prompt: `${name(rng)}'s Sunday school teacher in ${place(rng)} asks why the Apostles' Creed still matters to Christians today, not just in the early church. What is the best answer?`,
    correct: "It still gives Christians a shared, clear summary of what they believe, uniting them in faith",
    wrong: [
      "It matters only as a historical document with no relevance to believers today",
      "It matters only to church leaders, never to ordinary believers",
      "It was replaced entirely by a different statement of faith",
    ],
    explanation: "The Apostles' Creed remains important today because it gives Christians a shared summary of core belief — this unity is exactly why the Creed's value in Christian life is one of its Grade 6 learning outcomes.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims that believing in the Holy Trinity has no real value for how Christians live day to day. How would CRE's teaching respond to this claim?`,
    correct: "The Holy Trinity is valued because it shapes how Christians understand God's presence and work in their lives",
    wrong: [
      "CRE agrees that the Trinity has no practical value at all",
      "The Trinity is only a topic for theologians, never for ordinary believers",
      "The Trinity matters only during church services, not in daily life",
    ],
    explanation: "Recognising the value of the Holy Trinity in daily life is one of this sub-strand's own learning outcomes — believing in Father, Son, and Holy Spirit is meant to shape a Christian's everyday walk of faith, not stay abstract.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says the phrase "suffered under Pontius Pilate" in the Creed refers to something Jesus experienced before He was even born. Is this correct?`,
      correct: "No — it refers to His suffering and crucifixion, which the Creed places after His birth and life",
      wrong: [
        "Yes — Pontius Pilate is mentioned in the Creed's very first line about the Father",
        "Yes — this line refers to Jesus' conception by the Holy Spirit",
        "No — it refers to an event that happens after Jesus' ascension into heaven",
      ],
      explanation: "The Creed's sequence for Jesus Christ moves in order: born of the Virgin Mary, then suffered under Pontius Pilate, crucified, died, and buried — suffering comes after His birth, not before it.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the Apostles' Creed is "just a list of rules to obey." Why is this an inaccurate description?`,
    correct: "Because the Creed is a statement of belief affirming faith, not a list of rules or commands",
    wrong: [
      "Because the Creed actually is a list of rules, and this description is accurate",
      "Because the Creed is a song rather than any kind of statement",
      "Because the Creed only applies to church leaders and not ordinary Christians",
    ],
    explanation: "The Apostles' Creed is recited to affirm what Christians believe about God, Jesus, and the Holy Spirit — it is a statement of faith, not a set of behavioural rules.",
  }),
];

export const theApostlesCreed: Skill = {
  id: "g6-cre-ch-apostles-creed",
  code: "CH.1",
  subjectId: "cre",
  strandId: "g6-cre-church",
  grade: 6,
  title: "The Apostles' Creed",
  description: "The teachings of the Apostles' Creed, its importance in affirming Christian faith today, and the three Persons of the Holy Trinity.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank", "order"] as const);

    if (branch === "categorize") {
      const father = shuffle(rng, CREED_FACTS.filter((f) => f.person === "father")).slice(0, 3);
      const son = shuffle(rng, CREED_FACTS.filter((f) => f.person === "son")).slice(0, 3);
      const spirit = shuffle(rng, CREED_FACTS.filter((f) => f.person === "spirit")).slice(0, 2);
      const chosen = shuffle(rng, [...father, ...son, ...spirit]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.person));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "father", label: "God the Father" },
          { id: "son", label: "Jesus Christ, the Son" },
          { id: "spirit", label: "The Holy Spirit" },
        ],
        correctBucket,
        hint: "The Creed has three sections, one for each Person of the Trinity: Father, Son, and Holy Spirit.",
        explanation: chosen.map((f) => `"${f.text}" — about ${f.person === "father" ? "God the Father" : f.person === "son" ? "Jesus Christ, the Son" : "the Holy Spirit"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, CREED_TERMS).slice(0, 5);
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
        hint: "Think about which Person of the Trinity, or which affirmation, each term describes.",
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
        hint: "Think about the Creed's three sections — Father, Son, Holy Spirit — and why Christians recite it.",
        explanation: q.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, CREED_JESUS_ORDER);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: CREED_JESUS_ORDER.map((j) => j.id),
        hint: "The Creed's account of Jesus moves from His birth, through His death, to His resurrection, ascension, and final return.",
        explanation: CREED_JESUS_ORDER.map((j) => j.label).join(" → "),
      };
    }

    const facts = [
      { before: "The Apostles' Creed calls God the Father", after: ", Creator of heaven and earth.", answer: "Almighty", accepted: ["almighty"] },
      { before: "The Creed says Jesus Christ was conceived by the Holy Spirit and born of the Virgin", after: ".", answer: "Mary", accepted: ["mary"] },
      { before: "The Creed says Jesus suffered under Pontius", after: ", was crucified, died, and was buried.", answer: "Pilate", accepted: ["pilate"] },
      { before: "According to the Creed, Jesus rose again on the", after: "day.", answer: "third", accepted: ["third", "3rd"] },
      { before: "The Creed says Jesus ascended into heaven and is seated at the right hand of the", after: ".", answer: "Father", accepted: ["father"] },
      { before: "The Creed affirms that Jesus will come again to judge the living and the", after: ".", answer: "dead", accepted: ["dead"] },
      { before: "The three Persons of the Holy Trinity are the Father, the Son, and the Holy", after: ".", answer: "Spirit", accepted: ["spirit"] },
      { before: "The Creed's third section affirms belief in the holy catholic", after: ", meaning the universal Christian Church.", answer: "Church", accepted: ["church"] },
      { before: "The Creed affirms the communion of saints and the forgiveness of", after: ".", answer: "sins", accepted: ["sins", "sin"] },
      { before: "The Creed closes by affirming the resurrection of the body and life", after: ".", answer: "everlasting", accepted: ["everlasting"] },
      { before: "Reciting the Apostles' Creed together helps Christians affirm their", after: "in Christ.", answer: "faith", accepted: ["faith"] },
      { before: "The Creed opens by affirming belief in God the Father, Creator of heaven and", after: ".", answer: "earth", accepted: ["earth"] },
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
      hint: "Think about the Apostles' Creed's teachings on the Father, the Son, and the Holy Spirit.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
