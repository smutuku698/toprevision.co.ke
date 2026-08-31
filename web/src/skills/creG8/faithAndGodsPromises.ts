import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CATEGORIZE_PROMPTS = [
  "Sort each statement as 'An act of Abraham's faith' or 'A promise God made to Abraham'.",
  "Decide whether each statement is an act of faith or a promise, and sort it there.",
  "Group these statements under act of faith or promise from God.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for act of faith or promise.",
  "Read each statement and sort it under act of faith or promise.",
];

const ORDER_PROMPTS = [
  "Arrange the key events in Abraham's story of faith in the correct order.",
  "Put these events from Abraham's story into their correct order.",
  "Sequence these events of Abraham's faith journey correctly.",
  "Arrange these moments from Abraham's story in order.",
  "Order these events the way they happened in Abraham's life.",
  "Sort these events into the order they happened in Abraham's story.",
];

const MATCH_PROMPTS = [
  "Match each act of Abraham to what it shows about applying faith in different situations.",
  "Pair each act of Abraham below with what it teaches about faith.",
  "Connect each act of Abraham to the lesson about faith it shows.",
  "Match each act to the statement that explains what it shows about faith.",
  "Link each act of Abraham to what it reveals about applying faith.",
  "Match each act to the description of the faith it demonstrates.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const ACTS_OF_FAITH = [
  "Left his home country without knowing the destination (Genesis 12:1-3)",
  "Believed God's promise of descendants as numerous as the stars (Genesis 15:1-6)",
  "Trusted God's promise of a son even though he and Sarah were very old (Genesis 17:15-21)",
  "Was willing to offer Isaac as a sacrifice in obedience to God (Genesis 22:1-19)",
];
const PROMISES_TO_ABRAHAM = [
  "To make Abraham into a great nation",
  "To bless all peoples on earth through Abraham",
  "To give Abraham's descendants the land of Canaan",
  "To make Abraham's descendants as numerous as the stars in the sky",
];

const TIMELINE = [
  { id: "t1", label: "God calls Abram to leave Haran for a land he will show him (Genesis 12:1-3)" },
  { id: "t2", label: "God promises Abram descendants as numerous as the stars (Genesis 15:1-6)" },
  { id: "t3", label: "God renews the covenant, changing his name to Abraham (Genesis 17:1-8)" },
  { id: "t4", label: "Isaac, the promised son, is born to Abraham and Sarah (Genesis 21:1-7)" },
  { id: "t5", label: "God tests Abraham's faith by asking him to sacrifice Isaac (Genesis 22:1-19)" },
];

const ACT_TO_MEANING: { act: string; meaning: string }[] = [
  { act: "Leaving Haran", meaning: "Trusting God enough to go to an unknown land, guided only by God's word" },
  { act: "Believing the promise of many descendants", meaning: "Trusting God's word even when the promise seemed impossible" },
  { act: "Waiting for Isaac in old age", meaning: "Continuing to trust God's timing, even after many years of waiting" },
  { act: "Offering Isaac at Moriah", meaning: "Obeying God fully, even when the request was extremely costly" },
  { act: "Accepting circumcision", meaning: "Obeying God's instruction as a sign of belonging to the covenant" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "How does Hebrews 11:1 define faith?", a: "Being sure of what we hope for and certain of what we do not see", explanation: "Hebrews 11:1 gives this classic definition of faith, which Abraham exemplifies through his life." },
  { q: "From where did God call Abram to begin his journey of faith?", a: "Haran", explanation: "Genesis 12:1-4 records that God called Abram to leave his country, people, and household in Haran." },
  { q: "How did Abraham show faith at Mount Moriah?", a: "He was willing to sacrifice his only son Isaac in obedience", explanation: "Genesis 22:1-19 shows Abraham's willingness to obey God even at great personal cost." },
  { q: "What did Genesis 15:6 say about Abram's belief in God's promise?", a: "It was credited to him as righteousness", explanation: "Abram believed the Lord, and it was credited to him as righteousness — a model of saving faith." },
  { q: "How do you apply God's promises in daily life, as Abraham modelled?", a: "By trusting and obeying God even when circumstances seem impossible", explanation: "Like Abraham, Christians are called to hold onto God's promises with faith and obedient action." },
];

const FILL_BLANKS = [
  { before: "Hebrews 11:1 says faith is being sure of what we", after: "for and certain of what we do not see.", answer: "hope", accepted: ["hope"] },
  { before: "God told Abram to leave his country and go to the", after: "God would show him.", answer: "land", accepted: ["land"] },
];

export const faithAndGodsPromises: Skill = {
  id: "g8-cre-bi-faith-and-gods-promises",
  code: "BI.1",
  subjectId: "cre",
  strandId: "g8-cre-bi",
  grade: 8,
  title: "Faith and God's Promises",
  description: "The call of Abraham, how he demonstrated faith in God, and the promises God made to him.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "order", "match", "recall", "blank"] as const);

    if (branch === "categorize") {
      const acts = shuffle(rng, ACTS_OF_FAITH).slice(0, 3);
      const promises = shuffle(rng, PROMISES_TO_ABRAHAM).slice(0, 3);
      const items = shuffle(rng, [
        ...acts.map((a, i) => ({ id: `a${i}`, label: a, bucket: "faith" })),
        ...promises.map((p, i) => ({ id: `p${i}`, label: p, bucket: "promise" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "faith", label: "An act of Abraham's faith" },
          { id: "promise", label: "A promise God made to Abraham" },
        ],
        correctBucket,
        hint: "Acts of faith are things Abraham did in response to God; promises are things God pledged to do for him.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "faith" ? "an act of Abraham's faith" : "a promise God made to Abraham"}.`).join(" "),
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
        hint: "Start with God's call to leave Haran and end with the test at Mount Moriah.",
        explanation: TIMELINE.map((t) => t.label).join(" → "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, ACT_TO_MEANING).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.act, label: c.act })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.act, label: c.meaning })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.act] = c.act;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Each act of Abraham shows faith applied to a different kind of challenge.",
        explanation: chosen.map((c) => `${c.act} — ${c.meaning.toLowerCase()}.`).join(" "),
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
        hint: "Recall Abraham's story from Genesis and how it is described in Hebrews 11.",
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
