import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

// NOTE ON SCOPE: Grade 6 (~11-12 years old). Kept strictly within the KICD design's own framing for this
// sub-strand — physical/emotional changes of adolescence, "body as temple of the Holy Spirit," fleeing
// negative influence, and values/self-discipline. Deliberately values-and-self-respect framed, not biology
// or clinical content, per the design's own scope and per this task's explicit instruction.

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement as a cause of irresponsible behaviour among youth, or a value that helps avoid it.",
    "these statements into cause or value/life skill.",
    "each statement below by whether it is a cause of irresponsible behaviour or a value that helps avoid it.",
    "each fact into the bucket for cause or value/life skill.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each idea below with what it means for respecting your body as God's temple.",
    "each term to the explanation that fits it.",
    "each term to the explanation of why it matters for responsible behaviour.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact.",
    "the correct missing word.",
  ],
);

const ORDER_PROMPTS = [
  "Arrange James 1:14-16's description of how temptation grows into sin, in order.",
  "Put these steps from James 1:14-16 into their correct order.",
  "Sequence how James 1:14-16 says a wrong desire can lead to sin.",
  "Arrange these steps describing how temptation develops, in order.",
  "Order these steps as James 1:14-16 describes them.",
  "Sort these steps into the order James 1:14-16 places them.",
];

// James 1:14-16's own stated sequence: desire entices, desire conceives and gives birth to sin, sin when
// full-grown gives birth to death — a genuine textual order, not an invented one.
const JAMES_ORDER = [
  { id: "j1", label: "A person is tempted by their own evil desire" },
  { id: "j2", label: "That desire entices and drags the person away" },
  { id: "j3", label: "The desire conceives and gives birth to sin" },
  { id: "j4", label: "Sin, when it is full-grown, gives birth to death" },
] as const;

interface Fact {
  text: string;
  kind: "cause" | "value";
}

