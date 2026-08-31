import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LEADERSHIP_QUALITIES: { id: string; quality: string; topic: string; good: string; distractors: string[] }[] = [
  {
    id: "listens",
    quality: "Listens to others",
    topic: "A good leader listens carefully to the people they lead.",
    good: "When students complained about the crowded lunch queue, the class prefect organised a rota system so everyone could eat on time.",
    distractors: [
      "The class prefect likes wearing a blue sweater on Fridays.",
      "The class prefect is the tallest student in the class.",
      "The class prefect once scored the highest marks in a maths test.",
    ],
  },
  {
    id: "responsible",
    quality: "Takes responsibility",
    topic: "A good leader takes responsibility when things go wrong.",
    good: "When the school trip bus broke down, the head boy calmly informed the teachers and helped organise alternative transport instead of blaming the driver.",
    distractors: [
      "The head boy always sits at the front of the bus.",
      "The head boy has been to more school trips than anyone else.",
      "The head boy is good at drawing maps of bus routes.",
    ],
  },
  {
    id: "fair",
    quality: "Treats everyone fairly",
    topic: "A good leader treats everyone fairly.",
    good: "During team selection, the captain chose players based on their skills at try-outs rather than picking only her close friends.",
    distractors: [
      "The captain owns the most footballs in her class.",
      "The captain scored the winning goal last season.",
      "The captain always wears the number seven jersey.",
    ],
  },
  {
    id: "inspires",
    quality: "Inspires hard work",
    topic: "A good leader inspires others to work hard.",
    good: "Before the inter-house competition, the sports captain trained early every morning and encouraged teammates who wanted to give up.",
    distractors: [
      "The sports captain has the fastest recorded time in the 100m.",
      "The sports captain was born in the same town as the coach.",
      "The sports captain owns the newest pair of running shoes.",
    ],
  },
];

const DEV_PAIRS: { topic: string; developed: string; underdeveloped: string }[] = [
  {
    topic: "our class prefect",
    developed:
      "Our prefect is a good leader. Last month, when two students argued over a lost football, she calmly separated them, listened to both sides, and helped them agree to share it fairly. Everyone respected how patiently she handled the dispute.",
    underdeveloped: "Our prefect is a good leader. She is nice. She does a good job. Everyone likes her.",
  },
  {
    topic: "the school captain",
    developed:
      "Our school captain shows real leadership. When the water pipe burst during exams week, he quickly organised students to fetch water from the neighbouring school so lessons could continue without panic. Teachers still talk about how calmly he handled it.",
    underdeveloped: "Our school captain is a good leader. He is responsible. He helps out. He is a great guy.",
  },
  {
    topic: "the club chairperson",
    developed:
      "The environment club's chairperson leads by example. Before the tree-planting day, she visited every classroom to explain why the school compound needed more shade trees, then personally dug the first three holes to encourage others to join in.",
    underdeveloped: "The chairperson is a leader. She likes trees. She organises things. She is very good at her job.",
  },
];

const VAGUE_VS_SPECIFIC: { specific: string; vague: string }[] = [
  {
    specific: "When the new student was mocked for his accent, the class monitor firmly told the class it was unacceptable and invited him to sit with her group at lunch.",
    vague: "The class monitor is kind to new students.",
  },
  {
    specific: "During the drought, the village elder organised a rota so every household could fetch water from the borehole without conflict.",
    vague: "The village elder solves problems well.",
  },
  {
    specific: "Before the debate final, the team captain stayed after school for a week helping the youngest member practise her opening argument.",
    vague: "The team captain supports her teammates.",
  },
];

const ORDER_SETS: { id: string; topic: string; steps: string[] }[] = [
  {
    id: "firedrill",
    topic: "Our class monitor showed real leadership during the fire drill.",
    steps: [
      "When the fire alarm rang, she immediately told everyone to stop what they were doing.",
      "She led the class calmly out of the room in a single file line.",
      "Once outside, she counted every student to make sure no one was missing.",
    ],
  },
  {
    id: "matchday",
    topic: "The team captain proved her leadership on the day of the big match.",
    steps: [
      "Before kick-off, she gathered the team to remind everyone of their positions and the game plan.",
      "When the team fell behind by one goal, she encouraged her teammates instead of blaming anyone.",
      "After the final whistle, she thanked the whole team, win or lose, for their effort.",
    ],
  },
  {
    id: "librarycommittee",
    topic: "The library prefect showed leadership when the reading corner was left in a mess.",
    steps: [
      "She first asked calmly who had been using the reading corner that morning.",
      "She then organised a small group to help return the books to their correct shelves.",
      "Finally, she drew up a simple rota so the reading corner would stay tidy going forward.",
    ],
  },
];

