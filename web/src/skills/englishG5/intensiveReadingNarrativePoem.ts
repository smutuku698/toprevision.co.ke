import type { Skill } from "@/lib/types";
import { randChoice } from "@/lib/rng";
import { comprehensionBranch, type Passage } from "./g5ReadingShared";
import { scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 2.0 National Celebrations, sub-strand 2.2 Intensive Reading:
// Oral Narrative (about 400 words) and Poem (about 5 stanzas). Focus: identify characters/places/events,
// PREDICT events, factual vs inferential questions, contextual clues.
// See curriculum-reference/grade-5/english.json.

const PASSAGES: Passage[] = [
  {
    title: "The Drummer of Jamhuri Day",
    text: "On Jamhuri Day, the whole village gathered at the field before sunrise. Kiptoo, the youngest drummer, had practised for a month. As the parade began, his drumstick slipped from his cold fingers and rolled towards the flagpole. The crowd went quiet. Kiptoo did not run after it. Instead, he kept the beat with his open hands until an elder quietly returned the stick. Afterwards, people said the boy with the calm hands would lead the drummers next year.",
    factual: [
      { q: "When did the village gather?", answer: "before sunrise", wrong: ["at noon", "after dark", "at lunchtime"] },
      { q: "Who was the youngest drummer?", answer: "Kiptoo", wrong: ["the elder", "the flag bearer", "the guest of honour"] },
      { q: "What rolled towards the flagpole?", answer: "the drumstick", wrong: ["the drum", "the flag", "a shoe"] },
      { q: "How long had Kiptoo practised?", answer: "a month", wrong: ["a week", "a year", "one day"] },
    ],
    inferential: [
      { q: "Why did Kiptoo's fingers let the stick slip?", answer: "they were cold", wrong: ["he was asleep", "the stick was broken", "someone pushed him"] },
      { q: "How did Kiptoo most likely feel when he kept the beat with his hands?", answer: "determined", wrong: ["bored", "sleepy", "angry at the crowd"] },
      { q: "Why did people say he would lead the drummers next year?", answer: "he stayed calm under pressure", wrong: ["he was the loudest", "he was the elder's son", "he ran the fastest"] },
    ],
    mainIdea: {
      answer: "A young drummer stays calm when things go wrong and earns everyone's respect.",
      wrong: ["A village decides not to hold a parade.", "An elder teaches children how to make drums.", "A boy loses a race on Jamhuri Day."],
    },
    vocab: [
      { word: "gathered", meaning: "came together in one place", wrong: ["went home", "fell asleep", "shouted loudly"] },
      { word: "quiet", meaning: "with little or no sound", wrong: ["very noisy", "full of colour", "moving fast"] },
    ],
    sequence: [
      "The village gathered at the field before sunrise.",
      "Kiptoo's drumstick slipped and rolled towards the flagpole.",
      "Kiptoo kept the beat with his open hands.",
      "An elder returned the stick and people praised the boy.",
    ],
    notInText: ["Kiptoo won a medal for running.", "It rained during the parade.", "The drum was made of metal."],
  },
  {
    title: "Grandmother's Flag",
    text: "Every Independence Day, Grandmother took a folded flag from the wooden box under her bed. She had sewn it herself many years ago, when the country was new. The stitches were uneven, and one corner had faded to pale green. Naliaka once asked why she did not buy a fresh one. Grandmother smiled and said, \"A new flag would forget everything this one remembers.\" That evening, Naliaka helped raise the old flag, and it snapped proudly in the wind.",
    factual: [
      { q: "Where did Grandmother keep the flag?", answer: "in a wooden box under her bed", wrong: ["on the roof", "at the market", "in the kitchen"] },
      { q: "Who had made the flag?", answer: "Grandmother", wrong: ["Naliaka", "a shopkeeper", "the village elder"] },
      { q: "Which part of the flag had faded?", answer: "one corner", wrong: ["the whole flag", "the pole", "the middle"] },
    ],
    inferential: [
      { q: "Why does Grandmother keep the old flag instead of buying a new one?", answer: "it holds memories that matter to her", wrong: ["she has no money", "she cannot find a shop", "she dislikes new things in general"] },
      { q: "What does Naliaka probably learn from Grandmother?", answer: "that old things can carry meaning", wrong: ["that sewing is easy", "that flags should be hidden", "that Independence Day is boring"] },
    ],
    mainIdea: {
      answer: "An old, hand-sewn flag is treasured because of the memories it carries.",
      wrong: ["A girl learns to sew a flag in one day.", "A family buys a new flag every year.", "A grandmother forgets where she put the flag."],
    },
    vocab: [
      { word: "uneven", meaning: "not straight or regular", wrong: ["very bright", "brand new", "made of metal"] },
      { word: "proudly", meaning: "in a way that shows honour and self-respect", wrong: ["sadly", "quietly", "carelessly"] },
    ],
    sequence: [
      "Grandmother took the folded flag from the wooden box.",
      "Naliaka asked why she did not buy a new one.",
      "Grandmother explained that a new flag would forget the memories.",
      "Naliaka helped raise the old flag that evening.",
    ],
    notInText: ["The flag was bought at a shop in Nairobi.", "Naliaka refused to help.", "The box was made of glass."],
  },
  {
    title: "Poem: Our Day (5 stanzas — extract)",
    text: "Stanza 1: The sun climbs slow above the hill, / the whole town wakes, the streets grow still.\nStanza 2: Then drums begin, a rolling sound, / and dancing feet stir up the ground.\nStanza 3: The elders speak of days gone by, / of those who taught us not to cry.\nStanza 4: We raise the flag, it lifts, it turns, / and in each chest a small fire burns.\nStanza 5: When evening comes the songs still ring; / of home and hope we softly sing.",
    factual: [
      { q: "What happens in stanza 2?", answer: "the drums begin and people dance", wrong: ["the sun sets", "the elders leave", "it starts to rain"] },
      { q: "What is raised in stanza 4?", answer: "the flag", wrong: ["a drum", "a house", "the sun"] },
      { q: "When do the songs still ring?", answer: "when evening comes", wrong: ["before sunrise", "at midday", "during the speeches"] },
    ],
    inferential: [
      { q: "What does 'a small fire burns' in each chest suggest?", answer: "a strong feeling of pride", wrong: ["the people are cold", "there is a real fire", "everyone is afraid"] },
      { q: "What is the mood of the poem?", answer: "proud and hopeful", wrong: ["angry and bitter", "bored and tired", "frightened and sad"] },
    ],
    mainIdea: {
      answer: "A town celebrates a national day from morning to evening with drums, dancing, speeches and song.",
      wrong: ["A poem about a storm ruining a parade.", "A poem about a child who oversleeps.", "A poem describing how to sew a flag."],
    },
    vocab: [
      { word: "still", meaning: "quiet and without movement", wrong: ["very loud", "moving quickly", "brightly coloured"] },
      { word: "softly", meaning: "in a gentle, quiet way", wrong: ["angrily", "in a shout", "very fast"] },
    ],
    sequence: [
      "The sun climbs above the hill and the town wakes.",
      "The drums begin and people dance.",
      "The elders speak of the past.",
      "The flag is raised and, by evening, the songs still ring.",
    ],
    notInText: ["A child gets lost in the crowd.", "The parade is cancelled.", "It snows during stanza 3."],
  },
];

// bespoke: prediction — what happens next, from clues in the passage
const PREDICT = [
  { setup: "Kiptoo has just kept the beat with his open hands, and the elder is walking towards him with the drumstick.", answer: "The elder will hand the stick back and Kiptoo will keep drumming.", wrong: ["Kiptoo will leave the parade in tears.", "The parade will be called off.", "The elder will take Kiptoo's drum away for good."] },
  { setup: "Grandmother has just said a new flag would 'forget everything this one remembers'.", answer: "Naliaka will help raise the old flag with her.", wrong: ["Naliaka will run to buy a new flag.", "Grandmother will throw the old flag away.", "They will decide not to raise any flag."] },
  { setup: "It is stanza 4 of the poem: the flag has just been raised and 'a small fire burns' in each chest.", answer: "The people will keep celebrating, and by evening they will still be singing.", wrong: ["Everyone will go home immediately.", "The flag will be taken down at once.", "The drums will never be played again."] },
];

export const intensiveReadingNarrativePoem: Skill = {
  id: "g5-eng-reading-intensive-narrative-poem",
  code: "R.2",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Intensive Reading: Narrative and Poem",
  description: "Read a short narrative or poem about national celebrations to identify characters, places and events, predict what happens next, and answer factual and inferential questions using contextual clues.",
  generate(rng) {
    if (rng() < 0.22) {
      const pr = randChoice(rng, PREDICT);
      const { choices, correctIndex } = mcFromCluster(rng, pr.answer, pr.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, pr.setup, "Using the clues, predict what happens next."),
        choices,
        correctIndex,
        layout: "list",
        hint: "A good prediction fits the clues in the text and the way the story has gone so far.",
        explanation: `"${pr.answer}" fits the clues best. Predictions that contradict the mood or events of the passage are unlikely.`,
      };
    }
    return comprehensionBranch(rng, PASSAGES, "Read the whole passage. Some answers are stated; others you work out from clues.");
  },
};
