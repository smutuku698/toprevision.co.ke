import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const READING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Direct question", description: "A question whose answer is stated word for word in the text" },
  { skill: "Inferential question", description: "A question whose answer must be worked out from clues, since it isn't stated directly" },
  { skill: "Word bank", description: "A collected list of new vocabulary gathered while reading a passage" },
  { skill: "Context clues", description: "Hints in nearby sentences that help you guess a word's meaning" },
  { skill: "Dictionary confirmation", description: "Checking a guessed meaning against the dictionary's definition" },
  { skill: "Gap-fill practice", description: "Completing a sentence using vocabulary learnt from the passage" },
  { skill: "Digital source search", description: "Looking online for more information related to the passage's theme" },
  { skill: "Findings sharing", description: "Telling peers what new information was found through research" },
  { skill: "Reading for accuracy", description: "Reading closely enough to answer questions correctly, not just quickly" },
  { skill: "Indigenous knowledge appreciation", description: "Valuing what a text teaches about how people traditionally lived" },
];

const QUESTION_TYPES: { context: string; question: string; bucket: string }[] = [
  { context: "The passage says the family stores grain in the granary.", question: "Where does the family store grain?", bucket: "Direct question" },
  { context: "The granary stands on raised stones, though the passage never explains why.", question: "Why might the granary stand on raised stones?", bucket: "Inferential question" },
  { context: "The passage states elders sit on stools in the evening.", question: "What do elders sit on in the evening?", bucket: "Direct question" },
  { context: "The passage describes elders relaxing outside after visitors leave, without saying how they feel.", question: "How might the elders feel once the visitors have left?", bucket: "Inferential question" },
  { context: "The passage names the kitchen as the room where meals are cooked.", question: "Which room is used for cooking meals?", bucket: "Direct question" },
  { context: "The passage mentions visitors being served tea near the kitchen, without stating whether the family expected them.", question: "Did the family likely expect the visitors?", bucket: "Inferential question" },
  { context: "The passage states the shed is used to store farm tools.", question: "What is the shed used for?", bucket: "Direct question" },
  { context: "The passage says the store is kept locked, without explaining the reason.", question: "Why might the store be kept locked?", bucket: "Inferential question" },
  { context: "The passage states the family works together on the farm.", question: "Who works together on the farm, according to the passage?", bucket: "Direct question" },
  { context: "The passage describes chairs being brought out only when visitors arrive.", question: "What might this suggest about how often visitors come?", bucket: "Inferential question" },
  { context: "The passage states the house has several separate rooms for different purposes.", question: "According to the passage, do the home's rooms serve different purposes?", bucket: "Direct question" },
  { context: "The passage describes the family building a new shed just before harvest season, without stating why.", question: "Why might the family build a new shed just before harvest season?", bucket: "Inferential question" },
];

