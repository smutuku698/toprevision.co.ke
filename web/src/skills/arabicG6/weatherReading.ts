import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { WEATHER_VOCAB, POSITION_VOCAB, name, place } from "./shared";

// Sub-strand 2.8 Reading for Comprehension — Theme: Weather and Environment.
// Content: identify position-describing words from text, recite/comprehend short weather-condition
// poems/texts.

const PASSAGE_SKELETONS: ((n: string, p: string) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (n, p) => ({
    lines: [
      `${n} yaqra'u nassan 'an al-taqs fi ${p}. (${n} reads a text about the weather in ${p}.)`,
      `Al-jaww mushmis sabahan wa ghaa'im masaa'an. (The weather is sunny in the morning and cloudy in the evening.)`,
      `Al-ghuyum bijaanib al-jabal al-'aali. (The clouds are next to the tall mountain.)`,
      `${n} yulqi qasida qaseera 'an al-shams. (${n} recites a short poem about the sun.)`,
    ],
    qa: [
      { q: "How does the passage describe the morning weather?", correct: "sunny", distractors: ["rainy", "snowy", "the passage does not say"], explanation: "'Al-jaww mushmis sabahan' means 'the weather is sunny in the morning'." },
      { q: "Where are the clouds described as being, according to the passage?", correct: "next to the tall mountain", distractors: ["above the school", "behind the sea", "the passage does not say"], explanation: "'Al-ghuyum bijaanib al-jabal al-'aali' means 'the clouds are next to the tall mountain' — 'bijaanib' means 'next to'." },
      { q: `What does ${n} recite, according to the passage?`, correct: "a short poem about the sun", distractors: ["a story about rain", "a song about the wind", "the passage does not say"], explanation: `"${n} yulqi qasida qaseera 'an al-shams" means "${n} recites a short poem about the sun".` },
    ],
  }),
  (n, p) => ({
    lines: [
      `Qasida qaseera: "Al-matar yasqutu fawq al-shajara." (Short poem: "The rain falls above the tree.")`,
      `"Wa al-rih tahubbu qareeban min al-bayt." (And the wind blows near the house.)`,
      `"${n} yajlisu taht al-saqf fi ${p}." (${n} sits under the roof in ${p}.)`,
      `"Yantaziru hatta yatawaqqafa al-matar." (He waits until the rain stops.)`,
    ],
    qa: [
      { q: "Where does the rain fall, according to the poem?", correct: "above the tree", distractors: ["below the tree", "far from the house", "the poem does not say"], explanation: "'Al-matar yasqutu fawq al-shajara' means 'the rain falls above the tree' — 'fawq' means 'above'." },
      { q: "Where does the wind blow, according to the poem?", correct: "near the house", distractors: ["far from the house", "under the tree", "the poem does not say"], explanation: "'Wa al-rih tahubbu qareeban min al-bayt' means 'and the wind blows near the house' — 'qareeban min' means 'near'." },
      { q: `Where does ${n} sit, according to the poem?`, correct: "under the roof", distractors: ["above the roof", "in front of the house", "the poem does not say"], explanation: "'yajlisu taht al-saqf' means 'sits under the roof' — 'taht' means 'under'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} yaktubu 'an taqs ${p} al-yawm. (${n} writes about ${p}'s weather today.)`,
      `Al-jaww harr jiddan wa jaaf. (The weather is very hot and dry.)`,
      `Laa tujadu ghuyum fi al-samaa'. (There are no clouds in the sky.)`,
      `${n} yashrabu maa'an kathiran li yabqa baaridan. (${n} drinks a lot of water to stay cool.)`,
    ],
    qa: [
      { q: "How is the weather described in the passage?", correct: "very hot and dry", distractors: ["rainy and cold", "cloudy and windy", "snowy and wet"], explanation: "'Al-jaww harr jiddan wa jaaf' means 'the weather is very hot and dry'." },
      { q: "What does the passage say about clouds in the sky?", correct: "there are none", distractors: ["there are many", "there is exactly one", "the passage does not say"], explanation: "'Laa tujadu ghuyum fi al-samaa'' means 'there are no clouds in the sky'." },
      { q: `Why does ${n} drink a lot of water, according to the passage?`, correct: "to stay cool", distractors: ["because it is raining", "because school requires it", "the passage does not say"], explanation: "'li yabqa baaridan' means 'to stay cool'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `Fi ${p}, al-jaww ghaa'im al-yawm. (In ${p}, the weather is cloudy today.)`,
      `Al-riyah taeeru 'abra al-hadiqa. (The winds blow across the garden.)`,
      `${n} yaqifu muqabil al-nafitha yushahidu al-jaww. (${n} stands opposite the window watching the weather.)`,
      `Yatawaqqa'u an yamtira ba'da qaleel. (He expects it will rain soon.)`,
    ],
    qa: [
      { q: "Where do the winds blow, according to the passage?", correct: "across the garden", distractors: ["under the house", "behind the school", "the passage does not say"], explanation: "'Al-riyah taeeru 'abra al-hadiqa' means 'the winds blow across the garden' — ''abra' means 'across'." },
      { q: `Where does ${n} stand, according to the passage?`, correct: "opposite the window", distractors: ["next to the door", "far from the house", "the passage does not say"], explanation: "'yaqifu muqabil al-nafitha' means 'stands opposite the window' — 'muqabil' means 'opposite'." },
      { q: `What does ${n} expect, according to the passage?`, correct: "that it will rain soon", distractors: ["that it will snow soon", "that the sun will come out", "the passage does not say"], explanation: "'Yatawaqqa'u an yamtira ba'da qaleel' means 'he expects it will rain soon'." },
    ],
  }),
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'Next to' in a weather reading text is written as ", after: ".", correct: "bijaanib" },
  { before: "'Above' in a weather reading text is written as ", after: ".", correct: "fawq" },
  { before: "'Under' in a weather reading text is written as ", after: ".", correct: "taht" },
  { before: "'Near' in a weather reading text is written as ", after: ".", correct: "qareeb min" },
  { before: "'Opposite' in a weather reading text is written as ", after: ".", correct: "muqabil" },
  { before: "'Across' in a weather reading text is written as ", after: ".", correct: "'abra" },
  { before: "'The sky' in a weather reading text is written as ", after: ".", correct: "al-samaa'" },
  { before: "'It rains' in a weather reading text is written as ", after: ".", correct: "yamtiru" },
];

export const weatherReading: Skill = {
  id: "g6-ar-r-weather",
  code: "R.8",
  subjectId: "arabic",
  strandId: "g6-ar-reading",
  grade: 6,
  title: "Reading for comprehension: position words and weather texts",
  description: "Identify position-describing words from a weather text, and comprehend and recite short weather-condition poems.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "positionMatch", "fill", "ordering", "vocabMatch"] as const);
    const n = name(rng);
    const p = place(rng);
    const skeleton = randChoice(rng, PASSAGE_SKELETONS)(n, p);
    const passage = skeleton.lines.join("\n");

    if (branch === "positionMatch") {
      const chosen = shuffle(rng, POSITION_VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        passage,
        prompt: randChoice(rng, [
          "Identify each position word from the text and match it to its meaning.",
          "Match the position-describing word to its meaning.",
          "Which meaning goes with which position word?",
          "Pair each position word with its correct meaning.",
          "Match each position word to what it means.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Reread the passage above for where things are located.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    if (branch === "vocabMatch") {
      const chosen = shuffle(rng, WEATHER_VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        passage,
        prompt: randChoice(rng, [
          "Match each weather word to its meaning.",
          "Match the word from the passage's theme to its meaning.",
          "Which meaning goes with which weather word?",
          "Pair each weather word with its correct meaning.",
          "Match each word to what it means.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Reread the passage above for context clues.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        passage,
        prompt: randChoice(rng, [
          "Fill in the missing word.",
          "Complete the sentence with the correct word.",
          "What word completes this reading fact?",
          "Fill the gap correctly.",
          "Complete this vocabulary fact.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about the position words used in the passage above.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "ordering") {
      const withIds = skeleton.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Put these lines from the passage in the order they were written.",
          "Arrange the passage's lines in the correct reading order.",
          "Sequence this passage correctly.",
          "Order the lines as they appear in the passage.",
          "Which order makes this passage make sense?",
        ]),
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "Read the passage above carefully to recall its order.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    const qa = randChoice(rng, skeleton.qa);
    const choices = shuffle(rng, [qa.correct, ...qa.distractors]);
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
