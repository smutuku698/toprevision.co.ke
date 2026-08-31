import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Coach Sammy had trained young runners on the dusty school field for fifteen years without ever producing an Olympic qualifier, and some in the village had begun to whisper that he had lost his touch. His newest student, a quiet fourteen-year-old named Rael, showed promise but lacked confidence, often finishing races strong only to slow down whenever a rival pulled ahead. Coach Sammy noticed this pattern and began training her differently, running alongside her during practice and shouting nothing but her own name whenever a competitor overtook her, until she learned to trust her own pace instead of reacting to others. Months before the national trials, Rael twisted her ankle during a rainy practice session, and doctors warned she might not recover fully in time. She trained through pain in a swimming pool instead, keeping her fitness while her ankle healed slowly. On trial day, Rael ran her own race exactly as Coach Sammy had taught her, ignoring the runners around her, and crossed the line first by a narrow but decisive margin, earning a place on the national development squad. The whole village turned out to celebrate, and Coach Sammy, for the first time in fifteen years, allowed himself to believe his methods had truly worked.";

const IDEA_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What is a key idea in this story?",
    correct: "Consistent, patient coaching and self-belief can turn a promising athlete into a winner, even after setbacks",
    distractors: ["Only naturally talented athletes can ever succeed in sports", "Coaches should give up quickly if results do not come immediately", "Injuries always end an athlete's chances permanently"],
    explanation: "The story follows Coach Sammy's fifteen years of patient effort and Rael's growth in confidence and recovery from injury, all leading to her eventual success — showing patience and self-belief as central ideas.",
  },
  {
    q: "What idea does Rael's habit of slowing down when a rival pulled ahead reveal about her, before Coach Sammy's new training?",
    correct: "She lacked confidence in her own pace and let other runners affect her performance",
    distractors: ["She was simply too slow to compete at a high level", "She disliked running and wanted to quit the sport", "She was already the best runner in the region"],
    explanation: "The passage states she was 'finishing races strong only to slow down whenever a rival pulled ahead,' a pattern rooted in reacting to others rather than trusting her own pace — an inference about confidence, not a stated fact.",
  },
];

const REAL_LIFE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which real-life experience does this story's idea of overcoming setbacks best relate to?",
    correct: "A student recovering from a long illness keeps studying in smaller ways and still passes their exams",
    distractors: ["A student who never studies expects to pass an exam anyway", "A student refuses to attend school after a minor disagreement with a friend", "A student who never faces any obstacle at all"],
    explanation: "Like Rael, who kept training in a swimming pool despite her ankle injury rather than giving up, the student adapts their effort around a setback instead of abandoning their goal.",
  },
  {
    q: "How does Coach Sammy's fifteen years of effort before Rael's success relate to real life?",
    correct: "It reflects how meaningful achievements often take years of patient, unseen effort before results appear",
    distractors: ["It shows that effort without immediate results is always wasted", "It proves coaching does not matter for an athlete's success", "It suggests fifteen years is always required for any success"],
    explanation: "Coach Sammy's long, quiet dedication before his first real success reflects a common real-life pattern: significant achievements are often built on years of effort that are not immediately visible.",
  },
];

const SOCIAL_ISSUE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What social issue does this story touch on through Coach Sammy's years without a qualifier?",
    correct: "The pressure on coaches and athletes to produce quick results, and the doubt faced when success takes time",
    distractors: ["The high cost of Olympic-standard running shoes", "The lack of running tracks in rural areas", "The rules for qualifying for international competitions"],
    explanation: "The whispers in the village about Coach Sammy having 'lost his touch' reflect a real pressure many coaches and athletes face — being judged before their patient efforts have had time to succeed.",
  },
  {
    q: "What does the story suggest about community support, based on the village's reaction at the end?",
    correct: "A community celebrating a shared achievement can boost the confidence of everyone involved, not just the athlete",
    distractors: ["The village was indifferent to Rael's success", "Only Rael's family cared about her achievement", "The village had never supported Coach Sammy at all"],
    explanation: "The passage says 'the whole village turned out to celebrate,' and even Coach Sammy 'allowed himself to believe his methods had truly worked' — showing how communal celebration reinforces both the athlete's and the coach's confidence, an idea the text implies through their reactions rather than stating directly.",
  },
];

const FILL_ITEMS = [
  { before: "His newest student, a quiet fourteen-year-old named Rael, showed promise but lacked", after: ", often finishing races strong only to slow down whenever a rival pulled ahead.", correctAnswer: "confidence" },
  { before: "She trained through pain in a swimming pool instead, keeping her fitness while her ankle healed", after: ".", correctAnswer: "slowly" },
  { before: "On trial day, Rael ran her own race exactly as Coach Sammy had taught her, ignoring the runners around her, and crossed the line first by a narrow but decisive", after: ".", correctAnswer: "margin" },
];

const EVENTS = [
  { id: "start", label: "Coach Sammy trains young runners for fifteen years without an Olympic qualifier" },
  { id: "rael", label: "Rael shows promise but slows down whenever a rival overtakes her" },
  { id: "retrain", label: "Coach Sammy trains her to trust her own pace instead of reacting to rivals" },
  { id: "injury", label: "Rael twists her ankle during a rainy practice session" },
  { id: "pool", label: "She trains through pain in a swimming pool to keep her fitness" },
  { id: "trial", label: "On trial day, Rael runs her own race and wins by a narrow margin" },
  { id: "celebrate", label: "The whole village celebrates, and Coach Sammy finally believes his methods worked" },
];

export const extensiveShortStoryOlympics: Skill = {
  id: "g8-eng-r-extensive-short-story-olympics",
  code: "R.28",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Extensive Reading: Short Story (Class Reader)",
  description: "Identify key ideas in a short story, relate them to real-life experiences, and appreciate how stories reflect social issues.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "idea", "reallife", "issue", "categorize", "fill"] as const);
    const hint = "Think about what the story is really saying about effort, confidence, and support — beyond just what happens in the plot.";

    if (branch === "order") {
      const items = shuffle(rng, EVENTS);
      return {
        kind: "ordering",
        prompt: "Arrange the events of the story in the order they happened.",
        instruction: "Click them in order.",
        passage: STORY,
        items,
        correctOrder: EVENTS.map((e) => e.id),
        hint: "The story moves from Coach Sammy's years of training, through Rael's setback, to her eventual win at the trials.",
        explanation: EVENTS.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "idea") {
      const entry = randChoice(rng, IDEA_QUESTIONS);
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

    if (branch === "reallife") {
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
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, EVENTS).slice(0, 4);
      const injuryIndex = EVENTS.findIndex((e) => e.id === "injury");
      const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => {
        const originalIndex = EVENTS.findIndex((orig) => orig.id === e.id);
        correctBucket[`e${i}`] = originalIndex < injuryIndex ? "before" : "after";
      });
      return {
        kind: "categorize",
        prompt: "Sort each event as happening Before or After Rael's ankle injury.",
        passage: STORY,
        items,
        buckets: [
          { id: "before", label: "Before the injury" },
          { id: "after", label: "After the injury" },
        ],
        correctBucket,
        hint: "The turning point of the story is when Rael twists her ankle during a rainy practice session.",
        explanation: chosen
          .map((e) => {
            const originalIndex = EVENTS.findIndex((orig) => orig.id === e.id);
            return `"${e.label}" happened ${originalIndex < injuryIndex ? "before" : "after"} the injury.`;
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

    const entry = randChoice(rng, SOCIAL_ISSUE_QUESTIONS);
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
