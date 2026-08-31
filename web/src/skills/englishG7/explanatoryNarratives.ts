import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const NARRATIVES: {
  id: string;
  title: string;
  text: string;
  characters: string[];
  events: { id: string; label: string }[];
  moral: string;
  moralBlankBefore: string;
  moralBlankAfter: string;
  moralBlankAnswer: string;
}[] = [
  {
    id: "hare",
    title: "Why the Hare Never Travels Without a Map",
    text: "Long ago, Hare boasted to his friends that he never needed directions because he knew every path in the land. One day he set off alone to visit his cousin in a distant village without asking anyone for directions. Hare wandered through unfamiliar forest for three days, growing hungrier and wearier. Eventually, Tortoise found him lost near a riverbank and patiently walked with him, asking herders and travellers for directions along the way. Since that day, Hare always asks fellow travellers for directions before setting out on a long journey.",
    characters: ["Hare", "Tortoise"],
    events: [
      { id: "boast", label: "Hare boasts that he never needs directions" },
      { id: "setoff", label: "Hare sets off alone without asking anyone for directions" },
      { id: "lost", label: "Hare gets lost in unfamiliar forest for three days" },
      { id: "help", label: "Tortoise finds Hare and helps him ask for directions" },
      { id: "learn", label: "Hare learns to always ask for directions before a journey" },
    ],
    moral: "It is wise to ask for guidance rather than travel alone in pride.",
    moralBlankBefore: "It is wise to ask for ",
    moralBlankAfter: " rather than travel alone in pride.",
    moralBlankAnswer: "guidance",
  },
  {
    id: "matatu",
    title: "Why the Matatu Conductor Calls Out the Stops",
    text: "In the early days of public transport in Kenya, a young conductor named Baraka never announced the bus stops, assuming every passenger already knew the route. One rainy evening, an elderly woman missed her stop near Kericho and had to walk many kilometres back home in the dark. The following week, the woman's grandson, a driver himself, taught Baraka to call out each stop clearly before the vehicle slowed down. From that day, Baraka called out every stop, and passengers began praising him as the most helpful conductor on the route.",
    characters: ["Baraka", "the elderly woman", "her grandson"],
    events: [
      { id: "silent", label: "Baraka never announces bus stops, assuming passengers know the route" },
      { id: "miss", label: "An elderly woman misses her stop near Kericho on a rainy evening" },
      { id: "walk", label: "She must walk many kilometres home in the dark" },
      { id: "teach", label: "Her grandson teaches Baraka to call out each stop clearly" },
      { id: "praised", label: "Baraka becomes known as the most helpful conductor on the route" },
    ],
    moral: "Clear communication prevents unnecessary hardship for others.",
    moralBlankBefore: "Clear ",
    moralBlankAfter: " prevents unnecessary hardship for others.",
    moralBlankAnswer: "communication",
  },
  {
    id: "cherono",
    title: "Why Travellers Carry Water Across the Rift Valley",
    text: "Many years ago, a trader named Cherono crossed the Rift Valley without carrying any water, trusting that she would find a stream along the way. Midway through the journey, the sun grew fierce and every stream she had known was dry. A shepherd boy shared his gourd of water with her and showed her a hidden spring beyond a hill. Cherono survived the journey and, from then on, always carried enough water whenever she travelled, and she taught every trader she met to do the same.",
    characters: ["Cherono", "a shepherd boy"],
    events: [
      { id: "cross", label: "Cherono crosses the Rift Valley without carrying water" },
      { id: "dry", label: "The sun grows fierce and every stream she expected is dry" },
      { id: "share", label: "A shepherd boy shares his water and shows her a hidden spring" },
      { id: "survive", label: "Cherono survives the journey" },
      { id: "teach", label: "Cherono begins carrying enough water and teaches other traders to do the same" },
    ],
    moral: "Careful preparation before a journey can save your life.",
    moralBlankBefore: "Careful ",
    moralBlankAfter: " before a journey can save your life.",
    moralBlankAnswer: "preparation",
  },
  {
    id: "lamu",
    title: "Why the Old Road to Lamu Has a Resting Tree",
    text: "Long ago, a group of porters carried goods on foot from the mainland to Lamu, a journey that took two full days. One porter, Juma, collapsed from exhaustion halfway through the route because no one had planned a place to rest. The other porters carried him to the shade of a large baobab tree and waited until he recovered. From that day, every group of travellers on that road stopped to rest beneath the same baobab, which travellers still call the Resting Tree.",
    characters: ["Juma", "the other porters"],
    events: [
      { id: "carry", label: "Porters carry goods on foot from the mainland to Lamu" },
      { id: "collapse", label: "Juma collapses from exhaustion because no rest stop was planned" },
      { id: "shade", label: "The other porters carry him to the shade of a baobab tree" },
      { id: "recover", label: "Juma recovers after resting" },
      { id: "custom", label: "Travellers begin resting at the same tree, now called the Resting Tree" },
    ],
    moral: "Planning proper rest during a long journey protects everyone's wellbeing.",
    moralBlankBefore: "Planning proper ",
    moralBlankAfter: " during a long journey protects everyone's wellbeing.",
    moralBlankAnswer: "rest",
  },
];

