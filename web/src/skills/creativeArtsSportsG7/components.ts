import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const GROUP_ITEMS: { label: string; bucket: string; reason: string }[] = [
  { label: "Colour", bucket: "visual", reason: "Colour is an element of Visual Arts." },
  { label: "Tone/value", bucket: "visual", reason: "Tone (value) is an element of Visual Arts — how light or dark a colour is." },
  { label: "Balance", bucket: "visual", reason: "Balance is a principle of Visual Arts — how visual weight is arranged." },
  { label: "Rhythm and movement", bucket: "visual", reason: "Rhythm and movement is a principle of Visual Arts — repeated visual elements that guide the eye." },
  { label: "Character", bucket: "story", reason: "Character is an element of a story — who the story is about." },
  { label: "Setting", bucket: "story", reason: "Setting is an element of a story — the time and place." },
  { label: "Plot", bucket: "story", reason: "Plot is an element of a story — the sequence of events." },
  { label: "Theme", bucket: "story", reason: "Theme is an element of a story — its central idea or message." },
  { label: "Coordination", bucket: "fitness", reason: "Coordination is a component of physical fitness — using different body parts smoothly together." },
  { label: "Strength", bucket: "fitness", reason: "Strength is a component of physical fitness — the power muscles can produce." },
  { label: "Treble staff with ledger line C", bucket: "music", reason: "The treble staff with a ledger line for middle C is a music notation concept." },
  { label: "The notes A to G", bucket: "music", reason: "The notes A to G are the letter names used in music notation." },
  { label: "The scale of C major", bucket: "music", reason: "The scale of C major is a music notation concept — built entirely on the white keys, no sharps or flats." },
  { label: "Melodic interval of a major 2nd", bucket: "music", reason: "A major 2nd is a music notation concept — the interval between two adjacent scale notes." },
  { label: "Melodic interval of a major 3rd", bucket: "music", reason: "A major 3rd is a music notation concept — the interval spanning two scale steps." },
  { label: "The piano keyboard", bucket: "music", reason: "The piano keyboard is used to visualise pitch and the C major scale." },
];

const BUCKET_LABEL: Record<string, string> = {
  visual: "Element/principle of Visual Arts",
  story: "Element of a story",
  fitness: "Component of physical fitness",
  music: "Music notation concept",
};

const QUESTIONS: { q: string; correct: string; distractors: string[]; tier?: "evaluate" }[] = [
  { q: "Which of these is a principle (not an element) of Visual Arts?", correct: "Balance — how visual weight is arranged across a picture", distractors: ["Colour — a basic visual property", "Tone/value — how light or dark a colour is", "Theme — the central idea of a story"] },
  { q: "What does 'rhythm and movement' mean as a principle of Visual Arts?", correct: "Repeated visual elements that guide the eye across a picture", distractors: ["The tempo at which a song is sung", "The beat pattern of a rhythmic exercise", "The order in which a story's events happen"] },
  { q: "In a story, what does 'setting' refer to?", correct: "The time and place in which the story happens", distractors: ["The sequence of events in the story", "The central idea the story is expressing", "Who the story's main character is"] },
  { q: "In a story, what does 'plot' refer to?", correct: "The sequence of events that make up the story", distractors: ["The time and place the story happens in", "The message the story is trying to teach", "The person or people the story is about"] },
  { q: "Which best describes coordination as a fitness component?", correct: "Using different parts of the body together smoothly and accurately", distractors: ["Lifting the heaviest possible weight once", "Running as far as possible without stopping", "Bending the body into unusual shapes"] },
  { q: "Which best describes strength as a fitness component?", correct: "The amount of force a muscle or group of muscles can produce", distractors: ["The ability to keep going without getting tired", "The ability to move both arms in different directions at once", "The ability to balance on one foot"] },
  { q: "On the treble staff, where is the note commonly called middle C written?", correct: "On a short ledger line just below the treble staff", distractors: ["On the top line of the treble staff", "In the middle space of the treble staff", "On the bottom line of the treble staff"] },
  { q: "How many sharps or flats does the scale of C major have?", correct: "None — C major uses only the white keys of the keyboard", distractors: ["One sharp", "One flat", "Two sharps"] },
  { q: "What is a melodic interval of a major 2nd?", correct: "The distance between two adjacent notes of the scale, e.g. C to D", distractors: ["The distance between two notes an octave apart", "A pause of two beats between notes", "Two notes played at exactly the same time"] },
  { q: "What is a melodic interval of a major 3rd?", correct: "The distance spanning two scale steps, e.g. C to E", distractors: ["The distance between two adjacent notes, e.g. C to D", "A note played three times in a row", "Three notes played together as a chord"] },
  {
    q: "A learner says: 'A good painting only needs the right colours — principles like balance don't matter.' Is this a fair evaluation?",
    correct: "No — colour is only one element; principles like balance and rhythm and movement are also needed to organise a picture well",
    distractors: ["Yes — colour is the only component of Visual Arts that matters", "Yes — principles only apply to music, not Visual Arts", "No — because balance is a fitness component, not part of Visual Arts"],
    tier: "evaluate",
  },
  {
    q: "A learner claims a story needs only 'characters and setting' to be complete, leaving out plot and theme. Evaluate this claim.",
    correct: "This is incomplete — a full story also needs a plot (sequence of events) and a theme (its central idea)",
    distractors: ["This is correct — plot and theme are optional extras, not core story elements", "This is correct — every story only ever has two elements", "This is incomplete — a story also needs a fitness component"],
    tier: "evaluate",
  },
  {
    q: "A learner practises fitness drills for coordination but skips strength exercises, saying 'strength isn't a real fitness component.' Evaluate this reasoning.",
    correct: "This is incorrect — strength is one of the recognised components of physical fitness, alongside coordination",
    distractors: ["This is correct — strength is only relevant to weightlifting, not general fitness", "This is correct — coordination is the only fitness component learners need", "This is incorrect — but only because coordination isn't a real fitness component either"],
    tier: "evaluate",
  },
];

