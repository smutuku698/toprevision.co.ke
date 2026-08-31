import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const READING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Skimming", description: "Reading quickly through a whole passage to identify its main idea" },
  { skill: "Scanning", description: "Reading quickly through a passage to locate specific target words or details" },
  { skill: "Readers' theatre", description: "Reading a passage aloud together as a group, each person taking on a role" },
  { skill: "Substitution table", description: "A table used to build new sentences by swapping different vocabulary into the same pattern" },
  { skill: "Vocabulary flash cards", description: "Cards listing new words picked out from a passage, used for practice and revision" },
  { skill: "Language games", description: "Digital activities that build fluency with vocabulary learnt from a passage" },
  { skill: "Story selection", description: "Working jointly with peers to choose a passage to read" },
  { skill: "Comprehension questions", description: "Questions about a passage that peers work together to answer" },
  { skill: "Reading for information", description: "Reading a passage in order to gain facts and knowledge, not just for entertainment" },
  { skill: "Peer collaboration in reading", description: "Working with others to discuss and practise vocabulary and ideas from a passage" },
];

const STRATEGY_ITEMS: { text: string; bucket: string }[] = [
  { text: "Reading quickly through the whole passage just to figure out what it is mainly about", bucket: "Skimming" },
  { text: "Running your eyes down the passage looking only for the name of a farm tool mentioned", bucket: "Scanning" },
  { text: "Glancing over the passage first, before reading closely, to get a general sense of the story", bucket: "Skimming" },
  { text: "Searching the passage specifically for every place the word \"cattle\" appears", bucket: "Scanning" },
  { text: "Reading through the passage once quickly to decide what the main idea is, without stopping at each word", bucket: "Skimming" },
  { text: "Looking through the passage only to find the names of the characters mentioned", bucket: "Scanning" },
  { text: "Going over the whole story briefly before answering \"what is this passage mostly about?\"", bucket: "Skimming" },
  { text: "Hunting through the passage for specific vocabulary items to list on flash cards", bucket: "Scanning" },
  { text: "Reading the passage fast to grasp its overall theme before a class discussion", bucket: "Skimming" },
  { text: "Picking out particular target words related to the farm theme while ignoring the rest of the passage", bucket: "Scanning" },
  { text: "Getting a general impression of a story about farm life before deciding how to summarise it", bucket: "Skimming" },
  { text: "Searching quickly for one specific number mentioned about a farm's harvest", bucket: "Scanning" },
];

