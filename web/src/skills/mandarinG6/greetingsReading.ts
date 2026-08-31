import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

type Tag = "greeting" | "pronoun" | "intro" | "number";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "早上好", pinyin: "zǎoshang hǎo", meaning: "good morning", tag: "greeting" },
  { hanzi: "上午好", pinyin: "shàngwǔ hǎo", meaning: "good morning (late morning)", tag: "greeting" },
  { hanzi: "中午好", pinyin: "zhōngwǔ hǎo", meaning: "good midday", tag: "greeting" },
  { hanzi: "下午好", pinyin: "xiàwǔ hǎo", meaning: "good afternoon", tag: "greeting" },
  { hanzi: "晚上好", pinyin: "wǎnshang hǎo", meaning: "good evening", tag: "greeting" },
  { hanzi: "晚安", pinyin: "wǎn ān", meaning: "good night", tag: "greeting" },
  { hanzi: "我", pinyin: "wǒ", meaning: "I / me", tag: "pronoun" },
  { hanzi: "你", pinyin: "nǐ", meaning: "you (informal)", tag: "pronoun" },
  { hanzi: "您", pinyin: "nín", meaning: "you (formal)", tag: "pronoun" },
  { hanzi: "他", pinyin: "tā", meaning: "he / him", tag: "pronoun" },
  { hanzi: "她", pinyin: "tā", meaning: "she / her", tag: "pronoun" },
  { hanzi: "我叫……", pinyin: "wǒ jiào……", meaning: "my name is…", tag: "intro" },
  { hanzi: "我今年……岁", pinyin: "wǒ jīnnián……suì", meaning: "I am … years old this year", tag: "intro" },
  { hanzi: "他是我的朋友", pinyin: "tā shì wǒ de péngyou", meaning: "he is my friend", tag: "intro" },
  { hanzi: "你/您呢？", pinyin: "nǐ/nín ne?", meaning: "and you?", tag: "intro" },
  { hanzi: "一", pinyin: "yī", meaning: "one", tag: "number" },
  { hanzi: "二", pinyin: "èr", meaning: "two", tag: "number" },
  { hanzi: "三", pinyin: "sān", meaning: "three", tag: "number" },
  { hanzi: "四", pinyin: "sì", meaning: "four", tag: "number" },
  { hanzi: "五", pinyin: "wǔ", meaning: "five", tag: "number" },
  { hanzi: "六", pinyin: "liù", meaning: "six", tag: "number" },
  { hanzi: "七", pinyin: "qī", meaning: "seven", tag: "number" },
  { hanzi: "八", pinyin: "bā", meaning: "eight", tag: "number" },
  { hanzi: "九", pinyin: "jiǔ", meaning: "nine", tag: "number" },
  { hanzi: "十", pinyin: "shí", meaning: "ten", tag: "number" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ jīnnián ", after: " suì.", answer: "sān", gloss: "我今年三岁。— I am three years old this year." },
  { before: "Wǒ jīnnián ", after: " suì.", answer: "liù", gloss: "我今年六岁。— I am six years old this year." },
  { before: "Wǒ jīnnián ", after: " suì.", answer: "bā", gloss: "我今年八岁。— I am eight years old this year." },
  { before: "Wǒ jīnnián ", after: " suì.", answer: "jiǔ", gloss: "我今年九岁。— I am nine years old this year." },
  { before: "A: Zǎoshang hǎo! B: ", after: "!", answer: "Zǎoshang hǎo", gloss: "早上好！早上好！— Good morning! Good morning! (the greeting is echoed back)" },
  { before: "A: Xiàwǔ hǎo! B: ", after: "!", answer: "Xiàwǔ hǎo", gloss: "下午好！下午好！— Good afternoon! Good afternoon!" },
  { before: "A: ", after: "! B: Wǎn ān!", answer: "Wǎn ān", gloss: "晚安！晚安！— Good night! Good night!" },
  { before: "Wǒ jīnnián shí suì. Nǐ ", after: "?", answer: "ne", gloss: "我今年十岁。你呢？— I am ten this year. And you?" },
  { before: "Wǒ jīnnián bā suì. Nín ", after: "?", answer: "ne", gloss: "我今年八岁。您呢？— I am eight this year. And you? (formal)" },
  { before: "Tā shì wǒ de ", after: ".", answer: "péngyou", gloss: "他是我的朋友。— He is my friend." },
  { before: "Tā ", after: " wǒ de péngyou.", answer: "shì", gloss: "她是我的朋友。— She is my friend." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["他", "是我的", "朋友。"], sentence: "他是我的朋友。", gloss: "Tā shì wǒ de péngyou. — He is my friend." },
  { chunks: ["她", "是我的", "朋友。"], sentence: "她是我的朋友。", gloss: "Tā shì wǒ de péngyou. — She is my friend." },
  { chunks: ["我", "今年", "十岁。"], sentence: "我今年十岁。", gloss: "Wǒ jīnnián shí suì. — I am ten years old this year." },
  { chunks: ["我", "今年", "八岁。"], sentence: "我今年八岁。", gloss: "Wǒ jīnnián bā suì. — I am eight years old this year." },
  { chunks: ["我今年五岁。", "你呢？"], sentence: "我今年五岁。你呢？", gloss: "Wǒ jīnnián wǔ suì. Nǐ ne? — I am five this year. And you?" },
  { chunks: ["我今年六岁。", "您呢？"], sentence: "我今年六岁。您呢？", gloss: "Wǒ jīnnián liù suì. Nín ne? — I am six this year. And you? (formal)" },
  { chunks: ["早上好，", "他是我的", "朋友。"], sentence: "早上好，他是我的朋友。", gloss: "Zǎoshang hǎo, tā shì wǒ de péngyou. — Good morning, he is my friend." },
  { chunks: ["晚上好，", "她是我的", "朋友。"], sentence: "晚上好，她是我的朋友。", gloss: "Wǎnshang hǎo, tā shì wǒ de péngyou. — Good evening, she is my friend." },
  { chunks: ["下午好，", "我今年", "九岁。"], sentence: "下午好，我今年九岁。", gloss: "Xiàwǔ hǎo, wǒ jīnnián jiǔ suì. — Good afternoon, I am nine years old this year." },
  { chunks: ["中午好，", "你呢？"], sentence: "中午好，你呢？", gloss: "Zhōngwǔ hǎo, nǐ ne? — Good midday, and you?" },
];

