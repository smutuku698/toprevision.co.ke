import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CATEGORIZE_ITEMS: { label: string; bucket: string; reason: string }[] = [
  { label: "Trapping", bucket: "football", reason: "Trapping is a criterion for analysing a football game." },
  { label: "Dribbling", bucket: "football", reason: "Dribbling is a criterion for analysing a football game." },
  { label: "Safety observed", bucket: "football", reason: "Safety is a criterion for analysing a football game." },
  { label: "Media of performance", bucket: "folksong", reason: "Media of performance is a criterion for analysing a folk song." },
  { label: "Structure", bucket: "folksong", reason: "Structure is a criterion for analysing a folk song." },
  { label: "Community of origin", bucket: "folksong", reason: "Community of origin is a criterion for analysing a folk song." },
  { label: "Participants", bucket: "folksong", reason: "Participants is a criterion for analysing a folk song." },
  { label: "Singing", bucket: "folksong", reason: "Singing is a criterion for analysing a folk song." },
  { label: "Messages", bucket: "folksong", reason: "Messages is a criterion for analysing a folk song." },
  { label: "Role of props", bucket: "folksong", reason: "Role of props is a criterion for analysing a folk song." },
  { label: "Body movements", bucket: "folksong", reason: "Body movements is a criterion for analysing a folk song." },
  { label: "Purpose", bucket: "folksong", reason: "Purpose is a criterion for analysing a folk song." },
  { label: "Costumes", bucket: "folksong", reason: "Costumes is a criterion for analysing a folk song." },
  { label: "Accompaniment", bucket: "folksong", reason: "Accompaniment is a criterion for analysing a folk song." },
  { label: "Mood", bucket: "folksong", reason: "Mood is a criterion for analysing a folk song." },
  { label: "Theme", bucket: "story", reason: "Theme is a criterion for evaluating a storytelling performance." },
  { label: "Plot", bucket: "story", reason: "Plot is a criterion for evaluating a storytelling performance." },
  { label: "Confidence of the performer", bucket: "story", reason: "Performer confidence is a criterion for evaluating a storytelling performance." },
  { label: "Use of voice", bucket: "story", reason: "Use of voice is a criterion for evaluating a storytelling performance." },
  { label: "Use of body", bucket: "story", reason: "Use of body is a criterion for evaluating a storytelling performance." },
  { label: "Use of costume and props", bucket: "story", reason: "Use of costume and props is a criterion for evaluating a storytelling performance." },
  { label: "Audience involvement", bucket: "story", reason: "Audience involvement is a criterion for evaluating a storytelling performance." },
  { label: "Time management", bucket: "story", reason: "Time management is a criterion for evaluating a storytelling performance." },
  { label: "Balance, proportion, dominance", bucket: "art", reason: "Balance, proportion, and dominance describe a 2D artwork's organisation." },
  { label: "Subject matter (what is happening)", bucket: "art", reason: "Subject matter is a criterion for evaluating a 2D artwork." },
  { label: "Judgement of the artwork", bucket: "art", reason: "Judgement is the final step in evaluating a 2D artwork." },
];

