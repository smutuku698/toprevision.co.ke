import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "action" | "tool";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "se laver", meaning: "to wash oneself", tag: "action" },
  { word: "se brosser les dents", meaning: "to brush one's teeth", tag: "action" },
  { word: "se peigner", meaning: "to comb one's hair", tag: "action" },
  { word: "se doucher", meaning: "to shower", tag: "action" },
  { word: "se laver les mains", meaning: "to wash one's hands", tag: "action" },
  { word: "se laver le visage", meaning: "to wash one's face", tag: "action" },
  { word: "couper les ongles", meaning: "to cut one's nails", tag: "action" },
  { word: "prendre un bain", meaning: "to take a bath", tag: "action" },
  { word: "le savon", meaning: "soap", tag: "tool" },
  { word: "la brosse à dents", meaning: "toothbrush", tag: "tool" },
  { word: "le peigne", meaning: "comb", tag: "tool" },
  { word: "le shampooing", meaning: "shampoo", tag: "tool" },
  { word: "la serviette", meaning: "towel", tag: "tool" },
  { word: "le dentifrice", meaning: "toothpaste", tag: "tool" },
  { word: "la brosse à cheveux", meaning: "hairbrush", tag: "tool" },
  { word: "les ciseaux à ongles", meaning: "nail clippers", tag: "tool" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Je me brosse les ", after: " chaque matin.", answer: "dents", gloss: "Je me brosse les dents chaque matin. — I brush my teeth every morning." },
  { before: "Tu te laves les ", after: " avant de manger.", answer: "mains", gloss: "Tu te laves les mains avant de manger. — You wash your hands before eating." },
  { before: "Je me ", after: " tous les jours.", answer: "douche", gloss: "Je me douche tous les jours. — I shower every day." },
  { before: "J'utilise le ", after: " pour me laver.", answer: "savon", gloss: "J'utilise le savon pour me laver. — I use soap to wash myself." },
  { before: "Je me peigne avec un ", after: ".", answer: "peigne", gloss: "Je me peigne avec un peigne. — I comb my hair with a comb." },
  { before: "Le ", after: " sert à se laver les cheveux.", answer: "shampooing", gloss: "Le shampooing sert à se laver les cheveux. — Shampoo is used to wash your hair." },
  { before: "Je me sèche avec une ", after: ".", answer: "serviette", gloss: "Je me sèche avec une serviette. — I dry myself with a towel." },
  { before: "Je coupe mes ", after: " une fois par semaine.", answer: "ongles", gloss: "Je coupe mes ongles une fois par semaine. — I cut my nails once a week." },
  { before: "Le matin, je prends un ", after: ".", answer: "bain", gloss: "Le matin, je prends un bain. — In the morning, I take a bath." },
  { before: "J'utilise le ", after: " pour me brosser les dents.", answer: "dentifrice", gloss: "J'utilise le dentifrice pour me brosser les dents. — I use toothpaste to brush my teeth." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je", "me", "brosse", "les", "dents", "."], sentence: "Je me brosse les dents." },
  { chunks: ["Tu", "te", "laves", "les", "mains", "."], sentence: "Tu te laves les mains." },
  { chunks: ["Je", "me", "douche", "tous", "les", "jours", "."], sentence: "Je me douche tous les jours." },
  { chunks: ["Je", "me", "peigne", "avec", "un", "peigne", "."], sentence: "Je me peigne avec un peigne." },
  { chunks: ["Je", "coupe", "mes", "ongles", "."], sentence: "Je coupe mes ongles." },
  { chunks: ["Le", "savon", "sert", "à", "se", "laver", "."], sentence: "Le savon sert à se laver." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a poster reminding classmates to wash their hands before eating.",
    correct: "Lave-toi les mains avant de manger.",
    distractors: ["Brosse-toi les dents avant de manger.", "Peigne-toi avant de manger.", "Coupe tes ongles avant de manger."],
    explanation: "'Lave-toi les mains' (wash your hands) matches the hygiene action named — the other commands ask for teeth-brushing, combing, or nail-cutting instead.",
  },
  {
    note: "You are writing a hygiene diary entry saying you brush your teeth every morning.",
    correct: "Je me brosse les dents chaque matin.",
    distractors: ["Je me lave les mains chaque matin.", "Je me douche chaque matin, mais je ne me brosse pas les dents.", "Je me brosse les cheveux chaque matin."],
    explanation: "'Je me brosse les dents' specifically names brushing teeth — the other options swap the action or the body part.",
  },
  {
    note: "You are writing that you shower every day to stay clean.",
    correct: "Je me douche tous les jours.",
    distractors: ["Je prends un bain une fois par mois.", "Je ne me douche jamais.", "Je me lave le visage tous les jours."],
    explanation: "'Je me douche tous les jours' correctly states a daily shower — the others give a rare bath, deny washing, or name a different action.",
  },
  {
    note: "You are writing a shopping list note that you need soap to wash your hands.",
    correct: "J'ai besoin de savon pour me laver les mains.",
    distractors: ["J'ai besoin de shampooing pour me laver les mains.", "J'ai besoin d'une serviette pour me laver les mains.", "J'ai besoin d'un peigne pour me laver les mains."],
    explanation: "'Savon' (soap) is used for washing hands — shampoo, towels, and combs are used for hair or drying, not washing hands.",
  },
  {
    note: "You are writing a hygiene chart entry about combing your hair with a comb.",
    correct: "Je me peigne avec un peigne.",
    distractors: ["Je me lave les cheveux avec un peigne.", "Je me brosse les dents avec un peigne.", "Je me peigne avec une brosse à dents."],
    explanation: "'Je me peigne avec un peigne' correctly pairs the combing action with its matching tool — the other options mismatch the action or the tool.",
  },
  {
    note: "You are writing a reminder to cut your nails once a week.",
    correct: "Je coupe mes ongles une fois par semaine.",
    distractors: ["Je coupe mes cheveux une fois par semaine.", "Je me lave les ongles une fois par semaine.", "Je coupe mes ongles une fois par jour."],
    explanation: "'Je coupe mes ongles une fois par semaine' correctly names nails and a weekly frequency — the others swap the body part, the verb, or the frequency.",
  },
  {
    note: "You are writing a poster line saying good hygiene is important for health.",
    correct: "La bonne hygiène est importante pour la santé.",
    distractors: ["La bonne hygiène n'est pas importante.", "Le sucre est important pour la santé.", "La mauvaise hygiène est importante pour la santé."],
    explanation: "'La bonne hygiène est importante pour la santé' correctly links good hygiene to health — the other options deny it, swap the topic, or praise bad hygiene instead.",
  },
  {
    note: "You are writing a note reminding a sibling to use shampoo when washing their hair.",
    correct: "Utilise le shampooing pour te laver les cheveux.",
    distractors: ["Utilise le savon pour te laver les cheveux.", "Utilise le dentifrice pour te laver les cheveux.", "Utilise une serviette pour te laver les cheveux."],
    explanation: "'Le shampooing' is specifically for washing hair — soap, toothpaste, and towels are used for other grooming steps, not hair-washing.",
  },
  {
    note: "You are writing that you dry off with a towel after a shower.",
    correct: "Je me sèche avec une serviette après la douche.",
    distractors: ["Je me lave avec une serviette après la douche.", "Je me sèche avec un savon après la douche.", "Je me sèche avec un peigne après la douche."],
    explanation: "'Je me sèche avec une serviette' correctly names drying with a towel — the other options swap in the wrong verb or the wrong grooming tool.",
  },
  {
    note: "You are writing that you brush your teeth with toothpaste before going to bed.",
    correct: "Je me brosse les dents avec du dentifrice avant de dormir.",
    distractors: ["Je me lave les mains avec du dentifrice avant de dormir.", "Je me brosse les dents avec du savon avant de dormir.", "Je me brosse les cheveux avec du dentifrice avant de dormir."],
    explanation: "'Dentifrice' (toothpaste) pairs correctly with brushing teeth — the other options swap in the wrong body part or the wrong grooming product.",
  },
];

export const bodyWriting: Skill = {
  id: "g6-fr-w-body",
  code: "W.7",
  subjectId: "french",
  strandId: "g6-fr-writing",
  grade: 6,
  title: "Grooming and personal hygiene",
  description: "Guided writing about grooming and personal hygiene routines and tools in French.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each written French grooming word or phrase to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Actions describe what you do; tools name what you use to do it.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const actions = shuffle(rng, WORDS.filter((p) => p.tag === "action")).slice(0, 5);
      const tools = shuffle(rng, WORDS.filter((p) => p.tag === "tool")).slice(0, 5);
      const chosen = shuffle(rng, [...actions, ...tools]);
      const correctBucket: Record<string, string> = {};
      for (const p of actions) correctBucket[p.word] = "action";
      for (const p of tools) correctBucket[p.word] = "tool";

      return {
        kind: "categorize",
        prompt: "Sort each written word or phrase as a Grooming Action or a Grooming Tool.",
        items: chosen.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "action", label: "Grooming Action" },
          { id: "tool", label: "Grooming Tool" },
        ],
        correctBucket,
        hint: "An action is something you do (a verb phrase); a tool is an object you use to do it.",
        explanation: [...actions, ...tools].map((p) => `"${p.word}" is a ${p.tag === "action" ? "grooming action" : "grooming tool"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written sentence about grooming.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which grooming action, body part, or tool fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct, informal French sentence about grooming.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject and reflexive pronoun ('je me', 'tu te') usually come before the verb.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} Which French sentence should you write?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check that the grooming action, body part, and tool all match the situation described.",
      explanation: s.explanation,
    };
  },
};
