import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const READING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Library skills", description: "Knowing how to find and select reading materials in a library" },
  { skill: "Selecting relevant materials", description: "Choosing texts that closely match the theme being studied" },
  { skill: "Digital source access", description: "Using a computer, tablet, or phone to find grade-appropriate reading materials" },
  { skill: "Responsible digital device use", description: "Using electronic devices safely and appropriately when researching online" },
  { skill: "Note-taking on main points", description: "Writing brief notes on the main points of a text while reading" },
  { skill: "Summarising", description: "Stating the key points of a text in a shorter form after reading" },
  { skill: "Vocabulary identification", description: "Picking out new or unfamiliar words found in a text" },
  { skill: "Dictionary use", description: "Looking up a word's meaning in the dictionary" },
  { skill: "Building a vocabulary bank", description: "Collecting new words and their meanings in a glossary for later use" },
  { skill: "Sentence construction", description: "Using a newly learnt word correctly in a sentence of your own" },
  { skill: "Peer review of sentences", description: "Checking a classmate's sentences and giving feedback" },
  { skill: "Promoting a reading culture", description: "Reading widely and often to build language skills over time" },
];

const ACTIVITY_ITEMS: { text: string; bucket: string }[] = [
  { text: "Discussing ways to access materials on the theme from a library", bucket: "Finding reading materials" },
  { text: "Selecting reading materials that closely match the theme", bucket: "Finding reading materials" },
  { text: "Using a digital device to find grade-appropriate materials online", bucket: "Finding reading materials" },
  { text: "Using electronic devices responsibly while searching online", bucket: "Finding reading materials" },
  { text: "Identifying new vocabulary found in the text", bucket: "Building and using vocabulary" },
  { text: "Using the dictionary to find a new word's meaning", bucket: "Building and using vocabulary" },
  { text: "Building a vocabulary bank (glossary) of the new words found", bucket: "Building and using vocabulary" },
  { text: "Constructing a sentence using a newly learnt word", bucket: "Building and using vocabulary" },
  { text: "Making brief notes on the main points of the text", bucket: "Reviewing and summarising" },
  { text: "Summarising the key points of a text after reading it", bucket: "Reviewing and summarising" },
  { text: "Peer reviewing a classmate's sentences built from new vocabulary", bucket: "Reviewing and summarising" },
  { text: "Sharing feedback on a peer's use of new vocabulary in a sentence", bucket: "Reviewing and summarising" },
];

