import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { GREETING_VOCAB, HARAKAT, name, place } from "./shared";

// Sub-strand 1.1 Phonological Awareness: Pronunciation — Theme: Greetings and Introduction.
// Content mined from the design PDF: target sounds/simple words, vocabulary building for greetings
// and introductions, and the Arabic signs (harakat: fatha, kasra, dhama, sukun) explicitly named at
// 1.1. Also covers the explicit "good morning, good afternoon, good evening" register example.

const HARAKAT_QUESTIONS: { sign: string; question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { sign: "fatha", question: "Which Arabic sign gives a letter a short 'a' sound?", correct: "fatha", distractors: ["kasra", "damma", "sukun"], explanation: "'fatha' is the small diagonal stroke above a letter that gives a short 'a' sound." },
  { sign: "fatha", question: "What is the small diagonal stroke ABOVE a letter called?", correct: "fatha", distractors: ["kasra", "damma", "sukun"], explanation: "A stroke above the letter is 'fatha' (short 'a'); a stroke below is 'kasra' (short 'i')." },
  { sign: "kasra", question: "Which Arabic sign gives a letter a short 'i' sound?", correct: "kasra", distractors: ["fatha", "damma", "sukun"], explanation: "'kasra' is the small diagonal stroke below a letter that gives a short 'i' sound." },
  { sign: "kasra", question: "What is the small diagonal stroke BELOW a letter called?", correct: "kasra", distractors: ["fatha", "damma", "sukun"], explanation: "A stroke below the letter is 'kasra' (short 'i'); a stroke above is 'fatha' (short 'a')." },
  { sign: "damma", question: "Which Arabic sign gives a letter a short 'u' sound?", correct: "damma", distractors: ["fatha", "kasra", "sukun"], explanation: "'damma' is the small curl above a letter that gives a short 'u' sound." },
  { sign: "damma", question: "Which sign looks like a small curl above a letter and sounds like 'u'?", correct: "damma", distractors: ["fatha", "kasra", "sukun"], explanation: "That curl-shaped sign is 'damma', giving the short 'u' sound." },
  { sign: "sukun", question: "Which sign shows that a letter has NO vowel sound at all?", correct: "sukun", distractors: ["fatha", "kasra", "damma"], explanation: "'sukun' is the small circle above a letter showing it has no vowel — the consonant is pronounced alone." },
  { sign: "sukun", question: "A small circle above a letter, meaning 'no vowel here', is called?", correct: "sukun", distractors: ["fatha", "kasra", "damma"], explanation: "That circle is 'sukun' — it marks the absence of a vowel sound." },
  { sign: "fatha", question: "In the word pattern 'ba', which sign sits above the letter to make the 'a' sound?", correct: "fatha", distractors: ["kasra", "damma", "sukun"], explanation: "'ba' uses 'fatha' above the letter for its short 'a' sound." },
  { sign: "kasra", question: "In the word pattern 'bi', which sign sits below the letter to make the 'i' sound?", correct: "kasra", distractors: ["fatha", "damma", "sukun"], explanation: "'bi' uses 'kasra' below the letter for its short 'i' sound." },
];

