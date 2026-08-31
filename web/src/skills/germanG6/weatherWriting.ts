import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { WEATHER_VOCAB, WEATHER_PLACES } from "./shared";

// Sub-strand W.8 Functional Writing — Theme: Weather and Environment (Weather Conditions).
// Content: correct word spacing and German noun capitalization when writing weather reports
// (Es scheint. Es regnet.), and Kenya-localized weather sentences (Kisumu ist warm. Nyeri ist
// kalt.) for functional writing about places and their weather.

const SPACING_ITEMS: { correct: string; squished: string; brokenUp: string; meaning: string }[] = [
  { correct: "Es scheint heute", squished: "Esscheintheute", brokenUp: "Es schein t heu te", meaning: "it is sunny today" },
  { correct: "Es regnet stark", squished: "Esregnetstark", brokenUp: "Es re gne t stark", meaning: "it is raining hard" },
  { correct: "Es ist warm in Kisumu", squished: "Esistwarmin Kisumu", brokenUp: "Es is t wa rm in Ki su mu", meaning: "it is warm in Kisumu" },
  { correct: "Es ist kalt in Nyeri", squished: "Esistkaltin Nyeri", brokenUp: "Es is t kal t in Nye ri", meaning: "it is cold in Nyeri" },
  { correct: "Es ist heute windig", squished: "Esistheutewindig", brokenUp: "Es is t heu te win dig", meaning: "it is windy today" },
  { correct: "Der Himmel ist wolkig", squished: "DerHimmelist wolkig", brokenUp: "De r Him mel is t wol kig", meaning: "the sky is cloudy" },
  { correct: "Es ist sehr heiß", squished: "Esistsehrheiß", brokenUp: "Es is t seh r heiß", meaning: "it is very hot" },
  { correct: "Es ist trocken hier", squished: "Esistrockenhier", brokenUp: "Es is t tro cken hier", meaning: "it is dry here" },
  { correct: "Wie ist das Wetter", squished: "Wieistdas Wetter", brokenUp: "Wi e is t da s Wet ter", meaning: "how is the weather" },
  { correct: "Es donnert und blitzt", squished: "Esdonnertundblitzt", brokenUp: "Es don ner t un d blitzt", meaning: "it is thundering and lightning" },
];

