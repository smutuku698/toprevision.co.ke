import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedA";

// Theme 1 vocabulary, verbatim from curriculum-reference/grade-6/english.json (Child Labour).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "orphanage", meaning: "a place where children without parents are cared for" },
  { word: "orphan", meaning: "a child whose parents have died" },
  { word: "domestic", meaning: "relating to the home or household" },
  { word: "servant", meaning: "a person employed to do household work for someone else" },
  { word: "underage", meaning: "younger than the legal age for something" },
  { word: "teenager", meaning: "a person aged between 13 and 19" },
  { word: "labour", meaning: "hard physical work" },
  { word: "homeless", meaning: "having no home to live in" },
  { word: "baby-sitter", meaning: "a person who looks after a child while the parents are away" },
  { word: "trafficking", meaning: "the illegal trade of moving people for exploitation" },
  { word: "street children", meaning: "children who live or work on the streets" },
  { word: "children's department", meaning: "the government office that protects children's welfare" },
  { word: "children's court", meaning: "a court that handles cases involving children" },
  { word: "exploit", meaning: "to treat someone unfairly to benefit from their work" },
  { word: "chores", meaning: "small routine household tasks" },
  { word: "house help", meaning: "a person employed to help with housework" },
  { word: "violate", meaning: "to break a rule or a person's rights" },
  { word: "fatigue", meaning: "extreme tiredness" },
  { word: "wages", meaning: "money paid regularly for work done" },
  { word: "employer", meaning: "a person or organisation that hires workers" },
  { word: "long hours", meaning: "an unusually large number of working hours" },
  { word: "salary", meaning: "a fixed regular payment for work, usually monthly" },
  { word: "income", meaning: "money received regularly from work or business" },
  { word: "work", meaning: "an activity done using effort to achieve a purpose" },
];

// Expressions, verbatim from the source, each given 4+ distinct real-world framings across branches
// so no single example gets copy-pasted wherever it appears (Rigor Standards entity-framing rule).
type Expression = { text: string; type: "fixed phrase" | "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "play games", type: "fixed phrase", meaning: "to have fun doing games" },
  { text: "far away", type: "fixed phrase", meaning: "at a great distance" },
  { text: "believe it or not", type: "fixed phrase", meaning: "used to introduce a surprising fact" },
  { text: "do your best", type: "fixed phrase", meaning: "to try as hard as you can" },
  { text: "burst into tears", type: "fixed phrase", meaning: "to suddenly start crying" },
  { text: "as hungry as a wolf", type: "simile", meaning: "extremely hungry" },
  { text: "as greedy as a hyena", type: "simile", meaning: "extremely greedy" },
  { text: "The thief was a hyena, he was so greedy", type: "metaphor", meaning: "calling someone a hyena to show they are very greedy" },
  { text: "work like a dog", type: "idiom", meaning: "to work extremely hard" },
  { text: "dog tired", type: "idiom", meaning: "extremely exhausted" },
  { text: "work for peanuts", type: "idiom", meaning: "to work for very little pay" },
  { text: "donkey work", type: "idiom", meaning: "hard, boring physical work" },
  { text: "all work and no play makes Jack a dull boy", type: "proverb", meaning: "too much work without rest makes life dull" },
  { text: "beat up", type: "phrasal verb", meaning: "to hit someone repeatedly and violently" },
  { text: "agree with", type: "phrasal verb", meaning: "to share the same opinion as someone" },
  { text: "put up with", type: "phrasal verb", meaning: "to tolerate something unpleasant" },
  { text: "cope with", type: "phrasal verb", meaning: "to deal successfully with a difficult situation" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.1");

// Scenario templates carrying the "tired/donkey work/dog tired" idiom cluster through 4 distinct
// real-world framings (a house-help scenario, a herding scenario, a market-vending scenario, a
// homework-after-chores scenario) so the same expression never reads identically twice.
const IDIOM_SCENARIOS: { name: (n: string) => string; correct: string; wrong: string[] }[] = [
  {
    name: (n) => `${n} works long hours as a house help in ${KENYAN_PLACES[0]} and comes home too exhausted to eat. Which idiom best describes how ${n} feels?`,
    correct: "dog tired",
    wrong: ["work for peanuts", "burst into tears", "believe it or not"],
  },
  {
    name: (n) => `${n} herds cattle from sunrise to sunset every single day instead of attending school. Which phrase best describes the kind of labour ${n} is doing?`,
    correct: "donkey work",
    wrong: ["play games", "do your best", "agree with"],
  },
  {
    name: (n) => `${n} sells vegetables at the market all day for an employer who pays almost nothing at the end of the week. Which idiom describes ${n}'s pay?`,
    correct: "work for peanuts",
    wrong: ["dog tired", "far away", "put up with"],
  },
  {
    name: (n) => `After a full day of chores, ${n} still tries to finish homework before bed. Which idiom shows ${n} is working extremely hard, without necessarily being paid unfairly?`,
    correct: "work like a dog",
    wrong: ["cope with", "believe it or not", "burst into tears"],
  },
];

export const childLabourPronunciationVocabulary: Skill = {
  id: "g6-eng-ls-child-labour",
  code: "LS.1",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Child Labour — Pronunciation & Vocabulary",
  description: "Identify words with the sound /ɪə/, use child-labour theme vocabulary correctly, and use fixed phrases, similes, metaphors, idioms and a proverb in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "idiom-scenario-mc", "vocab-click-match", "vocab-categorize", "expression-fill-blank"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words has the same vowel sound as in "tear" (${target.sound})?`,
        choices,
        correctIndex: choices.indexOf(target.word),
        layout: "row",
        hint: `Say each word slowly and listen for the ${target.sound} sound, as in "appear" or "clear".`,
        explanation: `"${target.word}" contains the sound ${target.sound}, the same target sound as "tear", "appear", "rear", "clear" and "severe".`,
      };
    }

    if (branch === "vocab-meaning-mc") {
      const item = randChoice(rng, VOCAB);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.meaning, ...distractors.map((d) => d.meaning)]);
      return {
        kind: "multiple-choice",
        prompt: `What does the word "${item.word}" mean?`,
        choices,
        correctIndex: choices.indexOf(item.meaning),
        layout: "list",
        hint: "Think about the theme of child labour and children's welfare.",
        explanation: `"${item.word}" means: ${item.meaning}.`,
      };
    }

    if (branch === "vocab-scenario-mc") {
      const item = randChoice(rng, VOCAB);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.word, ...distractors.map((d) => d.word)]);
      return {
        kind: "multiple-choice",
        prompt: `${name}'s teacher in ${place} explains: "${item.meaning}." Which vocabulary word matches this explanation?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "Match the definition to the exact vocabulary word.",
        explanation: `The word is "${item.word}" — it means ${item.meaning}.`,
      };
    }

    if (branch === "idiom-scenario-mc") {
      const scenario = randChoice(rng, IDIOM_SCENARIOS);
      const name = randChoice(rng, KENYAN_NAMES);
      const choices = shuffle(rng, [scenario.correct, ...scenario.wrong]);
      const matched = EXPRESSIONS.find((e) => e.text === scenario.correct)!;
      return {
        kind: "multiple-choice",
        prompt: scenario.name(name),
        choices,
        correctIndex: choices.indexOf(scenario.correct),
        layout: "list",
        hint: `Think about what "${scenario.correct}" really means: ${matched.meaning}.`,
        explanation: `"${scenario.correct}" means ${matched.meaning} — the other options don't fit the situation described.`,
      };
    }

    if (branch === "vocab-click-match") {
      const pool = shuffle(rng, VOCAB).slice(0, 6);
      const tokens = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of pool) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each child-labour vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Read each meaning carefully — some words look similar but mean different things.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const peopleWords = ["orphan", "servant", "teenager", "homeless", "baby-sitter", "street children", "employer", "house help"];
      const systemWords = ["orphanage", "children's department", "children's court", "trafficking", "wages", "salary", "income", "labour"];
      const pool = shuffle(rng, [
        ...peopleWords.map((w) => ({ id: w, label: w, bucket: "person" })),
        ...systemWords.map((w) => ({ id: w, label: w, bucket: "system-or-money" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these child-labour theme words: do they name a PERSON, or a SYSTEM/PAYMENT term?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "person", label: "Names a Person" },
          { id: "system-or-money", label: "System or Payment Term" },
        ],
        correctBucket,
        hint: "A person word names who someone is; a system/payment word names an institution, rule, or money term.",
        explanation: "Person words: orphan, servant, teenager, homeless, baby-sitter, street children, employer, house help. System/payment words: orphanage, children's department, children's court, trafficking, wages, salary, income, labour.",
      };
    }

    const t = randChoice(rng, FILL_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: `Complete the sentence using the expression "${t.text}".`,
      before: t.before,
      after: t.after,
      correctAnswer: t.text,
      inputMode: "text",
      hint: `This ${t.type} means: ${t.meaning}.`,
      explanation: `"${t.text}" (${t.type}) means ${t.meaning}.`,
    };
  },
};

