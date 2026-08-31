import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const READING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Reader's theatre", description: "Reading a passage aloud together, with each learner taking on a role or part" },
  { skill: "Direct question", description: "A question whose answer is stated word for word in the passage" },
  { skill: "Inferential question", description: "A question whose answer must be worked out from clues, since it isn't stated directly" },
  { skill: "Main idea outline", description: "Summarising the central point of a passage or paragraph" },
  { skill: "Vocabulary identification", description: "Picking out words related to the theme from a passage and reading them aloud" },
  { skill: "Context inference", description: "Working out the probable meaning of a new word from the sentences around it" },
  { skill: "Sentence construction", description: "Using newly identified vocabulary correctly in a sentence of your own" },
  { skill: "Peer sentence review", description: "Checking a classmate's sentence for whether new vocabulary was used correctly" },
  { skill: "Reading culture", description: "The regular habit of reading for enjoyment and lifelong learning" },
  { skill: "Cultural knowledge from texts", description: "Gaining an understanding of different communities' cultures through reading" },
  { skill: "Social cohesion", description: "Respecting others as a result of understanding cultural diversity through reading" },
];

const QUESTION_TYPES: { context: string; question: string; bucket: string }[] = [
  { context: "The passage states that the community celebrates a harvest festival every August.", question: "When does the community celebrate its harvest festival?", bucket: "Direct question" },
  { context: "The passage describes elders wearing different coloured beads at the festival, without explaining what the colours mean.", question: "What might the different bead colours represent?", bucket: "Inferential question" },
  { context: "The passage says that over forty ethnic communities live in Kenya.", question: "How many ethnic communities does the passage say live in Kenya?", bucket: "Direct question" },
  { context: "The passage describes two neighbouring communities sharing a meal after a disagreement, without stating whether they resolved it.", question: "Did the two communities likely begin to reconcile?", bucket: "Inferential question" },
  { context: "The passage states that different communities in Kenya wear distinct traditional dress.", question: "According to the passage, do different communities dress differently?", bucket: "Direct question" },
  { context: "The passage describes a child feeling proud after performing a dance from another community's culture, without stating why.", question: "Why might the child have felt proud?", bucket: "Inferential question" },
  { context: "The passage names three foods eaten during a cultural celebration.", question: "Which three foods does the passage name?", bucket: "Direct question" },
  { context: "The passage describes a leader greeting a visiting leader in the visitor's own language, without explaining the reason.", question: "Why might the leader have greeted the visitor in their own language?", bucket: "Inferential question" },
  { context: "The passage states that unity is one of the values celebrated during the cultural festival.", question: "Which value does the passage say is celebrated at the festival?", bucket: "Direct question" },
  { context: "The passage describes children from different communities playing together happily, without stating what this shows about them.", question: "What might this suggest about how the children relate to one another?", bucket: "Inferential question" },
  { context: "The passage states that each community has its own customs for greeting visitors.", question: "According to the passage, do all communities share the same greeting customs?", bucket: "Direct question" },
  { context: "The passage describes a family inviting neighbours from a different ethnic community to their celebration, without saying why.", question: "Why might the family have invited neighbours from a different community?", bucket: "Inferential question" },
];

