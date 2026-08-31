import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill, VisualSpec } from "@/lib/types";
import {
  place,
  name,
  buildScenarioChoices,
  pickPrompt,
  SORT_PROMPTS,
  MATCH_PROMPTS,
  ORDER_PROMPTS,
  TRUE_FALSE_PROMPTS,
  FILL_BLANK_PROMPTS,
} from "./g5CasShared";
import type { ScenarioMC } from "./g5CasShared";

// KICD Grade 5 Creative Arts, Strand 1.0 Creating and Executing, sub-strand 1.3 "Rhythm"
// (15 lessons).
//
// Mined verbatim: Note values, symbols and their rests — minim, crotchet and a pair of
// quavers; French rhythm names taa-aa, taa and ta-te; Making a calligraphy pen (bamboo/
// papyrus stick, fountain pen or any other); Writing in calligraphy (angle of slants,
// ascenders/descenders); two-beat patterns — strong and weak beats, aurally identify,
// compose. Key inquiry: how rhythmic patterns can be created; why calligraphy lettering
// is used in writing. Core competencies: Communication and collaboration; Creativity and
// Imagination; Learning to Learn. Link to other learning area: English (alphabet).
//
// Visual coverage: uses the registered { type: "music-note" } VisualSpec for note/rest
// recognition. No calligraphy-pen or slant-guide visual exists; that omission is a
// deliberate scope call for this pass.

interface NoteInfo {
  id: string;
  label: string;
  beats: number;
  french: string;
  visual: VisualSpec;
  desc: string;
}

const NOTES: NoteInfo[] = [
  { id: "minim", label: "Minim", beats: 2, french: "taa-aa", visual: { type: "music-note", note: "minim" }, desc: "an open note head with a stem, held for two beats" },
  { id: "crotchet", label: "Crotchet", beats: 1, french: "taa", visual: { type: "music-note", note: "crotchet" }, desc: "a filled note head with a stem, held for one beat" },
  { id: "quaver-pair", label: "A pair of quavers", beats: 1, french: "ta-te", visual: { type: "music-note", note: "quaver-pair" }, desc: "two filled note heads joined by a beam, together lasting one beat (two half-beats)" },
];

const RESTS = [
  { id: "minim-rest", label: "Minim rest", beats: 2, visual: { type: "music-note", note: "minim-rest" } as VisualSpec, desc: "a small block sitting on the middle line, meaning two beats of silence" },
  { id: "crotchet-rest", label: "Crotchet rest", beats: 1, visual: { type: "music-note", note: "crotchet-rest" } as VisualSpec, desc: "a squiggle sign meaning one beat of silence" },
] as const;

const NOTE_FACTS = [
  { text: "It is held for two beats and its French rhythm name is taa-aa", id: "minim" },
  { text: "Its note head is open (not filled in) and it has a plain stem", id: "minim" },
  { text: "Two of these fill a bar of four beats between them", id: "minim" },
  { text: "It is held for exactly one beat and its French rhythm name is taa", id: "crotchet" },
  { text: "Its note head is filled in solid and it has a single plain stem", id: "crotchet" },
  { text: "It is the steady note that usually matches one clap of the pulse", id: "crotchet" },
  { text: "It is two notes joined by a beam, and its French rhythm name is ta-te", id: "quaver-pair" },
  { text: "The two notes together last one beat, so each one is half a beat", id: "quaver-pair" },
  { text: "You say two even syllables in the time of a single crotchet", id: "quaver-pair" },
  { text: "A minim rest means two beats of silence", id: "minim-rest" },
  { text: "A crotchet rest means one beat of silence", id: "crotchet-rest" },
  { text: "A rest is a symbol that tells you to be silent, not to play a sound", id: "rest-general" },
] as const;

