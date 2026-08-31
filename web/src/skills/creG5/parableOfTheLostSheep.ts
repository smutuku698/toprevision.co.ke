import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

// Compose a larger prompt pool from a small set of openers x closers (per RIGOR-STANDARDS.md's
// "affordable way to reach 20+" technique) instead of hand-authoring every sentence separately.
function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "the events of the parable of the lost sheep in the correct order.",
    "these events from Luke 15:1-7 into the order they happened.",
    "these moments from the parable of the lost sheep in order.",
    "these events the way Jesus told the parable.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the shepherd's search or about the joy of finding.",
    "these facts about the parable of the lost sheep under the correct bucket.",
    "each fact below by which part of the parable it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the parable of the lost sheep with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the parable of the lost sheep.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Tax collectors and sinners gather to hear Jesus" },
  { id: "n2", label: "The Pharisees and teachers of the law mutter that Jesus welcomes and eats with sinners" },
  { id: "n3", label: "Jesus tells them a parable about a shepherd who has a hundred sheep" },
  { id: "n4", label: "One of the hundred sheep goes missing" },
  { id: "n5", label: "The shepherd leaves the ninety-nine sheep in the open country" },
  { id: "n6", label: "The shepherd goes after the lost sheep until he finds it" },
  { id: "n7", label: "When he finds it, he joyfully puts it on his shoulders" },
  { id: "n8", label: "He goes home and calls his friends and neighbours together" },
  { id: "n9", label: "He says, \"Rejoice with me; I have found my lost sheep\"" },
  { id: "n10", label: "Jesus explains that there is more rejoicing in heaven over one sinner who repents than over ninety-nine who do not need to" },
];

