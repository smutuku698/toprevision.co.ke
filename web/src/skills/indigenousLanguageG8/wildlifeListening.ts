import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CONVERSATIONAL_ERRORS: { error: string; description: string }[] = [
  { error: "Interrupting rudely", description: "Cutting off the speaker without waiting for a pause" },
  { error: "Dominating the conversation", description: "Talking the whole time without letting others contribute" },
  { error: "Not listening actively", description: "Thinking about what to say next instead of hearing the speaker" },
  { error: "Going off topic", description: "Introducing unrelated ideas that confuse the discussion" },
  { error: "Mumbling", description: "Speaking so unclearly that listeners cannot follow what is said" },
];

const INTERRUPTION_ITEMS: { text: string; bucket: string }[] = [
  { text: "\"Excuse me, may I add something here?\"", bucket: "Polite way to interrupt" },
  { text: "\"Sorry to interrupt, but I have an important point.\"", bucket: "Polite way to interrupt" },
  { text: "Raising a hand and waiting to be acknowledged", bucket: "Polite way to interrupt" },
  { text: "Shouting \"Just stop talking, it's my turn!\"", bucket: "Impolite way to interrupt" },
  { text: "Talking loudly over the speaker without pausing", bucket: "Impolite way to interrupt" },
  { text: "Cutting off the speaker mid-sentence without any warning", bucket: "Impolite way to interrupt" },
];

const WILDLIFE_STEPS: { id: string; label: string }[] = [
  { id: "learn", label: "Learn about the movement patterns of wild animals in your area" },
  { id: "distance", label: "Keep a safe distance from wild animals at all times" },
  { id: "secure", label: "Secure livestock and crops carefully, especially at night" },
  { id: "avoid", label: "Avoid known wildlife paths, especially at dusk and dawn" },
  { id: "report", label: "Report any dangerous animal sighting to KWS rangers immediately" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  {
    before: "Cutting off a speaker before they finish talking is called",
    after: "the speaker, which is a common conversational error.",
    answer: "interrupting",
  },
  {
    before: "Keeping a safe",
    after: "from wild animals such as elephants and buffaloes helps prevent dangerous encounters.",
    answer: "distance",
  },
  {
    before: "Farmers in areas near wildlife reserves often secure their",
    after: "in strong bomas at night to protect them from predators.",
    answer: "livestock",
  },
  {
    before: "If you see a dangerous wild animal near your homestead, you should report it to the",
    after: "immediately.",
    answer: "KWS",
    accepted: ["Kenya Wildlife Service", "kws rangers"],
  },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it important to interrupt a speaker politely rather than rudely?",
    correct: "Because it shows respect for the speaker and keeps the conversation friendly",
    distractors: [
      "Because it lets you take over the whole conversation",
      "Because it embarrasses the speaker",
      "Because it ends the conversation immediately",
    ],
  },
  {
    q: "Which of the following is a common conversational error?",
    correct: "Dominating the conversation so others cannot contribute",
    distractors: [
      "Waiting for a pause before speaking",
      "Asking a clarifying question politely",
      "Making eye contact with the speaker",
    ],
  },
  {
    q: "What is one way to avoid conflict with wild animals near a homestead?",
    correct: "Keep livestock secured in a boma, especially at night",
    distractors: [
      "Walk through wildlife paths alone at night",
      "Leave livestock unattended in open fields overnight",
      "Approach wild animals to take a closer look",
    ],
  },
  {
    q: "Why is it important to develop good conversational skills?",
    correct: "They help us communicate clearly and respectfully in daily life",
    distractors: [
      "They allow us to avoid listening to others entirely",
      "They are only useful during formal debates",
      "They make interrupting others acceptable",
    ],
  },
  {
    q: "What should you do if you notice a dangerous wild animal near a wildlife corridor close to your village?",
    correct: "Keep a safe distance and report the sighting to KWS rangers",
    distractors: [
      "Approach the animal to chase it away yourself",
      "Ignore it and continue with your activities as usual",
      "Post about it on social media instead of reporting it",
    ],
  },
];

export const wildlifeListening: Skill = {
  id: "g8-il-ls-wildlife",
  code: "LS.3",
  subjectId: "indigenous-language",
  strandId: "g8-il-listening-speaking",
  grade: 8,
  title: "Wildlife: attentive listening",
  description: "Identify common conversational errors, respond to comprehension questions, and learn how to avoid conflict with wild animals.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Attentive listening avoids conversational errors like interrupting rudely, and careful habits help communities avoid conflict with wildlife.";

    if (branch === "match") {
      const chosen = shuffle(rng, CONVERSATIONAL_ERRORS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.error, label: c.error })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.error, label: c.description })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.error] = c.error;
      return {
        kind: "click-match",
        prompt: "Match each conversational error to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((c) => `${c.error} — ${c.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, INTERRUPTION_ITEMS);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `w${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`w${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each example into the correct group.",
        items,
        buckets,
        correctBucket,
        hint: "A polite interruption asks permission or waits for a pause; an impolite one talks over or cuts off the speaker.",
        explanation: chosen.map((c) => `${c.text} — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, WILDLIFE_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for avoiding conflict with wild animals in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: WILDLIFE_STEPS.map((s) => s.id),
        hint: "Start by learning animal patterns, then keep your distance, secure livestock, avoid risky paths, and report danger.",
        explanation: WILDLIFE_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        acceptedAnswers: entry.accepted,
        inputMode: "text",
        hint,
        explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim(),
      };
    }

    const entry = randChoice(rng, MC_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
