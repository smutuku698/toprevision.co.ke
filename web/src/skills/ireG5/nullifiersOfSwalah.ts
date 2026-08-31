import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, place, sortPrompt, matchPrompt, fillBlankPrompt } from "./g5IreShared";

// 4.1 Nullifiers of Swalah — outline nullifiers of swalah, differentiate nullifiers of swalah
// from nullifiers of wudhu (per the source's explicit "match and sort the nullifiers of swalah
// and wudhu using flash cards" learning experience), and appreciate performing swalah correctly.

interface ClassifiedFact {
  text: string;
  group: "nullifies-swalah" | "does-not-nullify" | "nullifies-wudhu-only";
}
const GROUP_LABEL: Record<ClassifiedFact["group"], string> = {
  "nullifies-swalah": "Nullifies swalah",
  "does-not-nullify": "Does NOT nullify swalah",
  "nullifies-wudhu-only": "Nullifies wudhu (not a swalah act itself)",
};
const FACTS: ClassifiedFact[] = [
  { text: "Deliberately talking to another person while praying", group: "nullifies-swalah" },
  { text: "Eating or drinking on purpose during swalah", group: "nullifies-swalah" },
  { text: "Deliberately walking away from the direction of the qiblah", group: "nullifies-swalah" },
  { text: "Laughing aloud on purpose during swalah", group: "nullifies-swalah" },
  { text: "Losing wudhu (e.g. passing wind) while still praying", group: "nullifies-swalah" },
  { text: "Turning the chest completely away from the qiblah on purpose", group: "nullifies-swalah" },
  { text: "Silently reciting the correct verses in the correct order", group: "does-not-nullify" },
  { text: "A brief involuntary cough during swalah", group: "does-not-nullify" },
  { text: "Quietly correcting your own recitation mistake mid-swalah", group: "does-not-nullify" },
  { text: "Moving only a hand slightly to adjust your prayer mat", group: "does-not-nullify" },
  { text: "Pointing calmly to respond to something without speaking", group: "does-not-nullify" },
  { text: "Passing wind (breaking wudhu) while just sitting, not praying", group: "nullifies-wudhu-only" },
  { text: "Deep sleep that breaks wudhu, before swalah has even started", group: "nullifies-wudhu-only" },
  { text: "Touching the ground with bare skin without any water involved", group: "does-not-nullify" },
];

const SWALAH_TERMS: { term: string; meaning: string }[] = [
  { term: "Nullifier of swalah", meaning: "Something that invalidates a prayer once it has started, e.g. deliberately talking or eating" },
  { term: "Qiblah", meaning: "The direction of the Ka'bah, which a worshipper must keep facing throughout swalah" },
  { term: "Wudhu", meaning: "Ritual ablution required before swalah; losing it while praying also invalidates the swalah" },
  { term: "Thawab", meaning: "The reward from Allah earned by performing swalah correctly" },
  { term: "Deliberate act", meaning: "An action done on purpose, e.g. talking or eating, which nullifies swalah unlike an involuntary one" },
  { term: "Involuntary act", meaning: "An action not done on purpose, e.g. a sudden cough, which generally does not nullify swalah" },
];

