import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Ranger Achieng had patrolled the Mara conservancy for twenty years, and she still remembered her own first week, terrified of every rustle in the grass. Now it was her turn to train a new recruit, her nephew Otieno, who had joined straight after college. On their first patrol together, Otieno froze when a herd of elephants crossed their path, and Achieng calmly guided him to stand still until they passed. \"Fear keeps you alert, not paralysed,\" she told him, echoing words her own trainer once used on her. Weeks later, the two discovered a snare set illegally near a watering hole. Otieno wanted to remove it immediately, but Achieng insisted they first radio the community liaison officer, Mzee Sironka, who had spent decades building trust with nearby herders. Sironka arrived within the hour and used his relationship with the local families to identify the poacher peacefully, avoiding a conflict that could have turned violent. By the season's end, Otieno had grown from a nervous recruit into a confident ranger, and he often told visitors that his aunt had taught him nearly everything he knew about the bush.";

const CHARACTERS: { name: string; description: string }[] = [
  { name: "Ranger Achieng", description: "The experienced ranger of twenty years who trains her nephew Otieno" },
  { name: "Otieno", description: "The new recruit, Achieng's nephew, who joined the conservancy straight after college" },
  { name: "Mzee Sironka", description: "The community liaison officer who has spent decades building trust with local herders" },
];

const RELATIONSHIP_PAIRS: { pairLabel: string; relationship: string }[] = [
  { pairLabel: "Achieng and Otieno", relationship: "Mentor and mentee (also aunt and nephew)" },
  { pairLabel: "Achieng and Sironka", relationship: "Colleagues who trust and rely on each other's expertise" },
  { pairLabel: "Sironka and the local herders", relationship: "A community relationship built on decades of trust" },
];

const FILL_ITEMS = [
  { before: "\"Fear keeps you alert, not", after: ",\" she told him, echoing words her own trainer once used on her.", correctAnswer: "paralysed" },
  { before: "Weeks later, the two discovered a snare set illegally near a", after: ".", correctAnswer: "watering hole" },
  { before: "By the season's end, Otieno had grown from a nervous recruit into a confident", after: ".", correctAnswer: "ranger" },
];

const IDENTIFY_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Who is training the new recruit in this story?",
    correct: "Ranger Achieng",
    distractors: ["Mzee Sironka", "Otieno", "A visitor to the conservancy"],
    explanation: "The passage says 'Now it was her turn to train a new recruit, her nephew Otieno,' referring to Achieng.",
  },
  {
    q: "Who is the community liaison officer that helped resolve the poaching situation peacefully?",
    correct: "Mzee Sironka",
    distractors: ["Ranger Achieng", "Otieno", "The poacher himself"],
    explanation: "The passage identifies 'the community liaison officer, Mzee Sironka, who had spent decades building trust with nearby herders.'",
  },
];

const RELATIONSHIP_INFERENCE: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why did Achieng insist on calling Sironka instead of letting Otieno remove the snare immediately?",
    correct: "She trusted Sironka's long relationship with the community to resolve the matter peacefully, avoiding conflict",
    distractors: ["She did not think the snare was a real problem", "She wanted to avoid doing any work herself", "She disliked Otieno's idea for no particular reason"],
    explanation: "The story shows Sironka using 'his relationship with the local families to identify the poacher peacefully, avoiding a conflict that could have turned violent' — Achieng's choice reflects her respect for that relationship, even though her reasoning isn't stated outright at the moment she calls him.",
  },
  {
    q: "What does Otieno's comment at the end, that his aunt 'taught him nearly everything he knew about the bush,' reveal about their relationship?",
    correct: "Their mentor-mentee bond was central to his growth as a ranger, beyond just being family",
    distractors: ["Otieno resented his aunt for teaching him", "Their relationship had no effect on his skills", "Otieno preferred learning from Sironka instead"],
    explanation: "Otieno crediting Achieng specifically for his growth as a ranger shows the mentorship, not just the family tie, shaped who he became — an inference drawn from what he chooses to say about her.",
  },
];

export const shortStoryCharactersRelationships: Skill = {
  id: "g8-eng-r-short-story-characters-relationships",
  code: "R.14",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Short Story - Characters and Relationships (Class Reader)",
  description: "Identify the characters in a short story, explain the relationships between them, and appreciate how those relationships reflect real-life experiences.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "identify", "categorize", "inference", "fill"] as const);
    const hint = "Look at how characters treat and rely on one another to understand the type of relationship between them.";

    if (branch === "match") {
      const tokens = shuffle(rng, RELATIONSHIP_PAIRS.map((p, i) => ({ id: `p${i}`, label: p.pairLabel })));
      const targets = shuffle(rng, RELATIONSHIP_PAIRS.map((p, i) => ({ id: `p${i}`, label: p.relationship })));
      const correctMap: Record<string, string> = {};
      RELATIONSHIP_PAIRS.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: "Match each pair of characters to the relationship between them.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint,
        explanation: RELATIONSHIP_PAIRS.map((p) => `${p.pairLabel} — ${p.relationship.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "identify") {
      const entry = randChoice(rng, IDENTIFY_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "row",
        hint: "Reread the passage to find who is described performing this role.",
        explanation: entry.explanation,
      };
    }

    if (branch === "categorize") {
      const items = shuffle(rng, CHARACTERS.map((c) => ({ id: c.name, label: c.name })));
      const buckets = [
        { id: "achieng-family", label: "Related to Achieng by family" },
        { id: "colleague", label: "A professional colleague, not family" },
      ];
      const correctBucket: Record<string, string> = {
        "Ranger Achieng": "achieng-family",
        Otieno: "achieng-family",
        "Mzee Sironka": "colleague",
      };
      return {
        kind: "categorize",
        prompt: "Sort each character by whether they are related to Achieng by family, or a professional colleague.",
        passage: STORY,
        items,
        buckets,
        correctBucket,
        hint: "The story states Otieno is Achieng's nephew, while Sironka is described only in his role as a liaison officer.",
        explanation: "Ranger Achieng and her nephew Otieno are related by family. Mzee Sironka is a professional colleague — the community liaison officer, not a relative.",
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word(s) from the story.",
        passage: STORY,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look for the exact words in the passage above.",
        explanation: `The passage reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, RELATIONSHIP_INFERENCE);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      passage: STORY,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: entry.explanation,
    };
  },
};
