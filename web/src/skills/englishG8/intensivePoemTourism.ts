import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface VocabItem {
  word: string;
  meaning: string;
}

interface JudgementItem {
  correct: string;
  distractors: string[];
}

interface NonverbalItem {
  quotedLine: string;
  correct: string;
  distractors: string[];
}

interface Statement {
  text: string;
  stated: boolean;
}

interface Poem {
  title: string;
  lines: string[];
  vocab: VocabItem[];
  detailFill: { before: string; after: string; correctAnswer: string };
  judgement: JudgementItem;
  nonverbal: NonverbalItem;
  statements: Statement[];
}

const POEMS: Poem[] = [
  {
    title: "Above the Rift",
    lines: [
      "We climbed at dawn, our boots upon the trail,",
      "past acacia trees bent low by the gale.",
      "From the vantage point, high above the plain,",
      "herds of elephant moved like a slow, grey train.",
      "The guide pointed east to a distant, jagged rim,",
      "'That is the crater,' he said, 'where old fires used to swim.'",
      "We counted three zebra, a lone giraffe browsing free,",
      "and wrote our names nowhere — we only came to see.",
      "Standing at the vantage point, wind against our face,",
      "I understood at last why people love this place.",
    ],
    vocab: [
      { word: "vantage point", meaning: "a place that gives a good, high view over an area" },
      { word: "gale", meaning: "a very strong wind" },
    ],
    detailFill: { before: "The guide pointed east to a distant, jagged", after: ".", correctAnswer: "rim" },
    judgement: {
      correct: "'I understood at last why people love this place.' — it shows the visit changed how the speaker saw the place",
      distractors: [
        "'We counted three zebra, a lone giraffe browsing free.' — it only lists what was seen, without showing a change of feeling",
        "'We climbed at dawn, our boots upon the trail.' — it only describes the start of the climb",
        "'The guide pointed east to a distant, jagged rim.' — it only gives a direction, not a feeling",
      ],
    },
    nonverbal: {
      quotedLine: "'That is the crater,' he said, 'where old fires used to swim.'",
      correct: "A slow, wondering tone with a wide gesture toward the horizon",
      distractors: ["A bored, rushed tone with no gestures", "An angry, shouting tone with clenched fists", "A whispering tone while looking down at the ground"],
    },
    statements: [
      { text: "The travellers climbed the trail at dawn.", stated: true },
      { text: "The guide pointed out a distant crater rim.", stated: true },
      { text: "The travellers saw a lone giraffe browsing.", stated: true },
      { text: "The travellers rode horses up the mountain.", stated: false },
      { text: "The guide warned them about a coming storm.", stated: false },
    ],
  },
  {
    title: "Dhow at Dawn",
    lines: [
      "The dhow tilted gently on the morning tide,",
      "its patched sail catching wind from side to side.",
      "Fishermen sang low as they hauled in their net,",
      "silver fish flashing, the best catch yet.",
      "Below the surface, the coral spread wide and bright,",
      "a garden of stone glowing orange in the light.",
      "Tourists leaned over, cameras held with care,",
      "trying to capture beauty found nowhere else, so rare.",
      "The dhow turned home as the sun climbed high,",
      "leaving footprints of foam beneath a wide open sky.",
    ],
    vocab: [
      { word: "dhow", meaning: "a traditional wooden sailing boat used along the coast" },
      { word: "coral", meaning: "a colourful, stony structure that grows underwater, like a garden of stone" },
    ],
    detailFill: { before: "Fishermen sang low as they hauled in their", after: ".", correctAnswer: "net" },
    judgement: {
      correct: "'trying to capture beauty found nowhere else, so rare.' — it shows the tourists valued the coast as a truly special place",
      distractors: [
        "'The dhow tilted gently on the morning tide.' — it only describes the boat's movement, not a feeling",
        "'The dhow turned home as the sun climbed high.' — it only tells when the boat returned",
        "'Fishermen sang low as they hauled in their net.' — it only describes an action, not an opinion",
      ],
    },
    nonverbal: {
      quotedLine: "a garden of stone glowing orange in the light.",
      correct: "Wide eyes and a soft, amazed tone of voice",
      distractors: ["A bored, flat expression with no change in tone", "A loud, angry voice with a scowl", "Crossed arms and a disappointed sigh"],
    },
    statements: [
      { text: "The dhow had a patched sail.", stated: true },
      { text: "Fishermen sang as they hauled in their net.", stated: true },
      { text: "Tourists took photographs of the coral.", stated: true },
      { text: "The tourists swam alongside the fishermen.", stated: false },
      { text: "A storm forced the dhow to turn back early.", stated: false },
    ],
  },
];

