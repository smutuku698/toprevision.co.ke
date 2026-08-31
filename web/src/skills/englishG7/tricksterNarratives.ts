import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Hare borrowed Squirrel's best drum for the wedding dance, but he cracked its skin while showing off his fanciest moves. Afraid of Squirrel's anger, Hare hid the broken drum deep in the bushes and told everyone that Monkey must have stolen it. Squirrel confronted Monkey angrily in front of the whole village, and Monkey wept, insisting he was innocent. Wise old Tortoise, suspicious of Hare's story, searched the bushes and found the cracked drum exactly where Hare had hidden it. Ashamed, Hare was made to apologise to Monkey and weave Squirrel a brand-new drum with his own hands.";

const EVENTS = [
  { id: "crack", label: "Hare cracks Squirrel's drum while showing off at the dance" },
  { id: "hide", label: "Hare hides the broken drum in the bushes" },
  { id: "blame", label: "Hare tells everyone that Monkey stole the drum" },
  { id: "find", label: "Tortoise searches the bushes and finds the cracked drum" },
  { id: "apologise", label: "Hare apologises and weaves Squirrel a new drum" },
];

const CHARACTER_ROLES: { name: string; role: string }[] = [
  { name: "Hare", role: "The trickster who breaks the drum and lies to escape blame" },
  { name: "Squirrel", role: "The owner of the drum, who trusts Hare's false story at first" },
  { name: "Monkey", role: "The innocent character wrongly blamed for Hare's mistake" },
  { name: "Tortoise", role: "The patient character who investigates and finds the truth" },
];

const RESPONSIBILITY_ITEMS: { text: string; category: "avoiding" | "accepting" }[] = [
  { text: "Hare hides the broken drum in the bushes", category: "avoiding" },
  { text: "Hare tells everyone that Monkey stole the drum", category: "avoiding" },
  { text: "Hare apologises to Monkey for the false blame", category: "accepting" },
  { text: "Hare weaves Squirrel a brand-new drum with his own hands", category: "accepting" },
];

const TRICK_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What trick does Hare play on Monkey in this narrative?",
    correct: "He blames Monkey for breaking the drum, when Hare broke it himself",
    distractors: [
      "He challenges Monkey to a dance competition",
      "He borrows Monkey's drum without asking",
      "He teaches Monkey how to fix a broken drum",
    ],
    explanation: "The passage says Hare 'told everyone that Monkey must have stolen it' after cracking the drum himself — his trick is shifting the blame onto an innocent character.",
  },
  {
    q: "How does Hare try to hide what he has done?",
    correct: "He hides the broken drum in the bushes so no one finds the evidence",
    distractors: [
      "He mends the drum secretly overnight",
      "He tells Squirrel the truth immediately",
      "He runs away from the village entirely",
    ],
    explanation: "The passage states Hare 'hid the broken drum deep in the bushes,' trying to remove the evidence of his mistake.",
  },
];

const TRAIT_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What does Hare's trick reveal about his character at the start of the story?",
    correct: "He is dishonest and quick to blame others rather than admit his own mistakes",
    distractors: [
      "He is honest and always tells the truth immediately",
      "He is generous and shares his belongings freely",
      "He is timid and avoids any kind of conflict",
    ],
    explanation: "Hare cracks the drum, hides it, and blames Monkey instead of admitting fault — this shows dishonesty and an unwillingness to take responsibility.",
  },
  {
    q: "What does Tortoise's role in the story reveal about his character?",
    correct: "He is patient and careful, willing to search for the truth instead of assuming Monkey is guilty",
    distractors: [
      "He is careless and jumps to conclusions quickly",
      "He is jealous of Hare's dancing skills",
      "He wants to punish Monkey without any evidence",
    ],
    explanation: "Tortoise, 'suspicious of Hare's story,' searches the bushes rather than accepting the accusation at face value — showing patience and fairness.",
  },
];

const MORAL_FILLS: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  {
    before: "The moral of this trickster narrative is that we should admit our own",
    after: "instead of blaming innocent people for them.",
    correctAnswer: "mistakes",
    acceptedAnswers: ["mistakes", "mistake", "errors", "wrongs"],
  },
  {
    before: "Even though Hare tried to hide what he had done, the",
    after: "eventually came out when Tortoise searched the bushes.",
    correctAnswer: "truth",
    acceptedAnswers: ["truth"],
  },
];

export const tricksterNarratives: Skill = {
  id: "g7-eng-r-trickster-narratives",
  code: "R.16",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Trickster Narratives",
  description: "Identify main events and the trick in a trickster narrative, analyse characters, and relate the moral lesson to personal responsibility in real life.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "trick", "trait", "match", "categorize", "moral"] as const);
    const hint = "Look closely at what Hare does, why he does it, and what happens once the truth is discovered.";

    if (branch === "order") {
      const items = shuffle(rng, EVENTS);
      return {
        kind: "ordering",
        prompt: "Arrange the events of this trickster narrative in the order they happened.",
        instruction: "Click them in order.",
        passage: STORY,
        items,
        correctOrder: EVENTS.map((e) => e.id),
        hint: "The story moves from Hare's mistake, through his lie, to Tortoise uncovering the truth and Hare making amends.",
        explanation: EVENTS.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "trick") {
      const entry = randChoice(rng, TRICK_QUESTIONS);
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

    if (branch === "trait") {
      const entry = randChoice(rng, TRAIT_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about what a character's actions, not just their words, reveal about them.",
        explanation: entry.explanation,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, CHARACTER_ROLES.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, CHARACTER_ROLES.map((c) => ({ id: c.name, label: c.role })));
      const correctMap: Record<string, string> = {};
      for (const c of CHARACTER_ROLES) correctMap[c.name] = c.name;
      return {
        kind: "click-match",
        prompt: "Match each character in the trickster narrative to their role in the story.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint: "Think about what each character does and how their actions affect the others.",
        explanation: CHARACTER_ROLES.map((c) => `${c.name} — ${c.role.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, RESPONSIBILITY_ITEMS);
      const items = chosen.map((c, i) => ({ id: `a${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`a${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each of Hare's actions as either Avoiding Responsibility or Accepting Responsibility.",
        passage: STORY,
        items,
        buckets: [
          { id: "avoiding", label: "Avoiding Responsibility" },
          { id: "accepting", label: "Accepting Responsibility" },
        ],
        correctBucket,
        hint: "Early in the story Hare runs from the truth; by the end he faces it.",
        explanation: chosen
          .map((c) => `"${c.text}" is ${c.category === "avoiding" ? "avoiding responsibility" : "accepting responsibility"}.`)
          .join(" "),
      };
    }

    const entry = randChoice(rng, MORAL_FILLS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete this statement about the story's moral lesson.",
      passage: STORY,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      acceptedAnswers: entry.acceptedAnswers,
      inputMode: "text",
      hint: "Think about what personal responsibility means and how the story ends.",
      explanation: `The moral is that we should take personal responsibility for our own actions: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
    };
  },
};
