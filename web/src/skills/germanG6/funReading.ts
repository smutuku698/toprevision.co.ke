import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { SPORT_VOCAB, name, umlautAccepted } from "./shared";

// Reading strand, Theme 5: Fun and Enjoyment (Fun and Games) — reading aloud short passages about
// likes/dislikes with "gern"/"nicht gern", drawn from SPORT_VOCAB.

function twoNames(rng: RNG): [string, string] {
  const a = name(rng);
  let b = name(rng);
  while (b === a) b = name(rng);
  return [a, b];
}

const DIALOGUE_SKELETONS: ((a: string, b: string, like: { word: string; meaning: string }, dislike: { word: string; meaning: string }) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (a, b, like, dislike) => ({
    lines: [`${a}: Was machst du gern in deiner Freizeit?`, `${b}: Ich ${like.word} gern.`, `${a}: Magst du auch ${dislike.word}?`, `${b}: Nein, ich ${dislike.word} nicht gern.`, `${a}: Ich verstehe. Ich mag ${like.word} auch!`, `${b}: Super, wir können zusammen spielen!`],
    qa: [
      { q: `What does ${b} like doing, according to the passage?`, correct: `${like.word} (${like.meaning})`, distractors: [`${dislike.word} (${dislike.meaning})`, "lesen (to read)", "The passage does not say"], explanation: `${b} says "Ich ${like.word} gern."` },
      { q: `What does ${b} say they do NOT like doing?`, correct: `${dislike.word} (${dislike.meaning})`, distractors: [`${like.word} (${like.meaning})`, "tanzen (to dance)", "The passage does not say"], explanation: `${b} says "ich ${dislike.word} nicht gern."` },
      { q: "What do the two speakers decide to do together?", correct: `Play/do ${like.word} together`, distractors: ["Go home separately", "Do their homework", "The passage does not say"], explanation: `${b} says "wir können zusammen spielen!"` },
    ],
  }),
  (a, b, like, dislike) => ({
    lines: [`${a}: Spielst du gern ${like.word}?`, `${b}: Ja, ich spiele sehr gern ${like.word}!`, `${a}: Und ${dislike.word}?`, `${b}: Nein, ${dislike.word} mag ich nicht so gern.`, `${a}: Warum nicht?`, `${b}: Es ist einfach nicht mein Hobby.`],
    qa: [
      { q: `What does ${a} first ask ${b} about?`, correct: `Whether ${b} likes ${like.word}`, distractors: [`Whether ${b} likes ${dislike.word}`, "Whether they are hungry", "The passage does not say"], explanation: `${a} asks "Spielst du gern ${like.word}?"` },
      { q: `How does ${b} feel about ${dislike.word}?`, correct: "Does not like it very much", distractors: ["Likes it very much", "Has never tried it", "The passage does not say"], explanation: `${b} says "${dislike.word} mag ich nicht so gern."` },
      { q: `Why doesn't ${b} like ${dislike.word}?`, correct: "It is simply not their hobby", distractors: ["It is too difficult", "There is no time", "The passage does not say"], explanation: `${b} says "Es ist einfach nicht mein Hobby."` },
    ],
  }),
  (a, b, like, dislike) => ({
    lines: [`${a}: Was ist dein Lieblingshobby?`, `${b}: Mein Lieblingshobby ist ${like.word}.`, `${a}: Ich mag das auch! Und ${dislike.word}?`, `${b}: ${dislike.word} finde ich langweilig.`, `${a}: Wirklich? Ich finde es interessant.`, `${b}: Jeder hat andere Interessen!`],
    qa: [
      { q: `What is ${b}'s favourite hobby, according to the passage?`, correct: like.word, distractors: [dislike.word, "schwimmen", "The passage does not say"], explanation: `${b} says "Mein Lieblingshobby ist ${like.word}."` },
      { q: `What does ${b} think of ${dislike.word}?`, correct: "Boring (langweilig)", distractors: ["Exciting (spannend)", "Easy (einfach)", "The passage does not say"], explanation: `${b} says "${dislike.word} finde ich langweilig."` },
      { q: "What does the passage conclude about hobbies?", correct: "Everyone has different interests", distractors: ["Everyone likes the same things", "Hobbies are not important", "The passage does not conclude anything"], explanation: `${b} says "Jeder hat andere Interessen!"` },
    ],
  }),
  (a, b, like, dislike) => ({
    lines: [`${a}: Wir haben heute Nachmittag frei. Was machen wir?`, `${b}: Lass uns ${like.word}!`, `${a}: Gute Idee, das mache ich auch gern.`, `${b}: Sollen wir auch ${dislike.word}?`, `${a}: Nein, das mache ich nicht gern.`, `${b}: Kein Problem, dann nur ${like.word}.`],
    qa: [
      { q: `What does ${b} suggest doing first?`, correct: like.word, distractors: [dislike.word, "schlafen", "The passage does not say"], explanation: `${b} says "Lass uns ${like.word}!"` },
      { q: `How does ${a} feel about ${dislike.word}?`, correct: "Does not like doing it", distractors: ["Loves doing it", "Has never heard of it", "The passage does not say"], explanation: `${a} says "das mache ich nicht gern."` },
      { q: "What do they finally agree to do?", correct: `Only ${like.word}`, distractors: [`Only ${dislike.word}`, "Both activities", "Neither activity"], explanation: `${b} says "dann nur ${like.word}."` },
    ],
  }),
  (a, b, like, dislike) => ({
    lines: [`${a}: Ich ${like.word} jeden Tag nach der Schule.`, `${b}: Wow! Ich ${dislike.word} nicht so oft.`, `${a}: Warum nicht?`, `${b}: Ich habe nicht genug Zeit.`, `${a}: Das verstehe ich. Vielleicht am Wochenende?`, `${b}: Ja, das ist eine gute Idee!`],
    qa: [
      { q: `How often does ${a} do ${like.word}, according to the passage?`, correct: "Every day after school", distractors: ["Only on weekends", "Once a month", "The passage does not say"], explanation: `${a} says "Ich ${like.word} jeden Tag nach der Schule."` },
      { q: `Why doesn't ${b} do ${dislike.word} often?`, correct: "Not enough time", distractors: ["Doesn't enjoy it", "No equipment", "The passage does not say"], explanation: `${b} says "Ich habe nicht genug Zeit."` },
      { q: "What do they agree to try?", correct: "Doing it on the weekend", distractors: ["Doing it every day", "Never doing it again", "The passage does not say"], explanation: `${a} suggests "Vielleicht am Wochenende?" and ${b} agrees.` },
    ],
  }),
];

