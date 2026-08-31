import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "", after: " vos bagages avant de monter dans le train !", answer: "Prenez" },
  { before: "N'", after: " pas votre passeport ; vous en aurez besoin à la douane !", answer: "oubliez" },
  { before: "", after: " votre ceinture pendant le vol !", answer: "Attachez" },
  { before: "", after: " votre billet au contrôleur, s'il vous plaît !", answer: "Présentez" },
  { before: "L'avion décolle de ", after: ".", answer: "l'aéroport" },
  { before: "Le train part de ", after: ".", answer: "la gare" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Prenez", "vos bagages", "!"], sentence: "Prenez vos bagages !" },
  { chunks: ["N'oubliez pas", "votre passeport", "!"], sentence: "N'oubliez pas votre passeport !" },
  { chunks: ["Attachez", "votre ceinture,", "s'il vous plaît", "!"], sentence: "Attachez votre ceinture, s'il vous plaît !" },
  { chunks: ["Présentez", "votre billet", "au contrôleur", "!"], sentence: "Présentez votre billet au contrôleur !" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct formal (vous) imperative for 'Take your bags!'",
    correct: "Prenez vos bagages !",
    distractors: ["Prends tes bagages !", "Prenez tes bagages !", "Prendre vos bagages !"],
    explanation: "The formal imperative for 'vous' is 'Prenez', matched with the formal possessive 'vos'.",
  },
  {
    prompt: "Choose the correct negative formal imperative for 'Don't forget your passport!'",
    correct: "N'oubliez pas votre passeport !",
    distractors: ["Ne oubliez pas votre passeport !", "N'oublie pas votre passeport !", "N'oubliez pas votre passeports !"],
    explanation: "'Ne' shortens to 'n'' before a vowel sound; the formal imperative is 'oubliez'; 'passeport' stays singular here.",
  },
  {
    prompt: "Choose the correct formal verb form to complete: '___ votre billet au contrôleur.' (show)",
    correct: "Présentez",
    distractors: ["Présente", "Présentons", "Présenter"],
    explanation: "'Vous' takes the '-ez' ending in the imperative: 'Présentez'.",
  },
  {
    prompt: "Choose the correctly spelled word for 'luggage'.",
    correct: "les bagages",
    distractors: ["les baggages", "les bagage", "les bagajes"],
    explanation: "The correct French spelling is 'les bagages' — one 'g', with a final 's' for the plural.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "l'aéroport", meaning: "the airport" },
  { term: "la gare", meaning: "the train station" },
  { term: "le passeport", meaning: "the passport" },
  { term: "le billet", meaning: "the ticket" },
  { term: "les bagages", meaning: "the luggage" },
  { term: "la valise", meaning: "the suitcase" },
  { term: "voyager", meaning: "to travel" },
  { term: "un voyage", meaning: "a trip / journey" },
  { term: "partir", meaning: "to leave / depart" },
  { term: "arriver", meaning: "to arrive" },
];

export const travelWriting: Skill = {
  id: "g8-fr-w-travel",
  code: "W.5",
  subjectId: "french",
  strandId: "g8-fr-writing",
  grade: 8,
  title: "Writing travel instructions",
  description: "Write formal imperative travel instructions, order travel sentences, choose correct verb forms, and match travel vocabulary to its meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct formal travel instruction.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Formal instructions start with the imperative verb in its '-ez' form.",
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
        hint: "Formal travel instructions use the 'vous' imperative form ending in '-ez'.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each French travel word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'la gare' is for trains, while 'l'aéroport' is for planes.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the formal travel instruction.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: accentAccepted(item.answer),
      inputMode: "text",
      hint: "Picture the travel situation described and think of the imperative verb that fits.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
