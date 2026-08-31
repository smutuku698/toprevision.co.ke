import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const POEM_A = {
  title: "Maasai Mara at Dawn",
  text:
    "The grass bends gold beneath the rising sun,\nA thousand wildebeest begin to run.\nWe stand in silence, cameras held still,\nAwed by a world untouched by human will.\n\nBut fences creep closer with every year,\nAnd wild spaces shrink as towns draw near.\nLet visitors come, but let them tread with care,\nSo grandchildren still find wonder waiting there.",
};

const POEM_B = {
  title: "The Stones of Gedi",
  text:
    "Among the ruins where old traders walked,\nCoral walls remember all they talked.\nSwahili merchants, ships from lands afar,\nTheir voices echo where the doorways are.\n\nSome visitors rush by with barely a glance,\nMissing the history in every stony stance.\nBut those who pause and listen to the past,\nCarry its lessons long after they've passed.",
};

const IDEA_QUESTIONS: { poem: typeof POEM_A; q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    poem: POEM_A,
    q: "What is the central idea of \"Maasai Mara at Dawn\"?",
    correct: "The Mara's wildlife and wild spaces are beautiful but increasingly threatened, and deserve careful protection",
    distractors: ["Wildebeest are dangerous animals that should be avoided", "Tourists should never be allowed to visit the Mara", "Fences are always good for protecting wildlife"],
    explanation: "The poem admires the wildebeest and untouched world in the first stanza, then warns that 'fences creep closer... and wild spaces shrink,' calling for careful visits so future generations can still see it.",
  },
  {
    poem: POEM_B,
    q: "What is the central idea of \"The Stones of Gedi\"?",
    correct: "Historic sites hold stories worth pausing to appreciate, and rushing past them means missing valuable lessons",
    distractors: ["Old ruins have no value to modern visitors", "Coral walls are stronger than any other building material", "Swahili traders never actually existed"],
    explanation: "The poem contrasts visitors who 'rush by with barely a glance' with those who 'pause and listen to the past' and carry its lessons — showing the value of appreciating history rather than rushing through it.",
  },
];

const LESSON_QUESTIONS: { poem: typeof POEM_A; q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    poem: POEM_A,
    q: "What lesson does \"Maasai Mara at Dawn\" want readers to take away?",
    correct: "Visit and enjoy natural wonders responsibly, so they remain for future generations",
    distractors: ["Avoid nature reserves completely to protect them", "Wildlife will always be safe no matter what humans do", "Tourism should be banned everywhere"],
    explanation: "The poem's closing lines, 'let them tread with care, so grandchildren still find wonder waiting there,' directly express the lesson of responsible enjoyment of nature.",
  },
  {
    poem: POEM_B,
    q: "What lesson does \"The Stones of Gedi\" want readers to take away?",
    correct: "Take time to appreciate and learn from historical sites rather than passing them by quickly",
    distractors: ["Historical ruins should be demolished to make room for new buildings", "Only professional historians can learn anything from ruins", "It is pointless to visit old ruins at all"],
    explanation: "The poem contrasts hurried visitors with those who 'pause and listen to the past' and 'carry its lessons long after they've passed,' teaching readers to value slowing down at historic sites.",
  },
];

const PARAPHRASE_ITEMS: { poem: typeof POEM_A; correctParaphrase: string; distractors: string[] }[] = [
  {
    poem: POEM_A,
    correctParaphrase: "Barriers are increasingly being built, and natural, untouched areas are getting smaller as nearby towns expand",
    distractors: [
      "Fences protect towns from wild animals crossing over at night",
      "Wild spaces are growing larger every year as towns shrink",
      "Cameras are no longer allowed near the fences",
    ],
  },
  {
    poem: POEM_B,
    correctParaphrase: "People who take the time to stop and pay attention to the past keep its lessons with them well after they leave",
    distractors: [
      "People who rush through the ruins remember the most history",
      "The ruins forget everything the traders once said",
      "No visitor has ever paused to look at the ruins",
    ],
  },
];

const STANZA_ORDER_A = [
  { id: "a1", label: "The grass bends gold beneath the rising sun," },
  { id: "a2", label: "A thousand wildebeest begin to run." },
  { id: "a3", label: "We stand in silence, cameras held still," },
  { id: "a4", label: "Awed by a world untouched by human will." },
];

