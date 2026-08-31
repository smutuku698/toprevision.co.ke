import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CATEGORIZE_PROMPTS = [
  "Sort each statement as 'A reason for kingship in Israel' or 'A reason against kingship in Israel'.",
  "Decide whether each statement is a reason for or against kingship, and sort it there.",
  "Group these statements under reasons for kingship or reasons against kingship.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for or against kingship.",
  "Read each statement and sort it under for or against kingship in Israel.",
];

const ORDER_PROMPTS = [
  "Arrange the events of King Saul's rise and fall in the correct order.",
  "Put these events of King Saul's story into their correct order.",
  "Sequence these events of Saul's rise and fall correctly.",
  "Arrange these moments from King Saul's story in order.",
  "Order these events the way they happened in Saul's reign.",
  "Sort these events into the order they happened in King Saul's story.",
];

const MATCH_PROMPTS = [
  "Match each failure of King Saul to the lesson it teaches about leadership.",
  "Pair each failure of Saul below with the leadership lesson it teaches.",
  "Connect each failure of Saul to the lesson about leadership it shows.",
  "Match each failure to the statement that explains its lesson.",
  "Link each failure of Saul to what it reveals about leadership.",
  "Match each failure to the description of the lesson it teaches.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const FOR_KINGSHIP = [
  "The people wanted to be like other surrounding nations",
  "Samuel's sons were corrupt and unjust judges",
  "The people wanted a strong leader to lead them in battle",
];
const AGAINST_KINGSHIP = [
  "A king would take their sons for his army and chariots",
  "A king would take their daughters as cooks and bakers",
  "A king would tax their harvests and flocks heavily",
  "Choosing a king could mean rejecting God as their true king",
];

const TIMELINE = [
  { id: "t1", label: "The Israelite elders ask Samuel to appoint a king for them (1 Samuel 8:1-20)" },
  { id: "t2", label: "Samuel warns the people what a king will do, but they insist" },
  { id: "t3", label: "Samuel anoints Saul as the first king of Israel" },
  { id: "t4", label: "Saul disobeys God by offering an unlawful sacrifice at Gilgal (1 Samuel 13:8-14)" },
  { id: "t5", label: "Saul again disobeys by sparing King Agag and the best Amalekite livestock (1 Samuel 15:7-25)" },
  { id: "t6", label: "Samuel tells Saul that God has rejected him as king because of his disobedience" },
];

const FAILURE_TO_LESSON: { failure: string; lesson: string }[] = [
  { failure: "Offered sacrifice himself at Gilgal instead of waiting for Samuel", lesson: "A leader must obey God's instructions exactly, not act out of impatience" },
  { failure: "Disobeyed God's command to destroy the Amalekites completely", lesson: "Partial obedience is still disobedience in God's eyes" },
  { failure: "Blamed the people and circumstances instead of taking responsibility", lesson: "A good leader takes responsibility for their own actions" },
  { failure: "Valued the people's opinion over God's clear command", lesson: "A God-fearing leader puts obedience to God above popularity" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "Who anointed Saul as the first king of Israel?", a: "The prophet Samuel", explanation: "1 Samuel 8-10 records Samuel anointing Saul as Israel's first king at God's instruction." },
  { q: "What sin did Saul commit at Gilgal?", a: "He offered a sacrifice himself instead of waiting for Samuel", explanation: "1 Samuel 13:8-14 records Saul's impatient disobedience, which cost him God's favour." },
  { q: "What command did Saul disobey regarding the Amalekites?", a: "He was told to destroy everything but spared King Agag and the best livestock", explanation: "1 Samuel 15:7-25 shows Saul's partial obedience, which God counted as rebellion." },
  { q: "What was the ultimate consequence of Saul's repeated disobedience?", a: "God rejected him as king", explanation: "Because of his disobedience, Saul's kingdom was eventually taken and given to another, more obedient leader." },
];

const FILL_BLANKS = [
  { before: "1 Samuel 15 records that Saul disobeyed God by sparing King", after: "and the best of the Amalekite livestock.", answer: "Agag", accepted: ["agag"] },
  { before: "The Israelites asked Samuel for a king because they wanted to be like other", after: ".", answer: "nations", accepted: ["nations"] },
];

export const leadershipInIsraelSaul: Skill = {
  id: "g8-cre-bi-leadership-in-israel-saul",
  code: "BI.3",
  subjectId: "cre",
  strandId: "g8-cre-bi",
  grade: 8,
  title: "Leadership in Israel: King Saul",
  description: "Reasons for and against kingship in Israel, King Saul's failures, and lessons for God-fearing leadership today.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "order", "match", "recall", "blank"] as const);

    if (branch === "categorize") {
      const forK = shuffle(rng, FOR_KINGSHIP).slice(0, 2);
      const against = shuffle(rng, AGAINST_KINGSHIP).slice(0, 3);
      const items = shuffle(rng, [
        ...forK.map((f, i) => ({ id: `f${i}`, label: f, bucket: "for" })),
        ...against.map((a, i) => ({ id: `a${i}`, label: a, bucket: "against" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "for", label: "A reason for kingship in Israel" },
          { id: "against", label: "A reason against kingship in Israel" },
        ],
        correctBucket,
        hint: "1 Samuel 8 records both why the people wanted a king and Samuel's warnings against it.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "for" ? "a reason for kingship" : "a reason against kingship"}.`).join(" "),
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
        hint: "Start with the people's request for a king and end with Samuel announcing God's rejection of Saul.",
        explanation: TIMELINE.map((t) => t.label).join(" → "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, FAILURE_TO_LESSON).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.failure, label: c.failure })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.failure, label: c.lesson })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.failure] = c.failure;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Each failure of Saul's teaches a lesson about what a God-fearing leader should do differently.",
        explanation: chosen.map((c) => `${c.failure} — teaches that ${c.lesson.toLowerCase()}.`).join(" "),
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
        hint: "Recall the story of King Saul's disobedience in 1 Samuel.",
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
