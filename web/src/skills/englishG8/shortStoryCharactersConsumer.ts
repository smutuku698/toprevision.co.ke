import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Mama Chelagat ran the busiest kiosk at Kapchorwa market, and she was known for weighing every kilo of sugar exactly, never a gram short. One afternoon, a boy named Kiptum bought a packet of biscuits, only to find half of them broken when he opened it at home. He walked all the way back, worried Mama Chelagat would scold him for complaining. Instead, she examined the packet, apologised, and replaced it without hesitation, saying customers deserved to get what they paid for. Nearby, a rival trader named Osoro watched and laughed, telling Mama Chelagat she was too soft and losing money by pleasing customers. Just then, Inspector Wanjala arrived for a routine check of the market stalls. He found Osoro's weighing scale quietly rigged to show more than the true weight. Osoro protested that everyone did it, but the inspector fined him on the spot. Mama Chelagat's stall, praised for honest measures, was recommended to other traders as a model to follow.";

const CHARACTERS: { name: string; description: string }[] = [
  { name: "Mama Chelagat", description: "The honest kiosk owner who replaced Kiptum's broken biscuits without complaint" },
  { name: "Kiptum", description: "The boy who returned to the kiosk, worried, to report the broken biscuits" },
  { name: "Osoro", description: "The rival trader who mocked Mama Chelagat and rigged his weighing scale" },
  { name: "Inspector Wanjala", description: "The official who checked the market stalls and fined Osoro for cheating" },
];

const TRAIT_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What can you infer about Mama Chelagat's character from how she handled Kiptum's complaint?",
    correct: "She is honest and values fairness to her customers, even when it costs her a little",
    distractors: ["She is impatient and dislikes dealing with customers", "She only cares about making the most profit possible", "She is careless about what she sells"],
    explanation: "Although the text never says 'Mama Chelagat is honest' directly, her action — apologising and replacing the biscuits without hesitation, saying customers deserved what they paid for — shows honesty and fairness.",
  },
  {
    q: "What can you infer about Kiptum's feelings as he walked back to the kiosk?",
    correct: "He was anxious, unsure how Mama Chelagat would react to his complaint",
    distractors: ["He was confident nothing bad would happen", "He was angry and planning to shout at her", "He did not care about the outcome at all"],
    explanation: "The passage says Kiptum 'worried Mama Chelagat would scold him for complaining,' which is a context clue to his nervousness, even though it isn't stated as a direct feeling-word.",
  },
  {
    q: "What does Osoro's reaction to Mama Chelagat reveal about his character?",
    correct: "He is dishonest and dismissive of fair treatment toward customers",
    distractors: ["He is the most respected trader in the market", "He strongly supports honest business practices", "He is shy and avoids speaking to other traders"],
    explanation: "Osoro mocks Mama Chelagat for being 'too soft' and is later found to have rigged his scale — both actions reveal a dishonest, self-serving character.",
  },
  {
    q: "What trait does Inspector Wanjala show by fining Osoro despite his protest that 'everyone did it'?",
    correct: "Fairness and firmness in enforcing rules, regardless of excuses",
    distractors: ["Carelessness about following the rules", "Favoritism toward certain traders", "Indifference to how traders treat customers"],
    explanation: "Wanjala fines Osoro immediately despite the excuse, showing he applies the rule firmly and fairly rather than making exceptions.",
  },
];

const FILL_ITEMS = [
  { before: "Mama Chelagat ran the busiest kiosk at Kapchorwa market, and she was known for weighing every kilo of", after: "exactly, never a gram short.", correctAnswer: "sugar" },
  { before: "Inspector Wanjala arrived for a routine check of the market", after: ".", correctAnswer: "stalls" },
  { before: "Osoro protested that everyone did it, but the inspector", after: "him on the spot.", correctAnswer: "fined" },
];

const IDENTIFY_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Who is the trader that was fined for rigging his weighing scale?",
    correct: "Osoro",
    distractors: ["Mama Chelagat", "Kiptum", "Inspector Wanjala"],
    explanation: "The passage states 'Inspector Wanjala... found Osoro's weighing scale quietly rigged to show more than the true weight.'",
  },
  {
    q: "Who returned to the kiosk after finding broken biscuits at home?",
    correct: "Kiptum",
    distractors: ["Osoro", "Inspector Wanjala", "Mama Chelagat"],
    explanation: "The passage says 'a boy named Kiptum bought a packet of biscuits... He walked all the way back' after finding them broken.",
  },
];

export const shortStoryCharactersConsumer: Skill = {
  id: "g8-eng-r-short-story-characters-consumer",
  code: "R.8",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Short Story - Characters (Class Reader)",
  description: "Identify characters in a short story and use contextual clues to infer their traits, acknowledging the role characters play in a story.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "identify", "trait", "categorize", "fill"] as const);
    const hint = "Look at what each character does and says — actions and dialogue often reveal traits the story never states directly.";

    if (branch === "match") {
      const tokens = shuffle(rng, CHARACTERS.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, CHARACTERS.map((c) => ({ id: c.name, label: c.description })));
      const correctMap: Record<string, string> = {};
      for (const c of CHARACTERS) correctMap[c.name] = c.name;
      return {
        kind: "click-match",
        prompt: "Match each character in the story to their description.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint,
        explanation: CHARACTERS.map((c) => `${c.name} — ${c.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "identify") {
      const entry = randChoice(rng, IDENTIFY_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "row",
        hint: "Reread the passage carefully to find who performed this specific action.",
        explanation: entry.explanation,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CHARACTERS);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.name }));
      const buckets = [
        { id: "honest", label: "Acts honestly" },
        { id: "dishonest", label: "Acts dishonestly" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => {
        correctBucket[`c${i}`] = c.name === "Osoro" ? "dishonest" : "honest";
      });
      return {
        kind: "categorize",
        prompt: "Sort each character by whether their actions in the story were honest or dishonest.",
        passage: STORY,
        items,
        buckets,
        correctBucket,
        hint: "Think about what each character actually did — replaced goods fairly, complained honestly, enforced rules, or cheated customers.",
        explanation: "Mama Chelagat, Kiptum, and Inspector Wanjala all acted honestly (replacing goods fairly, reporting a genuine problem, enforcing the rules). Osoro acted dishonestly by rigging his scale.",
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word from the story.",
        passage: STORY,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look for the exact word in the passage above.",
        explanation: `The passage reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    const entry = randChoice(rng, TRAIT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      passage: STORY,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: entry.explanation,
    };
  },
};
