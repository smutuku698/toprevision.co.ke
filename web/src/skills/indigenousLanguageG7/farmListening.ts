import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const ADVERBS: { adverb: string; description: string }[] = [
  { adverb: "quickly", description: "In a fast manner, taking little time" },
  { adverb: "carefully", description: "With close attention, so as to avoid mistakes or damage" },
  { adverb: "daily", description: "Happening or done every day" },
  { adverb: "early", description: "Before the usual or expected time" },
  { adverb: "slowly", description: "With little speed; unhurriedly" },
  { adverb: "gently", description: "In a soft, mild way, without using force" },
  { adverb: "regularly", description: "At even, predictable intervals, again and again" },
  { adverb: "safely", description: "Without risk of harm, injury, or danger" },
  { adverb: "patiently", description: "Calmly, without becoming annoyed while waiting" },
  { adverb: "eagerly", description: "With keen interest and enthusiasm" },
];

const FARM_VOCAB: { text: string; bucket: string }[] = [
  { text: "vegetables", bucket: "Plants grown on the farm" },
  { text: "fruits", bucket: "Plants grown on the farm" },
  { text: "crops", bucket: "Plants grown on the farm" },
  { text: "trees", bucket: "Plants grown on the farm" },
  { text: "dairy products", bucket: "Things produced from farm animals" },
  { text: "meat", bucket: "Things produced from farm animals" },
  { text: "farm", bucket: "The farm itself, its animals, people, and tools" },
  { text: "farm tools", bucket: "The farm itself, its animals, people, and tools" },
  { text: "farm animals", bucket: "The farm itself, its animals, people, and tools" },
  { text: "cattle", bucket: "The farm itself, its animals, people, and tools" },
  { text: "farmer", bucket: "The farm itself, its animals, people, and tools" },
];

