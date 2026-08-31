import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const READING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Studying pictures before reading", description: "Looking at images related to the topic to predict what the text will be about" },
  { skill: "Taking turns reading aloud", description: "Sharing a text between readers so everyone gets a chance to read a section" },
  { skill: "Picking out the main idea", description: "Working out what a paragraph is mostly about, not just one detail in it" },
  { skill: "Answering comprehension questions", description: "Responding to questions that check understanding of a text just read" },
  { skill: "Building a vocabulary list", description: "Collecting new theme-related words met while reading a text" },
  { skill: "Constructing sentences from vocabulary", description: "Using a newly learnt word correctly in a sentence of your own" },
  { skill: "Peer reviewing sentences", description: "Checking a classmate's sentences for correct use of new vocabulary" },
  { skill: "Reader's theatre", description: "Performing a level-appropriate reading text aloud with expression for an audience" },
  { skill: "Valuing reading for lifelong learning", description: "Recognising reading for information as a skill useful throughout life, not just in school" },
  { skill: "Distinguishing main ideas from details", description: "Separating what a paragraph is mostly about from the smaller supporting facts in it" },
  { skill: "Discussing pictures with peers", description: "Talking through what images related to the theme suggest before reading begins" },
  { skill: "Collaborating on comprehension", description: "Working with classmates rather than alone to answer questions about a text" },
];

const MAIN_IDEA_ITEMS: { text: string; bucket: string }[] = [
  { text: "The paragraph is mainly about a young boy who discovers his talent for painting.", bucket: "Main idea" },
  { text: "He mixes his own colours using berries and clay from the riverbank.", bucket: "Supporting detail" },
  { text: "The paragraph mainly describes a girl's journey to becoming a skilled singer.", bucket: "Main idea" },
  { text: "She wakes up early each morning to practise scales before school.", bucket: "Supporting detail" },
  { text: "The paragraph is mostly about how a craftsman gained recognition for his woodwork.", bucket: "Main idea" },
  { text: "He sells his carved stools at the weekly market in the town centre.", bucket: "Supporting detail" },
  { text: "The paragraph mainly explains why performing on stage builds a young artist's confidence.", bucket: "Main idea" },
  { text: "The stage lights were bright, and the audience filled every seat.", bucket: "Supporting detail" },
  { text: "The paragraph is chiefly about a family that runs a small dance troupe together.", bucket: "Main idea" },
  { text: "The youngest member of the troupe joined only last year.", bucket: "Supporting detail" },
  { text: "The paragraph mainly tells how a shy learner overcame fear to showcase her artwork.", bucket: "Main idea" },
  { text: "Her artwork included three paintings of the local market.", bucket: "Supporting detail" },
];

