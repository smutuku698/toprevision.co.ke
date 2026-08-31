import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATERIAL_PURPOSE: { material: string; purpose: string }[] = [
  { material: "A biography of a Kenyan engineer", purpose: "Learning what daily life is like in an engineering career" },
  { material: "An online magazine article about veterinary medicine", purpose: "Finding up-to-date information about a veterinary career" },
  { material: "A career guidebook listing job requirements", purpose: "Checking what qualifications a profession requires" },
  { material: "A newspaper interview with a nurse", purpose: "Understanding a nurse's personal experience on the job" },
  { material: "A documentary-style e-book about pilots", purpose: "Exploring how pilots are trained" },
];

const FICTION_NONFICTION: { text: string; bucket: "fiction" | "nonfiction" }[] = [
  { text: "A storybook about a boy who dreams of becoming a pilot", bucket: "fiction" },
  { text: "A magazine article listing the steps to become a pilot", bucket: "nonfiction" },
  { text: "A biography of a real Kenyan doctor", bucket: "nonfiction" },
  { text: "A folktale about a clever farmer", bucket: "fiction" },
  { text: "An online article explaining what a surveyor does", bucket: "nonfiction" },
  { text: "A poem imagining life as an astronaut", bucket: "fiction" },
  { text: "A factual news report about a local hospital's new equipment", bucket: "nonfiction" },
];

const STRATEGY_SCENARIOS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Amani wants to find the exact registration fee mentioned somewhere in a long online article about becoming an accountant, without reading it from start to finish. Which reading strategy should she use?",
    correct: "Scanning — quickly moving her eyes over the text to locate the specific fee",
    distractors: [
      "Skimming — reading the whole article quickly for its general idea",
      "Reading it word for word from the very first sentence",
      "Reading only the article's title and nothing else",
    ],
    explanation: "Scanning is used to locate one specific piece of information quickly, which is exactly what Amani needs.",
  },
  {
    q: "Before deciding whether to read a long article about accounting careers, Baraka quickly looks at its title, first sentence, and headings. Which reading strategy is he using?",
    correct: "Skimming — getting a general idea of what the whole article covers",
    distractors: [
      "Scanning — searching for one exact detail",
      "Reading with expression, using tone and rhythm",
      "Reading the article twice from beginning to end",
    ],
    explanation: "Skimming gives a quick general impression of a text's topic, which helps a reader decide whether it is worth reading fully.",
  },
  {
    q: "Chebet has finished reading a non-fiction e-book about veterinary careers and enjoyed it. What should she do to help a friend who is also interested in animals find good non-fiction to read?",
    correct: "Recommend the e-book to her friend, explaining why it suits their shared interest",
    distractors: [
      "Keep the e-book a secret so no one else reads it",
      "Recommend a random book regardless of her friend's interests",
      "Tell her friend that non-fiction reading is not worth doing",
    ],
    explanation: "Recommending suitable non-fiction materials to peers, based on genuine shared interest, helps others find useful and enjoyable reading.",
  },
];

const INFER_PASSAGES: { passage: string; word: string; correct: string; distractors: string[] }[] = [
  {
    passage: "The veterinary surgeon was meticulous when examining the injured zebra, checking every limb carefully before making a diagnosis.",
    word: "meticulous",
    correct: "very careful and thorough about small details",
    distractors: ["quick and careless", "loud and impatient", "confused and unsure"],
  },
  {
    passage: "The apprentice electrician observed the senior technician closely, eager to learn the correct wiring procedure from someone experienced.",
    word: "apprentice",
    correct: "a person learning a trade or skill under a more experienced worker",
    distractors: ["a fully qualified expert with decades of experience", "a customer requesting electrical repairs", "a manager who no longer does hands-on work"],
  },
  {
    passage: "The journalist verified every fact in her article before publishing it, cross-checking with several different sources.",
    word: "verified",
    correct: "confirmed that something is true or accurate",
    distractors: ["invented without any evidence", "deleted from the final article", "guessed without checking"],
  },
  {
    passage: "The surveyor used precise instruments to measure the exact boundaries of the land before the new road was built.",
    word: "precise",
    correct: "exact and accurate",
    distractors: ["rough and approximate", "old and unreliable", "borrowed and unfamiliar"],
  },
  {
    passage: "The pilot's rigorous training included hundreds of hours in a flight simulator before her very first real flight.",
    word: "rigorous",
    correct: "thorough, strict, and demanding",
    distractors: ["relaxed and optional", "short and simple", "unplanned and informal"],
  },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is reading non-fiction materials about professions valuable for lifelong learning?",
    correct: "It builds real-world knowledge and understanding that a reader can use well beyond the classroom",
    distractors: [
      "It is only useful for passing a single school examination",
      "It has no real value once a learner finishes reading it",
      "It matters only if a reader plans to enter that exact profession",
    ],
  },
  {
    q: "Besides gaining information, why should a reader also value reading non-fiction for enjoyment?",
    correct: "Enjoying a well-written non-fiction text builds a lasting habit of reading for general understanding, not just facts",
    distractors: [
      "Enjoyment is irrelevant — non-fiction should only ever be read for facts",
      "Non-fiction can never actually be enjoyable to read",
      "Enjoying non-fiction means the facts in it cannot be trusted",
    ],
  },
  {
    q: "What is the purpose of keeping a reading log after finishing a non-fiction book?",
    correct: "It helps a reader track what they have read and remember key facts for later use",
    distractors: [
      "It replaces the need to actually read the book",
      "It is only useful for fiction, never non-fiction",
      "It is a record that must be destroyed once a book is finished",
    ],
  },
];

