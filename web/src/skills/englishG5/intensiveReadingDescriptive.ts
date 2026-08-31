import type { Skill } from "@/lib/types";
import { randChoice } from "@/lib/rng";
import { comprehensionBranch, type Passage } from "./g5ReadingShared";
import { scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 9.0 Communicable Diseases, sub-strand 9.2 Intensive Reading:
// Descriptive Fictional or Non-Fictional Texts (about 400 words). Focus: identify the main idea in each
// paragraph, visualise, summarise the main points, direct and inferential questions.
// See curriculum-reference/grade-5/english.json.

const PASSAGES: Passage[] = [
  {
    title: "How a Cold Spreads",
    text: "Paragraph 1: A common cold is caused by a tiny virus. It is far too small to see, even with a hand lens, yet it can pass from one person to many in a single day.\nParagraph 2: When a person with a cold sneezes without covering their nose, thousands of droplets fly into the air. Other people breathe them in, or the droplets land on a desk or a door handle.\nParagraph 3: The next person touches that surface, then rubs their eyes or nose. The virus now has a new home. This is why covering a sneeze and washing hands break the chain.",
    factual: [
      { q: "What causes a common cold?", answer: "a tiny virus", wrong: ["dirty water", "cold weather alone", "eating late"] },
      { q: "What flies into the air when someone sneezes uncovered?", answer: "thousands of droplets", wrong: ["smoke", "dust from the floor", "germs from food"] },
      { q: "What two actions break the chain?", answer: "covering a sneeze and washing hands", wrong: ["drinking milk and resting", "closing windows and sweeping", "wearing a hat and gloves"] },
    ],
    inferential: [
      { q: "Why is a door handle a risky place?", answer: "many people touch it, so it can pass the virus on", wrong: ["it is always cold", "it is made of metal", "it is near a window"] },
      { q: "What is the writer's purpose?", answer: "to explain how a cold spreads and how to stop it", wrong: ["to tell a funny story", "to describe a doctor's day", "to sell medicine"] },
    ],
    mainIdea: {
      answer: "A cold virus spreads through droplets and surfaces, and simple habits can stop it.",
      wrong: ["Colds only happen in cold weather.", "Viruses can be seen with a hand lens.", "Door handles should be removed from schools."],
    },
    vocab: [
      { word: "droplets", meaning: "very small drops of liquid", wrong: ["large puddles", "grains of sand", "pieces of paper"] },
      { word: "chain", meaning: "a series of linked steps, one leading to the next", wrong: ["a metal fence", "a single event", "a type of medicine"] },
    ],
    sequence: [
      "A tiny virus causes the cold.",
      "An uncovered sneeze sends droplets into the air and onto surfaces.",
      "Another person touches the surface, then their eyes or nose.",
      "Covering sneezes and washing hands break the chain.",
    ],
    notInText: ["The cold virus glows in the dark.", "Colds are cured by sunlight.", "Only children catch colds."],
  },
  {
    title: "A Visit to the Clinic",
    text: "Paragraph 1: The clinic waiting room was calm and clean. Rows of blue chairs faced a wall of bright posters about safe water and hand-washing.\nParagraph 2: A nurse in a white coat called each patient by name. She spoke slowly and wrote careful notes in a large book, checking each answer twice.\nParagraph 3: In a small side room, a health worker showed a mother how to mix a rehydration drink: a little salt, a little sugar, clean boiled water, stirred until it dissolved. 'This,' she said, 'can save a child with diarrhoea.'",
    factual: [
      { q: "What faced the wall of posters?", answer: "rows of blue chairs", wrong: ["a row of beds", "a line of desks", "green benches"] },
      { q: "What was the nurse wearing?", answer: "a white coat", wrong: ["a blue apron", "a green uniform", "a raincoat"] },
      { q: "What three things go into the rehydration drink?", answer: "salt, sugar and clean boiled water", wrong: ["milk, tea and honey", "juice, salt and ice", "water, flour and oil"] },
    ],
    inferential: [
      { q: "Why does the nurse check each answer twice?", answer: "to make sure the notes are accurate", wrong: ["she cannot read", "she has extra time", "the book is very large"] },
      { q: "Why does the health worker teach the mother the drink?", answer: "so she can treat her child at home if needed", wrong: ["so the mother can sell it", "to fill the waiting time", "because the clinic has no medicine at all"] },
    ],
    mainIdea: {
      answer: "A calm, careful clinic gives patients attention and teaches families how to prevent and treat illness.",
      wrong: ["A clinic runs out of chairs.", "A nurse loses her notebook.", "A mother refuses the health worker's advice."],
    },
    vocab: [
      { word: "dissolved", meaning: "mixed completely into the liquid so it could not be seen", wrong: ["floated on top", "turned solid", "spilled out"] },
      { word: "rehydration", meaning: "putting lost water and salts back into the body", wrong: ["a kind of injection", "a type of bandage", "a way of cooking"] },
    ],
    sequence: [
      "The waiting room is calm, with posters about safe water and hand-washing.",
      "The nurse calls each patient by name and writes careful notes.",
      "In a side room, a health worker shows a mother the rehydration drink.",
      "She stirs it until it dissolves and says it can save a child with diarrhoea.",
    ],
    notInText: ["The clinic is on a boat.", "The nurse gives every patient an injection.", "The posters are about football."],
  },
];

const SUMMARY = [
  {
    title: "How a Cold Spreads",
    best: "A cold is caused by a virus that spreads through droplets and surfaces; covering sneezes and washing hands stop it.",
    wrong: [
      "A virus is too small to see even with a hand lens.",
      "Someone sneezed and droplets landed on a door handle.",
      "Colds are very common in schools during term time.",
    ],
  },
  {
    title: "A Visit to the Clinic",
    best: "A clean, careful clinic gives patients attention and teaches families to prevent illness and to make a life-saving rehydration drink.",
    wrong: [
      "The waiting room had rows of blue chairs and bright posters.",
      "The nurse wore a white coat and wrote in a large book.",
      "The health worker used a little salt and a little sugar.",
    ],
  },
];

export const intensiveReadingDescriptive: Skill = {
  id: "g5-eng-reading-intensive-descriptive",
  code: "R.9",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Intensive Reading: Descriptive Texts and Summarising",
  description: "Read a descriptive text about communicable diseases, find the main idea of each paragraph, visualise the scene, and choose the best summary of the whole passage.",
  generate(rng) {
    if (rng() < 0.22) {
      const s = randChoice(rng, SUMMARY);
      const { choices, correctIndex } = mcFromCluster(rng, s.best, s.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `You have read the passage "${s.title}".`, "Which is the BEST summary of the whole passage?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "A good summary covers the main points of the whole passage — not just one detail from it.",
        explanation: `"${s.best}" covers the main points. The other options are true but are single small details, not a summary.`,
      };
    }
    return comprehensionBranch(rng, PASSAGES, "Each paragraph has one main idea. Picture the scene as you read.");
  },
};
