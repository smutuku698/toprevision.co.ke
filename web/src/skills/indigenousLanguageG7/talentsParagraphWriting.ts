import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const PARAGRAPH_PARTS: { skill: string; description: string }[] = [
  { skill: "Topic sentence", description: "The sentence that introduces the paragraph's main idea, usually placed first" },
  { skill: "Supporting sentence", description: "A sentence that gives details, examples, or explanation related to the topic sentence" },
  { skill: "Coherence", description: "The quality of a paragraph where ideas flow logically and connect to one another" },
  { skill: "Concluding sentence", description: "A sentence that closes a paragraph by summarising or wrapping up its idea" },
  { skill: "Sentence strip", description: "A single sentence written on a separate strip of paper, used to build a paragraph" },
  { skill: "Jumbled sentences", description: "Sentences that are out of their correct, logical order" },
  { skill: "Reorganising sentences", description: "Rearranging jumbled sentence strips into a coherent paragraph" },
  { skill: "Paragraph unity", description: "The quality of a paragraph where every sentence relates to the same main idea" },
  { skill: "Peer review of a paragraph", description: "Checking a classmate's paragraph for coherence and clear ideas" },
  { skill: "Logical order", description: "Arranging sentences so that each one follows naturally from the one before it" },
  { skill: "Self-expression through writing", description: "Using a paragraph to share one's own ideas or experiences on a theme" },
  { skill: "Completing a paragraph", description: "Adding sentences after a topic sentence so the paragraph tells a full, connected idea" },
];

const SENTENCE_ROLE_ITEMS: { text: string; bucket: string }[] = [
  { text: "Kiptoo has always loved painting, and his talent for it became clear in Grade 5.", bucket: "Topic sentence" },
  { text: "He started by sketching birds and trees around his home.", bucket: "Supporting sentence" },
  { text: "Achieng discovered her gift for singing during a school assembly.", bucket: "Topic sentence" },
  { text: "She had always hummed songs quietly at home without telling anyone.", bucket: "Supporting sentence" },
  { text: "A craftsman has spent thirty years perfecting the art of woodwork.", bucket: "Topic sentence" },
  { text: "His carved stools and drums are sold at the local market every Friday.", bucket: "Supporting sentence" },
  { text: "Performing on stage for the first time changed how Wafula saw himself.", bucket: "Topic sentence" },
  { text: "He was nervous walking out in front of the whole school.", bucket: "Supporting sentence" },
  { text: "The Otieno family runs a small dance troupe together.", bucket: "Topic sentence" },
  { text: "They perform at weddings and community events across the county.", bucket: "Supporting sentence" },
  { text: "Nasirumbi was too shy to show her artwork to anyone in class.", bucket: "Topic sentence" },
  { text: "A teacher finally convinced her to enter one painting into a school exhibition.", bucket: "Supporting sentence" },
];

