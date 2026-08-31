import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const READING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Library rules and regulations", description: "Guidelines followed to keep the library orderly and its resources available to everyone" },
  { skill: "Selecting reference materials", description: "Choosing library resources that are appropriate for extended reading on a topic" },
  { skill: "Searching the internet for reading materials", description: "Using online sources to find reading materials on a given theme" },
  { skill: "Summarising key points", description: "Writing a short account of the main ideas found in reading materials" },
  { skill: "Hard copy dictionary use", description: "Looking up the meaning of a word in a printed dictionary" },
  { skill: "Online dictionary use", description: "Looking up the meaning of a word using a digital or web-based dictionary" },
  { skill: "Preparing a personal reading list", description: "Keeping a record of books one intends to read or has read" },
  { skill: "Advocating library use", description: "Encouraging others to make use of library resources for reading" },
  { skill: "Accessing information from the internet", description: "Finding specific information online to support reading on a topic" },
  { skill: "Reading for general information", description: "Reading a text on a specific topic mainly to gather general knowledge about it" },
  { skill: "Selecting appropriate materials", description: "Choosing texts from the library that suit one's reading purpose and level" },
  { skill: "Responsible internet searching", description: "Searching the internet for reading materials in a careful and disciplined manner" },
];

const LIBRARY_ETIQUETTE: { text: string; bucket: string }[] = [
  { text: "Returning borrowed library books on time", bucket: "Good library practice" },
  { text: "Keeping voices low so as not to disturb other readers", bucket: "Good library practice" },
  { text: "Selecting reference materials that suit the reading topic before borrowing", bucket: "Good library practice" },
  { text: "Handling library books carefully to avoid damaging them", bucket: "Good library practice" },
  { text: "Asking the librarian for help locating materials on a theme", bucket: "Good library practice" },
  { text: "Searching the internet responsibly for reading materials on a given theme", bucket: "Good library practice" },
  { text: "Writing or scribbling notes inside a borrowed library book", bucket: "Poor library practice" },
  { text: "Talking loudly on a phone call inside the library reading area", bucket: "Poor library practice" },
  { text: "Removing library books without recording them as borrowed", bucket: "Poor library practice" },
  { text: "Tearing pages out of a library book to keep as personal notes", bucket: "Poor library practice" },
  { text: "Ignoring the library's rules and regulations because no one is watching", bucket: "Poor library practice" },
  { text: "Searching the internet for unrelated content instead of the assigned reading theme", bucket: "Poor library practice" },
];

