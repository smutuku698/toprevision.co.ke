import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { GREETING_VOCAB, name, place, umlautAccepted } from "./shared";

// LS.1 Greetings and Introduction — oral greeting/introduction vocabulary practised through
// matching, sorting, fill-in, ordered exchanges, situational reasoning, and the "Das ist ___;
// Er/Sie ist ___ Jahre alt" pattern for introducing someone else.

const MATCH_OPENERS = ["Match each German word", "Pair every German phrase", "Connect each vocabulary item", "Link each word below", "Match the German term", "Join each phrase"];
const MATCH_CLOSERS = ["to its correct English meaning.", "with what it means in English.", "to its English translation.", "to the right meaning.", "to what it means."];

const CATEGORIZE_OPENERS = ["Sort each phrase", "Group these German phrases", "Classify each item", "Decide where each phrase belongs", "Organise the phrases below", "Put each phrase"];
const CATEGORIZE_CLOSERS = ["into the correct category.", "by which group it belongs to.", "into the right group.", "according to its category.", "the way it should be grouped."];

const FILL_OPENERS = ["Fill in the missing German word or phrase", "Complete the sentence with the right German word", "Work out the missing German word", "Type the correct German phrase", "Supply the missing German word", "Complete this phrase correctly"];
const FILL_CLOSERS = ["to finish the sentence.", "so the sentence is correct.", "that fits the meaning.", "based on the meaning given."];

const ORDER_OPENERS = ["Put these lines", "Arrange the phrases", "Order the words", "Sequence this exchange", "Rearrange the pieces", "Organise the lines"];
const ORDER_CLOSERS = ["in the correct order.", "so they make sense.", "the way they would naturally be said.", "into a sensible sequence.", "in a logical order."];

const SCENARIO_PROMPT_POOL = [
  "What is happening in this situation?",
  "Read the situation and choose what fits.",
  "Work out what is being expressed here.",
  "Choose the phrase that matches the situation.",
  "What is this person doing?",
  "Pick the correct description of this moment.",
  "Decide what fits this scene.",
  "What function does this phrase serve here?",
  "Which description matches what was said?",
  "Choose what best explains this exchange.",
  "What is really going on in this exchange?",
  "Work out the purpose of what was said.",
];

const INTRODUCE_PROMPT_POOL: ((n: string) => string)[] = [
  (n) => `Which sentence correctly introduces ${n} and states their age?`,
  (n) => `Choose the correct way to introduce ${n} to a friend.`,
  (n) => `Pick the sentence that correctly presents ${n} in German.`,
  (n) => `Which option uses the right pronoun and verb for ${n}?`,
  (n) => `Select the grammatically correct introduction for ${n}.`,
  (n) => `What is the correct German sentence introducing ${n}?`,
  (n) => `Choose the sentence with the correct pronoun for ${n}.`,
  (n) => `Which sentence correctly says who ${n} is and their age?`,
  (n) => `Pick the correctly formed introduction sentence for ${n}.`,
  (n) => `Which German sentence about ${n} is grammatically correct?`,
  (n) => `Choose the option that introduces ${n} without a grammar mistake.`,
  (n) => `Which sentence would a German speaker actually say about ${n}?`,
];

type Bucket = "Greeting" | "Asking or Telling" | "Politeness";

