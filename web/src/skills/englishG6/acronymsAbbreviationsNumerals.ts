import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Source: curriculum-reference/grade-6/english.json, Writing strand, sub-strand "3.4.1
// Mechanics of Writing — Acronyms, Abbreviations, Numerals (Etiquette - Telephone)".
// learningExperiences: "Search the internet for numerals/abbreviations/acronyms; create and
// peer-review a crossword puzzle featuring them; compose a story (150-200 words) incorporating
// common acronyms, abbreviations and numerals using idioms/similes/metaphors correctly."
// The engine has no free-text essay grading (see project standing rule), so the "compose a
// story" outcome is approximated with Evaluate-tier "which sentence uses these correctly"
// multiple-choice items (COMBINED_SENTENCES below), which also weave in an idiom per the
// outcome "Use similes, proverbs, metaphors and idioms... in a composition".

type Cluster = "government" | "international" | "everyday";

const ACRONYMS: { text: string; expansion: string; cluster: Cluster }[] = [
  { text: "NGO", expansion: "Non-Governmental Organisation", cluster: "government" },
  { text: "NTSA", expansion: "National Transport and Safety Authority", cluster: "government" },
  { text: "NHIF", expansion: "National Hospital Insurance Fund", cluster: "government" },
  { text: "KRA", expansion: "Kenya Revenue Authority", cluster: "government" },
  { text: "KDF", expansion: "Kenya Defence Forces", cluster: "government" },
  { text: "KCPE", expansion: "Kenya Certificate of Primary Education", cluster: "government" },
  { text: "KCSE", expansion: "Kenya Certificate of Secondary Education", cluster: "government" },
  { text: "UN", expansion: "United Nations", cluster: "international" },
  { text: "WHO", expansion: "World Health Organization", cluster: "international" },
  { text: "UNESCO", expansion: "United Nations Educational, Scientific and Cultural Organization", cluster: "international" },
  { text: "NASA", expansion: "National Aeronautics and Space Administration", cluster: "international" },
  { text: "USA", expansion: "United States of America", cluster: "international" },
  { text: "UK", expansion: "United Kingdom", cluster: "international" },
  { text: "ICT", expansion: "Information Communication Technology", cluster: "everyday" },
  { text: "VIP", expansion: "Very Important Person", cluster: "everyday" },
  { text: "ATM", expansion: "Automated Teller Machine", cluster: "everyday" },
  { text: "PIN", expansion: "Personal Identification Number", cluster: "everyday" },
  { text: "ID", expansion: "Identity/Identification Card", cluster: "everyday" },
  { text: "ICU", expansion: "Intensive Care Unit", cluster: "everyday" },
  { text: "SMS", expansion: "Short Message Service", cluster: "everyday" },
];

const ABBREVIATIONS: { text: string; expansion: string; cluster: Cluster }[] = [
  { text: "Mr.", expansion: "Mister", cluster: "everyday" },
  { text: "Mrs.", expansion: "Missus", cluster: "everyday" },
  { text: "Dr.", expansion: "Doctor", cluster: "everyday" },
  { text: "Prof.", expansion: "Professor", cluster: "everyday" },
  { text: "Hon.", expansion: "Honourable", cluster: "everyday" },
  { text: "Rev.", expansion: "Reverend", cluster: "everyday" },
  { text: "Capt.", expansion: "Captain", cluster: "everyday" },
  { text: "St.", expansion: "Street", cluster: "everyday" },
  { text: "Rd.", expansion: "Road", cluster: "everyday" },
  { text: "Ave.", expansion: "Avenue", cluster: "everyday" },
  { text: "P.O.", expansion: "Post Office", cluster: "everyday" },
  { text: "Jan.", expansion: "January", cluster: "everyday" },
  { text: "Feb.", expansion: "February", cluster: "everyday" },
  { text: "Mon.", expansion: "Monday", cluster: "everyday" },
  { text: "Tue.", expansion: "Tuesday", cluster: "everyday" },
  { text: "kg", expansion: "kilogram", cluster: "everyday" },
  { text: "km", expansion: "kilometre", cluster: "everyday" },
  { text: "cm", expansion: "centimetre", cluster: "everyday" },
  { text: "e.g.", expansion: "for example", cluster: "everyday" },
  { text: "etc.", expansion: "and so on", cluster: "everyday" },
];

