import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, cap, type ScenarioMC } from "./sharedG10";

// KICD Grade 10 Music and Dance 2.2 "Western Style Solo Songs" names: performance techniques
// (phrasing, posture, diction, poise, musicianship — 5, hard floor), performance directions
// (tempo, dynamics, repeats and reiterations — 3), accuracy (pitch, rhythm — 2), and Western solo
// song types (lieder, arias, folk songs — 3). "Folk songs" here means the WESTERN tradition
// (German lieder, opera arias, Western folk song) — a deliberately distinct content item from
// 2.1's Kenyan folk songs (a different sub-strand/agent). Every branch below that names "folk
// songs" frames it explicitly as Western/foreign-tradition and, where a song-type scenario is
// being judged, offers "a Kenyan folk song" as a curated wrong answer so the distinction is
// actively tested, not just asserted. No VisualSpec in types.ts genuinely fits solo vocal
// performance (no "singer"/"stage" visual exists) — this is a deliberate, documented skip per
// the mining guide's "declined with a reason" discipline, matching the precedent in
// agricultureG6/rearingSmallDomesticAnimals.ts.

type Category = "technique" | "direction" | "songtype" | "accuracy";

const TECHNIQUES = [
  { id: "phrasing", label: "Phrasing", definition: "Grouping notes and words into natural musical sentences, with breath and shaping at the right points, so a melody flows instead of sounding chopped up" },
  { id: "posture", label: "Posture", definition: "Standing tall with relaxed, open shoulders and chest so the breath can support the voice freely" },
  { id: "diction", label: "Diction", definition: "Shaping vowels and consonants clearly so an audience can understand every word being sung" },
  { id: "poise", label: "Poise", definition: "Presenting a calm, composed, confident stage presence throughout a performance, even under pressure" },
  { id: "musicianship", label: "Musicianship", definition: "Overall sensitivity to pitch, rhythm, dynamics and expression that shows real musical understanding, not just technically correct notes" },
] as const;

const DIRECTIONS = [
  { id: "tempo", label: "Tempo", definition: "The overall speed a passage should be sung at, as marked in the score" },
  { id: "dynamics", label: "Dynamics", definition: "The marked levels of loudness and softness a passage should be sung at" },
  { id: "repeats", label: "Repeats and reiterations", definition: "Sections or phrases the score instructs to be sung again, sometimes with added expression the second time" },
] as const;

const SONG_TYPES = [
  { id: "lieder", label: "Lieder", definition: "German art songs for solo voice and piano that set a poem to music, often expressing deep personal emotion (e.g. the songs of Schubert)" },
  { id: "arias", label: "Arias", definition: "Solo songs from within an opera or oratorio, sung in character as part of a staged dramatic work, often technically demanding" },
  { id: "folksongs", label: "Western folk songs", definition: "Simple traditional songs passed down within a Western cultural tradition, telling everyday stories — distinct from Kenyan folk songs, which come from Kenyan communities" },
] as const;

const ACCURACY = [
  { id: "pitch", label: "Pitch accuracy", definition: "Singing the exact notated notes without straying flat or sharp" },
  { id: "rhythm", label: "Rhythm accuracy", definition: "Singing note durations exactly as notated, without unintentionally rushing or dragging" },
] as const;

type FactId = string;
interface CategoryFact { id: FactId; text: string; category: Category; label: string }

const CATEGORY_FACTS: CategoryFact[] = [
  ...TECHNIQUES.map((t) => ({ id: t.id, text: t.definition, category: "technique" as const, label: t.label })),
  ...DIRECTIONS.map((d) => ({ id: d.id, text: d.definition, category: "direction" as const, label: d.label })),
  ...SONG_TYPES.map((s) => ({ id: s.id, text: s.definition, category: "songtype" as const, label: s.label })),
  ...ACCURACY.map((a) => ({ id: a.id, text: a.definition, category: "accuracy" as const, label: a.label })),
];

