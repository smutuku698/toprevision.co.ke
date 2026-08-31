import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedB";

// Theme 13 vocabulary, verbatim from curriculum-reference/grade-6/english.json (Money - Trade).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "currency", meaning: "the system of money used in a country" },
  { word: "funds", meaning: "money available for a purpose" },
  { word: "stock", meaning: "goods kept available for sale" },
  { word: "purchase", meaning: "to buy something" },
  { word: "foreign exchange", meaning: "the trading of one country's currency for another" },
  { word: "wholesale", meaning: "selling goods in large quantities at lower prices" },
  { word: "retail", meaning: "selling goods directly to consumers" },
  { word: "export", meaning: "to sell goods to another country" },
  { word: "product", meaning: "something made or grown to be sold" },
  { word: "online trade", meaning: "buying and selling goods over the internet" },
  { word: "import", meaning: "to bring goods in from another country" },
  { word: "deal", meaning: "an agreement, especially in business" },
  { word: "hawker", meaning: "a person who sells goods in the street" },
  { word: "boutique", meaning: "a small shop selling fashionable clothes" },
  { word: "service", meaning: "work done for a customer, not a physical good" },
  { word: "consume", meaning: "to buy and use goods or services" },
  { word: "tax", meaning: "money paid to the government from earnings or purchases" },
  { word: "negotiate", meaning: "to discuss in order to reach an agreement" },
  { word: "credit", meaning: "an arrangement to buy now and pay later" },
  { word: "hike", meaning: "a sudden increase, especially in price" },
  { word: "barter trade", meaning: "exchanging goods without using money" },
  { word: "profit", meaning: "the money gained after selling for more than the cost" },
  { word: "invest", meaning: "to put money into something expecting a future gain" },
  { word: "save", meaning: "to keep money instead of spending it" },
];

type Expression = { text: string; type: "fixed phrase" | "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "at once", type: "fixed phrase", meaning: "immediately" },
  { text: "no entry", type: "fixed phrase", meaning: "not allowed to enter" },
  { text: "sell like hot cakes", type: "simile", meaning: "to sell very quickly and in large amounts" },
  { text: "as happy as a hippo", type: "simile", meaning: "extremely happy" },
  { text: "Chebet is a hare. She is so clever", type: "metaphor", meaning: "calling someone a hare to show they are very clever" },
  { text: "a stitch in time saves nine", type: "proverb", meaning: "fixing a small problem early prevents a bigger one" },
  { text: "money doesn't grow on trees", type: "proverb", meaning: "money is not easy to obtain and should be spent wisely" },
  { text: "back to square one", type: "idiom", meaning: "back to the very beginning after a failed attempt" },
  { text: "to cut corners", type: "idiom", meaning: "to do something in the easiest or cheapest way, often poorly" },
  { text: "count on", type: "phrasal verb", meaning: "to rely on someone or something" },
  { text: "give in", type: "phrasal verb", meaning: "to finally agree after resisting" },
  { text: "give back", type: "phrasal verb", meaning: "to return something to its owner" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.13");

const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "at once", type: "fixed phrase", meaning: "immediately", before: "The hawker sold all the fresh mangoes ", after: "." },
  { text: "sell like hot cakes", type: "simile", meaning: "to sell very quickly and in large amounts", before: "During the festival, the boutique's new clothes began to ", after: "." },
  { text: "as happy as a hippo", type: "simile", meaning: "extremely happy", before: "After making a good profit on the deal, the trader was ", after: "." },
  { text: "a stitch in time saves nine", type: "proverb", meaning: "fixing a small problem early prevents a bigger one", before: "Fixing the shop's broken lock right away showed that \"", after: "\"." },
  { text: "money doesn't grow on trees", type: "proverb", meaning: "money is not easy to obtain and should be spent wisely", before: "The mother reminded her son that \"", after: "\", so he should save carefully." },
  { text: "back to square one", type: "idiom", meaning: "back to the very beginning after a failed attempt", before: "When the online trade deal fell through, the business was ", after: "." },
  { text: "to cut corners", type: "idiom", meaning: "to do something in the easiest or cheapest way, often poorly", before: "The wholesaler refused to ", after: " even when funds were low." },
  { text: "count on", type: "phrasal verb", meaning: "to rely on someone or something", before: "Small traders often ", after: " credit to buy stock during the low season." },
  { text: "give in", type: "phrasal verb", meaning: "to finally agree after resisting", before: "After negotiating for an hour, the seller finally decided to ", after: " to the buyer's lower price." },
  { text: "give back", type: "phrasal verb", meaning: "to return something to its owner", before: "The honest cashier made sure to ", after: " the extra change to the customer." },
];

export const moneyTradeIntensiveListening: Skill = {
  id: "g6-eng-ls-money-trade",
  code: "LS.13",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Money and Trade — Intensive Listening",
  description: "Identify words with the sounds /ʌ/, /ʊ/, /ʊə/ and /eɪ/, predict outcomes in a listening text, use money and trade vocabulary correctly, and use similes, a metaphor, proverbs, idioms and phrasal verbs in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "vocab-click-match", "vocab-categorize", "fill-blank", "expression-meaning-mc"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words has the same sound as in "${target.sound === "/ʌ/" ? "but" : target.sound === "/ʊ/" ? "put" : target.sound === "/ʊə/" ? "tour" : "gate"}" (${target.sound})?`,
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
        hint: "Think about buying, selling, and trade.",
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
        prompt: `${name}'s business teacher explains: "${item.meaning}." Which word matches this?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "Match the description to the exact vocabulary word.",
        explanation: `The word is "${item.word}" — it means ${item.meaning}.`,
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
        prompt: "Match each money/trade vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words describe buying/selling actions, others describe types of traders or trade.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const actionWords = ["purchase", "export", "import", "negotiate", "consume", "invest", "save"];
      const peopleWords = ["hawker"];
      const placeOrTypeWords = ["boutique", "wholesale", "retail", "online trade", "barter trade"];
      const pool = shuffle(rng, [
        ...actionWords.map((w) => ({ id: w, label: w, bucket: "action" })),
        ...peopleWords.map((w) => ({ id: w, label: w, bucket: "type-or-place" })),
        ...placeOrTypeWords.map((w) => ({ id: w, label: w, bucket: "type-or-place" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these words: is it a TRADE ACTION (a verb), or a TYPE OF TRADER/TRADE/SHOP?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "action", label: "Trade Action" },
          { id: "type-or-place", label: "Type of Trader/Trade/Shop" },
        ],
        correctBucket,
        hint: "An action word is something you do; a type/place word names a kind of trade or trader.",
        explanation: "Action words: purchase, export, import, negotiate, consume, invest, save. Type/place words: hawker, boutique, wholesale, retail, online trade, barter trade.",
      };
    }

    if (branch === "fill-blank") {
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
    }

    const item = randChoice(rng, EXPRESSIONS);
    const distractors = shuffle(rng, EXPRESSIONS.filter((e) => e.text !== item.text)).slice(0, 3);
    const choices = shuffle(rng, [item.meaning, ...distractors.map((d) => d.meaning)]);
    return {
      kind: "multiple-choice",
      prompt: `What does the expression "${item.text}" mean?`,
      choices,
      correctIndex: choices.indexOf(item.meaning),
      layout: "list",
      hint: `This is a${["a", "e", "i", "o", "u"].includes(item.type[0]) ? "n" : ""} ${item.type}.`,
      explanation: `"${item.text}" (${item.type}) means ${item.meaning}.`,
    };
  },
};