const MATCH_POOL = SPORT_VOCAB;

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "In a reading text, 'to play football' is written as ", after: ".", correct: "Fußball spielen" },
  { before: "'To swim' appears in reading texts as ", after: ".", correct: "schwimmen" },
  { before: "The word for 'to read' when reading aloud is ", after: ".", correct: "lesen" },
  { before: "'To run' reads as ", after: " in a fun-and-games passage.", correct: "laufen" },
  { before: "'To dance' is written as ", after: " in the passage.", correct: "tanzen" },
  { before: "'To sing' reads as ", after: " in a hobbies text.", correct: "singen" },
  { before: "The reading word for 'to paint' is ", after: ".", correct: "malen" },
  { before: "'To cycle' appears as ", after: " in the passage.", correct: "Rad fahren" },
  { before: "'To play basketball' reads as ", after: " in a fun-and-games passage.", correct: "Basketball spielen" },
  { before: "'To play chess' is written as ", after: " in the reading text.", correct: "Schach spielen" },
  { before: "'To climb' reads as ", after: " in the passage.", correct: "klettern" },
  { before: "'To listen to music' appears as ", after: " in a hobbies text.", correct: "Musik hören" },
];

const MATCH_OPENERS = [
  "Match each activity from the passage to its meaning.",
  "Which meaning goes with which German activity word?",
  "Pair each hobby word with its correct English meaning.",
  "Match the German activity to what it means.",
  "Connect each fun-and-games word to its meaning.",
];
const MATCH_CLOSERS = [
  "",
  " Use the passage above as your guide.",
  " Think about which activity each word names.",
  " Reread the passage carefully before you answer.",
];

