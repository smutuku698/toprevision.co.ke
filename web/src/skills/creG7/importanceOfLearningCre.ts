import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// OV.1 "Importance of Learning CRE" has no natural sequence, spatial layout, or numeric
// quantity in its source content (a list of reasons + a list of values, both unordered) —
// so this skill genuinely supports only 4 QuestionKinds (multiple-choice, fill-blank,
// click-match, categorize), following the same documented-cap pattern as
// creativeArtsSportsG7/introduction.ts.

const TRUE_REASONS = [
  "It helps learners develop sound moral and religious values for responsible living",
  "It equips learners with values needed to make informed decisions",
  "It helps learners apply Christian teachings when facing daily challenges",
  "It nurtures a learner's spiritual, moral, social, and intellectual growth",
  "It helps learners build self-discipline and integrity",
  "It prepares learners to live peacefully and respectfully with others",
  "It helps learners tell right from wrong through Biblical teaching",
  "It builds a learner's character for responsible citizenship",
  "It helps learners resist negative peer pressure through firm values",
  "It strengthens a learner's ability to reflect on their own behaviour and grow",
] as const;

// A confusable cluster of common misconceptions about why CRE is studied — each one
// narrows CRE down to a single surface activity (exams, church attendance, a career) rather
// than its actual purpose of moral and spiritual formation, so they are plausible wrong
// answers rather than random unrelated statements.
const MISCONCEPTIONS = [
  "CRE is studied only so learners can memorise Bible verses for an exam",
  "CRE only teaches Bible history, with no relevance to daily life",
  "CRE is only useful for learners who want to become pastors or priests",
  "CRE is the same thing as attending church on Sunday",
  "CRE only matters for passing tests, not for how a person actually behaves",
] as const;

const VALUES: { term: string; meaning: string }[] = [
  { term: "Respect", meaning: "Valuing and honouring the feelings, rights, and opinions of others" },
  { term: "Responsibility", meaning: "Being reliable and accountable for one's own actions and duties" },
  { term: "Honesty", meaning: "Telling the truth and refusing to deceive others" },
  { term: "Integrity", meaning: "Doing what is right even when no one is watching" },
  { term: "Self-control", meaning: "Managing one's emotions and desires instead of acting on impulse" },
  { term: "Kindness", meaning: "Being caring and considerate towards others" },
  { term: "Love", meaning: "Genuinely caring for the wellbeing of God and other people" },
  { term: "Obedience", meaning: "Following guidance from parents, teachers, and God's word" },
  { term: "Patience", meaning: "Staying calm and steady while waiting or facing difficulty" },
  { term: "Faithfulness", meaning: "Remaining loyal and dependable in one's commitments" },
  { term: "Humility", meaning: "Having a modest view of oneself and valuing others' contributions" },
  { term: "Forgiveness", meaning: "Choosing to let go of resentment against someone who has wronged you" },
];

interface Scenario {
  text: string;
  applies: boolean; // true = shows the value being applied, false = shows it being ignored
}

const SCENARIOS: Scenario[] = [
  { text: "In Kericho, Cherono found a classmate's lost wallet and returned it with all the money inside", applies: true },
  { text: "In Nakuru, Otieno mocked a new student's accent in front of the whole class", applies: false },
  { text: "In Machakos, Wanjiru apologised to her brother after losing her temper and shouting at him", applies: true },
  { text: "In Kisumu, Baraka copied his friend's homework and claimed it was his own work", applies: false },
  { text: "In Nyeri, Fatuma waited calmly in line at the school canteen instead of pushing ahead", applies: true },
  { text: "In Eldoret, Juma spread a rumour about a classmate he was jealous of", applies: false },
  { text: "In Thika, Amina admitted to her teacher that she had broken a window while playing", applies: true },
  { text: "In Mombasa, Denis ignored his mother's instruction to be home before dark", applies: false },
  { text: "In Kitale, Lilian shared her lunch with a classmate who had forgotten theirs", applies: true },
  { text: "In Nairobi, Mwangi refused to forgive his friend even after a sincere apology", applies: false },
  { text: "In Meru, Chebet stood up for a younger learner who was being bullied", applies: true },
  { text: "In Bungoma, Kevin took credit for a group project his teammates had actually completed", applies: false },
];

