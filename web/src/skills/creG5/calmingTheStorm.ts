import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "the events of Jesus calming the storm in the correct order.",
    "these events from Mark 4:35-39 into the order they happened.",
    "these moments from the miracle of calming the storm in order.",
    "these events the way they happened on the lake.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the storm itself or about Jesus' power.",
    "these facts about calming the storm under the correct bucket.",
    "each fact below by which part of the miracle it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the miracle of calming the storm with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about calming the storm.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Jesus tells the disciples, \"Let us go over to the other side\"" },
  { id: "n2", label: "They get into a boat and leave the crowd behind" },
  { id: "n3", label: "A furious storm arises, and waves break into the boat" },
  { id: "n4", label: "The boat begins to fill with water" },
  { id: "n5", label: "Jesus is in the stern, sleeping on a cushion" },
  { id: "n6", label: "The disciples wake Jesus, saying, \"Teacher, don't you care if we drown?\"" },
  { id: "n7", label: "Jesus gets up and rebukes the wind, saying to the waves, \"Quiet! Be still!\"" },
  { id: "n8", label: "The wind dies down, and it becomes completely calm" },
];

interface EventFact { text: string; group: "storm" | "power" }
const EVENT_FACTS: EventFact[] = [
  { text: "Jesus and the disciples got into a boat to cross to the other side", group: "storm" },
  { text: "A furious storm arose and waves broke into the boat", group: "storm" },
  { text: "The boat began to fill with water", group: "storm" },
  { text: "Jesus was sleeping in the stern on a cushion during the storm", group: "storm" },
  { text: "The disciples were terrified, fearing they would drown", group: "storm" },
  { text: "The disciples woke Jesus, asking, \"Don't you care if we drown?\"", group: "storm" },
  { text: "Jesus rebuked the wind and said to the waves, \"Quiet! Be still!\"", group: "power" },
  { text: "The wind died down and the sea became completely calm", group: "power" },
  { text: "Jesus asked the disciples, \"Why are you so afraid? Do you still have no faith?\"", group: "power" },
  { text: "The disciples were amazed, asking, \"Who is this? Even the wind and waves obey him!\"", group: "power" },
  { text: "The miracle shows that Jesus has power and authority over nature", group: "power" },
  { text: "Christians today are taught to depend on God when facing difficult challenges", group: "power" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Storm", meaning: "The sudden, dangerous weather that threatened to sink the disciples' boat" },
  { term: "Stern", meaning: "The back part of the boat, where Jesus was sleeping during the storm" },
  { term: "\"Quiet! Be still!\"", meaning: "Jesus' command that immediately calmed the wind and waves" },
  { term: "\"Don't you care if we drown?\"", meaning: "The fearful question the disciples asked Jesus during the storm" },
  { term: "\"Why are you so afraid?\"", meaning: "Jesus' question to the disciples after he calmed the storm" },
  { term: "Power over nature", meaning: "What the miracle of calming the storm demonstrates about Jesus" },
  { term: "Faith", meaning: "What Jesus challenged the disciples about lacking during the storm" },
  { term: "\"Who is this?\"", meaning: "The disciples' amazed question after the storm was calmed" },
  { term: "Sea crossing", meaning: "The journey Jesus and the disciples were making when the storm struck" },
  { term: "Dependence on God", meaning: "The value this miracle teaches Christians facing challenges today" },
  { term: "Fear", meaning: "The emotion the disciples felt before Jesus calmed the storm" },
  { term: "Authority", meaning: "The quality Jesus showed by commanding the wind and waves and having them obey" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Anyango", "Bahati", "Cyrus", "Diana", "Elkana", "Faith", "Gitau", "Halima", "Ipapo", "Jemutai", "Kelvin", "Lucy"] as const;
const KENYAN_PLACES = ["Homabay", "Kilgoris", "Athi River", "Turkana", "Vihiga", "Kapsabet", "Wote", "Siaya", "Marigat", "Kikuyu", "Sagana", "Rongo"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is terrified before national exams, feeling like they are "drowning" in stress, similar to the disciples in the storm. What does the miracle of calming the storm suggest ${who} should do?`,
      correct: "Bring the fear to God in prayer and trust his power and care, just as the disciples turned to Jesus in the storm",
      wrong: [
        "Exam stress has nothing to do with the lesson taught by this Bible miracle",
        "Faith is unrelated to handling fear about an upcoming exam",
        "The miracle teaches that Christians should handle every challenge without any help from God",
      ],
      explanation: "The disciples turned to Jesus in their fear, and he responded with calm and power — a model for bringing any frightening situation, including exam stress, to God.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A family in ${place(rng)} faces a sudden financial crisis, and ${who} feels like everything is falling apart. What does Jesus' command "Quiet! Be still!" teach about facing this kind of crisis?`,
      correct: "Jesus has the power to bring peace and calm into frightening situations when people trust and depend on him",
      wrong: [
        "The command only had power over literal wind and water, never over any other kind of hardship",
        "Financial trouble should be faced without any reliance on faith or prayer",
        "Jesus' words only calmed the disciples' emotions, not the actual storm itself",
      ],
      explanation: "Jesus' authority over the wind and waves in Mark 4:39 illustrates his power over any overwhelming circumstance, encouraging believers to depend on God through hardship.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says that because hardships still happen to Christians, God must not really care about them — echoing the disciples' question, "Don't you care if we drown?" How does the miracle respond to this belief?`,
    correct: "Like the disciples' fear, this belief is understandable but mistaken — Jesus did care, and immediately showed his power over the danger",
    wrong: [
      "The disciples' accusation was completely correct, and Jesus proved he did not care",
      "The miracle shows God only cares about people who never face hardship",
      "This belief has nothing to do with what the miracle is meant to teach",
    ],
    explanation: "Jesus' immediate response to the storm — calming it completely — shows the disciples' fear that he didn't care was mistaken, even though it felt real to them in the moment.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A farmer named ${who} in ${place(rng)} panics when an unexpected hailstorm threatens the crops just before harvest. What does the miracle of calming the storm encourage ${who} to remember?`,
      correct: "God has power over natural events, which can encourage trust rather than despair during a frightening, uncontrollable situation",
      wrong: [
        "The miracle teaches that farmers should never prepare for bad weather since God controls everything",
        "Natural events like hailstorms are completely unrelated to what this miracle teaches",
        "The miracle proves that hardship never happens to people who have enough faith",
      ],
      explanation: "The miracle demonstrates God's power over nature, offering a reason to trust God through uncontrollable, frightening circumstances rather than despairing.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} wonders why the Bible specifically mentions that Jesus was calmly sleeping on a cushion during the storm. What does this detail suggest?`,
    correct: "It shows Jesus' calm confidence and trust, even in the middle of a dangerous situation — a model for believers facing fear",
    wrong: [
      "It shows Jesus was careless and did not notice the disciples were in danger",
      "It shows Jesus was completely unaware that a storm was happening at all",
      "It is an unimportant detail with no meaning for the rest of the story",
    ],
    explanation: "Jesus sleeping peacefully through the storm contrasts with the disciples' panic, highlighting the calm trust in God that the story invites believers to imitate.",
  }),
  () => ({
    prompt: `After the storm was calmed, the disciples asked one another, "Who is this? Even the wind and the waves obey him!" What conclusion were they beginning to reach?`,
    correct: "That Jesus had extraordinary, divine power and authority, even over creation itself",
    wrong: [
      "That Jesus had simply been lucky that the storm ended on its own",
      "That any skilled sailor could have calmed the storm the same way",
      "That the wind and waves had stopped by pure coincidence, unrelated to Jesus",
    ],
    explanation: "The disciples' amazed question shows them beginning to recognise that Jesus' authority over wind and waves pointed to something far greater than an ordinary teacher.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} believes that having strong faith means never feeling afraid at all. Based on Jesus' question, "Why are you so afraid? Do you still have no faith?", is this the right understanding?`,
      correct: "Not quite — Jesus' question challenges letting fear take over instead of trusting God's power, not the mere feeling of fear itself",
      wrong: [
        "Yes — any Christian who ever feels afraid automatically has no faith at all",
        "Yes — Jesus' question proves that fear and faith can never exist together",
        "No — Jesus' question shows that faith and fear are completely unrelated topics",
      ],
      explanation: "Jesus challenges the disciples for letting fear overwhelm their trust in him, not for feeling fear in a dangerous moment — faith means turning to God despite fear.",
    };
  },
  (rng) => ({
    prompt: `A CRE teacher in ${place(rng)} asks how God's power over nature is portrayed in this miracle. What is the best answer?`,
    correct: "Jesus directly commands the wind and the waves, and they immediately obey him",
    wrong: [
      "God's power is shown only through the disciples' prayers, not through Jesus' own actions",
      "The storm simply ended naturally, with no display of power from Jesus at all",
      "God's power is shown by the boat sinking completely before being rescued",
    ],
    explanation: "Mark 4:39 records Jesus directly rebuking the wind and commanding the waves, which obey him instantly — a clear display of power over nature.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} thinks the story of calming the storm is just an interesting weather story with no lesson for everyday struggles. Is this the right way to understand the miracle's meaning today?`,
      correct: "No — the miracle is meant to teach believers to depend on God through life's difficulties, not just describe an unusual weather event",
      wrong: [
        "Yes — the miracle only describes an unusual event with no wider meaning",
        "Yes — this story is only relevant to people who travel by boat",
        "No — but the story only applies to weather-related emergencies specifically",
      ],
      explanation: "The lesson's key inquiry connects the calming of the storm to depending on God through today's challenges, not only literal storms at sea.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is anxious before a swimming competition after hearing a frightening story about a boat capsizing nearby. What can this Bible miracle teach ${who} about facing that fear?`,
      correct: "That trusting God, even amid real fear, can bring peace, just as Jesus brought calm to the frightened disciples",
      wrong: [
        "That fear about water-related events should never be brought to God in prayer",
        "That the miracle only applies to people who are already skilled swimmers",
        "That competitions are unrelated to any lesson in the Bible",
      ],
      explanation: "The miracle's core lesson — depending on God amid fear — applies to any frightening situation, including fear connected with water or competition.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} witnesses a small boat nearly capsize on a lake near ${place(rng)} when sudden strong winds appear. Thinking of this miracle, what should be ${who}'s response to the fear of feeling out of control?`,
      correct: "Turn to God in trust, remembering that he has power over even the most frightening, uncontrollable situations",
      wrong: [
        "Assume nothing can be done and give up on any hope of help",
        "Conclude that God only has power over storms that happened in Bible times",
        "Believe that fear in an out-of-control situation always means a lack of faith is shameful",
      ],
      explanation: "The miracle teaches that Jesus' power reaches into frightening, uncontrollable situations — a reason to respond to fear with trust rather than despair.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} argues that modern weather forecasting now makes depending on God during storms unnecessary. Does this fully match the lesson of calming the storm?`,
      correct: "Not entirely — forecasting can help people prepare, but the miracle still teaches that ultimate peace during frightening situations comes from depending on God",
      wrong: [
        "Yes — modern technology has completely replaced any need for faith during hardship",
        "Yes — prayer has no benefit now that weather forecasting tools exist",
        "No — but the miracle is now irrelevant since modern science explains storms",
      ],
      explanation: "Preparation tools like forecasting are useful, but the miracle's lesson about depending on God for peace amid fear and hardship remains a separate, ongoing lesson.",
    };
  },
];

export const calmingTheStorm: Skill = {
  id: "g5-cre-jc-calming-the-storm",
  code: "JC.3",
  subjectId: "cre",
  strandId: "g5-cre-jesus",
  grade: 5,
  title: "Calming the Storm",
  description: "The miracle of Jesus calming the storm (Mark 4:35-39), showing God's power over nature, and lessons on depending on God to overcome the challenges Christians face today.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, NARRATIVE_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: NARRATIVE_SEQUENCE.map((n) => n.id),
        hint: "Start with Jesus and the disciples getting into the boat, and end with the sea becoming completely calm.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const storm = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "storm")).slice(0, 4);
      const power = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "power")).slice(0, 4);
      const chosen = shuffle(rng, [...storm, ...power]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "storm", label: "The storm and the disciples' fear" },
          { id: "power", label: "Jesus' power and the lesson" },
        ],
        correctBucket,
        hint: "The storm bucket describes the danger itself; the power bucket describes Jesus' response and its lesson.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "storm" ? "the storm and the disciples' fear" : "Jesus' power and the lesson"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what happened during the storm and how Jesus responded to it.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about the disciples' fear, Jesus' power over the wind and waves, and what it means to depend on God.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Jesus told the disciples, \"Let us go over to the other", after: ".\"", answer: "side", accepted: ["side"] },
      { before: "The disciples and Jesus got into a", after: ".", answer: "boat", accepted: ["boat"] },
      { before: "A furious storm arose and waves broke into the", after: ".", answer: "boat", accepted: ["boat"] },
      { before: "The boat began to fill with", after: ".", answer: "water", accepted: ["water"] },
      { before: "During the storm, Jesus was sleeping in the stern on a", after: ".", answer: "cushion", accepted: ["cushion"] },
      { before: "The disciples woke Jesus and asked, \"Don't you care if we", after: "?\"", answer: "drown", accepted: ["drown"] },
      { before: "Jesus got up and rebuked the", after: ".", answer: "wind", accepted: ["wind"] },
      { before: "Jesus said to the waves, \"Quiet! Be", after: "!\"", answer: "still", accepted: ["still"] },
      { before: "After Jesus spoke, the wind died down and it became completely", after: ".", answer: "calm", accepted: ["calm"] },
      { before: "Jesus asked the disciples why they were so", after: ".", answer: "afraid", accepted: ["afraid"] },
      { before: "The disciples were amazed and asked who this was, since even the wind and waves", after: "him.", answer: "obey", accepted: ["obey", "obeyed"] },
      { before: "This miracle teaches Christians to depend on God during life's", after: ".", answer: "challenges", accepted: ["challenges"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about what happened on the boat and how Jesus calmed the storm.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
