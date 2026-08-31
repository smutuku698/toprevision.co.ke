import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// A single term<->meaning pool spanning the 3 factors, the 5 warm-up body movements,
// and the 6 French rhythm names — every fact the design names for this sub-strand.
const TERMS: { id: string; label: string; meaning: string; bucket: "factor" | "movement" | "name" }[] = [
  { id: "time-sig", label: "Time signature", meaning: "How many beats are in each bar, and what note value counts as one beat", bucket: "factor" },
  { id: "repetition", label: "Repetition of note values and rests", meaning: "Reusing the same note and rest values to create a recognisable pattern", bucket: "factor" },
  { id: "variation", label: "Variation of note values and rests", meaning: "Changing note and rest values to add interest to a rhythmic pattern", bucket: "factor" },
  { id: "clapping", label: "Clapping", meaning: "A body movement used to accompany a rhythmic pattern during warm-up", bucket: "movement" },
  { id: "tapping", label: "Tapping", meaning: "A body movement used to accompany a rhythmic pattern during warm-up", bucket: "movement" },
  { id: "marching", label: "Marching to rhythm", meaning: "A body movement used to accompany a rhythmic pattern during warm-up", bucket: "movement" },
  { id: "swaying", label: "Swaying", meaning: "A body movement used to accompany a rhythmic pattern during warm-up", bucket: "movement" },
  { id: "swinging", label: "Swinging", meaning: "A body movement used to accompany a rhythmic pattern during warm-up", bucket: "movement" },
  { id: "taa4", label: "Taa-aa-aa-aa", meaning: "The French rhythm name for a note held across all 4 beats (a semibreve)", bucket: "name" },
  { id: "taa2", label: "Taa-aa", meaning: "The French rhythm name for a note held across 2 beats (a minim)", bucket: "name" },
  { id: "taa1", label: "Taa", meaning: "The French rhythm name for a note held for 1 beat (a crotchet)", bucket: "name" },
  { id: "tate", label: "Ta-te", meaning: "The French rhythm name for a pair of quavers — two even sounds inside 1 beat", bucket: "name" },
  { id: "tafate", label: "Tafa-te", meaning: "A French rhythm name for an uneven division of 1 beat into three sounds", bucket: "name" },
  { id: "tatefe", label: "Ta-tefe", meaning: "A French rhythm name for an uneven division of 1 beat into three sounds", bucket: "name" },
];

const BUCKET_LABEL: Record<string, string> = {
  factor: "Factor in creating a rhythmic pattern",
  movement: "Body movement for a warm-up routine",
  name: "French rhythm name",
};

const NOTES = [
  { label: "a semibreve", beats: 4 },
  { label: "a minim", beats: 2 },
  { label: "a crotchet", beats: 1 },
  { label: "a pair of quavers", beats: 1 },
];

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence about rhythm.",
  "Fill in the blank with the correct word.",
] as const;

const BEATS_LINE_PROMPTS = [
  "A learner writes {first} followed by {second} inside one bar. How many beats does this pattern total? Click the point on the number line.",
  "Inside one bar, a learner writes {first} then {second}. What is the total number of beats? Click the number line.",
  "{first} is followed by {second} in one bar. How many beats does this add up to? Click the number line.",
  "How many beats do {first} and {second} total together in one bar? Click the point on the number line.",
  "A bar contains {first} then {second}. Click the number line to show the total beats.",
] as const;

const MATCH_PROMPTS = [
  "Match each rhythm term to its correct meaning.",
  "Pair each rhythm term below with its correct meaning.",
  "Match each term to what it describes.",
  "Connect each rhythm term to its correct meaning.",
  "For each term below, choose its matching meaning.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into the correct rhythm-composing category.",
  "Which rhythm-composing category does each item below belong to? Sort them.",
  "Classify each item into its correct rhythm-composing category.",
  "Decide which category each item fits, and sort it.",
  "Sort these items by the rhythm-composing category they belong to.",
] as const;

const BEATS_FIT_PROMPTS = [
  "A learner writes {first} followed by {second} inside one bar. In 2/4 time (2 beats per bar), does this pattern fit?",
  "Inside one bar of 2/4 time, a learner writes {first} then {second}. Does this pattern fit exactly?",
  "{first} is followed by {second} in one bar of 2/4 time. Does this fit the time signature?",
  "A bar of 2/4 time contains {first} then {second}. Does this pattern fit the 2 beats available?",
  "Does {first} followed by {second} fit exactly into one bar of 2/4 time?",
] as const;

