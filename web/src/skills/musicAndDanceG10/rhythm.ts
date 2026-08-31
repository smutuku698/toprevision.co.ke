import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames, cap } from "./sharedG10";

// KICD Grade 10 Music and Dance sub-strand 1.1 "Rhythm" names the semiquaver and the triplet in
// simple time (2/4, 3/4, 4/4, 3/8), grouping notes into beats, and composing/appreciating 4-bar
// rhythms. No VisualSpec variant genuinely fits this content: `music-note`'s `note` union
// (crotchet/quaver-pair/minim/dotted-minim/semibreve + rests, per types.ts) does not include a
// semiquaver or a triplet grouping at all, and `sol-fa-ladder` is unrelated to rhythm/beat
// content. Per the mandatory dispatch instructions, this is a deliberate, documented skip, not an
// oversight — text/numeric/structural branches carry the skill instead.

// ---- Vocabulary pool (12 terms) — feeds click-match, sliced to a 7-of-12 subset each draw. ----
const TERMS: { id: string; label: string; meaning: string }[] = [
  { id: "semiquaver", label: "Semiquaver", meaning: "A note worth a quarter of a crotchet beat in simple time — four of them fill one beat" },
  { id: "triplet", label: "Triplet", meaning: "A group of three notes performed evenly in the time normally taken by two" },
  { id: "simple-time", label: "Simple time", meaning: "A time signature whose beats naturally divide into two equal parts" },
  { id: "2-4", label: "2/4 time", meaning: "A simple time signature with two crotchet beats in every bar" },
  { id: "3-4", label: "3/4 time", meaning: "A simple time signature with three crotchet beats in every bar" },
  { id: "4-4", label: "4/4 time", meaning: "A simple time signature with four crotchet beats in every bar" },
  { id: "3-8", label: "3/8 time", meaning: "A simple time signature with three quaver beats in every bar" },
  { id: "beat-grouping", label: "Beat grouping", meaning: "Beaming notes and rests so the beats of the bar stay clear to a performer reading the rhythm" },
  { id: "crotchet-beat", label: "Crotchet beat", meaning: "The basic beat unit counted in 2/4, 3/4 and 4/4 time" },
  { id: "quaver-beat", label: "Quaver beat", meaning: "The basic beat unit counted in 3/8 time" },
  { id: "bracket-3", label: "Bracket-and-3 marking", meaning: "The notation symbol placed over a triplet to show three notes fit in the time of two" },
  { id: "4-bar-rhythm", label: "4-bar rhythm", meaning: "A short rhythmic composition spanning exactly four bars — the length required for this sub-strand's composing tasks" },
];

// ---- Fact pool (15 facts across 3 topics) — feeds categorize, sliced to a 9-of-15 subset. ----
type Topic = "semiquaver" | "triplet" | "time-sig";
const TOPIC_LABEL: Record<Topic, string> = {
  semiquaver: "Semiquaver",
  triplet: "Triplet",
  "time-sig": "Simple time signature",
};
const TOPIC_FACTS: { text: string; topic: Topic }[] = [
  { text: "Four semiquavers fill exactly one beat in simple time", topic: "semiquaver" },
  { text: "A semiquaver is written with two flags, or a double beam when grouped", topic: "semiquaver" },
  { text: "A semiquaver is worth a quarter of a crotchet beat", topic: "semiquaver" },
  { text: "Two semiquavers together are worth the same duration as one quaver", topic: "semiquaver" },
  { text: "Semiquavers are usually beamed in sets of four to clearly show the beat", topic: "semiquaver" },
  { text: "A triplet divides one beat into three equal sounds instead of the usual two", topic: "triplet" },
  { text: "A triplet is marked with a small bracket and the number 3 over the grouped notes", topic: "triplet" },
  { text: "Three quaver notes played as a triplet last exactly as long as two ordinary quavers", topic: "triplet" },
  { text: "A triplet borrows a three-part division inside a beat that would normally divide in twos in simple time", topic: "triplet" },
  { text: "Triplets let a composer fit an extra sound into a beat without changing the tempo", topic: "triplet" },
  { text: "In 2/4 time, each bar holds two crotchet beats", topic: "time-sig" },
  { text: "In 3/4 time, each bar holds three crotchet beats", topic: "time-sig" },
  { text: "In 4/4 time, each bar holds four crotchet beats", topic: "time-sig" },
  { text: "In 3/8 time, each bar holds three quaver beats", topic: "time-sig" },
  { text: "Simple time signatures have beats that divide naturally into two equal parts", topic: "time-sig" },
];