const BUCKET_LABEL: Record<string, string> = {
  football: "Football-game analysis criterion",
  folksong: "Folk-song analysis criterion",
  story: "Storytelling-performance analysis criterion",
  art: "2D-artwork analysis criterion",
};

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "When analysing a folk song, which criterion looks at who is performing it and how many performers are involved?", correct: "Participants", distractors: ["Structure", "Accompaniment", "Media of performance"] },
  { q: "When analysing a folk song, which criterion looks at whether it is performed live, recorded, with instruments, or a cappella?", correct: "Media of performance", distractors: ["Community of origin", "Purpose", "Mood"] },
  { q: "When analysing a storytelling performance, which criterion evaluates how effectively the narrator used their voice and body?", correct: "Use of voice and use of body", distractors: ["Time management", "Plot", "Theme"] },
  { q: "When analysing a storytelling performance, which criterion evaluates whether the story stayed within its planned length?", correct: "Time management", distractors: ["Theme", "Use of costume and props", "Audience involvement"] },
  { q: "When evaluating a 2D artwork's organisation, which three elements are examined?", correct: "Balance, proportion, and dominance", distractors: ["Only the artist's name and the gallery", "Only the price and the frame material", "Only the size of the canvas"] },
  { q: "When evaluating a 2D artwork, what does 'subject matter' refer to?", correct: "What is actually happening or depicted in the artwork", distractors: ["The message the artist is trying to convey", "The type of paint used", "The gallery displaying the artwork"] },
  { q: "When evaluating a 2D artwork, what does 'theme' refer to, as distinct from subject matter?", correct: "What the artist is saying or expressing through the work", distractors: ["What is literally depicted in the picture", "The size of the canvas used", "The frame chosen for display"] },
  { q: "When analysing a football game, which criteria should be observed alongside trapping and dribbling?", correct: "Safety", distractors: ["Mood", "Community of origin", "Time management"] },
  { q: "When analysing a folk song's accompaniment, what is being examined?", correct: "Whether and how instruments or other sounds support the singing", distractors: ["The community the song originates from", "The theme the artist is expressing", "The balance and proportion of the performance space"] },
  { q: "Why is analysis considered an important skill across Creative Arts and Sports, per the design's key inquiry question?", correct: "It helps performers and audiences understand strengths, weaknesses, and the significance of a performance or work", distractors: ["Analysis is only useful for judges in official competitions", "Analysis replaces the need to ever perform or create anything", "Analysis has no real use once a performance has ended"] },
  { q: "What is the final step described in evaluating a 2D artwork?", correct: "Making a judgement about the artwork based on its organisation, subject matter, and theme", distractors: ["Painting a second, improved version immediately", "Skipping straight to displaying the artwork with no evaluation", "Only checking the artist's signature"] },
];

// Condensed from the design's own suggested learning experiences: interpret criteria
// first, then observe the performance/work, then analyse it against those criteria,
// then reach a judgement — the general analysis process across all four categories.
const ANALYSIS_PROCESS: { id: string; label: string }[] = [
  { id: "criteria", label: "Interpret the criteria for evaluating the category" },
  { id: "observe", label: "Watch, listen to, read, or observe the performance or work" },
  { id: "analyse", label: "Analyse it closely against each named criterion" },
  { id: "judge", label: "Make a judgement based on the analysis" },
];

const FILL_BLANKS: { before: string; after: string; answers: string[]; explanation: string }[] = [
  { before: "When analysing a football game, the two ball-control skills examined are trapping and ___.", after: "", answers: ["dribbling", "Dribbling"], explanation: "Trapping and dribbling are examined in a football-game analysis." },
  { before: "When analysing a folk song, the criterion describing whether it is live, recorded, or a cappella is called ___ of performance.", after: "", answers: ["media", "Media"], explanation: "Media of performance describes how a folk song is delivered." },
  { before: "When analysing a folk song, the criterion describing whether instruments support the singing is called ___.", after: "", answers: ["accompaniment", "Accompaniment"], explanation: "Accompaniment describes instrumental support in a folk song." },
  { before: "When evaluating a storytelling performance, the criterion checking whether the story stayed within its planned length is called ___ management.", after: "", answers: ["time", "Time"], explanation: "Time management checks the story's length." },
  { before: "When evaluating a storytelling performance, the criterion assessing how sure and composed the narrator seemed is called performer ___.", after: "", answers: ["confidence", "Confidence"], explanation: "Performer confidence is a storytelling analysis criterion." },
  { before: "When evaluating a 2D artwork's organisation, the three elements examined are balance, proportion, and ___.", after: "", answers: ["dominance", "Dominance"], explanation: "Balance, proportion, and dominance describe an artwork's organisation." },
  { before: "When evaluating a 2D artwork, what is literally depicted or happening is called its subject ___.", after: "", answers: ["matter", "Matter"], explanation: "Subject matter is what is depicted in an artwork." },
  { before: "When evaluating a 2D artwork, what the artist is saying or expressing is called its ___.", after: "", answers: ["theme", "Theme"], explanation: "Theme is what an artwork expresses, distinct from its subject matter." },
  { before: "The final step in evaluating a 2D artwork, after examining its organisation, subject matter, and theme, is making a ___.", after: "", answers: ["judgement", "Judgement", "judgment", "Judgment"], explanation: "Judgement is the final step in evaluating a 2D artwork." },
  { before: "Analysis helps performers and audiences understand the strengths, weaknesses, and ___ of a performance or work.", after: "", answers: ["significance", "Significance"], explanation: "Analysis reveals the significance of a performance or work." },
];

