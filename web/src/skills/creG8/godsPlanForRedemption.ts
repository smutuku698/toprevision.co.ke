import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each Bible reference to what it teaches about God's plan for redemption.",
  "Pair each reference below with the teaching it describes.",
  "Connect each Bible reference to what it teaches about redemption.",
  "Match each reference to the statement that explains it.",
  "Link each Bible reference to its teaching on God's redemption plan.",
  "Match each reference to the description that fits it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each scripture as 'A promise of a Saviour' or 'The fulfilment of salvation through Jesus'.",
  "Decide whether each scripture is a promise or a fulfilment, and sort it there.",
  "Group these scriptures under promise of a Saviour or fulfilment through Jesus.",
  "Sort each scripture below into the correct category.",
  "Place each scripture into the bucket for promise or fulfilment.",
  "Read each scripture and sort it under promise or fulfilment.",
];

const ORDER_PROMPTS = [
  "Arrange God's plan of redemption in the order it unfolds through the Bible.",
  "Put these stages of God's redemption plan into their correct order.",
  "Sequence God's plan of redemption correctly.",
  "Arrange these stages of the Bible's story of redemption in order.",
  "Order these events the way God's plan of redemption unfolds.",
  "Sort these stages into the order they happen in the Bible's story of redemption.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const REFERENCES: { ref: string; teaching: string }[] = [
  { ref: "Genesis 3:15", teaching: "God promises that the offspring of the woman will crush the serpent's head — the first promise of a Saviour" },
  { ref: "Genesis 12:1-3", teaching: "God promises Abraham that through his offspring all nations on earth will be blessed" },
  { ref: "Isaiah 53:5-12", teaching: "Prophesies that the Messiah would suffer and be punished for the sins of others" },
  { ref: "John 3:16", teaching: "God loved the world so much that he gave his only Son, so that whoever believes in him has eternal life" },
  { ref: "Galatians 1:3-5", teaching: "Jesus gave himself for our sins to rescue us from the present evil age" },
  { ref: "Ephesians 1:7", teaching: "Through Jesus's blood, believers have redemption, the forgiveness of sins" },
  { ref: "2 Peter 3:9", teaching: "God is patient, not wanting anyone to perish but everyone to come to repentance" },
  { ref: "Colossians 1:13-14", teaching: "God rescued believers from darkness into the kingdom of his Son, in whom we have redemption" },
];

const PROMISE_STAGE = [
  "Genesis 3:15 — the offspring of the woman will crush the serpent's head",
  "Genesis 12:1-3 — through Abraham's offspring all nations will be blessed",
  "Isaiah 53:5-12 — a suffering servant will bear the sins of many",
];
const FULFILMENT_STAGE = [
  "John 3:16 — God gave his Son so whoever believes has eternal life",
  "Ephesians 1:7 — redemption and forgiveness through Jesus's blood",
  "Colossians 1:13-14 — believers are rescued from darkness into the Son's kingdom",
  "Galatians 1:3-5 — Jesus gave himself for our sins",
];

const TIMELINE = [
  { id: "t1", label: "God promises in Eden that the woman's offspring will crush the serpent (Genesis 3:15)" },
  { id: "t2", label: "God calls Abraham and promises all nations will be blessed through him (Genesis 12:1-3)" },
  { id: "t3", label: "The prophet Isaiah foretells a suffering servant who will bear the sins of many (Isaiah 53)" },
  { id: "t4", label: "God sends his Son Jesus Christ into the world out of love (John 3:16)" },
  { id: "t5", label: "Jesus dies, and through his blood believers receive forgiveness and redemption (Ephesians 1:7)" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "Why does God's redemptive plan matter to humankind?", a: "It restores the relationship with God that sin broke", explanation: "Redemption reconciles humankind to God, undoing the separation caused by sin at the fall." },
  { q: "What does 'redemption' mean in Christian teaching?", a: "Being set free from the penalty of sin through Jesus's sacrifice", explanation: "Ephesians 1:7 shows redemption comes through Jesus's blood — the forgiveness of sins." },
  { q: "According to 2 Peter 3:9, why is God patient with sinners?", a: "He wants everyone to come to repentance, not perish", explanation: "2 Peter 3:9 says God is patient, not wanting anyone to perish but all to reach repentance." },
  { q: "What promise did God make to Abraham in Genesis 12:1-3?", a: "That all nations on earth would be blessed through his offspring", explanation: "This promise is part of how God's plan of redemption is fulfilled through Abraham's line, ultimately in Jesus." },
];

const FILL_BLANKS = [
  { before: "John 3:16 says God so loved the world that he gave his only", after: ", so that whoever believes in him shall not perish but have eternal life.", answer: "Son", accepted: ["son"] },
  { before: "Ephesians 1:7 says that through Jesus's blood we have", after: ", the forgiveness of sins.", answer: "redemption", accepted: ["redemption"] },
];

export const godsPlanForRedemption: Skill = {
  id: "g8-cre-cn-gods-plan-for-redemption",
  code: "CN.2",
  subjectId: "cre",
  strandId: "g8-cre-cn",
  grade: 8,
  title: "God's Plan for Redemption",
  description: "How God demonstrated love after the fall of man and fulfilled his plan of salvation through Jesus Christ.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "recall", "blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, REFERENCES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.ref, label: r.ref })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.ref, label: r.teaching })));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.ref] = r.ref;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Some references show God's promise of a Saviour, others show that promise fulfilled through Jesus.",
        explanation: chosen.map((r) => `${r.ref} — ${r.teaching.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const promises = shuffle(rng, PROMISE_STAGE).slice(0, 2);
      const fulfilments = shuffle(rng, FULFILMENT_STAGE).slice(0, 3);
      const items = shuffle(rng, [
        ...promises.map((p, i) => ({ id: `p${i}`, label: p, bucket: "promise" })),
        ...fulfilments.map((f, i) => ({ id: `f${i}`, label: f, bucket: "fulfilment" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "promise", label: "A promise of a Saviour" },
          { id: "fulfilment", label: "The fulfilment of salvation through Jesus" },
        ],
        correctBucket,
        hint: "Promises come from the Old Testament looking forward; fulfilment texts describe what Jesus actually did.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "promise" ? "a promise of a Saviour" : "fulfilment of salvation through Jesus"}.`).join(" "),
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
        hint: "Start with the earliest promise in Eden and end with the fulfilment through Jesus's death.",
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
        hint: "Think about why humankind needed God's saving plan after the fall.",
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