const ALL_CHARACTERS = Array.from(new Set(NARRATIVES.flatMap((n) => n.characters)));

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What are the functions of oral narratives such as these travel tales?",
    correct: "They entertain listeners while also teaching moral lessons and practical wisdom",
    distractors: ["They exist only to make journeys feel shorter, with no other purpose", "They are only meant to be memorised word-for-word, not understood", "They have no connection to real-life lessons"],
  },
  {
    q: "Why is it important to identify the characters in a narrative before analysing the story?",
    correct: "Knowing who is involved helps the listener follow the events and understand each character's role in the lesson",
    distractors: ["Character names are the least important part of any narrative", "Characters only matter in written stories, not oral ones", "Identifying characters is only necessary for very long narratives"],
  },
  {
    q: "Why do explanatory narratives usually end by explaining a lasting custom, such as the Resting Tree?",
    correct: "It connects the story's events to something the listener can recognise afterwards, making the lesson memorable",
    distractors: ["It is simply a coincidence with no storytelling purpose", "It is meant to confuse the listener about the ending", "It replaces the need for a moral lesson"],
  },
  {
    q: "Why is listening comprehension especially important when following an explanatory narrative?",
    correct: "The listener must track characters, follow the sequence of events, and connect them to the moral being taught",
    distractors: ["Explanatory narratives never contain a sequence of events", "Only the first sentence of the narrative matters", "The order of events has no effect on understanding the story"],
  },
];

export const explanatoryNarratives: Skill = {
  id: "g7-eng-ls-explanatory-narratives",
  code: "LS.8",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Listening Comprehension: Explanatory Narratives",
  description: "Identify the characters in an explanatory narrative, sequence its events, explain its moral lesson, and acknowledge the importance of listening comprehension.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "mc-character", "mc-moral", "categorize", "fill", "concept"] as const);
    const hint = "An explanatory narrative follows characters through a problem, a turning point, and a lasting lesson or custom.";

    if (branch === "order") {
      const narrative = randChoice(rng, NARRATIVES);
      const items = shuffle(rng, narrative.events);
      return {
        kind: "ordering",
        prompt: `Arrange the events of "${narrative.title}" in the order they happen.`,
        instruction: "Click them in order.",
        passage: narrative.text,
        items,
        correctOrder: narrative.events.map((e) => e.id),
        hint: "Re-read the passage above and track what happens first, next, and last.",
        explanation: narrative.events.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "mc-character") {
      const narrative = randChoice(rng, NARRATIVES);
      const correctChar = randChoice(rng, narrative.characters);
      const otherChars = shuffle(rng, ALL_CHARACTERS.filter((c) => !narrative.characters.includes(c))).slice(0, 3);
      const choices = shuffle(rng, [correctChar, ...otherChars]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these characters appears in the narrative "${narrative.title}"?`,
        passage: narrative.text,
        choices,
        correctIndex: choices.indexOf(correctChar),
        layout: "list",
        hint: "Only one of these characters appears in this particular narrative — the others belong to different travel tales.",
        explanation: `"${correctChar}" is a character in "${narrative.title}". The other names belong to different travel narratives.`,
      };
    }

    if (branch === "mc-moral") {
      const narrative = randChoice(rng, NARRATIVES);
      const otherMorals = shuffle(rng, NARRATIVES.filter((n) => n.id !== narrative.id)).slice(0, 3).map((n) => n.moral);
      const choices = shuffle(rng, [narrative.moral, ...otherMorals]);
      return {
        kind: "multiple-choice",
        prompt: "What is the moral lesson of this narrative?",
        passage: narrative.text,
        choices,
        correctIndex: choices.indexOf(narrative.moral),
        layout: "list",
        hint: "The moral connects the character's mistake and its consequence to a lesson for the listener.",
        explanation: `The moral of "${narrative.title}" is: "${narrative.moral}"`,
      };
    }

    if (branch === "categorize") {
      const [a, b] = shuffle(rng, NARRATIVES).slice(0, 2);
      const items = shuffle(rng, [
        ...a.characters.map((label) => ({ id: `${a.id}-${label}`, label, narrativeId: a.id })),
        ...b.characters.map((label) => ({ id: `${b.id}-${label}`, label, narrativeId: b.id })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.narrativeId;
      return {
        kind: "categorize",
        prompt: "Sort each character into the narrative they belong to.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: a.id, label: a.title },
          { id: b.id, label: b.title },
        ],
        correctBucket,
        hint: "Think about which travel tale each character was part of.",
        explanation: `${a.title}: ${a.characters.join(", ")}. ${b.title}: ${b.characters.join(", ")}.`,
      };
    }

    if (branch === "fill") {
      const narrative = randChoice(rng, NARRATIVES);
      return {
        kind: "fill-blank",
        prompt: `Fill in the missing word to complete the moral lesson of "${narrative.title}".`,
        passage: narrative.text,
        before: narrative.moralBlankBefore,
        after: narrative.moralBlankAfter,
        correctAnswer: narrative.moralBlankAnswer,
        inputMode: "text",
        hint: "Think of the one quality the character was missing at the start of the story.",
        explanation: `The moral reads: "${narrative.moral}"`,
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