type CategorizeItem = { id: string; label: string; type: "acronym" | "abbreviation" | "numeral" };

const NUMERAL_SAMPLES: string[] = [
  "0712 345 678", "14th March 2026", "Ksh 1,250", "7:30 a.m.", "45,000 people", "2nd July 2026",
  "Ksh 500", "10:15 p.m.", "90 km/h", "1,000 pupils", "9th June", "6:45 a.m.",
];

const NUMBER_WORDS: { words: string; value: number; max: number }[] = [
  { words: "forty-five", value: 45, max: 100 },
  { words: "sixty-three", value: 63, max: 100 },
  { words: "eighty-two", value: 82, max: 100 },
  { words: "seventeen", value: 17, max: 100 },
  { words: "ninety-nine", value: 99, max: 100 },
  { words: "twenty-eight", value: 28, max: 100 },
  { words: "fifty-one", value: 51, max: 100 },
  { words: "one hundred and twenty", value: 120, max: 200 },
  { words: "two hundred and ten", value: 210, max: 300 },
  { words: "three hundred and fifty", value: 350, max: 500 },
  { words: "seven hundred", value: 700, max: 1000 },
  { words: "nine hundred and five", value: 905, max: 1000 },
];

// Evaluate-tier: each entry has exactly one specific, nameable error per wrong option (numeral
// spelled out where digits are expected, wrong capitalisation of an acronym/title, or stray
// punctuation around a numeral) — a curated confusable cluster, not an arbitrary distractor pool.
const COMBINED_SENTENCES: { correct: string; wrongs: string[] }[] = [
  {
    correct: "Dr. Achieng treated 45 patients at the clinic on Monday.",
    wrongs: [
      "Doctor Achieng treated forty-five patients at the clinic on Monday.",
      "dr. achieng treated 45 patients at the clinic on monday.",
      "Dr Achieng treated 45, patients at the clinic on Monday.",
    ],
  },
  {
    correct: "The NTSA officer recorded the matatu's speed as 90 km/h.",
    wrongs: [
      "The N.T.S.A officer recorded the matatu's speed as ninety km/h.",
      "The ntsa officer recorded the matatu's speed as 90 km/h.",
      "The NTSA officer recorded the matatu's speed as 90, km/h.",
    ],
  },
  {
    correct: "Mrs. Wanjiru's shop opens at 7:30 a.m. every day except Sunday.",
    wrongs: [
      "Mrs Wanjiru's shop opens at seven thirty a.m. every day except Sunday.",
      "mrs. wanjiru's shop opens at 7:30 a.m. every day except sunday.",
      "Mrs. Wanjiru's shop opens at 7.30. a.m every day except Sunday.",
    ],
  },
  {
    correct: "The KCPE results showed that 1,250 candidates sat the exam at that centre.",
    wrongs: [
      "The kcpe results showed that 1,250 candidates sat the exam at that centre.",
      "The KCPE results showed that one thousand two hundred and fifty candidates sat the exam at that centre.",
      "The K.C.P.E results showed that 1250, candidates sat the exam at that centre.",
    ],
  },
  {
    correct: "Prof. Barasa's office is on 3rd Avenue, opposite the NHIF building.",
    wrongs: [
      "Professor Barasa's office is on third avenue, opposite the NHIF building.",
      "Prof. Barasa's office is on 3rd Avenue, opposite the nhif building.",
      "prof. barasa's office is on 3rd Avenue, opposite the NHIF building.",
    ],
  },
  {
    correct: "By 2:00 p.m., the ATM at the KRA office had run out of cash.",
    wrongs: [
      "By two o'clock p.m., the ATM at the KRA office had run out of cash.",
      "By 2:00 p.m., the atm at the kra office had run out of cash.",
      "By 2.00. p.m, the ATM at the KRA office had run out of cash.",
    ],
  },
  {
    correct: "Capt. Njoroge's flight to the UK departs at 6:45 a.m. on 14th July.",
    wrongs: [
      "Captain Njoroge's flight to the u.k departs at six forty-five a.m. on 14th July.",
      "Capt Njoroge's flight to the UK departs at 6:45 a.m. on fourteenth July.",
      "capt. njoroge's flight to the UK departs at 6:45 a.m. on 14th july.",
    ],
  },
  {
    correct: "Rev. Otieno announced that 320 guests were expected at the wedding on St. Mary's Road.",
    wrongs: [
      "Reverend Otieno announced that three hundred and twenty guests were expected at the wedding on St. Mary's Road.",
      "Rev Otieno announced that 320 guests were expected at the wedding on st. mary's road.",
      "Rev. Otieno announced that 320, guests were expected at the wedding on St Marys Road.",
    ],
  },
  {
    correct: "The WHO reported that vaccination coverage rose to 78% by Dec. 2025.",
    wrongs: [
      "The who reported that vaccination coverage rose to 78% by Dec. 2025.",
      "The WHO reported that vaccination coverage rose to seventy-eight percent by Dec. 2025.",
      "The W.H.O reported that vaccination coverage rose to 78% by December, 2025.",
    ],
  },
  {
    correct: "Hon. Cherono's office confirmed the meeting for Tue. 9th June at 10:00 a.m.",
    wrongs: [
      "Honourable Cherono's office confirmed the meeting for Tuesday, ninth June at ten a.m.",
      "Hon Cherono's office confirmed the meeting for tue. 9th June at 10:00 a.m.",
      "hon. cherono's office confirmed the meeting for Tue. 9th June at 10:00 a.m.",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "The short form of 'kilogram' is", after: ".", correctAnswer: "kg" },
  { before: "The short form of 'Doctor' used before a name is", after: ".", correctAnswer: "Dr.", acceptedAnswers: ["Dr"] },
  { before: "NHIF stands for National Hospital Insurance", after: ".", correctAnswer: "Fund" },
  { before: "NTSA stands for National Transport and Safety", after: ".", correctAnswer: "Authority" },
  { before: "The numeral for the word 'seventy-two' is", after: ".", correctAnswer: "72" },
  { before: "KCPE stands for Kenya Certificate of Primary", after: ".", correctAnswer: "Education" },
  { before: "The short form of 'kilometre' is", after: ".", correctAnswer: "km" },
  { before: "The short form of 'Professor' used before a name is", after: ".", correctAnswer: "Prof.", acceptedAnswers: ["Prof"] },
  { before: "ATM stands for Automated Teller", after: ".", correctAnswer: "Machine" },
  { before: "The numeral for the word 'three hundred and fifteen' is", after: ".", correctAnswer: "315" },
  { before: "The short form of 'Avenue' used in addresses is", after: ".", correctAnswer: "Ave.", acceptedAnswers: ["Ave"] },
  { before: "PIN stands for Personal Identification", after: ".", correctAnswer: "Number" },
];

function distractorsFor<T extends { text: string; expansion: string; cluster: Cluster }>(rng: () => number, pool: T[], correct: T, count: number): string[] {
  const sameCluster = pool.filter((x) => x.cluster === correct.cluster && x.text !== correct.text);
  return shuffle(rng, sameCluster).slice(0, count).map((x) => x.expansion);
}

export const acronymsAbbreviationsNumerals: Skill = {
  id: "g6-eng-writing-acronyms-abbreviations-numerals",
  code: "W.3",
  subjectId: "english",
  strandId: "g6-eng-writing",
  grade: 6,
  title: "Acronyms, Abbreviations and Numerals",
  description: "Identify and correctly write common acronyms, abbreviations, and numerals in a composition, and judge whether a sentence uses them correctly.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["categorize", "click-match", "mc-expand", "mc-correct-usage", "fill-blank", "number-line"] as const
    );
    const hint = "An acronym or abbreviation is a short form of one or more words; a numeral is a number written in digits. Both need correct capitalisation and punctuation.";

    if (branch === "categorize") {
      const acr = shuffle(rng, ACRONYMS).slice(0, 2).map((a) => ({ id: a.text, label: a.text, type: "acronym" as const }));
      const abb = shuffle(rng, ABBREVIATIONS).slice(0, 2).map((a) => ({ id: a.text, label: a.text, type: "abbreviation" as const }));
      const num = shuffle(rng, NUMERAL_SAMPLES).slice(0, 2).map((n, i) => ({ id: `num${i}-${n}`, label: n, type: "numeral" as const }));
      const chosen: CategorizeItem[] = shuffle(rng, [...acr, ...abb, ...num]);
      const items = chosen.map(({ id, label }) => ({ id, label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c.id] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each item into Acronym, Abbreviation, or Numeral.",
        items,
        buckets: [
          { id: "acronym", label: "Acronym" },
          { id: "abbreviation", label: "Abbreviation" },
          { id: "numeral", label: "Numeral" },
        ],
        correctBucket,
        hint: "An acronym is formed from initial letters (NTSA); an abbreviation is a shortened word (Dr., kg); a numeral is a number written in digits.",
        explanation: chosen.map((c) => `"${c.label}" is ${c.type === "acronym" ? "an" : "a"} ${c.type}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const useAcronyms = rng() > 0.5;
      const pool = useAcronyms ? ACRONYMS : ABBREVIATIONS;
      const chosen = shuffle(rng, pool).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((x) => ({ id: x.text, label: x.text })));
      const targets = shuffle(rng, chosen.map((x) => ({ id: x.text, label: x.expansion })));
      const correctMap: Record<string, string> = {};
      for (const x of chosen) correctMap[x.text] = x.text;
      return {
        kind: "click-match",
        prompt: `Match each ${useAcronyms ? "acronym" : "abbreviation"} to its full form.`,
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((x) => `"${x.text}" stands for "${x.expansion}".`).join(" "),
      };
    }

    if (branch === "mc-expand") {
      const useAcronyms = rng() > 0.5;
      const pool = useAcronyms ? ACRONYMS : ABBREVIATIONS;
      const entry = randChoice(rng, pool);
      const distractors = distractorsFor(rng, pool as { text: string; expansion: string; cluster: Cluster }[], entry, 3);
      const choices = shuffle(rng, [entry.expansion, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `What does "${entry.text}" stand for?`,
        choices,
        correctIndex: choices.indexOf(entry.expansion),
        layout: "list",
        hint: "Think about the specific words each letter or shortened part represents, not just the general topic.",
        explanation: `"${entry.text}" stands for "${entry.expansion}".`,
      };
    }

    if (branch === "mc-correct-usage") {
      const entry = randChoice(rng, COMBINED_SENTENCES);
      const choices = shuffle(rng, [entry.correct, ...entry.wrongs]);
      return {
        kind: "multiple-choice",
        prompt: "Which version of this sentence correctly writes its acronym, abbreviation, and numeral?",
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Check that acronyms and title abbreviations keep their capital letters and periods, and that numerals stay as digits rather than being spelled out.",
        explanation: `The correctly written sentence is: "${entry.correct}"`,
      };
    }

    if (branch === "fill-blank") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word or short form.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, NUMBER_WORDS);
    return {
      kind: "number-line",
      prompt: `Place the numeral for the word "${entry.words}" on the number line.`,
      min: 0,
      max: entry.max,
      step: 1,
      correctValue: entry.value,
      mode: "point",
      hint: "Convert the number in words into digits before finding its place on the line.",
      explanation: `"${entry.words}" is written as the numeral ${entry.value}.`,
    };
  },
};