// ---- Fill-blank pool (12 templates). ----
const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[]; explanation: string }[] = [
  { before: "In simple time, a beat divides naturally into ", after: " equal parts.", correctAnswer: "two", acceptedAnswers: ["two", "2"], explanation: "Simple time signatures have beats that split naturally into two equal parts — that is what makes them simple rather than compound." },
  { before: "A ", after: " divides one beat into three equal sounds in simple time.", correctAnswer: "triplet", acceptedAnswers: ["triplet"], explanation: "A triplet borrows a three-part division inside a beat that would normally split into two in simple time." },
  { before: "Four ", after: " fill exactly one crotchet beat.", correctAnswer: "semiquavers", acceptedAnswers: ["semiquavers", "semiquaver"], explanation: "A semiquaver is worth a quarter of a crotchet beat, so four of them together fill exactly one beat." },
  { before: "A triplet is marked with a bracket and the number ", after: " over the grouped notes.", correctAnswer: "3", acceptedAnswers: ["3", "three"], explanation: "The bracket-and-3 marking tells a performer that three notes fit in the time normally taken by two." },
  { before: "In 4/4 time, each bar contains ", after: " crotchet beats.", correctAnswer: "four", acceptedAnswers: ["four", "4"], explanation: "4/4 time has four crotchet beats in every bar." },
  { before: "In 3/4 time, each bar contains ", after: " crotchet beats.", correctAnswer: "three", acceptedAnswers: ["three", "3"], explanation: "3/4 time has three crotchet beats in every bar." },
  { before: "In 2/4 time, each bar contains ", after: " crotchet beats.", correctAnswer: "two", acceptedAnswers: ["two", "2"], explanation: "2/4 time has two crotchet beats in every bar." },
  { before: "In 3/8 time, each bar contains ", after: " quaver beats.", correctAnswer: "three", acceptedAnswers: ["three", "3"], explanation: "3/8 time counts its beats in quavers, not crotchets — three quaver beats per bar." },
  { before: "A semiquaver is worth ", after: " of a crotchet beat.", correctAnswer: "a quarter", acceptedAnswers: ["a quarter", "quarter", "1/4"], explanation: "A crotchet beat splits into four equal semiquavers, so each one is a quarter of the beat." },
  { before: "Three quaver notes played as a triplet last as long as ", after: " ordinary quavers.", correctAnswer: "two", acceptedAnswers: ["two", "2"], explanation: "A triplet fits three notes into the time normally taken by two, so it lasts exactly as long as two ordinary quavers." },
  { before: "Semiquavers are usually beamed in groups of ", after: " to show the beat clearly.", correctAnswer: "four", acceptedAnswers: ["four", "4"], explanation: "Beaming four semiquavers together visually marks out one complete beat for the performer." },
  { before: "The simple time signature with three quaver beats per bar is ", after: ".", correctAnswer: "3/8", acceptedAnswers: ["3/8", "three eight"], explanation: "3/8 time is the one simple time signature named in this sub-strand that counts its beats in quavers rather than crotchets." },
];

