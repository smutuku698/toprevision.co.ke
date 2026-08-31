import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Descriptive adjectives paired with a plain, undescriptive alternative — for spot-the-adjective and
// upgrade-the-sentence style questions.
const DESCRIPTIVE_PAIRS: { plain: string; descriptive: string; sentenceFragment: string }[] = [
  { plain: "fast", descriptive: "lightning-quick", sentenceFragment: "sprinter" },
  { plain: "big", descriptive: "roaring", sentenceFragment: "crowd" },
  { plain: "tired", descriptive: "exhausted", sentenceFragment: "runner" },
  { plain: "good", descriptive: "thunderous", sentenceFragment: "kick" },
  { plain: "loud", descriptive: "deafening", sentenceFragment: "cheer" },
];

const SENTENCES: { text: string; adjective: string }[] = [
  { text: "The lightning-quick sprinter shot off the starting blocks the moment the whistle blew.", adjective: "lightning-quick" },
  { text: "A roaring crowd filled the stadium as the two rival teams walked onto the pitch.", adjective: "roaring" },
  { text: "The exhausted runner crossed the finish line and collapsed onto the grass.", adjective: "exhausted" },
  { text: "Her thunderous kick sent the ball soaring past the goalkeeper's outstretched hands.", adjective: "thunderous" },
  { text: "A deafening cheer erupted the instant the final whistle confirmed their victory.", adjective: "deafening" },
];

// Descriptive vs plain versions of the same sentence, for categorizing.
const VERSIONS: { text: string; category: "descriptive" | "plain" }[] = [
  { text: "The athlete ran fast and won the race.", category: "plain" },
  { text: "The athlete streaked down the track like a gazelle, snatching victory in the final stride.", category: "descriptive" },
  { text: "The players kicked the ball around the field for a while.", category: "plain" },
  { text: "Sweat glistened on the players' faces as they battled fiercely for every inch of the muddy field.", category: "descriptive" },
  { text: "The match was good and the fans were happy.", category: "plain" },
  { text: "The gripping match kept the ecstatic fans on the edge of their seats until the final whistle.", category: "descriptive" },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the purpose of a descriptive composition about sports and games?",
    correct: "To use vivid, sensory language so the reader can picture the scene clearly",
    distractors: ["To list results and scores with no other detail", "To argue for one team over another", "To give step-by-step instructions for playing a game"],
  },
  {
    q: "Which sentence uses the most vivid descriptive language?",
    correct: "The exhausted runner staggered across the finish line, gasping for breath.",
    distractors: ["The runner finished the race.", "The runner ran and then stopped.", "The runner was in the race."],
  },
  {
    q: "Why is it important to choose appropriate descriptive words in writing?",
    correct: "They help the reader see, hear, and feel what is being described accurately",
    distractors: ["They make sentences longer with no other benefit", "They are only useful in poetry, never in essays", "They replace the need for a clear topic"],
  },
  {
    q: "Why is it important to consider personal interests when choosing a sport or game?",
    correct: "Because enjoying the activity makes a person more likely to participate and improve",
    distractors: ["Personal interest has no effect on participation", "Everyone must play the same sport regardless of interest", "Interest only matters for professional athletes"],
  },
];

export const sportsDescriptiveEssay: Skill = {
  id: "g8-il-w-sports",
  code: "W.7",
  subjectId: "indigenous-language",
  strandId: "g8-il-writing",
  grade: 8,
  title: "Sports and Games: Descriptive composition",
  description: "Identify descriptive words and write vivid descriptive sentences about sports and games.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-identify", "match", "categorize", "fill", "mc"] as const);

    if (branch === "mc-identify") {
      const entry = randChoice(rng, SENTENCES);
      const otherAdjectives = shuffle(rng, SENTENCES.filter((s) => s.adjective !== entry.adjective).map((s) => s.adjective)).slice(0, 3);
      const choices = shuffle(rng, [entry.adjective, ...otherAdjectives]);
      return {
        kind: "multiple-choice",
        prompt: `Which descriptive word in this sentence helps you picture the scene most vividly? "${entry.text}"`,
        choices,
        correctIndex: choices.indexOf(entry.adjective),
        layout: "list",
        hint: "Look for the word that appeals to the senses — sight, sound, or feeling — rather than a plain, ordinary word.",
        explanation: `"${entry.adjective}" is the vivid descriptive word in this sentence, helping the reader picture the scene clearly.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, DESCRIPTIVE_PAIRS.map((p) => ({ id: p.descriptive, label: p.descriptive })));
      const targets = shuffle(rng, DESCRIPTIVE_PAIRS.map((p) => ({ id: p.descriptive, label: `describes a ${p.sentenceFragment}, instead of the plain word "${p.plain}"` })));
      const correctMap: Record<string, string> = {};
      for (const p of DESCRIPTIVE_PAIRS) correctMap[p.descriptive] = p.descriptive;
      return {
        kind: "click-match",
        prompt: "Match each vivid descriptive word to what it describes.",
        tokens,
        targets,
        correctMap,
        hint: "Think about which noun in a sports scene each descriptive word would naturally describe.",
        explanation: DESCRIPTIVE_PAIRS.map((p) => `"${p.descriptive}" describes a ${p.sentenceFragment}, a more vivid choice than the plain word "${p.plain}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, VERSIONS);
      const buckets = [
        { id: "descriptive", label: "Vividly descriptive" },
        { id: "plain", label: "Plain, needs more description" },
      ];
      const items = chosen.map((v, i) => ({ id: `s${i}`, label: v.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((v, i) => (correctBucket[`s${i}`] = v.category));
      return {
        kind: "categorize",
        prompt: "Sort each sentence about sports by whether it is vividly descriptive or plain.",
        items,
        buckets,
        correctBucket,
        hint: "A descriptive sentence appeals to the senses with vivid words; a plain sentence just states the basic fact.",
        explanation: chosen.map((v) => `"${v.text}" — ${v.category === "descriptive" ? "vividly descriptive, using sensory detail" : "plain, stating only the basic fact"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: "In descriptive writing about sports, using vivid",
        after: "words helps the reader picture, hear, or feel the action clearly.",
        correctAnswer: "descriptive",
        acceptedAnswers: [],
        inputMode: "text",
        hint: "This word describes language that paints a picture for the reader.",
        explanation: "Using vivid descriptive words helps the reader picture, hear, or feel the sporting action being described.",
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
      hint: "Descriptive writing uses vivid, sensory words to help the reader picture the scene.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
