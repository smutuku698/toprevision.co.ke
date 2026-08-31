import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Sound = "/p/" | "/b/" | "/k/" | "/g/";

const SOUND_WORDS: { word: string; sound: Sound }[] = [
  { word: "pot", sound: "/p/" },
  { word: "paper", sound: "/p/" },
  { word: "path", sound: "/p/" },
  { word: "boy", sound: "/b/" },
  { word: "banana", sound: "/b/" },
  { word: "boat", sound: "/b/" },
  { word: "cat", sound: "/k/" },
  { word: "kite", sound: "/k/" },
  { word: "candle", sound: "/k/" },
  { word: "goat", sound: "/g/" },
  { word: "garden", sound: "/g/" },
  { word: "gate", sound: "/g/" },
];

const MINIMAL_PAIRS: { short: string; shortClue: string; long: string; longClue: string }[] = [
  { short: "ship", shortClue: "A large vessel that carries cargo across the ocean is called a ___.", long: "sheep", longClue: "The farmer keeps a flock of woolly ___ on the hillside." },
  { short: "bit", shortClue: "A small piece broken off something is called a ___.", long: "beat", longClue: "The drummer kept a steady ___ throughout the song." },
  { short: "fill", shortClue: "Please ___ the bucket with water.", long: "feel", longClue: "I ___ excited about the school trip." },
  { short: "sit", shortClue: "Please ___ down quietly at your desk.", long: "seat", longClue: "Excuse me, is this ___ taken?" },
  { short: "chip", shortClue: "He broke off a small ___ of wood while carving.", long: "cheap", longClue: "The mangoes at this market are very ___." },
  { short: "live", shortClue: "Where do you ___ ?", long: "leave", longClue: "Please ___ your shoes at the door." },
];

const STRESS_PAIRS: { word: string; nounSentence: string; verbSentence: string; nounMeaning: string; verbMeaning: string }[] = [
  { word: "project", nounSentence: "The PROject was completed ahead of schedule.", verbSentence: "They plan to proJECT the school's results on the big screen.", nounMeaning: "a planned piece of work (noun)", verbMeaning: "to display or throw forward (verb)" },
  { word: "record", nounSentence: "She set a new REcord in the 400-metre race.", verbSentence: "Please reCORD the meeting so we can review it later.", nounMeaning: "something written down or a best achievement (noun)", verbMeaning: "to write down or capture sound or video (verb)" },
  { word: "present", nounSentence: "He received a lovely PREsent for his birthday.", verbSentence: "The pupils will preSENT their project tomorrow.", nounMeaning: "a gift, or the current time (noun)", verbMeaning: "to show or give formally (verb)" },
  { word: "object", nounSentence: "The teacher picked up an OBject from the table.", verbSentence: "Some parents may obJECT to the new school rule.", nounMeaning: "a thing that can be seen or touched (noun)", verbMeaning: "to express disagreement (verb)" },
  { word: "conduct", nounSentence: "His good CONduct earned him a prize.", verbSentence: "The choir teacher will conDUCT the singing practice.", nounMeaning: "behaviour (noun)", verbMeaning: "to direct or lead (verb)" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why can the position of stress in a word like 'record' change its meaning?",
    correct: "English speakers use stress patterns to signal whether a word is being used as a noun or a verb",
    distractors: ["Stress never affects the meaning of a word", "Stress only matters when a word is written down", "Changing the stress always changes the spelling of the word"],
  },
  {
    q: "Why is it important to articulate consonant sounds like /p/, /b/, /k/, and /g/ clearly?",
    correct: "Clear consonant sounds help listeners tell similar-sounding words apart and understand speech accurately",
    distractors: ["These sounds are not important for clear speech", "Consonants only matter in written English", "Mispronouncing consonants never causes confusion"],
  },
];

