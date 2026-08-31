import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

// Compose a larger prompt pool from a small set of openers x closers (per RIGOR-STANDARDS.md's
// "affordable way to reach 20+" technique) instead of hand-authoring 20+ sentences one by one.
function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each fact about the Lord's Supper into the bucket it belongs in.",
    "these facts by whether they describe an event or a value for partaking.",
    "each statement below by whether it is an event from Luke 22:14-20 or a value needed today.",
    "each fact into the bucket for event at the table or value when partaking.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term about the Lord's Supper to its meaning.",
    "each term below with what it means in Luke 22:14-20.",
    "each idea about the Lord's Table to the explanation that fits it.",
    "each term to the explanation of why it matters at the Lord's Supper.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the Lord's Supper.",
    "the correct missing word.",
  ],
);

const ORDER_PROMPTS = [
  "Arrange these events from Luke 22:14-20 in their correct order.",
  "Put these events from the Lord's Supper into their correct order.",
  "Sequence these events from the Lord's Supper correctly.",
  "Arrange these parts of the Luke 22:14-20 account in order.",
  "Order these events as Luke 22:14-20 describes them.",
  "Sort these events into the order Luke 22:14-20 places them.",
];

// Luke 22:14-20's own sequence of events at the Last Supper, condensed to 6 steps.
const LORDS_SUPPER_ORDER = [
  { id: "l1", label: "Jesus reclined at the table with His apostles" },
  { id: "l2", label: "He said He had eagerly desired to eat this Passover with them before He suffered" },
  { id: "l3", label: "He took the cup, gave thanks, and told them to share it among themselves" },
  { id: "l4", label: "He took bread, gave thanks, broke it, and said, \"This is my body given for you\"" },
  { id: "l5", label: "After supper He took another cup, saying it was \"the new covenant in my blood\"" },
  { id: "l6", label: "He told them to do this in remembrance of Him" },
] as const;

interface SupperFact {
  text: string;
  kind: "event" | "value";
}

// Facts drawn directly from Luke 22:14-20's account of the Lord's Supper and the sub-strand's outcome on
// "values required when partaking the Eucharist/Lord's Table" — the two natural groupings the sub-strand
// itself supports.
const SUPPER_FACTS: SupperFact[] = [
  { text: "Jesus reclined at the table together with His apostles", kind: "event" },
  { text: "Jesus said He had eagerly desired to eat this Passover before He suffered", kind: "event" },
  { text: "Jesus took the cup, gave thanks, and told the apostles to share it", kind: "event" },
  { text: "Jesus took bread, gave thanks, and broke it before giving it to them", kind: "event" },
  { text: "Jesus said the bread was \"my body given for you\"", kind: "event" },
  { text: "Jesus called the cup \"the new covenant in my blood, poured out for you\"", kind: "event" },
  { text: "Jesus told the apostles to do this in remembrance of Him", kind: "event" },
  { text: "Reverence is needed — approaching the Lord's Table with a serious, respectful heart", kind: "value" },
  { text: "Self-examination is needed — reflecting honestly on one's life before partaking", kind: "value" },
  { text: "Gratitude is needed — thanking God for Christ's sacrifice remembered in the meal", kind: "value" },
  { text: "Unity is needed — sharing the Lord's Table together as one body of believers", kind: "value" },
  { text: "Faith is needed — trusting in what Christ's body and blood accomplished", kind: "value" },
];