export const intensivePoemTourism: Skill = {
  id: "g8-eng-r-intensive-poem-tourism",
  code: "R.15",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Poem",
  description: "Extract information from tourism poems, infer unfamiliar words from context, judge a poem's message with evidence, and consider nonverbal cues.",
  generate(rng) {
    const poem = randChoice(rng, POEMS);
    const poemText = poem.lines.join("\n");
    const branch = randChoice(rng, ["fill", "match", "mc-nonverbal", "mc-judgement", "categorize"] as const);

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        passage: poemText,
        prompt: `Fill in the missing word to complete the detail from "${poem.title}".`,
        before: poem.detailFill.before,
        after: poem.detailFill.after,
        correctAnswer: poem.detailFill.correctAnswer,
        inputMode: "text",
        hint: "The exact word appears in the poem above — find the matching line.",
        explanation: `The poem's line reads: "${poem.detailFill.before} ${poem.detailFill.correctAnswer}${poem.detailFill.after}"`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, poem.vocab.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, poem.vocab.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of poem.vocab) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        passage: poemText,
        prompt: `Match each word from "${poem.title}" to its meaning, using clues from the poem.`,
        tokens,
        targets,
        correctMap,
        hint: "Look at how each word is used in the surrounding lines of the poem for clues to its meaning.",
        explanation: poem.vocab.map((v) => `"${v.word}" — ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "mc-nonverbal") {
      const choices = shuffle(rng, [poem.nonverbal.correct, ...poem.nonverbal.distractors]);
      return {
        kind: "multiple-choice",
        passage: poemText,
        prompt: `If reading "${poem.title}" aloud, which nonverbal cue would best bring out the message of the line "${poem.nonverbal.quotedLine}"?`,
        choices,
        correctIndex: choices.indexOf(poem.nonverbal.correct),
        layout: "list",
        hint: "Nonverbal cues — tone of voice, facial expression, and gesture — should match the feeling the words are creating.",
        explanation: `"${poem.nonverbal.correct}" best matches the feeling of this line.`,
      };
    }

    if (branch === "mc-judgement") {
      const choices = shuffle(rng, [poem.judgement.correct, ...poem.judgement.distractors]);
      return {
        kind: "multiple-choice",
        passage: poemText,
        prompt: `Which line from "${poem.title}" best supports the judgement that the visit was meaningful, and why?`,
        choices,
        correctIndex: choices.indexOf(poem.judgement.correct),
        layout: "list",
        hint: "An opinion or judgement about a poem should be backed by a specific line that shows a feeling or change, not just an action.",
        explanation: poem.judgement.correct,
      };
    }

    const chosen = shuffle(rng, poem.statements);
    const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.stated ? "Stated" : "Not stated"));
    return {
      kind: "categorize",
      passage: poemText,
      prompt: `Sort each statement into Stated in the poem or Not stated in the poem, for "${poem.title}".`,
      items,
      buckets: [
        { id: "Stated", label: "Stated in the poem" },
        { id: "Not stated", label: "Not stated in the poem" },
      ],
      correctBucket,
      hint: "Check each statement against the exact words of the poem — do not rely on what you assume must have happened.",
      explanation: chosen.map((s) => `"${s.text}" is ${s.stated ? "stated" : "not stated"} in the poem.`).join(" "),
    };
  },
};