const CALLIGRAPHY_TF = [
  { text: "In calligraphy, all the letters lean at the same slant angle for a neat, even look", isTrue: true },
  { text: "An ascender is the part of a letter that rises above the main body, as in b, d, h, k, l", isTrue: true },
  { text: "A descender is the part of a letter that drops below the writing line, as in g, j, p, q, y", isTrue: true },
  { text: "A calligraphy pen has a broad nib that makes thick and thin strokes depending on its direction", isTrue: true },
  { text: "A small slit cut into the tip of the nib helps hold and feed the ink to the paper", isTrue: true },
  { text: "Calligraphy is used to make headings, certificates and invitations look decorative and special", isTrue: true },
  { text: "In calligraphy every letter should lean a different, random way", isTrue: false },
  { text: "Ascenders and descenders are types of ink used only for calligraphy", isTrue: false },
  { text: "A calligraphy pen must be a modern plastic ballpoint; a bamboo or papyrus stick cannot be used", isTrue: false },
  { text: "The nib of a calligraphy pen should be perfectly round so every stroke is the same thickness", isTrue: false },
  { text: "A bamboo or papyrus stick can be shaved to a flat wedge tip and slit to make a working calligraphy pen", isTrue: true },
  { text: "Calligraphy lettering has no purpose and is never used for anything real", isTrue: false },
] as const;

