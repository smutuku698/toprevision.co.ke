import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, sortPrompt, orderPrompt, fillPrompt, writingScenarioCloser } from "./g5FrShared";

type Place = "indoor" | "outdoor";

const WORDS: { word: string; meaning: string; place: Place }[] = [
  { word: "chanter", meaning: "to sing", place: "indoor" },
  { word: "danser", meaning: "to dance", place: "indoor" },
  { word: "dessiner", meaning: "to draw", place: "indoor" },
  { word: "regarder la télé", meaning: "to watch TV", place: "indoor" },
  { word: "lire", meaning: "to read", place: "indoor" },
  { word: "écouter de la musique", meaning: "to listen to music", place: "indoor" },
  { word: "nager", meaning: "to swim", place: "outdoor" },
  { word: "jouer au football", meaning: "to play football", place: "outdoor" },
  { word: "faire du vélo", meaning: "to ride a bike", place: "outdoor" },
  { word: "courir", meaning: "to run", place: "outdoor" },
  { word: "jouer au basket", meaning: "to play basketball", place: "outdoor" },
  { word: "grimper aux arbres", meaning: "to climb trees", place: "outdoor" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Dans mon temps libre, j'aime ", after: ".", answer: "chanter", gloss: "Dans mon temps libre, j'aime chanter. — In my free time, I like to sing." },
  { before: "Pour mon temps libre, j'aime ", after: ".", answer: "danser", gloss: "Pour mon temps libre, j'aime danser. — For my free time, I like to dance." },
  { before: "J'aime ", after: " et regarder la télé.", answer: "dessiner", gloss: "J'aime dessiner et regarder la télé. — I like to draw and watch TV." },
  { before: "Je n'aime pas ", after: ".", answer: "nager", gloss: "Je n'aime pas nager. — I don't like to swim." },
  { before: "Je n'aime pas ", after: " au football.", answer: "jouer", gloss: "Je n'aime pas jouer au football. — I don't like to play football." },
  { before: "Qu'est-ce qu'elle ", after: " ? Elle danse.", answer: "fait", gloss: "Qu'est-ce qu'elle fait ? Elle danse. — What is she doing? She is dancing." },
  { before: "Qu'est-ce qu'il fait ? Il ", after: ".", answer: "chante", gloss: "Qu'est-ce qu'il fait ? Il chante. — What is he doing? He is singing." },
  { before: "Dans mon temps libre, j'aime ", after: " de la musique.", answer: "écouter", gloss: "Dans mon temps libre, j'aime écouter de la musique. — In my free time, I like to listen to music." },
  { before: "Pour mon temps libre, j'aime faire du ", after: ".", answer: "vélo", gloss: "Pour mon temps libre, j'aime faire du vélo. — For my free time, I like to ride a bike." },
  { before: "J'aime ", after: " aux arbres.", answer: "grimper", gloss: "J'aime grimper aux arbres. — I like to climb trees." },
  { before: "Je n'aime pas ", after: ".", answer: "courir", gloss: "Je n'aime pas courir. — I don't like to run." },
  { before: "Dans mon temps libre, j'aime jouer au ", after: ".", answer: "basket", gloss: "Dans mon temps libre, j'aime jouer au basket. — In my free time, I like to play basketball." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Dans", "mon", "temps", "libre", ",", "j'aime", "chanter", "."], sentence: "Dans mon temps libre, j'aime chanter." },
  { chunks: ["Je", "n'aime", "pas", "danser", "."], sentence: "Je n'aime pas danser." },
  { chunks: ["Qu'est-ce", "qu'elle", "fait", "?"], sentence: "Qu'est-ce qu'elle fait ?" },
  { chunks: ["Elle", "danse", "."], sentence: "Elle danse." },
  { chunks: ["J'aime", "dessiner", "et", "chanter", "."], sentence: "J'aime dessiner et chanter." },
  { chunks: ["Pour", "mon", "temps", "libre", ",", "j'aime", "nager", "."], sentence: "Pour mon temps libre, j'aime nager." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a text message telling a friend that you like to sing in your free time.",
    correct: "Dans mon temps libre, j'aime chanter.",
    distractors: ["Dans mon temps libre, je n'aime pas chanter.", "Dans mon temps libre, j'aime nager.", "Elle chante dans son temps libre."],
    explanation: "'Dans mon temps libre, j'aime chanter' correctly states you (j'aime, not je n'aime pas) like singing — the other options negate it, swap the hobby, or talk about someone else.",
  },
  {
    note: "You are writing that you specifically dislike swimming, in a form about your hobbies.",
    correct: "Je n'aime pas nager.",
    distractors: ["J'aime nager.", "Je n'aime pas danser.", "Elle n'aime pas nager."],
    explanation: "'Je n'aime pas nager' uses the negation 'ne...pas' correctly to state a dislike — dropping the negation reverses the meaning, and the others change the hobby or the person.",
  },
  {
    note: "You are captioning a photo of your friend dancing, answering the question of what she's doing.",
    correct: "Elle danse.",
    distractors: ["Il danse.", "Elle chante.", "Qu'est-ce qu'elle fait ?"],
    explanation: "'Elle danse' correctly uses 'elle' (she) and the matching action — the other options use the wrong pronoun, the wrong action, or restate the question instead of answering it.",
  },
  {
    note: "You are writing the caption's question first, asking what she is doing in the photo.",
    correct: "Qu'est-ce qu'elle fait ?",
    distractors: ["Qu'est-ce qu'il fait ?", "Elle danse.", "J'aime danser."],
    explanation: "'Qu'est-ce qu'elle fait ?' correctly asks about 'elle' (she) — the other options ask about 'il' (he), answer instead of asking, or state a preference.",
  },
  {
    note: "You are writing that you like both drawing and watching TV, in a hobbies paragraph.",
    correct: "J'aime dessiner et regarder la télé.",
    distractors: ["Je n'aime pas dessiner et regarder la télé.", "J'aime chanter et regarder la télé.", "J'aime dessiner et danser."],
    explanation: "'J'aime dessiner et regarder la télé' names exactly the two hobbies asked for — the other options either negate the sentence or swap in a different hobby.",
  },
  {
    note: "You are describing your dislike of playing football, in a short paragraph about hobbies you avoid.",
    correct: "Je n'aime pas jouer au football.",
    distractors: ["J'aime jouer au football.", "Je n'aime pas jouer au basket.", "Il n'aime pas jouer au football."],
    explanation: "'Je n'aime pas jouer au football' correctly negates the specific hobby named — the other options drop the negation, swap the sport, or change the person.",
  },
  {
    note: "You are writing that, for your free time, you like to ride a bike.",
    correct: "Pour mon temps libre, j'aime faire du vélo.",
    distractors: ["Pour mon temps libre, je n'aime pas faire du vélo.", "Pour mon temps libre, j'aime courir.", "Elle aime faire du vélo."],
    explanation: "'Pour mon temps libre, j'aime faire du vélo' correctly states your own liking for cycling — the other options negate it, swap the hobby, or talk about someone else.",
  },
  {
    note: "You are writing that in your free time you like to listen to music.",
    correct: "Dans mon temps libre, j'aime écouter de la musique.",
    distractors: ["Dans mon temps libre, je n'aime pas écouter de la musique.", "Dans mon temps libre, j'aime regarder la télé.", "J'aime écouter de la musique et nager."],
    explanation: "'Dans mon temps libre, j'aime écouter de la musique' names exactly the hobby asked for — negating it or swapping the activity changes the meaning.",
  },
  {
    note: "You are captioning a photo of your friend singing, answering what he is doing.",
    correct: "Qu'est-ce qu'il fait ? Il chante.",
    distractors: ["Qu'est-ce qu'elle fait ? Il chante.", "Qu'est-ce qu'il fait ? Il danse.", "Il n'aime pas chanter."],
    explanation: "'Qu'est-ce qu'il fait ? Il chante.' correctly matches the pronoun 'il' throughout and names singing — mismatching the pronoun or the action breaks the answer.",
  },
  {
    note: "You are writing that you like to climb trees during your free time.",
    correct: "J'aime grimper aux arbres.",
    distractors: ["Je n'aime pas grimper aux arbres.", "J'aime jouer au football.", "Elle aime grimper aux arbres."],
    explanation: "'J'aime grimper aux arbres' correctly states your own liking for this activity — the other options negate it, swap the hobby, or talk about someone else.",
  },
  {
    note: "You are writing that you dislike running, in a short survey about hobbies.",
    correct: "Je n'aime pas courir.",
    distractors: ["J'aime courir.", "Je n'aime pas nager.", "Il n'aime pas courir."],
    explanation: "'Je n'aime pas courir' correctly negates the exact activity asked about — the other options drop the negation, swap the activity, or change the person.",
  },
  {
    note: "You are writing that, in your free time, you like to play basketball.",
    correct: "Dans mon temps libre, j'aime jouer au basket.",
    distractors: ["Dans mon temps libre, je n'aime pas jouer au basket.", "Dans mon temps libre, j'aime jouer au football.", "Elle aime jouer au basket."],
    explanation: "'Dans mon temps libre, j'aime jouer au basket' correctly names basketball as a liked activity — the other options negate it, swap the sport, or change the person.",
  },
];

export const funWriting: Skill = {
  id: "g5-fr-w-fun",
  code: "W.5",
  subjectId: "french",
  strandId: "g5-fr-writing",
  grade: 5,
  title: "Fun and enjoyment: hobbies",
  description: "Guided writing about hobbies and free time, using 'aimer + infinitif', the negative 'je + ne + verbe + pas', and 'Qu'est-ce qu'il/elle fait ?'.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "written French hobby word or phrase to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Most hobby words here are infinitive verbs — 'to sing', 'to dance', and so on.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const indoor = shuffle(rng, WORDS.filter((p) => p.place === "indoor")).slice(0, 3);
      const outdoor = shuffle(rng, WORDS.filter((p) => p.place === "outdoor")).slice(0, 3);
      const items = shuffle(rng, [...indoor, ...outdoor]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.place;

      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each hobby is usually done Indoors or Outdoors"),
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "indoor", label: "Indoors" },
          { id: "outdoor", label: "Outdoors" },
        ],
        correctBucket,
        hint: "Think about whether you'd normally do this hobby inside a room or out in the open.",
        explanation: [...indoor, ...outdoor]
          .map((p) => `"${p.word}" is usually done ${p.place === "indoor" ? "indoors" : "outdoors"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Check whether the sentence is stating a liking, a dislike, or answering 'What is she/he doing?'.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words/phrases to write a correct French sentence about hobbies"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Je n'aime pas' wraps around the verb: ne comes before it, pas comes after.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} ${writingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check whether the scenario needs a liking, a dislike, or the matching pronoun for who is doing it.",
      explanation: s.explanation,
    };
  },
};
