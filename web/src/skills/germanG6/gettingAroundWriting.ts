import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { POSITION_VOCAB, CLASSROOM_ITEMS, SCHOOL_VOCAB } from "./shared";

// Sub-strand W.9 Guided Writing — Theme: Getting Around (In the School). Content: correct word
// spacing and German noun capitalization when writing about position/location in the school
// (Wo liegt das Deutschbuch? Das Deutschbuch liegt auf dem Stuhl. Wo ist das Klo? Das Klo ist
// hinter dem Lehrerzimmer.), using classroom items and position words.

const SPACING_ITEMS: { correct: string; squished: string; brokenUp: string; meaning: string }[] = [
  { correct: "Wo liegt das Deutschbuch", squished: "Woliegtdas Deutschbuch", brokenUp: "Wo lie gt da s Deu tsch buch", meaning: "where is the German book lying" },
  { correct: "Das Buch liegt auf dem Stuhl", squished: "DasBuchliegtauf dem Stuhl", brokenUp: "Da s Bu ch lie gt au f de m Stuhl", meaning: "the book lies on the chair" },
  { correct: "Das Klo ist hinter dem Lehrerzimmer", squished: "DasKloisthinter dem Lehrerzimmer", brokenUp: "Da s Klo is t hin ter de m Leh rer zim mer", meaning: "the toilet is behind the staffroom" },
  { correct: "Der Stift liegt neben dem Heft", squished: "DerStiftliegtneben dem Heft", brokenUp: "De r Stif t lie gt ne ben de m Heft", meaning: "the pen lies next to the exercise book" },
  { correct: "Die Tasche ist unter dem Tisch", squished: "DieTascheistunter dem Tisch", brokenUp: "Di e Ta sche is t un ter de m Tisch", meaning: "the bag is under the table" },
  { correct: "Die Tafel hängt vor der Klasse", squished: "DieTafelhängtvor der Klasse", brokenUp: "Di e Ta fel hän gt vo r de r Klas se", meaning: "the blackboard hangs at the front of the class" },
  { correct: "Der Schrank steht zwischen den Fenstern", squished: "DerSchrankstehtzwischen den Fenstern", brokenUp: "De r Schrank ste ht zwi schen de n Fen stern", meaning: "the cupboard stands between the windows" },
  { correct: "Die Tür ist neben dem Fenster", squished: "DieTüristneben dem Fenster", brokenUp: "Di e Tü r is t ne ben de m Fen ster", meaning: "the door is next to the window" },
  { correct: "Wo ist das Klassenzimmer", squished: "Woistdas Klassenzimmer", brokenUp: "Wo is t da s Klas sen zim mer", meaning: "where is the classroom" },
  { correct: "Die Bibliothek ist über dem Büro", squished: "DieBibliothekistüber dem Büro", brokenUp: "Di e Bib li o thek is t ü ber de m Büro", meaning: "the library is above the office" },
];

