import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

// No natural sequence exists across these 7 unrelated animals/birds from different faiths (unlike a
// single narrative's events), so this skill uses categorize/match/reasoning/fill-blank — 4 kinds with a
// documented reason, per SKILL-QUALITY-STANDARDS.md's allowance for a genuine content-shape limit.
const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each fact by why the animal or bird is considered sacred.",
    "these facts under the correct reason.",
    "each fact below by whether it links to a deity or to a teaching/story.",
    "each fact into the bucket for a deity link or a teaching/virtue.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each animal or bird to its religious significance.",
    "each animal or bird below with why it is considered sacred.",
    "each animal or bird to the fact that explains its importance.",
    "each animal or bird to the significance that best fits it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the Gifts of Nature.",
    "the correct missing word.",
  ],
);

// The 7 selected animals/birds are a closed list explicitly named in the design (cow, peacock, horse,
// elephant, hawk, Garur, lion) — a hard-floor pool that cannot be padded with an 8th invented animal.
const ANIMAL_SIGNIFICANCE: { animal: string; significance: string }[] = [
  { animal: "Cow", significance: "Honoured in Sanatan/Vedic tradition partly because Lord Krishna is called Govinda, meaning 'protector of cows', and its generous gift of milk symbolises motherhood" },
  { animal: "Peacock", significance: "The vehicle (vahana) of Lord Kartikeya in Sanatan/Vedic tradition, and in Buddhist teaching honoured for supposedly eating poisonous plants without harm" },
  { animal: "Horse", significance: "Linked to the sun god Surya, whose chariot is described as drawn by seven horses, and to Kalki, the future avatar of Vishnu" },
  { animal: "Elephant", significance: "Honoured because of its association with Lord Ganesha, the remover of obstacles, and valued as a symbol of wisdom and memory" },
  { animal: "Hawk", significance: "Remembered through the Puranic story of King Shibi, who offered his own flesh to save a dove being pursued by a hawk" },
  { animal: "Garur", significance: "The divine eagle who serves as the vehicle (vahana) of Lord Vishnu, honoured as a symbol of strength, speed, and devoted service" },
  { animal: "Lion", significance: "The vehicle (vahana) of Goddess Durga in Sanatan/Vedic tradition, and the source of 'Singh', the name Guru Gobind Singh gave Khalsa Sikhs as a symbol of courage" },
];