const REASON_TEMPLATES: ((rng: RNG) => { prompt: string; correct: string; wrong: string[]; explanation: string })[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is praying swalah in ${place(rng)} when a phone rings loudly nearby. ${who} deliberately turns and answers the call mid-prayer. What happens to ${who}'s swalah?`,
      correct: "It is nullified — deliberately speaking during swalah invalidates the prayer",
      wrong: [
        `Nothing happens, since the phone call was not ${who}'s fault`,
        "It becomes more rewarding, since responding quickly shows good manners",
        "It is only nullified if the call lasted more than a minute",
      ],
      explanation: "Deliberately speaking during swalah — even to answer a phone — is one of the clear nullifiers of swalah, so the prayer must be restarted.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, praying in ${place(rng)}, coughs suddenly and involuntarily during the second rakah, then continues praying normally. Is ${who}'s swalah nullified?`,
      correct: "No — an involuntary cough is not a deliberate act, so it does not nullify swalah",
      wrong: [
        "Yes — any sound made during swalah nullifies it, deliberate or not",
        "Yes — coughing always requires restarting the whole prayer from the beginning",
        `No — but only if ${who} coughs quietly enough for nobody to hear`,
      ],
      explanation: "Nullifiers of swalah are about deliberate acts — talking, eating, drinking, walking away on purpose. An involuntary cough is not a deliberate act, so the prayer remains valid.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `While praying, ${who} in ${place(rng)} suddenly feels the need to pass wind and does so, breaking wudhu, but keeps standing and continues the prayer anyway. What is the correct understanding here?`,
      correct: `${who}'s swalah is nullified, because losing wudhu during swalah invalidates the prayer even if the worshipper keeps standing`,
      wrong: [
        "The swalah remains valid as long as ${who} does not speak afterward",
        "Only the current rakah is affected; the earlier rakaat still count on their own",
        "The swalah is valid because wudhu only matters before starting, not during",
      ],
      explanation: "Swalah requires wudhu to remain valid throughout the prayer, not just at the start — losing wudhu mid-prayer is a nullifier of the swalah itself.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why laughing aloud on purpose during swalah is treated as a serious matter, while an involuntary sneeze is not. What is the best explanation?`,
      correct: "Because nullifiers of swalah are about deliberate, controllable acts — laughing on purpose breaks focus and intention, while a sneeze is beyond one's control",
      wrong: [
        "Because laughing is louder than sneezing, and loudness alone decides what nullifies swalah",
        "Because sneezing is actually also a nullifier, just a less serious one",
        "There is no real difference; both should always nullify the prayer equally",
      ],
      explanation: "The nullifiers of swalah target deliberate acts that show a break in focus and intention — laughing aloud on purpose qualifies, while an uncontrollable sneeze does not.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, midway through swalah in ${place(rng)}, silently notices they mispronounced a word and quietly repeats it correctly without pausing the prayer or speaking to anyone. Does this nullify the swalah?`,
      correct: "No — quietly self-correcting recitation is part of praying correctly, not a nullifier",
      wrong: [
        "Yes — any repetition of words during swalah automatically nullifies it",
        "Yes — mistakes of any kind always require restarting swalah completely",
        "No — but only if the mistake is corrected within five seconds",
      ],
      explanation: "Self-correcting your own recitation quietly, without speaking to another person or stepping outside the prayer, is not one of the nullifiers of swalah — it is simply praying more carefully.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} claims that eating a small snack during swalah is fine as long as it is done quickly. Evaluate this claim.`,
      correct: "Flawed — eating or drinking on purpose during swalah nullifies it, regardless of how quickly it is done",
      wrong: [
        "Sound — quick eating does not count as a real interruption of swalah",
        "Sound — only eating a full meal during swalah counts as a nullifier",
        "Flawed — actually only drinking, not eating, nullifies swalah",
      ],
      explanation: "Eating or drinking on purpose during swalah is a nullifier regardless of the amount or speed — swalah requires full focus without such deliberate interruptions.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} says that turning the whole body away from the qiblah on purpose during swalah is not a big deal since Allah is everywhere. Is this reasoning sound?`,
      correct: "No — deliberately turning away from the qiblah during swalah is a nullifier, since facing the qiblah is a requirement of a valid swalah",
      wrong: [
        "Yes — since Allah is everywhere, facing any direction is equally acceptable",
        "Yes — the qiblah direction only matters for the first rakah",
        "No — but turning away is only a problem outdoors, not indoors",
      ],
      explanation: "While Allah is indeed present everywhere, facing the qiblah is a structural requirement of swalah — deliberately turning the body away from it invalidates the prayer.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wonders whether the nullifiers of wudhu and the nullifiers of swalah are exactly the same list. What is the correct answer?`,
      correct: "No — they overlap in one way (losing wudhu also nullifies swalah), but swalah has extra nullifiers of its own, like deliberately talking or eating",
      wrong: [
        "Yes — the two lists are entirely identical with no differences",
        "No — the two lists share nothing at all in common",
        "Yes — but only during Ramadan are the two lists different",
      ],
      explanation: "Losing wudhu nullifies both wudhu itself and any swalah being performed, but swalah has its own additional nullifiers — deliberate talking, eating, drinking, or walking away — that are not wudhu nullifiers at all.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, praying alone in ${place(rng)}, briefly shifts a hand to smooth out a wrinkled prayer mat without speaking or stepping off it, then continues praying. What is the correct understanding?`,
      correct: "The swalah remains valid — a small, necessary adjustment like this is not a nullifier",
      wrong: [
        "The swalah is nullified, since any physical movement during swalah invalidates it",
        "The swalah is nullified only if the mat was moved more than once",
        "The swalah becomes optional to complete after any movement at all",
      ],
      explanation: "Minor, necessary physical adjustments that don't involve deliberately walking away, speaking, or eating are not nullifiers of swalah.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that once swalah is nullified partway through, it can simply be finished from where it stopped later on. Is this correct?`,
      correct: "No — once swalah is nullified, it must be performed again from the very beginning, not resumed midway",
      wrong: [
        "Yes — swalah can always be paused and resumed at will",
        "Yes — but only the missed rakah needs to be repeated, not the whole prayer",
        "No — but the whole prayer can be skipped entirely instead of restarted",
      ],
      explanation: "A nullified swalah cannot be resumed partway through — it must be performed again in full from the beginning, since its validity depends on being unbroken throughout.",
    };
  },
];

