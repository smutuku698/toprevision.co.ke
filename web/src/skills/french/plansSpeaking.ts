import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const EXPRESSIONS: { term: string; meaning: string }[] = [
  { term: "Je vais nager", meaning: "I am going to swim" },
  { term: "Je vais jouer au football", meaning: "I am going to play football" },
  { term: "Je vais regarder un film", meaning: "I am going to watch a movie" },
  { term: "Je vais danser", meaning: "I am going to dance" },
  { term: "dans deux jours", meaning: "in two days" },
  { term: "la semaine prochaine", meaning: "next week" },
  { term: "ce soir", meaning: "this evening" },
  { term: "ce week-end", meaning: "this weekend" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each fun activity as Outdoor or Indoor.",
  "Decide whether each activity is outdoor or indoor, then sort it.",
  "Group these activities into Outdoor and Indoor.",
  "Which of these activities happen outdoors and which happen indoors? Sort them.",
  "Place each activity under Outdoor or Indoor.",
  "Sort each fun activity by whether it happens outdoors or indoors.",
];

const MATCH_PROMPTS = [
  "Match each French expression to its English meaning.",
  "Pair each French phrase with its correct English meaning.",
  "Connect each expression to what it means in English.",
  "Match each phrase below to its English translation.",
  "Link each French expression to the meaning that fits it.",
  "Match each expression to its English equivalent.",
];

const SORT_ITEMS: { label: string; bucket: "outdoor" | "indoor" }[] = [
  { label: "nager", bucket: "outdoor" },
  { label: "jouer au football", bucket: "outdoor" },
  { label: "faire du vélo", bucket: "outdoor" },
  { label: "visiter un parc", bucket: "outdoor" },
  { label: "regarder un film", bucket: "indoor" },
  { label: "jouer aux jeux vidéo", bucket: "indoor" },
  { label: "lire un livre", bucket: "indoor" },
  { label: "danser à une fête", bucket: "indoor" },
];

export const plansSpeaking: Skill = {
  id: "fr-ls-plans",
  code: "LS.5",
  subjectId: "french",
  strandId: "fr-listening-speaking",
  grade: 9,
  title: "Making plans and dates for fun activities",
  description: "Match future-plan expressions to their meaning, and sort activities as indoor or outdoor.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const outdoor = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "outdoor")).slice(0, 4);
      const indoor = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "indoor")).slice(0, 4);
      const items = shuffle(rng, [...outdoor, ...indoor]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "outdoor", label: "Outdoor" },
          { id: "indoor", label: "Indoor" },
        ],
        correctBucket,
        hint: "Outdoor activities happen outside, like swimming or football; indoor activities happen inside a building.",
        explanation: `Outdoor: ${outdoor.map((m) => m.label).join(" / ")}. Indoor: ${indoor.map((m) => m.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, EXPRESSIONS).slice(0, 4);
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
      hint: "'Je vais + infinitive' (le futur proche) expresses a near-future plan, like English 'I am going to...'.",
      explanation: chosen.map((t) => `"${t.term}" means "${t.meaning}".`).join(" "),
    };
  },
};