const MATCH_PROMPTS = [
  "Match each analysis criterion to its correct description.",
  "Pair each analysis criterion below with its correct description.",
  "Match each criterion to what it describes.",
  "Connect each analysis criterion to its correct description.",
  "For each criterion below, choose its matching description.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence about analysis in Creative Arts and Sports.",
  "Fill in the blank with the correct word.",
] as const;

const ORDER_PROMPTS = [
  "Arrange these steps of the analysis process in the order they typically happen.",
  "Put these analysis steps in the order they occur.",
  "Order these steps, from first to last.",
  "Sort these analysis steps into the correct sequence.",
  "Place these analysis steps in the order you would follow them.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each analysis criterion into the category of Creative Arts and Sports it belongs to.",
  "Which category does each analysis criterion below belong to? Sort them.",
  "Classify each criterion into its correct category.",
  "Decide which category each criterion fits, and sort it.",
  "Sort these criteria by the category they belong to.",
] as const;

export const analysis: Skill = {
  id: "g7-cas-analysis",
  code: "A.1",
  subjectId: "creative-arts-sports",
  strandId: "g7-cas-appreciation",
  grade: 7,
  title: "Analysis of Creative Arts and Sports",
  description: "Criteria for analysing a football game, a folk song, a storytelling performance, and a 2D artwork.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc", "match", "fill-blank", "order"] as const);

    if (branch === "match") {
      const picks: typeof CATEGORIZE_ITEMS = [];
      for (const bucket of ["football", "folksong", "story", "art"]) {
        picks.push(...shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === bucket)).slice(0, bucket === "football" ? 1 : bucket === "art" ? 1 : 2));
      }
      const chosen = shuffle(rng, picks);
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
        hint: "Each category of Creative Arts and Sports has its own set of things to look for when analysing a performance or work.",
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
        hint: "Think about which category (football, folk song, storytelling, or 2D artwork) the question is analysing.",
        explanation: f.explanation,
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, ANALYSIS_PROCESS),
        correctOrder: ANALYSIS_PROCESS.map((s) => s.id),
        hint: "You need to know the criteria before observing, and observe before analysing and judging.",
        explanation: `Analysis follows this order: ${ANALYSIS_PROCESS.map((s) => s.label).join(" → ")}.`,
      };
    }

    if (branch === "categorize") {
      const picks: typeof CATEGORIZE_ITEMS = [];
      for (const bucket of ["football", "folksong", "story", "art"]) {
        picks.push(...shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === bucket)).slice(0, bucket === "football" ? 2 : 3));
      }
      const items = shuffle(rng, picks);
      const correctBucket: Record<string, string> = {};
      for (const c of items) correctBucket[c.label] = c.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((c) => ({ id: c.label, label: c.label })),
        buckets: (["football", "folksong", "story", "art"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Each category of Creative Arts and Sports has its own set of things to look for when analysing a performance or work.",
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
      hint: "Analysis examines a performance or work closely using a specific set of named criteria for its category.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
