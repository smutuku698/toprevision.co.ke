import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { FAMILY_VOCAB, NUMBERS } from "./shared";

// Sub-strand W.2 Functional Writing — Theme: Family (Nuclear Family), incl. numbers 20-100.
// Content: correct word spacing and German noun capitalization when writing about family members,
// writing numbers up to 100 from dictation, and sentence construction for "Das ist mein Vater. Er
// ist fünfzig Jahre alt." / "Wie alt ist dein Vater?" style functional writing.

const SPACING_ITEMS: { correct: string; squished: string; brokenUp: string; meaning: string }[] = [
  { correct: "Das ist mein Vater", squished: "Dasistmein Vater", brokenUp: "Da s ist mei n Va ter", meaning: "this is my father" },
  { correct: "Das ist meine Mutter", squished: "Dasistmeine Mutter", brokenUp: "Da s ist mei ne Mut ter", meaning: "this is my mother" },
  { correct: "Er ist fünfzig Jahre alt", squished: "Eristfünfzig Jahrealt", brokenUp: "Er is t fünf zig Jah re alt", meaning: "he is fifty years old" },
  { correct: "Sie ist meine Schwester", squished: "Sieistmeine Schwester", brokenUp: "Si e ist mei ne Schwes ter", meaning: "she is my sister" },
  { correct: "Ich habe einen Bruder", squished: "Ichhabeeinen Bruder", brokenUp: "Ich ha be ei nen Bru der", meaning: "I have a brother" },
  { correct: "Wie alt ist dein Vater", squished: "Wiealtistdein Vater", brokenUp: "Wi e al t ist dei n Va ter", meaning: "how old is your father" },
  { correct: "Meine Familie ist groß", squished: "MeineFamilie ist groß", brokenUp: "Mei ne Fa mi lie is t groß", meaning: "my family is big" },
  { correct: "Meine Großmutter ist nett", squished: "MeineGroßmutter ist nett", brokenUp: "Mei ne Groß mut ter is t nett", meaning: "my grandmother is nice" },
  { correct: "Mein Onkel wohnt in Kisumu", squished: "MeinOnkel wohnt in Kisumu", brokenUp: "Mei n On kel wo hn t in Kisumu", meaning: "my uncle lives in Kisumu" },
  { correct: "Wir sind eine Familie", squished: "Wirsindeine Familie", brokenUp: "Wi r si nd ei ne Fa mi lie", meaning: "we are a family" },
];

