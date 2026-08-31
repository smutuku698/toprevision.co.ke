import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster, cap } from "./g5EngShared";

// KICD Grade 5 English, Theme 7.0 Learning Through Technology, sub-strand 7.3 Tense:
// Future Time using will / shall. See curriculum-reference/grade-5/english.json.

type Use = "prediction" | "promise" | "offer" | "decision" | "plan";
const USE_LABEL: Record<Use, string> = { prediction: "a prediction", promise: "a promise", offer: "an offer", decision: "a decision made now", plan: "a future plan" };

const TPL: { before: string; after: string; answer: "will" | "shall" | "won't"; use: Use }[] = [
  { before: "I ", after: " send you the file as soon as I get home.", answer: "will", use: "promise" },
  { before: "We ", after: " start the online lesson at nine o'clock tomorrow.", answer: "shall", use: "plan" },
  { before: "The battery ", after: " last long if you keep the screen this bright.", answer: "won't", use: "prediction" },
  { before: "You ", after: " enjoy the coding club next term.", answer: "will", use: "prediction" },
  { before: "I ", after: " help you fix the password after class.", answer: "will", use: "offer" },
  { before: "It ", after: " rain later, so the outdoor lesson may move indoors.", answer: "will", use: "prediction" },
  { before: "We ", after: " never share our passwords with strangers.", answer: "shall", use: "promise" },
  { before: "The teacher ", after: " upload the notes this evening.", answer: "will", use: "prediction" },
  { before: "I ", after: " forget to charge the tablet — I have made a note.", answer: "won't", use: "promise" },
  { before: "Shall I carry the projector? — Yes, please. Thank you, I ", after: " bring it.", answer: "will", use: "decision" },
  { before: "Next year our class ", after: " have its own computer room.", answer: "will", use: "prediction" },
  { before: "We ", after: " meet in the library, not the lab, tomorrow.", answer: "shall", use: "plan" },
];

