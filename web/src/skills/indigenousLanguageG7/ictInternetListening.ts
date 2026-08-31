import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const LISTENING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Listening for specific information", description: "Picking out particular facts or details mentioned in an oral text about internet access and use" },
  { skill: "Narrating key events", description: "Retelling the main happenings of a story in your own words, in pairs" },
  { skill: "Identifying pronouns", description: "Picking out words such as he, she, it, or they that stand in place of a noun" },
  { skill: "Using pronouns in sentences", description: "Writing new sentences that correctly use pronouns identified from the story" },
  { skill: "Inferring vocabulary meaning", description: "Working out what a new word means from how it is used in the story, without being told directly" },
  { skill: "Constructing sentences from new vocabulary", description: "Using a newly learnt word correctly in a sentence of your own" },
  { skill: "Observing digital device pictures", description: "Studying pictures of computers and other digital devices to discuss their use" },
  { skill: "Discussing the importance of the internet", description: "Talking about why internet access matters for communication" },
  { skill: "Peer discussion", description: "Talking with classmates about a story after listening to it" },
  { skill: "Noting down main points", description: "Recording the key ideas heard in an oral text so they are not forgotten" },
  { skill: "Recognising ICT's importance in life", description: "Understanding why information communication technologies matter in everyday life" },
  { skill: "Responsible internet use", description: "Using the internet and digital devices with discipline" },
];

const ICT_VOCAB_PRONOUNS: { text: string; bucket: string }[] = [
  { text: "ICT", bucket: "ICT vocabulary" },
  { text: "access", bucket: "ICT vocabulary" },
  { text: "technology", bucket: "ICT vocabulary" },
  { text: "internet", bucket: "ICT vocabulary" },
  { text: "site", bucket: "ICT vocabulary" },
  { text: "computers", bucket: "ICT vocabulary" },
  { text: "he", bucket: "Pronoun" },
  { text: "she", bucket: "Pronoun" },
  { text: "it", bucket: "Pronoun" },
  { text: "they", bucket: "Pronoun" },
  { text: "we", bucket: "Pronoun" },
  { text: "you", bucket: "Pronoun" },
  { text: "us", bucket: "Pronoun" },
  { text: "them", bucket: "Pronoun" },
];