const ORTHO_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "Which is the correctly capitalized way to write 'father' in a sentence?", correct: "der Vater", distractors: ["der vater", "Der vater", "DER VATER"], explanation: "'Vater' is a noun, so its first letter is always capitalized, and 'der' (the article) stays lowercase mid-sentence." },
  { question: "Which is the correctly capitalized way to write 'grandmother' in a sentence?", correct: "die Großmutter", distractors: ["die großmutter", "Die großmutter", "die Grossmutter"], explanation: "'Großmutter' keeps its capital G as a noun, and its correct spelling uses ß, not 'ss'." },
  { question: "A learner writes 'ich habe einen bruder.' What capitalization mistake did they make?", correct: "'bruder' (a noun) should be capitalized: 'Bruder'", distractors: ["'ich' should stay lowercase", "'habe' should be capitalized", "'einen' should be capitalized"], explanation: "'Bruder' is a noun, so German capitalizes it: 'Ich habe einen Bruder.'" },
  { question: "Which rule explains why 'Mutter' is capitalized in the middle of 'Das ist meine Mutter'?", correct: "German nouns are always capitalized, wherever they appear in the sentence", distractors: ["only sentence-starting words are capitalized in German", "'Mutter' is a proper name", "it is a spelling mistake — it should be lowercase"], explanation: "Unlike English, every German noun keeps its capital letter regardless of position." },
  { question: "Which is the correct German spelling of 'grandfather'?", correct: "Großvater", distractors: ["Grosvater", "Grossvater", "Großvather"], explanation: "'Großvater' is spelled with ß, not 'ss', and has no extra 'h'." },
  { question: "Which is the correct German spelling of the number 30?", correct: "dreißig", distractors: ["dreissig", "dreisig", "dreiseig"], explanation: "'dreißig' uses ß, a common spot for spelling mistakes if the ß is dropped or doubled." },
  { question: "Which sentence uses correct capitalization?", correct: "Meine Schwester ist zwölf Jahre alt.", distractors: ["Meine schwester ist zwölf Jahre alt.", "meine Schwester ist zwölf jahre alt.", "Meine Schwester ist Zwölf jahre alt."], explanation: "'Schwester' and 'Jahre' are nouns and stay capitalized; 'zwölf' (a number word, not a noun here) stays lowercase." },
  { question: "Which sentence uses correct capitalization?", correct: "Mein Onkel wohnt in Kisumu.", distractors: ["mein onkel wohnt in Kisumu.", "Mein onkel wohnt in kisumu.", "Mein Onkel wohnt in kisumu."], explanation: "'Onkel' (a noun) and 'Kisumu' (a place name) are both capitalized; sentence-initial 'Mein' is too." },
  { question: "A friend asks 'wie alt ist dein vater?' at the start of a message. What capitalization is missing?", correct: "the sentence-initial 'Wie' needs a capital letter", distractors: ["nothing is missing", "'alt' should be capitalized", "'dein' should be capitalized"], explanation: "Every German sentence starts with a capital letter: 'Wie alt ist dein Vater?' (Vater also needs its capital as a noun)." },
  { question: "Which word in 'wie alt ist dein vater' is missing TWO required capital letters?", correct: "'wie' (sentence start) and 'vater' (a noun) both need capitals", distractors: ["only 'wie' needs a capital", "only 'vater' needs a capital", "'alt' and 'dein' both need capitals"], explanation: "The corrected sentence is 'Wie alt ist dein Vater?' — one capital for the sentence start, one for the noun." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Das ist", "mein Vater.", "Er ist fünfzig."], sentence: "Das ist mein Vater. Er ist fünfzig. (This is my father. He is fifty.)" },
  { chunks: ["Das ist", "meine Mutter.", "Sie ist fünfundvierzig."], sentence: "Das ist meine Mutter. Sie ist fünfundvierzig. (This is my mother. She is forty-five.)" },
  { chunks: ["Ich habe", "einen Bruder", "und eine Schwester."], sentence: "Ich habe einen Bruder und eine Schwester. (I have a brother and a sister.)" },
  { chunks: ["Wie alt", "ist dein", "Vater?"], sentence: "Wie alt ist dein Vater? (How old is your father?)" },
  { chunks: ["Meine Großmutter", "ist", "achtzig Jahre alt."], sentence: "Meine Großmutter ist achtzig Jahre alt. (My grandmother is eighty years old.)" },
  { chunks: ["Mein Onkel", "wohnt", "in Nairobi."], sentence: "Mein Onkel wohnt in Nairobi. (My uncle lives in Nairobi.)" },
  { chunks: ["Meine Familie", "ist", "sehr groß."], sentence: "Meine Familie ist sehr groß. (My family is very big.)" },
  { chunks: ["Wir", "sind", "eine glückliche Familie."], sentence: "Wir sind eine glückliche Familie. (We are a happy family.)" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "The German word for \"father\" is der ", after: ".", correct: "Vater" },
  { before: "The German word for \"mother\" is die ", after: ".", correct: "Mutter" },
  { before: "The German word for \"brother\" is der ", after: ".", correct: "Bruder" },
  { before: "The German word for \"sister\" is die ", after: ".", correct: "Schwester" },
  { before: "The German word for \"grandmother\" is die ", after: ".", correct: "Großmutter" },
  { before: "The German word for \"grandfather\" is der ", after: ".", correct: "Großvater" },
  { before: "Fifty in German is written as ", after: ".", correct: "fünfzig" },
  { before: "Sixty in German is written as ", after: ".", correct: "sechzig" },
  { before: "Eighty in German is written as ", after: ".", correct: "achtzig" },
  { before: "One hundred in German is written as ", after: ".", correct: "hundert" },
];