const ORDER_STEPS = [
  { id: "topic", label: "Decide which profession or topic you are interested in reading about" },
  { id: "format", label: "Choose a suitable print or electronic non-fiction material on that topic" },
  { id: "level", label: "Check that its reading level and length suit you before committing to it" },
  { id: "read", label: "Read the material, noting key facts as you go" },
  { id: "recommend", label: "Recommend it to a peer with similar interests, explaining why it is useful" },
];

export const nonFictionMaterials: Skill = {
  id: "g7-eng-r-non-fiction-materials",
  code: "R.11",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Extensive Reading: Non-Fiction Materials",
  description: "Identify suitable print and electronic non-fiction materials about professions, read them independently, and recommend them to peers.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "classify", "strategy", "infer", "order", "concept"] as const);
    const hint = "A good non-fiction choice matches your interest, your reading level, and your purpose — and reading it builds knowledge for life.";

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of selecting, reading, and recommending a non-fiction material about a profession, in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Start by deciding your topic of interest, then choose and check the material, then read it, then recommend it.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, MATERIAL_PURPOSE.map((v) => ({ id: v.material, label: v.material })));
      const targets = shuffle(rng, MATERIAL_PURPOSE.map((v) => ({ id: v.material, label: v.purpose })));
      const correctMap: Record<string, string> = {};
      for (const v of MATERIAL_PURPOSE) correctMap[v.material] = v.material;
      return {
        kind: "click-match",
        prompt: "Match each non-fiction material about professions to the purpose it would best serve.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: MATERIAL_PURPOSE.map((v) => `"${v.material}" → ${v.purpose}.`).join(" "),
      };
    }

    if (branch === "classify") {
      const fictionItems = shuffle(rng, FICTION_NONFICTION.filter((t) => t.bucket === "fiction")).slice(0, 2);
      const nonfictionItems = shuffle(rng, FICTION_NONFICTION.filter((t) => t.bucket === "nonfiction")).slice(0, 3);
      const chosen = shuffle(rng, [...fictionItems, ...nonfictionItems]);
      const items = chosen.map((c, i) => ({ id: `t${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`t${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each reading material about professions into Fiction or Non-fiction.",
        items,
        buckets: [
          { id: "fiction", label: "Fiction" },
          { id: "nonfiction", label: "Non-fiction" },
        ],
        correctBucket,
        hint: "Non-fiction gives real facts and information. Fiction tells an invented story, even if it is about a real-sounding job.",
        explanation: chosen.map((c) => `"${c.text}" is ${c.bucket === "fiction" ? "fiction — it is an invented story" : "non-fiction — it gives real facts"}.`).join(" "),
      };
    }

    if (branch === "strategy") {
      const entry = randChoice(rng, STRATEGY_SCENARIOS);
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

    if (branch === "infer") {
      const entry = randChoice(rng, INFER_PASSAGES);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        passage: entry.passage,
        prompt: `As used in the passage, what does the word "${entry.word}" most likely mean?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Look at the words and situation around the unfamiliar word for clues about its meaning.",
        explanation: `In this passage, "${entry.word}" means: ${entry.correct}.`,
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
