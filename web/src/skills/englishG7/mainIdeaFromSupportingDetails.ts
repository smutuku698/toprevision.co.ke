import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface TravelPoem {
  id: string;
  title: string;
  lines: string[];
  mainIdea: string;
  narrowDistractor: string; // a real detail from the poem, mistaken for the whole main idea
  details: string[];
  wordInContext: { word: string; lineIndex: number; correct: string; distractors: string[] };
  directQ: { q: string; correct: string; distractors: string[] };
  inferentialQ: { q: string; correct: string; distractors: string[] };
  connectionQ: { q: string; correct: string; distractors: string[] };
}

const POEMS: TravelPoem[] = [
  {
    id: "cross-with-care",
    title: "Cross with Care",
    lines: ["Stop at the curb before you cross,", "Look left, look right, don't take a loss,", "The zebra lines will guide your feet,", "Safe crossing makes a happy street."],
    mainIdea: "Following safe crossing steps, like stopping and looking both ways, keeps pedestrians safe on the road.",
    narrowDistractor: "You should always look left and right before crossing a road",
    details: ["Stop at the curb before crossing", "Look left and right before crossing", "Use the zebra crossing lines to guide you"],
    wordInContext: {
      word: "curb",
      lineIndex: 0,
      correct: "the raised edge of a pavement next to a road",
      distractors: ["the middle of a busy road", "a type of traffic light", "a pedestrian's shoe"],
    },
    directQ: { q: "According to the poem, where should you stop before crossing?", correct: "At the curb", distractors: ["In the middle of the road", "At home", "Inside a matatu"] },
    inferentialQ: {
      q: "What can you infer the poem means by the line 'don't take a loss'?",
      correct: "Failing to look both ways before crossing could lead to a serious accident or injury",
      distractors: ["Losing a game with friends after school", "Losing money while walking on the street", "Missing the school bus by a few minutes"],
    },
    connectionQ: {
      q: "Which real-life situation best matches the safety message of this poem?",
      correct: "A pupil pausing at a zebra crossing near school to check for oncoming cars before crossing",
      distractors: [
        "A pupil running across a busy road without looking, to catch a matatu",
        "A driver overtaking another vehicle on a blind corner",
        "A cyclist riding without a helmet on a quiet estate road",
      ],
    },
  },
  {
    id: "reckless-matatu",
    title: "The Reckless Matatu",
    lines: ["The matatu sped past the sign,", "Ignoring every warning line,", "Around the bend it swerved too fast,", "A lesson learnt when trouble passed."],
    mainIdea: "Speeding and ignoring road signs can lead a driver into dangerous, avoidable trouble.",
    narrowDistractor: "The matatu swerved too fast around a bend",
    details: ["The matatu sped past a warning sign", "It swerved too fast around a bend", "Trouble followed because of reckless driving"],
    wordInContext: {
      word: "swerved",
      lineIndex: 2,
      correct: "turned suddenly and sharply to one side",
      distractors: ["stopped completely without warning", "reversed slowly backward", "parked neatly by the roadside"],
    },
    directQ: { q: "What did the matatu ignore, according to the poem?", correct: "Every warning line", distractors: ["A traffic officer's whistle", "A red traffic light", "A speed bump"] },
    inferentialQ: {
      q: "What does the line 'a lesson learnt when trouble passed' suggest happened to the matatu?",
      correct: "The reckless driving likely caused a near-accident or crash that taught the driver a hard lesson",
      distractors: ["The matatu arrived early and the driver was praised", "Nothing at all happened to the matatu that day", "The driver won an award for safe driving"],
    },
    connectionQ: {
      q: "Which real-life habit reflects the same danger warned about in this poem?",
      correct: "A driver overtaking other vehicles on a blind corner to save time",
      distractors: [
        "A driver slowing down carefully near a school zone",
        "A driver checking mirrors before changing lanes",
        "A driver obeying the posted speed limit on a highway",
      ],
    },
  },
  {
    id: "seatbelt-song",
    title: "Seatbelt Song",
    lines: ["Click the belt before you ride,", "Safety travels by your side,", "Sudden stops will do no harm,", "A buckled belt's a traveller's charm."],
    mainIdea: "Wearing a seatbelt every time you travel protects you if the vehicle stops suddenly.",
    narrowDistractor: "You should click your seatbelt before the ride begins",
    details: ["Click the seatbelt before the ride begins", "A buckled belt protects travellers during sudden stops", "Safety accompanies every buckled traveller"],
    wordInContext: {
      word: "buckled",
      lineIndex: 3,
      correct: "fastened securely, as with a belt clasp",
      distractors: ["broken and unusable", "left completely loose", "painted a bright colour"],
    },
    directQ: { q: "According to the poem, when should you click the seatbelt?", correct: "Before you ride", distractors: ["Only after an accident happens", "Only on long journeys", "Only when a police officer is watching"] },
    inferentialQ: {
      q: "What does the poem suggest will happen to a properly belted traveller if a sudden stop occurs?",
      correct: "The seatbelt will help protect the traveller from being harmed",
      distractors: ["The seatbelt will cause more injuries than not wearing one", "The vehicle will be unable to stop at all", "The traveller will automatically fall asleep"],
    },
    connectionQ: {
      q: "Which real-life habit best matches the safety message of this poem?",
      correct: "A family fastening their seatbelts every time before the car begins moving, even for a short trip",
      distractors: [
        "A passenger only wearing a seatbelt on the highway, never in town",
        "A driver removing the seatbelt once the car starts moving",
        "A passenger wearing a seatbelt only when passing a police checkpoint",
      ],
    },
  },
  {
    id: "night-journey",
    title: "Night Journey",
    lines: ["Reflectors gleam along the road,", "Guiding travellers on their load,", "Headlights bright and speed kept low,", "Safe is the traveller who moves slow."],
    mainIdea: "Using reflectors, bright headlights, and reduced speed helps keep travellers safe on night journeys.",
    narrowDistractor: "Headlights should be kept bright during a night journey",
    details: ["Reflectors guide travellers along the road at night", "Headlights should be kept bright", "Speed should be kept low at night"],
    wordInContext: {
      word: "gleam",
      lineIndex: 0,
      correct: "shine with a soft, brief light",
      distractors: ["disappear completely from view", "make a loud, sudden noise", "become extremely hot to touch"],
    },
    directQ: { q: "According to the poem, what should be kept low during a night journey?", correct: "Speed", distractors: ["The headlights", "The reflectors", "The road"] },
    inferentialQ: {
      q: "What can you infer is the danger the poem is warning night travellers about?",
      correct: "Poor visibility at night makes accidents more likely if travellers move too fast or without lights",
      distractors: ["Getting lost because there are no roads at night", "Running out of fuel unexpectedly during the trip", "Meeting too many other safe travellers on the road"],
    },
    connectionQ: {
      q: "Which real-life habit best matches the safety message of this poem?",
      correct: "A cyclist attaching reflective strips to their bicycle before riding home after dark",
      distractors: [
        "A driver switching off headlights at night to save fuel",
        "A motorist increasing speed once it gets dark to reach home faster",
        "A pedestrian wearing all-black clothing while walking on an unlit road at night",
      ],
    },
  },
  {
    id: "impatient-rider",
    title: "The Impatient Rider",
    lines: ["The boda rider skipped his helmet's weight,", "Racing fast, he could not wait,", "A helmet slows down no true friend,", "But saves a life clear to the end."],
    mainIdea: "Wearing a helmet, even though it may feel like an inconvenience, protects a rider's life.",
    narrowDistractor: "The boda rider was racing fast because he was impatient",
    details: ["The rider skipped wearing his helmet", "He was racing and impatient", "A helmet does not slow down a true friend, but it saves lives"],
    wordInContext: {
      word: "skipped",
      lineIndex: 0,
      correct: "left out or avoided doing something",
      distractors: ["carefully cleaned something", "proudly displayed something", "slowly repaired something"],
    },
    directQ: { q: "What did the boda boda rider skip, according to the poem?", correct: "His helmet", distractors: ["His fuel", "His licence", "His mirrors"] },
    inferentialQ: {
      q: "What is the poem suggesting by saying a helmet 'saves a life clear to the end'?",
      correct: "Wearing a helmet can prevent a fatal head injury if a crash happens",
      distractors: ["A helmet guarantees a rider will never crash at all", "A helmet is only useful on very long journeys", "A helmet makes a motorbike travel faster"],
    },
    connectionQ: {
      q: "Which real-life habit best matches the safety message of this poem?",
      correct: "A boda boda rider putting on his helmet every time before starting the engine, even for a short trip",
      distractors: [
        "A rider carrying a helmet on the bike but never actually wearing it",
        "A rider wearing a helmet only when passing a police checkpoint",
        "A rider lending his only helmet to a passenger and riding without one himself",
      ],
    },
  },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is intensive reading of short poems, like these travel safety poems, valuable for lifelong learning?",
    correct: "It builds the habit of reading closely for meaning, a skill that helps a person understand important messages throughout life",
    distractors: [
      "It is only useful for passing a single examination in Grade 7",
      "It teaches a reader to skip over any text that seems difficult",
      "It replaces the need to ever read carefully again after school",
    ],
  },
  {
    q: "Why might a poet choose to deliver a road safety message through a poem instead of a plain list of rules?",
    correct: "Rhythm, rhyme, and imagery can make the message more memorable and engaging for the reader",
    distractors: [
      "Poems are always shorter than a list of rules, so they take less time to read",
      "A poem removes the need for the message to be accurate",
      "Readers only pay attention to information written as a list",
    ],
  },
  {
    q: "What is the value of answering both direct and inferential questions about a poem, rather than only direct ones?",
    correct: "Inferential questions push a reader to think beyond the literal words and understand deeper meaning, not just stated facts",
    distractors: [
      "Inferential questions are always easier to answer than direct questions",
      "Direct questions are the only kind that ever have a correct answer",
      "Answering both kinds of question has no real benefit for comprehension",
    ],
  },
  {
    q: "Why is it useful to connect events in a poem, such as a matatu speeding around a bend, to real-life road situations?",
    correct: "It helps a reader see how the poem's warning applies to real choices they make while travelling",
    distractors: [
      "Poems about travel are never related to anything that happens in real life",
      "Making connections to real life makes a poem's message less important",
      "It is required only for poems, never for any other kind of writing",
    ],
  },
];

