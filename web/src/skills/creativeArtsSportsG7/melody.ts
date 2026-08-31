import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CATEGORIZE_ITEMS: { label: string; bucket: string; reason: string }[] = [
  { label: "Singable, with leaps of a 3rd", bucket: "quality", reason: "This is a quality of a good melody — it should be comfortable to sing, including leaps of a 3rd." },
  { label: "Has an identifiable shape/contour", bucket: "quality", reason: "This is a quality of a good melody — its rise and fall should be recognisable." },
  { label: "Has symmetry", bucket: "quality", reason: "This is a quality of a good melody — its phrases should balance each other." },
  { label: "Starts on doh, me or soh and ends on doh", bucket: "quality", reason: "This is a quality of a good melody — it should begin on doh/me/soh and resolve back to doh." },
  { label: "Cutting a window on the front page", bucket: "card", reason: "This is a step in designing the seasonal melody card." },
  { label: "Creating illustrations inside the window", bucket: "card", reason: "This is a step in designing the seasonal melody card, inspired by the melody composed." },
  { label: "Embellishing with music notation signs", bucket: "card", reason: "This is a step in designing the seasonal melody card." },
  { label: "Signing the card using calligraphy", bucket: "card", reason: "This is the final step in designing the seasonal melody card." },
  { label: "Paper", bucket: "material", reason: "Paper is a found object used to embellish the seasonal melody card." },
  { label: "Buttons", bucket: "material", reason: "Buttons are a found object used to embellish the seasonal melody card." },
  { label: "Beads", bucket: "material", reason: "Beads are a found object used to embellish the seasonal melody card." },
  { label: "Straws", bucket: "material", reason: "Straws are a found object used to embellish the seasonal melody card." },
];

const BUCKET_LABEL: Record<string, string> = {
  quality: "Quality of a good melody",
  card: "Step in designing the melody card",
  material: "Found object used to embellish the card",
};

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "A learner composes a four-bar melody. Which key should it be written in this term, per the Grade 7 design?", correct: "C major (no sharps or flats)", distractors: ["G major (one sharp)", "F major (one flat)", "D major (two sharps)"] },
  { q: "In tonic solfa, what does 'd' stand for?", correct: "Doh", distractors: ["Me", "Soh", "Fah"] },
  { q: "In tonic solfa, what does 'm' stand for?", correct: "Me", distractors: ["Doh", "Soh", "Lah"] },
  { q: "In tonic solfa, what does 's' stand for?", correct: "Soh", distractors: ["Doh", "Me", "Ray"] },
  { q: "A well-composed melody in this design should end on which tonic solfa syllable?", correct: "Doh — the melody resolves back to the tonic", distractors: ["Soh — melodies should always end on the dominant", "Me — melodies should always end on the mediant", "Any syllable, it does not matter"] },
  { q: "What does it mean for a melody to have an 'identifiable shape or contour'?", correct: "Its overall rise and fall in pitch is clear and recognisable when heard", distractors: ["It is written using only straight lines on the staff", "It never repeats any note twice", "It is played on exactly one instrument only"] },
  { q: "What does 'symmetry' mean as a quality of a good melody?", correct: "Its phrases balance each other, for example a question phrase answered by a matching phrase", distractors: ["Every note in the melody has exactly the same pitch", "The melody is played backwards halfway through", "The melody has no rests at all"] },
  { q: "A learner composes a melody that leaps by a 3rd and feels comfortable to sing. Which quality of a good melody does this show?", correct: "It is singable, using leaps of a 3rd", distractors: ["It has symmetry", "It has an identifiable shape/contour", "It starts on doh and ends on soh"] },
  { q: "What is the first step in creating the one-fold seasonal card inspired by a composed melody?", correct: "Cutting a window on the front page of the card", distractors: ["Signing the card using calligraphy", "Embellishing the card with beads and buttons", "Performing the melody with Curwen hand signs"] },
  { q: "Which of these is a found object suggested for embellishing the seasonal melody card?", correct: "Buttons, beads, paper, or straws", distractors: ["Only expensive imported ribbon", "Only glitter glue purchased from abroad", "Nothing — the card should stay completely plain"] },
  { q: "What is the final step in completing the seasonal melody card?", correct: "Signing the card using calligraphy", distractors: ["Cutting the window on the front page", "Composing the 2-bar question and answer phrases", "Sight reading the melody on a recorder"] },
];

const CARD_STEPS: { id: string; label: string }[] = [
  { id: "window", label: "Cut a window on the front page of the card" },
  { id: "illustrate", label: "Create illustrations inside the window, inspired by the melody" },
  { id: "embellish", label: "Embellish the window with found objects and music notation signs" },
  { id: "sign", label: "Sign the card using calligraphy" },
];