export const familyWriting: Skill = {
  id: "g6-de-w-family",
  code: "W.2",
  subjectId: "german",
  strandId: "g6-de-writing",
  grade: 6,
  title: "Functional writing: family",
  description: "Practise correct word spacing, German noun capitalization, and writing numbers up to 100 from dictation for functional writing about the nuclear family, such as Das ist mein Vater. Er ist fünfzig Jahre alt.",
  generate(rng) {
    const branch = randChoice(rng, ["spacing", "ortho", "ordering", "fill", "categorize", "clickmatch"] as const);

    if (branch === "spacing") {
      const item = randChoice(rng, SPACING_ITEMS);
      const wrongKind = randChoice(rng, ["squished", "brokenUp"] as const);
      const wrong = wrongKind === "squished" ? item.squished : item.brokenUp;
      const otherWrong = wrongKind === "squished" ? item.brokenUp : item.squished;
      const choices = shuffle(rng, [item.correct, wrong, otherWrong]);
      const openers = [
        "Which version shows correct word spacing for",
        "Pick the correctly spaced re-write of",
        "Which of these is written neatly, with correct spacing, for",
        "Choose the properly spaced version meaning",
        "A classmate re-wrote a German sentence three ways — which has correct spacing for",
      ];
      const closers = ["?", ", written the German way?", " in correct German?", " — choose the neat version."];
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, openers)} "${item.meaning}"${randChoice(rng, closers)}`,
        choices,
        correctIndex: choices.indexOf(item.correct),
        layout: "list",
        hint: "Correct spacing keeps each whole word together with one space between words — not squished together or broken into fragments.",
        explanation: `The correctly spaced version is "${item.correct}" — squishing words together or breaking them into fragments makes text hard to read.`,
      };
    }

    if (branch === "ortho") {
      const q = randChoice(rng, ORTHO_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.question,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "German family nouns always keep their capital letter, and words like Großmutter/Großvater/dreißig are spelled with ß, not 'ss'.",
        explanation: q.explanation,
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const prompts = [
        "Arrange the word groups to re-write this sentence with correct spacing and order.",
        "Put these word groups in the correct order to form a neat German sentence.",
        "Order the pieces to write a correctly spaced German sentence.",
        "Click the word groups in the order they belong.",
        "Rebuild the German sentence in the correct order.",
        "Sort the word groups into the order a German sentence would use them.",
        "Drag the pieces into the right order to complete the sentence correctly.",
        "These word groups are jumbled — put them back in the correct German order.",
        "Reconstruct the sentence by ordering the word groups correctly.",
        "Place the word groups in the order needed for a correctly written sentence.",
        "Put the pieces in order to write this German sentence neatly.",
        "Work out the correct word order for this German family sentence.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder: set.chunks.map((c, i) => `${i}-${c}`),
        hint: "Read the meaning aloud in your head to work out the natural word order.",
        explanation: `The correctly written sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      const prompts = [
        "Fill in the missing word.",
        "Complete the sentence correctly.",
        "What word completes this writing fact?",
        "Fill the gap with the correct word.",
        "Complete this writing fact.",
        "What is the missing word here?",
        "Fill in the blank to complete the fact.",
        "Complete the missing word in this sentence.",
        "What word belongs in the blank?",
        "Fill in the correct word to complete the fact.",
        "Complete this German writing fact with the correct word.",
        "What word correctly fills this gap?",
      ];
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, prompts),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about correct spelling and capitalization for family words and numbers.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "categorize") {
      const useNumbers = rng() < 0.4;
      if (useNumbers) {
        const chosen = shuffle(rng, NUMBERS).slice(0, 6);
        const bucketOf = (n: number) => (n < 50 ? "Under fifty" : "Fifty or more");
        const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
        const correctBucket: Record<string, string> = {};
        chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.num)));
        const prompts = [
          "Sort each number word into the correct category.",
          "Group these written-out numbers by size.",
          "Sort each number word before writing an age sentence.",
          "Classify each German number word.",
          "Which category does each number word belong to?",
          "Before writing, sort each number word into its correct group.",
          "Organise these number words into the right categories.",
          "Plan your writing: sort each age number into its category.",
          "Which group does each German number word belong to?",
          "Sort these number words by size.",
          "Group each number word correctly.",
          "Match each number word to the category it fits.",
        ];
        return {
          kind: "categorize",
          prompt: randChoice(rng, prompts),
          items: shuffle(rng, items),
          buckets: [
            { id: "Under fifty", label: "Under fifty" },
            { id: "Fifty or more", label: "Fifty or more" },
          ],
          correctBucket,
          hint: "Compare each number to fifty before sorting it.",
          explanation: chosen.map((c) => `"${c.word}" is ${c.num} — ${bucketOf(c.num).toLowerCase()}.`).join(" "),
        };
      }
      const chosen = shuffle(rng, FAMILY_VOCAB).slice(0, 6);
      const bucketOf = (w: string) =>
        ["der Vater", "die Mutter", "der Bruder", "die Schwester", "der Sohn", "die Tochter"].includes(w)
          ? "Immediate family"
          : "Extended family";
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      const prompts = [
        "Sort each family word into the correct category.",
        "Group these German family words the way you would plan a paragraph.",
        "Sort each word into the correct writing category.",
        "Classify each family word you might write about.",
        "Which category would you write each word under?",
        "Before writing, sort each family word into its correct group.",
        "Organise these family words into the right categories.",
        "Plan your writing: sort each word into the category it belongs to.",
        "Which group does each German family word belong to?",
        "Sort these words the way you would before drafting a paragraph.",
        "Group each family word correctly before using it in your writing.",
        "Match each family word to the category it fits.",
      ];
      return {
        kind: "categorize",
        prompt: randChoice(rng, prompts),
        items: shuffle(rng, items),
        buckets: [
          { id: "Immediate family", label: "Immediate family" },
          { id: "Extended family", label: "Extended family" },
        ],
        correctBucket,
        hint: "Immediate family are parents/children/siblings; extended family are grandparents/aunts/uncles/cousins.",
        explanation: chosen.map((c) => `"${c.word}" is an ${bucketOf(c.word).toLowerCase()} word.`).join(" "),
      };
    }

    const pool = shuffle(rng, FAMILY_VOCAB).slice(0, 5);
    const tokens = pool.map((c, i) => ({ id: `t${i}`, label: c.word }));
    const targets = shuffle(rng, pool.map((c, i) => ({ id: `g${i}`, label: c.meaning })));
    const correctMap: Record<string, string> = {};
    pool.forEach((_, i) => (correctMap[`g${i}`] = `t${i}`));
    const prompts = [
      "Match each German family word to its English meaning.",
      "Click to match each word with the correct meaning.",
      "Pair each German family word with what it means in English.",
      "Match the German words to their correct English meanings.",
      "Which English meaning matches each German word? Match them.",
      "Connect each German word to its English translation.",
      "Match each word you would write in German to its meaning.",
      "Pair up the German words with their English meanings.",
      "Match each family word to its correct meaning before you write it.",
      "Click the matching pairs of German words and English meanings.",
      "Match these German family words to what they mean.",
      "Link each German family word to its English meaning.",
    ];
    return {
      kind: "click-match",
      prompt: randChoice(rng, prompts),
      tokens,
      targets,
      correctMap,
      hint: "Recall the German family word for each meaning before matching.",
      explanation: pool.map((c) => `"${c.word}" means "${c.meaning}".`).join(" "),
    };
  },
};
