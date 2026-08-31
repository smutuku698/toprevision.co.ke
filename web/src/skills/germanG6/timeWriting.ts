import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { MONTHS, HOLIDAY_VOCAB } from "./shared";

// Sub-strand W.4 Creative Writing — Theme: Time (Months of the Year).
// Content: correct word spacing and German noun capitalization when writing the months of the
// year, holiday vocabulary from dictation (Weihnachten, Ostern, Schulferien, Osterferien), and
// sentence construction about when holidays fall in the year.

const SPACING_ITEMS: { correct: string; squished: string; brokenUp: string; meaning: string }[] = [
  { correct: "Mein Geburtstag ist im April", squished: "MeinGeburtstagist im April", brokenUp: "Mei n Ge burts tag is t im A pril", meaning: "my birthday is in April" },
  { correct: "Weihnachten ist im Dezember", squished: "Weihnachtenist im Dezember", brokenUp: "Weih nach ten is t im De zem ber", meaning: "Christmas is in December" },
  { correct: "Ostern ist im März oder April", squished: "Osternist im Märzoder April", brokenUp: "Os tern is t im Mär z o der A pril", meaning: "Easter is in March or April" },
  { correct: "Die Schulferien beginnen im August", squished: "DieSchulferien beginnen im August", brokenUp: "Di e Schul fe ri en be gin nen im Au gust", meaning: "the school holidays begin in August" },
  { correct: "Der erste Monat ist Januar", squished: "Dererste Monatist Januar", brokenUp: "De r ers te Mo nat is t Ja nu ar", meaning: "the first month is January" },
  { correct: "Der letzte Monat ist Dezember", squished: "Derletzte Monatist Dezember", brokenUp: "De r letz te Mo nat is t De zem ber", meaning: "the last month is December" },
  { correct: "Die Osterferien sind kurz", squished: "DieOsterferien sind kurz", brokenUp: "Di e Os ter fe ri en si nd kurz", meaning: "the Easter holidays are short" },
  { correct: "Neujahr ist am ersten Januar", squished: "Neujahrist am ersten Januar", brokenUp: "Neu jahr is t am ers ten Ja nu ar", meaning: "New Year is on the first of January" },
  { correct: "Juli und August sind Sommermonate", squished: "Juliund August sind Sommermonate", brokenUp: "Ju li und Au gust si nd Som mer mo na te", meaning: "July and August are summer months" },
  { correct: "Wann beginnen die Sommerferien", squished: "Wannbeginnen die Sommerferien", brokenUp: "Wann be gin nen di e Som mer fe ri en", meaning: "when do the summer holidays begin" },
];

const ORTHO_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "Which is the correctly capitalized way to write the month 'March'?", correct: "März", distractors: ["märz", "MÄRZ used mid-sentence", "Marz"], explanation: "'März' is a noun (month names are nouns in German) and keeps its capital ä." },
  { question: "Which is the correctly capitalized way to write 'Christmas' in a sentence?", correct: "Weihnachten", distractors: ["weihnachten", "WeihNachten", "Weinachten"], explanation: "'Weihnachten' is a noun, always capitalized, and spelled with 'ih', not a single 'i'." },
  { question: "A learner writes 'ostern ist im märz.' What capitalization mistake did they make?", correct: "'ostern' and 'märz' (both nouns) should be capitalized: 'Ostern' and 'März'", distractors: ["'ist' should be capitalized", "'im' should be capitalized", "nothing is wrong"], explanation: "'Ostern' and 'März' are nouns, so German capitalizes both: 'Ostern ist im März.'" },
  { question: "Which rule explains why all twelve month names are capitalized in German?", correct: "month names are nouns, and German nouns are always capitalized", distractors: ["month names are only capitalized at the start of a sentence", "month names are proper names, unlike ordinary nouns", "it is optional to capitalize month names"], explanation: "German treats month names as ordinary nouns, so they always keep their capital letter." },
  { question: "Which is the correct German spelling of 'school holidays'?", correct: "Schulferien", distractors: ["Schoolferien", "Schuhlferien", "Schullferien"], explanation: "'Schulferien' is one compound noun: Schul- + -ferien, with no extra letters." },
  { question: "Which is the correct German spelling of 'Easter holidays'?", correct: "Osterferien", distractors: ["Ostenferien", "Ostererferien", "Osterferein"], explanation: "'Osterferien' combines Oster- + -ferien with the letters in the correct order." },
  { question: "Which sentence uses correct capitalization?", correct: "Die Sommerferien beginnen im Juli.", distractors: ["die sommerferien beginnen im Juli.", "Die Sommerferien beginnen im juli.", "Die sommerferien beginnen im juli."], explanation: "'Sommerferien' and 'Juli' are both nouns and stay capitalized throughout the sentence." },
  { question: "Which sentence uses correct capitalization?", correct: "Weihnachten ist im Dezember.", distractors: ["weihnachten ist im dezember.", "Weihnachten ist im dezember.", "weihnachten ist im Dezember."], explanation: "'Weihnachten' and 'Dezember' are nouns and both need their capital letters, along with the sentence start." },
  { question: "A friend writes 'wann beginnen die schulferien?' at the start of a message. What is missing?", correct: "the sentence-initial 'Wann' and the noun 'Schulferien' both need capitals", distractors: ["nothing is missing", "'beginnen' should be capitalized", "'die' should be capitalized"], explanation: "The corrected sentence is 'Wann beginnen die Schulferien?'" },
  { question: "Which word correctly uses the ä umlaut?", correct: "März", distractors: ["Marz", "Maerz used in formal writing", "Märtz"], explanation: "'März' (March) is spelled with ä; dropping the umlaut dots to write 'Marz' is a common mistake." },
];

