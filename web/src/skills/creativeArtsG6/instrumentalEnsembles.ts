import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { place, name, buildScenarioChoices, expandScenarios } from "./g6CasShared";
import type { ScenarioMC, FillBlankTemplate } from "./g6CasShared";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Creative Arts, Strand 2.0 Performing and Displaying, Sub-strand 2.3 Indigenous
// Kenyan Instrumental Ensembles (P.3). Source: three named ensemble categories — percussion,
// wind, string; seven named factors to consider when playing in an ensemble — choosing an
// appropriate instrument, tuning, playing technique, tempo, synchrony with other
// instrumentalists, accuracy in rhythm/melody, improvisation of rhythms and melodies. Core
// competencies: Citizenship (interacts with/plays indigenous Kenyan instruments), Communication
// and collaboration (teams up with peers to perform as an ensemble). No visual: none of the
// existing generic VisualSpec types (icon-set's fixed icon set is apple/ball/coin/cube/book/
// pencil — nothing musical) fit this content without inventing a mismatched image, so this file
// deliberately goes visual-light and leans on the strong 3-category x 7-factor content matrix for
// kind variety instead, per the brief's explicitly allowed fallback.

const INSTRUMENTS = [
  { id: "ngoma", label: "Ngoma (drum)", category: "percussion" },
  { id: "isukuti", label: "Isukuti (drum)", category: "percussion" },
  { id: "kayamba", label: "Kayamba (shaker tray)", category: "percussion" },
  { id: "chapuo", label: "Chapuo (rattle)", category: "percussion" },
  { id: "manyanga", label: "Manyanga (ankle rattles)", category: "percussion" },
  { id: "filimbi", label: "Filimbi (flute)", category: "wind" },
  { id: "siwa", label: "Siwa (ceremonial horn)", category: "wind" },
  { id: "coro", label: "Coro (horn)", category: "wind" },
  { id: "kuduhorn", label: "Kudu horn (animal-horn trumpet)", category: "wind" },
  { id: "nyatiti", label: "Nyatiti (lyre)", category: "string" },
  { id: "orutu", label: "Orutu (one-string fiddle)", category: "string" },
  { id: "litungu", label: "Litungu (lyre)", category: "string" },
  { id: "obokano", label: "Obokano (lyre)", category: "string" },
  { id: "wandindi", label: "Wandindi (one-string fiddle)", category: "string" },
  { id: "zeze", label: "Zeze (fiddle/lute)", category: "string" },
] as const;

const CATEGORIES = [
  { id: "percussion", label: "Percussion" },
  { id: "wind", label: "Wind" },
  { id: "string", label: "String" },
] as const;

const FACTORS = [
  { id: "instrument-choice", label: "Choosing an appropriate instrument", meaning: "Selecting an instrument that suits the player's role and physical ability in the ensemble" },
  { id: "tuning", label: "Tuning", meaning: "Adjusting the instrument so its pitch matches the rest of the ensemble before playing" },
  { id: "playing-technique", label: "Playing technique", meaning: "Using the correct method of producing sound on the instrument, such as striking, plucking or blowing" },
  { id: "tempo", label: "Tempo", meaning: "Keeping the same speed of the beat as the rest of the ensemble" },
  { id: "synchrony", label: "Synchrony with other instrumentalists", meaning: "Playing together at the same time as the other performers, without lagging behind or rushing ahead" },
  { id: "accuracy", label: "Accuracy in rhythm and melody", meaning: "Playing the correct rhythmic pattern and melodic notes without mistakes" },
  { id: "improvisation", label: "Improvisation of rhythms and melodies", meaning: "Creatively varying rhythms or melodies within the performance while still fitting the ensemble" },
] as const;

const ENSEMBLE_PREP_STEPS = [
  { id: "s1", label: "Observe an indigenous Kenyan instrumental ensemble performance and classify it into a category" },
  { id: "s2", label: "Identify which instruments belong to that ensemble category" },
  { id: "s3", label: "Brainstorm the factors to consider for successful playing in the ensemble" },
  { id: "s4", label: "Select an instrument to perform with in the ensemble" },
  { id: "s5", label: "Tune the selected instrument using the appropriate technique" },
  { id: "s6", label: "Handle the instrument with care while practising and playing in the ensemble" },
] as const;

