import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const FABLE_SKILLS: { skill: string; description: string }[] = [
  { skill: "Identifying animal characters", description: "Recognising which animals play a role in the fable" },
  { skill: "Recognising character traits", description: "Noting the qualities — clever, greedy, lazy, kind — each animal shows in the story" },
  { skill: "Identifying the moral lesson", description: "Working out the life lesson the fable teaches at its end" },
  { skill: "Collecting fables from the community", description: "Gathering animal stories told by family members and community elders" },
  { skill: "Organising a story portfolio", description: "Arranging collected fables together for reference before narrating them" },
  { skill: "Narrating with expression", description: "Using tone of voice and pacing to keep a story lively and engaging" },
  { skill: "Maintaining eye contact", description: "Looking at listeners while narrating so they stay engaged" },
  { skill: "Adjusting pace for the audience", description: "Slowing down or speeding up the telling depending on how listeners are responding" },
  { skill: "Using gestures appropriately", description: "Adding hand and body movement that supports the story instead of distracting from it" },
  { skill: "Reviewing a peer's performance", description: "Giving a fellow narrator feedback on their storytelling for improvement" },
  { skill: "Sequencing the plot", description: "Telling the events of a fable in a clear, logical order" },
  { skill: "Valuing indigenous storytelling", description: "Appreciating fables as a way communities pass on wisdom to the young" },
];

const FABLE_FEATURES: { text: string; bucket: string }[] = [
  { text: "A hare", bucket: "Animal character" },
  { text: "A tortoise", bucket: "Animal character" },
  { text: "A hyena", bucket: "Animal character" },
  { text: "A lion", bucket: "Animal character" },
  { text: "Clever", bucket: "Character trait" },
  { text: "Greedy", bucket: "Character trait" },
  { text: "Lazy", bucket: "Character trait" },
  { text: "Boastful", bucket: "Character trait" },
  { text: "Slow, steady effort wins in the end", bucket: "Moral lesson" },
  { text: "Honesty is rewarded", bucket: "Moral lesson" },
  { text: "Pride comes before a fall", bucket: "Moral lesson" },
  { text: "Kindness to others is repaid", bucket: "Moral lesson" },
];

