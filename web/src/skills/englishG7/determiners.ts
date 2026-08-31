import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DETERMINER_WORDS: { word: string; type: "article" | "possessive" }[] = [
  { word: "a", type: "article" },
  { word: "an", type: "article" },
  { word: "the", type: "article" },
  { word: "my", type: "possessive" },
  { word: "our", type: "possessive" },
  { word: "your", type: "possessive" },
  { word: "his", type: "possessive" },
  { word: "her", type: "possessive" },
  { word: "their", type: "possessive" },
] as const;

const A_AN_POOL: { before: string; word: string; after: string; correct: "a" | "an"; note: string }[] = [
  { before: "The choir uses ", word: "guitar", after: " to accompany the singers.", correct: "a", note: "'Guitar' begins with a consonant sound, so it takes 'a'." },
  { before: "The school has ", word: "orchestra", after: " that performs every term.", correct: "an", note: "'Orchestra' begins with a vowel sound, so it takes 'an'." },
  { before: "The band leader plays ", word: "drum", after: " during the national anthem.", correct: "a", note: "'Drum' begins with a consonant sound, so it takes 'a'." },
  { before: "Every music lesson starts with ", word: "instrument", after: " check by the teacher.", correct: "an", note: "'Instrument' begins with a vowel sound, so it takes 'an'." },
  { before: "The festival will feature ", word: "hour-long", after: " concert of traditional songs.", correct: "an", note: "'Hour' starts with a silent h, so the sound is a vowel sound — it takes 'an'." },
  { before: "She was chosen to join ", word: "university", after: " choir this year.", correct: "a", note: "'University' starts with a 'y' sound even though it is spelt with a vowel, so it takes 'a'." },
  { before: "The class sang ", word: "European", after: " folk song at the festival.", correct: "a", note: "'European' starts with a 'y' sound even though it is spelt with a vowel, so it takes 'a'." },
  { before: "Grandmother owns ", word: "umbrella", after: " decorated with musical notes.", correct: "an", note: "'Umbrella' begins with a vowel sound, so it takes 'an'." },
  { before: "The performance opened with ", word: "one-man", after: " band playing the drums and harmonica together.", correct: "a", note: "'One-man' starts with a 'w' sound, so it takes 'a', even though it is spelt with a vowel." },
  { before: "Every child deserves ", word: "opportunity", after: " to learn music.", correct: "an", note: "'Opportunity' begins with a vowel sound, so it takes 'an'." },
];

const DEFINITE_INDEFINITE_MC: { before: string; after: string; correct: string; distractors: string[]; note: string }[] = [
  { before: "Every child has the right to enjoy ", after: " own culture and music.", correct: "their", distractors: ["a", "an", "the"], note: "'Their' is the possessive that matches 'every child' when referring back to it in a general, inclusive way." },
  { before: "I heard a beautiful song on the radio yesterday. ", after: " song is now my favourite.", correct: "The", distractors: ["A", "An", "Their"], note: "After a thing is mentioned once with 'a', the second mention uses 'the' because it is now specific and known to the listener." },
  { before: "Kenya has ", after: " rich tradition of drumming and dance.", correct: "a", distractors: ["an", "the", "their"], note: "'Rich' begins with a consonant sound, so the indefinite article 'a' is used for a first, general mention." },
  { before: "The choir will perform ", after: " national anthem to open the festival.", correct: "the", distractors: ["a", "an", "their"], note: "There is only one national anthem, so it is a specific, known thing and needs the definite article 'the'." },
  { before: "Musicians from different communities each brought ", after: " own traditional instruments to the festival.", correct: "their", distractors: ["a", "an", "the"], note: "'Their' is the possessive that matches 'musicians', a plural group, showing that each community owns its own instruments." },
  { before: "She wants to learn to play ", after: " instrument, but she has not decided which one yet.", correct: "an", distractors: ["a", "the", "their"], note: "'Instrument' begins with a vowel sound and is still a general, undecided choice, so 'an' is correct." },
];

