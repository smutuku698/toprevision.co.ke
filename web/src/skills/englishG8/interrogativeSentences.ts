import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WH_WORDS: { word: string; asks: string }[] = [
  { word: "who", asks: "a person" },
  { word: "what", asks: "a thing or action" },
  { word: "when", asks: "a time" },
  { word: "where", asks: "a place" },
  { word: "why", asks: "a reason" },
  { word: "how", asks: "a manner or method" },
  { word: "which", asks: "a choice among options" },
  { word: "whose", asks: "possession — who something belongs to" },
] as const;

const CATEGORIZE_SENTENCES: { text: string; type: "wh" | "yesno" | "tag" }[] = [
  { text: "Where is the nearest game park from Nairobi?", type: "wh" },
  { text: "Have you ever visited the coast during the holidays?", type: "yesno" },
  { text: "The museum opens at nine, doesn't it?", type: "tag" },
  { text: "How far is the waterfall from the campsite?", type: "wh" },
  { text: "Did the tour guide mention the mountain trail?", type: "yesno" },
  { text: "The beach gets crowded on weekends, doesn't it?", type: "tag" },
  { text: "Why do so many tourists visit the historic site?", type: "wh" },
  { text: "You haven't been to the game reserve before, have you?", type: "tag" },
];

const TAG_FILL: { before: string; after: string; answer: string; rule: string }[] = [
  { before: "The game park is open today, ", after: " it?", answer: "isn't", rule: "Positive statement → negative tag. Subject 'the game park' becomes 'it'; the verb 'is' becomes 'isn't'." },
  { before: "The tourists haven't visited the coastal beach yet, ", after: " they?", answer: "have", rule: "Negative statement → positive tag. Subject 'the tourists' becomes 'they'; the verb 'haven't' becomes 'have'." },
  { before: "You can see the waterfall from here, ", after: " you?", answer: "can't", rule: "Positive statement → negative tag. The subject 'you' stays 'you'; the verb 'can' becomes 'can't'." },
  { before: "She doesn't like crowded historic sites, ", after: " she?", answer: "does", rule: "Negative statement → positive tag. The subject 'she' stays 'she'; the verb 'doesn't' becomes 'does'." },
  { before: "The guide explained the site's history, ", after: " he?", answer: "didn't", rule: "Positive statement → negative tag. Subject 'the guide' becomes 'he'; the simple past uses 'did', so the tag is 'didn't'." },
  { before: "They aren't allowed to climb that rock formation, ", after: " they?", answer: "are", rule: "Negative statement → positive tag. The subject 'they' stays 'they'; the verb 'aren't' becomes 'are'." },
];

const CONSTRUCT_MC: { statement: string; askAbout: string; correct: string; wrong: string[] }[] = [
  { statement: "The tour starts at 8 a.m.", askAbout: "the time", correct: "When does the tour start?", wrong: ["Where does the tour start?", "Why does the tour start?", "Who does the tour start?"] },
  { statement: "The rangers protect the animals.", askAbout: "who performs the action", correct: "Who protects the animals?", wrong: ["What protects the animals?", "When protects the animals?", "How protects the animals?"] },
  { statement: "Tourists visit the site because of its history.", askAbout: "the reason", correct: "Why do tourists visit the site?", wrong: ["Where do tourists visit the site?", "Who do tourists visit the site?", "Which do tourists visit the site?"] },
  { statement: "The elephants gather near the river.", askAbout: "the place", correct: "Where do the elephants gather?", wrong: ["When do the elephants gather?", "Why do the elephants gather?", "Who do the elephants gather?"] },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How do we ask a question that expects a yes or no answer?",
    correct: "By starting the sentence with an auxiliary or modal verb before the subject",
    distractors: [
      "By starting the sentence with a Wh-word",
      "By ending every statement with a question mark, without changing word order",
      "By repeating the subject twice",
    ],
  },
  {
    q: "How do we ask a question that expects specific information, like a place or a reason?",
    correct: "By starting the sentence with a Wh-word such as 'what', 'where', or 'why'",
    distractors: [
      "By starting the sentence with an auxiliary verb and no Wh-word",
      "By adding a question tag to a statement",
      "By using only exclamation marks",
    ],
  },
  {
    q: "What rule governs whether a question tag is positive or negative?",
    correct: "A positive statement takes a negative tag, and a negative statement takes a positive tag",
    distractors: [
      "Question tags are always positive, no matter the statement",
      "Question tags are always negative, no matter the statement",
      "The tag's form has nothing to do with the statement",
    ],
  },
  {
    q: "How do we typically answer a yes/no question in English?",
    correct: "With 'yes' or 'no', often followed by a short form using the auxiliary verb",
    distractors: [
      "By repeating the entire question word for word",
      "By always answering with a full Wh-question in return",
      "By using a question tag instead of an answer",
    ],
  },
];

export const interrogativeSentences: Skill = {
  id: "g8-eng-g-interrogative-sentences",
  code: "G.15",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Types of Sentences: Interrogative Sentences",
  description: "Identify and use Wh-questions, yes/no questions, and question tags correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "tag-fill", "construct-mc", "concept"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORIZE_SENTENCES);
      const buckets = [
        { id: "wh", label: "Wh-question" },
        { id: "yesno", label: "Yes/No question" },
        { id: "tag", label: "Question tag" },
      ];
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each sentence by the type of interrogative it is.",
        items,
        buckets,
        correctBucket,
        hint: "Wh-questions start with a Wh-word. Yes/No questions start with an auxiliary verb. Question tags are short questions added to the end of a statement.",
        explanation: chosen
          .map((c) => {
            const label = c.type === "wh" ? "a Wh-question" : c.type === "yesno" ? "a Yes/No question" : "a question tag";
            return `"${c.text}" is ${label}.`;
          })
          .join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, WH_WORDS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.asks })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.word] = w.word;
      return {
        kind: "click-match",
        prompt: "Match each Wh-word to what kind of information it asks for.",
        tokens,
        targets,
        correctMap,
        hint: "Each Wh-word has a specific job: asking about a person, a place, a time, a reason, and so on.",
        explanation: chosen.map((w) => `"${w.word}" asks for ${w.asks}.`).join(" "),
      };
    }

    if (branch === "tag-fill") {
      const entry = randChoice(rng, TAG_FILL);
      return {
        kind: "fill-blank",
        prompt: "Fill in the correct question tag to complete the sentence.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        inputMode: "text",
        hint: "A positive statement takes a negative tag, and a negative statement takes a positive tag, matching the same verb and a pronoun for the subject.",
        explanation: `${entry.rule} Full sentence: "${entry.before}${entry.answer}${entry.after}"`,
      };
    }

    if (branch === "construct-mc") {
      const entry = randChoice(rng, CONSTRUCT_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.wrong]);
      return {
        kind: "multiple-choice",
        prompt: `Which question correctly asks about ${entry.askAbout} in this sentence? "${entry.statement}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Choose the Wh-word that matches exactly the kind of information being asked about.",
        explanation: `"${entry.correct}" correctly asks about ${entry.askAbout}, based on: "${entry.statement}"`,
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
      hint: "Think about the difference between Wh-questions, Yes/No questions, and question tags.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
