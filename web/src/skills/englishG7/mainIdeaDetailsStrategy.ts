import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface LeadershipPassage {
  id: string;
  title: string;
  passage: string;
  mainIdea: string;
  details: string[];
  distractorIdeas: string[]; // plausible-but-wrong main ideas (too narrow, too broad, or off-topic)
}

const PASSAGES: LeadershipPassage[] = [
  {
    id: "amina",
    title: "Amina, Head Girl",
    passage:
      "Being a school leader is not only for boys. At Uhuru Primary School, Amina was elected head girl after she showed she could organise the morning assembly smoothly, settle disagreements between classmates fairly, and represent students clearly whenever teachers held staff meetings. Her classmates said they trusted her because she listened to everyone before making any decision.",
    mainIdea: "Both girls and boys can be effective school leaders when they show fairness and good judgement.",
    details: [
      "She organised the morning assembly smoothly",
      "She settled disagreements between classmates fairly",
      "She represented students clearly at staff meetings",
    ],
    distractorIdeas: [
      "Amina is the only student who has ever attended Uhuru Primary School",
      "Boys are never allowed to be elected head boy at any school",
      "The morning assembly is the single most important event of a school day",
    ],
  },
  {
    id: "chief",
    title: "Chief Barasa Settles a Dispute",
    passage:
      "When two neighbouring farmers argued over where their land boundary lay, they brought the matter to Chief Barasa. He visited both farms, listened carefully to each farmer's side of the story, and consulted the old land records at the sub-county office before making his ruling. Both farmers accepted his decision because he had been patient and fair throughout.",
    mainIdea: "A good community leader resolves conflict by listening carefully and gathering facts before deciding.",
    details: [
      "He visited both farms in person",
      "He listened carefully to each farmer's side of the story",
      "He consulted the old land records before ruling",
    ],
    distractorIdeas: [
      "Chief Barasa owns more land than any farmer in the sub-county",
      "Land disputes never happen between neighbouring farmers",
      "The sub-county office is closed on weekdays",
    ],
  },
  {
    id: "governor",
    title: "The County Water Project",
    passage:
      "Before approving a new borehole project, the county governor called a public meeting in three different wards so residents could raise their concerns. She then asked engineers to explain the plan in simple language, and only after residents voted in favour did construction begin. Many said this made them feel the project truly belonged to them.",
    mainIdea: "Involving citizens in decision-making builds trust and support for a leader's projects.",
    details: [
      "She called public meetings in three different wards",
      "She asked engineers to explain the plan in simple language",
      "Construction began only after residents voted in favour",
    ],
    distractorIdeas: [
      "Boreholes are the only type of project a county government can build",
      "The governor built the borehole using her own personal money",
      "Public meetings are held only once every ten years",
    ],
  },
  {
    id: "captain",
    title: "The Class Captain's Clean-Up",
    passage:
      "As class captain, Brian noticed that litter was piling up near the classroom door every afternoon. Instead of complaining, he drew up a simple cleaning roster, asked for two volunteers each day, and reminded classmates gently rather than shouting at them. Within two weeks, the classroom stayed noticeably tidier without any teacher having to step in.",
    mainIdea: "Effective student leadership often solves everyday problems through simple, practical plans rather than complaints.",
    details: [
      "He drew up a simple cleaning roster",
      "He asked for two volunteers each day",
      "He reminded classmates gently rather than shouting",
    ],
    distractorIdeas: [
      "Brian is the only pupil in his class who ever litters",
      "Teachers are required to clean every classroom themselves",
      "Class captains are chosen only because of their exam results",
    ],
  },
  {
    id: "wangui",
    title: "Wangui Speaks for Her Estate",
    passage:
      "When a matatu sacco wanted to remove a bus stop near her estate, Wangui, the elected estate representative, gathered signatures from concerned residents, wrote a clear letter explaining the daily hardship it would cause, and presented it calmly at the sacco's office. The sacco reversed its decision after hearing the residents' concerns explained so clearly.",
    mainIdea: "A leader who represents others well gathers evidence and communicates concerns clearly and calmly.",
    details: [
      "She gathered signatures from concerned residents",
      "She wrote a clear letter explaining the daily hardship",
      "She presented the letter calmly at the sacco's office",
    ],
    distractorIdeas: [
      "The matatu sacco removed every bus stop in the county that same week",
      "Wangui owns the matatu sacco that runs the route",
      "Estate representatives are appointed by matatu drivers, not elected",
    ],
  },
  {
    id: "prefect",
    title: "The Prefect Who Listened First",
    passage:
      "When younger pupils complained that the water taps ran dry every lunchtime, Head Boy Kiptoo did not simply promise to fix it. He first timed how long the taps actually ran, asked the caretaker why, and discovered the real problem was a leaking pipe near the kitchen. He reported the exact cause to the head teacher, and the pipe was repaired within days.",
    mainIdea: "Effective leaders investigate the real cause of a problem before promising a solution.",
    details: [
      "He timed how long the taps actually ran",
      "He asked the caretaker why the taps ran dry",
      "He discovered the real cause was a leaking pipe",
    ],
    distractorIdeas: [
      "Kiptoo personally repaired the leaking pipe himself",
      "The school has never had running water at any time",
      "Head boys are responsible for fixing all school plumbing",
    ],
  },
];

