import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ADVERB_SENTENCES: { text: string; target: string; type: "time" | "place" | "manner" }[] = [
  { text: "The guidance counsellor spoke firmly to the students about the dangers of drug abuse.", target: "firmly", type: "manner" },
  { text: "Peer pressure often leads young people to try harmful substances.", target: "often", type: "time" },
  { text: "The rehabilitation centre is located nearby.", target: "nearby", type: "place" },
  { text: "Students should never accept unknown substances from strangers.", target: "never", type: "time" },
  { text: "The guidance teacher visits our school regularly.", target: "regularly", type: "time" },
  { text: "Say no to drugs confidently whenever you are pressured.", target: "confidently", type: "manner" },
  { text: "The anti-drug club meets outside during break time.", target: "outside", type: "place" },
  { text: "The doctor calmly explained the effects of alcohol on the body.", target: "calmly", type: "manner" },
  { text: "The health talk will begin soon.", target: "soon", type: "time" },
  { text: "Recovering addicts are counselled indoors, away from old friends.", target: "indoors", type: "place" },
  { text: "The recovering patient bravely told his story to the whole school.", target: "bravely", type: "manner" },
  { text: "Everywhere in the county, chiefs are warning parents about illegal brews.", target: "everywhere", type: "place" },
];

const ADVERB_TYPE_LABELS: Record<string, string> = {
  time: "Adverb of time (says when)",
  place: "Adverb of place (says where)",
  manner: "Adverb of manner (says how)",
};

const IDENTIFY_MC: { sentence: string; target: string; correct: string; distractors: string[] }[] = [
  { sentence: "The counsellor spoke wisely to the frightened students.", target: "wisely", correct: "Adverb of manner", distractors: ["Adverb of time", "Adverb of place", "Adjective"] },
  { sentence: "Drug abuse cases are rising daily across the country.", target: "daily", correct: "Adverb of time", distractors: ["Adverb of manner", "Adverb of place", "Adjective"] },
  { sentence: "The support group meets here every Friday.", target: "here", correct: "Adverb of place", distractors: ["Adverb of manner", "Adverb of time", "Adjective"] },
  { sentence: "The reformed addict now mentors other young people.", target: "now", correct: "Adverb of time", distractors: ["Adverb of manner", "Adverb of place", "Adjective"] },
  { sentence: "She refused the cigarette boldly, in front of her friends.", target: "boldly", correct: "Adverb of manner", distractors: ["Adverb of time", "Adverb of place", "Adjective"] },
  { sentence: "The awareness posters were placed everywhere around the school.", target: "everywhere", correct: "Adverb of place", distractors: ["Adverb of manner", "Adverb of time", "Adjective"] },
];

const FORM_CONFUSION_MC: { before: string; after: string; correct: string; distractors: string[]; base: string }[] = [
  { before: "The nurse explained the risks very ", after: " during the health talk.", correct: "clearly", distractors: ["clear", "clearer", "clearness"], base: "clear" },
  { before: "Students should refuse harmful substances ", after: " whenever offered.", correct: "firmly", distractors: ["firm", "firmer", "firmness"], base: "firm" },
  { before: "The counsellor spoke ", after: " to the worried parents.", correct: "calmly", distractors: ["calm", "calmness", "calmer"], base: "calm" },
  { before: "She answered every question about addiction ", after: ".", correct: "confidently", distractors: ["confident", "confidence", "confidenter"], base: "confident" },
  { before: "The reformed patient told his story ", after: " to the assembly.", correct: "honestly", distractors: ["honest", "honester", "honesty"], base: "honest" },
  { before: "The rescued boy walked ", after: " into the rehabilitation centre for the first time.", correct: "bravely", distractors: ["brave", "braver", "bravery"], base: "brave" },
];

const CONSTRUCT_FILL: { before: string; after: string; correctAnswer: string; clue: "time" | "place" | "manner" }[] = [
  { before: "The health talk about substance abuse will start ", after: ", right after break.", correctAnswer: "soon", clue: "time" },
  { before: "The counsellor's office is located ", after: ", just beside the staffroom.", correctAnswer: "nearby", clue: "place" },
  { before: "The reformed addict spoke ", after: " so the younger students would understand the risks.", correctAnswer: "honestly", clue: "manner" },
  { before: "Chiefs across the county are ", after: " warning parents about illegal brews.", correctAnswer: "constantly", clue: "time" },
  { before: "The anti-drug club always meets ", after: " under the big tree during break.", correctAnswer: "outside", clue: "place" },
  { before: "She rejected the offer ", after: ", without any hesitation.", correctAnswer: "firmly", clue: "manner" },
];

export const adverbsTimePlaceManner: Skill = {
  id: "g7-eng-g-adverbs-time-place-manner",
  code: "G.6",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Adverbs of Time, Place, and Manner",
  description: "Identify and use adverbs of time, place, and manner in texts about staying safe from drug and substance abuse.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify-mc", "form-mc", "fill", "match"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, ADVERB_SENTENCES).slice(0, 6);
      const buckets = [
        { id: "time", label: "Adverb of time" },
        { id: "place", label: "Adverb of place" },
        { id: "manner", label: "Adverb of manner" },
      ];
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.type));
      return {
        kind: "categorize",
        prompt: "Sort each sentence by the type of adverb it contains: time, place, or manner.",
        items,
        buckets,
        correctBucket,
        hint: "Ask: does the underlined idea tell you WHEN it happens, WHERE it happens, or HOW it happens?",
        explanation: chosen.map((s) => `"${s.target}" in "${s.text}" is an ${ADVERB_TYPE_LABELS[s.type].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "identify-mc") {
      const entry = randChoice(rng, IDENTIFY_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `What kind of word is "${entry.target}" in this sentence? "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Decide whether the word answers when, where, or how the action happens — or whether it describes a noun instead.",
        explanation: `"${entry.target}" is an ${entry.correct.toLowerCase()} in this sentence: "${entry.sentence}"`,
      };
    }

    if (branch === "form-mc") {
      const entry = randChoice(rng, FORM_CONFUSION_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which word correctly completes this sentence? "${entry.before}___${entry.after}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: `The blank describes HOW the action is done, so it needs the adverb form of "${entry.base}", usually made by adding -ly.`,
        explanation: `"${entry.correct}" is the adverb of manner form of "${entry.base}" — it describes how the action happens: "${entry.before}${entry.correct}${entry.after}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, ADVERB_SENTENCES).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((s, i) => ({ id: `w${i}`, label: s.target })));
      const targets = shuffle(rng, chosen.map((s, i) => ({ id: `w${i}`, label: ADVERB_TYPE_LABELS[s.type] })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((s, i) => (correctMap[`w${i}`] = `w${i}`));
      return {
        kind: "click-match",
        prompt: "Match each adverb to the type it belongs to here.",
        tokens,
        targets,
        correctMap,
        hint: "Ask: does this word tell you when, where, or how something happens?",
        explanation: chosen.map((s) => `"${s.target}" is an ${ADVERB_TYPE_LABELS[s.type].toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, CONSTRUCT_FILL);
    const clueText = entry.clue === "time" ? "an adverb of time (when it happens)" : entry.clue === "place" ? "an adverb of place (where it happens)" : "an adverb of manner (how it happens)";
    return {
      kind: "fill-blank",
      prompt: `Fill in ${clueText} that fits this sentence.`,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: `Think of a word that tells the reader ${entry.clue === "time" ? "when" : entry.clue === "place" ? "where" : "how"} this happens.`,
      explanation: `"${entry.correctAnswer}" fits here as ${clueText}: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