const ORTHO_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "Which is the correctly capitalized way to write 'the sky is cloudy'?", correct: "Der Himmel ist wolkig.", distractors: ["der Himmel ist wolkig.", "Der himmel ist wolkig.", "Der Himmel ist Wolkig."], explanation: "'Himmel' is a noun and keeps its capital letter; 'wolkig' is an adjective and stays lowercase." },
  { question: "Which is the correctly capitalized way to write 'how is the weather?'", correct: "Wie ist das Wetter?", distractors: ["wie ist das Wetter?", "Wie ist das wetter?", "Wie Ist das Wetter?"], explanation: "'Wetter' is a noun and keeps its capital letter; the sentence-initial 'Wie' is also capitalized." },
  { question: "A learner writes 'wie ist das wetter heute?' What capitalization mistake did they make?", correct: "'wie' (sentence start) and 'wetter' (a noun) should both be capitalized", distractors: ["'ist' should be capitalized", "'heute' should be capitalized", "nothing is wrong"], explanation: "The corrected sentence is 'Wie ist das Wetter heute?'" },
  { question: "Which rule explains why 'Himmel' and 'Wetter' are always capitalized in German?", correct: "they are nouns, and German nouns are always capitalized", distractors: ["they are only capitalized in weather reports", "they are proper names", "capitalization of weather nouns is optional"], explanation: "German capitalizes every noun, including weather words like Himmel (sky) and Wetter (weather)." },
  { question: "Which is the correct German spelling of 'hot'?", correct: "heiß", distractors: ["heiss", "heis", "heisz"], explanation: "'heiß' uses ß; replacing it with 'ss' or a plain 's' is a common spelling mistake." },
  { question: "Which is the correct German spelling of 'foggy'?", correct: "neblig", distractors: ["neblich", "nebelig used as the only correct form", "nebbelig"], explanation: "'neblig' has a single 'b' and ends in '-lig' — a common mistake is adding extra letters." },
  { question: "Which sentence uses correct capitalization?", correct: "Es ist warm in Kisumu.", distractors: ["es ist warm in Kisumu.", "Es ist warm in kisumu.", "Es Ist warm in Kisumu."], explanation: "'Kisumu' is a place name and stays capitalized; 'warm' is an adjective and stays lowercase." },
  { question: "Which sentence uses correct capitalization?", correct: "Es ist kalt in Nyeri.", distractors: ["es ist kalt in Nyeri.", "Es ist kalt in nyeri.", "Es Ist kalt in Nyeri."], explanation: "'Nyeri' is a place name and always keeps its capital letter, wherever it sits in the sentence." },
  { question: "A friend writes 'es donnert und blitzt.' at the end of a weather report. Is the capitalization correct?", correct: "yes — 'Es' starts the sentence, and 'donnert'/'blitzt' are verbs that stay lowercase", distractors: ["no — 'donnert' should be capitalized", "no — 'blitzt' should be capitalized", "no — all three words should be capitalized"], explanation: "Only nouns and sentence-starting words are capitalized in German; verbs like 'donnert' and 'blitzt' stay lowercase." },
  { question: "Which word correctly uses the ei/ß combination for 'hot'?", correct: "heiß", distractors: ["hiess", "heiz", "haiß"], explanation: "'heiß' (hot) is spelled 'hei-' followed by ß, not 'ie' or a doubled 's'." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie", "ist", "das Wetter heute?"], sentence: "Wie ist das Wetter heute? (How is the weather today?)" },
  { chunks: ["Es ist warm", "in", "Kisumu."], sentence: "Es ist warm in Kisumu. (It is warm in Kisumu.)" },
  { chunks: ["Es ist kalt", "in", "Nyeri."], sentence: "Es ist kalt in Nyeri. (It is cold in Nyeri.)" },
  { chunks: ["Der Himmel", "ist", "heute wolkig."], sentence: "Der Himmel ist heute wolkig. (The sky is cloudy today.)" },
  { chunks: ["Es regnet", "stark", "in Eldoret."], sentence: "Es regnet stark in Eldoret. (It is raining hard in Eldoret.)" },
  { chunks: ["Es ist", "heiß und trocken", "in Mombasa."], sentence: "Es ist heiß und trocken in Mombasa. (It is hot and dry in Mombasa.)" },
  { chunks: ["Heute", "ist es", "sehr windig."], sentence: "Heute ist es sehr windig. (Today it is very windy.)" },
  { chunks: ["Es donnert,", "und", "es blitzt."], sentence: "Es donnert, und es blitzt. (It is thundering, and it is lightning.)" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "The German for \"it is raining\" is Es ", after: ".", correct: "regnet" },
  { before: "The German for \"it is shining/sunny\" is Es ", after: ".", correct: "scheint" },
  { before: "The German word for \"warm\" is ", after: ".", correct: "warm" },
  { before: "The German word for \"cold\" is ", after: ".", correct: "kalt" },
  { before: "The German word for \"hot\" is ", after: ".", correct: "heiß" },
  { before: "The German word for \"cloudy\" is ", after: ".", correct: "wolkig" },
  { before: "The German word for \"windy\" is ", after: ".", correct: "windig" },
  { before: "The German word for \"dry\" is ", after: ".", correct: "trocken" },
  { before: "The German word for \"foggy\" is ", after: ".", correct: "neblig" },
  { before: "The German word for \"weather\" is das ", after: ".", correct: "Wetter" },
];

