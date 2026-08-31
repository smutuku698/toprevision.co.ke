import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PRINTING_STEPS: { id: string; label: string }[] = [
  { id: "design", label: "Design a motif from geometric shapes" },
  { id: "transfer", label: "Transfer the design onto the block" },
  { id: "cut", label: "Cut out the non-image parts, leaving the motif raised" },
  { id: "registration", label: "Make registration marks on the fabric" },
  { id: "ink", label: "Prepare the printing ink and surface" },
  { id: "print", label: "Print the alternate repeat pattern using the dabbing method" },
  { id: "fix", label: "Fix the ink by ironing the fabric" },
];

const CATEGORIZE_ITEMS: { label: string; bucket: string; reason: string }[] = [
  { label: "Community of origin", bucket: "classify", reason: "Community of origin is one of the 5 criteria for classifying a folk song." },
  { label: "Occasion", bucket: "classify", reason: "Occasion is one of the 5 criteria for classifying a folk song." },
  { label: "Purpose", bucket: "classify", reason: "Purpose is one of the 5 criteria for classifying a folk song." },
  { label: "Participants", bucket: "classify", reason: "Participants is one of the 5 criteria for classifying a folk song." },
  { label: "Messages/themes", bucket: "classify", reason: "Messages/themes is one of the 5 criteria for classifying a folk song." },
  { label: "Voice projection and balance", bucket: "technique", reason: "Voice projection and balance is a named folk song performance technique." },
  { label: "Phrasing", bucket: "technique", reason: "Phrasing is a named folk song performance technique." },
  { label: "Tempo", bucket: "technique", reason: "Tempo is a named folk song performance technique." },
  { label: "Tone", bucket: "technique", reason: "Tone is a named folk song performance technique." },
  { label: "Dynamics", bucket: "technique", reason: "Dynamics is a named folk song performance technique." },
  { label: "Expression and interpretation", bucket: "technique", reason: "Expression and interpretation is a named folk song performance technique." },
  { label: "Gestures and movement", bucket: "technique", reason: "Gestures and movement is a named folk song performance technique." },
  { label: "Intensity", bucket: "technique", reason: "Intensity is a named folk song performance technique." },
  { label: "Mood", bucket: "technique", reason: "Mood is a named folk song performance technique." },
  { label: "Idiom/authenticity", bucket: "technique", reason: "Idiom/authenticity is a named folk song performance technique." },
];

const BUCKET_LABEL: Record<string, string> = {
  classify: "Folk song classification criterion",
  technique: "Folk song performance technique",
};

const QUESTIONS: { q: string; correct: string; distractors: string[]; tier?: "evaluate" }[] = [
  { q: "A folk song is performed specifically at a wedding celebration. Which classification criterion does 'wedding' represent?", correct: "Occasion", distractors: ["Community of origin", "Participants", "Messages/themes"] },
  { q: "A folk song is traditionally sung only by women during a harvest ritual in one community. Which classification criterion does 'women' represent?", correct: "Participants", distractors: ["Occasion", "Purpose", "Community of origin"] },
  { q: "A folk song is specifically identified as coming from the Luo community. Which classification criterion does this describe?", correct: "Community of origin", distractors: ["Occasion", "Purpose", "Participants"] },
  { q: "A folk song is sung specifically to teach children moral lessons. Which classification criterion does this describe?", correct: "Purpose", distractors: ["Occasion", "Community of origin", "Participants"] },
  { q: "A folk song's lyrics repeatedly emphasise the value of unity within a community. Which classification criterion does this describe?", correct: "Messages/themes", distractors: ["Occasion", "Participants", "Purpose"] },
  {
    q: "A performer sings a folk song with strong tone and dynamics, but stands completely still with no gestures or movement throughout. Evaluate this performance.",
    correct: "It is missing a key performance technique — gestures and movement, which help convey meaning and authenticity",
    distractors: ["It is complete — gestures and movement are not part of folk song performance", "It is complete — tone and dynamics are the only techniques that matter", "It is missing tempo, since tone and dynamics already cover movement"],
    tier: "evaluate",
  },
  {
    q: "A performer sings all the correct words of a folk song but changes the style so it no longer resembles how the community traditionally performs it. Evaluate this performance.",
    correct: "It lacks idiom/authenticity — a key technique that preserves the song's traditional style of performance",
    distractors: ["This is acceptable — authenticity is not a named performance technique", "This is acceptable — only correct words matter in a folk song performance", "This shows strong phrasing, since phrasing means changing the traditional style"],
    tier: "evaluate",
  },
  { q: "What does 'phrasing' refer to as a folk song performance technique?", correct: "How musical phrases are grouped and shaped when sung", distractors: ["How loudly or softly the song is sung", "The speed at which the song is sung", "The costume worn during the performance"] },
  { q: "What does 'dynamics' refer to as a folk song performance technique?", correct: "Variation in loudness and softness during the performance", distractors: ["The speed of the song", "The community the song originates from", "The props used during the performance"] },
  { q: "What is the first step in preparing a block for the alternate repeat pattern used on a folk song costume?", correct: "Designing a motif from geometric (inorganic) shapes", distractors: ["Fixing the ink by ironing the fabric", "Making registration marks on the fabric", "Printing the pattern using the dabbing method"] },
  { q: "What is the purpose of registration marks when block-printing a costume?", correct: "To help align the repeat pattern accurately as it is printed across the fabric", distractors: ["To record which community the folk song belongs to", "To indicate which performance technique is being used", "To measure the tempo of the folk song"] },
  { q: "Which printing method is used to apply ink to the fabric when block-printing a folk song costume?", correct: "The dabbing method", distractors: ["The wash and brush stroke method", "The stencil spray method", "The larks head knot method"] },
  { q: "What is the role of folk songs in Kenyan society, per the design's key inquiry question?", correct: "They preserve and express the cultural identity, values, and history of a community", distractors: ["Folk songs exist purely for competition scoring", "Folk songs have no connection to a community's culture", "Folk songs are only performed in schools, never elsewhere"] },
];