// Jumbled-sentence-strip pool: each set is a short paragraph (topic sentence first, then
// supporting sentences in logical order) drawn from the theme, per the JSON's explicit
// scopeNote that reordering jumbled sentence strips is testable content in its own right.
const PARAGRAPH_STRIP_SETS: { id: string; sentences: string[] }[] = [
  { id: "p1", sentences: [
    "Kiptoo has always loved painting, and his talent for it became clear in Grade 5.",
    "He started by sketching birds and trees around his home in Eldoret.",
    "Soon his teachers began displaying his drawings in the school corridor.",
    "Today, Kiptoo hopes to study art after finishing secondary school.",
  ] },
  { id: "p2", sentences: [
    "Achieng discovered her gift for singing during a school assembly in Kisumu.",
    "She had always hummed songs quietly at home without telling anyone.",
    "When she sang the national anthem, the whole school fell silent in surprise.",
    "Since then, she leads the school choir every week.",
  ] },
  { id: "p3", sentences: [
    "A craftsman in Kericho has spent thirty years perfecting the art of woodwork.",
    "He learned the craft from his grandfather as a young boy.",
    "His carved stools and drums are sold at the local market every Friday.",
    "Visitors travel from nearby towns just to buy his artwork.",
  ] },
  { id: "p4", sentences: [
    "Performing on stage for the first time changed how Wafula saw himself.",
    "He was nervous walking out in front of the whole school in Bungoma.",
    "Halfway through the performance, his fear turned into excitement.",
    "Now he volunteers for every stage performance the school holds.",
  ] },
  { id: "p5", sentences: [
    "The Otieno family runs a small dance troupe together in Homa Bay.",
    "Each evening after chores, they practise new dance routines in their compound.",
    "The youngest member of the troupe joined only last year.",
    "They perform at weddings and community events across the county.",
  ] },
  { id: "p6", sentences: [
    "Nasirumbi was too shy to show her artwork to anyone in class.",
    "She kept her paintings hidden in a folder under her desk in Kakamega.",
    "A teacher finally convinced her to enter one painting into a school exhibition.",
    "Her painting of the local market won first place.",
  ] },
  { id: "p7", sentences: [
    "Chebet's grandmother taught her the traditional craft of beadwork in Narok.",
    "At first, Chebet could only make simple bracelets.",
    "With practice, she began designing intricate necklaces for her neighbours.",
    "She now sells her beadwork at the weekend market.",
  ] },
  { id: "p8", sentences: [
    "Karanja's talent for drawing earned him recognition beyond his school in Machakos.",
    "A local newspaper printed one of his drawings after a county competition.",
    "Other schools began inviting him to demonstrate his drawing technique.",
    "He now mentors younger learners interested in art.",
  ] },
  { id: "p9", sentences: [
    "Mumbi's gift for acting first appeared in a class drama performance in Nyeri.",
    "She memorised her lines carefully the week before the performance.",
    "On stage, she delivered her lines with confidence and clear expression.",
    "Her teacher encouraged her to join the school drama club afterward.",
  ] },
  { id: "p10", sentences: [
    "Kiprop's talent for pottery began with simple clay pots made in Kitui.",
    "He experimented with different shapes using clay from a nearby riverbank.",
    "His pots became popular with families in the neighbourhood.",
    "He now teaches pottery skills to younger children on weekends.",
  ] },
  { id: "p11", sentences: [
    "Nekesa's talent for singing folk songs is well known in her village near Meru.",
    "She learned the songs from her grandmother during evening storytelling sessions.",
    "She now performs the folk songs at school cultural days.",
    "Younger learners often ask her to teach them the songs too.",
  ] },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "The sentence that introduces a paragraph's main idea, usually placed first, is called the", after: "sentence.", answer: "topic" },
  { before: "A sentence that gives details or examples related to the topic sentence is called a", after: "sentence.", answer: "supporting" },
  { before: "When a paragraph's ideas flow logically and connect to one another, the paragraph has", after: ".", answer: "coherence" },
  { before: "Sentences that are out of their correct, logical order are described as", after: ".", answer: "jumbled" },
  { before: "Rearranging jumbled sentence strips into their correct order is called", after: "the sentences.", answer: "reorganising", accepted: ["reorganizing"] },
  { before: "A single sentence written on a separate strip of paper is called a sentence", after: ".", answer: "strip" },
  { before: "A sentence that closes a paragraph by summarising its idea is called a", after: "sentence.", answer: "concluding" },
  { before: "When every sentence in a paragraph relates to the same main idea, the paragraph has", after: ".", answer: "unity" },
  { before: "Checking a classmate's paragraph for coherence and clear ideas is called", after: ".", answer: "peer review", accepted: ["peer reviewing"] },
  { before: "Arranging sentences so each one follows naturally from the one before it is called a", after: "order.", answer: "logical" },
  { before: "Using a paragraph to share one's own ideas or experiences on a theme is called", after: ".", answer: "self-expression" },
  { before: "A natural ability to do something well, such as singing or drawing, is called a", after: ".", answer: "talent" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} is given a set of jumbled sentence strips about a craftsman in ${where} and must reorganise them into a coherent paragraph. What should ${who} look for first?`,
      correct: "The topic sentence, since it should usually come first and introduce the paragraph's main idea",
      wrong: ["The shortest sentence in the set, regardless of its content", "The last sentence written on the page", "A sentence chosen at random to start with"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} writes a paragraph about a talent, but the sentences jump between unrelated ideas with no logical connection. What is ${who}'s paragraph missing?`,
      correct: "Coherence — ideas that flow logically and connect to one another",
      wrong: ["A title for the paragraph", "A large enough vocabulary", "Correct spelling of every word"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} reorganises jumbled sentence strips with a partner in ${where} and places a supporting detail sentence first, before the topic sentence. What problem does this create?`,
      correct: "The paragraph will not clearly introduce its main idea before giving details",
      wrong: ["No problem, since sentence order never affects meaning", "The paragraph becomes too short", "The paragraph will use too much vocabulary"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `After writing a topic sentence about a young singer's gift, ${who} is unsure what to write next. What should ${who} add?`,
      correct: "Supporting sentences that give details or examples related to the topic sentence",
      wrong: ["A completely new topic unrelated to the first sentence", "Another topic sentence introducing a different idea", "Nothing, since one sentence is a complete paragraph"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} and a partner peer review each other's paragraphs about talents and gifts in ${where}. What should ${who} check for?`,
      correct: "Whether the paragraph's sentences are coherent and connect to the same main idea",
      wrong: ["Whether the paragraph is written in the fastest handwriting", "Whether the paragraph uses the most words possible", "Whether the paragraph avoids using a topic sentence"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked to identify the parts of a paragraph in a sample text about a craftsman's woodwork. Which two parts should ${who} name?`,
      correct: "The topic sentence and the supporting sentences that follow it",
      wrong: ["Only the title and the author's name", "Only the first word and the last word", "Only the punctuation marks used"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} begins a paragraph about a dance troupe with a topic sentence, then adds unrelated sentences about a different family. What has ${who} failed to maintain?`,
      correct: "Paragraph unity — every sentence should relate to the same main idea",
      wrong: ["Correct spelling throughout the paragraph", "The use of a topic sentence", "Neat handwriting in the paragraph"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is given sentence strips describing a shy learner's artwork, jumbled out of order. Which sentence should ${who} place last if it summarises the outcome?`,
      correct: "A concluding sentence that wraps up the paragraph's idea",
      wrong: ["The topic sentence, since paragraphs may end however they begin", "A random supporting detail, since order does not matter", "The first sentence written on any strip"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} uses a topic sentence to begin a paragraph about a talent, then writes supporting sentences, but never finishes the paragraph's idea. What should ${who} do next?`,
      correct: "Complete the paragraph so it fully develops the idea introduced in the topic sentence",
      wrong: ["Start a completely new paragraph on an unrelated topic", "Leave the paragraph unfinished, since topic sentences are optional", "Delete the topic sentence instead of finishing the paragraph"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} and classmates discuss the parts of a paragraph before attempting to reorganise jumbled sentence strips in ${where}. Why is this discussion useful first?`,
      correct: "Understanding a paragraph's parts makes it easier to recognise the correct order of jumbled sentences",
      wrong: ["It replaces the need to ever reorganise sentence strips", "It only matters after the sentences are already reorganised", "It has no connection to reordering sentence strips"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} writes a paragraph about a craft learned from a grandmother, but every sentence begins with "And", making the paragraph hard to follow. What has ${who} most likely lost?`,
      correct: "Coherence, since disconnected sentence starts can make ideas harder to follow logically",
      wrong: ["The topic sentence, since it is still present", "The paragraph's length, since it did not get shorter", "The theme, since the paragraph is still about the correct topic"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is unsure whether a sentence strip belongs at the very start of a paragraph about talents and gifts. What clue tells ${who} it is likely the topic sentence?`,
      correct: "It introduces the paragraph's main idea rather than giving one specific detail",
      wrong: ["It is the strip with the fewest words", "It is written in capital letters", "It mentions a person's name"],
    };
  },
];

export const talentsParagraphWriting: Skill = {
  id: "g7-il-w-talents-gifts",
  code: "W.7",
  subjectId: "indigenous-language",
  strandId: "g7-il-writing",
  grade: 7,
  title: "Talents and gifts: writing for information",
  description: "Identify the parts of a paragraph, reorganise jumbled sentence strips, and write a short coherent paragraph on talents and gifts.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A paragraph starts with a topic sentence, followed by supporting sentences that connect logically to it.";

    if (branch === "match") {
      const chosen = shuffle(rng, PARAGRAPH_PARTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each paragraph-writing term to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SENTENCE_ROLE_ITEMS).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each sentence as a topic sentence or a supporting sentence.",
        items,
        buckets,
        correctBucket,
        hint: "A topic sentence introduces the paragraph's main idea; a supporting sentence gives a detail related to it.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      // Reorder a jumbled set of sentence strips into a coherent paragraph (topic sentence
      // first, then supporting sentences in their logical order) — the theme's explicit
      // testable content, per the scopeNote, rather than an abstract list of process steps.
      const set = randChoice(rng, PARAGRAPH_STRIP_SETS);
      const items = shuffle(rng, set.sentences.map((sentence, i) => ({ id: `${set.id}-${i}`, label: sentence })));
      return {
        kind: "ordering",
        prompt: "Reorganise these jumbled sentence strips to form a coherent paragraph.",
        instruction: "Click the topic sentence first, then the supporting sentences in a logical order.",
        items,
        correctOrder: set.sentences.map((_, i) => `${set.id}-${i}`),
        hint: "The topic sentence introduces the main idea and comes first; each supporting sentence should follow on logically from the one before it.",
        explanation: set.sentences.join(" "),
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