const OTHER_PLAUSIBLE_DETAILS = [
  "She arrived at every meeting exactly one hour early",
  "He wore a badge that identified him as a leader",
  "She kept a written diary of every decision made",
  "He asked his deputy to take notes during discussions",
  "She thanked everyone publicly after the matter was resolved",
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the best strategy for finding the main idea of a paragraph quickly?",
    correct: "Read the topic sentence and think about what the whole paragraph is mostly about",
    distractors: [
      "Count how many words the paragraph contains",
      "Memorise every sentence in the paragraph word for word",
      "Read only the very last word of the passage",
    ],
  },
  {
    q: "Why might a reader skim the first and last sentences of a paragraph before reading it closely?",
    correct: "The main idea often appears in these sentences, giving a quick sense of what the passage is about",
    distractors: [
      "The middle sentences of a paragraph never contain any useful information",
      "Skimming guarantees a reader will remember every supporting detail",
      "Teachers require it, but it has no real effect on understanding",
    ],
  },
  {
    q: "What is the key difference between a text's main idea and its supporting details?",
    correct: "The main idea is the central point the whole text is about, while supporting details are specific facts or examples that back it up",
    distractors: [
      "The main idea only ever appears in a text's title, never in its sentences",
      "Supporting details are always found before the main idea in every text",
      "There is no real difference between a main idea and a supporting detail",
    ],
  },
  {
    q: "Why is being able to identify main ideas and supporting details an important comprehension skill for a learner?",
    correct: "It helps a reader quickly grasp what a text is really about and recall the key facts that support it, instead of getting lost in every word",
    distractors: [
      "It is only useful for learners who plan to become teachers",
      "It matters only when reading poems, never other kinds of text",
      "It replaces the need to ever read a full passage carefully",
    ],
  },
  {
    q: "A learner reads a passage about a leader and can only remember scattered, unconnected facts afterwards. What reading strategy would most help this learner?",
    correct: "Pausing after each paragraph to identify its main idea and note which details support it",
    distractors: [
      "Reading the passage even faster than before",
      "Skipping the passage entirely and guessing the answers",
      "Reading only the very first sentence of the whole passage",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "The sentence that states what a paragraph is mostly about is called the ", after: " idea.", correctAnswer: "main" },
  { before: "Specific facts, reasons, or examples that back up the main idea are called supporting ", after: ".", correctAnswer: "details" },
  { before: "Reading quickly to get a general sense of a passage's main idea, before reading it closely, is called ", after: " the text.", correctAnswer: "skimming", acceptedAnswers: ["skimming through", "skim"] },
  { before: "The sentence at the start of a paragraph that often states its main idea is called the ", after: " sentence.", correctAnswer: "topic" },
];

export const mainIdeaDetailsStrategy: Skill = {
  id: "g7-eng-r-main-idea-details-strategy",
  code: "R.4",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Main Idea and Details Strategies",
  description: "Discuss and apply reading-for-main-idea and reading-for-details strategies to select main ideas and supporting details from leadership-themed texts.",
  generate(rng) {
    const branch = randChoice(rng, ["main-idea-mc", "detail-mc", "categorize", "match", "concept", "fill"] as const);
    const hint = "The main idea is the central point a passage is mostly about. Supporting details are the specific facts that back it up.";

    if (branch === "main-idea-mc") {
      const p = randChoice(rng, PASSAGES);
      const choices = shuffle(rng, [p.mainIdea, ...p.distractorIdeas]);
      return {
        kind: "multiple-choice",
        passage: p.passage,
        prompt: "Which statement best expresses the main idea of this passage?",
        choices,
        correctIndex: choices.indexOf(p.mainIdea),
        layout: "list",
        hint,
        explanation: `The main idea of "${p.title}" is: ${p.mainIdea}`,
      };
    }

    if (branch === "detail-mc") {
      const p = randChoice(rng, PASSAGES);
      const correctDetail = randChoice(rng, p.details);
      const others = shuffle(rng, PASSAGES.filter((o) => o.id !== p.id)).slice(0, 2);
      const foreignDetails = others.map((o) => randChoice(rng, o.details));
      const choices = shuffle(rng, [correctDetail, ...foreignDetails, randChoice(rng, OTHER_PLAUSIBLE_DETAILS)]);
      return {
        kind: "multiple-choice",
        passage: p.passage,
        prompt: `Which detail from the passage supports the main idea that "${p.mainIdea}"?`,
        choices,
        correctIndex: choices.indexOf(correctDetail),
        layout: "list",
        hint: "A supporting detail is a specific fact stated in THIS passage, not just any leadership-related sentence.",
        explanation: `"${correctDetail}" is a specific fact stated in this passage that supports its main idea. The other choices are not found in this particular passage.`,
      };
    }

    if (branch === "categorize") {
      const p = randChoice(rng, PASSAGES);
      const chosenDetails = shuffle(rng, p.details).slice(0, 3);
      const items = shuffle(rng, [
        { id: "idea", label: p.mainIdea, bucket: "main" as const },
        ...chosenDetails.map((d, i) => ({ id: `d${i}`, label: d, bucket: "detail" as const })),
      ]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.bucket));
      return {
        kind: "categorize",
        passage: p.passage,
        prompt: "Sort each statement into Main idea or Supporting detail, based on the passage above.",
        items: items.map((it) => ({ id: it.id, label: it.label })),
        buckets: [
          { id: "main", label: "Main idea" },
          { id: "detail", label: "Supporting detail" },
        ],
        correctBucket,
        hint,
        explanation: `"${p.mainIdea}" is the main idea. The rest are specific supporting details that back it up.`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, PASSAGES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.title })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.mainIdea })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: "Match each leadership passage to its main idea.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((p) => `"${p.title}" → ${p.mainIdea}`).join(" "),
      };
    }

    if (branch === "concept") {
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
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the sentence about reading strategies.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      acceptedAnswers: entry.acceptedAnswers,
      inputMode: "text",
      hint,
      explanation: `The sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