const READING_STEPS: { id: string; label: string }[] = [
  { id: "discuss", label: "Discuss ways of accessing reading materials on the theme from a library" },
  { id: "select", label: "Work jointly to select relevant reading materials based on the theme" },
  { id: "digital", label: "Use a digital or other electronic device to access grade-appropriate reading materials on the theme" },
  { id: "notes", label: "Read the materials and make brief notes on the main points of the texts" },
  { id: "vocab", label: "Identify vocabulary from the text and use the dictionary to find their meaning" },
  { id: "bank", label: "Team up to build a vocabulary bank of the new words identified" },
  { id: "sentences", label: "Use the new words to construct sentences" },
  { id: "review", label: "Peer review each other's sentences" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "Stating the key points of a text in shorter form after reading it is called", after: ".", answer: "summarising" },
  { before: "A collected list of new words and their meanings, built for communication, is called a", after: ".", answer: "glossary", accepted: ["vocabulary bank"] },
  { before: "Reading many texts often, in order to build language skills over time, is called developing a reading", after: ".", answer: "culture" },
  { before: "Checking a word's exact meaning in a reference book is called using the", after: ".", answer: "dictionary" },
  { before: "Writing brief notes on the main points of a text while reading is called", after: ".", answer: "note-taking", accepted: ["taking notes"] },
  { before: "Using a tablet, computer, or phone to find reading materials online is called using a", after: "device.", answer: "digital" },
  { before: "Checking a classmate's written sentences and giving them feedback is called peer", after: ".", answer: "review" },
  { before: "A place with a wide collection of books and materials for reading is called a", after: ".", answer: "library" },
  { before: "Choosing reading materials that closely match a given theme is called", after: "the materials.", answer: "selecting", accepted: ["selection"] },
  { before: "Being careful and safe while researching using electronic devices online shows cyber", after: "awareness.", answer: "security" },
  { before: "Using a newly learnt word correctly in a sentence you compose yourself is called sentence", after: ".", answer: "construction" },
  { before: "Materials that match a learner's grade level are described as grade", after: ".", answer: "appropriate" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is choosing a reading text for a project on the theme of safety at home. Which text should ${who} select?`,
      correct: "The text whose content most closely matches the safety-at-home theme and reading level",
      wrong: ["Any book available, regardless of its theme", "The shortest book on the library shelf", "A friend's chosen book, without checking whether it fits the theme"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After reading a text on safety at home, ${who} in ${where} writes a summary that copies whole sentences from the text word for word. What has ${who} actually done?`,
      correct: "Copied the text, not summarised it, since a summary restates the key points in shorter, own words",
      wrong: ["Written an excellent summary, since it uses the author's exact wording", "Summarised correctly, as long as it is under one page", "Completed the fastest possible way to summarise a text"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} guesses that a new word from a safety-at-home text means "danger" but wants to be sure before adding it to the vocabulary bank. What should ${who} do next?`,
      correct: "Check the guessed meaning against the dictionary before adding it to the vocabulary bank",
      wrong: ["Add the guessed meaning without checking it", "Skip the word since it seems difficult", "Copy the definition of a completely different word"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While searching online for reading materials on safety at home, ${who} in ${where} is offered a link promising "more information" from an unfamiliar, unrelated website. What should ${who} do?`,
      correct: "Use the device responsibly by staying on trusted, grade-appropriate sources related to the theme",
      wrong: ["Click the link anyway, since more information is always useful", "Share personal details on the site to access it faster", "Ignore whether the site is appropriate for the theme"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} peer reviews a classmate's sentence built from a new vocabulary word, but only checks the spelling. What is ${who} missing from a proper peer review?`,
      correct: "Checking whether the new word was actually used correctly in context, not just checking spelling",
      wrong: ["Nothing — spelling is the only thing peer review should check", "Peer review should only focus on handwriting neatness", "Peer review is optional once the sentence is written"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} reads several different texts on many themes throughout the term, not just for tests. What does this habit mainly build?`,
      correct: "A reading culture that strengthens language acquisition over time",
      wrong: ["No real benefit, since it is only useful right before a test", "Only spelling ability, and nothing else", "A skill that only matters for one subject"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is given one handout on safety at home but also visits the library to find more related material. Why is this additional step worthwhile?`,
      correct: "Accessing the library widens the range of reading materials available on the theme",
      wrong: ["It is unnecessary, since one handout is always enough", "Libraries only contain outdated materials", "It is only useful for older learners, not for this grade"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While reading a text on safety at home, ${who} in ${where} writes brief notes on the main points instead of copying the whole text. What is the benefit of this approach?`,
      correct: "Brief notes capture the main points without needing to reread the whole text later",
      wrong: ["It means the same as copying every word of the text", "It is unnecessary since the text can just be reread each time", "It is only useful for very long texts"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} constructs a sentence using a newly learnt safety-at-home word, then a classmate reviews it and suggests an improvement. What does this process mainly strengthen?`,
      correct: "Both vocabulary and sentence-construction skills, through peer feedback",
      wrong: ["Nothing, since the dictionary meaning already explained the word", "Only spelling, and no other language skill", "It guarantees the sentence will never need further correction"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is choosing between several texts to research safety at home and picks the one with the most colourful cover, without reading its title or blurb. What is the risk of this approach?`,
      correct: "The chosen text may not actually be relevant to the theme or at the right reading level",
      wrong: ["There is no risk, since covers always match a text's content", "It guarantees the text is grade-appropriate", "It saves time and is the recommended way to select materials"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} writes a summary of a safety-at-home text that includes personal opinions never mentioned in the passage itself. What has gone wrong?`,
      correct: "A summary should reflect the text's own key points, not opinions added on top",
      wrong: ["A summary should always be longer than the original text", "A summary should copy the introduction word for word", "A summary needs no real connection to the original text"],
    };
  },
];

export const safetyVocabularyReading: Skill = {
  id: "g7-il-r-safety-home",
  code: "R.3",
  subjectId: "indigenous-language",
  strandId: "g7-il-reading",
  grade: 7,
  title: "Safety at home: extensive reading and vocabulary building",
  description: "Select and read texts on safety at home, summarise their key points, and build a vocabulary glossary to enhance language acquisition.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Select a text that matches the theme, note its main points as you read, then confirm new words with a dictionary before adding them to your vocabulary bank.";

    if (branch === "match") {
      const chosen = shuffle(rng, READING_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each extensive reading or vocabulary-building skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, ACTIVITY_ITEMS).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `a${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`a${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each activity into the stage of extensive reading it belongs to.",
        items,
        buckets,
        correctBucket,
        hint: "Think about whether the activity happens while finding materials, while building vocabulary, or while reviewing and summarising.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, READING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of extensive reading and vocabulary building on safety at home in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: READING_STEPS.map((s) => s.id),
        hint: "Start by discussing access to materials, then select, read digitally, note points, find vocabulary, build a word bank, use the words, then review.",
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
