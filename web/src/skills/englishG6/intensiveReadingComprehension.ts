import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, cap } from "./readingShared";

// Merges 5 near-identical generic "Intensive Reading" sub-strands (Cultural and Religious Celebrations,
// Etiquette - Telephone, Lifestyle Diseases, Proper Use of Leisure Time, Sports - Indoor Games) per
// curriculum-reference/grade-6/english.json's buildPlan.consolidationRationale — same comprehension
// mechanic (predict, infer meaning from context, answer direct/inferential questions, retell/summarise).

type PassageItem = { title: string; theme: string; passage: string; directQ: string; directAnswer: string; directWrong: string[]; inferentialQ: string; inferentialAnswer: string; inferentialWrong: string[] };

const PASSAGES: PassageItem[] = [
  {
    title: "The Reunion",
    theme: "Cultural and Religious Celebrations",
    passage: "Every December, the whole Otieno family gathers at their grandmother's homestead near Kisumu for a big reunion. Cousins who live far away travel for two days just to attend. This year, grandmother wore her best kitenge dress and prepared a huge pot of stew. When the last car arrived at sunset, everyone cheered and hugged.",
    directQ: "Where does the Otieno family reunion take place?",
    directAnswer: "at their grandmother's homestead near Kisumu",
    directWrong: ["at a hotel in Nairobi", "at a church in Mombasa", "at a school in Nakuru"],
    inferentialQ: "What can you infer about how much the family values this reunion?",
    inferentialAnswer: "They value it deeply — cousins travel two days just to attend",
    inferentialWrong: ["They don't care much about it", "Only grandmother enjoys it", "It happens by accident every year"],
  },
  {
    title: "A Careless Phone Call",
    theme: "Etiquette - Telephone",
    passage: "Amina's phone rang while she was in the school library. Instead of stepping outside, she answered loudly right at her desk, disturbing everyone around her. The librarian gently reminded her about phone etiquette. Amina apologised and quickly stepped into the corridor to finish her call quietly.",
    directQ: "Where was Amina when her phone rang?",
    directAnswer: "in the school library",
    directWrong: ["in the school field", "in the dining hall", "at home"],
    inferentialQ: "What does Amina's reaction to the librarian's reminder suggest about her character?",
    inferentialAnswer: "She is willing to correct her mistake and behave politely",
    inferentialWrong: ["She ignores advice from adults", "She never uses phones politely", "She was angry with the librarian"],
  },
  {
    title: "Grandfather's New Diet",
    theme: "Lifestyle Diseases",
    passage: "After the doctor told grandfather he had high blood pressure, he changed his habits completely. He now walks every morning, eats less salt, and avoids sugary tea. His family noticed he seems more energetic these days, even though he sometimes misses his old favourite foods.",
    directQ: "What health condition did the doctor diagnose grandfather with?",
    directAnswer: "high blood pressure",
    directWrong: ["diabetes", "a heart attack", "a headache"],
    inferentialQ: "What can you infer about grandfather's attitude towards his health?",
    inferentialAnswer: "He is committed to improving his health despite missing old habits",
    inferentialWrong: ["He ignores the doctor's advice completely", "He no longer cares about his family", "He has given up on staying healthy"],
  },
  {
    title: "Wasted Holiday",
    theme: "Proper Use of Leisure Time",
    passage: "During the first week of the holidays, Otieno spent every day loitering at the shopping centre with friends who kept skipping school. By the second week, he realised he had learned nothing new and felt bored. He decided to join the community football club instead, and his afternoons became far more enjoyable.",
    directQ: "What did Otieno do during the first week of the holidays?",
    directAnswer: "loitered at the shopping centre with friends",
    directWrong: ["practised football every day", "read books at the library", "helped at his grandmother's farm"],
    inferentialQ: "Why did Otieno decide to join the football club?",
    inferentialAnswer: "He realised loitering was boring and wanted a more meaningful use of his time",
    inferentialWrong: ["His parents forced him to join", "He wanted to avoid his friends completely", "The shopping centre closed down"],
  },
  {
    title: "The Chess Champion",
    theme: "Sports - Indoor Games",
    passage: "Chebet had never played chess before joining the indoor games club. At first, she lost every match. Instead of giving up, she practised every evening with her older brother. Six months later, she surprised everyone by winning the school chess tournament.",
    directQ: "Who did Chebet practise chess with?",
    directAnswer: "her older brother",
    directWrong: ["her class teacher", "her best friend", "the chess club coach"],
    inferentialQ: "What quality helped Chebet become the school chess champion?",
    inferentialAnswer: "Persistence — she kept practising instead of giving up after losing",
    inferentialWrong: ["Natural talent with no practice needed", "Luck during the tournament", "Copying her brother's exact moves"],
  },
];

