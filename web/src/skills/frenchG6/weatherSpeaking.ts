import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

// Note (per curriculum-reference/grade-6/french.json, sub-strand 1.8): Grade 6's Weather theme explicitly
// includes grouping weather conditions into friendly ("agréable") and unfriendly ("difficile") relative to
// the immediate surroundings — this drives the tag split and the scenario branch below.

type Tag = "friendly" | "unfriendly";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "il fait beau", meaning: "the weather is nice", tag: "friendly" },
  { word: "il fait chaud", meaning: "it's warm/hot", tag: "friendly" },
  { word: "le soleil brille", meaning: "the sun is shining", tag: "friendly" },
  { word: "il fait frais", meaning: "it's cool", tag: "friendly" },
  { word: "le ciel est bleu", meaning: "the sky is blue", tag: "friendly" },
  { word: "il fait doux", meaning: "it's mild", tag: "friendly" },
  { word: "une légère brise", meaning: "a light breeze", tag: "friendly" },
  { word: "un temps calme", meaning: "calm weather", tag: "friendly" },
  { word: "il y a une tempête", meaning: "there's a storm", tag: "unfriendly" },
  { word: "il y a une inondation", meaning: "there's a flood", tag: "unfriendly" },
  { word: "il y a une sécheresse", meaning: "there's a drought", tag: "unfriendly" },
  { word: "il fait très froid", meaning: "it's very cold", tag: "unfriendly" },
  { word: "il y a un orage", meaning: "there's a thunderstorm", tag: "unfriendly" },
  { word: "il y a un fort vent", meaning: "there's a strong wind", tag: "unfriendly" },
  { word: "il grêle", meaning: "it's hailing", tag: "unfriendly" },
  { word: "il y a du brouillard épais", meaning: "there's thick fog", tag: "unfriendly" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Il ", after: " beaucoup pendant la saison des pluies.", answer: "pleut", gloss: "Il pleut beaucoup pendant la saison des pluies. — It rains a lot during the rainy season." },
  { before: "Le ciel est ", after: " aujourd'hui.", answer: "bleu", gloss: "Le ciel est bleu aujourd'hui. — The sky is blue today." },
  { before: "Il y a une ", after: " et les rivières débordent.", answer: "inondation", gloss: "Il y a une inondation et les rivières débordent. — There's a flood and the rivers are overflowing." },
  { before: "Un temps calme est ", after: " pour les habitants.", answer: "agréable", gloss: "Un temps calme est agréable pour les habitants. — Calm weather is pleasant for the residents." },
  { before: "Une tempête est ", after: " pour les habitants.", answer: "difficile", gloss: "Une tempête est difficile pour les habitants. — A storm is harsh for the residents." },
  { before: "Il fait très ", after: " en hiver dans certaines régions.", answer: "froid", gloss: "Il fait très froid en hiver dans certaines régions. — It's very cold in winter in some regions." },
  { before: "Le ", after: " brille dans un ciel clair.", answer: "soleil", gloss: "Le soleil brille dans un ciel clair. — The sun shines in a clear sky." },
  { before: "Il y a un fort ", after: " qui casse les branches.", answer: "vent", gloss: "Il y a un fort vent qui casse les branches. — There's a strong wind that breaks branches." },
  { before: "Pendant la ", after: ", il ne pleut pas pendant longtemps.", answer: "sécheresse", gloss: "Pendant la sécheresse, il ne pleut pas pendant longtemps. — During the drought, it doesn't rain for a long time." },
  { before: "Il ", after: " et les routes deviennent glissantes.", answer: "grêle", gloss: "Il grêle et les routes deviennent glissantes. — It's hailing and the roads become slippery." },
  { before: "Une légère ", after: " rafraîchit l'air.", answer: "brise", gloss: "Une légère brise rafraîchit l'air. — A light breeze cools the air." },
  { before: "Il y a du ", after: " épais et on ne voit pas la route.", answer: "brouillard", gloss: "Il y a du brouillard épais et on ne voit pas la route. — There's thick fog and you can't see the road." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il", "fait", "beau", "aujourd'hui", "."], sentence: "Il fait beau aujourd'hui." },
  { chunks: ["Il", "y", "a", "une", "tempête", "."], sentence: "Il y a une tempête." },
  { chunks: ["Le", "ciel", "est", "bleu", "."], sentence: "Le ciel est bleu." },
  { chunks: ["Il", "fait", "très", "froid", "."], sentence: "Il fait très froid." },
  { chunks: ["Il", "y", "a", "une", "inondation", "."], sentence: "Il y a une inondation." },
  { chunks: ["Un", "temps", "calme", "est", "agréable", "."], sentence: "Un temps calme est agréable." },
];

const PLACES = ["Kisumu", "Nakuru", "Mombasa", "Eldoret", "Machakos", "Kitale", "Nyeri", "Garissa", "Kericho", "Naivasha", "Nyahururu", "Malindi"];

const SCENARIOS: { situation: (place: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (p) => `In ${p}, the sky is clear, the sun is shining, and a light breeze is blowing — perfect for a school outing.`,
    correct: "C'est un temps agréable.",
    distractors: ["C'est un temps difficile.", "Il y a une tempête.", "Il y a une inondation."],
    explanation: "Clear skies, sunshine, and a gentle breeze together describe friendly, pleasant weather ('agréable') — not a harsh or dangerous condition.",
  },
  {
    situation: (p) => `Heavy rain in ${p} has caused rivers to overflow into homes and roads.`,
    correct: "Il y a une inondation.",
    distractors: ["Il fait beau.", "Il y a une sécheresse.", "Le ciel est bleu."],
    explanation: "Overflowing rivers describe a flood ('inondation') specifically — the distractors describe nice weather, the opposite of too much rain (drought), or a clear sky.",
  },
  {
    situation: (p) => `Farmers in ${p} haven't seen rain in months and their crops are dying of thirst.`,
    correct: "Il y a une sécheresse.",
    distractors: ["Il y a une inondation.", "Il fait beau.", "Il y a un orage."],
    explanation: "Months without rain describes a drought ('sécheresse') — a flood is the opposite problem (too much water), and 'il fait beau' misses the harsh, damaging nature of the situation.",
  },
  {
    situation: (p) => `Thunder and lightning strike as dark clouds gather over ${p}.`,
    correct: "Il y a un orage.",
    distractors: ["Il fait beau.", "Un temps calme.", "Le soleil brille."],
    explanation: "Thunder and lightning specifically describe a thunderstorm ('orage') — the other options all describe calm, sunny weather, the opposite condition.",
  },
  {
    situation: (p) => `Strong winds in ${p} are uprooting trees and tearing roofs off houses.`,
    correct: "Il y a un fort vent.",
    distractors: ["Une légère brise.", "Il fait beau.", "Un temps calme."],
    explanation: "Uprooting trees and tearing off roofs describes a strong, damaging wind — 'une légère brise' is a gentle breeze, far too weak to cause that kind of damage.",
  },
  {
    situation: (p) => `Ice pellets are falling in ${p} and denting car roofs.`,
    correct: "Il grêle.",
    distractors: ["Il pleut.", "Il fait beau.", "Il fait chaud."],
    explanation: "Falling ice pellets specifically describe hail ('il grêle') — plain rain ('il pleut') is liquid, not solid ice, so it wouldn't dent a car roof the same way.",
  },
  {
    situation: (p) => `Thick fog in ${p} this morning made it impossible for drivers to see the road ahead.`,
    correct: "Il y a du brouillard épais.",
    distractors: ["Le ciel est bleu.", "Il fait beau.", "Une légère brise."],
    explanation: "Poor visibility on the road specifically describes thick fog ('brouillard épais') — a blue sky, nice weather, or a light breeze wouldn't block a driver's view.",
  },
  {
    situation: (p) => `In ${p}, the temperature has dropped so low that people need thick blankets at night.`,
    correct: "Il fait très froid.",
    distractors: ["Il fait chaud.", "Il fait doux.", "Il fait beau."],
    explanation: "Needing thick blankets to stay warm describes very cold weather ('il fait très froid') — 'chaud' and 'doux' both describe warmer conditions, the opposite of the situation.",
  },
  {
    situation: (p) => `A gentle, cool wind blows through ${p} on an otherwise calm, mild afternoon.`,
    correct: "Il y a une légère brise.",
    distractors: ["Il y a un fort vent.", "Il y a une tempête.", "Il grêle."],
    explanation: "A gentle wind on a calm afternoon describes a light breeze ('une légère brise') — a strong wind, a storm, and hail all describe much harsher, damaging conditions.",
  },
  {
    situation: (p) => `A violent storm with heavy rain and powerful winds is battering the coast near ${p}, forcing fishermen to stay ashore.`,
    correct: "Il y a une tempête.",
    distractors: ["Il fait beau.", "Un temps calme.", "Une légère brise."],
    explanation: "Heavy rain combined with powerful winds severe enough to keep fishermen ashore describes a storm ('tempête') — the other options all describe calm, safe conditions.",
  },
  {
    situation: (p) => `Class in ${p} discusses a still, quiet day with no wind, no rain, and a comfortable temperature.`,
    correct: "C'est un temps calme.",
    distractors: ["C'est une tempête.", "Il y a un orage.", "Il y a un fort vent."],
    explanation: "No wind, no rain, and comfortable temperature together describe calm weather ('un temps calme') — the distractors all describe violent, disruptive weather, the opposite condition.",
  },
  {
    situation: (p) => `At midday in ${p}, the sky is completely cloudless and the sun is bright and warm.`,
    correct: "Le soleil brille.",
    distractors: ["Il y a du brouillard épais.", "Il pleut.", "Il y a une tempête."],
    explanation: "A cloudless sky with a bright, warm sun describes 'le soleil brille' — fog, rain, and a storm all describe conditions where the sun would be hidden, not shining brightly.",
  },
];

export const weatherSpeaking: Skill = {
  id: "g6-fr-ls-weather",
  code: "LS.8",
  subjectId: "french",
  strandId: "g6-fr-listening-speaking",
  grade: 6,
  title: "Weather and environment",
  description: "Informal (tu-form) French weather-pattern vocabulary, and classifying weather conditions as friendly or unfriendly to your surroundings.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each French weather expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look for a key noun (soleil, vent, brouillard) or verb (pleut, grêle) to identify each expression.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const friendly = shuffle(rng, WORDS.filter((p) => p.tag === "friendly")).slice(0, 5);
      const unfriendly = shuffle(rng, WORDS.filter((p) => p.tag === "unfriendly")).slice(0, 5);
      const items = shuffle(rng, [...friendly, ...unfriendly]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Group each weather condition as Friendly or Unfriendly to your surroundings.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "friendly", label: "Friendly" },
          { id: "unfriendly", label: "Unfriendly" },
        ],
        correctBucket,
        hint: "Calm, mild, sunny conditions are friendly; storms, floods, drought, and extreme cold are unfriendly.",
        explanation: [...friendly, ...unfriendly].map((p) => `"${p.word}" is ${p.tag === "friendly" ? "friendly" : "unfriendly"} weather.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about weather.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which weather word fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about weather.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Il' + a weather verb ('fait', 'y a') usually starts a weather sentence.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const place = randChoice(rng, PLACES);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(place)} How do you describe this weather?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Match the described conditions to the weather expression, and think about whether it's friendly or harsh.",
      explanation: s.explanation,
    };
  },
};
