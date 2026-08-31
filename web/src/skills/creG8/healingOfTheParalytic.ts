import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the events of the healing of the paralytic in the correct order.",
  "Put these events of the healing of the paralytic into their correct order.",
  "Sequence these events of this miracle correctly.",
  "Arrange these moments from Luke 5:17-26 in order.",
  "Order these events the way they happened in the paralytic's healing.",
  "Sort these events into the order they happened in this account.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as 'Shows the friends' faith and effort' or 'Shows the Pharisees' opposition'.",
  "Decide whether each statement shows faith or opposition, and sort it there.",
  "Group these statements under the friends' faith and effort or the Pharisees' opposition.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for faith or opposition.",
  "Read each statement and sort it under faith and effort or opposition.",
];

const MATCH_PROMPTS = [
  "Match each lesson from the healing of the paralytic to how it applies in daily life.",
  "Pair each lesson below with how it applies today.",
  "Connect each lesson from this healing to its daily-life application.",
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
  { id: "t1", label: "Jesus is teaching in a crowded house with Pharisees and teachers of the law present" },
  { id: "t2", label: "Some men carry a paralysed friend on a mat, hoping Jesus will heal him" },
  { id: "t3", label: "Unable to get through the crowd, they climb onto the roof and lower him through the tiles" },
  { id: "t4", label: "Jesus sees their faith and tells the man his sins are forgiven" },
  { id: "t5", label: "The Pharisees accuse Jesus in their hearts of blasphemy" },
  { id: "t6", label: "Jesus heals the man physically to prove his authority to forgive sins" },
  { id: "t7", label: "The man immediately stands, picks up his mat, and goes home praising God" },
  { id: "t8", label: "Everyone present is amazed and gives praise to God" },
];

const FRIENDS_FAITH = [
  "Carried their paralysed friend on a mat to find Jesus",
  "Climbed onto the roof when they could not get through the crowd",
  "Dug through the roof tiles and lowered the man down to Jesus",
];
const OPPOSITION = [
  "Accused Jesus of blasphemy in their hearts",
  "Believed only God could forgive sins, and doubted Jesus's authority",
  "Questioned who Jesus thought he was to speak such words",
];

const LESSON_TO_APPLICATION: { lesson: string; application: string }[] = [
  { lesson: "Faith of friends can bring healing to others", application: "Support and pray for others in their time of need, like the friends who carried the paralytic" },
  { lesson: "Determination overcomes obstacles", application: "Do not give up when facing barriers, like the friends who climbed the roof" },
  { lesson: "Jesus has authority over sin and sickness", application: "Trust that Jesus can address both spiritual and physical needs" },
  { lesson: "Gratitude glorifies God", application: "Respond to God's help with praise, like the healed man who went home praising God" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "How did the paralytic's friends bring him to Jesus when the house was too crowded?", a: "They lowered him through the roof on his mat", explanation: "Luke 5:19 records the men digging through the roof tiles to lower their friend to Jesus." },
  { q: "What did Jesus first say to the paralysed man?", a: "'Friend, your sins are forgiven'", explanation: "Luke 5:20 records Jesus first addressing the man's spiritual need before his physical healing." },
  { q: "How did the Pharisees and teachers of the law react to this?", a: "They accused Jesus of blasphemy", explanation: "Luke 5:21 records the religious leaders questioning who could forgive sins but God alone." },
  { q: "What did Jesus do to prove his authority to forgive sins?", a: "He healed the man physically and told him to get up and walk", explanation: "Luke 5:24-25 shows Jesus proving his spiritual authority through a visible physical healing." },
  { q: "What did the healed man do after being healed?", a: "He got up, took his mat, and went home praising God", explanation: "Luke 5:25 records the man's immediate obedience and grateful response." },
];

const FILL_BLANKS = [
  { before: "Because of the crowd, the paralytic's friends lowered him through the", after: "on his mat.", answer: "roof", accepted: ["roof"] },
  { before: "Isaiah 53:5 says that by his wounds we are", after: ".", answer: "healed", accepted: ["healed"] },
];

export const healingOfTheParalytic: Skill = {
  id: "g8-cre-mi-healing-of-the-paralytic",
  code: "MI.3",
  subjectId: "cre",
  strandId: "g8-cre-mi",
  grade: 8,
  title: "The Healing of the Paralytic",
  description: "The healing of the paralytic, the opposition from the Pharisees, and lessons about faith and Jesus's authority.",
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
        hint: "Start with Jesus teaching in the crowded house and end with everyone praising God.",
        explanation: TIMELINE.map((t) => t.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const faith = shuffle(rng, FRIENDS_FAITH);
      const opp = shuffle(rng, OPPOSITION);
      const items = shuffle(rng, [
        ...faith.map((f, i) => ({ id: `f${i}`, label: f, bucket: "faith" })),
        ...opp.map((o, i) => ({ id: `o${i}`, label: o, bucket: "opposition" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "faith", label: "Shows the friends' faith and effort" },
          { id: "opposition", label: "Shows the Pharisees' opposition" },
        ],
        correctBucket,
        hint: "The friends acted in faith to bring their friend to Jesus; the Pharisees reacted with doubt and accusation.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "faith" ? "shows the friends' faith and effort" : "shows the Pharisees' opposition"}.`).join(" "),
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
        hint: "Think about what the friends' actions and Jesus's response each teach us.",
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
        hint: "Recall the account of the healing in Luke 5:17-26.",
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