// ---- Ordering pool: composing-and-sharing sequence, condensed directly from the design's own
// Suggested Learning Experiences bullet order (already a suggested teaching sequence). ----
const PROCESS_STEPS = [
  { id: "listen-semiquaver", label: "Listen to or sing songs in simple time with semiquavers and aurally recognize them" },
  { id: "listen-triplet", label: "Listen to or sing songs in simple time with triplets and discuss the performance of the triplet" },
  { id: "write-semiquaver", label: "Practice writing rhythms in simple time incorporating semiquavers with appropriate grouping" },
  { id: "tap-recite", label: "Tap and recite rhythms using French rhythm names" },
  { id: "discuss-factors", label: "Discuss factors to consider in creating rhythmic patterns" },
  { id: "compose", label: "Compose 4-bar original rhythms in simple time incorporating semiquavers and triplets" },
  { id: "perform-record", label: "Perform the created rhythms and record the performance using a digital device" },
  { id: "share", label: "Share the recorded performances with peers for critique" },
];

// ---- Number-line pool: note-value beat counting, spanning semiquavers/triplets alongside the
// familiar longer note values. ----
const NOTE_UNITS = [
  { label: "a semibreve", beats: 4 },
  { label: "a dotted minim", beats: 3 },
  { label: "a minim", beats: 2 },
  { label: "a crotchet", beats: 1 },
  { label: "a pair of quavers", beats: 1 },
  { label: "a single quaver", beats: 0.5 },
  { label: "a group of four semiquavers", beats: 1 },
  { label: "a single semiquaver", beats: 0.25 },
  { label: "a triplet of quavers", beats: 1 },
] as const;

// ---- Reasoning (Apply/Analyze/Evaluate) pool: 12 situations x 24 frames (6 openers x 4 closers)
// = 288 templates. Required because 1.1's Core Competencies box names "Critical thinking and
// Problem solving". Also directly reflects the assessment rubric's note that the two 4-bar
// rhythms (semiquaver-based, triplet-based) are separately graded compositions. ----
interface RhythmFact {
  situation: string;
  correct: string;
  wrong: string[];
}

