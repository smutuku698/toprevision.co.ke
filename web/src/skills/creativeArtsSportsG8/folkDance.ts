import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DANCES = [
  { label: "Isukuti", community: "Luhya", detail: "known for vigorous hip and shoulder movement performed to drumming" },
  { label: "Mwomboko", community: "Kikuyu", detail: "traditionally danced by mature adult couples, men and women together" },
  { label: "Ohangla", community: "Luo", detail: "performed with drums and accordion at social gatherings" },
  { label: "Chakacha", community: "Mijikenda (Coastal)", detail: "performed at weddings and celebrations along the Kenyan coast" },
  { label: "Kilumi", community: "Kamba", detail: "performed mainly by women during healing and rain-making ceremonies" },
] as const;

const CLASSIFICATION_FACTS = [
  { label: "Isukuti originates from the Luhya community", bucket: "community" },
  { label: "Mwomboko originates from the Kikuyu community", bucket: "community" },
  { label: "Isukuti is performed by both men and women of many ages", bucket: "gender-age" },
  { label: "Mwomboko is traditionally danced by mature adult couples", bucket: "gender-age" },
  { label: "Kilumi is performed mainly by women", bucket: "gender-age" },
  { label: "Chakacha is performed at weddings and celebrations along the coast", bucket: "occasion" },
  { label: "Kilumi is performed during healing and rain-making ceremonies", bucket: "occasion" },
] as const;

const BUCKET_LABEL: Record<string, string> = { community: "Classified by community", "gender-age": "Classified by gender and age", occasion: "Classified by occasion" };

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "What are the three main criteria used to classify Kenyan folk dances?", correct: "Community, gender and age of participants, and occasion", distractors: ["Only the colour of the costume worn", "Only the number of dancers involved", "Only the length of the performance"] },
  { q: "How do folk dances represent Kenyan culture?", correct: "Each dance carries the traditions, history, and identity of the community it comes from", distractors: ["Folk dances have no connection to any specific community", "They are identical across every Kenyan community", "They were all created within the last decade"] },
  { q: "Why might a folk dance be classified by 'occasion'?", correct: "Because some dances are performed only during specific events, such as weddings or ceremonies", distractors: ["Because occasion has no effect on which dance is performed", "Because every folk dance is performed at every occasion", "Because occasion only affects the music, never the dance"] },
  { q: "What makes a folk dance performance considered 'good' in its cultural context?", correct: "Authenticity to the community's traditional movements, rhythm, and costume, performed with energy and respect", distractors: ["Performing any dance moves, regardless of the community they come from", "Speed alone, regardless of accuracy to tradition", "Avoiding any music or drumming"] },
];

const CLASSIFY_PROMPTS = [
  "Sort each fact by which classification criterion it describes.",
  "Which classification criterion does each fact below describe? Sort them.",
  "Classify each fact by the criterion it fits.",
  "Decide which criterion each fact fits, and sort it.",
  "Sort these facts by the classification criterion they describe.",
] as const;

const COMMUNITY_MATCH_PROMPTS = [
  "Match each Kenyan folk dance to the community it originates from.",
  "Pair each dance below with its community of origin.",
  "Match each dance to the community it comes from.",
  "Connect each folk dance to its originating community.",
  "For each dance below, choose its matching community.",
] as const;

const NAME_PROMPTS = [
  "Name the Kenyan folk dance being described.",
  "Identify the Kenyan folk dance from this description.",
  "Which Kenyan folk dance does this describe?",
  "Read the description and name the folk dance.",
  "What is this Kenyan folk dance called?",
] as const;

export const folkDance: Skill = {
  id: "g8-cas-folk-dance",
  code: "C.10",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Kenyan Folk Dance",
  description: "Classifying Kenyan folk dances by community, gender and age of participants, and occasion.",
  generate(rng) {
    const branch = randChoice(rng, ["classify-facts", "community-match", "name-fill-blank", "theory-mc"] as const);

    if (branch === "classify-facts") {
      const communityPicks = shuffle(rng, CLASSIFICATION_FACTS.filter((f) => f.bucket === "community")).slice(0, 2);
      const genderAgePicks = shuffle(rng, CLASSIFICATION_FACTS.filter((f) => f.bucket === "gender-age")).slice(0, 2);
      const occasionPicks = shuffle(rng, CLASSIFICATION_FACTS.filter((f) => f.bucket === "occasion")).slice(0, 2);
      const items = shuffle(rng, [...communityPicks, ...genderAgePicks, ...occasionPicks]);
      const correctBucket: Record<string, string> = {};
      for (const f of items) correctBucket[f.label] = f.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CLASSIFY_PROMPTS),
        items: items.map((f) => ({ id: f.label, label: f.label })),
        buckets: [
          { id: "community", label: BUCKET_LABEL.community },
          { id: "gender-age", label: BUCKET_LABEL["gender-age"] },
          { id: "occasion", label: BUCKET_LABEL.occasion },
        ],
        correctBucket,
        hint: "Community facts name where a dance is from; gender/age facts describe who dances it; occasion facts describe when.",
        explanation: items.map((f) => `"${f.label}" is ${BUCKET_LABEL[f.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "community-match") {
      const tokens = shuffle(rng, DANCES.map((d) => ({ id: d.label, label: d.label })));
      const targets = shuffle(rng, DANCES.map((d) => ({ id: d.label, label: d.community })));
      const correctMap: Record<string, string> = {};
      for (const d of DANCES) correctMap[d.label] = d.label;
      return {
        kind: "click-match",
        prompt: randChoice(rng, COMMUNITY_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Each of these dances is closely associated with one particular Kenyan community.",
        explanation: DANCES.map((d) => `${d.label} originates from the ${d.community} community.`).join(" "),
      };
    }

    if (branch === "name-fill-blank") {
      const d = randChoice(rng, DANCES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, NAME_PROMPTS),
        before: "The ___ dance",
        after: `is ${d.detail}, from the ${d.community} community.`,
        correctAnswer: d.label,
        inputMode: "text",
        hint: "Match the description and community of origin to the dance's name.",
        explanation: `${d.label} is from the ${d.community} community, ${d.detail}.`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Folk dances are classified by community, by gender and age of participants, and by occasion.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
