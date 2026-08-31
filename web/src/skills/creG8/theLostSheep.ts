import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the events of the parable of the lost sheep in the correct order.",
  "Put these events of the lost sheep parable into their correct order.",
  "Sequence these events of the parable correctly.",
  "Arrange these moments from Luke 15:1-7 in order.",
  "Order these events the way they happened in the parable.",
  "Sort these events into the order they happened in the lost sheep story.",
];

const MATCH_PROMPTS = [
  "Match each element of the parable to what it represents.",
  "Pair each element below with what it represents.",
  "Connect each element of the parable to its meaning.",
  "Match each element to the statement that explains it.",
  "Link each element of the parable to what it symbolises.",
  "Match each element to the description of what it represents.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as 'Shows God's love for the sinner' or 'Shows the Pharisees' attitude'.",
  "Decide whether each statement shows God's love or the Pharisees' attitude, and sort it there.",
  "Group these statements under God's love for the sinner or the Pharisees' attitude.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for God's love or the Pharisees' attitude.",
  "Read each statement and sort it under God's love or the Pharisees' attitude.",
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
  { id: "t1", label: "A shepherd has a hundred sheep, and one wanders off and gets lost" },
  { id: "t2", label: "He leaves the ninety-nine in the open country to search for the lost one" },
  { id: "t3", label: "He keeps looking until he finds the lost sheep" },
  { id: "t4", label: "He joyfully carries it home on his shoulders" },
  { id: "t5", label: "He calls his friends and neighbours together to celebrate" },
  { id: "t6", label: "Jesus explains that heaven rejoices in the same way over one sinner who repents" },
];

const SYMBOLS: { element: string; meaning: string }[] = [
  { element: "The lost sheep", meaning: "A sinner who has strayed from God" },
  { element: "The shepherd", meaning: "God, who actively seeks out the lost" },
  { element: "The ninety-nine sheep", meaning: "Those who are already right with God" },
  { element: "The rejoicing and celebration", meaning: "The joy in heaven when a sinner repents" },
  { element: "The Pharisees' complaint", meaning: "Human judgment of those who reach out to sinners" },
];

const GODS_LOVE = [
  "The shepherd searches diligently until he finds the lost sheep",
  "The shepherd rejoices and celebrates finding what was lost",
  "Heaven rejoices more over one repentant sinner than over ninety-nine who need no repentance",
];
const PHARISEES_ATTITUDE = [
  "Complained that Jesus welcomed and ate with sinners",
  "Considered themselves already righteous, with no need to repent",
  "Looked down on tax collectors and sinners",
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "How many sheep did the shepherd in the parable have in total?", a: "One hundred", explanation: "Luke 15:4 describes a shepherd with a hundred sheep, one of which goes missing." },
  { q: "What did the shepherd do when he realised one sheep was missing?", a: "He left the ninety-nine to search for the lost one until he found it", explanation: "Luke 15:4 shows the shepherd's determination to find even a single lost sheep." },
  { q: "What did the shepherd do when he found the lost sheep?", a: "He joyfully carried it home on his shoulders", explanation: "Luke 15:5 records the shepherd's joyful response upon finding what was lost." },
  { q: "Who was Jesus addressing when he told this parable?", a: "Pharisees and teachers of the law who complained he welcomed sinners", explanation: "Luke 15:1-2 sets the scene of Jesus responding to religious leaders' criticism." },
  { q: "What should Christians do in response to this parable's message?", a: "Reach out to and share God's love with the lost", explanation: "The parable calls believers to actively seek out and welcome those who have strayed, just as the shepherd did." },
];

const FILL_BLANKS = [
  { before: "In the parable, the shepherd leaves the ninety-", after: "sheep to search for the one that is lost.", answer: "nine", accepted: ["nine"] },
  { before: "Jesus said there is more joy in heaven over one sinner who", after: "than over ninety-nine who do not need to repent.", answer: "repents", accepted: ["repents"] },
];

export const theLostSheep: Skill = {
  id: "g8-cre-te-the-lost-sheep",
  code: "TE.2",
  subjectId: "cre",
  strandId: "g8-cre-te",
  grade: 8,
  title: "The Parable of the Lost Sheep",
  description: "The parable of the lost sheep and how it portrays God's love for the sinner and calls Christians to evangelism.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "match", "categorize", "recall", "blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, TIMELINE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: TIMELINE.map((t) => t.id),
        hint: "Start with the sheep going missing and end with Jesus's explanation of the parable's meaning.",
        explanation: TIMELINE.map((t) => t.label).join(" → "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, SYMBOLS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.element, label: s.element })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.element, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.element] = s.element;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Jesus used everyday shepherding to picture God's search for the lost.",
        explanation: chosen.map((s) => `${s.element} — represents ${s.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const love = shuffle(rng, GODS_LOVE);
      const attitude = shuffle(rng, PHARISEES_ATTITUDE);
      const items = shuffle(rng, [
        ...love.map((l, i) => ({ id: `l${i}`, label: l, bucket: "love" })),
        ...attitude.map((a, i) => ({ id: `a${i}`, label: a, bucket: "attitude" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "love", label: "Shows God's love for the sinner" },
          { id: "attitude", label: "Shows the Pharisees' attitude" },
        ],
        correctBucket,
        hint: "God's love actively seeks the lost; the Pharisees' attitude judged and excluded sinners.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "love" ? "shows God's love for the sinner" : "shows the Pharisees' attitude"}.`).join(" "),
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
        hint: "Recall the parable of the lost sheep in Luke 15:1-7.",
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
