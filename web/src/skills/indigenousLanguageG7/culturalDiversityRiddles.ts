import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const RIDDLING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Turn-taking", description: "Waiting for your turn before giving a riddle or its answer" },
  { skill: "Negotiation", description: "Agreeing with a partner on who goes next or what the correct answer is" },
  { skill: "Interjection", description: "Making a short, well-timed remark during a riddling exchange" },
  { skill: "Riddle identification", description: "Recognising a commonly used riddle from the community" },
  { skill: "Riddle performance", description: "Presenting a riddle aloud clearly for an audience to guess" },
  { skill: "Feature brainstorming", description: "Working with peers to identify what makes up a riddle" },
  { skill: "Tongue twister competition", description: "Competing with peers to say a tongue twister quickly and clearly" },
  { skill: "Recorded peer review", description: "Listening to a recording of a tongue twister and giving feedback" },
  { skill: "Riddle composition", description: "Creating a new riddle together with peers" },
  { skill: "Tongue twister composition", description: "Creating a new tongue twister using repeated sounds" },
  { skill: "Portfolio organising", description: "Keeping created riddles and tongue twisters in a class collection" },
  { skill: "Communication enhancement", description: "Understanding how riddling helps develop listening and speaking skills" },
];

const RIDDLES_AND_TWISTERS: { text: string; bucket: string }[] = [
  { text: "What has a face and two hands but no arms or legs? (A clock)", bucket: "Riddle" },
  { text: "What has to be broken before you can use it? (An egg)", bucket: "Riddle" },
  { text: "What has many keys but cannot open a single door? (A piano)", bucket: "Riddle" },
  { text: "What gets wetter the more it dries? (A towel)", bucket: "Riddle" },
  { text: "What has a neck but no head? (A bottle)", bucket: "Riddle" },
  { text: "What comes down but never goes up? (Rain)", bucket: "Riddle" },
  { text: "She sells seashells by the seashore", bucket: "Tongue twister" },
  { text: "Six sleek swans swam swiftly southward", bucket: "Tongue twister" },
  { text: "Red lorry, yellow lorry", bucket: "Tongue twister" },
  { text: "Peter Piper picked a peck of pickled peppers", bucket: "Tongue twister" },
  { text: "Fresh fried fish, fish fresh fried", bucket: "Tongue twister" },
  { text: "A big black bear sat on a big black rug", bucket: "Tongue twister" },
];

