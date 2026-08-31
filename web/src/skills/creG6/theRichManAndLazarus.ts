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
    "the events of the parable of the rich man and Lazarus in the correct order.",
    "these events from Luke 16:19-31 into the order they happened.",
    "these moments from the parable of the rich man and Lazarus in order.",
    "these events the way they happened in the parable.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it describes life before death or after death.",
    "these facts about the rich man and Lazarus under the correct bucket.",
    "each fact below by which stage of the parable it belongs to.",
    "each statement into the bucket for the stage it describes.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the rich man and Lazarus with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the parable.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "A rich man lives in luxury every day, dressed in fine clothes" },
  { id: "n2", label: "A poor beggar named Lazarus lies at the rich man's gate, covered in sores, longing for scraps from his table" },
  { id: "n3", label: "Both the rich man and Lazarus die" },
  { id: "n4", label: "Lazarus is carried by the angels to Abraham's side" },
  { id: "n5", label: "The rich man is in torment in Hades and can see Lazarus far away with Abraham" },
  { id: "n6", label: "The rich man begs Abraham to send Lazarus to cool his tongue with a drop of water" },
  { id: "n7", label: "Abraham explains that a great chasm separates them, and their situations are now reversed" },
  { id: "n8", label: "The rich man then begs Abraham to send Lazarus to warn his five brothers" },
  { id: "n9", label: "Abraham says the brothers already have Moses and the Prophets to listen to" },
  { id: "n10", label: "Abraham adds that they would not be convinced even if someone rose from the dead" },
];