const PEN_STEPS = [
  { id: "n1", label: "Choose a straight, dry bamboo or papyrus stick of a comfortable thickness" },
  { id: "n2", label: "Cut the stick to a length that is easy to hold, like a pencil" },
  { id: "n3", label: "Shave one end down to a flat, wedge-shaped tip (the nib)" },
  { id: "n4", label: "Cut a short slit up the centre of the nib to hold and feed the ink" },
  { id: "n5", label: "Trim the very tip of the nib straight and square" },
  { id: "n6", label: "Dip the nib in ink and test the strokes on scrap paper, adjusting the tip if needed" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} claps a rhythm written as "taa taa-aa". How many beats long is the pattern, and why?`,
      correct: "Three beats — taa (a crotchet) is one beat and taa-aa (a minim) is two beats, so 1 + 2 = 3",
      wrong: [
        "Two beats — because there are two rhythm names written",
        "Four beats — because every rhythm pattern must fill a bar of four",
        "One beat — because you clap the whole pattern in one go",
      ],
      explanation: "Each French rhythm name stands for a note value: taa = 1 beat (crotchet), taa-aa = 2 beats (minim). Adding them gives 1 + 2 = 3 beats. The number of names written is not the number of beats.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} needs a note that lasts exactly one beat for a two-beat pattern. Which note should ${name(rng)} choose?`,
    correct: "A crotchet — it is held for one beat and is said as taa",
    wrong: [
      "A minim — it is held for two beats, said as taa-aa",
      "A pair of quavers written as one symbol — this is two half-beat notes, not a single one-beat note",
      "A minim rest — this is two beats of silence, not a one-beat sound",
    ],
    explanation: "A crotchet is the one-beat note (taa). A minim lasts two beats, a pair of quavers is two half-beat notes, and a minim rest is silence.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} taps a steady two-beat pattern and is told to make the first beat stronger. Which beat is the strong beat in a two-beat pattern?`,
      correct: "The first beat — in a two-beat pattern, beat 1 is strong and beat 2 is weak",
      wrong: [
        "The second beat — the pattern always builds to a strong beat at the end",
        "Both beats are equally strong in a two-beat pattern",
        "Neither beat is strong; two-beat patterns have no accent at all",
      ],
      explanation: "A two-beat pattern has a regular pulse of STRONG–weak: beat 1 is accented and beat 2 is lighter. That repeating accent is what gives the metre its feel.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} writes the rhythm name ta-te under one note symbol. What note symbol is it?`,
    correct: "A pair of quavers joined by a beam",
    wrong: ["A single crotchet", "A single minim", "A minim rest"],
    explanation: "ta-te is the French rhythm name for a pair of quavers — two beamed notes that together last one beat. taa is a crotchet and taa-aa is a minim.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is shaving the tip of a bamboo stick and then cuts a small slit up the middle of it. What is the slit for?`,
      correct: "It holds a little ink and feeds it steadily to the paper as the pen writes",
      wrong: [
        "It makes the pen lighter so it is easier to hold",
        "It lets the writer blow air through the pen while writing",
        "It has no real purpose and is only for decoration",
      ],
      explanation: "The slit in a calligraphy nib acts as a small ink reservoir and channel, feeding ink evenly to the paper so the line does not run dry mid-stroke.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s class in ${place(rng)} is asked why calligraphy keeps every letter leaning at the same slant. What is the best reason?`,
    correct: "A consistent slant makes the writing look even, neat and decorative",
    wrong: [
      "A consistent slant makes the writing faster to read aloud",
      "Letters must slant so the ink does not smudge",
      "The slant is chosen randomly for each letter and has no effect",
    ],
    explanation: "Calligraphy is decorative lettering; keeping one steady slant angle for every letter is what gives it its neat, balanced, ornamental look.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} writes the letters "l" and "y" in calligraphy. Which part of "l" rises above the body of the letter, and which part of "y" drops below the line?`,
      correct: "The rising part of 'l' is an ascender; the falling part of 'y' is a descender",
      wrong: [
        "Both are called ascenders, since any extra stroke is an ascender",
        "The 'l' has a descender and the 'y' has an ascender",
        "Neither has a special name; they are just tall and long letters",
      ],
      explanation: "An ascender goes up above the main body of the letter (b, d, h, k, l); a descender goes down below the writing line (g, j, p, q, y).",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} composes a two-beat rhythm using "taa" and "ta-te". Why is "taa ta-te" a valid two-beat pattern?`,
    correct: "taa is one beat and ta-te is one beat (two half-beats), so together they make exactly two beats",
    wrong: [
      "Because it uses two different rhythm names, and two names always equal two beats",
      "Because ta-te is worth two beats on its own",
      "It is not valid; a two-beat pattern can only use two crotchets",
    ],
    explanation: "ta-te (a pair of quavers) lasts one beat, the same as taa (a crotchet). taa + ta-te = 1 + 1 = 2 beats, which fills a two-beat pattern.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sees a symbol that is a small block resting on a stave line where a note would go, but there is no note head. What is it, and what should ${who} do?`,
      correct: "It is a rest — stay silent for its beats instead of playing a sound",
      wrong: [
        "It is a very quiet note — play it, but softly",
        "It is a mistake in the music — ignore it and keep playing",
        "It is a repeat sign — go back and play the bar again",
      ],
      explanation: "A rest is a symbol for silence. A minim rest means two beats of silence and a crotchet rest one beat; you count the beats but make no sound.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s group in ${place(rng)} practises writing the alphabet in calligraphy. Which subject does the design link this lettering practice to?`,
    correct: "English — using knowledge of the alphabet to practise calligraphy",
    wrong: [
      "Mathematics — because letters are counted first",
      "It links to no other subject",
      "Science — because ink is a liquid",
    ],
    explanation: "The design links this sub-strand to English: learners use their knowledge of the alphabet to practise writing letters and words in calligraphy.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} claps a rhythm of "ta-te ta-te taa". How many beats is it?`,
      correct: "Three beats — each ta-te is one beat and taa is one beat, so 1 + 1 + 1 = 3",
      wrong: [
        "Five beats — counting every syllable (ta, te, ta, te, taa)",
        "Two beats — because only ta-te patterns are counted",
        "Six beats — because ta-te is two beats each",
      ],
      explanation: "A ta-te (pair of quavers) lasts one beat, and taa (a crotchet) lasts one beat, so ta-te + ta-te + taa = 1 + 1 + 1 = 3 beats. Syllables are not beats.",
    };
  },
  (rng) => ({
    prompt: `In ${place(rng)}, ${name(rng)} wants to create a new rhythmic pattern rather than copy one. Which is a real way to create a rhythm, as taught in this sub-strand?`,
    correct: "Combine note values and rests (minim, crotchet, pair of quavers, and their rests) so the beats add up to the pattern length",
    wrong: [
      "Write the same single note over and over with no rests, since that is the only allowed pattern",
      "Choose notes at random with no regard for how many beats they add up to",
      "Only clap; a rhythm can never be written down",
    ],
    explanation: "You create a rhythmic pattern by choosing and arranging note values and rests so their beats add up correctly for the pattern — for example a two-beat pattern must total two beats.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  { before: "The note held for two beats, with an open note head, is called a ", after: ".", correctAnswer: "minim" },
  { before: "The note held for one beat, with a filled note head and a plain stem, is called a ", after: ".", correctAnswer: "crotchet" },
  { before: "Two notes joined by a beam that together last one beat are called a pair of ", after: ".", correctAnswer: "quavers", acceptedAnswers: ["quavers", "quaver"] },
  { before: "The French rhythm name for a minim is ", after: ".", correctAnswer: "taa-aa", acceptedAnswers: ["taa-aa", "taa aa", "taaaa"] },
  { before: "The French rhythm name for a crotchet is ", after: ".", correctAnswer: "taa" },
  { before: "The French rhythm name for a pair of quavers is ", after: ".", correctAnswer: "ta-te", acceptedAnswers: ["ta-te", "ta te", "tate"] },
  { before: "A symbol that tells you to be silent for a set number of beats is called a ", after: ".", correctAnswer: "rest" },
  { before: "In a two-beat pattern, the first beat is the ", after: " beat and the second is the weak beat.", correctAnswer: "strong" },
  { before: "In calligraphy, the part of a letter such as l or h that rises above the main body is called an ", after: ".", correctAnswer: "ascender" },
  { before: "In calligraphy, the part of a letter such as g or y that drops below the writing line is called a ", after: ".", correctAnswer: "descender" },
  { before: "The flat, wedge-shaped writing tip of a calligraphy pen is called the ", after: ".", correctAnswer: "nib" },
  { before: "A short cut made up the centre of a calligraphy nib to hold and feed ink is called the ", after: ".", correctAnswer: "slit" },
] as const;

const NOTE_RECOGNITION_PROMPTS = [
  "Which note or rest is shown here?",
  "Look at the symbol — what is it?",
  "Name the music symbol shown.",
  "Which of these does the symbol show?",
  "Identify the note or rest in the picture.",
  "What music symbol is this?",
  "Read the symbol and name it.",
  "Which note value is drawn here?",
  "Which of the options matches this symbol?",
  "Name the symbol shown above.",
] as const;

const BEAT_LINE_PROMPTS = [
  "Count the beats in this rhythm and mark the total on the line.",
  "How many beats long is this pattern? Mark it.",
  "Work out the total beats and place the marker there.",
  "Add up the beats in the rhythm and show the total on the line.",
  "Mark the number line at the total number of beats in this pattern.",
  "Find the total beat count and place the point.",
  "How many beats does this rhythm last? Mark it on the line.",
  "Total the beats in the pattern and mark that number.",
  "Show the length of this rhythm, in beats, on the line.",
  "Place the marker at the pattern's total beat count.",
] as const;

export const rhythm: Skill = {
  id: "g5-cas-rhythm",
  code: "C.3",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-creating-executing",
  grade: 5,
  title: "Rhythm",
  description:
    "Note values, symbols and their rests (minim, crotchet, a pair of quavers) and the French rhythm names taa-aa, taa and ta-te; strong and weak beats in two-beat patterns; making a calligraphy pen; and writing in calligraphy (ascenders, descenders, consistent slant).",
  generate(rng) {
    const branch = randChoice(rng, [
      "note-recognition",
      "note-value-mc",
      "note-name-match",
      "note-fact-sort",
      "beat-count-line",
      "pen-order",
      "calligraphy-tf",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "note-recognition") {
      const pool: { label: string; visual: VisualSpec; desc: string }[] = [
        ...NOTES.map((n) => ({ label: n.label, visual: n.visual, desc: n.desc })),
        ...RESTS.map((r) => ({ label: r.label, visual: r.visual, desc: r.desc })),
      ];
      const target = randChoice(rng, pool);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        pool.filter((p) => p.label !== target.label).map((p) => p.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: pickPrompt(rng, NOTE_RECOGNITION_PROMPTS),
        choices,
        correctIndex,
        layout: "list",
        visual: target.visual,
        hint: "An open head = minim; a filled head with one stem = crotchet; two beamed heads = a pair of quavers; a block or squiggle with no head = a rest.",
        explanation: `This is a ${target.label.toLowerCase()} — ${target.desc}.`,
      };
    }

    if (branch === "note-value-mc") {
      const target = randChoice(rng, NOTES);
      const sub = randChoice(rng, ["beats", "french-of-note", "note-of-french"] as const);
      if (sub === "beats") {
        const opts = ["1 beat", "2 beats", "half a beat", "4 beats"];
        const correct = `${target.beats} beat${target.beats === 1 ? "" : "s"}`;
        const choices = shuffle(rng, opts);
        return {
          kind: "multiple-choice",
          prompt: `How many beats is a ${target.label.toLowerCase()} held for?`,
          choices,
          correctIndex: choices.indexOf(correct),
          layout: "row",
          hint: "Minim = 2 beats, crotchet = 1 beat, a pair of quavers = 1 beat together.",
          explanation: `A ${target.label.toLowerCase()} lasts ${correct} (French rhythm name: ${target.french}).`,
        };
      }
      if (sub === "french-of-note") {
        const choices = shuffle(rng, NOTES.map((n) => n.french));
        return {
          kind: "multiple-choice",
          prompt: `Which French rhythm name goes with a ${target.label.toLowerCase()}?`,
          choices,
          correctIndex: choices.indexOf(target.french),
          layout: "row",
          hint: "taa = crotchet, taa-aa = minim, ta-te = a pair of quavers.",
          explanation: `A ${target.label.toLowerCase()} is said as "${target.french}".`,
        };
      }
      const choices = shuffle(rng, NOTES.map((n) => n.label));
      return {
        kind: "multiple-choice",
        prompt: `Which note symbol has the French rhythm name "${target.french}"?`,
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "row",
        hint: "taa = crotchet, taa-aa = minim, ta-te = a pair of quavers.",
        explanation: `"${target.french}" is the rhythm name for a ${target.label.toLowerCase()}.`,
      };
    }

    if (branch === "note-name-match") {
      const tokens = shuffle(rng, NOTES.map((n) => ({ id: n.id, label: n.label })));
      const targets = shuffle(rng, NOTES.map((n) => ({ id: n.id, label: `${n.french} — ${n.beats} beat${n.beats === 1 ? "" : "s"}` })));
      const correctMap: Record<string, string> = {};
      NOTES.forEach((n) => (correctMap[n.id] = n.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Match each note to its French rhythm name and beat value.",
        explanation: NOTES.map((n) => `${n.label} = ${n.french} = ${n.beats} beat${n.beats === 1 ? "" : "s"}.`).join(" "),
      };
    }

    if (branch === "note-fact-sort") {
      const chosen = shuffle(rng, NOTE_FACTS.filter((f) => f.id !== "rest-general")).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `nf${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`nf${i}`] = f.id));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "minim", label: "Minim" },
          { id: "crotchet", label: "Crotchet" },
          { id: "quaver-pair", label: "Pair of quavers" },
          { id: "minim-rest", label: "Minim rest" },
          { id: "crotchet-rest", label: "Crotchet rest" },
        ],
        correctBucket,
        hint: "Check the beat value (1 or 2), whether it is a sound or a silence (rest), and the French rhythm name.",
        explanation: chosen
          .map((f) => {
            const all = [...NOTES, ...RESTS];
            return `"${f.text}" — ${all.find((n) => n.id === f.id)?.label ?? f.id}.`;
          })
          .join(" "),
      };
    }

    if (branch === "beat-count-line") {
      const len = randChoice(rng, [2, 3, 4] as const);
      const pattern: NoteInfo[] = [];
      let total = 0;
      // build a pattern of note values that sums to `len`
      while (total < len) {
        const options = NOTES.filter((n) => n.beats <= len - total);
        const pick = randChoice(rng, options);
        pattern.push(pick);
        total += pick.beats;
      }
      const patternText = pattern.map((p) => p.french).join(" ");
      return {
        kind: "number-line",
        prompt: `${pickPrompt(rng, BEAT_LINE_PROMPTS)}  Rhythm: ${patternText}`,
        min: 0,
        max: 8,
        step: 1,
        correctValue: total,
        mode: "point",
        hint: "taa = 1 beat, taa-aa = 2 beats, ta-te = 1 beat. Add them up.",
        explanation: `${pattern.map((p) => `${p.french} = ${p.beats}`).join(", ")}. Total = ${total} beats.`,
      };
    }

    if (branch === "pen-order") {
      const shuffled = shuffle(rng, PEN_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (making a calligraphy pen from a bamboo or papyrus stick)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PEN_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Choose and cut the stick, shape the wedge nib, slit and trim the tip, then ink it and test.",
        explanation: "Correct order: " + PEN_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "calligraphy-tf") {
      const chosen = shuffle(rng, CALLIGRAPHY_TF).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `g${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`g${i}`] = f.isTrue ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, TRUE_FALSE_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "Calligraphy = a broad nib, a consistent slant, ascenders up and descenders down, used for decorative lettering.",
        explanation: chosen.map((f) => `"${f.text}" is ${f.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Add note values by their beats, remember STRONG–weak in a two-beat pattern, and think about what the pen's nib and slit do.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    const accepted = "acceptedAnswers" in fb && fb.acceptedAnswers ? fb.acceptedAnswers : [fb.correctAnswer];
    return {
      kind: "fill-blank",
      prompt: pickPrompt(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...accepted],
      inputMode: "text",
      hint: "Think about the three note values and their French rhythm names, rests, strong/weak beats, and calligraphy terms.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
