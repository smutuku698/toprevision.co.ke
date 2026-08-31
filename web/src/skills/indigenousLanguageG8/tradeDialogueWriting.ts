import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FEATURES: { term: string; definition: string }[] = [
  { term: "Speaker labels", definition: "showing clearly which character is speaking at each turn" },
  { term: "Turn-taking", definition: "speakers responding to each other one after another, not all at once" },
  { term: "Natural language", definition: "conversational wording, similar to how people actually speak" },
  { term: "Punctuation for speech", definition: "quotation marks (or a new line per speaker) showing exactly what was said" },
  { term: "Relevance", definition: "each reply staying on the topic being discussed" },
];

// A bartering dialogue between two traders, split into ordered turns.
const DIALOGUE_TURNS: { id: string; label: string }[] = [
  { id: "t1", label: "Achieng: \"Good morning, Mzee Otieno. How much for a basket of your millet?\"" },
  { id: "t2", label: "Otieno: \"Good morning, Achieng. This basket is worth three chickens.\"" },
  { id: "t3", label: "Achieng: \"Three chickens is a lot. Would you accept two chickens and a goat skin?\"" },
  { id: "t4", label: "Otieno: \"That sounds fair. Let us make the exchange, my friend.\"" },
];

// Lines to sort as either relevant (on-topic) or breaking dialogue relevance.
const EXCHANGES: { text: string; category: "relevant" | "irrelevant" }[] = [
  { text: "\"How many sacks of beans can I get for this cow?\" asked Wanjala.", category: "relevant" },
  { text: "\"Two sacks, since the cow looks healthy and strong,\" replied Nafula.", category: "relevant" },
  { text: "\"I heard it might rain later today,\" said Wanjala suddenly.", category: "irrelevant" },
  { text: "\"Could you throw in a sack of millet as well?\" Wanjala asked.", category: "relevant" },
  { text: "\"My sandals are getting old,\" Nafula muttered to herself.", category: "irrelevant" },
  { text: "\"Agreed — two sacks of beans and one of millet for the cow,\" said Nafula.", category: "relevant" },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is a key feature of a well-written dialogue?",
    correct: "Clear speaker labels showing who is talking at each turn",
    distractors: ["No punctuation at all", "Only one character speaking the whole time", "Random unrelated topics in each line"],
  },
  {
    q: "Why should the language in a dialogue sound natural?",
    correct: "So it resembles how people actually speak to each other in conversation",
    distractors: ["So it sounds like a formal essay", "Because natural language is not allowed in writing", "So each character sounds the same as the narrator"],
  },
  {
    q: "What is used to show exactly what a speaker said in a written dialogue?",
    correct: "Quotation marks, or starting a new line for each speaker",
    distractors: ["Only capital letters throughout", "Numbers before every sentence", "Underlining every word spoken"],
  },
  {
    q: "Why are values important when engaging in a business transaction, such as indigenous trade?",
    correct: "Values like honesty and fairness build trust so both parties benefit from the exchange",
    distractors: ["Values slow down trade and should be ignored", "Only the buyer's interests matter in a trade", "Trade works the same with or without trust"],
  },
];

export const tradeDialogueWriting: Skill = {
  id: "g8-il-w-trade",
  code: "W.6",
  subjectId: "indigenous-language",
  strandId: "g8-il-writing",
  grade: 8,
  title: "Indigenous Trade: Writing to give information - Dialogue",
  description: "Examine the features of dialogue and sequence a bartering conversation between two traders.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "match", "categorize", "fill", "mc"] as const);

    if (branch === "order") {
      const items = shuffle(rng, DIALOGUE_TURNS);
      return {
        kind: "ordering",
        prompt: "Arrange this bartering dialogue between two traders in the correct order.",
        instruction: "Click the turns in order.",
        items,
        correctOrder: DIALOGUE_TURNS.map((t) => t.id),
        hint: "A dialogue about a trade usually opens with a question about price, moves through negotiation, and ends with an agreement.",
        explanation: DIALOGUE_TURNS.map((t) => t.label).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, FEATURES.map((f) => ({ id: f.term, label: f.term })));
      const targets = shuffle(rng, FEATURES.map((f) => ({ id: f.term, label: f.definition })));
      const correctMap: Record<string, string> = {};
      for (const f of FEATURES) correctMap[f.term] = f.term;
      return {
        kind: "click-match",
        prompt: "Match each feature of dialogue writing to its definition.",
        tokens,
        targets,
        correctMap,
        hint: "Good dialogue shows who is speaking, sounds natural, uses correct punctuation, and stays on topic.",
        explanation: FEATURES.map((f) => `${f.term} — ${f.definition}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, EXCHANGES);
      const buckets = [
        { id: "relevant", label: "Stays on topic (relevant)" },
        { id: "irrelevant", label: "Off topic (irrelevant)" },
      ];
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "This dialogue is a conversation about bartering goods. Sort each line by whether it stays on topic.",
        items,
        buckets,
        correctBucket,
        hint: "A relevant line responds to the trade being discussed; an irrelevant line changes the subject.",
        explanation: chosen.map((c) => `${c.text} — ${c.category === "relevant" ? "stays on the topic of the trade" : "is off topic, unrelated to the trade being discussed"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: "In written dialogue, quotation marks or a new line per speaker are used as",
        after: "for speech, to show exactly what each character said.",
        correctAnswer: "punctuation",
        acceptedAnswers: [],
        inputMode: "text",
        hint: "This word describes the marks that show exactly what was spoken.",
        explanation: "Quotation marks or a new line per speaker are the punctuation for speech, showing precisely what each character said in a dialogue.",
      };
    }

    const entry = randChoice(rng, MC_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Good dialogue has clear speakers, natural language, correct punctuation for speech, and relevance.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
