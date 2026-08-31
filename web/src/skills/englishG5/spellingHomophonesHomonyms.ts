import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 11.0 Sports - Appreciating Talents, sub-strand 11.4 Spelling:
// commonly misspelt words; homophones; homonyms. See curriculum-reference/grade-5/english.json.

// Homophones: same sound, different spelling + meaning.
const HOMOPHONES: { a: string; b: string; sentence: string; answer: string; meaning: string }[] = [
  { a: "their", b: "there", sentence: "The winning team lifted ___ trophy high.", answer: "their", meaning: "belonging to them" },
  { a: "there", b: "their", sentence: "The medals are over ___ on the table.", answer: "there", meaning: "in that place" },
  { a: "they're", b: "their", sentence: "The champions are proud because ___ the fastest runners.", answer: "they're", meaning: "they are" },
  { a: "to", b: "too", sentence: "The crowd cheered when the sprinter ran ___ the finish line.", answer: "to", meaning: "towards" },
  { a: "too", b: "two", sentence: "The gymnast was nervous, but she performed well ___.", answer: "too", meaning: "also / as well" },
  { a: "two", b: "too", sentence: "Only ___ athletes qualified for the final.", answer: "two", meaning: "the number 2" },
  { a: "your", b: "you're", sentence: "Keep ___ eyes on the ball during the match.", answer: "your", meaning: "belonging to you" },
  { a: "you're", b: "your", sentence: "The coach said, \"___ improving every week.\"", answer: "you're", meaning: "you are" },
  { a: "won", b: "one", sentence: "Our school ___ the county tournament.", answer: "won", meaning: "past tense of win" },
  { a: "one", b: "won", sentence: "She scored the ___ goal that mattered.", answer: "one", meaning: "the number 1" },
  { a: "hear", b: "here", sentence: "We could ___ the fans singing from the pitch.", answer: "hear", meaning: "listen with your ears" },
  { a: "here", b: "hear", sentence: "The adjudicators sit ___, near the front.", answer: "here", meaning: "in this place" },
  { a: "week", b: "weak", sentence: "The tournament lasts a whole ___.", answer: "week", meaning: "seven days" },
  { a: "weak", b: "week", sentence: "His injured ankle still felt ___.", answer: "weak", meaning: "not strong" },
  { a: "piece", b: "peace", sentence: "Each medallist received a ___ of ribbon.", answer: "piece", meaning: "a part of something" },
];

// Homonyms: same spelling + sound, two meanings.
const HOMONYMS: { word: string; m1: string; m2: string }[] = [
  { word: "bat", m1: "a flying animal", m2: "a wooden stick for hitting a ball" },
  { word: "match", m1: "a sports game between two sides", m2: "a small stick for making fire" },
  { word: "pitch", m1: "the field a game is played on", m2: "how high or low a sound is" },
  { word: "left", m1: "the opposite of right", m2: "went away (past of leave)" },
  { word: "fair", m1: "following the rules; just", m2: "a fun event with rides and stalls" },
  { word: "spring", m1: "the season after winter", m2: "a coiled piece of metal" },
  { word: "well", m1: "a deep hole for water", m2: "in a good way; healthy" },
  { word: "bark", m1: "the sound a dog makes", m2: "the outer covering of a tree" },
  { word: "court", m1: "the marked area for tennis or basketball", m2: "the place where a judge works" },
  { word: "coach", m1: "a person who trains a team", m2: "a large bus" },
];

// Commonly misspelt words: correct spelling + a plausible wrong spelling.
const MISSPELT: { correct: string; wrong: string }[] = [
  { correct: "because", wrong: "becuase" },
  { correct: "friend", wrong: "freind" },
  { correct: "beautiful", wrong: "beutiful" },
  { correct: "necessary", wrong: "neccessary" },
  { correct: "separate", wrong: "seperate" },
  { correct: "February", wrong: "Febuary" },
  { correct: "Wednesday", wrong: "Wensday" },
  { correct: "receive", wrong: "recieve" },
  { correct: "believe", wrong: "beleive" },
  { correct: "definitely", wrong: "definately" },
  { correct: "tomorrow", wrong: "tommorow" },
  { correct: "exercise", wrong: "excercise" },
  { correct: "weird", wrong: "wierd" },
  { correct: "until", wrong: "untill" },
];

