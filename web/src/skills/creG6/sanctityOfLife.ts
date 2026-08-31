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
    "each statement as a practice that endangers life or a virtue that protects life.",
    "these statements into practices that endanger life or virtues that protect life.",
    "each statement below by whether it endangers life or protects life.",
    "each fact into the bucket for endangering life or protecting life.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each idea below with what it means for upholding the sanctity of life.",
    "each term about the sanctity of life to the explanation that fits it.",
    "each term to the explanation of why it matters for protecting life.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the sanctity of life.",
    "the correct missing word.",
  ],
);

const ORDER_PROMPTS = [
  "Arrange Matthew 5:23-24's instruction about reconciling before offering a gift, in order.",
  "Put these steps from Matthew 5:23-24 into their correct order.",
  "Sequence Matthew 5:23-24's teaching on reconciliation correctly.",
  "Arrange these steps about resolving anger before worship, in order.",
  "Order these steps as Matthew 5:23-24 describes them.",
  "Sort these steps into the order Matthew 5:23-24 places them.",
];

// Matthew 5:23-24's own stated sequence: remember a grievance while offering a gift, leave the gift,
// go be reconciled first, then return to offer the gift — a genuine textual order.
const RECONCILE_ORDER = [
  { id: "r1", label: "While offering a gift at the altar, remember that a brother or sister has something against you" },
  { id: "r2", label: "Leave your gift there in front of the altar" },
  { id: "r3", label: "Go and be reconciled to that brother or sister first" },
  { id: "r4", label: "Then come back and offer your gift" },
] as const;

interface Fact {
  text: string;
  kind: "endanger" | "protect";
}