const REASON_FACTS: RhythmFact[] = [
  {
    situation: "a learner beams four semiquavers so they span across the boundary between beat 2 and beat 3 of a bar in 4/4 time, instead of keeping all four inside beat 2",
    correct: "The grouping is incorrect — semiquavers should be beamed within a single beat so the beat structure stays clear to a performer",
    wrong: [
      "The grouping is correct, since beaming can cross beat boundaries freely",
      "The grouping is incorrect only because there are too many semiquavers in the bar",
      "The grouping is correct because 4/4 time allows any beaming pattern",
    ],
  },
  {
    situation: "a learner writes a triplet of three quavers inside one beat of a bar in 3/4 time, marked with a bracket and the number 3",
    correct: "This is correctly notated — a triplet fits three notes into the time of two, and the bracket-and-3 marking is exactly how a triplet is shown",
    wrong: [
      "This is incorrect, since triplets can only be used in compound time signatures",
      "This is incorrect, since a triplet needs a bracket and the number 2, not 3",
      "This is incorrect, since 3/4 time cannot contain a beat divided into three",
    ],
  },
  {
    situation: "a composer fitting a 4-bar rhythm into 3/8 time writes three crotchet beats per bar instead of three quaver beats",
    correct: "This is incorrect — 3/8 time counts three quaver beats per bar, not crotchet beats",
    wrong: [
      "This is correct, since all simple time signatures count crotchet beats",
      "This is correct, since the top number 3 always means three crotchet beats",
      "This is incorrect only because there should be four beats, not three",
    ],
  },
  {
    situation: "a learner claims that because a triplet divides a beat into three sounds, 2/4 time must actually be a compound time signature whenever a triplet appears",
    correct: "This is a misunderstanding — a triplet is a temporary three-part division borrowed for one beat in simple time; the time signature itself stays simple",
    wrong: [
      "This is correct — using a triplet permanently changes the piece to compound time",
      "This is correct — a bracket-and-3 marking always signals a compound time signature",
      "This is incorrect only because 2/4 time cannot use triplets at all",
    ],
  },
  {
    situation: "a learner composes a 4-bar rhythm in 2/4 time that includes both semiquavers and a triplet, but forgets to notate the bracket and the number 3 over the triplet",
    correct: "The rhythm is incomplete — without the bracket and the number 3, a performer cannot tell the group is a triplet rather than three ordinary notes",
    wrong: [
      "The omission does not matter, since triplets are always assumed in simple time",
      "The omission only matters if semiquavers are also present in the same bar",
      "The bracket-and-3 marking is optional decoration with no effect on how the rhythm is read",
    ],
  },
  {
    situation: "a learner beams two semiquavers followed by one quaver within a single beat of a bar in 4/4 time",
    correct: "This grouping is valid — two semiquavers (half a beat together) plus one quaver (half a beat) add up to exactly one full beat",
    wrong: [
      "This grouping is invalid, since semiquavers can never be mixed with quavers in one beat",
      "This grouping is invalid, since it only totals three-quarters of a beat",
      "This grouping is valid only in 3/4 time, not 4/4 time",
    ],
  },
  {
    situation: "a learner checks whether a 4-bar rhythm composed in 4/4 time actually totals sixteen beats across all four bars",
    correct: "Checking the total is correct practice — four bars of 4/4 time must together total exactly sixteen crotchet beats",
    wrong: [
      "The check is unnecessary, since any number of beats is acceptable across four bars",
      "Four bars of 4/4 time should total twelve beats, not sixteen",
      "Four bars of 4/4 time should total eight beats, not sixteen",
    ],
  },
  {
    situation: "before performing a self-composed 4-bar rhythm containing semiquavers, a learner records the performance on a digital device and shares it responsibly with peers for critique",
    correct: "This reflects the sub-strand's expected process well — composing, performing, recording responsibly, and sharing for peer feedback are all part of appreciating rhythms created by self and others",
    wrong: [
      "Recording performances has no real value for developing rhythm skills",
      "Sharing a recording for critique should be avoided, since peer feedback is not useful",
      "Only a teacher's feedback matters; peer critique should be skipped entirely",
    ],
  },
  {
    situation: "a learner assumes any pattern totaling the correct number of beats per bar is automatically well-grouped, no matter how the notes are beamed",
    correct: "This is a misunderstanding — grouping notes to clearly show the beat matters separately from the total beat count being correct",
    wrong: [
      "This is correct — beat totals are the only thing that matters in notating a rhythm",
      "This is correct — beaming only matters for triplets, not semiquavers",
      "This is incorrect only because beat totals do not matter at all",
    ],
  },
  {
    situation: "in a bar of 3/4 time, a learner writes a minim followed by a triplet of quavers",
    correct: "This fits exactly — a minim (2 beats) plus a triplet occupying one beat total exactly the three beats a 3/4 bar holds",
    wrong: [
      "This does not fit, since a triplet always adds an extra beat beyond its bracket",
      "This does not fit, since a minim occupies three beats on its own",
      "This fits only in 4/4 time, not 3/4 time",
    ],
  },
  {
    situation: "in a bar of 3/8 time, a learner writes three single quavers with no semiquavers or triplets at all",
    correct: "This fits exactly — 3/8 time holds three quaver beats per bar, and three single quavers total exactly three quaver beats",
    wrong: [
      "This does not fit, since 3/8 time requires at least one triplet in every bar",
      "This does not fit, since three quavers only total one and a half beats",
      "This fits only if the quavers are beamed as a triplet",
    ],
  },
  {
    situation: "a learner composes two separate 4-bar rhythms for their assessment — one built around semiquavers and one built around triplets",
    correct: "This matches the expected practice — 4-bar rhythms incorporating semiquavers and 4-bar rhythms incorporating triplets are assessed as two separate compositions, not merged into one",
    wrong: [
      "This is unnecessary — one combined 4-bar rhythm using both is always sufficient for assessment",
      "This is incorrect — only the triplet-based rhythm is assessed; semiquavers are not separately graded",
      "This is incorrect — only the semiquaver-based rhythm is assessed; triplets are not separately graded",
    ],
  },
];

