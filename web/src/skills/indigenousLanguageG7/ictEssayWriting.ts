import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const ESSAY_SKILLS: { skill: string; description: string }[] = [
  { skill: "Introduction", description: "The opening part of an essay that presents the topic to the reader" },
  { skill: "Body", description: "The main part of an essay where ideas are developed and explained in paragraphs" },
  { skill: "Conclusion", description: "The closing part of an essay that sums up the main ideas" },
  { skill: "Identifying essay parts", description: "Reading sample essays to recognise the introduction, body, and conclusion" },
  { skill: "Identifying ideas from samples", description: "Picking out the main ideas used in a sample essay" },
  { skill: "Reading aloud and correcting mistakes", description: "Reading an essay out loud in class and fixing errors that are noticed" },
  { skill: "Selecting a topic", description: "Choosing a specific subject to write an essay about" },
  { skill: "Sharing written work", description: "Letting other learners read an essay after it has been written" },
  { skill: "Researching essay writing", description: "Searching the library or digital sources for more information on how to write essays" },
  { skill: "Displaying essays", description: "Putting finished essays up in the class creative corner for others to see" },
  { skill: "Responsibility in essay writing", description: "Taking initiative to identify an idea and select a topic independently" },
  { skill: "Respect during essay reading", description: "Listening respectfully as other learners' sample essays are read in class" },
];

const ESSAY_FEATURES: { text: string; bucket: string }[] = [
  { text: "Introduces the topic of the essay to the reader", bucket: "Introduction" },
  { text: "Captures the reader's attention at the start", bucket: "Introduction" },
  { text: "States what the essay will be about", bucket: "Introduction" },
  { text: "Gives the reader a first impression of what the essay covers", bucket: "Introduction" },
  { text: "Develops the main ideas in separate paragraphs", bucket: "Body" },
  { text: "Provides examples and explanations to support the ideas", bucket: "Body" },
  { text: "Forms the longest part of the essay", bucket: "Body" },
  { text: "Contains most of the essay's paragraphs", bucket: "Body" },
  { text: "Sums up the main points discussed in the essay", bucket: "Conclusion" },
  { text: "Provides a final thought or closing statement", bucket: "Conclusion" },
  { text: "Comes at the end of the essay", bucket: "Conclusion" },
  { text: "Leaves the reader with a final impression of the essay", bucket: "Conclusion" },
];

