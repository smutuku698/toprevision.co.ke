import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { cap } from "./writingSharedA";

// Source: curriculum-reference/grade-6/english.json, Writing strand, sub-strand "6.4.1 Creative
// Writing — Pictorial Compositions (Jobs and Occupation - Work Ethics)". learningExperiences:
// "View and discuss pictures/illustrations/comic strips...; use fixed phrases/similes/
// metaphors/idioms/proverbs/phrasal verbs in a composition; collaboratively compose a story
// (160-200 words) from visuals; organise ideas logically; revise with peer suggestions; publish
// on wall/charts/online/posters/social media." Per SVG scope check, this subject's design doc
// finds no genuinely new visual angle for English (see this file's build-plan note), so
// "pictures" here are described in text rather than rendered as a VisualSpec.
//
// Expressions below are quoted directly from the Jobs and Occupation - Work Ethics theme's own
// Listening & Speaking sub-strand (6.1.1, same theme) — fixed phrases: take care of, have no
// idea, you never know; similes: as happy as a king, as busy as a bee, work like a horse;
// metaphor: Wambui is a bee — she is so busy; idioms: lay off, hand in, take over, deal with,
// strike while the iron is hot, go the extra mile; proverbs: make hay while the sun shines, the
// sun does not wait for a king, honesty is the best policy, slow but sure wins the race, Jack of
// all trades master of none; phrasal verbs: grow up, take over, deal with, give up, go on.

type ExprType = "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb" | "fixed phrase";

const EXPRESSIONS: { type: ExprType; text: string; meaning: string }[] = [
  { type: "fixed phrase", text: "take care of", meaning: "to look after something or someone" },
  { type: "fixed phrase", text: "have no idea", meaning: "to not know something at all" },
  { type: "fixed phrase", text: "you never know", meaning: "used to say that something unexpected could still happen" },
  { type: "simile", text: "as happy as a king", meaning: "extremely happy" },
  { type: "simile", text: "as busy as a bee", meaning: "working hard without stopping" },
  { type: "simile", text: "work like a horse", meaning: "to work extremely hard" },
  { type: "metaphor", text: "Wambui is a bee — she is so busy", meaning: "describes someone who works constantly, without rest" },
  { type: "idiom", text: "lay off", meaning: "to dismiss a worker from their job" },
  { type: "idiom", text: "hand in", meaning: "to submit finished work to someone" },
  { type: "idiom", text: "take over", meaning: "to begin controlling or running something" },
  { type: "idiom", text: "deal with", meaning: "to handle or take action on something" },
  { type: "idiom", text: "strike while the iron is hot", meaning: "to act immediately at the best possible moment" },
  { type: "idiom", text: "go the extra mile", meaning: "to make a special extra effort" },
  { type: "proverb", text: "make hay while the sun shines", meaning: "to make good use of a favourable opportunity while it lasts" },
  { type: "proverb", text: "the sun does not wait for a king", meaning: "time waits for no one, however important" },
  { type: "proverb", text: "honesty is the best policy", meaning: "it is always best to be truthful" },
  { type: "proverb", text: "slow but sure wins the race", meaning: "careful, steady work succeeds better than rushing" },
  { type: "proverb", text: "Jack of all trades, master of none", meaning: "someone who can do many jobs a little, but is excellent at none" },
  { type: "phrasal verb", text: "grow up", meaning: "to become an adult" },
  { type: "phrasal verb", text: "give up", meaning: "to stop trying" },
  { type: "phrasal verb", text: "go on", meaning: "to continue" },
];

