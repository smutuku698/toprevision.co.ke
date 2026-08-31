import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames, cap } from "./sharedG10";

// KICD Grade 10 Music and Dance sub-strand 1.2 "Melody in Major Keys" names melodic devices
// (scalic motion, arpeggios), the major scales of D, A, B flat and E flat, question-and-answer
// phrase structure, and articulation marks (slur, staccato). No VisualSpec variant genuinely fits
// this content: `music-note` only covers isolated note/rest durations (types.ts), not a scale, a
// phrase shape, or an articulation mark, and `sol-fa-ladder` has no notion of a specific major key
// or a slur/staccato. Per the mandatory dispatch instructions, this is a deliberate, documented
// skip, not an oversight — text/numeric/structural branches carry the skill instead.

// ---- Key-signature data for the 4 named major keys — feeds fill-blank, categorize, number-line,
// and (as a fact source) part of the click-match/reasoning pools. ----
const KEYS = [
  { id: "d", label: "D major", sharps: 2, flats: 0, sharpNotes: ["F sharp", "C sharp"], flatNotes: [] as string[] },
  { id: "a", label: "A major", sharps: 3, flats: 0, sharpNotes: ["F sharp", "C sharp", "G sharp"], flatNotes: [] as string[] },
  { id: "bb", label: "B flat major", sharps: 0, flats: 2, sharpNotes: [] as string[], flatNotes: ["B flat", "E flat"] },
  { id: "eb", label: "E flat major", sharps: 0, flats: 3, sharpNotes: [] as string[], flatNotes: ["E flat", "A flat", "B flat"] },
] as const;

// ---- Vocabulary pool (12 terms) — feeds click-match, sliced to a 7-of-12 subset each draw. ----
const TERMS: { id: string; label: string; meaning: string }[] = [
  { id: "scalic-motion", label: "Scalic motion", meaning: "Melody that moves mainly by step, up or down the notes of the scale in order" },
  { id: "arpeggio", label: "Arpeggio", meaning: "Melody that moves by leaping through the notes of a broken chord, such as degrees 1, 3, 5 and 8 of the scale" },
  { id: "question-phrase", label: "Question phrase", meaning: "The first phrase of a question-and-answer structure, which usually ends on a note that sounds unresolved" },
  { id: "answer-phrase", label: "Answer phrase", meaning: "The second phrase of a question-and-answer structure, which usually ends on the tonic to sound resolved" },
  { id: "slur", label: "Slur", meaning: "A curved line joining notes of different pitches, showing they should be performed smoothly connected (legato)" },
  { id: "staccato", label: "Staccato", meaning: "A dot placed above or below a note head, showing the note should be performed short and detached" },
  { id: "key-signature", label: "Key signature", meaning: "The sharps or flats placed at the start of the staff, showing which notes are consistently raised or lowered throughout a piece" },
  { id: "tonic", label: "Tonic", meaning: "The first and 'home' degree of a scale, the note a melody usually resolves to at a final cadence" },
  { id: "d-major", label: "D major", meaning: "A major key with two sharps in its key signature: F sharp and C sharp" },
  { id: "a-major", label: "A major", meaning: "A major key with three sharps in its key signature: F sharp, C sharp and G sharp" },
  { id: "bb-major", label: "B flat major", meaning: "A major key with two flats in its key signature: B flat and E flat" },
  { id: "eb-major", label: "E flat major", meaning: "A major key with three flats in its key signature: E flat, A flat and B flat" },
];