const FACTS: Fact[] = [
  { text: "Peer pressure from friends who encourage risky behaviour is a common cause of irresponsible choices", kind: "cause" },
  { text: "Curiosity about the physical and emotional changes of adolescence, without proper guidance, can lead to poor choices", kind: "cause" },
  { text: "A lack of guidance from trusted parents or guardians leaves a young person without support in difficult moments", kind: "cause" },
  { text: "Content that glamorises irresponsible behaviour can influence a young person's choices", kind: "cause" },
  { text: "Low self-esteem can lead a young person to seek approval from others in unwise ways", kind: "cause" },
  { text: "Idleness, or having no positive activities to fill free time, can lead to risky choices", kind: "cause" },
  { text: "Self-respect means valuing one's own body as the temple of the Holy Spirit", kind: "value" },
  { text: "Self-control means mastering one's desires instead of acting on every impulse", kind: "value" },
  { text: "Seeking guidance means talking openly to a trusted parent, guardian, or mentor about challenges", kind: "value" },
  { text: "Assertiveness means saying no firmly and clearly to pressure from others", kind: "value" },
  { text: "Wise choice of friends means choosing companions who encourage responsible, moral behaviour", kind: "value" },
  { text: "Avoiding risky situations means fleeing from circumstances likely to lead to temptation", kind: "value" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "1 Corinthians 6:18-20", meaning: "Teaches believers to flee sexual immorality because their bodies are temples of the Holy Spirit" },
  { term: "2 Timothy 2:22", meaning: "Teaches believers to flee the evil desires of youth and pursue righteousness, faith, love, and peace" },
  { term: "James 1:14-16", meaning: "Describes how a person's own desire can entice them and, left unchecked, lead toward sin" },
  { term: "Temple of the Holy Spirit", meaning: "The Bible's description of the body, meant to be honoured and respected, not misused" },
  { term: "Adolescence", meaning: "The stage of life with physical and emotional changes as a young person grows toward adulthood" },
  { term: "Honouring God with your body", meaning: "1 Corinthians 6:20's call to respect and care for one's body as belonging to God" },
  { term: "Fleeing temptation", meaning: "The strategy 1 Corinthians 6:18 and 2 Timothy 2:22 both recommend — actively avoiding tempting situations" },
  { term: "Self-discipline", meaning: "The inner strength to make wise choices even when facing pressure or temptation" },
  { term: "Trusted adult", meaning: "A parent, guardian, or mentor a young person can turn to for guidance during difficult moments" },
  { term: "Evil desire", meaning: "James 1:14's term for a wrong craving that, left unchecked, can grow into sin" },
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
      prompt: `${who} in ${place(rng)} notices new physical and emotional changes happening as they grow older and feels confused about whether this is normal. What does CRE teach about these changes?`,
      correct: "They are a normal part of growing through adolescence, and it is healthy to talk about them with a trusted adult",
      wrong: [
        "They are a sign something is wrong that should never be discussed with anyone",
        "They only happen to some young people, not as a normal stage of growth",
        "They should be ignored completely rather than understood",
      ],
      explanation: "This sub-strand's own learning experiences include discussing the physical and emotional changes of adolescence openly — these changes are a normal part of growing up, not something to fear or hide.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what 1 Corinthians 6:18-20 calls the body. What is the correct answer?`,
    correct: "The temple of the Holy Spirit",
    wrong: ["A temporary shell with no real value", "A source of shame that should be hidden away", "An object with no connection to one's faith"],
    explanation: "1 Corinthians 6:19-20 calls the body the temple of the Holy Spirit, meant to be honoured and respected as belonging to God.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is invited to a risky situation by peers and remembers 2 Timothy 2:22's advice about "fleeing the evil desires of youth." What is this verse's practical advice?`,
      correct: "To actively avoid or leave situations likely to lead to temptation, rather than testing one's willpower",
      wrong: [
        "To stay in the situation and try to resist through willpower alone",
        "To confront everyone involved with an argument",
        "To ignore the situation completely without making any decision",
      ],
      explanation: "\"Flee\" in 2 Timothy 2:22 means actively leaving or avoiding a tempting situation — a practical, proactive strategy, not just relying on willpower while staying in the situation.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} feels pressured by classmates to do something risky and does not know what value would help them respond wisely. Which value fits best?`,
    correct: "Assertiveness — saying no firmly and clearly to the pressure",
    wrong: [
      "Curiosity — curiosity is actually one of the causes of risky choices, not a value that avoids them",
      "Idleness — idleness is a cause of poor choices, not a helpful value",
      "Peer pressure — this is the problem itself, not a value that helps",
    ],
    explanation: "Assertiveness is the value most directly needed to firmly and clearly say no to pressure — the other options describe causes of irresponsible behaviour, not values that help avoid it.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} explains that they talk to a trusted parent whenever they feel confused or pressured about a difficult decision. Which value or life skill does this reflect?`,
    correct: "Seeking guidance from a trusted adult",
    wrong: ["Idleness, since talking to an adult wastes free time", "Low self-esteem, since asking for help shows weakness", "Curiosity, since it means exploring without any guidance"],
    explanation: "Talking openly to a trusted parent, guardian, or mentor about challenges is the value of seeking guidance — an important life skill for facing difficult decisions wisely.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads James 1:14-16 and is asked where temptation actually comes from, according to this passage. What is the correct answer?`,
    correct: "From a person's own evil desire, which entices and can grow into sin if not resisted",
    wrong: [
      "Temptation always comes entirely from other people, never from within oneself",
      "James 1:14-16 says temptation cannot ever be resisted once it begins",
      "James 1:14-16 says temptation only affects adults, not young people",
    ],
    explanation: "James 1:14 specifically says a person is tempted by their own evil desire, which entices them — the passage locates the starting point within the person, not purely from outside pressure.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sees a friend making risky choices because of pressure from an older group and low self-confidence. Which two things does this scenario show as real causes of irresponsible behaviour?`,
      correct: "Peer pressure and low self-esteem",
      wrong: ["Self-control and assertiveness", "Seeking guidance and self-respect", "Wise choice of friends and self-discipline"],
      explanation: "Peer pressure and low self-esteem are named causes of irresponsible behaviour among youth — the other options are values that help avoid it, not causes.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} composes a poem titled "My Body is the Temple of the Holy Spirit" for a CRE class assignment. What idea should this poem express, based on 1 Corinthians 6:18-20?`,
    correct: "That the body deserves respect and care because it belongs to God and houses His Spirit",
    wrong: [
      "That the body has no real spiritual significance at all",
      "That only church buildings, not the human body, can be called a temple",
      "That caring for the body is unrelated to one's faith",
    ],
    explanation: "1 Corinthians 6:19-20 teaches that the body is the temple of the Holy Spirit and should be honoured — a poem on this theme should express respect and care for the body as God-given.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that self-control has nothing to do with 2 Timothy 2:22's teaching to "pursue righteousness, faith, love and peace." Is this accurate?`,
    correct: "No — mastering one's desires (self-control) is exactly what allows a person to pursue those qualities instead of giving in to evil desires",
    wrong: [
      "Yes — 2 Timothy 2:22 has nothing to do with self-control",
      "Yes — the verse is only about faith, not about behaviour at all",
      "No — but only adults are able to practise self-control, not young people",
    ],
    explanation: "2 Timothy 2:22 pairs fleeing evil desires with pursuing righteousness, faith, love, and peace — self-control is the practical skill that makes choosing the second path possible.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} feels overwhelmed by many new feelings and physical changes and worries no one else experiences this. What is the wisest, most CRE-aligned response?`,
    correct: "Recognise these changes as a normal part of adolescence and talk about them with a trusted adult",
    wrong: [
      "Keep everything hidden and never discuss it with anyone",
      "Assume something is uniquely wrong, since no one else goes through this",
      "Ignore the feelings completely and hope they disappear",
    ],
    explanation: "This sub-strand's learning experiences specifically include discussing physical and emotional changes of adolescence and how to cope with them — normalising the experience and seeking guidance is the wise response.",
  }),
];