const TERM_FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "What a poem or passage is mostly about, as a whole, is called its ", after: ".", correctAnswer: "main idea" },
  { before: "A specific fact that backs up a poem's overall message is called a ", after: ".", correctAnswer: "supporting detail" },
  { before: "Working out a meaning that a poem does not state directly is called making an ", after: ".", correctAnswer: "inference" },
  { before: "A question whose answer is stated directly in the poem's own words is called a ", after: " question.", correctAnswer: "direct" },
];

export const mainIdeaFromSupportingDetails: Skill = {
  id: "g7-eng-r-main-idea-from-supporting-details",
  code: "R.8",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Poetry Comprehension",
  description: "Distinguish main ideas from supporting details in travel-themed poems, infer word meanings from context, connect poem events to real life, and answer direct and inferential questions.",
  generate(rng) {
    const branch = randChoice(rng, ["mainidea", "detail", "meaning", "direct-inferential", "connection", "summarize", "match", "fill-term", "concept"] as const);
    const hint = "Read the whole poem first, then ask what it is mostly about (the main idea) before picking out the specific facts (the details) that support it.";

    if (branch === "fill-term") {
      const entry = randChoice(rng, TERM_FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing reading-comprehension term.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (branch === "mainidea") {
      const poem = randChoice(rng, POEMS);
      const others = shuffle(rng, POEMS.filter((p) => p.id !== poem.id)).slice(0, 2);
      const choices = shuffle(rng, [poem.mainIdea, poem.narrowDistractor, ...others.map((p) => p.mainIdea)]).slice(0, 4);
      // ensure the correct answer is always present even after slicing
      if (!choices.includes(poem.mainIdea)) choices[0] = poem.mainIdea;
      return {
        kind: "multiple-choice",
        passage: `"${poem.title}"\n${poem.lines.join("\n")}`,
        prompt: "Which statement best expresses the OVERALL main idea of this poem?",
        choices,
        correctIndex: choices.indexOf(poem.mainIdea),
        layout: "list",
        hint,
        explanation: `The main idea of "${poem.title}" is: ${poem.mainIdea} The other options are either just one supporting detail or belong to a different poem.`,
      };
    }

    if (branch === "detail") {
      const poem = randChoice(rng, POEMS);
      const correctDetail = randChoice(rng, poem.details);
      const others = shuffle(rng, POEMS.filter((p) => p.id !== poem.id)).slice(0, 2);
      const foreignDetails = others.map((p) => randChoice(rng, p.details));
      const choices = shuffle(rng, [correctDetail, poem.mainIdea, ...foreignDetails]).slice(0, 4);
      if (!choices.includes(correctDetail)) choices[0] = correctDetail;
      return {
        kind: "multiple-choice",
        passage: `"${poem.title}"\n${poem.lines.join("\n")}`,
        prompt: `Which of these is a specific supporting detail stated in THIS poem (not just its overall main idea)?`,
        choices,
        correctIndex: choices.indexOf(correctDetail),
        layout: "list",
        hint: "A supporting detail is a specific fact stated in this poem, not the whole message and not a fact from a different poem.",
        explanation: `"${correctDetail}" is a specific detail stated in "${poem.title}". The other choices are either the poem's overall main idea or facts from a different poem.`,
      };
    }

    if (branch === "meaning") {
      const poem = randChoice(rng, POEMS);
      const w = poem.wordInContext;
      const choices = shuffle(rng, [w.correct, ...w.distractors]);
      return {
        kind: "multiple-choice",
        passage: `"${poem.title}"\n${poem.lines.join("\n")}`,
        prompt: `As used in this poem, what does the word "${w.word}" most likely mean?`,
        choices,
        correctIndex: choices.indexOf(w.correct),
        layout: "list",
        hint: "Look at the words and images around the unfamiliar word for clues about its meaning.",
        explanation: `In this poem, "${w.word}" means: ${w.correct}.`,
      };
    }

    if (branch === "direct-inferential") {
      const poem = randChoice(rng, POEMS);
      const useDirect = rng() < 0.5;
      const entry = useDirect ? poem.directQ : poem.inferentialQ;
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        passage: `"${poem.title}"\n${poem.lines.join("\n")}`,
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: useDirect ? "This answer is stated directly in the poem's words." : "This answer is not stated directly — you must infer it from clues in the poem.",
        explanation: `The correct answer is "${entry.correct}".`,
      };
    }

    if (branch === "connection") {
      const poem = randChoice(rng, POEMS);
      const entry = poem.connectionQ;
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        passage: `"${poem.title}"\n${poem.lines.join("\n")}`,
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about which real-life choice actually follows the poem's safety message.",
        explanation: `"${entry.correct}" reflects the same safety message as the poem "${poem.title}".`,
      };
    }

    if (branch === "summarize") {
      const poem = randChoice(rng, POEMS);
      const items = shuffle(rng, poem.lines.map((label, i) => ({ id: `l${i}`, label })));
      return {
        kind: "ordering",
        prompt: `Arrange the lines of the poem "${poem.title}" in the correct order to summarise how it unfolds.`,
        instruction: "Click them in order.",
        items,
        correctOrder: poem.lines.map((_, i) => `l${i}`),
        hint: "Think about which event or idea logically comes first, and which follows to complete the poem's message.",
        explanation: poem.lines.join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, POEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.title })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.mainIdea })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: "Match each travel safety poem to its main idea.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((p) => `"${p.title}" → ${p.mainIdea}`).join(" "),
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