export const weatherWriting: Skill = {
  id: "g6-de-w-weather",
  code: "W.8",
  subjectId: "german",
  strandId: "g6-de-writing",
  grade: 6,
  title: "Functional writing: weather and environment",
  description: "Practise writing weather reports (Es scheint. Es regnet.) and Kenya-localized weather sentences (Kisumu ist warm. Nyeri ist kalt.), with correct word spacing and German noun capitalization.",
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
        "A classmate re-wrote a German weather sentence three ways — which has correct spacing for",
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
        hint: "Weather nouns like Himmel/Wetter and Kenyan place names always keep their capital letter; ß in heiß is never replaced with 'ss'.",
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
        "Put the pieces in order to write this German weather sentence neatly.",
        "Work out the correct word order for this German weather sentence.",
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
        hint: "Think about correct spelling for weather words, including ß in heiß.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "categorize") {
      const useCities = rng() < 0.4;
      if (useCities) {
        const chosen = shuffle(rng, WEATHER_PLACES).slice(0, 3);
        const bucketOf = (w: string) => (w.includes("warm") || w.includes("heiß") ? "Warm weather" : "Cool weather");
        const items = chosen.map((c, i) => ({ id: `${i}-${c.place}`, label: c.place }));
        const correctBucket: Record<string, string> = {};
        chosen.forEach((c, i) => (correctBucket[`${i}-${c.place}`] = bucketOf(c.weather)));
        const prompts = [
          "Sort each Kenyan town by the weather described for it.",
          "Group these towns by their weather word.",
          "Sort each place into the correct weather category.",
          "Classify each town by the weather you would write about it.",
          "Which category would you write each town under?",
          "Before writing, sort each town into its correct weather group.",
          "Organise these towns into the right weather categories.",
          "Plan your writing: sort each town into the category it belongs to.",
          "Which weather group does each town belong to?",
          "Sort these towns the way you would before drafting a weather report.",
          "Group each town correctly by its weather.",
          "Match each town to the weather category it fits.",
        ];
        return {
          kind: "categorize",
          prompt: randChoice(rng, prompts),
          items: shuffle(rng, items),
          buckets: [
            { id: "Warm weather", label: "Warm weather" },
            { id: "Cool weather", label: "Cool weather" },
          ],
          correctBucket,
          hint: "Recall the German weather sentence given for each town before sorting it.",
          explanation: chosen.map((c) => `"${c.weather}" — ${c.place} is ${bucketOf(c.weather).toLowerCase()}.`).join(" "),
        };
      }
      const chosen = shuffle(rng, WEATHER_VOCAB).slice(0, 6);
      const bucketOf = (w: string) =>
        ["Es ist warm", "Es ist heiß", "Es scheint"].includes(w) ? "Warm/sunny" : "Cold/wet/cloudy";
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      const prompts = [
        "Sort each weather phrase into the correct category.",
        "Group these German weather words the way you would plan a report.",
        "Sort each phrase into the correct writing category.",
        "Classify each weather phrase you might write about.",
        "Which category would you write each phrase under?",
        "Before writing, sort each weather phrase into its correct group.",
        "Organise these weather phrases into the right categories.",
        "Plan your writing: sort each phrase into the category it belongs to.",
        "Which group does each German weather phrase belong to?",
        "Sort these phrases the way you would before drafting a report.",
        "Group each weather phrase correctly before using it in your writing.",
        "Match each weather phrase to the category it fits.",
      ];
      return {
        kind: "categorize",
        prompt: randChoice(rng, prompts),
        items: shuffle(rng, items),
        buckets: [
          { id: "Warm/sunny", label: "Warm/sunny" },
          { id: "Cold/wet/cloudy", label: "Cold/wet/cloudy" },
        ],
        correctBucket,
        hint: "Think about whether the phrase describes pleasant, warm weather or cold/wet/cloudy weather.",
        explanation: chosen.map((c) => `"${c.word}" is ${bucketOf(c.word).toLowerCase()} weather.`).join(" "),
      };
    }

    const pool = shuffle(rng, WEATHER_VOCAB).slice(0, 5);
    const tokens = pool.map((c, i) => ({ id: `t${i}`, label: c.word }));
    const targets = shuffle(rng, pool.map((c, i) => ({ id: `g${i}`, label: c.meaning })));
    const correctMap: Record<string, string> = {};
    pool.forEach((_, i) => (correctMap[`g${i}`] = `t${i}`));
    const prompts = [
      "Match each German weather phrase to its English meaning.",
      "Click to match each phrase with the correct meaning.",
      "Pair each German weather phrase with what it means in English.",
      "Match the German phrases to their correct English meanings.",
      "Which English meaning matches each German phrase? Match them.",
      "Connect each German phrase to its English translation.",
      "Match each phrase you would write in German to its meaning.",
      "Pair up the German phrases with their English meanings.",
      "Match each weather phrase to its correct meaning before you write it.",
      "Click the matching pairs of German phrases and English meanings.",
      "Match these German weather phrases to what they mean.",
      "Link each German weather phrase to its English meaning.",
    ];
    return {
      kind: "click-match",
      prompt: randChoice(rng, prompts),
      tokens,
      targets,
      correctMap,
      hint: "Recall the German weather phrase for each meaning before matching.",
      explanation: pool.map((c) => `"${c.word}" means "${c.meaning}".`).join(" "),
    };
  },
};
