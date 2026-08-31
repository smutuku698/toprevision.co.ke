import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames, cap } from "./sharedG10";

// KICD Grade 10 Music and Dance sub-strand 1.3 "Transposition" names interval quality (major,
// minor, perfect) and all 7 interval sizes (2nd-8ve), transposition to an interval (2nd, 3rd,
// 4th, 5th, 8ve), transposition treble<->bass, and transposition to a given key (C, G, F, D, A,
// B flat, E flat). No VisualSpec variant genuinely fits this content: `music-note` only covers
// isolated note/rest durations (types.ts), with no notion of an interval, a clef, or a key — and
// no other existing type covers a staff/clef/interval either. Per the mandatory dispatch
// instructions, this is a deliberate, documented skip, not an oversight. Per the source JSON's
// `scopeNotes` for this sub-strand, the printed Core-Competencies/Values/PCI block reads as a
// generic minor-key/notation-software copy/paste artifact and is NOT used to justify a minor-key
// or notation-software branch here — content below stays strictly to intervals/transposition in
// major-key contexts, per the SLOs and learningExperiences.

// ---- Interval-size data: letter-name pairs with their precomputed inclusive size — feeds the
// number-line branch (a genuine numeric quantity: counting letter names inclusively). ----
const INTERVAL_PAIRS = [
  { lower: "C", upper: "D", sizeName: "2nd", sizeNumber: 2 },
  { lower: "C", upper: "E", sizeName: "3rd", sizeNumber: 3 },
  { lower: "C", upper: "F", sizeName: "4th", sizeNumber: 4 },
  { lower: "C", upper: "G", sizeName: "5th", sizeNumber: 5 },
  { lower: "C", upper: "A", sizeName: "6th", sizeNumber: 6 },
  { lower: "C", upper: "B", sizeName: "7th", sizeNumber: 7 },
  { lower: "C", upper: "C (an octave higher)", sizeName: "8ve", sizeNumber: 8 },
  { lower: "D", upper: "F", sizeName: "3rd", sizeNumber: 3 },
  { lower: "D", upper: "A", sizeName: "5th", sizeNumber: 5 },
  { lower: "E", upper: "C (the next one up)", sizeName: "6th", sizeNumber: 6 },
  { lower: "G", upper: "D (the next one up)", sizeName: "5th", sizeNumber: 5 },
  { lower: "F", upper: "C (the next one up)", sizeName: "5th", sizeNumber: 5 },
] as const;

// ---- Vocabulary pool (12 terms) — feeds click-match, sliced to a 7-of-12 subset each draw. ----
const TERMS: { id: string; label: string; meaning: string }[] = [
  { id: "interval", label: "Interval", meaning: "The distance in pitch between two notes, described by both a size and a quality" },
  { id: "melodic-interval", label: "Melodic interval", meaning: "An interval formed by two notes played or sung one after another" },
  { id: "harmonic-interval", label: "Harmonic interval", meaning: "An interval formed by two notes played or sung at the same time" },
  { id: "perfect-interval", label: "Perfect interval", meaning: "The quality used for unisons, 4ths, 5ths and octaves measured from the tonic of a major scale" },
  { id: "major-interval", label: "Major interval", meaning: "The quality used for 2nds, 3rds, 6ths and 7ths measured from the tonic of a major scale" },
  { id: "transposition", label: "Transposition", meaning: "Rewriting a passage of music at a different pitch while keeping the same pattern of intervals between the notes" },
  { id: "transpose-interval", label: "Transposition to an interval", meaning: "Moving every note of a passage up or down by the same fixed interval, such as a major 2nd or a perfect 5th" },
  { id: "transpose-key", label: "Transposition to a given key", meaning: "Rewriting a passage so it fits a new key, adjusting the notes and usually the key signature while keeping the melody's shape" },
  { id: "treble-bass", label: "Treble-to-bass transposition", meaning: "Re-notating a passage written in the treble clef so it is correctly placed on the bass staff" },
  { id: "bass-treble", label: "Bass-to-treble transposition", meaning: "Re-notating a passage written in the bass clef so it is correctly placed on the treble staff" },
  { id: "octave", label: "Octave (8ve)", meaning: "An interval spanning eight letter names, from a note to the next note of the same name" },
  { id: "interval-size", label: "Interval size", meaning: "The number of letter names an interval spans, counted inclusively from the lower note to the higher note" },
];