const CATEGORY_LABEL: Record<Category, string> = {
  technique: "Performance technique",
  direction: "Performance direction",
  songtype: "Western solo song type",
  accuracy: "Accuracy element",
};

const TECHNIQUE_MATCH_PROMPTS = [
  "Match each performance technique to what it means.",
  "Pair each of the five performance techniques with its correct meaning.",
  "Connect each technique to the description that explains it.",
  "Match each term below to what a singer actually does when applying it.",
  "Which description fits which technique? Match them correctly.",
  "Work out what each performance technique involves, then match it up.",
  "Pair each technique with the statement that describes it.",
  "Link each of the five techniques to its correct explanation.",
  "Match each performance technique to the behaviour it describes.",
  "For each technique below, find the description that explains it.",
  "Match every technique on the left to its meaning on the right.",
  "Sort out which description belongs to which technique, by matching them.",
  "Correctly match every technique to the description that fits it.",
  "Match each of the five techniques to what a singer is doing when using it well.",
  "Line up each performance technique with what it actually means.",
  "Work out which meaning goes with which technique, then match them.",
  "Match the five techniques to their correct descriptions below.",
  "Figure out what each technique means, then match it to the right term.",
  "Pair up every technique with the statement that correctly describes it.",
  "Match each performance technique to its definition.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each fact by what part of Western solo song performance it describes.",
  "Group these facts under song type, technique, direction, or accuracy.",
  "Decide which category each fact below belongs to, and sort it there.",
  "Sort each statement into the category it best fits.",
  "Place each fact into the correct performance-aspect bucket.",
  "Read each fact and sort it under the category it matches.",
  "Work out which category each fact is about, then sort it there.",
  "Classify each fact by which performance aspect it belongs to.",
  "Organize these facts into their correct category.",
  "Which category does each fact describe? Sort it accordingly.",
  "Sort each statement below into song type, technique, direction, or accuracy.",
  "Drop each fact into the category it's really about.",
  "Group each statement with the category it correctly belongs to.",
  "Decide where each fact fits among the four performance categories.",
  "Sort these facts into their correct performance-aspect groups.",
  "For each fact, work out its category and sort it in.",
  "Place these statements under the category each one matches.",
  "Sort each fact correctly among song type, technique, direction, and accuracy.",
  "Read each statement and file it under the right category.",
  "Assign each fact to the category it best describes.",
] as const;

