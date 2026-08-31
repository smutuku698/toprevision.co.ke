import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "sport" | "game";

const WORDS: { word: string; meaning: string; tag: Tag; article: string }[] = [
  { word: "le football", meaning: "football/soccer", tag: "sport", article: "au" },
  { word: "le basketball", meaning: "basketball", tag: "sport", article: "au" },
  { word: "le rugby", meaning: "rugby", tag: "sport", article: "au" },
  { word: "le tennis", meaning: "tennis", tag: "sport", article: "au" },
  { word: "le volleyball", meaning: "volleyball", tag: "sport", article: "au" },
  { word: "le netball", meaning: "netball", tag: "sport", article: "au" },
  { word: "le badminton", meaning: "badminton", tag: "sport", article: "au" },
  { word: "les cartes", meaning: "cards", tag: "game", article: "aux" },
  { word: "les échecs", meaning: "chess", tag: "game", article: "aux" },
  { word: "les dames", meaning: "draughts/checkers", tag: "game", article: "aux" },
  { word: "la marelle", meaning: "hopscotch", tag: "game", article: "à la" },
  { word: "la corde à sauter", meaning: "skipping rope", tag: "game", article: "à la" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Je joue ", after: " football tous les samedis.", answer: "au", gloss: "Je joue au football tous les samedis. — I play football every Saturday." },
  { before: "Tu joues ", after: " cartes avec ta sœur ?", answer: "aux", gloss: "Tu joues aux cartes avec ta sœur ? — Do you play cards with your sister?" },
  { before: "Nous jouons ", after: " marelle à la récréation.", answer: "à la", gloss: "Nous jouons à la marelle à la récréation. — We play hopscotch at break time." },
  { before: "Il joue ", after: " basketball après les cours.", answer: "au", gloss: "Il joue au basketball après les cours. — He plays basketball after class." },
  { before: "Elles jouent ", after: " échecs le week-end.", answer: "aux", gloss: "Elles jouent aux échecs le week-end. — They (f) play chess on the weekend." },
  { before: "Je joue ", after: " tennis avec mon ami.", answer: "au", gloss: "Je joue au tennis avec mon ami. — I play tennis with my friend." },
  { before: "Vous jouez ", after: " dames pendant les vacances ?", answer: "aux", gloss: "Vous jouez aux dames pendant les vacances ? — Do you play draughts during the holidays?" },
  { before: "Ma sœur joue ", after: " corde à sauter dans la cour.", answer: "à la", gloss: "Ma sœur joue à la corde à sauter dans la cour. — My sister plays skipping rope in the yard." },
  { before: "Nous jouons ", after: " netball à l'école.", answer: "au", gloss: "Nous jouons au netball à l'école. — We play netball at school." },
  { before: "Ils jouent ", after: " rugby le samedi.", answer: "au", gloss: "Ils jouent au rugby le samedi. — They play rugby on Saturdays." },
  { before: "Tu joues ", after: " volleyball avec tes amis ?", answer: "au", gloss: "Tu joues au volleyball avec tes amis ? — Do you play volleyball with your friends?" },
  { before: "Elle joue ", after: " badminton chaque semaine.", answer: "au", gloss: "Elle joue au badminton chaque semaine. — She plays badminton every week." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je", "joue", "au", "football", "."], sentence: "Je joue au football." },
  { chunks: ["Tu", "joues", "aux", "cartes", "."], sentence: "Tu joues aux cartes." },
  { chunks: ["Nous", "jouons", "à", "la", "marelle", "."], sentence: "Nous jouons à la marelle." },
  { chunks: ["J'aime", "jouer", "au", "basketball", "."], sentence: "J'aime jouer au basketball." },
  { chunks: ["Mon", "sport", "préféré", "est", "le", "tennis", "."], sentence: "Mon sport préféré est le tennis." },
  { chunks: ["Elle", "joue", "aux", "échecs", "avec", "son", "père", "."], sentence: "Elle joue aux échecs avec son père." },
];

const NAMES = ["Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno", "Wanjiru", "Kiptoo", "Achieng", "Mumbi", "Kamau", "Wafula"];

const SCENARIOS: { situation: (name: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} asks what sport you play every Saturday.`,
    correct: "Je joue au football tous les samedis.",
    distractors: ["Je joue aux football tous les samedis.", "Je joue à football tous les samedis.", "Je joue le football tous les samedis."],
    explanation: "'jouer à' + 'le football' contracts to 'au football' — 'aux' is for plural nouns, and dropping the contraction or using 'le' directly is incorrect.",
  },
  {
    situation: (n) => `${n} asks if you play cards with your sister.`,
    correct: "Je joue aux cartes avec ma sœur.",
    distractors: ["Je joue au cartes avec ma sœur.", "Je joue à la cartes avec ma sœur.", "Je joue les cartes avec ma sœur."],
    explanation: "'cartes' is plural, so 'à' + 'les' contracts to 'aux' — 'au' and 'à la' are for singular nouns, so they don't match.",
  },
  {
    situation: (n) => `${n} asks what game the girls play during break time.`,
    correct: "Elles jouent à la marelle à la récréation.",
    distractors: ["Elles jouent au marelle à la récréation.", "Elles jouent aux marelle à la récréation.", "Elles jouent la marelle à la récréation."],
    explanation: "'la marelle' is feminine singular, so it takes 'à la' — 'au' and 'aux' are for masculine or plural nouns and don't match.",
  },
  {
    situation: (n) => `${n} shows a photo of your class playing chess and asks what they're doing.`,
    correct: "Nous jouons aux échecs.",
    distractors: ["Nous jouons au échecs.", "Nous jouons à échecs.", "Nous jouons les échecs."],
    explanation: "'les échecs' is plural, so it takes 'aux' — dropping the contraction or using the singular form 'au' is incorrect.",
  },
  {
    situation: (n) => `${n} asks you to say which game is your favourite: netball.`,
    correct: "Mon jeu préféré est le netball.",
    distractors: ["Mon jeu préféré est la netball.", "Mon jeu préféré est les netball.", "Mon jeu préféré est jouer netball."],
    explanation: "'le netball' is masculine singular — using the feminine or plural article, or the infinitive 'jouer', does not match how the sport's name is stated.",
  },
  {
    situation: (n) => `${n} asks about a sports personality you admire, and you want to say she plays basketball very well.`,
    correct: "Elle joue très bien au basketball.",
    distractors: ["Elle joue très bien aux basketball.", "Elle joue très bien à basketball.", "Elle joue très bien le basketball."],
    explanation: "'le basketball' is singular, so it takes 'au' — 'aux' is for plurals, and dropping the contraction is incorrect.",
  },
  {
    situation: (n) => `${n} asks whether your brother plays draughts with his grandfather every Sunday.`,
    correct: "Mon frère joue aux dames avec son grand-père chaque dimanche.",
    distractors: ["Mon frère joue au dames avec son grand-père chaque dimanche.", "Mon frère joue à la dames avec son grand-père chaque dimanche.", "Mon frère joue les dames avec son grand-père chaque dimanche."],
    explanation: "'les dames' is plural, so it takes 'aux' — 'au' and 'à la' are for singular nouns and don't match.",
  },
  {
    situation: (n) => `${n} asks what you enjoy playing during break time.`,
    correct: "J'aime jouer à la corde à sauter à la récréation.",
    distractors: ["J'aime jouer au corde à sauter à la récréation.", "J'aime jouer aux corde à sauter à la récréation.", "J'aime jouer la corde à sauter à la récréation."],
    explanation: "'la corde à sauter' is feminine singular, so it takes 'à la' — 'au' and 'aux' are for masculine or plural nouns.",
  },
  {
    situation: (n) => `${n} asks what sport you play on Saturdays for the sports-day sign-up sheet.`,
    correct: "Je joue au rugby le samedi.",
    distractors: ["Je joue aux rugby le samedi.", "Je joue à rugby le samedi.", "Je joue le rugby le samedi."],
    explanation: "'le rugby' is masculine singular, so it takes 'au' — 'aux' is for plurals, and dropping the contraction is incorrect.",
  },
  {
    situation: (n) => `${n} asks a class survey question, and you want to answer that tennis is your favourite sport.`,
    correct: "Mon sport préféré est le tennis.",
    distractors: ["Mon sport préféré est au tennis.", "Mon sport préféré est jouer tennis.", "Mon jeu préféré est le tennis."],
    explanation: "When naming a sport as a favorite (not playing it), it takes 'le', not 'au' — and 'jeu' names a game, not the correct category word for tennis.",
  },
  {
    situation: (n) => `${n} asks whether your whole class plays volleyball together on Fridays.`,
    correct: "Toute la classe joue au volleyball le vendredi.",
    distractors: ["Toute la classe joue aux volleyball le vendredi.", "Toute la classe joue à volleyball le vendredi.", "Toute la classe joue le volleyball le vendredi."],
    explanation: "'le volleyball' is masculine singular, so it takes 'au' — 'aux' is for plurals, and dropping the contraction is incorrect.",
  },
  {
    situation: (n) => `${n} watched a badminton match with you and asks how the players play.`,
    correct: "Les joueurs jouent très vite au badminton.",
    distractors: ["Les joueurs jouent très vite aux badminton.", "Les joueurs jouent très vite à badminton.", "Les joueurs jouent très vite le badminton."],
    explanation: "'le badminton' is masculine singular, so it takes 'au' — 'aux' is for plurals, and dropping the contraction is incorrect.",
  },
];

export const funSpeaking: Skill = {
  id: "g6-fr-ls-fun",
  code: "LS.5",
  subjectId: "french",
  strandId: "g6-fr-listening-speaking",
  grade: 6,
  title: "Sports and games",
  description: "Vocabulary for sports and games, practicing the 'jouer à/au/aux' structure and talking about preferences.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each spoken French sport or game to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Sports are usually played with a ball on a field or court; games are often played sitting down.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const sports = shuffle(rng, WORDS.filter((p) => p.tag === "sport")).slice(0, 3);
      const games = shuffle(rng, WORDS.filter((p) => p.tag === "game")).slice(0, 3);
      const items = shuffle(rng, [...sports, ...games]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Sport or a Game.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "sport", label: "Sport" },
          { id: "game", label: "Game" },
        ],
        correctBucket,
        hint: "Sports involve running or physical teams; games like cards or chess are usually played seated.",
        explanation: [...sports, ...games]
          .map((p) => `"${p.word}" is a ${p.tag === "sport" ? "sport" : "game"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word ('au', 'aux', or 'à la') to complete the spoken sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Check if the sport or game word is masculine singular (au), feminine singular (à la), or plural (aux).",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to say a correct French sentence about sports and games.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject comes first, then the conjugated verb, then 'à/au/aux/à la' plus the sport or game.",
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
      hint: "Check the sport/game named and whether 'au', 'aux', or 'à la' correctly matches its gender and number.",
      explanation: s.explanation,
    };
  },
};