// ---- Apply/Analyze-tier reasoning: each factor's real consequence, Kenyan-localized ----

interface FactorFact {
  id: string;
  situation: string;
  correct: string;
  wrong: string[];
  explanationTail: string;
}

const FACTOR_FACTS: readonly FactorFact[] = [
  {
    id: "instrument-choice",
    situation: "is given a large, heavy drum to carry and play even though they are the smallest and youngest player in the group",
    correct: "The group should reconsider the instrument assignment, since choosing an instrument suited to each player's ability is one of the ensemble factors",
    wrong: [
      "It does not matter which instrument each player is given, as long as the ensemble owns enough instruments overall",
      "The player should simply stop attending rehearsals instead of raising the problem",
      "Instrument choice only matters for the lead performer, never for every player",
    ],
    explanationTail: "Choosing an appropriate instrument for each player — one of the seven ensemble factors — means matching the instrument to the player's role and ability, not just filling every position with any instrument available.",
  },
  {
    id: "tuning",
    situation: "starts playing before checking that their instrument's pitch matches the rest of the ensemble",
    correct: "The player's part is likely to sound out of tune with the rest of the ensemble",
    wrong: [
      "The player's part will automatically match the others regardless of tuning",
      "Tuning only matters for wind instruments, never for string or percussion instruments",
      "Skipping tuning makes the whole ensemble play faster",
    ],
    explanationTail: "Tuning means adjusting an instrument's pitch to match the rest of the ensemble before playing — skipping it risks a performance that sounds out of tune, however well the player performs otherwise.",
  },
  {
    id: "playing-technique",
    situation: "strikes a percussion instrument with the wrong part of the hand, producing a weak, unclear sound",
    correct: "The player should correct their playing technique on that instrument to produce a clear, well-formed sound",
    wrong: [
      "The instrument itself must be broken if the sound comes out unclear",
      "Playing technique only matters for string instruments, never percussion",
      "A weak sound simply means the player should play louder instead of correcting technique",
    ],
    explanationTail: "Playing technique — the correct method of producing sound on an instrument — directly affects tone quality; a weak or unclear sound usually points to a technique problem, not a broken instrument.",
  },
  {
    id: "tempo",
    situation: "plays their part noticeably faster than the rest of the ensemble during a performance",
    correct: "The player has broken the ensemble's shared tempo, which every instrumentalist should keep together",
    wrong: [
      "This is acceptable, since each player may choose their own tempo",
      "Playing faster than the rest of the group always improves a performance",
      "Tempo differences between players have no effect on how the performance sounds",
    ],
    explanationTail: "Tempo is the shared speed of the beat that every instrumentalist in the ensemble should keep together — one player rushing ahead breaks that shared tempo for the whole group.",
  },
  {
    id: "synchrony",
    situation: "consistently starts each musical phrase a moment after the rest of the ensemble",
    correct: "The player is out of synchrony with the other instrumentalists, which should be corrected through more careful listening and practice",
    wrong: [
      "This shows the player has excellent improvisation skills",
      "Starting slightly late has no effect on how the ensemble's performance sounds",
      "The rest of the instrumentalists should instead all wait for this one player",
    ],
    explanationTail: "Synchrony means playing together with the rest of the instrumentalists at the same time — consistently starting late breaks that togetherness and should be fixed through listening and practice, not accepted as normal.",
  },
  {
    id: "accuracy",
    situation: "plays several wrong notes and an incorrect rhythm during a rehearsed piece",
    correct: "The player's accuracy in rhythm and melody needs more practice, since playing the correct notes and rhythm is one of the ensemble factors",
    wrong: [
      "Wrong notes do not matter as long as the player keeps the same tempo as everyone else",
      "Accuracy only matters during a final performance, never during rehearsal",
      "The rest of the ensemble should change their own notes to match the mistakes",
    ],
    explanationTail: "Accuracy in rhythm and melody means playing the correct notes and rhythmic pattern — consistent mistakes should be corrected through more practice, not treated as an acceptable new pattern.",
  },
  {
    id: "improvisation",
    situation: "adds a creative rhythmic variation during a performance that still fits smoothly with what the rest of the ensemble is playing",
    correct: "This is a good example of improvisation — creatively varying the music while still fitting the ensemble",
    wrong: [
      "This is a mistake, since ensemble players should never vary from a fixed part",
      "This shows the player has lost track of the tempo",
      "This kind of variation is only acceptable for wind instrument players",
    ],
    explanationTail: "Improvisation of rhythms and melodies is one of the seven named factors — creatively varying the music while still fitting the rest of the ensemble is a valued skill, not an error.",
  },
];