const STANZA_ORDER_B = [
  { id: "b1", label: "Among the ruins where old traders walked," },
  { id: "b2", label: "Coral walls remember all they talked." },
  { id: "b3", label: "Swahili merchants, ships from lands afar," },
  { id: "b4", label: "Their voices echo where the doorways are." },
];

const RHYME_FILLS = [
  { poem: POEM_A, before: "The grass bends gold beneath the rising sun,\nA thousand wildebeest begin to", after: ".", correctAnswer: "run" },
  { poem: POEM_B, before: "Among the ruins where old traders walked,\nCoral walls remember all they", after: ".", correctAnswer: "talked" },
];

export const poemsLessons: Skill = {
  id: "g8-eng-r-poems-lessons",
  code: "R.30",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Poems",
  description: "Identify the ideas in poems, derive the lessons they teach, and recognise the role of poems in addressing societal issues.",
  generate(rng) {
    const branch = randChoice(rng, ["idea", "lesson", "paraphrase", "match", "order", "fill"] as const);
    const hint = "A poem's message often becomes clear when you look at how it moves from description in the first stanza to a call to action or reflection in the second.";

    if (branch === "idea") {
      const entry = randChoice(rng, IDEA_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: entry.poem.text,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "lesson") {
      const entry = randChoice(rng, LESSON_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: entry.poem.text,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "paraphrase") {
      const entry = randChoice(rng, PARAPHRASE_ITEMS);
      const line =
        entry.poem === POEM_A
          ? "\"But fences creep closer with every year, and wild spaces shrink as towns draw near.\""
          : "\"But those who pause and listen to the past, carry its lessons long after they've passed.\"";
      const choices = shuffle(rng, [entry.correctParaphrase, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which sentence best paraphrases (says in different words) this line from "${entry.poem.title}"?\n${line}`,
        passage: entry.poem.text,
        choices,
        correctIndex: choices.indexOf(entry.correctParaphrase),
        layout: "list",
        hint: "A good paraphrase keeps the same meaning as the original line, just using different words.",
        explanation: `The line means: ${entry.correctParaphrase}.`,
      };
    }

    if (branch === "order") {
      const useA = rng() < 0.5;
      const stanza = useA ? STANZA_ORDER_A : STANZA_ORDER_B;
      const poem = useA ? POEM_A : POEM_B;
      const items = shuffle(rng, stanza);
      return {
        kind: "ordering",
        prompt: `Arrange the lines of the first stanza of "${poem.title}" in the correct order.`,
        instruction: "Click them in order.",
        items,
        correctOrder: stanza.map((s) => s.id),
        hint: "Read each line and think about which idea would naturally come first, and which lines rhyme at the end of pairs.",
        explanation: stanza.map((s) => s.label).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, RHYME_FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing rhyming word to complete the line.",
        passage: entry.poem.text,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look at the poem above and find the word that completes the rhyme.",
        explanation: `The full line reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    const poem = randChoice(rng, [POEM_A, POEM_B]);
    const pairs =
      poem === POEM_A
        ? [
            { phrase: "\"A thousand wildebeest begin to run\"", meaning: "Describes the vast scale of wildlife migration in the Mara" },
            { phrase: "\"A world untouched by human will\"", meaning: "Shows the Mara's wilderness as still natural and undisturbed" },
            { phrase: "\"Fences creep closer with every year\"", meaning: "Warns that development is steadily reducing wild space" },
            { phrase: "\"Let them tread with care\"", meaning: "Calls for visitors to act responsibly toward nature" },
          ]
        : [
            { phrase: "\"Coral walls remember all they talked\"", meaning: "Suggests the ruins hold the history of past conversations and trade" },
            { phrase: "\"Ships from lands afar\"", meaning: "Shows Gedi was once connected to distant trading regions" },
            { phrase: "\"Rush by with barely a glance\"", meaning: "Describes visitors who fail to appreciate the site's history" },
            { phrase: "\"Carry its lessons long after they've passed\"", meaning: "Shows attentive visitors take away lasting knowledge" },
          ];
    const tokens = shuffle(rng, pairs.map((p, i) => ({ id: `p${i}`, label: p.phrase })));
    const targets = shuffle(rng, pairs.map((p, i) => ({ id: `p${i}`, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    pairs.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
    return {
      kind: "click-match",
      prompt: `Match each line from "${poem.title}" to what it means.`,
      passage: poem.text,
      tokens,
      targets,
      correctMap,
      hint,
      explanation: pairs.map((p) => `${p.phrase} — ${p.meaning.toLowerCase()}.`).join(" "),
    };
  },
};
