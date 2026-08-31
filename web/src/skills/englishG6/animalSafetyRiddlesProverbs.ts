import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedB";

// Theme 8 vocabulary, verbatim from curriculum-reference/grade-6/english.json (The Farm - Animal Safety and Care).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "veterinary", meaning: "relating to the treatment of sick or injured animals" },
  { word: "poisonous", meaning: "containing a substance that can cause harm or death" },
  { word: "cruel", meaning: "causing pain or suffering deliberately" },
  { word: "brand", meaning: "to mark livestock with a hot iron to show ownership" },
  { word: "sanctuary", meaning: "a place of safety for animals" },
  { word: "adoption", meaning: "taking in and caring for an animal or child" },
  { word: "orphanage", meaning: "a place where orphaned children or animals are cared for" },
  { word: "cage", meaning: "a structure with bars used to confine an animal" },
  { word: "inspect", meaning: "to examine something closely" },
  { word: "helmet", meaning: "protective headgear" },
  { word: "pesticide", meaning: "a chemical used to kill pests" },
  { word: "tether", meaning: "to tie an animal so it cannot move far" },
  { word: "endangered", meaning: "at risk of extinction" },
  { word: "protect", meaning: "to keep safe from harm" },
  { word: "safety", meaning: "the condition of being protected from danger" },
  { word: "danger", meaning: "the possibility of harm" },
  { word: "care", meaning: "to look after someone or something" },
  { word: "suffering", meaning: "experiencing pain or distress" },
  { word: "clean", meaning: "free from dirt" },
  { word: "pet", meaning: "an animal kept for companionship" },
  { word: "feed", meaning: "to give food to" },
  { word: "animal rights", meaning: "the belief that animals deserve fair and humane treatment" },
  { word: "overwork", meaning: "to work too hard or too long" },
];

type Expression = { text: string; type: "fixed phrase" | "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "in good shape", type: "fixed phrase", meaning: "in good health or condition" },
  { text: "at the moment", type: "fixed phrase", meaning: "right now" },
  { text: "make money", type: "fixed phrase", meaning: "to earn income" },
  { text: "one by one", type: "fixed phrase", meaning: "individually, in sequence" },
  { text: "as mischievous as a monkey", type: "simile", meaning: "very playful and troublesome" },
  { text: "as helpless as a baby", type: "simile", meaning: "completely unable to help oneself" },
  { text: "as gentle as a lamb", type: "simile", meaning: "very calm and gentle" },
  { text: "as white as wool", type: "simile", meaning: "very white in colour" },
  { text: "the girl is a lamb. she is so gentle", type: "metaphor", meaning: "calling someone a lamb to show they are very gentle" },
  { text: "would not hurt a fly", type: "idiom", meaning: "gentle and harmless" },
  { text: "curiosity killed the cat", type: "idiom", meaning: "being too curious can get you into trouble" },
  { text: "let the cat out of the bag", type: "idiom", meaning: "to reveal a secret by accident" },
  { text: "kill two birds with one stone", type: "idiom", meaning: "to achieve two things with a single action" },
  { text: "a bad workman quarrels with his tools", type: "proverb", meaning: "a person who fails blames their equipment instead of themselves" },
  { text: "put all your eggs in one basket", type: "proverb", meaning: "to risk everything on a single plan" },
  { text: "it is no use crying over spilt milk", type: "proverb", meaning: "there's no point worrying about something that cannot be undone" },
  { text: "a barking dog never bites", type: "proverb", meaning: "a person who makes a lot of noise is often not truly dangerous" },
  { text: "a dog is a man's best friend", type: "proverb", meaning: "dogs are loyal and valued companions" },
  { text: "die out", type: "phrasal verb", meaning: "to become extinct or disappear gradually" },
  { text: "care for", type: "phrasal verb", meaning: "to look after someone" },
  { text: "look after", type: "phrasal verb", meaning: "to take care of someone or something" },
  { text: "rely on", type: "phrasal verb", meaning: "to depend on someone or something" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.8");

// The theme's own "explain the difference between riddles and proverbs" outcome, given as riddle/proverb
// pairs so the categorize branch actually tests the distinction, not just vocabulary recall.
const RIDDLE_PROVERB_PAIRS: { text: string; kind: "riddle" | "proverb" }[] = [
  { text: "What has four legs in the morning, two at noon and three in the evening?", kind: "riddle" },
  { text: "A dog is a man's best friend.", kind: "proverb" },
  { text: "What runs but never walks, has a bed but never sleeps?", kind: "riddle" },
  { text: "A barking dog never bites.", kind: "proverb" },
  { text: "What has a tail and a head but no body?", kind: "riddle" },
  { text: "A bad workman quarrels with his tools.", kind: "proverb" },
  { text: "The more you take, the more you leave behind. What am I?", kind: "riddle" },
  { text: "It is no use crying over spilt milk.", kind: "proverb" },
  { text: "What has ears but cannot hear?", kind: "riddle" },
  { text: "Put all your eggs in one basket, and you risk losing them all.", kind: "proverb" },
];

const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "in good shape", type: "fixed phrase", meaning: "in good health or condition", before: "After the vet's check-up, the cattle were declared ", after: "." },
  { text: "at the moment", type: "fixed phrase", meaning: "right now", before: "The sanctuary has no space for new animals ", after: "." },
  { text: "one by one", type: "fixed phrase", meaning: "individually, in sequence", before: "The farmer inspected each pen ", after: " for signs of danger." },
  { text: "as gentle as a lamb", type: "simile", meaning: "very calm and gentle", before: "Despite its size, the old farm dog was ", after: " with the children." },
  { text: "as mischievous as a monkey", type: "simile", meaning: "very playful and troublesome", before: "The young goat was ", after: ", always escaping its tether." },
  { text: "would not hurt a fly", type: "idiom", meaning: "gentle and harmless", before: "The elderly cow at the sanctuary ", after: "." },
  { text: "let the cat out of the bag", type: "idiom", meaning: "to reveal a secret by accident", before: "The keeper accidentally told everyone about the surprise adoption, and \"", after: "\" too early." },
  { text: "kill two birds with one stone", type: "idiom", meaning: "to achieve two things with a single action", before: "By fencing off the pesticide store, the farmer managed to ", after: "." },
  { text: "die out", type: "phrasal verb", meaning: "to become extinct or disappear gradually", before: "Without proper protection, endangered species could ", after: " completely." },
  { text: "care for", type: "phrasal verb", meaning: "to look after someone", before: "Volunteers at the sanctuary ", after: " injured wild animals until they recover." },
  { text: "look after", type: "phrasal verb", meaning: "to take care of someone or something", before: "Every pet owner must ", after: " their animal's feeding and cleanliness." },
  { text: "rely on", type: "phrasal verb", meaning: "to depend on someone or something", before: "Farm animals ", after: " their keepers for food and safety." },
];

