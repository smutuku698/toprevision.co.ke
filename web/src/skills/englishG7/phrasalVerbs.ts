import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASAL_VERBS: { phrase: string; family: "put" | "come" | "give"; meaning: string }[] = [
  { phrase: "put on", family: "put", meaning: "to wear something" },
  { phrase: "put off", family: "put", meaning: "to postpone something to a later time" },
  { phrase: "put away", family: "put", meaning: "to store something in its proper place" },
  { phrase: "put up", family: "put", meaning: "to display or set something up for people to see" },
  { phrase: "come across", family: "come", meaning: "to find something by chance" },
  { phrase: "come up with", family: "come", meaning: "to think of a new idea or plan" },
  { phrase: "come back", family: "come", meaning: "to return to a place" },
  { phrase: "give up", family: "give", meaning: "to stop trying or to quit" },
  { phrase: "give in", family: "give", meaning: "to stop resisting and yield to pressure" },
  { phrase: "give away", family: "give", meaning: "to give something as a gift" },
  { phrase: "give out", family: "give", meaning: "to distribute something to many people" },
] as const;

const MEANING_MC: { sentence: string; phrase: string; correct: string; distractors: string[] }[] = [
  { sentence: "Every Mashujaa Day, Chebet loves to put on her colourful kitenge dress.", phrase: "put on", correct: "to wear something", distractors: ["to postpone something to a later time", "to store something in its proper place", "to display or set something up for people to see"] },
  { sentence: "The tailor had to put off the fitting of the wedding kanga because the beads had not arrived.", phrase: "put off", correct: "to postpone something to a later time", distractors: ["to wear something", "to store something in its proper place", "to display or set something up for people to see"] },
  { sentence: "After the cultural show, the dancers carefully put away their beaded headdresses.", phrase: "put away", correct: "to store something in its proper place", distractors: ["to wear something", "to postpone something to a later time", "to display or set something up for people to see"] },
  { sentence: "The traders put up a colourful display of Maasai shukas at the Nairobi trade fair.", phrase: "put up", correct: "to display or set something up for people to see", distractors: ["to wear something", "to postpone something to a later time", "to store something in its proper place"] },
  { sentence: "While clearing her grandmother's trunk, Amina came across an old hand-woven kiondo.", phrase: "come across", correct: "to find something by chance", distractors: ["to think of a new idea or plan", "to return to a place", "to postpone something to a later time"] },
  { sentence: "The design students came up with a new pattern that blended kitenge and denim.", phrase: "come up with", correct: "to think of a new idea or plan", distractors: ["to find something by chance", "to return to a place", "to store something in its proper place"] },
  { sentence: "The travelling cloth trader promised to come back to the village with more kanga fabric.", phrase: "come back", correct: "to return to a place", distractors: ["to find something by chance", "to think of a new idea or plan", "to give something as a gift"] },
  { sentence: "Facing criticism over the price, the designer refused to give up on her traditional-inspired collection.", phrase: "give up", correct: "to stop trying or to quit", distractors: ["to stop resisting and yield to pressure", "to give something as a gift", "to distribute something to many people"] },
  { sentence: "After much bargaining, the shopkeeper finally gave in and lowered the price of the beaded sandals.", phrase: "give in", correct: "to stop resisting and yield to pressure", distractors: ["to stop trying or to quit", "to give something as a gift", "to distribute something to many people"] },
  { sentence: "The elder decided to give away his ceremonial cloak to his grandson as a treasured gift.", phrase: "give away", correct: "to give something as a gift", distractors: ["to stop trying or to quit", "to stop resisting and yield to pressure", "to distribute something to many people"] },
  { sentence: "Volunteers gave out free traditional headscarves to every visitor at the cultural festival.", phrase: "give out", correct: "to distribute something to many people", distractors: ["to stop trying or to quit", "to give something as a gift", "to stop resisting and yield to pressure"] },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; clue: string }[] = [
  { before: "Before the fashion show began, models had to ", after: " their ceremonial beads carefully.", correctAnswer: "put on", clue: "Fill in the phrasal verb formed from 'put' that means 'to wear'." },
  { before: "Because the beads had not arrived, the tailor had to ", after: " the fitting session until Friday.", correctAnswer: "put off", clue: "Fill in the phrasal verb formed from 'put' that means 'to postpone'." },
  { before: "After the parade, the dancers ", after: " their feathered headdresses in a safe box.", correctAnswer: "put away", clue: "Fill in the phrasal verb formed from 'put' that means 'to store in its proper place'." },
  { before: "The weavers ", after: " a stall of hand-dyed kangas at the market gate.", correctAnswer: "put up", clue: "Fill in the phrasal verb formed from 'put' that means 'to display'." },
  { before: "While sorting old boxes, Mzee Otieno ", after: " a photograph of his father in traditional dress.", correctAnswer: "came across", clue: "Fill in the past-tense phrasal verb formed from 'come' that means 'to find by chance'." },
  { before: "The students ", after: " a new way to dye kitenge fabric using local plants.", correctAnswer: "came up with", clue: "Fill in the past-tense phrasal verb formed from 'come' that means 'to think of a new idea'." },
  { before: "The travelling trader promised he would ", after: " next season with fresh Maasai beadwork.", correctAnswer: "come back", clue: "Fill in the phrasal verb formed from 'come' that means 'to return'." },
  { before: "Despite the challenges, the designer refused to ", after: " on her dream of reviving traditional wear.", correctAnswer: "give up", clue: "Fill in the phrasal verb formed from 'give' that means 'to stop trying'." },
  { before: "After hours of bargaining, the seller finally ", after: " and reduced the price of the sandals.", correctAnswer: "gave in", clue: "Fill in the past-tense phrasal verb formed from 'give' that means 'to yield to pressure'." },
  { before: "The elder chose to ", after: " his ceremonial spear to his eldest grandson.", correctAnswer: "give away", clue: "Fill in the phrasal verb formed from 'give' that means 'to give as a gift'." },
  { before: "Volunteers ", after: " free traditional scarves to every visitor at the gate.", correctAnswer: "gave out", clue: "Fill in the past-tense phrasal verb formed from 'give' that means 'to distribute'." },
];