export const nullifiersOfSwalah: Skill = {
  id: "g5-ire-da-nullifiers-of-swalah",
  code: "DA.1",
  subjectId: "ire",
  strandId: "g5-ire-devotional",
  grade: 5,
  title: "Nullifiers of Swalah",
  description: "Things that invalidate swalah (deliberately talking, eating, drinking, walking away, laughing aloud, losing wudhu), what does NOT nullify it, and how nullifiers of swalah differ from nullifiers of wudhu.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank", "identify"] as const);

    if (branch === "categorize") {
      const nullifies = shuffle(rng, FACTS.filter((f) => f.group === "nullifies-swalah")).slice(0, 3);
      const notNullify = shuffle(rng, FACTS.filter((f) => f.group === "does-not-nullify")).slice(0, 3);
      const wudhuOnly = shuffle(rng, FACTS.filter((f) => f.group === "nullifies-wudhu-only")).slice(0, 2);
      const chosen = shuffle(rng, [...nullifies, ...notNullify, ...wudhuOnly]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it nullifies swalah, does not nullify swalah, or only nullifies wudhu"),
        items,
        buckets: (["nullifies-swalah", "does-not-nullify", "nullifies-wudhu-only"] as const).map((g) => ({ id: g, label: GROUP_LABEL[g] })),
        correctBucket,
        hint: "Nullifiers of swalah are deliberate acts like talking, eating, or losing wudhu — involuntary acts and small adjustments usually don't nullify it.",
        explanation: chosen.map((f) => `"${f.text}" — ${GROUP_LABEL[f.group].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, SWALAH_TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "term to its meaning about swalah and its nullifiers"),
        tokens,
        targets,
        correctMap,
        hint: "Think about what safeguards a swalah's validity, and what breaks it.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASON_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Ask whether the act described was deliberate or involuntary, and whether it involves talking, eating, walking away, or losing wudhu.",
        explanation: q.explanation,
      };
    }

    if (branch === "identify") {
      const item = randChoice(rng, FACTS);
      const wrongGroups = (["nullifies-swalah", "does-not-nullify", "nullifies-wudhu-only"] as const).filter((g) => g !== item.group);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        GROUP_LABEL[item.group],
        wrongGroups.map((g) => GROUP_LABEL[g]),
        2
      );
      return {
        kind: "multiple-choice",
        prompt: `${identifyDescribe(rng)} "${item.text}"`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Decide whether this act is a deliberate interruption, an involuntary act, or something that only affects wudhu.",
        explanation: `"${item.text}" — ${GROUP_LABEL[item.group].toLowerCase()}.`,
      };
    }

    const facts = [
      { before: "Deliberately", after: "or drinking during swalah nullifies it.", answer: "eating", accepted: ["eating"] },
      { before: "Deliberately turning away from the", after: "on purpose nullifies swalah.", answer: "qiblah", accepted: ["qiblah", "qibla"] },
      { before: "Losing", after: "while still praying nullifies the swalah, not just the ablution.", answer: "wudhu", accepted: ["wudhu"] },
      { before: "Laughing", after: "on purpose during swalah is a nullifier.", answer: "aloud", accepted: ["aloud", "loudly"] },
      { before: "An involuntary cough during swalah", after: "the prayer, since it is not deliberate.", answer: "does not nullify", accepted: ["does not nullify", "doesn't nullify", "does not break"] },
      { before: "Deliberately", after: "to another person nullifies swalah.", answer: "talking", accepted: ["talking", "speaking"] },
      { before: "A nullified swalah must be performed again from the", after: ", not resumed midway.", answer: "beginning", accepted: ["beginning", "start"] },
      { before: "Correct performance of swalah earns", after: "from Allah.", answer: "thawab", accepted: ["thawab", "reward", "rewards"] },
      { before: "Walking away from the prayer on purpose is one of the nullifiers of", after: ".", answer: "swalah", accepted: ["swalah"] },
      { before: "A small necessary adjustment, like fixing a prayer mat, generally", after: "swalah.", answer: "does not nullify", accepted: ["does not nullify", "doesn't nullify"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Recall which acts are deliberate nullifiers of swalah, and which are not.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};

function identifyDescribe(rng: RNG): string {
  return randChoice(rng, [
    "Classify this act:",
    "Does this act nullify swalah? Classify it:",
    "Work out what this act does to swalah:",
    "Read this and classify it:",
    "Classify the following act:",
    "Which category fits this act?",
    "Sort this act into the right category:",
    "Decide what this act does to a prayer:",
    "Look at this act and classify it:",
    "What is the correct classification for this act?",
  ]);
}
