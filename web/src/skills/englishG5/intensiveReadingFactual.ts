import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { comprehensionBranch, type Passage } from "./g5ReadingShared";
import { scenarioPrompt, sortPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 10.0 Leisure Time Activities, sub-strand 10.2 Intensive Reading:
// Factual Texts of about 400 words. Focus: relate ideas to experience, direct and inferential questions,
// summarise main ideas, make notes. See curriculum-reference/grade-5/english.json.

const PASSAGES: Passage[] = [
  {
    title: "Why Hobbies Matter",
    text: "Paragraph 1: A hobby is something you do in your free time because you enjoy it, not because you must. Common hobbies include reading, gardening, drawing, football and collecting stamps.\nParagraph 2: Hobbies are good for you. They give your mind a rest from schoolwork, help you make friends who like the same things, and teach patience when a skill takes time to learn.\nParagraph 3: The best hobby is one you can keep up. It should be safe, should not cost too much, and should leave time for homework, chores and sleep.",
    factual: [
      { q: "What is a hobby?", answer: "something you do in your free time because you enjoy it", wrong: ["a subject you study at school", "a chore your parents give you", "a job you are paid for"] },
      { q: "Name one way hobbies help you, from the text.", answer: "they give your mind a rest from schoolwork", wrong: ["they make you taller", "they replace sleep", "they cost a lot of money"] },
      { q: "What should the best hobby leave time for?", answer: "homework, chores and sleep", wrong: ["television only", "more hobbies", "nothing else"] },
    ],
    inferential: [
      { q: "Why does the text say a hobby should not cost too much?", answer: "so you can keep doing it without running out of money", wrong: ["because expensive things are boring", "so your friends are not jealous", "because cheap things last longer"] },
      { q: "What is the writer trying to help you do?", answer: "choose a hobby that is good for you and easy to keep up", wrong: ["give up all hobbies", "spend all your time on one hobby", "copy your friends exactly"] },
    ],
    mainIdea: {
      answer: "Hobbies are enjoyable free-time activities that are good for you, and the best one is safe, affordable and easy to keep up.",
      wrong: ["Football is the best hobby for everyone.", "Hobbies should replace schoolwork.", "Collecting stamps is expensive."],
    },
    vocab: [
      { word: "patience", meaning: "being able to wait or keep trying without getting upset", wrong: ["speed", "strength", "luck"] },
      { word: "keep up", meaning: "carry on doing something regularly", wrong: ["stop suddenly", "hide away", "sell for money"] },
    ],
    sequence: [
      "A hobby is a free-time activity you enjoy.",
      "Hobbies rest the mind, build friendships and teach patience.",
      "The best hobby is safe and affordable.",
      "It should still leave time for homework, chores and sleep.",
    ],
    notInText: ["Hobbies are only for adults.", "The government chooses your hobby.", "You must do a hobby every hour of the day."],
  },
  {
    title: "Staying Safe on a Hike",
    text: "Paragraph 1: Hiking is a popular leisure activity. Walking in the hills is good exercise and lets you see plants and birds you never meet in town.\nParagraph 2: A safe hike needs planning. Tell an adult where you are going and when you will be back. Carry water, a hat and something to eat. Wear shoes with a good grip.\nParagraph 3: On the trail, stay with your group and keep to the marked path. If the weather turns, do not carry on. It is better to return early than to get caught in a storm far from home.",
    factual: [
      { q: "What should you tell an adult before a hike?", answer: "where you are going and when you will be back", wrong: ["how much money you have", "the names of the birds", "your favourite subject"] },
      { q: "What kind of shoes should you wear?", answer: "shoes with a good grip", wrong: ["new white shoes", "sandals", "no shoes"] },
      { q: "What should you do if the weather turns?", answer: "return early; do not carry on", wrong: ["walk faster", "leave the path to find shelter alone", "keep going to the top"] },
    ],
    inferential: [
      { q: "Why keep to the marked path?", answer: "so you do not get lost and are easier to find", wrong: ["the marked path is shorter", "other paths are private", "the birds only live there"] },
      { q: "Why is it 'better to return early'?", answer: "getting caught in a storm far from home is dangerous", wrong: ["the hike is boring anyway", "there is no time to reach the top", "the group walks too slowly"] },
    ],
    mainIdea: {
      answer: "Hiking is healthy and interesting, but a safe hike needs planning, the right gear, and good sense about weather and the path.",
      wrong: ["Hiking is too dangerous to do at all.", "You should always reach the top of the hill.", "You only need water for a hike."],
    },
    vocab: [
      { word: "grip", meaning: "the ability to hold on to a surface without slipping", wrong: ["colour", "size", "price"] },
      { word: "trail", meaning: "a rough path for walking", wrong: ["a wide road", "a river", "a fence"] },
    ],
    sequence: [
      "Hiking is good exercise and shows you nature.",
      "Before you go, tell an adult and pack water, a hat, food and grippy shoes.",
      "On the trail, stay with the group and keep to the marked path.",
      "If the weather turns, return early rather than carry on.",
    ],
    notInText: ["Hiking must be done at night.", "You should hike alone to be quicker.", "Storms never happen in the hills."],
  },
];

// note-making bank per passage
const NOTES: Record<string, { good: string[]; bad: string[] }> = {
  "Why Hobbies Matter": {
    good: ["hobby = free-time activity you enjoy", "helps: rests mind, makes friends, builds patience", "best hobby: safe, cheap, easy to keep up"],
    bad: ["A hobby is something that you do during your free time because you really enjoy doing it and not because you must do it.", "reading gardening drawing football stamps", "hobbies homework"],
  },
  "Staying Safe on a Hike": {
    good: ["hiking = good exercise + see nature", "plan: tell adult, pack water/hat/food, grippy shoes", "on trail: stay with group, keep to path, return if weather turns"],
    bad: ["Hiking is a popular leisure activity and walking in the hills is very good exercise for your body.", "water hat food shoes birds plants", "weather storm"],
  },
};

export const intensiveReadingFactual: Skill = {
  id: "g5-eng-reading-intensive-factual",
  code: "R.10",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Intensive Reading: Factual Texts and Note-Making",
  description: "Read a factual text about leisure activities, relate it to your own experience, answer direct and inferential questions, and pick out good notes (key points, not full sentences).",
  generate(rng) {
    if (rng() < 0.24) {
      const key = randChoice(rng, Object.keys(NOTES));
      const n = NOTES[key];
      const good = shuffle(rng, n.good).slice(0, 2).map((t, i) => ({ id: `g${i}`, label: t, kind: "note" }));
      const bad = shuffle(rng, n.bad).slice(0, 3).map((t, i) => ({ id: `b${i}`, label: t, kind: "not-note" }));
      const items = shuffle(rng, [...good, ...bad]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.kind));
      return {
        kind: "categorize",
        passage: PASSAGES.find((p) => p.title === key)!.text,
        prompt: sortPrompt(rng, "whether each line is a good note or not"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "note", label: "Good note (short key point)" },
          { id: "not-note", label: "Not a good note" },
        ],
        correctBucket,
        hint: "Good notes are short key points in your own words — not whole copied sentences, and not just a list of words with no meaning.",
        explanation: "A good note captures one main point briefly. Copying a full sentence, or writing a string of loose words, is not useful note-making.",
      };
    }
    if (rng() < 0.28) {
      const opts = [
        { q: "Which of these is MOST like the passage's advice to 'choose a hobby you can keep up'?", answer: "Picking a hobby you can still enjoy on a school night, like sketching for ten minutes.", wrong: ["Starting five new hobbies in one week.", "Choosing the most expensive hobby your friend has.", "Doing a hobby only once and then stopping."] },
        { q: "Which of these best matches 'return early rather than get caught in a storm'?", answer: "Turning back from a walk when the sky turns dark, even before you reach the viewpoint.", wrong: ["Running to the top so you can say you finished.", "Leaving the group to look for shelter on your own.", "Ignoring the clouds and walking faster."] },
      ];
      const o = randChoice(rng, opts);
      const { choices, correctIndex } = mcFromCluster(rng, o.answer, o.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, "Connect the passage to a real choice you might make.", o.q),
        choices,
        correctIndex,
        layout: "list",
        hint: "Find the option that follows the same idea as the passage.",
        explanation: `"${o.answer}" follows the passage's advice most closely.`,
      };
    }
    return comprehensionBranch(rng, PASSAGES, "Read for the main points, and think how the advice applies to your own free time.");
  },
};
