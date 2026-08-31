import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { name, matchPrompt, sortPrompt, orderPrompt, fillPrompt, speakingScenarioCloser } from "./g5FrShared";

type Tag = "active" | "calm";

const HOBBIES: { infinitive: string; conjugated: string; meaning: string; tag: Tag }[] = [
  { infinitive: "chanter", conjugated: "chante", meaning: "to sing", tag: "calm" },
  { infinitive: "danser", conjugated: "danse", meaning: "to dance", tag: "active" },
  { infinitive: "dessiner", conjugated: "dessine", meaning: "to draw", tag: "calm" },
  { infinitive: "nager", conjugated: "nage", meaning: "to swim", tag: "active" },
  { infinitive: "jouer au foot", conjugated: "joue au foot", meaning: "to play football", tag: "active" },
  { infinitive: "faire du vélo", conjugated: "fait du vélo", meaning: "to cycle", tag: "active" },
  { infinitive: "sauter à la corde", conjugated: "saute à la corde", meaning: "to skip rope", tag: "active" },
  { infinitive: "jouer aux jeux vidéo", conjugated: "joue aux jeux vidéo", meaning: "to play video games", tag: "calm" },
  { infinitive: "peindre", conjugated: "peint", meaning: "to paint", tag: "calm" },
  { infinitive: "écouter de la musique", conjugated: "écoute de la musique", meaning: "to listen to music", tag: "calm" },
  { infinitive: "regarder la télé", conjugated: "regarde la télé", meaning: "to watch television", tag: "calm" },
  { infinitive: "lire", conjugated: "lit", meaning: "to read", tag: "calm" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Dans mon temps libre, j'aime ", after: ".", answer: "chanter", gloss: "Dans mon temps libre, j'aime chanter. — In my free time, I like to sing." },
  { before: "Dans mon temps libre, j'aime ", after: ".", answer: "danser", gloss: "Dans mon temps libre, j'aime danser. — In my free time, I like to dance." },
  { before: "Je n'aime pas ", after: ".", answer: "nager", gloss: "Je n'aime pas nager. — I don't like to swim." },
  { before: "Qu'est-ce qu'il ", after: " ? Il chante.", answer: "fait", gloss: "Qu'est-ce qu'il fait ? Il chante. — What is he doing? He sings." },
  { before: "Qu'est-ce qu'elle fait ? Elle ", after: ".", answer: "danse", gloss: "Qu'est-ce qu'elle fait ? Elle danse. — What is she doing? She dances." },
  { before: "Il ", after: " au foot.", answer: "joue", gloss: "Il joue au foot. — He plays football." },
  { before: "Elle fait du ", after: ".", answer: "vélo", gloss: "Elle fait du vélo. — She cycles." },
  { before: "Pour mon temps libre, j'aime ", after: " de la musique.", answer: "écouter", gloss: "Pour mon temps libre, j'aime écouter de la musique. — In my free time, I like to listen to music." },
  { before: "Il aime ", after: " la télé.", answer: "regarder", gloss: "Il aime regarder la télé. — He likes to watch television." },
  { before: "Elle aime ", after: ".", answer: "lire", gloss: "Elle aime lire. — She likes to read." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Dans", "mon", "temps", "libre,", "j'aime", "danser", "."], sentence: "Dans mon temps libre, j'aime danser." },
  { chunks: ["Je", "n'aime", "pas", "nager", "."], sentence: "Je n'aime pas nager." },
  { chunks: ["Qu'est-ce", "qu'il", "fait", "?"], sentence: "Qu'est-ce qu'il fait ?" },
  { chunks: ["Elle", "aime", "lire", "."], sentence: "Elle aime lire." },
  { chunks: ["Il", "joue", "au", "foot", "."], sentence: "Il joue au foot." },
];

const SCENARIOS: { situation: (n: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} asks what you love doing when you have free time, and it's singing.`,
    correct: "Dans mon temps libre, j'aime chanter.",
    distractors: ["Je n'aime pas chanter.", "Dans mon temps libre, j'aime nager.", "Il chante."],
    explanation: "'Dans mon temps libre, j'aime chanter' states your own liked hobby with 'j'aime' — the others deny it, name a different hobby, or talk about someone else.",
  },
  {
    situation: (n) => `${n} asks about a hobby you really dislike, and you can't stand swimming.`,
    correct: "Je n'aime pas nager.",
    distractors: ["J'aime nager.", "Je n'aime pas danser.", "Elle nage."],
    explanation: "'Je n'aime pas nager' uses the negation 'ne...pas' to say you dislike swimming — the others say the opposite or name a different hobby.",
  },
  {
    situation: (n) => `${n} points at a boy across the room and asks what he's doing — he is dancing.`,
    correct: "Il danse.",
    distractors: ["Elle danse.", "Il chante.", "Qu'est-ce qu'il fait ?"],
    explanation: "'Il danse' uses 'il' for a boy and names dancing — 'Elle' would be wrong for a boy.",
  },
  {
    situation: (n) => `${n} points at a girl and asks what she's doing — she is drawing.`,
    correct: "Elle dessine.",
    distractors: ["Il dessine.", "Elle chante.", "Elle nage."],
    explanation: "'Elle dessine' uses 'elle' for a girl and names drawing — 'Il' would be wrong for a girl.",
  },
  {
    situation: (n) => `${n} asks you to name what game a boy is playing on the field — football.`,
    correct: "Il joue au foot.",
    distractors: ["Elle joue au foot.", "Il fait du vélo.", "Il nage."],
    explanation: "'Il joue au foot' names football specifically — cycling and swimming are different activities entirely.",
  },
  {
    situation: (n) => `${n} asks what a girl is doing while riding around the yard — cycling.`,
    correct: "Elle fait du vélo.",
    distractors: ["Il fait du vélo.", "Elle joue au foot.", "Elle nage."],
    explanation: "'Elle fait du vélo' uses 'elle' plus 'fait du vélo' for cycling — the other options name a different activity or the wrong gender.",
  },
  {
    situation: (n) => `${n} asks what you like doing with headphones on, and it's listening to music.`,
    correct: "J'aime écouter de la musique.",
    distractors: ["J'aime regarder la télé.", "Je n'aime pas écouter de la musique.", "Il écoute de la musique."],
    explanation: "'J'aime écouter de la musique' states your own liked activity of listening to music — the others name a different activity, deny it, or talk about someone else.",
  },
  {
    situation: (n) => `${n} asks what you enjoy in the evening in front of the screen, and it's watching television.`,
    correct: "J'aime regarder la télé.",
    distractors: ["J'aime écouter de la musique.", "Je n'aime pas regarder la télé.", "Elle regarde la télé."],
    explanation: "'J'aime regarder la télé' states your own liked activity — the others name a different activity, deny it, or talk about someone else.",
  },
  {
    situation: (n) => `${n} asks what a boy with a paintbrush and canvas is doing — painting.`,
    correct: "Il peint.",
    distractors: ["Elle peint.", "Il dessine.", "Il chante."],
    explanation: "'Il peint' names painting for a boy — drawing and singing are different activities entirely.",
  },
  {
    situation: (n) => `${n} asks what you enjoy doing with a good story, and it's reading.`,
    correct: "J'aime lire.",
    distractors: ["Je n'aime pas lire.", "J'aime dessiner.", "Elle lit."],
    explanation: "'J'aime lire' states your own liked activity of reading — the others deny it, name a different activity, or talk about someone else.",
  },
  {
    situation: (n) => `${n} sees a girl at the pool splashing about and asks what she's doing.`,
    correct: "Elle nage.",
    distractors: ["Il nage.", "Elle danse.", "Elle joue au foot."],
    explanation: "'Elle nage' uses 'elle' for a girl and names swimming — the other options name the wrong gender or a different activity.",
  },
  {
    situation: (n) => `${n} asks what a girl skipping in the playground is doing.`,
    correct: "Elle saute à la corde.",
    distractors: ["Elle fait du vélo.", "Elle nage.", "Il saute à la corde."],
    explanation: "'Elle saute à la corde' names skipping rope for a girl — the other options name a different activity or the wrong gender.",
  },
];

export const funSpeaking: Skill = {
  id: "g5-fr-ls-fun",
  code: "LS.5",
  subjectId: "french",
  strandId: "g5-fr-listening-speaking",
  grade: 5,
  title: "Hobbies and free time",
  description: "Talking about liked and disliked hobbies with 'j'aime'/'je n'aime pas', and describing what someone else is doing with 'il/elle' — practiced through matching, sorting, and speaking scenarios.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, HOBBIES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.infinitive, label: p.infinitive })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.infinitive, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.infinitive] = p.infinitive;

      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "French hobby verb/phrase to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Active hobbies involve movement; calm hobbies can be done sitting still.",
        explanation: chosen.map((p) => `"${p.infinitive}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const active = shuffle(rng, HOBBIES.filter((p) => p.tag === "active")).slice(0, 4);
      const calm = shuffle(rng, HOBBIES.filter((p) => p.tag === "calm")).slice(0, 4);
      const items = shuffle(rng, [...active, ...calm]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.infinitive] = p.tag;

      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "each hobby as Active or Calm"),
        items: items.map((p) => ({ id: p.infinitive, label: p.infinitive })),
        buckets: [
          { id: "active", label: "Active" },
          { id: "calm", label: "Calm" },
        ],
        correctBucket,
        hint: "Active hobbies get your body moving; calm hobbies you can do sitting down.",
        explanation: [...active, ...calm]
          .map((p) => `"${p.infinitive}" is ${p.tag === "active" ? "an active" : "a calm"} hobby.`)
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
        hint: "Think about the 'Dans mon temps libre, j'aime… je n'aime pas…' or 'Qu'est-ce qu'il/elle fait ?' pattern.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to form a correct French sentence about hobbies"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'J'aime'/'Je n'aime pas' is usually followed directly by the hobby verb.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const n = name(rng);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(n)} ${speakingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check whether the sentence is about you ('j'aime') or someone else ('il/elle'), and which hobby fits.",
      explanation: s.explanation,
    };
  },
};
