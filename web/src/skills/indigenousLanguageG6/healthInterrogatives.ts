import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 6 "Health and Diseases", sub-strand 6.1.1
// "Listening for Information: Interrogatives" (LS.6).

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface InterrogativeEntry { word: string; asksAbout: string }

const INTERROGATIVES: InterrogativeEntry[] = [
  { word: "Who", asksAbout: "a person" },
  { word: "What", asksAbout: "a thing or idea" },
  { word: "When", asksAbout: "a time" },
  { word: "Where", asksAbout: "a place" },
  { word: "Why", asksAbout: "a reason" },
  { word: "How", asksAbout: "a method or manner" },
  { word: "Which", asksAbout: "a choice among options" },
  { word: "Whose", asksAbout: "ownership" },
];

interface QAEntry { question: string; interrogative: string }

const QUESTIONS: QAEntry[] = [
  { question: "treats patients at the hospital?", interrogative: "Who" },
  { question: "do germs spread from person to person?", interrogative: "How" },
  { question: "should a person visit a doctor for a check-up?", interrogative: "When" },
  { question: "is the nearest hospital located?", interrogative: "Where" },
  { question: "is good hygiene important for preventing disease?", interrogative: "Why" },
  { question: "are the common symptoms of a cold?", interrogative: "What" },
  { question: "medicine did the doctor prescribe for the fever?", interrogative: "Which" },
  { question: "bandage is this — yours or your friend's?", interrogative: "Whose" },
  { question: "can a community help prevent the spread of disease?", interrogative: "How" },
  { question: "nurse is on duty at the clinic tonight?", interrogative: "Which" },
  { question: "do you feel unwell after eating that food?", interrogative: "Why" },
  { question: "vehicle carries patients to hospital in an emergency?", interrogative: "What" },
];

const QUESTION_STEPS: { id: string; label: string }[] = [
  { id: "decide", label: "Decide exactly what information you want to find out" },
  { id: "choose", label: "Choose the interrogative word that matches that information" },
  { id: "start", label: "Put the interrogative word at the start of the question" },
  { id: "rest", label: "Add the rest of the question clearly" },
  { id: "mark", label: "End the sentence with a question mark" },
  { id: "listen", label: "Listen carefully to the answer given" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} wants to know the REASON good hygiene matters. Which interrogative word should ${who} start the question with?`, correct: "Why", wrong: ["Who", "Where", "Whose"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} wants to know WHO treats patients at a hospital. Which interrogative word fits best?`, correct: "Who", wrong: ["What", "When", "How"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} wants to ask about the METHOD germs use to spread. Which interrogative word fits?`, correct: "How", wrong: ["Who", "Why", "Whose"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked what "symptoms" means after hearing it used at a clinic. What is the correct meaning?`, correct: "Signs that show a person is unwell", wrong: ["A substance used to treat illness", "A place where sick people receive care", "A tool used to inject medicine"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "ambulance" into a vocabulary group. Which group does it belong to?`, correct: "Health equipment", wrong: ["Health ideas", "Health people and places", "None of these groups"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} wants to know the LOCATION of the nearest clinic. Which interrogative word should start the question?`, correct: "Where", wrong: ["When", "Why", "Who"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} sees the bandage on a desk and wants to know who owns it. Which interrogative word asks about ownership?`, correct: "Whose", wrong: ["What", "How", "When"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must choose ONE of several medicines a doctor mentioned. Which interrogative word helps ${who} ask about a choice among options?`, correct: "Which", wrong: ["Why", "Where", "Whose"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} asks "When should a person visit a doctor?" What kind of information is ${who} asking for?`, correct: "A time", wrong: ["A place", "A reason", "A person"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} forms a question but forgets to add a question mark at the end. What is the effect on the sentence?`, correct: "It no longer clearly reads as a question, even though an interrogative word was used", wrong: ["There is no effect at all on the sentence", "The sentence becomes an exclamation instead", "The interrogative word is automatically removed"] }; },
];

export const healthInterrogatives: Skill = {
  id: "g6-il-ls-health",
  code: "LS.6",
  subjectId: "indigenous-language",
  strandId: "g6-il-listening-speaking",
  grade: 6,
  title: "Health and diseases: interrogatives",
  description: "Identify and use interrogative words correctly to ask health-related questions for information.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Ask yourself exactly what kind of information the question needs: a person, a place, a time, a reason, a method, a choice, or ownership.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each interrogative word with what it asks about.", "each word below with the kind of answer it expects.", "each interrogative with the type of information it seeks.", "each word with what it actually asks about."];
      const chosen = shuffle(rng, INTERROGATIVES).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.word })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.asksAbout })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.word] = a.word;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.word} — asks about ${a.asksAbout}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each question below by the interrogative word that best completes it.", "each question into the group of its correct interrogative word.", "these questions by the missing interrogative word.", "each question by whether it needs Who, What, When, Where, Why, or How."];
      const chosen = shuffle(rng, QUESTIONS).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.interrogative)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `q${i}`, label: c.question }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`q${i}`] = c.interrogative));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Read the question and ask: is it about a person, a thing, a time, a place, a reason, a method, a choice, or ownership?", explanation: chosen.map((c) => `"${c.interrogative} ${c.question}"`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for forming a good question in order.", "these question-forming steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, QUESTION_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: QUESTION_STEPS.map((s) => s.id), hint: "Start by deciding what you want to know, choose the right interrogative word, build the question, and listen to the answer.", explanation: QUESTION_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the question with", "Choose and write", "Supply"];
      const CLOSERS = ["the interrogative word that correctly completes this question.", "the missing interrogative word below.", "the word that best begins this question.", "the correct interrogative to start the sentence.", "the interrogative word that best fits the blank."];
      const entry = randChoice(rng, QUESTIONS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: "", after: entry.question, correctAnswer: entry.interrogative, inputMode: "text", hint, explanation: `${entry.interrogative} ${entry.question}` };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
