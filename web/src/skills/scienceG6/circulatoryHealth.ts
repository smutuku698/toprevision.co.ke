import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 1.3 Human circulatory system — the health half (symptoms and
// prevention of common health conditions: hardening of arteries, high blood pressure and heart attack; plus
// developing a routine plan for a healthy circulatory system built around drinking plenty of water, physical
// activities and healthy eating, as the design's Suggested Learning Experiences name explicitly).

const HEALTH_CONDITIONS = [
  {
    id: "hardening-arteries",
    label: "Hardening of arteries",
    symptom: "Blood vessels become stiffer and narrower over time, making the heart work harder to pump blood",
    prevention: "Eating a balanced diet low in excess fatty foods and staying physically active",
  },
  {
    id: "high-blood-pressure",
    label: "High blood pressure",
    symptom: "Blood pushes against artery walls with unusually high force, which can strain the heart over time",
    prevention: "Reducing excess salt intake, exercising regularly, and managing stress",
  },
  {
    id: "heart-attack",
    label: "Heart attack",
    symptom: "Blood flow to part of the heart muscle is suddenly blocked, causing chest pain and danger to the heart tissue",
    prevention: "Maintaining a healthy diet, staying active, and getting regular medical checkups",
  },
] as const;

const HEALTHY_HABITS = [
  { text: "Drinking plenty of clean water throughout the day", good: true },
  { text: "Taking part in regular physical activities such as running, football or skipping", good: true },
  { text: "Eating a balanced diet with plenty of fruits and vegetables", good: true },
  { text: "Limiting foods that are very high in salt and fat", good: true },
  { text: "Getting enough sleep and rest each night", good: true },
  { text: "Walking or cycling instead of always being driven short distances", good: true },
  { text: "Visiting a health worker for regular checkups", good: true },
  { text: "Managing stress through rest, play and talking to someone trusted", good: true },
  { text: "Sitting still for most of the day with little movement", good: false },
  { text: "Eating fried, salty snacks every single day without any balance", good: false },
  { text: "Skipping water for most of the day and drinking very little", good: false },
  { text: "Staying up very late most nights, missing enough sleep", good: false },
] as const;

const ROUTINE_STEPS = [
  { id: "r1", label: "Start the day by drinking a glass of clean water" },
  { id: "r2", label: "Eat a balanced breakfast with fruits or vegetables" },
  { id: "r3", label: "Take part in physical activity, such as playing a sport or walking to school" },
  { id: "r4", label: "Drink water regularly throughout the day, not only when very thirsty" },
  { id: "r5", label: "Eat a balanced meal in the evening, avoiding too much salt or fat" },
  { id: "r6", label: "Get enough sleep so the body and heart can rest" },
] as const;

const KENYAN_PLACES = ["Kisumu", "Nyeri", "Mombasa", "Kericho", "Nakuru", "Machakos", "Eldoret", "Nairobi", "Kitale", "Meru", "Bungoma", "Malindi"] as const;
const KENYAN_NAMES = ["Grace", "Kevin", "Fatima", "Brian", "Millicent", "Josphat", "Rael", "Dennis", "Beatrice", "Samuel", "Ann", "Moses"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s grandfather in ${place(rng)} has been advised by a doctor to eat less salty food and to exercise regularly. Which circulatory health condition is this advice most likely helping to prevent?`,
      correct: "High blood pressure",
      wrong: ["A common cold", "A broken bone", "Tooth decay"],
      explanation: "Reducing salt intake and exercising regularly are well-known ways to help prevent high blood pressure, which strains the heart over time.",
    };
  },
  (rng) => ({
    prompt: `A health worker visiting a school in ${place(rng)} explains that eating too many fatty, oily foods over many years can make blood vessels stiffer and narrower. Which condition does this describe?`,
    correct: "Hardening of arteries",
    wrong: ["A heart attack happening immediately", "High blood pressure caused only by stress", "A normal, healthy change in blood vessels"],
    explanation: "A diet very high in fatty foods over a long time is linked to blood vessels becoming stiffer and narrower — hardening of the arteries — making the heart work harder.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} learns that ${who}'s uncle suddenly felt severe chest pain because blood flow to part of his heart muscle was blocked. What health condition does this describe?`,
      correct: "A heart attack",
      wrong: ["High blood pressure with no symptoms", "Hardening of arteries with no other effect", "A normal, harmless heartbeat change"],
      explanation: "A sudden blockage of blood flow to part of the heart muscle, causing chest pain, is what defines a heart attack — a serious emergency.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} is developing a personal routine plan for a healthy circulatory system, as guided in class. Which three habits should the plan definitely include, based on the curriculum's own guidance?`,
    correct: "Drinking plenty of water, taking part in physical activities, and eating healthily",
    wrong: ["Skipping meals often, sitting still most of the day, and drinking very little water", "Eating only sugary snacks, avoiding all exercise, and staying up very late", "Avoiding water, avoiding exercise, and eating only fried food"],
    explanation: "The curriculum specifically names drinking plenty of water, taking part in physical activities, and healthy eating as the core habits of a routine plan for a healthy circulatory system.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} notices that after a week of drinking very little water and sitting still most days, they feel more tired than usual. What is the likely connection to circulatory health?`,
      correct: "Both proper hydration and physical activity help the heart and blood vessels work well, so lacking both can leave a person feeling more tired",
      wrong: ["Water and physical activity have no effect on the circulatory system at all", "Only water matters for circulatory health, not physical activity", "Only physical activity matters for circulatory health, not water"],
      explanation: "Both drinking enough water and staying physically active support a healthy circulatory system — neglecting either can affect how energetic a person feels.",
    };
  },
  (rng) => ({
    prompt: `A community health talk in ${place(rng)} explains that regular checkups can catch high blood pressure early, even before a person notices any symptoms. Why does this matter?`,
    correct: "High blood pressure can develop without obvious symptoms, so regular checkups help catch and manage it before it seriously strains the heart",
    wrong: ["High blood pressure always causes obvious symptoms immediately, so checkups are not really needed", "Checkups can only detect a heart attack after it has already happened", "High blood pressure cannot be managed or improved once it develops"],
    explanation: "High blood pressure often develops quietly with few obvious symptoms, which is exactly why regular checkups are an important prevention habit.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is choosing between two after-school routines: one involves playing football with friends, the other involves sitting and watching videos for the same amount of time every single day. Which routine better supports a healthy circulatory system, and why?`,
    correct: "Playing football, because regular physical activity strengthens the heart and helps prevent conditions such as high blood pressure",
    wrong: ["Watching videos, because resting the body every day is always better for the heart", "Both are equally good for circulatory health regardless of activity level", "Neither routine has any effect on circulatory health at all"],
    explanation: "Regular physical activity is one of the core habits that supports a healthy circulatory system, while being inactive every day does not provide this benefit.",
  }),
];

