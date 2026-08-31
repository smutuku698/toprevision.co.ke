import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const RACES: { label: string; meters: number; bucket: "sprint" | "middle" | "long" }[] = [
  { label: "100 metres", meters: 100, bucket: "sprint" },
  { label: "200 metres", meters: 200, bucket: "sprint" },
  { label: "400 metres", meters: 400, bucket: "sprint" },
  { label: "800 metres", meters: 800, bucket: "middle" },
  { label: "1500 metres", meters: 1500, bucket: "middle" },
  { label: "5000 metres", meters: 5000, bucket: "long" },
  { label: "10,000 metres", meters: 10000, bucket: "long" },
  { label: "Marathon (about 42,000 metres)", meters: 42000, bucket: "long" },
];

const BUCKET_LABEL: Record<string, string> = { sprint: "Sprint (short distance)", middle: "Middle distance", long: "Long distance" };

const MONTAGE_TERMS = [
  { id: "subject", label: "Subject", meaning: "The main person, action, or idea a montage composition is built around" },
  { id: "posture", label: "Posture", meaning: "The body position of figures shown in the montage, chosen to suggest movement or effort" },
  { id: "centre-of-interest", label: "Centre of interest", meaning: "The point in the composition where the viewer's eye is drawn first" },
  { id: "finishing", label: "Finishing", meaning: "How the edges and overall surface of the montage are trimmed, mounted, and completed" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "What is the key difference between a montage and a photomontage?", correct: "A montage can combine cut images, paint, and other materials, while a photomontage is built specifically from combined photographs", distractors: ["There is no difference between them", "A montage only uses paint, never cut images", "A photomontage cannot include any photographs"] },
  { q: "Why is pacing important in a middle-distance race like the 800m or 1500m?", correct: "Runners must balance speed and energy across the whole distance, unlike a short sprint run at full effort throughout", distractors: ["Pacing only matters in sprints, not middle-distance races", "Runners should sprint at maximum effort for the entire race", "Pacing has no effect on middle-distance race performance"] },
  { q: "What does the 'centre of interest' in a montage composition refer to?", correct: "The point where the viewer's eye is drawn first", distractors: ["The exact centre of the paper by measurement", "The most expensive material used", "The last piece added to the montage"] },
  { q: "How does 'posture' contribute to a montage composition inspired by athletes running?", correct: "It suggests movement, effort, and energy through the position of the figures", distractors: ["It has no visual effect on the composition", "It only affects the colour of the montage", "It determines the size of the paper used"] },
  { q: "What are the 800m and 1500m races classified as in athletics?", correct: "Middle-distance races", distractors: ["Sprints", "Long-distance races", "Relay races"] },
  { q: "Why is 'finishing' an important step when creating a montage?", correct: "Neatly trimming and mounting the piece gives the composition a complete, professional appearance", distractors: ["It has no effect on how the montage looks", "It is only necessary for photomontages, never montages", "It should always be skipped to save time"] },
];

const RACE_CATEGORIZE_PROMPTS = [
  "Sort each race into Sprint, Middle distance, or Long distance.",
  "Which category does each race below belong to? Sort them.",
  "Classify each race as Sprint, Middle distance, or Long distance.",
  "Decide which distance category each race fits, and sort it.",
  "Sort these races by their distance category.",
] as const;

const MONTAGE_MATCH_PROMPTS = [
  "Match each montage composition term to its correct meaning.",
  "Pair each montage term below with its correct meaning.",
  "Match each term to what it describes.",
  "Connect each montage term to its correct meaning.",
  "For each term below, choose its matching meaning.",
] as const;

const RACE_ORDER_PROMPTS = [
  "Arrange these track and field races from shortest to longest distance.",
  "Put these races in order, from shortest to longest.",
  "Order these races, shortest distance first.",
  "Sort these races from the shortest distance to the longest.",
  "Place these races in order of increasing distance.",
] as const;

const RACE_LINE_PROMPTS = [
  "Click the point on the number line showing the distance of the {race} race.",
  "Show on the number line how far the {race} race covers.",
  "Where on the number line does the {race} race's distance fall? Click it.",
  "Click the number line to mark the distance of the {race} race.",
  "Mark the {race} race's distance on the number line.",
] as const;

export const middleDistanceAndMontage: Skill = {
  id: "g8-cas-middle-distance-montage",
  code: "C.3",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Middle Distance Races and Montage",
  description: "Classifying race distances, pacing in middle-distance running, and the characteristics of a montage composition.",
  generate(rng) {
    const branch = randChoice(rng, ["race-classify", "montage-match", "race-order", "race-line", "theory-mc"] as const);

    if (branch === "race-classify") {
      const sprintPicks = shuffle(rng, RACES.filter((r) => r.bucket === "sprint")).slice(0, 2);
      const middlePicks = RACES.filter((r) => r.bucket === "middle");
      const longPicks = shuffle(rng, RACES.filter((r) => r.bucket === "long")).slice(0, 2);
      const items = shuffle(rng, [...sprintPicks, ...middlePicks, ...longPicks]);
      const correctBucket: Record<string, string> = {};
      for (const r of items) correctBucket[r.label] = r.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, RACE_CATEGORIZE_PROMPTS),
        items: items.map((r) => ({ id: r.label, label: r.label })),
        buckets: [
          { id: "sprint", label: BUCKET_LABEL.sprint },
          { id: "middle", label: BUCKET_LABEL.middle },
          { id: "long", label: BUCKET_LABEL.long },
        ],
        correctBucket,
        hint: "800m and 1500m are the classic middle-distance races — shorter races are sprints, much longer races are long distance.",
        explanation: items.map((r) => `${r.label} is a ${BUCKET_LABEL[r.bucket].toLowerCase()} race.`).join(" "),
      };
    }

    if (branch === "montage-match") {
      const chosen = shuffle(rng, MONTAGE_TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MONTAGE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Subject is the 'what'; posture and centre of interest guide the eye; finishing completes the piece.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "race-order") {
      const chosen = shuffle(rng, RACES).slice(0, 5).sort((a, b) => a.meters - b.meters);
      const items = chosen.map((r) => ({ id: r.label, label: r.label }));
      return {
        kind: "ordering",
        prompt: randChoice(rng, RACE_ORDER_PROMPTS),
        instruction: "Click the races in order, shortest first.",
        items: shuffle(rng, items),
        correctOrder: chosen.map((r) => r.label),
        hint: "Sprints are shortest, middle-distance races are in between, and long-distance races (including the marathon) are longest.",
        explanation: `Shortest to longest: ${chosen.map((r) => r.label).join(" → ")}.`,
      };
    }

    if (branch === "race-line") {
      const race = randChoice(rng, [RACES[3], RACES[4]]);
      const max = race.meters === 800 ? 2000 : 3000;
      return {
        kind: "number-line",
        prompt: randChoice(rng, RACE_LINE_PROMPTS).replace("{race}", race.label),
        hint: "Read the metres marked on the line and find the matching point.",
        min: 0,
        max,
        step: 100,
        correctValue: race.meters,
        mode: "point",
        explanation: `The ${race.label} race covers exactly ${race.meters} metres, a classic middle-distance event.`,
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
      hint: "Middle-distance races need paced effort; montages are judged by subject, posture, centre of interest, and finishing.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
