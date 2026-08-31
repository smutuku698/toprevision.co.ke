import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Amani sat at the back of the classroom, listening as the new rule was read aloud: girls could no longer join the debate club because \"it was too rowdy for them.\" Amani's hands felt hot with anger, but she said nothing that day. That evening, she wrote a careful letter to the headteacher, listing every reason the rule was unfair, and asked her classmates to sign it. Some pupils laughed and refused, saying it was pointless to argue with a teacher. Undeterred, Amani collected thirty signatures by Friday. She walked to the staffroom, knees trembling, and handed the letter to the headteacher herself. He read it slowly, then looked up and admitted he had not thought it through. The following Monday, the rule was reversed, and Amani was elected the debate club's first female captain. Her classmates who had once laughed now asked her how she found the courage to speak up.";

const EVENTS = [
  { id: "rule", label: "The headteacher announces that girls can no longer join the debate club" },
  { id: "letter", label: "Amani writes a letter listing reasons the rule is unfair" },
  { id: "signatures", label: "Amani collects thirty signatures from classmates" },
  { id: "deliver", label: "Amani delivers the letter to the headteacher herself" },
  { id: "reverse", label: "The headteacher reverses the rule" },
  { id: "captain", label: "Amani is elected the debate club's first female captain" },
];

const VOCAB_ITEMS: { word: string; meaning: string }[] = [
  { word: "undeterred", meaning: "not discouraged from continuing, despite difficulty" },
  { word: "trembling", meaning: "shaking, usually from fear or nervousness" },
  { word: "unfair", meaning: "not right or just; treating people unequally" },
  { word: "reversed", meaning: "changed to the opposite decision" },
];

const FILL_ITEMS = [
  { before: "That evening, she wrote a careful letter to the headteacher, listing every reason the rule was", after: ".", correctAnswer: "unfair" },
  { before: "Undeterred, Amani collected thirty", after: "by Friday.", correctAnswer: "signatures" },
  { before: "The following Monday, the rule was reversed, and Amani was elected the debate club's first female", after: ".", correctAnswer: "captain" },
];

const COMPREHENSION: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why did Amani decide to write a letter instead of staying silent?",
    correct: "She believed the rule banning girls from the debate club was unfair and wanted it changed",
    distractors: ["She wanted to get her classmates in trouble", "She was told to do so by the headteacher", "She wanted to leave the debate club permanently"],
    explanation: "The passage says Amani's hands felt hot with anger at the unfair rule, and she responded by writing a letter listing reasons it was unfair.",
  },
  {
    q: "What can you infer about Amani's feelings as she walked to the staffroom?",
    correct: "She was afraid but determined to speak up anyway",
    distractors: ["She was completely calm and unbothered", "She was excited and looking forward to the meeting", "She regretted writing the letter"],
    explanation: "Her 'knees trembling' shows fear, yet she still walked in and handed over the letter — this shows determination despite fear, which the text does not state directly.",
  },
  {
    q: "How did Amani's classmates' attitude change by the end of the story?",
    correct: "Those who once laughed at her now admired her courage and asked how she found it",
    distractors: ["They became angrier at Amani than before", "They stopped speaking to Amani entirely", "Nothing changed among her classmates"],
    explanation: "The final sentence states classmates who had laughed now asked how she found the courage to speak up — showing a shift from mockery to admiration.",
  },
  {
    q: "Before reading the ending, which outcome would you predict based on how the story develops?",
    correct: "The headteacher would reconsider the rule after seeing the collected signatures",
    distractors: ["The headteacher would expel Amani from school", "The debate club would be shut down completely", "Amani would give up before delivering the letter"],
    explanation: "The story builds Amani's persistence (writing, collecting signatures, delivering it herself), which signals a reasoned appeal likely to succeed rather than fail.",
  },
];

export const shortStoriesSequence: Skill = {
  id: "g8-eng-r-short-stories-sequence",
  code: "R.2",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Short Stories (Class Reader)",
  description: "Outline the sequence of events in a short story, use context clues to infer word meanings, and answer direct and inferential questions.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "fill", "match", "mc"] as const);
    const hint = "Follow the order of events closely and use surrounding words to work out the meaning of unfamiliar phrases.";

    if (branch === "order") {
      const items = shuffle(rng, EVENTS);
      return {
        kind: "ordering",
        prompt: "Arrange the events of the story in the order they happened.",
        instruction: "Click them in order.",
        passage: STORY,
        items,
        correctOrder: EVENTS.map((e) => e.id),
        hint: "The story moves from the unfair rule, through Amani's actions, to the rule being reversed.",
        explanation: EVENTS.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word from the story.",
        passage: STORY,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look for the exact word in the passage above.",
        explanation: `The passage reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, VOCAB_ITEMS.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, VOCAB_ITEMS.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of VOCAB_ITEMS) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each word from the story to its meaning, using context clues from the passage.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint: "Reread the sentence containing each word to work out its meaning from context.",
        explanation: VOCAB_ITEMS.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    const entry = randChoice(rng, COMPREHENSION);
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
  },
};
