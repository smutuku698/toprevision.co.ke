import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface ComprehensionQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

const OGRE_STORY = {
  text: "Long ago, in a village near the forest edge, a great ogre with two mouths terrorised anyone who wandered too close to the river at dusk. One evening, a clever girl named Chebet was sent to fetch water. When the ogre blocked her path and demanded her basket, Chebet calmly offered to sing him a song first, as was the custom for travellers. She sang so sweetly and so long that the ogre, who loved music above all things, fell into a deep sleep before she finished the second verse. Chebet slipped past him, filled her basket, and warned every traveller in the village never to go to the river without a song ready to sing. From that day, no one in the village ever feared the ogre again, for they had learned that cleverness could defeat even the fiercest monster.",
  questions: [
    {
      prompt: "How did Chebet manage to get past the ogre?",
      choices: [
        "She sang him a song until he fell asleep",
        "She fought the ogre with a spear",
        "She ran faster than the ogre",
        "She gave the ogre her basket of water",
      ],
      correctIndex: 0,
      explanation: "The story states that Chebet sang so sweetly and so long that the ogre fell into a deep sleep before the second verse ended.",
    },
    {
      prompt: "What lesson does this story mainly teach?",
      choices: [
        "Cleverness can overcome even a fearsome threat",
        "Only strength can defeat a monster",
        "Travellers should avoid singing near ogres",
        "Ogres cannot be outwitted by anyone",
      ],
      correctIndex: 0,
      explanation: "The final line states directly that the village \"had learned that cleverness could defeat even the fiercest monster.\"",
    },
  ] as ComprehensionQuestion[],
  trueFalse: [
    { text: "Chebet sang a song to the ogre.", isTrue: true },
    { text: "The ogre loved music and fell asleep.", isTrue: true },
    { text: "Chebet fought the ogre with a weapon.", isTrue: false },
    { text: "The ogre caught Chebet and took her basket.", isTrue: false },
  ],
  events: [
    { id: "sent", label: "Chebet is sent to fetch water near the river." },
    { id: "blocked", label: "The ogre blocks her path and demands her basket." },
    { id: "sings", label: "Chebet offers to sing him a song first." },
    { id: "sleeps", label: "The ogre falls asleep before she finishes the second verse." },
    { id: "escapes", label: "Chebet fills her basket and slips past him." },
  ],
};

const FEATURES: { word: string; meaning: string }[] = [
  { word: "cunning hero", meaning: "A clever main character who outwits danger using wit, not strength" },
  { word: "monstrous antagonist", meaning: "A frightening, often supernatural creature that threatens the community" },
  { word: "moral lesson", meaning: "A teaching about right conduct conveyed through the story's ending" },
  { word: "repetition", meaning: "Words, phrases, or events repeated for emphasis or rhythm" },
  { word: "formulaic opening", meaning: "A traditional phrase, like 'Long ago', that signals a story is beginning" },
  { word: "rural setting", meaning: "A village, river, or forest backdrop typical of oral tales" },
];

interface FillItem {
  before: string;
  after: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  hint: string;
  explanation: string;
}

const FILL_ITEMS: FillItem[] = [
  {
    before: "A traditional opening phrase such as 'Long ago' that signals an oral tale is beginning is called a",
    after: "opening.",
    correctAnswer: "formulaic",
    hint: "This word describes an opening that follows a fixed, traditional pattern.",
    explanation: "A 'formulaic' opening is a traditional phrase, like 'Long ago', that signals a story is beginning.",
  },
  {
    before: "The teaching about right conduct conveyed at the end of a story is called its",
    after: ".",
    correctAnswer: "moral",
    acceptedAnswers: ["moral lesson"],
    hint: "This word names the lesson about right conduct taught by a story.",
    explanation: "The 'moral' (or moral lesson) is the teaching about right conduct conveyed through a story's ending.",
  },
  {
    before: "A clever character, like Chebet, who defeats danger through wit rather than strength is called a",
    after: "hero.",
    correctAnswer: "cunning",
    hint: "This word describes a clever, crafty character.",
    explanation: "A 'cunning' hero is a clever main character who outwits danger using wit, not strength.",
  },
  {
    before: "Words or events repeated for emphasis or rhythm in an oral tale are examples of",
    after: ".",
    correctAnswer: "repetition",
    hint: "This word names something said or done again for emphasis.",
    explanation: "'Repetition' is words, phrases, or events repeated for emphasis or rhythm in oral storytelling.",
  },
];

export const musicOgreReading: Skill = {
  id: "g8-il-r-music",
  code: "R.8",
  subjectId: "indigenous-language",
  strandId: "g8-il-reading",
  grade: 8,
  title: "Indigenous music and culture: intensive reading — ogre stories",
  description: "Read an ogre story, identify its typical features, respond to comprehension questions, and build vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "categorize", "match", "fill", "order"] as const);

    if (branch === "mc") {
      const q = randChoice(rng, OGRE_STORY.questions);
      const correctText = q.choices[q.correctIndex];
      const choices = shuffle(rng, q.choices);
      return {
        kind: "multiple-choice",
        passage: OGRE_STORY.text,
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: "Reread the tale closely to find specific information, then check which choice matches it.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const items = OGRE_STORY.trueFalse.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        passage: OGRE_STORY.text,
        prompt: "Sort each statement as True or False, based on the ogre story.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Check each statement against exactly what happens in the story.",
        explanation: OGRE_STORY.trueFalse.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"} according to the story.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, FEATURES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each feature of ogre stories to its description.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what makes an ogre story different from other kinds of stories.",
        explanation: chosen.map((v) => `${v.word} — ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: item.before,
        after: item.after,
        correctAnswer: item.correctAnswer,
        acceptedAnswers: item.acceptedAnswers,
        inputMode: "text",
        hint: item.hint,
        explanation: item.explanation,
      };
    }

    const items = shuffle(rng, OGRE_STORY.events);
    return {
      kind: "ordering",
      prompt: "Arrange the events of the ogre story in the order they happen.",
      instruction: "Click them in order.",
      items,
      correctOrder: OGRE_STORY.events.map((e) => e.id),
      hint: "Chebet is sent for water first, and only escapes after the ogre has fallen asleep.",
      explanation: OGRE_STORY.events.map((e) => e.label).join(" → "),
    };
  },
};
