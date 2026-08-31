import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 2.0 National Celebrations, sub-strand 2.4 Creative Writing:
// Open-ended Compositions (100-150 words). Tested here as knowledge ABOUT planning and continuing
// a composition (the engine cannot grade free writing). See curriculum-reference/grade-5/english.json.

const STEPS: { id: string; label: string; what: string }[] = [
  { id: "brainstorm", label: "Brainstorm", what: "quickly list every idea you can think of about the topic" },
  { id: "select", label: "Select relevant points", what: "cross out ideas that do not fit the topic; keep the ones that do" },
  { id: "order", label: "Order the points", what: "number your chosen points so they flow logically" },
  { id: "draft", label: "Draft", what: "write the introduction, body and conclusion in full sentences" },
  { id: "proofread", label: "Proofread", what: "check spelling, punctuation and that each sentence makes sense" },
];

// Given opening -> a sentence that continues it sensibly, plus off-topic / contradictory distractors.
const CONTINUE: { opening: string; good: string; bad: string[] }[] = [
  {
    opening: "The whole school marched onto the field for the Jamhuri Day parade. Suddenly, the drum fell silent and everyone turned to look...",
    good: "The lead drummer had tripped, and his drum was rolling towards the flagpole.",
    bad: ["My favourite subject is mathematics because it is easy.", "There was no parade that day because the field was locked.", "The shopkeeper sold bread, milk and sugar to the customers."],
  },
  {
    opening: "I had practised my poem for weeks. As I climbed the steps to the stage on National Heroes Day, my hands began to shake...",
    good: "I took a deep breath, remembered my first line, and looked out at the smiling faces.",
    bad: ["The bus was late so we missed the whole ceremony.", "A giraffe is the tallest animal in the world.", "I did not know any poem, so I sat down quietly."],
  },
  {
    opening: "Our class had decorated the hall with ribbons and flags for the Labour Day concert. Just before the guests arrived, the lights went out...",
    good: "Someone found a box of candles, and by their soft glow the hall looked even more beautiful.",
    bad: ["It rained for three days after the concert had ended.", "The lights had never been switched on in the first place.", "My uncle is a carpenter who makes tables and chairs."],
  },
  {
    opening: "The freedom fighter's grandson had come to speak at our assembly. He stood quietly for a moment, then said...",
    good: "\"Let me tell you about the day my grandfather hid a message inside a loaf of bread.\"",
    bad: ["\"I have nothing to say, so I will leave now.\"", "The weather forecast said it would be sunny all week.", "He was not a real speaker; the assembly was cancelled."],
  },
];

// relevant vs irrelevant points for a topic
const TOPIC_POINTS: { topic: string; relevant: string[]; irrelevant: string[] }[] = [
  {
    topic: "The day our school celebrated Mashujaa Day",
    relevant: ["the parade around the field", "the poem about local heroes", "the guest of honour's speech", "the traditional dances"],
    irrelevant: ["how to solve long-division sums", "the price of maize at the market", "the rules of football"],
  },
  {
    topic: "A national celebration I will never forget",
    relevant: ["why the day mattered to my family", "what we wore and ate", "the songs and speeches", "how I felt during the parade"],
    irrelevant: ["a list of the planets in order", "the parts of a plant cell", "my plan for the school holidays next year"],
  },
];

export const openEndedCompositions: Skill = {
  id: "g5-eng-writing-open-ended-compositions",
  code: "W.2",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Open-ended Compositions: Planning and Continuing",
  description: "Plan a composition (brainstorm, select relevant points, order, draft, proofread) and continue a given story opening sensibly.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-continue", "fill-step", "sort-relevant", "match-step", "order-steps", "reason-remove"] as const);

    if (branch === "mc-continue") {
      const c = randChoice(rng, CONTINUE);
      const { choices, correctIndex } = mcFromCluster(rng, c.good, c.bad, 3);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the sentence that best continues this opening")}\n"${c.opening}"`,
        choices,
        correctIndex,
        layout: "list",
        hint: "The next sentence must follow on from what just happened, stay on the topic, and not contradict the opening.",
        explanation: `"${c.good}" follows on naturally. The others go off the topic or contradict the opening (for example, saying there was no parade after the opening described one).`,
      };
    }

    if (branch === "fill-step") {
      const s = randChoice(rng, STEPS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the name of this planning step (one or two words)"),
        before: `The step where you ${s.what} is called `,
        after: ".",
        correctAnswer: s.label.toLowerCase(),
        acceptedAnswers: [s.label.toLowerCase(), s.id],
        inputMode: "text",
        hint: "The steps are: brainstorm, select relevant points, order the points, draft, proofread.",
        explanation: `That step is "${s.label}" — you ${s.what}.`,
      };
    }

    if (branch === "sort-relevant") {
      const t = randChoice(rng, TOPIC_POINTS);
      const rel = shuffle(rng, t.relevant).slice(0, 3);
      const irr = shuffle(rng, t.irrelevant).slice(0, 3);
      const items = shuffle(rng, [
        ...rel.map((p, i) => ({ id: `r${i}`, label: p, kind: "relevant" })),
        ...irr.map((p, i) => ({ id: `i${i}`, label: p, kind: "irrelevant" })),
      ]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, `whether each point is relevant to the topic "${t.topic}"`),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "relevant", label: "Relevant — keep it" },
          { id: "irrelevant", label: "Not relevant — leave it out" },
        ],
        correctBucket,
        hint: "Ask of each point: does this help tell the reader about the topic?",
        explanation: `Relevant points connect directly to "${t.topic}". Points about unrelated school subjects or other events do not belong.`,
      };
    }

    if (branch === "match-step") {
      const pool = shuffle(rng, STEPS).slice(0, 5);
      const tokens = shuffle(rng, pool.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, pool.map((s) => ({ id: s.id, label: s.what })));
      const correctMap: Record<string, string> = {};
      pool.forEach((s) => (correctMap[s.id] = s.id));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "planning step to what you do in it"),
        tokens,
        targets,
        correctMap,
        hint: "Think about the order you would really do these in.",
        explanation: pool.map((s) => `${s.label}: ${s.what}`).join("  "),
      };
    }

    if (branch === "order-steps") {
      const items = STEPS.map((s) => ({ id: s.id, label: s.label }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps for planning and writing a composition"),
        instruction: "Click the steps in the correct order.",
        items: shuffle(rng, items),
        correctOrder: STEPS.map((s) => s.id),
        hint: "You cannot select points before you have any; you cannot proofread before you draft.",
        explanation: "Brainstorm → select relevant points → order the points → draft → proofread.",
      };
    }

    // reason — Evaluate: which sentence should be removed from a draft?
    const t = randChoice(rng, TOPIC_POINTS);
    const kept = shuffle(rng, t.relevant).slice(0, 3);
    const stray = randChoice(rng, t.irrelevant);
    const draftLines = shuffle(rng, [...kept, stray]);
    const { choices, correctIndex } = mcFromCluster(rng, stray, kept, 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, `A pupil's draft about "${t.topic}" contains these points:\n- ${draftLines.join("\n- ")}`, "Which point should be removed?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Find the one point that has nothing to do with the topic.",
      explanation: `"${stray}" does not belong in a composition about "${t.topic}" — it should be removed so the writing stays focused.`,
    };
  },
};
