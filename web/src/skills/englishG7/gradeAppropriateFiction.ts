import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const COVER_CLUES: { text: string; bucket: "fiction" | "nonfiction" }[] = [
  { text: "A book cover showing a girl in armour riding a lion, titled 'The Girl Who Tamed the Mountain', labelled 'A Novel' on the spine", bucket: "fiction" },
  { text: "A book cover showing a real photograph of Wangari Maathai planting a tree, titled 'Wangari Maathai: Her Life Story', labelled 'Biography'", bucket: "nonfiction" },
  { text: "A blurb reading: 'When young Atieno discovers a hidden path through Karura Forest, she meets a spirit who challenges her to prove her courage.'", bucket: "fiction" },
  { text: "A blurb reading: 'This book documents the true events of the 1963 independence celebrations, drawn from newspaper archives and interviews.'", bucket: "nonfiction" },
  { text: "A title reading 'The Brave Warrior of Nandi Hills: A Legend Retold', illustrated with a drawn, cartoon-style warrior on the cover", bucket: "fiction" },
  { text: "A title reading 'Athletics in Kenya: Facts and Records', with a real photograph of a stadium on the cover", bucket: "nonfiction" },
  { text: "A blurb reading: 'Inspired by real events, this story imagines a young messenger who carries a secret letter through the Mau Mau forests.'", bucket: "fiction" },
  { text: "A title reading 'Great Leaders of Kenya: A Reference Guide', printed with real portrait photographs of each leader inside", bucket: "nonfiction" },
];

const FICTION_ELEMENTS: { name: string; description: string }[] = [
  { name: "Character", description: "The people or animals who take part in the story's events" },
  { name: "Setting", description: "The time and place in which the story happens" },
  { name: "Plot", description: "The sequence of events that make up the story, from beginning to end" },
  { name: "Theme", description: "The central message or lesson the story is trying to share" },
  { name: "Conflict", description: "The main problem or struggle a character must face and try to overcome" },
  { name: "Resolution", description: "The way the story's main problem is finally settled by the end" },
];

const SCENARIO_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Kiptoo wants a fictional story about a Kenyan hero for enjoyment over the holidays, written at his own Grade 7 reading level. Which book should he choose?",
    correct: "A Grade 7-level adventure novel inspired by the courage of a Kenyan freedom fighter",
    distractors: [
      "A postgraduate research thesis about the Mau Mau uprising",
      "A picture book about farm animals meant for toddlers",
      "A repair manual for fixing bicycles",
    ],
    explanation: "This choice matches all three factors: it is fiction, it fits his Grade 7 reading level, and it suits his purpose of reading for enjoyment.",
  },
  {
    q: "Amani is researching true facts about Wangari Maathai's real achievements for a school project. Which is the most appropriate text for her purpose?",
    correct: "A non-fiction biography of Wangari Maathai",
    distractors: [
      "A fictional adventure story loosely inspired by a tree-planting hero",
      "A collection of imaginary folktales about talking animals",
      "A fantasy novel about a girl who can control the weather",
    ],
    explanation: "Amani's purpose is factual research, so a non-fiction biography suits her need far better than any fictional text, even one on a similar topic.",
  },
  {
    q: "Faith enjoys stories about courage and wants to read a variety of fictional texts, not always the same type of story. Which choice best reflects 'a variety'?",
    correct: "Alternating between an adventure novel, a retold legend, and a short story collection, all about different Kenyan heroes",
    distractors: [
      "Reading only adventure novels about the exact same hero, one after another",
      "Reading the same single book five times in a row",
      "Reading only non-fiction reference books and no fiction at all",
    ],
    explanation: "Selecting a variety of fictional texts, such as different genres and forms, exposes a reader to a wider range of ideas, characters, and writing styles.",
  },
  {
    q: "Brian picks up a novel about a Kenyan hero that is written far above his own reading level, full of words he does not understand, even though the topic interests him greatly. What should he do?",
    correct: "Choose a book on a similar topic that is closer to his own reading level",
    distractors: [
      "Force himself through it without understanding most sentences",
      "Give up on reading fiction altogether",
      "Ask someone to read the entire novel aloud to him instead",
    ],
    explanation: "A book's difficulty level matters as much as its interesting topic — choosing a similar-topic book he can actually read keeps his enjoyment of fiction alive.",
  },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is reading fiction about Kenyan heroes and heroines valuable, even though the stories are imagined?",
    correct: "Fictional stories can still teach real values like courage and perseverance, often inspired by real people's lives",
    distractors: [
      "Fiction has no value at all since the events never truly happened",
      "Fiction is only worth reading if every detail in it is completely factual",
      "Fictional stories about heroes are only appropriate for adults, not learners",
    ],
  },
  {
    q: "What is one enjoyable benefit of reading a variety of fictional texts?",
    correct: "It lets a reader imagine different times, places, and characters purely for pleasure",
    distractors: [
      "It guarantees the reader will memorise every fact in the story",
      "It is the only way to improve one's handwriting",
      "It removes the need to ever read non-fiction again",
    ],
  },
  {
    q: "Why should a reader select a variety of fictional texts rather than always choosing the same type of story?",
    correct: "Different genres and styles of fiction expose a reader to new ideas, settings, and characters",
    distractors: [
      "Reading only one type of story is always faster and therefore better",
      "Variety in fiction has no real effect on a reader's enjoyment or growth",
      "A reader should only ever choose books recommended by classmates",
    ],
  },
  {
    q: "What should a reader consider first when selecting a fictional text for extensive reading?",
    correct: "Whether its topic, difficulty level, and length genuinely suit the reader's own interest and ability",
    distractors: [
      "Only the colour of the book's cover",
      "Only how many other classmates have already read it",
      "Only whether the book is the newest one available",
    ],
  },
];

