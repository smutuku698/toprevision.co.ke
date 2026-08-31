import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { FOOD_VOCAB, FLAVOUR_VOCAB, umlautAccepted } from "./shared";

// Sub-strand W.6 Functional Writing — Theme: Foods and Drinks (Food Preferences).
// Content: correct word spacing and German noun capitalization when writing about food
// preferences (Was isst du gern? Ich esse gern Brot.), and describing taste with flavour
// adjectives (Der Kuchen ist süß. Die Suppe ist salzig.).

const SPACING_ITEMS: { correct: string; squished: string; brokenUp: string; meaning: string }[] = [
  { correct: "Was isst du gern", squished: "Wasisstdu gern", brokenUp: "Wa s is st du gern", meaning: "what do you like eating" },
  { correct: "Ich esse gern Brot", squished: "Ichessegern Brot", brokenUp: "Ich es se ge rn Bro t", meaning: "I like eating bread" },
  { correct: "Der Kuchen ist süß", squished: "DerKuchenist süß", brokenUp: "De r Ku chen is t süß", meaning: "the cake is sweet" },
  { correct: "Die Suppe ist salzig", squished: "DieSuppeist salzig", brokenUp: "Di e Sup pe is t sal zig", meaning: "the soup is salty" },
  { correct: "Ich trinke gern Milch", squished: "Ichtrinkegern Milch", brokenUp: "Ich trin ke ge rn Mil ch", meaning: "I like drinking milk" },
  { correct: "Der Fisch schmeckt lecker", squished: "DerFischschmeckt lecker", brokenUp: "De r Fisch schmeck t leck er", meaning: "the fish tastes delicious" },
  { correct: "Das Gemüse ist frisch", squished: "DasGemüseist frisch", brokenUp: "Da s Ge mü se is t frisch", meaning: "the vegetables are fresh" },
  { correct: "Ich esse nicht gern Fleisch", squished: "Ichessenicht gern Fleisch", brokenUp: "Ich es se nich t ge rn Fleisch", meaning: "I do not like eating meat" },
  { correct: "Der Saft ist sauer", squished: "DerSaftist sauer", brokenUp: "De r Saf t is t sau er", meaning: "the juice is sour" },
  { correct: "Das Essen schmeckt scharf", squished: "DasEssenschmeckt scharf", brokenUp: "Da s Es sen schmeck t scharf", meaning: "the food tastes spicy" },
];