export const humanSexuality: Skill = {
  id: "g6-cre-cl-human-sexuality",
  code: "CL.2",
  subjectId: "cre",
  strandId: "g6-cre-living",
  grade: 6,
  title: "Human Sexuality",
  description: "Physical and emotional changes of adolescence, biblical teachings on respecting the body as the temple of the Holy Spirit (1 Corinthians 6:18-20, 2 Timothy 2:22, James 1:14-16), and values to avoid irresponsible behaviour.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank", "order"] as const);

    if (branch === "categorize") {
      const causes = shuffle(rng, FACTS.filter((f) => f.kind === "cause")).slice(0, 4);
      const values = shuffle(rng, FACTS.filter((f) => f.kind === "value")).slice(0, 4);
      const chosen = shuffle(rng, [...causes, ...values]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "cause", label: "Cause of irresponsible behaviour" },
          { id: "value", label: "Value/life skill that helps avoid it" },
        ],
        correctBucket,
        hint: "Peer pressure and low self-esteem are causes; self-control and seeking guidance are values that help avoid irresponsible behaviour.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "cause" ? "a cause of irresponsible behaviour" : "a value/life skill that helps avoid it"}.`).join(" "),
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
        hint: "Think about what each term or Bible reference means for respecting your body and making wise choices.",
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
        hint: "Think about 1 Corinthians 6:18-20, 2 Timothy 2:22, James 1:14-16, and the values that support wise choices.",
        explanation: q.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, JAMES_ORDER);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: JAMES_ORDER.map((j) => j.id),
        hint: "James 1:14-16 traces a path from desire, to enticement, to sin, to its consequences.",
        explanation: JAMES_ORDER.map((j) => j.label).join(" → "),
      };
    }

    const facts = [
      { before: "1 Corinthians 6:19 calls the body the temple of the Holy", after: ".", answer: "Spirit", accepted: ["spirit"] },
      { before: "1 Corinthians 6:20 calls believers to honour God with their", after: ".", answer: "bodies", accepted: ["bodies", "body"] },
      { before: "2 Timothy 2:22 says to flee the evil desires of", after: ".", answer: "youth", accepted: ["youth"] },
      { before: "2 Timothy 2:22 says to pursue righteousness, faith, love and", after: ".", answer: "peace", accepted: ["peace"] },
      { before: "James 1:14 says a person is tempted by their own evil", after: ".", answer: "desire", accepted: ["desire"] },
      { before: "James 1:15 says desire, when it has conceived, gives birth to", after: ".", answer: "sin", accepted: ["sin"] },
      { before: "The stage of life with physical and emotional changes as a young person grows is called", after: ".", answer: "adolescence", accepted: ["adolescence"] },
      { before: "Mastering one's desires instead of acting on every impulse is called self-", after: ".", answer: "control", accepted: ["control"] },
      { before: "Talking openly to a trusted parent or guardian about challenges is called seeking", after: ".", answer: "guidance", accepted: ["guidance"] },
      { before: "Saying no firmly and clearly to pressure from others is called", after: ".", answer: "assertiveness", accepted: ["assertiveness"] },
      { before: "Valuing one's own body as belonging to God is called self-", after: ".", answer: "respect", accepted: ["respect"] },
      { before: "This sub-strand's key values are peace and", after: ".", answer: "unity", accepted: ["unity"] },
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
      hint: "Think about 1 Corinthians 6:18-20, 2 Timothy 2:22, and James 1:14-16 on respecting your body.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
