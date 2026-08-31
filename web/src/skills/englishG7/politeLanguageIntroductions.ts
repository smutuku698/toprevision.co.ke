import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASE_FUNCTIONS: { phrase: string; function: string }[] = [
  { phrase: "Good morning, allow me to introduce myself. My name is Wanjiru.", function: "A formal way to introduce yourself to someone you have just met" },
  { phrase: "Hi, I'm Kevo, nice to meet you!", function: "An informal way to introduce yourself to a peer" },
  { phrase: "Please allow me to introduce my grandmother, Bibi Amina.", function: "A respectful way to introduce an elder to someone else" },
  { phrase: "This is my friend Otieno, we're in the same class.", function: "An informal way to introduce a friend to someone else" },
  { phrase: "It is an honour to meet you, Mzee Kamau.", function: "A respectful greeting used when meeting a respected elder" },
  { phrase: "May I present our chief guest, Dr. Wekesa?", function: "A formal way to introduce an important visitor at an event" },
];

const FORMAL_INTROS = [
  "Good afternoon, may I introduce myself? I am Amina Hassan.",
  "It is a pleasure to meet you, sir.",
  "Allow me to present my colleague, Mr. Otieno.",
  "I would like to introduce our chief guest, Dr. Wekesa.",
  "Good morning, please allow me to introduce our head teacher, Mrs. Njeri.",
];

const INFORMAL_INTROS = [
  "Hey, I'm Brian!",
  "This is my buddy Musa.",
  "Yo, meet my cousin Faith.",
  "Hi there, I'm Ken, what's your name?",
  "This is my classmate, we sit together.",
];

const IMPOLITE_TO_POLITE: { impolite: string; polite: string }[] = [
  { impolite: "Whatever, that's just Mary.", polite: "Please allow me to introduce Mary, a member of our group." },
  { impolite: "This one is my sister.", polite: "Please allow me to introduce my sister, Njeri." },
  { impolite: "Meet my teacher, whatever her name is.", polite: "Allow me to introduce our teacher, Mrs. Kamau." },
  { impolite: "Say hi to my dad or whatever.", polite: "Please allow me to introduce my father, Mr. Ochieng." },
];

const ORDER_STEPS = [
  { id: "greet", label: "Greet the person or people appropriately for the situation" },
  { id: "name", label: "Clearly state your name, or the name of the person you are introducing" },
  { id: "detail", label: "Add a respectful detail, such as the person's role or relationship to you" },
  { id: "invite", label: "Thank them or invite further conversation" },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "", after: "me to introduce my classmate, Faith.", correctAnswer: "Allow", acceptedAnswers: ["Permit"] },
  { before: "Good morning, I am pleased to", after: "you.", correctAnswer: "meet" },
  { before: "It's an honour to", after: "you, Mzee.", correctAnswer: "meet" },
  { before: "Please", after: "me to present our chief guest.", correctAnswer: "allow", acceptedAnswers: ["permit"] },
  { before: "May I introduce my", after: ", who has come all the way from Kisumu?", correctAnswer: "uncle", acceptedAnswers: ["aunt", "grandmother", "grandfather", "cousin"] },
];

const KIQ_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it important to use polite language when introducing yourself or others?",
    correct: "It shows respect for the listener and helps create a good first impression",
    distractors: ["It makes the introduction take much longer than necessary", "It is only required when speaking to strangers", "It has no effect on how others perceive you"],
  },
  {
    q: "When introducing an elder, such as a grandparent, how should you generally address them?",
    correct: "Using a respectful title or honorific, such as \"Mzee\" or \"Bibi\", with a calm and respectful tone",
    distractors: ["By using their first name only, the same way you would with a friend", "By avoiding eye contact throughout the introduction", "By speaking as quickly as possible to finish the introduction"],
  },
  {
    q: "What generally makes an introduction \"formal\" rather than \"informal\"?",
    correct: "It uses complete, polite sentences and respectful titles, appropriate for meeting someone new or an elder",
    distractors: ["It always uses nicknames instead of full names", "It is always shorter than an informal introduction", "It never includes a greeting"],
  },
  {
    q: "A new pupil joins your class. What is the most respectful way to introduce them to the teacher?",
    correct: "\"Good morning, Madam. Please allow me to introduce our new classmate, Kevin.\"",
    distractors: ["\"This is the new guy.\"", "\"Hey, there's a new kid here.\"", "\"Madam, some new person is in our class now.\""],
  },
];

export const politeLanguageIntroductions: Skill = {
  id: "g7-eng-ls-polite-language-introductions",
  code: "LS.1",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Oral Skills: Polite Language",
  description: "Identify and use polite expressions to introduce yourself and others in formal and informal contexts.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc-correct", "mc-kiq"] as const);
    const hint = "Polite introductions greet the listener appropriately, state names clearly, and use a respectful tone that fits the situation — an elder or a new visitor needs more formality than a peer.";

    if (branch === "match") {
      const chosen = shuffle(rng, PHRASE_FUNCTIONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.function })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;
      return {
        kind: "click-match",
        prompt: "Match each introduction to what makes it formal or informal, and who it suits.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((p) => `"${p.phrase}" — ${p.function.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const formal = shuffle(rng, FORMAL_INTROS).slice(0, 3);
      const informal = shuffle(rng, INFORMAL_INTROS).slice(0, 3);
      const items = shuffle(rng, [
        ...formal.map((label) => ({ id: label, label, bucket: "formal" })),
        ...informal.map((label) => ({ id: label, label, bucket: "informal" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each introduction into Formal or Informal.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "formal", label: "Formal introduction" },
          { id: "informal", label: "Informal introduction" },
        ],
        correctBucket,
        hint,
        explanation: `Formal: ${formal.join(" / ")}. Informal: ${informal.join(" / ")}.`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of making a polite introduction in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "A polite introduction begins with a greeting, moves to naming the person, adds a respectful detail, and closes warmly.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing polite word to complete this introduction.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `A polite introduction reads: "${[entry.before, entry.correctAnswer, entry.after].filter(Boolean).join(" ")}"`,
      };
    }

    if (branch === "mc-correct") {
      const entry = randChoice(rng, IMPOLITE_TO_POLITE);
      const otherPolite = shuffle(rng, IMPOLITE_TO_POLITE.filter((e) => e !== entry)).slice(0, 3).map((e) => e.polite);
      const choices = shuffle(rng, [entry.polite, ...otherPolite]);
      return {
        kind: "multiple-choice",
        prompt: `Someone says "${entry.impolite}" while introducing a person. Which is the polite way to say the same thing?`,
        choices,
        correctIndex: choices.indexOf(entry.polite),
        layout: "list",
        hint: "Look for the option that names the person respectfully and uses a courteous, complete sentence.",
        explanation: `The polite version is "${entry.polite}". The original, "${entry.impolite}", sounds careless and disrespectful.`,
      };
    }

    const entry = randChoice(rng, KIQ_QUESTIONS);
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
