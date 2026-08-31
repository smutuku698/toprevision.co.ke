import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { GROOMING_VOCAB, name, place, umlautAccepted } from "./shared";

// LS.7 My Body — the design uses this theme title for the daily grooming/personal-hygiene routine
// throughout Grade 6 (no body-part naming). Oral routine vocabulary practised through matching,
// sorting, fill-in, an ordered morning-routine task, situational reasoning, and a dedicated
// reflexive-pronoun drill for "Ich putze mir die Zähne" style sentences tied to "Was machst du um 7 Uhr?"

const MATCH_OPENERS = ["Match each German phrase", "Pair every routine phrase", "Connect each vocabulary item", "Link each phrase below", "Match the German term", "Join each routine phrase"];
const MATCH_CLOSERS = ["to its correct English meaning.", "with what it means in English.", "to its English translation.", "to the right meaning.", "to what it means."];

const CATEGORIZE_OPENERS = ["Sort each phrase", "Group these German phrases", "Classify each action", "Decide where each phrase belongs", "Organise the phrases below", "Put each phrase"];
const CATEGORIZE_CLOSERS = ["into the correct category.", "by which group it belongs to.", "into the right group.", "according to its category.", "the way it should be grouped."];

const FILL_OPENERS = ["Fill in the missing German word", "Complete the sentence with the right German word", "Work out the missing German word", "Type the correct German word", "Supply the missing German word", "Complete this phrase correctly"];
const FILL_CLOSERS = ["to finish the sentence.", "so the sentence is correct.", "that fits the meaning.", "based on the meaning given."];

const ORDER_OPENERS = ["Put these lines", "Arrange the morning routine", "Order the sentences", "Sequence this routine", "Rearrange the pieces", "Organise the lines"];
const ORDER_CLOSERS = ["in the correct order.", "so they make sense.", "the way they would naturally happen.", "into a sensible sequence.", "in a logical order."];

const SCENARIO_PROMPT_POOL = [
  "What is happening in this situation?",
  "Read the situation and choose what fits.",
  "Work out what is being expressed here.",
  "Choose the phrase that matches the situation.",
  "What is this person doing?",
  "Pick the correct description of this moment.",
  "Decide what fits this scene.",
  "What is being said here?",
  "Which description matches what was said?",
  "Choose what best explains this exchange.",
  "What is really going on in this exchange?",
  "Work out the purpose of what was said.",
];

const REFLEXIVE_PROMPT_POOL = [
  "Which sentence correctly describes this activity?",
  "Choose the grammatically correct sentence.",
  "Pick the sentence with the correct reflexive pronoun.",
  "Which option is correctly formed in German?",
  "Select the sentence without a grammar mistake.",
  "What is the correct way to say this in German?",
  "Which sentence uses 'mir' the right way?",
  "Choose the sentence a German speaker would actually say.",
  "Which sentence correctly matches this routine moment?",
  "Pick the option that is grammatically correct.",
  "Which sentence has the right pronoun and case?",
  "Select the sentence that means exactly this.",
];

type Bucket = "Washing" | "Grooming" | "Daily routine";