const READING_STEPS: { id: string; label: string }[] = [
  { id: "read", label: "Read comprehension texts related to the theme of indigenous homes" },
  { id: "bank", label: "Create a word bank of vocabulary from the passages" },
  { id: "infer", label: "Work with peers to infer the meaning of vocabulary from context" },
  { id: "dictionary", label: "Use the dictionary to confirm the meaning of vocabulary" },
  { id: "gapfill", label: "Fill in gaps in a passage using the vocabulary" },
  { id: "answer", label: "Read texts on indigenous homes and answer inferential questions" },
  { id: "search", label: "Search digital sources for information and share the findings with peers" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "A question whose answer is stated word for word in a text is called a", after: "question.", answer: "direct" },
  { before: "A question whose answer must be worked out from clues in a text is called an", after: "question.", answer: "inferential" },
  { before: "A collected list of new vocabulary gathered while reading a passage is called a", after: ".", answer: "word bank" },
  { before: "Hints in the surrounding sentences that help you guess a word's meaning are called context", after: ".", answer: "clues" },
  { before: "After guessing a word's meaning from context, you can confirm it using a", after: ".", answer: "dictionary" },
  { before: "Completing a sentence with a missing word using vocabulary from a passage is called a", after: "exercise.", answer: "gap-fill" },
  { before: "Searching online for more information related to a passage's theme is called a", after: "search.", answer: "digital", accepted: ["online"] },
  { before: "Telling classmates what new information you found through research is called sharing your", after: ".", answer: "findings" },
  { before: "Reading closely enough to answer questions correctly, not just quickly, is called reading for", after: ".", answer: "accuracy" },
  { before: "Understanding how people lived by reading about their homes builds appreciation for", after: "knowledge.", answer: "indigenous" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} reads a passage about a home in ${where} that says the granary stands on raised stones, but the passage never explains why. ${who} is asked why. What kind of question is this?`,
      correct: "An inferential question — the answer must be worked out from clues, since it isn't stated directly",
      wrong: ["A direct question, since it can be copied straight from the passage", "A question with no possible answer at all", "A question about vocabulary rather than content"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} guesses that "granary" means a grain store from the sentence around it, but wants to be sure before using the word in a sentence. What should ${who} do next?`,
      correct: "Check the guessed meaning against a dictionary",
      wrong: ["Assume the guess is correct without checking", "Skip the word since it was already guessed once", "Ask for the passage to be changed instead"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} keeps a running word bank while reading several passages on indigenous homes in ${where}. What is the main benefit of this habit?`,
      correct: "It builds a personal vocabulary list that can be reused in later writing and speaking",
      wrong: ["It replaces the need to read the passage at all", "It only matters if a test is happening that day", "It slows down understanding of the passage"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After reading a passage on indigenous homes, ${who} in ${where} searches online for more information and then tells classmates what was found. Why is this final step important?`,
      correct: "Sharing findings helps the whole class benefit from information one learner researched",
      wrong: ["It is unnecessary once the search is done", "It replaces the need to read the original passage", "It only matters if the information disagrees with the passage"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A passage states plainly that "the family stores grain in the granary." ${who} is then asked where the family stores grain. What kind of question is this?`,
      correct: "A direct question — the answer is stated word for word in the passage",
      wrong: ["An inferential question, since some thinking is required", "A question that cannot be answered from the passage", "A vocabulary-only question"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} completes a gap-fill exercise using vocabulary just learnt from a passage on indigenous homes. What does this activity mainly practise?`,
      correct: "Using newly learnt vocabulary correctly in context",
      wrong: ["Memorising the passage word for word", "Testing knowledge unrelated to the passage", "Replacing the need to understand the passage"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After reading several passages describing how families in ${where} traditionally built and used their homes, ${who} explains to a younger learner why certain structures existed. What has ${who} demonstrated?`,
      correct: "Appreciating indigenous knowledge gained through reading",
      wrong: ["Memorising facts with no understanding of their purpose", "Inventing details the passages never mentioned", "Ignoring what the passages actually said"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} does not know the word "shed" but reads that it "is used to store farm tools near the house." How can ${who} work out the word's meaning without a dictionary?`,
      correct: "By using context clues from the surrounding sentence",
      wrong: ["By guessing randomly with no evidence", "By skipping the word and the sentence entirely", "By assuming it means the same as \"kitchen\""],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is asked what the passage says visitors were served, and answers based only on what the passage states rather than on personal experience. What has ${who} done correctly?`,
      correct: "Answered a direct question using only the information given in the text",
      wrong: ["Answered based on outside knowledge instead of the text", "Skipped the question since it seemed too easy", "Guessed without reading the passage at all"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `A passage never states whether a family in ${where} expects visitors often, but describes chairs being brought out only when visitors arrive. What can ${who} reasonably infer?`,
      correct: "Visitors probably do not arrive very often, since chairs are not normally kept out",
      wrong: ["Visitors arrive every single day without exception", "The passage directly states how often visitors come", "No conclusion can be drawn from this detail"],
    };
  },
];

export const indigenousHomesReading: Skill = {
  id: "g7-il-r-indigenous-homes",
  code: "R.1",
  subjectId: "indigenous-language",
  strandId: "g7-il-reading",
  grade: 7,
  title: "Indigenous homes: reading comprehension",
  description: "Answer direct and inferential questions from texts about indigenous homes and build vocabulary using context and the dictionary.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A direct question's answer is stated in the text. An inferential question's answer must be worked out from clues.";

    if (branch === "match") {
      const chosen = shuffle(rng, READING_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each reading skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, QUESTION_TYPES).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `q${i}`, label: `${c.context} → "${c.question}"` }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`q${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each question as direct (answer stated in the text) or inferential (answer must be worked out).",
        items,
        buckets,
        correctBucket,
        hint: "Check whether the passage states the answer plainly, or only gives clues that require some thinking.",
        explanation: chosen.map((c) => `"${c.question}" — ${c.bucket.toLowerCase()}, since ${c.context.toLowerCase()}`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, READING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of reading a passage about indigenous homes for comprehension in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: READING_STEPS.map((s) => s.id),
        hint: "Read first, then build vocabulary, infer meaning, confirm with the dictionary, practise with gaps, answer questions, then research further.",
        explanation: READING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        acceptedAnswers: entry.accepted,
        inputMode: "text",
        hint,
        explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim(),
      };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, [entry.correct, ...entry.wrong]);
    return {
      kind: "multiple-choice",
      prompt: entry.prompt,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