const FILL_OPENERS = [
  "Fill in the missing activity word.",
  "Complete the sentence with the correct German word.",
  "What word completes this sentence about hobbies?",
  "Fill the gap correctly.",
  "Complete this reading fact about fun and games.",
];
const FILL_CLOSERS = [
  "",
  " Read it aloud once you finish.",
  " Think about the hobbies passage above.",
  " Check your spelling carefully.",
];

const ORDER_OPENERS = [
  "Put these lines from the passage in the order they were read.",
  "Arrange the passage's lines in the correct reading order.",
  "Sequence this conversation about hobbies correctly.",
  "Order the lines as they appear in the passage.",
  "Which order makes this reading passage make sense?",
];
const ORDER_CLOSERS = [
  "",
  " Read each line carefully first.",
  " Think about how the conversation naturally flows.",
  " Likes are usually mentioned before dislikes.",
];

const CATEGORIZE_OPENERS = [
  "As you read, sort each activity: Sport/physical, or Quiet/creative?",
  "Group these activity words by what kind of hobby they are.",
  "Sort each word into the category it belongs to.",
  "Classify each activity word from the reading text.",
  "Which category best fits each hobby word?",
];
const CATEGORIZE_CLOSERS = [
  "",
  " Think about whether the activity is physical or calm.",
  " Reread the passage above if you need a reminder.",
  " Sports involve movement; creative hobbies are quieter.",
];

export const funReading: Skill = {
  id: "g6-de-r-fun",
  code: "R.5",
  subjectId: "german",
  strandId: "g6-de-reading",
  grade: 6,
  title: "Reading aloud: fun and enjoyment",
  description: "Read short German passages about likes and dislikes in games and hobbies aloud, recognise activity vocabulary, and answer comprehension questions about the passage.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const [a, b] = twoNames(rng);
    const like = randChoice(rng, SPORT_VOCAB);
    let dislike = randChoice(rng, SPORT_VOCAB);
    while (dislike.word === like.word) dislike = randChoice(rng, SPORT_VOCAB);
    const skeleton = randChoice(rng, DIALOGUE_SKELETONS)(a, b, like, dislike);
    const passage = skeleton.lines.join("\n");

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_POOL).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;
      return {
        kind: "click-match",
        passage,
        prompt: `${randChoice(rng, MATCH_OPENERS)}${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "Reread the passage above — each word appears in context there.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        passage,
        prompt: `${randChoice(rng, FILL_OPENERS)}${randChoice(rng, FILL_CLOSERS)}`,
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: umlautAccepted(f.correct),
        inputMode: "text",
        hint: "Use the passage above as a reminder of how each word is used.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "ordering") {
      const withIds = skeleton.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, ORDER_OPENERS)}${randChoice(rng, ORDER_CLOSERS)}`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "The passage moves from one comment about hobbies to the next.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SPORT_VOCAB).slice(0, 6);
      const quietWords = ["lesen", "tanzen", "singen", "malen", "Musik hören", "spazieren gehen", "Karten spielen", "Schach spielen"];
      const bucketOf = (w: string) => (quietWords.includes(w) ? "Quiet/creative activity" : "Sport/physical activity");
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)}${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Sport/physical activity", label: "Sport/physical activity" },
          { id: "Quiet/creative activity", label: "Quiet/creative activity" },
        ],
        correctBucket,
        hint: "Sports involve running, jumping, or playing a physical game; quiet/creative activities do not.",
        explanation: chosen.map((c) => `"${c.word}" is a ${bucketOf(c.word).toLowerCase()}.`).join(" "),
      };
    }

    const qa = randChoice(rng, skeleton.qa);
    const choices = shuffle(rng, Array.from(new Set([qa.correct, ...qa.distractors])));
    return {
      kind: "multiple-choice",
      passage,
      prompt: qa.q,
      choices,
      correctIndex: choices.indexOf(qa.correct),
      layout: "list",
      hint: "Reread the passage above carefully before answering.",
      explanation: qa.explanation,
    };
  },
};