// ---- Fact pool (14 facts across 3 topics) — feeds categorize, sliced to a 9-of-14 subset. ----
type Topic = "interval-quality" | "interval-size" | "transposition-type";
const TOPIC_LABEL: Record<Topic, string> = {
  "interval-quality": "Interval quality",
  "interval-size": "Interval size",
  "transposition-type": "Type of transposition",
};
const TOPIC_FACTS: { text: string; topic: Topic }[] = [
  { text: "A 4th, 5th, or octave measured from the tonic of a major scale is called a perfect interval", topic: "interval-quality" },
  { text: "A 2nd, 3rd, 6th, or 7th measured from the tonic of a major scale is called a major interval", topic: "interval-quality" },
  { text: "Perfect intervals do not become minor when lowered — they become diminished instead, unlike major intervals which become minor", topic: "interval-quality" },
  { text: "A major interval lowered by a semitone becomes a minor interval of the same size", topic: "interval-quality" },
  { text: "Counting inclusively from C to D spans a 2nd", topic: "interval-size" },
  { text: "Counting inclusively from C to E spans a 3rd", topic: "interval-size" },
  { text: "Counting inclusively from C to G spans a 5th", topic: "interval-size" },
  { text: "Counting inclusively from C to the next C spans an octave (8ve)", topic: "interval-size" },
  { text: "Interval size is counted by letter names, including both the starting and ending note", topic: "interval-size" },
  { text: "Transposing to an interval such as a major 2nd or perfect 5th shifts every note by that same fixed distance", topic: "transposition-type" },
  { text: "Transposing from treble to bass staff keeps the same pitches but changes how they are notated on the staff", topic: "transposition-type" },
  { text: "Transposing to a given key, such as from C major to G major, changes both the notes and usually the key signature while keeping the melody's shape", topic: "transposition-type" },
  { text: "This sub-strand names seven target keys for transposition: C, G, F, D, A, B flat and E flat", topic: "transposition-type" },
  { text: "This sub-strand names five interval sizes for transposing to an interval: 2nd, 3rd, 4th, 5th and octave", topic: "transposition-type" },
];

// ---- Fill-blank pool (12 templates). ----
const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[]; explanation: string }[] = [
  { before: "An interval spanning a 4th, 5th, or octave from the tonic of a major scale is called a ", after: " interval.", correctAnswer: "perfect", acceptedAnswers: ["perfect"], explanation: "4ths, 5ths and octaves measured from the tonic of a major scale are labelled perfect, not major." },
  { before: "An interval spanning a 2nd, 3rd, 6th, or 7th from the tonic of a major scale is called a ", after: " interval.", correctAnswer: "major", acceptedAnswers: ["major"], explanation: "2nds, 3rds, 6ths and 7ths measured from the tonic of a major scale are labelled major." },
  { before: "An interval formed by two notes played one after another is called a ", after: " interval.", correctAnswer: "melodic", acceptedAnswers: ["melodic"], explanation: "Melodic intervals occur when the two notes sound in sequence, not together." },
  { before: "An interval formed by two notes played together is called a ", after: " interval.", correctAnswer: "harmonic", acceptedAnswers: ["harmonic"], explanation: "Harmonic intervals occur when the two notes sound simultaneously." },
  { before: "Counting inclusively, an interval from C up to A spans a ", after: ".", correctAnswer: "6th", acceptedAnswers: ["6th", "sixth"], explanation: "C, D, E, F, G, A — counted inclusively, that is six letter names, a 6th." },
  { before: "Counting inclusively, an interval from C up to F spans a ", after: ".", correctAnswer: "4th", acceptedAnswers: ["4th", "fourth"], explanation: "C, D, E, F — counted inclusively, that is four letter names, a 4th." },
  { before: "This sub-strand names ", after: " interval sizes for transposing to a given interval: 2nd, 3rd, 4th, 5th and octave.", correctAnswer: "five", acceptedAnswers: ["five", "5"], explanation: "The five named sizes for transposing to an interval are 2nd, 3rd, 4th, 5th and 8ve." },
  { before: "This sub-strand names ", after: " target keys for transposition to a given key.", correctAnswer: "seven", acceptedAnswers: ["seven", "7"], explanation: "The seven named target keys are C, G, F, D, A, B flat and E flat." },
  { before: "Transposing a melody from the treble clef so it is correctly placed on the bass staff is called ", after: " transposition.", correctAnswer: "treble-to-bass", acceptedAnswers: ["treble-to-bass", "treble to bass"], explanation: "Treble-to-bass transposition re-notates the same pitches for the bass staff." },
  { before: "An interval spanning eight letter names, from a note to the next note of the same name, is called an ", after: ".", correctAnswer: "octave", acceptedAnswers: ["octave", "8ve"], explanation: "An octave (8ve) spans eight letter names counted inclusively." },
  { before: "Rewriting a passage of music at a different pitch while keeping the same pattern of intervals is called ", after: ".", correctAnswer: "transposition", acceptedAnswers: ["transposition"], explanation: "Transposition preserves the intervallic relationships between notes while shifting the overall pitch." },
  { before: "Among C, G, F, D, A, B flat and E flat, the key with two flats in its signature is ", after: ".", correctAnswer: "B flat", acceptedAnswers: ["b flat", "bflat"], explanation: "B flat major's key signature has two flats: B flat and E flat." },
];