// ---- Fact pool (15 facts across 4 topics) — feeds categorize, sliced to a 10-of-15 subset. ----
type Topic = "melodic-device" | "phrase-structure" | "articulation" | "key-signature";
const TOPIC_LABEL: Record<Topic, string> = {
  "melodic-device": "Melodic device",
  "phrase-structure": "Phrase structure",
  articulation: "Articulation",
  "key-signature": "Key signature",
};
const TOPIC_FACTS: { text: string; topic: Topic }[] = [
  { text: "Moving from the tonic up to the next note in the scale, then the next, is an example of scalic motion", topic: "melodic-device" },
  { text: "Leaping from the tonic to the third, then to the fifth, of the scale is an example of an arpeggio", topic: "melodic-device" },
  { text: "A melody built mostly from small steps up and down the scale shows scalic motion, giving it a smooth, connected shape", topic: "melodic-device" },
  { text: "A melody outlining the notes of a broken chord across an octave shows arpeggio movement, giving it a more angular shape", topic: "melodic-device" },
  { text: "An 8-bar melody is often built from two 4-bar phrases: a question phrase and an answer phrase", topic: "phrase-structure" },
  { text: "A question phrase typically ends on a note other than the tonic, leaving the melody sounding unfinished", topic: "phrase-structure" },
  { text: "An answer phrase typically ends on the tonic, giving the melody a sense of resolution", topic: "phrase-structure" },
  { text: "Question-and-answer phrasing creates unity and variety between the two halves of a melody", topic: "phrase-structure" },
  { text: "A slur over several notes tells a performer to connect them smoothly, without a gap between each pitch", topic: "articulation" },
  { text: "A staccato dot tells a performer to shorten a note and separate it clearly from the next", topic: "articulation" },
  { text: "Articulation marks like slurs and staccato dots change how a melody is performed without changing its pitches or rhythm", topic: "articulation" },
  { text: "Mixing slurred and staccato passages within one 8-bar melody adds expressive contrast to a composition", topic: "articulation" },
  { text: "D major and A major both use sharps in their key signatures", topic: "key-signature" },
  { text: "B flat major and E flat major both use flats in their key signatures", topic: "key-signature" },
  { text: "A major scale can be constructed with or without writing out its key signature, using accidentals instead if the signature is omitted", topic: "key-signature" },
];

// ---- Fill-blank pool (12 templates). ----
const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[]; explanation: string }[] = [
  { before: "The key signature of D major has ", after: " sharps.", correctAnswer: "two", acceptedAnswers: ["two", "2"], explanation: "D major's key signature has two sharps: F sharp and C sharp." },
  { before: "The key signature of A major has ", after: " sharps.", correctAnswer: "three", acceptedAnswers: ["three", "3"], explanation: "A major's key signature has three sharps: F sharp, C sharp and G sharp." },
  { before: "The key signature of B flat major has ", after: " flats.", correctAnswer: "two", acceptedAnswers: ["two", "2"], explanation: "B flat major's key signature has two flats: B flat and E flat." },
  { before: "The key signature of E flat major has ", after: " flats.", correctAnswer: "three", acceptedAnswers: ["three", "3"], explanation: "E flat major's key signature has three flats: E flat, A flat and B flat." },
  { before: "Melody that moves mainly by step up or down the scale shows ", after: " motion.", correctAnswer: "scalic", acceptedAnswers: ["scalic"], explanation: "Scalic motion means the melody moves through consecutive notes of the scale, mostly by step." },
  { before: "Melody that leaps through the notes of a broken chord is called an ", after: ".", correctAnswer: "arpeggio", acceptedAnswers: ["arpeggio"], explanation: "An arpeggio outlines the notes of a chord in sequence rather than moving by step." },
  { before: "In a question-and-answer phrase structure, the answer phrase usually ends on the ", after: ".", correctAnswer: "tonic", acceptedAnswers: ["tonic"], explanation: "The answer phrase resolves the musical idea by ending on the tonic, the scale's 'home' note." },
  { before: "A curved line joining notes to show smooth, connected performance is called a ", after: ".", correctAnswer: "slur", acceptedAnswers: ["slur"], explanation: "A slur tells the performer to connect the notes underneath it smoothly, with no gap." },
  { before: "A dot above or below a note head, showing it should be short and detached, indicates ", after: " performance.", correctAnswer: "staccato", acceptedAnswers: ["staccato"], explanation: "Staccato marks tell the performer to shorten and separate the note from the next." },
  { before: "The two sharps in D major's key signature are F sharp and ", after: ".", correctAnswer: "C sharp", acceptedAnswers: ["c sharp", "csharp"], explanation: "D major's key signature raises F and C, giving F sharp and C sharp." },
  { before: "The three flats in E flat major's key signature are E flat, A flat and ", after: ".", correctAnswer: "B flat", acceptedAnswers: ["b flat", "bflat"], explanation: "E flat major's key signature lowers E, A and B, giving E flat, A flat and B flat." },
  { before: "An 8-bar melody built from two 4-bar phrases typically follows a ", after: " structure.", correctAnswer: "question-and-answer", acceptedAnswers: ["question-and-answer", "question and answer"], explanation: "The first 4-bar phrase poses the question, and the second 4-bar phrase answers it, usually by resolving on the tonic." },
];