const CATEGORY_ITEMS: { word: string; bucket: Bucket }[] = [
  { word: "Hallo", bucket: "Greeting" },
  { word: "Guten Morgen", bucket: "Greeting" },
  { word: "Guten Tag", bucket: "Greeting" },
  { word: "Guten Abend", bucket: "Greeting" },
  { word: "Tschüss", bucket: "Greeting" },
  { word: "Auf Wiedersehen", bucket: "Greeting" },
  { word: "Bis bald", bucket: "Greeting" },
  { word: "Wie heißt du?", bucket: "Asking or Telling" },
  { word: "Ich heiße...", bucket: "Asking or Telling" },
  { word: "Wie alt bist du?", bucket: "Asking or Telling" },
  { word: "Ich bin ... Jahre alt", bucket: "Asking or Telling" },
  { word: "Wie geht es dir?", bucket: "Asking or Telling" },
  { word: "Mir geht es gut", bucket: "Asking or Telling" },
  { word: "Danke", bucket: "Politeness" },
  { word: "Bitte", bucket: "Politeness" },
  { word: "Freut mich", bucket: "Politeness" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'Hello' in German is ", after: ".", correct: "Hallo" },
  { before: "'Good morning' in German is ", after: ".", correct: "Guten Morgen" },
  { before: "'Good day' in German is ", after: ".", correct: "Guten Tag" },
  { before: "'Good evening' in German is ", after: ".", correct: "Guten Abend" },
  { before: "'Bye' in German is ", after: ".", correct: "Tschüss" },
  { before: "'Goodbye' in German is ", after: ".", correct: "Auf Wiedersehen" },
  { before: "To ask 'what is your name?' in German you say ", after: ".", correct: "Wie heißt du?" },
  { before: "'How old are you?' in German is ", after: ".", correct: "Wie alt bist du?" },
  { before: "'How are you?' in German is ", after: ".", correct: "Wie geht es dir?" },
  { before: "'Thank you' in German is ", after: ".", correct: "Danke" },
  { before: "'Please' in German is ", after: ".", correct: "Bitte" },
  { before: "'Nice to meet you' in German is ", after: ".", correct: "Freut mich" },
  { before: "'See you soon' in German is ", after: ".", correct: "Bis bald" },
];

const ORDER_SETS: { lines: string[] }[] = [
  { lines: ["Hallo (hello)", "Wie heißt du? (what is your name?)", "Ich heiße Amina. (my name is Amina)", "Tschüss (bye)"] },
  { lines: ["Guten Morgen (good morning)", "Wie geht es dir? (how are you?)", "Mir geht es gut, danke. (I'm doing well, thanks)", "Bis bald (see you soon)"] },
  { lines: ["Guten Tag (good day)", "Wie alt bist du? (how old are you?)", "Ich bin zwölf Jahre alt. (I'm twelve years old)", "Auf Wiedersehen (goodbye)"] },
  { lines: ["Hallo (hello)", "Freut mich. (nice to meet you)", "Wie heißt du? (what is your name?)", "Ich heiße Brian. (my name is Brian)"] },
  { lines: ["Guten Abend (good evening)", "Wie geht es dir? (how are you?)", "Mir geht es gut. (I'm doing well)", "Tschüss (bye)"] },
  { lines: ["Hallo (hello)", "Wie alt bist du? (how old are you?)", "Ich bin dreizehn Jahre alt. (I'm thirteen years old)", "Bis bald (see you soon)"] },
];

const SCENARIO_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} in ${p} meets a new classmate and says "Ich heiße ${n}." What is ${n} doing?`,
    correct: "introducing themselves",
    distractors: ["asking how someone is", "saying goodbye", "talking about the weather"],
    explanation: `"Ich heiße ${n}" means "my name is ${n}" — this introduces yourself, not the weather or a farewell.`,
  }),
  (n, p) => ({
    prompt: `At school in ${p}, ${n} asks a friend "Wie geht es dir?" What is ${n} doing?`,
    correct: "asking how someone is",
    distractors: ["introducing themselves", "asking someone's name", "saying good morning"],
    explanation: `"Wie geht es dir?" means "how are you?" — it asks about wellbeing, not a name or a morning greeting.`,
  }),
  (n, p) => ({
    prompt: `${n} arrives at school in ${p} early and says "Guten Morgen" to the teacher.`,
    correct: "greeting in the morning",
    distractors: ["saying goodbye", "thanking the teacher", "asking a question"],
    explanation: `"Guten Morgen" is a morning greeting — it is not a farewell, a thank-you, or a question.`,
  }),
  (n, p) => ({
    prompt: `As ${n} leaves school in ${p}, ${n} says "Tschüss."`,
    correct: "saying goodbye",
    distractors: ["introducing themselves", "greeting in the morning", "asking how someone is"],
    explanation: `"Tschüss" is an informal goodbye — used when leaving, not when arriving or asking about wellbeing.`,
  }),
  (n, p) => ({
    prompt: `${n} is thanked by a friend in ${p} and replies "Bitte."`,
    correct: "saying you're welcome",
    distractors: ["saying goodbye", "asking someone's name", "greeting in the evening"],
    explanation: `"Bitte" here means "you're welcome" — a reply to thanks, not a farewell or a greeting.`,
  }),
  (n, p) => ({
    prompt: `${n} meets a new student in ${p} for the first time and says "Freut mich."`,
    correct: "expressing pleasure at meeting someone",
    distractors: ["asking for the time", "describing the weather", "saying goodbye"],
    explanation: `"Freut mich" means "nice to meet you" — said only when meeting someone for the first time.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} is asked their age and replies "Ich bin zwölf Jahre alt."`,
    correct: "stating their own age",
    distractors: ["asking someone else's age", "introducing someone else", "saying goodbye"],
    explanation: `"Ich bin zwölf Jahre alt" uses "Ich bin" (I am), stating the speaker's own age.`,
  }),
  (n, p) => ({
    prompt: `${n} greets family at dinner in ${p} in the evening by saying "Guten Abend."`,
    correct: "greeting in the evening",
    distractors: ["greeting in the morning", "saying goodbye", "asking how someone is"],
    explanation: `"Guten Abend" is specifically the evening greeting, unlike "Guten Morgen" for mornings.`,
  }),
  (n, p) => ({
    prompt: `${n} is leaving a friend's house in ${p} and expects to see them again soon, so ${n} says "Bis bald."`,
    correct: "saying see you soon",
    distractors: ["saying goodbye forever", "asking a name", "greeting in the morning"],
    explanation: `"Bis bald" means "see you soon" — it implies meeting again shortly, unlike a final farewell.`,
  }),
  (n, p) => ({
    prompt: `A teacher in ${p} greets the whole class with "Guten Tag" and ${n} replies the same way.`,
    correct: "greeting during the day",
    distractors: ["greeting in the evening", "saying goodbye", "asking a question"],
    explanation: `"Guten Tag" is the general daytime greeting, distinct from "Guten Abend" for evenings.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} formally says goodbye to a visiting guest with "Auf Wiedersehen."`,
    correct: "saying a formal goodbye",
    distractors: ["saying an informal 'bye'", "greeting someone", "thanking someone"],
    explanation: `"Auf Wiedersehen" is a more formal goodbye than the casual "Tschüss."`,
  }),
];

