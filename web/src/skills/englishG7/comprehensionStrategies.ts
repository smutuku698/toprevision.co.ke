import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGES: {
  id: string;
  text: string;
  keySummary: string;
  wrongSummaries: string[];
  vividSentence: string;
  plainSentence: string;
  inferWord: string;
  inferBefore: string;
  inferAfter: string;
  inferCorrect: string;
  inferDistractors: string[];
  factual: { q: string; correct: string; distractors: string[] }[];
  inferential: { q: string; correct: string; distractors: string[] }[];
}[] = [
  {
    id: "matatu",
    text: "Every morning, commuters squeeze onto crowded matatus along Nairobi's Thika Road, weaving through traffic beneath the elevated highway. The National Transport and Safety Authority requires every matatu to display a speed governor sticker and limit passengers to the number of seatbelts fitted. Despite these rules, some drivers still overload their vehicles, risking hefty fines from traffic police.",
    keySummary: "NTSA rules require matatus to display speed governor stickers and limit passengers, but some drivers still overload their vehicles and risk fines.",
    wrongSummaries: [
      "Matatus in Nairobi never break any traffic rules at all.",
      "The NTSA has banned matatus from using Thika Road completely.",
      "All matatu drivers in Nairobi have stopped overloading their vehicles.",
    ],
    vividSentence: "Commuters squeeze onto crowded matatus along Nairobi's Thika Road, weaving through traffic beneath the elevated highway.",
    plainSentence: "The National Transport and Safety Authority requires every matatu to display a speed governor sticker.",
    inferWord: "hefty",
    inferBefore: "Despite these rules, some drivers still overload their vehicles, risking",
    inferAfter: "fines from traffic police.",
    inferCorrect: "large and significant",
    inferDistractors: ["very small and insignificant", "delayed and postponed", "optional and avoidable"],
    factual: [
      { q: "What must every matatu display, according to the passage?", correct: "A speed governor sticker", distractors: ["A first-aid kit sticker", "A route map", "A driver's photo"] },
      { q: "Along which road do the crowded matatus in the passage travel?", correct: "Thika Road", distractors: ["Mombasa Road", "Waiyaki Way", "Ngong Road"] },
    ],
    inferential: [
      { q: "What can you infer about drivers who overload their matatus despite the rules?", correct: "They are willing to risk fines to carry extra paying passengers", distractors: ["They are following NTSA rules exactly as written", "They have never heard of the NTSA", "They only overload their vehicles on public holidays"] },
      { q: "What does the phrase 'weaving through traffic' suggest about how matatus move on Thika Road?", correct: "They frequently change lanes to overtake other vehicles in heavy traffic", distractors: ["They always stay in a single lane without changing", "They travel far below the legal speed limit", "They stop completely every few minutes"] },
    ],
  },
  {
    id: "roads",
    text: "Kenya's road network includes several categories: tarmac highways connecting major towns, gravel or murram roads common in rural areas, and dirt tracks that become impassable during heavy rains. The Kenya National Highways Authority (KeNHA) maintains the busiest tarmac roads, while county governments are responsible for many rural murram roads. Poorly maintained roads contribute significantly to road accidents each year.",
    keySummary: "Kenya's roads range from tarmac highways to murram and dirt roads, maintained by KeNHA and county governments, and poor maintenance contributes to accidents.",
    wrongSummaries: [
      "All roads in Kenya are tarmac highways maintained by county governments.",
      "KeNHA is only responsible for dirt tracks in rural areas.",
      "Road maintenance has no connection at all to road accidents.",
    ],
    vividSentence: "Dirt tracks become impassable during heavy rains, cutting rural areas off from the rest of the country.",
    plainSentence: "The Kenya National Highways Authority (KeNHA) maintains the busiest tarmac roads.",
    inferWord: "impassable",
    inferBefore: "gravel or murram roads common in rural areas, and dirt tracks that become",
    inferAfter: "during heavy rains.",
    inferCorrect: "impossible to travel along or through",
    inferDistractors: ["very smooth and easy to drive on", "recently repaired and upgraded", "extremely narrow but still usable"],
    factual: [
      { q: "Which organisation maintains the busiest tarmac highways, according to the passage?", correct: "KeNHA", distractors: ["NTSA", "County governments", "The Ministry of Education"] },
      { q: "According to the passage, which type of road becomes impassable during heavy rains?", correct: "Dirt tracks", distractors: ["Tarmac highways only", "Motorways only", "Airport runways"] },
    ],
    inferential: [
      { q: "Why might rural areas experience more travel delays during the rainy season than towns connected by tarmac highways?", correct: "Their murram and dirt roads become impassable when it rains heavily", distractors: ["Rural areas have more traffic police checkpoints", "Rural roads are always busier than town roads", "Rural areas receive no rain at all"] },
      { q: "What can you infer about a rural town that depends only on murram roads?", correct: "It may struggle to transport goods and people during the rainy season", distractors: ["It will always have smoother roads than towns with tarmac", "It receives more government road funding than any town", "It has no connection to the wider road network"] },
    ],
  },
  {
    id: "bodaboda",
    text: "Boda boda motorcycle taxis have become a common sight on Kenyan roads, weaving nimbly between stalled cars during rush hour. Traffic police frequently caution riders who ignore helmet regulations, since head injuries account for a large share of road accident fatalities. Road safety campaigns now target boda boda riders specifically, urging them to wear reflective jackets and obey speed limits.",
    keySummary: "Boda boda riders are cautioned for ignoring helmet rules, since head injuries cause many road deaths, so safety campaigns now urge riders to wear reflective jackets and obey speed limits.",
    wrongSummaries: [
      "Boda bodas have been completely banned from all Kenyan roads.",
      "Traffic police never caution boda boda riders for any reason.",
      "Road safety campaigns focus only on matatu drivers, not boda bodas.",
    ],
    vividSentence: "Boda boda motorcycle taxis weave nimbly between stalled cars during rush hour.",
    plainSentence: "Road safety campaigns now target boda boda riders specifically.",
    inferWord: "nimbly",
    inferBefore: "Boda boda motorcycle taxis have become a common sight on Kenyan roads, weaving",
    inferAfter: "between stalled cars during rush hour.",
    inferCorrect: "quickly and skilfully",
    inferDistractors: ["clumsily and slowly", "loudly and dangerously", "rarely and occasionally"],
    factual: [
      { q: "What do road safety campaigns specifically urge boda boda riders to do?", correct: "Wear reflective jackets and obey speed limits", distractors: ["Stop riding motorcycles entirely", "Only ride during daylight hours", "Carry a passenger at all times"] },
      { q: "According to the passage, when do boda bodas often weave between stalled cars?", correct: "During rush hour", distractors: ["Only late at night", "Only on weekends", "Only during school holidays"] },
    ],
    inferential: [
      { q: "What can you infer is a major reason road safety campaigns focus on head injuries?", correct: "Head injuries cause a large share of fatal road accidents, so preventing them saves lives", distractors: ["Head injuries are the least serious type of road injury", "Helmets are too expensive for most riders to buy", "Traffic police rarely stop boda boda riders"] },
      { q: "What does the passage imply about riders who ignore helmet regulations?", correct: "They put themselves at greater risk of serious head injury in an accident", distractors: ["They are guaranteed to avoid all traffic police", "They ride more slowly than riders who wear helmets", "They are following the law correctly"] },
    ],
  },
  {
    id: "agencies",
    text: "Two government agencies play key roles in keeping Kenya's roads safe. The National Transport and Safety Authority (NTSA) licenses drivers and enforces traffic rules, while the Kenya National Highways Authority (KeNHA) constructs and maintains major highways. Working together, the two agencies aim to reduce road accidents and improve the condition of the country's road network.",
    keySummary: "NTSA licenses drivers and enforces traffic rules, while KeNHA builds and maintains highways, and together they work to reduce road accidents.",
    wrongSummaries: [
      "NTSA and KeNHA are actually the same organisation with one role.",
      "KeNHA is responsible for licensing all drivers in Kenya.",
      "Neither NTSA nor KeNHA has any connection to road accidents.",
    ],
    vividSentence: "Working together, NTSA and KeNHA aim to reduce road accidents and improve the country's roads.",
    plainSentence: "NTSA licenses drivers and enforces traffic rules.",
    inferWord: "enforces",
    inferBefore: "The National Transport and Safety Authority (NTSA) licenses drivers and",
    inferAfter: "traffic rules.",
    inferCorrect: "makes sure a rule is obeyed",
    inferDistractors: ["cancels a rule completely", "ignores a rule on purpose", "merely suggests a rule"],
    factual: [
      { q: "According to the passage, which agency is responsible for licensing drivers?", correct: "NTSA", distractors: ["KeNHA", "County government", "Ministry of Transport"] },
      { q: "According to the passage, what does KeNHA construct and maintain?", correct: "Major highways", distractors: ["Driving licences", "Traffic police stations", "School buses"] },
    ],
    inferential: [
      { q: "Why might the passage suggest that NTSA and KeNHA need to work together?", correct: "Enforcing traffic rules alone cannot fix badly maintained roads, and building roads alone cannot stop reckless driving", distractors: ["Because one of the two agencies is no longer needed", "Because they compete against each other for funding", "Because only one agency is legally allowed to exist"] },
      { q: "What does the passage imply would happen if only one of the two agencies existed?", correct: "Kenya's roads would likely be less safe overall, since enforcement and construction both matter", distractors: ["Kenya's roads would automatically become safer", "There would be no change to road safety at all", "Traffic rules would no longer be necessary"] },
    ],
  },
];

