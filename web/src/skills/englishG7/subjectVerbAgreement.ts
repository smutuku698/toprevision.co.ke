import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SUBJECT_VERB: { subject: string; verb: string; wrong: string; rule: string }[] = [
  { subject: "The football team", verb: "practises", wrong: "practise", rule: "'team' is a collective noun treated as singular here" },
  { subject: "The players", verb: "run", wrong: "runs", rule: "'players' is plural, so the verb takes no -s" },
  { subject: "Each athlete", verb: "warms", wrong: "warm", rule: "'each' is singular, even though it refers to many athletes individually" },
  { subject: "The coach and the captain", verb: "discuss", wrong: "discusses", rule: "'the coach and the captain' is a compound subject joined by 'and', so it takes a plural verb" },
  { subject: "Everyone on the team", verb: "wears", wrong: "wear", rule: "'everyone' is an indefinite pronoun that is always singular" },
  { subject: "The referees", verb: "blow", wrong: "blows", rule: "'referees' is plural, so the verb takes no -s" },
  { subject: "Neither the goalkeeper nor the defenders", verb: "expect", wrong: "expects", rule: "with 'neither...nor', the verb agrees with the nearer subject, 'defenders', which is plural" },
  { subject: "The spectators", verb: "cheer", wrong: "cheers", rule: "'spectators' is plural, so the verb takes no -s" },
];

const IDENTIFY_VERB_MC: { sentence: string; correct: string; distractors: string[] }[] = [
  { sentence: "The players run quickly around the field.", correct: "run", distractors: ["players", "field", "quickly"] },
  { sentence: "Every athlete warms up before the race begins.", correct: "warms", distractors: ["athlete", "race", "begins"] },
  { sentence: "The spectators cheer loudly for their favourite team.", correct: "cheer", distractors: ["spectators", "team", "loudly"] },
  { sentence: "The hockey stick belongs to the team captain.", correct: "belongs", distractors: ["stick", "captain", "team"] },
  { sentence: "Everyone on the team wears a numbered jersey.", correct: "wears", distractors: ["Everyone", "team", "jersey"] },
  { sentence: "The referees blow their whistles at the start of the game.", correct: "blow", distractors: ["referees", "whistles", "start"] },
];

const FILL_ITEMS: { before: string; verb: string; after: string; correctAnswer: string; clue: string }[] = [
  { before: "The football team ", verb: "practise", after: " every afternoon after school.", correctAnswer: "practises", clue: "'team' is a collective noun treated as singular here — use the singular verb form." },
  { before: "The players ", verb: "run", after: " around the field before the match starts.", correctAnswer: "run", clue: "'players' is plural — plural subjects take the base form of the verb, without -s." },
  { before: "Each athlete ", verb: "warm", after: " up before the race begins.", correctAnswer: "warms", clue: "'each' is singular — even though it refers to many athletes individually, it takes a singular verb." },
  { before: "Everyone on the team ", verb: "wear", after: " a numbered jersey.", correctAnswer: "wears", clue: "'everyone' is an indefinite pronoun that is always singular." },
  { before: "The coach and the captain ", verb: "discuss", after: " tactics before kickoff.", correctAnswer: "discuss", clue: "'the coach and the captain' is a compound subject joined by 'and' — it takes a plural verb." },
  { before: "Neither the goalkeeper nor the defenders ", verb: "expect", after: " an easy match.", correctAnswer: "expect", clue: "With 'neither...nor', the verb agrees with the nearer subject — 'defenders' is plural." },
];

