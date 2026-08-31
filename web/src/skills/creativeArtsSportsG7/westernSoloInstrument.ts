import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CATEGORIZE_ITEMS: { label: string; bucket: string; reason: string }[] = [
  { label: "Playing posture", bucket: "technique", reason: "Posture is a named technique for playing the descant recorder or a Western instrument." },
  { label: "Blowing", bucket: "technique", reason: "Blowing is a named playing technique." },
  { label: "Fingering", bucket: "technique", reason: "Fingering is a named playing technique." },
  { label: "Tonguing", bucket: "technique", reason: "Tonguing is a named playing technique." },
  { label: "Strumming", bucket: "technique", reason: "Strumming is a named playing technique for other Western instruments." },
  { label: "Picking", bucket: "technique", reason: "Picking is a named playing technique for other Western instruments." },
  { label: "Tone quality", bucket: "technique", reason: "Clarity of tone quality is a named playing technique." },
  { label: "Embouchure", bucket: "technique", reason: "Embouchure (mouth position) is a named playing technique." },
  { label: "Repeat marks / 1st and 2nd repeat", bucket: "direction", reason: "Repeat marks and 1st/2nd repeat endings are performance directions for repeat." },
  { label: "Legato", bucket: "direction", reason: "Legato is an articulation performance direction — smooth and connected." },
  { label: "Staccato", bucket: "direction", reason: "Staccato is an articulation performance direction — short and detached." },
  { label: "Loud", bucket: "direction", reason: "Loud is a dynamics performance direction." },
  { label: "Soft", bucket: "direction", reason: "Soft is a dynamics performance direction." },
  { label: "Fast tempo", bucket: "direction", reason: "Fast is a tempo performance direction." },
  { label: "Slow tempo", bucket: "direction", reason: "Slow is a tempo performance direction." },
];

const BUCKET_LABEL: Record<string, string> = {
  technique: "Instrument playing technique",
  direction: "Performance direction",
};

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "A performer plays a passage smoothly, connecting each note to the next with no gaps. Which articulation direction is being followed?", correct: "Legato", distractors: ["Staccato", "Fast tempo", "Loud"] },
  { q: "A performer plays a passage with short, detached notes, each clearly separated. Which articulation direction is being followed?", correct: "Staccato", distractors: ["Legato", "Slow tempo", "Soft"] },
  { q: "A score marks a section to be played very quietly. Which category of performance direction is this?", correct: "Dynamics", distractors: ["Tempo", "Articulation", "Repeat"] },
  { q: "A score marks a section to be played very quickly. Which category of performance direction is this?", correct: "Tempo", distractors: ["Dynamics", "Articulation", "Repeat"] },
  { q: "A score uses '1st and 2nd repeat' endings. Which category of performance direction is this?", correct: "Repeat", distractors: ["Dynamics", "Tempo", "Articulation"] },
  { q: "What does correct embouchure refer to when playing a wind instrument like the descant recorder?", correct: "The correct positioning of the mouth and lips against the instrument", distractors: ["The finger positions used to change pitch", "How loudly the instrument is played", "The speed at which a piece is performed"] },
  { q: "What does 'tonguing' refer to when playing a wind instrument?", correct: "Using the tongue to start and separate individual notes clearly", distractors: ["The angle at which the instrument is held", "The material the instrument's mouthpiece is made from", "How the fingers are placed on the finger holes"] },
  { q: "Playing the notes C, D, E, F, G, A, B, C in order on a descant recorder in C major uses which technical exercise?", correct: "An ascending scale of C major", distractors: ["A descending arpeggio in G major", "A staccato drill in F major", "A repeat-sign exercise with no notes"] },
  { q: "Why is a tonic arpeggio a useful technical exercise for a Western solo instrument?", correct: "It practises playing the notes of the tonic chord in sequence, building familiarity with the key", distractors: ["It only teaches how to tune the instrument", "It is only used to test hearing, not playing skill", "It replaces the need to learn fingering at all"] },
  { q: "What is the purpose of tuning a Western instrument before a performance?", correct: "So the instrument produces the correct, in-tune pitch when played", distractors: ["To make the instrument louder overall", "To change the key signature of the piece", "To speed up the tempo automatically"] },
  { q: "What is the purpose of creating a stencil motif of a descant recorder using strong paper?", correct: "To use the repeat pattern for printing the motif onto paper or fabric", distractors: ["To tune the recorder more accurately", "To learn the C major fingering chart", "To measure the correct tempo of a piece"] },
];

const C_MAJOR_SCALE = ["C", "D", "E", "F", "G", "A", "B", "C"];

