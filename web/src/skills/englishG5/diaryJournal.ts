import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 12.0 Environmental Pollution, sub-strand 12.4 Functional Writing:
// Diary — appointment diary; journal (3 days). See curriculum-reference/grade-5/english.json.

// entries: appointment diary (planned, future, has a time) vs personal journal (past, first person, feelings)
const ENTRIES: { text: string; type: "appointment" | "journal" }[] = [
  { text: "9:00 a.m. – Join the class clean-up along the river bank.", type: "appointment" },
  { text: "This morning we cleared plastic bottles from the stream. I felt proud of our work.", type: "journal" },
  { text: "2:30 p.m. – Meet the environment club to plan the tree-planting day.", type: "appointment" },
  { text: "The smoke from the burning rubbish made me cough all afternoon. I was upset that no one had reported it.", type: "journal" },
  { text: "4:00 p.m. – Return the recycling bins to the store room.", type: "appointment" },
  { text: "Yesterday the county truck finally emptied the overflowing bins. I felt relieved.", type: "journal" },
  { text: "Saturday, 8:00 a.m. – Guided walk to the wetland with the science teacher.", type: "appointment" },
  { text: "We planted ten seedlings near the school gate today. My hands were muddy but I was happy.", type: "journal" },
  { text: "Monday, 11:00 a.m. – Present the poster on air pollution to Grade 4.", type: "appointment" },
  { text: "I was disappointed when it rained and the litter pick was cancelled.", type: "journal" },
];

const COMPONENTS: { name: string; belongs: string; note: string }[] = [
  { name: "Date", belongs: "both", note: "every entry starts with the date" },
  { name: "Time", belongs: "appointment", note: "an appointment entry gives the time of each planned activity" },
  { name: "Planned activity", belongs: "appointment", note: "what you intend to do, written before it happens" },
  { name: "First-person account", belongs: "journal", note: "a journal is written as 'I ...', about what actually happened" },
  { name: "Feelings / reflection", belongs: "journal", note: "a journal records how you felt and what you thought" },
  { name: "Past tense", belongs: "journal", note: "a journal describes events that have already happened" },
];

