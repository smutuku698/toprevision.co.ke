import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DESCRIPTIVE_PHRASES: { phrase: string; category: "person" | "place" | "event" }[] = [
  { phrase: "muscles taut with focus, eyes fixed on the finish line", category: "person" },
  { phrase: "beads of sweat trickling down her determined face", category: "person" },
  { phrase: "his chest heaving as he crossed the line first", category: "person" },
  { phrase: "her hands trembling with nervous excitement before the dive", category: "person" },
  { phrase: "the gleaming track stretching under bright floodlights", category: "place" },
  { phrase: "a sea of flags waving in every colour imaginable", category: "place" },
  { phrase: "rows of packed stands rising high into the night sky", category: "place" },
  { phrase: "the roar of eighty thousand fans shaking the stadium", category: "event" },
  { phrase: "the deafening crack of the starting gun", category: "event" },
  { phrase: "the stadium erupting into thunderous applause", category: "event" },
];

const CATEGORY_INFO: { id: "person" | "place" | "event"; label: string; bucketLabel: string; description: string }[] = [
  { id: "person", label: "Describing a person", bucketLabel: "Person", description: "Focus on appearance, expression, movement, and feelings" },
  { id: "place", label: "Describing a place", bucketLabel: "Place", description: "Focus on the sights, sounds, and atmosphere of the setting" },
  { id: "event", label: "Describing an event", bucketLabel: "Event", description: "Focus on the action, sounds, and energy as it happens" },
];

const DETAIL_PAIRS: { plain: string; vivid: string }[] = [
  { plain: "The runner was fast.", vivid: "The runner shot off the blocks like a bullet, legs blurring beneath her." },
  { plain: "The stadium was loud.", vivid: "The stadium thundered with chants and drumbeats that shook the stands." },
  { plain: "The swimmer was tired.", vivid: "The swimmer's arms burned and her lungs screamed for air by the final lap." },
  { plain: "The crowd was excited.", vivid: "The crowd leapt to its feet, screaming and waving flags as the finish line neared." },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "The opening ceremony filled the stadium with a dazzling display of lights, music, and colour, leaving the crowd in complete", after: ".", correctAnswer: "awe", acceptedAnswers: ["awe"] },
  { before: "As the final whistle blew, the exhausted but triumphant runner collapsed onto the track in pure", after: ".", correctAnswer: "relief", acceptedAnswers: ["relief"] },
  { before: "The gymnast's routine ended with the whole arena rising in a", after: "ovation.", correctAnswer: "standing", acceptedAnswers: ["standing"] },
];

export const descriptiveWriting: Skill = {
  id: "g8-eng-w-descriptive-writing",
  code: "W.14",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Creative Writing: Descriptive Writing",
  description: "Identify descriptive words and expressions for people, places, and events at the Olympics, and recognise vivid description.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc-vivid", "match", "fill"] as const);
    const hint = "Descriptive writing uses specific, sensory detail — sights, sounds, and feelings — rather than plain, general statements.";

    if (branch === "categorize") {
      const chosen = shuffle(rng, DESCRIPTIVE_PHRASES).slice(0, 6);
      const items = chosen.map((p, i) => ({ id: `d${i}`, label: p.phrase }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`d${i}`] = p.category));
      const usedCategories = Array.from(new Set(chosen.map((p) => p.category)));
      return {
        kind: "categorize",
        prompt: "Sort each Olympic-themed phrase by whether it describes a Person, Place, or Event.",
        items,
        buckets: CATEGORY_INFO.filter((c) => usedCategories.includes(c.id)).map((c) => ({ id: c.id, label: c.bucketLabel })),
        correctBucket,
        hint,
        explanation: chosen.map((p) => `"${p.phrase}" describes a ${p.category}.`).join(" "),
      };
    }

    if (branch === "mc-vivid") {
      const entry = randChoice(rng, DETAIL_PAIRS);
      const choices = shuffle(rng, [entry.vivid, entry.plain]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence gives a more vivid, specific description?",
        choices,
        correctIndex: choices.indexOf(entry.vivid),
        layout: "list",
        hint,
        explanation: `"${entry.vivid}" is more vivid — it uses specific, sensory detail, rather than the plain statement "${entry.plain}"`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, CATEGORY_INFO.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, CATEGORY_INFO.map((c) => ({ id: c.id, label: c.description })));
      const correctMap: Record<string, string> = {};
      for (const c of CATEGORY_INFO) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: "Match each type of description to what it should focus on.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: CATEGORY_INFO.map((c) => `${c.label}: ${c.description}.`).join(" "),
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the vivid word that best completes this descriptive sentence about the Olympics.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      acceptedAnswers: entry.acceptedAnswers,
      inputMode: "text",
      hint: "Think of a specific word that captures the exact feeling or image being described.",
      explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
    };
  },
};