const READING_STEPS: { id: string; label: string }[] = [
  { id: "pictures", label: "Study pictures of talents and gifts and discuss with peers" },
  { id: "read", label: "Take turns to read a text on talents and gifts" },
  { id: "mainidea", label: "Work jointly with peers to pick out the main ideas in each paragraph" },
  { id: "answer", label: "Work with others to answer comprehension questions" },
  { id: "vocablist", label: "Work with peers to create a list of vocabulary from the reading text" },
  { id: "sentences", label: "Construct sentences using the vocabulary identified" },
  { id: "peerreview", label: "Collaboratively peer review the sentences constructed" },
  { id: "theatre", label: "Conduct a reader's theatre on a level-appropriate reader" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "The central point that a paragraph is mostly about is called its main", after: ".", answer: "idea" },
  { before: "A natural ability to do something well is called a", after: ".", answer: "talent" },
  { before: "An ability someone is naturally given is also called a", after: ".", answer: "gift" },
  { before: "A person who practises a skill such as painting or music is called an", after: ".", answer: "artist" },
  { before: "A collection of new words met while reading a text is called a vocabulary", after: ".", answer: "list" },
  { before: "Using a new word correctly in a sentence of your own is called", after: "the vocabulary.", answer: "constructing", accepted: ["using"] },
  { before: "Reading a level-appropriate text aloud with expression for an audience is called reader's", after: ".", answer: "theatre" },
  { before: "Questions that check understanding of a text just read are called", after: "questions.", answer: "comprehension" },
  { before: "Valuing reading as a skill useful throughout one's life is called reading for", after: "learning.", answer: "lifelong" },
  { before: "A piece of created visual work, such as a painting, is called", after: ".", answer: "artwork" },
  { before: "An activity done in front of an audience, such as dancing, is called a", after: ".", answer: "performance" },
  { before: "A skill of making something by hand, such as weaving, is called a", after: ".", answer: "craft" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} studies pictures of talents and gifts with a classmate in ${where} before reading the text. What is the purpose of this step?`,
      correct: "To predict what the text will be about before reading it",
      wrong: ["To avoid having to read the text afterward", "To test how fast they can name items in the pictures", "To replace the need for a vocabulary list"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} reads a paragraph about a young craftsman and is asked to say what the paragraph is mostly about, not just one detail in it. What skill is being tested?`,
      correct: "Identifying the main idea of a paragraph",
      wrong: ["Recalling one specific detail only", "Copying the paragraph word for word", "Guessing without reading the paragraph"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After reading a text on talents and gifts in ${where}, ${who} answers comprehension questions based on personal opinion rather than what the text said. What mistake has ${who} made?`,
      correct: "Answering from opinion instead of from what the text actually says",
      wrong: ["Reading the text too many times", "Taking too long to answer the question", "Discussing the answer with a classmate first"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} collects new words such as "craft" and "artist" while reading a text and later writes original sentences with them. What has ${who} demonstrated?`,
      correct: "Building vocabulary from a text and using it correctly in new sentences",
      wrong: ["Memorising words without using them", "Ignoring new vocabulary while reading", "Copying sentences directly from the text"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} and a partner in ${where} exchange their newly constructed sentences to check for correct word use before submitting. What is this step called?`,
      correct: "Peer review",
      wrong: ["Reader's theatre", "Silent reading", "Picture study"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} takes part in a reader's theatre performance of a level-appropriate text about a young singer. What does this activity mainly develop?`,
      correct: "Reading aloud with expression for an audience",
      wrong: ["Reading silently without anyone listening", "Memorising the text without understanding it", "Skipping difficult words while performing"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} reads only when required for a test and stops reading for enjoyment once the exam is over. What value is ${who} missing?`,
      correct: "Recognising the value of reading for lifelong learning",
      wrong: ["Recognising the value of reading only for exams", "Recognising that reading is unnecessary after school", "Recognising that pictures are more useful than text"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `A paragraph in a text from ${where} opens with a general statement about a dance troupe, then gives supporting details. ${who} is asked to identify the sentence that best summarises the whole paragraph. Which sentence should ${who} choose?`,
      correct: "The general opening sentence that introduces what the paragraph is about",
      wrong: ["A specific supporting detail mentioned partway through", "The very last word of the paragraph", "A sentence copied from a different paragraph"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} takes turns reading a text aloud with classmates in ${where}, but reads far ahead without waiting for others. What has ${who} overlooked?`,
      correct: "Taking fair, equal turns so everyone gets a chance to read",
      wrong: ["Reading with correct pronunciation", "Discussing the pictures before reading", "Making a vocabulary list"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `After finishing a text on talents and gifts, ${who} and classmates work jointly to answer comprehension questions rather than working alone. Why is this collaborative approach useful?`,
      correct: "Working together helps catch answers or ideas one learner alone might miss",
      wrong: ["It removes the need to read the text carefully", "It means only one learner needs to understand the text", "It replaces the need to answer any questions individually"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} constructs a sentence using the word "gift", but the sentence uses it to mean a wrapped present rather than a natural ability, which does not match the reading text's theme. What should ${who} reconsider?`,
      correct: "Using the word in the sense the reading text actually used it",
      wrong: ["Avoiding the word entirely from now on", "Using a completely unrelated word instead", "Asking to skip the vocabulary exercise"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} reads a text about an artist and successfully identifies the main idea of each paragraph separately, rather than treating the whole text as one idea. What skill has ${who} shown?`,
      correct: "Identifying main ideas paragraph by paragraph, not just the overall topic",
      wrong: ["Identifying only the very first sentence of the text", "Skipping paragraphs that seem difficult", "Guessing the topic without reading any paragraph"],
    };
  },
];

export const talentsReading: Skill = {
  id: "g7-il-r-talents-gifts",
  code: "R.7",
  subjectId: "indigenous-language",
  strandId: "g7-il-reading",
  grade: 7,
  title: "Talents and gifts: reading for information",
  description: "Identify main ideas in paragraphs about talents and gifts, build theme vocabulary, and construct sentences for communication.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Read each paragraph fully, then ask what it is mostly about — that is its main idea, not just one detail in it.";

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
      const chosen = shuffle(rng, MAIN_IDEA_ITEMS).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `m${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`m${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each sentence as the main idea of its paragraph or a supporting detail.",
        items,
        buckets,
        correctBucket,
        hint: "Check whether the sentence introduces what the whole paragraph is about, or gives one specific fact within it.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, READING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of reading a text about talents and gifts for comprehension in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: READING_STEPS.map((s) => s.id),
        hint: "Start with the pictures, then read, find main ideas, answer questions, list vocabulary, build sentences, review, then perform.",
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