const LEARNERS = ["Wanjiru", "Otieno", "Amina", "Kiptoo", "Njoki", "Baraka", "Achieng", "Mutiso", "Naliaka", "Cherotich"];

const MC_OPENERS = [
  "{name} is reading a Mandarin greeting card aloud, watching the tone marks carefully, and reaches",
  "While practicing pitch and volume at the school's greeting corner, {name} reads",
  "{name} sounds out each syllable of a greeting dialogue and pauses on",
  "Reading a greeting text aloud with the correct tone, {name} comes to",
  "{name} is rehearsing a greeting exchange for class and reads aloud",
];
const MC_CLOSERS = [
  "What does it mean?",
  "What is the correct English meaning?",
  "Which meaning matches what was just read aloud?",
  "What is the best English meaning for this word?",
];

const FILL_OPENERS = [
  "{name} is reading this greeting sentence aloud and needs the missing word to keep the right rhythm.",
  "Help {name} finish reading this Mandarin sentence — type the missing pinyin word (tone marks optional).",
  "{name} pauses mid-sentence while reading aloud and can't recall one word.",
  "{name} is practicing pronunciation and needs to fill in the missing word to finish the sentence.",
  "As {name} reads this sentence aloud, one word is missing — type it in pinyin.",
];
const FILL_CLOSERS = [
  "Type the missing pinyin word.",
  "Complete the sentence below.",
  "Enter the correct pinyin to fill the gap.",
  "Write the missing word in pinyin (tone marks optional).",
];

const ORDER_OPENERS = [
  "{name} is learning to read this sentence aloud with the right pauses — but the pieces are jumbled.",
  "Help {name} put these word pieces back in order to read the sentence smoothly.",
  "{name} wrote this greeting sentence in pieces before reading it aloud. Put them in order.",
  "To read this sentence aloud fluently, {name} first needs to arrange the pieces correctly.",
  "{name} is practicing phrasing for reading aloud — arrange the pieces into the correct sentence.",
];
const ORDER_CLOSERS = [
  "Arrange the pieces into the correct sentence.",
  "Click the pieces in the correct reading order.",
  "Put the words in the order they should be read.",
  "Reorder the pieces to form a correct sentence.",
];

