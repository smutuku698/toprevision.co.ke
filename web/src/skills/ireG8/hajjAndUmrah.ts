import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DESCRIBE_MATCH_PROMPTS = [
  "Match each rite of Hajj to what it involves.",
  "Pair each rite of Hajj with what it involves.",
  "Connect each rite below to what it involves.",
  "Match each rite of Hajj to its correct description.",
  "Link each rite of Hajj to what it involves.",
  "Choose the correct description for each rite of Hajj.",
];

const CLASSIFY_MATCH_PROMPTS = [
  "Match each rite of Hajj to its classification as Fardh (obligatory) or Wajib (necessary).",
  "Pair each rite of Hajj with its classification — Fardh, or Wajib.",
  "Connect each rite below to its classification.",
  "Match each rite of Hajj to whether it is Fardh or Wajib.",
  "Link each rite of Hajj to its correct classification.",
  "Choose the correct classification for each rite of Hajj.",
];

const BOTH_VS_HAJJ_PROMPTS = [
  "Sort each rite as performed in both Hajj and Umrah, or only in Hajj.",
  "Group each rite under performed in both Hajj and Umrah, or only in Hajj.",
  "Decide whether each rite is performed in both Hajj and Umrah, or only in Hajj, and sort it there.",
  "Sort each rite into the correct category: both Hajj and Umrah, or Hajj only.",
  "Place each rite into the right bucket — both, or Hajj only.",
  "Categorise each rite as performed in both Hajj and Umrah, or only in Hajj.",
];

const SEQUENCE_PROMPTS = [
  "Arrange the rites of Hajj in the correct sequence.",
  "Put the rites of Hajj into the correct sequence.",
  "Sequence these rites of Hajj correctly, from first to last.",
  "Order these rites of Hajj as they actually happen.",
  "Sort these rites of Hajj into their correct sequence.",
  "Arrange these rites of Hajj from first to last.",
];

const FILL_PROMPTS = [
  "Fill in the missing term.",
  "Which term completes this sentence?",
  "Complete the sentence with the correct term.",
  "Work out the missing term below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which term belongs in the blank?",
];

const RITE_DESCRIPTIONS: { rite: string; description: string }[] = [
  { rite: "Ihram", description: "Entering the state of consecration, marked by simple white garments and an intention to perform Hajj or Umrah" },
  { rite: "Tawaf", description: "Circling the Kaaba seven times" },
  { rite: "Sa'i", description: "Walking briskly seven times between the hills of Safa and Marwah" },
  { rite: "Standing at Arafat", description: "Spending the Day of Arafat in prayer and supplication — the central pillar of Hajj" },
  { rite: "Staying at Muzdalifah", description: "Spending the night at Muzdalifah after leaving Arafat, and collecting pebbles" },
  { rite: "Stoning the Jamarat", description: "Throwing pebbles at the pillars at Mina, symbolising the rejection of Shaytan" },
];

const CLASSIFICATION = [
  { rite: "Ihram (intention)", level: "Fardh" },
  { rite: "Standing at Arafat", level: "Fardh" },
  { rite: "Final Tawaf (Tawaf al-Ifadah)", level: "Fardh" },
  { rite: "Sa'i between Safa and Marwah", level: "Wajib" },
  { rite: "Staying at Muzdalifah", level: "Wajib" },
  { rite: "Stoning the Jamarat", level: "Wajib" },
] as const;

const BOTH_VS_HAJJ_ONLY = [
  { text: "Entering the state of Ihram", bucket: "both" },
  { text: "Performing Tawaf around the Kaaba", bucket: "both" },
  { text: "Walking Sa'i between Safa and Marwah", bucket: "both" },
  { text: "Shaving or trimming the hair", bucket: "both" },
  { text: "Standing at Arafat", bucket: "hajj-only" },
  { text: "Staying overnight at Muzdalifah", bucket: "hajj-only" },
  { text: "Stoning the Jamarat at Mina", bucket: "hajj-only" },
] as const;
const RITE_GROUP_LABEL: Record<string, string> = { both: "Performed in both Hajj and Umrah", "hajj-only": "Performed only in Hajj" };