interface EventFact { text: string; group: "life" | "afterDeath" }
const EVENT_FACTS: EventFact[] = [
  { text: "The rich man lived in luxury every day, dressed in the finest clothes", group: "life" },
  { text: "Lazarus was a poor beggar covered in sores", group: "life" },
  { text: "Lazarus lay at the rich man's gate, longing for scraps from his table", group: "life" },
  { text: "The rich man is never given a name in the parable, unlike Lazarus", group: "life" },
  { text: "The rich man appears to have ignored Lazarus' suffering at his own gate every day", group: "life" },
  { text: "Lazarus endured his poverty and suffering throughout his life on earth", group: "life" },
  { text: "Both the rich man and Lazarus eventually died", group: "afterDeath" },
  { text: "Lazarus was carried by the angels to Abraham's side", group: "afterDeath" },
  { text: "The rich man found himself in torment in Hades", group: "afterDeath" },
  { text: "The rich man could see Lazarus far away, comforted beside Abraham", group: "afterDeath" },
  { text: "A great chasm now separated the rich man from Lazarus and Abraham, impossible to cross", group: "afterDeath" },
  { text: "The rich man's situation and Lazarus' situation were completely reversed after death", group: "afterDeath" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Lazarus", meaning: "The poor beggar in the parable, given a name unlike the rich man" },
  { term: "The rich man", meaning: "The wealthy man in the parable, never given a name by Jesus" },
  { term: "The gate", meaning: "Where Lazarus lay, longing for scraps, while the rich man lived inside" },
  { term: "Sores", meaning: "The condition covering Lazarus' body as he suffered outside the gate" },
  { term: "Abraham's side", meaning: "Where Lazarus was carried by the angels after he died" },
  { term: "Hades", meaning: "Where the rich man found himself in torment after he died" },
  { term: "The great chasm", meaning: "The uncrossable gap separating the rich man from Lazarus and Abraham" },
  { term: "Five brothers", meaning: "The family members the rich man begged Abraham to warn" },
  { term: "\"Moses and the Prophets\"", meaning: "What Abraham said the rich man's brothers already had to guide them" },
  { term: "Reversal", meaning: "The change in fortune between the rich man and Lazarus after death" },
  { term: "Responsible use of wealth", meaning: "The lesson the parable teaches about caring for the poor around us" },
  { term: "Compassion for the needy", meaning: "A value modern Christians can practise by noticing and helping people like Lazarus today" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Abigael", "Bosire", "Caro", "Domnic", "Esther", "Fadhili", "Geoffrey", "Hadassah", "Ian", "Jemutai", "Kelly", "Muthoni"] as const;
const KENYAN_PLACES = ["Rongai Town", "Kimende", "Kabartonjo", "Awendo", "Kiritiri", "Mai Mahiu", "Ntulele", "Chogoria", "Vihiga Town", "Sondu", "Turbo", "Kagio"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} regularly walks past a beggar at the market gate without ever stopping to help, much like the rich man ignoring Lazarus. What warning does the parable give about this kind of behaviour?`,
    correct: "Ignoring the suffering of the poor around us, while living in comfort, can have serious spiritual consequences, as it did for the rich man",
    wrong: [
      "The parable teaches that helping beggars is optional and has no real spiritual importance",
      "The parable says only religious leaders are responsible for helping the poor, not ordinary people",
      "The parable teaches that Lazarus was to blame for his own poverty",
    ],
    explanation: "The rich man's fate after death illustrates that ignoring the suffering of the poor around us has serious spiritual consequences.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked why it is significant that Lazarus is given a name in the parable while the rich man is not. Why does this matter?`,
    correct: "It shows that God sees and values the poor personally, even when society, like the rich man, overlooks them",
    wrong: [
      "It is simply a random storytelling detail with no meaning",
      "It shows that only named people can go to be with Abraham",
      "It proves that the rich man's name was accidentally left out by a translator",
    ],
    explanation: "Naming Lazarus while leaving the rich man unnamed emphasises that God personally values the poor, even those society overlooks.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what happened to Lazarus and the rich man's situations after they died. What is correct?`,
    correct: "Their situations were reversed — Lazarus was comforted at Abraham's side, while the rich man was in torment",
    wrong: [
      "Both men ended up in the exact same comfortable place",
      "The rich man was comforted while Lazarus continued to suffer",
      "Neither man's situation changed at all after death",
    ],
    explanation: "Luke 16:22-25 shows a complete reversal: Lazarus comforted at Abraham's side, and the rich man in torment.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked what Abraham said when the rich man begged him to send Lazarus to warn his five brothers. What was Abraham's response?`,
    correct: "That the brothers already had Moses and the Prophets, and would not be convinced even by someone rising from the dead",
    wrong: [
      "Abraham agreed immediately and sent Lazarus to warn them",
      "Abraham said the brothers were already believers and needed no warning",
      "Abraham said it was now too late for the brothers to ever change, no matter what happened",
    ],
    explanation: "Abraham explained that if the brothers would not listen to Moses and the Prophets, they would not be convinced even by a miracle like someone rising from the dead.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what the "great chasm" between the rich man and Lazarus represents. What does it show?`,
    correct: "That the outcome after death is fixed and cannot be changed or crossed once someone has died",
    wrong: [
      "A literal physical valley that could be crossed with enough effort",
      "A temporary barrier that would eventually disappear over time",
      "A punishment reserved only for wealthy people, regardless of how they lived",
    ],
    explanation: "The great chasm illustrates that the outcome after death is fixed, not a temporary or physically crossable barrier.",
  }),
  (rng) => ({
    prompt: `${name(rng)}'s classmate says this parable proves being rich is always sinful. Is that an accurate reading of the story?`,
    correct: "No — the parable condemns the rich man's failure to notice and help Lazarus, not wealth itself",
    wrong: [
      "Yes — the parable teaches that all wealthy people are automatically condemned",
      "Yes — the parable teaches that poverty guarantees a place with Abraham regardless of a person's actions",
      "No — the parable actually has nothing to do with how people treat the poor",
    ],
    explanation: "The parable's focus is on how wealth is used, particularly ignoring the needy, rather than condemning wealth as automatically sinful.",
  }),
  (rng) => ({
    prompt: `${name(rng)}'s family in ${place(rng)} regularly sets aside food and clothing for a needy family nearby. Which lesson from this parable does this practice best reflect?`,
    correct: "Noticing and responsibly caring for those in need nearby, unlike the rich man who ignored Lazarus at his own gate",
    wrong: [
      "Hoarding resources to guarantee comfort in the afterlife",
      "Giving only to people who are related to you",
      "Giving only when there is a reward or recognition expected in return",
    ],
    explanation: "Setting aside resources for a needy family directly reflects the parable's lesson: noticing and responsibly helping those in need nearby.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked what point Abraham was making when he said even someone rising from the dead would not convince the rich man's brothers. What was the point?`,
    correct: "That a person's willingness to listen to God's word matters more than being shown a dramatic miracle",
    wrong: [
      "That miracles never actually happen in real life",
      "That Moses and the Prophets were less trustworthy than a miracle would be",
      "That the brothers had already died and could no longer be warned at all",
    ],
    explanation: "Abraham's point is about willingness to listen: someone unwilling to heed Moses and the Prophets would not be convinced even by a dramatic miracle.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what detail shows how severe Lazarus' suffering was during his life. What is it?`,
    correct: "He was covered in sores and lay at the gate longing even for scraps that fell from the rich man's table",
    wrong: [
      "He lived comfortably but simply preferred begging as a lifestyle",
      "He was only mildly inconvenienced compared to others",
      "He had chosen to leave a wealthy home voluntarily",
    ],
    explanation: "Being covered in sores and longing even for table scraps illustrates the severity of Lazarus' suffering during his life.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked how Christians today should respond to the challenge this parable presents, based on its lesson about wealth. What is the best answer?`,
    correct: "By living responsibly and generously, noticing and helping the poor and needy around them rather than ignoring them",
    wrong: [
      "By giving away all possessions immediately with no planning at all",
      "By avoiding any contact with poor people to prevent feeling guilty",
      "By assuming wealth itself guarantees eternal punishment regardless of one's actions",
    ],
    explanation: "The parable's lesson calls Christians to responsible, generous use of wealth, actively noticing and helping the needy, not extreme or fearful reactions.",
  }),
];

