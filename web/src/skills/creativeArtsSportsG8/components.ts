import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const GROUP_ITEMS = [
  { label: "Character", bucket: "verse", reason: "Character is an element of a verse — who or what the verse is about." },
  { label: "Theme", bucket: "verse", reason: "Theme is an element of a verse — its central idea or message." },
  { label: "Setting", bucket: "verse", reason: "Setting is an element of a verse — the time and place it describes." },
  { label: "Endurance", bucket: "fitness", reason: "Endurance is a component of physical fitness — the ability to sustain activity over time." },
  { label: "Agility", bucket: "fitness", reason: "Agility is a component of physical fitness — the ability to change direction quickly and with control." },
  { label: "Bass staff", bucket: "music", reason: "The bass staff is a music notation concept — the five lines used to write lower-pitched notes." },
  { label: "Ledger lines", bucket: "music", reason: "Ledger lines are a music notation concept — short extra lines for notes above or below the staff." },
  { label: "Middle C", bucket: "music", reason: "Middle C is a music notation concept — the note that sits on the ledger line between the treble and bass staves." },
  { label: "Accidentals", bucket: "music", reason: "Accidentals are a music notation concept — sharp, flat, or natural signs that raise or lower a note's pitch." },
];

const PITCH_TERMS = [
  { id: "bass-staff", label: "Bass staff", meaning: "The five lines and four spaces used to write lower-pitched notes, marked with an F clef" },
  { id: "ledger-lines", label: "Ledger lines", meaning: "Short extra lines added above or below the staff for notes too high or too low to fit on it" },
  { id: "g-major", label: "Scale of G major", meaning: "A major scale built on G, with one sharp (F sharp) in its key signature" },
  { id: "accidentals", label: "Accidentals", meaning: "Sharp, flat, or natural signs written before a note to raise, lower, or cancel a change to its pitch" },
  { id: "middle-c", label: "Middle C", meaning: "The C note that sits just below the treble staff, on the first ledger line below it" },
  { id: "piano-keyboard", label: "Piano keyboard", meaning: "The layout of white and black keys used to visualise pitch, semitones, and key signatures" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "How many sharps or flats are in the key signature of G major?", correct: "One sharp (F sharp)", distractors: ["No sharps or flats", "One flat (B flat)", "Two sharps"] },
  { q: "What is a ledger line used for?", correct: "Extending the staff so notes too high or too low to fit on it can still be written", distractors: ["Marking the tempo of a piece", "Showing which hand should play a note", "Indicating the piece has ended"] },
  { q: "What does an accidental do to a note?", correct: "It raises, lowers, or cancels a change to that note's pitch", distractors: ["It changes how long the note is held", "It changes the volume of the note", "It has no effect on the note"] },
  { q: "Where is Middle C found in written music?", correct: "On the first ledger line below the treble staff (or above the bass staff)", distractors: ["On the top line of the bass staff", "It is never written with a ledger line", "In the middle space of the treble staff"] },
  { q: "What is the main use of a piano keyboard when learning notation?", correct: "To visualise pitch, semitone steps, and how key signatures are built", distractors: ["It has no connection to reading music", "Only to practise finger strength", "Only to tune other instruments"] },
  { q: "Which best describes endurance as a fitness component?", correct: "The ability to keep performing physical activity over a sustained period without tiring quickly", distractors: ["The ability to lift the heaviest possible weight once", "The ability to react instantly to a sound", "The ability to bend the body into unusual shapes"] },
  { q: "Which best describes agility as a fitness component?", correct: "The ability to change direction quickly while keeping control of the body", distractors: ["The ability to run in a straight line for a long distance", "The ability to hold a single position without moving", "The ability to lift weights slowly"] },
  { q: "Which of these is an element of a verse, not a component of music or fitness?", correct: "Theme — the central idea or message of the verse", distractors: ["Endurance — sustaining activity over time", "Ledger lines — extending the staff", "Accidentals — altering a note's pitch"] },
];

const NOTE_BEATS = [
  { label: "Semibreve", beats: 4 },
  { label: "Minim", beats: 2 },
  { label: "Crotchet", beats: 1 },
];

const CATEGORIZE_PROMPTS = [
  "Sort each item into the group it belongs to.",
  "Which group does each item below belong to? Sort them.",
  "Classify each item into its correct group.",
  "Decide which group each item fits, and sort it.",
  "Sort these items by the group they belong to.",
] as const;

