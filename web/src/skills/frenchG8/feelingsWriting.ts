import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Je me sens ", after: " aujourd'hui, je n'ai pas assez dormi.", answer: "fatigué" },
  { before: "Il est ", after: " parce qu'il a perdu son chat.", answer: "triste" },
  { before: "Il a mal à la ", after: " ; il a trop réfléchi pendant l'examen.", answer: "tête" },
  { before: "Nous sommes ", after: " par la bonne nouvelle ; nous ne l'attendions pas.", answer: "surpris" },
  { before: "Mon frère est ", after: " ; il crie très fort après son ami.", answer: "en colère" },
  { before: "J'ai mal aux ", after: " après le match de football.", answer: "pieds" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Comment te sens-tu", "aujourd'hui", "?"], sentence: "Comment te sens-tu aujourd'hui ?" },
  { chunks: ["Je me sens", "très", "heureux."], sentence: "Je me sens très heureux." },
  { chunks: ["Elle a", "mal", "à la tête."], sentence: "Elle a mal à la tête." },
  { chunks: ["Il est", "fatigué", "après le travail."], sentence: "Il est fatigué après le travail." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct feminine form to complete: 'Ma sœur est ___.' (happy)",
    correct: "heureuse",
    distractors: ["heureux", "heureuxe", "heureu"],
    explanation: "Masculine 'heureux' becomes feminine 'heureuse' — the '-x' changes to '-se'.",
  },
  {
    prompt: "Choose the correct feminine form to complete: 'Elle est ___.' (worried)",
    correct: "inquiète",
    distractors: ["inquiet", "inquièt", "inquiete"],
    explanation: "Masculine 'inquiet' becomes feminine 'inquiète', adding a grave accent on the final 'e'.",
  },
  {
    prompt: "Choose the correct masculine form to complete: 'Mon frère est ___.' (frightened)",
    correct: "effrayé",
    distractors: ["effrayée", "effrayés", "effrayer"],
    explanation: "The masculine singular form is 'effrayé', without the extra 'e' used for feminine agreement.",
  },
  {
    prompt: "Choose the correct word to complete: 'J'ai mal aux ___.' (hands)",
    correct: "mains",
    distractors: ["main", "pieds", "yeux"],
    explanation: "'Mains' (hands) is plural and feminine; 'aux' is used before plural nouns.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "content(e)", meaning: "happy / pleased" },
  { term: "triste", meaning: "sad" },
  { term: "fatigué(e)", meaning: "tired" },
  { term: "en colère", meaning: "angry" },
  { term: "inquiet / inquiète", meaning: "worried" },
  { term: "surpris(e)", meaning: "surprised" },
  { term: "heureux / heureuse", meaning: "happy" },
  { term: "effrayé(e)", meaning: "frightened" },
  { term: "la tête", meaning: "the head" },
  { term: "le cœur", meaning: "the heart" },
];

export const feelingsWriting: Skill = {
  id: "g8-fr-w-feelings",
  code: "W.7",
  subjectId: "french",
  strandId: "g8-fr-writing",
  grade: 8,
  title: "Writing about feelings and emotions",
  description: "Write sentences about feelings and body parts, order sentences, choose correctly agreeing adjectives, and match emotion words to their meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about feelings.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject usually comes first, then the verb, then the rest of the sentence.",
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
        hint: "Emotion adjectives must agree in gender with the person they describe.",
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
        prompt: "Match each French feelings/body word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'inquiet' and 'effrayé' both describe fear or worry, but they aren't identical.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Read the situation and fill in the missing word about feelings or the body.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: accentAccepted(item.answer),
      inputMode: "text",
      hint: "Think about how the situation described would make someone feel.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
