import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MYTH_TEXT =
  "Long ago, in a village surrounded by hills, there lived a river spirit named Ruo who was very proud of her fast-flowing waters. Ruo boasted to Mvua, the rain spirit, that she needed no help from anyone, not even the rain, to stay full and strong. One dry season, Ruo asked the rains to stay away for many months, for she wanted to prove her strength alone. Slowly, Ruo's waters shrank until only a trickle remained, and the animals and farmers who depended on her began to suffer. Ashamed, Ruo called out to Mvua for help. Mvua forgave her and sent gentle showers until the river flowed strong again. From that day, Ruo never boasted again, and she thanked the rain every season for keeping her alive. The villagers began telling this story to remind travellers and children that no one can succeed entirely alone.";

const CHARACTERS: { name: string; description: string }[] = [
  { name: "Ruo", description: "The proud river spirit who boasted she needed no help from anyone" },
  { name: "Mvua", description: "The patient rain spirit who forgave Ruo and restored the river" },
  { name: "The animals and farmers", description: "Those who suffered when Ruo's waters shrank" },
  { name: "The villagers", description: "Those who began telling the story to teach travellers and children a lesson" },
];

const EVENTS = [
  { id: "boast", label: "Ruo boasts to Mvua that she does not need the rain's help" },
  { id: "ask", label: "Ruo asks the rains to stay away to prove her strength alone" },
  { id: "shrink", label: "Ruo's waters shrink and the animals and farmers begin to suffer" },
  { id: "call", label: "Ashamed, Ruo calls out to Mvua for help" },
  { id: "forgive", label: "Mvua forgives her and sends gentle showers" },
  { id: "thank", label: "Ruo never boasts again and thanks the rain every season" },
];

const STORY_ELEMENTS: { text: string; category: string }[] = [
  { text: "Ruo, the proud river spirit", category: "character" },
  { text: "Mvua, the patient rain spirit", category: "character" },
  { text: "A village surrounded by hills, during a dry season", category: "setting" },
  { text: "Ruo asked the rains to stay away", category: "event" },
  { text: "The animals and farmers suffered as the river dried up", category: "event" },
  { text: "No one can succeed or survive entirely alone", category: "moral" },
];

const COMPREHENSION_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What lesson does this myth teach?",
    correct: "No one can succeed or survive entirely alone; we depend on and should appreciate one another",
    distractors: ["Rain spirits are more powerful than river spirits", "Rivers should always flow as fast as possible", "Villages should never tell stories to children"],
  },
  {
    q: "Why did Ruo's waters shrink?",
    correct: "Because she asked the rains to stay away to prove she could manage on her own",
    distractors: ["Because Mvua refused to help her from the start", "Because the villagers diverted her water elsewhere", "Because the dry season lasted only a single day"],
  },
  {
    q: "Which real-life situation best reflects the lesson of this myth?",
    correct: "A student refuses help from classmates and struggles alone with a difficult project",
    distractors: ["A student happily works in a group and shares ideas with others", "A farmer plants crops at the start of the rainy season", "A traveller asks for directions to the village hall"],
  },
  {
    q: "How does Ruo change by the end of the myth?",
    correct: "She becomes humble and grateful, thanking the rain every season instead of boasting",
    distractors: ["She stops flowing altogether and disappears", "She becomes even prouder than before", "She refuses to speak to Mvua ever again"],
  },
];

const FILL_ITEMS = [
  { before: "Ashamed, Ruo called out to", after: "for help.", correctAnswer: "Mvua" },
  { before: "Ruo was very proud of her fast-flowing", after: ".", correctAnswer: "waters" },
  { before: "Mvua forgave her and sent gentle", after: "until the river flowed strong again.", correctAnswer: "showers" },
];

export const oralNarrativesMyths: Skill = {
  id: "g8-eng-ls-oral-narratives-myths",
  code: "LS.8",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Listening and Responding: Oral Narratives — Myths",
  description: "Identify characters, sequence events, and explain the moral lesson in a myth, relating it to real life.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A myth's characters, setting and events all build up to teach the audience a moral lesson that can apply to real life.";

    if (branch === "match") {
      const tokens = shuffle(rng, CHARACTERS.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, CHARACTERS.map((c) => ({ id: c.name, label: c.description })));
      const correctMap: Record<string, string> = {};
      for (const c of CHARACTERS) correctMap[c.name] = c.name;
      return {
        kind: "click-match",
        prompt: "Match each character in the myth to their description.",
        passage: MYTH_TEXT,
        tokens,
        targets,
        correctMap,
        hint,
        explanation: CHARACTERS.map((c) => `${c.name} — ${c.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, STORY_ELEMENTS).slice(0, 5);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each element of the myth into Character, Setting, Event, or Moral lesson.",
        passage: MYTH_TEXT,
        items,
        buckets: [
          { id: "character", label: "Character" },
          { id: "setting", label: "Setting" },
          { id: "event", label: "Event" },
          { id: "moral", label: "Moral lesson" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is the ${c.category}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, EVENTS);
      return {
        kind: "ordering",
        prompt: "Arrange the key events of the myth in the correct order.",
        instruction: "Click them in order.",
        passage: MYTH_TEXT,
        items,
        correctOrder: EVENTS.map((e) => e.id),
        hint: "The myth moves from Ruo's boast, through her hardship, to her change of heart and gratitude.",
        explanation: EVENTS.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word from the myth.",
        passage: MYTH_TEXT,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look for the exact word in the passage above.",
        explanation: `The passage reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    const entry = randChoice(rng, COMPREHENSION_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      passage: MYTH_TEXT,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