const FILL_BLANKS: { before: string; after: string; answers: string[]; explanation: string }[] = [
  { before: "The correct positioning of the mouth and lips against a wind instrument is called ___.", after: "", answers: ["embouchure", "Embouchure"], explanation: "Embouchure is the correct mouth/lip position." },
  { before: "Using the tongue to start and separate individual notes clearly is called ___.", after: "", answers: ["tonguing", "Tonguing"], explanation: "Tonguing separates individual notes clearly." },
  { before: "The playing technique used to change pitch by covering and uncovering holes is called ___.", after: "", answers: ["fingering", "Fingering"], explanation: "Fingering changes pitch on the recorder." },
  { before: "The articulation direction for playing notes smoothly connected with no gaps is called ___.", after: "", answers: ["legato", "Legato"], explanation: "Legato means smooth and connected." },
  { before: "The articulation direction for playing short, detached notes is called ___.", after: "", answers: ["staccato", "Staccato"], explanation: "Staccato means short and detached." },
  { before: "A dynamics performance direction telling the performer to play quietly is ___.", after: "", answers: ["soft", "Soft"], explanation: "Soft is a dynamics direction." },
  { before: "A dynamics performance direction telling the performer to play loudly is ___.", after: "", answers: ["loud", "Loud"], explanation: "Loud is a dynamics direction." },
  { before: "A technical exercise that practises the notes of the tonic chord in sequence is called a tonic ___.", after: "", answers: ["arpeggio", "Arpeggio"], explanation: "A tonic arpeggio practises the tonic chord's notes in sequence." },
  { before: "Playing the notes of a scale one after another, ascending or descending, is called practising the ___.", after: "", answers: ["scale", "Scale"], explanation: "Practising a scale plays its notes in sequence." },
  { before: "Reading music straight through without prior practice is called ___ reading.", after: "", answers: ["sight", "Sight"], explanation: "Sight reading means playing music straight through without prior practice." },
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
  "Complete this sentence about the Western solo instrument.",
  "Fill in the blank with the correct word.",
] as const;

const SCALE_LINE_PROMPTS = [
  "On the ascending C major scale (C, D, E, F, G, A, B, C), what position number is the note {note}? Click the point on the number line.",
  "In the ascending C major scale, which position number is {note}? Click the number line.",
  "Counting up the C major scale from C, what position is {note} at? Mark it on the number line.",
  "Where does {note} fall in the ascending C major scale? Click its position number on the number line.",
  "What position number does {note} occupy in the ascending C major scale? Click the number line.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into the correct category.",
  "Which category does each item below belong to? Sort them.",
  "Classify each item into its correct category.",
  "Decide which category each item fits, and sort it.",
  "Sort these items by the category they belong to.",
] as const;

export const westernSoloInstrument: Skill = {
  id: "g7-cas-western-solo",
  code: "C.5",
  subjectId: "creative-arts-sports",
  strandId: "g7-cas-creating-performing",
  grade: 7,
  title: "Western Solo Instrument",
  description: "Techniques for playing a descant recorder or other Western instrument in C major, and reading performance directions for repeat, articulation, dynamics, and tempo.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc", "match", "fill-blank", "scale-line"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, CATEGORIZE_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.label, label: c.label })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.label, label: c.reason })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.label] = c.label;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Techniques are about how the player produces a sound; performance directions are marks in the music.",
        explanation: chosen.map((c) => c.reason).join(" "),
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
        hint: "Think about whether the term is a playing technique, a performance direction, or a practice exercise.",
        explanation: f.explanation,
      };
    }

    if (branch === "scale-line") {
      // Only positions 1-7 are asked (not the repeated top C at position 8) so the
      // note name always maps to exactly one unambiguous position.
      const idx = randChoice(rng, [0, 1, 2, 3, 4, 5, 6] as const);
      const note = C_MAJOR_SCALE[idx];
      const position = idx + 1;
      return {
        kind: "number-line",
        prompt: randChoice(rng, SCALE_LINE_PROMPTS).replace("{note}", note),
        hint: "Count from C as position 1 up through the scale in order.",
        min: 1,
        max: 8,
        step: 1,
        correctValue: position,
        mode: "point",
        explanation: `In the C major scale C-D-E-F-G-A-B-C, ${note} is at position ${position}.`,
      };
    }

    if (branch === "categorize") {
      const techPicks = shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === "technique")).slice(0, 4);
      const dirPicks = shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === "direction")).slice(0, 5);
      const items = shuffle(rng, [...techPicks, ...dirPicks]);
      const correctBucket: Record<string, string> = {};
      for (const c of items) correctBucket[c.label] = c.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((c) => ({ id: c.label, label: c.label })),
        buckets: (["technique", "direction"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Techniques are about how the player produces a sound; performance directions are marks in the music that shape how it's played.",
        explanation: items.map((c) => c.reason).join(" "),
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Performance directions fall into four families: repeat, articulation, dynamics, and tempo — figure out which family the question is describing.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
