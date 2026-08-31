import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { WEATHER_VOCAB, name, place } from "./shared";

// Sub-strand 1.8 Imitative Speaking: Pronunciation — Theme: Weather and Environment.
// Content: describe weather conditions with correct pronunciation/intonation, respond to simple
// questions about the weather.

const WEATHER_REACTION_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} looks outside in ${p} and sees dark clouds and heavy rain. What would ${n} say?`,
    correct: "al-jaww matir al-yawm (the weather is rainy today)",
    distractors: ["al-jaww mushmis al-yawm (the weather is sunny today)", "al-jaww baarid jiddan (the weather is very cold)", "al-jaww jaaf al-yawm (the weather is dry today)"],
    explanation: `Dark clouds and heavy rain describe "matar" (rain) — so ${n} would describe the weather as "matir" (rainy).`,
  }),
  (n, p) => ({
    prompt: `In ${p}, ${n} feels a strong wind blowing and the trees swaying. What would ${n} say?`,
    correct: "al-jaww 'aasif al-yawm (the weather is windy today)",
    distractors: ["al-jaww haar jiddan (the weather is very hot)", "al-jaww ghaa'im (the weather is cloudy)", "al-jaww thaljy (the weather is snowy)"],
    explanation: `A strong wind describes "rih" (wind) — so ${n} would describe the weather as windy ("rih" related word).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} wakes up to a clear blue sky with bright sunshine. What would ${n} say?`,
    correct: "al-jaww mushmis al-yawm (the weather is sunny today)",
    distractors: ["al-jaww matir al-yawm (the weather is rainy today)", "al-jaww ghaa'im (the weather is cloudy)", "al-jaww ratb jiddan (the weather is very humid)"],
    explanation: `A clear blue sky with sunshine describes "shams" (sun) — so ${n} would say "mushmis" (sunny).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} notices the sky is completely covered in grey clouds, though it isn't raining. What would ${n} say?`,
    correct: "al-jaww ghaa'im al-yawm (the weather is cloudy today)",
    distractors: ["al-jaww mushmis jiddan (the weather is very sunny)", "al-jaww jaaf tamaman (the weather is completely dry)", "al-jaww thaljy (the weather is snowy)"],
    explanation: `Grey clouds covering the sky describe "ghuyum" (clouds) — so ${n} would say "ghaa'im" (cloudy).`,
  }),
  (n, p) => ({
    prompt: `In ${p}, ${n} steps outside and immediately starts sweating from the heat. What would ${n} say?`,
    correct: "al-jaww harr jiddan (the weather is very hot)",
    distractors: ["al-jaww baarid jiddan (the weather is very cold)", "al-jaww matir (the weather is rainy)", "al-jaww thaljy (the weather is snowy)"],
    explanation: `Sweating from heat describes "harr" (hot) — so ${n} would describe the weather as "harr" (hot).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} shivers and wraps up in a thick jacket because of the chill. What would ${n} say?`,
    correct: "al-jaww baarid jiddan (the weather is very cold)",
    distractors: ["al-jaww harr jiddan (the weather is very hot)", "al-jaww mushmis (the weather is sunny)", "al-jaww jaaf (the weather is dry)"],
    explanation: `Shivering and wrapping up describes "barid" (cold) — so ${n} would describe the weather as "baarid" (cold).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} responds "kayfa al-jaww al-yawm?" (how is the weather today?) with "matir jiddan" (very rainy). What is ${n} doing?`,
    correct: "answering a simple question about the weather",
    distractors: ["asking for directions", "introducing themselves", "describing a food preference"],
    explanation: `${n} is responding to a simple weather question with a description — matching the sub-strand's "respond to simple questions" content.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} notices snowflakes falling for the first time. What word would ${n} use to describe it?`,
    correct: "thaljy (snowy)",
    distractors: ["mushmis (sunny)", "harr (hot)", "jaaf (dry)"],
    explanation: `Falling snowflakes describe "thalj" (snow) — so ${n} would say "thaljy" (snowy).`,
  }),
];