// ---- Ordering pool: composing-and-critiquing sequence, condensed directly from the design's own
// Suggested Learning Experiences bullet order. ----
const PROCESS_STEPS = [
  { id: "listen-identify", label: "Listen to or sing familiar tunes in major keys and identify the melodic devices used" },
  { id: "construct-scales", label: "Construct major scales on the treble and bass staves, ascending and descending" },
  { id: "compose-devices", label: "Compose an 8-bar melody incorporating melodic devices with appropriate phrasing" },
  { id: "compose-articulation", label: "Compose an 8-bar melody incorporating articulation marks" },
  { id: "perform", label: "Sing or play the composed melody" },
  { id: "store", label: "Store the composed music in a digital or physical portfolio" },
  { id: "critique", label: "Critique melodies composed by self and others" },
];

// ---- Reasoning (Apply/Analyze/Evaluate) pool: 12 situations x 24 frames (6 openers x 4 closers)
// = 288 templates. ----
interface MelodyFact {
  situation: string;
  correct: string;
  wrong: string[];
}

const REASON_FACTS: MelodyFact[] = [
  {
    situation: "a melody rises D-E-F sharp-G-A within one bar, moving through each consecutive note of the D major scale",
    correct: "This passage shows scalic motion — the melody moves stepwise through consecutive notes of the scale",
    wrong: [
      "This passage shows arpeggio motion, since it moves upward",
      "This passage shows question-and-answer structure",
      "This passage cannot be analysed without knowing the articulation marks used",
    ],
  },
  {
    situation: "a melody leaps D-F sharp-A-D (an octave) within one bar, using only the 1st, 3rd, 5th and 8th degrees of the D major scale",
    correct: "This passage shows arpeggio motion — it outlines the notes of the tonic chord rather than moving stepwise",
    wrong: [
      "This passage shows scalic motion, since it still moves upward overall",
      "This passage is an example of a question phrase specifically",
      "This passage requires a slur to be correctly performed",
    ],
  },
  {
    situation: "the first 4-bar phrase of an 8-bar melody ends on the 2nd degree of the scale, sounding unresolved, and the second 4-bar phrase ends on the tonic",
    correct: "This is a well-formed question-and-answer structure — the first phrase leaves the melody open, and the second resolves it on the tonic",
    wrong: [
      "This is incorrect, since both phrases must end on the tonic",
      "This is an arpeggio pattern rather than a phrase structure",
      "This is incorrect, since question phrases must always end higher than answer phrases",
    ],
  },
  {
    situation: "a composer writing an 8-bar melody in A major forgets to raise G to G sharp where the melody passes through that scale degree",
    correct: "This is an error — A major's key signature requires F sharp, C sharp, and G sharp throughout the piece unless cancelled by an accidental",
    wrong: [
      "This is not an error, since G sharp is optional in A major",
      "This is not an error, since A major only requires F sharp and C sharp",
      "This is an error only because the melody is 8 bars long",
    ],
  },
  {
    situation: "a performer sight-reads a phrase marked with a slur across four notes and plays each note short and separated instead",
    correct: "The performer has misread the articulation — a slur calls for the notes to be performed smoothly connected, not short and separated",
    wrong: [
      "The performer is correct, since a slur means the same as staccato",
      "The performer is correct, since articulation marks are optional suggestions",
      "The slur only applies to the first note under the curved line",
    ],
  },
  {
    situation: "a learner composing in B flat major writes a B natural instead of a B flat, without marking it as a deliberate accidental",
    correct: "This is likely an error — B flat major's key signature lowers every B to B flat unless a natural sign cancels it deliberately",
    wrong: [
      "This is correct, since B flat major only affects the note E, not B",
      "This is correct, since key signatures only apply to notes on the treble stave",
      "This has no effect on the key of the passage",
    ],
  },
  {
    situation: "a melody alternates evenly between staccato notes and smoothly slurred notes across an 8-bar composition",
    correct: "This uses articulation to create expressive contrast, matching the sub-strand's expectation of incorporating articulation marks into an 8-bar melody",
    wrong: [
      "Mixing articulation styles within one melody is discouraged and should be avoided",
      "Articulation marks only matter in melodies shorter than 8 bars",
      "This changes the melody's actual pitches, not just how it is performed",
    ],
  },
  {
    situation: "a learner constructs the E flat major scale on the bass stave without writing the key signature, instead placing a flat sign before every E, A and B that appears",
    correct: "This is an acceptable way to construct the scale — a major scale can be written with or without its key signature, using accidentals instead when the signature is left out",
    wrong: [
      "This is incorrect, since a key signature must always be written for every major scale",
      "This is incorrect, since accidentals cannot substitute for a key signature",
      "This only works on the treble stave, not the bass stave",
    ],
  },
  {
    situation: "two learners collaborate on an 8-bar melody — one writes a question phrase using mostly scalic motion, and the other writes an answer phrase using mostly arpeggio motion",
    correct: "This is a valid creative choice — question-and-answer phrases can each use different melodic devices as long as the overall structure still poses and resolves the musical idea",
    wrong: [
      "This is invalid, since both phrases must use the identical melodic device",
      "This is invalid, since arpeggios cannot be used in answer phrases",
      "This has no effect on whether the structure counts as question-and-answer",
    ],
  },
  {
    situation: "a learner composes an 8-bar melody about peace for a class project and stores the finished score in a digital portfolio",
    correct: "This matches the sub-strand's expected practice — composing melodies on contemporary themes and storing them in a digital or physical portfolio for the learner's ongoing record",
    wrong: [
      "Storing composed music digitally has no real purpose for a learner's development",
      "Themes like peace are unrelated to melody composition and should be avoided",
      "Only physical, handwritten copies of compositions should ever be kept",
    ],
  },
  {
    situation: "a learner claims that because D major and B flat major are both major keys, they must share the same key signature",
    correct: "This is a misunderstanding — different major keys have different key signatures; D major uses two sharps while B flat major uses two flats",
    wrong: [
      "This is correct — all major keys share an identical key signature",
      "This is correct, since both keys use exactly two altered notes, so the notes must be identical",
      "This is incorrect only because D major actually has three sharps",
    ],
  },
  {
    situation: "a learner critiquing a classmate's 8-bar melody says the second phrase 'sounds finished' while the first phrase 'sounds like it's still asking a question'",
    correct: "This is an accurate, well-informed critique — it correctly identifies the resolved answer phrase and the unresolved question phrase by ear",
    wrong: [
      "This critique is meaningless, since phrases cannot sound finished or unfinished",
      "This critique only applies to melodies using arpeggios, not scalic motion",
      "This is incorrect, since the first phrase should always sound more resolved than the second",
    ],
  },
];

