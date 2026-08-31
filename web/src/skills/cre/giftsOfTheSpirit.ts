import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WHICH_CATEGORY_PROMPTS = [
  (name: string) => `Which category does the gift of "${name}" belong to?`,
  (name: string) => `"${name}" belongs to which category of spiritual gifts?`,
  (name: string) => `Classify the gift of "${name}" — is it revelation, power, or utterance?`,
  (name: string) => `Which type of gift is "${name}"?`,
  (name: string) => `Identify the category for the gift of "${name}".`,
  (name: string) => `Sort "${name}" into its correct category of spiritual gifts.`,
];

const CATEGORIZE_PROMPTS = [
  "Sort each gift of the Holy Spirit into Revelation, Power, or Utterance gifts.",
  "Group these spiritual gifts under Revelation, Power, or Utterance.",
  "Decide which category each gift below belongs to, and sort it there.",
  "Sort each gift into the category it best fits.",
  "Place each spiritual gift into its correct bucket.",
  "Read each gift and sort it under Revelation, Power, or Utterance.",
];

const REVELATION = [
  { name: "Word of wisdom", reason: "The word of wisdom is a revelation gift — it reveals God's wisdom for a situation." },
  { name: "Word of knowledge", reason: "The word of knowledge is a revelation gift — it reveals facts God makes known supernaturally." },
  { name: "Discerning of spirits", reason: "Discerning of spirits is a revelation gift — it reveals the true spiritual source behind something." },
];

const POWER = [
  { name: "Faith", reason: "Faith is a power gift — it is a special measure of trust in God's power to act." },
  { name: "Gifts of healing", reason: "Gifts of healing are power gifts — God acts through a believer to heal the sick." },
  { name: "Working of miracles", reason: "Working of miracles is a power gift — God acts through a believer to do the supernatural." },
];

const UTTERANCE = [
  { name: "Prophecy", reason: "Prophecy is an utterance gift — speaking a message from God to build up the church." },
  { name: "Speaking in tongues", reason: "Speaking in tongues is an utterance gift — speaking in a Spirit-given language." },
  { name: "Interpretation of tongues", reason: "Interpretation of tongues is an utterance gift — explaining what is said in tongues." },
];

export const giftsOfTheSpirit: Skill = {
  id: "cre-ch-gifts-of-spirit",
  code: "CH.2",
  subjectId: "cre",
  strandId: "cre-church",
  grade: 9,
  title: "The gifts of the Holy Spirit",
  description: "Classify the gifts of the Holy Spirit into revelation, power, and utterance gifts.",
  generate(rng) {
    const hint = "Revelation gifts reveal something; power gifts act with God's power; utterance gifts are spoken out.";

    if (rng() < 0.5) {
      const pool = [
        ...REVELATION.map((g) => ({ ...g, category: "Revelation gifts" })),
        ...POWER.map((g) => ({ ...g, category: "Power gifts" })),
        ...UTTERANCE.map((g) => ({ ...g, category: "Utterance gifts" })),
      ];
      const target = randChoice(rng, pool);
      const otherCategories = ["Revelation gifts", "Power gifts", "Utterance gifts"].filter((c) => c !== target.category);
      const choices = shuffle(rng, [target.category, ...otherCategories]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, WHICH_CATEGORY_PROMPTS)(target.name),
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "grid",
        hint,
        explanation: target.reason,
      };
    }

    const revelation = shuffle(rng, REVELATION).slice(0, 2);
    const power = shuffle(rng, POWER).slice(0, 2);
    const utterance = shuffle(rng, UTTERANCE).slice(0, 2);
    const items = shuffle(rng, [
      ...revelation.map((g) => ({ id: g.name, label: g.name, bucket: "revelation", reason: g.reason })),
      ...power.map((g) => ({ id: g.name, label: g.name, bucket: "power", reason: g.reason })),
      ...utterance.map((g) => ({ id: g.name, label: g.name, bucket: "utterance", reason: g.reason })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "revelation", label: "Revelation gifts" },
        { id: "power", label: "Power gifts" },
        { id: "utterance", label: "Utterance gifts" },
      ],
      correctBucket,
      hint: "Revelation gifts reveal something; power gifts act with God's power; utterance gifts are spoken out.",
      explanation: items.map((item) => item.reason).join(" "),
    };
  },
};
