import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FEATURES: { id: string; label: string; description: string }[] = [
  { id: "focus", label: "Clear focus/title", description: "A specific title and topic that the whole story sticks to" },
  { id: "introduction", label: "Strong introduction", description: "An opening that grabs the reader's interest right away" },
  { id: "character", label: "Character description", description: "Details about how a character looks, acts, or feels" },
  { id: "dialogue", label: "Dialogue", description: "The exact words characters say to each other, in quotation marks" },
  { id: "setting", label: "Setting description", description: "Details about where and when the story takes place" },
  { id: "details", label: "Interesting details", description: "Specific, vivid facts that bring the story to life" },
  { id: "sequence", label: "Logical sequence", description: "Events told in a clear, sensible order" },
  { id: "wordchoice", label: "Precise word choice", description: "Exact, well-chosen words instead of vague, general ones" },
  { id: "sentence-variety", label: "Varied sentence structure", description: "A mix of short and long sentences to keep the story interesting" },
  { id: "conclusion", label: "Strong conclusion", description: "An ending that wraps up the story satisfyingly" },
];

const CATEGORY_EXAMPLES: { text: string; category: "dialogue" | "setting" | "character" }[] = [
  { text: '"We must never give up the fight for our land," Dedan Kimathi said firmly to his fighters.', category: "dialogue" },
  { text: '"Uhuru is close, my brothers," whispered the freedom fighter as he checked his rifle.', category: "dialogue" },
  { text: '"Plant a tree today for tomorrow\'s children," Wangari Maathai told the crowd.', category: "dialogue" },
  { text: "Deep in the Aberdare forest, mist clung to the trees where the freedom fighters had built their hidden camp.", category: "setting" },
  { text: "The cold, damp caves of Mount Kenya sheltered the fighters through the long rainy season.", category: "setting" },
  { text: "Dust rose from the dry, cracked earth where the tree-planting ceremony was about to begin.", category: "setting" },
  { text: "Wangari Maathai had sharp, determined eyes and calloused hands from years of planting trees herself.", category: "character" },
  { text: "Tall and broad-shouldered, Dedan Kimathi walked with the confident stride of a born leader.", category: "character" },
  { text: "Her voice trembled with quiet courage, even as the soldiers surrounded the camp.", category: "character" },
];

const WEAK_EXAMPLES: { excerpt: string; missingFeature: string }[] = [
  {
    excerpt: "The soldiers surrounded the hideout. Kimathi and his fighters discussed their next move for a long time before deciding to retreat quietly into the forest.",
    missingFeature: "dialogue",
  },
  {
    excerpt: '"We will resist until Kenya is free," Kimathi said. His fighters nodded and prepared their weapons.',
    missingFeature: "setting",
  },
  {
    excerpt: 'Wangari Maathai stood before the crowd and said, "Plant a tree today for tomorrow\'s children." Everyone cheered.',
    missingFeature: "character",
  },
  {
    excerpt: "Kenya finally became independent. That is the story.",
    missingFeature: "conclusion",
  },
];

const STRUCTURE: { id: string; label: string }[] = [
  { id: "title", label: "Title — a clear, specific title naming the hero and story" },
  { id: "introduction", label: "Introduction — hooks the reader and introduces the hero and setting" },
  { id: "events", label: "Main events — the hero's actions, dialogue, and challenges, told in logical sequence" },
  { id: "conclusion", label: "Conclusion — wraps up the story and its significance" },
];

export const narrativeCompositions: Skill = {
  id: "g7-eng-w-narrative-compositions",
  code: "W.9",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Creative Writing: Narrative Compositions",
  description: "Identify the features of a well-written narrative composition about heroes and heroines of Kenya, and recognise dialogue, setting, and character description.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "mc-missing", "order"] as const);
    const hint = "A well-written narrative composition has a clear focus, a strong introduction and conclusion, vivid character and setting description, dialogue, interesting details, precise words, varied sentences, and a logical sequence of events.";

    if (branch === "match") {
      const chosen = shuffle(rng, FEATURES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.id, label: f.description })));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: "Match each feature of a narrative composition to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((f) => `${f.label}: ${f.description}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const dialogue = shuffle(rng, CATEGORY_EXAMPLES.filter((c) => c.category === "dialogue")).slice(0, 2);
      const setting = shuffle(rng, CATEGORY_EXAMPLES.filter((c) => c.category === "setting")).slice(0, 2);
      const character = shuffle(rng, CATEGORY_EXAMPLES.filter((c) => c.category === "character")).slice(0, 2);
      const chosen = shuffle(rng, [...dialogue, ...setting, ...character]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each sentence about a Kenyan hero or heroine by which narrative feature it demonstrates.",
        items,
        buckets: [
          { id: "dialogue", label: "Dialogue" },
          { id: "setting", label: "Setting description" },
          { id: "character", label: "Character description" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is an example of ${c.category === "dialogue" ? "dialogue" : c.category === "setting" ? "setting description" : "character description"}.`).join(" "),
      };
    }

    if (branch === "mc-missing") {
      const entry = randChoice(rng, WEAK_EXAMPLES);
      const featureLabel = FEATURES.find((f) => f.id === entry.missingFeature)!.label;
      const otherFeatures = shuffle(rng, FEATURES.filter((f) => f.id !== entry.missingFeature && ["dialogue", "setting", "character", "conclusion"].includes(f.id)).map((f) => f.label)).slice(0, 3);
      const choices = shuffle(rng, [featureLabel, ...otherFeatures]);
      return {
        kind: "multiple-choice",
        prompt: `Read this excerpt about a Kenyan hero or heroine: "${entry.excerpt}" Which feature of a well-written narrative composition is missing?`,
        choices,
        correctIndex: choices.indexOf(featureLabel),
        layout: "list",
        hint,
        explanation: `This excerpt is missing ${featureLabel.toLowerCase()} — ${FEATURES.find((f) => f.id === entry.missingFeature)!.description.toLowerCase()}.`,
      };
    }

    return {
      kind: "ordering",
      prompt: "Arrange these structural elements of a narrative composition about a Kenyan hero or heroine in the order they should appear.",
      instruction: "Click the elements in order, from first to last.",
      items: shuffle(rng, STRUCTURE.map((s) => ({ id: s.id, label: s.label }))),
      correctOrder: STRUCTURE.map((s) => s.id),
      hint,
      explanation: STRUCTURE.map((s) => s.label).join(" → "),
    };
  },
};