const FABLE_STEPS: { id: string; label: string }[] = [
  { id: "observe", label: "Observe picture stories of animals" },
  { id: "collect", label: "Work with peers to collect fables (animal stories) from the community" },
  { id: "organise", label: "Organise the collection of fables in a portfolio" },
  { id: "discuss", label: "Work collaboratively to discuss the features of animal stories (fables)" },
  { id: "session", label: "Conduct a storytelling session to narrate animal stories" },
  { id: "watch", label: "Watch fables from a digital device and talk about the character traits of animals" },
  { id: "moral", label: "Discuss moral lessons learnt from the fables" },
  { id: "stage", label: "Work collaboratively with peers to stage a narrative on fables" },
  { id: "review", label: "Peer review each other's performance for audience awareness" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "A short story with animal characters that teaches a life lesson is called a", after: ".", answer: "fable" },
  { before: "In a fable, animal characters show human", after: "such as being clever, greedy, or lazy.", answer: "traits", accepted: ["character traits"] },
  { before: "The lesson a fable teaches at its end is called its", after: ".", answer: "moral", accepted: ["moral lesson"] },
  { before: "Before narrating, learners work together to", after: "fables from their community.", answer: "collect" },
  { before: "A collection of gathered fables kept together for reference is called a", after: ".", answer: "portfolio" },
  { before: "Paying attention to how the", after: "is reacting helps a narrator adjust their storytelling.", answer: "audience" },
  { before: "Using tone of voice, pacing, and eye contact while telling a story is called narrating with", after: ".", answer: "expression" },
  { before: "Watching fables from a digital device helps learners talk about animal characters'", after: ".", answer: "character traits", accepted: ["traits"] },
  { before: "Giving a fellow narrator feedback on their storytelling for improvement is called", after: ".", answer: "peer review", accepted: ["peer reviewing", "reviewing"] },
  { before: "Telling the events of a fable in a clear, logical order is called", after: "the plot.", answer: "sequencing" },
  { before: "Being able to adjust storytelling based on how listeners respond shows good", after: "skills.", answer: "audience awareness", accepted: ["audience-awareness"] },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} narrates a fable to younger learners but keeps their eyes fixed on a written script the whole time. What should ${who} change to show better audience awareness?`,
      correct: "Look up and make eye contact with the listeners instead of reading word for word from the script",
      wrong: ["Keep reading directly from the script so nothing is left out", "Avoid eye contact so as not to lose their place", "Speak in a flat tone so the story does not seem exaggerated"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} collects a fable from a grandmother and is asked to identify its features for comprehension. What should ${who} look for?`,
      correct: "Animal characters, the character traits they show, and the moral lesson the story teaches",
      wrong: ["The exact number of pages the story would fill if written down", "Whether the story rhymes when spoken aloud", "The name of the first person who ever told the story"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After hearing a fable about a hare and a tortoise, ${who} in ${where} says the lesson is "slow, steady effort wins in the end." What has ${who} demonstrated?`,
      correct: "Identifying the moral lesson taught through the animal characters' actions",
      wrong: ["Quoting the fable word for word from memory", "Listing every animal that appeared in the fable", "Guessing an answer without having heard the fable"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While staging a group narrative on a fable in ${where}, ${who} adds gestures and pauses that react to how the audience is responding. What skill is ${who} showing?`,
      correct: "Audience awareness — adjusting the performance based on how listeners are reacting",
      wrong: ["Breaking away from the fable's storyline entirely", "Ignoring the moral lesson to focus only on movement", "Confusing narrating a story with reading one aloud"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is peer-reviewing a classmate's fable narration for audience awareness. What should the feedback mainly focus on?`,
      correct: "Whether the narrator kept eye contact, paced the story well, and used expression to hold the audience's attention",
      wrong: ["Correcting spelling mistakes, since this is a written text", "Describing a completely different fable the reviewer prefers", "Only commenting on how loudly the narrator spoke"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} watches a digital video of a fable in which a boastful hare loses a race to a humble tortoise. What does this scene mainly reveal?`,
      correct: "The character traits of the animals, shown through how they act in the story",
      wrong: ["The exact running length of the video", "The name of the person who recorded the video", "An unrelated main idea from a different story"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} is narrating a fable in ${where} to an audience of younger learners who begin to look confused halfway through. What is the best response?`,
      correct: "Slow down or simplify the telling so the story stays clear for the audience",
      wrong: ["Continue exactly as planned, ignoring how the audience looks", "Speak faster to finish the fable sooner", "Stop narrating altogether since the audience seems uninterested"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} collects several fables from elders and organises them in a portfolio before choosing one to narrate. Why is this organising step useful?`,
      correct: "It makes it easier to find and select a fable to prepare for narration later",
      wrong: ["Portfolios only matter when a grade is being given", "Collecting fables becomes unnecessary once one has been memorised", "Organising the portfolio means rewriting each fable's ending"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During ${who}'s narration in ${where}, the audience laughs at a moment meant to be serious. What should ${who} do?`,
      correct: "Notice the audience's reaction and adjust the delivery so the intended tone comes through",
      wrong: ["Ignore the laughter and continue exactly as rehearsed", "Stop narrating the fable altogether", "Raise their voice to drown out the laughter"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} discusses the features of animal stories before narrating one. Which three features should they list?`,
      correct: "Animal characters, the character traits those animals show, and a moral lesson at the end",
      wrong: ["The exact setting, an unexpected plot twist, and the narrator's full name", "The story's rhyme scheme, its illustration style, and its publication date", "The story's total word count, its author, and its intended reading age"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} claims that any story with animals in it counts as a fable. What is missing from this idea?`,
      correct: "A fable specifically needs animal characters with given traits and a story that ends in a moral lesson, not just animals appearing",
      wrong: ["Nothing — any story containing an animal is automatically a fable", "A story must be written down, never spoken aloud, to count as a fable", "A fable must always contain exactly two animal characters"],
    };
  },
];

export const artFablesStorytelling: Skill = {
  id: "g7-il-ls-indigenous-art",
  code: "LS.8",
  subjectId: "indigenous-language",
  strandId: "g7-il-listening-speaking",
  grade: 7,
  title: "Fables from the community: storytelling",
  description: "Identify the features of community fables, narrate them for enjoyment, and build audience-awareness skills while storytelling.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A fable has animal characters with clear traits and a moral lesson. Narrate with expression, eye contact, and awareness of how your audience is reacting.";

    if (branch === "match") {
      const chosen = shuffle(rng, FABLE_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each fable storytelling skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, FABLE_FEATURES).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each item as an animal character, a character trait, or a moral lesson of a fable.",
        items,
        buckets,
        correctBucket,
        hint: "A fable's three features are its animal characters, the traits they show, and the moral lesson taught.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, FABLE_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of learning fables from the community in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: FABLE_STEPS.map((s) => s.id),
        hint: "Start by observing pictures, then collect, organise, discuss features, narrate, watch and discuss traits, discuss morals, stage a narrative, and finally review.",
        explanation: FABLE_STEPS.map((s) => s.label).join(" → "),
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
