import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const NETIQUETTE_RULES: { rule: string; description: string }[] = [
  { rule: "Be respectful", description: "Avoid insulting or bullying others in online chats and comments" },
  { rule: "Verify before sharing", description: "Check that information is true before forwarding it to others" },
  { rule: "Protect privacy", description: "Never share your password or personal details with strangers online" },
  { rule: "Mind your tone", description: "Avoid typing in all capital letters, since it can seem like shouting" },
  { rule: "Think before you post", description: "Consider how a comment might affect others before posting it" },
];

const INTERNET_ITEMS: { text: string; bucket: string }[] = [
  { text: "Learners can research school topics quickly", bucket: "Advantage of the internet" },
  { text: "Families can video call relatives living far away", bucket: "Advantage of the internet" },
  { text: "Farmers can check market prices for their produce online", bucket: "Advantage of the internet" },
  { text: "Learners can access free lessons and revision materials", bucket: "Advantage of the internet" },
  { text: "Some people fall victim to online scams", bucket: "Disadvantage of the internet" },
  { text: "Excessive use can distract learners from schoolwork", bucket: "Disadvantage of the internet" },
  { text: "Cyberbullying can hurt a person's feelings and confidence", bucket: "Disadvantage of the internet" },
];

const FUTURE_SENTENCES: string[][] = [
  ["We", "will", "join", "the", "video", "call", "tomorrow."],
  ["I", "will", "check", "the", "message", "before", "replying."],
  ["They", "will", "download", "the", "new", "app", "next", "week."],
  ["She", "will", "post", "the", "photo", "once", "it", "is", "ready."],
  ["Our", "school", "will", "install", "more", "computers", "soon."],
];

const FILLS: { before: string; after: string; answer: string }[] = [
  { before: "Tomorrow, our class", after: "visit the computer lab to learn about the internet.", answer: "will" },
  { before: "Next week, I", after: "create a strong password for my new email account.", answer: "will" },
  { before: "During the holiday, my cousin", after: "teach me how to browse safely online.", answer: "will" },
  { before: "Soon, many more homes in the village", after: "have access to the internet.", answer: "will" },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Which of the following is an advantage of using the internet?",
    correct: "It gives quick access to information and learning resources",
    distractors: [
      "It guarantees that every website is truthful",
      "It removes the need to ever meet people in person",
      "It prevents all forms of cyberbullying",
    ],
  },
  {
    q: "Which of the following is a disadvantage of using the internet?",
    correct: "It can expose users to scams and cyberbullying",
    distractors: [
      "It makes research completely unnecessary",
      "It always improves a person's grades automatically",
      "It removes all distractions from daily life",
    ],
  },
  {
    q: "What is netiquette?",
    correct: "The polite and respectful way of behaving when communicating online",
    distractors: [
      "A type of password used only on school computers",
      "The speed at which a website loads",
      "A programming language used to build websites",
    ],
  },
  {
    q: "Which sentence is written in the future tense?",
    correct: "We will meet online for the class discussion tomorrow.",
    distractors: [
      "We met online for the class discussion yesterday.",
      "We are meeting online for the class discussion right now.",
      "We meet online for the class discussion every day.",
    ],
  },
  {
    q: "Why is it important to listen attentively when acquiring information from a talk about the internet?",
    correct: "So that you understand and remember the key facts correctly",
    distractors: [
      "So that you can interrupt the speaker more often",
      "Because attentive listening is only useful for exams",
      "So that you can ignore the speaker's main points",
    ],
  },
];

export const ictNetiquetteListening: Skill = {
  id: "g8-il-ls-ict",
  code: "LS.2",
  subjectId: "indigenous-language",
  strandId: "g8-il-listening-speaking",
  grade: 8,
  title: "ICT and netiquette: listening for comprehension",
  description: "Identify the advantages and disadvantages of the internet, observe netiquette, and recognise the future tense in aural texts.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Listen attentively for the speaker's main points, and remember that netiquette means being polite and careful online.";

    if (branch === "match") {
      const chosen = shuffle(rng, NETIQUETTE_RULES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.rule, label: r.rule })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.rule, label: r.description })));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.rule] = r.rule;
      return {
        kind: "click-match",
        prompt: "Match each netiquette rule to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((r) => `${r.rule} — ${r.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, INTERNET_ITEMS).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `n${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`n${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement into the correct group.",
        items,
        buckets,
        correctBucket,
        hint: "Decide whether the statement describes a benefit of the internet or a problem it can cause.",
        explanation: chosen.map((c) => `"${c.text}" — an ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const sentence = randChoice(rng, FUTURE_SENTENCES);
      const items = shuffle(rng, sentence.map((w, i) => ({ id: `w${i}`, label: w })));
      return {
        kind: "ordering",
        prompt: "Arrange the words to form a correct sentence in the future tense.",
        instruction: "Click the words in order.",
        items,
        correctOrder: sentence.map((_, i) => `w${i}`),
        hint: "The future tense uses 'will' followed by the base form of the verb.",
        explanation: sentence.join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the future tense sentence.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        inputMode: "text",
        hint,
        explanation: `${entry.before} ${entry.answer} ${entry.after} This uses the future tense marker "will".`,
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
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
