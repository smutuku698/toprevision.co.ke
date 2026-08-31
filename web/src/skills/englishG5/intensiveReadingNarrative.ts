import type { Skill } from "@/lib/types";
import { randChoice } from "@/lib/rng";
import { comprehensionBranch, type Passage } from "./g5ReadingShared";
import { scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 3.0 Etiquette-Table Manners, sub-strand 3.2 Intensive Reading:
// Narrative of about 400 words. Focus: relate events to their own life experiences, predict, create
// mental images, factual and inferential questions. See curriculum-reference/grade-5/english.json.

const PASSAGES: Passage[] = [
  {
    title: "The Guest Who Forgot",
    text: "Amina had waited all week for the visit from her cousin Baraka. At dinner, Baraka reached across the table for the salt without asking, knocking over Amina's glass of juice. He did not say sorry. He chewed with his mouth open and talked at the same time, so bits of ugali fell onto the cloth. Amina's mother said nothing, but she quietly passed Baraka a napkin and asked him about school. By the end of the meal, Baraka had noticed how the others waited, asked politely, and covered their mouths. \"I think,\" he said slowly, \"I have some things to learn about eating with people.\"",
    factual: [
      { q: "Who was coming to visit Amina?", answer: "her cousin Baraka", wrong: ["her teacher", "her grandmother", "a neighbour"] },
      { q: "What did Baraka knock over?", answer: "Amina's glass of juice", wrong: ["a plate of ugali", "the salt pot", "a chair"] },
      { q: "What did Amina's mother pass to Baraka?", answer: "a napkin", wrong: ["more salt", "a fork", "a glass of water"] },
    ],
    inferential: [
      { q: "Why did Amina's mother stay calm and ask about school?", answer: "to correct Baraka gently, without shaming him", wrong: ["she did not notice the mess", "she was angry and could not speak", "she wanted Baraka to leave"] },
      { q: "What has Baraka realised by the end of the meal?", answer: "his table manners need to improve", wrong: ["the food was not tasty", "the family does not like him", "he should eat alone next time"] },
    ],
    mainIdea: {
      answer: "A boy with poor table manners learns better ones by watching a family eat politely.",
      wrong: ["A family argues about who should sit where.", "A boy refuses to eat dinner with his cousin.", "A mother teaches a cooking lesson."],
    },
    vocab: [
      { word: "quietly", meaning: "without making a fuss or noise", wrong: ["angrily", "very loudly", "in a hurry"] },
      { word: "politely", meaning: "in a way that shows good manners", wrong: ["rudely", "sleepily", "roughly"] },
    ],
    sequence: [
      "Baraka reached across the table and knocked over the juice.",
      "He chewed with his mouth open and talked at the same time.",
      "Amina's mother passed him a napkin and asked about school.",
      "Baraka noticed the others' manners and said he had things to learn.",
    ],
    notInText: ["Baraka broke a plate on purpose.", "Amina left the table crying.", "The family was eating at a restaurant."],
  },
  {
    title: "Waiting for the Blessing",
    text: "At Grandfather's house, no one lifts a fork until he has said the blessing. The first time Wanjiru's friend Cherono came to stay, she picked up her spoon the moment the food was served. Everyone looked at her. Cherono's face grew hot. Wanjiru whispered, \"We wait for Grandfather.\" Cherono put the spoon down and folded her hands like the others. After the blessing, Grandfather smiled at her and said, \"Now we eat.\" Later, Cherono told Wanjiru she liked the waiting, because it made the meal feel important.",
    factual: [
      { q: "What does no one do until Grandfather speaks?", answer: "lift a fork / start eating", wrong: ["leave the room", "close the windows", "clear the plates"] },
      { q: "What did Cherono pick up too early?", answer: "her spoon", wrong: ["a knife", "a cup", "a plate"] },
      { q: "Who whispered to Cherono?", answer: "Wanjiru", wrong: ["Grandfather", "Cherono's mother", "the cook"] },
    ],
    inferential: [
      { q: "Why did Cherono's face grow hot?", answer: "she felt embarrassed", wrong: ["the food was spicy", "she sat near the fire", "she had been running"] },
      { q: "Why does Cherono end up liking the custom?", answer: "waiting makes the meal feel special", wrong: ["she gets more food", "she can leave early", "the blessing is very short"] },
    ],
    mainIdea: {
      answer: "A visitor learns and comes to value a family's custom of waiting for a blessing before eating.",
      wrong: ["A grandfather refuses to let a guest eat.", "Two friends argue about cutlery.", "A family stops saying the blessing."],
    },
    vocab: [
      { word: "whispered", meaning: "spoke very softly", wrong: ["shouted", "sang", "laughed"] },
      { word: "folded", meaning: "put together neatly", wrong: ["threw", "washed", "hid"] },
    ],
    sequence: [
      "The food was served and Cherono picked up her spoon.",
      "Everyone looked at her and Wanjiru whispered to wait.",
      "Cherono put the spoon down and folded her hands.",
      "After the blessing, Grandfather said, \"Now we eat.\"",
    ],
    notInText: ["Cherono refused to eat anything.", "Grandfather was not at home.", "They ate outside under a tree."],
  },
];

// bespoke: relate the passage to a real-life situation
const RELATE = [
  {
    q: "Which real-life situation is MOST like Baraka learning table manners by watching the family?",
    answer: "A new pupil watches how classmates line up quietly for lunch, then does the same.",
    wrong: ["A pupil finishes a maths test before everyone else.", "A pupil forgets their homework at home.", "A pupil chooses a book from the library."],
  },
  {
    q: "Which real-life situation is MOST like Cherono waiting for the blessing?",
    answer: "At a friend's home, you wait for the host to start eating before you begin.",
    wrong: ["You run to catch the school bus before it leaves.", "You buy a snack at the shop on the way home.", "You water the plants in the garden."],
  },
];

export const intensiveReadingNarrative: Skill = {
  id: "g5-eng-reading-intensive-narrative",
  code: "R.3",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Intensive Reading: Relating a Narrative to Real Life",
  description: "Read a short narrative about etiquette and table manners, create mental images, relate the events to your own experiences, and answer factual and inferential questions.",
  generate(rng) {
    if (rng() < 0.22) {
      const r = randChoice(rng, RELATE);
      const { choices, correctIndex } = mcFromCluster(rng, r.answer, r.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, "Good readers connect a story to their own life.", r.q),
        choices,
        correctIndex,
        layout: "list",
        hint: "Look for the situation that shows the SAME idea as the passage, not just anything from school.",
        explanation: `"${r.answer}" — it shows the same idea as the passage: learning the right way to behave by watching and following others.`,
      };
    }
    return comprehensionBranch(rng, PASSAGES, "Picture the scene as you read, and connect it to times you have eaten with others.");
  },
};