interface GiftFact { text: string; kind: "deity" | "virtue" }
const GIFT_FACTS: GiftFact[] = [
  { text: "The cow is honoured in Sanatan/Vedic tradition partly because Lord Krishna is called Govinda, meaning 'protector of cows'", kind: "deity" },
  { text: "The cow's gentle nature and its generous gift of milk make it a symbol of motherhood and selfless giving", kind: "virtue" },
  { text: "In Sanatan/Vedic tradition, the peacock is the vehicle (vahana) of Lord Kartikeya", kind: "deity" },
  { text: "In Buddhist teaching, the peacock is honoured because it is believed to eat poisonous plants without harm, symbolising turning negative emotions into wisdom", kind: "virtue" },
  { text: "In Sanatan/Vedic tradition, the sun god Surya's chariot is described as being drawn by seven horses", kind: "deity" },
  { text: "The horse is associated with Kalki, the future avatar of Vishnu, described as riding a white horse", kind: "deity" },
  { text: "The elephant is honoured in Sanatan/Vedic tradition because of its association with Lord Ganesha, the remover of obstacles", kind: "deity" },
  { text: "The elephant's great strength paired with its gentleness makes it a symbol of wisdom and good memory", kind: "virtue" },
  { text: "The hawk appears in the Puranic story of King Shibi, who offered his own flesh to save a dove being pursued by a hawk", kind: "virtue" },
  { text: "The story of King Shibi and the hawk is used to teach the virtue of compassion and self-sacrifice for others", kind: "virtue" },
  { text: "Garur (Garuda) is the divine eagle who serves as the vehicle (vahana) of Lord Vishnu in Sanatan/Vedic tradition", kind: "deity" },
  { text: "Garur is honoured as a symbol of strength, speed, and devoted service because of his role serving Lord Vishnu", kind: "virtue" },
  { text: "In Sanatan/Vedic tradition, the lion is the vehicle (vahana) of Goddess Durga", kind: "deity" },
  { text: "In Sikh tradition, Guru Gobind Singh gave the name 'Singh', meaning lion, to Khalsa Sikhs as a symbol of courage", kind: "virtue" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why the cow is treated with particular respect in Sanatan/Vedic tradition. What is the best answer from this lesson?`,
    correct: "Because it is linked to Lord Krishna, called Govinda ('protector of cows'), and its generous milk symbolises motherhood and selfless giving",
    wrong: [
      "Because it is the fastest of the seven selected animals",
      "Because it is the vehicle of Goddess Durga rather than any other deity",
      "Because it appears in the story of King Shibi and the hawk",
    ],
    explanation: "The cow's significance in this lesson comes from its link to Lord Krishna (Govinda) and its symbolism of motherhood through its generous milk — not from speed or an unrelated story.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} learns that the peacock is honoured for supposedly eating poisonous plants without harm. What does this best symbolise, according to Buddhist teaching?`,
    correct: "The transformation of negative emotions into wisdom and beauty",
    wrong: [
      "The importance of avoiding all plants in daily life",
      "A warning about the dangers of eating unfamiliar foods",
      "The peacock's role as the vehicle of Goddess Durga",
    ],
    explanation: "In Buddhist teaching, the peacock's supposed ability to absorb poison without harm is understood as a symbol of transforming negative emotions into wisdom, not a literal dietary lesson.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} confuses which deity the elephant is associated with. Which is correct?`,
    correct: "Lord Ganesha, the remover of obstacles",
    wrong: [
      "Lord Kartikeya, whose vehicle is the peacock",
      "Goddess Durga, whose vehicle is the lion",
      "Lord Vishnu, whose vehicle is Garur",
    ],
    explanation: "The elephant is specifically associated with Lord Ganesha; the peacock, lion, and Garur are each linked to different deities (Kartikeya, Durga, and Vishnu respectively).",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} hears the Puranic story of King Shibi offering his own flesh to save a dove from a hawk, and says the story is only about hawks being dangerous. Is this the intended lesson?`,
      correct: "No — the story teaches the virtue of compassion and self-sacrifice for others, using the hawk and dove as part of the test",
      wrong: [
        "Yes — the story exists purely to warn people about hawks",
        "Yes — the story teaches that doves should never be helped",
        "No — but only because the story has nothing at all to do with animals",
      ],
      explanation: "The story of King Shibi uses the hawk-and-dove situation as a test of compassion — the point is King Shibi's self-sacrifice for another creature, not a warning about hawks.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know what Garur (Garuda) symbolises, based on his role serving Lord Vishnu. What is the best answer?`,
    correct: "Strength, speed, and devoted service",
    wrong: [
      "Motherhood and selfless giving",
      "Compassion shown through self-sacrifice",
      "Courage shown through a name given by a Sikh Guru",
    ],
    explanation: "Garur, as Lord Vishnu's vehicle, is honoured specifically as a symbol of strength, speed, and devoted service — the other options describe different animals' significance in this lesson.",
  }),
  (rng) => ({
    prompt: `${name(rng)} learns that Guru Gobind Singh gave Khalsa Sikhs the name 'Singh'. Which of the seven Gifts of Nature does this fact relate to, and why?`,
    correct: "The lion, because 'Singh' means lion and was given as a symbol of courage",
    wrong: [
      "The elephant, because both are described as strong and gentle",
      "The horse, because both are linked to a future avatar of Vishnu",
      "The cow, because both symbolise selfless giving",
    ],
    explanation: "'Singh' means lion, and Guru Gobind Singh gave this name to Khalsa Sikhs specifically as a symbol of courage — connecting the lion, not any other animal, to Sikh identity.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that all seven selected animals and birds are significant purely because they are dangerous or powerful. Is this an accurate summary of the lesson?`,
    correct: "No — some, like the cow and the hawk-in-the-Shibi-story, are significant because of gentleness, giving, or a teaching about compassion, not danger or power",
    wrong: [
      "Yes — every one of the seven is significant purely for being dangerous",
      "Yes — power is the only reason any animal in any faith is honoured",
      "No — but only the cow has any significance at all among the seven",
    ],
    explanation: "The seven Gifts of Nature carry varied significance — some (Garur, lion, horse) relate to strength or deity association, while others (cow, the Shibi story) relate to gentleness, giving, or compassion.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked how Scriptural stories about these animals and birds show interdependence of nature and humans, per this lesson's key inquiry question. What is the best answer?`,
    correct: "The stories show humans looking to animals and birds for spiritual meaning, moral lessons, and symbols connected to the divine",
    wrong: [
      "The stories show that animals and humans have no real connection to each other",
      "The stories exist only to describe which animals are physically the strongest",
      "The stories show that nature should be avoided rather than appreciated",
    ],
    explanation: "Across the seven Gifts of Nature, Scriptural stories consistently connect animals and birds to spiritual meaning and moral lessons — showing a deep interdependence between nature and human faith.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says the peacock and the lion are both associated with exactly the same deity. Is this correct?`,
      correct: "No — the peacock is the vehicle of Lord Kartikeya while the lion is the vehicle of Goddess Durga, different deities",
      wrong: [
        "Yes — both animals serve as the vehicle of Lord Vishnu",
        "Yes — both animals are associated with Lord Ganesha",
        "No — but only because the peacock has no deity association at all",
      ],
      explanation: "The peacock and the lion are each linked to a different deity in Sanatan/Vedic tradition — Kartikeya and Durga respectively — so they are not associated with the same deity.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that since these animals come from different faiths, none of the seven Gifts of Nature share anything in common. Evaluate this claim.`,
    correct: "Flawed — despite coming from different faith traditions, all seven share the common thread of carrying deep symbolic or spiritual meaning",
    wrong: [
      "Sound — animals from different faiths can never share a common purpose",
      "Sound — only animals from the same faith can be meaningfully compared",
      "Flawed — but only because all seven actually belong to exactly one single faith",
    ],
    explanation: "Even though the seven Gifts of Nature come from Sanatan/Vedic, Buddhist, and Sikh contexts, they share the common thread of symbolic and spiritual significance — that shared thread is the very point of studying them together.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why learners should appreciate the importance of these specific birds and animals, based on this lesson's aim. What is the best response?`,
    correct: "Because appreciating their symbolic and spiritual significance builds social awareness of the four faiths' teachings and their view of nature",
    wrong: [
      "Because every learner must personally worship each of the seven animals",
      "Because the seven animals have no further relevance once identified",
      "Because appreciating them replaces the need to protect real animals and the environment",
    ],
    explanation: "This sub-strand's own aim is appreciating the importance of specific birds and animals for social awareness — understanding their symbolic meaning, not literal worship or replacing environmental care.",
  }),
];

