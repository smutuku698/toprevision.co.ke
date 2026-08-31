import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VERBAL_CUES = [
  "Excuse me, may I add something?",
  "Sorry to interrupt, but I have a point on that.",
  "If I may just say something here...",
  "Pardon me, could I come in on that point?",
  "I don't mean to cut in, but I'd like to add a thought.",
];

const NON_VERBAL_CUES = [
  "Raising a hand and waiting to be noticed",
  "Leaning forward slightly while making eye contact",
  "A light nod paired with an open hand gesture toward the speaker",
  "Waiting for a natural pause before leaning in to speak",
];

const CUE_FUNCTIONS: { phrase: string; function: string }[] = [
  { phrase: "Excuse me, may I add something?", function: "A verbal cue that politely signals a wish to speak without cutting the current speaker off" },
  { phrase: "Raising a hand and waiting to be noticed", function: "A non-verbal cue that requests a turn without interrupting the flow of speech" },
  { phrase: "Sorry to interrupt, but I have a point on that.", function: "A verbal cue that acknowledges the interruption while still respecting the speaker" },
  { phrase: "Leaning forward slightly while making eye contact", function: "A non-verbal cue that shows readiness to speak while waiting for a pause" },
  { phrase: "If I may just say something here...", function: "A verbal cue that asks permission before adding a new point" },
  { phrase: "A light nod paired with an open hand gesture toward the speaker", function: "A non-verbal cue that signals agreement while requesting a chance to add a comment" },
];

const TERMS = ["Dominating the conversation", "A polite interruption", "An impolite interruption", "Fair turn-taking"] as const;
type Term = (typeof TERMS)[number];

const TERM_EXPLANATION: Record<Term, string> = {
  "Dominating the conversation": "the speaker talks for a long time and does not give classmates a fair chance to contribute.",
  "A polite interruption": "the speaker uses a verbal or non-verbal cue and waits for a pause before adding a point respectfully.",
  "An impolite interruption": "the speaker cuts in abruptly with no cue, apology, or waiting for a pause.",
  "Fair turn-taking": "everyone gets an agreed, equal chance to speak without needing to interrupt at all.",
};

const SCENARIOS: { desc: string; term: Term }[] = [
  { desc: "Brian spoke for the entire ten-minute discussion on drug and substance abuse and did not let any classmate finish a sentence.", term: "Dominating the conversation" },
  { desc: "Njeri kept talking over anyone who tried to contribute during the group's discussion on substance abuse awareness, barely pausing for breath.", term: "Dominating the conversation" },
  { desc: "Amina waited for a natural pause, raised her hand, and said, \"Excuse me, may I add a point about road safety campaigns?\"", term: "A polite interruption" },
  { desc: "Musa leaned forward, made eye contact, and said, \"Pardon me, could I come in on that point about drug abuse prevention?\" before adding his idea.", term: "A polite interruption" },
  { desc: "Otieno cut in the moment a classmate started speaking about the effects of substance abuse, without any warning or apology.", term: "An impolite interruption" },
  { desc: "Kevin suddenly blurted out his own opinion in the middle of Faith's sentence and never acknowledged that he had interrupted her.", term: "An impolite interruption" },
  { desc: "The group agreed to go round in order, and each member spoke about drug awareness in turn while the others listened quietly.", term: "Fair turn-taking" },
  { desc: "Faith noticed the group was talking over each other, so she suggested, \"Let's take turns — perhaps Kevin can finish his point first.\"", term: "Fair turn-taking" },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "", after: "me, may I add a point about road safety?", correctAnswer: "Excuse", acceptedAnswers: ["Pardon"] },
  { before: "Sorry to", after: ", but I'd like to raise a point about drug abuse.", correctAnswer: "interrupt" },
  { before: "If I", after: ", I have some information on this topic.", correctAnswer: "may" },
  { before: "I don't mean to cut", after: ", but that statistic about road crashes surprised me.", correctAnswer: "in" },
  { before: "Pardon me, could I come", after: " on that point about substance abuse?", correctAnswer: "in" },
];

