import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const STORY_SKILLS: { skill: string; description: string }[] = [
  { skill: "Observing picture cards", description: "Studying thematic picture cards closely to understand what events they show" },
  { skill: "Describing events", description: "Putting into words what is happening in each picture" },
  { skill: "Organising ideas", description: "Arranging story ideas from the pictures into a logical, sequenced order" },
  { skill: "Creating animal characters", description: "Giving the animals in a story their own distinct traits and roles" },
  { skill: "Maintaining coherence", description: "Keeping a story's ideas clearly connected from start to end" },
  { skill: "Peer review", description: "Reading a composed story to classmates and listening to their feedback" },
  { skill: "Revising a draft", description: "Improving a story based on feedback received from peers" },
  { skill: "Organising a portfolio", description: "Keeping revised stories together for reference" },
  { skill: "Publishing", description: "Sharing a finished story in a school or public journal or magazine" },
  { skill: "Sequencing events", description: "Telling a story's events in the order they logically happen" },
  { skill: "Appreciating short stories", description: "Valuing short animal stories as an enjoyable form of writing" },
  { skill: "Self-expression through characters", description: "Using an animal story to express one's own ideas and creativity" },
];

const WRITING_HABITS: { text: string; bucket: string }[] = [
  { text: "Arranging picture-story ideas into a logical sequence before writing", bucket: "Good writing habit" },
  { text: "Giving each animal character a clear, distinct trait", bucket: "Good writing habit" },
  { text: "Reading the finished story to peers for feedback", bucket: "Good writing habit" },
  { text: "Revising the story based on peer feedback before it is finalised", bucket: "Good writing habit" },
  { text: "Keeping every idea in the story clearly connected to the last", bucket: "Good writing habit" },
  { text: "Organising the revised story in a portfolio for reference", bucket: "Good writing habit" },
  { text: "Writing the story without first organising any ideas from the pictures", bucket: "Poor writing habit" },
  { text: "Ignoring peer feedback and submitting the very first draft", bucket: "Poor writing habit" },
  { text: "Jumping between unrelated events with no connection between ideas", bucket: "Poor writing habit" },
  { text: "Copying a picture card's caption instead of composing original events", bucket: "Poor writing habit" },
  { text: "Skipping the review step before submitting a story for publishing", bucket: "Poor writing habit" },
  { text: "Describing events out of order so the story is confusing to follow", bucket: "Poor writing habit" },
];