const ORDER_PROMPTS = [
  "Arrange the stages of preparing a Western solo song for performance in order.",
  "Put these preparation steps into a sensible order.",
  "Sequence the stages of getting a Western solo song ready to perform.",
  "Arrange these actions into the order a careful performer would follow them.",
  "Order these preparation steps the way a Grade 10 music student should carry them out.",
  "Sort these steps into the order they should happen when preparing a solo song.",
  "Put these steps in the order a responsible performer would do them.",
  "Work out the sensible order for these solo-song preparation stages.",
  "Arrange these stages into a logical performance-preparation sequence.",
  "Which order should these preparation stages happen in? Arrange them correctly.",
  "Build a sensible preparation sequence by ordering these stages correctly.",
  "Sequence a performer's preparation stages in the order they should be done.",
  "Order these actions the way they'd happen in a well-planned preparation process.",
  "Arrange the stages of preparing a solo song, in the right order.",
  "Put these stages into the order a careful performer would complete them.",
  "Sequence these steps to build a sensible solo-song preparation process.",
  "Work out the correct order for preparing and performing a solo song.",
  "Arrange these stages as a performer would carry them out.",
  "Order the stages below the way a sensible preparation process would run.",
  "Sequence these preparation stages correctly, from first to last.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Complete the sentence with the correct term.",
  "Fill in the missing performance term.",
  "Which term completes this sentence correctly?",
  "Work out the term that belongs in the blank.",
  "Name the term this sentence is describing.",
  "Identify the missing term below.",
  "Which word or phrase fits this description?",
  "Fill in the blank with the correct performance term.",
  "This sentence is describing which term?",
  "Complete this definition with the correct term.",
  "Work out and fill in the correct term.",
  "Which term matches the description given?",
  "Fill in the term being defined here.",
  "Name the correct term for this description.",
  "Which term best completes this sentence?",
  "Identify the term described in this sentence.",
  "Complete the sentence below with the right term.",
  "Fill in the missing word or phrase.",
  "Work out which term this description points to.",
  "Which term fits the blank in this sentence?",
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "In a Western solo song, ", after: " is the technique of grouping notes and words into natural musical sentences so the melody breathes rather than sounding chopped up.", correctAnswer: "phrasing", acceptedAnswers: ["phrasing"] },
  { before: "Standing tall with relaxed, open shoulders so the breath can support the voice freely describes ", after: ".", correctAnswer: "posture", acceptedAnswers: ["posture"] },
  { before: "Shaping vowels and consonants clearly so an audience understands the sung words describes ", after: ".", correctAnswer: "diction", acceptedAnswers: ["diction"] },
  { before: "A calm, composed, confident stage presence throughout a performance describes ", after: ".", correctAnswer: "poise", acceptedAnswers: ["poise"] },
  { before: "Overall sensitivity to pitch, rhythm, dynamics and expression — not just correct notes — describes ", after: ".", correctAnswer: "musicianship", acceptedAnswers: ["musicianship"] },
  { before: "The performance direction that tells a singer how fast or slow to sing a passage is called ", after: ".", correctAnswer: "tempo", acceptedAnswers: ["tempo"] },
  { before: "The performance direction that tells a singer how loud or soft to sing a passage is called ", after: ".", correctAnswer: "dynamics", acceptedAnswers: ["dynamics"] },
  { before: "A section the score instructs to be sung again, sometimes with added expression, is an example of ", after: ".", correctAnswer: "repeats and reiterations", acceptedAnswers: ["repeats and reiterations", "repeats", "reiteration", "reiterations", "repeat"] },
  { before: "A German art song for solo voice and piano that sets a poem to music is called a ", after: ".", correctAnswer: "lied", acceptedAnswers: ["lied", "lieder"] },
  { before: "A solo song sung in character from within a staged opera or oratorio is called an ", after: ".", correctAnswer: "aria", acceptedAnswers: ["aria", "arias"] },
  { before: "A simple traditional song passed down within a Western cultural tradition, not a Kenyan community, is a Western ", after: ".", correctAnswer: "folk song", acceptedAnswers: ["folk song", "folksong"] },
  { before: "Singing the exact notated notes without straying flat or sharp is called ", after: " accuracy.", correctAnswer: "pitch", acceptedAnswers: ["pitch"] },
  { before: "Singing note durations exactly as notated, without unintentionally rushing or dragging, is called ", after: " accuracy.", correctAnswer: "rhythm", acceptedAnswers: ["rhythm"] },
] as const;

// 8-step preparation sequence, condensed directly from the design's own Suggested Learning
// Experiences bullet order for 2.2 (already a suggested teaching sequence).
const PREP_STEPS = [
  { id: "listen", label: "Listen to or watch performances of lieder, arias, and solo songs from musicals to become familiar with them" },
  { id: "discuss", label: "Discuss the performance practice of Western solo songs such as lieder, arias, and folk songs" },
  { id: "review", label: "Review videos of Western solo songs to identify their styles of singing" },
  { id: "execute", label: "Execute the various vocal styles used in Western solo songs" },
  { id: "select", label: "Select a suitable Western solo song for performance, acknowledging the source" },
  { id: "perform", label: "Perform the selected song before an audience, observing the performance techniques" },
  { id: "record", label: "Record the performance using a digital device and upload it to a digital portfolio" },
  { id: "evaluate", label: "Evaluate the performance, self and others, and give respectful feedback" },
] as const;