const POSSESSIVE_FILL: { before: string; after: string; correctAnswer: string; clue: string }[] = [
  { before: "Every child has the right to enjoy ", after: " own culture and music.", correctAnswer: "their", clue: "Fill in the possessive that matches 'every child' in this general statement." },
  { before: "The school choir practised ", after: " new song for the music festival.", correctAnswer: "its", clue: "Fill in the possessive that shows the choir (a group, referred to as 'it') owns the song." },
  { before: "I always carry ", after: " drum to every rehearsal.", correctAnswer: "my", clue: "Fill in the possessive that shows the speaker owns the drum." },
  { before: "Wanjiku and I share ", after: " love of traditional music.", correctAnswer: "our", clue: "Fill in the possessive that shows Wanjiku and the speaker share ownership." },
  { before: "The composer proudly performed ", after: " own composition at the festival.", correctAnswer: "his", clue: "Fill in the possessive that shows the male composer owns the composition." },
  { before: "The singer thanked the audience for supporting ", after: " music career.", correctAnswer: "her", clue: "Fill in the possessive that shows the female singer owns the music career." },
  { before: "Musicians across the county shared ", after: " talents at the national festival.", correctAnswer: "their", clue: "Fill in the possessive that matches 'musicians', which is plural." },
];

const MATCH_POOL: { word: string; label: string }[] = [
  { word: "a", label: "Indefinite article, used before a consonant sound, first mention" },
  { word: "an", label: "Indefinite article, used before a vowel sound, first mention" },
  { word: "the", label: "Definite article, used for something specific or already known" },
  { word: "my", label: "Possessive determiner showing the speaker owns something" },
  { word: "our", label: "Possessive determiner showing shared ownership" },
  { word: "their", label: "Possessive determiner showing plural ownership" },
];

export const determiners: Skill = {
  id: "g7-eng-g-determiners",
  code: "G.10",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Determiners: Articles and Possessives",
  description: "Identify and correctly use articles (a, an, the) and possessives (my, our, your, his, her, their) in texts about music and children's rights to culture.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "a-an", "definite-indefinite-mc", "possessive-fill", "match"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, DETERMINER_WORDS);
      const buckets = [
        { id: "article", label: "Article (a, an, the)" },
        { id: "possessive", label: "Possessive (shows ownership)" },
      ];
      const items = chosen.map((c, i) => ({ id: `d${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`d${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each word as an article or a possessive.",
        items,
        buckets,
        correctBucket,
        hint: "Articles (a, an, the) point out a noun in general. Possessives (my, our, your, his, her, their) show who owns the noun.",
        explanation: chosen.map((c) => `"${c.word}" is a${c.type === "article" ? "n" : ""} ${c.type}.`).join(" "),
      };
    }

    if (branch === "a-an") {
      const entry = randChoice(rng, A_AN_POOL);
      const choices = shuffle(rng, ["a", "an"]);
      return {
        kind: "multiple-choice",
        prompt: `Which article correctly completes this sentence? "${entry.before}___ ${entry.word}${entry.after}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "row",
        hint: "Listen to the SOUND at the start of the next word, not just its spelling — some vowel letters sound like consonants, and some silent letters change the sound.",
        explanation: entry.note,
      };
    }

    if (branch === "definite-indefinite-mc") {
      const entry = randChoice(rng, DEFINITE_INDEFINITE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which word correctly completes this sentence? "${entry.before}___${entry.after}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Decide whether the sentence needs a general first mention (a/an), a specific known thing (the), or ownership (a possessive).",
        explanation: entry.note,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_POOL);
      const tokens = shuffle(rng, chosen.map((c, i) => ({ id: `w${i}`, label: c.word })));
      const targets = shuffle(rng, chosen.map((c, i) => ({ id: `w${i}`, label: c.label })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((c, i) => (correctMap[`w${i}`] = `w${i}`));
      return {
        kind: "click-match",
        prompt: "Match each determiner to how it is used.",
        tokens,
        targets,
        correctMap,
        hint: "Ask: does this word point out a noun in general, or does it show who owns the noun?",
        explanation: chosen.map((c) => `"${c.word}" — ${c.label}.`).join(" "),
      };
    }

    const entry = randChoice(rng, POSSESSIVE_FILL);
    return {
      kind: "fill-blank",
      prompt: entry.clue,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Check who or what owns the noun after the blank, and whether it is singular or plural.",
      explanation: `"${entry.correctAnswer}" fits here: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
