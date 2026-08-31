import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SONG =
  "Hail Kiptum, tamer of the mountain roads,\nWho carries maize and mothers on his loads!\nThrough mud that swallows lesser men whole,\nHis engine roars on, steady and bold.\nSing his name at every trading post,\nThe driver who never once counted the cost!";

const OCCASION_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which occasion best suits a praise song like this one, sung for driver Kiptum?",
    correct: "Welcoming him home after a long, difficult journey completed safely",
    distractors: [
      "A funeral procession mourning a recent loss",
      "A quiet bedtime routine for a small child",
      "An angry protest against poor roads",
    ],
    explanation: "The song celebrates Kiptum's skill and safe delivery of passengers and goods through difficult conditions — the kind of achievement typically honoured on his return home.",
  },
];

const HONOUR_MATCH: { line: string; honours: string }[] = [
  { line: "tamer of the mountain roads", honours: "His skill navigating difficult, dangerous routes" },
  { line: "who carries maize and mothers on his loads", honours: "His reliability serving the whole community" },
  { line: "through mud that swallows lesser men whole", honours: "His courage and toughness, compared to other drivers" },
  { line: "never once counted the cost", honours: "His selflessness and dedication to his work" },
];

const RELATIONSHIP_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What does this praise song suggest about the relationship between the singers and Kiptum?",
    correct: "The singers admire and honour him publicly for his skill and service to the community",
    distractors: [
      "The singers are strangers who have never heard of Kiptum",
      "The singers resent Kiptum for his success",
      "The singers are competing against Kiptum in a race",
    ],
    explanation: "Praising someone by name in public, listing their skill and service, is a sign of admiration and honour toward the person being praised.",
  },
];

const GENRE_CATEGORY: { text: string; category: "praise" | "lullaby" | "trickster" }[] = [
  { text: "Sung to honour someone's achievement or character in front of others", category: "praise" },
  { text: "Sung softly to calm and settle a child to sleep", category: "lullaby" },
  { text: "Told to entertain while teaching a lesson about clever deception", category: "trickster" },
];

const APPRECIATE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why are praise songs like this one important in communication?",
    correct: "They publicly celebrate a person's achievements and strengthen community bonds",
    distractors: [
      "They are only meant to embarrass the person being sung about",
      "They serve no purpose beyond filling time at a gathering",
      "They are used only to criticise a person's mistakes",
    ],
    explanation: "By naming Kiptum's specific skills and service, the song publicly recognises his value to the community, strengthening the bond between him and those he serves.",
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Hail Kiptum, tamer of the mountain", after: ",", correctAnswer: "roads" },
  { before: "Through mud that swallows lesser men whole,\nHis engine roars on, steady and", after: ".", correctAnswer: "bold" },
  { before: "Sing his name at every trading post,\nThe driver who never once counted the", after: "!", correctAnswer: "cost" },
];

export const praiseSongs: Skill = {
  id: "g7-eng-r-praise-songs",
  code: "R.28",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Oral Literature: Praise Songs",
  description: "Identify the purpose and occasions for praise songs, discuss the relationship between singer and praised person, and appreciate their purpose in communication.",
  generate(rng) {
    const branch = randChoice(rng, ["occasion", "match", "relationship", "genre", "appreciate", "fill"] as const);
    const hint = "A praise song publicly celebrates a person's skill, courage, or service in front of the community.";

    if (branch === "occasion") {
      const entry = randChoice(rng, OCCASION_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: SONG,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, HONOUR_MATCH.map((h, i) => ({ id: `h${i}`, label: h.line })));
      const targets = shuffle(rng, HONOUR_MATCH.map((h, i) => ({ id: `h${i}`, label: h.honours })));
      const correctMap: Record<string, string> = {};
      HONOUR_MATCH.forEach((_, i) => (correctMap[`h${i}`] = `h${i}`));
      return {
        kind: "click-match",
        prompt: "Match each line of the praise song to the trait or achievement it honours.",
        passage: SONG,
        tokens,
        targets,
        correctMap,
        hint: "Each line singles out a specific quality of Kiptum as a driver.",
        explanation: HONOUR_MATCH.map((h) => `"${h.line}" honours ${h.honours.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "relationship") {
      const entry = randChoice(rng, RELATIONSHIP_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: SONG,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about why a community would compose and sing this kind of song about someone.",
        explanation: entry.explanation,
      };
    }

    if (branch === "genre") {
      const chosen = shuffle(rng, GENRE_CATEGORY);
      const items = chosen.map((c, i) => ({ id: `g${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`g${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each description by the type of oral literature it best matches.",
        items,
        buckets: [
          { id: "praise", label: "Praise Song" },
          { id: "lullaby", label: "Lullaby" },
          { id: "trickster", label: "Trickster Tale" },
        ],
        correctBucket,
        hint: "A praise song honours; a lullaby soothes; a trickster tale entertains through cleverness.",
        explanation: chosen.map((c) => `"${c.text}" describes a ${c.category === "praise" ? "praise song" : c.category === "lullaby" ? "lullaby" : "trickster tale"}.`).join(" "),
      };
    }

    if (branch === "appreciate") {
      const entry = randChoice(rng, APPRECIATE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: SONG,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word from the praise song.",
      passage: SONG,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Look for the exact word in the song above, and notice how it rhymes.",
      explanation: `The line reads: "...${entry.correctAnswer}${entry.after}"`,
    };
  },
};
