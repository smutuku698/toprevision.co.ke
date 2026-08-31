import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { WEATHER_VOCAB, name, place } from "./shared";

// Sub-strand 3.8 Guided Writing: Visuals — Theme: Weather and Environment.
// Content: interpret a described visual/scene and summarise it in writing, vocabulary list for the
// theme. This app has no image assets for Arabic (no precedent anywhere in arabicG6/G7/G8), so the
// visual-interpretation skill is simulated via a TEXT description of a scene (e.g. "A picture shows
// dark clouds and falling rain. Which word best summarises it?") rather than an actual image.

const SCENE_DESCRIPTIONS: { scene: string; correct: string; distractors: string[]; explanation: string }[] = [
  { scene: "A picture shows dark clouds and heavy rain falling on a rooftop.", correct: "matir (rainy)", distractors: ["mushmis (sunny)", "jaaf (dry)", "harr (hot)"], explanation: "Dark clouds with falling rain are best summarised by 'matir' (rainy)." },
  { scene: "A picture shows a bright yellow sun with no clouds in a clear blue sky.", correct: "mushmis (sunny)", distractors: ["ghaa'im (cloudy)", "matir (rainy)", "thaljy (snowy)"], explanation: "A bright sun with a clear sky is best summarised by 'mushmis' (sunny)." },
  { scene: "A picture shows trees bending sideways with leaves blowing across the ground.", correct: "rih (windy)", distractors: ["ratb (humid)", "jaaf (dry)", "barid (cold)"], explanation: "Bending trees and blowing leaves are best summarised by a word describing strong wind." },
  { scene: "A picture shows the whole sky covered in thick grey clouds, though nothing is falling.", correct: "ghaa'im (cloudy)", distractors: ["mushmis (sunny)", "matir (rainy)", "asifa (stormy)"], explanation: "A sky fully covered in grey clouds, with nothing falling, is best summarised by 'ghaa'im' (cloudy)." },
  { scene: "A picture shows white snowflakes covering rooftops and trees.", correct: "thaljy (snowy)", distractors: ["harr (hot)", "jaaf (dry)", "mushmis (sunny)"], explanation: "Snowflakes covering rooftops are best summarised by 'thaljy' (snowy)." },
  { scene: "A picture shows a person fanning themselves with sweat visible on their face.", correct: "harr (hot)", distractors: ["barid (cold)", "thaljy (snowy)", "ghaa'im (cloudy)"], explanation: "Fanning oneself and sweating are best summarised by 'harr' (hot)." },
  { scene: "A picture shows a person wrapped in a thick coat and scarf, breath visible in the cold air.", correct: "barid (cold)", distractors: ["harr (hot)", "mushmis (sunny)", "ratb (humid)"], explanation: "A thick coat and visible breath in cold air are best summarised by 'barid' (cold)." },
  { scene: "A picture shows lightning striking near bent trees with rain blowing sideways.", correct: "asifa (stormy)", distractors: ["mushmis (sunny)", "jaaf (dry)", "ghaa'im (cloudy)"], explanation: "Lightning with sideways rain and bent trees is best summarised by 'asifa' (stormy)." },
  { scene: "A picture shows cracked, dusty ground with no plants growing.", correct: "jaaf (dry)", distractors: ["ratb (humid)", "matir (rainy)", "thaljy (snowy)"], explanation: "Cracked, dusty ground with no plants is best summarised by 'jaaf' (dry)." },
  { scene: "A picture shows a person's skin glistening and clothes sticking from moist, sticky air.", correct: "ratb (humid)", distractors: ["jaaf (dry)", "barid (cold)", "thaljy (snowy)"], explanation: "Moist, sticky air making clothes stick is best summarised by 'ratb' (humid)." },
];

const SUMMARY_SENTENCE_TEMPLATES: ((n: string, p: string, w: { word: string; meaning: string }) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p, w) => ({
    prompt: `${n} in ${p} looks at a described scene: dark clouds, wet ground, people holding umbrellas. Which sentence best summarises it in writing?`,
    correct: "Al-jaww matir al-yawm.",
    distractors: ["Al-jaww mushmis al-yawm.", "Al-jaww harr jiddan.", "Al-jaww jaaf tamaman."],
    explanation: "Umbrellas and wet ground point to rain, so 'Al-jaww matir al-yawm' (the weather is rainy today) best summarises the scene.",
  }),
  (n, p, w) => ({
    prompt: `${n} in ${p} looks at a described scene: children flying kites, hair blowing sideways, a flag flapping fast. Which sentence best summarises it in writing?`,
    correct: "Al-jaww kathir al-riyah al-yawm.",
    distractors: ["Al-jaww haadi' tamaman.", "Al-jaww matir jiddan.", "Al-jaww thaljy al-yawm."],
    explanation: "Kites, blowing hair, and a flapping flag point to strong wind, best summarised as a very windy day.",
  }),
  (n, p, w) => ({
    prompt: `${n} in ${p} looks at a described scene: a clear sky, people wearing sunglasses, long shadows on the ground. Which sentence best summarises it in writing?`,
    correct: "Al-jaww mushmis al-yawm.",
    distractors: ["Al-jaww ghaa'im al-yawm.", "Al-jaww matir jiddan.", "Al-jaww baarid jiddan."],
    explanation: "Sunglasses and a clear sky point to sunshine, so 'Al-jaww mushmis al-yawm' (the weather is sunny today) fits best.",
  }),
];