const MATCH_PROMPTS = [
  "Match each pitch/notation term to its correct meaning.",
  "Pair each term below with its correct meaning.",
  "Match each term to what it describes.",
  "Connect each pitch/notation term to its correct meaning.",
  "For each term below, choose its matching meaning.",
] as const;

const BEATS_LINE_PROMPTS = [
  "A {note} is worth how many beats in 4/4 time? Click the point on the number line.",
  "How many beats does a {note} last in 4/4 time? Click the number line.",
  "Click the number line to show how many beats a {note} is worth.",
  "In 4/4 time, a {note} lasts how many beats? Mark it on the number line.",
  "Show on the number line how many beats a {note} is worth in 4/4 time.",
] as const;

const BEATS_CHART_PROMPTS = [
  "This chart shows the beat value of four note types. Which note has the {duration} duration?",
  "Look at the chart of note beat values. Which note has the {duration} duration?",
  "This chart compares four note durations. Which one is {duration}?",
  "Using the chart, identify which note type has the {duration} duration.",
  "Which of these four notes, shown in the chart, has the {duration} duration?",
] as const;

export const components: Skill = {
  id: "g8-cas-components",
  code: "F.2",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-foundations",
  grade: 8,
  title: "Components of Creative Arts and Sports",
  description: "Elements of a verse, fitness components, and music notation concepts — the bass staff, ledger lines, accidentals, G major, and note values.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "theory-mc", "terms-match", "beats-line", "beats-chart"] as const);

    if (branch === "categorize") {
      const versePicks = shuffle(rng, GROUP_ITEMS.filter((g) => g.bucket === "verse")).slice(0, 2);
      const fitnessPicks = GROUP_ITEMS.filter((g) => g.bucket === "fitness");
      const musicPicks = shuffle(rng, GROUP_ITEMS.filter((g) => g.bucket === "music")).slice(0, 3);
      const items = shuffle(rng, [...versePicks, ...fitnessPicks, ...musicPicks]);
      const correctBucket: Record<string, string> = {};
      for (const g of items) correctBucket[g.label] = g.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((g) => ({ id: g.label, label: g.label })),
        buckets: [
          { id: "verse", label: "Element of a verse" },
          { id: "fitness", label: "Component of physical fitness" },
          { id: "music", label: "Music notation concept" },
        ],
        correctBucket,
        hint: "Verse elements describe a story; fitness components describe the body; music concepts describe notation.",
        explanation: items.map((g) => g.reason).join(" "),
      };
    }

    if (branch === "theory-mc") {
      const q = randChoice(rng, QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Music notation terms describe how pitch is written down; fitness and verse terms describe the body and the story.",
        explanation: `The correct answer is "${q.correct}".`,
      };
    }

    if (branch === "terms-match") {
      const chosen = shuffle(rng, PITCH_TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Ledger lines extend the staff; accidentals change pitch; G major has one sharp.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "beats-line") {
      const note = randChoice(rng, NOTE_BEATS);
      return {
        kind: "number-line",
        prompt: randChoice(rng, BEATS_LINE_PROMPTS).replace("{note}", note.label.toLowerCase()),
        hint: "A semibreve = 4 beats, a minim = 2 beats, a crotchet = 1 beat.",
        min: 0,
        max: 4,
        step: 0.5,
        correctValue: note.beats,
        mode: "point",
        explanation: `A ${note.label.toLowerCase()} is worth ${note.beats} beat${note.beats === 1 ? "" : "s"} in 4/4 time.`,
      };
    }

    // beats-chart
    const shown = shuffle(rng, [...NOTE_BEATS, { label: "Quaver", beats: 0.5 }]);
    const data = shown.map((n) => ({ label: n.label, value: n.beats }));
    const longest = shown.reduce((a, b) => (b.beats > a.beats ? b : a));
    const shortest = shown.reduce((a, b) => (b.beats < a.beats ? b : a));
    const askLongest = randInt(rng, 0, 1) === 0;
    const target = askLongest ? longest : shortest;
    const others = shown.filter((n) => n.label !== target.label).map((n) => n.label);
    const choices = shuffle(rng, [target.label, ...others]);
    return {
      kind: "multiple-choice",
      prompt: randChoice(rng, BEATS_CHART_PROMPTS).replace("{duration}", askLongest ? "longest" : "shortest"),
      visual: { type: "bar-chart", data },
      choices,
      correctIndex: choices.indexOf(target.label),
      hint: "The taller bar means more beats — a longer note duration.",
      explanation: `${target.label} has ${target.beats} beat${target.beats === 1 ? "" : "s"}, the ${askLongest ? "most" : "fewest"} of the four notes shown.`,
    };
  },
};