const FILL_BLANKS: { before: string; after: string; answers: string[]; explanation: string }[] = [
  { before: "The classification criterion describing where a folk song comes from is called ___ of origin.", after: "", answers: ["community", "Community"], explanation: "Community of origin classifies where a folk song comes from." },
  { before: "The classification criterion describing when a folk song is performed, such as a wedding, is called ___.", after: "", answers: ["occasion", "Occasion"], explanation: "Occasion classifies when a folk song is performed." },
  { before: "The performance technique describing how musical phrases are grouped and shaped when sung is called ___.", after: "", answers: ["phrasing", "Phrasing"], explanation: "Phrasing groups and shapes musical phrases." },
  { before: "The performance technique describing variation in loudness and softness is called ___.", after: "", answers: ["dynamics", "Dynamics"], explanation: "Dynamics is variation in loudness and softness." },
  { before: "The performance technique that preserves a song's traditional style is called ___/authenticity.", after: "", answers: ["idiom", "Idiom"], explanation: "Idiom/authenticity preserves a song's traditional style." },
  { before: "The performance technique describing gestures and ___ that convey meaning during a folk song.", after: "", answers: ["movement", "Movement"], explanation: "Gestures and movement convey meaning during a performance." },
  { before: "The first step in preparing a block for a costume's repeat pattern is designing a ___ from geometric shapes.", after: "", answers: ["motif", "Motif"], explanation: "Designing a motif is the first block-printing step." },
  { before: "Marks made on fabric to help align a repeat pattern accurately are called ___ marks.", after: "", answers: ["registration", "Registration"], explanation: "Registration marks help align a repeat pattern." },
  { before: "The method used to apply ink to fabric when block-printing a costume is called the ___ method.", after: "", answers: ["dabbing", "Dabbing"], explanation: "The dabbing method applies ink to the fabric." },
  { before: "After printing, the ink is fixed onto the fabric by ___ it.", after: "", answers: ["ironing", "Ironing"], explanation: "Ironing fixes the ink onto the fabric." },
];

const MATCH_PROMPTS = [
  "Match each item to its correct description.",
  "Pair each item below with its correct description.",
  "Match each item to what it describes.",
  "Connect each item to its correct description.",
  "For each item below, choose its matching description.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence about Kenyan folk song.",
  "Fill in the blank with the correct word.",
] as const;

const ORDER_PROMPTS = [
  "Arrange these steps of block-printing a costume motif in the order they happen.",
  "Put these block-printing steps in the order they occur.",
  "Order these steps, from first to last.",
  "Sort these block-printing steps into the correct sequence.",
  "Place these block-printing steps in the order you would follow them.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into the correct category.",
  "Which category does each item below belong to? Sort them.",
  "Classify each item into its correct category.",
  "Decide which category each item fits, and sort it.",
  "Sort these items by the category they belong to.",
] as const;

export const kenyanFolkSong: Skill = {
  id: "g7-cas-folk-song",
  code: "C.9",
  subjectId: "creative-arts-sports",
  strandId: "g7-cas-creating-performing",
  grade: 7,
  title: "Kenyan Folk Song",
  description: "Classifying Kenyan folk songs, their performance techniques, and block-printing a costume motif.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "mc", "match", "fill-blank"] as const);

    if (branch === "match") {
      const classifyPicks = CATEGORIZE_ITEMS.filter((c) => c.bucket === "classify");
      const techPicks = shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === "technique")).slice(0, 2);
      const chosen = shuffle(rng, [...classifyPicks, ...techPicks]);
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
        hint: "Classification criteria describe how a folk song is categorised; performance techniques describe how it is sung.",
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
        hint: "Think about whether this describes how a folk song is classified, how it is performed, or how a costume is printed.",
        explanation: f.explanation,
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, PRINTING_STEPS),
        correctOrder: PRINTING_STEPS.map((s) => s.id),
        hint: "Design the motif first, prepare the block and fabric, then print and finally fix the ink in place.",
        explanation: `Block-printing a costume motif follows this order: ${PRINTING_STEPS.map((s) => s.label).join(" → ")}.`,
      };
    }

    if (branch === "categorize") {
      const classifyPicks = CATEGORIZE_ITEMS.filter((c) => c.bucket === "classify");
      const techPicks = shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === "technique")).slice(0, 6);
      const items = shuffle(rng, [...classifyPicks, ...techPicks]);
      const correctBucket: Record<string, string> = {};
      for (const c of items) correctBucket[c.label] = c.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((c) => ({ id: c.label, label: c.label })),
        buckets: (["classify", "technique"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Classification criteria describe how a folk song is categorised; performance techniques describe how it is sung and performed.",
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
      hint: q.tier === "evaluate"
        ? "Check the performance against the full list of named performance techniques — is anything missing or done wrong?"
        : "Decide whether the detail describes what kind of folk song it is, or how it is performed.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
