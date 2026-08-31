import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const EFFECTIVE = [
  "Supports every point with clear evidence",
  "Speaks clearly and at a steady pace",
  "Listens carefully before rebutting the other side",
  "Stays calm and respectful even when challenged",
  "Makes eye contact with the judges and audience",
  "Organizes points in a logical order",
];

const INEFFECTIVE = [
  "Shouts over the other speaker to be heard",
  "Makes claims without any supporting evidence",
  "Reads directly from notes without looking up",
  "Insults the other team instead of addressing their argument",
  "Rambles without a clear structure",
  "Mumbles too quietly to be understood",
];

const ADVERB_SENTENCES: { before: string; adverb: string; after: string; distractors: string[] }[] = [
  { before: "The debater spoke", adverb: "confidently", after: "about the motion.", distractors: ["confident", "confidence", "confide"] },
  { before: "She", adverb: "calmly", after: "answered the rebuttal.", distractors: ["calm", "calmness", "calming"] },
  { before: "He argued his point", adverb: "persuasively", after: "using three examples.", distractors: ["persuasive", "persuasion", "persuade"] },
  { before: "The timekeeper", adverb: "quickly", after: "signaled that time was up.", distractors: ["quick", "quickness", "quicken"] },
  { before: "The chairperson", adverb: "firmly", after: "reminded speakers of the rules.", distractors: ["firm", "firmness", "firming"] },
];

export const debateQualitiesAdverbs: Skill = {
  id: "il-ls-debate-qualities-adverbs",
  code: "LS.7",
  subjectId: "indigenous-language",
  strandId: "il-listening-speaking",
  grade: 9,
  title: "First aid: qualities of an effective debater and adverbs",
  description: "Sort qualities of effective and ineffective debaters, and choose the adverb that correctly completes a debate-themed sentence.",
  generate(rng) {
    if (rng() < 0.5) {
      const effective = shuffle(rng, EFFECTIVE).slice(0, 3);
      const ineffective = shuffle(rng, INEFFECTIVE).slice(0, 3);
      const items = shuffle(rng, [
        ...effective.map((label) => ({ id: label, label, bucket: "effective" })),
        ...ineffective.map((label) => ({ id: label, label, bucket: "ineffective" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each behavior into Effective debater or Ineffective debater.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "effective", label: "Effective debater" },
          { id: "ineffective", label: "Ineffective debater" },
        ],
        correctBucket,
        hint: "Effective debaters support their points and stay respectful; ineffective debaters skip evidence or lose control.",
        explanation: `Effective: ${effective.join(" / ")}. Ineffective: ${ineffective.join(" / ")}.`,
      };
    }

    const entry = randChoice(rng, ADVERB_SENTENCES);
    const choices = shuffle(rng, [entry.adverb, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `Which word correctly completes this sentence? "${entry.before} ___ ${entry.after}"`,
      choices,
      correctIndex: choices.indexOf(entry.adverb),
      layout: "row",
      hint: "An adverb usually describes HOW an action is done, and often ends in -ly.",
      explanation: `"${entry.adverb}" is the adverb — it describes how the action happened: "${entry.before} ${entry.adverb} ${entry.after}"`,
    };
  },
};