export const futureTenseWillShall: Skill = {
  id: "g5-eng-grammar-future-will-shall",
  code: "LU.7",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Future Time using will / shall",
  description: "Use 'will' and 'shall' to talk about future time — predictions, promises, offers and decisions — and recognise 'shall' with I/we and the negative won't.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "sort-use", "match", "order", "reason"] as const);

    if (branch === "mc") {
      const t = randChoice(rng, TPL);
      const distractors = t.answer === "won't" ? ["will", "shall", "will not be"] : t.answer === "shall" ? ["will", "shan't", "shalls"] : ["shall", "won't", "wills"];
      const { choices, correctIndex } = mcFromCluster(rng, t.answer, distractors);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the word that shows future time")}\n"${t.before}____${t.after}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "'shall' is usually only used with I and we. 'will' works with every subject. The negative of 'will' is 'won't'.",
        explanation: `"${t.answer}" is correct here — the sentence makes ${USE_LABEL[t.use]}. "${t.before.trim()}" ${t.answer === "shall" ? "starts with I/we, where 'shall' is natural" : t.answer === "won't" ? "is negative, so 'will not' → 'won't'" : "can take 'will' with any subject"}.`,
      };
    }

    if (branch === "fill") {
      const t = randChoice(rng, TPL);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "'will', 'shall' or 'won't'"),
        before: t.before,
        after: t.after,
        correctAnswer: t.answer,
        acceptedAnswers: t.answer === "won't" ? ["won't", "will not"] : [t.answer],
        inputMode: "text",
        hint: `This sentence makes ${USE_LABEL[t.use]}.`,
        explanation: `"${t.answer}" is correct. Full sentence: "${cap((t.before + t.answer + t.after).trim())}"`,
      };
    }

    if (branch === "sort-use") {
      const pool = shuffle(rng, TPL).slice(0, 6);
      const items = pool.map((t, i) => ({ id: `t${i}`, label: (t.before + t.answer + t.after).trim() }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((t, i) => (correctBucket[`t${i}`] = t.use === "prediction" ? "prediction" : t.use === "promise" || t.use === "decision" ? "promise" : t.use === "offer" ? "offer" : "plan"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "what each future sentence is doing"),
        items,
        buckets: [
          { id: "prediction", label: "Predicting what will happen" },
          { id: "promise", label: "Making a promise or decision" },
          { id: "offer", label: "Offering to help" },
          { id: "plan", label: "Stating a future plan" },
        ],
        correctBucket,
        hint: "A prediction guesses the future. A promise says what the speaker will definitely do. An offer helps someone. A plan is arranged for later.",
        explanation: "We use will/shall for the future in several ways: predicting, promising, deciding, offering, and stating plans.",
      };
    }

    if (branch === "match") {
      const rows = [
        { subj: "I", verb: "shall", ex: "I shall email the notes." },
        { subj: "We", verb: "shall", ex: "We shall meet online tomorrow." },
        { subj: "She", verb: "will", ex: "She will upload the video." },
        { subj: "They", verb: "will", ex: "They will join the club next term." },
        { subj: "It", verb: "will", ex: "It will download quickly." },
      ];
      const pool = shuffle(rng, rows).slice(0, 4);
      const tokens = shuffle(rng, pool.map((r) => ({ id: r.subj, label: r.subj })));
      const targets = shuffle(rng, pool.map((r) => ({ id: r.subj, label: `${r.subj} ${r.verb} ...` })));
      const correctMap: Record<string, string> = {};
      pool.forEach((r) => (correctMap[r.subj] = r.subj));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "subject to the future form that goes with it"),
        tokens,
        targets,
        correctMap,
        hint: "'shall' pairs with I and we. 'will' pairs with he, she, it, you and they.",
        explanation: "I/we → shall (or will). He/she/it/you/they → will.",
      };
    }

    if (branch === "order") {
      const t = randChoice(rng, TPL.filter((x) => !x.before.includes("?")));
      const sentence = (t.before + t.answer + t.after).trim().replace(/\.$/, "");
      const words = sentence.split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a correct sentence about the future"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: `The future marker "${t.answer}" comes right after the subject.`,
        explanation: `Correct sentence: "${cap(sentence)}."`,
      };
    }

    // reason — Apply: which sentence correctly states the future plan/promise?
    const scen: { s: string; correct: string; wrong: string[]; why: string }[] = [
      {
        s: `${name(rng)} has decided, right now, to carry the projector to the next classroom.`,
        correct: "I will carry the projector.",
        wrong: ["I carry the projector yesterday.", "I am carry the projector.", "I carried the projector tomorrow."],
        why: "a decision made at the moment of speaking uses 'will'.",
      },
      {
        s: `The whole class has agreed to meet in the computer lab at 9 a.m. tomorrow.`,
        correct: "We shall meet in the lab at nine tomorrow.",
        wrong: ["We meet in the lab at nine yesterday.", "We shall met in the lab at nine tomorrow.", "We are meet in the lab at nine tomorrow."],
        why: "'shall' is used with 'we' for a future plan; the main verb stays in its base form ('meet').",
      },
      {
        s: `${name(rng)} promises never to give her password to a stranger online.`,
        correct: "I shall never share my password with a stranger.",
        wrong: ["I shared never my password with a stranger.", "I shall never shared my password with a stranger.", "I never share my password with a stranger yesterday."],
        why: "a promise about the future uses shall/will + the base verb.",
      },
      {
        s: `The teacher thinks the tablet's battery will not last the whole lesson at full brightness.`,
        correct: "The battery won't last the whole lesson.",
        wrong: ["The battery not last the whole lesson.", "The battery didn't last the whole lesson tomorrow.", "The battery won't lasted the whole lesson."],
        why: "'won't' is the short form of 'will not', used for a negative prediction.",
      },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.correct, sc.wrong);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, "Which sentence is correct?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Future = will/shall + the base form of the verb (no -ed, no -ing).",
      explanation: `"${sc.correct}" is correct — ${sc.why}`,
    };
  },
};
