import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type TechCategory = "voice" | "body" | "timing";

const TECHNIQUES: { name: string; category: TechCategory; effect: string }[] = [
  { name: "Voice projection", category: "voice", effect: "Helps the audience at the back of the room hear the narrator clearly" },
  { name: "Varying tone", category: "voice", effect: "Signals a change in mood, such as fear, excitement, or calm" },
  { name: "Pacing", category: "voice", effect: "Controls how fast or slow the story is told, building tension or giving the audience time to absorb an idea" },
  { name: "Eye contact", category: "body", effect: "Connects the narrator with the audience and shows confidence" },
  { name: "Gestures", category: "body", effect: "Uses hand and body movements to bring characters and actions to life" },
  { name: "Facial expressions", category: "body", effect: "Shows the emotions of characters without needing extra words" },
  { name: "Pauses for suspense", category: "timing", effect: "Creates a moment of tension right before a key or surprising event in the story" },
];

const CATEGORY_LABEL: Record<TechCategory, string> = {
  voice: "Voice technique",
  body: "Body language technique",
  timing: "Timing technique",
};

const ORDER_STEPS = [
  { id: "choose", label: "Choose a narrative you know well and think about its key moments" },
  { id: "plan", label: "Plan how voice, gestures, and pauses will be used at each part of the story" },
  { id: "rehearse", label: "Rehearse aloud, timing the pauses and practising the voices" },
  { id: "perform", label: "Perform for the audience, watching their reactions" },
  { id: "reflect", label: "Reflect on the performance and note what could be improved next time" },
];

const SCENARIOS: { desc: string; verdict: "strong" | "weak" }[] = [
  { desc: "Kevin spoke in a flat voice the whole time, at the same speed and volume, whether the character was scared or overjoyed.", verdict: "weak" },
  { desc: "Amina lowered her voice to a whisper and paused just before revealing that the hyena had crept into the village at night.", verdict: "strong" },
  { desc: "Brian stared at his notes the entire time and never looked up at his classmates.", verdict: "weak" },
  { desc: "Faith used her hands to show the size of the elephant and changed her voice for each character.", verdict: "strong" },
  { desc: "Otieno rushed through the exciting climax of the story without slowing down or pausing.", verdict: "weak" },
  { desc: "Njeri projected her voice clearly so pupils at the back of the hall could hear every word.", verdict: "strong" },
];

const FIX_ITEMS: { desc: string; fix: string; distractors: string[] }[] = [
  { desc: "Kevin spoke in a flat voice the whole time, whether the character was scared or overjoyed.", fix: "Varying tone", distractors: ["Eye contact", "Gestures", "Pauses for suspense"] },
  { desc: "Brian stared at his notes the entire time and never looked up at his classmates.", fix: "Eye contact", distractors: ["Voice projection", "Pacing", "Gestures"] },
  { desc: "Otieno rushed through the exciting climax of the story without slowing down or pausing.", fix: "Pauses for suspense", distractors: ["Eye contact", "Gestures", "Voice projection"] },
  { desc: "Faith mumbled so quietly that pupils sitting near the back could not hear the ending of her story.", fix: "Voice projection", distractors: ["Facial expressions", "Pacing", "Pauses for suspense"] },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "Speaking loudly and clearly enough for the whole room to hear is called voice ", after: ".", correctAnswer: "projection" },
  { before: "Slowing down or speeding up how quickly you tell the story is called ", after: ".", correctAnswer: "pacing" },
  { before: "Using hand and body movements to show action is called using ", after: ".", correctAnswer: "gestures" },
  { before: "Looking directly at your audience while narrating is called making ", after: ".", correctAnswer: "eye contact" },
  { before: "Stopping briefly right before a surprising moment to build tension is called a ", after: " for suspense.", correctAnswer: "pause" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why do skilled narrators pause just before a surprising or suspenseful event in a story?",
    correct: "To build tension and give the audience a moment to anticipate what happens next",
    distractors: ["To give themselves time to remember the next word", "Because they have forgotten the story", "To signal that the story has ended"],
  },
  {
    q: "What is the main purpose of voice projection during an oral narrative performance?",
    correct: "To make sure everyone in the audience, even those at the back, can hear the story clearly",
    distractors: ["To make the narrator sound angry", "To finish the story more quickly", "To avoid using gestures"],
  },
  {
    q: "Why is eye contact considered an important oral narrative performance technique?",
    correct: "It helps the narrator connect with and engage the audience",
    distractors: ["It helps the narrator read their notes better", "It is only needed at the very end of the story", "It has no real effect on the audience"],
  },
  {
    q: "Why is it valuable to rehearse an oral narrative before performing it?",
    correct: "Rehearsing helps the narrator time pauses well and deliver the story confidently and smoothly",
    distractors: ["Rehearsing makes the story longer than the original", "Rehearsing is only needed for written compositions", "Rehearsing removes the need for gestures during performance"],
  },
];

export const oralNarrativePerformance: Skill = {
  id: "g7-eng-ls-oral-narrative-performance",
  code: "LS.2",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Oral Presentations: Oral Narratives",
  description: "Identify and use oral narrative performance techniques such as voice projection, pacing, eye contact, gestures, and suspenseful pauses for effective delivery.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "order", "fix", "fill", "concept"] as const);
    const hint = "Effective oral narrative performance uses the voice, the body, and careful timing together to hold the audience's attention.";

    if (branch === "categorize") {
      const chosen = shuffle(rng, TECHNIQUES).slice(0, 6);
      const buckets = [
        { id: "voice", label: CATEGORY_LABEL.voice },
        { id: "body", label: CATEGORY_LABEL.body },
        { id: "timing", label: CATEGORY_LABEL.timing },
      ];
      const items = chosen.map((t, i) => ({ id: `t${i}`, label: t.name }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((t, i) => (correctBucket[`t${i}`] = t.category));
      return {
        kind: "categorize",
        prompt: "Sort each oral narrative technique by whether it is mainly about the voice, the body, or timing.",
        items,
        buckets,
        correctBucket,
        hint,
        explanation: chosen.map((t) => `"${t.name}" is a ${CATEGORY_LABEL[t.category].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TECHNIQUES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.effect })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.name] = t.name;
      return {
        kind: "click-match",
        prompt: "Match each oral narrative performance technique to the effect it creates for the audience.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((t) => `${t.name} — ${t.effect.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of preparing an oral narrative performance in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Preparation moves from choosing and planning the story, through rehearsal, to performing and then reflecting.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fix") {
      const entry = randChoice(rng, FIX_ITEMS);
      const choices = shuffle(rng, [entry.fix, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${entry.desc} Which technique would most improve this performance?`,
        choices,
        correctIndex: choices.indexOf(entry.fix),
        layout: "list",
        hint: "Identify what is missing from the description — is it the voice, the eye contact, the gestures, or the timing?",
        explanation: `${entry.fix} would fix this weakness, since the description shows that quality was missing from the performance.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the description of this oral narrative technique.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `The complete sentence reads: "${[entry.before, entry.correctAnswer, entry.after].filter(Boolean).join(" ")}"`,
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
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
