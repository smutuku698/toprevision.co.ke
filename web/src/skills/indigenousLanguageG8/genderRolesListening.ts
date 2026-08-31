import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LISTENING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Listening for the main idea", description: "Identifying what the speaker's overall message is about" },
  { skill: "Listening for specific details", description: "Picking out names, facts, or examples the speaker mentions" },
  { skill: "Note-taking while listening", description: "Jotting down key points as the speaker talks" },
  { skill: "Avoiding distractions", description: "Keeping your attention on the speaker instead of on other things around you" },
  { skill: "Listening without interrupting", description: "Letting the speaker finish a point before you respond" },
];

const ROLE_ITEMS: { text: string; bucket: string }[] = [
  { text: "Boys were traditionally expected to herd the family's cattle and goats", bucket: "Traditional role assigned to boys" },
  { text: "Boys traditionally helped build houses and repair fences", bucket: "Traditional role assigned to boys" },
  { text: "Girls were traditionally expected to fetch water and firewood", bucket: "Traditional role assigned to girls" },
  { text: "Girls traditionally learned skills such as basket weaving from their mothers", bucket: "Traditional role assigned to girls" },
  { text: "Today, both boys and girls take turns cooking and cleaning at home", bucket: "Modern view: open to both" },
  { text: "Both boys and girls are enrolled in science and mathematics classes", bucket: "Modern view: open to both" },
  { text: "Both boys and girls are encouraged to try out for the school football team", bucket: "Modern view: open to both" },
];

const LISTENING_STEPS: { id: string; label: string }[] = [
  { id: "prepare", label: "Prepare to listen by removing distractions and facing the speaker" },
  { id: "main-idea", label: "Listen attentively for the main idea of the aural text" },
  { id: "note", label: "Note down key details and facts mentioned" },
  { id: "reflect", label: "Think about the message and how it applies to the community" },
  { id: "respond", label: "Respond to comprehension questions based on what was heard" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  {
    before: "Providing equal",
    after: "to both girls and boys helps every learner in the community reach their full potential.",
    answer: "opportunities",
  },
  {
    before: "A responsibility or activity that a community traditionally expects from boys or girls is called a gender",
    after: ".",
    answer: "role",
  },
  {
    before: "Before answering comprehension questions on an aural text, you must first listen",
    after: "to understand the speaker's message.",
    answer: "carefully",
    accepted: ["attentively", "closely"],
  },
  {
    before: "Writing down key facts as a speaker talks about gender roles is called",
    after: ".",
    answer: "note-taking",
    accepted: ["taking notes"],
  },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the best way to listen to an aural text for information?",
    correct: "Pay close attention, identify the main idea, and note key details",
    distractors: [
      "Think about something else while the speaker is talking",
      "Wait for the recording to end before paying attention",
      "Interrupt the speaker frequently to ask unrelated questions",
    ],
  },
  {
    q: "Why should some opportunities be equal among both girls and boys in a community?",
    correct: "So that every learner can develop their talents and contribute fully to society",
    distractors: [
      "Because only boys benefit from equal opportunities",
      "Because tradition never needs to be questioned",
      "Because girls do not need an education",
    ],
  },
  {
    q: "Which of these best describes a 'gender role'?",
    correct: "A responsibility or activity that a community traditionally expects from boys or girls",
    distractors: [
      "A rule that applies only during school holidays",
      "A law passed by the national government",
      "A game played only at cultural festivals",
    ],
  },
  {
    q: "When responding to comprehension questions on gender roles in an aural text, what should you do first?",
    correct: "Listen carefully to understand what the speaker actually said before answering",
    distractors: [
      "Guess the answers without listening",
      "Copy a classmate's answers",
      "Answer based only on your own opinion, ignoring the text",
    ],
  },
  {
    q: "Which of these is an example of purposeful listening?",
    correct: "Taking notes on the key points a speaker makes about gender roles in the community",
    distractors: [
      "Looking at your phone while someone is speaking",
      "Talking to a neighbour while the speaker is presenting",
      "Leaving the room before the speaker finishes",
    ],
  },
];

export const genderRolesListening: Skill = {
  id: "g8-il-ls-gender-roles",
  code: "LS.1",
  subjectId: "indigenous-language",
  strandId: "g8-il-listening-speaking",
  grade: 8,
  title: "Gender roles: listening for information",
  description: "Listen purposefully to identify gender roles in the community and respond to comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Listen purposefully: focus on the main idea, note key details, and think about what equal opportunity means for both girls and boys.";

    if (branch === "match") {
      const chosen = shuffle(rng, LISTENING_SKILLS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each purposeful listening skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, ROLE_ITEMS).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `r${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`r${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each example into the correct group.",
        items,
        buckets,
        correctBucket,
        hint: "Decide whether the example describes a traditional role for boys, a traditional role for girls, or a modern view where the activity is open to both.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, LISTENING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of listening to an aural text for information in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: LISTENING_STEPS.map((s) => s.id),
        hint: "Start by getting ready to listen, then focus on the message, record details, reflect, and finally respond.",
        explanation: LISTENING_STEPS.map((s) => s.label).join(" → "),
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