export const giftsOfNature: Skill = {
  id: "g6-hre-cn-gifts-of-nature",
  code: "CN.2",
  subjectId: "hre",
  strandId: "g6-hre-cn",
  grade: 6,
  title: "Gifts of Nature",
  description: "The seven selected animals and birds honoured across the four faiths — cow, peacock, horse, elephant, hawk, Garur, and lion — and the deities, stories, or virtues each is linked to.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const deity = shuffle(rng, GIFT_FACTS.filter((f) => f.kind === "deity")).slice(0, 4);
      const virtue = shuffle(rng, GIFT_FACTS.filter((f) => f.kind === "virtue")).slice(0, 4);
      const chosen = shuffle(rng, [...deity, ...virtue]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "deity", label: "Linked to a deity or divine figure" },
          { id: "virtue", label: "Linked to a teaching, story, or virtue" },
        ],
        correctBucket,
        hint: "Some facts describe a deity's vehicle or association, while others describe a teaching, story, or virtue.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "deity" ? "linked to a deity" : "linked to a teaching/virtue"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, ANIMAL_SIGNIFICANCE).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.animal, label: a.animal })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.animal, label: a.significance })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.animal] = a.animal;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about which deity, story, or virtue each animal or bird is known for.",
        explanation: chosen.map((a) => `${a.animal} — ${a.significance.toLowerCase()}.`).join(" "),
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
        hint: "Think about which of the seven Gifts of Nature the scenario is describing, and why it is significant.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Lord Krishna is called", after: ", meaning 'protector of cows.'", answer: "Govinda", accepted: ["govinda"] },
      { before: "The peacock is the vehicle (vahana) of Lord", after: " in Sanatan/Vedic tradition.", answer: "Kartikeya", accepted: ["kartikeya"] },
      { before: "In Buddhist teaching, the peacock is honoured for eating", after: "plants without harm.", answer: "poisonous", accepted: ["poisonous"] },
      { before: "Surya's chariot is described as being drawn by seven", after: ".", answer: "horses", accepted: ["horses"] },
      { before: "The horse is associated with Kalki, the future avatar of", after: ".", answer: "Vishnu", accepted: ["vishnu"] },
      { before: "The elephant is associated with Lord", after: ", the remover of obstacles.", answer: "Ganesha", accepted: ["ganesha"] },
      { before: "In the Puranic story, King Shibi offered his own flesh to save a", after: "from a hawk.", answer: "dove", accepted: ["dove"] },
      { before: "Garur (Garuda) is the divine eagle who serves as the vehicle of Lord", after: ".", answer: "Vishnu", accepted: ["vishnu"] },
      { before: "The lion is the vehicle (vahana) of Goddess", after: " in Sanatan/Vedic tradition.", answer: "Durga", accepted: ["durga"] },
      { before: "Guru Gobind Singh gave Khalsa Sikhs the name 'Singh', meaning", after: ", as a symbol of courage.", answer: "lion", accepted: ["lion"] },
      { before: "The cow's generous gift of", after: "symbolises motherhood and selfless giving.", answer: "milk", accepted: ["milk"] },
      { before: "The story of King Shibi and the hawk teaches the virtue of compassion and self-", after: ".", answer: "sacrifice", accepted: ["sacrifice"] },
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
      hint: "Recall which deity, story, or virtue each of the seven Gifts of Nature is linked to.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