const SUPPER_TERMS: { term: string; meaning: string }[] = [
  { term: "Luke 22:14-20", meaning: "The passage describing the events that took place during the Lord's Supper" },
  { term: "The Passover", meaning: "The Jewish festival meal Jesus was sharing with His apostles that night" },
  { term: "\"This is my body\"", meaning: "What Jesus said when He gave the broken bread to His apostles" },
  { term: "The new covenant", meaning: "What Jesus called the cup, sealed by His blood poured out for many" },
  { term: "Remembrance", meaning: "What Jesus asked His apostles to do with the bread and cup from then on" },
  { term: "Eucharist / Holy Communion", meaning: "Other names Christians use for the Lord's Supper or Lord's Table" },
  { term: "Reverence", meaning: "The respectful, serious attitude needed when partaking of the Lord's Table" },
  { term: "Self-examination", meaning: "Reflecting honestly on one's own life before taking the bread and cup" },
  { term: "Unity", meaning: "The value named for this sub-strand — believers sharing the Table together as one body" },
  { term: "Twelve apostles", meaning: "The group of disciples reclining at the table with Jesus during the Last Supper" },
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
      prompt: `Before Holy Communion at their church in ${place(rng)}, ${who} spends a quiet moment thinking honestly about a wrong they need to make right. Which value from the Lord's Supper lesson is ${who} practising?`,
      correct: "Self-examination — reflecting on one's own life before partaking",
      wrong: [
        "Curiosity — thinking about a wrong done has nothing to do with curiosity",
        "Competition — self-reflection is not about comparing oneself to others",
        "Silence — staying silent alone does not describe honest self-reflection",
      ],
      explanation: "This sub-strand names self-examination as a value needed when partaking the Lord's Table — quietly reflecting on one's own life before taking the bread and cup is exactly this value in action.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Jesus meant when He told His apostles to eat the bread and drink the cup "in remembrance of me." What is the best explanation?`,
    correct: "The Lord's Supper is meant to help believers remember Christ's body and blood given for them",
    wrong: [
      "It meant the apostles should forget everything Jesus had taught them",
      "It was only a request to remember what they had eaten for that one meal",
      "It meant the bread and cup should be thrown away once the meal ended",
    ],
    explanation: "Luke 22:19 records Jesus saying \"do this in remembrance of me\" right after giving the bread — the Lord's Supper is a remembrance of His sacrifice, given for the disciples.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} rushes into church late, grabs the Communion bread without any thought, and leaves quickly afterward. Based on the values needed when partaking, what is missing from ${who}'s approach?`,
      correct: "Reverence — approaching the Lord's Table with a serious, respectful attitude",
      wrong: [
        "Speed — moving quickly is exactly what the lesson recommends",
        "Nothing is missing, since the Communion bread was still eaten",
        "Loudness — the lesson teaches that Communion should be received loudly",
      ],
      explanation: "The lesson names reverence as a value needed when partaking the Lord's Table — a rushed, thoughtless approach lacks the serious, respectful attitude reverence calls for.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the cup Jesus shared at the Last Supper was just an ordinary drink with no special meaning. What does Luke 22:20 actually say about the cup?`,
    correct: "Jesus called it \"the new covenant in my blood, poured out for you\" — it carried deep spiritual meaning",
    wrong: [
      "Luke 22:20 says the cup had no meaning beyond quenching thirst",
      "Luke 22:20 says the cup represented only the Passover festival, nothing more",
      "Luke 22:20 does not mention a cup at the Last Supper at all",
    ],
    explanation: "Luke 22:20 records Jesus explicitly naming the cup as \"the new covenant in my blood, which is poured out for you\" — far more than an ordinary drink.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A church in ${place(rng)}, guided by ${who}, invites every member — rich and poor — to share the same Lord's Table together during Communion. Which value does this practice best reflect?`,
      correct: "Unity — believers sharing the Table together as one body, regardless of status",
      wrong: [
        "Rivalry — sharing a table together is the opposite of rivalry",
        "Isolation — inviting everyone together is the opposite of isolation",
        "Indifference — the church is showing care, not indifference, by inviting everyone",
      ],
      explanation: "This sub-strand names unity as a required value at the Lord's Table — sharing Communion together across social differences reflects believers as one body, as Christ intended.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why Jesus said He would not drink "the fruit of the vine" again until the kingdom of God comes. What does this statement point forward to?`,
    correct: "A future hope — Jesus pointing ahead to the coming kingdom of God",
    wrong: [
      "A permanent ban on ever eating or drinking again",
      "A statement with no connection to any future event",
      "A command that the apostles should never eat bread again",
    ],
    explanation: "Luke 22:18 records Jesus looking forward to the kingdom of God, giving the Lord's Supper a note of future hope alongside its remembrance of His sacrifice.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} believes Communion is only a ritual with no real meaning, since it is "just bread and juice." How would this sub-strand's teaching respond to ${who}'s view?`,
      correct: "The bread and cup represent Christ's body and blood, given for believers, and partaking calls for reverence, gratitude, and faith, not indifference",
      wrong: [
        "The lesson agrees Communion is only an empty ritual with no meaning",
        "The lesson says only priests should think about the meaning of Communion",
        "The lesson teaches that Communion should be treated exactly like any ordinary meal",
      ],
      explanation: "Luke 22:19-20 records Jesus explaining the bread and cup as His body and blood — the sub-strand's named values (reverence, gratitude, faith) show Communion is far from an empty ritual.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says Jesus shared the Last Supper meal alone, without anyone else present. Is this accurate according to Luke 22:14?`,
    correct: "No — Luke 22:14 says Jesus reclined at the table together with His apostles",
    wrong: [
      "Yes — Luke 22:14 describes Jesus eating completely alone",
      "Yes — only Judas was present with Jesus during this meal",
      "No — but the apostles arrived only after the meal had already ended",
    ],
    explanation: "Luke 22:14 says \"When the hour came, Jesus and his apostles reclined at the table\" — the Last Supper was shared together with the twelve apostles, not eaten alone.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} takes Communion every week but never once thinks about what Christ's sacrifice cost. Which value from this lesson is ${who} most clearly failing to practise?`,
      correct: "Gratitude — thanking God for Christ's sacrifice remembered in the Lord's Supper",
      wrong: [
        "Loudness — the lesson does not teach that Communion requires being loud",
        "Speed — moving quickly is not a value named in this lesson at all",
        "Curiosity — the missing value here is thankfulness, not general curiosity",
      ],
      explanation: "The lesson names gratitude as a value needed when partaking Communion — repeatedly receiving it without any thought of thankfulness misses this value entirely.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why Christians today still celebrate the Lord's Table, even though the original Last Supper happened long ago. What is the best answer, based on this sub-strand?`,
    correct: "Jesus commanded it to be done in remembrance of Him, so Christians continue it as an ongoing act of remembrance and faith",
    wrong: [
      "Christians only continue it out of habit, with no connection to what Jesus said",
      "The Lord's Table is celebrated today purely as a historical re-enactment with no spiritual meaning",
      "The practice was invented recently and has no link back to Jesus at all",
    ],
    explanation: "The key inquiry question for this sub-strand — why Christians celebrate the Lord's Table today — is answered directly by Jesus's own command in Luke 22:19, \"do this in remembrance of me.\"",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} argues that Communion is exactly the same as any regular meal shared with friends. How does Luke 22:19-20 show this view is incomplete?`,
      correct: "Jesus gave the bread and cup specific meaning — His body and His blood, sealing a new covenant — setting the Lord's Supper apart from an ordinary meal",
      wrong: [
        "Luke 22:19-20 agrees that the Lord's Supper is identical to any regular meal",
        "Luke 22:19-20 says the bread and cup had no meaning beyond feeding the apostles",
        "Luke 22:19-20 focuses only on where the meal took place, not its meaning",
      ],
      explanation: "Luke 22:19-20 records Jesus giving the bread and cup deep, specific meaning as His body and the new covenant in His blood — well beyond an ordinary shared meal.",
    };
  },
  (rng) => ({
    prompt: `A youth leader in ${place(rng)}, ${name(rng)}, teaches that faith is one of the values needed when partaking the Lord's Table. What does practising faith at Communion involve?`,
    correct: "Trusting in what Christ's body and blood, given at the cross, accomplished for believers",
    wrong: [
      "Doubting whether the bread and cup have any real spiritual meaning",
      "Believing the ritual itself, without Christ, has saving power",
      "Refusing to think about Christ's sacrifice at all while partaking",
    ],
    explanation: "Faith at the Lord's Table means trusting in what Christ's sacrifice, remembered through the bread and cup, actually accomplished — not doubting it or focusing on the ritual alone.",
  }),
];