// Apply-tier: identifying which expression fits a described picture — the scene detail is
// load-bearing (distractors are drawn from the same pool but describe a different scene).
const SCENARIO_MOMENTS: { prompt: string; correct: string }[] = [
  { prompt: "The picture shows Wambui rushing between three customers at once at her shop, never resting for a moment. Which expression best fits this scene?", correct: "Wambui is a bee — she is so busy" },
  { prompt: "The picture shows a mechanic deciding to fix a customer's worn brakes immediately, knowing a small problem could soon become dangerous. Which idiom fits his decision to act at once?", correct: "strike while the iron is hot" },
  { prompt: "The picture shows a young worker staying late to help a colleague finish an urgent order, doing far more than his job requires. Which idiom best fits his effort?", correct: "go the extra mile" },
  { prompt: "The picture shows a shopkeeper who always gives customers the correct change and never cheats anyone. Which proverb best fits her way of doing business?", correct: "honesty is the best policy" },
  { prompt: "The picture shows a tailor working carefully and steadily, finishing every order on time without ever rushing. Which proverb fits her approach?", correct: "slow but sure wins the race" },
  { prompt: "The picture shows a farmer harvesting his maize quickly while the weather is still dry, before the rains can spoil it. Which proverb fits what he is doing?", correct: "make hay while the sun shines" },
  { prompt: "The picture shows a manager telling a lazy worker that his job is being given to someone else. Which idiom best describes what is happening to the worker?", correct: "lay off" },
  { prompt: "The picture shows an office worker who has just finished a report and is giving it to her supervisor. Which idiom best fits what she is doing?", correct: "hand in" },
  { prompt: "The picture shows a new manager stepping in to run the shop after the owner retires. Which idiom fits what she is doing?", correct: "take over" },
  { prompt: "The picture shows a worker who does not know how to fix a strange fault in the machine. Which fixed phrase best fits his situation?", correct: "have no idea" },
  { prompt: "The picture shows a supervisor reminding new workers to look after the tools carefully so they last longer. Which fixed phrase fits his advice?", correct: "take care of" },
  { prompt: "The picture shows a carpenter who can also do plumbing and painting, but is not brilliant at any single one of them. Which proverb fits this description?", correct: "Jack of all trades, master of none" },
];

const PICTURE_SEQUENCES: { panel1: string; panel2: string; correct: string; wrongs: string[] }[] = [
  {
    panel1: "A carpenter arrives early at his workshop and lays out his tools.",
    panel2: "He measures and cuts a plank of wood carefully.",
    correct: "He sands the finished stool smooth before selling it at the market.",
    wrongs: ["He watches a football match on television.", "He goes to buy vegetables at the market.", "He falls asleep under a tree."],
  },
  {
    panel1: "A doctor washes her hands before her shift begins.",
    panel2: "She examines a young patient carefully.",
    correct: "She writes out the correct medicine and explains it to the mother.",
    wrongs: ["She waters the flowers outside the clinic.", "She calls her friend to plan a weekend trip.", "She reads a newspaper in the staff room."],
  },
  {
    panel1: "A teacher arrives early to mark the register.",
    panel2: "He teaches the class a new topic, answering questions patiently.",
    correct: "He sets homework and reminds pupils of the next lesson.",
    wrongs: ["He goes shopping for new shoes.", "He paints the classroom wall a new colour.", "He plays a video game during the lesson."],
  },
  {
    panel1: "A mechanic examines a matatu that has broken down.",
    panel2: "He identifies the faulty part and orders a replacement.",
    correct: "He fixes the part and tests the engine before returning the matatu to its owner.",
    wrongs: ["He washes his car for a family trip.", "He goes to watch a movie while waiting.", "He plants trees along the roadside."],
  },
  {
    panel1: "A tailor takes a customer's measurements.",
    panel2: "She cuts and stitches the fabric with care.",
    correct: "She hands the finished dress to a delighted customer.",
    wrongs: ["She goes swimming at the local pool.", "She feeds chickens in her backyard.", "She takes a nap on the workshop bench."],
  },
  {
    panel1: "A fisherman checks his nets before dawn.",
    panel2: "He rows out onto the lake and casts his net.",
    correct: "He hauls in a good catch and heads back to sell it at the market.",
    wrongs: ["He builds a sandcastle on the shore.", "He goes to visit his cousin in town.", "He reads a storybook by the water."],
  },
  {
    panel1: "A mason mixes cement and sand at a building site.",
    panel2: "He lays bricks carefully, checking each row with a spirit level.",
    correct: "By evening, a straight, sturdy wall stands where there was none that morning.",
    wrongs: ["He goes to buy a new bicycle.", "He waters his neighbour's garden.", "He watches the site from a distance without working."],
  },
  {
    panel1: "A nurse prepares the vaccination clinic early in the morning.",
    panel2: "She calls in each child and reassures the nervous ones.",
    correct: "By closing time, every child on her list has been safely vaccinated.",
    wrongs: ["She closes the clinic early to go shopping.", "She spends the morning cleaning her house instead.", "She forgets to open the clinic that day."],
  },
  {
    panel1: "A shopkeeper opens her stall and arranges fresh vegetables neatly.",
    panel2: "She serves customers patiently, weighing goods and giving correct change.",
    correct: "As evening falls, she counts her earnings and locks up the stall.",
    wrongs: ["She leaves the stall open and unattended all day.", "She gives all her vegetables away for free.", "She closes early to attend a birthday party."],
  },
  {
    panel1: "An electrician inspects a home with flickering lights.",
    panel2: "He traces the fault to a loose wire behind the switchboard.",
    correct: "He repairs the wiring safely and the lights stop flickering.",
    wrongs: ["He leaves the loose wire as it is and goes home.", "He paints the switchboard a bright colour.", "He disconnects the whole house's power for the week."],
  },
  {
    panel1: "A matatu driver checks his brakes and mirrors before the morning trip.",
    panel2: "He drives carefully, obeying the speed limit through town.",
    correct: "He drops off every passenger safely at their stop.",
    wrongs: ["He speeds past every stop without picking anyone up.", "He stops to buy roasted maize for an hour.", "He argues loudly with a passenger about the fare."],
  },
  {
    panel1: "A farmer wakes before sunrise to milk the cows.",
    panel2: "He leads the herd out to graze in the field.",
    correct: "By midday, he drives the cows back for water and shade.",
    wrongs: ["He leaves the cows to wander onto the highway.", "He goes to town and forgets about the cows entirely.", "He sells all the cows before lunchtime."],
  },
];

