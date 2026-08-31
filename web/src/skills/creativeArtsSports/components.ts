import { randChoice, shuffle } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

const PLAY_ELEMENTS: { label: string; reason: string; visual?: VisualSpec }[] = [
  { label: "Theme", reason: "Theme is an element of a play — the central idea or message of the story." },
  { label: "Characters", reason: "Characters are an element of a play — the people or beings who take part in the action." },
  { label: "Plot", reason: "Plot is an element of a play — the sequence of events that make up the story." },
  { label: "Conflict", reason: "Conflict is an element of a play — the struggle between opposing forces that drives the story." },
  { label: "Resolution", reason: "Resolution is an element of a play — how the conflict is finally settled at the end." },
  { label: "Setting", reason: "Setting is an element of a play — the time and place in which the story happens." },
  { label: "Language", reason: "Language is an element of a play — the words and dialogue used to communicate the story." },
];

const FITNESS_COMPONENTS: { label: string; reason: string; visual?: VisualSpec }[] = [
  { label: "Power", reason: "Power is a component of physical fitness — the ability to use strength quickly, combining speed and strength." },
  { label: "Reaction time", reason: "Reaction time is a component of physical fitness — how quickly a person responds to a stimulus." },
];

const MUSIC_CONCEPTS: { label: string; reason: string; visual?: VisualSpec }[] = [
  { label: "Dotted minim", reason: "A dotted minim is a music notation concept — a note worth 3 beats.", visual: { type: "music-note", note: "dotted-minim" } },
  { label: "Dotted crotchet", reason: "A dotted crotchet is a music notation concept — a note worth 1.5 beats." },
  { label: "Quaver", reason: "A quaver is a music notation concept — a note worth half a beat." },
  { label: "Grand stave", reason: "The grand stave is a music notation concept — the treble and bass staves joined together, used to name pitches across a wide range." },
  { label: "Note extension using dots and ties", reason: "Note extension (dots and ties) is a music notation concept — a way of lengthening how long a note is held." },
  { label: "Scale of F major", reason: "The scale of F major is a music notation concept — built with one flat (B flat) in its key signature." },
  { label: "Pitch on the grand stave", reason: "Naming pitch on the grand stave is a music notation concept — identifying which note each line/space represents." },
];

const GROUP_LABELS: Record<string, string> = {
  play: "Element of a play",
  fitness: "Component of physical fitness",
  music: "Music notation concept",
};

const ALL_ITEMS = [
  ...PLAY_ELEMENTS.map((p) => ({ ...p, bucket: "play" })),
  ...FITNESS_COMPONENTS.map((p) => ({ ...p, bucket: "fitness" })),
  ...MUSIC_CONCEPTS.map((p) => ({ ...p, bucket: "music" })),
];

const MC_PROMPTS = [
  'Which group does "{item}" belong to?',
  'Which category does "{item}" fit under?',
  'Classify "{item}" into the correct group.',
  'Where does "{item}" belong — which group?',
  'Identify which group "{item}" is an example of.',
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into the group it belongs to.",
  "Which group does each item below belong to? Sort them.",
  "Classify each item into its correct group.",
  "Decide which group each item belongs to, and sort it.",
  "Sort these items by the group they fit under.",
] as const;

export const components: Skill = {
  id: "cas-components",
  code: "F.2",
  subjectId: "creative-arts-sports",
  strandId: "cas-foundations",
  grade: 9,
  title: "Components of Creative Arts and Sports",
  description: "Sort play elements, physical fitness components, and music notation concepts into the correct group.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc"] as const);

    if (branch === "mc") {
      const entry = randChoice(rng, ALL_ITEMS);
      const choices = shuffle(rng, Object.values(GROUP_LABELS));

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, MC_PROMPTS).replace("{item}", entry.label),
        choices,
        correctIndex: choices.indexOf(GROUP_LABELS[entry.bucket]),
        layout: "list",
        ...(entry.visual ? { visual: entry.visual } : {}),
        hint: "Play elements describe a story; fitness components describe the body; music concepts describe notation.",
        explanation: entry.reason,
      };
    }

    const playPicks = shuffle(rng, PLAY_ELEMENTS).slice(0, 2);
    const fitnessPicks = shuffle(rng, FITNESS_COMPONENTS).slice(0, 2);
    const musicPicks = shuffle(rng, MUSIC_CONCEPTS).slice(0, 2);

    const items = shuffle(rng, [
      ...playPicks.map((p) => ({ id: p.label, label: p.label, bucket: "play", reason: p.reason })),
      ...fitnessPicks.map((p) => ({ id: p.label, label: p.label, bucket: "fitness", reason: p.reason })),
      ...musicPicks.map((p) => ({ id: p.label, label: p.label, bucket: "music", reason: p.reason })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "play", label: "Element of a play" },
        { id: "fitness", label: "Component of physical fitness" },
        { id: "music", label: "Music notation concept" },
      ],
      correctBucket,
      hint: "Play elements describe a story; fitness components describe the body; music concepts describe notation.",
      explanation: items.map((item) => item.reason).join(" "),
    };
  },
};