const ORTHO_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "Which is the correctly capitalized way to write 'the German book'?", correct: "das Deutschbuch", distractors: ["das deutschbuch", "Das deutschbuch", "das DeutschBuch"], explanation: "'Deutschbuch' is one capitalized compound noun, not two separately capitalized words." },
  { question: "Which is the correctly capitalized way to write 'the door'?", correct: "die Tür", distractors: ["die tür", "Die tür", "die Tuer"], explanation: "'Tür' is a noun and keeps its capital letter, spelled with ü, not the digraph 'ue'." },
  { question: "A learner writes 'das buch liegt auf dem stuhl.' What capitalization mistakes did they make?", correct: "'buch' and 'stuhl' (both nouns) should be capitalized: 'Buch' and 'Stuhl'", distractors: ["'liegt' should be capitalized", "'auf' should be capitalized", "'dem' should be capitalized"], explanation: "The corrected sentence is 'Das Buch liegt auf dem Stuhl.'" },
  { question: "Which rule explains why 'Stuhl', 'Tisch', and 'Schrank' are always capitalized?", correct: "they are nouns, and German nouns are always capitalized", distractors: ["they are only capitalized when giving directions", "they are proper names", "capitalization of classroom-item nouns is optional"], explanation: "German capitalizes every noun, including classroom-item words used in location sentences." },
  { question: "Which is the correct German spelling of 'window'?", correct: "Fenster", distractors: ["Fentser", "Venster", "Fenzter"], explanation: "'Fenster' starts with 'F' and has the letters in this exact order — swapping letters is a common mistake." },
  { question: "Which is the correct German spelling of 'cupboard'?", correct: "Schrank", distractors: ["Schrang", "Schranck", "Chrank"], explanation: "'Schrank' ends in '-nk', not '-ng' or '-nck'." },
  { question: "Which sentence uses correct capitalization?", correct: "Der Stift liegt neben dem Heft.", distractors: ["der Stift liegt neben dem Heft.", "Der stift liegt neben dem heft.", "Der Stift Liegt neben dem Heft."], explanation: "'Stift' and 'Heft' are nouns and stay capitalized; 'liegt' is a verb and stays lowercase." },
  { question: "Which sentence uses correct capitalization?", correct: "Das Klo ist hinter dem Lehrerzimmer.", distractors: ["das Klo ist hinter dem Lehrerzimmer.", "Das klo ist hinter dem lehrerzimmer.", "Das Klo ist Hinter dem Lehrerzimmer."], explanation: "'Klo' and 'Lehrerzimmer' are nouns and both keep their capital letters; 'hinter' is a preposition and stays lowercase." },
  { question: "A friend writes 'wo liegt das deutschbuch?' but forgets capitals. What is missing?", correct: "the sentence-initial 'Wo' and the noun 'Deutschbuch' both need capitals", distractors: ["nothing is missing", "'liegt' should be capitalized", "'das' should be capitalized"], explanation: "The corrected sentence is 'Wo liegt das Deutschbuch?'" },
  { question: "Which word correctly uses the ü umlaut in a location sentence?", correct: "Tür", distractors: ["Tur", "Tuer", "Türe with an extra e as the only correct form"], explanation: "'Tür' (door) is spelled with ü; dropping the umlaut dots to write 'Tur' is a common mistake." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wo", "liegt", "das Deutschbuch?"], sentence: "Wo liegt das Deutschbuch? (Where is the German book lying?)" },
  { chunks: ["Das Deutschbuch", "liegt", "auf dem Stuhl."], sentence: "Das Deutschbuch liegt auf dem Stuhl. (The German book lies on the chair.)" },
  { chunks: ["Wo", "ist", "das Klo?"], sentence: "Wo ist das Klo? (Where is the toilet?)" },
  { chunks: ["Das Klo", "ist", "hinter dem Lehrerzimmer."], sentence: "Das Klo ist hinter dem Lehrerzimmer. (The toilet is behind the staffroom.)" },
  { chunks: ["Die Tasche", "liegt", "unter dem Tisch."], sentence: "Die Tasche liegt unter dem Tisch. (The bag lies under the table.)" },
  { chunks: ["Der Schrank", "steht", "neben der Tür."], sentence: "Der Schrank steht neben der Tür. (The cupboard stands next to the door.)" },
  { chunks: ["Die Bibliothek", "ist", "über dem Büro."], sentence: "Die Bibliothek ist über dem Büro. (The library is above the office.)" },
  { chunks: ["Der Stift", "liegt", "zwischen den Heften."], sentence: "Der Stift liegt zwischen den Heften. (The pen lies between the exercise books.)" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "The German word for \"on\" (position) is ", after: ".", correct: "auf" },
  { before: "The German word for \"under\" is ", after: ".", correct: "unter" },
  { before: "The German word for \"behind\" is ", after: ".", correct: "hinter" },
  { before: "The German word for \"in front of\" is ", after: ".", correct: "vor" },
  { before: "The German word for \"next to\" is ", after: ".", correct: "neben" },
  { before: "The German word for \"between\" is ", after: ".", correct: "zwischen" },
  { before: "The German word for \"above\" is ", after: ".", correct: "über" },
  { before: "The German word for \"chair\" is der ", after: ".", correct: "Stuhl" },
  { before: "The German word for \"table\" is der ", after: ".", correct: "Tisch" },
  { before: "The German word for \"door\" is die ", after: ".", correct: "Tür" },
];