const FACTS: Fact[] = [
  { text: "Crossing a busy road without checking for oncoming traffic puts a person's life at risk", kind: "endanger" },
  { text: "Physical violence and fighting between individuals or groups can cause serious harm or death", kind: "endanger" },
  { text: "Letting unresolved anger build unchecked can escalate into serious conflict or violence", kind: "endanger" },
  { text: "Ignoring traffic rules while walking or riding endangers both oneself and others", kind: "endanger" },
  { text: "Dangerous stunts or risky dares among peers can lead to serious injury or death", kind: "endanger" },
  { text: "Bullying that is allowed to continue unchecked can escalate into physical harm", kind: "endanger" },
  { text: "Observing road safety rules, like using designated pedestrian crossings, protects life", kind: "protect" },
  { text: "Practising self-control in anger helps resolve conflict before it turns violent", kind: "protect" },
  { text: "Choosing patience when facing frustration or provocation helps prevent harm", kind: "protect" },
  { text: "Helping a younger child cross the road safely shows care for others' safety", kind: "protect" },
  { text: "Respecting every person's right to live safely is a core value that protects life", kind: "protect" },
  { text: "Seeking reconciliation with someone before conflict grows helps preserve life and peace", kind: "protect" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Exodus 20:13", meaning: "One of the Ten Commandments, stating 'you shall not murder'" },
  { term: "Matthew 5:21-24", meaning: "Jesus' teaching that even unresolved anger toward another person is spiritually serious, not just murder itself" },
  { term: "Sanctity of life", meaning: "The Christian belief that human life is sacred and a gift from God, to be protected and respected" },
  { term: "Reconciliation", meaning: "Making peace with someone you have wronged or who has something against you" },
  { term: "Road safety", meaning: "Practices like using pedestrian crossings and checking for traffic that help protect life" },
  { term: "Right to life", meaning: "Every person's basic entitlement to live safely and be protected from harm" },
  { term: "Gift from God", meaning: "How the Bible describes human life, worthy of gratitude and protection" },
  { term: "Self-control", meaning: "A virtue that helps a person manage anger before it escalates into violence" },
  { term: "Patience", meaning: "A virtue that helps a person avoid reacting harmfully to frustration or provocation" },
  { term: "Virtue that protects life", meaning: "A good moral quality, such as patience or self-control, that helps keep people safe" },
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
      prompt: `${who} in ${place(rng)} is taught to always use the designated pedestrian crossing and to look both ways before crossing a busy road near school. Which value does this practice reflect?`,
      correct: "Road safety, which protects the sanctity of life",
      wrong: [
        "Reconciliation, which is about resolving conflict, not road crossing",
        "Self-control in anger, which is unrelated to road crossing",
        "This has no connection to sanctity of life teachings",
      ],
      explanation: "Observing road safety rules, such as using a designated crossing point, is one of this sub-strand's concrete ways of protecting the sanctity of life.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads Exodus 20:13 and is asked what it directly commands. What is the correct answer?`,
    correct: "You shall not murder",
    wrong: ["You shall not steal", "You shall not lie", "You shall not covet"],
    explanation: "Exodus 20:13, one of the Ten Commandments, states directly, 'You shall not murder' — the foundational biblical teaching on the sanctity of life.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} feels deep anger toward a classmate but has not acted violently on it. According to Matthew 5:21-24, why does Jesus still treat this anger as spiritually serious?`,
      correct: "Because Jesus taught that even unresolved anger toward another person matters spiritually, not just the act of murder itself",
      wrong: [
        "Because Matthew 5:21-24 says only physical violence matters, not anger at all",
        "Because feeling any emotion, including sadness, is treated the same as murder",
        "Because Matthew 5:21-24 only applies to adults, not young people",
      ],
      explanation: "Matthew 5:21-24 expands Exodus 20:13's commandment: Jesus teaches that unresolved anger toward a brother or sister is spiritually serious, not only the physical act of murder.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is about to offer a gift at church but remembers that a friend is upset with them over an unresolved disagreement. According to Matthew 5:23-24, what should ${name(rng)} do first?`,
    correct: "Leave the gift and go be reconciled with the friend before returning to offer it",
    wrong: [
      "Offer the gift first and deal with the friendship separately later",
      "Ignore the disagreement completely since gifts matter more than relationships",
      "Avoid both the gift and the friend indefinitely",
    ],
    explanation: "Matthew 5:23-24 specifically instructs leaving the gift at the altar, going to be reconciled first, and only then returning to offer the gift — reconciliation comes before worship.",
  }),
  (rng) => ({
    prompt: `A group of learners in ${place(rng)} dares each other to attempt a dangerous stunt near a busy road. What does this scenario best illustrate?`,
    correct: "A practice that endangers life through risky, unnecessary behaviour",
    wrong: [
      "A virtue that protects life, since bravery is generally admirable",
      "An example of reconciliation between friends",
      "An act that has no connection to the sanctity of life",
    ],
    explanation: "Dangerous stunts and risky dares are a real practice that endangers life — a key example this sub-strand highlights alongside road recklessness and violence.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices a younger sibling struggling to cross a busy road alone and stops to help them cross safely. Which virtue does this action reflect?`,
      correct: "Care for others' safety, which helps protect the sanctity of life",
      wrong: ["Self-control in anger, which is unrelated to helping someone cross safely", "Reconciliation, since no conflict was involved", "Curiosity about road conditions"],
      explanation: "Helping a younger child cross the road safely is a direct example of caring for others' safety — one of the virtues this sub-strand highlights as protecting life.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that as long as no one is physically murdered, a person's anger and unresolved conflicts do not matter to their faith. How does Matthew 5:21-24 respond to this claim?`,
    correct: "It disagrees — Jesus teaches that unresolved anger and broken relationships matter spiritually too, not just physical murder",
    wrong: [
      "Matthew 5:21-24 agrees that only physical murder matters spiritually",
      "Matthew 5:21-24 says anger is always sinful, with no exceptions ever mentioned",
      "Matthew 5:21-24 has nothing to say about relationships between people",
    ],
    explanation: "Matthew 5:21-24 expands the commandment against murder to include the seriousness of unresolved anger and broken relationships — faith and reconciliation with others matter together.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why the sub-strand on sanctity of life includes road safety alongside biblical teachings about murder. What is the best explanation?`,
    correct: "Because reckless behaviour on the road is a real, modern way life can be endangered, just like violence",
    wrong: [
      "Because road safety and sanctity of life are actually unrelated topics grouped together by mistake",
      "Because road safety only matters for drivers, never for pedestrians",
      "Because the Bible specifically names road safety rules in Exodus 20:13",
    ],
    explanation: "This sub-strand connects the biblical principle of protecting life to modern, practical ways life is endangered or protected today, including road safety — a concrete application of the same value.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked to state why human life is described in CRE as a gift from God. What is the correct reasoning?`,
    correct: "Because life is something given by God, not created or owned by any person, so it deserves gratitude and protection",
    wrong: [
      "Because life has no real spiritual significance at all",
      "Because only some people's lives are considered gifts from God",
      "Because life is described this way only in the Old Testament, not elsewhere",
    ],
    explanation: "Describing life as a gift from God is central to the sanctity of life teaching — it grounds why life deserves gratitude, respect, and protection from harm.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} practises role-playing how to cross a busy road safely as part of a CRE lesson. Why is this activity connected to the sanctity of life?`,
    correct: "Because practising road safety is a concrete way of protecting the right to life in daily situations",
    wrong: [
      "Because role-playing has no real connection to the value of life",
      "Because it only teaches acting skills, unrelated to CRE's content",
      "Because road safety is unrelated to any of this sub-strand's outcomes",
    ],
    explanation: "This sub-strand's own learning experiences include role-playing crossing the road safely — a hands-on way of practising the virtue of protecting life through road safety.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that letting anger build up quietly, without ever resolving it, is completely harmless. How would Matthew 5:21-24 respond?`,
    correct: "It would disagree — unresolved anger is treated as spiritually serious and can eventually lead to greater conflict",
    wrong: [
      "Matthew 5:21-24 agrees that unresolved anger is always harmless",
      "Matthew 5:21-24 says only publicly expressed anger matters, never private anger",
      "Matthew 5:21-24 has nothing to say about how anger develops over time",
    ],
    explanation: "Jesus' teaching in Matthew 5:21-24 treats unresolved anger as spiritually serious precisely because, left unaddressed, it can escalate — reconciliation is presented as the necessary response.",
  }),
];