const ESSAY_STEPS: { id: string; label: string }[] = [
  { id: "read", label: "Read sample essays in class and identify the three parts" },
  { id: "ideas", label: "Identify ideas from the sample essays" },
  { id: "readAloud", label: "Read essays aloud in class and correct mistakes" },
  { id: "write", label: "Select a topic and write a simple essay, then share it with other learners" },
  { id: "research", label: "Search for more information about essay writing from the library or digital sources" },
  { id: "display", label: "Display essays in the class creative corner" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "The opening part of an essay that presents the topic to the reader is called the", after: ".", answer: "introduction" },
  { before: "The main part of an essay where ideas are developed in paragraphs is called the", after: ".", answer: "body" },
  { before: "The closing part of an essay that sums up the main ideas is called the", after: ".", answer: "conclusion" },
  { before: "Choosing a specific subject to write an essay about is called selecting a", after: ".", answer: "topic" },
  { before: "Reading an essay aloud in class and fixing noticed errors is called reading aloud and correcting", after: ".", answer: "mistakes" },
  { before: "Searching the library or digital sources for more information on how to write essays helps improve essay", after: ".", answer: "writing" },
  { before: "Putting a finished essay up in the class creative corner for others to see is called", after: "the essay.", answer: "displaying" },
  { before: "Reading through sample essays to recognise their introduction, body, and conclusion is called identifying the essay's", after: ".", answer: "parts" },
  { before: "Taking the initiative to identify an idea and select a topic independently shows", after: ".", answer: "responsibility" },
  { before: "Listening attentively as other learners' sample essays are read aloud shows", after: "for their work.", answer: "respect" },
  { before: "Writing an essay so that ideas reach the reader clearly is important for effective", after: ".", answer: "communication" },
  { before: "Picking out the main ideas used in a sample essay is called identifying its", after: ".", answer: "ideas" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} reads a sample essay and needs to identify the part that comes at the end and sums up the main points. What part of the essay is this?`,
      correct: "The conclusion, since it comes last and sums up the ideas already discussed",
      wrong: ["The introduction, since it comes first", "The body, since it contains the most detail", "Essays do not need a distinct ending part"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} starts writing an essay by jumping straight into developing ideas about the topic, without first telling the reader what the essay is about. What is ${who} missing?`,
      correct: "An introduction that presents the topic to the reader",
      wrong: ["A conclusion, since the essay has not been developed yet", "A body, since ideas are already being developed", "Essays do not need an opening part"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While writing an essay in ${where}, ${who} strings together several unrelated ideas without organising them into separate paragraphs. What is the problem with this?`,
      correct: "The body of an essay needs organised paragraphs that each develop one idea, not a random string of points",
      wrong: ["The introduction should contain all the ideas instead", "The conclusion should introduce new ideas not mentioned before", "Essays do not need paragraph organisation at all"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After sharing a finished essay with classmates in ${where}, ${who} also searches the library and digital sources for more information about essay writing. What is the benefit of this extra step?`,
      correct: "Researching essay writing helps improve the structure and quality of future essays",
      wrong: ["Research is unnecessary once an essay has already been shared", "Sharing an essay means it never needs revising again", "An essay never needs any improvement once it is written"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} reads an essay aloud in class, and a classmate points out a mistake in one sentence. What should ${who} do?`,
      correct: "Correct the mistake, since reading aloud and fixing errors is a normal part of improving writing",
      wrong: ["Ignore the mistake since the essay has already been written", "Insist only the teacher may point out mistakes", "Refuse to have the essay read aloud again to avoid criticism"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} wants to write an essay but has not yet decided what to write about. What should ${who} do first?`,
      correct: "Select a specific topic before starting to write",
      wrong: ["Start writing without settling on a topic first", "Copy a classmate's topic exactly without adjusting it", "Write about several unrelated topics within one essay"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} finishes an essay and it is later displayed in the class creative corner. What is the purpose of displaying finished essays this way?`,
      correct: "To share finished work publicly so it can be seen and enjoyed by other learners",
      wrong: ["Displaying essays is discouraged since writing should always stay private", "Only the single best essay in the class should ever be displayed", "Displaying an essay means no further essays need to be written"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is asked why essay writing matters for effective communication. What is the best answer?`,
      correct: "A well-structured essay communicates ideas clearly and in an organised way to the reader",
      wrong: ["Essay writing is only useful for passing exams", "Essays do not need to communicate anything clearly to be effective", "The structure of an essay makes no difference to communication"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `In class in ${where}, sample essays are read aloud and ${who}'s classmate uses an idea ${who} had not thought of before. How should ${who} respond?`,
      correct: "Listen respectfully and consider the classmate's idea, even though it is unfamiliar",
      wrong: ["Interrupt the classmate mid-reading to disagree", "Dismiss the idea simply because it is unfamiliar", "Refuse to listen to a peer's essay being read aloud"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `Before writing a personal essay, ${who} in ${where} reads several sample essays and picks out the ideas each one uses. Why is this step useful?`,
      correct: "Identifying ideas from sample essays helps understand what to include before attempting a personal essay",
      wrong: ["The sample essays should be copied word for word into the new essay", "Sample essays should be skipped so the format can be guessed instead", "Memorising a sample essay removes the need to analyse its ideas"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While writing the ending of an essay in ${where}, ${who} introduces a brand-new idea that was never discussed anywhere earlier in the essay. What is wrong with this conclusion?`,
      correct: "A conclusion should sum up ideas already discussed, not introduce new ones the essay never covered",
      wrong: ["A conclusion should always be the longest part of the essay", "A conclusion should repeat the introduction word for word", "Essays do not require a distinct conclusion at all"],
    };
  },
];

export const ictEssayWriting: Skill = {
  id: "g7-il-w-ict-internet",
  code: "W.2",
  subjectId: "indigenous-language",
  strandId: "g7-il-writing",
  grade: 7,
  title: "ICT and internet: essay writing",
  description: "Outline the three parts of an essay from samples, compose an essay on a theme, and acknowledge the importance of essay writing for communication.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Every essay has an introduction that presents the topic, a body that develops ideas in paragraphs, and a conclusion that sums up the main points.";

    if (branch === "match") {
      const chosen = shuffle(rng, ESSAY_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each essay-writing skill or part to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, ESSAY_FEATURES).slice(0, 9);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each feature into the essay part it belongs to: introduction, body, or conclusion.",
        items,
        buckets,
        correctBucket,
        hint: "The introduction opens the essay, the body develops the ideas, and the conclusion closes it.",
        explanation: chosen.map((c) => `"${c.text}" — belongs to the ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ESSAY_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of learning to write an essay in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ESSAY_STEPS.map((s) => s.id),
        hint: "Start by reading samples and identifying parts and ideas, then read aloud and correct mistakes, write and share, research further, then display.",
        explanation: ESSAY_STEPS.map((s) => s.label).join(" → "),
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
