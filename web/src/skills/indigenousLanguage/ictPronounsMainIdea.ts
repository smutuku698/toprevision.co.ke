import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PRONOUN_SENTENCES: { before: string; pronoun: string; after: string; distractors: string[] }[] = [
  { before: "Mumbi lost her password, so", pronoun: "she", after: "had to reset her account.", distractors: ["computer", "password", "quickly"] },
  { before: "The hackers tried to break into the school system, but", pronoun: "they", after: "were blocked by the firewall.", distractors: ["system", "firewall", "school"] },
  { before: "I found a strange link in my email, so", pronoun: "I", after: "reported it instead of clicking it.", distractors: ["link", "email", "carefully"] },
  { before: "This is my new laptop;", pronoun: "it", after: "has a strong antivirus program.", distractors: ["laptop", "antivirus", "strongly"] },
  { before: "Our teacher warned us about weak passwords, so", pronoun: "we", after: "changed ours immediately.", distractors: ["passwords", "teacher", "immediately"] },
];

const MAIN_IDEA_PASSAGES: { text: string; mainIdea: string; distractors: string[] }[] = [
  {
    text: "Cyber security experts visited a junior school to teach learners how to recognize suspicious links and fake messages. They explained that a real bank will never ask for a password by text message. Students practiced spotting fake login pages during the session and were given a checklist to take home to their families.",
    mainIdea: "Experts taught students how to recognize suspicious links and fake messages online",
    distractors: [
      "A bank sent students a text message asking for their passwords",
      "Students were banned from using computers at school",
      "The checklist explained how to build a new website",
    ],
  },
  {
    text: "A small business owner lost access to her online shop after clicking a link promising a free upgrade. Within minutes, unknown orders appeared using her customers' saved details. She reported the incident and learned to always check a website's address bar before entering any information.",
    mainIdea: "A business owner learned to check website addresses after falling for a scam link",
    distractors: [
      "A business owner received a free upgrade from a trusted website",
      "Customers refused to shop online again after the incident",
      "The business owner stopped using the internet completely",
    ],
  },
  {
    text: "Many learners create the same simple password for every account, which makes it easy for hackers to break in everywhere at once. A digital literacy club now encourages students to use a different, longer password for each important account, and to enable extra verification steps whenever possible.",
    mainIdea: "Using different, stronger passwords for each account helps protect against hackers",
    distractors: [
      "Hackers cannot break into any account with a simple password",
      "The digital literacy club banned the use of passwords",
      "Learners should use the same password everywhere for convenience",
    ],
  },
];

export const ictPronounsMainIdea: Skill = {
  id: "il-ls-ict-pronouns-mainidea",
  code: "LS.2",
  subjectId: "indigenous-language",
  strandId: "il-listening-speaking",
  grade: 9,
  title: "ICT & cyber security: pronouns and main idea",
  description: "Identify the pronoun that completes a cyber-security sentence and pick out the main idea of a short text on the theme.",
  generate(rng) {
    if (rng() < 0.5) {
      const entry = randChoice(rng, PRONOUN_SENTENCES);

      return {
        kind: "fill-blank",
        prompt: "Type the pronoun that correctly completes this sentence.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.pronoun,
        acceptedAnswers: [entry.pronoun],
        inputMode: "text",
        hint: "A pronoun stands in for a noun already mentioned or understood — look at who or what is being replaced.",
        explanation: `"${entry.pronoun}" is the pronoun that fits: "${entry.before} ${entry.pronoun} ${entry.after}"`,
      };
    }

    const entry = randChoice(rng, MAIN_IDEA_PASSAGES);
    const choices = shuffle(rng, [entry.mainIdea, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      passage: entry.text,
      prompt: "What is the main idea of this text?",
      choices,
      correctIndex: choices.indexOf(entry.mainIdea),
      layout: "list",
      hint: "The main idea covers the whole passage, not just one small detail from it.",
      explanation: `The text is mainly about: ${entry.mainIdea}.`,
    };
  },
};