const ORTHO_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "Which is the correctly capitalized way to write 'bread' in a sentence?", correct: "Ich esse gern Brot.", distractors: ["Ich esse gern brot.", "ich esse gern Brot.", "Ich Esse gern Brot."], explanation: "'Brot' is a noun and keeps its capital letter mid-sentence; 'esse' is a verb and stays lowercase." },
  { question: "Which is the correctly capitalized way to write 'vegetables' in a sentence?", correct: "Das Gemüse ist frisch.", distractors: ["Das gemüse ist frisch.", "das Gemüse ist frisch.", "Das Gemüse ist Frisch."], explanation: "'Gemüse' is a noun and keeps its capital letter, spelled with ü; 'frisch' is an adjective and stays lowercase." },
  { question: "A learner writes 'ich trinke gern milch.' What capitalization mistake did they make?", correct: "'ich' (sentence start) and 'milch' (a noun) should both be capitalized", distractors: ["'trinke' should be capitalized", "'gern' should be capitalized", "nothing is wrong"], explanation: "The corrected sentence is 'Ich trinke gern Milch.'" },
  { question: "Which rule explains why 'Brot', 'Milch', and 'Fisch' are always capitalized?", correct: "they are nouns, and German nouns are always capitalized", distractors: ["they are only capitalized when you like them", "they are proper names", "capitalization of food words is optional"], explanation: "German capitalizes every noun, including food and drink words, no matter where they sit in the sentence." },
  { question: "Which is the correct German spelling of 'sweet'?", correct: "süß", distractors: ["suss", "suess", "süss"], explanation: "'süß' uses ü and ß; dropping the umlaut dots or replacing ß with 'ss' are common spelling mistakes." },
  { question: "Which is the correct German spelling of 'delicious'?", correct: "lecker", distractors: ["lekker", "lecer", "leccker"], explanation: "'lecker' has a single 'c' and a single 'k' — extra or doubled letters are a common mistake." },
  { question: "Which sentence uses correct capitalization?", correct: "Die Suppe ist salzig.", distractors: ["die Suppe ist salzig.", "Die suppe ist salzig.", "Die Suppe ist Salzig."], explanation: "'Suppe' is a noun and stays capitalized; 'salzig' is an adjective and stays lowercase." },
  { question: "Which sentence uses correct capitalization?", correct: "Der Kuchen ist sehr süß.", distractors: ["der Kuchen ist sehr süß.", "Der kuchen ist sehr süß.", "Der Kuchen ist sehr Süß."], explanation: "'Kuchen' is a noun and keeps its capital; 'süß' is an adjective describing it and stays lowercase." },
  { question: "A friend writes 'was isst du gern?' but forgets one capital. What is missing?", correct: "the sentence-initial 'Was' needs a capital letter", distractors: ["nothing is missing", "'isst' should be capitalized", "'gern' should be capitalized"], explanation: "The corrected sentence is 'Was isst du gern?' — only the sentence-start needs a capital here, since no noun appears." },
  { question: "Which word correctly uses the ü umlaut in a food sentence?", correct: "Gemüse", distractors: ["Gemuse", "Gemuese", "Gemüce"], explanation: "'Gemüse' (vegetables) is spelled with ü; dropping the umlaut dots to write 'Gemuse' is a common mistake." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Was", "isst du", "gern?"], sentence: "Was isst du gern? (What do you like eating?)" },
  { chunks: ["Ich esse", "gern", "Brot."], sentence: "Ich esse gern Brot. (I like eating bread.)" },
  { chunks: ["Der Kuchen", "ist", "sehr süß."], sentence: "Der Kuchen ist sehr süß. (The cake is very sweet.)" },
  { chunks: ["Die Suppe", "ist", "zu salzig."], sentence: "Die Suppe ist zu salzig. (The soup is too salty.)" },
  { chunks: ["Ich trinke", "gern", "Wasser und Milch."], sentence: "Ich trinke gern Wasser und Milch. (I like drinking water and milk.)" },
  { chunks: ["Ich esse", "nicht gern", "Fleisch."], sentence: "Ich esse nicht gern Fleisch. (I do not like eating meat.)" },
  { chunks: ["Der Fisch", "schmeckt", "lecker."], sentence: "Der Fisch schmeckt lecker. (The fish tastes delicious.)" },
  { chunks: ["Das Obst", "ist", "frisch und süß."], sentence: "Das Obst ist frisch und süß. (The fruit is fresh and sweet.)" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string; accepted?: string[] }[] = [
  { before: "The German word for \"bread\" is das ", after: ".", correct: "Brot" },
  { before: "The German word for \"cake\" is der ", after: ".", correct: "Kuchen" },
  { before: "The German word for \"soup\" is die ", after: ".", correct: "Suppe" },
  { before: "The German word for \"vegetables\" is das ", after: ".", correct: "Gemüse", accepted: umlautAccepted("Gemüse") },
  { before: "The German word for \"cheese\" is der ", after: ".", correct: "Käse", accepted: umlautAccepted("Käse") },
  { before: "The German word for \"sweet\" is ", after: ".", correct: "süß", accepted: umlautAccepted("süß") },
  { before: "The German word for \"salty\" is ", after: ".", correct: "salzig" },
  { before: "The German word for \"sour\" is ", after: ".", correct: "sauer" },
  { before: "The German word for \"spicy\" is ", after: ".", correct: "scharf" },
  { before: "The German word for \"delicious\" is ", after: ".", correct: "lecker" },
];

export const foodsWriting: Skill = {
  id: "g6-de-w-foods",
  code: "W.6",
  subjectId: "german",
  strandId: "g6-de-writing",
  grade: 6,
  title: "Functional writing: foods and drinks",
  description: "Practise writing food preferences (Was isst du gern? Ich esse gern Brot.) and describing taste with flavour words (Der Kuchen ist süß. Die Suppe ist salzig.), with correct word spacing and German noun capitalization.",
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
        hint: "Food and drink nouns always keep their capital letter, and words like süß/Gemüse/Käse keep their exact umlaut spelling.",
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
        "Work out the correct word order for this German sentence about food.",
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
        acceptedAnswers: f.accepted,
        inputMode: "text",
        hint: "Think about correct spelling for food, drink, and flavour words, including any umlaut or ß.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "categorize") {
      const useFlavours = rng() < 0.4;
      if (useFlavours) {
        const chosen = shuffle(rng, FLAVOUR_VOCAB).slice(0, 5);
        const bucketOf = (w: string) => (["süß", "salzig", "sauer", "scharf"].includes(w) ? "Taste word" : "Verb");
        const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
        const correctBucket: Record<string, string> = {};
        chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
        const prompts = [
          "Sort each word into the correct category before you write about taste.",
          "Group these German taste words the way you would plan a paragraph.",
          "Sort each word into the correct writing category.",
          "Classify each flavour word you might write about.",
          "Which category would you write each word under?",
          "Before writing, sort each flavour word into its correct group.",
          "Organise these flavour words into the right categories.",
          "Plan your writing: sort each word into the category it belongs to.",
          "Which group does each German flavour word belong to?",
          "Sort these words the way you would before drafting a paragraph.",
          "Group each flavour word correctly before using it in your writing.",
          "Match each flavour word to the category it fits.",
        ];
        return {
          kind: "categorize",
          prompt: randChoice(rng, prompts),
          items: shuffle(rng, items),
          buckets: [
            { id: "Taste word", label: "Taste word" },
            { id: "Verb", label: "Verb" },
          ],
          correctBucket,
          hint: "A taste word describes how food tastes; 'schmecken' is the verb 'to taste'.",
          explanation: chosen.map((c) => `"${c.word}" is a ${bucketOf(c.word).toLowerCase()}.`).join(" "),
        };
      }
      const chosen = shuffle(rng, FOOD_VOCAB).slice(0, 6);
      const bucketOf = (w: string) =>
        ["die Milch", "das Wasser", "der Tee", "der Saft"].includes(w) ? "Drink" : "Food";
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      const prompts = [
        "Sort each word into food or drink before writing about it.",
        "Group these German words the way you would plan a paragraph about a meal.",
        "Sort each word into the correct writing category.",
        "Classify each food or drink word you might write about.",
        "Which category would you write each word under?",
        "Before writing, sort each word into its correct group.",
        "Organise these words into the right categories.",
        "Plan your writing: sort each word into the category it belongs to.",
        "Which group does each German word belong to?",
        "Sort these words the way you would before drafting a paragraph.",
        "Group each word correctly before using it in your writing.",
        "Match each food or drink word to the category it fits.",
      ];
      return {
        kind: "categorize",
        prompt: randChoice(rng, prompts),
        items: shuffle(rng, items),
        buckets: [
          { id: "Food", label: "Food" },
          { id: "Drink", label: "Drink" },
        ],
        correctBucket,
        hint: "Think about whether you eat or drink each item before sorting it.",
        explanation: chosen.map((c) => `"${c.word}" is a ${bucketOf(c.word).toLowerCase()}.`).join(" "),
      };
    }

    const pool = shuffle(rng, FOOD_VOCAB).slice(0, 5);
    const tokens = pool.map((c, i) => ({ id: `t${i}`, label: c.word }));
    const targets = shuffle(rng, pool.map((c, i) => ({ id: `g${i}`, label: c.meaning })));
    const correctMap: Record<string, string> = {};
    pool.forEach((_, i) => (correctMap[`g${i}`] = `t${i}`));
    const prompts = [
      "Match each German food or drink word to its English meaning.",
      "Click to match each word with the correct meaning.",
      "Pair each German food word with what it means in English.",
      "Match the German words to their correct English meanings.",
      "Which English meaning matches each German word? Match them.",
      "Connect each German word to its English translation.",
      "Match each word you would write in German to its meaning.",
      "Pair up the German words with their English meanings.",
      "Match each food word to its correct meaning before you write it.",
      "Click the matching pairs of German words and English meanings.",
      "Match these German food words to what they mean.",
      "Link each German food word to its English meaning.",
    ];
    return {
      kind: "click-match",
      prompt: randChoice(rng, prompts),
      tokens,
      targets,
      correctMap,
      hint: "Recall the German food or drink word for each meaning before matching.",
      explanation: pool.map((c) => `"${c.word}" means "${c.meaning}".`).join(" "),
    };
  },
};