const CORRECTION_MC: { correct: string; wrong: string[] }[] = [
  {
    correct: "The football team practises every afternoon.",
    wrong: [
      "The football team practise every afternoon.",
      "The football teams practises every afternoon.",
      "The football team am practising every afternoon.",
    ],
  },
  {
    correct: "The players, along with their coach, arrive early for training.",
    wrong: [
      "The players, along with their coach, arrives early for training.",
      "The player, along with their coach, arrive early for training.",
      "The players, along with their coach, arriving early for training.",
    ],
  },
  {
    correct: "The coach and the captain discuss tactics before kickoff.",
    wrong: [
      "The coach and the captain discusses tactics before kickoff.",
      "The coach and the captain discussing tactics before kickoff.",
      "The coach and the captain has discussed tactics before kickoff.",
    ],
  },
  {
    correct: "Everyone on the team wears a numbered jersey.",
    wrong: [
      "Everyone on the team wear a numbered jersey.",
      "Everyone on the teams wears a numbered jersey.",
      "Everyone on the team wearing a numbered jersey.",
    ],
  },
  {
    correct: "Neither the goalkeeper nor the defenders expect an easy match.",
    wrong: [
      "Neither the goalkeeper nor the defenders expects an easy match.",
      "Neither the goalkeeper nor the defender expect an easy match.",
      "Neither the goalkeepers nor the defenders is expecting an easy match.",
    ],
  },
];

export const subjectVerbAgreement: Skill = {
  id: "g7-eng-g-subject-verb-agreement",
  code: "G.14",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Subject-Verb Agreement",
  description: "Identify the subject and verb in a sentence and construct sentences with correct subject-verb agreement, using examples about outdoor games.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "verb-mc", "fill", "match", "correction-mc"] as const);

    if (branch === "categorize") {
      const correctPick = shuffle(rng, SUBJECT_VERB).slice(0, 3);
      const wrongPick = shuffle(rng, SUBJECT_VERB).slice(0, 3);
      const items = [
        ...correctPick.map((e, i) => ({ id: `c${i}`, label: `${e.subject} ${e.verb}.`, ok: true })),
        ...wrongPick.map((e, i) => ({ id: `w${i}`, label: `${e.subject} ${e.wrong}.`, ok: false })),
      ];
      const chosen = shuffle(rng, items);
      const buckets = [
        { id: "correct", label: "Correct subject-verb agreement" },
        { id: "incorrect", label: "Incorrect subject-verb agreement" },
      ];
      const displayItems = chosen.map((c) => ({ id: c.id, label: c.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c.id] = c.ok ? "correct" : "incorrect"));
      return {
        kind: "categorize",
        prompt: "Sort each sentence as correct or incorrect subject-verb agreement.",
        items: displayItems,
        buckets,
        correctBucket,
        hint: "Find the subject first, then check whether the verb form matches it in number (singular or plural).",
        explanation: chosen.map((c) => `"${c.label}" has ${c.ok ? "correct" : "incorrect"} subject-verb agreement.`).join(" "),
      };
    }

    if (branch === "verb-mc") {
      const entry = randChoice(rng, IDENTIFY_VERB_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which word is the main verb in this sentence? "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "The verb tells you the action the subject performs. Find the subject first, then find the word that shows what it does.",
        explanation: `"${entry.correct}" is the verb in this sentence: "${entry.sentence}"`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: `Fill in the correct present tense form of the verb "${entry.verb}" to agree with the subject.`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: entry.clue,
        explanation: `${entry.clue[0].toUpperCase()}${entry.clue.slice(1)}: "${entry.before}${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, SUBJECT_VERB).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((e, i) => ({ id: `e${i}`, label: e.subject })));
      const targets = shuffle(rng, chosen.map((e, i) => ({ id: `e${i}`, label: e.verb })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((e, i) => (correctMap[`e${i}`] = `e${i}`));
      return {
        kind: "click-match",
        prompt: "Match each subject to the verb form that correctly agrees with it.",
        tokens,
        targets,
        correctMap,
        hint: "Decide whether the subject is singular or plural, then pick the matching verb form.",
        explanation: chosen.map((e) => `"${e.subject}" agrees with "${e.verb}" (${e.rule}).`).join(" "),
      };
    }

    const entry = randChoice(rng, CORRECTION_MC);
    const choices = shuffle(rng, [entry.correct, ...entry.wrong]);
    return {
      kind: "multiple-choice",
      prompt: "Which sentence has correct subject-verb agreement?",
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Check the true subject carefully — watch out for collective nouns, compound subjects, and phrases inserted between the subject and the verb.",
      explanation: `"${entry.correct}" is correct. The other options each break subject-verb agreement — by using the wrong verb form, changing the subject's number, or agreeing with the wrong word.`,
    };
  },
};
