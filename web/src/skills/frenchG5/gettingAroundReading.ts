import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, orderPrompt, fillPrompt, readingTrueFalsePrompt } from "./g5FrShared";

const LINES = [
  "Brian : Faith, où est la table ?",
  "Faith : La table est entre la porte et le tableau.",
  "Brian : Et où est ma chaise ?",
  "Faith : Ta chaise est sous la table.",
  "Brian : Où est la poubelle ?",
  "Faith : La poubelle est derrière la porte.",
  "Brian : Et le tableau, où est-il exactement ?",
  "Faith : Le tableau est sur le mur.",
  "Brian : Il y a un cahier dans mon sac ?",
  "Faith : Oui, il y a un cahier et un stylo dans ton sac.",
  "Brian : Merci, Faith ! Maintenant je trouve tout.",
  "Faith : De rien, Brian !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Brian asks Faith where the table is.", isTrue: true },
  { text: "Faith says the table is under the board.", isTrue: false },
  { text: "Faith says the table is between the door and the board.", isTrue: true },
  { text: "Faith says Brian's chair is on the table.", isTrue: false },
  { text: "Faith says Brian's chair is under the table.", isTrue: true },
  { text: "Faith says the bin is behind the door.", isTrue: true },
  { text: "Faith says the bin is next to the window.", isTrue: false },
  { text: "Faith says the board is on the wall.", isTrue: true },
  { text: "Faith says there is a notebook and a pen in Brian's bag.", isTrue: true },
  { text: "Faith says Brian's bag is empty.", isTrue: false },
  { text: "Brian thanks Faith for helping him find things.", isTrue: true },
  { text: "Faith is the one who asks all the questions.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Où est la table ?", meaning: "Where is the table?" },
  { phrase: "La table est entre la porte et le tableau.", meaning: "The table is between the door and the board." },
  { phrase: "Ta chaise est sous la table.", meaning: "Your chair is under the table." },
  { phrase: "La poubelle est derrière la porte.", meaning: "The bin is behind the door." },
  { phrase: "Le tableau est sur le mur.", meaning: "The board is on the wall." },
  { phrase: "Il y a un cahier dans ton sac.", meaning: "There is a notebook in your bag." },
  { phrase: "Maintenant je trouve tout.", meaning: "Now I find everything." },
  { phrase: "De rien.", meaning: "You're welcome." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Où est la table, selon Faith ?",
    correct: "Entre la porte et le tableau",
    distractors: ["Sous le tableau", "Derrière la porte", "Sur le tableau"],
    explanation: "Faith dit : \"La table est entre la porte et le tableau.\"",
  },
  {
    q: "Où est la chaise de Brian ?",
    correct: "Sous la table",
    distractors: ["Sur la table", "Derrière la table", "Dans la table"],
    explanation: "Faith dit : \"Ta chaise est sous la table.\"",
  },
  {
    q: "Où est la poubelle ?",
    correct: "Derrière la porte",
    distractors: ["Sous la table", "Sur le tableau", "Entre la table et la porte"],
    explanation: "Faith dit : \"La poubelle est derrière la porte.\"",
  },
  {
    q: "Où est le tableau exactement ?",
    correct: "Sur le mur",
    distractors: ["Sous la table", "Derrière la porte", "Dans le sac"],
    explanation: "Faith dit : \"Le tableau est sur le mur.\"",
  },
  {
    q: "Qu'est-ce qu'il y a dans le sac de Brian ?",
    correct: "Un cahier et un stylo",
    distractors: ["Une chaise et une table", "Une règle seulement", "Rien du tout"],
    explanation: "Faith dit : \"Oui, il y a un cahier et un stylo dans ton sac.\"",
  },
  {
    q: "Que dit Brian après avoir trouvé ses affaires ?",
    correct: "Maintenant je trouve tout",
    distractors: ["Je ne trouve rien", "Où est mon sac ?", "Merci, au revoir"],
    explanation: "Brian dit : \"Merci, Faith ! Maintenant je trouve tout.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Faith : La table est ", after: " la porte et le tableau.", answer: "entre", gloss: "The table is between the door and the board." },
  { before: "Faith : Ta chaise est ", after: " la table.", answer: "sous", gloss: "Your chair is under the table." },
  { before: "Faith : La poubelle est ", after: " la porte.", answer: "derrière", gloss: "The bin is behind the door." },
  { before: "Faith : Le tableau est ", after: " le mur.", answer: "sur", gloss: "The board is on the wall." },
  { before: "Faith : Oui, il y a un cahier et un stylo ", after: " ton sac.", answer: "dans", gloss: "Yes, there is a notebook and a pen in your bag." },
  { before: "Brian : Faith, où est la ", after: " ?", answer: "table", gloss: "Brian asks where the table is." },
  { before: "Brian : Merci, Faith ! Maintenant je trouve ", after: ".", answer: "tout", gloss: "Thank you, Faith! Now I find everything." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["La", "table", "est", "entre", "la", "porte", "et", "le", "tableau", "."], sentence: "La table est entre la porte et le tableau." },
  { chunks: ["Ta", "chaise", "est", "sous", "la", "table", "."], sentence: "Ta chaise est sous la table." },
  { chunks: ["La", "poubelle", "est", "derrière", "la", "porte", "."], sentence: "La poubelle est derrière la porte." },
  { chunks: ["Le", "tableau", "est", "sur", "le", "mur", "."], sentence: "Le tableau est sur le mur." },
];

export const gettingAroundReading: Skill = {
  id: "g5-fr-r-getting-around",
  code: "R.9",
  subjectId: "french",
  strandId: "g5-fr-reading",
  grade: 5,
  title: "Reading: locating classroom objects",
  description: "Read a short French dialogue about helping a classmate locate classroom objects using dans, derrière, entre, sur, and sous, then answer comprehension questions.",
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
        prompt: readingTrueFalsePrompt(rng),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check exactly where Faith says each object is.",
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
        prompt: matchPrompt(rng, "phrase from the dialogue to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the dialogue above.",
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
        prompt: orderPrompt(rng, "the words to rebuild this line from the dialogue"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Check the dialogue above for the exact wording and word order.",
        explanation: `The correct line is: "${set.sentence}"`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Reread the matching line in the dialogue above.",
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
      hint: "Look at exactly where Faith says each object is located.",
      explanation: q.explanation,
    };
  },
};