const GREETING_FUNCTION_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} in ${p} meets a new classmate and says "ismi ${n}." What is ${n} doing?`,
    correct: "introducing themselves",
    distractors: ["asking for directions", "describing the weather", "saying goodbye"],
    explanation: `"ismi ${n}" means "my name is ${n}" — this is introducing yourself, not asking directions or the weather.`,
  }),
  (n, p) => ({
    prompt: `At school in ${p}, ${n} says "kayfa haaluk" to a friend. What is ${n} doing?`,
    correct: "asking how someone is",
    distractors: ["introducing themselves", "asking someone's name", "saying good morning"],
    explanation: `"kayfa haaluk" means "how are you" — it asks about someone's wellbeing, it does not introduce a name.`,
  }),
  (n, p) => ({
    prompt: `${n} arrives at school in ${p} early and says "sabah al-khair" to the teacher. What is ${n} doing?`,
    correct: "greeting in the morning",
    distractors: ["saying goodbye", "thanking the teacher", "asking a question"],
    explanation: `"sabah al-khair" means "good morning" — a morning greeting, not a farewell or a thank-you.`,
  }),
  (n, p) => ({
    prompt: `As ${n} leaves school in ${p}, ${n} says "maa as-salama." What is ${n} doing?`,
    correct: "saying goodbye",
    distractors: ["introducing themselves", "greeting in the morning", "asking how someone is"],
    explanation: `"maa as-salama" means "goodbye" — used when leaving, not when arriving or meeting someone new.`,
  }),
  (n, p) => ({
    prompt: `${n} helps a visitor in ${p} and the visitor replies "shukran." What is the visitor doing?`,
    correct: "thanking",
    distractors: ["greeting", "introducing themselves", "apologising"],
    explanation: `"shukran" means "thank you" — an expression of thanks, not a greeting or introduction.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} wants to be polite when asking a favour, so ${n} says "min fadlik" first. What is this phrase for?`,
    correct: "saying please",
    distractors: ["saying goodbye", "saying thank you", "asking a name"],
    explanation: `"min fadlik" means "please" — it softens a request; it is not a farewell or a thank-you.`,
  }),
  (n, p) => ({
    prompt: `Two new students in ${p}, ${n} and a classmate, shake hands and say "tasharrafna." What are they expressing?`,
    correct: "pleasure at meeting each other",
    distractors: ["asking for the time", "describing the school", "saying goodbye"],
    explanation: `"tasharrafna" means "nice to meet you" — said when meeting someone for the first time.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} is thanked by a friend and replies "afwan." What is ${n} expressing?`,
    correct: "you're welcome",
    distractors: ["good morning", "goodbye", "my name is..."],
    explanation: `"afwan" means "you're welcome" (or "excuse me") — a reply to thanks, not a greeting.`,
  }),
  (n, p) => ({
    prompt: `${n} greets a guest arriving in ${p} by saying "ahlan wa sahlan." What is ${n} expressing?`,
    correct: "welcome",
    distractors: ["good evening", "how are you", "thank you"],
    explanation: `"ahlan wa sahlan" means "welcome" — a warm greeting for someone arriving.`,
  }),
  (n, p) => ({
    prompt: `${n} answers "bikhair" when a friend in ${p} asks "kayfa haaluk?" What is ${n} saying?`,
    correct: "I am fine",
    distractors: ["my name is...", "please", "good evening"],
    explanation: `"bikhair" means "I am fine" — the typical reply to "how are you".`,
  }),
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "Good morning in Arabic is ", after: ".", correct: "sabah al-khair" },
  { before: "Good evening in Arabic is ", after: ".", correct: "masaa al-khair" },
  { before: "To say 'my name is...' in Arabic, you say ", after: ".", correct: "ismi" },
  { before: "'How are you' in Arabic is ", after: ".", correct: "kayfa haaluk" },
  { before: "The reply to 'kayfa haaluk' meaning 'I am fine' is ", after: ".", correct: "bikhair" },
  { before: "'Thank you' in Arabic is ", after: ".", correct: "shukran" },
  { before: "'Please' in Arabic is ", after: ".", correct: "min fadlik" },
  { before: "'Goodbye' in Arabic is ", after: ".", correct: "maa as-salama" },
  { before: "'Welcome' in Arabic is ", after: ".", correct: "ahlan wa sahlan" },
  { before: "'Nice to meet you' in Arabic is ", after: ".", correct: "tasharrafna" },
];

const CATEGORY_ITEMS: { word: string; bucket: "Greeting" | "Introduction" | "Politeness" }[] = [
  { word: "sabah al-khair", bucket: "Greeting" },
  { word: "masaa al-khair", bucket: "Greeting" },
  { word: "ahlan", bucket: "Greeting" },
  { word: "maa as-salama", bucket: "Greeting" },
  { word: "ismi...", bucket: "Introduction" },
  { word: "tasharrafna", bucket: "Introduction" },
  { word: "kayfa haaluk", bucket: "Introduction" },
  { word: "shukran", bucket: "Politeness" },
  { word: "min fadlik", bucket: "Politeness" },
  { word: "afwan", bucket: "Politeness" },
];

