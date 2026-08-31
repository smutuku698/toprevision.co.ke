import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Category = "addition" | "emphasis" | "comparison" | "contrast" | "illustration" | "cause-effect";

const CATEGORY_LABEL: Record<Category, string> = {
  addition: "Addition (adds another point)",
  emphasis: "Emphasis (highlights importance)",
  comparison: "Comparison (shows similarity)",
  contrast: "Contrast (shows difference)",
  illustration: "Illustration (gives an example)",
  "cause-effect": "Cause and effect (shows reason or result)",
};

const CATEGORIES: Category[] = ["addition", "emphasis", "comparison", "contrast", "illustration", "cause-effect"];

const SIGNAL_WORDS: { word: string; category: Category }[] = [
  { word: "also", category: "addition" },
  { word: "moreover", category: "addition" },
  { word: "in addition", category: "addition" },
  { word: "furthermore", category: "addition" },
  { word: "especially", category: "emphasis" },
  { word: "particularly", category: "emphasis" },
  { word: "an important point to note is", category: "emphasis" },
  { word: "indeed", category: "emphasis" },
  { word: "like", category: "comparison" },
  { word: "similarly", category: "comparison" },
  { word: "just as", category: "comparison" },
  { word: "in the same way", category: "comparison" },
  { word: "however", category: "contrast" },
  { word: "but", category: "contrast" },
  { word: "on the other hand", category: "contrast" },
  { word: "although", category: "contrast" },
  { word: "for example", category: "illustration" },
  { word: "for instance", category: "illustration" },
  { word: "such as", category: "illustration" },
  { word: "to illustrate", category: "illustration" },
  { word: "because", category: "cause-effect" },
  { word: "therefore", category: "cause-effect" },
  { word: "so that", category: "cause-effect" },
  { word: "as a result", category: "cause-effect" },
];

const SIGNAL_FUNCTIONS: { phrase: string; function: string }[] = [
  { phrase: "for example", function: "Signals that an illustration or specific example is about to be given" },
  { phrase: "however", function: "Signals a contrast or a difference from what was just said" },
  { phrase: "because", function: "Signals that a reason or cause is about to be given" },
  { phrase: "especially", function: "Signals that the speaker is emphasising one important point" },
  { phrase: "similarly", function: "Signals a comparison to something mentioned earlier" },
  { phrase: "in addition", function: "Signals that another, additional point is being added" },
  { phrase: "as a result", function: "Signals an effect or result of something just described" },
  { phrase: "on the other hand", function: "Signals a contrasting viewpoint or alternative" },
];

const PASSAGES: { id: string; topic: string; text: string }[] = [
  {
    id: "mau",
    topic: "Mau Forest restoration",
    text: "The Mau Forest Complex, one of Kenya's largest water towers, lost nearly one hundred thousand hectares of forest cover between 2000 and 2010 due to illegal settlement and logging. In particular, the government resettled thousands of families and planted over two million tree seedlings between 2018 and 2020 to restore degraded sections. As a result, several rivers that feed Lake Victoria have begun to recover their dry-season flow.",
  },
  {
    id: "karura",
    topic: "Karura Forest, Nairobi",
    text: "Karura Forest, covering about 1,041 hectares within Nairobi city, was saved from illegal grabbing in the 1990s largely because of the activism of environmentalist Wangari Maathai. Today, the forest hosts over 100 species of birds and receives thousands of visitors every month for walking, cycling, and picnicking. In addition, the forest includes waterfalls, caves, and a memorial to those who fought to protect it.",
  },
  {
    id: "aberdare",
    topic: "Aberdare Forest fencing",
    text: "The Aberdare Forest is surrounded by an electric fence stretching over 400 kilometres, built to reduce conflict between wildlife and neighbouring farming communities. Since the fence was completed, incidents of elephants raiding nearby farms have dropped significantly. However, conservationists note that gaps in the fence still need regular repair, especially after heavy rains.",
  },
  {
    id: "arabuko",
    topic: "Arabuko-Sokoke Forest",
    text: "Arabuko-Sokoke, on the Kenyan coast near Malindi, is the largest remaining fragment of coastal forest in East Africa, covering approximately 420 square kilometres. The forest is home to rare species such as the golden-rumped elephant shrew and the Sokoke scops owl. For example, local community groups now run butterfly farming projects that earn income while protecting the forest from charcoal burning.",
  },
];

const FACT_QUESTIONS: { passageId: string; q: string; correct: string; distractors: string[] }[] = [
  { passageId: "mau", q: "How many tree seedlings did the government plant to restore the Mau Forest between 2018 and 2020?", correct: "Over two million", distractors: ["Over two hundred thousand", "Over twenty thousand", "Over twenty million"] },
  { passageId: "karura", q: "Roughly how many hectares does Karura Forest cover?", correct: "About 1,041 hectares", distractors: ["About 100 hectares", "About 10,410 hectares", "About 420 hectares"] },
  { passageId: "aberdare", q: "About how long is the electric fence around the Aberdare Forest?", correct: "Over 400 kilometres", distractors: ["Over 40 kilometres", "Over 4,000 kilometres", "Over 100 kilometres"] },
  { passageId: "arabuko", q: "Approximately how large is the Arabuko-Sokoke Forest?", correct: "About 420 square kilometres", distractors: ["About 42 square kilometres", "About 1,041 square kilometres", "About 4,200 square kilometres"] },
];