export const greetingsSpeaking: Skill = {
  id: "g6-de-ls-greetings",
  code: "LS.1",
  subjectId: "german",
  strandId: "g6-de-listening-speaking",
  grade: 6,
  title: "Greetings and Introduction",
  description: "Speak and recognise basic German greetings and introductions (informal du-form) — matching, sorting, filling gaps, ordering exchanges, situational reasoning, and introducing someone else with 'Das ist ...; Er/Sie ist ... Jahre alt.'",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario", "introduce"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, GREETING_VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.word })));
      const targets = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((v, i) => (correctMap[`${i}-${v.word}`] = `${i}-${v.word}`));
      return {
        kind: "click-match",
        prompt: `${randChoice(rng, MATCH_OPENERS)} ${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "Think about when each phrase would be said — arriving, leaving, or asking something.",
        explanation: chosen.map((v) => `"${v.word}" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORY_ITEMS).slice(0, 7);
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Greeting", label: "Greeting" },
          { id: "Asking or Telling", label: "Asking or Telling" },
          { id: "Politeness", label: "Politeness" },
        ],
        correctBucket,
        hint: "Greetings mark arrival/departure, asking-or-telling phrases share info, politeness phrases are courteous words.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.bucket.toLowerCase()} phrase.`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, FILL_OPENERS)} ${randChoice(rng, FILL_CLOSERS)}`,
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: umlautAccepted(f.correct),
        inputMode: "text",
        hint: "Recall the German greeting or introduction phrase with this meaning.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const withIds = set.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, ORDER_OPENERS)} ${randChoice(rng, ORDER_CLOSERS)}`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "A greeting comes first, then any question/response, then a farewell.",
        explanation: `A natural order is:\n${set.lines.join("\n")}`,
      };
    }

    if (branch === "scenario") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, SCENARIO_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, SCENARIO_PROMPT_POOL)} ${q.prompt}`,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Think about when each phrase is used: arriving, leaving, asking wellbeing, or being polite.",
        explanation: q.explanation,
      };
    }

    const n = name(rng);
    const pronoun = randChoice(rng, ["Er", "Sie"] as const);
    const age = randInt(rng, 10, 15);
    const correct = `Das ist ${n}. ${pronoun} ist ${age} Jahre alt.`;
    const wrongPronoun = pronoun === "Er" ? "Sie" : "Er";
    const distractors = [
      `Das ist ${n}. ${wrongPronoun} ist ${age} Jahre alt.`,
      `Das ist ${n}. Ich bin ${age} Jahre alt.`,
      `Das ist ${n}. ${pronoun} bin ${age} Jahre alt.`,
    ];
    const choices = shuffle(rng, [correct, ...distractors]);
    return {
      kind: "multiple-choice",
      prompt: randChoice(rng, INTRODUCE_PROMPT_POOL)(n),
      choices,
      correctIndex: choices.indexOf(correct),
      layout: "list",
      hint: "Introducing someone else uses 'Das ist ...' then 'Er/Sie ist ... Jahre alt' — matching pronoun and the verb 'ist', not 'bin'.",
      explanation: `The correct introduction is "${correct}" — "Er/Sie ist" (he/she is) is used for someone else, while "Ich bin" (I am) is only for yourself, and the pronoun must match who is being introduced.`,
    };
  },
};
