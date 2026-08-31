import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each term to what it means.",
  "Pair each term below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each term to the statement that explains it.",
  "Link each term below to its correct definition.",
  "Match each term to the description that fits it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each characteristic as belonging to 'The Abrahamic covenant' or 'An ungodly covenant today'.",
  "Decide whether each characteristic belongs to the Abrahamic or an ungodly covenant, and sort it there.",
  "Group these characteristics under the Abrahamic covenant or an ungodly covenant.",
  "Sort each characteristic below into the correct category.",
  "Place each characteristic into the bucket for godly or ungodly covenant.",
  "Read each characteristic and sort it under the correct kind of covenant.",
];

const ORDER_PROMPTS = [
  "Arrange the events of the Abrahamic covenant in the correct order.",
  "Put these events of the Abrahamic covenant into their correct order.",
  "Sequence these events of the covenant correctly.",
  "Arrange these moments from the Abrahamic covenant in order.",
  "Order these events the way they happened in Abraham's covenant story.",
  "Sort these events into the order they happened in the Abrahamic covenant.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Covenant", meaning: "A solemn agreement or promise made between two parties, often sealed with a sign" },
  { term: "Circumcision", meaning: "Cutting away the foreskin — the physical sign of God's covenant with Abraham's descendants" },
  { term: "Ungodly covenant", meaning: "An agreement that leads a person away from God, such as a cult oath or occult pact" },
  { term: "Discernment", meaning: "The ability to recognise the difference between godly and ungodly practices" },
  { term: "False prophet", meaning: "One who claims to speak for God but leads people astray (Matthew 7:15-20)" },
];

const GODLY_TRAITS = [
  "Made directly by God, sealed with the sign of circumcision",
  "Promises blessing to Abraham and his descendants",
  "Requires faith and obedience to God",
  "Meant to bless all nations on earth through Abraham",
];
const UNGODLY_TRAITS = [
  "Involves secret oaths that bind a person to a cult or occult group",
  "Promises quick wealth or power in exchange for loyalty to evil",
  "Leads a person away from God and Christian teaching",
  "Is often sealed with practices that contradict the Bible",
];

const TIMELINE = [
  { id: "t1", label: "God makes a covenant with Abram, promising land and descendants (Genesis 15:1-18)" },
  { id: "t2", label: "God renews the covenant and gives circumcision as its sign (Genesis 17:1-14)" },
  { id: "t3", label: "Abraham circumcises himself and all the males of his household in obedience" },
  { id: "t4", label: "God's covenant promise is carried forward through Isaac and his descendants" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "What sign did God give Abraham as a mark of the covenant?", a: "Circumcision", explanation: "Genesis 17:1-14 records circumcision as the physical sign of God's covenant with Abraham's descendants." },
  { q: "What did God promise Abraham in the covenant of Genesis 15?", a: "Land for his descendants and offspring as numerous as the stars", explanation: "Genesis 15:1-18 describes God's covenant promise of land and countless descendants." },
  { q: "According to James 4:7, what should Christians do to resist the devil?", a: "Submit to God, and the devil will flee", explanation: "James 4:7 teaches submission to God as the way to resist and overcome the devil." },
  { q: "According to 1 Peter 5:8-9, what warning is given about Satan?", a: "He prowls around like a roaring lion seeking someone to devour", explanation: "1 Peter 5:8-9 warns believers to be alert and to resist the devil, standing firm in the faith." },
  { q: "What does Matthew 7:15-20 warn about false prophets?", a: "They can be recognised by their fruit (actions)", explanation: "Jesus taught that false prophets appear harmless but are known by the bad fruit their lives produce." },
];

const FILL_BLANKS = [
  { before: "Genesis 17 gives", after: "as the sign of God's covenant with Abraham and his descendants.", answer: "circumcision", accepted: ["circumcision"] },
  { before: "James 4:7 says: Submit yourselves to God. Resist the devil, and he will", after: "from you.", answer: "flee", accepted: ["flee"] },
];

export const abrahamicCovenant: Skill = {
  id: "g8-cre-bi-abrahamic-covenant",
  code: "BI.2",
  subjectId: "cre",
  strandId: "g8-cre-bi",
  grade: 8,
  title: "The Abrahamic Covenant",
  description: "The covenant God made with Abraham, the importance of circumcision, and how to discern ungodly covenants today.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "recall", "blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 4);
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
        hint: "Covenants can be godly, like Abraham's, or ungodly, leading people away from God.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const godly = shuffle(rng, GODLY_TRAITS).slice(0, 3);
      const ungodly = shuffle(rng, UNGODLY_TRAITS).slice(0, 3);
      const items = shuffle(rng, [
        ...godly.map((g, i) => ({ id: `g${i}`, label: g, bucket: "godly" })),
        ...ungodly.map((u, i) => ({ id: `u${i}`, label: u, bucket: "ungodly" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "godly", label: "The Abrahamic covenant" },
          { id: "ungodly", label: "An ungodly covenant today" },
        ],
        correctBucket,
        hint: "Godly covenants draw a person closer to God; ungodly covenants pull a person away from him.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "godly" ? "characteristic of the Abrahamic covenant" : "characteristic of an ungodly covenant"}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, TIMELINE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: TIMELINE.map((t) => t.id),
        hint: "The covenant is first made, then given its sign, then obeyed, then carried forward.",
        explanation: TIMELINE.map((t) => t.label).join(" → "),
      };
    }

    if (branch === "recall") {
      const target = randChoice(rng, FACTS);
      const distractors = shuffle(rng, FACTS.filter((f) => f.a !== target.a)).slice(0, 3).map((f) => f.a);
      const choices = shuffle(rng, [target.a, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: target.q,
        choices,
        correctIndex: choices.indexOf(target.a),
        layout: "list",
        hint: "Recall the terms of God's covenant with Abraham and how to resist ungodly influence.",
        explanation: target.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS)(fb.before, fb.after),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: fb.accepted,
      inputMode: "text",
      hint: "Think about the exact wording of the scripture.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