const REASONING_OPENERS: ((rng: RNG, fact: RhythmFact) => string)[] = [
  (rng, fact) => `${name(rng)}, a Grade 10 learner near ${place(rng)}, is working on a rhythm-composing task, where ${fact.situation}`,
  (rng, fact) => `During a music lesson near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `${name(rng)} is practicing rhythm composition, and ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `While reviewing a classmate's rhythm work near ${place(rng)}, ${name(rng)} notices that ${fact.situation}`,
  (rng, fact) => `In a rhythm workshop at a school near ${place(rng)}, ${fact.situation}`,
];

const REASONING_CLOSERS = ["Is this correct?", "What is the correct judgement here?", "Is this correctly done?", "Which conclusion is correct?"];

const REASONING_FRAMES = combineFrames(REASONING_OPENERS, REASONING_CLOSERS);
const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, REASONING_FRAMES);

// ---- Prompt pools (20 each; 10 is the absolute floor) — wrap the branches whose content
// pools sit in structured fields (tokens/items/before-after) rather than in the prompt text
// itself, so the visible instruction line varies independently of the underlying content. ----
const CLICK_MATCH_PROMPTS = [
  "Match each rhythm term to its correct meaning.",
  "Pair each term below with the meaning that fits it.",
  "Connect each rhythm concept to its correct definition.",
  "Match each term to what it describes.",
  "For each term below, choose its matching meaning.",
  "Line up each rhythm term with its correct meaning.",
  "Which meaning goes with which term? Match them correctly.",
  "Pair up every rhythm term with its correct definition.",
  "Match each concept on the left to its meaning on the right.",
  "Work out what each term means, then match it correctly.",
  "Sort out which meaning belongs to which rhythm term, by matching them.",
  "Correctly match every term to the meaning that fits it.",
  "Match each rhythm term below to its definition.",
  "Connect each of these rhythm terms to what it actually means.",
  "Pair each term with the description that explains it.",
  "Match the terms to their meanings below.",
  "Figure out what each term means, then match it up.",
  "Which definition matches which term? Match them.",
  "Match each item on the left to the term it defines on the right.",
  "Match each rhythm concept to its correct explanation.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each fact by whether it's about semiquavers, triplets, or simple time signatures.",
  "Group these facts under semiquavers, triplets, or time signatures.",
  "Decide which topic each fact below belongs to, and sort it there.",
  "Sort each statement into the topic it best fits.",
  "Place each fact into the correct bucket: semiquavers, triplets, or time signatures.",
  "Read each fact and sort it under the matching topic.",
  "Work out which topic each fact is about, then sort it there.",
  "Classify each fact by the rhythm topic it belongs to.",
  "Organize these facts into the correct rhythm category.",
  "Which topic does each fact describe? Sort it accordingly.",
  "Sort each statement below into semiquavers, triplets, or time signatures.",
  "Drop each fact into the topic it's really about.",
  "Group each statement with the rhythm topic it correctly belongs to.",
  "Decide where each fact fits among the three rhythm topics.",
  "Sort these facts into their correct rhythm-topic groups.",
  "For each fact, work out the topic it belongs to and sort it in.",
  "Place these statements under the rhythm topic each one matches.",
  "Sort each fact correctly among semiquavers, triplets, and time signatures.",
  "Read each statement and file it under the right rhythm topic.",
  "Assign each fact to the rhythm topic it best describes.",
];