const READING_STEPS: { id: string; label: string }[] = [
  { id: "rules", label: "Observe rules and regulations when in the library" },
  { id: "select", label: "Select reference materials from the library for extended reading" },
  { id: "search", label: "Search the internet for reading materials on a given theme" },
  { id: "summarize", label: "Make a summary of key points from the reading materials" },
  { id: "dictionary", label: "Use hard copy and online dictionaries to find the meaning of different vocabulary" },
  { id: "list", label: "Prepare a personal reading list of a collection of books" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "Guidelines that keep a library orderly and its resources available to everyone are called library", after: "and regulations.", answer: "rules" },
  { before: "Choosing library resources that are appropriate for extended reading on a topic is called selecting", after: "materials.", answer: "reference" },
  { before: "Using online sources to find reading materials on a given theme is called searching the", after: ".", answer: "internet" },
  { before: "Writing a short account of the main ideas found in reading materials is called making a", after: ".", answer: "summary" },
  { before: "A printed book used to look up the meaning of words is a hard copy", after: ".", answer: "dictionary" },
  { before: "A digital or web-based tool used to look up the meaning of words is an", after: "dictionary.", answer: "online" },
  { before: "A record of books one intends to read or has read is called a personal reading", after: ".", answer: "list" },
  { before: "Encouraging others to make use of library resources for reading is called", after: "library use.", answer: "advocating" },
  { before: "Reading a text on a specific topic mainly to gather general knowledge is called reading for general", after: ".", answer: "information" },
  { before: "Following library rules and regulations carefully shows", after: ".", answer: "responsibility" },
  { before: "Searching the internet for reading materials carefully and considerately shows", after: "for the resource.", answer: "respect" },
  { before: "Finding specific information online to support reading on a topic is called", after: "information from the internet.", answer: "accessing" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} needs books about a given theme for extended reading. What should ${who} do first in the library?`,
      correct: "Select reference materials that match the given theme",
      wrong: ["Borrow any book at random from the shelf", "Choose books based only on their cover design", "Wait for the librarian to choose without giving any input"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While searching the internet for reading materials on a given theme, ${who} in ${where} lands on a page that has nothing to do with the theme. What should ${who} do?`,
      correct: "Refine the search and look for content that actually relates to the theme",
      wrong: ["Use the unrelated page anyway since it appeared first", "Stop searching entirely once any result appears", "Copy information from the unrelated page into the reading notes"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} comes across an unfamiliar word while reading a library text, and has access to both a hard copy and an online dictionary. What should ${who} do?`,
      correct: "Use either the hard copy or the online dictionary to find the word's meaning",
      wrong: ["Guess the meaning without checking any dictionary", "Skip the word since it is not the main idea", "Wait until the next lesson to ask the teacher instead of checking"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After reading several library materials on a theme, ${who} in ${where} writes a short summary of the main ideas. What is the benefit of doing this?`,
      correct: "A summary helps recall the main ideas later without rereading everything",
      wrong: ["A summary should include every single sentence from the materials", "Summarising replaces the need to understand the materials at all", "Summaries are unnecessary since the materials stay in the library"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} keeps a personal reading list of books already read and books still to read. Why is this list useful?`,
      correct: "It helps track reading progress and choose books to read next",
      wrong: ["It is unnecessary since the librarian remembers every reader's choices", "It should only ever list books that have already been finished", "It has no real use once a book has been borrowed"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} regularly recommends library resources to classmates for general reading. What is ${who} doing?`,
      correct: "Advocating the use of library resources for general reading",
      wrong: ["Keeping good reading materials secret from classmates", "Discouraging others from visiting the library", "Recommending resources only outside of school"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} speaks loudly on a phone call inside the library reading area while others are reading. What has ${who} failed to observe?`,
      correct: "The library's rules and regulations that keep it orderly for all readers",
      wrong: ["A rule that only applies to younger learners", "A rule that only matters when the librarian is present", "There is no library rule about noise, so nothing was wrong"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is asked to search the internet for reading materials on a school theme, and stays focused on that theme rather than browsing unrelated sites. What value does this show?`,
      correct: "Respect — searching the internet responsibly for the assigned reading materials",
      wrong: ["Unity, since the search was done alone", "Responsibility only, unrelated to respect for the task", "No particular value, since it is just an internet search"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} needs just one specific fact for an assignment, rather than general background reading. What is the most efficient approach?`,
      correct: "Access that specific piece of information from the internet",
      wrong: ["Read an entire library book cover to cover to find the one fact", "Skip finding the fact since it is only one detail", "Guess the fact instead of searching for it"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} wants to read broadly around a topic just to build general knowledge about it, not to find one exact fact. What should ${who} do?`,
      correct: "Select library materials on that topic and read them for general information",
      wrong: ["Search only for one narrow fact online and stop there", "Avoid reading altogether since general knowledge cannot be tested", "Choose materials unrelated to the topic to save time"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} reads new information in a library text and pauses to consider whether it makes sense and fits with what is already known, rather than accepting it immediately. What is ${who} practising?`,
      correct: "Critical thinking when encountering new information in library texts",
      wrong: ["Ignoring the new information completely", "Accepting every claim in a text without question", "Rewriting the text instead of reading it"],
    };
  },
];

export const ictLibraryReading: Skill = {
  id: "g7-il-r-ict-internet",
  code: "R.2",
  subjectId: "indigenous-language",
  strandId: "g7-il-reading",
  grade: 7,
  title: "ICT and internet: extensive reading and library skills",
  description: "Select appropriate library materials, access information from the internet, use dictionaries to build vocabulary, and advocate for library use.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Choose materials that fit the theme, use a dictionary (hard copy or online) to confirm new words, and search the internet responsibly.";

    if (branch === "match") {
      const chosen = shuffle(rng, READING_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each library or reading skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, LIBRARY_ETIQUETTE).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `e${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`e${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each behaviour as good or poor library practice.",
        items,
        buckets,
        correctBucket,
        hint: "Think about whether the behaviour respects the library's rules, resources, and other readers.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, READING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of using the library and internet for extensive reading in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: READING_STEPS.map((s) => s.id),
        hint: "Start by observing rules, then select materials, search online, summarise, check the dictionary, then build a reading list.",
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