const VISUAL_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  { q: "When writing a summary sentence for a described weather scene, what should the sentence do?", correct: "capture the main weather condition shown in the scene", distractors: ["describe unrelated details not shown", "list every colour mentioned", "avoid mentioning the weather at all"], explanation: "A summary sentence should focus on the main weather condition depicted, not unrelated detail." },
  { q: "A described scene shows both a bright sun AND light rain falling at the same time. What is the best approach to summarising it?", correct: "mention both conditions, since the scene genuinely shows both", distractors: ["only mention the sun and ignore the rain", "only mention the rain and ignore the sun", "invent a third condition not shown at all"], explanation: "A good visual summary reflects everything actually present in the scene, not just part of it." },
  { q: "Why is building a weather vocabulary list useful before writing a visual summary?", correct: "it gives you the right words to accurately describe what you see", distractors: ["it replaces the need to look at the scene at all", "it is unrelated to visual-interpretation writing", "it only helps with speaking, not writing"], explanation: "A vocabulary list equips a writer with the precise words needed to summarise a scene accurately." },
];

export const weatherWriting: Skill = {
  id: "g6-ar-w-weather",
  code: "W.8",
  subjectId: "arabic",
  strandId: "g6-ar-writing",
  grade: 6,
  title: "Guided writing: visuals (weather and environment)",
  description: "Interpret a described weather scene and summarise it in writing, using an accurate weather vocabulary list.",
  generate(rng) {
    const branch = randChoice(rng, ["scene", "summarySentence", "visualReasoning", "fill", "match"] as const);

    if (branch === "scene") {
      const s = randChoice(rng, SCENE_DESCRIPTIONS);
      const choices = shuffle(rng, [s.correct, ...s.distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, [
          "Which word best summarises this described picture?",
          "Read the described scene and choose the word that summarises it.",
          "What single word best captures this scene?",
          "Choose the word that best summarises what is described.",
          "Which weather word fits this described picture?",
        ]) + " " + s.scene,
        choices,
        correctIndex: choices.indexOf(s.correct),
        layout: "list",
        hint: "Focus on the main weather clue described (clouds, sun, wind, temperature, wetness).",
        explanation: s.explanation,
      };
    }

    if (branch === "summarySentence") {
      const n = name(rng);
      const p = place(rng);
      const w = randChoice(rng, WEATHER_VOCAB);
      const tmpl = randChoice(rng, SUMMARY_SENTENCE_TEMPLATES);
      const q = tmpl(n, p, w);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Look for the clues in the described scene and match them to the right weather word.",
        explanation: q.explanation,
      };
    }

    if (branch === "visualReasoning") {
      const q = randChoice(rng, VISUAL_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "A good summary reflects exactly what the scene shows, using accurate vocabulary.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill") {
      const w = randChoice(rng, WEATHER_VOCAB);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, [
          `Fill in the weather word for this meaning: ${w.meaning}.`,
          `Complete the vocabulary list: what word means "${w.meaning}"?`,
          `What Arabic word summarises "${w.meaning}" weather?`,
          `Fill the gap with the weather word meaning "${w.meaning}".`,
          `Complete this weather-vocabulary-list fact: "${w.meaning}".`,
        ]),
        before: "The word for this weather condition is ",
        after: ".",
        correctAnswer: w.word,
        inputMode: "text",
        hint: "Think of the vocabulary list you have built for weather words.",
        explanation: `"${w.word}" means "${w.meaning}".`,
      };
    }

    const chosen = shuffle(rng, WEATHER_VOCAB).slice(0, 6);
    const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
    const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
    const correctMap: Record<string, string> = {};
    for (const s of chosen) correctMap[s.word] = s.word;
    return {
      kind: "click-match",
      prompt: randChoice(rng, [
        "Build your weather vocabulary list: match each word to its meaning.",
        "Match each weather word to its meaning before writing a summary.",
        "Which meaning goes with which weather word?",
        "Pair each weather word with its correct meaning.",
        "Match each word to its meaning.",
      ]),
      tokens,
      targets,
      correctMap,
      hint: "Recall the weather vocabulary you've practised.",
      explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
    };
  },
};