export const spellingHomophonesHomonyms: Skill = {
  id: "g5-eng-writing-spelling-homophones-homonyms",
  code: "W.11",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Spelling: Homophones, Homonyms and Commonly Misspelt Words",
  description: "Choose the right homophone for the meaning, know two meanings of a homonym, and spell tricky words correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-homophone", "fill-homophone", "sort-spelling", "match-homonym", "order-homonym", "reason-misspelt"] as const);

    if (branch === "mc-homophone") {
      const h = randChoice(rng, HOMOPHONES);
      const { choices, correctIndex } = mcFromCluster(rng, h.answer, [h.b, h.a === h.answer ? h.b : h.a].filter((x) => x !== h.answer), 2);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the correctly spelt word for this meaning")}\n"${h.sentence}"`,
        choices: choices.length >= 2 ? choices : [h.answer, h.b],
        correctIndex: choices.length >= 2 ? correctIndex : 0,
        layout: "row",
        hint: `Here the word means "${h.meaning}".`,
        explanation: `"${h.answer}" is correct — it means "${h.meaning}". The other spelling sounds the same but has a different meaning, which is why it is a homophone.`,
      };
    }

    if (branch === "fill-homophone") {
      const h = randChoice(rng, HOMOPHONES);
      const [before, after] = h.sentence.split("___");
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `the homophone meaning "${h.meaning}"`),
        before,
        after,
        correctAnswer: h.answer,
        acceptedAnswers: [h.answer],
        inputMode: "text",
        hint: "Say the word aloud, then think which spelling matches the meaning in this sentence.",
        explanation: `"${h.answer}" (${h.meaning}) is correct. Full sentence: "${h.sentence.replace("___", h.answer)}"`,
      };
    }

    if (branch === "sort-spelling") {
      const pool = shuffle(rng, MISSPELT).slice(0, 8);
      const items = shuffle(rng, pool.flatMap((m, i) => [
        { id: `c${i}`, label: m.correct, kind: "correct" },
        { id: `w${i}`, label: m.wrong, kind: "wrong" },
      ])).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each word is spelt correctly or not"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "correct", label: "Spelt correctly" },
          { id: "wrong", label: "Spelt wrongly" },
        ],
        correctBucket,
        hint: "Watch for the order of vowels (ie / ei), doubled letters, and silent letters.",
        explanation: "Correct: because, friend, beautiful, necessary, separate, February, Wednesday, receive, believe, definitely, tomorrow, exercise, weird, until.",
      };
    }

    if (branch === "match-homonym") {
      const pool = shuffle(rng, HOMONYMS).slice(0, 5);
      const useM2 = rng() < 0.5;
      const tokens = shuffle(rng, pool.map((h) => ({ id: h.word, label: h.word })));
      const targets = shuffle(rng, pool.map((h) => ({ id: h.word, label: useM2 ? h.m2 : h.m1 })));
      const correctMap: Record<string, string> = {};
      pool.forEach((h) => (correctMap[h.word] = h.word));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "homonym to one of its meanings"),
        tokens,
        targets,
        correctMap,
        hint: "Each of these words is spelt one way but has two different meanings.",
        explanation: pool.map((h) => `"${h.word}" = ${h.m1} OR ${h.m2}`).join("  "),
      };
    }

    if (branch === "order-homonym") {
      const h = randChoice(rng, HOMONYMS);
      const sentence = `The word ${h.word} can mean ${h.m1} or ${h.m2}`;
      const words = sentence.split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a sentence about this homonym"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: `"${h.word}" has two meanings.`,
        explanation: `"${sentence}."`,
      };
    }

    // reason — Evaluate: which spelling is correct in the sentence?
    const m = randChoice(rng, MISSPELT);
    const context = `Our team trains hard ___ we want to win the trophy.`;
    const useBecause = m.correct === "because";
    const sentence = useBecause ? context : `The coach said we will ___ celebrate after the match.`;
    const filler = useBecause ? m : { correct: "definitely", wrong: "definately" };
    const { choices, correctIndex } = mcFromCluster(rng, filler.correct, [filler.wrong], 1);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, `A pupil is writing about the tournament. One sentence reads: "${sentence.replace("___", "______")}"`, "Which spelling is correct?"),
      choices: choices.length >= 2 ? choices : [filler.correct, filler.wrong],
      correctIndex: choices.length >= 2 ? correctIndex : 0,
      layout: "row",
      hint: "Sound the word out in parts, and remember any tricky letters.",
      explanation: `"${filler.correct}" is the correct spelling. A common error is "${filler.wrong}".`,
    };
  },
};