const LISTENING_STEPS: { id: string; label: string }[] = [
  { id: "listen", label: "Listen to an audio recording and pick out vocabulary items based on the theme of the farm" },
  { id: "bank", label: "Work jointly to create a vocabulary bank of the words picked out from the text" },
  { id: "comprehension", label: "Collaborate with peers to answer comprehension questions based on the text" },
  { id: "flashcards", label: "Work jointly to read adverbs aloud from flash cards" },
  { id: "roleplay", label: "Collaboratively role play various adverbs from a chart" },
  { id: "song", label: "Compose a song related to the farm theme using the vocabulary and adverbs learnt" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "A place where crops are grown and animals such as cattle are kept is called a", after: ".", answer: "farm" },
  { before: "Plants such as maize and beans that are cultivated by a farmer are called", after: ".", answer: "crops" },
  { before: "Milk, yoghurt, and cheese made from a cow's milk are known as", after: "products.", answer: "dairy" },
  { before: "The flesh of an animal eaten as food is called", after: ".", answer: "meat" },
  { before: "Hoes, pangas, and rakes used for work on the farm are called farm", after: ".", answer: "tools" },
  { before: "Tall plants with a trunk and branches grown on a farm for fruit, wood, or shade are called", after: ".", answer: "trees" },
  { before: "Cows, goats, and chickens kept on a farm are known as farm", after: ".", answer: "animals" },
  { before: "Cows and bulls kept mainly for milk, meat, or work are known as", after: ".", answer: "cattle" },
  { before: "A person who grows crops and keeps animals for a living is called a", after: ".", answer: "farmer" },
  { before: "Milking the cows every single day, without missing one, is done", after: ".", answer: "daily" },
  { before: "Waking before the usual time to feed the animals means waking up", after: ".", answer: "early" },
  { before: "Waiting calmly for seeds to germinate, without getting frustrated, is waiting", after: ".", answer: "patiently" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} listens to an audio recording about the farm and must record every new theme-related word they hear, along with its meaning. What should go into their vocabulary bank?`,
      correct: "Every new theme-related word they hear, along with its meaning",
      wrong: ["Only words the group already knew beforehand", "Any word at all, whether or not it relates to the farm", "Only the adverbs, since nouns are not tested"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While listening to a recording in ${where}, ${who} hears the sentence "The farmer fed the cattle early every morning." Which word is the adverb telling us when the action happened?`,
      correct: `"early" — it tells when the farmer fed the cattle`,
      wrong: [`"farmer" — because it is the subject of the sentence`, `"cattle" — because it is the animal being fed`, `"fed" — because it is the main verb`],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After listening to a passage describing a farm in ${where}, ${who} is asked which fruits were mentioned. What is the best way for ${who} to answer?`,
      correct: "Name only the fruits that were actually mentioned in the recording",
      wrong: ["List every fruit that comes to mind, whether mentioned or not", "Guess based on fruits commonly grown in the area", "Skip the question, since fruits are not the main idea"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During a class activity in ${where}, ${who}'s group is given the adverb "gently" from a chart and must act it out. Which action best shows the meaning of "gently"?`,
      correct: "Carrying a basket of eggs softly and carefully",
      wrong: ["Slamming a gate shut", "Running quickly across the yard", "Shouting loudly across the field"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} composes a song about the farm theme and must include vocabulary and adverbs learnt from the audio text. Which line best fits this task?`,
      correct: `"The farmer works daily, tending the crops carefully"`,
      wrong: ["A line with no farm vocabulary or adverbs at all", "A line copied word for word from another group's song", "A line about a topic that has nothing to do with the farm"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While listening to a description of a farm in ${where}, ${who} only needs to note the names of the farm tools mentioned, not the whole story. What should ${who} focus on?`,
      correct: "Listening keenly for that specific detail rather than trying to remember the whole passage",
      wrong: ["Writing down every single word the speaker says", "Ignoring the recording since tools are not the main idea", "Guessing the tool names without listening"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After listening to an audio text about farm animals in ${where}, ${who} and a partner disagree on the answer to a comprehension question. What should they do?`,
      correct: "Go back to what was actually said in the recording to check who is right",
      wrong: ["Flip a coin to decide the answer", "Pick whichever answer sounds more interesting", "Ignore the disagreement and move to the next question"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} keeps chatting with a deskmate while an audio clip about the farm plays in a ${where} classroom. What is the likely effect on ${who}'s understanding?`,
      correct: `${who} will likely miss vocabulary and details needed to answer the comprehension questions`,
      wrong: ["There will be no effect, since the recording can always be replayed", "It will help catch more details than usual", "It will make the listening activity finish sooner"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `Having learnt the adverb "regularly" from a farm-themed listening text in ${where}, ${who} later uses it correctly in a new sentence: "I water my vegetables regularly." What has ${who} demonstrated?`,
      correct: "Using newly learnt vocabulary and adverbs correctly in a new context",
      wrong: ["Memorising a word without understanding what it means", "Repeating the speaker's exact sentence from the recording", "Ignoring the word since it was only heard once"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During flash-card practice in ${where}, ${who}'s group takes turns reading the farm adverbs aloud so that every member gets a turn. What value does this show?`,
      correct: "Fair sharing of roles among group members",
      wrong: ["Rushing through the cards to finish first", "Letting only the fastest reader take every turn", "Skipping members who read more slowly"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is told to be especially keen while listening to a farm-themed recording, rather than only paying attention at the start and the end. Why does this matter?`,
      correct: "Because important vocabulary and details can appear at any point in the recording",
      wrong: ["Because recordings never repeat any information", "Because only the first sentence is ever tested", "Because the ending of a recording is never important"],
    };
  },
];

export const farmListening: Skill = {
  id: "g7-il-ls-the-farm",
  code: "LS.6",
  subjectId: "indigenous-language",
  strandId: "g7-il-listening-speaking",
  grade: 7,
  title: "The farm: listening for information",
  description: "Listen for farm vocabulary and adverbs in an oral text, use them in new contexts, and respond to comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Listen keenly for the exact vocabulary and adverbs used, and check your notes against what the speaker actually said before answering.";

    if (branch === "match") {
      const chosen = shuffle(rng, ADVERBS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.adverb, label: a.adverb })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.adverb, label: a.description })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.adverb] = a.adverb;
      return {
        kind: "click-match",
        prompt: "Match each adverb from the farm listening texts to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((a) => `${a.adverb} — ${a.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, FARM_VOCAB).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `v${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`v${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each word from the farm vocabulary list into the correct group.",
        items,
        buckets,
        correctBucket,
        hint: "Think about whether the word names something that grows, something an animal produces, or the farm/its animals/people/tools.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, LISTENING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of listening to a text about the farm in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: LISTENING_STEPS.map((s) => s.id),
        hint: "Start by listening and picking out vocabulary, then build a bank, answer comprehension questions, practise adverbs with flash cards, role play them, and finally compose a song.",
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
