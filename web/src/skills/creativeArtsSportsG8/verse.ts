import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DEVICES = [
  { id: "imagery", label: "Imagery", meaning: "Descriptive language that appeals to the senses, helping the reader picture, hear, or feel what is described" },
  { id: "alliteration", label: "Alliteration", meaning: "Repeating the same starting sound in nearby words, such as 'wild winds whistle'" },
  { id: "rhyme", label: "Rhyme", meaning: "Repeating similar ending sounds, usually at the ends of lines" },
  { id: "onomatopoeia", label: "Onomatopoeia", meaning: "A word that imitates the sound it describes, such as 'buzz' or 'crash'" },
  { id: "diction", label: "Diction", meaning: "The specific choice of words a poet makes to create tone and meaning" },
];

const CATEGORY_ITEMS = [
  { label: "Alliteration", bucket: "sound" },
  { label: "Rhyme", bucket: "sound" },
  { label: "Onomatopoeia", bucket: "sound" },
  { label: "Imagery", bucket: "imagery" },
  { label: "Diction", bucket: "imagery" },
  { label: "Line (a single row of a verse)", bucket: "structure" },
  { label: "Stanza (a grouped set of lines)", bucket: "structure" },
];

const BUCKET_LABEL: Record<string, string> = { sound: "Sound device", imagery: "Word-choice/imagery device", structure: "Structural element" };

const COMPOSE_STEPS = [
  { id: "issue", label: "Choose a societal issue or theme to address" },
  { id: "brainstorm", label: "Brainstorm imagery, sound devices, and word choices related to the issue" },
  { id: "draft", label: "Draft individual lines expressing the ideas" },
  { id: "arrange", label: "Arrange the lines into stanzas" },
  { id: "revise", label: "Revise and edit the verse for clarity and impact" },
  { id: "perform", label: "Practise and prepare to perform the verse before an audience" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "What is the purpose of imagery in a verse?", correct: "It helps the reader or listener picture, hear, or feel what is being described", distractors: ["It only affects how the verse rhymes", "It removes the need for any word choice", "It has no effect on how the verse is understood"] },
  { q: "Which of these is an example of alliteration?", correct: "'Soft summer sunlight settled slowly'", distractors: ["'The bell went ding-dong'", "'Cat, hat, and mat rhymed'", "'The river flowed calmly'"] },
  { q: "Which of these is an example of onomatopoeia?", correct: "'Crash!' went the falling tree", distractors: ["'Wild winds whistle'", "'The moon shone bright'", "'Bright, blue skies'"] },
  { q: "What does 'diction' refer to in a verse?", correct: "The specific choice of words a poet makes to create tone and meaning", distractors: ["The rhythm pattern of the verse", "The number of stanzas in the verse", "The volume at which the verse is performed"] },
  { q: "Why might a poet compose a verse to address a societal issue?", correct: "Verse can raise awareness, express feeling, and communicate a message about the issue memorably", distractors: ["Verse has no ability to communicate real issues", "Composing verse always avoids serious topics", "A verse can only ever describe nature"] },
  { q: "What can make a verse performance interesting and memorable for an audience?", correct: "Expressive delivery, clear diction, and confident use of pace, pause, and tone", distractors: ["Reading the verse as fast as possible with no expression", "Avoiding any eye contact or expression while performing", "Performing without ever pausing between lines"] },
];

const MATCH_PROMPTS = [
  "Match each language device to its correct meaning.",
  "Pair each device below with its correct meaning.",
  "Match each device to what it describes.",
  "Connect each language device to its correct meaning.",
  "For each device below, choose its matching meaning.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into Sound device, Word-choice/imagery device, or Structural element.",
  "Which category does each item below belong to? Sort them.",
  "Classify each item into its correct category.",
  "Decide which category each item fits, and sort it.",
  "Sort these items by the category they belong to.",
] as const;

const ORDER_PROMPTS = [
  "Arrange the correct order for composing a verse that addresses a societal issue.",
  "Put these verse-composing steps in the order they occur.",
  "Order these steps, from first to last.",
  "Sort these steps into the correct sequence for composing a verse.",
  "Place these verse-composing steps in the order you would follow them.",
] as const;

export const verse: Skill = {
  id: "g8-cas-verse",
  code: "C.8",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Verse",
  description: "Language use in verse — imagery, sound devices, diction, and line/stanza structure — plus composing and performing a verse on a societal issue.",
  generate(rng) {
    const branch = randChoice(rng, ["terms-match", "categorize", "compose-order", "theory-mc"] as const);

    if (branch === "terms-match") {
      const chosen = shuffle(rng, DEVICES);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Imagery appeals to the senses; alliteration, rhyme, and onomatopoeia are all about sound.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const soundPicks = shuffle(rng, CATEGORY_ITEMS.filter((c) => c.bucket === "sound")).slice(0, 2);
      const imageryPicks = CATEGORY_ITEMS.filter((c) => c.bucket === "imagery");
      const structurePicks = CATEGORY_ITEMS.filter((c) => c.bucket === "structure");
      const items = shuffle(rng, [...soundPicks, ...imageryPicks, ...structurePicks]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((item) => ({ id: item.label, label: item.label })),
        buckets: [
          { id: "sound", label: BUCKET_LABEL.sound },
          { id: "imagery", label: BUCKET_LABEL.imagery },
          { id: "structure", label: BUCKET_LABEL.structure },
        ],
        correctBucket,
        hint: "Sound devices are heard; imagery/diction shape word choice; lines and stanzas shape structure.",
        explanation: items.map((item) => `"${item.label}" is a ${BUCKET_LABEL[item.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "compose-order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, COMPOSE_STEPS),
        correctOrder: COMPOSE_STEPS.map((s) => s.id),
        hint: "Choosing the issue always comes first; performing always comes last, after revising.",
        explanation: `The order is: ${COMPOSE_STEPS.map((s) => s.label).join(" → ")}.`,
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
      hint: "Imagery, sound devices, and diction all shape how a verse's language works.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