const CATEGORY_ITEMS: { word: string; bucket: Bucket }[] = [
  { word: "die Hände waschen", bucket: "Washing" },
  { word: "das Gesicht waschen", bucket: "Washing" },
  { word: "die Haare waschen", bucket: "Washing" },
  { word: "duschen", bucket: "Washing" },
  { word: "die Zähne putzen", bucket: "Grooming" },
  { word: "die Haare kämmen", bucket: "Grooming" },
  { word: "sich kämmen", bucket: "Grooming" },
  { word: "die Nägel schneiden", bucket: "Grooming" },
  { word: "sich anziehen", bucket: "Daily routine" },
  { word: "aufstehen", bucket: "Daily routine" },
  { word: "frühstücken", bucket: "Daily routine" },
  { word: "schlafen gehen", bucket: "Daily routine" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'To brush one's teeth' in German is ", after: ".", correct: "die Zähne putzen" },
  { before: "'To comb one's hair' in German is ", after: ".", correct: "die Haare kämmen" },
  { before: "'To wash one's hands' in German is ", after: ".", correct: "die Hände waschen" },
  { before: "'To shower' in German is ", after: ".", correct: "duschen" },
  { before: "'To get dressed' in German is ", after: ".", correct: "sich anziehen" },
  { before: "'To wash one's face' in German is ", after: ".", correct: "das Gesicht waschen" },
  { before: "'To wash one's hair' in German is ", after: ".", correct: "die Haare waschen" },
  { before: "'To cut one's nails' in German is ", after: ".", correct: "die Nägel schneiden" },
  { before: "'To get up' in German is ", after: ".", correct: "aufstehen" },
  { before: "'To eat breakfast' in German is ", after: ".", correct: "frühstücken" },
  { before: "'To go to sleep' in German is ", after: ".", correct: "schlafen gehen" },
];

const ORDER_SETS: { lines: string[] }[] = [
  { lines: ["Ich stehe auf. (I get up)", "Ich wasche mir das Gesicht. (I wash my face)", "Ich putze mir die Zähne. (I brush my teeth)", "Ich ziehe mich an. (I get dressed)"] },
  { lines: ["Ich dusche. (I shower)", "Ich kämme mir die Haare. (I comb my hair)", "Ich frühstücke. (I eat breakfast)", "Ich gehe zur Schule. (I go to school)"] },
  { lines: ["Ich wasche mir die Hände. (I wash my hands)", "Ich esse Frühstück. (I eat breakfast)", "Ich putze mir die Zähne. (I brush my teeth)", "Ich gehe aus dem Haus. (I leave the house)"] },
  { lines: ["Es ist Abend. (it's evening)", "Ich dusche. (I shower)", "Ich putze mir die Zähne. (I brush my teeth)", "Ich gehe schlafen. (I go to sleep)"] },
  { lines: ["Ich schneide mir die Nägel. (I cut my nails)", "Ich wasche mir die Haare. (I wash my hair)", "Ich kämme mir die Haare. (I comb my hair)", "Ich ziehe mich an. (I get dressed)"] },
];

const SCENARIO_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} in ${p} wakes up and says "Ich stehe auf." What is ${n} doing?`,
    correct: "getting up",
    distractors: ["going to sleep", "washing their hands", "eating breakfast"],
    explanation: `"aufstehen" means "to get up" — the opposite of "schlafen gehen" (to go to sleep).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} stands at the sink every morning and says "Ich putze mir die Zähne." What is ${n} describing?`,
    correct: "brushing their teeth",
    distractors: ["combing their hair", "washing their face", "cutting their nails"],
    explanation: `"die Zähne putzen" means "to brush one's teeth" — a different grooming action from combing hair or washing the face.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} before school says "Ich wasche mir die Hände, bevor ich esse." Why does ${n} wash their hands?`,
    correct: "before eating",
    distractors: ["before sleeping", "before showering", "before getting dressed"],
    explanation: `"bevor ich esse" means "before I eat" — the hand-washing happens right before a meal.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Ich dusche jeden Morgen." What routine is being described?`,
    correct: "showering every morning",
    distractors: ["showering every evening", "brushing teeth every morning", "getting dressed every morning"],
    explanation: `"jeden Morgen" means "every morning," and "duschen" means "to shower."`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} looks in the mirror and says "Ich kämme mir die Haare." What is ${n} doing?`,
    correct: "combing their hair",
    distractors: ["washing their hair", "cutting their nails", "brushing their teeth"],
    explanation: `"die Haare kämmen" means "to comb one's hair" — different from "die Haare waschen" (to wash one's hair).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} puts on a school uniform and says "Ich ziehe mich an." What is ${n} doing?`,
    correct: "getting dressed",
    distractors: ["getting up", "eating breakfast", "going to sleep"],
    explanation: `"sich anziehen" means "to get dressed" — a routine step, distinct from getting up or eating.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} sits at the table and says "Ich frühstücke um sieben Uhr." What is ${n} telling us?`,
    correct: "that they eat breakfast at 7 o'clock",
    distractors: ["that they get up at 7 o'clock", "that they go to school at 7 o'clock", "that they shower at 7 o'clock"],
    explanation: `"frühstücken" means "to eat breakfast," and "um sieben Uhr" means "at 7 o'clock."`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} yawns at night and says "Ich gehe jetzt schlafen." What is ${n} about to do?`,
    correct: "go to sleep",
    distractors: ["get up", "eat breakfast", "wash their face"],
    explanation: `"schlafen gehen" means "to go to sleep" — the opposite routine step from "aufstehen" (to get up).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} trims their fingers carefully and says "Ich schneide mir die Nägel." What is ${n} doing?`,
    correct: "cutting their nails",
    distractors: ["washing their hands", "combing their hair", "brushing their teeth"],
    explanation: `"die Nägel schneiden" means "to cut one's nails" — a distinct grooming task from washing hands.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Ich wasche mir zuerst das Gesicht, dann die Haare." What order is ${n} describing?`,
    correct: "washing the face before the hair",
    distractors: ["washing the hair before the face", "washing hands before the face", "getting dressed before washing"],
    explanation: `"zuerst ... dann ..." means "first ... then ..." — the face is washed first, the hair second.`,
  }),
];