const REASONING_OPENERS: ((rng: RNG, fact: MelodyFact) => string)[] = [
  (rng, fact) => `${name(rng)}, a Grade 10 music learner near ${place(rng)}, is composing a melody, where ${fact.situation}`,
  (rng, fact) => `In a music lesson near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `${name(rng)} is working on a melody-writing task, and ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `While reviewing melody compositions near ${place(rng)}, ${name(rng)} finds that ${fact.situation}`,
  (rng, fact) => `At a school music club near ${place(rng)}, ${fact.situation}`,
];

const REASONING_CLOSERS = ["Is this correct?", "What is the correct judgement here?", "Which statement correctly evaluates this?", "Is this a valid musical choice?"];

const REASONING_FRAMES = combineFrames(REASONING_OPENERS, REASONING_CLOSERS);
const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, REASONING_FRAMES);

// ---- Prompt pools (20 each; 10 is the absolute floor). ----
const CLICK_MATCH_PROMPTS = [
  "Match each melody term to its correct meaning.",
  "Pair each term below with the meaning that fits it.",
  "Connect each melody concept to its correct definition.",
  "Match each term to what it describes.",
  "For each term below, choose its matching meaning.",
  "Line up each melody term with its correct meaning.",
  "Which meaning goes with which term? Match them correctly.",
  "Pair up every melody term with its correct definition.",
  "Match each concept on the left to its meaning on the right.",
  "Work out what each term means, then match it correctly.",
  "Sort out which meaning belongs to which melody term, by matching them.",
  "Correctly match every term to the meaning that fits it.",
  "Match each melody term below to its definition.",
  "Connect each of these melody terms to what it actually means.",
  "Pair each term with the description that explains it.",
  "Match the terms to their meanings below.",
  "Figure out what each term means, then match it up.",
  "Which definition matches which term? Match them.",
  "Match each item on the left to the term it defines on the right.",
  "Match each melody concept to its correct explanation.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each fact by melodic device, phrase structure, articulation, or key signature.",
  "Group these facts under the correct melody topic.",
  "Decide which topic each fact below belongs to, and sort it there.",
  "Sort each statement into the topic it best fits.",
  "Place each fact into its correct bucket among these four melody topics.",
  "Read each fact and sort it under the matching topic.",
  "Work out which topic each fact is about, then sort it there.",
  "Classify each fact by the melody topic it belongs to.",
  "Organize these facts into the correct melody-writing category.",
  "Which topic does each fact describe? Sort it accordingly.",
  "Sort each statement below by its melody-writing topic.",
  "Drop each fact into the topic it's really about.",
  "Group each statement with the topic it correctly belongs to.",
  "Decide where each fact fits among the four melody topics.",
  "Sort these facts into their correct topic groups.",
  "For each fact, work out the topic it belongs to and sort it in.",
  "Place these statements under the melody topic each one matches.",
  "Sort each fact correctly among the four melody-writing topics.",
  "Read each statement and file it under the right melody topic.",
  "Assign each fact to the melody topic it best describes.",
];