const FACTOR_FRAMES: ((rng: RNG, fact: FactorFact) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who}, playing in an indigenous instrumental ensemble rehearsal in ${place(rng)}, ${fact.situation}. What is the best description of what is happening?`,
      correct: fact.correct,
      wrong: [...fact.wrong],
      explanation: fact.explanationTail,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `During an ensemble performance at a cultural festival in ${place(rng)}, ${who} ${fact.situation}. What is the best description of what is happening?`,
      correct: fact.correct,
      wrong: [...fact.wrong],
      explanation: fact.explanationTail,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who} joins a school indigenous instrumental ensemble group in ${place(rng)}, and during practice, ${fact.situation}. What should the group understand about this?`,
      correct: fact.correct,
      wrong: [...fact.wrong],
      explanation: fact.explanationTail,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `A teacher recording a video of a school ensemble performing in ${place(rng)} notices that ${who} ${fact.situation}. What does this show?`,
      correct: fact.correct,
      wrong: [...fact.wrong],
      explanation: fact.explanationTail,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `At a community arts day in ${place(rng)}, ${who} ${fact.situation} while playing with the local ensemble. How should this be judged?`,
      correct: fact.correct,
      wrong: [...fact.wrong],
      explanation: fact.explanationTail,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who}'s ensemble tutor in ${place(rng)} pauses rehearsal after noticing that ${who} ${fact.situation}. What is the tutor most likely to point out?`,
      correct: fact.correct,
      wrong: [...fact.wrong],
      explanation: fact.explanationTail,
    };
  },
];

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = expandScenarios(FACTOR_FACTS, FACTOR_FRAMES);

// ---- Citizenship / collaboration reasoning ----

const CITIZENSHIP_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} joins a group of peers in ${place(rng)} to learn and perform in an indigenous Kenyan instrumental ensemble at a community event. Why is this considered an act of good citizenship, not just a music activity?`,
      correct: "Learning and performing indigenous Kenyan instruments helps preserve and honour the country's cultural heritage",
      wrong: [
        "Because indigenous instruments are easier to learn than any other kind of instrument",
        "Because performing in an ensemble is required to pass every music exam",
        "Because indigenous ensembles always use more instruments than other kinds of music groups",
      ],
      explanation: "Citizenship as a core competency here is about valuing and taking part in Kenya's cultural heritage — playing indigenous instruments in an ensemble is one concrete way learners practise and pass on that heritage.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} and classmates in ${place(rng)} must each play a different instrument, stay in tempo together, and listen closely to one another to perform an indigenous ensemble piece well. Which core competency does this teamwork mainly develop?`,
      correct: "Communication and collaboration, since the players must team up and coordinate closely to perform together",
      wrong: [
        "Digital literacy, since ensemble playing mainly involves using digital recording devices",
        "Numeracy, since ensemble playing is mainly about counting money for instruments",
        "None of these — ensemble playing does not build any particular competency",
      ],
      explanation: "Playing together in an ensemble — coordinating tempo, synchrony and listening to peers — is exactly what the Communication and collaboration competency named for this sub-strand describes.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A cultural resource centre near ${place(rng)} invites ${who}'s class to observe and later join in performing with local indigenous instrumentalists. What is the best reason for schools to arrange visits like this?`,
      correct: "It lets learners interact directly with indigenous Kenyan instruments and the communities that play them, building both citizenship and collaboration skills",
      wrong: [
        "It is arranged only so learners can buy instruments cheaply",
        "It has no real educational purpose beyond a day out of class",
        "It is required only for learners who plan to become professional musicians",
      ],
      explanation: "Visiting cultural resource centres connects learners directly to indigenous Kenyan communities and their instruments, supporting the Citizenship and Communication-and-collaboration competencies this sub-strand names.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked to explain to a younger pupil in ${place(rng)} why an indigenous instrumental ensemble needs several different players working together instead of just one skilled soloist. What is the best explanation ${who} could give?`,
      correct: "An ensemble performance depends on players teaming up — choosing instruments, tuning, staying in tempo and synchrony together — which a single soloist cannot do alone",
      wrong: [
        "A soloist could always replace an entire ensemble without changing the music at all",
        "Ensembles only exist because not enough instruments are available for soloists",
        "Working together in an ensemble makes the performance slower for no benefit",
      ],
      explanation: "An ensemble's identity comes from several instrumentalists coordinating together — teaming up is the Communication-and-collaboration competency this sub-strand develops, and it produces a sound no single soloist can replicate alone.",
    };
  },
];