const ORDERING_PROMPTS = [
  "Arrange these steps of composing and sharing a 4-bar rhythm in the correct order.",
  "Put these rhythm-composing steps into a sensible order.",
  "Sequence the steps of composing and performing a rhythm correctly.",
  "Arrange these actions into the order a learner would actually follow them.",
  "Order these steps the way a learner composing rhythms should carry them out.",
  "Sort these steps into the order they should happen when composing a rhythm.",
  "Put these steps in the order a learner would follow to compose and share a rhythm.",
  "Work out the sensible order for these rhythm-composing tasks.",
  "Arrange these tasks into a logical rhythm-composing process.",
  "Which order should these steps happen in? Arrange them correctly.",
  "Build a sensible process by ordering these rhythm-composing steps correctly.",
  "Sequence a learner's rhythm-composing tasks in the order they should be done.",
  "Order these actions the way they'd happen when composing and performing a rhythm.",
  "Arrange the steps of composing a 4-bar rhythm, in the right order.",
  "Put these tasks into the order a learner would complete them.",
  "Sequence these steps to build a sensible rhythm-composing process.",
  "Work out the correct order for composing, performing, and sharing a rhythm.",
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
  "A learner writes {first} followed by {second} inside one bar. How many beats does this pattern total? Click the point on the number line.",
  "Inside one bar, a learner writes {first} then {second}. What is the total number of beats? Click the number line.",
  "{first} is followed by {second} in one bar. How many beats does this add up to? Click the number line.",
  "How many beats do {first} and {second} total together in one bar? Click the point on the number line.",
  "A bar contains {first} then {second}. Click the number line to show the total beats.",
  "Work out the total beats when {first} is followed by {second}, then click the number line.",
  "{first} then {second} appear in one bar. Click the number line to show how many beats that totals.",
  "What do {first} and {second} add up to, in beats? Click the correct point on the number line.",
  "A rhythm pattern uses {first} followed by {second}. Click the number line at the total beat count.",
  "Add the beat value of {first} to the beat value of {second}, then click the number line.",
  "How many beats total when a bar holds {first} and then {second}? Click the number line.",
  "Click the number line to show the combined beat total of {first} and {second}.",
  "Work out how many beats {first} plus {second} make, then click the number line.",
  "{first} and {second} are written in the same bar. What is their total in beats? Click the number line.",
  "Find the total beat count of {first} followed by {second}, and click the number line.",
  "A composer writes {first} then {second} in a bar. Click the number line to mark the total beats.",
  "Sum the beat values of {first} and {second}, then click the correct point on the number line.",
  "What total beat value do {first} and {second} give together? Click the number line.",
  "Click the point on the number line equal to the combined beats of {first} and {second}.",
  "Calculate the beat total for {first} followed by {second}, then click the number line.",
];

export const rhythm: Skill = {
  id: "g10-mad-rhythm",
  code: "1.1",
  subjectId: "music-and-dance",
  strandId: "g10-mad-foundations",
  grade: 10,
  title: "Rhythm",
  description: "Semiquavers and triplets in simple time (2/4, 3/4, 4/4, 3/8), grouping notes into beats, and composing and appreciating 4-bar rhythms.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill-blank", "number-line", "reasoning"] as const);
    const hint = "A semiquaver is a quarter of a crotchet beat; a triplet fits three notes into the time of two. Simple time beats normally split into two.";

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
        buckets: (["semiquaver", "triplet", "time-sig"] as Topic[]).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
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
        hint: "Listening and writing come first, composing comes next, and performing/recording/sharing come last.",
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
      const first = randChoice(rng, NOTE_UNITS);
      const second = randChoice(rng, NOTE_UNITS);
      const total = first.beats + second.beats;
      return {
        kind: "number-line",
        prompt: randChoice(rng, NUMBERLINE_PROMPTS).replace("{first}", first.label).replace("{second}", second.label),
        hint: "Add the beat value of the first note (or group) to the beat value of the second.",
        min: 0,
        max: 8,
        step: 0.25,
        correctValue: total,
        mode: "point",
        explanation: `${cap(first.label)} (${first.beats} beat${first.beats === 1 ? "" : "s"}) plus ${second.label} (${second.beats} beat${second.beats === 1 ? "" : "s"}) totals ${total} beat${total === 1 ? "" : "s"}.`,
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
      hint: "Check the beat total against the time signature, and check that semiquavers/triplets are grouped and marked correctly.",
      explanation: q.explanation,
    };
  },
};