const ORDER_SETS: { lines: string[] }[] = [
  { lines: ["sabah al-khair (good morning)", "kayfa haaluk? (how are you?)", "bikhair, shukran (I am fine, thank you)", "maa as-salama (goodbye)"] },
  { lines: ["ahlan (hello)", "ismi Amina (my name is Amina)", "tasharrafna (nice to meet you)", "maa as-salama (goodbye)"] },
  { lines: ["masaa al-khair (good evening)", "kayfa haaluk? (how are you?)", "bikhair (I am fine)", "shukran, maa as-salama (thank you, goodbye)"] },
  { lines: ["ahlan wa sahlan (welcome)", "shukran (thank you)", "afwan (you're welcome)", "maa as-salama (goodbye)"] },
  { lines: ["sabah al-khair (good morning)", "ismi Brian (my name is Brian)", "tasharrafna (nice to meet you)", "kayfa haaluk? (how are you?)"] },
];

const PROMPT_POOL_MC = [
  "Choose the correct meaning for this exchange.",
  "What is happening in this short conversation?",
  "Read the situation and pick what the phrase means.",
  "What function does this greeting phrase serve?",
  "Work out what is being expressed here.",
];

export const greetingsSpeaking: Skill = {
  id: "g6-ar-ls-greetings",
  code: "LS.1",
  subjectId: "arabic",
  strandId: "g6-ar-listening-speaking",
  grade: 6,
  title: "Phonological awareness: pronunciation (greetings and introduction)",
  description: "Practise Arabic signs (harakat) and greeting/introduction vocabulary — recognise fatha, kasra, damma and sukun, and use basic greeting phrases correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["signs", "reasoning", "fill", "categorize", "ordering"] as const);

    if (branch === "signs") {
      const q = randChoice(rng, HARAKAT_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.question,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "row",
        hint: "fatha = short a (above), kasra = short i (below), damma = short u (curl above), sukun = no vowel.",
        explanation: q.explanation,
      };
    }

    if (branch === "reasoning") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, GREETING_FUNCTION_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, PROMPT_POOL_MC) + " " + q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Think about when each phrase is used: arriving, leaving, asking wellbeing, or being polite.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, [
          "Fill in the missing Arabic word or phrase.",
          "Complete the sentence with the correct Arabic phrase.",
          "What Arabic phrase completes this sentence?",
          "Fill the gap with the romanized Arabic phrase.",
          "Complete this greeting fact.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about which greeting or introduction phrase fits the meaning given.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORY_ITEMS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "Sort each phrase: is it a Greeting, an Introduction, or Politeness?",
          "Group these phrases by what they are used for.",
          "Sort each Arabic phrase into the correct category.",
          "Which category does each phrase belong to?",
          "Classify each phrase below.",
        ]),
        items: shuffle(rng, items),
        buckets: [
          { id: "Greeting", label: "Greeting" },
          { id: "Introduction", label: "Introduction" },
          { id: "Politeness", label: "Politeness" },
        ],
        correctBucket,
        hint: "Greetings mark arrival/departure, introductions share names or ask about someone, politeness phrases are courteous words.",
        explanation: chosen.map((c) => `"${c.word}" is ${c.bucket === "Introduction" ? "an" : "a"} ${c.bucket.toLowerCase()} phrase.`).join(" "),
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const withIds = set.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
    const items = shuffle(rng, withIds);
    return {
      kind: "ordering",
      prompt: randChoice(rng, [
        "Put these lines of the exchange in the order they would naturally be said.",
        "Arrange the exchange in a sensible order.",
        "Order the phrases as they would appear in a conversation.",
        "Sequence this greeting exchange correctly.",
        "Which order makes this exchange make sense?",
      ]),
      instruction: "Click the lines in the correct order.",
      items,
      correctOrder: withIds.map((w) => w.id),
      hint: "A greeting comes first, then any introduction/wellbeing exchange, then a farewell.",
      explanation: `A natural order is:\n${set.lines.join("\n")}`,
    };
  },
};