const PRONOUNCE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  { q: "When describing weather conditions aloud, what matters besides saying the correct word?", correct: "using correct pronunciation and intonation", distractors: ["speaking as quietly as possible", "using only English words", "avoiding eye contact"], explanation: "The sub-strand targets both accurate weather vocabulary and correct pronunciation/intonation." },
  { q: "Which sentence uses rising intonation to ask a question about weather?", correct: "\"Kayfa al-jaww al-yawm?\" (how is the weather today?)", distractors: ["\"Al-jaww matir\" said as a flat statement", "a single weather word said with no tone change", "shouting a weather word with no clear meaning"], explanation: "A question like 'kayfa al-jaww al-yawm?' typically rises in intonation, unlike a flat statement." },
  { q: "Why does clear pronunciation of weather words matter?", correct: "so the listener understands exactly which weather condition is meant", distractors: ["it doesn't matter as long as you point outside", "only written spelling matters, not speech", "weather words are never spoken aloud"], explanation: "Clear pronunciation ensures the listener understands the specific weather condition described." },
  { q: "A learner imitates the teacher's pronunciation of 'matir' (rainy) but drops the ending sound. What is affected?", correct: "the word becomes less clear or accurate", distractors: ["nothing changes at all", "the meaning becomes the opposite", "it becomes a question instead"], explanation: "Dropping sounds reduces pronunciation accuracy, even if the general word is still recognisable." },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'Sunny' in Arabic is ", after: ".", correct: "mushmis" },
  { before: "'Rainy' in Arabic is ", after: ".", correct: "matir" },
  { before: "'Windy' in Arabic is ", after: ".", correct: "rih" },
  { before: "'Cloudy' in Arabic is ", after: ".", correct: "ghuyum" },
  { before: "'Hot' in Arabic is ", after: ".", correct: "harr" },
  { before: "'Cold' in Arabic is ", after: ".", correct: "barid" },
  { before: "'How is the weather today?' in Arabic is ", after: ".", correct: "kayfa al-jaww al-yawm" },
  { before: "'The weather' in Arabic is ", after: ".", correct: "al-jaww" },
];

const WEATHER_CATEGORY: { word: string; type: "Wet/wintry" | "Dry/mild" }[] = [
  { word: "matar", type: "Wet/wintry" }, { word: "ghuyum", type: "Wet/wintry" }, { word: "ratb", type: "Wet/wintry" }, { word: "thalj", type: "Wet/wintry" }, { word: "asifa", type: "Wet/wintry" },
  { word: "shams", type: "Dry/mild" }, { word: "rih", type: "Dry/mild" }, { word: "harr", type: "Dry/mild" }, { word: "barid", type: "Dry/mild" }, { word: "jaaf", type: "Dry/mild" },
];

export const weatherSpeaking: Skill = {
  id: "g6-ar-ls-weather",
  code: "LS.8",
  subjectId: "arabic",
  strandId: "g6-ar-listening-speaking",
  grade: 6,
  title: "Imitative speaking: pronunciation (weather and environment)",
  description: "Describe weather conditions with correct pronunciation and intonation, and respond to simple questions about the weather.",
  generate(rng) {
    const branch = randChoice(rng, ["reaction", "pronounce", "fill", "match", "categorize"] as const);

    if (branch === "reaction") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, WEATHER_REACTION_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Match the scene described to the weather word it points to.",
        explanation: q.explanation,
      };
    }

    if (branch === "pronounce") {
      const q = randChoice(rng, PRONOUNCE_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Think about how tone of voice changes a statement into a question.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, [
          "Fill in the missing Arabic word or phrase.",
          "Complete the sentence with the correct Arabic word.",
          "What Arabic word completes this sentence?",
          "Fill the gap with the romanized Arabic word.",
          "Complete this weather-vocabulary fact.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about the weather vocabulary you've practised speaking.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, WEATHER_VOCAB).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Match each weather word to its meaning.",
          "Match the spoken weather word to what it means.",
          "Which meaning goes with which weather word?",
          "Pair each weather word with its correct meaning.",
          "Match each word you hear to its meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud to yourself before matching it.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    const chosen2 = shuffle(rng, WEATHER_CATEGORY).slice(0, 7);
    const items = chosen2.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
    const correctBucket: Record<string, string> = {};
    chosen2.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.type));
    return {
      kind: "categorize",
      prompt: randChoice(rng, [
        "Sort each weather word: Wet/wintry, or Dry/mild?",
        "Group these weather words by category.",
        "Which category does each weather word belong to?",
        "Sort each weather word into the correct category.",
        "Classify each weather condition below.",
      ]),
      items: shuffle(rng, items),
      buckets: [
        { id: "Wet/wintry", label: "Wet/wintry" },
        { id: "Dry/mild", label: "Dry/mild" },
      ],
      correctBucket,
      hint: "Rain, clouds, humidity, snow, and storms are wet/wintry; sun, wind, heat, cold, and dryness are dry/mild.",
      explanation: chosen2.map((c) => `"${c.word}" is ${c.type === "Wet/wintry" ? "a wet/wintry" : "a dry/mild"} condition.`).join(" "),
    };
  },
};