const FILL_BLANKS: { before: string; after: string; answers: string[]; explanation: string }[] = [
  { before: "In Visual Arts, ", after: " is a principle describing how visual weight is arranged in a picture.", answers: ["balance", "Balance"], explanation: "Balance is a principle of Visual Arts." },
  { before: "In Visual Arts, ", after: " is a principle describing repeated elements that guide the eye.", answers: ["rhythm and movement", "Rhythm and movement"], explanation: "Rhythm and movement is a principle of Visual Arts." },
  { before: "In a story, the ___ is the time and place the events happen in.", after: "", answers: ["setting", "Setting"], explanation: "Setting is the time and place a story happens in." },
  { before: "In a story, the ___ is the sequence of events that make it up.", after: "", answers: ["plot", "Plot"], explanation: "Plot is the sequence of events in a story." },
  { before: "In a story, the ___ is the central idea or message being expressed.", after: "", answers: ["theme", "Theme"], explanation: "Theme is a story's central idea or message." },
  { before: "As a component of physical fitness, ___ describes using different body parts smoothly together.", after: "", answers: ["coordination", "Coordination"], explanation: "Coordination is a component of physical fitness." },
  { before: "As a component of physical fitness, ___ describes the force a muscle can produce.", after: "", answers: ["strength", "Strength"], explanation: "Strength is a component of physical fitness." },
  { before: "The scale of C major has ", after: " sharps or flats.", answers: ["0", "zero", "no", "none"], explanation: "C major has no sharps or flats — it uses only the white keys." },
  { before: "A melodic interval spanning two adjacent scale notes, like C to D, is called a major ___.", after: "", answers: ["2nd", "second", "2"], explanation: "A major 2nd spans two adjacent scale notes." },
  { before: "A melodic interval spanning two scale steps, like C to E, is called a major ___.", after: "", answers: ["3rd", "third", "3"], explanation: "A major 3rd spans two scale steps." },
];

const NOTE_BEATS = [
  { label: "Semibreve", beats: 4 },
  { label: "Minim", beats: 2 },
  { label: "Crotchet", beats: 1 },
];

const MATCH_PROMPTS = [
  "Match each term to its correct description.",
  "Pair each term below with its correct description.",
  "Match each term to what it describes.",
  "Connect each term to its correct description.",
  "For each term below, choose its matching description.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence about Creative Arts and Sports.",
  "Fill in the blank with the correct word.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into the component group it belongs to.",
  "Which component group does each item below belong to? Sort them.",
  "Classify each item into its correct component group.",
  "Decide which group each item fits, and sort it.",
  "Sort these items by the component group they belong to.",
] as const;