export const animalSafetyRiddlesProverbs: Skill = {
  id: "g6-eng-ls-animal-safety",
  code: "LS.8",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Animal Safety and Care — Riddles and Proverbs",
  description: "Identify words with the sounds /ʃ/ and /ʧ/, distinguish riddles from proverbs, use animal-safety vocabulary correctly, and use similes, a metaphor, idioms and proverbs in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "riddle-proverb-categorize", "vocab-click-match", "vocab-categorize", "fill-blank"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words has the same sound as in "${target.sound === "/ʃ/" ? "sheep" : "chicken"}" (${target.sound})?`,
        choices,
        correctIndex: choices.indexOf(target.word),
        layout: "row",
        hint: `Say each word aloud and listen for the ${target.sound} sound.`,
        explanation: `"${target.word}" contains the sound ${target.sound}.`,
      };
    }

    if (branch === "vocab-meaning-mc") {
      const item = randChoice(rng, VOCAB);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.meaning, ...distractors.map((d) => d.meaning)]);
      return {
        kind: "multiple-choice",
        prompt: `What does the word "${item.word}" mean?`,
        choices,
        correctIndex: choices.indexOf(item.meaning),
        layout: "list",
        hint: "Think about farm animals, safety and care.",
        explanation: `"${item.word}" means: ${item.meaning}.`,
      };
    }

    if (branch === "vocab-scenario-mc") {
      const item = randChoice(rng, VOCAB);
      const name = randChoice(rng, KENYAN_NAMES);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.word, ...distractors.map((d) => d.word)]);
      return {
        kind: "multiple-choice",
        prompt: `${name}'s veterinary teacher explains: "${item.meaning}." Which word matches this?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "Match the description to the exact vocabulary word.",
        explanation: `The word is "${item.word}" — it means ${item.meaning}.`,
      };
    }

    if (branch === "riddle-proverb-categorize") {
      const pool = shuffle(rng, RIDDLE_PROVERB_PAIRS).slice(0, 6);
      const correctBucket: Record<string, string> = {};
      const items = pool.map((p, i) => {
        const id = `item-${i}`;
        correctBucket[id] = p.kind;
        return { id, label: p.text };
      });
      return {
        kind: "categorize",
        prompt: "Sort each line: is it a RIDDLE (a puzzle to solve), or a PROVERB (a piece of wise advice)?",
        items,
        buckets: [
          { id: "riddle", label: "Riddle" },
          { id: "proverb", label: "Proverb" },
        ],
        correctBucket,
        hint: "A riddle asks a puzzling question with a hidden answer; a proverb gives wise advice as a statement.",
        explanation: "Riddles pose a puzzle for the listener to solve, while proverbs are short statements of traditional wisdom or advice.",
      };
    }

    if (branch === "vocab-click-match") {
      const pool = shuffle(rng, VOCAB).slice(0, 6);
      const tokens = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of pool) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each animal-care vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words describe good care, others describe risks or harm.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const safetyWords = ["protect", "safety", "care", "clean", "feed", "sanctuary", "veterinary", "adoption"];
      const dangerWords = ["poisonous", "cruel", "danger", "suffering", "endangered", "overwork", "pesticide"];
      const pool = shuffle(rng, [
        ...safetyWords.map((w) => ({ id: w, label: w, bucket: "safety" })),
        ...dangerWords.map((w) => ({ id: w, label: w, bucket: "danger" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these words: does it relate to SAFETY/CARE, or to DANGER/HARM?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "safety", label: "Safety / Care" },
          { id: "danger", label: "Danger / Harm" },
        ],
        correctBucket,
        hint: "Safety words describe good treatment; danger words describe risks or suffering.",
        explanation: "Safety/care words: protect, safety, care, clean, feed, sanctuary, veterinary, adoption. Danger/harm words: poisonous, cruel, danger, suffering, endangered, overwork, pesticide.",
      };
    }

    const t = randChoice(rng, FILL_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: `Complete the sentence using the expression "${t.text}".`,
      before: t.before,
      after: t.after,
      correctAnswer: t.text,
      inputMode: "text",
      hint: `This ${t.type} means: ${t.meaning}.`,
      explanation: `"${t.text}" (${t.type}) means ${t.meaning}.`,
    };
  },
};
