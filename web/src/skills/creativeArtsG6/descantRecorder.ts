import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { place, name, buildScenarioChoices, expandScenarios } from "./g6CasShared";
import type { ScenarioMC, FillBlankTemplate } from "./g6CasShared";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Creative Arts, Strand 2.0 Performing and Displaying, Sub-strand 2.2 Descant
// Recorder (P.2). Source: full note range C D E F G A B C1 D1 (Baroque fingering); three named
// playing techniques — fingering, tonguing, posture; explicit repertoire piece — the Kenya
// National Anthem's main melody; core competencies Learning to learn (initiative to learn notes/
// melodies) and Citizenship (playing the Anthem); linked area Agriculture (hygiene measures
// using/after playing). Per the brief, questions about the Anthem are framed around the practice/
// technique of learning and performing it respectfully — no invented note-by-note transcription
// of the actual Anthem melody is used as fact anywhere in this file.

const NOTES = ["C", "D", "E", "F", "G", "A", "B", "C1", "D1"] as const;
type Note = (typeof NOTES)[number];

const NOTE_LABELS: Record<Note, string> = {
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  A: "A",
  B: "B",
  C1: "C1 (an octave above C)",
  D1: "D1 (an octave above D)",
};

const TECHNIQUES = [
  {
    id: "fingering",
    label: "Fingering",
    meaning: "Covering or opening the correct combination of finger holes to sound the right pitch",
  },
  {
    id: "tonguing",
    label: "Tonguing",
    meaning: "Using the tongue to start and stop each note cleanly, instead of letting notes blur into each other",
  },
  {
    id: "posture",
    label: "Posture",
    meaning: "Holding the recorder and body correctly to support good breath control and a good tone",
  },
] as const;

// ---- Apply/Evaluate-tier reasoning: technique + citizenship framing, Kenyan-localized ----

interface TechniqueFact {
  id: string;
  situation: string;
  correct: string;
  wrong: string[];
  explanationTail: string;
}

const TECHNIQUE_FACTS: readonly TechniqueFact[] = [
  {
    id: "fingering-note",
    situation: "presses down the wrong combination of finger holes while trying to play the note G",
    correct: "The recorder will sound the wrong pitch, because fingering is what determines which note is produced",
    wrong: [
      "The recorder will sound louder than normal",
      "The recorder's tone will become breathy but the pitch will stay correct",
      "Nothing will change, since fingering only affects volume",
    ],
    explanationTail:
      "Fingering — which holes are covered or open — is what determines pitch on a descant recorder. Getting the combination wrong produces the wrong note, not just a change in loudness or tone.",
  },
  {
    id: "tonguing-blur",
    situation: "plays a fast melody without using the tongue to start each note",
    correct: "The separate notes will blur together instead of sounding clean and distinct",
    wrong: [
      "The pitch of every note will rise higher than intended",
      "The recorder will squeak on every note",
      "The melody will automatically slow down to fix itself",
    ],
    explanationTail:
      "Tonguing is what starts and stops each note cleanly. Without it, notes run into one another and the melody sounds blurred rather than crisp, even if the fingering is correct.",
  },
  {
    id: "posture-tone",
    situation: "slouches and holds the recorder awkwardly against the chest while playing",
    correct: "Breath support will suffer and the tone is likely to sound weak or unsteady",
    wrong: [
      "The finger holes will automatically cover themselves correctly",
      "The recorder will play in a completely different key",
      "Posture only affects how a player looks, never the sound produced",
    ],
    explanationTail:
      "Good posture supports steady breathing, which is what gives a descant recorder a strong, even tone. Slouched posture restricts breath support and weakens the tone, even if fingering and tonguing are correct.",
  },
];

const TECHNIQUE_FRAMES: ((rng: RNG, fact: TechniqueFact) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who}, practising the descant recorder in ${place(rng)}, ${fact.situation}. What is most likely to happen?`,
      correct: fact.correct,
      wrong: [...fact.wrong],
      explanation: fact.explanationTail,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `During a recorder lesson in ${place(rng)}, ${who} ${fact.situation}. What is the most likely result?`,
      correct: fact.correct,
      wrong: [...fact.wrong],
      explanation: fact.explanationTail,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who} is rehearsing for a school music day in ${place(rng)} and ${fact.situation}. What outcome should ${who} expect?`,
      correct: fact.correct,
      wrong: [...fact.wrong],
      explanation: fact.explanationTail,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `A recorder teacher in ${place(rng)} notices that ${who} ${fact.situation}. What effect will this have on the music?`,
      correct: fact.correct,
      wrong: [...fact.wrong],
      explanation: fact.explanationTail,
    };
  },
];

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = expandScenarios(TECHNIQUE_FACTS, TECHNIQUE_FRAMES);

