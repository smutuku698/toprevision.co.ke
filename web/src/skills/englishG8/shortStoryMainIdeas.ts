import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "After the accident on the construction site, Baraka spent three months in hospital learning to walk again with a metal brace on his leg. His old job on the site was gone, and he felt useless lying in bed, watching his savings disappear. A physiotherapist named Consolata visited daily, pushing him gently through exercises he hated at first. \"Small steps count,\" she told him whenever he wanted to quit. Slowly, Baraka's leg grew stronger, and with it, an old hobby returned to his mind — he had always been good with his hands, fixing radios for neighbours as a boy. He began repairing broken electronics from his hospital bed, then from a small stall once he was discharged. Within a year, his repair stall was known across the estate, busier than his old construction job had ever been. Baraka often told new patients at the clinic that his accident had cost him a leg's full strength, but had shown him a better path he might never have found otherwise.";

const MAIN_IDEA_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What is the main idea of this story?",
    correct: "Recovering from a setback can lead to unexpected new opportunities if a person keeps trying",
    distractors: ["Construction work is more dangerous than any other job", "Physiotherapy is not helpful for recovering patients", "Baraka regretted starting his repair stall"],
    explanation: "The story follows Baraka's rehabilitation and how it led him to a new, more successful path — repairing electronics — showing that setbacks can open unexpected doors when a person perseveres.",
  },
];

const EVENTS = [
  { id: "accident", label: "Baraka is injured in an accident on the construction site" },
  { id: "hospital", label: "He spends three months in hospital learning to walk again" },
  { id: "consolata", label: "Consolata visits daily, encouraging him through his exercises" },
  { id: "hobby", label: "Baraka remembers his old hobby of fixing radios" },
  { id: "repair", label: "He begins repairing electronics from his hospital bed" },
  { id: "stall", label: "His repair stall becomes busier than his old construction job" },
];

const FILL_ITEMS = [
  { before: "A physiotherapist named Consolata visited daily, pushing him gently through exercises he", after: "at first.", correctAnswer: "hated" },
  { before: "\"Small steps", after: ",\" she told him whenever he wanted to quit.", correctAnswer: "count" },
  { before: "Within a year, his repair stall was known across the estate, busier than his old construction job had ever", after: ".", correctAnswer: "been" },
];

const REAL_LIFE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which real-life situation best reflects the message of this story?",
    correct: "A student who fails an exam studies differently and discovers a subject they truly enjoy",
    distractors: ["A student cheats on an exam to avoid failing", "A worker ignores an injury and returns to unsafe conditions immediately", "A patient refuses all forms of therapy and gives up on recovery"],
    explanation: "Like Baraka, who turned a setback (the accident) into a new opportunity through persistence, the student turns failure into growth by trying a new approach and discovering a strength.",
  },
  {
    q: "What does Consolata's saying, \"Small steps count,\" suggest about recovery from a setback?",
    correct: "Progress after a setback often happens gradually, and small efforts add up over time",
    distractors: ["Recovery always happens instantly with no effort", "Small steps are not important in recovery", "Only large, dramatic changes count as progress"],
    explanation: "Consolata's encouragement, repeated whenever Baraka wanted to quit, suggests that consistent small efforts — not one big leap — are what lead to real recovery, an idea the story never states outright but shows through her role.",
  },
];

export const shortStoryMainIdeas: Skill = {
  id: "g8-eng-r-short-story-main-ideas",
  code: "R.12",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Short Story - Main Ideas (Class Reader)",
  description: "Identify the main idea of a short story, summarise its key events, and relate the story to real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "mainidea", "reallife", "categorize", "fill"] as const);
    const hint = "Think about what the story is really about as a whole, not just one single detail.";

    if (branch === "order") {
      const items = shuffle(rng, EVENTS);
      return {
        kind: "ordering",
        prompt: "Arrange the key events of the story in order, to build a summary.",
        instruction: "Click them in order.",
        passage: STORY,
        items,
        correctOrder: EVENTS.map((e) => e.id),
        hint: "The story moves from the accident, through hospital recovery, to Baraka discovering and growing his new skill.",
        explanation: EVENTS.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "mainidea") {
      const entry = randChoice(rng, MAIN_IDEA_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, EVENTS).slice(0, 4);
      const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.label }));
      const midpointIndex = EVENTS.findIndex((e) => e.id === "hobby");
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => {
        const originalIndex = EVENTS.findIndex((orig) => orig.id === e.id);
        correctBucket[`e${i}`] = originalIndex < midpointIndex ? "before" : "after";
      });
      return {
        kind: "categorize",
        prompt: "Sort each event as happening Before or After Baraka rediscovered his old hobby of fixing radios.",
        passage: STORY,
        items,
        buckets: [
          { id: "before", label: "Before rediscovering the hobby" },
          { id: "after", label: "After rediscovering the hobby" },
        ],
        correctBucket,
        hint: "The turning point is when Baraka remembers he was always good with his hands, fixing radios as a boy.",
        explanation: chosen
          .map((e) => {
            const originalIndex = EVENTS.findIndex((orig) => orig.id === e.id);
            return `"${e.label}" happened ${originalIndex < midpointIndex ? "before" : "after"} Baraka rediscovered his hobby.`;
          })
          .join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word from the story.",
        passage: STORY,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look for the exact word in the passage above.",
        explanation: `The passage reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    const entry = randChoice(rng, REAL_LIFE_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      passage: STORY,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: entry.explanation,
    };
  },
};