const HAJJ_SEQUENCE = [
  { id: "ihram", label: "Enter Ihram" },
  { id: "tawaf1", label: "Perform Tawaf around the Kaaba" },
  { id: "sai", label: "Walk Sa'i between Safa and Marwah" },
  { id: "arafat", label: "Stand at Arafat" },
  { id: "muzdalifah", label: "Stay overnight at Muzdalifah" },
  { id: "jamarat", label: "Stone the Jamarat at Mina" },
  { id: "sacrifice", label: "Offer the sacrifice" },
  { id: "final-tawaf", label: "Perform the final Tawaf" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the central, most essential rite of Hajj, without which Hajj is invalid?",
    correct: "Standing at Arafat (Wuquf)",
    distractors: ["Stoning the Jamarat", "Staying at Muzdalifah", "Sa'i between Safa and Marwah"],
  },
  {
    q: "What does 'Ihram' refer to in Hajj and Umrah?",
    correct: "The state of consecration a pilgrim enters, marked by simple white garments and a sincere intention",
    distractors: ["The final sacrifice offered at Mina", "The seven circuits around the Kaaba", "A prayer said only at the end of the pilgrimage"],
  },
  {
    q: "What is a key difference between Hajj and Umrah?",
    correct: "Umrah can be performed at any time of the year, while Hajj must be performed during specific days of the Islamic calendar",
    distractors: ["Umrah is compulsory on every Muslim while Hajj is optional", "Hajj can be performed at any time, but Umrah cannot", "There is no difference between Hajj and Umrah"],
  },
  {
    q: "What takes place at Mina during Hajj?",
    correct: "Pilgrims stone the Jamarat, symbolising rejection of Shaytan",
    distractors: ["Pilgrims perform the final Tawaf", "Pilgrims first enter Ihram", "Pilgrims walk Sa'i between Safa and Marwah"],
  },
];

export const hajjAndUmrah: Skill = {
  id: "g8-ire-da-hajj-and-umrah",
  code: "DA.2",
  subjectId: "ire",
  strandId: "g8-ire-da",
  grade: 8,
  title: "Hajj and Umrah",
  description: "The rites and sequence of Hajj and Umrah, and their fardh, wajib, and sunnah classifications.",
  generate(rng) {
    const branch = randChoice(rng, ["describe-match", "classify-match", "both-vs-hajj", "sequence", "fill", "mc"] as const);

    if (branch === "describe-match") {
      const chosen = shuffle(rng, RITE_DESCRIPTIONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.rite, label: r.rite })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.rite, label: r.description })));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.rite] = r.rite;
      return {
        kind: "click-match",
        prompt: randChoice(rng, DESCRIBE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Each rite of Hajj has a distinct action and place — the Kaaba, Safa and Marwah, Arafat, Muzdalifah, and Mina.",
        explanation: chosen.map((r) => `${r.rite} — ${r.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "classify-match") {
      const tokens = shuffle(rng, CLASSIFICATION.map((c) => ({ id: c.rite, label: c.rite })));
      const targets = shuffle(rng, CLASSIFICATION.map((c) => ({ id: c.rite, label: c.level })));
      const correctMap: Record<string, string> = {};
      for (const c of CLASSIFICATION) correctMap[c.rite] = c.rite;
      return {
        kind: "click-match",
        prompt: randChoice(rng, CLASSIFY_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Fardh rites are pillars — missing one invalidates Hajj. Wajib rites are necessary, but missing one can usually be compensated for.",
        explanation: CLASSIFICATION.map((c) => `${c.rite} — classified as ${c.level}.`).join(" "),
      };
    }

    if (branch === "both-vs-hajj") {
      const chosen = shuffle(rng, BOTH_VS_HAJJ_ONLY).slice(0, 5);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: RITE_GROUP_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `r${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`r${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, BOTH_VS_HAJJ_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Umrah shares Ihram, Tawaf, Sa'i, and shaving/trimming with Hajj, but does not include Arafat, Muzdalifah, or the Jamarat.",
        explanation: chosen.map((c) => `"${c.text}" — ${RITE_GROUP_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "sequence") {
      const items = shuffle(rng, HAJJ_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, SEQUENCE_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: HAJJ_SEQUENCE.map((s) => s.id),
        hint: "Hajj begins with Ihram and Tawaf, moves through Arafat and Muzdalifah, and ends with stoning the Jamarat, sacrifice, and a final Tawaf.",
        explanation: HAJJ_SEQUENCE.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "The state of consecration a pilgrim enters before Hajj or Umrah, marked by simple white garments, is called",
        after: ".",
        correctAnswer: "Ihram",
        inputMode: "text",
        hint: "A pilgrim enters this state with a sincere intention before beginning the rites.",
        explanation: "The state of consecration entered before Hajj or Umrah is called Ihram.",
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Hajj follows a fixed sequence of rites from Ihram to the final Tawaf, while Umrah is a shorter pilgrimage that can be performed any time of year.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