const MONTH_ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Der erste Monat", "des Jahres", "ist Januar."], sentence: "Der erste Monat des Jahres ist Januar. (The first month of the year is January.)" },
  { chunks: ["Mein Geburtstag", "ist", "im April."], sentence: "Mein Geburtstag ist im April. (My birthday is in April.)" },
  { chunks: ["Weihnachten", "feiern wir", "im Dezember."], sentence: "Weihnachten feiern wir im Dezember. (We celebrate Christmas in December.)" },
  { chunks: ["Die Schulferien", "beginnen", "im August."], sentence: "Die Schulferien beginnen im August. (The school holidays begin in August.)" },
  { chunks: ["Ostern", "ist", "im März oder April."], sentence: "Ostern ist im März oder April. (Easter is in March or April.)" },
  { chunks: ["Juli und August", "sind", "die Sommermonate."], sentence: "Juli und August sind die Sommermonate. (July and August are the summer months.)" },
  { chunks: ["Der letzte Monat", "des Jahres", "ist Dezember."], sentence: "Der letzte Monat des Jahres ist Dezember. (The last month of the year is December.)" },
  { chunks: ["Neujahr", "ist", "am ersten Januar."], sentence: "Neujahr ist am ersten Januar. (New Year is on the first of January.)" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "The month after Januar is ", after: ".", correct: "Februar" },
  { before: "The month before April is ", after: ".", correct: "März" },
  { before: "The seventh month of the year is ", after: ".", correct: "Juli" },
  { before: "The last month of the year is ", after: ".", correct: "Dezember" },
  { before: "The German word for \"Christmas\" is ", after: ".", correct: "Weihnachten" },
  { before: "The German word for \"Easter\" is ", after: ".", correct: "Ostern" },
  { before: "The German word for \"school holidays\" is ", after: ".", correct: "Schulferien" },
  { before: "The German word for \"summer holidays\" is ", after: ".", correct: "Sommerferien" },
  { before: "The German word for \"New Year\" is ", after: ".", correct: "Neujahr" },
  { before: "The German word for \"birthday\" is der ", after: ".", correct: "Geburtstag" },
];