interface EventFact { text: string; group: "search" | "joy" }
const EVENT_FACTS: EventFact[] = [
  { text: "The shepherd noticed one sheep was missing from the hundred", group: "search" },
  { text: "The shepherd left the ninety-nine sheep safely in the open country", group: "search" },
  { text: "The shepherd went out looking for the one lost sheep", group: "search" },
  { text: "The shepherd kept searching until he actually found the lost sheep", group: "search" },
  { text: "The shepherd joyfully carried the found sheep on his shoulders", group: "joy" },
  { text: "The shepherd called his friends and neighbours together", group: "joy" },
  { text: "The shepherd told everyone to rejoice with him", group: "joy" },
  { text: "Jesus said heaven rejoices more over one repentant sinner than ninety-nine who do not need to repent", group: "joy" },
  { text: "The Pharisees complained that Jesus welcomed sinners and ate with them", group: "search" },
  { text: "Tax collectors and sinners gathered specifically to hear Jesus teach", group: "search" },
  { text: "The parable illustrates God's care for even one person who is spiritually lost", group: "joy" },
  { text: "The celebration in the parable models genuine joy over someone returning", group: "joy" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Luke 15:1-7", meaning: "The Bible passage recording the parable of the lost sheep" },
  { term: "Parable", meaning: "A simple story Jesus used to teach a deeper spiritual lesson" },
  { term: "The lost sheep", meaning: "The one sheep out of a hundred that wandered away and needed to be found" },
  { term: "The ninety-nine", meaning: "The sheep the shepherd left safely to go and search for the one that was lost" },
  { term: "Rejoice", meaning: "What the shepherd invited his friends and neighbours to do when the sheep was found" },
  { term: "Repentance", meaning: "Turning back to God, which the parable says brings great rejoicing in heaven" },
  { term: "Pharisees", meaning: "Religious leaders who criticised Jesus for welcoming and eating with sinners" },
  { term: "Tax collectors and sinners", meaning: "The people Jesus welcomed and who gathered to hear him, prompting this parable" },
  { term: "Evangelism", meaning: "Reaching out to people who are far from God, as this lesson encourages" },
  { term: "God's love for the lost", meaning: "The central message of the parable, that God actively seeks out those who wander" },
  { term: "\"Reach out to the lost\"", meaning: "This sub-strand's outcome, encouraging learners to follow the example Jesus taught" },
  { term: "Shepherd", meaning: "The character in the parable representing someone who actively searches for what is lost" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Wanjala", "Cherotich", "Odhis", "Naliaka", "Mutwiri", "Achieng", "Kiplimo", "Wanjiru", "Otieno", "Chepkorir", "Mburu", "Nasimiyu"] as const;
const KENYAN_PLACES = ["Kapsabet", "Kilifi", "Marigat", "Rongo", "Nakuru", "Bomet", "Wajir", "Mbita", "Kajiado", "Kabras", "Loitokitok", "Chuka"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices a classmate who used to attend youth group has stopped coming and seems to be pulling away from friends. Based on the parable of the lost sheep, what should ${name(rng)} consider doing?`,
    correct: "Reach out to the classmate, following the shepherd's example of actively going after the one who is missing",
    wrong: [
      "Ignore the classmate since the rest of the group is still together and fine",
      "The parable teaches that a missing person should be left to return on their own",
      "Wait for the classmate to apologise before showing them any care",
    ],
    explanation: "The shepherd actively left the ninety-nine to search for the one lost sheep, modeling reaching out to someone who has drifted away rather than waiting passively.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is confused about why the shepherd left ninety-nine sheep safe to search for just one. What does this choice teach about how God values each person?`,
      correct: "Each individual person matters deeply to God, even when many others are already safe and secure",
      wrong: [
        "The shepherd's choice was reckless and put the ninety-nine sheep in danger",
        "The story teaches that only large groups of people matter to God",
        "This detail about the ninety-nine has no real meaning in the parable",
      ],
      explanation: "The shepherd's willingness to actively search for just one sheep, even with ninety-nine already safe, illustrates how deeply God values each individual person.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads that Jesus told this parable in response to the Pharisees' complaint about him welcoming sinners. What point was Jesus making with the parable?`,
    correct: "Seeking out and welcoming those considered 'lost' or sinful is exactly what God's love looks like, not something to criticise",
    wrong: [
      "Jesus agreed with the Pharisees that sinners should not be welcomed",
      "The parable had no connection to the Pharisees' complaint at all",
      "Jesus told the parable only to entertain the crowd with a story",
    ],
    explanation: "Jesus used the parable to directly answer the Pharisees' criticism, showing that welcoming and seeking the 'lost' reflects God's own heart, not something shameful.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes celebrating loudly when someone returns to good behaviour, like the shepherd's celebration, seems excessive. What does the parable suggest about this kind of celebration?`,
      correct: "Genuine joy and celebration are the right response when someone who was lost is found or returns, reflecting how heaven rejoices over repentance",
      wrong: [
        "Celebration in this situation should always be avoided as inappropriate",
        "The shepherd's celebration in the parable was meant as an exaggeration with no real meaning",
        "Only quiet, private acknowledgment is appropriate, never open celebration",
      ],
      explanation: "The parable explicitly compares the shepherd's joyful celebration to how heaven rejoices over one sinner who repents — celebration is the fitting, encouraged response.",
    };
  },
  (rng) => ({
    prompt: `A youth group in ${place(rng)}, led by ${name(rng)}, plans an outreach to welcome back a member who has been away for months. Which idea from this parable should shape their approach?`,
    correct: "Approach the returning member with genuine welcome and joy, not judgement, following the shepherd's example",
    wrong: [
      "Make the returning member feel guilty before welcoming them back",
      "This parable gives no guidance on how to welcome someone back",
      "Ignore the member entirely since they chose to stay away",
    ],
    explanation: "The parable's central image of joyful welcome — celebrating rather than criticising — should shape how a returning member is received.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that reaching out to the "lost" only applies to religious leaders like pastors, not to ordinary learners. What does this lesson's outcome suggest about that idea?`,
      correct: "The lesson calls every learner to desire to reach out to the lost, not only religious leaders",
      wrong: [
        "The idea is correct — only trained pastors are meant to reach out to others",
        "The parable teaches that reaching out to others should be avoided entirely",
        "This lesson only applies to adults, never to children or learners",
      ],
      explanation: "The sub-strand's outcome is for learners themselves to reach out to the lost as taught by Jesus Christ, not only for religious leaders to do so.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why the parable specifically compares one sheep to ninety-nine, a very small proportion. What effect does this comparison create?`,
    correct: "It emphasises just how much value and effort God places on even a single person, no matter how small a fraction they represent",
    wrong: [
      "The comparison suggests one person matters far less than a large group",
      "The numbers were chosen randomly with no intended meaning",
      "The comparison shows that searching for one sheep was not worth the shepherd's time",
    ],
    explanation: "By highlighting the smallness of one sheep compared to ninety-nine, the parable emphasises how much God values even a single person who is lost.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says the parable teaches that sheep, and by extension people, wander away entirely on their own without any outside cause. Is this the parable's main focus?`,
    correct: "No — the parable's main focus is on the shepherd's active search and joyful welcome, not on analysing why the sheep wandered",
    wrong: [
      "Yes — the parable spends most of its focus explaining exactly why the sheep wandered",
      "Yes — the parable blames only the sheep for wandering, with no mention of the shepherd",
      "No — but the parable actually focuses only on the ninety-nine sheep, not the one lost one",
    ],
    explanation: "The parable's focus is on the shepherd's determined search and joyful welcome of the lost sheep, not on analysing the reasons behind its wandering.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wonders whether repentance, as mentioned in this parable, is something to feel ashamed of. How does the parable's description of heaven's reaction address this?`,
      correct: "Repentance is met with great rejoicing in heaven, not shame, showing it should be welcomed and celebrated rather than feared",
      wrong: [
        "The parable teaches that repentance always brings shame and punishment",
        "Heaven's reaction to repentance is described as indifferent in the parable",
        "Repentance is presented as something only for very serious sinners",
      ],
      explanation: "Luke 15:7 says there is more rejoicing in heaven over one sinner who repents — presenting repentance as something to be celebrated, not ashamed of.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the shepherd should have simply accepted the loss of one sheep out of a hundred, since it is a small number. How does the parable respond to this way of thinking?`,
    correct: "The parable rejects this thinking — the shepherd actively goes after the one sheep because even one lost individual matters enough to search for",
    wrong: [
      "The parable agrees that a small loss like one sheep is not worth pursuing",
      "The shepherd in the parable actually did give up on the lost sheep",
      "This way of thinking has no connection to the parable's message",
    ],
    explanation: "The parable directly challenges the idea of accepting a small loss — the shepherd's determined search shows that even one person matters deeply.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to compose a poem on God's love for the lost, as this lesson suggests. Which idea would best capture the parable's message?`,
      correct: "God actively seeks out and joyfully welcomes back anyone who has wandered away, valuing every single person",
      wrong: [
        "God only loves people who have never made any mistakes",
        "A poem on this theme should focus on punishing those who wander away",
        "God's love is described in this parable as distant and uninvolved",
      ],
      explanation: "This lesson's own suggested activity is composing a poem on God's love for the lost — the parable's core message is God's active, seeking, joyful love.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks what specific response the shepherd expected from his friends and neighbours after finding the sheep. What did he ask them to do?`,
    correct: "Rejoice with him, sharing in his joy over finding what was lost",
    wrong: [
      "Help him search for any other sheep that might also be missing",
      "Criticise him for having lost a sheep in the first place",
      "Pay him money as compensation for his trouble",
    ],
    explanation: "Luke 15:6 records the shepherd specifically inviting his friends and neighbours to 'rejoice with me,' sharing the joy of finding the lost sheep.",
  }),
];

export const parableOfTheLostSheep: Skill = {
  id: "g5-cre-jc-lost-sheep",
  code: "JC.6",
  subjectId: "cre",
  strandId: "g5-cre-jesus",
  grade: 5,
  title: "Parable of the Lost Sheep",
  description: "The parable of the lost sheep (Luke 15:1-7), showing God's love and active search for the lost, and heaven's joy over one sinner who repents, teaching learners to reach out to the lost.",
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
        hint: "Start with the crowd gathering to hear Jesus, and end with Jesus explaining heaven's rejoicing.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const search = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "search")).slice(0, 4);
      const joy = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "joy")).slice(0, 4);
      const chosen = shuffle(rng, [...search, ...joy]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "search", label: "The shepherd's search" },
          { id: "joy", label: "The joy of finding what was lost" },
        ],
        correctBucket,
        hint: "The search bucket is about looking for the sheep; the joy bucket is about the celebration afterward.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "search" ? "the shepherd's search" : "the joy of finding what was lost"}.`).join(" "),
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
        hint: "Think about why Jesus told this parable and what the shepherd's search represents.",
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
        hint: "Think about why the shepherd searched for the one sheep and how he celebrated finding it.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Tax collectors and sinners gathered to hear", after: ".", answer: "Jesus", accepted: ["jesus"] },
      { before: "The Pharisees complained that Jesus welcomed and ate with", after: ".", answer: "sinners", accepted: ["sinners"] },
      { before: "The shepherd in the parable had a hundred", after: ".", answer: "sheep", accepted: ["sheep"] },
      { before: "The shepherd left the ninety-nine sheep in the open", after: ".", answer: "country", accepted: ["country"] },
      { before: "When he found the lost sheep, he joyfully put it on his", after: ".", answer: "shoulders", accepted: ["shoulders"] },
      { before: "The shepherd called his friends and neighbours to", after: "with him.", answer: "rejoice", accepted: ["rejoice"] },
      { before: "Jesus said heaven rejoices more over one sinner who", after: ".", answer: "repents", accepted: ["repents"] },
      { before: "This parable teaches Christians to reach out to the", after: ".", answer: "lost", accepted: ["lost"] },
      { before: "The parable of the lost sheep is recorded in Luke", after: ".", answer: "15", accepted: ["15", "fifteen"] },
      { before: "This lesson's key inquiry question asks why the parable is significant to", after: "today.", answer: "Christians", accepted: ["christians"] },
      { before: "Jesus told this parable in response to", after: "who criticised him.", answer: "Pharisees", accepted: ["pharisees"] },
      { before: "This story shows God's", after: "for even one lost person.", answer: "love", accepted: ["love"] },
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
      hint: "Think about Luke 15:1-7 and why the shepherd searched for the one lost sheep.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