// Explicit stage order, condensed from the sub-strand's own learningExperiences bullet order:
// "View and discuss pictures...; use expressions...; collaboratively compose...; organise ideas
// logically; revise with peer suggestions; publish..."
const STAGES: { id: string; label: string; description: string }[] = [
  { id: "view", label: "View and discuss the pictures", description: "Look closely at the pictures or comic strip and discuss what is happening in each one" },
  { id: "plan", label: "Plan and organise ideas", description: "Decide the order of events and how the ideas will flow logically" },
  { id: "draft", label: "Draft the composition", description: "Write the story (160-200 words), weaving in fixed phrases, similes, metaphors, idioms, or proverbs" },
  { id: "revise", label: "Revise with peer suggestions", description: "Use a partner's feedback to improve the story's flow and word choice" },
  { id: "publish", label: "Publish", description: "Share the finished composition on a wall, chart, poster, or online" },
];

const WRITING_TIPS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "Looking closely at a picture before writing helps a writer plan what", after: "to include in the composition.", correctAnswer: "details", acceptedAnswers: ["ideas"] },
  { before: "Using an idiom such as 'go the extra", after: "' can make a pictorial composition about work more vivid.", correctAnswer: "mile" },
  { before: "The proverb 'make hay while the sun", after: "' reminds workers to act while conditions are good.", correctAnswer: "shines" },
  { before: "A worker who is 'as busy as a", after: "' never seems to stop working.", correctAnswer: "bee" },
  { before: "The idiom 'strike while the iron is", after: "' means to act immediately at the right moment.", correctAnswer: "hot" },
  { before: "The proverb 'honesty is the best", after: "' reminds workers to always be truthful.", correctAnswer: "policy" },
  { before: "Before writing a pictorial composition, a writer should first discuss what is happening in each", after: ".", correctAnswer: "picture", acceptedAnswers: ["panel", "illustration"] },
  { before: "After drafting a pictorial composition, a writer should organise the ideas", after: "so events follow a clear order.", correctAnswer: "logically" },
  { before: "A pictorial composition is usually revised using suggestions from a", after: ".", correctAnswer: "peer", acceptedAnswers: ["partner", "classmate"] },
  { before: "The idiom 'hand", after: "' means to submit finished work to someone.", correctAnswer: "in" },
  { before: "The proverb 'slow but sure wins the", after: "' praises careful, steady work over rushing.", correctAnswer: "race" },
  { before: "A finished pictorial composition can be shared with others by displaying it on a", after: "or online.", correctAnswer: "wall", acceptedAnswers: ["chart", "poster", "noticeboard"] },
];