export const rhythm: Skill = {
  id: "g7-cas-rhythm",
  code: "C.1",
  subjectId: "creative-arts-sports",
  strandId: "g7-cas-creating-performing",
  grade: 7,
  title: "Composing Rhythm",
  description: "Factors in creating a rhythmic pattern in 2/4 time, warm-up body movements, and French rhythm names.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "beats-fit", "fill-blank", "beats-line"] as const);

    if (branch === "fill-blank") {
      const t = randChoice(rng, TERMS);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: `${t.meaning[0].toUpperCase()}${t.meaning.slice(1)} is called `,
        after: ".",
        correctAnswer: t.label,
        acceptedAnswers: [t.label, t.label.toLowerCase()],
        inputMode: "text",
        hint: "Think about whether the description is a composing factor, a warm-up movement, or a French rhythm name.",
        explanation: `${t.label}: ${t.meaning}.`,
      };
    }

    if (branch === "beats-line") {
      const first = randChoice(rng, NOTES);
      const second = randChoice(rng, NOTES);
      const total = first.beats + second.beats;
      return {
        kind: "number-line",
        prompt: randChoice(rng, BEATS_LINE_PROMPTS).replace("{first}", first.label).replace("{second}", second.label),
        hint: "Add the beat value of the first note to the beat value of the second note.",
        min: 0,
        max: 8,
        step: 0.5,
        correctValue: total,
        mode: "point",
        explanation: `${first.label} (${first.beats} beat${first.beats === 1 ? "" : "s"}) plus ${second.label} (${second.beats} beat${second.beats === 1 ? "" : "s"}) totals ${total} beat${total === 1 ? "" : "s"}.`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
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
        hint: "Factors describe what to consider when composing; movements describe warm-up actions; French rhythm names describe how a beat is divided.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const picks: typeof TERMS = [];
      for (const bucket of ["factor", "movement", "name"] as const) {
        picks.push(...shuffle(rng, TERMS.filter((t) => t.bucket === bucket)).slice(0, bucket === "movement" ? 3 : bucket === "name" ? 4 : 3));
      }
      const items = shuffle(rng, picks);
      const correctBucket: Record<string, string> = {};
      for (const t of items) correctBucket[t.label] = t.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((t) => ({ id: t.label, label: t.label })),
        buckets: (["factor", "movement", "name"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Factors are about composing; movements are about the body; French names describe a rhythm's sound.",
        explanation: items.map((t) => `${t.label} — ${BUCKET_LABEL[t.bucket].toLowerCase()}.`).join(" "),
      };
    }

    // beats-fit: rng-computed Apply/Evaluate-tier — does a randomly built pair of notes
    // fit inside one bar of 2/4 time (2 beats)? Judges a described pattern against the
    // 2/4 time-signature constraint named as a factor above.
    const first = randChoice(rng, NOTES);
    const second = randChoice(rng, NOTES);
    const total = first.beats + second.beats;
    const verdict = total === 2 ? "fits exactly" : total < 2 ? "is too short" : "is too long";
    const choices = shuffle(rng, ["Fits exactly into one bar of 2/4 time", "Is too short for one bar of 2/4 time", "Is too long for one bar of 2/4 time"]);
    const correctLabel = verdict === "fits exactly" ? "Fits exactly into one bar of 2/4 time" : verdict === "is too short" ? "Is too short for one bar of 2/4 time" : "Is too long for one bar of 2/4 time";
    return {
      kind: "multiple-choice",
      prompt: randChoice(rng, BEATS_FIT_PROMPTS).replace("{first}", first.label).replace("{second}", second.label),
      choices,
      correctIndex: choices.indexOf(correctLabel),
      layout: "list",
      hint: "In 2/4 time, one bar always holds exactly 2 beats — add up the beat values of both notes and compare to 2.",
      explanation: `${first.label} (${first.beats} beat${first.beats === 1 ? "" : "s"}) plus ${second.label} (${second.beats} beat${second.beats === 1 ? "" : "s"}) totals ${total} beat${total === 1 ? "" : "s"}, which ${verdict === "fits exactly" ? "fits exactly into" : verdict === "is too short" ? "is fewer than" : "is more than"} the 2 beats a 2/4 bar holds.`,
    };
  },
};