// ---- Ordering pool: transposing-skills sequence, condensed directly from the design's own
// Suggested Learning Experiences bullet order. ----
const PROCESS_STEPS = [
  { id: "aural-intervals", label: "Sing or play a major scale and aurally identify various intervals" },
  { id: "octave-registers", label: "Listen to melodies sung or played in octaves and identify the lower and higher registers" },
  { id: "pitch-difference", label: "Sing or play melodies at different pitches, higher or lower, to distinguish the difference in pitch" },
  { id: "discuss-process", label: "Discuss the process of transposing music to a given interval, an octave, or a given key" },
  { id: "transpose-octave", label: "Transpose melodies an octave up or down, within the same or to a different stave" },
  { id: "transpose-key", label: "Transpose melodies to a given key, within the same or to a different stave" },
];

// ---- Reasoning (Apply/Analyze/Evaluate) pool: 12 situations x 24 frames (6 openers x 4 closers)
// = 288 templates. Required because 1.3's Core Competencies box names "Critical thinking and
// Problem solving". ----
interface TranspositionFact {
  situation: string;
  correct: string;
  wrong: string[];
}

const REASON_FACTS: TranspositionFact[] = [
  {
    situation: "a melody moves from C up to G, and a learner counts the letter names C-D-E-F-G inclusively to work out the interval size",
    correct: "This is the correct method — interval size is counted by letter names inclusively, and C to G spans a 5th",
    wrong: [
      "This is incorrect, since interval size should be counted starting from D, not C",
      "This is incorrect, since the size should not include the starting note",
      "This is correct, but the size is a 4th, not a 5th",
    ],
  },
  {
    situation: "a learner labels the interval from the tonic to the 5th degree of a major scale as a 'major 5th'",
    correct: "This is a misconception — 5ths, like 4ths and octaves, are labelled perfect, not major, when measured from the tonic of a major scale",
    wrong: [
      "This is correct — every interval from the tonic of a major scale is labelled major",
      "This is correct, since 5ths are always major intervals",
      "This is incorrect only because it should be called a 'minor 5th'",
    ],
  },
  {
    situation: "a composer transposes a melody up a major 2nd, shifting every note of the original passage by that same fixed distance",
    correct: "This is the correct approach for transposing to an interval — every note moves by the same fixed interval so the melody's shape is preserved",
    wrong: [
      "This is incorrect, since only some notes should move when transposing to an interval",
      "This is incorrect, since transposing to an interval requires changing the melody's rhythm too",
      "This describes transposing to a given key, not transposing to an interval",
    ],
  },
  {
    situation: "a learner re-notates a passage from the treble clef onto the bass staff, keeping the same pitch names but placing them correctly for the new clef",
    correct: "This correctly describes treble-to-bass transposition — the same pitches are kept, but their position on the staff changes to suit the new clef",
    wrong: [
      "This is incorrect, since treble-to-bass transposition must always change the key as well",
      "This is incorrect, since the pitch names should change during clef transposition",
      "This describes transposing to an interval, not treble-to-bass transposition",
    ],
  },
  {
    situation: "a learner transposes a melody from C major to G major, adjusting the notes to fit the new key while keeping the same melodic shape",
    correct: "This is correct — transposing to a given key keeps the melody's shape while shifting its notes and usually its key signature to fit the new key",
    wrong: [
      "This is incorrect, since transposing to a key should not change any notes",
      "This is incorrect, since G major and C major always share the same notes",
      "This describes treble-to-bass transposition, not transposing to a key",
    ],
  },
  {
    situation: "a learner insists that B flat major cannot be one of the seven target keys named for transposition, since it uses flats rather than sharps",
    correct: "This is incorrect — the design names seven target keys including both sharp keys (G, D, A) and flat keys (F, B flat, E flat), plus C major with no sharps or flats",
    wrong: [
      "This is correct — only sharp keys are valid transposition targets in this sub-strand",
      "This is correct, since flat keys are covered in a different sub-strand entirely",
      "This is incorrect only because the design names six keys, not seven",
    ],
  },
  {
    situation: "a learner claims that transposing a melody always changes how it sounds relative to itself, since the intervals between its notes must change too",
    correct: "This is a misunderstanding — transposition deliberately keeps the same pattern of intervals between notes, so the melody sounds the same relative to itself, just at a different pitch",
    wrong: [
      "This is correct — transposition always changes the relationships between a melody's notes",
      "This is correct, since a transposed melody is an entirely new piece of music",
      "This is incorrect only because transposition never changes the pitch at all",
    ],
  },
  {
    situation: "a learner measures the interval from the tonic to the 3rd degree of a major scale and labels it a perfect 3rd",
    correct: "This is a misconception — 3rds, like 2nds, 6ths and 7ths, are labelled major, not perfect, when measured from the tonic of a major scale",
    wrong: [
      "This is correct — 3rds are always perfect intervals",
      "This is correct, since perfect intervals include every interval smaller than a 5th",
      "This is incorrect only because it should be called a 'minor 3rd'",
    ],
  },
  {
    situation: "two learners play the same short melody together, one an octave higher than the other",
    correct: "This is a harmonic use of the octave interval — the two notes sound together, even though they share the same pitch class an octave apart",
    wrong: [
      "This must be a melodic interval, since an octave can never be harmonic",
      "This is not an interval at all, since both learners are playing the same note name",
      "This can only be described once the two parts stop playing together",
    ],
  },
  {
    situation: "a learner practices transposing melodies to a given interval before attempting to transpose a full melody to a new key",
    correct: "This is a sensible learning progression — mastering fixed-interval transposition builds the skill needed before tackling the more complex process of transposing to a given key",
    wrong: [
      "This order provides no benefit, since the two skills are unrelated",
      "Transposing to a key should always be learned before transposing to an interval",
      "Fixed-interval transposition is not a real form of transposition",
    ],
  },
  {
    situation: "a learner is asked to transpose a bass-clef passage so it can be sung by a treble-voice choir reading the treble staff",
    correct: "This calls for bass-to-treble transposition — the passage needs to be re-notated on the treble staff so the treble-voice choir can read it correctly",
    wrong: [
      "This calls for transposition to a given key instead, since voice type is involved",
      "This is impossible, since bass-clef music can never be sung by treble voices",
      "This calls for treble-to-bass transposition, reversing the actual direction needed",
    ],
  },
  {
    situation: "a learner values being able to transpose music, explaining that it lets the same piece be performed comfortably by instruments or voices with different natural ranges",
    correct: "This is an accurate appreciation of why transposition matters — it makes the same piece accessible to performers with different vocal or instrumental ranges",
    wrong: [
      "This is inaccurate, since transposition only exists as a theoretical exercise with no real performance use",
      "This is inaccurate, since every instrument and voice shares exactly the same natural range",
      "This is only true for transposing to a given key, not for other forms of transposition",
    ],
  },
];