const RECALL_PROMPTS = [
  "Which of these is a genuine reason why studying CRE matters for a Grade 7 learner?",
  "Which statement below correctly explains why CRE is worth studying?",
  "Pick the option that genuinely explains the importance of learning CRE.",
  "Which of these reasons for studying CRE is actually accurate?",
  "Choose the true reason CRE matters, not a common misconception about it.",
  "Which answer correctly captures why CRE is important for a learner's growth?",
] as const;

const MATCH_PROMPTS = [
  "Match each value to its meaning.",
  "Pair each value with the description that explains it.",
  "Connect each value below to its correct meaning.",
  "Match each of these values to the statement that defines it.",
  "Link each value to the explanation that fits it.",
  "Match each term to the meaning that correctly describes it.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each situation as showing CRE values being applied, or being ignored.",
  "Group these situations under whether a CRE value was applied or ignored.",
  "Decide whether each situation shows a value being applied or ignored, and sort it there.",
  "Sort each scenario into the correct bucket based on how the value was handled.",
  "Read each situation and place it under 'applied' or 'ignored' as appropriate.",
  "Classify each situation by whether it shows the value being lived out or overlooked.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that correctly completes this statement.",
  "Which word belongs in the blank?",
  "Fill in the blank with the right term.",
  "Type the missing word to complete the sentence.",
] as const;

const FILL_BLANKS = [
  { before: "Learning CRE helps a Grade 7 learner develop sound moral and", after: "values for responsible living.", answer: "religious", accepted: ["religious"] },
  { before: "Studying CRE equips learners with values needed to make informed", after: "decisions.", answer: "moral", accepted: ["moral"] },
  { before: "One value CRE helps build is", after: ", which means being accountable for one's own actions and duties.", answer: "responsibility", accepted: ["responsibility"] },
  { before: "The value of", after: "means telling the truth and refusing to deceive others.", answer: "honesty", accepted: ["honesty"] },
  { before: "Doing what is right even when no one is watching is the value called", after: ".", answer: "integrity", accepted: ["integrity"] },
  { before: "Managing one's emotions and desires instead of acting on impulse is called", after: ".", answer: "self-control", accepted: ["self-control", "self control"] },
  { before: "Following the guidance of parents, teachers, and God's word is the value of", after: ".", answer: "obedience", accepted: ["obedience"] },
  { before: "Staying calm and steady while waiting or facing difficulty is the value of", after: ".", answer: "patience", accepted: ["patience"] },
  { before: "Remaining loyal and dependable in one's commitments is called", after: ".", answer: "faithfulness", accepted: ["faithfulness"] },
  { before: "Choosing to let go of resentment against someone who wronged you is called", after: ".", answer: "forgiveness", accepted: ["forgiveness"] },
] as const;

export const importanceOfLearningCre: Skill = {
  id: "g7-cre-ov-importance-of-learning-cre",
  code: "OV.1",
  subjectId: "cre",
  strandId: "g7-cre-overview",
  grade: 7,
  title: "Importance of Learning CRE",
  description: "Why studying Christian Religious Education matters, and the values it helps learners build for responsible living.",
  generate(rng) {
    const branch = randChoice(rng, ["recall", "match", "categorize", "fill-blank"] as const);

    if (branch === "recall") {
      const target = randChoice(rng, TRUE_REASONS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target, MISCONCEPTIONS, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, RECALL_PROMPTS),
        choices,
        correctIndex,
        layout: "list",
        hint: "CRE is meant to shape moral and spiritual character, not just to be memorised for a test or linked to one activity.",
        explanation: `"${target}" is a genuine reason CRE matters — the other options wrongly narrow CRE down to a single surface activity like exams or church attendance, missing its real purpose of moral and spiritual formation.`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, VALUES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.term] = v.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "These are among the values CRE helps a learner develop for responsible daily living.",
        explanation: chosen.map((v) => `${v.term} — ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SCENARIOS).slice(0, 8);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.applies ? "applied" : "ignored"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "applied", label: "Shows a CRE value being applied" },
          { id: "ignored", label: "Shows a CRE value being ignored" },
        ],
        correctBucket,
        hint: "Look for values like honesty, respect, responsibility, self-control, and forgiveness in each situation.",
        explanation: chosen.map((s) => `"${s.text}" ${s.applies ? "shows a value being applied" : "shows a value being ignored"}.`).join(" "),
      };
    }

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about the reasons CRE matters and the values it teaches.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
