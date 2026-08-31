import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, sortPrompt, orderPrompt, fillPrompt, writingScenarioCloser } from "./g5FrShared";

type Tag = "nuclear" | "other";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "le père", meaning: "father", tag: "nuclear" },
  { word: "la mère", meaning: "mother", tag: "nuclear" },
  { word: "le frère", meaning: "brother", tag: "nuclear" },
  { word: "la sœur", meaning: "sister", tag: "nuclear" },
  { word: "les parents", meaning: "parents", tag: "nuclear" },
  { word: "le fils", meaning: "son", tag: "nuclear" },
  { word: "la fille", meaning: "daughter", tag: "nuclear" },
  { word: "le grand-père", meaning: "grandfather", tag: "other" },
  { word: "la grand-mère", meaning: "grandmother", tag: "other" },
  { word: "l'oncle", meaning: "uncle", tag: "other" },
  { word: "la tante", meaning: "aunt", tag: "other" },
  { word: "le cousin", meaning: "cousin (male)", tag: "other" },
  { word: "la cousine", meaning: "cousin (female)", tag: "other" },
  { word: "le tuteur", meaning: "guardian (male)", tag: "other" },
  { word: "la tutrice", meaning: "guardian (female)", tag: "other" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Mon ", after: " s'appelle Otieno.", answer: "père", gloss: "Mon père s'appelle Otieno. — My father is called Otieno." },
  { before: "Ma ", after: " s'appelle Achieng.", answer: "mère", gloss: "Ma mère s'appelle Achieng. — My mother is called Achieng." },
  { before: "J'ai un frère et une ", after: ".", answer: "sœur", gloss: "J'ai un frère et une sœur. — I have a brother and a sister." },
  { before: "Mes ", after: " habitent à Nairobi.", answer: "parents", gloss: "Mes parents habitent à Nairobi. — My parents live in Nairobi." },
  { before: "Mon ", after: " joue au football.", answer: "frère", gloss: "Mon frère joue au football. — My brother plays football." },
  { before: "Ma ", after: " regarde la télé.", answer: "sœur", gloss: "Ma sœur regarde la télé. — My sister watches TV." },
  { before: "Mon grand-père ", after: " le journal.", answer: "lit", gloss: "Mon grand-père lit le journal. — My grandfather reads the newspaper." },
  { before: "Ma tante ", after: " le repas.", answer: "prépare", gloss: "Ma tante prépare le repas. — My aunt prepares the meal." },
  { before: "Mon oncle ", after: " à Kisumu.", answer: "habite", gloss: "Mon oncle habite à Kisumu. — My uncle lives in Kisumu." },
  { before: "Mon tuteur ", after: " avec nous.", answer: "habite", gloss: "Mon tuteur habite avec nous. — My guardian lives with us." },
  { before: "J'ai un ", after: " et une fille.", answer: "fils", gloss: "J'ai un fils et une fille. — I have a son and a daughter." },
  { before: "Ma ", after: " s'appelle Wanjiru.", answer: "cousine", gloss: "Ma cousine s'appelle Wanjiru. — My cousin (female) is called Wanjiru." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Mon", "père", "joue", "au", "football", "."], sentence: "Mon père joue au football." },
  { chunks: ["Ma", "sœur", "regarde", "la", "télé", "."], sentence: "Ma sœur regarde la télé." },
  { chunks: ["Mon", "grand-père", "lit", "le", "journal", "."], sentence: "Mon grand-père lit le journal." },
  { chunks: ["Ma", "tante", "prépare", "le", "repas", "."], sentence: "Ma tante prépare le repas." },
  { chunks: ["Mes", "parents", "habitent", "à", "Nairobi", "."], sentence: "Mes parents habitent à Nairobi." },
  { chunks: ["Mon", "tuteur", "habite", "avec", "nous", "."], sentence: "Mon tuteur habite avec nous." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are filling in a school form asking for your father's name, and he is called Otieno.",
    correct: "Mon père s'appelle Otieno.",
    distractors: ["Ma mère s'appelle Otieno.", "Mon frère s'appelle Otieno.", "Mon oncle s'appelle Otieno."],
    explanation: "'Mon père s'appelle Otieno' correctly names the father — the other options name a different family member instead.",
  },
  {
    note: "You are writing a caption for a family photo naming your mother, Achieng.",
    correct: "Ma mère s'appelle Achieng.",
    distractors: ["Mon père s'appelle Achieng.", "Ma sœur s'appelle Achieng.", "Ma tante s'appelle Achieng."],
    explanation: "'Ma mère s'appelle Achieng' names your mother specifically — swapping the family member changes who is being named.",
  },
  {
    note: "You are writing a short paragraph and want to say you have exactly one brother and one sister.",
    correct: "J'ai un frère et une sœur.",
    distractors: ["J'ai une sœur et une tante.", "J'ai un frère et un cousin.", "J'ai des parents."],
    explanation: "'J'ai un frère et une sœur' names one brother and one sister — the other options swap in a different relative.",
  },
  {
    note: "You are describing what your brother does every afternoon: he plays football.",
    correct: "Mon frère joue au football.",
    distractors: ["Ma sœur joue au football.", "Mon frère joue à football.", "Mon frère jouer au football."],
    explanation: "'Mon frère joue au football' correctly follows Subject + verb + object with 'au' (à + le) and the present-tense verb 'joue' — dropping the contraction or using the infinitive 'jouer' are common mistakes.",
  },
  {
    note: "You are describing your sister's evening habit of watching TV.",
    correct: "Ma sœur regarde la télé.",
    distractors: ["Mon frère regarde la télé.", "Ma sœur regarder la télé.", "Ma sœur écoute la télé."],
    explanation: "'Ma sœur regarde la télé' correctly uses the present-tense verb 'regarde' (watches) with the object 'la télé' — an infinitive or the wrong verb breaks the sentence structure.",
  },
  {
    note: "You are describing your grandfather's routine of reading the newspaper.",
    correct: "Mon grand-père lit le journal.",
    distractors: ["Ma grand-mère lit le journal.", "Mon grand-père lire le journal.", "Mon grand-père regarde le journal."],
    explanation: "'Mon grand-père lit le journal' uses the correct present-tense verb 'lit' (reads) — swapping the person, using the infinitive, or using the wrong verb all break the sentence.",
  },
  {
    note: "You are filling in a form field for your parents' town of residence, which is Nairobi.",
    correct: "Mes parents habitent à Nairobi.",
    distractors: ["Mon oncle habite à Nairobi.", "J'habite à Nairobi.", "Mes parents sont à Nairobi."],
    explanation: "'Mes parents habitent à Nairobi' uses the plural subject 'parents' with the matching plural verb 'habitent' and names the right people.",
  },
  {
    note: "You live with your guardian rather than your parents, and you want to write that he lives with you.",
    correct: "Mon tuteur habite avec nous.",
    distractors: ["Mon père habite avec nous.", "Ma tutrice habite avec nous.", "Mon grand-père habite loin."],
    explanation: "'Mon tuteur' is the correct masculine word for a male guardian — 'Ma tutrice' wrongly uses the feminine form for 'he'.",
  },
  {
    note: "You are describing your aunt's role at family gatherings: she prepares the meal.",
    correct: "Ma tante prépare le repas.",
    distractors: ["Mon oncle prépare le repas.", "Ma tante préparer le repas.", "Ma tante mange le repas."],
    explanation: "'Ma tante prépare le repas' uses the correct present-tense verb 'prépare' (prepares) — the infinitive form or a different verb changes the meaning or breaks the structure.",
  },
  {
    note: "You want to write that your uncle lives in Kisumu.",
    correct: "Mon oncle habite à Kisumu.",
    distractors: ["Ma tante habite à Kisumu.", "Mon oncle habite Kisumu.", "Mon oncle habitent à Kisumu."],
    explanation: "'Mon oncle habite à Kisumu' correctly keeps the preposition 'à' before the town name and matches the singular verb 'habite' to the singular subject.",
  },
  {
    note: "You are writing about your family as an adult, saying you have a son and a daughter.",
    correct: "J'ai un fils et une fille.",
    distractors: ["J'ai un fils et une sœur.", "J'ai deux fils.", "J'ai une fille et un cousin."],
    explanation: "'J'ai un fils et une fille' names one son and one daughter — the other options swap in the wrong relative or the wrong count.",
  },
  {
    note: "You want to write the name of your female cousin, Wanjiru, in your family paragraph.",
    correct: "Ma cousine s'appelle Wanjiru.",
    distractors: ["Mon cousin s'appelle Wanjiru.", "Ma tante s'appelle Wanjiru.", "Ma cousine a Wanjiru ans."],
    explanation: "'Ma cousine' is the correct feminine word — the last distractor also wrongly mixes the naming pattern with the age pattern ('a ... ans').",
  },
  {
    note: "You are writing a school project celebrating that families look different — yours includes your guardian, a woman, rather than two parents — and you want to name her role.",
    correct: "Ma tutrice habite avec nous.",
    distractors: ["Mon tuteur habite avec nous.", "Ma tante habite avec nous.", "Ma mère habite avec nous."],
    explanation: "'Ma tutrice' is the correct feminine word for a female guardian — 'Mon tuteur' wrongly uses the masculine form, and the other two name a different relative.",
  },
];

export const familyWriting: Skill = {
  id: "g5-fr-w-family",
  code: "W.2",
  subjectId: "french",
  strandId: "g5-fr-writing",
  grade: 5,
  title: "Nuclear family and guardians",
  description: "Guided writing about members of a nuclear family, extended family, and guardians, using the Subject + verb + object present-tense sentence pattern.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "written French family word to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Some words name your closest (nuclear) family; others name wider family or guardians.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const nuclear = shuffle(rng, WORDS.filter((p) => p.tag === "nuclear")).slice(0, 3);
      const other = shuffle(rng, WORDS.filter((p) => p.tag === "other")).slice(0, 3);
      const items = shuffle(rng, [...nuclear, ...other]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each written word is a Nuclear Family Member or Extended Family/Guardian"),
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "nuclear", label: "Nuclear Family Member" },
          { id: "other", label: "Extended Family/Guardian" },
        ],
        correctBucket,
        hint: "Nuclear family means parents, siblings, and children; extended family/guardians are everyone else who cares for you.",
        explanation: [...nuclear, ...other]
          .map((p) => `"${p.word}" is ${p.tag === "nuclear" ? "a nuclear family member" : "extended family or a guardian"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the family word or the present-tense verb that fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words/phrases to write a correct French sentence about family, following Subject + verb + object"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject comes first, then the present-tense verb, then the object.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} ${writingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check the family member, the gender of the word, and the verb all match Subject + verb + object.",
      explanation: s.explanation,
    };
  },
};