export const paragraphingExamplesIncidents: Skill = {
  id: "g7-eng-w-paragraphing-examples-incidents",
  code: "W.4",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Paragraphing: Using Examples and Incidents",
  description: "Choose strong supporting examples and incidents for a paragraph about leadership, and recognise well-developed paragraphs.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-example", "mc-developed", "order", "match", "categorize"] as const);
    const hint = "A well-developed paragraph uses a specific example or incident to prove its topic sentence, instead of vague, general statements.";

    if (branch === "mc-example") {
      const entry = randChoice(rng, LEADERSHIP_QUALITIES);
      const choices = shuffle(rng, [entry.good, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Topic sentence: "${entry.topic}" Which example or incident best supports this topic sentence?`,
        choices,
        correctIndex: choices.indexOf(entry.good),
        layout: "list",
        hint,
        explanation: `"${entry.good}" is a specific incident that directly proves the topic sentence. The other options are irrelevant details that don't show this leadership quality.`,
      };
    }

    if (branch === "mc-developed") {
      const entry = randChoice(rng, DEV_PAIRS);
      const choices = shuffle(rng, [entry.developed, entry.underdeveloped]);
      return {
        kind: "multiple-choice",
        prompt: `Which paragraph about ${entry.topic} is well-developed, with a specific example and incident?`,
        choices,
        correctIndex: choices.indexOf(entry.developed),
        layout: "list",
        hint,
        explanation: `The well-developed paragraph gives a specific incident with real detail: "${entry.developed}" The other paragraph is underdeveloped — it only makes vague, general statements with no example.`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = [{ id: "topic", label: set.topic }, ...set.steps.map((s, i) => ({ id: `s${i}`, label: s }))];
      return {
        kind: "ordering",
        prompt: "Arrange the topic sentence and its supporting examples into a logically ordered paragraph.",
        instruction: "Click the topic sentence first, then the examples in the order the incident happened.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: "The topic sentence comes first, then the incident's examples follow in the order they actually happened.",
        explanation: items.map((i) => i.label).join(" → "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, LEADERSHIP_QUALITIES.map((q) => ({ id: q.id, label: q.quality })));
      const targets = shuffle(rng, LEADERSHIP_QUALITIES.map((q) => ({ id: q.id, label: q.good })));
      const correctMap: Record<string, string> = {};
      for (const q of LEADERSHIP_QUALITIES) correctMap[q.id] = q.id;
      return {
        kind: "click-match",
        prompt: "Match each leadership quality to the incident that best illustrates it.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: LEADERSHIP_QUALITIES.map((q) => `${q.quality}: "${q.good}"`).join(" "),
      };
    }

    const chosen = shuffle(rng, VAGUE_VS_SPECIFIC).slice(0, 3);
    const items = shuffle(
      rng,
      chosen.flatMap((p, i) => [
        { id: `sp${i}`, label: p.specific, bucket: "specific" },
        { id: `vg${i}`, label: p.vague, bucket: "vague" },
      ])
    );
    const correctBucket: Record<string, string> = {};
    for (const it of items) correctBucket[it.id] = it.bucket;
    return {
      kind: "categorize",
      prompt: "Sort each sentence into Specific example/incident or Vague, generic statement.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "specific", label: "Specific example/incident" },
        { id: "vague", label: "Vague, generic statement" },
      ],
      correctBucket,
      hint: "A specific example or incident names exactly what happened, when, and how. A vague statement just names a quality without proving it.",
      explanation: chosen.map((p) => `"${p.specific}" is a specific incident, while "${p.vague}" just states a quality without proof.`).join(" "),
    };
  },
};
