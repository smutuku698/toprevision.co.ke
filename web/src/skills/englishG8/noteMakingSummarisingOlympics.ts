import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "As dusk fell over the stadium, eighty thousand spectators rose to their feet, waving flags in a rainbow of colours. Drummers on the field kept a steady beat while dancers in bright costumes moved in perfect formation. One by one, teams from over two hundred countries entered through the great arch, each athlete waving to the roaring crowd. Fireworks lit the sky as the final torchbearer climbed a long ramp, lifting the flame high before lighting the Olympic cauldron. The stadium fell silent for a moment, then erupted into cheers that could be heard blocks away.";

const KEY_POINTS = [
  "Eighty thousand spectators watched as teams from over two hundred countries paraded into the stadium",
  "Drummers and dancers performed as part of the opening ceremony",
  "The final torchbearer lit the Olympic cauldron, closing the ceremony",
];

const MINOR_DETAILS = [
  "Spectators waved flags in a rainbow of colours",
  "Dancers wore bright costumes and moved in formation",
  "Fireworks lit the sky",
  "The stadium fell silent, then erupted into cheers",
];

const NOTE_FORM_TASK = {
  fullSentence: "Eighty thousand spectators watched as teams from over two hundred countries paraded into the stadium.",
  goodNote: "80,000 spectators — 200+ countries paraded in",
  distractors: [
    "Eighty thousand spectators watched as teams from over two hundred countries paraded into the stadium.",
    "Spectators watched",
    "Countries",
  ],
};

const SUMMARY_TASK = {
  target: "about 15 words",
  correct: "Spectators watched teams from many countries parade before the torchbearer lit the Olympic cauldron.",
  distractors: [
    "Spectators watched fireworks light the sky.",
    "As dusk fell over the stadium, eighty thousand spectators rose to their feet, waving flags in a rainbow of colours, while drummers and dancers performed on the field.",
    "The stadium closed early because of heavy rain during the ceremony.",
  ],
};

const NOTE_TERMS: { name: string; description: string }[] = [
  { name: "Paraphrase", description: "Restating information from the text in your own words" },
  { name: "Condense", description: "Shortening a text while keeping its key meaning" },
  { name: "Key point", description: "The most important idea in a section of text" },
  { name: "Word limit", description: "The maximum number of words allowed in a summary" },
];

const EVENTS = [
  { id: "e1", label: "Spectators rise to their feet as dusk falls over the stadium" },
  { id: "e2", label: "Drummers and dancers perform on the field" },
  { id: "e3", label: "Teams from over two hundred countries parade in through the arch" },
  { id: "e4", label: "The final torchbearer lights the Olympic cauldron" },
  { id: "e5", label: "The stadium falls silent, then erupts into cheers" },
];

export const noteMakingSummarisingOlympics: Skill = {
  id: "g8-eng-r-note-making-summarising-olympics",
  code: "R.27",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Study Skills: Note Making and Summarising",
  description: "Identify main ideas in a descriptive passage about an Olympic opening ceremony, make notes, and summarise it within a stated word limit.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc-note", "mc-summary", "match", "order"] as const);
    const hint = "Focus on the main ideas the passage is built around; keep notes and summaries short but accurate, without losing key meaning.";

    if (branch === "categorize") {
      const chosenMinor = shuffle(rng, MINOR_DETAILS).slice(0, 2);
      const chosen = shuffle(rng, [
        ...KEY_POINTS.map((t) => ({ text: t, bucket: "main" })),
        ...chosenMinor.map((t) => ({ text: t, bucket: "detail" })),
      ]);
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement into Main idea or Descriptive detail.",
        items,
        buckets: [
          { id: "main", label: "Main idea" },
          { id: "detail", label: "Descriptive detail" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is a${c.bucket === "main" ? " main idea" : " descriptive detail"}.`).join(" "),
      };
    }

    if (branch === "mc-note") {
      const choices = shuffle(rng, [NOTE_FORM_TASK.goodNote, ...NOTE_FORM_TASK.distractors]);
      return {
        kind: "multiple-choice",
        passage: PASSAGE,
        prompt: `Which is the best note-form version of this main idea: "${NOTE_FORM_TASK.fullSentence}"?`,
        choices,
        correctIndex: choices.indexOf(NOTE_FORM_TASK.goodNote),
        layout: "list",
        hint: "A good note is short but keeps the essential information — not a full copied sentence, and not so short that meaning is lost.",
        explanation: `"${NOTE_FORM_TASK.goodNote}" condenses the idea using key words and figures — the other options either copy the sentence in full or cut out too much meaning.`,
      };
    }

    if (branch === "mc-summary") {
      const choices = shuffle(rng, [SUMMARY_TASK.correct, ...SUMMARY_TASK.distractors]);
      return {
        kind: "multiple-choice",
        passage: PASSAGE,
        prompt: `Which of these best summarises the passage in ${SUMMARY_TASK.target} without losing its key meaning?`,
        choices,
        correctIndex: choices.indexOf(SUMMARY_TASK.correct),
        layout: "list",
        hint: "The best summary fits the word limit, keeps the key points, and does not add false information.",
        explanation: `"${SUMMARY_TASK.correct}" fits the word limit while keeping the main ideas — the other options are too short and miss key points, far too long for the limit, or inaccurate.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, NOTE_TERMS.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, NOTE_TERMS.map((t) => ({ id: t.name, label: t.description })));
      const correctMap: Record<string, string> = {};
      for (const t of NOTE_TERMS) correctMap[t.name] = t.name;
      return {
        kind: "click-match",
        prompt: "Match each note-making and summarising term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "These terms describe how to shorten a text while keeping its important meaning.",
        explanation: NOTE_TERMS.map((t) => `${t.name} — ${t.description.toLowerCase()}.`).join(" "),
      };
    }

    const items = shuffle(rng, EVENTS);
    return {
      kind: "ordering",
      passage: PASSAGE,
      prompt: "Arrange the events of the opening ceremony in the correct order.",
      instruction: "Click them in order.",
      items,
      correctOrder: EVENTS.map((e) => e.id),
      hint: "Follow the passage from spectators rising to their feet through to the final cheer.",
      explanation: EVENTS.map((e) => e.label).join(" → "),
    };
  },
};
