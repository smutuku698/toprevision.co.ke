import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, sortTwoSoundsBranch } from "./g5LsShared";
import { choosePrompt, fillPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 4.0 Road Accidents - Prevention, sub-strand 4.1 Pronunciation and
// Vocabulary — Word Stress (noun/verb contrast). Focus: sounds /t/ and /d/, words whose meaning and
// word class change with the stressed syllable. See curriculum-reference/grade-5/english.json.

// Noun stress on 1st syllable; verb stress on 2nd syllable.
const PAIRS: { word: string; nounMeaning: string; verbMeaning: string }[] = [
  { word: "record", nounMeaning: "a best result ever achieved, or a disc of music", verbMeaning: "to write down or capture sound" },
  { word: "present", nounMeaning: "a gift", verbMeaning: "to give or show something formally" },
  { word: "object", nounMeaning: "a thing you can see or touch", verbMeaning: "to disagree or protest" },
  { word: "conflict", nounMeaning: "a serious disagreement or fight", verbMeaning: "to clash or not agree" },
  { word: "subject", nounMeaning: "a topic, or what a sentence is about", verbMeaning: "to make someone undergo something" },
  { word: "produce", nounMeaning: "fruit and vegetables from a farm", verbMeaning: "to make or grow something" },
  { word: "permit", nounMeaning: "an official paper that allows something", verbMeaning: "to allow" },
  { word: "increase", nounMeaning: "a rise in amount", verbMeaning: "to go up or make larger" },
  { word: "contrast", nounMeaning: "a clear difference", verbMeaning: "to compare so a difference shows" },
  { word: "rebel", nounMeaning: "a person who fights against authority", verbMeaning: "to resist or fight against control" },
];

export const wordStressNounVerb: Skill = {
  id: "g5-eng-ls-word-stress-noun-verb",
  code: "LS.4",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Word Stress: Noun and Verb Pairs",
  description: "Recognise the sounds /t/ and /d/, and use word stress to tell a noun from a verb in pairs like RECord (noun) and reCORD (verb).",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-sort", "class-mc", "fill-class", "match-meaning", "reason"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/t/", "/d/"]);
    if (branch === "sound-sort") return sortTwoSoundsBranch(rng, "/t/", "/d/");

    if (branch === "class-mc") {
      const p = randChoice(rng, PAIRS);
      const isNoun = rng() < 0.5;
      const shown = isNoun ? `${p.word.toUpperCase().slice(0, p.word.length - syl2(p.word).length)}${syl2(p.word)}` : `${p.word.slice(0, p.word.length - syl2(p.word).length)}${syl2(p.word).toUpperCase()}`;
      const correct = isNoun ? "a noun (stress on the first syllable)" : "a verb (stress on the second syllable)";
      const { choices, correctIndex } = mcFromCluster(rng, correct, [isNoun ? "a verb (stress on the second syllable)" : "a noun (stress on the first syllable)"], 1);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "what this stressed word is")}\nSaid aloud: "${shown}" (capitals show the stressed syllable). Word: "${p.word}".`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Stress on the FIRST syllable = usually a noun. Stress on the SECOND syllable = usually a verb.",
        explanation: `Stressed like "${shown}", "${p.word}" is ${correct}.`,
      };
    }

    if (branch === "fill-class") {
      const p = randChoice(rng, PAIRS);
      const isNoun = rng() < 0.5;
      const before = isNoun
        ? `In "They set a new ${p.word} for the fastest time," the word "${p.word}" is a `
        : `In "Please ${p.word} the meeting on your tablet," the word "${p.word}" is a `;
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `"noun" or "verb"`),
        before,
        after: isNoun ? " (stress the first syllable)." : " (stress the second syllable).",
        correctAnswer: isNoun ? "noun" : "verb",
        acceptedAnswers: [isNoun ? "noun" : "verb"],
        inputMode: "text",
        hint: "If the word names a thing, it is a noun. If it names an action, it is a verb.",
        explanation: `Here "${p.word}" is a ${isNoun ? "noun — a thing" : "verb — an action"}, so the stress goes on the ${isNoun ? "first" : "second"} syllable.`,
      };
    }

    if (branch === "match-meaning") {
      const pool = shuffle(rng, PAIRS).slice(0, 4);
      const rows = pool.flatMap((p) => [
        { id: `${p.word}-n`, token: `${p.word} (noun)`, target: p.nounMeaning },
        { id: `${p.word}-v`, token: `${p.word} (verb)`, target: p.verbMeaning },
      ]);
      const chosen = shuffle(rng, rows).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.id, label: r.token })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.id, label: r.target })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((r) => (correctMap[r.id] = r.id));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "stressed word to its meaning"),
        tokens,
        targets,
        correctMap,
        hint: "The noun form names a thing; the verb form names an action.",
        explanation: pool.map((p) => `${p.word} (noun) = ${p.nounMeaning}; ${p.word} (verb) = ${p.verbMeaning}`).join("  "),
      };
    }

    // reason / ordering
    if (rng() < 0.5) {
      const p = randChoice(rng, PAIRS);
      const sentence = `The police officer will ___ the details of the accident.`;
      const correct = `${p.word} — a verb, so stress the second syllable`;
      const { choices, correctIndex } = mcFromCluster(rng, correct, [`${p.word} — a noun, so stress the first syllable`, `${p.word} — it has no stress`, `${p.word} — stress both syllables equally`], 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `Sentence: "${sentence.replace("___", `[${p.word}]`)}"`, `How should "${p.word}" be said here, and why?`),
        choices,
        correctIndex,
        layout: "list",
        hint: "Is the word acting as a thing (noun) or an action (verb) in this sentence?",
        explanation: `Here "${p.word}" is an action word (verb), so the stress falls on the second syllable.`,
      };
    }
    const p = randChoice(rng, PAIRS);
    const items = [
      { id: "syl1", label: `${p.word.slice(0, p.word.length - syl2(p.word).length)}` },
      { id: "syl2", label: `${syl2(p.word)}` },
      { id: "stress", label: "(say this syllable louder for the NOUN)" },
    ];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, `the syllables of "${p.word}", then the stress note, to show the NOUN form`),
      instruction: "Click the parts in order: first syllable, second syllable, then the stress note.",
      items: shuffle(rng, items),
      correctOrder: ["syl1", "syl2", "stress"],
      hint: "For the noun, the FIRST syllable is stressed.",
      explanation: `As a noun, "${p.word}" is said with the first syllable stressed.`,
    };
  },
};

function syl2(word: string): string {
  // crude split for the two-syllable stress pairs used here
  const map: Record<string, string> = {
    record: "cord", present: "sent", object: "ject", conflict: "flict", subject: "ject",
    produce: "duce", permit: "mit", increase: "crease", contrast: "trast", rebel: "bel",
  };
  return map[word] ?? word.slice(Math.ceil(word.length / 2));
}
