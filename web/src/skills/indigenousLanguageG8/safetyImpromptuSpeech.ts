import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const NON_VERBAL_CUES: { cue: string; example: string }[] = [
  { cue: "Eye contact", example: "Looking at classmates to check they understand the fire drill instructions" },
  { cue: "Gesture", example: "Pointing towards the nearest exit while explaining an evacuation route" },
  { cue: "Facial expression", example: "Looking serious while warning about a safety hazard" },
  { cue: "Posture", example: "Standing tall and confidently while giving instructions" },
  { cue: "Tone of voice", example: "Raising the voice slightly to stress an urgent warning" },
];

const FIRST_AID_ITEMS: { text: string; bucket: string }[] = [
  { text: "Calling a teacher immediately after an accident", bucket: "Correct first aid step" },
  { text: "Keeping the injured person calm and still", bucket: "Correct first aid step" },
  { text: "Covering a small cut with a clean cloth", bucket: "Correct first aid step" },
  { text: "Checking for danger before approaching the injured person", bucket: "Correct first aid step" },
  { text: "Moving a badly injured classmate to carry them home alone", bucket: "Unsafe action" },
  { text: "Ignoring the injury and continuing to play", bucket: "Unsafe action" },
  { text: "Giving the injured person food or water without checking their condition", bucket: "Unsafe action" },
];

const FIRST_AID_STEPS: { id: string; label: string }[] = [
  { id: "assess", label: "Stay calm and assess the situation for danger" },
  { id: "alert", label: "Alert a teacher or adult immediately" },
  { id: "calm", label: "Keep the injured person calm and still" },
  { id: "aid", label: "Give appropriate first aid, such as cleaning a small wound" },
  { id: "further", label: "Seek further medical attention if the injury is serious" },
];

const FILLS: { before: string; after: string; answer: string }[] = [
  { before: "Maintaining eye", after: "with your audience helps show confidence during a talk.", answer: "contact" },
  { before: "When giving an impromptu speech, standing up straight shows good", after: ".", answer: "posture" },
  { before: "After a minor accident, you should keep the injured person calm and", after: "before helping them.", answer: "still" },
  { before: "If a classmate gets seriously injured at school, the first step is to alert a", after: "immediately.", answer: "teacher" },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Which non-verbal cue involves looking at your audience while speaking?",
    correct: "Eye contact",
    distractors: ["Tone of voice", "Gesture", "Posture"],
  },
  {
    q: "Why are non-verbal cues important during a presentation?",
    correct: "They help the audience understand and stay engaged with the message",
    distractors: [
      "They allow the speaker to avoid preparing content",
      "They replace the need for spoken words entirely",
      "They make the presentation shorter",
    ],
  },
  {
    q: "What should you do first if a classmate is injured during a school game?",
    correct: "Stay calm, assess the situation, and alert a teacher",
    distractors: [
      "Ignore it and continue playing",
      "Move the classmate immediately without checking the injury",
      "Wait until the game ends before telling anyone",
    ],
  },
  {
    q: "Why is it important to follow the appropriate steps of first aid in case of an accident?",
    correct: "To prevent the injury from becoming worse and to keep the person safe",
    distractors: [
      "Because first aid steps are only for adults to follow",
      "Because it is a rule that has no real purpose",
      "Because it lets you avoid calling for help",
    ],
  },
  {
    q: "Which of these is an example of a non-verbal cue?",
    correct: "Pointing towards the exit while explaining an evacuation route",
    distractors: [
      "Writing the speech word for word beforehand",
      "Choosing which topic to speak about",
      "Reading a written report silently",
    ],
  },
];

export const safetyImpromptuSpeech: Skill = {
  id: "g8-il-ls-safety",
  code: "LS.4",
  subjectId: "indigenous-language",
  strandId: "g8-il-listening-speaking",
  grade: 8,
  title: "Safety at school: impromptu speech",
  description: "Identify non-verbal cues used in communication and the correct steps of first aid when responding to an accident.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Non-verbal cues like eye contact, gestures, and posture enhance a talk, and calm, correct first aid steps keep an injured person safe.";

    if (branch === "match") {
      const chosen = shuffle(rng, NON_VERBAL_CUES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.cue, label: c.cue })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.cue, label: c.example })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.cue] = c.cue;
      return {
        kind: "click-match",
        prompt: "Match each non-verbal cue to an example of it during a safety talk.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((c) => `${c.cue} — ${c.example.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, FIRST_AID_ITEMS);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each action into the correct group.",
        items,
        buckets,
        correctBucket,
        hint: "A correct first aid step keeps the injured person safe; an unsafe action could make the injury worse.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, FIRST_AID_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the first aid response steps in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: FIRST_AID_STEPS.map((s) => s.id),
        hint: "Assess danger first, then alert an adult, keep the person calm, give first aid, and seek further help if needed.",
        explanation: FIRST_AID_STEPS.map((s) => s.label).join(" → "),
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