const STORY_STEPS: { id: string; label: string }[] = [
  { id: "observe", label: "Work collaboratively to observe thematic pictures on cards and describe the events" },
  { id: "organise", label: "Work collaboratively to organise ideas from picture stories in a logical and sequenced order" },
  { id: "compose", label: "Compose a creative story with animal characters with coherent ideas" },
  { id: "read", label: "Read the story to peers for review" },
  { id: "portfolio", label: "Organise their revised stories in a portfolio" },
  { id: "publish", label: "Work with peers to publish their best stories in the school or public journal or magazine" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "Studying thematic picture cards closely to understand what events they show is called", after: "the pictures.", answer: "observing" },
  { before: "Arranging story ideas into a logical, sequenced order is called", after: "ideas.", answer: "organising" },
  { before: "A story is", after: "when its ideas are clearly connected from start to end.", answer: "coherent" },
  { before: "Reading a composed story to classmates to get feedback is called peer", after: ".", answer: "review" },
  { before: "Improving a story based on feedback received from peers is called", after: "it.", answer: "revising" },
  { before: "Keeping revised stories together for reference is called organising a", after: ".", answer: "portfolio" },
  { before: "Sharing a finished story in a school or public journal or magazine is called", after: "it.", answer: "publishing" },
  { before: "A short story built around animal characters, written for self-expression, is called an animal", after: ".", answer: "story" },
  { before: "Telling a story's events in the order they logically happen is called", after: "events.", answer: "sequencing" },
  { before: "Valuing short animal stories as an enjoyable form of writing shows", after: "for short-story writing.", answer: "appreciation" },
  { before: "Giving animal characters in a story their own personality is called giving them distinct", after: ".", answer: "traits" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} looks at a set of thematic picture cards and immediately begins writing an animal story without arranging the ideas first. What is the risk of skipping this step?`,
      correct: "The story's events may end up jumbled and hard to follow, since the ideas were never sequenced",
      wrong: ["There is no risk, since organising ideas first is optional", "The story will automatically be shorter and clearer", "Skipping this step only affects spelling, not the story's structure"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} writes an animal story where a cunning hare and a slow-moving tortoise each behave consistently throughout. What has ${who} shown skill in?`,
      correct: "Creating animal characters with clear, distinct traits",
      wrong: ["Copying characters directly from a picture card's caption", "Avoiding the use of any animal characters", "Writing a letter of request instead of a story"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After composing a first draft of an animal story, ${who} in ${where} reads it aloud to classmates before making any changes. What is this step called?`,
      correct: "Peer review — getting feedback from classmates before revising the story",
      wrong: ["Publishing the story in its final form", "Organising the story in a portfolio", "Outlining the story's key events for the first time"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s classmates in ${where} point out that a paragraph in ${who}'s animal story does not connect to the events before it. What should ${who} do next?`,
      correct: "Revise the draft so the ideas stay coherently connected from start to end",
      wrong: ["Ignore the feedback and submit the story as it is", "Delete the whole story and start an unrelated one", "Add more unrelated events to make the story longer"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} keeps revised animal stories filed together so they can be found and reused later. What is this practice called?`,
      correct: "Organising a portfolio of revised stories",
      wrong: ["Publishing the stories in a magazine", "Peer reviewing the stories for the first time", "Observing thematic picture cards"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s animal story in ${where} is selected, after revision, to appear in the school magazine. What has happened to the story at this stage?`,
      correct: "It has been published, sharing the finished, revised story with a wider audience",
      wrong: ["It has only just been drafted for the first time", "It has been rejected and needs a completely new topic", "It has skipped the peer review stage entirely"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} looks at a picture card showing an elephant helping a stuck buffalo, and writes a sentence describing exactly what is happening. What skill is this?`,
      correct: "Describing events shown in a picture card",
      wrong: ["Publishing a finished story", "Sequencing events from memory with no picture", "Reviewing a peer's completed story"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s animal story in ${where} tells the escape, the chase, and the rescue in the exact order they would logically happen. What has ${who} done well?`,
      correct: "Sequenced the story's events in a clear, logical order",
      wrong: ["Left the events in a random, unordered arrangement", "Skipped describing any events at all", "Copied the events directly from a picture card's caption"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} explains to a younger learner why short animal stories are worth writing and reading. What is ${who} demonstrating?`,
      correct: "Appreciation for short-story writing as an enjoyable form of self-expression",
      wrong: ["Disinterest in writing any further stories", "A belief that animal stories cannot teach anything", "Confusion between a story and a letter of request"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} copies a picture card's short caption word for word as the entire story instead of composing new events. What is the problem with this approach?`,
      correct: "It does not compose an original story with the learner's own coherent ideas",
      wrong: ["It is the fastest and most accepted way to write an animal story", "It automatically satisfies the peer review step", "It guarantees the story will be selected for publishing"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} works together to turn a set of picture cards into one shared animal story with a beginning, middle, and end. What must the group agree on first?`,
      correct: "A logical, sequenced order for the ideas shown across the picture cards",
      wrong: ["Which single learner will take all the credit for the story", "Whether to skip writing entirely and only speak the story aloud", "Whether the story needs any animal characters at all"],
    };
  },
];

export const artAnimalStoryWriting: Skill = {
  id: "g7-il-w-indigenous-art",
  code: "W.8",
  subjectId: "indigenous-language",
  strandId: "g7-il-writing",
  grade: 7,
  title: "Writing an animal story",
  description: "Outline key ideas from picture stories, compose a coherent animal story with animal characters, and appreciate short-story writing.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Organise ideas from the pictures in a logical order first, give animal characters clear traits, keep ideas coherently connected, then review and revise before publishing.";

    if (branch === "match") {
      const chosen = shuffle(rng, STORY_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each animal-story writing skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, WRITING_HABITS).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `h${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`h${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each behaviour as a good or poor habit when writing an animal story.",
        items,
        buckets,
        correctBucket,
        hint: "Think about whether the habit helps organise, connect, and improve the story, or works against that.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, STORY_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of writing and publishing an animal story in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: STORY_STEPS.map((s) => s.id),
        hint: "Start by observing the pictures, then organise ideas, compose the story, read it to peers, organise revised stories, then publish the best ones.",
        explanation: STORY_STEPS.map((s) => s.label).join(" → "),
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
