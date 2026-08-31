import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FOCUS_ITEMS = [
  { label: "Diction, delivery, and expression", bucket: "verse" },
  { label: "How well the imagery and sound devices are performed", bucket: "verse" },
  { label: "Fairness, respect for opponents, and self-control", bucket: "sport" },
  { label: "Following the rules while still competing to win", bucket: "sport" },
  { label: "Authenticity of movement to the dance's community of origin", bucket: "dance" },
  { label: "Costume, rhythm, and energy of the performance", bucket: "dance" },
  { label: "Composition, colour use, and technique", bucket: "art" },
  { label: "Dominance, unity, and use of the medium", bucket: "art" },
];

const BUCKET_LABEL: Record<string, string> = { verse: "Analysing a verse performance", sport: "Examining sportsmanship", dance: "Analysing a folk dance", art: "Showcasing artwork" };

const DOMAIN_TERMS = [
  { id: "verse", label: "Analysing a verse performance", meaning: "Examining the diction, delivery, and expression used to bring a verse to life" },
  { id: "sportsmanship", label: "Examining sportsmanship", meaning: "Assessing fairness, respect for opponents, and self-control during a sporting activity" },
  { id: "dance", label: "Analysing a folk dance", meaning: "Judging authenticity to the community of origin, movement, costume, and energy" },
  { id: "art", label: "Showcasing artwork", meaning: "Presenting and discussing a piece's composition, colour use, and technique for others to appreciate" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "Why is analysis considered an important skill in Creative Arts and Sports?", correct: "It helps performers, artists, and athletes understand strengths, weaknesses, and how to improve", distractors: ["It replaces the need for any creative or physical skill", "It is only useful for judges, never for learners", "It has no value once a performance or artwork is finished"] },
  { q: "What does examining the spirit of sportsmanship in sporting activities involve?", correct: "Assessing fairness, respect for opponents, and self-control during competition", distractors: ["Only counting the final score of the match", "Ignoring how players treat each other", "Only judging which team has the best uniform"] },
  { q: "What would you look at when analysing a folk dance performance?", correct: "How authentic the movement, costume, and energy are to the dance's community of origin", distractors: ["Only how loud the music was", "Only how many dancers took part", "Only the length of the performance in minutes"] },
  { q: "What does 'showcasing artwork for appreciation' mean?", correct: "Presenting a finished piece so others can view and discuss its composition, colour, and technique", distractors: ["Hiding the artwork from view until it is sold", "Destroying the artwork once it is finished", "Only showing artwork to the artist who made it"] },
  { q: "How does analysis add value to Creative Arts and Sports, beyond the performance itself?", correct: "It builds understanding, encourages improvement, and helps others appreciate the effort and skill involved", distractors: ["It has no effect beyond the moment of performance", "It only matters for professional competitions", "It removes all enjoyment from the activity"] },
];

const CATEGORIZE_PROMPTS = [
  "Sort each analysis focus into the area of Creative Arts and Sports it belongs to.",
  "Which area does each analysis focus below belong to? Sort them.",
  "Classify each analysis focus into its correct area.",
  "Decide which area each analysis focus fits, and sort it.",
  "Sort these analysis focuses by the area they belong to.",
] as const;

const MATCH_PROMPTS = [
  "Match each type of analysis in Creative Arts and Sports to what it involves.",
  "Pair each type of analysis below with what it involves.",
  "Match each type of analysis to its correct description.",
  "Connect each type of analysis to what it involves.",
  "For each type of analysis below, choose its matching description.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about analysis in sport.",
  "Fill in the missing word about analysis in sport.",
  "Complete this sentence about sportsmanship analysis.",
  "Fill in the blank about analysis in sport.",
  "Complete the sentence with the correct word.",
] as const;

export const analysis: Skill = {
  id: "g8-cas-analysis",
  code: "A.1",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-appreciation",
  grade: 8,
  title: "Analysis of Creative Arts and Sports",
  description: "Analysing verse performances, examining sportsmanship, analysing folk dance, and showcasing artwork for appreciation.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "terms-match", "fill-blank", "theory-mc"] as const);

    if (branch === "categorize") {
      const versePicks = shuffle(rng, FOCUS_ITEMS.filter((f) => f.bucket === "verse")).slice(0, 1);
      const sportPicks = shuffle(rng, FOCUS_ITEMS.filter((f) => f.bucket === "sport")).slice(0, 1);
      const dancePicks = shuffle(rng, FOCUS_ITEMS.filter((f) => f.bucket === "dance")).slice(0, 1);
      const artPicks = shuffle(rng, FOCUS_ITEMS.filter((f) => f.bucket === "art")).slice(0, 1);
      const items = shuffle(rng, [...versePicks, ...sportPicks, ...dancePicks, ...artPicks]);
      const correctBucket: Record<string, string> = {};
      for (const f of items) correctBucket[f.label] = f.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((f) => ({ id: f.label, label: f.label })),
        buckets: [
          { id: "verse", label: "Verse" },
          { id: "sport", label: "Sport" },
          { id: "dance", label: "Dance" },
          { id: "art", label: "Art" },
        ],
        correctBucket,
        hint: "Verse analysis looks at delivery; sport analysis looks at fairness; dance analysis looks at authenticity; art analysis looks at composition.",
        explanation: items.map((f) => `"${f.label}" belongs to analysing ${f.bucket === "sport" ? "sportsmanship" : f.bucket}.`).join(" "),
      };
    }

    if (branch === "terms-match") {
      const chosen = shuffle(rng, DOMAIN_TERMS);
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
        hint: "Each type of analysis focuses on a different area — verse, sport, dance, or art.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: "Examining the spirit of",
        after: "in sporting activities means assessing fairness, respect for opponents, and self-control.",
        correctAnswer: "sportsmanship",
        inputMode: "text",
        hint: "This word describes fair, respectful behaviour during competition.",
        explanation: `${BUCKET_LABEL.sport} means assessing fairness, respect for opponents, and self-control during a sporting activity.`,
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
      hint: "Analysis in Creative Arts and Sports looks closely at verse, sport, dance, and art to explain why something works or is significant.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