const BEATS_LINE_PROMPTS = [
  "A {note} is worth how many beats in simple time? Click the point on the number line.",
  "How many beats does a {note} last in simple time? Click the number line.",
  "Click the number line to show how many beats a {note} is worth.",
  "In simple time, a {note} lasts how many beats? Mark it on the number line.",
  "Show on the number line how many beats a {note} is worth.",
] as const;

const BEATS_CHART_PROMPTS = [
  "This chart shows the beat value of four note types. Which note has the {duration} duration?",
  "Look at the chart of note beat values. Which note has the {duration} duration?",
  "This chart compares four note durations. Which one is {duration}?",
  "Using the chart, identify which note type has the {duration} duration.",
  "Which of these four notes, shown in the chart, has the {duration} duration?",
] as const;

export const components: Skill = {
  id: "g7-cas-components",
  code: "F.2",
  subjectId: "creative-arts-sports",
  strandId: "g7-cas-foundations",
  grade: 7,
  title: "Components of Creative Arts and Sports",
  description: "Elements and principles of Visual Arts, story elements, fitness components, and music notation — rhythm note values and pitch on the treble staff in C major.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "theory-mc", "beats-line", "beats-chart", "match", "fill-blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, GROUP_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((g) => ({ id: g.label, label: g.label })));
      const targets = shuffle(rng, chosen.map((g) => ({ id: g.label, label: g.reason })));
      const correctMap: Record<string, string> = {};
      for (const g of chosen) correctMap[g.label] = g.label;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Visual Arts components describe a picture; story elements describe a narrative; fitness components describe the body; music concepts describe notation.",
        explanation: chosen.map((g) => g.reason).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL_BLANKS);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: f.before,
        after: f.after,
        correctAnswer: f.answers[0],
        acceptedAnswers: f.answers,
        inputMode: "text",
        hint: "Think about which component group (Visual Arts, story, fitness, or music) the sentence is describing.",
        explanation: f.explanation,
      };
    }

    if (branch === "categorize") {
      const picks: { label: string; bucket: string; reason: string }[] = [];
      for (const bucket of ["visual", "story", "fitness"]) {
        picks.push(...shuffle(rng, GROUP_ITEMS.filter((g) => g.bucket === bucket)).slice(0, 2));
      }
      picks.push(...shuffle(rng, GROUP_ITEMS.filter((g) => g.bucket === "music")).slice(0, 3));
      const items = shuffle(rng, picks);
      const correctBucket: Record<string, string> = {};
      for (const g of items) correctBucket[g.label] = g.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((g) => ({ id: g.label, label: g.label })),
        buckets: (["visual", "story", "fitness", "music"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Visual Arts components describe a picture; story elements describe a narrative; fitness components describe the body; music concepts describe notation.",
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
        hint: q.tier === "evaluate"
          ? "Check the claim against every named component of that group — is anything left out or mixed up with a different group?"
          : "Music notation terms describe how pitch and rhythm are written down; fitness and story terms describe the body and the narrative.",
        explanation: `The correct answer is "${q.correct}".`,
      };
    }

    if (branch === "beats-line") {
      const note = randChoice(rng, NOTE_BEATS);
      return {
        kind: "number-line",
        prompt: randChoice(rng, BEATS_LINE_PROMPTS).replace("{note}", note.label.toLowerCase()),
        hint: "A semibreve = 4 beats, a minim = 2 beats, a crotchet = 1 beat, a quaver = half a beat.",
        min: 0,
        max: 4,
        step: 0.5,
        correctValue: note.beats,
        mode: "point",
        explanation: `A ${note.label.toLowerCase()} is worth ${note.beats} beat${note.beats === 1 ? "" : "s"}.`,
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
      hint: "A taller bar means more beats — a longer note duration.",
      explanation: `${target.label} has ${target.beats} beat${target.beats === 1 ? "" : "s"}, the ${askLongest ? "most" : "fewest"} of the four notes shown.`,
    };
  },
};