const REASONING_OPENERS: ((rng: RNG, fact: TranspositionFact) => string)[] = [
  (rng, fact) => `${name(rng)}, a Grade 10 music learner near ${place(rng)}, is working through a transposition exercise, where ${fact.situation}`,
  (rng, fact) => `In a music theory lesson near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `${name(rng)} is practicing interval and transposition work, and ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `While reviewing a classmate's transposed score near ${place(rng)}, ${name(rng)} notices that ${fact.situation}`,
  (rng, fact) => `At a school music club near ${place(rng)}, ${fact.situation}`,
];

const REASONING_CLOSERS = ["Is this correct?", "What is the correct judgement here?", "Which statement correctly evaluates this?", "Is this a valid conclusion?"];

const REASONING_FRAMES = combineFrames(REASONING_OPENERS, REASONING_CLOSERS);
const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, REASONING_FRAMES);

// ---- Prompt pools (20 each; 10 is the absolute floor). ----
const CLICK_MATCH_PROMPTS = [
  "Match each transposition term to its correct meaning.",
  "Pair each term below with the meaning that fits it.",
  "Connect each transposition concept to its correct definition.",
  "Match each term to what it describes.",
  "For each term below, choose its matching meaning.",
  "Line up each term with its correct meaning.",
  "Which meaning goes with which term? Match them correctly.",
  "Pair up every term with its correct definition.",
  "Match each concept on the left to its meaning on the right.",
  "Work out what each term means, then match it correctly.",
  "Sort out which meaning belongs to which term, by matching them.",
  "Correctly match every term to the meaning that fits it.",
  "Match each term below to its definition.",
  "Connect each of these terms to what it actually means.",
  "Pair each term with the description that explains it.",
  "Match the terms to their meanings below.",
  "Figure out what each term means, then match it up.",
  "Which definition matches which term? Match them.",
  "Match each item on the left to the term it defines on the right.",
  "Match each interval or transposition concept to its correct explanation.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each fact by interval quality, interval size, or type of transposition.",
  "Group these facts under the correct topic.",
  "Decide which topic each fact below belongs to, and sort it there.",
  "Sort each statement into the topic it best fits.",
  "Place each fact into its correct bucket among these three topics.",
  "Read each fact and sort it under the matching topic.",
  "Work out which topic each fact is about, then sort it there.",
  "Classify each fact by the topic it belongs to.",
  "Organize these facts into the correct category.",
  "Which topic does each fact describe? Sort it accordingly.",
  "Sort each statement below into interval quality, interval size, or transposition type.",
  "Drop each fact into the topic it's really about.",
  "Group each statement with the topic it correctly belongs to.",
  "Decide where each fact fits among the three topics.",
  "Sort these facts into their correct topic groups.",
  "For each fact, work out the topic it belongs to and sort it in.",
  "Place these statements under the topic each one matches.",
  "Sort each fact correctly among the three topics.",
  "Read each statement and file it under the right topic.",
  "Assign each fact to the topic it best describes.",
];