// ---- Citizenship / Anthem — Apply/Evaluate-tier reasoning, practice not pitch content ----

const CITIZENSHIP_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s class in ${place(rng)} is learning to play the main melody of the Kenya National Anthem on the descant recorder for a school assembly. Why does the curriculum treat learning to play the Anthem well as an act of citizenship, not just a music exercise?`,
      correct: "Playing the national anthem carefully and respectfully is a way of honouring the country and taking part in national life",
      wrong: [
        "Because the Anthem is the easiest melody to play on a recorder",
        "Because playing the Anthem is required to pass any music exam",
        "Because the Anthem uses more notes than any other melody",
      ],
      explanation: "Citizenship as a core competency here is about honouring and participating in national symbols and traditions — playing the Anthem's melody carefully on the recorder is one way learners practise that respect, not simply a technical exercise.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} rushes through practising the Kenya National Anthem's melody on the recorder, playing many wrong notes, just before a school flag-raising ceremony. Why might a teacher say this matters beyond just music skill?`,
      correct: "Playing the Anthem's melody accurately and with care shows respect for a national symbol, which is part of good citizenship",
      wrong: [
        "It matters only because wrong notes sound unpleasant to listen to",
        "It does not matter, since any version played is equally acceptable",
        "It matters only because it affects the player's grade for the term",
      ],
      explanation: "Because the Anthem is a national symbol, learners are encouraged to prepare and play its melody with genuine care — this is the Citizenship competency linked to sub-strand 2.2, not only about getting a good grade or a pleasant sound.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A school in ${place(rng)} asks recorder learners, including ${who}, to practise the Kenya National Anthem's main melody repeatedly before performing it publicly. What is the best reason for this repeated practice?`,
      correct: "Confident, accurate performance of the Anthem shows respect for the nation and requires the same careful technique as any other melody",
      wrong: [
        "Repeated practice is only needed because the Anthem's melody is unusually difficult",
        "Repeated practice is a punishment for learners who play too many wrong notes",
        "Repeated practice is unnecessary since teachers can play the Anthem instead",
      ],
      explanation: "Performing the Anthem well combines the same fingering, tonguing and posture skills used for any melody with the added responsibility of representing the nation respectfully, which is why it is practised carefully rather than left to chance.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, is asked to explain to a younger pupil why the class specifically practises the Kenya National Anthem's melody on the descant recorder, rather than only practising random tunes. What is the best explanation ${who} could give?`,
      correct: "Learning the Anthem's melody lets learners take part respectfully in national occasions, which is part of being a good citizen",
      wrong: [
        "The Anthem is practised because it uses the fewest notes of any recorder piece",
        "The Anthem is practised only because it appears most often on tests",
        "The Anthem is practised because it does not require good fingering or tonguing",
      ],
      explanation: "The Anthem is chosen specifically because performing it well lets learners participate meaningfully in national ceremonies — the Citizenship competency named for this sub-strand — while still using the same technique skills built through general recorder practice.",
    };
  },
];

// ---- Hygiene / linked-area (Agriculture) reasoning ----