// ---- Apply-tier reasoning pool: 13 situation facts x (6 openers x 4 closers = 24 frames) ≈ 300+ templates ----
interface ReasonFact { situation: string; correct: string; wrong: string[]; explanation: string }

const REASON_FACTS: ReasonFact[] = [
  {
    situation: "a singer rushes through every phrase of a lieder without ever pausing to breathe at the natural points marked in the score",
    correct: "The singer needs to work on phrasing — shaping the melody into natural musical sentences with breath at the right points",
    wrong: [
      "The singer needs to work on diction, since the real issue is unclear vowels",
      "The singer needs to work on poise, since rushing is always a sign of nervousness on stage",
      "The singer simply needs a faster tempo marking from the composer",
    ],
    explanation: "Rushing through phrases without breathing at the natural points is a phrasing problem, not a diction, poise, or tempo one — phrasing is specifically about grouping notes and words into sentences that breathe.",
  },
  {
    situation: "an audience at a school concert says they could barely make out any of the words during a solo song, even though every pitch sounded accurate",
    correct: "The singer needs to work on diction — shaping vowels and consonants more clearly",
    wrong: [
      "The singer needs to work on musicianship, since pitch accuracy is what musicianship measures",
      "The singer needs to work on phrasing, since unclear words are always a breathing problem",
      "The singer needs a slower tempo, since faster singing always blurs the words",
    ],
    explanation: "Accurate pitch does not guarantee understandable words — that is specifically diction. Musicianship is about overall expressive sensitivity, not word clarity, so it is not the right fix here.",
  },
  {
    situation: "a singer stands hunched with tense, raised shoulders throughout a performance, and their breath sounds shallow and strained",
    correct: "The singer needs to work on posture — standing tall with relaxed, open shoulders so the breath can support the voice",
    wrong: [
      "The singer needs to work on dynamics, since shallow breath always means singing too softly",
      "The singer needs to work on diction, since tense shoulders always distort vowels",
      "The singer simply needs to sing a shorter piece",
    ],
    explanation: "Hunched shoulders and shallow, strained breath are a posture problem — good posture is what lets the breath support the voice freely.",
  },
  {
    situation: "a singer's face looks anxious throughout a performance, their hands fidget constantly, and their eyes dart around the room",
    correct: "The singer needs to work on poise — presenting a calm, composed, confident stage presence",
    wrong: [
      "The singer needs to work on rhythm accuracy, since visible anxiety always means uneven timing",
      "The singer needs to work on phrasing, since fidgeting is always a breathing issue",
      "The singer simply needs a shorter, easier song to perform",
    ],
    explanation: "Visible anxiety, fidgeting, and darting eyes describe a lack of poise — calm, composed stage presence — not a rhythm or phrasing issue, which are about the sound of the singing itself.",
  },
  {
    situation: "a singer performs every note and rhythm exactly as written, but the performance still feels flat and mechanical, with no real expressive shaping",
    correct: "The singer needs to work on musicianship — the overall sensitivity to pitch, rhythm, dynamics and expression that goes beyond just correct notes",
    wrong: [
      "The singer needs to work on pitch accuracy, since a flat performance always means wrong notes",
      "The singer needs to work on diction, since expression always comes from clearer vowels",
      "The singer simply performed the wrong song for their voice type",
    ],
    explanation: "Correct notes and rhythms with no expressive shaping is exactly what musicianship measures — technical correctness alone is not the same as real musical understanding.",
  },
  {
    situation: "the score is clearly marked \"Allegro\" (fast) for the opening verse, but the singer performs it very slowly from the very first note",
    correct: "The singer is not observing the tempo direction marked in the score",
    wrong: [
      "The singer is not observing the dynamics direction marked in the score",
      "The singer is not observing the repeats and reiterations marked in the score",
      "The singer's rhythm accuracy is the actual problem, not tempo",
    ],
    explanation: "Tempo is the marked overall speed of a passage — ignoring an \"Allegro\" marking and singing slowly is a tempo problem, distinct from dynamics (loud/soft) or rhythm accuracy (individual note durations).",
  },
  {
    situation: "a passage marked \"piano\" (soft) in the score is instead sung loudly throughout by the performer",
    correct: "The singer is not observing the dynamics direction marked in the score",
    wrong: [
      "The singer is not observing the tempo direction marked in the score",
      "The singer's diction is the actual problem here",
      "The singer is not observing the repeats and reiterations marked in the score",
    ],
    explanation: "Dynamics are the marked levels of loudness and softness — singing a \"piano\" passage loudly ignores the dynamics marking, not the tempo, diction, or repeat markings.",
  },
  {
    situation: "the score has a repeat sign at the end of the first verse, but the performer sings straight through to the second verse without repeating it",
    correct: "The singer is not observing the repeats and reiterations marked in the score",
    wrong: [
      "The singer is not observing the tempo direction marked in the score",
      "The singer is not observing the dynamics direction marked in the score",
      "The singer's posture is the actual problem here",
    ],
    explanation: "Repeats and reiterations are sections the score instructs to be sung again — skipping a marked repeat sign is specifically a repeats-and-reiterations issue, not tempo, dynamics, or posture.",
  },
  {
    situation: "a piece is described as a German art song for solo voice and piano, setting a poem to music and expressing deep personal emotion",
    correct: "This describes a lied (plural: lieder)",
    wrong: [
      "This describes an aria",
      "This describes a Western folk song",
      "This describes a Kenyan folk song",
    ],
    explanation: "A German art song for solo voice and piano built from a poem is specifically a lied — distinct from an aria (from a staged opera), a Western folk song (a simple traditional tune), and a Kenyan folk song (from a Kenyan community tradition, studied separately in 2.1).",
  },
  {
    situation: "a piece is described as a demanding solo song sung in character as part of a staged opera scene, with an orchestra accompanying the singer",
    correct: "This describes an aria",
    wrong: [
      "This describes a lied",
      "This describes a Western folk song",
      "This describes a Kenyan folk song",
    ],
    explanation: "A solo song performed in character as part of a staged opera or oratorio is an aria — a lied is written for voice and piano outside of staging, and a folk song (Western or Kenyan) is a simple traditional tune, not a staged operatic piece.",
  },
  {
    situation: "a piece is described as a simple, traditional English tune passed down for generations, telling an everyday story, with no known composer",
    correct: "This describes a Western folk song, not a Kenyan folk song",
    wrong: [
      "This describes a Kenyan folk song",
      "This describes an aria",
      "This describes a lied",
    ],
    explanation: "A simple traditional song with no known composer, passed down within a Western cultural tradition, is a Western folk song — the same category name as Kenyan folk songs, but from a different tradition, which is why 2.2 and 2.1 are studied as separate sub-strands.",
  },
  {
    situation: "a singer sings a passage with the correct rhythm and dynamics throughout, but one particular note consistently sounds slightly below its true pitch",
    correct: "This is a pitch accuracy problem — the note is being sung flat",
    wrong: [
      "This is a rhythm accuracy problem",
      "This is a dynamics problem",
      "This is a tempo problem",
    ],
    explanation: "Singing a note consistently below its true pitch is specifically a pitch accuracy issue, separate from rhythm (note duration), dynamics (loudness), or tempo (overall speed).",
  },
  {
    situation: "a singer's overall tempo for a passage stays correct, but individual note durations keep unintentionally speeding up and slowing down within it",
    correct: "This is a rhythm accuracy problem, not a tempo problem",
    wrong: [
      "This is a tempo problem, since any timing issue is a tempo issue",
      "This is a dynamics problem",
      "This is a diction problem",
    ],
    explanation: "Tempo is the overall marked speed of a passage; rhythm accuracy is about the precise duration of individual notes within it. Uneven note durations inside an otherwise correct overall speed is a rhythm accuracy issue, not tempo.",
  },
];