const TERMS: { term: string; def: string }[] = [
  { term: "Murram road", def: "A road surfaced with gravel or compacted earth rather than tarmac" },
  { term: "Speed governor", def: "A device fitted to a vehicle to limit how fast it can travel" },
  { term: "NTSA", def: "The government body that licenses drivers and enforces traffic rules" },
  { term: "KeNHA", def: "The government body that constructs and maintains major highways" },
  { term: "Reflective jacket", def: "High-visibility clothing that helps other road users see a rider in low light" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the importance of using comprehension strategies, such as summarising, when reading a passage?",
    correct: "They help a reader hold onto the key ideas of a passage without needing to remember every single word",
    distractors: [
      "They make a passage impossible to understand",
      "They are only useful for passages about fictional stories",
      "They replace the need to read the passage at all",
    ],
  },
  {
    q: "What makes people write passages such as the ones about land travel in this skill?",
    correct: "To inform readers about real issues, such as road safety, so they can understand and respond to them",
    distractors: [
      "To confuse readers with unrelated information",
      "Passages are only ever written to entertain, never to inform",
      "To avoid giving readers any factual information",
    ],
  },
];

export const comprehensionStrategies: Skill = {
  id: "g7-eng-r-comprehension-strategies",
  code: "R.13",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Comprehension Strategies",
  description: "Identify and summarise key ideas about land travel, create mental images from events, deduce word meaning from context, and answer factual and inferential questions.",
  generate(rng) {
    const branch = randChoice(rng, ["summary", "infer", "factualInferential", "match", "image", "order", "concept"] as const);
    const hint = "Factual answers are stated directly in the passage. Inferential answers require you to reason from what the passage implies.";

    if (branch === "summary") {
      const passage = randChoice(rng, PASSAGES);
      const choices = shuffle(rng, [passage.keySummary, ...passage.wrongSummaries]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence best summarises the key ideas of this passage, in the writer's own paraphrased words?",
        passage: passage.text,
        choices,
        correctIndex: choices.indexOf(passage.keySummary),
        layout: "list",
        hint: "A good summary captures the passage's key ideas accurately without adding or changing facts.",
        explanation: `"${passage.keySummary}" correctly captures the passage's key ideas without adding false information.`,
      };
    }

    if (branch === "infer") {
      const passage = randChoice(rng, PASSAGES);
      const choices = shuffle(rng, [passage.inferCorrect, ...passage.inferDistractors]);
      return {
        kind: "multiple-choice",
        passage: passage.text,
        prompt: `As used in the passage, what does the word "${passage.inferWord}" most likely mean?`,
        choices,
        correctIndex: choices.indexOf(passage.inferCorrect),
        layout: "list",
        hint: "Look at the words and situation around the unfamiliar word for clues about its meaning.",
        explanation: `In this passage, "${passage.inferWord}" means: ${passage.inferCorrect}.`,
      };
    }

    if (branch === "factualInferential") {
      const passage = randChoice(rng, PASSAGES);
      const tagged = [
        ...passage.factual.map((f, i) => ({ id: `f${i}`, label: f.q, bucket: "factual" as const })),
        ...passage.inferential.map((f, i) => ({ id: `i${i}`, label: f.q, bucket: "inferential" as const })),
      ];
      const chosen = shuffle(rng, tagged);
      const items = chosen.map((c) => ({ id: c.id, label: c.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c.id] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each question into Factual (answer stated directly) or Inferential (answer must be reasoned out).",
        passage: passage.text,
        items,
        buckets: [
          { id: "factual", label: "Factual question" },
          { id: "inferential", label: "Inferential question" },
        ],
        correctBucket,
        hint,
        explanation: "Factual questions can be answered by pointing to a sentence in the passage. Inferential questions require reasoning about what the passage implies but does not state directly.",
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.def })));
      const correctMap: Record<string, string> = {};
      for (const t of TERMS) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each land travel term to its correct meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: TERMS.map((t) => `${t.term} — ${t.def.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "image") {
      const passage = randChoice(rng, PASSAGES);
      const choices = shuffle(rng, [passage.vividSentence, passage.plainSentence]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence from the passage helps you form the clearest mental picture of the scene?",
        passage: passage.text,
        choices,
        correctIndex: choices.indexOf(passage.vividSentence),
        layout: "list",
        hint: "A vivid sentence describes action and detail you can picture, rather than stating a plain fact or rule.",
        explanation: `"${passage.vividSentence}" creates a vivid mental image because it describes action and detail you can picture, unlike a plain statement of fact.`,
      };
    }

    if (branch === "order") {
      const steps = [
        { id: "read", label: "Read the whole passage once to get a general sense of it" },
        { id: "keyideas", label: "Identify the key ideas the passage is making" },
        { id: "ownwords", label: "Restate each key idea briefly in your own words" },
        { id: "check", label: "Check your restated ideas against the passage for accuracy" },
        { id: "combine", label: "Combine the restated ideas into a short, paraphrased summary" },
      ];
      const items = shuffle(rng, steps);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for summarising a passage by paraphrasing its key ideas, in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: steps.map((s) => s.id),
        hint: "Start by reading fully, then find the key ideas, then put them in your own words.",
        explanation: steps.map((s) => s.label).join(" → "),
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
