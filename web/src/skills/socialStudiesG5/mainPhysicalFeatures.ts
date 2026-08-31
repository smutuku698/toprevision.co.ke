import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, name, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Main Physical Features in Kenya" — the two named
// categories are Relief and Drainage. Named features are standard, well-known Kenyan geography consistent
// with this scope. No map widget exists, so branches are text/fact-based, never "click the map".

type Category = "relief" | "drainage";

interface Feature {
  id: string;
  label: string;
  category: Category;
  fact: string;
}

const FEATURES: readonly Feature[] = [
  { id: "mt-kenya", label: "Mount Kenya", category: "relief", fact: "Mount Kenya is Kenya's highest mountain" },
  { id: "rift-valley", label: "The Great Rift Valley", category: "relief", fact: "The Great Rift Valley is a huge valley that runs through Kenya from north to south" },
  { id: "aberdares", label: "The Aberdare Ranges", category: "relief", fact: "The Aberdare Ranges are a mountain range in central Kenya" },
  { id: "coastal-lowlands", label: "The coastal lowlands", category: "relief", fact: "The coastal lowlands are the flat, low-lying land along Kenya's Indian Ocean coast" },
  { id: "highlands", label: "The Kenyan highlands", category: "relief", fact: "The Kenyan highlands are the cool, high-altitude areas including much of central Kenya" },
  { id: "lake-victoria", label: "Lake Victoria", category: "drainage", fact: "Lake Victoria is a large freshwater lake on Kenya's western border" },
  { id: "lake-turkana", label: "Lake Turkana", category: "drainage", fact: "Lake Turkana is a large lake in northern Kenya" },
  { id: "lake-naivasha", label: "Lake Naivasha", category: "drainage", fact: "Lake Naivasha is a freshwater lake in the Rift Valley" },
  { id: "river-tana", label: "River Tana", category: "drainage", fact: "River Tana is Kenya's longest river" },
  { id: "river-athi", label: "River Athi/Galana", category: "drainage", fact: "River Athi (also called Galana further downstream) flows through south-eastern Kenya" },
] as const;

const RELIEF = FEATURES.filter((f) => f.category === "relief");
const DRAINAGE = FEATURES.filter((f) => f.category === "drainage");

const ALPHABETICAL_LABELS = [...FEATURES].map((f) => f.label).sort((a, b) => a.localeCompare(b));

export const mainPhysicalFeatures: Skill = {
  id: "g5-ss-env-main-physical-features",
  code: "E.3",
  subjectId: "social-studies",
  strandId: "g5-ss-environments",
  grade: 5,
  title: "Main Physical Features in Kenya",
  description: "Identifying Kenya's main relief and drainage features and telling the two categories apart.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const f = randChoice(rng, FEATURES);
      const choices = shuffle(rng, ["Relief feature", "Drainage feature"]);
      return {
        kind: "multiple-choice",
        prompt: identifyPrompt(rng, `type of physical feature that ${f.label} is`),
        choices,
        correctIndex: choices.indexOf(f.category === "relief" ? "Relief feature" : "Drainage feature"),
        hint: "Relief features are landforms like mountains and valleys; drainage features are water bodies like lakes and rivers.",
        explanation: `${f.fact}, which makes it a ${f.category} feature.`,
      };
    }

    if (branch === "click-match") {
      const reliefPick = shuffle(rng, [...RELIEF]).slice(0, 3);
      const drainagePick = shuffle(rng, [...DRAINAGE]).slice(0, 3);
      const chosen = shuffle(rng, [...reliefPick, ...drainagePick]);
      const tokens = chosen.map((f) => ({ id: f.id, label: f.label }));
      const targets = shuffle(rng, chosen).map((f) => ({ id: f.id, label: f.fact.charAt(0).toUpperCase() + f.fact.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "physical feature to a fact about it"),
        tokens,
        targets,
        correctMap,
        hint: "Look for the feature's name mentioned in the fact.",
        explanation: chosen.map((f) => `${f.label}: ${f.fact}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const reliefPick = shuffle(rng, [...RELIEF]).slice(0, 3);
      const drainagePick = shuffle(rng, [...DRAINAGE]).slice(0, 3);
      const chosen = shuffle(rng, [...reliefPick, ...drainagePick]);
      const items = chosen.map((f) => ({ id: f.id, label: f.label }));
      const buckets = [
        { id: "relief", label: "Relief" },
        { id: "drainage", label: "Drainage" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f) => (correctBucket[f.id] = f.category));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is a relief feature or a drainage feature"),
        items,
        buckets,
        correctBucket,
        hint: "Relief features are landforms; drainage features are lakes and rivers.",
        explanation: chosen.map((f) => `${f.label} is a ${f.category} feature.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const n = name(rng);
      const templates = [
        () => ({ before: "Kenya's highest mountain is", after: ".", correct: "Mount Kenya" }),
        () => ({ before: "Kenya's longest river is", after: ".", correct: "River Tana" }),
        () => ({ before: "The huge valley that runs through Kenya from north to south is called the Great Rift", after: ".", correct: "Valley" }),
        () => ({ before: "A large freshwater lake on Kenya's western border is Lake", after: ".", correct: "Victoria" }),
        () => ({ before: "Landforms such as mountains and valleys are called", after: "features.", correct: "relief" }),
        () => ({ before: "Water bodies such as lakes and rivers are called", after: "features.", correct: "drainage" }),
        () => ({ before: `${n} learns that mountains, valleys and highlands are all examples of`, after: "features.", correct: "relief" }),
        () => ({ before: `${n} learns that lakes and rivers are all examples of`, after: "features.", correct: "drainage" }),
        () => ({ before: "A large lake found in northern Kenya is Lake", after: ".", correct: "Turkana" }),
        () => ({ before: "The mountain range found in central Kenya is called the Aberdare", after: ".", correct: "Ranges" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall Kenya's named relief and drainage features.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    // ordering — alphabetical by feature name (no dependable length/height ranking beyond River Tana).
    const items = shuffle(rng, ALPHABETICAL_LABELS).map((l) => ({ id: l, label: l }));
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these physical features of Kenya, alphabetically"),
      items,
      correctOrder: [...ALPHABETICAL_LABELS],
      instruction: "A first, Z last.",
      hint: "Compare the first letters of each feature's name.",
      explanation: `In alphabetical order: ${ALPHABETICAL_LABELS.join(", ")}.`,
    };
  },
};