const OPENERS: ((rng: RNG, fact: ReasonFact) => string)[] = [
  (rng, fact) => `${name(rng)} is preparing for a Senior School music recital in ${place(rng)}, where ${fact.situation}`,
  (rng, fact) => `During a rehearsal at a school in ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `${name(rng)}, a Grade 10 music student, is practising a solo song, and ${fact.situation}`,
  (rng, fact) => `At a school concert in ${place(rng)}, ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `${name(rng)}'s music teacher points out that ${fact.situation}`,
];

const CLOSERS = [
  "What should the singer work on?",
  "What does this describe?",
  "Which conclusion best fits this situation?",
  "What is the singer missing?",
] as const;

/** Compose openers x closers into ScenarioMC frames, but keep a fact-specific explanation
 * (rather than sharedG10.combineFrames's default of reusing the bare correct answer as the
 * explanation) so wrong answers get their misconception named, per RIGOR-STANDARDS.md. */
function makeFrames(): ((rng: RNG, fact: ReasonFact) => ScenarioMC)[] {
  const frames: ((rng: RNG, fact: ReasonFact) => ScenarioMC)[] = [];
  for (const opener of OPENERS) {
    for (const closer of CLOSERS) {
      frames.push((rng, fact) => ({
        prompt: `${opener(rng, fact)}. ${closer}`,
        correct: fact.correct,
        wrong: fact.wrong,
        explanation: fact.explanation,
      }));
    }
  }
  return frames;
}

