import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGES: {
  id: string;
  text: string;
  title: string;
  distractorTitles: string[];
  mainIdea: string;
  details: string[];
  character: string;
  characterDescription: string;
  characterDistractors: string[];
  inferWord: string;
  inferBefore: string;
  inferAfter: string;
  inferCorrect: string;
  inferDistractors: string[];
  factualQ: string;
  factualCorrect: string;
  factualDistractors: string[];
}[] = [
  {
    id: "beadwork",
    text: "Grandmother Wanjiku sat beneath the mango tree, threading tiny beads onto a string with practiced ease. She explained that the red beads symbolised courage, while the white beads stood for peace. As a girl, she had learned this intricate Kikuyu beadwork from her own mother, and now she was determined to pass the skill on to her granddaughter before it disappeared entirely.",
    title: "Passing Down the Art of Beadwork",
    distractorTitles: ["A Trip to the Market", "The Fastest Runner in the Village", "Learning to Cook Ugali"],
    mainIdea: "Grandmother Wanjiku is determined to pass down the traditional art of beadwork to the next generation.",
    details: [
      "The red beads symbolised courage, and the white beads stood for peace.",
      "Grandmother Wanjiku learned Kikuyu beadwork from her own mother as a girl.",
      "She was determined to pass the skill on to her granddaughter before it disappeared.",
    ],
    character: "Grandmother Wanjiku",
    characterDescription: "A patient, skilled woman determined to preserve her family's beadwork tradition",
    characterDistractors: [
      "A careless woman who has forgotten her own culture",
      "A young girl learning beadwork for the very first time",
      "A trader selling beads at the local market",
    ],
    inferWord: "intricate",
    inferBefore: "As a girl, she had learned this",
    inferAfter: "Kikuyu beadwork from her own mother.",
    inferCorrect: "detailed and delicately made",
    inferDistractors: ["plain and simple", "large and heavy", "cheap and low-quality"],
    factualQ: "What did the red beads symbolise in the passage?",
    factualCorrect: "Courage",
    factualDistractors: ["Peace", "Wealth", "Friendship"],
  },
  {
    id: "kitenge",
    text: "At his small shop in Kisumu, tailor Otieno bent over his sewing machine, transforming a bolt of vivid kitenge fabric into a graceful dress. He examined every seam meticulously, unwilling to let a single stitch go crooked. Customers travelled from nearby towns just to have Otieno stitch their kitenge garments for weddings and other celebrations.",
    title: "A Skilled Tailor and His Kitenge Creations",
    distractorTitles: ["The History of Kenyan Railways", "A Football Match in Kisumu", "Planting Maize During the Rains"],
    mainIdea: "Otieno is a skilled tailor whose careful kitenge work draws customers from far away.",
    details: [
      "Otieno examined every seam meticulously, unwilling to let a single stitch go crooked.",
      "He was transforming a bolt of vivid kitenge fabric into a graceful dress.",
      "Customers travelled from nearby towns for their kitenge garments.",
    ],
    character: "Otieno",
    characterDescription: "A careful, skilled tailor whose reputation attracts customers from far away",
    characterDistractors: [
      "A careless tailor who rushes through his work",
      "A customer shopping for a wedding dress",
      "A farmer who also sells fabric on the side",
    ],
    inferWord: "meticulously",
    inferBefore: "He examined every seam",
    inferAfter: ", unwilling to let a single stitch go crooked.",
    inferCorrect: "with great care and attention to detail",
    inferDistractors: ["quickly and carelessly", "loudly and proudly", "rarely and reluctantly"],
    factualQ: "Why did customers travel from nearby towns to see Otieno?",
    factualCorrect: "To have him stitch their kitenge garments for celebrations",
    factualDistractors: ["To buy sewing machines from his shop", "To learn how to grow cotton", "To sell him fabric"],
  },
  {
    id: "shuka",
    text: "Elder Ole Sankale wrapped his red-and-blue shuka firmly around his shoulders before the morning market began. The distinctive checked cloth marked him instantly as Maasai, a symbol of identity passed down through generations. Younger relatives sometimes teased him about wearing modern clothes instead, but he insisted the shuka connected him to his heritage.",
    title: "The Shuka: A Symbol of Maasai Identity",
    distractorTitles: ["A New Road Through the Rift Valley", "Herding Cattle at Dawn", "The Story of Kenya's First President"],
    mainIdea: "Elder Ole Sankale values the shuka as a proud symbol of his Maasai heritage.",
    details: [
      "The distinctive checked cloth marked him instantly as Maasai.",
      "It is a symbol of identity passed down through generations.",
      "Younger relatives teased him, but he insisted it connected him to his heritage.",
    ],
    character: "Elder Ole Sankale",
    characterDescription: "A proud man who values the shuka as a connection to his Maasai heritage",
    characterDistractors: [
      "A tourist buying a shuka as a souvenir",
      "A tailor who designs modern clothing",
      "A young boy who has never seen a shuka before",
    ],
    inferWord: "distinctive",
    inferBefore: "The",
    inferAfter: "checked cloth marked him instantly as Maasai.",
    inferCorrect: "easily recognisable because it is different from others",
    inferDistractors: ["completely ordinary and unremarkable", "torn and faded", "borrowed from someone else"],
    factualQ: "What did Elder Ole Sankale insist the shuka did for him?",
    factualCorrect: "Connected him to his heritage",
    factualDistractors: ["Kept him warm during the rains", "Made him look younger", "Helped him sell more cattle"],
  },
  {
    id: "designer",
    text: "Fashion designer Aisha Mwangi combed through her grandmother's old photographs, studying the intricate patterns of traditional coastal garments. She was reviving these forgotten designs for a modern audience, blending them with contemporary cuts. Her latest collection, inspired by Swahili textiles, sold out within hours at a Nairobi exhibition.",
    title: "Reviving Traditional Fashion for a New Generation",
    distractorTitles: ["A Guide to Nairobi's Traffic Jams", "The Life Cycle of a Butterfly", "Building a New School Library"],
    mainIdea: "Aisha Mwangi is reviving traditional coastal fashion designs for a modern audience.",
    details: [
      "Aisha Mwangi studied intricate patterns from her grandmother's old photographs.",
      "She blended traditional coastal designs with contemporary cuts.",
      "Her Swahili-textile-inspired collection sold out within hours at a Nairobi exhibition.",
    ],
    character: "Aisha Mwangi",
    characterDescription: "A creative designer who honours tradition while innovating for modern tastes",
    characterDistractors: [
      "A historian who only studies old photographs",
      "A tourist visiting the coast for the first time",
      "A shopkeeper selling imported clothes",
    ],
    inferWord: "reviving",
    inferBefore: "She was",
    inferAfter: "these forgotten designs for a modern audience.",
    inferCorrect: "bringing something back into use or popularity",
    inferDistractors: ["destroying something completely", "copying something without permission", "hiding something from view"],
    factualQ: "What inspired Aisha Mwangi's latest collection?",
    factualCorrect: "Swahili textiles",
    factualDistractors: ["European fashion magazines", "Her own childhood clothes", "A television advertisement"],
  },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is reading comprehension important beyond just passing exams?",
    correct: "It helps a person understand and use information from everyday texts throughout life",
    distractors: [
      "It is only useful while a learner is still in school",
      "It matters only when reading fiction, never non-fiction",
      "It has no real use once a learner leaves school",
    ],
  },
  {
    q: "What does giving a passage an 'appropriate title' require a reader to do?",
    correct: "Sum up the passage's main idea in a short, accurate phrase",
    distractors: [
      "Copy the passage's first sentence exactly",
      "Choose any title, regardless of the passage's content",
      "Pick the longest possible phrase that describes the setting",
    ],
  },
];