export const theLordsSupper: Skill = {
  id: "g5-cre-ch-lords-supper",
  code: "CH.2",
  subjectId: "cre",
  strandId: "g5-cre-church",
  grade: 5,
  title: "The Lord's Supper",
  description: "The events of the Lord's Supper according to Luke 22:14-20, its significance to Christians today, and the values — reverence, self-examination, gratitude, unity, and faith — required when partaking of the Lord's Table.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank", "order"] as const);

    if (branch === "categorize") {
      const events = shuffle(rng, SUPPER_FACTS.filter((f) => f.kind === "event")).slice(0, 4);
      const values = shuffle(rng, SUPPER_FACTS.filter((f) => f.kind === "value")).slice(0, 4);
      const chosen = shuffle(rng, [...events, ...values]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "event", label: "Event at the Lord's Supper" },
          { id: "value", label: "Value needed when partaking" },
        ],
        correctBucket,
        hint: "Luke 22:14-20 describes what happened at the table, while the lesson separately names values Christians need when partaking today.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "event" ? "an event at the Lord's Supper" : "a value needed when partaking"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, SUPPER_TERMS).slice(0, 5);
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
        hint: "Think about what each term describes in Luke 22:14-20's account of the Lord's Supper.",
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
        hint: "Think about what happened at the Last Supper in Luke 22:14-20, and the values needed to partake of it today.",
        explanation: q.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, LORDS_SUPPER_ORDER);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: LORDS_SUPPER_ORDER.map((l) => l.id),
        hint: "Luke 22:14-20 moves from reclining at the table, through sharing the cup and bread, to Jesus's command to remember Him.",
        explanation: LORDS_SUPPER_ORDER.map((l) => l.label).join(" → "),
      };
    }

    const facts = [
      { before: "Jesus reclined at the table together with His", after: ".", answer: "apostles", accepted: ["apostles"] },
      { before: "Jesus said He had eagerly desired to eat this", after: "with them before He suffered.", answer: "Passover", accepted: ["passover"] },
      { before: "Jesus took the cup, gave", after: ", and told them to share it among themselves.", answer: "thanks", accepted: ["thanks"] },
      { before: "Jesus took bread, gave thanks, broke it, and said, \"This is my", after: "given for you.\"", answer: "body", accepted: ["body"] },
      { before: "Jesus called the cup \"the new covenant in my", after: ".\"", answer: "blood", accepted: ["blood"] },
      { before: "Jesus told the apostles to do this in", after: "of Him.", answer: "remembrance", accepted: ["remembrance"] },
      { before: "The value of", after: "means approaching the Lord's Table with a serious, respectful heart.", answer: "reverence", accepted: ["reverence"] },
      { before: "The value of self-", after: "means reflecting honestly on one's life before partaking.", answer: "examination", accepted: ["examination"] },
      { before: "The value of", after: "means thanking God for Christ's sacrifice remembered in the meal.", answer: "gratitude", accepted: ["gratitude"] },
      { before: "The value named for this sub-strand, shown by sharing the Table together, is", after: ".", answer: "unity", accepted: ["unity"] },
      { before: "Christians today call the Lord's Supper by other names such as the Eucharist or Holy", after: ".", answer: "Communion", accepted: ["communion"] },
      { before: "The key inquiry question for this lesson asks why Christians celebrate the Lord's Table or", after: "today.", answer: "Eucharist", accepted: ["eucharist"] },
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
      hint: "Think about Luke 22:14-20's account of the Lord's Supper and the values needed to partake of it.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