export const pictorialCompositions: Skill = {
  id: "g6-eng-writing-pictorial-compositions",
  code: "W.5",
  subjectId: "english",
  strandId: "g6-eng-writing",
  grade: 6,
  title: "Pictorial Compositions",
  description: "Plan a composition from a picture or comic-strip sequence, choose the expression that fits a described scene, organise ideas logically, and judge a pictorial composition for relevance and creativity.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["mc-sequence", "mc-expression", "click-match", "categorize", "order", "fill-blank"] as const
    );
    const hint = "A pictorial composition tells the story shown across a set of pictures, organised logically from picture to picture, using vivid expressions like similes, idioms, or proverbs where they fit.";

    if (branch === "mc-sequence") {
      const entry = randChoice(rng, PICTURE_SEQUENCES);
      const choices = shuffle(rng, [entry.correct, ...entry.wrongs]);
      return {
        kind: "multiple-choice",
        prompt: `Picture 1: ${entry.panel1} Picture 2: ${entry.panel2} Which caption best completes Picture 3, continuing the story logically?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "The next picture should follow logically from what the character has already been doing — not jump to something unrelated.",
        explanation: `"${entry.correct}" follows logically from the earlier pictures. The other options are unrelated to what the character has been doing.`,
      };
    }

    if (branch === "mc-expression") {
      const entry = randChoice(rng, SCENARIO_MOMENTS);
      const others = shuffle(rng, EXPRESSIONS.filter((e) => e.text !== entry.correct)).slice(0, 3);
      const choices = shuffle(rng, [entry.correct, ...others.map((e) => e.text)]);
      const meaning = EXPRESSIONS.find((e) => e.text === entry.correct)!.meaning;
      return {
        kind: "multiple-choice",
        prompt: entry.prompt,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Match the meaning of the expression to what is actually shown in the picture, not just the general topic of work.",
        explanation: `"${entry.correct}" fits because it means ${meaning}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, EXPRESSIONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((e) => ({ id: e.text, label: e.text })));
      const targets = shuffle(rng, chosen.map((e) => ({ id: e.text, label: e.meaning })));
      const correctMap: Record<string, string> = {};
      for (const e of chosen) correctMap[e.text] = e.text;
      return {
        kind: "click-match",
        prompt: "Match each expression to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((e) => `"${e.text}" means ${e.meaning}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const types: ExprType[] = ["simile", "metaphor", "idiom", "proverb", "phrasal verb", "fixed phrase"];
      const chosenTypes = shuffle(rng, types).slice(0, 3);
      const chosen = chosenTypes.flatMap((t) => shuffle(rng, EXPRESSIONS.filter((e) => e.type === t)).slice(0, 2));
      const shuffled = shuffle(rng, chosen);
      const items = shuffled.map((e, i) => ({ id: `x${i}`, label: e.text }));
      const correctBucket: Record<string, string> = {};
      shuffled.forEach((e, i) => (correctBucket[`x${i}`] = e.type));
      return {
        kind: "categorize",
        prompt: "Sort each expression by its type.",
        items,
        buckets: chosenTypes.map((t) => ({ id: t, label: cap(t) })),
        correctBucket,
        hint: "A simile compares using 'as' or 'like'; a metaphor states one thing is another; an idiom's meaning isn't literal; a proverb gives general life advice.",
        explanation: shuffled.map((e) => `"${e.text}" is a${e.type === "idiom" ? "n" : ""} ${e.type}.`).join(" "),
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the stages of creating a pictorial composition in the correct order.",
        instruction: "Click the stages in order, from first to last.",
        items: shuffle(rng, STAGES.map((s) => ({ id: s.id, label: s.label }))),
        correctOrder: STAGES.map((s) => s.id),
        hint,
        explanation: STAGES.map((s) => `${s.label} — ${s.description.toLowerCase()}`).join(" → "),
      };
    }

    const entry = randChoice(rng, WRITING_TIPS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete this tip about pictorial compositions.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      acceptedAnswers: entry.acceptedAnswers,
      inputMode: "text",
      hint,
      explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
    };
  },
};
