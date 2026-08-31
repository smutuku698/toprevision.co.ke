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
    "the events of feeding the four thousand in the correct order.",
    "these events from Matthew 15:32-38 into the order they happened.",
    "these moments from the miracle of feeding the crowd in order.",
    "these events the way they happened by the lake.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the crowd's need or about Jesus' provision.",
    "these facts about feeding the four thousand under the correct bucket.",
    "each fact below by which part of the miracle it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about feeding the four thousand with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about feeding the four thousand.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "The crowd has been with Jesus for three days and has nothing left to eat" },
  { id: "n2", label: "Jesus has compassion and does not want to send them away hungry, in case they collapse" },
  { id: "n3", label: "The disciples ask where they could find enough bread for such a crowd in a remote place" },
  { id: "n4", label: "Jesus asks how much food they have, and the disciples say seven loaves and a few small fish" },
  { id: "n5", label: "Jesus tells the crowd to sit down on the ground" },
  { id: "n6", label: "Jesus takes the seven loaves and fish, gives thanks, and breaks them" },
  { id: "n7", label: "Jesus gives the broken bread and fish to the disciples, who give it to the crowd" },
  { id: "n8", label: "Everyone eats and is satisfied" },
  { id: "n9", label: "The disciples pick up seven basketfuls of leftover broken pieces" },
  { id: "n10", label: "About four thousand men, besides women and children, are fed that day" },
];

