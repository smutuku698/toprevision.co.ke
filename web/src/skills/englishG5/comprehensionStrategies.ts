import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 11.0 Sports - Appreciating Talents, sub-strand 11.2 Intensive Reading:
// Comprehension Strategies. Focus: name and use predicting, questioning, visualising, connecting,
// inferring, summarising, monitoring. See curriculum-reference/grade-5/english.json.

const STRATEGIES: { name: string; what: string; action: string }[] = [
  { name: "Predicting", what: "guess what will happen next using clues", action: "reads the title 'The Missed Penalty' and thinks, 'I bet a player fails to score.'" },
  { name: "Questioning", what: "ask yourself questions as you read", action: "stops after a paragraph and asks, 'Why did the coach change the goalkeeper?'" },
  { name: "Visualising", what: "make a picture in your mind", action: "closes their eyes and imagines the stadium lights, the roaring crowd and the wet grass" },
  { name: "Connecting", what: "link the text to your own life or to other texts", action: "thinks, 'This is like the day our school lost on penalties.'" },
  { name: "Inferring", what: "work out what the writer does not say directly", action: "reads 'her hands were shaking' and decides the athlete was nervous, though the text never says so" },
  { name: "Summarising", what: "say the main points in a few words", action: "closes the book and says, 'A young runner trains hard, nearly gives up, then wins the county final.'" },
  { name: "Monitoring", what: "notice when you stop understanding, and fix it", action: "realises a paragraph made no sense, goes back and reads it again slowly" },
];

export const comprehensionStrategies: Skill = {
  id: "g5-eng-reading-comprehension-strategies",
  code: "R.11",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Comprehension Strategies",
  description: "Name and recognise the strategies good readers use — predicting, questioning, visualising, connecting, inferring, summarising and monitoring.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-name", "fill-name", "sort-two", "match", "order", "reason"] as const);

    if (branch === "mc-name") {
      const s = randChoice(rng, STRATEGIES);
      const wrong = shuffle(rng, STRATEGIES.filter((x) => x.name !== s.name)).slice(0, 3).map((x) => x.name);
      const { choices, correctIndex } = mcFromCluster(rng, s.name, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `A reader ${s.action}.`, "Which comprehension strategy is this?"),
        choices,
        correctIndex,
        layout: "row",
        hint: "Match what the reader does to the strategy: guessing ahead, asking questions, picturing, connecting, working things out, summing up, or checking understanding.",
        explanation: `This is ${s.name} — to ${s.what}.`,
      };
    }

    if (branch === "fill-name") {
      const s = randChoice(rng, STRATEGIES);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the name of this reading strategy (one word)"),
        before: `The strategy of ${s.what} is called `,
        after: ".",
        correctAnswer: s.name.toLowerCase(),
        acceptedAnswers: [s.name.toLowerCase()],
        inputMode: "text",
        hint: "The strategies are: predicting, questioning, visualising, connecting, inferring, summarising, monitoring.",
        explanation: `That strategy is ${s.name}.`,
      };
    }

    if (branch === "sort-two") {
      const pool = shuffle(rng, STRATEGIES).slice(0, 3);
      const items = pool.map((s, i) => ({ id: `s${i}`, label: `A reader ${s.action}.` }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((s, i) => (correctBucket[`s${i}`] = s.name.toLowerCase()));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which strategy each reader is using"),
        items,
        buckets: pool.map((s) => ({ id: s.name.toLowerCase(), label: s.name })),
        correctBucket,
        hint: "Look at the action, then name the strategy behind it.",
        explanation: pool.map((s) => `${s.name}: ${s.what}`).join("  "),
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, STRATEGIES).slice(0, 5);
      const tokens = shuffle(rng, pool.map((s) => ({ id: s.name, label: s.name })));
      const targets = shuffle(rng, pool.map((s) => ({ id: s.name, label: s.what })));
      const correctMap: Record<string, string> = {};
      pool.forEach((s) => (correctMap[s.name] = s.name));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "strategy to what it means"),
        tokens,
        targets,
        correctMap,
        hint: "Each strategy is a different mental habit while reading.",
        explanation: pool.map((s) => `${s.name}: ${s.what}`).join("  "),
      };
    }

    if (branch === "order") {
      const steps = [
        { id: "before", label: "Before reading: look at the title and pictures and PREDICT what the text is about" },
        { id: "during1", label: "While reading: ASK yourself questions and VISUALISE the scene" },
        { id: "during2", label: "While reading: MONITOR — if a part stops making sense, re-read it" },
        { id: "after", label: "After reading: SUMMARISE the main points and CONNECT them to what you know" },
      ];
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "when a good reader uses these strategies"),
        instruction: "Click the stages in the correct order.",
        items: shuffle(rng, steps),
        correctOrder: ["before", "during1", "during2", "after"],
        hint: "Some strategies help before you read, some during, and some after.",
        explanation: "Before: predict. During: question, visualise, monitor. After: summarise and connect.",
      };
    }

    // reason — Apply: which strategy would help most in this situation?
    const scen: { s: string; answer: string }[] = [
      { s: "You have read a whole page but cannot remember a single thing that happened.", answer: "Monitoring" },
      { s: "You want to check you have understood a long story, so you tell a friend the plot in three sentences.", answer: "Summarising" },
      { s: "The text says 'the champion left without collecting her medal', and you wonder why.", answer: "Questioning" },
      { s: "You read 'his shoulders dropped and he stared at the ground' and decide the boy is disappointed.", answer: "Inferring" },
      { s: "Before you start, you look at the cover picture of a runner and think the story is about a race.", answer: "Predicting" },
      { s: "You imagine the dusty track, the whistle and the cheering as you read.", answer: "Visualising" },
    ];
    const sc = randChoice(rng, scen);
    const wrong = shuffle(rng, STRATEGIES.filter((x) => x.name !== sc.answer)).slice(0, 3).map((x) => x.name);
    const { choices, correctIndex } = mcFromCluster(rng, sc.answer, wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, "Which strategy would help most?"),
      choices,
      correctIndex,
      layout: "row",
      hint: "Decide whether you need to check understanding, sum up, ask, work out, guess ahead, or picture.",
      explanation: `${sc.answer} fits best here — ${STRATEGIES.find((x) => x.name === sc.answer)?.what}.`,
    };
  },
};