const LISTENING_STEPS: { id: string; label: string }[] = [
  { id: "listen", label: "Listen to a story on the theme of internet access and use from a digital device and discuss with peers" },
  { id: "narrate", label: "Narrate the key events in the story, in pairs" },
  { id: "pronouns", label: "List pronouns from sentences in the story and share them" },
  { id: "pronounSentences", label: "Use the pronouns to write sentences" },
  { id: "infer", label: "Infer the meaning of new vocabulary as used in the story" },
  { id: "vocabSentences", label: "Use the new vocabulary to construct sentences" },
  { id: "pictures", label: "Observe pictures of digital devices and discuss their use" },
  { id: "importance", label: "Discuss the importance of internet in communication" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "The short form for Information Communication Technologies is", after: ".", answer: "ICT" },
  { before: "Being able to reach or use something, such as the internet, is called", after: ".", answer: "access" },
  { before: "The use of computers, phones, and other electronic tools to communicate is called", after: ".", answer: "technology" },
  { before: "A global network that connects computers so people can communicate and find information is called the", after: ".", answer: "internet" },
  { before: "A particular place on the internet that can be visited, such as a webpage, is called a", after: ".", answer: "site" },
  { before: "Electronic devices used to process information and access the internet are called", after: ".", answer: "computers" },
  { before: "A word that stands in place of a noun, such as \"he\" or \"she\", is called a", after: ".", answer: "pronoun", accepted: ["pronouns"] },
  { before: "Working out the meaning of a new word from how it is used in a story, rather than being told directly, is called", after: "the meaning.", answer: "inferring", accepted: ["inference"] },
  { before: "Retelling the key events of a story in your own words, in pairs, is called", after: "the story.", answer: "narrating" },
  { before: "Recording the key ideas heard in an oral text so they are not forgotten is called noting down the main", after: ".", answer: "points" },
  { before: "Talking with classmates about what was heard in a story is called peer", after: ".", answer: "discussion" },
  { before: "Using the internet and digital devices with discipline and self-control shows", after: ".", answer: "responsibility" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} listens to a story about internet access and use, then is asked the exact name of the website mentioned in the story. What should ${who} do?`,
      correct: "Listen for that specific detail among what is said, not just the general topic of the story",
      wrong: ["Guess the name without listening carefully", "Focus only on the overall topic and ignore small details", "Wait for a classmate to give the answer"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After listening to a story on internet access and use in ${where}, ${who} is asked what the story was mainly about, not for a small detail. What should ${who} focus on?`,
      correct: "The overall theme of the story, rather than a single isolated detail",
      wrong: ["Only the last sentence that was spoken", "One random detail picked without listening to the whole story", "Whatever a classmate says the story is about"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While listening to a story in ${where}, ${who} hears the word "site" for the first time and works out its meaning from how it is used in a sentence about visiting a webpage. What skill has ${who} used?`,
      correct: "Inferring the meaning of new vocabulary from how it is used in the story",
      wrong: ["Memorising the word without understanding what it means", "Ignoring the unfamiliar word and moving on", "Assuming the word means the same as \"internet\" without checking"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} learns the new word "access" from a story, then later uses it correctly in an original sentence about reaching a webpage. What has ${who} demonstrated?`,
      correct: "Constructing a sentence using newly learnt vocabulary from the story",
      wrong: ["Repeating the story's exact sentence word for word", "Using the word without knowing its meaning", "Avoiding new vocabulary altogether"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} hears the sentence "It connects people all over the world" in a story about the internet. What does the word "it" do in this sentence?`,
      correct: "It is a pronoun standing in place of a noun mentioned earlier, such as \"the internet\"",
      wrong: ["It is a brand-new noun introduced for the first time", "It is a verb describing an action", "It has no grammatical role in the sentence"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After listing pronouns from a story in ${where}, ${who} is asked to write an original sentence using one of them correctly. What should ${who} do?`,
      correct: "Use the pronoun in a new sentence so that it clearly refers to a person or thing",
      wrong: ["Copy the exact sentence the pronoun appeared in from the story", "Use the pronoun without it referring to anything", "Replace the pronoun with the noun it stands for instead"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `In pairs, ${who} and a partner in ${where} are asked to narrate the key events of a story about internet use they just listened to. What is the best way to do this?`,
      correct: "Retell the main events in their own words, in the order they happened",
      wrong: ["Add events that were never mentioned in the story", "Only describe the very last event and skip the rest", "Wait for the partner to narrate everything alone"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} observes pictures of computers and other digital devices as part of a listening lesson, then is asked to discuss their use. What should the discussion focus on?`,
      correct: "What each pictured device is used for, based on what is shown",
      wrong: ["Ignoring the pictures since they are not part of the spoken story", "Describing devices that are not shown in the pictures", "Assuming all devices are used for exactly the same purpose"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During a class discussion on why internet access matters in ${where}, ${who} says it helps people communicate and find information quickly, even across long distances. What has ${who} correctly recognised?`,
      correct: "The importance of Information Communication Technologies in everyday life",
      wrong: ["That the internet is useful only for entertainment", "That the internet's importance does not need to be discussed", "That access to information does not depend on the internet"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During group discussion after a listening lesson in ${where}, a classmate shares an opinion about internet use that is different from ${who}'s own view. What should ${who} do?`,
      correct: "Listen to and respect the classmate's different view during the discussion",
      wrong: ["Dismiss the opinion immediately because it differs", "Interrupt to only state a personal view", "Refuse to continue discussing since the views differ"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is given a digital device to use for a listening activity on internet access. What shows that ${who} is using it with discipline?`,
      correct: "Using the device only as instructed for the listening task, without misusing it",
      wrong: ["Using the device for anything at all during the lesson", "Ignoring instructions since it is just a listening activity", "Sharing the device without permission during the task"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While listening to a story in ${where}, ${who} keeps jotting down key points as the speaker talks instead of trying to remember everything afterward. Why is this a good habit?`,
      correct: "Noting down main points as they are heard helps recall them accurately later",
      wrong: ["It is unnecessary since memory alone is always reliable", "It replaces the need to listen to the story at all", "It only matters if the story will be tested the next day"],
    };
  },
];

export const ictInternetListening: Skill = {
  id: "g7-il-ls-ict-internet",
  code: "LS.2",
  subjectId: "indigenous-language",
  strandId: "g7-il-listening-speaking",
  grade: 7,
  title: "ICT and internet: listening for comprehension",
  description: "Listen to a story on internet access and use to find specific information, infer vocabulary meaning, identify pronouns, and recognise the importance of ICT in life.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Listen for the specific detail asked, work out new words from context, and notice pronouns standing in for nouns already mentioned.";

    if (branch === "match") {
      const chosen = shuffle(rng, LISTENING_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each listening skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, ICT_VOCAB_PRONOUNS).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `w${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`w${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each word as ICT vocabulary or a pronoun.",
        items,
        buckets,
        correctBucket,
        hint: "ICT vocabulary names technology or the internet; a pronoun stands in place of a noun.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, LISTENING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of the listening lesson on internet access and use in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: LISTENING_STEPS.map((s) => s.id),
        hint: "Start by listening and discussing, then narrate, work with pronouns, infer and use new vocabulary, observe pictures, and finally discuss importance.",
        explanation: LISTENING_STEPS.map((s) => s.label).join(" → "),
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
