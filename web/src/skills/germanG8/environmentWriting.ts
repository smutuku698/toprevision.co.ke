import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const FORECAST_DAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
const CONDITION_WORDS = { sunny: "sonnig", cloudy: "bewölkt", rainy: "regnerisch", stormy: "stürmisch" } as const;
const CONDITION_KEYS = Object.keys(CONDITION_WORDS) as (keyof typeof CONDITION_WORDS)[];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Die Sonne ", after: ".", answer: "scheint" },
  { before: "Es ", after: ".", answer: "regnet" },
  { before: "Es ist ", after: ".", answer: "windig" },
  { before: "Der Berg ist ", after: ".", answer: "hoch" },
  { before: "Der Wald ist ", after: ".", answer: "grün" },
  { before: "Wenn es regnet, ", after: " ich zu Hause.", answer: "bleibe" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Die Sonne", "scheint", "heute", "."], sentence: "Die Sonne scheint heute." },
  { chunks: ["Wenn es regnet,", "bleibe ich", "zu Hause", "."], sentence: "Wenn es regnet, bleibe ich zu Hause." },
  { chunks: ["Wenn die Sonne scheint,", "gehe ich", "schwimmen", "."], sentence: "Wenn die Sonne scheint, gehe ich schwimmen." },
  { chunks: ["Der Berg ist hoch", "und", "der Wald ist grün", "."], sentence: "Der Berg ist hoch und der Wald ist grün." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct verb form to complete: 'Wenn es regnet, ___ ich zu Hause.' (stay)",
    correct: "bleibe",
    distractors: ["bleiben", "bleibt", "bleibst"],
    explanation: "After a 'wenn'-clause, the main clause inverts to verb-subject order, and 'ich' takes the ending '-e': '..., bleibe ich ...'.",
  },
  {
    prompt: "Choose the correctly spelled weather word meaning 'windy'.",
    correct: "windig",
    distractors: ["windich", "windik", "windisch"],
    explanation: "The correct spelling is 'windig', using the regular German adjective ending '-ig'.",
  },
  {
    prompt: "Which sentence correctly describes a green forest?",
    correct: "Der Wald ist grün.",
    distractors: ["Der Wald ist grüne.", "Die Wald ist grün.", "Der Wald sind grün."],
    explanation: "'Der Wald' is masculine singular, so the verb is 'ist' (not 'sind') and the predicate adjective 'grün' takes no ending.",
  },
  {
    prompt: "Choose the correct conditional sentence for 'When the sun shines, I go swimming.'",
    correct: "Wenn die Sonne scheint, gehe ich schwimmen.",
    distractors: ["Wenn die Sonne scheint, ich gehe schwimmen.", "Die Sonne scheint, wenn ich gehe schwimmen.", "Wenn die Sonne scheint, gehen ich schwimmen."],
    explanation: "The 'wenn'-clause comes first, followed by verb-subject order in the main clause: 'Wenn die Sonne scheint, gehe ich ...'.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "Die Sonne scheint.", meaning: "The sun is shining." },
  { term: "Es regnet.", meaning: "It is raining." },
  { term: "Es ist windig.", meaning: "It is windy." },
  { term: "Es ist heiß.", meaning: "It is hot." },
  { term: "Es ist kalt.", meaning: "It is cold." },
  { term: "der Fluss", meaning: "river" },
  { term: "der See", meaning: "lake" },
  { term: "das Meer", meaning: "sea" },
  { term: "das Tal", meaning: "valley" },
  { term: "die Wüste", meaning: "desert" },
];

export const environmentWriting: Skill = {
  id: "g8-de-w-environment",
  code: "W.8",
  subjectId: "german",
  strandId: "g8-de-writing",
  grade: 8,
  title: "Writing about weather and the environment",
  description: "Write German sentences describing weather, physical features, and weather-conditioned activities.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match", "weather"] as const);

    if (branch === "weather") {
      const dayIdx = randInt(rng, 0, 4);
      const days = FORECAST_DAYS.map((label) => ({ label, condition: randChoice(rng, CONDITION_KEYS) }));
      const day = FORECAST_DAYS[dayIdx];
      const answer = CONDITION_WORDS[days[dayIdx].condition];

      return {
        kind: "fill-blank",
        prompt: "Look at the forecast and complete the German sentence for the day shown.",
        visual: { type: "weather", days },
        before: `Am ${day} ist es `,
        after: ".",
        correctAnswer: answer,
        acceptedAnswers: umlautAccepted(answer),
        inputMode: "text",
        hint: "Match the icon for that day to sonnig (sunny), bewölkt (cloudy), regnerisch (rainy), or stürmisch (stormy).",
        explanation: `On ${day} the forecast icon shows "${answer}" weather.`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence about weather or the environment.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "A 'wenn'-clause comes first, then the main clause inverts to verb-subject order.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "choice") {
      const q = randChoice(rng, MC_ITEMS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);

      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Watch subject-verb agreement and word order after 'wenn'.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each German weather or environment expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'der See' and 'das Meer' are both bodies of water, but only one is a lake.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the German sentence about weather or the environment.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Picture the weather or landscape being described.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