const READING_STEPS: { id: string; label: string }[] = [
  { id: "select", label: "Work jointly with peers to select a story on the theme of the farm" },
  { id: "skim", label: "Skim through the passage to identify the main idea" },
  { id: "scan", label: "Scan the passage for specific information, such as character names and vocabulary items" },
  { id: "theatre", label: "Conduct a readers' theatre to read the passage aloud" },
  { id: "answer", label: "Work with peers to answer questions based on the passage" },
  { id: "flashcards", label: "Select vocabulary from the passage and list it on flash cards" },
  { id: "substitution", label: "Make sentences using the vocabulary from a substitution table" },
  { id: "games", label: "Work collaboratively to play language games involving the vocabulary on digital devices" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "Reading quickly through a passage just to find its main idea is called", after: ".", answer: "skimming" },
  { before: "Reading quickly through a passage to locate specific words or details is called", after: ".", answer: "scanning" },
  { before: "A performance where learners read a passage aloud together, each taking a role, is called a readers'", after: ".", answer: "theatre" },
  { before: "A table used to build new sentences by swapping different vocabulary words into the same pattern is called a substitution", after: ".", answer: "table" },
  { before: "Cards listing new vocabulary from a passage, used for practice, are called flash", after: ".", answer: "cards" },
  { before: "The overall point that a passage is mostly about is called its main", after: ".", answer: "idea" },
  { before: "Specific words that a scanner looks for in a passage, related to the theme, are called", after: "words.", answer: "target" },
  { before: "Reading a passage in order to gain facts and knowledge is called reading for", after: ".", answer: "information" },
  { before: "Digital activities that build fluency with new vocabulary are called language", after: ".", answer: "games" },
  { before: "Working with classmates to choose which farm-themed story to read is described as selecting a story", after: ".", answer: "jointly" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} needs to find only the name of the farm animal mentioned in a passage, without reading every word. Which strategy should ${who} use?`,
      correct: "Scanning — searching quickly for that specific word",
      wrong: ["Skimming, since it also involves reading quickly", "Reading the passage slowly, word for word, from the start", "Guessing the animal's name without reading the passage"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `Before reading a long passage about a farm in ${where} closely, ${who} quickly runs their eyes over it to decide what it is mainly about. What strategy is ${who} using?`,
      correct: "Skimming — reading quickly to get the main idea",
      wrong: ["Scanning, since it also involves reading quickly", "Memorising every word in the passage", "Ignoring the passage until question time"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s teacher in ${where} asks the class what a farm passage is mostly about, without asking about any single detail. Which strategy best fits answering this question?`,
      correct: "Skimming, since it is used to find the overall main idea",
      wrong: ["Scanning, since it is used to find one exact word", "Reading only the last sentence of the passage", "Copying the first paragraph word for word"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} is asked to find every place the word "granary" appears in a farm passage in ${where}. Which strategy fits this task?`,
      correct: "Scanning, since it is used to locate a specific word",
      wrong: ["Skimming, since it is used to find the main idea instead", "Reading the passage backwards", "Guessing where the word might appear"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During a readers' theatre in ${where}, ${who}'s group reads a farm passage aloud, each member taking a different role. What is the main purpose of this activity?`,
      correct: "To practise reading the passage aloud together and build comprehension through performance",
      wrong: ["To finish reading the passage as fast as possible", "To replace the need to understand the passage's content", "To let only one member do all the reading"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} uses a substitution table to build new sentences from vocabulary in a farm passage. What does a substitution table actually let ${who} do?`,
      correct: "Swap different vocabulary words into the same sentence pattern to build new sentences",
      wrong: ["Copy sentences from the passage exactly as written", "Translate the passage into another language", "Skip constructing any sentences at all"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After selecting vocabulary from a farm passage in ${where} and listing it on flash cards, ${who}'s group then plays a language game with the words on a digital device. What does this final step mainly build?`,
      correct: "Fluency and familiarity with the vocabulary already picked out from the passage",
      wrong: ["A completely new set of vocabulary unrelated to the passage", "A reason to avoid re-reading the passage", "Skill at using the digital device rather than the vocabulary"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After reading a farm passage in ${where}, ${who} is asked a comprehension question and answers based only on what the passage actually stated. What has ${who} done correctly?`,
      correct: "Answered based on the passage's actual content rather than a guess",
      wrong: ["Answered using outside knowledge instead of the passage", "Guessed an answer that sounded reasonable", "Skipped the question since it seemed too easy"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} reads a passage about how climate affects farm practices, purely to gain accurate information rather than for entertainment. What value is ${who} showing?`,
      correct: "Appreciating the importance of reading for information",
      wrong: ["Reading only to pass the time", "Avoiding the passage since it is not a story", "Reading only when a test is expected"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} skims a farm passage in ${where} and identifies the main idea, but still needs to find the exact number of cattle mentioned. What should ${who} do next?`,
      correct: "Switch to scanning the passage for that specific detail",
      wrong: ["Skim the passage again, since skimming finds every detail", "Stop reading, since the main idea has already been found", "Guess the number without looking back at the passage"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} collects several sample stories on the farm theme before choosing one to read closely together. What is this first step an example of?`,
      correct: "Working jointly with peers to select a story before reading it",
      wrong: ["Skimming the story for its main idea", "Scanning the story for target words", "Writing a summary of the story before reading it"],
    };
  },
];

export const farmReadingStrategies: Skill = {
  id: "g7-il-r-the-farm",
  code: "R.6",
  subjectId: "indigenous-language",
  strandId: "g7-il-reading",
  grade: 7,
  title: "The farm: reading strategies (skimming and scanning)",
  description: "Apply skimming to find the main idea and scanning to locate target words in texts about the farm.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Skimming reads quickly for the main idea. Scanning reads quickly to locate one specific word or detail.";

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
      const chosen = shuffle(rng, STRATEGY_ITEMS).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each reading activity as skimming (for the main idea) or scanning (for a specific word or detail).",
        items,
        buckets,
        correctBucket,
        hint: "Check whether the activity is about the passage's overall idea, or about locating one exact word or detail.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, READING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of using reading strategies on a farm-themed passage in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: READING_STEPS.map((s) => s.id),
        hint: "Start by selecting a story, then skim it, scan it, read it as a theatre, answer questions, collect vocabulary, build sentences, then play language games.",
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