export const theRichManAndLazarus: Skill = {
  id: "g6-cre-jc-the-rich-man-and-lazarus",
  code: "JC.7",
  subjectId: "cre",
  strandId: "g6-cre-jesus",
  grade: 6,
  title: "The Parable of the Rich Man and Lazarus",
  description: "The parable of the rich man and the beggar Lazarus (Luke 16:19-31), the reversal of their fortunes after death, and the lesson about using wealth responsibly.",
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
        hint: "Start with the rich man's life of luxury, and end with Abraham's final words about Moses and the Prophets.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const life = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "life")).slice(0, 4);
      const afterDeath = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "afterDeath")).slice(0, 4);
      const chosen = shuffle(rng, [...life, ...afterDeath]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "life", label: "During their lives" },
          { id: "afterDeath", label: "After they died" },
        ],
        correctBucket,
        hint: "Life facts describe the gate, luxury, and suffering before death; after-death facts describe Hades and Abraham's side.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "life" ? "during their lives" : "after they died"}.`).join(" "),
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
        hint: "Think about the contrast between the rich man and Lazarus, and their reversed fortunes after death.",
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
        hint: "Think about how the rich man treated Lazarus, what changed after death, and the lesson about using wealth responsibly.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The rich man lived in luxury every day, dressed in fine", after: ".", answer: "clothes", accepted: ["clothes"] },
      { before: "Lazarus was a poor beggar covered in", after: ", lying at the rich man's gate.", answer: "sores", accepted: ["sores"] },
      { before: "Lazarus longed for the", after: "that fell from the rich man's table.", answer: "scraps", accepted: ["scraps", "crumbs"] },
      { before: "Unlike the rich man, Lazarus is given a", after: "in the parable.", answer: "name", accepted: ["name"] },
      { before: "After Lazarus died, he was carried by the angels to", after: "side.", answer: "Abraham's", accepted: ["abraham's", "abraham"] },
      { before: "After the rich man died, he found himself in torment in", after: ".", answer: "Hades", accepted: ["hades"] },
      { before: "Between the rich man and Lazarus, Abraham said there was a great", after: "that could not be crossed.", answer: "chasm", accepted: ["chasm", "gap"] },
      { before: "The rich man begged Abraham to send Lazarus to warn his five", after: ".", answer: "brothers", accepted: ["brothers"] },
      { before: "Abraham said the brothers already had Moses and the", after: "to listen to.", answer: "Prophets", accepted: ["prophets"] },
      { before: "Abraham said the brothers would not believe even if someone rose from the", after: ".", answer: "dead", accepted: ["dead"] },
      { before: "This parable is recorded in the Gospel of Luke, chapter", after: ".", answer: "16", accepted: ["16", "sixteen"] },
      { before: "The parable teaches Christians to use their wealth", after: "and to care for the poor.", answer: "responsibly", accepted: ["responsibly", "wisely"] },
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
      hint: "Think about the contrast between the rich man's luxury and Lazarus' suffering, and what happened to each after death.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
