import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster, cap } from "./g5EngShared";

// KICD Grade 5 English, Theme 11.0 Sports - Appreciating Talents, sub-strand 11.3 Use of Interrogatives —
// who / what / when / where / why / how, and the extended patterns "how much more ...?",
// "who/what/when/why/where else ...?". See curriculum-reference/grade-5/english.json.

type Asks = "person" | "thing" | "time" | "place" | "reason" | "manner";
const WH: Record<string, Asks> = { who: "person", what: "thing", when: "time", where: "place", why: "reason", how: "manner" };
const ASKS_LABEL: Record<Asks, string> = { person: "a person", thing: "a thing or action", time: "a time", place: "a place", reason: "a reason", manner: "the way something is done" };

const TPL: { before: string; after: string; answer: string; asks: Asks }[] = [
  { before: "", after: " scored the winning goal for our school?", answer: "Who", asks: "person" },
  { before: "", after: " sport do you enjoy watching most?", answer: "What", asks: "thing" },
  { before: "", after: " does the athletics meeting start on Saturday?", answer: "When", asks: "time" },
  { before: "", after: " is the talent show being held this year?", answer: "Where", asks: "place" },
  { before: "", after: " did the coach change the team line-up?", answer: "Why", asks: "reason" },
  { before: "", after: " did the swimmer improve her time so quickly?", answer: "How", asks: "manner" },
  { before: "", after: " received the fair-play award at the ceremony?", answer: "Who", asks: "person" },
  { before: "", after: " event comes after the long jump?", answer: "What", asks: "thing" },
  { before: "", after: " will the medals be presented?", answer: "When", asks: "time" },
  { before: "", after: " are the visiting teams sitting?", answer: "Where", asks: "place" },
  { before: "", after: " was the match postponed to next week?", answer: "Why", asks: "reason" },
  { before: "", after: " does a referee signal a foul?", answer: "How", asks: "manner" },
];

const EXTENDED: { q: string; note: string }[] = [
  { q: "How much more training does the team need before the final?", note: "'how much more' asks about an extra amount" },
  { q: "How many more points do we need to win?", note: "'how many more' asks about an extra number" },
  { q: "Who else attended the talent show?", note: "'who else' asks about other people" },
  { q: "What else did the adjudicator say?", note: "'what else' asks about other things" },
  { q: "Where else can we practise if the field is wet?", note: "'where else' asks about other places" },
  { q: "Why else might the champion have missed the race?", note: "'why else' asks about other reasons" },
  { q: "When else does the club meet during the week?", note: "'when else' asks about other times" },
];

export const interrogatives: Skill = {
  id: "g5-eng-grammar-interrogatives",
  code: "LU.11",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Interrogatives (who, what, when, where, why, how; ...else; how much more)",
  description: "Use question words (who, what, when, where, why, how) and the extended patterns 'how much/many more ...?' and 'who/what/when/where/why else ...?'.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "sort-asks", "match", "order-extended", "reason"] as const);

    if (branch === "mc") {
      const t = randChoice(rng, TPL);
      const wrong = shuffle(rng, Object.keys(WH).filter((w) => w.toLowerCase() !== t.answer.toLowerCase()).map((w) => cap(w))).slice(0, 3);
      const { choices, correctIndex } = mcFromCluster(rng, t.answer, wrong);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the question word that fits")}\n"${t.before}____${t.after}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: `The answer to this question will be ${ASKS_LABEL[t.asks]}.`,
        explanation: `"${t.answer}" is correct — it asks for ${ASKS_LABEL[t.asks]}. Each question word points to a different kind of answer, so swapping one for another changes what is being asked.`,
      };
    }

    if (branch === "fill") {
      const t = randChoice(rng, TPL);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the question word (who, what, when, where, why or how)"),
        before: t.before,
        after: t.after,
        correctAnswer: t.answer,
        acceptedAnswers: [t.answer, t.answer.toLowerCase()],
        inputMode: "text",
        hint: `The answer would name ${ASKS_LABEL[t.asks]}.`,
        explanation: `"${t.answer}" is correct. Full question: "${(t.answer + t.after).trim()}"`,
      };
    }

    if (branch === "sort-asks") {
      const words = shuffle(rng, Object.keys(WH)).slice(0, 6);
      const items = words.map((w, i) => ({ id: `w${i}`, label: cap(w) }));
      const correctBucket: Record<string, string> = {};
      words.forEach((w, i) => (correctBucket[`w${i}`] = WH[w]));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "what kind of answer each question word asks for"),
        items,
        buckets: [
          { id: "person", label: "A person" },
          { id: "thing", label: "A thing / an action" },
          { id: "time", label: "A time" },
          { id: "place", label: "A place" },
          { id: "reason", label: "A reason" },
          { id: "manner", label: "The way (how)" },
        ],
        correctBucket,
        hint: "who = person, what = thing, when = time, where = place, why = reason, how = way.",
        explanation: "Who asks for a person, what for a thing or action, when for a time, where for a place, why for a reason, and how for the manner.",
      };
    }

    if (branch === "match") {
      const seenWh = new Set<string>();
      const pool = shuffle(rng, TPL).filter((t) => (seenWh.has(t.answer) ? false : (seenWh.add(t.answer), true))).slice(0, 5);
      const tokens = shuffle(rng, pool.map((t, i) => ({ id: `p${i}`, label: `___ ${t.after.trim()}` })));
      const targets = shuffle(rng, pool.map((t, i) => ({ id: `p${i}`, label: t.answer })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_t, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "question to its question word"),
        tokens,
        targets,
        correctMap,
        hint: "Imagine the answer to each question — is it a person, a place, a time, a reason...?",
        explanation: pool.map((t) => `"${(t.answer + t.after).trim()}"`).join("  "),
      };
    }

    if (branch === "order-extended") {
      const e = randChoice(rng, EXTENDED);
      const words = e.q.replace(/\?$/, "").split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a correct question"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: e.note,
        explanation: `Correct question: "${e.q}"`,
      };
    }

    // reason — Apply: which question would get exactly this piece of information?
    const scen: { info: string; correct: string; wrong: string[] }[] = [
      { info: "You want to know the name of the pupil who won the discus.", correct: "Who won the discus?", wrong: ["When was the discus?", "Why won the discus?", "Where won the discus?"] },
      { info: "You want to know the reason the coach dropped a player.", correct: "Why did the coach drop the player?", wrong: ["Who did the coach drop the player?", "When did the coach drop the player?", "What did the coach drop the player?"] },
      { info: "You want to know the day and time the finals begin.", correct: "When do the finals begin?", wrong: ["Where do the finals begin?", "Who do the finals begin?", "Why do the finals begin?"] },
      { info: "You want to know if anyone besides the head teacher spoke at the ceremony.", correct: "Who else spoke at the ceremony?", wrong: ["Who spoke at the ceremony first?", "What else spoke at the ceremony?", "Why else spoke at the ceremony?"] },
      { info: "You want to know how much extra practice is still needed before the final.", correct: "How much more practice do we need?", wrong: ["How many more practice do we need?", "How much practice more do we need?", "How more much practice do we need?"] },
      { info: "You want to know the method the swimmer used to get faster.", correct: "How did the swimmer get faster?", wrong: ["What did the swimmer get faster?", "When did the swimmer get faster?", "Who did the swimmer get faster?"] },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.correct, sc.wrong);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.info, "Which question would you ask?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Match the question word to the kind of answer you are looking for.",
      explanation: `"${sc.correct}" is the right question for that information.`,
    };
  },
};