export const gettingAroundWriting: Skill = {
  id: "g6-de-w-getting-around",
  code: "W.9",
  subjectId: "german",
  strandId: "g6-de-writing",
  grade: 6,
  title: "Guided writing: getting around (in the school)",
  description: "Practise writing about position and location in the school (Wo liegt das Deutschbuch? Das Deutschbuch liegt auf dem Stuhl. Wo ist das Klo? Das Klo ist hinter dem Lehrerzimmer.), with correct word spacing and German noun capitalization.",
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
        hint: "Classroom-item nouns always keep their capital letter, and words like Tür/Büro keep their exact ü spelling.",
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
        "Work out the correct word order for this German location sentence.",
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
        hint: "Think about correct spelling for position words and classroom items, including any umlaut.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "categorize") {
      const usePositions = rng() < 0.4;
      if (usePositions) {
        const chosen = shuffle(rng, POSITION_VOCAB).slice(0, 5);
        const bucketOf = (w: string) => (["auf", "über", "vor"].includes(w) ? "Above/on/in front" : "Below/behind/beside");
        const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
        const correctBucket: Record<string, string> = {};
        chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
        const prompts = [
          "Sort each position word into the correct category before you write.",
          "Group these German position words the way you would plan directions.",
          "Sort each word into the correct writing category.",
          "Classify each position word you might write about.",
          "Which category would you write each word under?",
          "Before writing, sort each position word into its correct group.",
          "Organise these position words into the right categories.",
          "Plan your writing: sort each word into the category it belongs to.",
          "Which group does each German position word belong to?",
          "Sort these words the way you would before drafting directions.",
          "Group each position word correctly before using it in your writing.",
          "Match each position word to the category it fits.",
        ];
        return {
          kind: "categorize",
          prompt: randChoice(rng, prompts),
          items: shuffle(rng, items),
          buckets: [
            { id: "Above/on/in front", label: "Above/on/in front" },
            { id: "Below/behind/beside", label: "Below/behind/beside" },
          ],
          correctBucket,
          hint: "Picture the item's position relative to another object before sorting the word.",
          explanation: chosen.map((c) => `"${c.word}" means "${c.meaning}" — ${bucketOf(c.word).toLowerCase()}.`).join(" "),
        };
      }
      const chosen = shuffle(rng, CLASSROOM_ITEMS).slice(0, 6);
      const bucketOf = (w: string) =>
        ["das Deutschbuch", "das Heft", "der Stift"].includes(w) ? "Something you write with/in" : "Classroom furniture";
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      const prompts = [
        "Sort each classroom item into the correct category before you write about it.",
        "Group these German classroom items the way you would plan a paragraph.",
        "Sort each item into the correct writing category.",
        "Classify each classroom item you might write about.",
        "Which category would you write each item under?",
        "Before writing, sort each classroom item into its correct group.",
        "Organise these classroom items into the right categories.",
        "Plan your writing: sort each item into the category it belongs to.",
        "Which group does each German classroom item belong to?",
        "Sort these items the way you would before drafting a paragraph.",
        "Group each classroom item correctly before using it in your writing.",
        "Match each classroom item to the category it fits.",
      ];
      return {
        kind: "categorize",
        prompt: randChoice(rng, prompts),
        items: shuffle(rng, items),
        buckets: [
          { id: "Something you write with/in", label: "Something you write with/in" },
          { id: "Classroom furniture", label: "Classroom furniture" },
        ],
        correctBucket,
        hint: "Writing tools/materials go in one group; furniture you sit at or store things in goes in the other.",
        explanation: chosen.map((c) => `"${c.word}" is ${bucketOf(c.word).toLowerCase()}.`).join(" "),
      };
    }

    const pool = shuffle(rng, SCHOOL_VOCAB).slice(0, 5);
    const tokens = pool.map((c, i) => ({ id: `t${i}`, label: c.word }));
    const targets = shuffle(rng, pool.map((c, i) => ({ id: `g${i}`, label: c.meaning })));
    const correctMap: Record<string, string> = {};
    pool.forEach((_, i) => (correctMap[`g${i}`] = `t${i}`));
    const prompts = [
      "Match each German place-in-school word to its English meaning.",
      "Click to match each word with the correct meaning.",
      "Pair each German school word with what it means in English.",
      "Match the German words to their correct English meanings.",
      "Which English meaning matches each German word? Match them.",
      "Connect each German word to its English translation.",
      "Match each word you would write in German to its meaning.",
      "Pair up the German words with their English meanings.",
      "Match each school word to its correct meaning before you write it.",
      "Click the matching pairs of German words and English meanings.",
      "Match these German school words to what they mean.",
      "Link each German school word to its English meaning.",
    ];
    return {
      kind: "click-match",
      prompt: randChoice(rng, prompts),
      tokens,
      targets,
      correctMap,
      hint: "Recall the German word for each place in the school before matching.",
      explanation: pool.map((c) => `"${c.word}" means "${c.meaning}".`).join(" "),
    };
  },
};
