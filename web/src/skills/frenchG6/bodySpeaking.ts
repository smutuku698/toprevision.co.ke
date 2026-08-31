import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

// Note (per curriculum-reference/grade-6/french.json, sub-strand 1.7): Grade 6's "My Body" theme is grooming
// and personal-hygiene vocabulary, not anatomical body-part naming — matches the source design's scope note.

type Tag = "action" | "item";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "se laver les mains", meaning: "to wash your hands", tag: "action" },
  { word: "se brosser les dents", meaning: "to brush your teeth", tag: "action" },
  { word: "se peigner les cheveux", meaning: "to comb your hair", tag: "action" },
  { word: "prendre une douche", meaning: "to take a shower", tag: "action" },
  { word: "se couper les ongles", meaning: "to cut your nails", tag: "action" },
  { word: "se laver le visage", meaning: "to wash your face", tag: "action" },
  { word: "se raser", meaning: "to shave", tag: "action" },
  { word: "mettre du déodorant", meaning: "to put on deodorant", tag: "action" },
  { word: "le savon", meaning: "soap", tag: "item" },
  { word: "la brosse à dents", meaning: "toothbrush", tag: "item" },
  { word: "le peigne", meaning: "comb", tag: "item" },
  { word: "la serviette", meaning: "towel", tag: "item" },
  { word: "le shampooing", meaning: "shampoo", tag: "item" },
  { word: "le dentifrice", meaning: "toothpaste", tag: "item" },
  { word: "le déodorant", meaning: "deodorant", tag: "item" },
  { word: "les ciseaux à ongles", meaning: "nail scissors", tag: "item" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Je me lave les ", after: " avant de manger.", answer: "mains", gloss: "Je me lave les mains avant de manger. — I wash my hands before eating." },
  { before: "Je me brosse les ", after: " après le petit-déjeuner.", answer: "dents", gloss: "Je me brosse les dents après le petit-déjeuner. — I brush my teeth after breakfast." },
  { before: "Je me lave avec du ", after: ".", answer: "savon", gloss: "Je me lave avec du savon. — I wash myself with soap." },
  { before: "Je me peigne les ", after: " le matin.", answer: "cheveux", gloss: "Je me peigne les cheveux le matin. — I comb my hair in the morning." },
  { before: "Je prends une ", after: " tous les jours.", answer: "douche", gloss: "Je prends une douche tous les jours. — I take a shower every day." },
  { before: "Je me sèche avec une ", after: ".", answer: "serviette", gloss: "Je me sèche avec une serviette. — I dry myself with a towel." },
  { before: "Je me brosse les dents avec du ", after: ".", answer: "dentifrice", gloss: "Je me brosse les dents avec du dentifrice. — I brush my teeth with toothpaste." },
  { before: "Je me lave les cheveux avec du ", after: ".", answer: "shampooing", gloss: "Je me lave les cheveux avec du shampooing. — I wash my hair with shampoo." },
  { before: "Je mets du ", after: " après la douche.", answer: "déodorant", gloss: "Je mets du déodorant après la douche. — I put on deodorant after the shower." },
  { before: "Je me coupe les ", after: " une fois par semaine.", answer: "ongles", gloss: "Je me coupe les ongles une fois par semaine. — I cut my nails once a week." },
  { before: "Je me lave le ", after: " tous les matins.", answer: "visage", gloss: "Je me lave le visage tous les matins. — I wash my face every morning." },
  { before: "Papa se ", after: " tous les deux jours.", answer: "rase", gloss: "Papa se rase tous les deux jours. — Dad shaves every two days." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je", "me", "lave", "les", "mains", "."], sentence: "Je me lave les mains." },
  { chunks: ["Je", "me", "brosse", "les", "dents", "."], sentence: "Je me brosse les dents." },
  { chunks: ["Je", "prends", "une", "douche", "tous", "les", "jours", "."], sentence: "Je prends une douche tous les jours." },
  { chunks: ["Je", "me", "peigne", "les", "cheveux", "."], sentence: "Je me peigne les cheveux." },
  { chunks: ["Je", "me", "coupe", "les", "ongles", "."], sentence: "Je me coupe les ongles." },
  { chunks: ["Je", "mets", "du", "déodorant", "."], sentence: "Je mets du déodorant." },
];

const NAMES = ["Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno", "Wanjiru", "Kiptoo", "Achieng", "Mumbi", "Kamau", "Wafula"];

const SCENARIOS: { situation: (name: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} just finished breakfast and needs to keep their teeth clean before leaving for school.`,
    correct: "Je me brosse les dents après le petit-déjeuner.",
    distractors: ["Je me lave les mains après le petit-déjeuner.", "Je prends une douche après le petit-déjeuner.", "Je me peigne les cheveux après le petit-déjeuner."],
    explanation: "Keeping teeth clean specifically calls for 'se brosser les dents' — washing hands, showering, and combing hair are all real routines, but none targets the teeth.",
  },
  {
    situation: (n) => `${n} is about to sit down for lunch after playing outside with dirty hands.`,
    correct: "Je me lave les mains avant de manger.",
    distractors: ["Je me brosse les dents avant de manger.", "Je me coupe les ongles avant de manger.", "Je mets du déodorant avant de manger."],
    explanation: "Dirty hands before a meal call for washing hands ('se laver les mains'), not brushing teeth, cutting nails, or applying deodorant, which don't address the hands' cleanliness for eating.",
  },
  {
    situation: (n) => `${n} got very sweaty after football practice and needs to freshen up their whole body.`,
    correct: "Je prends une douche.",
    distractors: ["Je me lave le visage.", "Je me peigne les cheveux.", "Je me coupe les ongles."],
    explanation: "A full-body freshen-up after sweating calls for a shower — washing just the face, combing hair, or cutting nails only addresses one small part, not the whole body.",
  },
  {
    situation: (n) => `${n}'s hair is messy and tangled right before a class photo.`,
    correct: "Je me peigne les cheveux.",
    distractors: ["Je me lave le visage.", "Je me brosse les dents.", "Je mets du déodorant."],
    explanation: "Messy, tangled hair specifically calls for combing ('se peigner les cheveux') — the other actions groom a different part of the body entirely.",
  },
  {
    situation: (n) => `${n}'s nails have grown long and are starting to catch on things.`,
    correct: "Je me coupe les ongles.",
    distractors: ["Je me lave les mains.", "Je me peigne les cheveux.", "Je prends une douche."],
    explanation: "Long nails catching on things call specifically for cutting them ('se couper les ongles') — washing hands cleans the skin but doesn't shorten the nails.",
  },
  {
    situation: (n) => `${n} woke up with dust and sleep in their eyes and wants a clean face before school.`,
    correct: "Je me lave le visage.",
    distractors: ["Je me lave les mains.", "Je me brosse les dents.", "Je prends une douche."],
    explanation: "A dusty face specifically needs 'se laver le visage' — washing hands or brushing teeth cleans a different area, and a full shower is more than the situation calls for.",
  },
  {
    situation: (n) => `${n}'s father has stubble growing on his chin and wants a smooth, clean-shaven face.`,
    correct: "Il se rase.",
    distractors: ["Il se lave les mains.", "Il se peigne les cheveux.", "Il se coupe les ongles."],
    explanation: "Removing chin stubble calls specifically for shaving ('se raser') — the other grooming actions target hands, hair, or nails, not facial hair.",
  },
  {
    situation: (n) => `${n} is worried about smelling bad after gym class before going back into a hot classroom.`,
    correct: "Je mets du déodorant.",
    distractors: ["Je me lave les cheveux.", "Je me coupe les ongles.", "Je me brosse les dents."],
    explanation: "Body odor after exercise calls specifically for deodorant ('mettre du déodorant') — washing hair, cutting nails, or brushing teeth don't address underarm odor.",
  },
  {
    situation: (n) => `${n} is looking for the right tool to clean plaque off their teeth every morning.`,
    correct: "J'utilise une brosse à dents et du dentifrice.",
    distractors: ["J'utilise un peigne et du shampooing.", "J'utilise une serviette et du savon.", "J'utilise des ciseaux à ongles."],
    explanation: "Cleaning teeth requires a toothbrush and toothpaste — a comb/shampoo cleans hair, a towel/soap dries and washes the body, and nail scissors trim nails.",
  },
  {
    situation: (n) => `${n} steps out of the shower dripping wet and needs to dry off before getting dressed.`,
    correct: "Je me sèche avec une serviette.",
    distractors: ["Je me sèche avec du savon.", "Je me sèche avec un peigne.", "Je me sèche avec du dentifrice."],
    explanation: "Drying off after a shower calls for a towel ('une serviette') — soap, a comb, and toothpaste each serve a completely different grooming step.",
  },
  {
    situation: (n) => `${n} wants their hair to smell fresh and look clean after getting dusty all day.`,
    correct: "Je me lave les cheveux avec du shampooing.",
    distractors: ["Je me lave les cheveux avec du savon uniquement.", "Je me lave les cheveux avec du dentifrice.", "Je me lave les cheveux avec du déodorant."],
    explanation: "Hair is specifically washed with shampoo — toothpaste and deodorant are for entirely different grooming purposes, and soap alone is not the standard product for hair.",
  },
  {
    situation: (n) => `${n} explains to a younger sibling why grooming every day actually matters for health, not just appearance.`,
    correct: "Se laver et se brosser les dents évite les maladies.",
    distractors: ["Se laver et se brosser les dents rend triste.", "Se laver et se brosser les dents coûte cher inutilement.", "Se laver et se brosser les dents n'a aucun effet."],
    explanation: "Good grooming habits genuinely help prevent illness — the distractors either state an unrelated emotional effect or wrongly claim grooming has no benefit, which contradicts the whole point of the routine.",
  },
];