export const soundsAndWordStress: Skill = {
  id: "g7-eng-ls-sounds-and-word-stress",
  code: "LS.5",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Pronunciation: Sounds and Word Stress",
  description: "Identify and articulate the consonant sounds /p/, /b/, /k/, /g/ and the short and long /i/ sounds, and distinguish word meaning based on stress.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "fill-vowel", "match-stress", "mc-stress", "concept"] as const);
    const hint = "Listen carefully to where a word's stress falls, and articulate each sound clearly so words are not confused with similar ones.";

    if (branch === "categorize") {
      const sounds: Sound[] = ["/p/", "/b/", "/k/", "/g/"];
      const chosen = sounds.flatMap((s) => shuffle(rng, SOUND_WORDS.filter((w) => w.sound === s)).slice(0, 2));
      const shuffled = shuffle(rng, chosen);
      const items = shuffled.map((w, i) => ({ id: `w${i}`, label: w.word }));
      const correctBucket: Record<string, string> = {};
      shuffled.forEach((w, i) => (correctBucket[`w${i}`] = w.sound));
      return {
        kind: "categorize",
        prompt: "Sort each word by the consonant sound it begins with: /p/, /b/, /k/, or /g/.",
        items,
        buckets: sounds.map((s) => ({ id: s, label: `Words with the ${s} sound` })),
        correctBucket,
        hint,
        explanation: shuffled.map((w) => `"${w.word}" begins with the ${w.sound} sound.`).join(" "),
      };
    }

    if (branch === "fill-vowel") {
      const entry = randChoice(rng, MINIMAL_PAIRS);
      const useShort = rng() < 0.5;
      const clue = useShort ? entry.shortClue : entry.longClue;
      const answer = useShort ? entry.short : entry.long;
      const [before, after] = clue.split("___");
      return {
        kind: "fill-blank",
        prompt: "Fill in the word that best completes the sentence.",
        before,
        after,
        correctAnswer: answer,
        inputMode: "text",
        hint: useShort
          ? "This word uses the short /ɪ/ sound, as in 'ship'."
          : "This word uses the long /iː/ sound, as in 'sheep'.",
        explanation: `The answer is "${answer}", which uses the ${useShort ? "short /ɪ/" : "long /iː/"} sound.`,
      };
    }

    if (branch === "match-stress") {
      const chosen = shuffle(rng, STRESS_PAIRS).slice(0, 3);
      const tokens = shuffle(rng, chosen.flatMap((p) => [
        { id: `${p.word}-n`, label: p.word.toUpperCase().slice(0, 1) + p.word.slice(1) + " (as a noun)" },
        { id: `${p.word}-v`, label: p.word + " (as a verb)" },
      ]));
      const targets = shuffle(rng, chosen.flatMap((p) => [
        { id: `${p.word}-n`, label: p.nounMeaning },
        { id: `${p.word}-v`, label: p.verbMeaning },
      ]));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) {
        correctMap[`${p.word}-n`] = `${p.word}-n`;
        correctMap[`${p.word}-v`] = `${p.word}-v`;
      }
      return {
        kind: "click-match",
        prompt: "Match each word form to its correct meaning. The stress placement changes whether the word is a noun or a verb.",
        tokens,
        targets,
        correctMap,
        hint: "The noun form is usually stressed on the first syllable; the verb form is usually stressed on the second syllable.",
        explanation: chosen.map((p) => `"${p.word}" as a noun means ${p.nounMeaning}; as a verb it means ${p.verbMeaning}.`).join(" "),
      };
    }

    if (branch === "mc-stress") {
      const entry = randChoice(rng, STRESS_PAIRS);
      const useNoun = rng() < 0.5;
      const sentence = useNoun ? entry.nounSentence : entry.verbSentence;
      const correct = useNoun ? `Stress on the first syllable — ${entry.nounMeaning}` : `Stress on the second syllable — ${entry.verbMeaning}`;
      const wrong = useNoun ? `Stress on the second syllable — ${entry.verbMeaning}` : `Stress on the first syllable — ${entry.nounMeaning}`;
      const choices = shuffle(rng, [correct, wrong]);
      return {
        kind: "multiple-choice",
        prompt: `Read this sentence: "${sentence}" Which stress pattern matches how "${entry.word}" is used here?`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "Check whether the word is naming a thing (noun) or describing an action (verb) in the sentence.",
        explanation: `In this sentence, "${entry.word}" is used as a ${useNoun ? "noun" : "verb"}, so the correct pattern is: ${correct}`,
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
