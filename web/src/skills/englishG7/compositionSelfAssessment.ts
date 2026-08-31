import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CHECKLIST: { id: string; label: string; description: string }[] = [
  { id: "spelling", label: "Spelling check", description: "Are all the words spelt correctly?" },
  { id: "punctuation", label: "Punctuation check", description: "Are full stops, commas, and capital letters used correctly?" },
  { id: "grammar", label: "Grammar check", description: "Do the subjects and verbs agree, and are the sentences complete?" },
  { id: "flow", label: "Flow check", description: "Do the ideas move logically from the introduction to the conclusion?" },
];

const COMPOSITIONS: { id: string; topic: string; intro: string; body: string[]; conclusion: string }[] = [
  {
    id: "highway",
    topic: "road safety on the Thika Superhighway",
    intro: "Every day, thousands of matatus, buses, and cars use the busy Thika Superhighway, making road safety a matter of life and death for every traveller.",
    body: [
      "Pedestrians should always use footbridges or zebra crossings instead of dashing across the busy lanes.",
      "Drivers must obey speed limits and avoid using their phones while driving, especially near schools and market centres.",
      "Passengers should insist on wearing seatbelts and refuse to board a vehicle that is clearly overloaded.",
    ],
    conclusion: "If pedestrians, drivers, and passengers all play their part, our roads and highways can become far safer for every traveller.",
  },
  {
    id: "schoolbus",
    topic: "school bus safety",
    intro: "Each morning and afternoon, hundreds of pupils across the country travel to and from school in crowded buses, making bus safety an issue every school must take seriously.",
    body: [
      "Drivers should never exceed the number of seats available, no matter how late the bus is running.",
      "Pupils should remain seated with seatbelts fastened until the bus comes to a complete stop.",
      "Teachers should always accompany younger pupils and confirm every child has boarded before departure.",
    ],
    conclusion: "When schools, drivers, and pupils all follow these simple rules, journeys to and from school become far safer for everyone.",
  },
  {
    id: "bodaboda",
    topic: "boda boda safety",
    intro: "Boda bodas have become one of the fastest-growing ways to travel in Kenyan towns, but their speed and popularity have also made them one of the most dangerous.",
    body: [
      "Riders should always slow down at bends and near busy market centres where pedestrians cross unexpectedly.",
      "Passengers should insist on wearing a helmet before agreeing to board, even for a short trip.",
      "Riders should avoid carrying more passengers than the motorcycle is licensed to carry.",
    ],
    conclusion: "With riders and passengers both taking these precautions seriously, boda boda travel can become far safer across the country.",
  },
];

const STRONG_WEAK: { kind: "intro" | "conclusion"; topic: string; strong: string; weak: string }[] = [
  {
    kind: "intro",
    topic: "road safety near schools",
    strong: "Every morning, dozens of children dash across a busy road with no zebra crossing on their way to Kirinyaga Primary School — a danger that could easily be prevented.",
    weak: "Road safety is about being safe on roads. It is important.",
  },
  {
    kind: "conclusion",
    topic: "boda boda safety",
    strong: "Wearing a helmet and insisting the rider slows down at bends could be the difference between a boda boda ride and a hospital visit.",
    weak: "So that is why road safety matters. The end.",
  },
  {
    kind: "intro",
    topic: "matatu overloading",
    strong: "When a matatu overturned on the Nakuru-Nairobi highway last month, investigators found it had been carrying eight passengers more than its licensed capacity.",
    weak: "Matatus carry people from one place to another. Sometimes they have accidents.",
  },
  {
    kind: "conclusion",
    topic: "school bus safety",
    strong: "A few extra minutes spent counting every pupil onto the bus is a small price to pay for making sure every child arrives home safely.",
    weak: "In conclusion, school bus safety is a good topic to write about.",
  },
];

export const compositionSelfAssessment: Skill = {
  id: "g7-eng-w-composition-self-assessment",
  code: "W.8",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Composition Writing: Self-Assessment",
  description: "Identify the parts of a road-safety composition and the checklist items used to assess spelling, punctuation, grammar, and flow.",
  generate(rng) {
    const branch = randChoice(rng, ["part-mc", "categorize", "match", "order", "mc-strong"] as const);
    const hint = "Self-assessment means checking your own composition's introduction, body, and conclusion, and reviewing its spelling, punctuation, grammar, and flow.";

    if (branch === "part-mc") {
      const comp = randChoice(rng, COMPOSITIONS);
      const partId = randChoice(rng, ["intro", "body", "conclusion"] as const);
      const sentence = partId === "intro" ? comp.intro : partId === "conclusion" ? comp.conclusion : randChoice(rng, comp.body);
      const label = partId === "intro" ? "Introduction" : partId === "conclusion" ? "Conclusion" : "Body";
      const choices = shuffle(rng, ["Introduction", "Body", "Conclusion"]);
      return {
        kind: "multiple-choice",
        prompt: `In this composition about ${comp.topic}, which part does this excerpt come from? "${sentence}"`,
        choices,
        correctIndex: choices.indexOf(label),
        layout: "row",
        hint,
        explanation: `This excerpt is the ${label.toLowerCase()} of the composition.`,
      };
    }

    if (branch === "categorize") {
      const comp = randChoice(rng, COMPOSITIONS);
      const bodyPicks = shuffle(rng, comp.body).slice(0, 2);
      const chosen = shuffle(rng, [
        { text: comp.intro, part: "Introduction" },
        ...bodyPicks.map((b) => ({ text: b, part: "Body" })),
        { text: comp.conclusion, part: "Conclusion" },
      ]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.part));
      return {
        kind: "categorize",
        prompt: `Sort each excerpt from this composition about ${comp.topic} by which part it belongs to.`,
        items,
        buckets: [
          { id: "Introduction", label: "Introduction" },
          { id: "Body", label: "Body" },
          { id: "Conclusion", label: "Conclusion" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is from the ${c.part.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, CHECKLIST.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, CHECKLIST.map((c) => ({ id: c.id, label: c.description })));
      const correctMap: Record<string, string> = {};
      for (const c of CHECKLIST) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: "Match each self-assessment checklist item to what it checks for.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: CHECKLIST.map((c) => `${c.label}: ${c.description}`).join(" "),
      };
    }

    if (branch === "order") {
      const comp = randChoice(rng, COMPOSITIONS);
      const items = [
        { id: "intro", label: comp.intro },
        { id: "body1", label: comp.body[0] },
        { id: "body2", label: comp.body[1] },
        { id: "conclusion", label: comp.conclusion },
      ];
      return {
        kind: "ordering",
        prompt: `Arrange these excerpts from a composition about ${comp.topic} in the order they should appear.`,
        instruction: "Click the excerpts in order, from introduction to conclusion.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: "A composition opens with an introduction, develops the topic in the body, and ends with a conclusion.",
        explanation: items.map((i) => i.label).join(" → "),
      };
    }

    const entry = randChoice(rng, STRONG_WEAK);
    const choices = shuffle(rng, [entry.strong, entry.weak]);
    return {
      kind: "multiple-choice",
      prompt: `Which ${entry.kind === "intro" ? "introduction" : "conclusion"} about ${entry.topic} is stronger and more specific?`,
      choices,
      correctIndex: choices.indexOf(entry.strong),
      layout: "list",
      hint: `A strong ${entry.kind === "intro" ? "introduction" : "conclusion"} uses specific, concrete detail rather than vague, generic statements.`,
      explanation: `"${entry.strong}" is stronger — it uses specific, concrete detail, unlike the vague "${entry.weak}"`,
    };
  },
};