export const bodySpeaking: Skill = {
  id: "g6-fr-ls-body",
  code: "LS.7",
  subjectId: "french",
  strandId: "g6-fr-listening-speaking",
  grade: 6,
  title: "My body: grooming and hygiene",
  description: "Informal (tu-form) French vocabulary for grooming actions and personal-hygiene items, and talking about how and when to use them.",
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
        prompt: "Match each French grooming word or phrase to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Action phrases start with a reflexive verb ('se...'); item words name a product or tool.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const actions = shuffle(rng, WORDS.filter((p) => p.tag === "action")).slice(0, 5);
      const items = shuffle(rng, WORDS.filter((p) => p.tag === "item")).slice(0, 5);
      const chosen = shuffle(rng, [...actions, ...items]);
      const correctBucket: Record<string, string> = {};
      for (const p of chosen) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word or phrase as a Grooming Action or a Grooming Item.",
        items: chosen.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "action", label: "Grooming Action" },
          { id: "item", label: "Grooming Item" },
        ],
        correctBucket,
        hint: "Actions describe something you do; items are the products or tools you use to do it.",
        explanation: [...actions, ...items].map((p) => `"${p.word}" is a grooming ${p.tag === "action" ? "action" : "item"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the grooming sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which body part, product, or routine fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct, informal French sentence about grooming.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The reflexive pronoun 'me' comes right after 'Je', before the verb.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const name = randChoice(rng, NAMES);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(name)} What do you say?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check which specific grooming action or item actually solves this situation, not just any grooming activity.",
      explanation: s.explanation,
    };
  },
};
