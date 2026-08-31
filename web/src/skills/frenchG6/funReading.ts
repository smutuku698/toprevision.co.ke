import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Brian : Njeri, quel est ton sport préféré ?",
  "Njeri : Mon sport préféré est le football. Je joue au football tous les samedis.",
  "Brian : Est-ce que tu joues à d'autres jeux ?",
  "Njeri : Oui, je joue aussi aux échecs avec mon frère.",
  "Brian : Et le basketball, tu aimes ça ?",
  "Njeri : Non, je n'aime pas beaucoup le basketball. Je préfère l'athlétisme.",
  "Brian : Pourquoi aimes-tu l'athlétisme ?",
  "Njeri : Parce que courir me rend heureuse et en bonne santé.",
  "Brian : Merci, Njeri ! C'est un article génial pour le magazine de l'école.",
  "Njeri : Avec plaisir, Brian !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Njeri's favourite sport is football.", isTrue: true },
  { text: "Njeri's favourite sport is basketball.", isTrue: false },
  { text: "Njeri plays football every Saturday.", isTrue: true },
  { text: "Njeri also plays chess with her brother.", isTrue: true },
  { text: "Njeri plays chess with her sister.", isTrue: false },
  { text: "Njeri loves basketball very much.", isTrue: false },
  { text: "Njeri prefers athletics over basketball.", isTrue: true },
  { text: "Njeri says running makes her happy and healthy.", isTrue: true },
  { text: "Brian is writing an article for the school magazine.", isTrue: true },
  { text: "Brian asks Njeri about her favourite subject, not sport.", isTrue: false },
  { text: "Njeri does not play any other games besides football.", isTrue: false },
  { text: "Brian thanks Njeri at the end of the interview.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Quel est ton sport préféré ?", meaning: "What is your favourite sport?" },
  { phrase: "Je joue au football.", meaning: "I play football." },
  { phrase: "Est-ce que tu joues à d'autres jeux ?", meaning: "Do you play other games?" },
  { phrase: "Je joue aux échecs.", meaning: "I play chess." },
  { phrase: "Tu aimes ça ?", meaning: "Do you like that?" },
  { phrase: "Je n'aime pas beaucoup le basketball.", meaning: "I don't like basketball very much." },
  { phrase: "Je préfère l'athlétisme.", meaning: "I prefer athletics." },
  { phrase: "Pourquoi aimes-tu l'athlétisme ?", meaning: "Why do you like athletics?" },
  { phrase: "Courir me rend heureuse.", meaning: "Running makes me happy." },
  { phrase: "en bonne santé", meaning: "in good health" },
  { phrase: "Avec plaisir !", meaning: "With pleasure!/Gladly!" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quel est le sport préféré de Njeri ?",
    correct: "Le football",
    distractors: ["Le basketball", "Les échecs", "L'athlétisme"],
    explanation: "Njeri says: \"Mon sport préféré est le football.\"",
  },
  {
    q: "Avec qui Njeri joue-t-elle aux échecs ?",
    correct: "Avec son frère",
    distractors: ["Avec sa sœur", "Avec Brian", "Avec sa mère"],
    explanation: "Njeri says: \"Oui, je joue aussi aux échecs avec mon frère.\"",
  },
  {
    q: "Pourquoi Njeri préfère-t-elle l'athlétisme au basketball ?",
    correct: "Parce que courir la rend heureuse et en bonne santé",
    distractors: ["Parce que le basketball est trop cher", "Parce qu'elle n'a pas de ballon", "Parce que ses amis n'aiment pas le basketball"],
    explanation: "Njeri says: \"Je préfère l'athlétisme... Parce que courir me rend heureuse et en bonne santé.\"",
  },
  {
    q: "Quand Njeri joue-t-elle au football ?",
    correct: "Tous les samedis",
    distractors: ["Tous les dimanches", "Tous les jours", "Une fois par mois"],
    explanation: "Njeri says: \"Je joue au football tous les samedis.\"",
  },
  {
    q: "Pour quoi Brian écrit-il cet article ?",
    correct: "Pour le magazine de l'école",
    distractors: ["Pour un journal national", "Pour la radio de l'école", "Pour un livre de sport"],
    explanation: "Brian says: \"C'est un article génial pour le magazine de l'école.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Brian : Njeri, quel est ton sport ", after: " ?", answer: "préféré", gloss: "Brian asks Njeri's favourite sport." },
  { before: "Njeri : Mon sport préféré est le ", after: ". Je joue au football tous les samedis.", answer: "football", gloss: "Njeri's favourite sport is football." },
  { before: "Njeri : Mon sport préféré est le football. Je joue au football tous les ", after: ".", answer: "samedis", gloss: "She plays football every Saturday." },
  { before: "Brian : Est-ce que tu joues à d'autres ", after: " ?", answer: "jeux", gloss: "Brian asks if Njeri plays other games." },
  { before: "Njeri : Oui, je joue aussi aux ", after: " avec mon frère.", answer: "échecs", gloss: "Njeri also plays chess with her brother." },
  { before: "Njeri : Non, je n'aime pas beaucoup le basketball. Je préfère l'", after: ".", answer: "athlétisme", gloss: "Njeri prefers athletics to basketball." },
  { before: "Njeri : Parce que courir me rend ", after: " et en bonne santé.", answer: "heureuse", gloss: "Running makes Njeri happy and healthy." },
  { before: "Brian : Merci, Njeri ! C'est un article ", after: " pour le magazine de l'école.", answer: "génial", gloss: "Brian says it's a great article for the school magazine." },
  { before: "Brian : Merci, Njeri ! C'est un article génial pour le ", after: " de l'école.", answer: "magazine", gloss: "It's an article for the school magazine." },
  { before: "Njeri : Avec ", after: ", Brian !", answer: "plaisir", gloss: "Njeri says 'with pleasure' to close the interview." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Quel", "est", "ton", "sport", "préféré", "?"], sentence: "Quel est ton sport préféré ?" },
  { chunks: ["Je", "joue", "au", "football", "."], sentence: "Je joue au football." },
  { chunks: ["Je", "préfère", "l'athlétisme", "."], sentence: "Je préfère l'athlétisme." },
];

export const funReading: Skill = {
  id: "g6-fr-r-fun",
  code: "R.5",
  subjectId: "french",
  strandId: "g6-fr-reading",
  grade: 6,
  title: "Reading: sports and games",
  description: "Read a short French school-magazine interview about sports and games preferences, then answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "click-match", "ordering", "fill-blank", "multiple-choice"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, TRUE_FALSE).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the interview.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the interview carefully and check exactly what Njeri says about her sports and games.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each phrase from the interview to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the interview above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put the pieces in order to rebuild this line from the interview.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Check the interview above for the exact wording and word order.",
        explanation: `The correct line is: "${set.sentence}"`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from this line of the interview.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Reread the matching line in the interview above.",
        explanation: `The complete line is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Look at what Njeri actually says in the interview above.",
      explanation: q.explanation,
    };
  },
};