const READING_STEPS: { id: string; label: string }[] = [
  { id: "theatre", label: "Conduct a reader's theatre to read a passage on the theme of cultural diversity" },
  { id: "direct", label: "Collaborate with peers to answer direct questions" },
  { id: "mainidea", label: "Outline the main ideas from the passage" },
  { id: "inferential", label: "Respond to inferential questions on the theme of the passage" },
  { id: "vocab", label: "Collaborate with peers to identify vocabulary related to the theme and read it aloud" },
  { id: "infer", label: "Work jointly to infer the meaning of vocabulary in context" },
  { id: "sentence", label: "Make sentences using the vocabulary identified and review each other's sentences" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "A question whose answer is stated word for word in a passage is called a", after: "question.", answer: "direct" },
  { before: "A question whose answer must be worked out from clues in a passage is called an", after: "question.", answer: "inferential" },
  { before: "Reading a passage aloud together, with each learner taking a role, is called a reader's", after: ".", answer: "theatre" },
  { before: "Summarising the central point of a passage is called finding the", after: ".", answer: "main idea" },
  { before: "Working out the probable meaning of a new word from nearby sentences is called using context", after: ".", answer: "clues" },
  { before: "A regular habit of reading for enjoyment and lifelong learning is called a reading", after: ".", answer: "culture" },
  { before: "Understanding and valuing the different ways communities live, dress and celebrate is called appreciating cultural", after: ".", answer: "diversity" },
  { before: "Gaining knowledge about different communities through reading can promote social", after: ".", answer: "cohesion" },
  { before: "Checking a classmate's sentence to see whether new vocabulary was used correctly is called peer", after: ".", answer: "review" },
  { before: "Kenya is home to many different", after: ", each with its own customs and traditions.", answer: "ethnicities", accepted: ["communities"] },
  { before: "When many different cultures live together and respect one another, this reflects", after: "within diversity.", answer: "unity" },
  { before: "A form of dress, food, or custom that a community traditionally practises is part of its", after: ".", answer: "culture" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `A passage states plainly that "over forty ethnic communities live in Kenya." ${who} in ${where} is then asked how many communities the passage names. What kind of question is this?`,
      correct: "A direct question — the answer is stated word for word in the passage",
      wrong: ["An inferential question, since some thinking is required", "A question that cannot be answered from the passage", "A vocabulary-only question"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} reads a passage in which a leader greets a visitor in the visitor's own language, but the passage never explains why. ${who} is asked why the leader did this. What kind of question is this, and how should ${who} answer?`,
      correct: "An inferential question — the answer must be worked out from clues in the passage",
      wrong: ["A direct question, since it can be copied straight from the passage", "A question with no possible answer at all", "A question that should be skipped since it is unclear"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} meets the unfamiliar word "customs" in a passage that goes on to describe traditions passed from parents to children. How can ${who} work out what "customs" probably means?`,
      correct: "By using context clues from the surrounding sentences",
      wrong: ["By guessing randomly with no evidence", "By skipping the word and the sentence entirely", "By assuming it means the same as \"festival\""],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After identifying the word "diversity" from a passage, ${who} in ${where} writes a sentence with it and shares it with a partner for review. What is the main purpose of this peer review step?`,
      correct: "It helps check whether the new vocabulary was used correctly before moving on",
      wrong: ["It replaces the need to have read the passage at all", "It only matters if the sentence is obviously wrong", "It removes the need to understand the word's meaning"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s class in ${where} reads a passage on cultural diversity aloud, with each learner taking on a different role or part. What activity is the class doing?`,
      correct: "A reader's theatre",
      wrong: ["A vocabulary gap-fill exercise", "A silent, individual reading session", "A spelling test based on the passage"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} reads a full passage about cultural diversity and is then asked to state its central point in one or two sentences. What is ${who} being asked to do?`,
      correct: "Outline the main idea of the passage",
      wrong: ["List every single detail mentioned in the passage", "Answer only the direct questions and ignore the rest", "Guess the topic without having read the passage"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `Over several months, ${who} in ${where} reads passage after passage about different communities' cultures and begins choosing to read for enjoyment outside class too. What has ${who} developed?`,
      correct: "A reading culture — a regular habit of reading for enjoyment and lifelong learning",
      wrong: ["A dependence on being told what to read", "A dislike of reading unfamiliar topics", "A habit that only applies during comprehension tests"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After reading several passages describing other communities' values and customs, ${who} in ${where} starts treating classmates from different communities with more respect. What does this show about reading?`,
      correct: "Reading about cultural diversity can promote social cohesion and respect for others",
      wrong: ["Reading has no real effect on how people treat one another", "Only direct questions can change how a reader behaves", "Respect can only be learnt outside of reading passages"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is asked whether the passage says all communities share the same greeting customs, and answers using only what the passage actually states. What has ${who} done correctly?`,
      correct: "Answered a direct question using only the information given in the text",
      wrong: ["Answered based on outside knowledge instead of the text", "Skipped the question since it seemed too easy", "Guessed without reading the passage at all"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `A passage never states whether two neighbouring communities in ${where} resolved a disagreement, but describes them sharing a meal together afterward. What can ${who} reasonably infer?`,
      correct: "The communities probably began to reconcile, since sharing a meal suggests improving relations",
      wrong: ["The communities definitely resolved every disagreement completely", "The passage directly states that they reconciled", "No conclusion at all can be drawn from this detail"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} needs to use the word "diversity" in an original sentence but instead copies the dictionary definition word for word. What should ${who} do instead?`,
      correct: "Write an original sentence that shows understanding of the word's meaning",
      wrong: ["Continue copying definitions, since they are always correct", "Avoid using the word again to prevent mistakes", "Ask a peer to write the whole sentence instead"],
    };
  },
];

export const culturalDiversityReading: Skill = {
  id: "g7-il-r-cultural-diversity",
  code: "R.5",
  subjectId: "indigenous-language",
  strandId: "g7-il-reading",
  grade: 7,
  title: "Cultural diversity: reading for information",
  description: "Answer direct and inferential questions from texts on cultural diversity, infer vocabulary meaning from context, and build a reading culture.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A direct question's answer is stated in the text. An inferential question's answer must be worked out from clues.";

    if (branch === "match") {
      const chosen = shuffle(rng, READING_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each reading skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, QUESTION_TYPES).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `q${i}`, label: `${c.context} → "${c.question}"` }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`q${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each question as direct (answer stated in the text) or inferential (answer must be worked out).",
        items,
        buckets,
        correctBucket,
        hint: "Check whether the passage states the answer plainly, or only gives clues that require some thinking.",
        explanation: chosen.map((c) => `"${c.question}" — ${c.bucket.toLowerCase()}, since ${c.context.toLowerCase()}`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, READING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of reading a passage on cultural diversity for comprehension in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: READING_STEPS.map((s) => s.id),
        hint: "Start with the reader's theatre, then answer direct questions, outline the main idea, answer inferential questions, identify vocabulary, infer meaning, and finally build sentences.",
        explanation: READING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        acceptedAnswers: entry.accepted,
        inputMode: "text",
        hint,
        explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim(),
      };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, [entry.correct, ...entry.wrong]);
    return {
      kind: "multiple-choice",
      prompt: entry.prompt,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
