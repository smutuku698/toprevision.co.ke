import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the events of the calming of the storm in the correct order.",
  "Put these events of the calming of the storm into their correct order.",
  "Sequence these events of the storm miracle correctly.",
  "Arrange these moments from Mark 4:35-41 in order.",
  "Order these events the way they happened in the storm account.",
  "Sort these events into the order they happened in the calming of the storm.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as 'Shows the disciples' fear' or 'Shows Jesus's power and authority'.",
  "Decide whether each statement shows fear or Jesus's power, and sort it there.",
  "Group these statements under the disciples' fear or Jesus's power and authority.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for fear or power.",
  "Read each statement and sort it under fear or Jesus's power and authority.",
];

const MATCH_PROMPTS = [
  "Match each challenge young people face today to a Christian response inspired by the calming of the storm.",
  "Pair each challenge below with a response inspired by this miracle.",
  "Connect each challenge to the Christian response it calls for.",
  "Match each challenge to the statement that shows how to respond.",
  "Link each challenge young people face to a fitting Christian response.",
  "Match each challenge to the description of how to respond in faith.",
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
  { id: "t1", label: "Jesus and the disciples get into a boat to cross to the other side (Mark 4:35)" },
  { id: "t2", label: "A furious storm arises and waves begin to swamp the boat" },
  { id: "t3", label: "Jesus is asleep in the stern, undisturbed by the storm" },
  { id: "t4", label: "The frightened disciples wake him, asking if he cares that they might drown" },
  { id: "t5", label: "Jesus rebukes the wind and says to the waves, 'Quiet! Be still!'" },
  { id: "t6", label: "The wind dies down and it becomes completely calm" },
  { id: "t7", label: "Jesus asks the disciples why they were afraid and had so little faith" },
  { id: "t8", label: "The disciples are amazed and ask what kind of man this is that even the wind and waves obey him" },
];

const FEAR_DOUBT = [
  "Woke Jesus in panic during the storm",
  "Asked, 'Don't you care if we drown?'",
  "Were still amazed and afraid even after the storm was calmed",
];
const POWER_AUTHORITY = [
  "Rebuked the wind and commanded the waves to be still",
  "The storm obeyed him immediately and became completely calm",
  "Even nature obeyed Jesus's word",
];

const CHALLENGE_TO_RESPONSE: { challenge: string; response: string }[] = [
  { challenge: "Sickness or family problems", response: "Trust that Jesus has power over every situation, just as he calmed the sea" },
  { challenge: "Fear and anxiety", response: "Bring your fears to Jesus in prayer instead of panicking alone" },
  { challenge: "Feeling like God is silent or distant", response: "Remember Jesus is present even when he seems 'asleep' in your storm" },
  { challenge: "Doubting God's care for you", response: "Recall that Jesus does care, even when circumstances feel overwhelming" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "Where were Jesus and his disciples when the storm arose?", a: "In a boat crossing the Sea of Galilee", explanation: "Mark 4:35-41 records the disciples and Jesus crossing the lake by boat when the storm struck." },
  { q: "What was Jesus doing when the storm began?", a: "Sleeping in the stern of the boat", explanation: "Mark 4:38 says Jesus was in the stern, sleeping on a cushion, while the storm raged." },
  { q: "What did Jesus say to calm the storm?", a: "'Quiet! Be still!'", explanation: "Mark 4:39 records Jesus rebuking the wind and commanding the waves with these words." },
  { q: "What did Jesus ask the disciples after calming the storm?", a: "Why they were so afraid and had so little faith", explanation: "Mark 4:40 shows Jesus using the moment to challenge the disciples' weak faith." },
  { q: "According to Psalm 91, what does God offer those who trust him?", a: "Refuge and protection from danger", explanation: "Psalm 91:1-6 describes God as a refuge and fortress for those who trust in him." },
];

const FILL_BLANKS = [
  { before: "When Jesus calmed the storm, he said to the wind and waves, 'Quiet! Be", after: "!'", answer: "still", accepted: ["still"] },
  { before: "Psalm 91 describes God as our", after: "and fortress, in whom we can trust.", answer: "refuge", accepted: ["refuge"] },
];

export const calmingTheStorm: Skill = {
  id: "g8-cre-mi-calming-the-storm",
  code: "MI.2",
  subjectId: "cre",
  strandId: "g8-cre-mi",
  grade: 8,
  title: "The Calming of the Storm",
  description: "The miracle of Jesus calming the storm and how it relates to the challenges young people face today.",
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
        hint: "Start with the boat setting out and end with the disciples' amazement.",
        explanation: TIMELINE.map((t) => t.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const fear = shuffle(rng, FEAR_DOUBT).slice(0, 2);
      const power = shuffle(rng, POWER_AUTHORITY).slice(0, 3);
      const items = shuffle(rng, [
        ...fear.map((f, i) => ({ id: `f${i}`, label: f, bucket: "fear" })),
        ...power.map((p, i) => ({ id: `p${i}`, label: p, bucket: "power" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "fear", label: "Shows the disciples' fear" },
          { id: "power", label: "Shows Jesus's power and authority" },
        ],
        correctBucket,
        hint: "The disciples reacted in fear; Jesus responded with calm authority over nature.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "fear" ? "shows the disciples' fear" : "shows Jesus's power and authority"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, CHALLENGE_TO_RESPONSE);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.challenge, label: c.challenge })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.challenge, label: c.response })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.challenge] = c.challenge;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The miracle shows that Jesus has authority over every 'storm' a person may face.",
        explanation: chosen.map((c) => `${c.challenge} — ${c.response.toLowerCase()}.`).join(" "),
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
        hint: "Recall the account of the storm in Mark 4:35-41.",
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