const FAMILY_LABEL: Record<string, string> = {
  put: "Formed from PUT",
  come: "Formed from COME",
  give: "Formed from GIVE",
};

export const phrasalVerbs: Skill = {
  id: "g7-eng-g-phrasal-verbs",
  code: "G.12",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Phrasal Verbs: Put, Come, Give",
  description: "Identify phrasal verbs formed from put, come and give and use them correctly in sentences about traditional fashion.",
  generate(rng) {
    const branch = randChoice(rng, ["meaning-mc", "fill", "match", "categorize"] as const);

    if (branch === "meaning-mc") {
      const entry = randChoice(rng, MEANING_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `What does the phrasal verb "${entry.phrase}" mean in this sentence? "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Read the whole sentence for context — the same base verb (put/come/give) changes meaning completely depending on the particle that follows it.",
        explanation: `"${entry.phrase}" means "${entry.correct}" here: "${entry.sentence}" Do not confuse it with the other phrases formed from the same base verb, which carry different meanings.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: entry.clue,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Think about which particle (on, off, away, up, across, up with, back, up, in, away, out) gives the exact meaning described in the clue.",
        explanation: `"${entry.correctAnswer}" fits here: "${entry.before}${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, PHRASAL_VERBS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p, i) => ({ id: `p${i}`, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `p${i}`, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: "Match each phrasal verb to its correct meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Notice that phrases sharing the same base verb (put, come, give) have completely different meanings from each other.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    const putPick = shuffle(rng, PHRASAL_VERBS.filter((p) => p.family === "put")).slice(0, 2);
    const comePick = shuffle(rng, PHRASAL_VERBS.filter((p) => p.family === "come")).slice(0, 2);
    const givePick = shuffle(rng, PHRASAL_VERBS.filter((p) => p.family === "give")).slice(0, 2);
    const chosen = shuffle(rng, [...putPick, ...comePick, ...givePick]);
    const buckets = [
      { id: "put", label: FAMILY_LABEL.put },
      { id: "come", label: FAMILY_LABEL.come },
      { id: "give", label: FAMILY_LABEL.give },
    ];
    const items = chosen.map((p, i) => ({ id: `p${i}`, label: p.phrase }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((p, i) => (correctBucket[`p${i}`] = p.family));
    return {
      kind: "categorize",
      prompt: "Sort each phrasal verb by the base verb it is formed from.",
      items,
      buckets,
      correctBucket,
      hint: "Say each phrase in your head and identify whether it starts with 'put', 'come', or 'give'.",
      explanation: chosen.map((p) => `"${p.phrase}" is formed from "${p.family}".`).join(" "),
    };
  },
};