const RIDDLING_STEPS: { id: string; label: string }[] = [
  { id: "perform", label: "Take turns to perform common riddles" },
  { id: "discuss", label: "Work jointly to discuss the process of riddling" },
  { id: "practise", label: "Practise turn-taking, negotiation and interjection as part of the riddling process" },
  { id: "brainstorm", label: "Brainstorm the features of a riddle" },
  { id: "compete", label: "Compete with peers to say tongue twisters and record them" },
  { id: "review", label: "Listen to recorded audio clips of tongue twisters and peer review" },
  { id: "compose", label: "Compose tongue twisters and take turns to perform them" },
  { id: "portfolio", label: "Work with peers to create a collection of riddles and tongue twisters and organise it in a class portfolio" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "A question that describes something without naming it, so the listener must guess what it is, is called a", after: ".", answer: "riddle" },
  { before: "A phrase that is difficult to say quickly because of repeated sounds is called a tongue", after: ".", answer: "twister" },
  { before: "Waiting for your turn to speak during a riddling exchange is called", after: ".", answer: "turn-taking", accepted: ["taking turns"] },
  { before: "Agreeing with a partner on who will go next or what the answer should be is called", after: ".", answer: "negotiation" },
  { before: "Making a short remark to interrupt or respond appropriately during a riddling exchange is called an", after: ".", answer: "interjection" },
  { before: "Working with peers to identify what makes up a riddle is called", after: "the features of a riddle.", answer: "brainstorming", accepted: ["brainstorm"] },
  { before: "A collection of riddles and tongue twisters kept and organised by a class is called a class", after: ".", answer: "portfolio" },
  { before: "Riddling and tongue twisters help learners develop stronger", after: "skills.", answer: "communication" },
  { before: "Riddles and tongue twisters used in a community are shared examples of that community's spoken", after: ".", answer: "culture" },
  { before: "Learning riddles and tongue twisters from communities different from your own is a way of appreciating cultural", after: ".", answer: "diversity" },
  { before: "When several learners take turns saying a riddle in front of the class, they are giving a", after: ".", answer: "performance" },
  { before: "Recording yourself saying a tongue twister lets you and your peers", after: "the recording afterward.", answer: "review", accepted: ["peer review"] },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During a riddling session in ${where}, ${who} calls out the answer before the classmate who was riddling has finished speaking. What skill has ${who} failed to practise?`,
      correct: "Turn-taking — waiting for your turn before giving a riddle or its answer",
      wrong: ["Interjection, since interrupting is always a form of interjection", "Negotiation, since only the winner needs to negotiate", "Portfolio organising, since answers are not stored"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `Two learners in ${where}, including ${who}, cannot agree on whose turn it is to riddle next, so they talk it through and settle on an order. What has ${who} just done?`,
      correct: "Negotiated with a partner to agree on who goes next",
      wrong: ["Interjected without being asked to speak", "Composed a brand new riddle", "Organised the class riddle portfolio"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While a classmate is riddling in ${where}, ${who} makes a brief, well-timed comment that helps move the exchange along without stopping it. What is this an example of?`,
      correct: "Interjection — a short, well-timed remark during a riddling exchange",
      wrong: ["Turn-taking, since only waiting counts as turn-taking", "Rudeness, since any comment during someone else's turn is impolite", "Negotiation, since only disagreements are negotiated"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} hears "What has a face and two hands but no arms or legs?" and is expected to guess the hidden answer. What kind of spoken form is this?`,
      correct: "A riddle — a description that must be guessed",
      wrong: ["A tongue twister — a phrase that is hard to say quickly", "A narrative — a story about events", "An expository text — a text that explains facts"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} keeps stumbling over the words "She sells seashells by the seashore" when saying it quickly. What is ${who} attempting?`,
      correct: "A tongue twister — a phrase that is difficult to say quickly because of repeated sounds",
      wrong: ["A riddle — a description with a hidden answer", "A negotiation between two speakers", "An interjection during someone else's turn"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `Before composing new riddles, ${who}'s group in ${where} works together to list what makes a riddle a riddle. What activity is this group doing?`,
      correct: "Brainstorming the features of a riddle",
      wrong: ["Performing a riddle for an audience", "Recording a tongue twister for review", "Organising the class portfolio"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} records a tongue twister attempt and shares it with a partner who then points out which sounds were said unclearly. What has the partner just done?`,
      correct: "Given recorded peer review — listened to the recording and offered feedback",
      wrong: ["Negotiated a new turn order", "Composed a new tongue twister from scratch", "Identified a riddle from the community"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s class in ${where} keeps every riddle and tongue twister they create together in one place so the collection can be revisited later. What are they doing?`,
      correct: "Organising the riddles and tongue twisters into a class portfolio",
      wrong: ["Brainstorming the features of a riddle for the first time", "Competing to say tongue twisters the fastest", "Negotiating who performs first"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} learns a riddle from a classmate whose community is different from ${who}'s own, and enjoys comparing it with riddles ${who} already knows. What does this exposure mainly support?`,
      correct: "Appreciating riddles and communication styles from different communities",
      wrong: ["Proving that only one community's riddles are correct", "Avoiding riddles from other communities in future", "Replacing the need to learn any new riddles at all"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After weeks of taking part in riddling and tongue twisters in ${where}, ${who} finds it easier to think of words quickly and respond to classmates in class discussions. What does this show about riddling?`,
      correct: "Riddling and tongue twisters help enhance communication skills",
      wrong: ["Riddling has no effect on communication skills", "Riddling only helps with memorising answers, not speaking", "Riddling replaces the need to practise speaking altogether"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is asked to compose a brand-new riddle with a partner, then take turns performing it for the class. Which two riddling skills does this activity combine?`,
      correct: "Riddle composition and riddle performance",
      wrong: ["Negotiation and portfolio organising only", "Interjection and tongue twister competition only", "Feature brainstorming and recorded peer review only"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During a class riddling competition in ${where}, ${who} refuses to let a classmate finish saying a tongue twister and keeps talking over them. What value is ${who} failing to show?`,
      correct: "Unity — cooperating with peers and taking turns during the activity",
      wrong: ["Creativity, since interrupting shows original thinking", "Self-efficacy, since speaking first shows confidence", "Digital literacy, since the activity involves a recording"],
    };
  },
];

export const culturalDiversityRiddles: Skill = {
  id: "g7-il-ls-cultural-diversity",
  code: "LS.5",
  subjectId: "indigenous-language",
  strandId: "g7-il-listening-speaking",
  grade: 7,
  title: "Cultural diversity: tongue twisters and riddles",
  description: "Identify and perform tongue twisters and riddles, practising turn-taking, negotiation and interjection to enhance communication skills.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Riddling skills include turn-taking, negotiation and interjection — practise all three as you identify, perform and compose riddles and tongue twisters.";

    if (branch === "match") {
      const chosen = shuffle(rng, RIDDLING_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each riddling skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, RIDDLES_AND_TWISTERS).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `t${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`t${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each example as a riddle (has a hidden answer to guess) or a tongue twister (hard to say quickly).",
        items,
        buckets,
        correctBucket,
        hint: "A riddle asks a question with a hidden answer. A tongue twister repeats similar sounds to make it hard to say quickly.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, RIDDLING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of learning tongue twisters and riddles in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: RIDDLING_STEPS.map((s) => s.id),
        hint: "Start by performing known riddles, then discuss and practise the riddling process, brainstorm features, compete and review twisters, compose new ones, and finally build a portfolio.",
        explanation: RIDDLING_STEPS.map((s) => s.label).join(" → "),
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