export const sanctityOfLife: Skill = {
  id: "g6-cre-cl-sanctity-of-life",
  code: "CL.3",
  subjectId: "cre",
  strandId: "g6-cre-living",
  grade: 6,
  title: "Sanctity of Life",
  description: "Christian teachings on the sanctity of life from Exodus 20:13 and Matthew 5:21-24, practices that endanger life such as road recklessness, and virtues including road safety that protect life.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank", "order"] as const);

    if (branch === "categorize") {
      const endanger = shuffle(rng, FACTS.filter((f) => f.kind === "endanger")).slice(0, 4);
      const protect = shuffle(rng, FACTS.filter((f) => f.kind === "protect")).slice(0, 4);
      const chosen = shuffle(rng, [...endanger, ...protect]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "endanger", label: "Endangers life" },
          { id: "protect", label: "Protects life" },
        ],
        correctBucket,
        hint: "Violence and road recklessness endanger life; self-control, patience, and road safety protect it.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "endanger" ? "endangers life" : "protects life"}.`).join(" "),
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
        hint: "Think about what each term or Bible reference means for protecting and respecting life.",
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
        hint: "Think about Exodus 20:13, Matthew 5:21-24, and virtues such as road safety and self-control.",
        explanation: q.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, RECONCILE_ORDER);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: RECONCILE_ORDER.map((r) => r.id),
        hint: "Matthew 5:23-24 says to leave the gift, go be reconciled first, then return to offer it.",
        explanation: RECONCILE_ORDER.map((r) => r.label).join(" → "),
      };
    }

    const facts = [
      { before: "Exodus 20:13 commands, 'You shall not", after: ".'", answer: "murder", accepted: ["murder", "kill"] },
      { before: "Matthew 5:21-24 teaches that unresolved anger toward a brother or sister is spiritually", after: ".", answer: "serious", accepted: ["serious"] },
      { before: "Matthew 5:24 says to leave your gift at the altar and first be", after: "with your brother or sister.", answer: "reconciled", accepted: ["reconciled"] },
      { before: "Crossing a busy road without checking for traffic puts a person's life at", after: ".", answer: "risk", accepted: ["risk"] },
      { before: "Observing road safety rules, like using a pedestrian crossing, helps protect", after: ".", answer: "life", accepted: ["life"] },
      { before: "Practising self-control in anger helps prevent conflict from turning", after: ".", answer: "violent", accepted: ["violent"] },
      { before: "The Bible teaches that human life is a gift from", after: ".", answer: "God", accepted: ["god"] },
      { before: "Every person's basic entitlement to live safely is called the right to", after: ".", answer: "life", accepted: ["life"] },
      { before: "This sub-strand's key values are respect, responsibility, and", after: ".", answer: "love", accepted: ["love"] },
      { before: "Making peace with someone who has something against you is called", after: ".", answer: "reconciliation", accepted: ["reconciliation"] },
      { before: "Dangerous stunts or risky dares among peers can lead to serious", after: ".", answer: "injury", accepted: ["injury"] },
      { before: "Choosing patience when facing frustration helps prevent", after: ".", answer: "harm", accepted: ["harm"] },
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
      hint: "Think about Exodus 20:13, Matthew 5:21-24, and practices/virtues connected to protecting life.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