// Vocabulary-in-context items drawn from the 5 merged themes, testing inferring meaning from context clues.
const CONTEXT_VOCAB: { sentence: string; word: string; meaning: string; wrong: string[] }[] = [
  { sentence: "The whole family gathered for the annual homecoming, greeting each other warmly after a year apart.", word: "homecoming", meaning: "a celebration marking someone's return home", wrong: ["a type of food", "a religious building", "a kind of dance"] },
  { sentence: "He always answers the phone in a courteous tone, greeting the caller politely before continuing.", word: "courteous", meaning: "polite and respectful", wrong: ["angry and loud", "confused and unsure", "silent and shy"] },
  { sentence: "The doctor warned that untreated high blood pressure can lead to a serious stroke.", word: "stroke", meaning: "a sudden loss of brain function due to blocked blood flow", wrong: ["a type of medicine", "a swimming technique only", "a mild headache"] },
  { sentence: "Instead of squandering his free afternoons, he decided to learn a new hobby.", word: "squandering", meaning: "wasting something carelessly", wrong: ["saving carefully", "sharing generously", "planning wisely"] },
  { sentence: "The front runner in the race pulled ahead early and never lost the lead.", word: "front runner", meaning: "the competitor most likely to win", wrong: ["the last competitor", "the referee", "a spectator"] },
];

export const intensiveReadingComprehension: Skill = {
  id: "g6-eng-reading-intensive-comprehension",
  code: "R.2",
  subjectId: "english",
  strandId: "g6-eng-reading",
  grade: 6,
  title: "Intensive Reading — Comprehension",
  description: "Predict events, make connections to real life, infer word meaning from context, and answer direct and inferential questions about short passages on celebrations, etiquette, lifestyle diseases, leisure time and sports.",
  generate(rng) {
    const branch = randChoice(rng, ["direct-question", "inferential-question", "vocab-in-context", "retell-ordering", "predict-mc"] as const);

    if (branch === "direct-question") {
      const p = randChoice(rng, PASSAGES);
      const choices = shuffle(rng, [p.directAnswer, ...p.directWrong]);
      return {
        kind: "multiple-choice",
        prompt: p.directQ,
        passage: p.passage,
        choices,
        correctIndex: choices.indexOf(p.directAnswer),
        layout: "list",
        hint: "The answer is stated directly in the passage — look for it carefully.",
        explanation: `The passage states this directly: "${p.directAnswer}".`,
      };
    }

    if (branch === "inferential-question") {
      const p = randChoice(rng, PASSAGES);
      const choices = shuffle(rng, [p.inferentialAnswer, ...p.inferentialWrong]);
      return {
        kind: "multiple-choice",
        prompt: p.inferentialQ,
        passage: p.passage,
        choices,
        correctIndex: choices.indexOf(p.inferentialAnswer),
        layout: "list",
        hint: "This answer isn't stated directly — you must reason from the clues given.",
        explanation: `Based on the clues in the passage, ${p.inferentialAnswer.charAt(0).toLowerCase() + p.inferentialAnswer.slice(1)}.`,
      };
    }

    if (branch === "vocab-in-context") {
      const item = randChoice(rng, CONTEXT_VOCAB);
      const choices = shuffle(rng, [item.meaning, ...item.wrong]);
      return {
        kind: "multiple-choice",
        prompt: `Based on the sentence, what does "${item.word}" most likely mean?`,
        passage: item.sentence,
        choices,
        correctIndex: choices.indexOf(item.meaning),
        layout: "list",
        hint: "Use the surrounding words in the sentence as clues to the meaning.",
        explanation: `"${item.word}" means: ${item.meaning}. The surrounding context supports this meaning.`,
      };
    }

    if (branch === "retell-ordering") {
      const p = randChoice(rng, PASSAGES);
      // Break the passage into its natural sentence order for a "retell in order" exercise.
      const sentences = p.passage.split(". ").map((s, i, arr) => (i < arr.length - 1 ? s + "." : s));
      const items = sentences.map((s, i) => ({ id: `s-${i}`, label: s }));
      return {
        kind: "ordering",
        prompt: `Arrange these sentences from "${p.title}" in the order they happened.`,
        instruction: "Click the sentences in the correct order to retell the story.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: "Think about what happened first, then next, then last.",
        explanation: `The events happen in this order: ${sentences.join(" ")}`,
      };
    }

    const p = randChoice(rng, PASSAGES);
    const name = randChoice(rng, KENYAN_NAMES);
    const correctPrediction = `A passage titled "${p.title}" about ${p.theme.toLowerCase()} likely describes ${p.directAnswer.includes("family") || p.theme === "Cultural and Religious Celebrations" ? "a personal experience related to " + p.theme.toLowerCase() : "events connected to " + p.theme.toLowerCase()}.`;
    const wrongPredictions = PASSAGES.filter((other) => other.title !== p.title)
      .slice(0, 3)
      .map((other) => `A passage titled "${p.title}" likely describes ${other.theme.toLowerCase()}, unrelated to its actual title.`);
    const choices = shuffle(rng, [correctPrediction, ...wrongPredictions]);
    return {
      kind: "multiple-choice",
      prompt: `${cap(name)} sees only the title "${p.title}" before reading. Based on the title alone, what is the most reasonable prediction about the passage's topic?`,
      choices,
      correctIndex: choices.indexOf(correctPrediction),
      layout: "list",
      hint: "A good prediction uses only the title and general knowledge — not information you haven't read yet.",
      explanation: `The title "${p.title}" reasonably suggests a passage connected to ${p.theme.toLowerCase()}, which matches the passage's real content.`,
    };
  },
};