export const circulatoryHealth: Skill = {
  id: "g6-sci-lte-circulatory-health",
  code: "LTE.3b",
  subjectId: "science",
  strandId: "g6-sci-lte",
  grade: 6,
  title: "A healthy circulatory system",
  description: "Symptoms and prevention of common circulatory-system health conditions (hardening of arteries, high blood pressure, heart attack), and developing a routine plan for a healthy circulatory system (water, physical activity, healthy eating).",
  generate(rng) {
    const branch = randChoice(rng, ["condition-match", "habit-sort", "routine-order", "reasoning", "fill-blank"] as const);

    if (branch === "condition-match") {
      const tokens = shuffle(rng, HEALTH_CONDITIONS.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, HEALTH_CONDITIONS.map((c) => ({ id: c.id, label: c.prevention })));
      const correctMap: Record<string, string> = {};
      for (const c of HEALTH_CONDITIONS) correctMap[c.id] = c.id;
      const CONDITION_MATCH_PROMPTS = [
        "Match each circulatory health condition to a way of helping prevent it.",
        "Which prevention method belongs to each condition below? Match them up.",
        "Pair each circulatory health condition with a way of preventing it.",
        "Match each condition to a habit that helps prevent it.",
        "Connect each circulatory health condition with its prevention.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, CONDITION_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about diet, salt intake, exercise and checkups.",
        explanation: HEALTH_CONDITIONS.map((c) => `${c.label} — prevented by ${c.prevention.toLowerCase()}.`).join(" "),
        visual: { type: "circulatory-system", view: "heart" },
      };
    }

    if (branch === "habit-sort") {
      const chosen = shuffle(rng, HEALTHY_HABITS).slice(0, 8);
      const items = chosen.map((h, i) => ({ id: `h${i}`, label: h.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((h, i) => (correctBucket[`h${i}`] = h.good ? "good" : "poor"));
      const HABIT_SORT_PROMPTS = [
        "Sort each habit as good or poor for a healthy circulatory system.",
        "Is each habit below good or poor for circulatory health? Sort them.",
        "Decide whether each habit helps or harms the circulatory system, then sort it.",
        "Group these habits into good and poor for a healthy circulatory system.",
        "For each habit, work out whether it's good or poor for the heart and blood vessels.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, HABIT_SORT_PROMPTS),
        items,
        buckets: [
          { id: "good", label: "Good habit" },
          { id: "poor", label: "Poor habit" },
        ],
        correctBucket,
        hint: "Think about water, activity, balanced eating, rest and stress.",
        explanation: chosen.map((h) => `"${h.text}" is a ${h.good ? "good" : "poor"} habit.`).join(" "),
      };
    }

    if (branch === "routine-order") {
      const shuffled = shuffle(rng, ROUTINE_STEPS);
      const ROUTINE_ORDER_PROMPTS = [
        "Arrange these into a sensible daily routine for a healthy circulatory system, from morning to night.",
        "Put these steps into a sensible daily routine, from morning to night.",
        "Order these habits into a healthy daily routine, from morning to night.",
        "Place these into the order you'd follow them across a healthy day.",
        "Sort these into a sensible daily circulatory-health routine, morning to night.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, ROUTINE_ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: ROUTINE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from morning to night.",
        hint: "Start the day with water and breakfast, and end with rest.",
        explanation: "A sensible order: " + ROUTINE_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "A condition where blood vessels become stiffer and narrower over time is called ", after: ".", correctAnswer: "hardening of arteries" },
      { before: "A condition where blood pushes against artery walls with unusually high force is ", after: ".", correctAnswer: "high blood pressure" },
      { before: "A sudden blockage of blood flow to part of the heart muscle is called a ", after: ".", correctAnswer: "heart attack" },
      { before: "A routine plan for a healthy circulatory system should include drinking plenty of ", after: ".", correctAnswer: "water" },
      { before: "Taking part in regular physical ", after: " helps keep the heart and blood vessels healthy.", correctAnswer: "activities" },
      { before: "Eating a balanced diet with fruits and vegetables is part of healthy ", after: ".", correctAnswer: "eating" },
      { before: "Reducing excess salt intake can help prevent ", after: ".", correctAnswer: "high blood pressure" },
      { before: "Regular medical ", after: " can help catch circulatory health problems early.", correctAnswer: "checkups" },
      { before: "Getting enough sleep each night gives the heart time to ", after: ".", correctAnswer: "rest" },
      { before: "Sitting still for most of the day with little movement is a ", after: " habit for circulatory health.", correctAnswer: "poor" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer],
      inputMode: "text",
      hint: "Think about health conditions and habits for a healthy circulatory system.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