export const timeWriting: Skill = {
  id: "g6-de-w-time",
  code: "W.4",
  subjectId: "german",
  strandId: "g6-de-writing",
  grade: 6,
  title: "Creative writing: time (months of the year)",
  description: "Practise writing the months of the year and holiday vocabulary from dictation, with correct word spacing and German noun capitalization, for creative writing about Weihnachten, Ostern, Schulferien, and Osterferien.",
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
        hint: "Month names and holiday words are nouns in German, so they always keep their capital letter and their exact umlaut spelling.",
        explanation: q.explanation,
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, MONTH_ORDER_SETS);
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
        "Work out the correct word order for this German sentence about time.",
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
        hint: "Think about the order of the months and correct spelling of holiday words.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "categorize") {
      const useHolidays = rng() < 0.5;
      if (useHolidays) {
        const chosen = shuffle(rng, HOLIDAY_VOCAB).slice(0, 5);
        const bucketOf = (w: string) =>
          ["Weihnachten", "Ostern", "Neujahr", "der Geburtstag"].includes(w) ? "Special day" : "Holiday period";
        const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
        const correctBucket: Record<string, string> = {};
        chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
        const prompts = [
          "Sort each word into the correct category before you write about it.",
          "Group these German holiday words the way you would plan a paragraph.",
          "Sort each word into the correct writing category.",
          "Classify each holiday word you might write about.",
          "Which category would you write each word under?",
          "Before writing, sort each holiday word into its correct group.",
          "Organise these holiday words into the right categories.",
          "Plan your writing: sort each word into the category it belongs to.",
          "Which group does each German holiday word belong to?",
          "Sort these words the way you would before drafting a paragraph.",
          "Group each holiday word correctly before using it in your writing.",
          "Match each holiday word to the category it fits.",
        ];
        return {
          kind: "categorize",
          prompt: randChoice(rng, prompts),
          items: shuffle(rng, items),
          buckets: [
            { id: "Special day", label: "Special day" },
            { id: "Holiday period", label: "Holiday period" },
          ],
          correctBucket,
          hint: "A special day happens on one date; a holiday period lasts several days or weeks.",
          explanation: chosen.map((c) => `"${c.word}" is a ${bucketOf(c.word).toLowerCase()} word.`).join(" "),
        };
      }
      const chosen = shuffle(rng, MONTHS).slice(0, 6);
      const bucketOf = (o: number) => (o <= 6 ? "First half of the year" : "Second half of the year");
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.order)));
      const prompts = [
        "Sort each month into the correct half of the year.",
        "Group these German months by when they fall in the year.",
        "Sort each month into the correct writing category.",
        "Classify each month you might write about.",
        "Which half of the year does each month belong to?",
        "Before writing, sort each month into its correct group.",
        "Organise these months into the right categories.",
        "Plan your writing: sort each month into the half it belongs to.",
        "Which group does each German month belong to?",
        "Sort these months the way you would before drafting a paragraph.",
        "Group each month correctly before using it in your writing.",
        "Match each month to the half of the year it fits.",
      ];
      return {
        kind: "categorize",
        prompt: randChoice(rng, prompts),
        items: shuffle(rng, items),
        buckets: [
          { id: "First half of the year", label: "First half of the year" },
          { id: "Second half of the year", label: "Second half of the year" },
        ],
        correctBucket,
        hint: "Months 1-6 (Januar-Juni) are the first half; months 7-12 (Juli-Dezember) are the second half.",
        explanation: chosen.map((c) => `"${c.word}" is month ${c.order}, in the ${bucketOf(c.order).toLowerCase()}.`).join(" "),
      };
    }

    const pool = shuffle(rng, MONTHS).slice(0, 5);
    const tokens = pool.map((c, i) => ({ id: `t${i}`, label: c.word }));
    const targets = shuffle(rng, pool.map((c, i) => ({ id: `g${i}`, label: c.meaning })));
    const correctMap: Record<string, string> = {};
    pool.forEach((_, i) => (correctMap[`g${i}`] = `t${i}`));
    const prompts = [
      "Match each German month to its English meaning.",
      "Click to match each month with the correct meaning.",
      "Pair each German month with what it means in English.",
      "Match the German months to their correct English meanings.",
      "Which English meaning matches each German month? Match them.",
      "Connect each German month to its English translation.",
      "Match each month you would write in German to its meaning.",
      "Pair up the German months with their English meanings.",
      "Match each month to its correct meaning before you write it.",
      "Click the matching pairs of German months and English meanings.",
      "Match these German months to what they mean.",
      "Link each German month to its English meaning.",
    ];
    return {
      kind: "click-match",
      prompt: randChoice(rng, prompts),
      tokens,
      targets,
      correctMap,
      hint: "Recall the German month name for each meaning before matching.",
      explanation: pool.map((c) => `"${c.word}" means "${c.meaning}".`).join(" "),
    };
  },
};
