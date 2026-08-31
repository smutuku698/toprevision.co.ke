import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 5.0 Traditional Foods, sub-strand 5.2 Extensive Reading:
// Fiction and Non-Fiction Materials (1000-1250 words). Focus: select relevant materials, scan for
// specific information, skim to establish relevance, judge a text by language and interest.
// See curriculum-reference/grade-5/english.json.

const EXTRACTS: { text: string; kind: "fiction" | "non-fiction"; why: string }[] = [
  { text: "Once, a clever hare tricked a hyena into carrying a heavy pot of githeri all the way up the hill.", kind: "fiction", why: "it tells an imagined story with animal characters" },
  { text: "Millet is a cereal crop. It grows well in dry areas and is used to make porridge and ugali.", kind: "non-fiction", why: "it gives true facts about a real crop" },
  { text: "Njeri closed her eyes and wished the empty sufuria would fill itself with hot pilau.", kind: "fiction", why: "it describes an imagined wish inside a story" },
  { text: "To cook muthokoi, soak the maize and beans overnight, then boil them for about two hours.", kind: "non-fiction", why: "it is a set of real instructions (a recipe)" },
  { text: "The talking cassava root refused to be dug up until the farmer sang it a song.", kind: "fiction", why: "cassava cannot talk; this is make-believe" },
  { text: "Avocados are rich in healthy fats. They ripen a few days after being picked.", kind: "non-fiction", why: "it states facts you could check" },
  { text: "In the village of Endless Harvest, the yams grew as tall as houses.", kind: "fiction", why: "the place and the giant yams are invented" },
  { text: "Sweet potatoes and arrow roots are root vegetables often eaten at breakfast in Kenya.", kind: "non-fiction", why: "it reports a real custom and real foods" },
];

const READING_TASKS: { task: string; strategy: "skim" | "scan"; why: string }[] = [
  { task: "You want to know quickly whether a book is about traditional Kenyan foods before you borrow it.", strategy: "skim", why: "skimming means reading fast to get the general idea" },
  { task: "You need to find the exact number of minutes to boil githeri in a recipe.", strategy: "scan", why: "scanning means searching for one specific piece of information" },
  { task: "You are looking for the word 'muthokoi' on a page to see where it is explained.", strategy: "scan", why: "you are hunting for one keyword" },
  { task: "You flick through a magazine to decide which article to read first.", strategy: "skim", why: "you are getting a quick overview of each article" },
  { task: "You want the price of maize flour listed somewhere in a market report.", strategy: "scan", why: "you need one exact figure" },
  { task: "You read the first line of each paragraph to see what a chapter covers.", strategy: "skim", why: "you are sampling the text for its main ideas" },
];

export const fictionNonFiction: Skill = {
  id: "g5-eng-reading-fiction-non-fiction",
  code: "R.5",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Fiction and Non-Fiction; Skimming and Scanning",
  description: "Tell fiction from non-fiction, and choose whether to skim (read fast for the gist) or scan (search for one detail) for a reading task.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-kind", "fill-strategy", "sort-kind", "match", "order-select", "reason"] as const);

    if (branch === "mc-kind") {
      const e = randChoice(rng, EXTRACTS);
      const correct = e.kind === "fiction" ? "Fiction" : "Non-fiction";
      const { choices, correctIndex } = mcFromCluster(rng, correct, [e.kind === "fiction" ? "Non-fiction" : "Fiction"], 1);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "whether this extract is fiction or non-fiction")}\n"${e.text}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Fiction is an invented story. Non-fiction gives true information you could check.",
        explanation: `This is ${correct.toLowerCase()} — ${e.why}.`,
      };
    }

    if (branch === "fill-strategy") {
      const t = randChoice(rng, READING_TASKS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `"skim" or "scan" for this task`),
        before: `${t.task}\nYou would `,
        after: " the text.",
        correctAnswer: t.strategy,
        acceptedAnswers: [t.strategy],
        inputMode: "text",
        hint: "Skim = read fast for the general idea. Scan = search for one exact detail.",
        explanation: `You would ${t.strategy} — ${t.why}.`,
      };
    }

    if (branch === "sort-kind") {
      const pool = shuffle(rng, EXTRACTS).slice(0, 6);
      const items = pool.map((e, i) => ({ id: `e${i}`, label: e.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((e, i) => (correctBucket[`e${i}`] = e.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each extract is fiction or non-fiction"),
        items,
        buckets: [
          { id: "fiction", label: "Fiction (invented story)" },
          { id: "non-fiction", label: "Non-fiction (true information)" },
        ],
        correctBucket,
        hint: "Talking animals, magic, invented places → fiction. Facts, instructions, real customs → non-fiction.",
        explanation: "Fiction is made up. Non-fiction reports things that are true or that really happen.",
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, READING_TASKS).slice(0, 5);
      const tokens = shuffle(rng, pool.map((t, i) => ({ id: `p${i}`, label: t.task })));
      const targets = shuffle(rng, pool.map((t, i) => ({ id: `p${i}`, label: `${t.strategy} the text — ${t.why}` })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_t, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "reading task to skimming or scanning"),
        tokens,
        targets,
        correctMap,
        hint: "Do you need the whole idea (skim) or one fact (scan)?",
        explanation: pool.map((t) => `"${t.task}" → ${t.strategy}`).join("  "),
      };
    }

    if (branch === "order-select") {
      const steps = [
        { id: "title", label: "Read the title and look at the cover" },
        { id: "skim", label: "Skim the back cover and first page to get the general idea" },
        { id: "scan", label: "Scan the contents page for a topic you want" },
        { id: "sample", label: "Read one paragraph to check the language is at your level" },
        { id: "decide", label: "Decide whether to borrow the book" },
      ];
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps for choosing a book from a collection"),
        instruction: "Click the steps in the correct order.",
        items: shuffle(rng, steps),
        correctOrder: ["title", "skim", "scan", "sample", "decide"],
        hint: "You get a quick overall idea before you check the details and the language level.",
        explanation: "Title/cover → skim for the gist → scan the contents → sample the language → decide.",
      };
    }

    // reason — Apply: pick the strategy for a described situation.
    const t = randChoice(rng, READING_TASKS);
    const correct = t.strategy === "skim" ? "Skim the text — read it fast for the general idea." : "Scan the text — search for the one detail you need.";
    const { choices, correctIndex } = mcFromCluster(rng, correct, [t.strategy === "skim" ? "Scan the text — search for the one detail you need." : "Skim the text — read it fast for the general idea.", "Read every word slowly from start to finish.", "Do not read it at all."], 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, t.task, "What is the best way to read?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Whole idea → skim. One exact fact → scan.",
      explanation: `${correct} (${t.why})`,
    };
  },
};