const ORDER_STEPS = [
  { id: "listen", label: "Listen carefully until the speaker reaches a natural pause" },
  { id: "cue", label: "Use a verbal or non-verbal cue to signal you would like to speak" },
  { id: "wait", label: "Wait for the speaker to acknowledge you or finish their point" },
  { id: "contribute", label: "Make your contribution clearly and briefly" },
  { id: "yield", label: "Allow others a chance to respond before speaking again" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How can you ensure that you do not dominate a conversation?",
    correct: "By listening as much as you speak, and inviting others to share their views",
    distractors: ["By speaking louder than everyone else so your point is heard", "By finishing your point quickly so no one notices you spoke the most", "By avoiding the discussion altogether"],
  },
  {
    q: "Why is it important to use both verbal and non-verbal cues when interrupting a conversation politely?",
    correct: "They signal a wish to speak while still showing respect for the person currently talking",
    distractors: ["They guarantee that you will always be allowed to speak immediately", "They are only necessary during formal debates, never in everyday conversation", "They replace the need to actually listen to what is being said"],
  },
  {
    q: "During a class discussion on drug and substance abuse, why might fair turn-taking be especially important?",
    correct: "It allows different views and experiences on a sensitive topic to be heard respectfully",
    distractors: ["It ensures the discussion finishes as quickly as possible", "It means only the most confident speakers should be heard", "It prevents the teacher from needing to guide the discussion"],
  },
  {
    q: "What is the risk of never using a polite interruption cue during a group discussion?",
    correct: "You may end up talking over others or missing the chance to contribute at all",
    distractors: ["You will automatically be seen as the most respectful speaker", "The discussion will naturally become more organised", "Other speakers will always pause for you without being asked"],
  },
];

export const politeInterruptionsTurnTaking: Skill = {
  id: "g7-eng-ls-polite-interruptions-turn-taking",
  code: "LS.6",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Conversation Skills: Polite Interruptions and Turn-Taking",
  description: "Identify verbal and non-verbal forms of polite interruption, apply turn-taking skills in different speaking contexts, and acknowledge the importance of politeness in communication.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "mc-scenario", "fill", "order", "concept"] as const);
    const hint = "A polite speaker signals a wish to speak with a cue, waits for a pause, and makes room for others rather than talking over them.";

    if (branch === "categorize") {
      const verbal = shuffle(rng, VERBAL_CUES).slice(0, 3);
      const nonVerbal = shuffle(rng, NON_VERBAL_CUES).slice(0, 3);
      const items = shuffle(rng, [
        ...verbal.map((label) => ({ id: label, label, bucket: "verbal" })),
        ...nonVerbal.map((label) => ({ id: label, label, bucket: "non-verbal" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each cue into Verbal or Non-verbal.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "verbal", label: "Verbal cue" },
          { id: "non-verbal", label: "Non-verbal cue" },
        ],
        correctBucket,
        hint,
        explanation: `Verbal cues: ${verbal.join(" / ")}. Non-verbal cues: ${nonVerbal.join(" / ")}.`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, CUE_FUNCTIONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.phrase, label: c.phrase })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.phrase, label: c.function })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.phrase] = c.phrase;
      return {
        kind: "click-match",
        prompt: "Match each cue to what it signals during a conversation.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((c) => `"${c.phrase}" — ${c.function.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "mc-scenario") {
      const entry = randChoice(rng, SCENARIOS);
      const choices = shuffle(rng, [...TERMS]);
      return {
        kind: "multiple-choice",
        prompt: `${entry.desc} Which term best describes this behaviour?`,
        choices,
        correctIndex: choices.indexOf(entry.term),
        layout: "list",
        hint: "Check whether the speaker used a cue, waited for a pause, and let others speak too.",
        explanation: `This is an example of "${entry.term}" because ${TERM_EXPLANATION[entry.term]}`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete this polite interruption.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `A polite interruption reads: "${[entry.before, entry.correctAnswer, entry.after].filter(Boolean).join(" ")}"`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of taking a fair turn in a group discussion in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Fair turn-taking starts with listening, moves through signalling and waiting, and ends by making room for others.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