export const instrumentalEnsembles: Skill = {
  id: "g6-cas-instrumental-ensembles",
  code: "P.3",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-performing-displaying",
  grade: 6,
  title: "Indigenous Kenyan Instrumental Ensembles",
  description: "The three categories of indigenous Kenyan instrumental ensembles (percussion, wind, string), the seven factors to consider when playing in an ensemble, and playing a selected instrument in an ensemble.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "identify-category",
        "categorize-instruments",
        "factor-match",
        "prep-order",
        "reasoning",
        "citizenship",
        "fill-blank",
      ] as const
    );

    if (branch === "identify-category") {
      const target = randChoice(rng, INSTRUMENTS);
      const wrongCategories = CATEGORIES.filter((c) => c.id !== target.category).map((c) => c.label);
      const choices = shuffle(rng, [
        CATEGORIES.find((c) => c.id === target.category)!.label,
        ...wrongCategories,
      ]);
      const PROMPTS = [
        `Which ensemble category does the ${target.label} belong to?`,
        `The ${target.label} is used in indigenous Kenyan ensembles. Which category does it belong to?`,
        `Classify the ${target.label} into its correct ensemble category.`,
        `Which of the three ensemble categories does the ${target.label} fall under?`,
        `Is the ${target.label} a percussion, wind, or string instrument?`,
      ] as const;
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, PROMPTS),
        choices,
        correctIndex: choices.indexOf(CATEGORIES.find((c) => c.id === target.category)!.label),
        layout: "list",
        hint: "Percussion instruments are struck or shaken; wind instruments are blown; string instruments are plucked or bowed.",
        explanation: `The ${target.label} is a ${target.category} instrument.`,
      };
    }

    if (branch === "categorize-instruments") {
      const chosen = shuffle(rng, INSTRUMENTS).slice(0, 9);
      const items = chosen.map((it) => ({ id: it.id, label: it.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((it) => (correctBucket[it.id] = it.category));
      const CATEGORIZE_PROMPTS = [
        "Sort each indigenous Kenyan instrument into its ensemble category.",
        "Classify each instrument below as percussion, wind, or string.",
        "Which ensemble category does each of these instruments belong to? Sort them.",
        "Sort these indigenous instruments by how their sound is produced.",
        "Group each instrument below into percussion, wind, or string.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
        correctBucket,
        hint: "Percussion is struck or shaken, wind is blown, string is plucked or bowed.",
        explanation: chosen.map((it) => `${it.label} — ${it.category}.`).join(" "),
      };
    }

    if (branch === "factor-match") {
      const tokens = shuffle(rng, FACTORS.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FACTORS.map((f) => ({ id: f.id, label: f.meaning })));
      const correctMap: Record<string, string> = {};
      for (const f of FACTORS) correctMap[f.id] = f.id;
      const MATCH_PROMPTS = [
        "Match each ensemble-playing factor to what it means.",
        "Pair each factor for playing in an ensemble with its correct meaning.",
        "Which description matches each ensemble factor below?",
        "Connect each named factor to what it involves when playing in an ensemble.",
        "Match each term to its meaning for playing in an instrumental ensemble.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each factor actually controls — pitch, sound, speed, timing, correctness, or creativity.",
        explanation: FACTORS.map((f) => `${f.label} — ${f.meaning}.`).join(" "),
      };
    }

    if (branch === "prep-order") {
      const shuffled = shuffle(rng, ENSEMBLE_PREP_STEPS);
      const ORDER_PROMPTS = [
        "Put these steps for joining and playing in an indigenous Kenyan instrumental ensemble in the correct order.",
        "Arrange these ensemble-preparation steps in the order you would actually carry them out.",
        "Sort these steps into the correct sequence, from first observing an ensemble to playing in one.",
        "Order these steps for preparing to play in an instrumental ensemble, from start to finish.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: ENSEMBLE_PREP_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "You first observe and classify an ensemble, then identify instruments, discuss factors, select, tune, and finally practise with care.",
        explanation: "Correct order: " + ENSEMBLE_PREP_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about which of the seven ensemble factors — instrument choice, tuning, technique, tempo, synchrony, accuracy, or improvisation — is involved.", explanation: q.explanation };
    }

    if (branch === "citizenship") {
      const q = randChoice(rng, CITIZENSHIP_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about how playing indigenous instruments together connects to heritage and teamwork.", explanation: q.explanation };
    }

    const FILL_BLANKS: FillBlankTemplate[] = [
      { before: "The three categories of indigenous Kenyan instrumental ensembles are percussion, wind, and ", after: ".", correctAnswer: "string", hint: "Think about instruments played with strings, like a lyre or fiddle.", explanation: "The three named ensemble categories are percussion, wind, and string." },
      { before: "A ngoma is an example of a ", after: " instrument in an indigenous Kenyan ensemble.", correctAnswer: "percussion", hint: "Think about how a ngoma's sound is produced.", explanation: "A ngoma (drum) is struck, making it a percussion instrument." },
      { before: "A nyatiti is an example of a ", after: " instrument in an indigenous Kenyan ensemble.", correctAnswer: "string", hint: "Think about how a nyatiti's sound is produced.", explanation: "A nyatiti is a lyre with strings that are plucked, making it a string instrument." },
      { before: "A filimbi is an example of a ", after: " instrument in an indigenous Kenyan ensemble.", correctAnswer: "wind", hint: "Think about how a filimbi's sound is produced.", explanation: "A filimbi is a flute, played by blowing, making it a wind instrument." },
      { before: "Adjusting an instrument's pitch to match the rest of the ensemble before playing is called ", after: ".", correctAnswer: "tuning", hint: "Think about what needs checking before a performance starts.", explanation: "Tuning is adjusting an instrument's pitch to match the rest of the ensemble before playing." },
      { before: "Playing together with the rest of the instrumentalists at the same time, without lagging or rushing, is called ", after: ".", correctAnswer: "synchrony", hint: "Think about staying together in time with other players.", explanation: "Synchrony is playing together with the other instrumentalists at the same time." },
      { before: "The shared speed of the beat that every player in an ensemble should keep together is called the ", after: ".", correctAnswer: "tempo", hint: "Think about how fast or slow the music moves.", explanation: "Tempo is the shared speed of the beat that every ensemble player should keep together." },
      { before: "Creatively varying rhythms or melodies while still fitting the rest of the ensemble is called ", after: ".", correctAnswer: "improvisation", hint: "Think about adding something new without breaking the group's sound.", explanation: "Improvisation is creatively varying rhythms or melodies while still fitting the ensemble." },
      { before: "Playing the correct notes and rhythmic pattern without mistakes is called ", after: " in rhythm and melody.", correctAnswer: "accuracy", hint: "Think about getting the notes and rhythm exactly right.", explanation: "Accuracy in rhythm and melody means playing the correct notes and rhythmic pattern without mistakes." },
      { before: "Selecting an instrument that suits a player's role and ability in the ensemble is described as ", after: " an appropriate instrument.", correctAnswer: "choosing", acceptedAnswers: ["choosing", "selecting"], hint: "Think about the very first factor to consider before playing at all.", explanation: "Choosing an appropriate instrument means selecting one that suits the player's role and ability." },
      { before: "The correct method of producing sound on an instrument, such as striking, plucking, or blowing correctly, is called playing ", after: ".", correctAnswer: "technique", hint: "Think about the physical way a player produces sound.", explanation: "Playing technique is the correct method of producing sound on an instrument." },
      { before: "Learning and performing indigenous Kenyan instruments in an ensemble is linked to the core competency of ", after: ", since it honours the country's cultural heritage.", correctAnswer: "citizenship", hint: "Think about the competency connected to national and cultural pride.", explanation: "Citizenship is the core competency linked to interacting with and performing indigenous Kenyan instruments." },
    ];

    const FILL_BLANK_PROMPTS = [
      "Complete the sentence.",
      "Fill in the missing word.",
      "Complete this sentence about instrumental ensembles.",
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