const FILL_BLANKS: { before: string; after: string; answers: string[]; explanation: string }[] = [
  { before: "In tonic solfa, the syllable ", after: " stands for doh.", answers: ["d"], explanation: "'d' stands for doh in tonic solfa." },
  { before: "In tonic solfa, the syllable ", after: " stands for me.", answers: ["m"], explanation: "'m' stands for me in tonic solfa." },
  { before: "In tonic solfa, the syllable ", after: " stands for soh.", answers: ["s"], explanation: "'s' stands for soh in tonic solfa." },
  { before: "A well-composed Grade 7 melody should resolve back to the tonic solfa syllable ___.", after: "", answers: ["doh", "Doh"], explanation: "A good melody resolves back to doh." },
  { before: "Grade 7 melodies are composed in the key of ___.", after: "", answers: ["C major", "c major"], explanation: "Grade 7 composes melodies in C major." },
  { before: "A quality of a good melody is that it is comfortable to sing, using leaps of a ___.", after: "", answers: ["3rd", "third", "3"], explanation: "A good melody is singable, with leaps of a 3rd." },
  { before: "A quality of a good melody where its phrases balance each other is called ___.", after: "", answers: ["symmetry", "Symmetry"], explanation: "Symmetry is a quality of a good melody." },
  { before: "A quality of a good melody where its overall rise and fall in pitch is recognisable is its ___/contour.", after: "", answers: ["shape", "Shape"], explanation: "An identifiable shape/contour is a quality of a good melody." },
  { before: "One found object suggested for embellishing the seasonal melody card, alongside buttons, beads, and straws, is ___.", after: "", answers: ["paper", "Paper"], explanation: "Paper is a found object used to embellish the melody card." },
  { before: "The final step in completing the seasonal melody card is signing it using ___.", after: "", answers: ["calligraphy", "Calligraphy"], explanation: "Signing the card using calligraphy is the final step." },
];

const MATCH_PROMPTS = [
  "Match each item to its correct description.",
  "Pair each item below with its correct description.",
  "Match each item to what it describes.",
  "Connect each item to its correct description.",
  "For each item below, choose its matching description.",
] as const;

const ORDER_PROMPTS = [
  "Arrange these steps of designing the seasonal melody card in the order they happen.",
  "Put these melody card design steps in the order they occur.",
  "Order these card design steps, from first to last.",
  "Sort these steps into the correct sequence for designing the card.",
  "Place these melody card steps in the order you would follow them.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence about melody.",
  "Fill in the blank with the correct word.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into the correct melody-composing category.",
  "Which category does each item below belong to? Sort them.",
  "Classify each item into its correct melody-composing category.",
  "Decide which category each item fits, and sort it.",
  "Sort these items by the melody-composing category they belong to.",
] as const;

export const melody: Skill = {
  id: "g7-cas-melody",
  code: "C.3",
  subjectId: "creative-arts-sports",
  strandId: "g7-cas-creating-performing",
  grade: 7,
  title: "Composing Melody",
  description: "The qualities of a good four-bar melody in C major, tonic solfa, and designing a seasonal card inspired by a composed melody.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc", "order", "fill-blank", "match"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket !== "material")).slice(0, 5);
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
        hint: "Qualities describe what makes a melody sound good; card steps describe the craft process.",
        explanation: chosen.map((c) => c.reason).join(" "),
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, CARD_STEPS),
        correctOrder: CARD_STEPS.map((s) => s.id),
        hint: "Cut the window first, then fill it with illustrations, then decorate around it, then sign the finished card.",
        explanation: `The seasonal melody card is designed in this order: ${CARD_STEPS.map((s) => s.label).join(" → ")}.`,
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
        hint: "Think about tonic solfa, the qualities of a good melody, or the seasonal card design.",
        explanation: f.explanation,
      };
    }

    if (branch === "categorize") {
      const picks: typeof CATEGORIZE_ITEMS = [];
      for (const bucket of ["quality", "card", "material"]) {
        picks.push(...shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === bucket)).slice(0, 3));
      }
      const items = shuffle(rng, picks);
      const correctBucket: Record<string, string> = {};
      for (const c of items) correctBucket[c.label] = c.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((c) => ({ id: c.label, label: c.label })),
        buckets: (["quality", "card", "material"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Qualities describe what makes a melody sound good; card steps describe the craft process; materials are the objects used to decorate it.",
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
      hint: "Grade 7 composes melodies in C major using tonic solfa (doh, me, soh) — don't mix this up with other grades' key signatures.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