interface EventFact { text: string; group: "need" | "provision" }
const EVENT_FACTS: EventFact[] = [
  { text: "The crowd had been with Jesus for three days with nothing left to eat", group: "need" },
  { text: "Jesus was concerned the hungry crowd might collapse on the way home", group: "need" },
  { text: "The disciples wondered where enough bread could be found in a remote place", group: "need" },
  { text: "The disciples only had seven loaves and a few small fish to offer", group: "need" },
  { text: "Jesus had compassion on the crowd's hunger before doing anything else", group: "need" },
  { text: "Jesus told the crowd to sit down on the ground before the meal", group: "provision" },
  { text: "Jesus gave thanks before breaking the loaves and fish", group: "provision" },
  { text: "Jesus gave the bread and fish to the disciples to distribute to the crowd", group: "provision" },
  { text: "Everyone in the crowd ate until they were fully satisfied", group: "provision" },
  { text: "Seven basketfuls of broken pieces were left over after everyone ate", group: "provision" },
  { text: "About four thousand men, plus women and children, were fed from the small amount of food", group: "provision" },
  { text: "The small amount of bread and fish became more than enough through Jesus' provision", group: "provision" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Matthew 15:32-38", meaning: "The Bible passage recording the miracle of feeding the four thousand" },
  { term: "Compassion", meaning: "The concern Jesus felt for the hungry crowd before performing the miracle" },
  { term: "Seven loaves", meaning: "The small amount of bread the disciples had before the miracle" },
  { term: "A few small fish", meaning: "The other small amount of food the disciples offered Jesus" },
  { term: "Gave thanks", meaning: "What Jesus did before breaking the loaves and fish" },
  { term: "Seven basketfuls", meaning: "The amount of leftover food gathered after everyone had eaten" },
  { term: "Four thousand men", meaning: "The rough number of men fed, not counting women and children" },
  { term: "Helping the needy", meaning: "A value this miracle models, since Jesus provided for the hungry crowd" },
  { term: "Reflection journal", meaning: "A tool suggested for writing about how to help those in need, following Jesus' example" },
  { term: "God's provision", meaning: "The idea that God can supply more than enough from what seems like very little" },
  { term: "Remote place", meaning: "The setting where the crowd was, far from towns where they could easily buy food" },
  { term: "Sharing", meaning: "The value shown as the small offering of food was distributed to feed thousands" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Njeri", "Kiplangat", "Adisa", "Otieno", "Wangari", "Cheruiyot", "Nakhumicha", "Simiyu", "Wafula", "Nyaboke", "Onyango", "Kimani"] as const;
const KENYAN_PLACES = ["Nyahururu", "Wote", "Chwele", "Kakamega", "Migori", "Kitui", "Vihiga", "Kabarnet", "Kilifi", "Marsabit", "Elgeyo", "Kericho"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees a classmate who has no lunch and only has a small snack of their own. Based on the miracle of feeding the four thousand, what should ${name(rng)} consider doing?`,
    correct: "Share the small amount they have, following Jesus' example of using a small offering to help someone in need",
    wrong: [
      "Wait until they have a large amount before ever sharing anything",
      "This miracle only teaches about food in Bible times, with no lesson for today",
      "Only share if they can be sure of receiving something back in return",
    ],
    explanation: "The miracle began with only seven loaves and a few fish — a small amount that, when shared and blessed, was enough to help everyone, encouraging sharing even small amounts.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices Jesus gave thanks before breaking the small amount of bread and fish. What does this action teach about gratitude?`,
      correct: "Being thankful for what is available, even a small amount, can come before seeing how it will be used to help others",
      wrong: [
        "Giving thanks was unnecessary since the amount of food was too small to matter",
        "Jesus only gave thanks after the miracle had already happened",
        "This detail has no connection to gratitude at all",
      ],
      explanation: "Jesus gave thanks for the seven loaves and fish before the miracle happened, modeling gratitude for what is available, however small it may seem.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads that the disciples asked where they could find enough bread "in a remote place." Why does the setting make the miracle more significant?`,
    correct: "There was no easy way to buy or gather more food nearby, making the crowd's need urgent and Jesus' provision even more remarkable",
    wrong: [
      "The remote setting made the miracle less significant, since fewer people were watching",
      "There is no significance to where the miracle took place",
      "The remote place actually had plenty of food shops nearby",
    ],
    explanation: "The remote location meant there was no easy way to solve the crowd's hunger through ordinary means, making Jesus' provision especially significant.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says helping the needy only matters if a person has a lot of resources to give. How does this miracle challenge that idea?`,
      correct: "Even a small offering, when given with compassion, can be enough to help meet a real need",
      wrong: [
        "The miracle proves only wealthy people can truly help others",
        "This miracle teaches that helping the needy requires huge resources",
        "The small amount of food in the story had no real impact on the outcome",
      ],
      explanation: "The miracle shows that a small offering — seven loaves and a few fish — was enough to feed thousands, challenging the idea that only large resources can help.",
    };
  },
  (rng) => ({
    prompt: `A youth group in ${place(rng)}, guided by ${name(rng)}, is organising a food drive for a needy family. Which detail from this miracle best encourages them to start even with limited supplies?`,
    correct: "The seven loaves and few fish were a small amount, yet they became more than enough to feed thousands when offered and shared",
    wrong: [
      "The miracle teaches that food drives should wait until large donations arrive",
      "The story shows that small contributions are never worth collecting",
      "This miracle has no connection to organising help for people in need today",
    ],
    explanation: "The miracle's core encouragement is that a small offering, willingly given, can meet a real need — a direct encouragement for starting a food drive with whatever is available.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wonders why Jesus specifically checked how much food the disciples had before doing anything. What does this show about how Jesus worked the miracle?`,
      correct: "Jesus involved the disciples and worked with what they already had, rather than ignoring their resources entirely",
      wrong: [
        "Jesus needed the information because He was unable to provide food otherwise",
        "Checking the food supply had no purpose in how the miracle unfolded",
        "Jesus asked only to test whether the disciples were being honest",
      ],
      explanation: "By asking how much food they had, Jesus involved the disciples and used their available resources as the starting point for the miracle.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says the seven baskets of leftovers show that Jesus' provision was barely enough, with almost nothing left over. Is this an accurate reading of the story?`,
    correct: "No — the seven full baskets of leftovers show Jesus' provision was abundant, more than enough for everyone who ate",
    wrong: [
      "Yes — the leftovers were only a tiny, insignificant amount",
      "Yes — the leftovers show the crowd actually went home still hungry",
      "No — but the leftovers had no meaningful significance for the story",
    ],
    explanation: "Seven full baskets of leftovers, after thousands had already eaten and were satisfied, show Jesus' provision was generous and abundant, not barely sufficient.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why Matthew's account specifically mentions the crowd of "about four thousand men, besides women and children." What does this detail suggest about the scale of the miracle?`,
    correct: "The actual number fed was likely much larger than four thousand, making the miracle's scale even greater than the headline number suggests",
    wrong: [
      "It suggests women and children were not actually present at all",
      "It suggests the number four thousand was an exaggeration with no real meaning",
      "It has no bearing on understanding the scale of the miracle",
    ],
    explanation: "Noting 'besides women and children' shows the true number fed was likely much larger than four thousand, emphasising the scale of Jesus' provision.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to write a reflection journal, as this lesson suggests, on how to help people in need. Which idea best fits the miracle's teaching?`,
      correct: "Look for practical, even small, ways to notice and respond to someone's hunger or need, as Jesus did for the crowd",
      wrong: [
        "Focus the reflection only on times when help was refused",
        "Write about why helping others is unnecessary in daily life",
        "The reflection should avoid connecting to this Bible story entirely",
      ],
      explanation: "This lesson's own suggested learning experience is writing a reflection journal on how to help those in need, directly connected to Jesus' compassion for the hungry crowd.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} believes Jesus performed this miracle only to impress the crowd with a spectacular show. What does the story's own description of Jesus' motive suggest instead?`,
    correct: "Jesus was motivated by genuine compassion for the crowd's hunger and physical wellbeing, not a desire to impress anyone",
    wrong: [
      "The story confirms Jesus' only goal was public spectacle",
      "Jesus performed the miracle reluctantly, after the crowd demanded it",
      "The story gives no indication at all of Jesus' motive",
    ],
    explanation: "Matthew 15:32 explicitly describes Jesus' compassion and concern that the hungry crowd might collapse — a motive of genuine care, not a desire for spectacle.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} thinks about starting a small project to collect extra food at school for classmates who sometimes go without lunch. What encouragement from this miracle applies most directly?`,
      correct: "Starting with whatever small amount is available can still make a real difference when it is offered with compassion",
      wrong: [
        "The project should be delayed until enough food for thousands can be collected",
        "This miracle discourages starting small, practical projects to help others",
        "Only miraculous, supernatural help counts as real help, according to this story",
      ],
      explanation: "The miracle's central encouragement is that even a small, seemingly insufficient offering, given with compassion, can meaningfully help those in need.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks what specific role the disciples played in the miracle, besides watching it happen. What was their role?`,
    correct: "They gathered information about the available food, distributed the broken bread and fish to the crowd, and collected the leftovers",
    wrong: [
      "The disciples played no active role at all in the miracle",
      "The disciples multiplied the food themselves, without Jesus' involvement",
      "The disciples only ate the food themselves and did not share it",
    ],
    explanation: "The disciples were actively involved — reporting the available food, distributing it to the crowd at Jesus' direction, and gathering the leftover baskets.",
  }),
];

export const feedingTheFourThousand: Skill = {
  id: "g5-cre-jc-feeding-the-four-thousand",
  code: "JC.4",
  subjectId: "cre",
  strandId: "g5-cre-jesus",
  grade: 5,
  title: "Feeding the Four Thousand",
  description: "Jesus' miracle of feeding about four thousand men, besides women and children, from seven loaves and a few small fish (Matthew 15:32-38), teaching compassion and helping the needy.",
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
        hint: "Start with the crowd's hunger, and end with about four thousand men, plus women and children, being fed.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const need = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "need")).slice(0, 4);
      const provision = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "provision")).slice(0, 4);
      const chosen = shuffle(rng, [...need, ...provision]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "need", label: "The crowd's need" },
          { id: "provision", label: "Jesus' provision" },
        ],
        correctBucket,
        hint: "The need bucket is about the crowd's hunger; the provision bucket is about how Jesus met it.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "need" ? "the crowd's need" : "Jesus' provision"}.`).join(" "),
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
        hint: "Think about how little food the disciples started with and how much was left over.",
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
        hint: "Think about Jesus' compassion for the hungry crowd and how the small offering became more than enough.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The crowd had been with Jesus for three days with nothing to", after: ".", answer: "eat", accepted: ["eat"] },
      { before: "Jesus was concerned the hungry crowd might", after: "on the way home.", answer: "collapse", accepted: ["collapse"] },
      { before: "The disciples had seven loaves and a few small", after: ".", answer: "fish", accepted: ["fish"] },
      { before: "Jesus told the crowd to sit down on the", after: ".", answer: "ground", accepted: ["ground"] },
      { before: "Jesus gave", after: "before breaking the bread and fish.", answer: "thanks", accepted: ["thanks"] },
      { before: "The disciples gathered seven", after: "of leftover broken pieces.", answer: "basketfuls", accepted: ["basketfuls", "baskets"] },
      { before: "About four thousand men, besides women and", after: ", were fed.", answer: "children", accepted: ["children"] },
      { before: "This miracle shows Jesus' feeling of", after: "for the hungry crowd.", answer: "compassion", accepted: ["compassion"] },
      { before: "This lesson teaches the value of love by helping the", after: ".", answer: "needy", accepted: ["needy"] },
      { before: "The miracle of feeding the four thousand is recorded in", after: "15:32-38.", answer: "Matthew", accepted: ["matthew"] },
      { before: "This lesson's key inquiry question asks how Jesus Christ showed", after: ".", answer: "compassion", accepted: ["compassion"] },
      { before: "The small offering of food became more than", after: "for the whole crowd.", answer: "enough", accepted: ["enough"] },
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
      hint: "Think about Matthew 15:32-38 and how Jesus fed the crowd from a small amount of food.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