const FILL_FACTS: { passageId: string; before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { passageId: "mau", before: "The Mau Forest Complex lost nearly ", after: " hectares of forest cover between 2000 and 2010.", correctAnswer: "one hundred thousand", acceptedAnswers: ["100,000", "100000"] },
  { passageId: "karura", before: "Karura Forest hosts over ", after: " species of birds.", correctAnswer: "100" },
  { passageId: "aberdare", before: "The electric fence around the Aberdare Forest stretches over ", after: " kilometres.", correctAnswer: "400" },
  { passageId: "arabuko", before: "Arabuko-Sokoke Forest covers approximately ", after: " square kilometres.", correctAnswer: "420" },
];

const SIGNAL_IN_CONTEXT: { passageId: string; signalWord: string; category: Category }[] = [
  { passageId: "mau", signalWord: "As a result", category: "cause-effect" },
  { passageId: "karura", signalWord: "In addition", category: "addition" },
  { passageId: "aberdare", signalWord: "However", category: "contrast" },
  { passageId: "arabuko", signalWord: "For example", category: "illustration" },
];

const ORDER_STEPS = [
  { id: "signal", label: "Listen for signal words that show a new detail is coming" },
  { id: "keywords", label: "Jot down key words only, not full sentences" },
  { id: "exact", label: "Note numbers, names, and places exactly as heard" },
  { id: "group", label: "Group similar details together under the main idea" },
  { id: "review", label: "Review your notes right after listening to fill any gaps" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What factors can interfere with a listener's ability to catch every detail in a talk?",
    correct: "Distractions, unfamiliar vocabulary, and speaking too fast for the listener to process",
    distractors: ["Using clear signal words throughout the talk", "Speaking slowly and pausing between points", "Repeating key details more than once"],
  },
  {
    q: "How can you tell that someone is listening attentively for details?",
    correct: "They take notes, maintain eye contact, and can recall specific facts afterwards",
    distractors: ["They interrupt frequently to share their own opinions", "They look around the room and check their phone", "They only remember the general topic, not the specific facts"],
  },
  {
    q: "Why is it useful to notice signal words such as 'for example' or 'however' while listening?",
    correct: "They help the listener predict what kind of detail — an example, a contrast, a cause — is coming next",
    distractors: ["They mark the exact end of the listening text", "They are only used in written text, never in speech", "They replace the need to listen to the rest of the sentence"],
  },
  {
    q: "Why is noting exact figures, such as forest sizes in hectares, important when listening to a report?",
    correct: "Exact figures help the listener accurately understand the scale of a problem or a solution",
    distractors: ["Exact figures are usually less important than the general topic", "Figures are only included to make a report sound longer", "Figures can be safely ignored if the general idea is understood"],
  },
];

function findPassage(id: string) {
  return PASSAGES.find((p) => p.id === id)!;
}

export const listeningForDetails: Skill = {
  id: "g7-eng-ls-listening-for-details",
  code: "LS.7",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Listening Comprehension: Listening for Details",
  description: "Identify clues that signal details in a listening text, take detailed notes, and acknowledge the importance of listening for details.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "mc-fact", "fill", "mc-context", "order", "concept"] as const);
    const hint = "Signal words tell you what kind of detail is coming next — an example, a contrast, a cause, or an extra point.";

    if (branch === "categorize") {
      const chosen = CATEGORIES.map((c) => randChoice(rng, SIGNAL_WORDS.filter((w) => w.category === c)));
      const shuffled = shuffle(rng, chosen);
      const items = shuffled.map((w, i) => ({ id: `w${i}`, label: w.word }));
      const correctBucket: Record<string, string> = {};
      shuffled.forEach((w, i) => (correctBucket[`w${i}`] = w.category));
      return {
        kind: "categorize",
        prompt: "Sort each signal word or phrase into the kind of detail it introduces.",
        items,
        buckets: CATEGORIES.map((c) => ({ id: c, label: CATEGORY_LABEL[c] })),
        correctBucket,
        hint,
        explanation: shuffled.map((w) => `"${w.word}" signals ${CATEGORY_LABEL[w.category].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, SIGNAL_FUNCTIONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.phrase, label: s.phrase })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.phrase, label: s.function })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.phrase] = s.phrase;
      return {
        kind: "click-match",
        prompt: "Match each signal word or phrase to what it tells the listener.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `"${s.phrase}" — ${s.function.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "mc-fact") {
      const entry = randChoice(rng, FACT_QUESTIONS);
      const passage = findPassage(entry.passageId);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: passage.text,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `According to the passage, the correct detail is "${entry.correct}".`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_FACTS);
      const passage = findPassage(entry.passageId);
      return {
        kind: "fill-blank",
        prompt: "Listen carefully (read the passage) and fill in the exact detail that is missing.",
        passage: passage.text,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint: "Find the exact number or figure in the passage above.",
        explanation: `The passage states: "${entry.before}${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (branch === "mc-context") {
      const entry = randChoice(rng, SIGNAL_IN_CONTEXT);
      const passage = findPassage(entry.passageId);
      const otherCategories = shuffle(rng, CATEGORIES.filter((c) => c !== entry.category)).slice(0, 3);
      const choices = shuffle(rng, [entry.category, ...otherCategories].map((c) => CATEGORY_LABEL[c]));
      return {
        kind: "multiple-choice",
        prompt: `In this passage, what kind of detail does the signal phrase "${entry.signalWord}" introduce?`,
        passage: passage.text,
        choices,
        correctIndex: choices.indexOf(CATEGORY_LABEL[entry.category]),
        layout: "list",
        hint: "Find the phrase in the passage and read what comes right after it.",
        explanation: `"${entry.signalWord}" introduces ${CATEGORY_LABEL[entry.category].toLowerCase()}.`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of taking detailed notes while listening in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Note-taking starts with catching the signal, moves through recording exact details, and ends with reviewing.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
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