const ORDERING_PROMPTS = [
  "Arrange these steps of learning to transpose music in the correct order.",
  "Put these transposition-learning steps into a sensible order.",
  "Sequence the steps of building transposition skills correctly.",
  "Arrange these actions into the order a learner would actually follow them.",
  "Order these steps the way a learner developing transposition skills should carry them out.",
  "Sort these steps into the order they should happen when learning to transpose.",
  "Put these steps in the order a learner would follow to master transposition.",
  "Work out the sensible order for these transposition-learning tasks.",
  "Arrange these tasks into a logical transposition-learning process.",
  "Which order should these steps happen in? Arrange them correctly.",
  "Build a sensible process by ordering these steps correctly.",
  "Sequence a learner's transposition-learning tasks in the order they should be done.",
  "Order these actions the way they'd happen when building transposition skills.",
  "Arrange the steps of learning to transpose music, in the right order.",
  "Put these tasks into the order a learner would complete them.",
  "Sequence these steps to build a sensible transposition-learning process.",
  "Work out the correct order for developing interval and transposition skills.",
  "Arrange these steps as a learner would carry them out in class.",
  "Order the tasks below the way the learning process actually runs.",
  "Sequence these steps correctly, from first to last.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence correctly.",
  "Work out the missing word and fill it in.",
  "What word completes this sentence?",
  "Fill in the correct word below.",
  "Complete the statement with the correct word.",
  "Which word belongs in the blank?",
  "Fill in the gap correctly.",
  "Work out what belongs in the blank.",
  "Complete the sentence with the right word.",
  "What is missing from this sentence?",
  "Fill in the blank with the correct term.",
  "Finish the sentence correctly.",
  "Which term correctly fills this blank?",
  "Complete this statement.",
  "Work out the correct word for the blank.",
  "Fill in the missing term below.",
  "What word correctly completes this sentence?",
];