const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, makeFrames());

export const westernStyleSoloSongs: Skill = {
  id: "g10-mad-western-style-solo-songs",
  code: "2.2",
  subjectId: "music-and-dance",
  strandId: "g10-mad-performing",
  grade: 10,
  title: "Western Style Solo Songs",
  description: "Performance style, accuracy (pitch, rhythm), performance directions (tempo, dynamics, repeats and reiterations) and techniques (phrasing, posture, diction, poise, musicianship) for Western solo songs — lieder, arias, and Western folk songs.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["technique-match", "categorize-facts", "prep-order", "reasoning", "fill-blank"] as const
    );
    const hint = "The five performance techniques are phrasing, posture, diction, poise and musicianship — each fixes a different kind of performance problem.";

    if (branch === "technique-match") {
      const tokens = shuffle(rng, TECHNIQUES.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, TECHNIQUES.map((t) => ({ id: t.id, label: t.definition })));
      const correctMap: Record<string, string> = {};
      for (const t of TECHNIQUES) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, TECHNIQUE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: TECHNIQUES.map((t) => `${t.label}: ${t.definition}.`).join(" "),
      };
    }

    if (branch === "categorize-facts") {
      const chosen = shuffle(rng, CATEGORY_FACTS).slice(0, 8);
      const items = chosen.map((c) => ({ id: c.id, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c.id] = c.category));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (Object.keys(CATEGORY_LABEL) as Category[]).map((c) => ({ id: c, label: CATEGORY_LABEL[c] })),
        correctBucket,
        hint: "Song types are lieder/arias/folk songs; techniques are phrasing/posture/diction/poise/musicianship; directions are tempo/dynamics/repeats; accuracy is pitch/rhythm.",
        explanation: chosen.map((c) => `"${c.text}" describes ${c.label} — a ${CATEGORY_LABEL[c.category].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "prep-order") {
      const shuffled = shuffle(rng, PREP_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PREP_STEPS.map((s) => s.id),
        hint: "Start with listening and discussing, then rehearse, select, perform, record, and finally evaluate.",
        explanation: PREP_STEPS.map((s) => s.label).join(" → "),
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
        hint,
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.acceptedAnswers],
      inputMode: "text",
      hint,
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`.replace(/\s+/g, " ").trim(),
    };
  },
};
