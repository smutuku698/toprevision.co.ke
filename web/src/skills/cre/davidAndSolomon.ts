import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WHICH_KING_PROMPTS = [
  (label: string) => `Which king: "${label}"?`,
  (label: string) => `This fact describes which king — David or Solomon? "${label}"`,
  (label: string) => `Read the fact and choose the king it describes: "${label}"`,
  (label: string) => `"${label}" — which king does this describe?`,
  (label: string) => `Identify the king this fact is about: "${label}"`,
  (label: string) => `Was it David or Solomon? "${label}"`,
];

const CATEGORIZE_PROMPTS = [
  "Sort each fact into 'About King David' or 'About King Solomon'.",
  "Group these facts under the correct king, David or Solomon.",
  "Decide whether each fact belongs to King David or King Solomon, and sort it there.",
  "Sort each statement below into the correct king's bucket.",
  "Place each fact into the bucket for the king it describes.",
  "Read each fact and sort it under David or Solomon.",
];

const DAVID = [
  { label: "Started out as a shepherd boy watching his father's sheep", reason: "David began as a humble shepherd before God chose him as king." },
  { label: "Defeated the giant Goliath with a sling and a stone", reason: "David's defeat of Goliath showed his faith and courage." },
  { label: "Was called 'a man after God's own heart'", reason: "This describes David's devotion to God despite his failings." },
  { label: "United the twelve tribes of Israel under one kingdom", reason: "David united Israel and made Jerusalem his capital." },
  { label: "Is honoured in the Bible as an ancestor of Jesus Christ", reason: "The Bible traces Jesus' lineage back through King David." },
];

const SOLOMON = [
  { label: "Asked God for wisdom instead of riches or long life", reason: "Solomon's request for wisdom pleased God, who granted it along with wealth." },
  { label: "Built the Temple of the Lord in Jerusalem", reason: "Solomon fulfilled his father David's dream of building the Temple." },
  { label: "Wisely judged between two women who both claimed one baby", reason: "This famous judgment showed Solomon's God-given wisdom." },
  { label: "Later fell into idolatry through his many foreign wives", reason: "Solomon's foreign wives led him away from wholehearted devotion to God, a failure in his leadership." },
];

export const davidAndSolomon: Skill = {
  id: "cre-bi-david-solomon",
  code: "BI.3",
  subjectId: "cre",
  strandId: "cre-bible",
  grade: 9,
  title: "Kings David and Solomon",
  description: "Sort facts into ones about King David or King Solomon.",
  generate(rng) {
    const hint = "David was known for faith and courage as a warrior-king; his son Solomon was known for wisdom and building the Temple, but later failed by turning to idolatry.";

    if (rng() < 0.5) {
      const pool = [
        ...DAVID.map((s) => ({ ...s, king: "King David" })),
        ...SOLOMON.map((s) => ({ ...s, king: "King Solomon" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["King David", "King Solomon"]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, WHICH_KING_PROMPTS)(target.label),
        choices,
        correctIndex: choices.indexOf(target.king),
        layout: "row",
        hint,
        explanation: target.reason,
      };
    }

    const david = shuffle(rng, DAVID).slice(0, 3);
    const solomon = shuffle(rng, SOLOMON).slice(0, 3);
    const items = shuffle(rng, [
      ...david.map((s) => ({ id: s.label, label: s.label, bucket: "david", reason: s.reason })),
      ...solomon.map((s) => ({ id: s.label, label: s.label, bucket: "solomon", reason: s.reason })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "david", label: "About King David" },
        { id: "solomon", label: "About King Solomon" },
      ],
      correctBucket,
      hint,
      explanation: items.map((item) => item.reason).join(" "),
    };
  },
};