export const readingComprehension: Skill = {
  id: "g7-eng-r-reading-comprehension",
  code: "R.12",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Comprehension",
  description: "Identify main ideas in passages about traditional Kenyan fashion, infer word meanings from context, and describe characters, ideas, and events.",
  generate(rng) {
    const branch = randChoice(rng, ["title", "detail", "character", "matchCharacter", "infer", "fill", "factual", "concept"] as const);
    const hint = "Look for the idea that every sentence in the passage relates back to — that is usually the main idea.";

    if (branch === "matchCharacter") {
      const tokens = shuffle(rng, PASSAGES.map((p) => ({ id: p.id, label: p.character })));
      const targets = shuffle(rng, PASSAGES.map((p) => ({ id: p.id, label: p.characterDescription })));
      const correctMap: Record<string, string> = {};
      for (const p of PASSAGES) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: "Match each character to the description that best fits them.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each character does in their passage, not just their name.",
        explanation: PASSAGES.map((p) => `${p.character}: ${p.characterDescription}.`).join(" "),
      };
    }

    if (branch === "title") {
      const passage = randChoice(rng, PASSAGES);
      const choices = shuffle(rng, [passage.title, ...passage.distractorTitles]);
      return {
        kind: "multiple-choice",
        prompt: "Which title best fits this passage?",
        passage: passage.text,
        choices,
        correctIndex: choices.indexOf(passage.title),
        layout: "list",
        hint,
        explanation: `"${passage.title}" fits best because it sums up what the whole passage is about.`,
      };
    }

    if (branch === "detail") {
      const passage = randChoice(rng, PASSAGES);
      const items = shuffle(rng, [
        { id: "main", label: passage.mainIdea },
        ...passage.details.map((d, i) => ({ id: `d${i}`, label: d })),
      ]);
      const correctBucket: Record<string, string> = { main: "main" };
      passage.details.forEach((_, i) => (correctBucket[`d${i}`] = "detail"));
      return {
        kind: "categorize",
        prompt: "Sort each sentence into Main Idea or Supporting Detail.",
        passage: passage.text,
        items,
        buckets: [
          { id: "main", label: "Main idea" },
          { id: "detail", label: "Supporting detail" },
        ],
        correctBucket,
        hint,
        explanation: `"${passage.mainIdea}" is the main idea. The other sentences are supporting details.`,
      };
    }

    if (branch === "character") {
      const passage = randChoice(rng, PASSAGES);
      const choices = shuffle(rng, [passage.characterDescription, ...passage.characterDistractors]);
      return {
        kind: "multiple-choice",
        prompt: `Based on the passage, how would you best describe ${passage.character}?`,
        passage: passage.text,
        choices,
        correctIndex: choices.indexOf(passage.characterDescription),
        layout: "list",
        hint: "Look at what the character does and says, not just their name, to describe them.",
        explanation: `${passage.character} is best described as: ${passage.characterDescription.toLowerCase()}.`,
      };
    }

    if (branch === "infer") {
      const passage = randChoice(rng, PASSAGES);
      const choices = shuffle(rng, [passage.inferCorrect, ...passage.inferDistractors]);
      return {
        kind: "multiple-choice",
        passage: passage.text,
        prompt: `As used in the passage, what does the word "${passage.inferWord}" most likely mean?`,
        choices,
        correctIndex: choices.indexOf(passage.inferCorrect),
        layout: "list",
        hint: "Look at the words and situation around the unfamiliar word for clues about its meaning.",
        explanation: `In this passage, "${passage.inferWord}" means: ${passage.inferCorrect}.`,
      };
    }

    if (branch === "fill") {
      const passage = randChoice(rng, PASSAGES);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word from the passage.",
        passage: passage.text,
        before: passage.inferBefore,
        after: passage.inferAfter,
        correctAnswer: passage.inferWord,
        inputMode: "text",
        hint: "Recall the exact word used in the passage.",
        explanation: `The passage reads: "${passage.inferBefore} ${passage.inferWord} ${passage.inferAfter}"`,
      };
    }

    if (branch === "factual") {
      const passage = randChoice(rng, PASSAGES);
      const choices = shuffle(rng, [passage.factualCorrect, ...passage.factualDistractors]);
      return {
        kind: "multiple-choice",
        prompt: passage.factualQ,
        passage: passage.text,
        choices,
        correctIndex: choices.indexOf(passage.factualCorrect),
        layout: "list",
        hint: "The answer is stated directly in the passage — read carefully to find it.",
        explanation: `According to the passage: ${passage.factualCorrect}.`,
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