const NUMBERLINE_PROMPTS = [
  "Counting letter names inclusively, from {lower} up to {upper} — what interval size is this? Click the number line.",
  "What size interval spans from {lower} up to {upper}, counting inclusively? Click the number line.",
  "Work out the interval size from {lower} to {upper}, then click the number line.",
  "{lower} up to {upper} — click the number line at the correct interval size.",
  "Count inclusively from {lower} to {upper} and click the matching point on the number line.",
  "From {lower} to {upper}, how many letter names does this interval span? Click the number line.",
  "Click the point on the number line equal to the interval size from {lower} to {upper}.",
  "What number names the interval size from {lower} up to {upper}? Click the number line.",
  "Determine the interval size between {lower} and {upper}, then mark it on the number line.",
  "Work out how many letter names, counted inclusively, separate {lower} and {upper}. Click the number line.",
  "{lower} to {upper} spans which interval size? Click the correct point on the number line.",
  "Count from {lower} to {upper} inclusively and click the number line at the total.",
];

export const transposition: Skill = {
  id: "g10-mad-transposition",
  code: "1.3",
  subjectId: "music-and-dance",
  strandId: "g10-mad-foundations",
  grade: 10,
  title: "Transposition",
  description: "Interval quality (major, minor, perfect) and size (2nd through 8ve); transposition to an interval; transposition between treble and bass staves; and transposition to a given key (C, G, F, D, A, B flat, E flat).",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill-blank", "number-line", "reasoning"] as const);
    const hint = "4ths, 5ths and octaves from the tonic are perfect; 2nds, 3rds, 6ths and 7ths are major. Count interval size by letter names, inclusively.";

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 7);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, CLICK_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, TOPIC_FACTS).slice(0, 9);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["interval-quality", "interval-size", "transposition-type"] as Topic[]).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint,
        explanation: chosen.map((f) => `"${f.text}" is about ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const shuffled = shuffle(rng, PROCESS_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDERING_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PROCESS_STEPS.map((s) => s.id),
        hint: "Aural interval and pitch-difference work comes first, then discussing the process, then transposing by octave, then transposing to a key.",
        explanation: PROCESS_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: fb.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: fb.explanation,
      };
    }

    if (branch === "number-line") {
      const pair = randChoice(rng, INTERVAL_PAIRS);
      return {
        kind: "number-line",
        prompt: randChoice(rng, NUMBERLINE_PROMPTS).replace(/\{lower\}/g, pair.lower).replace(/\{upper\}/g, pair.upper),
        hint: "Count the letter names from the lower note to the upper note, including both ends.",
        min: 1,
        max: 8,
        step: 1,
        correctValue: pair.sizeNumber,
        mode: "point",
        explanation: `Counting inclusively from ${pair.lower} to ${pair.upper} spans ${pair.sizeNumber} letter names, which makes it a ${pair.sizeName}.`,
      };
    }

    const q = randChoice(rng, REASONING_TEMPLATES)(rng);
    const { choices, correctIndex } = buildScenarioChoices(rng, q);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      layout: "list",
      hint: "Check whether the interval quality (major/perfect) and size match, and whether the transposition keeps the melody's shape.",
      explanation: q.explanation,
    };
  },
};