const CATEGORIZE_OPENERS = [
  "{name} is reading a list of greeting words and phrases and needs to sort them while reading aloud.",
  "Help {name} sort these words while reading through a greeting card.",
  "{name} is practicing reading aloud and sorting greetings, pronouns, introductions, and numbers.",
  "As {name} reads each word aloud, sort it into the correct group.",
  "{name} is organizing a greeting reading list by type.",
];
const CATEGORIZE_CLOSERS = [
  "Sort each word into its correct group.",
  "Read each word and place it in the right category.",
  "Drag each item into the correct bucket.",
  "Sort the words below by type.",
];

const MATCH_OPENERS = [
  "{name} is reading Mandarin greeting words aloud and matching each to its meaning.",
  "Help {name} match each word read aloud to its correct English meaning.",
  "{name} is practicing reading these words and connecting them to their meanings.",
  "As {name} reads each greeting word aloud, match it to what it means.",
  "{name} is reviewing greeting vocabulary by matching words to meanings.",
];
const MATCH_CLOSERS = [
  "Match each word to its meaning.",
  "Connect each word to its correct English meaning.",
  "Match the Mandarin word to what it means in English.",
  "Pair each word with its meaning.",
];

function withName(rng: () => number, pool: string[], name: string): string {
  return randChoice(rng, pool).replace("{name}", name);
}

export const greetingsReading: Skill = {
  id: "g6-ma-r-greetings",
  code: "R.1",
  subjectId: "mandarin",
  strandId: "g6-ma-reading",
  grade: 6,
  title: "Reading: greetings aloud with the right tone",
  description: "Practice tone, pitch, and volume when reading Mandarin greetings, pronouns, and introductions aloud.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "order", "categorize", "match"] as const);
    const name = randChoice(rng, LEARNERS);

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.meaning, ...distractors.map((d) => d.meaning)])));
      const prompt = `${withName(rng, MC_OPENERS, name)} "${correct.hanzi} (${correct.pinyin})". ${randChoice(rng, MC_CLOSERS)}`;

      return {
        kind: "multiple-choice",
        prompt,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Reading aloud smoothly means recognizing the word by sight before you say it — think about its tone and where it's used.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      const prompt = `${withName(rng, FILL_OPENERS, name)} ${randChoice(rng, FILL_CLOSERS)}`;

      return {
        kind: "fill-blank",
        prompt,
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "Read the sentence in your head first, keeping the tone of each syllable steady.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);
      const prompt = `${withName(rng, ORDER_OPENERS, name)} ${randChoice(rng, ORDER_CLOSERS)}`;

      return {
        kind: "ordering",
        prompt,
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Greetings and introductions usually come first, followed by the detail being introduced.",
        explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, VOCAB).slice(0, 8);
      const buckets: { id: Tag; label: string }[] = [
        { id: "greeting", label: "Greeting" },
        { id: "pronoun", label: "Pronoun" },
        { id: "intro", label: "Introduction phrase" },
        { id: "number", label: "Number" },
      ];
      const correctBucket: Record<string, string> = {};
      for (const v of chosen) correctBucket[v.hanzi] = v.tag;
      const prompt = `${withName(rng, CATEGORIZE_OPENERS, name)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`;

      return {
        kind: "categorize",
        prompt,
        items: shuffle(rng, chosen).map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets,
        correctBucket,
        hint: "Greetings are said on meeting someone; pronouns stand for people; introductions give personal details; numbers are counting words.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" is a ${buckets.find((b) => b.id === v.tag)!.label.toLowerCase()}.`).join(" "),
      };
    }

    const chosen = shuffle(rng, VOCAB).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
    const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
    const correctMap: Record<string, string> = {};
    for (const v of chosen) correctMap[v.hanzi] = v.hanzi;
    const prompt = `${withName(rng, MATCH_OPENERS, name)} ${randChoice(rng, MATCH_CLOSERS)}`;

    return {
      kind: "click-match",
      prompt,
      tokens,
      targets,
      correctMap,
      hint: "Sound each word out first, then look for its meaning on the right.",
      explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
    };
  },
};