export const diaryJournal: Skill = {
  id: "g5-eng-writing-diary-journal",
  code: "W.12",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Diary and Journal Writing",
  description: "Tell an appointment diary (dated, timed, planned activities) apart from a personal journal (dated, first-person, past events and feelings), and know the components of each.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-type", "fill-component", "sort-entries", "match", "order", "reason"] as const);

    if (branch === "mc-type") {
      const e = randChoice(rng, ENTRIES);
      const correct = e.type === "appointment" ? "Appointment diary" : "Personal journal";
      const { choices, correctIndex } = mcFromCluster(rng, correct, [e.type === "appointment" ? "Personal journal" : "Appointment diary"], 1);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "which kind of writing this entry is from")}\n"${e.text}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "An appointment diary looks forward and gives times. A journal looks back and gives feelings.",
        explanation: `This is from ${correct.toLowerCase()} — ${e.type === "appointment" ? "it names a time and a planned activity that has not happened yet" : "it is written in the first person, in the past tense, and describes feelings"}.`,
      };
    }

    if (branch === "fill-component") {
      const c = randChoice(rng, COMPONENTS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `which kind of diary this component belongs to — "appointment", "journal" or "both"`),
        before: `"${c.name}" is a component of `,
        after: ` writing.`,
        correctAnswer: c.belongs,
        acceptedAnswers: [c.belongs],
        inputMode: "text",
        hint: c.note,
        explanation: `${c.name}: ${c.note}.`,
      };
    }

    if (branch === "sort-entries") {
      const pool = shuffle(rng, ENTRIES).slice(0, 6);
      const items = pool.map((e, i) => ({ id: `e${i}`, label: e.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((e, i) => (correctBucket[`e${i}`] = e.type));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which kind of diary each entry belongs in"),
        items,
        buckets: [
          { id: "appointment", label: "Appointment diary (planned, timed)" },
          { id: "journal", label: "Personal journal (past events, feelings)" },
        ],
        correctBucket,
        hint: "Has a clock time and a plan → appointment diary. Says 'I felt...' about something that happened → journal.",
        explanation: "Appointment diary entries are timed plans for the future. Journal entries are first-person, past-tense accounts with feelings.",
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, COMPONENTS).slice(0, 5);
      const tokens = shuffle(rng, pool.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, pool.map((c) => ({ id: c.name, label: c.note })));
      const correctMap: Record<string, string> = {};
      pool.forEach((c) => (correctMap[c.name] = c.name));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "diary component to what it does"),
        tokens,
        targets,
        correctMap,
        hint: "Think about which part of an entry each component is.",
        explanation: pool.map((c) => `${c.name}: ${c.note}`).join("  "),
      };
    }

    if (branch === "order") {
      const useJournal = rng() < 0.5;
      if (useJournal) {
        const parts = [
          { id: "date", label: "Date (e.g. Tuesday, 5th May)" },
          { id: "event", label: "What happened, written as 'I ...' in the past tense" },
          { id: "feeling", label: "How you felt and what you thought about it" },
        ];
        return {
          kind: "ordering",
          prompt: orderPrompt(rng, "the parts of a personal journal entry"),
          instruction: "Click the parts in the correct order.",
          items: shuffle(rng, parts),
          correctOrder: ["date", "event", "feeling"],
          hint: "Start with the date, then say what happened, then how you felt.",
          explanation: "A journal entry: date → what happened (first person, past tense) → feelings / reflection.",
        };
      }
      const appts = shuffle(rng, [
        { id: "a", label: "8:00 a.m. – Meet at the school gate" },
        { id: "b", label: "9:30 a.m. – Collect litter along the road" },
        { id: "c", label: "11:00 a.m. – Sort the litter for recycling" },
        { id: "d", label: "1:00 p.m. – Report the day's results to the class" },
      ]);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "one day's appointment-diary entries by time"),
        instruction: "Click the entries in time order, earliest first.",
        items: appts,
        correctOrder: ["a", "b", "c", "d"],
        hint: "Order the entries from the earliest time to the latest.",
        explanation: "Appointment-diary entries are listed in order of time: 8:00 → 9:30 → 11:00 → 1:00.",
      };
    }

    // reason — Evaluate: fix a mistake in a diary/journal entry.
    const scen: { s: string; correct: string; wrong: string[]; why: string }[] = [
      {
        s: `${name(rng)} wrote a journal entry about today's river clean-up but used the future tense: "Tomorrow I will clean the river and I will feel proud."`,
        correct: "Today I cleaned the river and I felt proud.",
        wrong: ["Tomorrow I will clean the river and I will feel proud.", "I clean the river every day and feel proud.", "Clean the river at 9 a.m. and feel proud."],
        why: "a journal records what has already happened, so it uses the past tense ('cleaned', 'felt').",
      },
      {
        s: `${name(rng)} wrote an appointment-diary entry with no time: "Go to the wetland walk with the science teacher."`,
        correct: "Saturday, 8:00 a.m. – Wetland walk with the science teacher.",
        wrong: ["Go to the wetland walk with the science teacher.", "I went to the wetland and I loved it.", "The wetland was full of birds and I felt calm."],
        why: "an appointment-diary entry needs a date and a time before the planned activity.",
      },
      {
        s: `${name(rng)} wrote a journal entry that only lists facts with no feelings: "We planted ten seedlings. It stopped at noon."`,
        correct: "We planted ten seedlings this morning. I was tired but happy that we had made the school greener.",
        wrong: ["We planted ten seedlings. It stopped at noon.", "10:00 a.m. – Plant ten seedlings near the gate.", "We will plant ten seedlings and be happy."],
        why: "a journal should include the writer's feelings and reflections, not just a list of facts.",
      },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.correct, sc.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, "Which version is written correctly?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Journal = date + past events + feelings. Appointment diary = date + time + planned activity.",
      explanation: `"${sc.correct}" is correct — ${sc.why}`,
    };
  },
};