const HYGIENE_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} finishes a recorder lesson in ${place(rng)} and several classmates want to try the same recorder next. What hygiene measure should ${who} follow before passing it on?`,
      correct: "Clean the mouthpiece properly (or avoid sharing without cleaning) before another learner plays the same recorder",
      wrong: [
        "Pass the recorder on immediately, since recorders never need cleaning",
        "Play it for a few more minutes first so it 'warms up' for the next learner",
        "Only clean the recorder once a term, regardless of how often it is shared",
      ],
      explanation: "The linked hygiene measures (from the Agriculture link to this sub-strand) mean a shared mouth-blown instrument like a descant recorder should be cleaned or not shared unhygienically between players, protecting everyone's health.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `After a rainy season music practice in ${place(rng)}, ${who} puts the descant recorder away still damp inside from playing. What hygiene problem could this cause later?`,
      correct: "Moisture left inside the recorder can encourage the growth of mould or bacteria over time",
      wrong: [
        "The recorder will automatically change its pitch permanently",
        "Damp storage makes the recorder impossible to play again",
        "Damp storage has no effect on hygiene, only on the wood's colour",
      ],
      explanation: "A descant recorder is a mouth-blown instrument, so drying it out and storing it properly after playing is part of the hygiene measures the curriculum links to Agriculture — leaving it damp can allow mould or bacteria to build up.",
    };
  },
];

// ---- True/false technique statements, feeding the categorize branch (5th distinct QuestionKind) ----

const TECHNIQUE_STATEMENTS: { text: string; isGood: boolean }[] = [
  { text: "Covering each finger hole fully and firmly with the fingertip helps produce a clear, in-tune note", isGood: true },
  { text: "Using the tongue to say \"too\" or \"doo\" at the start of each note helps separate notes cleanly", isGood: true },
  { text: "Sitting up straight, holding the recorder at a comfortable angle, supports steady breathing", isGood: true },
  { text: "Blowing as hard as possible always produces the clearest, best-sounding note", isGood: false },
  { text: "Leaving a finger hole half-covered on purpose is the correct way to play every note", isGood: false },
  { text: "Slouching while playing has no effect on breath support or tone", isGood: false },
  { text: "Practising slowly at first helps build accurate fingering before playing a melody at full speed", isGood: true },
  { text: "Notes will always sound clean and separate whether or not the tongue is used to start them", isGood: false },
  { text: "Checking the fingering chart before playing an unfamiliar note helps avoid wrong pitches", isGood: true },
  { text: "Once fingering is learned, tonguing and posture no longer matter for a good tone", isGood: false },
  { text: "Resting the recorder gently against the lower lip, rather than biting down, protects both the mouthpiece and the player's teeth", isGood: true },
  { text: "A player's posture only affects how they look, never the sound they actually produce", isGood: false },
];

const TECHNIQUE_CATEGORIZE_PROMPTS = [
  "Sort each statement as good technique or a common mistake.",
  "Which statements describe good technique, and which describe a mistake? Sort them.",
  "Sort these recorder-playing statements into good technique or common mistake.",
  "Decide whether each statement is good technique or a common mistake, and sort it.",
  "Classify each statement as good technique or a common mistake.",
] as const;

export const descantRecorder: Skill = {
  id: "g6-cas-descant-recorder",
  code: "P.2",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-performing-displaying",
  grade: 6,
  title: "Descant Recorder",
  description: "Playing notes C to D1 on the descant recorder with correct fingering, tonguing and posture; playing melodies in that range; and practising the Kenya National Anthem's main melody respectfully.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "identify-note",
        "scale-order",
        "technique-match",
        "technique-categorize",
        "reasoning",
        "citizenship",
        "hygiene",
        "fill-blank",
      ] as const
    );

    if (branch === "identify-note") {
      const target = randChoice(rng, NOTES);
      const others = NOTES.filter((n) => n !== target);
      const wrongChoices = shuffle(rng, others).slice(0, 3);
      const choices = shuffle(rng, [NOTE_LABELS[target], ...wrongChoices.map((n) => NOTE_LABELS[n])]);
      const PROMPTS = [
        "Which note does this recorder fingering play?",
        "Identify the note shown by this recorder fingering.",
        "Look at the covered and open holes below — which note is this?",
        "This fingering chart shows one note of the C to D1 range. Which note is it?",
        "Read the fingering below and name the note being played.",
      ] as const;
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, PROMPTS),
        visual: { type: "recorder-fingering", note: target },
        choices,
        correctIndex: choices.indexOf(NOTE_LABELS[target]),
        layout: "list",
        hint: "Compare the covered (dark) and open (light) holes against the note names from C up to D1.",
        explanation: `This fingering plays ${NOTE_LABELS[target]}. The descant recorder's full range for Grade 6 runs from C up to D1, each with its own Baroque fingering.`,
      };
    }

    if (branch === "scale-order") {
      const shuffled = shuffle(rng, NOTES);
      const ORDER_PROMPTS = [
        "Arrange these descant recorder notes in ascending order, from lowest to highest.",
        "Put these notes in order from C up to D1.",
        "Sort these recorder notes from lowest pitch to highest pitch.",
        "Place these notes in the correct ascending scale order.",
        "Order these notes the way you would play them ascending on the recorder.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        items: shuffled.map((n) => ({ id: n, label: NOTE_LABELS[n] })),
        correctOrder: [...NOTES],
        instruction: "Drag to arrange from lowest to highest.",
        hint: "The full ascending range is C, D, E, F, G, A, B, then C1 and D1 an octave higher.",
        explanation: "Ascending order: " + NOTES.map((n) => NOTE_LABELS[n]).join(" → ") + ".",
      };
    }

    if (branch === "technique-match") {
      const tokens = shuffle(rng, TECHNIQUES.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, TECHNIQUES.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of TECHNIQUES) correctMap[t.id] = t.id;
      const MATCH_PROMPTS = [
        "Match each descant recorder playing technique to what it governs.",
        "Pair each playing technique with what it is responsible for.",
        "Match each term below to its correct meaning for descant recorder playing.",
        "Which description matches each playing technique?",
        "Connect each recorder technique to the part of playing it controls.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Fingering controls pitch, tonguing controls clean starts/stops, posture supports breath and tone.",
        explanation: TECHNIQUES.map((t) => `${t.label} — ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "technique-categorize") {
      const chosen = shuffle(rng, TECHNIQUE_STATEMENTS).slice(0, 7);
      const items = chosen.map((s, i) => ({ id: `t${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`t${i}`] = s.isGood ? "good" : "mistake"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, TECHNIQUE_CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "good", label: "Good technique" },
          { id: "mistake", label: "Common mistake" },
        ],
        correctBucket,
        hint: "Good technique protects fingering accuracy, clean note starts, and breath support.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.isGood ? "good technique" : "a common mistake"}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Fingering sets the pitch, tonguing separates notes cleanly, and posture supports breath and tone.", explanation: q.explanation };
    }

    if (branch === "citizenship") {
      const q = randChoice(rng, CITIZENSHIP_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about why performing a national symbol carefully matters, beyond just the music itself.", explanation: q.explanation };
    }

    if (branch === "hygiene") {
      const q = randChoice(rng, HYGIENE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "A mouth-blown instrument needs the same kind of hygiene care as any shared item.", explanation: q.explanation };
    }

    const FILL_BLANKS: FillBlankTemplate[] = [
      { before: "The lowest note in the Grade 6 descant recorder range is ", after: ".", correctAnswer: "C", hint: "It is the very first note of the C to D1 range.", explanation: "The full range for Grade 6 starts at C, the lowest note, and rises to D1." },
      { before: "The highest note in the Grade 6 descant recorder range is ", after: ".", correctAnswer: "D1", acceptedAnswers: ["D1", "D"], hint: "It is one note above C1.", explanation: "The full range for Grade 6 runs from C up to D1, the highest note in this range." },
      { before: "The playing technique that determines which finger holes are covered to set the pitch is called ", after: ".", correctAnswer: "fingering", hint: "Think about what your fingers physically do on the holes.", explanation: "Fingering is the technique of covering or opening the correct holes to produce the intended pitch." },
      { before: "The playing technique of using the tongue to start and stop each note cleanly is called ", after: ".", correctAnswer: "tonguing", hint: "Think about the part of the mouth used to separate notes.", explanation: "Tonguing uses the tongue to start and stop each note cleanly, keeping a melody from sounding blurred." },
      { before: "Holding the recorder and body correctly to support good breath control and tone is called ", after: ".", correctAnswer: "posture", hint: "Think about how the whole body is positioned, not just the fingers or tongue.", explanation: "Posture is how the recorder and body are held to support steady breathing and a good tone." },
      { before: "The chart used to learn recorder fingerings for notes C to D1 is called a ", after: " fingering chart.", correctAnswer: "Baroque", hint: "It is the specific named fingering system used for the descant recorder.", explanation: "Grade 6 learners use the Baroque fingering chart for the notes C D E F G A B C1 D1." },
      { before: "The well-known piece whose main melody Grade 6 learners practise respectfully on the descant recorder is the Kenya National ", after: ".", correctAnswer: "Anthem", hint: "It is a national symbol performed at ceremonies.", explanation: "Sub-strand 2.2 names the Kenya National Anthem's main melody as the piece learners practise, linking the Citizenship competency to recorder playing." },
      { before: "Between C1 and D1 on the recorder, the note that is played using the thumb octave-vent hole for the higher octave sound alongside C's fingering pattern is ", after: ".", correctAnswer: "C1", hint: "It is the lower of the two octave notes.", explanation: "C1 is C played an octave higher, using the thumb vent hole together with a fingering close to C's pattern." },
      { before: "Before sharing a descant recorder with a classmate, a learner should clean the ", after: " for hygiene.", correctAnswer: "mouthpiece", acceptedAnswers: ["mouthpiece", "windway"], hint: "Think about the part that touches the mouth directly.", explanation: "Because the recorder is a mouth-blown instrument, the mouthpiece should be cleaned before sharing, matching the hygiene measures linked to this sub-strand." },
      { before: "Leaving a descant recorder damp inside after playing can encourage the growth of ", after: " over time.", correctAnswer: "mould", acceptedAnswers: ["mould", "mold", "bacteria"], hint: "Think about what grows in a damp, enclosed space.", explanation: "A damp recorder interior can allow mould or bacteria to build up, which is why drying and proper storage are part of good hygiene after playing." },
      { before: "A note played ascending directly after B, at the start of the higher octave, is ", after: ".", correctAnswer: "C1", hint: "It is C, but an octave higher than the first note of the range.", explanation: "Ascending past B, the next note is C1 — the same letter name as C but an octave higher." },
    ];

    const FILL_BLANK_PROMPTS = [
      "Complete the sentence.",
      "Fill in the missing word.",
      "Complete this sentence about the descant recorder.",
      "Fill in the blank below.",
      "Complete the sentence with the correct word.",
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: fb.acceptedAnswers ?? [fb.correctAnswer],
      inputMode: "text",
      hint: fb.hint,
      explanation: fb.explanation,
    };
  },
};
