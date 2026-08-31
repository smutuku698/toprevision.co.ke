import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the events of the healing of blind Bartimaeus in the correct order.",
  "Put these events of Bartimaeus's healing into their correct order.",
  "Sequence these events of the healing correctly.",
  "Arrange these moments from the story of Bartimaeus in order.",
  "Order these events the way they happened in Mark's account.",
  "Sort these events into the order they happened in the healing of Bartimaeus.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as 'Something that showed Bartimaeus's faith' or 'A challenge Bartimaeus faced'.",
  "Decide whether each statement shows faith or a challenge, and sort it there.",
  "Group these statements under showed Bartimaeus's faith or a challenge he faced.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for faith shown or challenge faced.",
  "Read each statement and sort it under faith or challenge.",
];

const MATCH_PROMPTS = [
  "Match each lesson from the healing of Bartimaeus to how it applies in daily life.",
  "Pair each lesson below with how it applies today.",
  "Connect each lesson from Bartimaeus's story to its daily-life application.",
  "Match each lesson to the statement that explains its application.",
  "Link each lesson from the healing to how it applies in life.",
  "Match each lesson to the description of how it applies today.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const TIMELINE = [
  { id: "t1", label: "Bartimaeus, a blind beggar, sits by the roadside as Jesus leaves Jericho" },
  { id: "t2", label: "He hears that Jesus of Nazareth is passing and cries out for mercy" },
  { id: "t3", label: "The crowd rebukes him, but he shouts even louder" },
  { id: "t4", label: "Jesus stops and calls Bartimaeus to come to him" },
  { id: "t5", label: "Bartimaeus throws off his cloak and comes to Jesus" },
  { id: "t6", label: "Jesus asks what he wants, and Bartimaeus asks to see" },
  { id: "t7", label: "Jesus heals him, saying his faith has healed him" },
  { id: "t8", label: "Bartimaeus receives his sight and follows Jesus on the road" },
];

const SHOWED_FAITH = [
  "Called out to Jesus as 'Son of David'",
  "Shouted even louder when the crowd told him to be quiet",
  "Threw off his cloak and rushed to Jesus",
  "Asked directly for his sight",
];
const CHALLENGES = [
  "He was blind and unable to work, so he had to beg",
  "The crowd tried to silence him",
  "He had no one to lead him straight to Jesus",
];

const LESSON_TO_APPLICATION: { lesson: string; application: string }[] = [
  { lesson: "Persistence in faith", application: "Continue seeking God's help even when others discourage you, like Bartimaeus who shouted louder" },
  { lesson: "Humility in asking for help", application: "Be willing to admit your need and ask God for help, as Bartimaeus called out for mercy" },
  { lesson: "Faith brings healing", application: "Trust that God can meet you in your challenges, as Jesus honoured Bartimaeus's faith" },
  { lesson: "Gratitude after help", application: "Respond to God's help with devotion, as Bartimaeus followed Jesus afterward" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "Where was Bartimaeus sitting when Jesus passed by?", a: "By the roadside near Jericho, begging", explanation: "Mark 10:46 records Bartimaeus as a blind beggar sitting by the roadside as Jesus left Jericho." },
  { q: "What did Bartimaeus shout to get Jesus's attention?", a: "'Jesus, Son of David, have mercy on me!'", explanation: "Mark 10:47-48 records Bartimaeus crying out this appeal despite the crowd's rebuke." },
  { q: "How did the crowd react to Bartimaeus at first?", a: "They rebuked him and told him to be quiet", explanation: "Mark 10:48 says many rebuked him, telling him to be quiet, but he shouted all the louder." },
  { q: "What did Jesus say healed Bartimaeus?", a: "His faith", explanation: "Mark 10:52 records Jesus saying, 'Go, your faith has healed you.'" },
  { q: "What did Bartimaeus do right after receiving his sight?", a: "He followed Jesus along the road", explanation: "Mark 10:52 says immediately he received his sight and followed Jesus along the road." },
];

const FILL_BLANKS = [
  { before: "When the crowd told Bartimaeus to be quiet, he shouted all the", after: ".", answer: "louder", accepted: ["louder"] },
  { before: "Jesus told Bartimaeus, 'Go, your", after: "has healed you.'", answer: "faith", accepted: ["faith"] },
];

export const healingOfBlindBartimaeus: Skill = {
  id: "g8-cre-mi-healing-of-blind-bartimaeus",
  code: "MI.1",
  subjectId: "cre",
  strandId: "g8-cre-mi",
  grade: 8,
  title: "The Healing of Blind Bartimaeus",
  description: "The miracle of the healing of blind Bartimaeus and lessons on faith when facing health challenges.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "recall", "blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, TIMELINE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: TIMELINE.map((t) => t.id),
        hint: "Start with Bartimaeus sitting by the roadside and end with him following Jesus.",
        explanation: TIMELINE.map((t) => t.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const faith = shuffle(rng, SHOWED_FAITH).slice(0, 3);
      const challenge = shuffle(rng, CHALLENGES).slice(0, 2);
      const items = shuffle(rng, [
        ...faith.map((f, i) => ({ id: `f${i}`, label: f, bucket: "faith" })),
        ...challenge.map((c, i) => ({ id: `c${i}`, label: c, bucket: "challenge" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "faith", label: "Showed Bartimaeus's faith" },
          { id: "challenge", label: "A challenge Bartimaeus faced" },
        ],
        correctBucket,
        hint: "Faith is what Bartimaeus did in response; challenges are the obstacles he faced.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "faith" ? "showed his faith" : "a challenge he faced"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, LESSON_TO_APPLICATION);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.lesson, label: c.lesson })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.lesson, label: c.application })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.lesson] = c.lesson;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about how Bartimaeus's response to Jesus can guide someone facing their own challenges.",
        explanation: chosen.map((c) => `${c.lesson} — ${c.application.toLowerCase()}.`).join(" "),
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
        hint: "Recall the account of the healing in Mark 10:46-52.",
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