// Fill-blank pairs where the surrounding sentence genuinely fits the specific expression it names —
// never picked independently of a mismatched template. 15 distinct pairs (well above the 10+ target).
const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "play games", type: "fixed phrase", meaning: "to have fun doing games", before: "After finishing all the chores, the children finally had time to ", after: " together." },
  { text: "far away", type: "fixed phrase", meaning: "at a great distance", before: "The orphanage was ", after: " from the nearest town, so visits were rare." },
  { text: "believe it or not", type: "fixed phrase", meaning: "used to introduce a surprising fact", before: "", after: ", some children work more than ten hours a day." },
  { text: "do your best", type: "fixed phrase", meaning: "to try as hard as you can", before: "The teacher told the tired pupil to ", after: " in class despite being exhausted." },
  { text: "burst into tears", type: "fixed phrase", meaning: "to suddenly start crying", before: "When she heard she could finally go back to school, she ", after: " with joy." },
  { text: "as hungry as a wolf", type: "simile", meaning: "extremely hungry", before: "After a full day of labour with no food, the boy was ", after: "." },
  { text: "as greedy as a hyena", type: "simile", meaning: "extremely greedy", before: "The employer who paid unfair wages was described as ", after: "." },
  { text: "work like a dog", type: "idiom", meaning: "to work extremely hard", before: "The house help had to ", after: " from dawn until night." },
  { text: "dog tired", type: "idiom", meaning: "extremely exhausted", before: "By the end of the long shift, the servant felt ", after: "." },
  { text: "work for peanuts", type: "idiom", meaning: "to work for very little pay", before: "Many child labourers ", after: ", earning almost nothing." },
  { text: "donkey work", type: "idiom", meaning: "hard, boring physical work", before: "Carrying heavy loads all day was nothing but ", after: "." },
  { text: "beat up", type: "phrasal verb", meaning: "to hit someone repeatedly and violently", before: "It is illegal for an employer to ", after: " a worker." },
  { text: "agree with", type: "phrasal verb", meaning: "to share the same opinion as someone", before: "The children's court did not ", after: " the way the employer treated the servant." },
  { text: "put up with", type: "phrasal verb", meaning: "to tolerate something unpleasant", before: "No child should have to ", after: " such long working hours." },
  { text: "cope with", type: "phrasal verb", meaning: "to deal successfully with a difficult situation", before: "The counsellor helped the street child ", after: " the stress of homelessness." },
];