const REFLEXIVE_TEMPLATES: { activity: string; correct: string; wrongCase: string; wrongPronoun: string }[] = [
  { activity: "die Zähne putzen", correct: "Ich putze mir die Zähne.", wrongCase: "Ich putze mich die Zähne.", wrongPronoun: "Ich putze dir die Zähne." },
  { activity: "die Haare kämmen", correct: "Ich kämme mir die Haare.", wrongCase: "Ich kämme mich die Haare.", wrongPronoun: "Ich kämme sich die Haare." },
  { activity: "die Hände waschen", correct: "Ich wasche mir die Hände.", wrongCase: "Ich wasche mich die Hände.", wrongPronoun: "Ich wasche dir die Hände." },
  { activity: "das Gesicht waschen", correct: "Ich wasche mir das Gesicht.", wrongCase: "Ich wasche mich das Gesicht.", wrongPronoun: "Ich wasche sich das Gesicht." },
  { activity: "die Haare waschen", correct: "Ich wasche mir die Haare.", wrongCase: "Ich wasche mich die Haare.", wrongPronoun: "Ich wasche dir die Haare." },
  { activity: "die Nägel schneiden", correct: "Ich schneide mir die Nägel.", wrongCase: "Ich schneide mich die Nägel.", wrongPronoun: "Ich schneide sich die Nägel." },
];

export const bodySpeaking: Skill = {
  id: "g6-de-ls-body",
  code: "LS.7",
  subjectId: "german",
  strandId: "g6-de-listening-speaking",
  grade: 6,
  title: "My Body (Daily Grooming Routine)",
  description: "Speak and recognise German daily grooming/personal-hygiene vocabulary — matching, sorting, fill-in, an ordered morning routine, reasoning about the routine, and a dedicated 'Ich putze mir die Zähne' reflexive-pronoun drill tied to 'Was machst du um 7 Uhr?'",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario", "reflexive"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, GROOMING_VOCAB).slice(0, 5);
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
        hint: "Think about the order these actions usually happen in a morning routine.",
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
          { id: "Washing", label: "Washing" },
          { id: "Grooming", label: "Grooming" },
          { id: "Daily routine", label: "Daily routine" },
        ],
        correctBucket,
        hint: "Washing uses water; grooming tidies hair/nails/teeth; daily routine covers the wider day.",
        explanation: chosen.map((c) => `"${c.word}" is part of the ${c.bucket.toLowerCase()} group.`).join(" "),
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
        hint: "Think of the infinitive verb phrase for this routine action.",
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
        hint: "Think about the natural order of a morning (or evening) routine.",
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
        hint: "Match the routine phrase to what it actually describes.",
        explanation: q.explanation,
      };
    }

    const t = randChoice(rng, REFLEXIVE_TEMPLATES);
    const hour = randInt(rng, 6, 9);
    const noMir = t.correct.replace(" mir", "");
    const distractors = [t.wrongCase, t.wrongPronoun, noMir];
    const choices = shuffle(rng, [t.correct, ...distractors]);
    return {
      kind: "multiple-choice",
      prompt: `${randChoice(rng, REFLEXIVE_PROMPT_POOL)} Es ist ${hour} Uhr. Was machst du gerade? (${t.activity})`,
      choices,
      correctIndex: choices.indexOf(t.correct),
      layout: "list",
      hint: "This kind of routine uses 'mir' (to/for myself) — not 'mich', 'dir', or 'sich', and 'mir' should not be dropped.",
      explanation: `"${t.correct}" is correct — daily-routine actions on your own body use the reflexive dative pronoun "mir", not the accusative "mich" or another person's pronoun.`,
    };
  },
};