const ORDERING_PROMPTS = [
  "Arrange these steps of composing and critiquing an 8-bar melody in the correct order.",
  "Put these melody-composing steps into a sensible order.",
  "Sequence the steps of composing and sharing a melody correctly.",
  "Arrange these actions into the order a learner would actually follow them.",
  "Order these steps the way a learner composing melodies should carry them out.",
  "Sort these steps into the order they should happen when composing a melody.",
  "Put these steps in the order a learner would follow to compose and critique a melody.",
  "Work out the sensible order for these melody-composing tasks.",
  "Arrange these tasks into a logical melody-composing process.",
  "Which order should these steps happen in? Arrange them correctly.",
  "Build a sensible process by ordering these melody-composing steps correctly.",
  "Sequence a learner's melody-composing tasks in the order they should be done.",
  "Order these actions the way they'd happen when composing and critiquing a melody.",
  "Arrange the steps of composing an 8-bar melody, in the right order.",
  "Put these tasks into the order a learner would complete them.",
  "Sequence these steps to build a sensible melody-composing process.",
  "Work out the correct order for composing, performing, and critiquing a melody.",
  "Arrange these steps as a learner would carry them out in class.",
  "Order the tasks below the way the composing process actually runs.",
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
  "How many {kind} does the key signature of {key} have? Click the point on the number line.",
  "Work out how many {kind} are in {key}'s key signature, then click the number line.",
  "The key signature of {key} has how many {kind}? Click the number line.",
  "Click the number line to show how many {kind} {key} has in its key signature.",
  "Count the {kind} in {key}'s key signature and click the matching point on the number line.",
  "{key} — how many {kind} does its key signature contain? Click the number line.",
  "What number of {kind} belongs in {key}'s key signature? Click the number line.",
  "Work out the {kind} count for {key}'s key signature, then click the number line.",
  "Click the point on the number line equal to the number of {kind} in {key}.",
  "How many {kind} appear in the key signature of {key}? Click the correct point.",
  "For {key}, how many {kind} does the key signature carry? Click the number line.",
  "Determine the {kind} count in {key}'s key signature and mark it on the number line.",
];

export const melodyInMajorKeys: Skill = {
  id: "g10-mad-melody-in-major-keys",
  code: "1.2",
  subjectId: "music-and-dance",
  strandId: "g10-mad-foundations",
  grade: 10,
  title: "Melody in Major Keys",
  description: "Melodic devices (scalic motion, arpeggios), the major scales of D, A, B flat and E flat, question-and-answer phrase structure, and articulation marks (slur, staccato).",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill-blank", "number-line", "reasoning"] as const);
    const hint = "Scalic motion moves by step; arpeggios leap through a broken chord. A slur connects notes smoothly; staccato shortens and separates them.";

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
      const chosen = shuffle(rng, TOPIC_FACTS).slice(0, 10);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["melodic-device", "phrase-structure", "articulation", "key-signature"] as Topic[]).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
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
        hint: "Listening and scale-building come first, composing comes next, and performing/storing/critiquing come last.",
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
      const key = randChoice(rng, KEYS);
      const useSharp = key.sharps > 0;
      const count = useSharp ? key.sharps : key.flats;
      const kind = useSharp ? "sharps" : "flats";
      const notes = useSharp ? key.sharpNotes : key.flatNotes;
      return {
        kind: "number-line",
        prompt: randChoice(rng, NUMBERLINE_PROMPTS).replace("{kind}", kind).replace(/\{key\}/g, key.label),
        hint: "D major and A major use sharps; B flat major and E flat major use flats — count how many are named for that key.",
        min: 0,
        max: 5,
        step: 1,
        correctValue: count,
        mode: "point",
        explanation: `${key.label}'s key signature has ${count} ${kind}: ${notes.join(", ")}.`,
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
      hint: "Check whether the passage moves by step (scalic) or leaps through a chord (arpeggio), and whether the key signature is being followed.",
      explanation: q.explanation,
    };
  },
};