const CONNECTION_MC: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "A fictional story describes a young girl, inspired by Wangari Maathai, who convinces her village to plant trees to stop soil erosion. Which real-life lesson does this story connect to?",
    correct: "Individuals, even young people, can take real action to protect the environment",
    distractors: [
      "Only adults are ever able to make a real difference in their community",
      "Planting trees has no real effect on soil erosion in real life",
      "Fictional stories about the environment are never based on anything true",
    ],
  },
  {
    q: "A fictional story imagines a boy who carries a secret message through the forest during Kenya's struggle for independence. Which real-life value does this story most connect to?",
    correct: "Bravery and sacrifice were important during Kenya's real struggle for independence",
    distractors: [
      "Messages were only ever delivered by adults during that time",
      "The story proves that forests in Kenya no longer exist today",
      "Fiction about history always replaces the need to study real history",
    ],
  },
  {
    q: "A fictional tale retells the legend of a warrior who defends his community using wisdom rather than only weapons. Which real-life lesson does this connect to?",
    correct: "Clever thinking and wise decisions can solve problems just as effectively as force",
    distractors: [
      "Warriors in real life never use wisdom, only physical strength",
      "This lesson only applies to ancient legends, never to modern life",
      "The story suggests that weapons are the only way to solve any problem",
    ],
  },
];

const ORDER_STEPS = [
  { id: "cover", label: "Look at the book's cover for clues about whether it is fiction or non-fiction" },
  { id: "blurb", label: "Read the blurb on the back cover to learn about the characters and plot" },
  { id: "title", label: "Check the title for hints about the story's genre or subject" },
  { id: "skim", label: "Skim the first page to see if the writing style and reading level suit you" },
  { id: "choose", label: "Choose the book if it matches your interest and reading level" },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "The people or animals who take part in a story's events are called its ", after: ".", correctAnswer: "characters" },
  { before: "The time and place in which a story happens is called its ", after: ".", correctAnswer: "setting" },
  { before: "The sequence of events that make up a story, from beginning to end, is called its ", after: ".", correctAnswer: "plot" },
  { before: "The central message or lesson a story shares with its reader is called its ", after: ".", correctAnswer: "theme" },
  { before: "The main problem or struggle a character must face and try to overcome is called the ", after: ".", correctAnswer: "conflict" },
];

export const gradeAppropriateFiction: Skill = {
  id: "g7-eng-r-grade-appropriate-fiction",
  code: "R.9",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Extensive Reading: Grade-Appropriate Fiction",
  description: "Select a variety of fictional texts, including stories on Kenyan heroes and heroines, for reading and enjoyment, and appreciate the importance of fiction in life.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "elements", "scenario", "connection", "order", "fill", "concept"] as const);
    const hint = "Fiction is imagined storytelling, identified through cues like the cover art, blurb, and title, even when it is inspired by real events or real people.";

    if (branch === "classify") {
      const fictionItems = shuffle(rng, COVER_CLUES.filter((c) => c.bucket === "fiction")).slice(0, 3);
      const nonfictionItems = shuffle(rng, COVER_CLUES.filter((c) => c.bucket === "nonfiction")).slice(0, 2);
      const chosen = shuffle(rng, [...fictionItems, ...nonfictionItems]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each book cover or blurb clue into Fiction or Non-fiction.",
        items,
        buckets: [
          { id: "fiction", label: "Fiction" },
          { id: "nonfiction", label: "Non-fiction" },
        ],
        correctBucket,
        hint: "Look for clues like 'a novel', imagined events, or drawn illustrations (fiction) versus real photographs, 'biography', or documented facts (non-fiction).",
        explanation: chosen.map((c) => `"${c.text}" is ${c.bucket === "fiction" ? "fiction" : "non-fiction"}.`).join(" "),
      };
    }

    if (branch === "elements") {
      const chosen = shuffle(rng, FICTION_ELEMENTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.name, label: f.name })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.name, label: f.description })));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.name] = f.name;
      return {
        kind: "click-match",
        prompt: "Match each element of fiction to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((f) => `${f.name} — ${f.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const entry = randChoice(rng, SCENARIO_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "connection") {
      const entry = randChoice(rng, CONNECTION_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about the real value or lesson behind the imagined story, not the invented details themselves.",
        explanation: `The correct answer is "${entry.correct}".`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps a reader follows when selecting a fictional text for extensive reading, in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Start with quick outer clues like the cover, then move to closer checks like the blurb, title, and a first-page skim, before choosing.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about elements of fiction.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
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
