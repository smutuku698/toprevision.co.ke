import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface ComprehensionQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface Passage {
  text: string;
  questions: ComprehensionQuestion[];
  trueFalse: { text: string; isTrue: boolean }[];
}

const PASSAGES: Passage[] = [
  {
    text: "In the Wanjiru household, chores are shared equally. Their son Kevin cooks ugali, washes dishes, and irons school uniforms every evening. Their daughter Faith repairs punctured bicycle tyres, fetches firewood, and milks the family cow before sunrise. When a neighbour asked why the children did each other's traditional tasks, their mother explained that every skill is useful for both boys and girls, not just one gender. Now three other families on their street have started sharing chores the same way.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A family where both a son and a daughter share all household chores equally",
          "A family where only the daughter does chores",
          "A boy who refuses to help at home",
          "A mother who does all the housework alone",
        ],
        correctIndex: 0,
        explanation: "The passage describes Kevin and Faith both learning and sharing every household task, regardless of gender.",
      },
      {
        prompt: "Why, most likely, have three other families started sharing chores the same way?",
        choices: [
          "They were influenced by seeing the Wanjiru family's example work well",
          "The government ordered them to",
          "They ran out of house help",
          "Kevin and Faith told them to stop doing chores",
        ],
        correctIndex: 0,
        explanation: "The passage implies that seeing the Wanjiru family succeed encouraged neighbours to copy their example — this is an inference, not a directly stated fact.",
      },
    ],
    trueFalse: [
      { text: "Kevin cooks ugali and irons uniforms.", isTrue: true },
      { text: "Faith repairs bicycle tyres and milks the cow.", isTrue: true },
      { text: "The mother believes only girls should learn household chores.", isTrue: false },
      { text: "No other family has copied how the Wanjiru children share chores.", isTrue: false },
    ],
  },
  {
    text: "At Kimani Primary School, the class captain election surprised many pupils. Zainab, a quiet girl who loved football, won against three boys because her classmates said she led fairly during games. Her deputy, Brian, enjoys knitting scarves during break time and helps organise the class library. Their teacher, Mr. Otieno, reminds the class every week that leadership and hobbies have nothing to do with whether someone is a boy or a girl.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A class where leadership and hobbies are not limited by gender",
          "A class where only boys can be class captain",
          "A teacher who bans football",
          "Zainab losing the class captain election",
        ],
        correctIndex: 0,
        explanation: "Both Zainab's leadership and Brian's knitting show that the class does not link roles or hobbies to gender.",
      },
      {
        prompt: "What can you infer about Mr. Otieno's attitude toward gender roles?",
        choices: [
          "He actively encourages pupils to see beyond gender stereotypes",
          "He believes boys should not knit",
          "He is indifferent to how pupils behave",
          "He wants only boys to be leaders",
        ],
        correctIndex: 0,
        explanation: "His weekly reminder that leadership and hobbies have nothing to do with gender shows he actively promotes this view — an inference from his repeated action.",
      },
    ],
    trueFalse: [
      { text: "Zainab won against three boys in the class captain election.", isTrue: true },
      { text: "Brian enjoys knitting scarves during break time.", isTrue: true },
      { text: "Mr Otieno believes only boys should be leaders.", isTrue: false },
      { text: "The class captain election had no boys competing.", isTrue: false },
    ],
  },
];

const VOCAB: { word: string; meaning: string }[] = [
  { word: "stereotype", meaning: "A fixed, oversimplified idea about a group of people" },
  { word: "chores", meaning: "Regular small tasks done to keep a home running" },
  { word: "equality", meaning: "Treating people the same regardless of differences such as gender" },
  { word: "responsibility", meaning: "A duty that a person is expected to carry out" },
  { word: "cooperation", meaning: "Working together with others toward a shared goal" },
  { word: "leadership", meaning: "The ability to guide or direct a group of people" },
];

interface FillItem {
  before: string;
  after: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  hint: string;
  explanation: string;
}

const FILL_ITEMS: FillItem[] = [
  {
    before: "Every evening, Kevin",
    after: "the dishes after supper.",
    correctAnswer: "washes",
    hint: "'Every evening' signals a habitual action, so use the present tense verb form.",
    explanation: "'Every evening' describes a repeated present-tense habit, so the verb takes the -s ending: washes.",
  },
  {
    before: "Last Saturday, Faith",
    after: "a punctured bicycle tyre for her neighbour.",
    correctAnswer: "repaired",
    hint: "'Last Saturday' points to an action that has already happened, so use the past tense.",
    explanation: "'Last Saturday' places the action in the past, so the verb takes the -ed ending: repaired.",
  },
  {
    before: "Every morning before school, Faith",
    after: "the family cow.",
    correctAnswer: "milks",
    hint: "'Every morning' signals a habitual present-tense action.",
    explanation: "'Every morning' describes a repeated present action, so the verb takes the -s ending: milks.",
  },
  {
    before: "Yesterday, Brian and his classmates",
    after: "the class library shelves together.",
    correctAnswer: "organised",
    acceptedAnswers: ["organized"],
    hint: "'Yesterday' points to a completed action in the past.",
    explanation: "'Yesterday' signals the past tense, so the verb takes the -ed ending: organised (or organized).",
  },
];

const MORNING_STEPS: { id: string; label: string }[] = [
  { id: "wake", label: "Kevin and Faith wake up together at dawn." },
  { id: "faith-cow", label: "Faith milks the family cow before the sun is fully up." },
  { id: "kevin-tea", label: "Kevin boils water and prepares tea for the household." },
  { id: "both-sweep", label: "Together, they sweep the compound before leaving for school." },
];

export const genderRolesReading: Skill = {
  id: "g8-il-r-gender-roles",
  code: "R.1",
  subjectId: "indigenous-language",
  strandId: "g8-il-reading",
  grade: 8,
  title: "Gender roles: reading for comprehension",
  description: "Read short texts about gender roles, answer direct and inferential questions, and practise present and past tense.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "categorize", "match", "fill", "order"] as const);

    if (branch === "mc") {
      const passage = randChoice(rng, PASSAGES);
      const q = randChoice(rng, passage.questions);
      const correctText = q.choices[q.correctIndex];
      const choices = shuffle(rng, q.choices);
      return {
        kind: "multiple-choice",
        passage: passage.text,
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: "Reread the passage carefully — some answers are stated directly, others must be worked out from clues.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const passage = randChoice(rng, PASSAGES);
      const items = passage.trueFalse.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        passage: passage.text,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Check each statement against exactly what the passage says, not what you assume.",
        explanation: passage.trueFalse.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"} according to the passage.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each gender-roles vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each word means when talking about fairness and shared duties between boys and girls.",
        explanation: chosen.map((v) => `${v.word} — ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing verb in the correct tense.",
        before: item.before,
        after: item.after,
        correctAnswer: item.correctAnswer,
        acceptedAnswers: item.acceptedAnswers,
        inputMode: "text",
        hint: item.hint,
        explanation: item.explanation,
      };
    }

    const items = shuffle(rng, MORNING_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange Kevin and Faith's morning routine in the order it most likely happens.",
      instruction: "Click them in order.",
      items,
      correctOrder: MORNING_STEPS.map((s) => s.id),
      hint: "Think about what needs to happen before sunrise, and what comes just before leaving for school.",
      explanation: MORNING_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
